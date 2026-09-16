'use server';

import { eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';

import { prihlasenyUzivatel } from './auth.ts';
import { db } from './db.ts';
import { smiSmazat, smiUpravit } from './pravidla.ts';
import { inzeraty } from './schema.ts';
import { chybyPoli, ZaznamSchema } from './schemata.ts';

export type StavAkce = {
  chyba?: string;
  chybyPoli?: Record<string, string[] | undefined>;
  hodnoty?: Record<string, string>;
};

const naSlug = (nazev: string) =>
  nazev
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export async function vytvorInzerat(_stav: StavAkce, formData: FormData): Promise<StavAkce> {
  const uzivatel = await prihlasenyUzivatel();
  if (!uzivatel) return { chyba: 'Musíš být přihlášený.' };

  const hodnoty = Object.fromEntries(formData) as Record<string, string>;
  const vysledek = ZaznamSchema.safeParse(hodnoty);
  if (!vysledek.success) return { chybyPoli: chybyPoli(vysledek.error), hodnoty };

  const { nazev, popis, cena, kategorie } = vysledek.data;
  const slug = `${naSlug(nazev)}-${Date.now().toString(36)}`;

  await db.insert(inzeraty).values({
    id: crypto.randomUUID(),
    slug,
    nazev,
    popis,
    cena,
    kategorie,
    stav: 'aktivni',
    autorId: uzivatel.id,
    vytvoreno: new Date(),
  });

  updateTag('inzeraty');
  redirect(`/inzeraty/${slug}`);
}

export async function upravInzerat(_stav: StavAkce, formData: FormData): Promise<StavAkce> {
  const uzivatel = await prihlasenyUzivatel();
  if (!uzivatel) return { chyba: 'Musíš být přihlášený.' };

  const id = String(formData.get('id') ?? '');
  const [inzerat] = await db.select().from(inzeraty).where(eq(inzeraty.id, id)).limit(1);
  if (!inzerat) return { chyba: 'Inzerát neexistuje.' };
  if (!smiUpravit(uzivatel, inzerat)) return { chyba: 'Tenhle inzerát není tvůj.' };

  const hodnoty = Object.fromEntries(formData) as Record<string, string>;
  const vysledek = ZaznamSchema.safeParse(hodnoty);
  if (!vysledek.success) return { chybyPoli: chybyPoli(vysledek.error), hodnoty };

  await db.update(inzeraty).set(vysledek.data).where(eq(inzeraty.id, id));

  updateTag('inzeraty');
  redirect(`/inzeraty/${inzerat.slug}`);
}

export async function smazInzerat(_stav: StavAkce, formData: FormData): Promise<StavAkce> {
  const uzivatel = await prihlasenyUzivatel();
  if (!uzivatel) return { chyba: 'Musíš být přihlášený.' };

  const id = String(formData.get('id') ?? '');
  const [inzerat] = await db.select().from(inzeraty).where(eq(inzeraty.id, id)).limit(1);
  if (!inzerat) return { chyba: 'Inzerát neexistuje.' };
  if (!smiSmazat(uzivatel, inzerat)) return { chyba: 'Tenhle inzerát smazat nemůžeš.' };

  await db.delete(inzeraty).where(eq(inzeraty.id, id));

  updateTag('inzeraty');
  redirect('/inzeraty');
}
