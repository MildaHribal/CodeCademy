import { h } from '../dom.js';
import { errorNotice } from '../components/status.js';

export function renderNotFound(ctx) {
  ctx.setTitle('Stránka nenalezena');
  ctx.root.append(
    h(
      'div',
      { class: 'page' },
      errorNotice({
        title: 'Tahle stránka neexistuje',
        message: 'Odkaz je možná starý nebo v něm je překlep.',
        actions: [h('a', { class: 'btn', href: '#/' }, 'Zpět na přehled')],
      }),
    ),
  );
}
