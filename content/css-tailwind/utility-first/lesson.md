# Utility-first myšlení

Otevřeš zdroják landing page nějakého startupu nebo komponentu ze shadcn/ui a vidíš `class="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium"`. To je Tailwind, dnes nejrozšířenější způsob stylování v React a Next.js projektech. V lekci se naučíš takový řádek číst jako řadu deklarací, které už znáš z CSS.

:::check pretest
Web má deset stránek se stejnými kartami a tlačítky. Přidáš jedenáctou, která používá jen ty samé karty a tlačítka. Co se stane s velikostí vygenerovaného CSS v Tailwindu?

### --answer--
Vzroste o styly nové stránky, stejně jako u čistého CSS.

#### --why--
U čistého CSS obvykle ano, protože nová stránka dostane nová pravidla. Jak Tailwind rozhoduje, co vygenerovat, uvidíš v části o hledání tříd.

### --correct--
Nezmění se, pokud nová stránka nepoužije žádnou třídu, kterou zatím žádná stránka nepoužila.

#### --why--
Tailwind vygeneruje jedno pravidlo za každou použitou třídu. Stejné třídy na další stránce už nic nepřidají.

### --answer--
Nic, protože Tailwind do stránky vždy vloží celou knihovnu všech tříd.

#### --why--
Celá knihovna by měla desítky megabajtů. Tailwind generuje jen to, co najde ve zdrojích.
:::

## Problém: jména tříd a stylopis, který jen roste

V čistém CSS vypadá karta akce takhle:

```html
<article class="event-card">
  <h2 class="event-card__title">Noc divadel</h2>
  <p class="event-card__meta">Brno · 21. 11.</p>
</article>
```

```css
.event-card { padding: 1.5rem; border-radius: 0.75rem; background: white; }
.event-card__title { font-size: 1.25rem; font-weight: 700; }
.event-card__meta { color: #64748b; }
```

Funguje to, ale má to tři dlouhodobé problémy:

- **Vymýšlení jmen.** Každý nový kousek potřebuje jméno. Je to `event-card__meta`, nebo `event-card__info`? Tým se o to přetahuje a jména časem přestanou odpovídat obsahu.
- **Mrtvé CSS.** Když kartu ze stránky smažeš, pravidla ve stylopisu zůstanou. Nikdo si netroufne je smazat, protože neví, jestli je nepoužívá jiná stránka.
- **Stylopis roste s každou stránkou.** Nová sekce znamená nová pravidla, i když používá stejné odsazení a stejné barvy jako všechno ostatní.

Tailwind to obrací: místo jména komponenty píšeš do `class` malé třídy, z nichž každá dělá jednu věc. Takovým třídám se říká [[utility třída|utility]] a přístupu [[utility-first]].

> [!REMEMBER]
> **Utilita je jedna deklarace CSS nad hodnotou ze stupnice. Tailwind vygeneruje CSS jen pro třídy, které ve zdrojích najde.** Dlouhý `class` proto není nový jazyk, ale zkratka za vlastnosti, které znáš.

:::compare
--variant-- Čisté CSS
```html
<article class="event-card">
  <h2 class="event-card__title">Noc divadel</h2>
  <p class="event-card__meta">Brno · 21. 11.</p>
</article>
```
```css
body { margin: 0; padding: 1.5rem; background: #f1f5f9; font-family: system-ui, sans-serif; }
.event-card { max-width: 20rem; padding: 1.5rem; border-radius: 0.75rem; background: white; }
.event-card__title { margin: 0; font-size: 1.25rem; font-weight: 700; }
.event-card__meta { margin: 0; color: #64748b; }
```
--variant-- Utility Tailwindu
```html
<main class="bg-slate-100 p-6 font-sans min-h-screen">
  <article class="max-w-xs rounded-xl bg-white p-6">
    <h2 class="text-xl font-bold">Noc divadel</h2>
    <p class="text-slate-500">Brno · 21. 11.</p>
  </article>
</main>
```
```css
@import "tailwindcss";
```
:::

Obě karty vypadají stejně. Zkus v pravé variantě změnit `p-6` na `p-10` a sleduj, jak se odsazení změní, aniž bys sáhl do CSS.

:::check
Kolega smaže z pravé varianty celý `<article>`. Co se stane s CSS, které Tailwind vygeneruje?

### --answer--
Zůstane stejné, pravidla se musí smazat ručně.

