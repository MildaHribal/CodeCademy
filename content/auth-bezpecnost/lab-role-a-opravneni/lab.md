---
title: Role a oprávnění
runtime: node
timeoutMs: 30000
see: auth-bezpecnost/session-a-cookies#autentizace-a-autorizace
---

# --description--

Obec Lipovec vydává zpravodaj. Dnes ho dělá jeden člověk ve Wordu, a když má dovolenou,
nevyjde. Postav pro něj JSON API, ve kterém se o práci podělí tři role: **čtenář** vidí,
co vyšlo, **redakce** píše a publikuje, **správce** navíc maže, mění role a vidí, kdo co
dělal.

Pracuješ v `src/server.js`. Kostra serveru, články v `data/clanky.json` a `package.json`
už tam jsou, všechno ostatní je na tobě. Stav si drž v paměti, databáze tu potřeba není.

Předinstalovaný máš `express` i `zod` — použij je, nebo si vystač s `node:http` a vlastní
kontrolou vstupu. Testy kontrolují chování, ne nástroj. Hashovat umí `node:crypto`.

## Co má platit

**Účty a přihlášení**

1. Od startu jsou v paměti tři účty: `ctenar@lipovec.cz` / `zpravodaj-ctu` (role `ctenar`),
   `redakce@lipovec.cz` / `redakce-2026` (role `redaktor`) a `starosta@lipovec.cz` /
   `lipovec-urad` (role `spravce`). Hesla ulož jako otisk se solí, ne otevřeně.
2. `POST /api/prihlaseni` s `{ email, heslo }` vrátí `200` a `{ token, role }`. Špatné
   heslo i neznámý e-mail vracejí **stejnou** odpověď: `401` a kód `SPATNE_UDAJE`.
3. Chyby mají jednotný tvar `{ "error": { "code": "…", "message": "…" } }`. Heslo ani
   otisk se nikdy nevracejí v odpovědi.
4. Všechno kromě `POST /api/prihlaseni` a veřejného seznamu článků chce hlavičku
   `Authorization: Bearer <token>`. Bez ní nebo s neplatným tokenem `401` a kód
   `NEPRIHLASEN`. Přihlášený uživatel bez práva dostane `403` a kód `BEZ_OPRAVNENI` —
   ty dva stavy se nesmí plést.

**Práva rolí**

5. Oprávnění pojmenuj a drž je na jednom místě, ne v podmínkách roztroušených po routách:

   | právo | `ctenar` | `redaktor` | `spravce` |
   |---|---|---|---|
   | `clanek:cist-koncept` | ne | ano | ano |
   | `clanek:psat` | ne | ano | ano |
   | `clanek:publikovat` | ne | ano | ano |
   | `clanek:upravit-cizi` | ne | ne | ano |
   | `clanek:mazat` | ne | ne | ano |
   | `uzivatel:menit-roli` | ne | ne | ano |
   | `audit:cist` | ne | ne | ano |

**Články**

6. `GET /api/clanky` je veřejné a vrací jen publikované články, od nejnovějšího podle
   `vydano`. Odpověď má tvar `{ items, page, perPage, total }`; `?page` a `?perPage`
   se dají zadat, výchozí je `1` a `10` a `perPage` je nejvýš `50`.
7. `GET /api/clanky?stav=koncept` vrací rozepsané články a chce právo `clanek:cist-koncept`.
8. `POST /api/clanky` s `{ nazev, text }` chce právo `clanek:psat` a vrátí `201`. Nový
   článek je vždy `koncept` a jeho autorem je přihlášený uživatel — `stav` ani `autor`
   z těla požadavku se neberou v úvahu. Prázdný název je `400` a kód `SPATNY_VSTUP`.
9. `PATCH /api/clanky/:id` s `{ nazev }` nebo `{ text }` smí autor u svého článku bez
   dalšího práva. U cizího článku je potřeba právo `clanek:upravit-cizi`.
10. `POST /api/clanky/:id/publikovat` chce právo `clanek:publikovat`, nastaví stav na
    `publikovano` a datum `vydano` na dnešek (`RRRR-MM-DD`). Článek se pak objeví
    ve veřejném seznamu.
11. `DELETE /api/clanky/:id` chce právo `clanek:mazat` a vrací `204`. Neexistující článek
    je `404` a kód `NENALEZENO` — ale jen pro toho, kdo mazat smí. Kdo právo nemá, dostane
    `403` i u neexistujícího článku, aby se z odpovědí nedalo zjišťovat, co v redakci leží.

**Správa a stopa**

12. `PUT /api/uzivatele/:id/role` s `{ role }` chce právo `uzivatel:menit-roli`. Neznámá
    role je `400` a kód `NEZNAMA_ROLE`, neexistující účet `404`, změna **vlastní** role
    `409` a kód `SAM_SOBE` (ať si poslední správce neodebere práva). Po změně platí nová
    práva hned.
13. Každé rozhodnutí o oprávnění se zapíše do auditu: `{ kdo, akce, cil, povoleno, kdy }`,
    a to **i když skončilo zamítnutím**. `GET /api/audit` vrátí `{ items }` a chce právo
    `audit:cist`.

> [!TIP]
> Postupuj po vrstvách, ne po požadavcích: nejdřív odpovídání a jednotný tvar chyb, pak
> přihlášení, pak jedno místo, které umí odpovědět na otázku „smí tenhle uživatel tohle?",
> a teprve nad tím routy. Po každé vrstvě si dej **Zkontrolovat**.

# --hints--

Přihlášení vydá token a chybné údaje se od sebe nedají odlišit.

```js
const server = await helpers.startServer('src/server.js');
const prihlasit = (email, heslo) => fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
});
const ok = await prihlasit('redakce@lipovec.cz', 'redakce-2026');
assert.equal(ok.status, 200, `Přihlášení správnými údaji má vrátit 200. Výstup serveru:\n${server.output()}`);
const telo = await ok.json();
assert.equal(typeof telo.token, 'string', 'Přihlášení má vrátit { token, role }');
assert.equal(telo.role, 'redaktor', 'Odpověď má obsahovat roli účtu');
assert.doesNotMatch(JSON.stringify(telo), /redakce-2026/, 'Heslo se nikdy nevrací v odpovědi');

const spatneHeslo = await prihlasit('redakce@lipovec.cz', 'uplne-jine-heslo');
const neznamyMail = await prihlasit('nikdo@lipovec.cz', 'redakce-2026');
assert.equal(spatneHeslo.status, 401, 'Špatné heslo má vrátit 401');
assert.equal(neznamyMail.status, 401, 'Neznámý e-mail má vrátit 401');
const obsah = await spatneHeslo.json();
assert.deepEqual(obsah, await neznamyMail.json(), 'Obě odpovědi musí být stejné, jinak jde zjistit, kdo je registrovaný');
assert.equal(obsah.error?.code, 'SPATNE_UDAJE', 'Chybné přihlášení má mít kód SPATNE_UDAJE');
assert.equal(typeof obsah.error?.message, 'string', 'Chyba má mít i lidskou zprávu v message');
```

