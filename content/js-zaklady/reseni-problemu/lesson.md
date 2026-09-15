# Jak řešit úlohu

:::check pretest
Dostaneš zadání: „Napiš funkci, která vrátí součet sudých čísel od 1 do zadaného čísla." Co uděláš jako první?

### --answer--

Otevřu editor a začnu psát cyklus, zbytek se ukáže.

#### --why--

Tak začíná většina zaseknutí. Víš v tu chvíli, co má funkce vrátit pro číslo 7?

### --correct--

Vymyslím pár vstupů a spočítám ručně, co pro ně funkce vrátí.

#### --why--

Příklady ti řeknou, jestli zadání rozumíš, a později poslouží jako testy. Proč právě tohle, vysvětlí lekce.

### --answer--

Najdu hotové řešení a upravím ho.

#### --why--

Cizí řešení bez pochopení úlohy neupravíš — nepoznáš, jestli dělá, co má. Čím začít, ukáže lekce.
:::

:::check pretest
Jaký je součet sudých čísel od 1 do 7? Spočítej ručně a napiš jen výsledek.

### --expected--

12

### --why--

Sudá čísla mezi 1 a 7 jsou 2, 4 a 6, jejich součet je 12. Právě jsi udělal krok, který většina lidí přeskočí — a hned uvidíš, proč je důležitý.
:::

V labu, v práci i na pohovoru dostaneš zadání v pár větách a prázdný soubor. Kdo začne rovnou psát kód, zasekne se po třech řádcích, protože řeší dvě věci najednou: **co** má program dělat a **jak** to zapsat. Programátoři s praxí tyhle dvě věci oddělují. Tahle lekce ukáže postup v pěti krocích na jedné malé úloze.

> [!REMEMBER]
> **Kód je poslední krok.** Nejdřív musíš úlohu umět vyřešit ručně na příkladu — co nespočítáš na papíře, nenapíšeš ani v kódu.

Úloha pro celou lekci:

> Napiš funkci `sumEven(limit)`, která vrátí součet všech sudých čísel od 1 do `limit`.

## 1. Přeformuluj zadání vlastními slovy

Řekni zadání jinými slovy a pojmenuj **vstup** a **výstup**. Když to nejde, zadání nerozumíš a kód by byl hádání.

- Vstup: jedno celé číslo `limit`.
- Výstup: jedno číslo — součet.
- Vlastními slovy: „Projdi čísla od 1 do `limit` a sečti ta, která jsou dělitelná dvěma."

Při přeformulování vyplavou otázky, na které zadání neodpovídá: Počítá se i `limit` sám, když je sudý? Co když je `limit` nula nebo záporný? V práci se na ně zeptáš autora zadání. V labu je najdeš v požadavcích. Tady platí: `limit` se počítá a pro čísla menší než 2 je součet `0`.

:::check
Co je výstupem funkce `sumEven`?

### --answer--

Seznam sudých čísel od 1 do `limit`.

#### --why--

Sudá čísla funkce cestou potřebuje, ale co vrací? Přečti si zadání ještě jednou.

### --correct--

Jedno číslo, součet sudých čísel.

#### --why--

Zadání chce součet, tedy jednu hodnotu. Vyjasnit si tvar výstupu je první věc, kterou přeformulování přinese.

### --answer--

`true`, když je `limit` sudý.

#### --why--

To by byla jiná úloha. Na co se zadání ptá?

### --see--

js-zaklady/reseni-problemu#1-preformuluj-zadani-vlastnimi-slovy
:::

## 2. Vymysli příklady, i ty okrajové

Než napíšeš řádek kódu, spočítej ručně výsledek pro několik vstupů. Vyber běžné případy a pak ty „na hraně" — [[okrajový případ|okrajové případy]], kde se kód láme nejčastěji: nula, jednička, hraniční hodnota, sudé × liché.

| `limit` | sudá čísla | výsledek | proč ho chceš |
|---|---|---|---|
| `6` | 2, 4, 6 | `12` | běžný případ, sudý limit se počítá |
| `7` | 2, 4, 6 | `12` | lichý limit — musí vyjít stejně jako `6` |
| `2` | 2 | `2` | nejmenší limit s jedním sudým číslem |
| `1` | — | `0` | žádné sudé číslo |
| `0` | — | `0` | okrajový vstup |

