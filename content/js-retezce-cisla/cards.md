## --card-- output

Co vypíše tenhle kód?

```js
let orderId = '42';
orderId.padStart(5, '0');
console.log(orderId.length);
```

### --expected--

2

### --why--

Myslíš si, že `padStart` doplní nuly do proměnné? Vrátí nový řetězec `'00042'`, a ten tu nikdo neuložil. `orderId` má pořád dva znaky.

### --see--

js-retezce-cisla/retezce#zahozeny-vysledek-metody

## --card-- output

Co vypíše tenhle kód?

```js
console.log('Kč 1 290'.replace(' ', '_'));
```

### --expected--

Kč_1 290

### --why--

`replace` s obyčejným textem nahradí jen první výskyt. Všechny mezery nahradí `replaceAll`.

### --see--

js-retezce-cisla/retezce#upravy-trim-velikost-pismen-padstart-replaceall

## --card-- output

Co vypíše tenhle kód?

```js
console.log('Šumava' < 'Tatry');
```

### --expected--

false

### --why--

`<` porovnává čísla znaků v Unicode a `Š` má vyšší číslo než `T`. Podle české abecedy by Šumava byla první — to umí `localeCompare(b, 'cs')`.

### --see--

js-retezce-cisla/retezce#porovnani-a-razeni-podle-cestiny

## --card-- output

Co vypíše tenhle kód?

```js
console.log('🇨🇿'.length);
```

### --expected--

4

### --why--

Vlajka se skládá ze dvou znaků (regionálních písmen C a Z) a každý zabírá dvě kódové jednotky. `length` počítá jednotky, ne obrázky.

### --see--

js-retezce-cisla/retezce#unicode-diakritika-a-emoji

## --card-- output

Co vypíše tenhle kód?

```js
console.log('Řízek'.normalize('NFD').length);
```

### --expected--

7

### --why--

`NFD` rozloží `Ř` na `R` a háček a `í` na `i` a čárku. Z pěti písmen je sedm znaků, a značky jdou pak smazat přes `replace(/\p{M}/gu, '')`.

### --see--

js-retezce-cisla/retezce#diakritika-a-normalize

## --card-- output

Co vypíše tenhle kód?

```js
console.log((2.5).toFixed(0) + 1);
```

### --expected--

31

### --why--

`toFixed` vrací řetězec `'3'` a `+` s řetězcem spojuje text. S výsledkem `toFixed` se nepočítá, slouží jen na výpis.

### --see--

js-retezce-cisla/cisla#tofixed-vraci-retezec

## --card-- output

Co vypíše tenhle kód?

```js
console.log(Number('  7  ') + Number('7 ks'));
```

### --expected--

NaN

### --why--

`Number('  7  ')` je `7`, mezery na krajích nevadí. `Number('7 ks')` je ale `NaN`, protože celý text číslem není, a cokoli plus `NaN` je `NaN`.

### --see--

js-retezce-cisla/cisla#z-textu-na-cislo-number-parseint-parsefloat

## --card-- output

Co vypíše tenhle kód?

```js
console.log(Math.ceil(-4.2));
```

### --expected--

-4

### --why--

`ceil` jde nahoru na číselné ose, k většímu číslu. U záporného čísla je větší `-4`, ne `-5`.

### --see--

js-retezce-cisla/cisla#zaokrouhleni-round-floor-ceil-a-trunc

## --card-- output

Co vypíše tenhle kód?

```js
const deadline = new Date(2027, 3, 31);
console.log(deadline.getMonth(), deadline.getDate());
```

### --expected--

4 1

### --why--

Myslíš si, že `3` je březen? Měsíce jdou od nuly, `3` je duben, a ten má jen 30 dní. `Date` chybu nevyhodí a 31. duben přetočí na 1. května, který má číslo `4`.

### --see--

js-retezce-cisla/intl-a-datum#mesice-od-nuly-a-pretekani

## --card-- output

Co vypíše tenhle kód?

```js
console.log(new Intl.PluralRules('cs').select(100));
```

### --expected--

other

### --why--

„100 her", „100 kusů": čísla od pěti výš i nula patří v češtině do kategorie `other`. `few` mají jen 2, 3 a 4.

### --see--

js-retezce-cisla/intl-a-datum#mnozne-cislo-intl-pluralrules

## --card-- output

