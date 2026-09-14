# Regulární výrazy

:::check pretest
Má `/\d{3}/.test('12345')` vrátit `true`, nebo `false`? Výraz `\d{3}` znamená „tři číslice". Tipni si.

### --answer--

`false`, protože text má pět číslic, ne tři.

#### --why--

Tak by to četl člověk. Na co se `test` ve skutečnosti ptá, ukáže část o kotvách.

### --correct--

`true`

#### --why--

`test` hledá vzor **kdekoli** v textu a tři číslice za sebou v `12345` jsou. Jak vynutit „právě tři číslice", ukáže část o kotvách.
:::

Kontrola PSČ ve formuláři, zvýraznění hashtagů v příspěvku, převod `777123456` na `777 123 456`, vytažení roku z data v adrese `/clanky/2026-09-14`. Metody `includes` a `replaceAll` tu nestačí, protože nehledáš **konkrétní** text, ale text určitého **tvaru**: „pět číslic", „mřížka a za ní písmena".

Na to je [[regulární výraz]] (*regular expression*, zkráceně *regex*): malý jazyk na popis tvaru textu. Vypadá zběsile, ale základ tvoří asi dvacet značek.

> [!REMEMBER]
> **Regulární výraz popisuje tvar textu, ne konkrétní text.** Bez kotev `^` a `$` hledá ten tvar kdekoli uvnitř — na kontrolu celého vstupu je potřebuješ vždycky.

## Vzor místo konkrétního textu

Regulární výraz zapíšeš mezi lomítka: `/kolo/`. Takový výraz hledá přesně text `kolo`. Nejjednodušší použití je metoda `test`, která odpoví `true`/`false`:

:::live js
```js
const pattern = /kolo/;

console.log(pattern.test('Prodám horské kolo'));
console.log(pattern.test('Prodám koloběžku'));
console.log(pattern.test('Prodám Kolo'));
console.log(/\d/.test('Kolo Author 29'));
```
:::

Zkus změnit poslední výraz na `/\d\d\d/` a sleduj výsledek. `\d` je jedna libovolná číslice (*digit*) — to je první značka, která už nepopisuje konkrétní znak, ale **druh** znaku.

Výraz jde vytvořit i z textu: `new RegExp('kolo')`. Hodí se, když vzor skládáš za běhu; lomítka se pak nepíšou.

:::check
Co vrátí `/\d/.test('Horské kolo')`?

### --expected--

false

### --why--

`\d` hledá jednu číslici kdekoli v textu a v `'Horské kolo'` žádná není.

### --see--

js-retezce-cisla/regularni-vyrazy#vzor-misto-konkretniho-textu
:::

## Třídy znaků

[[Třída znaků]] (*character class*) popisuje **jeden znak** z nějaké skupiny:

| zápis | jeden znak, který je… | příklad shody |
|---|---|---|
| `\d` | číslice 0–9 | `7` |
| `\s` | bílý znak (mezera, tabulátor, nový řádek) | ` ` |
| `\w` | anglické písmeno, číslice nebo `_` | `a`, `Z`, `5` |
| `.` | jakýkoli znak kromě nového řádku | cokoli |
| `[abc]` | jeden z vyjmenovaných | `b` |
| `[a-z]`, `[0-9]` | z rozsahu | `m` |
| `[^0-9]` | cokoli **kromě** vyjmenovaných | `x` |
| `\p{L}` | písmeno v jakémkoli jazyce (s příznakem `u`) | `ž` |

Velké písmeno obrací význam: `\D` je „ne číslice", `\S` „ne bílý znak".

Znaky `. * + ? ( ) [ ] { } ^ $ | \ /` mají ve výrazu zvláštní význam. Když hledáš třeba skutečnou tečku, napiš před ni zpětné lomítko: `\.`.

:::live js predict
```js
const title = 'Žluťoučký kůň';

console.log(title.match(/\w+/g).join(' | '));
```
--question-- Co vypíše `console.log`? Výraz `\w+` znamená „jeden nebo víc znaků slova", `join(' | ')` spojí nalezené kousky svislítkem.
--expected-- lu | ou | k | k
--why-- `\w` zná jen anglická písmena bez diakritiky. `Ž`, `ť`, `č`, `ý`, `ů` a `ň` pro něj nejsou znaky slova, takže slova se rozpadla na zbytky. Na česká písmena potřebuješ `\p{L}` s příznakem `u`: `/\p{L}+/gu`.
:::

