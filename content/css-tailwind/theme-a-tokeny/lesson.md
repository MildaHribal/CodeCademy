# `@theme` a tokeny motivu

:::check pretest
V Tailwindu v4 chceš mít vlastní firemní barvu použitelnou jako `bg-znacka`. Kam ji napíšeš?

### --answer--
Do `tailwind.config.js`, do sekce `theme.extend.colors`.

#### --why--
Tak to bylo ve verzi 3. Verze 4 konfigurační soubor nepotřebuje — nastavení se přesunulo
přímo do CSS.

### --correct--
Do bloku `@theme` v CSS, jako proměnnou `--color-znacka`.

#### --why--
Tailwind z proměnné podle její předpony (`--color-*`) sám odvodí utility `bg-znacka`,
`text-znacka`, `border-znacka` a další.

### --answer--
Do `:root` jako obyčejnou CSS proměnnou.

#### --why--
Proměnná v `:root` je jen proměnná. Utilita z ní nevznikne — použít ji jde leda ručně
přes `var()` nebo v hranatých závorkách.
:::

Tailwind má rozumné výchozí hodnoty, ale žádná skutečná značka nemá modrou z výchozí
palety. Tahle lekce je o tom, jak z vlastních barev, písma a rozestupů udělat utility,
které se pak používají úplně stejně jako ty vestavěné.

## Co jsou tokeny motivu

[[token motivu|Token]] je pojmenovaná hodnota, ze které se skládá vzhled: barva, písmo,
poloměr rohu, stín, rozestup. Místo `#1f6f8b` roztroušeného na čtyřiceti místech je
jednou `--color-znacka` a všude jen jméno.

Rozdíl proti obyčejné CSS proměnné je v tom, co s ní Tailwind udělá. Proměnná v `@theme`
je **zároveň proměnná i zdroj utilit**:

```css
@import "tailwindcss";

@theme {
  --color-znacka: #1f6f8b;
}
```

Od téhle chvíle existuje `bg-znacka`, `text-znacka`, `border-znacka`, `ring-znacka`,
`from-znacka`… a vedle toho pořád i `var(--color-znacka)` pro chvíle, kdy píšeš obyčejné
CSS.

:::live dom libs=tailwind
```html
<style type="text/tailwindcss">
  @theme {
    --color-znacka: #1f6f8b;
    --color-znacka-tmava: #16505f;
  }
</style>

<div class="p-6 space-y-3 font-sans">
  <p class="text-znacka font-semibold">Text v barvě značky</p>
  <div class="rounded-lg bg-znacka p-4 text-white">Pozadí v barvě značky</div>
  <div class="rounded-lg border-2 border-znacka p-4 text-znacka">Rámeček v barvě značky</div>
  <button class="rounded-md bg-znacka px-4 py-2 text-white hover:bg-znacka-tmava">Tlačítko</button>
</div>
```
:::

Zkus v bloku `@theme` změnit `#1f6f8b` na `#b4532a`. Přebarví se všechno naráz — a to je
celé kouzlo tokenů.

:::check
Do `@theme` napíšeš `--radius-karta: 0.75rem`. Kterou třídu tím získáš?

### --expected--
rounded-karta

### --accept--
rounded-karta
třídu rounded-karta
:::

## `@theme`: paleta, písmo, rozestupy

Jméno proměnné není libovolné — **předpona rozhoduje**, jaké utility z ní vzniknou:

| předpona | co z toho vznikne | příklad |
|---|---|---|
| `--color-*` | `bg-`, `text-`, `border-`, `ring-`, `fill-`… | `--color-znacka` → `bg-znacka` |
| `--font-*` | `font-` | `--font-nadpis` → `font-nadpis` |
| `--text-*` | `text-` (velikost) | `--text-hero` → `text-hero` |
| `--spacing` | základ pro `p-`, `m-`, `gap-`, `w-`, `h-` | `--spacing: 0.25rem` |
| `--radius-*` | `rounded-` | `--radius-karta` → `rounded-karta` |
| `--shadow-*` | `shadow-` | `--shadow-vyssi` → `shadow-vyssi` |
| `--breakpoint-*` | varianty jako `md:` | `--breakpoint-siroko` → `siroko:` |
| `--container-*` | `max-w-` a varianty container query | `--container-clanek` → `max-w-clanek` |

