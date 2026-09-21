## --card-- free

Jaký je rozdíl mezi chováním aplikace ve vývojovém a v produkčním režimu?

### --back--

Ve vývojovém (dev) prostředí aplikace vypisuje detailní chybové hlášky, má jednodušší logy a automaticky se restartuje (nodemon). Produkční aplikace (nastavená často pomocí `NODE_ENV=production`) skrývá detaily chyb před klientem, aby neodhalila zranitelnosti, a zapisuje [[strukturované logy]] jako JSON. Měla by být chráněna omezováním četnosti (rate limiting) a připravena běžet neustále s řízeným ukončováním ([[graceful shutdown]]).

### --see--

nasazeni-provoz/produkcni-rezim#vyvoj-a-produkce-co-se-zmeni

## --card-- free

Co znamená graceful shutdown u webového serveru a jak reaguje na signál `SIGTERM`?

### --back--

[[Graceful shutdown]] (řízené ukončení) znamená, že po požadavku na zastavení (signál `SIGTERM` od systému) server ihned přestane přijímat nové požadavky. Následně však počká, než se vyřídí všechny rozpracované požadavky. Teprve po jejich vyřízení odpojí spojení od databáze a bezpečně ukončí proces, takže uživatelé neztratí data.

### --see--

nasazeni-provoz/produkcni-rezim#sigterm-korektni-ukonceni

## --card-- free

Proč nemají být [[tajemství]] (hesla, tokeny) uložená v gitu a kam s nimi?

### --back--

Když jsou tajemství v kódu, kdokoli, kdo má přístup k repositáři nebo historii gitu, je uvidí a může je zneužít. Navíc se konfigurace (např. heslo k lokální a k produkční databázi) mění a kód má zůstat stejný. [[Tajemství]] se proto předávají pomocí [[proměnná prostředí|proměnných prostředí]] zvenčí, nebo v lokálním vývoji pomocí souboru `.env`, který se nikdy nepřidává do gitu (je v `.gitignore`).

### --see--

nasazeni-provoz/produkcni-rezim#env-a-tajemstvi

## --card-- free

Co je Dockerfile, image (obraz) a co je to [[kontejner]]?

### --back--

[[Dockerfile]] je kuchařka s instrukcemi, podle kterých vzniká obraz. Obraz (image) je hotový balíček (např. pro Node.js aplikaci obsahuje operační systém, kód, instalované npm balíčky), který je neměnný. Když obraz spustíme, vytvoříme [[kontejner]]. Kontejner je běžící instance tohoto obrazu s izolovaným vlastním prostředím. Jeden obraz lze spustit ve více kontejnerech.

### --see--

nasazeni-provoz/kontejnery-a-servery#image-a-kontejner

## --card-- free

K čemu se používá `docker compose` a jak souvisí s `Dockerfile`?

### --back--

`Dockerfile` definuje, jak sestavit jeden konkrétní obraz. Typická webová aplikace však potřebuje více služeb (např. aplikaci a navíc databázi). Nástroj [[docker compose]] umožňuje popsat tuto sestavu ve formátu YAML a zapnout nebo vypnout vše najednou pomocí jednoho příkazu (např. `docker compose up`).

### --see--

nasazeni-provoz/kontejnery-a-servery#compose-yaml-aplikace-a-databaze

## --card-- free

Co je to CI/CD? Jaký je obvykle první krok v pipeline na GitHubu?

### --back--

[[CI/CD]] znamená Continuous Integration a Continuous Deployment. Jde o sadu automatizovaných úloh po pushnutí kódu. Typicky se nejdřív nastartuje prostředí a nainstalují závislosti. Pak začne CI část (integrita kódu): kontrola lintování (Prettier, ESLint), kontrola typů (TypeScript) a běh testů. Pokud toto vše projde bez chyby, pokračuje CD: aplikace se sestaví (např. do Docker obrazu) a nasadí do produkce, buď automaticky nebo po schválení.

### --see--

nasazeni-provoz/ci-cd#co-je-ci-a-cd

## --card-- free

Co znamená, že nasazujeme s "dvoufázovou změnou databáze" (two-phase rollout)?

### --back--

