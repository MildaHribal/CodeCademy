// Vykreslení rozpočtu do připravené stránky. Funkce nic nepočítá, jen zobrazuje.

import {
  formatujCastku,
  podleKategorii,
  polozkyMesice,
  prehled,
  type Polozka,
} from './rozpocet.ts';

function najdi(doc: Document, vyber: string): Element {
  const prvek = doc.querySelector(vyber);
  if (!prvek) throw new Error(`Na stránce chybí prvek ${vyber}`);
  return prvek;
}

function radekPolozky(doc: Document, polozka: Polozka): HTMLElement {
  const radek = doc.createElement('li');
  radek.className = 'polozka';
  radek.dataset['id'] = polozka.id;

  const popis = doc.createElement('span');
  popis.className = 'polozka__popis';
  popis.textContent = polozka.popis;

  const kategorie = doc.createElement('span');
  kategorie.className = 'polozka__kategorie';
  kategorie.textContent = polozka.kategorie;

  const castka = doc.createElement('span');
  castka.className = `polozka__castka polozka__castka--${polozka.typ}`;
  castka.textContent = formatujCastku(polozka.castka);

  radek.append(popis, kategorie, castka);
  return radek;
}

/** Vypíše do stránky přehled, položky a kategorie zvoleného měsíce. */
export function vykresliRozpocet(doc: Document, polozky: readonly Polozka[], mesic: string): void {
  const vybrane = polozkyMesice(polozky, mesic);
  const soucty = prehled(vybrane);

  najdi(doc, '#prijmy').textContent = formatujCastku(soucty.prijmy);
  najdi(doc, '#vydaje').textContent = formatujCastku(soucty.vydaje);
  najdi(doc, '#zustatek').textContent = formatujCastku(soucty.zustatek);

  const prazdno = najdi(doc, '#prazdno') as HTMLElement;
  prazdno.hidden = vybrane.length > 0;

  najdi(doc, '#polozky').replaceChildren(...vybrane.map((polozka) => radekPolozky(doc, polozka)));

  najdi(doc, '#souhrn').replaceChildren(
    ...podleKategorii(vybrane).map(({ kategorie, celkem }) => {
      const radek = doc.createElement('li');
      radek.className = 'polozka';
      radek.dataset['kategorie'] = kategorie;

      const nazev = doc.createElement('span');
      nazev.textContent = kategorie;

      const castka = doc.createElement('span');
      castka.className = 'polozka__castka polozka__castka--vydaj';
      castka.textContent = formatujCastku(celkem);

      radek.append(nazev, castka);
      return radek;
    }),
  );
}
