import { describe, expect, it } from 'vitest';

import { chybyPoli, ukazkovyZaznam, ZaznamSchema } from './schemata.ts';

describe('ZaznamSchema', () => {
  it('pustí ukázková data a převede cenu na číslo', () => {
    const vysledek = ZaznamSchema.safeParse(ukazkovyZaznam);
    expect(vysledek.success).toBe(true);
    expect(vysledek.data?.cena).toBe(7500);
  });

  it('odmítne prázdný formulář a popíše každé pole česky', () => {
    const vysledek = ZaznamSchema.safeParse({});
    expect(vysledek.success).toBe(false);
    const chyby = chybyPoli(vysledek.error!);
    expect(Object.keys(chyby).length).toBeGreaterThanOrEqual(3);
    expect(chyby.nazev?.[0]).toMatch(/\.$/);
  });

  it('odmítne zápornou i necelou cenu', () => {
    expect(ZaznamSchema.safeParse({ ...ukazkovyZaznam, cena: '-5' }).success).toBe(false);
    expect(ZaznamSchema.safeParse({ ...ukazkovyZaznam, cena: '12.5' }).success).toBe(false);
  });

  it('odmítne kategorii mimo seznam', () => {
    expect(ZaznamSchema.safeParse({ ...ukazkovyZaznam, kategorie: 'letadla' }).success).toBe(false);
  });
});
