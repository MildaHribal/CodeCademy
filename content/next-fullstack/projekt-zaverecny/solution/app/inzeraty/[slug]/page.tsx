import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { najdiInzerat } from '@/lib/data.ts';
import { prihlasenyUzivatel } from '@/lib/auth.ts';
import { smazInzerat } from '@/lib/akce.ts';
import { smiSmazat } from '@/lib/pravidla.ts';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const inzerat = await najdiInzerat(slug);
  if (!inzerat) return { title: 'Inzerát nenalezen' };

  return {
    title: inzerat.nazev,
    description: inzerat.popis.slice(0, 155),
    alternates: { canonical: `/inzeraty/${inzerat.slug}` },
  };
}

export default async function DetailInzeratu({ params }: Props) {
  const { slug } = await params;
  const inzerat = await najdiInzerat(slug);
  if (!inzerat) notFound();

  const uzivatel = await prihlasenyUzivatel();

  return (
    <article>
      <h1>{inzerat.nazev}</h1>
      <p className="cena">{inzerat.cena.toLocaleString('cs-CZ')} Kč</p>
      <p>{inzerat.popis}</p>
      <p>Kategorie: {inzerat.kategorie}</p>

      {smiSmazat(uzivatel, inzerat) && (
        <form action={smazInzerat.bind(null, {})}>
          <input type="hidden" name="id" value={inzerat.id} />
          <button type="submit">Smazat inzerát</button>
        </form>
      )}
    </article>
  );
}
