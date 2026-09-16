import 'server-only';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { db } from './db.ts';
import type { Uzivatel } from './pravidla.ts';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite' }),
  emailAndPassword: { enabled: true },
  // `input: false` = roli nejde nastavit z registračního formuláře.
  user: { additionalFields: { role: { type: 'string', defaultValue: 'uzivatel', input: false } } },
  plugins: [nextCookies()],
});

/** Přihlášený uživatel, nebo `null`. Funguje ve stránce, v akci i v route handleru. */
export async function prihlasenyUzivatel(): Promise<Uzivatel | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  return { id: session.user.id, role: session.user.role === 'admin' ? 'admin' : 'uzivatel' };
}

/**
 * Totéž, ale nepřihlášeného rovnou pošle na přihlášení. Používej ji všude,
 * kde by pokračování bez uživatele nedávalo smysl — chráněná stránka i akce.
 */
export async function vyzadujUzivatele(): Promise<Uzivatel> {
  const uzivatel = await prihlasenyUzivatel();
  if (!uzivatel) redirect('/prihlaseni');

  return uzivatel;
}
