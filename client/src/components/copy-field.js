// Text k zkopírování (cesta, příkaz) s tlačítkem Kopírovat.

import { h, svg } from '../dom.js';
import { icons } from '../icons.js';

export function copyField(label, value) {
  const code = h('code', { class: 'copy-field__value' }, value);
  const button = h('button', { type: 'button', class: 'btn btn--small copy-field__button' }, svg(icons.copy), 'Kopírovat');
  const feedback = h('span', { class: 'copy-field__feedback', role: 'status' });

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(value);
      feedback.textContent = 'Zkopírováno';
    } catch {
      // Schránka nemusí být dostupná — aspoň text označíme, ať jde zkopírovat Ctrl+C.
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      feedback.textContent = 'Označeno, zkopíruj Ctrl+C';
    }
    setTimeout(() => (feedback.textContent = ''), 2500);
  });

  return h(
    'div',
    { class: 'copy-field' },
    h('span', { class: 'copy-field__label' }, label),
    h('div', { class: 'copy-field__row' }, code, button, feedback),
  );
}
