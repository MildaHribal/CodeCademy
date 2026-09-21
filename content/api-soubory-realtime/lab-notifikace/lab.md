---
title: Notifikace pro přihlášené
runtime: node
timeoutMs: 30000
see: api-soubory-realtime/realtime-prehled#format-udalosti-a-znovupripojeni, api-soubory-realtime/websockety#overeni-a-autorizace-spojeni
---

# --description--

Vltava Software má interní helpdesk. Když někdo přehodí tiket na kolegu, kolega se to
dozví, až si obnoví stránku — tedy většinou po obědě. Postav jim **notifikační kanál**:
jedno otevřené spojení na uživatele, do kterého server posílá jen to, co tomu člověku
patří.

Oproti kuchyni bistra je tu navíc ostraha. Proud událostí je adresa jako každá jiná,
takže se musí ptát, kdo je za ní — a rozesílání musí umět vybrat, komu zpráva patří.

Pracuješ v `src/server.js`. Kostru serveru, účty v `data/ucty.json` a `package.json`
tam máš; všechno ostatní je na tobě. Stav si drž v paměti, databáze tu není potřeba.
Předinstalovaný máš `express`, ale vystačíš si i s `node:http` — testy kontrolují
chování, ne nástroj.

> [!NOTE]
> Hesla jsou v `data/ucty.json` čitelná, aby se lab nezvrhl v opakování hashování.
> V ostrém provozu by tam patřil otisk ze `scryptu`, ne heslo.

## Co má platit

**Přihlášení**

- `POST /api/prihlaseni` s `{ email, heslo }` vrátí `200` a `{ token, email }`. Token
  si vymýšlíš ty a pamatuješ si, komu patří.
- Špatné heslo i neznámý e-mail vracejí **stejnou** odpověď: `401` s kódem
  `SPATNE_UDAJE`. Heslo se nikdy nevrací v odpovědi.

**Proud událostí**

- `GET /api/udalosti?token=<token>` s platným tokenem otevře proud: stav `200`,
  `Content-Type: text/event-stream`, spojení zůstane otevřené.
- Bez tokenu nebo s vymyšleným tokenem přijde místo proudu `401` s kódem
  `NEPRIHLASEN` — a je to JSON, ne půlka proudu.
- Hned po otevření dorazí událost `pripojeno`, jejíž data jsou `{ email }`
  přihlášeného.
- Do otevřeného proudu chodí heartbeat — komentářový rámec `: ping`. Interval ber
  z `process.env.PING_MS`, výchozí hodnota `15000`. Po odpojení obrazovky po něm
  nesmí zůstat běžící časovač.

**Notifikace**

- `POST /api/notifikace` s `{ prijemce, text }` a platným tokenem uloží notifikaci
  a vrátí `201` s ní. Bez tokenu `401` s kódem `NEPRIHLASEN`.
- Notifikace dorazí jako událost `notifikace` **jen do proudů svého příjemce**.
  Ostatní přihlášení o ní nevědí.
- `prijemce` `"*"` znamená „všem přihlášeným".
- Jeden člověk může mít otevřených karet víc. Notifikace patří do všech.
- Každá notifikace má svoje `id`, které roste o jedna napříč všemi příjemci, a jde
  jako `id:` i do rámce události.
- Klient, který se vrátí po výpadku, pošle hlavičku `Last-Event-ID`. Doplň mu jen
  notifikace s vyšším `id`, které patří **jemu** — cizí mu doplnit nesmíš.

**Provoz**

- `GET /api/stav?token=<token>` vrátí `{ pripojenych: <počet otevřených proudů> }`.
  Odpojený klient se do počtu nepočítá. Bez tokenu `401`.
- Neznámý příjemce, chybějící nebo prázdný `text` a tělo, které není platný JSON,
  končí stavem `400` s kódem `NEPLATNY_VSTUP` a nic se nerozesílá.
- Neznámá cesta končí `404` s kódem `NENALEZENO`.
- **Každá** chybová odpověď má stejný tvar: `{ "chyba": { "kod": "...", "zprava": "..." } }`.

> [!TIP]
> Postupuj po vrstvách, ne po požadavcích: nejdřív jednotný tvar chyb a přihlášení,
> pak otevřený proud, pak rozesílání jednomu příjemci, nakonec historie. Po každé
> vrstvě si pusť **Zkontrolovat** a dívej se, kolik požadavků přibylo zelených.

# --hints--

Přihlášení vrací token a chybné údaje se od sebe nedají odlišit.

```js
const server = await helpers.startServer('src/server.js');
const prihlaseni = (telo) => fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(telo),
});
const ok = await prihlaseni({ email: 'eva@vltava.cz', heslo: 'tiket2026' });
assert.equal(ok.status, 200, `Správné údaje mají vrátit stav 200. Výstup serveru:\n${server.output()}`);
const telo = await ok.json();
assert.equal(typeof telo.token, 'string', 'Přihlášení má vrátit { token }');
assert.equal(telo.email, 'eva@vltava.cz', 'Přihlášení má vrátit i e-mail přihlášeného');
assert.doesNotMatch(JSON.stringify(telo), /tiket2026/, 'Heslo se nikdy nevrací v odpovědi');
const spatneHeslo = await prihlaseni({ email: 'eva@vltava.cz', heslo: 'uplnejine2026' });
const neznamy = await prihlaseni({ email: 'nikdo@vltava.cz', heslo: 'tiket2026' });
assert.equal(spatneHeslo.status, 401, 'Špatné heslo má vrátit stav 401');
assert.equal(neznamy.status, 401, 'Neznámý e-mail má vrátit stav 401');
const chyba = await spatneHeslo.json();
assert.deepEqual(chyba, await neznamy.json(), 'Obě odpovědi musí být stejné, jinak jde zjistit, kdo u nás účet má');
assert.equal(chyba.chyba?.kod, 'SPATNE_UDAJE', 'Chyba má mít tvar { chyba: { kod, zprava } } s kódem SPATNE_UDAJE');
assert.equal(typeof chyba.chyba?.zprava, 'string', 'Chyba má mít vedle kódu i lidskou zprávu');
```

Proud událostí i stav jsou jen pro přihlášené.

```js
const server = await helpers.startServer('src/server.js');
const bezTokenu = await fetch(new URL('/api/udalosti', server.url));
assert.equal(bezTokenu.status, 401, `Bez tokenu má /api/udalosti vrátit stav 401, přišlo ${bezTokenu.status}. Výstup serveru:\n${server.output()}`);
assert.match(bezTokenu.headers.get('content-type') ?? '', /^application\/json/i, 'Odmítnutí je obyčejná JSON odpověď, ne otevřený proud');
assert.equal((await bezTokenu.json()).chyba?.kod, 'NEPRIHLASEN', 'Chybějící token má mít kód NEPRIHLASEN');
const vymysleny = await fetch(new URL('/api/udalosti?token=vymysleny', server.url));
assert.equal(vymysleny.status, 401, 'Vymyšlený token má vrátit stav 401');
assert.equal((await vymysleny.json()).chyba?.kod, 'NEPRIHLASEN', 'Neplatný token má mít kód NEPRIHLASEN');
const stav = await fetch(new URL('/api/stav', server.url));
assert.equal(stav.status, 401, 'Bez tokenu má i /api/stav vrátit stav 401');
```

