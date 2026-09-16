# Zadání: sekce `web-3d-efekty` — 3D a Spline

> Tohle je kompletní zadání. Přečti ho celé, pak si přečti dokumenty, na které odkazuje,
> a teprve potom začni psát. Nespěchej — nekvalitní obsah se zahazuje a píše znovu.

## Tvůj úkol

Sekce **`web-3d-efekty`** zatím **neexistuje** — napíšeš ji od nuly. Základ jejího popisu je
v `docs/osnova.md`. Oproti osnově má navíc obsahovat **Spline** (viz níž) — přidej ho jako
samostatnou lekci a workshop a uprav `section.json` i `docs/osnova.md`.

### O čem sekce je

**Three.js:**

- scéna, kamera, renderer, mesh, materiál, světla, render smyčka, reakce na změnu velikosti,
- interakce s myší, jednoduché částice,
- základy shaderů: uniformy, gradient, jednoduchý šum,
- výkon: počet objektů, velikost textur, kdy 3D na web nepatří.

**Spline** (nástroj, kde se 3D scéna naklikne v editoru a vloží na web):

- co Spline je a kdy se vyplatí víc než ruční Three.js,
- export scény a její vložení do stránky přes `@splinetool/runtime`,
- vložení do Reactu přes `@splinetool/react-spline`,
- ovládání scény z JavaScriptu: události ze scény, hledání objektů, reakce na scroll a myš,
- výkon: velikost scény, líné načítání, náhradní obrázek, chování na mobilu,
- `prefers-reduced-motion` a kdy Spline nepoužít (SEO, přístupnost, slabší zařízení).

### Technické podmínky

- Three.js zapneš přes `libs`: v `module.json` `"libs": ["three"]`, ve frontmatteru kroku
  `libs: three`, v živé ukázce ` :::live dom libs=three `. Import: `import * as THREE from 'three'`,
  doplňky přes `three/addons`.
- **Renderer vytvářej s `preserveDrawingBuffer: true`**, jinak se v testu nedá přečíst obsah plátna.
- **Kurz běží offline.** Scéna ze Splinu se proto načítá z **lokálního souboru** v seedu kroku
  nebo ve složce projektu, nikdy z cloudu Splinu. Vlastní scénu si student vyexportuje
  v projektu na konci sekce.
- Testy **nemůžou kontrolovat, co se vykreslilo ve 3D**. Testuj:
  - že vznikl `<canvas>` s nenulovou velikostí (po `helpers.waitFor`),
  - že se volaly správné funkce (u Splinu klidně přes vlastní mock runtime v seedu),
  - že existuje náhradní obsah a líné načítání,
  - že se render smyčka zastaví při odchodu ze stránky (úklid).
- Příklady zápisu jsou v `docs/kontrakt.md` kap. 6.10 a v kapitole „Příklady pro autory".

### Obsah

- Sekce je označená jako **rozšíření**, ale kvalitou se nesmí lišit od jádra.
- Piš ji tak, aby student na konci uměl na svůj web dát 3D pozadí nebo model, který nezabije
  výkon ani přístupnost.
- Nezapomeň na `cards.md`, `pojmy.md`, `tahak.md` a `outcomes` v `section.json`.


## Kdo jsi a co stavíš

Pracuješ na projektu **Akademie** v `/home/karel/akademie` — je to lokální interaktivní kurz
webového vývoje ve stylu freeCodeCamp. **Není to hra.** Běží na počítači jednoho studenta,
výklad je **česky**, identifikátory v kódu **anglicky**.

**Student:** junior. Weby dosud stavěl s pomocí AI a neumí vysvětlit, proč fungují. Chce se to
naučit doopravdy, co nejrychleji, a chce, aby ho to bavilo. Cíl: vlastní projekty s dobrým
designem a efekty a práce frontend/fullstack vývojáře.

**Jak to funguje:** student otevře modul v prohlížeči, píše kód v editoru a mačká
„Zkontrolovat". Testy v Markdown souboru rozhodnou, jestli krok splnil. Proto musí být
každý test spustitelný a spravedlivý.

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
