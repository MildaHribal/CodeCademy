# Čas, síť a závislosti

Unit testy by měly být izolované a nezávislé. Pokud funkce dělá HTTP požadavek na reálné API, už to není unit test. 

:::check pretest
Co se stane, když unit test volá reálné produkční API?
1. Test bude spolehlivější.
2. Test může selhat kvůli výpadku sítě a zpomalí se.
3. Node.js takové volání v testech automaticky zablokuje.
:::

> [!REMEMBER]
> Mockování izoluje testovaný kód. Pokud se test rozbije, víš jistě, že je chyba ve tvém kódu, ne ve třetí straně.

## Falešné časovače

Testy nesmí čekat desítky vteřin. Časovače jako `setTimeout` můžeme zmockovat.

:::live node
const { test, mock } = require('node:test');
const assert = require('node:assert');

test('testuje časovač', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  let zavolano = false;
  setTimeout(() => { zavolano = true; }, 10000);
  
  mock.timers.tick(10000);
  assert.equal(zavolano, true, 'Callback se má zavolat po uplynutí času');
});
:::

:::check
Jakou metodu použiješ pro posun času v testech pomocí node:test?
:::

## Mockování sítě pomocí MSW

Mock Service Worker (MSW) zachycuje požadavky na úrovni sítě a vrací předpřipravené odpovědi. Tím simuluje reálný server bez zdržení.

> [!PITFALL]
> Nikdy nemockuj něco, co nevlastníš (jako databázi přes ovladač), pokud k tomu nemáš dobrý důvod. Síťové rozhraní (HTTP) je jedinou bezpečnou hranicí.

## Kde to najdeš v MDN
- [Node.js mock timers](https://nodejs.org/api/test.html#mocking-timers)
- [Mock Service Worker](https://mswjs.io/docs/)

# --questions--
- Proč používáme MSW místo toho, abychom upravovali funkci fetch pomocí mocku?
- Kdy je lepší nenasazovat mock a použít reálnou databázi (např. SQLite v paměti)?
