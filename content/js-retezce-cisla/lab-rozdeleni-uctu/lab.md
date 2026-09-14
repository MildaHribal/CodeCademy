---
title: Rozdělení společných výdajů
runtime: js
see: js-retezce-cisla/cisla#pocitani-v-halerich
---

# --description--

Aplikace na společné výdaje (jako Splitwise nebo Tricount) řeší problém, který zná každá parta: kdo co zaplatil na chatě, kolik z toho připadá na každého a kdo komu dluží. Postavíš jejich výpočetní jádro. Tentokrát bez návodu — o postupu rozhoduješ sám. Používej, co ses naučil v lekcích Řetězce a Čísla: převod textu na číslo, haléře, zaokrouhlení a `toFixed`. Pomocné funkce si klidně přidej.

**Téma je tvoje volba:** víkend na chatě, spolubydlení, dovolená u moře nebo kapela, která si dělí nájem zkušebny. Jména, texty vět a ukázková data na konci `script.js` si přepiš podle sebe — testy kontrolují jen čísla a tvar částek.

Co má aplikace umět:

- Kdo něco zaplatil, napíše částku tak, jak je zvyklý: `1 250`, `249,90` nebo `249.90`. Aplikace ji uloží v celých haléřích a nesmysl odmítne.
- Účet se rozdělí mezi lidi tak, aby součet podílů seděl na haléř. Haléře, které při dělení zbudou, dostanou první lidé v pořadí, každý nejvýš jeden navíc.
- Parta přidá spropitné zadané jako text, třeba `10 %` nebo `12,5`.
- Kdo se vyrovnává v hotovosti, platí částku zaokrouhlenou na celé koruny, a to stejně pro vrácení i doplatek.
- U každého je vidět zůstatek jako český text s desetinnou čárkou a věta, jestli dostane peníze zpátky, nebo doplácí.

Přesné požadavky jsou v seznamu kontrol. V `script.js` jsou prázdné kostry funkcí s popisem.

> [!NOTE]
> Mezery mezi tisíci (`1 250,00 Kč`) psát nemusíš, kontroly přijmou oba tvary. Česky podle všech pravidel naformátuje částku `Intl.NumberFormat`, ke kterému se dostaneš v příští lekci.

# --hints--

`parseAmount(text)` převede celé koruny na haléře; mezery mezi tisíci a na krajích nevadí.

```js
assert.equal(parseAmount('850'), 85000, "parseAmount('850') má vrátit 85000");
assert.equal(parseAmount('1 250'), 125000, "parseAmount('1 250') má vrátit 125000 — mezera mezi tisíci se ignoruje");
assert.equal(parseAmount('  320 '), 32000, "parseAmount('  320 ') má vrátit 32000");
```

`parseAmount(text)` přijme desetinnou čárku i tečku a vrátí vždycky celé haléře.

```js
assert.equal(parseAmount('249,90'), 24990, "parseAmount('249,90') má vrátit 24990");
assert.equal(parseAmount('249.90'), 24990, "parseAmount('249.90') má vrátit 24990");
assert.equal(parseAmount('4,35'), 435, "parseAmount('4,35') má vrátit 435 — ne 434");
assert.equal(parseAmount('1 250,5'), 125050, "parseAmount('1 250,5') má vrátit 125050");
assert.ok(Number.isInteger(parseAmount('19,99')), "parseAmount('19,99') má vrátit celé číslo haléřů");
```

`parseAmount(text)` vrátí `null` pro prázdný text, text, který není celý číslem, a zápornou částku.

```js
assert.equal(parseAmount(''), null, "parseAmount('') má vrátit null — pozor, Number('') je 0");
assert.equal(parseAmount('   '), null, "parseAmount('   ') má vrátit null");
assert.equal(parseAmount('pizza'), null, "parseAmount('pizza') má vrátit null");
assert.equal(parseAmount('120 Kč na benzín'), null, "parseAmount('120 Kč na benzín') má vrátit null — celý text musí být částka");
assert.equal(parseAmount('12,5,0'), null, "parseAmount('12,5,0') má vrátit null");
assert.equal(parseAmount('-50'), null, "parseAmount('-50') má vrátit null — záporná útrata nedává smysl");
```

`shareOf(totalHalere, people, index)` vrátí podíl člověka s pořadím `index` (od nuly); zbylé haléře dostanou první lidé, každý jeden navíc.

```js
assert.equal(shareOf(90000, 3, 0), 30000, 'shareOf(90000, 3, 0) má vrátit 30000 — dělí se beze zbytku');
assert.equal(shareOf(100000, 3, 0), 33334, 'shareOf(100000, 3, 0) má vrátit 33334 — první dostane zbylý haléř');
assert.equal(shareOf(100000, 3, 1), 33333, 'shareOf(100000, 3, 1) má vrátit 33333');
assert.equal(shareOf(100003, 4, 2), 25001, 'shareOf(100003, 4, 2) má vrátit 25001 — zbudou 3 haléře pro první tři lidi');
assert.equal(shareOf(100003, 4, 3), 25000, 'shareOf(100003, 4, 3) má vrátit 25000 — čtvrtý už haléř navíc nedostane');
```

