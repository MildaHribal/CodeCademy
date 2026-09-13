// Společné kousky UI běžícího procesu: řádek stavu a napojení výstupu na konzoli.
// Používá je výstup kroku (workspace/output-node.js) i panel projektu (index.js).
import { h } from '../../dom.js';

/**
 * Řádek stavu: „Poslouchá na http://127.0.0.1:41234" s odkazem do nové karty,
 * „Program běží", „Skončil s kódem 1"… a upozornění, když se kód od spuštění změnil.
 */
export function createRunStatus(session) {
  const dot = h('span', { class: 'dev-status__dot', 'aria-hidden': 'true' });
  const text = h('span', { class: 'dev-status__text' });
  const note = h('span', { class: 'dev-status__note' });
  const element = h('p', { class: 'dev-status', role: 'status', 'aria-live': 'polite', hidden: true }, dot, text, note);

  function update(state = session.state()) {
    const { process, own, starting, stopping, stale, error } = state;
    let tone = 'idle';
    const parts = [];
    if (starting) {
      tone = 'busy';
      parts.push('Spouštím…');
    } else if (stopping) {
      tone = 'busy';
      parts.push('Zastavuji…');
    } else if (process && own && process.status === 'running') {
      tone = 'running';
      if (process.listening) {
        parts.push(
          'Poslouchá na ',
          h('a', { href: process.url, target: '_blank', rel: 'noopener', title: 'Otevřít v nové kartě prohlížeče' }, process.url),
        );
      } else {
        parts.push('Program běží, zatím neposlouchá na portu.');
      }
    } else if (process && own) {
      tone = process.exitCode === 0 ? 'idle' : 'stopped';
      parts.push(process.signal ? 'Proces neběží (zastavený).' : `Proces skončil s kódem ${process.exitCode}.`);
    }
    element.hidden = parts.length === 0 && !error;
    element.dataset.tone = error ? 'error' : tone;
    text.replaceChildren(...parts);
    note.textContent = error
      ? `Spojení se serverem Akademie selhalo: ${error}`
      : stale && tone === 'running'
        ? 'Kód se od spuštění změnil — spusť znovu, ať běží nová verze.'
        : '';
  }

  const off = session.on('change', update);
  update();
  return { element, update, destroy: off };
}

/** Výstup procesu → konzole (stdout = log, stderr = chyba, zprávy platformy = info). */
export function connectConsole(session, consolePanel) {
  return session.on('output', (entries) => consolePanel.receive(entries));
}
