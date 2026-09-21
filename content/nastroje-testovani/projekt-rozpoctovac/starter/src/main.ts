// Propojení logiky se stránkou: načtení, formulář, přepínání měsíců.

import './styl.css';
import { dostupneMesice } from './rozpocet.ts';
import { nacti } from './uloziste.ts';
import { vykresliRozpocet } from './zobrazeni.ts';

const polozky = nacti(localStorage);
const zvolenyMesic = dostupneMesice(polozky)[0] ?? new Date().toISOString().slice(0, 7);

vykresliRozpocet(document, polozky, zvolenyMesic);

// TODO: naplnit <select id="mesic"> dostupnými měsíci a přepínat podle něj.
// TODO: odchytit odeslání formuláře #formular, přidat položku, uložit ji a překreslit.
