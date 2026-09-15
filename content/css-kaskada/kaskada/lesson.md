# Kaskáda: kdo vyhraje

Na každém větším webu míří na jedno tlačítko pravidla z několika míst: ze šablony, z komponenty, z utility třídy, někdy i z pluginu. Když napíšeš `background: red` a tlačítko zůstane modré, dá se hádat a přidávat `!important` — nebo předem vědět, které pravidlo vyhraje. Tahle lekce je o tom druhém.

:::check pretest
V CSS je nahoře `#cart .button { color: white; }` a o sto řádků níž `.button--danger { color: yellow; }`. Tlačítko `<a class="button button--danger">` leží uvnitř `<div id="cart">`. Jakou barvu bude mít text?

### --answer--
Žlutou, protože pravidlo je v souboru později.

#### --why--
Pořadí v souboru rozhoduje, jen když jsou obě pravidla jinak rovnocenná. Tady rovnocenná nejsou — jedno z nich má v selektoru něco navíc.

### --correct--
Bílou, protože selektor s id je silnější než selektor s třídou.

#### --why--
Selektor `#cart .button` obsahuje id a to přebije jakýkoli selektor složený jen ze tříd, ať je napsaný kdekoli. Proč přesně, ukáže část o specificitě.

### --answer--
Barvy se smíchají do světle žluté.

#### --why--
CSS hodnoty nemíchá. Pro každou vlastnost vybere jedinou vítěznou deklaraci.
:::

:::check pretest
Kolik tříd musí mít selektor, aby přebil selektor s jedním id?

### --answer--
Dvě.

#### --why--
Dvě třídy nestačí — a nestačilo by ani deset.

### --answer--
Jedenáct, protože jedno id má hodnotu deseti tříd.

#### --why--
Tak to vypadá, když si specificitu představíš jako jedno číslo s desítkovými řády. Takhle ale nepočítá.

### --correct--
Žádný počet tříd id nepřebije.

#### --why--
Specificita se porovnává po sloupcích zleva: nejdřív počet id, a teprve když je stejný, počet tříd. Uvidíš za chvíli.
:::

## Problém: styl, který se neprojeví

E-shop má šablonu, ve které jsou tlačítka v kartě produktu modrá. Ty chceš u tlačítka „Odstranit" červené pozadí, a tak pod šablonu připíšeš vlastní pravidlo:

:::live
```html
<article class="product">
  <h2 class="product__name">Batoh Deuter Futura 32</h2>
  <p class="product__price">3 490 Kč</p>
  <div class="product__actions">
    <a class="button" href="#">Do košíku</a>
    <a class="button button--danger" href="#">Odstranit</a>
  </div>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.product {
  max-width: 20rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
}

.product__name { margin: 0; font-size: 1.125rem; }
.product__price { margin: 0.25rem 0 1rem; color: #475569; }

/* Šablona */
.product .product__actions a {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: #1d4ed8;
  color: white;
  text-decoration: none;
}

/* Tvoje pravidlo — napsané později */
.button--danger {
  background: #dc2626;
  font-weight: 700;
}
```
:::

Tlačítko „Odstranit" je tučné, ale pořád modré. Tvoje pravidlo se tedy použilo — jen jeho `background` prohrál. Zkus v posledním pravidle změnit selektor na `.product .product__actions .button--danger` a sleduj barvu.

Každé místo, kde se na jednu vlastnost jednoho prvku sejde víc deklarací, řeší [[kaskáda]] (*cascade*): algoritmus, který vybere jedinou vítěznou hodnotu.

> [!REMEMBER]
> **Když na stejnou vlastnost stejného prvku míří víc deklarací, prohlížeč je porovná podle pevného žebříčku kritérií a rozhodne první kritérium, ve kterém se liší.** Soutěží jednotlivé deklarace, ne celá pravidla.

:::check
Proč tlačítko „Odstranit" v ukázce zčervenalo až po prodloužení selektoru, přestože pravidlo `.button--danger` bylo celou dobu v souboru pod šablonou?

### --answer--
Pravidlo pod šablonou se ignorovalo, protože prohlížeč čte CSS jen jednou shora dolů.

#### --why--
Pravidlo se neignorovalo — tučné písmo z něj platilo celou dobu. Prohrála jen jedna jeho deklarace.

### --correct--
Šablona měla silnější selektor, a pořadí v souboru rozhoduje až mezi rovnocennými selektory.