#### --why--
To platí pro čisté CSS, kde pravidla píšeš do stylopisu sám. Tailwind CSS generuje ze tříd, které ve zdrojích najde.

### --correct--
Zmenší se o třídy, které používal jen ten článek.

#### --why--
Třída, kterou už nic nepoužívá, se při dalším sestavení nevygeneruje. Mrtvé CSS tak nevzniká.

### --answer--
Nezmění se, Tailwind vygeneruje všechny třídy, které zná.

#### --why--
Tailwind zná tisíce kombinací (každá barva × každý odstín × každá vlastnost). Generuje jen použité.
:::

## Utilita = jedna deklarace nad tokenem

Každá utilita odpovídá jedné nebo několika málo deklaracím. Hodnoty nebere z hlavy, ale z [[design token|tokenů]], které Tailwind definuje jako CSS proměnné:

| třída | vygenerované CSS | spočtená hodnota |
|---|---|---|
| `p-4` | `padding: calc(var(--spacing) * 4)` | 16 px (`--spacing` je `0.25rem`) |
| `px-6` | `padding-inline: calc(var(--spacing) * 6)` | 24 px vlevo i vpravo |
| `mt-2` | `margin-top: calc(var(--spacing) * 2)` | 8 px |
| `rounded-lg` | `border-radius: var(--radius-lg)` | 8 px |
| `text-sm` | `font-size: var(--text-sm)` a `line-height` k ní | 14 px, řádek 20 px |
| `bg-sky-500` | `background-color: var(--color-sky-500)` | barva v `oklch()` |
| `flex` | `display: flex` | — |

Číslo za pomlčkou u rozestupů je **násobek čtvrt remu**, ne pixely: `p-4` jsou 4 × 4 px = 16 px. Proto všechny mezery na stránce sedí na jedné [[stupnice rozestupů|stupnici]], stejně jako tokeny `--space-*` v sekci o designu. Stupnice je spojitá, takže `p-7` nebo `gap-13` taky existují.

Jak se jmenuje která utilita, se neučíš zpaměti. Jméno většinou kopíruje vlastnost: `justify-between` je `justify-content: space-between`, `items-center` je `align-items: center`, `font-bold` je `font-weight: 700`. Když si nevzpomeneš, najdeš ji v dokumentaci Tailwindu vyhledáním vlastnosti CSS.

:::live dom libs=tailwind predict
```html
<main class="p-8 font-sans">
  <button id="buy" class="bg-sky-600 text-white px-6 py-2 rounded-lg">Koupit vstupenku</button>
  <p id="out" class="mt-6 text-slate-700"></p>
</main>
```
```js
const style = getComputedStyle(document.querySelector('#buy'));
document.querySelector('#out').textContent =
  `padding: ${style.paddingTop} ${style.paddingRight} · border-radius: ${style.borderRadius}`;
```
--question-- Jaké odsazení a zaoblení dostane tlačítko s `px-6 py-2 rounded-lg`?
--option-- Odsazení 6 px vlevo a vpravo, 2 px nahoře a dole, zaoblení podle prohlížeče.
--option*-- Odsazení 24 px vlevo a vpravo, 8 px nahoře a dole, zaoblení 8 px.
--option-- Odsazení 24 px na všech stranách, protože poslední utilita přepíše předchozí.
--why-- Číslo je násobek `--spacing` (0.25rem = 4 px), takže `px-6` je 24 px a `py-2` 8 px. `px` nastavuje jen `padding-inline`, `py` jen `padding-block`, takže se nepřepisují. `rounded-lg` čte token `--radius-lg`, který je 0.5rem. Zkus změnit `px-6` na `px-10` a sleduj výpis pod tlačítkem.
:::

:::check
Jaké spočtené odsazení nahoře dostane prvek s třídou `pt-5`? Napiš číslo v px.

### --expected--
20px

### --accept--
20
20 px

### --why--
`pt-5` je `padding-top: calc(var(--spacing) * 5)` a `--spacing` je 0.25rem, tedy 4 px. 5 × 4 = 20 px.
:::

## Jak Tailwind najde třídy

Tailwind nečte tvoji stránku v prohlížeči. V projektu projde při sestavení **zdrojové soubory** (`.html`, `.jsx`, `.vue`, `.md`…) jako obyčejný text a hledá v nich řetězce, které vypadají jako jeho třídy. Pro každý nalezený řetězec vygeneruje pravidlo. Neví nic o tom, jestli je to atribut `class`, proměnná v JavaScriptu, nebo komentář.

