# Filmotéka

Webová aplikace nad filmovou databází: seznam nejlépe hodnocených filmů, hledání,
stránkování, detail filmu a oblíbené. Čistý HTML, CSS a JavaScript bez závislostí.

Celé zadání s uživatelskými příběhy najdeš v Akademii u projektu.

## Spuštění

Nic se neinstaluje. Otevři `index.html` v prohlížeči (dvojklikem nebo přetažením do okna)
a po každé změně stránku obnov. Pohodlnější je rozšíření VS Code, které stránku obnoví
samo po uložení, třeba **Live Preview** od Microsoftu.

## Soubory

| soubor | co v něm je |
|---|---|
| `index.html` | kostra stránky, prvky mají `id`, podle kterých je najdeš |
| `styles.css` | vzhled; klidně ho uprav |
| `api.js` | simulace API filmové databáze — neměň ji |
| `app.js` | tvůj kód |

## API

`api.js` nahrazuje `fetch` pro adresy `/api/…`. Odpovídá se zpožděním, vrací skutečné
objekty `Response` a umí zrušení přes `signal`, takže kód píšeš stejně jako proti
opravdovému serveru.

| požadavek | odpověď |
|---|---|
| `GET /api/movies?page=1` | `{ page, totalPages, totalResults, results }` — filmy od nejlépe hodnocených, 8 na stránku |
| `GET /api/movies?query=matrix&page=1` | totéž, jen filmy, jejichž název obsahuje hledaný text |
| `GET /api/movies/14` | detail `{ id, title, originalTitle, year, genres, director, rating, overview, poster }`, neznámý film `404` |

Položka v `results` má tvar `{ id, title, year, rating, poster }`. `poster` je adresa
obrázku, kterou dáš rovnou do `src`.

Výpadky si vyzkoušíš v konzoli prohlížeče:

```js
mockApi.failures = 1;   // další požadavek skončí chybou 500
mockApi.delay = 3000;   // server odpovídá tři sekundy
mockApi.offline = true; // síť nejde
```

## Adresa stránky

Stav aplikace je v části adresy za `#`, takže jde poslat odkazem a funguje tlačítko Zpět:

| adresa | co je vidět |
|---|---|
| `#strana=2` | druhá stránka nejlépe hodnocených |
| `#hledat=duna&strana=1` | výsledky hledání „duna" |
| `#hledat=duna&strana=1&film=21` | detail filmu 21, Zpět vede na výsledky hledání |

## Kontrola

V Akademii u projektu klikni na **Zkontrolovat**. Testy načtou tvoje soubory, spustí
stránku a projdou uživatelské příběhy.
