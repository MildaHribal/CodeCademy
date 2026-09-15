# Stacking context a `z-index`

Rozbalovací nabídka u karty produktu, která zajede pod vedlejší kartu. Modální okno, přes které prosvítá přilepená hlavička. Tooltip schovaný pod mapou. Každý frontendista to jednou řeší zvyšováním `z-index` na 999, 9999, 99999 — a nepomůže to. Tahle lekce vysvětlí proč. Nejdřív dva odhady.

:::check pretest
Karta při najetí myší povyskočí o 4 px nahoru (`translate: 0 -4px`). V kartě je rozbalená nabídka s `position: absolute; z-index: 9999`, která přečnívá přes kartu pod ní. Karta pod ní má `position: relative` a žádný `z-index`. Co bude navrchu, když na horní kartu najedeš myší?

### --answer--
Nabídka, protože 9999 je víc než cokoli jiného na stránce.

#### --why--
Tak se to čte, když `z-index` bereš jako jedno globální pořadí. Proč to neplatí, ukáže první část.

### --correct--
Spodní karta, nabídka pod ni zajede.

#### --why--
Posun přes `translate` z horní karty udělá uzavřenou skupinu vrstev a 9999 platí jen uvnitř ní. Vysvětlení je v části o tom, co zakládá stacking context.

### --answer--
Nabídka a spodní karta se prolnou, protože mají stejnou vrstvu.

#### --why--
Prvky se v CSS neprolínají, jeden je vždycky nad druhým. Otázka je jen, podle čeho se to rozhodne.
:::

:::check pretest
Obyčejný `<div>` bez `position` v normálním toku dostane `z-index: 5`. Změní se tím, co je nad ním a pod ním?

### --answer--
Ano, dostane se nad všechny prvky bez `z-index`.

#### --why--
`z-index` nepůsobí na každý prvek. Na který ano, se dozvíš v části o pořadí vykreslení.

### --correct--
Ne, `z-index` se na něj nevztahuje.

#### --why--
`z-index` platí pro pozicované prvky a pro položky flexboxu a gridu. Blok v normálním toku ho ignoruje.
:::

## Problém: nabídka pod sousední kartou

Tady jsou dvě karty úkolů pod sebou. Horní má otevřenou nabídku s `z-index: 9999`, která přečnívá přes spodní kartu. Přepínač nastaví horní kartě posun, jaký dostane při najetí myší:

:::live
```html
<article class="task">
  <h3>Připravit podklady pro tiskárnu</h3>
  <ul class="menu">
    <li>Upravit</li>
    <li>Přesunout</li>
    <li>Smazat</li>
  </ul>
</article>
<article class="task">
  <h3>Objednat vzorky papíru</h3>
</article>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; background: #eef2f7; }

.task {
  position: relative;
  width: 18rem;
  height: 5rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: white;
  box-shadow: 0 6px 16px -8px rgb(15 23 42 / 0.4);
}

.task:first-child { translate: var(--lift); }

.task h3 { margin: 0; font-size: 1rem; }

.menu {
  position: absolute;
  top: 2.75rem;
  right: 0.75rem;
  z-index: 9999;
  margin: 0;
  padding: 0.375rem;
  list-style: none;
  border-radius: 0.5rem;
  background: #1e293b;
  color: white;
}

.menu li { padding: 0.25rem 0.75rem; }
```
```controls
--lift: select(none, "0 -4px") = none | translate horní karty
```
:::

S `none` je nabídka navrchu. Přepni na `0 -4px`: karta se posune o 4 px, a nabídka najednou zmizí pod spodní kartou — `z-index: 9999` přitom zůstal. Zkus nabídce dát `z-index: 999999`. Nic.

> [!REMEMBER]
> **`z-index` porovnává jen prvky uvnitř stejného stacking contextu. Celý kontext se pak vykreslí jako jedna vrstva na místě svého kořene.** Nabídka s 9999 je nejvýš jen v rámci své karty; kartu samotnou se spodní kartou porovnává až kontext o úroveň výš.

