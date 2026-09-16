import { NextResponse, type NextRequest } from 'next/server';

/**
 * Rychlá výhybka, ne ochranka: jen se podívá, jestli vůbec existuje cookie
 * se session, a nepřihlášeného pošle na přihlášení. Skutečná kontrola
 * („smí tenhle uživatel zrovna tohle") je ve stránkách a v akcích.
 */
export function proxy(request: NextRequest) {
  const maSession = request.cookies.has('better-auth.session_token');
  if (maSession) return NextResponse.next();

  const cil = new URL('/prihlaseni', request.url);
  cil.searchParams.set('pokracovat', request.nextUrl.pathname);
  return NextResponse.redirect(cil);
}

export const config = {
  matcher: ['/moje/:path*', '/inzeraty/novy'],
};
