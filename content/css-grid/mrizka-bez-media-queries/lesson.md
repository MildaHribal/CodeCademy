# Mřížka, která se přizpůsobí sama

Výpis produktů v e-shopu, galerie fotek nebo přehled receptů mají na monitoru pět sloupců, na tabletu tři a na telefonu jeden. Většina moderních webů to dělá bez jediného media dotazu, jedním řádkem CSS. Než začneš, zkus odhadnout:

:::check pretest
Kontejner je široký 1000 px, bez mezer, a má `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`. Kolik sloupců vznikne?

### --expected--
5

### --accept--
pět

### --why--
Do 1000 px se sloupec široký aspoň 200 px vejde pětkrát. Jak přesně se počet sloupců počítá, i s mezerami, ukáže druhá část lekce.
:::

:::check pretest
Mřížka má `repeat(auto-fit, minmax(150px, 1fr))` a je v ní jen jedna karta. Kontejner je široký 900 px. Jak široká bude karta?

### --answer--
150 px, protože to je minimum sloupce.

#### --why--
Minimum platí, jen když není místo. Co udělá `auto-fit` s prázdnými sloupci, ukáže část o rozdílu `auto-fill` a `auto-fit`.

### --correct--
900 px, přes celou šířku.

#### --why--
`auto-fit` prázdné sloupce zruší a jediná karta s `1fr` si vezme celé místo. Proč to u výpisu produktů bývá past, uvidíš v části o `auto-fill` a `auto-fit`.

### --answer--
300 px, protože se vejdou tři sloupce.

#### --why--
Sloupců po 150 px se do 900 px vejde víc než tři. A jestli prázdné sloupce zůstanou, je právě ten rozdíl mezi dvěma klíčovými slovy. Rozdíl ukáže část o `auto-fill` a `auto-fit`.
:::

## Problém: kolik sloupců se vejde

S `repeat(3, 1fr)` má mřížka vždycky tři sloupce. Na monitoru jsou karty zbytečně široké, na telefonu tak úzké, že se nadpis láme po slovech. Dá se to řešit media dotazem pro každou šířku, ale pak máš v CSS tři až pět bodů zlomu a každá nová karta s jiným obsahem je může rozbít.

Lepší je říct mřížce, **jak široký sloupec nejmíň potřebuješ**, a počet sloupců nechat na ní. Přepínač mění šablonu, posuvník šířku kontejneru:

:::live
```html
<ul class="recipes">
  <li>Svíčková</li>
  <li>Kulajda</li>
  <li>Bramboráky</li>
  <li>Buchty</li>
  <li>Guláš</li>
  <li>Knedlíky</li>
  <li>Koláče</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.recipes {
  display: grid;
  grid-template-columns: var(--template);
  gap: 8px;
  width: var(--width);
  margin: 0;
  padding: 0;
  list-style: none;
  outline: 2px dashed #94a3b8;
}

.recipes li {
  padding: 1.5rem 0.75rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #fb923c, #e11d48);
  color: white;
  font-weight: 600;
}
```
```controls
--template: select("repeat(3, 1fr)", "repeat(auto-fill, minmax(8rem, 1fr))") = repeat(3, 1fr) | grid-template-columns
--width: range(200, 700, 50, px) = 500 | šířka kontejneru
```
:::

Nech `repeat(3, 1fr)` a posuvníkem kontejner zužuj: sloupce jsou pořád tři a na 200 px se jména receptů lámou. Pak přepni na `auto-fill` a posuvník projeď znovu — sloupců ubývá a přibývá tak, aby žádný nebyl užší než `8rem`.

> [!REMEMBER]
> **`repeat(auto-fill, minmax(8rem, 1fr))` znamená: vytvoř tolik sloupců, kolik se jich vejde při šířce aspoň `8rem`, a místo, které zbude, mezi ně rozděl.** Minimum řídí počet sloupců, `1fr` jejich skutečnou šířku.

