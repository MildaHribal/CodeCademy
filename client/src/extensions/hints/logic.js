// Rozhodování odstupňovaných nápověd (kontrakt kap. 3.3) bez DOM — testuje se v Node

export const HIGHLIGHT_AFTER_FAILS = 2;

export function failedHintIndexes(run) {
  return (run?.results ?? []).filter((r) => !r.pass && !r.skipped).map((r) => r.index);
}

export function firstFailedIndex(run) {
  return failedHintIndexes(run)[0] ?? null;
}

export function nextFailStreak(streak, passed) {
  return passed ? 0 : streak + 1;
}

export function shouldHighlight(failsSinceOk) {
  return failsSinceOk >= HIGHLIGHT_AFTER_FAILS;
}

export function focusTipIndex(help, openedCount, failedIndex) {
  if (failedIndex !== null && failedIndex !== undefined) {
    const forHint = help.map((tip, index) => ({ tip, index })).filter(({ tip }) => tip.hintIndex === failedIndex);
    const unopened = forHint.find(({ index }) => index >= openedCount);
    if (unopened) return unopened.index;
    if (forHint.length) return forHint.at(-1).index;
  }
  const general = help.findIndex((tip, index) => index >= openedCount && (tip.hintIndex === null || tip.hintIndex === undefined));
  return general === -1 ? null : general;
}

export function helpButtonState(tipCount, openedCount) {
  if (tipCount === 0) return { label: 'Potřebuju nápovědu', action: 'panel' };
  if (openedCount < tipCount) return { label: `Potřebuju nápovědu (${openedCount + 1} ze ${tipCount})`, action: 'tip' };
  return { label: 'Porovnat s řešením', action: 'compare' };
}

export function restoredOpenedCount(tipsOpened, tipCount) {
  return Math.max(0, Math.min(Number(tipsOpened) || 0, tipCount));
}
