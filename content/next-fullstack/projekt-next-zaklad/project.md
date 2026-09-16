---
title: Katalog pražírny v Next.js
timeoutMs: 60000
---

# --description--

## Zadání

Pražírna Zrno prodává výběrovou kávu a zatím ji má jen na Instagramu. Chce web,
který se dá poslat do vyhledávače a do chatu: seznam káv, detail s vlastní adresou
a rychlé hledání. Rozpočet na backend žádný — data se zatím mění tak jednou za měsíc,
takže je stačí mít v kódu.

Postavíš to v Next.js 16 s TypeScriptem. Design, texty i data máš připravené;
tvoje práce je **struktura aplikace a logika pod ní**.

> [!NOTE]
> Kontrola umí tvoji datovou vrstvu opravdu spustit a vyzkoušet. U souborů ve složce
> `app/` kontroluje, že jsou na správném místě a že dělají to, co mají — jestli
> stránka vypadá dobře, uvidíš na vlastní oči v prohlížeči. Proto si po každé etapě
> otevři `http://localhost:3000`.

## Jak začít

1. Klikni na **Začít projekt** a otevři složku ve VS Code (`code <cesta>`).
2. V terminálu ve složce projektu spusť `npm install` a pak `npm run dev`.
3. Otevři `http://localhost:3000`. Úvodní stránka i layout jsou hotové, katalog ještě ne.
4. Po každé etapě klikni na **Zkontrolovat**.

Architektura má jedno pravidlo, které se vyplatí držet: **v `lib/kava.ts` není jediný
import z Next.js.** Je to obyčejný TypeScript, který jde spustit a otestovat samostatně.
Soubory v `app/` z něj jen skládají stránky.

## Etapa 1: datová vrstva

V `lib/kava.ts` máš hotová data i typy a prázdné kostry funkcí. Doplň je:

- `vsechnyKavy()` — všechny kávy seřazené podle názvu **podle české abecedy**
  (`Čokoládová` patří hned za `Cerrado`, `Chiapas` až za `Huila`).
- `najdiKavu(slug)` — jedna káva, nebo `undefined`.
- `filtrujKavy(kavy, { dotaz, druh })` — vybere kávy, jejichž **název nebo původ**
  obsahuje hledaný text (bez ohledu na velikost písmen a na mezery okolo), a které
  patří do zvoleného druhu. Druh `'vse'` znamená „nefiltruj".
- `formatujCenu(castka)` — `289 Kč`, bez haléřů.
- `metadataKavy(kava)` — titulek, popis **nejvýš 155 znaků** (delší zkrať a ukonči
  výpustkou `…`), kanonická adresa `/kava/<slug>` a stejný titulek i popis do `openGraph`.

Průběžně si to hlídej příkazem `npm run typecheck:lib`.

## Etapa 2: katalog na serveru

Vyrob stránku `/kava`, která vypíše všechny kávy. Je to **serverová komponenta** —
data si vezme přímo z `vsechnyKavy()`, žádné `fetch` a žádný `useEffect`. Stránka má
vlastní `metadata` s titulkem a popisem.

Kontrola po této etapě: otevři `http://localhost:3000/kava`, dej **Zobrazit zdrojový
kód stránky** a najdi v HTML názvy káv. Když tam jsou, děláš to správně.

## Etapa 3: detail, 404 a stavy

- Detail na adrese `/kava/<slug>` v dynamickém segmentu. `params` je slib, takže
  ho počkej. Když káva neexistuje, zavolej `notFound()`.
- `not-found.tsx` pro tu větev: vlídná stránka s odkazem zpátky do katalogu.
- `generateMetadata`, které vrátí to, co spočítá `metadataKavy`. U neznámé kávy
  stačí titulek `Káva nenalezena`.
- `loading.tsx` se šedou kostrou a `error.tsx` s tlačítkem, které vykreslení zkusí
  znovu. Hranice chyby potřebuje stav, takže je klientská.

Zkus si v prohlížeči `/kava/neexistuje` — musí přijít tvoje stránka a stav 404
(uvidíš ho v DevTools na kartě **Network**).

## Etapa 4: filtr v prohlížeči