Zkus v ukázce `\w+` nahradit `\p{L}+` a příznak `g` rozšířit na `gu`. Příznaky za lomítkem vysvětlí část o příznacích; `match` s `g` vrátí všechny nalezené kousky jako pole.

> [!PITFALL]
> **`\w` a `[a-z]` neznají diakritiku.** Příznak: kontrola jména odmítne „Šťastný" nebo hashtag `#horské` skončí u `#hor`. Oprava: `\p{L}` (písmeno) nebo `\p{Lu}` (velké písmeno) s příznakem `u`.

:::check
Napiš třídu znaků, která popíše jeden znak, který **není** číslice ani mezera.

### --expected--

[^\d ]

### --accept--

[^0-9 ]
[^ \d]
[^ 0-9]
[^\d\s]
[^\s\d]

### --why--

Stříška `^` na začátku hranatých závorek třídu obrátí: shoduje se se vším, co v závorkách **není**.

### --see--

js-retezce-cisla/regularni-vyrazy#tridy-znaku
:::

## Kvantifikátory: kolikrát

[[Kvantifikátor]] (*quantifier*) stojí **za** znakem nebo třídou a říká, kolikrát se smí opakovat:

| zápis | kolikrát | příklad | shoda v `'Kolo 2026'` |
|---|---|---|---|
| `+` | jednou a víckrát | `\d+` | `2026` |
| `*` | nulakrát a víckrát | `\d*` | prázdný text — nula číslic hned na začátku stačí |
| `?` | nulakrát nebo jednou | `\s?\d+` | ` 2026` (i s mezerou) |
| `{4}` | přesně čtyřikrát | `\d{4}` | `2026` |
| `{2,3}` | dvakrát až třikrát | `\d{2,3}` | `202` |

`?` dělá znak nepovinným: `/^\d{3} ?\d{2}$/` přijme PSČ `60200` i `602 00`.

Kvantifikátory jsou **hladové** (*greedy*): vezmou tolik znaků, kolik jde, a teprve když se zbytek výrazu nemůže shodovat, vracejí. Otazník **za** kvantifikátorem (`+?`, `*?`) z něj udělá **líný** (*lazy*): vezme co nejméně.

:::live js predict
```js
const text = '<b>Tlustý</b> a <b>černý</b>';

console.log(text.match(/<b>.*<\/b>/)[0]);
console.log(text.match(/<b>.*?<\/b>/)[0]);
```
--question-- Co vypíšou oba řádky? Každý výsledek na vlastní řádek.
--expected--
```text
<b>Tlustý</b> a <b>černý</b>
<b>Tlustý</b>
```
--why-- Hladové `.*` spolkne všechno až do konce textu a pak couvá, dokud nenajde `</b>` — to **poslední**. Líné `.*?` bere po jednom znaku a zastaví se u **prvního** `</b>`. `match` bez příznaku `g` vrátí jen první shodu; na index `[0]` je celý nalezený text.
:::

Zkus do `text` přidat na konec třetí `<b>tučný</b>` a sleduj první řádek. Hladový výraz zase sahá až k poslednímu `</b>`.

:::check
Který výraz popíše celé české PSČ `11000` i `110 00`, ale ne `110  00` se dvěma mezerami?

### --answer--

`/^\d{3} *\d{2}$/`

#### --why--

`*` povolí nulu i **libovolně** mezer, takže projdou i dvě mezery.

### --correct--

`/^\d{3} ?\d{2}$/`

#### --why--

`?` udělá jednu mezeru nepovinnou: buď žádná, nebo právě jedna.

### --answer--

`/^\d+ ?\d+$/`

#### --why--

`\d+` přijme libovolný počet číslic, takže by prošlo i `1 2`.

### --see--

js-retezce-cisla/regularni-vyrazy#kvantifikatory-kolikrat
:::

## Kotvy `^` a `$`: celý text, ne kousek

`test` i `match` hledají shodu **kdekoli** v textu. Na kontrolu vstupu z formuláře to je špatně: `/\d{5}/` projde u `123456789` i u `PSČ 11000 Praha`.

