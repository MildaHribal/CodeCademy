---
title: Oprav 3 chyby
runtime: js
kind: debug
see: js-async/async-await#cykly-for-of-ceka-foreach-ne, js-async/fetch#chybi-kontrola-response-ok, js-async/async-await#postupne-cekani-tam-kde-nemusi-byt
---

# --description--

Kolega napsal pro Sportcentrum Lužánky `script.js`, přes který recepce pracuje s rezervacemi kurtů, a odjel na dovolenou. Nahoře v souboru je simulace serveru (tu neměň), pod ní kolegovy funkce a na konci ukázka, která vypíše přehled dne. Z recepce přišla tři hlášení. Chyby spolu nesouvisejí, každá je v jiné funkci.

## Hlášení

- **Připomínky.** Recepce odešle hráčům připomínky na zítřek a aplikace ukáže `Odesláno připomínek: 0`. Hráči přitom e-maily dostali. Vedoucí proto posílá připomínky ručně podruhé a hráči si stěžují na spam.
- **Přetížený rezervační systém.** V sobotu ráno server rezervací odpovídal stavem `500`. Přehled dne místo chyby vypsal `Rezervace 2026-09-20: undefined` a pak `Chyba: bookings.forEach is not a function`. Recepce z toho vyčetla, že kurty jsou volné, a pustila na obsazený kurt další dvojici.
- **Pomalé volné kurty.** Přehled volných časů čtyř kurtů se načítá čtyřikrát déle než přehled jednoho. V záložce Network každý požadavek začne až ve chvíli, kdy skončí předchozí. Kurty na sobě nijak nezávisí.

Funkce `formatBooking` funguje správně a recepce na ni spoléhá.

## Úkol

Oprav všechny tři chyby. U každé změň co nejmenší kus kódu a zkontroluj, že zbytek funguje dál. Každá chyba má v seznamu kontrol vlastní požadavky.

# --hints--

`loadBookings('2026-09-20')` se splní polem tří rezervací.

```js
const bookings = await loadBookings('2026-09-20');
assert.ok(Array.isArray(bookings), "await loadBookings('2026-09-20') má dát pole rezervací");
assert.deepEqual(bookings.map((booking) => booking.id), ['R-201', 'R-202', 'R-203'], "loadBookings('2026-09-20') má vrátit rezervace R-201, R-202 a R-203");
```

Když server rezervací odpoví stavem `500`, `loadBookings` se zamítne chybou a nevrátí tělo odpovědi.

```js
// ukázka na konci souboru nejdřív doběhne, aby se nepletla do počítadel
await helpers.wait(400);
await helpers.waitFor(() => mockApi.active === 0, 2000);
mockApi.failures.bookings = 1;
let result;
let caught = null;
await loadBookings('2026-09-20').then((value) => {
  result = value;
}, (error) => {
  caught = error;
});
assert.equal(result, undefined, `při odpovědi 500 se loadBookings nemá splnit, splnila se hodnotou ${JSON.stringify(result)}`);
assert.ok(caught instanceof Error, 'při odpovědi 500 se má loadBookings zamítnout chybou (Error)');
```

Když server odpoví `400` (neplatné datum), `loadBookings` se taky zamítne chybou.

```js
let caught = null;
await loadBookings('20. 9.').then(() => {}, (error) => {
  caught = error;
});
assert.ok(caught instanceof Error, "loadBookings('20. 9.') se má zamítnout chybou — server odpoví 400 Neplatné datum");
```

`loadFreeSlots([1, 3], '2026-09-20')` vrátí volné časy obou kurtů ve stejném pořadí.

```js
const slots = await loadFreeSlots([1, 3], '2026-09-20');
assert.deepEqual(slots.map((court) => court.courtId), [1, 3], "loadFreeSlots([1, 3], …) má vrátit kurty 1 a 3 v tomhle pořadí");
assert.deepEqual(slots[1].free, ['07:00', '12:30', '15:00'], 'kurt 3 má mít volno v 07:00, 12:30 a 15:00');
```

`loadFreeSlots` pošle všechny požadavky na kurty naráz a výsledky vrátí v pořadí zadaných kurtů.

