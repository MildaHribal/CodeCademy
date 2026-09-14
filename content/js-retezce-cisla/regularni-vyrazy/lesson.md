# Regulární výrazy

:::check pretest
K čemu primárně slouží regulární výrazy?

### --answer--

K převodu čísel na měny a formátování data podle uživatele.

#### --why--

Na tohle máme rozhraní `Intl`.

### --correct--

K ověřování, jestli text odpovídá nějaké šabloně (třeba tvaru e-mailu), a k chytrému vyhledávání a nahrazování.

#### --why--

Regulární výraz je vzor. Když chceme zjistit, jestli má text tvar rodného čísla (6 číslic, lomítko, 4 číslice), je regulární výraz nejlepší nástroj.

### --answer--

K porovnávání textu podle abecedy (např. řazení).

#### --why--

Na řazení podle abecedy použiješ metodu `localeCompare`.
:::

Někdy prosté `includes()` nebo `replace()` nestačí. Třeba když potřebuješ najít všechna čísla v textu, nebo zkontrolovat, že e-mail obsahuje znak `@`. Tehdy přichází na řadu **regulární výrazy** (zkratka *RegExp* nebo *regex*). Je to vlastně malý programovací jazyk uvnitř JavaScriptu.

V JavaScriptu se regulární výrazy zapisují mezi lomítka: `/\d+/` znamená "alespoň jedna číslice".

## Třídy znaků a příznaky

Třídy (classes) určují, jaký typ znaku hledáš:
- `\d` hledá číslici (digit)
- `\w` hledá znaky ve slově (word) - písmena a čísla, ale pozor, jen anglické znaky
- `\s` hledá bílé znaky (mezera, tabulátor, konec řádku)
- `.` hledá jakýkoliv znak (kromě nového řádku)
- Velká písmena hledají opak: `\D` znamená "cokoliv kromě číslice"

Za druhé lomítko můžeš přidat takzvané příznaky (*flags*), které mění chování:
- `g` (global) – najde všechny výskyty, nezastaví se u prvního.
- `i` (case-insensitive) – ignoruje velká a malá písmena.
- `u` (unicode) – zapne správnou podporu Unicode (např. pro emoji).

:::check
Který výraz najde všechny cifry v textu?

### --answer--

`/\d/`

#### --why--

Tenhle najde jen první cifru a skončí, protože mu chybí příznak `g`.

### --correct--

`/\d/g`

#### --why--

Ano, `\d` označuje cifru a příznak `g` zajistí, že se najdou všechny v textu.

### --see--

js-retezce-cisla/regularni-vyrazy#tridy-znaku-a-priznaky
:::

## Kvantifikátory (hladové vs. líné)

Určují, kolikrát se má daný znak opakovat:
- `+` jeden a více
- `*` nula a více (často pro volitelný text)
- `?` žádný nebo jeden (volitelný znak)
- `{3,5}` třikrát až pětkrát

**Pozor na hladovost!** Ve výchozím stavu jsou kvantifikátory jako `*` a `+` *hladové* – vezmou co největší kus textu to jde. Když chceš, aby vzaly co nejméně (aby byly *líné*), přidáš k nim otazník: `*?` nebo `+?`.

:::live js predict
```js
const html = '<b>Tlustý</b> a <b>černý</b> text';
console.log(html.match(/<b>.*<\/b>/)[0]);
console.log(html.match(/<b>.*?<\/b>/)[0]);
```
--question-- Co vypíše první (hladový `.*`) a druhý (líný `.*?`) match? Každý na svůj řádek.
--expected--
```text
<b>Tlustý</b> a <b>černý</b>
<b>Tlustý</b>
```
--why-- První, hladový výraz chytí všechno od prvního `<b>` až po *úplně poslední* `</b>` v textu. Druhý, líný, se zastaví hned u prvního `</b>`, které potká.
:::

## Kotvy a skupiny

Kotvy upevňují výraz na určité místo:
- `^` ukotví výraz na začátek řetězce
- `$` ukotví výraz na konec řetězce

Závorky `()` tvoří skupinu. Ta se pak dá zachytit a odděleně z ní přečíst výsledek. Můžeš ji i pojmenovat, což ti pak kód hodně zpřehlední: `/(?<year>\d{4})/`.

## Metody test, matchAll a replace

- **`regex.test(text)`** vrací zkrátka `true`/`false`. Tím se typicky kontroluje vstup ve formuláři.
- **`text.matchAll(regex)`** vrátí iterátor (musíš ho projet třeba ve `for...of` nebo předělat na pole) se všemi nalezenými detaily a skupinami.
- **`text.replace(regex, funkce)`** umožňuje pro každý nalezený kousek zavolat vlastní JavaScriptovou funkci.

## RegExp.escape a kdy regex nepoužít

Od roku 2024 prohlížeče postupně přidávají metodu `RegExp.escape()`, která ošetří text dřív, než z něj vyrobíš regulární výraz, aby uživatel nerozbil tvoje hledání.

A to nejdůležitější nakonec: **regulární výraz není řešení na všechno**.
Když potřebuješ kontrolovat HTML nebo složité struktury (třeba URL), použij existující DOM nebo zabudované třídy jako `URL()`. Nepiš na ně regex.

## Kde to najdeš v MDN

- [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) — kompletní dokumentace a vysvětlení všech značek.
- [String.prototype.replace()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace) — ukázky, jak použít funkci v nahrazení.

# --questions--

## --question--

Jak zajistíš, aby regex `/\d{3}/` nenašel tři čísla uprostřed velkého čísla `123456`, ale zkontroloval, že text obsahuje *přesně a pouze* tři číslice?

### --expected--

Použiju kotvy začátku a konce: `/^\d{3}$/`

### --why--

Bez kotev by výraz našel `123` v libovolném textu, protože splňuje podmínku „tři číslice“. Kotva `^` vynutí, že hned před číslem musí být začátek řetězce a `$` že hned za ním musí být konec.

### --see--

js-retezce-cisla/regularni-vyrazy#kotvy-a-skupiny
