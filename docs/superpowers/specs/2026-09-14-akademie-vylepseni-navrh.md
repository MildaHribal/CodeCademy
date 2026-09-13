# Akademie: jak z pěti výzkumů udělat jeden plán

**Stručně:** obsah tří pilotních sekcí je věcně kvalitní. Kurz ale zatím učí jen jedním způsobem: přečti, opiš, zkontroluj. Chybí tři věci, na kterých se shodlo víc výzkumníků:
1. **Opakování s odstupem** (vybavování z paměti po dnech a týdnech). Teď se každá otázka i krok udělá jednou.
2. **Pomoc, když se student zasekne.** Nemá nápovědy, řešení ani srozumitelnou chybu.
3. **Úkoly, kde musí sám přemýšlet.** Předpověď výstupu, oprava chyby, vysvětlení vlastními slovy.

K tomu osnova nesedí na cíl „sehnat práci": chybí React, Git a nasazení přicházejí pozdě, chybí algoritmy, práce v cizím kódu a kariéra.

**Co jsem si ověřil v kódu** (nic v repu jsem neměnil):
- Klient nikde nevolá `?solution=1`, takže řešení se v UI nedá zobrazit.
- V obsahu je 230 volání `assert.equal/deepEqual`, z toho zhruba 100 bez české zprávy. Výzkumníci psali 92, vyšlo mi 106.
- `runNodeFile` spuštěný server po 5 s ukončí a hlásí „nekonečná smyčka?".
- `question.js` hned po první špatné odpovědi ukáže správnou odpověď.
- V `base.css` je `JetBrains Mono` bez vypnutých ligatur (`===` se kreslí jako ≡) a jen `color-scheme: light`.
- Lekce `co-je-pole` má výstupy napsané v komentářích (`// [1, 2, 3, 4] — změnilo se i a`).
- `@codemirror/lint` je v node_modules jen nepřímo. Sucrase (pro React) tam není. Obojí musí přidat koordinátor, protože kap. 11 kontraktu agentům zakazuje instalovat balíčky.
- Kap. 11 zakazuje zmiňovat AI „v kódu, komentářích, textech". To se přímo týká navrhované sekce o práci s AI, proto je to otázka E2.

**Značení:** přínos pro učení 1–5 · pracnost S/M/L · typ = platforma / kontrakt / osnova / příručka.

---

## Jak jsem rozhodl sporné body

| Spor | Rozhodnutí | Důvod |
|---|---|---|
| Plánování opakování: Leitner, nebo SM-2 se 4 tlačítky | **Leitner** (1→3→7→16→35→90 dní) a k tomu jistota odpovědi | Odpovědi hodnotí stroj. Junior svou znalost přeceňuje, takže tlačítka „Snadno/Těžké" by zkreslil. Leitner je jednodušší na implementaci i na pochopení. |
| Tři různé formáty nápověd (`--help/--level`, `--stuck--`, `--tip--`, `> nápověda:`) | Jeden formát: `# --help--` s bloky `## --tip--`. Poslední stupeň vždy dodá platforma jako diff s řešením. | Jeden formát pro autory. Pořadí tipů je závazné (koncept → kde → vzor na jiných datech). |
| Nápověda odemčená až po 60 s nebo 8 min | **Bez časových zámků.** Tlačítko je vidět vždy, po 2 neúspěšných kontrolách se zvýrazní. | Uživatel nechce nic zamykat. Aktivní nabídka po neúspěchu stačí (Price 2017). |
| Předpověď: `:::predict`, `--predict--` nebo `:::live predict` | **Jeden model otázky s psanou odpovědí** (`--expected--`), použitelný v `:::check`, v kvízu i v kartách. Živá ukázka dostane režim `predict`. | Jeden parser i jedna komponenta. Verify ověří, že `--expected--` odpovídá skutečnému běhu. |
| `--explain--`, `--reflect--` a poznámky | **`# --explain--`** v kroku a `:::explain` v lekci s částmi `--model--` a `--checklist--`. Ukládá se do poznámek. | Jde o jednu dovednost (vysvětlit vlastními slovy) a jedno úložiště. |
| Vlastní překryvy flex/grid a box modelu v náhledu | **Nestavět teď.** Místo nich: náhled v šířce testů, kód dohledatelný v DevTools, náhled v nové kartě, ovládací prvky v ukázkách a upozornění na neaktivní CSS. | DevTools to umí dobře a má se ho naučit. Zvláštní klon v náhledu je drahý. |
| Karty opakování: `cards.md` v sekci, nebo `# --cards--` v lekci | **`content/<sekce>/cards.md`** | Jedno místo na sekci, autor sekce nekoliduje s autorem lekce. |
| Glosář: jeden `slovnik.md`, nebo `pojmy.md` po sekcích | **Po sekcích**, server je sloučí | Paralelní agenti si nebudou přepisovat soubor. |
| Nový modul `rebuild` s `afterDays` | **Režim platformy „Postavit znovu naslepo"** nad hotovým krokem, workshopem nebo labem | Autor nemusí nic psát, testy už existují. |
| Modul `review` s komentáři k řádkům | **Nedělat.** Pokryjí to kroky `kind: debug`, lab `lab-code-review` s testy a kvíz nad delším kódem. | Párování komentářů k řádkům je drahé a přínos je podobný. |
| Opakovací kvíz typu `review` na konci části | **Nahrazuje ho fronta opakování** a laboratoř `lab-kontrolni-bod` na konci části | Nedělat totéž dvakrát. |
| Zvlášť `:::pattern` a stránka „Vzory" | **Vzory patří do `tahak.md`** | YAGNI. |
| Úložiště | Nová data do **samostatných souborů** v `data/` přes `createJsonStore` | `progress.json` se teď při každém splnění vrací celý, i s kódem všech kroků. |

