## --card-- output

Co vypíše tenhle kód?

```js
document.body.innerHTML = '<p class="price">349 Kč</p>';
console.log(document.querySelector('price'));
```

### --expected--

null

### --why--

Selektor `price` bez tečky hledá značku `<price>`, ne třídu. `querySelector` chybu nevyhodí, vrátí `null` — a `TypeError` přijde až o řádek dál, když s výsledkem zkusíš pracovat.

### --see--

js-dom/strom-dom#null-misto-prvku

## --card-- output

Co vypíše tenhle kód?

```js
document.body.innerHTML = `<ol>
  <li>Zabalit knihy</li>
  <li>Odhlásit plyn</li>
  <li>Předat klíče</li>
</ol>`;
const list = document.querySelector('ol');
console.log(list.children.length, list.childNodes.length);
```

### --expected--

3 7

### --why--

`children` počítá jen elementy. `childNodes` i textové uzly s konci řádků a mezerami: jeden před každým `<li>` a jeden za posledním, tedy 3 + 4.

### --see--

js-dom/strom-dom#stranka-je-strom-uzlu

## --card-- output

Co vypíše tenhle kód?

```js
document.body.innerHTML = '<p class="badge"></p>';
const badge = document.querySelector('.badge');
badge.textContent = '<em>Novinka</em>';
console.log(badge.children.length);
```

### --expected--

0

### --why--

`textContent` řetězec nerozebírá na značky. Na stránce je doslova text `<em>Novinka</em>` a žádný element `<em>` nevznikl.

### --see--

js-dom/strom-dom#text-a-html-textcontent-a-innerhtml

## --card-- output

Co vypíše tenhle kód?

```js
document.body.innerHTML = '<section class="panel"><button>Obnovit</button></section>';
let heard = false;
document.querySelector('.panel').addEventListener('refresh', () => {
  heard = true;
});
document.querySelector('button').dispatchEvent(new Event('refresh'));
console.log(heard);
```

### --expected--

false

### --why--

Události vytvořené v kódu přes `new Event` i `new CustomEvent` ve výchozím stavu neprobublávají. Posluchač na předkovi se spustí až s volbou `{ bubbles: true }`.

### --see--

js-dom/udalosti#vlastni-udalosti-customevent

## --card-- output

Co vypíše tenhle kód?

```js
document.body.innerHTML = '<button>Stáhnout faktury</button>';
const button = document.querySelector('button');
let downloads = 0;
button.addEventListener('click', () => downloads++, { once: true });
button.click();
button.click();
console.log(downloads);
```

### --expected--

1

### --why--

Volba `once: true` posluchač po prvním zavolání sama odebere. Druhé kliknutí už žádný posluchač nenajde.

### --see--

js-dom/udalosti#posluchac-addeventlistener

## --card-- output

Co vypíše tenhle kód?

```js
document.body.innerHTML = '<form><input id="city" value="Olomouc"></form>';
const data = new FormData(document.querySelector('form'));
console.log(data.get('city'));
```

### --expected--

null

### --why--

`FormData` čte pole podle atributu `name`, ne podle `id`. Pole bez `name` v datech formuláře vůbec není.

### --see--

js-dom/formulare-v-js#pole-bez-name

## --card-- output

Co vypíše tenhle kód?

```js
localStorage.setItem('recentIds', [12, 40]);
console.log(localStorage.getItem('recentIds'));
```

### --expected--

12,40

### --why--

`localStorage` ukládá jen text a pole převede stejně jako `String(pole)`. Zpátky dostaneš řetězec `'12,40'`, ne pole. Ukládej `JSON.stringify` a čti `JSON.parse`.

### --see--

js-dom/prohlizecova-api#jen-retezce-json-stringify-a-json-parse

## --card-- output

Adresa stránky je `…/recepty?kategorie=polevky`. Co vypíše tenhle kód?

```js
const params = new URLSearchParams('?kategorie=polevky');
console.log(Number(params.get('strana')));
```

### --expected--

0

### --why--

Parametr `strana` v adrese chybí, `get` vrátí `null` a `Number(null)` je `0` — žádná chyba, jen tiše nesmyslná stránka. Chybějící parametr rozliš podmínkou nebo přes `params.has('strana')`.

