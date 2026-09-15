# Přechody, transformace a výkon

Tlačítko, které při najetí myší plynule ztmavne, karta produktu, která se nadzvedne, nabídka, která se vysune a zase zasune. Tyhle drobnosti dělají rozdíl mezi webem, který „funguje", a webem, který působí hotově. Postavíš je ze tří nástrojů: přechodů, transformací a znalosti, co prohlížeč stojí který pohyb.

Než začneš číst, tipni si dvě odpovědi. Nikdo je nehodnotí.

:::check pretest
Karta v seznamu se má při najetí myší zvednout o 8 px. Která deklarace v pravidle `:hover` kartu posune, aniž by se pohnulo cokoli pod ní?

### --answer--
`margin-top: -8px`

#### --why--
Záporný margin změní rozvržení: karta se posune, ale posunou se s ní i všechny prvky pod ní.

### --correct--
`translate: 0 -8px`

#### --why--
Posun přes transformaci se kreslí až po rozvržení stránky. Karta se pohne, místo v rozvržení jí zůstane stejné.

### --answer--
`padding-bottom: 8px`

#### --why--
Větší padding kartu zvětší a všechno pod ní odtlačí dolů. Karta se nezvedne, jen naroste.
:::

:::check pretest
Animace trvá 300 ms a obrazovka se překresluje 60× za sekundu. Kolik snímků musí prohlížeč za tu dobu připravit?

### --expected--
18

### --accept--
18 snímků

### --why--
300 ms je 0,3 s a 0,3 × 60 = 18. Na jeden snímek má prohlížeč jen asi 16,7 ms. Proč na tom záleží, uvidíš v části o výkonu.
:::

## Problém: změna stavu skokem

Tady je tlačítko košíku. Při najetí myší ztmavne a nadzvedne se, jenže skokem: v jednom snímku je světlé, v dalším tmavé.

:::live
```html
<button class="button" type="button">Přidat do košíku</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.button {
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 999px;
  background: #0f766e;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.button:hover {
  background: #134e4a;
  translate: 0 -2px;
}
```
:::

Najeď na tlačítko myší. Pak do pravidla `.button` (ne do `:hover`) dopiš `transition: background-color 200ms ease-out, translate 200ms ease-out;` a najeď znovu. Stejná změna teď trvá pětinu sekundy a oko ji vnímá jako pohyb, ne jako bliknutí.

> [!REMEMBER]
> **[[přechod|Přechod]] (*transition*) neurčuje, co se změní, ale jak: když se hodnota vlastnosti změní, prohlížeč ji místo skoku dopočítá snímek po snímku.** Samotnou změnu dělá jiné pravidlo — `:hover`, třída přidaná JavaScriptem, otevřený `<details>`.

:::check
Napiš deklaraci, která způsobí, že se změna průhlednosti (`opacity`) odehraje plynule za 250 ms.

### --expected--
transition: opacity 250ms

### --accept--
transition: opacity 0.25s
transition: opacity .25s
transition: opacity 250ms ease

### --why--
Shorthand `transition` potřebuje aspoň vlastnost a délku. Křivka je nepovinná, výchozí je `ease`.
:::

## Zápis `transition`: vlastnost, délka, křivka, zpoždění

Shorthand `transition` skládá čtyři dílčí vlastnosti:

| dílčí vlastnost | co určuje | výchozí |
|---|---|---|
| `transition-property` | kterou vlastnost animovat | `all` |
| `transition-duration` | jak dlouho | `0s` |
| `transition-timing-function` | jakou křivkou (zrychlení a zpomalení) | `ease` |
| `transition-delay` | jak dlouho počkat před začátkem | `0s` |

V shorthandu na pořadí skoro nezáleží, s jednou výjimkou: **první čas je vždycky délka, druhý zpoždění**. `transition: opacity 300ms 100ms` tedy čeká 100 ms a pak 300 ms animuje. Víc vlastností oddělíš čárkou a každá může mít jiné časy.

Změnu stavu v ukázce dělá přepínač `--pos`. Přepni ho, pak změň délku a křivku a přepni znovu:

