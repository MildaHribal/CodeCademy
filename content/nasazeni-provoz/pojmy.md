## --term-- produkční režim

en: production mode
aliases: produkčního režimu, produkčním režimu, produkce, v produkci, do produkce
lekce: nasazeni-provoz/produkcni-rezim#vyvoj-a-produkce-co-se-zmeni

Běh aplikace pro skutečné uživatele: optimalizovaný build, chybové hlášky bez detailů
o vnitřku, zapnuté bezpečnostní hlavičky. Zapíná se konfigurací, ne jiným kódem.

## --term-- tajemství

en: secret
aliases: tajemstvím, tajemství aplikace, secret, secrets, citlivé údaje
lekce: nasazeni-provoz/produkcni-rezim#env-a-tajemstvi

Údaj, ze kterého se dá zneužít přístup: heslo k databázi, API klíč, podpisový klíč.
Do repozitáře nepatří ani v `.env` — předává se proměnnou prostředí z úložiště tajemství.

## --term-- health check

en: health check
aliases: health checku, health checkem, health checky, kontrola zdraví, endpoint zdraví
lekce: nasazeni-provoz/produkcni-rezim#health-check

Adresa (typicky `/health`), na kterou se ptá orchestrátor nebo monitoring a z odpovědi
pozná, jestli aplikace ještě odbavuje požadavky. Odpověď má být rychlá a nemá spouštět
nic drahého.

## --term-- korektní ukončení

en: graceful shutdown
aliases: korektního ukončení, korektním ukončením, graceful shutdown, graceful shutdownu, řízené ukončení
lekce: nasazeni-provoz/produkcni-rezim#sigterm-korektni-ukonceni

Reakce na signál `SIGTERM`: aplikace přestane přijímat nové požadavky, dokončí
rozpracované a teprve pak skončí. Bez něj se při každém nasazení někomu utne odpověď
uprostřed.

## --term-- rychlé selhání

en: fail fast
aliases: rychlého selhání, rychlým selháním, fail fast
lekce: nasazeni-provoz/produkcni-rezim#konfigurace-z-prostredi

Aplikace při startu zkontroluje, že má všechnu potřebnou konfiguraci, a když něco chybí,
**hned spadne s jasnou hláškou**. Lepší než spadnout za tři hodiny na prvním požadavku,
který tu proměnnou potřeboval.

## --term-- strukturovaný log

en: structured log
aliases: strukturované logy, strukturovaných logů, strukturovaným logem, strukturovaného logu, log jako JSON
lekce: nasazeni-provoz/logovani-a-chyby#strukturovane-logy

Řádek logu zapsaný jako JSON s pojmenovanými poli místo věty. Dá se v něm filtrovat
a agregovat (`level=error AND route=/api/objednavky`), což u prostého textu nejde.

## --term-- úroveň logu

en: log level
aliases: úrovně logu, úrovní logu, úrovně logů, log level, úroveň logování
lekce: nasazeni-provoz/logovani-a-chyby#urovne-logu

Závažnost zprávy: `debug`, `info`, `warn`, `error`. V produkci se zapne od `info` výš,
aby se v logu dalo něco najít — a aby se neplatilo za ukládání ladicích výpisů.

## --term-- request id

en: request id
aliases: request idčko, request id požadavku, korelační id, correlation id, id požadavku
lekce: nasazeni-provoz/logovani-a-chyby#request-id

Náhodné id přidělené každému příchozímu požadavku a vypsané do všech logů, které z něj
vzniknou. Díky němu z tisíců řádků vytáhneš právě ty, co patří k jedné stížnosti.

## --term-- image

en: image
aliases: obraz, obrazu, obrazem, obrazy, image kontejneru, docker image
lekce: nasazeni-provoz/kontejnery-a-servery#image-a-kontejner

Zabalený otisk souborového systému a konfigurace, ze kterého se spouštějí kontejnery.
Je jen ke čtení a je všude stejný — proto se aplikace chová na serveru jako u tebe.

## --term-- kontejner

en: container
aliases: kontejneru, kontejnerem, kontejnery, kontejnerů, v kontejneru
lekce: nasazeni-provoz/kontejnery-a-servery#image-a-kontejner

Běžící instance image. Má vlastní souborový systém, síť a procesy, ale sdílí jádro
s hostitelem — proto startuje ve zlomku času oproti virtuálnímu stroji.

