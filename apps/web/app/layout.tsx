// 📁 apps/web/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthInitializer from '../components/AuthInitializer';
import './globals.css'; // Ini sekarang berisi Tailwind CSS

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistem Akademik',
  description: 'Sistem Akademik Sinapsis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Kita tambahkan 'dark' mode, 'antialiased' (teks lebih halus), 
        dan 'bg-background' (warna latar belakang dari shadcn) 
      */}
      <body className={`${inter.className} dark antialiased bg-background text-foreground`}>
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}