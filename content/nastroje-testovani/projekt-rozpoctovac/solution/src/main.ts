// Propojení logiky se stránkou: načtení, formulář, přepínání měsíců.

import './styl.css';
import { dostupneMesice, type Polozka, type Typ } from './rozpocet.ts';
import { nacti, uloz } from './uloziste.ts';
import { vykresliRozpocet } from './zobrazeni.ts';

const prvek = <T extends Element>(vyber: string): T => {
  const nalezeny = document.querySelector<T>(vyber);
  if (!nalezeny) throw new Error(`Na stránce chybí prvek ${vyber}`);
  return nalezeny;
};

const formular = prvek<HTMLFormElement>('#formular');
const vyberMesice = prvek<HTMLSelectElement>('#mesic');
const poleData = prvek<HTMLInputElement>('#datum');

let polozky = nacti(localStorage);
let zvolenyMesic = dostupneMesice(polozky)[0] ?? new Date().toISOString().slice(0, 7);

function popisMesice(mesic: string): string {
  const [rok, cislo] = mesic.split('-');
  return `${Number(cislo)}/${rok}`;
}

function vykresliMesice(): void {
  const mesice = [...new Set([zvolenyMesic, ...dostupneMesice(polozky)])].sort().reverse();
  vyberMesice.replaceChildren(
    ...mesice.map((mesic) => {
      const volba = document.createElement('option');
      volba.value = mesic;
      volba.textContent = popisMesice(mesic);
      volba.selected = mesic === zvolenyMesic;
      return volba;
    }),
  );
}

function vykresli(): void {
  vykresliMesice();
  vykresliRozpocet(document, polozky, zvolenyMesic);
}

formular.addEventListener('submit', (udalost) => {
  udalost.preventDefault();
  const data = new FormData(formular);
  const nova: Polozka = {
    id: crypto.randomUUID(),
    popis: String(data.get('popis') ?? '').trim(),
    castka: Math.round(Number(data.get('castka'))),
    typ: String(data.get('typ')) as Typ,
    kategorie: String(data.get('kategorie') ?? '').trim(),
    datum: String(data.get('datum')),
  };
  if (!nova.popis || !nova.kategorie || !Number.isFinite(nova.castka) || nova.castka <= 0) return;

  polozky = [nova, ...polozky];
  uloz(localStorage, polozky);
  zvolenyMesic = nova.datum.slice(0, 7);
  formular.reset();
  poleData.value = nova.datum;
  vykresli();
});

vyberMesice.addEventListener('change', () => {
  zvolenyMesic = vyberMesice.value;
  vykresli();
});

poleData.value = new Date().toISOString().slice(0, 10);
vykresli();
