# Strom DOM

:::check pretest
Co uvidí uživatel na stránce po tomhle řádku? Tipni si.

```js
document.querySelector('.badge').textContent = '<strong>Akce</strong>';
```

### --answer--

Tučné slovo **Akce**.

#### --why--

Tak by to dopadlo, kdyby prohlížeč text četl jako HTML. Jestli to dělá, ukáže část o `textContent` a `innerHTML`.

### --correct--

Doslova text `<strong>Akce</strong>` i se špičatými závorkami.

#### --why--

`textContent` bere řetězec jako obyčejný text, značky nic neznamenají. Proč je to důležité pro bezpečnost, uvidíš v části o `textContent`.

### --answer--

Nic, prohlížeč řádek s HTML značkami zahodí.

#### --why--

Prohlížeč nic nezahazuje. Co s textem udělá, vysvětlí část o `textContent` a `innerHTML`.
:::

:::check pretest
Skript je v `<head>` bez `defer` a hned na prvním řádku hledá tlačítko, které je v HTML až v `<body>`. Co vrátí `document.querySelector('#buy')`?

### --answer--

To tlačítko — prohlížeč má celé HTML stažené, tak ho najde.

#### --why--

Stažené ano, ale postavené ještě ne. Kdy přesně skript běží, vysvětlí část o spouštění skriptu.

### --correct--

`null`.

#### --why--

Skript běží ve chvíli, kdy ho prohlížeč při čtení HTML potká. Tlačítko pod ním ještě neexistuje. Víc v části o spouštění skriptu.

### --answer--

Vyhodí `ReferenceError`.

#### --why--

`querySelector` nikdy nevyhodí chybu jen proto, že nic nenašel. Co vrátí, uvidíš v části o hledání prvků.
:::

Tlačítko „Do košíku", které přičte kus a přepíše počet v hlavičce. Srdíčko, které po kliknutí zčervená. Seznam úkolů, do kterého přibude řádek. Soubor `index.html` se přitom nemění — mění se to, co prohlížeč z HTML postavil v paměti. Tomu se říká [[DOM]] (*Document Object Model*) a JavaScript s webem mluví jen přes něj.

> [!REMEMBER]
> **Prohlížeč z HTML postaví strom objektů a JavaScript mění tenhle strom, ne HTML soubor.**
> Co je ve stromu, to je na obrazovce. Když uzel změníš, obrazovka se překreslí sama.

## Stránka je strom uzlů

Prohlížeč přečte HTML a pro každou značku vytvoří objekt — [[element]]. Elementy jsou do sebe vnořené stejně jako značky: `<ul>` je rodič, `<li>` uvnitř jsou jeho potomci. Celému stromu vládne objekt `document`, jeho kmen je `document.documentElement` (značka `<html>`) a nejčastěji začínáš u `document.body`.

Kromě elementů jsou ve stromu i textové uzly: text uvnitř značek a **také mezery a konce řádků mezi značkami**. Elementy i textové uzly se dohromady jmenují [[uzel|uzly]] (*nodes*).

:::live
```html
<ul class="list">
  <li>Chleba</li>
  <li>Mléko</li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
```
```js
const list = document.querySelector('.list');

console.log('children:', list.children.length);
console.log('childNodes:', list.childNodes.length);
console.log('první potomek:', list.firstElementChild.textContent);
```
:::

`children` počítá jen elementy, `childNodes` i textové uzly s mezerami a konci řádků. Zkus v HTML napsat obě `<li>` na jeden řádek bez mezer a sleduj, jak se změní druhé číslo. V praxi skoro vždy chceš `children`, `firstElementChild` a `parentElement` — varianty bez „Element" v názvu ti vrátí i textové uzly.

> [!TIP]
> Panel **Elements** v DevTools neukazuje soubor `index.html`, ale živý DOM. Když JavaScript přidá prvek, uvidíš ho tam hned. Otevři si náhled v nové kartě a zkus to.

:::check
Kolik položek vrátí `nav.children.length` pro tohle HTML?

```html
<nav>
  <a href="/">Domů</a>
  <a href="/kontakt">Kontakt</a>
</nav>
```

### --expected--

2

### --why--

`children` obsahuje jen elementy, tedy dva odkazy. Mezery a konce řádků mezi nimi jsou textové uzly — ty by započítal až `childNodes`.

### --see--

js-dom/strom-dom#stranka-je-strom-uzlu
:::

