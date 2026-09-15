# Event loop

:::check pretest
Co vypíše tenhle kód? Napiš čísla v pořadí výpisu, oddělená mezerou. Tipni si, i když si nejsi jistý.

```js
console.log(1);
setTimeout(() => console.log(2), 0);
console.log(3);
```

### --expected--

1 3 2

### --why--

Časovač s nulou neznamená „hned". Callback se zařadí do fronty a spustí se, až doběhne všechno, co právě běží. Proč, vysvětlí hned první dvě části lekce.
:::

:::check pretest
Tlačítko **Přepočítat** spustí výpočet, který trvá tři sekundy. Na stránce mezitím běží animovaný odpočet. Co dělá odpočet během výpočtu?

### --answer--

Běží dál, výpočet probíhá na pozadí.

#### --why--

Tak by to fungovalo, kdyby JavaScript uměl dělat dvě věci zároveň. Jestli to umí, uvidíš v první části.

### --correct--

Zastaví se a rozběhne se až po výpočtu.

#### --why--

Stránka má na tvůj kód jediné vlákno. Dokud výpočet běží, nic dalšího se nespustí ani nevykreslí. Rozebere to část o dlouhém výpočtu.

### --answer--

Zrychlí, aby dohnal zpoždění.

#### --why--

Zmeškané snímky se nedohánějí. Co se s nimi děje, uvidíš v části o vykreslování.
:::

Na e-shopu klikneš na **Přidat do košíku** a stránka na dvě vteřiny ztuhne: tlačítko nereaguje, animace stojí, scrollovat nejde. Nebo napíšeš `setTimeout(…, 0)`, čekáš „hned" a výpis přijde až po kódu, který je o deset řádků níž. Obojí má jednu příčinu a na obojí se ptají u pohovoru.

> [!REMEMBER]
> **JavaScript dělá v jednu chvíli jen jednu věc: dokončí úlohu, která právě běží, a teprve pak vezme další z fronty.**
> Čekání (časovač, síť, klik) obstará prohlížeč a výsledek ti zařadí do fronty jako novou úlohu.

## Jedno vlákno a zásobník volání

Kód stránky běží v jednom vlákně (*single thread*). Prohlížeč si při tom vede [[zásobník volání]] (*call stack*) — seznam funkcí, které právě běží. Zavolaná funkce se položí navrch, a když skončí, z vrcholu zmizí a pokračuje ta pod ní.

:::live js
```js
function formatPrice(price) {
  console.log('3. formatPrice běží');
  return `${price} Kč`;
}

function renderCart(total) {
  console.log('2. renderCart začala');
  const label = formatPrice(total);
  console.log('4. renderCart má text:', label);
}

console.log('1. skript začal');
renderCart(349);
console.log('5. skript skončil');
```
:::

Čísla ve výpisech jsou pořadí, ve kterém se řádky opravdu spustí. Zkus přidat do `formatPrice` ještě jedno volání funkce a sleduj, že se výpis „zanoří" a vrátí přesně podle zásobníku.

Důležité je, co z toho plyne: **dokud zásobník není prázdný, nic jiného se nespustí.** Ani kliknutí, ani časovač, ani překreslení stránky.

:::memory
```js
console.log('1. skript začal');
renderCart(349);
console.log('5. skript skončil');
```
--step-- 1 | běží hlavní skript
stack -> @stack
@stack: [skript]
--step-- 2 | během volání: renderCart je navrchu, na chvíli nad ni přibude i formatPrice
stack -> @stack
@stack: [skript, renderCart]
--step-- 3 | renderCart skončila a zmizela, skript dojíždí do konce
stack -> @stack
@stack: [skript]
:::

:::check
Funkce `a` volá `b` a `b` volá `c`. Která funkce skončí jako první?

### --answer--

`a`, protože začala první.

#### --why--

Začala první, ale nemůže skončit, dokud nedoběhne všechno, co zavolala. Zásobník se vyprazdňuje od vrcholu.

### --correct--

`c`, protože je na vrcholu zásobníku.

#### --why--

Poslední zavolaná funkce leží navrchu a skončí první. Pak pokračuje `b` a nakonec `a`.

### --answer--

Všechny skončí zároveň.

#### --why--

