const fs = require('fs');
const path = require('path');

const dir = '/home/karel/akademie/content/js-async';

const kvizDir = path.join(dir, 'kviz');
fs.mkdirSync(kvizDir, { recursive: true });

fs.writeFileSync(path.join(kvizDir, 'module.json'), JSON.stringify({
  type: "quiz",
  title: "Kvíz",
  summary: "Otestuj své znalosti o Promise, async/await a fetch.",
  minutes: 20,
  runtime: "js"
}, null, 2));

fs.writeFileSync(path.join(kvizDir, 'quiz.md'), `---
title: "Kvíz: Asynchronní JavaScript"
---
<--question-->
Co vrátí funkce \`fetch\`?
### --answer--
Odpověď ze serveru jako text.
#### --why--
Ne, vrací objekt, ze kterého musíme odpověď teprve přečíst.
### --correct--
Promise, která se vyřeší objektem Response.
#### --why--
Ano, \`fetch\` je asynchronní a vrací Promise.
### --see--
js-async/fetch-a-api#anchor
</--question-->

<--question-->
Jak zachytíme chybu u \`await\`?
### --answer--
Pomocí metody \`.catch()\`.
#### --why--
To se používá u \`then\`. S \`await\` se doporučuje \`try...catch\`.
### --correct--
Pomocí bloku \`try...catch\`.
#### --why--
Ano, \`try...catch\` odchytí chyby uvnitř asynchronních funkcí.
### --see--
js-async/async-await#anchor
</--question-->

<--question-->
Jak zjistíš, že HTTP požadavek přes fetch skončil stavem 404?
### --answer--
Fetch hodí chybu do bloku catch.
#### --why--
Ne, 404 není chápáno jako chyba sítě, Promise se vyřeší normálně.
### --correct--
Podívám se na vlastnost \`response.ok\`.
#### --why--
Ano, \`response.ok\` je \`false\` pro stavové kódy 400 a vyšší.
### --see--
js-async/fetch-a-api#anchor
</--question-->
`);
