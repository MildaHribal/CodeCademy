// Blok `memory`: ručně popsané stavy paměti (kontrakt kap. 5.6).
// Vlevo kód s čísly řádků (zvýrazněný řádek N), vpravo proměnné a objekty; odkazy jsou šipky.
// Krokuje se tlačítky nebo šipkami ←/→. Kód se nespouští.
import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { highlightLines } from '../../markdown.js';
import { changedInStep, splitObjectText } from './memory-logic.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
let memoryCounter = 0;

export const memoryBlock = {
  kind: 'memory',
  render(block, env) {
    const uid = `memory-${++memoryCounter}`;
    const steps = block.steps ?? [];
    let current = 0;

    const lineElements = highlightLines(block.code.content, block.code.lang).map((fragment, index) =>
      h('li', { class: 'memory__line', dataset: { line: String(index + 1) } }, h('span', { class: 'memory__line-number', 'aria-hidden': 'true' }, String(index + 1)), h('code', {}, fragment)),
    );
    const code = h('ol', { class: 'memory__code', 'aria-label': 'Kód ukázky' }, lineElements);

    const caption = h('p', { class: 'memory__caption', id: `${uid}-caption`, 'aria-live': 'polite' });
    const vars = h('ul', { class: 'memory__vars', 'aria-label': 'Proměnné' });
    const heap = h('ul', { class: 'memory__heap', 'aria-label': 'Objekty' });
    const arrows = document.createElementNS(SVG_NS, 'svg');
    arrows.setAttribute('class', 'memory__arrows');
    arrows.setAttribute('aria-hidden', 'true');
    const diagram = h(
      'div',
      { class: 'memory__diagram' },
      h('div', { class: 'memory__column' }, h('p', { class: 'memory__heading' }, 'Proměnné'), vars),
      h('div', { class: 'memory__column' }, h('p', { class: 'memory__heading' }, 'Objekty'), heap),
      arrows,
    );

    const prevButton = h('button', { type: 'button', class: 'btn btn--small', onclick: () => go(current - 1) }, svg(icons.arrowLeft), 'Předchozí');
    const nextButton = h('button', { type: 'button', class: 'btn btn--small', onclick: () => go(current + 1) }, 'Další', svg(icons.arrowRight));
    const position = h('span', { class: 'memory__position' });

    const element = h(
      'section',
      {
        class: 'lesson-block memory',
        'aria-label': 'Stavy paměti',
        'aria-describedby': caption.id,
        tabindex: '0',
        dataset: { block: 'memory' },
        onkeydown: (event) => {
          if (event.key === 'ArrowRight') go(current + 1);
          else if (event.key === 'ArrowLeft') go(current - 1);
          else return;
          event.preventDefault();
        },
      },
      h(
        'header',
        { class: 'block-bar' },
        h('span', { class: 'block-bar__title' }, 'Stavy paměti'),
        h('span', { class: 'block-bar__hint' }, 'Co je v proměnných po každém řádku. Krokuj šipkami ← →.'),
      ),
      h('div', { class: 'memory__body' }, h('div', { class: 'memory__code-wrap' }, code), h('div', { class: 'memory__state' }, caption, diagram)),
      h('footer', { class: 'memory__controls' }, prevButton, position, nextButton),
    );

    let observer = null;

    function renderStep() {
      const step = steps[current];
      if (!step) return;
      // V prvním kroku je nové všechno — zvýrazňují se až změny proti předchozímu stavu.
      const changed = current === 0 ? { bindings: new Set(), objects: new Set() } : changedInStep(steps[current - 1], step);

      for (const line of lineElements) {
        const active = Number(line.dataset.line) === step.line;
        line.classList.toggle('is-current', active);
        if (active) line.setAttribute('aria-current', 'step');
        else line.removeAttribute('aria-current');
      }
      caption.replaceChildren(h('span', { class: 'memory__caption-line' }, `Po řádku ${step.line}`));
      if (step.label) caption.append(`: ${step.label}`);

      vars.replaceChildren(
        ...step.bindings.map((binding) =>
          h(
            'li',
            { class: `memory__binding${changed.bindings.has(binding.name) ? ' is-changed' : ''}`, dataset: { name: binding.name } },
            h('code', { class: 'memory__name' }, binding.name),
            binding.ref
              ? h('span', { class: 'memory__slot memory__slot--ref', dataset: { ref: binding.ref } }, h('span', { class: 'memory__dot' }), h('span', { class: 'visually-hidden' }, `odkaz na objekt ${binding.ref}`))
              : h('code', { class: 'memory__slot memory__value' }, binding.value),
          ),
        ),
      );
      heap.replaceChildren(
        ...step.objects.map((object) =>
          h(
            'li',
            { class: `memory__object${changed.objects.has(object.id) ? ' is-changed' : ''}`, dataset: { id: object.id } },
            h('span', { class: 'memory__object-id' }, object.id),
            h(
              'code',
              { class: 'memory__object-text' },
              splitObjectText(object.text).map((part) =>
                'ref' in part
                  ? h('span', { class: 'memory__inline-ref', dataset: { ref: part.ref } }, h('span', { class: 'memory__dot' }), h('span', { class: 'visually-hidden' }, `odkaz na ${part.ref}`))
                  : part.text,
              ),
            ),
          ),
        ),
      );

      position.textContent = `Krok ${current + 1} z ${steps.length}`;
      prevButton.disabled = current === 0;
      nextButton.disabled = current === steps.length - 1;
      drawArrows();
    }

    function go(index) {
      if (index < 0 || index >= steps.length || index === current) return;
      current = index;
      renderStep();
    }

    /** Šipky od tečky odkazu k objektu; kreslí se až podle skutečné polohy prvků. */
    function drawArrows() {
      if (!element.isConnected) return;
      const box = diagram.getBoundingClientRect();
      arrows.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      arrows.setAttribute('width', String(box.width));
      arrows.setAttribute('height', String(box.height));
      const markerId = `${uid}-head`;
      const paths = [
        `<defs><marker id="${markerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>`,
      ];
      for (const source of diagram.querySelectorAll('[data-ref]')) {
        const target = heap.querySelector(`.memory__object[data-id="${CSS.escape(source.dataset.ref)}"]`);
        const dot = source.querySelector('.memory__dot');
        if (!target || !dot) continue;
        const from = dot.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const x1 = from.left + from.width / 2 - box.left;
        const y1 = from.top + from.height / 2 - box.top;
        const fromObject = source.classList.contains('memory__inline-ref');
        let d;
        if (fromObject) {
          // Odkaz z objektu na jiný objekt: oblouk vpravo od sloupce objektů.
          const x2 = to.right - box.left;
          const y2 = to.top + to.height / 2 - box.top;
          const bend = Math.max(x1, x2) + 28;
          d = `M${x1} ${y1} C${bend} ${y1} ${bend} ${y2} ${x2 + 2} ${y2}`;
        } else {
          const x2 = to.left - box.left - 2;
          const y2 = to.top + Math.min(to.height / 2, 18) - box.top;
          const mid = (x1 + x2) / 2;
          d = `M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`;
        }
        paths.push(`<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#${markerId})"/>`);
      }
      arrows.innerHTML = paths.join('');
    }

    return {
      element,
      mount() {
        renderStep();
        observer = new ResizeObserver(() => drawArrows());
        observer.observe(diagram);
      },
      destroy() {
        observer?.disconnect();
      },
    };
  },
};
