---
title: "Kontrolní bod: rezervace stolů"
runtime: react
timeoutMs: 12000
---

# --description--

## Zadání

Restaurace U Tří lip chce na web jednoduchou rezervaci stolů. Host si vybere
den, uvidí, které stoly jsou volné, klikne na jeden z nich a pošle rezervaci.
Mock API máš hotové v `api.js` — ptáš se ho stejně, jako by to byl skutečný
server: odpovídá se zpožděním, někdy vrátí chybu a pamatuje si, co jsi mu poslal.

Tohle je kontrolní bod celého Reactu. Nikdo ti neřekne, ze které lekce co vzít.
Budeš potřebovat trasy, data z API se stavy načítání a chyby, formulář
s validací a rozhodnutí, kde má který stav bydlet.

## Co je připravené

| soubor | co v něm je |
|---|---|
| `api.js` | `DATES`, `fetchTables(datum)`, `fetchTable(id, datum)`, `createReservation(data)` — hotové, needituj |
| `validation.js` | prázdná kostra `validateReservation` — tuhle funkci napíšeš |
| `App.jsx` | kostra s routerem a dvěma prázdnými komponentami |
| `styles.css` | hotový vzhled, počítá s třídami z tabulky níž |

> [!NOTE]
> Mock API má na **pondělí 5. října** poruchu a vždycky odpoví chybou. Je to
> schválně: potřebuješ mít na čem vyzkoušet chybový stav.

## Uživatelské příběhy

- Když host otevře stránku, uvidí, že se stoly načítají, a po chvilce seznam
  všech pěti stolů s názvem a počtem míst.
- Když je stůl na vybraný den zamluvený, pozná to na první pohled ze seznamu.
- Když host přepne den, seznam se srovná podle toho, co je volné zrovna tehdy.
- Když si host vybere den, prohlédne si stůl a vrátí se odkazem zpátky, zůstane
  vybraný ten den, který si zvolil — ne zase ten první.
- Když se stoly nepodaří načíst, uvidí host hlášku a tlačítko, kterým to zkusí
  znovu.
- Když host klikne na stůl, otevře se jeho detail s názvem, počtem míst
  a formulářem rezervace.
- Když je stůl na vybraný den už zabraný, detail to řekne a formulář vůbec
  nenabídne.
- Když host odešle formulář s chybami, uvidí u každého vadného pole českou větu,
  vyplněné hodnoty mu zůstanou a nic se neodešle.
- Když host používá čtečku obrazovky, u vadného pole slyší, že je vadné, a hned
  za ním hlášku, co má opravit.
- Když se rezervace odesílá, odesílací tlačítko nejde zmáčknout podruhé.
- Když rezervace projde, uvidí host potvrzení se svým jménem a názvem stolu
  a formulář zmizí.
- Když se host po rezervaci vrátí na seznam, je jeho stůl označený jako
  zamluvený.

## Technické požadavky

- **Vybraný den drž v adrese**, ne ve stavu komponenty — parametr `datum`.
  Odkaz na stůl i odkaz zpátky ho musí nést s sebou, jinak se poslední příběh
  o návratu rozbije.
- Rozhodnutí o platnosti dat patří do `validateReservation(data, mist)`
  v `validation.js`. Dostane objekt `{ guest, phone, people }` a počet míst
  u stolu, vrátí objekt chyb (klíč = jméno pole, hodnota = česká věta). Bez chyb
  vrací prázdný objekt. Pravidla:
  - `guest` — po oříznutí mezer aspoň dva znaky,
  - `phone` — po odstranění mezer devět až patnáct číslic, nepovinně s `+` na začátku,
  - `people` — celé číslo od 1 do počtu míst u stolu.
- Formulář má `noValidate` a žádné `required` — hlášky si píšeš sám.
- Číselné pole `people` nech prázdné; prázdné odeslání musí ohlásit chybu i u něj.

## Značky, podle kterých se to kontroluje

Vzhled, texty i rozvržení jsou tvoje věc, tyhle háčky ale musí sedět:

| co | zápis |
|---|---|
| tlačítko dne | `<button type="button" data-date="2026-10-03" aria-pressed={…}>` |
| stav načítání | prvek s `className="loading"` a `role="status"` |
| chyba načtení | prvek s `role="alert"` a vedle něj tlačítko s textem „Zkusit znovu" |
| seznam stolů | `<ul className="tables">`, v něm `<li>` na každý stůl |
| odkaz na stůl | `<Link>` uvnitř `<li>`, jeho text je název stolu |
| zamluvený stůl | uvnitř jeho `<li>` prvek s `className="taken"` |
| detail stolu | nadpis `<h2>` s názvem stolu |
| formulář | `<form className="reservation">` s poli `name="guest"`, `name="phone"`, `name="people"` |
| hláška u pole | prvek s `className="error"` a vlastním `id` |
| odkaz zpět | `<Link className="back">` |
| potvrzení | prvek s `className="done"` a `role="status"` |

# --hints--

Než dorazí data, je vidět stav načítání.

```js
const loading = document.querySelector('.loading');
assert.ok(loading, 'než dorazí odpověď API, má být na stránce prvek s className="loading"');
assert.equal(loading.getAttribute('role'), 'status', 'stav načítání má mít role="status", aby ho oznámila i čtečka obrazovky');
assert.ok(loading.textContent.trim().length > 3, 'stav načítání má obsahovat text, ne prázdný prvek');
```

