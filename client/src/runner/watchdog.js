
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
