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
export function formatujCastku(castka: number): string {
  return `${castka.toLocaleString('cs-CZ')} Kč`;
}

/** Měsíc položky ve tvaru RRRR-MM. */
export function mesicPolozky(polozka: Polozka): string {
  return polozka.datum.slice(0, 7);
}

/** Položky daného měsíce (RRRR-MM) v původním pořadí. */
export function polozkyMesice(polozky: readonly Polozka[], mesic: string): Polozka[] {
  return polozky.filter((polozka) => mesicPolozky(polozka) === mesic);
}

/** Příjmy, výdaje a zůstatek zadaných položek. */
export function prehled(polozky: readonly Polozka[]): Prehled {
  let prijmy = 0;
  let vydaje = 0;
  for (const polozka of polozky) {
    if (polozka.typ === 'prijem') {
      prijmy += polozka.castka;
    } else {
      vydaje += polozka.castka;
    }
  }
  return { prijmy, vydaje, zustatek: prijmy - vydaje };
}

/** Výdaje sečtené po kategoriích, od největší; při shodě podle české abecedy. */
export function podleKategorii(polozky: readonly Polozka[]): SouhrnKategorie[] {
  const soucty = new Map<string, number>();
  for (const polozka of polozky) {
    if (polozka.typ !== 'vydaj') continue;
    soucty.set(polozka.kategorie, (soucty.get(polozka.kategorie) ?? 0) + polozka.castka);
  }
  return [...soucty]
    .map(([kategorie, celkem]) => ({ kategorie, celkem }))
    .sort((a, b) => b.celkem - a.celkem || a.kategorie.localeCompare(b.kategorie, 'cs'));
}

/** Měsíce, ve kterých nějaká položka je, od nejnovějšího, bez opakování. */
export function dostupneMesice(polozky: readonly Polozka[]): string[] {
  return [...new Set(polozky.map(mesicPolozky))].sort().reverse();
}
