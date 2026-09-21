---
title: Přestavba podle návrhu
runtime: dom
libs: tailwind
see: css-tailwind/utility-first#utilita-jedna-deklarace-nad-tokenem, css-tailwind/theme-a-tokeny#semanticke-tokeny-a-tmavy-motiv, css-tailwind/responzivita-a-stavy#mobil-prvni-trida-bez-predpony
---

# --description--

Redakce webu o cestování má stránku s profilem autora, kterou před lety někdo napsal
v ručním CSS. Stylopis se od té doby nafoukl, nikdo si netroufá v něm cokoli mazat
a tmavý motiv se do něj přidat nepodařilo.

Dostal jsi HTML **bez stylů** a k němu zadání od návrháře. Postav ho znovu
v Tailwindu — s vlastními tokeny značky, responzivně a s tmavým motivem, který stojí
na přepnutí tokenů, ne na desítkách tříd `dark:`.

## Návrh

**Barvy značky** (do `@theme`, jako tokeny):

| token | světlý motiv | tmavý motiv |
|---|---|---|
| `--color-plocha` | `#ffffff` | `#1b2430` |
| `--color-podklad` | `#f2f0eb` | `#121821` |
| `--color-text` | `#1b2430` | `#f2f0eb` |
| `--color-znacka` | `#1f6f8b` | (stejná) |

**Typografie:** nadpis článku písmem značky `--font-nadpis: Georgia, serif`.

**Rozvržení:**

- `main` je vycentrovaný, nejvýš `48rem` široký, s odsazením;
- nad `64rem` stojí karta autora **vedle** textu (dva sloupce, text širší), pod tím pod ním;
- karta autora má podklad `bg-podklad`, odsazení a zaoblení `rounded-xl`.

**Chování:**

- odkazy v textu jsou v barvě značky a při najetí se podtrhnou;
- při ovládání klávesnicí je vidět obrys — a jen tehdy, ne po kliknutí myší;
- tmavý motiv se zapíná třídou `tmavy` na `<html>`; přepínač na stránce už funguje.

> [!TIP]
> Začni tokeny, ne třídami. Když nejdřív poskládáš `@theme`, zbytek se píše sám —
> a hlavně nebudeš muset zpětně obcházet komponenty, až přijde na řadu tmavý motiv.

# --hints--

V `@theme` jsou všechny čtyři barevné tokeny i písmo nadpisu.

```js
const css = files['style.css'];
const theme = /@theme\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
assert.ok(theme, 'V style.css chybí blok @theme');
for (const [token, hodnota] of [['--color-plocha', '#ffffff'], ['--color-podklad', '#f2f0eb'], ['--color-text', '#1b2430'], ['--color-znacka', '#1f6f8b']]) {
  assert.match(theme, new RegExp(token + '\\s*:\\s*' + hodnota, 'i'), `V @theme chybí ${token}: ${hodnota}`);
}
assert.match(theme, /--font-nadpis\s*:/i, 'V @theme chybí token --font-nadpis');
```

Hlavní obal je vycentrovaný, omezený na `48rem` a používá sémantické tokeny.

```js
const main = document.querySelector('main');
assert.ok(main, 'Na stránce chybí <main>');
const styl = getComputedStyle(main);
assert.equal(styl.marginLeft, styl.marginRight, 'Obal má být vycentrovaný (mx-auto)');
assert.ok(parseFloat(styl.maxWidth) > 0 && parseFloat(styl.maxWidth) <= 16 * 48 + 1, `max-width je ${styl.maxWidth} — má být nejvýš 48rem`);
assert.ok(parseFloat(styl.paddingLeft) > 0, 'Obal má mít odsazení, ať text nelepí na okraj');
assert.equal(styl.backgroundColor, 'rgb(255, 255, 255)', `Pozadí obalu je ${styl.backgroundColor} — má stát na tokenu --color-plocha`);
```

Nadpis používá písmo značky.

```js
const h1 = document.querySelector('h1');
assert.ok(h1, 'Na stránce chybí <h1>');
assert.ok(h1.className.includes('font-nadpis'), 'Nadpis má mít třídu font-nadpis z tokenu');
assert.match(getComputedStyle(h1).fontFamily, /Georgia/i, `Nadpis má písmo ${getComputedStyle(h1).fontFamily} — token --font-nadpis se nepropsal`);
```

