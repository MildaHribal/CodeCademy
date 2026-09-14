# Mělká a hluboká kopie, JSON

:::check pretest
Co vypíše poslední řádek? Tipni si.

```js
const order = { id: 52, address: { city: 'Brno' } };
const copy = { ...order };
copy.address.city = 'Ostrava';
console.log(order.address.city);
```

### --answer--

`Brno`, protože `copy` je nový objekt.

#### --why--

Nový je jen vnější objekt. Co se stane s objekty uvnitř, ukáže první část lekce.

### --correct--

`Ostrava`

#### --why--

Spread zkopíroval jen první patro. Proč, uvidíš hned v první části.

### --answer--

`undefined`, protože spread vnořené objekty nezkopíruje.

#### --why--

Vnořený objekt v kopii je, jen se nekopíruje tak, jak by sis myslel. Víc v první části.
:::

:::check pretest
Objekt s datem převedeš na text přes `JSON.stringify` a zpátky přes `JSON.parse`. Co bude ve vlastnosti s datem?

### --answer--

Stejné datum jako předtím (`Date`).

#### --why--

JSON zná jen pár typů hodnot. Které to jsou, ukáže část o tom, co JSON ztratí.

### --correct--

Text s datem, třeba `'2026-09-14T08:00:00.000Z'`.

#### --why--

JSON datum neumí, `stringify` z něj udělá text a `parse` ho už nepozná. Podrobně v části o ztrátách.

### --answer--

`undefined`, vlastnost zmizí.

#### --why--

Zmizí jiné hodnoty, datum to není. Které přesně, ukáže část o ztrátách.
:::

Tlačítko **Zrušit změny** v nastavení, koncept e-mailu, uložení košíku do prohlížeče, poslání formuláře na server. Všude potřebuješ z dat udělat kopii nebo text, a pak z textu zase data. V minulé lekci jsi vytvořil nový objekt přes `{ ...obj }`. Jenže data z aplikací mají víc pater: profil s adresou, objednávka s položkami, nastavení se skupinami.

> [!REMEMBER]
> **Kopie je jen tak hluboká, kolik pater nových objektů vytvoří. Všechno pod tím zůstává sdílené.**

## Mělká kopie: spread a `Object.assign`

Spread `{ ...order }` vytvoří nový objekt a zkopíruje do něj vlastnosti. Když je hodnotou vlastnosti objekt, zkopíruje se **odkaz** na něj — přesně jako při `b = a`. Takové kopii se říká [[mělká kopie]] (*shallow copy*). Krokuj a sleduj šipky z obou objektů objednávky:

:::memory
```js
const order = { id: 52, address: { city: 'Brno' } };
const copy = { ...order };
copy.address.city = 'Ostrava';
```
--step-- 1 | objednávka a v ní odkaz na objekt adresy
order -> @order
@order: { id: 52, address: @address }
@address: { city: 'Brno' }
--step-- 2 | nový vnější objekt, ale address ukazuje na tutéž adresu
order -> @order
copy -> @copy
@order: { id: 52, address: @address }
@copy: { id: 52, address: @address }
@address: { city: 'Brno' }
--step-- 3 | změna přes kopii mění sdílenou adresu
order -> @order
copy -> @copy
@order: { id: 52, address: @address }
@copy: { id: 52, address: @address }
@address: { city: 'Ostrava' }
:::

Stejně mělce kopíruje starší `Object.assign(cíl, zdroj)`. Zkopíruje vlastnosti ze zdroje **do cíle** a cíl vrátí. Proto se píše s prázdným objektem na prvním místě:

:::live js predict
```js
const defaults = { theme: 'light', fontSize: 16 };
const saved = { theme: 'dark' };

const merged = Object.assign(defaults, saved);

console.log(defaults.theme, merged === defaults);
```
--question-- Co vypíše `console.log`? Napiš obě hodnoty oddělené mezerou.
--expected-- dark true
--why-- `Object.assign` zapisuje do svého prvního argumentu. Tady je jím `defaults`, takže výchozí nastavení se přepsalo a `merged` je tentýž objekt. Zkus první argument změnit na `{}` a pak `Object.assign({}, defaults, saved)` — `defaults` zůstane beze změny.
:::

Dnes místo `Object.assign({}, a, b)` většinou uvidíš kratší `{ ...a, ...b }`. Dělá totéž a nemá past s prvním argumentem.

