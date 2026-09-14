# Formátování a datum

:::check pretest
Který měsíc je v datu `new Date(2026, 9, 1)`? Tipni si.

### --answer--

září

#### --why--

Tak by to četl člověk. Jak `Date` čísluje měsíce, uvidíš v části o pastech `Date`.

### --correct--

říjen

#### --why--

`Date` čísluje měsíce od nuly: leden je `0`, takže `9` je desátý měsíc. Rozbor je v části o pastech `Date`.

### --answer--

Vyhodí chybu, protože pořadí argumentů je den, měsíc, rok.

#### --why--

Pořadí rok, měsíc, den je správně. Háček je v tom, od kolika se měsíce počítají — ukáže to část o pastech `Date`.
:::

:::check pretest
Cena `1234.5` se má na stránce ukázat jako `1 234,50 Kč`. Jak to uděláš nejlépe?

### --answer--

`price.toFixed(2).replace('.', ',') + ' Kč'`

#### --why--

Čárka bude správně, ale mezera mezi tisíci chybí. Na celou českou podobu čísla má prohlížeč hotový nástroj.

### --correct--

`new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(price)`

#### --why--

`Intl.NumberFormat` zná česká pravidla: čárku, mezery mezi tisíci i pozici `Kč`. Ukáže ho první část.

### --answer--

`String(price) + ' Kč'`

#### --why--

Vznikne `1234.5 Kč` — s tečkou, bez mezery mezi tisíci a s jedním desetinným místem.
:::

Každá česká stránka s cenami, termíny nebo recenzemi potřebuje totéž: `1 299 Kč` místo `1299`, „3 recenze" i „5 recenzí", „středa 16. září" a „před 5 minutami". Skládat to ručně přes `toFixed` a `slice` je zdlouhavé a na jiném jazyku webu se to rozbije.

Druhý problém je samotné datum. Objekt `Date` je v JavaScriptu od roku 1995 a má pasti, o které zakopne každý: měsíce od nuly, neplatná data, která „přetečou", a letní čas, který rozbije počítání dnů.

> [!REMEMBER]
> **Formátování nech na `Intl` — ty mu dáš číslo nebo datum a jazyk, on vrátí text podle místních pravidel.** S datem počítej přes `Temporal`; `Date` potkáš ve starším kódu, a tam hlídej jeho pasti.

## `Intl.NumberFormat`: ceny, procenta a jednotky

`Intl` je vestavěný objekt pro formátování podle jazyka a země (*internationalization*). Formátovač vytvoříš jednou — s [[kód jazyka|kódem jazyka]] (*locale*) jako `'cs-CZ'` a nastavením — a pak přes něj pošleš libovolně čísel.

:::live js
```js
const czk = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' });
const percent = new Intl.NumberFormat('cs-CZ', { style: 'percent' });
const kilograms = new Intl.NumberFormat('cs-CZ', { style: 'unit', unit: 'kilogram' });

console.log(czk.format(1234.5));
console.log(czk.format(149.7));
console.log(percent.format(0.21));
console.log(kilograms.format(2.5));
console.log(new Intl.NumberFormat('cs-CZ').format(1234567.891));
```
:::

Zkus v prvním formátovači změnit `'cs-CZ'` na `'en-US'` a `'CZK'` na `'EUR'`. Stejné číslo se ukáže s tečkou, čárkou mezi tisíci a symbolem na začátku. Tohle je hlavní výhoda `Intl`: pravidla zná prohlížeč, ty je nepíšeš.

Nejčastější nastavení:

| volba | co dělá | příklad |
|---|---|---|
| `style: 'currency'` + `currency: 'CZK'` | měna podle ISO kódu | `1 234,50 Kč` |
| `style: 'percent'` | násobí stem a přidá `%` | `0.21` → `21 %` |
| `style: 'unit'` + `unit: 'kilogram'` | jednotka | `2,5 kg` |
| `maximumFractionDigits: 0` | nejvýš 0 desetinných míst (zaokrouhlí) | `1 300 Kč` |
| `trailingZeroDisplay: 'stripIfInteger'` | u celého čísla vynechá `,00` | `1 299 Kč` |

Formátovač počítá s korunami. Když máš cenu v haléřích, vyděl ji stovkou až při formátování: `czk.format(totalHalere / 100)`.

