import { z } from 'zod';

/**
 * Hlavní záznam aplikace. Doplň aspoň čtyři pole, každé s českou hláškou,
 * text ořezávej (`trim`) a dej mu horní mez délky.
 */
export const ZaznamSchema = z.object({});

export type ZaznamVstup = z.infer<typeof ZaznamSchema>;

/** Ukázka platných dat tak, jak přijdou z formuláře — tedy samé řetězce. */
export const ukazkovyZaznam: Record<string, string> = {};

/** Hlášky u polí ve tvaru, jaký čeká formulář: `{ nazev: ['Vyplň název.'] }`. */
export function chybyPoli(chyba: z.ZodError): Record<string, string[] | undefined> {
  return z.flattenError(chyba).fieldErrors;
}
