## --card-- css

Karta produktu se má při najetí myší zvedat plynule oběma směry za 200 ms s křivkou, která začne rychle a zpomalí. Napiš deklaraci přechodu do základního pravidla karty.

### --expected--

```css
transition: translate 200ms ease-out;
```

### --accept--

```css
transition: translate 0.2s ease-out;
```

```css
transition: transform 200ms ease-out;
```

### --why--

Přechod patří do základního pravidla, jinak by se animoval jen příchod myši. `ease-out` reaguje hned a na konci dobrzdí.

### --see--

css-animace/transition-transform#zapis-transition-vlastnost-delka-krivka-zpozdeni

## --card-- css

Tooltip stojí nad ikonou díky `top: 0` a má se posunout nahoru o celou svou výšku, aniž by se změnilo rozvržení. Napiš deklaraci se samostatnou transformační vlastností.

### --expected--

```css
translate: 0 -100%;
```

### --accept--

```css
transform: translateY(-100%);
```

```css
transform: translate(0, -100%);
```

### --why--

Procenta v `translate` se počítají z velikosti samotného prvku, takže `-100%` je přesně jeho výška bez ohledu na obsah.

### --see--

css-animace/transition-transform#transformace-posun-zvetseni-otoceni

## --card-- css

Ukazatel průběhu nahrávání `.upload__bar` roste přes `scale` z nuly do plné šířky. Napiš deklaraci, se kterou poroste od pravého okraje k levému.

### --expected--

```css
transform-origin: right;
```

### --accept--

```css
transform-origin: right center;
```

```css
transform-origin: 100% 50%;
```

### --why--

Zvětšení probíhá kolem počátku transformace. Když je počátek vpravo, pravý okraj zůstane na místě a prvek se roztahuje doleva.

### --see--

css-animace/workshop-interakce/016

## --card-- css

Seznam přechodů vysouvacího panelu už obsahuje `display 300ms`, ale panel přesto při zavření zmizí hned. Napiš deklaraci dílčí vlastnosti přechodu, která to spraví.

### --expected--

```css
transition-behavior: allow-discrete;
```

### --why--

`display` jde měnit jen skokem. Bez `allow-discrete` ho přechod ignoruje a `display: none` platí okamžitě; s ním se přepne až na konci přechodu.

### --see--

css-animace/transition-transform#objeveni-a-zmizeni-starting-style-a-allow-discrete

## --card-- css

Stránka má `<details>` s odpověďmi, jejichž obsah se má rozbalovat plynule až do výšky `auto`. Napiš deklaraci pro `:root`, která dovolí přechod z čísla na klíčové slovo.

### --expected--

```css
interpolate-size: allow-keywords;
```

### --why--

Mezi `0` a `auto` prohlížeč bez svolení mezihodnoty nepočítá. `interpolate-size` to povolí; kde ho prohlížeč nezná, rozbalí se odpověď skokem jako dřív.

### --see--

css-animace/workshop-interakce/011

## --card-- css

Ikona obnovení `.refresh__icon` se má při načítání točit rovnoměrně pořád dokola, jedna otáčka za 1,2 s, podle `@keyframes rotate-once`. Napiš deklaraci `animation`.

### --expected--

```css
animation: rotate-once 1.2s linear infinite;
```

### --accept--

```css
animation: rotate-once 1200ms linear infinite;
```

```css
animation: rotate-once 1.2s infinite linear;
```

### --why--

`linear` drží stálou rychlost, jinak by ikona na konci každé otáčky zpomalila. `infinite` animaci opakuje bez konce.

### --see--

css-animace/keyframes#keyframes-a-vlastnost-animation

## --card-- css

Banner vyjede animací nahoru a po konci se vrací zpátky dolů. Napiš deklaraci jen té dílčí vlastnosti animace, se kterou zůstane ve stavu posledního snímku.

### --expected--

```css
animation-fill-mode: forwards;
```

### --accept--

```css
animation-fill-mode: both;
```

