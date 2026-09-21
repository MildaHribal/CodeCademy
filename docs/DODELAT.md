# Stav obsahu

Stav k 21. 9. 2026. Ověřeno `node tools/verify.js` nad celým `content/`.

**Kurz je kompletní: 48 sekcí, všech 403 modulů projde ověřením bez chyby.**
Osnova (`docs/osnova.md`, `content/osnova.json`) a obsah na disku spolu souhlasí.

| | |
|---|---|
| sekce | 48 (44 jádro, 4 rozšíření) |
| moduly | 192 lekcí · 89 workshopů · 64 labů · 47 kvízů · 11 projektů |
| kroky workshopů | 1 607 |
| odhad času | ~409 hodin |
| chyby ověření | **0** |
| varování | 13 (samé `[K3]`, všechna záměrná — viz níž) |

Jak si to ověřit:

```sh
node tools/verify.js                      # celý kurz (trvá pár minut)
node tools/verify.js content/<sekce>       # jedna sekce
npm run overit -- --doporuceni             # i doporučení
npm test                                   # unit testy (563 zelených)
node tools/e2e.js                          # kouřový test aplikace v prohlížeči
```

## Pedagogické pokrytí

Čtyři techniky z kapitoly 19 `docs/styl-obsahu.md` jsou pokryté takhle:

| technika | pokrytí |
|---|---|
| otázka předem (`:::check pretest`) | **192 z 192 lekcí** |
| vlastní vysvětlení (`:::explain`) | **192 z 192 lekcí** |
| předpověď (`:::live … predict`) | 188 z 192 lekcí |
| otázky na konci (`# --questions--`) | 192 z 192 lekcí |

Typy kroků ve workshopech: 180× `recall`, 152× `debug`, 77× `parsons`, 77× `choose`.

## Záměrná varování `[K3]`

Pravidlo K3 hlídá, že seed kroku N odpovídá řešení kroku N−1 — tedy že se studentovi
mezi kroky neztratí rozepsaná práce. Třináct zbylých varování je po kontrole v pořádku:

- **`js-dom/workshop-objednavka`** (5×) — krok si do HTML doplňuje připravenou značku
  (`disabled` u tlačítka) nebo přidává prvek, na kterém bude student pracovat. Nic se
  neztrácí; dřív se tady ztrácelo, viz commit „workshop s objednávkou přestal mezi kroky
  zahazovat rozepsaný kód".
- **`nastroje-typescript/workshop-api-klient`** (4×) — kroky `kind: parsons` mají
  z podstaty prázdnou oblast `--edit--`, protože student funkci skládá znovu.
- **`nastroje-devtools-vykon/workshop-zrychleni`** (2×) — každý krok je jiný výkonnostní
  problém na jiné ukázkové stránce, takže se soubory záměrně vyměňují.
- **`css-tailwind/workshop-landing-sekce`** (1×) — prázdná značka z minulého kroku se
  naplní obsahem, který bude student stylovat.

Kdyby ses do některého z nich pouštěl, kontrola, jestli se něco **ztrácí** (a ne jen
přibývá), se dá udělat porovnáním řešení kroku N−1 se seedem kroku N po odstranění
značek `--edit--`.

## Náměty, které v kurzu nejsou

Nic z toho ověření nehlásí — jsou to věci nad rámec osnovy:

- **`prohlizec-navic/projekt-offline-poznamky`** — plánovaný projekt (poznámky
  v IndexedDB, service worker, manifest, synchronizace po připojení). Sekci teď uzavírá
  `lab-cache-strategie`; projekt zůstává jako námět.
- **Doporučení z ověření** (`npm run overit -- --doporuceni`, aktuálně 174). Nejčastější:
  část lekce bez `:::check`, kvíz bez poloviny psaných otázek, málo odkazů `--see--` do
  dřívějších sekcí. Nic z toho nebrání použití, jen by to obsah dál zlepšilo.

## Pravidla, na která se při psaní nejčastěji zapomíná

