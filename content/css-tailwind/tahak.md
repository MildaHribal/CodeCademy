Rychlý přehled Tailwindu v4: co která třída znamená, odkud bere hodnotu a kdy sáhnout
po něčem jiném.

## Utilita = jedna deklarace nad tokenem

| třída | vygenerované CSS | spočtená hodnota |
|---|---|---|
| `p-4` | `padding: calc(var(--spacing) * 4)` | 16 px (`--spacing` je 0.25rem) |
| `px-6` | `padding-inline: calc(var(--spacing) * 6)` | 24 px vlevo i vpravo |
| `w-64` | `width: calc(var(--spacing) * 64)` | 256 px |
| `rounded-lg` | `border-radius: var(--radius-lg)` | 8 px |
| `text-sm` | `font-size: var(--text-sm)` a řádkování k ní | 14 px / 20 px |
| `bg-sky-500` | `background-color: var(--color-sky-500)` | barva v `oklch()` |
| `flex` | `display: flex` | — |

**Číslo je násobek čtvrt remu, ne pixely.** `pt-5` je 20 px. Jména utilit kopírují
vlastnosti CSS: `justify-between` je `justify-content: space-between`, `items-center`
je `align-items: center`, `font-bold` je `font-weight: 700`.

## Čtení dlouhého `class`

Ustálené pořadí skupin je **layout → box → typografie → barvy → stavy**:

```html
<a class="inline-flex items-center gap-2
          rounded-full px-4 py-2
          text-sm font-semibold
          bg-emerald-600 text-white
          hover:bg-emerald-700 focus-visible:outline-2">
```

Pořadí tříd v atributu **nemá na výsledek vliv**, jen na čitelnost; v týmu ho srovná
plugin pro Prettier.

## Vrstvy po `@import "tailwindcss"`

```css
@layer theme, base, components, utilities;
```

| vrstva | co v ní je |
|---|---|
| `theme` | tokeny jako proměnné na `:root` (`--spacing`, `--color-sky-500`, `--radius-lg`) |
| `base` | preflight: sjednocení výchozích stylů prohlížečů |
| `components` | prázdná, pro vlastní komponentové třídy |
| `utilities` | vygenerované utility |

Pozdější vrstva vyhrává bez ohledu na specificitu, ale **tvoje CSS mimo vrstvy vyhraje
nad všemi**. Preflight nadpisům vezme velikost i tučnost a seznamům odrážky — není to
chyba, vzhled se dopisuje utilitami (`text-3xl font-bold`, `list-disc pl-5`).

## `@theme` a předpony tokenů

Předpona rozhoduje, jaké utility z proměnné vzniknou:

| předpona | co z ní vznikne | příklad |
|---|---|---|
| `--color-*` | `bg-`, `text-`, `border-`, `ring-`, `fill-` | `--color-znacka` dá `bg-znacka` |
| `--font-*` | `font-` | `--font-nadpis` dá `font-nadpis` |
| `--text-*` | `text-` (velikost písma) | `--text-hero` dá `text-hero` |
| `--spacing` | základ pro `p-`, `m-`, `gap-`, `w-`, `h-` | `--spacing: 0.25rem` |
| `--radius-*` | `rounded-` | `--radius-karta` dá `rounded-karta` |
| `--shadow-*` | `shadow-` | `--shadow-karta` dá `shadow-karta` |
| `--breakpoint-*` | varianta jako `md:` | `--breakpoint-siroko` dá `siroko:` |
| `--container-*` | `max-w-` a varianty container query | `--container-clanek` dá `max-w-clanek` |

```css
@import "tailwindcss";

@theme {
  --color-znacka-50:  #eef6f8;
  --color-znacka-500: #1f6f8b;
  --color-znacka-700: #16505f;
  --font-nadpis: "Bitter", Georgia, serif;
  --text-hero: clamp(2.5rem, 6vw, 4.5rem);
  --radius-karta: 0.75rem;
}
```

