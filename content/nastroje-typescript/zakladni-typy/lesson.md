# Základní typy

:::check pretest
Co myslíš: projde kontrolou typů řádek `const hra: { nazev: string } = { nazev: 'Azul', cena: 999 };`?

### --answer--
Projde. Objekt má `nazev` typu `string`, zbytek je navíc a nikomu nevadí.

#### --why--
Takhle funguje strukturální typování v TypeScriptu, ale pro objektové literály platí přísnější kontrola.

### --correct--
Neprojde. U objektu napsaného přímo do proměnné hlásí TypeScript i klíč navíc.

#### --why--
Jmenuje se to "excess property checking" a brání to překlepům v názvech klíčů.

### --answer--
Neprojde, protože typ objektu musí mít jméno (`type` nebo `interface`).

#### --why--
Typ objektu může být napsaný "inline" (tzv. anonymní typ), jméno není povinné.
:::

Typová anotace je krátká jen do chvíle, kdy začneš popisovat skutečná data.
Objednávka má nepovinnou poznámku, stav je jedno ze čtyř slov, souřadnice jsou
dvě čísla v poli a odpověď serveru je něco, co ještě nevíš. Pro každou z těch
situací má TypeScript zápis — a když ho neznáš, skončíš u `any`, které kontrolu
vypne.

> [!REMEMBER]
> **Typ v TypeScriptu popisuje tvar hodnoty, ne její třídu.** Cokoli má správné
> klíče správných typů, do toho typu patří — ať to vyrobil `new`, `JSON.parse`
> nebo objekt napsaný rukou.

## Tvar objektu: `type` a `interface`

Na pojmenování tvaru objektu jsou dva zápisy a v praxi mezi nimi skoro není
rozdíl:

```ts
type Hra = {
  nazev: string;
  cena: number;
};

interface Hrac {
  jmeno: string;
  vek: number;
}
```

Rozdíl je v tom, co navíc umí:

| | `type` | `interface` |
|---|---|---|
| tvar objektu | ano | ano |
| jméno pro sjednocení, n-tici, funkci | **ano** | ne |
| skládání z jiných typů | `&` (průnik) | `extends` |
| dvě deklarace stejného jména | chyba | tiše se **sloučí** |

Doporučení pro tvůj kód: **piš `type`.** Umí všechno a nesloučí se s cizí
deklarací za tvými zády. `interface` používej tam, kde to chce knihovna nebo
tým — a čti ho, protože ho uvidíš ve většině cizího kódu i v `.d.ts` souborech.

Skládání vypadá takhle:

```ts
type Zaklad = { id: number; nazev: string };
type SeCenou = Zaklad & { cena: number };

interface Kniha extends Zaklad {
  autor: string;
}
```

:::check
Proč se jméno `type Stav = 'nova' | 'zaplacena'` nedá napsat přes `interface`?

### --expected--
interface umí jen tvar objektu

### --accept--
interface popisuje jen objekty
interface neumí sjednocení

### --why--
`interface` popisuje vždycky objekt (nebo funkci či pole jako objekt). Sjednocení,
n-tice ani `string` samo o sobě objekt nejsou, a tak na ně jméno dá jen `type`.
:::

## Volitelné klíče a `readonly`

Otazník za jménem klíče znamená „může chybět". `readonly` znamená „po vytvoření
se nepřepíše".

```ts
type Objednavka = {
  readonly id: number;
  email: string;
  poznamka?: string;
  readonly polozky: readonly string[];
};
```

Dvě věci, které z toho plynou a lidi je pletou:

- **`poznamka?: string` má typ `string | undefined`.** Takže dokud ho nezkontroluješ,
  `objednavka.poznamka.length` je chyba — `undefined` žádné `length` nemá.
- **`readonly` platí jen pro kontrolu.** Za běhu je to obyčejný objekt a `Object.assign`
  ho klidně přepíše. Zámek proti změně za běhu dělá `Object.freeze`, ne `readonly`.

