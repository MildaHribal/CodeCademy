// „Další na trase" na konci stránky sekce (kontrakt kap. 2.1). Trasa jen radí — odkaz vede
// na další sekci doporučené trasy, u rozšíření navíc na další sekci jádra.
import './next-on-route.css';
import { h } from '../dom.js';
import { href } from '../router.js';
import { sectionStatus } from '../progress.js';
import { sectionExtensions } from '../screens/section.js';
import { nextOnRoute } from './orientation/route.js';

sectionExtensions.register({
  id: 'next-on-route',
  order: 90,
  setup({ curriculum, section, addToSlot }) {
    const { next, core } = nextOnRoute(curriculum, section.id);
    if (!next && !core) return;

    const status = sectionStatus(section);
    const card = (target, label) =>
      h(
        'a',
        { class: 'next-on-route__link', href: href.section(target.id) },
        h('span', { class: 'next-on-route__label' }, label),
        h('span', { class: 'next-on-route__title' }, target.title),
        target.intro ? h('span', { class: 'next-on-route__intro' }, firstSentence(target.intro)) : null,
      );

    addToSlot(
      'end',
      h(
        'nav',
        { class: 'next-on-route', 'aria-label': 'Kam dál' },
        h(
          'p',
          { class: 'next-on-route__lead' },
          status.done ? 'Sekci máš hotovou. Kam dál:' : 'Až budeš se sekcí hotový, pokračuj tady:',
        ),
        h(
          'div',
          { class: 'next-on-route__links' },
          next ? card(next, 'Další na trase') : null,
          core ? card(core, 'Další sekce jádra') : null,
        ),
      ),
    );
  },
});

/** Úvod sekce je markdown; na kartičku stačí první věta bez formátování. */
function firstSentence(markdown) {
  const plain = markdown
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2') // [[pojem|text]] → text
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // [[pojem]] → pojem
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) → text
    .replace(/==/g, '')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const match = plain.match(/^.+?[.!?](?=\s|$)/);
  return match ? match[0] : plain;
}