## --term-- Dockerfile

en: Dockerfile
aliases: Dockerfilu, Dockerfilem, v Dockerfile, Dockerfily
lekce: nasazeni-provoz/kontejnery-a-servery#dockerfile-pro-node

Předpis, jak image sestavit: z čeho vyjít, co nakopírovat, co spustit. Každá instrukce
je vrstva a vrstvy se cachují, proto se pořadí řádků vyplatí promyslet.

## --term-- vícefázový build

en: multi-stage build
aliases: vícefázového buildu, vícefázovým buildem, multi-stage build, víc fází buildu
lekce: nasazeni-provoz/kontejnery-a-servery#vicefazovy-build

Dockerfile s víc fázemi `FROM`, kde se v první sestaví aplikace a do poslední se přenese
jen výsledek. Výsledný image pak neobsahuje kompilátory ani vývojové závislosti.

## --term-- svazek

en: volume
aliases: svazku, svazkem, svazky, volume, volumes
lekce: nasazeni-provoz/kontejnery-a-servery#compose-yaml-aplikace-a-databaze

Úložiště připojené ke kontejneru zvenčí. Data v něm přežijí smazání kontejneru — proto
v něm běží databáze a proto se bez něj po restartu ztratí.

## --term-- reverse proxy

en: reverse proxy
aliases: reverzní proxy, reverse proxy serveru, reverzní proxy server, proxy před aplikací
lekce: nasazeni-provoz/kontejnery-a-servery#reverse-proxy-a-https

Server před aplikací (Caddy, Nginx, Traefik), který přijímá požadavky zvenčí, řeší HTTPS
a certifikáty a posílá je dál. Aplikace pak běží na obyčejném HTTP na localhostu.

## --term-- CI

en: continuous integration
aliases: continuous integration, CI/CD, CI a CD, kontinuální integrace, CD, continuous deployment
lekce: nasazeni-provoz/ci-cd#co-je-ci-a-cd

**CI** je automat, který u každé změny pustí lint, typy, testy a build. **CD** navazuje
nasazením toho, co prošlo. Smysl je v tom, že si nikdo nemusí pamatovat, co spustit.

## --term-- náhledové prostředí

en: preview environment
aliases: náhledového prostředí, náhledovém prostředí, náhledová prostředí, preview environment, náhledové nasazení
lekce: nasazeni-provoz/ci-cd#nahledova-prostredi

Dočasná kopie aplikace nasazená z pull requestu na vlastní adresu. Recenzent si změnu
proklikne místo čtení diffu a nikdo kvůli tomu nemusí nic stahovat.

## --term-- rollback

en: rollback
aliases: rollbacku, rollbackem, návrat na předchozí verzi, vrátit nasazení
lekce: nasazeni-provoz/ci-cd#rollback

Návrat na předchozí funkční verzi, když se nasazení nepovede. Musí jít udělat jedním
krokem a bez buildu — jinak se v panice dělat nebude.

## --term-- dvoufázová změna schématu

en: expand and contract migration
aliases: dvoufázové změny schématu, dvoufázovou změnu schématu, expand and contract, dvoufázová migrace
lekce: nasazeni-provoz/ci-cd#dvoufazova-zmena-schematu

Postup, jak změnit databázi bez výpadku: nejdřív se přidá nové (a stará verze kódu dál
funguje), pak se nasadí kód, který nové používá, a až nakonec se staré odstraní.

## --term-- systemd

en: systemd
aliases: systemdu, systemdem, systemd služba, služba v systemd, unit soubor
lekce: nasazeni-provoz/linux-server#sluzba-v-systemd

Správce služeb v Linuxu. Aplikaci popíšeš v unit souboru a systemd ji nastartuje po bootu,
restartuje po pádu a sbírá z ní logy — takže nepotřebuješ nic jako `pm2` ani `screen`.

## --term-- docker compose

en: Docker Compose
aliases: Docker Compose, compose, compose souboru, compose.yaml, v compose
lekce: nasazeni-provoz/kontejnery-a-servery#compose-yaml-aplikace-a-databaze

Nástroj, který z jednoho souboru spustí celé prostředí — aplikaci, databázi, proxy —
i se sítí mezi nimi. Služby se navzájem najdou podle jména, takže API se k databázi
připojuje na `db`, ne na IP adresu.
