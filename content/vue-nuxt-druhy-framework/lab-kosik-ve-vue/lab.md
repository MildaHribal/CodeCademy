---
title: Košík ve Vue
runtime: vue
see: vue-nuxt-druhy-framework/prevodni-tabulka#seznamy-a-podminky, vue-nuxt-druhy-framework/reaktivita-vue#computed-se-pocita-jen-kdyz-je-potreba
---

# --description--

Košík je obrazovka, kterou má každý e-shop a na které se pozná, jestli ti odvozené hodnoty sedly. Nic se v něm totiž nedrží dvakrát: počet kusů se mění, a mezisoučet, doprava i částka k zaplacení se z něj musí dopočítat samy.

Postavíš košík pro sousedskou spíž **Dobrá spíž**. Zákazník v něm má pět položek a chce si před zaplacením pohrát s počty.

Od kolegy máš hotové `styles.css` (seznam, počítadlo kusů, souhrn i prázdný stav jsou nastylované) a data v `data.js`. V `index.html` je jen kostra s `<main id="app">`, v `app.js` prázdný `setup()`. Zbytek je na tobě.

**Co má košík umět:**

- Když zákazník stránku otevře, vidí seznam položek. U každé je název, cena za kus, počet kusů a mezisoučet za tu položku.
- Položky jsou v seznamu seřazené podle názvu tak, jak je řadí čeština.
- Když zákazník klikne na tlačítko s plusem, přibude jeden kus a mezisoučet i cena položek se hned přepočítají.
- Když klikne na tlačítko s mínusem, jeden kus ubude. Pod jeden kus to nejde — u položky s jedním kusem je tlačítko zakázané.
- Když klikne na `Odebrat`, položka ze seznamu zmizí.
- Souhrn ukazuje cenu položek, dopravu a částku k zaplacení. Doprava stojí 99 Kč, ale od 1000 Kč za položky (před slevou) je zdarma.
- Když zákazník napíše do pole pro slevový kód `AKADEMIE100` a použije ho, objeví se v souhrnu řádek se slevou 100 Kč a částka k zaplacení o ně klesne.
- Když napíše jakýkoli jiný kód, zobrazí se hláška, že kód neplatí, a nic se neodečte.
- Částka k zaplacení je vždycky cena položek minus sleva plus doprava.
- Když zákazník odebere všechny položky, místo seznamu i souhrnu se ukáže hláška, že je košík prázdný.

Testy hledají prvky podle atributů, abys mohl použít jakékoli značky a jakékoli texty:

| atribut | kde |
|---|---|
| `data-testid="polozka"` | obal jedné položky seznamu |
| `data-testid="nazev"`, `data-testid="cena"`, `data-testid="mnozstvi"`, `data-testid="mezisoucet"` | uvnitř položky |
| `data-akce="pridat"`, `data-akce="ubrat"`, `data-akce="odebrat"` | tlačítka uvnitř položky |
| `data-testid="celkem"`, `data-testid="doprava"`, `data-testid="sleva"`, `data-testid="k-zaplaceni"` | řádky souhrnu |
| `data-testid="kupon"`, `data-testid="kupon-pouzit"`, `data-testid="kupon-chyba"` | slevový kód |
| `data-testid="prazdno"` | hláška prázdného košíku |

Z částek testy čtou jen číslice, takže `1 290 Kč` i `1290 Kč` projde. Řádek se slevou se před použitím kódu ukazovat nemusí. **Texty, ikony a vzhled jsou tvoje volba** — data v `data.js` ale nech, jak jsou, testy na nich stojí.

> [!TIP]
> Než napíšeš první řádek, rozmysli si, co si košík musí **pamatovat** a co si pokaždé **dopočítá**. Čím kratší bude první seznam, tím méně míst budeš po každém kliknutí aktualizovat.

# --help--

## --tip--

