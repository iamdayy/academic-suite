import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudyProgramsModule } from './study-programs/study-programs.module';
import { CurriculumsModule } from './curriculums/curriculums.module';
import { MajorsModule } from './majors/majors.module';
import { CoursesModule } from './courses/courses.module';
import { LecturersModule } from './lecturers/lecturers.module';
import { StudentsModule } from './students/students.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { ClassesModule } from './classes/classes.module';
import { KrsHeadersModule } from './krs-headers/krs-headers.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, StudyProgramsModule, CurriculumsModule, MajorsModule, CoursesModule, LecturersModule, StudentsModule, AcademicYearsModule, ClassesModule, KrsHeadersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
