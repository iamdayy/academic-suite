// 📁 apps/web/app/register/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api"; // Kita gunakan instance axios kita
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  // State untuk form Mahasiswa
  const [studentNim, setStudentNim] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // State untuk form Dosen
  const [lecturerNidn, setLecturerNidn] = useState("");
  const [lecturerEmail, setLecturerEmail] = useState("");
  const [lecturerPassword, setLecturerPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // Handler untuk submit registrasi Mahasiswa
  const handleSubmitStudent = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/register/student", {
        nim: studentNim,
        email: studentEmail,
        password: studentPassword,
      });
      toast.success("Registrasi berhasil! Silakan login.");
      router.push("/"); // Arahkan ke halaman login
    } catch (error: any) {
      console.error("Registrasi mahasiswa gagal:", error);
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler untuk submit registrasi Dosen
  const handleSubmitLecturer = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/register/lecturer", {
        nidn: lecturerNidn,
        email: lecturerEmail,
        password: lecturerPassword,
      });
      toast.success("Registrasi berhasil! Silakan login.");
      router.push("/"); // Arahkan ke halaman login
    } catch (error: any) {
      console.error("Registrasi dosen gagal:", error);
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen">
      <Tabs defaultValue="student" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="student">Mahasiswa</TabsTrigger>
          <TabsTrigger value="lecturer">Dosen</TabsTrigger>
        </TabsList>

        {/* Form Registrasi Mahasiswa */}
        <TabsContent value="student">
          <Card>
            <CardHeader>
              <CardTitle>Registrasi Akun Mahasiswa</CardTitle>
              <CardDescription>
                Aktivasi akun Anda menggunakan NIM yang telah terdaftar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitStudent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nim">NIM</Label>
                  <Input
                    id="nim"
                    value={studentNim}
                    onChange={(e) => setStudentNim(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-student">Email</Label>
                  <Input
                    id="email-student"
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-student">Password</Label>
                  <Input
                    id="password-student"
                    type="password"
                    minLength={8}
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Daftar
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Form Registrasi Dosen */}
        <TabsContent value="lecturer">
          <Card>
            <CardHeader>
              <CardTitle>Registrasi Akun Dosen</CardTitle>
              <CardDescription>
                Aktivasi akun Anda menggunakan NIDN yang telah terdaftar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitLecturer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nidn">NIDN</Label>
                  <Input
                    id="nidn"
                    value={lecturerNidn}
                    onChange={(e) => setLecturerNidn(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-lecturer">Email</Label>
                  <Input
                    id="email-lecturer"
                    type="email"
                    value={lecturerEmail}
                    onChange={(e) => setLecturerEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-lecturer">Password</Label>
                  <Input
                    id="password-lecturer"
                    type="password"
                    minLength={8}
                    value={lecturerPassword}
                    onChange={(e) => setLecturerPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Daftar
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <div className="text-center mt-4">
          <Button variant="link" asChild>
            <Link href="/">Sudah punya akun? Login di sini</Link>
          </Button>
        </div>
      </Tabs>
    </main>
  );
}
