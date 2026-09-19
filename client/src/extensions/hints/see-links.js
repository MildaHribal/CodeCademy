// Odkazy `see` (reference na výklad, kontrakt kap. 2.9) jako seznam odkazů s názvy.
import { h } from '../../dom.js';
import { loadCurriculum, loadModule } from '../../content.js';
import { parseRef, refHref } from '../../../../shared/refs.js';

export function renderSeeLinks(refs, { signal } = {}) {
  const links = (refs ?? [])
    .map((ref) => ({ ref, parsed: parseRef(ref) }))
    .filter(({ parsed }) => parsed)
    .map(({ ref, parsed }) => {
      const anchor = h('a', { href: refHref(parsed), class: 'hint-tips__see-link' }, ref);
      describeRef(parsed)
        .then((label) => {
          if (!signal?.aborted && label) anchor.textContent = label;
        })
        .catch(() => {});
      return h('li', {}, anchor);
    });
  return links.length ? h('ul', { class: 'hint-tips__see' }, links) : null;
}

async function describeRef(parsed) {
  const curriculum = await loadCurriculum();
  const module = curriculum.parts
    .flatMap((part) => part.sections)
    .flatMap((section) => section.modules)
    .find((m) => m.id === parsed.moduleId);
  if (!module) return null;
  if (parsed.stepId) return `${module.title} › krok ${Number(parsed.stepId.split('/').pop())}`;
  if (!parsed.anchor) return module.title;
  const [sectionId, moduleSlug] = parsed.moduleId.split('/');
  const detail = await loadModule(sectionId, moduleSlug);
  const heading = detail.lesson?.headings?.find((item) => item.anchor === parsed.anchor);
  return heading ? `${module.title} › ${heading.text.replace(/[`*_]/g, '')}` : module.title;
}
