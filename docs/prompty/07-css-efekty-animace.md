# Zadání: sekce `css-efekty-animace` — Animace a efekty (GSAP, Motion, Lenis)

> Tohle je kompletní zadání. Přečti ho celé, pak si přečti dokumenty, na které odkazuje,
> a teprve potom začni psát. Nespěchej — nekvalitní obsah se zahazuje a píše znovu.

## Základní informace o projektu

**Co to je:** Akademie je lokální interaktivní kurz webového vývoje v češtině, postavený ve stylu
freeCodeCampu. Student otevře modul v prohlížeči, píše kód v editoru vedle zadání a mačká
„Zkontrolovat". Testy uvnitř obsahu rozhodnou, jestli krok splnil. **Není to hra** — žádné body,
odznaky, příběh ani povyšování.

**Kde to je:** `/home/karel/akademie` — git repozitář, větev `main`. Pracuj přímo v něm.

**Pro koho:** jeden student. Junior, weby dosud stavěl s pomocí AI a neumí vysvětlit, proč
fungují. Chce se to naučit doopravdy, co nejrychleji, a chce, aby ho to bavilo. Cíl: vlastní
projekty s dobrým designem a efekty a práce frontend/fullstack vývojáře. Píšeš obsah **jemu**,
ne obecnému publiku.

**Jak se to spouští:**

```sh
cd /home/karel/akademie
./start.sh                 # aplikace na http://localhost:4300
npm test                   # testy platformy
npm run overit -- --concurrency 2 content/<sekce>   # kontrola obsahu (tvoje hlavní metrika)
```

**Z čeho to je postavené** (platformu needituješ, ale hodí se vědět, jak funguje):

- Obsah jsou Markdown soubory v `content/`. Parser (`shared/parse.js`) je převede na data.
- Kód studenta i testy běží v izolovaném iframu v prohlížeči (runtime `dom`, `js`, `vue`,
  `react`) nebo v Node procesu (runtime `node`).
- Kontrola `npm run overit` spustí každý krok v headless prohlížeči: testy musí nad výchozím
  kódem **selhat** a nad tvým řešením **projít**. Tím se pozná, že test opravdu něco měří.
- Server je Node bez frameworku, klient Vite + vanilla JS + CodeMirror.

**Jakým stylem psát:**

- **Výklad česky, tykání, věcně.** Žádné „super", „skvělé", vykřičníky ani smajlíky.
- **Kód anglicky** (`const totalPrice`, `function formatDate`), **texty ve stránkách a výpisy
  česky**. Nikdy české názvy proměnných a funkcí.
- Vysvětluj **proč**, ne jen jak. Nejcennější část každé lekce jsou pasti: co se běžně pokazí,
  jak vypadá chybová hláška a jak se to opraví.
- Piš konkrétně a stručně, bez vaty a bez historie technologie na úvod. Příklady z reálného
  světa a s českými daty, žádné `foo`, `bar` a lorem ipsum.
- Používej zvýraznění střídmě: rámečky `> [!REMEMBER]` (pravidlo k zapamatování),
  `> [!PITFALL]` (past), `> [!TIP]`, `> [!NOTE]`. Tučně nejvýš jedno místo v odstavci.
- Nevysvětluj, co se student naučí až později. Když to musíš zmínit, napiš „k tomu se dostaneme
  v sekci X, teď stačí vědět, že…".
- O AI se v obsahu píše jen v sekcích `prace-s-ai` a `start-nastroje`, jinde ne.

**Co je hotové a smíš na to odkazovat** (a brát jako vzor): celý JavaScript (`js-*`), celé CSS
(`css-*`) a `node-zaklady`. Neuč znovu, co už učí — odkazuj se na ně.

**Pravidla práce:**

- Pracuj **jen ve své sekci** (`content/<sekce>/`). Do jiných sekcí a do platformy
  (`client/`, `server/`, `shared/`, `tools/`, `docs/`) nesahej.
- **Nikdy nemaž** `data/` (postup studenta) ani `moje-projekty/` (jeho projekty).
- Neinstaluj balíčky a neměň `package.json`. Vše potřebné je nainstalované.
- Když najdeš chybu platformy nebo rozpor v dokumentech, **napiš to do zprávy**, neobcházej to.
- Commit zprávy česky a **bez jakékoli zmínky o AI** a bez `Co-Authored-By`.

