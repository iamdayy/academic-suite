# Antigravity Rules for Academic Suite

## Project Overview
This project is an Academic Management System (Sistem Informasi Akademik) designed to handle university-level operations including student data, lecturers, courses, classes, attendance, grading, and study plans (KRS).

## Tech Stack
- **Monorepo:** Turborepo + pnpm
- **Backend (apps/api):** NestJS, Prisma ORM, PostgreSQL. Authentication via Passport/JWT. Testing with Jest.
- **Frontend (apps/web):** Next.js 15 (App Router), React 19, Tailwind CSS v4, Radix UI, Zustand (state management), React Hook Form, Zod.
- **Shared Packages:** `@repo/ui`, `shared-types`, `@repo/eslint-config`, `@repo/typescript-config`.

## Coding Conventions & Guidelines
- **Database IDs:** Prisma schema uses `BigInt` for IDs (`@id @default(autoincrement())`). When handling IDs in TypeScript or API responses, ensure they are properly serialized (e.g., converted to String or Number where appropriate, as `JSON.stringify` cannot handle BigInt by default).
- **Frontend State:** Use `Zustand` for global state (e.g., `useAuthStore`).
- **Styling:** Use Tailwind CSS utility classes and Shadcn UI (Radix UI + Tailwind) components.
- **API Calls:** Use `axios` (configured in `lib/api`) for frontend-backend communication.
- **Naming Conventions:** 
  - Prisma Models: PascalCase (e.g., `StudyProgram`, `KrsHeader`).
  - Database tables: snake_case (e.g., `study_programs`, `krs_headers`).
  - API Endpoints: RESTful with kebab-case.

## Roadmap & Missing Features
The system currently covers core academic activities. For future development, here is a list of features that can be added to make it a fully-fledged university academic suite:

1. **Keuangan / Tagihan (Finance/Tuition):** Modul untuk manajemen Uang Kuliah Tunggal (UKT), pembayaran (payment gateway integration), cicilan, dan beasiswa.
2. **Bimbingan & Tugas Akhir (Thesis/Counseling):** Pencatatan bimbingan akademik (Dosen Pembimbing Akademik) dan pengajuan judul skripsi/tugas akhir hingga penjadwalan sidang.
3. **Cuti Akademik (Leave of Absence):** Sistem pengajuan dan persetujuan cuti kuliah.
4. **Kuisioner & Evaluasi (EDOM):** Evaluasi Dosen oleh Mahasiswa di akhir semester sebagai syarat pengisian KRS atau melihat KHS.
5. **Transkrip & KHS PDF (Reporting):** Generate KHS (Kartu Hasil Studi) dan Transkrip Nilai resmi dalam bentuk PDF (dengan QR code/digital signature).
6. **Kelulusan & Alumni:** Manajemen pendaftaran yudisium, wisuda, dan tracer study untuk alumni.
7. **Perpustakaan (Library Management):** Manajemen katalog buku, peminjaman, pengembalian, dan denda.
8. **Fasilitas & Peminjaman Ruang (Asset/Room Management):** Sistem booking ruang kelas (di luar jam kuliah) atau lab.
9. **Sistem Notifikasi Terpusat:** Notifikasi in-app, email, atau push notifications untuk pengumuman, pengingat jadwal, atau tenggat waktu tugas.
