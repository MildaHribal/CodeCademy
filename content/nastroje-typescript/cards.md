## --card-- free

Jaký je rozdíl mezi typy `any` a `unknown`?

### --back--

Oba dovolují do proměnné uložit cokoliv. `any` ale vypíná typovou kontrolu – můžeš na něm volat neexistující metody a TypeScript tě nezastaví. Je to jako bys psal čistý JavaScript. `unknown` je bezpečnější alternativa. Než s hodnotou typu `unknown` můžeš cokoliv udělat (třeba zavolat metodu), musíš její typ napřed zúžit (např. pomocí `typeof` nebo validací v Zodu), abys TypeScriptu dokázal, že je to opravdu daný typ.

### --see--

nastroje-typescript/zakladni-typy

## --card-- free

Jaký je rozdíl mezi `type` (alias) a `interface` (rozhraní)?

### --back--

V 95 % případů dělají to samé a lze je zaměnit. `interface` je starší, umí popisovat jen objekty a lze ho dodatečně rozšiřovat (tzv. declaration merging). `type` je modernější a univerzálnější – kromě objektů s ním můžeš definovat i sjednocení (unions, např. `string | number`), literálové typy a složité pomocné typy. V běžném kódu je lepší vybrat si jeden a ten používat konzistentně.

### --see--

nastroje-typescript/zakladni-typy

## --card-- free

Proč bychom se měli vyhnout aserci typu (`data as User`) při čtení dat z vnějšího API?

### --back--

Aserce `as` umlčí překladač a vnutí mu typ naslepo, i když skutečná data mohou vypadat úplně jinak. Pokud API vrátí neočekávanou strukturu (třeba chybové HTML místo JSONu nebo objekt bez povinné vlastnosti), TypeScript o tom neví a kód spadne až za běhu někde hluboko v aplikaci. Místo `as` by se měla na hranici aplikace data vždy validovat za běhu (např. pomocí knihovny Zod).

### --see--

nastroje-typescript/validace-na-hranici

## --card-- free

Co je to rozlišené sjednocení (discriminated union) a k čemu slouží?

### --back--

Je to vzor, kdy spojíš více typů objektů do jednoho typu (sjednocení), přičemž všechny objekty sdílejí jednu společnou vlastnost (diskriminátor, často pojmenovanou `kind` nebo `type`). Pomocí této vlastnosti pak můžeš v kódu snadno zúžit typ objektu na jednu konkrétní variantu (např. v `switch` nebo `if`), a TypeScript díky tomu bezpečně nabídne jen ty vlastnosti, které daná varianta opravdu má.

### --see--

nastroje-typescript/zuzovani-a-genericita

## --card-- free

Proč používáme Zod na hranici programu, když už máme TypeScript?

### --back--

Typy z TypeScriptu existují jen v době vývoje. Při kompilaci do JavaScriptu se úplně odstraní (type erasure). Když ti z API, lokálního úložiště nebo z formuláře přijdou nějaká data, JavaScript vůbec neví, jaký typ mají. Zod je knihovna, která žije v JavaScriptu i za běhu – vezme neznámá data a fyzicky ověří, jestli mají požadovaný tvar. Zároveň z těchto schémat umí zpětně odvodit TypeScriptové typy (`z.infer`), takže nemusíš psát strukturu dvakrát.

### --see--

nastroje-typescript/validace-na-hranici

## --card-- free

Co znamená „zúžení typu“ (narrowing)?

### --back--

Když má proměnná příliš široký typ (např. `string | number` nebo `unknown`), TypeScript tě nenechá použít vlastnosti specifické jen pro jeden typ. Zúžení je proces, kdy pomocí podmínek v JavaScriptu (jako `typeof val === 'string'` nebo přes validátor) TypeScriptu dokážeš, co přesně v proměnné v dané větvi kódu je. TypeScript si tento zúžený typ pamatuje a povolí ti s ním dál bezpečně pracovat.

