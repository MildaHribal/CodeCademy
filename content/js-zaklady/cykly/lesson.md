# Cykly

:::check pretest
Kolikrát se provede tělo tohohle cyklu? Napiš jen číslo.

```js
for (let day = 1; day < 5; day++) {
  console.log('Den', day);
}
```

### --expected--

4

### --why--

`day` začne na `1` a cyklus běží, dokud platí `day < 5`: pro `1`, `2`, `3` a `4`. Pětka už podmínku nesplní. Proč se na tomhle místě chybuje nejčastěji, uvidíš v části o počtu opakování.
:::

:::check pretest
Heslo je `'Ahoj1'`. Kolikrát proběhne cyklus `for (const char of password)`, když v `password` je tohle heslo?

### --answer--

Jednou, heslo je jedna hodnota.

#### --why--

Je to jedna hodnota, ale `for…of` ji rozloží. Na co? Uvidíš v části o `for…of`.

### --correct--

Pětkrát, jednou pro každý znak.

#### --why--

`for…of` prochází text znak po znaku. Víc v části o `for…of`.

### --answer--

Vůbec, `for…of` s textem nefunguje.

#### --why--

S textem funguje. Jak, vysvětlí část o `for…of`.
:::

Aplikace s půjčkou ukáže splátkový kalendář na dvanáct měsíců. Kontrola hesla projde každý znak a hledá číslici. Spořicí kalkulačka počítá, za kolik let naspoříš na auto. Psát dvanáct skoro stejných řádků nechceš — a u spoření ani nevíš, kolik jich bude. Program potřebuje umět **opakovat**.

> [!REMEMBER]
> **Cyklus opakuje blok, dokud platí podmínka. Tvoje práce je zařídit, aby jednou platit přestala.** Každý průchod tělem cyklu se jmenuje [[iterace]].

## Cyklus `for`

`for` se hodí, když víš, kolikrát opakovat, nebo počítáš od–do. V závorce má tři části oddělené středníky:

```js
for (let month = 1; month <= 3; month++) {
  console.log(`Splátka za ${month}. měsíc`);
}
```

1. `let month = 1` — **start**: proběhne jednou, před prvním průchodem.
2. `month <= 3` — **podmínka**: kontroluje se před každým průchodem. Když neplatí, cyklus skončí.
3. `month++` — **krok**: proběhne po každém průchodu. `month++` je zkratka za `month += 1`.

:::live js
```js
const loan = 12000;
const months = 4;
let paid = 0;

for (let month = 1; month <= months; month++) {
  paid += loan / months;
  console.log(`${month}. měsíc: splaceno ${paid} Kč`);
}

console.log('Hotovo, splaceno celkem', paid, 'Kč');
```
:::

Zkus změnit `months` na `6`. Pak změň `month++` na `month += 2` a sleduj, které měsíce se vypíšou.

Krokuj šipkami a sleduj, jak se hodnoty mění průchod po průchodu. Řádek 3 je tělo cyklu, řádek 2 jeho hlavička:

:::memory
```js
let paid = 0;
for (let month = 1; month <= 3; month++) {
  paid += 1000;
}
```
--step-- 1 | před cyklem
paid = 0
--step-- 2 | start: month = 1, podmínka 1 <= 3 platí
paid = 0
month = 1
--step-- 3 | první průchod tělem
paid = 1000
month = 1
--step-- 2 | krok month++, podmínka 2 <= 3 platí
paid = 1000
month = 2
--step-- 3 | druhý průchod
paid = 2000
month = 2
--step-- 2 | krok month++, podmínka 3 <= 3 platí
paid = 2000
month = 3
--step-- 3 | třetí průchod
paid = 3000
month = 3
--step-- 2 | krok month++, podmínka 4 <= 3 neplatí, cyklus končí
paid = 3000
:::

