const fs = require('fs');
const path = require('path');

const dir = '/home/karel/akademie/content/js-async';

const modules = [
  'event-loop',
  'promise',
  'async-await',
  'workshop-zpracovani-objednavek',
  'fetch-a-api',
  'stavy-nacitani-a-chyb',
  'workshop-vyhledavac-receptu',
  'soubeh-a-zruseni',
  'lab-datoborce',
  'kviz',
  'projekt-filmova-databaze'
];

// Update section.json
const sectionPath = path.join(dir, 'section.json');
let section = JSON.parse(fs.readFileSync(sectionPath, 'utf8'));
section.modules = modules;
fs.writeFileSync(sectionPath, JSON.stringify(section, null, 2));

// Delete old ones not in modules
const items = fs.readdirSync(dir, { withFileTypes: true });
for (const item of items) {
  if (item.isDirectory() && !modules.includes(item.name)) {
    fs.rmSync(path.join(dir, item.name), { recursive: true, force: true });
  }
}

// Create new ones
for (const mod of modules) {
  fs.mkdirSync(path.join(dir, mod), { recursive: true });
}
console.log("Scaffold updated.");
