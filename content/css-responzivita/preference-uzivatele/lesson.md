# Preference uživatele a motivy

Telefon večer přepne systém do tmavého režimu a většina aplikací ztmavne s ním. Web, který v tu chvíli zasvítí bílou plochou, působí jako chyba. Lidé si v systému nastavují i omezení animací, vyšší kontrast nebo větší písmo a moderní web je umí přečíst stejně jako šířku okna. V téhle lekci je naučíš respektovat.

:::check pretest
Stránka má tmavé pozadí nastavené v CSS, ale nemá žádné `color-scheme`. Jak bude na tmavém pozadí vypadat textové pole `<input>` a posuvník stránky?

### --answer--
Tmavě, protože se přizpůsobí pozadí stránky.

#### --why--
Prohlížeč nekreslí formuláře podle barvy pozadí, kterou jsi nastavil. Potřebuje vědět, jaký motiv stránka podporuje.

### --correct--
Světle: bílé pole a světlý posuvník na tmavé stránce.

#### --why--
Bez `color-scheme` prohlížeč předpokládá, že stránka umí jen světlý motiv, a formulářové prvky i posuvníky kreslí světle. Za chvíli uvidíš, jak to změní jedna deklarace.

### --answer--
Pole zmizí, protože bude mít stejnou barvu jako pozadí.

#### --why--
Pole zůstane vidět, jen nebude ladit se stránkou.
:::

:::check pretest
Co podle tebe znamená `@media (prefers-reduced-motion: reduce)`?

### --answer--
Počítač je pomalý a prohlížeč žádá méně animací.

#### --why--
Výkon zařízení tahle podmínka neměří. Jde o nastavení, které si vybral člověk.

### --correct--
Uživatel si v systému zapnul omezení pohybu na obrazovce.

#### --why--
Omezení pohybu si zapínají třeba lidé, kterým z animací a paralaxy bývá nevolno. Podmínka jim dovolí dát klidnější verzi stránky.

### --answer--
Stránka běží v úsporném režimu baterie.

#### --why--
Úsporný režim s touhle podmínkou nesouvisí. Jde o nastavení přístupnosti v systému.
:::

## Problém: tmavý systém a bílá stránka

Media dotaz se nemusí ptát jen na šířku okna. Umí se zeptat i na **preferenci uživatele**, kterou prohlížeč převezme ze systému:

```css
@media (prefers-color-scheme: dark) {
  /* pravidla pro uživatele s tmavým režimem */
}
```

Kdybys ale tmavý motiv psal tak, že v media dotazu přepíšeš barvy u každé komponenty zvlášť, máš za chvíli dvě kopie všech barev po celém souboru a každá nová komponenta je past. Proto se barvy píšou do **[[design token|tokenů]]** (CSS proměnných) a komponenty používají jen je. Motiv pak na jednom místě přepíná hodnoty tokenů.

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --color-accent: #0f766e;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #111827;
    --color-text: #f3f4f6;
    --color-accent: #5eead4;
  }
}

.card {
  background: var(--color-bg);
  color: var(--color-text);
}
```

> [!REMEMBER]
> **Komponenty používají jen tokeny. Motiv na jednom místě mění hodnoty tokenů, ne pravidla komponent.** Nová komponenta pak funguje v obou motivech bez jediného řádku navíc.

> [!TIP]
> Tmavý motiv vyzkoušíš bez přepínání systému: v DevTools otevři Ctrl+Shift+P (Cmd+Shift+P), napiš „Rendering" a v panelu Rendering nastav „Emulate CSS media feature prefers-color-scheme" na `dark`. Stejně tam přepneš `prefers-reduced-motion`, `forced-colors` i tisk.

Tady je past, kvůli které tokeny nestačí jen „mít". Tmavé hodnoty jsou v ukázce nastavené natvrdo na obalu `.page`, abys je viděl bez přepínání systému. Než odkryješ náhled, tipni si:

:::live predict
```html
<div class="page">
  <article class="card">
    <h2 class="card__title">Chata U Jezera</h2>
    <p class="card__text">Dřevěná chata pro 6 osob, 50 metrů od vody.</p>
    <p class="card__price">2 400 Kč / noc</p>
  </article>
