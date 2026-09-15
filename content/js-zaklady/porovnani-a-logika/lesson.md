# Porovnání a logika

:::check pretest
Zákazník do pole „Kód kupónu" napsal `0`. Program má podmínku `if (couponCode)` a v `couponCode` je text `'0'`. Provede se blok `if`?

### --answer--

Ne, nula je v podmínce nepravda.

#### --why--

Nula nepravda opravdu je — ale tady nula není číslo. Rozdíl vysvětlí část o truthy a falsy.

### --correct--

Ano, provede se.

#### --why--

Text `'0'` není prázdný, a každý neprázdný text se v podmínce chová jako pravda. Pravidla uvidíš v části o truthy a falsy.

### --answer--

Program spadne, protože text není `true` ani `false`.

#### --why--

Podmínka přijme jakoukoli hodnotu, nejen `true` a `false`. Jak s ní naloží, vysvětlí část o truthy a falsy.
:::

:::check pretest
Co vypíše tenhle řádek? Napiš dvě hodnoty oddělené mezerou.

```js
console.log(10 == '10', 10 === '10');
```

### --expected--

true false

### --why--

`==` před porovnáním převádí typy, `===` ne. Proč se `==` v moderním kódu nepíše, uvidíš v druhé části.
:::

E-shop se rozhoduje na každém kroku: dopravu zdarma dá jen nad určitou částku, u prázdného košíku ukáže „Košík je prázdný", přihlášenému zákazníkovi nabídne slevu. Každé takové rozhodnutí je v kódu podmínka. A podmínky v JavaScriptu mají pravidla, která na první pohled vypadají logicky — a přesně na nich vznikají chyby typu „doprava zdarma se nabídla u prázdného košíku".

> [!REMEMBER]
> **Podmínka se neptá „je to `true`?", ale „je to pravdivá hodnota?".** Každá hodnota v JavaScriptu je v podmínce buď pravdivá (*truthy*), nebo nepravdivá (*falsy*) — a nepravdivých je jen hrstka.

## Porovnání vrací `true` nebo `false`

Porovnávací operátory se ptají a odpovídají hodnotou typu `boolean`:

| operátor | otázka | příklad | výsledek |
|---|---|---|---|
| `>` `<` | je větší, menší? | `1250 > 1500` | `false` |
| `>=` `<=` | je větší nebo rovno, menší nebo rovno? | `1500 >= 1500` | `true` |
| `===` | je stejné (hodnota i typ)? | `'Brno' === 'Brno'` | `true` |
| `!==` | je různé? | `3 !== 3` | `false` |

Výsledek porovnání je obyčejná hodnota. Jde vypsat nebo uložit do proměnné:

:::live js
```js
const cartTotal = 1250;
const FREE_SHIPPING_LIMIT = 1500;

const hasFreeShipping = cartTotal >= FREE_SHIPPING_LIMIT;
console.log('Doprava zdarma:', hasFreeShipping);
console.log('Chybí do dopravy zdarma:', FREE_SHIPPING_LIMIT - cartTotal, 'Kč');
```
:::

Zkus změnit `cartTotal` na `1500` a pak na `1501`. U které hodnoty se výsledek změní? Pak zkus `>=` přepsat na `>`.

:::check
Jakou hodnotu bude mít `canVote` pro `const age = 18;`?

```js
const canVote = age >= 18;
```

### --expected--

true

### --why--

`>=` znamená „větší **nebo rovno**", takže hraniční hodnota `18` podmínku splní. S `>` by vyšlo `false`.

### --see--

js-zaklady/porovnani-a-logika#porovnani-vraci-true-nebo-false
:::

## Přísná rovnost `===` a volná `==`

JavaScript má dvě rovnosti. [[přísná rovnost]] `===` porovná hodnotu i typ: číslo `10` a text `'10'` jsou různé. Volná rovnost `==` před porovnáním typy převádí podle pravidel, která si nikdo nepamatuje celá:

:::live js predict
```js
const discountInput = '';

console.log(discountInput == 0);
```
--question-- Pole se slevou zůstalo prázdné. Co vypíše `console.log`?
--expected-- true
--why-- `==` převede prázdný text na číslo, a to je `0`. Porovnává tedy `0 == 0`. Prázdné pole a pole s nulou tak program nerozliší. S `===` vyjde `false`, protože text a číslo jsou různé typy.
:::

