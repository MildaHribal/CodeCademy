// Blok `live`: živá ukázka s editorem a náhledem (kontrakt kap. 5.2), s ovládacími prvky
// (`controls`) nebo v režimu předpovědi (`predict`, kap. 5.3). Předpověď nepodmiňuje splnění lekce.
import { h } from '../../dom.js';
import { createLiveExample } from '../../components/live-example.js';

// Živé ukázky a předpovědi se číslují zvlášť („Živá ukázka 2", „Předpověď 1").
const counters = new WeakMap();

function nextNumber(lesson, variant) {
  const byVariant = counters.get(lesson) ?? {};
  byVariant[variant] = (byVariant[variant] ?? 0) + 1;
  counters.set(lesson, byVariant);
  return byVariant[variant];
}

export const liveBlock = {
  kind: 'live',
  render(block, env) {
    const element = h('div', { class: `lesson__live${block.predict ? ' lesson__live--predict' : ''}`, dataset: { block: 'live' } });
    const number = nextNumber(env.lesson, block.predict ? 'predict' : 'live');
    let example = null;
    return {
      element,
      // Iframe náhledu potřebuje být v dokumentu, proto až v mount.
      mount: () => {
        example = createLiveExample(element, block, { number, key: `${env.lesson.id}#live-${env.index}` });
      },
      destroy: () => example?.destroy(),
    };
  },
};
