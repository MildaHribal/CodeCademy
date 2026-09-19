// Blok `live`: živá ukázka s editorem a náhledem (kontrakt kap. 5.2), s ovládacími prvky
import { h } from '../../dom.js';
import { createLiveExample } from '../../components/live-example.js';

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
      mount: () => {
        example = createLiveExample(element, block, { number, key: `${env.lesson.id}#live-${env.index}` });
      },
      destroy: () => example?.destroy(),
    };
  },
};
