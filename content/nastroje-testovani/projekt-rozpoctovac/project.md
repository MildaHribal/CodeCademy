---
title: Rozpočet ve Vite a TypeScriptu
timeoutMs: 90000
---

# --description--

## Zadání

Kamarádka si už třetí rok vede domácí rozpočet v tabulce a pokaždé v ní něco přepíše.
Chce něco jednoduššího: stránku, kam zapíše příjem nebo výdaj, vybere kategorii
a hned vidí, jak na tom tenhle měsíc je. Žádné přihlašování, žádný server — data
ať zůstanou v jejím prohlížeči.

Tohle je samostatný projekt na konci celé části o nástrojích. Postavíš ho ve VS Code
jako skutečnou aplikaci: Vite, TypeScript, testy ve Vitestu, kontrola typů a produkční
sestavení. Nejsou tu žádné kroky, jen zadání — a hotový návrh souborů, ve kterém
každý má jednu práci.

## Jak začít

1. Klikni na **Začít projekt** a otevři složku projektu ve VS Code.
2. V terminálu spusť `npm install` a pak `npm run dev`. Stránka poběží na
   <http://localhost:5173> a po každém uložení se sama překreslí.
3. Ve druhém terminálu nech běžet `npm run test:watch`. Sada je na začátku **červená**
   a to je správně: všechny funkce zatím jen vyhodí „zatím není napsaná".
4. Piš do `src/`. Kdykoli chceš, zkontroluj si všechno naráz:
   `npm test`, `npm run typecheck`, `npm run format` a `npm run build`.
5. Když máš hotovo, klikni na **Zkontrolovat**.

Vzhled, HTML i styly jsou hotové a měnit je nemusíš. Balíčky navíc neinstaluj —
projekt si vystačí s tím, co v něm je.

## Jak je kód rozdělený

| soubor | co v něm je |
|---|---|
| `src/rozpocet.ts` | čisté výpočty nad položkami — nezná DOM ani úložiště |
| `src/uloziste.ts` | čtení a zápis položek; úložiště dostane zvenku jako parametr |
| `src/zobrazeni.ts` | vykreslení do připravené stránky, žádné počítání |
| `src/main.ts` | propojení: formulář, přepínání měsíců, uložení |
| `src/*.test.ts` | tvoje testy, jeden soubor na modul |

Rozdělení není kosmetika: všechno kromě `main.ts` jde otestovat bez prohlížeče,
takže sada testů běží v desetinách sekundy.

## Položka rozpočtu

| klíč | typ | popis |
|---|---|---|
| `id` | řetězec | jedinečný identifikátor položky |
| `popis` | řetězec | co to bylo, třeba „Nájem za září" |
| `castka` | číslo | kladná částka v celých korunách |
| `typ` | `'prijem'` nebo `'vydaj'` | na kterou stranu se částka počítá |
| `kategorie` | řetězec | „Bydlení", „Potraviny", „Mzda"… |
| `datum` | řetězec | den ve tvaru `RRRR-MM-DD` |

## Uživatelské příběhy

- Když kamarádka otevře stránku, uvidí přehled posledního měsíce, ve kterém má
  nějakou položku: příjmy, výdaje a zůstatek. V prázdném rozpočtu jsou všechny tři
  částky nulové.
- Když vyplní formulář a odešle ho, položka se objeví v seznamu, přehled se přepočítá
  a vše se uloží. Po zavření a otevření prohlížeče je položka pořád tam.
- Když přepne měsíc v `#mesic`, celá stránka ukáže data zvoleného měsíce. V nabídce
  jsou jen měsíce, ve kterých nějaká položka je, od nejnovějšího.
- V měsíci bez položek vidí hlášku v `#prazdno` a prázdný seznam.
- Pod seznamem vidí výdaje sečtené po kategoriích, od největší částky. Když mají dvě
  kategorie stejně, řadí se podle české abecedy. Příjmy se do téhle části nepočítají.
- Částky čte v korunách s oddělenými tisíci: `12 000 Kč`. Záporný zůstatek pozná podle
  minusu.
- Když jí v prohlížeči zůstane poškozený obsah úložiště, aplikace se otevře
  s prázdným rozpočtem a nespadne.

## Technické požadavky

- `src/rozpocet.ts` vyváží typy `Typ`, `Polozka`, `Prehled`, `SouhrnKategorie` a funkce
  `formatujCastku`, `mesicPolozky`, `polozkyMesice`, `prehled`, `podleKategorii`
  a `dostupneMesice`. Žádná z nich nesahá na `document` ani na `localStorage`.