#### --why--
Selektor šablony obsahuje dvě třídy a jeden typ prvku, tvoje původní pravidlo jen jednu třídu. Silnější selektor vyhraje dřív, než se na pořadí vůbec dojde.

### --answer--
Vlastnost `background` jde přepsat jen selektorem, který obsahuje název rodiče.

#### --why--
Žádná vlastnost nevyžaduje konkrétní tvar selektoru. Rozhoduje, jak silný je selektor ve srovnání s ostatními.
:::

## Žebříček kaskády

Prohlížeč prochází kritéria v tomhle pořadí. Jakmile se deklarace v některém liší, je rozhodnuto a další kritéria už nehrají roli:

| pořadí | kritérium | vyhraje |
|---|---|---|
| 1 | původ a důležitost | autorův styl nad stylem prohlížeče; `!important` nad běžnou deklarací |
| 2 | inline styl | deklarace z atributu `style` nad stylopisem |
| 3 | vrstvy `@layer` | pozdější vrstva; styl mimo vrstvu nad všemi vrstvami |
| 4 | specificita | selektor s vyšší specificitou |
| 5 | pořadí ve zdroji | deklarace, která je v CSS později |

Tabulku se nemusíš učit najednou — každému řádku patří jedna část lekce. Důležité je pořadí: specificita je až čtvrtá. Proto nepomůže zesílit selektor, když soupeř vyhrál už na prvním nebo třetím řádku.

Ještě před kaskádou prohlížeč zahodí deklarace, kterým nerozumí (překlep v názvu, neplatná hodnota). Ty se ničeho neúčastní.

:::check
Dvě deklarace `color` míří na stejný odstavec. Jedna je v pozdější vrstvě `@layer`, druhá má silnější selektor s id. Které kritérium o vítězi rozhodne?

### --answer--
Specificita, protože id je nejsilnější část selektoru.

#### --why--
Specificita je v žebříčku až za vrstvami. Když se deklarace liší ve vrstvě, na specificitu se nedojde.

### --correct--
Vrstvy — rozhodnou dřív, než se porovná specificita.

#### --why--
Vrstvy jsou třetí kritérium, specificita čtvrté. Deklarace z pozdější vrstvy vyhraje i se slabým selektorem.

### --answer--
Pořadí ve zdroji, protože je poslední a má konečné slovo.

#### --why--
Poslední kritérium rozhoduje jen tehdy, když všechna předchozí skončila nerozhodně.
:::

## Původ stylu: prohlížeč, nebo ty

Deklarace mají [[původ stylu]] (*cascade origin*). Pro tebe jsou důležité dva:

- **styly prohlížeče** (*user agent stylesheet*) — výchozí vzhled: modré podtržené odkazy, tučné nadpisy, okraje odstavců,
- **autorské styly** (*author styles*) — všechno, co napíšeš ty: soubory přes `<link>`, bloky `<style>` i atribut `style`.

Autorský styl vyhraje nad stylem prohlížeče vždycky, bez ohledu na specificitu. Výchozí barvu odkazů přitom prohlížeč dává selektorem, který obsahuje pseudotřídu (v Chromu `a:-webkit-any-link`). Tipni si, co s ní udělá nejslabší možný autorský selektor:

:::live predict
```html
<p class="note">Doprava zdarma od 1 500 Kč. <a href="#podminky">Podmínky dopravy</a></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

* {
  color: #15803d;
}
```
--question-- Jakou barvu bude mít odkaz „Podmínky dopravy"?
--option-- Modrou, protože `*` je nejslabší selektor a výchozí styl odkazu ho přebije.
--option*-- Zelenou, protože autorský styl vyhraje nad stylem prohlížeče bez ohledu na selektor.
--option-- Zelenou jen text odstavce, odkaz zůstane modrý, protože hvězdička nevybírá odkazy.
--why-- Původ je první kritérium žebříčku. Deklarace `color` z tvého stylopisu a z výchozích stylů prohlížeče se liší už v původu, takže specificita se vůbec neporovnává. Hvězdička vybírá i odkaz. Zkus místo `*` napsat `body` — pak odkaz modrý zůstane. Proč, vysvětlí lekce o dědičnosti.
--see-- css-kaskada/kaskada#puvod-stylu-prohlizec-nebo-ty
:::

