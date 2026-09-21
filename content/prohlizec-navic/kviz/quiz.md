---
title: "Kvíz: prohlížečová API navíc"
pass: 0.8
---

# --questions--

## --question--

Které z těchhle jmen `customElements.define` odmítne s výjimkou?

### --answer--

`muj-widget`

#### --why--

Dvě slova spojená pomlčkou jsou přesně ten tvar, který specifikace chce.

### --answer--

`x-1`

#### --why--

Jméno musí začínat malým písmenem, pomlčku obsahovat a číslice v něm být smí.

### --correct--

`nacteni`

#### --why--

Chybí pomlčka. Bez ní by se jméno mohlo jednou srazit se značkou, kterou přidá samo HTML — proto je pomlčka podmínka, ne doporučení.

### --answer--

`nakupni-kosik-2`

#### --why--

Tady je pomlčka hned dvakrát a číslice na konci nevadí.

### --see--

prohlizec-navic/web-components#typicke-chyby-a-pasti

## --question--

Komponenta si v `connectedCallback` zapíše posluchač na `window` a nikde ho neruší. Uživatel desetkrát otevře a zavře dialog, ve kterém komponenta je. Kolik posluchačů je potom na `window` zapsaných?

### --expected--

10

### --why--

Každé připojení do dokumentu spustí `connectedCallback` znovu, takže přibude další posluchač. Odpojení posluchače na `window` neruší — o to se musíš postarat v `disconnectedCallback`. Příznak v praxi: appka po půlhodině klikání znatelně zpomalí a prvky, které dávno zmizely, pořád reagují.

### --see--

prohlizec-navic/web-components#zivotni-cyklus-connectedcallback-a-disconnectedcallback

## --question--

Stránka má pravidlo `stitek-ceny { color: #dc2626; }`. Komponenta `stitek-ceny` má shadow DOM, uvnitř `<span>349 Kč</span>` a žádné vlastní pravidlo pro barvu. Jakou barvu bude mít text uvnitř komponenty?

### --correct--

Červenou — `color` se dědí, a dědičnost hranicí stínu projde.

#### --why--

Hranice stínu zastaví **selektory**, ne dědičnost. Pravidlo míří na sám prvek `stitek-ceny`, ten je součástí stránky a jeho vypočtená barva se dědí do celého stínu.

### --answer--

Výchozí černou — pravidla stránky se do stínu nedostanou.

#### --why--

Kdyby pravidlo mířilo dovnitř (třeba `stitek-ceny span`), opravdu by nic neudělalo. Tohle ale nastavuje vlastnost na samotném prvku.

### --answer--

Červenou, protože `mode: 'open'` styly ze stránky vpouští.

#### --why--

`mode` rozhoduje jen o tom, jestli jde na `element.shadowRoot` sáhnout z JavaScriptu. Na styly nemá vliv vůbec žádný.

### --see--

prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

## --question--

Napiš selektor, kterým uvnitř shadow DOM nastylizuješ **sám prvek**, na kterém stín visí.

### --expected--

:host

### --why--

Zevnitř stínu není prvek dostupný jménem značky ani třídou — je „nad" tebou. `:host` je jediná cesta, jak mu dát třeba `display: block`. Vlastní prvek je totiž ve výchozím stavu `display: inline`, takže bez `:host` u něj nenastavíš ani výšku, ani vnitřní mezery.

### --see--

prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

## --question--

Komponenta má `static observedAttributes = ['hodnota']`. Do stránky se vloží `<hvezdy-x hodnota="3"></hvezdy-x>`. Napiš, v jakém pořadí prohlížeč zavolá tyhle tři metody — jednu na řádek.

### --expected--

```text
constructor
attributeChangedCallback
connectedCallback
```

### --why--

Nejdřív musí objekt vzniknout, pak prohlížeč dohlásí všechny sledované atributy, které prvek už má, a teprve potom oznámí připojení do dokumentu. Proto v `connectedCallback` můžeš počítat s tím, že atributy jsou přečtené — a proto se v konstruktoru číst nedají.

### --see--

prohlizec-navic/web-components#atributy-observedattributes-a-attributechangedcallback

## --question--

Ve skriptu workeru napíšeš `document.querySelector('#stav')`. Co se stane?

