---
title: Kontrola a úprava vstupu
runtime: js
see: js-retezce-cisla/regularni-vyrazy#kotvy-a-cely-text-ne-kousek
---

# --description--

Brněnský půlmaraton spouští online přihlášky. Formulář už je hotový, chybí mu ale kontrola toho, co lidé napíšou: PSČ s mezerou i bez, rodné číslo pro pojištění závodníků, heslo do účtu, hashtagy k fotkám z trati a startovné, které zadávají pořadatelé ručně. Tvoje funkce rozhodnou, co formulář přijme, a vstup uvedou do jednotného tvaru.

Tentokrát bez návodu — o postupu rozhoduješ sám. Používej, co ses v sekci naučil: metody řetězců, převod na číslo, haléře a regulární výrazy. Pomocné funkce si klidně přidej. V `script.js` jsou prázdné kostry funkcí s popisem.

Co pořadatelé od formuláře chtějí:

- Závodník napíše PSČ jako `602 00` i `60200`, formulář ho přijme a uloží vždycky s mezerou.
- Rodné číslo jde napsat s lomítkem i bez. Formulář odmítne číslo, které nemá správný tvar, a u desetimístného čísla i takové, které neprojde kontrolou dělitelnosti 11.
- Při volbě hesla závodník hned vidí, co je s heslem špatně, nebo nic, když je v pořádku.
- Z popisu fotky se vytáhnou hashtagy v jednotném tvaru a bez opakování.
- Pořadatel zadá startovné v kterémkoli běžném českém zápisu a uloží se v haléřích.

Přesné požadavky jsou v seznamu kontrol. Každá funkce před kontrolou ořízne mezery na krajích vstupu.

> [!NOTE]
> Kontrola rodného čísla je zjednodušená: neověřuje datum narození ani výjimky u čísel z let 1954–1985. Pravidla pro heslo vycházejí ze současných doporučení (třeba amerického úřadu NIST), která upřednostňují délku a zákaz zjevných hesel před povinnými speciálními znaky.

# --hints--

`isValidZip(text)` vrátí `true` pro pět číslic nebo tři číslice, jednu mezeru a dvě číslice; mezery na krajích nevadí.

```js
assert.equal(isValidZip('60200'), true, "isValidZip('60200') má vrátit true");
assert.equal(isValidZip('602 00'), true, "isValidZip('602 00') má vrátit true");
assert.equal(isValidZip('  110 00 '), true, "isValidZip('  110 00 ') má vrátit true — mezery na krajích se ořízne");
```

`isValidZip(text)` vrátí `false` pro jiný počet číslic, mezeru na špatném místě, víc mezer nebo jiné znaky.

```js
assert.equal(isValidZip('6020'), false, "isValidZip('6020') má vrátit false — čtyři číslice");
assert.equal(isValidZip('602000'), false, "isValidZip('602000') má vrátit false — šest číslic");
assert.equal(isValidZip('60 200'), false, "isValidZip('60 200') má vrátit false — mezera za druhou číslicí");
assert.equal(isValidZip('602  00'), false, "isValidZip('602  00') má vrátit false — dvě mezery");
assert.equal(isValidZip('602-00'), false, "isValidZip('602-00') má vrátit false — pomlčka");
assert.equal(isValidZip('PSČ 60200'), false, "isValidZip('PSČ 60200') má vrátit false — text navíc");
assert.equal(isValidZip(''), false, "isValidZip('') má vrátit false");
```

`formatZip(text)` vrátí platné PSČ ve tvaru `602 00`, neplatné vrátí `null`.

```js
assert.equal(formatZip('60200'), '602 00', "formatZip('60200') má vrátit '602 00'");
assert.equal(formatZip(' 110 00 '), '110 00', "formatZip(' 110 00 ') má vrátit '110 00'");
assert.equal(formatZip('6020'), null, "formatZip('6020') má vrátit null");
```

`isValidBirthNumber(text)` přijme šest číslic, nepovinné lomítko a tři nebo čtyři číslice.

```js
assert.equal(isValidBirthNumber('900101/1008'), true, "isValidBirthNumber('900101/1008') má vrátit true");
assert.equal(isValidBirthNumber('9055121009'), true, "isValidBirthNumber('9055121009') má vrátit true — bez lomítka");
assert.equal(isValidBirthNumber('530101/123'), true, "isValidBirthNumber('530101/123') má vrátit true — devítimístné číslo z doby před rokem 1954");
assert.equal(isValidBirthNumber(' 045203/1008 '), true, "isValidBirthNumber(' 045203/1008 ') má vrátit true — nula na začátku i mezery na krajích");
```