**Vyřazeno (YAGNI nebo malý přínos na velkou práci):**
- přehrávač kódu `:::replay`,
- plánovač hodin `#/plan`,
- varianty otázek `--variant--` (nahradí je fronta opakování),
- offline zrcadlo MDN,
- export „Co umím" pro CV (bude součástí sekce kariéra),
- kliknutí na chybný řádek `--bug--`,
- `--misconception--` u psaných odpovědí (stačí `--why--` a volitelné `--accept--`).

---

## A) Formát obsahu a příručka (hotové PŘED psaním dalších sekcí)

**A1. Jeden model otázky s psanou odpovědí** · přínos 5 · S · kontrakt kap. 4
- Otázka bez `--answer--` má `### --expected--`, volitelně `### --accept--` (další přijatelné tvary) a `### --why--`.
- Porovnává se po normalizaci: mezery, `'` vs `"`, koncový `;`.
- Stejný formát platí v kvízu, v bloku `:::check` (A2) a v kartách (A5).
- Jistotu odpovědi (B6) platforma přidá sama, v obsahu nic není.

**A2. `:::check` kdekoli v lekci a otázky „Co myslíš?" před výkladem** · přínos 4 · S · kontrakt kap. 5 + příručka
- Pravidlo: po každé části `##` jeden `:::check` k právě vysvětlenému bodu.
- Na začátek lekce 1–2 otázky předem (pretest). U nich se špatná odpověď nehodnotí, jen „Uvidíme za chvíli".
- Do splnění lekce se počítají všechny otázky.

**A3. Živá ukázka v režimu předpovědi** · přínos 5 · M · kontrakt kap. 5
```
:::live js predict
…kód…
--question-- Co vypíše console.log?
--expected-- 4
--why-- b není kopie…
:::
```
- Náhled a konzole jsou skryté, dokud student nenapíše tip nebo neklikne „Nevím, ukaž". Pak se tip ukáže vedle skutečnosti a kód jde upravovat.
- Pro dom: `--option--` / `--option*--` (hvězdička = správně).
- Pro node: `--output--` napsané autorem, nic se nespouští.
- Verify u js ověří, že `--expected--` sedí na skutečný výstup.
- Příručka: výstup nikdy nepsat do komentáře u klíčového konceptu.

**A4. Odstupňované nápovědy `# --help--`** · přínos 5 · M · kontrakt kap. 3
- Platí pro krok, lab i projekt: 2–3 bloky `## --tip--`, volitelně `## --tip-- 2` (tip patří k požadavku č. 2).
- Pořadí je závazné:
  1. jaký koncept a odkaz na nadpis lekce,
  2. která vlastnost nebo metoda a kam ji dát,
  3. vzor na jiných datech.
- Řešení nikdy není tip, poslední stupeň je diff (B2).
- Verify: **chyba**, když se řádek tipu shoduje s řádkem řešení, který v seedu není. **Varování**, když krok workshopu nemá tipy. Laby mají nejvýš 2 tipy.

**A5. `content/<sekce>/cards.md`: karty pro opakování** · přínos 5 · M · kontrakt kap. 2
- Typy karet:
  - `output`: co vypíše, psaná odpověď,
  - `code js`: `--seed--`, `--test--`, `--solution--`, spouští se runnerem,
  - `css`: napiš deklaraci,
  - `free`: pohovorová otázka s `--back--` a sebehodnocením.
- Verify: test karty `code` nad seedem selže a nad řešením projde.
- Příručka: 15–30 karet na sekci. Každá karta = jedna past nebo jeden vzor. 5–10 z nich jsou pohovorové otázky s modelovou odpovědí.

