import { createEmitter } from '../../core/registry.js';
import { devProcessApi } from './api.js';

const STREAM_LEVELS = { stdout: 'log', stderr: 'error', system: 'system' };

export function chunksToEntries(chunks) {
  const entries = [];
  let last = null;
  for (const chunk of chunks) {
    if (last && last.stream === chunk.stream) {
      last.text += chunk.text;
    } else {
      last = { stream: chunk.stream, text: chunk.text };
      entries.push(last);
    }
  }
  return entries
    .map(({ stream, text }) => ({ level: STREAM_LEVELS[stream] ?? 'log', text: text.replace(/\r?\n$/, '') }))
    .filter((entry) => entry.text !== '');
}

const sessionsByElement = new WeakMap();

export function attachSession(element, session) {
  sessionsByElement.set(element, session);
}

export function sessionFor(element) {
  return element ? sessionsByElement.get(element) ?? null : null;
}

export function createDevProcessSession({
  api = devProcessApi,
  pollMs = 300,
  retryMs = 1500,
  timers = { set: (fn, ms) => setTimeout(fn, ms), clear: (id) => clearTimeout(id) },
} = {}) {
  const events = createEmitter();
  let process = null;
  let ownId = null;
  let since = 0;
  let pollTimer = null;
  let polling = false;
  let starting = false;
  let stopping = false;
  let stale = false;
  let error = null;
  let disposed = false;
  let generation = 0;

  const state = () => ({
    process,
    own: Boolean(process && process.id === ownId),
    running: Boolean(process && process.id === ownId && process.status === 'running'),
    starting,
    stopping,
    stale,
    error,
  });
  const changed = () => events.emit('change', state());

  function schedulePoll(delay) {
    timers.clear(pollTimer);
    pollTimer = disposed ? null : timers.set(poll, delay);
  }

  async function poll() {
    timers.clear(pollTimer);
    pollTimer = null;
    if (disposed || polling || !ownId) return;
    polling = true;
    const pollGeneration = generation;
    try {
      const data = await api.output(since);
      if (disposed || pollGeneration !== generation) return;
      error = null;
      if (!data.process || data.process.id !== ownId) {
        process = data.process;
        ownId = null;
        events.emit('output', [{ level: 'system', text: 'Proces převzala jiná obrazovka nebo karta.' }]);
        changed();
        return;
      }
      if (data.truncated) {
        events.emit('output', [{ level: 'system', text: '… starší výstup se nevešel do paměti a je vynechaný.' }]);
      }
      const entries = chunksToEntries(data.chunks);
      since = data.next;
      if (entries.length) events.emit('output', entries);
      const statusChanged = JSON.stringify(process) !== JSON.stringify(data.process);
      process = data.process;
      if (statusChanged) changed();
      if (process.status === 'running') schedulePoll(pollMs);
    } catch (err) {
      if (disposed || pollGeneration !== generation) return;
      error = err.message ?? String(err);
      changed();
      schedulePoll(retryMs);
    } finally {
      polling = false;
      if (pollGeneration !== generation && ownId && !disposed && !pollTimer) schedulePoll(0);
    }
  }

  async function start(body) {
    if (disposed) return null;
    starting = true;
    error = null;
    ownId = null;
    generation++;
    changed();
    try {
      const data = await api.start(body);
      if (disposed) return data.process;
      process = data.process;
      ownId = process.id;
      since = 0;
      stale = false;
      starting = false;
      changed();
      await poll();
      return process;
    } catch (err) {
      starting = false;
      changed();
      throw err;
    }
  }

  async function stop({ keepalive = false } = {}) {
    if (!state().running) return false;
    stopping = true;
    changed();
    try {
      const data = await api.stop({ keepalive });
      if (!disposed) await poll();
      return data.stopped;
    } finally {
      stopping = false;
      if (!disposed) changed();
    }
  }

  async function refresh() {
    const data = await api.get();
    if (disposed) return null;
    process = data.process;
    changed();
    return process;
  }

  /** HTTP požadavek na běžící proces (kontrakt 12.7). Neprodlužuje nic navíc — to dělá server. */
  function request(body, options) {
    return api.request(body, options);
  }

  function markChanged() {
    if (!state().running || stale) return;
    stale = true;
    changed();
  }

  function dispose() {
    if (disposed) return;
    const shouldStop = state().running || starting;
    disposed = true;
    timers.clear(pollTimer);
    pollTimer = null;
    if (shouldStop) api.stop({ keepalive: true }).catch(() => {});
  }

  return {
    start,
    stop,
    refresh,
    request,
    markChanged,
    dispose,
    state,
    on: events.on,
  };
}
