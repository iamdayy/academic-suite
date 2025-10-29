// 📁 apps/web/components/ClientAuthGuard.tsx
"use client";

import { Loader2 } from 'lucide-react'; // <-- 1. Impor ikon loader
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export default function ClientAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Logika ini tidak berubah
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // 2. Ganti tampilan loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 3. Jika user ada, tampilkan halaman
  if (user) {
    return <>{children}</>;
  }

  // Jika !isLoading dan !user, jangan tampilkan apa-apa (karena sedang redirect)
  return null;
}