S platným tokenem se proud otevře a uvítá přihlášeného.

```js
const otevriProud = async (adresa, hlavicky = {}) => {
  const stop = new AbortController();
  const res = await fetch(adresa, { headers: hlavicky, signal: stop.signal });
  const ctecka = res.body.getReader();
  const dekoder = new TextDecoder();
  let text = '';
  const dalsi = async ({ limit = 4000, komentare = false } = {}) => {
    for (;;) {
      const konec = text.indexOf('\n\n');
      if (konec !== -1) {
        const kus = text.slice(0, konec);
        text = text.slice(konec + 2);
        if (!komentare && kus.split('\n').every((radek) => radek.startsWith(':'))) continue;
        return kus;
      }
      const kousek = await Promise.race([ctecka.read(), helpers.wait(limit).then(() => 'cas')]);
      if (kousek === 'cas' || kousek.done) return null;
      text += dekoder.decode(kousek.value, { stream: true });
    }
  };
  const rozloz = (ramec) => {
    const pole = { data: [] };
    for (const radek of (ramec ?? '').split('\n')) {
      const dvojtecka = radek.indexOf(':');
      if (dvojtecka <= 0) continue;
      const klic = radek.slice(0, dvojtecka);
      const hodnota = radek.slice(dvojtecka + 1).replace(/^ /, '');
      if (klic === 'data') pole.data.push(hodnota);
      else pole[klic] = hodnota;
    }
    return { ...pole, data: pole.data.join('\n') };
  };
  return { res, dalsi, rozloz, zavri: () => stop.abort() };
};
const server = await helpers.startServer('src/server.js');
const { token } = await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'eva@vltava.cz', heslo: 'tiket2026' }),
})).json();
const proud = await otevriProud(new URL(`/api/udalosti?token=${token}`, server.url));
try {
  assert.equal(proud.res.status, 200, `S platným tokenem má /api/udalosti vrátit stav 200. Výstup serveru:\n${server.output()}`);
  assert.match(proud.res.headers.get('content-type') ?? '', /^text\/event-stream/i, `Content-Type proudu má začínat text/event-stream, přišlo: ${proud.res.headers.get('content-type')}`);
  const uvitani = proud.rozloz(await proud.dalsi());
  assert.equal(uvitani.event, 'pripojeno', `Hned po otevření má přijít událost pripojeno, přišlo: ${JSON.stringify(uvitani)}`);
  assert.equal(JSON.parse(uvitani.data).email, 'eva@vltava.cz', 'Data události pripojeno nesou e-mail přihlášeného');
  const ticho = await proud.dalsi({ limit: 800 });
  assert.equal(ticho, null, `Po uvítání má být v proudu ticho, dokud notifikace nepřijde — přišlo: ${ticho}`);
} finally {
  proud.zavri();
}
```

Notifikace dorazí svému příjemci a nikomu jinému.

