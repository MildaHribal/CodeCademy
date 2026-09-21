---
title: Typický domácí úkol
runtime: dom
see: kariera-pohovor/domaci-ukol#precti-zadani-jako-smlouvu, kariera-pohovor/domaci-ukol#rozpocet-casu-ctyri-hodiny-a-ani-minutu-vic
timeoutMs: 15000
---

# --description--

Tohle je [[domácí úkol]] v té podobě, v jaké ho dostane devět z deseti
juniorů: **seznam s vyhledáváním nad API, stránkování, detail položky a stavy
načítání, chyby a prázdného výsledku**. Firmy ho zadávají proto, že se na něm pozná
všechno naráz — práce s asynchronním kódem, stavba DOM, okrajové případy i to, jestli
umíš říct, co jsi nestihl.

**Zadání od klienta:** půjčovna deskových her *Herna U Kostky* chce na web přehled
her, ve kterém si zákazník najde hru podle názvu a proklikne se na detail. Katalog
má 21 her a poroste, takže se **nefiltruje na klientovi** — hledání i stránkování
řeší API.

## Co máš k dispozici

V seedu je hotová kostra stránky (`index.html`), styl (`styles.css`) a falešné API
(`api.js`). Pracuješ **jen v `app.js`**.

`api.js` se chová jako skutečný server: odpovídá se zpožděním, vrací jen kus dat
a jde ho rozbít. **Tenhle soubor neměň** — je to protistrana, ne tvůj kód. Nabízí dvě
funkce:

```js
nactiHry({ hledani, stranka })
// → { polozky: [{ id, nazev, zanr, cenaZaDen }], stranka, stranekCelkem, celkem }

nactiDetail(id)
// → { id, nazev, zanr, cenaZaDen, pocetHracu, delkaHry, popis }
```

Všimni si, že seznam **nevrací popis ani počet hráčů**. Detail se musí dotáhnout zvlášť,
přesně jako u skutečného API.

Když nastavíš `window.__apiSelze = true`, každý další dotaz skončí chybou. Slouží to
k vyzkoušení chybového stavu (a testy to používají taky) — v konzoli náhledu si to
zapni a podívej se, co tvoje stránka udělá.

## Co má platit

**Seznam a hledání**

- Po otevření stránky se do `[data-testid="seznam"]` vykreslí první stránka her.
  Každá hra je prvek `data-testid="polozka"`, na stránku jich patří nejvýš šest.
- Každá položka ukazuje název v `[data-testid="polozka-nazev"]` a k tomu žánr a cenu
  za den (například `90`).
- Psaní do `[data-testid="hledani"]` posílá nový dotaz na API. Hledá se **na serveru**
  (`nactiHry({ hledani })`), ne filtrem nad už načtenou stránkou. Na velikosti písmen
  nezáleží.
- Když dotaz nic nenajde, objeví se `[data-testid="stav-prazdno"]` a v seznamu není
  žádná položka.

**Stránkování**

- `[data-testid="stranka"]` ukazuje aktuální a celkový počet stránek ve tvaru `2 / 4`.
- `[data-testid="predchozi"]` a `[data-testid="dalsi"]` listují. Na první stránce je
  `predchozi` vypnuté (`disabled`), na poslední `dalsi`. Obě tlačítka jsou ve stránce
  vždycky, i když je výsledek na jednu stránku.
- Nové hledání vrací stránkování **na první stránku**.

**Detail**

- Klik na `[data-testid="polozka"]` dotáhne detail přes `nactiDetail(id)` a vykreslí
  panel `[data-testid="detail"]` s `[data-testid="detail-nazev"]`,
  `[data-testid="detail-popis"]` a `[data-testid="detail-pocet-hracu"]`.
- Tlačítko `[data-testid="zavrit-detail"]` detail zavře tak, že prvek
  `[data-testid="detail"]` ze stránky zmizí.

**Stavy a odolnost**

- Dokud se čeká na odpověď, je ve stránce `[data-testid="stav-nacitani"]`. Jakmile
  data dorazí, zmizí.
- Když API selže, je místo seznamu `[data-testid="stav-chyba"]` s tlačítkem
  `[data-testid="zkusit-znovu"]`, které dotaz zopakuje.
- **Stavy se nemíchají.** Když svítí chyba, není vidět načítání ani stará data.
- **Rychlé psaní nesmí zamíchat výsledky.** `api.js` schválně odpovídá na krátké
  dotazy pomaleji než na dlouhé, takže odpověď na `k` může dorazit až po odpovědi
  na `karak`. Na obrazovce musí zůstat výsledek **posledního** dotazu.
- Položka se dá vybrat klávesnicí (je to `<button>`, `<a>`, nebo má `tabindex`)
  a texty z API se do stránky vkládají přes `textContent` / `createElement`,
  nikdy přes `innerHTML`.

Téma, texty, rozvržení i to, jak stavy vypadají, jsou tvoje volba — testy kontrolují
chování a `data-testid`, ne vzhled.

> [!TIP]
> Dej si na úkol **čtyři hodiny** a piš si, co ti z nich ukrajuje. Až narazíš na
> strop, doplň v `README.md` oddíl „Co chybí a jak bych to dodělal". Je součástí
> odevzdání a hodnotí se skoro stejně jako hotová funkce.

# --hints--

Po otevření stránky je vidět první stránka her a každá položka má název, žánr a cenu.

```js
await helpers.waitFor(() => document.querySelectorAll('[data-testid="polozka"]').length > 0, 5000);
const seznam = document.querySelector('[data-testid="seznam"]');
assert.ok(seznam, 'Hry vykresluj do prvku [data-testid="seznam"], který je v index.html připravený');
const polozky = [...seznam.querySelectorAll('[data-testid="polozka"]')];
assert.equal(polozky.length, 6, `Na jedné stránce má být šest her, vykreslilo se jich ${polozky.length}`);
const nazev = polozky[0].querySelector('[data-testid="polozka-nazev"]');
assert.ok(nazev, 'Každá položka má název v [data-testid="polozka-nazev"]');
assert.equal(nazev.textContent.trim(), 'Osadníci z Katanu', 'První hra na první stránce je Osadníci z Katanu — pořadí z API se nemění');
const text = helpers.normalize(polozky[0].textContent);
assert.match(text, /strategick/i, 'Položka ukazuje i žánr hry');
assert.match(text, /90/, 'Položka ukazuje cenu za den, u Osadníků z Katanu 90 Kč');
```

Dokud se čeká na odpověď, svítí stav načítání; po odpovědi zmizí.

```js
await helpers.waitFor(() => document.querySelectorAll('[data-testid="polozka"]').length > 0, 5000);
const hledani = document.querySelector('[data-testid="hledani"]');
assert.ok(hledani, 'V index.html je připravené pole [data-testid="hledani"], napoj na něj hledání');
await helpers.type(hledani, 'k');
await helpers.waitFor(() => document.querySelector('[data-testid="stav-nacitani"]'), 5000);
await helpers.waitFor(() => !document.querySelector('[data-testid="stav-nacitani"]'), 5000);
assert.ok(document.querySelectorAll('[data-testid="polozka"]').length > 0, 'Po dojetí dotazu má být místo načítání vidět seznam');
assert.equal(document.querySelector('[data-testid="stav-chyba"]'), null, 'Když dotaz projde, chybový stav se nezobrazuje');
```