### --correct--

Spadne to na `ReferenceError`, protože `document` ve workeru neexistuje.

#### --why--

Worker má vlastní globální objekt bez DOM. Má `fetch`, `postMessage`, `setTimeout` i `IndexedDB`, ale ke stránce se nedostane — kdyby mohl, musel by se s hlavním vláknem o DOM synchronizovat a celá výhoda by zmizela.

### --answer--

Vrátí `null`, protože ve workeru je prázdný dokument.

#### --why--

Žádný prázdný dokument tam není. Chyba nastane už u samotného jména, ne až u hledání.

### --answer--

Funguje to, worker vidí stejný dokument jako stránka.

#### --why--

Pak by se dvě vlákna přetahovala o tentýž strom prvků. Právě proto si worker se stránkou jen posílá zprávy.

### --see--

prohlizec-navic/web-workers#vlakno-navic-a-co-v-nem-neni

## --question--

Workeru pošleš `postMessage({ najdi: (x) => x > 3 })`. Jak se jmenuje chyba, kterou to skončí?

### --expected--

DataCloneError

### --why--

Zprávy se mezi vlákny předávají strukturovaným klonováním a to neumí zkopírovat funkce, prvky DOM ani instance vlastních tříd (ty ztratí prototyp). Posílej data, ne chování — pravidlo, které se z workeru hodí přenést i na `localStorage` a `IndexedDB`.

### --see--

prohlizec-navic/web-workers#postmessage-zpravy-misto-sdilene-pameti

## --question--

Nasadil jsi novou verzi aplikace, ale uživatelé pořád vidí starou. Service worker vrací `index.html` strategií [[cache-first]]. Co s tím?

### --correct--

Přepnout HTML na [[network-first]] — ze spíže ho brát až tehdy, když síť selže.

#### --why--

HTML je jediný soubor, jehož adresa se mezi verzemi nemění, a přitom nese odkazy na všechno ostatní. Proto se u něj čerstvost cení víc než rychlost.

### --answer--

Zvýšit `max-age` v hlavičce `Cache-Control`.

#### --why--

Delší platnost by problém ještě prodloužila. A hlavně: o odpovědi rozhoduje service worker, hlavička HTTP cache se v tomhle kroku vůbec neuplatní.

### --answer--

Smazat spíž při každém `fetch`.

#### --why--

Tím by offline režim přestal fungovat úplně — spíž by byla vždycky prázdná.

### --see--

prohlizec-navic/service-worker-a-pwa#tri-strategie-a-kdy-kterou
api-http-rest/cors-a-cache#cache-control

## --question--

V jaké události service workeru se spíž plní soubory, které má aplikace mít k dispozici hned po instalaci? Napiš jméno události.

### --expected--

install

### --why--

`install` se spustí jednou pro každou novou verzi skriptu a je to jediné místo, kde má smysl předem stáhnout kostru aplikace. Sahá se u toho po `event.waitUntil(…)`, aby prohlížeč instalaci neuzavřel dřív, než se stahování dokončí.

### --see--

prohlizec-navic/service-worker-a-pwa#zivotni-cyklus-install-activate-fetch
api-http-rest/cors-a-cache#cache-control

## --question--

V jaké události IndexedDB se zakládají objektová úložiště a indexy? Napiš jméno události.

### --expected--

upgradeneeded

### --why--

Je to jediná chvíle, kdy databáze dovolí měnit svoje schéma — spustí se při prvním otevření a pak vždy, když zvýšíš číslo verze. Zakládat úložiště kdykoli jindy skončí chybou, a to i tehdy, když ti to v konzoli zdánlivě projde.

### --see--

prohlizec-navic/indexeddb#indexeddb-v-peti-krocich

## --question--

**Opakování z dřívějška.** Aplikace má fungovat i bez signálu. Stačí na to dlouhé `Cache-Control`, nebo potřebuješ service worker?

### --correct--

Service worker — HTTP cache si prohlížeč řídí sám a offline se na ni spolehnout nedá.

#### --why--

`Cache-Control` je prosba, ne záruka: prohlížeč smí záznam kdykoli zahodit a ty nemáš jak zjistit, co v ní zrovna je. Service worker je kód, který sám rozhodne, co ze spíže vrátí a co pošle na síť — a spíž si plní on sám.

