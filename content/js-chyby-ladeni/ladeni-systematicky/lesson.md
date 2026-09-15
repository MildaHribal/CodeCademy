# Ladění systematicky

:::check pretest
Zákazník hlásí: „Košík mi občas ukáže špatnou cenu." V kódu jsi ho nikdy neviděl. Co uděláš jako první?

### --answer--

Projdu kód košíku a opravím místa, která vypadají podezřele.

#### --why--

Podezřele vypadá půlka cizího kódu. Bez vstupu, na kterém chyba nastane, nepoznáš, jestli jsi opravil tu pravou.

### --answer--

Přidám `console.log` do každé funkce košíku.

#### --why--

Stovka výpisů bez otázky, na kterou mají odpovědět, tě zahltí. K čemu výpis potřebuješ, ukáže první část.

### --correct--

Zjistím, s jakým obsahem košíku přesně chyba nastane, a zopakuju ji.

#### --why--

Dokud chybu neumíš vyvolat na povel, nemáš ji jak hledat ani jak ověřit opravu. Proč právě tohle, vysvětlí první část.
:::

:::check pretest
Výpočet má 64 kroků za sebou a na konci vyjde nesmysl. Kontroluješ mezivýsledek vždy uprostřed zbývajícího úseku a polovinu, kde je všechno v pořádku, vyřadíš. Kolik kontrol nejvýš potřebuješ, abys našel první chybný krok? Tipni si.

### --expected--

6

### --why--

Každá kontrola úsek zkrátí na polovinu: 64 → 32 → 16 → 8 → 4 → 2 → 1. Šest kontrol místo až 64. Tomuhle postupu se říká bisekce a dostaneš se k němu ve třetí části.
:::

Na první pohovor v práci si připrav jednu odpověď: „Jak postupuješ, když najdeš chybu?" Odpověď „dám tam `console.log` a zkouším" zní jako hádání. V každé firmě přitom většinu dne neopravuješ vlastní kód, ale cizí — napsaný před lety, s tisíci řádků a hlášením od zákazníka, které říká jen „nefunguje to".

