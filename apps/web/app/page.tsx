// 📁 apps/web/app/page.tsx
"use client";

import { FormEvent, useState } from 'react';
import api from '../lib/api';

// 1. Impor komponen baru kita
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from 'next/navigation';
import { AuthenticatedUser } from 'shared-types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setUser(null);

    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password,
      });
      setUser(response.data.user);
      redirect('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // ... (logika error Anda tidak berubah)
      console.error('Login Gagal:', err);
      if (err.response) {
        setError(err.response.data.message || 'Login Gagal');
      } else {
        setError('Tidak bisa terhubung ke server');
      }
    }
  };

  return (
    // 2. Gunakan class Tailwind untuk menengahkan form
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 border rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Login Sistem Akademik</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 3. Gunakan Komponen Input & Label */}
          <div className="space-y-2">
            <Label htmlFor="email">Email:</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* 4. Gunakan Komponen Input & Label */}
          <div className="space-y-2">
            <Label htmlFor="password">Password:</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* 5. Gunakan Komponen Button */}
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>

        {error && (
          <div className="text-red-500 text-center">
            Error: {error}
          </div>
        )}
        
        {user && (
          <div className="text-green-500 text-center">
            Login Berhasil! Selamat datang, {user.email}.
            <br />
          </div>
        )}
      </div>
    </main>
  );
}