> [!PITFALL]
> **Výsledek `Intl` obsahuje nezalomitelné mezery.** Mezi `1` a `234` i před `Kč` není obyčejná mezera, ale znak U+00A0 (*non-breaking space*), aby se cena nerozdělila na dva řádky. Příznak: `czk.format(1234.5) === '1 234,50 Kč'` vrátí `false`, i když texty vypadají stejně. Oprava: neporovnávej naformátovaný text s ručně napsaným. Když musíš, nahraď bílé znaky obyčejnou mezerou: `text.replace(/\s/g, ' ')`.

:::check
Napiš výraz, který vytvoří formátovač na české ceny v eurech.

### --expected--

new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'EUR' })

### --accept--

new Intl.NumberFormat('cs', { style: 'currency', currency: 'EUR' })
new Intl.NumberFormat('cs-CZ', { currency: 'EUR', style: 'currency' })

### --why--

Jazyk `'cs-CZ'` určí čárku a mezery, `style: 'currency'` řekne, že jde o měnu, a `currency: 'EUR'` kterou. Výsledek bude třeba `19,90 €`.

### --see--

js-retezce-cisla/intl-a-datum#intl-numberformat-ceny-procenta-a-jednotky
:::

## Množné číslo: `Intl.PluralRules`

Čeština má u počtu tři tvary: 1 recenze, 2–4 recenze, 5 recenzí. A ještě čtvrtý pro desetinná čísla: 1,5 recenze. Podmínka `count === 1 ? 'recenze' : 'recenzí'` proto nestačí.

`Intl.PluralRules` pravidla zná. Metoda `select(číslo)` vrátí **kategorii** (*plural category*), ne hotové slovo:

| kategorie | česká čísla | tvar |
|---|---|---|
| `'one'` | 1 | 1 hra |
| `'few'` | 2, 3, 4 | 3 hry |
| `'many'` | desetinná čísla | 1,5 hry |
| `'other'` | 0, 5 a víc, 21, 100… | 5 her |

:::live js
```js
const plural = new Intl.PluralRules('cs');

// 1. zjisti kategorii
const count = 3;
const category = plural.select(count);

// 2. podle kategorie vyber tvar slova
let word = 'recenzí';
if (category === 'one') {
  word = 'recenze';
} else if (category === 'few') {
  word = 'recenze';
}

console.log(category, `${count} ${word}`);
```
:::

Zkus postupně `count` `1`, `4`, `5`, `22` a `0`. Pak zkus místo recenzí slovo „hra" (hra / hry / her) — tam se liší všechny tři tvary.

:::live js predict
```js
const plural = new Intl.PluralRules('cs');

console.log(plural.select(21));
```
--question-- Jakou kategorii vrátí `plural.select(21)`?
--expected-- other
--why-- Čeština řekne „21 her", ne „21 hra" — jednička na konci čísla tvar nemění, na rozdíl třeba od ruštiny. Pravidlo „končí jedničkou" by tu bylo špatně, a proto je lepší ho nechat na `Intl.PluralRules`, který zná pravidla desítek jazyků.
:::

:::check
`new Intl.PluralRules('cs').select(4)` vrátí `'few'`. Který text z toho postavíš pro slovo „kus"?

### --answer--

`4 kus`

#### --why--

Tvar „kus" patří ke kategorii `'one'`, tedy k jedničce.

### --correct--

`4 kusy`

#### --why--

Kategorie `'few'` jsou v češtině čísla 2 až 4 a k nim patří tvar „kusy".

### --answer--

`4 kusů`

#### --why--

„kusů" patří ke kategorii `'other'`: 0, 5 a víc.

### --see--

js-retezce-cisla/intl-a-datum#mnozne-cislo-intl-pluralrules
:::

## Datum a čas: `Intl.DateTimeFormat`

Datum se formátuje stejně jako číslo: formátovač s jazykem a volbami, pak `format(datum)`. Volby říkají, **které části** data chceš a jak dlouhé.

:::live js
```js
const deadline = new Date(2026, 8, 16, 14, 30);

const short = new Intl.DateTimeFormat('cs-CZ');
const long = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'full', timeStyle: 'short' });
const custom = new Intl.DateTimeFormat('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });

console.log(short.format(deadline));
console.log(long.format(deadline));
console.log(custom.format(deadline));
```
:::

