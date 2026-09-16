import type { Metadata } from 'next';
import Link from 'next/link';

import { vyzadujUzivatele } from '@/lib/auth.ts';
import { inzeratyUzivatele } from '@/lib/data.ts';

export const metadata: Metadata = { title: 'Moje inzeráty' };

export default async function MojeInzeraty() {
  const uzivatel = await vyzadujUzivatele();
  // Dotaz filtruje podle id ze session, ne podle ničeho z adresy.
  const polozky = await inzeratyUzivatele(uzivatel.id);

  return (
    <>
      <h1>Moje inzeráty</h1>
      {polozky.length === 0 ? (
        <p>
          Zatím nic nenabízíš. <Link href="/inzeraty/novy">Přidej první inzerát.</Link>
        </p>
      ) : (
        <ul className="seznam">
          {polozky.map((inzerat) => (
            <li key={inzerat.id} className="karta">
              <h2>
                <Link href={`/inzeraty/${inzerat.slug}`}>{inzerat.nazev}</Link>
              </h2>
              <p className="cena">{inzerat.cena.toLocaleString('cs-CZ')} Kč</p>
              <p>{inzerat.stav === 'uzamceno' ? 'Rezervováno' : 'Aktivní'}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