## Hledání prvků: `querySelector` a `closest`

Prvek najdeš stejným selektorem, jaký píšeš v CSS:

- `document.querySelector('.cart-count')` vrátí **první** odpovídající element, nebo `null`,
- `document.querySelectorAll('.card')` vrátí [[NodeList]] se všemi, i prázdný,
- `card.querySelector('.price')` hledá jen uvnitř `card`, ne v celé stránce,
- `button.closest('.card')` jde naopak **nahoru** — vrátí nejbližšího předka (nebo prvek sám), který selektoru odpovídá.

:::live
```html
<article class="card">
  <h2>Guji Natural</h2>
  <p class="price">349 Kč</p>
  <button class="buy"><span class="icon">+</span> Do košíku</button>
</article>
<article class="card">
  <h2>Pink Bourbon</h2>
  <p class="price">412 Kč</p>
  <button class="buy"><span class="icon">+</span> Do košíku</button>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; display: flex; gap: 1rem; }
.card { border: 1px solid #cbd5e1; border-radius: 0.75rem; padding: 1rem; }
```
```js
const firstPrice = document.querySelector('.price');
console.log(firstPrice.textContent);

const cards = document.querySelectorAll('.card');
console.log(cards.length);

const icon = document.querySelectorAll('.icon')[1];
const card = icon.closest('.card');
console.log(card.querySelector('h2').textContent);
```
:::

Zkus změnit index u `.icon` z `1` na `0` a sleduj poslední výpis. Pak zkus `icon.closest('.basket')` — prvek s takovou třídou nad ikonou není, a tak dostaneš `null`. Právě `closest` budeš potřebovat, až se bude řešit, **na kterou kartu** uživatel klikl.

`NodeList` z `querySelectorAll` je snímek: vznikne v okamžiku volání a později přidané prvky v něm nejsou.

:::live js predict
```js
const list = document.createElement('ul');
list.append(document.createElement('li'));

const items = list.querySelectorAll('li');
list.append(document.createElement('li'));

console.log(items.length, list.children.length);
```
--question-- Co vypíše `console.log`? Napiš dvě čísla oddělená mezerou.
--expected-- 1 2
--why-- `querySelectorAll` vrátil seznam položek, které existovaly ve chvíli volání — jednu. Druhé `<li>` přibylo až potom, takže ho vidí jen `list.children`, který se dívá do stromu pokaždé znovu. Když potřebuješ aktuální stav, zavolej `querySelectorAll` znovu.
:::

`NodeList` umí `forEach` a `length`, ale není to pole. Metody `map` a `filter` na něm nejsou — nejdřív z něj pole udělej: `[...cards].map(…)`.

:::check
Uživatel klikl na ikonu `icon` uvnitř tlačítka, které je uvnitř `<li class="task">`. Napiš výraz, který vrátí to `<li>`.

### --expected--

icon.closest('.task')

### --accept--

icon.closest('li.task')
icon.closest('li')

### --why--

`closest` jde od prvku nahoru ke kořeni a vrátí prvního předka, který odpovídá selektoru. Nezáleží na tom, kolik úrovní mezi ikonou a `<li>` je.

### --see--

js-dom/strom-dom#hledani-prvku-queryselector-a-closest
:::

## Proměnná ukazuje na uzel ve stránce

Z pole víš, že proměnná neobsahuje objekt, ale odkaz na něj. S elementy je to stejné, jen objekt navíc leží ve stromu stránky. `querySelector` ti nevrátí kopii — vrátí **tentýž** uzel, který je vidět na obrazovce. Proto změna přes proměnnou hned změní stránku.

A protože každý uzel je ve stromu jen jednou, `append` existující prvek **přesune**, nezkopíruje:

:::memory
```js
const todo = document.querySelector('#todo');
const done = document.querySelector('#done');
const task = todo.firstElementChild;
done.append(task);
```
--step-- 2 | dvě proměnné, dva seznamy ve stránce
todo -> @todo
done -> @done
@todo: ul#todo [@a, @b]
@a: li „Zabalit knihy"
@b: li „Odhlásit elektřinu"
@done: ul#done []
--step-- 3 | task ukazuje na uzel, který pořád leží v #todo
todo -> @todo
done -> @done
task -> @a
@todo: ul#todo [@a, @b]
@a: li „Zabalit knihy"
@b: li „Odhlásit elektřinu"
@done: ul#done []
--step-- 4 | append uzel přesune — v #todo už není
todo -> @todo
done -> @done
task -> @a
@todo: ul#todo [@b]
@a: li „Zabalit knihy"
@b: li „Odhlásit elektřinu"
@done: ul#done [@a]
:::

