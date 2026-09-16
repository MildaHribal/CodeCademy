---
pass: 0.8
---

# --questions--

## --question--

Co vypíše tento kód po spuštění v prohlížeči, pokud projde přes TypeScript beze změny (odstraněním typů)?

```ts
let price: number = 100;
price = "200" as any;
console.log(typeof price);
```

### --expected--

string

### --why--

Při překladu TypeScript jen odstraní typy a typové aserce (`as any`). Za běhu se přiřadí řetězec `"200"`, takže `typeof` v JavaScriptu vrátí `"string"`. TypeScript nemá na chování JavaScriptu za běhu žádný vliv.

## --question--

Jakým klíčovým slovem definuješ v TypeScriptu typ `User`, pokud chceš popsat tvar objektu? Můžeš použít dvě různé konstrukce. Napiš tu, která neobsahuje znak `=`.

### --expected--

interface

### --why--

`interface` se používá k popisu tvaru objektů a zapisuje se bez `=`. Například `interface User { name: string; }`. Druhá možnost je `type User = { name: string; }`.

## --question--

Máme funkci, která přijímá ID uživatele. Jak zapíšeš typ pro parametr `id`, který může být buď `number`, nebo `string`?

```ts
function getUser(id: _____) {
  // ...
}
```

### --expected--

number | string

### --why--

Sjednocení typů (union type) se zapisuje pomocí svislítka `|`. Znamená to, že hodnota může být jednoho nebo druhého typu.

## --question--

Máme pole s přesným počtem prvků různých typů (tzv. n-tici). Jaký je typ proměnné `row`?

```ts
const row: _____ = [1, "Karel", true];
```

### --expected--

[number, string, boolean]

### --why--

N-tice (tuple) se v TypeScriptu zapisuje jako pole typů, které přesně odpovídá pozicím prvků v poli.

## --question--

Jaký typ odvodí TypeScript pro proměnnou `status`?

```ts
const status = "success" as const;
```

### --expected--

"success"

### --why--

Konstrukce `as const` řekne překladači, aby odvodil co nejpřesnější literálový typ, a ne obecný `string`. Navíc pole nebo objekty by označil jako `readonly`.

## --question--

Jakou metodu ze Zod schématu zavoláš, abys bezpečně zvalidoval data a nedostal výjimku (error), pokud jsou data neplatná, ale naopak objekt s vlastností `success: false`?

```ts
const UserSchema = z.object({ name: z.string() });
const result = UserSchema._____(data);
```

### --expected--

safeParse

### --why--

Metoda `safeParse` nevhazuje výjimku, ale vrací objekt `{ success: true, data }` nebo `{ success: false, error }`. Metoda `parse` naopak při chybě vyhodí výjimku.

## --question--

Máme typ definovaný pomocí Zodu. Jaký Zod pomocník (helper) vytvoří TypeScriptový typ přímo ze Zod schématu, abys nemusel typ psát dvakrát?

```ts
const UserSchema = z.object({ age: z.number() });
type User = z._____<typeof UserSchema>;
```

### --expected--

infer

### --why--

Typ `z.infer<typeof Schema>` extrahuje TypeScriptový typ ze Zod schématu, což šetří duplikaci kódu.

## --question--

Který typ bys měl použít pro data z API, pokud ještě nevíš, jaký mají tvar, abys byl donucen je před použitím bezpečně zkontrolovat? (Nápověda: je bezpečnější než `any`.)

### --expected--

unknown

### --why--

Typ `unknown` funguje jako bezpečné `any`. Než začneš přistupovat k jeho vlastnostem, musíš typ zúžit (například ověřením přes `typeof`, `in` operátor nebo pomocí Zodu). Typ `any` by vypnul veškerou kontrolu, což je nebezpečné.

## --question--

Vyber správné tvrzení o kompilaci TypeScriptu do JavaScriptu.

### --answer--

TypeScriptový kód běží v prohlížeči rychleji než běžný JavaScript, protože obsahuje informace o typech, které enginu usnadní optimalizaci.