Rozděl si hodnoty na dvě hromádky. Do první patří to, co mění zákazník kliknutím nebo psaním, do druhé to, co z první hromádky jednoznačně plyne. Na druhou hromádku se hodí [odvozené hodnoty](see:vue-nuxt-druhy-framework/reaktivita-vue#computed-se-pocita-jen-kdyz-je-potreba) — nikdy se rozejít nemůžou, protože se počítají z téhož zdroje.

## --tip--

Doprava ani částka k zaplacení nejsou samostatné stavy. Doprava je rozhodnutí podle ceny položek, sleva je rozhodnutí podle použitého kódu a poslední řádek souhrnu je jen sečtení předchozích tří. Řazení podle češtiny taky nemusíš dělat při každém kliknutí — stačí, aby seznam, který šablona vypisuje, byl setříděný už na vstupu.

# --hints--

Seznam ukazuje všechny položky z košíku a u každé název, cenu za kus a počet kusů.

```js
const $ = (sel) => document.querySelector(sel);
const polozky = () => [...document.querySelectorAll('[data-testid="polozka"]')];
const cislo = (el) => Number(String(el?.textContent ?? '').replace(/[^\d]/g, ''));

assert.equal(polozky().length, 5, `V košíku má být pět položek, našel jsem ${polozky().length} prvků [data-testid="polozka"]`);
for (const li of polozky()) {
  assert.ok(li.querySelector('[data-testid="nazev"]')?.textContent.trim(), 'Každá položka má [data-testid="nazev"] s názvem zboží');
  assert.ok(cislo(li.querySelector('[data-testid="cena"]')) > 0, 'Každá položka má [data-testid="cena"] s cenou za kus');
  assert.ok(cislo(li.querySelector('[data-testid="mnozstvi"]')) > 0, 'Každá položka má [data-testid="mnozstvi"] s počtem kusů');
}
```

Položky jsou seřazené podle názvu tak, jak řadí čeština.

```js
const polozky = () => [...document.querySelectorAll('[data-testid="polozka"]')];
const nazvy = () => polozky().map((li) => li.querySelector('[data-testid="nazev"]').textContent.trim());

const videne = nazvy();
const spravne = [...videne].sort((a, b) => a.localeCompare(b, 'cs'));
assert.deepEqual(videne, spravne, `Pořadí položek neodpovídá české abecedě; čekám ${spravne.join(', ')}`);
```

Mezisoučet položky je cena za kus krát počet kusů.

```js
const polozky = () => [...document.querySelectorAll('[data-testid="polozka"]')];
const cislo = (el) => Number(String(el?.textContent ?? '').replace(/[^\d]/g, ''));

for (const li of polozky()) {
  const nazev = li.querySelector('[data-testid="nazev"]').textContent.trim();
  const cena = cislo(li.querySelector('[data-testid="cena"]'));
  const kusy = cislo(li.querySelector('[data-testid="mnozstvi"]'));
  assert.equal(cislo(li.querySelector('[data-testid="mezisoucet"]')), cena * kusy, `Mezisoučet položky „${nazev}" má být ${cena} × ${kusy}`);
}
```

Tlačítko s plusem přidá kus a přepočítá mezisoučet i cenu položek.

```js
const $ = (sel) => document.querySelector(sel);
const polozky = () => [...document.querySelectorAll('[data-testid="polozka"]')];
const cislo = (el) => Number(String(el?.textContent ?? '').replace(/[^\d]/g, ''));

const cena = cislo(polozky()[0].querySelector('[data-testid="cena"]'));
const kusyPred = cislo(polozky()[0].querySelector('[data-testid="mnozstvi"]'));
const celkemPred = cislo($('[data-testid="celkem"]'));
const tlacitko = polozky()[0].querySelector('[data-akce="pridat"]');
assert.ok(tlacitko, 'Každá položka má tlačítko [data-akce="pridat"]');

await helpers.click(tlacitko);
await helpers.flush();
assert.equal(cislo(polozky()[0].querySelector('[data-testid="mnozstvi"]')), kusyPred + 1, 'Po kliknutí na plus má počet kusů vzrůst o jeden');
assert.equal(cislo(polozky()[0].querySelector('[data-testid="mezisoucet"]')), cena * (kusyPred + 1), 'Po přidání kusu se má přepočítat mezisoučet položky');
assert.equal(cislo($('[data-testid="celkem"]')), celkemPred + cena, 'Po přidání kusu má cena položek vzrůst o cenu jednoho kusu');
```

Tlačítko s mínusem kus ubere.

```js
const polozky = () => [...document.querySelectorAll('[data-testid="polozka"]')];
const cislo = (el) => Number(String(el?.textContent ?? '').replace(/[^\d]/g, ''));

const kusyPred = cislo(polozky()[0].querySelector('[data-testid="mnozstvi"]'));
assert.ok(kusyPred > 1, 'První položka v seznamu má mít na začátku víc než jeden kus');
const tlacitko = polozky()[0].querySelector('[data-akce="ubrat"]');
assert.ok(tlacitko, 'Každá položka má tlačítko [data-akce="ubrat"]');

await helpers.click(tlacitko);
await helpers.flush();
assert.equal(cislo(polozky()[0].querySelector('[data-testid="mnozstvi"]')), kusyPred - 1, 'Po kliknutí na mínus má počet kusů klesnout o jeden');
```

Počet kusů neklesne pod jeden a tlačítko s mínusem je u takové položky zakázané.

```js
const polozky = () => [...document.querySelectorAll('[data-testid="polozka"]')];
const cislo = (el) => Number(String(el?.textContent ?? '').replace(/[^\d]/g, ''));
const kusy = () => cislo(polozky()[0].querySelector('[data-testid="mnozstvi"]'));

for (let krok = 0; krok < 10 && kusy() > 1; krok += 1) {
  await helpers.click(polozky()[0].querySelector('[data-akce="ubrat"]'));
  await helpers.flush();
}
assert.equal(kusy(), 1, 'U první položky má po několika kliknutích na mínus zůstat jeden kus');
await helpers.click(polozky()[0].querySelector('[data-akce="ubrat"]'));
await helpers.flush();
assert.equal(kusy(), 1, 'Počet kusů nesmí klesnout pod jeden');
assert.ok(polozky()[0].querySelector('[data-akce="ubrat"]').disabled, 'U položky s jedním kusem má být tlačítko [data-akce="ubrat"] zakázané (disabled)');
```

Tlačítko `Odebrat` položku ze seznamu odstraní.

```js
const polozky = () => [...document.querySelectorAll('[data-testid="polozka"]')];
const nazvy = () => polozky().map((li) => li.querySelector('[data-testid="nazev"]').textContent.trim());

