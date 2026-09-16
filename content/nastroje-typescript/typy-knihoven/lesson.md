# Typy knihoven a dlouhé hlášky

:::check pretest
Nainstaluješ knihovnu a editor ti u ní hned našeptává typy. Odkud je podle tebe vzal?

### --answer--
Vygeneroval si je z kódu knihovny.

#### --why--
To by trvalo dlouho a knihovna může být napsaná v obyčejném JavaScriptu bez typů, odkud už nic vygenerovat nejde.

### --correct--
Přečetl je ze souboru s příponou `.d.ts`, který má knihovna v balíčku.

#### --why--
Soubory `.d.ts` jsou definiční soubory, které říkají překladači tvar dat bez jejich implementace.

### --answer--
Stáhl si je z internetu při psaní.

#### --why--
Editor při psaní na síť nesahá. Typy musí být přítomné přímo ve složce `node_modules`.
:::

:::check pretest
Chybová hláška o typech má šest řádků, každý odsazenější než ten předchozí. Který řádek podle tebe říká, co je doopravdy špatně?

### --expected--
poslední

### --accept--
ten nejvíc odsazený
poslední řádek

### --why--
Poslední (nejhlouběji odsazený) řádek obsahuje skutečnou příčinu nesouladu (např. "string is not assignable to number"). Všechny řádky nad ním jen popisují, jak k ní kompilátor došel přes strukturu objektů.
:::

Vlastní typy jsi psal celý workshop. V práci ale devět z deseti typů, které
potkáš, napsal někdo jiný — jsou v knihovnách, které používáš. Když jim
nerozumíš, zůstaneš u našeptávání editoru, a jakmile se něco rozejde, dostaneš
hlášku na šest řádků, ve které je jedna věta důležitá a pět je cesta k ní.

Tahle lekce je o čtení cizích typů. Nic nového se v ní nepíše — učíš se dívat.

> [!REMEMBER]
> **Typy knihovny jsou obyčejný soubor, který si můžeš otevřít a přečíst.** Leží
> v `node_modules` vedle jejího kódu a končí příponou `.d.ts` — deklarace bez
> jediného řádku, který by něco dělal.

## Odkud se berou typy knihoven

Jsou dvě možnosti a poznáš je podle toho, jestli něco doinstaluješ:

1. **Knihovna si typy nese sama.** V balíčku je soubor `.d.ts` a v jejím
   `package.json` na něj vede klíč `types` (nebo `exports`). Tak to má dnes
   většina novějších knihoven — Zod, Vite, Drizzle i React Router. Nic
   neinstaluješ a všechno funguje.
2. **Typy dodává balíček `@types/…`.** Starší knihovny psané v JavaScriptu typy
   nemají; lidé je pro ně napsali zvlášť a vydávají je v balíčku `@types/jméno`
   (například `@types/express`). Instalují se jako vývojová závislost:
   `npm i -D @types/express`.

Zvláštní případ je běhové prostředí. `console`, `Map` nebo `fetch` zná TypeScript
sám. Ale `process`, `node:fs` a další věci z Node jsou v balíčku `@types/node`,
a ten si musíš přidat — jinak dostaneš:

```text
server.ts(3,13): error TS2591: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node` and then add 'node' to the types field in your tsconfig.
```

Hláška rovnou říká postup: doinstalovat balíček a zapsat `"types": ["node"]` do
`tsconfig.json`. Přesně proto ho máš v projektech téhle sekce.

:::check
Knihovna nemá typy a `npm i -D @types/jejijmeno` hlásí, že balíček neexistuje. Napiš, co z toho plyne o typech té knihovny.

### --expected--
nikdo je nenapsal

### --accept--
knihovna typy nemá a nikdo je nedodal
musíš si je napsat sám

### --why--
Balíčky `@types/…` píšou dobrovolníci do veřejného repozitáře DefinitelyTyped.
Když tam knihovna není a sama typy nemá, zbývá napsat si vlastní deklaraci —
nebo použít jinou knihovnu.
:::

## Jak číst `.d.ts`

Deklarační soubor (*declaration file*) je seznam toho, **co knihovna nabízí**,
bez jediného řádku implementace. Tohle je celý obsah typů knihovny `clsx`, která
skládá CSS třídy — reálný soubor, nezkrácený:

```ts
export type ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined;
export type ClassDictionary = Record<string, any>;
export type ClassArray = ClassValue[];

