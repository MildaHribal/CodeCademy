# Jak psát obsah Akademie

Pro koho píšeme: člověk, který umí s pomocí AI slepit funkční web, ale neumí
vysvětlit, proč funguje. Chce se to naučit doopravdy, aby zvládl vlastní
projekty i technický pohovor. Česky mluví, anglickou dokumentaci přečte s námahou.

Cíl každého modulu: **po něm to umí napsat sám, bez nápovědy, a ví proč.**

---

## Jazyk

- Výklad česky, tykání, věcně, bez „super", „skvělé", vykřičníků a smajlíků.
- Kód anglicky: `const totalPrice`, `function formatDate`, třídy `.card__title`.
  Texty ve stránkách (obsah HTML, výpisy) česky.
- Odborné termíny: při prvním použití český popis + anglický termín, který uvidí
  v dokumentaci: „hlavní osa (*main axis*)". Dál stačí jeden z nich, konzistentně.
- Nevysvětluj věci, které přijdou až později. Když je musíš použít, řekni
  „k tomuhle se dostaneme v sekci X, teď stačí vědět, že…".

## Modul po modulu

**Lekce** — vysvětlí jeden koncept. 5–15 minut čtení. Struktura:
1. Problém: co bez toho nejde nebo jde špatně (krátký konkrétní příklad).
2. Jak to funguje — mentální model, ne seznam vlastností. Živé ukázky
   (`:::live`), které si uživatel upraví. Ke každé ukázce věta „zkus změnit X a
   sleduj Y".
3. Typické chyby a pasti (tohle je nejcennější část — to, co se v tutoriálech nepíše).
4. 2–4 kontrolní otázky, které ověří pochopení, ne zapamatování názvu.

**Workshop** — postaví malý, ale skutečný výsledek (navigaci, kalkulačku, kartu
produktu…) po krocích. 15–60 kroků.
- **Jeden krok = jedna nová věc.** Pokud popis kroku potřebuje slovo „a pak",
  jsou to dva kroky.
- Popis kroku: 1) co udělat, konkrétně (který soubor, který prvek),
  2) proč, 3) když je to nový koncept, krátký příklad **na jiných datech** —
  ne řešení k opsání.
- Nápovědy (texty testů) jsou požadavky, které si uživatel odškrtává:
  „Prvek `nav` má `display: flex`." Ne „Test 1".
- Každých ~8 kroků krok, kde uživatel zopakuje dřív naučené bez návodu.
- Poslední krok shrne, co se naučil, a ukáže, kde to použije.

**Lab** — samostatné zadání bez vedení. Popis = kontext + seznam uživatelských
příběhů („Když uživatel klikne na…, …"). Nápovědy = jednotlivé požadavky, 8–20.
Seed je skoro prázdný. Lab ověří, že workshop „sedl".

**Kvíz** — 10–20 otázek na konci sekce. Otázky na chápání a čtení kódu
(„co vypíše tento kód?", „proč se tenhle prvek nezarovná?"). Každá špatná
odpověď má `--why--` s vysvětlením, proč je špatná. Žádné chytáky na slovíčka.

**Projekt** — na konci celku, ve VS Code. Něco, co by si dal do portfolia.
Zadání jako od klienta + uživatelské příběhy + technické požadavky. Testy
kontrolují chování, ne konkrétní implementaci.

## Pořadí v sekci

Typicky: lekce → workshop → (lekce → workshop)… → lab → kvíz.
Sekce má 4–10 modulů. Po sekci musí uživatel umět téma použít v novém kontextu.

## Testy

- **Testuj chování a výsledek, ne zápis.** `getComputedStyle(el).display === 'flex'`,
  ne regex na `display:flex`. Uživatel smí napsat řešení jinak než autor.
- Regex na zdroják jen tam, kde krok učí konkrétní syntaxi (např. „použij
  `for…of`") — a pak nejdřív `helpers.stripComments`.
- Zprávy asercí česky a konkrétně: `assert.equal(x, 3, 'sum([1, 2]) má vrátit 3')`.
  Uživatel vidí text nápovědy; zpráva aserce je detail pro ladění.
- Kontroluj i okrajové případy, které krok zmiňuje (prázdné pole, nula…),
  ale nepřidávej požadavky, o kterých popis mlčí.
- Testy nesmí záviset na pořadí, na čase ani na síti. Žádné `fetch` na internet —
  na API používej lokální data nebo mock v seedu.
- `npm run overit -- content/<tvoje-sekce>` musí projít bez chyb. Seed každý
  test neprojde, řešení projde všemi.

## Kód v seedech a řešeních

- Moderní, idiomatický kód, jak by ho napsal dobrý senior dnes: `const`/`let`,
  arrow funkce tam, kde dávají smysl, sémantické HTML, CSS bez zbytečných hacků,
  logické vlastnosti tam, kde je to přirozené, přístupnost (label, alt, focus).
- Workshopy mají vypadat hezky — výsledek by si uživatel rád ukázal.
  Pěkné barvy, rozumná typografie, žádné Times New Roman.
- Žádné závislosti z internetu (CDN, fonty z Google). Systémové fonty.

## Zdroj látky

Stará výuková hra `~/arkada` (jen ke čtení, NIC v ní neměň) má v `tikety/*/`
hodně dobrých výkladů, pastí a příkladů (`tiket.json` pole `rozbor`, `priklad`,
`kontext`) a v `docs/*.md` osnovy. Použij je jako surovinu — **bez** příběhu
o firmě Arkáda, bez postav, bez tiketů. Obsah vždy přepiš do formátu Akademie.
