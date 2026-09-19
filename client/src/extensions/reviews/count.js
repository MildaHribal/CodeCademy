
import { refreshHeader } from '../../core/header.js';
import { reviewsApi } from './api.js';

const MIN_INTERVAL_MS = 30_000;

let summary = null;
let loadedAt = 0;
let pending = null;
const listeners = new Set();

export const currentSummary = () => summary;

export function refreshReviewCount({ force = false } = {}) {
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

export function onReviewCount(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