- `src/uloziste.ts` vyváží `KLIC`, typ `Uloziste` a funkce `nacti` a `uloz`. Úložiště
  je **parametr**, ne globální `localStorage` — proto jde v testu nahradit objektem
  v paměti.
- `src/zobrazeni.ts` vyváží `vykresliRozpocet(doc, polozky, mesic)`, která plní
  `#prijmy`, `#vydaje`, `#zustatek`, `#polozky`, `#souhrn` a `#prazdno` v dokumentu,
  který dostane. Prvky vyrábí přes `doc.createElement`, ne přes globální `document`.
- Každá položka v `#polozky` je `li` s atributem `data-id`, každá kategorie v `#souhrn`
  je `li` s atributem `data-kategorie`.
- Testy píšeš do `src/*.test.ts` a spouštíš Vitestem. Běží v prostředí `jsdom`, takže
  v testu zobrazení máš `document` k dispozici.
- `npm run typecheck`, `npm run format:check` a `npm run build` projdou bez chyby.

> [!PITFALL]
> `toLocaleString('cs-CZ')` odděluje tisíce **pevnou mezerou** (`\u00A0`), ne obyčejnou.
> Na obrazovce to nepoznáš, v testu ano. Očekávanou hodnotu proto v testu napiš
> s `\u00A0`, jinak budeš hodinu hledat rozdíl mezi dvěma stejně vypadajícími texty.

> [!TIP]
> Funkce piš v pořadí, v jakém je potřebuješ: nejdřív `formatujCastku` a `prehled`,
> pak zbytek `rozpocet.ts`, pak úložiště, nakonec zobrazení a `main.ts`. Po každé
> hotové funkci ať je sada zase zelená.

# --hints--

`formatujCastku` vypíše částku v korunách s pevnou mezerou mezi tisíci.

```js
const { formatujCastku } = await helpers.importFile('src/rozpocet.ts');
assert.equal(formatujCastku(1290), '1\u00A0290 Kč', 'formatujCastku(1290) má vrátit „1 290 Kč" s pevnou mezerou mezi tisíci');
assert.equal(formatujCastku(1234567), '1\u00A0234\u00A0567 Kč', 'formatujCastku(1234567) má oddělit obě trojice');
assert.equal(formatujCastku(950), '950 Kč', 'formatujCastku(950) nemá kam dát oddělovač');
assert.equal(formatujCastku(0), '0 Kč', 'formatujCastku(0) má vrátit „0 Kč"');
assert.equal(formatujCastku(-1290), '-1\u00A0290 Kč', 'Záporný zůstatek má mít minus');
```

`polozkyMesice` vybere položky jednoho měsíce, zachová pořadí a vstup nezmění.

```js
const { polozkyMesice } = await helpers.importFile('src/rozpocet.ts');
const vsechny = [
  { id: 'P-1', popis: 'Mzda za srpen', castka: 32000, typ: 'prijem', kategorie: 'Mzda', datum: '2026-09-11' },
  { id: 'P-2', popis: 'Tramvajenka', castka: 1000, typ: 'vydaj', kategorie: 'Doprava', datum: '2026-08-28' },
  { id: 'P-3', popis: 'Nákup v Lidlu', castka: 640, typ: 'vydaj', kategorie: 'Potraviny', datum: '2026-09-04' },
];
const kopie = structuredClone(vsechny);
assert.deepEqual(polozkyMesice(vsechny, '2026-09').map((p) => p.id), ['P-1', 'P-3'], 'Do září patří P-1 a P-3, v původním pořadí');
assert.deepEqual(polozkyMesice(vsechny, '2026-01'), [], 'Měsíc bez položek má vrátit prázdné pole');
assert.deepEqual(vsechny, kopie, 'polozkyMesice nesmí měnit pole, které dostane');
```

`prehled` sečte příjmy, výdaje a spočítá zůstatek.

