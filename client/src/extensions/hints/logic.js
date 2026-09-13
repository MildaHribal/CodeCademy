// Rozhodování odstupňovaných nápověd (kontrakt kap. 3.3) bez DOM — testuje se v Node
// (tools/hints-unit.test.js).
//
// Pravidla:
// - Tlačítko „Potřebuju nápovědu (k ze n)" je vidět vždy, tipy se otevírají po jednom v pořadí.
// - Po 2 neúspěšných kontrolách v řadě (failsSinceOk ≥ 2) se tlačítko zvýrazní a zvýrazní se
//   tip k prvnímu selhanému požadavku: tip s jeho hintIndex, jinak další neotevřený tip bez hintIndex.
// - Po posledním tipu přijde porovnání s řešením; bez tipů odkazy `see` a porovnání.

export const HIGHLIGHT_AFTER_FAILS = 2;

/** Indexy požadavků, které při kontrole selhaly (přeskočené se neověřily, nepočítají se). */
export function failedHintIndexes(run) {
  return (run?.results ?? []).filter((r) => !r.pass && !r.skipped).map((r) => r.index);
}

/** Index prvního selhaného požadavku, nebo null. */
export function firstFailedIndex(run) {
  return failedHintIndexes(run)[0] ?? null;
}

/** Počet neúspěšných kontrol v řadě po další kontrole. */
export function nextFailStreak(streak, passed) {
  return passed ? 0 : streak + 1;
}

export function shouldHighlight(failsSinceOk) {
  return failsSinceOk >= HIGHLIGHT_AFTER_FAILS;
}

/**
 * Který tip zvýraznit po neúspěchu.
 * @param {{ hintIndex: number | null }[]} help  tipy kroku v pořadí souboru
 * @param {number} openedCount  kolik tipů už je otevřených (vždy prvních N)
 * @param {number | null} failedIndex  první selhaný požadavek
 * @returns {number | null} index tipu v `help`, nebo null (žádný vhodný tip)
 */
export function focusTipIndex(help, openedCount, failedIndex) {
  if (failedIndex !== null && failedIndex !== undefined) {
    const forHint = help.map((tip, index) => ({ tip, index })).filter(({ tip }) => tip.hintIndex === failedIndex);
    // Tipů k jednomu požadavku může být víc: nejdřív ten, který ještě neviděl.
    const unopened = forHint.find(({ index }) => index >= openedCount);
    if (unopened) return unopened.index;
    if (forHint.length) return forHint.at(-1).index;
  }
  const general = help.findIndex((tip, index) => index >= openedCount && (tip.hintIndex === null || tip.hintIndex === undefined));
  return general === -1 ? null : general;
}

/**
 * Popisek hlavního tlačítka nápovědy.
 * @returns {{ label: string, action: 'tip' | 'compare' | 'panel' }}
 *   tip = otevře další tip, compare = porovnání s řešením, panel = krok bez tipů (odkazy a porovnání)
 */
export function helpButtonState(tipCount, openedCount) {
  if (tipCount === 0) return { label: 'Potřebuju nápovědu', action: 'panel' };
  if (openedCount < tipCount) return { label: `Potřebuju nápovědu (${openedCount + 1} ze ${tipCount})`, action: 'tip' };
  return { label: 'Porovnat s řešením', action: 'compare' };
}

/** Kolik tipů ukázat po načtení (server drží nejvyšší otevřený stupeň). */
export function restoredOpenedCount(tipsOpened, tipCount) {
  return Math.max(0, Math.min(Number(tipsOpened) || 0, tipCount));
}
