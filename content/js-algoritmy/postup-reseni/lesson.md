# Jak rozlousknout úlohu

:::check pretest
Na pohovoru dostaneš zadání: „V poli cen najdi dvě, které dají dohromady přesně 100." Co uděláš jako první?

### --answer--

Napíšu dva vnořené cykly, ať už něco běží.

#### --why--

Kód je nejrychlejší způsob, jak si zadání špatně vyložit. Zkus si vzpomenout, co dělá člověk, když počítá dvojice na papíře.

### --correct--

Napíšu si dva tři konkrétní příklady včetně prázdného pole a ověřím si, co má funkce vrátit.

#### --why--

Příklad je nejlevnější kontrola, že rozumíš zadání. Podrobně to rozebere první část lekce.

### --answer--

Zeptám se, jestli mám řešení napsat v `O(N)`.

#### --why--

Na složitost dojde řada, ale až budeš vědět, co má funkce vlastně vracet. Zamysli se, co potřebuješ vědět dřív.
:::

:::check pretest
Kolik různých dvojic se dá vybrat z pole o pěti položkách, když na pořadí nezáleží a položka se nesmí párovat sama se sebou? Tipni si.

### --expected--

10

### --why--

Dvojic je `5 × 4 / 2`. Obecně `N × (N − 1) / 2` — a přesně proto dva vnořené cykly na deseti tisících položkách nedoběhnou. Čísly se to zabývá lekce o složitosti.
:::

Úlohy na pohovoru nejsou těžké kódem. Skoro každá se vejde do dvaceti řádků, které už dávno umíš napsat. Těžké je to, že sedíš před prázdným editorem, někdo se dívá a ty máš v hlavě jen „nějak to projít". Stejný pocit znáš z práce: tiket zní „seřaď faktury podle splatnosti a dopočítej zůstatky" a ty nevíš, kde chytit první konec.

Pomůže postup, který dělá zkušený vývojář automaticky — jen ho nahlas neříká. Má čtyři kroky a **žádný z nich není psaní kódu**.

> [!REMEMBER]
> **Kód je poslední krok.** Nejdřív příklad, pak postup vlastními slovy, pak nejhloupější funkční řešení, a teprve pak zlepšování. Kdo začne syntaxí, opravuje zadání i kód zároveň.

## Přeformuluj zadání vlastními slovy

Zadání bývá napsané cizím jazykem: „vrať index dvou prvků, jejichž součet odpovídá cíli". Přelož si ho na větu, kterou bys řekl kamarádovi, a pojmenuj v ní **vstup**, **výstup** a **pravidlo**.

- Vstup: pole čísel a jedno cílové číslo.
- Výstup: pole se dvěma indexy, nebo `null`, když taková dvojice není.
- Pravidlo: stejnou položku nesmím použít dvakrát.

Teprve tahle tři slova rozhodnou, jak bude funkce vypadat. Kdyby výstup byly **hodnoty** místo indexů, řešení se změní. Kdyby se položka směla použít dvakrát, změní se taky.

:::live js
```js
// Vstup, výstup a pravidlo zapsané jako komentář nad kostrou funkce.
// Vstup:   pole cen (čísla), cílová částka
// Výstup:  [index1, index2], nebo null
// Pravidlo: jeden index se nesmí objevit dvakrát
function findPair(prices, target) {
  return null;
}

console.log(findPair([45, 24, 39], 69));
```
:::

Zkus do funkce místo `null` dát `[0, 1]` a sleduj, co se v konzoli změní. Kostra, která něco vrací, jde spustit hned — a hned uvidíš, že vrací blbost. To je lepší výchozí bod než prázdné tělo.

:::check
Zadání zní: „Vrať **hodnoty** dvou položek, které dají dohromady cílovou částku." Co se v popisu vstup–výstup–pravidlo oproti verzi s indexy změní?

### --expected--

výstup

### --why--

Vstup i pravidlo zůstávají, mění se jen výstup: místo indexů vracíš hodnoty. Zní to jako drobnost, ale řešení s `Map` si pak ukládá jiné věci.
:::