Závazné je `docs/kontrakt.md` (formát) a `docs/styl-obsahu.md` (jak psát). Kapitoly,
na které se nejčastěji zapomíná: **17** (poučení z pilotů), **18** (aby to bavilo),
**19** (pojmenované podcíle, ukázka → doplňování → od nuly, promíchaná látka v kvízu,
volné vysvětlení).

Co se osvědčilo při dopisování:

- **Kroky workshopu vysázet generátorem.** Stránka roste po kouscích a každý kousek má
  číslo kroku, od kterého je hotový; seed kroku N je pak automaticky řešení kroku N−1.
  Ušetří to opisování celého HTML do dvaceti souborů.
- **Generátor musí umět čtyři zpětné apostrofy.** Soubor, který sám obsahuje blok kódu
  (typicky `README.md` nebo `CONTRIBUTING.md`), se ve zdroji kroku sází `````` ```` ``````,
  ne `````` ``` ``````. Regulární výraz, který hledá jen tři, takový soubor tiše zkrátí
  na první vnitřní plot — a pozná se to až podle varování `[K3]` o pár kroků dál.
- **Seed kroku smí navíc mít prázdnou oblast `--edit--` / `--edit--`.** Při kontrole
  návaznosti (K3) se značky ignorují, takže `seed(N) = solution(N−1) + prázdná oblast`
  je správný tvar. Kdo do seedu přidá i kostru nové funkce, dostane varování.
- **Přístup v `# --approaches--` musí dodat celou sadu souborů.** Slučuje se se
  **seedem**, ne s řešením — takže když přístup mění jen `script.js`, zbytek si vezme
  z prázdné kostry a testy spadnou.
- **Tip nesmí obsahovat řádek řešení.** Pravidlo T1 porovnává tipy s řádky řešení,
  takže `` `<figure>` `` v tipu je chyba, i když je to jen zmínka. Piš `figure` bez
  lomených závorek. Nejvýš 3 tipy na krok, 2 na lab a projekt.
- **Karta `free` má `### --back--`**, ne `### --expected--`. Karta `output` s jedním
  blokem `js` se opravdu spustí a výstup se porovná — na otázku, kde se nic nevypisuje,
  patří `free`.
- **Kotva se tvoří bez diakritiky a bez podtržítek.** Z nadpisu „Pořadí: ROW_NUMBER,
  RANK a DENSE_RANK" vznikne `poradi-rownumber-rank-a-denserank`. Kotva je povolená
  jen u lekce, ne u workshopu, labu ani kvízu.
- **Pojmy jsou jedinečné napříč celým kurzem** (pravidlo S5, kolize je chyba). Před
  přidáním: `grep -rh '^## --term--' content/*/pojmy.md | sort`. Totéž platí pro aliasy.
- **Stavy jako `:user-invalid` se v testech nedají vyvolat skriptem** — kontroluj zdroj
  stylopisu přes `files['styles.css']`.
- **Runner vkládá stylopis do stránky sám**, takže `<link rel="stylesheet">` v DOM
  nenajdeš. Na to je taky `files['index.html']`.
- **Na animovanou pozici čekej na cílovou hodnotu, ne na ustálení.** Iframe runneru
  nemaluje každých 60 ms, takže dva stejné vzorky po sobě neznamenají, že je animace
  u konce — znamenají, že ještě nezačala. Piš
  `await helpers.waitFor(() => odsazeni() - predtim >= 18, 3000)`.
- **Test na „uvolnilo se hlavní vlákno" nedělej přes `setTimeout`.** `scheduler.yield()`
  se před čekající timery předbíhá. Spolehlivější je zkusit, jestli je promise po
  dvou stech mikroúlohách pořád nevyřízená.
- **Node 26 vypisuje testy reportérem `spec`, ne v TAP.** Počet testů se z výstupu čte
  jako `ℹ tests 12`, ne `# tests 12` — regulární výraz musí zvládnout obojí.
- **Testy piš tak, aby prošel i jiný rozumný postup.** Když požadavek zní „styl odkazu",
  hledej ho v `index.html` **i** v `style.css` — jinak sestřelíš vlastní `# --approaches--`.

Po dopsání sekce: `node tools/verify.js content/<sekce>` musí projít bez chyb.