## Tvůj úkol

Sekce **`css-efekty-animace`** zatím **neexistuje** — napíšeš ji od nuly. Její popis
(cíle, moduly, počty kroků) je v `docs/osnova.md`; drž se ho.

### O čem sekce je

Tohle je sekce, kvůli které si student kurz přál: aby uměl udělat web, který vypadá draze.
Učí:

- **GSAP:** `gsap.to/from/fromTo`, timeline, easing, stagger, `ScrollTrigger` (spouštění podle
  scrollu, scrub, pin), `SplitText` (animace textu po písmenech), `Flip` (animace změny layoutu).
- **Motion:** `animate`, `scroll`, `inView` — lehčí alternativa pro jednoduché věci.
- **Lenis:** plynulé scrollování a jak ho spojit se ScrollTriggerem.
- **Nativní CSS:** scroll-driven animace (`animation-timeline`), View Transitions API.
- **Vzory, které chce každý:** parallax, odhalení textu při scrollu, magnetické tlačítko,
  mikrointerakce tlačítek a karet, plynulý přechod mezi stránkami.
- **Výkon a ohleduplnost:** animovat jen `transform` a `opacity`, `will-change` s mírou,
  60 fps, `prefers-reduced-motion`, kdy animaci úplně vynechat.

### Jak se knihovny používají v kurzu

Knihovny jsou v projektu **předpřipravené a běží offline** — žádné CDN, žádný `npm install`
v kroku. Zapínají se polem `libs`:

- v `module.json`: `"libs": ["gsap", "lenis"]`
- ve frontmatteru kroku: `libs: gsap, lenis`
- v živé ukázce lekce: ` :::live dom libs=gsap `