Hledání a přepínač druhu musí reagovat při psaní, takže potřebují stav — a to je
práce pro klientskou komponentu. Ulož ji do `app/kava/_components/` (složka
s podtržítkem se do adres nepočítá) a dej jí `'use client'` na první řádek.

Seznam káv jí pošli **jako prop** ze serverové stránky. Filtrování nepiš znovu —
zavolej `filtrujKavy` z datové vrstvy. Když filtr nic nenajde, ukaž místo prázdna
větu, ze které je jasné, co dál.

> [!PITFALL]
> Neudělej klientskou celou stránku. Klientská je jen ta část, která potřebuje stav;
> zbytek katalogu (nadpis, perex, metadata) zůstane serverový.

## Etapa 5: endpoint pro kamarádku

Kamarádka chce nabídku zobrazit ve své appce. Vyrob `GET /api/kava`, který vrátí
kávy jako JSON a umí je zúžit parametry `?q=` a `?druh=`. Použij na to stejné funkce
z datové vrstvy — hodnoty si vytáhni z `new URL(request.url).searchParams` a odpověz
přes `Response.json(…)`.

Vyzkoušej v prohlížeči: `http://localhost:3000/api/kava?druh=filtr`.

## Než to uzavřeš

Pusť `npm run build`. Produkční build je jediná kontrola, která ti řekne, jestli se
aplikace vůbec dá nasadit — a ve výpisu uvidíš u každé routy, jestli je statická,
nebo se vyrábí při požadavku.

# --hints--

Datová vrstva vrací všech osm káv seřazených podle české abecedy.

```js
const { vsechnyKavy } = await helpers.importFile('lib/kava.ts');
const kavy = vsechnyKavy();
assert.equal(kavy.length, 8, 'vsechnyKavy() má vrátit všech osm káv');
const nazvy = kavy.map((kava) => kava.nazev);
assert.deepEqual(
  nazvy,
  ['Cerrado', 'Čokoládová', 'Etiopie Yirgacheffe', 'Huila', 'Chiapas', 'Kostarika Tarrazú', 'Rwanda Kivu', 'Sumatra Mandheling'],
  `Pořadí má být podle české abecedy (Č hned za C, Ch až za H), je: ${nazvy.join(' | ')}`,
);
```

`najdiKavu` najde kávu podle slugu, u neznámého vrátí `undefined`.

```js
const { najdiKavu } = await helpers.importFile('lib/kava.ts');
const kava = najdiKavu('etiopie-yirgacheffe');
assert.ok(kava, 'najdiKavu("etiopie-yirgacheffe") má vrátit kávu');
assert.equal(kava.nazev, 'Etiopie Yirgacheffe', 'Vrácená káva má mít název Etiopie Yirgacheffe');
assert.equal(kava.cena, 289, 'Vrácená káva má mít cenu 289');
assert.equal(najdiKavu('neexistuje'), undefined, 'Neznámý slug má vrátit undefined');
assert.equal(najdiKavu(''), undefined, 'Prázdný slug má vrátit undefined');
```

`filtrujKavy` hledá v názvu i v původu, bez ohledu na velikost písmen a mezery okolo.

```js
const { filtrujKavy, vsechnyKavy } = await helpers.importFile('lib/kava.ts');
const kavy = vsechnyKavy();

assert.deepEqual(filtrujKavy(kavy, { dotaz: 'huila' }).map((kava) => kava.slug), ['huila'], 'Hledání „huila" má najít jedinou kávu');
assert.deepEqual(filtrujKavy(kavy, { dotaz: '  ETIOPIE ' }).map((kava) => kava.slug), ['etiopie-yirgacheffe'], 'Hledání nemá koukat na velikost písmen ani na mezery okolo');
const brazilie = filtrujKavy(kavy, { dotaz: 'brazílie' }).map((kava) => kava.slug).sort();
assert.deepEqual(brazilie, ['cerrado', 'cokoladova'], `Hledání „brazílie" má najít kávy podle původu, našlo: ${brazilie.join(', ')}`);
assert.equal(filtrujKavy(kavy, { dotaz: '' }).length, 8, 'Prázdné hledání nemá nic vyfiltrovat');
assert.equal(filtrujKavy(kavy, {}).length, 8, 'Bez filtru projdou všechny kávy');
```

`filtrujKavy` umí i druh a obě podmínky dohromady.

```js
const { filtrujKavy, vsechnyKavy } = await helpers.importFile('lib/kava.ts');
const kavy = vsechnyKavy();