## Vyrob si příklady, hlavně ty ošklivé

Příklad je jediná věc, která tě chytí dřív než testy. Než napíšeš řádek kódu, napiš si tabulku vstupů a výstupů. Vždycky do ní patří jeden běžný případ a **tři ošklivé**: prázdný vstup, jedna položka a případ, kdy odpověď neexistuje.

| vstup | cíl | očekávaný výstup | proč je v tabulce |
|---|---|---|---|
| `[45, 24, 39]` | `69` | `[0, 1]` | běžný případ |
| `[45, 24, 39]` | `1000` | `null` | odpověď neexistuje |
| `[]` | `50` | `null` | prázdný vstup |
| `[50]` | `100` | `null` | jedna položka se nesmí použít dvakrát |
| `[50, 50]` | `100` | `[0, 1]` | dvě stejné hodnoty na různých indexech |

Poslední dva řádky jsou ten rozdíl mezi „skoro funguje" a „funguje". Pohovor i code review je najdou spolehlivě.

> [!TIP]
> Tabulku si na pohovoru napiš nahlas do sdíleného editoru jako komentář. Tazatel vidí, že přemýšlíš o okrajích, a často ti rovnou řekne, který případ ho zajímá.

:::check
Proč patří do tabulky příkladů řádek `[50]` s cílem `100`, i když se „nic zajímavého" neděje?

### --expected--

kontroluje, že se jedna položka nepoužije dvakrát

### --accept--

ověří pravidlo, že se stejný index nesmí použít dvakrát
hlídá, aby funkce nespárovala položku sama se sebou
:::

## Nejdřív hrubá síla, pak zlepšení

[[hrubá síla]] je řešení, které zkusí všechny možnosti. Je pomalé, ale píše se za minutu a hlavně ti dá **jistotu, co je správná odpověď**. Ke zlepšování se pak máš k čemu vracet.

:::live js
```js
// 1. Projdi každou dvojici indexů právě jednou.
// 2. Vrať první dvojici, která sedí.
function findPairSlow(prices, target) {
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      if (prices[i] + prices[j] === target) return [i, j];
    }
  }
  return null;
}

console.log(findPairSlow([45, 24, 39], 69));
console.log(findPairSlow([50], 100));
```
:::

Zkus přidat do pole další cenu a sleduj, že výsledek zůstane první nalezenou dvojicí. Vnitřní cyklus začíná na `i + 1` — právě to zajistí, že se položka nespáruje sama se sebou a že každou dvojici zkusíš jen jednou.

Zlepšení přijde, až vidíš, co se v hrubé síle dělá **zbytečně**. Když je pole seřazené, nemusíš zkoušet všechny dvojice: postav jeden ukazatel na začátek, druhý na konec a podle součtu jedním z nich pohni. Tomuhle vzoru se říká [[dva ukazatele]].

:::memory
```js
const prices = [24, 39, 45, 61];
let left = 0;
let right = prices.length - 1;
let sum = prices[left] + prices[right];
left = left + 1;
```
--step-- 1
prices -> @p
@p: [24, 39, 45, 61]
--step-- 2 | left ukazuje na nejmenší cenu
prices -> @p
left = 0
@p: [24, 39, 45, 61]
--step-- 3 | right na největší
prices -> @p
left = 0
right = 3
@p: [24, 39, 45, 61]
--step-- 4 | součet krajů je 85, na cíl 100 je to málo
prices -> @p
left = 0
right = 3
sum = 85
@p: [24, 39, 45, 61]
--step-- 5 | málo -> posuň levý ukazatel doprava, součet může jen vzrůst
prices -> @p
left = 1
right = 3
sum = 85
@p: [24, 39, 45, 61]
:::

Celý trik je v té poslední větě. Součet je moc malý, takže větší ho udělá jedině posun **levého** ukazatele doprava. Kdyby byl součet moc velký, posouval bys pravý doleva. Každý krok jednu položku navždy vyřadí, takže pole projdeš jen jednou.