Hesla se ukládají jako otisk se solí, ne otevřeně.

```js
const zdroj = Object.entries(files)
  .filter(([jmeno]) => jmeno.endsWith('.js'))
  .map(([, obsah]) => obsah)
  .join('\n');
assert.match(zdroj, /scrypt|pbkdf2/i, 'Heslo ulož jako otisk pomalým hashem z node:crypto (scrypt nebo pbkdf2)');
assert.match(zdroj, /randomBytes|randomUUID/, 'Ke každému heslu patří vlastní náhodná sůl');
```

Bez platného tokenu se dál nedostaneš, a to s kódem `NEPRIHLASEN`.

```js
const server = await helpers.startServer('src/server.js');
const bez = await fetch(new URL('/api/clanky?stav=koncept', server.url));
assert.equal(bez.status, 401, `Bez tokenu má routa vrátit 401. Výstup serveru:\n${server.output()}`);
assert.equal((await bez.json()).error?.code, 'NEPRIHLASEN', 'Chybějící přihlášení má mít kód NEPRIHLASEN');
const vymyslene = await fetch(new URL('/api/audit', server.url), {
  headers: { Authorization: 'Bearer vymysleny-token-0123456789' },
});
assert.equal(vymyslene.status, 401, 'Vymyšlený token nesmí nikoho přihlásit');
```

Veřejný seznam vrací jen publikované články, od nejnovějšího, se stránkováním.

```js
const server = await helpers.startServer('src/server.js');
const vse = await fetch(new URL('/api/clanky', server.url));
assert.equal(vse.status, 200, `Veřejný seznam má být bez přihlášení. Výstup serveru:\n${server.output()}`);
const telo = await vse.json();
assert.deepEqual(Object.keys(telo).sort(), ['items', 'page', 'perPage', 'total'], 'Odpověď má mít tvar { items, page, perPage, total }');
assert.equal(telo.total, 2, 'Publikované jsou dva články ze tří');
assert.ok(telo.items.every((clanek) => clanek.stav === 'publikovano'), 'Ve veřejném seznamu nesmí být koncept');
assert.deepEqual(telo.items.map((clanek) => clanek.id), [2, 1], 'Články mají jít od nejnovějšího podle data vydání');
assert.equal(telo.page, 1, 'Výchozí stránka je 1');
assert.equal(telo.perPage, 10, 'Výchozí velikost stránky je 10');

const prvni = await (await fetch(new URL('/api/clanky?page=1&perPage=1', server.url))).json();
assert.deepEqual(prvni.items.map((clanek) => clanek.id), [2], 'První stránka po jednom má obsahovat nejnovější článek');
const druha = await (await fetch(new URL('/api/clanky?page=2&perPage=1', server.url))).json();
assert.deepEqual(druha.items.map((clanek) => clanek.id), [1], 'Druhá stránka po jednom má obsahovat starší článek');
const prehnane = await (await fetch(new URL('/api/clanky?perPage=500', server.url))).json();
assert.equal(prehnane.perPage, 50, 'perPage má strop 50');
```

Koncepty uvidí jen ten, kdo má právo `clanek:cist-koncept`.

```js
const server = await helpers.startServer('src/server.js');
const token = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const ctenar = await token('ctenar@lipovec.cz', 'zpravodaj-ctu');
const redaktor = await token('redakce@lipovec.cz', 'redakce-2026');

const zamitnuto = await fetch(new URL('/api/clanky?stav=koncept', server.url), {
  headers: { Authorization: `Bearer ${ctenar}` },
});
assert.equal(zamitnuto.status, 403, 'Čtenář na koncepty nemá právo — 403, ne 401');
assert.equal((await zamitnuto.json()).error?.code, 'BEZ_OPRAVNENI', 'Chybějící oprávnění má mít kód BEZ_OPRAVNENI');

const povoleno = await fetch(new URL('/api/clanky?stav=koncept', server.url), {
  headers: { Authorization: `Bearer ${redaktor}` },
});
assert.equal(povoleno.status, 200, `Redaktor koncepty vidět má. Výstup serveru:\n${server.output()}`);
const koncepty = await povoleno.json();
assert.equal(koncepty.total, 1, 'Rozepsaný je jeden článek');
assert.equal(koncepty.items[0].id, 3, 'Rozepsaný je článek o rozpočtu');
```

Psát smí jen redakce a nový článek je vždy koncept přihlášeného autora.

```js
const server = await helpers.startServer('src/server.js');
const token = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const ctenar = await token('ctenar@lipovec.cz', 'zpravodaj-ctu');
const redaktor = await token('redakce@lipovec.cz', 'redakce-2026');
const napis = (token, telo) => fetch(new URL('/api/clanky', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(telo),
});

assert.equal((await napis(ctenar, { nazev: 'Chci psát' })).status, 403, 'Čtenář psát nesmí');

const vytvoreny = await napis(redaktor, {
  nazev: 'Hasiči mají nové vozidlo',
  text: 'Cisterna nahradí třicet let starou avii.',
  stav: 'publikovano',
  autor: 'ctenar@lipovec.cz',
});
assert.equal(vytvoreny.status, 201, `Redaktor má článek založit. Výstup serveru:\n${server.output()}`);
const clanek = await vytvoreny.json();
assert.equal(clanek.stav, 'koncept', 'Nový článek je vždy koncept, i když si klient pošle stav publikovano');
assert.equal(clanek.autor, 'redakce@lipovec.cz', 'Autorem je přihlášený uživatel, ne ten z těla požadavku');
assert.ok(clanek.id, 'Nový článek má dostat id');

assert.equal((await napis(redaktor, { nazev: '   ' })).status, 400, 'Prázdný název je 400');
assert.equal((await (await napis(redaktor, { nazev: '' })).json()).error?.code, 'SPATNY_VSTUP', 'Chybný vstup má kód SPATNY_VSTUP');
```

Svůj článek upraví autor, cizí jen ten, kdo na to má právo.