Co vypíše tenhle kód?

```js
console.log(/kolo/i.test('KOLOBĚŽKA'));
```

### --expected--

true

### --why--

Bez kotev stačí, že vzor je **někde** v textu, a `i` přehlédne velikost písmen. Na celé slovo by byl potřeba `/^kolo$/i`.

### --see--

js-retezce-cisla/regularni-vyrazy#kotvy-a-cely-text-ne-kousek

## --card-- output

Co vypíše tenhle kód?

```js
console.log('(A) nebo (B)'.match(/\(.+\)/)[0]);
```

### --expected--

(A) nebo (B)

### --why--

`+` je hladový: `.+` spolkne všechno a vrací se jen k **poslední** závorce. Jen `(A)` by vzal líný `.+?`.

### --see--

js-retezce-cisla/regularni-vyrazy#kvantifikatory-kolikrat

## --card-- output

Co vypíše tenhle kód?

```js
const match = '10.5.2026'.match(/(\d+)\.(\d+)/);
console.log(match[2]);
```

### --expected--

5

### --why--

`match[0]` je celá shoda `10.5`, `match[1]` první skupina `10` a `match[2]` druhá skupina `5`.

### --see--

js-retezce-cisla/regularni-vyrazy#skupiny-vytahni-casti-textu

## --card-- code js

Napiš funkci `fileExtension(fileName)`, která vrátí příponu za **poslední** tečkou (`'faktura.2026.pdf'` → `'pdf'`). Když jméno tečku nemá, vrátí prázdný text.

### --seed--

```js
function fileExtension(fileName) {
}
```

### --test--

```js
assert.equal(fileExtension('faktura.2026.pdf'), 'pdf', "fileExtension('faktura.2026.pdf') má vrátit 'pdf'");
assert.equal(fileExtension('foto.jpeg'), 'jpeg', "fileExtension('foto.jpeg') má vrátit 'jpeg'");
assert.equal(fileExtension('README'), '', "fileExtension('README') má vrátit '' — jméno bez tečky");
```

### --solution--

```js
function fileExtension(fileName) {
  const dot = fileName.lastIndexOf('.');
  if (dot === -1) {
    return '';
  }
  return fileName.slice(dot + 1);
}
```

### --why--

`lastIndexOf` najde poslední tečku a `slice(dot + 1)` vezme text za ní. Bez kontroly `-1` by `slice(0)` vrátil celé jméno.

### --see--

js-retezce-cisla/retezce#kousky-textu-at-slice-a-hledani

## --card-- code js

Napiš funkci `ticketCode(number)`, která z čísla vstupenky vrátí kód `VST-` a číslo doplněné nulami zleva na čtyři číslice (`42` → `'VST-0042'`).

### --seed--

```js
function ticketCode(number) {
}
```

### --test--

```js
assert.equal(ticketCode(42), 'VST-0042', "ticketCode(42) má vrátit 'VST-0042'");
assert.equal(ticketCode(7), 'VST-0007', "ticketCode(7) má vrátit 'VST-0007'");
assert.equal(ticketCode(1234), 'VST-1234', "ticketCode(1234) má vrátit 'VST-1234'");
```

### --solution--

```js
function ticketCode(number) {
  return `VST-${String(number).padStart(4, '0')}`;
}
```

### --why--

`padStart` je metoda řetězce, proto se číslo nejdřív převede přes `String`.

### --see--

js-retezce-cisla/retezce#upravy-trim-velikost-pismen-padstart-replaceall

## --card-- code js

Napiš funkci `withoutDiacritics(text)`, která vrátí text bez háčků a čárek se zachovanou velikostí písmen (`'Šťastná Ústí'` → `'Stastna Usti'`).

### --seed--

```js
function withoutDiacritics(text) {
}
```

### --test--

```js
assert.equal(withoutDiacritics('Šťastná Ústí'), 'Stastna Usti', "withoutDiacritics('Šťastná Ústí') má vrátit 'Stastna Usti'");
assert.equal(withoutDiacritics('Brno'), 'Brno', "withoutDiacritics('Brno') má vrátit 'Brno'");
```

### --solution--

```js
function withoutDiacritics(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}
```

### --why--

Nejdřív rozložit (`NFD`), pak smazat značky. Bez rozložení nemá `Š` žádnou samostatnou značku a `replace` nic nesmaže.

