---
pass: 0.8
---

# --questions--

## --question--

Co vypíše tenhle kód? Každý výpis napiš na nový řádek.

```js
document.body.innerHTML = '<ul class="cart"><li class="item"><button class="remove">Odebrat</button></li></ul>';
document.querySelector('.cart').addEventListener('click', () => console.log('košík'));
document.querySelector('.item').addEventListener('click', (event) => {
  console.log('položka');
  event.stopPropagation();
});
document.querySelector('.remove').addEventListener('click', () => console.log('tlačítko'));
document.querySelector('.remove').click();
```

### --expected--

```text
tlačítko
položka
```

### --why--

Kliknutí začne u cíle (tlačítko) a probublává nahoru přes předky. Posluchač položky se spustí, ale `stopPropagation` zastaví další cestu, takže posluchač košíku se nedozví nic. Proto `stopPropagation` rozbíjí posluchače, o kterých autor položky neví.

### --see--

js-dom/udalosti#cesta-udalosti-zachyceni-cil-probublani
js-dom/udalosti#preventdefault-a-stoppropagation

## --question--

Navigace má odkazy s ikonou: `<a href="/kosik" data-page="kosik"><svg>…</svg> Košík</a>`. Delegace na `<nav>` má zjistit stránku, i když uživatel klikne na ikonu. Který řádek je správný?

### --answer--

`const page = event.target.dataset.page;`

#### --why--

Myslíš si, že `target` je prvek s posluchačem nebo odkaz? Je to nejhlubší prvek, na který se kliklo — při kliknutí na ikonu `svg` nebo `path` bez `data-page`.

### --answer--

`const page = event.currentTarget.dataset.page;`

#### --why--

`currentTarget` je prvek, jehož posluchač běží. Posluchač je na `<nav>`, a ten `data-page` nemá.

### --correct--

`const page = event.target.closest('[data-page]')?.dataset.page;`

#### --why--

`closest` jde od skutečného cíle nahoru a najde odkaz, ať uživatel trefil ikonu, text, nebo okraj. `?.` ošetří kliknutí mimo odkazy.

### --see--

js-dom/udalosti#target-a-currenttarget
js-dom/udalosti#delegace-jeden-posluchac-pro-cely-seznam

## --question--

Jméno přihlášeného uživatele přichází z API a má se vypsat do `<p class="greeting">` za text „Ahoj, ". Které řádky jsou bezpečné proti XSS? Vyber všechny.

### --correct--

`greeting.textContent = 'Ahoj, ' + user.name;`

#### --why--

`textContent` vloží celý řetězec jako text, značky ve jméně se jen zobrazí.

### --correct--

`greeting.append('Ahoj, ', user.name);`

#### --why--

`append` vkládá řetězce jako textové uzly, ne jako HTML.

### --answer--

`` greeting.innerHTML = `Ahoj, ${user.name}`; ``

#### --why--

Template literal jen skládá text. Co ve jménu přijde, to prohlížeč přes `innerHTML` rozebere jako HTML — i značku s `onerror`.

### --answer--

`greeting.innerHTML = 'Ahoj, ' + user.name.trim();`

#### --why--

`trim` odstraní jen mezery na krajích. Značky uvnitř jména zůstanou a `innerHTML` je postaví.

### --see--

js-dom/strom-dom#text-a-html-textcontent-a-innerhtml

## --question--

Co vypíše tenhle kód?

```js
localStorage.setItem('tourSeen', false);
if (localStorage.getItem('tourSeen')) {
  console.log('prohlídku přeskočím');
} else {
  console.log('ukážu prohlídku');
}
```

### --expected--

prohlídku přeskočím

### --why--

`setItem` uložil text `'false'`, ne hodnotu `false`. Neprázdný řetězec je v podmínce pravdivý, takže prohlídku neuvidí nikdo, ani nový návštěvník po tomhle řádku. Porovnávej text (`=== 'true'`) nebo ukládej přes `JSON.stringify` a čti přes `JSON.parse`.

### --see--

js-dom/prohlizecova-api#jen-retezce-json-stringify-a-json-parse

## --question--

Tlačítko má atribut `data-order-id="2026-117"` a je v proměnné `button`. Napiš výraz, který jeho hodnotu přečte přes `dataset`.

### --expected--

button.dataset.orderId

### --accept--

button.dataset['orderId']

### --why--

Pomlčky v názvu atributu se v `dataset` převádějí na velké písmeno: `data-order-id` → `orderId`. Hodnota je vždycky řetězec.

### --see--

js-dom/strom-dom#atributy-a-vlastnosti-classlist-dataset-a-spol

## --question--

Kolega chtěl, aby kliknutí na zaškrtávací políčko „Souhlasím s podmínkami" jen zapsalo do konzole, a v posluchači `click` omylem zavolal `event.preventDefault()`. Co uživatel uvidí, když na políčko klikne?

