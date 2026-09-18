const fs = require('fs');
const path = require('path');

const dir = '/home/karel/akademie/content/js-async';

// 5. fetch-a-api
fs.writeFileSync(path.join(dir, 'fetch-a-api', 'module.json'), JSON.stringify({
  type: "lesson", title: "fetch a API", summary: "Základy komunikace po síti pomocí fetch.", minutes: 40, runtime: "js"
}, null, 2));

fs.writeFileSync(path.join(dir, 'fetch-a-api', 'lesson.md'), `
# fetch a API

:::check pretest
Umíš poslat požadavek na server a vypsat odpověď do konzole?
:::

> [!REMEMBER]
> \`fetch\` nehlásí chybu pro stavové kódy jako 404 nebo 500, pouze pokud se spojení nepodaří (např. offline).

## Jak poslat požadavek

Pro odeslání HTTP požadavku používáme funkci \`fetch\`. Vrací Promise, která se vyřeší objektem \`Response\`.

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
- Co vrátí funkce \`fetch\`?
- Kdy \`fetch\` hodí výjimku (znamená, že Promise je rejected)?
`);

// 6. stavy-nacitani-a-chyb
fs.writeFileSync(path.join(dir, 'stavy-nacitani-a-chyb', 'module.json'), JSON.stringify({
  type: "lesson", title: "Stavy načítání a chyb", summary: "Jak v DOMu ukázat uživateli, co se děje.", minutes: 40, runtime: "dom"
}, null, 2));

fs.writeFileSync(path.join(dir, 'stavy-nacitani-a-chyb', 'lesson.md'), `
# Stavy načítání a chyb

:::check pretest
Umíš zobrazit spinner, než se načtou data, a po chybě vypsat zprávu?
:::

> [!REMEMBER]
> Aplikace by měla uživateli vždy jasně komunikovat, v jakém je stavu: načítá se, podařilo se, stala se chyba, nebo je výsledek prázdný.

## Vykreslení stavů

:::live dom
<button id="load">Načíst data</button>
<div id="status"></div>
---
const btn = document.querySelector('#load');
const status = document.querySelector('#status');

btn.addEventListener('click', async () => {
  status.textContent = 'Načítám...';
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/users/1');
    if (!res.ok) throw new Error('Chyba serveru');
    const data = await res.json();
    status.textContent = \`Načetl se uživatel: \${data.name}\`;
  } catch (err) {
    status.textContent = \`Došlo k chybě: \${err.message}\`;
  }
});
// Zkus změnit URL na neexistující adresu a sleduj, jak se zobrazí chyba.
:::

:::check
Proč musíme kontrolovat \`res.ok\`?
:::

## Kde to najdeš v MDN
- [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok)

# --questions--
- Vyjmenuj 4 hlavní stavy, které by UI mělo umět zpracovat.
- Jak v kódu zjistíš, že server vrátil 404 nebo 500?
`);

// 8. soubeh-a-zruseni
fs.writeFileSync(path.join(dir, 'soubeh-a-zruseni', 'module.json'), JSON.stringify({
  type: "lesson", title: "Souběh a zrušení", summary: "Promise.all, race a AbortController.", minutes: 40, runtime: "js"
}, null, 2));

fs.writeFileSync(path.join(dir, 'soubeh-a-zruseni', 'lesson.md'), `
# Souběh a zrušení

:::check pretest
Víš, jak načíst tři požadavky naráz a jak jeden zrušit, pokud trvá příliš dlouho?
:::

> [!REMEMBER]
> Když se požadavky nezávisí jeden na druhém, spusť je souběžně přes \`Promise.all\`. Bude to rychlejší.

## Souběh s Promise.all

:::live js
const [users, posts] = await Promise.all([
  fetch('https://jsonplaceholder.typicode.com/users').then(r => r.json()),
  fetch('https://jsonplaceholder.typicode.com/posts').then(r => r.json())
]);
console.log(\`Načteno \${users.length} uživatelů a \${posts.length} příspěvků.\`);
// Zkus před slovem await smazat Promise.all a sleduj chybu.
:::

## Zrušení pomocí AbortController

> [!PITFALL]
> AbortError: The operation was aborted.
> Tento error znamená, že požadavek byl úmyslně zrušen přes AbortController.

:::check
Jakou vlastnost předáme do \`fetch\`, abychom ho mohli zrušit?
:::

## Kde to najdeš v MDN
- [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

# --questions--
- Kdy použiješ \`Promise.all\` místo postupného \`await\`?
- Jak zrušíš probíhající požadavek?
`);
