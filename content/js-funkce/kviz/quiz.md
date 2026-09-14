## --question--
Jak se v JavaScriptu definuje funkce s názvem `pozdrav`?

### --answer--
`function: pozdrav() {}`
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --correct--
`function pozdrav() {}`

### --answer--
`def pozdrav() {}`
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --answer--
`create pozdrav() {}`
#### --why--
Toto není správně, podívej se na lekci o funkcích.

## --question--
Co vrátí následující funkce, pokud ji zavoláme jako `soucet(2, 3)`?

```javascript
function soucet(a, b) {
  a + b;
}
```

### --answer--
`5`
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --correct--
`undefined`

### --answer--
`NaN`
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --answer--
Vypíše chybu
#### --why--
Toto není správně, podívej se na lekci o funkcích.

## --question--
Jak se liší parametry a argumenty funkce?

### --answer--
Není mezi nimi žádný rozdíl, jsou to synonyma.
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --correct--
Parametry jsou proměnné definované v deklaraci funkce, argumenty jsou skutečné hodnoty předané při jejím volání.

### --answer--
Argumenty se používají pouze u arrow funkcí.
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --answer--
Parametry jsou skutečné hodnoty, argumenty jsou proměnné definované v deklaraci.
#### --why--
Toto není správně, podívej se na lekci o funkcích.

## --question--
Co vypíše tento kód do konzole?

```javascript
function vynasob(a, b = 2) {
  return a * b;
}
console.log(vynasob(5));
```

### --expected--
10

## --question--
Jak lze přepsat funkci `function naDruhou(x) { return x * x; }` pomocí arrow syntaxe?

### --answer--
`const naDruhou = x => { x * x; }`
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --correct--
`const naDruhou = x => x * x;`

### --answer--
`let naDruhou(x) => x * x;`
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --answer--
`const naDruhou = (x) -> x * x;`
#### --why--
Toto není správně, podívej se na lekci o funkcích.

## --question--
Máme následující kód. Co se stane při jeho spuštění?

```javascript
zavolejMe();

function zavolejMe() {
  console.log("Ahoj!");
}
```

### --answer--
Skript spadne s chybou `ReferenceError`, protože voláme funkci před její deklarací.
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --correct--
Vypíše "Ahoj!" do konzole díky mechanismu zvanému hoisting.

### --answer--
Vypíše `undefined`.
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --answer--
Funkce se tiše ignoruje.
#### --why--
Toto není správně, podívej se na lekci o funkcích.

## --question--
Co vypíše tento kód? Napiš výsledné číslo.

```javascript
const secti = (a, b) => a + b;
const vysledek = secti(4, 6);
console.log(vysledek);
```

### --expected--
10

## --question--
Jaká je hlavní výhoda defaultních parametrů?

### --correct--
Umožňují nastavit výchozí hodnotu, pokud při volání argument chybí (je undefined).

### --answer--
Zrychlují běh funkce.
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --answer--
Nutí uživatele vždy vyplnit všechny parametry.
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --answer--
Převádějí automaticky text na čísla.
#### --why--
Toto není správně, podívej se na lekci o funkcích.

## --question--
Co vypíše tento kód?

```javascript
let pocet = 0;
function zvys() {
  pocet++;
}
zvys();
zvys();
console.log(pocet);
```

### --expected--
2

## --question--
Je možné definovat funkci uvnitř jiné funkce?

### --correct--
Ano, vnitřní funkce má navíc přístup k proměnným vnější funkce.

### --answer--
Ne, to způsobí syntaktickou chybu.
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --answer--
Ano, ale nelze ji v žádném případě spustit.
#### --why--
Toto není správně, podívej se na lekci o funkcích.

### --answer--
Ne, v JavaScriptu nejsou vnořené funkce povoleny.
#### --why--
Toto není správně, podívej se na lekci o funkcích.