Při produkčním nasazování aplikace nemůže vypnout přístup na několik minut a měnit strukturu tabulek. Navíc může část instancí běžet chvíli na starém a část na novém kódu. Dvoufázové nasazení znamená, že se změna schématu rozdělí: např. nejdřív se přidá nový sloupec (nový kód začne zapisovat do starého i nového, starý kód jede normálně) a až po čase, v dalším kroku nasazení, se po naplnění dat starý sloupec či kód odstraní.

### --see--

nasazeni-provoz/ci-cd#dvoufazova-zmena-schematu

## --card-- output

Konfigurace přišla z prostředí. Co vypíše tenhle kód?

```js
const env = { MAX_UPLOAD_MB: '25', CACHE: '0' };
console.log(env.MAX_UPLOAD_MB * 2);
console.log(env.MAX_UPLOAD_MB + 2);
console.log(Boolean(env.CACHE));
```

### --expected--

50
252
true

### --why--

Proměnné prostředí jsou **vždy řetězce**. `*` si řetězec převede na číslo, `+` ho spojí
a `'0'` je neprázdný řetězec, tedy pravdivá hodnota. Proto se všechny hodnoty převádějí
na jednom místě při startu: `Number(env.MAX_UPLOAD_MB)`, `env.CACHE === 'true'`.

### --see--

nasazeni-provoz/produkcni-rezim#konfigurace-z-prostredi

## --card-- output

Loggeru se předala výjimka. Co se dostane do logu?

```js
const error = new TypeError('Neplatný formát data');
console.log(JSON.stringify({ level: 'error', msg: 'Import selhal', error }));
console.log(JSON.stringify({ level: 'error', msg: 'Import selhal', error: error.message }));
```

### --expected--

{"level":"error","msg":"Import selhal","error":{}}
{"level":"error","msg":"Import selhal","error":"Neplatný formát data"}

### --why--

`message` ani `stack` nejsou u objektu `Error` vyčíslitelné vlastnosti, takže je
`JSON.stringify` vynechá a v logu zbyde prázdný objekt. Do pole se proto předává
`error.stack` nebo `error.message` jako řetězec.

### --see--

nasazeni-provoz/logovani-a-chyby#strukturovane-logy

## --card-- output

Logger přepisuje citlivé klíče. Co vypíše tenhle kód?

```js
const SECRET_KEYS = ['password', 'token', 'authorization', 'cookie'];

function skryj(data) {
  return Object.fromEntries(
    Object.entries(data).map(([klic, hodnota]) => [klic, SECRET_KEYS.includes(klic) ? '[SKRYTO]' : hodnota]),
  );
}

console.log(JSON.stringify(skryj({ userId: 42, password: 'Jaro2026!', path: '/login' })));
```

### --expected--

{"userId":42,"password":"[SKRYTO]","path":"/login"}

### --why--

Nejspolehlivější obrana je zákaz v loggeru, ne kázeň na každém volání: hodnota se
přepíše, ať logger zavolá kdokoli. Logy čte víc lidí a nástrojů a drží se měsíce.

### --see--

nasazeni-provoz/logovani-a-chyby#co-do-logu-nepatri

## --card-- code js

Uprav `loadConfig` tak, aby vracela port jako **číslo** (výchozí 3000) a v produkci
bez `DATABASE_URL` hned spadla s hláškou, ve které je jméno chybějící proměnné.

### --seed--

```js
function loadConfig(env) {
  return {
    port: env.PORT || 3000,
    databaseUrl: env.DATABASE_URL,
  };
}
```

### --test--

```js
const config = loadConfig({ PORT: '8080', DATABASE_URL: 'postgres://localhost:5432/pujcovna' });
assert.equal(typeof config.port, 'number', "loadConfig má vrátit port jako číslo, ne jako řetězec '8080'");
assert.equal(config.port, 8080, "loadConfig({ PORT: '8080' }) má mít port 8080");
assert.equal(loadConfig({}).port, 3000, 'Bez proměnné PORT má být port 3000');
assert.throws(
  () => loadConfig({ NODE_ENV: 'production' }),
  /DATABASE_URL/,
  'V produkci bez DATABASE_URL má loadConfig spadnout už při startu, a to hláškou se jménem chybějící proměnné',
);
```

### --solution--

```js
function loadConfig(env) {
  if (env.NODE_ENV === 'production' && !env.DATABASE_URL) {
    throw new Error('Chybí proměnná prostředí DATABASE_URL.');
  }
  return {
    port: Number(env.PORT ?? 3000),
    databaseUrl: env.DATABASE_URL ?? 'postgres://localhost:5432/pujcovna_dev',
  };
}
```