:::check
Po přepnutí posunu zajela nabídka pod spodní kartu. Vlastnost `z-index` nabídky se přitom nezměnila. Co se změnilo?

### --answer--
Nabídka dostala nižší `z-index`, protože `translate` ho resetuje.

#### --why--
`translate` na hodnotu `z-index` nesahá, v DevTools je pořád 9999. Změnilo se, s čím se to číslo porovnává.

### --correct--
Horní karta se stala uzavřenou skupinou vrstev a 9999 teď platí jen uvnitř ní.

#### --why--
`translate` z karty udělá stacking context. Nabídka se porovnává jen s ostatními prvky v kartě a karta jako celek se spodní kartou — a ta je v HTML později.

### --answer--
Spodní karta dostala automaticky vyšší `z-index`.

#### --why--
Spodní karta žádný `z-index` nemá a nikdo jí ho nedal. Rozhodlo pořadí v HTML, jakmile se nabídka zavřela do karty.
:::

## Pořadí vykreslení

Než přijde stacking context, musíš vědět, v jakém pořadí prohlížeč kreslí prvky, **když nikdo nemá `z-index`**. Uvnitř jednoho kontextu maluje odspodu nahoru:

1. pozadí a rámeček prvku, který kontext založil,
2. potomky se **záporným** `z-index`,
3. bloky v normálním toku (jejich pozadí, pak text),
4. pozicované potomky se `z-index: auto` nebo `0`, v pořadí HTML,
5. potomky s **kladným** `z-index`, od nejnižšího čísla.

Proto je pozicovaný prvek nad obyčejným blokem a z pozicovaných vyhrává ten později v HTML. `z-index` funguje jen na prvky, které se v tomhle seznamu dají přesunout: [[pozicovaný prvek|pozicované prvky]] a [[flex položka|položky flexboxu]] a gridu. Obyčejný blok v toku ho ignoruje.

:::live predict
```html
<div class="sticker">Nálepka</div>
<p class="note">Poznámka v normálním toku, která na nálepku najede zespodu.</p>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; }

.sticker {
  position: relative;
  z-index: -1;
  width: 12rem;
  padding: 1.5rem 1rem;
  border-radius: 0.5rem;
  background: #fb7185;
  color: white;
  font-weight: 700;
}

.note {
  width: 14rem;
  margin: -2rem 0 0 3rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: #fde68a;
}
```
--question-- Nálepka je pozicovaná a poznámka ne. Co bude navrchu v místě, kde se překrývají?
--option-- Nálepka, protože pozicované prvky jsou vždycky nad prvky v toku.
--option*-- Poznámka, protože záporný `z-index` se kreslí ještě před bloky v toku.
--option-- Nálepka, protože je v HTML dřív a má přednost.
--why-- Pozicovaný prvek je nad bloky v toku jen se `z-index: auto` nebo kladným. Záporný `z-index` ho posune do druhého kroku pořadí vykreslení, ještě před bloky v normálním toku. Smaž řádek `z-index: -1` a nálepka se vrátí navrch.
--see-- css-pozicovani/stacking-context#poradi-vykresleni
:::

:::check
Tři prvky se překrývají: blok `.a` v normálním toku, `.b` s `position: relative` bez `z-index` a `.c` s `position: absolute; z-index: 0`. V HTML jsou v pořadí `.c`, `.b`, `.a`. Který je navrchu? Napiš jeho písmeno.

### --expected-- ignore-case
b

### --accept--
.b

### --why--
Blok v toku `.a` je pod všemi pozicovanými, i když je v HTML poslední. `.b` (`auto`) i `.c` (`0`) jsou ve stejném kroku pořadí vykreslení, takže rozhoduje HTML, a tam je `.b` později.
:::

## Co zakládá stacking context

[[stacking context|Stacking context]] je skupina prvků, kterou prohlížeč vykreslí jako celek. Uvnitř se řídí pořadím vykreslení z předchozí části, a navenek se celá skupina chová jako jediná vrstva prvku, který ji založil. Čísla `z-index` uvnitř se s čísly venku nikdy nepotkají.