```js
const { prehled } = await helpers.importFile('src/rozpocet.ts');
const zari = [
  { id: 'P-1', popis: 'Mzda za srpen', castka: 32000, typ: 'prijem', kategorie: 'Mzda', datum: '2026-09-11' },
  { id: 'P-2', popis: 'Nájem za září', castka: 12000, typ: 'vydaj', kategorie: 'Bydlení', datum: '2026-09-01' },
  { id: 'P-3', popis: 'Nákup v Lidlu', castka: 640, typ: 'vydaj', kategorie: 'Potraviny', datum: '2026-09-04' },
];
assert.deepEqual(prehled(zari), { prijmy: 32000, vydaje: 12640, zustatek: 19360 }, 'Z 32 000 Kč příjmů a 12 640 Kč výdajů zbývá 19 360 Kč');
assert.deepEqual(prehled([]), { prijmy: 0, vydaje: 0, zustatek: 0 }, 'Prázdný rozpočet má samé nuly');
const hubeny = [
  { id: 'P-4', popis: 'Brigáda', castka: 1000, typ: 'prijem', kategorie: 'Mzda', datum: '2026-09-02' },
  { id: 'P-5', popis: 'Zubař', castka: 2500, typ: 'vydaj', kategorie: 'Zdraví', datum: '2026-09-03' },
];
assert.equal(prehled(hubeny).zustatek, -1500, 'Zůstatek smí být záporný');
```

`podleKategorii` sečte jen výdaje a seřadí je od největší částky, při shodě česky.

```js
const { podleKategorii } = await helpers.importFile('src/rozpocet.ts');
const zari = [
  { id: 'P-1', popis: 'Mzda za srpen', castka: 32000, typ: 'prijem', kategorie: 'Mzda', datum: '2026-09-11' },
  { id: 'P-2', popis: 'Nájem za září', castka: 12000, typ: 'vydaj', kategorie: 'Bydlení', datum: '2026-09-01' },
  { id: 'P-3', popis: 'Nákup v Lidlu', castka: 640, typ: 'vydaj', kategorie: 'Potraviny', datum: '2026-09-04' },
  { id: 'P-4', popis: 'Nákup v Bille', castka: 360, typ: 'vydaj', kategorie: 'Potraviny', datum: '2026-09-18' },
];
assert.deepEqual(podleKategorii(zari), [
  { kategorie: 'Bydlení', celkem: 12000 },
  { kategorie: 'Potraviny', celkem: 1000 },
], 'Příjmy do souhrnu nepatří a Potraviny se mají sečíst na 1000 Kč');
const shoda = ['Doprava', 'Čaj a káva', 'Cukrovinky'].map((kategorie, index) => ({
  id: `S-${index}`, popis: 'Nákup', castka: 500, typ: 'vydaj', kategorie, datum: '2026-09-05',
}));
assert.deepEqual(podleKategorii(shoda).map((s) => s.kategorie), ['Cukrovinky', 'Čaj a káva', 'Doprava'], 'Při shodné částce se řadí podle české abecedy, takže Č patří za C a před D');
assert.deepEqual(podleKategorii([]), [], 'Prázdný rozpočet nemá žádnou kategorii');
```

`dostupneMesice` vrátí měsíce bez opakování od nejnovějšího.

```js
const { dostupneMesice } = await helpers.importFile('src/rozpocet.ts');
const vsechny = [
  { id: 'P-1', popis: 'Tramvajenka', castka: 1000, typ: 'vydaj', kategorie: 'Doprava', datum: '2026-08-28' },
  { id: 'P-2', popis: 'Mzda za srpen', castka: 32000, typ: 'prijem', kategorie: 'Mzda', datum: '2026-09-11' },
  { id: 'P-3', popis: 'Nákup v Lidlu', castka: 640, typ: 'vydaj', kategorie: 'Potraviny', datum: '2026-09-04' },
  { id: 'P-4', popis: 'Dárky', castka: 2400, typ: 'vydaj', kategorie: 'Zábava', datum: '2025-12-24' },
];
assert.deepEqual(dostupneMesice(vsechny), ['2026-09', '2026-08', '2025-12'], 'Měsíce mají jít od nejnovějšího a každý jen jednou');
assert.deepEqual(dostupneMesice([]), [], 'Prázdný rozpočet nemá žádný měsíc');
```

`nacti` přečte položky z úložiště, které dostane, a poškozený obsah ho nerozhodí.

