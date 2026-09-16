---
title: Tabulka dat
runtime: react
see: react-hloubka/reducer-a-context#kdyz-usestate-prestane-stacit
---

# --description--

Tabulka s filtrem, řazením, stránkováním a výběrem řádků je nejčastější obrazovka každé administrace — a taky nejlepší zkouška toho, jestli ti reducer a odvozené hodnoty opravdu sedly. Postavíš ji pro **přehled týmu**: dvaadvacet lidí s rolí, městem, datem nástupu a hodinovou sazbou.

Data jsou v `data.js` (`lide` a seznam `role`), vzhled v `styles.css` — tabulka, tlačítka, souhrn i prázdný stav jsou nastylované. Zbytek je na tobě; v `App.jsx` je jen prázdná kostra.

**Co má přehled umět:**

- Když si uživatel stránku otevře, vidí tabulku s jménem, rolí, městem, datem nástupu a sazbou, seřazenou podle jména podle české abecedy.
- Když napíše text do vyhledávacího pole `<input type="search">`, zůstanou v tabulce jen lidé, jejichž jméno nebo město ten text obsahuje. Na velikosti písmen nezáleží.
- Když vybere roli v `<select>`, zůstanou jen lidé s touhle rolí. První možnost seznamu vrací všechny role.
- Když klikne na tlačítko v záhlaví sloupce Jméno, Město nebo Sazba, seřadí se tabulka podle něj vzestupně; druhé kliknutí řazení otočí. Texty se řadí podle české abecedy, sazba jako číslo.
- Záhlaví sloupce, podle kterého se právě řadí, nese `aria-sort` s hodnotou `ascending` nebo `descending`; ostatní sloupce ne.
- Tabulka ukazuje nejvýš pět řádků. Pod ní jsou tlačítka `Předchozí` a `Další` a mezi nimi prvek `data-testid="stranka"` s textem, ze kterého je poznat číslo aktuální stránky i počet stránek.
- Na první stránce je `Předchozí` zakázané, na poslední `Další`.
- Když uživatel změní hledání nebo roli, vrátí se na první stránku.
- Každý řádek má zaškrtávátko, kterým se člověk vybere; výběr se drží i po přechodu na jinou stránku.
- Zaškrtávátko v záhlaví tabulky vybere všechny řádky, které jsou právě vidět.
- Když je vybraný aspoň jeden člověk, ukáže se prvek `data-testid="souhrn"` s počtem vybraných, s jejich průměrnou sazbou zaokrouhlenou na celé koruny a s tlačítkem `Zrušit výběr`.
- Když zadání neodpovídá nikdo, zobrazí se místo tabulky prvek `data-testid="prazdno"` s hláškou.

Texty, ikony a doplňkové sloupce jsou tvoje volba — testy se dívají na chování, ne na formulace.

> [!TIP]
> Filtrování, řazení i stránkování jsou hodnoty, které se dají spočítat z toho, co je ve stavu. Rozmysli si, co do stavu opravdu patří, než napíšeš první `useState`.

# --help--

## --tip--

Zamysli se nad tvarem stavu dřív než nad JSX: co si aplikace musí pamatovat (hledaný text, role, sloupec a směr řazení, stránka, vybraná id) a co si z toho pokaždé dopočítá.

## --tip--

Filtr, řazení a stránkování na sebe navazují v jednom pořadí: nejdřív vyber, pak seřaď a teprve z výsledku ukroj stránku. Kdybys stránkoval dřív, řadil bys jen pět řádků z dvaadvaceti.

# --hints--

Tabulka ukazuje prvních pět lidí seřazených podle jména podle české abecedy.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

assert.ok(hledej, 'Čekám na stránce vyhledávací pole <input type="search">');
assert.equal(radky().length, 5, 'Na stránce má být pět řádků (stránkuje se po pěti)');
const ocekavane = [...lide].sort((a, b) => a.jmeno.localeCompare(b.jmeno, 'cs')).slice(0, 5).map((c) => c.jmeno);
assert.deepEqual(jmena(), ocekavane, 'Výchozí řazení je podle jména vzestupně podle české abecedy (Čeněk patří za Cyrila, ne na konec)');
```

Každý řádek ukazuje jméno, roli, město, datum nástupu a sazbu.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

const prvni = [...lide].sort((a, b) => a.jmeno.localeCompare(b.jmeno, 'cs'))[0];
const bunky = radky()[0].querySelectorAll('td');
assert.ok(bunky.length >= 6, `První řádek má ${bunky.length} buněk, čekám aspoň šest (zaškrtávátko, jméno, role, město, nástup, sazba)`);
const text = radky()[0].textContent;
for (const hodnota of [prvni.jmeno, prvni.role, prvni.mesto, prvni.nastup, String(prvni.sazba)]) {
  assert.ok(text.includes(hodnota), `První řádek má obsahovat ${hodnota}; obsahuje: ${text.replace(/\s+/g, ' ').trim()}`);
}
```

Hledání zabírá na jméno i na město a nerozlišuje velikost písmen.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

