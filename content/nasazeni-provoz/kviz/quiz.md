## `.env` soubor a git

Jak se má v moderní aplikaci správně pracovat se souborem `.env`?

[ ] Má se verzovat v gitu, aby všichni vývojáři měli hned funkční prostředí
  --why--
  Soubor `.env` často obsahuje tajné klíče a hesla k lokální databázi. Ty do gitu nepatří, každý vývojář má mít svůj vlastní.
[x] Nesmí být verzován v gitu (patří do `.gitignore`), často se do gitu dává jen vzorový `.env.example`
[ ] Je to zastaralý přístup, dnes se vše kóduje přímo do souboru `config.js`
  --why--
  Konfigurační soubor `config.js` je součástí kódu. Pokud v něm budou hesla, poruší to pravidlo, že tajemství do gitu nepatří.
[ ] Verzuje se v gitu, ale jen v privátních repozitářích
  --why--
  Ani v privátním repozitáři by hesla neměla být v kódu. Kdokoli má přístup k repozitáři, má pak i hesla.

## NODE_ENV a Express

K čemu v Node.js slouží proměnná prostředí `NODE_ENV` nastavená na `production` (například v Express aplikaci)?

[ ] Je to jen konvence pro programátora, Node.js ani knihovny na ni nijak nereagují
  --why--
  Framework Express (a mnohé další balíčky) se podle `NODE_ENV === 'production'` chová jinak – například omezí logování detailů o chybách nebo začne cacheovat šablony.
[x] Oznamuje aplikaci a knihovnám (jako Express), že běží v produkci; Express pak například nezobrazuje uživatelům stack trace chyb
[ ] Slouží k automatickému škálování na více jader procesoru
  --why--
  Pro škálování (cluster) se používají jiné nástroje (jako PM2), proměnná `NODE_ENV` ovlivňuje chování knihoven.
[ ] Express ji vyžaduje k nastartování, bez ní aplikace vůbec nenaběhne
  --why--
  Bez ní se Express spustí, jen poběží ve výchozím vývojovém (development) režimu.

## Graceful shutdown

Proč by měl webový server (Node.js aplikace) zachytávat signál `SIGTERM`?

[ ] Aby mohl smazat své logy před tím, než ho systém ukončí
  --why--
  Logy by měly zůstat uložené. Zachytávání `SIGTERM` má umožnit bezpečně ukončit rozpracovanou práci.
[x] Aby mohl přestat přijímat nové požadavky, vyřídit ty stávající, korektně zavřít připojení do databáze a teprve pak se vypnout
[ ] Aby mohl proces ignorovat ukončení a běžet trvale (tzv. zombie proces)
  --why--
  Ignorování signálů pro ukončení je chyba; systém po chvíli pošle nekompromisní `SIGKILL`.
[ ] Systém posílá `SIGTERM` při přehřátí procesoru, aby aplikace omezila výkon
  --why--
  `SIGTERM` je standardní signál žádající o ukončení procesu, například při nasazování nové verze.

## Dockerfile: USER node

Co je cílem instrukce `USER node` v Dockerfile pro Node.js aplikaci?

[ ] Přepne Node.js do speciálního "node" módu pro vyšší výkon
  --why--
  Tato instrukce nesouvisí s módem pro výkon, ale s právy uživatele.
[x] Zajistí, že proces uvnitř kontejneru nepoběží s právy `root`, čímž omezuje škody v případě bezpečnostní díry
[ ] Nainstaluje globální proměnné uživatele "node" do operačního systému kontejneru
  --why--
  Ne, jen přepne uživatele, pod kterým se budou vykonávat následující instrukce a příkazy.
[ ] Je nutná k tomu, aby šlo spustit příkaz `npm start`
  --why--
  Příkaz `npm start` lze spustit pod jakýmkoli uživatelem (často běží právě pod rootem, pokud se to nezmění).

## Analýza CI/CD pipeline (1/2)