:::check
Na stránce je jen tvoje pravidlo `h1 { font-weight: 400; }`. Prohlížeč má pro `h1` ve výchozích stylech `font-weight: bold`. Bude nadpis tučný?

### --answer--
Ano, výchozí styly prohlížeče mají přednost, dokud je nevypneš resetem.

#### --why--
Výchozí styly nemají přednost — jsou jen základ, který tvoje deklarace přepíše. Žádný reset k tomu není potřeba.

### --correct--
Ne, autorská deklarace vyhraje nad výchozím stylem prohlížeče.

#### --why--
Deklarace se liší v původu a autorský původ vyhraje. Specificita selektorů se tu vůbec neporovnává.
:::

## Pořadí ve zdroji

Když jsou dvě deklarace ve všem ostatním rovnocenné, vyhraje ta, která je **později** — níž v souboru, v pozdějším `<style>` nebo v souboru připojeném pozdějším `<link>`. Pozor na slovo „ve zdroji": počítá se pořadí v CSS, ne v HTML. Tipni si:

:::live predict
```html
<p class="price price--sale">2 990 Kč</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.price--sale {
  color: #dc2626;
  font-weight: 700;
}

.price {
  color: #111827;
  font-size: 1.5rem;
}
```
--question-- Jakou barvu bude mít cena?
--option-- Červenou, protože `price--sale` je v atributu `class` uvedená jako druhá.
--option-- Červenou, protože modifikátor je konkrétnější než základní třída.
--option*-- Téměř černou, protože `.price` je v CSS později a oba selektory jsou stejně silné.
--why-- `.price` i `.price--sale` jsou jedna třída, takže specificita je stejná a rozhoduje [[pořadí ve zdroji]] — pořadí pravidel v CSS. Pořadí tříd v atributu `class` nehraje žádnou roli a „modifikátor" je jen jméno, prohlížeč o něm nic neví. Přesuň pravidlo `.price--sale` pod `.price` a cena zčervená.
--see-- css-kaskada/kaskada#poradi-ve-zdroji
:::

Proto se modifikátory (`.price--sale`, `.button--danger`) píšou pod základní třídu. A proto záleží i na pořadí souborů: když stránka připojí `components.css` před `theme.css`, stejně silná pravidla z `theme.css` vyhrají.

:::check
Stránka má v `<head>` nejdřív `<link href="app.css">` a pak `<link href="vendor.css">`. V obou souborech je pravidlo `.card { border-radius: … }`. Ze kterého souboru se vezme hodnota?

### --expected--
vendor.css

### --why--
Selektory jsou stejné, takže rozhoduje pořadí ve zdroji a soubor připojený později vyhraje. Když mají vlastní styly přebíjet knihovnu, připoj je až za ni.

### --see--
css-kaskada/kaskada#poradi-ve-zdroji
:::

## Specificita: trojice (A, B, C)

[[specificita|Specificita]] (*specificity*) říká, jak konkrétní je selektor. Prohlížeč ji počítá jako tři čísla (A, B, C):

- **A** — počet id (`#cart`),
- **B** — počet tříd (`.card`), atributových selektorů (`[type="email"]`) a pseudotříd (`:hover`, `:first-child`),
- **C** — počet typů prvků (`li`, `a`) a pseudoelementů (`::before`).

Hvězdička `*` a kombinátory (mezera, `>`, `+`, `~`) nepřidávají nic.

| selektor | (A, B, C) |
|---|---|
| `p` | (0, 0, 1) |
| `ul li a` | (0, 0, 3) |
| `.card p` | (0, 1, 1) |
| `a:hover` | (0, 1, 1) |
| `input[type="email"]` | (0, 1, 1) |
| `.nav > li + li` | (0, 1, 2) |
| `#cart .item::before` | (1, 1, 1) |
| `* > *` | (0, 0, 0) |

**Dvě specificity se porovnávají zleva, sloupec po sloupci, jako čísla verzí.** Vyšší A vyhraje bez ohledu na B a C. Když je A stejné, rozhoduje B, a teprve pak C. Sloupce se nikdy nepřelévají: (0, 11, 0) je pořád méně než (1, 0, 0).

> [!TIP]
> V DevTools v panelu Styles najeď myší na selektor pravidla. Chrome ukáže bublinu se specificitou, třeba `Specificity: (0,1,1)`.

Dva selektory na stejný odkaz v menu. Tipni si, který je silnější:

