## Hashování hesla se solí

Nikdy ne text, nikdy ne šifrování, nikdy ne rychlý otisk (`SHA-256`, `MD5`).
Vždy [[pomalý hash]] a k němu [[sůl]] u každého hesla zvlášť:

```js
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function zahashujHeslo(heslo) {
  const sul = randomBytes(16).toString('hex');
  const otisk = scryptSync(heslo, sul, 64).toString('hex');
  return `scrypt:${sul}:${otisk}`;
}

export function hesloSedi(heslo, ulozeny) {
  const [algoritmus, sul, otisk] = String(ulozeny ?? '').split(':');
  if (algoritmus !== 'scrypt' || !sul || !otisk) return false;
  const ocekavany = Buffer.from(otisk, 'hex');
  const spocitany = scryptSync(heslo, sul, ocekavany.length);
  return spocitany.length === ocekavany.length && timingSafeEqual(spocitany, ocekavany);
}
```

| pravidlo | proč |
|---|---|
| délka 8 až 128 znaků, žádná povinná „složitost" | doporučení NIST; horní mez chrání server před hashováním megabajtů |
| stejná odpověď na neznámý e-mail i špatné heslo | jinak jde zjistit, kdo je registrovaný |
| porovnání v [[konstantním čase]] | `===` skončí u prvního rozdílu a čas prozradí, kolik znaků sedělo |
| po změně hesla zrušit ostatní session | jinak útočník zůstane přihlášený |

## Session a cookie

```js
// při přihlášení
const sid = randomBytes(24).toString('base64url');
db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
  .run(sid, uzivatel.id, Date.now() + 24 * 60 * 60 * 1000);
res.writeHead(200, {
  'Set-Cookie': `sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=86400`,
});

// při odhlášení: smazat řádek v databázi A zrušit cookie stejnými atributy
res.writeHead(200, { 'Set-Cookie': 'sid=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0' });
```

| [[atribut cookie]] | co zavírá |
|---|---|
| `HttpOnly` | čtení přes `document.cookie`, tedy krádež pomocí XSS |
| `SameSite=Lax` | odeslání cookie k požadavku z cizí stránky ([[CSRF]]); `Strict` navíc i u příchodu z odkazu |
| `Secure` | posílání po nešifrovaném HTTP |
| `Max-Age` / `Expires` | cookie, která platí navždy |
| `Path`, `Domain` | rozsah, kam prohlížeč cookie posílá |

Session id musí být **náhodné a dlouhé** (nejméně 128 bitů entropie). Čas, pořadí ani
`Math.random()` do něj nepatří. Při přihlášení se vydává **nové** id (proti
[[fixace session|fixaci session]]).

## Tvar tokenu

[[JWT]] má tři části oddělené tečkou, zakódované v base64url. Podepsaný, **ne** zašifrovaný:

```text
eyJhbGciOiJIUzI1NiJ9 . eyJzdWIiOiI0MiIsImV4cCI6MTc5MDAwMDAwMH0 . 3Rk1_qPd8w…
    hlavička                 payload (čitelný!)                    podpis
```

```js
import { createHmac } from 'node:crypto';

const base64url = (data) => Buffer.from(data).toString('base64url');
const telo = `${base64url('{"alg":"HS256"}')}.${base64url(JSON.stringify({ sub: 42 }))}`;
const podpis = createHmac('sha256', process.env.JWT_SECRET).update(telo).digest('base64url');
const token = `${telo}.${podpis}`;
```

| token | kdo ho čte | kde ho potkáš |
|---|---|---|
| session id | jen server (je to klíč do tabulky) | cookie `sid` |
| [[JWT]] | kdokoli (podpis brání jen změně) | `Authorization: Bearer …` |
| [[access token]] | API poskytovatele | po přihlášení přes Google |
| [[ID token]] | tvoje aplikace | OIDC, klíč `sub` |

Do payloadu nikdy nepatří heslo, číslo karty ani nic, co uživatel nemá vidět.
Server podpis **ověřuje vždy** a nikdy nevěří hlavičce `alg` z tokenu.

## Zranitelnosti a jejich obrana