`isValidBirthNumber(text)` odmítne jiný tvar.

```js
assert.equal(isValidBirthNumber('900101-1008'), false, "isValidBirthNumber('900101-1008') má vrátit false — pomlčka místo lomítka");
assert.equal(isValidBirthNumber('90010/11008'), false, "isValidBirthNumber('90010/11008') má vrátit false — lomítko na špatném místě");
assert.equal(isValidBirthNumber('900101/10089'), false, "isValidBirthNumber('900101/10089') má vrátit false — za lomítkem pět číslic");
assert.equal(isValidBirthNumber('90o101/1008'), false, "isValidBirthNumber('90o101/1008') má vrátit false — písmeno o místo nuly");
assert.equal(isValidBirthNumber(''), false, "isValidBirthNumber('') má vrátit false");
```

Desetimístné rodné číslo (bez lomítka) musí být dělitelné 11, jinak `isValidBirthNumber` vrátí `false`.

```js
assert.equal(isValidBirthNumber('900101/1009'), false, "isValidBirthNumber('900101/1009') má vrátit false — 9001011009 není dělitelné 11");
assert.equal(isValidBirthNumber('785120/1006'), true, "isValidBirthNumber('785120/1006') má vrátit true — 7851201006 je dělitelné 11");
assert.equal(isValidBirthNumber('7851201007'), false, "isValidBirthNumber('7851201007') má vrátit false");
```

`passwordProblem(password, email)` vrátí `'Zadej heslo.'` pro prázdné heslo a `'Heslo musí mít aspoň 12 znaků.'` pro kratší heslo.

```js
assert.equal(passwordProblem('', 'jana@seznam.cz'), 'Zadej heslo.', "passwordProblem('', …) má vrátit 'Zadej heslo.'");
assert.equal(passwordProblem('   ', 'jana@seznam.cz'), 'Zadej heslo.', "passwordProblem('   ', …) má vrátit 'Zadej heslo.' — heslo jen z mezer je prázdné");
assert.equal(passwordProblem('bezimkolem1', 'jana@seznam.cz'), 'Heslo musí mít aspoň 12 znaků.', "passwordProblem('bezimkolem1', …) má vrátit 'Heslo musí mít aspoň 12 znaků.' — má 11 znaků");
```

Heslo, které obsahuje část e-mailu před zavináčem (bez ohledu na velikost písmen), dostane `'Heslo nesmí obsahovat tvůj e-mail.'`.

```js
assert.equal(passwordProblem('Jana.Novakova2026', 'jana.novakova@seznam.cz'), 'Heslo nesmí obsahovat tvůj e-mail.', "passwordProblem('Jana.Novakova2026', 'jana.novakova@seznam.cz') má vrátit 'Heslo nesmí obsahovat tvůj e-mail.'");
assert.equal(passwordProblem('behamjana.novakova', 'jana.novakova@seznam.cz'), 'Heslo nesmí obsahovat tvůj e-mail.', "passwordProblem('behamjana.novakova', 'jana.novakova@seznam.cz') má vrátit 'Heslo nesmí obsahovat tvůj e-mail.'");
assert.equal(passwordProblem('Běžím s PETRKOLAR!', 'petrkolar@email.cz'), 'Heslo nesmí obsahovat tvůj e-mail.', "passwordProblem('Běžím s PETRKOLAR!', 'petrkolar@email.cz') má vrátit 'Heslo nesmí obsahovat tvůj e-mail.' — velikost písmen nerozhoduje");
```

Heslo jen z číslic dostane `'Heslo nesmí být jen z číslic.'`, dobré heslo prázdný text.

```js
assert.equal(passwordProblem('123456789012', 'jana@seznam.cz'), 'Heslo nesmí být jen z číslic.', "passwordProblem('123456789012', …) má vrátit 'Heslo nesmí být jen z číslic.'");
assert.equal(passwordProblem('ranní běh kolem přehrady', 'jana@seznam.cz'), '', "passwordProblem('ranní běh kolem přehrady', …) má vrátit '' — heslo je v pořádku");
assert.equal(passwordProblem('Půlmaraton2026', 'jana@seznam.cz'), '', "passwordProblem('Půlmaraton2026', …) má vrátit '' — e-mail jana v hesle není");
```

