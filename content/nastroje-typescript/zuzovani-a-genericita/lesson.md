# Zúžení typů a generika

:::check pretest
Funkce dostane parametr typu `string | number`. Co myslíš, že se stane, když na něj rovnou zavoláš `.toFixed(2)`?

### --answer--
Projde to. `toFixed` na textu vrátí ten text.

### --correct--
Kontrola to odmítne — `toFixed` na `string` neexistuje.

### --answer--
Projde to, ale spadne to až za běhu.
:::

:::check pretest
Co myslíš, k čemu je dobrý typ `never`, když v něm nemůže být žádná hodnota?

### --expected--
nevím

### --accept--
označí případ, který nemůže nastat
hlídá, že jsem na nic nezapomněl
:::

Typy z minulé lekce popisují, **co v hodnotě je**. Jenže polovina práce
v aplikaci se točí kolem hodnot, u kterých to jisté není: odpověď serveru je buď
data, nebo chyba, parametr je buď `id`, nebo celý objekt, formulářové pole je
text, nebo `undefined`. Tahle lekce je o tom, jak z takové hodnoty bezpečně
dostat to, co potřebuješ — a jak napsat funkci, která si typ nechá určit od
toho, kdo ji volá.

> [!REMEMBER]
> **Zúžení typu není převod hodnoty. Podmínkou jen TypeScriptu ukážeš, co o té
> hodnotě už v tom místě víš** — a on ti od té chvíle dovolí víc.

## Zúžení podmínkou

[[zúžení typu|Zúžení]] (*narrowing*) funguje tak, že TypeScript sleduje tok kódu.
Uvnitř větve `if` ví o hodnotě víc než před ní:

```ts
function popisDelky(hodnota: string | number): string {
  if (typeof hodnota === 'number') {
    // Tady je hodnota number, TypeScript to ví z podmínky.
    return `číslo se ${hodnota.toFixed(0).length} číslicemi`;
  }
  // A tady už může být jen string — jiná možnost ze sjednocení nezbyla.
  return `text dlouhý ${hodnota.trim().length} znaků`;
}
```

Zužovat umíš pěti způsoby, které už z JavaScriptu znáš:

| nástroj | na co | příklad |
|---|---|---|
| `typeof x === '…'` | primitivní hodnoty | `typeof id === 'string'` |
| `Array.isArray(x)` | pole proti jedné hodnotě | `Array.isArray(vstup)` |
| `'klic' in x` | objekty podle klíče | `'chyba' in odpoved` |
| `x === 'hodnota'` | literálová sjednocení | `stav === 'vyprodano'` |
| `if (x)` | `undefined` a `null` pryč | `if (hra) …` |
| `x instanceof Trida` | instance tříd | `chyba instanceof Error` |

Pozor na to, že `if (x)` vyhodí i „prázdné" hodnoty: `0`, `''` a `NaN`. U čísla,
které smí být nula, se proto ptej na `!== undefined`, ne na pravdivost.

:::check
Napiš podmínku, kterou zúžíš `vstup: string | string[]` na pole.

### --expected--
Array.isArray(vstup)

### --accept--
if (Array.isArray(vstup))
typeof vstup !== 'string'

### --why--
`Array.isArray` je jediná spolehlivá kontrola pole (`typeof` u pole vrací
`'object'`). Zrovna tady by zabralo i `typeof vstup !== 'string'` — když ze
sjednocení vyloučíš text, zbyde pole.
:::

## Rozlišené sjednocení

Tohle je nejcennější vzor celé lekce. Stav načítání dat se často modeluje takhle:

```ts
type StavKatalogu = {
  nacitam: boolean;
  hry?: Hra[];
  chyba?: string;
};
```

Jenže takový typ dovolí i nesmysly: `{ nacitam: true, chyba: 'Nepovedlo se' }`
nebo stav, kde není ani `hry`, ani `chyba`. A při vykreslování se musíš ptát na
tři věci najednou.