await helpers.type(hledej, 'brno');
await helpers.flush();
const ocekavane = lide.filter((c) => c.mesto === 'Brno').length;
assert.equal(radky().length, Math.min(5, ocekavane), `Po hledání „brno" čekám ${Math.min(5, ocekavane)} řádků na stránce`);
assert.ok(jmena().every((j) => lide.find((c) => c.jmeno === j).mesto === 'Brno'), 'Po hledání „brno" mají zbýt jen lidé z Brna');
```

Hledání podle části jména najde konkrétního člověka.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

await helpers.type(hledej, 'Zeman');
await helpers.flush();
assert.deepEqual(jmena(), ['Hana Zemanová'], 'Hledání „Zeman" má najít Hanu Zemanovou');
```

Výběr role v rozbalovacím seznamu zúží tabulku na jednu roli.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

assert.ok(vyber, 'Čekám na stránce <select> s filtrem podle role');
vyber.value = 'Produkt';
vyber.dispatchEvent(new Event('change', { bubbles: true }));
await helpers.flush();
const ocekavane = lide.filter((c) => c.role === 'Produkt').length;
assert.equal(radky().length, Math.min(5, ocekavane), `Role Produkt má ${ocekavane} lidí, na stránce čekám ${Math.min(5, ocekavane)} řádků`);
assert.ok(jmena().every((j) => lide.find((c) => c.jmeno === j).role === 'Produkt'), 'Po výběru role Produkt mají zbýt jen lidé z produktu');
```

Kliknutí na záhlaví sloupce Sazba seřadí od nejnižší, druhé kliknutí od nejvyšší.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

const hlavicka = zahlavi('Sazba');
assert.ok(hlavicka, 'Čekám sloupec Sazba s tlačítkem v záhlaví');
await helpers.click(hlavicka.querySelector('button'));
await helpers.flush();
const vzestupne = [...lide].sort((a, b) => a.sazba - b.sazba).slice(0, 5).map((c) => c.jmeno);
assert.deepEqual(jmena(), vzestupne, 'Po prvním kliknutí na Sazba čekám řazení od nejnižší sazby');
await helpers.click(zahlavi('Sazba').querySelector('button'));
await helpers.flush();
const sestupne = [...lide].sort((a, b) => b.sazba - a.sazba).slice(0, 5).map((c) => c.jmeno);
assert.deepEqual(jmena(), sestupne, 'Druhé kliknutí na Sazba má řazení otočit');
```

Záhlaví řazeného sloupce hlásí směr přes `aria-sort`.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

await helpers.click(zahlavi('Město').querySelector('button'));
await helpers.flush();
assert.equal(zahlavi('Město').getAttribute('aria-sort'), 'ascending', 'Sloupec Město má po prvním kliknutí mít aria-sort="ascending"');
const ostatni = [...document.querySelectorAll('th')].filter((th) => th !== zahlavi('Město'));
assert.ok(ostatni.every((th) => th.getAttribute('aria-sort') !== 'ascending' && th.getAttribute('aria-sort') !== 'descending'), 'Směr řazení má hlásit jen ten sloupec, podle kterého se řadí');
await helpers.click(zahlavi('Město').querySelector('button'));
await helpers.flush();
assert.equal(zahlavi('Město').getAttribute('aria-sort'), 'descending', 'Po druhém kliknutí čekám aria-sort="descending"');
```

Řazení podle města respektuje českou abecedu.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

await helpers.click(zahlavi('Město').querySelector('button'));
await helpers.flush();
const mesta = radky().map((r) => r.querySelectorAll('td')[3].textContent.trim());
const ocekavana = [...lide].sort((a, b) => a.mesto.localeCompare(b.mesto, 'cs')).slice(0, 5).map((c) => c.mesto);
assert.deepEqual(mesta, ocekavana, 'Města se mají řadit podle české abecedy');
```

Stránkování listuje po pěti a ukazuje, na které stránce uživatel je.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

const stranek = Math.ceil(lide.length / 5);
const ukazatel = document.querySelector('[data-testid="stranka"]');
assert.ok(ukazatel, 'Čekám ukazatel stránky s data-testid="stranka"');
assert.match(ukazatel.textContent, new RegExp('1[^0-9]+' + stranek), `Ukazatel má říct, že jsme na stránce 1 z ${stranek}`);
const prvniStranka = jmena();
await helpers.click(tlacitko('Další'));
await helpers.flush();
const druhaStranka = jmena();
assert.notDeepEqual(druhaStranka, prvniStranka, 'Po kliknutí na Další se má tabulka posunout na další pětici');
const vsechna = [...lide].sort((a, b) => a.jmeno.localeCompare(b.jmeno, 'cs')).map((c) => c.jmeno);
assert.deepEqual(druhaStranka, vsechna.slice(5, 10), 'Druhá stránka má ukázat šestého až desátého člověka');
```

Na první stránce nejde zpět a na poslední dál.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

assert.ok(tlacitko('Předchozí').disabled, 'Na první stránce má být tlačítko Předchozí zakázané');
const stranek = Math.ceil(lide.length / 5);
for (let i = 1; i < stranek; i++) {
  await helpers.click(tlacitko('Další'));
  await helpers.flush();
}
assert.ok(tlacitko('Další').disabled, 'Na poslední stránce má být tlačítko Další zakázané');
assert.ok(!tlacitko('Předchozí').disabled, 'Na poslední stránce má jít vrátit se zpět');
```

