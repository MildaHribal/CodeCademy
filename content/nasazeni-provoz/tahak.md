Co musí aplikace umět, aby ji šlo nasadit, a co k tomu patří kolem: logy, obraz,
automat a server.

## Vývoj a produkce

| | vývoj | produkce |
|---|---|---|
| kdo spouští a vypíná | ty, Ctrl+C | Docker, systemd nebo platforma |
| data | pokusná | skutečná, zálohovaná |
| chyby | vidíš v terminálu | musíš je najít v lozích |
| nastavení | výchozí hodnoty | proměnné prostředí od hostingu |

```sh
NODE_ENV=production PORT=8080 node server.js
```

`NODE_ENV=production` říká knihovnám „optimalizuj pro ostrý provoz", ne *kde* běžíš.
Testovací server (*staging*) má mít `production` taky, jinak testuješ jinou aplikaci,
než nasadíš; na rozlišení prostředí si zaveď vlastní proměnnou (`APP_ENV=staging`).

## Konfigurace z prostředí

```js
// config.js — všechno, co se mezi prostředími liší, na jednom místě
export function loadConfig(env) {
  const isProduction = env.NODE_ENV === 'production';
  if (isProduction && !env.DATABASE_URL) {
    throw new Error('Chybí proměnná prostředí DATABASE_URL.');
  }
  return {
    port: Number(env.PORT ?? 3000),
    databaseUrl: env.DATABASE_URL ?? 'postgres://localhost:5432/eshop_dev',
  };
}
```

Chybějící povinná hodnota shodí aplikaci **hned při startu** ([[rychlé selhání]]):
nasazení se zastaví, health check neprojde a stará verze běží dál.

**Proměnné prostředí jsou vždy řetězce.** `env.PORT + 1` dá `'80801'` a `'false'` je
pravdivá hodnota. Převáděj je na jednom místě: `Number(env.RETRIES ?? 3)`,
`env.DEBUG === 'true'`. Pozor i na `env.RETRIES || 3`, kde `'0'` projde jako řetězec.

## `.env` a tajemství

```sh
# .env — jen na tvém počítači, v .gitignore
DATABASE_URL=postgres://eshop:tajne-heslo@localhost:5432/eshop_dev
PAYMENT_API_KEY=sk_test_51Hq…
```

```sh
node --env-file=.env server.js     # Node soubor načte sám, bez balíčku
```

Do repozitáře patří `.env.example` se jmény proměnných a vymyšlenými hodnotami.
Na serveru `.env` není — [[tajemství]] zadáš do nastavení hostingu nebo CI. Když
tajemství uteče (commit, snímek, log), nestačí ho smazat: **zneplatni ho a vydej nové**.
A tajemství v kódu frontendu není tajemství — všechno, co dorazí do prohlížeče, si
každý přečte v DevTools.

## Strukturované logy

```json
{"time":"2026-09-14T19:02:11.481Z","level":"info","msg":"Objednávka uložena","orderId":5812,"durationMs":312,"requestId":"a3f1c9e2"}
```

- **Jeden řádek = jedna událost.** Víceřádkový stack trace se v nástroji rozpadne;
  patří do jednoho pole jako řetězec.
- **`msg` je stálý text, proměnné jdou do polí.** Podle stálé zprávy spočítáš, kolikrát
  se událost stala, podle pole najdeš jednu konkrétní.
- **Čas v UTC ve formátu ISO** (`new Date().toISOString()`).
- **Logy jdou na standardní výstup**, sbírá je Docker, platforma nebo `journalctl`.

| [[úroveň logu]] | kdy |
|---|---|
| `debug` | podrobnosti pro ladění, v produkci vypnuté |
| `info` | běžné události, které chceš vidět |
| `warn` | něco je špatně, ale aplikace si poradila |
| `error` | selhalo něco na straně aplikace (typicky odpovědi 5xx) |

Minimální úroveň ber z prostředí (`LOG_LEVEL=info`). Hlavní smysl úrovní je upozornění:
když je `error` i špatně zadané heslo uživatele, zpráva chodí pořád a za týden ji nikdo
nečte.

## Request id a hlášení chyb

```js
import { randomUUID } from 'node:crypto';

const requestId = req.headers['x-request-id'] ?? randomUUID();
res.setHeader('X-Request-Id', requestId);
```

```js
handleRequest(req, res).catch((error) => {
  logger.error('Neočekávaná chyba', { requestId, error: error.stack });
  if (!res.headersSent) {
    sendJson(res, 500, { error: 'Na serveru se něco pokazilo.', requestId });
  }
});
```

[[request id]] se převezme z hlavičky (aby ho měly obě služby stejné) a vrátí se
v odpovědi — zákazník ho nahlásí podpoře a ty podle něj najdeš ten jeden požadavek.
Ven jde jen id, nikdy text výjimky ani stack trace.

**Do logu nepatří:** hesla a tajemství (`Authorization`, cookie se session, API klíče),
tokeny v adrese (loguj `pathname`, ne celé `req.url`), celá těla požadavků, osobní údaje
navíc (místo e-mailu stačí `userId`). Citlivé klíče nech loggeru přepsat na `[SKRYTO]`.