assert.equal(filtrujKavy(kavy, { druh: 'vse' }).length, 8, 'Druh „vse" znamená nefiltrovat');
const filtrove = filtrujKavy(kavy, { druh: 'filtr' });
assert.equal(filtrove.length, 4, `Filtrových káv jsou čtyři, vrátilo: ${filtrove.length}`);
assert.ok(filtrove.every((kava) => kava.druh === 'filtr'), 'Ve výsledku mají být jen kávy zvoleného druhu');
assert.deepEqual(filtrujKavy(kavy, { dotaz: 'brazílie', druh: 'bezkofeinova' }).map((kava) => kava.slug), ['cokoladova'], 'Obě podmínky mají platit zároveň');
assert.deepEqual(filtrujKavy(kavy, { dotaz: 'kajak' }), [], 'Když nic nesedí, vrací se prázdné pole');
```

`formatujCenu` píše ceny česky a bez haléřů.

```js
const { formatujCenu } = await helpers.importFile('lib/kava.ts');
assert.equal(helpers.normalize(formatujCenu(289)), '289 Kč', 'formatujCenu(289) má vrátit „289 Kč"');
assert.equal(helpers.normalize(formatujCenu(1250)), '1 250 Kč', 'formatujCenu(1250) má oddělit tisíce mezerou');
assert.ok(!formatujCenu(289).includes(',00'), 'Ceny mají být bez haléřů');
```

`metadataKavy` vrátí titulek, popis do 155 znaků a kanonickou adresu.

```js
const { metadataKavy, najdiKavu } = await helpers.importFile('lib/kava.ts');

const kratka = metadataKavy(najdiKavu('huila'));
assert.equal(kratka.title, 'Huila', 'Titulek má být název kávy');
assert.equal(kratka.description, najdiKavu('huila').popis, 'Popis kratší než 155 znaků se nemá zkracovat');
assert.equal(kratka.alternates.canonical, '/kava/huila', 'Kanonická adresa má být /kava/<slug>');
assert.equal(kratka.openGraph.title, 'Huila', 'Titulek má být i v openGraph');
assert.equal(kratka.openGraph.description, kratka.description, 'Popis má být i v openGraph');

