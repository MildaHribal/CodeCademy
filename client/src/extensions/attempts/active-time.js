// Měření aktivního času na obrazovce (pole activeMs v pokusech, kontrakt kap. 12.2).
//
// Počítá se čas mezi dvěma projevy aktivity (klávesa, myš, posun stránky), pokud mezi
// nimi neuběhlo víc než minuta. Když uživatel odejde od počítače nebo přepne kartu,
// čas se nepočítá. Soubor nesahá na DOM — hodiny jdou v testu podstrčit.

export const IDLE_AFTER_MS = 60_000;
export const MAX_ACTIVE_MS = 3_600_000;

/**
 * @param {{ now?: () => number, idleAfterMs?: number }} [options]
 * @returns {{ activity(): void, pause(): void, take(): number, pending(): number }}
 */
export function createActiveTimer({ now = () => Date.now(), idleAfterMs = IDLE_AFTER_MS } = {}) {
  let lastActivity = null; // čas poslední aktivity, null = neaktivní (karta skrytá, začátek)
  let pending = 0; // naměřený čas, který ještě nebyl odeslán

  /** Připočte čas od poslední aktivity, když nebyla moc dávno. */
  function accumulate(time) {
    if (lastActivity !== null) {
      const gap = time - lastActivity;
      if (gap > 0 && gap <= idleAfterMs) pending += gap;
    }
  }

  return {
    /** Uživatel právě něco udělal. */
    activity() {
      const time = now();
      accumulate(time);
      lastActivity = time;
    },

    /** Karta se skryla nebo obrazovka končí: dopočítat a přestat měřit. */
    pause() {
      accumulate(now());
      lastActivity = null;
    },

    /**
     * Vezme naměřený čas k odeslání (celé milisekundy, nejvýš MAX_ACTIVE_MS; zbytek počká
     * na další odeslání). Běžící měření pokračuje od teď.
     */
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
