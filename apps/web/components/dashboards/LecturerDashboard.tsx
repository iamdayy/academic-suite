// 📁 apps/web/components/dashboards/LecturerDashboard.tsx
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { School } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function LecturerDashboard() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Lecturer Dashboard</CardTitle>
        <CardDescription>Panel manajemen untuk kelas Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <Button asChild size="lg">
            <Link href="/lecturer/classes">
              <School className="mr-2 h-4 w-4" />
              Lihat Kelas yang Saya Ajar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}