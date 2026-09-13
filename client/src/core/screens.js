// Registr obrazovek: jméno cesty → funkce render(ctx, route).
//
//   registerScreen({ name: 'reviews', path: '/opakovani', render: renderReviews });
//
// render dostane kontext z main.js:
//   ctx.root, ctx.signal, ctx.onCleanup(fn), ctx.setCrumbs(items), ctx.setLayout('page'|'workspace'), ctx.setTitle(text)
// a route z parseHash (parametry cesty, případně route.query).
import { defineRoute } from '../router.js';

const screens = new Map();

export function registerScreen({ name, path, render }) {
  if (typeof render !== 'function') throw new Error(`Obrazovka „${name}" nemá render`);
  if (screens.has(name)) throw new Error(`Obrazovka „${name}" je registrovaná dvakrát`);
  if (path) defineRoute(name, path); // obrazovky jádra mají cestu už v router.js
  screens.set(name, render);
}

export function screenFor(name) {
  return screens.get(name) ?? screens.get('not-found');
}