```css
@import "tailwindcss";

@theme {
  /* Paleta značky — odstíny pojmenuj čísly, ať jdou odlišit. */
  --color-znacka-50:  #eef6f8;
  --color-znacka-500: #1f6f8b;
  --color-znacka-700: #16505f;

  /* Písmo */
  --font-nadpis: "Bitter", Georgia, serif;
  --font-text: "Inter", system-ui, sans-serif;

  /* Vlastní velikost pro hero nadpis */
  --text-hero: clamp(2.5rem, 6vw, 4.5rem);

  /* Zaoblení a stín */
  --radius-karta: 0.75rem;
  --shadow-karta: 0 8px 24px rgb(22 32 43 / 0.1);
}
```

> [!TIP]
> Odstíny pojmenovávej čísly (`500`, `700`) jako Tailwind sám, ne slovy (`svetla`,
> `tmava`). Za rok přibude odstín mezi ně a `svetlejsi-nez-svetla` je slepá ulička.

:::check
Proč se `--breakpoint-siroko: 1400px` v `@theme` chová jinak než `--color-znacka`?

### --correct--
Z barvy vzniknou utility (`bg-znacka`), z bodu zlomu varianta (`siroko:text-lg`).

#### --why--
Předpona říká Tailwindu, **co** má z proměnné udělat. Proto se jména nevymýšlejí
libovolně — `--muj-modry-odstin` by zůstal obyčejnou proměnnou.

### --answer--
Body zlomu se do `@theme` psát nedají, patří do konfiguračního souboru.

#### --why--
Ve verzi 4 patří do `@theme` úplně všechno včetně bodů zlomu. Konfigurační soubor už
není potřeba.

### --answer--
Nijak, obojí vyrobí utility se stejnou předponou.

#### --why--
Varianta a utilita jsou dvě různé věci: utilita něco nastavuje, varianta určuje,
kdy to platí.
:::

:::live dom libs=tailwind predict
```html
<style type="text/tailwindcss">
  @theme {
    --color-red-500: #1f6f8b;
  }
</style>
<div class="bg-red-500 p-4 text-white">Třída se jmenuje bg-red-500.</div>
```
--question-- Jakou barvu bude mít pozadí toho divu?
--option-- Červenou — výchozí `red-500` se přepsat nedá.
--option*-- Modrozelenou `#1f6f8b` — token se stejným jménem ten vestavěný přepíše.
--option-- Žádnou — token s jménem vestavěné barvy je chyba a Tailwind ho zahodí.
--why-- Jméno tokenu je zároveň jméno utility. Když se trefíš do jména, které už existuje, přepíšeš ho. Někdy se to hodí (celá paleta zůstane, jen jinak namíchaná), jindy to překvapí — proto se vlastní barvy pojmenovávají po značce, ne po odstínu.
:::

## Tokeny v čistém CSS

Token zůstává obyčejnou CSS proměnnou, takže se hodí i tam, kde utility nestačí — ve
`@keyframes`, v gradientu, uvnitř `calc()`:

:::live dom libs=tailwind
```html
<style type="text/tailwindcss">
  @theme {
    --color-znacka: #1f6f8b;
    --color-akcent: #b4532a;
    --radius-karta: 0.75rem;
  }

  /* Token použitý mimo utility — pořád je to jen var(). */
  .prechod {
    border-radius: var(--radius-karta);
    background: linear-gradient(135deg, var(--color-znacka), var(--color-akcent));
  }
</style>

<div class="p-6">
  <div class="prechod p-8 text-white font-semibold">Gradient poskládaný z tokenů</div>
  <p class="mt-3 text-sm text-gray-600">Stejné barvy, jen jinou cestou než utilitami.</p>
</div>
```
:::

