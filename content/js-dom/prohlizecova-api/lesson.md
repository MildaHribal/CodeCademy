# Stav a API prohlížeče

:::check pretest
Co vrátí druhý řádek? Tipni si.

```js
localStorage.setItem('favorites', ['monstera', 'aloe']);
localStorage.getItem('favorites');
```

### --answer--

Pole `['monstera', 'aloe']`, přesně to, co se uložilo.

#### --why--

Tak by to fungovalo s proměnnou. Co `localStorage` s hodnotou udělá, vysvětlí první část lekce.

### --correct--

Řetězec `'monstera,aloe'`.

#### --why--

`localStorage` umí ukládat jen text a pole na text převede samo. Jak uložit pole tak, aby se vrátilo jako pole, ukáže první část.

### --answer--

`null`, protože pole se do `localStorage` uložit nedá.

#### --why--

Uložit se dá, jen ne tak, jak čekáš. Co přesně se uloží, uvidíš v první části.
:::

:::check pretest
Uživatelka si v e-shopu vyfiltruje „Kapradiny do 500 Kč" a odkaz z adresního řádku pošle kamarádce. Filtr je uložený jen v proměnné `filters` v JavaScriptu. Co kamarádka po otevření odkazu uvidí?

### --answer--

Stejný výběr kapradin, odkaz vede na stejnou stránku.

#### --why--

Odkaz nese jen to, co je v adrese. Kam filtr uložit, aby se s odkazem poslal, vysvětlí část o stavu v adrese.

### --correct--

Celý katalog bez filtru.

#### --why--

Proměnná žije jen v jedné otevřené stránce. Kamarádka dostane adresu, a v té filtr není. Jak ho tam dostat, ukáže část o stavu v adrese.
:::

Filtr v e-shopu, který po obnovení stránky zůstane nastavený. Tmavý motiv, který si web pamatuje i po týdnu. Obrázky, které se načtou, až k nim uživatel doscrolluje. Tlačítko „Kopírovat odkaz". Nic z toho neumí JavaScript sám — všechno jsou to API prohlížeče, ke kterým se z kódu dostaneš přes objekty `localStorage`, `location`, `history` a `navigator`.

> [!REMEMBER]
> **Proměnná zmizí s každým obnovením stránky. Co má přežít, patří do adresy (pošle se s odkazem) nebo do `localStorage` (zůstane v tomhle prohlížeči).**

## `localStorage`: paměť, která přežije obnovení

`localStorage` je malé úložiště dvojic klíč a hodnota, které prohlížeč drží pro každý web zvlášť. Přežije obnovení stránky i zavření prohlížeče a vejde se do něj zhruba 5 MB textu:

- `localStorage.setItem('theme', 'dark')` uloží hodnotu pod klíč,
- `localStorage.getItem('theme')` ji přečte, **a když klíč neexistuje, vrátí `null`**,
- `localStorage.removeItem('theme')` klíč smaže.

Jeho dvojče `sessionStorage` má stejné metody, ale data drží jen do zavření karty.

:::live
```html
<article class="card">
  <p class="card__eyebrow">Zelený kout</p>
  <h2>Pokojové rostliny s doručením do druhého dne</h2>
  <button type="button" class="theme-toggle" aria-pressed="false">Tmavý motiv</button>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 1.5rem; background: #f4f7f2; color: #1f2a1d; transition: background-color 0.3s, color 0.3s; }
body.is-dark { background: #16201a; color: #e7efe4; }
.card { max-width: 24rem; padding: 1.5rem; border-radius: 1rem; background: rgb(255 255 255 / 0.7); box-shadow: 0 10px 30px rgb(0 0 0 / 0.08); }
body.is-dark .card { background: rgb(255 255 255 / 0.06); }
.card__eyebrow { margin: 0; color: #3f7d4e; font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em; }
.theme-toggle { font: inherit; padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid currentColor; background: transparent; color: inherit; cursor: pointer; }
.theme-toggle[aria-pressed="true"] { background: #3f7d4e; border-color: #3f7d4e; color: white; }
```
```js
const toggle = document.querySelector('.theme-toggle');

function applyTheme(theme) {
  document.body.classList.toggle('is-dark', theme === 'dark');
  toggle.setAttribute('aria-pressed', String(theme === 'dark'));
}

// 1. při startu použij uloženou volbu, jinak světlý motiv
applyTheme(localStorage.getItem('theme') ?? 'light');

toggle.addEventListener('click', () => {
  // 2. přepni motiv a volbu ulož
  const theme = document.body.classList.contains('is-dark') ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
  applyTheme(theme);
});
```
:::

Úložiště v náhledu Akademie je jen dočasné a vyprázdní se při každém překreslení ukázky; na skutečném webu volba přežije i zavření prohlížeče. Nasimuluj proto „návrat na web": přidej na začátek kódu řádek `localStorage.setItem('theme', 'dark');` a sleduj, s jakým motivem ukázka začne.

### Jen řetězce: `JSON.stringify` a `JSON.parse`

Hodnota v `localStorage` je vždycky **text**. Co není řetězec, převede prohlížeč na řetězec sám — a u pole nebo objektu to dopadne špatně:

:::live js predict
```js
localStorage.setItem('cart', { plant: 'Monstera', quantity: 2 });

const saved = localStorage.getItem('cart');
console.log(typeof saved, saved);
```
--question-- Co vypíše `console.log`?
--expected-- string [object Object]
--why-- `setItem` hodnotu převedl na text stejně jako `String(objekt)`, a z objektu tak zbyl jen text `[object Object]`. Data jsou pryč a zpátky už je nedostaneš. Zkus místo objektu uložit `JSON.stringify({ plant: 'Monstera', quantity: 2 })` a na čtení použít `JSON.parse(saved)`.
:::

Pole a objekty proto ukládáš jako JSON: `JSON.stringify` z nich udělá text, `JSON.parse` z textu zase pole nebo objekt. Pozor na první návštěvu: klíč ještě neexistuje, `getItem` vrátí `null` a `JSON.parse(null)` vrátí taky `null`. Výchozí hodnotu doplníš operátorem `??`.

> [!REMEMBER]
> **Do `localStorage` jen text: ukládej `JSON.stringify(data)`, čti `JSON.parse(localStorage.getItem(klíč)) ?? výchozí`.**

:::check
Oblíbené rostliny se ukládají pod klíčem `favorites` jako JSON pole. Napiš výraz, který je přečte jako pole — a při první návštěvě, kdy klíč ještě neexistuje, vrátí prázdné pole.

### --expected--

JSON.parse(localStorage.getItem('favorites')) ?? []

### --accept--

JSON.parse(localStorage.getItem('favorites') ?? '[]')
JSON.parse(localStorage.getItem('favorites')) || []
JSON.parse(localStorage.getItem('favorites') || '[]')

### --why--

`getItem` pro neexistující klíč vrátí `null` a `JSON.parse(null)` je taky `null`. Výchozí hodnotu doplní `?? []` za `JSON.parse`, nebo `?? '[]'` ještě před ním.

### --see--

js-dom/prohlizecova-api#jen-retezce-json-stringify-a-json-parse
:::

## Když úložiště zklame

Data v `localStorage` nemáš pod kontrolou. Uživatel je smaže nebo přepíše v DevTools, starší verze tvé aplikace je mohla uložit v jiném tvaru a prohlížeč může úložiště úplně zakázat. Tři situace, se kterými musí kód počítat:

| co se stane | příznak | obrana |
|---|---|---|
| uložený text není platný JSON | `SyntaxError: "[object Object]" is not valid JSON` při startu — a stránka zůstane prázdná | `JSON.parse` do `try`/`catch`, v `catch` výchozí hodnota |
| úložiště je plné (zhruba 5 MB) | `QuotaExceededError` při `setItem` | `try`/`catch` kolem zápisu, aplikace funguje dál bez uložení |
| JSON je platný, ale jiného tvaru | `favorites.includes is not a function` | ověř tvar, třeba `Array.isArray(saved)` |

Proto se čtení zabalí do jedné malé funkce, která vždycky vrátí použitelnou hodnotu:

```js
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('cart'));
    // 1. uložená data musí mít tvar, se kterým aplikace umí pracovat
    return Array.isArray(saved) ? saved : [];
  } catch {
    // 2. rozbitý JSON nesmí shodit start aplikace
    return [];
  }
}
```

`catch` bez závorky s proměnnou je v pořádku, když chybu k ničemu nepotřebuješ.

> [!PITFALL]
> **Do `localStorage` nepatří hesla ani přihlašovací tokeny.** Přečte ho jakýkoli skript na stránce, takže jediná díra typu [[XSS]] prozradí všechno, co v něm je. Přihlášení se řeší přes cookies s atributem `HttpOnly` — k tomu se dostaneš v sekci o autentizaci.

:::check
Aplikace po nasazení nové verze některým uživatelům neukáže vůbec nic a v konzoli je `SyntaxError: Unexpected token 'M', "Monstera" is not valid JSON`. Stará verze ukládala oblíbenou rostlinu jako obyčejný text. Co je nejlepší oprava?

### --answer--

Říct uživatelům, ať si vymažou data webu v prohlížeči.

#### --why--

Na pár lidí by to zabralo, ale chyba by se vrátila u každého, kdo aplikaci ještě neotevřel. Kód musí s nečekanými daty počítat sám.

### --correct--

Obalit `JSON.parse` do `try`/`catch` a v `catch` pokračovat s výchozí hodnotou.

#### --why--

Data v úložišti mohou být jakákoli. Funkce, která je čte, má při rozbitém JSON vrátit výchozí hodnotu a nechat aplikaci běžet.

### --answer--

Místo `JSON.parse` číst hodnotu přes `String(localStorage.getItem(…))`.

#### --why--

`String` by rozbitá data nespravil, jen by aplikace dostala text místo pole. Problém je v tom, že čtení nepočítá s nečekaným obsahem.

### --see--

js-dom/prohlizecova-api#kdyz-uloziste-zklame
:::

## Stav v adrese: `URL` a `URLSearchParams`

