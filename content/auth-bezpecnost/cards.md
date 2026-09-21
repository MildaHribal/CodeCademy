## --card-- free

Proč se heslo neukládá ani zašifrované, a co se ukládá místo něj?

### --back--

Šifrování je obousměrné — kdo získá databázi i klíč, má všechna hesla v čitelné podobě.
Ukládá se **[[hash hesla|hash]]**: jednosměrný otisk, ze kterého se zpátky nic spočítat
nedá. Při přihlášení se zahashuje zadané heslo a porovnají se otisky.

### --see--

auth-bezpecnost/hesla#proc-ne-text-ani-sifrovani

## --card-- free

K čemu je u hesla [[sůl]] a proč nemusí být tajná?

### --back--

Je to náhodný řetězec přimíchaný ke každému heslu zvlášť, takže dva uživatelé se stejným
heslem mají různý otisk. Tím přestanou fungovat předpočítané tabulky otisků — útočník
by musel pro každou sůl počítat znovu. Tajná být nemusí, protože chrání proti
předpočítání, ne proti čtení.

### --see--

auth-bezpecnost/hesla#sul-stejna-hesla-ruzne-hashe

## --card-- free

Proč se na hesla nepoužije `SHA-256`, ale scrypt nebo Argon2?

### --back--

`SHA-256` je **záměrně rychlý** — moderní karta jich spočítá miliardy za vteřinu, takže
hrubá síla je otázka hodin. [[pomalý hash|Pomalý hash]] je navržený tak, aby byl pomalý
a paměťově náročný: jedno přihlášení zdrží o desítky milisekund, útok o roky. Náročnost
se dá časem zvyšovat.

### --see--

auth-bezpecnost/hesla#pomaly-hash-scrypt-a-argon2

## --card-- free

Proč se hashe hesel porovnávají v [[konstantní čas|konstantním čase]] a ne přes `===`?

### --back--

`===` skončí hned u prvního rozdílu, takže porovnání trvá různě dlouho podle toho, kolik
znaků sedí. Z těch rozdílů jde hodnotu uhodnout znak po znaku. Funkce jako
`crypto.timingSafeEqual` trvají vždy stejně dlouho.

### --see--

auth-bezpecnost/hesla#porovnani-hesla-timingsafeequal

## --card-- free

Co znamená, že je HTTP [[bezstavový protokol|bezstavové]], a co z toho plyne pro přihlašování?

### --back--

Server si mezi požadavky nic nepamatuje — každý přijde jako od cizího. Aby poznal
přihlášeného, musí prohlížeč sám přikládat ke každému požadavku nějaký údaj. Na to jsou
[[cookie|cookies]]: server je jednou pošle a prohlížeč je pak posílá zpátky automaticky.

### --see--

auth-bezpecnost/session-a-cookies#http-si-nic-nepamatuje

## --card-- free

Jaké čtyři atributy má mít přihlašovací cookie a co každý z nich zavírá?

### --back--

`HttpOnly` (nedostupná z JavaScriptu, takže ji neukradne XSS), `Secure` (jen přes HTTPS,
takže se nedá odposlechnout), `SameSite=Lax` nebo `Strict` (neposílá se z cizí stránky,
takže brání [[CSRF]]) a `Max-Age` nebo `Expires` (session nežije věčně). Bez nich je
přihlašovací cookie díra.

### --see--

auth-bezpecnost/session-a-cookies#atributy-cookie

## --card-- free

Jaký je rozdíl mezi [[autentizace|autentizací]] a [[autorizace|autorizací]]? Uveď chybu, která vzniká, když se to splete.

### --back--

Autentizace je „**kdo** jsi" (heslo, passkey), autorizace „**co smíš**" (role, vlastnictví
záznamu). Typická chyba: server ověří, že je uživatel přihlášený, a vydá mu záznam podle
id z adresy — ale neověří, že ten záznam patří jemu. To je [[IDOR]].

### --see--

