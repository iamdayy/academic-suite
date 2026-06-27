import { Module } from '@nestjs/common';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssignmentSubmissionsModule } from './assignment-submissions/assignment-submissions.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { ClassEnrollmentsModule } from './class-enrollments/class-enrollments.module';
import { ClassesModule } from './classes/classes.module';
import { CoursesModule } from './courses/courses.module';
import { CurriculumsModule } from './curriculums/curriculums.module';
import { KrsDetailsModule } from './krs-details/krs-details.module';
import { KrsHeadersModule } from './krs-headers/krs-headers.module';
import { LecturersModule } from './lecturers/lecturers.module';
import { MajorsModule } from './majors/majors.module';
import { MaterialsModule } from './materials/materials.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';
import { StudyProgramsModule } from './study-programs/study-programs.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { GuardiansModule } from './guardians/guardians.module';
import { PrerequisitesModule } from './prerequisites/prerequisites.module';
import { GuardianViewModule } from './guardian-view/guardian-view.module';
import { StatsModule } from './stats/stats.module';
import { ClassSchedulesModule } from './class-schedules/class-schedules.module';
import { AttendanceModule } from './attendance/attendance.module';
import { GradingModule } from './grading/grading.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { ThesesModule } from './theses/theses.module';
import { CounselingLogsModule } from './counseling-logs/counseling-logs.module';
import { ThesisDefensesModule } from './thesis-defenses/thesis-defenses.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { EdomModule } from './edom/edom.module';
import { ReportsModule } from './reports/reports.module';
import { AlumniModule } from './alumni/alumni.module';
import { LibraryModule } from './library/library.module';
import { FacilitiesModule } from './facilities/facilities.module';

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
    AssignmentsModule,
    AssignmentSubmissionsModule,
    ClassEnrollmentsModule,
    RolesModule,
    GuardiansModule,
    PrerequisitesModule,
    GuardianViewModule,
    StatsModule,
    ClassSchedulesModule,
    AttendanceModule,
    GradingModule,
    InvoicesModule,
    PaymentsModule,
    ThesesModule,
    CounselingLogsModule,
    ThesisDefensesModule,
    LeaveRequestsModule,
    EdomModule,
    ReportsModule,
    AlumniModule,
    LibraryModule,
    FacilitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