```js
// ukázka na konci souboru nejdřív doběhne, aby se nepletla do počítadel
await helpers.wait(400);
await helpers.waitFor(() => mockApi.active === 0, 2000);
mockApi.maxActive = 0;
const slots = await loadFreeSlots([4, 1, 2, 3], '2026-09-20');
assert.equal(mockApi.maxActive, 4, `u čtyř kurtů mají běžet všechny čtyři požadavky naráz, nejvíc jich ale běželo ${mockApi.maxActive}`);
assert.deepEqual(slots.map((court) => court.courtId), [4, 1, 2, 3], 'výsledky mají být v pořadí zadaných kurtů 4, 1, 2, 3, ne v pořadí, jak odpovědi dorazily');
```

Když kurt neexistuje, `loadFreeSlots` se dál zamítne chybou.

```js
let caught = null;
await loadFreeSlots([1, 9], '2026-09-20').then(() => {}, (error) => {
  caught = error;
});
assert.ok(caught instanceof Error, 'loadFreeSlots([1, 9], …) se má zamítnout chybou — kurt 9 neexistuje');
```

`sendReminders(bookings)` se splní až po odeslání všech připomínek a vrátí jejich počet.

```js
// ukázka na konci souboru nejdřív doběhne, aby se nepletla do počítadel
await helpers.wait(400);
await helpers.waitFor(() => mockApi.active === 0, 2000);
mockApi.reminders.length = 0;
const bookings = [
  { id: 'R-301', court: 2, time: '08:00', player: 'Eva Kopecká', email: 'eva.kopecka@example.cz' },
  { id: 'R-302', court: 1, time: '09:00', player: 'Jan Beneš', email: 'jan.benes@example.cz' },
  { id: 'R-303', court: 4, time: '10:30', player: 'Petra Král', email: 'petra.kral@example.cz' },
];
const sent = await sendReminders(bookings);
assert.equal(mockApi.reminders.length, 3, `ve chvíli, kdy se sendReminders splní, mají být odeslané všechny 3 připomínky, odešlo jich ${mockApi.reminders.length}`);
assert.equal(sent, 3, `sendReminders se třemi rezervacemi má vrátit 3, vrátila ${sent}`);
```

Připomínku, kterou poštovní server odmítne, `sendReminders` nezapočítá.

```js
// ukázka na konci souboru nejdřív doběhne, aby se nepletla do počítadel
await helpers.wait(400);
await helpers.waitFor(() => mockApi.active === 0, 2000);
mockApi.failures.reminders = 1;
const bookings = [
  { id: 'R-301', court: 2, time: '08:00', player: 'Eva Kopecká', email: 'eva.kopecka@example.cz' },
  { id: 'R-302', court: 1, time: '09:00', player: 'Jan Beneš', email: 'jan.benes@example.cz' },
];
const sent = await sendReminders(bookings);
assert.equal(sent, 1, `když poštovní server jednu ze dvou připomínek odmítne (503), má sendReminders vrátit 1, vrátila ${sent}`);
```

`sendReminders([])` vrátí `0`.

```js
assert.equal(await sendReminders([]), 0, 'sendReminders([]) má vrátit 0');
```

`formatBooking` dál vrací řádek pro recepci.

```js
const text = formatBooking({ id: 'R-301', court: 2, time: '08:00', player: 'Eva Kopecká', email: 'eva.kopecka@example.cz' });
assert.equal(text, '08:00 · kurt 2 · Eva Kopecká', "formatBooking má vrátit '08:00 · kurt 2 · Eva Kopecká'");
```

# --help--

## --tip--

