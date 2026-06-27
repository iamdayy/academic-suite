import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  create(createPaymentDto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        invoiceId: createPaymentDto.invoiceId,
        amount: createPaymentDto.amount,
        paymentMethod: createPaymentDto.paymentMethod,
        reference: createPaymentDto.reference,
        status: 'PENDING',
      },
    });
  }

  findAll() {
    return this.prisma.payment.findMany({
      include: {
        invoice: {
          include: { student: true, academicYear: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: true
      }
    });
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
    });
  }
  
  async verify(id: number) {
    const payment = await this.prisma.payment.update({
      where: { id },
      data: { status: 'VERIFIED' },
      include: { invoice: { include: { payments: true } } }
    });
    
    // Check if the invoice is fully paid
    const totalPaid = payment.invoice.payments
      .filter(p => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);
      
    if (totalPaid >= payment.invoice.amount) {
      await this.prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'PAID' }
      });
    } else {
      await this.prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'PARTIAL' }
      });
    }
    
    return payment;
  }

  remove(id: number) {
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