Kontext založí:

| co | poznámka |
|---|---|
| kořen stránky `html` | kontext, ve kterém je všechno ostatní |
| `position: relative` nebo `absolute` se `z-index` jiným než `auto` | i `z-index: 0` |
| `position: fixed` a `sticky` | vždycky, i bez `z-index` |
| položka flexboxu nebo gridu se `z-index` jiným než `auto` | bez `position` |
| `opacity` menší než 1 | i `0.99` |
| `transform`, `translate`, `rotate`, `scale` jiné než `none` | i `rotate: 0deg` |
| `filter`, `backdrop-filter`, `clip-path`, `mask` jiné než `none` | |
| `mix-blend-mode` jiné než `normal` | |
| `isolation: isolate` | nic jiného nedělá, jen založí kontext |
| `will-change` s některou z vlastností výše | i když vlastnost sama nastavená není |
| `contain: layout` nebo `paint` | |

Seznam si nemusíš pamatovat celý. Stačí vědět, že **vizuální efekty (průhlednost, posun, filtry) a `z-index` na pozicovaném prvku zakládají kontext**. Obě varianty níž se liší jedinou deklarací na horní kartě:

:::compare
```html
<article class="task">
  <h3>Připravit podklady</h3>
  <p class="menu">Upravit · Přesunout · Smazat</p>
</article>
<article class="task">
  <h3>Objednat vzorky</h3>
</article>
```
```css
body { margin: 1rem; font-family: system-ui, sans-serif; background: #eef2f7; }

.task { position: relative; height: 4.5rem; margin-bottom: 0.75rem; padding: 0.75rem; border-radius: 0.75rem; background: white; }
.task h3 { margin: 0; font-size: 1rem; }

.menu {
  position: absolute;
  top: 2.5rem;
  left: 2rem;
  z-index: 10;
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: #1e293b;
  color: white;
}
```
--variant-- Hotový úkol bez průhlednosti
```css
.task:first-child { color: #64748b; }
```
--variant-- Hotový úkol s opacity: 0.6
```css
.task:first-child { opacity: 0.6; }
```
:::

S šedým textem je nabídka nad spodní kartou. S `opacity: 0.6` je horní karta stacking context a nabídka i s kartou zajede pod spodní kartu. Průhledností navíc prosvítá i nabídka sama.

:::check
Které z těchhle pravidel založí na kartě stacking context?

### --answer--
`.card { position: relative; }`

#### --why--
Pozicovaný prvek se `z-index: auto` kontext nezakládá, jen se kreslí v kroku pozicovaných prvků. Potřeboval by i `z-index`.

### --answer--
`.card { filter: none; }`

#### --why--
`filter` zakládá kontext, jen když nějaký filtr opravdu je. `none` je výchozí hodnota a nedělá nic.

### --correct--
`.card { opacity: 0.95; }`

#### --why--
Jakákoli průhlednost menší než 1 z karty udělá stacking context, i když je okem skoro nepostřehnutelná.

### --answer--
`.card { z-index: 5; }` na kartě bez `position`, která není položkou flexboxu ani gridu.

#### --why--
`z-index` na obyčejném bloku nemá vliv, takže ani kontext nezaloží.
:::

## Proč se prvek nedostane nad sourozence rodiče

Představ si stacking contexty jako kapitoly knihy a `z-index` jako číslo stránky uvnitř kapitoly. Stránka 900 v kapitole 1 je pořád před stránkou 1 v kapitole 2. Pořadí kapitol se rozhodne úplně bez ohledu na čísla stránek v nich.

