// Hledání (#/hledat): ve vlně 2 jen místo v menu a obrazovka „připravuje se"
// (kontrakt kap. 12.8). Vyhledávání v obsahu doplní vlna 3.
import { h } from '../dom.js';
import { icons } from '../icons.js';
import { registerHeaderItem } from '../core/header.js';
import { registerScreen } from '../core/screens.js';

registerScreen({
  name: 'search',
  path: '/hledat',
  render(ctx) {
    ctx.setTitle('Hledání');
    ctx.setCrumbs([{ label: 'Hledání' }]);
    ctx.root.append(
      h(
        'div',
        { class: 'page' },
        h('header', { class: 'module-head' }, h('h1', { class: 'module-head__title' }, 'Hledání')),
        h(
          'div',
          { class: 'notice' },
          h('h2', { class: 'notice__title' }, 'Hledání se připravuje'),
          h(
            'p',
            { class: 'notice__message' },
            'Brzy tu půjde hledat v lekcích, nadpisech a pojmech. Zatím najdeš sekce v přehledu kurzu a vlastní zápisky v poznámkách.',
          ),
          h(
            'div',
            { class: 'notice__actions' },
            h('a', { class: 'btn btn--primary', href: '#/' }, 'Přehled kurzu'),
            h('a', { class: 'btn', href: '#/poznamky' }, 'Poznámky'),
          ),
        ),
      ),
    );
  },
});

registerHeaderItem({ id: 'hledat', order: 10, label: 'Hledat', href: '#/hledat', routes: ['search'], icon: icons.search });
