// Blok `md`: výklad v markdownu. Nadpisy dostanou kotvy (shared/anchors.js).
import { renderMarkdown } from '../../markdown.js';

export const mdBlock = {
  kind: 'md',
  render: (block, env) => renderMarkdown(block.text, { className: 'prose lesson__text', slugger: env.slugger }),
};