### --why--

Převod na typ se dělá jednou, na jednom místě. Chybějící povinná hodnota shodí aplikaci
hned při startu, takže nasazení selže a stará verze běží dál — místo aby aplikace spadla
za tři hodiny na prvním požadavku, který databázi potřeboval.

### --see--

nasazeni-provoz/produkcni-rezim#konfigurace-z-prostredi

## --card-- code js

Přepiš `formatLine` tak, aby vrátila **jeden řádek JSON**: stálou zprávu v poli `msg`,
úroveň v poli `level` a všechna ostatní data jako samostatná pole.

### --seed--

```js
function formatLine(level, msg, fields = {}) {
  return `${level}: ${msg} ${JSON.stringify(fields)}`;
}
```

### --test--

```js
const radek = formatLine('info', 'Objednávka uložena', { orderId: 5812, durationMs: 312 });
assert.equal(typeof radek, 'string', 'formatLine má vrátit jeden řádek jako text');
assert.ok(!radek.includes('\n'), 'Jedna událost je jeden řádek — formatLine nesmí vracet víc řádků');

let zaznam = null;
try {
  zaznam = JSON.parse(radek);
} catch {
  zaznam = null;
}
assert.ok(zaznam, 'Řádek má být platný JSON, aby ho nástroj na logy rozparsoval na pole');
assert.equal(zaznam.level, 'info', "formatLine('info', …) má mít úroveň v poli level");
assert.equal(zaznam.msg, 'Objednávka uložena', 'msg má zůstat stálý text, bez vložených hodnot');
assert.equal(zaznam.orderId, 5812, 'Hodnoty z fields patří do vlastních polí, ne do textu zprávy');
assert.equal(zaznam.durationMs, 312, 'V řádku mají skončit všechna pole z fields');
```

### --solution--

```js
function formatLine(level, msg, fields = {}) {
  return JSON.stringify({ time: new Date().toISOString(), level, msg, ...fields });
}
```

### --why--

Podle stálého textu v `msg` se dá spočítat, kolikrát událost nastala; podle pole
`orderId` se najde ta jedna konkrétní. Zpráva s vloženým id je pokaždé jiná, takže
nejde ani seskupit, ani filtrovat.

### --see--

nasazeni-provoz/logovani-a-chyby#strukturovane-logy

## --card-- free

Proč se konfigurace čte na jednom místě při startu a co znamená [[rychlé selhání]]?

### --back--

Funkce typu `loadConfig(process.env)` dá na jedno místo seznam toho, co aplikace
potřebuje, udělá převod na správný typ jednou a jde otestovat s obyčejným objektem.
Hlavní zisk je ale rychlé selhání: když chybí povinná hodnota, aplikace spadne hned při
startu s jasnou hláškou. Health check neprojde, nasazení se zastaví a stará verze běží
dál — místo aby se chyba ukázala za tři hodiny prvnímu zákazníkovi, který sáhl na
databázi. `process.env` rozházené po třiceti souborech tohle neumí ani jedno.

### --see--

nasazeni-provoz/produkcni-rezim#konfigurace-z-prostredi

## --card-- free

Co má a co nemá ověřovat [[health check]] a kdo se ho ptá?

### --back--

Ptá se ho správce procesů (Docker kontejner, který opakovaně neodpovídá, restartuje),
nasazovací postup (nová verze dostane provoz, až když sonda projde) a monitoring zvenku.
Má ověřovat to, co je v moci aplikace: že proces žije a že se dostane k vlastní databázi
(`SELECT 1`). Nemá volat cizí API — výpadek platební brány by pak restartoval úplně
zdravé kontejnery a shodil i části webu, které bránu nepotřebují. `200` vrácené natvrdo
zase prozradí jen to, že proces běží. Odpověď nesmí nést verze knihoven, adresu databáze
ani text chyby; adresa bývá veřejná.

### --see--

nasazeni-provoz/produkcni-rezim#health-check

## --card-- free

V jakém pořadí se při `SIGTERM` zavírá server a databáze a proč zrovna takhle?

### --back--

