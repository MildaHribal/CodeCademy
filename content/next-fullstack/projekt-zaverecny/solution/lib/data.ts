import 'server-only';

import { desc, eq } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';

import { db } from './db.ts';
import { inzeraty } from './schema.ts';

/** Veřejný seznam inzerátů. Pro všechny stejný, takže se dá uložit do cache. */
export async function vsechnyInzeraty() {
  'use cache';
  cacheLife('hours');
  cacheTag('inzeraty');

  return db.select().from(inzeraty).orderBy(desc(inzeraty.vytvoreno));
}

export async function najdiInzerat(slug: string) {
  'use cache';
  cacheLife('hours');
  cacheTag('inzeraty');

  const [nalezeny] = await db.select().from(inzeraty).where(eq(inzeraty.slug, slug)).limit(1);
  return nalezeny;
}

/** Inzeráty přihlášeného uživatele — osobní data, takže bez cache. */
export async function inzeratyUzivatele(autorId: string) {
  return db.select().from(inzeraty).where(eq(inzeraty.autorId, autorId)).orderBy(desc(inzeraty.vytvoreno));
}
