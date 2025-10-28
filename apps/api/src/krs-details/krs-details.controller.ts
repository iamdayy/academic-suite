// 📁 apps/api/src/krs-details/krs-details.controller.ts

import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as sharedTypes from 'shared-types';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateKrsDetailDto } from './dto/create-krs-detail.dto';
import { KrsDetailsService } from './krs-details.service';

@UseGuards(AuthGuard('jwt'), RolesGuard) // Amankan seluruh controller
@Controller('krs-details')
export class KrsDetailsController {
  constructor(private readonly krsDetailsService: KrsDetailsService) {}

  /**
   * [UNTUK STUDENT]
   * Menambahkan mata kuliah ke KRS (POST /krs-details)
   */
  @Post()
  @Roles(sharedTypes.Role.STUDENT) // Hanya STUDENT
  create(
    @Body() createKrsDetailDto: CreateKrsDetailDto,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.krsDetailsService.create(createKrsDetailDto, user);
  }

  /**
   * [UNTUK STUDENT]
   * Menghapus mata kuliah dari KRS (DELETE /krs-details/:id)
   */
  @Delete(':id')
  @Roles(sharedTypes.Role.STUDENT) // Hanya STUDENT
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.krsDetailsService.remove(id, user);
  }

  // Kita tidak mengekspos GET /krs-details
  // atau PATCH /krs-details
}
