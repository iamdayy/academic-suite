// 📁 apps/web/stores/authStore.ts
import { AuthenticatedUser } from 'shared-types';
import { create } from 'zustand';

// 1. Definisikan 'shape' (bentuk) dari state kita
interface AuthState {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  setUser: (user: AuthenticatedUser | null) => void;
  setLoading: (loading: boolean) => void;
}

// 2. Buat store-nya
export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Awalnya tidak ada user
  isLoading: true, // Awalnya kita 'loading' (mengecek auth)

  // Aksi untuk menyimpan user
  setUser: (user) => set({ user: user, isLoading: false }),

  // Aksi untuk mengubah status loading
  setLoading: (loading) => set({ isLoading: loading }),
}));