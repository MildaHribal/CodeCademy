---
pass: 0.8
---

# --questions--

## --question--

Doplň chybějící pojem: ke každému heslu se před hashováním přimíchá náhodná ______, takže dva uživatelé se stejným heslem mají různý otisk.

### --expected-- ignore-case

sůl

### --accept--

sul
sůl (salt)
salt

### --why--

Sůl je náhodný řetězec u každého hesla zvlášť. Ukládá se vedle otisku a tajná být nemusí — brání předpočítaným tabulkám otisků, ne čtení databáze.

### --see--

auth-bezpecnost/hesla#sul-stejna-hesla-ruzne-hashe

## --question--

Proč se hashe hesel porovnávají funkcí pro porovnání v konstantním čase, a ne operátorem `===`?

### --answer--

Protože `===` u bufferů porovnává odkazy, ne obsah.

#### --why--

To je pravda o bufferech, ale ne důvod, proč je potřeba **konstantní čas**. Stejný problém by zůstal i u porovnání dvou řetězců, kde `===` obsah porovnává.

### --correct--

Protože `===` skončí u prvního rozdílu, a doba porovnání tak prozradí, kolik znaků sedělo.

#### --why--

Z těch rozdílů v čase jde hodnotu uhodnout znak po znaku. `timingSafeEqual` projde vždy celou délku.

### --answer--

Protože `===` u dlouhých řetězců přeteče a začne vracet nesmysly.

#### --why--

Nic takového se neděje, porovnání řetězců v JavaScriptu žádnou délkovou mez nemá.

### --see--

auth-bezpecnost/hesla#porovnani-hesla-timingsafeequal

## --question--

Který atribut cookie zařídí, že ji nepřečte skript na stránce přes `document.cookie`?

### --expected--

HttpOnly

### --accept--

Http-Only
httponly

### --why--

`HttpOnly` je hlavní obrana session cookie proti XSS: skript na ni nedosáhne, prohlížeč ji přesto k požadavkům přibalí. Proti odeslání z cizí stránky je `SameSite` a proti posílání po HTTP `Secure`.

### --see--

auth-bezpecnost/session-a-cookies#atributy-cookie

## --question--

Přihlášený uživatel se pokusí smazat cizí záznam, na což nemá oprávnění. Jaký stavový kód mu API vrátí?

### --expected--

403

### --why--

`401` znamená „nevím, kdo jsi" — tam patří chybějící nebo neplatné přihlášení. `403` znamená „vím, kdo jsi, a tohle nesmíš". Když se ty dva pletou, klient neví, jestli se má znovu přihlásit.

### --see--

auth-bezpecnost/session-a-cookies#autentizace-a-autorizace

## --question--

Co server se session v databázi umí a s JWT bez dalšího úložiště ne?

### --expected--

Zneplatnit ji dřív, než vyprší.

### --accept--

Okamžitě ji zrušit.
Odhlásit uživatele okamžitě.
Zrušit přihlášení před vypršením platnosti.

### --why--

Session je řádek v databázi — smazáním okamžitě přestane platit. Podepsaný token si nese platnost v sobě a server ho bez seznamu zneplatněných tokenů nemá jak stáhnout z oběhu. Proto mívá JWT krátkou platnost a k němu refresh token.

### --see--

auth-bezpecnost/session-a-cookies#session-nebo-jwt

## --question--

Co dostane aplikace od poskytovatele hned po tom, co se uživatel přihlásí a vrátí se na zpětnou adresu?

### --answer--

Access token, kterým rovnou volá API poskytovatele.

#### --why--

Token v adrese přesměrování by skončil v historii prohlížeče a v logu. Proto se dnes používá tok, kde adresou přijde něco jiného a krátkodobějšího.

### --correct--

Krátkodobý authorization code, který se teprve vymění za tokeny.

#### --why--

Výměna jde ze serveru na server, a s PKCE navíc jen tomu, kdo zná původní code verifier.

### --answer--

Heslo uživatele, aby si ho aplikace mohla ověřit sama.

#### --why--

Heslo je celou dobu jen u poskytovatele — to je hlavní důvod, proč se přihlášení přes cizí účet používá.

### --see--

auth-bezpecnost/auth-v-praxi#authorization-code-s-pkce-krok-za-krokem

## --question--

Aplikace dostane z OIDC dva tokeny. Který z nich si sama přečte, aby zjistila, kdo se přihlásil?

### --expected--

ID token

### --accept--

id_token
ID tokenu

### --why--

ID token je podepsaná výpověď o totožnosti — obsahuje `sub`, `email` a `email_verified`. Access token je klíč k API poskytovatele; tvoje aplikace ho jen předává dál.