### --answer--

Políčko se zaškrtne, jen se kliknutí nedostane k posluchačům na formuláři.

#### --why--

Tohle by udělalo `stopPropagation`. `preventDefault` ruší něco jiného než cestu události.

### --correct--

Políčko se nezaškrtne, protože zaškrtnutí je výchozí akce kliknutí a ta se zrušila.

#### --why--

Výchozí akcí kliknutí na políčko je změna `checked`. `preventDefault` ji vrátí zpátky, takže `box.checked` zůstane `false`.

### --answer--

Nic se nezmění, `preventDefault` má vliv jen na odkazy a formuláře.

#### --why--

Výchozí akci má víc prvků než odkaz a formulář — třeba políčko, přepínač nebo klávesa šipky, která posouvá stránku.

### --see--

js-dom/udalosti#preventdefault-a-stoppropagation

## --question--

Formulář přihlášky má posluchač `submit`, který kontroluje pole a vypisuje vlastní chyby. Kolega přidal vlastní tlačítko mimo formulář a v jeho posluchači volá `form.submit()`. Po kliknutí se formulář odešle i s prázdnými poli. Proč?

### --answer--

`submit()` odešle formulář až po doběhnutí posluchače `click`, a to už je pozdě na kontrolu.

#### --why--

Nejde o pořadí posluchačů. Rozhoduje, co metoda `submit()` při odeslání udělá a co vynechá.

### --correct--

`form.submit()` přeskočí validaci i událost `submit`, takže se posluchač s kontrolou vůbec nespustí.

#### --why--

Jako kliknutí na tlačítko formuláře se chová `form.requestSubmit()`: zkontroluje pravidla a vyvolá `submit`.

### --answer--

Tlačítko mimo `<form>` formulář odeslat nemůže, odeslal se kvůli něčemu jinému.

#### --why--

Z JavaScriptu jde formulář odeslat odkudkoli. Rozhoduje, kterou metodou.

### --see--

js-dom/formulare-v-js#odeslani-submit-a-preventdefault

## --question--

Co vypíše tenhle kód?

```js
const params = new URLSearchParams();
params.set('q', 'čaj zelený');
console.log(params.toString());
```

### --expected--

q=%C4%8Daj+zelen%C3%BD

### --why--

`URLSearchParams` hodnoty sám zakóduje: diakritiku jako `%C4%8D` a podobně, mezeru jako `+`. Proto adresu neskládáš ručním spojováním textu. Při čtení přes `get('q')` dostaneš zpátky `čaj zelený`.

### --see--

js-dom/prohlizecova-api#stav-v-adrese-url-a-urlsearchparams

## --question--

Kolik položek vypíše poslední řádek?

```js
document.body.innerHTML = '<ul id="list"></ul><template id="row"><li>Řádek</li></template>';
const row = document.querySelector('#row').content.firstElementChild;
const list = document.querySelector('#list');
list.append(row);
list.append(row);
console.log(list.children.length);
```

### --expected--

1

### --why--

Obsah šablony se nezkopíroval, `row` je pořád jeden uzel. První `append` ho přesune ze šablony do seznamu, druhý ho přesune na totéž místo. Každý řádek potřebuje vlastní kopii: `content.firstElementChild.cloneNode(true)`.

### --see--

js-dom/strom-dom#promenna-ukazuje-na-uzel-ve-strance
js-dom/workshop-seznam-ukolu/006

## --question--

Najdi v anglické dokumentaci MDN u prvku `<dialog>` (stránka *HTMLDialogElement*) událost, která přijde, když uživatel modální okno zavírá klávesou Escape — **ještě předtím**, než se zavře, a jde ji zrušit přes `preventDefault()`. Napiš její jméno.

### --expected-- ignore-case

cancel

### --why--

Událost `cancel` přijde při pokusu o zavření klávesou Escape a `preventDefault()` zavření zastaví — hodí se u dialogu s rozepsaným formulářem. Po samotném zavření přijde ještě `close`, tu už zrušit nejde.

### --see--

js-dom/workshop-zalozky-a-dialog/009

## --question--

Katalog vykresluje `render(products.sort((a, b) => a.price - b.price))`, když uživatel vybere řazení Od nejlevnějších. Po přepnutí zpátky na Doporučené ale zůstanou produkty seřazené podle ceny. Proč?

### --answer--

`render` si poslední seřazení pamatuje v DOM a znovu ho použije.

#### --why--

Vykreslení tu nic neukládá. Změnilo se něco, z čeho se vykresluje.

### --correct--

`sort` seřadil přímo pole `products`, takže původní pořadí je pryč.

#### --why--

`sort` řadí na místě a vrací totéž pole. Pro řazení bez mutace je `toSorted`.

