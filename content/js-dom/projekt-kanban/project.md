---
title: Kanban tabule
---

# --description--

## Zadání

Studio Lipka z Olomouce dělá weby pro malé firmy a právě staví web pro Pekárnu U Mlýna.
Úkoly zatím visí na lístečcích na skříni: když kolega pracuje z domova, neví, co je
hotové, a lísteček „Nasadit web" už dvakrát spadl za topení. Studio chce jednoduchou
tabuli v prohlížeči — tři sloupce, karty, které se dají přidat, posouvat a mazat, a
filtr, jehož odkaz jde poslat kolegovi do chatu. Bez účtů, bez serveru, bez knihoven.

Tohle je samostatný projekt: žádné kroky, jen zadání. Všechno podstatné jsi psal ve
workshopech [Seznam úkolů na stěhování](see:js-dom/workshop-seznam-ukolu/001),
[Záložky a modální okno](see:js-dom/workshop-zalozky-a-dialog/001)
a [Filtr pokojových rostlin](see:js-dom/workshop-filtr-produktu/001).
Jediná novinka je přetažení myší — k ní vede odkaz v technických požadavcích.

## Jak začít

1. Klikni na **Začít projekt** a otevři složku projektu ve VS Code.
2. Piš do `script.js`. HTML s třemi sloupci, šablona karty `#card-template` a celý vzhled
   jsou hotové; data sloupců, štítků a ukázkových karet najdeš na začátku `script.js`.
3. Náhled vidíš tady v Akademii. Když máš hotový příběh, klikni na **Zkontrolovat**.
4. Na konci doplň do `README.md` oddíl „Rozhodnutí".

## Karta

| klíč | hodnota |
|---|---|
| `id` | jedinečný text, nesmí se opakovat |
| `title` | název karty, bez mezer na začátku a na konci |
| `label` | klíč štítku z `labelNames`: `design`, `frontend` nebo `obsah` |
| `column` | `id` sloupce z `columns`: `todo`, `doing` nebo `done` |

## Uživatelské příběhy

- Když uživatel otevře tabuli poprvé (v prohlížeči nic uloženého není), vidí ukázkové
  karty ze `sampleCards`, každou ve svém sloupci a ve stejném pořadí jako v datech.
  Karta ukazuje název a popisek štítku.
- U nadpisu každého sloupce svítí, kolik karet je v něm vidět. Sloupec, ve kterém
  žádná karta vidět není, ukáže hlášku „Zatím tu nic není".
- Když uživatel vyplní formulář **Nová karta** a odešle ho (tlačítkem i Enterem),
  přibude karta se zvoleným štítkem na konec sloupce K udělání. Pole s názvem se
  vyprázdní a zůstane v něm kurzor, aby šlo psát další kartu. Název jen z mezer kartu
  nepřidá. Stránka se odesláním nikdy znovu nenačte.
- Tlačítka → a ← na kartě ji přesunou na konec sousedního sloupce. Tlačítko, které by
  kartu posunulo mimo tabuli, je neaktivní. Po přesunu zůstane fokus na tlačítku
  přesunuté karty, aby šlo klávesnicí posouvat dál.
- Po každém přesunu (tlačítkem i přetažením) oznámí zpráva `#status`, kterou kartu
  a do kterého sloupce se přesunula.
- Tlačítko × kartu smaže. Fokus potom nezůstane ztracený na stránce.
- Kartu jde myší chytit a přetáhnout do jiného sloupce, i když ji uživatel pustí na
  jinou kartu v tom sloupci. Přetažená karta skončí na konci sloupce.
