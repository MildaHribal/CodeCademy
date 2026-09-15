# Návrh: Dělenka

Popis návrhu od designérky. Hodnoty jsou výchozí, na obrazovce smíš ladit, ale drž se stupnic.

## Charakter

Svěží, klidná, důvěryhodná aplikace o penězích. Hodně bílého místa, jedna výrazná zelená, zaoblené karty, žádné křiklavé přechody. Tmavý motiv je stejná stránka v noci, ne jiný web.

## Barvy (sémantické tokeny)

| token | světlý motiv | tmavý motiv | použití |
|---|---|---|---|
| `--color-bg` | `oklch(98.5% 0.006 250)` | `oklch(17% 0.02 270)` | pozadí stránky |
| `--color-surface` | `oklch(100% 0 0)` | `oklch(22% 0.025 270)` | karty, nabídka |
| `--color-tint` | `oklch(96% 0.025 165)` | `oklch(21% 0.03 200)` | podbarvená sekce recenzí |
| `--color-text` | `oklch(22% 0.03 270)` | `oklch(95% 0.01 250)` | text |
| `--color-muted` | `oklch(45% 0.03 270)` | `oklch(78% 0.02 260)` | vedlejší text |
| `--color-line` | `oklch(90% 0.012 270)` | `oklch(33% 0.03 270)` | rámečky, oddělovače |
| `--color-accent` | `oklch(47% 0.11 165)` | `oklch(80% 0.13 165)` | tlačítka, odkazy, ikony |
| `--color-on-accent` | `oklch(100% 0 0)` | `oklch(18% 0.03 200)` | text na akcentu |
| `--color-accent-soft` | `oklch(93% 0.04 165)` | `oklch(30% 0.05 175)` | pozadí ikon, štítků, najetí |

## Typografie

Systémové písmo. Stupnice: 0,875 · 1 · 1,25 rem, nadpisy sekcí plynule 1,75–2,5 rem, hlavní nadpis plynule 2,5–4,5 rem s řádkováním 1,05 a mírně staženými písmeny. Nadpisy vyvažují řádky (`text-wrap: balance`).

## Rozestupy a tvary

Stupnice rozestupů: 0,25 · 0,5 · 0,75 · 1 · 1,5 · 2,5 · 4 rem. Obsah nejvýš 72 rem široký, na krajích aspoň 1,5 rem. Zaoblení 0,5 rem (malé prvky), 1 rem (karty), 1,75 rem (tarify), tlačítka úplně kulatá. Stín karet jemný a rozmazaný.

## Rozvržení podle šířky

| | telefon (do 640 px) | tablet (od 640 px) | počítač (od 960 px) |
|---|---|---|---|
| úvod | text, pod ním telefon | totéž | text a telefon vedle sebe (od 896 px) |
| funkce | 1 sloupec | 2 sloupce | 3 sloupce |
| recenze | pod sebou | vedle sebe (od 768 px) | vedle sebe |
| ceník | pod sebou | pod sebou | 3 vedle sebe (od 896 px) |

Karta funkce: když je sama široká aspoň 20 rem, stojí ikona vlevo vedle textu, užší karta má ikonu nad textem.

## Pohyb

- Tlačítka mění barvu za 150 ms a při stisku se nepatrně zmenší.
- Nabídka „Stáhnout aplikaci" vyjede o 0,5 rem shora a prolne se, za 250 ms, stejně i zmizí.
- Karta funkce se při najetí zvedne o 4 px a zbarví se jí rámeček.
- Úvod se při načtení jemně prolne zespodu.
- Plus u otázky se při otevření otočí na křížek.
- S omezeným pohybem nic nejezdí ani nerotuje; barvy a prolínání zůstávají.
