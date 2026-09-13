// Obrazovka #/statistiky: kde ses zasekl, které otázky nešly, kde jsi otevřel řešení
// a kolik času jsi strávil v sekcích. Bez grafů a bodů — slouží jako mapa míst,
// ke kterým se vyplatí vrátit (a autorovi ukáže, co je špatně vysvětlené).
import { h } from '../../dom.js';
import { loadCurriculum, allModules } from '../../content.js';
import { renderMarkdown } from '../../markdown.js';
import { withLoading, showLoadError } from '../../screens/load.js';
import { attemptsApi } from '../attempts/api.js';
import { renderSeeLinks } from '../hints/see-links.js';
import { formatDuration, itemHref, stepNumber, timesText } from './format.js';

export async function renderStats(ctx) {
  ctx.setTitle('Statistiky');
  ctx.setCrumbs([{ label: 'Statistiky' }]);

  let stats;
  let curriculum;
  try {
    const data = await withLoading(
      ctx,
      Promise.all([attemptsApi.stats({ signal: ctx.signal }), loadCurriculum().catch(() => null)]),
      'Načítám statistiky…',
    );
    if (!data) return;
    [stats, curriculum] = data;
  } catch (error) {
    showLoadError(ctx, error, { title: 'Statistiky se nepodařilo načíst' });
    return;
  }

  const moduleTitles = new Map(curriculum ? allModules(curriculum).map(({ module }) => [module.id, module.title]) : []);
  /** „Workshop X · krok 3" — kde položka v kurzu leží. */
  const whereText = (id) => {
    const moduleId = id.split('/').slice(0, 2).join('/');
    const parts = [moduleTitles.get(moduleId) ?? moduleId];
    const step = stepNumber(id);
    if (step !== null) parts.push(`krok ${step}`);
    return parts.join(' · ');
  };

  const isEmpty = ['topFailedHints', 'wrongQuestions', 'solutionViewed', 'timeBySection'].every((key) => !stats[key]?.length);
  const page = h(
    'div',
    { class: 'page stats' },
    h(
      'header',
      { class: 'stats__head' },
      h('h1', { class: 'stats__title' }, 'Statistiky'),
      h('p', { class: 'stats__lead' }, 'Místa, kde ses zasekl, a čas strávený v sekcích. Nejsou to body — je to seznam věcí, ke kterým se vyplatí vrátit.'),
    ),
    isEmpty
      ? h(
        'div',
        { class: 'notice' },
        h('h2', { class: 'notice__title' }, 'Zatím tu nic není'),
        h('p', { class: 'notice__message' }, 'Statistiky se plní samy, když kontroluješ kroky, otevíráš tipy a odpovídáš na otázky.'),
      )
      : [
        section('Požadavky, na kterých ses nejvíc zasekl', stats.topFailedHints, (entry) =>
          h(
            'li',
            { class: 'stats__item' },
            h('div', { class: 'stats__item-head' }, h('a', { href: itemHref(entry.id) }, entry.title), countBadge(timesText(entry.fails, 'neprošlo'))),
            h('p', { class: 'stats__where' }, `${whereText(entry.id)} · požadavek ${entry.hintIndex + 1}`),
            renderMarkdown(entry.hintText, { className: 'prose stats__text' }),
          )),
        section('Otázky, které ti nešly', stats.wrongQuestions, (entry) =>
          h(
            'li',
            { class: 'stats__item' },
            h('div', { class: 'stats__item-head' }, h('a', { href: itemHref(entry.moduleId) }, moduleTitles.get(entry.moduleId) ?? entry.moduleId), countBadge(timesText(entry.wrong, 'špatně'))),
            renderMarkdown(entry.text, { className: 'prose stats__text' }),
            entry.see?.length ? h('div', { class: 'stats__see' }, h('p', { class: 'stats__where' }, 'Zopakuj si:'), renderSeeLinks(entry.see, { signal: ctx.signal })) : null,
          )),
        section('Kde ses díval na řešení', stats.solutionViewed, (entry) =>
          h(
            'li',
            { class: 'stats__item' },
            h(
              'div',
              { class: 'stats__item-head' },
              h('a', { href: itemHref(entry.id) }, entry.title),
              h('span', { class: `badge ${entry.assisted ? 'badge--started' : 'badge--done'}` }, entry.assisted ? 'před splněním' : 'po splnění'),
            ),
            h('p', { class: 'stats__where' }, whereText(entry.id)),
          )),
        timeTable(stats.timeBySection),
      ],
  );
  ctx.root.append(page);
}

function countBadge(text) {
  return h('span', { class: 'stats__count' }, text);
}

function section(title, entries, renderEntry) {
  return h(
    'section',
    { class: 'stats__section' },
    h('h2', { class: 'stats__section-title' }, title),
    entries?.length ? h('ol', { class: 'stats__list' }, entries.map(renderEntry)) : h('p', { class: 'stats__empty' }, 'Zatím nic.'),
  );
}

function timeTable(rows) {
  const total = (rows ?? []).reduce((sum, row) => sum + row.activeMs, 0);
  return h(
    'section',
    { class: 'stats__section' },
    h('h2', { class: 'stats__section-title' }, 'Čas po sekcích'),
    rows?.length
      ? h(
        'table',
        { class: 'stats__table' },
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Sekce'), h('th', { scope: 'col' }, 'Aktivní čas'))),
        h(
          'tbody',
          {},
          rows.map((row) => h('tr', {}, h('th', { scope: 'row' }, h('a', { href: `#/sekce/${row.sectionId}` }, row.title)), h('td', {}, formatDuration(row.activeMs)))),
        ),
        h('tfoot', {}, h('tr', {}, h('th', { scope: 'row' }, 'Celkem'), h('td', {}, formatDuration(total)))),
      )
      : h('p', { class: 'stats__empty' }, 'Zatím nic.'),
    h('p', { class: 'stats__note' }, 'Počítá se čas, kdy na kroku, labu nebo projektu opravdu pracuješ — po minutě bez klávesnice a myši se měření zastaví.'),
  );
}
