import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  create(createInvoiceDto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: {
        studentId: createInvoiceDto.studentId,
        academicYearId: createInvoiceDto.academicYearId,
        amount: createInvoiceDto.amount,
        description: createInvoiceDto.description,
        dueDate: new Date(createInvoiceDto.dueDate),
        status: createInvoiceDto.status || 'PENDING',
      },
    });
  }

  findAll() {
    return this.prisma.invoice.findMany({
      include: {
        student: true,
        academicYear: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        student: true,
        academicYear: true,
        payments: true,
      }
    });
  }
  
  findByStudent(studentId: number) {
    return this.prisma.invoice.findMany({
      where: { studentId },
      include: {
        academicYear: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    return this.prisma.invoice.update({
      where: { id },
      data: updateInvoiceDto,
    });
  }

  remove(id: number) {
    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}
