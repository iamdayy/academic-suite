import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'shared-types';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

export class JwtAuthGuard extends AuthGuard('jwt') {}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Roles(Role.ADMIN, Role.FINANCE)
  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Roles(Role.ADMIN, Role.FINANCE)
  @Get()
  findAll() {
    return this.invoicesService.findAll();
  }

  @Roles(Role.STUDENT, Role.ADMIN, Role.FINANCE)
  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.invoicesService.findByStudent(+studentId);
  }

  @Roles(Role.ADMIN, Role.FINANCE, Role.STUDENT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(+id);
  }

  @Roles(Role.ADMIN, Role.FINANCE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(+id, updateInvoiceDto);
  }

  @Roles(Role.ADMIN, Role.FINANCE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(+id);
  }
}
