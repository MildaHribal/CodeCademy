import { defineRoute } from '../router.js';

const screens = new Map();

export function registerScreen({ name, path, render }) {
  if (typeof render !== 'function') throw new Error(`Obrazovka „${name}" nemá render`);
  if (screens.has(name)) throw new Error(`Obrazovka „${name}" je registrovaná dvakrát`);
  if (path) defineRoute(name, path);
  screens.set(name, render);
}

export function screenFor(name) {
  return screens.get(name) ?? screens.get('not-found');
}