Adresa stránky nese kromě cesty i **[[parametry adresy|parametry]]** (*query string*): v `https://zelenykout.cz/katalog?kategorie=kapradiny&razeni=cena` je to všechno za otazníkem. Parametry se pošlou s odkazem, zůstanou v záložkách a přežijí obnovení — přesně to filtr v e-shopu potřebuje.

Řetězec nemusíš rozebírat ručně:

- `new URL(adresa)` rozloží celou adresu na části (`pathname`, `search`, `hash`…) a vlastnost `url.searchParams` dá parametry,
- `new URLSearchParams(text)` pracuje jen s parametry, třeba s `location.search`,
- `params.get('kategorie')` vrátí hodnotu jako řetězec, nebo `null`, když parametr chybí; `getAll` vrátí všechny hodnoty stejného jména,
- `params.set(…)`, `params.delete(…)` a `params.toString()` parametry upraví a složí zpátky do textu, i s kódováním mezer a diakritiky.

:::live js predict
```js
const params = new URLSearchParams('?q=aloe&svetlo=slunce&svetlo=polostin');

console.log(params.get('svetlo'), params.getAll('svetlo').length, params.get('cena'));
```
--question-- Co vypíše `console.log`? Tři hodnoty oddělené mezerou.
--expected-- slunce 2 null
--why-- `get` vrátí jen první hodnotu daného jména, všechny dá `getAll`. Parametr `cena` v adrese není, a tak `get` vrátí `null` — ne prázdný řetězec a ne `undefined`. Zkus přidat `params.set('q', 'čínský penízovník')` a vypsat `params.toString()`.
:::

Hodnoty z adresy jsou vždycky řetězce, stejně jako u formuláře. A protože adresu může kdokoli ručně přepsat, **nevěř jí**: `?razeni=nesmysl` nesmí aplikaci shodit, jen se použije výchozí řazení.

:::check
V proměnné `address` je text `https://zelenykout.cz/katalog?kategorie=sukulenty&strana=3`. Napiš výraz, který z ní vrátí číslo stránky jako **číslo**.

### --expected--

Number(new URL(address).searchParams.get('strana'))

### --accept--

+new URL(address).searchParams.get('strana')
parseInt(new URL(address).searchParams.get('strana'), 10)
parseInt(new URL(address).searchParams.get('strana'))
Number(new URLSearchParams(new URL(address).search).get('strana'))

### --why--

`new URL` adresu rozloží, `searchParams.get` vrátí hodnotu parametru jako řetězec `'3'` a `Number` z ní udělá číslo.

### --see--

js-dom/prohlizecova-api#stav-v-adrese-url-a-urlsearchparams
:::

## Historie: `pushState`, `replaceState` a `popstate`

Změnit adresu přes `location.search = '?kategorie=kapradiny'` jde, ale prohlížeč pak **načte stránku znovu** a všechen stav v proměnných je pryč. Aplikace proto adresu mění přes History API, bez načtení:

- `history.pushState(stav, '', url)` změní adresu a **přidá záznam do historie**, takže tlačítko Zpět se vrátí na předchozí adresu,
- `history.replaceState(stav, '', url)` změní adresu a **přepíše** aktuální záznam — hodí se při psaní do hledání, kde by každé písmeno jinak znamenalo jedno kliknutí na Zpět,
- když uživatel klikne na Zpět nebo Vpřed, přijde na `window` událost `popstate`. Adresa se změní, ale obsah stránky za tebe nikdo nepřekreslí — posluchač musí adresu přečíst a vykreslit stránku podle ní.

První argument je objekt stavu, který se k záznamu uloží (`history.state`); prostřední argument prohlížeče ignorují a píše se do něj prázdný řetězec.

:::live
```html
<nav class="chips" aria-label="Kategorie">
  <button type="button" data-category="vse">Vše</button>
  <button type="button" data-category="kapradiny">Kapradiny</button>
  <button type="button" data-category="sukulenty">Sukulenty</button>
</nav>
<p class="result"></p>
<p class="address">Parametry adresy: <code></code></p>
<button type="button" class="back">← Zpět</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; color: #1f2a1d; }
.chips { display: flex; gap: 0.5rem; }
.chips button, .back { font: inherit; padding: 0.4rem 0.9rem; border-radius: 999px; border: 1px solid #9bbf9f; background: white; cursor: pointer; transition: background-color 0.2s; }
.chips button[aria-pressed="true"] { background: #3f7d4e; border-color: #3f7d4e; color: white; }
.back:disabled { opacity: 0.4; cursor: default; }
.result { font-size: 1.25rem; font-weight: 600; }
```
```js
const result = document.querySelector('.result');
const back = document.querySelector('.back');

// 1. stránka se vykreslí jen z adresy
function render() {
  const category = new URL(location.href).searchParams.get('kategorie') ?? 'vse';
  result.textContent = `Zobrazuji kategorii: ${category}`;
  document.querySelector('.address code').textContent = location.search || '(žádné)';
  for (const chip of document.querySelectorAll('[data-category]')) {
    chip.setAttribute('aria-pressed', String(chip.dataset.category === category));
  }
  back.disabled = (history.state?.depth ?? 0) === 0;
}

// 2. kliknutí změní adresu a přidá záznam do historie
document.querySelector('.chips').addEventListener('click', (event) => {
  const chip = event.target.closest('[data-category]');
  if (!chip) return;
  const url = new URL(location.href);
  url.searchParams.set('kategorie', chip.dataset.category);
  history.pushState({ depth: (history.state?.depth ?? 0) + 1 }, '', url);
  render();
});

// 3. Zpět a Vpřed: adresu změnil prohlížeč, stránku překreslíme my
window.addEventListener('popstate', render);
back.addEventListener('click', () => history.back());

render();
```
:::

