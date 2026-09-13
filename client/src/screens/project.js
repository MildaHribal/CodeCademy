// Projekt ve VS Code: zadání, založení složky, příkaz pro otevření a kontrola.
// Soubory projektu leží na disku v moje-projekty/. Kontrola u runtime dom
// načte soubory a spustí testy v prohlížeči, u node je spustí server.

import { h, svg, append, replace } from '../dom.js';
import { icons } from '../icons.js';
import { api } from '../api.js';
import { progress } from '../progress.js';
import { renderMarkdown } from '../markdown.js';
import { runTests, mountPreview } from '../run.js';
import { minutes } from '../text.js';
import { createHintList } from '../components/hint-list.js';
import { createConsolePanel } from '../components/console-panel.js';
import { copyField } from '../components/copy-field.js';
import { nextModuleLink } from './nav.js';

export function renderProject(ctx, { module, nav }) {
  const project = module.project;
  const runtime = project.runtime;
  const isNode = runtime === 'node';
  const { sectionId, moduleId } = module;

  let projectDir = null;
  let checking = false;

  const page = h('article', { class: 'page project' });
  ctx.root.append(page);

  const doneBadge = () => h('span', { class: 'badge badge--done' }, svg(icons.check, { size: 14 }), 'Splněno');
  const meta = h(
    'p',
    { class: 'module-head__meta' },
    ['Projekt ve VS Code', minutes(module.minutes)].filter(Boolean).join(', '),
    progress.isCompleted(module.id) ? doneBadge() : null,
  );

  // ——— Složka projektu ———
  const folderBox = h('div', { class: 'project__folder-body' });
  const folder = h(
    'section',
    { class: 'panel project__folder', 'aria-labelledby': 'project-folder-title' },
    h('h2', { class: 'panel__title', id: 'project-folder-title' }, svg(icons.folder, { size: 18 }), 'Složka projektu'),
    folderBox,
  );

  // ——— Uživatelské příběhy a kontrola ———
  const hintList = createHintList(project.hints, { ordered: true });
  const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite' });
  const checkButton = h('button', { type: 'button', class: 'btn btn--primary', disabled: true, onclick: check }, 'Zkontrolovat');
  const checkNote = h('p', { class: 'project__check-note' }, 'Kontrola čte soubory přímo z disku — nezapomeň je ve VS Code uložit.');

  const stories = h(
    'section',
    { class: 'panel project__stories', 'aria-labelledby': 'project-stories-title' },
    h('h2', { class: 'panel__title', id: 'project-stories-title' }, 'Uživatelské příběhy'),
    h('p', { class: 'panel__lead' }, 'Tohle musí projekt splňovat. Kontrola ověří každý bod zvlášť.'),
    hintList.element,
    result,
    h('div', { class: 'actions' }, checkButton),
    checkNote,
  );

  append(page, [
    h('header', { class: 'module-head' }, meta, h('h1', { class: 'module-head__title' }, module.title)),
    renderMarkdown(project.description, { className: 'prose project__description' }),
    folder,
    stories,
    isNode ? null : previewSection(),
  ]);

  loadFolderState();

  async function loadFolderState() {
    folderBox.replaceChildren(h('p', { class: 'loading' }, 'Zjišťuju, jestli už projekt máš…'));
    try {
      const state = await api.projectFiles(sectionId, moduleId);
      if (ctx.signal.aborted) return;
      if (state.exists) showFolder(state.dir, false);
      else showStart();
    } catch (error) {
      if (ctx.signal.aborted) return;
      folderBox.replaceChildren(
        h('p', { class: 'result__warning' }, `Stav projektu se nepodařilo zjistit: ${error.message}`),
        h('button', { type: 'button', class: 'btn', onclick: loadFolderState }, 'Zkusit znovu'),
      );
    }
  }

  function showStart() {
    const startButton = h('button', { type: 'button', class: 'btn btn--primary' }, 'Začít projekt');
    startButton.addEventListener('click', async () => {
      startButton.disabled = true;
      try {
        const { dir, created } = await api.startProject(sectionId, moduleId);
        if (!ctx.signal.aborted) showFolder(dir, created);
      } catch (error) {
        startButton.disabled = false;
        folderBox.append(h('p', { class: 'result__warning' }, `Projekt se nepodařilo založit: ${error.message}`));
      }
    });
    folderBox.replaceChildren(
      h(
        'p',
        {},
        'Projekt zatím nemáš založený. Tlačítko zkopíruje výchozí soubory do tvé složky moje-projekty, kde s nimi budeš pracovat ve VS Code.',
      ),
      h('div', { class: 'actions' }, startButton),
    );
  }

  function showFolder(dir, justCreated) {
    projectDir = dir;
    checkButton.disabled = false;
    const quoted = /\s/.test(dir) ? `"${dir}"` : dir;
    replace(
      folderBox,
      justCreated ? h('p', { class: 'project__created' }, svg(icons.check, { size: 16 }), 'Výchozí soubory jsou připravené.') : null,
      copyField('Cesta ke složce', dir),
      copyField('Otevření ve VS Code (v terminálu)', `code ${quoted}`),
    );
  }

  async function check() {
    if (checking || !projectDir) return;
    checking = true;
    checkButton.disabled = true;
    checkButton.textContent = 'Kontroluju…';
    hintList.running();
    result.dataset.kind = 'running';
    result.replaceChildren(h('p', {}, isNode ? 'Spouštím testy projektu…' : 'Načítám soubory a spouštím testy…'));

    try {
      // ctx.signal: při odchodu z obrazovky se běžící kontrola zruší (v prohlížeči i na serveru).
      const run = isNode ? await api.checkProject(sectionId, moduleId, { signal: ctx.signal }) : await runInBrowser();
      if (ctx.signal.aborted) return;
      hintList.setResults(run.results ?? []);
      if (run.ok) await markDone();
      else showFailure(run);
    } catch (error) {
      if (ctx.signal.aborted) return;
      hintList.reset();
      result.dataset.kind = 'error';
      result.replaceChildren(
        h('p', { class: 'result__title' }, 'Kontrolu se nepodařilo spustit.'),
        h('pre', { class: 'result__pre' }, error.message ?? String(error)),
      );
    } finally {
      checking = false;
      checkButton.disabled = false;
      checkButton.textContent = 'Zkontrolovat';
    }
  }

  async function runInBrowser() {
    const { files } = await api.projectFiles(sectionId, moduleId);
    return runTests({
      runtime,
      files: files.map(({ name, content }) => ({ name, content })),
      hints: project.hints,
      signal: ctx.signal,
      ...(typeof project.meta?.timeoutMs === 'number' ? { timeoutMs: project.meta.timeoutMs } : {}),
    });
  }

  function showFailure(run) {
    const passedCount = (run.results ?? []).filter((r) => r.pass).length;
    result.dataset.kind = 'fail';
    replace(
      result,
      h('p', { class: 'result__title' }, `Splněno ${passedCount} z ${project.hints.length}.`),
      h('p', {}, 'U nesplněných bodů si rozbal, proč neprošly, oprav kód ve VS Code, ulož a zkontroluj znovu.'),
      run.errors?.length ? h('pre', { class: 'result__pre' }, run.errors.join('\n')) : null,
    );
  }

  async function markDone() {
    result.dataset.kind = 'pass';
    result.replaceChildren(h('p', { class: 'result__title' }, svg(icons.check, { size: 18 }), 'Projekt je splněný.'));
    try {
      await progress.complete(module.id);
      if (!meta.querySelector('.badge')) meta.append(doneBadge());
    } catch (error) {
      result.append(h('p', { class: 'result__warning' }, `Splnění se nepodařilo uložit: ${error.message}`));
    }
    result.append(h('div', { class: 'actions' }, nextModuleLink(nav)));
  }

  // ——— Náhled stránky (jen dom/vue) ———
  function previewSection() {
    const frameHost = h('div', { class: 'project__frame' });
    const consolePanel = createConsolePanel();
    const status = h('p', { class: 'panel__lead', role: 'status' }, 'Náhled poskládá stránku ze souborů projektu na disku.');
    const outputs = h('div', { class: 'project__preview-output', hidden: true }, frameHost, consolePanel.element);
    const button = h('button', { type: 'button', class: 'btn' }, svg(icons.eye), 'Zobrazit náhled');
    let preview = null;

    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        const state = await api.projectFiles(sectionId, moduleId);
        if (ctx.signal.aborted) return;
        if (!state.exists) {
          status.textContent = 'Nejdřív projekt založ tlačítkem Začít projekt.';
          return;
        }
        const files = state.files.map(({ name, content }) => ({ name, content }));
        outputs.hidden = false;
        consolePanel.clear();
        if (preview) {
          preview.update({ runtime, files });
        } else {
          preview = mountPreview(frameHost, { runtime, files });
          preview.onConsole?.((entry) => consolePanel.receive(entry));
          ctx.onCleanup(() => preview.destroy());
        }
        button.replaceChildren(svg(icons.reset), 'Načíst znovu z disku');
        status.textContent = `Načteno ${new Date().toLocaleTimeString('cs-CZ')}.`;
      } catch (error) {
        status.textContent = `Náhled se nepodařilo načíst: ${error.message}`;
      } finally {
        button.disabled = false;
      }
    });

    return h(
      'section',
      { class: 'panel project__preview', 'aria-labelledby': 'project-preview-title' },
      h('h2', { class: 'panel__title', id: 'project-preview-title' }, 'Náhled'),
      status,
      h('div', { class: 'actions' }, button),
      outputs,
    );
  }
}