:::live js predict
```js
const prices = [24, 39, 45, 61];
let left = 0;
let right = 3;
let steps = 0;

while (left < right) {
  const sum = prices[left] + prices[right];
  steps++;
  if (sum === 100) break;
  if (sum < 100) left++;
  else right--;
}

console.log(steps, left, right);
```
--question-- Co vypíše `console.log`? Napiš tři čísla oddělená mezerou.
--expected-- 2 1 3
--why-- První krok: `24 + 61 = 85`, málo, `left` jde na 1. Druhý krok: `39 + 61 = 100`, sedí, cyklus se ukončí. Proběhly dva kroky a ukazatele zůstaly na 1 a 3.
:::

> [!PITFALL]
> **Dva ukazatele fungují jen na seřazeném poli.** Na neseřazeném je posun podle velikosti součtu nesmysl — `[61, 24, 39]` s cílem 100 vrátí `null`, i když dvojice existuje. Když si pole musíš seřadit sám, indexy se ti rozházejí; pak vracej hodnoty, ne indexy, nebo si řaď dvojice `[hodnota, původníIndex]`.

:::check
Součet krajních položek vyšel větší než cíl. Kterým ukazatelem pohneš a kam?

### --expected--

pravým doleva

### --accept--

posunu pravý ukazatel doleva
right o jedna doleva
:::

## Pojmenuj kroky postupu

Když ti postup funguje, zbývá poslední krok, na který skoro každý kašle: **pojmenovat jeho části**. Ne „řádky 4 až 7", ale sloveso a předmět — „postav ukazatele", „porovnej součet s cílem", „posuň ten správný ukazatel". Jméno drží i mimo tenhle příklad, takže si ho odneseš do příští úlohy. Jednotlivé řádky si neodneseš.

Ověř si to takhle: přečti si jen jména kroků za sebou a zeptej se, jestli by podle nich úlohu vyřešil i někdo, kdo tvůj kód nevidí. Když ne, jména popisují kód místo záměru.

:::explain
Proč je dobré zapsat hrubou sílu, i když víš, že ji stejně zahodíš?

## --model--

Hrubá síla je první funkční odpověď, takže mám s čím porovnávat. Když pak napíšu rychlejší verzi, pustím obě na stejných datech a musí vrátit totéž — jinak vím, že chyba je v tom zlepšení. Navíc při psaní hrubé síly narazím na okrajové případy dřív, než do řešení zamotám optimalizaci.

## --checklist--

- Hrubá síla dává jistotu, jaká je správná odpověď.
- Rychlejší verzi si můžu proti ní ověřit na stejných datech.
- Při psaní hrubé síly se ukážou okrajové případy.
:::

:::check
Napsal jsi rychlejší verzi funkce. Jak nejlevněji ověříš, že vrací totéž co hrubá síla?

### --expected--

pustím obě na stejných datech a porovnám výsledky

### --accept--

porovnám výstupy obou funkcí na stejných vstupech
spustím obě na týchž datech a výsledky musí být stejné
:::

## Typické chyby a pasti

> [!PITFALL]
> **Optimalizace dřív, než něco funguje.** Když rovnou píšeš verzi s `Map`, řešíš zároveň zadání i výkon a nemáš s čím porovnávat. Příznak: funkce vrací prázdné pole a ty nevíš, jestli je špatně logika, nebo klíče v mapě. Oprava: nejdřív hrubá síla, ta se zahodí až po ověření.

> [!PITFALL]
> **Vnitřní cyklus začíná na nule.** `for (let j = 0; …)` spáruje položku samu se sebou a `[50]` s cílem `100` vrátí `[0, 0]` místo `null`. Příznak: výsledek má dvakrát stejný index. Oprava: `let j = i + 1`.

> [!PITFALL]
> **Hledání vrací `0` a ty to čteš jako „nenašlo".** `if (prices.indexOf(x))` je nepravda pro první položku (index `0`) a pravda pro nenalezeno (`-1`). Příznak: první položka v poli se chová, jako by tam nebyla. Oprava: `if (prices.indexOf(x) !== -1)` nebo `includes`.

