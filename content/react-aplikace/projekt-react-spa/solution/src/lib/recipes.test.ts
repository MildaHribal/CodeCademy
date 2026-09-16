import { describe, expect, test } from 'vitest';
import { filterRecipes, formatMinutes } from './recipes';
import type { Recipe } from './types';

const recipes: Recipe[] = [
  { id: 1, name: 'Čočka na kyselo', tag: 'bezmasa', minutes: 60, portions: 4, ingredients: [{ name: 'čočka', amount: 0.5, unit: 'kg' }, { name: 'cibule', amount: 2, unit: 'ks' }] },
  { id: 2, name: 'Candát na másle', tag: 'ryba', minutes: 40, portions: 2, ingredients: [{ name: 'candát', amount: 0.5, unit: 'kg' }] },
  { id: 3, name: 'Znojemská pečeně', tag: 'maso', minutes: 120, portions: 4, ingredients: [{ name: 'cibule', amount: 2, unit: 'ks' }] },
];

describe('filterRecipes', () => {
  test('bez filtru vrátí všechno', () => {
    expect(filterRecipes(recipes, {})).toHaveLength(3);
  });

  test('hledá v názvu i v surovinách a nekouká na velikost písmen', () => {
    expect(filterRecipes(recipes, { query: 'ČOČKA' }).map((r) => r.id)).toEqual([1]);
    expect(filterRecipes(recipes, { query: '  cibule ' }).map((r) => r.id)).toEqual([1, 3]);
  });

  test('štítek vse nefiltruje', () => {
    expect(filterRecipes(recipes, { tag: 'vse' })).toHaveLength(3);
    expect(filterRecipes(recipes, { tag: 'ryba' }).map((r) => r.id)).toEqual([2]);
  });

  test('podmínky platí zároveň', () => {
    expect(filterRecipes(recipes, { query: 'cibule', maxMinutes: 90 }).map((r) => r.id)).toEqual([1]);
    expect(filterRecipes(recipes, { query: 'kajak' })).toEqual([]);
  });
});

describe('formatMinutes', () => {
  test('krátké časy v minutách, delší v hodinách', () => {
    expect(formatMinutes(40)).toBe('40 min');
    expect(formatMinutes(120)).toBe('2 h');
    expect(formatMinutes(150)).toBe('2 h 30 min');
  });
});
