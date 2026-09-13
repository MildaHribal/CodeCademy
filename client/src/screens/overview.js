// Přehled osnovy: kde pokračovat a obsah kurzu jako obsah učebnice (části → sekce).

import { h } from '../dom.js';
import { href, hrefForId } from '../router.js';
import { progress, moduleStatus, sectionStatus } from '../progress.js';
import { loadCurriculum, allModules } from '../content.js';
import { MODULE_TYPE_LABELS, modules as modulesText, percent } from '../text.js';
import { segmentedProgress } from '../components/status.js';
import { createExtensionPoint } from '../core/registry.js';
import { createSlots } from '../core/slots.js';
import { withLoading, showLoadError } from './load.js';

/**
 * Rozšíření přehledu osnovy („K opakování: 12", statistiky…):
 *   overviewExtensions.register({ id, order, setup(overview) { overview.addToSlot('before-toc', el); } })
 * API: curriculum, signal, onCleanup, page, addToSlot(name, el, { order })
 * sloty: 'head' (pod úvodem a panelem Pokračovat), 'before-toc' (nad obsahem kurzu), 'end'
 */
export const overviewExtensions = createExtensionPoint('přehledu');

export async function renderOverview(ctx) {
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
        ),
        resumePanel(curriculum),
      ),
      slots.element('head'),
      progressError
        ? h('p', { class: 'notice notice--warning', role: 'status' }, `Postup se nepodařilo načíst (${progressError.message}). Osnova se ukazuje bez něj.`)
        : null,
      slots.element('before-toc'),
      h(
        'div',
        { class: 'toc' },
        curriculum.parts.map((part, index) => partBlock(part, index + 1)),
      ),
      slots.element('end'),
    );
  ctx.root.append(page);
  ctx.onCleanup(overviewExtensions.mount({ curriculum, signal: ctx.signal, onCleanup: ctx.onCleanup, page, addToSlot: slots.addToSlot }));
}

/** Kam pokračovat: naposledy otevřený nedokončený modul, jinak první nesplněný. */
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
        // U workshopu jdeme přímo na krok, u ostatních na modul.
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
  const stepText = stepKey ? `, krok ${Number(stepKey)}` : '';
  return h(
    'div',
    { class: 'resume' },
    h('p', { class: 'resume__label' }, started ? 'Rozpracováno' : 'Na řadě'),
    h('p', { class: 'resume__title' }, `${entry.module.title}${stepText}`),
    h('p', { class: 'resume__meta' }, `${MODULE_TYPE_LABELS[entry.module.type]} v sekci ${entry.section.title}`),
    h('a', { class: 'btn btn--primary btn--large resume__action', href: target }, started ? 'Pokračovat' : 'Začít'),
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

function sectionRow(section, number) {
  if (!section.available) {
    return h(
      'li',
      { class: 'toc-row toc-row--planned' },
      h('span', { class: 'toc-row__number' }, number),
      h(
        'div',
        { class: 'toc-row__main' },
        h('span', { class: 'toc-row__title' }, section.title),
        section.intro ? h('p', { class: 'toc-row__summary' }, section.intro) : null,
      ),
      h('span', { class: 'toc-row__planned' }, 'Připravuje se'),
    );
  }

  const status = sectionStatus(section);
  return h(
    'li',
    { class: `toc-row${status.done ? ' toc-row--done' : ''}` },
    h('span', { class: 'toc-row__number' }, number),
    h(
      'div',
      { class: 'toc-row__main' },
      h('a', { class: 'toc-row__title', href: href.section(section.id) }, section.title),
      h(
        'p',
        { class: 'toc-row__summary' },
        `${modulesText(section.modules.length)}, splněno ${status.doneModules}`,
      ),
    ),
    h(
      'div',
      { class: 'toc-row__progress' },
      segmentedProgress(section.modules.map((m) => moduleStatus(m).fraction), { label: `Postup v sekci ${section.title}` }),
      h('span', { class: 'toc-row__percent' }, status.done ? 'Splněno' : percent(status.fraction)),
    ),
  );
}