:::check
Po kterém řádku se změní i objekt `user`? Na začátku platí `const user = { name: 'Eva', tags: ['admin'], address: { city: 'Zlín' } };` a `const copy = { ...user };`.

### --correct--

`copy.address.city = 'Kroměříž';`

#### --why--

`copy.address` je tentýž objekt jako `user.address`, protože spread zkopíroval jen odkaz.

### --answer--

`copy.name = 'Iva';`

#### --why--

`name` je vlastnost vnějšího objektu a ten je v kopii nový. Změní se jen `copy`.

### --answer--

`copy.address = { city: 'Kroměříž' };`

#### --why--

Tady se do vlastnosti kopie přiřadil nový objekt. `user.address` dál ukazuje na původní adresu.

### --see--

js-objekty/kopie-a-json#melka-kopie-spread-a-object-assign
:::

## Kopie po patrech

Když chceš změnit údaj ve vnořeném objektu, vytvoř nový objekt v každém patře, kterým k údaji procházíš. Ostatní patra nech sdílená — nemění se, tak nevadí.

:::live js
```js
const order = {
  id: 52,
  address: { city: 'Brno', zip: '602 00' },
  items: ['Klávesnice', 'Myš'],
};

const moved = {
  ...order,
  address: { ...order.address, city: 'Ostrava' },
};

console.log(order.address.city, moved.address.city);
console.log(order.address === moved.address, order.items === moved.items);
```
:::

Nový je vnější objekt a nová je adresa. Pole `items` se nezměnilo, a proto obě objednávky sdílejí totéž pole. Zkus do `moved` přidat `items: [...order.items, 'Podložka']` a sleduj poslední hodnotu.

:::memory
```js
const order = { id: 52, address: { city: 'Brno' }, items: ['Myš'] };
const moved = { ...order, address: { ...order.address, city: 'Ostrava' } };
```
--step-- 1
order -> @order
@order: { id: 52, address: @address, items: @items }
@address: { city: 'Brno' }
@items: ['Myš']
--step-- 2 | nové patro objednávky a nová adresa, pole items zůstalo sdílené
order -> @order
moved -> @moved
@order: { id: 52, address: @address, items: @items }
@moved: { id: 52, address: @address2, items: @items }
@address: { city: 'Brno' }
@address2: { city: 'Ostrava' }
@items: ['Myš']
:::

Tohle je nejčastější úprava dat v aplikacích. Změní se jen to, co se změnit má, a `===` u všech ostatních částí vrátí `true` — knihovny jako React podle toho poznají, co překreslit.

:::check
Profil `user` má vlastnost `preferences` s objektem `{ newsletter: true, language: 'cs' }`. Napiš výraz, který vrátí nový profil s `newsletter: false`, aniž by se změnil `user` nebo jeho `preferences`.

### --expected--

{ ...user, preferences: { ...user.preferences, newsletter: false } }

### --accept--

({ ...user, preferences: { ...user.preferences, newsletter: false } })

### --why--

Potřebuješ nový vnější objekt (`...user`) a nový objekt `preferences`, do kterého se zkopírují staré předvolby a `newsletter` se přepíše. Jen `{ ...user, newsletter: false }` by přidalo `newsletter` o patro výš.

### --see--

js-objekty/kopie-a-json#kopie-po-patrech
:::

## Hluboká kopie: `structuredClone`

Někdy potřebuješ kopii, kterou můžeš měnit libovolně hluboko — třeba koncept formuláře, který uživatel může celý zahodit. Na to je vestavěná funkce `structuredClone(hodnota)`. Vytvoří [[hluboká kopie|hlubokou kopii]] (*deep copy*): nové jsou všechny objekty ve všech patrech.

:::live js predict
```js
const settings = {
  notifications: { email: true, push: false },
  lastSynced: new Date('2026-09-14T08:00:00Z'),
};

const draft = structuredClone(settings);
draft.notifications.email = false;

console.log(settings.notifications.email, draft.lastSynced instanceof Date);
```
--question-- Co vypíše `console.log`? Napiš obě hodnoty oddělené mezerou.
--expected-- true true
--why-- `structuredClone` zkopírovala i vnořený objekt `notifications`, takže změna v konceptu originál nezasáhne. A datum zůstalo datem: `structuredClone` umí `Date`, `Map`, `Set` i objekty, které odkazují samy na sebe. Zkus místo `structuredClone(settings)` napsat `{ ...settings }` a sleduj první hodnotu.
:::

