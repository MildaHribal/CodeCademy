| Operace | Průměrně | Nejhorší |
| --- | --- | --- |
| `push` / `pop` | $O(1)$ | $O(N)$ |
| `shift` / `unshift` | $O(N)$ | $O(N)$ |

```js
// Two pointers setup
let left = 0;
let right = arr.length - 1;
while (left < right) {
  // logic
}
```
