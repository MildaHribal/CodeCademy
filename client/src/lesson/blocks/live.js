// Blok `live`: živá ukázka s editorem a náhledem (kontrakt kap. 5).
import { h } from '../../dom.js';
import { createLiveExample } from '../../components/live-example.js';

export const liveBlock = {
  kind: 'live',
  render(block, env) {
    const element = h('div', { class: 'lesson__live' });
    let example = null;
    return {
      element,
      // Iframe náhledu potřebuje být v dokumentu, proto až v mount.
      mount: () => {
        example = createLiveExample(element, block, { number: env.number });
      },
      destroy: () => example?.destroy(),
    };
  },
};