:::check
Proč nejde místo `minmax(8rem, 1fr)` napsat jen `repeat(auto-fill, 1fr)`?

### --answer--
Jde, jen to udělá sloupce stejně široké.

#### --why--
Zkus to v ukázce: mřížka spadne do jednoho sloupce. Podívej se, co by prohlížeč potřeboval vědět, aby spočítal, kolik sloupců se vejde.

### --correct--
Prohlížeč potřebuje pevné minimum, aby spočítal, kolik sloupců se vejde; samotné `1fr` žádnou velikost nemá a deklarace je neplatná.

#### --why--
`fr` je díl zbylého místa, ne délka. Bez minima nejde počet sloupců spočítat, deklarace se zahodí a mřížka má jediný implicitní sloupec.

### --answer--
Protože `auto-fill` funguje jen s `px`, ne s `rem`.

#### --why--
`auto-fill` přijme jakoukoli pevnou délku, `rem` i `px`. Problém je v tom, že `1fr` délka není.
:::

## Jak prohlížeč spočítá počet sloupců

Pro `repeat(auto-fill, minmax(MIN, 1fr))` s mezerou `GAP` v kontejneru širokém `W` prohlížeč postupuje takhle:

1. Kolik sloupců široké `MIN` se vejde i s mezerami mezi nimi: `n = ⌊(W + GAP) / (MIN + GAP)⌋`, aspoň 1. Mezer je o jednu méně než sloupců, proto se `GAP` přičítá i k `W`.
2. Z `n` sloupců vznikne obyčejná šablona `repeat(n, minmax(MIN, 1fr))`.
3. Šířka sloupce je `(W − (n − 1) × GAP) / n`.

Příklad: kontejner 1000 px, `gap` 20 px, minimum 200 px. Vejde se ⌊1020 / 220⌋ = 4 sloupce a každý bude (1000 − 60) / 4 = **235 px**.

:::live predict
```html
<ul class="grid">
  <li class="card"></li>
  <li class="card"></li>
  <li class="card"></li>
  <li class="card"></li>
  <li class="card"></li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 16px;
  width: 1000px;
  margin: 0;
  padding: 0;
  list-style: none;
  outline: 2px dashed #94a3b8;
}

.card {
  padding: 1.5rem 0.5rem;
  border-radius: 0.5rem;
  background: #38bdf8;
  font-weight: 700;
  text-align: center;
}
```
```js
// Vypíše do každé karty její skutečnou šířku.
function showWidths() {
  for (const card of document.querySelectorAll('.card')) {
    const text = `${Math.round(card.getBoundingClientRect().width)} px`;
    if (card.textContent !== text) card.textContent = text;
  }
  requestAnimationFrame(showWidths);
}

showWidths();
```
--question-- Kontejner 1000 px, `gap: 16px`, `minmax(15rem, 1fr)` (15rem = 240 px). Jak široká bude jedna karta?
--option-- 238 px
--option-- 240 px
--option*-- 323 px
--why-- Čtyři sloupce po 240 px by i s třemi mezerami potřebovaly 1 008 px, a to se nevejde. Vejdou se tři: ⌊1016 / 256⌋ = 3. Tři sloupce a dvě mezery: (1000 − 32) / 3 ≈ 323 px. 238 px vyjde, když se na mezery zapomene při počítání sloupců, 240 px, když karta zůstane na minimu. Zkus v kódu změnit šířku kontejneru na `1010px`: čtvrtý sloupec se vejde a karty skočí na 240 px.
--see-- css-grid/mrizka-bez-media-queries#jak-prohlizec-spocita-pocet-sloupcu
:::

:::check
Kontejner je široký 700 px a má `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;`. Jak široký bude jeden sloupec?

### --expected--
220

### --accept--
220 px
220px

### --why--
⌊(700 + 20) / (200 + 20)⌋ = 3 sloupce. Dvě mezery zaberou 40 px a zbylých 660 px se rozdělí na třetiny.
:::