Zkus v `custom` přidat `hour: '2-digit', minute: '2-digit'`, a pak změnit `month: 'long'` na `'short'` a `'numeric'`. Pořadí částí ani oddělovače neurčuješ — ty patří k jazyku. Stejně tak funguje zkratka `deadline.toLocaleDateString('cs-CZ', { … })`.

Ze dvou způsobů, jak chtít části data, si vyber jeden: buď `dateStyle`/`timeStyle` (`'full'`, `'long'`, `'medium'`, `'short'`), nebo jednotlivé části (`weekday`, `day`, `month`, `year`, `hour`, `minute`). Kombinace obojího skončí `TypeError`.

:::check
Jakou volbu přidáš do `Intl.DateTimeFormat('cs-CZ', { … })`, aby se ukázal i název dne v týdnu celým slovem? Napiš jen dvojici `klíč: hodnota`.

### --expected--

weekday: 'long'

### --accept--

weekday: "long"

### --why--

`weekday` řídí den v týdnu, `'long'` ho vypíše celým slovem („středa"), `'short'` zkratkou („st").

### --see--

js-retezce-cisla/intl-a-datum#datum-a-cas-intl-datetimeformat
:::

## Relativní čas: `Intl.RelativeTimeFormat`

„Před 5 minutami", „zítra", „za 3 dny" — na to je `Intl.RelativeTimeFormat`. Rozdíl ale **spočítáš sám**: formátovač dostane číslo a jednotku a vrátí jen text.

:::live js
```js
const relative = new Intl.RelativeTimeFormat('cs', { numeric: 'auto' });

console.log(relative.format(-5, 'minute'));
console.log(relative.format(1, 'day'));
console.log(relative.format(2, 'day'));
console.log(relative.format(-1, 'week'));
console.log(relative.format(3, 'month'));
```
:::

Zkus smazat `{ numeric: 'auto' }`. Místo „zítra" a „pozítří" dostaneš „za 1 den" a „za 2 dny": `numeric: 'auto'` dovolí slovní tvary tam, kde je jazyk má. Záporné číslo znamená minulost, kladné budoucnost.

:::check
Napiš volání, které přes formátovač `relative` (s `numeric: 'auto'`) vrátí text „včera".

### --expected--

relative.format(-1, 'day')

### --accept--

relative.format(-1, 'days')

### --why--

Minulost je záporné číslo, jednotka je den. S `numeric: 'auto'` z `-1` dne vznikne slovo „včera".

### --see--

js-retezce-cisla/intl-a-datum#relativni-cas-intl-relativetimeformat
:::

## Pasti `Date`

`Date` uchovává jeden okamžik jako počet milisekund od 1. 1. 1970 (UTC). Všechno ostatní — rok, měsíc, den v tvém časovém pásmu — dopočítává. Z toho plyne několik pastí.

### Měsíce od nuly a přetékání

V `new Date(rok, měsíc, den)` se **měsíc počítá od nuly**: leden je `0`, prosinec `11`. Den se počítá normálně od `1`. A když zadáš den nebo měsíc mimo rozsah, `Date` chybu nevyhodí, ale přičte přebytek k dalšímu měsíci nebo roku.

:::live js predict
```js
const date = new Date(2026, 1, 30);

console.log(date.toLocaleDateString('cs-CZ'));
```
--question-- Co vypíše `console.log`? Napiš datum tak, jak ho vypíše český formát (třeba `1. 1. 2026`).
--expected-- 2. 3. 2026
--why-- Měsíc `1` je únor. Ten má v roce 2026 jen 28 dní, takže 30. únor je o dva dny za jeho koncem — 2. března. `Date` neplatné datum neodmítne, tiše ho posune. Formulář s datem narození `30. 2.` by tak uložil jiné datum.
:::

Zkus změnit `1` na `12`. Vznikne leden **2027**: měsíc `12` je třináctý měsíc, tedy leden dalšího roku.

> [!PITFALL]
> **Přičtení měsíce k 31. lednu.** `date.setMonth(date.getMonth() + 1)` u 31. ledna 2026 dá 3. března — 31. únor přetekl. Příznak: měsíční předplatné nebo splátka „přeskočí" únor. Oprava: `Temporal.PlainDate` (část níž) přičte měsíc a den zarovná na konec února.

### `Date` se dá změnit