:::live
```html
<div class="track">
  <div class="ball"></div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.track {
  width: 18rem;
  padding: 0.5rem;
  border-radius: 999px;
  background: #e2e8f0;
}

.ball {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #7c3aed;
  translate: var(--pos) 0;
  transition: translate var(--duration) var(--easing);
}
```
```controls
--pos: toggle(0rem, 16rem) | Stav (posun)
--duration: range(100, 2000, 100, ms) = 600 | transition-duration
--easing: select(ease, linear, ease-in, ease-out, ease-in-out, "cubic-bezier(0.34, 1.56, 0.64, 1)") = ease | transition-timing-function
```
:::

Nastav délku na 2000 ms a přepni stav dvakrát rychle za sebou. Přechod se v půlce otočí a jede zpátky z místa, kde zrovna je — přechody na přerušení reagují samy.

Kam `transition` napsat, rozhoduje o víc věcech, než se zdá. Tipni si:

:::live predict
```html
<button class="button" type="button">Rezervovat</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.button {
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 0.5rem;
  background: #1d4ed8;
  color: white;
  font: inherit;
}

.button:hover {
  background: #f97316;
  transition: background-color 600ms ease-out;
}
```
--question-- Najedeš myší na tlačítko a pak z něj odjedeš. Co udělá barva při **odjezdu**?
--option-- Plynule se za 600 ms vrátí do modré.
--option*-- Skokem se vrátí do modré.
--option-- Zůstane oranžová, dokud znovu nenajedeš.
--why-- Prohlížeč použije přechod ze stavu, **do kterého** prvek přechází. Po odjezdu už tlačítko `:hover` neodpovídá, platí jen pravidlo `.button`, a to žádný `transition` nemá — takže skok. Přesuň `transition` do `.button` a animovat se bude oběma směry.
--see-- css-animace/transition-transform#zapis-transition-vlastnost-delka-krivka-zpozdeni
:::

:::check
Prvek má `transition: opacity 300ms ease-in 150ms`. Za kolik milisekund od změny `opacity` bude přechod hotový?

### --expected--
450

### --accept--
450 ms
450ms

### --why--
První čas je délka (300 ms), druhý zpoždění (150 ms). Přechod začne po 150 ms a skončí o 300 ms později.
:::

## Časovací funkce: jak se pohyb zrychluje

Časovací funkce (*easing*) říká, jak rychle se hodnota v průběhu přechodu mění. Skutečné věci se nepohybují rovnoměrně, proto `linear` u pohybu působí strojově.

- `ease` (výchozí) — rychlý rozjezd, dlouhé dobrzdění. Univerzální, ale nijak výrazné.
- `ease-out` — začne rychle a zpomalí. **Nejlepší volba pro reakci na uživatele** a pro prvky, které se objevují: rozhraní reaguje hned.
- `ease-in` — začne pomalu a zrychlí. Hodí se pro prvky, které odcházejí pryč z obrazovky. Na reakci na kliknutí působí líně.
- `ease-in-out` — pomalu, rychle, pomalu. Pro pohyb z jednoho místa na druhé, třeba posun karuselu.
- `linear` — stálá rychlost. Pro otáčení spinneru nebo změnu barvy, ne pro pohyb.
- `cubic-bezier(x1, y1, x2, y2)` — vlastní křivka. Když je `y` větší než 1, hodnota přestřelí cíl a vrátí se: [[překmit]] (*overshoot*), který dělá „pružné" tlačítko. `cubic-bezier()` i další zápisy rozebere lekce o klíčových snímcích.

Délka pro drobné prvky rozhraní je obvykle **150–300 ms**. Kratší pohyb oko nepostřehne, delší už uživatele zdržuje. Velké plochy (vysouvací panel přes celou obrazovku) snesou 300–500 ms.

:::check
Po kliknutí na ikonu se vysune nabídka. Která časovací funkce bude působit nejsvižněji?

### --answer--
`ease-in`

#### --why--
`ease-in` začíná pomalu, takže první desítky milisekund po kliknutí se skoro nic neděje. Rozhraní působí, jako by kliknutí nezaregistrovalo.

### --correct--
`ease-out`

#### --why--
`ease-out` se rozjede hned a dobrzdí na konci. Uživatel vidí odezvu v prvním snímku.

### --answer--
`linear`

#### --why--
Stálá rychlost nejde proti uživateli, ale pohyb bez zpomalení působí mechanicky a konec je „useknutý".
:::

## Transformace: posun, zvětšení, otočení

[[transformace|Transformace]] (*transform*) posune, zvětší, otočí nebo zkosí vykreslený prvek. Moderní CSS má pro tři nejčastější samostatné vlastnosti:

