---
pass: 0.8
---

## --question--

Které z těchto věcí můžeš v Node použít bez jakéhokoli importu? Vyber všechny.

### --correct--

`process`

#### --why--

`process` je globální objekt Node — spojení programu s operačním systémem
(`process.env`, `process.argv`…).

### --correct--

`fetch`

#### --why--

`fetch` je v Node globální stejně jako v prohlížeči.

### --answer--

`document`

#### --why--

`document` je stránka v prohlížeči. V Node žádná stránka není a `document`
skončí chybou `ReferenceError: document is not defined`.

### --answer--

`localStorage`

#### --why--

`localStorage` je úložiště prohlížeče pro konkrétní web. Server si data ukládá
jinak — do souborů nebo databáze.

## --question--

Server je spuštěný příkazem `node server.js`. Co se stane po požadavku
`GET http://localhost:3000/`?

```js
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  console.log('Přišel požadavek na', req.url);
});
server.listen(3000);
```

### --answer--

Klient dostane stav `200` s prázdným tělem.

#### --why--

Odpověď je hotová, až když zavoláš `res.end()`. Samotné `writeHead` ji neodešle
celou.

### --correct--

Server vypíše zprávu do terminálu, ale klient čeká a odpověď nikdy nedostane.

#### --why--

Chybí `res.end()`. Dokud ho server nezavolá, odpověď není ukončená a klient čeká,
až mu vyprší časový limit.

### --answer--

Node skončí chybou, protože handler nic nevrací.

#### --why--

Návratová hodnota handleru Node nezajímá. Odpověď se posílá přes objekt `res`,
ne přes `return`.

## --question--

Klient pošle `GET /api/books?sort=title`. Jakou hodnotu má v handleru `req.url`?

### --answer--

`'http://localhost:3000/api/books?sort=title'`

#### --why--

`req.url` neobsahuje protokol ani doménu, jen cestu. Proto `new URL` potřebuje
jako druhý argument základ adresy.

### --answer--

`'/api/books'`

#### --why--

Tohle je `pathname`. Query string v `req.url` zůstává — proto se routuje podle
`new URL(req.url, 'http://localhost').pathname`.

### --correct--

`'/api/books?sort=title'`

#### --why--

`req.url` je cesta i s query stringem. Porovnání `req.url === '/api/books'` by
tady nesedlo.

## --question--

Proč se port serveru čte z `process.env.PORT`, a ne píše přímo do kódu?

### --correct--

Aby stejný kód mohl běžet na různých místech na různých portech, aniž by se měnil.

#### --why--

Port je nastavení prostředí (tvůj počítač, server, testy), ne vlastnost kódu.
Předává ho ten, kdo program spouští.

### --answer--

Protože `server.listen` jiné číslo než řetězec z `process.env` nepřijme.

#### --why--

`listen` přijme číslo i řetězec. Důvod je, aby port šel změnit bez úpravy kódu.

### --answer--

Protože proměnné prostředí jsou rychlejší než konstanty.

#### --why--

Rychlost s tím nesouvisí. Jde o to, kdo o hodnotě rozhoduje — kód, nebo prostředí,
ve kterém běží.

## --question--

Co se stane, když na tuhle routu přijde `GET /api/books/99` a kniha s id 99
neexistuje?

```js
if (pathname.startsWith('/api/books/')) {
  const id = Number(pathname.slice('/api/books/'.length));
  const book = (await loadBooks()).find((item) => item.id === id);
  if (!book) {
    sendJson(res, 404, { error: 'Kniha nenalezena.' });
  }
  sendJson(res, 200, book);
}
```

### --answer--

Klient dostane `404` a všechno je v pořádku.

#### --why--

Po prvním `sendJson` kód nekončí — pokračuje na druhé `sendJson`, a to je problém.

### --correct--

Kód se po `404` pokusí poslat druhou odpověď, vyhodí chybu
`ERR_HTTP_HEADERS_SENT` a server spadne.

#### --why--

Po `sendJson(res, 404, …)` chybí `return`. Druhé volání `writeHead` na už ukončené
odpovědi vyhodí výjimku. V asynchronním handleru ji nikdo nechytí a proces skončí.

### --answer--

Klient dostane `200` s tělem `undefined`.

#### --why--

Odpověď se dá poslat jen jednou. Druhý pokus nepřepíše první, ale vyhodí výjimku.

## --question--

Klient poslal `POST /api/books` a server knihu úspěšně vytvořil. Který stavový kód
je nejvhodnější?

### --answer--

`200 OK`

#### --why--

`200` není chyba, ale neříká nic navíc. `201` klientovi přesně sdělí, že vzniklo
něco nového.

### --correct--

`201 Created`

#### --why--

`201` znamená „vytvořeno". Tělo odpovědi obvykle obsahuje vytvořený záznam
i s id, které přidělil server.

### --answer--

`204 No Content`

#### --why--

`204` je odpověď bez těla, typicky po smazání. Po vytvoření klient potřebuje
dostat nový záznam, hlavně jeho id.

## --question--

Klient pošle v těle `POST` požadavku useknutý JSON `{"title": `. Jaký stav má
server vrátit?

### --answer--