## `auto-fill`, nebo `auto-fit`

Obě klíčová slova počítají sloupce stejně. Liší se jen tím, co udělají se sloupci, na které **nezbyla žádná položka**:

- `auto-fill` prázdné sloupce nechá, položky zůstanou úzké a vpravo je volno,
- `auto-fit` prázdné sloupce sbalí na nulu a položky s `1fr` si místo rozdělí.

Když je položek dost na zaplnění řádku, vypadají obě stejně. Obě varianty níž mají jen dvě položky:

:::compare
```html
<ul class="results">
  <li>Chata Pod Sněžkou</li>
  <li>Penzion Lipno</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.results {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  outline: 2px dashed #94a3b8;
}

.results li {
  padding: 1rem 0.5rem;
  border-radius: 0.5rem;
  background: #a7f3d0;
}
```
--variant-- auto-fill
```css
.results { grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr)); }
```
--variant-- auto-fit
```css
.results { grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr)); }
```
:::

S `auto-fill` jsou dva výsledky hledání stejně úzké jako v plném řádku. S `auto-fit` se roztáhnou přes celou šířku. Zkus ve společném HTML přidat další čtyři položky `<li>` a sleduj, že od plného řádku vypadají obě varianty stejně.

> [!PITFALL] Jeden výsledek hledání přes celou obrazovku
> *Příznak:* výpis produktů s `auto-fit` vypadá dobře, dokud filtr nenajde jediný produkt — pak má karta na monitoru 1 200 px a obrázek v ní je obří.
>
> *Oprava:* u výpisů, kde se počet položek mění, použij `auto-fill`. `auto-fit` se hodí tam, kde mají pár položek vyplnit celý řádek, třeba tři dlaždice statistik.

:::check
Na úvodní stránce jsou tři dlaždice „Objednávky", „Tržby" a „Zákazníci" a mají vyplnit celou šířku, i když by se jich vešlo pět. Které klíčové slovo použiješ?

### --expected--
auto-fit

### --why--
`auto-fit` sbalí dva prázdné sloupce a tři dlaždice si rozdělí celou šířku. S `auto-fill` by vpravo zůstalo prázdné místo pro další dvě.
:::

## `min()` v `minmax()`: mřížka na úzkém telefonu

Minimum v `minmax()` je tvrdé. Když je kontejner užší než jeden sloupec, sloupec se pod minimum nezmenší — vznikne jeden sloupec široký právě na minimum a přeteče.

:::live predict
```html
<ul class="articles">
  <li>Deset tras na kolo po jižních Čechách</li>
  <li>Jak přežít první noc ve stanu</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.articles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1rem;
  width: 280px;
  margin: 0;
  padding: 0;
  list-style: none;
  outline: 2px dashed #94a3b8;
}

.articles li {
  padding: 1rem;
  border-radius: 0.5rem;
  background: #c4b5fd;
}
```
--question-- Kontejner je široký 280 px a sloupce mají minimum `20rem` (320 px). Co se stane s kartami?
--option-- Karty se zmenší na 280 px, minimum se na úzkém kontejneru ignoruje.
--option*-- Karty budou pod sebou, široké 320 px, a o 40 px přetečou z kontejneru.
--option-- Mřížka se nezobrazí, protože se do ní nevejde ani jeden sloupec.
--why-- Vždycky vznikne aspoň jeden sloupec a jeho šířka nesmí klesnout pod minimum 320 px, takže přeteče. Na telefonu to znamená stránku, která jde posouvat do strany. Přepiš šablonu na `repeat(auto-fill, minmax(min(20rem, 100%), 1fr))`: `min()` vybere menší z hodnot, na úzkém kontejneru tedy 100 % a karta se vejde.
--see-- css-grid/mrizka-bez-media-queries#min-v-minmax-mrizka-na-uzkem-telefonu
:::