Co `structuredClone` neumí, jsou funkce. Objekt s metodou skončí chybou:

```text
DataCloneError: Failed to execute 'structuredClone' on 'Window': format(value) { … } could not be cloned.
```

A instance tříd se zkopírují jako obyčejné objekty bez svých metod — ke třídám se dostaneš v sekci Třídy, prototypy, Map a Set. Pro data, která aplikace ukládá a posílá (čísla, texty, pole, objekty, data), je `structuredClone` správná volba.

:::check
Uživatel otevře formulář s konceptem objednávky a může změnit cokoli, i adresu a položky. Tlačítko **Zahodit** musí vrátit původní objednávku. Kterou kopii na koncept použiješ?

### --answer--

`const draft = order;`

#### --why--

To není kopie, jen druhé jméno pro tutéž objednávku. Zahodit by nemělo co vrátit.

### --answer--

`const draft = { ...order };`

#### --why--

Mělká kopie: nový je jen vnější objekt. Změna adresy nebo položek by zasáhla i původní objednávku.

### --correct--

`const draft = structuredClone(order);`

#### --why--

Hluboká kopie vytvoří nové objekty ve všech patrech, takže koncept jde měnit libovolně a originál zůstane.

### --see--

js-objekty/kopie-a-json#hluboka-kopie-structuredclone
:::

## JSON: data jako text

Do `localStorage` v prohlížeči jde uložit jen text. Na server se data posílají jako text. Soubor s daty je text. Proto existuje [[JSON]] (*JavaScript Object Notation*): textový zápis objektů a polí, kterému rozumí skoro každý jazyk.

- `JSON.stringify(hodnota)` udělá z dat text,
- `JSON.parse(text)` udělá z textu zase data — **nové** objekty.

:::live js
```js
const cart = { items: [{ name: 'Kofola', count: 2 }], coupon: null };

const text = JSON.stringify(cart);
console.log(text);
console.log(typeof text);

localStorage.setItem('cart', text);
const restored = JSON.parse(localStorage.getItem('cart'));
console.log(restored.items[0].name, restored === cart);
```
:::

`localStorage` je úložiště prohlížeče, které přežije obnovení stránky; podrobně ho probere sekce DOM, události a prohlížeč. Zkus místo `JSON.stringify(cart)` uložit rovnou `cart` a sleduj, co přečteš zpátky.

JSON vypadá jako zápis objektu v JavaScriptu, ale je přísnější: klíče i texty musí být ve **dvojitých** uvozovkách, za poslední položkou nesmí být čárka a komentáře nejsou povolené.

```json
{ "name": "Kofola", "count": 2, "tags": ["nápoje"], "coupon": null }
```

`JSON.stringify` má ještě dva nepovinné argumenty. Druhý, *replacer*, určí, co se do textu dostane — třeba pole povolených klíčů. Třetí je odsazení, aby byl text čitelný:

:::live js
```js
const user = { name: 'Jana', email: 'jana@example.cz', token: 'x8f2k' };

console.log(JSON.stringify(user, ['name', 'email']));
console.log(JSON.stringify(user, null, 2));
```
:::

Zkus do pole v prvním výpisu přidat `'token'` a sleduj výsledek.

:::check
Proměnná `profile` obsahuje objekt. Napiš výraz, který ho uloží do `localStorage` pod klíčem `'profile'`.

### --expected--

localStorage.setItem('profile', JSON.stringify(profile))

### --why--

`localStorage` ukládá jen text, proto objekt nejdřív převedeš přes `JSON.stringify`. Bez něj by se uložil text `[object Object]`.

### --see--

js-objekty/kopie-a-json#json-data-jako-text
:::

## Co JSON ztratí

JSON umí jen texty, čísla, `true`/`false`, `null`, pole a obyčejné objekty. Všechno ostatní `JSON.stringify` převede, nebo potichu vynechá:

:::live js predict
```js
const event = {
  title: 'Koncert',
  date: new Date('2026-10-02T19:00:00Z'),
  price: NaN,
  note: undefined,
  format() { return 'x'; },
};

console.log(JSON.stringify(event));
```
--question-- Co vypíše `console.log`? Napiš text přesně tak, jak ho vypíše konzole.
--expected-- {"title":"Koncert","date":"2026-10-02T19:00:00.000Z","price":null}
--why-- Datum se převedlo na text, `NaN` na `null` a vlastnosti s `undefined` a s funkcí zmizely úplně. Zpátky přes `JSON.parse` už datum nedostaneš, bude to text. Zkus na konec přidat `console.log(JSON.parse(JSON.stringify(event)).date.getFullYear())` a přečti si chybu.
:::