const pocetPred = polozky().length;
const nazev = nazvy()[1];
const tlacitko = polozky()[1].querySelector('[data-akce="odebrat"]');
assert.ok(tlacitko, 'Každá položka má tlačítko [data-akce="odebrat"]');

await helpers.click(tlacitko);
await helpers.flush();
assert.equal(polozky().length, pocetPred - 1, 'Po odebrání má v seznamu zůstat o jednu položku méně');
assert.ok(!nazvy().includes(nazev), `Po odebrání už položka „${nazev}" v seznamu být nemá`);
```

Cena položek v souhrnu je součtem mezisoučtů a mění se s každou změnou košíku.

```js
const $ = (sel) => document.querySelector(sel);
const polozky = () => [...document.querySelectorAll('[data-testid="polozka"]')];
const cislo = (el) => Number(String(el?.textContent ?? '').replace(/[^\d]/g, ''));
const soucet = () => polozky().reduce((sum, li) => sum + cislo(li.querySelector('[data-testid="mezisoucet"]')), 0);

assert.ok($('[data-testid="celkem"]'), 'Souhrn má prvek [data-testid="celkem"] s cenou položek');
assert.equal(cislo($('[data-testid="celkem"]')), soucet(), 'Cena položek má být součtem všech mezisoučtů');
await helpers.click(polozky()[0].querySelector('[data-akce="odebrat"]'));
await helpers.flush();
assert.equal(cislo($('[data-testid="celkem"]')), soucet(), 'Po odebrání položky má cena položek odpovídat novému součtu mezisoučtů');
```

Doprava stojí 99 Kč, od 1000 Kč za položky je zdarma.

```js
const $ = (sel) => document.querySelector(sel);
const polozky = () => [...document.querySelectorAll('[data-testid="polozka"]')];
const cislo = (el) => Number(String(el?.textContent ?? '').replace(/[^\d]/g, ''));
const zdarma = () => /zdarma/i.test($('[data-testid="doprava"]').textContent) || cislo($('[data-testid="doprava"]')) === 0;

assert.ok($('[data-testid="doprava"]'), 'Souhrn má prvek [data-testid="doprava"]');
assert.ok(cislo($('[data-testid="celkem"]')) < 1000, 'Košík má na začátku stát méně než 1000 Kč');
assert.equal(cislo($('[data-testid="doprava"]')), 99, 'Pod 1000 Kč za položky stojí doprava 99 Kč');

for (let krok = 0; krok < 10 && cislo($('[data-testid="celkem"]')) < 1000; krok += 1) {
  await helpers.click(polozky().at(-1).querySelector('[data-akce="pridat"]'));
  await helpers.flush();
}
assert.ok(cislo($('[data-testid="celkem"]')) >= 1000, 'Přidáváním kusů se má dát dostat přes 1000 Kč');
assert.ok(zdarma(), `Od 1000 Kč má být doprava zdarma, souhrn ukazuje „${$('[data-testid="doprava"]').textContent.trim()}"`);
```

Kód `AKADEMIE100` odečte sto korun.

```js
const $ = (sel) => document.querySelector(sel);
const cislo = (el) => Number(String(el?.textContent ?? '').replace(/[^\d]/g, ''));

const pole = $('[data-testid="kupon"]');
const pouzit = $('[data-testid="kupon-pouzit"]');
assert.ok(pole, 'Košík má pole [data-testid="kupon"] pro slevový kód');
assert.ok(pouzit, 'Košík má tlačítko [data-testid="kupon-pouzit"]');
const predSlevou = cislo($('[data-testid="k-zaplaceni"]'));

await helpers.type(pole, 'AKADEMIE100');
await helpers.click(pouzit);
await helpers.flush();
assert.ok($('[data-testid="sleva"]'), 'Po použití platného kódu se má v souhrnu objevit [data-testid="sleva"]');
assert.equal(cislo($('[data-testid="sleva"]')), 100, 'Kód AKADEMIE100 odečítá 100 Kč');
assert.equal(cislo($('[data-testid="k-zaplaceni"]')), predSlevou - 100, 'Po slevě má částka k zaplacení klesnout o sto korun');
```

Neplatný kód nic neodečte a ukáže hlášku.

```js
const $ = (sel) => document.querySelector(sel);
const cislo = (el) => Number(String(el?.textContent ?? '').replace(/[^\d]/g, ''));

const predKodem = cislo($('[data-testid="k-zaplaceni"]'));
await helpers.type($('[data-testid="kupon"]'), 'SLEVA999');
await helpers.click($('[data-testid="kupon-pouzit"]'));
await helpers.flush();
assert.ok($('[data-testid="kupon-chyba"]')?.textContent.trim(), 'Neplatný kód má ukázat hlášku v [data-testid="kupon-chyba"]');
const sleva = $('[data-testid="sleva"]');
assert.ok(!sleva || cislo(sleva) === 0, 'Neplatný kód nesmí nic odečíst');
assert.equal(cislo($('[data-testid="k-zaplaceni"]')), predKodem, 'Po neplatném kódu zůstává částka k zaplacení stejná');
```

Částka k zaplacení je cena položek minus sleva plus doprava.

```js
const $ = (sel) => document.querySelector(sel);
const cislo = (el) => Number(String(el?.textContent ?? '').replace(/[^\d]/g, ''));
const doprava = () => (/zdarma/i.test($('[data-testid="doprava"]').textContent) ? 0 : cislo($('[data-testid="doprava"]')));
const sleva = () => ($('[data-testid="sleva"]') ? cislo($('[data-testid="sleva"]')) : 0);
const ocekavane = () => cislo($('[data-testid="celkem"]')) - sleva() + doprava();