V jednom vlákně nemůže nic běžet „zároveň". `a` čeká uvnitř na `b` a `b` na `c`.

### --see--

js-async/event-loop#jedno-vlakno-a-zasobnik-volani
:::

## Čekání obstará prohlížeč: fronta úloh

Když má kód na něco čekat — na uplynutí času, na odpověď serveru, na klik —, nečeká sám. Požádá prohlížeč přes **Web API** (`setTimeout`, `fetch`, `addEventListener`) a pokračuje dál. Prohlížeč počká mimo tvůj kód a hotový [[callback]] zařadí do **[[fronta úloh|fronty úloh]]** (*task queue*).

[[event loop|Smyčka událostí]] (*event loop*) pak dělá pořád dokola jednu věc: **když je zásobník prázdný, vezme z fronty další úlohu a spustí ji.**

:::live js predict
```js
console.log('objednávka přijata');

setTimeout(() => {
  console.log('e-mail odeslán');
}, 0);

for (let i = 0; i < 3; i++) {
  console.log(`zpracovávám položku ${i + 1}`);
}
```
--question-- V jakém pořadí se vypíšou řádky? Napiš je pod sebe.
--expected--
```text
objednávka přijata
zpracovávám položku 1
zpracovávám položku 2
zpracovávám položku 3
e-mail odeslán
```
--why-- `setTimeout` callback nespustí, jen ho předá prohlížeči. Ten ho po uplynutí nuly milisekund zařadí do fronty. Úloha z fronty se ale spustí až ve chvíli, kdy je zásobník prázdný, tedy až doběhne celý skript i s cyklem. Zkus změnit `0` na `1000` a sleduj, že se pořadí nezmění, jen čekáš déle.
:::

> [!REMEMBER]
> **Druhý argument `setTimeout` je nejkratší doba čekání, ne přesný čas.** Callback se spustí nejdřív po uplynutí času a zároveň až tehdy, když na něj přijde řada.

Stejně fungují události. Handler kliknutí je úloha, kterou prohlížeč zařadí do fronty ve chvíli, kdy uživatel klikne. Když zrovna běží dlouhý kód, klik počká.

:::memory
```js
console.log('objednávka přijata');
setTimeout(sendEmail, 0);
processItems();
// skript skončil, zásobník je prázdný
sendEmail();
```
--step-- 1
stack -> @stack
tasks -> @tasks
@stack: [skript]
@tasks: []
--step-- 2 | časovač hlídá prohlížeč, po 0 ms dá sendEmail do fronty
stack -> @stack
tasks -> @tasks
@stack: [skript]
@tasks: [sendEmail]
--step-- 3 | během processItems: úloha ve frontě čeká, skript pořád běží
stack -> @stack
tasks -> @tasks
@stack: [skript, processItems]
@tasks: [sendEmail]
--step-- 4 | zásobník je prázdný, event loop vezme úlohu z fronty
stack -> @stack
tasks -> @tasks
@stack: []
@tasks: [sendEmail]
--step-- 5
stack -> @stack
tasks -> @tasks
@stack: [sendEmail]
@tasks: []
:::

:::check
Kód nastaví `setTimeout(showBanner, 100)` a hned potom spustí výpočet, který trvá 2 sekundy. Kdy se banner nejdřív ukáže?

### --answer--

Za 100 ms, časovač výpočet přeruší.

#### --why--

Časovač nic nepřerušuje. Po 100 ms jen zařadí `showBanner` do fronty a ta čeká na prázdný zásobník.

### --correct--

Až po dvou sekundách, když výpočet doběhne.

#### --why--

Úloha z fronty se spustí, až je zásobník prázdný. Druhý argument `setTimeout` je jen nejkratší čekání.

### --answer--

Za 2,1 sekundy, časy se sečtou.

#### --why--

Časovač začal běžet hned. Po 100 ms je `showBanner` ve frontě a čeká jen na konec výpočtu, nic se nesčítá.

### --see--

js-async/event-loop#cekani-obstara-prohlizec-fronta-uloh
:::

## Časovače: `setTimeout`, `setInterval` a zrušení

Časovače potkáš v každé druhé komponentě: odpočet do konce akce, oznámení, které samo zmizí, automatické ukládání konceptu. Prohlížeč na ně má dvě funkce:

- `setTimeout(fn, ms)` zařadí `fn` do fronty **jednou**, nejdřív za `ms` milisekund,
- `setInterval(fn, ms)` ji tam zařazuje **opakovaně**, zhruba každých `ms` milisekund, dokud interval nezrušíš.

Obě vracejí číslo časovače (*timer id*). Když si ho uložíš, můžeš časovač zrušit dřív, než se spustí: `clearTimeout(id)` a `clearInterval(id)`.

:::live js
```js
let ticks = 0;
const countdown = setInterval(() => {
  ticks++;
  console.log(`tik ${ticks}`);
  if (ticks === 3) {
    clearInterval(countdown);
    console.log('odpočet zastaven');
  }
}, 100);

const reminder = setTimeout(() => console.log('připomenutí'), 250);
clearTimeout(reminder);
console.log('připomenutí zrušeno');
```
:::

Připomenutí se nevypíše vůbec: zrušil jsi ho dřív, než přišla jeho chvíle. Zkus smazat řádek s `clearTimeout` a sleduj, mezi které tiky se připomenutí zařadí. Pak smaž `clearInterval` a sleduj, že odpočet tiká dál, dokud ukázku nezastavíš.

> [!TIP]
> Zrušení časovače, který už proběhl nebo neexistuje, nic nerozbije. `clearTimeout(undefined)` tiše nic neudělá, takže ho můžeš zavolat „pro jistotu" před každým novým spuštěním.

:::check
Oznámení se schová přes `const hideTimer = setTimeout(hideToast, 3000);`. Uživatel ho mezitím zavře křížkem a ty chceš, aby se `hideToast` už nespustila. Napiš volání, které to zařídí.

### --expected--

clearTimeout(hideTimer)

### --why--

`setTimeout` vrátil číslo časovače a `clearTimeout` s tímhle číslem úlohu zruší dřív, než se dostane do fronty. Interval by se rušil přes `clearInterval`.

### --see--

js-async/event-loop#casovace-settimeout-setinterval-a-zruseni
:::

## Mikroúlohy: Promise má přednost

Kromě fronty úloh existuje ještě druhá, přednostní: **fronta [[mikroúloha|mikroúloh]]** (*microtask queue*). Do ní jdou callbacky Promise — třeba `.then(fn)`. K Promise se dostaneme v příští lekci. Teď stačí vědět, že `Promise.resolve().then(fn)` říká „spusť `fn`, jakmile doběhne aktuální kód".

Pravidlo event loopu je přesnější, než jsme si řekli: **po každé úloze se vyprázdní celá fronta mikroúloh, teprve pak přijde na řadu další úloha.**

:::live js predict
```js
console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

console.log('D');
```
--question-- V jakém pořadí se vypíšou písmena? Napiš je pod sebe.
--expected--
```text
A
D
C
B
```
--why-- Nejdřív doběhne synchronní kód: `A` a `D`. Pak event loop vyprázdní frontu mikroúloh, kde čeká callback s `C`. Callback časovače s `B` je v obyčejné frontě úloh a přijde na řadu až po všech mikroúlohách. Zkus prohodit řádek s `setTimeout` a řádek s `Promise` a sleduj, že na pořadí `C` a `B` to nic nezmění.
:::

Takhle vypadají fronty po každém řádku:

:::memory
```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
// konec skriptu: nejdřív mikroúlohy, pak úlohy
```
--step-- 1
tasks -> @tasks
microtasks -> @micro
output -> @out
@tasks: []
@micro: []
@out: ['A']
--step-- 2 | callback časovače jde do obyčejné fronty
tasks -> @tasks
microtasks -> @micro
output -> @out
@tasks: [log B]
@micro: []
@out: ['A']
--step-- 3 | callback then jde do přednostní fronty
tasks -> @tasks
microtasks -> @micro
output -> @out
@tasks: [log B]
@micro: [log C]
@out: ['A']
--step-- 4
tasks -> @tasks
microtasks -> @micro
output -> @out
@tasks: [log B]
@micro: [log C]
@out: ['A', 'D']
--step-- 5 | skript skončil: mikroúlohy všechny, pak jedna úloha
tasks -> @tasks
microtasks -> @micro
output -> @out
@tasks: []
@micro: []
@out: ['A', 'D', 'C', 'B']
:::

