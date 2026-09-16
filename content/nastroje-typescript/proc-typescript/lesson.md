# Proč TypeScript

:::check pretest
V souboru `ceny.ts` je řádek `const cena: number = '199';`. Co myslíš, co se stane, když soubor spustíš příkazem `node ceny.ts`?

### --answer--
Node skončí chybou, protože `'199'` není číslo.

#### --why--
Node typové anotace před spuštěním ignoruje, takže chybu nevyhodí.

### --correct--
Program normálně doběhne. Node anotaci `: number` jen zahodí.

#### --why--
TypeScript nemá žádný vliv na chování programu za běhu, typy se mažou.

### --answer--
Node text `'199'` sám převede na číslo `199`.

#### --why--
TypeScript ani Node žádné hodnoty za běhu automaticky nepřevádí.
:::

:::check pretest
Kolik řádků JavaScriptu vygeneruje TypeScript navíc, aby typy fungovaly i za běhu?

### --expected--
0
:::

Každý web, který jsi zatím postavil, má jedno slabé místo: kód se dozví o chybě
teprve tehdy, když ho někdo spustí. Funkce dostane `undefined` místo objektu,
formulář pošle text místo čísla a ty to zjistíš z prázdné stránky nebo z hlášky
v konzoli — v lepším případě u sebe, v horším od uživatele.

Tohle je modul, který v e-shopu počítá dopravu. Vypadá nevinně:

```js
// doprava.js
const zdarmaOd = 1500;

export function cenaDopravy(kosik) {
  if (kosik.celkem >= zdarmaOd) return 0;
  return kosik.hmotnost > 10 ? 149 : 79;
}
```

A takhle ho zavolá kolega z jiného souboru. Kód nespadne, testy projdou, na
stránce se objeví číslo. Jen je špatně:

:::live js predict
```js
const zdarmaOd = 1500;
function cenaDopravy(kosik) {
  if (kosik.celkem >= zdarmaOd) return 0;
  return kosik.hmotnost > 10 ? 149 : 79;
}

console.log(cenaDopravy({ total: 2400, hmotnost: 3 }));
```
--question-- Co vypíše `console.log`? Kolega napsal `total` místo `celkem`.
--expected-- 79
--why-- `kosik.celkem` je `undefined`, `undefined >= 1500` je `false`, takže se doprava účtuje i nad limit. Zákazník za 2 400 Kč zaplatí 79 Kč navíc — a nikdo si toho nemusí všimnout roky. JavaScript tě na překlep v názvu klíče neupozorní, protože čtení neexistující vlastnosti není chyba.
:::

Zkus změnit `total` na `celkem` a sleduj, jak se výsledek změní na `0`.

> [!REMEMBER]
> **TypeScript je kontrola, která běží před spuštěním. Za běhu z něj nezbyde ani jeden řádek.**

## Kontrola před spuštěním

TypeScript není nový jazyk. Je to JavaScript, do kterého smíš dopsat, **jaké
hodnoty kam patří** — a navíc program, který to zkontroluje. Ten program se
jmenuje `tsc` a kontrolu spustíš sám; pořád běží i v editoru, takže hlášku vidíš
rovnou u řádku.

Stejný modul s [[typová anotace|typovými anotacemi]] má příponu `.ts` a vypadá
takhle:

```ts
// doprava.ts
type Kosik = { celkem: number; hmotnost: number };

const zdarmaOd = 1500;

export function cenaDopravy(kosik: Kosik): number {
  if (kosik.celkem >= zdarmaOd) return 0;
  return kosik.hmotnost > 10 ? 149 : 79;
}
```

Kolegův soubor s překlepem teď nemá kam uklouznout:

```ts
// kosik.ts
import { cenaDopravy } from './doprava.ts';

console.log(cenaDopravy({ total: 2400, hmotnost: 3 }));
```

Kontrola ho najde a v terminálu vypíše:

```text
kosik.ts(3,27): error TS2353: Object literal may only specify known properties, and 'total' does not exist in type 'Kosik'.
```

Přečti si to po částech: `kosik.ts(3,27)` je soubor, řádek a sloupec, `TS2353` je
kód chyby (dá se vyhledat) a zbytek říká, co se stalo — objekt má klíč, který
v typu `Kosik` neexistuje.

:::check
Napiš, v jaké chvíli TypeScript našel kolegův překlep `total`: před spuštěním programu, nebo při jeho běhu?

### --expected--
před spuštěním

### --accept--
před spuštěním programu
při kontrole typů