### --see--

auth-bezpecnost/auth-v-praxi#oauth-2-0-kdo-za-co-odpovida

## --question--

Kolega chce zavřít SQL injection tím, že ze vstupu vymaže apostrofy. Co mu na to řekneš?

### --answer--

Stačí to, bez apostrofu řetězec v SQL ukončit nejde.

#### --why--

U čísel v dotazu (`WHERE id = ${id}`) žádný apostrof není a `1 OR 1=1` projde i tak. Navíc by se rozbila jména jako `O'Brien`.

### --correct--

Vstup zůstává součástí textu dotazu — opraví to až parametrizovaný dotaz, kde jdou hodnoty zvlášť.

#### --why--

Čištění znaků je závod s útočníkem. Parametr z principu nemůže změnit příkaz, protože databáze dotaz přeloží dřív, než hodnoty zná.

### --answer--

Je to správně, ale musí to udělat na frontendu, aby server nic nekontroloval.

#### --why--

Kontrola na frontendu je pohodlí pro uživatele. Požadavek jde poslat i z terminálu, takže pravidla platí, jen když je vynutí server.

### --see--

auth-bezpecnost/owasp-zranitelnosti#sql-injection

## --question--

Routa `GET /api/faktury/:id` vydá fakturu každému přihlášenému uživateli podle id z adresy. Jak se téhle chybě říká?

### --expected-- ignore-case

IDOR

### --accept--

insecure direct object reference
IDOR (insecure direct object reference)

### --why--

Id z adresy je jen přání, ne důkaz. Server musí ověřit, že záznam patří přihlášenému uživateli — a na cizí záznam je lepší odpovědět `404`, aby se z odpovědí nedalo zjišťovat, která id existují.

### --see--

auth-bezpecnost/owasp-zranitelnosti#idor-cizi-zaznam-podle-id

## --question--

Proč atribut `SameSite=Lax` na session cookie brání CSRF?

### --answer--

Protože cookie zašifruje, takže cizí stránka nepozná, co je uvnitř.

#### --why--

`SameSite` nic nešifruje — cookie zůstává obyčejným textem. Jde o to, **kdy** ji prohlížeč přibalí.

### --correct--

Protože ji prohlížeč nepřibalí k požadavku, který vyvolala cizí stránka.

#### --why--

Útok stojí na tom, že prohlížeč cookie přidá sám. `Lax` ji pošle u běžné navigace z odkazu, ale ne u `POST` z cizího webu.

### --answer--

Protože zabrání tomu, aby cizí stránka odeslala požadavek na tvůj server.

#### --why--

Požadavek odejde pořád — jen dorazí bez přihlašovací cookie, takže se tváří jako od nepřihlášeného.

### --see--

auth-bezpecnost/owasp-zranitelnosti#csrf-pozadavek-z-cizi-stranky

## --question--

Uživatel má zaregistrovaný passkey na `banka.cz`. Podvodný e-mail ho zavede na `banka-cz.example.com`, která vypadá stejně. Co se stane?

### --answer--

Přihlásí se a útočník získá jeho podpis, kterým se pak přihlásí sám.

#### --why--

Tohle platí u hesla nebo u opsaného jednorázového kódu. Passkey ale není údaj, který by šlo přepsat na jinou stránku.

### --correct--

Prohlížeč na té doméně žádný passkey nenabídne, protože klíč patří k `banka.cz`.

#### --why--

Doména je pevnou součástí klíče. Proto passkeys ruší celou kategorii phishingu, na kterou heslo ani TOTP nestačí.

### --answer--

Podpis vznikne, ale server ho odmítne kvůli vypršené platnosti.

#### --why--

Časové okno má TOTP. U passkey rozhoduje doména, ne čas.

### --see--

auth-bezpecnost/auth-v-praxi#passkeys-a-webauthn

## --question--

Aplikace hashuje hesla pomalým hashem se solí. Přesto se útočníkovi během noci podaří uhodnout heslo jednoho účtu. Co v obraně chybělo?

### --expected-- ignore-case

rate limit

### --accept--

omezení počtu pokusů
rate limiting
omezení počtu přihlášení

### --why--

Pomalý hash chrání **uniklou databázi**, ne přihlašovací formulář. Když útočník smí zkoušet tisíckrát za minutu, běžné heslo najde. Proti tomu je strop na počet neúspěšných pokusů a odpověď `429`.

### --see--

auth-bezpecnost/owasp-zranitelnosti#omezeni-zneuziti-rate-limit-velikost-a-hlavicky