```js
const otevriProud = async (adresa, hlavicky = {}) => {
  const stop = new AbortController();
  const res = await fetch(adresa, { headers: hlavicky, signal: stop.signal });
  const ctecka = res.body.getReader();
  const dekoder = new TextDecoder();
  let text = '';
  const dalsi = async ({ limit = 4000, komentare = false } = {}) => {
    for (;;) {
      const konec = text.indexOf('\n\n');
      if (konec !== -1) {
        const kus = text.slice(0, konec);
        text = text.slice(konec + 2);
        if (!komentare && kus.split('\n').every((radek) => radek.startsWith(':'))) continue;
        return kus;
      }
      const kousek = await Promise.race([ctecka.read(), helpers.wait(limit).then(() => 'cas')]);
      if (kousek === 'cas' || kousek.done) return null;
      text += dekoder.decode(kousek.value, { stream: true });
    }
  };
  const rozloz = (ramec) => {
    const pole = { data: [] };
    for (const radek of (ramec ?? '').split('\n')) {
      const dvojtecka = radek.indexOf(':');
      if (dvojtecka <= 0) continue;
      const klic = radek.slice(0, dvojtecka);
      const hodnota = radek.slice(dvojtecka + 1).replace(/^ /, '');
      if (klic === 'data') pole.data.push(hodnota);
      else pole[klic] = hodnota;
    }
    return { ...pole, data: pole.data.join('\n') };
  };
  return { res, dalsi, rozloz, zavri: () => stop.abort() };
};
const server = await helpers.startServer('src/server.js');
const prihlas = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const eva = await prihlas('eva@vltava.cz', 'tiket2026');
const petr = await prihlas('petr@vltava.cz', 'kotva2026');
const proudEvy = await otevriProud(new URL(`/api/udalosti?token=${eva}`, server.url));
const proudPetra = await otevriProud(new URL(`/api/udalosti?token=${petr}`, server.url));
try {
  await proudEvy.dalsi();
  await proudPetra.dalsi();
  const res = await fetch(new URL('/api/notifikace', server.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${eva}` },
    body: JSON.stringify({ prijemce: 'petr@vltava.cz', text: 'Tiket 412 je nově tvůj.' }),
  });
  assert.equal(res.status, 201, `Uložená notifikace má vrátit stav 201. Výstup serveru:\n${server.output()}`);
  const dorucena = proudPetra.rozloz(await proudPetra.dalsi());
  assert.equal(dorucena.event, 'notifikace', `Příjemci má dorazit událost notifikace, přišlo: ${JSON.stringify(dorucena)}`);
  const data = JSON.parse(dorucena.data);
  assert.equal(data.text, 'Tiket 412 je nově tvůj.', 'Událost nese text notifikace');
  assert.equal(data.prijemce, 'petr@vltava.cz', 'Událost nese příjemce notifikace');
  const uEvy = await proudEvy.dalsi({ limit: 800 });
  assert.equal(uEvy, null, `Cizí notifikace se k nikomu jinému dostat nesmí — Evě přišlo: ${uEvy}`);
} finally {
  proudEvy.zavri();
  proudPetra.zavri();
}
```

Notifikace pro `*` dorazí všem přihlášeným.

```js
const otevriProud = async (adresa, hlavicky = {}) => {
  const stop = new AbortController();
  const res = await fetch(adresa, { headers: hlavicky, signal: stop.signal });
  const ctecka = res.body.getReader();
  const dekoder = new TextDecoder();
  let text = '';
  const dalsi = async ({ limit = 4000, komentare = false } = {}) => {
    for (;;) {
      const konec = text.indexOf('\n\n');
      if (konec !== -1) {
        const kus = text.slice(0, konec);
        text = text.slice(konec + 2);
        if (!komentare && kus.split('\n').every((radek) => radek.startsWith(':'))) continue;
        return kus;
      }
      const kousek = await Promise.race([ctecka.read(), helpers.wait(limit).then(() => 'cas')]);
      if (kousek === 'cas' || kousek.done) return null;
      text += dekoder.decode(kousek.value, { stream: true });
    }
  };
  const rozloz = (ramec) => {
    const pole = { data: [] };
    for (const radek of (ramec ?? '').split('\n')) {
      const dvojtecka = radek.indexOf(':');
      if (dvojtecka <= 0) continue;
      const klic = radek.slice(0, dvojtecka);
      const hodnota = radek.slice(dvojtecka + 1).replace(/^ /, '');
      if (klic === 'data') pole.data.push(hodnota);
      else pole[klic] = hodnota;
    }
    return { ...pole, data: pole.data.join('\n') };
  };
  return { res, dalsi, rozloz, zavri: () => stop.abort() };
};
const server = await helpers.startServer('src/server.js');
const prihlas = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const eva = await prihlas('eva@vltava.cz', 'tiket2026');
const petr = await prihlas('petr@vltava.cz', 'kotva2026');
const proudEvy = await otevriProud(new URL(`/api/udalosti?token=${eva}`, server.url));
const proudPetra = await otevriProud(new URL(`/api/udalosti?token=${petr}`, server.url));
try {
  await proudEvy.dalsi();
  await proudPetra.dalsi();
  await fetch(new URL('/api/notifikace', server.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${petr}` },
    body: JSON.stringify({ prijemce: '*', text: 'V pátek od osmi je výpadek serverovny.' }),
  });
  const uEvy = proudEvy.rozloz(await proudEvy.dalsi());
  const uPetra = proudPetra.rozloz(await proudPetra.dalsi());
  assert.equal(uEvy.event, 'notifikace', 'Hromadná notifikace má dorazit Evě');
  assert.equal(uPetra.event, 'notifikace', 'Hromadná notifikace má dorazit i Petrovi');
  assert.equal(JSON.parse(uEvy.data).text, 'V pátek od osmi je výpadek serverovny.', 'Hromadná notifikace nese svůj text');
  assert.equal(uEvy.id, uPetra.id, 'Jedna notifikace má u obou stejné id — číslo patří notifikaci, ne spojení');
} finally {
  proudEvy.zavri();
  proudPetra.zavri();
}
```

Kdo má otevřených karet víc, dostane notifikaci do všech.

```js
const otevriProud = async (adresa, hlavicky = {}) => {
  const stop = new AbortController();
  const res = await fetch(adresa, { headers: hlavicky, signal: stop.signal });
  const ctecka = res.body.getReader();
  const dekoder = new TextDecoder();
  let text = '';
  const dalsi = async ({ limit = 4000, komentare = false } = {}) => {
    for (;;) {
      const konec = text.indexOf('\n\n');
      if (konec !== -1) {
        const kus = text.slice(0, konec);
        text = text.slice(konec + 2);
        if (!komentare && kus.split('\n').every((radek) => radek.startsWith(':'))) continue;
        return kus;
      }
      const kousek = await Promise.race([ctecka.read(), helpers.wait(limit).then(() => 'cas')]);
      if (kousek === 'cas' || kousek.done) return null;
      text += dekoder.decode(kousek.value, { stream: true });
    }
  };
  const rozloz = (ramec) => {
    const pole = { data: [] };
    for (const radek of (ramec ?? '').split('\n')) {
      const dvojtecka = radek.indexOf(':');
      if (dvojtecka <= 0) continue;
      const klic = radek.slice(0, dvojtecka);
      const hodnota = radek.slice(dvojtecka + 1).replace(/^ /, '');
      if (klic === 'data') pole.data.push(hodnota);
      else pole[klic] = hodnota;
    }
    return { ...pole, data: pole.data.join('\n') };
  };
  return { res, dalsi, rozloz, zavri: () => stop.abort() };
};
const server = await helpers.startServer('src/server.js');
const prihlas = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const eva = await prihlas('eva@vltava.cz', 'tiket2026');
const petr = await prihlas('petr@vltava.cz', 'kotva2026');
const notebook = await otevriProud(new URL(`/api/udalosti?token=${eva}`, server.url));
const mobil = await otevriProud(new URL(`/api/udalosti?token=${eva}`, server.url));
try {
  await notebook.dalsi();
  await mobil.dalsi();
  await fetch(new URL('/api/notifikace', server.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${petr}` },
    body: JSON.stringify({ prijemce: 'eva@vltava.cz', text: 'Zákazník volal zpátky.' }),
  });
  const a = notebook.rozloz(await notebook.dalsi());
  const b = mobil.rozloz(await mobil.dalsi());
  assert.equal(a.event, 'notifikace', 'Notifikace má dorazit do první otevřené karty');
  assert.equal(b.event, 'notifikace', 'Notifikace má dorazit i do druhé otevřené karty téhož člověka');
  assert.equal(JSON.parse(b.data).text, 'Zákazník volal zpátky.', 'Obě karty dostanou stejný text');
} finally {
  notebook.zavri();
  mobil.zavri();
}
```

Notifikace se číslují po sobě napříč všemi příjemci.

```js
const otevriProud = async (adresa, hlavicky = {}) => {
  const stop = new AbortController();
  const res = await fetch(adresa, { headers: hlavicky, signal: stop.signal });
  const ctecka = res.body.getReader();
  const dekoder = new TextDecoder();
  let text = '';
  const dalsi = async ({ limit = 4000, komentare = false } = {}) => {
    for (;;) {
      const konec = text.indexOf('\n\n');
      if (konec !== -1) {
        const kus = text.slice(0, konec);
        text = text.slice(konec + 2);
        if (!komentare && kus.split('\n').every((radek) => radek.startsWith(':'))) continue;
        return kus;
      }
      const kousek = await Promise.race([ctecka.read(), helpers.wait(limit).then(() => 'cas')]);
      if (kousek === 'cas' || kousek.done) return null;
      text += dekoder.decode(kousek.value, { stream: true });
    }
  };
  const rozloz = (ramec) => {
    const pole = { data: [] };
    for (const radek of (ramec ?? '').split('\n')) {
      const dvojtecka = radek.indexOf(':');
      if (dvojtecka <= 0) continue;
      const klic = radek.slice(0, dvojtecka);
      const hodnota = radek.slice(dvojtecka + 1).replace(/^ /, '');
      if (klic === 'data') pole.data.push(hodnota);
      else pole[klic] = hodnota;
    }
    return { ...pole, data: pole.data.join('\n') };
  };
  return { res, dalsi, rozloz, zavri: () => stop.abort() };
};
const server = await helpers.startServer('src/server.js');
const prihlas = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const eva = await prihlas('eva@vltava.cz', 'tiket2026');
const posli = (token, telo) => fetch(new URL('/api/notifikace', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(telo),
});
const proud = await otevriProud(new URL(`/api/udalosti?token=${eva}`, server.url));
try {
  await proud.dalsi();
  const prvni = await posli(eva, { prijemce: 'eva@vltava.cz', text: 'První' });
  assert.equal((await prvni.json()).id, 1, 'První uložená notifikace má mít id 1');
  const a = proud.rozloz(await proud.dalsi());
  await posli(eva, { prijemce: 'petr@vltava.cz', text: 'Pro Petra' });
  await posli(eva, { prijemce: 'eva@vltava.cz', text: 'Třetí' });
  const b = proud.rozloz(await proud.dalsi());
  assert.equal(a.id, '1', `První notifikace má jít do proudu s id: 1, přišlo: ${a.id}`);
  assert.equal(b.id, '3', `Notifikace pro Petra si číslo vzala taky, takže třetí má id: 3 — přišlo: ${b.id}`);
} finally {
  proud.zavri();
}
```

Po znovupřipojení server doplní jen to, co uživatel zmeškal — a jen to, co mu patří.

```js
const otevriProud = async (adresa, hlavicky = {}) => {
  const stop = new AbortController();
  const res = await fetch(adresa, { headers: hlavicky, signal: stop.signal });
  const ctecka = res.body.getReader();
  const dekoder = new TextDecoder();
  let text = '';
  const dalsi = async ({ limit = 4000, komentare = false } = {}) => {
    for (;;) {
      const konec = text.indexOf('\n\n');
      if (konec !== -1) {
        const kus = text.slice(0, konec);
        text = text.slice(konec + 2);
        if (!komentare && kus.split('\n').every((radek) => radek.startsWith(':'))) continue;
        return kus;
      }
      const kousek = await Promise.race([ctecka.read(), helpers.wait(limit).then(() => 'cas')]);
      if (kousek === 'cas' || kousek.done) return null;
      text += dekoder.decode(kousek.value, { stream: true });
    }
  };
  const rozloz = (ramec) => {
    const pole = { data: [] };
    for (const radek of (ramec ?? '').split('\n')) {
      const dvojtecka = radek.indexOf(':');
      if (dvojtecka <= 0) continue;
      const klic = radek.slice(0, dvojtecka);
      const hodnota = radek.slice(dvojtecka + 1).replace(/^ /, '');
      if (klic === 'data') pole.data.push(hodnota);
      else pole[klic] = hodnota;
    }
    return { ...pole, data: pole.data.join('\n') };
  };
  return { res, dalsi, rozloz, zavri: () => stop.abort() };
};
const server = await helpers.startServer('src/server.js');
const prihlas = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const eva = await prihlas('eva@vltava.cz', 'tiket2026');
const posli = (telo) => fetch(new URL('/api/notifikace', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${eva}` },
  body: JSON.stringify(telo),
});
const prvni = await otevriProud(new URL(`/api/udalosti?token=${eva}`, server.url));
await prvni.dalsi();
await posli({ prijemce: 'eva@vltava.cz', text: 'Viděla jsem' });
const videla = prvni.rozloz(await prvni.dalsi());
prvni.zavri();
await helpers.waitFor(
  async () => (await (await fetch(new URL(`/api/stav?token=${eva}`, server.url))).json()).pripojenych === 0,
  3000,
).catch(() => null);
await posli({ prijemce: 'petr@vltava.cz', text: 'Cizí, Petrovi' });
await posli({ prijemce: '*', text: 'Hromadné pro všechny' });
await posli({ prijemce: 'eva@vltava.cz', text: 'Zmeškala jsem' });
const znovu = await otevriProud(new URL(`/api/udalosti?token=${eva}`, server.url), { 'Last-Event-ID': videla.id });
try {
  const uvitani = znovu.rozloz(await znovu.dalsi());
  assert.equal(uvitani.event, 'pripojeno', 'I po znovupřipojení přijde nejdřív událost pripojeno');
  const doplnene = [];
  for (let i = 0; i < 2; i += 1) doplnene.push(znovu.rozloz(await znovu.dalsi()));
  const texty = doplnene.map((udalost) => JSON.parse(udalost.data ?? '{}').text);
  assert.deepEqual(texty, ['Hromadné pro všechny', 'Zmeškala jsem'], `Doplnit se mají jen zmeškané notifikace Evy v původním pořadí, přišlo: ${texty.join(' | ')}`);
  const navic = await znovu.dalsi({ limit: 800 });
  assert.equal(navic, null, `Po doplnění zmeškaných už nemá přijít nic — přišlo: ${navic}`);
} finally {
  znovu.zavri();
}
```

`GET /api/stav` počítá otevřené proudy a po odpojení číslo klesne.

```js
const otevriProud = async (adresa, hlavicky = {}) => {
  const stop = new AbortController();
  const res = await fetch(adresa, { headers: hlavicky, signal: stop.signal });
  const ctecka = res.body.getReader();
  const dekoder = new TextDecoder();
  let text = '';
  const dalsi = async ({ limit = 4000, komentare = false } = {}) => {
    for (;;) {
      const konec = text.indexOf('\n\n');
      if (konec !== -1) {
        const kus = text.slice(0, konec);
        text = text.slice(konec + 2);
        if (!komentare && kus.split('\n').every((radek) => radek.startsWith(':'))) continue;
        return kus;
      }
      const kousek = await Promise.race([ctecka.read(), helpers.wait(limit).then(() => 'cas')]);
      if (kousek === 'cas' || kousek.done) return null;
      text += dekoder.decode(kousek.value, { stream: true });
    }
  };
  const rozloz = (ramec) => {
    const pole = { data: [] };
    for (const radek of (ramec ?? '').split('\n')) {
      const dvojtecka = radek.indexOf(':');
      if (dvojtecka <= 0) continue;
      const klic = radek.slice(0, dvojtecka);
      const hodnota = radek.slice(dvojtecka + 1).replace(/^ /, '');
      if (klic === 'data') pole.data.push(hodnota);
      else pole[klic] = hodnota;
    }
    return { ...pole, data: pole.data.join('\n') };
  };
  return { res, dalsi, rozloz, zavri: () => stop.abort() };
};
const server = await helpers.startServer('src/server.js');
const prihlas = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const eva = await prihlas('eva@vltava.cz', 'tiket2026');
const petr = await prihlas('petr@vltava.cz', 'kotva2026');
const stav = async () => (await (await fetch(new URL(`/api/stav?token=${eva}`, server.url))).json()).pripojenych;
assert.equal(await stav(), 0, 'Dokud nikdo neposlouchá, je pripojenych 0');
const proudEvy = await otevriProud(new URL(`/api/udalosti?token=${eva}`, server.url));
const proudPetra = await otevriProud(new URL(`/api/udalosti?token=${petr}`, server.url));
await proudEvy.dalsi();
await proudPetra.dalsi();
assert.equal(await stav(), 2, 'Dva otevřené proudy jsou pripojenych 2');
proudPetra.zavri();
const po = await helpers.waitFor(async () => (await stav()) === 1, 3000).catch(() => false);
assert.ok(po, `Po odpojení Petra má být pripojenych 1 — uklízíš po zavřeném spojení? Výstup serveru:\n${server.output()}`);
proudEvy.zavri();
```

Do otevřeného proudu chodí heartbeat a po odpojení po něm nezůstane časovač.

```js
const otevriProud = async (adresa, hlavicky = {}) => {
  const stop = new AbortController();
  const res = await fetch(adresa, { headers: hlavicky, signal: stop.signal });
  const ctecka = res.body.getReader();
  const dekoder = new TextDecoder();
  let text = '';
  const dalsi = async ({ limit = 4000, komentare = false } = {}) => {
    for (;;) {
      const konec = text.indexOf('\n\n');
      if (konec !== -1) {
        const kus = text.slice(0, konec);
        text = text.slice(konec + 2);
        if (!komentare && kus.split('\n').every((radek) => radek.startsWith(':'))) continue;
        return kus;
      }
      const kousek = await Promise.race([ctecka.read(), helpers.wait(limit).then(() => 'cas')]);
      if (kousek === 'cas' || kousek.done) return null;
      text += dekoder.decode(kousek.value, { stream: true });
    }
  };
  const rozloz = (ramec) => {
    const pole = { data: [] };
    for (const radek of (ramec ?? '').split('\n')) {
      const dvojtecka = radek.indexOf(':');
      if (dvojtecka <= 0) continue;
      const klic = radek.slice(0, dvojtecka);
      const hodnota = radek.slice(dvojtecka + 1).replace(/^ /, '');
      if (klic === 'data') pole.data.push(hodnota);
      else pole[klic] = hodnota;
    }
    return { ...pole, data: pole.data.join('\n') };
  };
  return { res, dalsi, rozloz, zavri: () => stop.abort() };
};
const server = await helpers.startServer('src/server.js', { env: { PING_MS: '150' } });
const { token } = await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'eva@vltava.cz', heslo: 'tiket2026' }),
})).json();
const proud = await otevriProud(new URL(`/api/udalosti?token=${token}`, server.url));
await proud.dalsi();
const prvni = await proud.dalsi({ limit: 2500, komentare: true });
assert.ok(prvni, `I bez notifikace má do proudu chodit heartbeat (interval bereš z PING_MS?). Výstup serveru:\n${server.output()}`);
assert.ok(prvni.startsWith(':'), `Heartbeat je komentářový rámec začínající dvojtečkou, přišlo: ${JSON.stringify(prvni)}`);
const druhy = await proud.dalsi({ limit: 2500, komentare: true });
assert.ok(druhy && druhy.startsWith(':'), 'Heartbeat se má opakovat, ne přijít jednou');
proud.zavri();
await helpers.wait(700);
const stav = await fetch(new URL(`/api/stav?token=${token}`, server.url));
assert.equal(stav.status, 200, `Po odpojení musí server běžet dál — nezůstal po klientovi časovač, který píše do zavřené odpovědi? Výstup serveru:\n${server.output()}`);
assert.equal((await stav.json()).pripojenych, 0, 'Po odpojení nemá zůstat připojený nikdo');
```

Neplatný vstup a neznámá cesta mají stejný tvar chyby jako zbytek API.

```js
const otevriProud = async (adresa, hlavicky = {}) => {
  const stop = new AbortController();
  const res = await fetch(adresa, { headers: hlavicky, signal: stop.signal });
  const ctecka = res.body.getReader();
  const dekoder = new TextDecoder();
  let text = '';
  const dalsi = async ({ limit = 4000, komentare = false } = {}) => {
    for (;;) {
      const konec = text.indexOf('\n\n');
      if (konec !== -1) {
        const kus = text.slice(0, konec);
        text = text.slice(konec + 2);
        if (!komentare && kus.split('\n').every((radek) => radek.startsWith(':'))) continue;
        return kus;
      }
      const kousek = await Promise.race([ctecka.read(), helpers.wait(limit).then(() => 'cas')]);
      if (kousek === 'cas' || kousek.done) return null;
      text += dekoder.decode(kousek.value, { stream: true });
    }
  };
  const rozloz = (ramec) => {
    const pole = { data: [] };
    for (const radek of (ramec ?? '').split('\n')) {
      const dvojtecka = radek.indexOf(':');
      if (dvojtecka <= 0) continue;
      const klic = radek.slice(0, dvojtecka);
      const hodnota = radek.slice(dvojtecka + 1).replace(/^ /, '');
      if (klic === 'data') pole.data.push(hodnota);
      else pole[klic] = hodnota;
    }
    return { ...pole, data: pole.data.join('\n') };
  };
  return { res, dalsi, rozloz, zavri: () => stop.abort() };
};
const server = await helpers.startServer('src/server.js');
const { token } = await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'eva@vltava.cz', heslo: 'tiket2026' }),
})).json();
const nikde = await fetch(new URL('/api/neexistuje', server.url));
assert.equal(nikde.status, 404, 'Neznámá cesta má vrátit stav 404');
assert.equal((await nikde.json()).chyba?.kod, 'NENALEZENO', 'Neznámá cesta má mít kód NENALEZENO');
const posli = (telo) => fetch(new URL('/api/notifikace', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: telo,
});
const spatne = [
  JSON.stringify({ prijemce: 'nikdo@vltava.cz', text: 'Komu?' }),
  JSON.stringify({ prijemce: 'eva@vltava.cz' }),
  JSON.stringify({ prijemce: 'eva@vltava.cz', text: '   ' }),
  JSON.stringify({ text: 'Bez příjemce' }),
  'tohle není json',
];
for (const telo of spatne) {
  const res = await posli(telo);
  assert.equal(res.status, 400, `Tělo ${telo} má skončit stavem 400, přišlo ${res.status}`);
  assert.equal((await res.json()).chyba?.kod, 'NEPLATNY_VSTUP', `Tělo ${telo} má mít kód NEPLATNY_VSTUP`);
}
const proud = await otevriProud(new URL(`/api/udalosti?token=${token}`, server.url));
try {
  await proud.dalsi();
  await posli(JSON.stringify({ prijemce: 'eva@vltava.cz', text: '' }));
  const nic = await proud.dalsi({ limit: 800 });
  assert.equal(nic, null, `Odmítnutá notifikace se nesmí rozesílat — do proudu přišlo: ${nic}`);
} finally {
  proud.zavri();
}
```

Bez tokenu se notifikace neuloží ani nerozešle.

```js
const otevriProud = async (adresa, hlavicky = {}) => {
  const stop = new AbortController();
  const res = await fetch(adresa, { headers: hlavicky, signal: stop.signal });
  const ctecka = res.body.getReader();
  const dekoder = new TextDecoder();
  let text = '';
  const dalsi = async ({ limit = 4000, komentare = false } = {}) => {
    for (;;) {
      const konec = text.indexOf('\n\n');
      if (konec !== -1) {
        const kus = text.slice(0, konec);
        text = text.slice(konec + 2);
        if (!komentare && kus.split('\n').every((radek) => radek.startsWith(':'))) continue;
        return kus;
      }
      const kousek = await Promise.race([ctecka.read(), helpers.wait(limit).then(() => 'cas')]);
      if (kousek === 'cas' || kousek.done) return null;
      text += dekoder.decode(kousek.value, { stream: true });
    }
  };
  const rozloz = (ramec) => {
    const pole = { data: [] };
    for (const radek of (ramec ?? '').split('\n')) {
      const dvojtecka = radek.indexOf(':');
      if (dvojtecka <= 0) continue;
      const klic = radek.slice(0, dvojtecka);
      const hodnota = radek.slice(dvojtecka + 1).replace(/^ /, '');
      if (klic === 'data') pole.data.push(hodnota);
      else pole[klic] = hodnota;
    }
    return { ...pole, data: pole.data.join('\n') };
  };
  return { res, dalsi, rozloz, zavri: () => stop.abort() };
};
const server = await helpers.startServer('src/server.js');
const { token } = await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'eva@vltava.cz', heslo: 'tiket2026' }),
})).json();
const proud = await otevriProud(new URL(`/api/udalosti?token=${token}`, server.url));
try {
  await proud.dalsi();
  const res = await fetch(new URL('/api/notifikace', server.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prijemce: 'eva@vltava.cz', text: 'Od nikoho' }),
  });
  assert.equal(res.status, 401, `Bez tokenu má POST /api/notifikace vrátit stav 401, přišlo ${res.status}`);
  assert.equal((await res.json()).chyba?.kod, 'NEPRIHLASEN', 'Chybějící token má mít kód NEPRIHLASEN');
  const nic = await proud.dalsi({ limit: 800 });
  assert.equal(nic, null, `Notifikace od nepřihlášeného se nesmí rozeslat — do proudu přišlo: ${nic}`);
} finally {
  proud.zavri();
}
```

# --help--

## --tip--

Nezačínej notifikacemi. Nejdřív si udělej dvě věci, o které se opře všechno ostatní:
jednu funkci na chybovou odpověď v jednotném tvaru a jednu funkci, která z požadavku
vytáhne přihlášeného (nebo `null`). Pak je každá routa jen dvě podmínky.

## --tip--

Rozmysli si, **co** si o otevřeném spojení ukládáš. Samotná odpověď ti nestačí —
u rozesílání potřebuješ vedle ní vědět, komu patří. Ukládej si tedy dvojici a při
rozesílání ji čti: patří zpráva tomuhle e-mailu, nebo je hromadná?

# --seed--

## --file-- package.json

```json
{
  "name": "notifikace-vltava",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/server.js"
  }
}
```

## --file-- data/ucty.json

```json
[
  { "email": "eva@vltava.cz", "jmeno": "Eva Konečná", "heslo": "tiket2026" },
  { "email": "petr@vltava.cz", "jmeno": "Petr Vaněk", "heslo": "kotva2026" },
  { "email": "sprava@vltava.cz", "jmeno": "Služba podpory", "heslo": "dispecink2026" }
]
```

## --file-- src/server.js

```js
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const ucty = JSON.parse(readFileSync(new URL('../data/ucty.json', import.meta.url), 'utf8'));

const port = Number(process.env.PORT ?? 3000);

// Vydané tokeny: token -> e-mail. Po restartu je prázdné, databáze tu není potřeba.
const tokeny = new Map();

function posliJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

// Jediné místo, kde vzniká chybová odpověď. Volej ji odevšad.
function posliChybu(res, status, kod, zprava) {
  posliJson(res, status, { chyba: { kod, zprava } });
}

// Přečte tělo požadavku a převede ho z JSON. Když tělo není platný JSON, vrátí null.
async function prectiJson(req) {
  const kousky = [];
  for await (const kousek of req) kousky.push(kousek);
  if (kousky.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(kousky).toString('utf8'));
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // TODO: POST /api/prihlaseni — ověř účet a vydej token
  // TODO: GET /api/udalosti — proud jen pro přihlášené, uvítání, heartbeat, úklid
  // TODO: POST /api/notifikace — ulož, očísluj a pošli tomu, komu patří
  // TODO: GET /api/stav — kolik proudů je právě otevřených

  posliChybu(res, 404, 'NENALEZENO', `Cesta ${req.method} ${url.pathname} tady není.`);
});

server.listen(port, () => {
  console.log(`Notifikace Vltava Software běží na http://localhost:${port}`);
});
```

# --solution--

## --file-- src/server.js

```js
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const ucty = JSON.parse(readFileSync(new URL('../data/ucty.json', import.meta.url), 'utf8'));