[[kotva regulárního výrazu|Kotva]] (*anchor*) nepopisuje znak, ale **místo**: `^` je začátek textu, `$` konec. `/^\d{5}$/` tedy znamená „začátek, pět číslic, konec" — a nic dalšího.

:::live js predict
```js
const zip = '123456';

console.log(/\d{5}/.test(zip));
console.log(/^\d{5}$/.test(zip));
```
--question-- Co vypíšou oba řádky? Každý výsledek na vlastní řádek.
--expected--
```text
true
false
```
--why-- Bez kotev stačí, že pět číslic za sebou je **někde** v textu — a v šesti číslicích jsou. S kotvami musí pět číslic vyplnit celý text od začátku do konce, a šestá číslice navíc to pokazí.
:::

Zkus změnit `zip` na `' 12345'` s mezerou na začátku. Kotvy ho odmítnou — proto se vstup z formuláře před kontrolou nejdřív `trim()`.

> [!PITFALL]
> **Kontrola bez kotev propustí cokoli, co vzor jen obsahuje.** Příznak: formulář přijme PSČ `110001`, telefon `777123456789` nebo heslo s povolenými znaky a za nimi čímkoli. Oprava: výraz pro celý vstup vždycky začni `^` a ukonči `$`.

:::check
Napiš regulární výraz, který projde jen pro text složený **přesně ze čtyř číslic** (třeba rok `2026`).

### --expected--

/^\d{4}$/

### --accept--

/^[0-9]{4}$/
/^\d\d\d\d$/

### --why--

`\d{4}` jsou čtyři číslice a kotvy `^` a `$` zajistí, že před nimi ani za nimi nic není.

### --see--

js-retezce-cisla/regularni-vyrazy#kotvy-a-cely-text-ne-kousek
:::

## Skupiny: vytáhni části textu

Kulaté závorky vytvoří **skupinu** (*capturing group*). Metoda `match` pak vrátí nejen celou shodu, ale i text každé skupiny: celá shoda je na indexu `0`, první skupina na `1`, druhá na `2`.

Skupině jde dát jméno: `(?<year>\d{4})`. Pojmenované skupiny najdeš v `match.groups.year` a kód se čte bez počítání závorek.

:::live js
```js
const url = '/clanky/2026-09-14/zluty-kun';
const match = url.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);

console.log(match[0]);
console.log(match.groups.day, match.groups.month, match.groups.year);

const noDate = '/clanky/o-nas'.match(/(?<year>\d{4})/);
console.log(noDate);
```
:::

Zkus z `url` smazat datum a sleduj druhý řádek. Když `match` nic nenajde, vrátí `null`, a `null.groups` spadne na `TypeError`. Výsledek `match` proto před použitím zkontroluj: `if (match) { … }`.

Svislítko `|` znamená „nebo": `/^(Kč|CZK|€)$/` projde pro kteroukoli ze tří měn. Závorky tu vymezují, kde „nebo" začíná a končí.

:::check
Co vypíše tenhle kód?

```js
const match = 'Rezervace na 18:30'.match(/(\d{2}):(\d{2})/);
console.log(match[2]);
```

### --expected--

30

### --why--

Index `0` je celá shoda `18:30`, `1` první skupina `18` a `2` druhá skupina `30`.

### --see--

js-retezce-cisla/regularni-vyrazy#skupiny-vytahni-casti-textu
:::

## Příznaky `g`, `i` a `u`

Za druhé lomítko patří [[příznak regulárního výrazu|příznaky]] (*flags*), které mění chování celého výrazu:

| příznak | co dělá |
|---|---|
| `i` | nerozlišuje velká a malá písmena: `/kolo/i` najde `Kolo` |
| `g` | hledá všechny výskyty, ne jen první (`match`, `replace`, `matchAll`) |
| `u` | pracuje s celými znaky Unicode a zapne `\p{…}` |

Příznaky se kombinují v libovolném pořadí: `/#\p{L}+/gu`. Příznak `u` přidávej vždycky, když text může obsahovat češtinu nebo emoji — bez něj výraz vidí emoji jako dva znaky.

