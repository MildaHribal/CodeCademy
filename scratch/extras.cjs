const fs = require('fs');
const path = require('path');
const dir = '/home/karel/akademie/content/js-async';

fs.writeFileSync(path.join(dir, 'cards.md'), `
## --card-- free
Co je to event loop v JavaScriptu?
### --expected--
Mechanismus, který kontroluje zásobník (call stack) a frontu úloh (task queue). Pokud je zásobník prázdný, vezme další úlohu z fronty a spustí ji.
### --why--
JavaScript je jednovláknový. Aby neblokoval vlákno, používá asynchronní operace, které prohlížeč vyřídí na pozadí, a výsledek vrátí přes callback do fronty úloh.
### --see--
js-async/event-loop#anchor

## --card-- code js
Co vypíše tento kód?
\`\`\`js
console.log('1');
setTimeout(() => console.log('2'), 0);
console.log('3');
\`\`\`
### --expected--
1
3
2
### --why--
\`setTimeout\` pošle callback do fronty úloh (makroúlohy). Synchronní kód (1, 3) proběhne jako první, teprve když se zásobník vyprázdní, vybere se úloha z fronty (2).
### --see--
js-async/event-loop#anchor
`);

fs.writeFileSync(path.join(dir, 'pojmy.md'), `
## --term-- event-loop
en: Event loop
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop
lekce: js-async/event-loop#anchor
Smyčka událostí. Zajišťuje asynchronní chování JavaScriptu tím, že bere callbacky z fronty a spouští je, když je hlavní vlákno volné.

## --term-- promise
en: Promise
aliases: promisám, promisům
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
lekce: js-async/promise#anchor
Objekt reprezentující případné dokončení (nebo selhání) asynchronní operace. Může být ve stavu pending, fulfilled nebo rejected.

## --term-- async-await
en: async / await
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
lekce: js-async/async-await#anchor
Syntaktický cukr nad Promise. Umožňuje psát asynchronní kód tak, aby vypadal jako synchronní, pomocí klíčových slov \`async\` a \`await\`.
`);

fs.writeFileSync(path.join(dir, 'tahak.md'), `
| Vlastnost | Popis |
| --- | --- |
| \`fetch(url)\` | Odešle HTTP požadavek, vrací Promise |
| \`res.json()\` | Přečte tělo odpovědi a rozparsuje ho jako JSON |
| \`res.ok\` | \`true\` pokud je HTTP status v rozsahu 200–299 |
| \`Promise.all(arr)\` | Čeká na všechny Promisy v poli |

### Pasti
- Nezapomeň na \`await\` před voláním asynchronní funkce!
- Nezapomeň zkontrolovat \`response.ok\`, protože \`fetch\` nehází chybu pro 404 nebo 500.
`);
