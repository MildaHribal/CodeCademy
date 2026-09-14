// Měření smyček uvnitř iframu (protějšek `loop-guard.js`, který kontroly do kódu vkládá).
//
// POZOR: funkce se do iframu vkládá jako text, nesmí používat nic mimo své tělo.

/**
 * Měří se jen souvislý synchronní běh smyčky. Když smyčka mezitím pustí ke slovu
 * zbytek programu (`await`, `yield`), začne se měřit znovu — jinak by selhala
 * i legitimní smyčka typu `while (true) { await tick(); }`.
 *
 * „Tah" = úsek synchronního běhu. Nový tah poznáme podle toho, že doběhl
 * mikroúkol naplánovaný v tahu předchozím; při nekonečné smyčce nikdy nedoběhne.
 */
export function createLoopGuard({ limitMs, onTrip, sticky = false }) {
  const now = Date.now;
  const scheduleMicrotask = queueMicrotask;
  let turn = 0;
  let turnOpen = false;
  // sticky (běh testu): po prvním zásahu končí hned každá další smyčka. Jinak by kód, který
  // chybu zachytí a zkusí znovu (React po chybě vykreslí komponentu ještě jednou), zasekl
  // stránku na další limit a test by skončil jen obecným timeoutem watchdogu.
  let tripped = false;

  function currentTurn() {
    if (!turnOpen) {
      turnOpen = true;
      turn += 1;
      scheduleMicrotask(() => {
        turnOpen = false;
      });
    }
    return turn;
  }

  const messageFor = (line) => `Smyčka běží příliš dlouho — nekonečná smyčka? (řádek ${line})`;

  return Object.freeze({
    start() {
      return { turn: currentTurn(), startedAt: now() };
    },
    /** Vrátí true, když smyčka běží moc dlouho; chybu pak vyhodí kód smyčky přes error(). */
    check(state, line) {
      if (tripped && sticky) return true;
      const turnNow = currentTurn();
      if (turnNow !== state.turn) {
        state.turn = turnNow;
        state.startedAt = now();
        return false;
      }
      if (now() - state.startedAt <= limitMs) return false;
      tripped = true;
      onTrip(messageFor(line));
      return true;
    },
    error(line) {
      return new Error(messageFor(line));
    },
  });
}
