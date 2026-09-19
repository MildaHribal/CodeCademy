// Jistota odpovědí na stránce sekce: jedna věta kalibrace (kontrakt kap. 12.4),
import './reviews/reviews.css';
import { h } from '../dom.js';
import { sectionExtensions } from '../screens/section.js';
import { confidenceApi } from './reviews/api.js';
import { calibrationSentence } from './reviews/logic.js';

sectionExtensions.register({
  id: 'confidence-calibration',
  order: 20,
  setup(sectionPage) {
    const line = h('p', { class: 'confidence-line', hidden: true });
    sectionPage.addToSlot('after-progress', line, { order: 20 });
    confidenceApi
      .section(sectionPage.section.id, { signal: sectionPage.signal })
      .then((stats) => {
        const sentence = calibrationSentence(stats);
        if (!sentence || sectionPage.signal.aborted) return;
        line.textContent = sentence;
        line.title = `Jistě: ${stats.sure.correct} z ${stats.sure.total} správně · Tipem: ${stats.guess.correct} z ${stats.guess.total} správně`;
        line.hidden = false;
      })
      .catch(() => {});
  },
});