| vlastnost | příklad | co udělá |
|---|---|---|
| `translate` | `translate: 0 -8px` | posun (x, y) |
| `scale` | `scale: 1.05` | zvětšení, `scale: 1 0` zploští do čáry |
| `rotate` | `rotate: 45deg` | otočení, `0.5turn` je půl otáčky |
| `transform` | `transform: translate(0, -8px) rotate(45deg)` | starší zápis, funkce v jednom seznamu |

Důležité je, **kdy** se transformace uplatní: až po rozvržení stránky. Prvek si v rozvržení drží původní místo a sousedé o jeho zvětšení nevědí. Obě varianty níž zvětšují prostřední položku, liší se jedinou deklarací:

:::compare
```html
<ol class="steps">
  <li>Vyber termín</li>
  <li class="active">Vyplň údaje</li>
  <li>Zaplať</li>
</ol>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.steps {
  width: 14rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.steps li {
  margin-block: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: #e0f2fe;
}

.steps .active {
  background: #0284c7;
  color: white;
}
```
--variant-- padding: 1.25rem 1.5rem
```css
.steps .active { padding: 1.25rem 1.5rem; }
```
--variant-- scale: 1.15
```css
.steps .active { scale: 1.15; }
```
:::

Větší padding odtlačí „Zaplať" dolů, protože ==změnil rozvržení==. `scale` položku zvětší až při vykreslení na obrazovku, ==rozvržení nemění==, a tak přeteče přes sousedy.

Transformace se provádí kolem **počátku** (*transform origin*), výchozí je střed prvku. Mění ho `transform-origin`:

:::live
```html
<div class="stage">
  <div class="card">Vstupenka</div>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.stage {
  display: grid;
  place-items: center;
  width: 16rem;
  height: 12rem;
  border: 2px dashed #cbd5e1;
}

.card {
  padding: 1.5rem 2rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #f43f5e, #f97316);
  color: white;
  font-weight: 700;
  rotate: var(--angle);
  transform-origin: var(--origin);
}
```
```controls
--angle: range(-90, 90, 15, deg) = 30 | rotate
--origin: select(center, top left, bottom right, bottom center) = center | transform-origin
```
:::

Nastav úhel na 30 stupňů a projdi hodnoty `transform-origin`. U `top left` se vstupenka otáčí kolem levého horního rohu jako dvířka na pantu.

Ve funkci `transform` **záleží na pořadí zápisu**: `rotate(90deg) translate(100px)` pošle prvek dolů, protože posun se provede v už otočených souřadnicích, kdežto `translate(100px) rotate(90deg)` doprava. Zkus to v ukázce výš dopsat do `.card` místo `rotate`.

Samostatné vlastnosti mají pořadí pevné, jako by byly zapsané na začátku jednoho seznamu: `translate`, `rotate`, `scale` a za nimi teprve `transform`. Prakticky to znamená, že posun zapsaný vlastností `translate` zůstane přesně takový, jak jsi ho napsal, i když prvek zvětšíš nebo otočíš.

Z pořadí vzniká nejčastější past s transformacemi. Tipni si:

:::live predict
```html
<div class="product">
  <span class="product__badge">Novinka</span>
  <p class="product__name">Batoh Rozvoj 28 l</p>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 3rem 2rem; }

.product {
  position: relative;
  width: 16rem;
  padding: 2rem 1rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  text-align: center;
}

.product__badge {
  position: absolute;
  top: 0;
  left: 50%;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: #16a34a;
  color: white;
  font-size: 0.875rem;
  transform: translate(-50%, -50%);
}

.product:hover .product__badge {
  transform: scale(1.15);
}
```
--question-- Štítek je vycentrovaný na horní hraně karty. Co s ním udělá najetí myší na kartu?
--option-- Zvětší se a zůstane vycentrovaný.
--option*-- Zvětší se a uskočí doprava dolů.
--option-- Nezmění se, protože `transform` už je nastavený.
--why-- `transform` je jedna vlastnost se seznamem funkcí. Pravidlo v `:hover` celý seznam **nahradí**, takže `translate(-50%, -50%)` zmizí a štítek se vrátí na `left: 50%` bez vycentrování. Oprava: centruj samostatnou vlastností `translate: -50% -50%` a v `:hover` přidej `scale: 1.15` — každá vlastnost má svou hodnotu a nic se nepřepíše. (Kdybys nechal centrování v `transform` a přidal jen `scale`, štítek by se posunul o pár pixelů: `transform` je v pořadí až za `scale`, takže se zvětší i posun.)
--see-- css-animace/transition-transform#transformace-posun-zvetseni-otoceni
:::