const port = Number(process.env.PORT ?? 3000);
const pingMs = Number(process.env.PING_MS ?? 15000);

const tokeny = new Map(); // token -> e-mail
const klienti = new Set(); // { email, res }
const historie = []; // posledních 100 notifikací
let posledniId = 0;

function posliJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function posliChybu(res, status, kod, zprava) {
  posliJson(res, status, { chyba: { kod, zprava } });
}

async function prectiJson(req) {
  const kousky = [];
  for await (const kousek of req) kousky.push(kousek);
  if (kousky.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(kousky).toString('utf8'));
  } catch {
    return null;
  }
}

// Jeden rámec Server-Sent Events. Prázdný řádek na konci ukončuje událost.
function ramec({ id, typ, data }) {
  let text = '';
  if (id !== undefined) text += `id: ${id}\n`;
  text += `event: ${typ}\n`;
  text += `data: ${JSON.stringify(data)}\n`;
  return `${text}\n`;
}

// Hvězdička znamená „všem"; jinak notifikace patří jedinému e-mailu.
const patriMi = (prijemce, email) => prijemce === '*' || prijemce === email;

// Token bereme z query (EventSource hlavičky posílat neumí) i z Authorization.
function prihlaseny(req, url) {
  const zHlavicky = (req.headers.authorization ?? '').replace(/^Bearer /, '');
  const token = url.searchParams.get('token') ?? zHlavicky;
  return tokeny.get(token) ?? null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'POST' && url.pathname === '/api/prihlaseni') {
    const telo = await prectiJson(req);
    const ucet = ucty.find((polozka) => polozka.email === telo?.email && polozka.heslo === telo?.heslo);
    // Stejná odpověď pro špatné heslo i neznámý e-mail: jinak jde zjistit, kdo tu účet má.
    if (!ucet) {
      posliChybu(res, 401, 'SPATNE_UDAJE', 'E-mail nebo heslo nesedí.');
      return;
    }
    const token = randomBytes(24).toString('hex');
    tokeny.set(token, ucet.email);
    posliJson(res, 200, { token, email: ucet.email });
    return;
  }

  const email = prihlaseny(req, url);

  if (req.method === 'GET' && url.pathname === '/api/stav') {
    if (!email) {
      posliChybu(res, 401, 'NEPRIHLASEN', 'Přihlas se.');
      return;
    }
    posliJson(res, 200, { pripojenych: klienti.size });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/notifikace') {
    if (!email) {
      posliChybu(res, 401, 'NEPRIHLASEN', 'Přihlas se.');
      return;
    }
    const telo = await prectiJson(req);
    const prijemce = telo?.prijemce;
    const text = telo?.text;
    const znamy = prijemce === '*' || ucty.some((ucet) => ucet.email === prijemce);
    if (!znamy || typeof text !== 'string' || text.trim() === '') {
      posliChybu(res, 400, 'NEPLATNY_VSTUP', 'Notifikace potřebuje známého příjemce a neprázdný text.');
      return;
    }

    posledniId += 1;
    const notifikace = { id: posledniId, prijemce, text, od: email };
    historie.push(notifikace);
    if (historie.length > 100) historie.shift();

    const zprava = ramec({ id: notifikace.id, typ: 'notifikace', data: notifikace });
    for (const klient of klienti) {
      if (patriMi(prijemce, klient.email)) klient.res.write(zprava);
    }
    posliJson(res, 201, notifikace);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/udalosti') {
    if (!email) {
      posliChybu(res, 401, 'NEPRIHLASEN', 'Přihlas se.');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders();
    res.write(ramec({ typ: 'pripojeno', data: { email } }));

    // Kdo se vrací po výpadku, pošle číslo poslední notifikace, kterou viděl.
    const odkud = Number(req.headers['last-event-id'] ?? 0);
    if (odkud > 0) {
      for (const notifikace of historie) {
        if (notifikace.id > odkud && patriMi(notifikace.prijemce, email)) {
          res.write(ramec({ id: notifikace.id, typ: 'notifikace', data: notifikace }));
        }
      }
    }

    const klient = { email, res };
    klienti.add(klient);

    const ping = setInterval(() => res.write(': ping\n\n'), pingMs);

    req.on('close', () => {
      clearInterval(ping);
      klienti.delete(klient);
    });
    return;
  }

  posliChybu(res, 404, 'NENALEZENO', `Cesta ${req.method} ${url.pathname} tady není.`);
});