Změna hledání nebo role vrátí uživatele na první stránku.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

await helpers.click(tlacitko('Další'));
await helpers.flush();
await helpers.type(hledej, 'a');
await helpers.flush();
assert.match(document.querySelector('[data-testid="stranka"]').textContent, /1/, 'Po změně hledání má být uživatel zase na první stránce');
const prvniJmeno = jmena()[0];
const sedici = lide.filter((c) => `${c.jmeno} ${c.mesto}`.toLowerCase().includes('a'));
const ocekavane = [...sedici].sort((a, b) => a.jmeno.localeCompare(b.jmeno, 'cs'))[0].jmeno;
assert.equal(prvniJmeno, ocekavane, 'Po změně hledání má tabulka začínat prvním odpovídajícím člověkem');
```

Zaškrtnutí řádku ho vybere a souhrn spočítá průměrnou sazbu.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

const zaskrtavatka = () => [...document.querySelectorAll('tbody input[type="checkbox"]')];
assert.equal(zaskrtavatka().length, 5, 'Každý řádek má mít vlastní zaškrtávátko');
await helpers.click(zaskrtavatka()[0]);
await helpers.flush();
await helpers.click(zaskrtavatka()[1]);
await helpers.flush();
const serazene = [...lide].sort((a, b) => a.jmeno.localeCompare(b.jmeno, 'cs'));
const prumer = Math.round((serazene[0].sazba + serazene[1].sazba) / 2);
const souhrn = document.querySelector('[data-testid="souhrn"]');
assert.ok(souhrn, 'Po výběru čekám souhrn s data-testid="souhrn"');
assert.match(souhrn.textContent, /2/, 'Souhrn má říct, že jsou vybraní dva lidé');
assert.match(souhrn.textContent, new RegExp(String(prumer)), `Průměrná sazba vybraných dvou je ${prumer} Kč`);
```

Výběr přežije přechod na jinou stránku a tlačítko ho zruší.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

const zaskrtavatka = () => [...document.querySelectorAll('tbody input[type="checkbox"]')];
await helpers.click(zaskrtavatka()[0]);
await helpers.flush();
await helpers.click(tlacitko('Další'));
await helpers.flush();
assert.ok(document.querySelector('[data-testid="souhrn"]'), 'Souhrn má zůstat i po přechodu na další stránku');
await helpers.click(tlacitko('Zrušit výběr'));
await helpers.flush();
assert.equal(document.querySelector('[data-testid="souhrn"]'), null, 'Po zrušení výběru souhrn zmizí');
assert.ok(zaskrtavatka().every((z) => !z.checked), 'Po zrušení výběru nemá být zaškrtnutý žádný řádek');
```

Zaškrtávátko v záhlaví vybere všechny řádky na stránce.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

const hlavni = document.querySelector('thead input[type="checkbox"]');
assert.ok(hlavni, 'V záhlaví tabulky čekám zaškrtávátko pro výběr celé stránky');
await helpers.click(hlavni);
await helpers.flush();
assert.equal([...document.querySelectorAll('tbody input[type="checkbox"]')].filter((z) => z.checked).length, 5, 'Po kliknutí na zaškrtávátko v záhlaví má být vybraných všech pět řádků stránky');
assert.match(document.querySelector('[data-testid="souhrn"]').textContent, /5/, 'Souhrn má hlásit pět vybraných');
```

Když zadání neodpovídá nikdo, místo tabulky se ukáže hláška.

```js
const { lide } = await helpers.importFile('data.js');
const radky = () => [...document.querySelectorAll('tbody tr')];
const jmena = () => radky().map((r) => r.querySelectorAll('td')[1].textContent.trim());
const hledej = document.querySelector('input[type="search"]');
const vyber = document.querySelector('select');
const zahlavi = (popis) => [...document.querySelectorAll('th')].find((th) => th.textContent.trim().startsWith(popis));
const tlacitko = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

await helpers.type(hledej, 'xyz');
await helpers.flush();
const prazdno = document.querySelector('[data-testid="prazdno"]');
assert.ok(prazdno, 'Při prázdném výsledku čekám hlášku s data-testid="prazdno"');
assert.ok(prazdno.textContent.trim().length > 5, 'Hláška má nést text');
assert.equal(document.querySelectorAll('tbody tr').length, 0, 'Při prázdném výsledku nemá v tabulce zůstat žádný řádek');
```

# --seed--

## --file-- App.jsx

```jsx
import { lide, role } from './data';

export default function App() {
  return (
    <div className="tym">
      <h1 className="tym__nadpis">Tým</h1>
      <p className="tym__popis">Filtruj, řaď, listuj a vybírej řádky.</p>

      {/* Tady postav ovládání, tabulku, stránkování a souhrn. */}
    </div>
  );
}
```

## --file-- data.js