:::check
Obrázek v galerii má při najetí myší zvětšit na 110 % tak, aby se sousední obrázky neposunuly. Napiš deklaraci.

### --expected--
scale: 1.1

### --accept--
transform: scale(1.1)
scale: 110%

### --why--
Transformace se uplatní až po rozvržení, sousedé o zvětšení nevědí. `width: 110%` by rozvržení změnilo a obrázky by se posunuly.
:::

## Objevení a zmizení: `@starting-style` a `allow-discrete`

Přechod potřebuje dvě hodnoty: odkud a kam. U prvku, který se právě objevil (přidaný do stránky, `display: none` přepnuté na `block`, otevřený popover), žádné „odkud" není — v předchozím snímku prvek neexistoval. Proto se místo animace ukáže rovnou v cílovém stavu.

- [[@starting-style]] definuje styl, ze kterého přechod začne, když se prvek poprvé vykreslí.
- `display` jde změnit jen skokem, animovat nejde. S `transition-behavior: allow-discrete` (v shorthandu slovo `allow-discrete` za délkou) ho prohlížeč přepne až **na konci** zavírání, takže prvek zůstane vidět, dokud nedoběhne průhlednost.
- U popoveru a `<dialog>` přidej stejně i `overlay`: drží prvek ve vrstvě nad stránkou až do konce animace. Umí to zatím jen Chromium, jinde se deklarace tiše ignoruje a zavření proběhne o chlup dřív.

Nabídka níž používá atribut `popover` z HTML, žádný JavaScript. Otevři a zavři ji:

:::live
```html
<button class="button" type="button" popovertarget="share">Sdílet</button>
<div class="menu" id="share" popover>
  <a href="#">Kopírovat odkaz</a>
  <a href="#">Poslat e-mailem</a>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.button {
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  background: white;
  font: inherit;
}

.menu {
  margin: auto;
  padding: 0.5rem;
  border: 0;
  border-radius: 0.75rem;
  box-shadow: 0 1rem 2rem rgb(15 23 42 / 0.2);
  opacity: 0;
  translate: 0 0.5rem;
  transition:
    opacity 250ms ease-out,
    translate 250ms ease-out,
    display 250ms allow-discrete,
    overlay 250ms allow-discrete;
}

.menu:popover-open {
  opacity: 1;
  translate: 0 0;
}

@starting-style {
  .menu:popover-open {
    opacity: 0;
    translate: 0 0.5rem;
  }
}

.menu a {
  display: block;
  padding: 0.5rem 1rem;
  color: #0f172a;
}
```
:::

Pořadí pravidel není náhoda: `@starting-style` stojí **za** pravidlem `:popover-open`, protože má stejnou specificitu a vyhrát musí právě on. Zkus teď z `transition` smazat řádek s `display` a nabídku otevřít a zavřít. Jeden směr animovat přestane — který, si tipni:

:::live predict
```html
<button type="button" popovertarget="tip">Nápověda</button>
<p class="tip" id="tip" popover>Cenu uvidíš po výběru termínu.</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.tip {
  padding: 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: #0f172a;
  color: white;
  opacity: 0;
  transition: opacity 400ms ease-out;
}

.tip:popover-open {
  opacity: 1;
}

@starting-style {
  .tip:popover-open {
    opacity: 0;
  }
}
```
--question-- Popover má `@starting-style`, ale `display` v přechodu chybí. Co bude animované?
--option*-- Jen otevření, zavření proběhne skokem.
--option-- Jen zavření, otevření proběhne skokem.
--option-- Obojí, `display` v přechodu nic nemění.
--why-- Při otevření se `display` přepne okamžitě na `block` a průhlednost začne z `@starting-style`, to funguje. Při zavření se ale `display: none` přepne taky okamžitě a neviditelnému prvku není co animovat. Až `display 400ms allow-discrete` odloží přepnutí na konec přechodu.
--see-- css-animace/transition-transform#objeveni-a-zmizeni-starting-style-a-allow-discrete
:::

:::check
Oznámení se objevuje přidáním třídy, která mu změní `display: none` na `display: block`. Má `transition: opacity 300ms` a průhlednost se mění z 0 na 1, ale objeví se skokem. Co chybí?