### --see--

js-dom/prohlizecova-api#cisla-z-uloziste-a-z-adresy-se-scitaji-jako-text

## --card-- output

Co vypíše tenhle kód?

```js
document.body.innerHTML = '<nav class="menu"></nav>';
const menu = document.querySelector('.menu');
console.log(menu.classList.toggle('is-open'), menu.classList.toggle('is-open'));
```

### --expected--

true false

### --why--

`toggle` bez druhého argumentu třídu přidá, když chybí, a odebere, když je. Vrací, jestli ji prvek **potom** má.

### --see--

js-dom/strom-dom#atributy-a-vlastnosti-classlist-dataset-a-spol

## --card-- output

Co vypíše tenhle kód?

```js
document.body.innerHTML = '<label><input type="checkbox" id="terms"> Souhlasím</label>';
const terms = document.querySelector('#terms');
terms.addEventListener('click', (event) => event.stopPropagation());
terms.click();
console.log(terms.checked);
```

### --expected--

true

### --why--

`stopPropagation` zastaví jen cestu události k předkům. Výchozí akce kliknutí — zaškrtnutí políčka — proběhne dál. Zrušila by ji až `preventDefault`.

### --see--

js-dom/udalosti#preventdefault-a-stoppropagation

## --card-- code js

Napiš funkci `renderNames(list, names)`, která obsah prvku `list` nahradí položkami `<li>` s texty z pole `names` ve stejném pořadí. Texty jsou od uživatelů, značky v nich se nesmí vykreslit.

### --seed--

```js
function renderNames(list, names) {
}
```

### --test--

```js
const list = document.createElement('ul');
list.append(document.createElement('li'));
renderNames(list, ['Eva', 'Ota <b>Novák</b>']);
assert.equal(list.children.length, 2, 'renderNames(ul se starou položkou, [Eva, Ota]) má v seznamu nechat jen 2 nové položky');
assert.equal(list.children[1].textContent, 'Ota <b>Novák</b>', 'druhá položka má obsahovat text „Ota <b>Novák</b>" doslova');
assert.equal(list.querySelector('b'), null, 'z textu nesmí vzniknout element <b> — vkládej ho jako text');
renderNames(list, []);
assert.equal(list.children.length, 0, 'renderNames(list, []) má seznam vyprázdnit');
```

### --solution--

```js
function renderNames(list, names) {
  list.replaceChildren(...names.map((name) => {
    const item = document.createElement('li');
    item.textContent = name;
    return item;
  }));
}
```

### --see--

js-dom/workshop-seznam-ukolu/004

## --card-- code js

Napiš funkci `cardIdFromClick(event)` pro delegaci: vrátí `data-id` nejbližšího předka cíle události s atributem `data-id` (i když kliknutí trefilo ikonu uvnitř), nebo `null`, když takový předek není.

### --seed--

```js
function cardIdFromClick(event) {
}
```

### --test--

```js
document.body.innerHTML = '<ul><li data-id="p7"><button><svg><path></path></svg></button></li></ul><p class="outside">Mimo</p>';
const onPath = { target: document.querySelector('path') };
assert.equal(cardIdFromClick(onPath), 'p7', 'kliknutí na <path> v ikoně uvnitř <li data-id="p7"> má vrátit p7');
const onItem = { target: document.querySelector('li') };
assert.equal(cardIdFromClick(onItem), 'p7', 'kliknutí přímo na <li data-id="p7"> má vrátit p7');
const outside = { target: document.querySelector('.outside') };
assert.equal(cardIdFromClick(outside), null, 'kliknutí mimo prvky s data-id má vrátit null');
```

### --solution--

```js
function cardIdFromClick(event) {
  return event.target.closest('[data-id]')?.dataset.id ?? null;
}
```

### --see--

js-dom/udalosti#delegace-jeden-posluchac-pro-cely-seznam

## --card-- code js

Napiš funkci `loadList(key)`, která z `localStorage` přečte JSON pole pod klíčem `key`. Když klíč chybí, text není platný JSON nebo v něm není pole, vrátí prázdné pole a nevyhodí chybu.

