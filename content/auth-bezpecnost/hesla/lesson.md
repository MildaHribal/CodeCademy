# Hesla

:::check pretest
Útočník ukradne tabulku uživatelů. U účtu `eva@klub.cz` je ve sloupci hesla uložený hash `sha256("Brno2026")`. Co myslíš, dokáže z toho heslo zjistit?

### --answer--
Ne, hash je jednosměrný, zpátky ho převést nejde.

#### --why--
Zpátky ho převést opravdu nejde, ale útočník to ani nepotřebuje. Proč mu stačí hádat, uvidíš za chvíli.

### --correct--
Ano, stačí mu zkoušet hesla, počítat jejich hash a porovnávat.

#### --why--
Přesně tak. Rychlý hash útočníkovi dovolí zkusit miliardy hesel za sekundu. V lekci uvidíš, co s tím udělá sůl a pomalý hash.
:::

Registraci a přihlášení má skoro každá aplikace: e-shop, rezervace tréninků, interní
nástroj firmy. A skoro každá databáze jednou unikne: špatně nastavená záloha, SQL
injection, ukradený notebook vývojáře. Otázka není, jestli se k tabulce `users`
někdo dostane, ale **co v ní najde**. Lidé používají stejné heslo na víc místech, takže
heslo z tvého klubového webu otevře i jejich e-mail.

> [!REMEMBER]
> **Heslo se nikdy neukládá, ani zašifrované. Ukládá se pomalý hash se solí a při přihlášení se hash spočítá znovu a porovná.**

## Proč ne text ani šifrování

Tři způsoby, jak heslo uložit, od nejhoršího:

| co je ve sloupci | co útočník potřebuje | výsledek úniku |
|---|---|---|
| heslo jako text | nic | všechna hesla hned |
| zašifrované heslo | klíč, který leží na stejném serveru | všechna hesla, jakmile najde klíč |
| hash hesla | hádat a porovnávat | jen hesla, která uhodne |

Šifrování je **obousměrné**: kdo má klíč, dostane původní text zpátky. Aplikace ten
klíč musí mít po ruce, aby mohla heslo dešifrovat, takže útočník, který se dostal
k databázi, se většinou dostane i ke klíči.

Aplikace ale heslo vůbec zpátky nepotřebuje. Stačí jí ověřit, že uživatel zadal
**totéž** heslo jako při registraci. Na to je [[hash hesla|hash]] (*hash*):
jednosměrná funkce, která z libovolného textu udělá otisk pevné délky. Ze stejného
vstupu vyjde vždy stejný otisk, zpátky převést nejde.

> [!NOTE]
> Proto ti slušná služba nikdy nepošle „zapomenuté heslo" e-mailem. Když to umí,
> heslo má uložené tak, že ho dokáže přečíst — a to je past, na kterou se dá upozornit.

:::check
Proč šifrování hesel nestačí, i když je šifra silná?

### --answer--
Šifra se dá vždycky prolomit hrubou silou.

#### --why--
Myslíš si, že problém je v síle šifry? Moderní šifru hrubou silou neprolomíš. Slabé místo je jinde.

### --correct--
Aplikace musí mít klíč u sebe, takže kdo ukradne databázi i server, dostane hesla zpátky.

#### --why--
Šifrování je obousměrné z principu. Hash aplikaci stačí, protože heslo nikdy nepotřebuje číst, jen porovnat.

### --answer--
Zašifrované heslo je delší a nevejde se do sloupce.

#### --why--
Myslíš si, že jde o místo v databázi? Délka nehraje roli, sloupec se dá zvětšit. Jde o to, kdo může hesla přečíst.
:::

## Hash: jednosměrný otisk

Hash funkcí je víc a liší se hlavně rychlostí. `SHA-256` je rychlá: počítá otisky
souborů, commitů v Gitu a certifikátů, kde je rychlost výhoda. Zkus předpovědět, co
vypíše tenhle kód (otisk je zkrácený na 16 znaků):