```js
const server = await helpers.startServer('src/server.js');
const token = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const redaktor = await token('redakce@lipovec.cz', 'redakce-2026');
const spravce = await token('starosta@lipovec.cz', 'lipovec-urad');
const uprav = (token, id, telo) => fetch(new URL(`/api/clanky/${id}`, server.url), {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(telo),
});

const vlastni = await uprav(redaktor, 1, { nazev: 'Nový chodník k mateřské škole je hotový' });
assert.equal(vlastni.status, 200, `Autor smí upravit svůj článek. Výstup serveru:\n${server.output()}`);
assert.equal((await vlastni.json()).nazev, 'Nový chodník k mateřské škole je hotový', 'Úprava se má projevit');

const cizi = await uprav(redaktor, 3, { nazev: 'Rozpočet je hotový' });
assert.equal(cizi.status, 403, 'Cizí článek redaktor upravovat nesmí — na to je právo clanek:upravit-cizi');

const spravcem = await uprav(spravce, 1, { text: 'Doplněno po jednání zastupitelstva.' });
assert.equal(spravcem.status, 200, 'Správce smí upravit i cizí článek');

assert.equal((await uprav(spravce, 999, { nazev: 'Nic' })).status, 404, 'Neexistující článek je 404');
```

Publikovat smí redakce a publikovaný článek se objeví ve veřejném seznamu.

```js
const server = await helpers.startServer('src/server.js');
const token = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const ctenar = await token('ctenar@lipovec.cz', 'zpravodaj-ctu');
const redaktor = await token('redakce@lipovec.cz', 'redakce-2026');
const publikuj = (token, id) => fetch(new URL(`/api/clanky/${id}/publikovat`, server.url), {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
});

assert.equal((await publikuj(ctenar, 3)).status, 403, 'Čtenář publikovat nesmí');
const vydano = await publikuj(redaktor, 3);
assert.equal(vydano.status, 200, `Redaktor má článek vydat. Výstup serveru:\n${server.output()}`);
const clanek = await vydano.json();
assert.equal(clanek.stav, 'publikovano', 'Publikovaný článek má stav publikovano');
assert.match(String(clanek.vydano), /^\d{4}-\d{2}-\d{2}$/, 'Datum vydání má tvar RRRR-MM-DD');

const verejne = await (await fetch(new URL('/api/clanky', server.url))).json();
assert.equal(verejne.total, 3, 'Po vydání jsou ve veřejném seznamu tři články');
assert.equal(verejne.items[0].id, 3, 'Právě vydaný článek je nahoře');
```

Mazat smí jen správce a bez práva se nedá zjišťovat, co existuje.

```js
const server = await helpers.startServer('src/server.js');
const token = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const redaktor = await token('redakce@lipovec.cz', 'redakce-2026');
const spravce = await token('starosta@lipovec.cz', 'lipovec-urad');
const smaz = (token, id) => fetch(new URL(`/api/clanky/${id}`, server.url), {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
});

assert.equal((await smaz(redaktor, 1)).status, 403, 'Redaktor mazat nesmí');
assert.equal((await smaz(redaktor, 999)).status, 403, 'Bez práva mazat je i neexistující článek 403, ne 404');
assert.equal((await smaz(spravce, 999)).status, 404, 'Správci se u neexistujícího článku ozve 404');
const smazano = await smaz(spravce, 1);
assert.equal(smazano.status, 204, `Správce má článek smazat. Výstup serveru:\n${server.output()}`);
const zbyle = await (await fetch(new URL('/api/clanky', server.url))).json();
assert.equal(zbyle.total, 1, 'Po smazání zbyl jeden publikovaný článek');
```

Roli mění jen správce, a to ne sobě.

```js
const server = await helpers.startServer('src/server.js');
const token = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const ctenar = await token('ctenar@lipovec.cz', 'zpravodaj-ctu');
const redaktor = await token('redakce@lipovec.cz', 'redakce-2026');
const spravce = await token('starosta@lipovec.cz', 'lipovec-urad');
const zmen = (token, id, role) => fetch(new URL(`/api/uzivatele/${id}/role`, server.url), {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ role }),
});

assert.equal((await zmen(redaktor, 1, 'spravce')).status, 403, 'Redaktor role měnit nesmí');
assert.equal((await zmen(spravce, 3, 'ctenar')).status, 409, 'Vlastní roli si správce změnit nemůže');
assert.equal((await (await zmen(spravce, 3, 'ctenar')).json()).error?.code, 'SAM_SOBE', 'Změna vlastní role má kód SAM_SOBE');
assert.equal((await zmen(spravce, 1, 'kral')).status, 400, 'Neznámá role je 400');
assert.equal((await (await zmen(spravce, 1, 'kral')).json()).error?.code, 'NEZNAMA_ROLE', 'Neznámá role má kód NEZNAMA_ROLE');
assert.equal((await zmen(spravce, 999, 'redaktor')).status, 404, 'Neexistující účet je 404');

const povyseni = await zmen(spravce, 1, 'redaktor');
assert.equal(povyseni.status, 200, `Správce má roli změnit. Výstup serveru:\n${server.output()}`);
assert.equal((await povyseni.json()).role, 'redaktor', 'Odpověď má obsahovat novou roli');
const zkusPsat = await fetch(new URL('/api/clanky', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ctenar}` },
  body: JSON.stringify({ nazev: 'Beseda s kronikářem', text: 'V sále obecního úřadu.' }),
});
assert.equal(zkusPsat.status, 201, 'Po povýšení platí nová práva hned');
```

Audit zaznamená povolené i zamítnuté pokusy a přečte ho jen správce.

```js
const server = await helpers.startServer('src/server.js');
const token = async (email, heslo) => (await (await fetch(new URL('/api/prihlaseni', server.url), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, heslo }),
})).json()).token;
const ctenar = await token('ctenar@lipovec.cz', 'zpravodaj-ctu');
const redaktor = await token('redakce@lipovec.cz', 'redakce-2026');
const spravce = await token('starosta@lipovec.cz', 'lipovec-urad');

await fetch(new URL('/api/clanky?stav=koncept', server.url), { headers: { Authorization: `Bearer ${ctenar}` } });
await fetch(new URL('/api/clanky?stav=koncept', server.url), { headers: { Authorization: `Bearer ${redaktor}` } });