auth-bezpecnost/session-a-cookies#autentizace-a-autorizace

## --card-- free

Čím se liší [[session]] a [[JWT]]? Kdy dává smysl které?

### --back--

U session leží záznam na serveru a klient nosí jen náhodné id — server ho umí kdykoli
zneplatnit (odhlášení, zablokování účtu). JWT si nosí údaje klient a server nic neukládá,
zato **nejde zneplatnit** dřív, než vyprší. Pro běžnou webovou aplikaci s vlastním
backendem je session jednodušší a bezpečnější; JWT se hodí mezi službami a na krátkou
životnost.

### --see--

auth-bezpecnost/session-a-cookies#session-nebo-jwt

## --card-- free

Je obsah JWT tajný?

### --back--

Ne. JWT je **podepsaný, ne zašifrovaný** — hlavička i data jsou jen zakódované v base64
a kdokoli si je přečte. Podpis zaručuje jen to, že je nikdo bez klíče nezmění. Do JWT
proto nepatří nic citlivého.

### --see--

auth-bezpecnost/session-a-cookies#jwt-podepsany-ne-zasifrovany

## --card-- free

Proč se při přihlášení vydává **nové** session id?

### --back--

Kvůli [[fixace session|fixaci session]]: kdyby si uživatel po přihlášení nechal id, které
měl předtím, mohl by mu ho útočník podstrčit předem a po přihlášení ho používat s ním.
Nové id při každém přihlášení tuhle cestu zavře.

### --see--

auth-bezpecnost/session-a-cookies#odhlaseni-a-vyprseni

## --card-- free

Vysvětli, proč tenhle dotaz jde zneužít a jak se to opraví.

```js
const sql = `SELECT * FROM users WHERE email = '${email}'`;
```

### --back--

Vstup se stane součástí dotazu, takže `' OR 1=1 --` změní jeho význam a vrátí všechny
řádky. Oprava není „ošetřit uvozovky", ale [[parametrizovaný dotaz]]:
`db.query('SELECT * FROM users WHERE email = $1', [email])`. Hodnota se předá zvlášť
a databáze ji nikdy nevyhodnotí jako kód.

### --see--

auth-bezpecnost/owasp-zranitelnosti#sql-injection

## --card-- free

Proč nestačí escapovat výstup „jednou provždy" a co znamená escapovat podle kontextu?

### --back--

Každé místo ve stránce má jiná nebezpečná znaménka. V textu je to `<` a `&`, v atributu
uvozovky, v adrese schéma `javascript:` a uvnitř `<script>` úplně jiná pravidla. Stejná
hodnota proto potřebuje jiné escapování podle toho, kam se dostane — jedna univerzální
funkce nestačí.

### --see--

auth-bezpecnost/owasp-zranitelnosti#xss-na-serveru-escapovani-a-kontext

## --card-- free

K čemu je [[CSP]], když už escapuješ výstup?

### --back--

Je to **druhá pojistka**. Escapování se dá na jednom místě zapomenout; CSP je hlavička,
kterou stránka řekne prohlížeči, odkud smí načítat a spouštět skripty. Když jedno místo
propustí vložený skript, CSP ho zastaví při spuštění.

### --see--

auth-bezpecnost/owasp-zranitelnosti#csp-druha-pojistka-proti-xss

## --card-- free

Jak funguje [[CSRF]] a proč nepomůže kontrola, že je uživatel přihlášený?

### --back--

Cizí stránka pošle požadavek na tvůj web a prohlížeč k němu **sám** přidá přihlašovací
cookie — takže z pohledu serveru je to řádně přihlášený uživatel. Zavírá se atributem
`SameSite` u cookie a u citlivých akcí navíc tokenem, který cizí stránka nemůže znát.

### --see--

auth-bezpecnost/owasp-zranitelnosti#csrf-pozadavek-z-cizi-stranky

## --card-- free

Na co je u přihlašování [[rate limit]] a proč nestačí pomalý hash?