Import v kódu studenta:

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, scroll, inView } from 'motion';
import Lenis from 'lenis';
```

Přesná syntaxe, seznam dostupných pluginů GSAP a další podrobnosti jsou v `docs/kontrakt.md`
kap. 6.10 a v kapitole „Příklady pro autory" — **přečti si je a řiď se jimi.**

### Jak testovat animace

Tohle je nejtěžší část sekce, ber to vážně:

- **Netestuj pixely ani průběh.** Testuj **koncový stav** a **že se animace vůbec spustila**.
- Čekej přes `helpers.waitFor`, nikdy přes pevnou prodlevu:

```js
const box = document.querySelector('.card');
await helpers.waitFor(() => getComputedStyle(box).opacity === '1', 3000);
assert.equal(getComputedStyle(box).opacity, '1', 'karta má být po animaci plně viditelná');
```

- U GSAP se dá stav ověřit i přes `gsap.getProperty(prvek, 'x')`.
- **Rozměry stránky jsou při načtení modulu 0** — než měříš, počkej `helpers.waitFor(() => box.getBoundingClientRect().width > 0)`.
- `prefers-reduced-motion` **nejde emulovat**. Když krok učí ohleduplnost, testuj přítomnost
  pravidla `@media (prefers-reduced-motion: reduce)` ve stylech, případně větev v kódu.
- ScrollTrigger: scroll v testu vyvolej programově a počkej na `waitFor`, ne na čas.

### Na co si dát pozor obsahem

- Výsledek každého workshopu musí vypadat **opravdu dobře** — tohle je výkladní skříň kurzu.
  Reálná česká data, promyšlená typografie a barvy, žádné „lorem ipsum" a šedé obdélníky.
- U každého efektu napiš, **kdy ho nepoužít** (výkon, přístupnost, rušivost).
- Sekce navazuje na hotové `css-animace` (přechody a klíčové snímky) — neopakuj ji,
  odkazuj se na ni.


## Co si MUSÍŠ přečíst, než napíšeš první řádek

| soubor | co v něm je |
|---|---|
| `docs/kontrakt.md` | přesné formáty obsahu, API testů, runtime, kódy kontrol (kap. 10) |
| `docs/styl-obsahu.md` | jak psát obsah: povinná pravidla, počty, kontrolní seznam (kap. 16), poučení (kap. 17), motivace (kap. 18) |
| `docs/osnova.md` | osnova: u každé sekce cíl „Po sekci umíš", předpoklady, moduly a co přesně učí |

**Vzor kvality** (přečti si aspoň jeden modul z každého typu, než začneš psát):
`content/js-pole/` (lekce `co-je-pole`, workshop `workshop-nakupni-seznam`, lab, kvíz,
`cards.md`, `pojmy.md`, `tahak.md`), dále `content/css-flexbox/` a `content/node-zaklady/`.

## Struktura obsahu

```
content/<sekce>/
├── section.json      title, intro, seznam modulů v pořadí, outcomes („Po sekci umíš")
├── cards.md          15–30 kartiček na opakování (5–10 pohovorových)
├── pojmy.md          odborné pojmy, na které se v textu odkazuje přes [[pojem]]
├── tahak.md          tahák (bez vlastního nadpisu #)
└── <modul>/
    ├── module.json   { "type": "lesson|workshop|lab|quiz|project", "title", "summary", "minutes", "runtime" }
    ├── lesson.md          (u lekce)
    ├── steps/001.md…      (u workshopu)
    ├── lab.md             (u labu)
    ├── quiz.md            (u kvízu)
    └── project.md + starter/ + solution/   (u projektu)
```

## Formát kroku workshopu

````md
---
title: Název kroku
kind: debug            # nepovinné: step (výchozí) | recall | choose | debug | parsons
see: sekce/modul#kotva # nepovinné: odkaz do výkladu
runtime: react         # nepovinné: přebíjí runtime z module.json
---

# --description--

**Úkol:** co přesně má student udělat, v kterém souboru a proč.

Na jiných datech (nikdy ne řešení k opsání):

```js
const priceWithVat = price * 1.21;
```

# --hints--

Text požadavku, který student uvidí a odškrtne si ho.

```js
assert.equal(total, 1226.5, 'total má být 1226.5 (1115 + 111.5)');
```

Druhý požadavek.

```js
assert.ok(document.querySelector('nav'), 'stránka má obsahovat prvek nav');
```

# --help--

## --tip--

První stupeň: o jaký koncept jde + odkaz do lekce.

## --tip--

Druhý stupeň: kde přesně to v kódu je.

## --tip--

Třetí stupeň: stejný vzor na jiných datech. **Nikdy ne řešení.**

# --seed--

## --file-- app.jsx

```jsx
export default function App() {
--edit--

--edit--
}
```

# --solution--

## --file-- app.jsx

```jsx
…celý soubor po úpravě…
```
````

Pravidla, která platí vždy:

- **Nápověda = text a hned po něm jeden blok ` ```js `.** Ten blok je test.
- Test je **tělo async funkce**. Máš k dispozici `assert` (podmnožina `node:assert/strict`),
  `files` (obsah souborů studenta), `logs`, `errors`, `helpers` a u runtime s DOM i `document`.
  **Žádné `describe`, `it`, `import` v testu** — runner takový test nespustí.
- **Každá aserce má českou zprávu se vstupem**: `assert.equal(sum([1,2]), 3, 'sum([1, 2]) má vrátit 3')`.
- Značka `--edit--` v seedu vymezuje místo, kam student píše. V souboru buď 0×, nebo 2×.
- `# --solution--` obsahuje **celé** změněné soubory, ne jen úryvek.
- **Seed kroku N = řešení kroku N−1** (výjimka: krok `kind: debug`, kde seed obsahuje chybu).
- Řádek konzole nikdy neporovnávej přes `===` se syrovým textem — neviditelný rozdíl
  (rozložené `č`, pevná mezera) pak odmítne správné řešení. Použij:
  `const sameLine = (a) => a.normalize('NFC').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();`

## Co musí mít každá sekce

- **Lekce:** pretest `:::check pretest` na začátku, problém, mentální model v rámečku
  `> [!REMEMBER]`, výklad po částech `##` a po každé části `:::check`, živé ukázky `:::live`,
  aspoň jedna předpověď `:::live … predict` u pasti, pasti v `> [!PITFALL]` s přesnou hláškou
  a opravou, `## Kde to najdeš v MDN`, na konci `# --questions--` (2–4 otázky, aspoň polovina
  s psanou odpovědí).
- **Workshop:** 15–60 kroků, jeden krok = jedna nová věc. Na začátku 1–2 kroky `kind: recall`
  (zopakování bez návodu), asi 1 krok `kind: debug` na 10 kroků, `kind: parsons` u prvního
  složitějšího vzoru, `kind: choose` (vyber nástroj sám), `# --explain--` asi u každého pátého
  kroku. Pomoc se ke konci ubírá: první třetina přesný zápis, druhá cíl a kandidáti, třetí jen
  požadované chování. Tipy `# --help--` u kroků mimo první třetinu.
- **Lab:** zadání jako uživatelské příběhy (nečíslované), 8–20 požadavků, `# --approaches--`
  (2–4 alternativní řešení, ukážou se po splnění) a `# --review--`.
- **Kvíz:** 10–20 otázek, aspoň polovina psaných, jedna sada `# --code--` nad delším cizím
  kódem, u **každé** špatné odpovědi `#### --why--`, které pojmenuje mylnou představu.
- **Soubory sekce:** `cards.md`, `pojmy.md`, `tahak.md` a `outcomes` v `section.json`.

> **Pozor na pojmy:** když v textu použiješ `[[nějaký pojem]]`, musí být ten pojem v
> `pojmy.md` téže sekce, jinak kontrola hlásí chybu `[S5]`. A naopak: nepoužívej `[[…]]`
> pro běžná slova.

> **Pozor na odkazy:** `see:` a odkazy `[text](see:sekce/modul#kotva)` musí mířit na sekci,
> která **existuje na disku**, jinak je to chyba `[S4]`. Na sekce, které ještě nejsou napsané,
> neodkazuj vůbec.

## Kontrola kvality — povinná, bez výjimky

```sh
cd /home/karel/akademie
npm run overit -- --concurrency 2 content/<sekce>
```

Musí vyjít **0 chyb a 0 varování**. Kontrola pro každý krok spustí testy nad výchozím kódem
(aspoň jeden test musí selhat) i nad tvým řešením (všechny testy musí projít). Dokud to
neprojde, sekce hotová není. Výsledek kontroly vždy vypiš do závěrečné zprávy.

Doporučení navíc (nemusí být nula, ale přečti si je):

```sh
npm run overit -- --concurrency 2 --doporuceni content/<sekce>
```

## Jak pracovat

1. **Autor:** napiš nebo doplň moduly podle osnovy a pravidel výše.
2. **Recenzent (druhý průchod, ideálně jiný agent):** čti jako student. U každého kroku a labu
   zkus **2–3 jiná správná řešení a 2–3 typicky chybná** a ověř přes runner, že testy
   nepropustí špatné ani neodmítnou dobré. Oprav, co najdeš.
3. **Teprve pak commit:**
   `git add content/<sekce> && git commit -m "Sekce <sekce>: dopsaná a zrecenzovaná"`
   Commit zprávy **bez jakékoli zmínky o AI** a bez `Co-Authored-By`.

## Čeho se vyvarovat (skutečné chyby z předchozích pokusů)

- **Nikdy negeneruj kroky skriptem.** Vznikly z toho workshopy s popisem „Text", testem
  `a === 2` a řešením `let a = 2`. Takový obsah se celý zahazuje.
- Nenechávej v `content/` pomocné skripty (`generate_*.js`, `fix_*.js`).
- Nemaž cizí práci. Když něco vypadá jako omyl, napiš to.
- **Rozepsaná sekce umí shodit aplikaci:** `section.json` nesmí obsahovat modul, který ještě
  nemá `module.json`. Dokud sekci nedokončíš, drž soubor jako `section.json.wip` a přejmenuj
  ho zpátky až nakonec.
- České názvy funkcí a proměnných (`teplotaFahrenheit`). Kód anglicky, texty česky.
- Prázdný seed nebo řešení (`// kód...`).
- Nezasahuj do platformy (`client/`, `server/`, `shared/`, `tools/`, `docs/`). Když najdeš
  chybu platformy, napiš ji do zprávy.

## Co na konci nahlásit

1. Které moduly jsi napsal nebo opravil a co obsahují (počty kroků, otázek, kartiček).
2. Přesný výstup `npm run overit -- --concurrency 2 content/<sekce>`.
3. Co jsi musel rozhodnout jinak, než říká osnova, a proč.
4. Co zůstalo nedodělané a proč.
