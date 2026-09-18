
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
    status.textContent = `Načetl se uživatel: ${data.name}`;
  } catch (err) {
    status.textContent = `Došlo k chybě: ${err.message}`;
  }
});
// Zkus změnit URL na neexistující adresu a sleduj, jak se zobrazí chyba.
:::

:::check
Proč musíme kontrolovat `res.ok`?
:::

## Kde to najdeš v MDN
- [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok)

# --questions--
- Vyjmenuj 4 hlavní stavy, které by UI mělo umět zpracovat.
- Jak v kódu zjistíš, že server vrátil 404 nebo 500?
