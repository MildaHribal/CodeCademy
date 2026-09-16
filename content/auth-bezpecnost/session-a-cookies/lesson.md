# Session, cookies a JWT

:::check pretest
Uživatel se přihlásí a server mu odpoví `200`. O vteřinu později pošle prohlížeč `GET /api/trainings`. Co myslíš, podle čeho server pozná, že jde o téhož přihlášeného člověka?

### --answer--
Podle IP adresy, ze které požadavek přišel.

#### --why--
IP adresu sdílí celá domácnost nebo kavárna a u mobilu se mění. Za chvíli uvidíš, co si prohlížeč posílá místo toho.

### --answer--
Server si pamatuje otevřené spojení z přihlášení.

#### --why--
Spojení se může po každém požadavku zavřít a otevřít znovu. HTTP samo o dřívějších požadavcích nic neví.

### --correct--
Prohlížeč s požadavkem pošle cookie, kterou mu server při přihlášení nastavil.

#### --why--
Přesně tak. V lekci uvidíš, co v té cookie je a proč to není jméno uživatele.
:::

Na webu klubu se člen přihlásí e-mailem a heslem a pak kliká po stránkách s tréninky,
výsledky a nastavením účtu. Heslo zadal jednou. Každý další požadavek ale přichází
na server samostatně a server musí u každého znovu rozhodnout, kdo ho poslal.
Přesně tohle řeší přihlášení na každém webu, od e-shopu po bankovnictví.

> [!REMEMBER]
> **Po přihlášení server vydá náhodný identifikátor a uloží si ho k uživateli. Prohlížeč ho v cookie posílá s každým požadavkem a server si podle něj uživatele najde.**

## HTTP si nic nepamatuje

HTTP je [[bezstavový protokol]] (*stateless*): každý požadavek nese všechno, co server
potřebuje, a server si mezi požadavky nic nepamatuje. Z toho plyne, že „být přihlášený"
musí znamenat **poslat s každým požadavkem důkaz**.

Nabízí se poslat s každým požadavkem e-mail a heslo. Heslo by pak putovalo sítí stokrát,
leželo by v paměti prohlížeče a server by stokrát počítal pomalý hash. Proto se heslo
ověří jednou a server místo něj vydá dočasný důkaz: [[session]] (*relace*).

| krok | kdo | co se děje |
|---|---|---|
| 1 | prohlížeč | `POST /api/login` s e-mailem a heslem |
| 2 | server | ověří heslo, vygeneruje náhodné id session, uloží ho k uživateli |
| 3 | server | odpoví hlavičkou `Set-Cookie: session=<id>` |
| 4 | prohlížeč | každý další požadavek na stejný web pošle s hlavičkou `Cookie: session=<id>` |
| 5 | server | podle id najde session a v ní uživatele |

:::check
Proč server po přihlášení nevyžaduje heslo u každého dalšího požadavku?

### --answer--
HTTP neumí poslat heslo víckrát než jednou.

#### --why--
Myslíš si, že jde o omezení protokolu? Poslat heslo by šlo klidně s každým požadavkem. Důvody jsou jinde.

### --correct--
Heslo by zbytečně cestovalo sítí a server by pokaždé počítal pomalý hash. Stačí jednou ověřit a vydat dočasný důkaz.

#### --why--
Session je náhrada za heslo s omezenou platností, kterou jde kdykoli zrušit.
:::

## Cookie: `Set-Cookie` a `Cookie`

[[cookie|Cookie]] je malá dvojice `jméno=hodnota`, kterou server prohlížeči nastaví
hlavičkou odpovědi a prohlížeč ji pak sám posílá zpátky. Tvůj JavaScript na stránce
nemusí dělat nic.