**A6. Typ kroku `kind: debug` („Oprava chyby")** · přínos 5 · S · kontrakt kap. 3 + příručka
- Seed obsahuje chybný kód. Popis má pevnou kostru: **Hlášení** / **Úkol** / čtyři kroky ladění.
- Testy: oprava funguje, zbytek se nerozbil, a varování, když student přepsal víc než ~50 % funkce.
- Chyba má pocházet z „Pastí" v lekci.
- Příručka: 1 debug krok na ~10 kroků workshopu.

**A7. Typ kroku `kind: parsons` (seřaď řádky, doplň mezery)** · přínos 4 · M · kontrakt kap. 3
- Sekce `# --parsons--` (správné pořadí), `## --distractors--` a volitelně `## --blanks--`.
- Zkontroluje se spuštěním stejných `# --hints--`.
- Ovládání myší i klávesnicí: šipky pro pořadí, Tab pro odsazení.
- Příručka: použít při prvním setkání se složitějším vzorem, pak psaní.

**A8. Vysvětli vlastními slovy: `# --explain--` a `:::explain`** · přínos 5 · S · kontrakt kap. 3/5
- Části `## --model--` (vzorové vysvětlení) a `## --checklist--`.
- Ukáže se po splnění kroku. Text se uloží do poznámek (B9), nezaškrtnuté body checklistu jdou do opakování.
- Příručka: ~1 na 5 kroků, jen u konceptů, které se vysvětlují na pohovoru.

**A9. Blok `:::memory`: ručně napsané stavy paměti** · přínos 4 · S · kontrakt kap. 5
- Tabulka „řádek → proměnné → objekty a odkazy". UI kreslí krabičky a šipky, bez instrumentace kódu.
- Je to levná první verze. Automatické krokování (B17) přijde později a formát ho pak jen doplní.

**A10. Ovládací prvky v živých ukázkách a `:::compare`** · přínos 5 · M · kontrakt kap. 5
- Blok ` ```controls `: `--justify: select(flex-start, center, space-between) = flex-start`, `range(0,5,1)`, `toggle(nowrap, wrap)`.
- Hodnoty jdou do custom properties v iframu. Vedle ovládání se živě ukazuje vygenerovaný řádek CSS.
- `:::compare` = dva náhledy vedle sebe, které se liší jedinou věcí (flow vs. flex).

**A11. Nápověda a návrat k výkladu: `see:` a kotvy** · přínos 4 · S · kontrakt kap. 3/4
- Frontmatter kroku `see: js-pole/co-je-pole#kopie-pole`, u otázky kvízu `#### --see--`. Nadpisy lekcí dostanou stabilní kotvy.
- Verify: odkaz na neexistující kotvu = chyba.
- Seed labu obsahuje prázdné kostry funkcí s JSDoc, aby nenapsané funkce nehlásily 11× ReferenceError.

**A12. Laby a projekty: plán, jiné přístupy, rubrika** · přínos 4 · S · kontrakt + příručka
- Standardní blok **Než začneš** (přeformuluj zadání, čemu se podobá, 3–7 kroků postupu, jak ověříš první příběh). Odpovědi se uloží do poznámek.
- `# --approaches--`: 2–4 alternativní řešení, zobrazí se až po splnění. Verify je spustí proti testům, tím zároveň ověří, že testy nejsou příliš přísné.
- `project.md` dostane `# --review--`: rubriku kvality, kterou testy nekontrolují (jména, duplicita, README, „co příště jinak"), a oddíl „Rozšíření bez testů".

**A13. `pojmy.md` a `tahak.md` v sekci a `outcomes` v section.json** · přínos 4 · S/M · kontrakt kap. 2
- `pojmy.md`: `## --term--`, `en:`, `aliases:`, `mdn:`, `lekce:`. V textu se píše `[[hlavní osa|hlavní ose]]`.
- Verify: neexistující pojem = chyba. Pojem použitý před sekcí, kde se vysvětluje = varování.
- `tahak.md`: tabulky, 5–10 vzorů, pasti. Žádná nová látka.
- `outcomes: [{ text, links }]` převzít z „Po sekci umíš".

**A14. Příručka, nová kapitola „Jak zařídit, aby se to naučil"** · přínos 5 · S · příručka
Kontrolovatelná pravidla s počty:
1. **Lekce:** mentální model v jedné tučné větě hurá hned za problémem. Aspoň jeden kontrastní pár a jedna ukázka „kde to nefunguje" s přesnou chybovou hláškou. Nejvýš ~400 slov mezi dvěma interaktivními prvky. Aspoň jedna předpověď u pasti. Na konci polovina otázek s psanou odpovědí a oddíl „Kde to najdeš v MDN".
2. **Zeslabování ve workshopu ve třech třetinách:**
   - přesná deklarace a příklad na jiných datech,
   - cíl a 2–3 kandidáti bez hodnoty,
   - jen výsledek nebo požadované chování.

   Příklady mají komentáře jako popisky podcílů (`// 1. poznej cestu`). První 1–2 kroky workshopu zopakují bez návodu věc z předchozí sekce.
3. **Na workshop:** 1 debug krok / 10 kroků, 1 explain / 5 kroků, Parsons u nového vzoru, 1 krok „vyber nástroj sám" (metodu nejmenovat, regex ji nevynucuje).
4. **Kvíz:** 20–30 % otázek z dřívějších sekcí téže části, jedna sada nad delším „cizím" kódem (A15), jedna otázka „najdi v anglické dokumentaci".
5. **`--why--`** pojmenuje mylnou představu („Myslíš si, že `map` kopíruje i objekty…").
6. **Každá aserce má českou zprávu se vstupem**, třeba `'sum([1, 2]) má vrátit 3'`. Skutečnou hodnotu doplní platforma (B3).
7. **Verify varuje**, když: aserce nemá zprávu, lekce nemá `:::check`, workshop nemá debug krok, víc než 50 % kroků v poslední třetině obsahuje hotový blok kódu, chybí `cards.md`.

**A15. Kvíz nad delším kódem `# --code--`** · přínos 4 · M · kontrakt kap. 4
- 1–3 soubory o 40–120 řádcích v panelu vedle otázek, jen ke čtení a s čísly řádků.
- Kód psaný jiným stylem než workshop (jiná jména, `for` místo `map`).

---

## B) Platforma: nástroje a vylepšení

Pořadí odpovídá prioritě. **B0–B12 patří do vlny 2**, zbytek se dělá podle toho, kdy ho potřebuje obsah.

**B0. Základ pro nové nástroje** · přínos 2 (umožní vše ostatní) · M
- `createJsonStore` (atomický zápis) a vlastní soubory `data/pokusy.json`, `opakovani.json`, `nastaveni.json`, `poznamky/*.md`.
- `buildContentIndex` s cache podle mtime.
- Nové routy a menu v hlavičce: Hledat · Opakování · Poznámky · Pískoviště.
- `reset` maže i pokusy a karty.

**B1. Nápovědy, když se student zasekne** · přínos 5 · M (formát A4)
- Počítání neúspěšných kontrol pro každý krok. Po 2 neúspěších se zvýrazní „Potřebuju nápovědu (1 ze 3)" a tip k selhanému požadavku se zvýrazní.
- Bez `--help--` platforma nabídne odkaz `see:` a diff (B2).

**B2. Porovnání s řešením (diff)** · přínos 4 · M
- Vlastní LCS diff po řádcích (~100 řádků kódu) s přepínačem „ignorovat bílé znaky". Řešení se načte až po kliknutí.
- **Po splnění** vždy „Jak to napsal autor — tvoje řešení je taky správné".
- **Před splněním** jen jako poslední stupeň nápovědy, s potvrzením. Krok se pak uloží jako `assisted` a za 1 den se nabídne v opakování naslepo.
- Na začátku kroku N+1 proužek „Pokračuješ autorovým řešením kroku N [rozdíl oproti tvému]".

**B3. Výsledky testů česky a vždy se skutečnou hodnotou** · přínos 5 · M
- `assert.js` a `node-harness.js` vrátí `actual` a `expected` i u asercí s vlastní zprávou. Pod zprávou autora dva řádky „Očekávám / Tvůj kód vrátil" se zvýrazněným rozdílem, u deepEqual jen lišící se klíče.
- Generované hlášky česky.
- `shared/errors-cs.js`: ~40 vzorů chyb (`Cannot read properties of undefined`, `x is not a function`, `Unexpected token '<'… JSON`, `EADDRINUSE`, `ERR_MODULE_NOT_FOUND`…). Pod každým jedna česká věta, 2–3 nejčastější příčiny a odkaz na lekci. Anglický originál zůstane pod tím.
- SyntaxError: požadavky dostanou stav „Neověřeno — kód nejde spustit" a nahoře tlačítko „Skočit na řádek N". Zmizí tak falešné „categories is not defined".
- Nenapsané funkce se sloučí do jednoho řádku. První selhaný požadavek je rozbalený.

**B4. Lint v editoru** · přínos 5 · M (koordinátor přidá `@codemirror/lint` jako přímou závislost)
- JS: acorn parse s debounce, podtržení chyby, česká hláška. Chyby za běhu z náhledu se označí na řádku.
- CSS neplatné: iframe ověří deklarace přes `CSS.supports`, podtrhne je a navrhne opravu („`gap: 24` — chybí jednotka?", „myslel jsi `center`?").
- CSS **neaktivní** (po vzoru Firefoxu): `justify-content/gap` bez flex/grid, `flex-grow` u prvku, jehož rodič není flex, `z-index/top` u `static`, `width` u inline prvku.

**B5. Fronta opakování `#/opakovani`** · přínos 5 · L
- Zdroje:
  - otázky z lekcí a kvízů po prvním vyhodnocení (špatně zodpovězené hned),
  - `cards.md`,
  - kroky se stavem `assisted`, se 3 a víc neúspěchy nebo s odpovědí „nezvládl bych to znovu": znovu od seedu, bez popisu, jen s požadavky,
  - nezaškrtnuté body z explain a nejisté `outcomes`.
- Leitner 1→3→7→16→35→90 dní. Denní strop 20 položek, pořadí míchané napříč sekcemi.
- Otázka se ukáže bez voleb a bez `--why--` („odpověz v hlavě"), volby až potom.
- Na přehledu jeden řádek „K opakování: 12 (asi 8 min)". Žádné série.
- API `GET /api/reviews/due`, `POST /api/reviews/answer { id, ok, confidence }`. ID otázky = modul + hash textu, osiřelé karty se mažou.

**B6. Jistota odpovědi** · přínos 4 · S
- „Jsem si jistý / Tipuju" u každé otázky. Chyba s jistotou → „Tady ses mýlil s jistotou" a opakování zítra.
- Na stránce sekce jedna věta kalibrace („Když jsi byl jistý, měl jsi pravdu v 71 %").

**B7. Otázky a kvíz neprozradí odpověď** · přínos 4 · S
- První pokus: jen ✗ a `why` zvolené odpovědi. Správná se ukáže po druhém neúspěchu nebo na kliknutí, pak se volby zamíchají.
- Kvíz ukládá `scores.first` zvlášť od nejlepšího skóre. Souhrn obsahuje seznam chybných otázek s odkazem `see` a nabídku „jen chybné".

**B8. Záznam pokusů `#/statistiky`** · přínos 4 · S
- `POST /api/attempts { id, ok, failed, tipsOpened, solutionViewed, activeMs }`.
- Obrazovka bez grafů a bodů: 10 požadavků s nejvíc neúspěchy, chybné otázky, kroky s otevřeným řešením, čas po sekcích.
- Zároveň ukáže, který obsah je špatně vysvětlený.

**B9. Poznámky a „Nerozumím"** · přínos 4 · S
- Panel v lekci i ve workspace, markdown soubory na disku, `#/poznamky` po sekcích.
- Ikonka „Nerozumím" u odstavce vloží citaci do poznámky.
- Sem se ukládají odpovědi z A8 a A12. Stránka slouží i jako tahák před pohovorem.

**B10. Běžící Node server a HTTP klient** · přínos 5 · M/L
- `POST /api/dev-process/start|stop|request`, `GET …/output?since=`. Vždy jen jeden proces, volný port, úklid po 10 min nečinnosti a při odchodu z obrazovky.
- Panel s výstupem a formulářem pro požadavek (metoda, cesta, hlavičky, JSON tělo; výsledek status, hlavičky, tělo, čas).
- Proces, který jen poslouchá, se už nikdy neoznačí jako „nekonečná smyčka".

**B11. Drobnosti s velkým dopadem** · přínos 4 · S
- Vypnout ligatury (`font-variant-ligatures: none`) v editoru, `pre`, `code` a konzoli.
- `//# sourceURL=akademie/<soubor>` ve skriptech náhledu (čísla řádků zůstanou) a tlačítko „Otevřít náhled v nové kartě" (Blob URL), aby šly skutečné DevTools a breakpointy.
- Přepínač šířky náhledu „Jako testy (1024, zmenšeno) · 768 · 375 · panel". Kroky 007–010 flexboxu pak přestanou radit dočasný `max-width`.

**B12. Orientace a pracovní plocha** · přínos 3 · S/M
- Obsah lekce (lepivý postranní panel od 1200 px) a stepper workshopu jako seznam s názvy kroků a ✓.
- Drobečky s částí a sekcí jako odkazy. „Pokračovat" vede na první nesplněný krok.
- U runtime js konzole pod editorem (poměr 35/65). Kód z předchozích kroků mimo `--edit--` se sbalí.
- Bloky kódu v zadání s vodorovným posuvem. Po splnění skrýt Zkontrolovat.
- Tmavý režim přes tokeny (uživatel pracuje v tmavém prostředí), zkratky Alt+←/→ a `?`.

**B13. Konzole rozlišuje typy** · přínos 4 · M (vlna 3)
- Řetězce v uvozovkách jinou barvou, rozbalovací strom objektů, `console.table` jako tabulka, odkaz `script.js:3` u každého řádku.
- Přímo řeší past `1.67` vs `'1.67'` z labu.

**B14. Vyhledávání Ctrl+K a glosář** · přínos 4 · M (vlna 3)
- Index bez diakritiky: titulky > nadpisy > pojmy > text včetně inline kódu. Proklik na kotvu.
- Pojmy `[[ ]]` jako popover (definice, anglický termín, „vysvětleno v", MDN) a stránka `#/pojmy`.

**B15. REPL v konzoli a pískoviště** · přínos 4 · S + M (vlna 3)
- REPL: zprávy `eval` a `eval-result` v iframu, historie příkazů, u modulů hláška, že proměnné nejsou globální.
- Pískoviště `#/piskoviste` se soubory v `moje-projekty/piskoviste/<slug>/`, runtime dom/js/vue/node.
- „Otevřít v pískovišti" u každé ukázky, kroku a labu.

**B16. Postavit znovu naslepo, reset modulu, tahák a outcomes** · přínos 4 · S (vlna 3)
- U splněného kroku, labu nebo celého workshopu otevřít seed bez popisu, jen s požadavky. U workshopu seed prvního kroku a testy posledního. Uložený postup se nepřepíše.
- Menu modulu „Začít znovu / Procvičit naslepo". Stránka taháku s tiskovým stylem.
- Obrazovka „Po sekci umíš": Umím / Nejistý / Neumím, a „Nejistý" pošle navázané položky do opakování.

**B17. Krokování JS: zásobník, rozsahy, halda se šipkami** · přínos 5 · L (vlna 3, **musí být hotové před js-objekty**)
- Instrumentace přes acorn: `step`, `enter`, `exit`. Objekty dostanou id přes WeakMap, limit 2000 kroků, v1 bez async.
- Blok `:::trace js`, v kurzu nahradí A9 tam, kde kód jde krokovat.

**B18. Vizuální cíl v CSS labech** · přínos 4 · M (vlna 4, před css-grid a dalšími CSS laby)
- Vedle sebe, přes sebe s průhledností a „rozdíly", kde se prvky s odchylkou víc než 4 px orámují. `target: layout` porovnává jen geometrii.

**B19. Cvičné úlohy (katas) `#/cviceni`** · přínos 5 · M platforma, obsah L
- `content/cviceni/<slug>/` ve formátu labu s `requires`, `topics`, `level`. Výchozí filtr „jen z toho, co mám splněné", tlačítko „Náhodná úloha".
- Vyřešená úloha se nabídne znovu za 7 a za 30 dní.
- Obsah: 8–15 úloh na JS sekci, 5–8 na CSS sekci. Píšou se spolu se sekcemi.

**B20. Specificita a vysvětlovač kaskády** · přínos 4 · M + L
- Blok `:::specificita` s kalkulačkou (A,B,C) patří do vlny 3 kvůli css-kaskada.
- Panel „Proč má prvek tuhle hodnotu" (pravidla seřazená podle vrstvy, specificity a pořadí, přebitá přeškrtnutá s českým důvodem) až ve vlně 4.

**B21. Event loop s předpovědí pořadí** · přínos 5 · L (vlna 4, před js-async)
- Nejdřív levná verze `:::eventloop` s kroky popsanými autorem a přehrávačem.
- Instrumentovaná verze nad B17 jen tehdy, když na ni zbyde čas.

**B22. Runtime `react`** · přínos 5 · M (vlna 5, jen když E1 = React)
- Import map s předsestavenými vendor soubory Reactu, Sucrase (JSX/TSX) v klientovi, `helpers.flush()`, jsx/tsx v CodeMirroru.
- Verify ověří, že seed jde po transformaci spustit.

**B23. Poznámky analyzátoru k řešení (neblokují splnění)** · přínos 3 · M (vlna 5)
- Nápověda typu `feedback: actionable|celebratory` se spustí až po průchodu hlavních testů.
- Sdílené kontroly nad AST: `var`, `==`, `sort()` na vstupu, `innerHTML` s proměnnou, `!important`, `outline: none`.

**B24. Regex tester `:::regex`** · přínos 3 · M (vlna 3, jen jako blok pro js-retezce-cisla)
- Vyhodnocuje se ve Web Workeru s timeoutem, rozbor tokenů česky.

**Nestavět:**
- vysvětlování chyb přes AI (viz E3; deterministickou náhradu dávají B1–B4),
- vlastní překryvy DevTools,
- `#/plan`,
- `:::replay`.

---

## C) Osnova (výsledný seznam)

**Značky:** [=] beze změny · [Z] změněná · [N] nová · [R] rozšíření (nepovinné) · [X] zrušená.

**Nová pole v osnova.json:**
- `uroven: jadro|rozsireni`,
- `doporucenaTrasa`: pořadí sekcí, které prokládá CSS a JS. Části zůstanou tematické, nic se nezamyká.
- Na konci sekce odkaz „Další na trase".

**Rozsah:** 43 sekcí. Realisticky ~470 h, z toho jádro ~400 h. Škrty ušetří ~25 h. Hledat práci jde začít po ~270 h (po react-aplikace, nastroje-cizi-kod a kariera-pohovor).

**Část 1: Web a CSS**
1. `html-zaklady` [=]: HTML a jak funguje web.
2. `start-nastroje` [N]: VS Code, minimum terminálu, první repozitář a push (node workshop), nasazení na Pages, lekce `jak-se-ucit-v-akademii` (předpověď, nápovědy, opakování, poznámky, jak se ptát).
3. `html-formulare` [=]: formuláře.
4. `html-pristupnost` [Z]: `projekt-portfolio-html` nově „v Gitu po malých commitech a nasazené na URL".
5. `css-zaklady` [Z]: přibude lekce `devtools-pro-css` (Elements, Computed, flex/grid badge).
6. `css-kaskada` [Z]: specificita přes `:::specificita`.
7. `css-box-model` [=]: box model a tok dokumentu.
8. `css-flexbox` [Z, pilot]: přepracování podle D.
9. `css-grid` [=]: CSS Grid.
10. `css-pozicovani` [Z]: `anchor-positioning` a `top-layer` v jedné lekci, workshop rozbalovačky ~10 kroků.
11. `css-responzivita` [=]: responzivita a témata.
12. `css-design` [N]: hierarchie a rozestupy, barvy v oklch a typografie, čtení návrhu z Figmy, SVG a ikony, workshop „podle návrhu" se spočtenými hodnotami.
13. `css-animace` [Z]: bez `workshop-scroll-pribeh`, `vykon-animaci` sloučit do `transition-transform`. `projekt-landing-page` = vlajkový projekt 1. `projekt-portfolio-css` [X].
- Na konec části `lab-kontrolni-bod-1` [N]: přístupná stránka akce kombinující formulář, grid, flex a animaci, bez uvedení sekcí.

**Část 2: JavaScript**

14. `js-zaklady` [Z]: přibude lekce `cteni-chyb-a-debugger` hned za `prvni-program` (typy chyb, stack, `debugger;`, Step over/into, Scope), krátký `reseni-problemu` před lab-fizzbuzz, lab „Oprav 3 chyby".
15. `js-retezce-cisla` [Z]: regexy s blokem `:::regex`.
16. `js-funkce` [=]: funkce a rozsah platnosti. Jeden krok vyžaduje breakpoint.
17. `js-objekty` [=]: reference a kopie, silné použití `:::trace`.
18. `js-pole` [Z, pilot]: podle D, plus lab „Oprav 3 chyby".
19. `js-funkce-hloubka` [=]: closures, this, funkcionální styl.
20. `js-tridy-kolekce` [Z]: iterátory zkrácené, iterator helpers [R], workshop ~15 kroků.
21. `js-chyby-ladeni` [Z]: základ ladění se přesunul do js-zaklady, tady zůstane systematické ladění a `lab-oprav-chyby`.
22. `js-dom` [=]: `projekt-kanban`.
23. `js-async` [=]: event loop s `:::eventloop`, `projekt-filmova-databaze`, lab „Oprav 3 chyby".
- `lab-kontrolni-bod-2` [N]: data z fetch, řazení, validace a vykreslení do DOM.

**Část 3: Nástroje a řemeslo**

24. `nastroje-git-terminal` [Z, přejmenovaná z `nastroje-terminal-git`]: jen pokročilé věci (větve, konflikty, rebase, reflog, bisect, roury, PATH, SSH).
25. `nastroje-moduly-vite` [Z]: přibude lekce `lint-a-format` (ESLint flat config, Prettier/Biome, lint-staged) a pnpm. Další projekty kontrolují `npm run lint`.
26. `nastroje-typescript` [Z]: přibude `typy-knihoven` (čtení .d.ts a dlouhých hlášek) a `validace-na-hranici` (Zod, přesunutý z api-http-rest).
27. `nastroje-testovani` [Z]: MSW v mockování sítě, axe-core v Playwrightu. `projekt-rozpoctovac` zmenšit na ~6 h.
28. `nastroje-devtools-vykon` [Z]: `pamet` sloučit do `devtools-mapa`.
29. `js-algoritmy` [N]: postup řešení problémů, Big O, datové struktury, vzory úloh, workshop pohovorových utilit (debounce, throttle, deepClone, Promise.all, LRU), lab 10 úloh.
30. `nastroje-cizi-kod` [N]: orientace v cizím kódu, od issue k PR, code review, odhad a komunikace, workshop „feature v cizím projektu" (fixture ~30 souborů), `lab-code-review` s testy. PR a review se sem přesouvají z git sekce.
31. `prace-s-ai` [N, podmíněno E2]: jak LLM selhává, AI jako tutor, zadávání úkolu agentovi, review kódu z AI, workshop „oprav kód se 7 skrytými chybami".

**Část 4: Frontend framework** (varianta E1 = React)

32. `react-zaklady` [N]: JSX, komponenty a props, `key`, useState jako snapshot, formuláře, workshop karty produktu a počítadlo kalorií, lab kvíz v Reactu.
33. `react-hloubka` [N]: render a rerender, useEffect správně, useRef, vlastní hooky, useReducer a context, error boundary, Suspense, portály, workshop modal a toasty, lab tabulka dat.
34. `react-aplikace` [N]: Vite + TS, React Router, druhy stavu, TanStack Query, formuláře se Zod, styly (CSS Modules, Tailwind), auth z klienta, testy komponent. `projekt-react-spa` = vlajkový projekt 2.
- `vue-zaklady` [X], `vue-aplikace` [X], `projekt-vue-dashboard` [X]. Obsah ještě neexistuje, nic se neztratí.
35. `vue-nuxt-druhy-framework` [N, R]: převodní tabulka z Reactu, reaktivita přes Proxy, Nuxt v kostce, přepis komponenty do Vue. Runtime `vue` zůstane.

**Část 5: Backend a fullstack**

36. `node-zaklady` [Z, pilot]: podle D.
37. `api-http-rest` [Z]: přibude `workshop-api-ve-frameworku` (Express 5 a co framework nahrazuje). Zod se přesouvá do TS.
38. `sql-databaze` [Z]: přibude `orm-drizzle`, `postgres-v-dockeru`, okenní funkce [R].
39. `next-fullstack` [N, nahrazuje `nuxt-fullstack` X]: SSR/CSR/SSG, App Router, server a client komponenty, data a server actions, SEO a metadata. `projekt-zaverecny` = vlajkový projekt 3, s možností vlastního tématu a stejným checklistem.
40. `auth-bezpecnost` [Z]: přibude `auth-v-praxi` (OAuth/OIDC s PKCE, Better Auth/Auth.js, passkeys, reset hesla).
41. `api-soubory-realtime` [N, R]: nahrávání souborů, SSE (workshop v čistém Node), WebSocket, e-maily a úlohy na pozadí.
42. `nasazeni-provoz` [Z]: `linux-server` [R].
43. `prohlizec-navic` [N, R]: web components, service worker a PWA, Web Workers, workshop offline poznámek s IndexedDB.

**Část 6: Kariéra** (přístupná kdykoli)

44. `kariera-pohovor` [N]: portfolio (3 vlajkové projekty, README s rozhodnutími), CV, LinkedIn a GitHub, domácí úkol, technický pohovor (vyprávění o projektu, live coding, frontend system design ve 4 krocích), behaviorální pohovor a angličtina, první měsíce v práci, `lab-domaci-ukol`, kvíz „mock pohovor" s modelovými odpověďmi, které jdou do opakování.

Číslování je jen pořadové. Výsledek je 43 sekcí jádra a rozšíření, protože `prace-s-ai` závisí na E2.

**Projekty:** 3 vlajkové (landing page a portfolio, React SPA, Next fullstack), ostatní jsou cvičné. Každý projekt má oddíl „Rozšíření do portfolia" (skutečné API, nasazení, README).

---

## D) Úpravy pilotních sekcí

**D1. `js-pole/co-je-pole`** · přínos 4 · S
- Ukázky `b = a` + push, `[1,2] === [1,2]`, mělká kopie a `slice` vs `splice` převést na `:::live predict`. Hodnoty z komentářů smazat.
- Za „Proměnná neobsahuje pole, ale odkaz" vložit `:::memory` se 3 stavy.
- Na začátek pretest `shopping[5]`.
- Za každou část `##` jeden `:::check`. Psaná otázka na past `indexOf` v podmínce.
- `:::explain` k referencím.

**D2. `js-pole/workshop-nakupni-seznam`** · přínos 4 · S/M
- Doplnit ~50 českých zpráv k asercím.
- Za krok 023 vložit debug krok „kolegův `markAllBought`" (mutace uvnitř `map`).
- Krok 017 nahradit krokem „Vyber metodu sám" (some, find, reduce nebo toSorted; metody nejmenovat, regex nevynucovat).
- Explain u 009 (callback u `map` vs `filter`), `:::memory` nebo trace u `reduce` v 018.
- Tipy `--help--` u kroků se složitějším vzorem. Zeslabit poslední třetinu kroků.
- Parsons u prvního `reduce` do objektu.

**D3. `js-pole` ostatní** · přínos 4 · S
- `cards.md` (~20 karet: `at(-1)`, `sort()` bez comparatoru, `toSorted`, `reduce` bez počáteční hodnoty, `map(parseInt)`…).
- `pojmy.md`, `tahak.md`, `outcomes`.
- Lab statistika: kostry funkcí se JSDoc, blok „Než začneš", `--approaches--` (for…of vs reduce vs `Math.max(...)`), požadavky nečíslovat dvakrát.
- Kvíz: polovina otázek psaných, jedna sada `# --code--`.

**D4. `css-flexbox/workshop-navigace`** · přínos 4 · S
- Kroky 5, 13, 14, 18 a 19 přepsat na „cíl + kandidáti".
- Do kroku 17 předpověď („co udělá `stretch` se štítkem?").
- Z kroku 21 přesunout prozrazenou odpověď do explain.
- Mezi kroky 16 a 17 debug krok `.card { flex: 1 }` (karty ignorují 15rem).
- Explain k `min-width: 0` za krokem 16.
- Kroky 007–010 přepsat na přepínač šířky náhledu (B11). Tipy u kroků 8 a dál.

**D5. `css-flexbox/flex-do-hloubky` a `uvod`** · přínos 5 · S/M
- `controls` s posuvníky `flex-grow` A/B a šířkou kontejneru.
- `:::compare` pro `width: 2000px` ve flow vs. ve flexu.
- 3 předpovědi „jak široká bude položka (px)".
- Explain k `min-width: auto`.
- `:::check` po částech.
- `tahak.md` s tabulkou justify-content / align-items / align-content. `cards.md`, `pojmy.md`.
- Lab cenik: `--approaches--` (wrap+basis vs media dotaz vs grid auto-fit), `target: layout`.

**D6. `node-zaklady`** · přínos 4 · S
- Workshop http-server: tipy u kroků se serverem, jeden debug krok („server spadne na neplatném JSON"), explain ke stavovým kódům.
- Otestovat HTTP klient (B10) na krocích 5 a dál.
- `cards.md` s typickými chybami (`EADDRINUSE`, `Cannot set headers after they are sent`) navázanými na `errors-cs.js`.
- Projekt: `# --review--` a „Rozšíření bez testů".

---

## E) Otevřené otázky pro uživatele

1. **React, nebo Vue jako hlavní framework?** Doporučuju React (3 sekce) + Next.js a Vue/Nuxt jako volitelnou sekci. Data z 13. 9. 2026: jobs.cz React 58 nabídek, Vue 10, Next 7, Nuxt 1; junior.guru React 12, Vue 3. Proti: Arkádu jsi stavěl v Nuxtu. Rozhodnutí mění sekce 32–35 a 39 a runtime B22.
2. **Smí kurz mluvit o AI?** Kap. 11 kontraktu teď zakazuje zmínky o AI všude, i v textech lekcí. Návrh: zákaz nechat pro kód, commity a atribuci, ale povolit sekci `prace-s-ai` (kontrola a oprava kódu z AI, AI jako tutor) a lekci pravidel učení se AI ve `start-nastroje`. Když ne, sekce 31 odpadne a zbytek se přeformuluje na „cizí kód".
3. **Vysvětlování chyb přes AI přímo v Akademii: ano/ne?** Doporučuju **ne**. Místo toho deterministické nápovědy, české chyby a diff (B1–B4). Když ano, jen jako obecný externí příkaz v gitignorované konfiguraci: až po 3 neúspěšných kontrolách, po otevření všech tipů a po napsání vlastní hypotézy, v sokratovském režimu bez kódu řešení.
4. **Rozsah a tempo.** Přijímáš ~43 sekcí (~470 h, z toho jádro ~400 h, s označením rozšíření)? A hledáš práci už teď? Pokud ano, `kariera-pohovor` a `js-algoritmy` přesunu do vlny 3 místo vlny 5.

---

## Plán vln

**Vlna 2: formát, platforma a piloty** (~11 agentů, ve 3 fázích)
- **2a, sekvenčně, 1 agent:** kontrakt (A1–A15), příručka (A14), osnova.json a osnova.md (C), `createJsonStore` a index obsahu (B0). Ostatní agenti čekají na hotový kontrakt.
- **2b, paralelně, 6 agentů platformy:**
  1. B1 + B2 + B8 (nápovědy, diff, pokusy),
  2. B3 + B4 (chyby česky, lint; koordinátor předem přidá `@codemirror/lint`),
  3. B5 + B6 + B7 + cards (opakování, jistota, otázky),
  4. lekční bloky A2, A3, A8, A9, A10, parsons a debug UI a parser a verify pro nové sekce,
  5. B10 (Node server a HTTP klient),
  6. B9 + B11 + B12 (poznámky, drobnosti, orientace, tmavý režim).
- **2c, paralelně, 3 agenti:** přepracování pilotů D1–D6, jeden na sekci. Verify celého kurzu a e2e průchod.
- **Kontrolní bod s uživatelem:** projde přepracovaný `js-pole` a flexbox a rozhodne E1–E4.

**Vlna 3: obsah, dávka 1** (9 sekcí + 3 agenti platformy + 1 revizor ≈ 13)
- Pořadí podle trasy: `html-zaklady`, `start-nastroje`, `css-zaklady`, `js-zaklady`, `html-formulare`, `js-retezce-cisla`, `css-kaskada`, `js-funkce`, `css-box-model`.
- Platforma paralelně: B13 + B14, B15 + B16, B17 (trace) + `:::specificita` + `:::regex`.
- Revizor po dávce ověří pravidla A14 a jednotnost napříč sekcemi.

**Vlna 4: obsah, dávka 2** (8 sekcí + 2 platforma + 1 revizor ≈ 11)
- `js-objekty` (s trace), `html-pristupnost`, `css-grid`, `js-funkce-hloubka`, `css-pozicovani`, `js-tridy-kolekce`, `css-responzivita`, `js-chyby-ladeni`.
- Platforma: B18 (vizuální cíl) + B19 (katas UI), B20 (vysvětlovač kaskády) + B21 (`:::eventloop`).
- Katas pro sekce z vln 3–4 píšou autoři sekcí jako součást sekce.

**Vlna 5: obsah, dávka 3** (9 sekcí + 2 platforma + 1 revizor ≈ 12)
- `css-design`, `js-dom`, `css-animace` + `lab-kontrolni-bod-1`, `js-async` + `lab-kontrolni-bod-2`, `nastroje-git-terminal`, `nastroje-moduly-vite`, `nastroje-typescript`, `nastroje-testovani`, `nastroje-devtools-vykon`.
- Platforma: B22 (runtime react, podle E1), B23 (analyzátor).
- Když E4 = hledám teď, sem přijdou i `kariera-pohovor` a `js-algoritmy`.

**Vlna 6: obsah, dávka 4** (8 sekcí + 1 revizor ≈ 9)
- `react-zaklady`, `react-hloubka`, `js-algoritmy`, `react-aplikace`, `nastroje-cizi-kod`, `prace-s-ai` (podle E2), `kariera-pohovor`, `api-http-rest`.

**Vlna 7: obsah, dávka 5 a dokončení** (8 sekcí + 1 průřezový revizor ≈ 9)
- `sql-databaze`, `next-fullstack`, `auth-bezpecnost`, `nasazeni-provoz`, `api-soubory-realtime` [R], `vue-nuxt-druhy-framework` [R], `prohlizec-navic` [R].
- Revizor projde celý kurz: `see` odkazy, `[[pojmy]]` použité před výkladem, míchání kvízů mezi sekcemi a počty karet a debug kroků.

**Celkem:** ~65 agentových běhů v 6 vlnách. Kritické závislosti:
- kontrakt a příručka jsou hotové před vlnou 3,
- B17 (trace) před `js-objekty`,
- B21 (event loop) před `js-async`,
- B22 (runtime react) před React sekcemi,
- B10 (Node server) už ve vlně 2, protože node pilot existuje.