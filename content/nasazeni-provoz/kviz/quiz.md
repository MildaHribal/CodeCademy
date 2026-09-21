---
pass: 0.8
---

## --question--

Jak se má v moderní aplikaci správně pracovat se souborem `.env`?

### --answer--

Má se verzovat v gitu, aby všichni vývojáři měli hned funkční prostředí

#### --why--

Soubor `.env` často obsahuje tajné klíče a hesla k lokální databázi. Ty do gitu nepatří, každý vývojář má mít svůj vlastní.

### --correct--

Nesmí být verzován v gitu (patří do `.gitignore`), často se do gitu dává jen vzorový `.env.example`

### --answer--

Je to zastaralý přístup, dnes se vše kóduje přímo do souboru `config.js`

#### --why--

Konfigurační soubor `config.js` je součástí kódu. Pokud v něm budou hesla, poruší to pravidlo, že tajemství do gitu nepatří.

### --answer--

Verzuje se v gitu, ale jen v privátních repozitářích

#### --why--

Ani v privátním repozitáři by hesla neměla být v kódu. Kdokoli má přístup k repozitáři, má pak i hesla.

### --see--

nasazeni-provoz/produkcni-rezim#env-a-tajemstvi

## --question--

K čemu v Node.js slouží proměnná prostředí `NODE_ENV` nastavená na `production` (například v Express aplikaci)?

### --answer--

Je to jen konvence pro programátora, Node.js ani knihovny na ni nijak nereagují

#### --why--

Framework Express (a mnohé další balíčky) se podle `NODE_ENV === 'production'` chová jinak – například omezí logování detailů o chybách nebo začne cacheovat šablony.

### --correct--

Oznamuje aplikaci a knihovnám (jako Express), že běží v produkci; Express pak například nezobrazuje uživatelům stack trace chyb

### --answer--

Slouží k automatickému škálování na více jader procesoru

#### --why--

Pro škálování (cluster) se používají jiné nástroje (jako PM2), proměnná `NODE_ENV` ovlivňuje chování knihoven.

### --answer--

Express ji vyžaduje k nastartování, bez ní aplikace vůbec nenaběhne

#### --why--

Bez ní se Express spustí, jen poběží ve výchozím vývojovém (development) režimu.

### --see--

nasazeni-provoz/produkcni-rezim#vyvoj-a-produkce-co-se-zmeni

## --question--

Proč by měl webový server (Node.js aplikace) zachytávat signál `SIGTERM`?

### --answer--

Aby mohl smazat své logy před tím, než ho systém ukončí

#### --why--

Logy by měly zůstat uložené. Zachytávání `SIGTERM` má umožnit bezpečně ukončit rozpracovanou práci.

### --correct--

Aby mohl přestat přijímat nové požadavky, vyřídit ty stávající, korektně zavřít připojení do databáze a teprve pak se vypnout

### --answer--

Aby mohl proces ignorovat ukončení a běžet trvale (tzv. zombie proces)

#### --why--

Ignorování signálů pro ukončení je chyba; systém po chvíli pošle nekompromisní `SIGKILL`.

### --answer--

Systém posílá `SIGTERM` při přehřátí procesoru, aby aplikace omezila výkon

#### --why--

`SIGTERM` je standardní signál žádající o ukončení procesu, například při nasazování nové verze.

### --see--

nasazeni-provoz/produkcni-rezim#sigterm-korektni-ukonceni

## --question--

Co je cílem instrukce `USER node` v Dockerfile pro Node.js aplikaci?

### --answer--

Přepne Node.js do speciálního "node" módu pro vyšší výkon

#### --why--

Tato instrukce nesouvisí s módem pro výkon, ale s právy uživatele.

### --correct--

Zajistí, že proces uvnitř kontejneru nepoběží s právy `root`, čímž omezuje škody v případě bezpečnostní díry

### --answer--

Nainstaluje globální proměnné uživatele "node" do operačního systému kontejneru

#### --why--

Ne, jen přepne uživatele, pod kterým se budou vykonávat následující instrukce a příkazy.

### --answer--

Je nutná k tomu, aby šlo spustit příkaz `npm start`

#### --why--

Příkaz `npm start` lze spustit pod jakýmkoli uživatelem (často běží právě pod rootem, pokud se to nezmění).