```text
HTTP/1.1 200 OK
Set-Cookie: session=pX3k9Qe7…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

```text
GET /api/trainings HTTP/1.1
Cookie: theme=dark; session=pX3k9Qe7…
```

Server čte hlavičku `Cookie` jako jeden řetězec: dvojice oddělené středníkem a mezerou.
V Node je v `req.headers.cookie` (malými písmeny, jako všechny hlavičky).

```js
// Rozdělení hlavičky na dvojice: jméno před prvním „=", hodnota za ním.
const header = 'theme=dark; lang=cs';
for (const pair of header.split(';')) {
  const [name, ...rest] = pair.trim().split('=');
  console.log(name, rest.join('='));
}
```

Proč `rest.join('=')`: hodnota cookie smí obsahovat znak `=` (třeba base64 s doplněním),
a `split('=')` by ji rozsekal.

:::check
Hlavička požadavku je `Cookie: oldsession=x1; session=k9Qe`. Co vrátí `header.includes('session=')`, když hledáš session? Napiš `true`, nebo `false`.

### --expected--
true

### --why--
`includes` najde `session=` i uvnitř `oldsession=`. Hledání přes `includes` nebo
`startsWith` na celé hlavičce proto najde špatnou cookie. Hlavičku rozděl na dvojice
a porovnej celé jméno.
:::

## Atributy cookie

Za hodnotou následují [[atribut cookie|atributy]]. Prohlížeč je nikdy neposílá zpátky,
jen se jimi řídí. U session cookie rozhodují o bezpečnosti:

| atribut | co dělá | proti čemu |
|---|---|---|
| `HttpOnly` | JavaScript stránky cookie nepřečte (`document.cookie` ji nevidí) | krádež session přes [[XSS]] |
| `Secure` | cookie se posílá jen přes HTTPS (výjimka: `localhost`) | odposlech v kavárenské Wi-Fi |
| `SameSite=Lax` | z cizího webu se cookie pošle jen u běžného prokliku odkazem (GET), ne u formuláře `POST` ani `fetch` | [[CSRF]] |
| `SameSite=Strict` | z cizího webu se nepošle vůbec, ani u prokliku | CSRF; uživatel ale po prokliku z e-mailu vypadá odhlášený |
| `SameSite=None` | posílá se všude, vyžaduje `Secure` | nic, jen pro vložené widgety na cizích webech |
| `Path=/` | pro které cesty se posílá | bez něj platí jen pro cestu, kde vznikla |
| `Max-Age=604800` | za kolik sekund ji prohlížeč zahodí; `Max-Age=0` ji smaže hned | bez něj zmizí se zavřením prohlížeče |
| `Domain` | pro které domény; **vynech ho**, pak platí jen pro přesně tuhle doménu | únik na subdomény |

Útočník připraví stránku `vyhra-zdarma.cz` s neviditelným formulářem, který se sám odešle
na tvůj server. Zkus předpovědět, co server zaloguje:

:::live node predict
```js
// server klubu na https://klub-na-stezce.cz
// session cookie: session=k9Qe…; HttpOnly; Secure; SameSite=Lax; Path=/
createServer((req, res) => {
  console.log(req.method, req.url, '→', req.headers.cookie ?? '(bez cookie)');
  res.end();
});

