---
pass: 0.8
---

# --questions--

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

Myslíš si, že Node má nějakou stránku? `document` je dokument v prohlížeči a v Node
skončí chybou `ReferenceError`.

### --answer--

`localStorage`

#### --why--

Myslíš si, že server má úložiště prohlížeče? `localStorage` patří konkrétnímu webu
v prohlížeči; server si data ukládá do souborů nebo databáze.

### --see--

node-zaklady/co-je-node#stejny-jazyk-jine-prostredi

## --question--

Program `app/server.js` volá `readFile('data.json', 'utf8')` a soubor `data.json` leží
ve složce `app/` hned vedle. Z nadřazené složky spustíš `node app/server.js`. Jaký kód
chyby uvidíš v hlášce?

### --expected--

ENOENT

### --why--

Relativní cesta se počítá od pracovní složky (`process.cwd()`), ne od souboru s kódem.
V nadřazené složce žádný `data.json` není, a tak přijde `ENOENT: no such file or directory`.

### --see--

node-zaklady/co-je-node#typicke-chyby-a-pasti

## --question--

Server spustíš příkazem `PORT=8080 node server.js`. Co vypíše tenhle kód?

```js
const port = process.env.PORT ?? 3000;
console.log(port === 8080, typeof port);
```

### --expected--

false string

### --why--

Proměnné prostředí jsou vždycky řetězce. `??` jen vybírá mezi levou a pravou stranou,
nic nepřevádí — vybere `'8080'` a řetězec se s číslem přes `===` nikdy neshoduje.

### --see--

node-zaklady/co-je-node#process-program-a-svet-kolem-nej

## --question--

Proč se port serveru čte z `process.env.PORT`, a ne píše přímo do kódu?

### --correct--

Aby stejný kód mohl běžet na různých místech na různých portech, aniž by se měnil.

#### --why--

Port je nastavení prostředí (tvůj počítač, server, testy), ne vlastnost kódu. Předává
ho ten, kdo program spouští.

### --answer--

Protože `server.listen` jiné číslo než řetězec z `process.env` nepřijme.

#### --why--

Myslíš si, že jde o typ, který `listen` chce? `listen` přijme číslo i řetězec; typ
s důvodem nesouvisí.

### --answer--

Protože proměnné prostředí jsou rychlejší než konstanty.

#### --why--

Myslíš si, že jde o výkon? Rozdíl v rychlosti tu žádný není. Jde o to, kdo o hodnotě
rozhoduje.

### --see--

node-zaklady/co-je-node#process-program-a-svet-kolem-nej

## --question--

V handleru serveru je `readFileSync('books.json', 'utf8')` a soubor je velký. Co to
udělá, když naráz přijde sto požadavků?

### --correct--

Během každého čtení server nevyřizuje nic jiného, takže požadavky čekají jeden na druhý.

#### --why--

Node běží v jednom vlákně. Synchronní čtení ho zablokuje, asynchronní `readFile` mezitím
pustí ke slovu ostatní požadavky.

### --answer--

Nic zvláštního, Node pro každý požadavek spustí vlastní vlákno.

#### --why--

Myslíš si, že Node obsluhuje požadavky paralelně ve vláknech? Tvůj JavaScript běží
v jednom vlákně pro všechny.

### --answer--

Server spadne, protože `readFileSync` se na serveru používat nesmí.

#### --why--

Myslíš si, že synchronní funkce na serveru skončí chybou? Fungovat bude — jen pomalu
pro všechny.

### --see--

node-zaklady/co-je-node#soubory-node-fs-promises

## --question--

Klient pošle `GET /api/books?sort=title`. Jakou hodnotu má v handleru `req.url`?
Napiš ji celou.

### --expected--

/api/books?sort=title

### --accept--

'/api/books?sort=title'

### --why--

`req.url` je cesta i s query stringem, bez protokolu a domény. Pro routování se bere
`pathname` z `new URL(req.url, 'http://localhost')`.

### --see--

node-zaklady/http-v-node#adresa-req-url-cesta-a-query-string

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

Myslíš si, že `writeHead` odpověď odešle? Odešle jen začátek; hotová je až po `res.end()`.

### --correct--

Server vypíše zprávu do terminálu, ale klient čeká a odpověď nikdy nedostane.

#### --why--

Chybí `res.end()`. Dokud ho server nezavolá, odpověď není ukončená a klient čeká, až mu
vyprší časový limit.

### --answer--

