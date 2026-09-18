
# Souběh a zrušení

:::check pretest
Víš, jak načíst tři požadavky naráz a jak jeden zrušit, pokud trvá příliš dlouho?
:::

> [!REMEMBER]
> Když se požadavky nezávisí jeden na druhém, spusť je souběžně přes `Promise.all`. Bude to rychlejší.

## Souběh s Promise.all

:::live js
const [users, posts] = await Promise.all([
  fetch('https://jsonplaceholder.typicode.com/users').then(r => r.json()),
  fetch('https://jsonplaceholder.typicode.com/posts').then(r => r.json())
]);
console.log(`Načteno ${users.length} uživatelů a ${posts.length} příspěvků.`);
// Zkus před slovem await smazat Promise.all a sleduj chybu.
:::

## Zrušení pomocí AbortController

> [!PITFALL]
> AbortError: The operation was aborted.
> Tento error znamená, že požadavek byl úmyslně zrušen přes AbortController.

:::check
Jakou vlastnost předáme do `fetch`, abychom ho mohli zrušit?
:::

## Kde to najdeš v MDN
- [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

# --questions--
- Kdy použiješ `Promise.all` místo postupného `await`?
- Jak zrušíš probíhající požadavek?