Všimni si posledního kroku: `month` se zvýší na `4`, podmínka neplatí a tělo se už neprovede. Proměnná `month` po cyklu neexistuje — `let` v hlavičce platí jen uvnitř cyklu. `paid` je deklarovaná **nad** cyklem, a proto si hodnotu drží mezi průchody i po nich.

:::check
Jakou hodnotu má `total` po skončení cyklu?

```js
let total = 0;
for (let i = 1; i <= 4; i++) {
  total += i;
}
```

### --expected--

10

### --why--

Tělo proběhne pro `i` = 1, 2, 3 a 4 a do `total` přičte každé z nich: `1 + 2 + 3 + 4 = 10`.

### --see--

js-zaklady/cykly#cyklus-for
:::

## Kolikrát cyklus proběhne

Nejčastější chyba v cyklech je o jedna: cyklus proběhne o jeden průchod víc, nebo míň, než měl. Říká se jí [[off-by-one]]. Vzniká na dvou místech — kde začínáš (`0` nebo `1`) a jestli je v podmínce `<` nebo `<=`.

| hlavička | hodnoty | průchodů |
|---|---|---|
| `for (let i = 0; i < 5; i++)` | 0, 1, 2, 3, 4 | 5 |
| `for (let i = 1; i <= 5; i++)` | 1, 2, 3, 4, 5 | 5 |
| `for (let i = 0; i <= 5; i++)` | 0, 1, 2, 3, 4, 5 | 6 |
| `for (let i = 1; i < 5; i++)` | 1, 2, 3, 4 | 4 |

:::live js predict
```js
let printed = 0;

for (let seat = 1; seat <= 10; seat += 3) {
  printed++;
}

console.log(printed);
```
--question-- Pokladna tiskne vstupenku na každé třetí místo v řadě. Co vypíše `console.log`?
--expected-- 4
--why-- `seat` jde po třech: 1, 4, 7, 10. Desítka ještě splní `seat <= 10`, další hodnota 13 už ne. Při kroku větším než 1 se průchody nepočítají „od–do", ale po skocích. Zkus změnit `<=` na `<` a spočítej znovu.
:::

Než cyklus spustíš, řekni si nahlas první a poslední hodnotu. Když potřebuješ přesný počet opakování `n`, nejbezpečnější vzor je `for (let i = 0; i < n; i++)` — začíná nulou a končí ostrým `<`.

:::check
Kolikrát proběhne `for (let i = 0; i <= 12; i++)`?

### --expected--

13

### --why--

Hodnoty jsou 0, 1, … 12 — to je dvanáct čísel od jedničky a k tomu nula. S `<=` a startem na nule je průchodů o jeden víc než horní hranice.

### --see--

js-zaklady/cykly#kolikrat-cyklus-probehne
:::

## `while` a `do…while`

Když dopředu nevíš, kolikrát opakovat, ale víš, **kdy přestat**, hodí se `while`. Má jen podmínku; start je před ním a krok musíš napsat do těla sám:

:::live js
```js
const goal = 250000;
let savings = 100000;
let years = 0;

while (savings < goal) {
  savings = savings * 1.2;
  years++;
}

console.log(`Na auto naspoříš za ${years} let.`);
```
:::

Zkus změnit úrok `1.2` na `1.05`. Cyklus proběhne víckrát, ale skončí sám, protože úspory rostou, až podmínku přestanou splňovat.

`do…while` je stejný cyklus s podmínkou na konci. Tělo proto proběhne **aspoň jednou**, i když podmínka neplatí od začátku:

```js
let attempt = 0;
do {
  attempt++;
  console.log('Pokus o připojení', attempt);
} while (attempt < 3);
```

Použiješ ho zřídka — typicky u „zkus a pak se rozhodni, jestli znovu".

:::check
Kolikrát se provede tělo, když podmínka neplatí hned na začátku?

```js
let stock = 0;
while (stock > 0) {
  stock--;
}
```

### --answer--

Jednou, pak se podmínka zkontroluje.

#### --why--