:::live predict
```html
<header class="topbar">
  Přilepená hlavička
  <div class="tooltip">Tooltip hlavičky</div>
</header>
<div class="modal">Modální okno</div>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }

.topbar {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 3rem;
  padding: 0.75rem 1rem;
  background: #0f172a;
  color: white;
}

.tooltip {
  position: absolute;
  top: 2.5rem;
  left: 1rem;
  z-index: 1000;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  background: #f59e0b;
  color: #111827;
}

.modal {
  position: relative;
  z-index: 2;
  margin: 0 3rem;
  padding: 2rem;
  border-radius: 0.75rem;
  background: #6366f1;
  color: white;
}
```
--question-- Tooltip má `z-index: 1000`, modální okno `2`. Co bude navrchu tam, kde se překrývají?
--option-- Tooltip, protože 1000 je víc než 2.
--option*-- Modální okno, protože se porovnává s hlavičkou (1), ne s tooltipem.
--option-- Tooltip, protože je v HTML uvnitř hlavičky, a ta je první.
--why-- Hlavička je `sticky` se `z-index: 1`, tedy stacking context. Tooltip je uvnitř, jeho 1000 platí jen v hlavičce. V kontextu stránky se porovnává hlavička (1) s oknem (2) a okno vyhraje — i s tooltipem, který je součástí hlavičky. Změň `z-index` hlavičky na 3 a tooltip se dostane nad okno.
--see-- css-pozicovani/stacking-context#proc-se-prvek-nedostane-nad-sourozence-rodice
:::

Z toho plyne pravidlo pro opravu: **když prvek nejde dostat nahoru, hledej nejbližšího předka, který zakládá stacking context**. Buď zvedni `z-index` toho předka, nebo mu kontext odeber (smaž `opacity`, `translate`, zbytečný `z-index`), nebo přesuň prvek v HTML mimo něj.

:::live predict
```html
<section class="panel panel--a">
  Panel A
  <div class="badge">Odznak</div>
</section>
<section class="panel panel--b">Panel B</section>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; }

.panel {
  position: relative;
  width: 16rem;
  height: 5rem;
  padding: 1rem;
  border-radius: 0.75rem;
  color: white;
}

.panel--a { z-index: 3; background: #0f766e; }
.panel--b { z-index: 2; margin-top: -1rem; background: #7c3aed; }

.badge {
  position: absolute;
  bottom: -2rem;
  right: 1rem;
  z-index: 1;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: #facc15;
  color: #111827;
}
```
--question-- Odznak má `z-index: 1`, panel B `2`. Odznak přečnívá přes panel B. Co bude navrchu?
--option-- Panel B, protože 2 je víc než 1.
--option*-- Odznak, protože se porovnává panel A (3) s panelem B (2).
--option-- Panel B, protože je v HTML později.
--why-- Tentokrát to dopadne opačně: panel A je kontext se `z-index: 3`, panel B má `2`, takže panel A je i se vším uvnitř nad panelem B. Číslo 1 u odznaku se s panelem B nikdy neporovná. Zkus panelu A dát `z-index: 1`.
--see-- css-pozicovani/stacking-context#proc-se-prvek-nedostane-nad-sourozence-rodice
:::

:::explain
Vysvětli vlastními slovy, proč tooltip se `z-index: 1000` uvnitř hlavičky se `z-index: 1` skončil pod modálním oknem se `z-index: 2`, a jak to opravíš.

## --model--
Hlavička je přilepená a má `z-index`, takže zakládá stacking context. `z-index` tooltipu se porovnává jen s prvky uvnitř hlavičky. Na úrovni stránky se porovnává hlavička jako celek s modálním oknem, 1 proti 2, a okno vyhraje i nad tooltipem. Oprava je zvednout `z-index` hlavičky nad okno, nebo tooltip přesunout v HTML mimo hlavičku.

## --checklist--
- `z-index` se porovnává jen uvnitř stejného stacking contextu.
- Hlavička se `sticky` a `z-index` zakládá vlastní kontext.
- Na úrovni stránky se porovnává hlavička jako celek, ne tooltip.
- Opravit to jde na předkovi, který kontext zakládá, nebo přesunem prvku mimo něj.
:::

:::check
Karta A má `position: relative; z-index: 3` a uvnitř tooltip se `z-index: 1000`. Karta B má `position: relative; z-index: 4` a tooltip ji má překrýt. Napiš nejmenší `z-index`, který musíš dát kartě A, aby byl tooltip nad kartou B (celé číslo).