Každé hlášení odpovídá jedné pasti z lekcí: [`forEach` nečeká](see:js-async/async-await#cykly-for-of-ceka-foreach-ne), [chybí kontrola `response.ok`](see:js-async/fetch#chybi-kontrola-response-ok) a [postupné čekání tam, kde nemusí být](see:js-async/async-await#postupne-cekani-tam-kde-nemusi-byt). Nejdřív si ke každému hlášení najdi funkci, pak past.

## --tip--

Chybu si nejdřív zopakuj. Výpadek serveru nasimuluješ řádkem `mockApi.failures.bookings = 1;` těsně nad voláním `showDay` na konci souboru. Souběh uvidíš, když si za volání `loadFreeSlots` vypíšeš `mockApi.maxActive`. Po opravě stejný výpis ukáže, jestli chyba zmizela.

# --seed--

## --file-- script.js

```js
// ===== Simulace API sportovního centra (neměň) =====
// Nahradí fetch pro adresy /api/…: odpovídá se zpožděním skutečnými objekty Response
// se stavem a JSON tělem.
//
//   GET  /api/bookings?date=2026-09-20   rezervace na den (neplatné datum = 400)
//   GET  /api/courts/:id/slots?date=…    volné časy jednoho kurtu (neznámý kurt = 404)
//   POST /api/reminders                  připomínka hráči, tělo { bookingId, email } → 201
//
// Testy si simulaci přepínají přes objekt mockApi (výpadky a počítadla požadavků).
const mockApi = (() => {
  const courts = {
    1: { name: 'Kurt 1 (antuka)', free: ['08:00', '16:00', '20:30'] },
    2: { name: 'Kurt 2 (antuka)', free: ['10:00', '21:00'] },
    3: { name: 'Kurt 3 (hala)', free: ['07:00', '12:30', '15:00'] },
    4: { name: 'Kurt 4 (hala)', free: ['19:00'] },
  };
  const bookings = {
    '2026-09-20': [
      { id: 'R-201', court: 1, time: '17:00', player: 'Tereza Malá', email: 'tereza.mala@example.cz' },
      { id: 'R-202', court: 3, time: '18:00', player: 'Ondřej Novák', email: 'ondrej.novak@example.cz' },
      { id: 'R-203', court: 2, time: '19:30', player: 'Lucie Černá', email: 'lucie.cerna@example.cz' },
    ],
    '2026-09-21': [
      { id: 'R-210', court: 4, time: '09:00', player: 'Marek Dvořák', email: 'marek.dvorak@example.cz' },
    ],
  };

  const api = {
    failures: { bookings: 0, slots: 0, reminders: 0 }, // kolik dalších požadavků skončí chybou serveru
    reminders: [], // připomínky, které poštovní server přijal
    active: 0, // právě běžící požadavky
    slotsActive: 0, // právě běžící požadavky na volné časy
    maxActive: 0, // nejvíc naráz běžících požadavků na volné časy
  };

  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

  function handle(method, url, body) {
    const slots = url.pathname.match(/^\/api\/courts\/([^/]+)\/slots$/);
    if (method === 'GET' && url.pathname === '/api/bookings') {
      if (api.failures.bookings > 0) {
        api.failures.bookings--;
        return json({ error: 'Rezervační systém je přetížený' }, 500);
      }
      const date = url.searchParams.get('date') ?? '';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Neplatné datum' }, 400);
      return json(structuredClone(bookings[date] ?? []));
    }
    if (method === 'GET' && slots) {
      if (api.failures.slots > 0) {
        api.failures.slots--;
        return json({ error: 'Chyba serveru' }, 500);
      }
      const court = courts[slots[1]];
      if (!court) return json({ error: 'Kurt nenalezen' }, 404);
      return json({ courtId: Number(slots[1]), name: court.name, free: [...court.free] });
    }
    if (method === 'POST' && url.pathname === '/api/reminders') {
      if (api.failures.reminders > 0) {
        api.failures.reminders--;
        return json({ error: 'Poštovní server neodpovídá' }, 503);
      }
      try {
        api.reminders.push(JSON.parse(body));
      } catch {
        return json({ error: 'Tělo není platný JSON' }, 400);
      }
      return json({ ok: true }, 201);
    }
    return json({ error: 'Neznámá adresa' }, 404);
  }

  window.fetch = function fetch(input, options = {}) {
    const url = new URL(String(input), 'https://sportcentrum.example');
    const method = (options.method ?? 'GET').toUpperCase();
    const slots = url.pathname.match(/^\/api\/courts\/([^/]+)\/slots$/);
    api.active++;
    if (slots) {
      api.slotsActive++;
      api.maxActive = Math.max(api.maxActive, api.slotsActive);
    }
    // kurt 4 odpovídá nejpomaleji, kurt 1 nejrychleji
    const delay = slots && courts[slots[1]] ? 20 + Number(slots[1]) * 10 : 30;
    return new Promise((resolve) => {
      setTimeout(() => {
        api.active--;
        if (slots) api.slotsActive--;
        resolve(handle(method, url, options.body));
      }, delay);
    });
  };

  return api;
})();

// ===== Kolegův kód: rezervace kurtů =====

// Řádek do přehledu pro recepci, třeba „17:00 · kurt 1 · Tereza Malá".
function formatBooking(booking) {
  return `${booking.time} · kurt ${booking.court} · ${booking.player}`;
}

// Rezervace na zadaný den (datum ve tvaru 2026-09-20).
async function loadBookings(date) {
  const response = await fetch(`/api/bookings?date=${date}`);
  return response.json();
}

// Volné časy zadaných kurtů ve stejném pořadí, v jakém jsou v courtIds.
async function loadFreeSlots(courtIds, date) {
  const result = [];
  for (const courtId of courtIds) {
    const response = await fetch(`/api/courts/${courtId}/slots?date=${date}`);
    if (!response.ok) {
      throw new Error(`Kurt ${courtId}: server odpověděl ${response.status}`);
    }
    result.push(await response.json());
  }
  return result;
}

// Pošle hráčům připomínku rezervace a vrátí, kolik připomínek server přijal.
async function sendReminders(bookings) {
  let sent = 0;
  bookings.forEach(async (booking) => {
    const response = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, email: booking.email }),
    });
    if (response.ok) sent++;
  });
  return sent;
}

// ===== Ukázka: přehled dne pro recepci =====
async function showDay(date) {
  const bookings = await loadBookings(date);
  console.log(`Rezervace ${date}: ${bookings.length}`);
  bookings.forEach((booking) => console.log(formatBooking(booking)));

  const slots = await loadFreeSlots([1, 2, 3, 4], date);
  slots.forEach((court) => console.log(`${court.name}: volno ${court.free.join(', ')}`));

  const sent = await sendReminders(bookings);
  console.log(`Odesláno připomínek: ${sent}`);
}

showDay('2026-09-20').catch((error) => console.log(`Chyba: ${error.message}`));
```

# --solution--

## --file-- script.js

```js
// ===== Simulace API sportovního centra (neměň) =====
// Nahradí fetch pro adresy /api/…: odpovídá se zpožděním skutečnými objekty Response
// se stavem a JSON tělem.
//
//   GET  /api/bookings?date=2026-09-20   rezervace na den (neplatné datum = 400)
//   GET  /api/courts/:id/slots?date=…    volné časy jednoho kurtu (neznámý kurt = 404)
//   POST /api/reminders                  připomínka hráči, tělo { bookingId, email } → 201
//
// Testy si simulaci přepínají přes objekt mockApi (výpadky a počítadla požadavků).
const mockApi = (() => {
  const courts = {
    1: { name: 'Kurt 1 (antuka)', free: ['08:00', '16:00', '20:30'] },
    2: { name: 'Kurt 2 (antuka)', free: ['10:00', '21:00'] },
    3: { name: 'Kurt 3 (hala)', free: ['07:00', '12:30', '15:00'] },
    4: { name: 'Kurt 4 (hala)', free: ['19:00'] },
  };
  const bookings = {
    '2026-09-20': [
      { id: 'R-201', court: 1, time: '17:00', player: 'Tereza Malá', email: 'tereza.mala@example.cz' },
      { id: 'R-202', court: 3, time: '18:00', player: 'Ondřej Novák', email: 'ondrej.novak@example.cz' },
      { id: 'R-203', court: 2, time: '19:30', player: 'Lucie Černá', email: 'lucie.cerna@example.cz' },
    ],
    '2026-09-21': [
      { id: 'R-210', court: 4, time: '09:00', player: 'Marek Dvořák', email: 'marek.dvorak@example.cz' },
    ],
  };

  const api = {
    failures: { bookings: 0, slots: 0, reminders: 0 }, // kolik dalších požadavků skončí chybou serveru
    reminders: [], // připomínky, které poštovní server přijal
    active: 0, // právě běžící požadavky
    slotsActive: 0, // právě běžící požadavky na volné časy
    maxActive: 0, // nejvíc naráz běžících požadavků na volné časy
  };

  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

  function handle(method, url, body) {
    const slots = url.pathname.match(/^\/api\/courts\/([^/]+)\/slots$/);
    if (method === 'GET' && url.pathname === '/api/bookings') {
      if (api.failures.bookings > 0) {
        api.failures.bookings--;
        return json({ error: 'Rezervační systém je přetížený' }, 500);
      }
      const date = url.searchParams.get('date') ?? '';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Neplatné datum' }, 400);
      return json(structuredClone(bookings[date] ?? []));
    }
    if (method === 'GET' && slots) {
      if (api.failures.slots > 0) {
        api.failures.slots--;
        return json({ error: 'Chyba serveru' }, 500);
      }
      const court = courts[slots[1]];
      if (!court) return json({ error: 'Kurt nenalezen' }, 404);
      return json({ courtId: Number(slots[1]), name: court.name, free: [...court.free] });
    }
    if (method === 'POST' && url.pathname === '/api/reminders') {
      if (api.failures.reminders > 0) {
        api.failures.reminders--;
        return json({ error: 'Poštovní server neodpovídá' }, 503);
      }
      try {
        api.reminders.push(JSON.parse(body));
      } catch {
        return json({ error: 'Tělo není platný JSON' }, 400);
      }
      return json({ ok: true }, 201);
    }
    return json({ error: 'Neznámá adresa' }, 404);
  }

  window.fetch = function fetch(input, options = {}) {
    const url = new URL(String(input), 'https://sportcentrum.example');
    const method = (options.method ?? 'GET').toUpperCase();
    const slots = url.pathname.match(/^\/api\/courts\/([^/]+)\/slots$/);
    api.active++;
    if (slots) {
      api.slotsActive++;
      api.maxActive = Math.max(api.maxActive, api.slotsActive);
    }
    // kurt 4 odpovídá nejpomaleji, kurt 1 nejrychleji
    const delay = slots && courts[slots[1]] ? 20 + Number(slots[1]) * 10 : 30;
    return new Promise((resolve) => {
      setTimeout(() => {
        api.active--;
        if (slots) api.slotsActive--;
        resolve(handle(method, url, options.body));
      }, delay);
    });
  };

  return api;
})();

// ===== Kolegův kód: rezervace kurtů =====

// Řádek do přehledu pro recepci, třeba „17:00 · kurt 1 · Tereza Malá".
function formatBooking(booking) {
  return `${booking.time} · kurt ${booking.court} · ${booking.player}`;
}

// Rezervace na zadaný den (datum ve tvaru 2026-09-20).
async function loadBookings(date) {
  const response = await fetch(`/api/bookings?date=${date}`);
  if (!response.ok) {
    throw new Error(`Rezervace se nepodařilo načíst: server odpověděl ${response.status}`);
  }
  return response.json();
}

// Volné časy zadaných kurtů ve stejném pořadí, v jakém jsou v courtIds.
async function loadFreeSlots(courtIds, date) {
  return Promise.all(courtIds.map(async (courtId) => {
    const response = await fetch(`/api/courts/${courtId}/slots?date=${date}`);
    if (!response.ok) {
      throw new Error(`Kurt ${courtId}: server odpověděl ${response.status}`);
    }
    return response.json();
  }));
}

// Pošle hráčům připomínku rezervace a vrátí, kolik připomínek server přijal.
async function sendReminders(bookings) {
  let sent = 0;
  for (const booking of bookings) {
    const response = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, email: booking.email }),
    });
    if (response.ok) sent++;
  }
  return sent;
}

// ===== Ukázka: přehled dne pro recepci =====
async function showDay(date) {
  const bookings = await loadBookings(date);
  console.log(`Rezervace ${date}: ${bookings.length}`);
  bookings.forEach((booking) => console.log(formatBooking(booking)));

  const slots = await loadFreeSlots([1, 2, 3, 4], date);
  slots.forEach((court) => console.log(`${court.name}: volno ${court.free.join(', ')}`));

  const sent = await sendReminders(bookings);
  console.log(`Odesláno připomínek: ${sent}`);
}

showDay('2026-09-20').catch((error) => console.log(`Chyba: ${error.message}`));
```

# --explain--

Vysvětli vlastními slovy, proč kolegova `sendReminders` hlásila nula připomínek, přestože hráčům e-maily přišly.

## --model--

`forEach` zavolá `async` callback pro každou rezervaci a Promise, kterou callback vrátí, zahodí. Callbacky se zastaví na `await fetch` a `forEach` hned skončí, takže funkce vrátila `sent` ve chvíli, kdy ještě žádná odpověď nedorazila a počítadlo bylo nula. Požadavky ale doběhly později, proto e-maily přišly. Oprava je čekat na každé odeslání v cyklu `for…of`, nebo spustit všechna najednou a počkat na ně přes `Promise.all`.

## --checklist--

- `forEach` na Promise vrácenou z `async` callbacku nečeká.
- Funkce vrátila počítadlo dřív, než dorazila první odpověď.
- Požadavky doběhly až potom, proto e-maily přišly.
- Oprava: `for…of` s `await`, nebo `await Promise.all(bookings.map(…))`.

# --approaches--

## --approach-- Nejmenší opravy

Tři malé zásahy, které kolega po návratu snadno zkontroluje v diffu: kontrola `response.ok` v `loadBookings`, souběžné načtení kurtů přes `Promise.all` nad `map` a `for…of` místo `forEach` v připomínkách. Připomínky tu odcházejí jedna po druhé, což poštovnímu serveru nevadí.

### --file-- script.js

```js
// ===== Simulace API sportovního centra (neměň) =====
// Nahradí fetch pro adresy /api/…: odpovídá se zpožděním skutečnými objekty Response
// se stavem a JSON tělem.
//
//   GET  /api/bookings?date=2026-09-20   rezervace na den (neplatné datum = 400)
//   GET  /api/courts/:id/slots?date=…    volné časy jednoho kurtu (neznámý kurt = 404)
//   POST /api/reminders                  připomínka hráči, tělo { bookingId, email } → 201
//
// Testy si simulaci přepínají přes objekt mockApi (výpadky a počítadla požadavků).
const mockApi = (() => {
  const courts = {
    1: { name: 'Kurt 1 (antuka)', free: ['08:00', '16:00', '20:30'] },
    2: { name: 'Kurt 2 (antuka)', free: ['10:00', '21:00'] },
    3: { name: 'Kurt 3 (hala)', free: ['07:00', '12:30', '15:00'] },
    4: { name: 'Kurt 4 (hala)', free: ['19:00'] },
  };
  const bookings = {
    '2026-09-20': [
      { id: 'R-201', court: 1, time: '17:00', player: 'Tereza Malá', email: 'tereza.mala@example.cz' },
      { id: 'R-202', court: 3, time: '18:00', player: 'Ondřej Novák', email: 'ondrej.novak@example.cz' },
      { id: 'R-203', court: 2, time: '19:30', player: 'Lucie Černá', email: 'lucie.cerna@example.cz' },
    ],
    '2026-09-21': [
      { id: 'R-210', court: 4, time: '09:00', player: 'Marek Dvořák', email: 'marek.dvorak@example.cz' },
    ],
  };

  const api = {
    failures: { bookings: 0, slots: 0, reminders: 0 }, // kolik dalších požadavků skončí chybou serveru
    reminders: [], // připomínky, které poštovní server přijal
    active: 0, // právě běžící požadavky
    slotsActive: 0, // právě běžící požadavky na volné časy
    maxActive: 0, // nejvíc naráz běžících požadavků na volné časy
  };

  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

  function handle(method, url, body) {
    const slots = url.pathname.match(/^\/api\/courts\/([^/]+)\/slots$/);
    if (method === 'GET' && url.pathname === '/api/bookings') {
      if (api.failures.bookings > 0) {
        api.failures.bookings--;
        return json({ error: 'Rezervační systém je přetížený' }, 500);
      }
      const date = url.searchParams.get('date') ?? '';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Neplatné datum' }, 400);
      return json(structuredClone(bookings[date] ?? []));
    }
    if (method === 'GET' && slots) {
      if (api.failures.slots > 0) {
        api.failures.slots--;
        return json({ error: 'Chyba serveru' }, 500);
      }
      const court = courts[slots[1]];
      if (!court) return json({ error: 'Kurt nenalezen' }, 404);
      return json({ courtId: Number(slots[1]), name: court.name, free: [...court.free] });
    }
    if (method === 'POST' && url.pathname === '/api/reminders') {
      if (api.failures.reminders > 0) {
        api.failures.reminders--;
        return json({ error: 'Poštovní server neodpovídá' }, 503);
      }
      try {
        api.reminders.push(JSON.parse(body));
      } catch {
        return json({ error: 'Tělo není platný JSON' }, 400);
      }
      return json({ ok: true }, 201);
    }
    return json({ error: 'Neznámá adresa' }, 404);
  }

  window.fetch = function fetch(input, options = {}) {
    const url = new URL(String(input), 'https://sportcentrum.example');
    const method = (options.method ?? 'GET').toUpperCase();
    const slots = url.pathname.match(/^\/api\/courts\/([^/]+)\/slots$/);
    api.active++;
    if (slots) {
      api.slotsActive++;
      api.maxActive = Math.max(api.maxActive, api.slotsActive);
    }
    // kurt 4 odpovídá nejpomaleji, kurt 1 nejrychleji
    const delay = slots && courts[slots[1]] ? 20 + Number(slots[1]) * 10 : 30;
    return new Promise((resolve) => {
      setTimeout(() => {
        api.active--;
        if (slots) api.slotsActive--;
        resolve(handle(method, url, options.body));
      }, delay);
    });
  };

  return api;
})();

// ===== Kolegův kód: rezervace kurtů =====

// Řádek do přehledu pro recepci, třeba „17:00 · kurt 1 · Tereza Malá".
function formatBooking(booking) {
  return `${booking.time} · kurt ${booking.court} · ${booking.player}`;
}

// Rezervace na zadaný den (datum ve tvaru 2026-09-20).
async function loadBookings(date) {
  const response = await fetch(`/api/bookings?date=${date}`);
  if (!response.ok) {
    throw new Error(`Rezervace se nepodařilo načíst: server odpověděl ${response.status}`);
  }
  return response.json();
}

// Volné časy zadaných kurtů ve stejném pořadí, v jakém jsou v courtIds.
async function loadFreeSlots(courtIds, date) {
  return Promise.all(courtIds.map(async (courtId) => {
    const response = await fetch(`/api/courts/${courtId}/slots?date=${date}`);
    if (!response.ok) {
      throw new Error(`Kurt ${courtId}: server odpověděl ${response.status}`);
    }
    return response.json();
  }));
}

// Pošle hráčům připomínku rezervace a vrátí, kolik připomínek server přijal.
async function sendReminders(bookings) {
  let sent = 0;
  for (const booking of bookings) {
    const response = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, email: booking.email }),
    });
    if (response.ok) sent++;
  }
  return sent;
}

// ===== Ukázka: přehled dne pro recepci =====
async function showDay(date) {
  const bookings = await loadBookings(date);
  console.log(`Rezervace ${date}: ${bookings.length}`);
  bookings.forEach((booking) => console.log(formatBooking(booking)));

  const slots = await loadFreeSlots([1, 2, 3, 4], date);
  slots.forEach((court) => console.log(`${court.name}: volno ${court.free.join(', ')}`));

  const sent = await sendReminders(bookings);
  console.log(`Odesláno připomínek: ${sent}`);
}

showDay('2026-09-20').catch((error) => console.log(`Chyba: ${error.message}`));
```

## --approach-- Společná funkce na JSON a všechno souběžně

Kontrola stavu a čtení těla se opakují ve dvou funkcích, a tak je vytáhne do `getJSON`, kterou šlo použít i v kolegově `loadFreeSlots`. Kurty i připomínky spustí najednou a počítá výsledky až po `Promise.all`: připomínky pak odejdou všechny zároveň, ne jedna po druhé. Delší diff, ale na jednom místě ošetřená chyba i souběh.

### --file-- script.js

```js
// ===== Simulace API sportovního centra (neměň) =====
// Nahradí fetch pro adresy /api/…: odpovídá se zpožděním skutečnými objekty Response
// se stavem a JSON tělem.
//
//   GET  /api/bookings?date=2026-09-20   rezervace na den (neplatné datum = 400)
//   GET  /api/courts/:id/slots?date=…    volné časy jednoho kurtu (neznámý kurt = 404)
//   POST /api/reminders                  připomínka hráči, tělo { bookingId, email } → 201
//
// Testy si simulaci přepínají přes objekt mockApi (výpadky a počítadla požadavků).
const mockApi = (() => {
  const courts = {
    1: { name: 'Kurt 1 (antuka)', free: ['08:00', '16:00', '20:30'] },
    2: { name: 'Kurt 2 (antuka)', free: ['10:00', '21:00'] },
    3: { name: 'Kurt 3 (hala)', free: ['07:00', '12:30', '15:00'] },
    4: { name: 'Kurt 4 (hala)', free: ['19:00'] },
  };
  const bookings = {
    '2026-09-20': [
      { id: 'R-201', court: 1, time: '17:00', player: 'Tereza Malá', email: 'tereza.mala@example.cz' },
      { id: 'R-202', court: 3, time: '18:00', player: 'Ondřej Novák', email: 'ondrej.novak@example.cz' },
      { id: 'R-203', court: 2, time: '19:30', player: 'Lucie Černá', email: 'lucie.cerna@example.cz' },
    ],
    '2026-09-21': [
      { id: 'R-210', court: 4, time: '09:00', player: 'Marek Dvořák', email: 'marek.dvorak@example.cz' },
    ],
  };

  const api = {
    failures: { bookings: 0, slots: 0, reminders: 0 }, // kolik dalších požadavků skončí chybou serveru
    reminders: [], // připomínky, které poštovní server přijal
    active: 0, // právě běžící požadavky
    slotsActive: 0, // právě běžící požadavky na volné časy
    maxActive: 0, // nejvíc naráz běžících požadavků na volné časy
  };

  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

  function handle(method, url, body) {
    const slots = url.pathname.match(/^\/api\/courts\/([^/]+)\/slots$/);
    if (method === 'GET' && url.pathname === '/api/bookings') {
      if (api.failures.bookings > 0) {
        api.failures.bookings--;
        return json({ error: 'Rezervační systém je přetížený' }, 500);
      }
      const date = url.searchParams.get('date') ?? '';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Neplatné datum' }, 400);
      return json(structuredClone(bookings[date] ?? []));
    }
    if (method === 'GET' && slots) {
      if (api.failures.slots > 0) {
        api.failures.slots--;
        return json({ error: 'Chyba serveru' }, 500);
      }
      const court = courts[slots[1]];
      if (!court) return json({ error: 'Kurt nenalezen' }, 404);
      return json({ courtId: Number(slots[1]), name: court.name, free: [...court.free] });
    }
    if (method === 'POST' && url.pathname === '/api/reminders') {
      if (api.failures.reminders > 0) {
        api.failures.reminders--;
        return json({ error: 'Poštovní server neodpovídá' }, 503);
      }
      try {
        api.reminders.push(JSON.parse(body));
      } catch {
        return json({ error: 'Tělo není platný JSON' }, 400);
      }
      return json({ ok: true }, 201);
    }
    return json({ error: 'Neznámá adresa' }, 404);
  }

  window.fetch = function fetch(input, options = {}) {
    const url = new URL(String(input), 'https://sportcentrum.example');
    const method = (options.method ?? 'GET').toUpperCase();
    const slots = url.pathname.match(/^\/api\/courts\/([^/]+)\/slots$/);
    api.active++;
    if (slots) {
      api.slotsActive++;
      api.maxActive = Math.max(api.maxActive, api.slotsActive);
    }
    // kurt 4 odpovídá nejpomaleji, kurt 1 nejrychleji
    const delay = slots && courts[slots[1]] ? 20 + Number(slots[1]) * 10 : 30;
    return new Promise((resolve) => {
      setTimeout(() => {
        api.active--;
        if (slots) api.slotsActive--;
        resolve(handle(method, url, options.body));
      }, delay);
    });
  };

  return api;
})();

// ===== Kolegův kód: rezervace kurtů =====

// Řádek do přehledu pro recepci, třeba „17:00 · kurt 1 · Tereza Malá".
function formatBooking(booking) {
  return `${booking.time} · kurt ${booking.court} · ${booking.player}`;
}

// Odpověď jako data; neúspěšný stav je chyba.
async function getJSON(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${url}: server odpověděl ${response.status}`);
  }
  return response.json();
}

