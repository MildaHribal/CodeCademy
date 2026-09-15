---
pass: 0.8
---

# --questions--

## --question--

Boční menu se vysouvá zleva přes přechod. Napiš deklaraci pro **zavřený** stav, se kterou je menu posunuté o celou svou šířku doleva a animace nebude přepočítávat rozvržení.

### --expected--

translate: -100% 0

### --accept--

transform: translateX(-100%)
translate: -100%
transform: translate(-100%)
transform: translate(-100%, 0)

### --why--

Procenta v `translate` se počítají z velikosti samotného prvku, takže `-100%` ho posune přesně o jeho šířku. `left: -20rem` nebo `width: 0` by animovaly vlastnosti rozvržení.

### --see--

css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum

## --question--

Za kolik milisekund od změny obou vlastností doběhne zvětšení tlačítka?

```css
.button {
  transition: scale 150ms ease-out 50ms, opacity 300ms;
}
```

### --expected--

200

### --accept--

200 ms
200ms

### --why--

U `scale` je první čas délka (150 ms) a druhý zpoždění (50 ms): začne po 50 ms, skončí po 200 ms. Délka `opacity` se ho netýká.

### --see--

css-animace/transition-transform#zapis-transition-vlastnost-delka-krivka-zpozdeni

## --question--

Co uvidíš po skončení animace?