### --why--
Kontrola typů je samostatný krok, který si pustíš nad zdrojovým kódem. Nic se
přitom nespouští — proto najde i chybu ve větvi, kterou by tvůj test nikdy neprošel.
:::

## Jak se anotace píše

Anotace je dvojtečka a za ní typ. Píše se na tři místa: k parametru, za závorky
parametrů (návratový typ) a k proměnné.

```ts
// Parametry a návratový typ.
function slevaVProcentech(cena: number, procent: number): number {
  return Math.round(cena * (1 - procent / 100));
}

// Proměnná. U té anotaci většinou psát nemusíš, viz další část.
const nazev: string = 'Osadníci z Katanu';

// Pole čísel a pole textů.
const skladem: number[] = [3, 0, 12];
const stitky: string[] = ['strategie', 'pro dva'];

// Vlastní jméno pro tvar objektu. Volitelný klíč má za jménem otazník.
type Hra = {
  nazev: string;
  cena: number;
  podtitul?: string;
};
```

`type Hra = { … }` je jen **jméno pro tvar objektu**. Žádná třída, žádná
kontrola za běhu — pojmenování, které se dá použít na deseti místech a změnit
na jednom.

> [!NOTE]
> TypeScriptu je jedno, jak objekt vznikl. Zajímá ho **jeho tvar**: když má
> objekt klíče `nazev` a `cena` správných typů, je to `Hra`. Tomuhle se říká
> [[strukturální typování]] a v lekci [Základní typy](see:nastroje-typescript/zakladni-typy)
> se k němu vrátíme.

:::check
Přepiš tuhle deklaraci tak, aby funkce brala pole textů a vracela text: `function spoj(casti) { return casti.join(', '); }`. Napiš jen řádek s `function`.