const dlouha = metadataKavy(najdiKavu('sumatra-mandheling'));
assert.ok(dlouha.description.length <= 155, `Dlouhý popis se má zkrátit na nejvýš 155 znaků, má ${dlouha.description.length}`);
assert.ok(dlouha.description.endsWith('…'), `Zkrácený popis má končit výpustkou, končí: ${JSON.stringify(dlouha.description.slice(-10))}`);
```

Stránka `/kava` je serverová, bere data z datové vrstvy a má vlastní metadata.

```js
const cesta = 'app/kava/page.tsx';
assert.ok(typeof files[cesta] === 'string', `Chybí soubor ${cesta}`);
const zdroj = helpers.stripComments(files[cesta], 'js');
assert.ok(!/['"]use client['"]/.test(zdroj), 'Stránka katalogu má zůstat serverová — "use client" do ní nepatří');
assert.match(zdroj, /vsechnyKavy\s*\(/, 'Stránka má vzít data z vsechnyKavy() z datové vrstvy');
assert.ok(!/useEffect|fetch\s*\(/.test(zdroj), 'Serverová komponenta si data načte přímo, bez fetch a bez useEffect');
assert.match(zdroj, /export\s+(const|async\s+function|function)\s+(metadata|generateMetadata)/, 'Stránka katalogu má exportovat metadata');
assert.match(zdroj, /export\s+default/, 'Stránka má mít výchozí export');
```

Detail `/kava/<slug>` počká na `params`, hledá kávu a u neznámé volá `notFound()`.

```js
const cesta = 'app/kava/[slug]/page.tsx';
assert.ok(typeof files[cesta] === 'string', `Chybí soubor ${cesta} — dynamický segment se píše do hranatých závorek`);
const zdroj = helpers.stripComments(files[cesta], 'js');
assert.match(zdroj, /await\s+params/, 'params je slib, takže ho počkej: const { slug } = await params');
assert.match(zdroj, /najdiKavu\s*\(/, 'Detail má hledat kávu přes najdiKavu z datové vrstvy');
assert.match(zdroj, /notFound\s*\(\s*\)/, 'U neznámé kávy se volá notFound()');
assert.match(zdroj, /from\s+['"]next\/navigation['"]/, 'notFound se importuje z next/navigation');
assert.match(zdroj, /export\s+async\s+function\s+generateMetadata/, 'Detail má exportovat async funkci generateMetadata');
assert.match(zdroj, /metadataKavy\s*\(/, 'generateMetadata má vracet to, co spočítá metadataKavy');
```

Větev `/kava` má vlastní stránku 404, stav načítání i hranici chyby.

```js
assert.ok(typeof files['app/kava/[slug]/not-found.tsx'] === 'string', 'Chybí app/kava/[slug]/not-found.tsx');
assert.match(helpers.stripComments(files['app/kava/[slug]/not-found.tsx'], 'js'), /export\s+default/, 'not-found.tsx potřebuje výchozí export');

assert.ok(typeof files['app/kava/loading.tsx'] === 'string', 'Chybí app/kava/loading.tsx');
assert.match(helpers.stripComments(files['app/kava/loading.tsx'], 'js'), /export\s+default/, 'loading.tsx potřebuje výchozí export');

const chyba = files['app/kava/error.tsx'];
assert.ok(typeof chyba === 'string', 'Chybí app/kava/error.tsx');
assert.match(chyba.trimStart(), /^['"]use client['"]/, 'Hranice chyby má stav, takže error.tsx začíná direktivou "use client"');
assert.match(helpers.stripComments(chyba, 'js'), /reset/, 'error.tsx dostane funkci reset — nabídni ji tlačítkem');
```

Filtr je klientská komponenta v `app/kava/_components/` a filtruje datovou vrstvou.

```js
const komponenty = Object.keys(files).filter((jmeno) => jmeno.startsWith('app/kava/_components/') && /\.(tsx|jsx)$/.test(jmeno));
assert.ok(komponenty.length > 0, 'V app/kava/_components/ má být komponenta s filtrem');
const klientske = komponenty.filter((jmeno) => /^['"]use client['"]/.test(files[jmeno].trimStart()));
assert.ok(klientske.length > 0, `Komponenta s filtrem má začínat direktivou "use client", našel jsem: ${komponenty.join(', ')}`);

const zdroj = helpers.stripComments(klientske.map((jmeno) => files[jmeno]).join('\n'), 'js');
assert.match(zdroj, /useState\s*[(<]/, 'Hledání se musí měnit při psaní, takže potřebuje stav (useState)');
assert.match(zdroj, /filtrujKavy\s*\(/, 'Filtrování nepiš znovu — zavolej filtrujKavy z datové vrstvy');

const stranka = helpers.stripComments(files['app/kava/page.tsx'], 'js');
assert.match(stranka, /_components/, 'Stránka katalogu má klientskou komponentu z _components použít');
```

`GET /api/kava` vrací kávy z datové vrstvy a umí je zúžit parametry v adrese.

```js
const cesta = 'app/api/kava/route.ts';
assert.ok(typeof files[cesta] === 'string', `Chybí soubor ${cesta}`);
const zdroj = helpers.stripComments(files[cesta], 'js');
assert.match(zdroj, /export\s+(async\s+)?function\s+GET/, 'Route handler exportuje funkci pojmenovanou podle metody: GET');
assert.match(zdroj, /searchParams/, 'Parametry z adresy se berou z new URL(request.url).searchParams');
assert.match(zdroj, /filtrujKavy\s*\(/, 'Zúžení nabídky nepiš znovu — použij filtrujKavy');
assert.match(zdroj, /vsechnyKavy\s*\(/, 'Data ber z vsechnyKavy()');
assert.match(zdroj, /Response\.json\s*\(/, 'Odpověď se posílá přes Response.json(…)');
assert.ok(!/['"]use client['"]/.test(zdroj), 'Route handler běží na serveru — "use client" do něj nepatří');
```

Kontrola typů datové vrstvy projde bez chyby.

```js
const vysledek = await helpers.run('npx tsc --noEmit -p tsconfig.lib.json', { timeoutMs: 55000 });
assert.equal(vysledek.code, 0, `npm run typecheck:lib má projít bez chyby:\n${vysledek.stdout}${vysledek.stderr}`);
```

# --help--

## --tip-- 1

Řazení podle abecedy jednoho jazyka umí `localeCompare` — dostane druhý řetězec
a jazyk. Bez jazyka seřadí řetězce podle číselných kódů znaků, což u `Č` a `Ch`
dopadne špatně. Pozor ještě na to, že `sort` řadí pole na místě, takže původní
seznam nejdřív zkopíruj.

## --tip-- 3

Hledání má projít dvě pole najednou. Nejkratší cesta je podmínka
„dotaz je prázdný **nebo** ho obsahuje jedno z těch polí" — a na obou stranách
předem srovnej velikost písmen.

## --tip-- 6

Zkracování popisu má dvě části: rozhodnutí, jestli je text moc dlouhý, a samotné
uříznutí tak, aby se i s výpustkou vešel do limitu. Výpustka `…` je jeden znak,
takže se musí do těch 155 vejít taky.

## --tip-- 8

Typ propu `params` se v Next.js 16 píše jako `Promise<{ slug: string }>`.
Když ti v editoru svítí, že na slibu žádné `slug` není, chybí `await` — je to
ta samá past jako v lekci
[App Router](see:next-fullstack/app-router#dynamicke-segmenty-a-params-jako-promise).

## --tip-- 10

Server smí klientské komponentě poslat pole objektů — jsou to obyčejná data
(kontrakt na to, co hranicí projde, je v lekci
[Serverové a klientské komponenty](see:next-fullstack/server-a-client-komponenty#co-jde-po-dratu)).
Neposílej jí ale funkci, která by data načítala.

## --tip-- 11

`new URL(request.url)` ti z adresy udělá objekt, na kterém je `searchParams`.
Z něj se hodnoty tahají metodou `get`, a když parametr chybí, vrací `null` —
připrav si proto výchozí hodnotu.

# --review--

Testy hlídají, že aplikace dělá, co má. Tohle si projdi sám — a hlavně si to celé
proklikej v prohlížeči.

## --rubric--

- V `lib/kava.ts` není jediný import z Next.js a dal by se použít i v jiné aplikaci.
- Klientská je opravdu jen ta část, která potřebuje stav — ne celá stránka.
- Ve zdrojovém kódu stránky `/kava` (bez spuštěného JavaScriptu) jsou vidět názvy káv.
- `/kava/neexistuje` vrací stav 404, ne prázdnou stránku a ne chybu.
- Každá stránka má vlastní titulek a popis; v `<head>` nezůstalo nic z výchozí šablony.
- Jména funkcí a proměnných říkají, co dělají, bez komentáře.
- `npm run build` projde a ve výpisu rozumíš tomu, které routy jsou statické.
- V `README.md` je napsané jedno rozhodnutí, které jsi udělal, a proč.

## --extensions--

**Rozšíření bez testů**

- Přidej stránku `/kava/puvod/[zeme]` se seznamem káv z jedné země a odkazuj na ni
  z detailu.
- Vyrob `app/kava/[slug]/opengraph-image.tsx`, který z názvu a ceny vykreslí
  náhledový obrázek, a zkontroluj ho ve sdílení odkazu.
- Doplň `app/sitemap.ts`, který vygeneruje adresy všech káv z datové vrstvy.
- Přesuň hledání do adresy (`?q=`) přes `searchParams`, ať jde výsledek hledání poslat odkazem.

**Rozšíření do portfolia**

- Vyměň data v `lib/kava.ts` za skutečnou databázi (Drizzle nad SQLite). Když jsi
  vrstvu oddělil dobře, soubory v `app/` se nezmění ani o řádek.
- Nasaď to na platformu a dej odkaz do README.
- Přidej Playwright test, který projde cestu „katalog → detail → zpátky" proti
  produkčnímu buildu.
