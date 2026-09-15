**Každý prvek je obdélník ze čtyř vrstev: obsah, padding, rámeček, margin.** Blokové boxy se skládají pod sebe, řádkové tečou v řádcích textu, svislé marginy bloků se slévají a co se nevejde, přeteče.

## Box model

| vrstva | vlastnost | pozadí | do velikosti boxu |
|---|---|---|---|
| obsah | `width`, `height` (logicky `inline-size`, `block-size`) | ano | ano |
| [[vnitřní odsazení]] | `padding` | ano | ano |
| rámeček | `border` | ano | ano |
| [[vnější okraj]] | `margin` | ne | ne, odsouvá sousedy |
| obrys, stín | `outline`, `box-shadow` | — | ne, nic neposune |

| `box-sizing` | `width: 300px; padding: 20px; border: 2px` | box na obrazovce |
|---|---|---|
| `content-box` (výchozí) | 300 + 40 + 4 | 344 px |
| `border-box` | obsah 300 − 40 − 4 = 256 | 300 px |

- Zkratka se 2–4 hodnotami: nahoře, vpravo, dole, vlevo. Chybějící strana se vezme od protější.
- `width: auto` u bloku = šířka rodiče minus vlastní margin, rámeček a padding. `width: 100%` + margin přeteče.
- `min-*` vyhrává nad `max-*`, obě nad `width`/`height`.
- Procenta v `padding` a `margin` se počítají ze **šířky** rodiče, i nahoře a dole.

## Block, inline, inline-block

| | `block` | `inline` | `inline-block` |
|---|---|---|---|
| skládá se | pod sebe | v řádku jako slovo | v řádku jako slovo |
| šířka | celý rodič | podle textu | podle obsahu nebo `width` |
| `width`, `height` | ano | ne | ano |
| svislý margin a padding odsouvají okolí | ano | ne | ano |
| může se rozdělit na víc řádků | ne | ano | ne |

| skrytí | místo | klik a klávesnice |
|---|---|---|
| `display: none`, atribut `hidden` | uvolní | ne |
| `visibility: hidden` | drží | ne |

## Slévání marginů

- Slévají se jen **svislé** marginy bloků v normálním toku: sousedé, rodič s prvním/posledním dítětem, prázdný blok.
- Výsledek: největší kladný + nejzápornější záporný (`24px` a `16px` → 24 px, `24px` a `-8px` → 16 px).
- Neslévají se: vodorovné marginy, flex a grid položky, `float`, `absolute`, rodič s `padding`/`border` na té straně nebo s vlastním [[blokový formátovací kontext|blokovým formátovacím kontextem]].

| co založí BFC | vedlejší efekt |
|---|---|
| `display: flow-root` | žádný |
| `display: inline-block` | prvek teče v řádku |
| `overflow: hidden` / `auto` / `scroll` | ořízne stíny a obrysy, posuvníky |
| `float`, `position: absolute` / `fixed` | vytáhne z normálního toku |

## Přetečení

| hodnota `overflow` | co udělá |
|---|---|
| `visible` (výchozí) | obsah přeteče a je vidět |
| `hidden` | ořízne, založí BFC |
| `clip` | ořízne, BFC nezaloží |
| `auto` | ořízne, posuvník jen při přetečení |
| `scroll` | ořízne, posuvník vždy |

## Vzory

Reset na začátku stylopisu.

```css
*, *::before, *::after { box-sizing: border-box; }
img { max-inline-size: 100%; block-size: auto; }
```

Sloupec stránky uprostřed.

```css
.page { max-inline-size: 44rem; margin-inline: auto; padding-inline: 1rem; }
```

Stack: mezery mezi dětmi drží rodič.

```css
.stack > * { margin-block: 0; }
.stack > * + * { margin-block-start: var(--stack-space, 1rem); }
```

Karta, ze které neutečou marginy ani plovoucí obrázek.

```css
.card { display: flow-root; }
```

Dlouhé adresy a široká tabulka.

```css
.comment { overflow-wrap: anywhere; }
.table-wrap { overflow-x: auto; }
```

Jeden řádek se třemi tečkami.

```css
.card__title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
```

Obrázek ve výřezu.

```css
.thumb img { inline-size: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
```

Obtékaný obrázek v článku.

```css
.article__figure { float: inline-start; max-inline-size: 45%; margin-inline-end: 1rem; }
```

## Pasti

- `width: 100%` s paddingem bez `border-box` nebo s marginem → přeteče rodiče.
- `height` na kartě s textem → text vyteče. Použij `min-block-size`.
- `height`, `width`, `margin-top` na `a` nebo `span` → nic. Potřebuje `inline-block`.
- Proužek pod obrázkem → `display: block` nebo `vertical-align: top`.
- Mezery mezi `inline-block` prvky → mezery v HTML; řadu dělej flexboxem.
- `hidden` + třída s `display: block` → prvek je vidět. `[hidden] { display: none !important; }`.
- Nadpis v kartě bez paddingu posune celou kartu → `display: flow-root` nebo `padding-block`.
- Přepnutí na flex nebo grid zdvojnásobí mezery → marginy vynuluj, použij `gap`.
- `overflow: hidden` jako oprava marginů → useknutý stín, obrys, přesahující prvek.
- `text-overflow: ellipsis` bez `nowrap`, `overflow` nebo na řádkovém prvku → žádné tečky.
- `max-width: 100%` bez `height: auto` u obrázku s atributy → zdeformovaný obrázek.
- `overflow-x: hidden` na `body` → problém jen schovaný.