// Rezervace na zadaný den (datum ve tvaru 2026-09-20).
function loadBookings(date) {
  return getJSON(`/api/bookings?date=${encodeURIComponent(date)}`);
}

// Volné časy zadaných kurtů ve stejném pořadí, v jakém jsou v courtIds.
function loadFreeSlots(courtIds, date) {
  return Promise.all(courtIds.map((courtId) => getJSON(`/api/courts/${courtId}/slots?date=${date}`)));
}

// Pošle hráčům připomínku rezervace a vrátí, kolik připomínek server přijal.
async function sendReminders(bookings) {
  const responses = await Promise.all(bookings.map((booking) => fetch('/api/reminders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId: booking.id, email: booking.email }),
  })));
  return responses.filter((response) => response.ok).length;
}

// ===== Ukázka: přehled dne pro recepci =====
async function showDay(date) {
  const bookings = await loadBookings(date);
  console.log(`Rezervace ${date}: ${bookings.length}`);
  bookings.forEach((booking) => console.log(formatBooking(booking)));

  const slots = await loadFreeSlots([1, 2, 3, 4], date);
  slots.forEach((court) => console.log(`${court.name}: volno ${court.free.join(', ')}`));

  const sent = await sendReminders(bookings);
  console.log(`Odesláno připomínek: ${sent}`);
}

showDay('2026-09-20').catch((error) => console.log(`Chyba: ${error.message}`));
```