### --why--

Bez `forwards` platí styl ze snímků jen během běhu animace a po konci se použije styl prvku.

### --see--

css-animace/keyframes#keyframes-a-vlastnost-animation

## --card-- css

Karta má `animation: pop-in 400ms ease-out 600ms` a snímek `from` s `opacity: 0`. Během zpoždění ale karta svítí naplno a pak blikne. Napiš deklaraci dílčí vlastnosti, která použije první snímek už během zpoždění.

### --expected--

```css
animation-fill-mode: backwards;
```

### --accept--

```css
animation-fill-mode: both;
```

### --why--

`backwards` přenese styl prvního snímku do doby zpoždění. Bez něj platí během zpoždění styl pravidla.

### --see--

css-animace/keyframes#keyframes-a-vlastnost-animation

## --card-- css

Indikátor síly hesla se má za 1 s naplnit v pěti skocích, bez plynulého pohybu mezi nimi. Napiš deklaraci časovací funkce animace.

### --expected--

```css
animation-timing-function: steps(5);
```

### --accept--

```css
animation-timing-function: steps(5, end);
```

```css
animation-timing-function: steps(5, jump-end);
```

### --why--

`steps(n)` rozdělí průběh na `n` stejných skoků. Plynulé křivky by indikátor posouvaly i mezi dílky.

### --see--

css-animace/keyframes#casovani-cubic-bezier-steps-a-linear

## --card-- css

Tři tečky „píše…" mají animaci dlouhou 1,5 s. Třetí tečka má být od prvního snímku o třetinu průběhu napřed. Napiš deklaraci zpoždění pro třetí tečku.

### --expected--

```css
animation-delay: -0.5s;
```

### --accept--

```css
animation-delay: -500ms;
```

### --why--

Záporné zpoždění spustí animaci, jako by už část uběhla. Třetina z 1,5 s je 0,5 s.

### --see--

css-animace/keyframes#opakovani-smer-a-zpozdeni

## --card-- css

Běžící lišta s novinkami `.ticker` se má při najetí myší zastavit na místě, kde zrovna je, a po odjetí pokračovat odtamtud. Napiš deklaraci pro `.ticker:hover`.

### --expected--

```css
animation-play-state: paused;
```

### --why--

`paused` animaci zastaví bez resetu. Kdybys ji odebral přes `animation: none`, po odjetí by začala znovu od začátku.

### --see--

css-animace/keyframes#opakovani-smer-a-zpozdeni

## --card-- css

Dlaždice galerie se při najetí přibližuje přes `scale: 1.08`. Napiš deklaraci do bloku `@media (prefers-reduced-motion: reduce)` pro `.tile:hover`, která přiblížení zruší.

### --expected--

```css
scale: none;
```

### --accept--

```css
scale: 1;
```

### --why--

Při omezeném pohybu pryč jde pohyb a zvětšování. Změna barvy nebo stínu, kterou dlaždice případně má, zůstat smí.

### --see--

css-animace/transition-transform#omezeny-pohyb-prefers-reduced-motion

## --card-- css

Obrázky v článku se mají jemně objevovat podle toho, jak vjíždějí do okna, bez JavaScriptu. Animace `reveal` už je nastavená. Napiš deklaraci časové osy.

### --expected--

```css
animation-timeline: view();
```

### --why--

`view()` sleduje polohu samotného prvku v okně. `scroll()` by animaci řídil posuvníkem celé stránky, takže by se všechny obrázky odkrývaly zároveň.

### --see--

css-animace/view-transitions-scroll#view-animace-podle-toho-kde-je-prvek-v-okne

## --card-- css

Obrázek s animací řízenou `view()` se má animovat po celou dobu, kdy je aspoň kouskem vidět: od chvíle, kdy začne vjíždět, až do chvíle, kdy úplně odjede. Napiš deklaraci rozsahu.

### --expected--

```css
animation-range: cover;
```

### --accept--

```css
animation-range: cover 0% cover 100%;
```