Karta autora má podklad, odsazení a zaoblení podle návrhu.

```js
const aside = document.querySelector('aside');
assert.ok(aside, 'Na stránce chybí <aside> s kartou autora');
const styl = getComputedStyle(aside);
assert.equal(styl.backgroundColor, 'rgb(242, 240, 235)', `Karta má pozadí ${styl.backgroundColor} — má stát na tokenu --color-podklad`);
assert.ok(parseFloat(styl.paddingTop) >= 12, `Karta má odsazení ${styl.paddingTop} — dej jí aspoň p-4`);
assert.ok(parseFloat(styl.borderTopLeftRadius) >= 10, `Zaoblení je ${styl.borderTopLeftRadius} — návrh chce rounded-xl`);
```

Rozvržení je mobile-first: jeden sloupec, dva až od `64rem`.

```js
const main = document.querySelector('main');
const trida = main.className;
assert.match(trida, /(^|\s)(grid|flex)(\s|$)/, 'Hlavní obal má rozvrhnout obsah gridem nebo flexem');
assert.match(trida, /lg:(grid-cols|flex-row)/, 'Dva sloupce mají naskočit až od lg (64rem) — napiš to variantou lg:');
assert.ok(!/^(?!.*lg:)(.*\b(grid-cols-2|flex-row)\b)/.test(trida) || /grid-cols-1|flex-col/.test(trida), 'Základ (bez varianty) má být jeden sloupec — Tailwind se píše od nejmenší obrazovky');
```

Odkazy v textu jsou v barvě značky a mají stav při najetí.

```js
const odkaz = document.querySelector('main p a, article p a');
assert.ok(odkaz, 'V textu chybí odkaz');
assert.equal(getComputedStyle(odkaz).color, 'rgb(31, 111, 139)', `Odkaz má barvu ${getComputedStyle(odkaz).color} — má stát na tokenu --color-znacka`);
const zdroj = files['index.html'] + files['style.css'];
assert.match(zdroj, /hover:underline|hover:decoration/, 'Odkaz má mít stav při najetí (hover:underline) — buď ve značce, nebo v @layer base');
```

Obrys je vidět při ovládání klávesnicí, ne po kliknutí myší.

```js
const zdroj = files['index.html'] + files['style.css'];
assert.match(zdroj, /focus-visible:/, 'Nikde není varianta focus-visible: — bez viditelného fokusu se stránka nedá ovládat klávesnicí');
assert.ok(!/(^|\s)focus:outline-none(\s|")/.test(zdroj) || /focus-visible:outline/.test(zdroj), 'Obrys se ruší bez náhrady — když už focus:outline-none, musí přijít vlastní focus-visible:outline');
```

Tmavý motiv přepíná tokeny, ne jednotlivé třídy.

```js
const css = files['style.css'];
const pravidlo = /\.tmavy\s*\{([^}]*)\}/.exec(css);
assert.ok(pravidlo, 'V style.css chybí pravidlo .tmavy');
for (const [token, hodnota] of [['--color-plocha', '#1b2430'], ['--color-podklad', '#121821'], ['--color-text', '#f2f0eb']]) {
  assert.match(pravidlo[1], new RegExp(token + '\\s*:\\s*' + hodnota, 'i'), `Pravidlo .tmavy má přepsat ${token} na ${hodnota}`);
}
const darkTrid = (files['index.html'].match(/\bdark:/g) ?? []).length;
assert.equal(darkTrid, 0, `V HTML je ${darkTrid} tříd s variantou dark: — tenhle motiv stojí na přepsání tokenů, takže je nepotřebuješ`);
```

Tmavý motiv se opravdu projeví.

```js
const main = document.querySelector('main');
document.documentElement.classList.add('tmavy');
await helpers.waitFor(() => getComputedStyle(main).backgroundColor === 'rgb(27, 36, 48)', 2000).catch(() => {});
assert.equal(getComputedStyle(main).backgroundColor, 'rgb(27, 36, 48)', `Po zapnutí motivu má obal pozadí --color-plocha z tmavé varianty, je ${getComputedStyle(main).backgroundColor}`);
assert.equal(getComputedStyle(main).color, 'rgb(242, 240, 235)', 'V tmavém motivu má být text světlý');
assert.equal(getComputedStyle(document.querySelector('aside')).backgroundColor, 'rgb(18, 24, 33)', 'Karta autora má v tmavém motivu podklad --color-podklad');
document.documentElement.classList.remove('tmavy');
```