server.listen(port, () => {
  console.log(`Notifikace Vltava Software běží na http://localhost:${port}`);
});
```

# --approaches--

## --approach-- Spojení v jednom poli a filtr až při rozesílání

Místo množiny dvojic drží server obyčejné pole spojení a komu zpráva patří, řeší až
`filter` při rozesílání. Kódu je o kousek míň a čte se to lineárně. Cenu za to zaplatíš
v okamžiku, kdy bude přihlášených tisíc a notifikace půjde jednomu z nich: projdeš
pokaždé celý seznam. Do firemního helpdesku to bohatě stačí, do veřejné aplikace už ne.

### --file-- src/server.js

```js
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const ucty = JSON.parse(readFileSync(new URL('../data/ucty.json', import.meta.url), 'utf8'));

const port = Number(process.env.PORT ?? 3000);
const pingMs = Number(process.env.PING_MS ?? 15000);

const tokeny = new Map();
const spojeni = [];
const historie = [];
let posledniId = 0;

function posliJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function posliChybu(res, status, kod, zprava) {
  posliJson(res, status, { chyba: { kod, zprava } });
}

async function prectiJson(req) {
  const kousky = [];
  for await (const kousek of req) kousky.push(kousek);
  if (kousky.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(kousky).toString('utf8'));
  } catch {
    return null;
  }
}