// Přihlášená Eva je na stránce vyhra-zdarma.cz, která:
// 1. sama odešle formulář POST na https://klub-na-stezce.cz/api/password
// 2. potom Eva klikne na odkaz https://klub-na-stezce.cz/treninky
```
--question-- Pošle prohlížeč session cookie s požadavkem z bodu 1 a z bodu 2?
--option-- Ano u obou, cookie patří klubu a prohlížeč ji pošle na klub vždycky.
--option*-- U formuláře POST ne, u prokliku odkazem ano.
--option-- U obou ne, požadavek začal na cizím webu.
--output--
```text
POST /api/password → (bez cookie)
GET /treninky → session=k9Qe…
```
--why-- `SameSite=Lax` posílá cookie z cizího webu jen u navigace nejvyšší úrovně bezpečnou metodou (proklik odkazem, `GET`). Formulář `POST` z cizí stránky přijde bez cookie, takže ho server bere jako nepřihlášený. Proto se změny stavu nikdy nedělají přes `GET`: ten by `Lax` pustilo.
:::

:::check
Proč session cookie dostane `HttpOnly`?

### --answer--
Aby ji prohlížeč neposílal přes nezabezpečené HTTP.

#### --why--
Myslíš si, že jde o přenos? Na to je `Secure`. `HttpOnly` řeší, kdo cookie přečte na stránce.

### --correct--
Aby ji nepřečetl JavaScript na stránce, ani útočníkův skript vložený přes XSS.

#### --why--
Prohlížeč cookie dál posílá sám, jen `document.cookie` ji nevidí. Útočný skript tak session neodnese.

### --answer--
Aby cookie platila jen pro HTTP požadavky na API, ne pro stránky.

#### --why--
Myslíš si, že „Http" znamená druh požadavku? Cookie se posílá se všemi požadavky podle `Path` a `Domain`. `HttpOnly` jen skryje cookie před JavaScriptem.
:::

## Session v databázi

Id session musí být **nepředvídatelné**: kdo ho uhodne, je přihlášený jako cizí člověk.
Proto žádné `userId`, žádné pořadové číslo, žádné `Date.now()`, ale 32 náhodných bajtů
z kryptografického generátoru. To je 2²⁵⁶ možností, hádat je nemá smysl.

```js
import { randomBytes } from 'node:crypto';

const token = randomBytes(32).toString('base64url'); // 43 znaků, bezpečné do cookie
```

Server si session uloží do tabulky:

| sloupec | příklad | proč |
|---|---|---|
| `id` | `pX3k9Qe7…` | hledá se podle něj |
| `user_id` | `42` | komu session patří |
| `expires_at` | `1790604800000` | kdy přestane platit, kontroluje **server** |

U každého požadavku pak server: přečte cookie → najde řádek → zkontroluje `expires_at`
→ načte uživatele. Když cokoli z toho selže, uživatel není přihlášený.

> [!PITFALL]
> `Max-Age` v cookie je jen prosba na prohlížeč. Kdo si cookie zkopíruje (útočník,
> skript, `curl`), pošle ji klidně i za rok. **Platnost musí hlídat server**
> přes `expires_at`, jinak ukradená session platí navždy.

:::check
Kolega navrhuje jako id session použít `user-${user.id}-${Date.now()}`. Proč ne?

### --answer--
Je moc dlouhé na cookie.

#### --why--
Myslíš si, že jde o délku? Cookie unese přes 4 kB. Problém je v tom, jak snadno se id dá vymyslet.

### --correct--
Dá se uhodnout: id uživatele je známé a čas přihlášení se dá zkoušet po milisekundách.

#### --why--
Id session je jediný důkaz přihlášení. Musí být náhodné z `randomBytes`, jinak si ho útočník vyrobí sám.

### --answer--
`Date.now()` vrací čas v milisekundách a v cookie se musí použít sekundy.

#### --why--
Myslíš si, že jde o jednotky? Hodnota session nemá s časem nic společného. Rozhoduje nepředvídatelnost.
:::

## Odhlášení a vypršení

Odhlášení má dvě části a **obě jsou potřeba**:

1. **Smazat session v databázi.** Tím přestane platit i kopie cookie, kterou si někdo
   odnesl.
2. **Smazat cookie v prohlížeči**: `Set-Cookie: session=; Path=/; Max-Age=0` se stejnými
   `Path` a `Domain`, jaké měla původní cookie.

Kdy ještě mazat session:

- **změna hesla**: smaž všechny ostatní session uživatele (typicky „někdo se mi dostal
  do účtu, měním heslo"),
- **„odhlásit ze všech zařízení"**: smaž všechny session uživatele,
- **po přihlášení** vždy vydej **nové** id, nikdy nepřijímej id, které přišlo před
  přihlášením. Jinak hrozí [[fixace session]]: útočník podstrčí oběti své id a po jejím
  přihlášení ho použije.

Platnost bývá dvojí: pevná (7 dní od přihlášení) nebo klouzavá (prodlouží se při každé
aktivitě, ale nejdéle třeba 30 dní). Banka volí minuty, klubový web dny.

:::check
Při odhlášení server pošle jen `Set-Cookie: session=; Max-Age=0` a řádek v tabulce `sessions` nechá. Co to znamená pro útočníka, který si cookie předtím zkopíroval?

### --answer--
Nic, cookie je smazaná, takže ji nemůže použít.

#### --why--
Myslíš si, že smazání v prohlížeči smaže i kopie? Útočník má hodnotu u sebe a pošle ji sám.

### --correct--
Může ji dál používat, dokud session v databázi nevyprší.

#### --why--
Server session pozná podle řádku v databázi. Dokud řádek existuje, stará hodnota cookie funguje.
:::

## Autentizace a autorizace

Dvě slova, která se pletou, a dva stavové kódy, které k nim patří:

| | otázka | selhání | kód |
|---|---|---|---|
| [[autentizace]] (*authentication*, *authn*) | **kdo** jsi? | chybí session nebo neplatí | `401 Unauthorized` |
| [[autorizace]] (*authorization*, *authz*) | **smíš** tohle? | přihlášený, ale bez oprávnění | `403 Forbidden` |

`401` říká klientovi „přihlas se". `403` říká „přihlášení nepomůže". Frontend na `401`
typicky přesměruje na přihlášení, na `403` ukáže hlášku. Proto nevracej `401`, když
přihlášený člen sahá na cizí data: aplikace by ho odhlásila.

V kódu serveru se autentizace dělá jednou na začátku (obal routy, *middleware*),
autorizace **u každé akce zvlášť**, protože záleží na tom, na co uživatel sahá:

```js
// 1. autentizace: kdo to je
const user = getCurrentUser(req);
if (!user) return sendJson(res, 401, { error: 'Nejdřív se přihlas.' });