| zranitelnost | jak se pozná | čím se zavírá |
|---|---|---|
| [[SQL injection]] | dotaz vzniká spojováním řetězců | [[parametrizovaný dotaz]]; jméno sloupce jen ze seznamu povolených hodnot |
| [[XSS na serveru]] | vstup jde do HTML bez převodu | escapování podle místa (text, atribut, URL) a [[CSP]] jako druhá pojistka |
| [[CSRF]] | stavová akce jen na základě cookie | `SameSite`, u citlivých akcí token navíc |
| [[IDOR]] | záznam se vydá podle id z adresy | kontrola vlastnictví; na cizí záznam `404` |
| chybějící [[autorizace]] | „je přihlášený, tak to smí" | právo kontrolované na každé routě, na jednom místě |
| role z požadavku | role v cookie, v těle nebo v tokenu klienta | role výhradně z databáze |
| [[otevřené přesměrování]] | `Location` z parametru adresy | jen relativní cesta nebo seznam povolených cílů |
| únik v chybě | `stack` nebo hláška databáze v odpovědi | obecná hláška klientovi, podrobnosti do logu |
| slabý hash hesla | `createHash('sha256')` nad heslem | `scrypt` nebo Argon2 se solí |
| hádání hesel | neomezený počet pokusů | [[rate limit]] na účet i na IP, odpověď `429` |
| velké tělo požadavku | server čte, co mu kdo pošle | strop na bajty, odpověď `413` |
| vyzrazené tajemství | klíč v kódu nebo v historii Gitu | proměnné prostředí, a vyzrazený klíč vyměnit |

## Přihlášení přes cizí účet

```text
1. připrav tajemství   code_verifier + state do session
2. pošli uživatele     /authorize?client_id&redirect_uri&scope&code_challenge&state
3. přijmi návrat       ověř state, vezmi code
4. vyměň kód           POST /token s code a code_verifier, ověř podpis ID tokenu
5. vydej svoji session Set-Cookie: sid=…
```

[[authorization code]] je jednorázový a krátkodobý, [[PKCE]] zaručí, že ho vymění jen ten,
kdo o něj žádal. Uživatele si v databázi drž podle `sub` od [[poskytovatel identity|poskytovatele]],
ne podle e-mailu, a e-mail přebírej jen s `email_verified: true`.

[[passkey|Passkeys]] ([[WebAuthn]]) jdou ještě dál: server si ukládá veřejný klíč, soukromý
zůstane v zařízení a podpis je svázaný s doménou, takže ho nejde phishnout. Dokud je
v aplikaci heslo, patří k němu druhý faktor ([[TOTP]]) a [[kódy pro obnovu]] uložené
hashované.

## Role a oprávnění

```js
const PRAVA_ROLI = {
  ctenar: [],
  redaktor: ['clanek:psat', 'clanek:publikovat'],
  spravce: ['clanek:psat', 'clanek:publikovat', 'clanek:mazat', 'uzivatel:menit-roli'],
};

function vyzadujPravo(uzivatel, pravo, cil) {
  const povoleno = (PRAVA_ROLI[uzivatel.role] ?? []).includes(pravo);
  audit.push({ kdo: uzivatel.email, akce: pravo, cil, povoleno, kdy: new Date().toISOString() });
  if (!povoleno) throw new ChybaApi(403, 'BEZ_OPRAVNENI', 'Na tuhle akci nemáš oprávnění.');
}
```

[[RBAC]] drží pravidla na jednom místě, takže nová role je jedna změna. Nová role začíná
prázdná ([[princip nejmenších oprávnění]]) a každé rozhodnutí, povolené i zamítnuté, se
zapíše do [[audit log|auditu]].

`401` = nevím, kdo jsi. `403` = vím, kdo jsi, a tohle nesmíš. Kdo právo nemá, dostane
`403` i u neexistujícího záznamu — jinak jde podle odpovědí zjišťovat, co v databázi je.

## Kontrolní seznam před nasazením

- Hesla přes pomalý hash se solí; nikde v logu, v odpovědi ani v Gitu.
- Session id náhodné, nové při přihlášení, zrušené při odhlášení i při změně hesla.
- Cookie má `HttpOnly`, `SameSite`, `Secure` a omezenou platnost.
- Každý dotaz do databáze je parametrizovaný; řazení a filtry jen ze seznamu povolených hodnot.
- Každá hodnota od uživatele se při vkládání do HTML escapuje; stránka má `Content-Security-Policy`.
- Každá routa odpovídá na dvě otázky zvlášť: kdo jsi (`401`) a smíš to (`403`).
- Žádné rozhodnutí o právech nestojí na hodnotě z těla požadavku, z adresy ani z cookie.
- Přihlašování a registrace mají strop na počet pokusů, tělo požadavku strop na velikost.
- Chyba klientovi je obecná, podrobnosti jdou do logu; v logu není heslo ani token.
- Tajemství se čtou z prostředí, `npm audit` je zelený a závislosti aktuální.
- HTTPS všude, přesměrování z HTTP, hlavičky `X-Content-Type-Options` a `Referrer-Policy`.
