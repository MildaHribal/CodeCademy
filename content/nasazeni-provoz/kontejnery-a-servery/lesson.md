# Kontejnery, servery a HTTPS

:::check pretest
Aplikace ti na notebooku běží s Node 26. Na serveru je Node 18 a hned při startu padá na `SyntaxError`. Co z toho nejspolehlivěji zajistí, aby server spouštěl přesně to, co jsi vyzkoušel?

### --answer--
Napsat do README, jakou verzi Node má server mít.

#### --why--
README nikdo nevynutí. Za půl roku na serveru někdo aktualizuje systém a rozdíl je zpátky.

### --correct--
Zabalit aplikaci i s Node a závislostmi do jednoho balíku, který se spouští všude stejně.

#### --why--
Přesně tohle je image kontejneru: souborový systém s Node, závislostmi a kódem. Server pak nepotřebuje nic kromě Dockeru.

### --answer--
Na serveru pokaždé spustit `npm install`, ten verzi Node dorovná.

#### --why--
`npm install` instaluje balíčky, ne Node. A na serveru může nainstalovat jiné verze balíčků, než jsi zkoušel.
:::

Hotová služba z workshopu potřebuje ke spuštění konkrétní verzi Node, závislosti
z `node_modules`, databázi a proměnné prostředí. Na notebooku to všechno máš. Na
serveru, u kolegy nebo v CI to všechno musí být znovu a stejně — jinak platí „u mě to
funguje". Tahle lekce ukáže, jak aplikaci zabalit do kontejneru, spustit ji vedle
databáze, postavit před ni HTTPS a vybrat, kde poběží.

> [!REMEMBER]
> **Image je zapečená aplikace i s prostředím, kontejner je proces spuštěný z image. Co není v image nebo v proměnných prostředí, v produkci neexistuje.**

## Image a kontejner

[[image]] je balík souborů: základní systém (třeba Debian), Node, `node_modules`,
tvůj kód a příkaz, kterým se aplikace spouští. Staví se jednou a už se nemění.
[[kontejner]] je běžící proces z image. Z jednoho image pustíš na notebooku, v CI
i na serveru kolik kontejnerů chceš a všechny mají stejné soubory.

Kontejner není virtuální počítač. Nemá vlastní jádro systému, jen oddělený pohled
na soubory, síť a procesy, proto startuje za zlomek sekundy. Z toho plynou dvě
vlastnosti, na které se v provozu naráží:

- **Soubory v kontejneru jsou dočasné.** Co aplikace zapíše do kontejneru, zmizí,
  když se kontejner smaže a nahradí novou verzí. Data, která mají přežít (databáze,
  nahrané soubory), patří do [[svazek|svazku]] (*volume*) — adresáře, který Docker
  drží mimo kontejner.
- **Kontejner řídí Docker.** Spouští ho `docker run` nebo `docker compose up`,
  vypíná `docker stop`: pošle `SIGTERM`, počká 10 sekund a pak `SIGKILL`. Proto se
  hodí korektní ukončení z workshopu.

Základní příkazy:

```sh
docker build -t pujcovna-kol:1.4.0 .      # postaví image podle Dockerfile
docker run -p 8080:3000 pujcovna-kol:1.4.0  # spustí kontejner, port 8080 počítače → 3000 v kontejneru
docker ps                                  # běžící kontejnery
docker logs -f <id>                        # standardní výstup kontejneru = tvoje logy
```

:::check
Aplikace v kontejneru ukládá nahrané fotky kol do adresáře `/app/uploads`. Po nasazení nové verze fotky zmizely. Proč?

### --answer--
Docker při startu adresáře s nahranými soubory maže.

#### --why--
Docker nic nemaže, dokud kontejner běží. Nová verze ale znamená nový kontejner z nového image.

### --correct--
Nová verze běží v novém kontejneru a soubory zapsané do starého kontejneru s ním zanikly.

#### --why--
Zápisy uvnitř kontejneru patří jen tomu kontejneru. Data, která mají přežít, patří do svazku nebo do úložiště mimo server.

### --answer--
Fotky se neuložily do image, protože chybí `COPY uploads`.

#### --why--
Image se staví před nasazením a nahrané fotky vznikají až za běhu. Do image nepatří — patří do svazku.
:::

## Dockerfile pro Node

