# Přihlášení v praxi

:::check pretest
Web bazaru nabízí „Přihlásit se přes Google". Co myslíš, co se při tom pošle na server bazaru?

### --answer--
Heslo ke Googlu, aby si server ověřil, že sedí.

#### --why--
Kdyby to tak bylo, každý web s tímhle tlačítkem by znal tvoje heslo ke Googlu. Přihlášení přes cizí účet je postavené přesně tak, aby se to stát nemohlo.

### --correct--
Krátkodobý kód, za který si server u Googlu vymění potvrzení, kdo jsi.

#### --why--
Heslo zadáváš jen na stránce Googlu. Bazar dostane jen kód a za ním potvrzení o totožnosti — víc nepotřebuje.

### --answer--
Nic, prohlížeč si přihlášení vyřídí sám a server o něm neví.

#### --why--
Server musí vědět, komu patří session, kterou vydá. Jen si totožnost ověří jinde než u sebe.
:::

V předchozích modulech jsi postavil přihlášení sám: hash hesla, session v cookie,
kontrola na každé routě. Ve skutečné práci tenhle kód většinou nepíšeš. Nový projekt
sáhne po knihovně a přihlášení nabídne přes účet, který uživatel už má — Google, GitHub,
firemní účet — nebo přes [[passkey]], kde žádné heslo nevznikne. Tahle lekce je o tom,
co se pod těmi tlačítky děje, abys poznal, když je to zapojené špatně.

> [!REMEMBER]
> **Přihlášení přes cizí účet přesouvá ověření totožnosti jinam, ale session si pořád
> vydáváš sám.** Po návratu od Googlu děláš přesně to, co ve workshopu: založíš session
> a pošleš cookie.

## Heslo, které nikdy nevznikne

Každé heslo, které si uložíš, je závazek: musíš ho hashovat pomalým hashem, hlídat úniky
z jiných webů, řešit reset a zapomenutí. Proto se dnes u nových aplikací nejčastěji volí
jedna ze tří cest:

- **Delegované přihlášení** — totožnost ověří [[poskytovatel identity]] (Google, GitHub,
  Microsoft Entra ve firmě) a tvé aplikaci pošle potvrzení. Heslo u tebe nikdy není.
- **Passkey** — uživatel se prokáže klíčem uloženým v telefonu nebo v prohlížeči,
  odemčeným otiskem prstu nebo PINem zařízení. Heslo neexistuje ani u něj.
- **Odkaz nebo kód do e-mailu** (*magic link*) — server pošle jednorázový token, kliknutím
  se uživatel přihlásí. Heslo se neukládá, ale bezpečnost celého účtu je pak přesně tak
  dobrá jako jeho e-mailová schránka.

Heslo se pořád hodí tam, kde nechceš být závislý na cizí službě, a v Česku u aplikací pro
lidi bez firemního účtu. Většina reálných aplikací má obojí: heslo i tlačítko „přes
Google", a oboje vede ke stejnému uživateli v tabulce `users`.

:::check
Aplikace umí přihlášení heslem i přes Google. Co se musí stát, když se uživatel poprvé přihlásí přes Google e-mailem, který už v tabulce `users` má?

### --answer--
Vznikne druhý účet, protože jde o jiný způsob přihlášení.

#### --why--
Uživatel by přišel o svoje data — inzeráty a zprávy má na tom prvním účtu. Dva účty se stejným e-mailem jsou navíc věčný zdroj zmatku v podpoře.

### --correct--
Účet se propojí s tím stávajícím, ideálně až po ověření, že e-mail opravdu patří jemu.

#### --why--
Propojení podle e-mailu je běžné, ale smí se udělat jen tehdy, když poskytovatel potvrdí, že e-mail ověřil — jinak by si cizí účet u poskytovatele mohl někdo založit na tvůj e-mail.
:::

## OAuth 2.0: kdo za co odpovídá