Hledání běží na API, nezáleží na velikosti písmen a prázdný výsledek má vlastní stav.

```js
await helpers.waitFor(() => document.querySelectorAll('[data-testid="polozka"]').length > 0, 5000);
const hledani = document.querySelector('[data-testid="hledani"]');
await helpers.type(hledani, 'KAR');
await helpers.waitFor(() => {
  const nazvy = [...document.querySelectorAll('[data-testid="polozka-nazev"]')].map((prvek) => prvek.textContent.trim());
  return nazvy.length === 2 && nazvy.every((text) => /kar/i.test(text));
}, 5000);
await helpers.type(hledani, 'xylofon');
await helpers.waitFor(() => document.querySelector('[data-testid="stav-prazdno"]'), 5000);
assert.equal(document.querySelectorAll('[data-testid="polozka"]').length, 0, 'Když dotaz nic nenajde, v seznamu nesmí zůstat výsledky předchozího hledání');
```

Stránkování listuje, ukazuje `stránka / celkem` a krajní tlačítka jsou vypnutá.

```js
const popis = () => helpers.normalize(document.querySelector('[data-testid="stranka"]').textContent);
await helpers.waitFor(() => document.querySelectorAll('[data-testid="polozka"]').length > 0, 5000);
assert.match(popis(), /1\s*\/\s*4/, 'Katalog má 21 her po šesti, takže na začátku je 1 / 4');
assert.equal(document.querySelector('[data-testid="predchozi"]').disabled, true, 'Na první stránce je tlačítko Předchozí vypnuté (disabled)');
assert.equal(document.querySelector('[data-testid="dalsi"]').disabled, false, 'Na první stránce musí jít jít dál');
await helpers.click(document.querySelector('[data-testid="dalsi"]'));
await helpers.waitFor(() => /2\s*\/\s*4/.test(popis()), 5000);
assert.equal(document.querySelector('[data-testid="predchozi"]').disabled, false, 'Na druhé stránce už jde jít zpět');
await helpers.click(document.querySelector('[data-testid="dalsi"]'));
await helpers.waitFor(() => /3\s*\/\s*4/.test(popis()), 5000);
await helpers.click(document.querySelector('[data-testid="dalsi"]'));
await helpers.waitFor(() => /4\s*\/\s*4/.test(popis()) && document.querySelectorAll('[data-testid="polozka"]').length === 3, 5000);
assert.equal(document.querySelector('[data-testid="dalsi"]').disabled, true, 'Na poslední stránce je tlačítko Další vypnuté (disabled)');
await helpers.click(document.querySelector('[data-testid="predchozi"]'));
await helpers.waitFor(() => /3\s*\/\s*4/.test(popis()) && document.querySelectorAll('[data-testid="polozka"]').length === 6, 5000);
```

Nové hledání začíná znovu od první stránky.

```js
const popis = () => helpers.normalize(document.querySelector('[data-testid="stranka"]').textContent);
await helpers.waitFor(() => document.querySelectorAll('[data-testid="polozka"]').length > 0, 5000);
await helpers.click(document.querySelector('[data-testid="dalsi"]'));
await helpers.waitFor(() => /2\s*\/\s*4/.test(popis()), 5000);
await helpers.type(document.querySelector('[data-testid="hledani"]'), 'kar');
await helpers.waitFor(() => document.querySelectorAll('[data-testid="polozka"]').length === 2, 5000);
assert.match(popis(), /1\s*\/\s*1/, 'Po novém hledání se musí stránkování vrátit na první stránku — jinak by uživatel viděl prázdno');
assert.equal(document.querySelector('[data-testid="dalsi"]').disabled, true, 'Když se výsledek vejde na jednu stránku, jsou obě tlačítka vypnutá');
assert.equal(document.querySelector('[data-testid="predchozi"]').disabled, true, 'Když se výsledek vejde na jednu stránku, jsou obě tlačítka vypnutá');
```

Klik na položku otevře detail s daty, která seznam z API nedostal, a tlačítko ho zavře.

```js
await helpers.waitFor(() => document.querySelectorAll('[data-testid="polozka"]').length > 0, 5000);
assert.equal(document.querySelector('[data-testid="detail"]'), null, 'Dokud se na nic neklikne, žádný detail ve stránce není');
await helpers.click(document.querySelector('[data-testid="polozka"]'));
await helpers.waitFor(() => document.querySelector('[data-testid="detail-nazev"]'), 5000);
assert.ok(document.querySelector('[data-testid="detail"]'), 'Detail vykresluj do panelu [data-testid="detail"]');
assert.equal(document.querySelector('[data-testid="detail-nazev"]').textContent.trim(), 'Osadníci z Katanu', 'Detail patří té hře, na kterou se kliklo');
const popisHry = document.querySelector('[data-testid="detail-popis"]');
assert.ok(popisHry, 'Detail ukazuje popis hry v [data-testid="detail-popis"]');
assert.match(helpers.normalize(popisHry.textContent), /surovinu/, 'Popis vrací jen nactiDetail — seznam ho v datech vůbec nemá');
const hraci = document.querySelector('[data-testid="detail-pocet-hracu"]');
assert.ok(hraci, 'Detail ukazuje počet hráčů v [data-testid="detail-pocet-hracu"]');
assert.match(helpers.normalize(hraci.textContent), /3\s*[–-]\s*4/, 'U Osadníků z Katanu jsou 3–4 hráči');
await helpers.click(document.querySelector('[data-testid="zavrit-detail"]'));
await helpers.waitFor(() => !document.querySelector('[data-testid="detail"]'), 5000);
```

Když API selže, je vidět chyba s tlačítkem Zkusit znovu — a nic jiného.

```js
await helpers.waitFor(() => document.querySelectorAll('[data-testid="polozka"]').length > 0, 5000);
window.__apiSelze = true;
await helpers.type(document.querySelector('[data-testid="hledani"]'), 'karak');
await helpers.waitFor(() => document.querySelector('[data-testid="stav-chyba"]'), 6000);
assert.equal(document.querySelectorAll('[data-testid="polozka"]').length, 0, 'Když dotaz selže, nesmí ve stránce zůstat data z minulé odpovědi');
assert.equal(document.querySelector('[data-testid="stav-nacitani"]'), null, 'Chyba a načítání se nesmí zobrazovat naráz');
const znovu = document.querySelector('[data-testid="zkusit-znovu"]');
assert.ok(znovu, 'Chybový stav má obsahovat tlačítko [data-testid="zkusit-znovu"]');
window.__apiSelze = false;
await helpers.click(znovu);
await helpers.waitFor(() => document.querySelectorAll('[data-testid="polozka"]').length > 0, 6000);
assert.equal(document.querySelector('[data-testid="stav-chyba"]'), null, 'Po úspěšném zopakování dotazu chybový stav zmizí');
```

Po rychlém psaní zůstane na obrazovce výsledek posledního dotazu; položka jde vybrat klávesnicí.

