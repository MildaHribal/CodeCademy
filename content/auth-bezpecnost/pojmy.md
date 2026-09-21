## --term-- hash hesla

en: password hash
aliases: hash, hashe, hashem, hashu, hashování, zahashovat, otisk hesla
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Hash_function
lekce: auth-bezpecnost/hesla#hash-jednosmerny-otisk

Jednosměrný otisk hesla: ze stejného vstupu vyjde vždy stejný výstup, ale zpátky se
z něj heslo spočítat nedá. Do databáze se ukládá **jen** otisk — nikdy heslo samotné
a nikdy zašifrované heslo, které by šlo dešifrovat.

## --term-- sůl

en: salt
aliases: soli, solí, sůl hesla, osolit, osolené heslo
lekce: auth-bezpecnost/hesla#sul-stejna-hesla-ruzne-hashe

Náhodný řetězec přimíchaný ke každému heslu před hashováním. Díky němu mají dva
uživatelé se stejným heslem různý otisk a útočníkovi nepomůže předpočítaná tabulka.
Ukládá se vedle otisku, tajná být nemusí.

## --term-- pomalý hash

en: slow hash
aliases: pomalého hashe, pomalým hashem, scrypt, Argon2, bcrypt, KDF
lekce: auth-bezpecnost/hesla#pomaly-hash-scrypt-a-argon2

Hashovací funkce navržená tak, aby byla **záměrně pomalá a paměťově náročná**
(scrypt, Argon2, bcrypt). Jedno přihlášení tím zdrží o desítky milisekund, útok hrubou
silou o roky. `SHA-256` je na hesla rychlý, a proto nevhodný.

## --term-- konstantní čas

en: constant time comparison
aliases: konstantním čase, porovnání v konstantním čase, timingSafeEqual, časový útok
lekce: auth-bezpecnost/hesla#porovnani-hesla-timingsafeequal

Porovnání dvou hodnot, které trvá vždy stejně dlouho, ať se liší na prvním, nebo
posledním znaku. Obyčejné `===` skončí hned při první odchylce a útočník z rozdílů
v čase uhodne hodnotu znak po znaku.

## --term-- bezstavový protokol

en: stateless protocol
aliases: bezstavový, bezstavovost, bezstavového protokolu, HTTP je bezstavové
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
lekce: auth-bezpecnost/session-a-cookies#http-si-nic-nepamatuje

HTTP si mezi požadavky nic nepamatuje — každý přijde jako od cizího. Proto musí prohlížeč
sám posílat něco, podle čeho ho server pozná, a proto vůbec existují cookies a session.

## --term-- cookie

en: cookie
aliases: cookies, cookie hlavička, sušenka, Set-Cookie
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
lekce: auth-bezpecnost/session-a-cookies#cookie-set-cookie-a-cookie

Malý údaj, který server pošle hlavičkou `Set-Cookie` a prohlížeč ho pak **sám** přikládá
ke každému dalšímu požadavku na tu doménu. Nic si nevybírá — posílá ho i tehdy, když
požadavek vyvolala cizí stránka.

## --term-- atribut cookie

en: cookie attribute
aliases: atributy cookie, atributů cookie, HttpOnly, Secure, SameSite, Max-Age
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
lekce: auth-bezpecnost/session-a-cookies#atributy-cookie

Nastavení, které rozhoduje, kdy se cookie posílá a kdo na ni dosáhne: `HttpOnly`
(nedostupná z JavaScriptu), `Secure` (jen přes HTTPS), `SameSite` (ne z cizí stránky),
`Max-Age`, `Path` a `Domain`. Přihlašovací cookie bez nich je díra.

## --term-- session

en: session
aliases: session id, sessions, sessiony, session v databázi, relace
lekce: auth-bezpecnost/session-a-cookies#session-v-databazi

Záznam o přihlášení uložený na serveru; prohlížeč nosí jen jeho **náhodné id** v cookie.
Server si podle něj dohledá, kdo je přihlášený — a odhlášení znamená prostě smazat
ten záznam.