- Každé tlačítko na kartě má přístupný název s názvem karty („Přesunout Navrhnout logo
  doprava"), aby uživatel čtečky obrazovky věděl, co zmáčkne.
- Když uživatel píše do pole **Filtrovat karty**, vidí jen karty, jejichž název obsahuje
  hledaný text bez ohledu na velikost písmen. Filtr je v adrese stránky jako parametr
  `q`, takže odkaz s filtrem jde poslat — a psaní nepřidává záznamy do historie.
- Klávesa `/` kdekoli mimo textová pole skočí do filtru, `Escape` ve filtru ho vymaže.
- Karty přežijí obnovení stránky: přidané, přesunuté i smazané. Otevřený odkaz
  s parametrem `q` rovnou ukáže vyfiltrované karty a vyplněné pole filtru.
- Když jsou uložená data v prohlížeči poškozená, tabule začne s ukázkovými kartami
  a nespadne.
- Názvy karet se zobrazují jako text: značky v nich se nevykreslí ani nespustí.

> [!PITFALL]
> Příběh o fokusu po přesunu zní jako detail, ale nejčastěji neprojde. Když po přesunu
> překreslíš sloupce, tlačítko, na které uživatel klikl, ze stránky zmizí — a fokus
> s ním. Víš z lekce [Události](see:js-dom/udalosti#prekresleni-vezme-uzivateli-fokus),
> co s tím.

## Technické požadavky

- Pracuj se strukturou z `index.html`: sloupce `.column[data-column]` se seznamem
  `.column__list`, počtem `.column__count` a hláškou `.column__empty`; karty vyráběj
  ze šablony `#card-template` (karta má `data-id`, `.card__title`, `.card__label`
  a tlačítka s `data-action="left"`, `"right"` a `"delete"`). Vzhled štítku řídí
  atribut `data-label` na `.card__label`.
- Karty ukládej do `localStorage` pod klíčem z konstanty `STORAGE_KEY` jako JSON pole
  karet.
- Přetahování postav na [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API):
  karta má `draggable="true"` (je v šabloně), posluchače `dragstart`, `dragover` a `drop`.
  Na MDN si přečti hlavně, proč `dragover` musí volat `preventDefault()`. Třídy
  `is-dragging` a `is-drop-target` jsou v CSS připravené, testy je nevyžadují.
- Celý JavaScript zůstane v `script.js`, načtený s `defer` jako teď, a nečeká na
  `DOMContentLoaded`. Kontrola totiž obnovení stránky simuluje tak, že postaví `<body>`
  znovu z `index.html` a spustí `script.js` ještě jednou nad stejným úložištěm a adresou.

> [!TIP]
> Začni daty a funkcí `render()`, která z pole karet postaví všechny tři sloupce. Každá
> akce pak jen změní pole, uloží ho a zavolá `render()` — přesně jako v seznamu úkolů.

# --hints--

Po prvním načtení jsou ukázkové karty ve sloupcích podle `column`, v pořadí z `sampleCards`, s názvem a popiskem štítku.

```js
const titlesIn = (id) => [...document.querySelectorAll(`.column[data-column="${id}"] .card`)]
  .filter((card) => !card.hidden && getComputedStyle(card).display !== 'none')
  .map((card) => card.querySelector('.card__title')?.textContent.trim());
assert.deepEqual(titlesIn('todo'), ['Nafotit chleba a dorty do galerie', 'Formulář objednávky dortů', 'Nasadit web na hosting'], 'sloupec K udělání má po načtení ukazovat karty fotky, objednávka, hosting v pořadí ze sampleCards');
assert.deepEqual(titlesIn('doing'), ['Napsat texty o pekárně', 'Nakódovat hlavičku s menu'], 'sloupec Rozpracované má ukazovat texty a hlavičku');
assert.deepEqual(titlesIn('done'), ['Navrhnout logo'], 'sloupec Hotovo má ukazovat Navrhnout logo');
const logo = document.querySelector('.column[data-column="done"] .card');
assert.equal(logo.querySelector('.card__label')?.textContent.trim(), 'Design', 'karta Navrhnout logo má ve štítku popisek Design z labelNames');
assert.equal(logo.dataset.id, 'logo', 'karta má mít data-id podle id karty (logo)');
```

Každý sloupec ukazuje v `.column__count` počet svých karet a hláška „Zatím tu nic není" je skrytá, když sloupec karty má.

```js
const counts = [...document.querySelectorAll('.column')].map((column) => column.querySelector('.column__count').textContent.trim());
assert.deepEqual(counts, ['3', '2', '1'], 'počty ve sloupcích mají po načtení být 3, 2, 1');
const empties = [...document.querySelectorAll('.column__empty')].map((empty) => empty.hidden || getComputedStyle(empty).display === 'none');
assert.deepEqual(empties, [true, true, true], 'hláška .column__empty má být ve všech třech sloupcích skrytá, když v nich karty jsou');
```

Formulář přidá kartu se zvoleným štítkem na konec sloupce K udělání, vyprázdní pole a nechá v něm fokus; stránka se znovu nenačte.

```js
let prevented = null;
document.addEventListener('submit', (event) => {
  prevented = event.defaultPrevented;
  event.preventDefault();
});
const input = document.querySelector('#card-title');
input.focus();
await helpers.type(input, 'Texty na Instagram');
document.querySelector('#card-label').value = 'obsah';
await helpers.click(document.querySelector('#add-form [type="submit"]'));
assert.equal(prevented, true, 'odeslání formuláře má zavolat event.preventDefault(), jinak se stránka znovu načte');
const cards = [...document.querySelectorAll('.column[data-column="todo"] .card')];
const last = cards.at(-1);
assert.equal(cards.length, 4, 'po přidání má mít K udělání 4 karty, má ' + cards.length);
assert.equal(last.querySelector('.card__title').textContent.trim(), 'Texty na Instagram', 'nová karta „Texty na Instagram" má být na konci sloupce K udělání');
assert.equal(last.querySelector('.card__label').textContent.trim(), 'Obsah', 'nová karta má mít štítek Obsah, který byl vybraný ve formuláři');
assert.equal(document.querySelector('#card-title').value, '', 'pole s názvem má být po přidání prázdné');
assert.equal(document.activeElement, document.querySelector('#card-title'), 'po přidání má být fokus v poli s názvem');
assert.equal(document.querySelector('.column[data-column="todo"] .column__count').textContent.trim(), '4', 'počet u K udělání má být po přidání 4');
```

Název jen z mezer kartu nepřidá a název se uloží bez okrajových mezer.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const input = document.querySelector('#card-title');
input.value = '    ';
document.querySelector('#add-form').requestSubmit();
assert.equal(document.querySelectorAll('.card').length, 6, 'odeslání názvu ze samých mezer nemá přidat kartu');
input.value = '  Mapa s adresou pekárny  ';
document.querySelector('#add-form').requestSubmit();
const last = [...document.querySelectorAll('.column[data-column="todo"] .card')].at(-1);
assert.equal(last.querySelector('.card__title').textContent, 'Mapa s adresou pekárny', 'název „  Mapa s adresou pekárny  " se má uložit bez mezer na začátku a na konci');
```

Název karty se zobrazí jako text, značky v něm se nevykreslí ani nespustí.

```js
document.addEventListener('submit', (event) => event.preventDefault());
const attack = '<img src="x" onerror="document.body.dataset.hacked = 1">Banner';
document.querySelector('#card-title').value = attack;
document.querySelector('#add-form').requestSubmit();
await helpers.wait(200);
const last = [...document.querySelectorAll('.column[data-column="todo"] .card')].at(-1);
assert.equal(last.querySelector('img'), null, 'z názvu karty nesmí vzniknout element <img> — název vkládej jako text');
assert.equal(last.querySelector('.card__title').textContent, attack, 'název má být v kartě doslova i se značkou');
assert.equal(document.body.dataset.hacked, undefined, 'kód z názvu karty se nesmí spustit');
```

Tlačítko → přesune kartu na konec sousedního sloupce vpravo, tlačítko ← zpátky na konec sloupce vlevo.

```js
const titlesIn = (id) => [...document.querySelectorAll(`.column[data-column="${id}"] .card .card__title`)].map((title) => title.textContent.trim());
const find = (title) => [...document.querySelectorAll('.card')].find((card) => card.querySelector('.card__title').textContent.trim() === title);
await helpers.click(find('Nafotit chleba a dorty do galerie').querySelector('[data-action="right"]'));
assert.deepEqual(titlesIn('todo'), ['Formulář objednávky dortů', 'Nasadit web na hosting'], 'po → u karty fotky má z K udělání zmizet');
assert.deepEqual(titlesIn('doing'), ['Napsat texty o pekárně', 'Nakódovat hlavičku s menu', 'Nafotit chleba a dorty do galerie'], 'po → má být karta fotky na konci sloupce Rozpracované');
await helpers.click(find('Napsat texty o pekárně').querySelector('[data-action="left"]'));
assert.deepEqual(titlesIn('todo'), ['Formulář objednávky dortů', 'Nasadit web na hosting', 'Napsat texty o pekárně'], 'po ← u karty texty má být na konci sloupce K udělání');
assert.deepEqual(document.querySelectorAll('.column__count')[1].textContent.trim(), '2', 'počet u Rozpracované má po obou přesunech být 2');
```

Tlačítko, které by kartu posunulo mimo tabuli, je neaktivní; ostatní tlačítka přesunu aktivní jsou.

```js
const state = (id) => [...document.querySelectorAll(`.column[data-column="${id}"] .card`)].map((card) => [
  card.querySelector('[data-action="left"]').disabled,
  card.querySelector('[data-action="right"]').disabled,
]);
assert.ok(state('todo').every(([left, right]) => left === true && right === false), 've sloupci K udělání má být ← neaktivní (disabled) a → aktivní');
assert.ok(state('doing').every(([left, right]) => left === false && right === false), 've sloupci Rozpracované mají být obě tlačítka aktivní');
assert.ok(state('done').every(([left, right]) => left === false && right === true), 've sloupci Hotovo má být → neaktivní (disabled) a ← aktivní');
const logo = document.querySelector('.card[data-id="logo"]');
await helpers.click(logo.querySelector('[data-action="left"]'));
const moved = document.querySelector('.card[data-id="logo"]');
assert.equal(moved.querySelector('[data-action="right"]').disabled, false, 'po přesunu z Hotovo do Rozpracované má být → u karty logo zase aktivní');
```

Po přesunu tlačítkem zůstane fokus na tlačítku přesunuté karty.

```js
await helpers.click(document.querySelector('.card[data-id="hosting"] [data-action="right"]'));
let active = document.activeElement;
assert.ok(active?.matches('button') && active.closest('.card')?.dataset.id === 'hosting', 'po → u karty hosting má být fokus na tlačítku téže karty ve sloupci Rozpracované — překreslení tlačítko nahradilo novým?');
await helpers.click(active.closest('.card').querySelector('[data-action="right"]'));
active = document.activeElement;
assert.equal(active.closest('.card')?.dataset.id, 'hosting', 'i po druhém přesunu (do Hotovo) má fokus zůstat na tlačítku karty hosting');
assert.equal(active.closest('.column')?.dataset.column, 'done', 'karta s fokusem má být ve sloupci Hotovo');
```

Po přesunu oznámí `#status`, kterou kartu a do kterého sloupce přesunul.

```js
await helpers.click(document.querySelector('.card[data-id="texty"] [data-action="right"]'));
const text = document.querySelector('#status').textContent;
assert.ok(text.includes('Napsat texty o pekárně'), '#status má po přesunu obsahovat název karty „Napsat texty o pekárně", obsahuje: ' + JSON.stringify(text));
assert.ok(text.includes('Hotovo'), '#status má po přesunu obsahovat název cílového sloupce Hotovo, obsahuje: ' + JSON.stringify(text));
```

Tlačítko × kartu smaže; fokus nezůstane na `<body>` a vyprázdněný sloupec ukáže hlášku a počet 0.

```js
await helpers.click(document.querySelector('.card[data-id="logo"] [data-action="delete"]'));
assert.equal(document.querySelector('.card[data-id="logo"]'), null, 'po × u karty logo má karta zmizet');
const done = document.querySelector('.column[data-column="done"]');
assert.equal(done.querySelector('.column__count').textContent.trim(), '0', 'počet u Hotovo má být po smazání jediné karty 0');
const doneEmpty = done.querySelector('.column__empty');
assert.ok(!doneEmpty.hidden && getComputedStyle(doneEmpty).display !== 'none', 'prázdný sloupec Hotovo má ukázat hlášku .column__empty');
assert.notEqual(document.activeElement, document.body, 'po smazání karty má fokus přejít na smysluplné místo, ne zůstat ztracený na <body>');
assert.ok(document.activeElement?.isConnected, 'prvek s fokusem má být ve stránce');
```

Každé tlačítko na kartě je `<button>` s přístupným názvem, který obsahuje název karty.

```js
assert.ok(document.querySelectorAll('.card').length > 0, 'po načtení mají být na tabuli karty, na kterých jde tlačítka zkontrolovat');
for (const card of document.querySelectorAll('.card')) {
  const title = card.querySelector('.card__title').textContent.trim();
  for (const button of card.querySelectorAll('[data-action]')) {
    assert.equal(button.tagName, 'BUTTON', `akce ${button.dataset.action} na kartě „${title}" má být <button>`);
    const name = [button.getAttribute('aria-label'), button.getAttribute('title'), button.textContent].join(' ');
    assert.ok(name.includes(title), `tlačítko ${button.dataset.action} na kartě „${title}" má mít přístupný název s názvem karty (aria-label), má: ${JSON.stringify(name.trim())}`);
  }
}
```

Přetažení karty do jiného sloupce ji přesune na jeho konec, i když ji uživatel pustí na jinou kartu; `dragover` nad sloupcem volá `preventDefault()`.

```js
const titlesIn = (id) => [...document.querySelectorAll(`.column[data-column="${id}"] .card .card__title`)].map((title) => title.textContent.trim());
const drag = (card, target) => {
  const dataTransfer = new DataTransfer();
  const options = { bubbles: true, cancelable: true, dataTransfer };
  card.dispatchEvent(new DragEvent('dragstart', options));
  target.dispatchEvent(new DragEvent('dragenter', options));
  const over = new DragEvent('dragover', options);
  target.dispatchEvent(over);
  target.dispatchEvent(new DragEvent('drop', options));
  card.dispatchEvent(new DragEvent('dragend', options));
  return over.defaultPrevented;
};
const allowed = drag(document.querySelector('.card[data-id="objednavka"]'), document.querySelector('.column[data-column="done"] .column__list'));
await helpers.wait(0);
assert.equal(allowed, true, 'dragover nad sloupcem má volat event.preventDefault(), jinak prohlížeč puštění karty nedovolí');
assert.deepEqual(titlesIn('done'), ['Navrhnout logo', 'Formulář objednávky dortů'], 'po přetažení karty objednávka do Hotovo má být na konci sloupce Hotovo');
assert.ok(!titlesIn('todo').includes('Formulář objednávky dortů'), 'přetažená karta má ze sloupce K udělání zmizet');
drag(document.querySelector('.card[data-id="hosting"]'), document.querySelector('.card[data-id="texty"] .card__title'));
await helpers.wait(0);
assert.deepEqual(titlesIn('doing'), ['Napsat texty o pekárně', 'Nakódovat hlavičku s menu', 'Nasadit web na hosting'], 'kartu hosting puštěnou na kartu texty má tabule přesunout na konec sloupce Rozpracované');
assert.ok(document.querySelector('#status').textContent.includes('Nasadit web na hosting'), '#status má oznámit i přesun přetažením');
```

Filtr ukáže jen karty, jejichž název obsahuje hledaný text bez ohledu na velikost písmen, a počty ve sloupcích počítají jen viditelné karty.

```js
const visibleIn = (id) => [...document.querySelectorAll(`.column[data-column="${id}"] .card`)]
  .filter((card) => !card.hidden && getComputedStyle(card).display !== 'none')
  .map((card) => card.querySelector('.card__title').textContent.trim());