### --see--

js-retezce-cisla/retezce#diakritika-a-normalize

## --card-- code js

Napiš funkci `refundCrowns(halere)`, která zápornou částku vratky v haléřích zaokrouhlí na celé koruny **jako na papíře** a vrátí je v haléřích (`-12350` → `-12400`, `-12349` → `-12300`).

### --seed--

```js
function refundCrowns(halere) {
}
```

### --test--

```js
assert.equal(refundCrowns(-12350), -12400, 'refundCrowns(-12350) má vrátit -12400 — přesná polovina od nuly');
assert.equal(refundCrowns(-12349), -12300, 'refundCrowns(-12349) má vrátit -12300');
assert.equal(refundCrowns(-50000), -50000, 'refundCrowns(-50000) má vrátit -50000');
```

### --solution--

```js
function refundCrowns(halere) {
  return -Math.round(-halere / 100) * 100;
}
```

### --why--

`Math.round(-123.5)` je `-123`, protože polovinu posouvá k většímu číslu. Zaokrouhli kladnou hodnotu a minus přidej zpátky.

### --see--

js-retezce-cisla/cisla#zaokrouhleni-round-floor-ceil-a-trunc

## --card-- code js

Napiš funkci `isTime(text)`, která vrátí `true`, jen když je **celý** text čas ve tvaru dvou číslic, dvojtečky a dvou číslic (`'09:30'`). Rozsah hodin neřeš.

### --seed--

```js
function isTime(text) {
}
```

### --test--

```js
assert.equal(isTime('09:30'), true, "isTime('09:30') má vrátit true");
assert.equal(isTime('9:30'), false, "isTime('9:30') má vrátit false — hodina má dvě číslice");
assert.equal(isTime('Začátek 09:30'), false, "isTime('Začátek 09:30') má vrátit false — text navíc");
assert.equal(isTime('09:305'), false, "isTime('09:305') má vrátit false");
```

### --solution--

```js
function isTime(text) {
  return /^\d{2}:\d{2}$/.test(text);
}
```

### --why--

Kotvy `^` a `$` vynutí, že čas tvoří celý text. Bez nich projde i `Začátek 09:30`.

### --see--

js-retezce-cisla/regularni-vyrazy#kotvy-a-cely-text-ne-kousek

## --card-- code js

Napiš funkci `daysBetween(from, to)`, která pro dvě data ve tvaru `'2027-03-27'` vrátí počet kalendářních dnů mezi nimi, i přes změnu času.

### --seed--

```js
function daysBetween(from, to) {
}
```

### --test--

```js
assert.equal(daysBetween('2027-03-27', '2027-03-30'), 3, "daysBetween('2027-03-27', '2027-03-30') má vrátit 3 — i když jeden den má 23 hodin");
assert.equal(daysBetween('2026-12-24', '2027-01-01'), 8, "daysBetween('2026-12-24', '2027-01-01') má vrátit 8");
```

### --solution--

```js
function daysBetween(from, to) {
  return Temporal.PlainDate.from(from).until(to).days;
}
```

### --why--

`PlainDate` nemá hodiny ani pásmo, takže `until` počítá kalendářní dny. Dělení milisekund `86400000` by přes změnu času nesedělo.

### --see--

js-retezce-cisla/intl-a-datum#rozdil-dnu-a-letni-cas

## --card-- free

Proč `0.1 + 0.2 !== 0.3` a jak se v JavaScriptu bezpečně počítá s penězi?

### --back--

Čísla se ukládají ve dvojkové soustavě jako plovoucí řádová čárka a desetiny v ní nemají přesný zápis, stejně jako třetina v desítkové. `0.1` i `0.2` jsou uložené přibližně a součet vyjde `0.30000000000000004`. Celá čísla jsou ale přesná, proto se částky drží v haléřích nebo centech a počítá se s celými čísly. Převod z korun dělám přes `Math.round(koruny * 100)`, zaokrouhluju na jednom místě a na koruny převádím až při výpisu, třeba přes `Intl.NumberFormat`.

### --see--

js-retezce-cisla/cisla#pocitani-v-halerich

## --card-- free

Jaký je rozdíl mezi `Number`, `parseInt` a `parseFloat` při převodu textu na číslo?

### --back--

