# Flip, View Transitions a Motion

Filtr v e-shopu, po kterém se produkty plynule sesunou na nová místa. Fotka v portfoliu, která se z miniatury roztáhne do detailu. Srdíčko „Líbí se mi", které po kliknutí pružně poskočí. Všechny tři efekty řeší stejný problém: změnu, kterou v CSS nejde popsat jedním přechodem mezi dvěma hodnotami.

Než začneš, tipni si.

:::check pretest
Karta se po kliknutí přesune z jednoho sloupce do druhého přes `append`. Přidáš jí `transition: all 0.4s`. Co se stane?

### --answer--
Karta plynule přejede do druhého sloupce.

#### --why--
Přechod animuje změnu hodnoty vlastnosti. Karta ale žádnou vlastnost nezměnila, jen místo v DOM.

### --correct--
Karta skočí na nové místo bez animace.

#### --why--
Poloha v layoutu není vlastnost, kterou by CSS přechod sledoval. Za chvíli uvidíš, jak se takový skok animuje.

### --answer--
Karta nejdřív zmizí a pak se na novém místě prolne.

#### --why--
Prolnutí by znamenalo změnu `opacity`. Ta se nemění, takže není co animovat.
:::

:::check pretest
Tlačítko má po kliknutí povyrůst a vrátit se. Jednou použiješ `ease: 'back.out'` s délkou 0,3 s, jednou pružinu s tuhostí a tlumením. V čem se výsledek liší, když uživatel klikne pětkrát rychle za sebou?

### --expected--
Pružina navazuje na aktuální rychlost pohybu, křivka začíná pokaždé od nuly

### --why--
Pružina je fyzikální simulace: když ji přerušíš, pokračuje z místa i rychlosti, kde byla, a pohyb nezaškobrtne. Tween s křivkou začne novou animaci s nulovou rychlostí. Víc v části o Motion.
:::

## Problém: layout se změní skokem

Když filtr skryje část karet, zbylé karty si v gridu najdou nová místa **okamžitě**. Oko nestihne sledovat, kam která karta odjela, a stránka působí, jako by se přestavěla celá. V ukázce jsou vlevo a vpravo stejné karty a stejný filtr. Klikni v obou na „Dezerty" a pak na „Vše".

:::compare
```html
<div class="filters">
  <button type="button" data-category="vse">Vše</button>
  <button type="button" data-category="polevky">Polévky</button>
  <button type="button" data-category="dezerty">Dezerty</button>
</div>
<ul class="menu">
  <li class="dish" data-category="polevky">Kulajda<span>89 Kč</span></li>
  <li class="dish" data-category="dezerty">Švestkové knedlíky<span>145 Kč</span></li>
  <li class="dish" data-category="polevky">Česnečka<span>69 Kč</span></li>
  <li class="dish" data-category="dezerty">Makový koláč<span>75 Kč</span></li>
  <li class="dish" data-category="polevky">Dršťková<span>95 Kč</span></li>
  <li class="dish" data-category="dezerty">Větrník<span>65 Kč</span></li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; background: #fffbf5; }
.filters { display: flex; gap: 0.4rem; margin-bottom: 0.75rem; }
.filters button { padding: 0.35rem 0.8rem; border: 1px solid #d6c7b0; border-radius: 999px; background: white; font: inherit; }
.menu { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
.dish { display: flex; flex-direction: column; padding: 0.6rem 0.75rem; border-radius: 0.6rem; background: #7c2d12; color: #fff7ed; font-weight: 600; }
.dish span { font-weight: 400; opacity: 0.8; }
.dish[hidden] { display: none; }
```
```js
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const dishes = gsap.utils.toArray('.dish');
const applyFilter = (category) => {
  dishes.forEach((dish) => {
    dish.hidden = category !== 'vse' && dish.dataset.category !== category;
  });
};
```
--variant-- Bez animace
```js
document.querySelector('.filters').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) applyFilter(button.dataset.category);
});
```
--variant-- S pluginem Flip
```js
document.querySelector('.filters').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const state = Flip.getState(dishes);
  applyFilter(button.dataset.category);
  Flip.from(state, { duration: 0.5, ease: 'power2.inOut', absolute: true });
});
```
:::

Obě varianty volají stejnou funkci `applyFilter`. Ta druhá si **před** změnou zapamatuje, kde karty byly, a **po** změně je z těch míst plynule dovede na nová. Zkus v pravé variantě změnit `duration` na `1.5` a sleduj, kterou cestou která karta jede.

