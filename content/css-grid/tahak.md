**Grid kontejner nejdřív narýsuje mřížku z řádků a sloupců a teprve pak do ní skládá své přímé potomky.** Rozvržení píšeš na [[grid kontejner]], ne na každou položku.

## Velikost stop

| zápis | znamená |
|---|---|
| `200px`, `15rem`, `30%` | pevná stopa; procenta z celé šířky, mezery se přičtou navíc |
| `1fr` | díl místa, které zbude po pevných stopách a `gap`; = `minmax(auto, 1fr)` |
| `minmax(0, 1fr)` | díl zbylého místa, který se smí zmenšit pod obsah |
| `auto` | podle obsahu; volné místo se mezi stopy `auto` rozdělí |
| `repeat(3, 1fr)` | tři stejné sloupce |
| `repeat(auto-fill, minmax(15rem, 1fr))` | tolik sloupců, kolik se vejde, prázdné zůstanou |
| `repeat(auto-fit, minmax(15rem, 1fr))` | totéž, prázdné sloupce se sbalí a položky roztáhnou |

Výpočet `fr`: (šířka − pevné stopy − mezery) ÷ součet `fr`.
Počet sloupců u `auto-fill`: ⌊(šířka + gap) ÷ (minimum + gap)⌋, aspoň 1.

## Umístění položky

| zápis | co udělá |
|---|---|
| `grid-column: 1 / 3` | od čáry 1 po čáru 3, tedy přes dva sloupce |
| `grid-column: 1 / -1` | přes celou [[explicitní mřížka|explicitní mřížku]] |
| `grid-column: span 2` | přes dva sloupce tam, kam by položka spadla sama |
| `grid-area: main` | do oblasti pojmenované v `grid-template-areas` |
| `grid-auto-rows: 10rem` | výška řádků, které grid přidá sám |
| `grid-auto-flow: dense` | zaplní díry pozdějšími položkami (mění pořadí pro oko) |

## Zarovnání v gridu

| vlastnost | kam patří | směr | výchozí |
|---|---|---|---|
| `justify-items` | kontejner | řádkový, vodorovně | `stretch` (u většiny položek) |
| `align-items` | kontejner | blokový, svisle | `stretch` |
| `place-items: <align> <justify>` | kontejner | obojí, první hodnota svisle | — |
| `justify-self`, `align-self` | položka | jako výš, jen pro jednu položku | `auto` |
| `justify-content`, `align-content` | kontejner | kam jde volné místo, když jsou stopy menší než kontejner | `normal` |

## Grid, nebo flexbox

| vzor | nástroj |
|---|---|
| kostra stránky, dashboard | grid s oblastmi |
| mřížka karet, galerie | grid s `auto-fill` |
| formulář s popisky ve sloupci | grid `auto 1fr` |
| hlavička, lišta tlačítek, štítky | flexbox (`flex-wrap`) |
| obsah karty pod sebou | grid nebo flexbox s `gap` |
| části sousedních karet na stejné výšce | [[subgrid]] |

## Vzory

Kostra aplikace s posuvným obsahem.

```css
.app {
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "player player";
  block-size: 100dvh;
}
.main { grid-area: main; overflow-y: auto; }
```

Stejná kostra na telefonu, bez změny HTML.

```css
@media (max-width: 48rem) {
  .app {
    grid-template-columns: 1fr;
    grid-template-areas: "header" "main" "sidebar" "player";
    block-size: auto;
  }
}
```

Mřížka karet bez media dotazu.

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(15rem, 100%), 1fr));
  gap: 1.5rem;
}
```

Široká karta jen tam, kde se vejdou dva sloupce.

```css
@media (min-width: 41rem) {
  .card--featured { grid-column: span 2; }
}
```

Karty zarovnané napříč přes subgrid.

```css
.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
}
```

Stránka s patičkou dole (pancake).

```css
.page {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-block-size: 100dvh;
}
```

Vycentrovat cokoli.

```css
.center { display: grid; place-items: center; }
```

## Pasti

- **Sloupec `1fr` se roztáhne** kvůli tabulce, `<pre>` nebo dlouhé URL → `minmax(0, 1fr)`.
- **`repeat(3, 33.33%)` s `gap` přeteče** → `repeat(3, 1fr)`.
- **Neplatná šablona oblastí** (oblast není obdélník, řetězce mají různý počet buněk) se tiše zahodí celá.
- **Nafouklá hlavička** v kontejneru s výškou → vypiš řádky `auto 1fr auto`.
- **`1 / -1` nevede přes automaticky přidané řádky** → vypiš řádky, nebo `span`.
- **`minmax(20rem, 1fr)` na telefonu přeteče** → `minmax(min(20rem, 100%), 1fr)`.
- **`auto-fit` s jediným výsledkem** roztáhne kartu přes celou šířku → `auto-fill`.
- **`span 2` v mřížce s jedním sloupcem** přidá sloupec navíc → zapni až od šířky, kde se vejdou dva.
- **Subgrid bez `grid-row: span N`** → všechny části přes sebe v jednom řádku.
- **Poměr stran v buňce, která má výšku od mřížky**, roztáhne sloupec → `aspect-ratio: auto`.
- **`dense`** přehází pořadí pro oko, klávesnice jde dál podle HTML.
- **Grid a flex položky se roztahují** → `justify-self: start` na tlačítku.