assert.equal((await fetch(new URL('/api/audit', server.url), { headers: { Authorization: `Bearer ${redaktor}` } })).status, 403, 'Audit čte jen ten, kdo má právo audit:cist');
const res = await fetch(new URL('/api/audit', server.url), { headers: { Authorization: `Bearer ${spravce}` } });
assert.equal(res.status, 200, `Správce audit vidí. Výstup serveru:\n${server.output()}`);
const zaznamy = (await res.json()).items;
assert.ok(Array.isArray(zaznamy), 'Audit má vrátit { items } s polem záznamů');
const zamitnuty = zaznamy.find((zaznam) => zaznam.kdo === 'ctenar@lipovec.cz');
assert.ok(zamitnuty, 'V auditu má být i zamítnutý pokus čtenáře');
assert.equal(zamitnuty.povoleno, false, 'U zamítnutého pokusu je povoleno: false');
assert.equal(zamitnuty.akce, 'clanek:cist-koncept', 'Záznam pojmenuje právo, o které šlo');
assert.ok(typeof zamitnuty.kdy === 'string' && zamitnuty.kdy.length >= 10, 'Záznam má obsahovat čas');
const povoleny = zaznamy.find((zaznam) => zaznam.kdo === 'redakce@lipovec.cz' && zaznam.povoleno === true);
assert.ok(povoleny, 'V auditu má být i povolený pokus redaktora');
```

# --help--

## --tip--

Rozdíl mezi „nevím, kdo jsi" a „vím, kdo jsi, ale nesmíš" je v lekci
[Autentizace a autorizace](see:auth-bezpecnost/session-a-cookies#autentizace-a-autorizace).
Každá routa si odpovídá na obě otázky, ale v tomhle pořadí.

## --tip--

Až budeš mít práva na jednom místě, zkus si položit otázku „kam sáhnu, až přibude role
korektor, která smí číst koncepty a upravovat cizí články?". Když odpověď zní „na jeden
řádek", máš to dobře.

# --seed--

## --file-- package.json

```json
{
  "name": "zpravodaj-lipovec",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/server.js"
  }
}
```

## --file-- data/clanky.json

```json
[
  {
    "id": 1,
    "nazev": "Nový chodník k mateřské škole",
    "text": "Stavba začne v dubnu a potrvá šest týdnů.",
    "autor": "redakce@lipovec.cz",
    "stav": "publikovano",
    "vydano": "2026-03-04"
  },
  {
    "id": 2,
    "nazev": "Sběrný dvůr mění otevírací dobu",
    "text": "Od května otevřeno i v sobotu dopoledne.",
    "autor": "redakce@lipovec.cz",
    "stav": "publikovano",
    "vydano": "2026-05-18"
  },
  {
    "id": 3,
    "nazev": "Rozpočet obce na příští rok",
    "text": "Pracovní verze, čeká na projednání v zastupitelstvu.",
    "autor": "starosta@lipovec.cz",
    "stav": "koncept",
    "vydano": null
  }
]
```

## --file-- src/server.js

```js
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

// Články zpravodaje. Stav si drž v paměti — po restartu se načtou znovu ze souboru.
const clanky = JSON.parse(readFileSync(new URL('../data/clanky.json', import.meta.url), 'utf8'));

// Účty, které mají být připravené od startu. Otevřená hesla tu jsou jen proto,
// abys z nich při startu spočítal otisk; dál s nimi nepracuj.
const UCTY = [
  { id: 1, email: 'ctenar@lipovec.cz', heslo: 'zpravodaj-ctu', role: 'ctenar' },
  { id: 2, email: 'redakce@lipovec.cz', heslo: 'redakce-2026', role: 'redaktor' },
  { id: 3, email: 'starosta@lipovec.cz', heslo: 'lipovec-urad', role: 'spravce' },
];

function posli(res, status, telo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(telo === undefined ? '' : JSON.stringify(telo));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // TODO: přihlášení, otisk hesla se solí a token
  // TODO: tabulka práv a jedno místo, kde se oprávnění kontroluje
  // TODO: články — veřejný seznam se stránkováním, koncepty, psaní, úprava, publikování, mazání
  // TODO: změna role a audit

  posli(res, 404, { error: { code: 'NENALEZENO', message: 'Taková cesta tu není.' } });
});

server.listen(Number(process.env.PORT ?? 3000));
```

# --solution--

## --file-- src/server.js

```js
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const PRAVA_ROLI = {
  ctenar: [],
  redaktor: ['clanek:cist-koncept', 'clanek:psat', 'clanek:publikovat'],
  spravce: [
    'clanek:cist-koncept',
    'clanek:psat',
    'clanek:publikovat',
    'clanek:upravit-cizi',
    'clanek:mazat',
    'uzivatel:menit-roli',
    'audit:cist',
  ],
};

const MAX_NA_STRANKU = 50;

class ChybaApi extends Error {
  constructor(status, kod, zprava) {
    super(zprava);
    this.status = status;
    this.kod = kod;
  }
}

// --- stav aplikace ---------------------------------------------------------

const clanky = new Map(
  JSON.parse(readFileSync(new URL('../data/clanky.json', import.meta.url), 'utf8'))
    .map((clanek) => [clanek.id, { ...clanek }]),
);
let dalsiId = Math.max(...clanky.keys()) + 1;

const uzivatele = new Map();
const tokeny = new Map();
const audit = [];

function otisk(heslo, sul = randomBytes(16).toString('hex')) {
  return { sul, hash: scryptSync(heslo, sul, 64).toString('hex') };
}

function zalozUcet(id, email, heslo, role) {
  uzivatele.set(id, { id, email, role, ...otisk(heslo) });
}

zalozUcet(1, 'ctenar@lipovec.cz', 'zpravodaj-ctu', 'ctenar');
zalozUcet(2, 'redakce@lipovec.cz', 'redakce-2026', 'redaktor');
zalozUcet(3, 'starosta@lipovec.cz', 'lipovec-urad', 'spravce');

function hesloSedi(heslo, uzivatel) {
  const spocitany = scryptSync(heslo, uzivatel.sul, 64);
  const ulozeny = Buffer.from(uzivatel.hash, 'hex');
  return spocitany.length === ulozeny.length && timingSafeEqual(spocitany, ulozeny);
}

// --- oprávnění -------------------------------------------------------------

function maPravo(uzivatel, pravo) {
  return (PRAVA_ROLI[uzivatel.role] ?? []).includes(pravo);
}

function zapisAudit(uzivatel, akce, cil, povoleno) {
  audit.push({
    kdo: uzivatel.email,
    akce,
    cil: String(cil ?? ''),
    povoleno,
    kdy: new Date().toISOString(),
  });
}

// Jediné místo, kde se rozhoduje o oprávnění — a zároveň jediné, kde vzniká audit.
function vyzadujPravo(uzivatel, pravo, cil = '') {
  const povoleno = maPravo(uzivatel, pravo);
  zapisAudit(uzivatel, pravo, cil, povoleno);
  if (!povoleno) throw new ChybaApi(403, 'BEZ_OPRAVNENI', 'Na tuhle akci nemáš oprávnění.');
}

// --- HTTP ------------------------------------------------------------------

function posli(res, status, telo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(telo === undefined ? '' : JSON.stringify(telo));
}

async function prectiJson(req) {
  const kusy = [];
  for await (const kus of req) kusy.push(kus);
  if (kusy.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(kusy).toString('utf8'));
  } catch {
    throw new ChybaApi(400, 'SPATNY_VSTUP', 'Tělo požadavku musí být platný JSON.');
  }
}

