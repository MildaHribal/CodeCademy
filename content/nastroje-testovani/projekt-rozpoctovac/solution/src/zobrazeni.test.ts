import { beforeEach, describe, expect, test } from 'vitest';

import { vykresliRozpocet } from './zobrazeni.ts';
import type { Polozka } from './rozpocet.ts';

const KOSTRA = `
  <dl>
    <dd id="prijmy"></dd>
    <dd id="vydaje"></dd>
    <dd id="zustatek"></dd>
  </dl>
  <p id="prazdno" hidden></p>
  <ul id="polozky"></ul>
  <ul id="souhrn"></ul>
`;

beforeEach(() => {
  document.body.innerHTML = KOSTRA;
});

const zari: Polozka[] = [
  {
    id: 'P-1',
    popis: 'Mzda za srpen',
    castka: 32000,
    typ: 'prijem',
    kategorie: 'Mzda',
    datum: '2026-09-11',
  },
  {
    id: 'P-2',
    popis: 'Nájem za září',
    castka: 12000,
    typ: 'vydaj',
    kategorie: 'Bydlení',
    datum: '2026-09-01',
  },
  {
    id: 'P-3',
    popis: 'Nákup v Lidlu',
    castka: 640,
    typ: 'vydaj',
    kategorie: 'Potraviny',
    datum: '2026-09-04',
  },
  {
    id: 'P-4',
    popis: 'Tramvajenka',
    castka: 1000,
    typ: 'vydaj',
    kategorie: 'Doprava',
    datum: '2026-08-28',
  },
];

describe('vykresliRozpocet', () => {
  test('vypíše přehled zvoleného měsíce', () => {
    vykresliRozpocet(document, zari, '2026-09');
    expect(document.querySelector('#prijmy')?.textContent).toBe('32 000 Kč');
    expect(document.querySelector('#vydaje')?.textContent).toBe('12 640 Kč');
    expect(document.querySelector('#zustatek')?.textContent).toBe('19 360 Kč');
  });

  test('vypíše položky měsíce v původním pořadí', () => {
    vykresliRozpocet(document, zari, '2026-09');
    const radky = [...document.querySelectorAll('#polozky > li')];
    expect(radky.map((radek) => radek.getAttribute('data-id'))).toEqual(['P-1', 'P-2', 'P-3']);
    expect(radky[0]?.textContent).toContain('Mzda za srpen');
    expect(radky[1]?.textContent).toContain('12 000 Kč');
  });

  test('prázdný měsíc ukáže hlášku a žádné položky', () => {
    vykresliRozpocet(document, zari, '2026-01');
    expect(document.querySelectorAll('#polozky > li')).toHaveLength(0);
    expect((document.querySelector('#prazdno') as HTMLElement).hidden).toBe(false);
  });

  test('kategorie výdajů jsou od největší částky', () => {
    vykresliRozpocet(document, zari, '2026-09');
    const radky = [...document.querySelectorAll('#souhrn > li')];
    expect(radky.map((radek) => radek.getAttribute('data-kategorie'))).toEqual([
      'Bydlení',
      'Potraviny',
    ]);
  });
});