Další výsledky `==`, které nečekáš: `'0' == false` je `true`, `null == 0` je `false`, ale `null == undefined` je `true`. Nemusíš se to učit — stačí `==` nepoužívat.

> [!REMEMBER]
> **Porovnávej přes `===` a `!==`.** Když porovnáváš hodnoty různých typů (text z formuláře s číslem), převeď je nejdřív sám přes `Number()`. Pak je v kódu vidět, co porovnáváš.

:::check
V `quantityInput` je text `'0'` z formulářového pole. Proč podmínka `quantityInput === 0` nikdy neplatí?

### --answer--

`===` neumí porovnávat s nulou.

#### --why--

S nulou `===` porovnává bez problémů. Co je na levé straně?

### --correct--

Vlevo je text a vpravo číslo, a `===` typy nepřevádí.

#### --why--

`'0'` a `0` jsou různé typy, takže `===` vrátí `false`. Oprava: `Number(quantityInput) === 0`.

### --answer--

Text `'0'` se převede na `false`.

#### --why--

`===` nic nepřevádí, to dělá `==`. Proč tedy porovnání neplatí?

### --see--

js-zaklady/porovnani-a-logika#prisna-rovnost-a-volna
:::

## Rozhodování: `if`, `else if`, `else`

`if` provede blok ve složených závorkách jen tehdy, když podmínka v kulatých závorkách platí. `else` nabídne blok pro opačný případ a `else if` přidá další otázku:

:::live js
```js
const cartTotal = 900;

if (cartTotal === 0) {
  console.log('Košík je prázdný.');
} else if (cartTotal >= 1500) {
  console.log('Doprava zdarma.');
} else if (cartTotal >= 1000) {
  console.log('Doprava za 49 Kč.');
} else {
  console.log('Doprava za 89 Kč.');
}
```
:::

Zkus postupně nastavit `cartTotal` na `0`, `1000`, `1499` a `2000`.

Řetěz `else if` se prochází **shora dolů a provede se jen první větev, jejíž podmínka platí.** Ostatní se už nekontrolují. U hranic proto záleží na pořadí: kdyby `>= 1000` stálo před `>= 1500`, dostal by košík za 2 000 Kč dopravu za 49 Kč — podmínka `2000 >= 1000` totiž platí taky.

:::check
Co vypíše tenhle kód?

```js
const temperature = 31;

if (temperature > 20) {
  console.log('teplo');
} else if (temperature > 30) {
  console.log('horko');
} else {
  console.log('zima');
}
```

### --expected--

teplo

### --why--

Provede se první větev, jejíž podmínka platí. `31 > 20` platí, takže se vypíše `teplo` a na `> 30` už nedojde. Hranice se v řetězu řadí od nejpřísnější.

### --see--

js-zaklady/porovnani-a-logika#rozhodovani-if-else-if-else
:::

## Truthy a falsy

Do `if` nemusíš dát jen `true` nebo `false`. Každou hodnotu JavaScript v podmínce převede na pravdu, nebo nepravdu. Hodnoty, které se chovají jako nepravda, se jmenují [[falsy]] a je jich pár:

- `false`
- `0` a `-0` (a `0n`)
- `''` — prázdný text
- `null` a `undefined`
- `NaN`

**Všechno ostatní je [[truthy]]** — i `'0'`, `'false'`, `' '` (text s mezerou), záporná čísla a prázdné pole `[]`.

:::live js
```js
const couponCode = '';
const itemsInCart = 3;

if (couponCode) {
  console.log('Uplatňuji kupón', couponCode);
} else {
  console.log('Bez kupónu');
}

if (itemsInCart) {
  console.log('Pokračovat k pokladně');
}
```
:::

Zkus nastavit `couponCode` na `' '` (mezera) a `itemsInCart` na `0`. Pak na začátek podmínky přidej vykřičník: `if (!couponCode)`. Operátor `!` otočí pravdivost a vrátí `true` nebo `false`.

Když z hodnoty potřebuješ opravdový `boolean`, převeď ji přes `Boolean(value)`. Ve starším kódu uvidíš zkratku `!!value` — dvojí otočení dá totéž.

:::check
Která hodnota se v podmínce chová jako nepravda?

### --answer--

`'false'`

#### --why--

Myslíš si, že rozhoduje, co je v textu napsáno? Rozhoduje jen to, jestli je text prázdný.

### --answer--

`-1`

#### --why--

Falsy je z čísel jen nula (a `NaN`). Ostatní čísla, i záporná, jsou truthy.

### --correct--

`NaN`

#### --why--

`NaN` je jedna z falsy hodnot, stejně jako `0`, `''`, `null` a `undefined`.

### --answer--

`' '`

#### --why--

Text s mezerou není prázdný — má jeden znak. Falsy je jen text bez jediného znaku.

### --see--

js-zaklady/porovnani-a-logika#truthy-a-falsy
:::

## Skládání podmínek: `&&`, `||` a `!`

Podmínky se skládají: `&&` (a zároveň) platí, když platí obě strany, `||` (nebo) platí, když platí aspoň jedna. `&&` má přednost před `||`, takže při kombinaci obou použij závorky.

```js
if (isLoggedIn && cartTotal > 0) { … }
if (paymentMethod === 'karta' || paymentMethod === 'převod') { … }
```

Oba operátory vyhodnocují **zkráceně** (*short-circuit*): jakmile je výsledek jasný, druhou stranu vůbec nevyhodnotí. A pozor — nevracejí `true` nebo `false`, ale **jednu ze svých stran**:

- `a || b` vrátí `a`, když je truthy, jinak `b`.
- `a && b` vrátí `a`, když je falsy, jinak `b`.

:::live js predict
```js
const savedQuantity = 0;

console.log(savedQuantity || 5);
```
--question-- Zákazník si v košíku nastavil počet kusů na nulu. Co vypíše `console.log`?
--expected-- 5
--why-- `||` vrátí levou stranu jen tehdy, když je truthy. `0` je falsy, a tak vrátí pravou stranu `5`. Nula, kterou zákazník záměrně nastavil, se ztratila. Jak to udělat správně, ukáže další část.
:::

:::check
Co vrátí výraz `'Ema' && 'Petr'`?

### --expected--

Petr

### --accept--

'Petr'

### --why--

`&&` vrátí levou stranu, jen když je falsy. `'Ema'` je truthy, a tak vrátí pravou stranu `'Petr'` — ne `true`.

### --see--

js-zaklady/porovnani-a-logika#skladani-podminek-a
:::

## Výchozí hodnota: `??` místo `||`

Operátor `??` (*nullish coalescing*) vrátí pravou stranu **jen tehdy, když je levá `null` nebo `undefined`**. Nula, prázdný text i `false` zůstanou. Proto se pro výchozí hodnoty hodí líp než `||`:

:::live js predict
```js
const savedQuantity = 0;

console.log(savedQuantity ?? 5);
```
--question-- Stejná situace, jen s `??`. Co vypíše `console.log`?
--expected-- 0
--why-- `??` se dívá jen na `null` a `undefined`. Nula je platná hodnota, a tak zůstane. `5` by se použila, jen kdyby zákazník počet vůbec neuložil (`undefined`). Zkus změnit `0` na `undefined` a pak na `null`.
:::

S `??` souvisí zápis `?.` (*optional chaining*). Když čteš údaj z něčeho, co nemusí existovat, `?.` místo pádu vrátí `undefined`: `order.customer?.email`. Objekty poznáš v sekci Objekty, zatím si zapamatuj, že dvojice `?.` a `??` se často potkává v jednom řádku — „přečti, a když nic není, dej výchozí hodnotu".

:::check
Nastavení e-shopu má počet produktů na stránku v proměnné `pageSize`. Hodnota `0` znamená „všechny na jedné stránce". Který zápis dá `24` jen tehdy, když nastavení chybí?

### --answer--

`const perPage = pageSize || 24;`

#### --why--

`||` nahradí každou falsy hodnotu, tedy i nulu. Nastavení „všechny na jedné stránce" by se ztratilo.

### --correct--

`const perPage = pageSize ?? 24;`

#### --why--

`??` nahradí jen `null` a `undefined`. Nula zůstane.

### --answer--

`const perPage = pageSize && 24;`

#### --why--

`&&` vrátí pravou stranu naopak tehdy, když je levá truthy. Nastavení `50` by se tak změnilo na `24`.

### --see--

js-zaklady/porovnani-a-logika#vychozi-hodnota-misto
:::

## Ternární operátor

Když podle podmínky vybíráš jednu ze dvou **hodnot**, je `if`/`else` zbytečně dlouhý. [[ternární operátor|Ternární operátor]] je výraz: `podmínka ? hodnota, když platí : hodnota, když neplatí`.

:::live js
```js
const itemsInCart = 1;

const label = itemsInCart === 1 ? 'položka' : 'položek';
console.log(`V košíku: ${itemsInCart} ${label}`);
console.log(`Doprava: ${itemsInCart > 0 ? '89 Kč' : '—'}`);
```
:::

Zkus `itemsInCart` změnit na `5` a na `0`. Protože je ternární operátor výraz, jde vložit i do šablonového řetězce. Čeština má ale tři tvary (1 položka, 2 položky, 5 položek) — dvě možnosti nestačí; poctivé řešení přijde v sekci o řetězcích a číslech.

Ternární operátory do sebe nevnořuj. Tři a víc možností se čtou líp jako `if`/`else if`.

:::check
Napiš výraz, který vrátí `'skladem'`, když je `stock` větší než nula, jinak `'vyprodáno'`.

### --expected--

stock > 0 ? 'skladem' : 'vyprodáno'

### --accept--

0 < stock ? 'skladem' : 'vyprodáno'
stock <= 0 ? 'vyprodáno' : 'skladem'

### --why--

Nejdřív podmínka, za otazníkem hodnota pro „platí", za dvojtečkou hodnota pro „neplatí".

### --see--

js-zaklady/porovnani-a-logika#ternarni-operator
:::

## `switch` a propadání

Když jednu hodnotu porovnáváš s řadou konkrétních možností, je `switch` přehlednější než dlouhý řetěz `else if`. Porovnává přes `===`. Každý `case` je **místo, odkud se začne provádět** — a provádí se dál, dokud nenarazí na `break`:

:::live js predict
```js
const orderStatus = 'paid';

switch (orderStatus) {
  case 'new':
    console.log('Čeká na platbu');
  case 'paid':
    console.log('Připravujeme');
  case 'shipped':
    console.log('Na cestě');
    break;
  default:
    console.log('Neznámý stav');
}
```
--question-- Co vypíše tenhle kód? Každý výpis na vlastní řádek.
--expected--
```text
Připravujeme
Na cestě
```
--why-- `switch` skočí na `case 'paid'` a odtud provádí příkazy dál. Za výpisem `Připravujeme` chybí `break`, a tak [[propadání|propadne]] do dalšího `case` a vypíše i `Na cestě`. Zastaví ho až `break`. Doplň `break` za každý výpis a zkus to znovu.
:::

Propadání má jedno užitečné použití: víc hodnot se stejnou větví se píše jako `case` pod sebou bez příkazů. `default` je větev pro všechno ostatní, obdoba posledního `else`.

```js
switch (paymentMethod) {
  case 'karta':
  case 'apple-pay':
    console.log('Zaplaceno online');
    break;
  default:
    console.log('Platba při převzetí');
}
```

:::check
Kolik výpisů udělá první ukázka z téhle části pro `orderStatus = 'new'`?

### --expected--

3

### --why--

Z `case 'new'` propadne kód do `'paid'` a do `'shipped'`, kde je teprve `break`. Vypíšou se tři řádky.

### --see--

js-zaklady/porovnani-a-logika#switch-a-propadani
:::

## Rozhodnutí zabalené do funkce

Stejné rozhodnutí budeš potřebovat na víc místech: cenu dopravy chce košík, pokladna i potvrzovací e-mail. Proto se rozhodnutí balí do **funkce** — pojmenovaného kusu kódu, který dostane vstup a vrátí výsledek. Funkce do hloubky probere sekce Funkce, teď stačí čtyři věci:

- `function shippingFee(cartTotal) { … }` založí funkci jménem `shippingFee`,
- `cartTotal` v závorkách je vstup — při každém zavolání v něm je hodnota, se kterou funkci zavoláš,
- `return hodnota;` funkci **ukončí** a hodnotu vrátí; kód pod provedeným `return` se už neprovede,
- `shippingFee(1250)` funkci zavolá a na místě volání je vrácená hodnota.