```css
.welcome {
  opacity: 0;
  animation: show 500ms ease-out;
}

@keyframes show {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### --answer--

Uvítání zůstane viditelné, protože poslední snímek má `opacity: 1`.

#### --why--

Myslíš si, že poslední snímek po konci platí dál? Jen s `animation-fill-mode: forwards`.

### --correct--

Uvítání se prolne a po skončení animace zase zmizí.

#### --why--

Bez `forwards` se po konci použije styl prvku, a ten má `opacity: 0`. Oprava: `forwards`, nebo `opacity: 1` v pravidle a snímek jen `from`.

### --answer--

Uvítání nebude vidět vůbec, protože `opacity: 0` v pravidle animaci přebije.

#### --why--

Hodnoty z běžící animace mají před běžnými pravidly přednost, takže během animace se prvek prolne.

### --see--

css-animace/keyframes#keyframes-a-vlastnost-animation

## --question--

Kolik milisekund po načtení stránky se prvek poprvé vrátí zpátky do stavu snímku `from`?

```css
.arrow {
  animation: nudge 500ms ease-in-out 200ms infinite alternate;
}
```

### --expected--

1200

### --accept--

1200 ms
1200ms
1,2 s

### --why--

200 ms zpoždění, pak 500 ms tam (`from` → `to`) a díky `alternate` 500 ms zpátky. 200 + 500 + 500 = 1200.

### --see--

css-animace/keyframes#opakovani-smer-a-zpozdeni

## --question--

Titulní obrázek na úvodní stránce se při scrollu posouvá pomaleji než text (parallaxa) a tlačítka při najetí myší mění barvu. Co uděláš pro uživatele s `prefers-reduced-motion: reduce`?

### --answer--

Nic, parallaxa i změna barvy jsou jen jemné efekty.

#### --why--

Parallaxa je právě ten druh pohybu, který lidem s poruchou rovnováhy vadí nejvíc: celá plocha se hýbe jinak než zbytek stránky.

### --correct--

Parallaxu vypneš, změnu barvy tlačítek necháš.

#### --why--

Omezit se má pohyb. Změna barvy nic neposouvá a uživateli dál ukazuje, kde je myš.

### --answer--

Vypneš obojí, aby na stránce nebyla žádná animace.

#### --why--

Omezený pohyb neznamená žádnou zpětnou vazbu. Změna barvy není pohyb a uživatel o ni zbytečně přijde.

### --see--

css-animace/transition-transform#omezeny-pohyb-prefers-reduced-motion

## --question--

Dialog `<dialog>` se otevírá plynule díky `@starting-style`, ale zavře se skokem. Pravidlo dialogu má `transition: opacity 200ms, scale 200ms`. Napiš položku, kterou do seznamu přidáš, aby se `display: none` přepnulo až po doběhnutí prolnutí.

### --expected--

display 200ms allow-discrete

### --accept--

display 0.2s allow-discrete
display .2s allow-discrete
display allow-discrete 200ms
display 200ms allow-discrete, overlay 200ms allow-discrete

### --why--

Zavřený dialog má `display: none` a to se bez `allow-discrete` přepne hned v prvním snímku, takže prolnutí běží na neviditelném prvku. `allow-discrete` odloží přepnutí na konec přechodu. V Chromiu přidej ještě `overlay 200ms allow-discrete`, které dialog do konce animace podrží ve vrstvě nad stránkou. `@starting-style` pro zavírání nepomůže, platí jen pro první vykreslení.

### --see--

css-animace/transition-transform#objeveni-a-zmizeni-starting-style-a-allow-discrete

## --question--

Nadpis „Vítejte v Krkonoších" má 24 znaků a má se objevovat jako na psacím stroji — po jednom znaku, bez plynulého odkrývání mezi nimi. Napiš hodnotu `animation-timing-function`.

### --expected--

steps(24)

### --accept--

steps(24, end)
steps(24, jump-end)

### --why--

`steps(24)` rozdělí animaci na 24 skoků, jeden na každý znak. `linear` by text odkrývala plynule i uprostřed písmen.

### --see--

css-animace/keyframes#casovani-cubic-bezier-steps-a-linear

## --question--

Najdi v anglické dokumentaci MDN stránku vlastnosti `transition-behavior`. Jakou má tahle vlastnost výchozí hodnotu (*initial value*)?

### --expected-- ignore-case

normal

### --why--

Výchozí `normal` znamená, že vlastnosti, které jde měnit jen skokem (jako `display`), přechod ignoruje. `allow-discrete` je druhá hodnota. Na stránce vlastnosti ji najdeš v tabulce *Formal definition*.

### --see--

css-animace/transition-transform#objeveni-a-zmizeni-starting-style-a-allow-discrete

## --question--

Katalog má kartám produktů v CSS nastavené `.product { view-transition-name: product; }`. Po kliknutí na „Seřadit podle ceny" se karty přeskládají uvnitř `document.startViewTransition()`, ale přeskládání proběhne skokem. Proč?

### --answer--

Protože view transition neumí měnit pořadí prvků v DOM.

#### --why--

Co se v DOM mezi snímky změní, je view transition jedno. Přesun, přidání i smazání projdou.

### --correct--

Protože všechny karty mají stejné jméno, a to musí být na stránce jedinečné; prohlížeč view transition zruší.

#### --why--

Každá karta potřebuje vlastní jméno, třeba `product-42` podle `id`. Když se jméno opakuje, animace se přeruší a změna proběhne bez ní.

### --answer--

Protože jméno je v CSS, a musí se nastavit v JavaScriptu.

#### --why--

`view-transition-name` je obyčejná vlastnost CSS, zapsat ji jde stylem i skriptem. Problém je v její hodnotě.

### --see--

css-animace/view-transitions-scroll#view-transition-name-prvek-ktery-preleti

## --question--

Velký obrázek v záhlaví článku má při odjíždění z okna postupně zeslábnout a zmizet přesně ve chvíli, kdy z okna úplně odjede. Napiš název úseku pro `animation-range` časové osy `view()`.

### --expected--

exit

### --accept--

exit 0% exit 100%

### --why--

`exit` začíná, když prvek začne z okna odjíždět, a končí, když úplně odjede.

### --see--

css-animace/view-transitions-scroll#view-animace-podle-toho-kde-je-prvek-v-okne

## --question--

Flex kontejner je široký 600 px, bez paddingu, a má `justify-content: space-between`. Jsou v něm tři karty po 100 px. Prostřední karta má při najetí myší `translate: 0 -8px`. Kolik pixelů je při najetí od levého okraje kontejneru k levé hraně prostřední karty?

### --expected--

250

### --accept--

250 px
250px

### --why--

Volné místo je 600 − 300 = 300 px a `space-between` ho dá do dvou mezer po 150 px. Prostřední karta tedy začíná na 100 + 150 = 250 px. Svislý posun přes `translate` na vodorovné poloze nic nemění a rozvržení se kvůli němu nepřepočítá.

### --see--

css-flexbox/uvod-do-flexboxu#justify-content-volne-misto-na-hlavni-ose
css-animace/transition-transform#transformace-posun-zvetseni-otoceni

## --question--

V liště `display: flex` má tlačítko odjet doprava přes `margin-inline-start: auto`, a to plynule: kolega přidal `transition: margin-inline-start 300ms`. Co se stane, když tlačítku třída přidá automatický margin?

### --answer--

Tlačítko plynule za 300 ms odjede k pravému okraji.

#### --why--

Myslíš si, že `auto` je číslo, mezi kterým jde dopočítat mezihodnoty? Není, je to klíčové slovo.

### --correct--

Tlačítko skočí doprava bez animace.

#### --why--

Automatický margin nemá hodnotu, ze které by prohlížeč dopočítal snímky, takže se přepne skokem. Plynulý posun uděláš přes `translate`.

### --answer--

Tlačítko se nepohne, protože s přechodem automatický margin nefunguje.

#### --why--

Automatický margin funguje dál a volné místo sežere. Přechod jen nemá mezi čím animovat.

### --see--

css-flexbox/uvod-do-flexboxu#automaticky-margin-jedna-polozka-stranou

## --question--

Karta ve flex řádku se při najetí myší rozšíří přes `transition: flex-basis 300ms` z `15rem` na `20rem`. Co dělají sousední karty během přechodu?

### --answer--

Stojí na místě, rozšířená karta přes ně přeteče.

#### --why--

Tak by se chovalo zvětšení přes `scale`. `flex-basis` je vlastnost rozvržení, sousedé o ní vědí.

### --correct--

Zmenšují se nebo posouvají v každém snímku, protože prohlížeč pokaždé přepočítá rozvržení řádku.

#### --why--

Každá mezihodnota `flex-basis` znamená nové rozdělení místa mezi položky. U karet s obrázky a textem to na slabším zařízení zadrhává.

### --answer--

Posunou se až na konci přechodu, najednou.

#### --why--

Rozvržení se přepočítá pro každou mezihodnotu, ne až pro poslední.

### --see--

css-flexbox/flex-do-hloubky#tri-cisla-basis-grow-shrink
css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum

## --question--

Kontejner s `display: flex` a výchozím `align-items: stretch` obsahuje karty různě vysokého obsahu. Jedna karta se při najetí zvětší přes `scale: 1.05`. Jak vysoké budou ostatní karty v řádku?

### --answer--

O 5 % vyšší, protože se natahují podle nejvyšší karty.

#### --why--

`stretch` natahuje karty podle výšky řádku v rozvržení. Zvětšení přes `scale` rozvržení nemění, takže výška řádku zůstane stejná.

### --correct--

Stejně vysoké jako předtím; zvětšená karta přeteče přes řádek.

#### --why--

Transformace se uplatní až po rozvržení, flexbox o ní neví. Řádek, `stretch` i sousedé zůstanou beze změny.

### --answer--

Zmenší se, aby se zvětšená karta vešla.

#### --why--

Zmenšování (`flex-shrink`) počítá s velikostí v rozvržení. Tu `scale` nezmění.

### --see--

css-flexbox/uvod-do-flexboxu#align-items-zarovnani-na-vedlejsi-ose
css-animace/transition-transform#transformace-posun-zvetseni-otoceni

## --question--

Hlavička má `position: sticky; top: 0` a žádný `z-index`. Karty v obsahu mají `position: relative` a při najetí myší se zvedají přes `translate`. Při posouvání stránky projíždějí karty **přes** hlavičku, ne pod ní. Proč?

### --answer--

Protože `translate` vytáhne kartu z normálního toku, a tím i nad hlavičku.

#### --why--

Transformace prvek z toku nevytahuje, jen ho jinak nakreslí. Karta by projížděla přes hlavičku i bez najetí myší.

### --correct--

Protože hlavička i karty jsou pozicované prvky bez `z-index` a ty se kreslí v pořadí dokumentu — karty jsou v HTML za hlavičkou.

#### --why--

Stejná vrstva, stejné pořadí jako v HTML. Hlavička potřebuje `z-index`, aby se dostala nad obsah, který je v dokumentu za ní.

### --answer--

Protože `position: sticky` funguje jen v rodiči s `overflow: hidden`.

#### --why--

`sticky` v obyčejném rodiči funguje, `overflow: hidden` na předkovi ho naopak často rozbije. Chyba je jinde než v přilepení.

### --see--

css-pozicovani/stacking-context
css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum

# --code-- Kolegovy styly blogu cestovní kanceláře

## --file-- site.css

```css
/* Blog cestovní kanceláře Vandr — styly od kolegy */

