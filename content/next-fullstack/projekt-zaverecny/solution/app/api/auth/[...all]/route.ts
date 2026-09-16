import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@/lib/auth.ts';

// Jediný route handler v aplikaci: přihlášení potřebuje skutečné adresy HTTP.
export const { GET, POST } = toNextJsHandler(auth);