const filter = document.querySelector('#filter');
filter.focus();
await helpers.type(filter, 'DORT');
assert.deepEqual(visibleIn('todo'), ['Nafotit chleba a dorty do galerie', 'Formulář objednávky dortů'], 'po filtru „DORT" mají být v K udělání vidět jen karty s „dort" v názvu');
assert.deepEqual(visibleIn('doing'), [], 'po filtru „DORT" nemá být v Rozpracované vidět žádná karta');
const counts = [...document.querySelectorAll('.column__count')].map((count) => count.textContent.trim());
assert.deepEqual(counts, ['2', '0', '0'], 'počty mají po filtru „DORT" ukazovat viditelné karty: 2, 0, 0');
const doneEmpty = document.querySelector('.column[data-column="done"] .column__empty');
assert.ok(!doneEmpty.hidden && getComputedStyle(doneEmpty).display !== 'none', 'sloupec bez viditelných karet má ukázat hlášku .column__empty');
await helpers.type(filter, '');
filter.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
assert.equal(visibleIn('doing').length, 2, 'po smazání filtru mají být v Rozpracované zase vidět 2 karty');
```

Filtr je v adrese jako parametr `q`; psaní nepřidává záznamy do historie a prázdný filtr parametr odstraní.

```js
const before = history.length;
const filter = document.querySelector('#filter');
await helpers.type(filter, 'logo');
assert.equal(new URLSearchParams(location.search).get('q'), 'logo', 'po napsání „logo" má být v adrese q=logo, location.search je ' + JSON.stringify(location.search));
assert.equal(history.length, before, 'psaní do filtru nemá přidávat záznamy do historie — při psaní se adresa přepisuje');
await helpers.type(filter, '');
filter.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
assert.equal(new URLSearchParams(location.search).has('q'), false, 'prázdný filtr má parametr q z adresy odstranit');
```

Klávesa `/` mimo textová pole skočí do filtru, v poli s názvem karty nic nepřesune; `Escape` ve filtru ho vymaže.

```js
const filter = document.querySelector('#filter');
const title = document.querySelector('#card-title');
title.focus();
helpers.press(title, '/');
assert.equal(document.activeElement, title, 'klávesa / v poli s názvem karty nemá přesunout fokus');
document.activeElement.blur();
helpers.press(document.body, '/');
assert.equal(document.activeElement, filter, 'klávesa / mimo textová pole má přesunout fokus do filtru');
await helpers.type(filter, 'logo');
await helpers.press(filter, 'Escape');
await helpers.wait(0);
assert.equal(filter.value, '', 'Escape ve filtru má filtr vymazat');
assert.equal(document.querySelectorAll('.card').length, 6, 'po Escape mají být zase vidět všechny karty');
assert.equal(new URLSearchParams(location.search).has('q'), false, 'po Escape nemá být v adrese parametr q');
```

Přidané, přesunuté i smazané karty přežijí obnovení stránky.

```js
const reload = async (search = '') => {
  const url = new URL(location.href);
  url.search = search;
  history.replaceState(null, '', url);
  const fresh = new DOMParser().parseFromString(files['index.html'], 'text/html');
  document.body.replaceWith(document.adoptNode(fresh.body));
  new Function(files['script.js'])();
  await helpers.wait(20);
};
const titlesIn = (id) => [...document.querySelectorAll(`.column[data-column="${id}"] .card .card__title`)].map((title) => title.textContent.trim());
document.addEventListener('submit', (event) => event.preventDefault());
document.querySelector('#card-title').value = 'Mapa s adresou pekárny';
document.querySelector('#card-label').value = 'frontend';
document.querySelector('#add-form').requestSubmit();
await helpers.click(document.querySelector('.card[data-id="fotky"] [data-action="right"]'));
await helpers.click(document.querySelector('.card[data-id="logo"] [data-action="delete"]'));
const expected = { todo: titlesIn('todo'), doing: titlesIn('doing'), done: titlesIn('done') };
await reload();
assert.deepEqual({ todo: titlesIn('todo'), doing: titlesIn('doing'), done: titlesIn('done') }, expected, 'po obnovení stránky mají být karty ve stejných sloupcích a pořadí jako před ním (nová Mapa, přesunuté fotky, smazané logo) — ukládáš po každé změně do localStorage?');
const map = [...document.querySelectorAll('.card')].find((card) => card.querySelector('.card__title').textContent.trim() === 'Mapa s adresou pekárny');
assert.equal(map?.querySelector('.card__label').textContent.trim(), 'Frontend', 'přidaná karta si má po obnovení nechat štítek Frontend');
```

Odkaz s parametrem `q` po otevření ukáže vyplněné pole filtru a vyfiltrované karty.

```js
const reload = async (search = '') => {
  const url = new URL(location.href);
  url.search = search;
  history.replaceState(null, '', url);
  const fresh = new DOMParser().parseFromString(files['index.html'], 'text/html');
  document.body.replaceWith(document.adoptNode(fresh.body));
  new Function(files['script.js'])();
  await helpers.wait(20);
};
await reload('?q=nak');
const visible = [...document.querySelectorAll('.card')]
  .filter((card) => !card.hidden && getComputedStyle(card).display !== 'none')
  .map((card) => card.querySelector('.card__title').textContent.trim());
