// 📁 apps/api/src/prerequisites/prerequisites.controller.ts
import {
    Controller,
    Delete,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'shared-types';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrerequisitesService } from './prerequisites.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN) // Hanya Admin
@Controller('prerequisites')
export class PrerequisitesController {
  constructor(private readonly prerequisitesService: PrerequisitesService) {}

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.prerequisitesService.remove(id);
  }
}
