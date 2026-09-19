
export function findInactiveDeclarations(doc, declarations) {
  const view = doc.defaultView;
  const FLEX = ['flex', 'inline-flex'];
  const GRID = ['grid', 'inline-grid'];
  const REPLACED = ['IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'VIDEO', 'CANVAS', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'AUDIO', 'PROGRESS', 'METER'];

  const RULES = {
    'justify-content': 'container', 'align-items': 'container', 'place-items': 'container', 'place-content': 'container',
    gap: 'container', 'row-gap': 'container', 'column-gap': 'container',
    'flex-direction': 'flex-container', 'flex-wrap': 'flex-container', 'flex-flow': 'flex-container',
    'grid-template-columns': 'grid-container', 'grid-template-rows': 'grid-container', 'grid-template-areas': 'grid-container',
    'grid-template': 'grid-container', 'grid-auto-flow': 'grid-container', 'grid-auto-columns': 'grid-container', 'grid-auto-rows': 'grid-container',
    'flex-grow': 'flex-parent', 'flex-shrink': 'flex-parent', 'flex-basis': 'flex-parent', flex: 'flex-parent',
    order: 'flex-or-grid-parent', 'align-self': 'flex-or-grid-parent', 'justify-self': 'grid-parent',
    'grid-column': 'grid-parent', 'grid-row': 'grid-parent', 'grid-area': 'grid-parent',
    'grid-column-start': 'grid-parent', 'grid-column-end': 'grid-parent', 'grid-row-start': 'grid-parent', 'grid-row-end': 'grid-parent',
    top: 'static', right: 'static', bottom: 'static', left: 'static', inset: 'static', 'z-index': 'static',
    width: 'inline', height: 'inline', 'min-width': 'inline', 'min-height': 'inline', 'max-width': 'inline', 'max-height': 'inline',
  };

  const displayOf = (element) => view.getComputedStyle(element).display;
  const parentDisplay = (element) => {
    let parent = element.parentElement;
    while (parent && displayOf(parent) === 'contents') parent = parent.parentElement;
    return parent ? displayOf(parent) : 'block';
  };

  function isInactive(element, kind, property) {
    switch (kind) {
      case 'container': return ![...FLEX, ...GRID].includes(displayOf(element)) && !(property === 'column-gap' && view.getComputedStyle(element).columnCount !== 'auto');
      case 'flex-container': return !FLEX.includes(displayOf(element));
      case 'grid-container': return !GRID.includes(displayOf(element));
      case 'flex-parent': return !FLEX.includes(parentDisplay(element));
      case 'flex-or-grid-parent': return ![...FLEX, ...GRID].includes(parentDisplay(element));
      case 'grid-parent': return !GRID.includes(parentDisplay(element));
      case 'static': {
        if (view.getComputedStyle(element).position !== 'static') return false;
        return !(property === 'z-index' && [...FLEX, ...GRID].includes(parentDisplay(element)));
      }
      case 'inline': return displayOf(element) === 'inline' && !REPLACED.includes(element.tagName.toUpperCase());
      default: return false;
    }
  }

  const out = [];
  for (const declaration of declarations ?? []) {
    const property = String(declaration.property).toLowerCase();
    const kind = RULES[property];
    if (!kind) continue;
    let elements;
    try {
      elements = Array.from(doc.querySelectorAll(declaration.selector));
    } catch {
      continue;
    }
    if (elements.length === 0) continue;
    if (elements.every((element) => isInactive(element, kind, property))) {
      out.push({ id: declaration.id, property, reason: kind, elements: elements.length });
    }
  }
  return out;
}