export function clsx(...inputs: ClassValue[]): string;
export default clsx;
```

Čte se to shora dolů jako slovník:

- `ClassValue` je sjednocení: knihovna bere text, číslo, `null`, `false`,
  objekt nebo pole — tedy skoro cokoli. Sjednocení odkazuje samo na sebe přes
  `ClassArray`, takže pole se smí vnořovat.
- `clsx` je funkce s libovolným počtem argumentů (`...inputs`) toho typu a vrací
  `string`. Tělo tam není a nemusí — tenhle soubor jen popisuje.

Do souboru se dostaneš z editoru: kurzor na jméno z knihovny a **Go to
Definition** (ve VS Code F12, nebo Ctrl a klik). Je to nejrychlejší způsob, jak
zjistit, co funkce doopravdy přijímá — rychlejší než hledat v dokumentaci.

> [!TIP]
> Když tě F12 vezme do `.d.ts` souboru a ty tam vidíš `declare`, `export declare`
> nebo `interface` bez těla metod, jsi na správném místě. Hledej řádek s funkcí,
> kterou voláš, a přečti si jen její závorky a návratový typ.

:::check
Podle typů výš: projde volání `clsx('karta', null, ['aktivni', false], { velka: true })`? Odpověz ano, nebo ne, a jedním důvodem.

### --expected--
ano

### --accept--
ano, všechny argumenty jsou ClassValue
ano, ClassValue povoluje text, null, pole i objekt

### --why--
Každý argument musí být `ClassValue`, a to je sjednocení textu, čísla, `null`,
pravdivostní hodnoty, objektu i pole dalších `ClassValue`. Všechny čtyři
argumenty tam patří, takže volání projde.
:::

## Generika v cizím API

U knihoven skoro vždycky narazíš na generika — právě proto, aby ti API vrátilo
typ **tvých** dat, ne nějaký obecný. Ze standardní knihovny to znáš, jen sis toho
nevšiml:

```ts
// Takhle je v typech popsaná metoda map:
// map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[]

const ceny = [999, 1290, 890];
const popisky = ceny.map((cena) => `${cena} Kč`); // string[]
```

`T` je typ prvku pole (tady `number`), `U` si TypeScript odvodí z toho, co vrací
tvůj callback (tady `string`). Proto je výsledek `string[]`, aniž bys cokoli
napsal.

U knihoven se stejným způsobem předává typ dovnitř. Zod ti třeba z schématu
odvodí typ, o kterém sám nic nevíš:

```ts
const Hra = z.object({ nazev: z.string(), cena: z.number() });
type Hra = z.infer<typeof Hra>; // { nazev: string; cena: number }
```

Když v dokumentaci vidíš zápis se špičatými závorkami, je to typový parametr,
který můžeš dosadit — a skoro vždycky ho psát nemusíš, protože se odvodí
z argumentů.

:::check
Proč `[1, 2, 3].map((cislo) => cislo > 1)` vrátí `boolean[]` a ne `number[]`?

### --expected--
callback vrací boolean

### --accept--
typ se odvodí z návratové hodnoty callbacku
U je boolean

### --why--
`map` má vlastní typový parametr pro **výstup**. Dosadí se z toho, co vrací tvůj
callback, takže pole vstupních čísel klidně vyjde jako pole pravdivostních hodnot.
:::

## Dlouhá hláška se čte odspodu

Tohle je ta věc, kvůli které lidé TypeScript vzdávají. Objednávka z formuláře má
cenu jako text a kontrola se ozve:

:::live node predict
```js
type Hra = { id: number; nazev: string; cena: number };
type Objednavka = { cislo: string; polozky: { hra: Hra; kusy: number }[] };

function ulozObjednavku(objednavka: Objednavka): void {
  console.log(objednavka.cislo);
}

