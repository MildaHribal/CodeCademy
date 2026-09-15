# Vlastní vlastnosti (CSS proměnné)

Když e-shop mění firemní barvu z modré na zelenou, nikdo nechce hledat `#2563eb` ve dvaceti souborech. Na skutečných webech — a v knihovnách komponent jako Bootstrap, shadcn/ui nebo v Tailwindu — jsou barvy, rozestupy a písma uložené jako vlastní vlastnosti na jednom místě. Téhle myšlence se říká design tokeny a v téhle lekci je začneš používat.

:::check pretest
Stylopis obsahuje `:root { --accent: #2563eb; }`, `.button { background-color: var(--accent); }` a `.promo { --accent: #db2777; }`. Jaké pozadí bude mít tlačítko, které leží uvnitř `<section class="promo">`?

### --answer--
Modré, protože `--accent` je definovaná na `:root`.

#### --why--
`:root` je jen nejvyšší místo, kde hodnota vzniká. Blíž k tlačítku může být jiná.

### --correct--
Růžové.

#### --why--
Vlastní vlastnost se dědí jako barva textu. Tlačítko převezme hodnotu od nejbližšího předka, který ji nastavuje — a to je `.promo`.

### --answer--
Žádné, dvě definice téže proměnné se navzájem zruší.

#### --why--
Dvě definice na různých prvcích se neruší. Každý prvek má svou hodnotu a potomci dědí tu nejbližší.
:::

:::check pretest
Co udělá `margin-top: var(--space, 1.5rem)`, když `--space` nikde definovaná není?

### --answer--
Deklarace se zahodí a margin zůstane výchozí.

#### --why--
Na chybějící proměnnou je v `var()` pamatováno: druhý argument.

### --correct--
Použije se `1.5rem`.

#### --why--
Druhý argument `var()` je záložní hodnota. Použije se, když proměnná není definovaná.

### --answer--
Použije se `0`, protože nedefinovaná proměnná je nula.

#### --why--
CSS proměnné nemají výchozí nulu. Nedefinovaná proměnná je „žádná hodnota" a pomůže jen záložní hodnota.
:::

## Problém: stejná barva na čtyřiceti místech

Tady je kousek rozhraní aplikace na rezervace sportovišť. Firemní modrá je na tlačítku, na odkazu, na štítku i v rámečku vybrané karty — pokaždé znovu napsaná jako `#2563eb`.

:::live
```html
<article class="slot slot--selected">
  <p class="slot__badge">Volno</p>
  <h2 class="slot__title">Tenisový kurt 2</h2>
  <p>Středa 18:00–19:00 · <a href="#">Pravidla areálu</a></p>
  <button class="slot__button">Rezervovat</button>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #0f172a; }

.slot {
  max-width: 22rem;
  padding: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
}

.slot--selected { border-color: #2563eb; }

.slot__badge {
  display: inline-block;
  margin: 0;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background-color: #dbeafe;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 700;
}

.slot__title { margin: 0.5rem 0 0.25rem; }

a { color: #2563eb; }

.slot__button {
  margin-top: 1rem;
  padding: 0.625rem 1.25rem;
  border: 0;
  border-radius: 0.5rem;
  background-color: #2563eb;
  color: white;
  font: inherit;
  font-weight: 600;
}
```
:::

Zkus změnit firemní barvu na zelenou `#16a34a`. Musíš ji najít a přepsat na čtyřech místech — a světle modré pozadí štítku `#dbeafe` k zelené nesedí, tak ho musíš dopočítat zvlášť. Ve skutečném projektu jsou těch míst desítky.

> [!REMEMBER]
> **Vlastní vlastnost je pojmenovaná hodnota, kterou definuješ jednou a všude jinde ji čteš přes `var()`; dědí se stromem jako barva textu, takže ji jde pro jednu část stránky přepsat.**

:::check
Kolik míst v ukázce musíš upravit, když se firemní modrá mění, včetně světlého pozadí štítku, které z ní vychází?

### --expected--
5

### --accept--
pět

