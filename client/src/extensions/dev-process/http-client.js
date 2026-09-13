// Panel HTTP klienta: metoda, cesta, hlavičky a tělo → požadavek na běžící proces →
// stav, hlavičky, tělo a čas odpovědi. Posílá přes POST /api/dev-process/request, takže
// funguje stejně na portu Vite (5300) i serveru (4300) a nevadí mu CORS.
import { h } from '../../dom.js';
import {
  METHODS, METHODS_WITHOUT_BODY, bodyBytes, buildRequest, describeBody, formatBytes, headerEntries, statusGroup,
} from './http-format.js';

// Rozepsaný formulář a poslední cesty podle kroku — přežijí přechod mezi kroky, ne reload.
const drafts = new Map();
const OPEN_KEY = 'akademie.devProcess.httpOpen';

let uid = 0;

function readOpen() {
  try {
    return localStorage.getItem(OPEN_KEY) !== '0';
  } catch {
    return true;
  }
}

function saveOpen(open) {
  try {
    localStorage.setItem(OPEN_KEY, open ? '1' : '0');
  } catch {
    // bez localStorage si panel stav nepamatuje
  }
}

/**
 * @param {{ session, draftKey: string, defaultPath?: string }} options
 *   session  relace z session.js (stav procesu a request)
 *   draftKey id kroku nebo projektu, pod kterým se pamatuje formulář
 * @returns {{ element: HTMLElement, destroy(): void }}
 */
