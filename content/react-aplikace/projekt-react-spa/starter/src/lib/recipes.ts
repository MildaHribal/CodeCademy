import type { Recipe, RecipeFilter } from './types';

/**
 * Zúží nabídku receptů podle hledaného textu, štítku a nejdelšího přípustného času.
 * Text se hledá v názvu i mezi surovinami, nekouká na velikost písmen ani na mezery
 * okolo. Prázdná hodnota a štítek `vse` nefiltrují nic.
 */
export function filterRecipes(recipes: Recipe[], filter: RecipeFilter = {}): Recipe[] {
}

/** Čas přípravy pro člověka: 40 → „40 min", 120 → „2 h", 150 → „2 h 30 min". */
export function formatMinutes(minutes: number): string {
}