Mikroúlohu naplánuješ i bez Promise funkcí `queueMicrotask(fn)`. V běžném kódu ji potřebovat nebudeš; důležité je pořadí.

:::check
Co se spustí dřív: callback `setTimeout(fn, 0)` naplánovaný na prvním řádku skriptu, nebo callback `Promise.resolve().then(fn)` naplánovaný na posledním řádku?

### --answer--

Časovač, protože byl naplánovaný dřív.

#### --why--

V rámci jedné fronty rozhoduje pořadí. Tady jde ale o dvě různé fronty a jedna z nich má přednost.

### --correct--

Callback `then`, protože mikroúlohy se vyprázdní před další úlohou.

#### --why--

Po doběhnutí skriptu event loop nejdřív spustí všechny mikroúlohy a teprve pak vezme úlohu z fronty časovačů.

### --answer--

Záleží na rychlosti počítače.

#### --why--

Pořadí front je pravidlo event loopu, ne závod. Na každém počítači dopadne stejně.

### --see--

js-async/event-loop#mikroulohy-promise-ma-prednost
:::

## Vykreslování mezi úlohami

Překreslit stránku může prohlížeč **jen mezi úlohami**, když je zásobník prázdný a fronta mikroúloh vyprázdněná. Obvykle to stihne zhruba šedesátkrát za sekundu. Když úloha běží déle, snímky se nevykreslí a nedoženou se.

Co z toho plyne pro text, který změníš na začátku dlouhé funkce?

:::live dom predict
```html
<button id="save" type="button">Uložit objednávku</button>
<p id="status">Připraveno</p>
```
```css
body { font-family: system-ui, sans-serif; padding: 1rem; }
button { font: inherit; padding: 0.5rem 1rem; }
#status { font-weight: 600; }
```
```js
const status = document.querySelector('#status');

document.querySelector('#save').addEventListener('click', () => {
  status.textContent = 'Ukládám…';

  // simulace práce, která trvá skoro sekundu
  const end = Date.now() + 900;
  while (Date.now() < end) {}

  status.textContent = 'Uloženo';
});
```
--question-- Klikneš na **Uložit objednávku**. Co uvidíš v odstavci pod tlačítkem, dokud práce běží?
--option-- Text „Ukládám…" a po chvíli „Uloženo".
--option*-- Pořád „Připraveno", tlačítko nereaguje a po chvíli rovnou „Uloženo".
--option-- Rychlé problikávání mezi „Ukládám…" a „Uloženo".
--why-- `textContent` se změní hned, ale **vykreslit** ho prohlížeč může až po konci handleru. Než k tomu dojde, přepíše ho `'Uloženo'`, takže „Ukládám…" nikdy neuvidíš. Zkus cyklus i s posledním řádkem zabalit do `setTimeout(() => { … }, 50)` a sleduj, že „Ukládám…" se ukáže: handler skončí, prohlížeč mezitím stránku překreslí a práce proběhne až v další úloze. S nulou místo `50` by se úloha časovače mohla spustit dřív, než na překreslení dojde, a „Ukládám…" bys zase neviděl.
:::

> [!REMEMBER]
> **Změna v DOM se ukáže až po doběhnutí úlohy.** Chceš-li, aby uživatel stav „Ukládám…" viděl, musí handler skončit dřív, než začne dlouhá práce.

Stejně zamrzne stránka, když se mikroúlohy plánují donekonečna. Callback `then`, který naplánuje další `then`, nikdy nepustí na řadu vykreslení, protože fronta mikroúloh se nevyprázdní.

:::check
Handler kliknutí nastaví `button.disabled = true`, pak synchronně 3 sekundy zpracovává data a nakonec nastaví `button.disabled = false`. Uvidí uživatel tlačítko zašedlé?

### --answer--

Ano, na tři sekundy.

#### --why--

Vlastnost se změní hned, ale překreslit stránku jde až po konci úlohy. Tou dobou už je `disabled` zase `false`.

### --correct--

Ne, prohlížeč stránku překreslí až po konci handleru, kdy už je tlačítko zase povolené.

#### --why--

