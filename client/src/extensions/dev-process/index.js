// Nástroj dev-process: HTTP klient u běžícího Node procesu (kontrakt kap. 12.7).
import './dev-process.css';
import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { api } from '../../api.js';
import { createConsolePanel } from '../../components/console-panel.js';
import { projectExtensions } from '../../screens/project.js';
import { findMainFile } from '../../workspace/files.js';
import { workspaceExtensions } from '../../workspace/extensions.js';
import { createHttpClient } from './http-client.js';
import { connectConsole, createRunStatus } from './run-view.js';
import { createDevProcessSession, sessionFor } from './session.js';

const STOP_ICON = '<rect x="4" y="4" width="8" height="8" rx="1.2" fill="currentColor"/>';

workspaceExtensions.register({
  id: 'dev-process',
  order: 50,
  setup(ws) {
    if (!ws.isNode || ws.kind === 'parsons') return undefined;
    const session = sessionFor(ws.elements.output);
    if (!session) return undefined;

    const client = createHttpClient({ session, draftKey: ws.item.id });
    const removeClient = ws.addToSlot('output-after', client.element, { order: 50 });
    ws.on('files-change', () => session.markChanged());

    return () => {
      client.destroy();
      removeClient();
    };
  },
});

projectExtensions.register({
  id: 'dev-process',
  order: 50,
  setup(project) {
    if (project.runtime !== 'node') return undefined;
    const panel = createProjectPanel(project);
    const remove = project.addToSlot('after-stories', panel.element, { order: 50 });
    return () => {
      panel.destroy();
      remove();
    };
  },
});

function createProjectPanel(project) {
  const { module } = project;
  const session = createDevProcessSession();
  const consolePanel = createConsolePanel({ emptyText: 'Po spuštění se tu ukáže výstup serveru (console.log i chyby).' });
  const status = createRunStatus(session);
  const client = createHttpClient({ session, draftKey: module.id });
  const titleId = `dev-project-title-${module.id.replace(/\W/g, '-')}`;

  const runLabel = h('span', {}, 'Run server');
  const runButton = h('button', { type: 'button', class: 'btn btn--primary', 'aria-label': 'Run server / Spustit server' }, svg(icons.play), runLabel);
  const stopButton = h('button', { type: 'button', class: 'btn', 'aria-label': 'Stop / Zastavit', hidden: true }, svg(STOP_ICON), 'Stop');
  const message = h('p', { class: 'result__warning', hidden: true });

  const element = h(
    'section',
    { class: 'panel dev-project', 'aria-labelledby': titleId },
    h('h2', { class: 'panel__title', id: titleId }, 'Vyzkoušej server'),
    h(
      'p',
      { class: 'panel__lead' },
      'Spustí projekt z tvé složky (soubory tak, jak jsou uložené na disku) jako běžící server. ',
      'Požadavky mu pošleš HTTP klientem níž nebo odkazem v prohlížeči. Po úpravě ve VS Code ho spusť znovu.',
    ),
    h('div', { class: 'actions' }, runButton, stopButton),
    message,
    status.element,
    h('div', { class: 'dev-project__output' }, consolePanel.element),
    client.element,
  );

  runButton.addEventListener('click', start);
  stopButton.addEventListener('click', () => session.stop().catch((error) => showMessage(error.message)));
  const offConsole = connectConsole(session, consolePanel);
  const offButtons = session.on('change', ({ running, starting, stopping }) => {
    runButton.disabled = starting || stopping;
    stopButton.hidden = !running;
    stopButton.disabled = stopping;
    runLabel.textContent = running ? 'Run again' : 'Run server';
    runButton.setAttribute('aria-label', running ? 'Run again / Spustit znovu' : 'Run server / Spustit server');
  });
  const onPageHide = () => session.dispose();
  window.addEventListener('pagehide', onPageHide);

  function showMessage(text) {
    message.hidden = !text;
    message.textContent = text ?? '';
  }

  async function resolveMain() {
    const fromMeta = module.project.meta?.main;
    if (typeof fromMeta === 'string' && fromMeta) return fromMeta;
    const state = await api.projectFiles(module.sectionId, module.moduleId);
    if (!state.exists) return null;
    return findMainFile(state.files, {})?.name ?? null;
  }

  async function start() {
    showMessage(null);
    runButton.disabled = true;
    try {
      const main = await resolveMain();
      if (project.signal.aborted) return;
      consolePanel.clear();
      consolePanel.system(`$ node ${main ?? '(hlavní soubor projektu)'}`);
      await session.start({
        project: { section: module.sectionId, module: module.moduleId },
        ...(main ? { main } : {}),
      });
    } catch (error) {
      if (project.signal.aborted) return;
      showMessage(error.status === 409 ? 'Nejdřív projekt založ tlačítkem Začít projekt.' : error.message ?? String(error));
    } finally {
      if (!project.signal.aborted) runButton.disabled = session.state().starting;
    }
  }

  return {
    element,
    destroy() {
      window.removeEventListener('pagehide', onPageHide);
      offConsole();
      offButtons();
      status.destroy();
      client.destroy();
      session.dispose();
    },
  };
}
