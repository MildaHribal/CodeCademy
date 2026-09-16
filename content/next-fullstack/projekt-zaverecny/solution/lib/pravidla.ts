/** Role rozhoduje o tom, co smí uživatel dělat s cizími záznamy. */
export type Role = 'uzivatel' | 'admin';

export type Uzivatel = {
  id: string;
  role: Role;
};

/**
 * Cokoli, co má vlastníka a stav — inzerát, rezervace, výdaj, přihláška.
 * Stav `uzamceno` znamená „na tomhle záznamu už visí něco cizího".
 */
export type Zaznam = {
  autorId?: string;
  stav?: string;
};

export const UZAMCENO = 'uzamceno';

/**
 * Smí uživatel záznam upravit? Admin kterýkoli, ostatní jen svůj.
 * Chybějící uživatel nebo záznam znamená „nesmí" — nespoléhej na porovnání
 * dvou hodnot, které můžou obě chybět: `undefined === undefined` je `true`.
 */
export function smiUpravit(uzivatel: Uzivatel | null | undefined, zaznam: Zaznam | null | undefined): boolean {
  if (!uzivatel || !zaznam) return false;
  if (uzivatel.role === 'admin') return true;
  return Boolean(zaznam.autorId) && zaznam.autorId === uzivatel.id;
}

/**
 * Smí uživatel záznam smazat? Admin vždycky, vlastník jen dokud není uzamčený —
 * jinak by mazáním zrušil něco, co už mezitím patří někomu jinému.
 */
export function smiSmazat(uzivatel: Uzivatel | null | undefined, zaznam: Zaznam | null | undefined): boolean {
  if (!uzivatel || !zaznam) return false;
  if (uzivatel.role === 'admin') return true;
  return smiUpravit(uzivatel, zaznam) && zaznam.stav !== UZAMCENO;
}