function prihlaseny(req) {
  const hlavicka = req.headers.authorization ?? '';
  const token = hlavicka.startsWith('Bearer ') ? hlavicka.slice('Bearer '.length) : '';
  const uzivatel = uzivatele.get(tokeny.get(token));
  if (!uzivatel) throw new ChybaApi(401, 'NEPRIHLASEN', 'Přihlas se.');
  return uzivatel;
}

const verejny = (uzivatel) => ({ id: uzivatel.id, email: uzivatel.email, role: uzivatel.role });

// --- routy -----------------------------------------------------------------

async function obsluz(req, res, url) {
  const { pathname } = url;

  if (req.method === 'POST' && pathname === '/api/prihlaseni') {
    const { email, heslo } = await prectiJson(req);
    const uzivatel = [...uzivatele.values()].find((ucet) => ucet.email === String(email ?? '').trim().toLowerCase());
    if (!uzivatel || !hesloSedi(String(heslo ?? ''), uzivatel)) {
      throw new ChybaApi(401, 'SPATNE_UDAJE', 'E-mail nebo heslo nesedí.');
    }
    const token = randomBytes(24).toString('base64url');
    tokeny.set(token, uzivatel.id);
    return posli(res, 200, { token, role: uzivatel.role });
  }

  if (req.method === 'GET' && pathname === '/api/clanky') {
    const stav = url.searchParams.get('stav') ?? 'publikovano';
    if (stav !== 'publikovano') {
      vyzadujPravo(prihlaseny(req), 'clanek:cist-koncept', stav);
    }
    const nalezene = [...clanky.values()]
      .filter((clanek) => clanek.stav === stav)
      .sort((a, b) => String(b.vydano ?? '').localeCompare(String(a.vydano ?? '')) || b.id - a.id);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
    const perPage = Math.min(MAX_NA_STRANKU, Math.max(1, Number(url.searchParams.get('perPage') ?? 10) || 10));
    const od = (page - 1) * perPage;
    return posli(res, 200, { items: nalezene.slice(od, od + perPage), page, perPage, total: nalezene.length });
  }

  if (req.method === 'POST' && pathname === '/api/clanky') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'clanek:psat');
    const { nazev, text } = await prectiJson(req);
    if (typeof nazev !== 'string' || nazev.trim() === '') {
      throw new ChybaApi(400, 'SPATNY_VSTUP', 'Článek musí mít název.');
    }
    // Stav ani autora si klient nevybírá.
    const clanek = {
      id: dalsiId,
      nazev: nazev.trim(),
      text: String(text ?? ''),
      autor: uzivatel.email,
      stav: 'koncept',
      vydano: null,
    };
    dalsiId += 1;
    clanky.set(clanek.id, clanek);
    return posli(res, 201, clanek);
  }

  const jeden = pathname.match(/^\/api\/clanky\/(\d+)$/);
  if (jeden && (req.method === 'PATCH' || req.method === 'DELETE')) {
    const uzivatel = prihlaseny(req);
    const clanek = clanky.get(Number(jeden[1]));

    if (req.method === 'DELETE') {
      vyzadujPravo(uzivatel, 'clanek:mazat', jeden[1]);
      if (!clanek) throw new ChybaApi(404, 'NENALEZENO', 'Takový článek tu není.');
      clanky.delete(clanek.id);
      return posli(res, 204, undefined);
    }

    if (!clanek) throw new ChybaApi(404, 'NENALEZENO', 'Takový článek tu není.');
    if (clanek.autor !== uzivatel.email) vyzadujPravo(uzivatel, 'clanek:upravit-cizi', jeden[1]);
    const { nazev, text } = await prectiJson(req);
    if (nazev !== undefined) clanek.nazev = String(nazev);
    if (text !== undefined) clanek.text = String(text);
    return posli(res, 200, clanek);
  }

  const publikovat = pathname.match(/^\/api\/clanky\/(\d+)\/publikovat$/);
  if (publikovat && req.method === 'POST') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'clanek:publikovat', publikovat[1]);
    const clanek = clanky.get(Number(publikovat[1]));
    if (!clanek) throw new ChybaApi(404, 'NENALEZENO', 'Takový článek tu není.');
    clanek.stav = 'publikovano';
    clanek.vydano = new Date().toISOString().slice(0, 10);
    return posli(res, 200, clanek);
  }

  const role = pathname.match(/^\/api\/uzivatele\/(\d+)\/role$/);
  if (role && req.method === 'PUT') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'uzivatel:menit-roli', role[1]);
    const cil = uzivatele.get(Number(role[1]));
    if (!cil) throw new ChybaApi(404, 'NENALEZENO', 'Takový účet tu není.');
    if (cil.id === uzivatel.id) {
      throw new ChybaApi(409, 'SAM_SOBE', 'Vlastní roli si změnit nemůžeš.');
    }
    const { role: nova } = await prectiJson(req);
    if (!Object.hasOwn(PRAVA_ROLI, String(nova))) {
      throw new ChybaApi(400, 'NEZNAMA_ROLE', 'Takovou roli neznáme.');
    }
    cil.role = String(nova);
    return posli(res, 200, verejny(cil));
  }

  if (req.method === 'GET' && pathname === '/api/audit') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'audit:cist');
    return posli(res, 200, { items: audit });
  }

  throw new ChybaApi(404, 'NENALEZENO', 'Taková cesta tu není.');
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    await obsluz(req, res, url);
  } catch (chyba) {
    const znama = chyba instanceof ChybaApi;
    if (!znama) console.error(chyba);
    posli(res, znama ? chyba.status : 500, {
      error: {
        code: znama ? chyba.kod : 'CHYBA_SERVERU',
        message: znama ? chyba.message : 'Na serveru se něco pokazilo.',
      },
    });
  }
}).listen(Number(process.env.PORT ?? 3000));
```

# --approaches--

## --approach-- Tabulka po právech

Tabulka se čte opačně než v řešení: u každého práva je seznam rolí, které ho mají.
Hodí se, když se někdo ptá „kdo všechno smí mazat" — odpověď je na jednom řádku.
Nevýhoda je opačná: „co všechno smí redaktor" musíš posbírat z celé tabulky.

### --file-- src/server.js

```js
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const ROLE = ['ctenar', 'redaktor', 'spravce'];

// Tabulka se čte po právech: u každé akce je vidět, kdo ji smí.
const KDO_SMI = {
  'clanek:cist-koncept': ['redaktor', 'spravce'],
  'clanek:psat': ['redaktor', 'spravce'],
  'clanek:publikovat': ['redaktor', 'spravce'],
  'clanek:upravit-cizi': ['spravce'],
  'clanek:mazat': ['spravce'],
  'uzivatel:menit-roli': ['spravce'],
  'audit:cist': ['spravce'],
};

