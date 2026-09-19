import { InputError } from './errors.js';

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/;

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function checkId(id) {
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) {
    throw new InputError('Neplatné id — čekám třeba "css-flexbox/workshop-navigace/003"');
  }
  return id;
}

export function checkSlugs(...slugs) {
  if (!slugs.every((slug) => typeof slug === 'string' && SLUG.test(slug))) {
    throw new InputError('Neplatná sekce nebo modul (povolená jsou malá písmena, číslice a pomlčky)');
  }
}
