# Klíčové snímky

Načítací kolečko, pulzující tečka „živě" u přenosu, skeleton, který se leskne, než dorazí data, rámeček karty, po kterém obíhá světlo. Nic z toho nečeká na najetí myší — pohyb běží sám. Na to přechod nestačí, potřebuješ animaci s klíčovými snímky.

Než začneš, tipni si dvě odpovědi.

:::check pretest
Čím se animace přes `@keyframes` nejvíc liší od přechodu `transition`?

### --answer--
Animace jsou výkonnější, přechody se hodí jen na barvy.

#### --why--
Výkon určuje animovaná vlastnost, ne to, jestli jde o přechod, nebo animaci. `transform` je levný v obou, `width` drahá v obou.

### --correct--
Animace se spustí sama a může mít libovolně mnoho mezikroků; přechod potřebuje změnu stavu a zná jen začátek a konec.

#### --why--
Přesně tak. Kolečko, které se točí bez přestání, přechodem nenapíšeš — nic se na něm „nemění".

### --answer--
Animace jde napsat jen v JavaScriptu.

#### --why--
`@keyframes` je čisté CSS. JavaScript animace umí ovládat, ale nepotřebuje je.
:::

:::check pretest
Prvek má `animation: pulse 2s 3`. Kolik sekund bude animace běžet, než skončí?

### --expected--
6

### --accept--
6 s
6s

### --why--
Délka jednoho průběhu je 2 s a číslo bez jednotky je počet opakování. 3 × 2 = 6 sekund.
:::

## Problém: pohyb bez změny stavu

Přechod dopočítá změnu, když se hodnota vlastnosti změní. Načítací kolečko ale žádný „jiný stav" nemá — má se točit pořád dokola, dokud nedorazí data. Tady je napsané přes [[klíčové snímky]] (*keyframes*):

:::live
```html
<div class="loading" role="status">
  <span class="spinner"></span>
  <span>Načítám jízdní řády…</span>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #334155;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 3px solid #cbd5e1;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    rotate: 1turn;
  }
}
```
:::

Zkus změnit `800ms` na `3s` a pak `linear` na `ease-in-out`. S `ease-in-out` kolečko na konci každé otáčky zpomalí a znovu se rozjede — u načítání to působí, jako by se zasekávalo.

> [!REMEMBER]
> **`@keyframes` popisuje celý průběh pohybu na časové ose a vlastnost `animation` ho prvku přehraje — sama, bez změny stavu, klidně pořád dokola.** Přechod naproti tomu jen dopočítá jednu změnu mezi dvěma stavy.

:::check
Blok `@keyframes spin` v ukázce má jen snímek `to`. Odkud se vezme hodnota `rotate` na začátku animace?

### --answer--
Ze snímku `from`, který si prohlížeč doplní jako `rotate: 1turn`.

#### --why--
Kdyby začátek i konec měly `1turn`, kolečko by stálo. Chybějící snímek se doplňuje jinak.

### --correct--
Z vlastního stylu prvku; `.spinner` otočení nemá, takže animace začne od nuly.

#### --why--
Chybějící `from` (0 %) nebo `to` (100 %) doplní prohlížeč hodnotou, kterou má prvek bez animace.

### --answer--
Nijak, bez `from` se animace nespustí.

#### --why--
`from` i `to` jsou nepovinné. V ukázce se kolečko točí, i když `from` chybí.
:::

## `@keyframes` a vlastnost `animation`

Blok `@keyframes jméno { … }` obsahuje snímky: `from` (= `0%`), `to` (= `100%`) a libovolná procenta mezi nimi. Každý snímek říká, jaké hodnoty mají vlastnosti v daném okamžiku; mezi snímky prohlížeč dopočítá plynulý přechod.

```css
@keyframes bounce-in {
  0%   { opacity: 0; scale: 0.6; }
  60%  { opacity: 1; scale: 1.08; }
  100% { scale: 1; }
}
```

Vlastnost `animation` je shorthand pro osm dílčích vlastností:

| dílčí vlastnost | co určuje | výchozí |
|---|---|---|
| `animation-name` | jméno `@keyframes` | `none` |
| `animation-duration` | délka jednoho průběhu | `0s` |
| `animation-timing-function` | křivka | `ease` |
| `animation-delay` | zpoždění před prvním průběhem | `0s` |
| `animation-iteration-count` | počet opakování, `infinite` = pořád | `1` |
| `animation-direction` | `normal`, `reverse`, `alternate` (tam a zpět), `alternate-reverse` | `normal` |
| `animation-fill-mode` | jaký styl platí před začátkem a po konci | `none` |
| `animation-play-state` | `running`, nebo `paused` | `running` |