// 2. autorizace: smí upravit tenhle konkrétní článek?
if (article.authorId !== user.id) return sendJson(res, 403, { error: 'Tohle není tvůj článek.' });
```

:::check
Přihlášený člen klubu pošle `DELETE /api/trainings/3`, ale mazat tréninky smí jen trenér. Jaký stavový kód server vrátí?

### --expected--
403

### --accept--
403 Forbidden

### --why--
Server ví, kdo to je (autentizace prošla), ale akce mu nepatří. `401` by frontend
pochopil jako „přihlas se znovu", což nepomůže.
:::

## JWT: podepsaný, ne zašifrovaný

[[JWT]] (*JSON Web Token*) je jiný přístup: server si nic neukládá a údaje o uživateli
dá přímo do tokenu. Token má tři části oddělené tečkou: hlavička, data (*payload*)
a podpis. Hlavička a data jsou jen JSON zakódovaný do base64url. Podpis vznikne
z nich a z tajného klíče serveru.

Zkus předpovědět, co vypíše tenhle kód:

:::live js predict
```js
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQyLCJuYW1lIjoiRXZhIiwicm9sZSI6Im1lbWJlciIsImV4cCI6MTc5MDAwMDAwMH0.QRnZW-n8xBUxh2bjEbgClTDmdZSWBXYUdyso2u-qnDI';