assert.ok($('[data-testid="k-zaplaceni"]'), 'Souhrn má prvek [data-testid="k-zaplaceni"]');
assert.equal(cislo($('[data-testid="k-zaplaceni"]')), ocekavane(), 'Bez slevy je k zaplacení cena položek plus doprava');

await helpers.type($('[data-testid="kupon"]'), 'AKADEMIE100');
await helpers.click($('[data-testid="kupon-pouzit"]'));
await helpers.flush();
assert.equal(cislo($('[data-testid="k-zaplaceni"]')), ocekavane(), 'Se slevou je k zaplacení cena položek minus sleva plus doprava');
```

Prázdný košík ukáže hlášku místo seznamu a souhrnu.

```js
const $ = (sel) => document.querySelector(sel);
const polozky = () => [...document.querySelectorAll('[data-testid="polozka"]')];

for (let krok = 0; krok < 12 && polozky().length; krok += 1) {
  await helpers.click(polozky()[0].querySelector('[data-akce="odebrat"]'));
  await helpers.flush();
}
assert.equal(polozky().length, 0, 'Po odebrání všech položek nemá v seznamu zůstat žádná');
assert.ok($('[data-testid="prazdno"]')?.textContent.trim(), 'Prázdný košík ukáže hlášku v [data-testid="prazdno"]');
assert.ok(!$('[data-testid="k-zaplaceni"]'), 'V prázdném košíku se souhrn s částkou k zaplacení neukazuje');
```

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <title>Košík — Dobrá spíž</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main id="app" class="kosik">
      <header class="kosik__hlavicka">
        <p class="kosik__znacka">Dobrá spíž</p>
        <h1 class="kosik__nadpis">Košík</h1>
      </header>
--edit--
      <!-- Sem patří seznam položek, slevový kód, souhrn a hláška prázdného košíku. -->
--edit--
    </main>
    <script type="module" src="app.js"></script>
  </body>
</html>
```

## --file-- data.js

```js
// Co má zákazník v košíku. Cena je za jeden kus v celých korunách.
export const polozky = [
  { id: 'chleb', nazev: 'Chléb kváskový', cena: 62, mnozstvi: 1 },
  { id: 'cuketa', nazev: 'Cuketa', cena: 29, mnozstvi: 3 },
  { id: 'cedar', nazev: 'Čedar zrající', cena: 149, mnozstvi: 2 },
  { id: 'houska', nazev: 'Houska grahamová', cena: 12, mnozstvi: 6 },
  { id: 'kava', nazev: 'Káva zrnková, 1 kg', cena: 389, mnozstvi: 1 },
];
```

## --file-- app.js

```js
import { createApp, computed, ref } from 'vue';
import { polozky } from './data.js';

const KOD_SLEVY = 'AKADEMIE100';
const SLEVA = 100;
const DOPRAVA = 99;
const DOPRAVA_ZDARMA_OD = 1000;

createApp({
  setup() {
    /** Položky v košíku. Kopie dat, ať se původní pole nemění. */
    const kosik = ref(polozky.map((polozka) => ({ ...polozka })));

    /**
     * Částka v korunách jako text pro zákazníka.
     * @param {number} castka
     * @returns {string}
     */
    function mena(castka) {
      return `${castka.toLocaleString('cs-CZ')} Kč`;
    }

--edit--

--edit--

    return { kosik, mena };
  },
}).mount('#app');
```

## --file-- styles.css

