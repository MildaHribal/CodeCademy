// Kontroly vstupů sdílené routami: slugy, id z postupu, tvar objektů.
import { InputError } from './errors.js';

/** Slug sekce nebo modulu: malá písmena, číslice a pomlčky. */
export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Id modulu nebo kroku: slugy oddělené lomítkem, např. css-flexbox/workshop-navigace/003. */
export const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/;

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Vyhodí InputError (400), když id není ve tvaru sekce[/modul[/krok]]. */
export function checkId(id) {
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) {
    throw new InputError('Neplatné id — čekám třeba "css-flexbox/workshop-navigace/003"');
  }
  return id;
}

/** Vyhodí InputError (400), když sekce nebo modul nejsou slugy. */
export function checkSlugs(...slugs) {
  if (!slugs.every((slug) => typeof slug === 'string' && SLUG.test(slug))) {
    throw new InputError('Neplatná sekce nebo modul (povolená jsou malá písmena, číslice a pomlčky)');
  }
}