Metriky doplní logy o „kolik a jak rychle": podíl odpovědí 5xx, 95. percentil doby
odpovědi (ne průměr), paměť a CPU. Pro začátek stačí uptime monitoring, který se každou
minutu zvenku ptá na `/health`.

## Health check a korektní ukončení

```js
if (req.method === 'GET' && pathname === '/health') {
  try {
    db.prepare('SELECT 1').get();
    return sendJson(res, 200, { status: 'ok' });
  } catch {
    return sendJson(res, 503, { status: 'error' });
  }
}
```

[[health check]] ověřuje, co je v moci aplikace (proces, vlastní databáze). Volání cizích
API sem nepatří — výpadek brány by restartoval zdravé kontejnery. Odpověď nesmí
prozradit verze knihoven, adresu databáze ani text chyby.

```js
process.on('SIGTERM', () => {
  logger.info('Dostal jsem SIGTERM, končím');
  server.close(() => {      // 1. žádná nová spojení, dokonči rozpracovaná
    db.close();             // 2. až potom databáze
    process.exit(0);        // 3. kód 0 = v pořádku
  });
});
```

Správce procesů pošle `SIGTERM`, počká (Docker 10 s) a pak přijde `SIGKILL`, který se
nedá zachytit. Bez vlastní obsluhy Node skončí okamžitě a rozpracovaný požadavek se
utne. `server.close` čeká i na nečinná **keep-alive spojení**, proto během ukončování
posílej `Connection: close` a nastav si časovač, který proces po limitu ukončí sám.

## Dockerfile

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

| řádek | proč |
|---|---|
| `FROM node:24-slim` | pevná hlavní verze, ne `node:latest` |
| zámek před kódem | změna v `app.js` nezneplatní vrstvu s `node_modules` |
| `npm ci --omit=dev` | přesně verze ze zámku, bez vývojových závislostí |
| `USER node` | proces neběží jako `root` |
| `CMD` v zápisu pole | signál dostane přímo Node, ne shell |

[[vícefázový build]] pro aplikaci, která se sestavuje:

```dockerfile
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]
```

Výsledný image obsahuje jen poslední fázi — bez zdrojáků a kompilátoru. Co aplikace
potřebuje za běhu, musí být v `dependencies`, ne v `devDependencies`.

`.dockerignore` (bez něj se `.env` zapeče do vrstvy a `RUN rm .env` už to nespraví):

```text
node_modules
dist
.git
.env
*.log
```

```sh
docker build -t pujcovna-kol:1.4.0 .
docker run -p 8080:3000 pujcovna-kol:1.4.0    # port počítače : port v kontejneru
docker logs -f <id>
```

## `compose.yaml`

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

- **Služby se vidí podle jména** — databáze je na adrese `db`, ne `localhost`.
- **[[svazek]] `db-data`** drží data mimo kontejner. Zápisy dovnitř kontejneru zmizí
  s ním; `docker compose down` svazek nechá, `down -v` ho smaže.
- **`condition: service_healthy`** počká, až databáze opravdu odpovídá, ne jen na start
  kontejneru.

