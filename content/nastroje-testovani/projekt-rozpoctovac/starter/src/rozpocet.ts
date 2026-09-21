// Čistá logika rozpočtu. Žádný DOM, žádné úložiště — jen data dovnitř a data ven.

export type Typ = 'prijem' | 'vydaj';

export type Polozka = {
  id: string;
  popis: string;
  castka: number;
  typ: Typ;
  kategorie: string;
  datum: string;
};

export type Prehled = {
  prijmy: number;
  vydaje: number;
  zustatek: number;
};

export type SouhrnKategorie = {
  kategorie: string;
  celkem: number;
};

/** Vypíše částku česky i s měnou: 1290 → „1 290 Kč" (tisíce dělí pevná mezera). */
export function formatujCastku(_castka: number): string {
  throw new Error('formatujCastku zatím není napsaná');
}

/** Měsíc položky ve tvaru RRRR-MM. */
export function mesicPolozky(_polozka: Polozka): string {
  throw new Error('mesicPolozky zatím není napsaná');
}

/** Položky daného měsíce (RRRR-MM) v původním pořadí. */
export function polozkyMesice(_polozky: readonly Polozka[], _mesic: string): Polozka[] {
  throw new Error('polozkyMesice zatím není napsaná');
}

/** Příjmy, výdaje a zůstatek zadaných položek. */
export function prehled(_polozky: readonly Polozka[]): Prehled {
  throw new Error('prehled zatím není napsaná');
}

/** Výdaje sečtené po kategoriích, od největší; při shodě podle české abecedy. */
export function podleKategorii(_polozky: readonly Polozka[]): SouhrnKategorie[] {
  throw new Error('podleKategorii zatím není napsaná');
}

/** Měsíce, ve kterých nějaká položka je, od nejnovějšího, bez opakování. */
export function dostupneMesice(_polozky: readonly Polozka[]): string[] {
  throw new Error('dostupneMesice zatím není napsaná');
}