:::live node predict
```js
import { createHash } from 'node:crypto';

const sha256 = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16);

console.log(sha256('Brno2026'));
console.log(sha256('Brno2026'));
console.log(sha256('brno2026'));
```
--question-- Kolik **různých** otisků vypíšou tři řádky?
--option-- Tři — každé volání hash trochu promíchá.
--option*-- Dva — stejné heslo dá stejný otisk, jiné písmeno úplně jiný.
--option-- Dva, ale třetí se od prvních liší jen v jednom znaku.
--output--
```text
00f8d3f15b013e5d
00f8d3f15b013e5d
6727406553bedec2
```
--why-- Hash je deterministický: stejný vstup, stejný výstup. Změna jednoho písmene změní celý otisk, takže z podobnosti otisků nic nepoznáš. Jenže determinismus je pro hesla problém: dva uživatelé se stejným heslem mají v databázi stejný hash a útočník si může otisky běžných hesel spočítat předem.
:::

Z toho plynou dva útoky na rychlý hash bez dalších opatření:

- **Předpočítané tabulky** (*rainbow tables*): útočník si jednou spočítá otisky
  miliard běžných hesel a pak jen hledá shodu. Heslo najde během vteřiny.
- **Hádání hrubou silou**: grafická karta spočítá miliardy SHA-256 za sekundu.
  Všechna hesla do osmi malých písmen vyzkouší za minuty.

Zkus v ukázce změnit heslo na `Brno2026!` a sleduj, že se otisk změní celý, ne jen na konci.

:::check
Dva členové klubu mají stejné heslo `Brno2026` a server ukládá čisté `sha256(heslo)`. Co z toho pozná útočník, který ukradne tabulku?

### --answer--
Nic, hashe se při každém uložení liší.

#### --why--
Myslíš si, že hash obsahuje náhodu? Čistý hash je deterministický, stejné heslo dá vždy stejný otisk.

### --correct--
Že mají stejné heslo, protože mají v tabulce stejný hash.

#### --why--
Stejný vstup dá stejný otisk. Útočník tak vidí skupiny lidí se stejným heslem a stačí mu uhodnout jedno.
:::

## Sůl: stejná hesla, různé hashe

[[Sůl]] (*salt*) je náhodný řetězec, který server vygeneruje **pro každého uživatele
zvlášť** a přidá ho do výpočtu hashe. Uloží se vedle hashe v čitelné podobě — není
tajná, jen jedinečná.

```js
import { randomBytes } from 'node:crypto';

const salt = randomBytes(16); // 16 náhodných bajtů pro jednoho uživatele
```

Co sůl vyřeší:

- dva lidé se stejným heslem mají **různé** hashe,
- předpočítané tabulky nefungují, protože by musely obsahovat každé heslo s každou
  možnou solí,
- útočník musí hádat **každý účet zvlášť**.

Co sůl nevyřeší: jeden konkrétní účet pořád jde hádat tak rychle, jak rychlý je hash.
Na to je další krok.

> [!PITFALL]
> Jedna sůl pro všechny uživatele (konstanta v kódu) je skoro totéž co žádná sůl:
> stejná hesla mají zase stejný hash a útočník si tabulku spočítá jednou pro tvou
> konstantu. Sůl se generuje **při každém uložení hesla** přes `randomBytes`, ne
> `Math.random()`, které není kryptograficky bezpečné.

:::check
Musí být sůl tajná?

### --answer--
Ano, jinak útočník hash spočítá.

#### --why--
Myslíš si, že sůl funguje jako klíč? Útočník, který má tabulku, má i sůl, a to nevadí.

### --correct--
Ne, ukládá se vedle hashe. Musí být jen náhodná a pro každé heslo jiná.

#### --why--
Sůl nebrání hádání jednoho účtu, brání hádání všech najednou a předpočítaným tabulkám. K tomu stačí, že je jedinečná.
:::

## Pomalý hash: scrypt a Argon2

Hesla se hashují funkcemi, které jsou **schválně pomalé a náročné na paměť**. Server
zpracuje jedno přihlášení za desítky milisekund a nikdo to nepozná. Útočník, který
chce zkusit miliardu hesel, najednou potřebuje roky místo minut. Náročnost na paměť
navíc brzdí grafické karty, které mají hodně jader, ale málo paměti na jádro.

| funkce | kde ji vezmeš | poznámka |
|---|---|---|
| Argon2id | balíček `argon2` | první volba podle OWASP |
| scrypt | vestavěné `node:crypto` | dobrá volba bez závislostí |
| bcrypt | balíček `bcrypt` | starší, heslo delší než 72 bajtů ořízne |
| SHA-256, MD5 | vestavěné | **na hesla ne**, jsou rychlé |

