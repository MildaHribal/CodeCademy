// Volba jistoty u otázky: „Jsem si jistý" / „Tipuju" (kontrakt kap. 4.5 a 12.4).
import './confidence.css';
import { h } from '../../dom.js';
import { nextQuestionUid } from './uid.js';

export const CONFIDENCE_LABELS = { sure: 'Jsem si jistý', guess: 'Tipuju' };

export function createConfidencePicker({ onChange } = {}) {
  const name = `confidence-${nextQuestionUid()}`;
  const inputs = [];

  const option = (value) => {
    const input = h('input', {
      type: 'radio',
      name,
      value,
      class: 'confidence__input',
      onchange: () => onChange?.(value),
      onclick: (event) => {
        if (event.target.dataset.wasChecked === 'true') {
          event.target.checked = false;
          onChange?.(null);
        }
        for (const other of inputs) other.dataset.wasChecked = String(other.checked);
      },
    });
    inputs.push(input);
    return h('label', { class: 'confidence__option' }, input, h('span', {}, CONFIDENCE_LABELS[value]));
  };

  const element = h(
    'fieldset',
    { class: 'confidence' },
    h('legend', { class: 'confidence__legend' }, 'Jak moc si jsi jistý?'),
    option('sure'),
    option('guess'),
  );

  return {
    element,
    value: () => inputs.find((input) => input.checked)?.value ?? null,
    reset() {
      for (const input of inputs) {
        input.checked = false;
        input.dataset.wasChecked = 'false';
      }
    },
    setDisabled(disabled) {
      for (const input of inputs) input.disabled = disabled;
      element.dataset.disabled = String(disabled);
    },
  };
}