const zFormulare = {
  cislo: '2026-0042',
  polozky: [{ hra: { id: 1, nazev: 'Azul', cena: '999' }, kusy: 2 }],
};

ulozObjednavku(zFormulare);
```
--question-- Kontrola vypíše šest řádků. Napiš jen ten poslední, nejvíc odsazený (bez odsazení).
--expected-- Type 'string' is not assignable to type 'number'.
--output--
```text
objednavka.ts(13,16): error TS2345: Argument of type '{ cislo: string; polozky: { hra: { id: number; nazev: string; cena: string; }; kusy: number; }[]; }' is not assignable to parameter of type 'Objednavka'.
  Types of property 'polozky' are incompatible.
    Type '{ hra: { id: number; nazev: string; cena: string; }; kusy: number; }[]' is not assignable to type '{ hra: Hra; kusy: number; }[]'.
      Type '{ hra: { id: number; nazev: string; cena: string; }; kusy: number; }' is not assignable to type '{ hra: Hra; kusy: number; }'.
        The types of 'hra.cena' are incompatible between these types.
          Type 'string' is not assignable to type 'number'.
```
--why-- Hláška je **cesta**, po které kontrola šla: celý argument → vlastnost `polozky` → prvek pole → vlastnost `hra.cena`. Každé odsazení je jeden krok hlouběji. První řádek proto vypadá děsivě (vypisuje celý tvar objektu), ale nic ti neřekne. Odspodu je to jednoduché: v `cena` je text, má tam být číslo.
:::

Zkus v ukázce opravit `'999'` na `999` a sleduj, jak z šesti řádků nezbyde ani jeden.

Postup, který funguje na každou dlouhou hlášku:

1. Přečti **poslední řádek** — tam je skutečná neshoda dvou typů.
2. Přečti **předposlední** — ten jmenuje vlastnost nebo cestu (`hra.cena`).
3. Teprve pak se podívej na **první řádek**: kód chyby (`TS2345` = špatný
   argument, `TS2322` = špatné přiřazení) a místo v souboru.
4. Střed hlášky přeskoč, je to jen cesta mezi tím.

> [!TIP]
> Kód chyby (`TS2345`) je nejrychlejší vyhledávací dotaz na světě. Vyhledávač na
> něj najde vysvětlení i s příklady, protože na stejnou hlášku už narazily
> tisíce lidí.

:::check
V hlášce je řádek `Types of property 'polozky' are incompatible.` uprostřed. Co s ním podle postupu uděláš?

### --answer--
Začnu u něj, protože jmenuje konkrétní vlastnost.

#### --why--
Jmenuje jen mezikrok cesty. Vlastnost, na které to opravdu drhne, je až na
předposledním řádku.

### --correct--
Přeskočím ho — je to jen mezikrok cesty k poslednímu řádku.

#### --why--
Střední řádky popisují, kudy kontrola šla dovnitř datové struktury. Důležité jsou
dva poslední.

### --answer--
Použiju ho jako důvod, proč přepsat typ `Objednavka`.

#### --why--
Typ `Objednavka` je nejspíš v pořádku. Rozchází se s ním hodnota, a to
v jediné vlastnosti.
:::

## Typ, který nejde naimportovat: `ReturnType` a `Parameters`

Občas chceš typ, který knihovna (nebo tvůj vlastní modul) neexportuje — je jen
návratovou hodnotou nějaké funkce. Nemusíš ho opisovat, dá se z funkce vytáhnout:

```ts
export function vytvorKosik(mena: string) {
  const polozky: Polozka[] = [];
  return {
    mena,
    polozky,
    pridej(nazev: string, kusy: number) {
      polozky.push({ nazev, kusy });
    },
  };
}

// Typ toho, co vytvorKosik vrací — bez jediného opsaného klíče.
export type Kosik = ReturnType<typeof vytvorKosik>;