```js
const { KLIC, nacti } = await helpers.importFile('src/uloziste.ts');
assert.equal(typeof KLIC, 'string', 'uloziste.ts má vyvézt klíč, pod kterým se položky ukládají');
const pameti = (data) => ({ getItem: (klic) => data[klic] ?? null, setItem: (klic, hodnota) => { data[klic] = hodnota; } });
const najem = { id: 'P-9', popis: 'Nájem za září', castka: 12000, typ: 'vydaj', kategorie: 'Bydlení', datum: '2026-09-01' };
assert.deepEqual(nacti(pameti({ [KLIC]: JSON.stringify([najem]) })), [najem], 'nacti má vrátit položky uložené pod KLIC');
assert.deepEqual(nacti(pameti({})), [], 'Prázdné úložiště znamená prázdný rozpočet');
assert.deepEqual(nacti(pameti({ [KLIC]: '{tohle není JSON' })), [], 'Poškozený obsah úložiště nesmí aplikaci shodit');
assert.deepEqual(nacti(pameti({ [KLIC]: '"jen text"' })), [], 'Když v úložišti není pole, vrací se prázdný rozpočet');
```

`uloz` zapíše položky tak, že je `nacti` přečte zpátky.

```js
const { KLIC, nacti, uloz } = await helpers.importFile('src/uloziste.ts');
const data = {};
const uloziste = { getItem: (klic) => data[klic] ?? null, setItem: (klic, hodnota) => { data[klic] = hodnota; } };
const najem = { id: 'P-9', popis: 'Nájem za září', castka: 12000, typ: 'vydaj', kategorie: 'Bydlení', datum: '2026-09-01' };
uloz(uloziste, [najem]);
assert.equal(typeof data[KLIC], 'string', 'uloz má do úložiště zapsat text pod klíčem KLIC');
assert.deepEqual(nacti(uloziste), [najem], 'Co uloz zapíše, to má nacti přečíst zpátky');
uloz(uloziste, []);
assert.deepEqual(nacti(uloziste), [], 'Uložení prázdného rozpočtu má přepsat dřívější obsah');
```

`vykresliRozpocet` vypíše do stránky přehled zvoleného měsíce.

```js
const { JSDOM } = await import('jsdom');
const { vykresliRozpocet } = await helpers.importFile('src/zobrazeni.ts');
const kostra = '<dl><dd id="prijmy"></dd><dd id="vydaje"></dd><dd id="zustatek"></dd></dl><p id="prazdno" hidden></p><ul id="polozky"></ul><ul id="souhrn"></ul>';
const doc = new JSDOM(`<!DOCTYPE html><body>${kostra}</body>`).window.document;
const polozky = [
  { id: 'P-1', popis: 'Mzda za srpen', castka: 32000, typ: 'prijem', kategorie: 'Mzda', datum: '2026-09-11' },
  { id: 'P-2', popis: 'Nájem za září', castka: 12000, typ: 'vydaj', kategorie: 'Bydlení', datum: '2026-09-01' },
  { id: 'P-3', popis: 'Nákup v Lidlu', castka: 640, typ: 'vydaj', kategorie: 'Potraviny', datum: '2026-09-04' },
  { id: 'P-4', popis: 'Tramvajenka', castka: 1000, typ: 'vydaj', kategorie: 'Doprava', datum: '2026-08-28' },
];
vykresliRozpocet(doc, polozky, '2026-09');
assert.equal(doc.querySelector('#prijmy').textContent, '32\u00A0000 Kč', '#prijmy má ukázat příjmy měsíce naformátované');
assert.equal(doc.querySelector('#vydaje').textContent, '12\u00A0640 Kč', '#vydaje má ukázat výdaje měsíce naformátované');
assert.equal(doc.querySelector('#zustatek').textContent, '19\u00A0360 Kč', '#zustatek má ukázat rozdíl příjmů a výdajů');
```

`vykresliRozpocet` vypíše položky měsíce a v prázdném měsíci hlášku.

