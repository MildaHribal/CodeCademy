# Zadání pro DeepSeek — dokončení sekcí Akademie

Vlož do `claude-local` celé jako první zprávu. Na konec doplň, kterou sekci má dělat.

---

Pracuješ v repozitáři `/home/karel/akademie` (git, větev `main`). Máš nástroje bash,
read_file, write_file, edit_file, grep a list_files. Používej je, nic si nevymýšlej.

## O co jde

Akademie je lokální interaktivní kurz webového vývoje v češtině ve stylu freeCodeCampu.
Student otevře modul v prohlížeči, píše kód v editoru vedle zadání a klikne na „Zkontrolovat".
O tom, jestli krok splnil, rozhodnou testy uložené v obsahu. **Není to hra** — žádné body
ani příběh. Student je junior: weby zatím stavěl s AI a neumí vysvětlit, proč fungují.
Píšeš pro něj.

Platforma je hotová. **Ty píšeš jen obsah** — Markdown a JSON v `content/<sekce>/`.
Do `client/`, `server/`, `shared/`, `tools/` ani `docs/` nesahej.

## Než napíšeš první řádek, přečti si

1. `docs/prompty/07-css-efekty-animace.md` — vzorové zadání jedné sekce. Pravidla v něm platí
   pro každou sekci: struktura, formát kroků, co musí mít každý typ modulu, chyby,
   kterých se vyvarovat.
2. `docs/styl-obsahu.md` — jak psát.
3. `docs/kontrakt.md` — přesný formát souborů. Je dlouhý, čti ho po částech
   (`read_file` s `offset`) a vždy tu část, kterou právě potřebuješ.
4. Svoji sekci v `docs/osnova.md` (najdi ji přes `grep -n "<sekce>" docs/osnova.md`)
   a v `content/osnova.json`.
5. Jednu hotovou sekci jako vzor kvality, např. `content/js-funkce/` nebo `content/css-grid/`.

## Nedokončené sekce

html-zaklady, start-nastroje, html-formulare, css-tailwind, css-efekty-animace,
nastroje-git-terminal, nastroje-devtools-vykon, nastroje-testovani, nastroje-cizi-kod,
prace-s-ai, js-algoritmy, vue-nuxt-druhy-framework, api-http-rest, sql-databaze,
auth-bezpecnost, nasazeni-provoz, api-soubory-realtime, prohlizec-navic, kariera-pohovor

Většina je rozepsaná, část práce už na disku je. **Nezačínej od nuly — nejdřív zjisti stav:**

```sh
git status --short content/<sekce>
ls content/<sekce> content/<sekce>/*/
npm run overit -- --concurrency 2 content/<sekce>
```

Pak porovnej moduly na disku s osnovou a dopiš, co chybí. Hotové a funkční moduly nepřepisuj.

## Jak postupovat

1. **Jedna sekce najednou.** Dokud sekci nedokončíš, drž `section.json` přejmenovaný na
   `section.json.wip` — rozepsaná sekce jinak shodí celou aplikaci.
2. Piš modul po modulu. Po každém modulu spusť `npm run overit -- --concurrency 2 content/<sekce>`
   a oprav chyby hned, ne až na konci.
3. Každý krok workshopu piš ručně: jeden krok = jedna nová věc, skutečný kód a testy, které
   měří chování. Testy musí nad výchozím kódem (seed) **selhat** a nad řešením **projít**.
4. Když je sekce hotová: vrať `section.json.wip` → `section.json`, spusť kontrolu znovu
   (musí být **0 chyb a 0 varování**) a pak commitni:
   ```sh
   git add content/<sekce> && git commit -m "Sekce <sekce>: dopsaná a zrecenzovaná"
   ```
   Commit bez jakékoli zmínky o AI a bez `Co-Authored-By`.

## Tvrdá pravidla

- **Negeneruj kroky skriptem.** Výplň typu „Text", `a === 2` nebo `// kód…` projde kontrolou,
  ale je to odpad a celá sekce se pak zahazuje.
- Výklad česky, tykání, věcně (bez „super", vykřičníků a smajlíků). **Kód anglicky** —
  žádné `teplotaFahrenheit`.
- Nemaž ani nepřepisuj cizí rozepsanou práci v jiných sekcích (`git status` ukazuje
  neuložené změny i jinde — ty nech být).
- `[[pojem]]` jen pro pojmy, které jsou v `pojmy.md` té sekce. Odkazy `see:` jen na sekce,
  které existují na disku.
- Nenechávej v `content/` pomocné skripty.
- Když si nejsi jistý API knihovny, ověř ho přes web_search/web_fetch v aktuální dokumentaci.

## Na konci nahlas

1. Které moduly jsi napsal nebo opravil (počty kroků, otázek).
2. Přesný výstup `npm run overit -- --concurrency 2 content/<sekce>`.
3. Co zůstalo nedodělané a proč.

**Tvoje sekce:** <SEM NAPIŠ SLUG, např. html-zaklady>
