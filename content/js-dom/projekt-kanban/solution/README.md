# Tabule projektu

Kanban tabule pro malé webové studio: karty úkolů ve třech sloupcích, přesun tlačítky
i přetažením myší, filtr v adrese a uložení v prohlížeči. Čistý HTML, CSS a JavaScript
bez knihoven a bez sestavení.

Celé zadání s uživatelskými příběhy najdeš v Akademii u projektu.

## Spuštění

Nic se neinstaluje. Náhled vidíš přímo v Akademii u projektu. Mimo ni stačí otevřít
`index.html` v prohlížeči (dvojklikem nebo přetažením do okna) a po uložení souboru
stránku obnovit.

## Soubory

| soubor | co v něm je |
|---|---|
| `index.html` | kostra stránky, tři sloupce a šablona karty `#card-template` |
| `styles.css` | hotový vzhled včetně tříd `is-drop-target` a `is-dragging` |
| `script.js` | data a logika tabule — tady píšeš |

## Rozhodnutí

- **Zdroj pravdy je pole `cards` a text filtru.** Každá akce změní data, uloží je
  a zavolá `render()`, který postaví všechny tři sloupce znovu. DOM se nikdy nečte
  jako data.
- **Filtr je v adrese (`?q=`), karty v `localStorage`.** Odkaz s filtrem jde poslat
  kolegovi, karty jsou osobní rozpracovaná tabule v tomhle prohlížeči. Při psaní
  do filtru se adresa přepisuje přes `replaceState`, aby tlačítko Zpět nevracelo
  písmeno po písmenu.
- **Poškozená data v úložišti tabuli neshodí.** `loadCards` čte JSON v `try`/`catch`
  a ověří tvar každé karty; když něco nesedí, začne se s ukázkovými kartami.
- **Fokus po přesunu.** Překreslení tlačítko zničí, proto se fokus vrací na tlačítko
  přesunuté karty ve stejném směru (nebo na opačné, když je v krajním sloupci neaktivní).