```css
:root {
  --papir: #fffaf3;
  --inkoust: #2b2118;
  --tlumene: #8a7a6a;
  --akcent: #b4531f;
  --linka: #ecdfcd;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  padding: 2.5rem 1rem;
  background: var(--papir);
  color: var(--inkoust);
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}
.kosik {
  width: min(38rem, 100%);
  margin: 0 auto;
  background: #fff;
  border: 1px solid var(--linka);
  border-radius: 1rem;
  box-shadow: 0 1rem 2.5rem rgb(43 33 24 / 0.08);
  overflow: hidden;
}
.kosik__hlavicka { padding: 1.5rem 1.75rem 1rem; border-bottom: 1px solid var(--linka); }
.kosik__znacka {
  margin: 0;
  color: var(--akcent);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.kosik__nadpis { margin: 0.25rem 0 0; font-size: 1.6rem; }
.kosik__seznam { margin: 0; padding: 0 1.75rem; list-style: none; }
.polozka {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--linka);
}
.polozka__nazev { display: block; font-weight: 600; }
.polozka__cena { display: block; color: var(--tlumene); font-size: 0.85rem; }
.polozka__mezisoucet { font-variant-numeric: tabular-nums; font-weight: 600; }
.pocitadlo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.15rem;
  border: 1px solid var(--linka);
  border-radius: 999px;
}
.pocitadlo__tlacitko {
  width: 1.9rem;
  height: 1.9rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--inkoust);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}
.pocitadlo__tlacitko:hover:not(:disabled) { background: var(--akcent); color: #fff; }
.pocitadlo__tlacitko:disabled { color: var(--linka); cursor: not-allowed; }
.pocitadlo__hodnota { min-width: 1.5rem; text-align: center; font-variant-numeric: tabular-nums; }
.odebrat {
  border: 0;
  background: none;
  color: var(--tlumene);
  font-size: 0.85rem;
  text-decoration: underline;
  cursor: pointer;
  transition: color 150ms ease;
}
.odebrat:hover { color: var(--akcent); }
.kupon { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 1.25rem 1.75rem 0; }
.kupon__pole {
  flex: 1 1 10rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--linka);
  border-radius: 0.6rem;
  font: inherit;
}
.kupon__chyba { margin: 0.5rem 1.75rem 0; color: #a3341a; font-size: 0.85rem; }
.tlacitko {
  padding: 0.6rem 1.1rem;
  border: 0;
  border-radius: 0.6rem;
  background: var(--akcent);
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: transform 150ms ease, background-color 150ms ease;
}
.tlacitko:hover { background: #963f12; }
.tlacitko:active { transform: translateY(1px); }
:focus-visible { outline: 3px solid var(--akcent); outline-offset: 2px; }
.souhrn { margin: 1.25rem 0 0; padding: 1.25rem 1.75rem; background: #fdf4e8; }
.souhrn__radek { display: flex; justify-content: space-between; gap: 1rem; padding: 0.3rem 0; }
.souhrn__radek dt, .souhrn__radek dd { margin: 0; }
.souhrn__radek dd { font-variant-numeric: tabular-nums; }
.souhrn__radek--sleva { color: var(--akcent); }
.souhrn__radek--celkem {
  margin-top: 0.5rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--linka);
  font-size: 1.15rem;
  font-weight: 700;
}
.prazdno { margin: 0; padding: 3rem 1.75rem; color: var(--tlumene); text-align: center; }
```

# --solution--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <title>Košík — Dobrá spíž</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main id="app" class="kosik">
      <header class="kosik__hlavicka">
        <p class="kosik__znacka">Dobrá spíž</p>
        <h1 class="kosik__nadpis">Košík</h1>
      </header>

      <div v-if="kosik.length">
        <ul class="kosik__seznam">
          <li v-for="polozka in serazene" :key="polozka.id" class="polozka" data-testid="polozka">
            <div>
              <span class="polozka__nazev" data-testid="nazev">{{ polozka.nazev }}</span>
              <span class="polozka__cena" data-testid="cena">{{ mena(polozka.cena) }} za kus</span>
            </div>
            <div class="pocitadlo">
              <button type="button" class="pocitadlo__tlacitko" data-akce="ubrat" aria-label="Ubrat kus"
                      :disabled="polozka.mnozstvi === 1" @click="ubrat(polozka)">−</button>
              <span class="pocitadlo__hodnota" data-testid="mnozstvi">{{ polozka.mnozstvi }}</span>
              <button type="button" class="pocitadlo__tlacitko" data-akce="pridat" aria-label="Přidat kus"
                      @click="pridat(polozka)">+</button>
            </div>
            <span class="polozka__mezisoucet" data-testid="mezisoucet">{{ mena(polozka.cena * polozka.mnozstvi) }}</span>
            <button type="button" class="odebrat" data-akce="odebrat" @click="odebrat(polozka)">Odebrat</button>
          </li>
        </ul>

        <div class="kupon">
          <input class="kupon__pole" type="text" data-testid="kupon" v-model="kod"
                 aria-label="Slevový kód" placeholder="Slevový kód">
          <button type="button" class="tlacitko" data-testid="kupon-pouzit" @click="pouzitKod">Použít</button>
        </div>
        <p v-if="chybaKodu" class="kupon__chyba" data-testid="kupon-chyba">{{ chybaKodu }}</p>

        <dl class="souhrn">
          <div class="souhrn__radek">
            <dt>Položky</dt>
            <dd data-testid="celkem">{{ mena(cenaPolozek) }}</dd>
          </div>
          <div v-if="sleva" class="souhrn__radek souhrn__radek--sleva">
            <dt>Sleva AKADEMIE100</dt>
            <dd data-testid="sleva">−{{ mena(sleva) }}</dd>
          </div>
          <div class="souhrn__radek">
            <dt>Doprava</dt>
            <dd data-testid="doprava">{{ doprava === 0 ? 'Zdarma' : mena(doprava) }}</dd>
          </div>
          <div class="souhrn__radek souhrn__radek--celkem">
            <dt>K zaplacení</dt>
            <dd data-testid="k-zaplaceni">{{ mena(kZaplaceni) }}</dd>
          </div>
        </dl>
      </div>

      <p v-else class="prazdno" data-testid="prazdno">Košík je prázdný. Vrať se do spíže a vyber si něco dobrého.</p>
    </main>
    <script type="module" src="app.js"></script>
  </body>
</html>
```

## --file-- app.js

```js
import { createApp, computed, ref } from 'vue';
import { polozky } from './data.js';

const KOD_SLEVY = 'AKADEMIE100';
const SLEVA = 100;
const DOPRAVA = 99;
const DOPRAVA_ZDARMA_OD = 1000;