Stejně jako u přechodu platí: **první čas je délka, druhý zpoždění**. Nejvíc překvapí [[animation-fill-mode]]. Přepni v ukázce `Přehrát znovu` a sleduj, kde krabička stojí před začátkem (zpoždění je 1 s) a kde po konci:

:::live
```html
<div class="track">
  <div class="parcel"></div>
</div>
<p class="note">Zásilka jede z depa k tobě.</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.track {
  width: 20rem;
  padding: 0.5rem;
  border-radius: 999px;
  background: #e2e8f0;
}

.parcel {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #f59e0b, #b45309);
  translate: 8rem 0;
  animation-name: var(--run);
  animation-duration: 1500ms;
  animation-delay: 1s;
  animation-timing-function: ease-in-out;
  animation-fill-mode: var(--fill);
  animation-direction: var(--direction);
}

.note { color: #64748b; }

@keyframes drive-a {
  from { translate: 0 0; }
  to { translate: 17rem 0; }
}

@keyframes drive-b {
  from { translate: 0 0; }
  to { translate: 17rem 0; }
}
```
```controls
--run: toggle(drive-a, drive-b) | Přehrát znovu
--fill: select(none, forwards, backwards, both) = none | animation-fill-mode
--direction: select(normal, reverse, alternate) = normal | animation-direction
```
:::