:::check
V `#todo` jsou tři `<li>`. Kód přesune první z nich do `#done` přes `done.append(todo.firstElementChild)`. Kolik položek bude mít `#todo` potom?

### --expected--

2

### --why--

`append` s uzlem, který už ve stromu je, ho vyjme z původního místa a vloží na nové. Kopii by vyrobilo až `cloneNode(true)`.

### --see--

js-dom/strom-dom#promenna-ukazuje-na-uzel-ve-strance
:::

## Text a HTML: `textContent` a `innerHTML`

Obsah elementu změníš dvěma vlastnostmi, které vypadají podobně a chovají se úplně jinak:

- `textContent` čte i zapisuje **text**. Zapsaný řetězec se na stránce objeví přesně tak, jak je, i se znaky `<` a `>`.
- `innerHTML` čte i zapisuje **HTML**. Zapsaný řetězec prohlížeč rozebere na značky a postaví z nich nové uzly.

Dokud do stránky dáváš text, který jsi napsal sám, rozdíl nevidíš. Rozdíl nastane, když text přijde od uživatele — název úkolu, recenze, jméno v profilu. Tady si jeden uživatel nastavil hodně zvláštní jméno:

:::compare
```html
<p class="greeting">Vítej, <span class="name"></span></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; transition: background-color 0.3s; }
.greeting { font-size: 1.25rem; }
body.hacked { background: #fecaca; }
body.hacked::after { content: "Na stránce se spustil cizí kód."; display: block; font-weight: 700; color: #991b1b; }
```
```js
const userName = 'Eva <img src="x" onerror="document.body.classList.add(\'hacked\')">';
const nameElement = document.querySelector('.name');
```
--variant-- textContent
```js
nameElement.textContent = userName;
```
--variant-- innerHTML
```js
nameElement.innerHTML = userName;
```
:::

Vlevo je jméno obyčejný text. Vpravo z něj prohlížeč udělal značku `<img>`, obrázek se nenačetl a spustil se kód z atributu `onerror`. Tady jen obarvil stránku, ale stejně dobře mohl poslat přihlašovací cookie útočníkovi nebo za uživatele smazat účet. Tomuhle útoku se říká [[XSS]] (*cross-site scripting*).

> [!REMEMBER]
> **Text od uživatele nebo z API vkládej přes `textContent`. `innerHTML` patří jen HTML, které jsi napsal sám a nic cizího v něm není.**

Když potřebuješ kombinovat značky a cizí text, postav značky jako elementy a cizí text vlož do nich přes `textContent`. Jak na to přes `createElement` a `<template>`, se naučíš hned v prvním workshopu.

> [!NOTE]
> Novější metoda `element.setHTML(html)` HTML před vložením vyčistí od skriptů. Zatím ji ale nepodporují všechny prohlížeče, proto na ni ještě nespoléhej. `textContent` je bezpečný všude.

Existuje ještě `innerText`: vrací text tak, jak je **vidět** (skryté prvky vynechá), a proto musí nejdřív spočítat rozvržení stránky. Na čtení i zápis dat používej `textContent`.

:::check
Kolega vypisuje recenze takhle. Co je na tom špatně?

```js
item.innerHTML = `<strong>${review.author}</strong>: ${review.text}`;
```

### --answer--

Nic, template literal hodnoty automaticky ošetří.

#### --why--

Template literal jen skládá řetězec. Co je v `review.text`, to se dostane do HTML beze změny.

### --correct--

Jméno i text recenze píšou uživatelé, takže přes `innerHTML` do stránky můžou propašovat vlastní HTML a skript.

#### --why--

Cizí data nesmí projít přes `innerHTML`. Bezpečně: `<strong>` vytvořit jako element a jméno i text vložit přes `textContent`.

### --answer--

`innerHTML` nejde použít s template literalem, vyhodí `SyntaxError`.

#### --why--

`innerHTML` přijme jakýkoli řetězec. Problém není v syntaxi, ale v tom, odkud data přicházejí.

### --see--

js-dom/strom-dom#text-a-html-textcontent-a-innerhtml
:::

## Atributy a vlastnosti: `classList`, `dataset` a spol.

