import { h } from '../../dom.js';
import { inlineCodeSegments } from '../errors-cs/format.js';

function inlineText(text) {
  return inlineCodeSegments(text).map((part) => (part.code ? h('code', {}, part.text) : part.text));
}

export function renderDiagnosticMessage(diagnostic) {
  return h(
    'div',
    { class: 'lint-message' },
    h('p', { class: 'lint-message__title' }, inlineText(diagnostic.message)),
    diagnostic.hint ? h('p', { class: 'lint-message__hint' }, inlineText(diagnostic.hint)) : null,
    diagnostic.causes?.length
      ? h('ul', { class: 'lint-message__causes' }, diagnostic.causes.slice(0, 3).map((cause) => h('li', {}, inlineText(cause))))
      : null,
    diagnostic.original ? h('p', { class: 'lint-message__original', lang: 'en' }, diagnostic.original) : null,
  );
}