Klikni postupně na Kapradiny a Sukulenty a pak dvakrát na **Zpět**. Potom smaž řádek s posluchačem `popstate` a zkus to znovu: adresa se vrací, nápis ne. Hloubku v objektu stavu ukázka nese jen proto, aby tlačítko Zpět nevedlo mimo ni.

> [!TIP]
> Adresu vždycky skládej přes `new URL(location.href)` a `url.searchParams.set(…)`, ne ručním spojováním textu. Nezapomeneš na kódování a funguje to i ve vložených rámech, kde má stránka neobvyklou adresu — třeba v náhledu Akademie, který běží na `about:srcdoc`.

:::live js predict
```js
window.addEventListener('popstate', () => console.log('popstate'));

const url = new URL(location.href);
url.searchParams.set('strana', '2');
history.pushState(null, '', url);

console.log(new URL(location.href).searchParams.get('strana'));
```
--question-- Co se vypíše? Každý výpis na nový řádek.
--expected-- 2
--why-- `pushState` změnil adresu hned, takže poslední řádek přečte `2`. Událost `popstate` ale nepřišla: prohlížeč ji posílá jen při pohybu v historii (Zpět, Vpřed, `history.back()`), ne při `pushState` ani `replaceState`. Proto po `pushState` voláš vykreslení sám. Zkus na konec přidat `history.back()`.
:::

> [!NOTE]
> Novější Navigation API (`navigation.navigate`, událost `navigate`) je od roku 2026 ve všech hlavních prohlížečích. History API ale najdeš v každém existujícím webu i uvnitř routerů frameworků, a proto se učíš nejdřív ho.

:::check
Katalog po kliknutí na kategorii volá `history.pushState` a stránku překreslí. Uživatel pak klikne v prohlížeči na Zpět: adresa se vrátí na předchozí kategorii, ale seznam rostlin zůstane stejný. Co chybí?

### --answer--

`replaceState` místo `pushState`.

#### --why--

`replaceState` záznam přepíše, takže by se Zpět vrátil úplně mimo katalog. Adresa se tu vrací správně, problém je s obsahem.

### --correct--

Posluchač `popstate`, který přečte adresu a stránku podle ní překreslí.

#### --why--

Při pohybu v historii prohlížeč změní jen adresu a pošle `popstate`. Obsah podle adresy musí vykreslit tvůj kód.

### --answer--

Volání `location.reload()` po kliknutí na kategorii.

#### --why--

Znovunačtení by zahodilo celý stav stránky a zrušilo výhodu `pushState`. Stačí reagovat na událost, kterou prohlížeč při Zpět posílá.

### --see--

js-dom/prohlizecova-api#historie-pushstate-replacestate-a-popstate
:::

## Adresa, `localStorage`, nebo proměnná

Každý kus stavu patří na jedno místo. Rozhoduje, **komu** má patřit a **jak dlouho** má žít:

| stav | kam | proč |
|---|---|---|
| hledaný text, filtr, řazení, číslo stránky, otevřená záložka | adresa | pošle se odkazem, zůstane v záložkách, Zpět funguje |
| motiv, zvolený jazyk, oblíbené bez přihlášení, rozepsaný koncept | `localStorage` | osobní volba v tomhle prohlížeči, do odkazu nepatří |
| otevřené menu, text při psaní, stav načítání | proměnná | po obnovení ho nikdo nečeká |
| objednávky, profil, cokoli z účtu | server | musí být stejné na telefonu i na počítači |

Když se stav dá odvodit z jiného stavu (počet výsledků z filtru), neukládej ho nikam — spočítej ho při vykreslení.

> [!REMEMBER]
> **Adresa = stav, který se sdílí s odkazem. `localStorage` = osobní volba v tomhle prohlížeči.** Jeden kus stavu má vždycky jen jedno místo, odkud se čte.

:::explain
Vysvětli vlastními slovy, proč filtr katalogu patří do adresy, ale tmavý motiv do `localStorage`.

## --model--

Filtr popisuje, co je na stránce vidět, a to má jít poslat odkazem, uložit do záložek a vrátit tlačítkem Zpět. To všechno umí jen adresa, protože se s odkazem posílá celá. Tmavý motiv je osobní volba konkrétního člověka v jeho prohlížeči: kamarádka, které pošlu odkaz, má mít svůj motiv, ne můj. Proto motiv patří do `localStorage`, které přežije obnovení, ale do odkazu se nedostane.

## --checklist--

- Filtr určuje obsah stránky, a ten se má dát sdílet odkazem.
- Adresa se posílá s odkazem, zůstává v záložkách a funguje s ní tlačítko Zpět.
- Motiv je osobní volba, která do odkazu nepatří.
- `localStorage` přežije obnovení, ale zůstává jen v tomhle prohlížeči.
:::