[[rozlišené sjednocení|Rozlišené sjednocení]] (*discriminated union*) místo toho
vyjmenuje **možné stavy** a ke každému dá jen ta data, která k němu patří.
Společný klíč (tady `stav`) je rozlišovač:

```ts
type StavKatalogu =
  | { stav: 'nacitam' }
  | { stav: 'hotovo'; hry: Hra[] }
  | { stav: 'chyba'; zprava: string };
```

Nemožné kombinace tím zmizely: když je `stav: 'chyba'`, žádné `hry` v hodnotě
nejsou, a naopak. Porovnáním rozlišovače zúžíš celý objekt:

:::live node predict
```js
type StavKatalogu =
  | { stav: 'nacitam' }
  | { stav: 'hotovo'; hry: string[] }
  | { stav: 'chyba'; zprava: string };

export function pocetHer(stav: StavKatalogu): number {
  return stav.hry.length;
}
```
--question-- Co ohlásí `npx tsc --noEmit` na řádku 7? Napiš jen kód chyby ve tvaru `TSxxxx`.
--expected-- TS2339
--output--
```text
katalog.ts(7,15): error TS2339: Property 'hry' does not exist on type 'StavKatalogu'.
  Property 'hry' does not exist on type '{ stav: "nacitam"; }'.
```
--why-- Druhý řádek hlášky je to nejzajímavější: TypeScript jmenuje **tu variantu, kde klíč chybí**. Dokud neřekneš, o který stav jde, platí jen to, co mají všechny varianty společné — a to je jen klíč `stav`. Oprava je `if (stav.stav === 'hotovo') { return stav.hry.length; }`, uvnitř podmínky je typ zúžený na jednu variantu.
:::

Zkus si v ukázce přidat podmínku `if (stav.stav === 'hotovo')` a sleduj, jak
chyba zmizí.

:::check
Proč je `{ stav: 'chyba'; zprava: string }` bezpečnější než `{ chyba?: string }` vedle `{ hry?: Hra[] }`?

### --expected--
nedovolí nemožné kombinace

### --accept--
nejdou nastavit obě věci najednou
každý stav má jen svoje data
vyloučí stav, kde jsou data i chyba

### --why--
S volitelnými klíči jde sestavit hodnota, která nedává smysl (data i chyba
zároveň, nebo nic z toho) — a ty ji musíš ošetřovat, i když nikdy nenastane.
Rozlišené sjednocení takovou hodnotu vůbec nepustí.
:::

## Vyčerpávající `switch` a `never`

Když ke stavům přibude čtvrtý, chceš, aby ti kontrola ukázala **všechna místa**,
kde na něj zapomínáš. Na to je typ `never`: hodnota typu `never` neexistuje, takže
přiřazení do ní projde jen tehdy, když už v tom místě nemůže žádná hodnota zbýt.

```ts
function popisStavu(stav: StavKatalogu): string {
  switch (stav.stav) {
    case 'nacitam':
      return 'Načítám…';
    case 'hotovo':
      return `Načteno ${stav.hry.length} her`;
    case 'chyba':
      return `Chyba: ${stav.zprava}`;
    default: {
      const nezname: never = stav;
      return nezname;
    }
  }
}
```

Dokud pokryješ všechny varianty, je `stav` ve větvi `default` typu `never` a řádek
projde. Jakmile do sjednocení přidáš `{ stav: 'prazdno' }` a `case` nedopíšeš,
kontrola se ozve přesně tady:

```text
katalog.ts(16,13): error TS2322: Type '{ stav: "prazdno"; }' is not assignable to type 'never'.
```

Hláška ti rovnou jmenuje variantu, kterou jsi neošetřil. Tomuhle se říká
vyčerpávající kontrola (*exhaustiveness check*) a je to hlavní důvod, proč se
stavy modelují sjednocením a ne řetězcem.

