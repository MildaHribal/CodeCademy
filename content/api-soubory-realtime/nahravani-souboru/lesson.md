# Nahrávání souborů

:::check pretest
Inzerát v bazaru kol má formulář s `<input type="file" name="photo">`. Co musí formulář mít navíc, aby soubor vůbec dorazil na server?

### --answer--
Nic navíc, prohlížeč soubor pošle vždycky.

#### --why--
Výchozí kódování formuláře umí poslat jen dvojice jméno–hodnota. U souboru by dorazilo jen jeho jméno.

### --correct--
Atribut `enctype="multipart/form-data"` na formuláři.

#### --why--
Jak takové tělo vypadá a proč bez něj dorazí jen text, uvidíš v druhé části.

### --answer--
Hlavičku `Content-Length` nastavenou na velikost souboru.

#### --why--
Délku těla doplní prohlížeč sám. Problém je v tom, jak je tělo poskládané.
:::

:::check pretest
Server dostane soubor s hlavičkou `Content-Type: image/jpeg` a jménem `kolo.jpg`. Napiš jedním slovem, čím si po těchhle dvou údajích může být jistý, že jde opravdu o fotku.

### --expected-- ignore-case
ničím

### --accept--
nicim
ničím si jistý být nemůže
vůbec ničím

### --why--
Jméno i typ posílá klient. Oboje si může vymyslet, a curl nebo vlastní skript si vymyslí cokoli.
:::

Do bazaru kol přidáváš k inzerátu fotky. Vypadá to jako patnáct řádků: přijmout formulář, uložit soubor, zobrazit. Jenže první uživatel pošle video ze sportovní kamery a server se udusí pamětí, druhý nahraje soubor jménem `../../server.js` a třetí `zebricek.php`, který se na levném hostingu sám spustí. Nahrávání souborů je ta část API, kde se z nepozornosti stane díra nejrychleji.

> [!REMEMBER]
> **Nahraný soubor je vstup od uživatele jako každý jiný: jeho jméno, typ i velikost si vymyslel klient.** Server musí každou z těch tří věcí ověřit sám a soubor uložit pod jménem, které si určí on, ne odesílatel.

## Cesta souboru z formuláře na disk

Cesta má vždycky stejné čtyři zastávky. Vyplatí se je znát jménem, protože v každém frameworku vypadají jinak, ale jsou to pořád ony:

```js
// 1. Rozbal tělo požadavku na jednotlivé části
const form = await readMultipart(req);
const photo = form.get('photo');

// 2. Ověř, co přišlo (velikost, typ, počet)
assertAllowed(photo);

// 3. Ulož obsah pod jménem, které vymyslí server
const storedName = `${randomUUID()}.jpg`;
await writeFile(join(uploadDir, storedName), photo.stream());

// 4. Do databáze zapiš odkaz a metadata, ne samotná data
await db.insert(photos).values({ adId, storedName, originalName: photo.name, size: photo.size });
```

Na disku leží binární obsah, v databázi leží **odkaz** na něj a všechno, co o souboru víš: původní jméno, velikost, typ, kdo ho nahrál a kdy. Binární data do databáze nepatří — zálohy nabobtnají a každý výpis se začne vláčet.

:::check
Do které ze čtyř zastávek patří rozhodnutí, že soubor bude na disku ležet pod jménem `9f1c…-a3.jpg`, a ne pod `kolo.jpg`? Odpověz číslem.

### --expected--
3

### --accept--
3.
třetí
zastávka 3

### --why--
Jméno na disku určuje server při ukládání. Původní jméno si necháš jen jako údaj v databázi, aby šlo soubor nabídnout ke stažení pod tím, jak mu říká uživatel.
:::

## `multipart/form-data`: jak vypadá tělo

Obyčejný formulář posílá tělo jako `nazev=Author+Cyklokros&cena=18990`. Do takového řetězce se binární obsah nedá vecpat. Proto formulář se souborem použije [[multipart/form-data]]: tělo se rozdělí na části oddělené náhodným řetězcem, který prohlížeč vymyslí a napíše do hlavičky.