### --back--

Pomalý hash zdrží útočníka, který má ukradenou databázi. Rate limit zdrží toho, kdo hesla
zkouší **přes tvoje přihlašování** — bez stropu jich vyzkouší tisíce za minutu a pomalý
hash mu jen prodlouží jeden pokus. Omezuje se na adresu i na účet.

### --see--

auth-bezpecnost/owasp-zranitelnosti#omezeni-zneuziti-rate-limit-velikost-a-hlavicky

## --card-- free

Co je [[otevřené přesměrování]] a proč je nebezpečné, když na něm žádná data nejsou?

### --back--

Stránka přesměruje kamkoli podle parametru z adresy (`/odhlaseni?next=https://podvod.cz`).
Nebezpečné je tím, že odkaz začíná **tvojí důvěryhodnou doménou** — uživatel mu uvěří a
skončí na podvodné stránce. Zavírá se seznamem povolených cílů nebo jen relativními cestami.

### --see--

auth-bezpecnost/owasp-zranitelnosti#otevrene-presmerovani

## --card-- free

Server vrátí `500` a v odpovědi je celý stack trace. Proč je to bezpečnostní problém?

### --back--

Chybová hláška prozradí cesty na disku, jména souborů, verze knihoven a někdy i kus
dotazu nebo konfigurace — přesně to, co útočník potřebuje k výběru další cesty. V produkci
se ven posílá obecná hláška a identifikátor, podrobnost patří do logu.

### --see--

auth-bezpecnost/owasp-zranitelnosti#unik-tajemstvi-a-chybovych-hlasek

## --card-- free

Co je [[PKCE]] a proti čemu chrání, když už authorization code stejně vyprší za pár minut?

### --back--

Aplikace si vylosuje tajný *code verifier*, do adresy pošle jen jeho otisk (*code
challenge*) a při výměně kódu za tokeny ukáže originál. Chrání proti zachycenému kódu:
kdo ho ukradne z logu, z historie nebo z cizí aplikace v telefonu, nemá verifier, a tokeny
tedy nedostane.

### --see--

auth-bezpecnost/auth-v-praxi#authorization-code-s-pkce-krok-za-krokem

## --card-- free

Jaký je rozdíl mezi [[ID token|ID tokenem]] a [[access token|access tokenem]]?

### --back--

ID token je **doklad o totožnosti pro tvoji aplikaci** — přečteš si ho, ověříš podpis
a podle `sub` najdeš nebo založíš uživatele. Access token je **klíč k API poskytovatele**
(kalendář, profil); tvoje aplikace ho nečte, jen ho posílá v hlavičce `Authorization`.
Přítomnost access tokenu není přihlášení — mohl ho vydat někdo úplně jiné aplikaci.

### --see--

auth-bezpecnost/auth-v-praxi#oauth-2-0-kdo-za-co-odpovida

## --card-- free

Proč [[passkey]] neprojde na podvodné doméně, i když vypadá úplně stejně jako ta pravá?

### --back--

Klíč vzniká **pro konkrétní doménu** a prohlížeč ho jinde vůbec nenabídne. Uživatel tedy
nemá co opsat ani co potvrdit. Tím passkeys ruší celou kategorii phishingu, na kterou
heslo ani jednorázový kód z aplikace nestačí — ty jdou přepsat kamkoli.

### --see--

auth-bezpecnost/auth-v-praxi#passkeys-a-webauthn

## --card-- free

Proč se [[kódy pro obnovu]] k druhému faktoru ukládají hashované, když je to jen náhodný řetězec?

### --back--

Protože obejdou druhý faktor, a jsou tedy plnohodnotným přihlašovacím údajem. Kdyby ležely
v databázi otevřeně, únik databáze by znamenal převzetí účtů. Náhodnost chrání proti
hádání, ne proti čtení. Po použití se kód navíc škrtá.

### --see--