```js
await helpers.waitFor(() => document.querySelectorAll('[data-testid="polozka"]').length > 0, 5000);
const polozka = document.querySelector('[data-testid="polozka"]');
const znacka = polozka.tagName.toLowerCase();
assert.ok(znacka === 'button' || znacka === 'a' || polozka.hasAttribute('tabindex'), `Na položku se musí dát dostat klávesnicí — teď je to <${znacka}> bez tabindex`);
const zdroj = helpers.stripComments(files['app.js'], 'js');
assert.doesNotMatch(zdroj, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/, 'Texty z API skládej přes createElement a textContent — innerHTML by z názvu hry udělal kus HTML');
await helpers.type(document.querySelector('[data-testid="hledani"]'), 'karak');
let klidnych = 0;
await helpers.waitFor(() => {
  const nalezene = [...document.querySelectorAll('[data-testid="polozka"]')];
  const sedi = nalezene.length === 1 && /karak/i.test(nalezene[0].textContent);
  klidnych = sedi ? klidnych + 1 : 0;
  return klidnych >= 25;
}, 10000);
```

# --help--

## --tip--

Rozmysli si stránku jako **čtyři stavy, ze kterých je vidět vždycky právě jeden**:
čekám, mám data, nemám nic, selhalo to. Většina zamotaného kódu v tomhle úkolu vzniká
tím, že se stavy schovávají a odkrývají každý zvlášť. Než začneš psát, přečti si, jak
se [čte zadání jako smlouva](see:kariera-pohovor/domaci-ukol#precti-zadani-jako-smlouvu)
— a rozepiš si tenhle seznam požadavků na čtyři hodiny.

## --tip-- 8

Odpověď z API se vrací do funkce, která už nemusí být aktuální. Potřebuješ tedy poznat,
jestli odpověď, která právě dorazila, patří k **poslednímu** dotazu. Bez nového API si
vystačíš s jednou proměnnou v modulu, kterou každé odeslání dotazu změní a každá
příchozí odpověď zkontroluje. Stejný trik se používá i u našeptávačů — jen se tam
místo toho obvykle rovnou ruší předchozí požadavek. Na stejný problém jde jít i z druhé
strany: neposílat dotaz na každý znak, ale až když uživatel na chvíli přestane psát.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Herna U Kostky — půjčovna deskovek</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="hlavicka">
      <p class="hlavicka__znacka">Herna U Kostky</p>
      <h1>Půjčovna deskových her</h1>
      <p class="hlavicka__popis">Vyber si hru na víkend. Ceny jsou za jeden den.</p>
      <label class="hledani">
        <span class="hledani__popisek">Hledat hru podle názvu</span>
        <input data-testid="hledani" id="hledani" type="search" placeholder="např. Karak" autocomplete="off">
      </label>
    </header>

    <main class="obsah">
      <div id="stav" class="stav" aria-live="polite"></div>
      <ul id="seznam" data-testid="seznam" class="seznam"></ul>
      <nav id="strankovani" class="strankovani" aria-label="Stránkování"></nav>
    </main>

    <aside id="detail-slot"></aside>

    <script type="module" src="app.js"></script>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  --barva-pozadi: #f6f4ef;
  --barva-karta: #ffffff;
  --barva-text: #23201c;
  --barva-tlumena: #6f675d;
  --barva-akce: #b4532a;
  --barva-akce-tmava: #8d3f1f;
  --barva-linka: #e2dcd1;
  --mezera: 1rem;
  --radius: 12px;
  --stin: 0 1px 2px rgba(35, 32, 28, 0.06), 0 8px 24px rgba(35, 32, 28, 0.06);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0 var(--mezera) 4rem;
  background: var(--barva-pozadi);
  color: var(--barva-text);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.5;
}

.hlavicka,
.obsah {
  max-width: 62rem;
  margin: 0 auto;
}

.hlavicka {
  padding: 2.5rem 0 1.5rem;
}

.hlavicka__znacka {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--barva-akce);
}

.hlavicka h1 {
  margin: 0.25rem 0 0.5rem;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
}

.hlavicka__popis {
  margin: 0 0 1.5rem;
  color: var(--barva-tlumena);
}

.hledani {
  display: block;
  max-width: 28rem;
}

.hledani__popisek {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--barva-tlumena);
}

.hledani input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--barva-linka);
  border-radius: var(--radius);
  background: var(--barva-karta);
  font: inherit;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.hledani input:focus-visible {
  outline: none;
  border-color: var(--barva-akce);
  box-shadow: 0 0 0 3px rgba(180, 83, 42, 0.18);
}

.stav {
  min-height: 1.5rem;
}

.stav__radek {
  margin: 0 0 var(--mezera);
  color: var(--barva-tlumena);
}

.stav__chyba {
  margin: 0 0 var(--mezera);
  padding: var(--mezera);
  border: 1px solid #e6c4b6;
  border-radius: var(--radius);
  background: #fdf1ec;
}

.stav__chyba p {
  margin: 0 0 0.75rem;
}

.seznam {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: var(--mezera);
  margin: 0;
  padding: 0;
  list-style: none;
}

.karta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  width: 100%;
  height: 100%;
  padding: 1rem;
  border: 1px solid var(--barva-linka);
  border-radius: var(--radius);
  background: var(--barva-karta);
  box-shadow: var(--stin);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.karta:hover {
  transform: translateY(-2px);
  border-color: var(--barva-akce);
}

.karta:focus-visible {
  outline: 3px solid var(--barva-akce);
  outline-offset: 2px;
}

.karta__nazev {
  font-size: 1.05rem;
  font-weight: 650;
}

.karta__zanr {
  font-size: 0.85rem;
  color: var(--barva-tlumena);
}

.karta__cena {
  margin-top: auto;
  font-variant-numeric: tabular-nums;
  color: var(--barva-akce);
}

.strankovani {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--mezera);
  margin-top: 2rem;
}

.strankovani__popis {
  font-variant-numeric: tabular-nums;
  color: var(--barva-tlumena);
}

button {
  padding: 0.55rem 1.1rem;
  border: 1px solid var(--barva-akce);
  border-radius: 999px;
  background: var(--barva-akce);
  color: #fff;
  font: inherit;
  cursor: pointer;
  transition: background-color 160ms ease;
}

button:hover:not(:disabled) {
  background: var(--barva-akce-tmava);
}

button:focus-visible {
  outline: 3px solid var(--barva-akce);
  outline-offset: 2px;
}

button:disabled {
  border-color: var(--barva-linka);
  background: var(--barva-linka);
  color: var(--barva-tlumena);
  cursor: not-allowed;
}

.karta {
  border-radius: var(--radius);
  color: inherit;
}

.detail {
  position: fixed;
  inset: auto 0 0;
  max-height: 80vh;
  overflow: auto;
  margin: 0 auto;
  padding: 1.5rem;
  border-top: 3px solid var(--barva-akce);
  border-radius: var(--radius) var(--radius) 0 0;
  background: var(--barva-karta);
  box-shadow: var(--stin);
}

@media (min-width: 48rem) {
  .detail {
    inset: 50% auto auto 50%;
    max-width: 32rem;
    transform: translate(-50%, -50%);
    border-radius: var(--radius);
  }
}

.detail h2 {
  margin: 0 0 0.5rem;
}

.detail dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1rem;
  margin: 0 0 1rem;
}

.detail dt {
  color: var(--barva-tlumena);
}