Node skončí chybou, protože handler nic nevrací.

#### --why--

Myslíš si, že handler odpovídá přes `return`? Návratová hodnota Node nezajímá, odpověď
se posílá přes objekt `res`.

### --see--

node-zaklady/http-v-node#typicke-chyby-a-pasti

## --question--

Klient pošle v těle `POST /api/books` useknutý JSON `{"title": `. Jaký stavový kód má
server vrátit? Napiš číslo.

### --expected--

400

### --why--

Chyba je v požadavku a opravit ji má klient, proto `4xx`. Kdyby výjimka z `JSON.parse`
zůstala nechycená, server by spadl; `500` by klientovi tvrdilo, že se rozbil server.

### --see--

node-zaklady/http-v-node#stavove-kody

## --question--

Server na `PUT /api/books` odpoví stavem `405` a hlavičkou `Allow: GET, POST`. Co tím
klientovi říká?

### --answer--

Že adresa `/api/books` neexistuje.

#### --why--

Myslíš si, že `405` je jiná forma „nenalezeno"? Na neexistující adresu je `404`.

### --correct--

Že adresa existuje, ale metodu `PUT` neumí; umí `GET` a `POST`.

#### --why--

`405 Method Not Allowed` a hlavička `Allow` se seznamem metod, které adresa podporuje.

### --answer--

Že klient nemá oprávnění knihy měnit a musí se přihlásit.

#### --why--

Myslíš si, že jde o práva? Na chybějící přihlášení jsou stavy `401` a `403`.

### --see--

node-zaklady/http-v-node#stavove-kody

## --question--

V asynchronním handleru serveru vyletí výjimka, kterou nikde nechytáš (třeba z
`JSON.parse` nad poškozeným souborem). Co se stane?

### --answer--

Jen ten jeden požadavek skončí chybou `500`, ostatní uživatelé nic nepoznají.

#### --why--

Myslíš si, že Node pošle `500` sám? Musíš chybu chytit (`try`/`catch`) a `500` poslat.

### --correct--

Celý proces serveru spadne a přestane odpovídat všem uživatelům.

#### --why--

Nezachycená výjimka v Node ukončí proces. Jeden server obsluhuje všechny, takže jedna
nechycená chyba je výpadek pro všechny.

### --answer--

Node chybu vypíše a pokračuje, jako by se nic nestalo.

#### --why--

Myslíš si, že se Node chová jako prohlížeč? Chyba ve skriptu stránky stránku nezavře,
nezachycená výjimka v Node ale proces ukončí.

### --see--

node-zaklady/workshop-http-server/021

## --question--

Najdi v MDN v přehledu stavových kódů HTTP, jaký kód server pošle, když je tělo
požadavku větší, než server přijme (anglicky *Content Too Large*). Napiš číslo.

### --expected--

413

### --why--

`413 Content Too Large` je chyba klienta (`4xx`): požadavek je v pořádku, jen moc
velký. Seznam všech kódů je na MDN v *HTTP response status codes*.

### --see--

node-zaklady/http-v-node#kde-to-najdes-v-mdn

## --question--

Server má z pole knih vrátit jména autorů, každé jen jednou. Doplň jméno metody:
`const authors = [...new Set(books.____((book) => book.author))];`

### --expected--

map

### --why--

`map` vyrobí z pole knih nové pole stejné délky se jmény. `Set` z něj odstraní duplicity
a `[...množina]` z něj udělá zase pole.

### --see--

js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci

# --code-- Kolegův úkolníček

## --file-- tasks-server.js

```js
// Úkolníček — API úkolů, které kolega napsal za jedno odpoledne.
import http from 'node:http';

const PORT = process.env.PORT || 3000;

let tasks = [
  { id: 1, text: 'Koupit mléko', done: false },
  { id: 2, text: 'Zavolat do servisu', done: true },
  { id: 3, text: 'Zaplatit nájem', done: false },
];

function answer(response, code, value) {
  response.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

function collectBody(request, callback) {
  let body = '';
  request.on('data', function (piece) {
    body += piece;
  });
  request.on('end', function () {
    callback(body);
  });
}

http.createServer(function (request, response) {
  if (request.url === '/tasks') {
    if (request.method === 'GET') {
      answer(response, 200, tasks);
      return;
    }
    if (request.method === 'POST') {
      collectBody(request, function (body) {
        const data = JSON.parse(body);
        const task = { id: tasks.length + 1, text: data.text, done: false };
        tasks.push(task);
        answer(response, 200, task);
      });
      return;
    }
  }

  if (request.url.startsWith('/tasks/')) {
    const id = parseInt(request.url.split('/')[2]);
    let found = null;
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        found = tasks[i];
      }
    }

    if (request.method === 'DELETE') {
      tasks = tasks.filter(function (t) {
        return t.id !== id;
      });
      response.writeHead(204);
      response.end();
      return;
    }

    if (found === null) {
      answer(response, 404, { error: 'Úkol neexistuje.' });
    }
    answer(response, 200, found);
    return;
  }

  answer(response, 404, { error: 'Neznámá adresa.' });
}).listen(PORT, function () {
  console.log('Úkolníček poslouchá na portu ' + PORT);
});
```