### --see--

nasazeni-provoz/kontejnery-a-servery#dockerfile-pro-node

## --question--

Přečti si následující konfiguraci GitHub Actions a vyber, co na ní chybí z hlediska bezpečného nasazování (nepředpokládej žádný kód navíc).


```yaml
name: Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run deploy
```

### --correct--

Před samotným krokem nasazení chybí ověření (lint, testy a kontrola typů), takže se může nasadit rozbitý kód

### --answer--

Chybí zadání verze GitHub Actions (`uses: actions/checkout@v5`)

#### --why--

Verze v4 je plně platná. Problém spočívá v chybějící fázi testování kódu.

### --answer--

`npm install` se nedá použít v CI, musí tam být `yarn`

#### --why--

`npm install` se dá normálně použít (ač se doporučuje spíše `npm ci` pro konzistentní build). Problém je, že tu chybí testy.

### --answer--

Nasazení proběhne pouze, pokud commit obsahuje slovo "deploy"

#### --why--

Triggery jsou nastaveny na `on: [push]`, takže akce poběží na každý push, nehledě na zprávu.

### --see--

nasazeni-provoz/ci-cd#workflow-v-github-actions

## --question--

K čemu slouží příkaz `npm ci` (místo `npm install`) v CI/CD prostředí?

### --correct--

Nainstaluje balíčky přesně podle `package-lock.json` a zaručí tak, že v CI použije naprosto stejné verze jako vývojář

### --answer--

Je to zkratka pro "Continuous Integration", která před instalací smaže celý projekt a stáhne ho znovu

#### --why--

Projekt stahuje akce `actions/checkout`. `npm ci` (clean install) pouze maže `node_modules` a instaluje přesně podle `package-lock.json`.

### --answer--

Spustí po instalaci automaticky testy

#### --why--

Ne, jen instaluje. Testy se musí spustit dalším příkazem, např. `npm test`.

### --answer--

Umožňuje instalaci balíčků bez připojení k internetu (offline)

#### --why--

Bez připojení k internetu nedokáže balíčky stáhnout (pokud nejsou nacacheované, což CI obvykle nemá po čistém startu).

### --see--

nasazeni-provoz/ci-cd#npm-ci-a-cache

## --question--

Proč se v produkčním provozu doporučuje logovat aplikační události do formátu JSON pomocí knihoven jako Pino (tzv. strukturované logování), a ne jako čistý text?

### --answer--

JSON zabírá na disku méně místa než čistý text, takže servery déle vydrží bez promazávání

#### --why--

JSON log obvykle zabere více místa (kvůli klíčům a struktuře), ale jeho výhoda je jinde.

### --correct--

JSON logy lze v monitorovacích nástrojích (Datadog, Kibana, atd.) snadno filtrovat a analyzovat (např. najít všechny logy s klíčem `userId: 42`)

### --answer--

Node.js neumí zapisovat obyčejné textové řetězce, pokud přesáhnou určitou délku

#### --why--

Node.js samozřejmě umí zapisovat dlouhé řetězce přes `console.log` nebo `fs`.

### --answer--

JSON je jediný formát, kterému rozumí Docker

#### --why--

Docker sbírá výstup z stdout bez ohledu na to, zda jde o text nebo JSON.

### --see--

nasazeni-provoz/logovani-a-chyby#strukturovane-logy

## --question--

Některá data by aplikace v žádném případě neměla logovat (ani ve strukturovaných logách, ani jinde). Označ, co nesmí být nikdy zalogováno.

### --correct--

Hesla v nezašifrované podobě, čísla platebních karet a osobní údaje jako citlivé tokeny

### --answer--

Identifikátory požadavků (request ID)

#### --why--

Request ID je naopak velmi užitečné pro trasování, jaké logy patří k jednomu požadavku.

### --answer--

Datum a čas vzniku logu a název volané funkce

#### --why--

Tyto informace jsou nutné pro pochopení, kdy a kde se chyba stala.

### --answer--

Celý chybový stack trace výjimky, která nastala na serveru

#### --why--

Stack trace je bezpečné logovat uvnitř interních systémů, pomáhá při debuggování. (Nesmí se posílat *uživateli*).

### --see--