Tahle tabulka je víc než příprava: jsou to **testy**. Až bude kód hotový, vyzkoušíš ho přesně na nich. Kdyby sis vybral jen `limit = 7`, neodhalíš chybu, která se projeví jen u sudého limitu.

:::check
Kolik vrátí `sumEven(10)`?

### --expected--

30

### --why--

Sudá čísla do deseti včetně jsou 2, 4, 6, 8 a 10. Součet je `30`. Kdo zapomene, že se limit počítá, dostane `20`.

### --see--

js-zaklady/reseni-problemu#2-vymysli-priklady-i-ty-okrajove
:::

## 3. Rozlož řešení na kroky v komentářích

Teď popiš postup tak, jak bys ho řekl kolegovi — pořád bez syntaxe, jen v komentářích. Každý komentář je jeden malý podcíl, který umíš napsat zvlášť:

```js
function sumEven(limit) {
  // 1. založ průběžný součet s nulou
  // 2. projdi čísla od 1 do limit včetně
  // 3. když je číslo sudé, přičti ho k součtu
  // 4. po projití všech čísel vrať součet
}
```

Tomuhle zápisu se říká [[pseudokód]]. Výhoda: když se zasekneš, víš přesně na kterém podcíli. „Nevím, jak zjistit, že je číslo sudé" je otázka, na kterou odpověď najdeš (`n % 2 === 0`). „Nevím, jak to napsat" není.

Každý podcíl pak nahradíš jedním až třemi řádky kódu a komentář klidně nech — kolegovi řekne, co ten kus dělá.

:::check
Který podcíl chybí v tomhle rozkladu úlohy „vrať počet samohlásek v textu"?

```js
// 1. založ počítadlo s nulou
// 2. projdi text znak po znaku
// 3. vrať počítadlo
```

### --answer--

Převést text na číslo.

#### --why--

Počítáš znaky textu, s číslem se tu nepracuje. Co se má stát s každým znakem?

### --correct--

Když je znak samohláska, zvyš počítadlo.

#### --why--

Bez tohoto kroku počítadlo zůstane na nule. Rozklad musí obsahovat i rozhodnutí uvnitř cyklu.

### --answer--

Vypsat výsledek do konzole.

#### --why--

Zadání chce počet vrátit, ne vypsat. Co chybí mezi procházením znaků a vrácením?

### --see--

js-zaklady/reseni-problemu#3-rozloz-reseni-na-kroky-v-komentarich
:::

## 4. Projdi postup ručně

Před spuštěním si kód „odkrokuj" v hlavě nebo na papíře pro jeden příklad z tabulky. Sleduj hodnotu každé proměnné po každém průchodu. Zkus to na prvním pokusu, který napsal kolega:

:::live js predict
```js
function sumEven(limit) {
  let sum = 0;
  for (let n = 1; n < limit; n++) {
    if (n % 2 === 0) {
      sum += n;
    }
  }
  return sum;
}

console.log(sumEven(6));
```
--question-- Projdi cyklus ručně pro `limit = 6`. Co vypíše `console.log`?
--expected-- 6
--why-- Cyklus běží pro `n` = 1 až 5, protože `n < 6` šestku nepustí. Sudá jsou jen 2 a 4, součet `6`. Podle tabulky má vyjít `12`. S `limit = 7` by chyba zůstala schovaná — i proto patří do příkladů sudý i lichý limit. Oprava: `n <= limit`.
:::

Ruční průchod je nejlevnější ladění, jaké existuje. Najde off-by-one, zapomenutý `return` i proměnnou deklarovanou na špatném místě dřív, než je musíš hledat v konzoli.

:::check
Kolega opravil podmínku na `n <= limit`. Pro který vstup z tabulky ještě ověříš, že oprava nerozbila okrajový případ bez sudých čísel?

### --answer--

`6`

#### --why--

`6` ověří právě opravenou chybu. Který řádek tabulky nemá žádné sudé číslo?

### --correct--

`1`

#### --why--

Pro `1` cyklus proběhne jednou s lichým číslem a součet musí zůstat `0`. Stejně poslouží `0`, kde cyklus neproběhne vůbec.

### --answer--

`7`

#### --why--

`7` je běžný lichý limit s několika sudými čísly. Který vstup žádné sudé číslo nemá?

### --see--

js-zaklady/reseni-problemu#4-projdi-postup-rucne
:::

## 5. Teprve teď kód — a vyzkoušej ho na příkladech

