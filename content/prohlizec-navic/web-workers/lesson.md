# Web Workers: výpočet mimo hlavní vlákno

:::check pretest
Filtrování 50 000 položek trvá v JavaScriptu 800 ms. Co se během těch 800 ms děje s políčkem, do kterého uživatel píše?

### --correct--
Nic — písmena se objeví až po dopočítání, protože prohlížeč mezitím nestihne překreslit.

#### --why--
JavaScript, události i vykreslování sdílí jedno vlákno. Dokud běží tvoje funkce, nic
jiného se na něj nedostane.

### --answer--
Píše se normálně, jen filtr dobíhá na pozadí.

#### --why--
Na pozadí nic neběží. Běžná funkce nemá kde běžet jinde než tam, odkud jsi ji zavolal.

### --answer--
Prohlížeč výpočet po 50 ms přeruší a dá přednost psaní.

#### --why--
Prohlížeč běžící funkci nepřeruší. Může tě jen po několika vteřinách zeptat, jestli
stránku neukončit.
:::

Když aplikace „na chvíli ztuhne", skoro vždycky je to tohle: jedna funkce běží dlouho
a všechno ostatní čeká. Parsování velkého CSV, hledání v desetitisících řádků, výpočet
hashe, zpracování obrázku.

[[Web Worker]] je skript, který běží ve **vlastním vlákně**, vedle stránky.

> [!REMEMBER]
> **Worker je druhý JavaScript, který běží vedle stránky a nemá k ní přístup.**
> Komunikace je jen přes zprávy — nic se nesdílí, všechno se posílá.

## Problém: filtr, který zamrzne stránku

Tahle ukázka počítá na hlavním vlákně. Napiš něco do políčka, pak klikni na **Spočítat**
a zkus psát dál.

:::live dom predict
```html
<label>Hledej: <input id="hledej" placeholder="piš sem"></label>
<p><button id="spocitat">Spočítat</button></p>
<p id="stav">připraveno</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #1f2937; }
input, button { font: inherit; padding: .4rem .6rem; border-radius: .4rem; border: 1px solid #94a3b8; }
button { background: #fff; cursor: pointer; }
#stav { font-variant-numeric: tabular-nums; }
```
```js
const stav = document.getElementById('stav');

document.getElementById('spocitat').addEventListener('click', () => {
  stav.textContent = 'Počítám…';

  let soucet = 0;
  for (let i = 0; i < 60_000_000; i++) soucet += i % 7;

  stav.textContent = 'Hotovo: ' + soucet;
});
```
--question-- Co uvidíš v odstavci `#stav` hned po kliknutí na tlačítko?
--option-- Text „Počítám…", a asi po vteřině se přepne na „Hotovo".
--option*-- Nic se nezmění a po chvíli se rovnou objeví „Hotovo".
--option-- Text „Počítám…" zůstane napořád, protože cyklus vykreslování shodil.
--why-- Přiřazení do `textContent` jen změní DOM; překreslit stránku může prohlížeč až ve chvíli, kdy mu tvoje funkce vrátí vlákno. To se stane až za cyklem — a tou dobou už je v odstavci text „Hotovo". Tomuhle se říká [[dlouhá úloha]] a je to nejčastější příčina „ztuhlé" stránky.
:::

:::check
Proč se text „Počítám…" v ukázce výš nikdy neukáže, i když se do `textContent` zapíše dřív než cyklus?

### --correct--
Prohlížeč překresluje až ve chvíli, kdy mu funkce vrátí vlákno — a to je po dopočítání cyklu.

#### --why--
Zápis do DOM je okamžitý, ale vykreslení je samostatná úloha, která se do fronty dostane
až po doběhnutí právě běžícího JavaScriptu. Do té doby uživatel vidí starý obraz.

### --answer--
Zápis do `textContent` je asynchronní a proběhne až po cyklu.

#### --why--
`textContent` se nastaví hned a hned si ho jde přečíst zpátky. Čeká se na kreslení,
ne na zápis.

### --answer--
Prohlížeč oba zápisy sloučí a použije ten poslední.