Metody `setDate`, `setMonth` a spol. mění objekt na místě. A `Date` je objekt, takže proměnná drží **odkaz** na něj — stejně jako u polí, ke kterým se dostaneš v sekci Pole.

:::memory
```js
const orderDate = new Date(2026, 8, 14);
const deliveryDate = orderDate;
deliveryDate.setDate(deliveryDate.getDate() + 2);
```
--step-- 1 | vznikne objekt data a proměnná na něj ukazuje
orderDate -> @date
@date: Date 14. 9. 2026
--step-- 2 | přiřazení zkopíruje odkaz, ne datum
orderDate -> @date
deliveryDate -> @date
@date: Date 14. 9. 2026
--step-- 3 | setDate mění jediný objekt, na který ukazují obě proměnné
orderDate -> @date
deliveryDate -> @date
@date: Date 16. 9. 2026
:::

Datum objednávky se tím posunulo taky. Kopii vyrobíš přes `new Date(orderDate)` — nebo s `Temporal`, kde se objekty nemění nikdy.

### Text `'2026-09-14'` je v UTC

`new Date('2026-09-14')` bere datum bez času jako půlnoc v **UTC**, zatímco `new Date('2026-09-14T00:00')` jako půlnoc v tvém pásmu. V Česku se obě liší o 1–2 hodiny, v Americe první z nich spadne na předchozí den. Jiné tvary textu, třeba `'14.9.2026'`, prohlížeč přečte po svém nebo vůbec (`Invalid Date`).

### Rozdíl dnů a letní čas

> [!PITFALL]
> **Den nemá vždycky 24 hodin.** Rozdíl `(new Date(2026, 11, 24) - new Date(2026, 8, 14)) / 86400000` v Česku vyjde `101.04166666666667`, protože v říjnu se posouvají hodiny a jeden den má 25 hodin. Na jaře je to naopak: od 27. do 30. března 2027 vyjde `2.9583333333333335`, protože 28. března má den jen 23 hodin. Příznak: „za 101,04 dne", nebo na jaře o den kratší odpočet po zaokrouhlení dolů. Oprava: `Temporal.PlainDate` a jeho `until`, které počítá kalendářní dny.

:::check
Která volání vytvoří 1. prosince 2026? Vyber všechna.

### --correct--

`new Date(2026, 11, 1)`

#### --why--

Měsíce se počítají od nuly, prosinec je `11`.

### --answer--

`new Date(2026, 12, 1)`

#### --why--

Myslíš si, že prosinec je `12`? Měsíce jdou od nuly, `12` přeteče na leden 2027.

### --correct--

`new Date(2026, 10, 31)`

#### --why--

Měsíc `10` je listopad, který má 30 dní. 31. listopad přeteče na 1. prosince. Funguje to, ale takový kód nikdo nepřečte.

### --see--

js-retezce-cisla/intl-a-datum#mesice-od-nuly-a-pretekani
:::

## `Temporal`: datum bez pastí

[[Temporal]] je nové rozhraní pro datum a čas, které `Date` nahrazuje. V březnu 2026 ho schválila komise, která jazyk řídí (TC39), a vyjde v ECMAScript 2027. Chrome a Edge ho mají od verze 144, Firefox od 139. **Safari ho v září 2026 ve stabilní verzi ještě nemá** — na veřejném webu proto potřebuješ polyfill (třeba balíček `temporal-polyfill`), nebo zatím `Date`. V Akademii i v aktuálním Chromu funguje bez instalace.

Místo jednoho objektu pro všechno má `Temporal` typ pro každou situaci:

| typ | co drží | příklad použití |
|---|---|---|
| `Temporal.PlainDate` | datum bez času a pásma | narozeniny, datum doručení |
| `Temporal.PlainTime` | čas bez data | otevírací doba 9:00 |
| `Temporal.ZonedDateTime` | datum, čas a časové pásmo | začátek online přednášky |
| `Temporal.Duration` | délka | 2 hodiny 30 minut |
| `Temporal.Now` | aktuální okamžik | `Temporal.Now.plainDateISO()` = dnešek |

Měsíce se číslují od `1`, neplatné datum se nepřetočí do dalšího měsíce a **objekty jsou neměnné**: `add` a `with` vracejí nový objekt.