```text
POST /api/ads/12/photos HTTP/1.1
Content-Type: multipart/form-data; boundary=----hranice7Bd3

------hranice7Bd3
Content-Disposition: form-data; name="title"

Author Cyklokros 2024
------hranice7Bd3
Content-Disposition: form-data; name="photo"; filename="kolo.jpg"
Content-Type: image/jpeg

<binární obsah souboru>
------hranice7Bd3--
```

Každá část má vlastní hlavičky. `name` je jméno pole ve formuláři, `filename` je jméno souboru u klienta a `Content-Type` je [[MIME typ|typ obsahu]], který klient **tvrdí**. Poslední hranice má na konci dvě pomlčky navíc — tím tělo končí.

Rozebírat to ručně nemusíš. V Node stačí tělo požadavku podstrčit webovému `Response`, které `formData()` umí:

```js
import { Readable } from 'node:stream';

const form = await new Response(Readable.toWeb(req), {
  headers: { 'content-type': req.headers['content-type'] },
}).formData();

const photo = form.get('photo');   // objekt File
const title = form.get('title');   // obyčejný řetězec
```

`photo` je [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) — tentýž objekt, jaký znáš z prohlížeče. Má `name`, `type`, `size`, `arrayBuffer()` a `stream()`. V Expressu a v Nextu se k témuž dostaneš přes `req.formData()`.

:::check
Formulář pošle dvě pole: `title` a `photo`. Co vrátí `form.get('photo').type`?

### --answer--
Skutečný typ souboru, který server zjistil z jeho obsahu.

#### --why--
Server v téhle chvíli obsah ještě nečetl. Hodnota se bere odjinud, z toho, co přišlo v požadavku.

### --correct--
Hodnotu hlavičky `Content-Type` té části těla, tedy to, co tvrdí klient.

#### --why--
`type` je jen opsaná hlavička z požadavku. Ověřit obsah musí server zvlášť — jak, uvidíš v části o podpisu souboru.

### --answer--
Vždy `application/octet-stream`, protože Node binární typy nerozlišuje.

#### --why--
Node hodnotu nepřepisuje, jen ji předá dál tak, jak dorazila.
:::

## Limit velikosti dřív, než čteš

`formData()` si celé tělo naskládá do paměti. U fotky z mobilu to jsou tři megabajty, u videa ze sportovní kamery čtyři gigabajty — a server, který takové tělo přijme desetkrát naráz, spadne na `JavaScript heap out of memory`. Proto se velikost kontroluje **před** čtením, ne po něm.

První zábrana je hlavička `Content-Length`. Je to tvrzení klienta, ale tvrzení, které stojí za to odmítnout hned:

```js
const MAX_BYTES = 5 * 1024 * 1024;

const declared = Number(req.headers['content-length'] ?? 0);
if (declared > MAX_BYTES) {
  res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
  return res.end(JSON.stringify({ error: 'Soubor je větší než 5 MB.' }));
}
```

Druhá zábrana počítá bajty, které skutečně přitekly, a spojení utne, jakmile limit překročí. Bez ní stačí poslat lživou `Content-Length` a tělo bez konce.

:::live node predict
```js
let received = 0;
const limit = 10;

for (const chunk of [3, 4, 6, 2]) {
  received += chunk;
  console.log(`přijato ${received} B`);
  if (received > limit) {
    console.log('413 Payload Too Large');
    break;
  }
}
console.log('konec');
```
--question-- Kolik řádků `přijato …` se vypíše, než se objeví `413 Payload Too Large`?
--output--
```text
přijato 3 B
přijato 7 B
přijato 13 B
413 Payload Too Large
konec
```
--why-- Kontrola je až **po** přičtení kusu, takže poslední kus se do paměti vejde celý a teprve pak spojení utneš. Zkus si v hlavě posunout kontrolu před přičtení: limit se pak nepřekročí nikdy, ale nepoznáš ho, dokud nepřijde další kus.
:::