### --see--

nastroje-typescript/zuzovani-a-genericita

## --card-- free

Co jsou to generika (generics) a jaký problém řeší?

### --back--

Generika jsou jako „parametry pro typy“. Umožňují ti napsat funkci, třídu nebo typ, který dokáže pracovat s různými typy, ale stále zachovává typovou bezpečnost. Místo toho, abys všude psal zranitelné `any`, nadefinuješ si zástupný typ (často se označuje jako `T`), za který se při skutečném použití dosadí konkrétní typ (např. `Array<string>`, kde `string` se dosadil za `T`).

### --see--

nastroje-typescript/zuzovani-a-genericita

## --card-- free

Co vypíše tenhle kód?

```js
function print(val: string | number) {
  if (typeof val === 'string') {
    console.log(val.toUpperCase());
  } else {
    console.log(val.toFixed(2));
  }
}

print(4);
```

### --back--

4.00

TypeScript na základě zúžení pomocí `typeof` ví, že ve větvi `else` musí být hodnota typu `number`. Proto nám bezpečně povolí volat metodu `toFixed`. Zkompilovaný JavaScript se zachová přesně tak, jak ho TypeScript zkontroloval.

### --see--

nastroje-typescript/zuzovani-a-genericita

## --card-- free

Co vypíše tenhle kód?

```js
import { z } from 'zod';

const schema = z.object({ age: z.number() });
const result = schema.safeParse({ age: "25" });

console.log(result.success);
```

### --back--

false

`safeParse` nevyhazuje chybu (výjimku), ale vrací objekt s výsledkem. Protože jsme zadali věk jako text (`"25"`) místo požadovaného čísla (`number()`), validace selže a `success` bude nepravda. Bezpečně tak ošetříme špatná vstupní data.

### --see--

nastroje-typescript/validace-na-hranici

## --card-- free

Co vypíše tenhle kód?

```js
import { z } from 'zod';

const schema = z.object({ name: z.string() });
const result = schema.safeParse({ name: 'Bob', age: 30 });

console.log(result.success);
```

### --back--

true

Zod při validaci objektu projde deklarované vlastnosti a zkontroluje je. Volné vlastnosti navíc, které ve schématu nejsou specifikované (zde `age`), ve výchozím nastavení ignoruje a validací je propustí (zároveň je ale může v `result.data` odstranit). `success` je tedy pravda.

### --see--

nastroje-typescript/validace-na-hranici

## --card-- free

Co vypíše tenhle kód?

```js
type Shape = 
  | { kind: 'circle', radius: number } 
  | { kind: 'square', size: number };

function getArea(shape: Shape) {
  if (shape.kind === 'square') {
    return shape.size ** 2;
  }
  return Math.PI * shape.radius ** 2;
}

console.log(getArea({ kind: 'square', size: 10 }));
```

### --back--

100

Využili jsme rozlišené sjednocení. Kontrola `shape.kind === 'square'` zúží typ `Shape` pouze na čtverec a dovolí nám přistoupit k vlastnosti `size`. TypeScript díky tomu chápe, že při postupu za `if` už zbývá jen `circle`.

### --see--

nastroje-typescript/zuzovani-a-genericita

## --card-- free

Co vypíše tenhle kód?

```js
type User = {
  name: string;
  profile?: { age: number };
};

const u: User = { name: "Jan" };
console.log(u.profile?.age ?? 18);
```

### --back--

18

Vlastnost `profile` je volitelná (označená `?`), takže nemusí existovat. V objektu `u` ji nemáme. Výraz `u.profile?.age` (volitelné zřetězení) bezpečně vrátí `undefined`, místo aby vyhodil chybu. Operátor nulového sloučení `??` pak nastaví záložní hodnotu 18.

### --see--

nastroje-typescript/zakladni-typy

## --card-- free

Co vypíše tenhle kód?