`min(20rem, 100%)` se vyhodnotí pro každý kontejner zvlášť. Na monitoru je 100 % víc než `20rem`, a tak platí `20rem` a sloupců je víc. Na telefonu s kontejnerem užším než `20rem` platí `100%` a sloupec je přesně široký jako kontejner.

> [!TIP]
> Tenhle tvar si zapamatuj jako celek, v praxi ho píšeš pořád: `grid-template-columns: repeat(auto-fill, minmax(min(15rem, 100%), 1fr));`

:::check
Kontejner je široký 250 px a má `repeat(auto-fill, minmax(min(18rem, 100%), 1fr))`. Jak široký bude sloupec?

### --expected--
250

### --accept--
250 px
250px

### --why--
18rem je 288 px, 100 % kontejneru je 250 px. `min()` vybere menší hodnotu, vejde se přesně jeden sloupec široký 250 px a nic nepřeteče.
:::

## Položky přes víc sloupců a `dense`

Doporučená karta nebo fotka na šířku může v automatické mřížce dostat `grid-column: span 2`. [[automatické umísťování|Automatické umísťování]] ale jde po buňkách jen dopředu: když se široká položka do zbytku řádku nevejde, přeskočí na další řádek a za ní zůstane díra.

`grid-auto-flow: dense` řekne mřížce, ať se pro každou další položku vrátí a zkusí nejdřív zaplnit díry výš. Přepínač mění `grid-auto-flow`:

:::live
```html
<ul class="photos">
  <li>1</li>
  <li class="wide">2 na šířku</li>
  <li class="wide">3 na šířku</li>
  <li class="wide">4 na šířku</li>
  <li>5</li>
  <li>6</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
  grid-auto-flow: var(--flow);
  gap: 8px;
  width: 20rem;
  margin: 0;
  padding: 0;
  list-style: none;
  outline: 2px dashed #94a3b8;
}

.photos li {
  padding: 1.25rem 0.5rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  color: white;
  font-weight: 700;
}

.photos .wide {
  grid-column: span 2;
}
```
```controls
--flow: toggle(row, row dense) = row | grid-auto-flow
```
:::

:::live predict
```html
<ul class="photos">
  <li>1</li>
  <li class="wide">2 na šířku</li>
  <li class="wide">3 na šířku</li>
  <li class="wide">4 na šířku</li>
  <li>5</li>
  <li>6</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.photos {
  display: grid;
  grid-template-columns: repeat(3, 6rem);
  grid-auto-flow: row dense;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.photos li {
  padding: 1.25rem 0.5rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  color: white;
  font-weight: 700;
}

.photos .wide {
  grid-column: span 2;
}
```
--question-- Tři sloupce, fotky 2, 3 a 4 přes dva sloupce, `grid-auto-flow: row dense`. Kam se dostane fotka 5?
--option-- Do třetího řádku vpravo vedle fotky 4, jako bez `dense`.
--option*-- Do druhého řádku vpravo vedle fotky 3, do díry za ní.
--option-- Do prvního řádku před fotku 2, protože je užší.
--why-- Fotka 3 se nevejde vedle fotky 2, a tak začne druhý řádek a vpravo od ní zbude jedna buňka. Fotka 4 je taky široká, do té buňky se nevejde a jde do třetího řádku. S `dense` se fotka 5 vrátí do první volné buňky, do které se vejde — do díry vedle trojky. Bez `dense` by šla až za čtyřku. Buňky v prvním řádku jsou obsazené, před dvojku se tedy nedostane.
--see-- css-grid/mrizka-bez-media-queries#polozky-pres-vic-sloupcu-a-dense
:::

> [!PITFALL] `dense` přehází pořadí pro klávesnici
> *Příznak:* v galerii s `dense` vidí uživatel fotky v pořadí 1, 2, 3, 5, 4, ale klávesa Tab a čtečka obrazovky je projdou v pořadí HTML, takže fokus skáče po stránce.
>
> *Oprava:* `dense` jen tam, kde pořadí nenese význam (dekorativní galerie). Ve výpisu produktů seřazených podle ceny ho nepoužívej.

