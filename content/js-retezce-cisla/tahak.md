# Tahák: Řetězce, čísla, data a regulární výrazy

## Řetězce

### Přehled metod řetězců

| metoda | co dělá | příklad | výsledek |
|---|---|---|---|
| `slice(od, do)` | vyřízne část textu (záporné indexy počítají od konce) | `'kocour'.slice(2, 5)` | `'cou'` |
| `at(index)` | vrátí znak na indexu (podporuje záporný index) | `'kocour'.at(-1)` | `'r'` |
| `trim()` | odstraní bílé znaky na obou koncích textu | `'  ahoj  '.trim()` | `'ahoj'` |
| `includes(hledat, od)` | ověří výskyt podřetězce (vrací `true`/`false`) | `'JavaScript'.includes('Script')` | `true` |
| `startsWith(text)` / `endsWith(text)` | testuje začátek nebo konec řetězce | `'foto.png'.endsWith('.png')` | `true` |
| `padStart(delka, znak)` | doplní text zleva na požadovanou délku | `'5'.padStart(2, '0')` | `'05'` |
| `padEnd(delka, znak)` | doplní text zprava na požadovanou délku | `'5'.padEnd(3, '.')` | `'5..'` |
| `split(oddelovac)` | rozdělí řetězec na pole podle oddělovače | `'a,b,c'.split(',')` | `['a', 'b', 'c']` |
| `replace(co, cim)` | nahradí první výskyt textu nebo regulárního výrazu | `'kočka'.replace('k', 'v')` | `'vočka'` |
| `replaceAll(co, cim)` | nahradí všechny výskyty zadaného textu | `'1-2-3'.replaceAll('-', ':')` | `'1:2:3'` |
| `toLowerCase()` / `toUpperCase()` | převede text na malá nebo velká písmena | `'Čau'.toLowerCase()` | `'čau'` |

### Neměnnost a kódové jednotky

* **[[neměnnost řetězce|Neměnnost řetězce]]:** Řetězce v JavaScriptu jsou primitivní a neměnné. Žádná metoda nemění původní text, vždy vrací nový řetězec.
* **Zápis na index nefunguje:** `text[0] = 'X'` nic neudělá (ve striktním režimu skončí chybou).
* **[[kódová jednotka|Kódová jednotka]]:** Vlastnost `length` a indexy počítají 16bitové jednotky UTF-16, ne znaky. Běžná písmena mají délku 1, ale emoji zabírají 2 jednotky (`'🐱'.length === 2`).
* **[[grafém|Grafém]]:** Vizuální znak z pohledu člověka. Pro přesné dělení textu podle grafémů slouží `Intl.Segmenter`.

```js
// Řetězce se nemění — výsledek musíš přiřadit
let jmeno = '  jana nováková  ';
jmeno = jmeno.trim();

// Přepsání znaku se dělá složením nového textu
const puvodni = 'kočka';
const opraveno = 't' + puvodni.slice(1); // 'točka'
```

### Praktické vzory pro řetězce

```js
// Rozdělení a složení zpět (split + join)
const slug = 'Kurz JavaScriptu pro každého'
  .toLowerCase()
  .split(' ')
  .join('-'); // 'kurz-javascriptu-pro-každého'

// Maskování čísla platební karty (poslední 4 číslice)
const karta = '1234567890123456';
const maskovano = karta.slice(-4).padStart(karta.length, '*'); // '************3456'

// Zkrácení dlouhého textu se třemi tečkami
function zkratText(text, maxDelka) {
  if (text.length <= maxDelka) return text;
  return text.slice(0, maxDelka - 1).trimEnd() + '…';
}
```

## Čísla a matematika

### Plovoucí řádová čárka a počítání v haléřích

* Všechna běžná čísla jsou typu `Number` uložená ve standardu IEEE 754 na 64 bitech jako **[[plovoucí řádová čárka]]**.
* Desetinná čísla v binární soustavě nelze vyjádřit zcela přesně (`0.1 + 0.2 === 0.30000000000000004`).
* **Pravidlo pro peníze:** Přepočítej částky na celočíselné jednotky (haléře, centy) a na koruny/eura je převeď až při zobrazení uživateli.

```js
// Chyba při přímém sčítání desetinných čísel
console.log(0.1 + 0.2 === 0.3); // false

// Správný postup: počítání v haléřích
const cenaPolozky1 = 1990; // 19,90 Kč
const cenaPolozky2 = 550;  // 5,50 Kč
const celkemHaliru = cenaPolozky1 + cenaPolozky2; // 2540
const celkemKc = celkemHaliru / 100;              // 25.4
```

### Převod textu na číslo a ověření

Pro kontrolu neplatného čísla [[NaN]] používej výhradně `Number.isNaN()`:

```js
// Number(vstup) — striktní převod celého řetězce
Number('42');       // 42
Number('42px');     // NaN (jakýkoli nečíselný znak vrátí NaN)
Number('');         // 0 (prázdný text je zrádně 0!)

// parseInt(text, soustava) — čte celá čísla zleva, vždy uváděj desítkovou soustavu 10
parseInt('42px', 10);   // 42
parseInt('015', 10);    // 15

// parseFloat(text) — čte desetinná čísla zleva (desetinná tečka, ne čárka!)
parseFloat('3.14m');    // 3.14
parseFloat('3,14');     // 3 (čárka zastaví parsování!)

// Kontrola platnosti čísla: [[NaN]]
Number.isNaN(NaN);          // true
Number.isNaN('ahoj');       // false (nepřevádí typ — bezpečné!)
isNaN('ahoj');              // true (zastaralé: globální funkce nejprve převede na číslo)
```

### Zaokrouhlování a objekt Math

| funkce | popis | kladné číslo (`2.6`) | záporné číslo (`-2.6`) |
|---|---|---|---|
| `Math.round(x)` | zaokrouhlí k nejbližšímu celému číslu | `3` | `-3` |
| `Math.floor(x)` | zaokrouhlí vždy dolů (k menšímu číslu) | `2` | `-3` |
| `Math.ceil(x)` | zaokrouhlí vždy nahoru (k většímu číslu) | `3` | `-2` |
| `Math.trunc(x)` | prostě odřízne desetinnou část směrem k nule | `2` | `-2` |

```js
// Náhodné celé číslo mezi min a max (včetně obou)
function nahodneCele(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Omezení hodnoty do intervalu (clamp)
function omez(hodnota, min, max) {
  return Math.min(Math.max(hodnota, min), max);
}
```

### Velká celá čísla (BigInt)

* Primitivní typ **[[BigInt]]** slouží pro celá čísla přesahující bezpečný limit `Number.MAX_SAFE_INTEGER` ($2^{53}-1 = 9\,007\,199\,254\,740\,991$).
* Zapisuje se s příponou `n` na konci nebo funkcí `BigInt()`.
* Dělení u BigInt je vždy celočíselné. Nelze míchat `BigInt` a `Number` ve stejném výrazu bez explicitního převodu.

```js
const velkeCislo = 9007199254740991n + 2n; // 9007199254740993n
const podil = 7n / 2n; // 3n (žádná desetinná místa!)
```

## Internacionalizace a datum (Intl, Date, Temporal)

### Intl.NumberFormat: měny a čísla podle češtiny

```js
// Formátování české měny s mezerou mezi tisíci
const formatCeny = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
});
formatCeny.format(14500); // "14 500 Kč"

// Desetinné číslo s pevnou délkou
const formatCisla = new Intl.NumberFormat('cs-CZ', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
formatCisla.format(1234.5); // "1 234,50"
```

### Intl.DateTimeFormat a RelativeTimeFormat

```js
// Formátování data podle českých pravidel
const formatData = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium' });
formatData.format(new Date(2026, 8, 14)); // "14. 9. 2026"

// Relativní čas (před chvílí, za hodinu, včera)
const rtf = new Intl.RelativeTimeFormat('cs', { numeric: 'auto' });
rtf.format(-1, 'day');   // "včera"
rtf.format(2, 'week');   // "za 2 týdny"
rtf.format(-45, 'minute'); // "před 45 minutami"
```

### Intl.PluralRules: skloňování v češtině

```js
function formatPocetPolozek(pocet) {
  const pr = new Intl.PluralRules('cs');
  const tvary = {
    one: 'položka',   // 1
    few: 'položky',   // 2, 3, 4
    other: 'položek', // 0, 5 a více
  };
  return `${pocet} ${tvary[pr.select(pocet)]}`;
}
formatPocetPolozek(1); // "1 položka"
formatPocetPolozek(3); // "3 položky"
formatPocetPolozek(5); // "5 položek"
```

### Pasti Date a moderní Temporal

* **Pasti starého `Date`:** Měsíce jsou indexované od 0 (leden je 0, prosinec 11). Metody mutují instanci na místě (`date.setDate(...)`). Míchá lokální čas s časovou zónou prohlížeče.
* **Řešení: [[Temporal]]:** Moderní standard s neměnnými objekty a lidským číslováním měsíců (1–12).

```js
// Starý Date: pozor na měsíce od 0 a mutaci
const datum = new Date(2026, 1, 15); // 15. únor 2026, ne leden!
datum.setDate(datum.getDate() + 7);   // zmutuje původní proměnnou datum

// Moderní Temporal (neměnné objekty, měsíce 1–12)
const dnes = Temporal.Now.plainDateISO(); // např. 2026-09-14
const pristiTyzden = dnes.add({ days: 7 }); // vrátí novou instanci
console.log(pristiTyzden.toString());      // "2026-09-21"
```

## Regulární výrazy (RegExp)

### Třídy znaků a příznaky

* **[[RegExp]]:** Vzor pro vyhledávání textu zapsaný buď `/vzor/příznaky`, nebo `new RegExp('vzor', 'příznaky')`.