Tak by se choval `do…while`. Kdy kontroluje podmínku `while`?

### --correct--

Ani jednou.

#### --why--

`while` kontroluje podmínku před každým průchodem, i před prvním. `0 > 0` neplatí, a tak tělo nezačne.

### --answer--

Donekonečna, `stock` nikdy nebude kladné.

#### --why--

Nekonečný cyklus vznikne, když podmínka platí a nikdy platit nepřestane. Tady neplatí vůbec.

### --see--

js-zaklady/cykly#while-a-do-while
:::

## `for…of` prochází text znak po znaku

Když chceš projít všechny znaky textu, nepotřebuješ počítadlo. `for…of` do proměnné postupně dá každý znak:

:::live js
```js
const password = 'Leto2026!';
let digits = 0;

for (const char of password) {
  if (char >= '0' && char <= '9') {
    digits++;
  }
}

console.log(`Heslo má ${digits} číslice.`);
```
:::

Zkus změnit heslo a sleduj počet. Proměnná `char` je `const` — v každém průchodu vzniká nová, takže do ní nic nepřiřazuješ. Porovnání `char >= '0' && char <= '9'` využívá toho, že se texty porovnávají podle pořadí znaků.

Stejně `for…of` prochází i pole, ke kterým se dostaneš v sekci Pole. Počet znaků textu zjistíš přes `text.length`.

:::check
Co vypíše tenhle kód?

```js
let result = '';
for (const letter of 'kolo') {
  result = letter + result;
}
console.log(result);
```

### --expected--

olok

### --why--

Každý znak se přidá **před** dosavadní výsledek: `k`, `ok`, `lok`, `olok`. Text se tak otočí.

### --see--

js-zaklady/cykly#for-of-prochazi-text-znak-po-znaku
:::

## `break` a `continue`

Dvě slova mění průběh cyklu:

- `break` cyklus **ukončí** hned. Hodí se, když už máš, co jsi hledal.
- `continue` přeskočí **zbytek tohohle průchodu** a pokračuje dalším.

:::live js
```js
const code = 'CZ-4471-AB';

for (const char of code) {
  if (char === '-') {
    continue;
  }
  if (char === 'A') {
    console.log('Našel jsem A, dál nehledám.');
    break;
  }
  console.log('Kontroluji', char);
}
```
:::

Zkus prohodit `continue` a `break` a sleduj, kde cyklus skončí.

:::check
Co vypíše tenhle kód? Napiš čísla oddělená mezerou.

```js
let output = '';
for (let i = 1; i <= 6; i++) {
  if (i % 2 === 0) {
    continue;
  }
  if (i === 5) {
    break;
  }
  output += i + ' ';
}
console.log(output);
```

### --expected--

1 3

### --why--

Sudá čísla (`i % 2 === 0`) `continue` přeskočí, takže se zapíšou `1` a `3`. U `5` zastaví cyklus `break` dřív, než se číslo zapíše.

### --see--

js-zaklady/cykly#break-a-continue
:::

## Nekonečná smyčka

Když podmínka nikdy nepřestane platit, cyklus běží navždy — vznikne [[nekonečná smyčka]]. Ve skutečném prohlížeči karta zamrzne a nereaguje, dokud ji nezavřeš. Tři nejčastější příčiny:

- **zapomenutý krok:** ve `while` chybí `count++`,
- **krok špatným směrem:** `i--` místo `i++` u cyklu, který má dojít nahoru,
- **podmínka, která se nemůže změnit:** ptá se na proměnnou, kterou tělo nemění.

Akademie tě chrání: smyčku, která běží příliš dlouho, zastaví a ohlásí `Smyčka běží příliš dlouho — nekonečná smyčka? (řádek 3)`. Číslo řádku ukazuje na cyklus. Neznamená to, že je kód pomalý — znamená to, že podmínka nikdy nepřestala platit.

