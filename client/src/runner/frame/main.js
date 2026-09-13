// Běhové prostředí uvnitř sandboxovaného iframu: zachytí konzoli a chyby,
// hlídá smyčky, spustí test a výsledky pošle rodiči přes postMessage.
//
// POZOR: funkce se do iframu vkládá jako text (viz `frame-script.js`), nesmí používat
// nic mimo své tělo. Všechno potřebné dostane v `config` a `parts`.

/**
 * @param {{ channel: string, runId: string, mode: 'test'|'page'|'preview'|'inspect', runtime: string,
 *   files: Record<string, string>, test: string|null, timeoutMs: number, loopLimitMs: number,
 *   sources: Array<{ name: string, lineOffset: number }>, moduleFiles: string[],
 *   filePrefix: string, guardGlobal: string, settleMs: number, cssVariables: Record<string, string>,
 *   inspect?: Array<{ id, property, selector }>,
 *   storage?: { localStorage?: Record<string, string>, sessionStorage?: Record<string, string> } }} config
 * @param {{ formatValue, createAssert, describeAssertion, stripComments, findCssRules, createHelpers,
 *   createLoopGuard, findInactiveDeclarations, importModule }} parts
 */
export function frameMain(config, parts) {
  const parentWindow = window.parent;
  const setTimer = window.setTimeout.bind(window);
  const clearTimer = window.clearTimeout.bind(window);
  const MAX_ENTRIES = 500;
  const MAX_TEXT = 5000;
  const isTest = config.mode === 'test';

  function send(type, payload = {}) {
    parentWindow.postMessage(Object.assign({ channel: config.channel, runId: config.runId, type }, payload), '*');
  }

  // --- Konzole a chyby -------------------------------------------------------

  const logs = [];
  const errors = [];
  let truncated = false;

  function limitText(text) {
    return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}… (zkráceno)` : text;
  }

  function hasRoom() {
    if (logs.length + errors.length < MAX_ENTRIES) return true;
    if (!truncated) {
      truncated = true;
      send('console', { level: 'warn', text: `Další výpisy vynechány (víc než ${MAX_ENTRIES}).` });
    }
    return false;
  }

  function addLog(level, text) {
    if (!hasRoom()) return;
    const entry = { level, text: limitText(text) };
    logs.push(entry);
    send('console', entry);
  }

  /** where = { file, line, column } nebo null — kvůli označení řádku v editoru. */
  function addError(text, where = null) {
    if (!hasRoom()) return;
    const limited = limitText(text);
    errors.push(limited);
    send('error', Object.assign({ text: limited }, where ?? {}));
  }

  /** console.log('%s má %d let', 'Eva', 30) → "Eva má 30 let" */
  function formatArguments(args) {
    const list = [...args];
    let head = '';
    if (typeof list[0] === 'string' && list[0].includes('%')) {
      const template = list.shift();
      head = template.replace(/%([sdifoOc%])/g, (match, code) => {
        if (code === '%') return '%';
        if (list.length === 0) return match;
        const value = list.shift();
        if (code === 's') return typeof value === 'string' ? value : parts.formatValue(value);
        if (code === 'd' || code === 'i') return String(code === 'i' ? parseInt(value, 10) : Number(value));
        if (code === 'f') return String(parseFloat(value));
        if (code === 'c') return '';
        return parts.formatValue(value);
      });
    }
    const rest = list.map((value) => parts.formatValue(value, { rawStrings: true }));
    return [head, ...rest].filter((piece, index) => index > 0 || piece !== '').join(' ');
  }

  const LEVELS = { log: 'log', info: 'info', warn: 'warn', error: 'error', debug: 'log', trace: 'log', dir: 'log', table: 'log' };
  for (const [method, level] of Object.entries(LEVELS)) {
    const original = console[method];
    console[method] = function (...args) {
      addLog(level, formatArguments(args));
      if (typeof original === 'function') original.apply(console, args);
    };
  }
  const originalAssert = console.assert;
  console.assert = function (condition, ...args) {
    if (!condition) addLog('error', `Assertion failed${args.length ? `: ${formatArguments(args)}` : ''}`);
    if (typeof originalAssert === 'function') originalAssert.call(console, condition, ...args);
  };

  const SOURCE_URL_PREFIX = 'akademie/';

  /**
   * Kde chyba vznikla. Skripty mají `//# sourceURL=akademie/<soubor>`, takže prohlížeč hlásí
   * přímo jméno souboru; data: URL s číslem zdroje je záloha.
   * @returns {{ file: string, line?: number, column?: number } | null}
   */
  function locate(filename, lineno, colno) {
    const name = String(filename ?? '');
    const position = (offset = 0) => Object.assign(
      {},
      lineno > 0 ? { line: lineno + offset } : {},
      colno > 0 ? { column: colno } : {},
    );
    if (name.startsWith(SOURCE_URL_PREFIX)) return Object.assign({ file: name.slice(SOURCE_URL_PREFIX.length) }, position());
    const match = /^data:text\/javascript;akademie-source=(\d+)/.exec(name);
    const source = match ? config.sources[Number(match[1])] : null;
    if (source) return Object.assign({ file: source.name }, position(source.lineOffset));
    return config.runtime === 'js' ? null : { file: 'index.html' };
  }

  /** První místo v uživatelově souboru ze zásobníku volání (u chyb v Promise nic jiného nemáme). */
  function locateFromStack(error) {
    const stack = typeof error?.stack === 'string' ? error.stack : '';
    const match = /akademie\/([^\s:()]+):(\d+):(\d+)/.exec(stack);
    return match ? { file: match[1], line: Number(match[2]), column: Number(match[3]) } : null;
  }

  function describeWhere(where) {
    if (!where) return '';
    return where.line ? `${where.file}:${where.line}` : where.file;
  }

  function describeError(error) {
    if (error instanceof Error) return error.message ? `${error.name}: ${error.message}` : error.name;
    return parts.formatValue(error);
  }

  let definingTest = false;
  let testDefinitionError = null;

  window.addEventListener('error', (event) => {
    if (definingTest) {
      testDefinitionError = event.error instanceof Error ? describeError(event.error) : String(event.message);
      event.preventDefault();
      return;
    }
    if (!(event instanceof ErrorEvent)) return;
    const message = event.error !== undefined && event.error !== null
      ? describeError(event.error)
      : String(event.message).replace(/^Uncaught /, '');
    const where = locate(event.filename, event.lineno, event.colno);
    addError(where ? `${message} (${describeWhere(where)})` : message, where);
  });

  window.addEventListener('unhandledrejection', (event) => {
    addError(`${describeError(event.reason)} (neošetřená chyba v Promise)`, locateFromStack(event.reason));
  });

  // --- Úložiště v sandboxu (localStorage, sessionStorage) -------------------------
  //
  // Iframe bez allow-same-origin při čtení localStorage vyhodí SecurityError. Kód uživatele
  // (seznam úkolů, nastavení) by pak spadl ještě před testem. Proto dostane náhradu v paměti,
  // čerstvou pro každý běh a naplněnou z `config.storage` (RunRequest.storage).

  function createMemoryStorage(initial) {
    const data = new Map(Object.entries(initial ?? {}).map(([key, value]) => [String(key), String(value)]));
    const methods = {
      key: (index) => [...data.keys()][Number(index)] ?? null,
      getItem: (key) => (data.has(String(key)) ? data.get(String(key)) : null),
      setItem: (key, value) => {
        data.set(String(key), String(value));
      },
      removeItem: (key) => {
        data.delete(String(key));
      },
      clear: () => data.clear(),
    };
    // Proxy, aby fungoval i zápis `localStorage.theme = 'dark'` a `Object.keys(localStorage)`.
    return new Proxy(methods, {
      get: (target, property) => {
        if (property === 'length') return data.size;
        if (Object.prototype.hasOwnProperty.call(target, property)) return target[property];
        return typeof property === 'string' && data.has(property) ? data.get(property) : undefined;
      },
      set: (target, property, value) => {
        if (property === 'length' || Object.prototype.hasOwnProperty.call(target, property)) return true;
        data.set(String(property), String(value));
        return true;
      },
      has: (target, property) => property === 'length' || property in target || data.has(String(property)),
      deleteProperty: (target, property) => {
        data.delete(String(property));
        return true;
      },
      ownKeys: () => [...data.keys()],
      getOwnPropertyDescriptor: (target, property) => (data.has(String(property))
        ? { value: data.get(String(property)), writable: true, enumerable: true, configurable: true }
        : undefined),
    });
  }

  for (const name of ['localStorage', 'sessionStorage']) {
    let available = true;
    try {
      void window[name];
    } catch {
      available = false;
    }
    if (available) continue; // stránka v nové kartě má skutečné úložiště
    const storage = createMemoryStorage(config.storage?.[name]);
    try {
      Object.defineProperty(window, name, { configurable: true, enumerable: true, get: () => storage });
    } catch {
      // prohlížeč vlastnost přepsat nedovolí — kód uživatele dostane původní chybu
    }
  }

  // --- Custom properties z ovládacích prvků (Preview.setCssVariables) ------------

  function applyCssVariables(vars) {
    const style = document.documentElement?.style;
    if (!style) return;
    for (const [name, value] of Object.entries(vars ?? {})) {
      if (!/^--[\w-]+$/.test(name)) continue;
      if (value === null || value === undefined) style.removeProperty(name);
      else style.setProperty(name, String(value));
    }
  }
  applyCssVariables(config.cssVariables);

  // --- Ochrana smyček ----------------------------------------------------------

  let loopError = null;
  let testStarted = false;
  const guard = parts.createLoopGuard({
    limitMs: config.loopLimitMs,
    onTrip(message) {
      if (!loopError) loopError = message;
      // Smyčka už při načítání stránky zasekne stejně i každý další test (runner je pak přeskočí).
      const phase = testStarted ? 'test' : 'load';
      // Výsledek až v dalším úkolu, aby rodič stihl dostat i nezachycenou chybu smyčky do `errors`.
      if (isTest) setTimer(() => finishTest(false, message, phase), 0);
    },
  });
  Object.defineProperty(window, config.guardGlobal, { value: guard, enumerable: false, writable: false, configurable: false });

  // V testu nesmí okno alert/confirm/prompt zastavit běh (iframe je neviditelný).
  if (config.mode !== 'preview') {
    window.alert = (message) => addLog('info', `alert: ${message ?? ''}`);
    window.confirm = (message) => {
      addLog('info', `confirm: ${message ?? ''}`);
      return false;
    };
    window.prompt = (message) => {
      addLog('info', `prompt: ${message ?? ''}`);
      return null;
    };
  }

  // --- Požadavky na rodiče (resize) --------------------------------------------

  const pendingRequests = new Map();
  let nextRequestId = 1;

  window.addEventListener('message', (event) => {
    if (event.source !== parentWindow) return;
    const data = event.data;
    if (!data || data.channel !== config.channel || data.runId !== config.runId) return;
    if (data.type === 'resized' && pendingRequests.has(data.requestId)) {
      pendingRequests.get(data.requestId)();
      pendingRequests.delete(data.requestId);
    } else if (data.type === 'set-vars') {
      applyCssVariables(data.vars);
    }
  });
  // Rodič teď může posílat zprávy (dřívější zprávy by šly ještě do prázdné stránky).
  if (config.mode === 'preview') send('ready');

  function requestResize(width, height) {
    return new Promise((resolve) => {
      const requestId = nextRequestId++;
      pendingRequests.set(requestId, resolve);
      send('resize', { requestId, width, height });
    });
  }

  function importFile(name) {
    const clean = String(name).replace(/^(\.\/)+/, '').replace(/^\/+/, '');
    if (!config.moduleFiles.includes(clean)) {
      return Promise.reject(new Error(`helpers.importFile: soubor „${clean}" v kroku není (importovat jde .js, .mjs a .json)`));
    }
    return parts.importModule(config.filePrefix + clean);
  }

  // --- Spuštění testu ------------------------------------------------------------

  let finished = false;

  /**
   * phase: 'load', když test selhal ještě před svým spuštěním (smyčka při načítání stránky).
   * details: errorName a u asercí actual/expected/operator/generatedMessage/diff (describeAssertion).
   */
  function finishTest(pass, error, phase = 'test', details = null) {
    if (finished) return;
    finished = true;
    send('result', pass ? { pass: true } : Object.assign({ pass: false, error: String(error), phase }, details ?? {}));
  }

  function whenPageLoaded(callback) {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      setTimer(callback, 0); // ať doběhnou i obsluhy `load` uživatele
    };
    window.addEventListener('load', start);
    // Pojistka: obrázek z nedostupné adresy umí `load` zdržet donekonečna.
    document.addEventListener('DOMContentLoaded', () => setTimer(start, 3000));
  }

  /**
   * Šířka, se kterou prohlížeč opravdu počítá rozvržení stránky.
   *
   * Iframe v odděleném procesu se nejdřív rozvrhne s nulovou velikostí. Nová velikost
   * se do `innerWidth` a `clientWidth` propíše hned, do samotného layoutu až o chvíli
   * později. Do té doby mají všechny prvky nulovou šířku, i když `innerWidth` hlásí 1024.
   * Pevně umístěný prvek přes celé okno ukáže, jakou šířku layout skutečně používá.
   */
  function layoutViewportWidth() {
    const probe = document.createElement('div');
    probe.style.cssText = [
      'position:fixed', 'inset:0', 'display:block', 'visibility:hidden', 'pointer-events:none',
      'width:auto', 'height:auto', 'min-width:0', 'max-width:none', 'margin:0', 'padding:0', 'border:0',
    ].map((declaration) => `${declaration}!important`).join(';');
    document.documentElement.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  }

  function layoutMatchesViewport() {
    const expected = document.documentElement.clientWidth;
    return expected > 0 && Math.abs(layoutViewportWidth() - expected) <= 1;
  }

  /** Počká, až má iframe velikost a layout ji opravdu používá (nejvýš `limitMs`). */
  async function waitForLayout(limitMs = 2000) {
    const deadline = Date.now() + limitMs;
    while (Date.now() < deadline) {
      if (window.innerWidth > 0 && document.documentElement && layoutMatchesViewport()) return;
      await new Promise((resolve) => setTimer(resolve, 10));
    }
  }

  async function waitForViewport() {
    await waitForLayout();
  }

  function defineTest(source) {
    let testFunction = null;
    const registerName = '__akademieDefineTest';
    Object.defineProperty(window, registerName, {
      value: (fn) => {
        testFunction = fn;
      },
      configurable: true,
    });
    const script = document.createElement('script');
    // Klasický skript: test tak vidí top-level let/const/function uživatelova skriptu.
    script.textContent = `${registerName}(async function (assert, files, logs, errors, helpers) {\n${source}\n});`;
    definingTest = true;
    testDefinitionError = null;
    (document.head || document.documentElement).appendChild(script);
    definingTest = false;
    script.remove();
    delete window[registerName];
    if (!testFunction) throw new Error(`Test nejde spustit: ${testDefinitionError ?? 'neznámá chyba'}`);
    return testFunction;
  }

  async function runTest() {
    await waitForViewport();
    if (finished) return;
    testStarted = true;
    send('test-start');
    // Pustíme zprávu ven dřív, než test případně zablokuje vlákno nekonečnou smyčkou.
    await new Promise((resolve) => setTimer(resolve, 0));
    if (loopError) return finishTest(false, loopError, 'load');

    let testFunction;
    try {
      testFunction = defineTest(config.test ?? '');
    } catch (error) {
      return finishTest(false, error.message);
    }

    const assert = parts.createAssert(parts.formatValue);
    const helpers = parts.createHelpers({
      stripComments: parts.stripComments,
      findCssRules: parts.findCssRules,
      setTimeout: setTimer,
      requestResize,
      waitForLayout,
      importFile,
    });
    const files = Object.freeze({ ...config.files });

    const timer = setTimer(() => finishTest(false, `Test nedoběhl včas (limit ${config.timeoutMs} ms).`), config.timeoutMs);
    try {
      await testFunction(assert, files, logs, errors, helpers);
      finishTest(!loopError, loopError);
    } catch (error) {
      if (loopError) finishTest(false, loopError, 'test', { errorName: 'Error' });
      else finishTest(false, error?.name === 'AssertionError' ? error.message : describeError(error), 'test', parts.describeAssertion(error, parts.formatValue));
    } finally {
      clearTimer(timer);
    }
  }

  if (isTest) {
    whenPageLoaded(runTest);
  } else if (config.mode === 'page') {
    // Jen načíst stránku a posbírat výpisy (živé ukázky ve verify).
    whenPageLoaded(() => setTimer(() => send('done'), config.settleMs));
  } else if (config.mode === 'inspect') {
    // Lint: které CSS deklarace na vykreslené stránce nic nedělají.
    whenPageLoaded(async () => {
      await waitForLayout();
      await new Promise((resolve) => setTimer(resolve, config.settleMs));
      let items = [];
      try {
        items = parts.findInactiveDeclarations(document, config.inspect ?? []);
      } catch {
        items = [];
      }
      send('inspect-result', { items });
    });
  }
}
