# Tahák: Funkce a rozsah platnosti

## Vytváření funkcí

### Deklarace funkce
Načte se před spuštěním kódu (hoisting), dá se volat dřív, než je v kódu napsaná.

```js
function secti(a, b) {
  return a + b;
}
```

### Funkční výraz a šipková funkce
Uložená do proměnné. Nedá se volat před inicializací.

```js
const odecti = (a, b) => {
  return a - b;
};

// Zkrácený zápis pro jediný výraz (return je implicitní)
const nasob = (a, b) => a * b;
```

## Parametry a argumenty

**Parametr** = proměnná v definici. **Argument** = hodnota při volání.

```js
// Výchozí hodnoty (použijí se, když se argument vynechá nebo je undefined)
function pozdrav(jmeno = 'Anonym') {
  console.log(`Ahoj ${jmeno}`);
}

// Zbytkové parametry (rest) sbalí zbylé argumenty do pole
function sectiVse(prvni, ...zbytek) {
  // prvni je číslo, zbytek je pole čísel
}
```

## Návratová hodnota (return)
Pokud funkce neobsahuje `return` (nebo je prázdný), vrací `undefined`. Jakmile kód narazí na `return`, funkce okamžitě končí.

```js
function vydel(a, b) {
  if (b === 0) {
    return null; // Guard clause - okamžité ukončení
  }
  return a / b;
}
```

## Rozsah platnosti (Scope)

Každý blok (`{}`) nebo funkce vytváří vlastní bezpečný prostor pro proměnné.

*   **Globální scope**: Přístupné odevšad (vyhýbej se jim).
*   **Blokový scope**: `let` a `const` existují jen uvnitř bloku `{ ... }`, kde byly vytvořeny (např. v cyklu, v `if`).
*   **Funkční scope**: `var` nerespektuje bloky, je omezený pouze na funkci, ve které vznikl.

### Stínění (Shadowing)
Pokud má vnitřní proměnná stejný název jako vnější, dočasně ji „zastíní“.

```js
const x = 10;
if (true) {
  const x = 20; // Stíní vnější x
  console.log(x); // 20
}
console.log(x); // 10
```

## Hoisting a TDZ (Temporal Dead Zone)
Fyzicky je kód prováděn shora dolů, ale deklarace funkcí a proměnných se „virtuálně“ přesouvají nahoru.
Proměnné `let` a `const` však nelze přečíst dříve, než na jejich řádek kód dorazí. Tento zakázaný prostor od začátku bloku po deklaraci se nazývá TDZ.

## Callback (funkce jako hodnota)
Funkci můžeme předat jiné funkci jako argument – nepíšeme za ni závorky `()`, ty by ji hned spustily.

```js
function zatrub() {
  console.log('Tuuut!');
}

// Spustí zatrub() za 2 vteřiny
setTimeout(zatrub, 2000); 

// Špatně! Spustí hned a předá výsledek (undefined) setTimeoutu:
// setTimeout(zatrub(), 2000);
```
