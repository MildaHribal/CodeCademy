// Čtení a zápis položek. Úložiště dostane funkce zvenku, aby šlo v testu nahradit.

import type { Polozka } from './rozpocet.ts';

export const KLIC = 'rozpocet-polozky';

export type Uloziste = {
  getItem(klic: string): string | null;
  setItem(klic: string, hodnota: string): void;
};

/** Načte položky z úložiště. Prázdné i poškozené úložiště znamená prázdný rozpočet. */
export function nacti(_uloziste: Uloziste): Polozka[] {
  throw new Error('nacti zatím není napsaná');
}

/** Uloží položky do úložiště pod klíč KLIC. */
export function uloz(_uloziste: Uloziste, _polozky: readonly Polozka[]): void {
  throw new Error('uloz zatím není napsaná');
}
