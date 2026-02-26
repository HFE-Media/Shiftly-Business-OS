import './globals.css';
import { Sidebar } from '@/components/sidebar';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = { title: 'Shiftly Business OS' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="md:flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
