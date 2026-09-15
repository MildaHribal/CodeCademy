**Základ platí všude a je pro nejužší obrazovku. Media dotaz se ptá okna, container query místa komponenty, a motiv mění jen hodnoty tokenů.**

## Media dotaz, container query, nebo nic?

| otázka | nástroj | příklad |
|---|---|---|
| Jak široké je okno? | `@media (width >= 60rem)` | počet sloupců stránky, panel vedle obsahu |
| Kolik místa má komponenta? | `container-type` na obalu + `@container` | karta v panelu i v obsahu |
| Kolik sloupců se vejde? | nic, grid `repeat(auto-fill, minmax(min(16rem, 100%), 1fr))` | mřížka karet |
| Jak velké písmo nebo mezera? | `clamp()` s `rem + vw` (okno) nebo `rem + cqi` (kontejner) | nadpisy, rozestupy sekcí |
| Co uživatel chce nebo umí? | `@media (prefers-… )`, `hover`, `pointer`, `print` | tmavý motiv, omezený pohyb |

## Syntaxe rozsahů

| zápis | platí | starší zápis |
|---|---|---|
| `(width >= 40rem)` | od 640 px včetně | `(min-width: 40rem)` |
| `(width < 40rem)` | pod 640 px, 640 už ne | nejde přesně |
| `(40rem <= width < 64rem)` | od 640 do 1024 bez 1024 | nejde přesně |

`rem` v podmínce media dotazu = výchozí písmo prohlížeče (16 px), ne `font-size` na `html`.

## Výpočty

- `clamp(MIN, PREF, MAX)`: spočítej PREF (`1vw` = 1 % okna, `1cqi` = 1 % kontejneru) a ořízni ho do mezí. `clamp(2rem, 1rem + 4vw, 3.5rem)` v okně 600 px = 16 + 24 = **40 px**.
- Bod zlomu pro dva sloupce: 2 × nejmenší karta + `gap` + padding stránky vlevo i vpravo. `18 + 1 + 18 + 2 = 39rem`.
- Soubor ze `srcset`: šířka ze `sizes` × hustota displeje. `25vw` v okně 1280 px na hustotě 2 = 640 px.
- Dotykový cíl: aspoň 44 × 44 px (minimum WCAG 2.2 je 24 × 24 px).

## Vzory

Stránka mobile-first.

```css
.services { display: grid; gap: 1rem; }

@media (width >= 40rem) {
  .services { grid-template-columns: repeat(2, 1fr); }
}

@media (width >= 60rem) {
  .services { grid-template-columns: repeat(3, 1fr); }
}
```

Karta podle místa, se jménem kontejneru.

```css
.slot { container: slot / inline-size; }

@container slot (width >= 28rem) {
  .card { grid-template-columns: 9rem 1fr; }
}

.card__title { font-size: clamp(1.125rem, 0.75rem + 3cqi, 2.25rem); }
```

Obrázek, který si stáhne správnou velikost.

```html
<img src="kolo-800.jpg"
  srcset="kolo-480.jpg 480w, kolo-800.jpg 800w, kolo-1200.jpg 1200w"
  sizes="(width >= 60rem) 45vw, 100vw"
  alt="Mechanik seřizuje přehazovačku">
```

Světlý a tmavý motiv s ručním přepínačem.

```css
:root {
  color-scheme: light dark;
  --color-bg: light-dark(#ffffff, #111827);
  --color-text: light-dark(#1f2937, #f3f4f6);
}

:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }
```

Pohyb jen pro ty, kdo ho neomezili, a hover jen pro myš.

```css
@media (prefers-reduced-motion: no-preference) {
  .card:hover { translate: 0 -4px; }
}

@media (hover: hover) {
  .photo__caption { opacity: 0; }
  .photo:hover .photo__caption { opacity: 1; }
}
```

Široký obsah se posouvá sám, ne celá stránka.

```css
.nav-list, .table-wrap { overflow-x: auto; }
.main-nav { min-width: 0; }
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| mobilní pravidlo se neuplatní | media dotaz stojí nad základním pravidlem se stejným selektorem | základ nahoru, media dotazy pod něj |
| na přesně 768 px platí oba bloky | `max-width` i `min-width` hranici zahrnují | `(width < 48rem)` a `(width >= 48rem)` |
| telefon ignoruje media dotazy, text je drobný | chybí `<meta name="viewport">` | `width=device-width, initial-scale=1` |
| malý náhled stahuje obří soubor | `srcset` bez `sizes` znamená `100vw` | napiš `sizes` podle skutečné šířky |
| `@container` se nikdy neuplatní | `container-type` je na kartě samotné, nebo nikde | kontejner na obal karty |
| kontejner má nulovou šířku | ve flexu bere šířku z obsahu, kontejner ho nepočítá | `flex: 1 1 16rem`, `width` nebo blokový obal |
| kontejner má nulovou výšku | `container-type: size` bez výšky | pro šířku `inline-size` |
| podmínka se ptá špatného kontejneru | bez jména rozhoduje nejbližší kontejner | pojmenovat a psát `@container jméno (…)` |
| písmo ve `vw` neroste s přiblížením | čisté `vw` | `clamp()` se součtem `rem + vw` |
| v tmavém motivu neviditelný text | barva natvrdo v komponentě | každou barvu do tokenu |
| formuláře zůstaly bílé | chybí `color-scheme` | `color-scheme: light dark` na `:root` |
| `light-dark()` vrací jen světlou | chybí `color-scheme` | `color-scheme: light dark` |
| ruční „Světlý" nechá tmavé tokeny | media dotaz se ptá systému, ne přepínače | `:root:not([data-theme="light"])` nebo `light-dark()` |
| fokus v kontrastním režimu zmizel | fokus jen přes `box-shadow` | přidej `outline` (klidně průhledný) |