`normalizeHashtags(text)` vrátí hashtagy z textu malými písmeny, oddělené mezerou, v pořadí výskytu; hashtag tvoří `#` a za ním písmena (i česká), číslice nebo `_`.

```js
assert.equal(normalizeHashtags('Cíl! #Pulmaraton2026 a #BRNO'), '#pulmaraton2026 #brno', "normalizeHashtags('Cíl! #Pulmaraton2026 a #BRNO') má vrátit '#pulmaraton2026 #brno'");
assert.equal(normalizeHashtags('Na trati #běh_s_přáteli, super.'), '#běh_s_přáteli', "normalizeHashtags('Na trati #běh_s_přáteli, super.') má vrátit '#běh_s_přáteli' — čárka za hashtagem už k němu nepatří");
assert.equal(normalizeHashtags('Bez hashtagů'), '', "normalizeHashtags('Bez hashtagů') má vrátit ''");
```

`normalizeHashtags(text)` každý hashtag vrátí jen jednou a samotné `#` hashtag není.

```js
assert.equal(normalizeHashtags('#Brno #brno #cíl #BRNO'), '#brno #cíl', "normalizeHashtags('#Brno #brno #cíl #BRNO') má vrátit '#brno #cíl' — opakování se vynechá");
assert.equal(normalizeHashtags('Skóre 3 # 2 a #brnobezi'), '#brnobezi', "normalizeHashtags('Skóre 3 # 2 a #brnobezi') má vrátit '#brnobezi'");
assert.equal(normalizeHashtags('#běhání #běh'), '#běhání #běh', "normalizeHashtags('#běhání #běh') má vrátit '#běhání #běh' — #běh je jiný hashtag než #běhání, i když je jeho začátkem");
```

`parsePrice(text)` vrátí startovné v celých haléřích z běžných zápisů: tisíce oddělené mezerou, desetinná čárka nebo tečka, `,-` a `Kč` na konci.

```js
assert.equal(parsePrice('650'), 65000, "parsePrice('650') má vrátit 65000");
assert.equal(parsePrice('1 299,90 Kč'), 129990, "parsePrice('1 299,90 Kč') má vrátit 129990");
assert.equal(parsePrice('49.9'), 4990, "parsePrice('49.9') má vrátit 4990");
assert.equal(parsePrice('990,- Kč'), 99000, "parsePrice('990,- Kč') má vrátit 99000");
assert.equal(parsePrice(' 4,35 '), 435, "parsePrice(' 4,35 ') má vrátit 435 — ne 434");
assert.equal(parsePrice('1 250 Kč'), 125000, "parsePrice('1 250 Kč') s nezalomitelnou mezerou z Intl má vrátit 125000");
```

`parsePrice(text)` vrátí `null` pro zápis, který cena není.

```js
assert.equal(parsePrice('zdarma'), null, "parsePrice('zdarma') má vrátit null");
assert.equal(parsePrice(''), null, "parsePrice('') má vrátit null");
assert.equal(parsePrice('-50'), null, "parsePrice('-50') má vrátit null — záporná cena");
assert.equal(parsePrice('12,345'), null, "parsePrice('12,345') má vrátit null — tři desetinná místa");
assert.equal(parsePrice('1,2,3'), null, "parsePrice('1,2,3') má vrátit null");
assert.equal(parsePrice('12 34'), null, "parsePrice('12 34') má vrátit null — za mezerou musí být tři číslice");
```

# --help--

## --tip-- 6