export function createHttpClient({ session, draftKey, defaultPath = '/' }) {
  const id = `dev-http-${++uid}`;
  const draft = drafts.get(draftKey) ?? { method: 'GET', path: defaultPath, headersText: '', bodyText: '', recent: [] };
  drafts.set(draftKey, draft);
  let sending = false;
  let controller = null;

  const method = h(
    'select',
    { class: 'dev-http__method', id: `${id}-method`, 'aria-label': 'Metoda' },
    METHODS.map((name) => h('option', { value: name, selected: name === draft.method }, name)),
  );
  const recentList = h('datalist', { id: `${id}-recent` });
  const path = h('input', {
    class: 'dev-http__path',
    id: `${id}-path`,
    type: 'text',
    value: draft.path,
    spellcheck: 'false',
    autocomplete: 'off',
    list: `${id}-recent`,
    'aria-label': 'Cesta a dotaz',
    placeholder: '/api/books?limit=5',
  });
  const sendButton = h('button', { type: 'submit', class: 'btn btn--primary btn--small dev-http__send' }, 'Odeslat');

  const headersInput = h('textarea', {
    class: 'dev-http__textarea',
    id: `${id}-headers`,
    rows: 2,
    spellcheck: 'false',
    placeholder: 'Accept: application/json',
  });
  headersInput.value = draft.headersText;
  const bodyInput = h('textarea', {
    class: 'dev-http__textarea',
    id: `${id}-body`,
    rows: 4,
    spellcheck: 'false',
    placeholder: '{ "title": "Babička", "author": "Božena Němcová" }',
  });
  bodyInput.value = draft.bodyText;
  const bodyNote = h('p', { class: 'dev-http__hint' });

  const extra = h(
    'details',
    { class: 'dev-http__extra', open: Boolean(draft.headersText || draft.bodyText) },
    h('summary', {}, 'Hlavičky a tělo'),
    h('label', { class: 'dev-http__label', for: headersInput.id }, 'Hlavičky', h('span', { class: 'dev-http__hint' }, ' — jedna na řádek, Název: hodnota')),
    headersInput,
    h('label', { class: 'dev-http__label', for: bodyInput.id }, 'Tělo'),
    bodyInput,
    bodyNote,
  );

  const idleHint = h('p', { class: 'dev-http__hint dev-http__idle' }, 'Nejdřív spusť server tlačítkem Spustit, pak sem pošli požadavek.');
  const form = h(
    'form',
    { class: 'dev-http__form', novalidate: true },
    h('div', { class: 'dev-http__line' }, method, path, sendButton),
    recentList,
    extra,
  );
  const result = h('div', { class: 'dev-http__result', role: 'status', 'aria-live': 'polite' });

  const element = h(
    'details',
    { class: 'dev-http', open: readOpen() },
    h('summary', { class: 'dev-http__summary' }, h('span', { class: 'dev-http__title' }, 'HTTP klient')),
    h('div', { class: 'dev-http__body' }, idleHint, form, result),
  );

  // ——— Chování ———

  element.addEventListener('toggle', () => saveOpen(element.open));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    send();
  });
  // Ctrl+Enter v HTTP klientovi pošle požadavek (a nespustí kontrolu kroku).
  form.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      event.stopPropagation();
      send();
    }
  });
  for (const input of [method, path, headersInput, bodyInput]) {
    input.addEventListener('input', saveDraft);
    input.addEventListener('change', saveDraft);
  }
  method.addEventListener('change', updateBodyState);

  const offChange = session.on('change', updateEnabled);
  updateEnabled();
  updateBodyState();
  renderRecent();

  function saveDraft() {
    draft.method = method.value;
    draft.path = path.value;
    draft.headersText = headersInput.value;
    draft.bodyText = bodyInput.value;
  }

  function updateEnabled(state = session.state()) {
    const running = state.running;
    idleHint.hidden = running;
    sendButton.disabled = !running || sending;
  }

  function updateBodyState() {
    const noBody = METHODS_WITHOUT_BODY.has(method.value);
    bodyInput.disabled = noBody;
    bodyNote.textContent = noBody
      ? `${method.value} tělo neposílá — data patří do cesty a dotazu (?klic=hodnota).`
      : 'Když chybí Content-Type, doplní se podle těla: platný JSON → application/json.';
  }

  function renderRecent() {
    recentList.replaceChildren(...draft.recent.map((value) => h('option', { value })));
  }

  async function send() {
    if (sending || !session.state().running) return;
    const built = buildRequest({ method: method.value, path: path.value, headersText: headersInput.value, bodyText: bodyInput.value });
    if (!built.request) {
      showProblems(built.errors);
      return;
    }
    sending = true;
    updateEnabled();
    controller = new AbortController();
    result.dataset.state = 'sending';
    result.replaceChildren(h('p', { class: 'dev-http__hint' }, `Posílám ${built.request.method} ${built.request.path}…`));
    try {
      const response = await session.request({ ...built.request, timeoutMs: 10000 }, { signal: controller.signal });
      rememberPath(built.request.path);
      showResponse(built, response);
    } catch (error) {
      if (controller.signal.aborted) return;
      result.dataset.state = 'error';
      result.replaceChildren(h('p', { class: 'dev-http__error' }, error.message ?? String(error)));
    } finally {
      sending = false;
      controller = null;
      updateEnabled();
    }
  }

  function rememberPath(value) {
    draft.recent = [value, ...draft.recent.filter((item) => item !== value)].slice(0, 8);
    renderRecent();
  }

  function showProblems(errors) {
    result.dataset.state = 'error';
    result.replaceChildren(h('ul', { class: 'dev-http__problems' }, errors.map((text) => h('li', {}, text))));
  }

  function showResponse(built, response) {
    const notes = [
      built.addedContentType ? `Doplněná hlavička Content-Type: ${built.addedContentType}` : null,
      ...built.warnings,
    ].filter(Boolean);
    const noteList = notes.length ? h('ul', { class: 'dev-http__notes' }, notes.map((text) => h('li', {}, text))) : null;

    if (!response.ok) {
      result.dataset.state = 'error';
      result.replaceChildren(
        noteList ?? '',
        h(
          'p',
          { class: 'dev-http__status', dataset: { tone: 'error' } },
          h('strong', {}, 'Bez odpovědi'),
          h('span', { class: 'dev-http__meta' }, `${response.code} · ${response.durationMs} ms`),
        ),
        h('p', { class: 'dev-http__error' }, response.error),
      );
      return;
    }

    const group = statusGroup(response.status);
    const headers = headerEntries(response.headers);
    const body = describeBody(response);
    result.dataset.state = 'done';
    result.replaceChildren(
      ...[
        noteList,
        h(
          'p',
          { class: 'dev-http__status', dataset: { tone: group.tone } },
          h('strong', {}, `${response.status} ${response.statusText}`),
          h('span', { class: 'dev-http__group' }, group.label),
          h('span', { class: 'dev-http__meta' }, `${response.durationMs} ms · ${formatBytes(bodyBytes(response))}`),
        ),
        h(
          'details',
          { class: 'dev-http__headers' },
          h('summary', {}, `Hlavičky odpovědi (${headers.length})`),
          h('dl', {}, headers.flatMap(([name, value]) => [h('dt', {}, name), h('dd', {}, value)])),
        ),
        body.kind === 'empty'
          ? h('p', { class: 'dev-http__hint' }, built.request.method === 'HEAD' ? 'HEAD vrací jen hlavičky, tělo nemá.' : 'Odpověď nemá tělo.')
          : h('pre', { class: `dev-http__response dev-http__response--${body.kind}`, tabindex: '0', 'aria-label': 'Tělo odpovědi' }, body.text),
        response.bodyTruncated ? h('p', { class: 'dev-http__hint' }, 'Tělo je delší než 1 MB, zobrazený je jen začátek.') : null,
      ].filter(Boolean),
    );
  }

  return {
    element,
    destroy() {
      offChange();
      controller?.abort();
    },
  };
}