V sekci Základy JavaScriptu ses naučil [číst hlášku a zastavit program v debuggeru](see:js-zaklady/cteni-chyb-a-debugger#debugger-zastav-program-a-podivej-se-dovnitr). To stačí, když víš, kam se podívat. Tahle lekce řeší případ, kdy to nevíš: hláška žádná není nebo ukazuje jinam a kód je cizí.

> [!REMEMBER]
> **Ladění není hádání, ale zužování: zopakuj chybu, vyslov hypotézu, jedním pokusem ji ověř a vyřaď půlku podezřelých míst.** Nástroje DevTools jen zrychlují jednotlivé kroky.

## Nejdřív chybu spolehlivě zopakuj

Chyba, kterou neumíš vyvolat, se nedá opravit — jen „opravit" a doufat. Prvním krokem je proto **reprodukce**: přesný vstup a postup, po kterém chyba nastane pokaždé. Z hlášení „ceník festivalu občas počítá špatně" potřebuješ udělat větu „`ticketPrice(65, false)` vrátí 1 490, čekám 990".

Potom vstup zmenšuj, dokud chyba nezmizí. Nejmenší vstup, na kterém se chyba ještě ukáže, je [[minimální reprodukce]] (*minimal reproducible example*). Místo košíku s dvaceti položkami jedna položka, místo celého formuláře jedno políčko. Čím menší reprodukce, tím méně kódu zbývá podezírat.

Ceník festivalu podle zadání: děti mladší 15 let zdarma, senioři od 65 let 990 Kč, studenti do 26 let včetně 890 Kč, ostatní 1 490 Kč. Najdi vstup, na kterém se kód splete:

:::live js
```js
function ticketPrice(age, isStudent) {
  if (age < 15) return 0;
  if (age > 65) return 990;
  if (isStudent && age <= 26) return 890;
  return 1490;
}

console.log(ticketPrice(10, false));
console.log(ticketPrice(20, true));
console.log(ticketPrice(40, false));
console.log(ticketPrice(70, false));
```
:::

Všechny čtyři výpisy sedí se zadáním, a přesto je v kódu chyba. Zkus přidat volání pro věky na hranicích pravidel — 14, 15, 26, 27, 64, 65 — a sleduj, který výsledek nesedí.

> [!TIP]
> Hranice pravidel („od 65 let", „do 26 let včetně") jsou nejčastější úkryt chyby. Když reprodukci hledáš, zkoušej vždycky hodnotu přesně na hranici a o jedna vedle.

:::check
Pro jaký nejmenší věk vrátí `ticketPrice` s `isStudent: false` jinou cenu, než říká zadání? Napiš jen číslo.

### --expected--

65

### --why--

Zadání říká „senioři od 65 let", kód má `age > 65`. Pětašedesátiletý proto zaplatí plnou cenu 1 490 Kč. Věk 70 z ukázky chybu neukázal, protože leží daleko od hranice. Oprava je `age >= 65`.

### --see--

js-chyby-ladeni/ladeni-systematicky#nejdriv-chybu-spolehlive-zopakuj
:::

## Hypotéza: jedna věta, jeden pokus

S reprodukcí v ruce nepřepisuj kód naslepo. Vyslov **hypotézu** — jednu větu o příčině, ze které plyne předpověď: „Když platí tohle, pak s jinými daty uvidím tohle." Pak udělej jediný pokus, který hypotézu potvrdí, nebo vyvrátí.

Hlášení zní: „Se slevovým kódem 10 % je cena nižší, než má být." Hypotéza A: „Sleva se odečítá z každé položky znovu, ne jednou z celku." Plyne z ní předpověď: s jednou položkou cena sedí, se dvěma už ne. To se dá ověřit jedním pokusem.

:::live js predict
```js
function orderTotal(items, couponPercent) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
    total -= total * couponPercent / 100;
  }
  return total;
}

console.log(orderTotal([{ price: 1000, quantity: 1 }], 10));
console.log(orderTotal([{ price: 500, quantity: 1 }, { price: 500, quantity: 1 }], 10));
```
--question-- Obě objednávky stojí před slevou 1 000 Kč. Co vypíšou oba řádky? Každé číslo na vlastní řádek.
--expected--
```text
900
855
```
--why-- S jednou položkou se sleva odečte jednou a vyjde správných 900. Se dvěma položkami se po první odečte z 500 (zbude 450), přičte se druhá (950) a sleva se odečte znovu i z už zlevněné částky: 855. Předpověď hypotézy A se splnila, takže příčina je řádek se slevou uvnitř cyklu. Zkus ho přesunout za cyklus a sleduj, že oba výpisy ukážou 900.
:::

Kdyby hypotéza neplatila (se dvěma položkami by vyšlo 900), vyřadíš ji a vyslovíš další. I vyvrácená hypotéza je pokrok: jedno podezřelé místo méně.

> [!REMEMBER]
> **Jedna změna, jeden pokus.** Když změníš tři věci naráz a chyba zmizí, nevíš, která ze změn ji opravila — a jestli ostatní dvě něco nerozbily.

:::check
Která hypotéza se dá ověřit jedním pokusem?

### --answer--

„Kód košíku je napsaný špatně."

#### --why--

Tahle věta platí o jakékoli chybě a nic nepředpovídá. Jaký pokus by ji vyvrátil?

### --correct--

„Doprava zdarma od 1 000 Kč se počítá z ceny před slevou, takže objednávka za 1 050 Kč se slevou 10 % (po slevě 945 Kč) dopravu zdarma nesprávně dostane."

#### --why--

Hypotéza říká konkrétní příčinu i konkrétní vstup a výsledek. Jedno volání s košíkem za 1 050 Kč a slevou 10 % ji potvrdí, nebo vyvrátí.

### --answer--

„Možná je chyba v cyklu, možná ve slevě, možná v zaokrouhlení."

#### --why--

Tři možnosti naráz nejsou hypotéza, ale seznam podezření. Z které z nich plyne předpověď, kterou jde jedním voláním ověřit?

### --see--

js-chyby-ladeni/ladeni-systematicky#hypoteza-jedna-veta-jeden-pokus
:::

## Bisekce: půl kódu pryč

Někdy hypotézu nemáš vůbec: data projdou dvaceti kroky a na konci je nesmysl. Pak pomůže [[bisekce]] (*bisection*): zkontroluj mezivýsledek **uprostřed**. Když je v pořádku, chyba je ve druhé polovině, když ne, v první. Půlku, kde chyba není, vyřadíš a opakuješ. Dvacet kroků prověříš na pět kontrol.

Na kontrolu mezivýsledku se hodí `console.assert(podmínka, zpráva)`. Když podmínka platí, nevypíše nic. Když neplatí, vypíše zprávu jako chybu — ale program nezastaví.

:::live js predict
```js
const orders = [
  { id: 1041, amount: 1290 },
  { id: 1042, amount: Number('1 150') },
];

console.assert(orders.length === 2, 'Čekám dvě objednávky');
console.assert(orders.every((order) => Number.isFinite(order.amount)), 'Částka není číslo');
console.log('hotovo');
```
--question-- Co vypíše tenhle kód? Každý výpis na nový řádek.
--expected--
```text
Assertion failed: Částka není číslo
hotovo
```
--why-- První podmínka platí, takže první `console.assert` mlčí. `Number('1 150')` je kvůli mezeře `NaN`, druhá podmínka neplatí a vypíše se `Assertion failed:` se zprávou. Program ale běží dál, proto se vypíše i `hotovo`. Kontroly si tak můžeš rozmístit mezi kroky a nechat kód doběhnout.
:::

Teď si bisekci vyzkoušej na cizím kódu. Kavárna s pobočkami má týdenní přehled z exportu pokladny. Výsledek vypadá věrohodně, jenže Praha má tržby skoro dvojnásobné a přesto nevyhrála:

:::live js
```js
// Export pokladny: pobočka;den;tržba;spropitné
const exportText = `Brno;po;12 480;830
Brno;út;9 870;610
Praha;po;21 350;1 420
Praha;út;18 900;1 150
Ostrava;po;7 640;390
Ostrava;út;8 120;455`;

const lines = exportText.split('\n');
const cells = lines.map((line) => line.split(';'));
const records = cells.map(([branch, day, sales, tips]) => ({ branch, day, sales, tips }));
const numbers = records.map((record) => ({ ...record, sales: Number(record.sales.replaceAll(' ', '')), tips: Number(record.tips) }));
const withTotal = numbers.map((record) => ({ ...record, total: record.sales + record.tips }));
const byBranch = Object.groupBy(withTotal, (record) => record.branch);
const summary = Object.entries(byBranch).map(([branch, list]) => ({ branch, total: list.reduce((sum, record) => sum + record.total, 0) }));
const best = summary.toSorted((a, b) => b.total - a.total)[0];

console.log(`Nejlepší pobočka: ${best.branch} (${best.total} Kč)`);
```
:::

Kroků je osm. Začni uprostřed: pod `withTotal` přidej `console.assert(withTotal.every((record) => Number.isFinite(record.total)), 'total není číslo')` a podle výsledku pokračuj v té polovině, kde chyba je.

:::check
Ve které proměnné se v přehledu kavárny poprvé objeví `NaN`? Napiš jen její jméno.

### --expected--

numbers

### --why--

Kontrola uprostřed (`withTotal`) selže, takže chyba je v první polovině. `records` ještě obsahuje texty, ale v `numbers` se u tržby mezery odstraní a u spropitného ne: `Number('1 420')` je `NaN`. Pražská spropitná mají čtyřmístná čísla s mezerou, proto se `NaN` objeví jen u Prahy. Řazení s `NaN` pak tiše vrátí Brno.

### --see--

js-chyby-ladeni/ladeni-systematicky#bisekce-pul-kodu-pryc
:::

> [!NOTE]
> Stejný princip funguje i nad historií kódu: když dřív fungující funkce přestala fungovat, půlíš verze v historii, dokud nenajdeš změnu, která ji rozbila. Nástroj `git bisect` na to potkáš v sekci o Gitu a terminálu.

## Stack trace přes víc souborů

Ve skutečném projektu je kód rozdělený do souborů a [[stack trace]] jimi prochází. Třeba po kliknutí na tlačítko **Přepočítat košík**:

```text
Uncaught TypeError: Cannot read properties of undefined (reading 'price')
    at lineTotal (pricing.js:12:24)
    at Array.map (<anonymous>)
    at cartTotal (pricing.js:18:22)
    at renderCart (cart-view.js:41:17)
    at HTMLButtonElement.<anonymous> (main.js:9:5)
```

Čti ho jako cestu shora dolů:

- **`lineTotal (pricing.js:12)`** — tady to spadlo: z `undefined` se četlo `price`.
- **`Array.map (<anonymous>)`** — vestavěná metoda, ne tvůj kód. Říká jen, že `lineTotal` volal `map` pro každou položku. Takové řádky přeskoč.
- **`cartTotal (pricing.js:18)`** — tady se `map` zavolal. Podezření: pole položek obsahuje něco, co není položka.
- **`renderCart (cart-view.js:41)`** a **`main.js:9`** — kdo `cartTotal` zavolal a kde začalo kliknutí.

Příčina bývá o jedno nebo dvě patra níž než místo pádu, tam, kde vznikla chybná data. Kliknutím na `cart-view.js:41` v konzoli DevTools skočíš přímo na řádek a přidáš tam breakpoint.

> [!TIP]
> V projektech s knihovnami má stack trace desítky řádků z `node_modules`. Chrome je ve výchozím stavu skrývá (*ignore list*) a v panelu **Call Stack** je ukáže až tlačítko **Show ignore-listed frames**. Hledej první řádek, který patří tvému kódu.

U obalené chyby (`new Error(…, { cause })` z lekce [Výjimky](see:js-chyby-ladeni/vyjimky#obaleni-chyby-pres-cause)) vypíše konzole Chrome pod stack trace nové chyby řádek `Caused by:` a stack trace původní chyby. Čti oba: horní řekne, při čem chyba vznikla, spodní, kde přesně.

:::check
Na kterém řádku kterého souboru se zavolala funkce `renderCart`? Napiš ve tvaru `soubor:řádek`.

### --expected--

main.js:9

### --accept--

main.js 9

### --why--

Řádek pod `renderCart` říká, odkud byla zavolaná: z anonymní funkce obsluhy tlačítka v `main.js` na řádku 9. Řádek `renderCart (cart-view.js:41:17)` je místo uvnitř `renderCart`, kde se volala další funkce, `cartTotal`.

### --see--

js-chyby-ladeni/ladeni-systematicky#stack-trace-pres-vic-souboru
:::

## Breakpoint na výjimce

Nejzákeřnější chyby nemají v konzoli žádnou hlášku, protože je někdo chytil a [[polykání chyb|spolkl]]. Hledat takový `catch` v tisících řádků je zdlouhavé. DevTools umí program zastavit přímo na řádku, kde výjimka **vznikla**:

1. Otevři panel **Sources** a vpravo sekci **Breakpoints**.
2. Zaškrtni **Pause on uncaught exceptions** — program se zastaví na výjimce, kterou nikdo nechytil.
3. Zaškrtni **Pause on caught exceptions** — zastaví se i na výjimce, kterou nějaký `catch` chytí. Přesně tahle volba najde spolknutou chybu.

Když program stojí, uvidíš v **Scope** hodnoty v okamžiku chyby a v **Call Stack** cestu k ní. Pak klikni na **Resume** (F8) a sleduj, do kterého `catch` výjimka doletí.

> [!PITFALL]
> **Pause on caught exceptions zastaví i na výjimkách, které knihovny chytají záměrně.** Příznak: debugger se zastavuje v cizím kódu, který s chybou nesouvisí. Oprava: nech zapnutý ignore list, zapni volbu až těsně před akcí, kterou chybu vyvoláš, a hned po ní ji vypni.

:::check
Objednávka se odešle s cenou `0 Kč` a v konzoli není žádná chyba. Máš podezření, že nějaký `catch` spolkl výjimku. Kterou volbu zapneš?

### --answer--

Pause on uncaught exceptions

#### --why--

Tahle volba zastaví jen na výjimce, kterou nikdo nechytil — ta by se ale v konzoli ohlásila. Tady konzole mlčí.

### --correct--

Pause on caught exceptions

#### --why--

Spolknutou výjimku někdo chytil, a proto se v konzoli neobjevila. Tahle volba zastaví program přímo v místě, kde vznikla.

### --answer--

Breakpoint na posledním řádku souboru

#### --why--

Poslední řádek se provede až po celém výpočtu a chyba je dávno spolknutá. Potřebuješ zastavit v okamžiku, kdy výjimka vznikne.

### --see--

js-chyby-ladeni/ladeni-systematicky#breakpoint-na-vyjimce
:::

## Podmíněný breakpoint a logpoint

Obyčejný breakpoint uvnitř cyklu přes 500 objednávek zastaví program 500krát. Tebe ale zajímá jen objednávka číslo 337. Na to je [[podmíněný breakpoint]] (*conditional breakpoint*): v panelu **Sources** klikni pravým tlačítkem na číslo řádku, zvol **Add conditional breakpoint** a napiš podmínku, třeba `order.id === 337`. Program se zastaví jen tehdy, když podmínka platí.

Druhá volba ve stejné nabídce je [[logpoint]] (**Add logpoint**). Místo zastavení vypíše do konzole zprávu, kterou zapíšeš jako argumenty `console.log`, třeba `'objednávka', order.id, total`. Do souboru se nic nepřidá, takže na výpis nezapomeneš v kódu, až budeš hotový.

Vyzkoušej to na tomhle kódu. Breakpoint potřebuje soubor, ve kterém klikneš na číslo řádku, a na to má Chrome úryvky (*snippets*):

1. Otevři DevTools (F12), panel **Sources** a vlevo záložku **Snippets** (když ji nevidíš, skrývá se pod `»`).
2. Klikni na **New snippet** a vlož do něj kód ukázky. Chrome tě při prvním vložení může požádat, abys napsal `allow pasting`.
3. Pravým tlačítkem klikni na číslo řádku s `revenue += total`, zvol **Add conditional breakpoint** a napiš `order.id === 337`.
4. Úryvek spusť zkratkou Ctrl+Enter (na Macu Cmd+Enter). Když ho spouštíš znovu a Chrome ohlásí `Identifier 'orders' has already been declared`, obnov stránku (F5) a spusť ho ještě jednou.

Když se ti do DevTools nechce, stejnou otázku zodpoví dočasný `if` s výpisem přímo v ukázce.

:::live js
```js
const orders = Array.from({ length: 500 }, (_, index) => ({
  id: index + 1,
  items: (index * 7) % 5 + 1,
  price: 190 + ((index * 37) % 11) * 10,
}));

let revenue = 0;
for (const order of orders) {
  const total = order.items * order.price;
  revenue += total;
}

console.log('Tržba:', revenue);
```
:::

:::check
Jakou hodnotu má `total` u objednávky s `id` 337, když program stojí na řádku `revenue += total`?

### --expected--

630

### --why--

Objednávka 337 má `index` 336, tedy `items` 3 a `price` 210, takže `total` je 630. Počítat to ručně nemusíš — podmíněný breakpoint s `order.id === 337` zastaví přesně u ní a hodnotu ukáže v panelu **Scope**. Logpoint by ji vypsal bez zastavení.

### --see--

js-chyby-ladeni/ladeni-systematicky#podmineny-breakpoint-a-logpoint
:::

## Konzole umí víc než `log`

Objekt konzole má metody, které ušetří hodiny čtení výpisů:

| metoda | co udělá | kdy ji použít |
|---|---|---|
| `console.table(items)` | pole objektů vypíše jako tabulku s řádky a sloupci | chceš projít data očima: kde chybí hodnota, kde je `NaN` |
| `console.group('Košík')` … `console.groupEnd()` | výpisy mezi nimi odsadí a dají se sbalit | výpisy z jednoho průchodu nebo jedné funkce mají být pohromadě |
| `console.trace('odkud?')` | vypíše zprávu a stack trace místa, kde stojí | funkci volá víc míst a nevíš, které ji zavolalo se špatnými daty |
| `console.assert(podmínka, zpráva)` | vypíše zprávu jako chybu, jen když podmínka neplatí | hlídání mezivýsledku při bisekci |
| `console.error(chyba)` | vypíše chybu červeně i se stack trace | záchranná síť nahoře, jako ve workshopu Validace objednávky |

:::live js
```js
const cart = [
  { name: 'Etiopie Yirgacheffe', price: 289, quantity: 2 },
  { name: 'Keňa Nyeri', price: 319 },
  { name: 'Kolumbie Huila', price: 259, quantity: 1 },
];

console.table(cart);

function lineTotal(item) {
  console.trace('lineTotal volá:');
  return item.price * item.quantity;
}

console.group('Řádky košíku');
for (const item of cart) {
  console.log(item.name, lineTotal(item));
}
console.groupEnd();
```
:::

> [!TIP]
> Panel výstupu v Akademii vypíše hodnoty jen jako text: tabulku ani skupiny nekreslí a u `console.trace` chybí stack trace. Skutečnou podobu uvidíš v DevTools — otevři na téhle stránce F12, panel **Console**, a kód ukázky vlož tam.

Zkus ukázku vložit do konzole DevTools a v tabulce najdi položku, u které chybí `quantity`. Pak u `lineTotal` rozbal výpis `console.trace` a podívej se, odkud se volala.

:::check
Funkci `formatPrice` volá deset míst v aplikaci a jedno z nich jí posílá text místo čísla. Kterou metodou konzole zjistíš, odkud přišlo špatné volání, aniž bys program zastavil?

### --expected--

console.trace

### --accept--

console.trace()
trace

### --why--

`console.trace` vypíše stack trace místa, kde stojí. Když ho dáš do podmínky `if (typeof price !== 'number')`, vypíše se jen u špatného volání a řekne ti, kdo ho poslal.

### --see--

js-chyby-ladeni/ladeni-systematicky#konzole-umi-vic-nez-log
:::

## Když se zasekneš: gumová kachna a dobrá otázka

Po půl hodině bez pokroku se začneš točit v kruhu. Dvě techniky tě z kruhu vytáhnou.

**[[gumová kachna|Gumová kachna]]** (*rubber duck debugging*): vysvětli kód nahlas řádek po řádku někomu, kdo mu nerozumí — kolegovi, kachničce na stole, prázdné místnosti. Nahlas musíš říct, co každý řádek **opravdu** dělá, ne co si myslíš, že dělá. Chyba se často ukáže uprostřed věty: „…a tady se sleva odečte z celku… vlastně ne, je to uvnitř cyklu."

**Dobrá otázka** pro kolegu nebo fórum má pět částí:

1. Co se snažíš udělat (jedna věta o cíli, ne o kódu).
2. Co čekáš a co se místo toho stane, s přesnou hláškou.
3. Minimální reprodukce: nejkratší kód a data, na kterých se chyba ukáže.
4. Co jsi už zkusil a co z toho vyšlo.
5. Prostředí, když může hrát roli: prohlížeč, verze Node, knihovny.

Při psaní takové otázky chybu často najdeš sám — minimální reprodukce je totiž bisekce vlastního problému.

:::explain
Vysvětli, jak postupuješ, když dostaneš hlášení o chybě v kódu, který jsi nepsal. Tak, jak bys to řekl na pohovoru.

## --model--

Nejdřív chybu zopakuju: zjistím přesný vstup a postup, po kterém nastane, a vstup zmenším na minimum. Pak vyslovím hypotézu o příčině, ze které plyne předpověď, a ověřím ji jedním pokusem — měním vždy jen jednu věc. Když hypotézu nemám, půlím kód: zkontroluju mezivýsledek uprostřed a vyřadím polovinu, kde je všechno v pořádku. Při tom používám breakpointy, podmíněné breakpointy a `console.assert`. Opravu nakonec ověřím na původní reprodukci.

## --checklist--

- Nejdřív chybu spolehlivě zopakuju a vstup zmenším.
- Vyslovím hypotézu, ze které plyne ověřitelná předpověď.
- Měním jednu věc na jeden pokus.
- Bez hypotézy půlím kód kontrolou mezivýsledku uprostřed.
- Opravu ověřím na stejné reprodukci, na které chyba nastala.
:::

:::check
Která otázka na týmový chat dostane nejrychleji užitečnou odpověď?

### --answer--

„Nefunguje mi košík, nevíte někdo proč? Posílám celý projekt."

#### --why--

Kolega nejdřív musí zjistit, co „nefunguje" znamená, a projít celý projekt. Co v otázce chybí, aby mohl odpovědět hned?

### --answer--

„Mám chybu TypeError, poradíte?"

#### --why--

Druh chyby bez celé hlášky, kódu a vstupu nestačí. `TypeError` mají tisíce různých příčin.

### --correct--

„Chci spočítat cenu košíku. `cartTotal([{ price: 289 }])` vrací `NaN`, čekám 289. Kód funkce je níž, zkusil jsem vypsat `item.price` a je to číslo."

#### --why--

Otázka má cíl, očekávaný a skutečný výsledek, minimální reprodukci i to, co už autor zkusil. Kolega může odpovědět bez doptávání.

### --see--

js-chyby-ladeni/ladeni-systematicky#kdyz-se-zaseknes-gumova-kachna-a-dobra-otazka
:::

## Typické chyby a pasti

### Oprava příznaku místo příčiny

Kolega dostal hlášení „v souhrnu objednávky svítí `Celkem: NaN Kč`" a opravil ho:

:::live js predict
```js
function formatTotal(items) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  // oprava hlášení „Celkem: NaN Kč"
  return `Celkem: ${Number.isNaN(total) ? 0 : total} Kč`;
}

console.log(formatTotal([{ price: 890, qty: 2 }, { price: 490, quantity: 1 }]));
```
--question-- Co vypíše tenhle kód?
--expected-- Celkem: 0 Kč
--why-- Druhá položka má klíč `quantity`, ale kód čte `qty`. `490 * undefined` je `NaN` a `NaN` se rozšíří do celého součtu. „Oprava" `NaN` přemaluje na nulu, takže objednávka za 2 270 Kč teď tvrdí, že stojí 0 Kč — a hlášení už nikdo nepošle. Zkus podmínku s `Number.isNaN` smazat a místo toho sjednotit jméno klíče.
:::

> [!PITFALL]
> **Podmínka, která schová špatnou hodnotu (`?? 0`, `|| 0`, `isNaN ? 0`), opraví jen to, co je vidět.** Příznak: hláška zmizí, ale výsledek je tiše špatně a chyba se ukáže jinde. Oprava: zjisti, odkud špatná hodnota přišla (bisekce, `console.assert`), a oprav místo, kde vznikla.

### Víc změn najednou

> [!PITFALL]
> **Změníš tři místa naráz a chyba zmizí — nebo se objeví jiná.** Příznak: nevíš, která změna chybu opravila, a v kódu zůstanou zbytečné úpravy, které můžou rozbít něco dalšího. Oprava: jedna změna, jeden pokus na stejné reprodukci. Co nepomohlo, vrať zpátky.

### „U mě to funguje"

> [!PITFALL]
> **Chybu zkoušíš s jinými daty nebo v jiném prostředí než ten, kdo ji nahlásil.** Příznak: na tvém počítači všechno sedí a hlášení se opakuje dál. Oprava: vyžádej si přesný vstup a postup (co bylo v košíku, jaký prohlížeč, přihlášený, nebo ne) a reprodukci postav s nimi, ne s ukázkovými daty.

### Objekt v konzoli se změnil

> [!PITFALL]
> **Konzole Chrome u vypsaného objektu nebo pole načte vnitřek až ve chvíli, kdy ho rozbalíš.** Příznak: `console.log(cart)` vypíšeš před přidáním položky, a po rozbalení v něm položka už je. U rozbaleného objektu je modrá ikona „i", která na to upozorňuje. Oprava: vypiš kopii v okamžiku výpisu, třeba `console.log(structuredClone(cart))` nebo `console.log(JSON.stringify(cart))`, nebo program zastav breakpointem.

:::check
Kolega v kódu opravil `TypeError: Cannot read properties of undefined (reading 'name')` tak, že `product.name` přepsal na `product?.name ?? ''`. Hláška zmizela. Co je na opravě špatně?

### --answer--

Nic, `?.` je přesně na tohle.

#### --why--

`?.` hlášku odstraní, ale proč vůbec přišel `undefined` místo produktu? Na tuhle otázku oprava neodpovídá.

### --correct--

Opravil příznak: produkt pořád chybí, jen se místo pádu vypíše prázdný název.

#### --why--

Příčina je jinde — produkt se nenašel, nenačetl nebo se ztratil cestou. Stránka teď ukáže položku bez názvu a chyba zůstane skrytá. Oprava patří tam, kde `undefined` vzniklo.

### --answer--

`??` nefunguje s prázdným textem.

#### --why--

`?? ''` s prázdným textem funguje. Problém není v zápisu, ale v tom, co oprava schová.

### --see--

js-chyby-ladeni/ladeni-systematicky#oprava-priznaku-misto-priciny
:::

V labu teď dostaneš kolegův kód tenisového klubu s pěti chybami a bez nápověd. Použij na něj všechno z téhle lekce: reprodukci z hlášení, hypotézu, bisekci a konzoli.

## Kde to najdeš v MDN

- [console](https://developer.mozilla.org/en-US/docs/Web/API/console) — všechny metody konzole včetně `table`, `group`, `trace` a `assert`, s ukázkami výstupu.
- [console: assert() static method](https://developer.mozilla.org/en-US/docs/Web/API/console/assert_static) — co přesně `assert` vypíše a že program nezastaví.
- [Pause your code with breakpoints (Chrome DevTools)](https://developer.chrome.com/docs/devtools/javascript/breakpoints) — podmíněné breakpointy, logpointy a zastavení na výjimkách. Není to MDN, ale oficiální dokumentace Chrome.
- [Console features reference (Chrome DevTools)](https://developer.chrome.com/docs/devtools/console/reference) — jak konzole zobrazuje objekty, chyby a jejich příčiny (`Caused by:`).

# --questions--

## --question--

Hlášení zní: „Doprava zdarma od 1 500 Kč nefunguje." Kolega to zkusil s košíkem za 2 000 Kč a za 900 Kč a obojí dopadlo správně. S jakou cenou košíku má reprodukci zkusit jako první? Napiš jen číslo.

### --expected--

1500

### --accept--

1 500

### --why--

Hranice pravidla je nejpravděpodobnější úkryt chyby: `total > 1500` místo `>=` se ukáže jen přesně na 1 500 Kč. Hodnoty daleko od hranice dopadnou správně s chybou i bez ní.

### --see--

js-chyby-ladeni/ladeni-systematicky#nejdriv-chybu-spolehlive-zopakuj

## --question--

Import objednávek má 16 kroků zpracování za sebou a na konci je výsledek špatně. Kontrola mezivýsledku po kroku 8 prošla, kontrola po kroku 12 selhala. Po kterém kroku zkontroluješ mezivýsledek teď? Napiš jen číslo.

### --expected--

10

### --accept--

po kroku 10

### --why--

Po kroku 8 je všechno v pořádku a po kroku 12 už ne, takže chyba je v krocích 9 až 12. Bisekce kontroluje uprostřed zbývajícího úseku, tedy po kroku 10: když projde, zbývají kroky 11 a 12, když ne, kroky 9 a 10.

### --see--

js-chyby-ladeni/ladeni-systematicky#bisekce-pul-kodu-pryc

## --question--

Co vypíše tenhle kód?

```js
const cart = { items: [], coupon: '' };

console.assert(cart.items, 'Košík chybí');
console.assert(cart.items.length, 'Košík je prázdný');
console.assert(cart.coupon !== undefined, 'Chybí políčko slevy');
console.log('pokračuju');
```

### --expected--

Assertion failed: Košík je prázdný
pokračuju

### --why--

`console.assert` posuzuje podmínku jako `if`: prázdné pole je pravdivá hodnota, takže první kontrola mlčí, ale délka `0` je nepravdivá a druhá kontrola zprávu vypíše. Prázdný text `''` není `undefined`, třetí kontrola taky mlčí. Program se nezastaví, proto proběhne i poslední výpis.

### --see--

js-chyby-ladeni/ladeni-systematicky#bisekce-pul-kodu-pryc

## --question--

Chyba nastane v cyklu jen u jedné z 2 000 rezervací. Chceš program zastavit právě u ní a v panelu Scope si prohlédnout všechny proměnné. Který nástroj DevTools použiješ?

### --answer--

Obyčejný breakpoint na řádku v cyklu

#### --why--

Obyčejný breakpoint zastaví program při každém průchodu, tedy až 2 000krát, než se dostaneš k té pravé rezervaci.

### --answer--

Logpoint na řádku v cyklu

#### --why--

Logpoint program nezastaví, jen vypíše zprávu — a to při každém průchodu. Scope bys neviděl.

### --correct--

Podmíněný breakpoint s podmínkou na `id` rezervace

#### --why--

Podmíněný breakpoint zastaví jen tehdy, když podmínka (`booking.id === 1733`) platí. Program se tak zastaví jednou a Scope ukáže stav právě u té rezervace.

### --answer--

Pause on uncaught exceptions

#### --why--

Tahle volba zastaví jen na výjimce, kterou nikdo nechytil. Tady ale jde o hodnotu u jedné rezervace, ne o výjimku.

### --see--

js-chyby-ladeni/ladeni-systematicky#podmineny-breakpoint-a-logpoint