// Typy parametrů jako n-tice: [mena: string]
export type ArgumentyKosiku = Parameters<typeof vytvorKosik>;
```

Všimni si `typeof` před jménem funkce. V typové části kódu `typeof vytvorKosik`
znamená „typ té funkce" — je to jiný `typeof` než ten, který znáš z běhu
programu, i když se píše stejně.

Když do takové proměnné pak zapomeneš něco dát, hláška ti to řekne přesně:

```text
kosik.ts(21,7): error TS2741: Property 'pridej' is missing in type '{ mena: string; polozky: never[]; }' but required in type '{ mena: string; polozky: Polozka[]; pridej(nazev: string, kusy: number): void; }'.
```

:::check
Napiš typ „to, co vrací funkce `nactiNastaveni`".

### --expected--
ReturnType<typeof nactiNastaveni>

### --why--
`ReturnType<F>` bere **typ funkce**, ne její jméno — proto se před jméno píše
`typeof`. Stejně se chová `Parameters<typeof funkce>` pro seznam parametrů.
:::

## Když typy chybí nebo lžou

Občas narazíš na knihovnu bez typů, nebo na typy, které neodpovídají skutečnosti
(knihovna se změnila a `@types` zaostávají). Máš tři možnosti, seřazené od
nejlepší po nejhorší:

1. **Napiš si vlastní deklaraci.** Do projektu přidáš soubor `typy.d.ts`
   a v něm popíšeš jen to, co z knihovny opravdu voláš:

   ```ts
   declare module 'stara-knihovna' {
     export function spocitej(vstup: number[]): number;
   }
   ```

2. **Ověř si hodnotu sám** a pak teprve typ potvrď — vlastní kontrolou typu
   z lekce [Zúžení typů a generika](see:nastroje-typescript/zuzovani-a-genericita#vlastni-kontrola-typu-type-guard),
   nebo schématem z příští lekce.
3. **Umlč kontrolu.** `// @ts-expect-error` nad řádkem (s komentářem proč) je
   přijatelné dočasné řešení — a navíc se samo ozve, až chyba zmizí. `@ts-ignore`
   nepoužívej: mlčí i tehdy, když už tam žádná chyba není, takže v kódu zůstane
   navždy.

:::check
Proč je `// @ts-expect-error` lepší než `// @ts-ignore`?

### --expected--
ozve se, až chyba zmizí

### --accept--
když už tam chyba není, kontrola to nahlásí
sám upozorní, že už není potřeba

### --why--
`@ts-expect-error` znamená „tady chybu čekám". Když ji knihovna opraví, kontrola
ohlásí `TS2578: Unused '@ts-expect-error' directive` a ty ten řádek smažeš.
`@ts-ignore` mlčí pořád — a nikdo se k němu už nikdy nevrátí.
:::

## Typické chyby a pasti

> [!PITFALL] `error TS7016: Could not find a declaration file for module 'jmeno'.`
> Knihovna typy nemá a `@types/jmeno` není nainstalovaný. **Oprava:**
> `npm i -D @types/jmeno`, a když balíček neexistuje, vlastní `declare module`.
> `as any` u importu je nejhorší z možností — vypne kontrolu celé knihovny.

> [!PITFALL] Typy z `@types` neodpovídají verzi knihovny
> `@types/…` se vydávají zvlášť, takže můžou zaostávat i předbíhat. Příznak:
> hláška tvrdí, že funkce nebere parametr, který podle dokumentace bere.
> **Oprava:** srovnej verze (často stačí `npm update @types/jmeno`) a podívej se
> přímo do `.d.ts`, co v něm doopravdy je.

> [!PITFALL] Hlášku čteš odshora a přepíšeš vlastní typ
> První řádek jmenuje celý typ, takže svádí k úpravě typu. V devíti případech
> z deseti je ale špatně **hodnota**, ne typ. **Oprava:** nejdřív poslední řádek,
> pak teprve rozhodnutí, co opravit.

> [!PITFALL] `interface` z knihovny rozšířený omylem
> Když napíšeš `interface Window { … }` ve svém souboru, **sloučí se** s tím
> z prohlížeče. Někdy je to záměr (globální proměnná), častěji překlep ve jméně.
> **Oprava:** vlastní typy pojmenuj jednoznačně a pro své tvary piš `type`.