Po načtení je v seznamu všech pět stolů s názvem a počtem míst.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
const items = [...document.querySelectorAll('.tables li')];
assert.equal(items.length, 5, 'v seznamu má být všech pět stolů z API');
const text = items.map((item) => item.textContent).join(' | ');
for (const name of ['U okna', 'Velký kulatý', 'U krbu', 'Na galerii', 'Salonek']) {
  assert.ok(text.includes(name), `v seznamu chybí stůl „${name}", je tam: ${text}`);
}
const round = items.find((item) => item.textContent.includes('Velký kulatý'));
assert.match(round.textContent, /6/, 'u stolu „Velký kulatý" má být vidět i počet míst (6)');
assert.ok(round.querySelector('a'), 'název stolu má být odkaz na jeho detail');
```

Zamluvený stůl je v seznamu poznat; volný ne.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
const items = [...document.querySelectorAll('.tables li')];
const round = items.find((item) => item.textContent.includes('Velký kulatý'));
const window_ = items.find((item) => item.textContent.includes('U okna'));
assert.ok(round.querySelector('.taken'), 'na 3. října je „Velký kulatý" zamluvený — jeho <li> má obsahovat prvek s className="taken"');
assert.ok(!window_.querySelector('.taken'), 'stůl „U okna" je na 3. října volný, značku taken mít nemá');
```

Přepnutí dne změní, které stoly jsou zamluvené.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
const day = document.querySelector('[data-date="2026-10-04"]');
assert.ok(day, 'na stránce má být tlačítko s data-date="2026-10-04"');
await helpers.click(day);
await helpers.waitFor(() => {
  const item = [...document.querySelectorAll('.tables li')].find((row) => row.textContent.includes('U okna'));
  return item && item.querySelector('.taken');
}, 4000);
const items = [...document.querySelectorAll('.tables li')];
assert.ok(items.find((item) => item.textContent.includes('U okna')).querySelector('.taken'), 'na 4. října je „U okna" zamluvený');
assert.ok(!items.find((item) => item.textContent.includes('Velký kulatý')).querySelector('.taken'), 'na 4. října je „Velký kulatý" naopak volný');
```

Vybraný den přežije cestu na detail stolu a zpátky.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
await helpers.click(document.querySelector('[data-date="2026-10-04"]'));
await helpers.waitFor(() => document.querySelector('[data-date="2026-10-04"]').getAttribute('aria-pressed') === 'true', 4000);
await helpers.waitFor(() => [...document.querySelectorAll('.tables li a')].some((item) => item.textContent.includes('Velký kulatý')), 4000);
const link = [...document.querySelectorAll('.tables li a')].find((item) => item.textContent.includes('Velký kulatý'));
await helpers.click(link);
await helpers.waitFor(() => document.querySelector('.back'), 4000);
await helpers.click(document.querySelector('.back'));
await helpers.waitFor(() => document.querySelector('[data-date="2026-10-04"]'), 4000);
const day = document.querySelector('[data-date="2026-10-04"]');
assert.equal(day.getAttribute('aria-pressed'), 'true', 'po návratu ze stolu má zůstat vybraný 4. říjen — vybraný den drž v adrese, ne v useState');
```

Když se stoly nepodaří načíst, je vidět hláška a tlačítko na další pokus.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
await helpers.click(document.querySelector('[data-date="2026-10-05"]'));
await helpers.waitFor(() => document.querySelector('[role="alert"]'), 4000);
const alert = document.querySelector('[role="alert"]');
assert.ok(alert.textContent.trim().length > 5, 'chybový stav má obsahovat českou hlášku, ne prázdný prvek');
const again = [...document.querySelectorAll('button')].find((button) => /zkusit znovu/i.test(button.textContent));
assert.ok(again, 'u chybové hlášky má být tlačítko „Zkusit znovu"');
assert.equal(document.querySelectorAll('.tables li').length, 0, 'při chybě se nemá ukazovat starý seznam stolů');
```

Kliknutí na stůl otevře jeho detail s formulářem rezervace.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
const link = [...document.querySelectorAll('.tables li a')].find((item) => item.textContent.includes('U krbu'));
await helpers.click(link);
await helpers.waitFor(() => document.querySelector('form.reservation'), 4000);
const heading = [...document.querySelectorAll('h2')].map((item) => item.textContent).join(' | ');
assert.ok(heading.includes('U krbu'), `na detailu má být nadpis h2 s názvem stolu, je tam: ${heading}`);
const form = document.querySelector('form.reservation');
for (const name of ['guest', 'phone', 'people']) {
  assert.ok(form.querySelector(`[name="${name}"]`), `ve formuláři chybí pole s name="${name}"`);
}
```