### --answer--

Porovnávací funkce `a.price - b.price` řadí trvale, `b.price - a.price` by ne.

#### --why--

Směr řazení určuje jen pořadí výsledku. Otázka je, které pole se řadí.

### --see--

js-pole/co-je-pole#mutace-pole-z-parametru

## --question--

Co vypíše poslední řádek?

```js
const task = { title: 'Předat klíče', due: new Date(2026, 8, 30) };
localStorage.setItem('task', JSON.stringify(task));
const loaded = JSON.parse(localStorage.getItem('task'));
console.log(typeof loaded.due);
```

### --expected--

string

### --why--

JSON datum nezná. `JSON.stringify` ho zapíše jako text ve formátu ISO a `JSON.parse` z něj datum zpátky nevyrobí. Po načtení z úložiště ho převeď sám: `new Date(loaded.due)`.

### --see--

js-objekty/kopie-a-json#co-json-ztrati

## --question--

Co vypíše tenhle kód?

```js
const favorites = new Set(['monstera', 'aloe']);
localStorage.setItem('favorites', JSON.stringify(favorites));
console.log(localStorage.getItem('favorites'));
```

### --expected--

{}

### --why--

`JSON.stringify` z `Set` (i z `Map`) udělá prázdný objekt, protože hodnoty nemá ve vlastnostech. Oblíbené jsou po obnovení pryč. Ulož pole: `JSON.stringify([...favorites])`, a při čtení z něj `Set` znovu postav.

### --see--

js-tridy-kolekce/map-a-set#json-stringify-mapy

## --question--

Co vypíše kód po kliknutí na první tlačítko (S)?

```js
document.body.innerHTML = '<div id="sizes"></div>';
var sizes = ['S', 'M', 'L'];
for (var i = 0; i < sizes.length; i++) {
  var button = document.createElement('button');
  button.textContent = sizes[i];
  button.addEventListener('click', () => console.log(sizes[i]));
  document.querySelector('#sizes').append(button);
}
document.querySelector('#sizes button').click();
```

### --expected--

undefined

### --why--

Posluchač se spustí až po kliknutí a čte proměnnou `i`, ne její hodnotu z doby vzniku. `var` má jedno `i` pro celý cyklus a po jeho konci je `3`, takže `sizes[3]` je `undefined`. S `let` dostane každý průchod vlastní `i` a vypíše se `S`.

### --see--

js-funkce-hloubka/closures#var-v-cyklu-se-settimeout

# --code-- Hodnocení receptu

## --file-- rating.js

```js
// Hodnocení receptu: hvězdičky a komentáře pod receptem.
// Napsal kolega pro web Vaříme doma, verze 0.3.

var STORAGE_KEY = 'recipe-ratings';

var recipeBox = document.getElementById('recipe');
var starsBox = document.getElementById('stars');
var commentList = document.getElementById('comments');
var commentForm = document.getElementById('comment-form');
var averageText = document.getElementById('average');

var recipeId = recipeBox.getAttribute('data-recipe');

function loadRatings() {
  var saved = localStorage.getItem(STORAGE_KEY);
  return JSON.parse(saved);
}

function saveRatings(ratings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
}

var ratings = loadRatings();
var myRating = ratings[recipeId] || 0;

var comments = [
  { author: 'Jana z Kolína', text: 'Dělala jsem s tvarohem místo ricotty, výborné.' },
  { author: 'Petr', text: 'Trouba 180 °C stačila na 35 minut.' }
];

function renderStars() {
  var html = '';
  for (var i = 1; i <= 5; i++) {
    var active = i <= myRating ? ' is-active' : '';
    html += '<button type="button" class="star' + active + '" data-value="' + i + '"'
      + ' aria-label="' + i + ' z 5">'
      + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 7h7l-6 4 2 8-6-5-6 5 2-8-6-4h7z"/></svg>'
      + '</button>';
  }
  starsBox.innerHTML = html;
}

function renderAverage() {
  var values = Object.values(ratings);
  var sum = 0;
  for (var i = 0; i < values.length; i++) {
    sum = sum + values[i];
  }
  averageText.textContent = values.length === 0 ? 'Zatím bez hodnocení' : 'Průměr ' + (sum / values.length).toFixed(1);
}

function renderComments() {
  commentList.innerHTML = '';
  for (var i = 0; i < comments.length; i++) {
    var item = document.createElement('li');
    item.innerHTML = '<strong>' + comments[i].author + '</strong> ' + comments[i].text;
    commentList.appendChild(item);
  }
  commentList.addEventListener('click', function (event) {
    if (event.target.tagName === 'STRONG') {
      commentForm.elements.text.value = '@' + event.target.textContent + ' ';
      commentForm.elements.text.focus();
    }
  });
}

starsBox.addEventListener('click', function (event) {
  var value = Number(event.target.dataset.value);
  if (!value) {
    return;
  }
  myRating = value;
  ratings[recipeId] = value;
  saveRatings(ratings);
  renderStars();
  renderAverage();
});

starsBox.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowRight' && myRating < 5) {
    myRating = myRating + 1;
  } else if (event.key === 'ArrowLeft' && myRating > 1) {
    myRating = myRating - 1;
  } else {
    return;
  }
  event.preventDefault();
  ratings[recipeId] = myRating;
  saveRatings(ratings);
  renderStars();
  starsBox.querySelectorAll('.star')[myRating - 1].focus();
});

commentForm.addEventListener('submit', function (event) {
  event.preventDefault();
  var data = new FormData(commentForm);
  comments.push({ author: data.get('author'), text: data.get('text') });
  commentForm.reset();
  renderComments();
});

renderStars();
renderAverage();
renderComments();
```

