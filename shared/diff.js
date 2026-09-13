// Řádkový diff dvou textů přes nejdelší společnou podposloupnost (LCS).
//
// Používá ho porovnání s řešením (tvůj kód × autorův kód) a míra změny u kroku
// `kind: debug` (kontrakt kap. 3.4). Běží v prohlížeči i v Node, na DOM nesahá.
//
//   diffLines('a\nb', 'a\nc')
//   → [{ type: 'same', text: 'a', beforeLine: 1, afterLine: 1 },
//      { type: 'del',  text: 'b', beforeLine: 2, afterLine: null },
//      { type: 'add',  text: 'c', beforeLine: null, afterLine: 2 }]
//
// Jak LCS funguje: tabulka `lengths[i][j]` říká, kolik řádků mají společných konce
// textů od řádku i (před) a od řádku j (po). Pak se jde od začátku: když se řádky
// shodují, jsou „same"; jinak se vydáme tím směrem, kde zůstane víc společných řádků.
// Kód v kurzu má desítky až stovky řádků, takže čas i paměť n × m stačí.
import { normalizeWhitespace } from './answers.js';

/** Text na řádky; \r\n a samotné \r se berou jako \n. Prázdný text = žádný řádek. */
function splitLines(text) {
  const normalized = String(text ?? '').replace(/\r\n?/g, '\n');
  if (normalized === '') return [];
  return normalized.split('\n');
}

/**
 * Délky společných podposloupností pro všechny konce: lengths[i * (m + 1) + j]
 * = LCS(a[i…], b[j…]). Jedno ploché pole místo pole polí šetří paměť.
 */
function lcsTable(a, b, same) {
  const n = a.length;
  const m = b.length;
  const width = m + 1;
  const lengths = new Uint32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lengths[i * width + j] = same(a[i], b[j])
        ? lengths[(i + 1) * width + j + 1] + 1
        : Math.max(lengths[(i + 1) * width + j], lengths[i * width + j + 1]);
    }
  }
  return lengths;
}

/**
 * Řádkový diff.
 * @param {string} before  původní text (třeba kód uživatele)
 * @param {string} after   nový text (třeba autorovo řešení)
 * @param {{ ignoreWhitespace?: boolean }} [options]
 *   ignoreWhitespace — řádky se porovnávají po sloučení bílých znaků (`normalizeWhitespace`),
 *   takže jiné odsazení nebo mezery navíc rozdíl nedělají; prázdný řádek navíc ale ano
 * @returns {{ type: 'same' | 'add' | 'del', text: string, beforeLine: number | null, afterLine: number | null }[]}
 *   `text` u 'same' je řádek z `after` (tak, jak vypadá teď); čísla řádků jsou 1-based
 */
export function diffLines(before, after, { ignoreWhitespace = false } = {}) {
  const a = splitLines(before);
  const b = splitLines(after);
  const key = ignoreWhitespace ? normalizeWhitespace : (line) => line;
  const aKeys = a.map(key);
  const bKeys = b.map(key);

  // Společný začátek a konec se do tabulky nedávají — u skoro stejných souborů to je většina řádků.
  let start = 0;
  while (start < a.length && start < b.length && aKeys[start] === bKeys[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && aKeys[endA - 1] === bKeys[endB - 1]) {
    endA--;
    endB--;
  }

  const result = [];
  const same = (i, j) => result.push({ type: 'same', text: b[j], beforeLine: i + 1, afterLine: j + 1 });
  for (let k = 0; k < start; k++) same(k, k);

  const midA = aKeys.slice(start, endA);
  const midB = bKeys.slice(start, endB);
  const width = midB.length + 1;
  const lengths = lcsTable(midA, midB, (x, y) => x === y);
  let i = 0;
  let j = 0;
  while (i < midA.length || j < midB.length) {
    const bothLeft = i < midA.length && j < midB.length;
    if (bothLeft && midA[i] === midB[j]) {
      same(start + i, start + j);
      i++;
      j++;
      continue;
    }
    // Kudy dál: odebrat řádek z `before`, nebo přidat řádek z `after`? Tam, kde zůstane víc
    // společných řádků. Při shodě nejdřív odebrat — změněný řádek pak vypadá jako „− starý, + nový".
    const keepAfterDel = i < midA.length ? lengths[(i + 1) * width + j] : -1;
    const keepAfterAdd = j < midB.length ? lengths[i * width + j + 1] : -1;
    if (keepAfterDel >= keepAfterAdd) {
      result.push({ type: 'del', text: a[start + i], beforeLine: start + i + 1, afterLine: null });
      i++;
    } else {
      result.push({ type: 'add', text: b[start + j], beforeLine: null, afterLine: start + j + 1 });
      j++;
    }
  }

  for (let k = 0; k < a.length - endA; k++) same(endA + k, endB + k);
  return result;
}

/**
 * Míra změny (kontrakt kap. 3.4): jaký podíl posuzovaných řádků seedu v uživatelově verzi chybí.
 * Řádky se porovnávají po `trim`, prázdné se nepočítají. Pořadí řádků hraje roli (LCS),
 * takže přeházené řádky se počítají jako změněné.
 *
 * @param {string[]} seedLines  posuzované řádky seedu (oblast --edit--, nebo celé změněné soubory)
 * @param {string} userText     uživatelova verze týchž souborů jako jeden text
 * @returns {number} 0 (nic nezměnil) … 1 (z posuzovaných řádků nezůstal žádný)
 */
export function changeRatio(seedLines, userText) {
  const seed = seedLines.map((line) => String(line).trim()).filter((line) => line !== '');
  if (seed.length === 0) return 0;
  const user = splitLines(userText).map((line) => line.trim()).filter((line) => line !== '');
  const lengths = lcsTable(seed, user, (x, y) => x === y);
  const kept = lengths[0];
  return (seed.length - kept) / seed.length;
}