### --answer--

Stačí `Cache-Control: max-age=31536000` na všechny soubory.

#### --why--

Vyřeší to rychlost opakované návštěvy, ale ne offline režim: první navigační požadavek bez sítě skončí chybovou stránkou prohlížeče.

### --answer--

Stačí `localStorage`, do kterého si soubory uložíš při první návštěvě.

#### --why--

Z `localStorage` prohlížeč neumí obsloužit požadavek na skript ani na obrázek. Odchytit požadavek umí jedině service worker.

### --see--

prohlizec-navic/service-worker-a-pwa#zivotni-cyklus-install-activate-fetch
api-http-rest/cors-a-cache#cache-control

## --question--

**Opakování z dřívějška.** Prohlížeč posílá požadavek s hlavičkou `If-None-Match`. Jaký stavový kód mu server vrátí, když se obsah od minule nezměnil? Napiš jen číslo.

### --expected--

304

### --why--

`304 Not Modified` je odpověď bez těla: server jen potvrdí, že uložená kopie pořád platí. Ušetří se tím přenos, ale ne dotaz — a právě proto je spíž service workeru rychlejší i tam, kde ETag funguje dobře.

### --see--

api-http-rest/cors-a-cache#etag-a-304

## --question--

Aplikace na terénní zápisy si má pamatovat dva tisíce záznamů, každý s fotkou. Uložíš je do `localStorage`, nebo do IndexedDB?

### --correct--

Do IndexedDB — zvládne velký objem, ukládá i `Blob` a nezdržuje stránku.

#### --why--

`localStorage` má kolem pěti megabajtů, umí jen text a čte se synchronně, takže při každém přístupu zastaví vykreslování. Fotky by se do něj musely převádět na base64, což je objem navíc — a [[kvóta úložiště]] by došla dřív, než bys čekal.

### --answer--

Do `localStorage` — je jednodušší a stejně se všechno vejde.

#### --why--

Spočítej si to: dva tisíce fotek se do pěti megabajtů nevejdou ani při velké kompresi.

### --answer--

Do `sessionStorage` — přežije obnovení stránky a je větší.

#### --why--

`sessionStorage` má stejná omezení jako `localStorage` a navíc se maže se zavřením karty. Terénní zápisy by po cestě domů zmizely.

### --see--

prohlizec-navic/indexeddb#ctyri-uloziste-a-kdy-ktere

## --question--

Najdi v anglické dokumentaci: v MDN u rozhraní `ElementInternals` je metoda, kterou vlastní prvek ohlásí svoji hodnotu formuláři. Jak se jmenuje?

### --expected--

setFormValue

### --accept--

internals.setFormValue

### --why--

`this.attachInternals()` vrátí objekt `ElementInternals` a přes něj se prvek chová jako formulářové pole: `setFormValue` naplní hodnotu, `setValidity` nastaví validaci. Bez `static formAssociated = true` obojí skončí chybou `NotSupportedError`.

### --see--

prohlizec-navic/workshop-web-component/016

# --code-- Widget počasí od kolegy

## --file-- weather-widget.js

```js
const LABELS = {
  clear: 'Jasno',
  cloudy: 'Oblačno',
  rain: 'Déšť',
  snow: 'Sněžení',
};

const SAMPLE = [
  { day: 'Po', sky: 'clear', temp: 21.4 },
  { day: 'Út', sky: 'cloudy', temp: 18.9 },
  { day: 'St', sky: 'rain', temp: 15.2 },
];

class WeatherWidget extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'closed' });
    this.days = SAMPLE;
  }

  static get observedAttributes() {
    return ['city', 'unit'];
  }

  connectedCallback() {
    this.render();
    this.addEventListener('click', this.onClick.bind(this));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    this.render();
  }

  get unit() {
    return this.getAttribute('unit') === 'F' ? 'F' : 'C';
  }

  convert(celsius) {
    if (this.unit === 'F') {
      return Math.round(celsius * 9 / 5 + 32);
    }
    return Math.round(celsius);
  }

  render() {
    var rows = '';
    for (var i = 0; i < this.days.length; i++) {
      var d = this.days[i];
      rows += '<tr><td>' + d.day + '</td><td>' + LABELS[d.sky] + '</td><td>'
        + this.convert(d.temp) + '°' + this.unit + '</td></tr>';
    }
    this.root.innerHTML = ''
      + '<style>'
      + 'table { border-collapse: collapse; font: inherit; }'
      + 'td { padding: 2px 8px; border-bottom: 1px solid #ddd; }'
      + 'button { margin-top: 6px; }'
      + '</style>'
      + '<strong>' + (this.getAttribute('city') || 'Praha') + '</strong>'
      + '<table>' + rows + '</table>'
      + '<button type="button">Přepnout na °' + (this.unit === 'C' ? 'F' : 'C') + '</button>';
  }

  onClick(event) {
    var button = event.target.closest('button');
    if (!button) {
      return;
    }
    this.setAttribute('unit', this.unit === 'C' ? 'F' : 'C');
    this.dispatchEvent(new CustomEvent('unitchange', {
      detail: { unit: this.unit },
      bubbles: true,
    }));
  }
}

customElements.define('weather-widget', WeatherWidget);
```