:::check
Funkce vrátila `[0, 0]` místo `null`. Která ze tří pastí to je a co v kódu opravíš?

### --expected--

vnitřní cyklus začíná na nule, má začínat na i + 1

### --accept--

špatný start vnitřního cyklu, patří tam j = i + 1
položka se spárovala sama se sebou, oprava je j = i + 1

### --why--

Dvakrát stejný index znamená, že se položka spárovala sama se sebou. Vnitřní cyklus musí začínat až za vnějším indexem.
:::

## Kde to najdeš v MDN

- [Loops and iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration) — přehled všech cyklů včetně `break` a `continue`, které v ukazatelových řešeních potkáš na každém kroku.
- [Array.prototype.indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf) — v sekci *Return value* je černé na bílém `-1`, kvůli kterému padá poslední past.
- [Array.prototype.at](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at) — záporný index počítá od konce, takže `prices.at(-1)` nahradí `prices[prices.length - 1]`.

Příště si spočítáš, kolik ta hrubá síla vlastně stojí — a proč se na deseti tisících položkách nedá použít.

# --questions--

## --question--

Zadání: „Vrať nejlevnější položku." Jaký příklad si do tabulky vstupů napíšeš jako první z těch ošklivých?

### --expected--

prázdné pole

### --why--

Prázdný vstup rozhodne, jestli má funkce vrátit `undefined`, `null`, nebo vyhodit chybu. To je otázka na zadavatele, a když ji nepoložíš, zodpoví ji za tebe testy.

### --see--

js-algoritmy/postup-reseni#vyrob-si-priklady-hlavne-ty-osklive

## --question--

Pole `[10, 20, 30, 40]` hledá dvojici se součtem `35`. Kolikrát proběhne tělo `while` cyklu u řešení se dvěma ukazateli, než skončí?

### --expected--

3

### --why--

`10 + 40 = 50` je moc, `right` jde na 2. `10 + 30 = 40` je moc, `right` jde na 1. `10 + 20 = 30` je málo, `left` jde na 1 a podmínka `left < right` přestane platit. Tři průchody a výsledek `null`.

### --see--

js-algoritmy/postup-reseni#nejdriv-hruba-sila-pak-zlepseni

## --question--

**Opakování z dřívějška.** Funkce dostane pole objednávek a má vrátit nové pole seřazené podle ceny. Kolegův kód volá `orders.sort((a, b) => a.price - b.price)`. Co je na tom z pohledu volajícího špatně?

### --answer--

`sort` neumí řadit objekty, potřebuje pole čísel.

#### --why--

Porovnávací funkce si hodnoty vytáhne sama, takže objekty `sort` zvládne. Zamysli se, co se stane s polem, které funkce dostala v parametru.

### --correct--

`sort` seřadí i původní pole volajícího, protože řadí na místě.

#### --why--

`sort` je mutující metoda a vrací totéž pole. Když má funkce vrátit nové pole, patří tam `toSorted`, nebo kopie `[...orders].sort(…)`.

### --answer--

Porovnávací funkce musí vracet `true` nebo `false`.

#### --why--

`true`/`false` je právě ta typická chyba — porovnávací funkce vrací záporné číslo, nulu, nebo kladné. Tady je ale návratová hodnota v pořádku.

### --see--

js-pole/metody-pole-do-hloubky#razeni-a-porovnavaci-funkce

## --question--

**Opakování z dřívějška.** Proč se v ukázce s ukazateli píše `let left = 0`, ale `const prices = […]`, když se do pole během hledání taky sahá?

### --expected--

const hlídá proměnnou, ne obsah pole

### --accept--

const zakazuje nové přiřazení, ne změnu obsahu
protože do left se přiřazuje nová hodnota, do prices ne

### --why--

`const` zakazuje jen nové přiřazení do proměnné. `left` se posouvá, takže potřebuje `let`. `prices` pořád ukazuje na totéž pole, i kdyby se jeho obsah měnil.

### --see--

js-pole/co-je-pole#promenna-neobsahuje-pole-ale-odkaz-na-nej
