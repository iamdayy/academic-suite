import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { CreateFacilityBookingDto } from './dto/create-facility-booking.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'shared-types';
import { GetUser } from '../auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'shared-types';

export class JwtAuthGuard extends AuthGuard('jwt') { }

@Controller('facilities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  findAll() {
    return this.facilitiesService.findAllFacilities();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDto: CreateFacilityDto) {
    return this.facilitiesService.createFacility(createDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateFacilityDto>) {
    return this.facilitiesService.updateFacility(+id, updateDto);
  }

  @Get('bookings/me')
  findMyBookings(@GetUser() user: AuthenticatedUser) {
    return this.facilitiesService.findMyBookings(user.id);
  }

  @Get('bookings')
  @Roles(Role.ADMIN)
  findAllBookings() {
    return this.facilitiesService.findAllBookings();
  }

  @Post('bookings')
  createBooking(@GetUser() user: AuthenticatedUser, @Body() dto: CreateFacilityBookingDto) {
    return this.facilitiesService.createBooking(user.id, dto);
  }

  @Patch('bookings/:id/status')
  @Roles(Role.ADMIN)
  updateBookingStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes?: string,
  ) {
    return this.facilitiesService.updateBookingStatus(+id, status, notes);
  }
}
