# Dělenka — landing page

Úvodní stránka aplikace Dělenka: úvod s nabídkou ke stažení, funkce, recenze, ceník, časté otázky a patička. Čisté HTML a CSS bez knihoven a bez sestavení.

## Spuštění

Nic se neinstaluje. Stačí otevřít `index.html` v prohlížeči.

## Soubory

| soubor | co v něm je |
|---|---|
| `index.html` | struktura stránky |
| `styles.css` | styly ve vrstvách `reset, tokens, base, layout, components, motion` |
| `predloha.md` | texty a struktura od klienta |
| `navrh.md` | barvy, typografie, rozvržení a pohyb od designérky |

## Rozhodnutí

- **Vrstvy podle role, ne podle sekce.** Pohyb je ve vlastní poslední vrstvě `motion`, takže omezení pohybu přepisuje jen jedno místo a nepere se se specificitou komponent.
- **Tmavý motiv přes `light-dark()`.** Každý token má obě hodnoty vedle sebe v jednom řádku, takže při úpravě barvy nezapomenu na druhý motiv. `color-scheme: light dark` přepne i posuvníky a pole formulářů.
- **Funkce v gridu, recenze ve flexboxu.** Funkce jsou mřížka, kde se mají srovnat sloupce i řádky. Recenze jsou jedna řada, kde stačí stejná šířka a výška. Karta funkce se rozvrhuje přes container query, protože stejná karta je jednou v úzkém a jindy v širokém sloupci.

## Nasazení

https://example.github.io/delenka (doplň svou adresu)