function ramec({ id, typ, data }) {
  const radky = [];
  if (id !== undefined) radky.push(`id: ${id}`);
  radky.push(`event: ${typ}`);
  radky.push(`data: ${JSON.stringify(data)}`);
  return `${radky.join('\n')}\n\n`;
}

const patriMi = (prijemce, email) => prijemce === '*' || prijemce === email;

function prihlaseny(req, url) {
  const token = url.searchParams.get('token') ?? (req.headers.authorization ?? '').replace(/^Bearer /, '');
  return tokeny.get(token) ?? null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'POST' && url.pathname === '/api/prihlaseni') {
    const telo = await prectiJson(req);
    const ucet = ucty.find((polozka) => polozka.email === telo?.email && polozka.heslo === telo?.heslo);
    if (!ucet) {
      posliChybu(res, 401, 'SPATNE_UDAJE', 'E-mail nebo heslo nesedí.');
      return;
    }
    const token = randomBytes(24).toString('hex');
    tokeny.set(token, ucet.email);
    posliJson(res, 200, { token, email: ucet.email });
    return;
  }

  const email = prihlaseny(req, url);
  const chraneno = ['/api/stav', '/api/notifikace', '/api/udalosti'].includes(url.pathname);
  if (chraneno && !email) {
    posliChybu(res, 401, 'NEPRIHLASEN', 'Přihlas se.');
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/stav') {
    posliJson(res, 200, { pripojenych: spojeni.length });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/notifikace') {
    const telo = await prectiJson(req);
    const prijemce = telo?.prijemce;
    const text = telo?.text;
    const znamy = prijemce === '*' || ucty.some((ucet) => ucet.email === prijemce);
    if (!znamy || typeof text !== 'string' || text.trim() === '') {
      posliChybu(res, 400, 'NEPLATNY_VSTUP', 'Notifikace potřebuje známého příjemce a neprázdný text.');
      return;
    }

    posledniId += 1;
    const notifikace = { id: posledniId, prijemce, text, od: email };
    historie.push(notifikace);
    if (historie.length > 100) historie.shift();

    const zprava = ramec({ id: notifikace.id, typ: 'notifikace', data: notifikace });
    for (const klient of spojeni.filter((polozka) => patriMi(prijemce, polozka.email))) {
      klient.res.write(zprava);
    }
    posliJson(res, 201, notifikace);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/udalosti') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders();
    res.write(ramec({ typ: 'pripojeno', data: { email } }));

    const odkud = Number(req.headers['last-event-id'] ?? 0);
    if (odkud > 0) {
      const zmeskane = historie.filter((notifikace) => notifikace.id > odkud && patriMi(notifikace.prijemce, email));
      for (const notifikace of zmeskane) {
        res.write(ramec({ id: notifikace.id, typ: 'notifikace', data: notifikace }));
      }
    }

    const klient = { email, res };
    spojeni.push(klient);

    const ping = setInterval(() => res.write(': ping\n\n'), pingMs);

    req.on('close', () => {
      clearInterval(ping);
      const kde = spojeni.indexOf(klient);
      if (kde !== -1) spojeni.splice(kde, 1);
    });
    return;
  }

  posliChybu(res, 404, 'NENALEZENO', `Cesta ${req.method} ${url.pathname} tady není.`);
});