### --expected--
5

### --why--
Tooltip se s kartou B nikdy neporovná, porovnává se karta A s kartou B. Karta A potřebuje víc než 4, tedy 5. Hodnota u tooltipu na výsledku nic nezmění.
:::

## `isolation: isolate`: kontext naschvál

Někdy stacking context **chceš**. Typický případ je dekorace za obsahem komponenty: barevná skvrna za nadpisem karty s `z-index: -1`, aby byla pod textem. Bez kontextu na kartě ale záporná vrstva propadne až do kontextu stránky — pod pozadí karty — a zmizí.

`isolation: isolate` založí stacking context a nic jiného nedělá: neposouvá, nemění průhlednost, nepotřebuje `position` ani `z-index`.

:::live predict
```html
<article class="promo">
  <h3>Letní výprodej</h3>
  <p>Stany a spacáky až o 40 % levněji.</p>
</article>
```
```css
body { margin: 1.5rem; font-family: system-ui, sans-serif; background: #e2e8f0; }

.promo {
  position: relative;
  width: 18rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: white;
}

.promo::before {
  content: "";
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: -1;
  width: 9rem;
  height: 4rem;
  border-radius: 50%;
  background: #fda4af;
}

.promo h3 { margin: 0 0 0.25rem; }
.promo p { margin: 0; }
```
--question-- Kde bude růžová skvrna `::before`?
--option-- Za nadpisem, vidět v bílé kartě.
--option*-- Nebude vidět vůbec, schová se pod bílé pozadí karty.
--option-- Nad nadpisem, protože pseudoprvek je pozicovaný.
--why-- Karta je `relative` bez `z-index`, takže kontext nezakládá. Skvrna se `z-index: -1` se proto kreslí v kontextu stránky ve druhém kroku, ještě před pozadím karty, a karta ji zakryje. Přidej do `.promo` deklaraci `isolation: isolate` — karta dostane vlastní kontext a skvrna se nakreslí hned po jejím pozadí, ale pod textem.
--see-- css-pozicovani/stacking-context#isolation-isolate-kontext-naschval
:::

Druhé použití: komponenta, která uvnitř používá `z-index` (nabídky, odznaky, překryvné vrstvy), dostane `isolation: isolate`, aby její vnitřní čísla nesoutěžila s hlavičkou nebo modálním oknem stránky. Vrstvy uvnitř komponenty pak řešíš jen v komponentě.

:::check
Dekorativní pseudoprvek karty má `z-index: -1` a schoval se pod pozadí karty. Napiš deklaraci pro kartu, která ho vrátí nad pozadí karty, aniž by kartu posunula nebo změnila její průhlednost.

### --expected--
isolation: isolate

### --accept--
z-index: 0

### --why--
Karta potřebuje vlastní stacking context. `isolation: isolate` ho založí bez vedlejších efektů. `z-index: 0` na pozicované kartě funguje taky, jen je z něj méně jasné, proč tam je.
:::

## Škála `z-index` v tokenech

Když každý vývojář přidá „o trochu větší číslo", skončí projekt u `z-index: 2147483647`. Lepší je mít **pár pojmenovaných vrstev** v custom properties a nepsat čísla ručně:

```css
:root {
  --z-raised: 1;     /* karta nad sousedkami, odznak */
  --z-dropdown: 100; /* rozbalovací nabídky */
  --z-sticky: 200;   /* přilepená hlavička a lišty */
  --z-overlay: 300;  /* ztmavení stránky */
  --z-modal: 400;    /* modální okno */
  --z-toast: 500;    /* oznámení nad vším */
}

.site-header { position: sticky; top: 0; z-index: var(--z-sticky); }
```

Rozestupy po stovkách nechávají místo pro vrstvu mezi, kdyby přibyla. Škála ale funguje jen mezi prvky ve **stejném** kontextu — nabídku uvnitř karty s `opacity` žádné číslo ze škály nezachrání.

