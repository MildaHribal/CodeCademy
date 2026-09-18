
# fetch a API

:::check pretest
Umíš poslat požadavek na server a vypsat odpověď do konzole?
:::

> [!REMEMBER]
> `fetch` nehlásí chybu pro stavové kódy jako 404 nebo 500, pouze pokud se spojení nepodaří (např. offline).

## Jak poslat požadavek

Pro odeslání HTTP požadavku používáme funkci `fetch`. Vrací Promise, která se vyřeší objektem `Response`.

:::live js
const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
const data = await response.json();
console.log(data.title);
// Zkus změnit ID příspěvku v URL na 2 a sleduj, jak se změní výpis.
:::

## Zpracování odpovědi

> [!PITFALL]
> TypeError: Failed to fetch
> Tento error znamená, že se nepodařilo navázat spojení, např. kvůli chybějícímu internetu nebo blokování (CORS).

:::check
Jaká metoda se používá pro získání JSON z objektu Response?
:::

## Kde to najdeš v MDN
- [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch)
- [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)

# --questions--
- Co vrátí funkce `fetch`?
- Kdy `fetch` hodí výjimku (znamená, že Promise je rejected)?