### --why--
Čtyřikrát `#2563eb` (rámeček, text štítku, odkaz, tlačítko) a jednou `#dbeafe`. Za chvíli z toho bude jediné místo.
:::

## Definice a použití: `--jméno` a `var()`

[[CSS proměnná|Vlastní vlastnost]] (*custom property*, hovorově CSS proměnná) je každá vlastnost, jejíž jméno začíná **dvěma pomlčkami**:

```css
:root {
  --color-accent: #2563eb;
  --radius-md: 0.5rem;
}

.slot__button {
  background-color: var(--color-accent);
  border-radius: var(--radius-md);
}
```

- Definice vypadá jako obyčejná deklarace. Hodnota může být barva, délka, seznam písem — cokoli, co by šlo napsat do skutečné vlastnosti.
- Funkce `var(--jméno)` na místo sebe dosadí hodnotu. Použít ji jde jen **v hodnotě** deklarace, ne ve jménu vlastnosti ani v selektoru.
- Na velikosti písmen ve jménu záleží: `--Accent` a `--accent` jsou dvě různé proměnné.

`:root` je pseudotřída, která vybere kořen dokumentu, tedy prvek `<html>`. Proměnné definované na něm mají k dispozici všechny prvky stránky.

:::live
```html
<article class="slot slot--selected">
  <p class="slot__badge">Volno</p>
  <h2 class="slot__title">Tenisový kurt 2</h2>
  <p>Středa 18:00–19:00 · <a href="#">Pravidla areálu</a></p>
  <button class="slot__button">Rezervovat</button>
</article>
```
```css
:root {
  --color-accent: hsl(var(--hue) 83% 53%);
  --color-accent-soft: hsl(var(--hue) 90% 93%);
  --color-text: #0f172a;
  --radius-md: 0.5rem;
}

body { font-family: system-ui, sans-serif; margin: 1rem; color: var(--color-text); }

.slot {
  max-width: 22rem;
  padding: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: calc(var(--radius-md) * 2);
}

.slot--selected { border-color: var(--color-accent); }

.slot__badge {
  display: inline-block;
  margin: 0;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background-color: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 700;
}

.slot__title { margin: 0.5rem 0 0.25rem; }

a { color: var(--color-accent); }

.slot__button {
  margin-top: 1rem;
  padding: 0.625rem 1.25rem;
  border: 0;
  border-radius: var(--radius-md);
  background-color: var(--color-accent);
  color: white;
  font: inherit;
  font-weight: 600;
}
```
```controls
--hue: range(0, 360, 5) = 220 | Odstín firemní barvy
```
:::

Posuň odstín firemní barvy a sleduj, že se rámeček, štítek, odkaz i tlačítko mění najednou — a světlé pozadí štítku drží krok, protože je odvozené ze stejného odstínu. `calc()` u zaoblení karty násobí token dvěma; k výpočtům se dostaneš v lekci Jednotky a hodnoty.

:::check
Napiš deklaraci, která nastaví `border-color` na hodnotu vlastní vlastnosti `--color-border`.

### --expected--
border-color: var(--color-border)

### --why--
Hodnotu vlastní vlastnosti čteš funkcí `var()` a jméno v ní píšeš i s oběma pomlčkami.
:::

## Dědičnost a přepsání v komponentě

Vlastní vlastnosti se **dědí** jako `color` nebo `font-family`: prvek, který proměnnou nemá nastavenou, převezme hodnotu od rodiče, ten od svého rodiče… až ke `:root`. Z toho plyne silný vzor: proměnnou jde přepsat na komponentě a změna platí jen **uvnitř** ní.

:::compare
```html
<section class="panel">
  <h2 class="panel__title">Tvoje rezervace</h2>
  <p>Středa 18:00, tenisový kurt 2</p>
  <a class="panel__link" href="#">Zrušit rezervaci</a>
</section>
```
```css
:root {
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --accent: #2563eb;
}

body { font-family: system-ui, sans-serif; margin: 1rem; background-color: #e2e8f0; }

.panel {
  padding: 1.25rem;
  border-radius: 1rem;
  background-color: var(--surface);
  color: var(--text);
}

.panel__title { margin: 0 0 0.25rem; }
.panel p { margin: 0 0 0.75rem; color: var(--muted); }
.panel__link { color: var(--accent); font-weight: 600; }
```
--variant-- Bez přepsání
```css
.panel { outline: 0; }
```
--variant-- Tmavý panel: přepsané tokeny
```css
.panel {
  --surface: #0f172a;
  --text: #f8fafc;
  --muted: #94a3b8;
  --accent: #93c5fd;
}
```
:::

