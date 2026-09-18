---
title: Mock pohovor
---
<--solution-->
<--question-->
Co je na tomto kódu špatně a jak to opravíš?
```js
function Timer() {
  let count = 0;
  setInterval(function() {
    count++;
    console.log(this.count);
  }, 1000);
}
```

### --answer--
Kód funguje správně.
#### --why--
To není pravda. `this` uvnitř `setInterval` s běžnou funkcí neukazuje na instanci `Timer`.

### --correct--
`this.count` bude `undefined`, protože klasická funkce v `setInterval` má vlastní kontext (obvykle `window` nebo `global`). Musí se použít arrow funkce.
#### --why--
Arrow funkce nemají vlastní `this`, ale přebírají ho z obklopujícího kontextu.

### --see--
js-funkce-hloubka/this
</--question-->

<--question-->
Popište rozdíl mezi `==` a `===`.

### --answer--
Nevím.
#### --why--
Srovnávání s typovou konverzí vs striktní srovnávání.

### --correct--
`==` provádí před srovnáním typovou konverzi (tzv. type coercion), pokud jsou typy různé. `===` porovnává jak hodnotu, tak i samotný typ (striktní shoda). V moderním JS se téměř výhradně používá `===`.
#### --why--
Striktní shoda zabraňuje chybám plynoucím z nečekaného přetypování v JS.

### --see--
js-zaklady/porovnani
</--question-->