`500 Internal Server Error`, protože `JSON.parse` vyhodil výjimku.

#### --why--

Výjimka vznikla na serveru, ale chyba je v požadavku. `500` by říkalo „rozbili
jsme se my" a klient by nevěděl, že má požadavek opravit.

### --correct--

`400 Bad Request` se zprávou, že tělo není platný JSON.

#### --why--

`4xx` znamená „oprav si požadavek", `5xx` „chyba je na naší straně". Špatný vstup
je vždycky `400`.

### --answer--

`404 Not Found`, protože kniha v těle nebyla nalezena.

#### --why--

`404` znamená, že neexistuje adresa nebo záznam, na který se klient ptá. Tady
adresa existuje, jen je vadné tělo.

## --question--

Proč se tělo požadavku čte takhle, a ne jako `body += chunk` v cyklu?

```js
const chunks = [];
for await (const chunk of req) {
  chunks.push(chunk);
}
const body = Buffer.concat(chunks).toString('utf8');
```

### --answer--

`body += chunk` v Node nefunguje, `Buffer` nejde spojit s řetězcem.

#### --why--

Spojit to jde — `Buffer` se převede na text. Problém je, kdy se převádí.

### --correct--

Znak zapsaný víc bajty (třeba `č`) se může rozdělit mezi dva kousky. Převod
kousků po jednom by ho rozbil, převod celku ne.

#### --why--

V UTF-8 má `č` dva bajty. Když první bajt přijde na konci jednoho kousku a druhý
na začátku dalšího, samostatný převod udělá z každé půlky nesmyslný znak.

### --answer--

`for await` je rychlejší než obyčejný `for`.

#### --why--

`for await` tu není kvůli rychlosti: tělo je proud a na každý kousek se musí
počkat. Otázka je o tom, proč se kousky spojují až nakonec.

## --question--

V handleru serveru je `readFileSync('books.json', 'utf8')` a soubor je velký.
Co to udělá, když naráz přijde sto požadavků?

### --correct--

Během každého čtení server nevyřizuje nic jiného, takže požadavky čekají jeden
na druhý.

#### --why--

Node běží v jednom vlákně. Synchronní čtení ho zablokuje. Asynchronní `readFile`
mezitím pustí ke slovu ostatní požadavky.

### --answer--

Nic zvláštního, Node pro každý požadavek spustí vlastní vlákno.

#### --why--

Tvůj JavaScript v Node běží v jednom vlákně pro všechny požadavky. Proto je
blokující kód na serveru problém.

### --answer--

Server spadne, protože `readFileSync` se na serveru používat nesmí.

#### --why--

Nespadne, funguje. Jen je pomalý pro všechny, protože blokuje smyčku událostí.

## --question--

Server na `PUT /api/books` odpoví stavem `405` a hlavičkou `Allow: GET, POST`.
Co tím klientovi říká?

### --answer--

Že adresa `/api/books` neexistuje.

#### --why--

To by byl `404`. `405` znamená, že adresa existuje, jen neumí tuhle metodu.

### --correct--

Že adresa existuje, ale metodu `PUT` neumí; umí `GET` a `POST`.

#### --why--

`405 Method Not Allowed` a hlavička `Allow` se seznamem metod, které adresa
podporuje.

### --answer--

Že klient nemá oprávnění knihy měnit a musí se přihlásit.

#### --why--

Na chybějící přihlášení jsou stavy `401` a `403`. `405` o právech nic neříká.

## --question--

Server spustíš příkazem `PORT=8080 node server.js`. Co vypíše tenhle kód?

```js
const port = process.env.PORT ?? 3000;
console.log(port === 8080, typeof port);
```

### --answer--

`true number`

#### --why--

Proměnné prostředí Node nikdy nepřevádí na čísla. `process.env.PORT` je text
`'8080'` a `===` text s číslem nikdy neztotožní.

### --correct--

`false string`

#### --why--

Proměnné prostředí jsou vždycky řetězce. `??` tu vrátí levou stranu, tedy
`'8080'`. Číslo dostaneš až přes `Number(process.env.PORT ?? 3000)`.

### --answer--

`false number`

#### --why--

`??` převod typu nedělá, jen vybírá mezi levou a pravou stranou. Protože `PORT`
je nastavený, vybere řetězec `'8080'`.

## --question--

V asynchronním handleru serveru vyletí výjimka, kterou nikde nechytáš (třeba
z `JSON.parse` nad poškozeným souborem). Co se stane?

### --answer--

Jen ten jeden požadavek skončí chybou `500`, ostatní uživatelé nic nepoznají.

#### --why--

`500` sám od sebe nevznikne. Musíš chybu chytit (`try`/`catch`) a `500` poslat.
Bez toho výjimka ukončí proces.

### --correct--

Celý proces serveru spadne a přestane odpovídat všem uživatelům.

#### --why--

Nezachycená výjimka v Node ukončí proces. Jeden server obsluhuje všechny, takže
jedna nechycená chyba je výpadek pro všechny.

### --answer--

Node chybu vypíše a pokračuje, jako by se nic nestalo.

#### --why--

Tak se chová prohlížeč s chybou ve skriptu stránky. Node při nezachycené výjimce
proces ukončí.
