## --card-- output

Co vypíše tenhle kód?

```js
const vstup = document.createElement('input');
vstup.setAttribute('value', 'Ema');
vstup.value = 'Jana';
console.log(vstup.getAttribute('value'));
console.log(vstup.value);
```

### --expected--

```text
Ema
Jana
```

### --why--

Atribut je výchozí hodnota zapsaná v HTML, vlastnost je aktuální stav prvku. U `value` se po prvním zápisu rozejdou natrvalo. Vlastní prvek si tenhle vztah musí zařídit sám — proto se vlastnost píše jako dvojice getteru a setteru nad atributem.

### --see--

prohlizec-navic/web-components#atributy-observedattributes-a-attributechangedcallback

## --card-- output

Co vypíše tenhle kód?

```js
const box = document.createElement('div');
box.textContent = 'světlo';
box.attachShadow({ mode: 'open' }).innerHTML = '<span>stín</span>';
console.log(box.textContent);
console.log(box.shadowRoot.textContent);
```

### --expected--

```text
světlo
stín
```

### --why--

Světlý strom nikam nezmizí, jen se přestane vykreslovat — na obrazovce je vidět obsah stínu. Proto se komponenta, která má shadow root a přitom zapisuje do `this.textContent`, jeví jako prázdná, i když v DevTools obsah vidíš.

### --see--

prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

## --card-- output

Co vypíše tenhle kód?

```js
const box = document.createElement('div');
box.attachShadow({ mode: 'closed' });
console.log(String(box.shadowRoot));
```

### --expected--

null

### --why--

`mode: 'closed'` schová kořen stínu před JavaScriptem stránky — a bohužel i před tvým vlastním kódem, pokud si odkaz neuložíš do vlastnosti. Bezpečnost to nepřináší: kdo má skript na stránce, obejde to jednou přepsanou metodou `attachShadow`.

### --see--

prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

## --card-- output

Co vypíše tenhle kód?

```js
const host = document.createElement('div');
document.body.append(host);
host.attachShadow({ mode: 'open' }).innerHTML = '<p class="uvnitr">text</p>';
console.log(document.querySelectorAll('.uvnitr').length);
console.log(host.shadowRoot.querySelectorAll('.uvnitr').length);
```

### --expected--

```text
0
1
```

### --why--

Hledání ze stránky se na hranici stínu zastaví. Právě proto si komponenta může dovolit krátká jména tříd jako `.hvezdy` — nikomu nic nepřebije a nikdo jí do nich nesáhne.

### --see--

prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

## --card-- output

Co vypíše tenhle kód?

```js
const data = structuredClone({ kdy: new Date('2024-05-01'), tagy: new Set(['a', 'b']) });
console.log(data.kdy instanceof Date);
console.log(data.tagy.size);
```

### --expected--

```text
true
2
```

### --why--

Strukturované klonování je hlubší než `JSON.parse(JSON.stringify(…))`: umí `Date`, `Map`, `Set`, `Blob` i cykly. Neumí funkce, prvky DOM a prototypy tříd — a přesně tohle se posílá mezi vlákny i ukládá do IndexedDB.

### --see--

prohlizec-navic/web-workers#postmessage-zpravy-misto-sdilene-pameti

## --card-- output

Co vypíše tenhle kód?

```js
localStorage.setItem('pocet', 5);
const hodnota = localStorage.getItem('pocet');
console.log(typeof hodnota);
console.log(hodnota + 1);
```

### --expected--

```text
string
51
```

### --why--

`localStorage` umí jen text, takže pětka se uloží jako `'5'` a `+` z ní udělá spojování řetězců. Čísla i objekty přes něj musí projít `JSON.stringify` a `Number`/`JSON.parse` zpátky.

### --see--

prohlizec-navic/indexeddb#localstorage-rychle-male-a-vsechno-je-text

## --card-- output

Co vypíše tenhle kód?

```js
const ulozeno = JSON.stringify({ kdy: new Date('2024-05-01T10:00:00Z') });
const zpet = JSON.parse(ulozeno);
console.log(typeof zpet.kdy);
```

### --expected--

string

### --why--