```js
function wrap<T>(value: T): { item: T } {
  return { item: value };
}

const obj = wrap("ahoj");
console.log(obj.item.length);
```

### --back--

4

Tohle je síla generik a inference typu. Funkce `wrap` jako návratový typ deklarovala, že vrátí objekt obsahující položku předaného typu. Při volání `wrap("ahoj")` TypeScript odvodil, že `T` je `string`, takže ví, že `obj.item` je text, na kterém jde zavolat `.length`.

### --see--

nastroje-typescript/zuzovani-a-genericita

## --card-- free

Co vypíše tenhle kód?

```js
function logMessage(msg: string | null) {
  console.log(msg?.toUpperCase() ?? "PRÁZDNÉ");
}

logMessage(null);
```

### --back--

PRÁZDNÉ

Typ parametru je sjednocení (union) `string | null`. Operátor volitelného zřetězení `?.` se v případě hodnoty `null` zastaví a vrátí `undefined`. Poté se použije nulové sloučení `??` (reaguje na `null` i `undefined`), které vrátí pravou stranu, tedy `"PRÁZDNÉ"`.

### --see--

nastroje-typescript/zakladni-typy

## --card-- free

Co vypíše tenhle kód?

```js
const colors = ["red", "green", "blue"] as const;
console.log(colors[0]);
```

### --back--

red

Aserce `as const` řekne TypeScriptu, ať vytvoří co nejpřísnější typ (doslova readonly pole s těmito třemi přesnými literálovými typy), ne jen pole volných textů `string[]`. Za běhu se chová jako běžné neměnitelné pole a vypíše samozřejmě první prvek.

### --see--

nastroje-typescript/zakladni-typy

## --card-- free

Co vypíše tenhle kód?

```js
let score: unknown = 10;
if (typeof score === 'number') {
  score += 5;
}
console.log(score);
```

### --back--

15

Typ `unknown` blokuje jakékoli operace, protože kompilátor neví, co je hodnota zač. Teprve po použití `typeof score === 'number'` se typ úspěšně zúží na číslo a sčítání je dovoleno. V běhovém prostředí funguje ověření typu normálně jako v klasickém JavaScriptu.

### --see--

nastroje-typescript/zuzovani-a-genericita

## --card-- free

Co vypíše tenhle kód?

```js
import { z } from 'zod';

const idSchema = z.string().uuid();
const res = idSchema.safeParse(123);
console.log(res.success);
```

### --back--

false

Číslo `123` není ani text (`string`), natož pak platný formát UUID. Zod tohle odhalí v prvním kroku a validace skončí selháním, a proto nám bezpečně vrátí `false`.

### --see--

nastroje-typescript/validace-na-hranici

## --card-- free

Co vypíše tenhle kód?

```js
const config = {
  theme: "dark",
  timeout: 3000
};

console.log(Object.keys(config).length);
```

### --back--

2

Typový systém nijak nemění zažitou sadu vlastností a objektů JavaScriptu. Kód se jen zkompiluje a `Object.keys` funguje dál, vrátí tedy pole obsahující `'theme'` a `'timeout'` (délka 2).

### --see--

nastroje-typescript/zakladni-typy

## --card-- free

Co vypíše tenhle kód?

```js
type Role = 'admin' | 'user' | 'guest';

function getPrivilege(role: Role) {
  if (role === 'admin') return 'high';
  if (role === 'user') return 'medium';
  return 'low'; // tady už ví, že zbývá jen guest
}

console.log(getPrivilege('guest'));
```

### --back--

low

TypeScript provádí vyčerpávající kontrolu (exhaustiveness checking) – ví, jaké typy `Role` může obsahovat, a postupně je vyřazuje. Poté, co vyřadí `admin` a `user`, je jasné, že poslední varianta je jedině `guest`, i když to explicitně nekontrolujeme. 

### --see--

nastroje-typescript/zuzovani-a-genericita
