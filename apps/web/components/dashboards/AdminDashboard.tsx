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
import { BookCopy, BookUser, CalendarDays, Users } from 'lucide-react';
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
          <Button asChild size="lg" variant="default" className="col-span-2">
            <Link href="/admin/academics">
              <BookCopy className="mr-2 h-4 w-4" /> Manajemen Akademik
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
        <Link href="/admin/academic-years">
          <CalendarDays className="mr-2 h-4 w-4" /> Manajemen T.A. & Kelas
        </Link>
      </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/users">
              <BookUser className="mr-2 h-4 w-4" /> Manajemen User
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
                <Link href="/admin/guardians">
                  <Users className="mr-2 h-4 w-4" /> Manajemen Wali
                </Link>
              </Button>
        </div>
      </CardContent>
    </Card>
  );
}