nasazeni-provoz/logovani-a-chyby#co-do-logu-nepatri

## --question--

Máš dvě tabulky: `users` a `orders`. Potřebuješ pro každou objednávku získat e-mail zákazníka, který ji vytvořil. Jaká operace se k tomu použije?

### --answer--

`GROUP BY users.id`

#### --why--

Tato operace data seskupuje podle klíče, ale nepropojuje tabulky.

### --correct--

`JOIN users ON users.id = orders.user_id`

### --answer--

`UNION orders WITH users`

#### --why--

`UNION` sloučí řádky se stejnou strukturou ze dvou dotazů pod sebe, neumí spojovat sloupce na základě vazby.

### --answer--

`ORDER BY users.email`

#### --why--

Slouží jen k řazení výsledků.

### --see--

sql-databaze/navrh-schematu

## --question--

Proč obalujeme zápis nové objednávky a snížení počtu položek na skladě do databázové transakce (`BEGIN` / `COMMIT`)?

### --answer--

Aby se operace vykonaly asynchronně a neblokovaly Node.js proces

#### --why--

Transakce souvisí s integritou dat, nikoliv asynchronitou v Node.js.

### --correct--

Aby v případě chyby u jedné z operací (např. položka už není na skladě) databáze vrátila systém do původního stavu (`ROLLBACK`) a objednávka nevznikla bez snížení skladu

### --answer--

Aby mohlo více uživatelů zapisovat do databáze současně, jelikož bez transakce je zápis povolen vždy jen jednomu

#### --why--

Většina databází zvládá současné zápisy; transakce slouží k atomicitě bloku příkazů.

### --answer--

Protože bez transakce nelze v SQL použít operaci `UPDATE`

#### --why--

Příkaz `UPDATE` lze spouštět i mimo transakci.

### --see--

sql-databaze/workshop-join-agregace

## --question--

Pokud ukládáš hesla uživatelů do databáze, jaký je jediný správný postup z bezpečnostního hlediska?

### --correct--

Před uložením heslo zahashovat silnou hashovací funkcí (např. Argon2 nebo bcrypt) spolu s unikátní "solí"

### --answer--

Ukládat ho jako prostý text, aby ho administrátor mohl uživateli připomenout, když ho zapomene

#### --why--

Pokud unikne databáze, uniknou okamžitě i hesla. Administrátor by nikdy neměl znát hesla uživatelů.

### --answer--

Zakódovat ho pomocí Base64, což znemožňuje čtení na první pohled

#### --why--

Base64 není šifrování ani hashování; kdokoliv může hodnotu ihned dekódovat.

### --answer--

Zašifrovat heslo pomocí obousměrné šifry (např. AES), aby se dalo v případě potřeby dešifrovat zpět

#### --why--

Z bezpečnostních důvodů by hesla nikdy neměla být dešifrovatelná; proto se používá hashování (jednosměrný proces).

### --see--

auth-bezpecnost/hesla#pomaly-hash-scrypt-a-argon2

## --question--

Co je hlavním principem útoku CSRF (Cross-Site Request Forgery) a jak mu lze ve webové aplikaci bránit?

### --answer--

Útočník uhádne heslo brutálním slovníkovým útokem; obrana spočívá v zablokování účtu po 5 neúspěšných pokusech

#### --why--

To je ochrana proti "Brute force" (hádání hesla), ne proti CSRF.

### --answer--

Útočník spustí na serveru vlastní kód; obrana spočívá v omezení práv databázového uživatele

#### --why--

To je popis SQL injection nebo Remote Code Execution.

### --correct--

Útočník donutí prohlížeč oběti odeslat zákeřný požadavek na zranitelný server, u kterého je uživatel přihlášený (prohlížeč pošle i jeho cookie). Obrana: SameSite atribut u cookies nebo CSRF token.

### --answer--

Útočník podvrhne hlavičku požadavku a předstírá, že je někdo jiný; obrana spočívá v použití HTTPS.

#### --why--

Podvržení hlaviček lze skutečně částečně ztížit HTTPS, ale CSRF využívá to, že platnou relaci s platnou cookie odesílá *sám uživatelův prohlížeč*.

### --see--

auth-bezpecnost/owasp-zranitelnosti#csrf-pozadavek-z-cizi-stranky