### --seed--

```js
function loadList(key) {
}
```

### --test--

```js
assert.deepEqual(loadList('bookmarks'), [], 'loadList pro chybějící klíč má vrátit []');
localStorage.setItem('bookmarks', '["praha","brno"]');
assert.deepEqual(loadList('bookmarks'), ['praha', 'brno'], 'loadList pro uložené ["praha","brno"] má vrátit to pole');
localStorage.setItem('bookmarks', 'praha,brno');
assert.deepEqual(loadList('bookmarks'), [], 'loadList pro rozbitý text „praha,brno" má vrátit []');
localStorage.setItem('bookmarks', '{"praha":true}');
assert.deepEqual(loadList('bookmarks'), [], 'loadList pro JSON objekt místo pole má vrátit []');
```

### --solution--

```js
function loadList(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
```

### --see--

js-dom/prohlizecova-api#kdyz-uloziste-zklame

## --card-- code js

Napiš funkci `withQuery(href, query)`, která vrátí adresu `href` s parametrem `q` nastaveným na `query`. Prázdný `query` parametr `q` z adresy odstraní. Ostatní parametry zůstanou.

### --seed--

```js
function withQuery(href, query) {
}
```

### --test--

```js
const one = new URL(withQuery('https://zelenykout.cz/katalog?kategorie=kapradiny', 'sleziník'));
assert.equal(one.searchParams.get('q'), 'sleziník', "withQuery(…?kategorie=kapradiny, 'sleziník') má nastavit q=sleziník");
assert.equal(one.searchParams.get('kategorie'), 'kapradiny', 'parametr kategorie má zůstat');
const two = new URL(withQuery('https://zelenykout.cz/katalog?q=aloe&kategorie=sukulenty', ''));
assert.equal(two.searchParams.has('q'), false, "withQuery(…?q=aloe…, '') má parametr q odstranit");
assert.equal(two.searchParams.get('kategorie'), 'sukulenty', 'parametr kategorie má zůstat i po odstranění q');
```

### --solution--

```js
function withQuery(href, query) {
  const url = new URL(href);
  if (query === '') {
    url.searchParams.delete('q');
  } else {
    url.searchParams.set('q', query);
  }
  return url.href;
}
```

### --see--

js-dom/prohlizecova-api#stav-v-adrese-url-a-urlsearchparams

## --card-- free

Co je delegace událostí, jak funguje a kdy ji použiješ?

### --back--

Delegace je jeden posluchač na společném předkovi místo posluchače na každém potomkovi. Funguje díky probublávání: kliknutí na tlačítko v položce projde nahoru až k seznamu, kde ho posluchač zachytí. V posluchači zjistím, na co se kliklo, přes `event.target.closest('[data-action]')`, protože cíl může být i ikona uvnitř tlačítka. Hodí se pro seznamy, které se překreslují nebo do kterých přibývají položky — nové položky nepotřebují vlastní posluchač a nic se neregistruje dvakrát.

### --see--

js-dom/udalosti#delegace-jeden-posluchac-pro-cely-seznam

## --card-- free

Jaký je rozdíl mezi `event.target` a `event.currentTarget`?

### --back--

`target` je prvek, kde událost vznikla — nejhlubší prvek, na který uživatel skutečně klikl, třeba ikona uvnitř tlačítka. `currentTarget` je prvek, jehož posluchač právě běží. Když je posluchač přímo na tlačítku, spolehlivě čtu `currentTarget`; v delegaci je `currentTarget` celý seznam, a tak konkrétní tlačítko hledám přes `target.closest(…)`. Nejčastější chyba je číst `event.target.dataset`, které při kliknutí na ikonu vrátí `undefined`.

### --see--

js-dom/udalosti#target-a-currenttarget

## --card-- free

Jaký je rozdíl mezi `preventDefault()` a `stopPropagation()`? Kdy použiješ kterou?

### --back--

