// Odkaz nadpisu je adresa #/modul/…?kotva=<kotva> (kontrakt kap. 2.9), takže jde zkopírovat.
import './lesson-toc.css';
import { h } from '../dom.js';
import { lessonExtensions } from '../lesson/extensions.js';
import { dockAside } from './orientation/aside.js';

lessonExtensions.register({
  id: 'lesson-toc',
  order: 10,
  setup(lesson) {
    const headings = lesson.headings().filter((heading) => heading.level === 2 || heading.level === 3);
    if (headings.filter((heading) => heading.level === 2).length < 2) return;

    const asideList = tocList(lesson, headings);
    const inlineList = tocList(lesson, headings);

    const aside = h(
      'nav',
      { class: 'lesson-toc lesson-toc--aside', 'aria-label': 'Obsah lekce' },
      h('p', { class: 'lesson-toc__title' }, 'Obsah lekce'),
      asideList.element,
    );
    const inline = h(
      'details',
      { class: 'lesson-toc lesson-toc--inline' },
      h('summary', { class: 'lesson-toc__summary' }, `Obsah lekce (${headings.filter((x) => x.level === 2).length} částí)`),
      h('nav', { 'aria-label': 'Obsah lekce' }, inlineList.element),
    );
    inlineList.onNavigate(() => (inline.open = false));

    lesson.addToSlot('aside', aside, { order: 10 });
    lesson.addToSlot('head', inline, { order: 10 });
    lesson.onCleanup(dockAside(lesson));

    const observer = new IntersectionObserver(() => highlight(), { rootMargin: '0px 0px -66% 0px' });
    headings.forEach((heading) => observer.observe(heading.element));
    const onScroll = () => highlight();
    window.addEventListener('scroll', onScroll, { passive: true });
    lesson.onCleanup(() => window.removeEventListener('scroll', onScroll));
    function highlight() {
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      const limit = atBottom ? window.innerHeight : window.innerHeight / 3;
      let active = headings[0];
      for (const heading of headings) {
        if (heading.element.getBoundingClientRect().top <= limit) active = heading;
      }
      asideList.setActive(active.anchor);
      inlineList.setActive(active.anchor);
    }
    highlight();
    lesson.onCleanup(() => observer.disconnect());
  },
});

function tocList(lesson, headings) {
  const navigateListeners = [];
  const links = new Map();
  const items = headings.map((heading) => {
    const link = h(
      'a',
      {
        class: 'lesson-toc__link',
        href: `#/modul/${lesson.id}?kotva=${heading.anchor}`,
        onclick: (event) => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
          event.preventDefault();
          heading.element.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
          history.replaceState(null, '', link.getAttribute('href'));
          heading.element.setAttribute('tabindex', '-1');
          heading.element.focus({ preventScroll: true });
          navigateListeners.forEach((fn) => fn());
        },
      },
      heading.text,
    );
    links.set(heading.anchor, link);
    return h('li', { class: `lesson-toc__item lesson-toc__item--h${heading.level}` }, link);
  });

  return {
    element: h('ol', { class: 'lesson-toc__list' }, items),
    setActive(anchor) {
      for (const [key, link] of links) {
        if (key === anchor) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    },
    onNavigate: (fn) => navigateListeners.push(fn),
  };
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
