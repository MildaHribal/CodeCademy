
import { h } from '../dom.js';
import { href, hrefForId } from '../router.js';
import { progress, moduleStatus, sectionStatus } from '../progress.js';
import { loadCurriculum, allModules } from '../content.js';
import { MODULE_TYPE_LABELS, modules as modulesText, percent } from '../text.js';
import { segmentedProgress } from '../components/status.js';
import { createExtensionPoint } from '../core/registry.js';
import { createSlots } from '../core/slots.js';
import { withLoading, showLoadError } from './load.js';
import { routeView } from '../extensions/orientation/route.js';
import { riseInEach } from '../motion.js';

const VIEW_KEY = 'akademie.overview.view';

export const overviewExtensions = createExtensionPoint('přehledu');

export async function renderOverview(ctx, route = {}) {
  ctx.setTitle('');
  let curriculum;
  let progressError = null;
  try {
    const data = await withLoading(
      ctx,
      Promise.all([loadCurriculum({ fresh: true }), progress.load().catch((error) => (progressError = error))]),
      'Načítám osnovu…',
    );
    if (!data) return;
    [curriculum] = data;
  } catch (error) {
    showLoadError(ctx, error, { title: 'Osnovu se nepodařilo načíst', backHref: null });
    return;
  }

  const slots = createSlots(['head', 'before-toc', 'end']);
  const page = h(
      'div',
      { class: 'page page--wide overview' },
      h(
        'header',
        { class: 'overview__head' },
        h(
          'div',
          { class: 'overview__intro' },
          h('h1', { class: 'overview__title' }, 'Kurz webového vývoje'),
          h(
            'p',
            { class: 'overview__lead' },
            'Od HTML a CSS přes JavaScript po vlastní fullstack projekty. Kód píšeš přímo tady, testy ti hned řeknou, co ještě chybí.',
          ),
          h('p', { class: 'overview__colophon' }, colophon(curriculum)),
        ),
        resumePanel(curriculum),
      ),
      slots.element('head'),
      progressError
        ? h('p', { class: 'notice notice--warning', role: 'status' }, `Postup se nepodařilo načíst (${progressError.message}). Osnova se ukazuje bez něj.`)
        : null,
      slots.element('before-toc'),
      tocSection(curriculum, { forceParts: Boolean(route.query?.cast) }),
      slots.element('end'),
    );
  ctx.root.append(page);

  fillPartRails(page);
  riseInEach(page.querySelectorAll('.toc-part'), { step: 0.06, distance: 10 });

  const partHeading = route.query?.cast ? document.getElementById(`part-${route.query.cast}`) : null;
  partHeading?.closest('.toc-part')?.scrollIntoView({ block: 'start' });
  ctx.onCleanup(overviewExtensions.mount({ curriculum, signal: ctx.signal, onCleanup: ctx.onCleanup, page, addToSlot: slots.addToSlot }));
}

/**
 * Jediný pohyb, který se spustí sám: lišty částí se při otevření přehledu naplní
 * inkoustem podle postupu. Hodnota je v `--fill` už ve značce, takže bez skriptu
 * (i při vypnutých animacích) je stránka rovnou správně — tohle ji jen přehraje od nuly.
 */
function fillPartRails(page) {
  if (!matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
  const rails = [...page.querySelectorAll('.toc-part__rail')].map((el) => [el, el.style.getPropertyValue('--fill')]);
  if (!rails.length) return;
  for (const [el] of rails) el.style.setProperty('--fill', '0%');
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      for (const [el, target] of rails) el.style.setProperty('--fill', target);
    }),
  );
}

/**
 * Tiráž pod názvem: rozsah kurzu v číslech. Na titulní straně učebnice stojí, kolik
 * toho člověk drží v ruce — tady to samé, spočítané z osnovy, ne napsané natvrdo.
 */
function colophon(curriculum) {
  const sections = curriculum.parts.flatMap((part) => part.sections);
  const entries = allModules(curriculum);
  const hours = Math.round(entries.reduce((sum, entry) => sum + (entry.module.minutes ?? 0), 0) / 60);
  return `${sections.length} sekcí · ${entries.length} modulů · zhruba ${hours} hodin`;
}