[[OAuth 2.0]] je protokol o **delegovaném přístupu**: aplikace dostane povolení sáhnout na
část cizích dat, aniž by znala heslo. Původně vznikl pro věty typu „tahle aplikace smí
číst můj kalendář". Přihlášení z něj vzniklo až dodatečně — a právě proto existuje
[[OpenID Connect]] (OIDC), tenká vrstva nad OAuth, která k povolení přidává **výpověď
o totožnosti**.

Role si zapamatuj po jménech, protože v dokumentaci knihoven se s nimi potkáš:

| role | kdo to je u „přihlásit se přes Google" |
|---|---|
| resource owner | uživatel, který sedí u prohlížeče |
| client | tvoje aplikace (bazar) |
| authorization server | Google — stránka, kde uživatel zadává heslo |
| resource server | API, ze kterého se pak čtou data (třeba Google Kalendář) |

Z OIDC přibyde k tokenům ještě [[ID token]]: podepsaný JWT s údaji o uživateli
(`sub` — stabilní id uživatele u poskytovatele, `email`, `email_verified`, `name`).
Rozdíl mezi tokeny je jednoduchý, ale plete se:

- [[access token]] je **klíč k API** poskytovatele. Posílá se v hlavičce `Authorization`,
  tvoje aplikace ho nečte, jen předává dál.
- ID token je **doklad o totožnosti pro tebe**. Přečteš si ho, ověříš podpis a podle `sub`
  najdeš nebo založíš uživatele. Do API poskytovatele se s ním nechodí.

> [!PITFALL]
> Uživatele si nikdy neidentifikuj podle `email` z ID tokenu bez `email_verified: true`.
> A klíčem do své tabulky dělej `sub`, ne e-mail: e-mail se dá u poskytovatele změnit,
> `sub` ne.

:::check
K čemu slouží `access token`, který aplikace dostane spolu s ID tokenem?

### --expected--
K volání API poskytovatele jménem uživatele.

### --accept--
Je to klíč k API poskytovatele.
Pro přístup k datům uživatele u poskytovatele.

### --why--
ID token říká, **kdo** uživatel je, a čte si ho tvoje aplikace. Access token je klíč k **datům** u poskytovatele (kalendář, profil, repozitáře) a posílá se v hlavičce `Authorization: Bearer …`.
:::

## Authorization code s PKCE krok za krokem

Z několika toků, které OAuth popisuje, se dnes pro webové i mobilní aplikace používá jediný:
**authorization code flow s PKCE**. [[authorization code|Authorization code]] je krátkodobý
jednorázový kód, který se v druhém kroku vymění za tokeny. Ta výměna jde ze serveru na
server, takže tokeny nikdy neprojdou adresním řádkem ani historií prohlížeče.