HTML atribut a vlastnost objektu často nesou stejné jméno, ale nejsou totéž. **Atribut je text z HTML, vlastnost je aktuální stav objektu.** U většiny atributů (`id`, `href`, `hidden`) se obojí drží v souladu. U formulářových prvků ne: atribut `value` je jen výchozí hodnota, co uživatel napsal, je ve vlastnosti `value`.

:::live js predict
```js
const input = document.createElement('input');
input.setAttribute('value', '1');

input.value = '5';

console.log(input.getAttribute('value'), input.value);
```
--question-- Co vypíše `console.log`? Napiš obě hodnoty oddělené mezerou.
--expected-- 1 5
--why-- Atribut `value` určuje jen počáteční hodnotu pole. Zápis do vlastnosti `value` (stejně jako psaní uživatele) mění aktuální stav a atribut nechá být. Z formulářů proto vždycky čti vlastnost `value`.
:::

S čím se v DOM pracuje nejčastěji:

| co | jak | pozor |
|---|---|---|
| třídy | `el.classList.add('is-open')`, `remove`, `toggle('is-open', force)`, `contains` | jedna třída na argument |
| vlastní data | `data-product-id="42"` → `el.dataset.productId` | hodnota je vždy řetězec |
| ARIA a ostatní atributy | `el.setAttribute('aria-expanded', 'true')`, `getAttribute`, `removeAttribute` | hodnota je text |
| skrytí | `el.hidden = true` | prvek s `display` v CSS přebije `hidden` |
| hodnota do CSS | `el.style.setProperty('--progress', '40%')` | vzhled patří do tříd, přes `style` jen spočítané hodnoty |

Vzhled neměň přes `el.style.color = …`. Do CSS napiš třídu (`.card.is-favorite`) a JavaScript ji jen přidá nebo odebere. Styly zůstanou na jednom místě.

:::live
```html
<article class="card" data-product-id="42">
  <h2>Guji Natural</h2>
  <button class="favorite" aria-pressed="false">Oblíbené</button>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.card { border: 2px solid #cbd5e1; border-radius: 0.75rem; padding: 1rem; max-width: 16rem; transition: border-color 0.2s, background-color 0.2s; }
.card.is-favorite { border-color: #e11d48; background: #fff1f2; }
.favorite { font: inherit; padding: 0.4rem 0.8rem; border-radius: 999px; border: 1px solid #e11d48; background: white; color: #be123c; }
```
```js
const card = document.querySelector('.card');
const button = card.querySelector('.favorite');

button.addEventListener('click', () => {
  const isFavorite = card.classList.toggle('is-favorite');
  button.setAttribute('aria-pressed', String(isFavorite));
  console.log(`Produkt ${card.dataset.productId}: ${isFavorite}`);
});
```
:::

Klikni několikrát na tlačítko. `classList.toggle` třídu přidá nebo odebere a vrátí, jestli ji prvek teď má. `addEventListener('click', …)` spustí funkci po každém kliknutí — podrobně se k událostem dostaneš v lekci [Události](see:js-dom/udalosti). Zkus změnit `data-product-id` na `data-sku` a přečíst ho přes `card.dataset.sku`.

:::check
Karta má atribut `data-stock="3"`. Napiš výraz, který přečte skladem počet kusů jako **číslo**.

### --expected--

Number(card.dataset.stock)

### --accept--

+card.dataset.stock
parseInt(card.dataset.stock, 10)
parseInt(card.dataset.stock)
Number(card.getAttribute('data-stock'))

### --why--

`dataset` vrací vždycky řetězec, protože atributy jsou text. Bez převodu by `card.dataset.stock + 1` dalo `'31'`.

### --see--

js-dom/strom-dom#atributy-a-vlastnosti-classlist-dataset-a-spol
:::

## Kdy skript běží

Prohlížeč čte HTML shora dolů a staví strom postupně. Obyčejný `<script>` spustí **hned, jak na něj narazí** — a všechno pod ním ještě neexistuje.

:::live predict
```html
<script>
  console.log(document.querySelector('h1'));
</script>
<h1>Pražírna Zrno</h1>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
```
--question-- Co vypíše `console.log`?
--option*-- `null`
--option-- Element `<h1>` s textem Pražírna Zrno
--option-- Chybu `TypeError: Cannot read properties of null`
--why-- Skript běží ve chvíli, kdy ho parser potká, a nadpis pod ním ještě není postavený. `querySelector` proto vrátí `null` — chybu nevyhodí, ta přijde až při pokusu s `null` pracovat. Přesuň `<script>` pod `<h1>` a sleduj, co se změní.
:::

