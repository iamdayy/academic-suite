import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from 'shared-types';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) { }

  // ============================
  // SETTINGS
  // ============================
  async getSettings() {
    return this.prisma.systemSetting.findMany();
  }

  async updateSetting(key: string, value: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  async getDailyFineAmount(): Promise<number> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'LIBRARY_DAILY_FINE' }
    });
    return setting ? parseInt(setting.value, 10) : 1000; // Default 1000
  }

  // ============================
  // CATEGORIES
  // ============================
  async getCategories() {
    return this.prisma.bookCategory.findMany();
  }

  async createCategory(name: string) {
    return this.prisma.bookCategory.create({ data: { name } });
  }

  // ============================
  // BOOKS
  // ============================
  async getBooks() {
    return this.prisma.book.findMany({
      include: { category: true },
      orderBy: { title: 'asc' }
    });
  }

  async createBook(dto: any) {
    return this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        isbn: dto.isbn,
        publisher: dto.publisher,
        publishYear: dto.publishYear ? parseInt(dto.publishYear, 10) : null,
        copiesTotal: dto.copiesTotal ? parseInt(dto.copiesTotal, 10) : 1,
        copiesAvailable: dto.copiesTotal ? parseInt(dto.copiesTotal, 10) : 1,
        categoryId: parseInt(dto.categoryId, 10)
      }
    });
  }

  // ============================
  // BORROWINGS
  // ============================
  async borrowBook(bookId: number, user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');

    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Buku tidak ditemukan');

    if (book.copiesAvailable <= 0) {
      throw new BadRequestException('Buku sedang tidak tersedia (habis dipinjam)');
    }

    // Cek kalau student sudah pinjam buku ini dan belum dikembalikan
    const existingBorrow = await this.prisma.bookBorrowing.findFirst({
      where: {
        studentId: user.student.id,
        bookId,
        status: 'BORROWED'
      }
    });

    if (existingBorrow) {
      throw new BadRequestException('Anda sedang meminjam buku ini');
    }

    // Default borrow duration: 7 days
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    return this.prisma.$transaction(async (tx) => {
      await tx.book.update({
        where: { id: bookId },
        data: { copiesAvailable: { decrement: 1 } }
      });

      return tx.bookBorrowing.create({
        data: {
          studentId: user.student.id as bigint,
          bookId,
          borrowDate,
          dueDate,
          status: 'BORROWED'
        }
      });
    });
  }

  async getMyBorrowings(user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');
    return this.prisma.bookBorrowing.findMany({
      where: { studentId: user.student.id },
      include: { book: true },
      orderBy: { borrowDate: 'desc' }
    });
  }

  async getAllBorrowings() {
    return this.prisma.bookBorrowing.findMany({
      include: {
        book: true,
        student: {
          include: { studyProgram: true }
        }
      },
      orderBy: { borrowDate: 'desc' }
    });
  }

  async returnBook(borrowingId: number) {
    const borrowing = await this.prisma.bookBorrowing.findUnique({ where: { id: borrowingId } });
    if (!borrowing) throw new NotFoundException('Peminjaman tidak ditemukan');
    
    if (borrowing.status === 'RETURNED') {
      throw new BadRequestException('Buku ini sudah dikembalikan sebelumnya');
    }

    const returnDate = new Date();
    let fineAmount = 0;

    // Hitung denda jika terlambat
    if (returnDate > borrowing.dueDate) {
      const diffTime = Math.abs(returnDate.getTime() - borrowing.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      const dailyFine = await this.getDailyFineAmount();
      fineAmount = diffDays * dailyFine;
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.book.update({
        where: { id: borrowing.bookId },
        data: { copiesAvailable: { increment: 1 } }
      });

      return tx.bookBorrowing.update({
        where: { id: borrowingId },
        data: {
          status: 'RETURNED',
          returnDate,
          fineAmount
        }
      });
    });
  }
}
