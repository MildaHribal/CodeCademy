import { describe, expect, test } from 'vitest';
import { addMeal, countMeals, emptyPlan, removeMeal } from './plan';

describe('plán', () => {
  test('prázdný plán má sedm dní bez jídla', () => {
    expect(countMeals(emptyPlan())).toBe(0);
    expect(Object.keys(emptyPlan())).toHaveLength(7);
  });

  test('addMeal vrací nový plán a původní nemění', () => {
    const plan = emptyPlan();
    const next = addMeal(plan, 'po', 3);
    expect(next.po).toEqual([3]);
    expect(plan.po).toEqual([]);
    expect(next).not.toBe(plan);
  });

  test('addMeal nepřidá totéž dvakrát', () => {
    const plan = addMeal(emptyPlan(), 'po', 3);
    expect(addMeal(plan, 'po', 3).po).toEqual([3]);
  });

  test('removeMeal odebere jen daný recept v daném dni', () => {
    let plan = addMeal(emptyPlan(), 'po', 3);
    plan = addMeal(plan, 'po', 5);
    plan = addMeal(plan, 'ut', 3);
    const next = removeMeal(plan, 'po', 3);
    expect(next.po).toEqual([5]);
    expect(next.ut).toEqual([3]);
  });

  test('countMeals sečte celý týden', () => {
    let plan = addMeal(emptyPlan(), 'po', 1);
    plan = addMeal(plan, 'st', 2);
    plan = addMeal(plan, 'st', 3);
    expect(countMeals(plan)).toBe(3);
  });
});
