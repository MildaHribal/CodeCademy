**`position` rozhoduje o dvou věcech: jestli prvek zabírá místo v toku a vůči čemu se měří jeho `top`, `right`, `bottom` a `left`.**

## Pět hodnot `position`

| hodnota | zabírá místo v toku? | měří se od… | typické použití |
|---|---|---|---|
| `static` (výchozí) | ano | ničeho, `top` nepůsobí | běžný obsah |
| `relative` | ano | vlastní původní polohy | opěrný bod pro `absolute`, drobný posun |
| `absolute` | ne | nejbližšího pozicovaného předka | štítek v rohu, vrstva přes obsah |
| `fixed` | ne | okna (pokud předek nemá `transform`, `filter`, `backdrop-filter`, `will-change: transform`) | plovoucí tlačítko, lišta, panel |
| `sticky` | ano | posuvného kontejneru, jen při rolování | hlavička, lišta filtrů, nadpisy skupin |

- `inset: 0` = `top: 0; right: 0; bottom: 0; left: 0`; logicky `inset-inline` a `inset-block`.
- Absolutní prvek bez šířky je široký podle obsahu; s protilehlými stranami (`left` i `right`) se mezi ně roztáhne.
- Procenta v `top` a `left` se počítají z obsahujícího bloku — a ten sahá po vnitřní hranu rámečku, takže padding předka do plochy patří.

## Tři podmínky pro `sticky`

1. Má aspoň jeden `top`, `right`, `bottom` nebo `left`.
2. Nejbližší [[posuvný kontejner]] opravdu roluje — `overflow: hidden`, `auto` i `scroll` (i jen v jednom směru) ho vyrobí; `overflow: clip` ne.
3. Rodič je vyšší než prvek. Roztaženou položku flexboxu nebo gridu zkrátí `align-self: start`.

## Vrstvy

Pořadí vykreslení v jednom [[stacking context|stacking contextu]] odspodu nahoru: pozadí kořene kontextu → záporný `z-index` → bloky v toku → pozicované prvky se `z-index: auto` nebo `0` v pořadí HTML → kladný `z-index` od nejnižšího.

| co zakládá stacking context | poznámka |
|---|---|
| `position: relative` / `absolute` s číselným `z-index` | i `z-index: 0` |
| `position: fixed` a `sticky` | vždycky, i bez `z-index` |
| položka flexboxu nebo gridu s číselným `z-index` | i bez `position` |
| `opacity` menší než 1 | i `0.99` |
| `transform`, `translate`, `rotate`, `scale` jiné než `none` | i `translate: 0 0` |
| `filter`, `backdrop-filter`, `clip-path`, `mask`, `mix-blend-mode` | |
| `isolation: isolate`, `contain: layout` nebo `paint` | `isolate` nedělá nic jiného |

`z-index` působí jen na pozicované prvky a na položky flexboxu a gridu. Uvnitř kontextu se čísla porovnávají jen mezi sebou; navenek je celý kontext jedna vrstva.

```css
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
}
```

## Vzory

Štítek v rohu karty.

```css
.card { position: relative; }
.card__badge { position: absolute; top: 0.75rem; left: 0.75rem; }
```

Přilepená hlavička nad obsahem a cíl odkazu, který se pod ni neschová.

```css
.site-header { position: sticky; top: 0; z-index: var(--z-sticky); }
h2 { scroll-margin-top: 5rem; }
```

Klikací celá karta z odkazu v nadpisu.

```css
.card { position: relative; }
.card__link::after { content: ""; position: absolute; inset: 0; }
```

Dekorace za obsahem komponenty.

```css
.promo { position: relative; isolation: isolate; }
.promo::before { content: ""; position: absolute; inset: 0; z-index: -1; }
```

Nabídka bez JavaScriptu v [[top layer]], ukotvená k tlačítku.

```html
<button popovertarget="menu" aria-label="Akce u faktury">⋯</button>
<div id="menu" popover>…</div>
```

```css
.more { anchor-name: --more; }
#menu {
  position-anchor: --more;
  position-area: bottom span-left;
  position-try-fallbacks: flip-block;
  margin-top: 0.5rem;
}
#menu:popover-open { display: grid; }
.share-panel::backdrop { background: rgb(15 23 42 / 0.5); }
```

Přesná poloha a rozměr podle kotvy.

```css
.suggestions {
  position: absolute;
  position-anchor: --search;
  top: calc(anchor(bottom) + 4px);
  left: anchor(left);
  width: anchor-size(width);
}
```

## Popover a `<dialog>`

| | `popover` | modální `<dialog>` |
|---|---|---|
| vrstva | top layer | top layer |
| stránka pod ním | aktivní | neaktivní |
| fokus při otevření | zůstane na tlačítku | přesune se dovnitř |
| zavření kliknutím mimo a Esc | `auto` ano, `manual` ne | jen Esc a tlačítko |
| na co | nabídky, tooltipy, výběry, oznámení | potvrzení, formulář k vyřízení |

`popovertargetaction`: `toggle` (výchozí), `show`, `hide`.

## Pasti

- Štítek v rohu stránky místo v rohu karty → karta potřebuje `position: relative`.
- Rodič bez výšky, protože jeho jediné dítě je `absolute` → dej rodiči výšku nebo `aspect-ratio`.
- `fixed` jezdí s obsahem → předek má `transform`, `filter`, `backdrop-filter` nebo `will-change: transform`.
- `z-index: 9999` nepomáhá → hledej nejbližšího předka, který zakládá stacking context.
- Nabídka zajede pod sousedku jen při najetí myší → hover efekt přidal `translate` nebo `scale`; vrstvu dostane karta, ne nabídka.
- Dekorace se `z-index: -1` zmizela pod pozadím rodiče → rodiči chybí `isolation: isolate`.
- Zavřený popover je vidět → vlastní `display` přebil `display: none`; patří do `:popover-open`.
- Všechny nabídky se otevírají u posledního tlačítka → sdílené `anchor-name`; jméno dej každé dvojici zvlášť, třeba z custom property v `style`.
- Ukotvený prvek s `position: absolute` se vejde jen do svého obsahujícího bloku; u tooltipu v nízké liště pomůže `position: fixed` nebo popover.
- Absolutně pozicovaná kotva musí být v HTML před ukotveným prvkem, když mají stejný obsahující blok.
