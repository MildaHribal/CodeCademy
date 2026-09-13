// Modul: načte data a předá je obrazovce podle typu (lekce, workshop, lab, kvíz, projekt).

import { h } from '../dom.js';
import { href, redirect } from '../router.js';
import { progress } from '../progress.js';
import { loadCurriculum, loadModule, findSection, allModules } from '../content.js';
import { MODULE_TYPE_LABELS } from '../text.js';
import { errorNotice } from '../components/status.js';
import { withLoading, showLoadError } from './load.js';
import { backLink } from './nav.js';
import { renderWorkspace } from '../workspace/index.js';
import { renderLesson } from './lesson.js';
import { renderQuiz } from './quiz.js';
import { renderProject } from './project.js';

export async function renderModule(ctx, { sectionId, moduleId, stepKey }) {
  const id = `${sectionId}/${moduleId}`;

  // Osnova a postup jsou potřeba jen pro navigaci — když selžou, modul se ukáže i tak.
  let data;
  try {
    data = await withLoading(
      ctx,
      Promise.all([
        loadModule(sectionId, moduleId),
        loadCurriculum().catch(() => null),
        progress.load().catch(() => null),
      ]),
      'Načítám modul…',
    );
    if (!data) return;
  } catch (error) {
    const title = error.status === 404 ? 'Tenhle modul neexistuje' : 'Modul se nepodařilo načíst';
    ctx.setCrumbs([{ label: sectionId, href: href.section(sectionId) }, { label: moduleId }]);
    // Když osnova jde načíst, ukážeme v navigaci aspoň skutečné názvy.
    loadCurriculum()
      .then((curriculum) => {
        const found = findSection(curriculum, sectionId);
        const title = found?.section.modules.find((m) => m.id === id)?.title ?? moduleId;
        if (found && !ctx.signal.aborted) ctx.setCrumbs([{ label: found.section.title, href: href.section(sectionId) }, { label: title }]);
      })
      .catch(() => {});
    showLoadError(ctx, error, { title, backHref: href.section(sectionId), backLabel: 'Zpět na sekci' });
    return;
  }

  const [module, curriculum] = data;
  const found = curriculum ? findSection(curriculum, sectionId) : null;
  const section = found?.section ?? { id: sectionId, title: sectionId, modules: [] };
  const nav = {
    section,
    sectionHref: href.section(sectionId),
    nextModule: curriculum ? nextModuleAfter(curriculum, id) : null,
  };

  ctx.setTitle(module.title);
  const crumbs = [{ label: section.title, href: nav.sectionHref }, { label: module.title }];
  ctx.setCrumbs(crumbs);

  switch (module.type) {
    case 'workshop':
      return renderWorkshopStep(ctx, module, stepKey, nav, crumbs);
    case 'lab':
      return renderWorkspace(ctx, { module, item: module.lab, nav });
    case 'lesson':
      return renderLesson(ctx, { module, nav });
    case 'quiz':
      return renderQuiz(ctx, { module, nav });
    case 'project':
      return renderProject(ctx, { module, nav });
    default:
      ctx.root.append(
        h('div', { class: 'page' }, errorNotice({ title: `Neznámý typ modulu „${module.type}“`, actions: [backLink(nav)] })),
      );
  }
}

function renderWorkshopStep(ctx, module, stepKey, nav, crumbs) {
  const steps = module.steps;
  const keyOf = (step) => step.id.split('/').pop();

  if (!stepKey) {
    // Bez čísla kroku: naposledy otevřený krok tohoto workshopu, jinak první nesplněný.
    const last = progress.get().lastVisited;
    const lastStep = steps.find((s) => s.id === last && !progress.isCompleted(s.id));
    const target = lastStep ?? steps.find((s) => !progress.isCompleted(s.id)) ?? steps[0];
    redirect(href.step(target.id));
    return;
  }

  const index = steps.findIndex((s) => keyOf(s) === stepKey);
  if (index === -1) {
    ctx.root.append(
      h(
        'div',
        { class: 'page' },
        errorNotice({
          title: `Krok ${stepKey} v tomhle workshopu není`,
          message: `Workshop „${module.title}“ má ${steps.length} kroků.`,
          actions: [h('a', { class: 'btn btn--primary', href: href.module(module.id) }, 'Otevřít workshop'), backLink(nav)],
        }),
      ),
    );
    return;
  }

  ctx.setCrumbs([...crumbs.slice(0, -1), { label: module.title, href: href.module(module.id) }, { label: `Krok ${index + 1}` }]);
  ctx.setTitle(`${steps[index].title} – ${module.title}`);
  return renderWorkspace(ctx, { module, item: steps[index], nav, steps, stepIndex: index });
}

function nextModuleAfter(curriculum, moduleId) {
  const entries = allModules(curriculum);
  const index = entries.findIndex((e) => e.module.id === moduleId);
  const next = index === -1 ? null : entries[index + 1];
  if (!next) return null;
  return { ...next.module, sectionTitle: next.section.title, typeLabel: MODULE_TYPE_LABELS[next.module.type] };
}