server.listen(port, () => {
  console.log(`Notifikace Vltava Software běží na http://localhost:${port}`);
});
```

## --approach-- Mapa e-mail → spojení a routy v Expressu

Tenhle přístup se nedívá na spojení jako na jeden seznam, ale jako na **poštovní
přihrádky**: `Map` z e-mailu na množinu jeho otevřených spojení. Doručení jednomu
příjemci je pak jedno sáhnutí do mapy bez procházení. Navíc jsou routy popsané
Expressem, takže se hned pozná, co API umí; za to si musíš pohlídat vlastní obsluhu
chyb, jinak Express na neplatný JSON odpoví HTML stránkou místo tvého tvaru chyby.

### --file-- src/server.js

```js
import express from 'express';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const ucty = JSON.parse(readFileSync(new URL('../data/ucty.json', import.meta.url), 'utf8'));

const port = Number(process.env.PORT ?? 3000);
const pingMs = Number(process.env.PING_MS ?? 15000);

const tokeny = new Map();
const prihradky = new Map(); // e-mail -> Set odpovědí
const historie = [];
let posledniId = 0;

const app = express();
app.use(express.json());

function posliChybu(res, status, kod, zprava) {
  res.status(status).json({ chyba: { kod, zprava } });
}

function ramec({ id, typ, data }) {
  let text = '';
  if (id !== undefined) text += `id: ${id}\n`;
  text += `event: ${typ}\n`;
  text += `data: ${JSON.stringify(data)}\n`;
  return `${text}\n`;
}