:::check
Máš škálu z ukázky výš. Přidáváš oznámení „Uloženo", které má být vidět i nad otevřeným modálním oknem, a kontext stránky je jediný. Napiš hodnotu `z-index` pro oznámení.

### --expected--
var(--z-toast)

### --accept--
500

### --why--
Oznámení patří na nejvyšší vrstvu škály. Custom property `var(--z-toast)` je lepší než holé číslo: když se škála změní, oznámení se změní s ní.
:::

> [!TIP]
> Když `z-index` nefunguje, projdi v DevTools v panelu Elements předky prvku odspodu nahoru a u každého se v Computed podívej na `opacity`, `transform`, `translate`, `filter`, `will-change`, `position` a `z-index`. První předek, který kontext zakládá, je strop, přes který se prvek nedostane.

## Typické chyby a pasti

> [!PITFALL] `z-index: 9999` nepomáhá
> *Příznak:* nabídka, tooltip nebo odznak zůstává pod sousedním prvkem, ať mu dáš jakékoli číslo.
>
> *Oprava:* číslo platí jen uvnitř stacking contextu. Najdi předka, který kontext zakládá, a zvedni `z-index` jemu, odeber mu kontext, nebo prvek přesuň v HTML mimo něj.

> [!PITFALL] Nabídka zajede pod kartu jen při najetí myší
> *Příznak:* bez myši je všechno v pořádku, při najetí na kartu se nabídka schová pod sousední kartu.
>
> *Oprava:* hover efekt přidal kartě `translate`, `scale` nebo `opacity` a tím i stacking context. Dej kartě při najetí i `z-index` (`.card:hover { z-index: var(--z-raised); }`), nebo efekt dej jen na vnitřní obal karty, ve kterém nabídka není.

> [!PITFALL] `z-index` na neutrálním bloku nic nedělá
> *Příznak:* `z-index: 10` na obyčejném `<div>` nemá žádný vliv. DevTools u deklarace ukáže, že je neaktivní, protože prvek není pozicovaný.
>
> *Oprava:* prvek potřebuje `position` jinou než `static`, nebo musí být položkou flexboxu či gridu.

> [!PITFALL] Dekorace se `z-index: -1` zmizela
> *Příznak:* pseudoprvek za obsahem karty není vidět, v DevTools má správné rozměry.
>
> *Oprava:* záporná vrstva propadla pod pozadí rodiče. Rodič potřebuje vlastní kontext: `isolation: isolate`.

:::check
Karty mají `.card:hover { scale: 1.02; }`. Rozbalená nabídka uvnitř karty zajíždí při najetí myší pod kartu vpravo. Která oprava zachová zvětšení a nabídku dostane navrch?

### --answer--
Dát nabídce `z-index: 99999`.

#### --why--
Myslíš si, že vyšší číslo přeskočí hranici kontextu? `scale` z karty dělá stacking context a číslo nabídky platí jen uvnitř.

### --correct--
Dát kartě při najetí `z-index` vyšší než sousední karty.

#### --why--
Karta je kontext, takže se porovnává karta se sousedkou. Když karta při najetí dostane vyšší `z-index` (a je pozicovaná nebo je položkou gridu), je nad sousedkou i s nabídkou.

### --answer--
Dát sousedním kartám `isolation: isolate`.

#### --why--
Kontext na sousedkách nezmění pořadí mezi kartami, jen uzavře jejich vlastní obsah. Hovered karta i sousedka mají pořád stejnou vrstvu a rozhoduje pořadí v HTML.
:::

> [!NOTE]
> Existuje vrstva, na kterou žádný `z-index` nedosáhne a která všechny tyhle problémy obchází: *top layer*. Do ní patří otevřené modální okno `<dialog>` a prvky s atributem `popover`. Dostaneš se k ní v lekci o top layer a ukotvení.

Příště postavíš nástěnku úkolů s rozbalovacími nabídkami, přesahujícími odznaky a oznámením nad vším — a všechny vrstvy srovnáš do škály v tokenech.

