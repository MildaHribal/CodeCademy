Čtyři prohlížečová API na jednu stránku: vlastní značky, druhé vlákno, offline režim a úložiště.

## Vlastní prvek: kostra

```js
class HvezdyX extends HTMLElement {
  static observedAttributes = ['hodnota'];   // co hlídat
  static formAssociated = true;              // chci do formuláře

  constructor() {
    super();                                 // vždy první
    this.vnitrek = this.attachInternals();   // most k formuláři
    this.attachShadow({ mode: 'open' });     // stín se zakládá jednou
    this.shadowRoot.addEventListener('click', (u) => this.naKlik(u));
  }

  get hodnota() { return Number(this.getAttribute('hodnota')) || 0; }
  set hodnota(n) { this.setAttribute('hodnota', Math.min(5, Math.max(0, Number(n) || 0))); }

  connectedCallback() { this.vykresli(); }
  disconnectedCallback() { /* úklid posluchačů na document a window */ }
  attributeChangedCallback(jmeno, stara, nova) { if (stara !== nova) this.vykresli(); }
}

customElements.define('hvezdy-x', HvezdyX);   // jméno MUSÍ mít pomlčku
```

## Metody životního cyklu

| metoda | kdy | co do ní patří | co do ní nepatří |
|---|---|---|---|
| `constructor` | při vzniku objektu | `super()`, `attachShadow`, `attachInternals` | čtení atributů a potomků |
| `connectedCallback` | při připojení do dokumentu (i opakovaně) | vykreslení, posluchače, časovače | nic, co nesnese druhé spuštění |
| `disconnectedCallback` | při odebrání z dokumentu | `removeEventListener`, `clearInterval` | — |
| `attributeChangedCallback` | při změně sledovaného atributu | překreslení podle nové hodnoty | práce bez porovnání staré a nové hodnoty |

Pořadí u prvku, který už atribut má: `constructor` → `attributeChangedCallback` → `connectedCallback`.

## Shadow DOM: co hranicí projde

| projde dovnitř | neprojde |
|---|---|
| dědičné vlastnosti (`color`, `font-family`, `line-height`) | selektory ze stránky |
| CSS proměnné (`var(--barva, záloha)`) | `document.querySelector` |
| události s `composed: true` | selektory zevnitř ven |

Selektory, které platí jen uvnitř: `:host` (sám prvek), `:host(.tmavy)` (prvek s třídou), `::slotted(span)` (obsah propašovaný zvenčí).

