# Proměnné a typy

:::check pretest
Když do proměnné nepotřebuješ později přiřazovat novou hodnotu, jaké klíčové slovo bys měl k jejímu založení použít?

### --expected--

const

### --why--

`const` dává jasně najevo tobě i všem ostatním, že tahle hodnota už se nebude měnit. Je to bezpečnější a čistší. Probereme si to hned na začátku.
:::

Programy pořád přesouvají nějaká data — jména uživatelů, ceny, počty lajků. Abys k těm datům měl přístup a mohl s nimi počítat, ukládáš je do proměnných. Proměnná je prostě pojmenovaná krabička na jednu hodnotu.

## `const` vs. `let` (a proč ne `var`)

Když zakládáš novou proměnnou, musíš vybrat, jaké klíčové slovo před ni napíšeš. Dnes se používají jen dvě: `const` a `let`.

:::live js
```js
const age = 30;
let balance = 1500;

console.log('Věk:', age);
console.log('Zůstatek:', balance);

balance = balance - 500;
console.log('Nový zůstatek:', balance);
```
:::

- **`const`** znamená konstanta. Hodnotu nastavíš jednou při založení a už ji **nikdy nezměníš**.
- **`let`** je klasická proměnná. Kdykoli do ní můžeš **přiřadit novou hodnotu** (rovnítkem).

Zkus v ukázce nahoře napsat `age = 31;` a podívej se na chybu. `TypeError: Assignment to constant variable` tě praští přes prsty.

> [!REMEMBER]
> **Vždy používej `const`, dokud nemusíš použít `let`.** Když kód čte někdo jiný, `const` mu říká: "Tohle se nezmění, nemusíš si pamatovat stavy." Zjednodušuje to myšlení. `let` si šetři jen pro počítadla a věci, které se v čase mění.

A co `var`? To je starý způsob ze začátků JavaScriptu. Má podivná pravidla pro dosah (scope), nehlídá konstanty a často se chová nepředvídatelně. Od roku 2015 máme `const` a `let`, takže `var` ve svém kódu nikdy nepoužívej. Uvidíš ho jen ve starých projektech.

:::check
Jaké slovo bys použil pro proměnnou, do které si uložíš počet pokusů uživatele o přihlášení a po každém špatném heslu ji zvětšíš o 1?

### --expected--

let

### --why--

Hodnota se bude měnit (zvyšovat), takže musíš použít `let`. Kdybys použil `const`, hned při prvním přičtení by program spadl.
:::

## Názvy proměnných

Názvy proměnných v JavaScriptu se píší ve stylu **camelCase** — první slovo malým, každé další slovo začíná velkým písmenem, bez mezer.

:::live js
```js
const firstName = 'Anna';
const maxLoginAttempts = 3;
const isLoggedIn = true;
```
:::

Pojmenovat proměnnou správně je jedna z nejtěžších věcí v programování. Proměnná by měla říkat **co** obsahuje, ne jak je to uložené. Názvy jako `a`, `x` nebo `data` ti za týden nic neřeknou. Pojmenuj proměnnou anglicky, ať máš kód konzistentní s funkcemi JavaScriptu: místo `vyskaZdi` použij `wallHeight`.

> [!PITFALL]
> **Nečeské názvy:** Uč se psát proměnné anglicky už od začátku. `userName` a `totalPrice` jsou jasné. Názvy jako `uzivatel` nebo dokonce `uzivName` (czenglish) jsou špatná praxe. Česky piš jen texty, které uvidí uživatel ve stránce.

:::check
Který název proměnné je v JavaScriptu podle běžných konvencí pro maximální povolený věk?

### --answer--

max_age

#### --why--

Tohle je tzv. snake_case. V JavaScriptu se nepoužívá, patří třeba do Pythonu.

### --correct--

maxAge

### --answer--

MaxAge

#### --why--

První písmeno by mělo být malé. S velkým písmenem na začátku se pojmenovávají třídy (tzv. PascalCase).
:::

## Primitivní typy a objekty

Každá hodnota v JavaScriptu má svůj **typ**. Ten určuje, co s ní můžeš dělat. Můžeš sčítat čísla, ale ne obrázky.

JavaScript má 7 tzv. **primitivních typů**:
1. `string` — text v uvozovkách (`'Ahoj'`, `"Svět"`, `` `Cena` ``).
2. `number` — čísla, i desetinná (`42`, `3.14`).
3. `boolean` — pravda/nepravda (`true`, `false`).
4. `undefined` — hodnota není definována.
5. `null` — hodnota záměrně chybí (nic).
6. `symbol` — unikátní identifikátory (v praxi vzácné).
7. `bigint` — pro obrovská čísla.

Všechno ostatní, co není primitivní typ, je **objekt**. To jsou pole, funkce, datumy i klasické `{ klic: hodnota }` objekty. Primitivní hodnoty jsou jednoduché a neměnné, objekty jsou složité a plné referencí (to si vysvětlíme v lekci o poli).

:::live js
```js
console.log(typeof 'Karel');
console.log(typeof 100);
console.log(typeof true);
console.log(typeof undefined);
```
:::

Zkus v ukázce změnit `100` na `100.5`. Co se vypíše? JavaScript nerozlišuje mezi celými a desetinnými čísly, všechno je prostě `number`.

Operátor `typeof` ti řekne typ hodnoty. Ale má jednu slavnou chybu z roku 1995:

:::live js predict
```js
console.log(typeof null);
```
--question-- Jaký typ podle tebe JavaScript vypíše pro `null`?
--expected-- object
--why-- I když je `null` primitivní typ reprezentující prázdnotu, `typeof null` historicky vrací `'object'`. Byla to chyba v úplně první verzi JavaScriptu, kterou už nejde opravit, protože by to rozbilo staré weby. Musíš si to prostě pamatovat.
:::

:::check
Jaký typ má hodnota `false`? Napiš typ tak, jak ho vrací `typeof`.

### --expected--

boolean

### --why--

`true` a `false` jsou logické hodnoty, reprezentované typem boolean.
:::

## Rozdíl mezi `undefined` a `null`

Dva typy reprezentují nic, což je na začátku matoucí.

**`undefined`** je stav, kdy hodnota ještě neexistuje. Vrací ho JavaScript, když se ptáš na něco, co není. Třeba když založíš proměnnou, ale nedáš do ní hodnotu. Nebo když čteš z pole položku, která tam chybí.

**`null`** píšeš ty, jako programátor, abys jasně řekl: "Tady záměrně nic není". Třeba proměnná pro vybranou barvu je `null`, dokud na nějakou uživatel neklikne.

```js
let username;
console.log(username); // undefined, ještě jsem nic nepřiřadil

const activeUser = null; // Záměrně říkám: nikdo není přihlášený
```

:::check
Když zkusíš přečíst vlastnost, která na objektu neexistuje (třeba `product.color` u chleba), co ti JavaScript vrátí?

### --expected--

undefined

### --accept--

'undefined'

### --why--

Když něco neexistuje a jazyk neví co s tím, vrátí `undefined`. `null` se objevuje jen tam, kam ho někdo úmyslně napsal (třeba kód nějaké knihovny, která jím signalizuje chybějící data).
:::

## Kde to najdeš v MDN

- [const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) — o tom, jak `const` zamyká jen samotnou proměnnou, ne její obsah.
- [Data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures) — kompletní seznam datových typů.
- [typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) — co operátor `typeof` vrací a zmínka o chybě u `null`.

# --questions--

## --question--

Který z těhle zápisů založení proměnné je podle pravidel nejčistší a nejbezpečnější pro uložení názvu e-shopu?

### --answer--

`let shopName = 'Alza';`

#### --why--

Bude fungovat, ale název e-shopu se těžko bude měnit, takže `let` naznačuje budoucí změnu, která nenastane.

### --correct--

`const shopName = 'Alza';`

### --answer--

`const shop_name = 'Alza';`

#### --why--

`const` je správně, ale název `shop_name` používá podtržítka, zatímco JavaScriptová konvence je `camelCase`.

### --answer--

`var shopName = 'Alza';`

#### --why--

`var` by se v moderním kódu vůbec nemělo objevit.

### --see--

js-zaklady/promenne-a-typy#const-vs-let-a-proc-ne-var

## --question--

Co vypíše `console.log(typeof '42');`?

### --expected--

string

### --accept--

'string'

### --why--

I když je uvnitř uvozovek číslo, samotné uvozovky z něj dělají textový řetězec.

### --see--

js-zaklady/promenne-a-typy#primitivni-typy-a-objekty
