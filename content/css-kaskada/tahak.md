## Žebříček [[kaskáda|kaskády]]

Rozhodne první řádek, ve kterém se dvě deklarace liší.

| pořadí | kritérium | vyhraje |
|---|---|---|
| 1 | původ a důležitost | autorský styl nad prohlížečem; `!important` nad běžnou deklarací |
| 2 | inline styl | atribut `style` nad stylopisem |
| 3 | vrstvy `@layer` | běžné: pozdější vrstva, styl mimo vrstvy nejvíc; `!important`: dřívější vrstva |
| 4 | specificita | vyšší trojice (A, B, C), porovnání zleva |
| 5 | pořadí ve zdroji | deklarace, která je v CSS později |

## [[specificita|Specificita]] (A, B, C)

| část selektoru | sloupec |
|---|---|
| id `#cart` | A |
| třída `.card`, atribut `[type="email"]`, pseudotřída `:hover` | B |
| typ `li`, pseudoelement `::before` | C |
| `*`, kombinátory mezera `>` `+` `~` | nic |
| `:is()`, `:not()`, `:has()` | nejsilnější argument |
| `:where()` | vždy nula |
| vnořené pravidlo | jako `:is(rodič)` + zbytek |

| selektor | (A, B, C) |
|---|---|
| `.nav a` | (0, 1, 1) |
| `nav ul li a` | (0, 0, 4) |
| `#header .logo` | (1, 1, 0) |
| `:is(#main, .content) p` | (1, 0, 1) |
| `:where(#main, .content) p` | (0, 0, 1) |

Sloupce se nepřelévají: (0, 11, 0) < (1, 0, 0).

## Dědičnost a klíčová slova

| dědí se | nedědí se |
|---|---|
| `color`, `font-*`, `line-height`, `letter-spacing`, `text-align`, `list-style`, `cursor`, `visibility`, `--tokeny` | `margin`, `padding`, `border`, `background`, `width`, `height`, `display`, `opacity`, `transform` |

| klíčové slovo | co udělá |
|---|---|
| `inherit` | hodnota rodiče (i u nedědičné vlastnosti) |
| `initial` | počáteční hodnota ze specifikace (`display` → `inline`) |
| `unset` | dědičná → `inherit`, nedědičná → `initial` |
| `revert` | hodnota z výchozích stylů prohlížeče |
| `revert-layer` | hodnota z dřívějších vrstev |

Zděděná hodnota prohraje s **každou** deklarací, i s výchozím stylem prohlížeče.

## Vzory

Pořadí vrstev na začátku stylů:

```css
@layer reset, base, components, utilities;
```

Reset s nulovou specificitou a písmo pro formuláře:

```css
@layer reset {
  :where(ul[class]) { margin: 0; padding: 0; list-style: none; }
  button, input, select, textarea { font: inherit; }
}
```

Komponenta s variantami a stavy ve vnořeném CSS:

```css
.btn {
  background: var(--btn-bg, gray);

  &[data-variant="primary"] { --btn-bg: teal; }
  &:hover { --btn-bg: darkcyan; }
  &:focus-visible { outline: 3px solid teal; }
  &:is(:disabled, [aria-disabled="true"]) { opacity: 0.5; }
}
```

Obal pole podle stavu pole a fokusu:

```css
.field:focus-within { background: #eef2ff; }
.field:has(:user-invalid) { border-color: #dc2626; }
```

Kvantitní dotaz — seznam s aspoň pěti položkami:

```css
.tags:has(> :nth-child(5)) .tag { font-size: 0.75rem; }
```

Styl jen pro část stránky, bez vnořeného obsahu:

```css
@scope (.product-card) to (.product-card__description) {
  img { border-radius: 0.5rem; }
}
```

## Pasti

- **Styl mimo vrstvy** přebije všechny vrstvy — prodlužování selektoru utility nepomůže.
- **`!important` ve vrstvě resetu** vyhraje nad `!important` v pozdějších vrstvách.
- **Pořadí vrstev** určuje první zmínka, ne řádek s pořadím napsaný pozdě.
- **Modifikátor nad základní třídou** prohraje — pořadí tříd v atributu `class` nerozhoduje.
- **Id v `:is()` nebo v rodičovském seznamu** zvedne specificitu i tam, kde id není.
- **Mezera za `&`** z varianty udělá potomka: `& .is-open` ≠ `&.is-open`. `&__title` je neplatné.
- **Jeden neplatný selektor** v seznamu odděleném čárkou zahodí celé pravidlo.
- **`:invalid`** svítí hned po načtení, chyby ukazuj přes `:user-invalid`.
- **`initial` není výchozí vzhled** prohlížeče; pro ten je `revert`.
- **`line-height` s jednotkou** se dědí jako pixely — piš ho bez jednotky.