### --expected--
function spoj(casti: string[]): string {

### --accept--
function spoj(casti: string[]): string
function spoj(casti: Array<string>): string {
function spoj(casti: Array<string>): string

### --why--
Pole textů se píše `string[]` (nebo `Array<string>`, což je totéž). Návratový typ
patří za závorku parametrů, před složenou závorku těla.
:::

## Odvození: většinu typů psát nemusíš

TypeScript umí typ **odvodit** z hodnoty. Když ho odvodí správně, je psaní
anotace zbytečná práce — a navíc riziko, že se anotace a skutečnost rozejdou.

:::live node predict
```js
const pocet = 3;
let pocetKusu = 3;
const skladem = [3, 0, 12];

const nejvic = Math.max(...skladem);
const soucet = pocet + pocetKusu;
const chyba = skladem[0].toUpperCase();
```
--question-- V souboru `sklad.ts` není jediná anotace. Na kterém řádku ohlásí `npx tsc --noEmit` chybu? Napiš číslo řádku.
--expected-- 7
--output--
```text
sklad.ts(7,26): error TS2339: Property 'toUpperCase' does not exist on type 'number'.
```
--why-- `skladem` se odvodilo jako `number[]`, takže `skladem[0]` je `number` a metoda `toUpperCase` na něm neexistuje — ta patří textům. Nikde jsi typ `number[]` nenapsal; TypeScript si ho vzal z hodnoty. Mimochodem, u `const pocet = 3` se odvodí přesná hodnota `3` (nedá se změnit), u `let pocetKusu = 3` typ `number` (dá se změnit).
:::

Kde [[odvození typu|odvození]] nestačí a anotaci napsat musíš:

- **parametry funkce** — z ničeho se odvodit nedají,
- **prázdné pole** (`const radek = []` je `any[]`, dokud neřekneš `radek: string[]`),
- **hranice aplikace** — co přijde z `JSON.parse`, z formuláře nebo z API.

> [!TIP]
> Návratový typ funkce klidně vynech, ale u exportovaných funkcí ho napiš. Je to
> smlouva: když tělo funkce omylem začne vracet něco jiného, chyba se ohlásí
> **uvnitř té funkce**, ne u všech deseti míst, která ji volají.

:::check
Proč se u `const barva = 'modra'` odvodí typ `'modra'`, ale u `let barva = 'modra'` typ `string`?

### --expected--
const se nedá přepsat

### --accept--
protože const se nedá změnit
const nelze přiřadit znovu, let ano

### --why--
`const` nejde přiřadit znovu, takže hodnota zůstane navždy `'modra'` a TypeScript
si může dovolit ten nejpřesnější typ. `let` se přepsat dá, proto se typ rozšíří
na `string` — jinak by šlo přiřadit jen `'modra'`.
:::

## Typy se za běhu mažou

Tohle je nejdůležitější věta celé sekce a zdroj většiny nedorozumění: **typy
existují jen pro kontrolu**. Ve chvíli, kdy kód běží, po nich nezbyde nic.

Node umí soubor `.ts` spustit přímo. Nepřekládá ho — jen z něj
[[odstraňování typů|odstraní typy]] (*type stripping*) a výsledný JavaScript
pustí. Takže tenhle soubor doběhne bez jediné stížnosti:

:::live node predict
```js
type Cena = number;

const cena: Cena = '199';
const dvojnasobek = cena * 2;

console.log(typeof cena, dvojnasobek);
```
--question-- Soubor `cena.ts` spustíš příkazem `node cena.ts`. Co vypíše?
--output--
```text
string 398
```
--why-- `node` typy jen smaže a spustí zbytek. Zůstane `const cena = '199'`, takže `typeof` je `'string'`. Násobení řetězce číslem JavaScript zvládne (`'199' * 2` je `398`), i když anotace tvrdila, že jde o `number`. **Anotace nic nekontroluje a nic nepřevádí — kontroluje `tsc`, a ten jsi nespustil.**
:::

Zkus si to: soubor spusť (`node cena.ts`) a pak nad ním pusť kontrolu
(`npx tsc --noEmit`). Jeden příkaz mlčí, druhý ohlásí `error TS2322`.

> [!PITFALL] Anotace není převod
> `const cena: number = vstupZFormulare` neudělá z textu číslo. Když ti do
> proměnné teče text, převeď ho sám (`Number(vstup)`) — anotace jen říká, co tam
> **má** být, a `tsc` na neshodu upozorní.

Protože Node typy jen maže, nesmí soubor obsahovat nic, co by se mazat nedalo.
Dvě konstrukce ze starého TypeScriptu se mazat nedají: `enum` (generuje za sebe
objekt) a parametry se zkratkou `constructor(private jmeno: string)`. Když
v `tsconfig.json` zapneš `erasableSyntaxOnly`, `tsc` ti je zakáže a hlásí je
dřív, než na ně narazíš v terminálu.

:::check
Kolega tvrdí: „Přidal jsem typy, takže teď mi do funkce nikdo nemůže poslat text místo čísla." Co je na tom špatně?

### --answer--
Nic. Typy se kontrolují při každém volání funkce.

#### --why--
Myslíš si, že se z anotací stane kód? Žádná kontrola za běhu nevznikne.

### --correct--
Typy chrání jen kód, který kontrolou prošel. Data z formuláře, `JSON.parse` nebo cizí knihovny se nekontrolují.

#### --why--
Kontrola platí na zdrojový kód, ne na hodnoty za běhu. Co přijde zvenku, musíš
ověřit sám — a k tomu se dostaneme v lekci Validace na hranici.

### --answer--
Špatně je jen to, že zapomněl zapnout `strict`.

#### --why--
`strict` kontrolu zpřesní, ale i tak se dívá jen na kód, ne na hodnoty za běhu.
:::

## Kontrola typů: `npx tsc --noEmit`

Kontrolu pustíš ručně v terminálu. Přepínač `--noEmit` znamená „jen zkontroluj,
nic nevyráběj":

```sh
$ npx tsc --noEmit
doprava.ts(9,10): error TS2322: Type 'string' is not assignable to type 'number'.
```

Bez chyb příkaz nevypíše nic a skončí s kódem 0 — v terminálu je ticho dobrá
zpráva. V projektu se to dává do `package.json` jako skript, ať to nemusíš psát:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

Nastavení kontroly je v `tsconfig.json` v kořeni projektu. Pro Node projekt, kde
chceš `.ts` spouštět přímo, vypadá takhle:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "esnext",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "noEmit": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true
  },
  "include": ["*.ts"]
}
```

Jediná volba, kterou musíš znát hned, je **`strict: true`**. Zapíná sadu
přísnějších kontrol — hlavně tu, že `null` a `undefined` nejsou platná hodnota
každého typu, a tu, že neotypovaný parametr je chyba, ne `any`. Bez `strict`u
projde skoro všechno a TypeScript ztrácí smysl. Zapíná ho i `npm create vite`.

> [!TIP]
> `tsc` je od verze 7 přepsaný do jazyka Go a kontroluje řádově rychleji než dřív.
> Chování a hlášky zůstaly stejné, takže se nemusíš učit nic zvlášť — jen si
> zvykni, že kontrola velkého projektu trvá sekundy, ne minuty.

:::check
Co udělá `npx tsc` **bez** přepínače `--noEmit` v projektu s `.ts` soubory?

### --answer--
Nic, `--noEmit` je výchozí chování.

#### --why--
Myslíš si, že `tsc` sám od sebe jen kontroluje? Jeho původní práce je překládat.

### --correct--
Zkontroluje typy a vedle každého `.ts` souboru vyrobí přeložený `.js`.

#### --why--
`tsc` je překladač. Když mu neřekneš `--noEmit` (nebo `"noEmit": true`), výstup
opravdu zapíše na disk — a ty pak máš v repozitáři soubory, které tam nepatří.

### --answer--
Ohlásí chybu, protože bez `--noEmit` neví, kam výstup zapsat.

#### --why--
Výchozí cíl je stejná složka jako zdroj, takže `tsc` ví moc dobře kam.
:::

:::explain
Vysvětli vlastními slovy, proč funkce s anotací `(cena: number)` může za běhu přesto dostat text.

## --model--
Anotace je informace pro kontrolu typů, ne kód. Při spuštění se smaže, takže
v hotovém JavaScriptu žádná kontrola parametru není. Dokud hodnota vzniká
v kódu, který kontrolou prošel, je to v pořádku. Jakmile přijde zvenku —
z `JSON.parse`, z formuláře, z cizí knihovny — TypeScript o ní nic neví a musím
si ji ověřit sám.

## --checklist--
- Anotace se před spuštěním smaže, žádná kontrola za běhu nevznikne.
- Kontrola typů platí jen na zdrojový kód, který jsem nechal zkontrolovat.
- Data zvenku (`JSON.parse`, formulář, API) žádnou kontrolou neprošla.
- Hodnotu z vnějšku musím ověřit kódem, ne anotací.
:::

## Typické chyby a pasti

> [!PITFALL] `any` vypne kontrolu a šíří se dál
> `const data: any = …` znamená „přestaň se dívat". Chybí ti pak i napovídání
> v editoru a hodnota si `any` odnese do každé proměnné, do které ji přiřadíš.
> **Oprava:** když typ opravdu neznáš, napiš `unknown` — s tím nejdřív musíš
> zjistit, co to je. Rozdíl probereme v lekci [Základní typy](see:nastroje-typescript/zakladni-typy#unknown-any-a-never).

> [!PITFALL] `as` nepřevádí, jen zavře kontrole oči
> `const cena = vstup as number` je **tvrzení**, ne převod. Když v `vstup` je text,
> `tsc` zmlkne a chyba se objeví o deset řádků dál jako
> `TypeError: cena.toFixed is not a function`.
> **Oprava:** převeď hodnotu (`Number(vstup)`) nebo ji ověř podmínkou.

> [!PITFALL] `error TS2307: Cannot find module './utils' or its corresponding type declarations.`
> Relativní import bez přípony. Node ani `tsc` v tomhle nastavení příponu
> nedohledá. **Oprava:** `'./utils.ts'` (s volbou `allowImportingTsExtensions`),
> nebo `'./utils.js'` v projektech, které se překládají.

> [!PITFALL] Kontrola v editoru a v terminálu se rozcházejí
> Editor kontroluje otevřený soubor podle nejbližšího `tsconfig.json`, `tsc`
> kontroluje **všechno, co je v `include`**. Chyba v souboru, který jsi zavřel,
> je proto vidět jen v terminálu. **Oprava:** před odesláním práce pusť
> `npm run typecheck`, nespoléhej na podtržení v editoru.

Poslední past je nejčastější důvod, proč lidi TypeScript vzdají: **hláška
vypadá děsivě, ale říká vždycky totéž.** Tenhle kód

```ts
type Hra = { nazev: string; cena: number };

