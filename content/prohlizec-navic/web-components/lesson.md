# Vlastní HTML prvek: web component

:::check pretest
Do stránky napíšeš `<hvezdicky-hodnoceni hodnota="4"></hvezdicky-hodnoceni>`. Žádný skript zatím nemáš. Co s tou značkou prohlížeč udělá?

### --correct--
Vykreslí ji jako obyčejný prvek bez vlastního vzhledu a chování. Nic nespadne.

#### --why--
Neznámá značka je pro prohlížeč platný prvek typu `HTMLUnknownElement`-ish: zobrazí
svůj obsah, dědí styly a čeká, jestli ji někdo „oživí".

### --answer--
Zahodí ji — v HTML smí být jen značky ze specifikace.

#### --why--
HTML parser nezná seznam povolených značek jako zakázaný seznam. Neznámé značky do
stromu zařadí, jen jim nedá žádné vlastní chování.

### --answer--
Vypíše do konzole chybu o neznámé značce.

#### --why--
Konzole mlčí. To je ostatně i důvod, proč se překlep v názvu vlastní značky hledá tak špatně.
:::

Na GitHubu je u každého komentáře čas „před 3 hodinami", který se sám přepočítává. Je to
značka `<relative-time>`. Google na stránkách s produkty vykresluje 3D modely značkou
`<model-viewer>`. Designové systémy velkých firem se rozdávají jako sada značek, které
fungují v Reactu, ve Vue i v obyčejném PHP šabloně.

Všechno to jsou [[web component|web components]]: tvoje vlastní HTML značky.

> [!REMEMBER]
> **Web component je vlastní HTML značka: třída popisuje chování, prohlížeč ji oživí
> všude, kde se ta značka objeví** — i v HTML, které vygeneroval někdo úplně jiný.

## Problém: pátá kopie téhle karty

Bez komponent vypadá opakovaný kus stránky takhle: funkce vyrobí HTML, další funkce
na něj navěsí posluchače a ty si musíš pamatovat, že po každém vložení do stránky je
potřeba zavolat obojí.

:::live dom
```html
<div id="seznam"></div>
<button id="pridat">Přidat knihu</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #1f2937; }
.karta { border: 1px solid #d1d5db; border-radius: .5rem; padding: .75rem; margin-block: .5rem; }
button { font: inherit; padding: .4rem .8rem; border-radius: .4rem; border: 1px solid #94a3b8; background: #fff; cursor: pointer; }
```
```js
// 1. Vyrob značky
function vyrobKartu(nazev) {
  const karta = document.createElement('div');
  karta.className = 'karta';
  karta.innerHTML = `<strong>${nazev}</strong> <button class="koupit">Koupit</button>`;
  return karta;
}

// 2. Nezapomeň navěsit chování
function ozivKartu(karta) {
  karta.querySelector('.koupit').addEventListener('click', () => {
    karta.style.background = '#ecfdf5';
  });
}

const seznam = document.getElementById('seznam');
const karta = vyrobKartu('Spalovač mrtvol');
seznam.append(karta);
ozivKartu(karta);

document.getElementById('pridat').addEventListener('click', () => {
  seznam.append(vyrobKartu('Válka s Mloky')); // na oživení se zapomnělo
});
```
:::

Zkus kliknout na **Přidat knihu** a pak na **Koupit** u nově přidané karty — nic se
nestane. Přesně tahle zapomenutá druhá polovina je důvod, proč komponenty vznikly.

:::check
V ukázce výš se po kliknutí na **Přidat knihu** dá nová karta koupit? Co se v kódu zapomnělo?

### --correct--
Zavolat `ozivKartu` i na novou kartu — posluchač jí nikdo nezapsal.

#### --why--
Vyrobení značek a navěšení chování jsou dvě oddělené funkce a tu druhou musíš zavolat
pokaždé znovu. Zapomenutá druhá polovina je nejčastější chyba u opakovaných kusů stránky.

### --answer--
`append` vloží kopii prvku, takže posluchač zůstal na originálu.

#### --why--
`append` nic nekopíruje. Vkládá ten samý prvek, který jsi vyrobil.

### --answer--
Posluchač se musí zapisovat na `document`, jinak nové prvky nechytá.

#### --why--
Delegace by problém obešla, ale tady žádný posluchač na nové kartě není — nikdo ho
nezapsal, ani na kartě, ani výš.
:::

## Vlastní značka: třída a `customElements.define`