Krabička má v pravidle `translate: 8rem 0`, tedy stojí uprostřed. S `none` stojí uprostřed během zpoždění i po konci a snímky platí jen ve chvíli, kdy animace běží. `backwards` použije první snímek už během zpoždění, `forwards` podrží poslední snímek po konci, `both` dělá obojí. (Přepínač „Přehrát znovu" střídá dvě stejné animace s jiným jménem — změna jména animaci spustí od začátku.)

:::live predict
```html
<p class="toast">Rezervace uložena</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.toast {
  width: fit-content;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  background: #0f172a;
  color: white;
  animation: fade-out 400ms ease-in 2s;
}

@keyframes fade-out {
  to {
    opacity: 0;
    translate: 0 1rem;
  }
}
```
--question-- Oznámení má po dvou sekundách zmizet. Co se stane, až animace skončí?
--option-- Oznámení zůstane neviditelné.
--option*-- Oznámení se znovu objeví na původním místě.
--option-- Oznámení se odstraní ze stránky.
--why-- Bez `animation-fill-mode` platí styl ze snímků jen během animace. Po konci se použije styl prvku, a ten má `opacity: 1`. Dopiš za `2s` slovo `forwards` a oznámení zůstane skryté. (Ze stránky ho CSS neodstraní nikdy — prvek tam zůstane jen neviditelný, na to je potřeba JavaScript nebo popover.)
--see-- css-animace/keyframes#keyframes-a-vlastnost-animation
:::

:::check
Napiš deklaraci `animation`, která prvku přehraje `@keyframes slide-in` za 300 ms s křivkou `ease-out` a po skončení nechá prvek ve stavu posledního snímku.

### --expected--
animation: slide-in 300ms ease-out forwards

### --accept--
animation: slide-in 0.3s ease-out forwards
animation: slide-in .3s ease-out forwards
animation: slide-in 300ms ease-out both
animation: slide-in 0.3s ease-out both

### --why--
`forwards` podrží poslední snímek po konci. `both` k tomu přidá i první snímek během zpoždění — tady je zpoždění nulové, takže funguje stejně.
:::

## Časování: `cubic-bezier()`, `steps()` a `linear()`

Časovací funkce z přechodů (`ease`, `ease-out`…) platí i pro animace, s jedním háčkem: **křivka se použije na každý úsek mezi dvěma snímky zvlášť**, ne na celou animaci. Animace se snímky 0 %, 50 % a 100 % s `ease-in-out` proto uprostřed zpomalí, zastaví a znovu se rozjede.

Tři zápisy pro vlastní průběh:

- `cubic-bezier(x1, y1, x2, y2)` — plynulá křivka ze dvou řídicích bodů. `x` jsou mezi 0 a 1 (čas), `y` smí přesáhnout 1 (překmit). V DevTools klikni na ikonku křivky vedle hodnoty a táhni body myší.
- `steps(n)` — žádná plynulost, jen `n` skoků. Hodiny, psaní na stroji, obrázková animace z pásu snímků. `steps(n, jump-none)` ukáže začátek i konec.
- `linear(…)` — lomená čára z bodů `hodnota procento`. Z dost bodů složíš pružinu nebo odraz, které `cubic-bezier()` neumí, protože se vrací víckrát.

Obě varianty níž mají stejný kód, liší se jen časovací funkcí. Obě jsou skutečné hodiny na nádraží — která ručička je věrnější?

:::compare
```html
<div class="clock"><span class="hand"></span></div>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.clock {
  position: relative;
  width: 8rem;
  height: 8rem;
  border: 4px solid #0f172a;
  border-radius: 50%;
  background: repeating-conic-gradient(#0f172a 0 1deg, transparent 1deg 30deg) content-box;
  padding: 2px;
}

.hand {
  position: absolute;
  left: calc(50% - 1px);
  bottom: 50%;
  width: 2px;
  height: 45%;
  background: #dc2626;
  transform-origin: bottom center;
  animation: tick 12s infinite;
}

@keyframes tick {
  to { rotate: 1turn; }
}
```
--variant-- linear
```css
.hand { animation-timing-function: linear; }
```
--variant-- steps(12)
```css
.hand { animation-timing-function: steps(12); }
```
:::

S `linear` se ručička posouvá plynule, se `steps(12)` přeskočí každou sekundu o jednu čárku. Zkus místo `steps(12)` napsat `linear(0, 0.7 40%, 1 60%, 0.94 75%, 1)` — ručička na konci přestřelí a vrátí se jako pružina.

> [!TIP]
> Pružné křivky pro `linear()` se nepíšou ručně. Na webu *Linear easing generator* (Jake Archibald) nastavíš pružinu nebo odraz a zkopíruješ hotovou funkci.

:::check
Ručička stopek má za 60 sekund udělat 60 skoků, bez plynulého pohybu mezi nimi. Napiš hodnotu `animation-timing-function`.

### --expected--
steps(60)

### --accept--
steps(60, end)
steps(60, jump-end)

### --why--
`steps(60)` rozdělí jeden průběh na 60 stejných skoků. `linear` by ručičkou posouvala plynule.
:::

## Opakování, směr a zpoždění

- `infinite` + `alternate` = pohyb tam a zpět, ideální pro pulzování: `animation: pulse 1s ease-in-out infinite alternate`.
- Víc animací na jednom prvku oddělíš čárkou: `animation: fade-in 300ms ease-out, float 3s ease-in-out 300ms infinite alternate`.
- **Záporné zpoždění** spustí animaci, jako by už kus běžela. `animation-delay: -0.5s` u animace dlouhé 2 s začne rovnou ve čtvrtině. Tak se rozfázují tečky načítání, aby neskákaly všechny naráz a hned od prvního snímku.
- `animation-play-state: paused` animaci zastaví na místě a `running` ji rozběhne odtamtud.

:::live
```html
<div class="typing" role="status" aria-label="Petra píše">
  <span></span><span></span><span></span>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; }

.typing {
  display: flex;
  gap: 0.375rem;
  width: fit-content;
  padding: 0.875rem 1rem;
  border-radius: 1.25rem 1.25rem 1.25rem 0.25rem;
  background: #e2e8f0;
}

.typing span {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #475569;
  animation: dot 1.2s ease-in-out infinite;
}

.typing span:nth-child(2) { animation-delay: var(--delay-2); }
.typing span:nth-child(3) { animation-delay: var(--delay-3); }

.typing:hover span { animation-play-state: paused; }

@keyframes dot {
  0%, 60%, 100% { translate: 0 0; opacity: 0.4; }
  30% { translate: 0 -0.375rem; opacity: 1; }
}
```
```controls
--delay-2: select(0s, -1s, 0.2s) = -1s | Zpoždění 2. tečky
--delay-3: select(0s, -0.8s, 0.4s) = -0.8s | Zpoždění 3. tečky
```
:::

Nastav obě zpoždění na `0s`: tečky skáčou naráz. S kladnými `0.2s` a `0.4s` jsou rozfázované, ale po obnovení náhledu druhá a třetí tečka chvíli stojí. Záporné hodnoty dají stejné rozfázování hned od začátku. Najeď na bublinu myší — `paused` animaci zastaví.

:::check
Animace trvá 2 s a má `animation-delay: -0.5s`. V kolika procentech průběhu bude animace v okamžiku, kdy se prvek poprvé vykreslí?

### --expected--
25

### --accept--
25 %
25%

### --why--
Záporné zpoždění znamená, že půl sekundy „už uběhlo". 0,5 s ze 2 s je čtvrtina, tedy 25 %.
:::

## `@property`: animace gradientů a vlastních proměnných

Gradient animovat nejde: `linear-gradient(0deg, …)` a `linear-gradient(90deg, …)` jsou dva různé obrázky a prohlížeč mezi nimi přepne skokem. Obvyklý trik je dát úhel do custom property, jenže ani to samo nestačí. Custom property je pro prohlížeč jen kus textu a text neumí dopočítat mezi `0deg` a `360deg`.

[[@property]] custom property zaregistruje s typem. Jakmile prohlížeč ví, že `--angle` je úhel, umí ho animovat jako kteroukoli jinou vlastnost — a gradient, který ho používá, se překreslí v každém snímku.

Obě karty mají stejný kód se světlem obíhajícím po rámečku, liší se jen tím, jestli je `--angle` zaregistrovaná:

:::compare
```html
<article class="card">
  <p class="card__label">Nový tarif</p>
  <p class="card__title">Neomezená data</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem; background: #0f172a; }

.card {
  width: 14rem;
  padding: 1.5rem;
  border: 2px solid transparent;
  border-radius: 1rem;
  background:
    linear-gradient(#1e293b, #1e293b) padding-box,
    conic-gradient(from var(--angle), #334155 0 70%, #38bdf8 85%, #334155) border-box;
  color: white;
  animation: orbit 3s linear infinite;
}

.card__label { margin: 0; color: #94a3b8; font-size: 0.875rem; }
.card__title { margin: 0.25rem 0 0; font-size: 1.25rem; font-weight: 700; }

@keyframes orbit {
  from { --angle: 0deg; }
  to { --angle: 360deg; }
}
```
--variant-- bez @property
```css
.card { --angle: 0deg; }
```
--variant-- s @property
```css
@property --angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}
```
:::

Bez registrace světlo v polovině animace skočí na druhou stranu a zase zpátky: text se přepíná jen v půlce, stejně jako `display`. S `@property` obíhá plynule.

> [!NOTE]
> Tahle animace mění gradient, a to je fáze kreslení, ne jen skládání. U jedné karty to nevadí. Kdyby takhle svítilo padesát karet v mřížce, sleduj Performance — nebo animuj jen kartu, na kterou uživatel najede.

:::check
Proč se bez `@property` custom property `--angle` v `@keyframes` neanimuje plynule?

### --answer--
Custom properties se nesmí používat v `@keyframes`.

#### --why--
V ukázce bez `@property` se `--angle` v `@keyframes` použít dá, jen skáče. Problém není v tom, jestli ji použít smíš.

### --correct--
Neregistrovaná custom property je pro prohlížeč text bez typu, a text neumí dopočítat mezi dvěma hodnotami, tak ho přepne skokem.

#### --why--
`@property` s `syntax: "<angle>"` řekne, že jde o úhel. Mezi úhly už prohlížeč mezihodnoty spočítat umí.

### --answer--
`conic-gradient` animace nepodporuje; s `linear-gradient` by to fungovalo.

#### --why--
Gradient jako celek nejde animovat nikdy, žádný typ. Animovat jde číslo nebo úhel uvnitř, když má typ.
:::

## Výkon a omezený pohyb u animací

Pro animace platí stejná [[cesta k pixelům]] jako pro přechody: `transform`, `translate`, `scale`, `rotate` a `opacity` stojí jen skládání, `width`, `top` nebo `margin` rozvržení v každém snímku. U animací je to ještě důležitější, protože často běží pořád dokola, i když se na ně nikdo nedívá.

- **Skeleton s leskem** nepiš přes animovaný `background-position` celé plochy. Lesk dej do pseudoprvku s gradientem a posouvej ho přes `translate`.
- **Nekonečná animace** ať běží jen tam, kde má smysl: kolečko, dokud se načítá, ne dekorace na pozadí celé stránky.
- **`prefers-reduced-motion: reduce`** — pohyb, který nenese informaci (plovoucí ilustrace, lesk, poskakující šipka), vypni úplně. Pohyb, který informaci nese (načítání), nahraď klidnější formou: místo točení pomalé pulzování průhledností.

```css
.spinner {
  animation: spin 800ms linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: pulse 1.5s ease-in-out infinite alternate;
  }
}

@keyframes pulse {
  from { opacity: 0.4; }
}
```

:::check
Na stránce je dekorativní ilustrace, která pořád pomalu pluje nahoru a dolů, a načítací kolečko u formuláře. Co je správně pro uživatele s `prefers-reduced-motion: reduce`?

### --answer--
Obojí nechat, animace jsou pomalé.

#### --why--
Pomalý plynulý pohyb, který nikdy nepřestane, je pro lidi s poruchou rovnováhy často horší než rychlé bliknutí.

### --correct--
Ilustraci zastavit, kolečko nahradit klidnou animací bez pohybu, třeba pulzováním průhlednosti.

#### --why--
Ilustrace žádnou informaci nenese, a tak může stát. Uživatel ale pořád potřebuje vědět, že se něco načítá — jen bez točení.

### --answer--
Obojí úplně vypnout, i kolečko.

#### --why--
Zastavené kolečko vypadá jako zamrzlá stránka. Uživatel neví, jestli se ještě něco děje.
:::

## Přechod, nebo animace?

| | `transition` | `animation` + `@keyframes` |
|---|---|---|
| spustí ho | změna hodnoty (stav, třída, `:hover`) | přiřazení animace prvku (i při vykreslení) |
| mezikroky | jen začátek a konec | libovolně snímků |
| opakování | ne | `animation-iteration-count`, `infinite` |
| přerušení | otočí se plynule z aktuální hodnoty | skočí na nový začátek |
| typické použití | hover, fokus, otevření nabídky, akordeon | načítání, pulzování, nástup s překmitem, lesk |

:::check
Uživatel najede myší na kartu a karta se začne zvedat. V půlce pohybu myš zase odjede. Kterým nástrojem se karta nejpřirozeněji vrátí z místa, kde zrovna je?

### --answer--
`animation` se snímky nahoru a dolů, spuštěná třídou.

#### --why--
Odebrání třídy animaci ukončí a prvek skočí do výchozího stavu, nebo nová animace začne od svého prvního snímku, ne z aktuální polohy.

### --correct--
`transition` na `translate`.

#### --why--
Přechod při přerušení počítá z aktuální hodnoty, takže se plynule otočí.

### --answer--
Obojí se zachová stejně.

#### --why--
Liší se právě v přerušení: přechod se otočí z aktuální hodnoty, animace začíná ze svých snímků.
:::

:::explain
Vysvětli vlastními slovy, kdy použiješ `transition` a kdy `animation` s `@keyframes`. Uveď u každého jeden příklad z rozhraní.

## --model--
Přechod použiju, když se mění stav a chci, aby změna mezi dvěma hodnotami byla plynulá — třeba tlačítko při najetí myší nebo otevření nabídky. Když stav změním zpátky v půlce, přechod se plynule otočí. Animaci s `@keyframes` použiju, když má pohyb běžet sám bez změny stavu, mít víc mezikroků nebo se opakovat — třeba načítací kolečko nebo pulzující tečka.

## --checklist--
- Přechod spouští změna hodnoty mezi dvěma stavy.
- Přechod se při přerušení plynule otočí.
- Animace běží sama a může se opakovat.
- Animace umí víc mezikroků než začátek a konec.
- Ke každému je uvedený příklad z rozhraní.
:::

## Typické chyby a pasti

> [!PITFALL] Po skončení skočí zpátky
> *Příznak:* prvek vyjede nebo zmizí a po konci animace se vrátí do původního stavu.
>
> *Oprava:* `animation-fill-mode: forwards` (v shorthandu slovo `forwards`), nebo nastav cílový stav přímo v pravidle prvku a animace ať jen vede k němu.

> [!PITFALL] Zadrhávání na každém snímku
> *Příznak:* animace se čtyřmi snímky a `ease-in-out` se v každém snímku zastaví a znovu rozjede.
>
> *Oprava:* křivka platí pro každý úsek zvlášť. Pro plynulý pohyb přes víc snímků použij `linear`, nebo křivku nastav jen u konkrétních snímků (`animation-timing-function` smí být i uvnitř snímku).

> [!PITFALL] `transform` ve snímcích přepíše centrování
> *Příznak:* vycentrované modální okno s `transform: translate(-50%, -50%)` při animaci `transform: scale(…)` uskočí stranou.
>
> *Oprava:* ve snímcích animuj samostatné vlastnosti (`scale`, `translate`), centrování nech v `translate: -50% -50%` — stejná past jako u přechodů.

> [!PITFALL] Animace se nespustí po zobrazení
> *Příznak:* prvek s `display: none` dostane `display: block` a animace nástupu proběhne, ale když prvek jen skryješ přes `opacity` a zase ukážeš, podruhé už nic.
>
> *Oprava:* animace se spouští, když prvek začne animaci mít (vykreslí se, dostane třídu, změní se `animation-name`). Na opakovaný nástup přepínej třídu nebo použij přechod se `@starting-style`.

:::check
Modální okno je vycentrované přes `transform: translate(-50%, -50%)` a při otevření má animaci `@keyframes pop { from { transform: scale(0.9); } }`. Během animace okno uskočí stranou. Napiš jednu deklaraci pro snímek `from`, se kterou okno zůstane vycentrované a jen se zvětší.

### --expected--
transform: translate(-50%, -50%) scale(0.9)

### --accept--
transform: translate(-50%,-50%) scale(0.9)

### --why--
Snímek s `transform` nahradí celý seznam funkcí z pravidla, takže centrování během animace zmizí. Buď ho ve snímku zopakuješ, nebo centruješ přes `translate: -50% -50%` a ve snímku animuješ jen `scale`.
:::

## Kde to najdeš v MDN

- [Using CSS animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations) — `@keyframes`, všechny dílčí vlastnosti `animation` a události `animationend`.
- [animation-fill-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode) — `none`, `forwards`, `backwards` a `both` s ukázkami.
- [easing-function](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function) — `cubic-bezier()`, `steps()` s `jump-*` a `linear()` se všemi zápisy.
- [@property](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) — `syntax`, `inherits`, `initial-value` a proč registrovaná vlastnost jde animovat.

# --questions--

## --question--

Co uvidí uživatel během první sekundy po načtení stránky?

```css
.hero__image {
  opacity: 1;
  animation: appear 600ms ease-out 1s;
}

@keyframes appear {
  from { opacity: 0; }
}
```

### --answer--

Obrázek bude průhledný a po sekundě se prolne.

#### --why--

Myslíš si, že první snímek platí už během zpoždění? Bez `backwards` (nebo `both`) platí během zpoždění styl prvku.

### --correct--

Obrázek bude vidět, po sekundě zmizí a během 600 ms se znovu prolne.

#### --why--

Během zpoždění platí `opacity: 1` z pravidla. Animace pak začne snímkem `from` s nulovou průhledností. Oprava je `animation-fill-mode: backwards`.

### --answer--

Obrázek nebude vidět vůbec, animace s chybějícím `to` se nespustí.

#### --why--

Chybějící `to` doplní prohlížeč hodnotou z pravidla prvku, tedy `opacity: 1`. Animace poběží.

### --see--

css-animace/keyframes#keyframes-a-vlastnost-animation

## --question--

Napiš deklaraci `animation`, která přehraje `@keyframes pulse` za 1 s s křivkou `ease-in-out` pořád dokola a pokaždé tam a zpátky.

### --expected--

animation: pulse 1s ease-in-out infinite alternate

### --accept--

animation: pulse 1000ms ease-in-out infinite alternate
animation: pulse 1s ease-in-out alternate infinite

### --why--

`infinite` je počet opakování a `alternate` směr, který každý druhý průběh obrátí. Na pořadí slov kromě časů nezáleží.

### --see--

css-animace/keyframes#opakovani-smer-a-zpozdeni

## --question--

Animace `@keyframes wave` má snímky `0%`, `25%`, `50%`, `75%` a `100%` a na prvku `animation: wave 2s ease-in-out infinite`. Kolikrát za jeden průběh se pohyb zpomalí téměř do zastavení?

### --expected--

4

### --accept--

čtyřikrát
4x

### --why--

Křivka `ease-in-out` se použije na každý ze čtyř úseků mezi snímky zvlášť, každý úsek na konci zpomalí. Pro plynulý pohyb patří na celou animaci `linear`.

### --see--

css-animace/keyframes#casovani-cubic-bezier-steps-a-linear

## --question--

Karta má gradient s úhlem z `--angle` a animaci, která `--angle` mění z `0deg` na `360deg`. Světlo ale v půlce skočí. Napiš hodnotu deskriptoru `syntax` v bloku `@property --angle`, která to spraví.

### --expected--

"<angle>"

### --accept--

'<angle>'
<angle>
syntax: "<angle>"

### --why--

`syntax` říká, jakého typu hodnota je. Úhly prohlížeč dopočítat umí, text bez typu ne.

### --see--

css-animace/keyframes#property-animace-gradientu-a-vlastnich-promennych
