# Funkce jako hodnoty

:::check pretest
Co vypíše poslední řádek? Tipni si, i když si nejsi jistý.

```js
function withVat(price) {
  return price * 1.21;
}

const calculate = withVat;
console.log(calculate(100));
```

### --expected--

121

### --why--

`calculate` není kopie výsledku, ale druhé jméno pro tutéž funkci. Proč to jde a k čemu je to dobré, vysvětlí první část lekce.
:::

:::check pretest
Tlačítko má za dvě sekundy vypsat „Uloženo". Kolega napsal `setTimeout(showSaved(), 2000)`. Co se stane?

### --answer--

Za dvě sekundy se vypíše „Uloženo".

#### --why--

To by platilo bez jedné dvojice závorek. Rozdíl mezi `showSaved` a `showSaved()` je hlavní téma lekce.

### --correct--

„Uloženo" se vypíše hned a za dvě sekundy se nestane nic.

#### --why--

Závorky funkci zavolají okamžitě a `setTimeout` dostane až její výsledek. Proč, uvidíš v části o `fn` a `fn()`.

### --answer--

Program spadne s chybou.

#### --why--

Nespadne, a právě proto je to zrádné. Co přesně `setTimeout` dostal, uvidíš v části o `fn` a `fn()`.
:::

Když na e-shopu klikneš na „Přidat do košíku", píšeš do vyhledávání nebo zavřeš
oznámení po pěti sekundách, vždycky někdo — prohlížeč, knihovna, jiná funkce — spustí
**tvůj** kód až ve správnou chvíli. Nemůžeš mu dát výsledek, protože ten ještě
neexistuje. Musíš mu dát **postup**, tedy funkci, a on si ji zavolá sám.

Představ si, že potřebuješ na cenu použít jednou polovinu, jindy slevu 100 Kč, jindy
DPH. Bez funkcí jako hodnot bys pro každé pravidlo psal novou verzi celé funkce:

```js
function applyHalfPrice(price) { return price / 2; }
function applyCoupon(price) { return price - 100; }
function applyVat(price) { return price * 1.21; }
```

Lepší je jedna funkce, které **pravidlo předáš** jako argument. To jde, protože
v JavaScriptu je funkce hodnota jako číslo nebo text.

> [!REMEMBER]
> **Funkce je hodnota: jde ji uložit do proměnné, předat jiné funkci a zavolat později.
> Jméno bez závorek funkci podává dál, závorky ji volají hned.**

## Funkce v proměnné

Deklarace `function withVat(price) { … }` vytvoří funkci a uloží ji do proměnné
`withVat`. Tu proměnnou můžeš přiřadit jinam, stejně jako proměnnou s číslem. Funkce
se tím nezkopíruje: obě jména ukazují na tutéž funkci.

:::live js
```js
function withVat(price) {
  return price * 1.21;
}

const calculate = withVat;

console.log(calculate(100));
console.log(calculate === withVat);
console.log(typeof calculate);
```
:::

Zkus změnit sazbu v těle `withVat` na `1.12` a sleduj, že se změní i výsledek
`calculate(100)` — jde pořád o jednu funkci. `typeof` u funkce vrací `'function'`.

:::memory
```js
function withVat(price) {
  return price * 1.21;
}
const calculate = withVat;
const total = calculate(100);
```
--step-- 3 | deklarace uloží funkci do proměnné withVat
withVat -> @fn
@fn: function withVat(price)
--step-- 4 | calculate dostane odkaz na tutéž funkci, ne její kopii
withVat -> @fn
calculate -> @fn
@fn: function withVat(price)
--step-- 5 | teprve závorky funkci zavolají; do total jde návratová hodnota
withVat -> @fn
calculate -> @fn
total = 121
@fn: function withVat(price)
:::

Šipková funkce v `const` je totéž bez deklarace: `const halfPrice = (price) => price / 2;`
rovnou ukládá funkci do proměnné.

:::check
Co je po provedení kódu v proměnné `rule`?

```js
const halfPrice = (price) => price / 2;
const rule = halfPrice;
```

### --answer--

Číslo, výsledek funkce `halfPrice`.

#### --why--

Výsledek by vznikl jen zavoláním se závorkami a argumentem. Tady se nic nevolá.

### --correct--

Tatáž funkce, na kterou ukazuje `halfPrice`.

#### --why--

Přiřazení bez závorek zkopíruje odkaz na funkci. `rule(900)` i `halfPrice(900)` vrátí `450`.

### --answer--

Kopie funkce, kterou jde měnit zvlášť.

#### --why--

Funkce se přiřazením nekopíruje. Obě jména ukazují na jedinou funkci.

### --see--