V Node máš scrypt bez instalace. Výsledek se ukládá jako jeden řetězec, ve kterém je
název algoritmu, sůl i hash:

```js
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const salt = randomBytes(16);
const hash = await scryptAsync('Brno2026', salt, 64);
const stored = `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
// do sloupce password_hash: scrypt$<sůl>$<hash>
```

Název algoritmu na začátku není okrasa. Až za dva roky přejdeš na Argon2, podle prefixu
poznáš, kterou funkcí staré heslo ověřit, a při dalším přihlášení ho přehashuješ.

> [!PITFALL]
> `scryptSync` v handleru serveru blokuje celý proces na desítky milisekund. Když se
> přihlašuje sto lidí najednou, čekají všichni včetně těch, kdo si jen načítají
> stránku. V serveru používej asynchronní `scrypt` (přes `promisify`), který počítá
> mimo hlavní vlákno.

:::check
Grafická karta spočítá miliardu SHA-256 za sekundu. Se scryptem s rozumným nastavením zvládne řekněme tisíc hesel za sekundu. Kolikrát déle bude útočníkovi trvat vyzkoušet stejný seznam hesel? Napiš číslo.

### --expected--
1000000

### --accept--
1 000 000
milionkrát
milion

### --why--
Miliarda děleno tisícem je milion. Co SHA-256 zvládne za sekundu, trvá se scryptem
přes jedenáct dní. Server přitom ověřuje jedno heslo při přihlášení, takže jemu
zpomalení nevadí.
:::

## Porovnání hesla: `timingSafeEqual`

Při přihlášení server vezme sůl z uloženého řetězce, spočítá hash zadaného hesla se
stejnou solí a stejnou délkou a výsledek porovná s uloženým hashem.

Porovnání přes `===` skončí u prvního rozdílného znaku. Když se liší první bajt, vrátí
`false` o chlup dřív, než když se liší poslední. Z tisíců měření jde ten rozdíl
změřit a postupně uhodnout, jak hash začíná. Proto se tajné hodnoty porovnávají funkcí
v [[konstantní čas|konstantním čase]], která projde vždy všechny bajty:
`timingSafeEqual(a, b)` z `node:crypto`. Bere dva `Buffer` stejné délky.

Zkus předpovědět, co udělá tenhle kód:

:::live node predict
```js
import { timingSafeEqual } from 'node:crypto';

const stored = Buffer.from('9f86d081884c7d65', 'hex');
const sent = Buffer.from('9f86d081', 'hex');

console.log('porovnávám');
console.log(timingSafeEqual(stored, sent));
```
--question-- Co se vypíše po řádku `porovnávám`?
--option-- `false`, protože se buffery liší.
--option-- `true`, protože se shodují první čtyři bajty.
--option*-- Program spadne na `RangeError`.
--output--
```text
porovnávám
file:///home/eva/klub/compare.js:7
console.log(timingSafeEqual(stored, sent));
            ^

RangeError: Input buffers must have the same byte length
    at file:///home/eva/klub/compare.js:7:13 {
  code: 'ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH'
}

