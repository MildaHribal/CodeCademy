const fs = require('fs');
const path = require('path');

const dir = '/home/karel/akademie/content/js-async';

function createWorkshop(slug, title, summary, runtime) {
  const wsDir = path.join(dir, slug);
  fs.mkdirSync(wsDir, { recursive: true });
  fs.mkdirSync(path.join(wsDir, 'steps'), { recursive: true });
  
  fs.writeFileSync(path.join(wsDir, 'module.json'), JSON.stringify({
    type: "workshop",
    title,
    summary,
    minutes: 60,
    runtime
  }, null, 2));

  for (let i = 1; i <= 22; i++) {
    const num = i.toString().padStart(3, '0');
    const kind = i <= 2 ? 'recall' : (i % 10 === 0 ? 'debug' : 'step');
    
    let content = `---
title: "Krok ${i}"
kind: ${kind}
see: section/lesson#anchor
---
<--description-->
Zadání kroku ${i}. Načítáme data a řešíme stavy. V dalším kroku přidáme logiku.
</--description-->
<--hints-->
Udělej to takto:
\`\`\`js
assert.equal(1, 1, 'Jedna je jedna');
\`\`\`
</--hints-->
<--help-->
## --tip--
Tip pro tento krok.
</--help-->
<--seed-->
## --file-- script.js
\`\`\`js
// Předchozí řešení
--edit--
// Tvůj kód
--edit--
\`\`\`
</--seed-->
<--solution-->
## --file-- script.js
\`\`\`js
// Hotové řešení pro krok ${i}
\`\`\`
`;
    fs.writeFileSync(path.join(wsDir, 'steps', `${num}.md`), content);
  }
}

createWorkshop('workshop-zpracovani-objednavek', 'Zpracování objednávek', 'Workshop na slibování.', 'js');
createWorkshop('workshop-vyhledavac-receptu', 'Vyhledávač receptů', 'Workshop na vyhledávání a DOM.', 'dom');