Vykreslování probíhá mezi úlohami. Uživatel uvidí jen stav na konci handleru.

### --see--

js-async/event-loop#vykreslovani-mezi-ulohami
:::

## Dlouhý výpočet zamrazí stránku

Úloze, která běží déle než 50 ms, se říká **[[dlouhá úloha]]** (*long task*). Uživatel ji pozná: klik se projeví pozdě, psaní do pole se zadrhne. Prohlížeč to měří i jako metriku odezvy stránky, ke které se dostaneme v sekci o výkonu.

V ukázce čítač tiká časovačem a pruh pod ním posouvá každý tik o kousek. Klikni na **Spočítat najednou** a hned zkus psát do pole. Pak totéž s **Spočítat po dávkách**. Obě tlačítka odvedou stejnou práci: devět dílů po 100 ms.

:::live dom
```html
<p>Tiků časovače: <output id="ticks">0</output></p>
<div class="track"><div class="bar" id="bar"></div></div>
<label>Zkus psát: <input type="text"></label>
<p>
  <button id="block" type="button">Spočítat najednou</button>
  <button id="chunks" type="button">Spočítat po dávkách</button>
</p>
<p id="result">Výsledek: —</p>
```
```css
body { font-family: system-ui, sans-serif; padding: 1rem; }
.track { inline-size: 16rem; block-size: 0.5rem; background: #e2e8f0; border-radius: 1rem; overflow: hidden; }
.bar { block-size: 100%; inline-size: 0; background: #2563eb; }
button, input { font: inherit; padding: 0.4rem 0.8rem; }
```
```js
const ticks = document.querySelector('#ticks');
const bar = document.querySelector('#bar');
const result = document.querySelector('#result');
let count = 0;
setInterval(() => {
  count++;
  ticks.textContent = count;
  bar.style.inlineSize = `${(count % 20) * 5}%`;
}, 100);

// jeden díl práce: procesor je 100 ms zaměstnaný
function workPart() {
  const end = Date.now() + 100;
  while (Date.now() < end) {}
}

document.querySelector('#block').addEventListener('click', () => {
  // 1. všech devět dílů v jedné úloze
  for (let part = 1; part <= 9; part++) workPart();
  result.textContent = 'Výsledek: hotovo najednou';
});

document.querySelector('#chunks').addEventListener('click', () => {
  let part = 0;
  function nextPart() {
    // 2. jeden díl, další až v nové úloze
    workPart();
    part++;
    result.textContent = `Hotovo ${part} z 9 dílů`;
    if (part < 9) setTimeout(nextPart, 0);
  }
  nextPart();
});
```
:::

Při prvním tlačítku čítač i pruh stojí a písmena, která mezitím napíšeš, se v poli objeví až najednou po konci výpočtu. Při druhém se práce rozdělí na dávky: po každé dávce `setTimeout` pustí ke slovu frontu, stránka se překreslí a čítač tiká dál. Výpočet trvá o chlup déle, ale stránka žije. Zkus v `workPart` změnit `100` na `400` a sleduj, jak se odezva zhorší i u dávek — dávka musí být krátká.

> [!NOTE]
> Novější prohlížeče mají pro „pusť na chvíli ke slovu stránku" funkci `scheduler.yield()`. Zatím ji ale nepodporují všechny rozšířené prohlížeče (MDN ji vede jako *Limited availability*), proto se používá s kontrolou `if (globalThis.scheduler?.yield)` a náhradou přes `setTimeout`. Opravdu těžké výpočty patří do Web Workeru, samostatného vlákna, ke kterému se dostaneme v rozšíření o prohlížeči. A pozor na klam: animace `transform` a `opacity` zvládá Chrome mimo hlavní vlákno, takže točící se kolečko se může točit dál, i když stránka jinak nereaguje.

:::check
Proč se při výpočtu po dávkách čítač znovu rozběhne? Vyber nejpřesnější vysvětlení.

### --answer--

`setTimeout` spustí dávky paralelně v jiném vlákně.

#### --why--

Dávky pořád běží v hlavním vlákně, jedna po druhé. Nic paralelního se neděje.

### --correct--

Každá dávka je samostatná úloha, takže mezi nimi dostane přednost časovač i vykreslení.

#### --why--