Podíly všech lidí dají dohromady přesně celý účet.

```js
for (const [total, people] of [[125050, 3], [99999, 7], [4, 6]]) {
  let sum = 0;
  for (let index = 0; index < people; index++) {
    const share = shareOf(total, people, index);
    assert.ok(Number.isInteger(share), `shareOf(${total}, ${people}, ${index}) má vrátit celé číslo haléřů`);
    sum += share;
  }
  assert.equal(sum, total, `součet shareOf(${total}, ${people}, 0 až ${people - 1}) má být přesně ${total}`);
}
```

`tipHalere(totalHalere, percentText)` vrátí spropitné v celých haléřích z procent zadaných textem, i s `%` nebo desetinnou čárkou.

```js
assert.equal(tipHalere(124990, '10 %'), 12499, "tipHalere(124990, '10 %') má vrátit 12499");
assert.equal(tipHalere(100000, '12,5'), 12500, "tipHalere(100000, '12,5') má vrátit 12500 — 12,5 %, ne 12 %");
assert.equal(tipHalere(33333, '15'), 5000, "tipHalere(33333, '15') má vrátit 5000 (4 999,95 zaokrouhleno na celé haléře)");
```

`tipHalere` vrátí `0`, když procenta nejsou číslo nebo jsou záporná.

```js
assert.equal(tipHalere(124990, 'hodně'), 0, "tipHalere(124990, 'hodně') má vrátit 0");
assert.equal(tipHalere(124990, ''), 0, "tipHalere(124990, '') má vrátit 0");
assert.equal(tipHalere(124990, '-10'), 0, "tipHalere(124990, '-10') má vrátit 0");
```

`roundToCrowns(halere)` zaokrouhlí kladnou částku na nejbližší celé koruny (přesná polovina nahoru) a vrátí ji v haléřích.

```js
assert.equal(roundToCrowns(24950), 25000, 'roundToCrowns(24950) má vrátit 25000');
assert.equal(roundToCrowns(24949), 24900, 'roundToCrowns(24949) má vrátit 24900');
assert.equal(roundToCrowns(0), 0, 'roundToCrowns(0) má vrátit 0');
```

`roundToCrowns(halere)` zaokrouhlí zápornou částku stejně jako kladnou, jen se znaménkem minus.

```js
assert.equal(roundToCrowns(-24950), -25000, 'roundToCrowns(-24950) má vrátit -25000 — doplatek 249,50 Kč se zaokrouhlí na 250 Kč, stejně jako vrácení');
assert.equal(roundToCrowns(-24949), -24900, 'roundToCrowns(-24949) má vrátit -24900');
assert.equal(roundToCrowns(-12350), -12400, 'roundToCrowns(-12350) má vrátit -12400');
```

`formatKc(halere)` vrátí částku jako text s desetinnou čárkou, dvěma desetinnými místy a `Kč`.

```js
const plain = (text) => String(text).replace(/\s/g, ' ');
assert.equal(plain(formatKc(24990)), '249,90 Kč', "formatKc(24990) má vrátit '249,90 Kč'");
assert.match(plain(formatKc(125000)), /^1 ?250,00 Kč$/, "formatKc(125000) má vrátit '1250,00 Kč' (mezera mezi tisíci smí být, nemusí)");
assert.equal(plain(formatKc(5)), '0,05 Kč', "formatKc(5) má vrátit '0,05 Kč'");
```

`formatKc(halere)` vrátí zápornou částku s minusem.

```js
assert.equal(String(formatKc(-24990)).replace(/\s/g, ' '), '-249,90 Kč', "formatKc(-24990) má vrátit '-249,90 Kč'");
```

`balanceText(name, balanceHalere)` vrátí větu se jménem a částkou bez minusu; pro kladný a záporný zůstatek jsou věty různé.

```js
const plain = (text) => String(text).replace(/\s/g, ' ');
const plus = plain(balanceText('Ondra', 24990));
const minus = plain(balanceText('Ondra', -24990));
assert.equal(typeof balanceText('Ondra', 24990), 'string', 'balanceText má vrátit text');
assert.ok(plus.includes('Ondra') && minus.includes('Ondra'), `věty mají obsahovat jméno Ondra: '${plus}', '${minus}'`);
assert.ok(plus.includes('249,90 Kč') && minus.includes('249,90 Kč'), `obě věty mají obsahovat částku '249,90 Kč': '${plus}', '${minus}'`);
assert.ok(!minus.includes('-'), `věta pro záporný zůstatek nemá obsahovat minus — z textu se pozná, že doplácí: '${minus}'`);
assert.notEqual(plus, minus, 'věta pro kladný zůstatek (dostane zpátky) se má lišit od věty pro záporný (doplácí)');
```

