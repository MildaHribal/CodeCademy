// Hlídač času v rodiči. Iframe se zaseknutou smyčkou už sám nic nepošle,
// proto o jeho konci musí rozhodnout rodič.

/**
 * @param {number} ms
 * @param {() => void} onExpire
 * @returns {{ cancel(): void, restart(ms: number): void }}
 */
export function startWatchdog(ms, onExpire) {
  let timer = setTimeout(onExpire, ms);
  return {
    cancel() {
      clearTimeout(timer);
    },
    restart(nextMs) {
      clearTimeout(timer);
      timer = setTimeout(onExpire, nextMs);
    },
  };
}