## --question--

Návštěvník otevře recept v prohlížeči poprvé a úložiště je prázdné. Na kterém řádku `rating.js` skript spadne? Napiš číslo řádku.

### --expected--

24

### --why--

Při první návštěvě vrátí `getItem` `null` a `JSON.parse(null)` na řádku 16 je taky `null` — žádná chyba. Ta přijde až na řádku 24: `ratings[recipeId]` čte z `null` a skončí `TypeError: Cannot read properties of null`. Hvězdičky ani komentáře se pak nevykreslí vůbec. Oprava: `loadRatings` s `try`/`catch` a výchozí hodnotou `{}`.

### --see--

js-dom/prohlizecova-api#kdyz-uloziste-zklame

## --question--

Uživatel klikne myší přímo na obrázek hvězdičky (`svg` uvnitř tlačítka), ne na okraj tlačítka. Co se stane? Posluchač je na řádku 67.

### --answer--

Hodnocení se uloží, protože kliknutí z `svg` probublá do tlačítka s `data-value`.

#### --why--

Probublá, jenže posluchač je až na `starsBox` a čte `event.target`. Na který prvek `target` ukazuje?

### --correct--

Nic: `event.target` je `svg` (nebo `path`) bez `data-value`, `Number(undefined)` je `NaN` a řádek 69 funkci ukončí.

#### --why--

Kolega čte `data-value` z cíle události. Oprava na řádku 68: `event.target.closest('[data-value]')`.

### --answer--

Skript spadne s `TypeError`, protože `svg` nemá `dataset`.

#### --why--

Prvky SVG `dataset` mají, jen v něm `value` není. Chyba se nevyhodí — o to hůř se hledá.

### --see--

js-dom/udalosti#target-a-currenttarget

## --question--

Na kterém řádku může návštěvník, který odešle komentář, spustit na stránce vlastní kód? Napiš číslo řádku.

### --expected--

56

### --why--

Řádek 56 skládá HTML ze jména a textu komentáře a vkládá ho přes `innerHTML`. Obojí píše návštěvník, takže `<img src="x" onerror="…">` v komentáři se spustí každému, kdo stránku otevře. Bezpečně: `<strong>` vytvořit jako element a jméno i text vložit přes `textContent` nebo `append`.

### --see--

js-dom/strom-dom#text-a-html-textcontent-a-innerhtml

## --question--

Uživatel odešle tři komentáře za sebou a pak klikne na jméno autora. Kolikrát se spustí funkce posluchače z řádku 59?

### --expected--

4

### --accept--

4x
4krát

### --why--

`renderComments` přidává posluchač na seznam při každém zavolání a staré posluchače zůstávají: jednou po načtení (řádek 104) a pak po každém ze tří odeslání (řádek 99). Seznam jako prvek zůstává, mění se jen jeho obsah. Registrace patří mimo `renderComments`.

### --see--

js-dom/udalosti#posluchac-pridany-pri-kazdem-vykresleni

## --question--

Proč posluchač klávesnice po `renderStars()` na řádku 91 znovu volá `focus()`?

### --answer--

Aby stisknutá hvězdička dostala třídu `is-active`.

#### --why--

Třídu nastaví už `renderStars` podle `myRating`. Fokus s třídami nesouvisí.

### --correct--

`renderStars` přes `innerHTML` nahradí všechna tlačítka novými, takže fokus by s tím starým tlačítkem zmizel.

#### --why--

Nové tlačítko vypadá stejně, ale je to jiný uzel. Bez řádku 91 by uživatel klávesnice po první šipce ztratil fokus a další šipka by nic neudělala.

### --answer--

Protože `preventDefault` na řádku 87 fokus z tlačítka odebere.

#### --why--

`preventDefault` ruší jen výchozí akci klávesy (posun stránky). Fokus nemění.

### --see--

js-dom/udalosti#prekresleni-vezme-uzivateli-fokus