Obě varianty mají stejná pravidla pro nadpis, odstavec i odkaz. Tmavá varianta jen v `.panel` nastavila čtyři tokeny jinak — a všechno uvnitř panelu je převzalo. Takhle se dělá tmavá sekce na světlé stránce nebo celý tmavý režim.

> [!PITFALL] Proměnná definovaná na sourozenci
> *Příznak:* `--brand` nastavíš v pravidle `.site-header` a v `main` přes `var(--brand)` nic není.
>
> *Oprava:* proměnná se dědí jen **dolů** stromem. `main` není potomkem hlavičky. Definuj ji na společném předkovi, typicky na `:root`.

:::check
Proměnná `--accent` je na `:root` modrá a v pravidle `.sale` červená. Odkaz s `color: var(--accent)` leží v patičce stránky mimo prvek `.sale`. Jakou barvu bude mít? Napiš modrá, nebo červená.

### --expected-- ignore-case
modrá

### --accept--
modrou
modra

### --why--
Hodnotu z `.sale` dědí jen prvky uvnitř `.sale`. Patička leží jinde, takže odkaz zdědí hodnotu z `:root`.
:::

## Záložní hodnota ve `var()`

Druhý argument `var()` je [[záložní hodnota]] (*fallback*):

```css
.toast {
  background-color: var(--toast-bg, #1e293b);
  gap: var(--toast-gap, 0.75rem);
}
```

Použije se, když proměnná **není definovaná** — typicky u komponenty, kterou chceš dát do různých projektů a nechceš vyžadovat, aby každý projekt tokeny nastavil. Všechno za první čárkou je záložní hodnota, i když obsahuje další čárky: `var(--font, system-ui, sans-serif)` je v pořádku.

Záložní hodnota ale **nechrání před špatnou hodnotou**. Když proměnná existuje, prohlížeč ji dosadí bez ohledu na to, jestli do vlastnosti pasuje. Než otevřeš náhled, tipni si:

:::live predict
```html
<div class="alert">
  <p class="alert__text">Platba neproběhla. Zkus to prosím znovu.</p>
</div>
```
```css
:root {
  --alert-text: 1rem;
}

body { font-family: system-ui, sans-serif; margin: 1rem; }

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #fef2f2;
  color: #1e293b;
}

.alert__text {
  margin: 0;
  color: var(--alert-text, #b91c1c);
}
```
--question-- Proměnná `--alert-text` obsahuje omylem délku `1rem`. Jakou barvu bude mít text upozornění?
--option-- Červenou `#b91c1c` ze záložní hodnoty.
--option*-- Tmavou `#1e293b` zděděnou od `.alert`.
--option-- Černou, výchozí barvu prohlížeče.
--why-- Proměnná existuje, takže se záložní hodnota nepoužije. Dosazená `1rem` není barva, a to prohlížeč zjistí až při výpočtu hodnot, když už je pravidlo dávno přijaté. Taková deklarace se chová, jako by vlastnost nebyla nastavená: `color` se dědí, takže text převezme barvu od `.alert`. Smaž řádek `--alert-text: 1rem;` a začne platit červená.
:::

Tomu se říká [[neplatná hodnota za běhu]] (*invalid at computed-value time*). Na rozdíl od překlepu z lekce Jak CSS funguje se deklarace nezahodí při čtení stylopisu — prohlížeč ji přijme, protože v době čtení neví, co v proměnné bude. Předchozí platná hodnota z jiného pravidla se proto **nevrátí**: vlastnost dostane zděděnou hodnotu, a když se nedědí (třeba `background-color`), výchozí.