.detail dd {
  margin: 0;
}
```

## --file-- api.js

```js
// Falešné API půjčovny. TENHLE SOUBOR NEMĚŇ — je to protistrana, ne tvůj kód.
//
// Chová se jako skutečný server:
//   * odpovídá se zpožděním,
//   * seznam vrací jen část dat (popis a počet hráčů má jen detail),
//   * na krátké dotazy odpovídá pomaleji než na dlouhé, takže se odpovědi můžou
//     předbíhat,
//   * když je window.__apiSelze === true, každý dotaz skončí chybou.

const NA_STRANKU = 6;

const HRY = [
  { id: 'katan', nazev: 'Osadníci z Katanu', zanr: 'strategická', cenaZaDen: 90, pocetHracu: '3–4', delkaHry: 75, popis: 'Stavíš cesty a vesnice na ostrově, kde nikdy nemáš zrovna tu surovinu, kterou potřebuješ.' },
  { id: 'carcassonne', nazev: 'Carcassonne', zanr: 'rodinná', cenaZaDen: 70, pocetHracu: '2–5', delkaHry: 45, popis: 'Skládáte krajinu z destiček a obsazujete ji svými lidmi. Pravidla na pět minut, partie na tři roky.' },
  { id: 'dixit', nazev: 'Dixit', zanr: 'párty', cenaZaDen: 60, pocetHracu: '3–6', delkaHry: 30, popis: 'Vymyslíš k obrázku větu tak, aby ji uhodli někteří, ale ne všichni. Hra o tom, jak si nerozumíme.' },
  { id: 'krycijmena', nazev: 'Krycí jména', zanr: 'párty', cenaZaDen: 50, pocetHracu: '4–8', delkaHry: 20, popis: 'Dvě party luští slova podle jednoslovných nápověd. Nejlepší hra do kanceláře, jakou kdy někdo vymyslel.' },
  { id: 'pandemie', nazev: 'Pandemie', zanr: 'kooperativní', cenaZaDen: 90, pocetHracu: '2–4', delkaHry: 45, popis: 'Hrajete společně proti hře a hasíte ohniska nákazy po celém světě. Prohrát se dá velmi rychle.' },
  { id: 'scythe', nazev: 'Scythe', zanr: 'strategická', cenaZaDen: 140, pocetHracu: '1–5', delkaHry: 115, popis: 'Alternativní dvacátá léta s mechy na polích. Každé kolo dvě akce a pořád málo času.' },
  { id: 'mars', nazev: 'Terraformace Marsu', zanr: 'strategická', cenaZaDen: 130, pocetHracu: '1–5', delkaHry: 120, popis: 'Korporace zvedají teplotu, kyslík a hladinu oceánů. Kdo lépe zkombinuje karty, ten vyhraje.' },
  { id: 'duchostrova', nazev: 'Duch ostrova', zanr: 'kooperativní', cenaZaDen: 130, pocetHracu: '1–4', delkaHry: 120, popis: 'Tentokrát hraješ za ostrov a vyháníš kolonisty. Těžká kooperativní hra pro lidi, kterým Pandemie přijde snadná.' },
  { id: 'ubongo', nazev: 'Ubongo', zanr: 'rodinná', cenaZaDen: 60, pocetHracu: '1–4', delkaHry: 25, popis: 'Skládáš dílky do obrazce, než doteče přesýpací hodiny. Rychlé, hlučné a děti v tom porážejí dospělé.' },
  { id: 'azul', nazev: 'Azul', zanr: 'abstraktní', cenaZaDen: 80, pocetHracu: '2–4', delkaHry: 35, popis: 'Vykládáš kachličkami stěnu paláce. Vypadá to mírumilovně, dokud ti někdo nevezme tu jednu, na kterou jsi čekal.' },
  { id: 'burgundsko', nazev: 'Hrady Burgundska', zanr: 'strategická', cenaZaDen: 110, pocetHracu: '2–4', delkaHry: 90, popis: 'Klasika o dvou kostkách a stovce možností, co s nimi udělat. Nejlepší hra na učení plánování dopředu.' },
  { id: 'sushigo', nazev: 'Sushi Go', zanr: 'párty', cenaZaDen: 45, pocetHracu: '2–5', delkaHry: 15, popis: 'Karty putují kolem stolu a ty si z nich skládáš menu. Vejde se do kapsy i do čekárny.' },
  { id: 'tsuro', nazev: 'Tsuro', zanr: 'abstraktní', cenaZaDen: 55, pocetHracu: '2–8', delkaHry: 20, popis: 'Pokládáš destičky s cestičkami a snažíš se zůstat na desce déle než ostatní. Pravidla na jednu stranu.' },
  { id: 'karak', nazev: 'Karak', zanr: 'rodinná', cenaZaDen: 65, pocetHracu: '2–5', delkaHry: 30, popis: 'Odkrýváš chodby podzemí, bojuješ s příšerami kostkami a sbíráš poklady. Česká hra, která se povedla.' },
  { id: 'kartografove', nazev: 'Kartografové', zanr: 'rodinná', cenaZaDen: 75, pocetHracu: '1–6', delkaHry: 45, popis: 'Všichni kreslí do vlastní mapy stejné tvary a bodují se podle měnících se pravidel.' },
  { id: 'kingdomino', nazev: 'Kingdomino', zanr: 'rodinná', cenaZaDen: 70, pocetHracu: '2–4', delkaHry: 20, popis: 'Domino s krajinou: čím dřív si vybereš dílek, tím později hraješ. Naučíš se to za dvě minuty.' },
  { id: 'bang', nazev: 'Bang!', zanr: 'párty', cenaZaDen: 55, pocetHracu: '4–7', delkaHry: 30, popis: 'Skryté role na divokém západě. Šerif hledá bandity, bandité hledají šerifa a odpadlík doufá.' },
  { id: 'citadela', nazev: 'Citadela', zanr: 'strategická', cenaZaDen: 75, pocetHracu: '2–8', delkaHry: 60, popis: 'Každé kolo si tajně vybíráš postavu a stavíš město. Vrah, zloděj a čaroděj dělají zbytek.' },
  { id: 'zaklinac', nazev: 'Zaklínač: Starý svět', zanr: 'strategická', cenaZaDen: 150, pocetHracu: '1–5', delkaHry: 120, popis: 'Putuješ po mapě, bereš zakázky na příšery a trénuješ znamení. Velká krabice na celý večer.' },
  { id: 'dobble', nazev: 'Dobble', zanr: 'párty', cenaZaDen: 40, pocetHracu: '2–8', delkaHry: 10, popis: 'Na každých dvou kartách je právě jeden společný symbol. Kdo ho najde první, bere kartu.' },
  { id: 'jizdenky', nazev: 'Jízdenky, prosím!', zanr: 'rodinná', cenaZaDen: 85, pocetHracu: '2–5', delkaHry: 60, popis: 'Stavíš vlakové trasy přes celý kontinent a tiše doufáš, že ti nikdo nevezme tu jednu spojku.' },
];