Z toho plyne nejdůležitější pravidlo práce s Tailwindem: **třída musí být ve zdroji napsaná celá.** Tahle šablona nefunguje:

```js
const color = order.paid ? 'emerald' : 'rose';
badge.className = `bg-${color}-500 text-white`;
```

Ve zdroji je jen text `bg-${color}-500`. Řetězce `bg-emerald-500` ani `bg-rose-500` tam nikde nejsou, takže je Tailwind nevygeneruje a štítek zůstane bez pozadí. Správně je mít celé třídy ve zdroji a vybírat mezi nimi:

```js
const badgeColors = {
  paid: 'bg-emerald-500',
  unpaid: 'bg-rose-500',
};
badge.className = `${badgeColors[order.status]} text-white`;
```

> [!NOTE]
> V náhledu Akademie běží prohlížečová verze Tailwindu, která čte třídy přímo ze stránky, až když je JavaScript vloží. Složená třída se tu proto vygeneruje a chyba se neprojeví. V projektu s Vite nebo Next.js ale spadneš přesně do popsané pasti, takže piš třídy celé i tady.

:::explain
Vysvětli, proč se třída složená v šabloně jako `` `text-${size}` `` v projektu nevygeneruje, i když výsledný řetězec `text-lg` je platná třída.

## --model--
Tailwind při sestavení nespouští JavaScript, jen čte zdrojové soubory jako text a hledá v nich celé názvy tříd. V souboru je napsané `text-${size}`, ne `text-lg`, takže tuhle třídu nenajde a nevygeneruje pro ni CSS. Řešení je mít ve zdroji celé názvy, třeba v objektu, a vybírat mezi nimi.

## --checklist--
- Tailwind čte zdrojové soubory jako text, kód nespouští.
- Hledá celé názvy tříd, složený řetězec ve zdroji není.
- Pro třídu, kterou nenajde, nevygeneruje žádné CSS.
- Oprava: celé názvy tříd ve zdroji (třeba v objektu) a výběr mezi nimi.
:::

## `@import "tailwindcss"` a vrstvy

V projektu stačí do hlavního CSS souboru napsat jeden řádek:

```css
@import "tailwindcss";
```

Ten rozbalí do stylopisu čtyři [[kaskádová vrstva|kaskádové vrstvy]] v tomhle pořadí:

```css
@layer theme, base, components, utilities;
```

| vrstva | co v ní je |
|---|---|
| `theme` | tokeny jako CSS proměnné na `:root`: `--spacing`, `--color-sky-500`, `--radius-lg`… |
| `base` | preflight: sjednocení výchozích stylů prohlížečů |
| `components` | prázdná, pro tvoje komponentové třídy |
| `utilities` | vygenerované utility |