Přečti si následující konfiguraci GitHub Actions a vyber, co na ní chybí z hlediska bezpečného nasazování (nepředpokládej žádný kód navíc).

--code-- yaml
name: Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run deploy
--

[x] Před samotným krokem nasazení chybí ověření (lint, testy a kontrola typů), takže se může nasadit rozbitý kód
[ ] Chybí zadání verze GitHub Actions (`uses: actions/checkout@v5`)
  --why--
  Verze v4 je plně platná. Problém spočívá v chybějící fázi testování kódu.
[ ] `npm install` se nedá použít v CI, musí tam být `yarn`
  --why--
  `npm install` se dá normálně použít (ač se doporučuje spíše `npm ci` pro konzistentní build). Problém je, že tu chybí testy.
[ ] Nasazení proběhne pouze, pokud commit obsahuje slovo "deploy"
  --why--
  Triggery jsou nastaveny na `on: [push]`, takže akce poběží na každý push, nehledě na zprávu.

## Analýza CI/CD pipeline (2/2)

K čemu slouží příkaz `npm ci` (místo `npm install`) v CI/CD prostředí?

[x] Nainstaluje balíčky přesně podle `package-lock.json` a zaručí tak, že v CI použije naprosto stejné verze jako vývojář
[ ] Je to zkratka pro "Continuous Integration", která před instalací smaže celý projekt a stáhne ho znovu
  --why--
  Projekt stahuje akce `actions/checkout`. `npm ci` (clean install) pouze maže `node_modules` a instaluje přesně podle `package-lock.json`.
[ ] Spustí po instalaci automaticky testy
  --why--
  Ne, jen instaluje. Testy se musí spustit dalším příkazem, např. `npm test`.
[ ] Umožňuje instalaci balíčků bez připojení k internetu (offline)
  --why--
  Bez připojení k internetu nedokáže balíčky stáhnout (pokud nejsou nacacheované, což CI obvykle nemá po čistém startu).

## Strukturované logování (JSON)

Proč se v produkčním provozu doporučuje logovat aplikační události do formátu JSON pomocí knihoven jako Pino (tzv. strukturované logování), a ne jako čistý text?

[ ] JSON zabírá na disku méně místa než čistý text, takže servery déle vydrží bez promazávání
  --why--
  JSON log obvykle zabere více místa (kvůli klíčům a struktuře), ale jeho výhoda je jinde.
[x] JSON logy lze v monitorovacích nástrojích (Datadog, Kibana, atd.) snadno filtrovat a analyzovat (např. najít všechny logy s klíčem `userId: 42`)
[ ] Node.js neumí zapisovat obyčejné textové řetězce, pokud přesáhnou určitou délku
  --why--
  Node.js samozřejmě umí zapisovat dlouhé řetězce přes `console.log` nebo `fs`.
[ ] JSON je jediný formát, kterému rozumí Docker
  --why--
  Docker sbírá výstup z stdout bez ohledu na to, zda jde o text nebo JSON.

## Co NIKDY nepatří do logů?

Některá data by aplikace v žádném případě neměla logovat (ani ve strukturovaných logách, ani jinde). Označ, co nesmí být nikdy zalogováno.

[x] Hesla v nezašifrované podobě, čísla platebních karet a osobní údaje jako citlivé tokeny
[ ] Identifikátory požadavků (request ID)
  --why--
  Request ID je naopak velmi užitečné pro trasování, jaké logy patří k jednomu požadavku.
[ ] Datum a čas vzniku logu a název volané funkce
  --why--
  Tyto informace jsou nutné pro pochopení, kdy a kde se chyba stala.
[ ] Celý chybový stack trace výjimky, která nastala na serveru
  --why--
  Stack trace je bezpečné logovat uvnitř interních systémů, pomáhá při debuggování. (Nesmí se posílat *uživateli*).

## Základy SQL - Vazby (opakování)

