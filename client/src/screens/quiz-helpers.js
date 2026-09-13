// Výpočty kvízu bez DOM (testuje je tools/reviews-unit.test.js): skóre, skupiny otázek
// nad sadou kódu `# --code--` a odkazy „kde si to zopakovat".

import { parseRef, refHref } from '../../../shared/refs.js';

/** Adresa v UI pro referenci `sekce/modul[/krok][#kotva]` (kontrakt kap. 2.9), neplatná → null. */
export const seeHref = (ref) => refHref(ref);

/** Id modulu z reference (`js-pole/co-je-pole#kopie` → `js-pole/co-je-pole`), nebo null. */
export const refModuleId = (ref) => parseRef(ref)?.moduleId ?? null;

/**
 * Rozdělí otázky na po sobě jdoucí skupiny podle sady kódu (kontrakt kap. 4.3):
 * otázky jedné sady `# --code--` jdou za sebou a kód je u nich v panelu.
 * @param {{ question: { code?: number | null } }[]} entries
 * @returns {{ code: number | null, entries: object[] }[]}
 */
export function groupByCodeSet(entries) {
  const groups = [];
  for (const entry of entries) {
    const code = Number.isInteger(entry.question.code) ? entry.question.code : null;
    const last = groups.at(-1);
    if (last && last.code === code) last.entries.push(entry);
    else groups.push({ code, entries: [entry] });
  }
  return groups;
}

/** Podíl správně zodpovězených otázek (poslední vyhodnocení každé otázky). */
export function quizScore(correctByIndex, total) {
  if (!total) return 0;
  let correct = 0;
  for (let index = 0; index < total; index++) if (correctByIndex.get(index) === true) correct++;
  return correct / total;
}

/** Kvíz je splněný, když skóre dosáhne hranice `pass` (s tolerancí zaokrouhlení). */
export const isPassing = (score, pass) => score >= pass - 1e-9;