### --why--

Úsek `cover` pokrývá celou cestu prvku oknem. `contain` by začal, až když je prvek vidět celý.

### --see--

css-animace/view-transitions-scroll#view-animace-podle-toho-kde-je-prvek-v-okne

## --card-- css

Karta objednávky s `id="order-512"` má při přesunu mezi sloupci přeletět uvnitř `document.startViewTransition()`. Napiš deklaraci, kterou jí dáš, aby měla vlastní skupinu.

### --expected--

```css
view-transition-name: order-512;
```

### --why--

Samostatně přeletí jen prvek s vlastním jménem a to musí být na stránce jedinečné, proto ho skládáš z `id`.

### --see--

css-animace/view-transitions-scroll#view-transition-name-prvek-ktery-preleti

## --card-- output

Za kolik milisekund od změny obou vlastností bude oznámení úplně v klidu?

```css
.toast {
  transition: opacity 400ms ease-out 100ms, translate 300ms ease-out;
}
```

### --expected--

500

### --accept--

500 ms
500ms

### --why--

`opacity` začne po 100 ms a skončí po 100 + 400 = 500 ms, `translate` skončí po 300 ms. V klidu je oznámení až po té pozdější.

### --see--

css-animace/transition-transform#zapis-transition-vlastnost-delka-krivka-zpozdeni

## --card-- output

Kolik milisekund po vykreslení se prvek poprvé vrátí do stavu snímku `from`?

```css
.badge {
  animation: glow 2s ease-in-out 500ms infinite alternate;
}
```

### --expected--

4500

### --accept--

4500 ms
4500ms
4,5 s

### --why--

Nejdřív 500 ms zpoždění, pak 2 s tam a díky `alternate` 2 s zpátky: 500 + 2000 + 2000.

### --see--

css-animace/keyframes#opakovani-smer-a-zpozdeni

## --card-- output

Stránka je vysoká 4000 px a okno 800 px. Uživatel odscrolloval 1600 px od začátku. Na kolika procentech je ukazatel čtení s `animation-timeline: scroll(root)` a křivkou `linear`?

### --expected--

50

### --accept--

50 %
50%

### --why--

Posuvník urazí jen výšku stránky minus výšku okna, tedy 3200 px. 1600 / 3200 = 50 %.

### --see--

css-animace/view-transitions-scroll#animace-rizena-scrollem-scroll

## --card-- free

Proč se pohyb v rozhraní animuje přes `transform` a `opacity`, a ne přes `top`, `margin` nebo `width`?

### --back--

Prohlížeč převádí styly na obrazovku ve fázích styl, rozvržení, kreslení a skládání. Změna `top`, `margin` nebo `width` spustí v každém snímku nové rozvržení i kreslení a posune i sousední prvky. `transform` a `opacity` se uplatní až při skládání hotových vrstev, které zvládne i grafická karta. Na snímek je jen asi 16 ms, takže drahé animace na slabém telefonu zadrhávají a levné běží plynule.

### --see--

css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum

## --card-- free

Jaký je rozdíl mezi `transition` a `animation` s `@keyframes`? Kdy použiješ který?

### --back--

Přechod dopočítá změnu mezi dvěma stavy, když se hodnota změní (hover, třída, otevření), a při přerušení se plynule otočí z aktuální polohy. Animace s klíčovými snímky běží sama bez změny stavu, může mít libovolně mnoho mezikroků a opakovat se. Přechod použiju na hover, fokus a otevírání nabídek, animaci na načítání, pulzování nebo nástup s víc fázemi.

### --see--

css-animace/keyframes#prechod-nebo-animace

## --card-- free

Proč se popover nebo dialog bez dalších pravidel otevírá i zavírá skokem, i když má `transition` na `opacity`? Co s tím uděláš?

### --back--

