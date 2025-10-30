// 📁 apps/web/components/dashboards/AdminDashboard.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookCopy, BookUser, Building, GraduationCap, School } from 'lucide-react';
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>
          Panel manajemen untuk mengelola data master.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Ganti <p> dengan ini */}
        <div className="grid grid-cols-2 gap-4">
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/majors">
              <Building className="mr-2 h-4 w-4" /> Manajemen Jurusan
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/study-programs">
              <GraduationCap className="mr-2 h-4 w-4" /> Manajemen Prodi
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/curriculums">
              <BookCopy className="mr-2 h-4 w-4" /> Manajemen Kurikulum
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
                <Link href="/admin/courses">
                  <BookCopy className="mr-2 h-4 w-4" /> Manajemen MatKul
                </Link>
              </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/users">
              <BookUser className="mr-2 h-4 w-4" /> Manajemen User
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/classes">
              <School className="mr-2 h-4 w-4" /> Manajemen Kelas
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}