```js
// Lidé v týmu. Sazba je hodinová v korunách, nastup je datum ve tvaru RRRR-MM-DD.
export const lide = [
  { id: 1, jmeno: 'Adam Horák', role: 'Vývoj', mesto: 'Brno', nastup: '2021-03-01', sazba: 780 },
  { id: 2, jmeno: 'Barbora Šimková', role: 'Design', mesto: 'Praha', nastup: '2019-09-16', sazba: 720 },
  { id: 3, jmeno: 'Cyril Doležal', role: 'Testování', mesto: 'Ostrava', nastup: '2023-01-09', sazba: 540 },
  { id: 4, jmeno: 'Čeněk Marek', role: 'Vývoj', mesto: 'Plzeň', nastup: '2022-06-01', sazba: 810 },
  { id: 5, jmeno: 'Dana Krejčí', role: 'Produkt', mesto: 'Praha', nastup: '2018-02-05', sazba: 950 },
  { id: 6, jmeno: 'Eva Pospíšilová', role: 'Vývoj', mesto: 'Olomouc', nastup: '2024-04-15', sazba: 640 },
  { id: 7, jmeno: 'Filip Navrátil', role: 'Testování', mesto: 'Brno', nastup: '2020-11-02', sazba: 600 },
  { id: 8, jmeno: 'Gabriela Čechová', role: 'Design', mesto: 'Brno', nastup: '2022-09-01', sazba: 690 },
  { id: 9, jmeno: 'Hana Zemanová', role: 'Vývoj', mesto: 'Praha', nastup: '2017-05-22', sazba: 1010 },
  { id: 10, jmeno: 'Chris Nováková', role: 'Testování', mesto: 'Plzeň', nastup: '2023-08-14', sazba: 560 },
  { id: 11, jmeno: 'Ivan Dvořák', role: 'Vývoj', mesto: 'Ostrava', nastup: '2021-10-04', sazba: 830 },
  { id: 12, jmeno: 'Jana Bartošová', role: 'Produkt', mesto: 'Brno', nastup: '2020-01-13', sazba: 900 },
  { id: 13, jmeno: 'Karel Říha', role: 'Vývoj', mesto: 'Praha', nastup: '2019-03-25', sazba: 870 },
  { id: 14, jmeno: 'Lucie Fialová', role: 'Design', mesto: 'Olomouc', nastup: '2024-09-02', sazba: 610 },
  { id: 15, jmeno: 'Martin Sedláček', role: 'Vývoj', mesto: 'Brno', nastup: '2016-07-18', sazba: 1050 },
  { id: 16, jmeno: 'Nina Urbanová', role: 'Testování', mesto: 'Praha', nastup: '2022-02-21', sazba: 580 },
  { id: 17, jmeno: 'Ondřej Malý', role: 'Vývoj', mesto: 'Plzeň', nastup: '2023-05-02', sazba: 760 },
  { id: 18, jmeno: 'Petra Vlčková', role: 'Produkt', mesto: 'Ostrava', nastup: '2021-01-11', sazba: 920 },
  { id: 19, jmeno: 'Radek Beneš', role: 'Vývoj', mesto: 'Olomouc', nastup: '2018-11-05', sazba: 840 },
  { id: 20, jmeno: 'Simona Kučerová', role: 'Design', mesto: 'Praha', nastup: '2020-08-03', sazba: 730 },
  { id: 21, jmeno: 'Šárka Tichá', role: 'Vývoj', mesto: 'Brno', nastup: '2022-11-28', sazba: 790 },
  { id: 22, jmeno: 'Zdeněk Pokorný', role: 'Testování', mesto: 'Olomouc', nastup: '2019-06-10', sazba: 620 },
];

export const role = ['Vývoj', 'Design', 'Testování', 'Produkt'];
```

## --file-- styles.css

```css
:root {
  --plocha: #f5f6f8;
  --papir: #ffffff;
  --text: #16191d;
  --text-tlumeny: #626b76;
  --linka: #e4e7eb;
  --akce: #0f766e;
  --akce-tmava: #115e59;
  --radius: 0.75rem;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 2rem 1.25rem;
  background: var(--plocha);
  color: var(--text);
  font-family: system-ui, "Segoe UI", sans-serif;
  line-height: 1.5;
}

.tym {
  margin: 0 auto;
  max-width: 62rem;
}

.tym__nadpis {
  margin: 0 0 0.25rem;
  font-size: 1.6rem;
}

.tym__popis {
  margin: 0 0 1.5rem;
  color: var(--text-tlumeny);
}

.ovladani {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

input[type="search"],
select {
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--linka);
  border-radius: 0.5rem;
  background: var(--papir);
  font: inherit;
}

input[type="search"] {
  flex: 1;
  min-width: 12rem;
}

input:focus-visible,
select:focus-visible,
button:focus-visible {
  outline: 3px solid var(--akce);
  outline-offset: 2px;
}

table {
  width: 100%;
  border-collapse: collapse;
  border-radius: var(--radius);
  background: var(--papir);
  overflow: hidden;
  box-shadow: 0 1px 2px rgb(22 25 29 / 0.1);
}

th,
td {
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--linka);
  text-align: left;
}

th {
  background: #eef2f4;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

th button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
}

th[aria-sort="ascending"] button::after {
  content: "▲";
  font-size: 0.7em;
}

th[aria-sort="descending"] button::after {
  content: "▼";
  font-size: 0.7em;
}

tbody tr:hover {
  background: #f8fafb;
}

td.cislo {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.strankovani {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.tlacitko {
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--linka);
  border-radius: 0.5rem;
  background: var(--papir);
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}

.tlacitko:hover:not(:disabled) {
  background: #eef2f4;
}

.tlacitko:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.tlacitko--hlavni {
  border-color: transparent;
  background: var(--akce);
  color: #fff;
}

.tlacitko--hlavni:hover:not(:disabled) {
  background: var(--akce-tmava);
}

.souhrn {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius);
  background: #ecfdf5;
  color: #065f46;
}

.prazdno {
  padding: 2.5rem 1rem;
  border: 1px dashed var(--linka);
  border-radius: var(--radius);
  color: var(--text-tlumeny);
  text-align: center;
}
```

