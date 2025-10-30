// 📁 apps/web/app/lecturer/classes/page.tsx
"use client";

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Definisikan tipe datanya
interface Class {
  id: bigint;
  name: string;
  course: {
    name: string;
    code: string;
  };
  academicYear: {
    year: string;
    semester: string;
  };
}

export default function MyClassesPage() {
  const [myClasses, setMyClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        // Panggil endpoint baru kita
        const response = await api.get('/classes/my');
        setMyClasses(response.data);
      } catch (error) {
        console.error("Gagal mengambil data kelas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyClasses();
  }, []);

  return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Kelas yang Saya Ajar</h1>

        {isLoading ? (
          <div className="flex justify-center mt-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tahun Ajaran</TableHead>
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myClasses.map((cls) => (
                <TableRow key={cls.id.toString()}>
                  <TableCell>{cls.academicYear.year} ({cls.academicYear.semester})</TableCell>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.course.code} - {cls.course.name}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/lecturer/classes/${cls.id}`}>
                        Kelola Kelas
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading && myClasses.length === 0 && (
          <p className="text-center text-muted-foreground mt-10">
            Anda tidak ditugaskan mengajar kelas apapun saat ini.
          </p>
        )}
      </div>
  );
}