Tři spolehlivé způsoby, jak to vyřešit:

- `<script src="app.js" defer></script>` v `<head>` — soubor se stahuje hned, spustí se až po postavení celého stromu. **Výchozí volba.**
- `<script type="module" src="app.js"></script>` — moduly se chovají jako `defer` samy.
- `<script>` úplně na konci `<body>` — funguje taky, jen se skript začne stahovat až nakonec.

Událost `DOMContentLoaded` (strom je hotový) uvidíš ve starším kódu. S `defer` ani s modulem ji nepotřebuješ.

:::check
Skript v `<head>` hledá prvky v `<body>` a dostává `null`. Které úpravy to opraví? Vyber všechny.

### --correct--

Přidat ke značce `<script src="app.js">` atribut `defer`.

#### --why--

`defer` spustí skript až po postavení celého stromu.

### --correct--

Načítat skript jako `<script type="module" src="app.js">`.

#### --why--

Moduly se spouštějí odloženě stejně jako s `defer`.

### --answer--

Přidat atribut `async`.

#### --why--

`async` spustí skript hned, jak se stáhne — klidně dřív, než je strom hotový. Pořadí není zaručené.

### --answer--

Obalit volání `querySelector` do `try`/`catch`.

#### --why--

`querySelector` žádnou chybu nevyhazuje, vrací `null`. `try`/`catch` nezmění to, že prvek ještě neexistuje.

### --see--

js-dom/strom-dom#kdy-skript-bezi
:::

:::explain
Vysvětli vlastními slovy, proč se po změně stránky v konzoli nic nezmění v HTML souboru
na disku.

## --model--
HTML soubor je jen **předloha**. Prohlížeč ho jednou přečte a postaví z něj strom
objektů v paměti — a od té chvíle se obrazovka řídí tím stromem, ne souborem.
JavaScript mění právě ten strom, takže se změna okamžitě projeví na obrazovce, ale
nikam se neukládá. Po obnovení stránky prohlížeč postaví strom znovu z nezměněné
předlohy a všechno je zpátky. Kdo chce změnu udržet, musí ji uložit sám — do
`localStorage`, do adresy, nebo na server.

## --checklist--
- HTML soubor slouží jen jako předloha pro stavbu stromu.
- Obrazovka odpovídá stromu v paměti, ne souboru.
- Změny přes JavaScript se nikam neukládají.
- Po obnovení se strom postaví znovu z původního souboru.
:::

## Typické chyby a pasti

### `null` místo prvku

> [!PITFALL]
> **`querySelector` nic nenašel a vrátil `null`.** Chyba se ukáže až o řádek dál:
> `TypeError: Cannot read properties of null (reading 'textContent')` při čtení, nebo
> `Cannot set properties of null (setting 'textContent')` při zápisu. Příčiny: překlep
> v selektoru (`'price'` místo `'.price'`), prvek se vykreslí až později, nebo skript běží
> dřív, než je strom hotový. Oprava: zkontroluj selektor v konzoli DevTools a skript načítej s `defer`.

### `NodeList` není pole

:::live js predict
```js
const list = document.createElement('ul');
list.append(document.createElement('li'), document.createElement('li'));

try {
  const texts = list.querySelectorAll('li').map((li) => li.textContent);
  console.log(texts.length);
} catch (error) {
  console.log(error.name);
}
```
--question-- Co vypíše tenhle kód?
--expected-- TypeError
--why-- `querySelectorAll` vrací `NodeList`, který má `forEach`, ale ne `map`. Volání `undefined` jako funkce skončí `TypeError: list.querySelectorAll(...).map is not a function`. Oprava: `[...list.querySelectorAll('li')].map(…)`.
:::

> [!PITFALL]
> **`nodes.map is not a function`.** `NodeList` je podobný poli, ale `map`, `filter` ani `reduce` nemá.
> Oprava: `[...nodes].map(…)` nebo `Array.from(nodes, (node) => …)`.

### Čísla z `dataset` se sčítají jako text

> [!PITFALL]
> **`card.dataset.price + 1` pro `data-price="349"` dá `'3491'`.** Všechny hodnoty z `dataset`
> a z `getAttribute` jsou řetězce. Oprava: `Number(card.dataset.price) + 1`.

### Dvě třídy v jednom `add`