Nejdřív `server.close()`, který přestane přijímat nová spojení, ale rozpracované
požadavky nechá doběhnout. Databáze se zavírá **až v jeho callbacku**, protože ten se
zavolá, když skončí poslední spojení. Kdyby se zavřela hned za `server.close()`,
rozpracovaný požadavek by sáhl na zavřené spojení a klient by místo odpovědi dostal
chybu. Nakonec `process.exit(0)` — nula znamená „skončil jsem v pořádku".

### --see--

nasazeni-provoz/produkcni-rezim#sigterm-korektni-ukonceni

## --card-- free

Proces po `SIGTERM` „visí" a správce ho po deseti sekundách zabije, i když má obsluhu
napsanou. Čím to nejspíš je?

### --back--

Keep-alive spojením. Prohlížeč i `fetch` nechávají spojení po odpovědi otevřené pro
další požadavek a `server.close()` čeká, až se zavře poslední. Nečinná spojení Node při
volání `close` zavře, ale to, které se uvolní až po odpovědi rozpracovaného požadavku,
zůstane viset po dobu `keepAliveTimeout`. Oprava: během ukončování posílat odpovědi
s hlavičkou `Connection: close` a k tomu časovač, který proces po limitu ukončí sám
s kódem `1`. Druhá častá příčina je spouštění přes `npm start` nebo `CMD` bez hranatých
závorek — signál pak dostane npm nebo shell, ne Node.

### --see--

nasazeni-provoz/produkcni-rezim#typicke-chyby-a-pasti
nasazeni-provoz/kontejnery-a-servery#dockerfile-pro-node

## --card-- free

K čemu je [[request id]] a proč se vrací i klientovi?

### --back--

Jeden požadavek zanechá v logu víc řádků a mezi nimi leží řádky stovek souběžných
požadavků. Request id je náhodný identifikátor přidělený na začátku a zapsaný do
**každého** řádku, který k požadavku patří; podle něj se z tisíců řádků vytáhne přesně
ta jedna stížnost. Přebírá se z hlavičky `X-Request-Id`, aby ho proxy i tvoje služby
měly stejné. Klientovi se vrací proto, že podpora ani uživatel do logů nevidí: chybová
stránka ukáže „Kód chyby: a3f1c9e2" a podle něj se požadavek najde. Ven jde jen id,
nikdy text výjimky ani stack trace.

### --see--

nasazeni-provoz/logovani-a-chyby#request-id

## --card-- free

Uživatel odešle formulář s neplatným e-mailem a server odpoví `400`. Jakou [[úroveň logu]]
ten řádek dostane a proč na tom záleží?

### --back--

`info` — nebo klidně žádný zvláštní řádek, stačí běžný log požadavku se stavem 400.
Neplatný vstup je běžný provoz a aplikace se zachovala správně. `error` patří tomu, co
selhalo na straně aplikace, tedy typicky odpovědím 5xx. Záleží na tom proto, že hlavní
smysl úrovní je upozornění: když aplikace loguje jako `error` i překlep uživatele, zpráva
chodí pořád, tým ji přestane číst a skutečný výpadek přehlédne.

### --see--

nasazeni-provoz/logovani-a-chyby#urovne-logu

## --card-- free

Co do logu nikdy nepatří a jak se to hlídá?

### --back--

Hesla a tajemství (hlavička `Authorization`, cookie se session, API klíče, tokeny pro
obnovu hesla), tokeny v adrese (loguj `pathname`, ne celé `req.url`), celá těla
požadavků (registrace nese heslo, platba číslo karty) a osobní údaje navíc — místo
e-mailu stačí `userId`, protože GDPR se vztahuje i na logy. Logy čte víc lidí a nástrojů
než databázi a drží se měsíce. Nejspolehlivější obrana je seznam zakázaných klíčů přímo
v loggeru, který je přepíše na `[SKRYTO]`, ať ho zavolá kdokoli.

### --see--

nasazeni-provoz/logovani-a-chyby#co-do-logu-nepatri

## --card-- free

Proč se v Dockerfile kopíruje `package.json` se zámkem zvlášť, **před** `COPY . .`?

### --back--

Každý řádek Dockerfile je vrstva a Docker si výsledek pamatuje. Změna ve vrstvě
zneplatní všechny vrstvy za ní. Když se nejdřív zkopíruje jen `package.json`
a `package-lock.json` a hned se pustí `npm ci`, zůstane vrstva s `node_modules`
použitelná při každé změně kódu a build trvá sekundy místo minut. S `COPY . .` před
instalací se závislosti stahují znovu při úpravě jediného řádku. Instaluje se přes
`npm ci`, ne `npm install`: nainstaluje přesně verze ze zámku a při nesouladu skončí
chybou.

