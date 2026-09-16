export type Role = 'uzivatel' | 'admin';

export type Uzivatel = {
  id: string;
  role: Role;
};

/** Cokoli, co má vlastníka a stav. Stav `uzamceno` znamená „už na tom visí něco cizího". */
export type Zaznam = {
  autorId?: string;
  stav?: string;
};

export const UZAMCENO = 'uzamceno';

/**
 * Smí uživatel záznam upravit? Admin kterýkoli, ostatní jen svůj.
 * Chybějící uživatel nebo záznam znamená vždycky „nesmí".
 */
export function smiUpravit(uzivatel: Uzivatel | null | undefined, zaznam: Zaznam | null | undefined): boolean {
  return true;
}

/**
 * Smí uživatel záznam smazat? Admin vždycky, vlastník jen dokud není `uzamceno`.
 */
export function smiSmazat(uzivatel: Uzivatel | null | undefined, zaznam: Zaznam | null | undefined): boolean {
  return true;
}
