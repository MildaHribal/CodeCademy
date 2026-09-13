// Malý pomocník na tvorbu DOM prvků bez frameworku.
//
//   h('button', { class: 'btn', onclick: save }, 'Uložit')
//
// Atributy začínající "on" se připojí jako posluchače událostí, `class` a `style`
// se nastaví přímo, ostatní přes setAttribute. Potomci můžou být řetězce, prvky,
// pole nebo null/false (ty se přeskočí), takže jde psát podmínky přímo v zápisu.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value == null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'class') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else if (key in el && typeof value !== 'string') {
      el[key] = value; // např. checked, disabled, value
    } else {
      el.setAttribute(key, value === true ? '' : value);
    }
  }
  append(el, children);
  return el;
}

export function append(parent, children) {
  for (const child of [children].flat(Infinity)) {
    if (child == null || child === false) continue;
    parent.append(child instanceof Node ? child : String(child));
  }
  return parent;
}

/** Nahradí obsah prvku novými potomky. */
export function replace(parent, ...children) {
  parent.replaceChildren();
  return append(parent, children);
}

/** Jednoduchá SVG ikona ze sady v icons.js. */
export function svg(pathData, { size = 16, label = null } = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const el = document.createElementNS(ns, 'svg');
  el.setAttribute('viewBox', '0 0 16 16');
  el.setAttribute('width', size);
  el.setAttribute('height', size);
  el.setAttribute('class', 'icon');
  if (label) {
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', label);
  } else {
    el.setAttribute('aria-hidden', 'true');
  }
  el.innerHTML = pathData;
  return el;
}