:::check
Do sjednocení přibude varianta `{ stav: 'prazdno' }`. Kde ti to kontrola typů ohlásí, když máš vyčerpávající `switch`?

### --answer--
Na řádku, kde se sjednocení definuje.

#### --why--
Definice je v pořádku — přidat variantu je dovolené. Problém vznikne tam, kde se
s hodnotou pracuje.

### --correct--
Ve větvi `default`, na přiřazení do proměnné typu `never`.

#### --why--
Ve větvi `default` už teď může zbýt hodnota `{ stav: 'prazdno' }`, a ta se do
`never` přiřadit nedá. Kontrola tě tak pošle přesně do `switch`e, který potřebuje
doplnit.

### --answer--
Nikde, `switch` bez `case` prostě spadne do `default`.

#### --why--
To by platilo v JavaScriptu. Tady je ve větvi `default` řádek, který přiřazuje do
`never` — a právě proto přestane procházet.
:::

## Vlastní kontrola typu (*type guard*)

`typeof` a `in` fungují na jednoduché případy. U celého objektu z neznáma si
napíšeš vlastní [[type guard|kontrolu typu]] — obyčejnou funkci, jejíž návratový
typ je `parametr is Typ`:

```ts
type Hra = { id: number; nazev: string };

function jeHra(hodnota: unknown): hodnota is Hra {
  return (
    typeof hodnota === 'object' &&
    hodnota !== null &&
    'id' in hodnota &&
    typeof hodnota.id === 'number' &&
    'nazev' in hodnota &&
    typeof hodnota.nazev === 'string'
  );
}
```

Kdekoli pak napíšeš `if (jeHra(data))`, je uvnitř `data` typu `Hra`. Za to se ale
platí:

> [!PITFALL]
> **TypeScript ti `is` věří na slovo.** Když v těle guardu na některou kontrolu
> zapomeneš (nebo tam dáš `return true`), je to stejně děravé jako `as` — jen
> hůř viditelné, protože to vypadá jako poctivá kontrola. Proto se na hranici
> aplikace místo ručních guardů používá schéma; k tomu se dostaneme v lekci
> [Validace na hranici](see:nastroje-typescript/validace-na-hranici).

:::check
Jaký návratový typ musí mít funkce `jeCislo(hodnota: unknown)`, aby po `if (jeCislo(x))` byla `x` typu `number`?

### --expected--
hodnota is number

### --accept--
x is number
parametr is number

### --why--
Zápis `jméno parametru is Typ` říká „když tahle funkce vrátí `true`, je ten
parametr toho typu". Kdyby tam bylo jen `boolean`, kontrola typů by z volání nic
neodvodila.
:::

## Generika: typ jako parametr

Funkce `prvni(pole)` má vracet první prvek. Jaký má mít návratový typ? Pro pole
čísel `number`, pro pole her `Hra`. S `any` bys kontrolu vypnul, se `unknown` by
si volající musel typ pokaždé zužovat. Správná odpověď je **nechat typ určit
toho, kdo funkci volá**:

```ts
function prvni<T>(pole: T[]): T | undefined {
  return pole[0];
}

const cislo = prvni([3, 1, 2]);        // number | undefined
const nazev = prvni(['Azul', 'Dixit']); // string | undefined
```

`<T>` je [[generikum|typový parametr]]. Při každém volání se dosadí podle
argumentu — nic nemusíš psát, TypeScript si `T` odvodí. `T` je jen jméno, klidně
piš `<Polozka>`, když to bude čitelnější.

Často chceš o typu něco vědět. K tomu je `extends`, které funguje jako podmínka
na typový parametr:

```ts
function podleId<T extends { id: number }>(polozky: T[], id: number): T | undefined {
  return polozky.find((polozka) => polozka.id === id);
}
```

Funkce teď bere cokoli, co má `id` — hru, uživatele, objednávku — a vrací **ten
samý typ**, ne nějaký ořezaný. To je rozdíl proti `(polozky: { id: number }[])`,
kde bys přišel o všechny ostatní klíče.

