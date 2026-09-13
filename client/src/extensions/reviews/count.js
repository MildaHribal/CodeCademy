// Počet položek k opakování pro odznak v menu a řádek na přehledu.
// Souhrn se načítá líně a nejvýš jednou za MIN_INTERVAL_MS (server při něm prochází obsah);
// po odpovědi, přidání nebo odebrání položky se obnoví hned (force).

import { refreshHeader } from '../../core/header.js';
import { reviewsApi } from './api.js';

const MIN_INTERVAL_MS = 30_000;

let summary = null; // { date, due, estimateMinutes }
let loadedAt = 0;
let pending = null;
const listeners = new Set();

export const currentSummary = () => summary;

/** Obnoví souhrn ze serveru. Vrací Promise se souhrnem (nebo null, když server neodpověděl). */
export function refreshReviewCount({ force = false } = {}) {
  // Běžící načtení mohlo začít před změnou, kvůli které se obnovuje — pak se načte ještě jednou.
  if (pending) return force ? pending.then(() => refreshReviewCount({ force: true })) : pending;
  if (!force && summary && Date.now() - loadedAt < MIN_INTERVAL_MS) return Promise.resolve(summary);
  pending = reviewsApi
    .summary()
    .then((data) => {
      summary = data;
      loadedAt = Date.now();
      refreshHeader();
      for (const listener of listeners) listener(summary);
      return summary;
    })
    .catch(() => summary)
    .finally(() => {
      pending = null;
    });
  return pending;
}

/** Posluchač nového souhrnu; vrací odhlášení. */
export function onReviewCount(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