`Number` je přísný: celý text musí být číslo, jinak vrátí `NaN`; prázdný text ale převede na `0`. `parseInt` a `parseFloat` čtou číslo zleva a zbytek tiše zahodí, takže z `'12px'` udělají `12` a propustí i nesmysl s číslem na začátku. `parseInt` bere jen celou část a píše se se soustavou `10`. Na vstup z formuláře volím `Number` a hned kontroluju `Number.isNaN`; `parseFloat` se hodí, když za číslem je jednotka, kterou chci zahodit.

### --see--

js-retezce-cisla/cisla#z-textu-na-cislo-number-parseint-parsefloat

## --card-- free

Proč `'👍🏽'.length` vrátí 4 a jak spočítáš znaky tak, jak je vidí uživatel?

### --back--

JavaScript ukládá řetězce po 16bitových kódových jednotkách a `length` počítá právě je. Emoji palce zabírá dvě jednotky a odstín pleti je samostatný znak s dalšími dvěma. `[...text].length` nebo `for…of` počítají celé znaky Unicode, tedy dva. To, co člověk vidí jako jeden znak, je grafém a spočítá ho `Intl.Segmenter` s `granularity: 'grapheme'` — ten patří do počítadla znaků ve formuláři.

### --see--

js-retezce-cisla/retezce#unicode-diakritika-a-emoji

## --card-- free

Jaké pasti má objekt `Date` a co s nimi dělá `Temporal`?

### --back--

`Date` čísluje měsíce od nuly a neplatné datum tiše přetočí, třeba 30. únor na začátek března. Objekt je měnitelný, takže `setDate` na sdíleném odkazu posune datum i jinde. Drží okamžik v milisekundách, takže text `'2026-09-14'` bere jako UTC a rozdíl dnů přes změnu času nesedí. `Temporal` má zvláštní typy (`PlainDate` pro datum bez času, `ZonedDateTime` s pásmem), měsíce počítá od jedničky, přičtení měsíce zarovná na konec měsíce a objekty jsou neměnné. V Safari zatím chybí, na veřejném webu proto potřebuje polyfill.

### --see--

js-retezce-cisla/intl-a-datum#pasti-date

## --card-- free

Proč formátovat čísla a data přes `Intl`, a ne ručně přes `toFixed` a skládání textu?

### --back--

`Intl` zná pravidla jazyka a země: desetinnou čárku, mezery mezi tisíci, pozici měny, názvy měsíců i množné číslo, které má v češtině tři tvary plus desetinná čísla. Ruční skládání tyhle detaily vynechá a na jiném jazyce webu se rozbije. Formátovač vytvořím s kódem jazyka, třeba `'cs-CZ'`, protože bez něj rozhoduje prohlížeč uživatele. Pozor, výsledek obsahuje nezalomitelné mezery, takže ho neporovnávám s ručně napsaným textem.

### --see--

js-retezce-cisla/intl-a-datum#intl-numberformat-ceny-procenta-a-jednotky

## --card-- free

Kdy regulární výraz použiješ a kdy ne?

### --back--

Regulární výraz se hodí na kontrolu **tvaru** textu (PSČ, čas, telefon) a na hledání nebo nahrazování vzoru, a pro kontrolu celého vstupu vždycky s kotvami `^` a `$`. Nepoužiju ho na konkrétní text, kde stačí `includes`, `startsWith` nebo `replaceAll`, na URL (`URL.canParse`), na HTML (DOM) ani na logiku typu „je datum platné", kterou napíšu v obyčejném kódu. Když výraz skládám z textu od uživatele, escapuju ho přes `RegExp.escape`.

### --see--

js-retezce-cisla/regularni-vyrazy#kdy-regularni-vyraz-nepouzit

## --card-- free

Proč metody řetězce nemění původní řetězec a co z toho plyne pro tvůj kód?

### --back--

Řetězce jsou v JavaScriptu neměnné: žádná metoda nepřepíše znaky uvnitř a zápis `text[0] = 'X'` nic nezmění. `trim`, `toUpperCase` nebo `replaceAll` vždycky vracejí nový řetězec. Výsledek proto musím uložit (`name = name.trim()`) nebo rovnou vrátit z funkce, jinak se zahodí a chyba se nijak neohlásí. Díky tomu ale můžu metody bezpečně řetězit za sebou.

### --see--

js-retezce-cisla/retezce#retezec-se-neda-zmenit