:::check
Uživatel píše dlouhou recenzi kávovaru a nechce o ni přijít, když omylem zavře kartu. Kam rozepsaný text průběžně ukládat?

### --answer--

Do adresy, parametr `?recenze=…`.

#### --why--

Adresa je na dlouhý rozepsaný text špatné místo: poslala by se s každým sdíleným odkazem a zavřením karty by zmizela i tak.

### --correct--

Do `localStorage` pod klíčem, třeba podle produktu.

#### --why--

Rozepsaný koncept je osobní a má přežít zavření karty v tomhle prohlížeči. Po odeslání recenze se klíč smaže.

### --answer--

Do `sessionStorage`.

#### --why--

`sessionStorage` přežije obnovení, ale se zavřením karty se smaže — a právě o to tu jde.

### --see--

js-dom/prohlizecova-api#adresa-localstorage-nebo-promenna
:::

## Událost `storage`: změna v jiné kartě

Uživatel má katalog otevřený ve dvou kartách a v jedné přidá rostlinu do oblíbených. Druhá karta o tom neví, dokud ji neobnoví. Prohlížeč jí to ale ohlásí: když se `localStorage` změní, přijde událost `storage` **do všech ostatních karet a oken stejného webu** — do té, která zapisovala, ne.

```js
window.addEventListener('storage', (event) => {
  // 1. zajímá nás jen náš klíč
  if (event.key !== 'favorites') return;
  // 2. nová hodnota je text nebo null (klíč smazaný)
  favorites = JSON.parse(event.newValue ?? '[]');
  render();
});
```

Objekt události nese `key`, `oldValue` a `newValue`. Živou ukázku tady nemáš: náhled je jediná stránka a událost do ní nikdy nepřijde. Vyzkoušet si ji můžeš ve vlastním projektu se dvěma otevřenými kartami.

:::check
Karta A zapíše `localStorage.setItem('cart', '[]')` a má posluchač `storage`. Stejný web je otevřený i v kartě B, taky s posluchačem. Kde se posluchač spustí?

### --answer--

V obou kartách.

#### --why--

Karta, která zapisovala, o změně ví — sama ji udělala. Událost dostanou jen ty ostatní.

### --correct--

Jen v kartě B.

#### --why--

`storage` ohlašuje změnu provedenou jinde, proto přijde jen ostatním kartám a oknům stejného webu.

### --answer--

Nikde, `storage` hlásí jen změny z DevTools.

#### --why--

Událost přijde při každé změně úložiště z kódu jiné karty, DevTools nejsou výjimka ani podmínka.

### --see--

js-dom/prohlizecova-api#udalost-storage-zmena-v-jine-karte
:::

## Sledování prvků: `IntersectionObserver` a `ResizeObserver`

Karty, které plynule vyjedou, až na ně uživatel doscrolluje. Obrázek, který se začne stahovat, až když se blíží k obrazovce. Seznam, který načte další stránku, když uživatel dojede na konec. Dřív se tohle psalo posluchačem `scroll` a výpočtem polohy prvku při každém pohybu kolečka. Dnes to prohlížeč umí sám a úsporně: **`IntersectionObserver` zavolá tvou funkci, když prvek vjede do viditelné oblasti nebo z ní vyjede.**

:::live
```html
<p class="hint">Posouvej náhled dolů.</p>
<div class="spacer"></div>
<article class="reveal">Monstera deliciosa — 649 Kč</article>
<article class="reveal">Aloe vera — 189 Kč</article>
<article class="reveal">Čínský penízovník — 259 Kč</article>
<article class="reveal">Zamiokulkas — 429 Kč</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; color: #1f2a1d; }
.hint { color: #5b6b58; }
.spacer { height: 110vh; }
.reveal { margin-block: 1rem; padding: 1.25rem; border-radius: 1rem; background: #e3efe0; font-weight: 600; opacity: 0; translate: 0 2rem; transition: opacity 0.6s ease, translate 0.6s ease; }
.reveal.is-visible { opacity: 1; translate: 0 0; }
@media (prefers-reduced-motion: reduce) { .reveal { transition: none; } }
```
```js
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    // 1. zajímá nás jen vjezd do viditelné oblasti
    if (!entry.isIntersecting) continue;
    // 2. ukaž kartu a přestaň ji sledovat
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }
}, { threshold: 0.5 });

for (const card of document.querySelectorAll('.reveal')) {
  observer.observe(card);
}
```
:::

Posouvej náhled dolů a sleduj karty. `threshold: 0.5` znamená „ohlas, až bude vidět polovina prvku". Zkus ho změnit na `1` a pak smaž řádek s `unobserve` a posouvej nahoru a dolů — karty zůstanou vidět, protože třídu nikdo neodebírá.

Callback dostane pole záznamů (*entries*), protože sledovat jde víc prvků najednou. Poprvé ho prohlížeč zavolá **hned po `observe`** s aktuálním stavem, ne až při prvním posunu. Volba `rootMargin: '200px'` hlásí prvek o 200 px dřív, než na obrazovku opravdu vjede — přesně to chceš u načítání obrázků.