Platí to i obráceně: když v projektu už máš proměnné z návrhu, stačí je do `@theme`
přenést a utility vzniknou samy.

:::check
Napiš, jak v obyčejném CSS pravidle použiješ token `--color-znacka`.

### --expected--
var(--color-znacka)

### --accept--
color: var(--color-znacka)
přes var()
:::

## Sémantické tokeny a tmavý motiv

Tokeny se vyplatí mít ve dvou patrech:

- **primitivní** — konkrétní barvy: `--color-znacka-500`, `--color-sediva-200`,
- **sémantické** — role v rozhraní: `--color-plocha`, `--color-text`, `--color-okraj`.

V komponentách se pak používají **jen ty sémantické**. Tmavý motiv je potom výměna
jednoho patra, ne přepisování stovky tříd:

:::live dom libs=tailwind
```html
<style type="text/tailwindcss">
  @theme {
    /* primitivní */
    --color-bila: #ffffff;
    --color-tmava: #16202b;
    --color-sediva-100: #f1f3f5;
    --color-sediva-700: #3b4754;

    /* sémantické — světlý motiv */
    --color-plocha: var(--color-bila);
    --color-podklad: var(--color-sediva-100);
    --color-text: var(--color-tmava);
  }

  /* Tmavý motiv: mění se jen sémantické tokeny. */
  .tmavy {
    --color-plocha: var(--color-sediva-700);
    --color-podklad: var(--color-tmava);
    --color-text: var(--color-bila);
  }
</style>

<div class="p-6 space-y-4 font-sans">
  <div class="rounded-lg bg-podklad p-4">
    <div class="rounded-md bg-plocha p-4 text-text">Světlý motiv — stejné třídy.</div>
  </div>

  <div class="tmavy rounded-lg bg-podklad p-4">
    <div class="rounded-md bg-plocha p-4 text-text">Tmavý motiv — stejné třídy.</div>
  </div>
</div>
```
:::

Všimni si, že obě karty mají **úplně stejný `class`**. Liší se jen tím, že jedna leží
uvnitř prvku s třídou `.tmavy`, která sémantické tokeny přepíše.

> [!REMEMBER]
> V komponentách používej sémantické tokeny (`bg-plocha`), ne primitivní (`bg-sediva-100`).
> Primitivní patří jen do definice těch sémantických.

:::check
Proč se v komponentách používají sémantické tokeny místo primitivních?

### --correct--
Protože pak jde motiv vyměnit na jednom místě — komponenty se nemusí přepisovat.

#### --why--
`bg-plocha` znamená „pozadí plochy", ne „bílá". V tmavém motivu se význam nezmění,
změní se jen hodnota. S `bg-bila` bys musel projít celý projekt.

### --answer--
Protože sémantické tokeny mají lepší výkon.

#### --why--
Výsledné CSS je prakticky stejné. Rozdíl je v tom, jak se s projektem žije.

### --answer--
Protože primitivní tokeny nejde použít v utilitách.

#### --why--
Jde, fungují stejně. Jen je nechceš mít rozeseté po komponentách.
:::

## Přepsání a vypnutí výchozích tokenů

Token se stejným jménem jako vestavěný ten vestavěný **přepíše**:

```css
@theme {
  --color-red-500: #d1495b;   /* od teď je bg-red-500 tahle červená */
}
```

Celou skupinu jde vypnout hvězdičkou — hodí se, když nechceš, aby si někdo omylem sáhl
po barvě mimo paletu značky:

```css
@theme {
  --color-*: initial;          /* zruší celou výchozí paletu */
  --color-znacka: #1f6f8b;     /* a nechá jen tvoje barvy */
  --color-bila: #ffffff;
}
```