const payload = token.split('.')[1];
console.log(atob(payload));
```
--question-- Co vypíše `console.log`? Napiš celý výstup.
--expected-- {"sub":42,"name":"Eva","role":"member","exp":1790000000}
--why-- Data v JWT **nejsou zašifrovaná**, jen zakódovaná. Přečte je kdokoli, kdo token vidí, bez klíče. Podpis jen zaručí, že je nikdo nezměnil: když útočník přepíše `member` na `admin`, podpis přestane sedět a server token odmítne. Do JWT proto nikdy nepatří nic tajného.
:::

Server při každém požadavku ověří podpis a čas `exp` a uživateli věří bez dotazu do
databáze. To je hlavní výhoda i hlavní past: **token nejde zrušit**. Když uživatel
změní heslo nebo mu správce odebere roli, starý token platí až do `exp`.

Zkus v ukázce vypsat i první část tokenu (`split('.')[0]`) a podívej se, jaký algoritmus
podpisu hlavička uvádí.

:::check
Útočník v datech JWT přepíše `"role":"member"` na `"role":"admin"` a token pošle serveru. Co se stane, když server token správně ověřuje?

### --answer--
Server ho přijme, protože data jsou platný JSON.

#### --why--
Myslíš si, že server kontroluje jen tvar dat? Ověřuje podpis nad hlavičkou i daty.

### --correct--
Server ho odmítne, protože podpis nesedí ke změněným datům.

#### --why--
Podpis spočítaný tajným klíčem pokrývá hlavičku i data. Bez klíče útočník nový platný podpis nevyrobí.

### --answer--
Útočník token nemůže přepsat, protože je zašifrovaný.

#### --why--
Myslíš si, že JWT je šifra? Data jsou jen v base64url, přečíst i přepsat je jde. Nejde k nim jen vyrobit platný podpis.
:::

## Session, nebo JWT?

| | session v databázi | JWT |
|---|---|---|
| odhlášení, zrušení při změně hesla | okamžitě, smazáním řádku | až po `exp`, jinak potřebuješ seznam zakázaných tokenů (a jsi zpátky u databáze) |
| dotaz na server při požadavku | ano, jeden rychlý dotaz | ne |
| velikost v každém požadavku | ~50 znaků | stovky znaků |
| kdo ověří | jen server s databází | kdokoli s klíčem, i jiná služba |
| kde dává smysl | web s vlastním backendem | krátké tokeny mezi službami, OAuth, mobilní API |

Pro běžnou webovou aplikaci s vlastním serverem je session v HttpOnly cookie jednodušší
a bezpečnější. JWT se vyplatí, když token ověřuje víc nezávislých služeb, a pak s krátkou
platností (minuty) a obnovovacím tokenem.

Ať zvolíš cokoli, token **nepatří do `localStorage`**: přečte ho každý skript na stránce,
takže jedna XSS chyba ho pošle útočníkovi. Z pohledu frontendu to znáš z lekce
[Kam uložit token](see:react-aplikace/auth-z-klienta#kam-ulozit-token).

:::explain
Na pohovoru dostaneš otázku: „Session, nebo JWT? Co bys zvolil pro webovou aplikaci s vlastním backendem a proč?" Odpověz vlastními slovy.

## --model--
Pro web s vlastním backendem bych zvolil session v databázi s id v HttpOnly cookie.
Session jde okamžitě zrušit při odhlášení nebo změně hesla, kdežto JWT platí až do
vypršení. JWT se hodí tam, kde token ověřuje víc služeb bez společné databáze, a pak
s krátkou platností. Data v JWT jsou jen podepsaná, ne zašifrovaná, takže do nich nepatří
nic tajného.

## --checklist--
- Session jde okamžitě zrušit smazáním v databázi, JWT platí do vypršení.
- JWT se hodí, když token ověřuje víc nezávislých služeb.
- Data v JWT přečte kdokoli, podpis jen brání jejich změně.
- Token ani session id nepatří do `localStorage` kvůli XSS.
:::

## Typické chyby a pasti

> [!PITFALL] Přihlášení „nefunguje", cookie se neuloží
> V DevTools v odpovědi je `Set-Cookie`, ale v záložce Application nic. Cookie má
> `Secure` a stránka běží na `http://` s jinou adresou než `localhost`, nebo má
> `SameSite=None` bez `Secure`. **Oprava:** HTTPS, nebo při vývoji `localhost`.

> [!PITFALL] Odhlášení neodhlásí
> Server poslal `Set-Cookie: session=; Max-Age=0` bez `Path=/`, zatímco původní cookie
> měla `Path=/`. Prohlížeč to bere jako jinou cookie a tu původní nechá. **Oprava:**
> mazací cookie se stejnými `Path` a `Domain`.

> [!PITFALL] `401` místo `403`
> Přihlášený uživatel sáhne na cizí data, server vrátí `401` a frontend ho odhlásí.
> **Oprava:** `401` jen když chybí nebo neplatí přihlášení, jinak `403`.

