// 📁 apps/web/components/AuthInitializer.tsx
"use client";

import { useEffect } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function AuthInitializer() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Panggil endpoint 'me'
        const response = await api.get('/auth/me');

        // 2. Jika sukses (cookie valid), simpan user ke state
        setUser(response.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // 3. Jika gagal (cookie tidak ada/invalid), set user ke null
        console.log('User not authenticated, because', error.response.data.message);
        setUser(null);
      } finally {
        // 4. Set loading ke false
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setLoading]); // Jalankan sekali saat mount

  return null; // Komponen ini tidak me-render apapun
}