Podcíle z komentářů přepiš do kódu a spusť ho na **všech** příkladech z tabulky:

:::live js
```js
function sumEven(limit) {
  // 1. založ průběžný součet s nulou
  let sum = 0;
  // 2. projdi čísla od 1 do limit včetně
  for (let n = 1; n <= limit; n++) {
    // 3. když je číslo sudé, přičti ho k součtu
    if (n % 2 === 0) {
      sum += n;
    }
  }
  // 4. po projití všech čísel vrať součet
  return sum;
}

console.log(sumEven(6), 'čekám 12');
console.log(sumEven(7), 'čekám 12');
console.log(sumEven(2), 'čekám 2');
console.log(sumEven(1), 'čekám 0');
console.log(sumEven(0), 'čekám 0');
```
:::

Zkus změnit krok cyklu na `n += 2` a start na `2` — funkce nepotřebuje `if` a vrací totéž. Když máš fungující řešení a příklady, můžeš ho beze strachu zlepšovat: příklady ti hned řeknou, jestli jsi něco rozbil.

:::explain
Vysvětli vlastními slovy, jak bys postupoval u úlohy „součet sudých čísel od 1 do `limit`", než napíšeš první řádek kódu, a proč v tomhle pořadí.

## --model--

Nejdřív si zadání řeknu vlastními slovy: vstup je číslo, výstup součet sudých čísel. Pak ručně spočítám příklady, i okrajové — sudý a lichý limit, jedničku a nulu — protože mi řeknou, co přesně má vyjít, a později poslouží jako testy. Postup rozepíšu do komentářů po malých krocích, abych věděl, kde se případně zaseknu. Jeden příklad projdu ručně a teprve pak kroky přepíšu do kódu a vyzkouším ho na všech příkladech.

## --checklist--

- Zadání přeformuluju a pojmenuju vstup a výstup.
- Ručně spočítám příklady včetně okrajových případů.
- Příklady použiju jako testy hotového kódu.
- Postup rozložím na malé kroky v komentářích.
- Postup projdu ručně dřív, než kód spustím.
:::

:::check
Kolega řešení zkrátil: cyklus začíná na `2`, jde po dvou (`n += 2`) a `if` vynechal. Co vrátí jeho verze pro `sumEven(1)`?

### --expected--

0

### --why--

Start `n = 2` nesplní podmínku `2 <= 1`, cyklus neproběhne a vrátí se počáteční `0`. Kratší verze prošla okrajovým případem — a víš to jen díky tabulce příkladů.

### --see--

js-zaklady/reseni-problemu#5-teprve-ted-kod-a-vyzkousej-ho-na-prikladech
:::

## Když se zasekneš

Zaseknutí k programování patří. Pomůže, když ho zúžíš:

- **Vrať se ke kroku, který nefunguje.** Který podcíl z komentářů neumíš napsat? Hledej odpověď jen na něj.
- **Zmenši úlohu.** Nejde součet sudých čísel? Napiš nejdřív cyklus, který čísla jen vypíše. Pak přidej podmínku. Pak součet.
- **Vypiš mezivýsledky.** `console.log('n:', n, 'sum:', sum)` uvnitř cyklu ukáže, kde se skutečnost rozchází s tvým ručním průchodem.
- **Použij nápovědy postupně.** V krocích i labech Akademie se tipy otevírají po jednom od obecného ke konkrétnímu. Otevři jeden a zkus to znovu.

V labech nad zadáním najdeš formulář *Než začneš* s otázkami ze kroků 1–3: zadání vlastními slovy, čemu se úloha podobá a postup v bodech. Vyplnit ho nemusíš, ale je to přesně tahle lekce v praxi.

:::check
Máš napsat funkci, která vrátí počet dnů v měsíci s teplotou nad 25 °C, a nevíš si rady. Co je nejlepší další krok podle téhle části?

### --answer--

Smazat všechno a začít od začátku jiným způsobem.

#### --why--

Nový začátek neřeší, kde přesně ses zasekl. Jak úlohu zmenšit?

### --correct--

Napsat nejdřív cyklus, který teploty jen vypíše, a pak přidat podmínku a počítání.

#### --why--

Menší úloha, kterou umíš ověřit, tě posune. Každý další kus přidáš a hned vyzkoušíš.

### --answer--

Otevřít všechny nápovědy najednou.

#### --why--

