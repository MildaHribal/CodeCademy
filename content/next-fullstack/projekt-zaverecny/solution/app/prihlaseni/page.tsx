import type { Metadata } from 'next';

import { PrihlasovaciFormular } from './PrihlasovaciFormular.tsx';

export const metadata: Metadata = { title: 'Přihlášení' };

export default function Prihlaseni() {
  return (
    <>
      <h1>Přihlášení</h1>
      <p>Bez přihlášení si můžeš nabídku prohlížet, ale nic přidat.</p>
      <PrihlasovaciFormular />
    </>
  );
}
