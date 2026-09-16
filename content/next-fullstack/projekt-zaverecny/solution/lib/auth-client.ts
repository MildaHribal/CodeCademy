import { createAuthClient } from 'better-auth/react';

/** Klientská polovina přihlášení. Žádné tajemství tu není — jen adresa serveru. */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000',
});