auth-bezpecnost/auth-v-praxi#druhy-faktor-totp-a-kody-pro-obnovu

## --card-- free

Kdy API vrací `401` a kdy `403`? A proč se to nesmí plést?

### --back--

`401` znamená „nevím, kdo jsi" — chybí nebo neplatí přihlášení; klient má na to reagovat
přihlášením. `403` znamená „vím, kdo jsi, a tohle nesmíš" — přihlášení je v pořádku, chybí
oprávnění; opakovaným přihlášením se nic nezlepší. Když se pletou, klient buď zbytečně
odhlašuje uživatele, nebo mu nabízí akci, která nikdy neprojde.

### --see--

auth-bezpecnost/session-a-cookies#autentizace-a-autorizace

## --card-- free

Proč se role uživatele nesmí brát z cookie, z těla požadavku ani z tokenu, který si napsal klient?

### --back--

Všechno, co přijde v požadavku, si odesílatel může přepsat — cookie `role=user` se
v DevTools změní na `role=admin` za tři vteřiny. O oprávnění smí rozhodovat jen údaj, který
server zná sám: řádek uživatele v databázi dohledaný podle session. Totéž platí pro cenu
v objednávce nebo pro id autora.

### --see--

auth-bezpecnost/session-a-cookies#autentizace-a-autorizace

## --card-- free

Proč [[rate limit]] na přihlašování podle e-mailu nestačí?

### --back--

Zastaví hádání hesla k jednomu účtu, ale ne útok napříč účty: útočník vezme jedno běžné
heslo a zkusí ho na tisíc různých e-mailů, takže žádné počítadlo se nenaplní. Proto se
limity kombinují — podle účtu, podle IP adresy a za celou routu.

### --see--

auth-bezpecnost/owasp-zranitelnosti#omezeni-zneuziti-rate-limit-velikost-a-hlavicky

## --card-- output

Šablona escapuje název inzerátu takhle. Co vypíše `console.log`?

```js
const nazev = '<b>Kolo</b>';
console.log(nazev.replaceAll('<', '&lt;').replaceAll('&', '&amp;'));
```

### --expected--

&amp;lt;b>Kolo&amp;lt;/b>

### --why--

Ampersand musí jít **první**. Tady se nahradil až nakonec, takže přepsal i ampersandy,
které právě vznikly z `<`. Výsledek je dvojitě escapovaný a na stránce se ukáže `&lt;`
jako text.

### --see--

auth-bezpecnost/owasp-zranitelnosti#xss-na-serveru-escapovani-a-kontext

## --card-- code js

Doplň `maPravo(role, pravo)`, která odpoví podle tabulky práv. Neznámá role nesmí nic.

### --seed--

```js
const PRAVA = {
  ctenar: [],
  redaktor: ['clanek:psat', 'clanek:publikovat'],
  spravce: ['clanek:psat', 'clanek:publikovat', 'clanek:mazat'],
};

function maPravo(role, pravo) {
}
```

### --test--

```js
assert.equal(maPravo('redaktor', 'clanek:psat'), true, 'redaktor má právo clanek:psat');
assert.equal(maPravo('redaktor', 'clanek:mazat'), false, 'redaktor nemá právo clanek:mazat');
assert.equal(maPravo('spravce', 'clanek:mazat'), true, 'spravce má právo clanek:mazat');
assert.equal(maPravo('ctenar', 'clanek:psat'), false, 'ctenar nemá žádné právo');
assert.equal(maPravo('kral', 'clanek:psat'), false, 'neznámá role nemá žádné právo');
```

### --solution--

```js
const PRAVA = {
  ctenar: [],
  redaktor: ['clanek:psat', 'clanek:publikovat'],
  spravce: ['clanek:psat', 'clanek:publikovat', 'clanek:mazat'],
};

function maPravo(role, pravo) {
  return (PRAVA[role] ?? []).includes(pravo);
}
```

### --see--

auth-bezpecnost/session-a-cookies#autentizace-a-autorizace
