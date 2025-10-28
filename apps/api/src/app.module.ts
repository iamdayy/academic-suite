import { Module } from '@nestjs/common';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { CoursesModule } from './courses/courses.module';
import { CurriculumsModule } from './curriculums/curriculums.module';
import { KrsDetailsModule } from './krs-details/krs-details.module';
import { KrsHeadersModule } from './krs-headers/krs-headers.module';
import { LecturersModule } from './lecturers/lecturers.module';
import { MajorsModule } from './majors/majors.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';
import { StudyProgramsModule } from './study-programs/study-programs.module';
import { UsersModule } from './users/users.module';
import { MaterialsModule } from './materials/materials.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    StudyProgramsModule,
    CurriculumsModule,
    MajorsModule,
    CoursesModule,
    LecturersModule,
    StudentsModule,
    AcademicYearsModule,
    ClassesModule,
    KrsHeadersModule,
    KrsDetailsModule,
    MaterialsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