#### --why--

Běžné prohlížeče TypeScript nespustí. Kód se musí nejprve zkompilovat (transpilovat) do běžného JavaScriptu. V průběhu kompilace se informace o typech kompletně odstraní (tzv. type erasure), takže ve výsledném JavaScriptu žádné typy nejsou a na rychlost běhu nemají vliv.

### --answer--

Pokud narazí překladač (tsc) na typovou chybu, ihned zastaví kompilaci a výsledný `.js` soubor se vůbec nevytvoří.

#### --why--

Ve výchozím nastavení TypeScript zkompiluje kód do JavaScriptu i přes typové chyby (pokud ho nespustíš s flagem typu `noEmitOnError`). Cílem typové chyby je upozornit vývojáře, ale většinou nebrání vygenerování funkčního, i když potenciálně zranitelného, JS kódu.

### --correct--

Typové anotace (`: string`, `interface` atd.) v TypeScriptu nemají na výsledný spuštěný program žádný vliv, protože se při kompilaci úplně odstraní.

#### --why--

TypeScript používá takzvané "type erasure" – typy slouží čistě pro kontrolu kódu v editoru a při sestavování (build), ale do výsledného JavaScriptu se vůbec nepropíšou a nijak nemění chování programu za běhu.

## --question--

Máš zadaný tento kód:
```ts
function printId(id: number | string) {
  console.log(id.toUpperCase());
}
```
Proč na druhém řádku TypeScript nahlásí chybu?

### --answer--

Typ `number` se do funkce vůbec nesmí předat.

#### --why--

Do proměnné s typem `number | string` můžeme v pořádku předat jakékoliv číslo. Chyba je ale uvnitř funkce, kde se s proměnnou zachází nevhodně.

### --answer--

Sjednocení `number | string` musíme definovat samostatně přes `type` mimo funkci.

#### --why--

Typy pro sjednocení lze (a je naprosto běžné) zapisovat přímo do typových anotací. Samostatný `type` je fajn pro čitelnost u delších sjednocení, ale není vyžadován.

### --correct--

Snažíme se zavolat `.toUpperCase()`, což je metoda dostupná pouze na stringu, ale proměnná `id` může být i číslo. Musíme předtím typ zúžit.

#### --why--

Protože `id` může být i číslo (které nemá metodu `.toUpperCase()`), TypeScript nás nepustí ji zavolat, dokud si třeba podmínkou `if (typeof id === 'string')` neověříme, že právě pracujeme se stringem. Zabrání to chybě, ke které by jinak došlo za běhu.

## --question--

Jak funguje typování parametrů u arrow funkcí zapsaných uvnitř metod (např. při iteraci přes pole)?
```ts
const names = ['Alice', 'Bob', 'Cyril'];
names.forEach((name) => {
  console.log(name);
});
```

### --correct--

TypeScript odvodí typ parametru `name` sám (z kontextu volání nad polem řetězců), takže nemusíme psát `name: string`.

#### --why--

Tomuto principu se říká kontextové odvození (contextual typing). Když voláme `forEach` na poli typu `string[]`, TypeScript ví, že callback přijímá jako parametr pole `string`.

### --answer--

Parametr `name` má automaticky typ `any`, protože u callbacků TypeScript nedokáže odvozovat typy.

#### --why--

Naopak, u callback metod jako `forEach`, `map` nebo `filter` odvozuje překladač typy velmi spolehlivě z typu původního pole. `any` v tomto případě nenasadí.

### --answer--

Musíme explicitně zapsat `(name: string) => { ... }`, jinak nám TypeScript ohlásí chybu.

#### --why--

Díky kontextovému typování explicitní anotaci psát nemusíme. Bylo by to nadbytečné a přidávalo by to práci navíc (při změně typu pole na čísla bychom museli upravit všechny callbacky ručně).

## --question--

