const fs = require('fs');
const path = require('path');

const dir = '/home/karel/akademie/content/prace-s-ai/workshop-oprav-skryte-chyby/steps';
fs.mkdirSync(dir, { recursive: true });

// We only do a subset of steps and I will create them via simple code.
const md1 = `---
title: "Seznámení a 1. chyba (Neexistující metoda)"
kind: debug
see: prace-s-ai/review-kodu-z-ai#checklist-pro-review
---
</--solution-->
<--description-->
Tento kód vygenerovala AI. Tvým úkolem je najít a opravit 7 skrytých chyb. První funkce \`clearItems\` má vyprázdnit pole. Nejprve napiš test, který chybu odhalí.

## Hlášení
Při volání \`clearItems\` padá aplikace s chybou.

## Úkol
Napiš test pro funkci \`clearItems\`. Očekáváme, že funkce přijme pole, vyprázdní ho a vrátí.
</--description-->
<--hints-->
\`\`\`js
assert.equal(clearItems([1, 2]).length, 0, 'clearItems([1, 2]) má vrátit prázdné pole');
\`\`\`
</--hints-->
<--help-->
## --tip--
Zavolej funkci s polem a ověř jeho délku.
## --tip--
Použij \`assert.equal\` a zjisti délku pole pomocí \`.length\`.
</--help-->
<--seed-->
## --file-- script.js
\`\`\`js
export function clearItems(arr) {
  arr.clear();
  return arr;
}
import assert from 'assert';

--edit--
// 1. Zde napiš test pro clearItems
--edit--
\`\`\`
</--seed-->
<--solution-->
## --file-- script.js
\`\`\`js
export function clearItems(arr) {
  arr.clear();
  return arr;
}
import assert from 'assert';

assert.equal(clearItems([1, 2]).length, 0, 'clearItems([1, 2]) má vrátit prázdné pole');
\`\`\`
</--solution-->
`;

const md2 = `---
title: "Oprav neexistující metodu"
kind: step
see: prace-s-ai/review-kodu-z-ai#checklist-pro-review
---
</--solution-->
<--description-->
Test odhalil chybu \`TypeError: arr.clear is not a function\`. Jazykový model si metodu vymyslel.

Oprav funkci \`clearItems\`, aby pole skutečně vyprázdnila (např. nastavením délky na 0).
</--description-->
<--hints-->
\`\`\`js
assert.equal(clearItems([1, 2]).length, 0, 'clearItems([1, 2]) má vrátit prázdné pole');
\`\`\`
</--hints-->
<--help-->
## --tip--
V JavaScriptu pole nemá metodu \`clear()\`.
## --tip--
Vyprázdnit pole můžeš tak, že jeho vlastnosti \`.length\` přiřadíš \`0\`.
</--help-->
<--seed-->
## --file-- script.js
\`\`\`js
--edit--
export function clearItems(arr) {
  arr.clear();
  return arr;
}
--edit--
import assert from 'assert';

assert.equal(clearItems([1, 2]).length, 0, 'clearItems([1, 2]) má vrátit prázdné pole');
\`\`\`
</--seed-->
<--solution-->
## --file-- script.js
\`\`\`js
export function clearItems(arr) {
  arr.length = 0;
  return arr;
}
import assert from 'assert';

assert.equal(clearItems([1, 2]).length, 0, 'clearItems([1, 2]) má vrátit prázdné pole');
\`\`\`
</--solution-->
`;

fs.writeFileSync(path.join(dir, '001.md'), md1);
fs.writeFileSync(path.join(dir, '002.md'), md2);