`ResizeObserver` funguje stejně, jen hlásí **změnu velikosti prvku**, ne okna: graf, který se má překreslit, když se zúží postranní panel, nebo karta, která při malé šířce přepne rozvržení. Na čistě vizuální změny podle šířky ale stačí container queries v CSS, k nim se dostaneš v sekci o responzivním designu.

:::check
Katalog má na konci seznamu prázdný prvek `.sentinel` a má načíst další rostliny, jakmile se `.sentinel` objeví na obrazovce. Který přístup je nejlepší?

### --answer--

Posluchač `scroll` na `window`, který při každém posunu spočítá polohu `.sentinel`.

#### --why--

Funguje to, ale kód běží při každém pohybu kolečka a prvek se měří pořád dokola. Prohlížeč má na tuhle otázku vlastní nástroj.

### --correct--

`IntersectionObserver`, který sleduje `.sentinel` a v callbacku při `isIntersecting` načte další.

#### --why--

Observer zavolá funkci jen tehdy, když prvek do viditelné oblasti vjede nebo z ní vyjede, a měření dělá prohlížeč sám.

### --answer--

`ResizeObserver` na seznamu.

#### --why--

`ResizeObserver` hlásí změnu velikosti prvku. Jestli je prvek vidět, neřeší.

### --see--

js-dom/prohlizecova-api#sledovani-prvku-intersectionobserver-a-resizeobserver
:::

## Plynulé změny: `requestAnimationFrame` a čtení layoutu

Prohlížeč překresluje stránku zhruba 60krát za vteřinu, na rychlých displejích i víckrát. `requestAnimationFrame(callback)` zavolá funkci **těsně před dalším překreslením** a předá jí čas. Na animaci řízenou JavaScriptem je to správné místo: změna se stihne do snímku, a když je karta na pozadí, prohlížeč volání pozastaví a nešetří jen výkon, ale i baterii.

:::live
```html
<section class="stats">
  <p class="stat"><span class="stat__value" data-target="12480">0</span> prodaných rostlin</p>
  <p class="stat"><span class="stat__value" data-target="96">0</span> % spokojených zákazníků</p>
</section>
<button type="button" class="replay">Přehrát znovu</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; color: #1f2a1d; }
.stats { display: flex; gap: 2rem; }
.stat { margin: 0; color: #5b6b58; }
.stat__value { display: block; font-size: 2.5rem; font-weight: 700; color: #3f7d4e; font-variant-numeric: tabular-nums; }
.replay { font: inherit; margin-top: 1rem; padding: 0.4rem 0.9rem; border-radius: 0.5rem; border: 1px solid #9bbf9f; background: white; cursor: pointer; }
```
```js
const duration = 1200;

function countUp(element) {
  const target = Number(element.dataset.target);
  let start = null;

  function frame(time) {
    // 1. kolik z animace už uběhlo (0 až 1)
    start ??= time;
    const progress = Math.min((time - start) / duration, 1);
    // 2. zapiš mezihodnotu
    element.textContent = Math.round(target * progress).toLocaleString('cs-CZ');
    // 3. naplánuj další snímek, dokud animace neskončí
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function playAll() {
  for (const value of document.querySelectorAll('.stat__value')) countUp(value);
}

document.querySelector('.replay').addEventListener('click', playAll);
playAll();
```
:::

Zkus změnit `duration` na `3000`. Pak nahraď `requestAnimationFrame(frame)` uvnitř funkce `frame` za `setTimeout(() => frame(performance.now()), 100)` a porovnej plynulost. Kdo má v systému zapnuté omezení animací (`prefers-reduced-motion`), měl by čísla dostat rovnou — to se naučíš v sekci o animacích.

### Čtení a zápis layoutu střídavě

Vlastnosti jako `offsetHeight`, `clientWidth` nebo `getBoundingClientRect()` vracejí **aktuální** rozměry. Když jsi předtím změnil styly, prohlížeč musí rozvržení stránky přepočítat hned, uprostřed tvého kódu. Jedno měření nevadí. Střídat čtení a zápis v cyklu ale znamená přepočet v každém průchodu — tomu se říká [[layout thrashing]] a na dlouhém seznamu stránka viditelně zadrhne.

```js
// přepočet rozvržení v každém průchodu: čte, zapisuje, čte, zapisuje…
for (const card of cards) {
  card.style.minHeight = `${list.clientHeight / 4}px`;
}

// jedno měření, pak jen zápisy
const rowHeight = list.clientHeight / 4;
for (const card of cards) {
  card.style.minHeight = `${rowHeight}px`;
}
```

:::live js predict
```js
requestAnimationFrame(() => console.log('snímek'));
console.log('konec skriptu');
```
--question-- V jakém pořadí se vypíšou řádky? Každý na nový řádek.
--expected--
```text
konec skriptu
snímek
```
--why-- `requestAnimationFrame` funkci nezavolá hned, ale naplánuje ji na chvíli před dalším překreslením. Překreslit se dá až po doběhnutí skriptu, a tak se nejdřív vypíše `konec skriptu`. Proč přesně to tak je, rozebere sekce o asynchronním JavaScriptu.
:::