## --question--

Prvek je ve stránce jako `<weather-widget city="Brno"></weather-widget>`. Co vrátí `convert(21.4)` na řádku 41 v `weather-widget.js`?

### --expected--

21

### --why--

Atribut `unit` chybí, takže getter na řádku 37 vrátí `'C'` a podmínka na řádku 42 neplatí. Zbude zaokrouhlení, tedy `21`. Všimni si, že getter nevrací `null` ani prázdný řetězec — výchozí hodnota se řeší v něm, ne ve všech místech, která ho volají.

### --see--

prohlizec-navic/web-components#atributy-observedattributes-a-attributechangedcallback

## --question--

Prvek má `unit="F"`. Co vrátí `convert(20)` na řádku 41 v `weather-widget.js`?

### --expected--

68

### --why--

`20 * 9 / 5 + 32` je `68`. Ve Fahrenheitech vychází z nuly Celsia hodnota 32, takže mezivýpočet 36 plus 32.

### --see--

prohlizec-navic/web-components#atributy-observedattributes-a-attributechangedcallback

## --question--

Kliknutí na tlačítko uvnitř widgetu nic nedělá. Proč `event.target.closest('button')` na řádku 67 v `weather-widget.js` tlačítko nenajde?

### --correct--

Posluchač je na řádku 27 zapsaný na komponentě, tedy za hranicí stínu — a tam už `target` ukazuje na celou komponentu.

#### --why--

Prohlížeč cíl události při přechodu přes hranici stínu přepíše, aby ven neprozradil vnitřek komponenty. Opravou je zapsat posluchače na `this.root`, nebo sáhnout po `event.composedPath()[0]`.

### --answer--

Protože `mode: 'closed'` zakazuje události ze stínu ven.

#### --why--

`mode` ovlivňuje jen to, jestli je `element.shadowRoot` vidět z JavaScriptu. Události i styly se chovají stejně u obou režimů.

### --answer--

Protože tlačítko vzniklo přes `innerHTML`, takže na něj posluchač nedosáhne.

#### --why--

Posluchač na rodiči chytá i prvky, které vznikly později — to je běžná delegace a ta tu funguje.

### --see--

prohlizec-navic/web-components#shadow-dom-styly-ktere-nikam-neutecou

## --question--

Kolega by chtěl, aby se událost `unitchange` (řádek 72 v `weather-widget.js`) dala poslouchat i tehdy, když widget zabalí do jiné komponenty se shadow DOM. Co musí do nastavení události přidat?

### --correct--

`composed: true`

#### --why--

`bubbles` posílá událost nahoru stromem, `composed` jí dovolí projít hranicí stínu. Dokud je widget přímo ve stránce, chybějící `composed` nikdo nepozná — problém se objeví až ve chvíli, kdy ho někdo zanoří.

### --answer--

`cancelable: true`

#### --why--

`cancelable` jen povolí `preventDefault()`. Na cestu události nemá vliv.

### --answer--

`detail: { bubbles: true }`

#### --why--

`detail` je místo pro data pro posluchače. Nastavení události se čtou z objektu vedle něj, ne z něj.

### --see--

prohlizec-navic/web-components#ven-jen-udalosti
