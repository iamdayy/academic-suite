import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ThesisDefensesService } from './thesis-defenses.service';
import { CreateThesisDefenseDto } from './dto/create-thesis-defense.dto';
import { UpdateThesisDefenseDto } from './dto/update-thesis-defense.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'shared-types';

export class JwtAuthGuard extends AuthGuard('jwt') { }

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('thesis-defenses')
export class ThesisDefensesController {
  constructor(private readonly thesisDefensesService: ThesisDefensesService) { }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createThesisDefenseDto: CreateThesisDefenseDto) {
    return this.thesisDefensesService.create(createThesisDefenseDto);
  }

  @Roles(Role.ADMIN, Role.LECTURER)
  @Get()
  findAll() {
    return this.thesisDefensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.thesisDefensesService.findOne(+id);
  }

  @Roles(Role.ADMIN, Role.LECTURER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateThesisDefenseDto: UpdateThesisDefenseDto) {
    return this.thesisDefensesService.update(+id, updateThesisDefenseDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.thesisDefensesService.remove(+id);
  }
}