[[vlastní prvek|Vlastní prvek]] jsou dvě věci: **třída**, která dědí z `HTMLElement`, a **registrace**
jména značky.

:::live dom
```html
<hvezdicky-hodnoceni></hvezdicky-hodnoceni>
<p>A tady rovnou další:</p>
<hvezdicky-hodnoceni></hvezdicky-hodnoceni>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
hvezdicky-hodnoceni { font-size: 1.5rem; color: #f59e0b; }
```
```js
class HvezdickyHodnoceni extends HTMLElement {
  connectedCallback() {
    this.textContent = '★★★★☆';
  }
}

customElements.define('hvezdicky-hodnoceni', HvezdickyHodnoceni);
```
:::

Zkus do HTML přidat třetí `<hvezdicky-hodnoceni></hvezdicky-hodnoceni>` a sleduj, že
oživení nemusíš nikam dopisovat — prohlížeč ho udělá sám.

Pravidla, která musíš dodržet:

- **Jméno značky obsahuje pomlčku** (`hvezdicky-hodnoceni`, ne `hvezdicky`). Pomlčka
  je záruka, že ti HTML jednou nepřidá značku stejného jména.
- **Jedno jméno se registruje jen jednou.** Druhé `define` se stejným jménem vyhodí výjimku.
- Značka se **nesmí uzavírat lomítkem**: `<hvezdicky-hodnoceni />` prohlížeč v HTML
  nepovažuje za uzavřenou.

:::check
Napiš volání, kterým prohlížeči řekneš, že značka `<cenovka-produktu>` patří třídě `CenovkaProduktu`.

### --expected--
customElements.define('cenovka-produktu', CenovkaProduktu)

### --why--
`customElements` je registr vlastních prvků. `define` dostane jméno značky (s pomlčkou)
a třídu. Od té chvíle prohlížeč oživí každý výskyt značky — i ten, který do stránky
přibude později.
:::

## Životní cyklus: `connectedCallback` a `disconnectedCallback`

Třída vlastního prvku má čtyři metody, které volá prohlížeč sám:

| metoda | kdy se zavolá | k čemu je |
|---|---|---|
| `constructor` | při vzniku objektu prvku | jen příprava, **ne** čtení atributů ani potomků |
| `connectedCallback` | když se prvek připojí do dokumentu | vykreslení, zápis posluchačů, start časovačů |
| `disconnectedCallback` | když se prvek z dokumentu odebere | úklid: odhlášení posluchačů, zastavení časovačů |
| `attributeChangedCallback` | při změně sledovaného atributu | překreslení podle nové hodnoty |

:::live js predict
```js
class InfoKarta extends HTMLElement {
  constructor() {
    super();
    console.log('constructor');
  }
  connectedCallback() {
    console.log('connectedCallback');
  }
}
customElements.define('info-karta', InfoKarta);

const karta = document.createElement('info-karta');
console.log('prvek vyroben');
document.body.append(karta);
console.log('konec skriptu');
```
--question-- Co vypíše konzole a v jakém pořadí?
--expected--
```text
constructor
prvek vyroben
connectedCallback
konec skriptu
```
--why-- `document.createElement` objekt **vyrobí**, takže `constructor` běží hned. `connectedCallback` se ale volá až ve chvíli **připojení do dokumentu** — synchronně uvnitř `append`, proto ještě před posledním řádkem. Právě proto patří vykreslování do `connectedCallback`: v konstruktoru prvek ještě není ve stránce a nemusí mít ani atributy.

:::

> [!PITFALL]
> `connectedCallback` se může zavolat **víckrát**. Stačí prvek někam přesunout
> (`jinyRodic.append(prvek)`) a proběhne znovu. Když v něm zapisuješ posluchač na
> `document` nebo `window`, musíš ho v `disconnectedCallback` odhlásit — jinak ti po
> třech přesunech běží tři posluchači a prvek, který už na stránce není, pořád reaguje.

:::check
V `connectedCallback` zapíšeš `document.addEventListener('keydown', this.naKlavesu)`. Prvek pak ze stránky odebereš. Co se stane při stisku klávesy?

### --correct--
Posluchač poběží dál, dokud ho neodhlásíš v `disconnectedCallback`.

#### --why--
Posluchač drží odkaz na tvoji metodu, a tím i na celý prvek. Odebrání ze stránky
posluchače na `document` nijak neruší — a prvek se navíc neuvolní z paměti.

