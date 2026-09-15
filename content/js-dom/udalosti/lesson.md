# Události

:::check pretest
Tlačítko **Koupit** leží uvnitř karty produktu. Posluchač kliknutí má tlačítko (vypíše `tlačítko`) i karta (vypíše `karta`). Co se vypíše, když uživatel klikne na tlačítko?

### --answer--

Jen `tlačítko` — kliknutí patří tomu prvku, na který uživatel klikl.

#### --why--

Tak to vypadá, ale kliknutí ve stromu jen tak nekončí. Kudy událost putuje, vysvětlí část o cestě události.

### --correct--

Nejdřív `tlačítko`, potom `karta`.

#### --why--

Událost po zásahu cíle probublá nahoru přes všechny předky. Proč na tom stojí polovina interaktivních webů, uvidíš v části o delegaci.

### --answer--

Nejdřív `karta`, potom `tlačítko` — karta je vnější prvek.

#### --why--

Vnější prvek má svou chvíli dřív jen ve zvláštním režimu. Jak to je normálně, vysvětlí část o cestě události.
:::

:::check pretest
V tlačítku je ikona `<span class="icon">` a posluchač kliknutí je na tlačítku. Uživatel klikne přesně na ikonu. Na který prvek ukazuje `event.target`?

### --answer--

Na tlačítko, protože posluchač je na tlačítku.

#### --why--

Prvek s posluchačem je v jiné vlastnosti objektu události. Kterou, uvidíš v části o `target` a `currentTarget`.

### --correct--

Na ikonu `<span>`.

#### --why--

`target` je nejhlubší prvek, na který uživatel skutečně klikl. Proč z toho vzniká častá chyba, vysvětlí část o `target` a `currentTarget`.
:::

Rozbalovací menu, které se zavře kliknutím vedle. Karta produktu, na kterou jde kliknout, i když obsahuje tlačítko „Do košíku". Klávesová zkratka `/` pro vyhledávání. Posuvník, který táhneš myší i prstem. Všechno tohle jsou posluchače událostí — a skoro všechny chyby v nich vznikají z toho, že autor neví, **kudy událost stromem putuje**.

> [!REMEMBER]
> **Událost vznikne na jednom prvku a pak projde stromem: od `document` dolů k cíli a zase nahoru přes všechny předky.** Posluchač na kterémkoli prvku té cesty ji zachytí.

## Posluchač: `addEventListener`

Posluchač (*event listener*) je funkce, kterou prohlížeč zavolá, když na prvku nastane událost:

```js
button.addEventListener('click', (event) => {
  console.log(event.type);
});
```

- první argument je jméno události (`click`, `input`, `submit`, `keydown`…), bez předpony `on`,
- druhý je **funkce** — ne její výsledek. Prohlížeč ji zavolá sám a předá jí [[objekt události]] (*event*) s podrobnostmi,
- třetí jsou volby, nejčastěji `{ once: true }` (posluchač se po prvním zavolání sám odebere) a `{ signal }` (viz níž).

Jeden prvek může mít kolik chceš posluchačů téže události a spustí se v pořadí, v jakém je přidáš. Proto `addEventListener`, ne starší `button.onclick = …`, které druhým přiřazením první funkci přepíše.

:::live
```html
<button class="subscribe">Odebírat novinky</button>
<p class="note"></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.subscribe { font: inherit; padding: 0.6rem 1rem; border: 0; border-radius: 0.5rem; background: #4338ca; color: white; cursor: pointer; transition: background-color 0.2s; }
.subscribe:disabled { background: #a5b4fc; cursor: default; }
```
```js
const button = document.querySelector('.subscribe');
const note = document.querySelector('.note');

button.addEventListener('click', (event) => {
  event.currentTarget.disabled = true;
  note.textContent = 'Díky, první číslo ti pošleme v pondělí.';
}, { once: true });
```
:::

Klikni na tlačítko. Pak zkus smazat `event.currentTarget.disabled = true;`, klikni víckrát a sleduj, jestli se text píše znovu. Nepíše — `once` posluchač po prvním kliknutí odebral.

Posluchač odebereš dvěma způsoby. `removeEventListener('click', handler)` potřebuje **tutéž funkci**, kterou jsi přidal, takže ji musíš mít uloženou v proměnné. Pohodlnější je `AbortController`: jeho `signal` předáš do voleb a jedno `controller.abort()` odebere všechny posluchače s tímhle signálem najednou. Hodí se, když zavíráš dialog nebo odcházíš ze stránky aplikace.