### --see--

nasazeni-provoz/kontejnery-a-servery#dockerfile-pro-node

## --card-- free

Co je [[vícefázový build]] a jaká chyba se u něj objeví až za běhu?

### --back--

Dockerfile má víc sekcí `FROM`: první (pojmenovaná přes `AS build`) nainstaluje všechny
závislosti a sestaví aplikaci, poslední si přes `COPY --from=build` vezme jen výsledek
a doinstaluje produkční závislosti. Výsledný image vznikne jen z poslední fáze, takže
v něm nejsou zdrojáky, kompilátor ani vývojové balíčky — je menší a útočník v něm najde
míň nástrojů. Typická chyba: balíček, který aplikace potřebuje **za běhu**, je omylem
v `devDependencies`. Build projde, ale kontejner spadne na
`Cannot find package '…'`, protože `npm ci --omit=dev` ho do výsledné fáze nedal.

### --see--

nasazeni-provoz/kontejnery-a-servery#vicefazovy-build

## --card-- free

K čemu je `.dockerignore` a proč nepomůže přidat za `COPY . .` řádek `RUN rm .env`?

### --back--

`COPY . .` vezme do image všechno ze složky projektu. `.dockerignore` z toho vyjme
`node_modules` a `dist` (vzniknou uvnitř, pro Linux v kontejneru), `.git` a hlavně
`.env`. Pozdější smazání nepomůže, protože každá vrstva image se ukládá zvlášť:
`RUN rm` přidá novou vrstvu bez souboru, ale vrstva z `COPY` s heslem v ní zůstává a dá
se z image vytáhnout. Příznak nikdo neuvidí — dokud si image někdo nestáhne. Tajemství
se předávají jako proměnné prostředí při spuštění.

### --see--

nasazeni-provoz/kontejnery-a-servery#dockerignore

## --card-- free

Proč je v `compose.yaml` adresa databáze `@db:5432` a ne `@localhost:5432`?

### --back--

`localhost` uvnitř kontejneru znamená ten kontejner sám, ne tvůj počítač ani jiný
kontejner — na portu 5432 tam nic neposlouchá a aplikace dostane
`connect ECONNREFUSED 127.0.0.1:5432`. Služby v jedné sestavě [[docker compose]] se
navzájem najdou podle jména služby, které Compose přeloží na příslušný kontejner. Ze
stejného důvodu databáze nemusí mít `ports`: aplikace se k ní dostane uvnitř sítě
Compose a ven se nic nevystavuje.

### --see--

nasazeni-provoz/kontejnery-a-servery#compose-yaml-aplikace-a-databaze

## --card-- free

Aplikace v kontejneru ukládá nahrané fotky do `/app/uploads`. Po nasazení nové verze
zmizely. Proč a kam ta data patří?

### --back--

Nová verze znamená nový kontejner z nového image. Zápisy uvnitř kontejneru patří jen
tomu jednomu běhu a se smazaným kontejnerem zanikly; nový začíná zase od nezměněného
obrazu. Do image data nepatří — ta vznikají až za běhu. Co má přežít, patří do
[[svazek|svazku]] (adresář, který Docker drží mimo kontejner), do databáze nebo do
úložiště mimo server. Právě proto má databáze v `compose.yaml` `volumes: db-data`.

### --see--

nasazeni-provoz/kontejnery-a-servery#image-a-kontejner

## --card-- free

Svazek `db-data` na jednom VPS není záloha. Co zálohou je?

### --back--

Svazek jen přežije smazání kontejneru — data pořád existují jen jednou a na tomtéž
serveru, takže je vezme porucha disku, napadený server i `DELETE` bez `WHERE`. Záloha je
kopie **mimo server**, ze které umíš obnovit: pravidelný výpis (`pg_dump`, u SQLite
`sqlite3 data.db ".backup zaloha.db"`, protože obyčejné `cp` může zkopírovat rozepsaný
stav), uložený u jiného poskytovatele (pravidlo 3-2-1: tři kopie, dvě média, jedna mimo
místo), a hlavně **vyzkoušená obnova**. Záloha, ze které jsi nikdy nic neobnovil, je jen
naděje.

