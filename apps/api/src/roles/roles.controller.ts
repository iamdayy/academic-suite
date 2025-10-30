// 📁 apps/api/src/roles/roles.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'shared-types';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesService } from './roles.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN) // Hanya Admin yang bisa melihat daftar Role
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }
}
