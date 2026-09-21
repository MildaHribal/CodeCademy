import { describe, expect, test } from 'vitest';

import { KLIC, nacti, uloz, type Uloziste } from './uloziste.ts';
import type { Polozka } from './rozpocet.ts';

function pameti(data: Record<string, string> = {}): Uloziste & { data: Record<string, string> } {
  return {
    data,
    getItem: (klic) => data[klic] ?? null,
    setItem: (klic, hodnota) => {
      data[klic] = hodnota;
    },
  };
}

const najem: Polozka = {
  id: 'P-9',
  popis: 'Nájem za září',
  castka: 12000,
  typ: 'vydaj',
  kategorie: 'Bydlení',
  datum: '2026-09-01',
};

describe('nacti', () => {
  test('přečte uložené položky', () => {
    const uloziste = pameti({ [KLIC]: JSON.stringify([najem]) });
    expect(nacti(uloziste)).toEqual([najem]);
  });

  test('prázdné úložiště znamená prázdný rozpočet', () => {
    expect(nacti(pameti())).toEqual([]);
  });

  test('poškozený obsah úložiště nespadne', () => {
    expect(nacti(pameti({ [KLIC]: '{tohle není JSON' }))).toEqual([]);
    expect(nacti(pameti({ [KLIC]: '"jen text"' }))).toEqual([]);
  });
});

describe('uloz', () => {
  test('zapíše položky tak, že je nacti přečte zpátky', () => {
    const uloziste = pameti();
    uloz(uloziste, [najem]);
    expect(nacti(uloziste)).toEqual([najem]);
  });

  test('uložení prázdného rozpočtu přepíše dřívější obsah', () => {
    const uloziste = pameti({ [KLIC]: JSON.stringify([najem]) });
    uloz(uloziste, []);
    expect(nacti(uloziste)).toEqual([]);
  });
});