| v objektu | po `JSON.stringify` | po `JSON.parse` zpátky |
|---|---|---|
| text, číslo, `true`/`false`, `null` | stejně | stejně |
| pole, obyčejný objekt | stejně | **nové** pole, nový objekt |
| `Date` | text `"2026-10-02T19:00:00.000Z"` | text, ne datum |
| `NaN`, `Infinity` | `null` | `null` |
| `undefined`, funkce | vlastnost zmizí (v poli `null`) | chybí |
| `Map`, `Set` | `{}` | prázdný objekt |

Proto `JSON.parse(JSON.stringify(data))` není univerzální hluboká kopie, i když ji tak uvidíš používat ve starším kódu. Funguje jen pro data bez `Date`, `undefined`, funkcí a speciálních hodnot jako `NaN`. Datum si po načtení obnovíš sám: `new Date(text)`.

:::check
Po načtení nastavení z JSON je v `settings.lastSynced` text `'2026-09-14T08:00:00.000Z'`. Napiš výraz, který z něj vytvoří zpátky datum.

### --expected--

new Date(settings.lastSynced)

### --why--

JSON datum uložil jako text ve formátu ISO a `new Date(text)` z takového textu datum postaví. Bez toho by volání metod data (`getFullYear`) spadlo na `is not a function`.

### --see--

js-objekty/kopie-a-json#co-json-ztrati
:::

:::explain
Vysvětli vlastními slovy, proč `JSON.parse(JSON.stringify(data))` není spolehlivá hluboká kopie a kdy místo ní použiješ `structuredClone`.

## --model--

JSON umí jen texty, čísla, booleany, `null`, pole a obyčejné objekty. Při převodu na text se datum změní na text, `undefined` a funkce zmizí a `NaN` se změní na `null`, takže kopie se od originálu liší. `structuredClone` kopíruje hodnoty přímo, bez převodu na text, a zachová i data, `Map` a `Set`. Na kopii dat proto použiju `structuredClone`, JSON jen tehdy, když data opravdu potřebuju jako text — k uložení nebo odeslání.

## --checklist--

- JSON zná jen texty, čísla, booleany, `null`, pole a obyčejné objekty.
- Datum se v JSON změní na text a zpátky datem nebude.
- `undefined` a funkce při převodu na JSON zmizí.
- `structuredClone` zachová datum, `Map` a `Set`, jen funkce kopírovat neumí.
- JSON je na uložení a posílání, `structuredClone` na kopii.
:::

## Bezpečné načtení JSON

Text, který čteš, nemusí být platný JSON: uživatel si ho mohl upravit, server vrátil chybovou stránku, nebo tam nic není. `JSON.parse` pak vyhodí chybu a zbytek kódu se nespustí.

```text
JSON.parse('')                 → SyntaxError: Unexpected end of JSON input
JSON.parse("{name: 'Jana'}")   → SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2)
JSON.parse('<!DOCTYPE html>')  → SyntaxError: Unexpected token '<', "<!DOCTYPE html>" is not valid JSON
```

Čtení, které smí selhat, obal do `try…catch`. Kód v `try` se zkusí, a když vyhodí chybu, spustí se `catch`. Podrobně chyby probere sekce Chyby a systematické ladění; tady stačí tenhle tvar:

:::live js
```js
function readSaved(key, fallback) {
  const text = localStorage.getItem(key);
  if (text === null) {
    return fallback;
  }
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

localStorage.setItem('cart', '{"items": [}');
console.log(readSaved('cart', { items: [] }));
console.log(readSaved('wishlist', { items: [] }));
```
:::

`localStorage.getItem` vrátí `null`, když pod klíčem nic není. Zkus do `setItem` dát platný JSON, třeba `'{"items": ["Kofola"]}'`, a sleduj první výpis.

> [!TIP]
> Chybu `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` uvidíš často, až budeš volat API: server místo JSON poslal HTML stránku (třeba 404). Chyba není v `JSON.parse`, ale v adrese nebo na serveru.