const zeSouboru = { nazev: 'Azul', cena: '999' };
const hra: Hra = zeSouboru;
```

vyrobí tři řádky pod sebou:

```text
sklad.ts(4,7): error TS2322: Type '{ nazev: string; cena: string; }' is not assignable to type 'Hra'.
  Types of property 'cena' are incompatible.
    Type 'string' is not assignable to type 'number'.
```

Čte se **odspodu**. Poslední řádek je skutečná příčina (`string` místo `number`),
prostřední říká, u které vlastnosti (`cena`), a první jen pojmenuje celek. Celé
čtení dlouhých hlášek má vlastní lekci
[Typy knihoven a dlouhé hlášky](see:nastroje-typescript/typy-knihoven).

:::check
V hlášce výš je tři řádky pod sebou. Který z nich ti řekne, co přesně opravit?

### --answer--
První — pojmenuje typ `Hra`.

#### --why--
První řádek říká jen „celek nepasuje". Co přesně nepasuje, je hlouběji.

### --correct--
Poslední — `Type 'string' is not assignable to type 'number'`.

#### --why--
Poslední řádek je konec cesty, kterou kontrola prošla: úplně dole je konkrétní
neshoda dvou typů. Nad ním je cesta, jak se tam kontrola dostala.

### --answer--
Prostřední — jmenuje vlastnost `cena`.

#### --why--
Prostřední řádek je vodítko, kde se dívat, ale samotný důvod je ještě o řádek níž.
:::

## Kde to najdeš v MDN

- [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) —
  `import`/`export`; v TypeScriptu se nemění, jen k nim přibude `import type`.
- [typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) —
  operátor za běhu, se kterým budeš typy zužovat; nepleť si ho s typy TypeScriptu.
- [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/Number) —
  převod textu na číslo, který anotace neudělá za tebe.

> [!NOTE]
> Vlastní typový systém TypeScriptu na MDN není. Jeho dokumentace je
> [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
> (anglicky) a chyby podle kódu (`TS2322`) najdeš vyhledáním kódu i s vysvětlením
> na [typescript.tv/errors](https://typescript.tv/errors/).

V další lekci projdeme typy systematicky: n-tice, `interface`, `readonly`,
`unknown` proti `any` a typy funkcí. Pak už budeš mít dost na to, abys do
TypeScriptu přepsal celý modul košíku.

# --questions--

## --question--

Soubor `app.ts` obsahuje jediný řádek: `const pocet: number = 'tri';`. Napiš,
co program vypíše do terminálu po příkazu `node app.ts`.

### --expected--

nic

### --accept--

nic se nevypíše
nevypíše nic
prázdný výstup

### --why--

Node anotace smaže a spustí `const pocet = 'tri';`. Ten řádek nic nevypisuje
a nic nekontroluje, takže program mlčky doběhne. Chybu by ohlásila až kontrola
`npx tsc --noEmit`.

### --see--

nastroje-typescript/proc-typescript#typy-se-za-behu-mazou

## --question--

V kódu je `const hodnoty: number[] = [];` a hned pod ním `hodnoty.push('12');`.
Napiš kód chyby, který kontrola typů ohlásí (ve tvaru `TSxxxx`).

### --expected--

TS2345

### --why--

`TS2345` je „Argument of type 'string' is not assignable to parameter of type
'number'" — chyba u **argumentu volání**. Kdyby šlo o přiřazení do proměnné,
hlásilo by se `TS2322`. Kódy chyb se dají vyhledat, což je nejrychlejší cesta
k vysvětlení neznámé hlášky.

### --see--

nastroje-typescript/proc-typescript#kontrola-pred-spustenim

## --question--

U kterých dvou míst v kódu se typ **nedá** odvodit a musíš ho napsat?

### --answer--

U návratového typu funkce a u `const`.

#### --why--

Návratový typ se odvodí z `return` a u `const` se odvodí přímo z hodnoty.

### --correct--

U parametrů funkce a u prázdného pole.

#### --why--

Parametr nemá hodnotu, ze které by se dalo odvozovat, a prázdné pole nemá první
prvek — vyjde z něj `any[]`.

### --answer--

U proměnných `let` a u polí s hodnotami.

#### --why--

`let barva = 'modra'` se odvodí jako `string` a `[1, 2]` jako `number[]`. Odvození
tady funguje dobře.

### --see--

nastroje-typescript/proc-typescript#odvozeni-vetsinu-typu-psat-nemusis

## --question--

Kolega opraví typovou chybu tak, že dopíše `as number`. Kontrola zmlkne a za dva
dny přijde v provozu `TypeError: x.toFixed is not a function`. Vysvětli jednou
větou, proč `as` chybu nevyřešilo.

### --expected--

as jen vypne kontrolu, hodnotu nezmění

### --accept--

as je tvrzení, ne převod
as nepřevádí hodnotu
as jen řekne kontrole, čemu má věřit

### --why--

`as` je tvrzení programátora „věř mi, že to je číslo". Kontrola tomu uvěří
a přestane se dívat, ale v proměnné je pořád text. Chyba se tím jen přesune
z terminálu do provozu.

### --see--

nastroje-typescript/proc-typescript#typicke-chyby-a-pasti
