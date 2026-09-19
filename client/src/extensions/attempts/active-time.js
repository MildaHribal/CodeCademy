// Měření aktivního času na obrazovce (pole activeMs v pokusech, kontrakt kap. 12.2).

export const IDLE_AFTER_MS = 60_000;
export const MAX_ACTIVE_MS = 3_600_000;

export function createActiveTimer({ now = () => Date.now(), idleAfterMs = IDLE_AFTER_MS } = {}) {
  let lastActivity = null;
  let pending = 0;

  function accumulate(time) {
    if (lastActivity !== null) {
      const gap = time - lastActivity;
      if (gap > 0 && gap <= idleAfterMs) pending += gap;
    }
  }

  return {
    activity() {
      const time = now();
      accumulate(time);
      lastActivity = time;
    },

    pause() {
      accumulate(now());
      lastActivity = null;
    },

    take() {
      const time = now();
      accumulate(time);
      if (lastActivity !== null) lastActivity = time;
      const taken = Math.min(Math.round(pending), MAX_ACTIVE_MS);
      pending -= taken;
      return taken;
    },

    pending: () => pending,
  };
}