Detail zamluveného stolu formulář nenabídne.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
const link = [...document.querySelectorAll('.tables li a')].find((item) => item.textContent.includes('Velký kulatý'));
await helpers.click(link);
await helpers.waitFor(() => document.querySelector('.back'), 4000);
await helpers.waitFor(() => !document.querySelector('.loading'), 4000);
assert.equal(document.querySelector('form.reservation'), null, 'u stolu, který je na vybraný den zamluvený, se formulář ukazovat nemá');
assert.match(document.body.textContent, /zabran|zamluv|obsazen/i, 'detail zamluveného stolu má hostovi říct, že je stůl na ten den pryč');
```

`validateReservation` odmítne prázdná data a pustí platná.

```js
const { validateReservation } = await helpers.importFile('validation.js');
const empty = validateReservation({ guest: '', phone: '', people: Number('') }, 4);
for (const field of ['guest', 'phone', 'people']) {
  assert.equal(typeof empty[field], 'string', `validateReservation má u prázdných dat vrátit českou větu pod klíčem ${field}`);
  assert.ok(empty[field].trim().length > 5, `hláška u pole ${field} má být věta, ne jedno slovo`);
}
const ok = validateReservation({ guest: 'Eva Novotná', phone: '777 123 456', people: 2 }, 4);
assert.deepEqual(ok, {}, 'u platných dat má validateReservation vrátit prázdný objekt');
```

`validateReservation` hlídá jméno, telefon i počet hostů proti kapacitě stolu.

```js
const { validateReservation } = await helpers.importFile('validation.js');
const base = { guest: 'Eva Novotná', phone: '777123456', people: 2 };
assert.notEqual(validateReservation({ ...base, guest: 'E' }, 4).guest, undefined, 'jméno o jednom znaku má být chyba');
assert.notEqual(validateReservation({ ...base, guest: '   ' }, 4).guest, undefined, 'jméno ze samých mezer má být chyba');
assert.notEqual(validateReservation({ ...base, phone: '12345' }, 4).phone, undefined, 'telefon o pěti číslicích má být chyba');
assert.notEqual(validateReservation({ ...base, phone: 'zavolejte mi' }, 4).phone, undefined, 'telefon bez číslic má být chyba');
assert.equal(validateReservation({ ...base, phone: '+420 777 123 456' }, 4).phone, undefined, 'telefon s předvolbou a mezerami má projít');
assert.notEqual(validateReservation({ ...base, people: 0 }, 4).people, undefined, 'nula hostů má být chyba');
assert.notEqual(validateReservation({ ...base, people: 5 }, 4).people, undefined, 'pět hostů u stolu pro čtyři má být chyba');
assert.notEqual(validateReservation({ ...base, people: 2.5 }, 4).people, undefined, 'necelý počet hostů má být chyba');
assert.equal(validateReservation({ ...base, people: 4 }, 4).people, undefined, 'čtyři hosté u stolu pro čtyři jsou v pořádku');
```

Odeslání prázdného formuláře ukáže hlášku u každého vadného pole a nic neodešle.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
await helpers.click([...document.querySelectorAll('.tables li a')].find((item) => item.textContent.includes('U krbu')));
await helpers.waitFor(() => document.querySelector('form.reservation'), 4000);
await helpers.submit(document.querySelector('form.reservation'));
await helpers.flush();
await helpers.waitFor(() => document.querySelectorAll('form.reservation .error').length >= 3, 3000).catch(() => {});
assert.ok(document.querySelectorAll('form.reservation .error').length >= 3, 'u prázdného formuláře mají hlášku dostat všechna tři pole (formulář má mít noValidate a hlášky si vykresluješ sám)');
assert.equal(document.querySelector('.done'), null, 'prázdný formulář se odesílat nemá');
```

Vadné pole je označené i pro čtečku obrazovky.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
await helpers.click([...document.querySelectorAll('.tables li a')].find((item) => item.textContent.includes('U krbu')));
await helpers.waitFor(() => document.querySelector('form.reservation'), 4000);
await helpers.submit(document.querySelector('form.reservation'));
await helpers.waitFor(() => document.querySelectorAll('form.reservation .error').length >= 3, 3000).catch(() => {});
const field = document.querySelector('form.reservation [name="guest"]');
assert.equal(field.getAttribute('aria-invalid'), 'true', 'vadné pole guest má mít aria-invalid="true"');
const describedBy = field.getAttribute('aria-describedby');
assert.ok(describedBy, 'vadné pole guest má přes aria-describedby ukazovat na svou hlášku');
const message = document.getElementById(describedBy.split(/\s+/)[0]);
assert.ok(message, `aria-describedby pole guest ukazuje na id „${describedBy}", ale takový prvek na stránce není`);
assert.ok(message.textContent.trim().length > 5, 'prvek, na který ukazuje aria-describedby, má obsahovat hlášku');
```

Po neúspěšném odeslání zůstanou vyplněné hodnoty v polích.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
await helpers.click([...document.querySelectorAll('.tables li a')].find((item) => item.textContent.includes('U krbu')));
await helpers.waitFor(() => document.querySelector('form.reservation'), 4000);
await helpers.type(document.querySelector('[name="guest"]'), 'Eva Novotná');
await helpers.submit(document.querySelector('form.reservation'));
await helpers.waitFor(() => document.querySelectorAll('form.reservation .error').length >= 2, 3000).catch(() => {});
assert.equal(document.querySelector('[name="guest"]').value, 'Eva Novotná', 'po odeslání s chybou nemá host psát jméno znovu');
```

Během odesílání nejde tlačítko zmáčknout podruhé.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
await helpers.click([...document.querySelectorAll('.tables li a')].find((item) => item.textContent.includes('U krbu')));
await helpers.waitFor(() => document.querySelector('form.reservation'), 4000);
await helpers.type(document.querySelector('[name="guest"]'), 'Eva Novotná');
await helpers.type(document.querySelector('[name="phone"]'), '777123456');
await helpers.type(document.querySelector('[name="people"]'), '3');
await helpers.submit(document.querySelector('form.reservation'));
await helpers.flush();
const button = document.querySelector('form.reservation button[type="submit"], form.reservation button:not([type])');
assert.ok(button, 'formulář má mít odesílací tlačítko');
assert.equal(button.disabled, true, 'během odesílání má být odesílací tlačítko zablokované, aby rezervace neodešla dvakrát');
```

Po úspěšné rezervaci je vidět potvrzení se jménem hosta a formulář zmizí.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
await helpers.click([...document.querySelectorAll('.tables li a')].find((item) => item.textContent.includes('U krbu')));
await helpers.waitFor(() => document.querySelector('form.reservation'), 4000);
await helpers.type(document.querySelector('[name="guest"]'), 'Eva Novotná');
await helpers.type(document.querySelector('[name="phone"]'), '777123456');
await helpers.type(document.querySelector('[name="people"]'), '3');
await helpers.submit(document.querySelector('form.reservation'));
await helpers.waitFor(() => document.querySelector('.done'), 4000);
const done = document.querySelector('.done');
assert.equal(done.getAttribute('role'), 'status', 'potvrzení má mít role="status", ať ho čtečka oznámí sama');
assert.match(done.textContent, /Eva Novotná/, 'potvrzení má obsahovat jméno hosta');
assert.match(done.textContent, /U krbu/, 'potvrzení má obsahovat název stolu');
assert.equal(document.querySelector('form.reservation'), null, 'po odeslání se formulář ukazovat nemá');
```

