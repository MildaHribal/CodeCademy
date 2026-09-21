// Čtení a zápis položek. Úložiště dostane funkce zvenku, aby šlo v testu nahradit.

import type { Polozka } from './rozpocet.ts';

export const KLIC = 'rozpocet-polozky';

export type Uloziste = {
  getItem(klic: string): string | null;
  setItem(klic: string, hodnota: string): void;
};

/** Načte položky z úložiště. Prázdné i poškozené úložiště znamená prázdný rozpočet. */
export function nacti(uloziste: Uloziste): Polozka[] {
  const text = uloziste.getItem(KLIC);
  if (text === null) return [];
  try {
    const data: unknown = JSON.parse(text);
    return Array.isArray(data) ? (data as Polozka[]) : [];
  } catch {
    return [];
  }
}

/** Uloží položky do úložiště pod klíč KLIC. */
export function uloz(uloziste: Uloziste, polozky: readonly Polozka[]): void {
  uloziste.setItem(KLIC, JSON.stringify(polozky));
}