Image se popisuje souborem `Dockerfile`. Každý řádek je jeden krok a Docker si
výsledek každého kroku pamatuje jako **vrstvu**. Když se soubory pro krok nezměnily,
použije uloženou vrstvu a krok přeskočí.

```dockerfile
FROM node:24-slim
WORKDIR /app

# 1. nejdřív jen seznam závislostí, ať se instalace nepouští při každé změně kódu
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 2. teprve potom kód
COPY . .

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

Proč právě takhle:

- **`FROM node:24-slim`** — konkrétní hlavní verze, ne `node:latest`. Jinak by
  každý build mohl dostat jiný Node. `slim` je menší image bez nástrojů, které
  aplikace nepotřebuje.
- **`package.json` a zámek před kódem.** Změníš jeden řádek v `app.js` a Docker
  použije vrstvu s `node_modules` z minula. Build trvá sekundy, ne minuty.
- **`npm ci`**, ne `npm install`: nainstaluje přesně verze ze zámku
  `package-lock.json`, a když zámek s `package.json` nesedí, skončí chybou.
- **`USER node`** — oficiální image má uživatele `node`. Proces pak neběží jako
  `root`, takže díra v aplikaci nedá útočníkovi celý kontejner.
- **`CMD` v zápisu pole** (*exec form*) spustí přímo `node`, který dostane `SIGTERM`.

:::live node predict
```js
// Dockerfile končí řádkem: CMD node server.js  (bez hranatých závorek)
import { createServer } from 'node:http';

const server = createServer((req, res) => res.end('ok'));
server.listen(3000);

process.on('SIGTERM', () => {
  console.log('Dostal jsem SIGTERM, končím');
  server.close(() => process.exit(0));
});
```
--question-- Kontejner se spustil z image, jehož `CMD` je zapsané bez hranatých závorek. Co se stane při `docker stop`?
--option-- Aplikace vypíše „Dostal jsem SIGTERM, končím" a hned skončí.
--option*-- Nic se nevypíše, `docker stop` čeká 10 sekund a pak proces zabije.
--option-- Docker odmítne kontejner zastavit, dokud aplikace neskončí sama.
--output--
```text
$ time docker stop pujcovna
pujcovna

