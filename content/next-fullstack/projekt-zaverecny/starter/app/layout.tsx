import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Závěrečný projekt',
  description: 'Až budeš vědět, co aplikace dělá, přepiš titulek i popis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <main className="obsah">{children}</main>
      </body>
    </html>
  );
}