`JSON` datum umí zapsat, ale ne přečíst zpátky — vrátí se jako řetězec. Pokud z něj chceš zase `Date`, musíš ho převést sám. IndexedDB tenhle problém nemá, protože ukládá strukturovaným klonováním.

### --see--

prohlizec-navic/indexeddb#json-kolem-toho

## --card-- code js

Doplň `connectedCallback` tak, aby prvek `<znacka-verze verze="3">` vypsal do sebe text `verze 3`.

### --seed--

```js
class ZnackaVerze extends HTMLElement {
  connectedCallback() {
  }
}

customElements.define('znacka-verze', ZnackaVerze);
```

### --test--

```js
const prvek = document.createElement('znacka-verze');
prvek.setAttribute('verze', '3');
document.body.append(prvek);
assert.equal(prvek.textContent, 'verze 3', 'prvek s atributem verze="3" má vypsat „verze 3"');
const druhy = document.createElement('znacka-verze');
druhy.setAttribute('verze', '9');
document.body.append(druhy);
assert.equal(druhy.textContent, 'verze 9', 'druhý prvek má vypsat svoji vlastní hodnotu');
```

### --solution--

```js
class ZnackaVerze extends HTMLElement {
  connectedCallback() {
    this.textContent = 'verze ' + this.getAttribute('verze');
  }
}

customElements.define('znacka-verze', ZnackaVerze);
```

### --why--

Atributy se čtou až v `connectedCallback`. V konstruktoru je prvek vyrobený parserem ještě nemusí mít.

### --see--

prohlizec-navic/web-components#vlastni-znacka-trida-a-customelements-define

## --card-- code js

Dej prvku `<moje-pocitadlo>` vlastnost `kolik`: čtení vrátí atribut `kolik` jako číslo (bez atributu nulu), zápis atribut přepíše.

### --seed--

```js
class MojePocitadlo extends HTMLElement {
}

customElements.define('moje-pocitadlo', MojePocitadlo);
```

### --test--

```js
const prvek = document.createElement('moje-pocitadlo');
prvek.setAttribute('kolik', '7');
assert.equal(prvek.kolik, 7, 'čtení vlastnosti má vrátit číslo 7, ne text');
assert.equal(document.createElement('moje-pocitadlo').kolik, 0, 'prvek bez atributu má mít hodnotu 0');
prvek.kolik = 2;
assert.equal(prvek.getAttribute('kolik'), '2', 'zápis do vlastnosti má přepsat atribut');
```

### --solution--

```js
class MojePocitadlo extends HTMLElement {
  get kolik() {
    return Number(this.getAttribute('kolik')) || 0;
  }

  set kolik(nova) {
    this.setAttribute('kolik', nova);
  }
}

customElements.define('moje-pocitadlo', MojePocitadlo);
```

### --why--

Jediný zdroj pravdy zůstává atribut. Vlastnost je jen pohodlná cesta z JavaScriptu — kdybys hodnotu držel vedle atributu, obojí by se ti rozešlo.

### --see--

prohlizec-navic/web-components#atributy-observedattributes-a-attributechangedcallback

## --card-- code js

Dej prvku `<ramecek-s>` otevřený shadow DOM, ve kterém bude vlastní `<style>` a `<slot>` pro obsah ze stránky.

### --seed--

```js
class RamecekS extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define('ramecek-s', RamecekS);
```

### --test--

```js
const prvek = document.createElement('ramecek-s');
prvek.textContent = 'obsah ze stránky';
document.body.append(prvek);
assert.ok(prvek.shadowRoot, 'prvek má mít otevřený shadow root');
assert.ok(prvek.shadowRoot.querySelector('style'), 've stínu má být vlastní <style>');
const slot = prvek.shadowRoot.querySelector('slot');
assert.ok(slot, 've stínu má být <slot>');
assert.equal(slot.assignedNodes().length, 1, 'text ze stránky se má promítnout do slotu');
```

### --solution--

```js
class RamecekS extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>:host { display: block; border: 1px solid #94a3b8; padding: 0.5rem; }</style>
      <slot></slot>
    `;
  }
}