:::check
Co vrátí `JSON.parse(localStorage.getItem('theme'))`, když pod klíčem `'theme'` nic uložené není?

### --answer--

Vyhodí `SyntaxError`, protože text chybí.

#### --why--

`getItem` pro chybějící klíč nevrací prázdný text, vrací `null`. A s `null` si `JSON.parse` poradí.

### --correct--

`null`

#### --why--

`getItem` vrátí `null` a `JSON.parse(null)` ho převede na text `'null'`, což je platný JSON pro hodnotu `null`. Proto se chybějící záznam pozná podle `null`, ne podle chyby.

### --answer--

`undefined`

#### --why--

`undefined` v JSON vůbec neexistuje, takže ho `JSON.parse` vrátit nemůže. Rozmysli, co vrací `getItem` pro chybějící klíč.

### --see--

js-objekty/kopie-a-json#bezpecne-nacteni-json
:::

## Kterou kopii vybrat

| potřebuješ | použij | pozor |
|---|---|---|
| změnit jeden údaj v prvním patře | `{ ...obj, key: value }` | vnořené objekty jsou sdílené |
| změnit údaj ve vnořeném objektu | nový objekt v každém patře cesty | nezapomeň na žádné patro |
| kopii, kterou jde měnit libovolně hluboko | `structuredClone(obj)` | neumí funkce |
| data jako text (uložení, odeslání) | `JSON.stringify` / `JSON.parse` | datum → text, `undefined` a funkce zmizí |
| „kopii" | nikdy `const copy = obj` | to je jen druhý odkaz |

:::check
Napiš volání, které vytvoří hlubokou kopii objektu `invoice` včetně data vystavení (`Date`).

### --expected--

structuredClone(invoice)

### --why--

`structuredClone` zkopíruje všechna patra a datum nechá datem. Kopie přes JSON by z data udělala text, spread by nevytvořil nové vnořené objekty.

### --see--

js-objekty/kopie-a-json#kterou-kopii-vybrat
:::

## Typické chyby a pasti

### `Object.assign` do výchozích hodnot

> [!PITFALL]
> **`Object.assign(defaults, saved)` přepíše `defaults`.** Příznak: po načtení prvního uživatele mají všichni další jeho nastavení. Oprava: `{ ...defaults, ...saved }`, nebo `Object.assign({}, defaults, saved)`.

### Datum po JSON

> [!PITFALL]
> **Po `JSON.parse` je datum text.** Příznak: `TypeError: settings.lastSynced.getFullYear is not a function`, nebo rozdíl dvou dat (`b.lastSynced - a.lastSynced`) vyjde `NaN`. Oprava: po načtení `new Date(settings.lastSynced)`.

### Porovnání objektů přes JSON

Obsah dvou objektů se občas porovnává přes `JSON.stringify(a) === JSON.stringify(b)`. Má to háček:

:::live js predict
```js
const saved = { theme: 'dark', fontSize: 18 };
const current = { fontSize: 18, theme: 'dark' };

console.log(JSON.stringify(saved) === JSON.stringify(current));
```
--question-- Co vypíše `console.log`?
--expected-- false
--why-- Obsah je stejný, ale klíče vznikly v jiném pořadí, a `JSON.stringify` je vypíše v pořadí vzniku. Texty se proto liší. Porovnání přes JSON funguje, jen když oba objekty vznikly stejně, třeba jeden jako `structuredClone` druhého.
:::

> [!PITFALL]
> **Stejná data, jiné pořadí klíčů → různý JSON.** Příznak: aplikace hlásí „neuložené změny", i když se nic nezměnilo. Oprava: porovnej vlastnosti, na kterých záleží, nebo zajisti, že oba objekty vznikají ve stejném pořadí klíčů.

### `JSON.parse` bez ošetření

> [!PITFALL]
> **Rozbitý nebo prázdný text shodí celou stránku.** Příznak: `SyntaxError: Unexpected end of JSON input` a nic dalšího se nespustí. Oprava: čtení obal do `try…catch` a vrať náhradní hodnotu.

:::check
Kolegova funkce má vrátit nové nastavení: výchozí hodnoty přepsané uloženými. Po prvním zavolání ale začnou výchozí hodnoty vypadat jako uložené nastavení prvního uživatele. Co je špatně?

```js
const DEFAULTS = { theme: 'light', fontSize: 16 };

function withDefaults(saved) {
  return Object.assign(DEFAULTS, saved);
}
```