> [!TIP]
> Stavový kód pro příliš velké tělo je `413 Content Too Large`. Ke stejnému limitu nastav i proxy před aplikací — Nginx i Caddy mají vlastní strop a bez jeho zvýšení odmítnou požadavek dřív, než k tvému kódu vůbec dorazí.

:::check
Klient pošle `Content-Length: 1024`, ale ve skutečnosti proudí tělo bez konce. Stačí kontrola hlavičky `Content-Length` k obraně serveru?

### --answer--
Ano, prohlížeč pošle přesně tolik bajtů, kolik v hlavičce slíbil.

#### --why--
Prohlížeč možná ano. Požadavek ale nemusí přijít z prohlížeče — skript v Node ani curl se nemusí držet ničeho.

### --correct--
Ne. Hlavička je tvrzení klienta, takže server musí počítat i bajty, které opravdu přitečou.

#### --why--
Obě kontroly se doplňují: hlavička ušetří práci u poctivých klientů, počítání bajtů ochrání před nepoctivými.

### --answer--
Ne, protože `Content-Length` se u `multipart/form-data` vůbec neposílá.

#### --why--
Posílá se běžně. Problém není v tom, že chybí, ale v tom, kdo ji vyplnil.
:::

## Jméno souboru je vstup od útočníka

`filename` v těle požadavku je řetězec, který klient napsal. Když ho použiješ při ukládání, dostaneš přesně to, co si přál:

| co klient pošle jako `filename` | co se stane bez ošetření |
|---|---|
| `../../server.js` | přepíšeš si zdroják aplikace |
| `../../../home/app/.ssh/authorized_keys` | útočník si přidá klíč a přihlásí se na server |
| `zebricek.php` | levný hosting soubor při stažení spustí |
| `kolo.jpg` (podruhé) | přepíšeš fotku jiného uživatele |

Obrana je jednoduchá a nemá výjimky: **jméno na disku vymyslí server.** Náhodné id, k němu přípona odvozená z ověřeného typu — a původní jméno si ulož jako obyčejný text v databázi.

```js
import { randomUUID } from 'node:crypto';

const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const storedName = randomUUID() + extensions[detectedType];
```

:::check
Vývojář se rozhodl `filename` neházet pryč, ale vyčistit: `filename.replace('../', '')`. Proč to nestačí?

### --answer--
Protože `replace` s řetězcem nahrazuje jen první výskyt, jinak by to stačilo.

#### --why--
První výskyt je jen půlka problému. I kdyby `replaceAll` nahradil všechny, útočník má pořád zápisy, které tenhle filtr neuvidí.

### --correct--
Protože stejnou cestu jde zapsat jinak: `....//`, `..\\`, nebo `%2e%2e%2f` v zakódované podobě.

#### --why--
Seznam zakázaných tvarů je vždycky kratší než fantazie útočníka. Proto se cizí jméno nečistí, ale nahrazuje vlastním.

### --answer--
Protože `filename` je binární data, a `replace` funguje jen na text.

#### --why--
`filename` je normální řetězec z hlavičky. Potíž je v tom, co všechno se do něj dá napsat.
:::

## Typ podle obsahu, ne podle přípony

Přípona ani hlavička nejsou důkaz. Důkazem je pár prvních bajtů souboru — [[podpis souboru]]. Každý formát začíná svojí značkou:

| formát | první bajty | zápis |
|---|---|---|
| JPEG | `FF D8 FF` | `ÿØÿ` |
| PNG | `89 50 4E 47 0D 0A 1A 0A` | `‰PNG` |
| GIF | `47 49 46 38` | `GIF8` |
| PDF | `25 50 44 46` | `%PDF` |