:::check
Pravidlo `.card { background-color: #fff7ed; }` je ve stylopisu první a pod ním `.card { background-color: var(--card-bg, white); }`. Proměnná `--card-bg` má hodnotu `2px`. Jaké pozadí bude karta mít?

### --answer--
`#fff7ed` z prvního pravidla, protože druhá deklarace je neplatná.

#### --why--
Myslíš si, že se deklarace zahodila jako překlep? S `var()` prohlížeč při čtení neví, že hodnota bude špatná, a deklaraci přijme — první pravidlo proto prohraje.

### --answer--
Bílé ze záložní hodnoty.

#### --why--
Záložní hodnota se použije jen tehdy, když proměnná není definovaná. Tady definovaná je, jen se špatnou hodnotou.

### --correct--
Průhledné, tedy žádné.

#### --why--
Deklarace s `var()` vyhrála a teprve při výpočtu se ukázalo, že `2px` není barva. `background-color` se nedědí, a tak dostane výchozí hodnotu `transparent`.
:::

## `color-mix()`: odstíny z jednoho tokenu

Světlé pozadí štítku, tmavší barva tlačítka při najetí myší, průhledný rámeček — to všechno jsou odvozeniny firemní barvy. Nemusíš je počítat ručně: funkce `color-mix()` smíchá dvě barvy v zadaném poměru.

```css
:root {
  --color-accent: #2563eb;
  --color-accent-soft: color-mix(in oklch, var(--color-accent) 15%, white);
  --color-accent-strong: color-mix(in oklch, var(--color-accent), black 20%);
}
```

- `in oklch` říká, v jakém barevném prostoru se míchá. `oklch` dává přechody, které oko vnímá rovnoměrně, `srgb` je jako míchání čísel RGB a u některých barev zešedne.
- Procento patří k barvě, u které stojí: `var(--color-accent) 15%, white` je 15 % firemní barvy a 85 % bílé.
- Bez procent se míchá půl na půl, s jedním procentem se druhá barva dopočítá do sta.

:::live
```html
<div class="swatches">
  <span class="swatch swatch--soft">soft</span>
  <span class="swatch swatch--base">accent</span>
  <span class="swatch swatch--strong">strong</span>
</div>
```
```css
:root {
  --color-accent: var(--brand);
  --color-accent-soft: color-mix(in oklch, var(--color-accent) var(--soft), white);
  --color-accent-strong: color-mix(in oklch, var(--color-accent), black 25%);
}

body { font-family: system-ui, sans-serif; margin: 1rem; }

.swatches { display: flex; gap: 0.5rem; }

.swatch {
  padding: 1.5rem 1rem;
  border-radius: 0.75rem;
  font-weight: 700;
}

.swatch--soft { background-color: var(--color-accent-soft); color: var(--color-accent-strong); }
.swatch--base { background-color: var(--color-accent); color: white; }
.swatch--strong { background-color: var(--color-accent-strong); color: white; }
```
```controls
--brand: select(#2563eb, #16a34a, #db2777, #ea580c) = #2563eb | Firemní barva
--soft: range(5, 40, 5, %) = 15 | Podíl barvy ve světlém odstínu
```
:::

Přepni firemní barvu: všechny tři odstíny se odvodí samy. Posuň podíl barvy ve světlém odstínu a sleduj, kdy už je text na světlém pozadí špatně čitelný.

:::check
Napiš hodnotu `color-mix()`, která smíchá 10 % proměnné `--color-danger` s 90 % bílé v prostoru `oklch`.

### --expected--
color-mix(in oklch, var(--color-danger) 10%, white)

