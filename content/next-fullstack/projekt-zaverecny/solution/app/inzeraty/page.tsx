import type { Metadata } from 'next';
import Link from 'next/link';

import { vsechnyInzeraty } from '@/lib/data.ts';

export const metadata: Metadata = {
  title: 'Inzeráty',
  description: 'Všechno, co sousedi právě nabízejí.',
};

export default async function SeznamInzeratu() {
  const inzeraty = await vsechnyInzeraty();

  if (inzeraty.length === 0) {
    return (
      <>
        <h1>Inzeráty</h1>
        <p>
          Zatím tu nic není. <Link href="/inzeraty/novy">Přidej první inzerát.</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Inzeráty</h1>
      <ul className="seznam">
        {inzeraty.map((inzerat) => (
          <li key={inzerat.id} className="karta">
            <h2>
              <Link href={`/inzeraty/${inzerat.slug}`}>{inzerat.nazev}</Link>
            </h2>
            <p className="cena">{inzerat.cena.toLocaleString('cs-CZ')} Kč</p>
            <p>{inzerat.kategorie}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