:::check
Proč první cyklus v ukázce čtení a zápisu zpomaluje stránku víc než druhý, když oba nastaví stejné výšky?

### --answer--

Protože template literal uvnitř cyklu je pomalý.

#### --why--

Složení textu je zanedbatelné. Drahé je něco, co musí udělat prohlížeč.

### --correct--

Každý průchod po zápisu stylu znovu čte `clientHeight`, a prohlížeč tak musí rozvržení přepočítat v každém průchodu.

#### --why--

Čtení rozměrů po změně stylů vynutí okamžitý přepočet layoutu. Druhý cyklus měří jednou a pak jen zapisuje, takže přepočet proběhne jednou.

### --answer--

Protože první cyklus nastavuje `minHeight` a druhý `height`.

#### --why--

Oba cykly zapisují stejnou vlastnost. Liší se tím, kdy čtou rozměry.

### --see--

js-dom/prohlizecova-api#cteni-a-zapis-layoutu-stridave
:::

## Schránka: Clipboard API

Tlačítko „Kopírovat odkaz" nebo „Kopírovat kód slevy" napíšeš přes `navigator.clipboard.writeText(text)`. Metoda **nevrací výsledek hned**: kopírování může trvat a prohlížeč ho může odmítnout (stránka bez HTTPS, uživatel nic nestiskl, zakázané oprávnění). Vrátí proto *Promise* — slib, že výsledek přijde později. `.then(funkce)` se spustí po úspěchu, `.catch(funkce)` po odmítnutí. Promise do hloubky probereš v sekci o asynchronním JavaScriptu.

:::live
```html
<p class="share">Pošli výběr kamarádce:
  <button type="button" class="copy">Kopírovat odkaz</button>
</p>
<p class="status" role="status"></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; color: #1f2a1d; }
.copy { font: inherit; padding: 0.4rem 0.9rem; border-radius: 0.5rem; border: 0; background: #3f7d4e; color: white; cursor: pointer; }
.status { min-height: 1.5em; color: #5b6b58; }
```
```js
const status = document.querySelector('.status');

document.querySelector('.copy').addEventListener('click', () => {
  navigator.clipboard.writeText(location.href)
    .then(() => {
      status.textContent = 'Odkaz je ve schránce.';
    })
    .catch(() => {
      status.textContent = 'Kopírování se nepovedlo. Zkopíruj adresu z adresního řádku.';
    });
});
```
:::

Klikni na tlačítko. Náhled Akademie běží v izolovaném rámu, kterému prohlížeč schránku nepůjčí, takže uvidíš druhou větu — přesně to, co uvidí uživatel, jehož prohlížeč kopírování zakáže. Na webu s HTTPS se odkaz zkopíruje. Zkus smazat celý `.catch(…)` a klikni znovu: v konzoli se objeví nezachycená chyba `NotAllowedError`.

:::check
Proč stavová zpráva v ukázce nastaví text až uvnitř `.then` a ne hned na řádku za `writeText`?

### --answer--

Protože `textContent` nejde nastavit uvnitř posluchače kliknutí.

#### --why--

V posluchači jde měnit stránku bez omezení. Rozhoduje, kdy je známo, jestli kopírování prošlo.

### --correct--

`writeText` vrací Promise a výsledek kopírování je známý až později; zpráva hned za voláním by ohlásila úspěch i při odmítnutí.

#### --why--

Kód za `writeText` se spustí dřív, než prohlížeč kopírování dokončí nebo zamítne. Úspěch patří do `.then`, neúspěch do `.catch`.

### --answer--

Protože `writeText` stránku na chvíli zablokuje.

#### --why--

Nezablokuje, právě proto vrací Promise a kód pokračuje dál. Otázka je, kdy víš, jak kopírování dopadlo.

### --see--

js-dom/prohlizecova-api#schranka-clipboard-api
:::

## Typické chyby a pasti

### `[object Object]` v úložišti

> [!PITFALL]
> **Po obnovení stránky jsou uložená data pryč a v konzoli je `SyntaxError: "[object Object]" is not valid JSON`.** Příčina: `localStorage.setItem('cart', cart)` bez `JSON.stringify` — objekt se převedl na text `[object Object]` a pole na čárkami oddělené hodnoty. Oprava: ukládej `JSON.stringify(cart)` a čti přes `JSON.parse` v `try`/`catch`.

### Čísla z úložiště a z adresy se sčítají jako text

> [!PITFALL]
> **`Number(localStorage.getItem('visits')) + 1` funguje, `localStorage.getItem('visits') + 1` dá `'41'`.** Úložiště i `searchParams.get` vracejí řetězce (nebo `null`). Oprava: převeď hodnotu hned při čtení a počítej s `null` — `Number(null)` je `0`, ale `Number('')` taky, takže chybějící hodnotu rozliš podmínkou.

### Zpět mění jen adresu

> [!PITFALL]
> **Po kliknutí na Zpět se změní adresa, ale obsah ne.** Příčina: chybí posluchač `popstate`, nebo jen nastaví proměnnou a nezavolá vykreslení. Oprava: `window.addEventListener('popstate', …)` přečte adresu a překreslí stránku stejnou funkcí jako při startu.