### --accept--
color-mix(in oklch, var(--color-danger) 10%, white 90%)
color-mix(in oklch, white 90%, var(--color-danger))
color-mix(in oklch, white 90%, var(--color-danger) 10%)
color-mix(in oklch, var(--color-danger) 10%, #fff)
color-mix(in oklch, var(--color-danger) 10%, #ffffff)

### --why--
Nejdřív prostor `in oklch`, pak dvě barvy oddělené čárkou. Procento patří k barvě, u které stojí, a druhé se dopočítá do sta.
:::

## Design tokeny: pojmenování a škála

[[design token|Design tokeny]] (*design tokens*) jsou vlastní vlastnosti, které popisují **rozhodnutí návrhu**: firemní barvy, škálu rozestupů, velikosti písma, zaoblení. Na `:root` tvoří malý „slovník" projektu a komponenty z něj jen berou.

Dobré tokeny se pojmenovávají podle **účelu**, ne podle vzhledu:

| špatně | lépe | proč |
|---|---|---|
| `--blue` | `--color-accent` | až bude firemní barva zelená, `--blue: green` nikdo nepochopí |
| `--gray-text` | `--color-text-muted` | jméno říká, kde se barva používá |
| `--16px` | `--space-4` nebo `--space-md` | škála, ne jedno číslo — hodnotu jde změnit |

Rozestupy a velikosti se drží **škály**: místo libovolných čísel jen pár kroků, třeba `0.25rem`, `0.5rem`, `1rem`, `1.5rem`, `2rem`, `3rem`. Rozhraní pak působí uspořádaně a návrháři i vývojáři mluví stejným jazykem.

```css
:root {
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-surface: #ffffff;
  --color-accent: #2563eb;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;

  --radius-md: 0.5rem;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
```

:::explain
Vysvětli vlastními slovy, proč je lepší psát barvy a rozestupy přes design tokeny na `:root` než přímo hodnotou do každého pravidla.

## --model--
Token definuju jednou a komponenty ho čtou přes `var()`, takže změna firemní barvy nebo rozestupu je úprava na jednom místě místo hledání po celém projektu. Jméno podle účelu, jako `--color-accent`, říká, proč hodnota existuje, takže kód čte i někdo, kdo návrh nezná. A protože se vlastní vlastnosti dědí, jde je přepsat pro jednu komponentu nebo tmavý režim, aniž bych měnil pravidla komponent.

## --checklist--
- Hodnota je definovaná na jednom místě a změní se všude.
- Jméno podle účelu vysvětluje, k čemu hodnota slouží.
- Tokeny se dědí, takže je jde přepsat pro komponentu nebo motiv.
- Škála rozestupů a barev drží rozhraní konzistentní.
:::

:::check
Designérka posílá tokeny a jeden se jmenuje `--red-500`. Je to barva chybových hlášek. Napiš jméno tokenu podle účelu ve tvaru `--color-…`.

### --expected--
--color-danger

### --accept--
--color-error
--color-danger-text
--color-error-text

### --why--
Jméno má říkat, kde a proč se barva používá. Až se chybová barva změní na tmavě oranžovou, `--color-danger` bude pořád pravda, `--red-500` ne.
:::

## Typické chyby a pasti

> [!PITFALL] Jednotka přilepená za `var()`
> *Příznak:* `--gap: 12;` a `gap: var(--gap)px;` — mezera je nulová a DevTools nic nepodtrhnou.
>
> *Oprava:* po dosazení vznikne `12 px` jako dva kousky, ne délka. Ulož jednotku rovnou do proměnné (`--gap: 12px`). Násobení čísla jednotkou přes `calc()` ukáže lekce Jednotky a hodnoty.

> [!PITFALL] Chybějící pomlčky nebo jiná velikost písmen
> *Příznak:* `var(accent)` nebo `var(--Accent)` a barva se nepoužije.
>
> *Oprava:* jméno ve `var()` je přesně to z definice, i se dvěma pomlčkami a stejnými velkými a malými písmeny.

> [!PITFALL] Záložní hodnota „nefunguje"
> *Příznak:* proměnná má špatnou hodnotu (délku místo barvy) a místo záložní hodnoty vlastnost zmizí nebo se zdědí od rodiče.
>
> *Oprava:* záložní hodnota platí jen pro **nedefinovanou** proměnnou. V DevTools najeď na `var(--…)` v panelu Styles — ukáže dosazenou hodnotu — a oprav definici.

> [!PITFALL] Odvozený token se v komponentě nepřepočítá
> *Příznak:* na `:root` máš `--color-accent` a z něj `--color-accent-soft: color-mix(…var(--color-accent)…)`. V `.promo` přepíšeš jen `--color-accent` na růžovou — tlačítko je růžové, ale světlé pozadí štítku zůstane modravé.
>
> *Oprava:* `var()` uvnitř proměnné se vyhodnotí na prvku, kde je proměnná **definovaná**, tady na `:root`. Potomci dědí už hotovou modravou barvu. V `.promo` přepiš i odvozený token, nebo odvozené tokeny definuj na komponentě vedle akcentu.

> [!PITFALL] Přepsání na špatném místě
> *Příznak:* chceš tmavou kartu, nastavíš `--surface` v pravidle `.card__title` a tmavý je jen nadpis.
>
> *Oprava:* proměnná se dědí dolů. Přepiš ji na prvku, **uvnitř kterého** má nová hodnota platit — tady na `.card`.

:::check
Kolega definoval `--card-padding: 24;` a v pravidle karty napsal `padding: var(--card-padding)px;`. Karta nemá žádné vnitřní odsazení. Napiš opravenou definici proměnné.

### --expected--
--card-padding: 24px

### --accept--
--card-padding: 1.5rem

### --why--
`var()` dosadí jen text proměnné. Jednotka za závorkou se k číslu nepřilepí, takže vznikne neplatné `24 px`. Jednotka patří přímo do hodnoty proměnné.
:::

Teď máš všechno na kartu produktu postavenou z tokenů. V labu, který následuje, ji navrhneš sám a vyzkoušíš si, jestli tokeny patří na `:root`, nebo na komponentu.

## Kde to najdeš v MDN

- [Using CSS custom properties (variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties) — definice, `var()`, dědičnost, záložní hodnoty a neplatné hodnoty za běhu.
- [var()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/var) — přesná pravidla záložní hodnoty včetně čárek.
- [color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix) — barevné prostory a jak se počítají procenta.
- [:root](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:root) — pseudotřída pro kořen dokumentu.

# --questions--

## --question--

Stránka má `:root { --space: 1rem; }` a `.compact { --space: 0.5rem; }`. Odstavec s `padding: var(--space)` leží uvnitř `<div class="compact">`. Kolik pixelů bude mít jeho vnitřní odsazení při výchozí velikosti písma?

### --expected--
8

### --accept--
8px
8 px

### --why--
Odstavec zdědí nejbližší hodnotu, tedy `0.5rem` z `.compact`, a to je 8 px. `var()` se vyhodnocuje až u prvku, který proměnnou čte.

### --see--

css-zaklady/vlastni-vlastnosti#dedicnost-a-prepsani-v-komponente

## --question--

V pravidle je `color: var(--link-color, #0f766e);` a proměnná `--link-color` není nikde definovaná. Jakou barvu bude mít text? Napiš hex zápis.

### --expected-- ignore-case
#0f766e

### --why--
Nedefinovaná proměnná je přesně ten případ, pro který je záložní hodnota.

### --see--

css-zaklady/vlastni-vlastnosti#zalozni-hodnota-ve-var

## --question--

Proč se tokeny pro barvy obvykle definují na `:root`, a ne v pravidle `body`?

### --answer--
Na `body` vlastní vlastnosti nefungují.

#### --why--
Fungují na jakémkoli prvku. Rozdíl je v tom, co všechno je pod prvkem ve stromu.

### --correct--
`:root` je prvek `<html>`, nejvyšší předek stránky, takže tokeny zdědí úplně všechno — včetně pravidel, která čtou tokeny přímo na `<html>` nebo na `body`.

#### --why--
Proměnná se dědí jen dolů. `:root` je kořen stromu, nad ním už nic není.

### --answer--
Protože `:root` má vyšší prioritu a přebije přepsání v komponentě.

#### --why--
Přepsání v komponentě funguje právě proto, že je blíž prvku než `:root`. Dědí se nejbližší hodnota.

### --see--

css-zaklady/vlastni-vlastnosti#definice-a-pouziti-jmeno-a-var
