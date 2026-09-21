# PostgreSQL v Dockeru

:::check pretest
Rezervační API běží nad SQLite v souboru `data/app.db`. Nasadíš ho na dva servery za load balancerem, každý se svojí kopií toho souboru. Co se stane s rezervacemi?

### --answer--
Nic zvláštního, SQLite si soubory mezi servery sama srovná.

#### --why--
SQLite je knihovna, ne server. O žádném druhém stroji neví a nic nikam neposílá.

### --correct--
Každý server bude mít jiná data — rezervace uvidíš podle toho, na který server tě load balancer pustí.

### --answer--
Druhý server se k souboru vůbec nepřipojí a spadne.

#### --why--
Spustí se v pohodě. Má přece vlastní soubor — právě to je ten problém.
:::

SQLite je skvělá, dokud aplikace běží na jednom stroji. Jakmile má běžet víc instancí,
má k datům sahat víc služeb, nebo je potřeba pořádná záloha za provozu, přichází na
řadu databázový **server**. V české praxi je jich pár, ale PostgreSQL je mezi nimi
bezpečná výchozí volba a je zdarma.

Instalovat ho na notebook nemusíš — Docker ho spustí jedním souborem a stejně ho pak
spustí i kolegyně a CI.

> [!REMEMBER]
> **Ze SQLite na PostgreSQL se nestěhuje aplikace, ale schéma a připojení.** Dotazy
> zůstanou z devadesáti procent stejné; změní se typy sloupců, zápis parametrů a to,
> že databáze má teď adresu.

## Proč přejít ze SQLite

| co potřebuješ | SQLite | PostgreSQL |
|---|---|---|
| víc instancí aplikace nad týmiž daty | ne (soubor je lokální) | ano |
| víc zapisujících najednou | jen jeden zápis v čase | ano |
| přísné typy sloupců | jen s `STRICT` | vždy |
| `boolean`, `date`, `timestamptz`, `jsonb` | chybí, obchází se | vestavěné |
| záloha za provozu, replikace, role | omezeně | ano |

A naopak: dokud píšeš jednouživatelský nástroj, desktopovou aplikaci nebo prototyp,
je SQLite lepší volba. Nemá co spouštět, zálohuje se zkopírováním souboru a je rychlá.

> [!NOTE]
> Docker sám se učí až v sekci Nasazení a provoz. Tady ho potřebuješ jen jako způsob,
> jak databázi spustit — stačí ti dva příkazy a jeden soubor.

:::check
Aplikace poběží na jednom malém serveru, zapisuje do ní jen ona sama a dat je pár set megabajtů. Vyplatí se přechod na PostgreSQL?

### --answer--
Ano, PostgreSQL je vždycky rychlejší než SQLite.

#### --why--
U dotazu z téhož stroje bývá SQLite naopak rychlejší — nemá síťovou cestu tam a zpět.

### --correct--
Nemusí. SQLite tenhle případ zvládne a nemá co provozovat.

#### --why--
Přechod se vyplatí kvůli víc instancím, víc zapisujícím nebo provozním nárokům, ne sám o sobě.

### --answer--
Ano, protože SQLite neumí cizí klíče ani transakce.

#### --why--
Umí obojí. Rozdíly jsou v typech, souběžném zápisu a provozu.
:::

## Postgres v Dockeru: compose.yaml

Celá databáze se popíše jedním souborem v kořeni projektu:

```yaml
# compose.yaml
services:
  db:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: rezervace
      POSTGRES_USER: rezervace
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rezervace -d rezervace"]
      interval: 5s
      retries: 10

volumes:
  pgdata:
```

Čtyři věci v něm stojí za povšimnutí:

- **`postgres:17-alpine`**, ne `postgres:latest`. Pevná hlavní verze znamená, že se
  databáze za půl roku sama nepřehoupne na jinou.
- **`volumes: pgdata`** je pojmenované úložiště. Bez něj zmizí data ve chvíli, kdy
  kontejner smažeš — a to se při ladění stane rychle.
- **`${POSTGRES_PASSWORD}`** se vezme ze souboru `.env` vedle. Heslo do `compose.yaml`
  nepatří, protože ten soubor jde do gitu.
