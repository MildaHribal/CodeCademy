# Validace na hranici

:::check pretest
```js
import { z } from 'zod';

const userSchema = z.object({
  jmeno: z.string(),
  vek: z.number().min(18)
});

const data = JSON.parse('{"jmeno": "Karel", "vek": 17}');
const result = userSchema.safeParse(data);
```
Co bude v `result.success`?

### --answer--
`true`

#### --why--
Data nejsou platná podle schématu, protože `vek` je menší než 18.

### --correct--
`false`

#### --why--
Věk 17 nesplňuje podmínku `min(18)`, takže validace selže a `success` bude `false`.

### --answer--
`undefined`

#### --why--
Zod metoda `safeParse` vždy vrací objekt s vlastností `success`, která je buď `true` nebo `false`.

### --answer--
Vyhodí to výjimku.

#### --why--
Metoda `safeParse` chyby pohlcuje. K vyhození výjimky by došlo při použití metody `parse`.
:::

TypeScript nás chrání jen ve chvíli, kdy píšeme kód a když se kód překládá. Jakmile se aplikace spustí (tzv. runtime), TypeScript už neexistuje – zbude jen čistý JavaScript. Pokud nám data přijdou zvenku (ze sítě přes `fetch`, z formuláře od uživatele, ze souboru přes `JSON.parse` nebo z proměnných prostředí), TypeScript neví, co v nich je. Musíme je proto **ověřit za běhu**.

> [!REMEMBER]
> Typy TypeScriptu (compile-time) zaručují, že **kód** používá data správně.
> Validace (runtime) zaručuje, že **data zvenku** odpovídají tomu, co kód očekává.
> Na hranici aplikace (tzv. boundary) musí proběhnout obojí.

## Proč TypeScript nestačí

Když stáhneme data přes `fetch` a převedeme je na JSON, TypeScript jim automaticky přiřadí typ `any` nebo `unknown`. Můžeme ho sice "donutit" věřit nám pomocí typové aserce (`as`), ale to je lhaní do kapsy:

```js
// Simulace dat z API
const apiResponse = '{"nazev": "Kofola", "cena": "45"}';

// Předstíráme, že víme, co přišlo (tzv. type assertion)
const produkt = JSON.parse(apiResponse); // v TS bychom napsali: as { nazev: string, cena: number }

// TypeScript by si myslel, že cena je číslo. Ve skutečnosti je to řetězec!
console.log(produkt.cena * 2); // Vypíše 90, protože JS se to pokusí přetypovat, ale u sčítání '45' + '45' dostaneme '4545'!
```

Když API změní formát dat (například místo ceny pošle objekt s měnou), naše aplikace spadne až někde hluboko uvnitř, kde to vůbec nečekáme, a chyba bude matoucí.

:::check
Proč TypeScript nedokáže zkontrolovat typ dat vrácených z `fetch`?

### --correct--
Protože TypeScript běží jen při překladu, ale `fetch` stahuje data až za chodu aplikace.

### --answer--
Protože `fetch` je zastaralá funkce a TypeScript plně podporuje jen Axios.

#### --why--
`fetch` je moderní standard a TypeScript ho plně podporuje, problém je čistě v rozdílu mezi překladem a během aplikace.

### --answer--
Protože odpověď z `fetch` je vždy typu `string`.

#### --why--
Z `fetch` získáváme objekt `Response` a data můžeme dekódovat jako JSON nebo jiný formát. Nejde vždy jen o řetězec.
:::

## Zod: Validace a typy v jednom

Abyste nemuseli psát složité `if` podmínky pro každou vlastnost, používají se validační knihovny. Nejpoužívanější v ekosystému TypeScriptu je **Zod**.

V Zodu definujete **schéma** dat, která očekáváte. Zod pak data zkontroluje za běhu a TypeScript si ze schématu umí odvodit typ pro překlad – nemusíte tak psát typy a validaci dvakrát.

```js
import { z } from 'zod';

// 1. Definujeme schéma (runtime validace)
const UzivatelSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'ctenar']),
  aktivni: z.boolean().default(true)
});

// V TypeScriptu byste si odvodili typ takto (compile-time typ):
// type Uzivatel = z.infer<typeof UzivatelSchema>;

// Data zvenku (např. z těla HTTP požadavku)
const neznamaData = {
  id: 42,
  email: "jan.novak@example.cz",
  role: "ctenar"
};

// 2. Validujeme
const uzivatel = UzivatelSchema.parse(neznamaData);
console.log("Validní data:", uzivatel);
```

### Zpracování chyb s `safeParse`

Funkce `.parse()` vyhodí výjimku, pokud data nesedí se schématem. To se hodí, když neplatná data znamenají kritický problém. Často ale chceme chyby hezky zachytit a vypsat je uživateli u příslušného políčka. K tomu slouží `.safeParse()`.

> [!PITFALL]
> Nikdy nepoužívejte `parse()` na nezabezpečený uživatelský vstup ve webovém frameworku (např. Express), pokud neobalíte volání do `try...catch`. Aplikace by jinak při špatných datech spadla.
> 
> **Místo toho použijte `safeParse()`:**
> Vrátí objekt, který má buď `success: true` a data, nebo `success: false` a chyby.