[[PKCE]] (čti „pixí") to doplňuje o důkaz, že kód vyměňuje tentýž, kdo o něj požádal.
Aplikace si na začátku vylosuje tajný řetězec (*code verifier*), pošle jen jeho otisk
(*code challenge*) a při výměně ukáže originál:

:::memory
```js
const verifier = randomBytes(32).toString('base64url');
const challenge = base64url(sha256(verifier));
ulozDoSession({ verifier, state });
presmeruj(`https://ucet.example.com/authorize?code_challenge=${challenge}&state=${state}`);
const { code } = await navratNaZpetnouAdresu();
const tokeny = await vymen(code, verifier);
```
--step-- 1 | tajemství, které nikdy neopustí server
verifier = 'nL8s…kQ2'
--step-- 2 | otisk ven, originál doma
verifier = 'nL8s…kQ2'
challenge = 'Tf9a…0Xj'
--step-- 4 | v adrese poskytovatele je jen otisk
verifier = 'nL8s…kQ2'
challenge = 'Tf9a…0Xj'
odeslano -> @url
@url: { code_challenge: 'Tf9a…0Xj', state: 'r4v…' }
--step-- 5 | vrátil se kód, ale sám o sobě je k ničemu
verifier = 'nL8s…kQ2'
code = 'A1b2C3'
--step-- 6 | až kód i originál dohromady vydají tokeny
tokeny -> @t
@t: { access_token: 'ya29…', id_token: 'eyJ…' }
:::

Kdyby někdo kód ukradl (z logu proxy, z historie, z cizí aplikace na telefonu), bez
verifieru ho nevymění. Parametr `state` je druhá pojistka: náhodná hodnota uložená
v session, kterou po návratu porovnáš — chrání zpětnou adresu před [[CSRF]].

Adresu, na kterou uživatele posíláš, skládáš z parametrů. Zkus předpovědět, co z nich vznikne:

:::live js predict
```js
const url = new URL('https://ucet.example.com/authorize');
url.searchParams.set('client_id', 'bazar-suplik');
url.searchParams.set('redirect_uri', 'https://suplik.cz/prihlaseni/zpet');
url.searchParams.set('scope', 'openid email');
console.log(url.searchParams.get('scope'));
console.log(url.href.includes('scope=openid email'));
```
--question-- Co vypíše `console.log` na posledních dvou řádcích?
--expected--
```text
openid email
false
```
--why-- `searchParams.get` vrací hodnotu dekódovanou, takže mezeru uvidíš. Ve výsledné adrese ale mezera být nesmí — `URLSearchParams` ji zakóduje na `+` (`scope=openid+email`). Proto se parametry nikdy neskládají ručně přes spojování řetězců.
:::

Celý tok pak má čtyři části, a stojí za to si je pojmenovat účelem, ne technikou:

1. **Připrav tajemství** — vylosuj `verifier` a `state`, ulož je do session.
2. **Pošli uživatele k poskytovateli** — přesměrování na `/authorize` s `client_id`,
   `redirect_uri`, `scope`, `code_challenge` a `state`.
3. **Přijmi návrat** — na zpětné adrese ověř `state`, vezmi `code`.
4. **Vyměň kód za tokeny** — serverové volání `/token` s `code` a `verifier`, ověř podpis
   ID tokenu, najdi nebo založ uživatele a **vydej vlastní session**.

:::check
Ve kterém z těch čtyř kroků odejde `code_verifier` z tvého serveru ven?

### --answer--
Ve druhém, spolu s `code_challenge` v adrese přesměrování.

#### --why--
V adrese je jen otisk. Kdyby v ní byl i originál, útočník by měl obojí a celé PKCE by nedávalo smysl.

### --correct--
Ve čtvrtém, v serverovém volání `/token` — a to je jediné místo, kam patří.

#### --why--
Volání `/token` jde přímo mezi tvým serverem a poskytovatelem, mimo prohlížeč. Nikdo jiný originál nevidí.

### --answer--
Nikdy, `code_verifier` zůstane celou dobu v session.

#### --why--
V session opravdu čeká, ale bez odeslání by ho poskytovatel neměl s čím porovnat a tokeny by nevydal.
:::

:::explain
Vysvětli vlastními slovy, proč PKCE chrání i v případě, že útočník authorization code opravdu zachytí.

## --model--
Kód sám o sobě k ničemu není. Poskytovatel si u něj pamatuje otisk (`code_challenge`),
který přišel v prvním kroku, a tokeny vydá jen tomu, kdo při výměně pošle původní
`verifier` — tedy hodnotu, ze které ten otisk vznikl. Z otisku se verifier spočítat nedá,
protože je to jednosměrný hash, a útočník ho nikdy neviděl: cestoval jen z paměti
aplikace přímo do volání `/token`.

## --checklist--
- Kód se vyměňuje za tokeny až druhým, serverovým voláním.
- Poskytovatel si pamatuje otisk z prvního kroku a při výměně ho porovná.
- Útočník viděl jen otisk a z něj původní hodnotu nedopočítá.
- Bez verifieru je zachycený kód nepoužitelný.
:::

## „Přihlásit se přes Google" v praxi

Co reálně uděláš, když tohle tlačítko přidáváš do aplikace:

1. **Registrace aplikace u poskytovatele.** V konzoli Googlu (nebo v nastavení GitHubu)
   založíš OAuth client a dostaneš `client_id` a `client_secret`. Vyplníš přesný seznam
   zpětných adres — poskytovatel přesměruje jen na ně, takže cizí web si tvoje přihlášení
   nepřesměruje k sobě.
2. **Tajemství do prostředí.** `client_secret` patří do proměnných prostředí, ne do
   repozitáře a ne do kódu, který jde do prohlížeče.
3. **Dvě routy.** `GET /prihlaseni/google` připraví tajemství a přesměruje;
   `GET /prihlaseni/google/zpet` přijme návrat, vymění kód a vydá session.
4. **Namapování na uživatele.** Do tabulky si ulož `provider` a `provider_user_id`
   (to je `sub`), ne jen e-mail. Jeden uživatel může mít víc způsobů přihlášení.
5. **Odhlášení je pořád tvoje.** Smazat session u sebe nezruší přihlášení u Googlu —
   to je vlastnost, ne chyba.

Ve vývoji si dej pozor na jednu věc: zpětná adresa musí sedět **na znak** včetně portu
a lomítka na konci. „Chyba `redirect_uri_mismatch`" je nejčastější důvod, proč integrace
napoprvé nejede.

:::check
Proč poskytovatel trvá na předem zaregistrovaném seznamu zpětných adres?

### --answer--
Aby věděl, kam má poslat `client_secret`.

#### --why--
`client_secret` se nikdy nikam neposílá přesměrováním — používá se až při serverovém volání `/token`. Zpětná adresa slouží k něčemu jinému.

### --correct--
Aby útočník nemohl přesměrovat návrat s kódem na svůj web.

#### --why--
Bez seznamu by stačilo poslat uživatele na `/authorize` s cizím `redirect_uri` a kód by přistál u útočníka. Je to stejná past jako [[otevřené přesměrování]], jen v cizí službě.

### --answer--
Kvůli statistikám, aby poskytovatel věděl, které aplikace se používají.

#### --why--
Statistiky poskytovatel spočítá z `client_id`. Omezení adres je bezpečnostní opatření, ne měření.
:::

## Passkeys a WebAuthn

[[passkey|Passkey]] je pár klíčů: soukromý zůstane v zařízení (nebo v synchronizované
klíčence Applu, Googlu, správce hesel), veřejný si uloží server. Při přihlášení server
pošle náhodnou výzvu, zařízení ji po odemčení otiskem nebo PINem podepíše a server podpis
ověří veřejným klíčem. Rozhraní v prohlížeči se jmenuje [[WebAuthn]]
(`navigator.credentials.create()` a `.get()`).

Co to znamená v praxi:

- **Není co ukrást.** V databázi je veřejný klíč. Jeho únik útočníkovi nic nedá.
- **Nejde to phishnout.** Podpis je svázaný s doménou, pro kterou klíč vznikl. Na
  `suplik.cz.zlo.example` prohlížeč klíč prostě nenabídne — tohle heslo ani TOTP neumí.
- **Server neřeší složitost hesel** ani jejich reset. Řeší ale obnovu: uživatel, který
  přijde o zařízení, potřebuje druhou cestu dovnitř (další passkey, e-mail, kódy pro obnovu).

Passkey se zavádí postupně: nejdřív jako **druhý způsob přihlášení** vedle hesla, až když
ho má většina uživatelů, se heslo dá vypnout.

:::check
Uživatel si zaregistruje passkey na `suplik.cz`. Útočník ho pak podvodným e-mailem přiměje otevřít `suplik-cz.example.com`, která vypadá úplně stejně. Co se stane?

### --answer--
Uživatel se přihlásí a útočník získá jeho podpis.

#### --why--
Tohle by platilo u hesla nebo u opsaného kódu z aplikace. Klíč ale není údaj, který by šlo přepsat na jinou stránku.

### --correct--
Prohlížeč na té doméně žádný passkey nenabídne, protože klíč patří k `suplik.cz`.

#### --why--
Doména je součástí klíče. Proto passkeys ruší celou kategorii phishingu, na kterou heslo ani jednorázový kód nestačí.

### --answer--
Podpis vznikne, ale server ho odmítne, protože nesedí čas.

#### --why--
Čas s tím nemá co dělat — na rozdíl od TOTP. Rozhoduje doména, pro kterou byl klíč vytvořen.
:::

## Druhý faktor: TOTP a kódy pro obnovu

Dokud je v aplikaci heslo, dává smysl nabídnout druhý faktor. Nejběžnější je
[[TOTP]] — šestimístný kód z aplikace (Authy, Google Authenticator, správce hesel),
který se mění každých 30 vteřin.

Funguje bez internetu a bez SMS: server a aplikace sdílejí jedno tajemství a obě strany
z něj a z aktuálního času počítají stejný kód. Zapíná se naskenováním QR kódu, který to
tajemství nese.

Na co si dát pozor při zapínání:

- **Ověř první kód**, než druhý faktor zapneš natrvalo. Jinak vyřadíš uživatele, kterému
  se tajemství uložilo špatně.
- **Povol malý posun času** (obvykle jeden krok dozadu i dopředu), hodiny nejdou přesně.
- **Použitý kód zneplatni**, aby se stejný nedal použít dvakrát.
- **Vydej [[kódy pro obnovu]]** — jednorázové řetězce, které si uživatel uloží stranou.
  V databázi jsou **hashované** jako heslo a po použití se škrtají. Bez nich přijde
  uživatel o účet spolu s telefonem.
- **Rate limit** platí i tady: šest číslic uhodne hrubá síla rychle.

> [!NOTE]
> SMS jako druhý faktor je pořád lepší než nic, ale je nejslabší z voleb: SIM se dá
> přenést na útočníka. Pro citlivé účty dnes volíš passkey, nebo TOTP.

:::check
Proč se kódy pro obnovu ukládají hashované, když je to jen náhodný řetězec?

### --expected--
Protože z databáze fungují stejně jako heslo.

### --accept--
Kdo by získal databázi, mohl by se s nimi přihlásit.
Je to přihlašovací údaj, únik databáze by stačil k přihlášení.

### --why--
Kód pro obnovu obejde druhý faktor — je to plnohodnotný přihlašovací údaj. Kdyby ležel v databázi otevřeně, únik databáze by znamenal převzetí účtů. Náhodnost stačí proti hádání, ne proti čtení.
:::

## Knihovna místo vlastního řešení

Ve workshopu sis přihlášení napsal sám, protože jinak nejde vidět, co dělá. V projektu to
ale nedělej: knihovna už má vyřešené vypršení session, rotaci při přihlášení, reset hesla,
ověření e-mailu, OAuth s PKCE i passkeys.

| nástroj | kdy ho potkáš |
|---|---|
| **Better Auth** | první volba v nových projektech v TypeScriptu; běží u tebe, data máš ve své databázi |
| **Auth.js** (dřív NextAuth) | v už běžících projektech v Next.js; hodně návodů, ale i hodně verzí |
| **Clerk, Auth0, Supabase Auth** | spravovaná služba: hotové obrazovky a správa uživatelů za měsíční poplatek a za cenu toho, že účty nejsou ve tvé databázi |

Ať zvolíš cokoli, zůstane na tobě to, co knihovna udělat nemůže: **autorizace**. Knihovna
ti řekne, kdo je přihlášený. Jestli tenhle uživatel smí smazat tenhle inzerát, rozhodneš
jen ty — a to je téma labu, který za touhle lekcí následuje.

:::check
Co i po nasazení hotové knihovny pro přihlášení zůstává tvojí prací?

### --expected--
Autorizace, tedy kontrola oprávnění na každé routě.

### --accept--
Kontrola, co smí přihlášený uživatel udělat.
Oprávnění na routách.

### --why--
Knihovna řeší [[autentizaci]] — vydá session a řekne, kdo je přihlášený. [[autorizace|Autorizaci]] za tebe nikdo neudělá, protože pravidla („kdo smí smazat cizí inzerát") zná jen tvoje aplikace.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Tokeny od poskytovatele nejsou tvoje session.** Uložit `access_token` do cookie
> a považovat jeho přítomnost za přihlášení je chyba: token může patřit úplně jiné
> aplikaci. Po výměně si vydej vlastní session id, jak jsi to dělal ve workshopu.

> [!PITFALL]
> **`state` a zpětná adresa se nekontrolují „až potom".** Bez porovnání `state` uloženého
> v session přijme zpětná adresa i návrat, který nikdo z tvé stránky nezačal.

Další věci, na kterých to v praxi padá:

- **`client_secret` v prohlížeči.** Cokoli, co si stáhne klient, není tajné. Výměna kódu
  za tokeny patří na server.
- **Identifikace podle e-mailu bez `email_verified`.** Pak stačí u poskytovatele založit
  účet na cizí e-mail a účet v tvé aplikaci je převzatý.
- **Chybějící obnova u druhého faktoru.** Bez kódů pro obnovu se ze ztraceného telefonu
  stane ztracený účet a z podpory ruční obcházení zabezpečení.
- **Vlastní implementace podpisu JWT.** Ověření podpisu ID tokenu (včetně `iss`, `aud`
  a expirace) dělá knihovna poskytovatele. Ručně psané ověření bývá děravé.

:::check
Kolega uloží `access_token` od Googlu do cookie a na každé routě kontroluje, jestli tam nějaký je. Co je na tom špatně?

### --expected--
Token nedokazuje, že patří téhle aplikaci ani tomuhle uživateli.

### --accept--
Přítomnost tokenu není přihlášení, token může být vydaný jiné aplikaci.
Je to token pro API poskytovatele, ne vlastní session.

### --why--
Access token je klíč k API poskytovatele — kdokoli si ho může nechat vydat pro svoji aplikaci a pak ho poslat sem. Po výměně kódu si vydej **vlastní** session id a chovej se k němu jako ve workshopu.
:::

## Kde to najdeš v MDN

- [Web Authentication API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API) — passkeys v prohlížeči, `create()` a `get()`.
- [CredentialsContainer](https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer) — rozhraní `navigator.credentials`.
- [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) — skládání parametrů adresy bez ručního kódování.
- [SubtleCrypto.digest()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) — otisk, ze kterého vzniká `code_challenge`.
- [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) — atributy cookie, do které session po návratu uložíš.

Specifikace OAuth a OIDC najdeš mimo MDN: *RFC 6749* (OAuth 2.0), *RFC 7636* (PKCE)
a stránky `openid.net`.

# --questions--

## --question--

Aplikace dostane po výměně kódu `access_token` i `id_token`. Který z nich si přečte, aby zjistila, kdo se přihlásil?

### --expected--
id_token

### --accept--
ID token

### --why--
ID token je výpověď o totožnosti pro tvoji aplikaci — obsahuje `sub`, `email` a `email_verified`. Access token je klíč k API poskytovatele; tvoje aplikace ho nečte, jen předává.

### --see--

auth-bezpecnost/auth-v-praxi#oauth-2-0-kdo-za-co-odpovida

## --question--

Kterou hodnotu si aplikace uloží do session **před** přesměrováním k poskytovateli a po návratu ji porovná?

### --expected--
state

### --why--
`state` je náhodná hodnota, která váže návrat na tvoje vlastní zahájení přihlášení. Bez ní by zpětná adresa přijala i požadavek, který přišel odjinud.

### --see--

auth-bezpecnost/auth-v-praxi#authorization-code-s-pkce-krok-za-krokem

## --question--

Proč passkey neprojde na podvodné doméně, která vypadá stejně jako pravá?

### --answer--
Protože podvodná doména nemá platný certifikát.

#### --why--
Certifikát na `suplik-cz.example.com` si útočník pořídí za pár minut zdarma. Rozhoduje něco jiného, co je přímo součástí klíče.

### --correct--
Protože klíč vznikl pro konkrétní doménu a prohlížeč ho jinde nenabídne.

#### --why--
Doména je pevnou součástí přihlašovacího údaje. Proto passkeys ruší phishing, na který heslo ani TOTP nestačí.

### --answer--
Protože podpis platí jen 30 vteřin.

#### --why--
Časové okno má TOTP. U passkey rozhoduje doména, ne čas.

### --see--

auth-bezpecnost/auth-v-praxi#passkeys-a-webauthn

## --question--

**Opakování z dřívějška.** Po návratu od poskytovatele vydáváš vlastní session cookie. Které dva atributy na ní nesmí chybět, aby ji nepřečetl skript na stránce a neposlal ji prohlížeč z cizího webu?

### --expected--
HttpOnly a SameSite

### --accept--
HttpOnly, SameSite
SameSite a HttpOnly

### --why--
`HttpOnly` cookie schová před `document.cookie`, takže ji XSS neukradne. `SameSite` (`Lax` nebo `Strict`) zabrání tomu, aby ji prohlížeč přibalil k požadavku z cizí stránky. Na HTTPS k nim patří ještě `Secure`.

### --see--

auth-bezpecnost/session-a-cookies#atributy-cookie

## --question--

**Opakování z dřívějška.** Aplikace umí přihlášení heslem i přes Google. U hesla se pořád ukládá hash. Proč nestačí `SHA-256`?

### --answer--
Protože `SHA-256` je prolomený a jde z něj heslo spočítat zpátky.

#### --why--
`SHA-256` prolomený není a zpětně se z něj nic nepočítá. Problém je jinde — v rychlosti.

### --correct--
Protože je záměrně rychlý, takže hrubá síla nad uniklou databází je otázka hodin.

#### --why--
Na hesla se používá pomalý hash (`scrypt`, Argon2, bcrypt) se solí. Jedno přihlášení zdrží o desítky milisekund, útok o roky.

### --answer--
Protože `SHA-256` neumí pracovat se solí.

#### --why--
Sůl se dá přimíchat k čemukoli. Sama o sobě ale rychlost nesníží, a právě rychlost je tu problém.

### --see--

auth-bezpecnost/hesla#pomaly-hash-scrypt-a-argon2

## --question--

Proč se authorization code vyměňuje za tokeny druhým voláním ze serveru, a ne rovnou přesměrováním s tokenem v adrese?

### --expected--
Aby se tokeny neobjevily v adrese, v historii ani v logu.

### --accept--
Adresa končí v historii prohlížeče a v logách, token tam nesmí.
Protože URL se loguje a ukládá do historie.

### --why--
Adresa prochází historií prohlížeče, hlavičkou `Referer` i logy proxy a serverů. Krátkodobý kód tam vadí méně než token, a s PKCE je navíc sám o sobě nepoužitelný.

### --see--

auth-bezpecnost/auth-v-praxi#authorization-code-s-pkce-krok-za-krokem

## --question--

Co konkrétně si server uloží do databáze, když si uživatel zaregistruje passkey?

### --expected--
Veřejný klíč

### --accept--
Veřejný klíč a id přihlašovacího údaje.
public key

### --why--
Soukromý klíč zůstává v zařízení nebo v klíčence a server ho nikdy nevidí. Proto únik databáze passkeys útočníkovi nic nedá — z veřejného klíče se přihlásit nedá.

### --see--

auth-bezpecnost/auth-v-praxi#passkeys-a-webauthn