:::live js predict
```js
const start = Temporal.PlainDate.from('2026-01-31');
const nextMonth = start.add({ months: 1 });

console.log(nextMonth.toString());
console.log(start.toString());
```
--question-- Co vypíšou oba řádky? Každé datum na vlastní řádek.
--expected--
```text
2026-02-28
2026-01-31
```
--why-- `Temporal` přičte kalendářní měsíc a den, který v únoru není, zarovná na poslední den měsíce — ne na 3. března jako `Date`. A `start` zůstal beze změny, protože `add` vrací nový objekt.
:::

Počítání dnů a zobrazení česky:

:::live js
```js
const today = Temporal.PlainDate.from('2026-09-14');
const christmas = Temporal.PlainDate.from('2026-12-24');

console.log(today.until(christmas).days);
console.log(today.add({ days: 2 }).toLocaleString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' }));
console.log(today.dayOfWeek, today.month);

const talk = Temporal.ZonedDateTime.from('2026-10-24T20:00[Europe/Prague]');
console.log(talk.add({ days: 1 }).toString());
console.log(talk.add({ hours: 24 }).toString());
```
:::

Zkus za `today` dosadit `Temporal.Now.plainDateISO()` a dostaneš skutečný počet dní do Vánoc. Poslední dva řádky ukazují letní čas: „o den později" je v noci na 25. října jiný okamžik než „o 24 hodin později". `dayOfWeek` je `1` pro pondělí až `7` pro neděli.

> [!PITFALL]
> **`Temporal` v prohlížeči bez podpory neexistuje.** Příznak: stránka v Safari spadne s `ReferenceError: Temporal is not defined`, i když u tebe v Chromu funguje. Oprava: na veřejném webu načti polyfill, nebo před použitím zkontroluj `typeof Temporal !== 'undefined'` a nabídni náhradu přes `Date`.

Porovnání: `a.equals(b)` vrátí `true`, když jde o stejné datum, a `Temporal.PlainDate.compare(a, b)` vrátí `-1`, `0` nebo `1` — `===` porovnává objekty, ne data.

:::explain
Vysvětli vlastními slovy, proč je na datum narození lepší `Temporal.PlainDate` než `Date`.

## --model--

Datum narození je jen kalendářní den, nemá čas ani časové pásmo. `Date` ale vždycky drží okamžik v milisekundách, takže se při převodu mezi pásmy může posunout na jiný den, a navíc počítá měsíce od nuly a neplatné datum tiše přetočí. `Temporal.PlainDate` drží přesně rok, měsíc a den, měsíce počítá od jedničky a objekt se nedá omylem změnit, protože metody vracejí nový.

## --checklist--

- Datum narození nemá čas ani časové pásmo.
- `Date` drží okamžik, takže se datum může posunout podle pásma.
- `Date` počítá měsíce od nuly a neplatné datum přetočí.
- `Temporal.PlainDate` je neměnný a metody vracejí nový objekt.
:::

:::check
Co vrátí `Temporal.PlainDate.from('2026-09-14').add({ days: 20 }).month`?

### --expected--

10

### --why--

14. září plus 20 dní je 4. října. `Temporal` čísluje měsíce od jedničky, takže říjen je `10`. U `Date` by `getMonth()` vrátil `9`.

### --see--

js-retezce-cisla/intl-a-datum#temporal-datum-bez-pasti
:::

## Typické chyby a pasti

### Formátovač bez jazyka

> [!PITFALL]
> **`new Intl.NumberFormat()` bez jazyka použije jazyk prohlížeče.** U tebe vyjde `1 234,5`, u uživatele s anglickým systémem `1,234.5` — a u testů v jiném prostředí zase něco jiného. Oprava: jazyk piš vždycky, `'cs-CZ'` nebo `'cs'`.

### Zaokrouhlení skryté ve formátování

> [!PITFALL]
> **Formátovač zaokrouhluje jen výpis.** S `maximumFractionDigits: 0` ukáže `1299.5` jako `1 300 Kč`, ale v proměnné zůstane `1299.5` a dál se s ním počítá. Příznak: položky na stránce se sečtou na jiný součet, než ukazuje „Celkem". Oprava: zaokrouhli číslo sám (v haléřích) a formátovači dej hotovou hodnotu.

### Porovnání dat přes `===`

