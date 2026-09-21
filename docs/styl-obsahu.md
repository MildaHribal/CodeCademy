# Jak psát obsah Akademie

Pro koho píšeme: člověk, který umí s pomocí AI slepit funkční web, ale neumí
vysvětlit, proč funguje. Chce se to naučit doopravdy, aby zvládl vlastní
projekty i technický pohovor. Česky mluví, anglickou dokumentaci přečte s námahou.

Cíl každého modulu: **po něm to umí napsat sám, bez nápovědy, a ví proč.**

Formáty (jak se co zapisuje) jsou v `docs/kontrakt.md`. Tahle příručka říká, **co**
a **kolik** psát. Kódy v hranatých závorkách (`[W1]`) odkazují na kontroly verify
v kontraktu, kap. 10.

## Jak číst pravidla

- **Povinné** — bez výjimky. Když verify pravidlo umí spolehlivě zkontrolovat, hlásí
  **chybu** nebo **varování**; kde je strojová kontrola jen přibližná (třeba „lekce
  bez předpovědi"), hlásí doporučení a zbytek hlídá revizor. Varování před odevzdáním
  sekce opravíš, nebo ho ve zprávě zdůvodníš.
- **Doporučené** — výchozí volba. Odchýlit se smíš, když máš důvod. Verify hlásí
  **doporučení** (vypíše je `npm run overit -- --doporuceni`).
- Pravidla bez kódu verify nekontroluje — hlídá je revizor po dávce.

---

## 1. Jazyk

Povinné:

- Výklad česky, tykání, věcně, bez „super", „skvělé", vykřičníků a smajlíků.
- Kód anglicky: `const totalPrice`, `function formatDate`, třídy `.card__title`.
  Texty ve stránkách (obsah HTML, výpisy) česky.
- Odborné termíny: při prvním použití český popis + anglický termín, který uvidí
  v dokumentaci: „hlavní osa (*main axis*)". Dál stačí jeden z nich, konzistentně.
  Termín, který sekce zavádí, patří do `pojmy.md` (kap. 11).
- Nevysvětluj věci, které přijdou až později. Když je musíš použít, řekni
  „k tomuhle se dostaneme v sekci X, teď stačí vědět, že…".
- O AI se v obsahu píše jen v sekci `prace-s-ai` a v lekci `jak-se-ucit-v-akademii`
  (sekce `start-nastroje`), jinde jen tehdy, když to téma lekce přímo vyžaduje.

---

## 2. Jak zařídit, aby se to naučil

Přečíst a opsat nestačí. Každý modul musí studenta donutit **vybavit si**,
**předpovědět**, **najít chybu** a **vysvětlit vlastními slovy**. Pomoc se postupně
ubírá, dokud to nezvládne sám. Co se naučil, se mu vrací v opakování po dnech a týdnech.

Nástroje a kdy který použít:

| nástroj | na co | kde |
|---|---|---|
| předpověď `:::live … predict` | past, kde intuice selže | lekce, u každé pasti |
| `:::check` | vybavení právě vysvětleného bodu | lekce, po každé části `##` |
| pretest `:::check pretest` | naladit pozornost před výkladem | začátek lekce |
| `:::memory` | co je v proměnných a na co odkazují | lekce o referencích, kopiích, stavu |
| `controls` a `:::compare` | vztah hodnoty a výsledku, rozdíl jedné věci | CSS lekce |
| `kind: parsons` | první setkání se složitějším vzorem | workshop, před psaním vzoru |
| `kind: debug` | čtení cizího kódu a ladění | workshop, lab „Oprav 3 chyby" |
| `# --explain--` / `:::explain` | pojmenovat, proč to funguje | koncepty, na které se ptají u pohovoru |
| `kind: choose` | vybrat nástroj bez návodu | workshop |
| `kind: recall` | vybavit si starší látku bez návodu | workshop |
| tipy `# --help--` | pomoc, když se zasekne, bez prozrazení | kroky, laby, projekty |
| `cards.md` | opakování s odstupem | sekce |

---

## 3. Lekce

Vysvětlí jeden koncept. 5–15 minut čtení.

**Stavba (povinné):**

1. Nadpis `#` s titulkem.
2. 1–2 otázky předem `:::check pretest` před prvním `##` `[E5]`.
3. **Problém:** co bez toho nejde nebo jde špatně (krátký konkrétní příklad).
4. **Mentální model v jedné tučné větě** hned za problémem („**Proměnná neobsahuje
   pole, ale odkaz na něj.**"). Ne seznam vlastností.
5. Výklad po částech `##`. Za každou částí jeden `:::check` k právě vysvětlenému bodu.
   Lekce bez `:::check` = `[E4]` varování, část bez něj = `[E6]` doporučení.
6. **Typické chyby a pasti** — nejcennější část, to, co se v tutoriálech nepíše.
7. `## Kde to najdeš v MDN` — 2–4 odkazy na anglickou dokumentaci s větou, co tam
   najde `[E6]`.
8. `# --questions--`: 2–4 otázky na chápání, ne na zapamatování názvu; aspoň polovina
   s psanou odpovědí `[E6]`.

**Povinné v obsahu:**

- Aspoň **jeden kontrastní pár** (funguje × nefunguje, `slice` × `splice`, flow × flex).
- Aspoň **jedna ukázka „kde to nefunguje"** s přesnou chybovou hláškou nebo přesným
  špatným výsledkem.
- Aspoň **jedna předpověď** `:::live … predict` u pasti `[E6]`.
- **Výstup nikdy nepiš do komentáře** u klíčového konceptu (`// [1, 2, 3, 4] — změnilo
  se i a`). Místo toho předpověď. Komentáře ve výkladových ukázkách popisují záměr,
  ne výsledek.
- Ke každé živé ukázce věta „zkus změnit X a sleduj Y".
- Nejvýš **~400 slov** výkladu mezi dvěma interaktivními bloky (`:::live`, `:::check`,
  `:::explain`, `:::memory`, `:::compare`) `[E6]`.
- Lekce nemají živé ukázky pro node, kromě `:::live node predict`. Jinak ukaž kód
  a výstup terminálu a vyzvi ke spuštění.

**Zvýraznění (povinné, kontrakt kap. 5.11):**

- Mentální model lekce je v rámečku `> [!REMEMBER]` (1–3 na lekci).
- Každá past z části „Typické chyby a pasti" je v rámečku `> [!PITFALL]` s přesným
  příznakem (hláška nebo špatný výsledek) a opravou.
- `> [!TIP]` pro praktické rady (DevTools, zkratky), `> [!NOTE]` pro odbočky. Nejvýš
  ~1 rámeček na obrazovku textu — když je zvýrazněné všechno, není zvýrazněné nic.
- Tučně jen klíčové věty a pojmy (nejvýš ~1 tučné místo na odstavec). `==zvýraznění==`
  jen pro 1–3 slova, která se právě porovnávají, nejvýš 2× na lekci.
- V popisu kroku workshopu: úkol tučně (`**Úkol:** …`), past kroku v `> [!PITFALL]`.

**Doporučené:**

- `:::memory` se 2–4 stavy u každého místa, kde se mění, na co proměnné odkazují.
- `controls` s 1–3 prvky v CSS ukázce, kde student hledá vztah hodnoty a výsledku.
- `:::compare` pro dvě varianty, které se liší **jedinou** věcí.
- `:::explain` u konceptu, který se vysvětluje na pohovoru (nejvýš 1–2 na lekci).
- Nadpisy `##` piš tak, aby kotva dávala smysl i v odkazu (`kopie-pole`, ne `dalsi-cast`).
  Nadpis, na který už vede `see`, neměň — rozbiješ odkaz `[S4]`.

### 3.1 Předpověď

- Kód ukázky je krátký (do ~10 řádků) a vypíše **právě to**, na co se otázka ptá —
  u `js` se `--expected--` porovnává s celou konzolí `[E2]`.
- Otázka pojmenuje, co předpovídat („Co vypíše poslední `console.log`?", „Jak široká
  bude položka v px?").
- `--why--` vysvětlí mechanismus, ne jen výsledek.
- U dom předpovědí 3 možnosti, z nichž špatné odpovídají typickým mylným představám.

### 3.2 Kontrolní otázka `:::check`

- Ptá se na bod, který byl **právě** vysvětlený, jinými slovy než výklad.
- Nejlépe psaná odpověď nebo „co udělá tenhle kód", ne „jak se jmenuje vlastnost".
- Pretest je otázka, na kterou student ještě odpověď nezná, ale může ji odhadnout;
  výklad za ní odpověď přinese.

---

## 4. Workshop

Postaví malý, ale skutečný výsledek (navigaci, kalkulačku, kartu produktu…) po
krocích. 15–60 kroků `[W4]`.

**Povinné:**

- **Jeden krok = jedna nová věc.** Pokud popis kroku potřebuje slovo „a pak",
  jsou to dva kroky. Platí i u node: kroky se serverem mají tendenci bobtnat
  (tělo + parse + id + stav + hlavička). Klidně mezikrok, který odpoví 201, a uložení
  přidá další krok — jen to v popisu výslovně řekni.
- Popis kroku: 1) co udělat, konkrétně (který soubor, který prvek), 2) proč, 3) když
  je to nový koncept, krátký příklad **na jiných datech** — nikdy ne řešení k opsání.