:::live js
```js
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const podvrh = new Uint8Array([0x3c, 0x3f, 0x70, 0x68, 0x70]); // soubor, co se tváří jako kolo.jpg

const signatures = [
  { type: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { type: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
];

function detectType(buffer) {
  const found = signatures.find((signature) =>
    signature.bytes.every((byte, index) => buffer[index] === byte));
  return found ? found.type : null;
}

console.log(detectType(jpeg));
console.log(detectType(png));
console.log(detectType(podvrh));
```
:::

Zkus do `signatures` dopsat GIF (`0x47, 0x49, 0x46, 0x38`) a sleduj, jak se změní výsledek pro nový vzorek bajtů.

Podpis ověř a **teprve podle něj** zvol příponu a hlavičku `Content-Type` při vracení souboru. K tomu přidej `X-Content-Type-Options: nosniff`, aby prohlížeč netipoval typ podle obsahu sám.

> [!NOTE]
> Podpis říká, jak soubor začíná, ne že je v pořádku. Obrázek, který se tváří jako JPEG a přitom obsahuje škodlivý kus dat pro knihovnu na zmenšování, projde. U veřejného nahrávání se proto obrázky po přijetí ještě přegenerují (převedou na nový soubor), takže z původních dat nezbude nic než pixely.

:::check
Server přijme soubor `kolo.jpg` s `Content-Type: image/jpeg`, jehož první bajty jsou `3C 3F 70 68 70`. Co má udělat?

### --answer--
Uložit ho a při vracení poslat `Content-Type: text/plain`, aby se nespustil.

#### --why--
Soubor, který se tváří jinak, než jaký je, nemá na serveru co dělat. Uložením problém jen odložíš.

### --correct--
Odmítnout ho — podpis neodpovídá povoleným formátům.

#### --why--
Podpis `3C 3F 70 68 70` je `<?php`. Server má přijmout jen to, co skutečně je obrázek, a zbytek odmítnout s `415`.

### --answer--
Přijmout ho, protože hlavička `Content-Type` od klienta je správně.

#### --why--
Hlavičku psal klient. Právě proto, že si ji může vymyslet, se rozhoduje podle obsahu.
:::

## Kam soubory ukládat a jak je vracet

Adresář s nahranými soubory **nepatří mezi statické soubory webu**. Když leží v `public/`, server je vydá komukoli, kdo uhodne jméno, a případný spustitelný soubor vydá se vším všudy.

Tři rozumné varianty, podle toho, jak velký provoz čekáš:

- **Adresář mimo webroot** (`/var/app-data/uploads`) a routa, která soubor pošle až po kontrole oprávnění. Nejjednodušší start.
- **Objektové úložiště** (S3 a jeho klony). Aplikace neposílá bajty, jen vystaví [[předepsaná adresa|předepsanou adresu]] s omezenou platností a klient nahrává i stahuje přímo z úložiště.
- **Kombinace**: metadata v databázi, obsah v úložišti, aplikace rozhoduje jen o tom, komu adresu vydá.

```js
// routa, která soubor vydá jen tomu, kdo na něj má právo
const photo = await db.query.photos.findFirst({ where: eq(photos.id, id) });
if (!photo || photo.ownerId !== session.userId) {
  return sendError(res, 404, 'Fotka nenalezena.');
}
res.writeHead(200, {
  'Content-Type': photo.mimeType,
  'X-Content-Type-Options': 'nosniff',
  'Content-Disposition': `inline; filename="${encodeURIComponent(photo.originalName)}"`,
});
createReadStream(join(uploadDir, photo.storedName)).pipe(res);
```

Všimni si, že chybějící fotka i cizí fotka končí stejnou odpovědí `404`. Kdyby cizí fotka vracela `403`, útočník by uhodnutím id zjistil, které fotky existují.

:::check
Fotka, kterou si vyžádal cizí uživatel, a fotka, která vůbec neexistuje, končí obě odpovědí `404`. Proč se u cizí fotky neposílá `403`?