Zavřený popover má `display: none`, takže při otevření nemá žádný předchozí styl, ze kterého by přechod začal, a při zavření zmizí hned v prvním snímku. Startovní stav pro otevření dodá `@starting-style`. Zavření zpozdí `display … allow-discrete` v seznamu přechodů, který přepne `display` až na konci. U popoveru a dialogu přidám ještě `overlay` se stejným časem, aby prvek zůstal do konce animace nad stránkou.

### --see--

css-animace/transition-transform#objeveni-a-zmizeni-starting-style-a-allow-discrete

## --card-- free

K čemu je `will-change` a proč ho nedáváš na všechny prvky „pro jistotu"?

### --back--

`will-change: transform` řekne prohlížeči, že se prvek brzy bude hýbat, a ten mu předem vytvoří vlastní vrstvu, takže první snímek animace nezačne jejím vytvářením. Každá vrstva ale zabírá paměť grafické karty a u stovek prvků to stránku zpomalí nebo rozmaže text. Prohlížeč si vrstvy pro běžící animace vytváří sám, takže `will-change` přidám jen tam, kde jsem v Performance naměřil zadrhnutí.

### --see--

css-animace/transition-transform#typicke-chyby-a-pasti

## --card-- free

Jak na webu respektuješ uživatele se zapnutým omezením pohybu? Co vypneš a co necháš?

### --back--

Pravidla pro ně píšu do `@media (prefers-reduced-motion: reduce)`, případně pohyb dávám jen do `no-preference`. Vypnu posuny, zvětšování, rotace, parallaxu a odhalování při scrollu, protože právě pohyb může vyvolat závrať a nevolnost. Zpětnou vazbu nechám: změnu barvy, stínu nebo krátké prolnutí průhlednosti. Pohyb, který nese informaci, jako načítací kolečko, nahradím klidnější formou, třeba pulzováním průhlednosti.

### --see--

css-animace/transition-transform#omezeny-pohyb-prefers-reduced-motion

## --card-- free

Co je view transition, jak ji spustíš a jak zajistíš, že stránka funguje i v prohlížeči, který ji nezná?

### --back--

Prohlížeč vyfotí stránku před změnou, provede moji změnu DOM a vyfotí ji po ní, pak mezi snímky animuje ve vrstvě nad stránkou. Uvnitř stránky ji spustím `document.startViewTransition(update)`, mezi stránkami pravidlem `@view-transition { navigation: auto; }` na obou stránkách. Prvky se jedinečným `view-transition-name` přeletí zvlášť. Jako progresivní vylepšení nejdřív ověřím, že metoda existuje, a když ne, zavolám jen funkci se změnou.

### --see--

css-animace/view-transitions-scroll#document-startviewtransition-a-detekce-podpory

## --card-- free

Vycentrovaný štítek s `transform: translate(-50%, -50%)` při najetí myší uskočí, když mu v `:hover` nastavíš `transform: scale(1.1)`. Proč, a jak to napíšeš správně?

### --back--

`transform` je jedna vlastnost se seznamem funkcí a nové pravidlo celý seznam nahradí, takže centrování zmizí. Buď v `:hover` zopakuju celý seznam `translate(-50%, -50%) scale(1.1)`, nebo centruji samostatnou vlastností `translate: -50% -50%` a v `:hover` měním jen `scale`. Samostatné vlastnosti mají každá svou hodnotu, takže se navzájem nepřepíšou.

### --see--

css-animace/workshop-interakce/014

## --card-- free

Animace na telefonu zadrhává. Jak v DevTools zjistíš proč?

### --back--

V panelu Performance nahraju pár sekund animace a hledám dlouhé snímky a fialové bloky Layout, které se opakují v každém snímku; ty prozradí animaci vlastnosti rozvržení. V panelu Rendering zapnu Paint flashing a vidím, co se znovu kreslí. Pak přepíšu animaci na `transform` a `opacity` a nahrávku zopakuju, abych viděl, že bloky Layout zmizely. Na počítači si pomůžu zpomalením procesoru v nastavení Performance, aby se to projevilo jako na telefonu.

### --see--

css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum
