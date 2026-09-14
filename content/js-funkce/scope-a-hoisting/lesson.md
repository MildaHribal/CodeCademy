# Scope a hoisting

Co přesně se stane, když se v JavaScriptu pokusíš použít proměnnou, kterou jsi ještě nedeklaroval? Proč někdy dostaneš `undefined`, někdy program spadne s chybou a proč je `var` ve smyčce problém?

> [!REMEMBER]
> **Scope (rozsah platnosti) určuje, kde v kódu je daná proměnná vidět.** JavaScript proměnné vyhledává od aktuálního bloku směrem ven, dokud nenajde shodu.

:::check pretest
Jakou hodnotu vypíše druhý `console.log`?

```js
let a = 1;

function test() {
  let a = 2;
  console.log(a);
}

test();
console.log(a);
```

### --expected--
1
### --accept--
'1'
:::

## Globální, funkční a blokový scope

Když definuješ proměnnou úplně mimo všechny funkce a bloky, je **globální**. Vidí ji celý program.
Proměnné definované uvnitř funkce (pomocí `let`, `const` nebo `var`) mají **funkční scope**. Jsou vidět jen uvnitř té funkce, zvenku se k nim nedostaneš.
Proměnné deklarované pomocí `let` a `const` uvnitř bloku `{ ... }` (například v `if` nebo `for`) mají **blokový scope**. Existují jen uvnitř těch složených závorek.

:::check
Jaká hodnota se vypíše v posledním řádku kódu?

```js
function ukazka() {
  if (true) {
    let pocet = 5;
  }
  console.log(pocet);
}
ukazka();
```

### --expected--
ReferenceError
### --accept--
ReferenceError: pocet is not defined
chyba
:::

## Stínění (Shadowing)

Když máš ve vnitřním bloku nebo funkci proměnnou se stejným jménem jako ve vnějším, ta vnitřní **zastíní** (*shadows*) tu vnější. Vnější hodnota se nepřepíše, jen na ni z vnitřku nedosáhneš, protože JavaScript najde tu vnitřní jako první.

:::live js predict
```js
const jmeno = 'Pavel';

function pozdrav(jmeno) {
  console.log(jmeno);
}

pozdrav('Karel');
```
--question-- Co vypíše tento kód?
--expected-- Karel
--why-- Parametr `jmeno` vytvoří novou lokální proměnnou pro funkci `pozdrav`, která zastíní tu globální s hodnotou 'Pavel'.
:::

## Hoisting a Temporal Dead Zone (TDZ)

Před spuštěním kódu si JavaScript načte všechny deklarace (funkcí a proměnných) a pomyslně je "vytáhne" nahoru ve svém scope. Tomuto přesunu se říká **hoisting**.

- **Deklarace funkcí** (přes `function()`) se hoistují celé, takže je můžeš zavolat dřív, než je v kódu zapíšeš.
- **Proměnné přes `var`** se hoistují s hodnotou `undefined`.
- **Proměnné přes `let` a `const`** se sice hoistují, ale do takzvané **Temporal Dead Zone (TDZ)**. Tam zůstanou od začátku bloku až do řádku, kde je inicializuješ. 

> [!PITFALL]
> ReferenceError: Cannot access 'x' before initialization
> Pokusil ses použít `let` nebo `const` proměnnou v její Temporal Dead Zone.
> Oprava: Přesuň deklaraci proměnné v kódu před její první použití.

:::live js predict
```js
try {
  console.log(vek);
  let vek = 20;
} catch (e) {
  console.log(e.name);
}
```
--question-- Co vypíše tento kód?
--expected-- ReferenceError
--why-- Proměnná `vek` byla přes `let` hoistována, ale je v Temporal Dead Zone, dokud se kód nedostane k její deklaraci.
:::

:::live js predict
```js
let x = 10;
try {
  if (true) {
    console.log(x);
    let x = 20;
  }
} catch (e) {
  console.log(e.name);
}
```
--question-- Co udělá tento kód?
--expected-- ReferenceError
--why-- Vnitřní blok má vlastní `x` (díky `let`), které se hoistuje na jeho začátek a vytvoří tak TDZ, jež platí i v době provádění `console.log(x)`. Ta globální se zablokuje.
:::

## `var` ve smyčce

Zatímco `let` respektuje blokový scope smyčky `for` a vytvoří pro každou obrátku novou proměnnou, klíčové slovo `var` nemá blokový scope. Vytvoří jedinou proměnnou platnou pro celou funkci, která se postupně přepisuje. To vede k chybám, když se provádí zpožděný asynchronní kód (např. pomocí `setTimeout`).

:::check
Co vypíše tento cyklus?

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 10);
}
```
### --expected--
0
1
2
:::

## Lexikální scope a stopování paměti

**Lexikální scope** znamená, že rozsah platnosti určuje to, jak jsi kód **napsal**, ne jak byl spuštěn. Funkce má vždy přístup k proměnným, které byly viditelné v místě, kde jsi funkci *definoval* (a ne tam, odkud jsi ji zavolal).

Pojďme se podívat na zásobník volání a rozsahy:

:::memory
```js
let x = 10;
function vnejsi() {
  let y = 20;
  function vnitrni() {
    let z = 30;
    console.log(x, y, z);
  }
  vnitrni();
}
vnejsi();
```
--step-- 5 | scope ve vnitrni
z = 30
y = 20
x = 10
:::

:::explain
Vysvětli vlastními slovy, co znamená pojem "lexikální scope" a podle čeho JavaScript hledá proměnnou, když ji nemůže najít v aktuální funkci.

## --model--
Lexikální scope znamená, že rozsah platnosti proměnné je určen místem v kódu, kde je proměnná napsaná. Pokud proměnná není k nalezení uvnitř aktuální funkce, JavaScript ji vyhledává o úroveň výš – ve vnějším bloku nebo funkci, ve které byla aktuální funkce definována, a postupuje tak až k The globálnímu scope.
## --checklist--
- Platnost proměnných je dána tím, jak je kód fyzicky zapsán
- Funkce si pamatuje scope tam, kde byla definována
- Vyhledávání probíhá směrem zevnitř ven (k vnějším blokům a funkcím)
:::

## Kde to najdeš v MDN

- [Scope](https://developer.mozilla.org/en-US/docs/Glossary/Scope) - Úvod do rozsahů platnosti.
- [Hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting) - Co znamená, že jsou deklarace vytaženy na začátek.
- [let a TDZ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz) - Chování Temporal Dead Zone v detailu.

# --questions--

## --question--
Proč při přístupu k nadeklarované proměnné přes `let` dostaneš chybu `ReferenceError`, zatímco u `var` se vrátí `undefined`?

### --expected--
let má Temporal Dead Zone
### --accept--
var se hoistuje s hodnotou undefined, let ne
protože let zůstává v TDZ
### --why--
Zatímco `var` proměnnou rovnou hoistuje i s její počáteční prázdnou hodnotou `undefined`, `let` ji zanechává chráněnou v Temporal Dead Zone a její čtení vyvolá okamžitou chybu, což tě nutí psát čistší kód.

## --question--
Co by v JavaScriptu dělalo lexikální scope? Kde bude hledat proměnnou, která není v její vlastní funkci?

### --expected--
tam, kde byla definována
### --accept--
ve vnější funkci, kde byla zapsána
ve vnějším bloku
### --why--
Funkce JavaScriptu si vždy pamatují místo, ve kterém byly definovány, takže vyhledávání proměnné neovlivní to, jestli ji nakonec zavoláš úplně někde jinde.

