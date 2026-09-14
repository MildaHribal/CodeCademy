> [!REMEMBER]
> **Proměnná neobsahuje objekt, ale odkaz na něj.** Funkce, která dostane objekt, vrací nový a původní nechá být — v každém patře, které mění.

## Čtení a zápis

| zápis | co dělá |
|---|---|
| `product.price` | vlastnost, jejíž jméno znáš při psaní kódu |
| `product[field]` | vlastnost, jejíž jméno je v proměnné nebo s mezerou |
| `{ [field]: value }` | [[vypočítaný klíč]] při zakládání objektu |
| `{ name, level }` | zkrácený zápis `{ name: name, level: level }` |
| `order.delivery?.city ?? 'osobní odběr'` | čtení z hodnoty, která může chybět, s náhradou |
| `Object.hasOwn(obj, key)` | má objekt sám tenhle klíč? (hodnota nerozhoduje) |
| `key in obj` | je klíč v objektu **nebo zděděný**? (`'toString' in {}` je `true`) |

## Procházení

| volání | vrátí pro `{ kofola: 39, horalky: 22 }` |
|---|---|
| `Object.keys(obj)` | `['kofola', 'horalky']` |
| `Object.values(obj)` | `[39, 22]` |
| `Object.entries(obj)` | `[['kofola', 39], ['horalky', 22]]` |
| `Object.fromEntries(pairs)` | objekt z pole dvojic `[klíč, hodnota]` |

Klíče jako celá čísla jdou v pořadí první a vzestupně, ostatní v pořadí vzniku.

## Kterou kopii vybrat

| potřebuješ | použij | pozor |
|---|---|---|
| změnit údaj v prvním patře | `{ ...obj, key: value }` | vnořené objekty zůstanou sdílené |
| změnit údaj ve vnořeném objektu | nový objekt v každém patře cesty | nezapomeň na žádné patro |
| kopii, do které jde zapisovat všude | `structuredClone(obj)` | neumí funkce |
| data jako text (uložení, odeslání) | `JSON.stringify` / `JSON.parse` | datum → text, `undefined` a funkce zmizí |
| „kopii" | nikdy `const copy = obj` | to je jen druhý odkaz |

## Co přežije JSON

| v objektu | po `JSON.parse(JSON.stringify(…))` |
|---|---|
| text, číslo, `true`/`false`, `null`, pole, obyčejný objekt | stejné hodnoty, nové objekty |
| `Date` | text ve formátu ISO |
| `NaN`, `Infinity` | `null` |
| `undefined`, funkce | vlastnost zmizí (v poli `null`) |
| `Map`, `Set` | `{}` |

## Vzory

```js
// destrukturalizace: přejmenování, výchozí hodnota, zbytek, bezpečný parametr
const { user_name: username, job_title: headline = 'Vývojář' } = apiUser;
const { password, ...safeUser } = user;
function label({ name, unit = 'ks' } = {}) {}

// úprava bez mutace: první patro, vnořený objekt, klíč z proměnné, pole
const renamed = { ...ticket, owner: 'Klára' };
const moved = { ...order, address: { ...order.address, city: 'Ostrava' } };
const toggled = { ...settings, notifications: { ...settings.notifications, [name]: !settings.notifications[name] } };
const tagged = { ...post, tags: [...post.tags, 'akce'] };

// sloučení s výchozími hodnotami (pozdější vyhraje)
const merged = { ...DEFAULTS, ...saved, playback: { ...DEFAULTS.playback, ...saved.playback } };

// objekt → upravené dvojice → nový objekt
const pairs = [];
for (const [region, ms] of Object.entries(ping)) {
  pairs.push([region, `${ms} ms`]);
}
const labels = Object.fromEntries(pairs);

// uložení a bezpečné načtení
localStorage.setItem('settings', JSON.stringify(settings));
function readSaved(key, fallback) {
  const text = localStorage.getItem(key);
  if (text === null) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
```

## Pasti

| příznak | příčina | oprava |
|---|---|---|
| změnil se i originál, Zrušit nic nevrátí | `const draft = profile` nebo zápis do objektu z parametru | `{ ...profile, … }` |
| změnil se i vnořený objekt originálu | spread kopíruje jen první patro | nový objekt v každém patře, nebo `structuredClone` |
| hodnota roste s každým voláním | funkce mutuje vstup (`item.price = …`) | `return { ...item, price: … }` |
| výchozí hodnoty „zdědí" data prvního uživatele | `Object.assign(DEFAULTS, saved)` | `Object.assign({}, DEFAULTS, saved)` |
| `undefined` pro každý klíč | `obj.key` místo `obj[key]` | hranaté závorky |
| existující `0`, `''` nebo `false` se tváří jako chybějící | `if (obj.x)` | `Object.hasOwn(obj, 'x')` |
| `Cannot destructure property 'x' of 'undefined'` | destrukturalizace v parametru, funkce volaná bez argumentu | `({ x } = {})` |
| funkce vrací `undefined` místo objektu | `() => { name }` | `() => ({ name })` |
| `null` zůstal, výchozí hodnota nezabrala | výchozí hodnota zabere jen na `undefined` | `?? náhrada` |
| `getFullYear is not a function` po načtení | datum je po JSON text | `new Date(text)` |
| `SyntaxError: Unexpected end of JSON input` | `JSON.parse` prázdného nebo rozbitého textu | `try…catch` s náhradou |
| „neuložené změny", i když se nic nezměnilo | porovnání JSON s jiným pořadím klíčů | srovnat pořadí (sloučit s výchozím) nebo porovnat vlastnosti |
| `{ a: 1, b: 2 } === { a: 1, b: 2 }` je `false` | `===` porovnává identitu | porovnej vlastnosti |
| zmrazený objekt jde změnit | `Object.freeze` je mělké | zmraz i vnořené objekty |