> [!REMEMBER]
> **Změnu layoutu neanimuješ vlastností, ale rozdílem dvou měření: zapamatuj si, kde prvek byl, změň DOM, změř, kde je, a transformací ho plynule převeď ze staré polohy do nové.**

:::check
Proč nestačí na přeskládání karet v gridu napsat `.dish { transition: transform 0.5s; }`?

### --answer--
Protože grid přechody nepodporuje, fungovalo by to jen ve flexboxu.

#### --why--
Flexbox je na tom stejně. Přesun položky na jiné místo v rozvržení není změna žádné animovatelné vlastnosti.

### --correct--
Protože se `transform` karet nemění; mění se jejich poloha v rozvržení, a tu přechod nesleduje.

#### --why--
Přechod potřebuje dvě hodnoty stejné vlastnosti. Poloha v gridu je výsledek rozvržení, žádná hodnota, kterou by šlo prolnout.

### --answer--
Protože `transition` funguje jen při `:hover`.

#### --why--
Přechod se spustí při jakékoli změně hodnoty, třeba po přidání třídy skriptem. Tady se ale žádná hodnota nezměnila.
:::

## Technika FLIP ručně

Plugin dělá to samé, co zvládneš napsat sám. [[FLIP]] je zkratka čtyř kroků:

1. **First** — změř, kde prvek je (`getBoundingClientRect()`).
2. **Last** — proveď změnu v DOM a změř znovu.
3. **Invert** — spočítej rozdíl a posuň prvek transformací **zpátky** na starou polohu. Na obrazovce se zatím nic nepohne.
4. **Play** — animuj transformaci na nulu. Prvek dojede na nové místo.

