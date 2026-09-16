import type { Plan, Recipe, ShoppingItem } from './types';

/** Zaokrouhlení na jedno desetinné místo, ať v seznamu nejsou čísla jako 0.30000000000000004. */
function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Nákupní seznam odvozený z týdenního plánu.
 * Množství každé suroviny přepočítá na `people` strávníků, sloučí stejné suroviny
 * se stejnou jednotkou a seřadí je podle české abecedy. Neznámá id receptů přeskočí.
 */
export function shoppingList(plan: Plan, recipes: Recipe[], people: number): ShoppingItem[] {
  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const merged = new Map<string, ShoppingItem>();

  for (const meals of Object.values(plan)) {
    for (const recipeId of meals) {
      const recipe = byId.get(recipeId);
      if (!recipe) continue;

      const ratio = people / recipe.portions;
      for (const ingredient of recipe.ingredients) {
        const key = `${ingredient.name}|${ingredient.unit}`;
        const found = merged.get(key);
        if (found) found.amount += ingredient.amount * ratio;
        else merged.set(key, { ...ingredient, amount: ingredient.amount * ratio });
      }
    }
  }

  return [...merged.values()]
    .map((item) => ({ ...item, amount: round(item.amount) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
}