:::check
Co vrátí `prvni<T>(pole: T[]): T | undefined` pro volání `prvni([])`? Napiš hodnotu.

### --expected--
undefined

### --why--
Prázdné pole nemá první prvek, takže `pole[0]` je `undefined`. Proto má funkce
v návratovém typu `| undefined` — jinak by lhala a volající by na výsledek sáhl
bez kontroly.
:::

## `keyof` a pomocné typy

`keyof` vyrobí sjednocení klíčů typu. Spolu s generikem z něj vznikne funkce,
která ví, jaký typ má která vlastnost:

```ts
type Hra = { id: number; nazev: string; cena: number };

// keyof Hra je 'id' | 'nazev' | 'cena'
function hodnota<T, K extends keyof T>(objekt: T, klic: K): T[K] {
  return objekt[klic];
}

const hra: Hra = { id: 1, nazev: 'Azul', cena: 999 };
const nazev = hodnota(hra, 'nazev'); // string
const cena = hodnota(hra, 'cena');   // number
```

Překlep v klíči (`hodnota(hra, 'nazvev')`) kontrola odmítne, protože `'nazvev'`
není v `keyof Hra`.

Na běžné úpravy typů má TypeScript hotové [[pomocný typ|pomocné typy]]
(*utility types*), které stojí za to znát:

| typ | co dělá | kdy se hodí |
|---|---|---|
| `Partial<T>` | všechny klíče volitelné | úprava záznamu, kde posíláš jen změny |
| `Required<T>` | všechny klíče povinné | opak `Partial` |
| `Pick<T, K>` | jen vyjmenované klíče | odlehčený tvar pro seznam |
| `Omit<T, K>` | všechny klíče kromě vyjmenovaných | záznam bez `id` před uložením |
| `Record<K, V>` | slovník klíč → hodnota | popisky stavů, ceníky |
| `ReturnType<F>` | návratový typ funkce | typ z cizí knihovny, který nejde naimportovat |

```ts
type NovaHra = Omit<Hra, 'id'>;              // { nazev: string; cena: number }
type Zmena = Partial<Hra>;                   // všechny klíče volitelné
type Ceny = Record<'maly' | 'velky', number>; // { maly: number; velky: number }
```

:::check
Napiš typ „hra bez klíče `id`" pomocí pomocného typu.

### --expected--
Omit<Hra, 'id'>

### --accept--
Omit<Hra, "id">

### --why--
`Omit<T, K>` udělá kopii typu bez vyjmenovaných klíčů. Opak je `Pick<Hra, 'nazev' | 'cena'>`,
který vyjmenuje ty, co zůstanou — u dvou klíčů je to jedno, u dvaceti ne.
:::

## Proč `as` lže

`as` (*type assertion*, přetypování) vypadá jako převod, ale žádný převod není.
Je to věta „věř mi, tohle je tenhle typ" — a TypeScript ti uvěří a přestane se
dívat:

:::live node predict
```js
const odpoved: unknown = { nazev: 'Azul', cena: '999' };

const hra = odpoved as { nazev: string; cena: number };

console.log(`${hra.nazev} stojí ${hra.cena.toFixed(0)} Kč`);
```
--question-- `npx tsc --noEmit` na tomhle souboru mlčí. Co vypíše `node hra.ts`?
--output--
```text
TypeError: hra.cena.toFixed is not a function
```
--why-- V `cena` je text `'999'`, a texty metodu `toFixed` nemají. `as` jen umlčelo kontrolu; hodnotu nezměnilo a nijak neověřilo. Chyba se tím nevyřešila, jen se přestěhovala z terminálu do provozu — a našel ji zákazník, ne ty.
:::

Zkus v ukázce vyměnit `as` za `if (jeHra(odpoved))` s vlastní kontrolou typu
a sleduj, že chyba zmizí ještě před spuštěním.

