// API poznámek — REST API v čistém Node, data v JSON souboru.
// Zadání s uživatelskými příběhy je v Akademii u projektu, přehled API v README.md.
import { createServer } from 'node:http';
import path from 'node:path';

// Port z prostředí, bez něj 3000.
const port = Number(process.env.PORT ?? 3000);

// Soubor s poznámkami. Cestu jde přepsat proměnnou NOTES_FILE — kontrola v Akademii
// si tak podstrčí vlastní dočasný soubor a tvoje data v data/notes.json nechá být.
// Tuhle konstantu používej všude, kde čteš nebo zapisuješ poznámky.
const notesFile = process.env.NOTES_FILE ?? path.join(import.meta.dirname, 'data', 'notes.json');

const server = createServer(async (req, res) => {
  // Tady začni: podle cesty a metody rozhodni, co se má stát.
  // Zatím server na všechno odpoví 501 Not Implemented.
  res.writeHead(501, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'Zatím není hotové.' }));
});

server.listen(port, () => {
  console.log(`API poznámek běží na http://localhost:${port}`);
  console.log(`Poznámky se ukládají do ${notesFile}`);
});
