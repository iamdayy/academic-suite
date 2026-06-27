import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CounselingLogsService } from './counseling-logs.service';
import { CreateCounselingLogDto } from './dto/create-counseling-log.dto';
import { UpdateCounselingLogDto } from './dto/update-counseling-log.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'shared-types';

export class JwtAuthGuard extends AuthGuard('jwt') {}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('counseling-logs')
export class CounselingLogsController {
  constructor(private readonly counselingLogsService: CounselingLogsService) {}

  @Roles(Role.STUDENT)
  @Post()
  create(@Body() createCounselingLogDto: CreateCounselingLogDto) {
    return this.counselingLogsService.create(createCounselingLogDto);
  }

  @Roles(Role.ADMIN, Role.LECTURER)
  @Get()
  findAll() {
    return this.counselingLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.counselingLogsService.findOne(+id);
  }

  @Roles(Role.LECTURER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCounselingLogDto: UpdateCounselingLogDto) {
    return this.counselingLogsService.update(+id, updateCounselingLogDto);
  }

  @Roles(Role.ADMIN, Role.STUDENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.counselingLogsService.remove(+id);
  }
}