:::check
Výpis šesti produktů seřazených podle ceny od nejlevnějšího má mezi kartami díry, protože dvě karty mají `span 2`. Kolega navrhuje `grid-auto-flow: dense`. Proč to tady není dobrý nápad?

### --answer--
Protože `dense` nefunguje s `auto-fill`.

#### --why--
`dense` funguje s jakoukoli šablonou. Problém je v tom, co udělá s pořadím karet.

### --correct--
Protože přesune levnější karty za dražší jen vizuálně: řazení podle ceny se rozbije pro oko a klávesnice půjde jiným pořadím než obraz.

#### --why--
`dense` doplňuje díry položkami, které přijdou později. Ve výpisu seřazeném podle ceny tím uživatel uvidí špatné pořadí a Tab bude skákat. Díry je lepší řešit rozvržením, třeba širokou kartou jen na začátku.

### --answer--
Protože `dense` karty zmenší, aby se vešly do děr.

#### --why--
`dense` velikost položek nemění, jen hledá volnou buňku, do které se položka vejde celá.
:::

## Karty zarovnané napříč: `subgrid`

V řadě karet má každá karta nadpis jinak dlouhý. Když je karta flex nebo grid sama o sobě, počítá si výšku nadpisu jen podle sebe — popis a cena pak v sousedních kartách začínají jinde. Cenu jde dostat ke dnu automatickým marginem, ale popisy srovnané nebudou.

[[subgrid]] (*subgrid*) to vyřeší tak, že karta **převezme řádky rodičovské mřížky**. Karta se roztáhne přes tolik řádků rodiče, kolik má částí (`grid-row: span 3`), a její vlastní řádky jsou právě ty (`grid-template-rows: subgrid`). Výšku řádku pak určuje nejvyšší obsah v celém řádku mřížky, ne v jedné kartě.

Obě varianty níž mají stejné HTML i vzhled, liší se jen pravidlem pro kartu:

:::compare
```html
<ul class="tours">
  <li class="tour">
    <h3 class="tour__title">Sněžka</h3>
    <p class="tour__text">Výstup z Pece pod Sněžkou s průvodcem.</p>
    <p class="tour__price">890 Kč</p>
  </li>
  <li class="tour">
    <h3 class="tour__title">Hřebenovka Krkonoš od Harrachova po Pomezní Boudy</h3>
    <p class="tour__text">Tři dny po hřebenech, spaní na boudách.</p>
    <p class="tour__price">4 900 Kč</p>
  </li>
  <li class="tour">
    <h3 class="tour__title">Adršpach</h3>
    <p class="tour__text">Skalní město pro rodiny s dětmi.</p>
    <p class="tour__price">650 Kč</p>
  </li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.tours {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tour {
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
}

.tour__title,
.tour__text {
  margin: 0;
  font-size: 0.875rem;
}

.tour__price {
  margin: 0;
  font-weight: 700;
  color: #0f766e;
}
```
--variant-- Flex sloupec v každé kartě
```css
.tour { display: flex; flex-direction: column; gap: 0.5rem; }
.tour__price { margin-top: auto; }
```
--variant-- Subgrid
```css
.tour { display: grid; grid-row: span 3; grid-template-rows: subgrid; row-gap: 0.5rem; }
```
:::

Ve flexové variantě jsou ceny u dna, ale popis „Tři dny po hřebenech" začíná níž než popisy vedle. V subgridu tvoří nadpisy jeden řádek mřížky, popisy druhý a ceny třetí, takže je všechno srovnané. `row-gap` na kartě přepisuje mezeru, kterou by karta jinak zdědila od rodičovské mřížky.