js-funkce/funkce-jako-hodnoty#funkce-v-promenne
:::

## `fn` vs. `fn()`: předat, nebo zavolat

Tohle je jádro celé lekce. ==`fn`== je funkce sama, hodnota typu `'function'`.
==`fn()`== je výsledek jejího zavolání — to, co vrátí `return`.

:::live js predict
```js
function getDeliveryDate() {
  return 'zítra';
}

const first = getDeliveryDate;
const second = getDeliveryDate();

console.log(typeof first, typeof second);
```
--question-- Co vypíše `console.log`? Napiš obě slova oddělená mezerou.
--expected-- function string
--why-- `first` dostala funkci samotnou, protože za jménem nejsou závorky. `second` dostala výsledek zavolání, tedy text `'zítra'`. Zkus vypsat `'Doručení: ' + first` — místo data uvidíš celý zdrojový kód funkce.
:::

Kdy potřebuješ které? Když chceš **hodnotu teď**, voláš: `const total = withVat(100)`.
Když chceš, aby funkci zavolal **někdo jiný**, podáš ji bez závorek. Pomůže otázka:
„Mám už teď všechno, co funkce potřebuje, a chci její výsledek?"

:::check
Funkce `applyRule(price, rule)` zavolá `rule(price)` a vrátí výsledek. Ve kterém volání dostane `applyRule` správný argument?

```js
const halfPrice = (price) => price / 2;
```

### --answer--

`applyRule(900, halfPrice(900))`

#### --why--

`halfPrice(900)` se spočítá dřív, než se `applyRule` zavolá, takže jako `rule` přijde číslo `450`. Pokus zavolat číslo skončí `TypeError: rule is not a function`.

### --correct--

`applyRule(900, halfPrice)`

#### --why--

`halfPrice` bez závorek je funkce. `applyRule` si ji zavolá sama s cenou, kterou má.

### --answer--

`applyRule(900, halfPrice())`

#### --why--

Závorky funkci zavolají hned, a to bez ceny: `undefined / 2` je `NaN`. Do `applyRule` pak přijde číslo, ne funkce.

### --see--

js-funkce/funkce-jako-hodnoty#fn-vs-fn-predat-nebo-zavolat
:::

## Callback: funkce, kterou zavolá někdo jiný