#### --why--
Nic se neslučuje. Oba zápisy se opravdu provedly, jen mezi nimi nebyl prostor na
překreslení.
:::

## Vlákno navíc a co v něm není

Worker má vlastní [[event loop]], vlastní paměť a vlastní globální objekt (`self`).
Co v něm **není**:

| ve workeru je | ve workeru není |
|---|---|
| `fetch`, `WebSocket` | `document`, `window` |
| `setTimeout`, `setInterval` | DOM a `getComputedStyle` |
| `IndexedDB`, `Cache Storage` | `localStorage` |
| `crypto`, `TextDecoder`, `Intl` | `alert`, `confirm` |

Není to omezení pro omezení: kdyby dvě vlákna sahala na tentýž DOM, musela by se o něj
zamykáním dohadovat a prohlížeč by byl o řád složitější a pomalejší. Proto je pravidlo
tvrdé — **worker počítá, hlavní vlákno kreslí**.

:::check
Do workeru chceš přesunout funkci, která spočítá statistiku a rovnou vypíše výsledek do `<p id="vysledek">`. Která část do workeru nepatří a proč?

### --expected--
zápis do DOM

### --accept--
výpis do p
zápis výsledku do stránky
### --why--
Worker nemá `document`, takže `document.getElementById` v něm skončí na
`ReferenceError: document is not defined`. Worker spočítá čísla a pošle je zpátky;
do stránky je zapíše až posluchač na hlavním vlákně.
:::

## Jak worker vznikne

Ve skutečném projektu je worker samostatný soubor a odkazuje se na něj URL:

```js
// v projektu s Vite: worker.js leží vedle main.js
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
```

> [!NOTE]
> Stránky v Akademii běží v odstíněném rámu bez vlastní adresy, takže se na soubor
> kroku odkázat nejde. Workery tu proto vyrábíme z textu přes `Blob` — což je mimochodem
> úplně legitimní technika, kterou používají i knihovny, aby se nemusely starat o cestu
> k souboru.

:::live js
```js
// 1. Napiš kód workeru
const kodWorkeru = `
  self.onmessage = (udalost) => {
    const ceny = udalost.data;
    const soucet = ceny.reduce((a, b) => a + b, 0);
    self.postMessage({ soucet, prumer: soucet / ceny.length });
  };
`;

// 2. Udělej z něj soubor v paměti a spusť ho
const adresa = URL.createObjectURL(new Blob([kodWorkeru], { type: 'text/javascript' }));
const worker = new Worker(adresa);

// 3. Domluv se zprávami
worker.onmessage = (udalost) => {
  console.log('výsledek z workeru:', udalost.data);
};

worker.postMessage([249, 399, 189, 1290]);
console.log('hlavní vlákno pokračuje hned');
```
:::

Zkus do pole přidat další cenu a sleduj, že se pořadí výpisů nezmění: hlavní vlákno
doběhne první, odpověď workeru dorazí až jako další úloha ve frontě.

Tři pojmenované části tam nahoře — **napiš kód**, **spusť ho**, **domluv se zprávami** —
jsou celý recept. Nic dalšího worker nepotřebuje.

:::check
Co vypíše konzole dřív: řádek z `worker.onmessage`, nebo `console.log` na posledním řádku skriptu?

### --expected--
console.log na posledním řádku

### --accept--
poslední řádek skriptu
hlavní vlákno
### --why--
`postMessage` zprávu jen odešle a hned se vrací. Odpověď přijde jako běžná úloha do
fronty — tedy až potom, co doběhne celý aktuální skript. Worker nikdy „neskočí doprostřed"
tvého kódu.
:::

## `postMessage`: zprávy místo sdílené paměti

Data se mezi vlákny **kopírují** algoritmem [[strukturované klonování]]. Není to
`JSON.stringify`: zvládne `Map`, `Set`, `Date`, `RegExp`, `ArrayBuffer` i cykly.
Neumí ale **funkce**, **DOM prvky** a třídy si nepamatuje — z instance přijde na druhé
straně obyčejný objekt.

