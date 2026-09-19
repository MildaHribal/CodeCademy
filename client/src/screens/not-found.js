import { h } from '../dom.js';
import { errorNotice } from '../components/status.js';

export function renderNotFound(ctx) {
  ctx.setTitle('Page not found');
  ctx.root.append(
    h(
      'div',
      { class: 'page' },
      errorNotice({
        title: 'Page not found / Tahle stránka neexistuje',
        message: 'The link might be old or mistyped.',
        actions: [h('a', { class: 'btn', 'aria-label': 'Back to overview / Zpět na přehled', href: '#/' }, 'Back to overview')],
      }),
    ),
  );
}