assert.equal(document.querySelector('#filter').value, 'nak', 'po otevření adresy ?q=nak má být v poli filtru „nak"');
assert.deepEqual(visible, ['Nakódovat hlavičku s menu'], 'po otevření adresy ?q=nak má být vidět jen karta Nakódovat hlavičku s menu');
```

Poškozená data v úložišti tabuli neshodí: začne s ukázkovými kartami.

```js
const reload = async (search = '') => {
  const url = new URL(location.href);
  url.search = search;
  history.replaceState(null, '', url);
  const fresh = new DOMParser().parseFromString(files['index.html'], 'text/html');
  document.body.replaceWith(document.adoptNode(fresh.body));
  new Function(files['script.js'])();
  await helpers.wait(20);
};
for (const broken of ['[object Object]', '{"cards":[]}', '[{"nazev":"Stará karta"}]']) {
  localStorage.setItem('kanban-cards', broken);
  try {
    await reload();
  } catch (error) {
    assert.fail(`s uloženými daty ${broken} tabule spadla: ${error.name}: ${error.message}`);
  }
  assert.equal(document.querySelectorAll('.card').length, 6, `s poškozenými daty ${broken} má tabule ukázat 6 ukázkových karet`);
}
```

# --help--

## --tip-- 1

Vykreslení pole dat do seznamu ze šablony jsi psal v [seznamu úkolů](see:js-dom/workshop-seznam-ukolu/006).
Tady máš seznamy tři: projdi sloupce `.column` a do každého vykresli jen karty, jejichž
`column` se shoduje s `data-column` sloupce. Počet a hlášku nastav ve stejném průchodu.

## --tip-- 6

Kam se karta přesune, poznáš z pořadí v poli `columns`: index sloupce karty plus nebo
minus jedna. „Na konec sloupce" znamená na konec pole karet — kartu z pole vyjmi a
přidej upravenou kopii za ostatní. Jedno tlačítko pro všechny karty je
[delegace](see:js-dom/udalosti#delegace-jeden-posluchac-pro-cely-seznam).

## --tip-- 8

Po `render()` najdi přesunutou kartu znovu podle `data-id` a zavolej `focus()` na jejím
tlačítku. Když je tlačítko ve stejném směru v novém sloupci neaktivní, fokus na něj
nejde — vezmi opačné.

## --tip-- 12

Pořadí událostí při přetažení: `dragstart` na kartě (zapamatuj si její `id`), `dragover`
nad sloupcem (tady `preventDefault()`), `drop` na sloupci. Cíl `drop` může být karta nebo
text v ní — sloupec najdeš přes `event.target.closest('.column')`.

## --tip-- 16

Stav, který se ukládá, načítej na začátku skriptu v jedné funkci s `try`/`catch` a
ověřením tvaru — vzor je v [Když úložiště zklame](see:js-dom/prohlizecova-api#kdyz-uloziste-zklame).
Do úložiště zapiš po každé změně karet, ne jen při přidání.

# --review--

Testy kontrolují, že tabule dělá, co má. Jestli je kód dobrý, zkontroluj sám — přesně na
tohle se ptá kolega při code review.

## --rubric--

- Zdroj pravdy je pole karet: žádná funkce nečte data zpátky z DOM (třeba názvy z `.card__title`).
- Každá akce (přidání, přesun, smazání) jen změní data, uloží je a zavolá vykreslení; ukládání je na jednom místě.
- Posluchače na tabuli se registrují jednou, ne při každém vykreslení.
- Názvy funkcí říkají, co dělají (`moveCard`, `renderColumn`), bez komentáře.
- Celou tabuli ovládneš jen klávesnicí a po každé akci víš, kde je fokus.
- `README.md` popisuje dvě až tři rozhodnutí, která jsi udělal, a proč.
- Víš, co bys příště udělal jinak.

## --extensions--

**Rozšíření bez testů**

- Přesun karty v rámci sloupce: tlačítka ↑ a ↓, nebo puštění karty mezi dvě jiné karty.
- Úprava názvu dvojklikem nebo klávesou Enter na kartě, s `Escape` pro zrušení.
- Filtr podle štítku jako druhý parametr adresy (`?stitek=design`), se záznamem do historie.
- Synchronizace mezi kartami prohlížeče přes událost `storage`.

**Rozšíření do portfolia**

- Nasazení na GitHub Pages nebo Netlify a odkaz v README.
- Vlastní sloupce: přidání, přejmenování a smazání sloupce, uložené spolu s kartami.
- README se snímkem obrazovky a oddílem „Přístupnost": co jsi vyzkoušel klávesnicí a čtečkou obrazovky.
- Export a import tabule do souboru JSON (`Blob` a `<input type="file">`).