```js
const { JSDOM } = await import('jsdom');
const { vykresliRozpocet } = await helpers.importFile('src/zobrazeni.ts');
const kostra = '<dl><dd id="prijmy"></dd><dd id="vydaje"></dd><dd id="zustatek"></dd></dl><p id="prazdno" hidden></p><ul id="polozky"></ul><ul id="souhrn"></ul>';
const doc = new JSDOM(`<!DOCTYPE html><body>${kostra}</body>`).window.document;
const polozky = [
  { id: 'P-1', popis: 'Mzda za srpen', castka: 32000, typ: 'prijem', kategorie: 'Mzda', datum: '2026-09-11' },
  { id: 'P-2', popis: 'Nájem za září', castka: 12000, typ: 'vydaj', kategorie: 'Bydlení', datum: '2026-09-01' },
  { id: 'P-4', popis: 'Tramvajenka', castka: 1000, typ: 'vydaj', kategorie: 'Doprava', datum: '2026-08-28' },
];
vykresliRozpocet(doc, polozky, '2026-09');
const radky = [...doc.querySelectorAll('#polozky > li')];
assert.deepEqual(radky.map((radek) => radek.getAttribute('data-id')), ['P-1', 'P-2'], 'V #polozky má být jeden li s data-id na každou položku měsíce, v původním pořadí');
assert.ok(radky[0].textContent.includes('Mzda za srpen'), 'Řádek položky má obsahovat její popis');
assert.ok(radky[0].textContent.includes('Mzda'), 'Řádek položky má obsahovat její kategorii');
assert.ok(radky[1].textContent.includes('12\u00A0000 Kč'), 'Řádek položky má obsahovat naformátovanou částku');
assert.equal(doc.querySelector('#prazdno').hidden, true, 'V měsíci s položkami je #prazdno schované');
vykresliRozpocet(doc, polozky, '2026-01');
assert.equal(doc.querySelectorAll('#polozky > li').length, 0, 'V měsíci bez položek nezůstane v #polozky nic starého');
assert.equal(doc.querySelector('#prazdno').hidden, false, 'V měsíci bez položek je #prazdno vidět');
```

`vykresliRozpocet` vypíše kategorie výdajů od největší částky.

```js
const { JSDOM } = await import('jsdom');
const { vykresliRozpocet } = await helpers.importFile('src/zobrazeni.ts');
const kostra = '<dl><dd id="prijmy"></dd><dd id="vydaje"></dd><dd id="zustatek"></dd></dl><p id="prazdno" hidden></p><ul id="polozky"></ul><ul id="souhrn"></ul>';
const doc = new JSDOM(`<!DOCTYPE html><body>${kostra}</body>`).window.document;
const polozky = [
  { id: 'P-1', popis: 'Mzda za srpen', castka: 32000, typ: 'prijem', kategorie: 'Mzda', datum: '2026-09-11' },
  { id: 'P-2', popis: 'Nájem za září', castka: 12000, typ: 'vydaj', kategorie: 'Bydlení', datum: '2026-09-01' },
  { id: 'P-3', popis: 'Nákup v Lidlu', castka: 640, typ: 'vydaj', kategorie: 'Potraviny', datum: '2026-09-04' },
];
vykresliRozpocet(doc, polozky, '2026-09');
const radky = [...doc.querySelectorAll('#souhrn > li')];
assert.deepEqual(radky.map((radek) => radek.getAttribute('data-kategorie')), ['Bydlení', 'Potraviny'], 'V #souhrn má být jeden li s data-kategorie na každou kategorii výdajů, od největší částky');
assert.ok(radky[0].textContent.includes('12\u00A0000 Kč'), 'U kategorie má být její součet naformátovaný');
assert.ok(!radky.some((radek) => radek.getAttribute('data-kategorie') === 'Mzda'), 'Příjmy do souhrnu kategorií nepatří');
```

`npm test` projde a spustí aspoň dvanáct tvých testů.

```js
const beh = await helpers.run('npm test', { timeoutMs: 75000 });
assert.equal(beh.code, 0, `Sada testů musí projít:\n${beh.stdout}${beh.stderr}`);
const vypis = `${beh.stdout}${beh.stderr}`;
const pocet = Number(/Tests\s+(\d+)\s+passed/.exec(vypis)?.[1] ?? 0);
assert.ok(pocet >= 12, `Vitest spustil ${pocet} testů, čekám aspoň dvanáct — každá vyvezená funkce si zaslouží vlastní testy včetně okrajových případů`);
```

`npm run typecheck` projde bez chyby.

```js
const beh = await helpers.run('npm run typecheck', { timeoutMs: 75000 });
assert.equal(beh.code, 0, `Kontrola typů musí projít, včetně souborů s testy:\n${beh.stdout}${beh.stderr}`);
```

`npm run format:check` projde bez chyby.

```js
const beh = await helpers.run('npm run format:check', { timeoutMs: 75000 });
assert.equal(beh.code, 0, `Formátování neodpovídá nastavení projektu. Srovnej ho příkazem npm run format:\n${beh.stdout}${beh.stderr}`);
```

`npm run build` vyrobí produkční sestavení do `dist/`.