Pořadí vrstev znáš ze sekce o kaskádě: pozdější vrstva vyhrává, ať má jakoukoli specificitu. Utility jsou poslední, takže přebijí styly ze `base` i `components`. A tvoje vlastní CSS **mimo vrstvy** vyhraje nad vším, i nad utilitami. Víc o tom v lekci [Vrstvy `@layer`](see:css-kaskada/kaskada#vrstvy-layer).

**Preflight** vynuluje okraje, zruší odrážky seznamů, nastaví obrázkům `display: block` a `max-width: 100%` a **nadpisům vezme velikost i tučnost**. `<h1>` bez tříd vypadá jako obyčejný odstavec. Není to chyba: každý vzhled v Tailwindu napíšeš utilitami, takže tě výchozí styly prohlížeče nepřekvapí.

:::live dom libs=tailwind predict
```html
<article class="p-6 font-sans">
  <h1>Letní kino na Výstavišti</h1>
  <p>Promítání každý pátek od 21:00.</p>
  <ul>
    <li>Vstupné 150 Kč</li>
    <li>Deka s sebou</li>
  </ul>
</article>
```
--question-- Jak bude vypadat nadpis `<h1>` bez jakýchkoli tříd na stránce s Tailwindem?
--option-- Velký a tučný, jako na každé stránce.
--option*-- Stejně velký a stejně silný jako odstavec pod ním.
--option-- Neviditelný, protože preflight skryje prvky bez tříd.
--why-- Preflight ve vrstvě `base` nastaví nadpisům `font-size: inherit` a `font-weight: inherit`, takže zdědí vzhled textu okolo. Seznam navíc ztratí odrážky. Přidej nadpisu `text-3xl font-bold` a seznamu `list-disc pl-5` a sleduj, jak se vzhled vrátí.
:::

:::check
Na stránce s Tailwindem napíšeš do stylopisu pod `@import "tailwindcss";` pravidlo `.price { padding: 0; }` mimo jakoukoli vrstvu. Prvek má `class="price p-4"`. Jaké bude mít odsazení?

### --answer--
16 px, protože utilita je napsaná v `class` a má přednost.

#### --why--
O pořadí tříd v atributu `class` kaskáda nerozhoduje. Rozhoduje, ve které vrstvě pravidlo je.

### --correct--
0 px, protože styly mimo vrstvy vyhrají nad vrstvou `utilities`.

#### --why--
Utility jsou ve vrstvě `utilities`. Pravidlo mimo vrstvy vyhraje nad jakoukoli vrstvou, i když má stejnou specificitu.

### --answer--
16 px, protože utility jsou poslední vrstva a ta vyhrává vždy.

#### --why--
Poslední vrstva vyhrává jen mezi vrstvami. Styl mimo vrstvy je silnější než všechny.
:::

## Čtení dlouhého `class` po skupinách

Dlouhý atribut se čte jako deklarace v pravidle, jen je potřeba ho rozdělit do skupin. Ustálené pořadí je **layout → box → typografie → barvy → stavy**:

```html
<a class="inline-flex items-center gap-2
          rounded-full px-4 py-2
          text-sm font-semibold
          bg-emerald-600 text-white
          hover:bg-emerald-700 focus-visible:outline-2">
```

| skupina | třídy | co dělají |
|---|---|---|
| layout | `inline-flex items-center gap-2` | řádek s ikonou a textem, svisle na středu, mezera 8 px |
| box | `rounded-full px-4 py-2` | kulaté okraje, odsazení 16 × 8 px |
| typografie | `text-sm font-semibold` | 14 px, váha 600 |
| barvy | `bg-emerald-600 text-white` | zelené pozadí, bílý text |
| stavy | `hover:… focus-visible:…` | platí jen při najetí myší nebo fokusu z klávesnice |

Prefix s dvojtečkou (`hover:`) je [[varianta]]: podmínka, za které utilita platí. K variantám se podrobně dostaneme v lekci [Responzivita a stavy](see:css-tailwind/responzivita-a-stavy). Pořadí tříd v atributu **nemá vliv na výsledek**, jen na čitelnost. V týmu ho hlídá plugin pro Prettier, který třídy seřadí sám.

:::live dom libs=tailwind
```html
<main class="grid min-h-screen place-items-center bg-slate-100 p-6 font-sans">
  <article class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
    <p class="text-xs font-semibold uppercase tracking-wider text-emerald-700">Farmářský trh</p>
    <h2 class="mt-2 text-2xl font-bold text-slate-900">Náplavka, sobota 8:00</h2>
    <p class="mt-3 text-slate-600">Sýry z Vysočiny, pečivo z Kladna a víc než čtyřicet stánků.</p>
    <a href="#mapa" class="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Ukázat na mapě</a>
  </article>
</main>
```
:::

Zkus u odkazu změnit `rounded-full` na `rounded-md` a `px-4` na `px-8`. Pak najeď na odkaz myší a sleduj, že `hover:bg-emerald-700` platí jen v tu chvíli.

:::check
Prvek má `class="mt-4 flex justify-between text-lg"`. Které deklarace vygenerují třídy `flex` a `justify-between`?

### --expected--
display: flex; justify-content: space-between

### --accept--
justify-content: space-between; display: flex
display: flex, justify-content: space-between

### --why--
Jména utilit kopírují vlastnosti CSS: `flex` je `display: flex` a `justify-between` je `justify-content: space-between`.
:::

## Libovolné hodnoty: únikový ventil

Někdy hodnota na stupnici není: návrh chce kartu širokou přesně 37rem nebo mřížku se sloupci `1fr auto`. Pro takové případy má Tailwind [[libovolná hodnota|libovolné hodnoty]] v hranatých závorkách:

| třída | CSS |
|---|---|
| `w-[37rem]` | `width: 37rem` |
| `bg-[#0f766e]` | `background-color: #0f766e` |
| `grid-cols-[1fr_auto]` | `grid-template-columns: 1fr auto` |
| `top-[calc(100%-2px)]` | `top: calc(100% - 2px)` |
| `[mask-type:luminance]` | `mask-type: luminance` (vlastnost, pro kterou utilita není) |

Mezera v atributu `class` odděluje třídy, proto se **mezera uvnitř hodnoty píše podtržítkem**: `grid-cols-[1fr_auto]`.

:::live dom libs=tailwind
```html
<div class="p-6 font-sans">
  <div class="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl bg-amber-50 p-4">
    <p class="text-slate-700">Doprava zdarma od 1 500 Kč</p>
    <a href="#kosik" class="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900">Do košíku</a>
  </div>
</div>
```
:::

Zkus podtržítko nahradit mezerou a sleduj, že se tlačítko přesune pod text: z jedné třídy se staly dvě neplatné (`grid-cols-[1fr` a `auto]`) a mřížka má jediný sloupec.

> [!TIP]
> Libovolné hodnoty jsou únikový ventil, ne výchozí způsob. Když se ti v kódu množí `p-[13px]` a `text-[#334155]`, stránka ztrácí stupnici. Hodnotu, kterou potřebuješ opakovaně, přidej jako token. Jak, uvidíš v lekci [@theme a design tokeny](see:css-tailwind/theme-a-tokeny).

:::check
Chceš utilitami napsat `grid-template-columns: 200px 1fr`. Která třída to udělá?

### --expected--
grid-cols-[200px_1fr]

### --why--
Libovolná hodnota jde do hranatých závorek a mezera se v ní píše podtržítkem, jinak by atribut `class` hodnotu rozdělil na dvě třídy.
:::

## Tailwind v projektu a v náhledu

V projektu s Vite nainstaluješ `tailwindcss` a `@tailwindcss/vite`, přidáš plugin do `vite.config.js` a do hlavního CSS napíšeš `@import "tailwindcss";`. Plugin při každém uložení projde zdrojové soubory a vygeneruje CSS. Do prohlížeče tak dorazí obyčejný stylopis, žádný JavaScript Tailwindu.

```js
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

V krocích Akademie místo toho běží **prohlížečová verze** (`@tailwindcss/browser`). Ta sleduje stránku a CSS generuje až v prohlížeči. Na učení je to pohodlné, na produkci ne: stránka stahuje celý Tailwind a styly naskočí až po spuštění skriptu.

Rozdíly, které tě můžou překvapit:

| | projekt (`@tailwindcss/vite`) | náhled Akademie |
|---|---|---|
| kde hledá třídy | ve zdrojových souborech | v DOM stránky |
| třída složená v šabloně | nevygeneruje se | vygeneruje se |
| kam píšeš `@theme` a spol. | do CSS souboru s `@import "tailwindcss"` | stejně, nebo do `<style type="text/tailwindcss">` |

:::check
Ve kterém případě se třída `bg-rose-500` v projektu s Vite **nevygeneruje**?

### --answer--
Když je napsaná jen v souboru `.jsx`, ne v HTML.

#### --why--
Plugin prochází všechny zdrojové soubory projektu, ne jen HTML. JSX, Vue i Markdown čte stejně.

### --correct--
Když ji skript skládá z částí `'bg-' + tone + '-500'`.

#### --why--
Ve zdroji je jen `'bg-'` a `'-500'`, celý řetězec `bg-rose-500` tam nikde není.

### --answer--
Když je v souboru uvedená jen v komentáři.

#### --why--
Tailwind čte soubory jako text a komentáře neodlišuje. Třída z komentáře se klidně vygeneruje.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Třída složená z proměnné.** `` `text-${tone}-600` `` v projektu nevygeneruje nic, prvek zůstane v barvě textu okolo a v DevTools u něj žádné pravidlo neuvidíš. Oprava: celé názvy tříd ve zdroji, třeba v objektu `{ ok: 'text-emerald-600', chyba: 'text-rose-600' }`.

> [!PITFALL]
> **Mezera v libovolné hodnotě.** `grid-cols-[1fr auto]` se rozpadne na dvě neplatné třídy a mřížka zůstane v jednom sloupci. Oprava: `grid-cols-[1fr_auto]`.

> [!PITFALL]
> **`opacity-*` místo průhledné barvy.** Štítek s `bg-rose-600 opacity-60` má průhledné pozadí, ale i text, takže je hůř čitelný. `opacity` platí pro celý prvek včetně obsahu. Oprava: průhlednost jen barvy za lomítkem, `bg-rose-600/60`.

> [!PITFALL]
> **Nadpis bez velikosti.** Po přidání Tailwindu vypadají všechny `<h1>` až `<h6>` jako odstavce a seznamy nemají odrážky. Nejde o chybu, ale o preflight. Oprava: dát nadpisům utility (`text-3xl font-bold`), ne psát reset zpátky.

:::live dom libs=tailwind predict
```html
<div class="grid min-h-screen place-items-center bg-slate-800 p-6 font-sans">
  <div class="relative w-72">
    <div class="h-40 rounded-xl bg-linear-to-br from-sky-400 to-indigo-600"></div>
    <span class="absolute left-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-sm font-semibold text-white opacity-50">Poslední místa</span>
  </div>
</div>
```
--question-- Štítek má `bg-rose-600 text-white opacity-50`. Co bude poloprůhledné?
--option-- Jen červené pozadí štítku, text zůstane plně bílý.
--option*-- Pozadí štítku i jeho text.
--option-- Jen text, protože `opacity` se týká písma.
--why-- `opacity` zprůhlední celý prvek i s obsahem, takže bledne i text. Průhlednost jen pro barvu pozadí se píše za lomítko: `bg-rose-600/50`. Zkus to v ukázce přepsat a porovnej čitelnost textu.
:::

## Kde to najdeš v MDN

- [CSS cascade layers](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers) — proč utility ve vrstvě `utilities` prohrají se styly mimo vrstvy.
- [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) — jak fungují proměnné `--spacing` a `--color-*`, ze kterých utility berou hodnoty.
- [calc()](https://developer.mozilla.org/en-US/docs/Web/CSS/calc) — co přesně spočítá `calc(var(--spacing) * 4)`.
- [opacity](https://developer.mozilla.org/en-US/docs/Web/CSS/opacity) — proč průhlednost prvku platí i pro jeho obsah.

Příště si z utilit postavíš celou kartu vstupenky na koncert, včetně fotky, štítku a tlačítka se stavy.

# --questions--

## --question--

Jakou šířku v px dostane prvek s třídou `w-64`?

### --expected--
256px

### --accept--
256
256 px

### --why--
`w-64` je `width: calc(var(--spacing) * 64)`, tedy 64 × 4 px = 256 px.

### --see--
css-tailwind/utility-first#utilita-jedna-deklarace-nad-tokenem

## --question--

Do které vrstvy vloží `@import "tailwindcss"` proměnné jako `--spacing` a `--color-sky-500`? Napiš jméno vrstvy.

### --expected-- ignore-case
theme

### --accept--
@layer theme
vrstva theme

### --why--
Tokeny jsou ve vrstvě `theme`, první ze čtyř (`theme, base, components, utilities`). Utility v poslední vrstvě si z nich hodnoty jen čtou přes `var()`.

### --see--
css-tailwind/utility-first#import-tailwindcss-a-vrstvy

## --question--

Jaký rozdíl je mezi třídami `bg-sky-600/30` a `bg-sky-600 opacity-30` na tlačítku s bílým textem?

### --answer--
Žádný, obě zapíšou průhlednost 30 %.

#### --why--
Průhlednost se v obou případech týká jiné věci. Lomítko mění barvu, `opacity` celý prvek.

### --correct--
`/30` zprůhlední jen pozadí, `opacity-30` celé tlačítko i s textem.

#### --why--
Zápis za lomítkem nastaví průhlednost barvy v `background-color`. `opacity` je vlastnost prvku a zprůhlední i obsah.

### --answer--
`opacity-30` zprůhlední jen pozadí, `/30` celé tlačítko.

#### --why--
Je to naopak: `opacity` nerozlišuje pozadí a obsah, platí pro celý prvek.

### --see--
css-tailwind/utility-first#typicke-chyby-a-pasti

## --question--

Jakou třídou zapíšeš `transform: rotate(-3deg)` jako vlastnost v libovolné hodnotě, bez utility pro otočení? Použij tvar s hranatými závorkami a dvojtečkou.

### --expected--
[transform:rotate(-3deg)]

### --why--
Libovolná vlastnost se zapíše celá do hranatých závorek: `[vlastnost:hodnota]`. Tailwind z ní vygeneruje přesně tuhle deklaraci. Pro otočení existuje i utilita `-rotate-3`, ta ale zapíše vlastnost `rotate`.

### --see--
css-tailwind/utility-first#libovolne-hodnoty-unikovy-ventil