</div>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }

/* Světlé tokeny */
:root {
  --color-bg: #ffffff;
  --color-surface: #f3f4f6;
  --color-text: #1f2937;
  --color-muted: #6b7280;
}

/* Tmavé tokeny, tady natvrdo místo media dotazu */
.page {
  --color-bg: #111827;
  --color-surface: #1f2937;
  --color-text: #f3f4f6;
  --color-muted: #9ca3af;
  padding: 1.5rem;
  background: var(--color-bg);
}

.card { padding: 1rem 1.25rem; border-radius: 0.75rem; background: var(--color-surface); color: var(--color-text); }
.card__title { margin: 0 0 0.25rem; font-size: 1.25rem; }
.card__text { margin: 0 0 0.75rem; color: var(--color-muted); }
.card__price { margin: 0; color: #1f2937; font-weight: 700; }
```
--question-- Jak bude vidět cena „2 400 Kč / noc" v tmavé kartě?
--option-- Světle jako nadpis, protože karta má `color: var(--color-text)`.
--option*-- Skoro vůbec: tmavě šedý text na tmavě šedé kartě.
--option-- Tmavý text na světlém pozadí, protože cena má vlastní barvu.
--why-- Cena má barvu `#1f2937` zapsanou natvrdo, a ta přebije zděděnou `color` z karty. Tmavé tokeny ji nezmění, protože se na žádný token neodkazuje. V tmavém motivu je to stejná barva jako pozadí karty. Změň v kódu `color: #1f2937` na `color: var(--color-text)` a cena se objeví.
--see-- css-responzivita/preference-uzivatele#problem-tmavy-system-a-bila-stranka
:::

:::check
Designér přidal třetí barvu textu pro upozornění. Kam patří tmavá varianta její hodnoty?

### --answer--
Do pravidla komponenty, která upozornění zobrazuje, do nového media dotazu.

#### --why--
Tak by se tmavé barvy rozprchly po souboru. Každá další komponenta s upozorněním by potřebovala další media dotaz.

### --correct--
Nový token do `:root` a jeho tmavá hodnota do stejného bloku, kde se přepínají ostatní tokeny.

#### --why--
Komponenta použije `var(--color-warning)` a o motivu nic neví. Obě hodnoty tokenu jsou pohromadě na jednom místě.

### --answer--
Nikam, tmavý motiv si prohlížeč dopočítá sám.

#### --why--
Prohlížeč přizpůsobí jen své výchozí barvy a formuláře. Barvy, které jsi nastavil, nechá, jak jsou.
:::

## `color-scheme`: řekni prohlížeči, co stránka umí

Barvy, které nastavíš, jsou tvoje. Jenže stránka má i části, které kreslí prohlížeč: textová pole, zaškrtávátka, výběry, posuvníky a výchozí barvu textu a pozadí. Vlastnost [[color-scheme]] mu říká, které motivy stránka podporuje:

```css
:root {
  color-scheme: light dark;
}
```

S hodnotou `light dark` prohlížeč kreslí svoje prvky podle systému. Hodnota `dark` vynutí tmavé, `light` světlé. Stejnou informaci dej i do `<head>`, aby prohlížeč nezablikal bílou plochou dřív, než stáhne CSS:

```html
<meta name="color-scheme" content="light dark">
```

Přepínač v ukázce mění `color-scheme` stránky. Sleduj pole, výběr a zaškrtávátko:

:::live
```html
<form class="booking">
  <label>Jméno <input type="text" value="Jana Nováková"></label>
  <label>Počet nocí
    <select><option>2 noci</option><option>3 noci</option></select>
  </label>
  <label class="booking__check"><input type="checkbox" checked> Snídaně</label>
</form>
```
```css
:root {
  color-scheme: var(--scheme);
}

body { margin: 1rem; font-family: system-ui, sans-serif; }

.booking { display: grid; gap: 0.75rem; max-width: 18rem; }
.booking label { display: grid; gap: 0.25rem; }
.booking .booking__check { display: flex; align-items: center; gap: 0.5rem; }
```
```controls
--scheme: toggle(light, dark) = light | color-scheme
```
:::

Na `dark` ztmavne pozadí stránky, text zesvětlá a pole i výběr dostanou tmavý vzhled, přestože v CSS nejsou žádné barvy. Zkus `:root` dopsat `accent-color: #0f766e;` a zaškrtávátko se obarví v obou motivech.

:::check
Napiš deklaraci pro `:root`, která prohlížeči řekne, že stránka umí světlý i tmavý motiv.

### --expected--
color-scheme: light dark

### --accept--
color-scheme: dark light

### --why--
`color-scheme: light dark` dovolí prohlížeči kreslit formuláře, posuvníky a výchozí barvy podle systému. Bez toho je kreslí vždy světle.
:::

## `light-dark()`: dvě hodnoty v jedné deklaraci

Když stránka má `color-scheme: light dark`, můžeš tmavou hodnotu tokenu zapsat hned vedle světlé. Funkce [[light-dark()]] vrátí první barvu ve světlém motivu a druhou v tmavém:

```css
:root {
  color-scheme: light dark;
  --color-bg: light-dark(#ffffff, #111827);
  --color-text: light-dark(#1f2937, #f3f4f6);
}
```

Media dotaz na tokeny odpadne a obě hodnoty jsou na jednom řádku. Funkce se řídí **použitým** `color-scheme`, takže reaguje na systém i na to, co nastavíš ručně. Přepínač v ukázce mění `color-scheme` karty:

:::live
```html
<article class="card">
  <p class="card__badge">Volno o víkendu</p>
  <h2 class="card__title">Chata U Jezera</h2>
  <p class="card__text">Dřevěná chata pro 6 osob, 50 metrů od vody.</p>
  <p class="card__price">2 400 Kč / noc</p>
</article>
```
```css
:root {
  color-scheme: var(--scheme);
  --color-bg: light-dark(#f3f4f6, #030712);
  --color-surface: light-dark(#ffffff, #1f2937);
  --color-text: light-dark(#1f2937, #f3f4f6);
  --color-muted: light-dark(#6b7280, #9ca3af);
  --color-accent: light-dark(#0f766e, #5eead4);
}

body { margin: 0; padding: 1.5rem; font-family: system-ui, sans-serif; background: var(--color-bg); }

.card {
  max-width: 20rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: 0 10px 30px light-dark(rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.5));
  color: var(--color-text);
}

.card__badge { display: inline-block; margin: 0 0 0.5rem; padding: 0.125rem 0.5rem; border-radius: 999px; background: color-mix(in oklab, var(--color-accent) 18%, transparent); color: var(--color-accent); font-size: 0.8125rem; font-weight: 600; }
.card__title { margin: 0 0 0.25rem; font-size: 1.25rem; }
.card__text { margin: 0 0 0.75rem; color: var(--color-muted); }
.card__price { margin: 0; font-weight: 700; }
```
```controls
--scheme: toggle(light, dark) = light | color-scheme
```
:::

Přepni na `dark`: pozadí, karta, text, štítek i stín se změní naráz. Zkus v kódu smazat řádek `color-scheme: var(--scheme);` a přepínat znovu: karta zůstane světlá, protože `light-dark()` bez `color-scheme` vždycky vrací první hodnotu.

> [!PITFALL] `light-dark()` bez `color-scheme`
> *Příznak:* v DevTools emuluješ tmavý režim a stránka s `light-dark()` zůstane světlá.
>
> *Oprava:* `light-dark()` se řídí použitým `color-scheme`. Bez `color-scheme: light dark` na `:root` je vždycky světlý.

:::check
Stránka má `:root { color-scheme: light dark; }` a patička `footer { color-scheme: dark; background: light-dark(#fff, #000); }`. Uživatel má světlý systém. Jakou barvu pozadí bude mít patička? Napiš hodnotu.

### --expected--
#000

### --accept--
černou
černá
black

### --why--
`color-scheme` se dědí a jde přepsat na části stránky. Patička má vynucené `dark`, takže `light-dark()` v ní vrátí druhou hodnotu bez ohledu na systém.
:::

## Ruční přepínač motivu

Někdo chce tmavý web i ve světlém systému. Ruční přepínač nemusí přepisovat barvy: stačí mu změnit `color-scheme` na `:root` a tokeny s `light-dark()` se přizpůsobí samy. Se selektorem `:has()` to jde i bez JavaScriptu:

:::live
```html
<fieldset class="theme">
  <legend>Motiv</legend>
  <label><input type="radio" name="theme" value="system" checked> Podle systému</label>
  <label><input type="radio" name="theme" value="light"> Světlý</label>
  <label><input type="radio" name="theme" value="dark"> Tmavý</label>
</fieldset>

<article class="card">
  <h2 class="card__title">Chata U Jezera</h2>
  <p class="card__text">Dřevěná chata pro 6 osob, 50 metrů od vody.</p>
</article>
```
```css
:root {
  color-scheme: light dark;
  --color-bg: light-dark(#f3f4f6, #030712);
  --color-surface: light-dark(#ffffff, #1f2937);
  --color-text: light-dark(#1f2937, #f3f4f6);
  --color-muted: light-dark(#6b7280, #9ca3af);
}

:root:has(input[name="theme"][value="light"]:checked) {
  color-scheme: light;
}

:root:has(input[name="theme"][value="dark"]:checked) {
  color-scheme: dark;
}

body { margin: 0; padding: 1.25rem; font-family: system-ui, sans-serif; background: var(--color-bg); color: var(--color-text); }

.theme { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; margin: 0 0 1rem; border: 0; padding: 0; }
.theme legend { margin-bottom: 0.25rem; font-weight: 700; }
.card { max-width: 20rem; padding: 1.25rem; border-radius: 1rem; background: var(--color-surface); }
.card__title { margin: 0 0 0.25rem; font-size: 1.25rem; }
.card__text { margin: 0; color: var(--color-muted); }
```
:::

Klikej na volby. „Podle systému" nechá `light dark` z prvního pravidla, další dvě ho přepíšou. Aby si stránka volbu pamatovala i po obnovení, je potřeba ji uložit do `localStorage`; k tomu se dostaneš v sekci o DOM.

:::check
Ruční přepínač nastaví `color-scheme: dark` na `:root`, ale stránka používá tokeny přepínané přes `@media (prefers-color-scheme: dark)`. Ztmavnou barvy stránky ve světlém systému?

### --answer--
Ano, `color-scheme: dark` zapne i media dotaz `prefers-color-scheme`.

#### --why--
Media dotaz se ptá systému uživatele a na `color-scheme` stránky se neohlíží. Změní se jen to, co se řídí použitým motivem.

### --correct--
Ne, ztmavnou jen formuláře, posuvníky a výchozí barvy; tokeny v media dotazu zůstanou světlé.

#### --why--
`prefers-color-scheme` měří systém. Ruční přepínač s media dotazy potřebuje tokeny zapsat ještě jednou pro vlastní selektor. S `light-dark()` stačí změnit `color-scheme`.

### --answer--
Ne, `color-scheme` na `:root` nejde měnit, když už je nastavené.

#### --why--
`color-scheme` jde přepsat jako každou jinou vlastnost, i selektorem s `:has()`.
:::

## Omezený pohyb: `prefers-reduced-motion`

Animace, paralaxa a velké posuny obsahu můžou lidem s poruchou rovnováhy způsobit závrať nebo nevolnost. Kdo si v systému zapne [[omezený pohyb|omezení pohybu]] (*reduced motion*), dostane `prefers-reduced-motion: reduce`. Dva obvyklé zápisy:

```css
/* 1. Pohyb jen pro ty, kdo nic neomezili */
@media (prefers-reduced-motion: no-preference) {
  .card {
    transition: transform 0.3s;
  }

  .card:hover {
    transform: translateY(-4px);
  }
}

/* 2. Hotové animace utlumit pro ty, kdo omezení chtějí */
@media (prefers-reduced-motion: reduce) {
  .hero__slider {
    animation: none;
  }
}
```

Omezení pohybu neznamená žádnou odezvu. Změna barvy nebo průhlednosti při najetí myší je v pořádku, vadí pohyb a zvětšování. Přechody a animace podrobně přijdou v sekci o animacích; teď stačí vědět, kam je zabalit.

:::check
Karta se při najetí myší posune o 4 px nahoru a změní barvu rámečku. Co z toho vypneš uživateli s `prefers-reduced-motion: reduce`?

### --answer--
Obojí, uživatel nechce žádnou změnu.

#### --why--
Omezení se týká pohybu. Změna barvy nikoho nerozhoupe a pomáhá poznat, kde je myš.

### --correct--
Jen posun nahoru; změna barvy rámečku zůstane.

#### --why--
Pohyb a zvětšování jsou to, co může vadit. Barva, průhlednost a obrys dávají odezvu bez pohybu.

### --answer--
Nic, `prefers-reduced-motion` se týká jen animací přes `@keyframes`.

#### --why--
Týká se každého pohybu na obrazovce: přechodů, animací i plynulého posouvání stránky.
:::

## Kontrast a vynucené barvy

Dvě podmínky pro lidi, kteří hůř vidí:

- `prefers-contrast: more` — uživatel chce vyšší kontrast. Zesil rámečky, ztmav šedé texty, zruš poloprůhledné plochy.
- `forced-colors: active` — systém (třeba kontrastní režim ve Windows) **sám nahradí** tvoje barvy omezenou paletou. Pozadí, text i rámečky dostanou systémové barvy a `box-shadow` zmizí úplně.

```css
@media (prefers-contrast: more) {
  :root {
    --color-muted: #374151;
    --color-line: #111827;
  }
}

.button:focus-visible {
  /* V režimu vynucených barev zmizí stín, obrys zůstane */
  outline: 3px solid transparent;
  box-shadow: 0 0 0 3px var(--color-accent);
}
```

Druhé pravidlo je obvyklý trik: ve světlém i tmavém motivu je vidět barevný stín a průhledný obrys neruší. V režimu [[vynucené barvy|vynucených barev]] (*forced colors*) stín zmizí, ale obrys dostane systémovou barvu a fokus zůstane vidět.

:::check
Tlačítko ukazuje fokus jen přes `box-shadow` a nemá žádný `outline`. Co uvidí uživatel s kontrastním režimem Windows (`forced-colors: active`), když se na tlačítko dostane klávesou Tab?

### --answer--
Stín v systémové barvě.

#### --why--
V režimu vynucených barev prohlížeč stíny nepřebarvuje, ale odstraní je.

### --correct--
Nic, stín v tomhle režimu zmizí a fokus není vidět.

#### --why--
`forced-colors` odstraní `box-shadow`. Když má tlačítko i `outline` (třeba průhledný), dostane systémovou barvu a fokus zůstane vidět.

### --answer--
Výchozí modrý obrys prohlížeče.

#### --why--
Výchozí obrys se ukáže jen tam, kde ho styly nevypnuly. Tady fokus nese jen stín.
:::

## Myš, nebo prst: `hover` a `pointer`

Šířka okna neříká, čím uživatel ovládá stránku: tablet s klávesnicí je široký a má myš, notebook s dotykovou obrazovkou má obojí. Na to jsou podmínky:

| podmínka | platí, když hlavní ovládání |
|---|---|
| `(hover: hover)` | umí najet nad prvek (myš, touchpad) |
| `(hover: none)` | najet neumí (prst) |
| `(pointer: fine)` | je přesné (myš) |
| `(pointer: coarse)` | je nepřesné (prst) |

Variantou `any-hover` a `any-pointer` se ptáš, jestli **nějaké** připojené zařízení to umí.

```css
@media (hover: hover) {
  .gallery__item:hover .gallery__caption {
    opacity: 1;
  }
}

@media (pointer: coarse) {
  .toolbar button {
    min-block-size: 3rem;
  }
}
```

Informace, kterou ukazuje jen najetí myší, se na telefonu nedá zobrazit. Na dotykovém zařízení musí být vidět rovnou nebo po klepnutí.

:::check
Popisek fotky v galerii se objeví jen při `:hover`. Napiš podmínku media dotazu, do které zabalíš skrytí popisku, aby na telefonu zůstal vidět pořád.

### --expected--
(hover: hover)

### --accept--
hover: hover
(any-hover: hover)

### --why--
Na zařízení, které umí najet nad prvek, je popisek skrytý a ukáže se při najetí. Kde podmínka neplatí (prst), pravidlo se nepoužije a popisek je vidět.
:::

## Tisk: `@media print`

Lidé tisknou vstupenky, recepty, faktury a potvrzení objednávek. Podmínka `print` platí při tisku a v náhledu tisku:

```css
@media print {
  .site-header nav,
  .cookie-banner,
  .call-bar {
    display: none;
  }

  body {
    background: #fff;
    color: #000;
  }

  a[href^="http"]::after {
    content: " (" attr(href) ")";
  }

  .ticket {
    break-inside: avoid;
  }
}
```

Na papíře nejde klikat, proto navigaci a tlačítka skryj a u odkazů vypiš adresu. `break-inside: avoid` zabrání, aby se vstupenka roztrhla na dvě stránky. Náhled tisku uvidíš přes Ctrl+P, nebo v panelu Rendering přes „Emulate CSS media type".

:::check
Tmavý motiv podle systému funguje i na obrazovce. Proč v `@media print` přesto nastavit bílé pozadí a černý text?

### --answer--
Protože `@media print` přepíná `color-scheme` na světlé.

#### --why--
Tisk sám motiv stránky nemění; prohlížeče sice obvykle netisknou pozadí, text by ale zůstal světlý.

### --correct--
Protože tiskárna tiskne na bílý papír a světlý text z tmavého motivu by na něm skoro nebyl vidět.

#### --why--
Pozadí se většinou netiskne, text ano. Černý text na bílém je na papíře čitelný a šetří toner.

### --answer--
Protože jinak prohlížeč tisk odmítne.

#### --why--
Prohlížeč vytiskne i tmavou stránku. Výsledek by jen byl nečitelný nebo drahý na toner.
:::

## Typické chyby a pasti

> [!PITFALL] Barva natvrdo v komponentě
> *Příznak:* v tmavém motivu je cena, ikona nebo rámeček skoro neviditelný, zbytek karty je v pořádku.
>
> *Oprava:* hledej v pravidlech komponenty barvy bez `var(…)`. Každou barvu, která se v motivech liší, dej do tokenu.

> [!PITFALL] Tmavý motiv bez `color-scheme`
> *Příznak:* stránka ztmavla, ale textová pole, výběry a posuvník zůstaly oslnivě bílé.
>
> *Oprava:* přidej `:root { color-scheme: light dark; }` a `<meta name="color-scheme" content="light dark">`.

> [!PITFALL] Informace jen při najetí myší
> *Příznak:* na telefonu nejde zjistit cenu nebo popis, který se na počítači ukazuje při `:hover`; po klepnutí efekt „zůstane viset".
>
> *Oprava:* skrývání a hover efekty zabal do `@media (hover: hover)`. Na dotykovém zařízení je informace vidět rovnou.

:::explain
Vysvětli vlastními slovy, proč je na tmavý motiv lepší přepínat hodnoty tokenů (media dotazem nebo `light-dark()`) než přepisovat barvy u každé komponenty.

## --model--
Když komponenty používají jen tokeny, tmavý motiv změní hodnoty na jednom místě a všechny komponenty se přizpůsobí najednou, i ty, které přidám později. Přepisování barev u každé komponenty vytvoří druhou kopii všech barev po celém souboru a snadno na nějakou zapomenu. Navíc ruční přepínač pak jen změní `color-scheme` nebo sadu tokenů, ne desítky pravidel.

## --checklist--
- Komponenty používají jen tokeny, ne barvy natvrdo.
- Motiv mění hodnoty tokenů na jednom místě.
- Nová komponenta pak funguje v obou motivech sama.
- Přepisování barev po komponentách vede k zapomenutým místům.
:::

:::check
Karta má `background: var(--color-surface)` a rámeček `border: 1px solid #e5e7eb`. V tmavém motivu je karta tmavá, ale kolem ní svítí světle šedý rámeček. Co opravíš?

### --answer--
Přidám do `@media (prefers-color-scheme: dark)` pravidlo `.card { border-color: #374151; }`.

#### --why--
Funguje to, jenže tím začínáš psát tmavé barvy po komponentách. U dalšího rámečku se problém vrátí.

### --correct--
Rámeček dostane token, třeba `var(--color-line)`, s tmavou hodnotou tam, kde se přepínají ostatní tokeny.

#### --why--
Barva rámečku se v motivech liší, patří tedy do tokenu. Komponenta pak o motivu nic neví.

### --answer--
Rámeček smažu, v tmavém motivu rámečky nejsou potřeba.

#### --why--
Rámeček odděluje kartu od pozadí v obou motivech. Problém je v tom, že jeho barva nereaguje na motiv.
:::

Příště to všechno spojíš v labu: blog, který se přizpůsobí oknu, místu karet a motivu, který si čtenář vybere.

## Kde to najdeš v MDN

- [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) — podmínka pro světlý a tmavý režim systému a jak ji emulovat v DevTools.
- [light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) — funkce se dvěma barvami a proč potřebuje `color-scheme`.
- [color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) — hodnoty, dědění a značka `<meta name="color-scheme">`.
- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — komu omezení pohybu pomáhá a jak k němu přizpůsobit animace.

# --questions--

## --question--

Stránka má `:root { color-scheme: light dark; --color-text: light-dark(#111, #eee); }` a uživatel má tmavý systém. Jakou barvu bude mít text s `color: var(--color-text)`? Napiš hodnotu.

### --expected--

#eee

### --why--

S `color-scheme: light dark` se použitý motiv řídí systémem. V tmavém systému vrátí `light-dark()` druhou hodnotu.

### --see--

css-responzivita/preference-uzivatele#light-dark-dve-hodnoty-v-jedne-deklaraci

## --question--

Galerie má efekt `.photo:hover { transform: scale(1.05); }` zabalený v `@media (prefers-reduced-motion: no-preference)`. Co uvidí uživatel, který si v systému omezení pohybu nezapnul?

### --answer--

Nic, efekt se použije jen s omezeným pohybem.

#### --why--

`no-preference` znamená, že uživatel nic neomezil. Podmínka tedy platí pro běžné uživatele.

### --correct--

Fotka se při najetí myší zvětší.

#### --why--

Kdo nic nenastavil, splňuje `no-preference`, a efekt dostane. Uživatel s omezeným pohybem ho nedostane, protože podmínka pro něj neplatí.

### --answer--

Fotka se zvětší, jen když má zařízení myš.

#### --why--

Tahle podmínka se na myš neptá. Na to by byla `(hover: hover)`.

### --see--

css-responzivita/preference-uzivatele#omezeny-pohyb-prefers-reduced-motion

## --question--

Napiš podmínku media dotazu, která platí, když hlavní ovládání stránky je nepřesné, typicky prst.

### --expected--

(pointer: coarse)

### --accept--

pointer: coarse

### --why--

`pointer: coarse` znamená nepřesné ovládání. Hodí se na větší dotykové cíle v nástrojových lištách.

### --see--

css-responzivita/preference-uzivatele#mys-nebo-prst-hover-a-pointer
