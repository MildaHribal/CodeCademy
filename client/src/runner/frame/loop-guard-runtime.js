
export function createLoopGuard({ limitMs, onTrip, sticky = false }) {
  const now = Date.now;
  const scheduleMicrotask = queueMicrotask;
  let turn = 0;
  let turnOpen = false;
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