### --answer--
`transition-delay`, aby se animace stihla připravit.

#### --why--
Zpoždění jen odloží začátek. Přechod stejně nemá výchozí hodnotu, ze které by začal, protože prvek v minulém snímku nebyl vykreslený.

### --correct--
Pravidlo v `@starting-style` s `opacity: 0` pro zobrazený stav.

#### --why--
Prvek s `display: none` nemá žádný styl, ze kterého by přechod začal. `@starting-style` ho dodá.

### --answer--
`transition-behavior: allow-discrete` na `opacity`.

#### --why--
`opacity` je spojitá vlastnost, animuje se sama. `allow-discrete` je pro vlastnosti, které jdou měnit jen skokem, jako `display`, a řeší hlavně zavírání.
:::

## Proč `transform` a `opacity`: cesta k pixelům

Aby se na obrazovce něco změnilo, projde stránka [[cesta k pixelům|cestou k pixelům]] (*rendering pipeline*):

1. **Styl** — prohlížeč spočítá, která pravidla na prvek platí.
2. **Rozvržení** (*layout*) — spočítá polohu a velikost všech dotčených prvků. Změna jednoho prvku často pohne sousedy, rodičem i celou stránkou.
3. **Kreslení** (*paint*) — vybarví pixely: text, pozadí, stíny, okraje.
4. **Skládání** (*composite*) — hotové vrstvy složí na sebe a pošle na obrazovku, klidně na grafické kartě.

Animace musí stihnout každý snímek za ~16,7 ms. Záleží proto, **od které fáze** musí prohlížeč v každém snímku začít znovu:

| animuješ | začíná znovu od | cena |
|---|---|---|
| `width`, `height`, `margin`, `padding`, `top`, `left`, `font-size` | rozvržení | nejdražší, na slabém telefonu zadrhává |
| `color`, `background-color`, `box-shadow`, `border-radius` | kreslení | střední, u velkých ploch znát |
| `transform`, `translate`, `scale`, `rotate`, `opacity` | skládání | nejlevnější, zvládne ho grafická karta |

> [!REMEMBER]
> **Pohyb a zvětšení animuj přes transformace, objevení přes `opacity`.** Jen tyhle vlastnosti prohlížeč umí změnit bez nového rozvržení i kreslení, pouhým přeskládáním hotových vrstev.

Tipni si, která karta zatěžuje prohlížeč nejvíc:

:::live predict
```html
<div class="row">
  <article class="card card--a">A</article>
  <article class="card card--b">B</article>
  <article class="card card--c">C</article>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.row { display: flex; gap: 1rem; }

.card {
  display: grid;
  place-items: center;
  width: 6rem;
  height: 8rem;
  border-radius: 1rem;
  background: #f1f5f9;
  font-size: 2rem;
  font-weight: 700;
  transition: translate 300ms, margin-top 300ms, box-shadow 300ms;
}

.card--a:hover { translate: 0 -12px; }
.card--b:hover { margin-top: -12px; }
.card--c:hover { box-shadow: 0 1.5rem 2rem rgb(15 23 42 / 0.25); }
```
--question-- Která karta při najetí myší nutí prohlížeč v každém snímku přechodu znovu spočítat rozvržení?
--option-- A, protože se posouvá.
--option*-- B, protože mění `margin-top`.
--option-- C, protože stín zabírá velkou plochu.
--why-- `margin-top` je vlastnost rozvržení: každý snímek znamená nové rozvržení, kreslení i skládání. Karta A dojede na stejné místo jen skládáním. C nutí prohlížeč znovu kreslit stín, ale rozvržení se nemění. Přesvědčíš se v DevTools, návod je v tipu pod ukázkou.
--see-- css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum
:::

> [!TIP]
> Otevři ukázku v nové kartě a spusť DevTools. V panelu **Rendering** (menu ⋮ → More tools → Rendering) zapni **Paint flashing**: zeleně bliká všechno, co se znovu kreslí. V panelu **Performance** nahraj pár vteřin najíždění myší a hledej fialové bloky **Layout** — u karty B jich uvidíš řadu, u karty A žádný.

Prohlížeč umí prvek předem přesunout do vlastní vrstvy, když mu řekneš `will-change: transform`. První snímek animace pak nezačne vytvořením vrstvy. Každá vrstva ale zabírá paměť grafické karty, a tak `will-change` patří jen na prvky, které se **opravdu brzy** budou hýbat, ne na všechno „pro jistotu". Prohlížeče vrstvy pro běžící přechody a animace transformací vytvářejí samy, ve většině případů `will-change` nepotřebuješ vůbec.