function findResumeTarget(curriculum) {
  const entries = allModules(curriculum);
  const lastId = progress.get().lastVisited;

  if (lastId) {
    const moduleId = lastId.split('/').slice(0, 2).join('/');
    const index = entries.findIndex((e) => e.module.id === moduleId);
    if (index !== -1) {
      const entry = entries[index];
      const status = moduleStatus(entry.module);
      if (!status.done) {
        const stepKey = lastId.split('/')[2];
        const target = stepKey && !progress.isCompleted(lastId) ? hrefForId(lastId) : href.module(moduleId);
        return { entry, target, stepKey, started: true };
      }
      const next = entries.slice(index + 1).find((e) => !moduleStatus(e.module).done);
      if (next) return { entry: next, target: href.module(next.module.id), started: false };
    }
  }

  const next = entries.find((e) => !moduleStatus(e.module).done);
  if (!next) return null;
  return { entry: next, target: href.module(next.module.id), started: moduleStatus(next.module).started };
}

function resumePanel(curriculum) {
  const resume = findResumeTarget(curriculum);
  const hasModules = allModules(curriculum).length > 0;

  if (!resume) {
    return h(
      'div',
      { class: 'resume resume--done' },
      h('p', { class: 'resume__title' }, hasModules ? 'Všechny dostupné moduly máš splněné.' : 'Kurz zatím nemá žádné moduly.'),
      h('p', { class: 'resume__meta' }, hasModules ? 'Další sekce se připravují.' : 'Obsah se připravuje.'),
    );
  }

  const { entry, target, stepKey, started } = resume;
  const stepText = stepKey && !progress.isCompleted(`${entry.module.id}/${stepKey}`) ? `, krok ${Number(stepKey)}` : '';
  return h(
    'div',
    { class: 'resume' },
    h('p', { class: 'resume__label' }, started ? 'Rozpracováno' : 'Na řadě'),
    h('p', { class: 'resume__title' }, `${entry.module.title}${stepText}`),
    h('p', { class: 'resume__meta' }, `${MODULE_TYPE_LABELS[entry.module.type]} v sekci ${entry.section.title}`),
    h('a', { class: 'btn btn--primary btn--large resume__action', 'aria-label': started ? 'Continue / Pokračovat' : 'Start / Začít', href: target }, started ? 'Continue' : 'Start'),
  );
}

function tocSection(curriculum, { forceParts }) {
  const view = routeView(curriculum);
  const partsView = h('div', { class: 'toc' }, curriculum.parts.map((part, index) => partBlock(part, index + 1)));
  if (!view.hasRoute) return partsView;

  const numbers = sectionNumbers(curriculum);
  const routeList = routeBlock(view, numbers);
  let current = forceParts ? 'parts' : readView();

  const options = [
    { id: 'parts', label: 'Po částech', title: 'Sekce seskupené podle témat' },
    { id: 'route', label: 'Doporučená trasa', title: 'Pořadí, ve kterém se CSS a JavaScript střídají — jen doporučení, nic se nezamyká' },
  ];
  const buttons = options.map((option) =>
    h('button', { type: 'button', class: 'toc-view__option', title: option.title, dataset: { view: option.id }, onclick: () => show(option.id, true) }, option.label),
  );
  const switcher = h('div', { class: 'toc-view', role: 'group', 'aria-label': 'Pohled na obsah kurzu' }, buttons);

  function show(id, remember) {
    current = id;
    partsView.hidden = id !== 'parts';
    routeList.hidden = id !== 'route';
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.view === id));
    if (remember) writeView(id);
  }
  show(current, false);
  return h('div', { class: 'toc-wrap' }, switcher, partsView, routeList);
}

function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'route' ? 'route' : 'parts';
  } catch {
    return 'parts';
  }
}

function writeView(id) {
  try {
    localStorage.setItem(VIEW_KEY, id);
  } catch {
  }
}

function sectionNumbers(curriculum) {
  const numbers = new Map();
  curriculum.parts.forEach((part, partIndex) =>
    part.sections.forEach((section, index) => numbers.set(section.id, `${partIndex + 1}.${index + 1}`)),
  );
  return numbers;
}