Proč takhle složitě? Protože během animace se mění jen `transform`. Rozvržení se spočítá jednou, při změně DOM, a pak už prohlížeč jen skládá vrstvy. Proč je to levné, víš z [cesty k pixelům](see:css-animace/transition-transform#proc-transform-a-opacity-cesta-k-pixelum).

:::live dom
```html
<section class="squad">
  <div class="column">
    <h2>Lavička</h2>
    <ul class="list" id="bench">
      <li class="player">Tomáš Souček <button type="button">Do sestavy</button></li>
      <li class="player">Adam Hložek <button type="button">Do sestavy</button></li>
      <li class="player">Patrik Schick <button type="button">Do sestavy</button></li>
    </ul>
  </div>
  <div class="column">
    <h2>Základní sestava</h2>
    <ul class="list" id="lineup"></ul>
  </div>
</section>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; background: #f0fdf4; }
.squad { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
h2 { margin: 0 0 0.5rem; font-size: 0.95rem; color: #14532d; }
.list { display: grid; gap: 0.4rem; min-height: 9rem; margin: 0; padding: 0.4rem; border-radius: 0.75rem; background: #dcfce7; list-style: none; }
.player { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.5rem 0.6rem; border-radius: 0.5rem; background: white; font-size: 0.875rem; }
.player button { padding: 0.2rem 0.5rem; border: 0; border-radius: 999px; background: #16a34a; color: white; font: inherit; font-size: 0.75rem; }
#lineup button { display: none; }
```
```js
const lineup = document.querySelector('#lineup');

function moveWithFlip(element, target) {
  // 1. First: kde prvek je teď
  const first = element.getBoundingClientRect();
  target.append(element);
  // 2. Last: kde je po změně
  const last = element.getBoundingClientRect();
  // 3. Invert: o kolik ho vrátit zpátky
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  // 4. Play: z vrácené polohy na nulu
  element.animate(
    [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
    { duration: 450, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  );
}

document.querySelector('#bench').addEventListener('click', (event) => {
  const player = event.target.closest('button')?.closest('.player');
  if (player) moveWithFlip(player, lineup);
});
```
:::

Klikni na prostředního hráče: přejede do sestavy. Hráč pod ním ale na uvolněné místo **skočí**, protože FLIP dostal jen přesouvaný prvek. Plugin Flip tohle řeší tím, že měří všechny prvky, které mu předáš. Zkus v `moveWithFlip` prohodit řádky `target.append(element)` a `const first = …`: obě měření proběhnou po změně, rozdíl je nula a hráč skočí.

Když se mění i velikost prvku, přidá se do kroku Invert `scale` (poměr starých a nových rozměrů) a `transform-origin: top left`. U textu pak scale deformuje písmo, proto se FLIP se změnou velikosti hodí hlavně na obrázky a barevné plochy.

:::check
Ve kterém okamžiku musíš změřit první polohu (First), aby FLIP fungoval?

### --answer--
Kdykoli, třeba při načtení stránky; poloha se uloží natrvalo.

#### --why--
Mezi načtením a kliknutím se mohla stránka odscrollovat nebo změnit šířka. Měření musí odpovídat stavu těsně před změnou.

### --correct--
Těsně před změnou DOM, v tomtéž běhu kódu.

#### --why--
First je fotka stavu před změnou. Když měříš po změně, First i Last jsou stejné a rozdíl je nula.

### --answer--
Až po změně DOM, aby prohlížeč znal nové rozvržení.

#### --why--
Po změně změříš Last. Pokud i First přijde po změně, nemáš s čím porovnávat.
:::

## Plugin Flip: `getState`, změna, `from`

GSAP Flip dělá ty čtyři kroky pro libovolný počet prvků najednou a navíc pohlídá prvky, které přibyly nebo zmizely:

```js
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

// 1. zapamatuj stav
const state = Flip.getState('.product');
// 2. změň DOM (třídy, pořadí, hidden, append…)
sortByPrice();
// 3. animuj ze zapamatovaného stavu do nového
Flip.from(state, {
  duration: 0.6,
  ease: 'power2.inOut',
  absolute: true,
  onEnter: (elements) => gsap.fromTo(elements, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1 }),
  onLeave: (elements) => gsap.to(elements, { autoAlpha: 0, scale: 0.8 }),
});
```

- `Flip.getState(prvky)` uloží polohu, velikost a viditelnost. Prvky, které pak ve změně skryješ, dostane `onLeave`, prvky, které se objeví, dostane `onEnter`.
- `absolute: true` dá prvkům během animace `position: absolute`. Grid se tak nepřepočítává pod rukama a mizející karty nedrží místo ostatním.
- `Flip.from` vrátí timeline, takže ji jde ovládat jako každou jinou (`progress(1)`, `kill()`).

:::live dom libs=gsap
```html
<div class="filters">
  <button type="button" data-category="vse" aria-pressed="true">Vše</button>
  <button type="button" data-category="kolo" aria-pressed="false">Kola</button>
  <button type="button" data-category="beh" aria-pressed="false">Běh</button>
</div>
<ul class="shop">
  <li class="product" data-category="kolo"><strong>Silniční kolo Favorit</strong>34 990 Kč</li>
  <li class="product" data-category="beh"><strong>Běžecké boty Trail</strong>2 890 Kč</li>
  <li class="product" data-category="kolo"><strong>Přilba Aero</strong>1 990 Kč</li>
  <li class="product" data-category="beh"><strong>Vesta s lahví</strong>1 290 Kč</li>
  <li class="product" data-category="kolo"><strong>Světlo zadní</strong>590 Kč</li>
  <li class="product" data-category="beh"><strong>Čelovka 400 lm</strong>1 190 Kč</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; background: #0f172a; color: #e2e8f0; }
.filters { display: flex; gap: 0.4rem; margin-bottom: 0.75rem; }
.filters button { padding: 0.35rem 0.8rem; border: 1px solid #334155; border-radius: 999px; background: transparent; color: inherit; font: inherit; }
.filters [aria-pressed="true"] { background: #facc15; border-color: #facc15; color: #0f172a; }
.shop { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
.product { display: grid; gap: 0.2rem; padding: 0.7rem; border-radius: 0.6rem; background: #1e293b; font-size: 0.85rem; }
.product[hidden] { display: none; }
```
```js
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const products = gsap.utils.toArray('.product');
const filters = document.querySelector('.filters');

filters.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const category = button.dataset.category;
  const state = Flip.getState(products);

  products.forEach((product) => {
    product.hidden = category !== 'vse' && product.dataset.category !== category;
  });
  filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));

  Flip.from(state, {
    duration: 0.5,
    ease: 'power2.inOut',
    absolute: true,
    onEnter: (elements) => gsap.fromTo(elements, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.4 }),
    onLeave: (elements) => gsap.to(elements, { autoAlpha: 0, scale: 0.8, duration: 0.3 }),
  });
});
```
:::

Klikni na „Kola" a pak na „Běh". Zkus smazat `absolute: true`: mizející karty drží místo, dokud nezmizí, a zbylé karty jedou oklikou. Pak smaž `onLeave`: skryté karty zmizí okamžitě.

> [!PITFALL] `[hidden]` přebité vlastním `display`
> *Příznak:* karta má atribut `hidden`, ale pořád je vidět, a Flip ji nepozná jako mizející.
>
> *Oprava:* pravidlo `.product { display: grid; }` má vyšší specificitu než výchozí styl `[hidden] { display: none; }` prohlížeče. Přidej `.product[hidden] { display: none; }`.

:::check
Seřaď v hlavě kroky filtru s pluginem Flip a napiš volání, které patří jako **první**, když karty jsou v proměnné `cards`.

### --expected--
Flip.getState(cards)

### --accept--
const state = Flip.getState(cards)
let state = Flip.getState(cards)
Flip.getState(cards);

### --why--
Nejdřív se uloží stav, pak se změní DOM a nakonec `Flip.from(state, …)` animuje ze starého stavu do nového. Stav uložený až po změně je shodný s novým a nic by se nehýbalo.
:::

## View Transitions: vlastní animace a sdílený prvek

Základ [[view transition|view transitions]] znáš z [css-animace](see:css-animace/view-transitions-scroll#view-transition-name-prvek-ktery-preleti): `document.startViewTransition(změna)` vyfotí stav před a po změně a prvky se stejným `view-transition-name` přeletí z jedné fotky do druhé. Pro detail fotky z galerie potřebuješ tři věci navíc.

**Jméno jen na kliknutém prvku.** Miniatur je dvanáct, ale přeletět má jen ta, na kterou uživatel klikl. Jméno jí proto dáš skriptem těsně před přechodem a ve funkci změny ho **přesuneš** na velký obrázek v detailu. Ve starém snímku má jméno miniatura, v novém detail, a prohlížeč mezi nimi animuje polohu i velikost.

**Úklid po skončení.** `startViewTransition` vrací objekt s promisem `finished`. Po jeho splnění jméno smažeš, aby nepřekáželo dalšímu přechodu.

**Vlastní animace snímků.** `::view-transition-old(jméno)` a `::view-transition-new(jméno)` jsou pseudoprvky se starým a novým snímkem a jde jim dát vlastní `animation`. Když má víc prvků stejný typ přechodu, dostanou společnou `view-transition-class` a styluješ je přes `::view-transition-group(.třída)`.

:::live dom
```html
<div class="player">
  <button class="album" type="button" aria-label="Otevřít přehrávač">
    <span class="cover"></span>
    <span>Mlžné ostrovy · Přístav</span>
  </button>
  <section class="now" hidden>
    <span class="cover cover--big"></span>
    <p><strong>Přístav</strong><br>Mlžné ostrovy · 3:42</p>
    <button class="back" type="button">Zpět</button>
  </section>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; background: #1c1917; color: #fafaf9; }
.album { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border: 0; border-radius: 0.75rem; background: #292524; color: inherit; font: inherit; }
.cover { display: block; width: 3rem; aspect-ratio: 1; border-radius: 0.4rem; background: linear-gradient(135deg, #f97316, #db2777 55%, #4c1d95); }
.cover--big { width: 12rem; border-radius: 1rem; }
.now { display: grid; justify-items: start; gap: 0.75rem; }
.now[hidden] { display: none; }
.back { padding: 0.35rem 0.9rem; border: 1px solid #57534e; border-radius: 999px; background: transparent; color: inherit; font: inherit; }
::view-transition-group(cover) { animation-duration: 0.5s; animation-timing-function: cubic-bezier(0.2, 0, 0, 1); }
```
```js
const album = document.querySelector('.album');
const now = document.querySelector('.now');
const smallCover = album.querySelector('.cover');
const bigCover = now.querySelector('.cover');

async function swap(from, to, change) {
  if (!document.startViewTransition) {
    change();
    return;
  }
  from.style.viewTransitionName = 'cover';
  const transition = document.startViewTransition(() => {
    from.style.viewTransitionName = '';
    to.style.viewTransitionName = 'cover';
    change();
  });
  await transition.finished;
  to.style.viewTransitionName = '';
}

album.addEventListener('click', () => swap(smallCover, bigCover, () => {
  album.hidden = true;
  now.hidden = false;
}));
now.querySelector('.back').addEventListener('click', () => swap(bigCover, smallCover, () => {
  now.hidden = true;
  album.hidden = false;
}));
```
:::

Klikni na skladbu a pak na „Zpět": obal přeletí oběma směry, protože funkce `swap` dostane pokaždé prvky v opačném pořadí. Zkus v CSS změnit `0.5s` na `2s` a sleduj, že zbytek stránky se prolíná pořád 0,25 s, protože skupina `root` má vlastní animaci.

Teď předpověď. Kolega jméno v přechodu nepřesunul, jen ho přidal velkému obalu:

:::live dom predict
```html
<button class="album" type="button">
  <span class="cover"></span>
  <span>Tramvaj 22 · Letná</span>
</button>
<section class="now" hidden>
  <span class="cover cover--big"></span>
</section>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; background: #1c1917; color: #fafaf9; }
.album { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border: 0; border-radius: 0.75rem; background: #292524; color: inherit; font: inherit; }
.cover { display: block; width: 3rem; aspect-ratio: 1; border-radius: 0.4rem; background: linear-gradient(135deg, #22d3ee, #6366f1); }
.cover--big { width: 12rem; }
.now[hidden] { display: none; }
```
```js
const album = document.querySelector('.album');
const now = document.querySelector('.now');

album.addEventListener('click', () => {
  album.querySelector('.cover').style.viewTransitionName = 'cover';
  const transition = document.startViewTransition(() => {
    now.querySelector('.cover').style.viewTransitionName = 'cover';
    now.hidden = false;
  });
  transition.ready.catch(() => {});
});
```
--question-- Co uvidíš po kliknutí na skladbu?
--option-- Obal přeletí do velkého obrázku, jen bez prolnutí zbytku stránky.
--option-- Stránka se prolne, ale obal nepřeletí.
--option*-- Velký obal se objeví okamžitě, bez jakékoli animace.
--why-- Po změně mají jméno `cover` **dva** prvky: miniatura, které ho nikdo neodebral, a velký obal. Nový snímek tak nejde vyfotit, prohlížeč celý přechod zruší (v konzoli `Unexpected duplicate view-transition-name: cover`, promise `ready` skončí chybou `InvalidStateError`) a změnu jen provede. Zruší se i prolnutí `root`. Oprava: ve funkci změny jméno miniatuře smaž.
:::

:::check
Proč se `view-transition-name` detailu po skončení přechodu (`await transition.finished`) maže?

### --answer--
Protože jinak by detail zůstal průhledný.

#### --why--
Jméno vzhled prvku mimo přechod nemění. Problém nastane až při dalším přechodu.

### --correct--
Aby při dalším přechodu nemělo stejné jméno víc prvků najednou, třeba detail a jiná miniatura.

#### --why--
Jméno musí být v každém snímku jedinečné. Když ho po přechodu nesmažeš, příští přechod s jinou miniaturou narazí na duplicitu a zruší se.

### --answer--
Protože `finished` jméno jinak smaže samo a vznikla by chyba.

#### --why--
Prohlížeč jména nemaže, zůstanou, dokud je neodebereš.
:::

## Když prohlížeč přechody neumí

Podporu testuj podmínkou `if (!document.startViewTransition)` a změnu pak proveď bez animace, stejně jako v `swap` výše. Funkce změny se musí dát zavolat samostatně, proto ji drž jako samostatnou funkci, ne kód rozepsaný uvnitř `startViewTransition`.

Přechody **mezi dokumenty** (klasický odkaz na jinou stránku webu) zapneš v CSS obou stránek pravidlem `@view-transition { navigation: auto; }`, které znáš z [css-animace](see:css-animace/view-transitions-scroll#prechody-mezi-strankami-view-transition). Je to progresivní vylepšení: kde podpora chybí, stránka se prostě načte.

Pro [[omezený pohyb]] přechod nezahazuj celý. Přelet přes obrazovku nahraď prolnutím:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) {
    animation-duration: 0s;
  }
}
```

Skupina bez animace skočí rovnou na cíl a snímky starý a nový se v ní jen prolnou. Uživatel pořád vidí, že se něco změnilo, ale nic mu nelétá přes obrazovku.

:::check
Uživatel má zapnuté omezení pohybu. Co je nejlepší varianta pro otevření detailu fotky?

### --answer--
Nepoužít `startViewTransition` vůbec a detail ukázat skokem.

#### --why--
Skok funguje, ale ztratíš i jemné prolnutí, které pohyb neobsahuje a pomáhá pochopit změnu.

### --correct--
Nechat přechod, ale skupinám zrušit animaci polohy, takže se snímky jen prolnou.

#### --why--
Omezený pohyb neznamená žádné animace. Vypíná se pohyb přes obrazovku, prolnutí a změna barvy zůstávají.

### --answer--
Nechat přechod beze změny, trvá jen 0,5 s.

#### --why--
Krátký přelet přes půl obrazovky je přesně pohyb, který lidem s poruchou rovnováhy vadí.
:::

## Motion: `animate` s pružinou

Motion je lehčí knihovna s funkcemi, které si importuješ jednotlivě. Pro obyčejný JavaScript máš `animate`:

```js
import { animate } from 'motion';

animate('.badge', { scale: [0.6, 1], opacity: [0, 1] }, { duration: 0.3, ease: 'easeOut' });
```

Hodnota v poli jsou klíčové snímky, jedna hodnota znamená „z aktuálního stavu do". Nejzajímavější je [[pružinová animace]]: místo délky a křivky zadáš fyzikální vlastnosti pružiny a pohyb z nich vyjde sám.

- `stiffness` (tuhost) — čím vyšší, tím rychleji pružina táhne k cíli,
- `damping` (tlumení) — čím nižší, tím víc pružina za cílem kmitá,
- `mass` (hmotnost) — těžší prvek se rozjíždí pomaleji.

:::live dom libs=motion
```html
<button class="like" type="button" aria-pressed="false">
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.2 4.5 7 4.5c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.8 0 6 3.8 4.5 7.3C19.5 16.4 12 21 12 21z"/></svg>
  Líbí se mi
</button>
```
```css
:root {
  --spring-stiffness: var(--stiffness);
  --spring-damping: var(--damping);
}
body { display: grid; place-items: center; min-height: 10rem; margin: 0; font-family: system-ui, sans-serif; background: #fdf2f8; }
.like { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border: 0; border-radius: 999px; background: white; color: #9d174d; font: inherit; font-weight: 600; box-shadow: 0 6px 20px rgb(157 23 77 / 0.15); }
.like svg { fill: none; stroke: currentColor; stroke-width: 2; }
.like[aria-pressed="true"] svg { fill: #db2777; stroke: #db2777; }
```
```js
import { animate } from 'motion';

const like = document.querySelector('.like');
const icon = like.querySelector('svg');

like.addEventListener('click', () => {
  const liked = like.getAttribute('aria-pressed') !== 'true';
  like.setAttribute('aria-pressed', String(liked));
  const styles = getComputedStyle(document.documentElement);
  animate(icon, { scale: [0.4, 1] }, {
    type: 'spring',
    stiffness: parseFloat(styles.getPropertyValue('--spring-stiffness')),
    damping: parseFloat(styles.getPropertyValue('--spring-damping')),
  });
});
```
```controls
--stiffness: range(50, 1000, 50) = 400 | Tuhost
--damping: range(2, 40, 1) = 10 | Tlumení
```
:::

Klikej na srdíčko a posouvej ovladače. Tlumení 3 kmitá dlouho a působí gumově, tlumení 30 dojede bez přejezdu. Tuhost 50 je líná, 1000 cvakne okamžitě. Pak klikni pětkrát rychle za sebou: každá nová animace navazuje na rychlost té předchozí.

Sekvenci zapíšeš polem `[prvek, hodnoty, nastavení]`, kde `at` je obdoba pozice v timeline GSAPu (`'<'` se začátkem předchozího, `'-0.2'` 0,2 s před jeho koncem). Skupině prvků rozestupy přidá `stagger`:

```js
import { animate, stagger } from 'motion';

animate([
  ['.toast', { y: [40, 0], opacity: [0, 1] }, { duration: 0.3 }],
  ['.toast__icon', { rotate: [-20, 0] }, { type: 'spring', stiffness: 500, at: '<' }],
]);
animate('.tag', { opacity: [0, 1], y: [10, 0] }, { delay: stagger(0.05) });
```

:::check
Srdíčko po kliknutí dlouho kmitá kolem cílové velikosti a působí jako želé. Kterou hodnotu pružiny změníš a kterým směrem?

### --expected--
damping zvýšit

### --accept--
zvýšit damping
větší damping
damping nahoru
zvýšit tlumení
tlumení zvýšit

### --why--
Tlumení odebírá pružině energii. Při nízkém tlumení přestřelí cíl a kmitá, s vyšším se ustálí rychle. Tuhost by změnila hlavně rychlost, kmitání by zůstalo.
:::

## Gesta `hover` a `press`

Hover efekt v JavaScriptu přes `mouseenter` má dvě slabiny: na dotykovém displeji se „najetí" vyvolá po klepnutí a zůstane viset, a stisk tlačítka klávesou Enter nevyvolá žádný `mousedown`. Motion má na obojí funkce:

```js
import { animate, hover, press } from 'motion';

hover('.plan', (element) => {
  animate(element, { y: -6 });
  return () => animate(element, { y: 0 });     // konec najetí
});

press('.plan button', (element) => {
  animate(element, { scale: 0.94 });
  return () => animate(element, { scale: 1 }, { type: 'spring', stiffness: 600, damping: 15 });
});
```

Funkce dostane prvek a **vrátí funkci, která se zavolá na konci gesta**. `hover` reaguje jen na skutečné najetí ukazatelem, dotyk ignoruje. `press` funguje myší, dotykem i klávesou Enter na prvku s fokusem, a konec gesta přijde i tehdy, když uživatel prst z tlačítka vytáhne mimo.

:::live dom libs=motion
```html
<div class="plans">
  <article class="plan"><h3>Měsíc</h3><p>199 Kč</p><button type="button">Předplatit</button></article>
  <article class="plan"><h3>Rok</h3><p>1 990 Kč</p><button type="button">Předplatit</button></article>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; background: #eef2ff; }
.plans { display: flex; gap: 1rem; }
.plan { display: grid; gap: 0.25rem; padding: 1rem 1.25rem; border-radius: 1rem; background: white; box-shadow: 0 8px 24px rgb(49 46 129 / 0.12); }
.plan h3, .plan p { margin: 0; }
.plan button { margin-top: 0.5rem; padding: 0.45rem 1rem; border: 0; border-radius: 999px; background: #4f46e5; color: white; font: inherit; }
```
```js
import { animate, hover, press } from 'motion';

hover('.plan', (element) => {
  animate(element, { y: -6 }, { duration: 0.2 });
  return () => animate(element, { y: 0 }, { duration: 0.2 });
});

press('.plan button', (element) => {
  animate(element, { scale: 0.92 }, { duration: 0.1 });
  return () => animate(element, { scale: 1 }, { type: 'spring', stiffness: 600, damping: 15 });
});
```
:::

Najeď na kartu a stiskni tlačítko myší, pak na tlačítko přejdi klávesou Tab a podrž Enter. Zkus v `press` smazat `return`: tlačítko zůstane zmáčknuté.

:::check
Co udělá `hover` z Motion na telefonu, když uživatel klepne na kartu?

### --answer--
Karta se zvedne a zůstane zvednutá, dokud uživatel neklepne jinam.

#### --why--
Tohle je chování emulovaného `mouseenter` po klepnutí, kterému se `hover` vyhne.

### --correct--
Nic, `hover` reaguje jen na najetí skutečným ukazatelem a dotyk ignoruje.

#### --why--
Na dotyku žádné najetí není. Pro reakci na klepnutí se hodí `press`.

### --answer--
Karta se zvedne a hned klesne zpátky.

#### --why--
Gesto najetí na dotykovém displeji vůbec nezačne, takže se nic nezvedne.
:::

## Kdy co

| potřebuješ | sáhni po |
|---|---|
| přeskládání prvků v jedné stránce (filtr, řazení, přesun mezi seznamy) | GSAP Flip, u jednoho prvku stačí ruční FLIP |
| přelet prvku mezi dvěma stavy, které se vykreslí úplně jinak (miniatura → detail) | View Transitions, s variantou bez podpory |
| přechod při kliknutí na odkaz na jinou stránku | `@view-transition { navigation: auto; }` |
| mikrointerakce s pružinou, hover a stisk | Motion `animate`, `hover`, `press` |
| složená sekvence, scroll, text po řádcích | GSAP (timeline, ScrollTrigger, SplitText) |

View Transitions animují **snímky**, ne živé prvky. Během přechodu se obsah pod nimi neaktualizuje, a video nebo animace uvnitř snímku na chvíli zamrzne. Flip animuje skutečné prvky, takže během animace fungují a jde je přerušit dalším kliknutím.

:::explain
Vysvětli, proč se filtr s častým klikáním hodí spíš na GSAP Flip než na View Transitions.

## --model--
View transition během animace ukazuje jen snímky starého a nového stavu a nový přechod ten běžící ukončí, takže při rychlém klikání karty skáčou. Flip animuje skutečné prvky transformacemi a nové `Flip.getState` si zapamatuje i polohu uprostřed animace, takže další filtr plynule naváže. Navíc Flip přidá prvkům, které přibyly nebo zmizely, vlastní animaci přes `onEnter` a `onLeave`.

## --checklist--
- View transition animuje snímky, ne živé prvky.
- Nový přechod běžící přechod ukončí a karty skočí.
- Flip animuje skutečné prvky transformacemi.
- `Flip.getState` zachytí i polohu uprostřed animace, další animace naváže.
:::

## Typické chyby a pasti

> [!PITFALL] `Flip.getState` až po změně
> *Příznak:* filtr funguje, ale karty skáčou bez animace a konzole je prázdná.
>
> *Oprava:* stav se musí uložit **před** změnou DOM. Po změně je uložený stav shodný s novým a Flip nemá co animovat.

> [!PITFALL] Stejné `view-transition-name` na dvou prvcích
> *Příznak:* detail se otevře skokem a v konzoli je `Unexpected duplicate view-transition-name: photo`.
>
> *Oprava:* jméno ve funkci změny **přesuň** (starému prvku smaž, novému nastav) a po `await transition.finished` ho smaž i novému.

> [!PITFALL] Změna mimo funkci přechodu
> *Příznak:* `document.startViewTransition()` se zavolá, ale nic nepřeletí, jen se prolne celá stránka nebo se nestane nic.
>
> *Oprava:* DOM měň **uvnitř** funkce, kterou metodě předáš. Když změníš DOM před voláním, starý snímek už zachytí nový stav.

> [!PITFALL] Gesto bez vrácené funkce
> *Příznak:* tlačítko se po stisku zmenší a už se nevrátí.
>
> *Oprava:* funkce předaná do `press` nebo `hover` musí vrátit funkci pro konec gesta, ve které animuješ zpátky.

:::check
Kolega píše otevření detailu takhle a nic nepřeletí:

```js
thumb.style.viewTransitionName = 'photo';
detail.hidden = false;
document.startViewTransition(() => {
  thumb.style.viewTransitionName = '';
  detailImage.style.viewTransitionName = 'photo';
});
```

Který řádek je na špatném místě?

### --expected--
detail.hidden = false

### --accept--
detail.hidden = false;
detail.hidden=false

### --why--
Detail se ukáže ještě před voláním `startViewTransition`, takže starý snímek už zachytí otevřený detail. Změna viditelnosti patří do funkce přechodu spolu s přesunem jména.
:::

Ve workshopu z toho postavíš portfolio fotografky: filtr zakázek s Flip, detail fotky přes View Transitions a srdíčko na pružině.

## Kde to najdeš v MDN

- [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) — přehled přechodů v jednom dokumentu i mezi dokumenty.
- [ViewTransition: finished](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/finished) — promise, na který čekáš před úklidem jména.
- [view-transition-class](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-class) — společný styl pro skupinu přechodů.
- [Element.getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) — měření polohy pro ruční FLIP.

# --questions--

## --question--

Karta v seznamu se po kliknutí přesune nahoru přes `list.prepend(card)`. Ruční FLIP změřil First −40 px nad nadpisem a Last 0. Jakou transformaci dostane karta v prvním snímku animace (krok Invert), když se změnilo jen `top`, a to First.top = 300 a Last.top = 120?

### --expected--
translateY(180px)

### --accept--
translate(0px, 180px)
translate(0, 180px)
translateY(180px);
translate3d(0, 180px, 0)

### --why--
Invert posune prvek zpátky na starou polohu: `First.top − Last.top = 300 − 120 = 180`. Karta tedy začne 180 px níž, kde byla, a animace ji dovede na nulu.

### --see--
css-efekty-animace/layout-a-view-transitions#technika-flip-rucne

## --question--

Galerie otevírá detail přes `startViewTransition` a `view-transition-name` přesunuté z miniatury na detail. První otevření funguje, druhé (jiná fotka) proběhne skokem. Co v kódu nejspíš chybí?

### --answer--
Detekce podpory `if (!document.startViewTransition)`.

#### --why--
Prohlížeč přechody podporuje, první otevření fungovalo. Chyba je v tom, co zůstalo po prvním přechodu.

### --correct--
Smazání jména na detailu po `await transition.finished`.

#### --why--
Po prvním přechodu má detail jméno pořád. Druhá miniatura pak dostane stejné jméno a v novém snímku jsou dva prvky se stejným jménem.

### --answer--
`view-transition-class` na miniaturách.

#### --why--
Třída jen sdílí styl animace. Jedinečnost jména nijak neřeší.

### --see--
css-efekty-animace/layout-a-view-transitions#view-transitions-vlastni-animace-a-sdileny-prvek

## --question--

Napiš, co vrátí funkce předaná do `press` z Motion, aby se tlačítko po puštění vrátilo do původní velikosti.

### --expected--
funkci, která animuje zpátky

### --accept--
funkci
funkci pro konec gesta
arrow funkci
funkci, která se zavolá při puštění

### --why--
Motion vrácenou funkci zavolá na konci gesta, ať skončí puštěním tlačítka, zrušením, nebo vytažením prstu mimo prvek. Uvnitř animuješ zpátky do původního stavu.

### --see--
css-efekty-animace/layout-a-view-transitions#gesta-hover-a-press