> [!TIP]
> Když si nejsi jistý, jestli cyklus skončí, vypiš si na začátku těla hodnotu, na které podmínka závisí. Uvidíš, jestli se k hranici blíží, nebo od ní vzdaluje.

:::check
Proč tenhle cyklus nikdy neskončí?

```js
let copies = 10;
while (copies > 0) {
  console.log('Tisknu kopii');
  copies + 1;
}
```

### --answer--

`console.log` v cyklu nejde použít.

#### --why--

Výpis v cyklu je v pořádku. Na čem závisí podmínka a kde se ta hodnota mění?

### --correct--

`copies + 1` hodnotu jen spočítá a zahodí, `copies` zůstane `10` a podmínka platí pořád.

#### --why--

Bez přiřazení se proměnná nezmění. Ani `copies += 1` by nepomohlo — hodnota by od hranice nula utíkala. Správně je `copies--`.

### --answer--

Podmínka má být `copies >= 0`.

#### --why--

S `>=` by se podmínka splnila ještě snáz. Proč se hodnota `copies` vůbec nemění?

### --see--

js-zaklady/cykly#nekonecna-smycka
:::

:::explain
Vysvětli vlastními slovy, proč se cyklus `for` skládá ze tří částí a co se stane, když
jedna z nich chybí nebo nedělá, co má.

## --model--
Tři části odpovídají třem otázkám: **odkud začít**, **dokud kdy pokračovat** a **jak se
posunout dál**. Počáteční hodnota se vyhodnotí jednou před prvním průchodem, podmínka
před každým průchodem a posun po každém průchodu. Když vynechám posun nebo napíšu
podmínku, která nikdy nepřestane platit, cyklus se nemá čím přiblížit ke konci — a
program se zasekne v nekonečné smyčce. Proto se při psaní cyklu vyplatí ptát se jako
poslední na to, **co se musí změnit, aby podmínka jednou přestala platit**.

## --checklist--
- Počáteční hodnota se vyhodnotí jednou před cyklem.
- Podmínka se kontroluje před každým průchodem.
- Posun proběhne po každém průchodu.
- Bez posunu k ukončení podmínka nikdy nepřestane platit.
:::

## Typické chyby a pasti

### Průchod navíc

> [!PITFALL]
> **Off-by-one: cyklus proběhne o jednou víc nebo míň.** Příznak: vypíše se o řádek víc (třeba 13 měsíců místo 12), poslední položka chybí, nebo výsledek sedí „skoro". Oprava: řekni si první a poslední hodnotu a zkontroluj start (`0`/`1`) a porovnání (`<`/`<=`).

### Součet deklarovaný uvnitř cyklu

:::live js predict
```js
for (let day = 1; day <= 3; day++) {
  let steps = 0;
  steps += 4000;
  console.log(`Den ${day}: celkem ${steps} kroků`);
}
```
--question-- Aplikace má sčítat kroky za tři dny, každý den 4 000. Co vypíše? Každý výpis na vlastní řádek.
--expected--
```text
Den 1: celkem 4000 kroků
Den 2: celkem 4000 kroků
Den 3: celkem 4000 kroků
```
--why-- `let steps = 0` je uvnitř těla, takže v každém průchodu vznikne nová proměnná s nulou. Součet se nikdy nenasčítá. Přesuň deklaraci nad cyklus a součet poroste: 4000, 8000, 12000.
:::

> [!PITFALL]
> **Proměnná pro průběžný výsledek deklarovaná uvnitř cyklu se v každém průchodu vynuluje.** Příznak: součet nebo počet je vždy jen hodnota posledního průchodu. Oprava: deklaruj ji přes `let` **nad** cyklem, v těle jen přičítej.

### `const` v hlavičce `for`

> [!PITFALL]
> **`for (const i = 0; i < 3; i++)` vypíše první průchod a pak spadne s `TypeError: Assignment to constant variable.`** Krok `i++` přiřazuje do proměnné, a to `const` nedovolí. Oprava: v klasickém `for` piš `let`. Ve `for…of` naopak `const` stačí.