`preventDefault()` zruší výchozí akci prohlížeče: odeslání formuláře, přechod na odkaz, zaškrtnutí políčka nebo posun stránky šipkou. Používám ho pořád, třeba u formuláře zpracovaného v JavaScriptu. `stopPropagation()` zastaví cestu události k předkům, takže se posluchače výš ve stromu nespustí. Ten skoro nepoužívám, protože rozbije cizí posluchače, například zavírání menu kliknutím mimo. Jedno s druhým nesouvisí: `preventDefault` probublání nezastaví a `stopPropagation` nezruší výchozí akci.

### --see--

js-dom/udalosti#preventdefault-a-stoppropagation

## --card-- free

Proč se text od uživatele nevkládá přes `innerHTML`? Co je XSS a jak se mu bráníš?

### --back--

`innerHTML` bere řetězec jako HTML a postaví z něj elementy. Když v textu od uživatele nebo z API bude třeba `<img src="x" onerror="…">`, prohlížeč obrázek nenačte a spustí kód z `onerror` — v kontextu mé stránky, s přístupem k datům přihlášeného uživatele. Tomu se říká XSS. Bráním se tím, že cizí text vkládám přes `textContent` nebo `append` s řetězcem a značky stavím jako elementy (`createElement`, `<template>`). `innerHTML` nechávám jen pro HTML, které jsem napsal sám.

### --see--

js-dom/strom-dom#text-a-html-textcontent-a-innerhtml

## --card-- free

Kam uložíš filtr katalogu, zvolený tmavý motiv a informaci, že je otevřené menu? Proč?

### --back--

Filtr patří do adresy, protože určuje, co je na stránce vidět: jde poslat odkazem, uložit do záložek a vrátit tlačítkem Zpět. Tmavý motiv je osobní volba v konkrétním prohlížeči, takže patří do `localStorage` — do sdíleného odkazu nepatří. Otevřené menu stačí v proměnné, po obnovení stránky ho nikdo nečeká. Každý kus stavu má jedno místo, odkud se čte, a co jde spočítat z jiného stavu, neukládám nikam.

### --see--

js-dom/prohlizecova-api#adresa-localstorage-nebo-promenna

## --card-- free

Co znamená, že data jsou zdroj pravdy a stránka se z nich vykresluje? Proč se to vyplatí?

### --back--

Stav aplikace držím na jednom místě, třeba v poli úkolů. Každá akce jen změní data a zavolá `render()`, který podle nich uvede do pořádku celou stránku: seznam, počty, prázdný stav i neaktivní tlačítka. Nemusím si pamatovat, kterou část stránky která akce ovlivňuje, a stránka nikdy neukáže nic jiného než data. Z DOM data zpátky nečtu. Na stejném principu stojí React, jen vykreslování tam dělá knihovna.

### --see--

js-dom/workshop-seznam-ukolu/008

## --card-- free

Proč po překreslení seznamu uživatel přijde o fokus a jak tomu předejdeš?

### --back--

Fokus patří konkrétnímu uzlu. Když seznam překreslím přes `replaceChildren` nebo `innerHTML`, tlačítko s fokusem ze stránky zmizí a nahradí ho nové, které jen vypadá stejně — fokus spadne na `body`. Uživatel klávesnice nebo čtečky obrazovky pak neví, kde je. Prvky, se kterými uživatel zrovna pracuje (pole hledání), nepřekresluji a měním jen jejich vlastnosti. Když překreslení potřebuju, najdu nový prvek podle `data-id` a vrátím na něj fokus přes `focus()`.

### --see--

js-dom/udalosti#prekresleni-vezme-uzivateli-fokus

## --card-- free

Skript v `<head>` hledá prvky v `<body>` a dostává `null`. Proč, a jak skripty načítáš správně?

### --back--

Prohlížeč čte HTML shora dolů a obyčejný `<script>` spustí hned, jak na něj narazí — prvky pod ním ještě neexistují, a tak `querySelector` vrátí `null`. Výchozí volba je `<script src="app.js" defer>` v `<head>`: soubor se stahuje hned a spustí se až po postavení celého stromu. Stejně se chovají moduly (`type="module"`). `async` na to nestačí, protože spustí skript, jakmile se stáhne, klidně před dokončením stromu.

### --see--

js-dom/strom-dom#kdy-skript-bezi