### --answer--
Protože `403` se posílá jen nepřihlášeným uživatelům.

#### --why--
`403` znamená „vím, kdo jsi, a tohle nesmíš". Pro nepřihlášeného je `401`. Důvod je tady jiný a týká se toho, co se odpovědí prozradí.

### --correct--
Protože rozdíl mezi `403` a `404` by prozradil, která id existují.

#### --why--
Útočník by projížděl id a podle stavového kódu si vyrobil seznam existujících fotek. Když obě situace odpovídají stejně, nedozví se nic.

### --answer--
Protože `403` by prohlížeč zopakoval s přihlašovacím dialogem.

#### --why--
Dialog vyvolává `401` s hlavičkou `WWW-Authenticate`. `403` prohlížeč jen zobrazí.
:::

:::explain
Vysvětli vlastními slovy, proč nestačí uložit soubory do `public/uploads/` a spolehnout se na to, že jejich jména nikdo neuhodne.

## --model--
Jméno v adresáři není oprávnění. Statický server vydá jakýkoli soubor, na který někdo trefí adresu, a adresy unikají v odkazech, v historii prohlížeče, v logu proxy i sdílením. Navíc se k souboru pak nedá připojit žádná kontrola: server neví, komu patří, takže ho nemůže odmítnout vydat. Když má být přístup řízený, musí soubor vydávat aplikace, která se předtím podívá, kdo se ptá.

## --checklist--
- Náhodné jméno je zdržení, ne oprávnění — kdo adresu získá, soubor dostane.
- Adresy uniknou i bez útoku: v odkazech, logu a historii.
- Statický server nemá jak zjistit, komu soubor patří.
- Kontrolu oprávnění umí udělat jen aplikace, která soubor vydává sama.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Validace až po uložení.** Kód nejdřív zapíše soubor na disk a pak zjistí, že je moc velký nebo špatného typu. Příznak: v `uploads/` se hromadí soubory, které v databázi nejsou. Oprava: ověřit velikost i podpis dřív, než se cokoli zapíše, a při chybě nezapisovat vůbec.

> [!PITFALL]
> **Spoléhání na přípony v seznamu.** Kontrola `if (name.endsWith('.jpg'))` projde souboru `utok.php.jpg` i souboru `kolo.jpg`, který je ve skutečnosti skript. Příznak: na hostingu se objeví adresa, která vrací výstup programu místo obrázku. Oprava: rozhodovat podle podpisu a příponu si dopsat sám.

> [!PITFALL]
> **Chybějící úklid po chybě.** Nahrání projde, zápis do databáze spadne a soubor zůstane na disku navždy. Příznak: disk se plní rychleji, než přibývá záznamů. Oprava: zápis do databáze a uložení souboru dělat v jednom postupu se `try`/`catch`, který po chybě soubor smaže.

> [!PITFALL]
> **`Content-Disposition` s neošetřeným jménem.** Původní jméno se vypíše do hlavičky tak, jak přišlo. Uvozovka nebo nový řádek v něm hlavičku rozbije nebo přidá další. Příznak: prohlížeč nabídne stažení pod useknutým jménem, případně odpověď obsahuje hlavičku navíc. Oprava: jméno zakódovat (`encodeURIComponent`) a délku omezit.

:::check
V `uploads/` je o 400 souborů víc než v tabulce fotek a rozdíl každý den roste. Kterou z pastí v téhle části to nejlíp popisuje? Odpověz dvěma slovy.

### --expected-- ignore-case
chybějící úklid

### --accept--
chybejici uklid
chybějící úklid po chybě
úklid po chybě

### --why--
Soubor se zapíše, následný zápis do databáze selže a nikdo soubor nesmaže. Stejný příznak má i validace až po uložení — obojí se řeší tím, že se nepovedené nahrání uklidí ve `finally`.
:::

## Kde to najdeš v MDN

