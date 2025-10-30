// 📁 apps/web/components/AdminAuthGuard.tsx
"use client";

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Role } from 'shared-types'; // Impor Enum Role
import { useAuthStore } from '../stores/authStore';

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return; // Tunggu sampai pengecekan auth selesai
    }

    // 1. Jika tidak login, tendang ke halaman utama
    if (!user) {
      router.push('/');
      return;
    }

    // 2. Jika login TAPI BUKAN ADMIN, tendang ke dashboard
    if (user.role.roleName !== Role.ADMIN) {
      router.push('/dashboard');
      return;
    }

    // 3. Jika lolos semua, izinkan akses
    setIsAuthorized(true);

  }, [user, isLoading, router]);

  // Selama loading, tampilkan spinner
  if (isLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Jika user adalah ADMIN, tampilkan halaman
  return <>{children}</>;
}