## Kde to najdeš v MDN

- [Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context) — definice a úplný seznam vlastností, které kontext zakládají.
- [z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/z-index) — hodnoty, na které prvky působí, a rozdíl mezi `auto` a `0`.
- [Stacking without the z-index property](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_without_z-index) — pořadí vykreslení bez `z-index` s ukázkou.
- [isolation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/isolation) — vlastnost, která jen založí kontext.

# --questions--

## --question--

Hlavička má `position: sticky; top: 0;` a **žádný** `z-index`. Uvnitř je nabídka účtu se `z-index: 50`. Pod hlavičkou je obsah s kartami, které mají `position: relative` a žádný `z-index`. Nabídka přečnívá dolů přes první kartu. Co bude navrchu?

### --answer--

Nabídka, protože 50 je víc než `auto` u karty.

#### --why--
Myslíš si, že hlavička bez `z-index` kontext nezakládá? U `sticky` a `fixed` ho zakládá vždycky.

### --correct--

Karta, protože hlavička je stacking context se `z-index: auto` a karta je v HTML později.

#### --why--
`sticky` založí kontext i bez `z-index`. Na úrovni stránky se pak porovnává hlavička (`auto`) s kartou (`auto`), obě ve stejném kroku pořadí vykreslení, a rozhoduje HTML. Pomůže `z-index` na hlavičce.

### --answer--

Nabídka, protože hlavička je v HTML dřív a má přednost.

#### --why--
Pořadí v HTML rozhoduje opačně: později v HTML znamená výš.

### --see--

css-pozicovani/stacking-context#co-zaklada-stacking-context

## --question--

Karta má `position: relative`. Rozhodneš se jí přidat `z-index: 0`, protože „nula nic nezmění". Změní se tím něco pro prvky uvnitř karty?

### --answer--

Ne, `z-index: 0` a `z-index: auto` jsou totéž.

#### --why--
Ve stejném kroku pořadí vykreslení opravdu jsou. Jenže hodnota jiná než `auto` na pozicovaném prvku navíc založí kontext.

### --correct--

Ano, karta se stane stacking contextem a `z-index` prvků uvnitř se už nebudou porovnávat s prvky mimo kartu.

#### --why--
Karta sama zůstane ve stejné vrstvě, ale uzavře vše uvnitř. Nabídka se `z-index: 10` v kartě pak nepřekryje pozicovanou sousedku, která je v HTML později.

### --see--

css-pozicovani/stacking-context#co-zaklada-stacking-context

## --question--

Obal stránky `.app` má `opacity: 0.999` (zbyl po animaci načtení). Uvnitř `.app` je modální okno se `z-index: 400`. Mimo `.app`, později v HTML, je lišta s cookies s `position: fixed; z-index: 1`. Co bude navrchu, když se okno a lišta překryjí? Napiš „okno", nebo „lišta".

### --expected-- ignore-case

lišta

### --why--

`opacity` menší než 1 dělá z `.app` stacking context se `z-index: auto`. Na úrovni stránky se porovnává `.app` (0) s lištou (1), takže lišta vyhraje i nad oknem se 400.

### --see--

css-pozicovani/stacking-context#proc-se-prvek-nedostane-nad-sourozence-rodice

## --question--

Přilepená hlavička má `z-index: 200`. Nabídka účtu **uvnitř** hlavičky má `position: absolute; z-index: 100` a leží přes tmavé pozadí hlavičky. Co uvidíš v místě, kde se překrývají? Napiš „nabídka", nebo „pozadí".

### --expected-- ignore-case

nabídka

### --accept--
nabidka

### --why--

Nižší číslo neznamená „pod rodičem". Hlavička je stacking context a jeho vlastní pozadí se kreslí úplně první, všechno uvnitř (i nabídka se 100) je nad ním. Číslo 100 se porovnává jen s ostatními prvky v hlavičce.

### --see--

css-pozicovani/stacking-context#poradi-vykresleni