:::live predict
```html
<nav class="nav">
  <ul>
    <li><a href="#">Novinky</a></li>
    <li><a href="#">Výprodej</a></li>
  </ul>
</nav>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.nav a {
  color: #334155;
}

nav ul li a {
  color: #ea580c;
}
```
--question-- Jakou barvu budou mít odkazy?
--option*-- Tmavě šedou z `.nav a`.
--option-- Oranžovou z `nav ul li a`, protože má víc částí a je později.
--option-- Oranžovou z `nav ul li a`, protože popisuje přesnější cestu k odkazu.
--why-- `.nav a` má (0, 1, 1), `nav ul li a` má (0, 0, 4). Porovnává se zleva: A je u obou 0, v B má `.nav a` jedničku a je rozhodnuto. Čtyři typy prvků ve sloupci C nevyváží jednu třídu a pořadí se ani neporovná. Změň v prvním pravidle `.nav` na `nav` a oranžová vyhraje.
--see-- css-kaskada/kaskada#specificita-trojice-a-b-c
:::

:::check
Napiš specificitu selektoru `.cart li:first-child::after` ve tvaru `A,B,C`.

### --expected--
0,2,2

### --accept--
(0,2,2)
0-2-2
0 2 2

### --why--
Id tu není (A = 0). Třída `.cart` a pseudotřída `:first-child` dávají B = 2. Typ `li` a pseudoelement `::after` dávají C = 2.

### --see--
css-kaskada/kaskada#specificita-trojice-a-b-c
:::

A druhá dvojice, tentokrát id proti dlouhému řetězci tříd:

:::live predict
```html
<header id="site-header" class="header">
  <nav class="header__nav">
    <ul class="header__list">
      <li class="header__item"><a class="header__link" href="#">Kontakt</a></li>
    </ul>
  </nav>
</header>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.header .header__nav .header__list .header__item .header__link {
  color: #7c3aed;
}

#site-header a {
  color: #0f766e;
}
```
--question-- Jakou barvu bude mít odkaz „Kontakt"?
--option-- Fialovou, protože pět tříd je víc než jedno id a jeden typ.
--option*-- Tyrkysovou, protože id ve sloupci A přebije libovolný počet tříd.
--option-- Fialovou, protože řetězec tříd míří přímo na třídu odkazu, kdežto `a` je obecný typ.
--why-- Řetězec tříd má (0, 5, 0), `#site-header a` má (1, 0, 1). Sloupec A rozhodne hned: 1 > 0. Nezáleží na tom, jestli selektor končí třídou, nebo typem, ani jak dlouhý je. Proto se id selektory ve stylech nepoužívají — kdo je chce přebít, musí přidat další id.
--see-- css-kaskada/kaskada#specificita-trojice-a-b-c
:::

:::check
Který selektor vyhraje: `ul.menu li.active a` (0, 2, 3), nebo `.menu .active .link` (0, 3, 0)?

### --answer--
`ul.menu li.active a`, protože má celkem pět částí a druhý jen tři.

#### --why--
Části se nesčítají dohromady. Porovnává se sloupec po sloupci zleva.

### --correct--
`.menu .active .link`, protože má víc tříd ve sloupci B.

#### --why--
Ve sloupci A mají oba 0, ve sloupci B vyhraje 3 nad 2. Sloupec C se už neporovnává.
:::

## Inline styl a `!important`

Atribut `style` přímo na prvku je druhé kritérium žebříčku. [[inline styl|Inline styl]] (*inline style*) proto vyhraje nad deklarací z jakéhokoli selektoru, i s několika id.

Nad ním stojí už jen **důležitost**. Deklarace s `!important` na konci (`color: red !important;`) se přesune do vlastního patra: vyhraje nad všemi běžnými deklaracemi včetně inline stylu. Tipni si, jak dopadne souboj všech tří:

:::live predict
```html
<p id="delivery" class="notice" style="color: #1d4ed8">Objednávka dorazí ve čtvrtek.</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

#delivery {
  color: #15803d;
}

.notice {
  color: #b45309 !important;
  font-weight: 700;
}
```
--question-- Jakou barvu bude mít text?
--option-- Modrou, protože atribut `style` je přímo na prvku.
--option-- Zelenou, protože id má nejvyšší specificitu.
--option*-- Oranžovou, protože `!important` vyhraje nad běžnými deklaracemi i nad inline stylem.
--why-- Důležitost patří k prvnímu kritériu žebříčku, takže `!important` z pravidla `.notice` vyhraje dřív, než se dojde na inline styl nebo specificitu. Smaž `!important` a vyhraje inline modrá; smaž i atribut `style` a vyhraje zelená z id.
--see-- css-kaskada/kaskada#inline-styl-a-important
:::