createApp({
  setup() {
    /** Položky v košíku. Kopie dat, ať se původní pole nemění. */
    const kosik = ref(polozky.map((polozka) => ({ ...polozka })));
    const kod = ref('');
    const slevaPouzita = ref(false);
    const chybaKodu = ref('');

    /**
     * Částka v korunách jako text pro zákazníka.
     * @param {number} castka
     * @returns {string}
     */
    function mena(castka) {
      return `${castka.toLocaleString('cs-CZ')} Kč`;
    }

    const serazene = computed(() => [...kosik.value].sort((a, b) => a.nazev.localeCompare(b.nazev, 'cs')));
    const cenaPolozek = computed(() => kosik.value.reduce((soucet, polozka) => soucet + polozka.cena * polozka.mnozstvi, 0));
    const sleva = computed(() => (slevaPouzita.value ? SLEVA : 0));
    const doprava = computed(() => (cenaPolozek.value >= DOPRAVA_ZDARMA_OD ? 0 : DOPRAVA));
    const kZaplaceni = computed(() => cenaPolozek.value - sleva.value + doprava.value);

    function pridat(polozka) {
      polozka.mnozstvi += 1;
    }

    function ubrat(polozka) {
      if (polozka.mnozstvi > 1) polozka.mnozstvi -= 1;
    }

    function odebrat(polozka) {
      kosik.value = kosik.value.filter((v) => v.id !== polozka.id);
    }

    function pouzitKod() {
      const zadany = kod.value.trim().toUpperCase();
      if (zadany === KOD_SLEVY) {
        slevaPouzita.value = true;
        chybaKodu.value = '';
      } else {
        slevaPouzita.value = false;
        chybaKodu.value = `Kód „${kod.value.trim()}" neznáme.`;
      }
    }

    return {
      kosik, serazene, cenaPolozek, sleva, doprava, kZaplaceni,
      kod, chybaKodu, mena, pridat, ubrat, odebrat, pouzitKod,
    };
  },
}).mount('#app');
```

# --explain--

Počet kusů, cena položek, doprava i částka k zaplacení se mění po každém kliknutí. Vysvětli, podle čeho ses rozhodoval, co z toho dáš do `ref` a co do `computed` — a co by se pokazilo, kdybys cenu položek držel v `ref` a přepisoval ji v každé obsluze kliknutí.

## --model--

Do [[reaktivní ref|refu]] patří jen to, co mění zákazník: seznam položek s počty a napsaný slevový kód. Všechno ostatní z toho jednoznačně plyne, takže to patří do [[computed]] — cena položek je součet mezisoučtů, doprava je rozhodnutí podle ceny položek a částka k zaplacení je součet předchozích řádků. Kdybych cenu položek držel v `ref`, musel bych ji přepsat ve funkci pro přidání kusu, pro ubrání kusu i pro odebrání položky. Stačilo by na jedno z těch míst zapomenout nebo přidat čtvrtou akci a souhrn by ukazoval jiné číslo než seznam nad ním. `computed` se navíc přepočítá jen tehdy, když se změní něco, z čeho čte.

## --checklist--

- Ve stavu (`ref`) je jen to, co mění zákazník; ostatní se dopočítá.
- Odvozená hodnota se nemůže rozejít se zdrojem, protože se z něj pokaždé počítá znovu.
- Ručně udržovaný součet se rozbije, jakmile zapomenu na jedno místo, kde se seznam mění.

# --approaches--

## --approach-- Souhrn v jednom computed

Místo čtyř samostatných odvozených hodnot vrací jedno `computed` celý souhrn jako objekt. Hodí se, když čísla souhrnu na sobě navazují a chceš mít celý výpočet pohromadě a přečíst ho shora dolů. Nevýhoda: šablona pak sahá na `souhrn.doprava` a každá změna košíku přepočítá celý objekt naráz.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <title>Košík — Dobrá spíž</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main id="app" class="kosik">
      <header class="kosik__hlavicka">
        <p class="kosik__znacka">Dobrá spíž</p>
        <h1 class="kosik__nadpis">Košík</h1>
      </header>

      <div v-if="kosik.length">
        <ul class="kosik__seznam">
          <li v-for="polozka in serazene" :key="polozka.id" class="polozka" data-testid="polozka">
            <div>
              <span class="polozka__nazev" data-testid="nazev">{{ polozka.nazev }}</span>
              <span class="polozka__cena" data-testid="cena">{{ mena(polozka.cena) }} za kus</span>
            </div>
            <div class="pocitadlo">
              <button type="button" class="pocitadlo__tlacitko" data-akce="ubrat" aria-label="Ubrat kus"
                      :disabled="polozka.mnozstvi === 1" @click="ubrat(polozka)">−</button>
              <span class="pocitadlo__hodnota" data-testid="mnozstvi">{{ polozka.mnozstvi }}</span>
              <button type="button" class="pocitadlo__tlacitko" data-akce="pridat" aria-label="Přidat kus"
                      @click="pridat(polozka)">+</button>
            </div>
            <span class="polozka__mezisoucet" data-testid="mezisoucet">{{ mena(polozka.cena * polozka.mnozstvi) }}</span>
            <button type="button" class="odebrat" data-akce="odebrat" @click="odebrat(polozka)">Odebrat</button>
          </li>
        </ul>

        <div class="kupon">
          <input class="kupon__pole" type="text" data-testid="kupon" v-model="kod"
                 aria-label="Slevový kód" placeholder="Slevový kód">
          <button type="button" class="tlacitko" data-testid="kupon-pouzit" @click="pouzitKod">Použít</button>
        </div>
        <p v-if="chybaKodu" class="kupon__chyba" data-testid="kupon-chyba">{{ chybaKodu }}</p>

        <dl class="souhrn">
          <div class="souhrn__radek">
            <dt>Položky</dt>
            <dd data-testid="celkem">{{ mena(souhrn.polozky) }}</dd>
          </div>
          <div v-if="souhrn.sleva" class="souhrn__radek souhrn__radek--sleva">
            <dt>Sleva AKADEMIE100</dt>
            <dd data-testid="sleva">−{{ mena(souhrn.sleva) }}</dd>
          </div>
          <div class="souhrn__radek">
            <dt>Doprava</dt>
            <dd data-testid="doprava">{{ souhrn.doprava === 0 ? 'Zdarma' : mena(souhrn.doprava) }}</dd>
          </div>
          <div class="souhrn__radek souhrn__radek--celkem">
            <dt>K zaplacení</dt>
            <dd data-testid="k-zaplaceni">{{ mena(souhrn.kZaplaceni) }}</dd>
          </div>
        </dl>
      </div>

      <p v-else class="prazdno" data-testid="prazdno">Košík je prázdný. Vrať se do spíže a vyber si něco dobrého.</p>
    </main>
    <script type="module" src="app.js"></script>
  </body>
</html>
```