:::check
Co je na tomhle řádku špatně?

```js
saveButton.addEventListener('click', saveDraft());
```

### --answer--

Nic, `saveDraft` se zavolá po kliknutí.

#### --why--

Závorky za jménem funkci volají hned, když se řádek provede. Co pak dostane `addEventListener`?

### --correct--

`saveDraft()` se zavolá hned při registraci a posluchačem se stane jeho návratová hodnota.

#### --why--

Posluchači se předává funkce: `addEventListener('click', saveDraft)` nebo `addEventListener('click', () => saveDraft())`.

### --answer--

Jméno události se musí psát `onclick`.

#### --why--

`addEventListener` bere jméno bez `on`. Předponu mají jen vlastnosti jako `button.onclick`.

### --see--

js-dom/udalosti#posluchac-addeventlistener
:::

## Cesta události: zachycení, cíl, probublání

Když uživatel klikne na tlačítko v kartě, událost neprojde jen tlačítkem. Prohlížeč spočítá cestu od `document` k cíli a projde ji ve třech fázích:

1. **zachycení** (*capturing*) — od `document` dolů přes předky k cíli,
2. **cíl** (*target*) — posluchače na samotném prvku, na který se kliklo,
3. **probublání** (*bubbling*) — od cíle zpátky nahoru až k `document`.

Běžný posluchač se spouští v cíli a při [[probublávání|probublání]]. Při zachycení jen ten, kdo o to požádá volbou `{ capture: true }`. Než spustíš ukázku, tipni si:

:::live js predict
```js
// Stránka: karta s tlačítkem uvnitř.
document.body.innerHTML = '<article class="card"><button class="buy">Koupit</button></article>';
const card = document.querySelector('.card');
const button = document.querySelector('.buy');

card.addEventListener('click', () => console.log('karta'));
button.addEventListener('click', () => console.log('tlačítko'));
document.body.addEventListener('click', () => console.log('body'));
card.addEventListener('click', () => console.log('karta při zachycení'), { capture: true });

button.click();
```
--question-- V jakém pořadí se vypíšou řádky? Napiš každý na nový řádek.
--expected--
```text
karta při zachycení
tlačítko
karta
body
```
--why-- Cesta vede shora dolů a zase nahoru. Posluchač s `capture: true` na kartě běží při cestě dolů, ještě před cílem. Pak přijde na řadu tlačítko (cíl) a při probublání karta a `body`. Na pořadí, v jakém jsi posluchače přidal, tady nezáleží — rozhoduje poloha prvku ve stromu. Zkus smazat `{ capture: true }` a sleduj, kam se řádek přesune.
:::

> [!REMEMBER]
> **Běžný posluchač na předkovi zachytí i kliknutí na jeho potomky.** Tomu se říká [[probublávání]] a stojí na něm delegace.

Probublává skoro všechno, s čím pracuješ: `click`, `input`, `change`, `submit`, `keydown`, `pointerdown`. Výjimky, na které narazíš: `focus` a `blur` neprobublávají (jejich probublávající dvojčata jsou `focusin` a `focusout`) a `mouseenter` s `mouseleave` také ne.

:::check
V `<ul class="menu">` jsou odkazy a posluchač `click` je jen na `ul`. Spustí se, když uživatel klikne na jeden z odkazů?

### --correct--

Ano, kliknutí z odkazu probublá do `ul`.

#### --why--

Posluchač bez `capture` se spouští při probublání a `ul` leží na cestě od odkazu k `document`.

### --answer--

Ne, posluchač se spustí jen po kliknutí na volné místo v `ul`.

#### --why--

Myslíš si, že událost patří jen cíli? Po zásahu cíle projde i všemi předky.

### --answer--

Jen když posluchač přidáš s `{ capture: true }`.

#### --why--

`capture` mění jen fázi, ve které posluchač běží. Zachytí ho i běžný posluchač, jen o chvilku později.

### --see--

js-dom/udalosti#cesta-udalosti-zachyceni-cil-probublani
:::

## `target` a `currentTarget`

Objekt události nese dvě vlastnosti, které se pletou:

- `event.target` — prvek, kde událost **vznikla**: nejhlubší prvek, na který uživatel klikl,
- `event.currentTarget` — prvek, **jehož posluchač právě běží**.