## --term-- fixace session

en: session fixation
aliases: fixaci session, fixace relace, session fixation
lekce: auth-bezpecnost/session-a-cookies#odhlaseni-a-vyprseni

Útok, při kterém oběť dostane session id předem známé útočníkovi a po přihlášení ho
používá dál. Zavírá se tím, že se **při přihlášení vydá nové session id** a staré se
zahodí.

## --term-- autentizace

en: authentication
aliases: autentizaci, autentizací, authn, ověření totožnosti, kdo jsi
lekce: auth-bezpecnost/session-a-cookies#autentizace-a-autorizace

Ověření, **kdo** uživatel je (heslo, passkey, přihlášení přes Google). Odpovídá na
otázku „jsi to ty?".

## --term-- autorizace

en: authorization
aliases: autorizaci, autorizací, authz, oprávnění, na co máš právo
lekce: auth-bezpecnost/session-a-cookies#autentizace-a-autorizace

Rozhodnutí, **co** smí přihlášený uživatel udělat (role, vlastnictví záznamu). Odpovídá
na otázku „smíš to?". Autentizace bez autorizace je běžná chyba: přihlášený uživatel
ještě neznamená oprávněný.

## --term-- JWT

en: JSON Web Token
aliases: JWT token, JWT tokenu, JSON Web Token, tokenu JWT
lekce: auth-bezpecnost/session-a-cookies#jwt-podepsany-ne-zasifrovany

Podepsaný (ne zašifrovaný!) balíček údajů, který si nosí klient. Obsah si kdokoli
přečte, jen ho nezmění bez klíče. Server nemusí nic ukládat — ale taky nemůže token
zneplatnit dřív, než vyprší.

## --term-- middleware

en: middleware
aliases: middlewaru, middlewarem, middlewary, mezivrstva
lekce: auth-bezpecnost/workshop-prihlaseni/013

Funkce, která se pustí **mezi** příchodem požadavku a jeho obsluhou: ověří session,
doplní údaje o uživateli a buď pustí dál, nebo rovnou odpoví chybou. Díky ní se
kontrola nepíše do každé routy zvlášť.

## --term-- SQL injection

en: SQL injection
aliases: SQL injekce, SQL injectionu, SQL injection útok, injektáž SQL
lekce: auth-bezpecnost/owasp-zranitelnosti#sql-injection

Útok, při kterém se vstup od uživatele stane součástí SQL dotazu a změní jeho význam.
Vzniká skládáním dotazu z řetězců; zavírá se parametrizovaným dotazem, ne „ošetřením"
vstupu.

## --term-- parametrizovaný dotaz

en: parameterized query
aliases: parametrizované dotazy, parametrizovaného dotazu, prepared statement, vázané parametry, placeholder v dotazu
lekce: auth-bezpecnost/owasp-zranitelnosti#sql-injection

Dotaz, ve kterém jsou místo hodnot zástupné znaky (`$1`, `?`) a hodnoty se předávají
zvlášť. Databáze je pak nikdy nevyhodnotí jako kód — text zůstane textem, ať v něm je
cokoli.

## --term-- CSP

en: Content Security Policy
aliases: Content Security Policy, CSP hlavička, politika obsahu
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
lekce: auth-bezpecnost/owasp-zranitelnosti#csp-druha-pojistka-proti-xss

Hlavička, kterou stránka řekne prohlížeči, odkud smí načítat skripty, styly a obrázky.
Je to **druhá** pojistka: když escapování selže, vložený skript se ani nespustí.

## --term-- CSRF

en: cross-site request forgery
aliases: CSRF útok, CSRF tokenu, CSRF token, cross-site request forgery, podvržený požadavek
lekce: auth-bezpecnost/owasp-zranitelnosti#csrf-pozadavek-z-cizi-stranky

