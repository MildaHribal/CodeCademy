# Big O notace

:::check pretest
Znáš rozdíl mezi $O(N)$ a $O(N^2)$?
:::

## Skryté n^2 v metodách

> [!PITFALL]
> Použití `indexOf` uvnitř `filter` nebo `map` znamená kvadratickou složitost.
> `Array.prototype.indexOf()` prochází pole od začátku do konce. U velkých polí to způsobí pád výkonu.

:::check
Jaká je složitost `array.includes()` v cyklu?
:::

## Kde to najdeš v MDN
- [Big O](https://developer.mozilla.org/en-US/docs/Glossary/Big_O_notation)

# --questions--
- Co je $O(1)$?