real    0m10.412s
```
--why-- Zápis bez závorek (*shell form*) spustí `/bin/sh -c "node server.js"`. Signál dostane shell, který ho Node nepředá, takže obsluha se nezavolá a po 10 sekundách přijde `SIGKILL`. Oprava: `CMD ["node", "server.js"]`.
:::

:::check
V Dockerfile je `COPY . .` před `RUN npm ci`. Co se stane s dobou buildu, když změníš jeden řádek v `app.js`?

### --answer--
Nic, Docker instalaci závislostí přeskočí, protože se `package.json` nezměnil.

#### --why--
Docker nesleduje, které soubory krok skutečně použije. Rozhoduje, jestli se změnilo něco z toho, co předchozí `COPY` zkopíroval.

### --correct--
`npm ci` poběží znovu, protože se změnila vrstva `COPY . .` před ním.

#### --why--
Změna ve vrstvě zneplatní všechny vrstvy za ní. Proto se nejdřív kopíruje jen `package.json` se zámkem, instalují se závislosti a kód přijde až potom.

### --answer--
Build selže, protože `npm ci` neumí běžet po `COPY . .`.

#### --why--
`npm ci` běží v jakémkoli pořadí. Pořadí rozhoduje jen o tom, jak často se vrstvy dají použít znovu.
:::

## Vícefázový build

Aplikace v TypeScriptu nebo s frontendem z Vite se před spuštěním musí sestavit. Na
sestavení potřebuješ vývojové závislosti (`typescript`, `vite`), ke spuštění už ne.
[[vícefázový build]] (*multi-stage build*) to rozdělí do dvou image v jednom souboru:

```dockerfile
# fáze 1: sestavení, se všemi závislostmi
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# fáze 2: to, co poběží — jen produkční závislosti a výsledek buildu
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]
```

Výsledný image obsahuje jen poslední fázi. Zdrojáky, kompilátor ani vývojové
balíčky v něm nejsou: image je menší, rychleji se stahuje a útočník v něm najde
méně nástrojů.

:::check
Po převedení na vícefázový build aplikace v kontejneru padá: `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'zod'`. Build prošel. Kde je nejspíš chyba?

### --answer--
`zod` chybí ve fázi `build`, proto se nezkompiloval.

#### --why--
Fáze `build` instaluje všechny závislosti a build prošel. Hláška přichází až za běhu z výsledného image.

### --correct--
`zod` je v `devDependencies`, takže ho `npm ci --omit=dev` do výsledného image nenainstaloval.

#### --why--
Co aplikace potřebuje za běhu, patří do `dependencies`. `devDependencies` jsou jen pro build a testy.

### --answer--
`COPY --from=build` nezkopíroval `node_modules`.

#### --why--
Kopírovat `node_modules` z fáze build nechceš — byly by v nich i vývojové balíčky. Výsledná fáze si produkční závislosti instaluje sama.
:::

## `.dockerignore`

`COPY . .` zkopíruje do image všechno ze složky projektu. Soubor `.dockerignore`
říká, co ne:

```text
node_modules
dist
.git
.env
*.log
```

- `node_modules` a `dist` z notebooku do image nepatří: závislosti i build vzniknou
  uvnitř, pro Linux v kontejneru.
- `.git` je velký a nic z něj aplikace nepotřebuje.
- `.env` s tajemstvími by se zapekl do image. Kdo image stáhne, přečte si ho.

> [!PITFALL]
> Bez `.dockerignore` je `.env` s heslem k databázi součástí image a každé vrstvy za
> `COPY . .`. Pozdější `RUN rm .env` nepomůže, soubor zůstává ve starší vrstvě.
> Příznak neuvidíš — dokud někdo image nestáhne. Oprava: `.env` do `.dockerignore`
> a tajemství předávat jako proměnné prostředí při spuštění.

:::check
Proč nepomůže v Dockerfile za `COPY . .` přidat řádek `RUN rm .env`?

### --expected--
soubor zůstane v předchozí vrstvě

### --accept--
zůstane ve starší vrstvě
zůstane ve vrstvě COPY
je ve vrstvě
vrstvy

### --why--
Každá vrstva image se ukládá zvlášť. `RUN rm` přidá novou vrstvu, ve které soubor není, ale vrstva z `COPY` s ním zůstává a jde z image vytáhnout.
:::

## `compose.yaml`: aplikace a databáze

Aplikace potřebuje databázi. Spouštět dva kontejnery ručně a propojovat je je
otrava, proto se popisují v souboru `compose.yaml` a spouští příkazem
`docker compose up --build`:

```yaml
services:
  app:
    build: .
    ports:
      - "8080:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://pujcovna:${POSTGRES_PASSWORD}@db:5432/pujcovna
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:17
    environment:
      POSTGRES_USER: pujcovna
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: pujcovna
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pujcovna"]
      interval: 5s
      retries: 10

volumes:
  db-data:
```

- **Služby se vidí podle jména.** Aplikace se k databázi připojí na adresu `db`,
  Compose ji přeloží na kontejner databáze.
- **`ports: "8080:3000"`** — port počítače vlevo, port v kontejneru vpravo. Databáze
  port ven nevystavuje, aplikace se k ní dostane uvnitř sítě Compose.
- **`${POSTGRES_PASSWORD}`** — Compose hodnotu vezme z proměnné prostředí nebo ze
  souboru `.env` vedle `compose.yaml`. Heslo v souboru v Gitu není.
- **Svazek `db-data`** drží data databáze mimo kontejner. `docker compose down` ho
  nesmaže, `docker compose down -v` ano.
- **`depends_on` s `service_healthy`** spustí aplikaci až poté, co health check
  databáze projde. Bez podmínky Compose čeká jen na start kontejneru, ne na
  připravenou databázi.

:::live node predict
```js
// Aplikace v kontejneru "app", nastavení z .env zkopírované z notebooku:
// DATABASE_URL=postgres://pujcovna:heslo@localhost:5432/pujcovna
import { connect } from 'node:net';