Jakým operátorem nejčastěji zužujeme typ u zjednodušených objektů, pokud potřebujeme rozlišit mezi více variantami ve sjednocení? (Máme "rozlišené sjednocení", tzv. discriminated union)
```ts
type Shape = 
  | { kind: "circle"; radius: number }
  | { kind: "square"; sideLength: number };

function getArea(shape: Shape) {
  // jak v podmínce zjistit, že jde o kruh?
}
```

### --answer--

Použijeme operátor `typeof shape === "circle"`.

#### --why--

`typeof` u všech objektů v JS vrátí řetězec `"object"`. Nelze pomocí něj tedy rozlišovat konkrétní varianty nebo tvary objektů, k tomu slouží porovnávání společných properties.

### --answer--

Použijeme konstrukci `if (shape as circle)`.

#### --why--

Typové aserce (`as`) se nesmí používat v podmínkách. Navíc se kompilací ztratí a nespustí žádný JS kód pro evaluaci podmínky. Je to čistě instruktáž kompilátoru, která za běhu "neexistuje".

### --correct--

Použijeme běžnou JS podmínku porovnávající unikátní společnou vlastnost: `if (shape.kind === "circle")`.

#### --why--

Jde o tzv. rozlišené sjednocení (discriminated union). Každá část sjednocení má odlišitelnou (literálovou) hodnotu u společné vlastnosti (`kind`). Kontrolou této vlastnosti může TypeScript přesně omezit typ v patřičné větvi programu.

# --code-- Stahování článků

## --file-- api.ts

```ts
import { z } from 'zod';

// 1. Zod schéma pro validaci jednoho článku
const ArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  published: z.boolean(),
  tags: z.array(z.string()).optional()
});

// 2. Extrahujeme TypeScriptový typ ze schématu
export type Article = z.infer<typeof ArticleSchema>;

// 3. Typ pro úspěšnou i chybovou odpověď naší asynchronní operace
type ApiResponse<T> = 
  | { status: "success"; data: T }
  | { status: "error"; errorMessage: string };

// 4. Samotná funkce na stažení
export async function fetchArticles(url: string): Promise<ApiResponse<Article[]>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { status: "error", errorMessage: `HTTP chyba: ${response.status}` };
    }
    
    const rawData: unknown = await response.json();
    
    // Zod schéma ověřuje formát dat a odstraňuje typ unknown
    const result = z.array(ArticleSchema).safeParse(rawData);
    
    if (result.success) {
      return { status: "success", data: result.data };
    } else {
      return { status: "error", errorMessage: "Data nemají správný formát" };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", errorMessage: error.message };
    }
    return { status: "error", errorMessage: "Neznámá chyba při stahování" };
  }
}
```

## --file-- app.ts

```ts
import { fetchArticles, Article } from './api';

async function displayLatestArticle() {
  const result = await fetchArticles('/api/latest');
  
  // Zúžení typu
  if (result.status === "error") {
    console.error("Selhalo to:", result.errorMessage);
    return;
  }
  
  // Nyní Typescript ví, že result.status === "success"
  const articles = result.data;
  
  if (articles.length === 0) {
    console.log("Žádné články nebyly nalezeny.");
    return;
  }
  
  console.log(`Načteno celkem ${articles.length} článků.`);
  
  // Zpracujeme seznam článků a vypíšeme pouze ty publikované
  const publishedArticles = articles.filter(article => article.published);
  console.log(`Z toho publikovaných: ${publishedArticles.length}`);
  
  // Vybereme nejnovější (první) článek z publikovaných
  if (publishedArticles.length === 0) {
    console.log("Nejsou k dispozici žádné publikované články.");
    return;
  }

  const first = publishedArticles[0];
  console.log(`Nejnovější: ${first.title}`);
  
  if (first.tags && first.tags.length > 0) {
    console.log(`Značky: ${first.tags.join(', ')}`);
  } else {
    console.log('Článek nemá žádné značky.');
  }
}
```

## --question--

Jakou výhodu přináší na řádku 28 v souboru `api.ts` přiřazení výsledku `response.json()` do proměnné s explicitním typem `unknown` místo ponechání výchozího `any`?

