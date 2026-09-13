# Metody pole do hloubky

Ve workshopu jsi napsal přes dvacet funkcí a skoro každá měla jeden řádek. Tahle lekce vysvětluje, **proč** to funguje — co se děje uvnitř `map` nebo `reduce`, jak číst dlouhé řetězení metod a kdy je lepší vrátit se k obyčejnému cyklu. A hlavně ukáže chyby, na kterých se u metod pole padá nejčastěji.

Porovnej dva zápisy téže věci:

```js
const result = [];
for (let i = 0; i < orders.length; i++) {
  if (orders[i].paid) {
    result.push(orders[i].total);
  }
}
```

```js
const result = orders.filter((order) => order.paid).map((order) => order.total);
```

U prvního musíš přečíst celé tělo cyklu, abys zjistil, co dělá. U druhého to říkají jména metod: vyber zaplacené, z každé vezmi částku.

## Callback: funkce, kterou volá někdo jiný

Všechny metody z workshopu dostávají **funkci jako argument**. Takové funkci se říká *callback* — ty ji napíšeš, ale **zavolá ji metoda**, kolikrát a s jakými argumenty uzná za vhodné.

Callback dostane tři argumenty: položku, její index a celé pole. Většinou potřebuješ jen první, ale ostatní tam jsou vždycky:

:::live js
```js
const letters = ['a', 'b', 'c'];

letters.map((letter, index, array) => {
  console.log(`volání č. ${index + 1}: položka ${letter}, pole má ${array.length} položky`);
  return letter.toUpperCase();
});
```
:::

Zkus místo `map` napsat `filter` nebo `some` a sleduj, kolikrát se callback zavolá. U `some` se zavolá jen jednou: callback vrací `'A'`, což je pravdivá hodnota, a odpověď „aspoň jedna vyhovuje" je tím jasná. Zkus pak, ať callback vrací `letter === 'c'`, a zavolá se třikrát.

Callback nemusí být šipková funkce napsaná na místě. Může to být jakákoli funkce, klidně pojmenovaná:

:::live js
```js
function isAdult(person) {
  return person.age >= 18;
}

const people = [{ name: 'Eva', age: 34 }, { name: 'Tom', age: 12 }];

console.log(people.filter(isAdult));   // bez závorek — předáváš funkci, nevoláš ji
```
:::

Pozor na rozdíl: `filter(isAdult)` předá funkci. `filter(isAdult())` by ji zavolal hned, bez argumentu, a předal výsledek — tedy chybu.

## Co která metoda vrací

Tohle je tabulka, kterou se vyplatí umět nazpaměť. Když víš, **co metoda vrací**, víš, co s výsledkem můžeš dělat dál.

| metoda | callback vrací | metoda vrací |
|---|---|---|
| `map` | novou položku | nové pole **stejné délky** |
| `filter` | `true` / `false` | nové pole, **stejně dlouhé nebo kratší**, s původními položkami |
| `find` | `true` / `false` | **první** vyhovující položku, nebo `undefined` |
| `findIndex` | `true` / `false` | její index, nebo `-1` |
| `some` / `every` | `true` / `false` | `true` / `false` |
| `reduce` | novou hodnotu akumulátoru | **poslední** hodnotu akumulátoru (cokoli) |
| `toSorted` | záporné číslo / 0 / kladné číslo | nové seřazené pole |
| `forEach` | nic | **`undefined`** |

`forEach` je jediná, která nic nevrací. Je to „cyklus zapsaný jako metoda" — hodí se, když s každou položkou chceš něco **udělat** (vypsat, poslat), ne něco **vyrobit**.

Callback u `filter`, `find`, `some` a `every` nemusí vracet přesně `true` nebo `false`. Stačí pravdivá nebo nepravdivá hodnota: `filter((item) => item.note)` propustí položky s neprázdnou poznámkou.

## Jak pracuje reduce

`reduce` je nejobecnější z metod — `map`, `filter` i `some` jde napsat přes něj. Proto je taky nejhůř čitelný. Když si nevíš rady, vypiš si akumulátor v každém kroku:

:::live js
```js
const expenses = [120, 45, 300];

const total = expenses.reduce((sum, amount) => {
  console.log(`sum = ${sum}, amount = ${amount}, vracím ${sum + amount}`);
  return sum + amount;
}, 0);

console.log('výsledek:', total);
```
:::

Zkus změnit počáteční hodnotu `0` na `1000` a sleduj první řádek výpisu. Pak ji úplně smaž (i s čárkou) — první volání dostane jako `sum` rovnou `120` a callback se zavolá o jednou méně.

Akumulátor je po celou dobu toho typu, jakým začal. Počáteční `0` dá číslo, `''` text, `{}` objekt, `[]` pole.

## Řetězení

Když metoda vrací pole, můžeš na výsledek hned zavolat další metodu. Tak vznikají řetězy:

:::live js
```js
const orders = [
  { customer: 'Eva', total: 450, paid: true },
  { customer: 'Tom', total: 1200, paid: false },
  { customer: 'Jana', total: 980, paid: true },
  { customer: 'Petr', total: 120, paid: true },
];

const bigPaidCustomers = orders
  .filter((order) => order.paid)
  .filter((order) => order.total > 400)
  .toSorted((a, b) => b.total - a.total)
  .map((order) => order.customer);

console.log(bigPaidCustomers);
```
:::

Zkus přesunout `.map(…)` před `.filter(…)` a podívej se, co se rozbije. Po `map` už v poli nejsou objekty objednávek, jen jména — a jména nemají `paid`.

Pravidla pro čitelné řetězy:

- **Každou metodu na vlastní řádek.** Řetěz se pak čte shora dolů jako postup.
- **Nejdřív zužuj, pak přetvářej.** `filter` napřed zmenší pole, se kterým pracují další kroky, a ty pořád mají po ruce celé objekty.
- **Pojmenuj mezivýsledek**, když je řetěz delší než tři čtyři kroky nebo když jeho část znamená něco v řeči zadání: `const paidOrders = orders.filter(…)`.
- `reduce` dávej na **konec** řetězu — vrací většinou jednu hodnotu, ne pole.

## Kdy metody a kdy for…of

Metody nejsou vždycky lepší. Obyčejný `for…of` vyhraje, když:

- **potřebuješ skončit dřív** podle složitější podmínky — `for…of` umí `break` a `continue`, `forEach` ani `map` ne,
- **potřebuješ v jednom průchodu víc výsledků** najednou (třeba minimum, maximum a součet) a `reduce` s objektem by byl nečitelný,
- **uvnitř čekáš na asynchronní operace postupně** (viz past níže).

Metody vyhrají, když **přetváříš data** — z pole děláš jiné pole nebo jednu hodnotu. Jméno metody pak slouží jako dokumentace.

A výkon? Řetěz `filter → map → reduce` projde pole třikrát, cyklus jednou. U stovek nebo tisíců položek je rozdíl v mikrosekundách a nepoznáš ho. Piš čitelně; optimalizuj, až když měřením zjistíš, že je to opravdu úzké hrdlo — typicky u statisíců položek v jedné smyčce vykreslování.

## Časté chyby

### Zapomenutý return ve složených závorkách

Šipková funkce bez složených závorek vrací výraz automaticky. Se složenými závorkami je to tělo funkce a bez `return` vrací `undefined`:

:::live js
```js
const prices = [100, 250];

const withVat = prices.map((price) => { price * 1.21 });
console.log(withVat);        // [undefined, undefined]

const fixed = prices.map((price) => price * 1.21);
console.log(fixed);

const labels = prices.map((price) => ({ price, label: `${price} Kč` }));
console.log(labels);         // objekt musí být v kulatých závorkách
```
:::

Zkus u `labels` smazat kulaté závorky kolem objektu. Kód se ani nespustí, protože `{ price, label: … }` se čte jako tělo funkce a to nedává smysl.

U `filter` je stejná chyba ještě zákeřnější: callback vracející `undefined` je nepravda, takže výsledkem je tiše **prázdné pole**.

### reduce bez počáteční hodnoty

:::live js
```js
const cart = [{ price: 100 }, { price: 250 }];

// bez počáteční hodnoty je první akumulátor celý objekt { price: 100 }
const wrong = cart.reduce((sum, item) => sum + item.price);
console.log(wrong);          // [object Object]250

const right = cart.reduce((sum, item) => sum + item.price, 0);
console.log(right);          // 350

try {
  [].reduce((sum, item) => sum + item.price);
} catch (error) {
  console.log('Chyba:', error.message);
}
```
:::

Bez počáteční hodnoty vezme `reduce` jako akumulátor první položku. U pole čísel to náhodou funguje, u pole objektů vznikne nesmysl a u prázdného pole to spadne. Počáteční hodnotu proto piš **vždycky**.

### forEach s async funkcí

K asynchronnímu kódu se dostaneme v samostatné sekci. Teď stačí vědět, že `await` čeká na dokončení operace, která chvíli trvá (třeba stažení dat ze sítě), a funkce označená `async` vrací slib, že výsledek teprve bude.