function bezDiakritiky(text) {
  return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function zpozdeni(dotaz) {
  return Math.max(90, 280 - dotaz.length * 35);
}

function selhani() {
  return new Error('Služba půjčovny neodpovídá (500)');
}

/** Stránka katalogu. Vrací jen to, co potřebuje seznam. */
export function nactiHry({ hledani = '', stranka = 1 } = {}) {
  const dotaz = String(hledani).trim();
  return new Promise((splnit, odmitnout) => {
    setTimeout(() => {
      if (window.__apiSelze) {
        odmitnout(selhani());
        return;
      }
      const hledane = bezDiakritiky(dotaz);
      const nalezene = HRY.filter((hra) => bezDiakritiky(hra.nazev).includes(hledane));
      const stranekCelkem = Math.max(1, Math.ceil(nalezene.length / NA_STRANKU));
      const cislo = Math.min(Math.max(1, Math.trunc(stranka) || 1), stranekCelkem);
      const od = (cislo - 1) * NA_STRANKU;
      splnit({
        polozky: nalezene.slice(od, od + NA_STRANKU).map((hra) => ({
          id: hra.id,
          nazev: hra.nazev,
          zanr: hra.zanr,
          cenaZaDen: hra.cenaZaDen,
        })),
        stranka: cislo,
        stranekCelkem,
        celkem: nalezene.length,
      });
    }, zpozdeni(dotaz));
  });
}

/** Detail jedné hry — tady teprve dostaneš popis, počet hráčů a délku partie. */
export function nactiDetail(id) {
  return new Promise((splnit, odmitnout) => {
    setTimeout(() => {
      if (window.__apiSelze) {
        odmitnout(selhani());
        return;
      }
      const hra = HRY.find((polozka) => polozka.id === id);
      if (!hra) {
        odmitnout(new Error(`Hra ${id} v katalogu není (404)`));
        return;
      }
      splnit({ ...hra });
    }, 160);
  });
}
```

## --file-- app.js

```js
import { nactiHry, nactiDetail } from './api.js';

const poleHledani = document.querySelector('[data-testid="hledani"]');
const seznamEl = document.querySelector('[data-testid="seznam"]');
const stavEl = document.querySelector('#stav');
const strankovaniEl = document.querySelector('#strankovani');
const detailSlot = document.querySelector('#detail-slot');

/**
 * Načte stránku katalogu podle aktuálního hledání a čísla stránky
 * a výsledek vykreslí do stránky.
 */
async function nacti() {
}

/**
 * Vykreslí hry do seznamu. Každá hra je prvek s data-testid="polozka".
 * @param {Array<{ id: string, nazev: string, zanr: string, cenaZaDen: number }>} polozky
 */
function vykresliSeznam(polozky) {
}

/**
 * Vykreslí stav stránkování: popisek "stránka / celkem" a obě tlačítka.
 */
function vykresliStrankovani() {
}

/**
 * Dotáhne detail hry přes nactiDetail(id) a vykreslí panel data-testid="detail".
 * @param {string} id
 */
async function otevriDetail(id) {
}

/**
 * Zavře detail — panel data-testid="detail" ze stránky zmizí.
 */
function zavriDetail() {
}

nacti();
```

## --file-- README.md

````md
# Půjčovna deskovek — domácí úkol

## Spuštění

(Sem napiš, jak se to spouští. V editoru Akademie nic instalovat nemusíš,
v odevzdávaném repozitáři by tu byly příkazy.)

## Co je hotové

## Rozhodnutí

-

## Co chybí a jak bych to dodělal

-
````

# --solution--

## --file-- app.js

```js
import { nactiHry, nactiDetail } from './api.js';

const poleHledani = document.querySelector('[data-testid="hledani"]');
const seznamEl = document.querySelector('[data-testid="seznam"]');
const stavEl = document.querySelector('#stav');
const strankovaniEl = document.querySelector('#strankovani');
const detailSlot = document.querySelector('#detail-slot');

// Jeden objekt drží všechno, co je na obrazovce vidět. Vykreslování z něj
// jen čte, takže se stavy nemůžou rozejít.
const stav = {
  hledani: '',
  stranka: 1,
  stranekCelkem: 1,
  polozky: [],
  nacitaSe: true,
  chyba: null,
};

let posledniDotaz = 0;
let posledniDetail = 0;
let casovac = null;

// 1. Ukaž, v jakém stavu stránka je
function vykresliStav() {
  stavEl.replaceChildren();

  if (stav.nacitaSe) {
    const radek = document.createElement('p');
    radek.className = 'stav__radek';
    radek.dataset.testid = 'stav-nacitani';
    radek.textContent = 'Načítám hry…';
    stavEl.append(radek);
    return;
  }

  if (stav.chyba) {
    const ramecek = document.createElement('div');
    ramecek.className = 'stav__chyba';
    ramecek.dataset.testid = 'stav-chyba';

    const text = document.createElement('p');
    text.textContent = `Hry se nepodařilo načíst: ${stav.chyba}`;

    const znovu = document.createElement('button');
    znovu.type = 'button';
    znovu.dataset.testid = 'zkusit-znovu';
    znovu.textContent = 'Zkusit znovu';
    znovu.addEventListener('click', () => nacti());

    ramecek.append(text, znovu);
    stavEl.append(ramecek);
    return;
  }

  if (stav.polozky.length === 0) {
    const radek = document.createElement('p');
    radek.className = 'stav__radek';
    radek.dataset.testid = 'stav-prazdno';
    radek.textContent = stav.hledani
      ? `Pro „${stav.hledani}“ nemáme nic. Zkus jiné slovo.`
      : 'Katalog je prázdný.';
    stavEl.append(radek);
  }
}

// 2. Vypiš hry, které jsou v tomhle stavu k vidění
function vykresliSeznam() {
  seznamEl.replaceChildren();
  if (stav.chyba) return;

  for (const hra of stav.polozky) {
    const radek = document.createElement('li');

    const karta = document.createElement('button');
    karta.type = 'button';
    karta.className = 'karta';
    karta.dataset.testid = 'polozka';
    karta.dataset.id = hra.id;

    const nazev = document.createElement('span');
    nazev.className = 'karta__nazev';
    nazev.dataset.testid = 'polozka-nazev';
    nazev.textContent = hra.nazev;

    const zanr = document.createElement('span');
    zanr.className = 'karta__zanr';
    zanr.textContent = hra.zanr;

    const cena = document.createElement('span');
    cena.className = 'karta__cena';
    cena.textContent = `${hra.cenaZaDen} Kč / den`;

    karta.append(nazev, zanr, cena);
    radek.append(karta);
    seznamEl.append(radek);
  }
}

// 3. Přepni listování podle toho, kde uživatel je
function vykresliStrankovani() {
  strankovaniEl.replaceChildren();

  const predchozi = document.createElement('button');
  predchozi.type = 'button';
  predchozi.dataset.testid = 'predchozi';
  predchozi.textContent = 'Předchozí';
  predchozi.disabled = stav.stranka <= 1;
  predchozi.addEventListener('click', () => {
    stav.stranka -= 1;
    nacti();
  });

  const popis = document.createElement('span');
  popis.className = 'strankovani__popis';
  popis.dataset.testid = 'stranka';
  popis.textContent = `${stav.stranka} / ${stav.stranekCelkem}`;

  const dalsi = document.createElement('button');
  dalsi.type = 'button';
  dalsi.dataset.testid = 'dalsi';
  dalsi.textContent = 'Další';
  dalsi.disabled = stav.stranka >= stav.stranekCelkem;
  dalsi.addEventListener('click', () => {
    stav.stranka += 1;
    nacti();
  });

  strankovaniEl.append(predchozi, popis, dalsi);
}

function vykresli() {
  vykresliStav();
  vykresliSeznam();
  vykresliStrankovani();
}

// 4. Dotáhni data a zahoď odpovědi, které už nikoho nezajímají
async function nacti() {
  const mojeCislo = ++posledniDotaz;
  stav.nacitaSe = true;
  stav.chyba = null;
  vykresli();

  try {
    const odpoved = await nactiHry({ hledani: stav.hledani, stranka: stav.stranka });
    if (mojeCislo !== posledniDotaz) return;
    stav.polozky = odpoved.polozky;
    stav.stranka = odpoved.stranka;
    stav.stranekCelkem = odpoved.stranekCelkem;
  } catch (chyba) {
    if (mojeCislo !== posledniDotaz) return;
    stav.chyba = chyba.message;
    stav.polozky = [];
  } finally {
    if (mojeCislo === posledniDotaz) {
      stav.nacitaSe = false;
      vykresli();
    }
  }
}

// 5. Detail se dotahuje zvlášť, protože seznam ho v datech nemá
function panelDetailu() {
  const panel = document.createElement('section');
  panel.className = 'detail';
  panel.dataset.testid = 'detail';
  panel.setAttribute('aria-label', 'Detail hry');

  const zavrit = document.createElement('button');
  zavrit.type = 'button';
  zavrit.dataset.testid = 'zavrit-detail';
  zavrit.textContent = 'Zavřít';
  zavrit.addEventListener('click', zavriDetail);

  const misto = document.createElement('div');
  const nacitani = document.createElement('p');
  nacitani.dataset.testid = 'detail-nacitani';
  nacitani.textContent = 'Načítám detail…';
  misto.append(nacitani);

  panel.append(zavrit, misto);
  return { panel, misto };
}

function radekDetailu(nazev, hodnota, testid) {
  const nazevEl = document.createElement('dt');
  nazevEl.textContent = nazev;
  const hodnotaEl = document.createElement('dd');
  hodnotaEl.textContent = hodnota;
  if (testid) hodnotaEl.dataset.testid = testid;
  return [nazevEl, hodnotaEl];
}

async function otevriDetail(id) {
  const mojeCislo = ++posledniDetail;
  const { panel, misto } = panelDetailu();
  detailSlot.replaceChildren(panel);

  try {
    const hra = await nactiDetail(id);
    if (mojeCislo !== posledniDetail) return;

    const nadpis = document.createElement('h2');
    nadpis.dataset.testid = 'detail-nazev';
    nadpis.textContent = hra.nazev;

    const seznamUdaju = document.createElement('dl');
    seznamUdaju.append(
      ...radekDetailu('Počet hráčů', hra.pocetHracu, 'detail-pocet-hracu'),
      ...radekDetailu('Délka partie', `${hra.delkaHry} minut`, 'detail-delka'),
      ...radekDetailu('Cena', `${hra.cenaZaDen} Kč / den`, 'detail-cena'),
      ...radekDetailu('Žánr', hra.zanr, 'detail-zanr'),
    );

    const popis = document.createElement('p');
    popis.dataset.testid = 'detail-popis';
    popis.textContent = hra.popis;

    misto.replaceChildren(nadpis, seznamUdaju, popis);
  } catch (chyba) {
    if (mojeCislo !== posledniDetail) return;
    const text = document.createElement('p');
    text.dataset.testid = 'detail-chyba';
    text.textContent = `Detail se nepodařilo načíst: ${chyba.message}`;
    misto.replaceChildren(text);
  }
}

function zavriDetail() {
  posledniDetail += 1;
  detailSlot.replaceChildren();
}

seznamEl.addEventListener('click', (udalost) => {
  const karta = udalost.target.closest('[data-testid="polozka"]');
  if (karta) otevriDetail(karta.dataset.id);
});

// 6. Neposílej dotaz na každý znak
poleHledani.addEventListener('input', () => {
  clearTimeout(casovac);
  casovac = setTimeout(() => {
    stav.hledani = poleHledani.value;
    stav.stranka = 1;
    nacti();
  }, 250);
});

nacti();
```

# --approaches--

## --approach-- Prvky vyrobím jednou, pak už jen přepínám

Načítání, chyba, prázdný stav i obě tlačítka vzniknou hned na začátku a pak se jen
připojují a odpojují. Posluchače se registrují jednou, takže se nemůže stát, že jich
po desátém překreslení bude deset. Za to se platí tím, že si prvky musíš pamatovat
v proměnných. Vyplatí se to tam, kde je překreslování časté nebo drahé.

### --file-- app.js

```js
import { nactiHry, nactiDetail } from './api.js';

const poleHledani = document.querySelector('[data-testid="hledani"]');
const seznamEl = document.querySelector('[data-testid="seznam"]');
const stavEl = document.querySelector('#stav');
const strankovaniEl = document.querySelector('#strankovani');
const detailSlot = document.querySelector('#detail-slot');

// 1. Postav prvky, které se během života stránky nemění
const nacitaniEl = document.createElement('p');
nacitaniEl.className = 'stav__radek';
nacitaniEl.dataset.testid = 'stav-nacitani';
nacitaniEl.textContent = 'Načítám hry…';

const prazdnoEl = document.createElement('p');
prazdnoEl.className = 'stav__radek';
prazdnoEl.dataset.testid = 'stav-prazdno';

const chybaEl = document.createElement('div');
chybaEl.className = 'stav__chyba';
chybaEl.dataset.testid = 'stav-chyba';
const chybaTextEl = document.createElement('p');
const znovuEl = document.createElement('button');
znovuEl.type = 'button';
znovuEl.dataset.testid = 'zkusit-znovu';
znovuEl.textContent = 'Zkusit znovu';
chybaEl.append(chybaTextEl, znovuEl);

const predchoziEl = document.createElement('button');
predchoziEl.type = 'button';
predchoziEl.dataset.testid = 'predchozi';
predchoziEl.textContent = 'Předchozí';

const strankaEl = document.createElement('span');
strankaEl.className = 'strankovani__popis';
strankaEl.dataset.testid = 'stranka';

const dalsiEl = document.createElement('button');
dalsiEl.type = 'button';
dalsiEl.dataset.testid = 'dalsi';
dalsiEl.textContent = 'Další';

strankovaniEl.append(predchoziEl, strankaEl, dalsiEl);

let dotaz = '';
let stranka = 1;
let stranekCelkem = 1;
let cisloDotazu = 0;
let cisloDetailu = 0;

function ukazStav(prvek) {
  if (prvek) stavEl.replaceChildren(prvek);
  else stavEl.replaceChildren();
}

function prepniStrankovani() {
  strankaEl.textContent = `${stranka} / ${stranekCelkem}`;
  predchoziEl.disabled = stranka <= 1;
  dalsiEl.disabled = stranka >= stranekCelkem;
}

// 2. Řádky seznamu se skládají znovu, ty se mění vždycky
function vykresliRadky(polozky) {
  const radky = polozky.map((hra) => {
    const radek = document.createElement('li');

    const karta = document.createElement('button');
    karta.type = 'button';
    karta.className = 'karta';
    karta.dataset.testid = 'polozka';
    karta.dataset.id = hra.id;

    const nazev = document.createElement('span');
    nazev.className = 'karta__nazev';
    nazev.dataset.testid = 'polozka-nazev';
    nazev.textContent = hra.nazev;

    const zanr = document.createElement('span');
    zanr.className = 'karta__zanr';
    zanr.textContent = hra.zanr;

    const cena = document.createElement('span');
    cena.className = 'karta__cena';
    cena.textContent = `${hra.cenaZaDen} Kč / den`;

    karta.append(nazev, zanr, cena);
    radek.append(karta);
    return radek;
  });
  seznamEl.replaceChildren(...radky);
}

// 3. Odpověď zapiš jen tehdy, když patří k poslednímu dotazu
async function nacti() {
  const moje = ++cisloDotazu;
  ukazStav(nacitaniEl);
  prepniStrankovani();

  try {
    const odpoved = await nactiHry({ hledani: dotaz, stranka });
    if (moje !== cisloDotazu) return;

    stranka = odpoved.stranka;
    stranekCelkem = odpoved.stranekCelkem;
    vykresliRadky(odpoved.polozky);

    if (odpoved.polozky.length === 0) {
      prazdnoEl.textContent = `Pro „${dotaz}“ nemáme nic. Zkus jiné slovo.`;
      ukazStav(prazdnoEl);
    } else {
      ukazStav(null);
    }
  } catch (chyba) {
    if (moje !== cisloDotazu) return;
    seznamEl.replaceChildren();
    chybaTextEl.textContent = `Hry se nepodařilo načíst: ${chyba.message}`;
    ukazStav(chybaEl);
  } finally {
    if (moje === cisloDotazu) prepniStrankovani();
  }
}

// 4. Detail dotáhni zvlášť, seznam ho v datech nemá
async function otevriDetail(id) {
  const moje = ++cisloDetailu;

  const panel = document.createElement('section');
  panel.className = 'detail';
  panel.dataset.testid = 'detail';
  panel.setAttribute('aria-label', 'Detail hry');

  const zavrit = document.createElement('button');
  zavrit.type = 'button';
  zavrit.dataset.testid = 'zavrit-detail';
  zavrit.textContent = 'Zavřít';
  zavrit.addEventListener('click', zavriDetail);

  const obsah = document.createElement('div');
  const cekani = document.createElement('p');
  cekani.dataset.testid = 'detail-nacitani';
  cekani.textContent = 'Načítám detail…';
  obsah.append(cekani);

  panel.append(zavrit, obsah);
  detailSlot.replaceChildren(panel);

  try {
    const hra = await nactiDetail(id);
    if (moje !== cisloDetailu) return;

    const nadpis = document.createElement('h2');
    nadpis.dataset.testid = 'detail-nazev';
    nadpis.textContent = hra.nazev;

    const udaje = document.createElement('dl');
    for (const [popisek, hodnota, testid] of [
      ['Počet hráčů', hra.pocetHracu, 'detail-pocet-hracu'],
      ['Délka partie', `${hra.delkaHry} minut`, 'detail-delka'],
      ['Cena', `${hra.cenaZaDen} Kč / den`, 'detail-cena'],
      ['Žánr', hra.zanr, 'detail-zanr'],
    ]) {
      const dt = document.createElement('dt');
      dt.textContent = popisek;
      const dd = document.createElement('dd');
      dd.dataset.testid = testid;
      dd.textContent = hodnota;
      udaje.append(dt, dd);
    }

    const popis = document.createElement('p');
    popis.dataset.testid = 'detail-popis';
    popis.textContent = hra.popis;

    obsah.replaceChildren(nadpis, udaje, popis);
  } catch (chyba) {
    if (moje !== cisloDetailu) return;
    const text = document.createElement('p');
    text.dataset.testid = 'detail-chyba';
    text.textContent = `Detail se nepodařilo načíst: ${chyba.message}`;
    obsah.replaceChildren(text);
  }
}

function zavriDetail() {
  cisloDetailu += 1;
  detailSlot.replaceChildren();
}

// 5. Posluchače se registrují jednou, protože prvky přežijí překreslení
znovuEl.addEventListener('click', () => nacti());

predchoziEl.addEventListener('click', () => {
  if (stranka > 1) {
    stranka -= 1;
    nacti();
  }
});

dalsiEl.addEventListener('click', () => {
  if (stranka < stranekCelkem) {
    stranka += 1;
    nacti();
  }
});

seznamEl.addEventListener('click', (udalost) => {
  const karta = udalost.target.closest('[data-testid="polozka"]');
  if (karta) otevriDetail(karta.dataset.id);
});

poleHledani.addEventListener('input', () => {
  dotaz = poleHledani.value;
  stranka = 1;
  nacti();
});

nacti();
```

## --approach-- Pravdu drží pole a číslo stránky, ne kopie stavu

Žádný stavový objekt: co se hledá, je v hledacím poli, a odpověď se přijme jen tehdy,
když se její klíč (dotaz a stránka) pořád shoduje s tím, co je na obrazovce. Kódu je
nejmíň a nejde rozsynchronizovat pole s proměnnou. Na větší aplikaci ale tenhle přístup
přestane stačit, protože se stav nedá nikam uložit ani předat.

### --file-- app.js

```js
import { nactiHry, nactiDetail } from './api.js';

const poleHledani = document.querySelector('[data-testid="hledani"]');
const seznamEl = document.querySelector('[data-testid="seznam"]');
const stavEl = document.querySelector('#stav');
const strankovaniEl = document.querySelector('#strankovani');
const detailSlot = document.querySelector('#detail-slot');

let stranka = 1;
let stranekCelkem = 1;
let otevrenyDetail = null;
let casovac = null;

/** Zkratka na stavbu prvku — jeden řádek místo čtyř. */
function prvek(znacka, vlastnosti = {}, deti = []) {
  const el = document.createElement(znacka);
  for (const [klic, hodnota] of Object.entries(vlastnosti)) {
    if (klic === 'testid') el.dataset.testid = hodnota;
    else if (klic === 'text') el.textContent = hodnota;
    else if (klic === 'trida') el.className = hodnota;
    else if (klic === 'onClick') el.addEventListener('click', hodnota);
    else el.setAttribute(klic, hodnota);
  }
  el.append(...deti);
  return el;
}

// 1. Klíč dotazu = co se hledá a kde jsme. Dokud se nezmění, odpověď platí.
function klic() {
  return `${poleHledani.value.trim()}|${stranka}`;
}

function ukazStav(...deti) {
  stavEl.replaceChildren(...deti);
}

function vykresliStrankovani() {
  strankovaniEl.replaceChildren(
    prvek('button', {
      type: 'button',
      testid: 'predchozi',
      text: 'Předchozí',
      onClick: () => {
        stranka -= 1;
        nacti();
      },
    }),
    prvek('span', { trida: 'strankovani__popis', testid: 'stranka', text: `${stranka} / ${stranekCelkem}` }),
    prvek('button', {
      type: 'button',
      testid: 'dalsi',
      text: 'Další',
      onClick: () => {
        stranka += 1;
        nacti();
      },
    }),
  );
  strankovaniEl.querySelector('[data-testid="predchozi"]').disabled = stranka <= 1;
  strankovaniEl.querySelector('[data-testid="dalsi"]').disabled = stranka >= stranekCelkem;
}

// 2. Vypiš hry
function vykresliSeznam(polozky) {
  seznamEl.replaceChildren(
    ...polozky.map((hra) =>
      prvek('li', {}, [
        prvek('button', { type: 'button', trida: 'karta', testid: 'polozka', onClick: () => otevriDetail(hra.id) }, [
          prvek('span', { trida: 'karta__nazev', testid: 'polozka-nazev', text: hra.nazev }),
          prvek('span', { trida: 'karta__zanr', text: hra.zanr }),
          prvek('span', { trida: 'karta__cena', text: `${hra.cenaZaDen} Kč / den` }),
        ]),
      ]),
    ),
  );
}

// 3. Dotáhni data a porovnej klíč
async function nacti() {
  const mujKlic = klic();
  const dotaz = poleHledani.value.trim();
  ukazStav(prvek('p', { trida: 'stav__radek', testid: 'stav-nacitani', text: 'Načítám hry…' }));
  vykresliStrankovani();

  try {
    const odpoved = await nactiHry({ hledani: dotaz, stranka });
    if (mujKlic !== klic()) return;

    stranka = odpoved.stranka;
    stranekCelkem = odpoved.stranekCelkem;
    vykresliSeznam(odpoved.polozky);
    vykresliStrankovani();

    if (odpoved.polozky.length === 0) {
      ukazStav(prvek('p', { trida: 'stav__radek', testid: 'stav-prazdno', text: `Pro „${dotaz}“ nemáme nic. Zkus jiné slovo.` }));
    } else {
      ukazStav();
    }
  } catch (chyba) {
    if (mujKlic !== klic()) return;
    seznamEl.replaceChildren();
    vykresliStrankovani();
    ukazStav(
      prvek('div', { trida: 'stav__chyba', testid: 'stav-chyba' }, [
        prvek('p', { text: `Hry se nepodařilo načíst: ${chyba.message}` }),
        prvek('button', { type: 'button', testid: 'zkusit-znovu', text: 'Zkusit znovu', onClick: () => nacti() }),
      ]),
    );
  }
}

// 4. Detail: otevřený detail si pamatuje, které id čeká na odpověď
async function otevriDetail(id) {
  otevrenyDetail = id;
  const obsah = prvek('div', {}, [prvek('p', { testid: 'detail-nacitani', text: 'Načítám detail…' })]);
  detailSlot.replaceChildren(
    prvek('section', { trida: 'detail', testid: 'detail', 'aria-label': 'Detail hry' }, [
      prvek('button', { type: 'button', testid: 'zavrit-detail', text: 'Zavřít', onClick: zavriDetail }),
      obsah,
    ]),
  );

  try {
    const hra = await nactiDetail(id);
    if (otevrenyDetail !== id) return;
    obsah.replaceChildren(
      prvek('h2', { testid: 'detail-nazev', text: hra.nazev }),
      prvek('dl', {}, [
        prvek('dt', { text: 'Počet hráčů' }),
        prvek('dd', { testid: 'detail-pocet-hracu', text: hra.pocetHracu }),
        prvek('dt', { text: 'Délka partie' }),
        prvek('dd', { testid: 'detail-delka', text: `${hra.delkaHry} minut` }),
        prvek('dt', { text: 'Cena' }),
        prvek('dd', { testid: 'detail-cena', text: `${hra.cenaZaDen} Kč / den` }),
        prvek('dt', { text: 'Žánr' }),
        prvek('dd', { testid: 'detail-zanr', text: hra.zanr }),
      ]),
      prvek('p', { testid: 'detail-popis', text: hra.popis }),
    );
  } catch (chyba) {
    if (otevrenyDetail !== id) return;
    obsah.replaceChildren(prvek('p', { testid: 'detail-chyba', text: `Detail se nepodařilo načíst: ${chyba.message}` }));
  }
}

function zavriDetail() {
  otevrenyDetail = null;
  detailSlot.replaceChildren();
}

poleHledani.addEventListener('input', () => {
  clearTimeout(casovac);
  stranka = 1;
  casovac = setTimeout(nacti, 200);
});

nacti();
```

# --review--

Testy ověřily chování. To, co rozhoduje o tom, jestli tě pozvou na další kolo, ale
testy nezkontrolují. Projdi si tenhle seznam dřív, než bys úkol odeslal.

## --rubric--

- **README má čtyři bloky:** jak to spustit, co je hotové, jaká jsi udělal rozhodnutí
  a co chybí. Poslední blok nevynechávej — je to jediné místo, kde ukážeš, že víš víc,
  než jsi stihl napsat.
- **U každého rozhodnutí je důvod**, ne jen popis. „Hledám na serveru, protože katalog
  poroste" je rozhodnutí; „použil jsem fetch" není.
- **Historie commitů se dá přečíst.** Několik commitů s rozumnými zprávami
  (`seznam her z API`, `stránkování`, `chybový stav`), ne jeden commit „hotovo".
  Reviewer si podle nich přehraje, jak jsi postupoval.
- **Okrajové případy jsou vyřešené vědomě:** prázdný výsledek, poslední stránka
  s menším počtem položek, hledání během načítání, dvojklik na položku, selhání API
  hned při prvním načtení.
- **Rozpočet času sedí.** Kdyby ses do čtyř hodin nevešel, je v README napsané, co jsi
  odložil a proč — ne že se to prostě nestihlo.
- **Jména funkcí a proměnných říkají, co dělají.** `vykresliSeznam` ano, `render2` ne.
- **Stejný kód se neopakuje na třech místech.** Kartu hry stavíš jednou.
- **Nic v konzoli.** Žádné zapomenuté `console.log`, žádná nezachycená chyba, když
  vypneš API.
- **Vzhled je dodělaný natolik, že se za něj nemusíš omlouvat** — stavy mají text,
  tlačítka mají `:hover` i `:focus-visible`, na mobilu se nic nerozjede.
- **Uměl bys svoje řešení obhájit nahlas.** Proč právě takhle? Co bys udělal jinak,
  kdyby bylo her milion?

## --extensions--

Rozšíření bez testů — každé z nich je věta, kterou pak můžeš říct na pohovoru:

- **Stav do adresy.** Ulož hledání a stránku do `location.search`, aby šel výsledek
  poslat odkazem a přežil obnovení stránky.
- **Skutečné zrušení požadavku.** Až budeš tohle dělat proti opravdovému API, nahraď
  hlídání posledního dotazu `AbortControllerem` — server pak zbytečnou práci vůbec
  neudělá.
- **Klávesnice.** Detail ať jde zavřít klávesou Esc a po zavření ať se ohnisko vrátí
  na položku, ze které se otevřel.
- **Počet výsledků pro čtečku.** Prvek s `role="status"`, který po každém hledání
  oznámí „nalezeno 2 hry".
- **Vlastní téma.** Vyměň půjčovnu deskovek za katalog, který tě baví — kapely, recepty,
  horská kola. Data v `api.js` si přepiš, testy stejně kontrolují jen chování.