Poslední trik je `@theme inline`. Běžný `@theme` vydá proměnnou do `:root` a utilita
na ni odkáže přes `var()`. U `inline` se hodnota vloží do utility rovnou — potřebuješ
to tehdy, když se proměnná někde po cestě mění (třeba právě u motivů) a nechceš, aby
se změna promítla i tam, kde nemá.

> [!PITFALL]
> Barvu piš v hexadecimálním tvaru nebo moderním zápisem (`oklch(...)`). Starý zápis
> `rgb(31, 111, 139)` v tokenu rozbije průhlednost přes lomítko — `bg-znacka/50` pak
> nebude fungovat.

:::check
Co udělá `--color-*: initial;` uvnitř `@theme`?

### --expected--
zruší výchozí paletu

### --accept--
smaže všechny výchozí barvy
vypne vestavěné barevné tokeny
zruší všechny barvy, které Tailwind dodává
:::

## Typické chyby a pasti

- **Proměnná v `:root` místo v `@theme`.** Vypadá stejně, ale utilita z ní nevznikne.
- **Jméno bez správné předpony** (`--znacka-barva`) — zůstane jen proměnnou.
- **Barvy pojmenované slovy** (`--color-svetla`). Až přibude odstín mezi, nebude kam.
- **Primitivní tokeny přímo v komponentách.** Motiv se pak nedá vyměnit.
- **Starý zápis `rgb()` v tokenu** — rozbije `bg-znacka/50`.
- **Token přidaný, ale třída se nepoužila nikde v kódu.** Tailwind generuje jen to, co
  najde v souborech; utilita poskládaná za běhu (`'bg-' + barva`) mu unikne.
- **`@theme` v souboru, který se neimportuje** před `@import "tailwindcss"` nebo po něm
  podle dokumentace — pak se nic nepropíše.

> [!PITFALL]
> Poslední bod je nejzrádnější: `class={'bg-' + barva}` nebo `clsx('text-' + stav)`
> Tailwind ve zdrojáku **nenajde**. Píše se proto celá jména tříd do objektu
> (`{ chyba: 'text-red-500', ok: 'text-green-600' }`) a vybírá se z nich.

:::check
Ve svém kódu máš `class={'text-' + stav}` a třída se negeneruje. Co s tím?

### --expected--
napsat celá jména tříd

### --accept--
vybírat z objektu s celými jmény tříd
mít celé názvy tříd ve zdrojáku
nesestavovat jméno třídy za běhu
:::

## Kde to najdeš v MDN

Tokeny jsou obyčejné [vlastní vlastnosti CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) —
všechno, co o nich platí (dědičnost, `var()`, záložní hodnota), platí i tady. Jak je
Tailwind v4 čte a co z nich vyrábí, je v jeho dokumentaci pod heslem *Theme variables*;
syntaxi `oklch()` pro barvy najdeš [na MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch).

# --questions--

## --question--

Napiš, jakou proměnnou do `@theme` přidáš, aby vznikla třída `bg-znacka`.

### --expected--

--color-znacka

### --accept--

--color-znacka: #1f6f8b;
--color-znacka: hodnota

### --why--

Předpona `--color-*` říká Tailwindu, že jde o barvu — a z barvy odvodí `bg-`, `text-`,
`border-`, `ring-` i další. Bez té předpony by to byla jen obyčejná proměnná.

### --see--

css-tailwind/theme-a-tokeny#theme-paleta-pismo-rozestupy

## --question--

Jak se `@theme` liší od `:root`?

### --correct--

Z `@theme` vzniknou i utility; `:root` vyrobí jen obyčejnou proměnnou.

#### --why--

Proměnná z `@theme` je obojí naráz: dá se použít jako `var(--color-znacka)` i jako
třída `bg-znacka`. Proto se všechno nastavení vzhledu píše do `@theme`.

### --answer--

`@theme` funguje jen v souboru `tailwind.config.js`.

#### --why--