:::live js predict
```js
const hasBike = /kolo/g;

console.log(hasBike.test('kolo a kolo'));
console.log(hasBike.test('kolo a kolo'));
console.log(hasBike.test('kolo a kolo'));
```
--question-- Co vypíšou tři řádky? Každý výsledek na vlastní řádek.
--expected--
```text
true
true
false
```
--why-- Výraz s příznakem `g` si pamatuje, kde naposledy skončil (vlastnost `lastIndex`), a další `test` hledá až od toho místa. Druhé volání najde druhé `kolo`, třetí už za ním nic nenajde, vrátí `false` a začne znovu od nuly. Na `test` příznak `g` nepatří.
:::

Zkus smazat `g` a spusť znovu. Všechny tři řádky vrátí `true`.

> [!PITFALL]
> **`test` s příznakem `g` střídá výsledky.** Příznak: validace stejného textu jednou projde a podruhé ne, typicky když je výraz uložený v konstantě a volá se opakovaně. Oprava: pro `test` výraz bez `g`.

:::check
Kterým příznakem zajistíš, že `/^ahoj$/` projde i pro `AHOJ`? Napiš jen písmeno příznaku.

### --expected--

i

### --why--

`i` (*ignore case*) nerozlišuje velikost písmen. `/^ahoj$/i.test('AHOJ')` vrátí `true`.

### --see--

js-retezce-cisla/regularni-vyrazy#priznaky-g-i-a-u
:::

## Všechny výskyty: `matchAll` a `replace`

Tři metody řetězce, které přijmou regulární výraz:

- `text.match(/…/g)` — pole všech nalezených textů (bez skupin), nebo `null`.
- `text.matchAll(/…/g)` — všechny shody **i se skupinami**. Projdeš je cyklem `for…of`. Bez příznaku `g` vyhodí `TypeError`.
- `text.replace(/…/g, náhrada)` — nahradí shody. V textu náhrady `$1`, `$2` znamenají obsah skupin. Místo textu můžeš dát **funkci**, která dostane nalezený text a vrátí náhradu.

:::live js
```js
const post = 'Prodám #kolo a #přilbu, volejte 777123456';

for (const match of post.matchAll(/#(\p{L}+)/gu)) {
  console.log(`štítek ${match[1]} na pozici ${match.index}`);
}

console.log(post.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'));

function toUpper(tag) {
  return tag.toUpperCase();
}
console.log(post.replace(/#\p{L}+/gu, toUpper));
```
:::

Zkus v posledním řádku smazat příznak `g`. Velkými písmeny bude jen první štítek: `replace` bez `g` nahrazuje jen první shodu. S textem místo výrazu platí totéž — proto existuje `replaceAll`.

Funkci jako argument jiné funkce (*callback*) podrobně probere sekce Funkce. Teď stačí vědět, že `replace` ji zavolá pro každou shodu a použije, co vrátí.

:::check
Co vypíše tenhle kód?

```js
console.log('2026-09-14'.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3. $2. $1'));
```

### --expected--

14. 09. 2026

### --why--

První skupina je rok, druhá měsíc, třetí den. Náhrada `$3. $2. $1` je poskládá v opačném pořadí s tečkami.

### --see--

js-retezce-cisla/regularni-vyrazy#vsechny-vyskyty-matchall-a-replace
:::

## Text od uživatele ve výrazu: `RegExp.escape`

Vyhledávání na webu často staví výraz z toho, co napsal uživatel: `new RegExp(query, 'i')`. Jenže uživatel napíše `C++` a `+` je kvantifikátor.

:::live js
```js
const query = 'C++';

try {
  new RegExp(query, 'i');
} catch (error) {
  console.log(error.message);
}

const safe = new RegExp(RegExp.escape(query), 'i');
console.log(safe.test('Kurz C++ pro začátečníky'));
```
:::

`RegExp.escape(text)` před každý zvláštní znak přidá zpětné lomítko, takže se text hledá doslova. Všechny hlavní prohlížeče ho mají od května 2025 (Baseline 2025). Zkus místo `'C++'` napsat `'1.5'` a místo testu `new RegExp(query).test('125')` bez escapování — tečka se shoduje s jakýmkoli znakem.

:::check
Proč se text od uživatele před `new RegExp(…)` escapuje?

### --answer--

Aby výraz rozlišoval velká a malá písmena.