```js
const fs = await import('node:fs/promises');
const beh = await helpers.run('npm run build', { timeoutMs: 75000 });
assert.equal(beh.code, 0, `Produkční sestavení musí projít:\n${beh.stdout}${beh.stderr}`);
const stranka = await fs.readFile(`${helpers.dir}/dist/index.html`, 'utf8').catch(() => null);
assert.ok(stranka, 'Po npm run build má vzniknout dist/index.html');
assert.match(stranka, /<script[^>]+src="[^"]+\.js"/, 'Sestavená stránka má odkazovat na přibalený JS — vstupní skript patří do index.html');
const soubory = await fs.readdir(`${helpers.dir}/dist/assets`).catch(() => []);
assert.ok(soubory.some((jmeno) => jmeno.endsWith('.css')), 'V dist/assets má být i sestavené CSS — styl se importuje z main.ts');
```

# --help--

## --tip--

Začni od nejmenšího dílku, ne od stránky. `formatujCastku` a `prehled` jsou čisté
funkce nad daty: napiš test, pusť `npm run test:watch` a piš, dokud nezezelená.
Teprve až je `rozpocet.ts` hotový, má smysl řešit úložiště a zobrazení — obojí
je nad ním postavené.

## --tip-- 6

Úložiště je klasická vložená závislost z lekce
[Čas, síť a závislosti](see:nastroje-testovani/mocky-cas-sit#vlozeni-zavislosti-predej-ji-zvenku).
Funkce nesahá na globální `localStorage`, ale na objekt, který dostane parametrem.
V aplikaci mu `main.ts` předá skutečné `localStorage`, v testu si vyrobíš objekt
se dvěma metodami nad obyčejným objektem v paměti.

## --tip-- 8

Vykreslovací funkce dostane dokument taky jako parametr, a proto nesmí použít
globální `document`. Prvky vyrábí přes ten dokument, který dostala. Díky tomu
ji test pustí nad stránkou z `jsdom` a nepotřebuje prohlížeč.

## --tip-- 14

Sestavení Vite začíná u `index.html` — to je vstupní bod, ne `main.ts`. Skript se
proto do stránky připojuje značkou `<script type="module" src="…">`. CSS se do
sestavení dostane přes import v `main.ts`; Vite z něj vyrobí samostatný soubor
v `dist/assets`.

# --review--

Testy kontrolují, že aplikace počítá a vykresluje správně. Tohle zkontroluj sám —
je to ta část, kvůli které si projekt někdo otevře na pohovoru.

## --rubric--

- Ve `src/rozpocet.ts` není `document` ani `localStorage`. Kdyby tam byly, nešel by
  modul otestovat bez prohlížeče.
- Každá funkce má v testech i okrajový případ: prázdný rozpočet, měsíc bez položek,
  shodné částky, poškozené úložiště.
- Aspoň jeden test jsi viděl selhat dřív, než jsi funkci napsal.
- Jména funkcí a proměnných říkají, co dělají, bez komentáře. Komentáře vysvětlují
  proč, ne co.
- Stejný výpočet není na dvou místech — `main.ts` počty nepřepočítává, jen předává data.
- `README.md` popisuje, jak projekt spustit, a jedno rozhodnutí, které jsi udělal
  (třeba proč je úložiště parametr).
- Stránka se dá ovládat klávesnicí: pole mají popisky, focus je vidět.
- Víš, co bys příště udělal jinak.

## --extensions--

**Rozšíření bez testů**

- Mazání a úprava položky, včetně testu, že po smazání sedí přehled i souhrn kategorií.
- Filtr podle kategorie a fulltext v popisu, který drží i při přepnutí měsíce.
- Srovnání s předchozím měsícem: o kolik korun a procent se změnily výdaje v každé kategorii.
- Export do CSV, který otevřeš v tabulkovém procesoru — pozor na oddělovač a diakritiku.

**Rozšíření do portfolia**

- Přidej ESLint s `typescript-eslint` a pravidlem `@typescript-eslint/no-floating-promises`,
  ať `npm run lint` hlídá i zapomenuté `await`.
- Napiš jeden end-to-end test v Playwrightu (`npm init playwright@latest`): otevři
  stránku, vyplň formulář přes `getByLabel`, odešli ho a ověř přehled přes
  `await expect(page.getByRole('status')).toHaveText(…)`. K němu kontrolu přístupnosti
  přes `@axe-core/playwright`.
- Nasaď hotový build (`dist/`) na veřejnou adresu a dej odkaz do `README.md`.
- Doplň do `README.md` snímek obrazovky a oddíl „Rozhodnutí": proč `localStorage`
  místo serveru, proč je úložiště parametr a proč je logika oddělená od vykreslování.