```js
this.shadowRoot.innerHTML = `
  <style>
    :host { display: inline-flex; gap: 0.4rem; }
    .hvezda { color: var(--barva-hvezd, #f59e0b); }
  </style>
  <div class="hvezdy"></div>
  <span class="popis"><slot>Tvoje hodnocení</slot></span>
`;
```

## Ven jen událostí

```js
this.dispatchEvent(new CustomEvent('zmena', {
  detail: { film: this.getAttribute('name'), hodnota: this.hodnota },
  bubbles: true,     // ať ji chytí i rodič
  composed: true,    // ať projde hranicí stínu
}));
```

Na stránce se poslouchá jako `click`: `seznam.addEventListener('zmena', (u) => u.detail)`.

## Přístupnost skupiny hvězd

| prvek | atributy |
|---|---|
| obal | `role="radiogroup"`, `aria-label="…"` |
| každá volba | `role="radio"`, `aria-label="3 z 5 hvězd"`, `aria-checked="true"` u jediné |
| klávesnice | vybraná volba `tabindex="0"`, ostatní `-1`; šipky mění hodnotu a přesunou zaměření |

## Formulářový vlastní prvek

```js
static formAssociated = true;
// v konstruktoru:
this.vnitrek = this.attachInternals();
// při každé změně hodnoty:
this.vnitrek.setFormValue(String(this.hodnota));
```

Ve `FormData` se prvek objeví pod svým atributem `name`, stejně jako `<input>`.

## Web Worker

```js
// stránka
const worker = new Worker('worker.js', { type: 'module' });
worker.postMessage({ dotaz: 'praha', data: radky });
worker.onmessage = (u) => vykresli(u.data);
worker.terminate();

// worker.js
self.onmessage = (u) => {
  const vysledek = najdi(u.data);
  self.postMessage(vysledek);
};
```

| ve workeru je | ve workeru není |
|---|---|
| `fetch`, `setTimeout`, `IndexedDB`, `Cache`, `WebSocket` | `document`, `window`, `localStorage`, `alert` |

Zprávy se kopírují [[strukturované klonování|strukturovaným klonováním]]: `Date`, `Map`, `Set`, `Blob` i cykly ano, funkce a prvky DOM ne (`DataCloneError`). Velké pole bajtů pošli jako [[přenositelný objekt]]: `worker.postMessage(buffer, [buffer])` — na odesílající straně pak zůstane prázdné.

## Service worker: cyklus a strategie

```js
// registrace ze stránky (jen HTTPS nebo localhost)
navigator.serviceWorker.register('/sw.js');

// sw.js
self.addEventListener('install', (u) => u.waitUntil(naplnSpiz()));
self.addEventListener('activate', (u) => u.waitUntil(smazStareSpize()));
self.addEventListener('fetch', (u) => u.respondWith(odpovez(u.request)));
```

| strategie | pro co | jak |
|---|---|---|
| [[cache-first]] | soubory s otiskem v názvu (`app.9f3c.js`) | zkus spíž, na síť jdi jen když tam nic není |
| [[network-first]] | HTML a data, kde by stará verze vadila | zkus síť, spíž je záchrana při výpadku |
| [[stale-while-revalidate]] | obsah, kde pár minut stáří nevadí | vrať ze spíže hned a na pozadí stáhni čerstvé |

## Úložiště prohlížeče

| úložiště | velikost | typ dat | přístup | přežije |
|---|---|---|---|---|
| `sessionStorage` | ~5 MB | jen text | synchronní | do zavření karty |
| `localStorage` | ~5 MB | jen text | synchronní | navždy |
| [[Cache Storage]] | podle [[kvóty úložiště]] | dvojice požadavek → odpověď | asynchronní | navždy |
| [[IndexedDB]] | podle kvóty | strukturované klonování | asynchronní | navždy |

```js
const db = await new Promise((ano, ne) => {
  const pozadavek = indexedDB.open('zapisy', 1);
  pozadavek.onupgradeneeded = () => {
    // jediné místo, kde se zakládá schéma
    pozadavek.result.createObjectStore('zaznamy', { keyPath: 'id' });
  };
  pozadavek.onsuccess = () => ano(pozadavek.result);
  pozadavek.onerror = () => ne(pozadavek.error);
});

const transakce = db.transaction('zaznamy', 'readwrite');
transakce.objectStore('zaznamy').put({ id: 1, text: 'Ahoj', kdy: new Date() });
```

## Pasti

| příznak | příčina |
|---|---|
| značka se vykreslí, ale nic nedělá | chybí `customElements.define`, nebo se skript nenačetl |
| `DOMException: … is not a valid custom element name` | jméno bez pomlčky |
| komponenta je prázdná, ale v DevTools obsah vidíš | má shadow root a zapisuje do světlého stromu |
| změna atributu nic nedělá, konzole mlčí | atribut chybí v `observedAttributes` |
| klik uvnitř stínu „nenajde" tlačítko | posluchač je za hranicí stínu, `target` je přepsaný na hostitele |
| stránka událost z komponenty neslyší | chybí `bubbles`, nebo při cestě ze stínu `composed` |
| appka drží starou verzi i po nasazení | HTML se vrací cache-first místo network-first |
| `QuotaExceededError` při zápisu | došlo místo, nebo se do `localStorage` cpou obrázky |
| po deseti otevřeních dialogu běží deset časovačů | chybí úklid v `disconnectedCallback` |