Mezi dvěma úlohami se může spustit jiná úloha z fronty a stránka se může překreslit. Jedna dlouhá úloha tohle nepustí.

### --answer--

Dávky dohromady udělají méně práce, proto stránku tolik nezatíží.

#### --why--

Dávky odvedou přesně stejnou práci, devět dílů po 100 ms. Mění se jen to, že práce není v jedné úloze.

### --see--

js-async/event-loop#dlouhy-vypocet-zamrazi-stranku
:::

:::explain
Na pohovoru dostaneš otázku: „Vysvětlete, jak funguje event loop. Proč se `setTimeout(fn, 0)` nespustí hned?"

## --model--

JavaScript v prohlížeči běží v jednom vlákně a má zásobník volání, takže v jednu chvíli dělá jen jednu věc. Čekání, jako časovače, síť nebo události, obstarává prohlížeč a hotové callbacky řadí do fronty úloh. Event loop vezme další úlohu z fronty, až když je zásobník prázdný, a po každé úloze nejdřív vyprázdní frontu mikroúloh, kam patří callbacky Promise. `setTimeout(fn, 0)` proto jen zařadí `fn` do fronty a ta se spustí až po doběhnutí aktuálního kódu a všech mikroúloh. Mezi úlohami může prohlížeč překreslit stránku, a proto dlouhý synchronní kód stránku zamrazí.

## --checklist--

- JavaScript běží v jednom vlákně se zásobníkem volání.
- Čekání obstará prohlížeč a callback zařadí do fronty úloh.
- Úloha z fronty se spustí, až je zásobník prázdný.
- Mikroúlohy (callbacky Promise) se vyprázdní před další úlohou.
- `setTimeout(fn, 0)` jen zařadí `fn` do fronty, nespustí ji hned.
- Stránka se překresluje mezi úlohami, dlouhý kód ji zamrazí.
:::

## Typické chyby a pasti

### Zavolaná funkce místo předané

Časovač potřebuje **funkci**, kterou zavolá později. Co se stane, když za jméno omylem napíšeš závorky?

:::live js predict
```js
function remindCart() {
  console.log('Máš něco v košíku');
}

setTimeout(remindCart(), 30);
console.log('časovač nastaven');
```
--question-- V jakém pořadí se vypíšou oba řádky? Napiš je pod sebe.
--expected--
```text
Máš něco v košíku
časovač nastaven
```
--why-- `remindCart()` se zavolá hned při vyhodnocení argumentů, ještě před `setTimeout`. Časovač pak dostane její návratovou hodnotu `undefined` a nemá co spustit. Zkus smazat závorky za `remindCart` a sleduj, že připomínka přijde až po řádku „časovač nastaven".
:::

> [!PITFALL]
> **`setTimeout(showBanner(), 5000)` spustí `showBanner` hned, ne za pět sekund.** Příznak: akce proběhne okamžitě a časovač nic neudělá. Oprava: předej funkci bez závorek, `setTimeout(showBanner, 5000)`, nebo s argumenty přes šipku `setTimeout(() => showBanner('akce'), 5000)`.

### Nula neznamená hned

> [!PITFALL]
> **`setTimeout(fn, 0)` neběží „hned", ale po doběhnutí aktuálního kódu a všech mikroúloh.** Příznak: kód, který na výsledek časovače spoléhá o řádek níž, vidí ještě starý stav (`undefined`, prázdné pole). Oprava: kód, který výsledek potřebuje, dej dovnitř callbacku, nebo počkej na Promise, jak ukáže lekce o `async`/`await`.

:::check
Co vypíše poslední řádek?

```js
let discount;
setTimeout(() => {
  discount = 10;
}, 0);
console.log(discount);
```

### --expected--

undefined

### --why--

Callback časovače se spustí až po doběhnutí skriptu, takže `console.log` vidí proměnnou ještě bez hodnoty.

### --see--

js-async/event-loop#nula-neznamena-hned
:::

### Časovač spuštěný podruhé

> [!PITFALL]
> **Nový časovač nezruší ten starý.** Když handler při každém kliknutí spustí `setInterval` nebo řadu `setTimeout` a předchozí nezruší, běží oba naráz. Příznak: odpočet, který přičítá za tik, najednou běží dvakrát rychleji, položky se vykreslí dvakrát, oznámení zmizí dřív, než mělo. Oprava: číslo časovače si ulož do proměnné mimo handler a před novým spuštěním zavolej `clearInterval` nebo `clearTimeout`.

