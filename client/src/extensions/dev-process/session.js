// Relace běžícího procesu v jedné obrazovce (pracovní plocha node, projekt).
//
// Hlídá „svůj" proces: spustí ho, průběžně stahuje výstup (GET …/output?since=),
// pozná, kdy skončil, a při odchodu z obrazovky ho zastaví. Bez DOM, aby šla
// otestovat v Node (tools/dev-process-unit.test.js) — UI se napojí přes on('change'/'output').
import { createEmitter } from '../../core/registry.js';
import { devProcessApi } from './api.js';

const STREAM_LEVELS = { stdout: 'log', stderr: 'error', system: 'system' };

/**
 * Záznamy výstupu → řádky konzole. Sousední záznamy stejného proudu se spojí
 * (jeden console.log může přijít rozdělený) a koncový nový řádek se odřízne.
 * @returns {{ level: 'log'|'error'|'system', text: string }[]}
 */
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

// Relace podle prvku panelu: output-node.js relaci vytvoří, rozšíření (HTTP klient)
// ji najde přes ws.elements.output.
const sessionsByElement = new WeakMap();

export function attachSession(element, session) {
  sessionsByElement.set(element, session);
}

export function sessionFor(element) {
  return element ? sessionsByElement.get(element) ?? null : null;
}

/**
 * @param {{ api?, pollMs?: number, retryMs?: number, timers?: { set, clear } }} options
 *   api a timers jdou podstrčit v testech
 */
export function createDevProcessSession({
  api = devProcessApi,
  pollMs = 300,
  retryMs = 1500,
  timers = { set: (fn, ms) => setTimeout(fn, ms), clear: (id) => clearTimeout(id) },
} = {}) {
  const events = createEmitter();
  let process = null; // poslední známý DevProcess
  let ownId = null; // id procesu, který spustila tahle relace
  let since = 0;
  let pollTimer = null;
  let polling = false;
  let starting = false;
  let stopping = false;
  let stale = false; // kód se od spuštění změnil
  let error = null; // poslední chyba spojení se serverem Akademie
  let disposed = false;
  let generation = 0; // zvýší se při každém startu — staré odpovědi výstupu se zahodí

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
    // Poll zavolaný přímo (po startu, po stop) nahradí naplánovaný.
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
        // Mezitím spustil proces někdo jiný (jiná karta) — výstup už není náš.
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
      // Mezitím začal nový běh a jeho první poll se kvůli tomuhle přeskočil — dohnat.
      if (pollGeneration !== generation && ownId && !disposed && !pollTimer) schedulePoll(0);
    }
  }

  /**
   * Spustí proces (běžící proces se na serveru nejdřív zastaví).
   * @param {{ files?, project?, main?, env? }} body  tělo POST /api/dev-process/start
   */
  async function start(body) {
    if (disposed) return null;
    starting = true;
    error = null;
    ownId = null; // odpovědi výstupu starého běhu už nepatří nikomu
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
      await poll(); // výstup, který vznikl před odpovědí (a u skriptu celý)
      return process;
    } catch (err) {
      starting = false;
      changed();
      throw err;
    }
  }

  /** Zastaví vlastní proces. Cizí proces (z jiné obrazovky) nechá být. */
  async function stop({ keepalive = false } = {}) {
    if (!state().running) return false;
    stopping = true;
    changed();
    try {
      const data = await api.stop({ keepalive });
      if (!disposed) await poll(); // dočte „Proces zastaven." a nový stav
      return data.stopped;
    } finally {
      stopping = false;
      if (!disposed) changed();
    }
  }

  /** Načte stav z serveru bez spouštění (např. po otevření obrazovky). */
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

  /** Kód v editoru se změnil — běžící server má starou verzi. */
  function markChanged() {
    if (!state().running || stale) return;
    stale = true;
    changed();
  }

  /**
   * Odchod z obrazovky: přestane stahovat výstup a vlastní běžící proces zastaví
   * (keepalive, aby požadavek doběhl i při zavírání stránky).
   */
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