### --file-- app.js

```js
import { createApp, computed, ref } from 'vue';
import { polozky } from './data.js';

const KOD_SLEVY = 'AKADEMIE100';
const SLEVA = 100;
const DOPRAVA = 99;
const DOPRAVA_ZDARMA_OD = 1000;

createApp({
  setup() {
    const kosik = ref(polozky.map((polozka) => ({ ...polozka })));
    const kod = ref('');
    const slevaPouzita = ref(false);
    const chybaKodu = ref('');

    function mena(castka) {
      return `${castka.toLocaleString('cs-CZ')} Kč`;
    }

    const serazene = computed(() => [...kosik.value].sort((a, b) => a.nazev.localeCompare(b.nazev, 'cs')));

    const souhrn = computed(() => {
      const polozkyCelkem = kosik.value.reduce((soucet, polozka) => soucet + polozka.cena * polozka.mnozstvi, 0);
      const sleva = slevaPouzita.value ? SLEVA : 0;
      const doprava = polozkyCelkem >= DOPRAVA_ZDARMA_OD ? 0 : DOPRAVA;
      return { polozky: polozkyCelkem, sleva, doprava, kZaplaceni: polozkyCelkem - sleva + doprava };
    });

    function pridat(polozka) {
      polozka.mnozstvi += 1;
    }

    function ubrat(polozka) {
      if (polozka.mnozstvi > 1) polozka.mnozstvi -= 1;
    }

    function odebrat(polozka) {
      kosik.value = kosik.value.filter((v) => v.id !== polozka.id);
    }

    function pouzitKod() {
      if (kod.value.trim().toUpperCase() === KOD_SLEVY) {
        slevaPouzita.value = true;
        chybaKodu.value = '';
      } else {
        slevaPouzita.value = false;
        chybaKodu.value = `Kód „${kod.value.trim()}" neznáme.`;
      }
    }

    return { kosik, serazene, souhrn, kod, chybaKodu, mena, pridat, ubrat, odebrat, pouzitKod };
  },
}).mount('#app');
```

## --approach-- Celý stav v jednom reactive

Košík, napsaný kód i chybová hláška bydlí v jednom objektu `reactive`, takže nikde nepíšeš `.value` a stav aplikace se dá přečíst z jednoho místa. Blíž to má k `useReducer` z Reactu: jeden objekt, jedno místo, kde se mění. Pozor na to, že jednotlivé vlastnosti z něj nejdou vytáhnout do proměnných — reaktivitu by ztratily.

### --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <title>Košík — Dobrá spíž</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main id="app" class="kosik">
      <header class="kosik__hlavicka">
        <p class="kosik__znacka">Dobrá spíž</p>
        <h1 class="kosik__nadpis">Košík</h1>
      </header>

      <div v-if="stav.kosik.length">
        <ul class="kosik__seznam">
          <li v-for="polozka in serazene" :key="polozka.id" class="polozka" data-testid="polozka">
            <div>
              <span class="polozka__nazev" data-testid="nazev">{{ polozka.nazev }}</span>
              <span class="polozka__cena" data-testid="cena">{{ mena(polozka.cena) }} za kus</span>
            </div>
            <div class="pocitadlo">
              <button type="button" class="pocitadlo__tlacitko" data-akce="ubrat" aria-label="Ubrat kus"
                      :disabled="polozka.mnozstvi === 1" @click="ubrat(polozka)">−</button>
              <span class="pocitadlo__hodnota" data-testid="mnozstvi">{{ polozka.mnozstvi }}</span>
              <button type="button" class="pocitadlo__tlacitko" data-akce="pridat" aria-label="Přidat kus"
                      @click="pridat(polozka)">+</button>
            </div>
            <span class="polozka__mezisoucet" data-testid="mezisoucet">{{ mena(polozka.cena * polozka.mnozstvi) }}</span>
            <button type="button" class="odebrat" data-akce="odebrat" @click="odebrat(polozka)">Odebrat</button>
          </li>
        </ul>

        <div class="kupon">
          <input class="kupon__pole" type="text" data-testid="kupon" v-model="stav.kod"
                 aria-label="Slevový kód" placeholder="Slevový kód">
          <button type="button" class="tlacitko" data-testid="kupon-pouzit" @click="pouzitKod">Použít</button>
        </div>
        <p v-if="stav.chyba" class="kupon__chyba" data-testid="kupon-chyba">{{ stav.chyba }}</p>

        <dl class="souhrn">
          <div class="souhrn__radek">
            <dt>Položky</dt>
            <dd data-testid="celkem">{{ mena(cenaPolozek) }}</dd>
          </div>
          <div v-if="sleva" class="souhrn__radek souhrn__radek--sleva">
            <dt>Sleva AKADEMIE100</dt>
            <dd data-testid="sleva">−{{ mena(sleva) }}</dd>
          </div>
          <div class="souhrn__radek">
            <dt>Doprava</dt>
            <dd data-testid="doprava">{{ doprava === 0 ? 'Zdarma' : mena(doprava) }}</dd>
          </div>
          <div class="souhrn__radek souhrn__radek--celkem">
            <dt>K zaplacení</dt>
            <dd data-testid="k-zaplaceni">{{ mena(kZaplaceni) }}</dd>
          </div>
        </dl>
      </div>

      <p v-else class="prazdno" data-testid="prazdno">Košík je prázdný. Vrať se do spíže a vyber si něco dobrého.</p>
    </main>
    <script type="module" src="app.js"></script>
  </body>
</html>
```