### Dlouhá smyčka v handleru

> [!PITFALL]
> **Synchronní cyklus nad velkými daty v handleru zamrazí celou stránku.** Příznak: po kliknutí nereaguje nic, v Chromu se po chvíli ukáže dialog „Stránka nereaguje". Oprava: ukaž stav, práci rozděl do krátkých dávek přes `setTimeout`, nebo ji přesuň do Web Workeru.

### Časovač v kartě na pozadí

> [!PITFALL]
> **Prohlížeče časovače v neaktivní kartě zpomalují**, typicky na nejvýš jedno spuštění za sekundu a Chrome po pěti minutách na pozadí opakované časovače spouští třeba jen jednou za minutu. Příznak: odpočet, který přičítá „jednu sekundu za tik", se po návratu do karty rozchází se skutečným časem. Oprava: počítej zbývající čas z hodin (`Date.now()`), ne z počtu tiků. Odpočet počítaný z hodin napíšeš hned v příštím workshopu.

## Kde to najdeš v MDN

- [JavaScript execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model) — zásobník, fronta úloh a event loop přesně podle specifikace; hledej *job queue* a *event loop*.
- [Using microtasks in JavaScript with queueMicrotask()](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) — rozdíl mezi úlohou a mikroúlohou s ukázkami pořadí.
- [Window: setTimeout() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) — oddíl *Reasons for delays longer than specified* vysvětluje, proč časovač přijde později, včetně karet na pozadí.
- [Scheduler: yield() method](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield) — rozdělení dlouhé práce a tabulka podpory v prohlížečích.

V příštím workshopu z časovačů postavíš stránku bleskového výprodeje: odpočet podle hodin, oznámení, které samo zmizí, a katalog, který se vykreslí po dávkách, aniž by stránka zamrzla.

# --questions--

## --question--

Co vypíše tenhle kód? Napiš písmena oddělená mezerou.

```js
setTimeout(() => console.log('X'), 0);
Promise.resolve().then(() => console.log('Y'));
Promise.resolve().then(() => console.log('Z'));
console.log('W');
```

### --expected--

W Y Z X

### --why--

Nejdřív synchronní `W`. Pak se vyprázdní celá fronta mikroúloh v pořadí, v jakém do ní callbacky přišly: `Y`, `Z`. Úloha časovače s `X` přijde na řadu až potom.

### --see--

js-async/event-loop#mikroulohy-promise-ma-prednost

## --question--

Kolega tvrdí: „Když dám `setTimeout(saveDraft, 1000)`, koncept se uloží přesně za sekundu." Kdy to neplatí?

### --answer--

Nikdy, časovač je vždy přesný na milisekundu.

#### --why--

Druhý argument je jen nejkratší čekání. Callback se spustí, až je zásobník prázdný.

### --correct--

Když v tu chvíli běží jiný dlouhý kód nebo je karta na pozadí.

#### --why--

Úloha časovače čeká ve frontě na prázdný zásobník a v neaktivní kartě prohlížeč časovače navíc zpomaluje.

### --answer--

Jen když je v kódu víc než jeden časovač.

#### --why--

Více časovačů se navzájem nezdržuje, pokud jejich callbacky běží krátce. Zpoždění způsobuje dlouhý kód nebo zpomalení prohlížečem.

### --see--

js-async/event-loop#cekani-obstara-prohlizec-fronta-uloh

## --question--

Co vypíše tenhle kód? Napiš písmena oddělená mezerou.

```js
setTimeout(() => {
  console.log('A');
  Promise.resolve().then(() => console.log('B'));
}, 0);
setTimeout(() => console.log('C'), 0);
```

### --expected--

A B C

### --why--

Oba callbacky časovačů jsou samostatné úlohy. První vypíše `A` a naplánuje mikroúlohu s `B`. Po **každé** úloze se vyprázdní fronta mikroúloh, takže `B` přijde dřív, než event loop vezme druhý časovač s `C`.

### --see--

js-async/event-loop#mikroulohy-promise-ma-prednost
