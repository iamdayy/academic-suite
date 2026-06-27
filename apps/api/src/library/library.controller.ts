import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { LibraryService } from './library.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'shared-types';
import { GetUser } from '../auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'shared-types';

export class JwtAuthGuard extends AuthGuard('jwt') { }

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) { }

  // Settings
  @Roles(Role.ADMIN)
  @Get('settings')
  getSettings() {
    return this.libraryService.getSettings();
  }

  @Roles(Role.ADMIN)
  @Patch('settings')
  updateSetting(@Body() body: { key: string; value: string }) {
    return this.libraryService.updateSetting(body.key, body.value);
  }

  // Categories
  @Roles(Role.ADMIN, Role.STUDENT)
  @Get('categories')
  getCategories() {
    return this.libraryService.getCategories();
  }

  @Roles(Role.ADMIN)
  @Post('categories')
  createCategory(@Body('name') name: string) {
    return this.libraryService.createCategory(name);
  }

  // Books
  @Roles(Role.ADMIN, Role.STUDENT)
  @Get('books')
  getBooks() {
    return this.libraryService.getBooks();
  }

  @Roles(Role.ADMIN)
  @Post('books')
  createBook(@Body() dto: any) {
    return this.libraryService.createBook(dto);
  }

  // Borrowings
  @Roles(Role.STUDENT)
  @Post('borrowings')
  borrowBook(@Body('bookId') bookId: number, @GetUser() user: AuthenticatedUser) {
    return this.libraryService.borrowBook(+bookId, user);
  }

  @Roles(Role.STUDENT)
  @Get('borrowings/me')
  getMyBorrowings(@GetUser() user: AuthenticatedUser) {
    return this.libraryService.getMyBorrowings(user);
  }

  @Roles(Role.ADMIN)
  @Get('borrowings')
  getAllBorrowings() {
    return this.libraryService.getAllBorrowings();
  }

  @Roles(Role.ADMIN)
  @Patch('borrowings/:id/return')
  returnBook(@Param('id') id: string) {
    return this.libraryService.returnBook(+id);
  }
}