Útok, při kterém cizí stránka pošle požadavek na tvůj web a prohlížeč k němu **sám**
přidá přihlašovací cookie. Zavírá se atributem `SameSite` a u citlivých akcí navíc
tokenem, který cizí stránka nezná.

## --term-- IDOR

en: insecure direct object reference
aliases: IDORu, IDOR zranitelnost, přístup podle cizího id, insecure direct object reference
lekce: auth-bezpecnost/owasp-zranitelnosti#idor-cizi-zaznam-podle-id

Chyba, kdy server vydá záznam jen podle id z adresy a neověří, jestli patří přihlášenému
uživateli. Změna `/faktury/512` na `/faktury/513` pak ukáže cizí fakturu.

## --term-- otevřené přesměrování

en: open redirect
aliases: otevřeného přesměrování, otevřená přesměrování, open redirect
lekce: auth-bezpecnost/owasp-zranitelnosti#otevrene-presmerovani

Stránka, která přesměruje kamkoli podle parametru z adresy. Útočník ji použije jako
důvěryhodný odrazový můstek na podvodný web. Zavírá se seznamem povolených cílů nebo
jen relativními cestami.

## --term-- rate limit

en: rate limiting
aliases: rate limitu, rate limitem, omezení počtu požadavků, omezení rychlosti
lekce: auth-bezpecnost/owasp-zranitelnosti#omezeni-zneuziti-rate-limit-velikost-a-hlavicky

Strop na počet požadavků z jedné adresy nebo od jednoho účtu za čas. U přihlašování
je to hlavní obrana proti zkoušení hesel — samotný pomalý hash nestačí, když útočník
zkouší tisíckrát za minutu.

## --term-- XSS na serveru

en: server-side XSS
aliases: XSS v šabloně, escapování výstupu, escapování podle kontextu, XSS při vykreslení
lekce: auth-bezpecnost/owasp-zranitelnosti#xss-na-serveru-escapovani-a-kontext

Vložení cizího skriptu do stránky tím, že server vypíše vstup od uživatele bez
escapování. Escapuje se **podle místa**, kam se hodnota dostane: jinak v textu,
jinak v atributu, jinak v URL a jinak uvnitř `<script>`.

## --term-- OAuth 2.0

en: OAuth 2.0
aliases: OAuth, OAuthu, OAuth 2, OAuth 2.1, protokol OAuth
lekce: auth-bezpecnost/auth-v-praxi#oauth-2-0-kdo-za-co-odpovida

Protokol o **delegovaném přístupu**: aplikace dostane povolení sáhnout na část cizích dat,
aniž by znala heslo uživatele. Role v něm jsou uživatel, aplikace, autorizační server
a API s daty.

## --term-- OpenID Connect

en: OpenID Connect
aliases: OIDC, OpenID, OpenID Connectu
lekce: auth-bezpecnost/auth-v-praxi#oauth-2-0-kdo-za-co-odpovida

Tenká vrstva nad OAuth 2.0, která k povolení přidává **výpověď o totožnosti** (ID token).
Teprve s ní je z OAuthu přihlášení, ne jen přístup k datům.

## --term-- poskytovatel identity

en: identity provider
aliases: poskytovatele identity, poskytovatelem identity, identity provider, IdP
lekce: auth-bezpecnost/auth-v-praxi#heslo-ktere-nikdy-nevznikne

Služba, která ověří totožnost uživatele místo tebe (Google, GitHub, firemní Microsoft
Entra) a tvé aplikaci pošle potvrzení. Heslo zůstává u ní.

## --term-- authorization code

en: authorization code
aliases: autorizační kód, autorizačního kódu, authorization code flow, tok s autorizačním kódem
lekce: auth-bezpecnost/auth-v-praxi#authorization-code-s-pkce-krok-za-krokem

Krátkodobý jednorázový kód, který se po návratu od poskytovatele vymění za tokeny.
Výměna jde ze serveru na server, takže tokeny nikdy neprojdou adresním řádkem.

## --term-- PKCE