> [!PITFALL]
> **`el.classList.add('is-active is-new')` vyhodí** `InvalidCharacterError: … The token provided ('is-active is-new') contains HTML space characters`.
> Oprava: každá třída jako samostatný argument — `el.classList.add('is-active', 'is-new')`.

:::check
Co vypíše tenhle kód pro `<button class="add" data-count="2">`?

```js
const button = document.querySelector('.add');
console.log(button.dataset.count * 2, button.dataset.count + 2);
```

### --expected--

4 22

### --why--

Operátor `*` řetězec převede na číslo, takže `'2' * 2` je `4`. Operátor `+` s řetězcem ale spojuje text: `'2' + 2` je `'22'`. Proto hodnoty z `dataset` před počítáním převáděj přes `Number`.

### --see--

js-dom/strom-dom#cisla-z-dataset-se-scitaji-jako-text
:::

Příště z toho postavíš seznam úkolů na stěhování: prvky ze šablony, vykreslení z pole dat a přidávání formulářem, ve kterém název úkolu nikdy nespustí cizí kód.

## Kde to najdeš v MDN

- [Introduction to the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction) — co je DOM, uzly a stromová struktura, s obrázky.
- [Document.querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll) — v části *Return value* je věta o tom, že `NodeList` je statický.
- [Element.innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML) — oddíl *Security considerations* s příkladem útoku přes `onerror`.
- [HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) — jak se `data-product-id` převádí na `productId`.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
const list = document.createElement('ol');
const first = document.createElement('li');
list.append(first);
const again = list.querySelector('li');
again.textContent = 'Zabalit kuchyň';
console.log(first.textContent);
```

### --expected--

Zabalit kuchyň

### --why--

`querySelector` nevrací kopii prvku, ale odkaz na tentýž uzel ve stromu. `first` i `again` ukazují na jedno `<li>`, takže zápis přes `again` je vidět i přes `first`.

### --see--

js-dom/strom-dom#promenna-ukazuje-na-uzel-ve-strance

## --question--

V e-shopu se po přidání do košíku zobrazí hláška `Přidáno: <název produktu>`. Název produktu zadávají prodejci v administraci. Který řádek je správný?

### --answer--

`toast.innerHTML = 'Přidáno: ' + product.name;`

#### --why--

Název píše člověk mimo tvůj kód. Když v něm bude značka s `onerror`, spustí se u každého zákazníka.

### --correct--

`toast.textContent = 'Přidáno: ' + product.name;`

#### --why--

`textContent` vloží celý řetězec jako text, značky v názvu se jen zobrazí.

### --answer--

`toast.innerText = 'Přidáno: ' + product.name;` — jen `innerText` je bezpečný.

#### --why--

Zápis do `innerText` HTML taky nerozebírá, ale `textContent` je stejně bezpečný a nepotřebuje přepočítat rozvržení. Myšlenka „bezpečný je jen `innerText`" neplatí.

### --see--

js-dom/strom-dom#text-a-html-textcontent-a-innerhtml

## --question--

Stránka má `<input id="email" value="eva@example.cz">` a uživatel adresu v poli přepsal na `eva.novakova@example.cz`. Co vrátí `document.querySelector('#email').getAttribute('value')`?

### --expected--

eva@example.cz

### --accept--

'eva@example.cz'

### --why--

Atribut `value` je jen výchozí hodnota z HTML a psaní uživatele ho nemění. Aktuální text je ve vlastnosti `value`.

### --see--

js-dom/strom-dom#atributy-a-vlastnosti-classlist-dataset-a-spol

## --question--

Napiš výraz, který ze všech prvků `.price` na stránce udělá pole jejich textů.

### --expected--

[...document.querySelectorAll('.price')].map((price) => price.textContent)

### --accept--

Array.from(document.querySelectorAll('.price'), (price) => price.textContent)
[...document.querySelectorAll('.price')].map((el) => el.textContent)
[...document.querySelectorAll('.price')].map((element) => element.textContent)
[...document.querySelectorAll('.price')].map(price => price.textContent)
[...document.querySelectorAll('.price')].map(el => el.textContent)
Array.from(document.querySelectorAll('.price')).map((price) => price.textContent)
Array.from(document.querySelectorAll('.price')).map((el) => el.textContent)

### --why--

`NodeList` nemá `map`, a tak ho nejdřív převedeš na pole spreadem nebo `Array.from`. Jméno parametru je na tobě.

### --see--

js-dom/strom-dom#nodelist-neni-pole