* {
  will-change: transform;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--page-bg);
  color: var(--page-text);
  transition: all 500ms;
}

.progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: #e11d48;
  transform-origin: left;
  animation-timeline: scroll(root);
  animation: fill linear both;
}

@keyframes fill {
  from {
    transform: scaleX(0);
  }
}

.menu-button {
  position: fixed;
  top: 1rem;
  right: 1rem;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: fixed;
  inset: 0 0 0 auto;
  width: min(20rem, 85vw);
  margin: 0;
  padding: 2rem;
  border: 0;
  translate: 100% 0;
  transition: translate 300ms ease-in, display 300ms allow-discrete;
}

.menu:popover-open {
  translate: 0 0;
}

@starting-style {
  .menu:popover-open {
    translate: 100% 0;
  }
}

.trip-card {
  border-radius: 1rem;
  transition: box-shadow 200ms;
}

.trip-card:hover {
  box-shadow: 0 1rem 2rem rgb(0 0 0 / 0.2);
  margin-top: -6px;
}

.badge-sale {
  position: absolute;
  top: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  animation: pulse 1s ease-in-out infinite alternate;
}

@keyframes pulse {
  to {
    transform: scale(1.1);
  }
}
```

## --question--

Ukazatel čtení `.progress` je hned po načtení na celé šířce a při scrollování se nemění. Na kterém řádku `site.css` je deklarace, která to způsobila?

### --expected--

24

### --why--

Shorthand `animation` na řádku 24 vrátí `animation-timeline` z řádku 23 na výchozí časovou osu. Animace s délkou 0 s pak díky `both` hned zůstane v posledním stavu. Stačí řádky 23 a 24 prohodit.

### --see--

css-animace/view-transitions-scroll#typicke-chyby-a-pasti

## --question--

Menu `.menu` (řádky 39–61) je popover. Co platí o zavřeném menu po načtení stránky?

### --answer--

Menu je skryté, protože zavřený popover má vždycky `display: none`.

#### --why--

`display: none` pro zavřený popover dává prohlížeč jen ve výchozích stylech a řádek 40 ho přebije.

### --correct--

Menu není vidět, protože je posunuté za pravý okraj, ale kvůli řádku 40 je vykreslené, takže na jeho odkazy doskočí klávesa Tab i čtečka obrazovky.

#### --why--

`display: flex` přebije skrytí zavřeného popoveru. Menu jen ujede z obrazovky přes `translate`. Oprava: `display: flex` patří do `.menu:popover-open`.

### --answer--

Menu je vidět u pravého okraje a zakrývá obsah.

#### --why--

`translate: 100% 0` na řádku 49 ho posune o celou šířku doprava, za okraj okna, takže vidět není.

### --see--

css-animace/transition-transform#typicke-chyby-a-pasti

## --question--

Na kterém řádku `site.css` je deklarace, kvůli které má každý prvek stránky vlastní vrstvu v paměti grafické karty?

### --expected--

4

### --why--

`will-change: transform` na selektoru `*` si řekne o vrstvu pro každý prvek. Vrstvy pro animace vytvoří prohlížeč sám; řádky 3–5 patří smazat.

### --see--

css-animace/transition-transform#typicke-chyby-a-pasti

## --question--

Co se stane při najetí myší na kartu výletu (řádky 63–71)?

### --answer--

Karta se plynule zvedne o 6 px a objeví se stín.

#### --why--

Přechod na řádku 65 animuje jen `box-shadow`. Myslíš si, že se s ním animuje i margin?

### --correct--

Stín se objeví plynule, ale karta poskočí nahoru skokem a pohne i obsahem kolem sebe.

#### --why--

`margin-top` na řádku 70 v přechodu není a je to vlastnost rozvržení. Zvednutí patří do `translate: 0 -6px` a do `transition`.

### --answer--

Nic se nepohne, protože `margin-top` v `:hover` nefunguje.

#### --why--

Margin v `:hover` funguje jako jinde, jen se změní skokem a posune rozvržení.

### --see--

css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum

## --question--

Co dělá štítek slevy `.badge-sale` (řádky 73–85) během animace?

### --answer--

Pulzuje na místě, vycentrovaný nad kartou.

#### --why--

Snímek na řádku 83 mění `transform`, a to celou vlastnost. Co se stane s posunem z řádku 77?

### --correct--

Při každém pulzu uhne ze středu doprava, protože `transform` ve snímku nahradí centrování z řádku 77.

#### --why--

Během animace platí `transform: scale(1.1)` ze snímku místo `translateX(-50%)`. Oprava: centrovat přes `translate: -50% 0` a ve snímku animovat `scale`.

### --answer--

Nepulzuje, protože `transform` je už nastavený v pravidle.

#### --why--

Hodnota z běžící animace má před pravidlem přednost, animace poběží.

### --see--

css-animace/keyframes#typicke-chyby-a-pasti
