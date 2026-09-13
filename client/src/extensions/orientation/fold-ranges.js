// Které řádky kolem oblasti `--edit--` sbalit — čistý výpočet bez editoru a DOM
// (testuje tools/orientation-unit.test.js, používá orientation/fold.js).

/** Nejmenší počet řádků, který se vyplatí sbalit (kratší úsek se nechá být). */
export const MIN_FOLD_LINES = 6;
/** Kolik řádků těsně u oblasti zůstane vidět jako kontext. */
export const CONTEXT_LINES = 2;

/**
 * Úseky ke sbalení v 1-based řádcích.
 * @param {{ start: number, end: number }} region  oblast z parseru (prázdná má end = start - 1)
 * @param {number} lineCount  počet řádků dokumentu
 * @returns {{ fromLine: number, toLine: number }[]}
 */
export function foldRanges(region, lineCount) {
  const out = [];
  const beforeEnd = region.start - 1 - CONTEXT_LINES;
  if (beforeEnd >= MIN_FOLD_LINES) out.push({ fromLine: 1, toLine: beforeEnd });
  const afterStart = Math.max(region.end, region.start - 1) + 1 + CONTEXT_LINES;
  if (lineCount - afterStart + 1 >= MIN_FOLD_LINES) out.push({ fromLine: afterStart, toLine: lineCount });
  return out;
}
