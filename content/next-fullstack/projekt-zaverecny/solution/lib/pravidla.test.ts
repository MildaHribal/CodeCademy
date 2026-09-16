import { describe, expect, it } from 'vitest';

import { smiSmazat, smiUpravit } from './pravidla.ts';

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
});

describe('smiSmazat', () => {
  it('pustí vlastníka u aktivního záznamu', () => {
    expect(smiSmazat(eva, inzeratEvy)).toBe(true);
  });

  it('nepustí vlastníka u rezervovaného záznamu', () => {
    expect(smiSmazat(eva, { autorId: 'eva', stav: 'rezervovano' })).toBe(false);
  });

  it('admina pustí i u rezervovaného záznamu', () => {
    expect(smiSmazat(admin, { autorId: 'eva', stav: 'rezervovano' })).toBe(true);
  });
});
