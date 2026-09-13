// Úpravy zdrojového textu podle pozic z AST — bez přeformátování zbytku kódu.

/**
 * Edit je buď vložení (`start === end`), nebo náhrada úseku `start..end`.
 * Pořadí vložení na stejné pozici určuje `rank` (menší dřív).
 *
 * @param {string} source
 * @param {Array<{ start: number, end: number, text: string, rank?: number }>} edits
 */
export function applyEdits(source, edits) {
  const sorted = [...edits].sort((a, b) => a.start - b.start || (a.rank ?? 0) - (b.rank ?? 0));
  let output = '';
  let cursor = 0;
  for (const edit of sorted) {
    if (edit.start < cursor) continue; // překryv by rozbil kód — takový edit vynecháme
    output += source.slice(cursor, edit.start) + edit.text;
    cursor = edit.end;
  }
  return output + source.slice(cursor);
}