const url = new URL(process.env.DATABASE_URL);
const socket = connect(Number(url.port), url.hostname);
socket.on('connect', () => console.log('Databáze odpovídá'));
socket.on('error', (error) => console.log(error.message));
```
--question-- Databáze běží v kontejneru `db` ze stejného `compose.yaml`. Co vypíše aplikace?
--option-- Databáze odpovídá
--option*-- connect ECONNREFUSED 127.0.0.1:5432
--option-- getaddrinfo ENOTFOUND localhost
--output--
```text
connect ECONNREFUSED 127.0.0.1:5432
```
--why-- `localhost` v kontejneru je ten kontejner sám, ne tvůj počítač ani jiný kontejner. Na portu 5432 v kontejneru aplikace nic neposlouchá. Databáze je pod jménem služby: `@db:5432`.
:::

:::check
V `compose.yaml` má aplikace `ports: "8080:3000"`. Na kterou adresu zadáš v prohlížeči na svém počítači?

### --expected--
http://localhost:8080

### --accept--
localhost:8080
http://127.0.0.1:8080
127.0.0.1:8080

### --why--
Levé číslo je port počítače, pravé port uvnitř kontejneru. Aplikace v kontejneru poslouchá na 3000, zvenku je vidět na 8080.
:::

## Reverse proxy a HTTPS

Aplikaci na internetu nevystavuješ přímo. Před ní stojí [[reverse proxy]]: server,
který přijme požadavek od prohlížeče a přepošle ho aplikaci. Stará se o věci, které
nechceš psát v Node:

- **HTTPS** — certifikát, šifrování a přesměrování z `http://` na `https://`,
- více aplikací na jednom serveru podle domény (`pujcovna-kol.cz`, `api.pujcovna-kol.cz`),
- komprese, statické soubory, limity velikosti požadavků.

Nejjednodušší je **Caddy**: certifikát od Let's Encrypt si pro doménu vyřídí
a obnovuje sám. Celý `Caddyfile`:

```text
pujcovna-kol.cz {
    reverse_proxy app:3000
}
```

V `compose.yaml` pak ven vystavuje porty `80` a `443` jen Caddy, aplikace žádné.
Aby Caddy certifikát dostal, musí DNS záznam domény ukazovat na server a porty 80
a 443 musí být otevřené.

Aplikace za proxy vidí jako adresu klienta adresu proxy. Skutečnou IP a protokol
dostane v hlavičkách `X-Forwarded-For` a `X-Forwarded-Proto`. Věřit jim smí, jen
když požadavky opravdu chodí přes tvoji proxy — jinak si je podvrhne kdokoli.

> [!PITFALL]
> **Caddy bez svazku na `/data`.** Certifikáty se ukládají do kontejneru a po každém
> restartu je Caddy žádá znovu. Let's Encrypt po několika pokusech vrátí
> `too many certificates already issued` a web zůstane bez HTTPS. Oprava: svazek
> `caddy-data:/data`.

:::check
Proč v `compose.yaml` s Caddy aplikace nemá žádné `ports`?

### --answer--
Protože Caddy port aplikace přesměruje sám, `ports` by se s ním praly.

#### --why--
Nepraly by, jen by aplikace byla dostupná i napřímo. A právě tomu se chceš vyhnout.

### --correct--
Aplikace má být dostupná jen přes proxy s HTTPS; Caddy se k ní dostane uvnitř sítě Compose.

#### --why--
Vystavený port aplikace by šel obejít bez šifrování a bez limitů proxy. Uvnitř sítě Compose se Caddy připojí na `app:3000` i bez `ports`.

### --answer--
Bez `ports` aplikace poslouchá rychleji.

#### --why--
Na rychlosti aplikace `ports` nic nemění. Rozhoduje o tom, co je vidět zvenku.
:::

## VPS, nebo platforma

Kde aplikace poběží, je rozhodnutí mezi pohodlím a kontrolou:

| | platforma | VPS (vlastní virtuální server) |
|---|---|---|
| příklady | Vercel, Netlify, Fly.io, Railway, Render | Hetzner, DigitalOcean, OVH |
| co dodáš | repozitář nebo image | celý server: systém, Docker, proxy, zálohy |
| HTTPS, logy, nasazení | hotové | nastavíš sám |
| cena na začátku | často zdarma, pak roste s provozem | pevná, pár set Kč měsíčně |
| kdo řeší bezpečnostní aktualizace | platforma | ty |

Rozdíly mezi platformami:

- **Vercel a Netlify** jsou stavěné na frontend a serverové funkce: kód neběží jako
  stálý proces, ale spustí se na požadavek. Next.js na Vercelu je nejpohodlnější
  varianta. Dlouhé úlohy, WebSockety a SQLite v souboru tam nefungují.
