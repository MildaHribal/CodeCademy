---
title: Kvíz algoritmů
---
<--question-->
Jakou časovou složitost má metoda `Array.prototype.push()` v průměrném případě?

### --answer--
$O(N)$
#### --why--
Ne, `push` vkládá prvek na konec, není třeba posouvat ostatní.

### --correct--
$O(1)$
#### --why--
Metoda `push` přidává hodnotu na konec pole a pole si pamatuje svou délku, takže operace trvá konstantní čas.

### --see--
js-algoritmy/big-o#skryte-n2