- **`healthcheck`** dá ostatním službám vědět, že databáze opravdu přijímá spojení.
  Postgres po startu chvíli není k dispozici, a aplikace by na něj narazila.

Spuštění a zastavení:

```bash
docker compose up -d      # nastartuje databázi na pozadí
docker compose ps         # ukáže, jestli je „healthy"
docker compose logs -f db # co říká databáze
docker compose down       # zastaví (data ve svazku zůstanou)
```

:::check
Smažeš kontejner s databází a spustíš ho znovu. Co v `compose.yaml` rozhoduje o tom, jestli tam data budou i po tom?

### --expected-- ignore-case
volumes

### --accept--
pojmenovaný svazek
volume
svazek

### --why--
Bez pojmenovaného svazku žijí data uvnitř kontejneru a mizí spolu s ním. Svazek je
oddělené úložiště, které kontejner přežije.
:::

## Připojení a soubor .env

Aplikace se k databázi připojuje přes jednu proměnnou prostředí:

```bash
# .env — do gitu NEPATŘÍ
POSTGRES_PASSWORD=tajne-heslo-jen-pro-vyvoj
DATABASE_URL=postgres://rezervace:tajne-heslo-jen-pro-vyvoj@localhost:5432/rezervace
```

```bash
# .env.example — do gitu PATŘÍ, hodnoty jsou zástupné
POSTGRES_PASSWORD=zmen-me
DATABASE_URL=postgres://rezervace:zmen-me@localhost:5432/rezervace
```

Ten dlouhý řetězec se jmenuje [[connection string]] a skládá se vždy stejně:

```
postgres:// uživatel : heslo @ host : port / jméno-databáze
```

Dvojice `.env` a `.env.example` je běžný zvyk: první má skutečné hodnoty a je
v `.gitignore`, druhý dokumentuje, které proměnné jsou potřeba. Nový člověk v týmu si
`.env.example` zkopíruje na `.env` a doplní si vlastní hesla.

> [!PITFALL]
> **Heslo se speciálním znakem rozbije adresu.** Znaky `@`, `/`, `:` a `#` v hesle
> connection string rozdělí na nesprávných místech a chyba zní nesrozumitelně
> (`password authentication failed`). Oprava: heslo zakóduj (`encodeURIComponent`),
> nebo do něj takové znaky nedávej.

Z aplikace se pak čte jediným řádkem a klient si sám udržuje [[fond spojení]]:

```js
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Chybí DATABASE_URL — zkopíruj .env.example na .env.');
```

:::check
Ve kterém ze souborů `.env` a `.env.example` má být skutečné heslo a který z nich patří do gitu? Odpověz ve tvaru `soubor, soubor`.

### --expected-- ignore-case
.env, .env.example

### --why--
Skutečná hesla jsou v `.env`, a ten je v `.gitignore`. Do gitu jde jen `.env.example`
se zástupnými hodnotami, aby bylo vidět, které proměnné aplikace potřebuje.
:::

## Co se v SQL změní

Většina dotazů přežije beze změny. Mění se schéma a pár detailů:

:::compare
```html
<div class="karta">
  <h2 id="nadpis"></h2>
  <pre id="kod"></pre>
  <ul id="body"></ul>
</div>
```
```css
body { margin: 0; font: 15px/1.5 system-ui, sans-serif; color: #1f2430; background: #f6f7fb; }
.karta { padding: 1rem 1.1rem; }
h2 { margin: 0 0 .6rem; font-size: 1rem; }
pre { margin: 0; padding: .7rem .8rem; border-radius: .5rem; background: #0f172a; color: #e2e8f0; font: 12.5px/1.6 ui-monospace, monospace; white-space: pre-wrap; }
ul { margin: .8rem 0 0; padding-left: 1.1rem; }
li { margin: .25rem 0; font-size: 13.5px; }
code { background: #e8ecf7; border-radius: .25rem; padding: 0 .25rem; }
```
```js
function ukaz({ nadpis, kod, body }) {
  document.getElementById('nadpis').textContent = nadpis;
  document.getElementById('kod').textContent = kod;
  document.getElementById('body').innerHTML = body.map((text) => '<li>' + text + '</li>').join('');
}
```
--variant-- SQLite
```js
ukaz({
  nadpis: 'Tabulka rezervací ve SQLite',
  kod: "CREATE TABLE bookings (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  court_id INTEGER NOT NULL REFERENCES courts(id),\n  starts_at TEXT NOT NULL,\n  paid INTEGER NOT NULL DEFAULT 0,\n  price_halere INTEGER NOT NULL\n) STRICT;",
  body: [
    'Datum je <code>TEXT</code> ve formátu ISO.',
    'Pravdivostní hodnota je <code>0</code> a <code>1</code>.',
    'Parametr se píše jako <code>?</code>.',
    'Bez <code>STRICT</code> jsou typy jen doporučení.',
  ],
});
```
--variant-- PostgreSQL
```js
ukaz({
  nadpis: 'Táž tabulka v PostgreSQL',
  kod: "CREATE TABLE bookings (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  court_id bigint NOT NULL REFERENCES courts(id),\n  starts_at timestamptz NOT NULL,\n  paid boolean NOT NULL DEFAULT false,\n  price_halere integer NOT NULL\n);",
  body: [
    'Datum má vlastní typ i s časovou zónou.',
    'Pravdivostní hodnota je <code>true</code> a <code>false</code>.',
    'Parametr se píše jako <code>$1</code>, <code>$2</code>…',
    'Typy platí vždy, <code>STRICT</code> není potřeba.',
  ],
});
```
:::

Kromě schématu si dej pozor na tři věci:

1. **`LIKE` je v PostgreSQL citlivé na velikost písmen.** SQLite ho u anglické abecedy
   ignoruje, a to je rozdíl, který se projeví až na produkci.
2. **Funkce se jmenují jinak.** `datetime('now')` je v PostgreSQL `now()`, `IFNULL`
   je `COALESCE` (to umí obě), spojení textu `||` funguje v obou.
3. **`RETURNING` umí obě databáze**, takže `INSERT … RETURNING id` převádět nemusíš.

:::live node predict
```js
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`
  CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL) STRICT;
  INSERT INTO products (name) VALUES ('Kolo Author'), ('kolo dětské'), ('Přilba');
`);

const rows = db.prepare("SELECT name FROM products WHERE name LIKE 'kolo%'").all();
console.log(rows.map((row) => row.name));
```
--question-- Které názvy dotaz najde ve SQLite?
--output--
```text
[ 'Kolo Author', 'kolo dětské' ]
```
--why-- `LIKE` ve SQLite nerozlišuje velikost písmen anglické abecedy, takže projde i „Kolo Author". PostgreSQL by vrátil jen „kolo dětské" — tam je `LIKE` citlivé a na hledání bez ohledu na velikost je `ILIKE`. Je to nejčastější překvapení po přechodu: hledání ve vyhledávacím poli najednou nic nenajde.
:::

:::check
Dotaz `SELECT * FROM users WHERE email LIKE 'Petr%'` fungoval ve SQLite a po přechodu na PostgreSQL přestal nacházet adresy začínající malým „p". Co použiješ místo `LIKE`?

### --expected-- ignore-case
ILIKE

### --why--
`ILIKE` je varianta `LIKE` bez ohledu na velikost písmen. Druhá možnost je ukládat
e-maily rovnou malými písmeny a porovnávat `lower(email)`.
:::

## Převod aplikace krok za krokem

Postup, který se osvědčil, má pět pojmenovaných kroků:

1. **Spusť databázi.** `compose.yaml`, `docker compose up -d`, a `docker compose ps`
   musí ukázat `healthy`.
2. **Převeď schéma.** Projdi `CREATE TABLE` a vyměň typy podle tabulky výš. Tohle je
   dobré místo napsat schéma rovnou jako první migraci, ne jako jednorázový skript.
3. **Vyměň ovladač a zápis parametrů.** Místo `node:sqlite` klient PostgreSQL, místo
   `?` pozice `$1`, `$2`. Dotazy zůstanou jinak stejné.
4. **Přenes data.** Malá data přelij skriptem (čti ze SQLite, zapisuj do Postgresu
   v jedné transakci), větší přes `COPY` z CSV.
5. **Projdi rozdíly.** `LIKE`, práci s datem a časem, a místa, kde jsi spoléhal na to,
   že SQLite uloží do `INTEGER` cokoli.