| zápis | význam |
|---|---|
| `\d` / `\D` | číslice `[0-9]` / cokoliv kromě číslic |
| `\w` / `\W` | písmeno, číslice, podtržítko `[a-zA-Z0-9_]` / ne-slovní znak |
| `\s` / `\S` | bílý znak (mezera, tabulátor, nový řádek) / nebílý znak |
| `.` | libovolný znak kromě konce řádku (s příznakem `s` včetně konce řádku) |
| `[abc]` | jeden ze zadaných znaků |
| `[^abc]` | libovolný znak kromě zadaných |
| `[a-z0-9]` | rozsah znaků |

**Příznaky (flags):**
* `g` (global) — najde všechny výskyty v celém textu, ne jen první.
* `i` (ignoreCase) — nerozlišuje velká a malá písmena.
* `m` (multiline) — kotvy `^` a `$` pracují se začátkem a koncem každého řádku.
* `u` / `v` (unicode) — správná práce s UTF-16 a Unicode kódovými body.

### [[Kvantifikátor|Kvantifikátory]] a hladovost

| kvantifikátor | počet opakování | chování |
|---|---|---|
| `*` | 0 nebo vícekrát | hladový (greedy) — zabere co nejvíc |
| `+` | 1 nebo vícekrát | hladový |
| `?` | 0 nebo 1krát (nepovinné) | hladový |
| `{n}` | přesně n-krát | pevný počet |
| `{min,max}` | od min do max krát | hladový |
| `*?` / `+?` | 0+ / 1+ | **líný (lazy)** — zastaví se u nejbližší shody |

```js
const html = '<b>tučné</b> a <b>druhé</b>';
html.match(/<b>.*<\/b>/)[0];  // "<b>tučné</b> a <b>druhé</b>" (hladový spolkne vše)
html.match(/<b>.*?<\/b>/)[0]; // "<b>tučné</b>" (líný se zastaví na prvním </b>)
```

### [[Kotva|Kotvy]] a skupiny

* `^` — začátek řetězce (nebo řádku s flagem `m`).
* `$` — konec řetězce (nebo řádku s flagem `m`).
* `\b` — hranice celého slova (`/\bpes\b/` najde „pes", ale ne „dospělý").
* `(vzor)` — zachytávající skupina (obsah je dostupný v `match[1]`).
* `(?:vzor)` — nezachytávající skupina (pouze pro seskupení, neukládá se).

### Metody pro práci s RegExp

```js
// 1. regex.test(text) — rychlé ověření platnosti formátu (vrací boolean)
const emailRe = /^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i;
emailRe.test('jan@novak.cz'); // true

// 2. text.match(regex) — nalezení shody a zachycených skupin
const telRe = /(\+420)?\s?(\d{3})\s?(\d{3})\s?(\d{3})/;
const shoda = '+420 777 888 999'.match(telRe);
console.log(shoda[2]); // '777'

// 3. text.matchAll(regexWithG) — iterace přes všechny výskyty
const text = '10 kg jablek a 25 kg hrušek';
for (const m of text.matchAll(/(\d+)\s*kg/g)) {
  console.log(`Číslo: ${m[1]}`); // '10', pak '25'
}

// 4. text.replace(regex, nahradit) — nahrazení se skupinami
const jmeno = 'Jan Novák';
const prohozeno = jmeno.replace(/^(\w+)\s+(\w+)$/, '$2, $1'); // "Novák, Jan"
```

## Typické pasti

| zápis | co se stane | správné řešení |
|---|---|---|
| `text[0] = 'a'` | V tichosti nic neudělá; řetězec je neměnný | Sestav nový řetězec: `'a' + text.slice(1)` |
| `0.1 + 0.2 === 0.3` | `false` kvůli zaokrouhlení plovoucí čárky | Počítej v celých číslech (haléře): `(10 + 20) === 30` |
| `parseInt('08')` | U starších verzí mohl interpretovat jako osmičkovou | Vždy uváděj radix: `parseInt('08', 10)` |
| `isNaN('slovo')` | `true`, protože `'slovo'` převede na `NaN` | Pro přesnou kontrolu použij `Number.isNaN(vstup)` |
| `new Date(2026, 1, 1)` | Vytvoří 1. únor, nikoli leden | Pamatuj, že měsíce jsou 0–11, nebo přejdi na `Temporal` |
| `/vzor/g.test(text)` | Střídá `true`/`false`, protože si pamatuje `lastIndex` | Pro pouhý test nepoužívej globální flag `g` |
| `/<.*>/` na HTML značky | Hladový `.*` spolkne celý text až k poslední `>` | Použij líný kvantifikátor `/<.*?>/` |
| `'slovo'.split('')` na emoji | Rozbije emoji na dvě neplatné kódové jednotky | Použij `[...'👋🏻']` nebo `Intl.Segmenter` |