### --file-- app.js

```js
import { createApp, computed, reactive } from 'vue';
import { polozky } from './data.js';

const KOD_SLEVY = 'AKADEMIE100';
const SLEVA = 100;
const DOPRAVA = 99;
const DOPRAVA_ZDARMA_OD = 1000;

createApp({
  setup() {
    const stav = reactive({
      kosik: polozky.map((polozka) => ({ ...polozka })),
      kod: '',
      slevaPouzita: false,
      chyba: '',
    });

    function mena(castka) {
      return `${castka.toLocaleString('cs-CZ')} Kč`;
    }

    const serazene = computed(() => [...stav.kosik].sort((a, b) => a.nazev.localeCompare(b.nazev, 'cs')));
    const cenaPolozek = computed(() => stav.kosik.reduce((soucet, polozka) => soucet + polozka.cena * polozka.mnozstvi, 0));
    const sleva = computed(() => (stav.slevaPouzita ? SLEVA : 0));
    const doprava = computed(() => (cenaPolozek.value >= DOPRAVA_ZDARMA_OD ? 0 : DOPRAVA));
    const kZaplaceni = computed(() => cenaPolozek.value - sleva.value + doprava.value);

    function pridat(polozka) {
      polozka.mnozstvi += 1;
    }

    function ubrat(polozka) {
      if (polozka.mnozstvi > 1) polozka.mnozstvi -= 1;
    }

    function odebrat(polozka) {
      const index = stav.kosik.findIndex((v) => v.id === polozka.id);
      if (index !== -1) stav.kosik.splice(index, 1);
    }

    function pouzitKod() {
      if (stav.kod.trim().toUpperCase() === KOD_SLEVY) {
        stav.slevaPouzita = true;
        stav.chyba = '';
      } else {
        stav.slevaPouzita = false;
        stav.chyba = `Kód „${stav.kod.trim()}" neznáme.`;
      }
    }

    return { stav, serazene, cenaPolozek, sleva, doprava, kZaplaceni, mena, pridat, ubrat, odebrat, pouzitKod };
  },
}).mount('#app');
```

# --review--

Testy hlídají chování košíku. Tohle si po sobě projdi sám, než lab uzavřeš.

## --rubric--

- Ve stavu je jen seznam položek a napsaný kód. Cena položek, sleva, doprava ani částka k zaplacení ve stavu nejsou.
- Pravidlo „pod jeden kus to nejde" je napsané na jednom místě, ne zvlášť v šabloně a zvlášť v obsluze.
- Šablona nepočítá nic složitějšího než jedno násobení; výpočty jsou v `setup`.
- Tlačítka mají `type="button"` a popis pro čtečku (`aria-label` u plusu a mínusu), takže se košík dá ovládat i bez myši.
- Ceny se skládají z čísel, ne z ručně slepovaných řetězců na pěti místech.
- Jména proměnných říkají, co drží (`cenaPolozek`, ne `x`), a `data-testid` zůstalo jen tam, kde ho potřebují testy.

## --extensions--

Rozšíření bez testů: uložení košíku do `localStorage`, aby přežil obnovení stránky; dárek zdarma nad 1500 Kč; výpočet DPH v souhrnu; procentní kód (`SPIZ10`) vedle korunového; animace mizející položky přes `<TransitionGroup>`; přepočet na eura podle kurzu z `fetch`.