### Každé písmeno jako záznam v historii

> [!PITFALL]
> **Uživatel napíše „monstera" a tlačítkem Zpět se pak musí proklikat přes osm adres.** Příčina: `pushState` v posluchači `input`. Oprava: při psaní `replaceState`, `pushState` jen pro rozhodnutí, ke kterým se má jít vrátit (kategorie, stránka).

### Adresa jako zdroj pravdy, které se nedá věřit

> [!PITFALL]
> **Stránka po otevření odkazu `?razeni=cena-dolu` spadne nebo ukáže prázdný seznam.** Adresu přepíše kdokoli a staré odkazy žijí roky. Oprava: hodnoty z adresy ověř proti seznamu povolených a neznámé nahraď výchozími.

:::check
Stránka katalogu má adresu `…/katalog?strana=2`. Co vypíše tenhle kód? Obě hodnoty odděl mezerou.

```js
const params = new URL(location.href).searchParams;
console.log(params.get('strana') + 1, params.get('limit') + 1);
```

### --expected--

21 1

### --why--

`get('strana')` vrátí řetězec `'2'` a `+` s řetězcem spojí text na `'21'`. Parametr `limit` v adrese není, `get` vrátí `null` a `null + 1` je číslo `1` — žádná chyba, jen tiše špatné číslo. Proto hodnoty z adresy převáděj a chybějící ošetři zvlášť.

### --see--

js-dom/prohlizecova-api#cisla-z-uloziste-a-z-adresy-se-scitaji-jako-text
:::

Příště z toho postavíš katalog pokojových rostlin: živý filtr, který si pamatuje adresa, funkční tlačítko Zpět a srdíčka oblíbených uložená v `localStorage`.

## Kde to najdeš v MDN

- [Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — metody, výjimky (`SecurityError`) a rozdíl proti `sessionStorage`.
- [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) — všechny metody a oddíl o kódování znaků `+` a mezer.
- [Working with the History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API) — `pushState`, `replaceState` a `popstate` na příkladu jednoduché aplikace.
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) — volby `threshold` a `rootMargin` s obrázky, jak se počítá průnik.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
localStorage.setItem('quantity', 3);
const next = localStorage.getItem('quantity') + 1;
console.log(next);
```

### --expected--

31

### --why--

Myslíš si, že `setItem` uložil číslo? Uložil text `'3'` a `getItem` vrátí řetězec. `'3' + 1` spojí text na `'31'`. Oprava: `Number(localStorage.getItem('quantity')) + 1`.

### --see--

js-dom/prohlizecova-api#jen-retezce-json-stringify-a-json-parse

## --question--

Vyhledávání v katalogu mění adresu při každém napsaném písmenu přes `history.pushState`. Na co si budou uživatelé stěžovat?

### --answer--

Že se po každém písmenu stránka znovu načte.

#### --why--

`pushState` stránku nenačítá, jen změní adresu a přidá záznam. Stížnost bude na něco jiného.

### --correct--

Že je tlačítko Zpět vrací písmeno po písmenu, místo aby je vrátilo na předchozí stránku.

#### --why--

Každé `pushState` přidá záznam do historie. Při psaní patří `replaceState`, který aktuální záznam přepíše.

### --answer--

Že se hledaný text neobjeví v adrese.

#### --why--

`pushState` adresu změní hned. Problém je v počtu záznamů, které po sobě nechá.

### --see--

js-dom/prohlizecova-api#kazde-pismeno-jako-zaznam-v-historii

## --question--

Napiš podmínku do `if` v callbacku `IntersectionObserver`, která platí, když prvek `entry.target` právě **vjel** do viditelné oblasti.

### --expected--

entry.isIntersecting

### --accept--

entry.isIntersecting === true
entry.intersectionRatio > 0

### --why--

Callback přijde při vjezdu i při výjezdu a hned po `observe`. Který z nich to je, řekne `entry.isIntersecting`.

### --see--

js-dom/prohlizecova-api#sledovani-prvku-intersectionobserver-a-resizeobserver

## --question--

Stránka otevřená přes odkaz `https://zelenykout.cz/katalog?razeni=nahodne` má řazení jen `cena` nebo `nazev`. Kód dělá `const sort = new URL(location.href).searchParams.get('razeni') ?? 'cena';`. Co je špatně?

### --answer--

Nic, `??` doplní výchozí hodnotu, když parametr nedává smysl.

#### --why--

`??` doplní hodnotu jen za `null` a `undefined`. Neznámý text `'nahodne'` projde beze změny.

### --correct--

Neznámá hodnota `'nahodne'` projde a aplikace s ní musí nějak naložit; hodnota z adresy se má ověřit proti povoleným.

#### --why--

Adresu může kdokoli přepsat. Hodnotu ověř, třeba `['cena', 'nazev'].includes(sort) ? sort : 'cena'`.

### --answer--

`searchParams.get` vrací pole, a proto je potřeba `[0]`.

#### --why--

`get` vrací první hodnotu jako řetězec, nebo `null`. Pole vrací `getAll`.

### --see--

js-dom/prohlizecova-api#adresa-jako-zdroj-pravdy-ktere-se-neda-verit