# --solution--

## --file-- App.jsx

```jsx
import { useReducer } from 'react';
import { lide, role } from './data';

const NA_STRANKU = 5;

const VYCHOZI = {
  hledej: '',
  role: 'vse',
  razeni: { sloupec: 'jmeno', smer: 'asc' },
  stranka: 1,
  vybrane: [],
};

function tabulkaReducer(stav, akce) {
  switch (akce.typ) {
    case 'hledej':
      return { ...stav, hledej: akce.hodnota, stranka: 1 };
    case 'role':
      return { ...stav, role: akce.hodnota, stranka: 1 };
    case 'radit': {
      const smer =
        stav.razeni.sloupec === akce.sloupec && stav.razeni.smer === 'asc' ? 'desc' : 'asc';
      return { ...stav, razeni: { sloupec: akce.sloupec, smer }, stranka: 1 };
    }
    case 'stranka':
      return { ...stav, stranka: akce.hodnota };
    case 'vyber': {
      const uz = stav.vybrane.includes(akce.id);
      return {
        ...stav,
        vybrane: uz ? stav.vybrane.filter((id) => id !== akce.id) : [...stav.vybrane, akce.id],
      };
    }
    case 'vyber-stranku': {
      const chybi = akce.ids.filter((id) => !stav.vybrane.includes(id));
      return {
        ...stav,
        vybrane: chybi.length === 0 ? stav.vybrane.filter((id) => !akce.ids.includes(id)) : [...stav.vybrane, ...chybi],
      };
    }
    case 'zrus-vyber':
      return { ...stav, vybrane: [] };
    default:
      throw new Error('Neznámá akce: ' + akce.typ);
  }
}

function porovnej(a, b, sloupec) {
  if (sloupec === 'sazba') return a.sazba - b.sazba;
  return String(a[sloupec]).localeCompare(String(b[sloupec]), 'cs');
}

export default function App() {
  const [stav, poslat] = useReducer(tabulkaReducer, VYCHOZI);

  const hledej = stav.hledej.trim().toLowerCase();
  const filtrovane = lide.filter((clovek) => {
    const sedi = `${clovek.jmeno} ${clovek.mesto}`.toLowerCase().includes(hledej);
    return sedi && (stav.role === 'vse' || clovek.role === stav.role);
  });

  const serazene = [...filtrovane].sort((a, b) => {
    const smer = stav.razeni.smer === 'asc' ? 1 : -1;
    return porovnej(a, b, stav.razeni.sloupec) * smer;
  });

  const stranek = Math.max(1, Math.ceil(serazene.length / NA_STRANKU));
  const stranka = Math.min(stav.stranka, stranek);
  const zacatek = (stranka - 1) * NA_STRANKU;
  const naStrance = serazene.slice(zacatek, zacatek + NA_STRANKU);
  const idsNaStrance = naStrance.map((clovek) => clovek.id);
  const vseVybrano = idsNaStrance.length > 0 && idsNaStrance.every((id) => stav.vybrane.includes(id));

  const vybraniLide = lide.filter((clovek) => stav.vybrane.includes(clovek.id));
  const prumer =
    vybraniLide.length === 0
      ? 0
      : Math.round(vybraniLide.reduce((soucet, clovek) => soucet + clovek.sazba, 0) / vybraniLide.length);

  const sloupec = (klic, popis) => (
    <th
      scope="col"
      aria-sort={stav.razeni.sloupec === klic ? (stav.razeni.smer === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button type="button" onClick={() => poslat({ typ: 'radit', sloupec: klic })}>
        {popis}
      </button>
    </th>
  );

  return (
    <div className="tym">
      <h1 className="tym__nadpis">Tým</h1>
      <p className="tym__popis">Filtruj, řaď, listuj a vybírej řádky.</p>

      <div className="ovladani">
        <input
          type="search"
          value={stav.hledej}
          onChange={(e) => poslat({ typ: 'hledej', hodnota: e.target.value })}
          placeholder="Hledej jméno nebo město"
          aria-label="Hledej jméno nebo město"
        />
        <select
          value={stav.role}
          onChange={(e) => poslat({ typ: 'role', hodnota: e.target.value })}
          aria-label="Filtr podle role"
        >
          <option value="vse">Všechny role</option>
          {role.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {serazene.length === 0 ? (
        <p className="prazdno" data-testid="prazdno">
          Nikdo neodpovídá zadání. Zkus jiné hledání.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  checked={vseVybrano}
                  onChange={() => poslat({ typ: 'vyber-stranku', ids: idsNaStrance })}
                  aria-label="Vybrat všechny na stránce"
                />
              </th>
              {sloupec('jmeno', 'Jméno')}
              <th scope="col">Role</th>
              {sloupec('mesto', 'Město')}
              <th scope="col">Nástup</th>
              {sloupec('sazba', 'Sazba')}
            </tr>
          </thead>
          <tbody>
            {naStrance.map((clovek) => (
              <tr key={clovek.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={stav.vybrane.includes(clovek.id)}
                    onChange={() => poslat({ typ: 'vyber', id: clovek.id })}
                    aria-label={`Vybrat ${clovek.jmeno}`}
                  />
                </td>
                <td>{clovek.jmeno}</td>
                <td>{clovek.role}</td>
                <td>{clovek.mesto}</td>
                <td>{clovek.nastup}</td>
                <td className="cislo">{clovek.sazba} Kč</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="strankovani">
        <button
          type="button"
          className="tlacitko"
          disabled={stranka === 1}
          onClick={() => poslat({ typ: 'stranka', hodnota: stranka - 1 })}
        >
          Předchozí
        </button>
        <span data-testid="stranka">
          Stránka {stranka} ze {stranek}
        </span>
        <button
          type="button"
          className="tlacitko"
          disabled={stranka === stranek}
          onClick={() => poslat({ typ: 'stranka', hodnota: stranka + 1 })}
        >
          Další
        </button>
      </div>

      {stav.vybrane.length > 0 && (
        <div className="souhrn" data-testid="souhrn">
          <span>
            Vybráno {stav.vybrane.length}, průměrná sazba {prumer} Kč
          </span>
          <button type="button" className="tlacitko" onClick={() => poslat({ typ: 'zrus-vyber' })}>
            Zrušit výběr
          </button>
        </div>
      )}
    </div>
  );
}
```

