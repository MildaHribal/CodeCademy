
import { h } from '../dom.js';
import { href } from '../router.js';

export function backLink(nav, { primary = false } = {}) {
  return h('a', { class: primary ? 'btn btn--primary' : 'btn', 'aria-label': 'Back to section / Zpět na sekci', href: nav.sectionHref }, 'Back to section');
}

export function nextModuleLink(nav, { primary = true } = {}) {
  const next = nav.nextModule;
  if (!next) return backLink(nav, { primary });
  return h(
    'a',
    { class: primary ? 'btn btn--primary' : 'btn', 'aria-label': `Next: ${next.title} / Další: ${next.title}`, href: href.module(next.id) },
    `Next: ${next.title}`,
  );
}