Když uživatel klikne na tlačítko bez ničeho uvnitř, jsou oba stejné. Jakmile má tlačítko uvnitř ikonu, obrázek nebo `<strong>`, `target` je ten vnitřní prvek.

:::live
```html
<button class="like" data-post-id="17">
  <svg class="like__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5.5 5.5 5.5 0 0 1 21.5 12C19 16.5 12 21 12 21z" fill="currentColor"/></svg>
  <span>To se mi líbí</span>
</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.like { display: inline-flex; align-items: center; gap: 0.5rem; font: inherit; padding: 0.6rem 1rem; border: 1px solid #fda4af; border-radius: 999px; background: #fff1f2; color: #be123c; cursor: pointer; }
```
```js
const button = document.querySelector('.like');

button.addEventListener('click', (event) => {
  console.log('target:', event.target.tagName);
  console.log('currentTarget:', event.currentTarget.tagName);
  console.log('id z target:', event.target.dataset.postId);
});
```
:::

Klikni jednou na srdce, jednou na text a jednou na okraj tlačítka a porovnej výpisy. Když kliknutí trefí `svg`, `path` nebo `span`, přečte `event.target.dataset.postId` hodnotu `undefined` — `data-post-id` má jen tlačítko. Zkus v posledním výpisu napsat `event.currentTarget.dataset.postId`.

> [!PITFALL]
> **`event.target.dataset.id` je občas `undefined`.** Příznak: kliknutí na okraj tlačítka funguje, kliknutí na ikonu nebo text uvnitř ne. Oprava: v posluchači na prvku čti `event.currentTarget`, v delegaci hledej prvek přes `event.target.closest('[data-id]')`.

:::check
Posluchač je přímo na tlačítku `<button data-size="xl">` a uvnitř tlačítka je `<strong>XL</strong>`. Napiš výraz, který spolehlivě přečte `data-size` bez ohledu na to, kam uživatel v tlačítku klikl.

### --expected--

event.currentTarget.dataset.size

### --accept--

event.target.closest('[data-size]').dataset.size
event.target.closest('button').dataset.size
event.currentTarget.getAttribute('data-size')

### --why--

`currentTarget` je prvek s posluchačem, tedy vždycky tlačítko. `event.target` by při kliknutí na `<strong>` ukazoval na `<strong>`, který `data-size` nemá.

### --see--

js-dom/udalosti#target-a-currenttarget
:::

## `preventDefault` a `stopPropagation`

Dvě metody objektu události, které začátečníci zaměňují, a přitom dělají ==každá něco jiného==:

| metoda | co zruší | typické použití |
|---|---|---|
| `event.preventDefault()` | **[[výchozí akce|výchozí akci]] prohlížeče** — odeslání formuláře, přechod na odkaz, zaškrtnutí políčka, posun stránky šipkou | formulář zpracovaný v JavaScriptu, vlastní ovládání klávesnicí |
| `event.stopPropagation()` | **další cestu události** — posluchače na předcích se nespustí | skoro nikdy; jen když by předek na událost reagoval nesmyslně |

`preventDefault` nezastaví probublání a `stopPropagation` nezruší výchozí akci. Jedno s druhým nesouvisí.

:::live js predict
```js
document.body.innerHTML = '<div class="row"><a class="link" href="#detail">Detail</a></div>';
const row = document.querySelector('.row');
const link = document.querySelector('.link');

row.addEventListener('click', () => console.log('řádek'));
link.addEventListener('click', (event) => {
  event.preventDefault();
  console.log('odkaz');
});

link.click();
console.log(location.hash === '#detail');
```
--question-- Co se vypíše? Každý výpis na nový řádek.
--expected--
```text
odkaz
řádek
false
```
--why-- `preventDefault` zrušil přechod na `#detail`, a proto `location.hash` zůstal prázdný a poslední výpis je `false`. Probublání ale nezastavil, takže posluchač řádku se spustil. Zkus místo `preventDefault()` napsat `stopPropagation()` a sleduj oba rozdíly.
:::