:::live js predict
```js
const a = Temporal.PlainDate.from('2026-09-14');
const b = Temporal.PlainDate.from('2026-09-14');

console.log(a === b, a.equals(b));
```
--question-- Co vypíše `console.log(a === b, a.equals(b))`? Napiš obě hodnoty oddělené mezerou.
--expected-- false true
--why-- `a` a `b` jsou dva různé objekty se stejným datem a `===` u objektů porovnává, jestli jde o **tentýž** objekt. Na shodu data slouží `equals`. U `Date` totéž udělá `a.getTime() === b.getTime()`.
:::

:::check
Kolega zobrazuje „Doručíme za X dní" jako `Math.floor((delivery - today) / 86400000)` nad objekty `Date`. Kdy to může ukázat o den méně?

### --answer--

Nikdy, den má vždycky 86 400 000 milisekund.

#### --why--

Myslíš si, že každý den má 24 hodin? V den změny letního času má 23 nebo 25.

### --correct--

Když mezi daty je jarní posun hodin na letní čas.

#### --why--

Den s 23 hodinami zkrátí rozdíl pod celé číslo (třeba `2.958…`) a `Math.floor` ho usekne dolů. Na podzim má den 25 hodin, rozdíl vyjde o kousek víc a `Math.floor` náhodou sedí. Kalendářní dny spolehlivě spočítá `Temporal.PlainDate` a `until`.

### --answer--

Jen když jsou obě data v jiném roce.

#### --why--

Přelom roku na délku dne vliv nemá. Hledej událost, kdy se posouvají hodiny.

### --see--

js-retezce-cisla/intl-a-datum#rozdil-dnu-a-letni-cas
:::

Ve workshopu Ceny v košíku z toho postavíš ceny s DPH, „3 hry" a datum doručení.

## Kde to najdeš v MDN

- [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat) — všechny volby konstruktoru (`style`, `currency`, `unit`, `maximumFractionDigits`) s příklady.
- [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules) — co vrací `select` a jaké kategorie existují.
- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) — volby `dateStyle`, `weekday`, `month` a proč nejdou kombinovat.
- [Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) — přehled typů, tabulka podpory v prohlížečích a odkazy na polyfill.

# --questions--

## --question--

Co vypíše tenhle kód?

```js
const plural = new Intl.PluralRules('cs');
console.log(plural.select(0));
```

### --expected--

other

### --why--

Nula se v češtině chová jako pět a víc: „0 her", „0 kusů". Proto kategorie `'other'`.

### --see--

js-retezce-cisla/intl-a-datum#mnozne-cislo-intl-pluralrules

## --question--

Napiš výraz, který z objektu `today` typu `Temporal.PlainDate` vytvoří datum o týden později.

### --expected--

today.add({ days: 7 })

### --accept--

today.add({ weeks: 1 })
today.add({days:7})

### --why--

`add` dostane objekt s délkou a vrátí nové datum. `today` se nezmění.

### --see--

js-retezce-cisla/intl-a-datum#temporal-datum-bez-pasti

## --question--

Test v e-shopu porovnává `formatPrice(1299) === '1 299,00 Kč'` a selže, přestože konzole ukazuje přesně `1 299,00 Kč`. Proč?

### --answer--

`Intl.NumberFormat` vrací číslo, ne text.

#### --why--

`format` vrací řetězec. Rozdíl je v jednom neviditelném znaku.

### --correct--

Mezery ve výsledku `Intl` jsou nezalomitelné (U+00A0), ne obyčejné.

#### --why--

Na obrazovce vypadají stejně, ale `===` porovnává kódy znaků. Pomůže `replace(/\s/g, ' ')` nebo porovnání s výsledkem stejného formátovače.

### --answer--

`Kč` se v češtině píše před číslem.

#### --why--

Česká pravidla píšou `Kč` za číslem a formátovač to tak dělá.

### --see--

js-retezce-cisla/intl-a-datum#intl-numberformat-ceny-procenta-a-jednotky

## --question--

Co vypíše tenhle kód?

```js
const date = new Date(2026, 0, 15);
date.setMonth(12);
console.log(date.getFullYear(), date.getMonth());
```

### --expected--

2027 0

### --why--

Měsíc `12` je v `Date` třináctý měsíc: přeteče do ledna dalšího roku. Leden je `0`, proto `2027 0`.

### --see--

js-retezce-cisla/intl-a-datum#mesice-od-nuly-a-pretekani