const MAX_NA_STRANKU = 50;

class ChybaApi extends Error {
  constructor(status, kod, zprava) {
    super(zprava);
    this.status = status;
    this.kod = kod;
  }
}

// --- stav aplikace ---------------------------------------------------------

const clanky = new Map(
  JSON.parse(readFileSync(new URL('../data/clanky.json', import.meta.url), 'utf8'))
    .map((clanek) => [clanek.id, { ...clanek }]),
);
let dalsiId = Math.max(...clanky.keys()) + 1;

const uzivatele = new Map();
const tokeny = new Map();
const audit = [];

function otisk(heslo, sul = randomBytes(16).toString('hex')) {
  return { sul, hash: scryptSync(heslo, sul, 64).toString('hex') };
}

function zalozUcet(id, email, heslo, role) {
  uzivatele.set(id, { id, email, role, ...otisk(heslo) });
}

zalozUcet(1, 'ctenar@lipovec.cz', 'zpravodaj-ctu', 'ctenar');
zalozUcet(2, 'redakce@lipovec.cz', 'redakce-2026', 'redaktor');
zalozUcet(3, 'starosta@lipovec.cz', 'lipovec-urad', 'spravce');

function hesloSedi(heslo, uzivatel) {
  const spocitany = scryptSync(heslo, uzivatel.sul, 64);
  const ulozeny = Buffer.from(uzivatel.hash, 'hex');
  return spocitany.length === ulozeny.length && timingSafeEqual(spocitany, ulozeny);
}

// --- oprávnění -------------------------------------------------------------

function maPravo(uzivatel, pravo) {
  return (KDO_SMI[pravo] ?? []).includes(uzivatel.role);
}

function zapisAudit(uzivatel, akce, cil, povoleno) {
  audit.push({
    kdo: uzivatel.email,
    akce,
    cil: String(cil ?? ''),
    povoleno,
    kdy: new Date().toISOString(),
  });
}

// Jediné místo, kde se rozhoduje o oprávnění — a zároveň jediné, kde vzniká audit.
function vyzadujPravo(uzivatel, pravo, cil = '') {
  const povoleno = maPravo(uzivatel, pravo);
  zapisAudit(uzivatel, pravo, cil, povoleno);
  if (!povoleno) throw new ChybaApi(403, 'BEZ_OPRAVNENI', 'Na tuhle akci nemáš oprávnění.');
}

// --- HTTP ------------------------------------------------------------------

function posli(res, status, telo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(telo === undefined ? '' : JSON.stringify(telo));
}

async function prectiJson(req) {
  const kusy = [];
  for await (const kus of req) kusy.push(kus);
  if (kusy.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(kusy).toString('utf8'));
  } catch {
    throw new ChybaApi(400, 'SPATNY_VSTUP', 'Tělo požadavku musí být platný JSON.');
  }
}

function prihlaseny(req) {
  const hlavicka = req.headers.authorization ?? '';
  const token = hlavicka.startsWith('Bearer ') ? hlavicka.slice('Bearer '.length) : '';
  const uzivatel = uzivatele.get(tokeny.get(token));
  if (!uzivatel) throw new ChybaApi(401, 'NEPRIHLASEN', 'Přihlas se.');
  return uzivatel;
}

const verejny = (uzivatel) => ({ id: uzivatel.id, email: uzivatel.email, role: uzivatel.role });

// --- routy -----------------------------------------------------------------

async function obsluz(req, res, url) {
  const { pathname } = url;

  if (req.method === 'POST' && pathname === '/api/prihlaseni') {
    const { email, heslo } = await prectiJson(req);
    const uzivatel = [...uzivatele.values()].find((ucet) => ucet.email === String(email ?? '').trim().toLowerCase());
    if (!uzivatel || !hesloSedi(String(heslo ?? ''), uzivatel)) {
      throw new ChybaApi(401, 'SPATNE_UDAJE', 'E-mail nebo heslo nesedí.');
    }
    const token = randomBytes(24).toString('base64url');
    tokeny.set(token, uzivatel.id);
    return posli(res, 200, { token, role: uzivatel.role });
  }

  if (req.method === 'GET' && pathname === '/api/clanky') {
    const stav = url.searchParams.get('stav') ?? 'publikovano';
    if (stav !== 'publikovano') {
      vyzadujPravo(prihlaseny(req), 'clanek:cist-koncept', stav);
    }
    const nalezene = [...clanky.values()]
      .filter((clanek) => clanek.stav === stav)
      .sort((a, b) => String(b.vydano ?? '').localeCompare(String(a.vydano ?? '')) || b.id - a.id);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
    const perPage = Math.min(MAX_NA_STRANKU, Math.max(1, Number(url.searchParams.get('perPage') ?? 10) || 10));
    const od = (page - 1) * perPage;
    return posli(res, 200, { items: nalezene.slice(od, od + perPage), page, perPage, total: nalezene.length });
  }

  if (req.method === 'POST' && pathname === '/api/clanky') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'clanek:psat');
    const { nazev, text } = await prectiJson(req);
    if (typeof nazev !== 'string' || nazev.trim() === '') {
      throw new ChybaApi(400, 'SPATNY_VSTUP', 'Článek musí mít název.');
    }
    // Stav ani autora si klient nevybírá.
    const clanek = {
      id: dalsiId,
      nazev: nazev.trim(),
      text: String(text ?? ''),
      autor: uzivatel.email,
      stav: 'koncept',
      vydano: null,
    };
    dalsiId += 1;
    clanky.set(clanek.id, clanek);
    return posli(res, 201, clanek);
  }

  const jeden = pathname.match(/^\/api\/clanky\/(\d+)$/);
  if (jeden && (req.method === 'PATCH' || req.method === 'DELETE')) {
    const uzivatel = prihlaseny(req);
    const clanek = clanky.get(Number(jeden[1]));

    if (req.method === 'DELETE') {
      vyzadujPravo(uzivatel, 'clanek:mazat', jeden[1]);
      if (!clanek) throw new ChybaApi(404, 'NENALEZENO', 'Takový článek tu není.');
      clanky.delete(clanek.id);
      return posli(res, 204, undefined);
    }

    if (!clanek) throw new ChybaApi(404, 'NENALEZENO', 'Takový článek tu není.');
    if (clanek.autor !== uzivatel.email) vyzadujPravo(uzivatel, 'clanek:upravit-cizi', jeden[1]);
    const { nazev, text } = await prectiJson(req);
    if (nazev !== undefined) clanek.nazev = String(nazev);
    if (text !== undefined) clanek.text = String(text);
    return posli(res, 200, clanek);
  }

  const publikovat = pathname.match(/^\/api\/clanky\/(\d+)\/publikovat$/);
  if (publikovat && req.method === 'POST') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'clanek:publikovat', publikovat[1]);
    const clanek = clanky.get(Number(publikovat[1]));
    if (!clanek) throw new ChybaApi(404, 'NENALEZENO', 'Takový článek tu není.');
    clanek.stav = 'publikovano';
    clanek.vydano = new Date().toISOString().slice(0, 10);
    return posli(res, 200, clanek);
  }

  const role = pathname.match(/^\/api\/uzivatele\/(\d+)\/role$/);
  if (role && req.method === 'PUT') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'uzivatel:menit-roli', role[1]);
    const cil = uzivatele.get(Number(role[1]));
    if (!cil) throw new ChybaApi(404, 'NENALEZENO', 'Takový účet tu není.');
    if (cil.id === uzivatel.id) {
      throw new ChybaApi(409, 'SAM_SOBE', 'Vlastní roli si změnit nemůžeš.');
    }
    const { role: nova } = await prectiJson(req);
    if (!ROLE.includes(String(nova))) {
      throw new ChybaApi(400, 'NEZNAMA_ROLE', 'Takovou roli neznáme.');
    }
    cil.role = String(nova);
    return posli(res, 200, verejny(cil));
  }

  if (req.method === 'GET' && pathname === '/api/audit') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'audit:cist');
    return posli(res, 200, { items: audit });
  }

  throw new ChybaApi(404, 'NENALEZENO', 'Taková cesta tu není.');
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    await obsluz(req, res, url);
  } catch (chyba) {
    const znama = chyba instanceof ChybaApi;
    if (!znama) console.error(chyba);
    posli(res, znama ? chyba.status : 500, {
      error: {
        code: znama ? chyba.kod : 'CHYBA_SERVERU',
        message: znama ? chyba.message : 'Na serveru se něco pokazilo.',
      },
    });
  }
}).listen(Number(process.env.PORT ?? 3000));
```

## --approach-- Číselné úrovně rolí

Role dostanou pořadí (čtenář 1, redaktor 2, správce 3) a u každého práva je nejnižší
úroveň, která ho má. Je to krátké a přibrat roli mezi dvě stávající je snadné.
Platí to ale jen tehdy, když vyšší role opravdu umí všechno, co nižší — na roli
„korektor", která smí upravovat cizí články, ale ne publikovat, už to nestačí.

### --file-- src/server.js

```js
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Role jsou seřazené: vyšší úroveň umí všechno, co nižší.
const UROVEN_ROLE = { ctenar: 1, redaktor: 2, spravce: 3 };