Node.js v26.5.1
```
--why-- `timingSafeEqual` porovnává jen buffery stejné délky, jinak vyhodí výjimku. Když hash při ověření počítáš s délkou uloženého hashe (`expected.length`), délky sedí vždy. Kdyby ne, neošetřená výjimka v handleru přihlášení shodí server.
:::

:::check
Proč se hash hesla neporovnává přes `===`?

### --answer--
`===` neumí porovnat dva `Buffer`.

#### --why--
Myslíš si, že jde o typ? Hashe můžeš porovnat i jako hex řetězce. Problém je v tom, jak dlouho porovnání trvá.

### --correct--
`===` skončí u prvního rozdílu, takže z doby odpovědi jde odhadnout, kolik znaků sedí.

#### --why--
`timingSafeEqual` projde vždy všechny bajty, a doba porovnání tak nic neprozradí.

### --answer--
`===` porovnává odkazy, ne obsah.

#### --why--
Myslíš si, že se porovnávají objekty? U řetězců `===` porovnává obsah. Past je v čase, ne ve výsledku.
:::

## Pravidla pro hesla podle NIST

Americký standardizační úřad NIST vydává doporučení, která převzala většina bezpečnostních
týmů (SP 800-63B). Hodně z nich jde proti tomu, co znáš z formulářů:

| dřív | podle NIST dnes | proč |
|---|---|---|
| aspoň jedno velké písmeno, číslice a znak | žádná pravidla skladby | lidé z `brno` udělají `Brno1!` a útočník to ví |
| heslo nejvýš 16 znaků | aspoň 8, pusť aspoň 64 | dlouhá fráze `ráno běhám kolem přehrady` je silnější |
| změna hesla každé 3 měsíce | měnit jen při podezření na únik | vynucená změna vede k `Brno2026` → `Brno2027` |
| zákaz mezer a diakritiky | povol všechny znaky včetně mezer | hash zpracuje cokoli |
| — | odmítni hesla ze seznamů úniků | `12345678` projde délkou, ale uhodne se hned |
| nápověda k heslu | žádné nápovědy ani bezpečnostní otázky | jméno psa najde útočník na Instagramu |

Horní hranici délky přesto nastav (třeba 128 znaků): pomalý hash z megabajtového
„hesla" by server zbytečně vytížil.

> [!TIP]
> Nejsilnější pomoc uživateli je nechat správce hesel pracovat: neblokuj vkládání
> do pole hesla a dej poli `autocomplete="new-password"` nebo `current-password`.

:::check
Uživatel se registruje heslem `ráno běhám kolem přehrady` (bez číslic a velkých písmen). Má ho server podle NIST odmítnout?

### --answer--
Ano, chybí číslice a velké písmeno.

#### --why--
Myslíš si, že skladba hesla dělá sílu? Pravidla skladby vedou k předvídatelným úpravám jako `Brno1!`. Rozhoduje délka a to, jestli heslo není v seznamech úniků.

### --answer--
Ano, mezery a diakritika v hesle nejsou povolené.

#### --why--
Myslíš si, že hash neumí diakritiku? Hash pracuje s bajty, takže zvládne jakýkoli znak. Zákaz jen oslabuje hesla.

### --correct--
Ne, je dlouhé a není mezi běžnými hesly.

#### --why--
Dlouhá fráze je silná a dobře se pamatuje. Server kontroluje délku a seznam úniků, ne druhy znaků.
:::

:::explain
Vysvětli vlastními slovy, proč se heslo hashuje **pomalu** — vždyť pomalost je jinak
u programů problém.

## --model--
U hesla je pomalost obrana. Útočník, který získá databázi, zkouší hesla hrubou silou:
vezme seznam nejčastějších hesel, spočítá jejich hash a porovná. Rychlá funkce mu dovolí
zkusit miliardy pokusů za vteřinu. Když jeden výpočet trvá desetinu vteřiny, stejný
útok se protáhne o mnoho řádů a přestane se vyplácet. Pro přihlášení je to přitom
neznatelné — legitimní uživatel spočítá jeden hash, útočník miliony. Sůl k tomu přidá
druhou věc: každé heslo má vlastní, takže předpočítané tabulky nefungují a každý účet
se musí lámat zvlášť.

## --checklist--
- Pomalý hash prodraží útok hrubou silou.
- Legitimní přihlášení počítá jen jeden hash.
- Sůl znemožní předpočítané tabulky.
- Se solí se každý účet musí lámat samostatně.
:::

## Typické chyby a pasti

> [!PITFALL] Heslo v logu
> `console.log('login', req.body)` zapíše heslo do logu v čitelné podobě, a logy
> čte víc lidí a služeb než databázi. **Oprava:** nikdy nelogovat tělo přihlášení
> ani registrace, jen e-mail a výsledek.

> [!PITFALL] `RangeError: Input buffers must have the same byte length`
> `timingSafeEqual` dostal buffery různé délky, třeba když hash při ověření počítáš
> s jinou délkou, než jakou má uložený. **Oprava:** délku výpočtu ber z uloženého hashe.

> [!PITFALL] Sůl z `Math.random()`
> `Math.random().toString(36)` není kryptograficky bezpečná náhoda a dá se předvídat.
> **Oprava:** `randomBytes(16)` z `node:crypto`.

> [!PITFALL] MD5 nebo SHA-256 „s pepřem a několika koly"
> Vlastní skládání rychlých hashů působí bezpečně, ale pořád je o řády rychlejší než
> scrypt nebo Argon2. **Oprava:** hotová funkce určená pro hesla, žádné vlastní
> kombinace.

> [!PITFALL] Odpověď na přihlášení vrací i uložený hash
> `sendJson(res, 200, user)` pošle klientovi celý řádek z databáze včetně sloupce
> `password_hash`. **Oprava:** posílej jen veřejná pole (`id`, `email`, `name`).

:::check
V kódu registrace je `const salt = 'klub-na-stezce-2026';` a ta se použije pro každé nové heslo. Co to způsobí?

### --answer--
Nic, sůl nemusí být tajná, takže konstanta nevadí.

#### --why--
Tajná být nemusí, to je pravda. Myslíš si ale, že stačí, aby nějaká sůl existovala? Sůl má být pro každé heslo jiná.

### --correct--
Stejná hesla budou mít stejný hash a útočník si tabulku otisků spočítá jednou pro celou databázi.

#### --why--
Sůl funguje, jen když je náhodná a pro každé heslo jiná. Konstanta ztratí obě výhody.

### --answer--
Hash bude kratší, protože sůl je krátká.

#### --why--
Myslíš si, že délka soli mění délku hashe? Délku výsledku určuje funkce (tady 64 bajtů), ne vstup.
:::

## Kde to najdeš v MDN

- [Crypto: getRandomValues()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) —
  kryptograficky bezpečná náhoda v prohlížeči; v Node má stejnou roli `randomBytes`.
- [SubtleCrypto: deriveKey()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey) —
  odvození klíče z hesla se solí a počtem iterací (PBKDF2), stejný princip jako scrypt.
- [Math.random()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random) —
  v rámečku na stránce je výslovně napsáno, že se nehodí pro nic bezpečnostního.

> [!NOTE]
> Hashování hesel samotné MDN nepopisuje. Podrobný návod je v OWASP
> [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
> a funkce `scrypt` a `timingSafeEqual` v [dokumentaci Node](https://nodejs.org/api/crypto.html).

Příště z téhle funkce postavíš registraci a přihlášení: server si po přihlášení musí
zapamatovat, kdo jsi, a na to jsou session a cookies.

# --questions--

## --question--

V tabulce uživatelů je u jednoho účtu `scrypt$4f1c…$9a07…`. Co z toho řetězce potřebuje server při přihlášení, aby ověřil zadané heslo? Vyber vše, co potřebuje.

### --correct--
Název algoritmu `scrypt`.

#### --why--
Podle prefixu server pozná, jakou funkcí hash spočítat, i když časem přejde na jinou.

### --correct--
Sůl mezi prvním a druhým `$`.

#### --why--
Bez stejné soli by vyšel jiný hash i pro správné heslo.

### --correct--
Uložený hash za druhým `$`.

#### --why--
S ním server porovná nově spočítaný hash.

### --answer--
Tajný klíč, kterým se hash dešifruje.

#### --why--
Myslíš si, že hash jde převést zpátky? Hash je jednosměrný. Server heslo nikdy nedešifruje, jen spočítá hash znovu a porovná.

## --question--

Kolega navrhuje: „Hesla hashujeme přes SHA-256 se solí, je to rychlé." Kterou funkci vestavěnou v `node:crypto` mu navrhneš místo toho? Napiš jen její jméno.

### --expected--
scrypt

### --accept--
scrypt()
scryptAsync

### --why--
Sůl brání předpočítaným tabulkám, ale rychlost hádání jednoho účtu nemění. SHA-256 je
rychlá, scrypt je schválně pomalá a náročná na paměť. Argon2id by byl ještě lepší, ale
v `node:crypto` není, potřebuje balíček.

### --see--
auth-bezpecnost/hesla#pomaly-hash-scrypt-a-argon2

## --question--

Registrace odmítá hesla ze seznamu úniků takhle:

```js
const COMMON = ['12345678', 'heslo123', 'qwertzuiop'];
const isCommon = (password) => COMMON.includes(password);
```

Uživatel zadá heslo `Heslo123`. Vrátí `isCommon` pravdu? Odpověz `ano`, nebo `ne`.

### --expected-- ignore-case
ne

### --why--
`includes` porovnává přesně, včetně velikosti písmen, takže `Heslo123` v seznamu
nenajde a slabé heslo projde. Útočník přitom zkouší i varianty s velkým písmenem.
Porovnávej s `password.toLowerCase()` a seznam drž malými písmeny.

### --see--
auth-bezpecnost/hesla#pravidla-pro-hesla-podle-nist