:::explain
Vysvětli vlastními slovy, proč se posun karty animuje přes `translate`, a ne přes `top` nebo `margin-top`.

## --model--
Každá změna `top` nebo `margin-top` spustí nové rozvržení stránky a po něm kreslení a skládání, a to v každém snímku animace. `translate` se uplatní až při skládání hotových vrstev, rozvržení ani kreslení se opakovat nemusí. Na jeden snímek je jen asi 16 ms, takže dražší animace na slabším zařízení zadrhává, zatímco transformace běží plynule. Sousední prvky se navíc při `translate` nepohnou.

## --checklist--
- Změna `top` nebo `margin-top` spustí rozvržení v každém snímku.
- `translate` se uplatní až ve fázi skládání.
- Na snímek je jen asi 16 ms, drahé fáze způsobí zadrhávání.
- Transformace nemění rozvržení, sousedé se nepohnou.
:::

:::check
Animuješ šířku postranního panelu (`width`). Ve které fázi cesty k pixelům musí prohlížeč v každém snímku začít znovu pracovat (po výpočtu stylu)?

### --expected-- ignore-case
rozvržení

### --accept--
layout
rozvrzeni

### --why--
Šířka mění polohu a velikost prvků, takže každý snímek spustí rozvržení, po něm kreslení i skládání. Místo `width` se vyplatí animovat `scale` nebo `translate` celého panelu.
:::

## Omezený pohyb: `prefers-reduced-motion`

Část lidí má v systému zapnuté omezení animací (Windows: *Zobrazit animace*, macOS a iOS: *Omezit pohyb*, Android: *Odstranit animace*). Důvody jsou různé: poruchy rovnováhy, kdy posun a přibližování vyvolávají závrať a nevolnost, migréna, epilepsie nebo potíže se soustředěním. Web to pozná přes media dotaz `prefers-reduced-motion`.

> [!REMEMBER]
> **Omezený pohyb neznamená žádnou zpětnou vazbu.** Pryč mají jít posuny, zvětšování, otáčení a paralaxa. Změna barvy nebo krátké prolnutí průhlednosti zůstat smí — uživatel dál vidí, že na tlačítko najel.

```css
.card {
  transition: translate 250ms ease-out, box-shadow 250ms ease-out;
}

.card:hover {
  translate: 0 -6px;
  box-shadow: 0 1rem 2rem rgb(15 23 42 / 0.15);
}

@media (prefers-reduced-motion: reduce) {
  .card:hover {
    translate: none;
  }
}
```

Karta při omezeném pohybu nezvedá, stín se ale objeví dál. Opačný zápis je taky běžný: pohyb píšeš jen do `@media (prefers-reduced-motion: no-preference) { … }`, takže prohlížeč bez podpory nebo s omezením pohybu ho vůbec nedostane.

> [!TIP]
> Nemusíš přepínat nastavení systému. V DevTools otevři panel **Rendering** a v části **Emulate CSS media feature prefers-reduced-motion** zvol `reduce`.

:::check
Co je při `prefers-reduced-motion: reduce` nejlepší udělat s kartou, která se při najetí myší zvedá a mění barvu rámečku?

### --answer--
Nechat všechno, jak je, jde jen o drobný posun.

#### --why--
Pro člověka s poruchou rovnováhy nejsou problém jednotlivé pixely, ale součet pohybů na celé stránce. Drobné zvednutí karet při projíždění mřížky je přesně ten druh pohybu, který omezit chce.

### --correct--
Zrušit zvednutí a změnu barvy rámečku nechat.

#### --why--
Pohyb pryč, zpětná vazba zůstane. Uživatel pořád vidí, na které kartě je.

### --answer--
Zrušit všechny přechody včetně změny barvy, aby se nic nehýbalo.

#### --why--
Změna barvy není pohyb. Když ji zrušíš taky, přijde uživatel o užitečnou zpětnou vazbu, aniž by mu to v něčem pomohlo.
:::

## Typické chyby a pasti

> [!PITFALL] Přechod jen v `:hover`
> *Příznak:* najetí myší je plynulé, odjezd skokem (nebo naopak).
>
> *Oprava:* `transition` patří do základního pravidla prvku. Prohlížeč bere přechod ze stavu, do kterého prvek právě přechází.

