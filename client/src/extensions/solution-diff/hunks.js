// Příprava porovnání souborů pro zobrazení, bez DOM (testuje tools/solution-diff-unit.test.js).
//
//   const files = compareFiles(mojeSoubory, autoroviSoubory, { ignoreWhitespace: true });
//   // → [{ name: 'script.js', status: 'changed', added: 2, removed: 1, diff: [...] }, …]
//   collapseUnchanged(files[0].diff)
//   // → [{ type: 'lines', lines: [...] }, { type: 'skip', lines: [...] }, …]
import { diffLines } from '../../../../shared/diff.js';

/** Kolik stejných řádků nechat vidět kolem každé změny. */
export const CONTEXT_LINES = 3;

/** Kratší úsek stejných řádků se nesbaluje — tlačítko „ukázat 2 řádky" by jen překáželo. */
const MIN_SKIP = 3;

/**
 * Porovná sadu souborů uživatele se sadou autora.
 * @param {{ name: string, content: string }[]} mine
 * @param {{ name: string, content: string }[]} author
 * @param {{ ignoreWhitespace?: boolean }} [options]
 * @returns {{ name: string, status: 'changed' | 'same' | 'added' | 'removed', added: number, removed: number,
 *   diff: ReturnType<typeof diffLines> }[]}
 *   pořadí: soubory autora, pak soubory, které má jen uživatel;
 *   added = soubor má jen autor, removed = soubor má jen uživatel
 */
export function compareFiles(mine, author, { ignoreWhitespace = false } = {}) {
  const mineByName = new Map(mine.map((file) => [file.name, file.content]));
  const authorNames = new Set(author.map((file) => file.name));
  const pairs = [
    ...author.map((file) => ({ name: file.name, before: mineByName.get(file.name), after: file.content })),
    ...mine.filter((file) => !authorNames.has(file.name)).map((file) => ({ name: file.name, before: file.content, after: undefined })),
  ];

  return pairs.map(({ name, before, after }) => {
    const diff = diffLines(before ?? '', after ?? '', { ignoreWhitespace });
    const added = diff.filter((line) => line.type === 'add').length;
    const removed = diff.filter((line) => line.type === 'del').length;
    let status = added || removed ? 'changed' : 'same';
    if (before === undefined) status = 'added';
    if (after === undefined) status = 'removed';
    return { name, status, added, removed, diff };
  });
}

/**
 * Rozdělí diff na úseky k zobrazení: kolem změn `context` stejných řádků, delší úseky
 * stejných řádků mezi nimi jako `skip` (UI je ukáže jako „… N stejných řádků").
 */
export function collapseUnchanged(diff, context = CONTEXT_LINES) {
  const visible = diff.map((line) => line.type !== 'same');
  diff.forEach((line, index) => {
    if (line.type === 'same') return;
    for (let k = Math.max(0, index - context); k <= Math.min(diff.length - 1, index + context); k++) visible[k] = true;
  });

  const parts = [];
  let hidden = [];
  const flushHidden = () => {
    if (hidden.length >= MIN_SKIP) parts.push({ type: 'skip', lines: hidden });
    else hidden.forEach(pushVisible);
    hidden = [];
  };
  function pushVisible(line) {
    const last = parts.at(-1);
    if (last?.type === 'lines') last.lines.push(line);
    else parts.push({ type: 'lines', lines: [line] });
  }

  diff.forEach((line, index) => {
    if (visible[index]) {
      flushHidden();
      pushVisible(line);
    } else {
      hidden.push(line);
    }
  });
  flushHidden();
  return parts;
}

/** Soubory ze sady bez prázdných jmen a s textem (kopie, aby se originál neměnil). */
export function plainFiles(files) {
  return (files ?? [])
    .filter((file) => file && typeof file.name === 'string' && file.name)
    .map((file) => ({ name: file.name, content: String(file.content ?? '') }));
}

/** Liší se uživatelův kód od autorova (ve společných souborech, bez ohledu na bílé znaky)? */
export function differsFromAuthor(mine, author) {
  const authorByName = new Map(author.map((file) => [file.name, file.content]));
  return mine.some((file) => {
    if (!authorByName.has(file.name)) return false;
    return compareFiles([file], [{ name: file.name, content: authorByName.get(file.name) }], { ignoreWhitespace: true })[0].status !== 'same';
  });
}