const POTREBNA_UROVEN = {
  'clanek:cist-koncept': 2,
  'clanek:psat': 2,
  'clanek:publikovat': 2,
  'clanek:upravit-cizi': 3,
  'clanek:mazat': 3,
  'uzivatel:menit-roli': 3,
  'audit:cist': 3,
};

const MAX_NA_STRANKU = 50;

class ChybaApi extends Error {
  constructor(status, kod, zprava) {
    super(zprava);
    this.status = status;
    this.kod = kod;
  }
}

// --- stav aplikace ---------------------------------------------------------

const clanky = new Map(
  JSON.parse(readFileSync(new URL('../data/clanky.json', import.meta.url), 'utf8'))
    .map((clanek) => [clanek.id, { ...clanek }]),
);
let dalsiId = Math.max(...clanky.keys()) + 1;

const uzivatele = new Map();
const tokeny = new Map();
const audit = [];

function otisk(heslo, sul = randomBytes(16).toString('hex')) {
  return { sul, hash: scryptSync(heslo, sul, 64).toString('hex') };
}

function zalozUcet(id, email, heslo, role) {
  uzivatele.set(id, { id, email, role, ...otisk(heslo) });
}

zalozUcet(1, 'ctenar@lipovec.cz', 'zpravodaj-ctu', 'ctenar');
zalozUcet(2, 'redakce@lipovec.cz', 'redakce-2026', 'redaktor');
zalozUcet(3, 'starosta@lipovec.cz', 'lipovec-urad', 'spravce');

function hesloSedi(heslo, uzivatel) {
  const spocitany = scryptSync(heslo, uzivatel.sul, 64);
  const ulozeny = Buffer.from(uzivatel.hash, 'hex');
  return spocitany.length === ulozeny.length && timingSafeEqual(spocitany, ulozeny);
}

// --- oprávnění -------------------------------------------------------------

function maPravo(uzivatel, pravo) {
  const uroven = UROVEN_ROLE[uzivatel.role] ?? 0;
  return uroven >= (POTREBNA_UROVEN[pravo] ?? Number.POSITIVE_INFINITY);
}

function zapisAudit(uzivatel, akce, cil, povoleno) {
  audit.push({
    kdo: uzivatel.email,
    akce,
    cil: String(cil ?? ''),
    povoleno,
    kdy: new Date().toISOString(),
  });
}

// Jediné místo, kde se rozhoduje o oprávnění — a zároveň jediné, kde vzniká audit.
function vyzadujPravo(uzivatel, pravo, cil = '') {
  const povoleno = maPravo(uzivatel, pravo);
  zapisAudit(uzivatel, pravo, cil, povoleno);
  if (!povoleno) throw new ChybaApi(403, 'BEZ_OPRAVNENI', 'Na tuhle akci nemáš oprávnění.');
}

// --- HTTP ------------------------------------------------------------------

function posli(res, status, telo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(telo === undefined ? '' : JSON.stringify(telo));
}

async function prectiJson(req) {
  const kusy = [];
  for await (const kus of req) kusy.push(kus);
  if (kusy.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(kusy).toString('utf8'));
  } catch {
    throw new ChybaApi(400, 'SPATNY_VSTUP', 'Tělo požadavku musí být platný JSON.');
  }
}

function prihlaseny(req) {
  const hlavicka = req.headers.authorization ?? '';
  const token = hlavicka.startsWith('Bearer ') ? hlavicka.slice('Bearer '.length) : '';
  const uzivatel = uzivatele.get(tokeny.get(token));
  if (!uzivatel) throw new ChybaApi(401, 'NEPRIHLASEN', 'Přihlas se.');
  return uzivatel;
}

const verejny = (uzivatel) => ({ id: uzivatel.id, email: uzivatel.email, role: uzivatel.role });

// --- routy -----------------------------------------------------------------