Do databáze se dá z příkazové řádky podívat bez instalace čehokoli:

```bash
docker compose exec db psql -U rezervace -d rezervace
```

V `psql` pak `\dt` vypíše tabulky, `\d bookings` popíše jednu a `\q` ukončí. Je to
nejrychlejší způsob, jak ověřit, že schéma opravdu vzniklo.

:::check
Ve kterém z pěti kroků převodu vyměníš otazníky za `$1` a `$2`? Napiš jeho číslo.

### --expected--
3

### --why--
Třetí krok je výměna ovladače a zápisu parametrů. Schéma se převádí dřív (krok 2),
data až po něm (krok 4).
:::

:::explain
Proč se schéma pro novou databázi píše jako migrace, a ne jako jeden skript `schema.sql`, který se pustí při prvním startu?

## --model--
Skript `schema.sql` popisuje jen to, jak databáze vypadá **teď**. Jakmile ji jednou
někdo naplní daty, nedá se znovu pustit a změny se pak dělají ručně — takže se
produkce, testovací server a notebook každého člena týmu postupně rozejdou. Migrace
naproti tomu popisuje **změnu** a databáze si pamatuje, které už proběhly. Kdokoli
dostane projekt do ruky, pustí je od začátku a dostane přesně tentýž stav, a stejný
mechanismus funguje i na produkci, kde se data zahodit nesmějí.

## --checklist--
- Skript se schématem popisuje stav, migrace popisuje změnu.
- Nad databází s daty se jednorázový skript už pustit nedá.
- Historie migrací je jediné místo, kde je vidět, jak schéma vzniklo.
- Všechna prostředí se dostanou do stejného stavu stejným postupem.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Aplikace startuje dřív než databáze.** Postgres po `docker compose up` chvíli
> odmítá spojení a aplikace spadne na `ECONNREFUSED`. Oprava: `healthcheck` u služby
> databáze a opakované pokusy o připojení při startu.

> [!PITFALL]
> **`localhost` uvnitř kontejneru není tvůj počítač.** Když aplikace běží taky
> v kontejneru, databáze je na hostu `db` (jméno služby), ne na `localhost`. Z notebooku
> mimo Docker naopak `localhost:5432` platí.

> [!PITFALL]
> **Velká písmena ve jménech tabulek.** `CREATE TABLE "Bookings"` v PostgreSQL vyrobí
> tabulku, na kterou se pak musí odkazovat vždy v uvozovkách. Oprava: jména piš malými
> písmeny s podtržítkem.

> [!PITFALL]
> **Data bez svazku.** `docker compose down -v` smaže i svazky. Písmeno `-v` je rozdíl
> mezi „zastavím databázi" a „přišel jsem o data".

> [!PITFALL]
> **Heslo v `compose.yaml`.** Soubor jde do gitu, takže heslo s ním. Oprava: `${POSTGRES_PASSWORD}`
> a skutečná hodnota v `.env`, který je v `.gitignore`.

:::check
Aplikace běží ve stejném compose souboru jako databáze a připojuje se na `postgres://app:heslo@localhost:5432/app`. Spojení selže. Co v adrese opravíš?

### --expected-- ignore-case
localhost na db

### --accept--
localhost nahradím jménem služby
db místo localhost
jméno služby db

### --why--
Uvnitř kontejneru je `localhost` ten kontejner sám. Sousední službu najdeš pod jejím
jménem ze souboru compose.
:::

## Kde to najdeš v MDN

Tohle téma má dokumentaci mimo MDN:

- [PostgreSQL: Data Types](https://www.postgresql.org/docs/current/datatype.html) — `timestamptz`, `boolean`, `numeric`, `jsonb`.
- [PostgreSQL: Pattern Matching](https://www.postgresql.org/docs/current/functions-matching.html) — `LIKE`, `ILIKE` a regulární výrazy.
- [Docker: postgres image](https://hub.docker.com/_/postgres) — proměnné prostředí, inicializační skripty, svazky.
- [Docker Compose: Services top-level element](https://docs.docker.com/reference/compose-file/services/) — `healthcheck`, `depends_on`, `volumes`.

# --questions--

## --question--

Ve `compose.yaml` je u databáze `image: postgres:latest`. Proč je to špatně?

### --answer--
`latest` neexistuje, obraz se nestáhne.

#### --why--
Značka `latest` existuje a stáhne se. Problém je, na co bude ukazovat za půl roku.

### --correct--
Za nějaký čas to bude jiná hlavní verze a databáze se po přestavění kontejneru nemusí nastartovat nad stávajícími daty.

#### --why--
Data PostgreSQL jsou vázaná na hlavní verzi. Skok z 17 na 18 chce vědomou migraci, ne náhodu.

### --answer--
`latest` se nedá použít s pojmenovaným svazkem.

#### --why--
Svazek je na značce obrazu nezávislý. Právě proto může nová verze narazit na stará data.

### --see--
sql-databaze/postgres-v-dockeru#postgres-v-dockeru-compose-yaml

## --question--

Napiš connection string pro uživatele `app`, heslo `tajne`, host `localhost`, port `5432` a databázi `eshop`.

### --expected--
postgres://app:tajne@localhost:5432/eshop

### --accept--
postgresql://app:tajne@localhost:5432/eshop

### --why--
Pořadí je vždycky uživatel, heslo, host, port a jméno databáze. Schéma `postgres://`
i `postgresql://` znamenají totéž.

### --see--
sql-databaze/postgres-v-dockeru#pripojeni-a-soubor-env

## --question--

Ve SQLite máš `paid INTEGER NOT NULL DEFAULT 0`. Jaký typ sloupci dáš v PostgreSQL? Napiš jen název typu.

### --expected-- ignore-case
boolean

### --why--
PostgreSQL má pravdivostní typ, takže obcházení nulou a jedničkou skončí. Výchozí hodnota
pak je `false`.

### --see--
sql-databaze/postgres-v-dockeru#co-se-v-sql-zmeni

## --question--

Dotaz ze SQLite zní `SELECT * FROM bookings WHERE court_id = ?`. Jak bude vypadat jeho podmínka v PostgreSQL? Napiš celou podmínku od slova `WHERE`.

### --expected--
WHERE court_id = $1

### --why--
PostgreSQL čísluje parametry od jedničky. Díky tomu jde tentýž parametr v jednom dotazu
použít víckrát, zatímco otazníky se počítají podle pořadí.

### --see--
sql-databaze/postgres-v-dockeru#co-se-v-sql-zmeni

## --question--

**Opakování z dřívějška.** Proč do gitu nepatří soubor `.env`, a přesto se do něj commituje `.env.example`?

### --answer--
`.env` je binární soubor, git si s ním neporadí.

#### --why--
Je to obyčejný text. Důvod je v tom, co v něm je.

### --correct--
`.env` obsahuje skutečná hesla a klíče, `.env.example` jen jména proměnných se zástupnými hodnotami.

#### --why--
Tajemství do repozitáře nepatří, ale seznam potřebných proměnných ano — jinak nový člověk neví, co nastavit.

### --answer--
Kvůli velikosti: `.env` bývá příliš velký.

#### --why--
Oba soubory mají pár řádků. Rozhoduje obsah, ne velikost.

### --see--
sql-databaze/postgres-v-dockeru#pripojeni-a-soubor-env

## --question--

**Opakování z dřívějška.** Server má jednu funkci, která vyrábí odpověď na chybu. Proč se vyplatí mít ji na jednom místě, místo aby si každá routa psala vlastní?

### --answer--
Kvůli rychlosti — jedna funkce se zavolá rychleji než kód napsaný v routě.

#### --why--
Rozdíl v rychlosti je neměřitelný. Důvod je v tom, co odpověď znamená pro klienta.

### --correct--
Aby měly všechny chyby stejný tvar — klient na druhé straně pak umí zpracovat každou z nich stejným kódem.

#### --why--
Jednotný tvar chyby je slib API. Když si ho každá routa píše sama, do třetice se od sebe odpovědi liší.

### --answer--
Protože jinak by se do odpovědi dostal `stack trace`.

#### --why--
To je samostatné pravidlo (podrobnosti chyby ven neposílat) a platí, ať máš funkci jednu, nebo deset.

### --see--
api-http-rest/navrh-rest#jednotny-tvar-chyb-problem-json