Háček je v tom, co se stane, když `!important` napíše i soupeř. Dvě důležité deklarace se porovnají znovu podle zbytku žebříčku — specificity a pořadí. Kdo chce vyhrát, musí přidat `!important` **a** silnější selektor. Tak začíná válka, ve které má za rok každá druhá deklarace `!important` a nic nejde změnit bez dalšího.

> [!PITFALL] `!important` jako oprava
> *Příznak:* styl se neprojeví, přidáš `!important` a funguje to. Za měsíc se neprojeví jiná změna, protože soupeř je teď `!important` ty.
>
> *Oprava:* v DevTools zjisti, **které kritérium** tvoje deklarace prohrála (přeškrtnutá deklarace a vítězné pravidlo nad ní), a oprav příčinu — slabší selektor soupeře, pořadí souborů, vrstvu.

:::check
Dvě deklarace mají `!important`: `.button { background: gray !important; }` a pod ní `nav .button { background: teal !important; }`. Tlačítko leží v `<nav>`. Jaké bude mít pozadí?

### --expected--
teal

### --why--
Obě jsou důležité, takže důležitost nerozhodne. Pokračuje se žebříčkem: `nav .button` má (0, 1, 1), `.button` jen (0, 1, 0).

### --see--
css-kaskada/kaskada#inline-styl-a-important
:::

## Vrstvy `@layer`

Specificita se hodí uvnitř jedné komponenty, ale mezi celými skupinami stylů je to špatný nástroj. Chceš, aby reset byl vždycky nejslabší a utility třídy (`.text-center`, `.hidden`) vždycky nejsilnější — a selektory na to nemají vliv. Na to jsou [[kaskádová vrstva|kaskádové vrstvy]] (*cascade layers*):

```css
/* 1. pořadí vrstev, od nejslabší po nejsilnější */
@layer reset, base, components, utilities;

/* 2. pravidla do vrstev */
@layer reset {
  * { margin: 0; }
}

@layer utilities {
  .text-center { text-align: center; }
}
```

Pravidla vrstev:

- **Pozdější vrstva vyhraje nad dřívější bez ohledu na specificitu.** Selektor `#promo .title` ve vrstvě `base` prohraje s `.text-center` ve vrstvě `utilities`.
- Pořadí vrstev určuje **první zmínka** o vrstvě. Proto se píše řádek s pořadím hned na začátek stylů.
- Uvnitř jedné vrstvy platí specificita a pořadí jako dřív.
- Vrstvu můžeš otevřít víckrát, pravidla se do ní přidají. Existující soubor jde do vrstvy vložit i při importu: `@import url("reset.css") layer(reset);`.

Obě varianty níž mají stejná pravidla i stejné HTML. Liší se jen řádkem s pořadím vrstev nahoře:

:::compare
```html
<section id="promo" class="promo">
  <h2 class="promo__title text-accent">Letní výprodej stanů</h2>
</section>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
```
--variant-- @layer base, utilities
```css
@layer base, utilities;

@layer base {
  #promo .promo__title { color: #475569; }
}

@layer utilities {
  .text-accent { color: #c026d3; }
}
```
--variant-- @layer utilities, base
```css
@layer utilities, base;

@layer base {
  #promo .promo__title { color: #475569; }
}

@layer utilities {
  .text-accent { color: #c026d3; }
}
```
:::

Vlevo vyhraje fialová utilita se slabým selektorem, protože `utilities` je pozdější vrstva. Vpravo se pořadí otočilo a vyhraje šedá z `base` — tentokrát díky vrstvě, ne díky id. Zkus do společného CSS pod `body` dopsat `@layer utilities, base;`. Společný kód stojí před kódem variant, takže tvůj řádek bude první zmínka o vrstvách — a obě varianty zešednou.

> [!PITFALL] Pořadí vrstev napsané pozdě
> *Příznak:* napíšeš `@layer reset, base, utilities;`, ale vrstvy se chovají v jiném pořadí.
>
> *Oprava:* pořadí určuje první zmínka o vrstvě. Když už nějaký blok `@layer` stál před řádkem s pořadím (třeba v dřív připojeném souboru), řádek s pořadím ho nepřesune. Dej ho na úplný začátek stylů.