- [`<input type="file">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file) — atributy `accept`, `multiple` a `capture` na straně formuláře.
- [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) — jak se tělo skládá na klientovi a jak se čte na serveru.
- [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) — vlastnosti `name`, `size`, `type` a metody pro čtení obsahu.
- [413 Content Too Large](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/413) — kdy ho poslat a co do odpovědi patří.

# --questions--

## --question--

Server u nahrané fotky kontroluje `photo.type === 'image/jpeg'` a nic jiného. Napiš jedním slovem, co takovou kontrolu obejde.

### --expected-- ignore-case
curl

### --accept--
skript
postman
vlastní klient
jakýkoli klient mimo prohlížeč

### --why--
`photo.type` je opsaná hlavička z požadavku. Kdokoli, kdo požadavek skládá sám, do ní napíše `image/jpeg` a přiloží libovolný obsah. Rozhodnout se dá jen podle prvních bajtů souboru.

### --see--
api-soubory-realtime/nahravani-souboru#typ-podle-obsahu-ne-podle-pripony

## --question--

Nahrávání fotek funguje, ale kolega hlásí, že po nahrání videa server na půl minuty přestane odpovídat úplně všem. Co je nejpravděpodobnější příčina?

### --answer--
Zápis na disk blokuje hlavní vlákno, protože `writeFile` je synchronní.

#### --why--
Asynchronní `writeFile` z `node:fs/promises` hlavní vlákno neblokuje. Zádrhel je jinde než v zápisu.

### --correct--
Celé tělo se načetlo do paměti naráz, takže proces začal odkládat paměť a zpomalil se.

#### --why--
`formData()` i `Buffer.concat` drží celý soubor v paměti. Velké soubory se musí buď odmítnout limitem, nebo zapisovat po kusech rovnou na disk.

### --answer--
Server čeká na `Content-Length`, které prohlížeč u velkých souborů neposílá.

#### --why--
`Content-Length` prohlížeč posílá i u velkých těl. A i kdyby chybělo, server by na ni nečekal.

### --see--
api-soubory-realtime/nahravani-souboru#limit-velikosti-driv-nez-ctes

## --question--

**Opakování z dřívějška.** Uživatel si smaže inzerát a se sekundovým odstupem klikne na **Smazat** ještě jednou, protože stránka byla pomalá. Napiš, jakým stavovým kódem má API odpovědět podruhé, aby se chovalo idempotentně.

### --expected--
204

### --accept--
204 No Content
404

### --why--
`DELETE` je idempotentní metoda: druhé volání nesmí skončit chybou aplikace. Buď odpovíš `204` (výsledek je stejný jako po prvním mazání — inzerát neexistuje), nebo `404`, když chceš klientovi říct, že už tam nic nebylo. Chybou by bylo `500`.

### --see--
api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni

## --question--

**Opakování z dřívějška.** Fotky se ukládají do adresáře `/var/app-data/uploads` a aplikace běží v kontejneru. Po každém nasazení nové verze fotky zmizí. Proč?

### --answer--
Protože `Dockerfile` adresář při buildu maže příkazem `RUN rm -rf`.

#### --why--
Nic takového v Dockerfile být nemusí. Problém je obecnější a týká se každého souboru, který kontejner za běhu vytvoří.

### --correct--
Protože zápisová vrstva kontejneru zaniká s kontejnerem — trvalá data potřebují svazek nebo externí úložiště.

#### --why--
Nová verze znamená nový kontejner z čistého image. Co si starý kontejner zapsal do své vrstvy, s ním zmizí. Proto se adresář s nahranými soubory připojuje jako svazek, nebo se soubory ukládají do objektového úložiště.

### --answer--
Protože se při nasazení spustí migrace databáze a ta smaže i soubory.

#### --why--
Migrace pracuje se schématem a daty v databázi. K adresáři na disku se vůbec nedostane.

### --see--
nasazeni-provoz/kontejnery-a-servery#image-a-kontejner
