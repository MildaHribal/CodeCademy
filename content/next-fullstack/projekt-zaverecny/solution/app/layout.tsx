import type { Metadata } from 'next';
import Link from 'next/link';

import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Bazárek', template: '%s | Bazárek' },
  description: 'Sousedský bazar: co doma překáží, tady někomu udělá radost.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <header className="hlavicka">
          <Link href="/" className="znacka">
            Bazárek
          </Link>
          <nav>
            <Link href="/inzeraty">Inzeráty</Link>
            <Link href="/moje">Moje inzeráty</Link>
            <Link href="/inzeraty/novy">Přidat</Link>
          </nav>
        </header>
        <main className="obsah">{children}</main>
        <footer className="paticka">Sousedský bazar v Brně · 2026</footer>
      </body>
    </html>
  );
}