Ve značce nezůstala žádná barva napsaná natvrdo.

```js
const html = files['index.html'];
const natvrdo = [...html.matchAll(/\b(bg|text|border)-\[[^\]]+\]/g)].map((m) => m[0]);
assert.deepEqual(natvrdo, [], `Barvy patří do tokenů, ne do hranatých závorek ve značce: ${natvrdo.join(', ')}`);
const vychozi = [...html.matchAll(/\b(bg|text)-(slate|gray|zinc|neutral|stone|sky|blue)-\d{2,3}\b/g)].map((m) => m[0]);
assert.deepEqual(vychozi, [], `Tohle jsou výchozí barvy Tailwindu, ne barvy značky — nahraď je tokeny: ${vychozi.join(', ')}`);
```

# --help--

## --tip--

Nejdřív `@theme`, potom třídy. Které předpony vyrábějí které utility, je v části
[`@theme`: paleta, písmo, rozestupy](see:css-tailwind/theme-a-tokeny#theme-paleta-pismo-rozestupy).

## --tip--

Tmavý motiv nedělej variantami `dark:` u každé třídy — přepiš sémantické tokeny
v jednom pravidle, jak ukazuje část
[Sémantické tokeny a tmavý motiv](see:css-tailwind/theme-a-tokeny#semanticke-tokeny-a-tmavy-motiv).

# --seed--

## --file-- index.html

```html
<button class="prepinac" onclick="document.documentElement.classList.toggle('tmavy')">Přepnout motiv</button>

<main>
  <h1>Proč jsem rok necestoval letadlem</h1>
  <p>Před rokem jsem si řekl, že do konce roku nesednu do letadla. Vydrželo mi to — a bylo to
    zajímavější, než jsem čekal. Nejdál jsem se dostal nočním vlakem do Splitu, nejhůř dopadla
    cesta autobusem do Krakova.</p>

  <p>Psal jsem o tom i v <a href="https://cs.wikipedia.org/wiki/Noční_vlak">článku o nočních
    vlacích</a> a od té doby mi chodí dotazy, jestli se to vůbec vyplatí. Krátká odpověď:
    když máš čas, ano.</p>

  <p>Nejlevnější spojení se hledá tři týdny dopředu, nejpohodlnější měsíc a půl. Nejhorší je
    kupovat na poslední chvíli — to platí pro vlaky ještě víc než pro letadla.</p>

  <aside>
    <h2>Napsal</h2>
    <p><strong>Tomáš Klíma</strong></p>
    <p>Píše o cestování bez letadla a o tom, kam se odsud dá dojet do dvanácti hodin.</p>
    <p><a href="mailto:tomas@example.cz">Napiš mi</a></p>
  </aside>
</main>
```

## --file-- style.css

```css
@import "tailwindcss";

/* Sem přijdou tokeny značky a pravidlo pro tmavý motiv. */

/* Přepínač motivu — tenhle kus stylů je hotový, neřeš ho. */
.prepinac {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid currentColor;
  border-radius: 0.4rem;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}
```

# --solution--

## --file-- index.html

```html
<button class="prepinac" onclick="document.documentElement.classList.toggle('tmavy')">Přepnout motiv</button>

<main class="mx-auto grid max-w-3xl gap-8 bg-plocha p-6 text-text lg:grid-cols-[2fr_1fr] lg:items-start">
  <article class="lg:col-start-1">
    <h1 class="font-nadpis mb-4 text-3xl font-bold">Proč jsem rok necestoval letadlem</h1>
    <p class="mb-4">Před rokem jsem si řekl, že do konce roku nesednu do letadla. Vydrželo mi to — a bylo to
      zajímavější, než jsem čekal. Nejdál jsem se dostal nočním vlakem do Splitu, nejhůř dopadla
      cesta autobusem do Krakova.</p>

    <p class="mb-4">Psal jsem o tom i v <a class="text-znacka hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-znacka" href="https://cs.wikipedia.org/wiki/Noční_vlak">článku o nočních
      vlacích</a> a od té doby mi chodí dotazy, jestli se to vůbec vyplatí. Krátká odpověď:
      když máš čas, ano.</p>

    <p>Nejlevnější spojení se hledá tři týdny dopředu, nejpohodlnější měsíc a půl. Nejhorší je
      kupovat na poslední chvíli — to platí pro vlaky ještě víc než pro letadla.</p>
  </article>

  <aside class="rounded-xl bg-podklad p-4 lg:col-start-2">
    <h2 class="font-nadpis mb-2 text-lg font-bold">Napsal</h2>
    <p class="mb-1"><strong>Tomáš Klíma</strong></p>
    <p class="mb-3 text-sm">Píše o cestování bez letadla a o tom, kam se odsud dá dojet do dvanácti hodin.</p>
    <p><a class="text-znacka hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-znacka" href="mailto:tomas@example.cz">Napiš mi</a></p>
  </aside>
</main>
```

## --file-- style.css

```css
@import "tailwindcss";

@theme {
  /* Sémantické tokeny — světlý motiv */
  --color-plocha: #ffffff;
  --color-podklad: #f2f0eb;
  --color-text: #1b2430;
  --color-znacka: #1f6f8b;

  --font-nadpis: Georgia, serif;
}

/* Tmavý motiv: mění se hodnoty tokenů, ne třídy v HTML. */
.tmavy {
  --color-plocha: #1b2430;
  --color-podklad: #121821;
  --color-text: #f2f0eb;
}

/* Přepínač motivu — tenhle kus stylů je hotový, neřeš ho. */
.prepinac {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid currentColor;
  border-radius: 0.4rem;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}
```

# --approaches--

## --approach-- Rozvržení flexem místo gridu

Dva sloupce jdou udělat i flexem: `lg:flex-row` a šířka karty přes `lg:w-72 lg:shrink-0`.
U dvou bloků je to kratší; jakmile ale budeš chtít sloupce zarovnat mezi řádky nebo
prohodit pořadí na mobilu, grid to zvládne líp.

### --file-- index.html

```html
<button class="prepinac" onclick="document.documentElement.classList.toggle('tmavy')">Přepnout motiv</button>

<main class="mx-auto flex max-w-3xl flex-col gap-8 bg-plocha p-6 text-text lg:flex-row lg:items-start">
  <article>
    <h1 class="font-nadpis mb-4 text-3xl font-bold">Proč jsem rok necestoval letadlem</h1>
    <p class="mb-4">Před rokem jsem si řekl, že do konce roku nesednu do letadla. Vydrželo mi to — a bylo to
      zajímavější, než jsem čekal. Nejdál jsem se dostal nočním vlakem do Splitu, nejhůř dopadla
      cesta autobusem do Krakova.</p>

    <p class="mb-4">Psal jsem o tom i v <a class="text-znacka hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-znacka" href="https://cs.wikipedia.org/wiki/Noční_vlak">článku o nočních
      vlacích</a> a od té doby mi chodí dotazy, jestli se to vůbec vyplatí. Krátká odpověď:
      když máš čas, ano.</p>

    <p>Nejlevnější spojení se hledá tři týdny dopředu, nejpohodlnější měsíc a půl. Nejhorší je
      kupovat na poslední chvíli — to platí pro vlaky ještě víc než pro letadla.</p>
  </article>

  <aside class="rounded-xl bg-podklad p-4 lg:w-72 lg:shrink-0">
    <h2 class="font-nadpis mb-2 text-lg font-bold">Napsal</h2>
    <p class="mb-1"><strong>Tomáš Klíma</strong></p>
    <p class="mb-3 text-sm">Píše o cestování bez letadla a o tom, kam se odsud dá dojet do dvanácti hodin.</p>
    <p><a class="text-znacka hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-znacka" href="mailto:tomas@example.cz">Napiš mi</a></p>
  </aside>
</main>
```

### --file-- style.css

```css
@import "tailwindcss";

@theme {
  --color-plocha: #ffffff;
  --color-podklad: #f2f0eb;
  --color-text: #1b2430;
  --color-znacka: #1f6f8b;

  --font-nadpis: Georgia, serif;
}

.tmavy {
  --color-plocha: #1b2430;
  --color-podklad: #121821;
  --color-text: #f2f0eb;
}

.prepinac {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid currentColor;
  border-radius: 0.4rem;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}
```

## --approach-- Styl odkazů přes `@layer base`

Odkazy v článku nejsou komponenta — je jich hodně a chovají se všechny stejně. Místo
opakování šesti tříd u každého se dá jejich vzhled nastavit jednou v `@layer base`
přes `@apply`. Je to přesně ten případ, kdy je `@apply` na místě: styluje se **prvek**,
ne komponenta. Za to platíš tím, že se vzhled odkazu neurčuje ve značce.

### --file-- index.html

```html
<button class="prepinac" onclick="document.documentElement.classList.toggle('tmavy')">Přepnout motiv</button>

<main class="mx-auto grid max-w-3xl gap-8 bg-plocha p-6 text-text lg:grid-cols-[2fr_1fr] lg:items-start">
  <article class="lg:col-start-1">
    <h1 class="font-nadpis mb-4 text-3xl font-bold">Proč jsem rok necestoval letadlem</h1>
    <p class="mb-4">Před rokem jsem si řekl, že do konce roku nesednu do letadla. Vydrželo mi to — a bylo to
      zajímavější, než jsem čekal. Nejdál jsem se dostal nočním vlakem do Splitu, nejhůř dopadla
      cesta autobusem do Krakova.</p>

    <p class="mb-4">Psal jsem o tom i v <a href="https://cs.wikipedia.org/wiki/Noční_vlak">článku o nočních
      vlacích</a> a od té doby mi chodí dotazy, jestli se to vůbec vyplatí. Krátká odpověď:
      když máš čas, ano.</p>

    <p>Nejlevnější spojení se hledá tři týdny dopředu, nejpohodlnější měsíc a půl. Nejhorší je
      kupovat na poslední chvíli — to platí pro vlaky ještě víc než pro letadla.</p>
  </article>

  <aside class="rounded-xl bg-podklad p-4 lg:col-start-2">
    <h2 class="font-nadpis mb-2 text-lg font-bold">Napsal</h2>
    <p class="mb-1"><strong>Tomáš Klíma</strong></p>
    <p class="mb-3 text-sm">Píše o cestování bez letadla a o tom, kam se odsud dá dojet do dvanácti hodin.</p>
    <p><a href="mailto:tomas@example.cz">Napiš mi</a></p>
  </aside>
</main>
```

### --file-- style.css

```css
@import "tailwindcss";

@theme {
  --color-plocha: #ffffff;
  --color-podklad: #f2f0eb;
  --color-text: #1b2430;
  --color-znacka: #1f6f8b;

  --font-nadpis: Georgia, serif;
}

.tmavy {
  --color-plocha: #1b2430;
  --color-podklad: #121821;
  --color-text: #f2f0eb;
}

/* Odkaz je prvek, ne komponenta — tady je @apply na místě. */
@layer base {
  main a {
    @apply text-znacka hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-znacka;
  }
}

.prepinac {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid currentColor;
  border-radius: 0.4rem;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}
```

# --review--

Testy kontrolují návrh. Jestli se s tím dá žít, zkontroluj sám.

## --rubric--

- Přepnul jsem motiv tam a zpět a přečetl si celou stránku v obou — nikde nechybí
  kontrast.
- Prošel jsem stránku tabulátorem: obrys je vidět u každého odkazu i u přepínače.
- Zkusil jsem šířky 375, 768 a 1280 px; karta autora se přesouvá tam, kam má.
- V HTML nikde není konkrétní barva — všechno stojí na tokenech.
- Kdybych měl přebarvit celý web na jinou značku, sáhnu jen do `@theme`.
- Rozumím, proč tady nepotřebuju ani jednu třídu `dark:`.

## --extensions--

- Přidej token `--radius-karta` a nahraď jím `rounded-xl`, ať je zaoblení řízené
  z jednoho místa.
- Nech motiv řídit systémem: uprav pravidlo tak, aby se tmavá varianta zapnula i při
  `@media (prefers-color-scheme: dark)`, pokud si uživatel nevybral ručně.
- Zkus stejnou stránku přepsat s `@container` místo `lg:` a porovnej, co se změní,
  když kartu vložíš do užšího sloupce.
- Ulož volbu motivu do `localStorage`, ať vydrží po načtení stránky.