Tvar zkontroluj regulárním výrazem, dělitelnost obyčejným kódem: číslice bez lomítka převeď na číslo a použij operátor `%`. Viz [Kdy regulární výraz nepoužít](see:js-retezce-cisla/regularni-vyrazy#kdy-regularni-vyraz-nepouzit).

## --tip-- 12

Postup po krocích: celý zápis ověř jedním výrazem s kotvami, pak z textu odstraň mezery, `,-` a `Kč`, čárku nahraď tečkou a na haléře převeď jako ve workshopu Ceny v košíku.

# --seed--

## --file-- script.js

```js
/**
 * Je text platné PSČ? Pět číslic, nebo tři číslice, mezera a dvě číslice.
 * @param {string} text
 * @returns {boolean}
 */
function isValidZip(text) {
}

/**
 * Platné PSČ ve tvaru '602 00', jinak null.
 * @param {string} text
 * @returns {string | null}
 */
function formatZip(text) {
}

/**
 * Má rodné číslo správný tvar (a u deseti číslic dělitelnost 11)?
 * @param {string} text
 * @returns {boolean}
 */
function isValidBirthNumber(text) {
}

/**
 * Co je s heslem špatně? Prázdný text, když nic.
 * @param {string} password
 * @param {string} email
 * @returns {string}
 */
function passwordProblem(password, email) {
}

/**
 * Hashtagy z textu malými písmeny, bez opakování, oddělené mezerou.
 * @param {string} text
 * @returns {string}
 */
function normalizeHashtags(text) {
}

/**
 * Startovné z textu v celých haléřích, nebo null.
 * @param {string} text
 * @returns {number | null}
 */
function parsePrice(text) {
}

console.log(formatZip('60200'), isValidBirthNumber('900101/1008'), parsePrice('1 299,90 Kč'));
```

# --solution--

## --file-- script.js

```js
function isValidZip(text) {
  return /^\d{3} ?\d{2}$/.test(text.trim());
}

function formatZip(text) {
  if (!isValidZip(text)) {
    return null;
  }
  const digits = text.replaceAll(' ', '');
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

function isValidBirthNumber(text) {
  const match = text.trim().match(/^(\d{6})\/?(\d{3,4})$/);
  if (!match) {
    return false;
  }
  const digits = match[1] + match[2];
  if (digits.length === 9) {
    return true;
  }
  return Number(digits) % 11 === 0;
}

function passwordProblem(password, email) {
  const value = password.trim();
  if (value === '') {
    return 'Zadej heslo.';
  }
  if ([...value].length < 12) {
    return 'Heslo musí mít aspoň 12 znaků.';
  }
  const emailName = email.trim().toLowerCase().split('@')[0];
  if (emailName.length >= 3 && value.toLowerCase().includes(emailName)) {
    return 'Heslo nesmí obsahovat tvůj e-mail.';
  }
  if (/^\d+$/.test(value)) {
    return 'Heslo nesmí být jen z číslic.';
  }
  return '';
}

function normalizeHashtags(text) {
  let result = '';
  for (const match of text.matchAll(/#[\p{L}\p{N}_]+/gu)) {
    const tag = match[0].toLowerCase();
    if (!` ${result} `.includes(` ${tag} `)) {
      result = result === '' ? tag : `${result} ${tag}`;
    }
  }
  return result;
}

function parsePrice(text) {
  const value = text.trim();
  const pattern = /^(\d{1,3}(\s\d{3})+|\d+)([,.](\d{1,2}|-))?(\s*Kč)?$/u;
  if (!pattern.test(value)) {
    return null;
  }
  const number = value
    .replace(/\s*Kč$/u, '')
    .replace(/[,.]-$/, '')
    .replace(/\s/gu, '')
    .replace(',', '.');
  return Math.round(Number(number) * 100);
}

console.log(formatZip('60200'), isValidBirthNumber('900101/1008'), parsePrice('1 299,90 Kč'));
```

# --approaches--

## --approach-- Regulární výrazy pro tvar

Každý tvar popisuje jeden výraz s kotvami a zbytek (dělitelnost, převod na haléře) řeší obyčejný kód. Krátké a u PSČ i rodného čísla čitelné, když znáš značky; u ceny už výraz stojí za komentář.

### --file-- script.js

```js
function isValidZip(text) {
  return /^\d{3} ?\d{2}$/.test(text.trim());
}

function formatZip(text) {
  if (!isValidZip(text)) {
    return null;
  }
  const digits = text.replaceAll(' ', '');
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

function isValidBirthNumber(text) {
  const match = text.trim().match(/^(?<date>\d{6})\/?(?<suffix>\d{3,4})$/);
  if (!match) {
    return false;
  }
  const digits = match.groups.date + match.groups.suffix;
  return digits.length === 9 || Number(digits) % 11 === 0;
}

function passwordProblem(password, email) {
  const value = password.trim();
  const emailName = email.trim().toLowerCase().split('@')[0];
  if (value === '') return 'Zadej heslo.';
  if ([...value].length < 12) return 'Heslo musí mít aspoň 12 znaků.';
  if (emailName.length >= 3 && value.toLowerCase().includes(emailName)) return 'Heslo nesmí obsahovat tvůj e-mail.';
  if (/^\d+$/.test(value)) return 'Heslo nesmí být jen z číslic.';
  return '';
}

function normalizeHashtags(text) {
  let result = '';
  for (const match of text.matchAll(/#[\p{L}\p{N}_]+/gu)) {
    const tag = match[0].toLowerCase();
    if (!` ${result} `.includes(` ${tag} `)) {
      result = result === '' ? tag : `${result} ${tag}`;
    }
  }
  return result;
}

function parsePrice(text) {
  // celé koruny (případně s mezerami po tisících), desetiny nebo ,- a nepovinné Kč
  const match = text.trim().match(/^(?<whole>\d{1,3}(?:\s\d{3})+|\d+)(?:[,.](?:(?<fraction>\d{1,2})|-))?(?:\s*Kč)?$/u);
  if (!match) {
    return null;
  }
  const whole = Number(match.groups.whole.replace(/\s/gu, ''));
  const fraction = (match.groups.fraction ?? '0').padEnd(2, '0');
  return whole * 100 + Number(fraction);
}
```

## --approach-- Ruční kontrola znaků u PSČ

Bez regulárního výrazu: délka a pozice mezery se hlídají podmínkami, číslice cyklem. Delší, ale každý řádek přečte i ten, kdo regulární výrazy nezná, a u chyby přesně víš, na kterém znaku kontrola selhala. U ceny s mnoha variantami by ruční kontrola rychle zbobtnala.

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

function isValidZip(text) {
  const value = text.trim();
  if (value.length === 5) {
    return isDigits(value);
  }
  if (value.length === 6 && value[3] === ' ') {
    return isDigits(value.slice(0, 3)) && isDigits(value.slice(4));
  }
  return false;
}

function formatZip(text) {
  if (!isValidZip(text)) {
    return null;
  }
  const digits = text.replaceAll(' ', '');
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

function isValidBirthNumber(text) {
  const value = text.trim();
  const slash = value.indexOf('/');
  const digits = slash === 6 ? value.slice(0, 6) + value.slice(7) : value;
  if ((slash !== -1 && slash !== 6) || !isDigits(digits)) {
    return false;
  }
  if (digits.length === 9) {
    return true;
  }
  return digits.length === 10 && Number(digits) % 11 === 0;
}

function passwordProblem(password, email) {
  const value = password.trim();
  if (value === '') {
    return 'Zadej heslo.';
  }
  if ([...value].length < 12) {
    return 'Heslo musí mít aspoň 12 znaků.';
  }
  const at = email.indexOf('@');
  const emailName = email.slice(0, at === -1 ? email.length : at).trim().toLowerCase();
  if (emailName.length >= 3 && value.toLowerCase().includes(emailName)) {
    return 'Heslo nesmí obsahovat tvůj e-mail.';
  }
  if (isDigits(value)) {
    return 'Heslo nesmí být jen z číslic.';
  }
  return '';
}

function normalizeHashtags(text) {
  let result = '';
  for (const match of text.matchAll(/#[\p{L}\p{N}_]+/gu)) {
    const tag = match[0].toLowerCase();
    if (!` ${result} `.includes(` ${tag} `)) {
      result = result === '' ? tag : `${result} ${tag}`;
    }
  }
  return result;
}

function parsePrice(text) {
  const value = text.trim();
  if (!/^(\d{1,3}(\s\d{3})+|\d+)([,.](\d{1,2}|-))?(\s*Kč)?$/u.test(value)) {
    return null;
  }
  let number = value.replace(/\s*Kč$/u, '');
  if (number.endsWith(',-') || number.endsWith('.-')) {
    number = number.slice(0, -2);
  }
  return Math.round(Number(number.replace(/\s/gu, '').replace(',', '.')) * 100);
}
```

# --review--

Testy kontrolují, co funkce vracejí. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Každý regulární výraz, který kontroluje celý vstup, má kotvy `^` a `$`.
- Výraz kontroluje jen tvar; dělitelnost, převod na haléře a podobnou logiku řeší obyčejný kód.
- Složitější výraz (cena) má komentář nebo pojmenované skupiny, aby ho šlo přečíst za měsíc.
- Oříznutí mezer a převod na malá písmena jsou na jednom místě, ne rozkopírované do každé podmínky.
- Víš, u které funkce bys příště regulární výraz nepoužil a proč.

## --extensions--

Přidej `isValidIco(text)` pro osmimístné IČO s kontrolním součtem (váhy 8 až 2, modulo 11); u rodného čísla ověř i datum narození — měsíc zvětšený o 50 (a od roku 2004 i o 20 nebo 70) znamená ženu; z `parsePrice` udělej `formatPrice(halere)` přes `Intl.NumberFormat` a vyzkoušej, že `parsePrice(formatPrice(x))` vrátí zase `x`.