Před aplikací stojí [[reverse proxy]] (Caddy si certifikát od Let's Encrypt vyřídí sám):

```text
pujcovna-kol.cz {
    reverse_proxy app:3000
}
```

Ven vystavuje porty 80 a 443 jen Caddy, aplikace žádné. Caddy potřebuje svazek na
`/data`, jinak po každém restartu žádá certifikát znovu.

## CI/CD

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build

  deploy:
    needs: check
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: curl --fail -X POST "$DEPLOY_HOOK_URL"
        env:
          DEPLOY_HOOK_URL: ${{ secrets.DEPLOY_HOOK_URL }}
```

Kroky jdou od nejrychlejší kontroly po nejpomalejší, protože první chyba úlohu zastaví.
**CI rozhoduje jen podle návratového kódu**, ne podle výpisu: kontrolní skript musí po
nalezení chyby nastavit `process.exitCode = 1`.

| | `npm install` | `npm ci` |
|---|---|---|
| zámek `package-lock.json` | může ho změnit | musí sedět, jinak skončí chybou |
| verze balíčků | v rozsahu z `package.json` | přesně ze zámku |
| `node_modules` | doplní | smaže a nainstaluje znovu |

Tajemství patří do **Settings → Secrets and variables → Actions**; maskování ve výpisu
obejde zakódovaná hodnota, takže se nevypisují vůbec. Pull requesty z cizích forků
tajemství nedostanou. Bez **ochrany větve** se dá sloučit i červený křížek.

[[náhledové prostředí]] pro pull request dostane vlastní data a vlastní testovací klíče,
nikdy produkční databázi, a po sloučení zaniká.

## Rollback a změny schématu

[[rollback]] musí trvat minuty: image v registru označuj otiskem commitu
(`pujcovna-kol:3f9c2e1`), ne jen `latest`. **Nejdřív vrať, pak hledej.**

Co vrátit nejde, je databáze. [[dvoufázová změna schématu]] při přejmenování sloupce:

1. **Rozšíření.** Migrace přidá `full_name` a doplní data; aplikace zapisuje do obou
   sloupců, čte ze starého.
2. **Přepnutí.** Aplikace čte z `full_name`, dál zapisuje do obou.
3. **Úklid.** Aplikace přestane zapisovat do `customer_name` a migrace sloupec smaže.

V každém okamžiku funguje aktuální i předchozí verze. Samotné odstranění sloupce, který
se přestal používat, zvládnou dvě nasazení.

## Vlastní server

```ini
# /etc/systemd/system/pujcovna.service
[Unit]
Description=API půjčovny kol
After=network.target

[Service]
User=pujcovna
WorkingDirectory=/srv/pujcovna
EnvironmentFile=/etc/pujcovna/env
ExecStart=/usr/bin/node server.js
Restart=on-failure
TimeoutStopSec=15

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload            # po každé změně souboru služby
sudo systemctl enable --now pujcovna    # spusť teď i po restartu serveru
journalctl -u pujcovna -f               # logy služby, živě
```

```sh
sudo ufw allow OpenSSH                  # VŽDY před ufw enable
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw enable
```

Přihlašuj se klíčem (`ssh-keygen -t ed25519`, `ssh-copy-id`), vypni hesla a přihlášení
roota — a ověř si nové přihlášení v druhém terminálu, než zavřeš první. Bezpečnostní
opravy řeší `unattended-upgrades`, jádro ale začne platit až po restartu.

Aplikace na serveru bez Dockeru **má** poslouchat jen na `127.0.0.1` (Caddy je na témže
stroji); v kontejneru je to přesně naopak.

## Zálohy

Svazek ani snapshot u téhož poskytovatele není záloha. Minimum: **pravidelný výpis**
(`pg_dump`, u SQLite `sqlite3 data.db ".backup zaloha.db"` — `cp` může zkopírovat
rozepsaný stav), **kopie jinde** (S3, Backblaze, `restic`/`rclone`, pravidlo 3-2-1)
a **zkoušená obnova** jednou za čas do zkušební databáze.

## Před nasazením

- Port, adresa databáze i tajemství se čtou z prostředí, nic není v kódu.
- `.env` je v `.gitignore` i v `.dockerignore`, v repozitáři je `.env.example`.
- `/health` odpovídá 200 a ověřuje databázi.
- Obsluha `SIGTERM` s pojistným časovačem.
- Logy jsou JSON s request id, bez hesel a osobních údajů.
- Image má pevnou verzi základu, `USER node` a `CMD` v zápisu pole.
- CI pouští lint, typy, testy a build; do `main` jde jen zelený pull request.
- Nasazená verze je označená otiskem commitu a umíš se vrátit k předchozí.
- Záloha běží automaticky a obnova je vyzkoušená.

## Pasti a časté chyby

- **Port natvrdo.** Platforma posílá provoz na port z `PORT`; v logu uvidíš
  `Application failed to respond`. Oprava: `Number(process.env.PORT ?? 3000)`.
- **Naslouchání jen na `127.0.0.1` v kontejneru.** `curl` vrací
  `Empty reply from server` nebo `Connection reset by peer`. Oprava: adresu vynech.
- **`localhost` v `DATABASE_URL` uvnitř Compose.** `connect ECONNREFUSED 127.0.0.1:5432`.
  Oprava: jméno služby, `@db:5432`.
- **`CMD npm start` nebo `CMD` bez závorek.** Signál dostane npm nebo shell, `docker stop`
  trvá pokaždé 10 sekund. Totéž platí pro `ExecStart` v systemd.
- **`JSON.stringify` s objektem `Error`** zapíše `"error":{}` — `message` ani `stack`
  nejsou vyčíslitelné. Loguj `error.stack` jako řetězec.
- **Všechno jako `error`.** Upozornění chodí pořád a tým je začne ignorovat.
- **`npm install` v CI** místo `npm ci`: testuješ jiné verze, než máš v zámku.
- **Kontrolní skript, který chybu jen vypíše.** Krok je zelený. Oprava:
  `process.exitCode = 1`.
- **Image jen se značkou `latest`.** Nemáš se kam vrátit.
- **Migrace, která maže nebo přejmenovává v jednom kroku s novým kódem.** Stará verze
  padá na `no such column` a rollback nejde.
- **`ufw enable` před `allow OpenSSH`** a **vypnutá hesla bez ověřeného klíče** — obojí
  končí u nouzové konzole poskytovatele.
- **Docker obchází `ufw`.** Publikovaný port je dostupný z internetu, i když ho firewall
  „blokuje". Oprava: porty aplikace nepublikovat, nebo jen na `127.0.0.1:3000:3000`.
- **Node z `nvm` v `ExecStart`.** `status=203/EXEC`: systemd nevidí `PATH` tvého shellu.
  Oprava: celá cesta z `which node`.