customElements.define('ramecek-s', RamecekS);
```

### --why--

Bez slotu by se potomci ze stránky nikde nevykreslili. Slot je jediné místo, kudy obsah zvenčí proteče dovnitř.

### --see--

prohlizec-navic/web-components#slot-obsah-ktery-doda-stranka

## --card-- css

Napiš deklaraci, kterou uvnitř shadow DOM obarvíš text na `#f59e0b`, ale necháš stránce možnost barvu přepsat proměnnou `--barva-hvezd`.

### --expected--

```css
color: var(--barva-hvezd, #f59e0b);
```

### --why--

CSS proměnné se dědí, takže hranicí stínu projdou. Komponenta tím nabídne přesně ten jeden bod, který smí stránka měnit, a zbytek si pohlídá.

### --see--

prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

## --card-- css

Vlastní prvek je ve výchozím stavu `display: inline`, takže mu nenastavíš výšku ani vnitřní mezery. Napiš deklaraci, kterou z něj v pravidle `:host` uděláš blokový prvek.

### --expected--

```css
display: block;
```

### --why--

`:host` je jediný selektor, kterým se zevnitř stínu dostaneš na sám prvek. Pravidlo pro `:host` má navíc nízkou specificitu, takže ho stránka může přebít — a to je záměr.

### --see--

prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

## --card-- free

Jaký je u vlastního prvku rozdíl mezi atributem a vlastností a kdy použiješ který?

### --back--

Atribut je text zapsaný v HTML, vlastnost je hodnota v JavaScriptu. Atribut je ta pomalejší, ale veřejná cesta: dá se napsat do šablony, do HTML z serveru i změnit v DevTools, a nese vždycky řetězec. Vlastnost je pohodlná cesta z kódu — umí čísla, pole i objekty a může při zápisu hlídat rozsah. Pravidlo: jednoduché nastavení (číslo, text, zapnuto/vypnuto) dej do atributu a vlastnost postav nad ním jako dvojici getteru a setteru. Složitá data, která se do HTML zapsat nedají, nech jen jako vlastnost.

### --see--

prohlizec-navic/web-components#atributy-observedattributes-a-attributechangedcallback

## --card-- free

Co hranice shadow DOM zastaví a co jí projde?

### --back--

Zastaví **selektory** oběma směry: pravidlo ze stránky nevybere nic uvnitř a pravidlo zevnitř nevybere nic venku. Zastaví taky hledání (`document.querySelector` do stínu nevidí) a ve výchozím stavu i cíl události, který se při přechodu přepíše na hostitelský prvek. Projdou **dědičné vlastnosti** (`color`, `font-family`, `line-height`) a **CSS proměnné** — a události, které mají `composed: true`. Z toho plyne praktický návod: nabídni stránce pár proměnných jako veřejné nastavení vzhledu a zbytek si nech uvnitř.

### --see--

prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

## --card-- free

K čemu je `observedAttributes` a proč bez něj `attributeChangedCallback` mlčí?

### --back--

`observedAttributes` je statický seznam jmen atributů, které má prohlížeč hlídat. Bez něj by musel u každého prvku sledovat všechno, a to by stálo výkon, takže si o hlídání musíš říct. Když seznam chybí nebo je v něm překlep, `attributeChangedCallback` se prostě nezavolá — a protože to není chyba, konzole nic nehlásí. Příznak: komponenta se vykreslí správně při načtení, ale na pozdější změnu atributu nereaguje.

### --see--

prohlizec-navic/web-components#atributy-observedattributes-a-attributechangedcallback

## --card-- free

Proč se vlastní prvek zpřístupňuje ručně a co k tomu potřebuje skupina hvězdiček nebo přepínačů?

### --back--

Prohlížeč o tvojí značce nic neví, takže jí nepřidělí žádnou roli — pro odečítač je to prázdná obálka. Musíš tedy sám dodat trojici: roli skupiny a její jméno (`role="radiogroup"` a `aria-label`), roli a jméno každé volby (`role="radio"` a `aria-label`) a údaj o tom, která volba je vybraná (`aria-checked`). K tomu patří klávesnice: do skupiny se vstoupí tabulátorem jednou (jediné tlačítko má `tabindex="0"`, ostatní `-1`) a uvnitř se přepíná šipkami. Ověřit to jde ve stromu zpřístupnění v DevTools.

