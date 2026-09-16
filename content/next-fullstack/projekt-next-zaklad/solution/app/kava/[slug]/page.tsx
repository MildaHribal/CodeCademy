import Link from 'next/link';
import { notFound } from 'next/navigation';

import { formatujCenu, metadataKavy, najdiKavu, vsechnyKavy } from '@/lib/kava';

export function generateStaticParams() {
  return vsechnyKavy().map((kava) => ({ slug: kava.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kava = najdiKavu(slug);

  if (!kava) return { title: 'Káva nenalezena' };

  return metadataKavy(kava);
}

export default async function DetailKavy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kava = najdiKavu(slug);

  if (!kava) notFound();

  return (
    <article className="detail">
      <p className="karta__puvod">{kava.puvod}</p>
      <h1>{kava.nazev}</h1>
      <p className="detail__cena">{formatujCenu(kava.cena)} / 250 g</p>
      <p>{kava.popis}</p>

      <ul className="stitky">
        {kava.chute.map((chut) => (
          <li className="stitek" key={chut}>
            {chut}
          </li>
        ))}
      </ul>

      <p>
        <Link href="/kava">← Zpátky do katalogu</Link>
      </p>
    </article>
  );
}