:::live node predict
```js
type Objednavka = {
  readonly id: number;
  readonly polozky: readonly string[];
};

const objednavka: Objednavka = { id: 7, polozky: ['Azul'] };

objednavka.polozky.push('Dixit');
```
--question-- Který kód chyby ohlásí `npx tsc --noEmit` na posledním řádku? Napiš ho ve tvaru `TSxxxx`.
--expected-- TS2339
--output--
```text
objednavka.ts(8,20): error TS2551: Property 'push' does not exist on type 'readonly string[]'. Did you mean 'pop'?
```
--why-- Je to `TS2551`, blízký příbuzný `TS2339` („vlastnost neexistuje"), a vznikne proto, že `readonly string[]` nemá **žádnou** metodu, která pole mění — `push`, `pop`, `splice`, `sort` ani `reverse`. Zbydou jen `map`, `filter`, `slice` a spol., které vracejí nové pole. Chyba tě tak upozorní přesně na to, co jsi zakázal. Nabídku `Did you mean 'pop'?` neber vážně, `pop` je zakázaný taky.
:::

Zkus si to: dopiš řádek `const delsi = objednavka.polozky.map((p) => p.length);` a sleduj,
že ten kontrolou projde.

:::check
`type Uzivatel = { jmeno: string; telefon?: string }`. Napiš celý typ, který má vlastnost `telefon` po zápisu `uzivatel.telefon`.

### --expected--
string | undefined

### --accept--
undefined | string

### --why--
Otazník přidá do typu `undefined`. Proto se na `telefon` nedá hned sáhnout — TypeScript
tě přinutí případ „chybí" nejdřív vyřešit (podmínkou nebo `?.`).
:::

## Pole a n-tice

Pole má jeden typ pro všechny prvky, [[n-tice]] (*tuple*) má pevnou délku a každá
pozice může mít typ jiný:

```ts
// Pole: libovolně prvků, všechny stejného typu.
const ceny: number[] = [999, 1290, 450];

// N-tice: přesně dva prvky, každý jiného typu.
type Souradnice = [number, number];
type Zaznam = [string, number];

const praha: Souradnice = [50.08, 14.44];
const vysledek: Zaznam = ['Azul', 87];
```

N-tici potkáš hlavně jako návratovou hodnotu funkce, která vrací dvě věci
(`useState` v Reactu je n-tice `[hodnota, nastavHodnotu]`) a u `Object.entries`.
Pole objektů se píše `Hra[]`, nebo `Array<Hra>` — je to totéž.

> [!PITFALL] `const b = [1, 'dva']` není n-tice
> Odvodí se jako `(string | number)[]`, tedy pole libovolné délky, kde na každé
> pozici může být obojí. **Oprava:** napiš anotaci (`const b: [number, string] = …`)
> nebo přidej `as const`.

:::check
Proč se na `const dvojice = ['Azul', 87]` nedá zavolat `dvojice[1].toFixed(2)`?

### --expected--
odvodí se pole string | number

### --accept--
dvojice[1] je string | number, ne number
je to pole (string | number)[], ne n-tice

### --why--
Bez anotace TypeScript nevidí n-tici, ale pole `(string | number)[]`. `dvojice[1]`
je proto `string | number` a `toFixed` na textu neexistuje, takže se metoda nedá
zavolat, dokud typ nezúžíš nebo nenapíšeš n-tici.
:::

## Sjednocení a literálové typy

[[sjednocení typů|Sjednocení]] (*union*) se píše svislou čárou a znamená „jedno
z těchhle". [[literálový typ|Literálový typ]] je jedna konkrétní hodnota:

```ts
// Sjednocení typů.
type Id = string | number;

// Sjednocení literálů: jen tahle čtyři slova, nic jiného.
type Stav = 'nova' | 'zaplacena' | 'odeslana' | 'zrusena';

function popisStavu(stav: Stav): string {
  return stav === 'nova' ? 'Čeká na platbu' : 'Vyřizuje se';
}

popisStavu('zaplacena');
popisStavu('zaplacen');
```

Poslední řádek je přesně ten překlep, který v JavaScriptu odhalí až uživatel.
Kontrola ho ohlásí hned:

```text
objednavka.ts(12,13): error TS2345: Argument of type '"zaplacen"' is not assignable to parameter of type 'Stav'.
```

Sjednocení literálů je proto nejvýnosnější typ v celém TypeScriptu: nahradí
volné texty, u kterých si nikdy nejsi jistý, jak se přesně píšou, a editor ti je
navíc začne napovídat.

> [!TIP]
> Konstanty ve stávajícím objektu proměníš v literálové typy zápisem `as const`:
> `const STAVY = ['nova', 'zaplacena'] as const;` a pak
> `type Stav = typeof STAVY[number];`. Jeden seznam pak slouží kódu i typům.

:::check
Napiš typ, který povolí jen hodnoty `'maly'`, `'stredni'` a `'velky'`.

### --expected--
'maly' | 'stredni' | 'velky'

### --accept--
"maly" | "stredni" | "velky"
type Velikost = 'maly' | 'stredni' | 'velky'

### --why--
Sjednocení literálů se píše se svislými čárami. Hodnoty jsou v uvozovkách, protože
jde o konkrétní texty, ne o typ `string`.
:::

## `unknown`, `any` a `never`

Tyhle tři jména vypadají podobně a chovají se úplně jinak. Rozdíl mezi prvními
dvěma je nejčastější otázka na pohovoru z TypeScriptu.

| typ | co znamená | co s ním smíš |
|---|---|---|
| `any` | „nekontroluj to" | **cokoli**; kontrola je vypnutá a `any` se šíří dál |
| `unknown` | „nevím, co to je" | nic, dokud typ nezúžíš podmínkou |
| `never` | „tohle se nikdy nestane" | nic; hodnota typu `never` neexistuje |

Kontrastní pár na stejném kódu:

```ts
function delkaAny(vstup: any): number {
  return vstup.length;
}

function delkaUnknown(vstup: unknown): number {
  return vstup.length;
}
```

První funkce projde kontrolou a spadne za běhu na `TypeError`, když jí pošleš
číslo. Druhá kontrolou **neprojde** a přinutí tě situaci vyřešit:

```text
delka.ts(6,10): error TS18046: 'vstup' is of type 'unknown'.
```

`never` sám nenapíšeš skoro nikdy, ale uvidíš ho. Je to typ funkce, která nikdy
nic nevrátí (vždycky vyhodí výjimku), a typ, který zbude, když vyčerpáš všechny
možnosti sjednocení — právě na tom se staví kontrola úplnosti `switch`e, kterou
si ukážeme v [Zúžení typů a generika](see:nastroje-typescript/zuzovani-a-genericita).

:::check
Kolega napsal `const data: any = JSON.parse(text)`. Jednou větou napiš, co na tom je horší než `unknown`.

### --expected--
any vypne kontrolu, unknown vynutí ověření

### --accept--
any dovolí cokoli bez kontroly, unknown musíš nejdřív zúžit
s any projde i chybný kód

### --why--
S `any` projde kontrolou `data.polozky[0].cena` i tehdy, když v `data` je číslo —
a chyba se objeví až za běhu. `unknown` tě donutí nejdřív ověřit, co v hodnotě
opravdu je, a přesně to na hranici aplikace chceš.
:::

## Typy funkcí

Funkce se dá otypovat i jako hodnota — třeba když ji předáváš dál nebo ukládáš
do objektu. Zápis připomíná arrow funkci, jen místo těla je návratový typ:

```ts
// Jméno pro typ funkce.
type Formatovac = (hodnota: number) => string;

const naKoruny: Formatovac = (hodnota) => `${hodnota} Kč`;

// Funkce jako parametr jiné funkce.
function vypisCeny(ceny: number[], format: Formatovac): string[] {
  return ceny.map((cena) => format(cena));
}
```

Všimni si, že u `naKoruny` už se anotace `(hodnota: number)` psát nemusí —
TypeScript typ parametru **odvodí z cílového typu**. Tomuhle se říká kontextové
typování a šetří spoustu psaní u callbacků: `ceny.map((cena) => …)` ví, že `cena`
je `number`, protože `ceny` je `number[]`.

Funkce, která nic nevrací, má návratový typ `void`:

```ts
type Posluchac = (udalost: string) => void;
```

:::check
Napiš typ funkce, která bere dva texty a vrací pravdivostní hodnotu.

### --expected--
(a: string, b: string) => boolean

### --accept--
(prvni: string, druhy: string) => boolean
type Porovnani = (a: string, b: string) => boolean

### --why--
Jména parametrů si v typu funkce vymýšlíš ty; důležité jsou jejich typy, jejich
počet a typ za šipkou. Kdo funkci implementuje, může si parametry pojmenovat jinak.
:::

## Co dělá `strict`

`"strict": true` v `tsconfig.json` je jeden přepínač, který zapne skupinu
kontrol. Dvě z nich změní tvůj kód nejvíc:

- **`strictNullChecks`** — `null` a `undefined` přestanou být platná hodnota
  každého typu. `const hra: Hra = null` je pak chyba a `najdiHru(id)` musí
  přiznat, že vrací `Hra | undefined`. Tohle je hlavní důvod, proč se TypeScript
  vyplatí: donutí tě ošetřit „nenašlo se".
- **`noImplicitAny`** — parametr bez anotace je chyba, ne `any`. Bez toho by ti
  polovina kódu tiše proklouzla bez kontroly.

Bez `strict`u projde skoro všechno a psaní typů je jen zdobení. Zapínej ho vždycky;
`npm create vite` ho zapíná sám.

> [!NOTE]
> Ve starém projektu, který `strict` nemá, se nezapíná najednou — objeví se stovky
> chyb. Zapíná se po jedné volbě, začíná se `strictNullChecks` a opravuje se po
> souborech. To si ukážeme v navazujících kurzech.

:::check
Funkce `najdiHru(id)` používá `hry.find(…)`. Jaký návratový typ jí TypeScript odvodí, když je zapnutý `strictNullChecks`?

### --expected--
Hra | undefined

### --accept--
undefined | Hra

### --why--
`find` nemusí nic najít, a tak vrací `Hra | undefined`. Se zapnutým `strictNullChecks`
ti TypeScript nedovolí s výsledkem pracovat, dokud případ „nenašlo se" neošetříš —
což je přesně ta chyba, která v JavaScriptu končí `Cannot read properties of undefined`.
:::

## Typické chyby a pasti

> [!PITFALL] Klíč navíc projde, když objekt nepíšeš přímo do proměnné
> `const hra: Hra = { nazev: 'Azul', cena: 999, sleva: 10 }` je chyba `TS2353`.
> Ale když ten samý objekt nejdřív uložíš do proměnné bez anotace a **tu** přiřadíš,
> kontrola mlčí. Není to nedůslednost: přísná kontrola klíčů navíc (*excess property
> check*) se dělá jen u objektu napsaného na místě, protože jen tam jde o překlep.
> **Oprava:** když chceš klíče navíc opravdu zakázat, přiřaď literál přímo, nebo
> použij `satisfies`.

> [!PITFALL] `error TS2532: Object is possibly 'undefined'.`
> Sáhl jsi na volitelný klíč nebo na výsledek `find`, aniž bys ošetřil, že tam nic
> není. **Oprava:** podmínka (`if (!hra) return null;`), volitelné zřetězení
> (`hra?.cena`) nebo výchozí hodnota (`hra?.cena ?? 0`). Nikdy `hra!.cena` —
> vykřičník je totéž co `as`, jen kratší.

> [!PITFALL] `object`, `Object` a `{}` neznamenají „nějaký objekt s klíči"
> `{}` znamená „cokoli kromě `null` a `undefined`" (i číslo!), `Object` je skoro
> totéž a `object` zakáže jen primitivní hodnoty. Z žádného z nich nepřečteš
> vlastnost. **Oprava:** napiš tvar (`{ nazev: string }`), `Record<string, unknown>`
> pro slovník, nebo `unknown` a zúžení.

> [!PITFALL] Dva `interface` stejného jména se tiše sloučí
> Když napíšeš `interface Hra` dvakrát, TypeScript z nich udělá jeden typ se všemi
> klíči — a ty marně hledáš, odkud se ve tvém typu vzala vlastnost, kterou jsi
> nenapsal. `type` stejného jména dvakrát hlásí `TS2300: Duplicate identifier`.
> **Oprava:** v aplikaci piš `type`.

:::check
Proč je `hra!.cena` stejně nebezpečné jako `hra as Hra`?

### --expected--
je to tvrzení, ne kontrola

### --accept--
vypne kontrolu, hodnota může být pořád undefined
nic neověří, jen kontrole zavře oči

### --why--
Vykřičník (*non-null assertion*) říká „vím, že to není `undefined`". Když se mýlíš,
kontrola mlčí a chyba se objeví za běhu jako `Cannot read properties of undefined`.
Ověření podmínkou naopak platí i za běhu.
:::

## Kde to najdeš v MDN

- [Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) —
  vrací pole n-tic `[klíč, hodnota]`, takže uvidíš, kde se n-tice berou v praxi.
- [Array.prototype.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find) —
  „vrací `undefined`, když nic nenajde"; právě tuhle větu `strictNullChecks` proměňuje v typ.
- [Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) —
  `?.`, kterým se volitelné klíče ošetřují nejčastěji.
- [Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) —
  zámek, který platí za běhu; `readonly` platí jen při kontrole.

> [!NOTE]
> Přehled všech základních typů je v anglickém
> [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html).
> Jednotlivé volby `tsconfig.json` (včetně toho, co přesně zapíná `strict`) mají
> stránku [tsconfig reference](https://www.typescriptlang.org/tsconfig/).

Teď máš dost na to, abys do TypeScriptu přepsal celý modul. V následujícím
workshopu z něj poskládáš košík e-shopu s deskovými hrami — a typy ti po cestě
najdou chybu, kterou v JavaScriptu nikdo neviděl.

# --questions--

## --question--

Napiš, jaký typ má `hry.find((hra) => hra.nazev === 'Azul')`, když je `hry` typu
`Hra[]` a `tsconfig.json` má `"strict": true`.

### --expected--

Hra | undefined

### --accept--

undefined | Hra

### --why--

`find` nemusí nic najít. Se zapnutým `strictNullChecks` se `undefined` do typu
opravdu dostane, takže musíš případ „nenašlo se" ošetřit, než s výsledkem začneš
pracovat.

### --see--

nastroje-typescript/zakladni-typy#co-dela-strict

## --question--

Ve dvou souborech aplikace je shodou okolností `interface Kosik` — v každém s jinými
klíči. Co s tím TypeScript udělá?

### --answer--

Ohlásí `TS2300: Duplicate identifier 'Kosik'`.

#### --why--

Tohle udělá u `type`. `interface` má jinou vlastnost, kvůli které knihovny umí
rozšiřovat cizí typy.

### --answer--

Použije ten, který je v souboru dřív; druhý ignoruje.

#### --why--

Nic se nezahodí. Oba se uplatní — jen jinak, než čekáš.

### --correct--

V každém souboru platí vlastní deklarace, ale ve stejném rozsahu by se oba `interface` sloučily do jednoho typu se všemi klíči.

#### --why--

Slučování deklarací (*declaration merging*) je vlastnost `interface`. V modulech
platí každý `interface` jen ve svém souboru, ale jakmile jsou dva ve stejném
rozsahu, sloučí se — a ve svém typu najdeš klíče, které jsi nenapsal.

### --see--

nastroje-typescript/zakladni-typy#typicke-chyby-a-pasti

## --question--

Doplň typ, který popíše funkci na porovnání dvou her při řazení:
`type Porovnani = ???`. Funkce bere dvě `Hra` a vrací číslo.

### --expected--

(a: Hra, b: Hra) => number

### --accept--

(prvni: Hra, druhy: Hra) => number
(a: Hra, b: Hra) => number;

### --why--

Typ funkce se píše jako seznam parametrů, šipka a návratový typ. Jména parametrů
jsou jen popis, kontroluje se jejich počet a typy.

### --see--

nastroje-typescript/zakladni-typy#typy-funkci

## --question--

Který z těchhle typů je na odpověď z `JSON.parse` správný, když ještě nevíš, co
v ní je?

### --answer--

`any`, protože o hodnotě nic nevíš.

#### --why--

Právě proto ne: `any` řekne kontrole, ať se přestane dívat, a chyba se objeví
teprve za běhu.

### --correct--

`unknown`, protože s ním musíš typ nejdřív zúžit.

#### --why--

`unknown` drží kontrolu zapnutou: dokud neověříš, co v hodnotě je, nedá se s ní
nic dělat. Na hranici aplikace přesně to chceš.

### --answer--

`object`, protože JSON je vždycky objekt.

#### --why--

JSON může být i číslo, text, `null` nebo pole. A i kdyby byl objekt, z typu
`object` žádnou vlastnost nepřečteš.

### --see--

nastroje-typescript/zakladni-typy#unknown-any-a-never

## --question--

Napiš, jaký typ se odvodí u `const rozsah = [1, 'az', 10]`.

### --expected--

(string | number)[]

### --accept--

(number | string)[]
Array<string | number>

### --why--

Bez anotace vzniká pole, ne n-tice: TypeScript sjednotí typy prvků a délku
neuzamkne. Když chceš n-tici `[number, string, number]`, musíš ji napsat nebo
přidat `as const`.

### --see--

nastroje-typescript/zakladni-typy#pole-a-n-tice