> [!PITFALL] `transition: all`
> *Příznak:* po přepnutí tmavého motivu se celá stránka půl vteřiny přebarvuje, nebo se při změně velikosti okna plynule „dotahují" šířky a rozvržení zadrhává.
>
> *Oprava:* vyjmenuj vlastnosti, které animovat chceš: `transition: translate 200ms, opacity 200ms`.

> [!PITFALL] `transform` v `:hover` smaže původní transformaci
> *Příznak:* vycentrovaný štítek nebo ikona při najetí myší uskočí.
>
> *Oprava:* posun i zvětšení zapiš samostatnými vlastnostmi (`translate: -50% -50%` a v `:hover` `scale: 1.15`), nebo v `:hover` zopakuj celý seznam `transform: translate(-50%, -50%) scale(1.15)`.

Poslední past se týká obyčejného odkazu nebo `<span>` v textu. Tipni si:

:::live predict
```html
<p class="lead">
  Rezervuj si stůl na sobotu.
  <a class="more" href="#">Vybrat čas <span class="more__arrow">→</span></a>
</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; font-size: 1.25rem; }

.more__arrow {
  transition: translate 200ms ease-out;
}

.more:hover .more__arrow {
  translate: 6px 0;
}
```
--question-- Co udělá šipka při najetí myší na odkaz?
--option-- Plynule popojede o 6 px doprava.
--option*-- Nepohne se vůbec.
--option-- Skočí o 6 px doprava, bez přechodu.
--why-- Transformace platí jen pro prvky s krabičkou, kterou jde transformovat: blokové, `inline-block`, flex a grid položky, obrázky. Obyčejný řádkový prvek jako `<span>` nebo `<a>` v textu transformovat nejde a deklarace se tiše ignoruje. Přidej `.more__arrow { display: inline-block; }` a šipka pojede.
--see-- css-animace/transition-transform#typicke-chyby-a-pasti
:::

> [!PITFALL] Transformace řádkového prvku
> *Příznak:* `translate`, `scale` nebo `rotate` na `<span>`, `<a>` nebo `<strong>` uprostřed textu nic nedělá a DevTools neukazuje chybu.
>
> *Oprava:* dej prvku `display: inline-block` (nebo ho udělej flex položkou).

> [!PITFALL] `display` na popoveru
> *Příznak:* nabídka s atributem `popover` je vidět hned po načtení stránky a zavřít nejde, nebo se po zavření neschová.
>
> *Oprava:* zavřený popover skrývá prohlížeč přes `display: none`. Když mu napíšeš `display: flex` do základního pravidla, skrytí přebiješ. `display` dej jen otevřenému stavu: `.menu:popover-open { display: flex; }`.

> [!PITFALL] Efekt jen pro myš
> *Příznak:* karta se při najetí myší zvedá, ale kdo prochází stránku klávesou Tab, nevidí nic — fokus má odkaz uvnitř karty, ne karta.
>
> *Oprava:* vedle `:hover` použij `:focus-within`, které platí, když fokus má prvek sám nebo kterýkoli jeho potomek: `.card:is(:hover, :focus-within) { … }`.

> [!PITFALL] Animace vlastností rozvržení
> *Příznak:* akordeon, vysouvací panel nebo „rostoucí" karta na telefonu zadrhává; v Performance je řada bloků Layout.
>
> *Oprava:* pohyb přes `translate` a `scale`, objevení přes `opacity`. Kde se změně velikosti nevyhneš (akordeon), animuj jen jeden prvek a krátce.

> [!PITFALL] `will-change` všude
> *Příznak:* stránka se spoustou karet s `will-change: transform` spotřebuje stovky MB paměti grafické karty a na telefonu se text při posouvání rozmazává.
>
> *Oprava:* `will-change` smaž. Vrstvy pro animace vytváří prohlížeč sám; ruční nápověda patří jen tam, kde jsi v Performance změřil, že první snímek zadrhne.

:::check
Karta má `transition: translate 200ms` a v `:hover` `translate: 0 -4px`. Uživatel ale ovládá stránku klávesnicí a na kartě je odkaz. Přechod ani posun se mu neukážou. Kterou pseudotřídu přidáš do selektoru vedle `:hover`, aby karta reagovala i na fokus odkazu uvnitř?

### --expected--
:focus-within

### --accept--
focus-within
.card:focus-within

