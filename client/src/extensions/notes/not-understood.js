import { h, svg } from '../../dom.js';
import { icons } from '../../icons.js';
import { openNotesDrawer } from './drawer.js';

const BLOCKS = 'p, li, pre, blockquote, table, dd';
const SKIP = 'button, input, textarea, select, .cm-editor, .question, .questions, .lesson__live, .lesson__finish, .notes-drawer, form';
const HIDE_DELAY_MS = 350;

export function attachNotUnderstood(container, { findHeading = () => null } = {}) {
  const button = h(
    'button',
    { type: 'button', class: 'not-understood', hidden: true, title: 'Nerozumím — vložit do poznámek s citací' },
    svg(icons.question, { size: 16 }),
    h('span', { class: 'not-understood__label' }, 'Nerozumím'),
  );
  document.body.append(button);

  let target = null;
  let selectionText = '';
  let hideTimer = null;

  function blockFor(node) {
    const element = node instanceof Element ? node : node?.parentElement;
    const block = element?.closest(BLOCKS);
    if (!block || !container.contains(block) || block.closest(SKIP) || !block.closest('.prose')) return null;
    return block.textContent.trim() ? block : null;
  }

  function showFor(block, { selection = '' } = {}) {
    clearTimeout(hideTimer);
    target = block;
    selectionText = selection;
    const rect = block.getBoundingClientRect();
    const top = (selection ? selectionRect()?.top ?? rect.top : rect.top) + window.scrollY;
    button.style.top = `${Math.round(top)}px`;
    button.style.left = `${Math.round(Math.max(rect.left + window.scrollX - 38, 4))}px`;
    button.classList.toggle('not-understood--selection', Boolean(selection));
    button.hidden = false;
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      button.hidden = true;
      target = null;
      selectionText = '';
    }, HIDE_DELAY_MS);
  }

  function selectionRect() {
    const selection = window.getSelection();
    return selection?.rangeCount ? selection.getRangeAt(0).getBoundingClientRect() : null;
  }

  const onOver = (event) => {
    if (selectionText) return;
    const block = blockFor(event.target);
    if (block) showFor(block);
  };
  const onOut = (event) => {
    if (selectionText) return;
    if (event.relatedTarget === button || button.contains(event.relatedTarget)) return;
    if (blockFor(event.relatedTarget) === target) return;
    scheduleHide();
  };
  const onSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    const block = text && selection.rangeCount ? blockFor(selection.getRangeAt(0).commonAncestorContainer) ?? blockFor(selection.anchorNode) : null;
    if (block) showFor(block, { selection: text });
    else if (selectionText) {
      selectionText = '';
      scheduleHide();
    }
  };
  const onScroll = () => {
    if (!button.hidden && !selectionText) {
      button.hidden = true;
      target = null;
    }
  };

  button.addEventListener('pointerenter', () => clearTimeout(hideTimer));
  button.addEventListener('pointerleave', () => {
    if (!selectionText) scheduleHide();
  });
  button.addEventListener('mousedown', (event) => event.preventDefault());
  button.addEventListener('click', () => {
    if (!target) return;
    const heading = findHeading(target);
    const raw = selectionText || target.textContent;
    const quote = target.closest('pre') ? raw : raw.replace(/\s+/g, ' ');
    openNotesDrawer({
      kind: 'quote',
      quote,
      anchor: heading?.anchor ?? null,
      heading: heading?.text ?? null,
    });
    button.hidden = true;
    selectionText = '';
  });

  container.addEventListener('mouseover', onOver);
  container.addEventListener('mouseout', onOut);
  document.addEventListener('selectionchange', onSelection);
  window.addEventListener('scroll', onScroll, { capture: true, passive: true });

  return () => {
    clearTimeout(hideTimer);
    container.removeEventListener('mouseover', onOver);
    container.removeEventListener('mouseout', onOut);
    document.removeEventListener('selectionchange', onSelection);
    window.removeEventListener('scroll', onScroll, { capture: true });
    button.remove();
  };
}

export function nearestHeading(headings, element) {
  let found = null;
  for (const heading of headings) {
    if (heading.element.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) found = heading;
    else break;
  }
  return found ? { anchor: found.anchor, text: found.text } : null;
}