Po návratu na seznam je rezervovaný stůl označený jako zamluvený.

```js
await helpers.waitFor(() => document.querySelectorAll('.tables li').length === 5, 4000);
await helpers.click([...document.querySelectorAll('.tables li a')].find((item) => item.textContent.includes('U krbu')));
await helpers.waitFor(() => document.querySelector('form.reservation'), 4000);
await helpers.type(document.querySelector('[name="guest"]'), 'Eva Novotná');
await helpers.type(document.querySelector('[name="phone"]'), '777123456');
await helpers.type(document.querySelector('[name="people"]'), '3');
await helpers.submit(document.querySelector('form.reservation'));
await helpers.waitFor(() => document.querySelector('.done'), 4000);
await helpers.click(document.querySelector('.back'));
await helpers.waitFor(() => {
  const row = [...document.querySelectorAll('.tables li')].find((item) => item.textContent.includes('U krbu'));
  return row && row.querySelector('.taken');
}, 4000).catch(() => {});
const fire = [...document.querySelectorAll('.tables li')].find((item) => item.textContent.includes('U krbu'));
assert.ok(fire, 'po kliknutí na odkaz zpět má být zase vidět seznam stolů');
assert.ok(fire.querySelector('.taken'), 'po rezervaci má být „U krbu" v seznamu označený jako zamluvený — po úspěšné mutaci se data musí načíst znovu');
```

# --seed--

## --file-- App.jsx

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router';
import './styles.css';

function TableList() {
  return (
    <section className="panel">
      <h2>Volné stoly</h2>
    </section>
  );
}

function TableDetail() {
  return (
    <section className="panel">
      <h2>Detail stolu</h2>
    </section>
  );
}

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <header className="head">
          <h1>U Tří lip</h1>
          <p>Rezervace stolů</p>
        </header>
        <main className="wrap">
          <Routes>
            <Route path="/" element={<TableList />} />
            <Route path="/stul/:id" element={<TableDetail />} />
          </Routes>
        </main>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
```

## --file-- validation.js

```js
/**
 * Zkontroluje data rezervace.
 * @param {{ guest: string, phone: string, people: number }} data
 * @param {number} seats  počet míst u stolu
 * @returns {Record<string, string>} chyby podle jména pole; prázdný objekt = vše v pořádku
 */
export function validateReservation(data, seats) {
}
```

## --file-- api.js

```js
const TABLES = [
  { id: 1, name: 'U okna', seats: 2, note: 'Výhled do zahrady, nejtišší místo v podniku.' },
  { id: 2, name: 'Velký kulatý', seats: 6, note: 'Uprostřed sálu, hodí se na oslavu.' },
  { id: 3, name: 'U krbu', seats: 4, note: 'V zimě nejteplejší, v létě nejžádanější.' },
  { id: 4, name: 'Na galerii', seats: 4, note: 'Po schodech, bez výtahu.' },
  { id: 5, name: 'Salonek', seats: 10, note: 'Oddělená místnost s vlastním vchodem.' },
];

export const DATES = [
  { value: '2026-10-03', label: 'so 3. října' },
  { value: '2026-10-04', label: 'ne 4. října' },
  { value: '2026-10-05', label: 'po 5. října' },
];

const booked = new Map([
  ['2026-10-03', new Set([2])],
  ['2026-10-04', new Set([1, 4])],
]);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function bookedFor(date) {
  if (!booked.has(date)) booked.set(date, new Set());
  return booked.get(date);
}

/** Vrátí všechny stoly s příznakem, jestli jsou na daný den volné. */
export async function fetchTables(date) {
  await wait(400);
  if (date === '2026-10-05') throw new Error('Rezervační systém neodpovídá. Zkus to prosím za chvíli znovu.');
  const busy = bookedFor(date);
  return TABLES.map((table) => ({ ...table, free: !busy.has(table.id) }));
}

/** Vrátí jeden stůl s příznakem volna, nebo null, když takový stůl není. */
export async function fetchTable(id, date) {
  await wait(300);
  const table = TABLES.find((item) => item.id === Number(id));
  if (!table) return null;
  return { ...table, free: !bookedFor(date).has(table.id) };
}

/** Uloží rezervaci. Zabraný stůl odmítne. */
export async function createReservation({ tableId, date, guest, phone, people }) {
  await wait(400);
  const busy = bookedFor(date);
  if (busy.has(Number(tableId))) throw new Error('Stůl už je mezitím zabraný.');
  busy.add(Number(tableId));
  return { id: `${date}-${tableId}`, tableId: Number(tableId), date, guest, phone, people };
}
```

## --file-- styles.css

```css
:root {
  --page: #f6f3ee;
  --surface: #ffffff;
  --text: #24201c;
  --muted: #7c7166;
  --line: #e6dfd5;
  --brand: #8a5a2b;
  --brand-dark: #6b4520;
  --bad: #b3261e;
  --good: #2f7d4f;
  --radius: 14px;
}