> [!PITFALL] Subgrid bez `span`
> *Příznak:* nadpis, popis a cena karty leží **přes sebe** v jednom řádku a karta je nízká jako jediný řádek textu.
>
> *Oprava:* subgrid má jen tolik řádků, přes kolik se karta roztáhne v rodiči, a nové si nevytvoří — co se nevejde, spadne do posledního řádku. Dej kartě `grid-row: span N`, kde N je počet částí.

:::check
Karta má čtyři části: obrázek, nadpis, popis a cenu. Chceš je zarovnat s kartami vedle přes subgrid. Napiš hodnotu `grid-row`, kterou dáš kartě.

### --expected--
span 4

### --why--
Karta musí v rodičovské mřížce zabrat čtyři řádky, jeden pro každou část. `grid-template-rows: subgrid` pak tyhle čtyři řádky použije jako své.
:::

## Typické chyby a pasti

> [!PITFALL] Mřížka na telefonu přetéká
> *Příznak:* `repeat(auto-fill, minmax(20rem, 1fr))` na telefonu širokém 320 px vyrobí kartu širokou 320 px v kontejneru s okraji, stránka jde posouvat do strany.
>
> *Oprava:* `minmax(min(20rem, 100%), 1fr)`.

Poslední past vzniká spojením dvou věcí z téhle lekce: široké položky a automatického počtu sloupců.

:::compare
```html
<ul class="shop">
  <li class="shop__item shop__item--featured">Doporučujeme</li>
  <li class="shop__item">Stan</li>
  <li class="shop__item">Spacák</li>
  <li class="shop__item">Vařič</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.shop {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 12px;
  width: 14rem;
  margin: 0;
  padding: 0;
  list-style: none;
  outline: 2px dashed #94a3b8;
}

.shop__item {
  padding: 1rem 0.5rem;
  border-radius: 0.5rem;
  background: #fde68a;
}

.shop__item--featured {
  background: #fb923c;
}
```
--variant-- Doporučená karta vždy přes dva sloupce
```css
.shop__item--featured { grid-column: span 2; }
```
--variant-- Přes dva sloupce jen na širokém kontejneru
```css
@media (min-width: 40rem) {
  .shop__item--featured { grid-column: span 2; }
}
```
:::

V levé variantě se do kontejneru vejde jen jeden sloupec. Doporučená karta chce dva, a tak grid přidá úzký automatický sloupec, do kterého se zmáčkne jedna z dalších karet. Pravá varianta dá kartě dva sloupce, jen když je okno aspoň `40rem` široké. Zkus ve společném CSS rozšířit kontejner na `24rem` a sleduj levou variantu.

> [!PITFALL] `span 2` v mřížce, kde se vejde jen jeden sloupec
> *Příznak:* na telefonu se objeví úzký sloupec navíc, jedna karta je v něm zmáčknutá a doporučená karta přetéká z kontejneru.
>
> *Oprava:* širokou položku zapni až od šířky, kde se vejdou aspoň dva sloupce (media dotaz), nebo na úzké obrazovce nech `grid-column: auto`.

:::explain
Vysvětli vlastními slovy, jak `repeat(auto-fill, minmax(min(15rem, 100%), 1fr))` udělá mřížku, která se přizpůsobí šířce bez media dotazů.

## --model--
`auto-fill` vytvoří tolik sloupců, kolik se jich vejde při šířce aspoň 15rem, i s mezerami. `1fr` pak místo, které zbude, rozdělí mezi ně, takže sloupce vyplní celý řádek. `min(15rem, 100%)` hlídá úzký kontejner: když je užší než 15rem, minimum je jeho šířka a jediný sloupec nepřeteče.

## --checklist--
- `auto-fill` spočítá počet sloupců podle minima a šířky kontejneru.
- `1fr` rozdělí zbylé místo, takže sloupce vyplní řádek.
- `min(…, 100%)` zabrání přetečení, když je kontejner užší než minimum.
:::

:::check
Galerie má `repeat(auto-fit, minmax(12rem, 1fr))`, všechno funguje, jen po filtru „Jen panoramata" zbude jedna fotka a je přes celou šířku. Napiš opravenou hodnotu `grid-template-columns`.

