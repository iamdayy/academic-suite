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
import { BookCopy, CalendarDays, LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Role } from 'shared-types';

// Komponen untuk link di Sidebar
function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="ghost" className="w-full justify-start" asChild>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

interface IRoute {
  name: string;
  href: string;
  icon: any;
}
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser } = useAuthStore();
  const [ routes, setRoutes ] = useState<IRoute[]>([]);
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

  const adminRoutes: IRoute[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Manajemen Akademik',
      href: '/admin/academics',
      icon: BookCopy,
    },
    {
      name: "Manajemen T.A. & Kelas",
      href: "/admin/academic-years",
      icon: CalendarDays,
    }
  ];
  const lecturerRoutes: IRoute[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    }
  ];
  const studentRoutes: IRoute[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    }
  ];

  useEffect(() => {
    if (user?.role.roleName === Role.ADMIN) {
      setRoutes(adminRoutes);
    } else if (user?.role.roleName === Role.LECTURER) {
      setRoutes(lecturerRoutes);
    } else if (user?.role.roleName === Role.STUDENT) {
      setRoutes(studentRoutes);
    }
  }, [user, setRoutes]);


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
            {
              routes.map((route, index) => (
                <SidebarLink key={index} href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" /> {route.name}
                </SidebarLink>
              ))
            }
            
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