**Hierarchii dělá rozdíl, ne síla jednoho prvku.** Důležité vyčnívá, protože vedlejší ustoupí: vzdálenost, velikost, váha, barva.

## Rozestupy a hierarchie

| pravidlo | v praxi |
|---|---|
| [[princip blízkosti]] | mezera uvnitř skupiny aspoň 2× menší než mezi skupinami |
| [[stupnice rozestupů]] | 4, 8, 12, 16, 24, 32, 48, 64 px jako tokeny v `rem`; volíš stupeň, ne pixely |
| zvýraznění | nejdřív ztlum vedlejší (barva, menší písmo), pak zvětši hlavní |
| oddělení | mezera → jiné pozadí → stín → jedna tenká čára |
| čísla ve sloupci | doprava a `font-variant-numeric: tabular-nums` |
| rozestupy mezi bloky | `rem` nebo token, nikdy `em` (počítá se z písma prvku) |

## Barvy a kontrast

| zápis | co dělá |
|---|---|
| `oklch(L C H / a)` | L 0–1 vnímaná [[světlost]], C 0–~0.3 [[chroma]], H 0–360 odstín |
| `oklch(from var(--brand) 0.93 calc(c * 0.3) h)` | [[relativní barva]]: stupeň palety z jedné barvy |
| `calc(l + 0.1)` | kanály jsou čísla; `calc(l + 10%)` je neplatné |
| `color-mix(in oklch, var(--accent), black 15%)` | tmavší varianta (hover) |
| `color-mix(in oklch, var(--accent) 12%, transparent)` | průhledná varianta tokenu |
| `light-dark(světlá, tmavá)` | hodnota podle `color-scheme` |

| WCAG AA | nejmenší kontrast |
|---|---|
| běžný text | 4,5 : 1 |
| velký text (od 24 px, nebo 18,7 px tučně) | 3 : 1 |
| hranice ovládacích prvků, ikony s významem, fokus | 3 : 1 |

[[primitivní token|Primitivní tokeny]] pojmenují barvu (`--gray-600`), [[sémantický token|sémantické]] účel (`--color-text-muted`). Komponenty používají jen sémantické, tmavý motiv mění jen je. Ve tmě dělá hloubku světlejší povrch, ne stín.

## Typografie

| co | hodnota |
|---|---|
| [[modulární stupnice]] | základ × poměr na stupeň (1.2 aplikace, 1.25–1.333 landing page) |
| výška řádku | číslo bez jednotky: text ~1.5, nadpisy 1.1–1.25 |
| prostrkání | velké nadpisy `-0.02em`, verzálky kladné |
| délka řádku | `max-inline-size: 65ch` |
| písmo | `@font-face` s `woff2` u webu, `font-display: swap`, záložní `system-ui, sans-serif` |
| [[variabilní font]] | `font-weight: 100 900` v `@font-face` |

## Z Figmy do CSS

| návrh | CSS |
|---|---|
| [[auto layout]] *Horizontal* / *Vertical* | `display: flex` + `flex-direction` |
| *Gap* / *Padding* / *Wrap* | `gap` / `padding` / `flex-wrap: wrap` |
| *Gap: Auto* | `justify-content: space-between` (ne číslo) |
| *Hug contents* | v řádku nic, ve sloupci `align-self: flex-start` |
| *Fill container* | hlavní osa `flex: 1`, vedlejší osa výchozí `stretch` |
| *Fixed* | `width`/`height` + `flex: none` |
| písmo 18 px | `1.125rem` |
| výška řádku 28 px u 18 px | `line-height: calc(28 / 18)` |
| prostrkání −2 % | `letter-spacing: -0.02em` |
| *Drop shadow* 0 4 12 0, 10 % | `box-shadow: 0 4px 12px 0 rgb(0 0 0 / 0.1)` |
| varianta `Tone=danger` | `[data-tone="danger"]` nebo `.button--danger` |
| proměnná `text/muted` | `var(--color-text-muted)` |

Doptej se: stavy, prázdný stav, chyby, dlouhý a chybějící obsah, šířky mezi obrazovkami, tmavý motiv, pohyb.

## SVG a ikony

| způsob | barva z CSS | kdy |
|---|---|---|
| inline `<svg>` | ano | pár ikon, komponenty |
| `<img src="logo.svg" alt="…">` | ne | loga, ilustrace |
| [[SVG sprite|sprite]] `<use href="#icon-x"/>` | ano | stejná ikona na mnoha místech (externí soubor jen ze stejné domény) |
| `mask` + `background-color: currentColor` | ano | ikona jen v CSS |

| situace | kód |
|---|---|
| dekorace vedle textu | `<svg aria-hidden="true">` |
| tlačítko jen s ikonou | `aria-label` na `<button>`, `aria-hidden="true"` na SVG, plocha ~44 × 44 px |
| ikona nese význam | `<svg role="img" aria-label="Doručeno">` |

## Vzory

Stupnice rozestupů a písma v tokenech.

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --text-base: 1rem;
  --text-lg: calc(var(--text-base) * 1.25);
  --text-xl: calc(var(--text-lg) * 1.25);
}
```

Paleta z jedné barvy a sémantické tokeny pro oba motivy.

```css
:root {
  color-scheme: light dark;
  --brand: oklch(0.55 0.16 265);
  --brand-100: oklch(from var(--brand) 0.93 calc(c * 0.35) h);
  --brand-700: oklch(from var(--brand) 0.42 c h);
  --color-accent: light-dark(var(--brand-700), var(--brand-100));
  --color-text-muted: light-dark(var(--gray-600), var(--gray-400));
}
```

Stín ze dvou vrstev.

```css
.card {
  box-shadow:
    0 1px 2px rgb(15 23 42 / 0.06),
    0 12px 32px -8px rgb(15 23 42 / 0.18);
}
```

Ikona, která se chová jako text.

```css
.icon {
  flex: none;
  width: 1.25em;
  height: 1.25em;
}

.icon path {
  fill: currentColor;
}
```

Viditelný fokus jen z klávesnice.

```css
.button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

## Pasti

- `margin-bottom: 1em` u nadpisu 32 px = 32 px, ne 16 px.
- `line-height: 150%` nebo `24px` na předku: velké nadpisy zdědí pixely a řádky se překrývají.
- `oklch(from … calc(l + 10%) c h)` je neplatné; v tokenu dá prvku průhledné pozadí.
- Tlumený text projde kontrastem ve světlém motivu a v tmavém zmizí: kontroluj oba.
- Stejná světlost v `hsl()` neznamená stejný kontrast.
- Souřadnice X/Y a pevné šířky z jedné nakreslené obrazovky do CSS nepatří.
- SVG v `<img>` se nepřebarví s textem; ikona ve flexu bez `flex: none` se zmáčkne.
- Tlačítko jen s ikonou bez `aria-label` čtečka ohlásí jen jako „tlačítko".
