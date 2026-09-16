import { describe, expect, it } from 'vitest';

import { smiSmazat, smiUpravit, UZAMCENO } from './pravidla.ts';

const eva = { id: 'eva', role: 'uzivatel' } as const;
const petr = { id: 'petr', role: 'uzivatel' } as const;
const admin = { id: 'sarka', role: 'admin' } as const;
const inzeratEvy = { autorId: 'eva', stav: 'aktivni' };

describe('smiUpravit', () => {
  it('pustí vlastníka', () => {
    expect(smiUpravit(eva, inzeratEvy)).toBe(true);
  });

  it('nepustí cizího uživatele', () => {
    expect(smiUpravit(petr, inzeratEvy)).toBe(false);
  });

  it('pustí admina i k cizímu záznamu', () => {
    expect(smiUpravit(admin, inzeratEvy)).toBe(true);
  });

  it('nepustí nikoho, když chybí uživatel nebo záznam', () => {
    expect(smiUpravit(null, inzeratEvy)).toBe(false);
    expect(smiUpravit(eva, null)).toBe(false);
    expect(smiUpravit(null, {})).toBe(false);
  });

  it('nepustí nikoho k záznamu bez autora', () => {
    expect(smiUpravit(eva, { stav: 'aktivni' })).toBe(false);
  });
});

describe('smiSmazat', () => {
  it('pustí vlastníka u běžného záznamu', () => {
    expect(smiSmazat(eva, inzeratEvy)).toBe(true);
  });

  it('nepustí vlastníka u uzamčeného záznamu', () => {
    expect(smiSmazat(eva, { autorId: 'eva', stav: UZAMCENO })).toBe(false);
  });

  it('admina pustí i k uzamčenému záznamu', () => {
    expect(smiSmazat(admin, { autorId: 'eva', stav: UZAMCENO })).toBe(true);
  });

  it('nepustí cizího uživatele ani nepřihlášeného', () => {
    expect(smiSmazat(petr, inzeratEvy)).toBe(false);
    expect(smiSmazat(null, inzeratEvy)).toBe(false);
  });
});