en: Proof Key for Code Exchange
aliases: code verifier, code challenge, Proof Key for Code Exchange, PKCE rozšíření
lekce: auth-bezpecnost/auth-v-praxi#authorization-code-s-pkce-krok-za-krokem

Doplněk toku s autorizačním kódem: aplikace pošle nejdřív otisk tajemství (*code
challenge*) a při výměně ukáže originál (*code verifier*). Zachycený kód je pak bez
originálu nepoužitelný.

## --term-- access token

en: access token
aliases: přístupový token, access tokenu, přístupového tokenu
lekce: auth-bezpecnost/auth-v-praxi#oauth-2-0-kdo-za-co-odpovida

Klíč k API poskytovatele. Posílá se v hlavičce `Authorization: Bearer …`; tvoje aplikace
si ho nečte, jen ho předává dál. Není to přihlášení do tvé aplikace.

## --term-- ID token

en: ID token
aliases: ID tokenu, identitní token
lekce: auth-bezpecnost/auth-v-praxi#oauth-2-0-kdo-za-co-odpovida

Podepsaný JWT s údaji o uživateli (`sub`, `email`, `email_verified`), který si přečte
tvoje aplikace. Klíčem do vlastní tabulky uživatelů je `sub`, ne e-mail.

## --term-- passkey

en: passkey
aliases: passkeys, passkeye, passkeyem, přístupový klíč
lekce: auth-bezpecnost/auth-v-praxi#passkeys-a-webauthn

Pár klíčů místo hesla: soukromý zůstane v zařízení nebo v klíčence, veřejný si uloží
server. Podpis je svázaný s doménou, takže passkey nejde phishnout.

## --term-- WebAuthn

en: Web Authentication API
aliases: Web Authentication API, WebAuthnu, webauthn
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API
lekce: auth-bezpecnost/auth-v-praxi#passkeys-a-webauthn

Rozhraní prohlížeče, kterým se passkeys vytvářejí a používají
(`navigator.credentials.create()` a `.get()`).

## --term-- TOTP

en: time-based one-time password
aliases: dvoufaktorové ověření, 2FA, druhý faktor, jednorázový kód z aplikace, time-based one-time password
lekce: auth-bezpecnost/auth-v-praxi#druhy-faktor-totp-a-kody-pro-obnovu

Šestimístný kód počítaný ze sdíleného tajemství a aktuálního času, který se mění každých
30 vteřin. Funguje bez sítě a bez SMS.

## --term-- kódy pro obnovu

en: recovery codes
aliases: kód pro obnovu, kódů pro obnovu, záložní kódy, recovery codes
lekce: auth-bezpecnost/auth-v-praxi#druhy-faktor-totp-a-kody-pro-obnovu

Jednorázové řetězce, kterými se uživatel dostane do účtu i bez druhého faktoru. V databázi
patří hashované jako heslo a po použití se škrtají.

## --term-- RBAC

en: role-based access control
aliases: řízení přístupu podle rolí, model rolí, role-based access control
lekce: auth-bezpecnost/lab-role-a-opravneni

Model autorizace, ve kterém má uživatel roli a role určuje, co smí. Pravidlo se píše
jednou na jednom místě, ne do každé routy zvlášť.

## --term-- princip nejmenších oprávnění

en: principle of least privilege
aliases: nejmenší oprávnění, princip nejmenšího oprávnění, least privilege
lekce: auth-bezpecnost/lab-role-a-opravneni

Pravidlo, že účet i role dostanou přesně tolik práv, kolik potřebují k práci, a nic
navíc. Nová role proto začíná prázdná a práva se přidávají, ne odebírají.

## --term-- audit log

en: audit log
aliases: auditní záznam, auditního logu, audit trail
lekce: auth-bezpecnost/lab-role-a-opravneni

Záznam o citlivých akcích (kdo, co, kdy, komu), který se jen přidává a nemaže. Odpovídá
na otázku „kdo to smazal" i na otázku „zkoušel někdo sahat, kam nemá".
