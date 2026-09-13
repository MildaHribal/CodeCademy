// České texty, které se skládají z dat: typy modulů, skloňování, procenta.

export const MODULE_TYPE_LABELS = {
  lesson: 'Lekce',
  workshop: 'Workshop',
  lab: 'Lab',
  quiz: 'Kvíz',
  project: 'Projekt',
};

/**
 * České skloňování podle počtu: plural(3, ['krok', 'kroky', 'kroků']) → "3 kroky".
 * 1 → první tvar, 2–4 → druhý, 0 a 5+ → třetí.
 */
export function plural(count, [one, few, many]) {
  const form = count === 1 ? one : count >= 2 && count <= 4 ? few : many;
  return `${count} ${form}`;
}

export const steps = (n) => plural(n, ['krok', 'kroky', 'kroků']);
export const questions = (n) => plural(n, ['otázka', 'otázky', 'otázek']);
export const modules = (n) => plural(n, ['modul', 'moduly', 'modulů']);

export const percent = (fraction) => `${Math.round(fraction * 100)} %`;

export const minutes = (m) => (m ? `${m} min` : null);
