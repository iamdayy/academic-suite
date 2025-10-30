// 📁 apps/web/app/(app)/layout.tsx
"use client";

import ClientAuthGuard from '@/components/ClientAuthGuard';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Book, ClipboardList, LayoutDashboard, LogOut, School, UserCog } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Role } from 'shared-types';

// Komponen untuk link di Sidebar
function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="ghost" className="w-full justify-start" asChild>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const getInitials = (email: string = '') => {
    return email[0]?.toUpperCase() || 'U';
  };

  return (
    // Gunakan Guard untuk melindungi seluruh layout aplikasi
    <ClientAuthGuard>
      <div className="flex min-h-screen">
        {/* --- SIDEBAR --- */}
        <aside className="w-64 border-r bg-background p-4 flex flex-col">
          <h2 className="text-2xl font-bold mb-6">ACADEMIC SUITE</h2>
          <nav className="flex flex-col space-y-2 grow">
            {/* Link Navigasi Dinamis */}
            <SidebarLink href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </SidebarLink>

            {user?.role.roleName === Role.STUDENT && (
              <>
                <SidebarLink href="/krs">
                  <Book className="mr-2 h-4 w-4" /> KRS
                </SidebarLink>
                <SidebarLink href="/assignments">
                  <ClipboardList className="mr-2 h-4 w-4" /> Tugas Saya
                </SidebarLink>
              </>
            )}

            {user?.role.roleName === Role.LECTURER && (
              <SidebarLink href="/lecturer/classes">
                <School className="mr-2 h-4 w-4" /> Kelas Saya
              </SidebarLink>
            )}

            {user?.role.roleName === Role.ADMIN && (
              <SidebarLink href="/admin/majors">
                <UserCog className="mr-2 h-4 w-4" /> Panel Admin
              </SidebarLink>
            )}
            
          </nav>
          <div className="text-xs text-muted-foreground">© 2025 Academic Suite</div>
        </aside>

        {/* --- KONTEN UTAMA --- */}
        <div className="flex-1 flex flex-col">
          {/* --- HEADER --- */}
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container flex h-14 items-center justify-end">
              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="#" alt="Avatar" />
                      <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.role.roleName}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* --- ANAK HALAMAN (PAGE) --- */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </ClientAuthGuard>
  );
}