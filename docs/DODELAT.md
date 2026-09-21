# Co v obsahu chybí

Stav k 21. 9. 2026. Zdroj: `node tools/verify.js --json` (369 modulů, 132 chyb) a
ruční průchod modulů, které projdou ověřením, ale mají místo obsahu zástupný text.

Ověření hlídá formát a spustitelnost, **ne hloubku**. Proto jsou níž dvě různé věci:
*rozbité* (ověření je najde) a *prázdné* (ověření projde, obsah tam ale není).

Jak poznat prázdný modul: soubory kolem 350–550 bajtů, uvnitř zmršená značka
`</--description-->` místo `# --description--`, nebo jediný krok workshopu.

```sh
grep -rl '</--description-->' content/    # zástupné kroky
node tools/verify.js content/<sekce>      # jedna sekce
```

## Sekce, které stojí za to dokončit nejdřív

Jsou skoro hotové — chybí v nich jen uzávěr, takže je rychle zavřeš.

| sekce | co chybí |
|---|---|
| `html-zaklady` | kvíz, `cards.md`, `tahak.md`, kroky 001–020 `workshop-recept`, kroky 001–022 `workshop-blog`, `# --approaches--` v `lab-profil` |
| `start-nastroje` | `github-a-pages`, kvíz, `projekt-profil-na-githubu`, `cards.md`, `tahak.md`, kroky 001–012 `workshop-prvni-repozitar` |
| `html-formulare` | `section.json`, kvíz, `lab-kontaktni-formular`, `validace-v-prohlizeci` (615 slov) |
| `api-http-rest` | `lab-api-ukolu` (rozbitý frontmatter), kvíz, `tahak.md` |
| `nastroje-devtools-vykon` | `lab-audit-vykonu`, kvíz, `cards.md`, pojmy, 4 kroky `workshop-zrychleni` |
| `nastroje-testovani` | `workshop-refaktoring` (1 krok), `lab-testy-validatoru`, kvíz |
| `css-pozicovani` | kroky 016–018 `workshop-lepici-lista` (jinak hotová sekce) |
| `css-efekty-animace` | `vykon-a-pristupnost-animaci`, `lab-scroll-pribeh`, kvíz, `cards.md` |
| `css-tailwind` | `theme-a-tokeny`, `responzivita-a-stavy`, `komponenty-bez-duplicit`, `lab-prestavba-podle-navrhu`, kvíz + krok 006 `workshop-motiv-znacky` (řešení neprojde testem) |
| `nasazeni-provoz` | `section.json`, `lab-kontrolni-bod-5` (prázdný) |

## Sekce, kde chybí skoro všechno

| sekce | stav |
|---|---|
| `js-algoritmy` | 8 modulů, všechny zástupné |
| `kariera-pohovor` | 9 modulů, všechny zástupné |
| `prace-s-ai` | 6 modulů, všechny tenké (360–880 slov) |
| `vue-nuxt-druhy-framework` | 7 modulů, všechny zástupné |
| `api-soubory-realtime` | 7 modulů, všechny zástupné |
| `prohlizec-navic` | `web-components` zástupný, zbytek sekce neexistuje |
| `nastroje-cizi-kod` | 7 modulů: obsah leží ve špatném tvaru (`<modul>.md` vedle sebe místo `<modul>/lesson.md`), chybí `module.json` |
| `sql-databaze` | hotové 4 moduly, podle osnovy chybí 7 (`transakce-a-indexy`, `okenni-funkce`, `orm-drizzle`, `postgres-v-dockeru`, `lab-eshop-dotazy`, kvíz, `projekt-api-receptu`) + `tahak.md` |
| `auth-bezpecnost` | hotové 4 moduly, chybí `section.json`, `cards.md`, `pojmy.md`, `tahak.md`, `module.json` u `owasp-zranitelnosti` a 4 moduly (`workshop-oprav-zranitelnosti`, `auth-v-praxi`, `lab-role-a-opravneni`, kvíz) |

## Osiřelé adresáře

Nejsou v žádném `section.json`, takže je ověření přeskakuje. Buď je doplň do sekce,
nebo smaž — teď jen matou.

```
api-soubory-realtime/lab-fronta-uloh, api-soubory-realtime/workshop-fotky-inzeratu
css-kaskada/lab-motiv-formulare, css-kaskada/specificita
js-async/fetch-a-api, js-async/soubeh-a-zruseni, js-async/stavy-nacitani-a-chyb,
js-async/lab-datoborce, js-async/workshop-vyhledavac-receptu,
js-async/workshop-zpracovani-objednavek
js-chyby-ladeni/systematicke-ladeni, js-chyby-ladeni/try-catch-a-propagace,
js-chyby-ladeni/lab-ladeni-cizi-appky, js-chyby-ladeni/lab-oprav-3-chyby,
js-chyby-ladeni/workshop-robustni-kalkulacka
nastroje-testovani/lab-kontrolni-bod-3, nastroje-testovani/projekt-rozpoctovac
prohlizec-navic/* (7 adresářů)
vue-nuxt-druhy-framework/workshop-prehravac-podcastu
```

Navíc v `content/` leží dva generátory, které tam nepatří: `css-kaskada/generate_all.js`
a `prace-s-ai/gen.js`.

## Opakované vady formátu

Projdou v jedné sekci a pak se stejně opakují ve všech zástupných modulech:

- **karta `free` má `### --expected--`** místo `### --back--` (kontrakt kap. 2.5) —
  `html-zaklady`, `start-nastroje`, `css-efekty-animace`, `js-algoritmy`,
  `kariera-pohovor`, `nastroje-cizi-kod`, `nastroje-devtools-vykon`, `prace-s-ai`
- **kvíz začíná textem** před prvním `## --question--` (kontrakt kap. 4.3)
- **`:::live` vnořený v `:::check`** — bloky se nevnořují (kontrakt kap. 5.1) —
  `api-soubory-realtime`, `vue-nuxt-druhy-framework`, `prohlizec-navic`
- **pojem „pojem"** ze šablony kolidují tři sekce navzájem
- **`# --approaches--` s textem mimo `## --approach--`** (kontrakt kap. 3.8)

## Psaní nového obsahu

Závazné je `docs/kontrakt.md` (formát) a `docs/styl-obsahu.md` (jak psát). Kapitoly,
na které se nejčastěji zapomíná: **17** (poučení z pilotů), **18** (aby to bavilo),
**19** (pojmenované podcíle, ukázka → doplňování → od nuly, promíchaná látka v kvízu,
volné vysvětlení).

Po dopsání sekce: `node tools/verify.js content/<sekce>` musí projít bez chyb.
