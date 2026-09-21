# Rozpočet

Malá webová aplikace na domácí rozpočet: příjmy, výdaje, kategorie a měsíční přehled.
Data zůstávají v prohlížeči (`localStorage`), žádný server není potřeba.

## Spuštění

| příkaz | co dělá |
|---|---|
| `npm install` | stáhne závislosti (jednou) |
| `npm run dev` | vývojový server na <http://localhost:5173> |
| `npm test` | testy ve Vitestu |
| `npm run test:watch` | testy, které se pouští po každém uložení |
| `npm run typecheck` | kontrola typů (`tsc --noEmit`) |
| `npm run format` | srovná formátování Prettierem |
| `npm run build` | produkční sestavení do `dist/` |

## Rozvržení kódu

| soubor | co v něm je |
|---|---|
| `src/rozpocet.ts` | čisté výpočty nad položkami — nic o DOM, nic o úložišti |
| `src/uloziste.ts` | čtení a zápis položek; úložiště dostane zvenku |
| `src/zobrazeni.ts` | vykreslení do připravené stránky |
| `src/main.ts` | propojení: formulář, přepínání měsíců, uložení |

## Rozhodnutí

*(sem napiš jedno rozhodnutí, které jsi při stavbě udělal, a proč)*
