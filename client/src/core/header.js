// Položky menu v horní liště (Hledat, Opakování, Poznámky, Pískoviště, Statistiky…).
// Jádro žádné položky nemá — přidávají je nástroje:
//
//   registerHeaderItem({
//     id: 'opakovani', order: 20, label: 'Opakování', href: '#/opakovani',
//     icon: icons.reset,                   // nepovinné: SVG cesta z icons.js
//     routes: ['reviews'],                 // nepovinné: na kterých obrazovkách je položka aktivní
//     badge: () => '12',                   // nepovinné: krátký text vedle popisku (volá se při každém překreslení)
//     onClick: (event) => {},              // nepovinné: místo odkazu akce (např. otevřít hledání)
//     shortcut: 'Ctrl+K',                  // nepovinné: jen popisek v title
//   });
//
// Menu se překreslí při každé změně obrazovky; refreshHeader() ho překreslí hned (např. nový počet).
import { h, svg } from '../dom.js';
import { createRegistry } from './registry.js';

const items = createRegistry('Položka hlavičky');
let container = null;
let currentRoute = null;

export function registerHeaderItem(item) {
  const remove = items.add(item);
  refreshHeader();
  return () => {
    remove();
    refreshHeader();
  };
}

/** Připojí menu do prvku v hlavičce (volá main.js jednou). */
export function mountHeaderMenu(element) {
  container = element;
  refreshHeader();
}

/** Nastaví aktuální obrazovku a překreslí menu. */
export function setHeaderRoute(route) {
  currentRoute = route;
  refreshHeader();
}

export function refreshHeader() {
  if (!container) return;
  const list = items.list();
  container.hidden = list.length === 0;
  if (list.length === 0) {
    container.replaceChildren();
    return;
  }
  container.replaceChildren(
    h(
      'ul',
      { class: 'app-menu' },
      list.map((item) => {
        const active = Boolean(currentRoute && item.routes?.includes(currentRoute.name));
        const badge = item.badge?.();
        const content = [
          item.icon ? svg(item.icon) : null,
          h('span', { class: 'app-menu__label' }, item.label),
          badge ? h('span', { class: 'app-menu__badge' }, badge) : null,
        ];
        const attrs = {
          class: 'app-menu__item',
          'aria-current': active ? 'page' : null,
          title: item.shortcut ? `${item.label} (${item.shortcut})` : null,
          dataset: { item: item.id },
        };
        const control = item.onClick && !item.href
          ? h('button', { ...attrs, type: 'button', onclick: item.onClick }, content)
          : h('a', { ...attrs, href: item.href, onclick: item.onClick ?? null }, content);
        return h('li', {}, control);
      }),
    ),
  );
}
