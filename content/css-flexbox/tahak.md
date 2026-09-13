# Tahák: CSS Flexbox

**Flex kontejner rozvrhuje své přímé potomky za sebou podél jedné osy a rozhoduje, co s volným místem.** `display: flex` patří vždycky na **rodiče** prvků, které rozvrhuješ.

## Osy

| `flex-direction` | [[hlavní osa]] | [[vedlejší osa]] |
|---|---|---|
| `row` (výchozí) | zleva doprava | shora dolů |
| `column` | shora dolů | zleva doprava |
| `row-reverse` / `column-reverse` | opačně | beze změny |

## Zarovnání: kdo co dělá

| vlastnost | kam patří | osa | co řídí | výchozí |
|---|---|---|---|---|
| `justify-content` | kontejner | hlavní | kam jde [[volné místo]] mezi položkami a na krajích | `flex-start` |
| `align-items` | kontejner | vedlejší | zarovnání položek uvnitř řádku | `stretch` |
| `align-content` | kontejner | vedlejší | volné místo mezi **řádky** (jen s `flex-wrap: wrap` a víc řádky) | `normal` (jako `stretch`) |
| `align-self` | položka | vedlejší | zarovnání jedné položky, přebije `align-items` | `auto` |
| `margin-*: auto` | položka | obě | sežere všechno volné místo na své straně, dřív než `justify-content` | — |

Hodnoty `justify-content`: `flex-start`, `flex-end`, `center`, `space-between` (jen mezi), `space-around` a `space-evenly` (i na krajích).
Hodnoty `align-items` / `align-self`: `stretch`, `flex-start`, `center`, `flex-end`, `baseline`.

## Velikost položky: `flex: <grow> <shrink> <basis>`

1. Sečti `flex-basis` všech položek a `gap`.
2. Zbývá místo → rozděl ho podle `flex-grow`. Chybí místo → uber podle `flex-shrink` × basis.
3. Nikdy pod `min-width` (výchozí `auto` = [[nejmenší šířka obsahu]]).

| zápis | znamená | kdy |
|---|---|---|
| (nic) | `0 1 auto` | velikost podle obsahu |
| `flex: 1` | `1 1 0%` | stejně široké položky, obsah nerozhoduje, `width` přestane platit |
| `flex: auto` | `1 1 auto` | roste z velikosti obsahu |
| `flex: none` | `0 0 auto` | nikdy neroste ani se nezmenšuje |
| `flex: 1 1 15rem` | roste, zmenší se, začíná na 15rem | karty v řadě |

## Vzory

Hlavička: logo a navigace vlevo, tlačítko vpravo, na úzké obrazovce zalomení.

```css
.site-header { display: flex; align-items: center; flex-wrap: wrap; gap: 1.5rem; }
.logo { flex-shrink: 0; }
.site-header .button { margin-inline-start: auto; }
```

Vycentrovat v obou osách.

```css
.center { display: flex; justify-content: center; align-items: center; }
```

Řada karet, která se zalamuje bez media dotazu.

```css
.cards { display: flex; flex-wrap: wrap; gap: 1.5rem; }
.card { flex: 1 1 15rem; min-width: 0; }
```

Karta jako sloupec s patičkou u dna a malým štítkem.

```css
.card { display: flex; flex-direction: column; }
.card__badge { align-self: flex-start; }
.card__footer { margin-block-start: auto; }
```

Položka s dlouhým textem vedle ikony a tlačítka.

```css
.file { display: flex; align-items: center; gap: 0.75rem; }
.file__icon { flex: none; }
.file__info { flex: 1 1 auto; min-width: 0; }
.file__name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
```

Navigace přes celý řádek jen na úzké obrazovce.

```css
@media (max-width: 40rem) {
  .main-nav { flex-basis: 100%; order: 1; }
}
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| odkazy v menu pořád pod sebou | flex je na `<li>` nebo na prarodiči | flex na přímého rodiče (`<ul>`) |
| `align-items: center` nic nedělá | kontejner nemá výšku navíc | dej kontejneru výšku (`min-height`) |
| ve sloupci `justify-content: center` centruje svisle | osy se otočily | vodorovně centruje `align-items` |
| obrázek vedle textu natažený do výšky | `height: auto` + výchozí `stretch` | `align-items: flex-start` nebo `align-self` |
| položka se odmítá zmenšit, přetéká | `min-width: auto` a nezalomitelný obsah | `min-width: 0` na flex položce |
| `flex-grow: 2` není dvakrát širší | grow dělí jen volné místo | basis `0` (`flex: 2` vs. `flex: 1`) |
| `width` jako by neplatila | `flex: 1` nastavil basis na nulu | `flex: 1 1 15rem` místo `flex: 1` + `width` |
| štítky přetékají z řádku | výchozí `flex-wrap: nowrap` | `flex-wrap: wrap` na kontejneru |
| Tab skáče po stránce | `order` mění jen vizuální pořadí | přesuň prvek v HTML |
| poslední řádek karet je širší než ostatní | flexbox počítá každý řádek zvlášť | grid se sloupci |
