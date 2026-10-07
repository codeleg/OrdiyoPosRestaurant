import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ordiyo POS',
  description: 'Restaurant POS vertical slice',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
