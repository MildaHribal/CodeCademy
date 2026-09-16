import type { Recipe, RecipeFilter } from './types';

/** Porovnání bez ohledu na velikost písmen a mezery okolo. */
function normalize(text: string): string {
  return text.trim().toLocaleLowerCase('cs');
}

/**
 * Zúží nabídku receptů podle hledaného textu, štítku a nejdelšího přípustného času.
 * Text se hledá v názvu i mezi surovinami. Prázdná hodnota a štítek `vse` nefiltrují.
 */
export function filterRecipes(recipes: Recipe[], filter: RecipeFilter = {}): Recipe[] {
  const query = normalize(filter.query ?? '');
  const tag = filter.tag ?? '';

  return recipes.filter((recipe) => {
    if (tag && tag !== 'vse' && recipe.tag !== tag) return false;
    if (typeof filter.maxMinutes === 'number' && recipe.minutes > filter.maxMinutes) return false;
    if (!query) return true;

    return (
      normalize(recipe.name).includes(query) ||
      recipe.ingredients.some((ingredient) => normalize(ingredient.name).includes(query))
    );
  });
}

/** „150 minut" jako „2 h 30 min", kratší časy jen v minutách. */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