A teď styly, které v žádné vrstvě nejsou. Tipni si:

:::live predict
```html
<h2 class="card-title text-accent">Stan Husky Bright 3</h2>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.card-title {
  color: #334155;
}

@layer utilities {
  .text-accent {
    color: #c026d3;
  }
}
```
--question-- Jakou barvu bude mít nadpis?
--option-- Fialovou, protože vrstva `utilities` je v souboru později.
--option*-- Tmavě šedou, protože styl mimo vrstvu vyhraje nad všemi vrstvami.
--option-- Fialovou, protože utility vždycky vyhrávají nad komponentami.
--why-- Styly mimo jakoukoli vrstvu (*unlayered*) se chovají jako poslední, nejsilnější vrstva. Pořadí v souboru se nedostane ke slovu, protože vrstvy rozhodují dřív. Obal `.card-title` do `@layer components { … }` a přidej nahoru `@layer components, utilities;` — utilita vyhraje.
--see-- css-kaskada/kaskada#vrstvy-layer
:::

:::check
Styly začínají řádkem `@layer reset, base, components;`. Ve vrstvě `reset` je `a { color: inherit; }`, ve vrstvě `components` je `.link { color: navy; }`. Odkaz má třídu `link`. Jakou má barvu?

### --expected--
navy

### --why--
Obě deklarace jsou běžné (bez `!important`), takže vyhraje pozdější vrstva `components`. Specificitu tu nemusíš počítat.

### --see--
css-kaskada/kaskada#vrstvy-layer
:::

### `!important` obrací pořadí vrstev

U deklarací s `!important` jde žebříček vrstev **obráceně**: důležitá deklarace v dřívější vrstvě vyhraje nad důležitou deklarací v pozdější vrstvě a důležité deklarace ve vrstvách vyhrají nad důležitými mimo vrstvy. Důvod je praktický: reset nebo knihovna může označit něco, co se nesmí rozbít, a pozdější vrstvy to přebijí jen tehdy, když to reset dovolí.

:::live predict
```html
<a class="link" href="#">Zobrazit košík</a>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

@layer reset, components;

@layer reset {
  a {
    color: #64748b !important;
  }
}

@layer components {
  .link {
    color: #2563eb !important;
    font-weight: 700;
  }
}
```
--question-- Jakou barvu bude mít odkaz?
--option*-- Šedou z vrstvy `reset`.
--option-- Modrou z vrstvy `components`, protože je pozdější vrstva i silnější selektor.
--option-- Modrou, protože když mají `!important` obě, rozhodne specificita.
--why-- Obě deklarace jsou důležité, a u důležitých deklarací se pořadí vrstev obrací: vyhraje dřívější vrstva `reset`. Specificita se neporovná, protože vrstvy rozhodly dřív. Smaž `!important` ve vrstvě `reset` a odkaz zmodrá.
--see-- css-kaskada/kaskada#important-obraci-poradi-vrstev
:::

:::check
Utilita `.hidden { display: none !important; }` je ve vrstvě `utilities`, reset `img { display: block !important; }` ve vrstvě `reset`. Pořadí je `@layer reset, utilities;`. Skryje se obrázek s třídou `hidden`?

### --answer--
Ano, protože `utilities` je pozdější vrstva.

#### --why--
Pozdější vrstva vyhrává jen u běžných deklarací. Tady mají `!important` obě.

### --correct--
Ne, důležitá deklarace z dřívější vrstvy `reset` vyhraje.

#### --why--
U `!important` se pořadí vrstev obrací. Oprava je smazat `!important` v resetu — reset ve vrstvě ho nepotřebuje.

### --answer--
Ano, protože `.hidden` je třída a `img` jen typ prvku.

#### --why--
Specificita je v žebříčku až za vrstvami, tady se k ní nedojde.
:::

## Jak z války specificity ven

Kaskádu nemusíš porážet silou. Styly, které se dobře udržují, mají tři zvyky:

- **Selektory z jedné třídy.** `.card__title` místo `#content .cards div h3`. Všechna pravidla komponent mají podobnou specificitu a rozhoduje čitelné pořadí.
- **Vrstvy místo `!important`.** Reset do první vrstvy, utility do poslední. Utilita pak vyhraje díky vrstvě, ne díky vykřičníku.
- **Nulová specificita pro obecné styly.** Pseudotřída `:where()` vybere to, co je v závorce, ale do specificity nepřidá nic.

```css
/* obecný styl seznamů, který každá komponenta snadno přepíše */
:where(ul, ol) {
  padding-inline-start: 1.25rem;
}

/* odstavce v článku; id uvnitř :where() nepřidá nic */
:where(#article) p {
  line-height: 1.7;
}
```

Selektor `:where(ul, ol)` vybere seznamy stejně jako `ul, ol`, jen s nulovou specificitou, takže ho přebije i samotné `.menu`. Pozor na části **za** závorkou: v `:where(ul)[role="list"]` se atributový selektor počítá normálně. Selektorům `:where()`, `:is()` a `:has()` se podrobně věnuje lekce [Moderní selektory a nesting](see:css-kaskada/moderni-selektory).

:::check
Napiš specificitu selektoru `:where(#main, .content) p` ve tvaru `A,B,C`.

### --expected--
0,0,1

### --accept--
(0,0,1)
0-0-1
0 0 1

### --why--
Všechno uvnitř `:where()` má nulovou specificitu, i id. Zbývá typ `p` ve sloupci C.

### --see--
css-kaskada/kaskada#jak-z-valky-specificity-ven
:::

## Typické chyby a pasti

> [!PITFALL] Prodlužování selektoru proti vrstvě
> *Příznak:* utilita `.text-center` ve vrstvě `utilities` nefunguje, tak jí přidáš `body .text-center`, pak `#app .text-center` — a pořád nic.
>
> *Oprava:* soupeř vyhrál už na vrstvách, nejspíš je to styl mimo vrstvu. Specificita se k porovnání nedostane. Přesuň soupeře do vrstvy (třeba `components`).

> [!PITFALL] Pořadí tříd v atributu `class`
> *Příznak:* prohodíš `class="price price--sale"` na `class="price--sale price"` a čekáš jinou barvu. Nic se nezmění.
>
> *Oprava:* rozhoduje pořadí pravidel v CSS. Modifikátor dej pod základní pravidlo.

> [!PITFALL] Jedenáct tříd na jedno id
> *Příznak:* kaskáda tříd `.a .b .c .d .e .f` nepřebije šablonu s `#sidebar a`.
>
> *Oprava:* sloupce specificity se nepřelévají, id vyhraje vždy. Sniž specificitu soupeře (id nahraď třídou nebo ho obal do `:where()`), nebo ho dej do dřívější vrstvy.

> [!PITFALL] Prohraje deklarace, ne pravidlo
> *Příznak:* „moje pravidlo nefunguje", přitom z něj polovina vlastností platí.
>
> *Oprava:* v DevTools hledej přeškrtnuté **deklarace**. Soutěž probíhá pro každou vlastnost zvlášť, takže u jednoho pravidla může `font-weight` vyhrát a `color` prohrát.

:::check
Pravidlo `.badge { color: white; background: #16a34a; padding: 2px 8px; }` je ve stejné vrstvě jako pravidlo `#card span { color: black; }`, které je výš. Štítek `<span class="badge">` leží v `<div id="card">`. Které deklarace z `.badge` se na štítku projeví?

### --answer--
Žádná, pravidlo `.badge` prohrálo se silnějším selektorem.

#### --why--
Prohrát může jen deklarace, na kterou má soupeř vlastní deklaraci. `#card span` nastavuje jen barvu textu.

### --correct--
Pozadí a padding, barva textu ne.

#### --why--
Soutěží se o každou vlastnost zvlášť. O `color` rozhodne specificita (1, 0, 1) proti (0, 1, 0), o `background` a `padding` nikdo nesoupeří.

### --answer--
Všechny tři, protože `.badge` je v souboru níž.

#### --why--
Pořadí ve zdroji by rozhodlo jen mezi stejně silnými selektory. U barvy textu je soupeř silnější.
:::

:::explain
Vysvětli vlastními slovy, proč utilita ve vrstvě `utilities` prohraje s pravidlem, které není v žádné vrstvě, i když má utilita silnější selektor a je v souboru níž.