Zkuste si předpovědět, co se vypíše, když zadáme špatný e-mail a věk:

:::live node predict
```js
import { z } from 'zod';

const FormularSchema = z.object({
  email: z.string().email("Zadejte platný e-mail"),
  vek: z.number().min(15, "Musí vám být alespoň 15 let")
});

const spatnaData = {
  email: "jan.novak-zavinac-email.cz",
  vek: 12
};

const vysledek = FormularSchema.safeParse(spatnaData);

if (!vysledek.success) {
  // flatten() převede chyby do jednoduchého objektu
  const chyby = vysledek.error.flatten().fieldErrors;
  console.log("Chyby ve formuláři:", chyby);
} else {
  console.log("Vše v pořádku:", vysledek.data);
}
```
--question-- Co se vypíše do konzole?
--option-- Výjimka, aplikace spadne.
--option*-- Objekt se seznamem chyb u pole `email` a `vek`.
--option-- Vše v pořádku.
--output--
```text
Chyby ve formuláři: {
  email: [ 'Zadejte platný e-mail' ],
  vek: [ 'Musí vám být alespoň 15 let' ]
}
```
--why-- Validace neprojde pro obě pole. `safeParse` ale nevyhazuje výjimku, vrací objekt s chybami, a ty se pak naformátují pomocí `flatten().fieldErrors` do přehledného tvaru.
:::

Všimněte si, že metody jako `.email()` nebo `.min()` rovnou přijímají českou chybovou zprávu. Zod vám tak usnadní nejen validaci dat, ale i zobrazování srozumitelných chyb uživatelům.

:::check
Jaký je hlavní rozdíl mezi metodami `.parse()` a `.safeParse()` v knihovně Zod?

### --correct--
`.parse()` vyhazuje výjimku při neplatných datech, zatímco `.safeParse()` vrací objekt s informací o úspěchu a případnými chybami.

### --answer--
`.parse()` je pomalejší, protože provádí hlubokou kontrolu, zatímco `.safeParse()` kontroluje jen povrchově.

#### --why--
Ověřování dat probíhá u obou metod úplně stejně, rozdíl je jen ve formátu, kterým nahlásí chyby.

### --answer--
`.safeParse()` se používá jen pro primitivní typy (čísla, řetězce), `.parse()` se používá pro složité objekty.

#### --why--
Obě metody lze použít pro libovolně složité nebo jednoduché struktury.
:::

:::explain
Vysvětli vlastními slovy, proč `as Uzivatel` nad odpovědí z API není validace.

## --model--
Přetypování je **slib překladači**, ne kontrola dat. Říká jen „věř mi, že tohle má
tenhle tvar" — a od té chvíle s hodnotou zachází, jako by slib platil. Za běhu se
přitom nestane vůbec nic: `as` z výsledného JavaScriptu zmizí, takže když server pošle
`null` místo objektu nebo přejmenuje pole, kód to zjistí až na místě, kde hodnotu
použije, a spadne tam. Skutečná kontrola musí proběhnout **za běhu** — schématem, které
data projde a buď vrátí ověřenou hodnotu, nebo srozumitelně selže hned na hranici, kde
data do aplikace vstoupila.

## --checklist--
- Přetypování je slib překladači, ne kontrola hodnoty.
- Za běhu se z něj nezachová nic.
- Špatná data se projeví až na místě použití.
- Kontrola musí proběhnout za běhu, na hranici aplikace.
:::

## Kde to najdeš v MDN

V dokumentaci MDN se dočtete o funkcích na rozhraní vaší aplikace (`fetch`, `JSON.parse`), ale o samotné knihovně Zod tam nenajdete nic, protože je to externí balíček. Její výbornou dokumentaci najdete na oficiálním webu [zod.dev](https://zod.dev).

# --questions--

## --question--

Z jakého důvodu není bezpečné používat v TypeScriptu přetypování (`as Typ`) pro data vrácená z API volání? Vysvětli to vlastními slovy.

### --expected--

Typová aserce jen říká překladači, aby nám věřil, ale neověří data za běhu.

### --accept--

Za běhu se to neověří
Můžeme dostat jiná data a aplikace spadne

## --question--

Představte si, že načítáte konfiguraci z proměnných prostředí `process.env`. Proč je vhodné tyto proměnné na začátku spuštění aplikace zvalidovat pomocí Zodu?

### --correct--

Aby aplikace ihned po startu ohlásila problém (např. chybějící heslo) a nečekaně nespadla až později během provozu.

### --answer--

Protože `process.env` nepodporuje typ `string`.

#### --why--

`process.env` naopak podporuje výhradně jen textové řetězce.

### --answer--

Protože TypeScript sám proměnné prostředí zvaliduje, ale trvá mu to o dost déle.

#### --why--

TypeScript vůbec neví, jaké proměnné budou nastavené při spuštění, validovat je musí běžící kód.

## --question--

Jakou metodu byste v Zodu zavolali, pokud zpracováváte data od uživatele a místo vyhození výjimky chcete získat objekt, pomocí kterého uživateli zobrazíte chybové hlášky? Napište přesný název metody bez závorek.

### --expected--

safeParse
