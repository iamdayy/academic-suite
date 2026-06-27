import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ThesesService } from './theses.service';
import { CreateThesisDto } from './dto/create-thesis.dto';
import { UpdateThesisDto } from './dto/update-thesis.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'shared-types';
import { GetUser } from '../auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'shared-types';

export class JwtAuthGuard extends AuthGuard('jwt') {}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('theses')
export class ThesesController {
  constructor(private readonly thesesService: ThesesService) {}

  @Roles(Role.STUDENT)
  @Post()
  create(@Body() createThesisDto: CreateThesisDto, @GetUser() user: AuthenticatedUser) {
    return this.thesesService.create(createThesisDto, user);
  }

  @Roles(Role.ADMIN, Role.LECTURER)
  @Get()
  findAll() {
    return this.thesesService.findAll();
  }
  
  @Roles(Role.STUDENT)
  @Get('my-thesis')
  findMyThesis(@GetUser() user: AuthenticatedUser) {
    return this.thesesService.findMyThesis(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.thesesService.findOne(+id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateThesisDto: UpdateThesisDto) {
    return this.thesesService.update(+id, updateThesisDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.thesesService.remove(+id);
  }
}
