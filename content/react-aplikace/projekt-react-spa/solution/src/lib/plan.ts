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

/** Přidá recept na daný den. Vrací nový plán, původní nemění. Dvakrát totéž nepřidá. */
export function addMeal(plan: Plan, day: string, recipeId: number): Plan {
  const meals = plan[day] ?? [];
  if (meals.includes(recipeId)) return plan;
  return { ...plan, [day]: [...meals, recipeId] };
}

/** Odebere recept z daného dne. Vrací nový plán, původní nemění. */
export function removeMeal(plan: Plan, day: string, recipeId: number): Plan {
  const meals = plan[day] ?? [];
  if (!meals.includes(recipeId)) return plan;
  return { ...plan, [day]: meals.filter((id) => id !== recipeId) };
}

/** Kolik jídel je v celém plánu. */
export function countMeals(plan: Plan): number {
  return Object.values(plan).reduce((sum, meals) => sum + meals.length, 0);
}