Ve verzi 4 žádný konfigurační soubor není — `@theme` se píše přímo do CSS.

### --answer--

`:root` platí globálně, `@theme` jen v komponentě.

#### --why--

Obojí platí globálně. Rozdíl je v tom, že `@theme` navíc generuje utility.

### --see--

css-tailwind/theme-a-tokeny#co-jsou-tokeny-motivu

## --question--

Napiš, čím v `@theme` zrušíš celou výchozí barevnou paletu Tailwindu.

### --expected--

--color-*: initial

### --accept--

--color-*: initial;
nastavím --color-* na initial

### --why--

Hodí se, když má projekt mít jen barvy značky a nechceš, aby někdo omylem sáhl po
`bg-blue-500`. Po zrušení si doplníš vlastní paletu — a na nic jiného se pak nedá
kliknout.

### --see--

css-tailwind/theme-a-tokeny#prepsani-a-vypnuti-vychozich-tokenu

## --question--

Proč se rozlišují primitivní a sémantické tokeny?

### --correct--

Protože komponenty pak používají role (`bg-plocha`), ne konkrétní barvy — a motiv jde vyměnit přepsáním jednoho patra.

#### --why--

Tmavý motiv je pak změna pěti řádků, ne průchod celým projektem. Stejně se řeší motivy
pro víc značek nad jedním kódem.

### --answer--

Protože primitivní tokeny nejdou použít ve variantách jako `hover:`.

#### --why--

Jdou. Varianta se týká toho, kdy utilita platí, ne toho, z jakého tokenu vznikla.

### --answer--

Protože sémantické tokeny generují menší CSS.

#### --why--

Velikost výsledného CSS je prakticky stejná. Jde o údržbu.

### --see--

css-tailwind/theme-a-tokeny#semanticke-tokeny-a-tmavy-motiv

## --question--

Do tokenu napíšeš `--color-znacka: rgb(31, 111, 139)`. Napiš, co tím rozbiješ.

### --expected--

průhlednost přes lomítko

### --accept--

bg-znacka/50
zápis s lomítkem
modifikátor průhlednosti

### --why--

Tailwind u zápisu `bg-znacka/50` potřebuje barvu v takovém tvaru, aby do ní mohl
alfa kanál doplnit. Starý čárkový `rgb()` mu to neumožní — hexadecimální zápis nebo
`oklch()` ano.

### --see--

css-tailwind/theme-a-tokeny#prepsani-a-vypnuti-vychozich-tokenu

## --question--

Ve svém kódu máš `class={'bg-' + barva}`. Proč to nefunguje?

### --correct--

Tailwind hledá **celá jména tříd** ve zdrojových souborech. Třída složená až za běhu tam není, takže se nevygeneruje.

#### --why--

Řeší se to tím, že se celá jména napíšou do objektu nebo pole a v kódu se z nich jen
vybírá: `{ ok: 'bg-green-600', chyba: 'bg-red-600' }[stav]`.

### --answer--

Protože se třídy musí skládat přes `clsx`.

#### --why--

`clsx` jen spojuje řetězce. Kdyby se jméno skládalo až v něm, nepomůže to.

### --answer--

Protože dynamické třídy jdou jen s `@apply`.

#### --why--

S `@apply` to nesouvisí. Problém je v tom, že jméno třídy ve zdrojáku nikde není.

### --see--

css-tailwind/theme-a-tokeny#typicke-chyby-a-pasti

## --question--

Napiš třídu, kterou získáš z tokenu `--shadow-karta: 0 8px 24px rgb(0 0 0 / 0.1)`.

### --expected--

shadow-karta

### --accept--

shadow-karta
třídu shadow-karta

### --why--

Předpona `--shadow-*` vyrábí utility `shadow-*`. Stejně funguje `--radius-*` → `rounded-*`
a `--text-*` → `text-*` pro velikost písma.

### --see--

css-tailwind/theme-a-tokeny#theme-paleta-pismo-rozestupy