### --answer--
Nic, protože prvek už ve stránce není.

#### --why--
Posluchač visí na `document`, ne na prvku. O tom, jestli se zavolá, rozhoduje
`document`, ne to, kde je prvek.

### --answer--
Prohlížeč posluchač odhlásí sám, jakmile prvek zmizí.

#### --why--
To by prohlížeč musel vědět, který posluchač k prvku patří. Automatický úklid funguje
jen u posluchačů zapsaných **přímo na tom prvku** — jakmile sáhneš na `document`,
uklízíš sám.
:::

## Atributy: `observedAttributes` a `attributeChangedCallback`

Komponenta se má nastavovat z HTML, ne z JavaScriptu. Aby prvek o změně atributu věděl,
musí ho **přihlásit k odběru**.

:::live dom
```html
<hvezdicky-hodnoceni hodnota="2"></hvezdicky-hodnoceni>
<p><button id="vic">Přidej hvězdu</button></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
hvezdicky-hodnoceni { font-size: 1.75rem; color: #f59e0b; }
button { font: inherit; padding: .4rem .8rem; border-radius: .4rem; border: 1px solid #94a3b8; background: #fff; cursor: pointer; }
```
```js
class HvezdickyHodnoceni extends HTMLElement {
  // 1. Řekni, které atributy sleduješ
  static observedAttributes = ['hodnota'];

  // 2. Vykresli podle aktuální hodnoty
  vykresli() {
    const hodnota = Number(this.getAttribute('hodnota')) || 0;
    this.textContent = '★'.repeat(hodnota) + '☆'.repeat(5 - hodnota);
  }

  connectedCallback() {
    this.vykresli();
  }

  // 3. Reaguj na změnu zvenčí
  attributeChangedCallback(jmeno, stara, nova) {
    if (stara !== nova) this.vykresli();
  }
}
customElements.define('hvezdicky-hodnoceni', HvezdickyHodnoceni);

document.getElementById('vic').addEventListener('click', () => {
  const prvek = document.querySelector('hvezdicky-hodnoceni');
  const teď = Number(prvek.getAttribute('hodnota'));
  prvek.setAttribute('hodnota', Math.min(5, teď + 1));
});
```
:::

Zkus v HTML změnit `hodnota="2"` na `hodnota="5"` a sleduj, že se hvězdičky překreslí
bez jediného řádku navíc.

Všimni si tří pojmenovaných částí: **řekni, co sleduješ** → **vykresli podle hodnoty**
→ **reaguj na změnu**. Tenhle postup je u vlastních prvků pořád stejný, ať děláš
hvězdičky nebo odpočet do konce slevy.

:::check
Prvek má `attributeChangedCallback`, ale při změně atributu `hodnota` se nic neděje. Co ve třídě chybí?

### --expected--
static observedAttributes = ['hodnota']

### --accept--
observedAttributes = ['hodnota']
static get observedAttributes() { return ['hodnota']; }

### --why--
Prohlížeč hlídá jen atributy z `observedAttributes`. Bez toho seznamu se
`attributeChangedCallback` nezavolá vůbec — a protože to není chyba, konzole mlčí.
:::

## Shadow DOM: styly, které nikam neutečou

Zatím komponenta zapisuje do obyčejného DOM stránky. To znamená, že její vnitřek může
kdokoli přestylovat, a naopak tvoje styly můžou rozbít zbytek stránky.

`attachShadow` k prvku připojí [[shadow DOM|oddělený strom]] s vlastními styly.