const patriMi = (prijemce, email) => prijemce === '*' || prijemce === email;

function komuPoslat(prijemce) {
  if (prijemce !== '*') return prihradky.get(prijemce) ?? new Set();
  return new Set([...prihradky.values()].flatMap((skupina) => [...skupina]));
}

app.post('/api/prihlaseni', (req, res) => {
  const { email, heslo } = req.body ?? {};
  const ucet = ucty.find((polozka) => polozka.email === email && polozka.heslo === heslo);
  if (!ucet) {
    posliChybu(res, 401, 'SPATNE_UDAJE', 'E-mail nebo heslo nesedí.');
    return;
  }
  const token = randomBytes(24).toString('hex');
  tokeny.set(token, ucet.email);
  res.status(200).json({ token, email: ucet.email });
});

app.use(['/api/stav', '/api/notifikace', '/api/udalosti'], (req, res, next) => {
  const zHlavicky = (req.headers.authorization ?? '').replace(/^Bearer /, '');
  const email = tokeny.get(req.query.token ?? zHlavicky);
  if (!email) {
    posliChybu(res, 401, 'NEPRIHLASEN', 'Přihlas se.');
    return;
  }
  req.email = email;
  next();
});

app.get('/api/stav', (req, res) => {
  const pripojenych = [...prihradky.values()].reduce((soucet, skupina) => soucet + skupina.size, 0);
  res.status(200).json({ pripojenych });
});

app.post('/api/notifikace', (req, res) => {
  const { prijemce, text } = req.body ?? {};
  const znamy = prijemce === '*' || ucty.some((ucet) => ucet.email === prijemce);
  if (!znamy || typeof text !== 'string' || text.trim() === '') {
    posliChybu(res, 400, 'NEPLATNY_VSTUP', 'Notifikace potřebuje známého příjemce a neprázdný text.');
    return;
  }

  posledniId += 1;
  const notifikace = { id: posledniId, prijemce, text, od: req.email };
  historie.push(notifikace);
  if (historie.length > 100) historie.shift();

  const zprava = ramec({ id: notifikace.id, typ: 'notifikace', data: notifikace });
  for (const odpoved of komuPoslat(prijemce)) odpoved.write(zprava);
  res.status(201).json(notifikace);
});

app.get('/api/udalosti', (req, res) => {
  const { email } = req;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  res.write(ramec({ typ: 'pripojeno', data: { email } }));

  const odkud = Number(req.headers['last-event-id'] ?? 0);
  if (odkud > 0) {
    for (const notifikace of historie) {
      if (notifikace.id > odkud && patriMi(notifikace.prijemce, email)) {
        res.write(ramec({ id: notifikace.id, typ: 'notifikace', data: notifikace }));
      }
    }
  }

  if (!prihradky.has(email)) prihradky.set(email, new Set());
  prihradky.get(email).add(res);

  const ping = setInterval(() => res.write(': ping\n\n'), pingMs);

  req.on('close', () => {
    clearInterval(ping);
    prihradky.get(email)?.delete(res);
  });
});

app.use((req, res) => {
  posliChybu(res, 404, 'NENALEZENO', `Cesta ${req.method} ${req.path} tady není.`);
});

// Bez téhle obsluhy odpoví Express na neplatný JSON HTML stránkou.
app.use((chyba, req, res, next) => {
  posliChybu(res, 400, 'NEPLATNY_VSTUP', 'Tělo požadavku musí být platný JSON.');
});

app.listen(port, () => {
  console.log(`Notifikace Vltava Software běží na http://localhost:${port}`);
});
```

# --review--

Testy kontrolují chování. Tohle si projdi sám, než kanál odevzdáš.

## --rubric--

- Chybová odpověď vzniká na jednom místě, ne v každé routě zvlášť. Zkus změnit tvar
  chyby — musíš sahat jen do jedné funkce.
- Ověření „kdo to je" je jedna funkce, kterou volají všechny chráněné routy. Nikde
  nečteš token ručně podruhé.
- Rozhodnutí „komu zpráva patří" je taky na jednom místě. Kdyby zítra přibyly skupiny
  (`tym:podpora`), měníš jedinou funkci.
- Zkoušel jsi proud `curl`em: `curl -N "http://localhost:3000/api/udalosti?token=…"`
  a v druhém okně jsi poslal notifikaci. Viděl jsi celý rámec i s prázdným řádkem.
- Token je v adrese, takže se objeví v logu proxy. Rozmyslel sis, co by se s tím dalo
  udělat, a umíš to říct nahlas.
- Do logu serveru se nedostane heslo ani token.
- Po odpojení klienta nezůstane v paměti ani spojení, ani časovač. Ověřil jsi to přes
  `GET /api/stav`, ne odhadem.

## --extensions--

- Nech notifikaci potvrdit: `POST /api/notifikace/:id/precteno` a `necteno` v uvítací
  události, ať se po přihlášení dá ukázat odznak s počtem.
- Přidej skupiny příjemců (`tym:podpora`) a rozmysli si, kde se má členství vyhodnotit
  — při odesílání, nebo při doručení?
- Omez počet otevřených proudů na uživatele (třeba pět) a ten nejstarší zavři. Vyzkoušej
  si, jak se server zachová, když limit překročíš.
- Postav k tomu jednoduchou stránku: `EventSource`, seznam notifikací a zvoneček
  s počtem. Přihlášení vyřeš formulářem a token si ulož do `sessionStorage`.
