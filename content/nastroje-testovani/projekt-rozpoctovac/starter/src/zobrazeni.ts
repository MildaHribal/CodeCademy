// Vykreslení rozpočtu do připravené stránky. Funkce nic nepočítá, jen zobrazuje.

import type { Polozka } from './rozpocet.ts';

/**
 * Vypíše do stránky přehled, položky a kategorie zvoleného měsíce.
 *
 * Do `#prijmy`, `#vydaje` a `#zustatek` patří naformátované částky, do `#polozky`
 * jeden `li` na položku měsíce (s `data-id`, popisem, kategorií a částkou), do
 * `#souhrn` jeden `li` na kategorii výdajů (s `data-kategorie`). Prvek `#prazdno`
 * je vidět jen tehdy, když měsíc žádnou položku nemá.
 */
export function vykresliRozpocet(
  _doc: Document,
  _polozky: readonly Polozka[],
  _mesic: string,
): void {
  throw new Error('vykresliRozpocet zatím není napsaná');
}
