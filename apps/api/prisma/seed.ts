// 📁 apps/api/prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { Role } from 'shared-types';
// Inisialisasi Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Buat Role (Peran)
  // upsert = "update or insert".
  // Ini akan membuat role jika belum ada, atau meng-update-nya jika sudah ada.
  // Ini membuat script seed aman untuk dijalankan berkali-kali.

  const roleAdmin = await prisma.role.upsert({
    where: { roleName: 'ADMIN' },
    update: {},
    create: {
      // Unsafe assignment of an error typed value.
      roleName: Role.ADMIN,
    },
  });

  const roleLecturer = await prisma.role.upsert({
    where: { roleName: 'LECTURER' },
    update: {},
    create: {
      roleName: 'LECTURER',
    },
  });

  const roleStudent = await prisma.role.upsert({
    where: { roleName: 'STUDENT' },
    update: {},
    create: {
      roleName: 'STUDENT',
    },
  });

  console.log({ roleAdmin, roleLecturer, roleStudent });
  console.log('Seeding finished.');
}

// Jalankan fungsi main dan pastikan koneksi ditutup
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // Tutup koneksi database
    void prisma.$disconnect();
  });
