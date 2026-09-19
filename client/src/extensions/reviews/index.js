// Nástroj opakování (kontrakt kap. 12.3): obrazovka #/opakovani, položka v menu s počtem,
import './reviews.css';
import { h, svg } from '../../dom.js';
import { appEvents } from '../../core/events.js';
import { registerHeaderItem } from '../../core/header.js';
import { registerScreen } from '../../core/screens.js';
import { overviewExtensions } from '../../screens/overview.js';
import { workspaceExtensions } from '../../workspace/extensions.js';
import { reviewsApi } from './api.js';
import { currentSummary, onReviewCount, refreshReviewCount } from './count.js';
import { summaryLine } from './logic.js';
import { renderReviews } from './screen.js';

const REVIEW_ICON =
  '<path d="M13 6.5A5 5 0 0 0 4 4.2M3 9.5a5 5 0 0 0 9 2.3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
  '<path d="M3.6 2v2.6h2.6M12.4 14v-2.6H9.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>';

registerScreen({ name: 'reviews', path: '/opakovani', render: renderReviews });

registerHeaderItem({
  id: 'opakovani',
  order: 20,
  label: 'Review',
  href: '#/opakovani',
  routes: ['reviews'],
  icon: REVIEW_ICON,
  badge: () => {
    const due = currentSummary()?.due ?? 0;
    return due > 0 ? String(due) : null;
  },
});

appEvents.on('route:change', () => refreshReviewCount());
appEvents.on('progress:complete', () => refreshReviewCount({ force: true }));
appEvents.on('progress:reset', () => refreshReviewCount({ force: true }));

overviewExtensions.register({
  id: 'reviews-summary',
  order: 20,
  setup(overview) {
    const line = h('a', { class: 'reviews-line', href: '#/opakovani', hidden: true });
    const render = (summary) => {
      line.hidden = !summary || summary.due === 0;
      if (!line.hidden) line.replaceChildren(svg(REVIEW_ICON, { size: 18 }), h('span', {}, summaryLine(summary)));
    };
    render(currentSummary());
    overview.addToSlot('head', line, { order: 20 });
    const off = onReviewCount(render);
    refreshReviewCount({ force: true });
    return off;
  },
});

workspaceExtensions.register({
  id: 'reviews-self',
  order: 60,
  setup(ws) {
    const id = `step:${ws.item.id}`;
    const button = h('button', { type: 'button', class: 'btn btn--quiet reviews-self', hidden: true }, 'Nezvládl bych to znovu');
    button.title = 'Krok se ti zítra vrátí v opakování od začátku, jen s požadavky';
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await reviewsApi.add(id, 'self');
        button.textContent = 'Zítra v opakování';
        refreshReviewCount({ force: true });
      } catch (error) {
        button.disabled = false;
        button.textContent = 'Nepodařilo se přidat — zkusit znovu';
        console.warn(`Krok ${ws.item.id} se nepodařilo přidat do opakování: ${error.message}`);
      }
    });
    ws.addToSlot('actions', button, { order: 60 });

    const update = () => {
      if (ws.state().completed || ws.state().passed) button.hidden = false;
    };
    update();
    ws.on('step-complete', update);
    ws.on('check-result', update);
  },
});
