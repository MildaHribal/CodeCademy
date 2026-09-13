// Detail sekce: úvod a seznam modulů s typem, délkou a stavem.

import { h, svg, append } from '../dom.js';
import { href } from '../router.js';
import { icons } from '../icons.js';
import { progress, moduleStatus, sectionStatus } from '../progress.js';
import { loadCurriculum, findSection } from '../content.js';
import { renderMarkdown } from '../markdown.js';
import { MODULE_TYPE_LABELS, minutes, steps as stepsText } from '../text.js';
import { segmentedProgress, statusBadge, errorNotice } from '../components/status.js';
import { createExtensionPoint } from '../core/registry.js';
import { createSlots } from '../core/slots.js';
import { withLoading, showLoadError } from './load.js';
import { partHref } from '../extensions/orientation/route.js';

/**
 * Rozšíření stránky sekce (kalibrace jistoty, tahák, „Po sekci umíš", „Další na trase"…):
 *   sectionExtensions.register({ id, order, setup(sectionPage) { sectionPage.addToSlot('end', el); } })
 * API: curriculum, part, section, signal, onCleanup, page, addToSlot(name, el, { order })
 * sloty: 'head' (pod nadpisem), 'after-progress' (pod ukazatelem postupu), 'end' (pod seznamem modulů)
 * Jen u sekcí, které existují (section.available).
 */
export const sectionExtensions = createExtensionPoint('sekce');

export async function renderSection(ctx, { sectionId }) {
  let curriculum;
  try {
    const data = await withLoading(ctx, Promise.all([loadCurriculum({ fresh: true }), progress.load()]), 'Načítám sekci…');
    if (!data) return;
    [curriculum] = data;
  } catch (error) {
    showLoadError(ctx, error, { title: 'Sekci se nepodařilo načíst' });
    return;
  }

  const found = findSection(curriculum, sectionId);
  if (!found) {
    ctx.root.append(
      h(
        'div',
        { class: 'page' },
        errorNotice({
          title: 'Tahle sekce v osnově není',
          message: `Sekci „${sectionId}“ jsem v osnově nenašel.`,
          actions: [h('a', { class: 'btn', href: '#/' }, 'Zpět na přehled')],
        }),
      ),
    );
    return;
  }

  const { part, section } = found;
  const partNumber = curriculum.parts.indexOf(part) + 1;
  const sectionNumber = `${partNumber}.${part.sections.indexOf(section) + 1}`;
  ctx.setTitle(section.title);
  ctx.setCrumbs([{ label: part.title, href: partHref(part.id) }, { label: section.title }]);

  const page = h('div', { class: 'page section-page' });
  ctx.root.append(page);

  page.append(
    h(
      'header',
      { class: 'section-page__head' },
      h(
        'h1',
        { class: 'section-page__title' },
        h('span', { class: 'section-page__number' }, h('span', { class: 'visually-hidden' }, 'Sekce '), sectionNumber),
        ' ',
        section.title,
      ),
      section.uroven === 'rozsireni'
        ? h('p', { class: 'section-page__level' }, h('span', { class: 'toc-row__tag toc-row__tag--extension' }, 'Rozšíření'), 'Nepovinná sekce navíc — jádro kurzu na ní nestaví.')
        : null,
    ),
  );

  if (!section.available) {
    append(page, [
      section.intro ? h('p', { class: 'section-page__lead' }, section.intro) : null,
      h(
        'div',
        { class: 'notice' },
        h('h2', { class: 'notice__title' }, 'Tahle sekce se připravuje'),
        h('p', { class: 'notice__message' }, 'Obsah zatím není hotový. Mezitím můžeš pokračovat v jiné sekci.'),
        h('div', { class: 'notice__actions' }, h('a', { class: 'btn', href: '#/' }, 'Zpět na přehled')),
      ),
    ]);
    return;
  }

  const status = sectionStatus(section);
  const slots = createSlots(['head', 'after-progress', 'end']);
  append(page, [
    slots.element('head'),
    section.intro ? renderMarkdown(section.intro, { className: 'prose section-page__intro' }) : null,
    h(
      'div',
      { class: 'section-page__progress' },
      segmentedProgress(section.modules.map((m) => moduleStatus(m).fraction), { label: `Postup v sekci ${section.title}` }),
      h(
        'p',
        {},
        status.done ? 'Sekce je splněná.' : `Splněno ${status.doneModules} z ${status.totalModules} modulů.`,
      ),
    ),
    slots.element('after-progress'),
    h(
      'ol',
      { class: 'module-list' },
      section.modules.map((module) => moduleRow(module)),
    ),
    slots.element('end'),
  ]);
  ctx.onCleanup(
    sectionExtensions.mount({ curriculum, part, section, signal: ctx.signal, onCleanup: ctx.onCleanup, page, addToSlot: slots.addToSlot }),
  );
}

function moduleRow(module) {
  const status = moduleStatus(module);
  const isWorkshop = module.type === 'workshop';
  const detail = isWorkshop && status.started && !status.done ? `${status.doneSteps} z ${module.stepCount} kroků` : null;
  const meta = [minutes(module.minutes), isWorkshop ? stepsText(module.stepCount) : null].filter(Boolean);

  return h(
    'li',
    { class: 'module-row', dataset: { type: module.type, done: String(status.done) } },
    h(
      'span',
      { class: 'module-row__icon' },
      svg(status.done ? icons.check : status.started ? icons.half : icons.circle, { size: 20 }),
    ),
    h(
      'div',
      { class: 'module-row__main' },
      h('p', { class: 'module-row__type' }, MODULE_TYPE_LABELS[module.type]),
      h('h2', { class: 'module-row__title' }, h('a', { href: href.module(module.id) }, module.title)),
      module.summary ? h('p', { class: 'module-row__summary' }, module.summary) : null,
    ),
    h(
      'div',
      { class: 'module-row__side' },
      statusBadge(status, { detail }),
      meta.length ? h('p', { class: 'module-row__meta' }, meta.join(', ')) : null,
    ),
  );
}