> [!PITFALL] JWT ověřený přes `jwt.decode`
> Knihovny mají `decode` (jen přečte data) a `verify` (ověří podpis a `exp`). Kód
> s `decode` přijme token, který si útočník napsal sám. **Oprava:** vždy `verify`
> s pevně daným algoritmem.

> [!PITFALL] Změna stavu přes `GET`
> `GET /api/logout-all` nebo `GET /api/delete?id=3` spustí i odkaz nebo přesměrování
> z cizí stránky, a u takové navigace `SameSite=Lax` cookie pošle. **Oprava:** změny
> jen přes `POST`, `PUT`, `PATCH`, `DELETE`.

:::check
Po kliknutí na „Odhlásit" pošle server `Set-Cookie: session=; Max-Age=0`. Původní cookie byla nastavená s `Path=/`. V DevTools cookie `session` pořád je. Co v mazací hlavičce chybí?

### --expected--
Path=/

### --accept--
Path
; Path=/

### --why--
Prohlížeč rozlišuje cookie podle jména, domény a cesty. Mazací cookie bez `Path=/`
dostane cestu podle adresy požadavku (`/api`), takže smaže jinou cookie než tu
přihlašovací.
:::

## Kde to najdeš v MDN

- [Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies) —
  jak cookie vzniká, posílá se a maže, s příklady atributů.
- [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) —
  všechny atributy včetně prefixů `__Host-` a `__Secure-`.
- [SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value) —
  přesně kdy se cookie pošle z cizího webu.
- [401 Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/401) a
  [403 Forbidden](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403) —
  rozdíl mezi chybějícím přihlášením a chybějícím oprávněním.

Příště si registraci, přihlášení, session a odhlášení postavíš sám nad SQLite.

# --questions--

## --question--

Server nastaví cookie `Set-Cookie: session=aB3…; HttpOnly; Secure; Path=/` a atribut `SameSite` vynechá. Co z toho plyne? Vyber jednu odpověď.

### --answer--
Cookie se neuloží, `SameSite` je povinný.

#### --why--
Myslíš si, že je atribut povinný? Povinný je jen `Secure` u `SameSite=None`. Bez `SameSite` se cookie uloží.

### --answer--
Nic, bez atributu se cookie z cizího webu nikdy neposílá.

#### --why--
Myslíš si, že vynechaný atribut znamená nejpřísnější nastavení? Bez atributu rozhoduje výchozí chování prohlížeče a to se mezi prohlížeči liší.

### --correct--
Chování závisí na prohlížeči: Chrome ji bere jako `Lax`, jiné prohlížeče ji z cizího webu pošlou. Atribut proto patří napsat výslovně.

#### --why--
Na výchozí hodnotu se nespoléhej. `SameSite=Lax` napsané v hlavičce se chová stejně ve všech prohlížečích.

## --question--

Session id se generuje jako `Math.floor(Math.random() * 1_000_000)`. Kolik různých hodnot musí útočník v nejhorším případě vyzkoušet, aby trefil něčí platnou session? Napiš číslo.

### --expected--
1000000

### --accept--
1 000 000
milion

### --why--
Milion požadavků zvládne skript za pár hodin i bez rychlé linky, a čím víc lidí je
přihlášených, tím dřív se trefí. `randomBytes(32)` dává 2²⁵⁶ možností, to se hádat nedá.

### --see--
auth-bezpecnost/session-a-cookies#session-v-databazi

## --question--

Aplikace používá JWT s platností 30 dní. Správce odebere uživateli roli `admin`. Jak dlouho může uživatel se starým tokenem dál dělat administrátorské akce, když server ověřuje jen podpis a `exp`? Odpověz krátce.

### --expected--
až do vypršení tokenu

### --accept--
do vypršení tokenu
až 30 dní
30 dní
do exp
dokud token nevyprší

### --why--
Server u JWT nic nehledá v databázi, věří datům v tokenu. Změna role se projeví až
novým tokenem. Proto mají JWT krátkou platnost, nebo server roli stejně ověřuje
v databázi, a pak se výhoda JWT ztrácí.

### --see--
auth-bezpecnost/session-a-cookies#session-nebo-jwt