Máš dvě tabulky: `users` a `orders`. Potřebuješ pro každou objednávku získat e-mail zákazníka, který ji vytvořil. Jaká operace se k tomu použije?

[ ] `GROUP BY users.id`
  --why--
  Tato operace data seskupuje podle klíče, ale nepropojuje tabulky.
[x] `JOIN users ON users.id = orders.user_id`
[ ] `UNION orders WITH users`
  --why--
  `UNION` sloučí řádky se stejnou strukturou ze dvou dotazů pod sebe, neumí spojovat sloupce na základě vazby.
[ ] `ORDER BY users.email`
  --why--
  Slouží jen k řazení výsledků.

## Transakce v SQL (opakování)

Proč obalujeme zápis nové objednávky a snížení počtu položek na skladě do databázové transakce (`BEGIN` / `COMMIT`)?

[ ] Aby se operace vykonaly asynchronně a neblokovaly Node.js proces
  --why--
  Transakce souvisí s integritou dat, nikoliv asynchronitou v Node.js.
[x] Aby v případě chyby u jedné z operací (např. položka už není na skladě) databáze vrátila systém do původního stavu (`ROLLBACK`) a objednávka nevznikla bez snížení skladu
[ ] Aby mohlo více uživatelů zapisovat do databáze současně, jelikož bez transakce je zápis povolen vždy jen jednomu
  --why--
  Většina databází zvládá současné zápisy; transakce slouží k atomicitě bloku příkazů.
[ ] Protože bez transakce nelze v SQL použít operaci `UPDATE`
  --why--
  Příkaz `UPDATE` lze spouštět i mimo transakci.

## Auth - Ukládání hesla (opakování)

Pokud ukládáš hesla uživatelů do databáze, jaký je jediný správný postup z bezpečnostního hlediska?

[x] Před uložením heslo zahashovat silnou hashovací funkcí (např. Argon2 nebo bcrypt) spolu s unikátní "solí"
[ ] Ukládat ho jako prostý text, aby ho administrátor mohl uživateli připomenout, když ho zapomene
  --why--
  Pokud unikne databáze, uniknou okamžitě i hesla. Administrátor by nikdy neměl znát hesla uživatelů.
[ ] Zakódovat ho pomocí Base64, což znemožňuje čtení na první pohled
  --why--
  Base64 není šifrování ani hashování; kdokoliv může hodnotu ihned dekódovat.
[ ] Zašifrovat heslo pomocí obousměrné šifry (např. AES), aby se dalo v případě potřeby dešifrovat zpět
  --why--
  Z bezpečnostních důvodů by hesla nikdy neměla být dešifrovatelná; proto se používá hashování (jednosměrný proces).

## Auth - Ochrana proti útoku CSRF (opakování)

Co je hlavním principem útoku CSRF (Cross-Site Request Forgery) a jak mu lze ve webové aplikaci bránit?

[ ] Útočník uhádne heslo brutálním slovníkovým útokem; obrana spočívá v zablokování účtu po 5 neúspěšných pokusech
  --why--
  To je ochrana proti "Brute force" (hádání hesla), ne proti CSRF.
[ ] Útočník spustí na serveru vlastní kód; obrana spočívá v omezení práv databázového uživatele
  --why--
  To je popis SQL injection nebo Remote Code Execution.
[x] Útočník donutí prohlížeč oběti odeslat zákeřný požadavek na zranitelný server, u kterého je uživatel přihlášený (prohlížeč pošle i jeho cookie). Obrana: SameSite atribut u cookies nebo CSRF token.
[ ] Útočník podvrhne hlavičku požadavku a předstírá, že je někdo jiný; obrana spočívá v použití HTTPS.
  --why--
  Podvržení hlaviček lze skutečně částečně ztížit HTTPS, ale CSRF využívá to, že platnou relaci s platnou cookie odesílá *sám uživatelův prohlížeč*.
