import type { Metadata } from 'next';
import Link from 'next/link';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://zrno.example.cz'),
  title: {
    default: 'Pražírna Zrno',
    template: '%s | Pražírna Zrno',
  },
  description: 'Výběrová káva pražená v Brně. Malé dávky, jasný původ, žádné superlativy.',
  openGraph: { locale: 'cs_CZ', type: 'website', siteName: 'Pražírna Zrno' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <div className="obal">
          <header className="hlavicka">
            <Link className="hlavicka__znacka" href="/">
              Pražírna Zrno
            </Link>
            <nav>
              <Link href="/">Úvod</Link>
              <Link href="/kava">Katalog</Link>
            </nav>
          </header>

          <main>{children}</main>

          <footer className="paticka">Pražíme v Brně od roku 2019. Objednávky do 12:00 posíláme týž den.</footer>
        </div>
      </body>
    </html>
  );
}