## --question--

**Opakování z dřívějška.** Požadavek `POST /api/clanky` úspěšně vytvoří nový článek. Jaký stavový kód patří odpovědi?

### --expected--

201

### --why--

`201 Created` říká, že vznikl nový zdroj; do hlavičky `Location` patří jeho adresa. `200` se hodí, když se nic nezakládá, a `204` když se nevrací žádné tělo.

### --see--

api-http-rest/http-do-hloubky#stavove-kody-po-skupinach

## --question--

**Opakování z dřívějška.** Registrace zapisuje do dvou tabulek naráz a obě změny musí projít, nebo žádná. Který nástroj databáze na to použiješ?

### --expected-- ignore-case

transakci

### --accept--

transakce
transakci (BEGIN, COMMIT, ROLLBACK)
BEGIN a COMMIT

### --why--

Transakce je skupina změn, která se buď provede celá, nebo se vrátí zpět. Bez ní vznikne účet bez profilu (nebo naopak), a takový stav se pak hledá těžko.

### --see--

sql-databaze/transakce-a-indexy#transakce-begin-commit-a-rollback

## --question--

Vývojář má přihlašovací údaje k databázi napsané přímo v `server.js`, protože „repozitář je stejně soukromý". Co je na tom nejhorší?

### --answer--

Že se kvůli změně hesla musí nasazovat nová verze aplikace.

#### --why--

To je nepohodlí, ale opravitelné. Je tu něco, co se opravit nedá.

### --correct--

Že tajemství zůstane v historii Gitu, i kdyby ho zítra z kódu smazal.

#### --why--

Commit je navždy. Proto se tajemství čtou z prostředí a hodnota, která se do repozitáře dostane, se musí považovat za vyzrazenou a změnit.

### --answer--

Že se takový kód nedá spustit na jiném počítači.

#### --why--

Spustit se dá bez problémů — to je vlastně součást problému, protože se stejné heslo používá všude.

### --see--

node-zaklady/co-je-node#process-program-a-svet-kolem-nej

## --question--

**Opakování z dřívějška.** Proč má API vracet chyby pořád ve stejném tvaru, například `{ "error": { "code": "…", "message": "…" } }`?

### --expected--

Aby je klient uměl zpracovat jedním kusem kódu.

### --accept--

Aby se na ně klient mohl spolehnout a nemusel je rozpoznávat podle textu.
Aby klient nemusel číst hlášku a mohl reagovat podle kódu.

### --why--

Kód chyby je pro program, `message` pro člověka. Když se tvar mění routu od routy, klient si na každou píše vlastní větev — a obvykle skončí u rozhodování podle českého textu, který se kdykoli změní.

### --see--

api-http-rest/navrh-rest#jednotny-tvar-chyb-problem-json

# --code-- Převzatý modul: objednávky v e-shopu Ptáček

## --file-- objednavky.js

```js
// Objednávky pro e-shop Ptáček. Psáno narychlo před spuštěním,
// později se to mělo přepsat. Nepřepsalo.
import express from 'express';
import { createHash, randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('objednavky.db');
const app = express();
app.use(express.json());

const prihlaseni = new Map(); // token -> id zákazníka

function otisk(heslo) {
  return createHash('sha256').update(heslo).digest('hex');
}

function zakaznik(req) {
  const token = (req.headers.cookie || '').split('token=')[1];
  if (!token) return null;
  const id = prihlaseni.get(token.split(';')[0]);
  return id ? db.prepare('SELECT * FROM zakaznici WHERE id = ?').get(id) : null;
}

app.post('/api/prihlaseni', (req, res) => {
  const { email, heslo } = req.body;
  const ucet = db.prepare('SELECT * FROM zakaznici WHERE email = ?').get(email);
  if (!ucet) {
    return res.status(404).json({ chyba: 'Takový e-mail u nás nemáme.' });
  }
  if (ucet.otisk_hesla !== otisk(heslo)) {
    return res.status(401).json({ chyba: 'Špatné heslo.' });
  }
  const token = randomBytes(32).toString('hex');
  prihlaseni.set(token, ucet.id);
  res.setHeader('Set-Cookie', `token=${token}; Path=/`);
  res.json({ email: ucet.email, jmeno: ucet.jmeno });
});

app.get('/api/objednavky', (req, res) => {
  const kdo = zakaznik(req);
  if (!kdo) return res.status(401).json({ chyba: 'Přihlas se.' });
  const radky = db
    .prepare('SELECT * FROM objednavky WHERE zakaznik_id = ? ORDER BY vytvoreno DESC')
    .all(kdo.id);
  res.json(radky);
});

function najdiObjednavky(dotaz) {
  const sql = `SELECT * FROM objednavky WHERE popis LIKE '%${dotaz}%' ORDER BY vytvoreno DESC`;
  return db.prepare(sql).all();
}

app.get('/api/objednavky/hledat', (req, res) => {
  const kdo = zakaznik(req);
  if (!kdo) return res.status(401).json({ chyba: 'Přihlas se.' });
  res.json(najdiObjednavky(req.query.q || ''));
});

app.get('/api/objednavky/:id', (req, res) => {
  const kdo = zakaznik(req);
  if (!kdo) return res.status(401).json({ chyba: 'Přihlas se.' });
  const objednavka = db.prepare('SELECT * FROM objednavky WHERE id = ?').get(Number(req.params.id));
  if (!objednavka) return res.status(404).json({ chyba: 'Nenalezeno.' });
  res.json(objednavka);
});

app.post('/api/objednavky/:id/zrusit', (req, res) => {
  const kdo = zakaznik(req);
  if (!kdo) return res.status(401).json({ chyba: 'Přihlas se.' });
  db.prepare("UPDATE objednavky SET stav = 'zruseno' WHERE id = ?").run(Number(req.params.id));
  res.json({ zruseno: Number(req.params.id) });
});

app.use((chyba, req, res, next) => {
  console.log('Chyba:', chyba.message);
  res.status(500).json({ chyba: chyba.message, detail: chyba.stack });
});

app.listen(process.env.PORT || 3000);
```