### --expected--
repeat(auto-fill, minmax(12rem, 1fr))

### --why--
`auto-fit` sbalí prázdné sloupce a jediná fotka si vezme celý řádek. `auto-fill` prázdné sloupce nechá a fotka zůstane široká jako v plném řádku.
:::

## Kde to najdeš v MDN

- [`repeat()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/repeat) — `auto-fill` a `auto-fit`, i podmínka, že opakovaná stopa musí mít pevné minimum.
- [Auto-placement in grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Auto-placement) — jak grid skládá položky do buněk, díry a `grid-auto-flow: dense`.
- [Subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid) — převzetí řádků a sloupců rodiče, dědění `gap` a proč subgrid netvoří nové řádky.
- [`min()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/min) — výběr menší z hodnot, i s procenty.

# --questions--

## --question--

Kontejner je široký 1200 px, `gap: 24px` a `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`. Kolik sloupců vznikne?

### --expected--

4

### --accept--

čtyři

### --why--

⌊(1200 + 24) / (280 + 24)⌋ = ⌊1224 / 304⌋ = 4. Pátý sloupec by i s mezerou potřeboval dalších 304 px.

### --see--

css-grid/mrizka-bez-media-queries#jak-prohlizec-spocita-pocet-sloupcu

## --question--

Výpis článků má `repeat(auto-fill, minmax(18rem, 1fr))`. Na telefonu s kontejnerem 260 px jde stránka posouvat do strany. Co je nejmenší oprava?

### --answer--

`repeat(auto-fit, minmax(18rem, 1fr))`

#### --why--

`auto-fit` jen sbalí prázdné sloupce. Jeden sloupec se svým minimem 288 px zůstane a přeteče dál.

### --correct--

`repeat(auto-fill, minmax(min(18rem, 100%), 1fr))`

#### --why--

`min()` na úzkém kontejneru vybere 100 %, takže minimum sloupce je šířka kontejneru a nic nepřeteče.

### --answer--

`repeat(auto-fill, minmax(18rem, 100%))`

#### --why--

Maximum 100 % na minimu nic nemění. Sloupec se pod 18rem pořád nezmenší.

### --see--

css-grid/mrizka-bez-media-queries#min-v-minmax-mrizka-na-uzkem-telefonu

## --question--

Karta v mřížce má `display: grid; grid-template-rows: subgrid;` a tři části, ale žádné `grid-row`. Co uvidíš?

### --answer--

Karta bude vypadat stejně jako bez subgridu, části pod sebou.

#### --why--

Bez subgridu by karta měla vlastní implicitní řádky. Subgrid ale vlastní řádky nevytváří — podívej se, přes kolik řádků rodiče karta vede.

### --correct--

Všechny tři části budou přes sebe v jediném řádku.

#### --why--

Karta vede jen přes jeden řádek rodiče, takže subgrid má jediný řádek. Nové řádky si nevytvoří a části, které se nevejdou, spadnou do posledního, tedy toho jediného.

### --answer--

Prohlížeč přidá rodičovské mřížce řádky pro všechny části.

#### --why--

Rodič neví, kolik částí karta má. Řádky se v něm přidávají jen pro položky rodiče, ne pro obsah subgridu.

### --see--

css-grid/mrizka-bez-media-queries#karty-zarovnane-napric-subgrid

## --question--

Galerie má `grid-template-columns: repeat(3, 1fr)` bez `dense`. Položky v HTML jsou A (přes tři sloupce), B, C (přes dva sloupce) a D. Kolik řádků vznikne?

### --expected--

3

### --accept--

tři

### --why--

A zabere celý první řádek. B jde do druhého řádku vlevo a C přes dva sloupce se vejde vedle ní. Druhý řádek je plný, a tak D začne třetí řádek.

### --see--

css-grid/mrizka-bez-media-queries#polozky-pres-vic-sloupcu-a-dense