Proměnná v `:root` je **jen proměnná** — utilita z ní nevznikne. Proměnná v `@theme` je
obojí: `bg-znacka` i `var(--color-znacka)` v obyčejném CSS, gradientu nebo `@keyframes`.
Odstíny pojmenovávej čísly (`500`, `700`), ne slovy.

## Sémantické tokeny a tmavý motiv

- **primitivní** token pojmenovává barvu: `--color-sediva-100`, `--color-znacka-500`,
- **sémantický** token pojmenovává roli: `--color-plocha`, `--color-text`, `--color-okraj`.

V komponentách se používají **jen sémantické**. Motiv je pak výměna jednoho patra:

```css
@theme {
  --color-bila: #ffffff;
  --color-tmava: #16202b;
  --color-sediva-700: #3b4754;

  --color-plocha: var(--color-bila);
  --color-text: var(--color-tmava);
}

.tmavy {
  --color-plocha: var(--color-sediva-700);
  --color-text: var(--color-bila);
}
```

Karty uvnitř mají pořád stejný `class="bg-plocha text-text"`.

## Přepsání a vypnutí výchozích tokenů

```css
@theme {
  --color-red-500: #d1495b;   /* přepíše vestavěnou bg-red-500 */
  --color-*: initial;         /* zruší celou výchozí paletu */
  --color-znacka: #1f6f8b;    /* a nechá jen tvoje barvy */
}
```

`@theme inline` vloží hodnotu do utility rovnou místo odkazu přes `var()` — potřebné,
když se proměnná někde po cestě mění.

## Varianty

| varianta | kdy platí |
|---|---|
| (žádná) | vždy — základní stav, mobil |
| `sm:` `md:` `lg:` `xl:` `2xl:` | od 640 / 768 / 1024 / 1280 / 1536 px **výš** |
| `max-md:` | do 768 px (opačný směr, výjimečně) |
| `hover:` | myš nad prvkem |
| `focus:` | prvek má fokus, i po kliknutí myší |
| `focus-visible:` | fokus, který má prohlížeč ukázat (klávesnice) |
| `active:`, `disabled:` | stisknutý, vypnutý prvek |
| `first:`, `last:`, `odd:`, `even:` | pozice mezi sourozenci |
| `dark:` | tmavý motiv |
| `motion-safe:`, `motion-reduce:` | podle `prefers-reduced-motion` |
| `group-hover:`, `group-focus:` | reakce potomka na rodiče s třídou `group` |
| `peer-checked:`, `peer-invalid:` | reakce na sourozence **před** prvkem s třídou `peer` |
| `data-[stav=otevreno]:` | libovolná podmínka v hranatých závorkách |

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
<button class="md:hover:bg-sky-800 dark:hover:bg-sky-300">
<span class="lg:group-hover:translate-x-1">
<div class="motion-safe:transition motion-safe:hover:scale-105">
```

Varianty se řetězí a čtou zleva doprava jako podmínky spojené „a zároveň".
**`group` je shora dolů** (rodič → potomek), **`peer` zleva doprava** (sourozenec před →
prvek za ním).

## Container queries

`md:` se ptá na šířku **okna**, `@md:` na šířku **kontejneru**. Rodič dostane třídu
`@container`, potomek varianty `@sm:`, `@md:`, `@lg:`:

```html
<div class="@container">
  <article class="flex flex-col gap-3 @md:flex-row @md:items-center">…</article>