function routeBlock(view, numbers) {
  const row = ({ part, section }) => sectionRow(section, numbers.get(section.id), { partTitle: part.title });
  return h(
    'div',
    { class: 'toc toc--route' },
    h(
      'section',
      { class: 'toc-part', 'aria-labelledby': 'route-title' },
      h(
        'header',
        { class: 'toc-part__head toc-part__head--route' },
        h(
          'div',
          { class: 'toc-part__text' },
          h('h2', { class: 'toc-part__title', id: 'route-title' }, 'Doporučená trasa'),
          h('p', { class: 'toc-part__summary' }, 'Pořadí, ve kterém se CSS a JavaScript střídají. Jen doporučení — každou sekci můžeš otevřít kdykoli.'),
        ),
      ),
      h('ol', { class: 'toc-sections toc-sections--route' }, view.onRoute.map(row)),
    ),
    view.offRoute.length
      ? h(
          'section',
          { class: 'toc-part', 'aria-labelledby': 'off-route-title' },
          h(
            'header',
            { class: 'toc-part__head toc-part__head--route' },
            h(
              'div',
              { class: 'toc-part__text' },
              h('h2', { class: 'toc-part__title', id: 'off-route-title' }, 'Mimo trasu'),
              h('p', { class: 'toc-part__summary' }, 'Rozšíření a sekce, které trasa nezahrnuje.'),
            ),
          ),
          h('ol', { class: 'toc-sections' }, view.offRoute.map(row)),
        )
      : null,
  );
}

function partBlock(part, number) {
  const available = part.sections.filter((s) => s.available && s.modules.length);
  const partFraction = available.length
    ? available.reduce((sum, s) => sum + sectionStatus(s).fraction, 0) / available.length
    : 0;

  return h(
    'section',
    { class: 'toc-part', 'aria-labelledby': `part-${part.id}` },
    available.length
      ? h('span', {
          class: 'toc-part__rail',
          'aria-hidden': 'true',
          dataset: { done: String(partFraction >= 1) },
          style: { '--fill': `${Math.round(partFraction * 100)}%` },
        })
      : null,
    h(
      'header',
      { class: 'toc-part__head' },
      h('span', { class: 'toc-part__number', 'aria-hidden': 'true' }, String(number)),
      h(
        'div',
        { class: 'toc-part__text' },
        h('h2', { class: 'toc-part__title', id: `part-${part.id}` }, part.title),
        part.summary ? h('p', { class: 'toc-part__summary' }, part.summary) : null,
      ),
      available.length ? h('span', { class: 'toc-part__percent' }, percent(partFraction)) : null,
    ),
    h(
      'ol',
      { class: 'toc-sections' },
      part.sections.map((section, index) => sectionRow(section, `${number}.${index + 1}`)),
    ),
  );
}

function rowTags(section, partTitle) {
  const tags = [
    section.uroven === 'rozsireni'
      ? h('span', { class: 'toc-row__tag toc-row__tag--extension', title: 'Nepovinné rozšíření mimo jádro kurzu' }, 'Rozšíření')
      : null,
    partTitle ? h('span', { class: 'toc-row__tag' }, partTitle) : null,
  ].filter(Boolean);
  return tags.length ? h('span', { class: 'toc-row__tags' }, tags) : null;
}

function sectionRow(section, number, { partTitle = null } = {}) {
  if (!section.available) {
    return h(
      'li',
      { class: 'toc-row toc-row--planned', dataset: { uroven: section.uroven ?? 'jadro' } },
      h('span', { class: 'toc-row__number' }, number),
      h(
        'div',
        { class: 'toc-row__main' },
        h('span', { class: 'toc-row__title' }, section.title),
        h('p', { class: 'toc-row__summary' }, rowTags(section, partTitle), section.intro ?? ''),
      ),
      h('span', { class: 'toc-row__planned' }, 'Připravuje se'),
    );
  }

  const status = sectionStatus(section);
  return h(
    'li',
    { class: `toc-row${status.done ? ' toc-row--done' : ''}`, dataset: { uroven: section.uroven ?? 'jadro' } },
    h(
      'span',
      { class: 'toc-row__number', dataset: { done: String(status.done) } },
      number,
    ),
    h(
      'div',
      { class: 'toc-row__main' },
      h('a', { class: 'toc-row__title', href: href.section(section.id) }, section.title),
      h(
        'p',
        { class: 'toc-row__summary' },
        rowTags(section, partTitle),
        `${modulesText(section.modules.length)}, splněno ${status.doneModules}`,
      ),
    ),
    h(
      'div',
      { class: 'toc-row__progress' },
      segmentedProgress(section.modules.map((m) => ({ fraction: moduleStatus(m).fraction, type: m.type })), { label: `Postup v sekci ${section.title}` }),
      h('span', { class: 'toc-row__percent' }, status.done ? 'Splněno' : percent(status.fraction)),
    ),
  );
}
