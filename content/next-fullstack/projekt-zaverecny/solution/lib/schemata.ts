import { z } from 'zod';

/** Hlavní záznam aplikace. U vlastního tématu tady budou tvoje pole. */
export const ZaznamSchema = z.object({
  nazev: z
    .string('Vyplň název.')
    .trim()
    .min(3, 'Název musí mít aspoň 3 znaky.')
    .max(80, 'Název může mít nejvýš 80 znaků.'),
  popis: z.string('Vyplň popis.').trim().max(600, 'Popis může mít nejvýš 600 znaků.'),
  cena: z.coerce
    .number('Cena musí být číslo.')
    .int('Cena musí být celé číslo.')
    .min(1, 'Cena musí být větší než nula.')
    .max(10_000_000, 'Cena je nesmyslně vysoká.'),
  kategorie: z.enum(['sport', 'domacnost', 'elektronika', 'ostatni'], 'Vyber kategorii ze seznamu.'),
});

export type ZaznamVstup = z.infer<typeof ZaznamSchema>;

/** Ukázka platných dat — používá ji kontrola i testy. */
export const ukazkovyZaznam = {
  nazev: 'Kolo Author Solution 29"',
  popis: 'Jeté dvě sezony, nový řetěz a brzdové destičky. Osobní předání v Brně.',
  cena: '7500',
  kategorie: 'sport',
};

/** Hlášky u polí ve tvaru, jaký čeká formulář. */
export function chybyPoli(chyba: z.ZodError): Record<string, string[] | undefined> {
  return z.flattenError(chyba).fieldErrors;
}