Kde `as` smysl dává: když o hodnotě víš prokazatelně víc než kontrola a ověřil
jsi to jinak (typicky po vlastním guardu nebo u `JSON.parse` dat, která jsi právě
zvalidoval). Všude jinde je `as` jen odložený problém — stejně jako vykřičník
`hra!.cena`, což je `as` v kratším kabátě.

:::explain
Vysvětli vlastními slovy rozdíl mezi zúžením podmínkou a přetypováním přes `as`.

## --model--
Podmínka se hodnoty opravdu zeptá — `typeof`, `in` nebo porovnání běží i za běhu,
takže když se spletu, program se chová podle skutečnosti. TypeScript z té
podmínky jen vyčte, co v té větvi platí. `as` naproti tomu žádný kód nevyrobí.
Je to jen tvrzení pro kontrolu, která se pak přestane ptát. Když se mýlím, nic mě
neopraví a chyba spadne až za běhu na nějaké metodě, která na hodnotě neexistuje.

## --checklist--
- Zúžení stojí na podmínce, která opravdu běží.
- Po zúžení se kód chová správně i tehdy, když data přijdou jiná.
- `as` je jen tvrzení pro kontrolu typů, za běhu po něm nic nezbude.
- Špatné `as` se projeví až za běhu, typicky `… is not a function`.
:::

## Typické chyby a pasti

> [!PITFALL] Zúžení se ztratí po `await` nebo ve vnořené funkci
> `if (hra) { … }` platí, jen dokud si TypeScript může být jistý, že se hodnota
> nezměnila. Uvnitř callbacku (`setTimeout(() => hra.nazev)`) nebo po `await`
> u vlastnosti objektu se zúžení zahodí a vrátí se
> `TS18048: 'hra' is possibly 'undefined'`.
> **Oprava:** ulož si zúženou hodnotu do lokální `const` (`const nalezena = hra;`)
> a pracuj s ní.

> [!PITFALL] `if (pocet)` vyhodí i nulu
> U `pocet?: number` je `if (pocet)` nepravdivé i pro `0`, takže nula propadne do
> větve „nic tu není". **Oprava:** `if (pocet !== undefined)`, u textů
> `if (text != null)`, nebo `pocet ?? 0`.

> [!PITFALL] `error TS2345: Argument of type 'X' is not assignable to parameter of type 'never'`
> Nejčastěji u `switch`e s `never`, kde chybí `case` — hláška jmenuje variantu,
> na kterou jsi zapomněl. Objeví se i u prázdného pole odvozeného jako `never[]`.
> **Oprava:** dopiš chybějící větev, u pole napiš typ (`const vybrane: Hra[] = []`).

> [!PITFALL] Generikum tam, kde stačí obyčejný typ
> `function vypis<T>(hodnota: T): void` nic nepřináší — `T` se nikde nepoužívá
> podruhé, takže by stačilo `unknown`. **Pravidlo:** generikum má smysl, jen když
> se typový parametr objeví **aspoň dvakrát** (v parametru a v návratové hodnotě,
> nebo ve dvou parametrech).

:::check
Proč se zúžení `if (objednavka.zakaznik) { … }` ztratí uvnitř `setTimeout(() => { … })`?

### --expected--
vlastnost se mezitím může změnit

### --accept--
callback běží později, hodnota už může být jiná
TypeScript si nemůže být jistý, že je pořád stejná

### --why--
Callback se spustí později a mezitím může kdokoli přepsat `objednavka.zakaznik`.
TypeScript proto zúžení vlastnosti do odložené funkce nepřenese. U lokální `const`
tenhle problém není — ta se změnit nedá, a tak zúžení platí i uvnitř.
:::

## Kde to najdeš v MDN

- [typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) —
  operátor, na kterém stojí většina zúžení; pozor na `typeof null === 'object'`.
- [Array.isArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray) —
  jediná spolehlivá kontrola pole.
- [in](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in) —
  operátor, kterým se zužují objekty podle klíče.