# --approaches--

## --approach-- Jeden reducer

Všechno, co si tabulka pamatuje, je v jednom objektu a mění se akcemi. Pravidlo „změna filtru vrací stránku na jedničku" je napsané v reduceru a nedá se na ně zapomenout. Vyplatí se, jakmile se stavy ovlivňují navzájem — a v tabulce se ovlivňují skoro všechny.

### --file-- App.jsx

```jsx
import { useReducer } from 'react';
import { lide, role } from './data';

const NA_STRANKU = 5;

const VYCHOZI = {
  hledej: '',
  role: 'vse',
  razeni: { sloupec: 'jmeno', smer: 'asc' },
  stranka: 1,
  vybrane: [],
};

function tabulkaReducer(stav, akce) {
  switch (akce.typ) {
    case 'hledej':
      return { ...stav, hledej: akce.hodnota, stranka: 1 };
    case 'role':
      return { ...stav, role: akce.hodnota, stranka: 1 };
    case 'radit': {
      const smer =
        stav.razeni.sloupec === akce.sloupec && stav.razeni.smer === 'asc' ? 'desc' : 'asc';
      return { ...stav, razeni: { sloupec: akce.sloupec, smer }, stranka: 1 };
    }
    case 'stranka':
      return { ...stav, stranka: akce.hodnota };
    case 'vyber': {
      const uz = stav.vybrane.includes(akce.id);
      return {
        ...stav,
        vybrane: uz ? stav.vybrane.filter((id) => id !== akce.id) : [...stav.vybrane, akce.id],
      };
    }
    case 'vyber-stranku': {
      const chybi = akce.ids.filter((id) => !stav.vybrane.includes(id));
      return {
        ...stav,
        vybrane: chybi.length === 0 ? stav.vybrane.filter((id) => !akce.ids.includes(id)) : [...stav.vybrane, ...chybi],
      };
    }
    case 'zrus-vyber':
      return { ...stav, vybrane: [] };
    default:
      throw new Error('Neznámá akce: ' + akce.typ);
  }
}

function porovnej(a, b, sloupec) {
  if (sloupec === 'sazba') return a.sazba - b.sazba;
  return String(a[sloupec]).localeCompare(String(b[sloupec]), 'cs');
}

export default function App() {
  const [stav, poslat] = useReducer(tabulkaReducer, VYCHOZI);

  const hledej = stav.hledej.trim().toLowerCase();
  const filtrovane = lide.filter((clovek) => {
    const sedi = `${clovek.jmeno} ${clovek.mesto}`.toLowerCase().includes(hledej);
    return sedi && (stav.role === 'vse' || clovek.role === stav.role);
  });

  const serazene = [...filtrovane].sort((a, b) => {
    const smer = stav.razeni.smer === 'asc' ? 1 : -1;
    return porovnej(a, b, stav.razeni.sloupec) * smer;
  });

  const stranek = Math.max(1, Math.ceil(serazene.length / NA_STRANKU));
  const stranka = Math.min(stav.stranka, stranek);
  const zacatek = (stranka - 1) * NA_STRANKU;
  const naStrance = serazene.slice(zacatek, zacatek + NA_STRANKU);
  const idsNaStrance = naStrance.map((clovek) => clovek.id);
  const vseVybrano = idsNaStrance.length > 0 && idsNaStrance.every((id) => stav.vybrane.includes(id));

  const vybraniLide = lide.filter((clovek) => stav.vybrane.includes(clovek.id));
  const prumer =
    vybraniLide.length === 0
      ? 0
      : Math.round(vybraniLide.reduce((soucet, clovek) => soucet + clovek.sazba, 0) / vybraniLide.length);

  const sloupec = (klic, popis) => (
    <th
      scope="col"
      aria-sort={stav.razeni.sloupec === klic ? (stav.razeni.smer === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button type="button" onClick={() => poslat({ typ: 'radit', sloupec: klic })}>
        {popis}
      </button>
    </th>
  );

  return (
    <div className="tym">
      <h1 className="tym__nadpis">Tým</h1>
      <p className="tym__popis">Filtruj, řaď, listuj a vybírej řádky.</p>

      <div className="ovladani">
        <input
          type="search"
          value={stav.hledej}
          onChange={(e) => poslat({ typ: 'hledej', hodnota: e.target.value })}
          placeholder="Hledej jméno nebo město"
          aria-label="Hledej jméno nebo město"
        />
        <select
          value={stav.role}
          onChange={(e) => poslat({ typ: 'role', hodnota: e.target.value })}
          aria-label="Filtr podle role"
        >
          <option value="vse">Všechny role</option>
          {role.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {serazene.length === 0 ? (
        <p className="prazdno" data-testid="prazdno">
          Nikdo neodpovídá zadání. Zkus jiné hledání.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  checked={vseVybrano}
                  onChange={() => poslat({ typ: 'vyber-stranku', ids: idsNaStrance })}
                  aria-label="Vybrat všechny na stránce"
                />
              </th>
              {sloupec('jmeno', 'Jméno')}
              <th scope="col">Role</th>
              {sloupec('mesto', 'Město')}
              <th scope="col">Nástup</th>
              {sloupec('sazba', 'Sazba')}
            </tr>
          </thead>
          <tbody>
            {naStrance.map((clovek) => (
              <tr key={clovek.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={stav.vybrane.includes(clovek.id)}
                    onChange={() => poslat({ typ: 'vyber', id: clovek.id })}
                    aria-label={`Vybrat ${clovek.jmeno}`}
                  />
                </td>
                <td>{clovek.jmeno}</td>
                <td>{clovek.role}</td>
                <td>{clovek.mesto}</td>
                <td>{clovek.nastup}</td>
                <td className="cislo">{clovek.sazba} Kč</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="strankovani">
        <button
          type="button"
          className="tlacitko"
          disabled={stranka === 1}
          onClick={() => poslat({ typ: 'stranka', hodnota: stranka - 1 })}
        >
          Předchozí
        </button>
        <span data-testid="stranka">
          Stránka {stranka} ze {stranek}
        </span>
        <button
          type="button"
          className="tlacitko"
          disabled={stranka === stranek}
          onClick={() => poslat({ typ: 'stranka', hodnota: stranka + 1 })}
        >
          Další
        </button>
      </div>

      {stav.vybrane.length > 0 && (
        <div className="souhrn" data-testid="souhrn">
          <span>
            Vybráno {stav.vybrane.length}, průměrná sazba {prumer} Kč
          </span>
          <button type="button" className="tlacitko" onClick={() => poslat({ typ: 'zrus-vyber' })}>
            Zrušit výběr
          </button>
        </div>
      )}
    </div>
  );
}
```

