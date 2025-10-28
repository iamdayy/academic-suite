// 📁 apps/api/prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- 1. SEED ROLES ---
  // upsert = "update or insert". Aman dijalankan berkali-kali.
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

  console.log('Roles seeded.');

  // --- 2. SEED ADMIN USER ---
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('admin123', salt); // Ganti password default ini

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {}, // Jangan update jika sudah ada
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: roleAdmin.id, // Hubungkan ke role ADMIN
    },
  });

  console.log('Admin user seeded.');
  console.log({ roleAdmin, roleLecturer, roleStudent, adminUser });
  console.log('Seeding finished.');
}

// Jalankan fungsi main dan pastikan koneksi ditutup
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    // Tutup koneksi database
    await prisma.$disconnect();
  });