## --model--
Kaskáda porovnává deklarace podle pevného žebříčku: původ a důležitost, inline styl, vrstvy, specificita a pořadí. Rozhodne první kritérium, ve kterém se deklarace liší. Styl mimo vrstvy se chová jako nejsilnější vrstva, takže vyhraje už na kritériu vrstev a na specificitu ani pořadí se nedojde. Pomůže dát soupeře do dřívější vrstvy.

## --checklist--
- Kaskáda prochází kritéria v pevném pořadí a rozhodne první, ve kterém se deklarace liší.
- Vrstvy rozhodují dřív než specificita a pořadí ve zdroji.
- Styl mimo vrstvy vyhraje nad běžnými deklaracemi ve všech vrstvách.
- Oprava je přesunout soupeře do vrstvy, ne zesilovat selektor.
:::

## Kde to najdeš v MDN

- [Introduction to the CSS cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade) — celý žebříček kaskády včetně původů, které jsme vynechali (uživatelské styly, animace a přechody).
- [Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity) — výpočet (A, B, C) s mnoha příklady a výjimky pro `:is()`, `:not()` a `:where()`.
- [Cascade layers](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers) — vrstvy krok za krokem, vnořené vrstvy a import do vrstvy.
- [!important](https://developer.mozilla.org/en-US/docs/Web/CSS/important) — jak důležitost mění pořadí vrstev a proč se jí vyhýbat.

# --questions--

## --question--

Knihovna komponent je připojená jako `<link href="ui-kit.css">` a hned za ní `<link href="brand.css">` s vašimi barvami. V `ui-kit.css` je `.btn.btn-primary { background: #2563eb; }`, v `brand.css` je `.btn-primary { background: #0f766e; }`. Jaké pozadí bude mít `<button class="btn btn-primary">`?

### --answer--

`#0f766e`, protože `brand.css` je připojený později.

#### --why--
Pořadí ve zdroji rozhoduje až na posledním místě žebříčku. Nejdřív se porovná, jak silné jsou selektory.

### --correct--

`#2563eb`, protože `.btn.btn-primary` má dvě třídy.

#### --why--
`.btn.btn-primary` má (0, 2, 0), `.btn-primary` jen (0, 1, 0). Specificita rozhodne dřív než pořadí souborů. Čisté řešení: obě pravidla do vrstev (`@layer ui-kit, brand;`), ne zdvojená třída na vaší straně.

### --answer--

Záleží na tom, v jakém pořadí jsou třídy v atributu `class`.

#### --why--
Pořadí tříd v HTML kaskáda neřeší vůbec. Porovnávají se deklarace z CSS.

### --see--

css-kaskada/kaskada#specificita-trojice-a-b-c

## --question--

Styly začínají `@layer base, components;`. Ve vrstvě `base` je `#checkout h2 { color: #111827; }`, ve vrstvě `components` je `.section-title { color: #0369a1; }`. Nadpis `<h2 class="section-title">` leží v `<form id="checkout">`. Napiš barvu, kterou bude mít (tak, jak je v CSS).

### --expected--

#0369a1

### --why--

Obě deklarace jsou běžné a liší se ve vrstvě. Pozdější vrstva `components` vyhraje, i když má selektor bez id. Na specificitu se nedojde.

### --see--

css-kaskada/kaskada#vrstvy-layer

## --question--

Napiš specificitu selektoru `#filters input[type="checkbox"]:checked + label` ve tvaru `A,B,C`.

### --expected--

1,2,2

### --accept--

(1,2,2)
1-2-2
1 2 2

### --why--

Id `#filters` dává A = 1. Atributový selektor `[type="checkbox"]` a pseudotřída `:checked` dávají B = 2. Typy `input` a `label` dávají C = 2. Kombinátory mezera a `+` nepřidávají nic.

### --see--

css-kaskada/kaskada#specificita-trojice-a-b-c

## --question--

Kolega dal do stylů `p { color: #334155 !important; }`, aby všechny odstavce měly jednotnou barvu. Co se stane s odstavcem `<p class="error" style="color: #b91c1c">`, když ve stylopisu není jiné pravidlo pro jeho barvu? Napiš barvu.

### --expected--

#334155

### --why--

Důležitost je první kritérium žebříčku, inline styl až druhé. `!important` ze stylopisu proto přebije i atribut `style`. Proto se `!important` na obecné selektory nedává — přestane fungovat i to, co mělo být výjimkou.

### --see--

css-kaskada/kaskada#inline-styl-a-important
