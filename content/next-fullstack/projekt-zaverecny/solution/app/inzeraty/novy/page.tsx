import type { Metadata } from 'next';

import { vyzadujUzivatele } from '@/lib/auth.ts';
import { FormularInzeratu } from './FormularInzeratu.tsx';

export const metadata: Metadata = { title: 'Nový inzerát' };

export default async function NovyInzerat() {
  // Nepřihlášeného pošle na /prihlaseni dřív, než se cokoli vykreslí.
  await vyzadujUzivatele();

  return (
    <>
      <h1>Nový inzerát</h1>
      <FormularInzeratu />
    </>
  );
}
