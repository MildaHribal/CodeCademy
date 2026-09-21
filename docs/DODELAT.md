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

## Hotovo (projde ověřením bez chyb i varování)

`html-zaklady`, `start-nastroje`, `html-formulare`, `auth-bezpecnost`, `nasazeni-provoz`
— plus sekce, které byly hotové už dřív (CSS, JavaScript, React, Node, API, SQL).

U `auth-bezpecnost` a `nasazeni-provoz` platí, že jsou hotové **v rozsahu, který na disku
je** — podle osnovy jim pořád chybí moduly (viz níž).

## Sekce, kde chybí jen dokončení

| sekce | co chybí |
|---|---|
| `api-http-rest` | `lab-api-ukolu` (rozbitý frontmatter), kvíz je tenký (491 slov), `tahak.md` |
| `nastroje-devtools-vykon` | pojmy sekce, `cards.md`, `lab-audit-vykonu`, kvíz, kroky 001–004 `workshop-zrychleni` |
| `nastroje-testovani` | `workshop-refaktoring` (1 krok na 45 minut, navíc `foo`-styl názvy), `lab-testy-validatoru` (403 slov), kvíz (350 slov) |
| `css-efekty-animace` | `vykon-a-pristupnost-animaci`, `lab-scroll-pribeh`, kvíz, `cards.md`, `tahak.md` |
| `css-tailwind` | `theme-a-tokeny`, `responzivita-a-stavy`, `komponenty-bez-duplicit`, `lab-prestavba-podle-navrhu`, kvíz + krok 006 `workshop-motiv-znacky` (řešení neprojde testem) |
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

## Známá vada v runneru: Tailwind a `translate-*`

`react-ui-knihovny/workshop-pristupne-komponenty` krok 012 neprojde vlastním řešením.
Co je ověřené:

- pravidlo `data-[state=checked]:translate-x-5` **se použije** — `--tw-translate-x`
  má správnou hodnotu `calc(0.25rem * 5)`,
- `--tw-translate-y` je `0`,
- spočítaná vlastnost `translate` přesto zůstane `0px`, takže se puntík nepohne,
- s libovolnou hodnotou (`translate-x-[1.25rem]`) je to stejné, takže nejde o výpočet
  z `--spacing`,
- ostatní utility na tomtéž prvku (`size-5`) fungují.

Vypadá to, že `@tailwindcss/browser` v runneru vydá jen vlastní vlastnost
`--tw-translate-x`, ale ne samotnou deklaraci `translate`. Při prvním ověření
21. 9. 2026 modul ještě procházel, takže se to rozbilo někde mezi verzemi nebo
v sestavení knihoven (`node tools/build-vendor.js`). **Obsah kroku je v pořádku,
opravit je potřeba runner nebo verzi Tailwindu.**

## Vada v pořadí kurzu

`html-formulare` je na doporučené trase pátá, ale `workshop-objednavka` v ní používá
`addEventListener`, `FormData`, `checkValidity()` a `setCustomValidity()` — tedy DOM,
který se učí až v `js-dom` (21. na trase). Buď ten workshop přesunout, nebo ho přepsat
bez JavaScriptu a DOM verzi zařadit do `js-dom`. Ostatní moduly sekce JavaScript
nepotřebují.

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
  `css-efekty-animace`, `js-algoritmy`, `kariera-pohovor`, `nastroje-cizi-kod`,
  `nastroje-devtools-vykon`, `prace-s-ai`
- **kvíz začíná textem** před prvním `## --question--` (kontrakt kap. 4.3). Kdo bude
  převádět kvíz ze zápisu `[x]`/`[ ]`/`--why--`, najde hotový převodník v historii
  commitu, který opravoval `nasazeni-provoz/kviz`.
- **`:::live` vnořený v `:::check`** — bloky se nevnořují (kontrakt kap. 5.1) —
  `api-soubory-realtime`, `vue-nuxt-druhy-framework`, `prohlizec-navic`
- **pojem „pojem"** ze šablony kolidují tři sekce navzájem
- **`# --approaches--` s textem mimo `## --approach--`** (kontrakt kap. 3.8)
- **pojmy sekce jako obyčejný markdownový seznam** místo bloků `## --term--`

## Psaní nového obsahu

Závazné je `docs/kontrakt.md` (formát) a `docs/styl-obsahu.md` (jak psát). Kapitoly,
na které se nejčastěji zapomíná: **17** (poučení z pilotů), **18** (aby to bavilo),
**19** (pojmenované podcíle, ukázka → doplňování → od nuly, promíchaná látka v kvízu,
volné vysvětlení).

Pár věcí, které se osvědčily při dopisování workshopů:

- **Kroky vysázet generátorem.** Stránka roste po kouscích a každý kousek má číslo
  kroku, od kterého je hotový; seed kroku N je pak automaticky řešení kroku N−1.
  Ušetří to opisování celého HTML do dvaceti souborů.
- **Tip nesmí obsahovat řádek řešení.** Pravidlo T1 porovnává tipy s řádky řešení,
  takže `` `<figure>` `` v tipu je chyba, i když je to jen zmínka. Piš `figure` bez
  lomených závorek.
- **`:user-invalid` a podobné stavy se v testech nedají vyvolat skriptem** — kontroluj
  zdroj stylopisu přes `files['styles.css']`.
- **Runner vkládá stylopis do stránky sám**, takže `<link rel="stylesheet">` v DOM
  nenajdeš. Na to je taky `files['index.html']`.

Po dopsání sekce: `node tools/verify.js content/<sekce>` musí projít bez chyb.