:::live js
```js
function shippingFee(cartTotal) {
  if (cartTotal <= 0) {
    return 0;
  }
  if (cartTotal >= 1500) {
    return 0;
  }
  return 89;
}

console.log(shippingFee(1250));
console.log(shippingFee(2000));
console.log(`K úhradě: ${1250 + shippingFee(1250)} Kč`);
```
:::

Zkus přidat `console.log(shippingFee(0));` a pak volání s `1500`.

Všimni si první podmínky: nesmyslný vstup vyřídí hned na začátku a zbytek funkce už řeší jen platný košík. Takové brzké `return` se jmenuje *guard clause* a díky němu nemusíš psát `else` za `else`. Funkce, která `return` nemá, vrací `undefined`.

:::check
Co vrátí `shippingFee(1500)` z ukázky výše?

### --expected--

0

### --why--

První podmínka `1500 <= 0` neplatí, druhá `1500 >= 1500` ano, takže `return 0` funkci ukončí a vrátí `0`. K řádku `return 89` se nedojde.

### --see--

js-zaklady/porovnani-a-logika#rozhodnuti-zabalene-do-funkce
:::

## Typické chyby a pasti

### `=` místo `===` v podmínce

:::live js predict
```js
let orderStatus = 'new';

if (orderStatus = 'paid') {
  console.log('Odesíláme zboží, stav:', orderStatus);
} else {
  console.log('Čekáme na platbu');
}
```
--question-- Objednávka ještě není zaplacená. Co vypíše tenhle kód?
--expected-- Odesíláme zboží, stav: paid
--why-- Jedno `=` je přiřazení, ne porovnání. Podmínka do `orderStatus` uloží `'paid'` a výsledkem přiřazení je právě `'paid'` — neprázdný text, tedy truthy. Program zboží „odešle" a navíc přepíše stav objednávky. Oprava: `orderStatus === 'paid'`.
:::

> [!PITFALL]
> **`if (x = 5)` je přiřazení, ne otázka.** Příznak: podmínka platí vždycky (nebo nikdy, když přiřazuješ falsy hodnotu) a proměnná má po `if` jinou hodnotu než předtím. Program nic nenahlásí. Oprava: v podmínkách piš `===`.

### Porovnání textu s číslem

:::live js predict
```js
const ticketsLeft = '10';

console.log(ticketsLeft < '9', ticketsLeft === 10);
```
--question-- Údaj z formuláře zůstal textem. Co vypíše `console.log`? Napiš dvě hodnoty oddělené mezerou.
--expected-- true false
--why-- Dva texty se porovnávají znak po znaku jako ve slovníku: `'1'` je před `'9'`, takže `'10' < '9'` platí. A `===` mezi textem a číslem je vždy `false`. Oprava: převést hodnotu na číslo hned při načtení, `Number(ticketsLeft)`.
:::

Zkus v ukázce přepsat `'9'` na číslo `9`. Když je jen **jedna** strana `<` nebo `>` číslo, JavaScript text potichu převede na číslo a `'10' < 9` vyjde správně `false`. Na tuhle náhodu ale nespoléhej — stačí, aby číslo přišlo jako text i z druhé strany.

> [!PITFALL]
> **Text z formuláře porovnaný s číslem dává nesmyslné výsledky.** Příznak: `'10' < '9'` je `true`, `'5' === 5` je `false` a podmínka „nikdy neplatí" nebo platí jen u některých čísel. Oprava: `Number()` hned u vstupu a teprve pak porovnávat.

### Hranice: `>` místo `>=`

