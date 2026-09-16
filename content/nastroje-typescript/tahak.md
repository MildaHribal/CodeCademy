## Základní typy

| zápis | význam |
|---|---|
| `string`, `number`, `boolean` | základní primitivní typy |
| `string[]` nebo `Array<string>` | pole textových řetězců |
| `unknown` | bezpečná neznámá hodnota; před použitím se musí zúžit |
| `any` | vypíná typovou kontrolu (vyhýbej se mu) |
| `void` | funkce, která nic nevrací |
| `{ name: string, age?: number }` | objekt; otazník značí volitelnou vlastnost |

## Definice vlastních typů

```ts
// Alias typu (vhodné pro objekty i sjednocení)
type User = {
  id: number;
  name: string;
};

type Status = 'loading' | 'success' | 'error';

// Rozhraní (jen pro objekty)
interface Product {
  price: number;
}
```

## Zúžení typu (Narrowing)

Když proměnná může nabývat více typů (sjednocení, `unknown`), musíme její typ před použitím zúžit pomocí podmínek, kterým TypeScript rozumí.

| způsob zúžení | příklad | kdy použít |
|---|---|---|
| `typeof` | `if (typeof val === 'string')` | pro základní typy (`string`, `number`, `boolean`) |
| `Array.isArray` | `if (Array.isArray(val))` | pro pole |
| porovnání s `null` | `if (val !== null)` | pro odstranění `null` nebo `undefined` |
| `in` operátor | `if ('price' in val)` | ověření, že objekt má danou vlastnost |
| diskriminátor | `if (shape.kind === 'circle')` | u rozlišených sjednocení |

## Generika (Generics)

Parametry pro typy. Umožňují napsat kód, který funguje pro různé typy, ale zachová typovou bezpečnost.

```ts
// T je typový parametr (zástupce za skutečný typ, který se doplní při volání)
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}

const first = getFirst<number>([1, 2, 3]); // first je typu number | undefined
const firstStr = getFirst(['a', 'b']); // TypeScript odvodí T jako string
```

## Validace dat (Zod)

Typy TypeScriptu existují jen při vývoji a při překladu se odstraní. Pro ověření dat zvenčí (API, formuláře) za běhu používáme knihovnu jako Zod.

```ts
import { z } from 'zod';

// 1. Definice schématu
const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(18).optional()
});

// 2. Odvození TypeScript typu ze schématu (nemusíme ho psát dvakrát)
type User = z.infer<typeof UserSchema>;

// 3. Validace dat
const result = UserSchema.safeParse(dataFromApi);

if (result.success) {
  console.log(result.data.name); // data jsou bezpečně zadaná a odpovídají typu User
} else {
  console.error(result.error); // validační chyby
}
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| `Object is of type 'unknown'` | snažíš se použít proměnnou typu `unknown` bez zúžení | zúžit typ (např. pomocí `typeof` nebo validátoru) |
| `Property 'X' does not exist on type 'Y \| Z'` | snažíš se přistoupit k vlastnosti, která není u obou variant sjednocení | nejprve typ zuž pomocí podmínky |
| lživé aserce (`as User`) | naslepo věříš datům z API (`fetch(...).then(r => r.json() as Promise<User>)`) | použij validaci za běhu (Zod) |
| chybí volitelná vlastnost, ale chybu to nehlásí | u typů vytvořených přes `as` překladač nic nekontroluje | smaž `as` a nech typy odvodit, nebo přiřaď s explicitní anotací `const u: User = ...` |
