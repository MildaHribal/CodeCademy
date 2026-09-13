# API poznámek

REST API pro jednoduchou aplikaci na poznámky. Čistý Node.js, žádné závislosti,
data v souboru `data/notes.json`.

Celé zadání s uživatelskými příběhy najdeš v Akademii u projektu.

## Spuštění

Potřebuješ Node 22 nebo novější. Nic se neinstaluje — projekt nemá závislosti.

```sh
npm run dev      # spustí server a restartuje ho po každém uložení souboru
npm start        # spustí server bez restartování
```

Server poběží na <http://localhost:3000>. Jiný port nastavíš proměnnou prostředí:

```sh
PORT=4000 npm run dev
```

Server ukončíš v terminálu klávesami Ctrl+C.

## Soubory

| soubor | co v něm je |
|---|---|
| `index.js` | server — tady píšeš |
| `data/notes.json` | poznámky; server je čte a zapisuje |
| `package.json` | `"type": "module"` a příkazy `start` a `dev` |

Cestu k souboru s daty jde změnit proměnnou `NOTES_FILE`. Kontrola v Akademii
toho využívá: pouští server nad vlastním dočasným souborem, takže tvoje poznámky
v `data/notes.json` zůstanou, jak jsou.

## API

| metoda a cesta | tělo požadavku | úspěšná odpověď |
|---|---|---|
| `GET /api/notes` | — | `200` a pole poznámek |
| `GET /api/notes/:id` | — | `200` a poznámka |
| `POST /api/notes` | `{ "title": "…", "text": "…" }` | `201` a vytvořená poznámka |
| `DELETE /api/notes/:id` | — | `204` bez těla |

Chyby odpovídají JSON objektem `{ "error": "česká zpráva" }` se stavem `400`,
`404`, `405` nebo `500`.

## Jak API vyzkoušet

V druhém terminálu, zatímco server běží:

```sh
# seznam poznámek
curl -i http://localhost:3000/api/notes

# nová poznámka
curl -i -X POST http://localhost:3000/api/notes \
  -H 'Content-Type: application/json' \
  -d '{"title": "Zavolat mámě", "text": "v neděli odpoledne"}'

# smazání (id zkopíruj z odpovědi výš)
curl -i -X DELETE http://localhost:3000/api/notes/SEM-DEJ-ID
```

Přepínač `-i` vypíše i stavový kód a hlavičky, nejen tělo.

## Kontrola

V Akademii u projektu klikni na **Zkontrolovat**. Testy spustí `node index.js`
na volném portu a ověří každý uživatelský příběh.