### --answer--

`Object.assign` vytváří hlubokou kopii a to je zbytečně pomalé.

#### --why--

`Object.assign` nekopíruje hluboko, ani mělce do nového objektu. Rozmysli, kam zapisuje.

### --correct--

`Object.assign` zapisuje do prvního argumentu, takže mění `DEFAULTS`.

#### --why--

První argument je cíl. Oprava: `Object.assign({}, DEFAULTS, saved)` nebo `{ ...DEFAULTS, ...saved }`.

### --answer--

Chybí `JSON.stringify`, bez něj se objekty nedají sloučit.

#### --why--

Slučování objektů s JSON nesouvisí. Problém je v tom, který objekt se při sloučení mění.

### --see--

js-objekty/kopie-a-json#object-assign-do-vychozich-hodnot
:::

Ve workshopu [Nastavení aplikace](see:js-objekty/workshop-nastaveni-aplikace) tohle všechno použiješ na panelu nastavení přehrávače podcastů: sloučení s výchozími hodnotami, uložení do JSON, koncept se Zrušit a datum, které přežije načtení.

## Kde to najdeš v MDN

- [structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone) — co umí zkopírovat a kdy vyhodí `DataCloneError`; odkaz na seznam podporovaných typů.
- [JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) — oddíly *replacer* a *space* a tabulka, co se stane s `undefined`, funkcemi a `NaN`.
- [JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) — kdy vyhodí `SyntaxError` a nepovinný argument *reviver*.
- [Deep copy](https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy) a [Shallow copy](https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy) — krátké definice obou kopií s příklady.

# --questions--

## --question--

Co vypíše poslední řádek?

```js
const menu = { day: 'pondělí', meals: { soup: 'Kulajda' } };
const tomorrow = structuredClone(menu);
tomorrow.meals.soup = 'Česnečka';
const today = { ...menu };
today.meals.soup = 'Gulášovka';

console.log(menu.meals.soup);
```

### --expected--

Gulášovka

### --accept--

'Gulášovka'

### --why--

`structuredClone` vytvořila nový objekt `meals`, takže `Česnečka` se zapsala jen do kopie. Spread v `today` ale zkopíroval jen odkaz na `menu.meals`, a zápis `Gulášovka` změnil i původní menu.

### --see--

js-objekty/kopie-a-json#hluboka-kopie-structuredclone

## --question--

Co vypíše tenhle kód?

```js
console.log(JSON.stringify({ city: 'Plzeň', zip: undefined, stars: [5, undefined] }));
```

### --expected--

{"city":"Plzeň","stars":[5,null]}

### --why--

Vlastnost s `undefined` z objektu zmizí. V poli ale místo zmizet nemůže, jinak by se posunuly indexy, a proto se tam z `undefined` stane `null`.

### --see--

js-objekty/kopie-a-json#co-json-ztrati

## --question--

Funkce `loadCart()` čte košík z `localStorage`. Když je uložený text poškozený, stránka zůstane bílá a v konzoli je `SyntaxError: Unexpected end of JSON input`. Jaká oprava je správná?

### --answer--

Uložit košík bez `JSON.stringify`, aby nebylo co parsovat.

#### --why--

`localStorage` ukládá jen text. Objekt bez převodu se uloží jako `[object Object]` a načtení bude rozbité vždycky.

### --correct--

Obalit `JSON.parse` do `try…catch` a při chybě vrátit prázdný košík.

#### --why--

Poškozený text se může objevit kdykoli. `try…catch` chybu zachytí a aplikace pokračuje s náhradní hodnotou.

### --answer--

Použít `structuredClone` místo `JSON.parse`.

#### --why--

`structuredClone` kopíruje hodnoty, text na data převádět neumí. Na text uložený v úložišti je potřeba `JSON.parse`.

### --see--

js-objekty/kopie-a-json#bezpecne-nacteni-json

## --question--

Napiš výraz, který z objektu `account` vytvoří JSON text jen s klíči `name` a `plan` (bez odsazení).

### --expected--

JSON.stringify(account, ['name', 'plan'])

### --accept--

JSON.stringify(account, ['plan', 'name'])

### --why--

Druhý argument `JSON.stringify` může být pole klíčů, které se do textu dostanou. Ostatní vlastnosti, třeba heslo nebo token, se vynechají.

### --see--

js-objekty/kopie-a-json#json-data-jako-text