> [!PITFALL]
> **`stopPropagation` rozbije cizí posluchače.** Typicky rozbalovací menu, které se zavírá posluchačem na `document` („klik mimo menu"): když karta uvnitř stránky zastaví probublání, menu se po kliknutí na kartu nezavře. Místo zastavení se v posluchači předka zeptej, odkud událost přišla (`event.target.closest(…)`).

:::check
Formulář hledání se zpracovává v JavaScriptu a stránka se po odeslání nemá znovu načíst. Co zavoláš v posluchači `submit`?

### --correct--

`event.preventDefault()`

#### --why--

Znovunačtení je výchozí akce odeslání formuláře a výchozí akci ruší `preventDefault`.

### --answer--

`event.stopPropagation()`

#### --why--

`stopPropagation` zastaví jen cestu události k předkům. Formulář se odešle dál.

### --answer--

`return false` na konci posluchače.

#### --why--

`return false` rušilo výchozí akci jen u starého zápisu `form.onsubmit = …`. Návratovou hodnotu funkce z `addEventListener` prohlížeč ignoruje.

### --see--

js-dom/udalosti#preventdefault-a-stoppropagation
:::

## Delegace: jeden posluchač pro celý seznam

Seznam produktů má u každé položky tlačítka **Oblíbené** a **Odebrat** a položky přibývají. Kdybys dával posluchač každému tlačítku, musel bys ho přidat i každé nové položce a hlídat, aby se nepřidal dvakrát.

[[delegace událostí|Delegace]] (*event delegation*) obrací postup: **jeden posluchač na společném předkovi** a v něm zjistíš, na co se kliklo. Díky probublání k němu dojde kliknutí z jakékoli položky, i z té přidané později.

:::live
```html
<ul class="wishlist">
  <li data-id="1"><span>Osadníci z Katanu</span> <button data-action="remove"><span aria-hidden="true">✕</span> Odebrat</button></li>
  <li data-id="2"><span>Krycí jména</span> <button data-action="remove"><span aria-hidden="true">✕</span> Odebrat</button></li>
</ul>
<button class="add">Přidat Dixit</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.wishlist { padding: 0; list-style: none; max-width: 22rem; }
.wishlist li { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0; }
button { font: inherit; padding: 0.3rem 0.7rem; border-radius: 0.4rem; border: 1px solid #cbd5e1; background: white; cursor: pointer; }
```
```js
const list = document.querySelector('.wishlist');

list.addEventListener('click', (event) => {
  // 1. najdi tlačítko s akcí, i když klik trefil span uvnitř
  const button = event.target.closest('[data-action]');
  // 2. klik mimo tlačítka (nebo mimo tenhle seznam) nás nezajímá
  if (!button || !list.contains(button)) return;
  // 3. najdi položku a proveď akci
  const item = button.closest('li');
  console.log('odebírám', item.dataset.id);
  item.remove();
});

document.querySelector('.add').addEventListener('click', () => {
  const item = document.createElement('li');
  item.dataset.id = '3';
  const name = document.createElement('span');
  name.textContent = 'Dixit';
  const remove = document.createElement('button');
  remove.dataset.action = 'remove';
  remove.textContent = 'Odebrat';
  item.append(name, ' ', remove);
  list.append(item);
});
```
:::

Klikni na **Přidat Dixit** a pak na jeho **Odebrat**. Nový řádek žádný vlastní posluchač nedostal, a přesto funguje. Zkus v posluchači seznamu nahradit `event.target.closest('[data-action]')` za `event.target` a klikni na křížek ✕ místo na slovo.

> [!REMEMBER]
> **Delegace = posluchač na předkovi + `event.target.closest(selektor)`.** Funguje i pro prvky přidané později a po překreslení seznamu nemusíš nic registrovat znovu.

:::explain
Vysvětli vlastními slovy, proč jeden posluchač na `<ul>` obslouží tlačítka ve všech položkách, i v těch přidaných až po jeho registraci.

## --model--

Kliknutí na tlačítko v položce po zásahu cíle probublá nahoru přes `li` až k `ul`, takže posluchač na `ul` se spustí pro jakékoli kliknutí uvnitř. V posluchači přes `event.target.closest('[data-action]')` zjistím, jestli a na jaké tlačítko se kliklo. Posluchač je na seznamu, ne na položkách, a proto mu nevadí, že položky vznikly později nebo že se seznam překreslil.

## --checklist--

- Kliknutí probublá z tlačítka nahoru až k seznamu.
- Posluchač na předkovi proto zachytí kliknutí z kteréhokoli potomka.
- Konkrétní tlačítko najde `event.target.closest(…)`.
- Nové položky nepotřebují vlastní posluchač, protože je na seznamu.
:::

:::check
V delegaci na seznamu úkolů chceš najít `<li>`, ve kterém uživatel klikl na cokoli. Proč `event.target.closest('li')` a ne `event.target.parentElement`?

### --answer--

`parentElement` v posluchači nefunguje, vrací vždycky `null`.

#### --why--

`parentElement` funguje, vrací rodiče. Problém je v tom, kolik úrovní mezi cílem a `<li>` leží.

### --correct--

Cíl může ležet v `li` libovolně hluboko (ikona v tlačítku), `closest` najde `li` přes kolik úrovní chce.

#### --why--

`parentElement` je vždycky o úroveň výš. Při kliknutí na ikonu v tlačítku by vrátil tlačítko, ne položku.

### --answer--

`closest` je rychlejší, jinak jsou stejné.

#### --why--

Nejde o rychlost. Liší se výsledkem, když cíl není přímým potomkem `li`.

### --see--

js-dom/udalosti#delegace-jeden-posluchac-pro-cely-seznam
:::

## Klávesnice

Klávesy hlásí události `keydown` (klávesa dolů, opakuje se při držení) a `keyup`. Z objektu události budeš číst hlavně:

- `event.key` — **co klávesa znamená**: `'Enter'`, `'Escape'`, `'ArrowDown'`, `' '` (mezerník), `'a'`, `'/'`. Respektuje rozložení klávesnice, takže na české klávesnici platí i pro `'ě'`,
- `event.code` — **fyzická klávesa**: `'KeyZ'` je stejné místo na české i anglické klávesnici. Hodí se pro hry (WASD), ne pro zkratky s písmeny,
- `event.ctrlKey`, `event.metaKey` (Cmd na Macu), `event.shiftKey`, `event.altKey`,
- `event.repeat` — `true` u opakovaných `keydown` při držení.

Starší kód používá `event.keyCode` s čísly (`13` pro Enter). Je zastaralý, nepoužívej ho.

**Zadarmo dostaneš klávesnici jen u správných prvků.** `<button>` se aktivuje Enterem i mezerníkem, `<a href>` Enterem, formulář odešle Enter v poli — všechno to vyvolá `click` nebo `submit` samo. Když postavíš „tlačítko" z `<div>`, klávesnicí na něj nikdo ani nepřejde.

:::live
```html
<label>Hledat hru <input class="search" type="search" placeholder="Stiskni / kdekoli na stránce"></label>
<p>Zkratky: <kbd>/</kbd> hledání, <kbd>Esc</kbd> vymaže hledání.</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.search { font: inherit; padding: 0.5rem 0.75rem; margin-left: 0.5rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; width: 16rem; }
kbd { padding: 0.1rem 0.4rem; border: 1px solid #cbd5e1; border-bottom-width: 2px; border-radius: 0.3rem; background: #f8fafc; }
```
```js
const search = document.querySelector('.search');

document.addEventListener('keydown', (event) => {
  // 1. když uživatel píše do pole, zkratky nepleť
  const typing = event.target.closest('input, textarea, select, [contenteditable]');

  // 2. "/" skočí do hledání a nenapíše lomítko
  if (event.key === '/' && !typing) {
    event.preventDefault();
    search.focus();
  }

  // 3. Escape v hledání pole vymaže
  if (event.key === 'Escape' && event.target === search) {
    search.value = '';
  }
});
```
:::

Klikni do náhledu mimo pole a stiskni `/`. Pak napiš něco a stiskni `Esc`. Zkus smazat `event.preventDefault()` a sleduj, co se po `/` objeví v poli.

> [!TIP]
> Zkratky s písmeny nedávej na samotné písmeno bez modifikátoru — lidem se čtečkou obrazovky a hlasovým ovládáním by kolidovaly s vlastními příkazy. Samotné `/`, `?` a `Escape` jsou zavedené.

:::check
Posluchač má reagovat na šipku doleva. Napiš podmínku do `if`.

### --expected--

event.key === 'ArrowLeft'

### --accept--

event.key == 'ArrowLeft'
'ArrowLeft' === event.key
event.code === 'ArrowLeft'

### --why--

Šipky mají v `event.key` jména `ArrowLeft`, `ArrowRight`, `ArrowUp` a `ArrowDown`. U šipek dává `event.code` stejnou hodnotu, u písmen se ale liší podle rozložení klávesnice.

### --see--

js-dom/udalosti#klavesnice
:::

## Myš, prst a pero: `pointer` události

Na telefonu nikdo neklikne myší. Události `pointerdown`, `pointermove`, `pointerup` a `pointercancel` sjednocují myš, dotyk i pero do jedné sady, `event.pointerType` řekne, co to bylo (`'mouse'`, `'touch'`, `'pen'`). Starší `mousedown` a `touchstart` potřebuješ jen ve starém kódu.

Na tlačítka a odkazy dál používej `click` — přijde po myši, dotyku i Enteru. Pointer události jsou pro **tažení**: posuvník, kreslení, přesouvání karet. Pro ně je klíčové `element.setPointerCapture(event.pointerId)`: prvek pak dostává `pointermove` i ve chvíli, kdy s ním uživatel vyjede mimo, takže tažení se neutrhne.

:::live
```html
<div class="volume">
  <div class="volume__track"><div class="volume__thumb" tabindex="0" role="slider" aria-label="Hlasitost" aria-valuemin="0" aria-valuemax="100" aria-valuenow="40"></div></div>
  <output class="volume__value">40 %</output>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 2rem 1rem; }
.volume { display: flex; align-items: center; gap: 1rem; }
.volume__track { position: relative; width: 16rem; height: 0.4rem; border-radius: 999px; background: #e2e8f0; touch-action: none; }
.volume__thumb { position: absolute; top: 50%; left: 40%; width: 1.4rem; height: 1.4rem; translate: -50% -50%; border-radius: 50%; background: #0f766e; box-shadow: 0 2px 6px rgb(0 0 0 / 0.25); cursor: grab; }
.volume__thumb:active { cursor: grabbing; scale: 1.15; }
```
```js
const track = document.querySelector('.volume__track');
const thumb = document.querySelector('.volume__thumb');
const output = document.querySelector('.volume__value');

function setFromPointer(event) {
  const box = track.getBoundingClientRect();
  const ratio = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
  const percent = Math.round(ratio * 100);
  thumb.style.left = `${percent}%`;
  thumb.setAttribute('aria-valuenow', percent);
  output.textContent = `${percent} %`;
}

thumb.addEventListener('pointerdown', (event) => {
  thumb.setPointerCapture(event.pointerId);
  thumb.addEventListener('pointermove', setFromPointer);
});

thumb.addEventListener('pointerup', () => {
  thumb.removeEventListener('pointermove', setFromPointer);
});
```
:::

Chyť kolečko a táhni ho, klidně i daleko pod posuvník. Pak zkus smazat řádek se `setPointerCapture` a táhni znovu mimo lištu. Všimni si i `removeEventListener`: funguje, protože dostane tutéž funkci `setFromPointer`, kterou `addEventListener` přidal.

:::check
Přetahování karty funguje myší, ale na telefonu se místo přetažení posouvá celá stránka. Karta přitom používá `pointerdown` a `pointermove`. Co chybí?

### --answer--

Posluchače `touchstart` a `touchmove`, pointer události dotyk nehlásí.

#### --why--

Pointer události hlásí myš, dotyk i pero. Problém je v tom, co s dotykem udělá prohlížeč sám.

### --correct--

CSS `touch-action: none` na kartě, aby prohlížeč tah prstem nepoužil na posun stránky.

#### --why--

Tah prstem je pro prohlížeč výchozí gesto posunu. `touch-action: none` mu řekne, že gesta nad prvkem řídí stránka sama — jako v ukázce na liště posuvníku.

### --answer--

Volba `{ passive: true }` u posluchače.

#### --why--

`passive: true` naopak slibuje, že posluchač výchozí chování rušit nebude. Posun stránky by to nevypnulo.

### --see--

js-dom/udalosti#mys-prst-a-pero-pointer-udalosti
:::

## Vlastní události: `CustomEvent`

Události nemusí vznikat jen z myši a klávesnice. Když má část stránky ohlásit „něco se stalo" a nechceš, aby znala všechny, koho to zajímá, vyšle vlastní událost:

```js
// widget košíku ohlásí změnu
cartElement.dispatchEvent(new CustomEvent('cart:change', {
  bubbles: true,
  detail: { count: 3 },
}));

// hlavička poslouchá kdekoli výš ve stromu
document.addEventListener('cart:change', (event) => {
  badge.textContent = event.detail.count;
});
```

Data jdou v `detail`. Bez `bubbles: true` by vlastní událost **neprobublala** — `new Event` i `new CustomEvent` mají `bubbles` ve výchozím stavu `false`, na rozdíl od kliknutí z prohlížeče. Jméno si vymysli, jen ho nepojmenuj jako vestavěnou událost. Dvojtečka nebo pomlčka (`cart:change`) kolizím předejde.

:::live js predict
```js
document.body.innerHTML = '<header><div class="cart"></div></header>';
const cart = document.querySelector('.cart');

document.addEventListener('cart:change', (event) => console.log('dokument:', event.detail.count));
cart.addEventListener('cart:change', (event) => console.log('košík:', event.detail.count));

cart.dispatchEvent(new CustomEvent('cart:change', { detail: { count: 2 } }));
```
--question-- Co se vypíše?
--expected-- košík: 2
--why-- Událost bez `bubbles: true` zasáhne jen cíl a dál nepokračuje, takže posluchač na `document` se nespustí. Přidej do voleb `bubbles: true` a sleduj druhý řádek.
:::

:::check
Jaké volby musí mít `new CustomEvent('filter:change', …)`, aby ji zachytil posluchač na `document`, když ji vyšle prvek hluboko ve stránce? Napiš objekt voleb (bez `detail`).

### --expected--

{ bubbles: true }

### --why--

Vlastní události ve výchozím stavu neprobublávají. S `bubbles: true` projdou od cíle nahoru jako kliknutí.

### --see--

js-dom/udalosti#vlastni-udalosti-customevent
:::

## Typické chyby a pasti

### Posluchač přidaný při každém vykreslení

> [!PITFALL]
> **Akce se po každém překreslení provede jednou víc.** Příznak: první kliknutí smaže jednu položku, po další změně dvě, pak tři. Příčina: `list.addEventListener(…)` je uvnitř funkce `render()`, a tak seznam dostává nový posluchač při každém vykreslení, zatímco staré zůstávají. Oprava: posluchač na kontejner zaregistruj **jednou** mimo `render()`; posluchače na nově vytvořené prvky přidávej jen ve funkci, která je vytváří.

### `removeEventListener` s novou funkcí

:::live js predict
```js
document.body.innerHTML = '<button>Uložit</button>';
const button = document.querySelector('button');
let saves = 0;

button.addEventListener('click', () => saves++);
button.removeEventListener('click', () => saves++);

button.click();
console.log(saves);
```
--question-- Co vypíše `console.log(saves)`?
--expected-- 1
--why-- Každá šipková funkce je nový objekt. `removeEventListener` dostal jinou funkci, než jakou `addEventListener` přidal, takže nic neodebral a posluchač se po kliknutí spustil. Funkci si ulož do proměnné (`const onClick = () => saves++`) a předej ji oběma voláním — nebo použij `{ once: true }` či `AbortController`.
:::

> [!PITFALL]
> **`removeEventListener` nic neodebere.** Příznak: posluchač běží dál, žádná chyba. Příčina: předaná funkce není **tatáž** jako při přidání (nová šipková funkce, `handler.bind(this)` zavolané znovu). Oprava: funkci ulož do proměnné, nebo použij volbu `signal` s `AbortController`.

### Kliknutí na `<div>` bez klávesnice

> [!PITFALL]
> **Na „tlačítko" z `<div>` nejde přejít klávesou Tab ani ho zmáčknout Enterem.** Příznak: myší to funguje, z klávesnice ne, a čtečka ho neohlásí jako tlačítko. Oprava: použij `<button type="button">`. Klávesnici, fokus i roli dostaneš zadarmo.

### Překreslení vezme uživateli fokus

> [!PITFALL]
> **Po prvním písmenu nebo kliknutí zmizí kurzor a klávesnicí se nedá pokračovat.** Příčina: vykreslení nahradí prvek, na kterém byl fokus, novým (`replaceChildren`, `replaceWith`, `innerHTML` nad jeho předkem). Nový prvek může vypadat stejně, ale je to jiný uzel a fokus s tím starým zmizel na `body`. Příznak je nejhorší u polí formuláře a u tlačítek v překreslovaném seznamu. Oprava: prvky, se kterými uživatel právě pracuje, neničí — překresluj jen to, co se změnilo (seznam výsledků, ne pole hledání), a u tlačítka změň jen jeho atribut. Když překreslení opravdu potřebuješ, vrať fokus na nový prvek přes `focus()`.

### Delegace chytá i cizí prvky

> [!PITFALL]
> **`closest` najde prvek i mimo tvůj kontejner.** `event.target.closest('li')` hledá až ke kořeni dokumentu. Když je seznam sám uvnitř jiného `li` (vnořené menu), najde i ten vnější. Oprava: po `closest` ověř `container.contains(found)`, jako v ukázce delegace.

:::check
Ve funkci `render()` je řádek `list.addEventListener('click', onListClick)` a `render()` se volá po každé změně dat. Proč se smazání po třetím překreslení provede třikrát?

### --answer--

Protože `onListClick` je šipková funkce.

#### --why--

Na tvaru funkce tady nezáleží. Rozhoduje, kolikrát se posluchač přidá.

### --correct--

Každé zavolání `render()` přidá seznamu další posluchač a staré zůstávají.

#### --why--

Seznam jako prvek po překreslení zůstává, mění se jen jeho obsah. Registrace patří mimo `render()`, jednou.

### --answer--

Protože kliknutí probublá z položky do seznamu třikrát.

#### --why--

Každá událost projde cestou jen jednou. Třikrát se spustí jen tehdy, když na seznamu visí tři posluchače.

### --see--

js-dom/udalosti#posluchac-pridany-pri-kazdem-vykresleni
:::

Příště z toho postavíš přístupné záložky a modální okno: delegaci na liště záložek, ovládání šipkami a zavírání dialogu klávesou Escape.

## Kde to najdeš v MDN

- [Introduction to events](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) — základy posluchačů a objektu události s interaktivními ukázkami.
- [Event bubbling](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling) — probublání, zachycení, `target` a delegace krok za krokem.
- [EventTarget.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) — všechny volby (`once`, `capture`, `passive`, `signal`) a oddíl o tom, proč `removeEventListener` potřebuje tutéž funkci.
- [KeyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) — tabulka jmen kláves a rozdíl proti `code`.

# --questions--

## --question--

Co vypíše tenhle kód po kliknutí na odkaz?

```js
document.body.innerHTML = '<nav><a href="#kontakt">Kontakt</a></nav>';
const nav = document.querySelector('nav');
nav.addEventListener('click', (event) => {
  console.log(event.target.tagName, event.currentTarget.tagName);
});
document.querySelector('a').click();
```

### --expected--

A NAV

### --why--

`target` je prvek, kde kliknutí vzniklo — odkaz `A`. `currentTarget` je prvek, jehož posluchač běží — `NAV`. `tagName` vrací jméno značky velkými písmeny.

### --see--

js-dom/udalosti#target-a-currenttarget

## --question--

Rozbalovací menu se zavírá posluchačem `click` na `document`, když kliknutí nepřišlo z menu. Kolega do karty produktu přidal `event.stopPropagation()`. Co se stane?

### --answer--

Nic, `stopPropagation` ovlivní jen kartu samotnou.

#### --why--

`stopPropagation` zastaví cestu události ke všem předkům, tedy i k `document`.

### --correct--

Kliknutí na kartu menu nezavře, protože událost už k `document` nedojde.

#### --why--

Posluchač na `document` čeká na probublání. Zastavená událost k němu nedorazí. Proto se místo zastavení v posluchači ptáš, odkud událost přišla.

### --answer--

Menu se zavře i po kliknutí do menu.

#### --why--

`stopPropagation` v kartě s kliknutím do menu nesouvisí, to jde jinou cestou.

### --see--

js-dom/udalosti#preventdefault-a-stoppropagation

## --question--

Napiš podmínku, která v posluchači `keydown` platí pro **Ctrl+S** i **Cmd+S** (klávesa `s`).

### --expected--

(event.ctrlKey || event.metaKey) && event.key === 's'

### --accept--

event.key === 's' && (event.ctrlKey || event.metaKey)
(event.metaKey || event.ctrlKey) && event.key === 's'
event.key === 's' && (event.metaKey || event.ctrlKey)
(event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's'

### --why--

Ctrl hlásí `event.ctrlKey`, Cmd na Macu `event.metaKey`. Písmeno čteš z `event.key`, protože zkratka se má řídit tím, co je na klávesnici napsané. V praxi se k tomu přidá `event.preventDefault()`, jinak prohlížeč otevře ukládání stránky.

### --see--

js-dom/udalosti#klavesnice