### Nekonečná smyčka z kroku

> [!PITFALL]
> **Ve `while` chybí krok nebo jde špatným směrem.** Příznak: karta zamrzne, v Akademii hláška `Smyčka běží příliš dlouho — nekonečná smyčka? (řádek N)`. Oprava: najdi proměnnou z podmínky a zkontroluj, že ji tělo mění směrem k hranici.

:::check
Cyklus má vypsat čísla stránek 1 až 10, ale poslední stránka chybí. Oprav hlavičku a napiš ji celou.

```js
for (let page = 1; page < 10; page++) {
```

### --expected--

for (let page = 1; page <= 10; page++) {

### --accept--

for (let page = 1; page < 11; page++) {
for (let page = 1; page <= 10; page += 1) {

### --why--

S `< 10` skončí cyklus u devítky. Když má být desítka poslední hodnota, patří do podmínky `<= 10`.

### --see--

js-zaklady/cykly#pruchod-navic
:::

## Kde to najdeš v MDN

- [Loops and iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration) — přehled všech cyklů včetně `break` a `continue` na jedné stránce.
- [for](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for) — pořadí, ve kterém se provádějí tři části hlavičky.
- [for...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) — co všechno jde procházet: text, pole a další.
- [break](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break) — ukončení cyklu i `switch`.

Dál: v labu Oprav 3 chyby najdeš v kolegově programu off-by-one a dvě další pasti z téhle sekce.

# --questions--

## --question--

Co vypíše tenhle kód? Každý výpis na vlastní řádek.

```js
let floor = 5;
while (floor > 1) {
  floor -= 2;
  console.log('Patro', floor);
}
```

### --expected--

```text
Patro 3
Patro 1
```

### --why--

Podmínka se kontroluje před průchodem: `5 > 1`, výtah sjede na 3 a vypíše; `3 > 1`, sjede na 1 a vypíše; `1 > 1` neplatí a cyklus končí. Výpis je až **po** odečtení, proto se pětka nevypíše.

### --see--

js-zaklady/cykly#while-a-do-while

## --question--

Napiš hlavičku cyklu `for` s proměnnou `i`, která projde čísla 10, 20, 30 … 100.

### --expected--

for (let i = 10; i <= 100; i += 10)

### --accept--

for (let i = 10; i < 101; i += 10)
for (let i = 10; i < 110; i += 10)
for (let i = 10; i <= 100; i = i + 10)

### --why--

Start na `10`, krok po deseti a podmínka, která stovku ještě pustí (`<= 100`).

### --see--

js-zaklady/cykly#kolikrat-cyklus-probehne

## --question--

Kdy použiješ `while` místo `for`?

### --answer--

Když chceš projít všechny znaky textu.

#### --why--

Na znaky textu je nejkratší `for…of`. Kdy ale nemáš žádné „od–do"?

### --correct--

Když dopředu nevíš, kolikrát opakovat, jen kdy přestat.

#### --why--

`while` hlídá jen podmínku. Hodí se na „opakuj, dokud nenaspoříš", kde počet průchodů vyjde až z výpočtu.

### --answer--

Když cyklus musí proběhnout aspoň jednou.

#### --why--

Tuhle vlastnost má `do…while`, obyčejný `while` klidně neproběhne ani jednou.

### --see--

js-zaklady/cykly#while-a-do-while

## --question--

Co vypíše tenhle kód?

```js
let count = 0;
for (const char of 'banán') {
  if (char === 'a') {
    count++;
  }
}
console.log(count);
```

### --expected--

1

### --why--

Porovnání `===` rozlišuje `a` a `á` — jsou to různé znaky. Slovo `banán` obsahuje jedno `a` a jedno `á`, takže se napočítá jen `1`.

### --see--

js-zaklady/cykly#for-of-prochazi-text-znak-po-znaku
