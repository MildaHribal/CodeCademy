**[[přechod|Přechod]] dopočítá změnu mezi dvěma stavy, animace s [[klíčové snímky|klíčovými snímky]] přehraje celý průběh sama.** Pohyb animuj přes transformace, objevení přes `opacity` a pro lidi s omezeným pohybem odeber pohyb, ne zpětnou vazbu.

## `transition`: vlastnost, délka, křivka, zpoždění

| zápis | znamená |
|---|---|
| `transition: translate 200ms ease-out` | posun za 200 ms, rychlý start |
| `transition: opacity 300ms ease-in 100ms` | první čas délka, druhý zpoždění |
| `transition: color 150ms, scale 150ms` | víc vlastností čárkou |
| `transition: display 250ms allow-discrete` | `display` se přepne až na konci |
| `transition-delay: 100ms` | jen zpoždění, zbytek zůstane |

Délky: drobné prvky 150–300 ms, velké plochy 300–500 ms. `ease-out` na reakci a příchod, `ease-in` na odchod, `linear` na točení a barvy.

## [[transformace|Transformace]]

| vlastnost | příklad | pozor |
|---|---|---|
| `translate` | `translate: 0 -6px` | procenta z velikosti prvku |
| `scale` | `scale: 1.05`, `scale: 0 1` | kolem `transform-origin` |
| `rotate` | `rotate: 45deg`, `0.5turn` | kolem `transform-origin` |
| `transform` | `transform: translate(-50%, -50%) scale(1.1)` | nová hodnota nahradí celý seznam |

Pořadí použití: `translate`, `rotate`, `scale`, pak `transform`. Řádkový `<span>` a `<a>` transformovat nejde (dej `display: inline-block`).

## [[cesta k pixelům|Cesta k pixelům]]

| animuješ | začíná znovu od | cena |
|---|---|---|
| `width`, `height`, `margin`, `padding`, `top`, `left`, `flex-basis` | rozvržení | drahé |
| `color`, `background-color`, `box-shadow`, gradient | kreslení | střední |
| `transform`, `translate`, `scale`, `rotate`, `opacity` | skládání | levné |

DevTools: Performance (bloky Layout), Rendering → Paint flashing a emulace `prefers-reduced-motion`.

## `animation`

| dílčí vlastnost | hodnoty | výchozí |
|---|---|---|
| `animation-duration` | `800ms` | `0s` |
| `animation-timing-function` | `linear`, `steps(12)`, `cubic-bezier()`, `linear()` | `ease` |
| `animation-delay` | `1s`, záporné = už kus uběhlo | `0s` |
| `animation-iteration-count` | `3`, `infinite` | `1` |
| `animation-direction` | `reverse`, `alternate` | `normal` |
| [[animation-fill-mode]] | `backwards` (během zpoždění), `forwards` (po konci), `both` | `none` |
| `animation-play-state` | `paused` | `running` |

Křivka platí pro každý úsek mezi snímky zvlášť.

## Vzory

Karta, která se zvedne myší i klávesnicí.

```css
.card { transition: translate 250ms ease-out; }
.card:is(:hover, :focus-within) { translate: 0 -6px; }
```

Popover, který se prolne při otevření i zavření.

```css
.menu {
  opacity: 0;
  transition: opacity 200ms, display 200ms allow-discrete, overlay 200ms allow-discrete;
}
.menu:popover-open { opacity: 1; }
@starting-style {
  .menu:popover-open { opacity: 0; }
}
```

Načítací kolečko.

```css
.spinner { animation: spin 800ms linear infinite; }
@keyframes spin { to { rotate: 1turn; } }
```

Gradient s animovaným úhlem přes [[@property]].

```css
@property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
.card { animation: orbit 3s linear infinite; }
@keyframes orbit { to { --angle: 360deg; } }
```

View transition s detekcí podpory.

```js
if (!document.startViewTransition) update();
else document.startViewTransition(update);
```

Odhalení při scrollu jako progresivní vylepšení.

```css
@supports (animation-timeline: view()) {
  .card {
    animation: reveal linear both;
    animation-timeline: view();
    animation-range: entry;
  }
}
@keyframes reveal { from { opacity: 0; translate: 0 2rem; } }
```

Omezený pohyb: pohyb pryč, zpětná vazba zůstane.

```css
@media (prefers-reduced-motion: reduce) {
  .card:is(:hover, :focus-within) { translate: none; }
  .spinner { animation: pulse 1s ease-in-out infinite alternate; }
}
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| najetí plynulé, odjezd skokem | `transition` jen v `:hover` | přechod do základního pravidla |
| štítek při najetí uskočí | `transform` v `:hover` nahradil centrování | samostatné `translate` a `scale` |
| šipka v odkazu se nehýbe | řádkový prvek transformovat nejde | `display: inline-block` |
| popover se otevře skokem | chybí `@starting-style` nebo stojí před pravidlem | `@starting-style` pod otevřený stav |
| popover se zavře skokem | `display` bez `allow-discrete` | `display … allow-discrete` |
| zavřený popover je vidět | `display` v základním pravidle přebil skrytí | `display` jen do `:popover-open` |
| prvek po animaci skočí zpátky | chybí `forwards` | `animation-fill-mode: forwards` |
| animace zadrhává na každém snímku | `ease-in-out` na každém úseku | `linear` nebo křivka ve snímku |
| gradient s úhlem v custom property stojí | neregistrovaná vlastnost je text, přepne se skokem v půlce | `@property` s `syntax` |
| scroll ukazatel je hned celý | `animation` pod `animation-timeline` ho resetoval | `animation-timeline` pod `animation` |
| view transition se nespustí | stejné `view-transition-name` dvakrát | jméno z `id` položky |
| sekce bez podpory prázdné | `opacity: 0` v základním stylu | počáteční stav jen do snímku `from` |
| stránka žere paměť | `will-change` na všem | smazat, prohlížeč vrstvy vytváří sám |
