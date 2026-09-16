import type { Metadata } from 'next';

import { vsechnyKavy } from '@/lib/kava';
import { Katalog } from './_components/Katalog';

export const metadata: Metadata = {
  title: 'Katalog',
  description: 'Všechny kávy, které právě pražíme. Filtruj podle druhu i podle původu.',
  alternates: { canonical: '/kava' },
};

export default function StrankaKatalogu() {
  const kavy = vsechnyKavy();

  return (
    <>
      <h1>Katalog</h1>
      <p className="perex">
        Právě pražíme {kavy.length} káv. Seznam se vykresluje na serveru, takže ho vidí i vyhledávač.
      </p>

      <Katalog kavy={kavy} />
    </>
  );
}
