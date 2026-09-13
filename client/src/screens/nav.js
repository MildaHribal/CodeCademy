// Odkazy, které se opakují na konci modulů: zpět na sekci a další modul.

import { h } from '../dom.js';
import { href } from '../router.js';

export function backLink(nav, { primary = false } = {}) {
  return h('a', { class: primary ? 'btn btn--primary' : 'btn', href: nav.sectionHref }, 'Zpět na sekci');
}

/** Odkaz na další modul v osnově, nebo zpět na sekci, když další není. */
export function nextModuleLink(nav, { primary = true } = {}) {
  const next = nav.nextModule;
  if (!next) return backLink(nav, { primary });
  return h(
    'a',
    { class: primary ? 'btn btn--primary' : 'btn', href: href.module(next.id) },
    `Další: ${next.title}`,
  );
}