- **Fly.io, Railway a Render** spustí tvůj image nebo Node aplikaci jako stálý proces
  a přidají spravovanou databázi. Tady se uplatní všechno z workshopu.
- **VPS** je nejlevnější při stálém provozu a naučí tě nejvíc, ale výpadek i útok
  jsou tvoje starost. Postup je v nepovinné lekci
  [Vlastní Linux server](see:nasazeni-provoz/linux-server#sluzba-v-systemd).

Pro první projekt do portfolia je rozumná platforma. Image z Dockerfile ti zůstane,
takže se k VPS nebo jiné platformě přesuneš bez přepisování aplikace.

:::check
API půjčovny kol běží jako stálý Node proces, drží spojení s databází a posílá stav výpůjček přes WebSocket. Který typ hostingu se nehodí?

### --answer--
Platforma, která spouští image jako stálý proces (Fly.io, Railway, Render).

#### --why--
Stálý proces s WebSocketem je přesně to, co tyhle platformy spouští. Hodí se.

### --correct--
Hosting serverových funkcí, které se spouští jen na požadavek (Vercel, Netlify Functions).

#### --why--
Funkce po odpovědi skončí, takže neudrží WebSocket ani stálé spojení s databází.

### --answer--
Vlastní VPS s Dockerem.

#### --why--
Na VPS poběží cokoli, co spustíš v kontejneru, včetně WebSocketů. Práce s ním je větší, ale technicky se hodí.
:::

## Zálohy

Svazek s databází není záloha. Smazaný svazek, rozbitý disk, `DELETE` bez `WHERE`
nebo napadený server vezmou data i se svazkem. Záloha je **kopie mimo server**,
ze které umíš data obnovit.

- **Pravidelný výpis databáze** — u PostgreSQL `pg_dump`, u SQLite `sqlite3 data.db
  ".backup zaloha.db"`. Běží automaticky, třeba každou noc.
- **Jinde než data** — jiný poskytovatel nebo úložiště (S3, Backblaze B2). Pravidlo
  3-2-1: tři kopie, dvě různá média, jedna mimo místo.
- **Zkoušená obnova** — záloha, ze které jsi nikdy nic neobnovil, je jen naděje.
  Jednou za čas obnov zálohu do zkušební databáze a pusť proti ní aplikaci.

Spravované databáze na platformách zálohy dělají samy. Zjisti si, jak dlouho je
drží a jak se z nich obnovuje — dřív, než je budeš potřebovat.

:::check
Databáze půjčovny běží v kontejneru se svazkem `db-data` na jednom VPS. Proč to samo o sobě není záloha?

### --answer--
Protože svazek se při `docker compose down` smaže.

#### --why--
Bez přepínače `-v` svazek `down` přežije. Problém je jinde: data jsou pořád jen na jednom místě.

### --correct--
Data existují jen jednou, na tom samém serveru; porucha disku, útok nebo omylem smazaná tabulka je vezme celá.

#### --why--
Záloha je kopie jinde, ze které jde obnovit. Svazek jen přežije restart kontejneru.

### --answer--
Protože PostgreSQL do svazku zapisuje v nečitelném formátu.

#### --why--
Formát souborů nehraje roli. I čitelná data na jediném disku zmizí s tím diskem.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Aplikace v kontejneru poslouchá jen na `127.0.0.1`.** `docker run -p 8080:3000`
> projde, ale `curl localhost:8080` vrátí `curl: (56) Recv failure: Connection reset by peer`
> (podle verze Dockeru i `curl: (52) Empty reply from server`).
> Port počítače míří na síťové rozhraní kontejneru, kam aplikace neposlouchá.
> Oprava: `server.listen(port)` bez adresy (nebo `0.0.0.0`).

> [!PITFALL]
> **`localhost` v `DATABASE_URL` uvnitř Compose.** Hláška `connect ECONNREFUSED 127.0.0.1:5432`.
> Oprava: jméno služby, `@db:5432`.

> [!PITFALL]
> **`CMD npm start` nebo `CMD node server.js` bez závorek.** Signál dostane npm
> nebo shell, ne Node. `docker stop` trvá pokaždé 10 sekund a rozpracované
> požadavky se utnou. Oprava: `CMD ["node", "server.js"]`.

> [!PITFALL]
> **Node jako proces číslo 1 bez obsluhy `SIGTERM`.** V kontejneru je aplikace první
> proces a jádro systému mu signály bez vlastní obsluhy nedoručí. `docker stop` pak
> čeká 10 sekund. Oprava: vlastní obsluha `SIGTERM` jako ve workshopu, nebo
> `init: true` v `compose.yaml`, který před Node postaví malý správce procesů.

> [!PITFALL]
> **`node:latest` ve `FROM`.** Build z pondělí a z pátku může mít jinou hlavní verzi
> Node a nová verze rozbije závislost. Oprava: pevná hlavní verze, `node:24-slim`.

:::check
Po `docker compose up` jde `curl localhost:8080` a vrací `Connection reset by peer`. V logu kontejneru je `Server poslouchá na 127.0.0.1:3000`. Co opravíš?

### --answer--
Mapování portů na `"3000:3000"`.

#### --why--
Mapování `8080:3000` je v pořádku, míří na port 3000 v kontejneru. Problém je, na které adrese aplikace poslouchá.

### --correct--
Aplikace má poslouchat na všech rozhraních, ne jen na `127.0.0.1`.

#### --why--
`127.0.0.1` v kontejneru je dostupné jen zevnitř kontejneru. Provoz z mapovaného portu přichází přes síťové rozhraní kontejneru.

### --answer--
Přidat `EXPOSE 3000` do Dockerfile.

#### --why--
`EXPOSE` je jen dokumentace, který port image používá. Na tom, kam aplikace poslouchá, nic nezmění.
:::

## Kde to najdeš v MDN

- [Proxy servers and tunneling](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Proxy_servers_and_tunneling) — co je reverse proxy a jak předává požadavky.
- [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For) — jak aplikace za proxy zjistí adresu klienta a proč hlavičce nevěřit bez proxy.
- [Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security) — hlavička, kterou web řekne prohlížeči, ať ho otevírá jen přes HTTPS.
- Mimo MDN: v dokumentaci Dockeru hledej „Multi-stage builds" a „Dockerfile reference" (`CMD`, exec form), v dokumentaci Caddy „Automatic HTTPS".

# --questions--

## --question--

V Dockerfile je řádek `COPY package.json package-lock.json ./` před `RUN npm ci`. Kolega ho smaže, protože „`COPY . .` stejně zkopíruje všechno". Build funguje. Co se zhorší?

### --expected--
build bude pomalejší

### --accept--
pomalejší build
npm ci poběží při každé změně kódu
doba buildu
rychlost buildu
cache

### --why--
Bez samostatného kopírování `package.json` se vrstva s `npm ci` zneplatní při každé změně jakéhokoli souboru a závislosti se instalují pokaždé znovu.

### --see--
nasazeni-provoz/kontejnery-a-servery#dockerfile-pro-node

## --question--

Jaké klíčové slovo v druhém řádku `FROM` pojmenuje fázi, ze které pak kopíruješ přes `COPY --from=…`? Napiš ho.

### --expected-- ignore-case
AS

### --why--
`FROM node:24-slim AS build` pojmenuje fázi `build`. Výsledný image vznikne z poslední fáze a z předchozích si bere jen to, co zkopíruješ.

### --see--
nasazeni-provoz/kontejnery-a-servery#vicefazovy-build

## --question--

V `compose.yaml` má služba aplikace `depends_on: [db]` bez podmínky. Aplikace při prvním spuštění občas spadne na `ECONNREFUSED` k databázi, po restartu už běží. Proč?

### --answer--
Compose spouští služby v náhodném pořadí.

#### --why--
`depends_on` pořadí startu dodrží: databázový kontejner se spustí dřív. Jde o to, na co přesně Compose čeká.

### --correct--
Compose čeká jen na spuštění kontejneru databáze, ne na to, až databáze přijímá spojení.

#### --why--
PostgreSQL po startu kontejneru ještě pár sekund připravuje data. `condition: service_healthy` s health checkem databáze počká, až opravdu odpovídá.

### --answer--
Aplikace se připojuje přes `localhost` místo `db`.

#### --why--
S `localhost` by spojení selhalo vždycky, ne jen občas při prvním startu.

### --see--
nasazeni-provoz/kontejnery-a-servery#compose-yaml-aplikace-a-databaze