- Nápovědy (texty testů) jsou požadavky, které si uživatel odškrtává:
  „Prvek `nav` má `display: flex`." Ne „Test 1".
- **První 1–2 kroky** (`kind: recall`) zopakují bez návodu věc z předchozí sekce.
- **Zeslabování ve třech třetinách** (třetina kroku `i` z `n` = `⌊i·3/n⌋`):
  1. **první třetina:** přesná deklarace nebo volání a příklad na jiných datech,
  2. **druhá třetina:** cíl a 2–3 kandidáti bez hodnoty („Hodí se `justify-content`,
     `gap` nebo `margin-inline` — vyber"),
  3. **poslední třetina:** jen výsledek nebo požadované chování, **bez bloku kódu**
     v popisu. Víc než 50 % kroků poslední třetiny s blokem kódu = `[W2]` varování.
     Řádek řešení v popisu druhé a třetí třetiny = `[W3]` varování.
- Příklady v popisech mají komentáře jako **popisky podcílů** (`// 1. poznej cestu`,
  `// 2. vyber data`), ne popis výsledku.
- **Na každých ~10 kroků jeden `kind: debug`**; workshop s 10+ kroky bez něj = `[W1]`
  varování, méně než ⌊n/10⌋ = `[W4]` doporučení.
- Tipy `# --help--` u všech kroků mimo první třetinu `[T2]`.
- Poslední krok shrne, co se naučil, a ukáže, kde to použije.

**Doporučené** `[W4]`:

- 1 `# --explain--` na ~5 kroků, jen u konceptů, které se vysvětlují na pohovoru.
- `kind: parsons` při prvním setkání se složitějším vzorem (první `reduce` do objektu,
  první handler se `stopPropagation`), další krok pak stejný vzor napíše sám.
- Aspoň jeden krok `kind: choose` na workshop s 10+ kroky: metodu nejmenuj, test ji
  nevynucuje (žádný regex na `find`), projde každý rozumný nástroj.
- Každých ~8 kroků `kind: recall`.
- `see:` ve frontmatteru u každého kroku s novým konceptem.

---

## 5. Tipy `# --help--`

**Povinné:**

- 2–3 tipy na krok `[T3]`, v labu nejvýš 2 `[T3]`.
- **Pořadí:**
  1. jaký koncept + odkaz na nadpis lekce (`[flex kontejner](see:css-flexbox/uvod-do-flexboxu#flex-kontejner-a-flex-polozky)`),
  2. která vlastnost nebo metoda a kam ji dát,
  3. vzor **na jiných datech** (jiný prvek, jiná proměnná, jiná hodnota).
- **Tip nikdy neobsahuje řádek řešení** — ani inline kódem. Verify to hlásí jako
  chybu `[T1]`. Poslední stupeň (porovnání s řešením) dodá platforma sama.
- Tip k jednomu požadavku označ `## --tip-- N`, když krok má víc požadavků a tip se
  týká jen jednoho.

---

## 6. Oprava chyby `kind: debug`

**Povinné:**

- Chyba pochází z **pastí** v lekci téže nebo dřívější sekce; `see:` na ně ukazuje `[D2]`.
- Popis má kostru `## Hlášení` (co se čekalo, co se stalo, přesná hláška) a `## Úkol`.
  Čtyři kroky ladění doplní platforma.
- Seed jde spustit, chyba je v logice nebo v použití API, ne překlep v syntaxi.
- Oprava je malá: řešení nemění víc než `maxChange` (výchozí polovinu) posuzovaných
  řádků `[D1]`.
- Testy: aspoň jeden ověřuje opravu, aspoň jeden, že zbytek funguje dál.

**Doporučené:**

- Kód se tváří jako cizí („kolegův `markAllBought`"), s jinými jmény než workshop.
- Lab „Oprav 3 chyby" (`kind: debug` v labu) v sekcích js-zaklady, js-pole, js-async:
  tři nezávislé chyby, každá s vlastním požadavkem.

---

## 7. Seřaď řádky `kind: parsons`

**Povinné:**

- Jen u vzoru, který student vidí poprvé a je delší než 3 řádky. Parsons nenahrazuje
  psaní — další krok stejný vzor napíše sám.
- Seed obsahuje kontext (data, volání funkce) a prázdnou oblast `--edit--` pro řádky.
- Mezery `__N__` jen pro jednu klíčovou hodnotu (počáteční hodnota `reduce`, operátor),
  nejvýš 2 na krok; všechny přijatelné tvary uveď v `## --blanks--` `[P1]`.

**Doporučené:**

- 4–10 řádků a 1–2 distraktory `[P2]`, které odpovídají typické chybě (`return` uvnitř
  cyklu, `push` místo přiřazení), ne nesmysl.

---

## 8. Vysvětli vlastními slovy `# --explain--`, `:::explain`

**Povinné:**

- Zadání je otázka „proč", ne „co" („Vysvětli, proč `b.push(4)` změnilo i `a`").
- `--model--` má 2–4 věty, jak by to řekl junior na pohovoru. Bez nové látky.
- `--checklist--` 2–6 bodů `[X2]`, každý jedna kontrolovatelná myšlenka (student ji
  v svém textu buď má, nebo nemá). Nezaškrtnuté body jdou do opakování, proto každý
  bod musí dávat smysl i sám o sobě.

**Doporučené:** ~1 na 5 kroků workshopu, 0–2 na lekci.

---

## 9. Otázky (kvíz, `:::check`, `# --questions--`)

**Povinné:**

- **`--why--` pojmenuje mylnou představu**: „Myslíš si, že `map` kopíruje i objekty?
  Kopíruje jen pole, objekty uvnitř jsou tytéž." Ne „Tohle je špatně."
- `--why--` **špatné odpovědi neprozradí správnou** — ukáže se po prvním pokusu, kdy
  student zkouší znovu.
- Každá špatná odpověď u otázky s výběrem má `#### --why--` `[Q2]`.
- Psaná odpověď: `--expected--` je nejkratší jednoznačný tvar. Tvary, které se liší jen
  mezerami, uvozovkami nebo koncovým `;`, platforma přijme sama. Jiné správné tvary
  (`arr.at(-1)` × `arr[arr.length - 1]`) dej do `--accept--`.
- Otázky nestaví na pojmech, které sekce ani předchozí sekce nevysvětlily, a neopakují
  doslova otázky z lekce.

**Doporučené:**

- Psaná otázka má `--why--` `[Q4]`; každá otázka má `--see--` `[Q4]` (souhrn kvízu
  z něj dělá odkazy „kde si to zopakovat").

---

## 10. Lab, projekt, kvíz

### 10.1 Lab

Samostatné zadání bez vedení. Lab ověří, že workshop „sedl".

**Povinné:**

- Popis = kontext + seznam uživatelských příběhů („Když uživatel klikne na…, …").
  Požadavky nečísluj dvakrát (jednou v popisu, podruhé v textu nápovědy jinak).
- Nápovědy = jednotlivé požadavky, 8–20 `[L2]`.
- Seed je skoro prázdný; u runtime js obsahuje **prázdné kostry požadovaných funkcí
  s JSDoc** `[L1]`, aby nenapsané funkce nehlásily sérii `ReferenceError`.
- „Než začneš" nepiš — dodá ho platforma.

**Doporučené:**

- `# --approaches--` se 2–4 opravdu odlišnými přístupy `[X2]` (for…of × `reduce` ×
  `Math.max(...)`) a větou, kdy se který hodí. Všechny musí projít testy `[X1]` — když
  neprojdou, jsou testy příliš přísné.
- 1–2 tipy u požadavků, na kterých se student typicky zasekne.

### 10.2 Projekt

Na konci celku, ve VS Code. Něco, co by si dal do portfolia.

**Povinné:**

- Zadání jako od klienta + uživatelské příběhy + technické požadavky. Testy
  kontrolují chování, ne konkrétní implementaci.
- `# --review--` s rubrikou kvality, kterou testy nekontrolují: jména, duplicita,
  README, „co příště jinak".
- `## --extensions--`: „Rozšíření bez testů" a u vlajkových projektů „Rozšíření do
  portfolia" (skutečné API, nasazení, README s rozhodnutími).

### 10.3 Kvíz

Na konci sekce.

**Povinné:**

- Aspoň 5 otázek `[Q1]`, doporučeno 10–20 `[Q4]`.
- Otázky na chápání a čtení kódu („co vypíše tento kód?", „proč se tenhle prvek
  nezarovná?"). Nejlepší jsou otázky na čtení kódu s pastí z workshopu. Žádné chytáky
  na slovíčka.

**Doporučené** `[Q4]`:

- **20–30 % otázek z dřívějších sekcí téže části** (s `--see--` na ně).
- **Jedna sada `# --code--`** nad delším „cizím" kódem: 1–3 soubory o 40–120 řádcích
  `[Q3]`, psané jiným stylem než workshop (jiná jména, `for` místo `map`), 3–5 otázek
  s odkazy na čísla řádků.
- **Jedna otázka „najdi v anglické dokumentaci"** (odpověď je v MDN, student ji tam
  musí dohledat).
- Asi polovina otázek s psanou odpovědí.

---

## 11. Soubory sekce

### 11.1 Karty `cards.md`

**Povinné:**

- Sekce má `cards.md` `[S8]`.
- **Každá karta = jedna past nebo jeden vzor.** Karta, která se ptá na dvě věci, se
  špatně hodnotí.
- Karta `code`: test nad seedem selže, nad řešením projde `[C1]`. Karta `output`
  s blokem js: `--expected--` odpovídá skutečnému výstupu `[C2]`.
- Karta nepřináší novou látku; ptá se na něco, co sekce vysvětlila.

**Doporučené** `[S9]`:

- 15–30 karet na sekci, z toho 5–10 `free` (pohovorové otázky s modelovou odpovědí
  ve 3–6 větách).
- Každá karta má `--see--` — podle něj se karta zařadí do opakování až po splnění
  daného modulu.
- Mix typů: `output` na pasti, `code` na vzory, `css` na deklarace, `free` na „proč".

### 11.2 Pojmy `pojmy.md` a `[[pojem]]`

**Povinné:**

- Pojem, který sekce zavádí, má záznam s `en`, `lekce` a definicí v 1–3 větách.
  Aliasy = skloňované tvary, které v textu použiješ.
- `[[pojem]]` jen na existující pojem `[S5]` a ne v sekci, která je na trase **před**
  sekcí, kde se pojem vysvětluje `[S6]`.

**Doporučené:** `[[pojem]]` při **prvním** výskytu v každé lekci a v popisu kroku, kde
se pojem poprvé použije; ne u každého výskytu. Nepoužitý pojem `[S9]` smaž.

### 11.3 Tahák `tahak.md`

**Doporučené** `[S9]`: tabulky (např. `justify-content` / `align-items` /
`align-content`), 5–10 nejčastějších vzorů kódu, sekce pastí. **Žádná nová látka** —
jen to, co sekce vysvětlila, zhuštěně na jednu vytištěnou stránku.

### 11.4 Výstupy `outcomes`

**Doporučené** `[S9]`: 3–8 vět „Po sekci umíš" v `section.json`, každá kontrolovatelná
schopnost („Napíšeš…", „Poznáš…", „Vysvětlíš…"), s `links` na místa, kde se učí.

### 11.5 Odkazy `see`

**Povinné:** reference vedou na nejkonkrétnější místo (kotva nadpisu, ne celá lekce)
`[S4]`. Odkazy v textu piš jako `[text](see:…)`, nikdy ručně `#/modul/…`.

---

## 12. Testy

**Povinné:**

- **Testuj chování a výsledek, ne zápis.** `getComputedStyle(el).display === 'flex'`,
  ne regex na `display:flex`. Uživatel smí napsat řešení jinak než autor.
- Regex na zdroják jen tam, kde krok učí konkrétní syntaxi (např. „použij
  `for…of`") — a pak nejdřív `helpers.stripComments`. **Benevolentně** k legitimním
  variantám (destrukturalizace ve `for…of`, šipková funkce, `Intl.Collator` místo
  `localeCompare`). Požadavek, který v prohlížeči uživatele projde i bez dodržení
  (jazyk `'cs'`), kontroluj zvlášť.
- **Každá aserce má českou zprávu se vstupem**: `assert.equal(sum([1, 2]), 3, 'sum([1, 2]) má vrátit 3')`
  `[A1]`. Skutečnou a očekávanou hodnotu doplní platforma sama, zpráva říká, **co** se
  volalo a proč na tom záleží. Holé „Expected values to be strictly equal"
  začátečníkovi nic neřekne.
- Kontroluj i okrajové případy, které krok zmiňuje (prázdné pole, nula…), ale
  nepřidávej požadavky, o kterých popis mlčí.
- Testy nesmí záviset na pořadí, na čase ani na síti. Žádné `fetch` na internet —
  na API používej lokální data nebo mock v seedu.
- **Každý test vyzkoušej na 2–3 jiných správných a 2–3 typicky chybných řešeních**
  přes skutečný runner — seed a řešení z verify nestačí. Typické díry: roztažená
  krabička (`stretch`) má stejný střed jako vycentrovaná (zarovnání textu měř přes
  `Range` textu, ne přes rámeček prvku); handler bez `return` projde testem s jediným
  požadavkem (pošli jich víc za sebou); testovací data náhodou vyhoví i špatné logice
  (abecední pořadí = pořadí v poli).
- **Tolerance v layout testech** podle toho, co je vidět okem (pár px), zvlášť v labech,
  kde si uživatel smí vzhled upravit — jinak odmítneš správné `flex: 1` nebo grid.
- Seed jde spustit bez syntaktické chyby `[K2]` — jinak student začíná s „Kód nejde
  spustit".
- `npm run overit -- content/<tvoje-sekce>` projde **bez chyb** `[K1]` a všechna
  varování jsou opravená nebo zdůvodněná.

---

## 13. Kód v seedech, řešeních a ukázkách

**Povinné:**

- Moderní, idiomatický kód, jak by ho napsal dobrý senior dnes: `const`/`let`,
  arrow funkce tam, kde dávají smysl, sémantické HTML, CSS bez zbytečných hacků,
  logické vlastnosti tam, kde je to přirozené, přístupnost (label, alt, focus).
- Žádné závislosti z internetu (CDN, fonty z Google). Systémové fonty.
- **Příklad v popisu kroku nesmí být kód řešení.** Stejný vzor, jiný kontext. V první
  třetině workshopu smí text jmenovat přesnou deklaraci nebo volání (`display: flex`),
  blok kódu s příkladem ale vždy ukazuje jiná data.
- **Rady „zkus si to v náhledu" ověř proti UI.** Media dotaz reaguje na šířku okna
  náhledu, ne na `max-width` kontejneru. Na šířku používej přepínač šířky náhledu
  („Jako testy · 768 · 375 · panel"), ne dočasný `max-width` v kódu. Nepiš „náhled
  je široký".

**Doporučené:** workshopy mají vypadat hezky — výsledek by si uživatel rád ukázal.
Pěkné barvy, rozumná typografie, žádné Times New Roman.

---

## 14. Pořadí v sekci

Typicky: lekce → workshop → (lekce → workshop)… → lab → kvíz. Sekce má 4–10 modulů,
k tomu `cards.md`, `pojmy.md`, `tahak.md` a `outcomes`. Po sekci musí uživatel umět
téma použít v novém kontextu.

## 15. Zdroj látky

Stará výuková hra `~/arkada` (jen ke čtení, NIC v ní neměň) má v `tikety/*/`
hodně dobrých výkladů, pastí a příkladů (`tiket.json` pole `rozbor`, `priklad`,
`kontext`) a v `docs/*.md` osnovy. Použij je jako surovinu — **bez** příběhu
o firmě Arkáda, bez postav, bez tiketů. Obsah vždy přepiš do formátu Akademie.

---

## 16. Kontrolní seznam před odevzdáním sekce

| co | povinné | verify |
|---|---|---|
| lekce: pretest před prvním `##`, `:::check` po částech, předpověď u pasti, MDN oddíl | pretest, check, předpověď | E4, E5, E6 |
| lekce: tučný mentální model, kontrastní pár, „kde to nefunguje", žádné výstupy v komentářích | ano | revizor |
| workshop: recall na začátku, zeslabování, 1 debug / 10 kroků, tipy mimo 1. třetinu | ano | W1–W3, T2 |
| workshop: 1 explain / 5 kroků, parsons u nového vzoru, 1× choose | doporučené | W4 |
| tipy: 2–3 v pořadí koncept → kde → vzor, bez řádku řešení | ano | T1, T3 |
| aserce s českou zprávou | ano | A1 |
| lab: 8–20 požadavků, kostry funkcí, přístupy | požadavky a kostry | L1, L2, X1, X2 |
| projekt: `# --review--` s rubrikou a rozšířeními | ano | revizor |
| kvíz: ≥ 5 otázek, `why` u špatných odpovědí; 10–20, sada `# --code--`, 20–30 % ze starších sekcí | první dvě | Q1–Q4 |
| `cards.md` 15–30 karet, 5–10 `free`, `see` | soubor ano | S8, S9, C1–C3 |
| `pojmy.md`, `tahak.md`, `outcomes` | doporučené | S5, S6, S9 |
| všechny `see` a `[[pojmy]]` platné | ano | S4, S5 |
| `npm run overit -- content/<sekce>` bez chyb | ano | K1 a vše výš |

---

## 17. Poučení z přepracovaných pilotů (povinné)

- **Layout test na zarovnání vyzkoušej i s řešením BEZ té vlastnosti.** Když dají obě varianty
  stejné rozměry (stejně vysoké položky: `stretch` = `center`), požadavek do zadání nepatří,
  nebo změň data, aby byl rozdíl vidět. Střed měř přes `Range` textu.
- **Data testu musí rozlišit správnou a typicky špatnou logiku.** Řazení textů piš „podle české
  abecedy" a volte data, na kterých obyčejné `sort()` nebo `<` selže (Č × C/D/Z, Ch za H).
- **Karty a kvíz nekopírují** text `:::check`, otázek lekce ani kód předpovědí — kontrolní otázky
  se už samy zakládají v opakování, shodná karta by přišla podruhé. Stejný vzor, jiná data.
- **Otázky na konci lekce** neopakují kód pretestu ani kontrolní otázky; ptej se na sousední případ.
- **Otázka ani `--why--` nestaví na pojmu, který výklad neuvedl.** Před odevzdáním hledej klíčové
  slovo každé otázky v textu lekce.
- **3. stupeň tipu u `recall` a `choose` není přejmenované řešení** — popisky podcílů (`// 1. …`)
  nebo odkaz na vlastní dřívější funkci. U běžných kroků totéž, jakmile se vzor liší jen jmény.
- **Lab:** rámeček `[!TIP]` v zadání neprozrazuje postup; tip k požadavku vede k výpočtu, ne k hodnotě.
- **Každou past ověř spuštěním a hlídej zobecnění.** Platí-li jen za podmínky, napiš ji
  („`reduce` bez `return` spadne, jen když s akumulátorem pracuješ").
- **Barevný výklad v praxi:** kontrastní dvojice slov do `==zvýraznění==` (ne tučně, nejvýš 2× na
  lekci); tučně nejvýš 1× na odstavec, nikdy tři podstatná jména v jedné větě; v postupu výpočtu
  tučně jen výsledek; seznam s tučným úvodem odrážek a názvy tlačítek UI (**Spustit**) tučně smí být.
- **Projekt a lab:** příběhy v popisu nečísluj (požadavky se v UI číslují zvlášť); odkazuj slovy.
- **Když testy měří na jiné šířce, než nabízí přepínač náhledu** (testy / 768 / 375), napiš to v zadání.
- **Debug krok** působí přirozeněji, když chybný kód přijde dřív jako „kolegův modul" a debug krok
  ho až opraví (vzor `node-zaklady` 011 → 012).
- **Sada `# --code--` s více soubory:** otázky jmenují soubor u čísla řádku („řádek 65 v `shop.css`").
- **Tahák:** nadpis vzoru odpovídá kódu pod ním; tahák nezačíná vlastním nadpisem `#`
  (UI ho už nadepisuje).

---

## 18. Aby to bavilo a šlo to rychle (povinné)

Motivaci drží tři věci: **smysl** (vím, k čemu to je), **pocit, že to zvládám** (obtížnost
tak akorát a rychlá odezva) a **volba** (můžu to udělat po svém). K tomu **viditelný pokrok
na něčem, co stojí za to**. Žádné body, série ani příběh: odměnou je výsledek na obrazovce,
ne slova. Podklady: teorie sebeurčení (Ryan a Deci), princip malých pokroků (Amabile
a Kramer), pravidlo 85 % (Wilson a kol., 2019), personalizace kontextu (Walkington),
kurzy Joshe Comeaua, výzvy Frontend Mentoru a projekty The Odin Project.

- **Workshop staví věc, kterou by si student rád ukázal.** Skutečný produkt (navigace
  e-shopu, stránka herního serveru se stavem a hráči, přehrávač, přehled výdajů,
  rezervace), ne „cvičná stránka". `summary` jmenuje výsledek slovesem („Postavíš kartu
  produktu s hodnocením a košíkem"), ne téma („Flexbox"). Kontrola: dal by si student
  snímek výsledku na LinkedIn?
- **První viditelná změna do 5 minut.** Nejpozději krok 3 workshopu (a první `:::live`
  lekce do konce první části `##`) změní náhled nebo výstup tak, že je to vidět. Žádné
  tři kroky přípravy bez odezvy.
- **Seed není prázdná bílá stránka.** Obsah, texty a základní design (custom properties
  pro barvy, rozestupy, písmo) dodá seed; student píše to, co sekce učí. Kosmetiku, kterou
  sekce neučí, nepiš do kroků. Výjimka: sekce o té kosmetice (`css-design`, `css-animace`).
- **Každý krok výsledek viditelně posune.** Krok, po kterém se náhled ani konzole nezmění,
  je výjimka a jeho popis řekne, kde se změna projeví.
- **Výsledek vypadá jako z reálného webu.** Paleta ze 3–5 barev, systémové písmo
  s hierarchií velikostí, rozestupy na škále, stavy `:hover` a `:focus-visible`, aspoň
  jeden plynulý přechod. Platí pro výsledek workshopu, laby i hotové stavy projektů.
- **V každé CSS sekci od `css-zaklady` aspoň jeden efekt, který udělá dojem.** Přechod,
  hover efekt, gradient, stín s hloubkou, animace nebo `scroll-timeline`. V JS sekcích
  místo efektu okamžitá interaktivita (živý filtr, přetažení, klávesová zkratka). Efekt
  stojí jen na probrané látce. Když ho dodává seed, pojmenuj ho a řekni, kde se ho naučí
  („tohle je `transition`, dostaneme se k němu v `css-animace`").
- **Smysl hned na první obrazovce.** Lekce i workshop začínají 1–2 větami, kde to student
  potká na skutečném webu nebo v práci (jmenuj komponentu nebo typ webu). Žádná historie
  technologie na úvod.
- **Témata a data z reálného světa, v sekci pestrá.** Česká data (ceny v Kč, česká jména
  a místa, skutečné názvy produktů), žádné `foo`, `bar` ani lorem ipsum. Dva workshopy
  v jedné sekci nemají stejnou doménu.
- **Na konci workshopu výzva „Udělej po svém".** Poslední krok má oddíl `## Udělej po svém`
  se 2–4 rozšířeními bez testů: aspoň jedno vizuální, jedno funkční a „přeměň to na téma,
  které tě zajímá". Každé rozšíření má jednu větu s vodítkem, ne postup.
- **Laby nechávají volbu.** Testy kontrolují strukturu a chování, ne texty, barvy ani
  téma. Když to testy dovolí, zadání to řekne: „Téma, texty a vzhled jsou tvoje volba."
  Každá sekce s labem má aspoň jeden lab s volným tématem.
- **Obtížnost tak akorát.** Než workshop odevzdáš, projdi ho sám bez řešení. Krok, kde
  jen opisuješ, zeslab (méně návodu). Krok, kde bys potřeboval víc než 3 tipy nebo nad ním
  strávil víc než ~5 minut, rozděl. Cíl: běžný student projde kontrolu většinou na první
  nebo druhý pokus.
- **Realistický odhad `minutes`.** Počítej ~150 slov výkladu za minutu, 1 minutu na každý
  interaktivní blok nebo otázku, 2 minuty na krok první třetiny, 3 minuty na krok druhé
  a 5 minut na krok poslední třetiny, 5–8 minut na požadavek labu. Zaokrouhli nahoru na
  5 minut.
- **Zastavit se dá po 20–30 minutách s hotovým kusem.** Workshop nad 60 minut má každých
  ~15 kroků mezistav, který stojí sám (hotová hlavička, funkční filtr), a popis toho kroku
  to řekne („Tady máš hotovou hlavičku, klidně si dej pauzu"). Modul nad 90 minut rozděl.
- **Teorie a tvorba se střídají.** V pořadí sekce nejsou dvě lekce za sebou bez workshopu
  nebo labu mezi nimi. Výjimka: krátká lekce do 5 minut.
- **Konec modulu ukáže další krok.** Poslední krok workshopu nebo závěr lekce jednou větou
  řekne, co student postaví dál a co k tomu z právě naučeného použije („Příště z těchhle
  karet uděláš filtrovatelný katalog").

- **Řádek konzole nikdy neporovnávej přes `===` se syrovým textem.** Student může mít
  neviditelný rozdíl (rozložené `č`, pevná mezera, mezera na konci) a řešení je přitom správné.
  Použij normalizaci: `const sameLine = (a) => a.normalize('NFC').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();`
  a porovnávej `sameLine(line.text) === sameLine('…')`.

---

## 19. Čtyři věci, které učení nejvíc zrychlí (povinné)

Kapitoly 2, 17 a 18 už pokrývají vybavování z paměti, předpovědi, ubírání pomoci
a opakování s odstupem. Tahle kapitola doplňuje čtyři věci, které v nich chyběly a
které mají v didaktice programování nejsilnější podklad. Platí pro nové sekce
**i pro přepisy těch hotových**.

### 19.1 Kroky mají jméno podle účelu, ne podle kódu

Novic si z ukázky odnese jednotlivé řádky, ne postup. Postup si odnese tehdy, když má
každá část ukázky **jméno říkající, k čemu je** („Najdi prvek", „Zapiš posluchače",
„Uklid po sobě"). Pojmenované podcíle patří mezi nejsilnější doložené zásahy do výuky
programování (Margulieux, Catrambone a Guzdial; přehled na `cs1subgoals.org`).

- **Delší ukázka v lekci se dělí na 2–4 pojmenované části.** Jméno je sloveso + předmět
  a drží i mimo tenhle příklad. Piš ho jako komentář nad blok (`// 1. Připrav data`) nebo
  jako nadpis `###`. Ne „Řádky 4–7", ne „Krok 2".
- **Popis kroku workshopu začíná účelem.** První věta `# --description--` říká, **co** se
  tímhle krokem v aplikaci změní a proč, až pak přijde, jak. Titulek kroku je taky účel
  („Zavři dialog klávesou Esc"), ne technika („`keydown`").
- **Ve druhé polovině sekce si jména vymýšlí student.** Nejpozději u druhého výskytu
  stejného vzoru použij `# --explain--` / `:::explain`, kde má student **sám pojmenovat
  kroky** postupu, který právě napsal. Výzkum je v tomhle jednoznačný: hotová jména
  pomůžou při blízkém přenosu, ale vlastnoručně vymyšlená pomůžou víc, když má student
  vzor použít jinde. Proto nejdřív dostane jména hotová a pak si je vyrábí sám.
- **Nedávej obojí naráz.** Krok, kde student jména vymýšlí, nemá zároveň tip s hotovými
  jmény; hotová jména patří až do modelové odpovědi.

Kontrola: přečti si jen jména podcílů modulu za sebou. Vznikne z nich srozumitelný
postup, který by student dokázal použít na jiné zadání? Když ne, jména jsou o kódu.

### 19.2 Jeden vzor, tři setkání: ukázka → doplňování → od nuly

Nový vzor (posluchač událostí, `reduce` do objektu, `fetch` s ošetřením chyby) se
neučí jedním krokem. V sekci ho student potká **třikrát a pokaždé s menší oporou**:

1. **hotová ukázka** — vidí vzor celý, s pojmenovanými podcíli (19.1); jen ho přečte
   a předpoví, co udělá,
2. **doplňování** — `kind: parsons` s `--blanks--`: řádky seřadí a vypíše do nich
   chybějící kusy. Tohle je nejlepší poměr naučeného k času: doplňování vede k psaní
   kódu stejně dobře jako psaní od nuly, ale zabere méně času a méně frustruje,
3. **od nuly** — běžný krok, `kind: recall` nebo požadavek labu, bez vzoru na očích.

Pravidla:

- **Žádný vzor nejde z ukázky rovnou do psaní od nuly.** Když na tři setkání není místo,
  vynech ukázku, ne doplňování.
- **Třetí setkání je v jiné doméně než první.** Stejný vzor, jiná data a jiný web —
  jinak si student zapamatuje úlohu, ne vzor.
- **Doplňování má rozptylovače** (`--distractors--`), které odpovídají skutečné chybě,
  ne náhodné hlouposti.

Kontrola: u každého vzoru, který sekce učí, jdou vyjmenovat tři moduly nebo kroky,
kde se objevil, a pomoc v nich jde dolů.

### 19.3 Kvíz a lab mají v sobě starší látku

Když se celý kvíz ptá jen na právě probranou sekci, student odpovídá podle kontextu
(„jsme v sekci o `reduce`, takže `reduce`"), ne podle rozpoznání úlohy. Promíchaná
látka je při procvičování těžší, ale drží déle a hlavně učí **vybrat správný nástroj**.

- **Aspoň 2 otázky kvízu jsou z dřívějších sekcí** a míří tam, kde se to plete s právě
  probraným (`map` × `forEach`, `position: sticky` × `fixed`, `==` × `===`).
- **Aspoň jedna otázka nutí vybrat mezi novým a starým nástrojem** a zeptá se **proč**.
- **Lab má aspoň jeden požadavek, který stojí na starší sekci** — v zadání se to
  nepřipomíná odkazem, ať si to student vybaví sám. Odkaz patří až do `--why--`.
- **Karty tohle nenahrazují.** Karty vracejí jednotlivé fakty; kvíz s promíchanou
  látkou trénuje rozhodování mezi nimi.

Kontrola: u každé otázky kvízu se zeptej — dal by se odpovědět správně jen z toho, že
vím, v jaké jsem sekci? Když ano, otázka nic neměří.

### 19.4 Vysvětlení vlastními slovy je volné, ne doplňovačka

`:::explain` a `# --explain--` fungují jen tehdy, když student **skutečně formuluje**.
Volné vysvětlení zlepšuje porozumění kódu měřitelně víc než výběr z možností nebo
doplnění slova do věty.

- **Zadání je otevřená otázka**, ne věta s dírou: „Proč se změna projeví i tam, kde jsi
  nic neměnil?" místo „Doplň: pole se předává ___".
- **Modelová odpověď se ukáže až po odeslání** a student se s ní porovná sám přes
  `## --checklist--`. Body checklistu jsou myšlenky, ne slova — „zmínil jsem, že obě
  proměnné ukazují na stejné pole" projde i při jiné formulaci.
- **Checklist má 2–4 body.** Víc bodů vede k odškrtávání bez čtení.
- **Kde to umístit:** hned za nejtěžší částí lekce (ne na konci) a po druhém výskytu
  vzoru ve workshopu, kdy už má student co vysvětlovat.
- **Na co se ptát:** proč to funguje, kdy to selže a čím se to liší od sousedního
  nástroje. Ne „co dělá `map`" — to je karta, ne vysvětlení.

Kontrola: šla by tvoje otázka zodpovědět jedním slovem? Pak to není vysvětlení.
