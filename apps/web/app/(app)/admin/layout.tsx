// 📁 apps/web/app/admin/layout.tsx
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. Gunakan Guard untuk membungkus seluruh layout
    <AdminAuthGuard>
      {/* 2. Buat header sederhana untuk navigasi Admin */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Link>
          </Button>
          <h2 className="text-lg font-semibold ml-4">Admin Panel</h2>
        </div>
      </header>

      {/* 3. Render halaman spesifik (misal: /admin/majors) */}
      <main className="container mx-auto p-4">
        {children}
      </main>
    </AdminAuthGuard>
  );
}