- [Nullish coalescing (`??`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) —
  náhrada za `||` tam, kde je `0` a `''` platná hodnota.

> [!NOTE]
> Generika, `keyof` a pomocné typy mají kapitoly v anglickém
> [TypeScript Handbooku](https://www.typescriptlang.org/docs/handbook/2/generics.html);
> úplný seznam pomocných typů je na stránce
> [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html).

V dalším modulu si zúžení a sjednocení vyzkoušíš na vlastní kůži: napíšeš
otypovaný systém událostí, kde posluchač dostane přesně ta data, která k dané
události patří.

# --questions--

## --question--

Máš `type Odpoved = { ok: true; data: Hra[] } | { ok: false; chyba: string }`.
Napiš podmínku, po které se dá sáhnout na `odpoved.data`.

### --expected--

odpoved.ok === true

### --accept--

if (odpoved.ok === true)
odpoved.ok
if (odpoved.ok)

### --why--

Rozlišovačem je tady klíč `ok` s literálovými typy `true` a `false`. Porovnáním
(nebo prostě pravdivostí) zúžíš sjednocení na jednu variantu a ta `data` má.

### --see--

nastroje-typescript/zuzovani-a-genericita#rozlisene-sjednoceni

## --question--

Funkce má vrátit poslední prvek libovolného pole se stejným typem, jaký mělo
pole. Který zápis je správný?

### --answer--

`function posledni(pole: any[]): any`

#### --why--

`any` kontrolu vypne — volající dostane hodnotu, se kterou smí cokoli, a chyba se
objeví až za běhu.

### --correct--

`function posledni<T>(pole: T[]): T | undefined`

#### --why--

Typový parametr `T` se dosadí podle argumentu, takže volající dostane zpátky
přesně typ svých dat. `| undefined` říká pravdu o prázdném poli.

### --answer--

`function posledni(pole: unknown[]): unknown`

#### --why--

Bezpečné to je, ale nepoužitelné: volající by musel výsledek pokaždé zužovat,
i když do funkce poslal pole čísel.

### --see--

nastroje-typescript/zuzovani-a-genericita#generika-typ-jako-parametr

## --question--

Napiš, jaký typ má proměnná `stav` ve větvi `default` vyčerpávajícího `switch`e,
kde jsou ošetřené všechny varianty sjednocení.

### --expected--

never

### --why--

Když žádná varianta nezbyla, je typ `never` — proto se do proměnné typu `never`
dá v té větvi přiřadit. Jakmile do sjednocení přibude varianta bez `case`,
přiřazení přestane procházet a kontrola ti tu chybějící větev ukáže.

### --see--

nastroje-typescript/zuzovani-a-genericita#vycerpavajici-switch-a-never

## --question--

Kolega opraví hlášku `'hra' is possibly 'undefined'` tak, že napíše
`(hra as Hra).cena`. Vysvětli jednou větou, proč to není oprava.

### --expected--

as jen vypne kontrolu, hodnota může být pořád undefined

### --accept--

as nic neověří, undefined tam zůstane
nezmění hodnotu, jen umlčí kontrolu

### --why--

`as` nevyrobí žádný kód, takže se za běhu nic neověří. Když `najdiHru` nic
nenajde, sáhne program na `undefined.cena` a spadne — jen o pár řádků dál, než
kde chyba vznikla.

### --see--

nastroje-typescript/zuzovani-a-genericita#proc-as-lze

## --question--

`Partial<Hra>` a `Pick<Hra, 'nazev'>` — který z nich použiješ pro funkci, která
mění jen některé vlastnosti hry?

### --expected--

Partial<Hra>

### --why--

`Partial<T>` udělá všechny klíče volitelné, takže smíš poslat jen ty, které se
mění. `Pick` naopak vybere pevnou podmnožinu klíčů a ty zůstanou povinné.

### --see--

nastroje-typescript/zuzovani-a-genericita#keyof-a-pomocne-typy
