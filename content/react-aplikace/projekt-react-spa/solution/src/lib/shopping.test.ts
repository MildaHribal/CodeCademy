import { describe, expect, test } from 'vitest';
import { shoppingList } from './shopping';
import type { Plan, Recipe } from './types';

const recipes: Recipe[] = [
  { id: 1, name: 'Čočka', tag: 'bezmasa', minutes: 60, portions: 4, ingredients: [{ name: 'čočka', amount: 0.5, unit: 'kg' }, { name: 'cibule', amount: 2, unit: 'ks' }] },
  { id: 2, name: 'Houbový kuba', tag: 'bezmasa', minutes: 70, portions: 4, ingredients: [{ name: 'houby', amount: 0.3, unit: 'kg' }, { name: 'cibule', amount: 1, unit: 'ks' }] },
  { id: 3, name: 'Chlebíčky', tag: 'bezmasa', minutes: 45, portions: 6, ingredients: [{ name: 'chléb', amount: 1, unit: 'ks' }] },
];

const plan: Plan = { po: [1], ut: [2], st: [3], ct: [], pa: [], so: [], ne: [] };

describe('shoppingList', () => {
  test('sloučí stejné suroviny a sečte množství', () => {
    const items = shoppingList(plan, recipes, 4);
    expect(items.find((item) => item.name === 'cibule')).toEqual({ name: 'cibule', amount: 3, unit: 'ks' });
  });

  test('přepočítá množství na počet strávníků', () => {
    const items = shoppingList({ po: [1] }, recipes, 2);
    expect(items.find((item) => item.name === 'čočka')?.amount).toBe(0.3);
  });

  test('řadí podle české abecedy', () => {
    expect(shoppingList(plan, recipes, 4).map((item) => item.name)).toEqual(['cibule', 'čočka', 'houby', 'chléb']);
  });

  test('neznámé id receptu přeskočí a prázdný plán dá prázdný seznam', () => {
    expect(shoppingList({ po: [99] }, recipes, 4)).toEqual([]);
    expect(shoppingList({}, recipes, 4)).toEqual([]);
  });
});