### --see--

nasazeni-provoz/kontejnery-a-servery#zalohy

## --card-- free

K čemu je před aplikací [[reverse proxy]] a proč pak aplikace v `compose.yaml` nemá
žádné `ports`?

### --back--

Proxy (Caddy, Nginx, Traefik) přijme požadavek z internetu a přepošle ho aplikaci.
Řeší věci, které nechceš psát v Node: HTTPS včetně certifikátu od Let's Encrypt
a přesměrování z `http://`, víc aplikací na jednom serveru podle domény, kompresi,
statické soubory a limity velikosti. Aplikace `ports` nemá proto, že má být dostupná
jen přes proxy — vystavený port by šel obejít bez šifrování i bez limitů, zatímco Caddy
se k ní dostane uvnitř sítě Compose na `app:3000`. Ven vystavuje porty 80 a 443 jen
proxy a její data (certifikáty) potřebují svazek, jinak si je po každém restartu žádá
znovu.

### --see--

nasazeni-provoz/kontejnery-a-servery#reverse-proxy-a-https

## --card-- free

Workflow má úlohy `check` a `deploy`. Co zajistí `needs: check` a co podmínka `if`?

### --back--

Bez `needs` běží úlohy souběžně a navzájem na sebe nečekají, takže by se rozbitá verze
nasadila dřív, než testy stihnou selhat; `needs: check` spustí nasazení až po úspěšné
kontrole. Podmínka `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`
zase omezí nasazení na `main` — jinak by se do produkce nasadil i kód z pull requestu,
který ještě nikdo nesloučil. K tomu patří **ochrana větve** v nastavení repozitáře:
bez ní jde sloučit i pull request s červeným křížkem a platforma, která nasazuje po
pushi, ho vezme.

### --see--

nasazeni-provoz/ci-cd#nasazeni-po-merge

## --card-- free

Proč krok CI s kontrolním skriptem prošel, i když skript vypsal chybu?

### --back--

CI se na výpis nedívá; rozhoduje jen **návratový kód** příkazu. Nula je úspěch, cokoli
jiného chyba. Skript chybu vypsal přes `console.error` a doběhl normálně, takže skončil
kódem 0 a krok je zelený. Oprava je `process.exitCode = 1` po nalezení chyby — proces
tak doběhne a vypíše i zbývající chyby, ale skončí nenulovým kódem. `process.exit(1)`
by skončil hned a další chyby by nevypsal.

### --see--

nasazeni-provoz/ci-cd#workflow-v-github-actions

## --card-- free

Co musí platit, aby šel [[rollback]] udělat za minuty, a co vrátit nejde?

### --back--

Sestavené verze se nesmí měnit a musí zůstat uložené: image v registru se značí otiskem
commitu (`pujcovna-kol:3f9c2e1`), ne jen `latest`, a rollback je pak spuštění předchozí
značky. Platformy drží předchozí nasazení a mají na to tlačítko. `git revert` funguje
taky, jen projde celým CI a trvá déle. Pravidlo zní **nejdřív vrať, pak hledej** — opravu
napíšeš v klidu. Vrátit nejde databáze: když nová verze smazala sloupec, stará verze po
rollbacku spadne na `no such column`. Proto se schéma mění tak, aby předchozí verze
fungovala i s novým schématem.

### --see--

nasazeni-provoz/ci-cd#rollback

## --card-- free

Proč se aplikace na vlastním serveru pouští jako služba [[systemd]], a ne příkazem
v terminálu?

### --back--

Proces spuštěný v terminálu patří tomu přihlášení: po odhlášení skončí, po pádu se
nespustí znovu, po restartu stroje taky ne a jeho výstup nikde nezůstane. Služba se
stará o start po bootu (`enable --now`), o restart po pádu (`Restart=on-failure`), běží
pod vlastním nepřivilegovaným uživatelem (`User=`), bere tajemství z `EnvironmentFile`
a její výstup sbírá journal, kde se dá prohledávat (`journalctl -u … -f`). V `ExecStart`
patří celá cesta k `node`, ne `npm start`: jinak dostane `SIGTERM` npm místo Node a po
změně souboru služby nezapomeň na `systemctl daemon-reload`.

### --see--

nasazeni-provoz/linux-server#sluzba-v-systemd