#### --why--

Velikost písmen řídí příznak `i`, s escapováním nesouvisí.

### --correct--

Aby se znaky jako `+`, `.` nebo `(` hledaly doslova a ne jako značky výrazu.

#### --why--

Neescapované `C++` je neplatný výraz a `1.5` by našlo i `125`.

### --answer--

Aby výraz běžel rychleji.

#### --why--

Rychlost tu nehraje roli. Jde o to, jak se čtou zvláštní znaky.

### --see--

js-retezce-cisla/regularni-vyrazy#text-od-uzivatele-ve-vyrazu-regexp-escape
:::

## Kdy regulární výraz nepoužít

Regulární výraz je silný, ale čte se špatně a snadno propustí něco, co neměl. Než ho napíšeš, zeptej se, jestli neexistuje jednodušší nástroj:

| úloha | místo regexu |
|---|---|
| obsahuje / začíná / končí textem | `includes`, `startsWith`, `endsWith` |
| rozdělit podle jednoho znaku | `split(',')` |
| nahradit konkrétní text | `replaceAll` |
| je to platná adresa URL? | `URL.canParse(text)`, `new URL(text)` |
| je to e-mail? | `<input type="email">` a potvrzovací e-mail — dokonalý regex na e-mail neexistuje |
| rozebrat HTML | DOM (`document.querySelector`), nikdy regex |
| datum | `Temporal.PlainDate.from(text)` vyhodí chybu u neplatného data |

Dobrý regulární výraz je krátký a kontroluje **tvar**. Logiku (je datum platné? sedí kontrolní součet?) pak dopiš v obyčejném kódu.

:::explain
Vysvětli vlastními slovy, proč kontrola PSČ `/\d{5}/` bez kotev nestačí a co kotvy změní.

## --model--

Metoda `test` hledá vzor kdekoli v textu, takže `/\d{5}/` projde, kdykoli je v textu pět číslic za sebou — i u šesti číslic nebo u textu `PSČ 11000 Praha`. Kotva `^` znamená začátek a `$` konec textu, takže `/^\d{5}$/` projde, jen když pět číslic tvoří celý vstup. Proto se na kontrolu vstupu z formuláře kotvy píšou vždycky a vstup se před tím ořízne přes `trim()`.

## --checklist--

- `test` bez kotev hledá vzor kdekoli uvnitř textu.
- Delší vstup, který vzor jen obsahuje, projde.
- `^` je začátek a `$` konec textu, takže vzor musí vyplnit celý vstup.
- Vstup se před kontrolou ořízne o mezery na krajích.
:::

:::check
Chceš ověřit, že nahraný soubor končí na `.pdf`. Co je nejlepší volba?

### --answer--

`/.pdf$/.test(name)`

#### --why--

Tečka bez zpětného lomítka je libovolný znak, takže projde i `mujpdf`. A je tu jednodušší nástroj.

### --correct--

`name.toLowerCase().endsWith('.pdf')`

#### --why--

Na „končí textem" regex nepotřebuješ. `endsWith` se přečte na první pohled a `toLowerCase` přijme i `.PDF`.

### --answer--

`name.includes('pdf')`

#### --why--

`includes` hledá kdekoli, takže projde i `pdf-navod.docx`.

### --see--

js-retezce-cisla/regularni-vyrazy#kdy-regularni-vyraz-nepouzit
:::

## Typické chyby a pasti

### `match` nic nenajde

> [!PITFALL]
> **`match` bez shody vrací `null`, ne prázdné pole.** Příznak: `TypeError: Cannot read properties of null (reading 'groups')` nebo `(reading '1')` u vstupu, který vzoru neodpovídá. Oprava: výsledek ulož a zkontroluj `if (match)`, nebo použij `text.match(…)?.groups`.

### Tečka místo tečky

> [!PITFALL]
> **`.` je libovolný znak.** `/^\d+.\d{2}$/` projde pro `12,50`, ale i pro `12x50`. Příznak: kontrola ceny nebo verze přijme nesmysl. Oprava: skutečnou tečku piš `\.`, výběr ze dvou znaků `[.,]`.

### `replaceAll` s výrazem bez `g`

