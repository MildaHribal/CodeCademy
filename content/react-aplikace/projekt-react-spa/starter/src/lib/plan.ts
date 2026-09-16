import type { Plan } from './types';

export const DAYS = ['po', 'ut', 'st', 'ct', 'pa', 'so', 'ne'] as const;

export const DAY_NAMES: Record<string, string> = {
  po: 'pondělí',
  ut: 'úterý',
  st: 'středa',
  ct: 'čtvrtek',
  pa: 'pátek',
  so: 'sobota',
  ne: 'neděle',
};

/** Prázdný plán: každý den bez jídla. */
export function emptyPlan(): Plan {
  return Object.fromEntries(DAYS.map((day) => [day, []]));
}

/** Přidá recept na daný den. Vrací NOVÝ plán, původní nemění. Dvakrát totéž nepřidá. */
export function addMeal(plan: Plan, day: string, recipeId: number): Plan {
}

/** Odebere recept z daného dne. Vrací NOVÝ plán, původní nemění. */
export function removeMeal(plan: Plan, day: string, recipeId: number): Plan {
}

/** Kolik jídel je v celém plánu. */
export function countMeals(plan: Plan): number {
}
