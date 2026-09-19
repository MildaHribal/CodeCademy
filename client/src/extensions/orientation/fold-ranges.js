
export const MIN_FOLD_LINES = 6;
export const CONTEXT_LINES = 2;

export function foldRanges(region, lineCount) {
  const out = [];
  const beforeEnd = region.start - 1 - CONTEXT_LINES;
  if (beforeEnd >= MIN_FOLD_LINES) out.push({ fromLine: 1, toLine: beforeEnd });
  const afterStart = Math.max(region.end, region.start - 1) + 1 + CONTEXT_LINES;
  if (lineCount - afterStart + 1 >= MIN_FOLD_LINES) out.push({ fromLine: afterStart, toLine: lineCount });
  return out;
}
