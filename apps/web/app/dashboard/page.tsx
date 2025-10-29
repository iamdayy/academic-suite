// 📁 apps/web/app/dashboard/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import ClientAuthGuard from '../../components/ClientAuthGuard';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

// 1. Impor komponen UI baru
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut } from 'lucide-react'; // Ikon untuk tombol logout

export default function DashboardPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  return (
    // 2. Bungkus dengan Guard
    <ClientAuthGuard>
      {/* 3. Gunakan Tailwind untuk menengahkan Card */}
      <main className="flex items-center justify-center min-h-screen">
        {user && (
          // 4. Gunakan komponen Card
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Selamat Datang, {user.email}!</CardTitle>
              <CardDescription>
                Anda login sebagai: <strong>{user.role.roleName}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Ini adalah halaman dashboard Anda yang terproteksi.</p>
              {/* Di sinilah kita akan menambahkan navigasi 
                  berdasarkan peran (Role) Anda nanti */}
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={handleLogout} className="w-full">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </ClientAuthGuard>
  );
}