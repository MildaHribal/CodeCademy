**CSS je seznam pravidel „těmhle prvkům nastav tyhle vlastnosti" a prohlížeč z něj použije jen to, čemu rozumí.** Neplatnou deklaraci tiše zahodí, ostatní v pravidle platí dál.

## Pravidlo a kam ho napsat

```css
.price {              /* selektor */
  color: #b91c1c;     /* deklarace: vlastnost: hodnota; */
}
```

| kam | zápis | kdy |
|---|---|---|
| soubor | `<link rel="stylesheet" href="styles.css">` v `<head>` | výchozí volba |
| blok ve stránce | `<style>…</style>` | jedna stránka, e-mail |
| atribut | `style="color: red"` | výjimečně; vyhraje nad stylopisem, nejde v něm `:hover` |

## Selektory

| zápis | vybere |
|---|---|
| `p`, `.card`, `#cart`, `*` | typ, třída, id, všechno |
| `button.primary`, `.a.b` | jeden prvek, pro který platí všechny části |
| `h1, h2` | skupina: kterýkoli (jeden neplatný selektor zahodí celé pravidlo) |
| `[type="email"]`, `[href^="https://"]`, `[href$=".pdf" i]`, `[href*="mapy"]` | atribut: je, začíná, končí (bez ohledu na velikost písmen), obsahuje |
| `A B` / `A > B` / `A + B` / `A ~ B` | potomek kdekoli / přímé dítě / sourozenec hned za / kdekoli za |
| `:hover`, `:focus-visible`, `:disabled`, `:checked` | stav |
| `:first-child`, `:nth-child(2n)`, `:nth-child(-n+3)`, `:nth-child(2 of .item)` | pozice mezi **všemi** sourozenci |
| `::before`, `::after` | vložený obsah, vznikne jen s `content` |

Pojmenování tříd podle BEM: blok `.card`, element `.card__title`, modifikátor `.card--featured`.

## Jednotky: vůči čemu

| jednotka | 1 = | použití |
|---|---|---|
| `px` | pevný CSS pixel | tloušťka rámečku, jemný stín |
| `rem` | písmo kořene stránky (výchozí 16 px) | velikost písma, rozestupy |
| `em` | písmo prvku; u `font-size` písmo **rodiče** | odsazení uvnitř komponenty, odsazení podtržení |
| `%` | `width`: šířka rodiče; `padding`/`margin`: šířka rodiče i nahoře; `height`: výška rodiče, jen když ji má pevnou | proporce vůči rodiči |
| `vw`, `vh` | 1 % šířky, výšky okna | plynulé hodnoty |
| `dvh`, `svh`, `lvh` | 1 % výšky okna s lištou podle stavu, s lištou vidět, bez lišty | sekce přes celou výšku telefonu |
| `ch` | šířka znaku „0" | [[délka řádku]] |

| funkce | vrátí |
|---|---|
| `calc(100% - 2rem)` | výpočet; kolem `+` a `-` mezery |
| `min(100%, 40rem)` | menší hodnotu = „nejvýš" |
| `max(1rem, 3vw)` | větší hodnotu = „aspoň" |
| `clamp(1.75rem, 1rem + 3vw, 3rem)` | ideál mezi minimem a maximem |

## Barvy

| zápis | příklad |
|---|---|
| hex | `#1e293b`, zkráceně `#fff` |
| `rgb()` s průhledností | `rgb(15 23 42 / 0.08)` |
| `hsl()` odstín, sytost, světlost | `hsl(262 83% 58%)` |
| `oklch()` světlost, sytost, odstín podle vnímání oka | `oklch(55% 0.2 280)` |
| míchání | `color-mix(in oklch, var(--color-accent) 15%, white)` |

## DevTools: jak vypadá deklarace

| v panelu Styles | znamená |
|---|---|
| pravidlo u prvku chybí | selektor na prvek nemíří |
| přeškrtnutá s ikonou varování | neplatná, prohlížeč ji zahodil |
| přeškrtnutá bez ikony | přebitá, vítěz je výš v panelu |
| bledá s ikonou ⓘ | platí, ale na prvek nemá účinek |

Panel **Computed** ukazuje [[spočtená hodnota|spočtenou hodnotu]] v pixelech a `rgb()` a po rozbalení, odkud přišla. Tlačítko **:hov** vynutí stav `:hover` nebo `:focus-visible`.

## Vzory

Stylopis s tokeny.

```css
:root {
  --color-text: #1c2024;
  --color-accent: #0f766e;
  --color-accent-soft: color-mix(in oklch, var(--color-accent) 14%, white);
  --space-s: 0.5rem;
  --space-m: 1.25rem;
  --space-xl: 2.5rem;
  --font-size-base: 1.125rem;
}
```

Tmavá komponenta přepsáním tokenů na jejím prvku.

```css
.panel {
  --color-text: #f8fafc;
  --color-accent: #93c5fd;
}
```

Čitelný text článku.

```css
body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: var(--font-size-base);
  line-height: 1.6;
}

.article {
  max-width: 65ch;
  margin-inline: auto;
  hyphens: auto;
}

.article h2 {
  margin: var(--space-xl) 0 var(--space-s);
  line-height: 1.2;
  text-wrap: balance;
}
```

Plynulý titulek.

```css
.title {
  font-size: clamp(2rem, 1.25rem + 3vw, 3rem);
}
```

Karta se stínem s hloubkou.

```css
.card {
  border: 1px solid rgb(15 23 42 / 0.08);
  border-radius: 1.5rem;
  background-color: white;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 16px 40px rgb(15 23 42 / 0.12);
}
```

Stavy odkazu pro myš i klávesnici.

```css
.button:hover {
  background-color: hsl(262 83% 48%);
}

.button:focus-visible {
  outline: 3px solid hsl(262 83% 58%);
  outline-offset: 3px;
}
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| styl se neprojeví, žádná chyba | překlep ve třídě nebo tečka v `class=".card"` | porovnej selektor s HTML v DevTools |
| `font-size: 18;` nic nedělá | délka bez jednotky | `1.125rem`; bez jednotky jen `0` |
| zmizely dvě deklarace najednou | chybí středník | středník za každou deklarací |
| `calc(100%-2rem)` nefunguje | chybí mezery kolem `-` | `calc(100% - 2rem)` |
| rámeček není vidět | zkratka `border` bez stylu | `border: 1px solid …` |
| přechod v `background-color` nic nedělá | přechod je obrázek | `background-image: linear-gradient(…)` |
| vnořené menu má čím dál menší písmo | `em` u `font-size` se násobí | `rem` |
| potomci mají nalepené řádky | `line-height` v `px` nebo `%` se dědí jako pixely | číslo bez jednotky |
| `p:first-child` nevybere první odstavec | před ním je nadpis, počítají se všichni sourozenci | `h2 + p` nebo `p:first-of-type` |
| stav `.btn--disabled` nepřebije styl | pravidlo pro tlačítko je přes id | styluj třídami |
| `::before` se neukáže | chybí `content` | `content: ""` |
| `var(--gap)px` nedá mezeru | jednotka se k `var()` nepřilepí | jednotka v tokenu nebo `calc(var(--gap) * 1px)` |
| fallback ve `var()` nepomohl | proměnná existuje, jen má špatnou hodnotu | oprav definici |
| přepsaný token platí jen pro kousek stránky | přepsán na potomkovi nebo sourozenci | přepiš ho na prvku, pod kterým má platit |
| obrys fokusu zmizel i pro klávesnici | `outline: none` na `:focus` | vlastní obrys do `:focus-visible` |