async function obsluz(req, res, url) {
  const { pathname } = url;

  if (req.method === 'POST' && pathname === '/api/prihlaseni') {
    const { email, heslo } = await prectiJson(req);
    const uzivatel = [...uzivatele.values()].find((ucet) => ucet.email === String(email ?? '').trim().toLowerCase());
    if (!uzivatel || !hesloSedi(String(heslo ?? ''), uzivatel)) {
      throw new ChybaApi(401, 'SPATNE_UDAJE', 'E-mail nebo heslo nesedí.');
    }
    const token = randomBytes(24).toString('base64url');
    tokeny.set(token, uzivatel.id);
    return posli(res, 200, { token, role: uzivatel.role });
  }

  if (req.method === 'GET' && pathname === '/api/clanky') {
    const stav = url.searchParams.get('stav') ?? 'publikovano';
    if (stav !== 'publikovano') {
      vyzadujPravo(prihlaseny(req), 'clanek:cist-koncept', stav);
    }
    const nalezene = [...clanky.values()]
      .filter((clanek) => clanek.stav === stav)
      .sort((a, b) => String(b.vydano ?? '').localeCompare(String(a.vydano ?? '')) || b.id - a.id);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
    const perPage = Math.min(MAX_NA_STRANKU, Math.max(1, Number(url.searchParams.get('perPage') ?? 10) || 10));
    const od = (page - 1) * perPage;
    return posli(res, 200, { items: nalezene.slice(od, od + perPage), page, perPage, total: nalezene.length });
  }

  if (req.method === 'POST' && pathname === '/api/clanky') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'clanek:psat');
    const { nazev, text } = await prectiJson(req);
    if (typeof nazev !== 'string' || nazev.trim() === '') {
      throw new ChybaApi(400, 'SPATNY_VSTUP', 'Článek musí mít název.');
    }
    // Stav ani autora si klient nevybírá.
    const clanek = {
      id: dalsiId,
      nazev: nazev.trim(),
      text: String(text ?? ''),
      autor: uzivatel.email,
      stav: 'koncept',
      vydano: null,
    };
    dalsiId += 1;
    clanky.set(clanek.id, clanek);
    return posli(res, 201, clanek);
  }

  const jeden = pathname.match(/^\/api\/clanky\/(\d+)$/);
  if (jeden && (req.method === 'PATCH' || req.method === 'DELETE')) {
    const uzivatel = prihlaseny(req);
    const clanek = clanky.get(Number(jeden[1]));

    if (req.method === 'DELETE') {
      vyzadujPravo(uzivatel, 'clanek:mazat', jeden[1]);
      if (!clanek) throw new ChybaApi(404, 'NENALEZENO', 'Takový článek tu není.');
      clanky.delete(clanek.id);
      return posli(res, 204, undefined);
    }

    if (!clanek) throw new ChybaApi(404, 'NENALEZENO', 'Takový článek tu není.');
    if (clanek.autor !== uzivatel.email) vyzadujPravo(uzivatel, 'clanek:upravit-cizi', jeden[1]);
    const { nazev, text } = await prectiJson(req);
    if (nazev !== undefined) clanek.nazev = String(nazev);
    if (text !== undefined) clanek.text = String(text);
    return posli(res, 200, clanek);
  }

  const publikovat = pathname.match(/^\/api\/clanky\/(\d+)\/publikovat$/);
  if (publikovat && req.method === 'POST') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'clanek:publikovat', publikovat[1]);
    const clanek = clanky.get(Number(publikovat[1]));
    if (!clanek) throw new ChybaApi(404, 'NENALEZENO', 'Takový článek tu není.');
    clanek.stav = 'publikovano';
    clanek.vydano = new Date().toISOString().slice(0, 10);
    return posli(res, 200, clanek);
  }

  const role = pathname.match(/^\/api\/uzivatele\/(\d+)\/role$/);
  if (role && req.method === 'PUT') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'uzivatel:menit-roli', role[1]);
    const cil = uzivatele.get(Number(role[1]));
    if (!cil) throw new ChybaApi(404, 'NENALEZENO', 'Takový účet tu není.');
    if (cil.id === uzivatel.id) {
      throw new ChybaApi(409, 'SAM_SOBE', 'Vlastní roli si změnit nemůžeš.');
    }
    const { role: nova } = await prectiJson(req);
    if (!Object.hasOwn(UROVEN_ROLE, String(nova))) {
      throw new ChybaApi(400, 'NEZNAMA_ROLE', 'Takovou roli neznáme.');
    }
    cil.role = String(nova);
    return posli(res, 200, verejny(cil));
  }

  if (req.method === 'GET' && pathname === '/api/audit') {
    const uzivatel = prihlaseny(req);
    vyzadujPravo(uzivatel, 'audit:cist');
    return posli(res, 200, { items: audit });
  }

  throw new ChybaApi(404, 'NENALEZENO', 'Taková cesta tu není.');
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    await obsluz(req, res, url);
  } catch (chyba) {
    const znama = chyba instanceof ChybaApi;
    if (!znama) console.error(chyba);
    posli(res, znama ? chyba.status : 500, {
      error: {
        code: znama ? chyba.kod : 'CHYBA_SERVERU',
        message: znama ? chyba.message : 'Na serveru se něco pokazilo.',
      },
    });
  }
}).listen(Number(process.env.PORT ?? 3000));
```

# --review--

Testy zkontrolovaly chování. Tohle si projdi sám, než lab uzavřeš.

## --rubric--

- Otázka „smí tenhle uživatel tuhle akci?" se v kódu zodpovídá na jednom místě, ne v každé routě zvlášť.
- Tabulka práv jde přečíst jako věta a nová role by byla jedna změna, ne deset.
- Kontrola přihlášení a kontrola oprávnění jsou dva oddělené kroky, a proto se `401` a `403` nepletou.
- Nic, co rozhoduje o právech, nepřichází z těla požadavku ani z parametru adresy.
- Zápis do auditu nejde obejít tím, že na nějakou routu zapomeneš.
- Kdyby zítra přibyla čtvrtá role nebo osmé právo, víš přesně, kam sáhneš.

## --extensions--

- **Vlastnictví jako součást práva.** Místo „autor smí svůj článek" zaveď právo
  `clanek:upravit-vlastni` a rozhodování sjednoť do jediné funkce.
- **Role na úrovni rubriky.** Ať je někdo redaktorem jen pro rubriku *Sport* — práva pak
  nejsou jen podle role, ale i podle záznamu.
- **Expirace tokenu** po hodině a jeho obnovení bez nového zadání hesla.
- **Audit, který se nedá umazat.** Zapisuj ho do souboru po řádcích (JSON na řádek) a přidej
  filtr `?kdo=` a `?povoleno=`.
- **Vlastní téma.** Zpravodaj přepiš na cokoli, kde rozhodují role: rezervace v tělocvičně,
  sklad dobrovolných hasičů, evidence půjčených knih. Role a práva zůstanou, data se změní.