> [!PITFALL]
> **Hodnota přesně na hranici spadne do špatné větve.** Příznak: vše funguje, jen košík za přesně 1 500 Kč nedostane dopravu zdarma, student s přesně 90 body dostane horší známku. Příčina: `>` místo `>=` (nebo `<` místo `<=`). Oprava: přečti zadání („od 1 500 Kč" = `>=`) a hraniční hodnotu vždycky vyzkoušej.

### `||` smaže platnou nulu

> [!PITFALL]
> **`value || výchozí` nahradí i `0`, `''` a `false`.** Příznak: zákazník nastaví nulu (počet, slevu, spropitné) a program použije výchozí hodnotu. Oprava: `value ?? výchozí`.

### Zapomenutý `break`

> [!PITFALL]
> **Bez `break` propadne `switch` do dalšího `case`.** Příznak: vypíše se nebo nastaví víc věcí najednou a poslední přepíše tu správnou. Oprava: `break` za každou větev; záměrné propadání (víc `case` pod sebou) nech jen bez příkazů mezi nimi.

:::check
E-shop slibuje dopravu zdarma „od 1 500 Kč". V kódu je podmínka `if (cartTotal > 1500)`. Při jaké nejmenší celé částce v korunách dostane zákazník dopravu zdarma?

### --expected--

1501

### --why--

`>` hranici nepustí: `1500 > 1500` je `false`, takže zákazník s nákupem přesně za 1 500 Kč dopravu zaplatí, i když mu ji e-shop slíbil. „Od 1 500 Kč" znamená `cartTotal >= 1500`.

### --see--

js-zaklady/porovnani-a-logika#hranice-misto
:::

## Kde to najdeš v MDN

- [Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness) — přesná pravidla `==` a `===` a tabulka výsledků pro různé typy.
- [Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) — úplný seznam hodnot, které se v podmínce chovají jako nepravda.
- [Nullish coalescing operator (??)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) — rozdíl proti `||` s příklady.
- [switch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch) — propadání mezi `case` a kam patří `default`.

Dál: ve workshopu Hodnocení studentů z bodů spočítáš známku, slovní hodnocení a upozornění — a přesně na hranicích bodů zjistíš, jestli máš `>=`, nebo `>`.

# --questions--

## --question--

Co vypíše tenhle kód? Každý výpis na vlastní řádek.

```js
const points = 0;
const nickname = '';

console.log(points ?? 'bez bodů');
console.log(nickname || 'Host');
console.log(points || nickname || 'nic');
```

### --expected--

```text
0
Host
nic
```

### --why--

`??` nahradí jen `null` a `undefined`, takže nula zůstane. `||` nahradí prázdný text. Ve třetím řádku jsou `0` i `''` falsy, a tak `||` dojde až k poslední hodnotě `'nic'`.

### --see--

js-zaklady/porovnani-a-logika#vychozi-hodnota-misto

## --question--

Kolega chce dát slevu 10 % zákazníkům, kteří nakoupili za víc než 2 000 Kč **a zároveň** mají věrnostní kartu. Napiš podmínku do `if` s proměnnými `cartTotal` a `hasLoyaltyCard`.

### --expected--

cartTotal > 2000 && hasLoyaltyCard

### --accept--

hasLoyaltyCard && cartTotal > 2000
cartTotal > 2000 && hasLoyaltyCard === true
2000 < cartTotal && hasLoyaltyCard

### --why--

„A zároveň" je `&&`. „Víc než 2 000" je ostré `>`; od 2 000 včetně by bylo `>=`.

### --see--

js-zaklady/porovnani-a-logika#skladani-podminek-a

## --question--

Co vrátí `ticketLabel(15)`?

```js
function ticketLabel(age) {
  if (age < 6) {
    return 'zdarma';
  }
  if (age < 18) {
    return 'dětská';
  }
  return 'plná';
}
```

### --expected--

dětská

### --accept--

'dětská'

### --why--

`15 < 6` neplatí, `15 < 18` ano, a tak `return 'dětská'` funkci ukončí. Poslední `return` se neprovede.

### --see--

js-zaklady/porovnani-a-logika#rozhodnuti-zabalene-do-funkce

## --question--

Proč se v moderním kódu píše `===` místo `==`, i když obojí „funguje"?

### --answer--

`===` je novější, a proto rychlejší.

#### --why--

Rychlost tu nerozhoduje. Co `==` dělá s hodnotami před porovnáním?

### --correct--

`==` před porovnáním potichu převádí typy, takže platí i porovnání jako `'' == 0`.

#### --why--

Tichý převod skryje, že porovnáváš text s číslem. `===` porovná i typ a nečekaný výsledek nevznikne.

### --answer--

`==` funguje jen s čísly, `===` i s textem.

#### --why--

`==` porovná text i čísla — a právě mezi nimi převádí. Proč je to problém?

### --see--

js-zaklady/porovnani-a-logika#prisna-rovnost-a-volna