* { box-sizing: border-box; }

body { margin: 0; font: 16px/1.6 system-ui, -apple-system, sans-serif; background: var(--page); color: var(--text); }

.head { padding: 24px 20px 8px; max-width: 560px; margin: 0 auto; }
.head h1 { margin: 0; font-size: 1.7rem; letter-spacing: -0.02em; }
.head p { margin: 2px 0 0; color: var(--muted); }

.wrap { max-width: 560px; margin: 0 auto; padding: 12px 20px 60px; }

.panel { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; }
.panel h2 { margin: 0 0 14px; font-size: 1.15rem; }

.dates { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.date { border: 1px solid var(--line); background: var(--surface); border-radius: 999px; padding: 6px 14px; font: inherit; color: inherit; cursor: pointer; transition: background 150ms ease, color 150ms ease; }
.date:hover { background: #f1ece4; }
.date:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.date[aria-pressed='true'] { background: var(--brand); border-color: var(--brand); color: #fff; }

.loading { margin: 0; color: var(--muted); }
[role='alert'] { margin: 0 0 10px; color: var(--bad); }

.tables { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.tables li { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; }
.tables a { color: var(--brand-dark); font-weight: 600; text-decoration: none; }
.tables a:hover { text-decoration: underline; }
.tables .seats { color: var(--muted); font-size: 0.9rem; }
.tables .taken { margin-left: auto; padding: 2px 10px; border-radius: 999px; background: #f3e7e6; color: var(--bad); font-size: 0.82rem; }

.note { color: var(--muted); }
.back { display: inline-block; margin-top: 16px; color: var(--brand-dark); }

.reservation { display: grid; gap: 14px; margin-top: 16px; }
.field { display: grid; gap: 4px; }
.field label { font-size: 0.9rem; color: var(--muted); }
.field input { padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); font: inherit; color: inherit; }
.field input:focus-visible { outline: 2px solid var(--brand); outline-offset: 1px; }
.field [aria-invalid='true'] { border-color: var(--bad); }
.error { margin: 0; color: var(--bad); font-size: 0.88rem; }

.reservation button {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  padding: 11px 22px;
  background: var(--brand);
  color: #fff;
  font: inherit;
  cursor: pointer;
  transition: background 150ms ease;
}
.reservation button:hover:enabled { background: var(--brand-dark); }
.reservation button:disabled { opacity: 0.6; cursor: default; }

.done { margin: 16px 0 0; padding: 16px; border: 1px solid var(--good); border-radius: 12px; color: var(--good); font-weight: 600; }
```

# --solution--

## --file-- validation.js

```js
const PHONE = /^\+?\d{9,15}$/;

/**
 * Zkontroluje data rezervace.
 * @param {{ guest: string, phone: string, people: number }} data
 * @param {number} seats  počet míst u stolu
 * @returns {Record<string, string>} chyby podle jména pole; prázdný objekt = vše v pořádku
 */
export function validateReservation(data, seats) {
  const errors = {};

  if (String(data.guest ?? '').trim().length < 2) {
    errors.guest = 'Napiš prosím jméno, na které stůl zapíšeme.';
  }

  if (!PHONE.test(String(data.phone ?? '').replace(/\s/g, ''))) {
    errors.phone = 'Telefon zapiš jako devět číslic, klidně s předvolbou +420.';
  }

  if (!Number.isInteger(data.people) || data.people < 1) {
    errors.people = 'Napiš, kolik vás přijde — aspoň jeden host.';
  } else if (data.people > seats) {
    errors.people = `U tohohle stolu je nejvýš ${seats} míst.`;
  }

  return errors;
}
```

## --file-- App.jsx

```jsx
import { useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, MemoryRouter, Route, Routes, useParams, useSearchParams } from 'react-router';
import { DATES, createReservation, fetchTable, fetchTables } from './api';
import { validateReservation } from './validation';
import './styles.css';

function useSelectedDate() {
  const [params, setParams] = useSearchParams();
  const date = params.get('datum') ?? DATES[0].value;
  return [date, (value) => setParams({ datum: value })];
}

function DatePicker({ date, onChange }) {
  return (
    <div className="dates">
      {DATES.map((day) => (
        <button
          key={day.value}
          type="button"
          className="date"
          data-date={day.value}
          aria-pressed={day.value === date}
          onClick={() => onChange(day.value)}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}

function TableList() {
  const [date, setDate] = useSelectedDate();
  const { data: tables, isPending, isError, error, refetch } = useQuery({
    queryKey: ['tables', date],
    queryFn: () => fetchTables(date),
  });

  return (
    <section className="panel">
      <h2>Volné stoly</h2>
      <DatePicker date={date} onChange={setDate} />

      {isPending && <p className="loading" role="status">Načítám volné stoly…</p>}

      {isError && (
        <div>
          <p role="alert">{error.message}</p>
          <button type="button" className="date" onClick={() => refetch()}>Zkusit znovu</button>
        </div>
      )}

      {tables && (
        <ul className="tables">
          {tables.map((table) => (
            <li key={table.id}>
              <Link to={`/stul/${table.id}?datum=${date}`}>{table.name}</Link>
              <span className="seats">{table.seats} míst</span>
              {!table.free && <span className="taken">zamluveno</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReservationForm({ table, date }) {
  const [errors, setErrors] = useState({});
  const [reservation, setReservation] = useState(null);
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: createReservation,
    onSuccess: (saved) => {
      setReservation(saved);
      client.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = {
      guest: String(form.get('guest') ?? ''),
      phone: String(form.get('phone') ?? ''),
      people: Number(form.get('people')),
    };

    const found = validateReservation(data, table.seats);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    mutation.mutate({ tableId: table.id, date, ...data });
  }

  if (reservation) {
    return (
      <p className="done" role="status">
        Rezervace přijata: {reservation.guest}, stůl {table.name}, {reservation.people} hostů.
      </p>
    );
  }

  const fields = [
    { name: 'guest', label: 'Jméno a příjmení', type: 'text' },
    { name: 'phone', label: 'Telefon', type: 'tel' },
    { name: 'people', label: 'Počet hostů', type: 'number' },
  ];

  return (
    <form className="reservation" noValidate onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div className="field" key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            aria-invalid={errors[field.name] ? 'true' : undefined}
            aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
          />
          {errors[field.name] && (
            <p className="error" id={`${field.name}-error`}>{errors[field.name]}</p>
          )}
        </div>
      ))}

      {mutation.isError && <p role="alert">{mutation.error.message}</p>}

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Odesílám…' : 'Rezervovat stůl'}
      </button>
    </form>
  );
}

function TableDetail() {
  const { id } = useParams();
  const [date] = useSelectedDate();
  const { data: table, isPending } = useQuery({
    queryKey: ['table', id, date],
    queryFn: () => fetchTable(id, date),
  });

  if (isPending) return <section className="panel"><p className="loading" role="status">Načítám stůl…</p></section>;

  if (!table) {
    return (
      <section className="panel">
        <h2>Takový stůl tu není</h2>
        <Link className="back" to={`/?datum=${date}`}>Zpět na seznam</Link>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>{table.name}</h2>
      <p className="note">{table.seats} míst. {table.note}</p>

      {table.free
        ? <ReservationForm table={table} date={date} />
        : <p role="alert">Tenhle stůl je na vybraný den už zabraný. Vyber jiný den nebo jiný stůl.</p>}

      <Link className="back" to={`/?datum=${date}`}>Zpět na seznam</Link>
    </section>
  );
}

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <header className="head">
          <h1>U Tří lip</h1>
          <p>Rezervace stolů</p>
        </header>
        <main className="wrap">
          <Routes>
            <Route path="/" element={<TableList />} />
            <Route path="/stul/:id" element={<TableDetail />} />
          </Routes>
        </main>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
```

# --explain--

Vysvětli, proč vybraný den patří do adresy, a ne do `useState` v komponentě
seznamu.

## --model--

Komponenta seznamu se při odchodu na detail stolu odmontuje a při návratu
vznikne znovu, takže `useState` v ní začne zase od výchozí hodnoty — vybraný den
by se ztratil. Adresa je naproti tomu jediné místo, které přežije přechod mezi
trasami i obnovení stránky, a dá se poslat odkazem: kolega dostane přesně ten
den, který jsem viděl já. Navíc funguje tlačítko Zpět tak, jak uživatel čeká.
Kdybych hodnotu držel na obou místech, rozejdou se a v rozhraní bude zvýrazněný
jiný den, než podle kterého se načítají data.

## --checklist--

- Komponenta se při přechodu na jinou trasu odmontuje a stav v ní zmizí.
- Adresa přechod mezi trasami i obnovení stránky přežije.
- Odkaz s parametrem se dá poslat někomu jinému.
- Dvě kopie téže hodnoty se dřív nebo později rozejdou.

# --approaches--

## --approach-- Bez knihovny na dotazy

Totéž se dá napsat i ručně přes `useEffect` a `useState`. Uvidíš na tom, kolik
práce knihovna dělá za tebe: tři stavy na jedno načtení, hlídání zastaralé
odpovědi přes `ignore` a ruční znovunačtení po rezervaci. Za jednu obrazovku to
ještě jde; za pět už ne.

### --file-- validation.js

```js
const PHONE = /^\+?\d{9,15}$/;

export function validateReservation(data, seats) {
  const errors = {};

  if (String(data.guest ?? '').trim().length < 2) {
    errors.guest = 'Napiš prosím jméno, na které stůl zapíšeme.';
  }

  if (!PHONE.test(String(data.phone ?? '').replace(/\s/g, ''))) {
    errors.phone = 'Telefon zapiš jako devět číslic, klidně s předvolbou +420.';
  }

  if (!Number.isInteger(data.people) || data.people < 1) {
    errors.people = 'Napiš, kolik vás přijde — aspoň jeden host.';
  } else if (data.people > seats) {
    errors.people = `U tohohle stolu je nejvýš ${seats} míst.`;
  }

  return errors;
}
```

### --file-- App.jsx

```jsx
import { useEffect, useState } from 'react';
import { Link, MemoryRouter, Route, Routes, useParams, useSearchParams } from 'react-router';
import { DATES, createReservation, fetchTable, fetchTables } from './api';
import { validateReservation } from './validation';
import './styles.css';

function useSelectedDate() {
  const [params, setParams] = useSearchParams();
  const date = params.get('datum') ?? DATES[0].value;
  return [date, (value) => setParams({ datum: value })];
}

/** Načte data a pohlídá, že pozdní odpověď nepřepíše novější. */
function useLoad(load, deps) {
  const [state, setState] = useState({ status: 'pending', data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState({ status: 'pending', data: null, error: null });
    load()
      .then((data) => { if (!ignore) setState({ status: 'done', data, error: null }); })
      .catch((error) => { if (!ignore) setState({ status: 'error', data: null, error }); });
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  return { ...state, reload: () => setAttempt((value) => value + 1) };
}

function DatePicker({ date, onChange }) {
  return (
    <div className="dates">
      {DATES.map((day) => (
        <button
          key={day.value}
          type="button"
          className="date"
          data-date={day.value}
          aria-pressed={day.value === date}
          onClick={() => onChange(day.value)}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}

function TableList() {
  const [date, setDate] = useSelectedDate();
  const { status, data: tables, error, reload } = useLoad(() => fetchTables(date), [date]);

  return (
    <section className="panel">
      <h2>Volné stoly</h2>
      <DatePicker date={date} onChange={setDate} />

      {status === 'pending' && <p className="loading" role="status">Načítám volné stoly…</p>}

      {status === 'error' && (
        <div>
          <p role="alert">{error.message}</p>
          <button type="button" className="date" onClick={reload}>Zkusit znovu</button>
        </div>
      )}

      {status === 'done' && (
        <ul className="tables">
          {tables.map((table) => (
            <li key={table.id}>
              <Link to={`/stul/${table.id}?datum=${date}`}>{table.name}</Link>
              <span className="seats">{table.seats} míst</span>
              {!table.free && <span className="taken">zamluveno</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReservationForm({ table, date }) {
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState(null);
  const [reservation, setReservation] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = {
      guest: String(form.get('guest') ?? ''),
      phone: String(form.get('phone') ?? ''),
      people: Number(form.get('people')),
    };

    const found = validateReservation(data, table.seats);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    setFailure(null);
    try {
      setReservation(await createReservation({ tableId: table.id, date, ...data }));
    } catch (error) {
      setFailure(error.message);
    } finally {
      setSending(false);
    }
  }

  if (reservation) {
    return (
      <p className="done" role="status">
        Rezervace přijata: {reservation.guest}, stůl {table.name}, {reservation.people} hostů.
      </p>
    );
  }

  const fields = [
    { name: 'guest', label: 'Jméno a příjmení', type: 'text' },
    { name: 'phone', label: 'Telefon', type: 'tel' },
    { name: 'people', label: 'Počet hostů', type: 'number' },
  ];

  return (
    <form className="reservation" noValidate onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div className="field" key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            aria-invalid={errors[field.name] ? 'true' : undefined}
            aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
          />
          {errors[field.name] && (
            <p className="error" id={`${field.name}-error`}>{errors[field.name]}</p>
          )}
        </div>
      ))}

      {failure && <p role="alert">{failure}</p>}

      <button type="submit" disabled={sending}>
        {sending ? 'Odesílám…' : 'Rezervovat stůl'}
      </button>
    </form>
  );
}

function TableDetail() {
  const { id } = useParams();
  const [date] = useSelectedDate();
  const { status, data: table } = useLoad(() => fetchTable(id, date), [id, date]);

  if (status === 'pending') return <section className="panel"><p className="loading" role="status">Načítám stůl…</p></section>;

  if (!table) {
    return (
      <section className="panel">
        <h2>Takový stůl tu není</h2>
        <Link className="back" to={`/?datum=${date}`}>Zpět na seznam</Link>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>{table.name}</h2>
      <p className="note">{table.seats} míst. {table.note}</p>

      {table.free
        ? <ReservationForm table={table} date={date} />
        : <p role="alert">Tenhle stůl je na vybraný den už zabraný. Vyber jiný den nebo jiný stůl.</p>}

      <Link className="back" to={`/?datum=${date}`}>Zpět na seznam</Link>
    </section>
  );
}

export default function App() {
  return (
    <MemoryRouter>
      <header className="head">
        <h1>U Tří lip</h1>
        <p>Rezervace stolů</p>
      </header>
      <main className="wrap">
        <Routes>
          <Route path="/" element={<TableList />} />
          <Route path="/stul/:id" element={<TableDetail />} />
        </Routes>
      </main>
    </MemoryRouter>
  );
}
```

## --approach-- Pravidla validace jako data

Datová vrstva i komponenty zůstávají stejné jako v řešení, jinak je napsaná
validace: místo řetězce podmínek je to tabulka pravidel. Vyplatí se, jakmile
máš formulářů víc nebo chceš stejná pravidla sdílet se serverem — přidat pole
znamená přidat řádek, ne další `if`.

### --file-- validation.js

```js
const RULES = [
  {
    field: 'guest',
    test: (data) => String(data.guest ?? '').trim().length >= 2,
    message: () => 'Napiš prosím jméno, na které stůl zapíšeme.',
  },
  {
    field: 'phone',
    test: (data) => /^\+?\d{9,15}$/.test(String(data.phone ?? '').replace(/\s/g, '')),
    message: () => 'Telefon zapiš jako devět číslic, klidně s předvolbou +420.',
  },
  {
    field: 'people',
    test: (data) => Number.isInteger(data.people) && data.people >= 1,
    message: () => 'Napiš, kolik vás přijde — aspoň jeden host.',
  },
  {
    field: 'people',
    test: (data, seats) => !Number.isInteger(data.people) || data.people <= seats,
    message: (seats) => `U tohohle stolu je nejvýš ${seats} míst.`,
  },
];

/**
 * Zkontroluje data rezervace podle tabulky pravidel.
 * @param {{ guest: string, phone: string, people: number }} data
 * @param {number} seats
 * @returns {Record<string, string>}
 */
export function validateReservation(data, seats) {
  const errors = {};

  for (const rule of RULES) {
    if (errors[rule.field]) continue;              // první chyba u pole stačí
    if (!rule.test(data, seats)) errors[rule.field] = rule.message(seats);
  }

  return errors;
}
```

### --file-- App.jsx

```jsx
import { useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, MemoryRouter, Route, Routes, useParams, useSearchParams } from 'react-router';
import { DATES, createReservation, fetchTable, fetchTables } from './api';
import { validateReservation } from './validation';
import './styles.css';

function useSelectedDate() {
  const [params, setParams] = useSearchParams();
  const date = params.get('datum') ?? DATES[0].value;
  return [date, (value) => setParams({ datum: value })];
}

function DatePicker({ date, onChange }) {
  return (
    <div className="dates">
      {DATES.map((day) => (
        <button
          key={day.value}
          type="button"
          className="date"
          data-date={day.value}
          aria-pressed={day.value === date}
          onClick={() => onChange(day.value)}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}

function TableList() {
  const [date, setDate] = useSelectedDate();
  const { data: tables, isPending, isError, error, refetch } = useQuery({
    queryKey: ['tables', date],
    queryFn: () => fetchTables(date),
  });

  return (
    <section className="panel">
      <h2>Volné stoly</h2>
      <DatePicker date={date} onChange={setDate} />

      {isPending && <p className="loading" role="status">Načítám volné stoly…</p>}

      {isError && (
        <div>
          <p role="alert">{error.message}</p>
          <button type="button" className="date" onClick={() => refetch()}>Zkusit znovu</button>
        </div>
      )}

      {tables && (
        <ul className="tables">
          {tables.map((table) => (
            <li key={table.id}>
              <Link to={`/stul/${table.id}?datum=${date}`}>{table.name}</Link>
              <span className="seats">{table.seats} míst</span>
              {!table.free && <span className="taken">zamluveno</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReservationForm({ table, date }) {
  const [errors, setErrors] = useState({});
  const [reservation, setReservation] = useState(null);
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: createReservation,
    onSuccess: (saved) => {
      setReservation(saved);
      client.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = {
      guest: String(form.get('guest') ?? ''),
      phone: String(form.get('phone') ?? ''),
      people: Number(form.get('people')),
    };

    const found = validateReservation(data, table.seats);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    mutation.mutate({ tableId: table.id, date, ...data });
  }

  if (reservation) {
    return (
      <p className="done" role="status">
        Rezervace přijata: {reservation.guest}, stůl {table.name}, {reservation.people} hostů.
      </p>
    );
  }

  const fields = [
    { name: 'guest', label: 'Jméno a příjmení', type: 'text' },
    { name: 'phone', label: 'Telefon', type: 'tel' },
    { name: 'people', label: 'Počet hostů', type: 'number' },
  ];

  return (
    <form className="reservation" noValidate onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div className="field" key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            aria-invalid={errors[field.name] ? 'true' : undefined}
            aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
          />
          {errors[field.name] && (
            <p className="error" id={`${field.name}-error`}>{errors[field.name]}</p>
          )}
        </div>
      ))}

      {mutation.isError && <p role="alert">{mutation.error.message}</p>}

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Odesílám…' : 'Rezervovat stůl'}
      </button>
    </form>
  );
}

function TableDetail() {
  const { id } = useParams();
  const [date] = useSelectedDate();
  const { data: table, isPending } = useQuery({
    queryKey: ['table', id, date],
    queryFn: () => fetchTable(id, date),
  });

  if (isPending) return <section className="panel"><p className="loading" role="status">Načítám stůl…</p></section>;

  if (!table) {
    return (
      <section className="panel">
        <h2>Takový stůl tu není</h2>
        <Link className="back" to={`/?datum=${date}`}>Zpět na seznam</Link>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>{table.name}</h2>
      <p className="note">{table.seats} míst. {table.note}</p>

      {table.free
        ? <ReservationForm table={table} date={date} />
        : <p role="alert">Tenhle stůl je na vybraný den už zabraný. Vyber jiný den nebo jiný stůl.</p>}

      <Link className="back" to={`/?datum=${date}`}>Zpět na seznam</Link>
    </section>
  );
}

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <header className="head">
          <h1>U Tří lip</h1>
          <p>Rezervace stolů</p>
        </header>
        <main className="wrap">
          <Routes>
            <Route path="/" element={<TableList />} />
            <Route path="/stul/:id" element={<TableDetail />} />
          </Routes>
        </main>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
```

# --review--

Testy hlídají chování. Tohle si projdi sám — je to přesně to, na co se ptá
kolega u code review.

## --rubric--

- Každá komponenta má jednu odpovědnost: seznam, výběr dne, detail, formulář.
  Žádná z nich nemá přes dvě obrazovky kódu.
- Vybraný den je v aplikaci **jen** v adrese. Nikde není jeho druhá kopie.
- `validateReservation` se dá přečíst shora dolů: jedno pravidlo na jednu
  podmínku, bez vnořených `if`.
- Hlášky mluví k hostovi („Napiš prosím jméno…"), ne k programátorovi
  („guest is required").
- Formulář jde vyplnit a odeslat jen klávesnicí, včetně výběru dne.
- Stav načítání, chyba a prázdný výsledek jsou ošetřené všude, kde se čeká na
  API — i na detailu stolu, ne jen v seznamu.
- Víš, co bys příště udělal jinak.

## --extensions--

Rozšíření bez testů: ukaž u zamluveného stolu nejbližší den, kdy je volný;
přesuň fokus po odeslání na první vadné pole; přidej pole „poznámka pro
obsluhu"; zpracuj chybu `Stůl už je mezitím zabraný` (mock API ji umí vrátit,
když si otevřeš stejný stůl ve dvou kartách) tak, aby host viděl srozumitelné
vysvětlení a seznam se sám srovnal; nech host vybrat i čas a hlídej, že
restaurace má otevřeno.