:::compare
```html
<p class="cenovka">Cena v odstavci stránky: 349 Kč</p>
<cena-produktu></cena-produktu>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.cenovka { color: #dc2626; font-weight: 700; }
```
--variant-- Bez shadow DOM: styl stránky prosákne dovnitř
```js
class CenaProduktu extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<span class="cenovka">Cena v komponentě: 349 Kč</span>';
  }
}
customElements.define('cena-produktu', CenaProduktu);
```
--variant-- Se shadow DOM: komponenta si vládne sama
```js
class CenaProduktu extends HTMLElement {
  connectedCallback() {
    const stin = this.attachShadow({ mode: 'open' });
    stin.innerHTML = `
      <style>.cenovka { color: #2563eb; font-weight: 700; }</style>
      <span class="cenovka">Cena v komponentě: 349 Kč</span>
    `;
  }
}
customElements.define('cena-produktu', CenaProduktu);
```
:::

Vlevo se text komponenty obarvil červeně podle pravidla stránky. Vpravo je modrý —
pravidlo `.cenovka` ze stránky se do shadow DOM nedostalo.

Co hranici **nepřekročí**: selektory zvenčí dovnitř i zevnitř ven. Co ji **překročí**:
dědičné vlastnosti (`color`, `font-family`, `line-height`) a [[CSS proměnná|custom properties]].
Toho se využívá schválně — komponenta nabídne pár proměnných jako „nastavení vzhledu".

Uvnitř shadow DOM navíc platí dva nové selektory: `:host` (sám prvek zvenčí) a
`::slotted(...)` (obsah propašovaný zvenčí).

:::live dom predict
```html
<style>
  button { background: #dc2626; color: #fff; }
</style>
<sdileny-knoflik></sdileny-knoflik>
```
```js
class SdilenyKnoflik extends HTMLElement {
  connectedCallback() {
    const stin = this.attachShadow({ mode: 'open' });
    stin.innerHTML = '<button>Do košíku</button>';
  }
}
customElements.define('sdileny-knoflik', SdilenyKnoflik);
```
--question-- Jakou barvu pozadí bude mít tlačítko uvnitř komponenty?
--option*-- Výchozí šedou — pravidlo ze stránky se dovnitř nedostane.
--option-- Červenou, protože selektor `button` platí pro celý dokument.
--option-- Červenou, protože `background` se dědí z rodiče.
--why-- Selektor `button` ze stránky uvnitř shadow DOM nic nevybere: shadow root je hranice pro *selektory*. Kdyby komponenta chtěla barvu převzít, musela by ji nabídnout přes custom property, například `background: var(--barva-knofliku, #e5e7eb)`. A `background` se nedědí — dědičné jsou `color`, `font-family` nebo `line-height`.
:::

:::check
Chceš, aby si stránka mohla nastavit barvu tlačítka uvnitř tvojí komponenty. Co komponentě dáš?

### --correct--
Custom property, kterou uvnitř použiješ jako `var(--barva-knofliku, #e5e7eb)`.

#### --why--
Custom properties se dědí, takže hranicí shadow DOM projdou. Komponenta tím nabízí
přesně ten jeden bod, který smí stránka měnit — a zbytek si hlídá.

### --answer--
Nic, stačí stránce napsat pravidlo `sdileny-knoflik button { … }`.

#### --why--
Takový selektor uvnitř stínu nic nevybere. Zkus to v DevTools: pravidlo se zobrazí
jako nepoužité.

### --answer--
`mode: 'closed'` při volání `attachShadow`.

#### --why--
`closed` jen schová `element.shadowRoot` před JavaScriptem stránky. Na styly to nemá
vliv a bezpečnost to nepřináší — kdo má skript na stránce, dostane se dovnitř stejně.
:::

## Slot: obsah, který dodá stránka

Komponenta nemusí obsah jen vyrábět, může ho **přebírat**. [[slot komponenty|Značka `<slot>`]] uvnitř
shadow DOM je díra, do které prohlížeč promítne potomky zapsané ve [[světlý strom|světlém stromu]] zvenčí.

:::live dom
```html
<upozorneni-box>
  <span slot="titulek">Kniha není skladem</span>
  Naskladňujeme ji obvykle do tří pracovních dnů.
</upozorneni-box>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
```
```js
class UpozorneniBox extends HTMLElement {
  connectedCallback() {
    const stin = this.attachShadow({ mode: 'open' });
    stin.innerHTML = `
      <style>
        :host { display: block; border-left: 4px solid #f59e0b; background: #fffbeb; padding: .75rem 1rem; border-radius: .25rem; }
        .titulek { font-weight: 700; display: block; margin-bottom: .25rem; }
        ::slotted(span) { letter-spacing: .01em; }
      </style>
      <span class="titulek"><slot name="titulek">Upozornění</slot></span>
      <slot></slot>
    `;
  }
}
customElements.define('upozorneni-box', UpozorneniBox);
```
:::

Zkus v HTML smazat řádek se `slot="titulek"` a sleduj, že se objeví záložní text
`Upozornění` — obsah mezi značkami `<slot>` je výchozí hodnota.

:::check
Prvek `<slot>` v komponentě nemá atribut `name`. Které potomky do sebe promítne?

### --expected--
všechny, které nemají atribut slot

### --accept--
potomky bez atributu slot
obsah bez slot
### --why--
Bezejmenný slot je výchozí místo pro všechno, co nemá `slot="jméno"`. Pojmenovaných
slotů může být v komponentě víc, bezejmenný má smysl jeden.
:::

## Ven jen událostí

Komponenta nemá sahat na zbytek stránky. Když se v ní něco stane, **vyšle [[vlastní událost]]**
a stránka se rozhodne, co s tím.

```js
this.dispatchEvent(new CustomEvent('zmena', {
  detail: { hodnota: 4 },   // data pro posluchače
  bubbles: true,            // ať ji chytí i rodič
}));
```

Na stránce se pak poslouchá úplně stejně jako `click`:

```js
document.querySelector('hvezdicky-hodnoceni').addEventListener('zmena', (udalost) => {
  console.log('nová hodnota:', udalost.detail.hodnota);
});
```

> [!TIP]
> Když událost vzniká uvnitř shadow DOM a má se dostat na stránku, potřebuje kromě
> `bubbles: true` ještě `composed: true`. Bez toho se zastaví na hranici stínu.

:::check
Vlastní událost vzniká uvnitř shadow DOM a stránka ji neslyší, i když má `bubbles: true`. Co jí chybí?

### --expected--
composed: true

### --why--
`bubbles` říká, že událost stoupá stromem nahoru. `composed` rozhoduje o tom, jestli
smí překročit hranici shadow DOM. Bez něj událost dobublá jen ke kořeni stínu a tam
skončí — vzhledem k tomu, že se nic nestane a nic se nevypíše, hledá se to dlouho.
:::

:::explain
Vysvětli, proč komponenta hlásí změnu událostí, místo aby sama přepsala text v `#souhrn` na stránce.

## --model--
Komponenta nemá vědět, co je kolem ní. Kdyby sahala na `#souhrn`, fungovala by jen na
stránce, kde takový prvek je, a na druhé by tiše spadla nebo nedělala nic. Událost je
opačný směr: komponenta jen oznámí „stala se změna a tohle je nová hodnota" a stránka
si sama určí, co s tím udělá — jednou to bude souhrn, jindy odeslání na server.

## --checklist--
- Komponenta nesmí záviset na tom, co je na stránce kolem ní.
- Událost obrací směr: rozhodnutí patří stránce, ne komponentě.
- Data cestují v `detail`, takže posluchač nemusí nic dopočítávat.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Jméno bez pomlčky.** `customElements.define('hvezdicky', …)` vyhodí
> `DOMException: Failed to execute 'define' on 'CustomElementRegistry': "hvezdicky" is not a valid custom element name`.
> Jméno musí obsahovat pomlčku, začínat malým písmenem a nesmí být z rezervovaného
> seznamu (`font-face`, `annotation-xml`…).

> [!PITFALL]
> **Čtení atributů v konstruktoru.** V konstruktoru prvek ještě nemusí mít atributy ani
> potomky — u prvku vytvořeného parserem HTML je konstruktor volaný dřív, než se atributy
> stihnou přiřadit. Příznak: `this.getAttribute('hodnota')` vrátí `null` a komponenta se
> vykreslí prázdná. Čti atributy až v `connectedCallback`.

> [!PITFALL]
> **Skript načtený až za HTML.** Dokud se `define` nespustí, je značka ve stránce
> neoživená. Prohlížeč ji „povýší" (*upgrade*) až po registraci. Když do ní mezitím někdo
> zapíše vlastnost (`prvek.hodnota = 4`), přepíše se tím obyčejná vlastnost objektu a
> setter komponenty se nikdy nezavolá. Řešení je [[upgrade vlastnosti]] — v
> `connectedCallback` vlastnost smazat a nastavit znovu přes setter.

> [!PITFALL]
> **Prvek s vlastním obsahem a rovnou i shadow root.** Když má prvek shadow DOM,
> `this.textContent = '…'` zapíše do světlého stromu, který se nikde nezobrazí (pokud
> uvnitř není `<slot>`). Příznak: komponenta je prázdná, ale v DevTools obsah vidíš.
> Zapisuj do [[shadow root|`this.shadowRoot`]].

:::check
Komponenta se na stránce jeví prázdná, konzole mlčí a v DevTools uvnitř ní vidíš `<span>` se správným textem. Která z pastí výš to je?

### --correct--
Prvek má shadow root a obsah se zapsal do světlého stromu, kde ho nic nepromítá.

#### --why--
Jakmile prvek má stín, vykresluje se jen jeho obsah. Světlé potomky je vidět jen tam,
kde pro ně stín má `<slot>` — a ten tahle komponenta nemá.

### --answer--
Skript s `define` se načetl až za HTML, takže prvek zůstal neoživený.

#### --why--
Pak by uvnitř žádný `<span>` nebyl. Obsah vyrábí právě ta třída, která by se nespustila.

### --answer--
Atribut se četl v konstruktoru, takže vyšel `null`.

#### --why--
To by dalo prázdný nebo divný **text**, ne správný text na nesprávném místě.
:::

## Kde to najdeš v MDN

- [Web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) —
  rozcestník: custom elements, shadow DOM, šablony.
- [Using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) —
  celý životní cyklus i s pořadím volání a příklady autonomních prvků.
- [Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) —
  `attachShadow`, `:host`, `::slotted` a `adoptedStyleSheets`.
- [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) —
  `detail`, `bubbles`, `composed` a jak se to liší od obyčejné `Event`.

# --questions--

## --question--

Komponenta `<odpocet-slevy>` si v `connectedCallback` spustí `setInterval`, kterým každou vteřinu překresluje zbývající čas. Kde a proč musíš ten interval zastavit?

### --expected--
v disconnectedCallback

### --why--
`disconnectedCallback` je jediné místo, kde prvek ví, že ze stránky zmizel. Bez
`clearInterval` běží časovač dál, drží odkaz na prvek (takže se neuvolní paměť) a po
deseti otevřeních dialogu běží deset intervalů. Úklid patří vždy ke stejné metodě, ve
které jsi věc rozjel.

### --see--

prohlizec-navic/web-components#zivotni-cyklus-connectedcallback-a-disconnectedcallback

## --question--

Komponenta se zobrazuje prázdná, i když v DevTools vidíš uvnitř `<span>` se správným textem. Co je nejpravděpodobnější příčina?

### --correct--
Prvek má shadow root a obsah se zapsal do světlého stromu, kde ho nic nepromítá.

#### --why--
Jakmile prvek má shadow root, na stránce se vykresluje **jen** obsah stínu. Světlé
potomky je vidět jen tam, kde pro ně stín má `<slot>`.

### --answer--
Chybí `customElements.define`, takže se prvek neoživil.

#### --why--
Pak by se ale žádný `<span>` uvnitř neobjevil — obsah vyrábí právě ta neoživená třída.

### --answer--
Značka nemá v názvu pomlčku.

#### --why--
To by skončilo výjimkou při `define` a v konzoli bys viděl hlášku o neplatném jméně.

### --see--

prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

## --question--

**Opakování z dřívějška.** Co vypíše tenhle kód?

```js
const tlacitko = document.createElement('button');
tlacitko.textContent = 'Koupit';
tlacitko.addEventListener('click', () => console.log('klik'));
console.log(tlacitko.isConnected);
```

### --expected--
false

### --why--
`createElement` prvek vyrobí, ale nikam ho nepřipojí — `isConnected` je `false`, dokud
ho někam nevložíš. U vlastních prvků je to přesně ta chvíle mezi `constructor`
a `connectedCallback`.

### --see--

prohlizec-navic/web-components#zivotni-cyklus-connectedcallback-a-disconnectedcallback

## --question--

**Opakování z dřívějška.** Proč se posluchač zapsaný na rodičovský prvek (`seznam.addEventListener('click', …)`) uplatní i na položky, které do seznamu přibudou až později?

### --correct--
Událost z položky probublává nahoru k rodiči, takže posluchač na rodiči ji chytí bez ohledu na to, kdy položka vznikla.

#### --why--
Tomuhle se říká delegace událostí. Posluchač na rodiči se zapisuje jednou, nové potomky
řeší automaticky — a přesně proto se ve vlastních prvcích posluchač zapisuje na komponentu,
ne na každou hvězdičku zvlášť.

### --answer--
Prohlížeč posluchače při vložení nového potomka rozkopíruje.

#### --why--
Nic se nikam nekopíruje. Posluchač zůstává jeden, na rodiči.

### --answer--
Protože `addEventListener` sleduje změny v DOM.

#### --why--
Změny v DOM sleduje `MutationObserver`, a to jen když si o to řekneš. `addEventListener`
jen zapíše posluchače na jeden konkrétní cíl.

### --see--

prohlizec-navic/web-components#ven-jen-udalosti