## --question--

Ve které funkci v `objednavky.js` vzniká SQL injection?

### --expected--

najdiObjednavky

### --accept--

najdiObjednavky()
ve funkci najdiObjednavky

### --why--

Jako jediná skládá dotaz z řetězce: hledaný text se stane součástí příkazu. Všechny ostatní dotazy v souboru používají otazník a hodnotu předávají zvlášť, takže z nich SQL vzniknout nemůže.

### --see--

auth-bezpecnost/owasp-zranitelnosti#sql-injection

## --question--

Routa `POST /api/objednavky/:id/zrusit` kontroluje, že je někdo přihlášený. Co jí chybí?

### --answer--

Chybí kontrola, jestli objednávka existuje — jinak spadne.

#### --why--

`UPDATE` nad neexistujícím id nic neudělá a nespadne. Chybí tu něco, co má následky pro cizí zákazníky.

### --correct--

Chybí kontrola, že objednávka patří přihlášenému zákazníkovi.

#### --why--

Klasický IDOR: kdokoli přihlášený zruší libovolnou objednávku v e-shopu, stačí zvýšit číslo v adrese. Routa `GET /api/objednavky/:id` má přesně stejnou díru.

### --answer--

Chybí kontrola metody — mělo by to být `DELETE`, ne `POST`.

#### --why--

Volba metody je otázka návrhu API, ne bezpečnosti. Zrušení objednávky navíc často není smazání záznamu.

### --see--

auth-bezpecnost/owasp-zranitelnosti#idor-cizi-zaznam-podle-id

## --question--

Jaký atribut chybí session cookie, kterou nastavuje routa `POST /api/prihlaseni`, aby ji nepřečetl skript na stránce?

### --expected--

HttpOnly

### --accept--

httponly
HttpOnly (a k tomu SameSite a Secure)

### --why--

Cookie má jen `Path=/`. Chybí `HttpOnly` (proti čtení skriptem), `SameSite` (proti odeslání z cizí stránky), `Secure` (proti posílání po HTTP) i omezená platnost.

### --see--

auth-bezpecnost/session-a-cookies#atributy-cookie

## --question--

Poslední blok souboru zpracovává neošetřené chyby. Co je na něm špatně?

### --answer--

Vrací `500` i u chyb, které způsobil klient.

#### --why--

To je nepřesné, ale samo o sobě neškodné. Vadí něco v těle té odpovědi.

### --correct--

Posílá klientovi hlášku chyby i výpis zásobníku.

#### --why--

Z výpisu se útočník dozví jména tabulek a sloupců, cesty na serveru a použité knihovny. Podrobnosti patří do logu, klientovi stačí obecná hláška.

### --answer--

Loguje chybu přes `console.log` místo `console.error`.

#### --why--

Zaslouží si to opravu kvůli oddělení výstupů, ale útočníkovi to nic nedá. Problém je v tom, co odchází klientovi.

### --see--

auth-bezpecnost/owasp-zranitelnosti#unik-tajemstvi-a-chybovych-hlasek