`balanceText` pro nulový zůstatek vrátí větu se jménem a bez částky.

```js
const zero = balanceText('Bára', 0);
assert.ok(zero.includes('Bára'), `věta pro nulový zůstatek má obsahovat jméno: '${zero}'`);
assert.ok(!zero.includes('Kč'), `věta pro nulový zůstatek nemá obsahovat částku: '${zero}'`);
assert.notEqual(zero, balanceText('Bára', 100), 'věta pro nulový zůstatek se má lišit od věty pro kladný');
```

# --help--

## --tip-- 4

Haléře, které zbudou, spočítá operátor zbytku po dělení `%`. Kdo z lidí dostane haléř navíc, rozhodne porovnání jeho `index` s tímhle zbytkem.

## --tip-- 9

Vzpomeň si, na kterou stranu `Math.round` posune přesnou polovinu u záporného čísla v části [Zaokrouhlení](see:js-retezce-cisla/cisla#zaokrouhleni-round-floor-ceil-a-trunc). Zkus zaokrouhlit kladnou hodnotu a znaménko vrátit až na konci.

# --seed--

## --file-- script.js

```js
/**
 * Částka z textu ('1 250', '249,90', '249.90') v celých haléřích, nebo null.
 * @param {string} text
 * @returns {number | null}
 */
function parseAmount(text) {
}

/**
 * Podíl člověka s pořadím index (od 0) v haléřích; zbylé haléře dostanou první lidé.
 * @param {number} totalHalere
 * @param {number} people
 * @param {number} index
 * @returns {number}
 */
function shareOf(totalHalere, people, index) {
}

/**
 * Spropitné v celých haléřích z procent zadaných textem ('10 %', '12,5'), jinak 0.
 * @param {number} totalHalere
 * @param {string} percentText
 * @returns {number}
 */
function tipHalere(totalHalere, percentText) {
}

/**
 * Částka zaokrouhlená na celé koruny, v haléřích; záporná stejně jako kladná.
 * @param {number} halere
 * @returns {number}
 */
function roundToCrowns(halere) {
}

/**
 * Částka jako text '249,90 Kč'.
 * @param {number} halere
 * @returns {string}
 */
function formatKc(halere) {
}

/**
 * Věta o zůstatku: kladný = dostane zpátky, záporný = doplácí, nula = vyrovnáno.
 * @param {string} name
 * @param {number} balanceHalere
 * @returns {string}
 */
function balanceText(name, balanceHalere) {
}

// Víkend na chatě v Peci pod Sněžkou — přepiš si data podle svého tématu.
const cabin = parseAmount('4 800');
console.log('Chata:', cabin, 'haléřů');
console.log('Podíl první osoby ze tří:', shareOf(cabin ?? 0, 3, 0));
```

# --solution--

## --file-- script.js

```js
function parseAmount(text) {
  const value = text.trim().replaceAll(' ', '').replace(',', '.');
  if (value === '') {
    return null;
  }
  const amount = Number(value);
  if (Number.isNaN(amount) || amount < 0) {
    return null;
  }
  return Math.round(amount * 100);
}

function shareOf(totalHalere, people, index) {
  const base = Math.floor(totalHalere / people);
  const leftover = totalHalere % people;
  return index < leftover ? base + 1 : base;
}

function tipHalere(totalHalere, percentText) {
  const percent = parseFloat(percentText.replace(',', '.'));
  if (Number.isNaN(percent) || percent < 0) {
    return 0;
  }
  return Math.round(totalHalere * percent / 100);
}

function roundToCrowns(halere) {
  const rounded = Math.round(Math.abs(halere) / 100) * 100;
  return halere < 0 ? -rounded : rounded;
}

function formatKc(halere) {
  return `${(halere / 100).toFixed(2).replace('.', ',')} Kč`;
}

function balanceText(name, balanceHalere) {
  if (balanceHalere === 0) {
    return `${name} je vyrovnaný.`;
  }
  const amount = formatKc(Math.abs(balanceHalere));
  if (balanceHalere > 0) {
    return `${name} dostane zpátky ${amount}.`;
  }
  return `${name} doplatí ${amount}.`;
}

// Víkend na chatě v Peci pod Sněžkou — přepiš si data podle svého tématu.
const cabin = parseAmount('4 800');
console.log('Chata:', cabin, 'haléřů');
console.log('Podíl první osoby ze tří:', shareOf(cabin ?? 0, 3, 0));
```

# --approaches--

## --approach-- Převod přes Number a Math.round

Text se upraví do tvaru, kterému rozumí `Number`, a na haléře se převede přes `Math.round`. Krátké a čitelné; spoléhá na to, že `Math.round` srovná nepřesnost desetinného čísla (`4.35 * 100`).

### --file-- script.js

```js
function parseAmount(text) {
  const value = text.trim().replaceAll(' ', '').replace(',', '.');
  if (value === '') {
    return null;
  }
  const amount = Number(value);
  if (Number.isNaN(amount) || amount < 0) {
    return null;
  }
  return Math.round(amount * 100);
}

function shareOf(totalHalere, people, index) {
  const base = Math.floor(totalHalere / people);
  const leftover = totalHalere % people;
  return index < leftover ? base + 1 : base;
}

function tipHalere(totalHalere, percentText) {
  const percent = parseFloat(percentText.replace(',', '.'));
  if (Number.isNaN(percent) || percent < 0) {
    return 0;
  }
  return Math.round(totalHalere * percent / 100);
}

function roundToCrowns(halere) {
  const rounded = Math.round(Math.abs(halere) / 100) * 100;
  return halere < 0 ? -rounded : rounded;
}

function formatKc(halere) {
  return `${(halere / 100).toFixed(2).replace('.', ',')} Kč`;
}

function balanceText(name, balanceHalere) {
  if (balanceHalere === 0) {
    return `${name} je vyrovnaný.`;
  }
  const amount = formatKc(Math.abs(balanceHalere));
  return balanceHalere > 0 ? `${name} dostane zpátky ${amount}.` : `${name} doplatí ${amount}.`;
}
```

## --approach-- Koruny a haléře zvlášť, bez desetinných čísel

Text se rozdělí na koruny a haléře a obojí se převede zvlášť jako celá čísla. Desetinné číslo nevznikne ani na chvíli, takže past `4.35 * 100` vůbec nehrozí. `formatKc` taky skládá text z celých korun a zbytku, bez `toFixed`. Delší, ale přesně takhle se s penězi zachází v systémech, kde nesmí chybět haléř.

### --file-- script.js

```js
function isDigits(text) {
  if (text === '') {
    return false;
  }
  for (const char of text) {
    if (!'0123456789'.includes(char)) {
      return false;
    }
  }
  return true;
}

function parseAmount(text) {
  const parts = text.trim().replaceAll(' ', '').replace('.', ',').split(',');
  const crowns = parts[0];
  const cents = parts.length === 2 ? parts[1] : '';
  if (parts.length > 2 || !isDigits(crowns) || (parts.length === 2 && !isDigits(cents)) || cents.length > 2) {
    return null;
  }
  return Number(crowns) * 100 + Number(cents.padEnd(2, '0'));
}

function shareOf(totalHalere, people, index) {
  const leftover = totalHalere % people;
  const base = (totalHalere - leftover) / people;
  return base + (index < leftover ? 1 : 0);
}

function tipHalere(totalHalere, percentText) {
  const percent = Number.parseFloat(percentText.replace(',', '.'));
  return percent >= 0 ? Math.round(totalHalere * percent / 100) : 0;
}

function roundToCrowns(halere) {
  const sign = Math.sign(halere);
  return sign * Math.round(Math.abs(halere) / 100) * 100;
}

function formatKc(halere) {
  const absolute = Math.abs(halere);
  const crowns = Math.trunc(absolute / 100);
  const cents = String(absolute % 100).padStart(2, '0');
  return `${halere < 0 ? '-' : ''}${crowns},${cents} Kč`;
}

function balanceText(name, balanceHalere) {
  if (balanceHalere > 0) {
    return `${name} dostane zpátky ${formatKc(balanceHalere)}.`;
  }
  if (balanceHalere < 0) {
    return `${name} doplatí ${formatKc(-balanceHalere)}.`;
  }
  return `${name} už nic nedluží.`;
}
```

# --review--

Testy kontrolují čísla a tvar částek. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Každá funkce pracuje s celými haléři a na koruny převádí až `formatKc`.
- Zaokrouhluje se na jednom místě v každém výpočtu, ne v mezivýsledcích.
- `balanceText` volá `formatKc`, místo aby částku formátovala znovu.
- Prázdný vstup a nesmysl jsou ošetřené na začátku funkce (guard clause), zbytek funkce řeší jen platnou částku.
- Víš, proč `parseFloat` na spropitné stačí, ale na částku by propustil `120 Kč na benzín`.

## --extensions--

Přidej funkci `settle(paidHalere, shareHalere)`, která vrátí zůstatek zaokrouhlený na koruny pro placení v hotovosti; vypiš do konzole přehled celé party ze svých ukázkových dat; až projdeš lekci Formátování a datum, přepiš `formatKc` na `Intl.NumberFormat` a porovnej, co se změnilo.
