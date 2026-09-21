import { describe, expect, test } from 'vitest';

import {
  dostupneMesice,
  formatujCastku,
  podleKategorii,
  polozkyMesice,
  prehled,
  type Polozka,
} from './rozpocet.ts';

function polozka(zmeny: Partial<Polozka> = {}): Polozka {
  return {
    id: 'P-1',
    popis: 'Nákup v Lidlu',
    castka: 640,
    typ: 'vydaj',
    kategorie: 'Potraviny',
    datum: '2026-09-04',
    ...zmeny,
  };
}

describe('formatujCastku', () => {
  test('tisíce odděluje pevnou mezerou', () => {
    expect(formatujCastku(1290)).toBe('1 290 Kč');
    expect(formatujCastku(1234567)).toBe('1 234 567 Kč');
  });

  test('malé částky a nula zůstanou beze změny', () => {
    expect(formatujCastku(950)).toBe('950 Kč');
    expect(formatujCastku(0)).toBe('0 Kč');
  });

  test('záporný zůstatek má minus', () => {
    expect(formatujCastku(-1290)).toBe('-1 290 Kč');
  });
});

describe('polozkyMesice', () => {
  test('vybere jen položky daného měsíce a zachová pořadí', () => {
    const vsechny = [
      polozka({ id: 'P-1', datum: '2026-09-04' }),
      polozka({ id: 'P-2', datum: '2026-08-30' }),
      polozka({ id: 'P-3', datum: '2026-09-30' }),
    ];
    expect(polozkyMesice(vsechny, '2026-09').map((p) => p.id)).toEqual(['P-1', 'P-3']);
  });

  test('měsíc bez položek vrátí prázdné pole a vstup nezmění', () => {
    const vsechny = [polozka()];
    const kopie = structuredClone(vsechny);
    expect(polozkyMesice(vsechny, '2026-01')).toEqual([]);
    expect(vsechny).toEqual(kopie);
  });
});

describe('prehled', () => {
  test('sečte příjmy, výdaje a spočítá zůstatek', () => {
    const vsechny = [
      polozka({ id: 'P-1', typ: 'prijem', castka: 32000, kategorie: 'Mzda' }),
      polozka({ id: 'P-2', castka: 640 }),
      polozka({ id: 'P-3', castka: 12000, kategorie: 'Bydlení' }),
    ];
    expect(prehled(vsechny)).toEqual({ prijmy: 32000, vydaje: 12640, zustatek: 19360 });
  });

  test('prázdný měsíc má samé nuly', () => {
    expect(prehled([])).toEqual({ prijmy: 0, vydaje: 0, zustatek: 0 });
  });

  test('zůstatek smí být záporný', () => {
    const vsechny = [
      polozka({ id: 'P-1', typ: 'prijem', castka: 1000, kategorie: 'Mzda' }),
      polozka({ id: 'P-2', castka: 2500 }),
    ];
    expect(prehled(vsechny).zustatek).toBe(-1500);
  });
});

describe('podleKategorii', () => {
  test('sečte jen výdaje a seřadí je od největšího', () => {
    const vsechny = [
      polozka({ id: 'P-1', castka: 640, kategorie: 'Potraviny' }),
      polozka({ id: 'P-2', castka: 12000, kategorie: 'Bydlení' }),
      polozka({ id: 'P-3', castka: 360, kategorie: 'Potraviny' }),
      polozka({ id: 'P-4', typ: 'prijem', castka: 32000, kategorie: 'Mzda' }),
    ];
    expect(podleKategorii(vsechny)).toEqual([
      { kategorie: 'Bydlení', celkem: 12000 },
      { kategorie: 'Potraviny', celkem: 1000 },
    ]);
  });

  test('při shodné částce řadí podle české abecedy', () => {
    const vsechny = [
      polozka({ id: 'P-1', castka: 500, kategorie: 'Doprava' }),
      polozka({ id: 'P-2', castka: 500, kategorie: 'Čaj a káva' }),
      polozka({ id: 'P-3', castka: 500, kategorie: 'Cukrovinky' }),
    ];
    expect(podleKategorii(vsechny).map((s) => s.kategorie)).toEqual([
      'Cukrovinky',
      'Čaj a káva',
      'Doprava',
    ]);
  });
});

describe('dostupneMesice', () => {
  test('vrátí měsíce bez opakování od nejnovějšího', () => {
    const vsechny = [
      polozka({ id: 'P-1', datum: '2026-08-30' }),
      polozka({ id: 'P-2', datum: '2026-09-04' }),
      polozka({ id: 'P-3', datum: '2026-09-30' }),
      polozka({ id: 'P-4', datum: '2025-12-24' }),
    ];
    expect(dostupneMesice(vsechny)).toEqual(['2026-09', '2026-08', '2025-12']);
  });

  test('prázdný rozpočet nemá žádný měsíc', () => {
    expect(dostupneMesice([])).toEqual([]);
  });
});
