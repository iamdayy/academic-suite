import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Role } from 'shared-types';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- 1. SEED ROLES ---
  console.log('Seeding Roles...');
  const roleAdmin = await prisma.role.upsert({
    where: { roleName: 'ADMIN' },
    update: {},
    create: { roleName: 'ADMIN' },
  });

  const roleLecturer = await prisma.role.upsert({
    where: { roleName: 'LECTURER' },
    update: {},
    create: { roleName: 'LECTURER' },
  });

  const roleStudent = await prisma.role.upsert({
    where: { roleName: 'STUDENT' },
    update: {},
    create: { roleName: 'STUDENT' },
  });

  const roleGuardian = await prisma.role.upsert({
    where: { roleName: Role.GUARDIAN },
    update: {},
    create: { roleName: Role.GUARDIAN },
  });

  // --- 2. SEED ACADEMIC YEARS ---
  console.log('Seeding Academic Years...');
  let ayGanjil = await prisma.academicYear.findFirst({ where: { year: '2024/2025', semester: 'GANJIL' } });
  if (!ayGanjil) {
    ayGanjil = await prisma.academicYear.create({
      data: { year: '2024/2025', semester: 'GANJIL', startDate: new Date('2024-08-01'), endDate: new Date('2025-01-31') }
    });
  }

  // --- 3. SEED FACILITIES ---
  console.log('Seeding Facilities...');
  const facilities = ['Ruang Kelas A1', 'Ruang Kelas A2', 'Lab Komputer 1', 'Auditorium Utama'];
  const createdFacilities: any[] = [];
  for (const f of facilities) {
    let existing = await prisma.facility.findUnique({ where: { name: f } });
    if (!existing) {
      existing = await prisma.facility.create({ data: { name: f, type: 'CLASSROOM', capacity: 40, isActive: true } });
    }
    createdFacilities.push(existing);
  }

  // --- 4. SEED LIBRARY BOOKS ---
  console.log('Seeding Library Books...');
  let category = await prisma.bookCategory.findUnique({ where: { name: 'Komputer & Teknologi' } });
  if (!category) {
    category = await prisma.bookCategory.create({ data: { name: 'Komputer & Teknologi' } });
  }

  const books = [
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', publisher: 'Prentice Hall', publishYear: 2008, copiesTotal: 5, copiesAvailable: 5 },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '9780201616224', publisher: 'Addison-Wesley', publishYear: 1999, copiesTotal: 3, copiesAvailable: 3 },
    { title: 'Design Patterns', author: 'Erich Gamma', isbn: '9780201633610', publisher: 'Addison-Wesley', publishYear: 1994, copiesTotal: 4, copiesAvailable: 4 },
  ];
  for (const b of books) {
    const existing = await prisma.book.findFirst({ where: { isbn: b.isbn } });
    if (!existing) {
      await prisma.book.create({ data: { ...b, categoryId: category.id } });
    }
  }

  // --- 5. SEED MAJOR & STUDY PROGRAM ---
  console.log('Seeding Majors and Study Programs...');
  const major = await prisma.major.upsert({
    where: { name: 'Fakultas Ilmu Komputer' },
    update: {},
    create: { name: 'Fakultas Ilmu Komputer' },
  });

  let spTI = await prisma.studyProgram.findFirst({ where: { name: 'Teknik Informatika' } });
  if (!spTI) {
    spTI = await prisma.studyProgram.create({ data: { majorId: major.id, name: 'Teknik Informatika', level: 'S1' } });
  }

  // --- 6. SEED CURRICULUM & COURSES ---
  console.log('Seeding Curriculums and Courses...');
  let curr = await prisma.curriculum.findFirst({ where: { name: 'Kurikulum Merdeka 2024' } });
  if (!curr) {
    curr = await prisma.curriculum.create({ data: { studyProgramId: spTI.id, name: 'Kurikulum Merdeka 2024', year: 2024 } });
  }

  const courses = [
    { code: 'IF101', name: 'Pemrograman Web', credits: 3, semester: 1 },
    { code: 'IF102', name: 'Basis Data', credits: 3, semester: 1 },
    { code: 'IF103', name: 'Struktur Data', credits: 3, semester: 1 },
  ];
  const createdCourses: any[] = [];
  for (const c of courses) {
    let course = await prisma.course.findUnique({ where: { code: c.code } });
    if (!course) {
      course = await prisma.course.create({ data: { curriculumId: curr.id, ...c } });
    }
    createdCourses.push(course);
  }

  // --- 7. SEED USERS ---
  console.log('Seeding Users (Admin, Lecturers, Students)...');
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', password: hashedPassword, roleId: roleAdmin.id },
  });

  // Lecturers
  const lecturersData = [
    { email: 'dosen1@example.com', name: 'Budi Santoso, S.Kom., M.Kom.', nidn: '111111' },
    { email: 'dosen2@example.com', name: 'Siti Aminah, Ph.D.', nidn: '222222' },
  ];
  const createdLecturers: any[] = [];
  for (const l of lecturersData) {
    let user = await prisma.user.findUnique({ where: { email: l.email } });
    if (!user) {
      user = await prisma.user.create({ data: { email: l.email, password: hashedPassword, roleId: roleLecturer.id } });
    }
    const lecturer = await prisma.lecturer.upsert({
      where: { nidn: l.nidn },
      update: {},
      create: { userId: user.id, nidn: l.nidn, name: l.name },
    });
    createdLecturers.push(lecturer);
  }

  // Students
  const studentsData = [
    { email: 'mhs1@example.com', name: 'Andi Susanto', nim: '240001' },
    { email: 'mhs2@example.com', name: 'Beni Setiawan', nim: '240002' },
    { email: 'mhs3@example.com', name: 'Citra Kirana', nim: '240003' },
    { email: 'mhs4@example.com', name: 'Dewi Lestari', nim: '240004' },
    { email: 'mhs5@example.com', name: 'Eko Patrio', nim: '240005' },
  ];
  const createdStudents: any[] = [];
  for (const s of studentsData) {
    let user = await prisma.user.findUnique({ where: { email: s.email } });
    if (!user) {
      user = await prisma.user.create({ data: { email: s.email, password: hashedPassword, roleId: roleStudent.id } });
    }
    const student = await prisma.student.upsert({
      where: { nim: s.nim },
      update: {},
      create: { userId: user.id, studyProgramId: spTI.id, nim: s.nim, name: s.name, status: 'ACTIVE' },
    });
    createdStudents.push(student);
  }

  // --- 8. SEED CLASSES ---
  console.log('Seeding Classes...');
  const classesData = [
    { courseId: createdCourses[0].id, lecturerId: createdLecturers[0].id, name: 'Pemrograman Web - Kelas A' },
    { courseId: createdCourses[1].id, lecturerId: createdLecturers[1].id, name: 'Basis Data - Kelas A' },
    { courseId: createdCourses[2].id, lecturerId: createdLecturers[0].id, name: 'Struktur Data - Kelas B' },
  ];
  const createdClasses: any[] = [];
  for (const cls of classesData) {
    let c = await prisma.class.findFirst({ where: { courseId: cls.courseId, academicYearId: ayGanjil.id, name: cls.name } });
    if (!c) {
      c = await prisma.class.create({ data: { academicYearId: ayGanjil.id, ...cls } });
    }
    createdClasses.push(c);
  }

  // --- 9. SEED CLASS SCHEDULES ---
  console.log('Seeding Class Schedules...');
  const schedules = [
    { classId: createdClasses[0].id, facilityId: createdFacilities[0].id, dayOfWeek: 'Senin', startTime: '08:00', endTime: '10:30' },
    { classId: createdClasses[1].id, facilityId: createdFacilities[2].id, dayOfWeek: 'Selasa', startTime: '10:00', endTime: '12:30' },
    { classId: createdClasses[2].id, facilityId: createdFacilities[1].id, dayOfWeek: 'Rabu', startTime: '13:00', endTime: '15:30' },
  ];
  for (const sch of schedules) {
    const existing = await prisma.classSchedule.findFirst({ where: { classId: sch.classId, dayOfWeek: sch.dayOfWeek } });
    if (!existing) {
      await prisma.classSchedule.create({ data: sch });
    }
  }

  // --- 10. SEED KRS ---
  console.log('Seeding KRS Enrollments...');
  for (const student of createdStudents) {
    let krsHeader = await prisma.krsHeader.findFirst({ where: { studentId: student.id, academicYearId: ayGanjil.id } });
    if (!krsHeader) {
      krsHeader = await prisma.krsHeader.create({
        data: { studentId: student.id, academicYearId: ayGanjil.id, status: 'APPROVED', semester: 1 }
      });
    }

    for (const cls of createdClasses) {
      const existingEnroll = await prisma.classStudent.findUnique({
        where: { classId_studentId: { classId: cls.id, studentId: student.id } }
      });
      if (!existingEnroll) {
        await prisma.classStudent.create({
          data: { classId: cls.id, studentId: student.id }
        });
      }
    }
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