## --approach-- Několik useState

Každá hodnota má vlastní stav a vlastní funkci. Čte se to pohodlně a u malé tabulky je to úplně v pořádku — jen pravidlo „vrať stránku na jedničku" musíš napsat na tři místa (hledání, role, řazení) a při každém dalším filtru na jedno další.

### --file-- App.jsx

```jsx
import { useState } from 'react';
import { lide, role } from './data';

const NA_STRANKU = 5;

function porovnej(a, b, sloupec) {
  if (sloupec === 'sazba') return a.sazba - b.sazba;
  return String(a[sloupec]).localeCompare(String(b[sloupec]), 'cs');
}

export default function App() {
  const [dotaz, setDotaz] = useState('');
  const [vybranaRole, setVybranaRole] = useState('vse');
  const [sloupecRazeni, setSloupecRazeni] = useState('jmeno');
  const [smer, setSmer] = useState('asc');
  const [cisloStranky, setCisloStranky] = useState(1);
  const [vybrane, setVybrane] = useState([]);

  function zmenRazeni(klic) {
    setSmer(sloupecRazeni === klic && smer === 'asc' ? 'desc' : 'asc');
    setSloupecRazeni(klic);
    setCisloStranky(1);
  }

  function prepniVyber(id) {
    setVybrane((stare) => (stare.includes(id) ? stare.filter((x) => x !== id) : [...stare, id]));
  }

  const hledej = dotaz.trim().toLowerCase();
  const filtrovane = lide.filter((clovek) => {
    const sedi = `${clovek.jmeno} ${clovek.mesto}`.toLowerCase().includes(hledej);
    return sedi && (vybranaRole === 'vse' || clovek.role === vybranaRole);
  });

  const serazene = [...filtrovane].sort((a, b) => {
    const nasobek = smer === 'asc' ? 1 : -1;
    return porovnej(a, b, sloupecRazeni) * nasobek;
  });

  const stranek = Math.max(1, Math.ceil(serazene.length / NA_STRANKU));
  const stranka = Math.min(cisloStranky, stranek);
  const zacatek = (stranka - 1) * NA_STRANKU;
  const naStrance = serazene.slice(zacatek, zacatek + NA_STRANKU);
  const idsNaStrance = naStrance.map((clovek) => clovek.id);
  const vseVybrano = idsNaStrance.length > 0 && idsNaStrance.every((id) => vybrane.includes(id));

  const vybraniLide = lide.filter((clovek) => vybrane.includes(clovek.id));
  const prumer =
    vybraniLide.length === 0
      ? 0
      : Math.round(vybraniLide.reduce((soucet, clovek) => soucet + clovek.sazba, 0) / vybraniLide.length);

  const sloupec = (klic, popis) => (
    <th
      scope="col"
      aria-sort={sloupecRazeni === klic ? (smer === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button type="button" onClick={() => zmenRazeni(klic)}>
        {popis}
      </button>
    </th>
  );

  return (
    <div className="tym">
      <h1 className="tym__nadpis">Tým</h1>
      <p className="tym__popis">Filtruj, řaď, listuj a vybírej řádky.</p>

      <div className="ovladani">
        <input
          type="search"
          value={dotaz}
          onChange={(e) => {
            setDotaz(e.target.value);
            setCisloStranky(1);
          }}
          placeholder="Hledej jméno nebo město"
          aria-label="Hledej jméno nebo město"
        />
        <select
          value={vybranaRole}
          onChange={(e) => {
            setVybranaRole(e.target.value);
            setCisloStranky(1);
          }}
          aria-label="Filtr podle role"
        >
          <option value="vse">Všechny role</option>
          {role.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {serazene.length === 0 ? (
        <p className="prazdno" data-testid="prazdno">
          Nikdo neodpovídá zadání. Zkus jiné hledání.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  checked={vseVybrano}
                  onChange={() =>
                    setVybrane((stare) =>
                      vseVybrano
                        ? stare.filter((id) => !idsNaStrance.includes(id))
                        : [...stare, ...idsNaStrance.filter((id) => !stare.includes(id))],
                    )
                  }
                  aria-label="Vybrat všechny na stránce"
                />
              </th>
              {sloupec('jmeno', 'Jméno')}
              <th scope="col">Role</th>
              {sloupec('mesto', 'Město')}
              <th scope="col">Nástup</th>
              {sloupec('sazba', 'Sazba')}
            </tr>
          </thead>
          <tbody>
            {naStrance.map((clovek) => (
              <tr key={clovek.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={vybrane.includes(clovek.id)}
                    onChange={() => prepniVyber(clovek.id)}
                    aria-label={`Vybrat ${clovek.jmeno}`}
                  />
                </td>
                <td>{clovek.jmeno}</td>
                <td>{clovek.role}</td>
                <td>{clovek.mesto}</td>
                <td>{clovek.nastup}</td>
                <td className="cislo">{clovek.sazba} Kč</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="strankovani">
        <button
          type="button"
          className="tlacitko"
          disabled={stranka === 1}
          onClick={() => setCisloStranky(stranka - 1)}
        >
          Předchozí
        </button>
        <span data-testid="stranka">
          Stránka {stranka} ze {stranek}
        </span>
        <button
          type="button"
          className="tlacitko"
          disabled={stranka === stranek}
          onClick={() => setCisloStranky(stranka + 1)}
        >
          Další
        </button>
      </div>

      {vybrane.length > 0 && (
        <div className="souhrn" data-testid="souhrn">
          <span>
            Vybráno {vybrane.length}, průměrná sazba {prumer} Kč
          </span>
          <button type="button" className="tlacitko" onClick={() => setVybrane([])}>
            Zrušit výběr
          </button>
        </div>
      )}
    </div>
  );
}
```

# --review--

Testy hlídají chování. Tohle si po sobě projdi sám.

## --rubric--

- Ve stavu je jen to, co se nedá dopočítat: filtr, řazení, stránka a vybraná id. Filtrovaný ani seřazený seznam ve stavu není.
- Filtrování, řazení a stránkování jdou v tomhle pořadí a každý krok stojí na výsledku předchozího.
- Pravidlo „změna filtru vrací na první stránku" je napsané na jednom místě, ne u každé obsluhy zvlášť.
- Texty se řadí přes `localeCompare` s jazykem `'cs'`, ne přes `<`.
- Tabulka má hlavičkové buňky `<th>` se `scope` a zaškrtávátka mají název (`aria-label`), takže se dá ovládat i bez myši.
- Jména komponent a proměnných říkají, co drží; nic se neopakuje na třech místech.

## --extensions--

Rozšíření bez testů: uložení filtrů do `localStorage` vlastním hookem z lekce o vlastních hoocích; export vybraných řádků do CSV; přepínač počtu řádků na stránku; sloupec s avatarem a barevným štítkem role; řazení podle data nástupu s hezky formátovaným datem.