### --why--
`:focus-within` platí pro prvek, když má fokus on sám nebo kterýkoli jeho potomek. `:focus` nebo `:focus-visible` na kartě by nezabral, fokus má odkaz, ne karta.
:::

Ve workshopu z přechodů a transformací postavíš mikrointerakce webu horské chaty: tlačítka, která povolí pod prstem, karty pokojů, vysouvací nabídku sdílení a akordeon s dotazy.

## Kde to najdeš v MDN

- [Using CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions) — zápis `transition`, víc vlastností najednou a události `transitionend`.
- [@starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) — objevení prvků, popover a `<dialog>` s `allow-discrete` a `overlay`, i s tabulkou podpory.
- [transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) a [translate](https://developer.mozilla.org/en-US/docs/Web/CSS/translate) — všechny transformační funkce, pořadí a které prvky jde transformovat.
- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — media dotaz a kde uživatelé omezení v systému zapínají.

# --questions--

## --question--

Nabídka má tohle CSS a v jednom okamžiku se změní její `opacity` i `translate`. Za kolik milisekund od té změny bude nabídka úplně v klidu?

```css
.menu {
  transition: opacity 200ms ease-out 50ms, translate 250ms ease-out;
}
```

### --expected--

250

### --accept--

250 ms
250ms

### --why--

Každá vlastnost má vlastní časy. `opacity` skončí po 50 + 200 = 250 ms, `translate` po 250 ms. Nabídka je v klidu, až skončí ta pozdější, tady obě zároveň.

### --see--

css-animace/transition-transform#zapis-transition-vlastnost-delka-krivka-zpozdeni

## --question--

Ikona `.icon` je svisle vycentrovaná přes `top: 50%` a `transform: translateY(-50%)`. Při najetí myší na tlačítko se má zvětšit na 1,2násobek a zůstat **přesně** vycentrovaná. Napiš jednu deklaraci pro pravidlo `.button:hover .icon`, když pravidlo `.icon` měnit nechceš.

### --expected--

transform: translateY(-50%) scale(1.2)

### --accept--

transform: translate(0, -50%) scale(1.2)
transform: translateY(-50%) scale(120%)

### --why--

`transform: scale(1.2)` by celý seznam nahradila a ikona by uskočila. Samostatné `scale: 1.2` taky nestačí: provede se před `transform`, takže zvětší i posun o −50 % a ikona se posune o desetinu své výšky. Zopakovaný seznam posun zachová a zvětšení přidá. Kdybys směl měnit i pravidlo `.icon`, nejčistší je centrovat přes `translate: 0 -50%` a zvětšovat přes `scale`.

### --see--

css-animace/transition-transform#transformace-posun-zvetseni-otoceni

## --question--

Tlačítko A má `transition: padding 200ms` a při najetí myší zvětší `padding`. Tlačítko B má `transition: scale 200ms` a při najetí myší se zvětší přes `scale: 1.05`. Které tvrzení platí?

### --answer--

Obě jsou stejně náročná, protože přechod trvá stejně dlouho.

#### --why--

Délka určuje, kolik snímků prohlížeč připraví. Kolik práce ho stojí jeden snímek, rozhoduje animovaná vlastnost.

### --correct--

A v každém snímku přepočítá rozvržení a posune sousedy, B jen přeskládá vrstvy.

#### --why--

`padding` je vlastnost rozvržení, takže každý snímek spustí rozvržení, kreslení i skládání a okolní prvky se hýbou s ním. `scale` se uplatní až při skládání a sousedé o zvětšení nevědí.

### --answer--

B je náročnější, protože zvětšuje i text a ten se musí v každém snímku znovu vykreslit.

#### --why--

Při `scale` prohlížeč zvětšuje už nakreslenou vrstvu, text znovu nekreslí. Proto se může na chvíli nepatrně rozmazat, ale snímek je levný.

### --see--

css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum

## --question--

Napiš podmínku media dotazu (i se závorkami), která platí pro uživatele, kteří mají v systému zapnuté omezení pohybu.

### --expected--

(prefers-reduced-motion: reduce)

### --accept--

prefers-reduced-motion: reduce
@media (prefers-reduced-motion: reduce)

### --why--

Hodnota `reduce` znamená, že uživatel pohyb omezit chce. Opačná hodnota je `no-preference`.

### --see--

css-animace/transition-transform#omezeny-pohyb-prefers-reduced-motion
