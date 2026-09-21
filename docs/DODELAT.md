# Co v obsahu chybí

Stav k 21. 9. 2026. Zdroj: `node tools/verify.js --json` a ruční průchod modulů, které
ověřením projdou, ale mají místo obsahu zástupný text.

Ověření hlídá formát a spustitelnost, **ne hloubku**. Proto jsou níž dvě různé věci:
*rozbité* (ověření je najde) a *prázdné* (ověření projde, obsah tam ale není).

Jak poznat prázdný modul: soubory kolem 350–550 bajtů, uvnitř zmršená značka
`</--description-->` místo `# --description--`, nebo jediný krok workshopu.

```sh
grep -rl '</--description-->' content/    # zástupné kroky
node tools/verify.js content/<sekce>      # jedna sekce
```

## Hotovo

Bez chyb i varování ověření procházejí: `html-zaklady`, `start-nastroje`,
`html-formulare`, `api-http-rest`, `nastroje-devtools-vykon`, `css-efekty-animace`,
`css-tailwind`, `auth-bezpecnost`, `nasazeni-provoz` — plus sekce, které byly hotové
už dřív (zbytek CSS, JavaScript, React, Node, SQL).

U `auth-bezpecnost`, `nasazeni-provoz` a `sql-databaze` platí, že jsou hotové
**v rozsahu, který na disku je** — podle osnovy jim pořád chybí moduly (viz níž).

## Sekce, kde chybí jen dokončení

| sekce | co chybí |
|---|---|
| `nastroje-testovani` | `workshop-refaktoring` (1 krok na 45 minut, navíc `foo`-styl názvy a CommonJS), `lab-testy-validatoru` (403 slov), kvíz (350 slov) |
| `nasazeni-provoz` | `lab-kontrolni-bod-5` (adresář bez `lab.md`, zatím mimo `section.json`) |
| `auth-bezpecnost` | `workshop-oprav-zranitelnosti`, `auth-v-praxi` (OAuth, passkeys), `lab-role-a-opravneni`, kvíz, `tahak.md` |
| `sql-databaze` | `transakce-a-indexy`, `okenni-funkce`, `orm-drizzle`, `postgres-v-dockeru`, `lab-eshop-dotazy`, kvíz, `projekt-api-receptu`, `tahak.md` |

## Sekce, kde chybí skoro všechno

| sekce | stav |
|---|---|
| `js-algoritmy` | 8 modulů, všechny zástupné |
| `kariera-pohovor` | 9 modulů, všechny zástupné |
| `prace-s-ai` | 6 modulů, všechny tenké (360–880 slov) |
| `vue-nuxt-druhy-framework` | 7 modulů, všechny zástupné |
| `api-soubory-realtime` | 7 modulů, všechny zástupné |
| `prohlizec-navic` | `web-components` zástupný, zbytek sekce na disku není |
| `nastroje-cizi-kod` | 7 modulů: obsah leží ve špatném tvaru (`<modul>.md` vedle sebe místo `<modul>/lesson.md`), chybí `module.json`; `workshop-feature-v-cizim-projektu` má 11 hotových kroků a 4 zástupné (012–015) |

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

## Opakované vady formátu

Projdou v jedné sekci a pak se stejně opakují ve všech zástupných modulech:

- **karta `free` má `### --expected--`** místo `### --back--` (kontrakt kap. 2.5) —
  `js-algoritmy`, `kariera-pohovor`, `nastroje-cizi-kod`, `prace-s-ai`
- **kvíz v nekontraktním zápisu** — buď `[x]`/`[ ]`/`--why--`, nebo `<Otázka>`, nebo
  bullety s „(správně)". Hotové převodníky na všechny tři tvary jsou v historii commitů,
  které opravovaly `nasazeni-provoz/kviz`, `api-http-rest/kviz` a `css-tailwind/kviz`.
- **zmršené značky `<--sekce-->` / `</--sekce-->`** místo `# --sekce--`, občas i se
  zbytkem promptu generátoru v souboru (`</Agent System Instructions>`)
- **`:::live` vnořený v `:::check`** — bloky se nevnořují (kontrakt kap. 5.1) —
  `api-soubory-realtime`, `vue-nuxt-druhy-framework`, `prohlizec-navic`
- **pojem „pojem"** ze šablony kolidují tři sekce navzájem
- **pojmy sekce jako obyčejný markdownový seznam** místo bloků `## --term--`
- **`lekce:` u pojmu bez prefixu sekce** nebo s kotvou, která v lekci není

## Psaní nového obsahu

Závazné je `docs/kontrakt.md` (formát) a `docs/styl-obsahu.md` (jak psát). Kapitoly,
na které se nejčastěji zapomíná: **17** (poučení z pilotů), **18** (aby to bavilo),
**19** (pojmenované podcíle, ukázka → doplňování → od nuly, promíchaná látka v kvízu,
volné vysvětlení).

Co se osvědčilo při dopisování:

- **Kroky workshopu vysázet generátorem.** Stránka roste po kouscích a každý kousek má
  číslo kroku, od kterého je hotový; seed kroku N je pak automaticky řešení kroku N−1.
  Ušetří to opisování celého HTML do dvaceti souborů.
- **Přístup v `# --approaches--` musí dodat celou sadu souborů.** Slučuje se se
  **seedem**, ne s řešením — takže když přístup mění jen `script.js`, zbytek si vezme
  z prázdné kostry a testy spadnou.
- **Tip nesmí obsahovat řádek řešení.** Pravidlo T1 porovnává tipy s řádky řešení,
  takže `` `<figure>` `` v tipu je chyba, i když je to jen zmínka. Piš `figure` bez
  lomených závorek.
- **Stavy jako `:user-invalid` se v testech nedají vyvolat skriptem** — kontroluj zdroj
  stylopisu přes `files['styles.css']`.
- **Runner vkládá stylopis do stránky sám**, takže `<link rel="stylesheet">` v DOM
  nenajdeš. Na to je taky `files['index.html']`.
- **Test na „uvolnil se hlavní vlákno" nedělej přes `setTimeout`.** `scheduler.yield()`
  se před čekající timery předbíhá. Spolehlivější je zkusit, jestli je promise po
  dvou stech mikroúlohách pořád nevyřízená.
- **Na animovanou pozici čekej na cílovou hodnotu, ne na ustálení.** Iframe runneru
  nemaluje každých 60 ms, takže dva stejné vzorky po sobě neznamenají, že je animace
  u konce — znamenají, že ještě nezačala. Piš
  `await helpers.waitFor(() => odsazeni() - predtim >= 18, 3000)`.
- **Testy piš tak, aby prošel i jiný rozumný postup.** Když požadavek zní „styl odkazu",
  hledej ho v `index.html` **i** v `style.css` — jinak sestřelíš vlastní `# --approaches--`.

Po dopsání sekce: `node tools/verify.js content/<sekce>` musí projít bez chyb.
