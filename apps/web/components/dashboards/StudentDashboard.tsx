// 📁 apps/web/components/dashboards/StudentDashboard.tsx
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

export default function StudentDashboard() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Student Dashboard</CardTitle>
        <CardDescription>Panel akademik Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button asChild size="lg">
            <Link href="/krs">
              Kartu Rencana Studi (KRS)
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/assignments">
              Tugas Saya
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}