## --question--

Klient pošle `GET /tasks?done=true`. Jaký stavový kód dostane? Napiš číslo.

### --expected--

404

### --why--

Řádek 28 porovnává celé `request.url` s `'/tasks'`, jenže `request.url` obsahuje
i `?done=true`. Nesedí ani řádek 44, a tak požadavek skončí u odpovědi `404` na řádku 69.
Pomohlo by porovnávat `pathname`.

### --see--

node-zaklady/http-v-node#adresa-req-url-cesta-a-query-string

## --question--

Po požadavku `GET /tasks/99` klient dostane `404`, ale pak server spadne
s `ERR_HTTP_HEADERS_SENT`. Na kterém řádku chybí `return`? Napiš číslo řádku.

### --expected--

63

### --why--

Řádek 63 pošle `404`, ale kód pokračuje na řádek 65 a pokusí se poslat druhou odpověď.
`return` za odesláním na řádku 63 handler ukončí.

### --see--

node-zaklady/http-v-node#jedna-odpoved-na-kazdy-pozadavek

## --question--

Server právě nastartoval. Klient smaže úkol 2 (`DELETE /tasks/2`) a hned potom vytvoří
nový úkol přes `POST /tasks`. Jaké `id` dostane nový úkol? Napiš číslo.

### --expected--

3

### --why--

Po smazání zbudou úkoly s id 1 a 3, takže `tasks.length + 1` na řádku 36 dá `3` —
stejné id, jaké už má úkol „Zaplatit nájem". Id je potřeba počítat z nejvyššího
existujícího id, nebo použít `randomUUID()`.

### --see--

node-zaklady/workshop-http-server/016

## --question--

Klient pošle `DELETE /tasks/99` a úkol s id 99 neexistuje. Co dostane?

### --answer--

`404`, protože řádek 62 zjistí, že úkol neexistuje.

#### --why--

Myslíš si, že se kontrola na řádku 62 provede? Větev pro `DELETE` na řádcích 53–60
odpoví a skončí dřív, než k ní kód dojde.

### --correct--

`204`, jako by se úkol smazal — větev `DELETE` existenci úkolu nekontroluje.

#### --why--

Řádky 53–60 úkol vyfiltrují (nic se nezmění) a pošlou `204`. Klient si myslí, že smazal
něco, co nikdy neexistovalo. Kontrola `found === null` patří před větev `DELETE`.

### --answer--

`405`, protože `DELETE` na tuhle adresu nepatří.

#### --why--

Myslíš si, že server `405` někde posílá? V celém souboru žádná odpověď `405` není.

### --see--

node-zaklady/http-v-node#stavove-kody

## --question--

Klient vytvoří úkol s textem `Koupit čočku` a tělo požadavku přijde po malých kouscích.
Co hrozí kvůli řádku 20?

### --answer--

Nic, `body += piece` převede každý kousek na text a spojí je správně.

#### --why--

Myslíš si, že převod po kouscích nevadí? Kousky nerespektují hranice znaků.

### --correct--

Písmeno `č` (dva bajty) se může rozdělit mezi dva kousky a v textu úkolu z něj budou
neplatné znaky.

#### --why--

`body += piece` převádí každý `Buffer` na text zvlášť. Bezpečné je kousky sbírat do pole
a převést až `Buffer.concat(kousky)`.

### --answer--

Server spadne, protože `Buffer` nejde přičíst k řetězci.

#### --why--

Myslíš si, že `+=` s `Buffer` vyhodí chybu? JavaScript `Buffer` převede na text, jen
v nesprávnou chvíli.

### --see--

node-zaklady/http-v-node#telo-pozadavku-je-proud
