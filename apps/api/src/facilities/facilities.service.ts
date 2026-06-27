import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { CreateFacilityBookingDto } from './dto/create-facility-booking.dto';

@Injectable()
export class FacilitiesService {
  constructor(private prisma: PrismaService) {}

  // --- Facilities Management ---
  createFacility(createDto: CreateFacilityDto) {
    return this.prisma.facility.create({ data: createDto });
  }

  findAllFacilities() {
    return this.prisma.facility.findMany({
      orderBy: { name: 'asc' }
    });
  }

  updateFacility(id: number, data: Partial<CreateFacilityDto>) {
    return this.prisma.facility.update({
      where: { id },
      data
    });
  }

  // --- Bookings ---
  async createBooking(userId: bigint, dto: CreateFacilityBookingDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) {
      throw new BadRequestException("Waktu mulai harus sebelum waktu selesai.");
    }

    // 1. Check existing Approved Bookings
    const overlappingBookings = await this.prisma.facilityBooking.findMany({
      where: {
        facilityId: dto.facilityId,
        status: 'APPROVED',
        OR: [
          { startTime: { lt: end }, endTime: { gt: start } }
        ]
      }
    });

    if (overlappingBookings.length > 0) {
      throw new BadRequestException("Fasilitas sudah dipinjam pada waktu tersebut.");
    }

    // 2. Check Class Schedules
    const dayMap = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
    const dayName = dayMap[start.getDay()];

    const classSchedules = await this.prisma.classSchedule.findMany({
      where: {
        facilityId: dto.facilityId,
        dayOfWeek: dayName,
      }
    });

    // Parse requested HH:mm
    const reqStartMin = start.getHours() * 60 + start.getMinutes();
    const reqEndMin = end.getHours() * 60 + end.getMinutes();

    for (const schedule of classSchedules) {
      const [sH, sM] = schedule.startTime.split(':').map(Number);
      const [eH, eM] = schedule.endTime.split(':').map(Number);
      const schedStartMin = sH * 60 + sM;
      const schedEndMin = eH * 60 + eM;

      // Overlap condition: reqStart < schedEnd && reqEnd > schedStart
      if (reqStartMin < schedEndMin && reqEndMin > schedStartMin) {
        throw new BadRequestException(`Fasilitas digunakan untuk perkuliahan pada waktu tersebut (${schedule.startTime} - ${schedule.endTime}).`);
      }
    }

    // 3. Check Thesis Defenses
    const overlappingDefenses = await this.prisma.thesisDefense.findMany({
      where: {
        facilityId: dto.facilityId,
        status: 'SCHEDULED',
        // Assuming a defense takes 2 hours since we only have scheduledAt
        scheduledAt: {
          lt: end,
          gt: new Date(start.getTime() - 2 * 60 * 60 * 1000)
        }
      }
    });

    if (overlappingDefenses.length > 0) {
      throw new BadRequestException("Fasilitas digunakan untuk sidang skripsi pada waktu tersebut.");
    }

    return this.prisma.facilityBooking.create({
      data: {
        ...dto,
        userId,
      }
    });
  }

  findMyBookings(userId: bigint) {
    return this.prisma.facilityBooking.findMany({
      where: { userId },
      include: { facility: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  findAllBookings() {
    return this.prisma.facilityBooking.findMany({
      include: { facility: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateBookingStatus(id: number, status: string, notes?: string) {
    // Re-verify if approving
    if (status === 'APPROVED') {
      const booking = await this.prisma.facilityBooking.findUnique({ where: { id } });
      if (!booking) throw new NotFoundException('Booking not found');

      // Check overlapping bookings again to be safe
      const overlappingBookings = await this.prisma.facilityBooking.findMany({
        where: {
          facilityId: booking.facilityId,
          status: 'APPROVED',
          id: { not: id },
          OR: [
            { startTime: { lt: booking.endTime }, endTime: { gt: booking.startTime } }
          ]
        }
      });
      if (overlappingBookings.length > 0) {
        throw new BadRequestException("Fasilitas sudah dipinjam pada waktu tersebut oleh pengguna lain.");
      }
    }

    return this.prisma.facilityBooking.update({
      where: { id },
      data: { status, notes }
    });
  }
}