:::check
Dostaneš `TS7016` u knihovny, kterou jsi právě nainstaloval. Co uděláš jako první?

### --expected--
zkusím doinstalovat @types

### --accept--
npm i -D @types/jmeno
podívám se, jestli existuje balíček @types

### --why--
`TS7016` znamená „tahle knihovna nemá deklaraci typů". Nejrychlejší cesta je
zkusit balíček `@types/jmeno`; teprve když neexistuje, píše se vlastní `declare
module`.
:::

## Kde to najdeš v MDN

- [Array.prototype.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) —
  podívej se na sekci „Syntax" a porovnej ji s typovým zápisem `map<U>(…): U[]`.
- [Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) —
  `...inputs`, které jsi viděl v typech `clsx`.
- [Node.js modules](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Node_server_without_framework) —
  připomenutí, odkud se balíčky v `node_modules` berou.

> [!NOTE]
> Deklarační soubory mají vlastní kapitolu v anglickém
> [TypeScript Handbooku](https://www.typescriptlang.org/docs/handbook/2/type-declarations.html),
> seznam balíčků `@types` je na [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
> a hledat se v něm dá přes [TypeSearch](https://www.typescriptlang.org/dt/search).

V další lekci uvidíš, proč ani dokonalé typy knihoven nestačí na data, která
přijdou zvenku — a co s tím.

# --questions--

## --question--

Napiš, co znamená přípona `.d.ts` u souboru v `node_modules`.

### --expected--

deklarace typů bez implementace

### --accept--

soubor s typy knihovny
popis typů, žádný kód

### --why--

Deklarační soubor popisuje, co knihovna nabízí, ale neobsahuje ani řádek, který
by se spustil. Editor i `tsc` z něj berou všechno, co o knihovně vědí.

### --see--

nastroje-typescript/typy-knihoven#jak-cist-d-ts

## --question--

Ve které části dlouhé typové hlášky najdeš konkrétní dvojici typů, které si
neodpovídají?

### --answer--

Na prvním řádku, hned za kódem chyby.

#### --why--

První řádek jmenuje celé typy obou stran — u vnořených dat je to nečitelná
změť, která neřekne, kde přesně to drhne.

### --correct--

Na posledním, nejvíc odsazeném řádku.

#### --why--

Každé odsazení je krok hlouběji do struktury. Na konci cesty stojí dvojice
primitivních typů, které se nepotkaly.

### --answer--

V řádku, který začíná `Types of property`.

#### --why--

Ten jmenuje vlastnost, přes kterou kontrola šla dál, ale samotná neshoda je ještě
níž.

### --see--

nastroje-typescript/typy-knihoven#dlouha-hlaska-se-cte-odspodu

## --question--

Funkce `vytvorKlienta(url: string)` vrací objekt, jehož typ modul neexportuje.
Napiš typ toho objektu.

### --expected--

ReturnType<typeof vytvorKlienta>

### --why--

`ReturnType<F>` vytáhne návratový typ z **typu funkce**, proto je před jménem
`typeof`. Typ se pak sám změní, když se změní funkce — což je přesně to, co chceš.

### --see--

nastroje-typescript/typy-knihoven#typ-ktery-nejde-naimportovat-returntype-a-parameters

## --question--

Kdy je `@types/node` v projektu potřeba?

### --answer--

Vždycky, `@types/node` popisuje samotný jazyk JavaScript.

#### --why--

Jazyk (pole, `Map`, `Promise`) zná TypeScript sám podle nastavení `target`.
Balíček popisuje něco jiného.

### --correct--

Když kód používá věci z Node — `process`, `node:fs`, `Buffer`.

#### --why--

Tyhle věci nejsou součástí jazyka, ale běhového prostředí. Bez balíčku na ně
dostaneš `TS2591: Cannot find name 'process'`.

### --answer--

Jen v projektech, které se překládají přes `tsc` do `.js`.

#### --why--

S překladem to nesouvisí. Rozhoduje, jestli kód sahá na Node API — i když ho
spouštíš přímo přes `node soubor.ts`.

### --see--

nastroje-typescript/typy-knihoven#odkud-se-berou-typy-knihoven
