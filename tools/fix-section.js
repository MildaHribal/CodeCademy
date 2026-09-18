const fs = require('fs');
const path = require('path');

const sectionDir = path.join(process.cwd(), 'content', 'nastroje-devtools-vykon');

// Fix section.json
let sectionJson = JSON.parse(fs.readFileSync(path.join(sectionDir, 'section.json'), 'utf8'));
sectionJson.outcomes[0].links = ["devtools-mapa#mapa-panelu-ktery-na-co"];
sectionJson.outcomes[1].links = ["core-web-vitals#tri-otazky-uzivatele-nacetlo-se-reaguje-drzi-na-miste"];
sectionJson.outcomes[2].links = ["nacitani-stranky#kriticka-cesta-vykreslovani"];
sectionJson.outcomes[3].links = ["devtools-mapa#uniky-pameti-posluchaci-casovace-a-odpojene-uzly"];
fs.writeFileSync(path.join(sectionDir, 'section.json'), JSON.stringify(sectionJson, null, 2));

// Fix cards.md
let cardsMd = fs.readFileSync(path.join(sectionDir, 'cards.md'), 'utf8');
cardsMd = cardsMd.replace(/## --card-- free\n(.*?)\n### --expected--/gs, '## --card-- free\n$1\n### --back--');
cardsMd = cardsMd.replace(/devtools-mapa#elements-a-console/g, 'devtools-mapa#elements-kdo-zmenil-dom');
cardsMd = cardsMd.replace(/devtools-mapa#uniky-pameti-a-panel-memory/g, 'devtools-mapa#uniky-pameti-posluchaci-casovace-a-odpojene-uzly');
cardsMd = cardsMd.replace(/core-web-vitals#cls-cumulative-layout-shift/g, 'core-web-vitals#cls-posuny-ktere-uzivatel-necekal');
cardsMd = cardsMd.replace(/core-web-vitals#lcp-largest-contentful-paint/g, 'core-web-vitals#lcp-nejvetsi-obsah-v-zornem-poli');
cardsMd = cardsMd.replace(/nacitani-stranky#kriticka-cesta-critical-rendering-path/g, 'nacitani-stranky#kriticka-cesta-vykreslovani');
cardsMd = cardsMd.replace(/core-web-vitals#inp-interaction-to-next-paint/g, 'core-web-vitals#inp-odezva-na-kazdou-interakci');
cardsMd = cardsMd.replace(/nacitani-stranky#obrazky-a-pisma/g, 'nacitani-stranky#obrazky-format-rozmery-a-priorita');
cardsMd = cardsMd.replace(/nacitani-stranky#cache-a-hashovani/g, 'nacitani-stranky#cache-a-otisk-v-nazvech-souboru');
fs.writeFileSync(path.join(sectionDir, 'cards.md'), cardsMd);