### --answer--

Díky explicitnímu `unknown` TypeScript automaticky převede JSON text do odpovídajícího formátu, aniž bychom museli použít metodu `.json()`. 

#### --why--

`unknown` nijak nezmění chování kódu za běhu ani nic samo nepřevede, typové anotace v TS žádnou akci nekonají. Slouží pouze k upozornění programátora, aby dodatečně vyřešil bezpečnost.

### --answer--

Snižuje se paměťová náročnost parsování, protože `unknown` říká Garbage Collectoru, že o datech zatím nic nevíme a může je agresivně čistit.

#### --why--

Typy z TypeScriptu se před kompilací úplně ztratí. V JavaScriptu, který pak běží, vůbec nejsou obsaženy a na běh enginu tak nemají dopad.

### --correct--

Zabrání nám, abychom k načteným datům rovnou přistupovali jako by už byla bezpečná. Nutí nás provést s nimi zúžení (například předat validátoru Zod).

#### --why--

Proměnná otypaná jako `unknown` nedovolí číst žádné své properties (např. `rawData.id`). Tímto způsobem nás TypeScript zastaví před naivním zpracováním stažených dat (což u `any` nehrozí, to nám projde cokoliv a k chybě by došlo ve chvíli, kdy struktura dat za běhu nesedí s našimi představami).

## --question--

Kde přesně ve funkci `fetchArticles` zajišťujeme, že data nebudou jen slepě přetypována (tzv. lhaní kompilátoru přes aserce), ale že skutečně za běhu dojde k ověření dat?

### --correct--

Při zavolání `z.array(ArticleSchema).safeParse(rawData)` na řádku 31.

#### --why--

Zod je knihovna, která kompilátorem neprochází beze stopy (jako typy), ale vykonává za běhu opravdový JavaScriptový kód. Zavoláním `safeParse` projde data iterací, prohledá vlastnosti a zjistí, zda je skutečně obsaženo přesně to, co v definici schématu vyžadujeme.

### --answer--

V definici `export type Article = z.infer<typeof ArticleSchema>` na řádku 12.

#### --why--

`infer` v Zodu pouze říká TypeScriptu v době kompilace, jak typ vypadá. Nemůže data chránit za běhu, protože zkompilovaný TypeScript všechny typy odhodí. Ochrana probíhá až přes `safeParse`.

### --answer--

V řádku 23, kde píšeme typ návratové hodnoty funkce jako `Promise<ApiResponse<Article[]>>`.

#### --why--

Typový podpis `Promise<ApiResponse<Article[]>>` popisuje API rozhraní pro vývojáře a napovídá v IDE, ale opět: jde o typovou anotaci, která se při transpilaci odstraní a za běhu JavaScript s daty v podstatě vůbec nesrovnává.

## --question--

V souboru `api.ts` je pomocný typ pro asynchronní chování sítě (typ `ApiResponse<T>`). Jak se říká mechanismu, který je aplikován na řádku 15?
```ts
type ApiResponse<T> = 
  | { status: "success"; data: T }
  | { status: "error"; errorMessage: string };
```

### --expected--

rozlišené sjednocení

### --why--

Jde o takzvané rozlišené sjednocení (discriminated union). Používá klíčový rozlišovací literál (v tomto případě vlastnost `status` s obsahem buď `"success"` nebo `"error"`). TypeScript dokáže po prověření této vlastnosti vyřadit ostatní typy sjednocení z cesty.

## --question--

Jakou vlastnost jsme v typu `ApiResponse<T>` definovali jako takzvané generikum?

### --expected--

T

### --why--

Značka `T` (nebo libovolný jiný název proměnné v lomených závorkách `<T>`) reprezentuje generický typ (generikum). Jde o flexibilní typ, za který doplníme reálný tvar, až ve chvíli, kdy `ApiResponse` potřebujeme k něčemu konkrétnímu použít. Zde ho využíváme u vlastnosti `data: T`.