Funkce, kterou předáš jiné funkci, aby ji zavolala, se jmenuje [[callback]] (česky
se někdy říká „zpětné volání"). Funkce, která callback dostane, rozhoduje, **kdy** ho
zavolá a **s jakými argumenty**.

:::live js
```js
function applyRule(price, rule) {
  const newPrice = rule(price);
  return Math.round(newPrice);
}

const halfPrice = (price) => price / 2;

console.log(applyRule(899, halfPrice));
console.log(applyRule(899, (price) => price - 100));
console.log(applyRule(899, (price) => price * 1.21));
```
:::

Druhé a třetí volání předávají šipkovou funkci přímo v závorkách, bez jména. U callbacků
je to nejčastější zápis: pravidlo je krátké a jinde se nepoužije. Zkus přidat volání
s pravidlem „sleva 15 %".

Funkce jako `applyRule`, která jinou funkci přijímá (nebo ji vrací), se jmenuje
[[funkce vyššího řádu]] (*higher-order function*). Je jich plný jazyk: metody polí
`map` a `filter` ze sekce *Pole v JavaScriptu*, posluchače událostí v DOM, `setTimeout`.

Callback s `for` cyklem vypadá takhle — `repeat` rozhoduje, kolikrát a s jakým číslem
kola se zavolá tvoje funkce:

:::live js predict
```js
function repeat(times, action) {
  for (let round = 1; round <= times; round++) {
    action(round);
  }
}

repeat(3, (round) => console.log(`Kolo ${round}`));
```
--question-- Co vypíše tenhle kód? Každý výpis na nový řádek.
--expected--
```text
Kolo 1
Kolo 2
Kolo 3
```
--why-- `repeat` zavolá callback třikrát a pokaždé mu předá aktuální číslo kola. Callback sám nic nepočítá, jen vypíše to, co dostal. Zkus místo `3` napsat `0` — callback se nezavolá ani jednou.
:::

:::check
Proč callback z posledního příkladu dostane čísla 1, 2 a 3, když je v callbacku nikde nepíšeš?

### --answer--

Šipková funkce si čísla kol spočítá sama.

#### --why--

Callback nic nepočítá, jen vypíše svůj parametr `round`. Hledej, kdo mu tu hodnotu dává.

### --correct--

`repeat` ho volá jako `action(round)` a čísla mu předá jako argument.

#### --why--

O argumentech callbacku rozhoduje ten, kdo ho volá. `repeat` volá `action(round)`, a proto callback dostane aktuální hodnotu `round`.

### --answer--

Parametr `round` v callbacku je stejná proměnná jako `round` v cyklu.

#### --why--

Jsou to dvě různé proměnné se stejným jménem, každá ve své funkci. Callback by fungoval stejně s parametrem `n`.

### --see--

js-funkce/funkce-jako-hodnoty#callback-funkce-kterou-zavola-nekdo-jiny
:::

:::explain
Vysvětli vlastními slovy, co je callback a proč se funkce předává bez závorek.

## --model--

Callback je funkce, kterou předám jiné funkci, aby ji zavolala sama — až ve chvíli, kterou určí ona, a s argumenty, které jí dá ona. Předávám ji bez závorek, protože chci předat funkci samotnou. Se závorkami bych ji zavolal hned a předal jen její výsledek, třeba číslo nebo `undefined`. Díky callbackům jde napsat jednu obecnou funkci a konkrétní chování jí dodat zvenku.

## --checklist--

- Callback je funkce předaná jako argument jiné funkci.
- Kdy a s jakými argumenty se callback zavolá, rozhoduje funkce, která ho dostala.
- Bez závorek předávám funkci, se závorkami její výsledek.
- Callback umožní napsat obecnou funkci a chování jí dodat zvenku.
:::

## Callback a `setTimeout`

První callback, který za tebe volá sám prohlížeč, je `setTimeout(callback, ms)`:
„za `ms` milisekund zavolej tuhle funkci". Typické použití: skrýt oznámení po pěti
sekundách, zobrazit nápovědu, když uživatel chvíli nic nedělá.

:::live js
```js
function hideNotice() {
  console.log('Oznámení skryto');
}

console.log('Objednávka odeslána');
setTimeout(hideNotice, 1500);
console.log('Pokračuju dál');
```
:::

Sleduj pořadí výpisů. `setTimeout` na nic nečeká: jen si callback poznamená a program
hned pokračuje dalším řádkem. Za 1,5 sekundy pak prohlížeč `hideNotice` zavolá.
Zkus změnit čas na `0`:

:::live js predict
```js
console.log('A');
setTimeout(() => console.log('B'), 0);
console.log('C');
```
--question-- V jakém pořadí se písmena vypíší?
--option-- A, B, C
--option*-- A, C, B
--option-- B, A, C
--why-- I s nulou se callback zavolá až poté, co doběhne právě běžící kód. `setTimeout` ho jen zařadí „na později" a program pokračuje řádkem `C`. Proč přesně, vysvětlí sekce *Asynchronní JavaScript a fetch*; teď stačí vědět, že callback z `setTimeout` nikdy neběží hned.
:::

`setTimeout` vrací číslo časovače. Když si ho uložíš, můžeš plánované volání zrušit:
`const timer = setTimeout(hideNotice, 5000);` a později `clearTimeout(timer)`, třeba
když uživatel oznámení zavře sám.

:::check
Napiš volání, které za 3 sekundy zavolá funkci `showHint`.

### --expected--

setTimeout(showHint, 3000)

### --accept--

setTimeout(() => showHint(), 3000)
setTimeout(function () { showHint(); }, 3000)
setTimeout(showHint, 3_000)

### --why--

`setTimeout` dostane funkci bez závorek a čas v milisekundách. Obal do šipky `() => showHint()` je taky správně: předáváš novou funkci, která `showHint` zavolá až uvnitř.

### --see--

js-funkce/funkce-jako-hodnoty#callback-a-settimeout
:::

## Typické chyby a pasti

### Závorky u callbacku

:::live js
```js
function showSaved() {
  console.log('Uloženo');
}

setTimeout(showSaved(), 2000);
console.log('Časovač nastaven');
```
:::

> [!PITFALL]
> **`setTimeout(showSaved(), 2000)` zavolá funkci hned.** Příznak: akce proběhne
> okamžitě a po uplynutí času se nestane nic, bez chybové hlášky. `setTimeout` dostal
> výsledek funkce (`undefined`), ne funkci. Oprava: `setTimeout(showSaved, 2000)`,
> nebo s argumenty `setTimeout(() => showSaved('Profil'), 2000)`.

U vlastních funkcí vyššího řádu je příznak hlasitější: `applyRule(900, halfPrice(900))`
spadne s `TypeError: rule is not a function`, protože se `applyRule` pokusí zavolat číslo.

### Callback, který nic nevrací

> [!PITFALL]
> **Pravidlo předané jako callback počítá, ale nevrací.** Příznak: funkce vyššího řádu
> vrátí `undefined` nebo `NaN`, třeba `applyRule(899, (price) => { price - 100; })`
> dá `NaN`. Oprava: v šipce se složenými závorkami napiš `return`, nebo závorky smaž:
> `(price) => price - 100`.

### Argumenty rozhoduje volající

:::live js predict
```js
function showMessage(text) {
  console.log(`Zpráva: ${text}`);
}

setTimeout(showMessage, 0);
```
--question-- Co se po chvíli vypíše?
--option-- `Zpráva: ` a za dvojtečkou nic
--option*-- `Zpráva: undefined`
--option-- Nic, `setTimeout` bez textu callback nezavolá
--why-- `setTimeout` zavolá `showMessage` bez argumentů, takže parametr `text` je `undefined` a dosadí se do textu. Callback nedostane to, co by „dávalo smysl", ale to, co mu předá volající. Tady pomůže obalit volání šipkou: `setTimeout(() => showMessage('Objednávka odeslána'), 0)`.
:::

> [!PITFALL]
> **Callback čeká argument, který mu volající nedá.** Příznak: `undefined` v textu
> nebo `NaN` ve výpočtu, i když funkce sama o sobě funguje. Oprava: podívej se, s čím
> callback volající volá, a potřebné hodnoty doplň v obalující šipce.

:::check
Kolegův kód má po 5 sekundách skrýt banner s akcí, ale banner zmizí hned po načtení stránky. Oprav řádek `setTimeout(hideBanner(), 5000);` a napiš ho celý.

### --expected--

setTimeout(hideBanner, 5000);

### --accept--

setTimeout(() => hideBanner(), 5000);
setTimeout(function () { hideBanner(); }, 5000);

### --why--

Se závorkami se `hideBanner` zavolá hned a `setTimeout` dostane `undefined`. Bez závorek dostane funkci a zavolá ji za 5 sekund.

### --see--

js-funkce/funkce-jako-hodnoty#zavorky-u-callbacku
:::

## Kde to najdeš v MDN

- [First-class Function](https://developer.mozilla.org/en-US/docs/Glossary/First-class_Function) — definice „funkce jako hodnota" s ukázkami přiřazení, předání a vrácení funkce.
- [Callback function](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function) — krátká definice callbacku a rozdíl mezi synchronním a asynchronním voláním.
- [Window: setTimeout() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) — parametry `functionRef`, `delay` a další argumenty pro callback; část *Return value* o čísle časovače.
- [Window: clearTimeout() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearTimeout) — zrušení naplánovaného volání.

Příště v generátoru hesel předáš callback, který rozhodne o náhodě, a díky tomu půjde hesla spolehlivě otestovat.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
function applyTwice(value, action) {
  return action(action(value));
}

console.log(applyTwice(10, (n) => n * 3));
```

### --expected--

90

### --why--

`applyTwice` zavolá callback nejdřív s `10` (vyjde `30`) a výsledek pošle do druhého volání (`30 * 3`). Kolikrát a s čím se callback zavolá, rozhoduje funkce, která ho dostala.

### --see--

js-funkce/funkce-jako-hodnoty#callback-funkce-kterou-zavola-nekdo-jiny

## --question--

Co vypíše tenhle kód?

```js
const format = (amount) => `${amount} Kč`;
console.log(`Cena: ${format}`);
```

### --answer--

`Cena: undefined Kč`

#### --why--

`undefined` by se dosadilo, kdyby se funkce zavolala bez argumentu. Zavolaná tu ale vůbec není — podívej se, jestli za `format` jsou závorky.

### --correct--

`Cena: ` a za tím zdrojový kód šipkové funkce

#### --why--

`format` bez závorek je funkce sama. Při vložení do textu se převede na svůj zdrojový kód, takže se vypíše ``Cena: (amount) => `${amount} Kč` ``.

### --answer--

`TypeError: format is not a function`

#### --why--

`format` funkce je, jen se tu nevolá. Chyba by vznikla naopak při pokusu zavolat něco, co funkce není.

### --see--

js-funkce/funkce-jako-hodnoty#fn-vs-fn-predat-nebo-zavolat

## --question--

Napiš volání `applyRule(price, rule)`, které na cenu `1200` použije pravidlo „sleva 200 Kč" zapsané jako šipková funkce přímo v argumentu.

### --expected--

applyRule(1200, (price) => price - 200)

### --accept--

applyRule(1200, price => price - 200)
applyRule(1200, (p) => p - 200)
applyRule(1200, p => p - 200)
applyRule(1200, (price) => { return price - 200; })

### --why--

Druhý argument je funkce, kterou si `applyRule` zavolá s cenou. Šipka s výrazem vrátí `price - 200` sama; se složenými závorkami potřebuje `return`.

### --see--

js-funkce/funkce-jako-hodnoty#callback-funkce-kterou-zavola-nekdo-jiny