Nápovědy jsou odstupňované, aby ti pomohly přesně tolik, kolik potřebuješ. Která pomoc je menší?

### --see--

js-zaklady/reseni-problemu#kdyz-se-zaseknes
:::

## Typické chyby a pasti

### Kód dřív než příklady

> [!PITFALL]
> **Začít psát kód bez ručně spočítaných příkladů.** Příznak: po deseti minutách máš kód, o kterém nevíš, jestli je správně, protože nevíš, co má vyjít. Oprava: zastav se a napiš 3–5 vstupů s očekávaným výstupem.

### Test na jediném příkladu

> [!PITFALL]
> **Kód vyzkoušený na jednom vstupu, který náhodou vyjde.** Příznak: funkce „funguje", ale v labu nebo u uživatele selže na nule, na hranici nebo na sudém čísle. Oprava: zkoušej vždycky celou tabulku příkladů, hlavně okrajové případy.

### Všechno najednou

> [!PITFALL]
> **Napsat celé řešení naráz a spustit ho až na konci.** Příznak: kód hlásí chybu nebo špatný výsledek a nevíš, ve které části. Oprava: po každém podcíli spusť a vypiš mezivýsledek.

:::check
Kolega napsal `sumEven` a vyzkoušel ji jen na `sumEven(7)`, které vrátilo `12`. Na kterém vstupu z tabulky by selhala verze s `n < limit`?

### --expected--

6

### --accept--

2
sumEven(6)
sumEven(2)

### --why--

`n < limit` vynechá limit sám. U lichého limitu to nevadí (7 není sudé), u sudého chybí poslední číslo: `sumEven(6)` vrátí `6` místo `12`, `sumEven(2)` vrátí `0` místo `2`.

### --see--

js-zaklady/reseni-problemu#test-na-jedinem-prikladu
:::

## Kde to najdeš v MDN

- [Remainder (%)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder) — zbytek po dělení, na kterém stojí test sudosti, včetně chování u záporných čísel.
- [Loops and iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration) — když si při přepisu podcílů nevybavíš, jak se píše cyklus.
- [Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math) — hotové výpočty (zaokrouhlení, maximum, odmocnina), které nemusíš vymýšlet sám.

Dál: v labu Malé algoritmy tenhle postup použiješ na čtyři úlohy bez návodu — FizzBuzz, součet číslic, převod teploty a prvočísla.

# --questions--

## --question--

Úloha: „Vrať, kolik let bude trvat, než vklad 10 000 Kč s úrokem 5 % ročně přesáhne `goal`." Napiš ručně výsledek pro `goal = 11000`.

### --expected--

2

### --why--

Po roce je na účtu `10 500` (ještě ne přes 11 000), po druhém `11 025`. Příklad spočítaný ručně ti řekne, jestli se počítá „přesáhne" (`>`) nebo „dosáhne" (`>=`) — přesně otázka, na kterou má přeformulování upozornit.

### --see--

js-zaklady/reseni-problemu#2-vymysli-priklady-i-ty-okrajove

## --question--

Proč se pseudokód píše do komentářů přímo v souboru, a ne na papír?

### --answer--

Komentáře engine spustí a zkontroluje, jestli je postup správně.

#### --why--

Engine komentáře přeskakuje. Co ti dají komentáře v souboru, až začneš psát kód?

### --correct--

Každý komentář pak nahradíš pár řádky kódu a zůstane jako popisek, co ten kus dělá.

#### --why--

Podcíle v souboru vedou psaní krok po kroku a potom slouží kolegovi jako mapa kódu.

### --answer--

Pseudokód na papíře nejde přeložit do JavaScriptu.

#### --why--

Přeložit jde odkudkoli. V čem je výhoda, když postup leží přímo tam, kde budeš psát?

### --see--

js-zaklady/reseni-problemu#3-rozloz-reseni-na-kroky-v-komentarich

## --question--

Funkce `countDigits(text)` má vrátit počet číslic v textu. Napiš výsledek pro okrajový vstup `''` (prázdný text).

### --expected--

0

### --why--

V prázdném textu není žádný znak, cyklus neproběhne a počítadlo zůstane na nule. Přesně takový vstup patří do tabulky příkladů — kód, který s ním spadne nebo vrátí `undefined`, je špatně.

### --see--

js-zaklady/reseni-problemu#2-vymysli-priklady-i-ty-okrajove