`forEach` na tyhle sliby **nečeká**. Zavolá callback pro všechny položky a hned skončí:

:::live js
```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function saveAll(names) {
  names.forEach(async (name) => {
    await wait(100);
    console.log('uloženo:', name);
  });
  console.log('forEach: hotovo?');   // vypíše se jako první

  for (const name of names) {
    await wait(100);
    console.log('for…of uložilo:', name);
  }
  console.log('for…of: hotovo');     // vypíše se opravdu až na konci
}

saveAll(['Eva', 'Tom']);
```
:::

Když potřebuješ, aby se na položky počkalo, použij `for…of` s `await` (postupně, jednu po druhé). Jak spustit všechny najednou a počkat na výsledek, uvidíš v sekci o asynchronním kódu.

### map místo forEach (a naopak)

`map`, jehož výsledek nikdo nepoužije, je `forEach` v přestrojení — čtenář čeká nové pole a žádné nepřijde. A `forEach`, ve kterém plníš pole přes `push`, je `map` napsaný složitě. Vyber metodu podle toho, co chceš **vrátit**.

### Předání funkce, která bere víc argumentů

:::live js
```js
console.log(['1', '2', '3'].map(parseInt));            // [1, NaN, NaN]
console.log(['1', '2', '3'].map((text) => parseInt(text, 10)));
```
:::

`map` volá callback se třemi argumenty (položka, index, pole) a `parseInt` bere druhý argument jako číselnou soustavu. `parseInt('2', 1)` je `NaN`. Když předáváš hotovou funkci, ověř si, co dělá s dalšími argumenty — nebo ji obal do šipkové funkce.

# --questions--

## --question--

Co vrátí tento kód?

```js
[3, 8, 12].filter((n) => { n > 5 });
```

### --answer--

`[8, 12]`

#### --why--

Tak by to dopadlo bez složených závorek. Se složenými závorkami je `n > 5` jen příkaz v těle funkce a callback vrací `undefined`.

### --correct--

`[]`

#### --why--

Callback nic nevrací, takže vrací `undefined`, a to je nepravda. Žádná položka neprojde.

### --answer--

`[undefined, undefined, undefined]`

#### --why--

Tohle by vrátil `map`. `filter` položky nepřetváří, jen je propouští — a `undefined` nepropustí nic.

## --question--

Máš pole objednávek a chceš **jména zákazníků** zaplacených objednávek. Který řetěz funguje?

### --correct--

`orders.filter((o) => o.paid).map((o) => o.customer)`

#### --why--

`filter` vybere zaplacené objednávky (celé objekty), `map` z nich pak vytáhne jména.

### --answer--

`orders.map((o) => o.customer).filter((o) => o.paid)`

#### --why--

Po `map` jsou v poli jen texty se jmény. Text nemá vlastnost `paid`, takže `filter` nepropustí nic.

### --answer--

`orders.forEach((o) => o.customer).filter((o) => o.paid)`

#### --why--

`forEach` vrací `undefined` a na `undefined` nejde zavolat `filter` — kód spadne.

## --question--

Proč se u `reduce` doporučuje vždycky psát počáteční hodnotu?

### --answer--

Bez ní `reduce` projde pole pozpátku.

#### --why--

Směr průchodu počáteční hodnota neovlivňuje. `reduce` jde vždycky od začátku (pozpátku jde `reduceRight`).

### --correct--

Bez ní se jako první akumulátor použije první položka pole — u pole objektů vznikne nesmysl a nad prázdným polem `reduce` vyhodí chybu.

#### --why--

Přesně tak. S počáteční hodnotou je typ akumulátoru jasný od začátku a prázdné pole vrátí právě ji.

### --answer--

Bez ní vrací `reduce` pole místo jedné hodnoty.

#### --why--

`reduce` vrací to, co vrátí poslední volání callbacku. Počáteční hodnota jen určuje, čím akumulátor začne.

## --question--

Kdy je lepší napsat `for…of` než řetěz metod?

### --answer--

Vždycky, když má pole víc než sto položek, protože metody jsou pomalé.

#### --why--

U stovek i tisíců položek je rozdíl neměřitelný. Výkon je důvod až u opravdu velkých dat a po změření.

### --correct--

Když uvnitř postupně čekáš přes `await` nebo potřebuješ průchod ukončit dřív přes `break`.

#### --why--

`forEach` na `await` nečeká a metody pole neumí `break`. Na tohle je `for…of` správný nástroj.

### --answer--

Když z pole vyrábíš nové pole se stejným počtem položek.

#### --why--

To je přesně práce pro `map` — jméno metody hned řekne, co se děje.