:::live js predict
```js
const objednavka = { cislo: 7, polozky: ['kniha'] };
const kopie = structuredClone(objednavka);

kopie.polozky.push('záložka');

console.log(objednavka.polozky.length, kopie.polozky.length);
console.log(objednavka.polozky === kopie.polozky);
```
--question-- Co vypíše konzole?
--expected--
```text
1 2
false
```
--why-- `structuredClone` je **hluboká** kopie: vnořené pole se zkopírovalo taky, takže `push` do kopie originál nezměnil. Přesně tohle dělá `postMessage` se vším, co pošleš. Proto se změna dat ve workeru nikdy sama neprojeví na hlavním vlákně — musíš je poslat zpátky.

:::

> [!PITFALL]
> Funkce se poslat nedá. `worker.postMessage({ porovnej: (a, b) => a - b })` skončí na
> `DataCloneError: Failed to execute 'postMessage' on 'Worker': (a, b) => a - b could not be cloned.`
> Posílej data a rozhodnutí („seřaď podle ceny"), ne kód.

:::check
Pošleš workeru instanci vlastní třídy `Kniha` s metodou `cenaSDph()`. Co s ní na druhé straně bude?

### --correct--
Obyčejný objekt se stejnými daty, ale bez metody.

#### --why--
Strukturované klonování kopíruje data, ne prototyp. Metoda tam není a volání skončí na
`TypeError: … is not a function`.

### --answer--
Plnohodnotná instance `Kniha` i s metodou.

#### --why--
To by worker musel znát tvoji třídu. Kdyby ji znát měl, musel bys mu ji poslat — a kód
se poslat nedá.

### --answer--
Vyhodí to `DataCloneError`.

#### --why--
`DataCloneError` dostaneš u funkcí a DOM prvků. Obyčejná instance s daty se zkopíruje
bez problémů, jen ochudnutá o prototyp.
:::

## Přenos místo kopie: `ArrayBuffer`

U velkých binárních dat (obrázek, zvuk, výsledek z `fetch`) by kopie stála čas i paměť.
Druhý argument `postMessage` je seznam [[přenositelný objekt|přenositelných objektů]]:
ty se **přesunou**, ne zkopírují.

:::live js
```js
const kod = `self.onmessage = (e) => self.postMessage(e.data.byteLength);`;
const worker = new Worker(URL.createObjectURL(new Blob([kod], { type: 'text/javascript' })));

const data = new ArrayBuffer(1024 * 1024);
console.log('před odesláním:', data.byteLength);

worker.postMessage(data, [data]);   // druhý argument = co se přenáší

console.log('po odeslání:', data.byteLength);
worker.onmessage = (e) => console.log('worker hlásí:', e.data);
```
:::

Zkus druhý argument `[data]` smazat a sleduj, že „po odeslání" najednou hlásí původní
velikost — buffer se zkopíroval místo přenesení.

Přenesený buffer je na odesílající straně **prázdný** (`byteLength === 0`). To není
chyba, to je smysl přenosu: vlastnictví paměti se předalo dál.

:::check
Po `worker.postMessage(buffer, [buffer])` je `buffer.byteLength` na hlavním vlákně nula. Co to znamená?

### --correct--
Paměť přešla do workeru, hlavní vlákno k ní už přístup nemá.

#### --why--
Přenos je přesun vlastnictví. Právě proto je zadarmo — nic se nekopíruje, jen se předá
ukazatel.

### --answer--
Odeslání selhalo a data se ztratila.

#### --why--
Data jsou v pořádku, jen na druhé straně. Kdyby odeslání selhalo, dostal bys výjimku.

### --answer--
Buffer se uvolnil z paměti, protože už ho nikdo nepotřebuje.

#### --why--
Uvolnění paměti řeší garbage collector a týká se objektů, na které nikdo neodkazuje.
Tady buffer žije dál, jen ve druhém vlákně.
:::

## Kdy worker nepomůže

Worker není zrychlovač. Pomůže jen tam, kde je práce **hodně a je čistě výpočetní**.

- **Malý výpočet.** Založení workeru a přenos dat stojí jednotky až desítky milisekund.
  Na práci, která trvá 5 ms, se to nevyplatí.
- **Práce s DOM.** Měření a překreslování musí zůstat na hlavním vlákně.
- **Čekání na síť.** `fetch` na hlavním vlákně nic neblokuje — čekání není práce.
- **Hodně malých zpráv.** Každá zpráva je úloha a kopie dat. Jedna zpráva s tisícovkou
  položek je mnohem levnější než tisíc zpráv.

> [!TIP]
> Než sáhneš po workeru, změř to. V DevTools na kartě **Performance** hledej žluté bloky
> `Scripting` delší než 50 ms — jen ty stojí za přesun.

:::explain
Vysvětli, proč se dlouhý výpočet ve workeru projeví na plynulosti stránky, ale dlouhé čekání na `fetch` ne.

## --model--
Hlavní vlákno dělá jednu věc po druhé: spouští JavaScript, zpracovává události a kreslí.
Dlouhý výpočet ho drží obsazené, takže se do něj nevejde ani jedno překreslení. `fetch`
je jiný případ — samotné čekání na odpověď se neděje v JavaScriptu, o spojení se stará
prohlížeč a vlákno je volné. Callback nebo pokračování za `await` se spustí až ve chvíli,
kdy data dorazí, a to je krátká práce.

## --checklist--
- Hlavní vlákno počítá, obsluhuje události a kreslí, ale vždy jen jednu věc naráz.
- Dlouhý výpočet zabere vlákno, takže se nestihne překreslit.
- Čekání na síť žádné vlákno nedrží, stará se o něj prohlížeč.
:::

:::check
Aplikace čeká 800 ms na odpověď z API a mezitím nejde klikat. Pomůže přesun volání `fetch` do workeru?

### --correct--
Ne — čekání na síť žádné vlákno nedrží, zadrhnutí má jinou příčinu.

#### --why--
`fetch` je asynchronní už na hlavním vlákně: o spojení se stará prohlížeč. Když stránka
tuhne, hledej dlouhý výpočet ve zpracování odpovědi, ne to čekání samotné.

### --answer--
Ano, worker požadavek odbaví na svém vlákně a stránka zůstane volná.

#### --why--
Vlákno se při čekání nepoužívá ani na hlavním vlákně, takže přesunem se neušetří nic.

### --answer--
Ano, ale jen když se odpověď posílá zpátky jako `ArrayBuffer`.

#### --why--
Způsob předání dat neřeší příčinu. Kdyby vlákno drželo čekání, nepomohl by žádný formát.
:::

## Typické chyby a pasti

> [!PITFALL]
> **`document is not defined`.** První chyba, kterou ve workeru potkáš. Příznak:
> `ReferenceError: document is not defined` v konzoli, ale u chyby je jméno souboru
> workeru. Do workeru patří jen výpočet.

> [!PITFALL]
> **Zapomenutý `terminate`.** Worker běží, dokud ho nezastavíš, i když ho už nepotřebuješ.
> Když zakládáš worker pro každé hledání, po chvíli jich běží dvacet a počítač jde do
> otáček. Buď jeden worker používej opakovaně, nebo starý ukonči přes `worker.terminate()`.

> [!PITFALL]
> **Zastaralé odpovědi.** Uživatel píše „ka", „kat", „katal". Odpovědi se vrátí v pořadí,
> v jakém je worker stihne, ne v jakém jsi je poslal. Příznak: v seznamu bliknou výsledky
> pro „kat" po výsledcích pro „katal". Posílej ve zprávě pořadové číslo a starší odpovědi
> zahazuj.

> [!PITFALL]
> **Chyba ve workeru mlčí.** Výjimka uvnitř workeru neshodí stránku a bez posluchače ji
> nikde neuvidíš. Vždycky si zapiš `worker.onerror = (e) => console.error(e.message)`,
> jinak budeš ladit něco, co jen „nic nevrací".

:::check
Výpočet ve workeru vyhodí výjimku. Co uvidíš na stránce, dokud si nezapíšeš `worker.onerror`?

### --correct--
Nic — stránka běží dál a worker jen přestane odpovídat.

#### --why--
Výjimka uvnitř workeru zůstane v jeho vlákně. Bez posluchače o ní nikde nebude ani
řádek, takže se ladí něco, co „jen nic nevrací".

### --answer--
Chybu v konzoli i s číslem řádku ve workeru, jako u každého jiného skriptu.

#### --why--
To platí pro nezachycené chyby na hlavním vlákně. Worker má vlastní globální objekt
i vlastní zpracování chyb.

### --answer--
Stránka spadne se stejnou chybou, protože worker běží na jejím původu.

#### --why--
Společný původ neznamená společné vlákno. Pád workeru stránku neshodí.
:::

## Kde to najdeš v MDN

- [Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) —
  založení, zprávy, ukončení a rozdíl mezi dedikovaným a sdíleným workerem.
- [Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker) — kompletní rozhraní
  včetně `onerror` a `terminate`.
- [The structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) —
  seznam typů, které se zkopírují, a těch, které vyhodí `DataCloneError`.
- [Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) —
  co všechno jde přenést místo kopírovat.

# --questions--

## --question--

V workeru napíšeš `self.postMessage(vysledek)` a na hlavním vlákně `worker.onmessage = (e) => …`. Ve které vlastnosti objektu události najdeš `vysledek`?

### --expected--
e.data

### --accept--
data
event.data
udalost.data

### --why--
Zpráva přijde vždy v `data`. Samotný objekt události nese ještě `origin` a `source`,
ale u workeru jsou k ničemu — zajímá tě jen náklad.

### --see--

prohlizec-navic/web-workers#postmessage-zpravy-misto-sdilene-pameti

## --question--

Aplikace stahuje ze serveru JSON o velikosti 3 MB a trvá to 2 vteřiny. Přesunutí `fetch` do workeru stránku nezrychlí. Proč?

### --correct--
Čekání na odpověď hlavní vlákno neblokuje — po celou dobu je volné.

#### --why--
O spojení se stará prohlížeč mimo JavaScript. Worker by pomohl až na tom, co přijde
potom: rozparsovat a přepočítat 3 MB dat je skutečná práce.

### --answer--
Worker neumí `fetch`, takže by to stejně nešlo.

#### --why--
`fetch` ve workeru je. Chybí mu `document` a `localStorage`, ne síť.

### --answer--
Protože se odpověď musí stejně zkopírovat zpátky na hlavní vlákno.

#### --why--
Kopie něco stojí, ale to není důvod. Důvod je, že se během čekání žádná práce nedělá.

### --see--

prohlizec-navic/web-workers#kdy-worker-nepomuze

## --question--

**Opakování z dřívějška.** Co vypíše tenhle kód?

```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
```

### --expected--
```text
A
D
C
B
```

### --why--
Synchronní řádky první, pak se vyprázdní fronta mikroúloh (promise), a teprve potom
přijde na řadu úloha z časovače. Zpráva z workeru se chová jako `setTimeout` — je to
běžná úloha, ne mikroúloha.

### --see--

prohlizec-navic/web-workers#jak-worker-vznikne

## --question--

**Opakování z dřívějška.** Proč se pro filtrování pole podle textu hodí `filter` a ne `forEach`?

### --correct--
`filter` vrací nové pole s vyhovujícími položkami, `forEach` vrací `undefined`.

#### --why--
`forEach` je na vedlejší efekty. Kdybys s ním filtroval, musel bys výsledek ručně plnit
do pomocného pole — a přesně takový kód se pak do workeru posílá hůř, protože míchá
výpočet s ukládáním.

### --answer--
`filter` je rychlejší, protože nevolá callback pro každou položku.

#### --why--
Callback se volá pro každou položku u obou metod. Rozdíl je v návratové hodnotě, ne
v počtu volání.

### --answer--
`forEach` nejde použít na poli objektů.

#### --why--
Jde, obě metody fungují na jakémkoli poli. Liší se tím, co vrátí.

### --see--

prohlizec-navic/web-workers#problem-filtr-ktery-zamrzne-stranku
