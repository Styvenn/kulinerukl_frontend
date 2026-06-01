import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { RestaurantProvider } from '@/context/RestaurantContext';
import { ToastProvider } from '@/components/ui/Toast';
import Navbar from '@/components/layouts/Navbar';

// ─── Metadata ──────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'Local Taste Hub – Rekomendasi Kuliner Lokal Terbaik',
    template: '%s | Local Taste Hub',
  },
  description:
    'Temukan restoran, warung, dan kafe terbaik di kotamu. Ulasan asli, harga transparan, dan rekomendasi kuliner lokal yang bisa kamu percaya.',
  keywords: ['kuliner', 'restoran', 'malang', 'rekomendasi makan', 'food review', 'local food'],
  authors: [{ name: 'Local Taste Hub' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Local Taste Hub',
    title: 'Local Taste Hub – Rekomendasi Kuliner Lokal Terbaik',
    description: 'Temukan restoran dan kuliner lokal terbaik di kotamu.',
  },
};

// ─── Root Layout ───────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <RestaurantProvider>
            <ToastProvider>
              <Navbar />
              <main id="main-content" role="main">
                {children}
              </main>
            </ToastProvider>
          </RestaurantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
