import type { Plan, Recipe, ShoppingItem } from './types';

/**
 * Nákupní seznam odvozený z týdenního plánu.
 * Množství každé suroviny přepočítá na `people` strávníků (recept je psaný na
 * `recipe.portions` porcí), sloučí stejné suroviny se stejnou jednotkou,
 * zaokrouhlí na jedno desetinné místo a seřadí podle české abecedy.
 * Neznámá id receptů přeskočí.
 */
export function shoppingList(plan: Plan, recipes: Recipe[], people: number): ShoppingItem[] {
}