</div>
```

Znovupoužitelná komponenta má reagovat na kontejner — tatáž karta může být v široké
mřížce i v úzkém bočním panelu, a okno je v obou případech stejné.

## Libovolné hodnoty

| třída | CSS |
|---|---|
| `w-[37rem]` | `width: 37rem` |
| `bg-[#0f766e]` | `background-color: #0f766e` |
| `grid-cols-[1fr_auto]` | `grid-template-columns: 1fr auto` |
| `top-[calc(100%-2px)]` | `top: calc(100% - 2px)` |
| `[mask-type:luminance]` | vlastnost, pro kterou utilita není |

**Mezera uvnitř hodnoty se píše podtržítkem** — mezera v atributu `class` odděluje třídy.
Je to únikový ventil, ne výchozí způsob: hodnotu, kterou potřebuješ opakovaně, přidej do
`@theme` jako token.

## Opakující se bloky tříd: čtyři řešení v pořadí

1. **Smyčka nebo komponenta.** Devět z deseti případů. Duplicita tříd je příznak
   duplicity značky — HTML se napíše jednou.
2. **`@utility`** pro vlastní deklaraci, na kterou mají jít varianty:

   ```css
   @utility text-vyvazene {
     text-wrap: balance;
   }
   ```

   Obyčejná třída v CSS tohle neumí: `md:moje-trida` by nevzniklo.
3. **`@apply`** jen na značky, které nemůžeš otřídovat — obsah z redakčního systému,
   markdown, cizí widget, výchozí vzhled prvků v `@layer base`. Ve vlastních komponentách
   je to skoro vždy známka toho, že měla vzniknout komponenta.
4. **Slučování tříd** u komponenty s prop `className`:

   ```js
   import { clsx } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   export function cn(...vstupy) {
     return twMerge(clsx(vstupy));
   }
   ```

   `clsx` poskládá jména podle podmínek, `twMerge` pozná, že `px-4` a `px-8` nastavují
   totéž, a nechá jen pozdější.

## Kdy Tailwind a kdy čisté CSS

| spíš Tailwind | spíš čisté CSS |
|---|---|
| rozvržení, rozestupy, typografie, barvy | složité `@keyframes` |
| stavy a responzivita | generované mřížky a výpočty přes `calc()` |
| rychlé prototypy a komponenty | tisk (`@media print`) |
| všechno, co má držet design systém | `::selection`, `::marker` a další drobnosti |

Míchat obojí je v pořádku — tokeny z `@theme` fungují v obou světech.

## Pasti a časté chyby

- **Třída složená za běhu.** Tailwind čte zdrojové soubory jako text a hledá celá jména
  tříd; `` `bg-${barva}-500` `` ve zdroji nikde není. Oprava: celá jména v objektu
  (`{ ok: 'bg-emerald-500', chyba: 'bg-rose-500' }`) a výběr z nich. Lokálně to může
  fungovat, když stejnou třídu máš napsanou jinde — rozbije se až v produkci.
- **Mezera v libovolné hodnotě.** `grid-cols-[1fr auto]` se rozpadne na dvě neplatné
  třídy a mřížka zůstane v jednom sloupci. Oprava: `grid-cols-[1fr_auto]`.
- **Spoléhání na pořadí tříd v `class`.** `p-2 p-6` nedává „druhá vyhrává"; rozhoduje
  pořadí ve vygenerovaném stylopisu. Na řízené přebíjení je `tailwind-merge`.
- **`opacity-*` místo průhledné barvy.** `bg-rose-600 opacity-60` zprůhlední i text.
  Oprava: `bg-rose-600/60`.
- **Starý zápis `rgb(31, 111, 139)` v tokenu** rozbije `bg-znacka/50`. Piš hexadecimálně
  nebo `oklch()`.
- **Proměnná v `:root` místo v `@theme`** nebo jméno bez správné předpony
  (`--znacka-barva`) — utilita z ní nevznikne.
- **Psaní od velkého displeje dolů.** `lg:grid-cols-1` jako základ a výjimky pro telefon
  se neudrží. Základ je telefon, varianty jsou výjimky nahoru.
- **`focus:outline-none` bez náhrady** znepřístupní stránku pro klávesnici.
- **`peer` na sourozenci až za prvkem.** CSS se dívá jen dopředu, prvek s `peer` musí
  stát v HTML dřív.
- **`md:` u znovupoužitelné komponenty.** V úzkém sloupci se rozpadne; patří tam `@md:`.