:::live js predict
```js
try {
  console.log('1 250 000'.replaceAll(/ /, ''));
} catch (error) {
  console.log(error.name);
}
```
--question-- Co vypíše tenhle kód?
--expected-- TypeError
--why-- `replaceAll` s regulárním výrazem vyžaduje příznak `g`, jinak vyhodí `TypeError: String.prototype.replaceAll called with a non-global RegExp argument`. Buď přidej `g` (`/ /g`), nebo použij `replaceAll(' ', '')` s obyčejným textem.
:::

:::check
Kolegova kontrola hashtagu `/^#\w+$/` odmítá `#přilba`. Jak ji opravíš?

### --answer--

`/^#\w+$/i`

#### --why--

`i` řeší velká a malá písmena, ne diakritiku. `ř` pořád není `\w`.

### --correct--

`/^#\p{L}+$/u`

#### --why--

`\p{L}` je písmeno v libovolném jazyce, příznak `u` ho zapne.

### --answer--

`/#\w+/`

#### --why--

Bez kotev projde text, který hashtag jen obsahuje, a `\w` diakritiku pořád nezná.

### --see--

js-retezce-cisla/regularni-vyrazy#tridy-znaku
:::

V labu Kontrola a úprava vstupu si z toho postavíš kontrolu PSČ, rodného čísla, hesla a ceny.

## Kde to najdeš v MDN

- [Regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions) — průvodce s taháky *Character classes*, *Quantifiers*, *Assertions* a *Groups and backreferences*.
- [RegExp.prototype.test()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test) — část *Using test() on a regex with the global flag* rozebírá past s `lastIndex`.
- [String.prototype.replace()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace) — vzory `$1`, `$<name>` a funkce jako náhrada.
- [RegExp.escape()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape) — které znaky escapuje a proč.

# --questions--

## --question--

Co vypíše tenhle kód?

```js
const match = 'Objednávka 4417 z 12. 9.'.match(/\d+/);
console.log(match[0]);
```

### --expected--

4417

### --why--

Bez příznaku `g` vrátí `match` jen první shodu. `\d+` je hladové, takže vezme všechny číslice za sebou: `4417`.

### --see--

js-retezce-cisla/regularni-vyrazy#kvantifikatory-kolikrat

## --question--

Napiš regulární výraz, který projde pro celý text ve tvaru telefonního čísla `777 123 456` (tři trojice číslic oddělené jednou mezerou).

### --expected--

/^\d{3} \d{3} \d{3}$/

### --accept--

/^[0-9]{3} [0-9]{3} [0-9]{3}$/
/^\d\d\d \d\d\d \d\d\d$/
/^(\d{3} ){2}\d{3}$/

### --why--

`\d{3}` jsou tři číslice, mezi nimi mezera a kotvy `^` a `$` zajistí, že nic dalšího v textu není.

### --see--

js-retezce-cisla/regularni-vyrazy#kotvy-a-cely-text-ne-kousek

## --question--

Proč `'Cena: 1 250 Kč'.match(/\d+ Kč/)[0]` vrátí jen `250 Kč`, a ne `1 250 Kč`?

### --answer--

Protože `+` je líný a vezme co nejméně číslic.

#### --why--

`+` je hladový. Problém je v tom, co `\d` vůbec umí popsat.

### --correct--

Protože `\d` je jen číslice a mezera mezi `1` a `250` do `\d+` nepatří.

#### --why--

Shoda musí být souvislá. Na ceny s mezerami mezi tisíci by byl potřeba výraz jako `/\d{1,3}( \d{3})* Kč/`.

### --answer--

Protože `match` bez `g` vrátí poslední shodu.

#### --why--

`match` bez `g` vrací první shodu. Tahle je první — jen je kratší, než čekáš.

### --see--

js-retezce-cisla/regularni-vyrazy#tridy-znaku

## --question--

Co vypíše tenhle kód?

```js
const valid = /^[a-z]+$/i;
console.log(valid.test('Kůň'));
```

### --expected--

false

### --why--

`[a-z]` s příznakem `i` přijme velká i malá anglická písmena, ale `ů` a `ň` do rozsahu nepatří. Česká písmena popíše `\p{L}` s příznakem `u`.

### --see--

js-retezce-cisla/regularni-vyrazy#tridy-znaku
