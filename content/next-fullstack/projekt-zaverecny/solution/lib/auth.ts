import 'server-only';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';

import { db } from './db.ts';
import type { Uzivatel } from './pravidla.ts';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite' }),
  emailAndPassword: { enabled: true },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'uzivatel', input: false } } },
  plugins: [nextCookies()],
});

/** Přihlášený uživatel, nebo `null`. Funguje ve stránce, v akci i v route handleru. */
export async function prihlasenyUzivatel(): Promise<Uzivatel | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  return { id: session.user.id, role: session.user.role === 'admin' ? 'admin' : 'uzivatel' };
}