### --see--

prohlizec-navic/workshop-web-component/014

## --card-- free

Kdy Web Worker pomůže a kdy ne? Uveď příklad obojího.

### --back--

Pomůže u **výpočtu**, který drží hlavní vlákno: filtrování a řazení desítek tisíc řádků, parsování velkého CSV, komprese obrázku před odesláním, hledání v plnotextovém indexu. Stránka zůstane klikatelná, protože počítá jiné vlákno. Nepomůže tam, kde se čeká na někoho jiného — `fetch` na pomalé API je už tak asynchronní a přesun do workeru ho nezrychlí. Nepomůže ani u práce s DOM, protože worker žádný nemá, a nevyplatí se u krátkých výpočtů: založení workeru a kopie dat při `postMessage` stojí čas, který může být delší než samotný výpočet.

### --see--

prohlizec-navic/web-workers#kdy-worker-nepomuze

## --card-- free

Popiš životní cyklus service workeru a vysvětli, proč se nová verze neaktivuje hned.

### --back--

Registrace stáhne skript, pak proběhne `install` (tady se plní spíž), pak `activate` (tady se uklízejí staré spíže) a teprve potom začne service worker odchytávat `fetch`. Nová verze ale po instalaci čeká: dokud je otevřená karta obsluhovaná starou verzí, zůstane nová ve stavu *waiting*. Je to ochrana proti tomu, aby se jedné stránce pod rukama vyměnila polovina souborů za novou verzi. Přeskočit čekání jde přes `skipWaiting` a `clients.claim`, ale pak si musíš být jistý, že staré a nové soubory jdou míchat.

### --see--

prohlizec-navic/service-worker-a-pwa#zivotni-cyklus-install-activate-fetch

## --card-- free

Cache-first, network-first a [[stale-while-revalidate]] — na co se hodí která strategie?

### --back--

Cache-first je pro soubory, jejichž obsah se na dané adrese už nezmění, typicky skripty a styly s otiskem obsahu v názvu — jdou ze spíže okamžitě a na síť se vůbec nejde. Network-first je pro HTML a pro data, kde by stará odpověď vadila: zkusí se síť a spíž slouží jako záchrana při výpadku. Stale-while-revalidate je kompromis pro obsah, kde chvilkové zpoždění nevadí — vrátí se uložená verze hned a na pozadí se stáhne čerstvá pro příště. Rozhodovací otázka zní: co se stane, když uživatel uvidí obsah starý pár minut?

### --see--

prohlizec-navic/service-worker-a-pwa#tri-strategie-a-kdy-kterou

## --card-- free

Kdy sáhnout po IndexedDB místo `localStorage`?

### --back--

Jakmile data přesáhnou pár set kilobajtů, jakmile v nich potřebuješ hledat podle něčeho jiného než klíče, nebo jakmile v nich mají být binární data. `localStorage` má kolem pěti megabajtů, umí jen text a čte se **synchronně**, takže při každém přístupu zastaví vykreslování stránky. IndexedDB je asynchronní, zvládne stovky megabajtů, ukládá strukturovaným klonováním (`Date`, `Map`, `Blob`) a umí nad daty indexy. Cenou je ukecanější API a to, že prohlížeč smí data málo navštěvovaného webu při nedostatku místa smazat.

### --see--

prohlizec-navic/indexeddb#kdyz-localstorage-nestaci

## --card-- free

Co získáš tím, že widget napíšeš jako web component místo jako funkci, která vyrobí HTML?

### --back--

Oživení se přestane zapomínat: prohlížeč zavolá `connectedCallback` u každého výskytu značky, i u toho, který do stránky přibude za hodinu z odpovědi serveru. Komponenta je pak jeden kus kódu, který funguje v Reactu, ve Vue i v obyčejné PHP šabloně, protože stojí jen na prohlížeči. Se shadow DOM navíc dostaneš izolaci stylů, takže widget nerozbije cizí web a cizí web nerozbije jeho. Cena: vlastní prvek je pořád jen jedna značka — stavovou aplikaci z toho nepostavíš, na to je framework.

### --see--

prohlizec-navic/web-components#problem-pata-kopie-tehle-karty
