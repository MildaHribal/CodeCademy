## --card-- output

Co vypíše tenhle kód? Je to kontrola oprávnění nad starým záznamem, kterému chybí autor.

```js
const session = null;
const zaznam = { id: 7, nazev: 'Stan pro dva' };

console.log(zaznam.autorId === session?.user?.id ? 'smi mazat' : 'nesmi mazat');
```

### --expected--

smi mazat

### --why--

Obě strany jsou `undefined` a `undefined === undefined` je `true`. Kontrola pustí
dál nepřihlášeného návštěvníka. Proto se nejdřív ověří, že uživatel i záznam
existují, a teprve potom se porovnávají id.

### --see--

next-fullstack/auth-v-nextu#ochrana-stranky-a-akce

## --card-- output

Tohle je cache v malém. Co vypíše poslední řádek?

```js
const cache = new Map();

function ctiZaznamy(databaze) {
  if (!cache.has('zaznamy')) cache.set('zaznamy', [...databaze]);
  return cache.get('zaznamy');
}

const databaze = ['Kolo Author', 'Stan pro dva'];
ctiZaznamy(databaze);
databaze.push('Lyže Atomic');

console.log(ctiZaznamy(databaze).length);
```

### --expected--

2

### --why--

Kopie vznikla před zápisem a nikdo ji o změně neinformoval. Přesně takhle se chová
cache v Next.js: uživatel po odeslání formuláře vidí starý seznam, dokud akce
nezavolá `updateTag`.

### --see--

next-fullstack/data-a-server-actions#revalidace-rekni-cache-ze-je-neplatna

## --card-- output

Co vypíše tenhle kód? Je to stejný přenos, jakým prochází propy ze serverové komponenty do klientské.

```js
const props = { nazev: 'Kolo Author', cena: 3200, naKlik: () => alert('koupit') };

try {
  structuredClone(props);
  console.log('projde');
} catch (chyba) {
  console.log(chyba.name);
}
```

### --expected--

DataCloneError

### --why--

Funkce se po drátu poslat nedá. Next.js místo toho hlásí „Event handlers cannot be
passed to Client Component props", ale příčina je stejná. Jediná funkce, která
hranicí projde, je [[serverová akce]].

### --see--

next-fullstack/server-a-client-komponenty#co-jde-po-dratu

## --card-- output

Co vypíše tenhle kód?

```js
const props = { vytvoreno: new Date('2026-03-01'), stitky: new Map([['stav', 'aktivni']]) };
const kopie = structuredClone(props);

console.log(`${kopie.vytvoreno instanceof Date} ${kopie.stitky.get('stav')}`);
```

### --expected--

true aktivni

### --why--

`Date`, `Map`, `Set`, pole i prosté objekty přes hranici projdou a zůstanou tím,
čím byly. Neprojdou funkce, třídy a instance vlastních tříd.

### --see--

next-fullstack/server-a-client-komponenty#co-jde-po-dratu

## --card-- output

Co vypíše tenhle kód? `formData` je to, co dorazí do serverové akce.

```js
const formData = new FormData();
formData.set('nazev', '  Stan pro dva  ');
formData.set('cena', '2400');

const hodnoty = Object.fromEntries(formData);
console.log(typeof hodnoty.cena);
```

### --expected--

string

### --why--

Z formuláře přijde všechno jako text, i číslo. Proto má schéma u číselných polí
převod (`z.coerce.number()`) — bez něj by se do databáze uložil řetězec.

### --see--

next-fullstack/data-a-server-actions#validace-a-autorizace-v-kazde-akci

## --card-- output

Uživatel nechal políčko s cenou prázdné. Co vypíše tenhle kód?

```js
const formData = new FormData();
formData.set('cena', '');

console.log(Number(formData.get('cena')));
```

### --expected--

0

### --why--

`Number('')` je nula, ne `NaN`. Kdyby akce vstup jen převedla a neprohnala
schématem, uložila by inzerát za nula korun a nikdo by si ničeho nevšiml.

### --see--

next-fullstack/data-a-server-actions#validace-a-autorizace-v-kazde-akci

## --card-- output

Co vypíše tenhle kód? Takhle vzniká slug pro adresu záznamu.

```js
const nazev = 'Křeslo IKEA Poäng';

const slug = nazev
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

console.log(slug);
```

### --expected--

kreslo-ikea-poang

### --why--

`normalize('NFD')` rozloží písmeno s háčkem na písmeno a diakritické znaménko,
druhý `replace` to znaménko zahodí. Bez toho by v adrese skončilo `%C5%99` a odkaz
by se nedal poslat v SMS.

### --see--

next-fullstack/app-router#dynamicke-segmenty-a-params-jako-promise

## --card-- output

Co vypíše tenhle kód? Takhle se v route handleru čtou parametry z adresy.

```js
const adresa = new URL('https://bazarek.cz/inzeraty?q=kolo');

console.log(`${adresa.searchParams.get('q')} ${adresa.searchParams.get('druh')}`);
```

### --expected--

kolo null

### --why--

Chybějící parametr vrací `null`, ne `undefined` a ne prázdný řetězec. Proto si
na něj vždycky připrav výchozí hodnotu — `?? 'vse'` je levnější než pád v produkci.

### --see--

next-fullstack/app-router#route-handler-kdyz-potrebujes-endpoint

## --card-- code js

Napiš `smiUpravit(uzivatel, zaznam)`: admin smí ke každému záznamu, ostatní jen ke svému. Když chybí uživatel nebo záznam, vrať `false`.

### --seed--

```js
function smiUpravit(uzivatel, zaznam) {
}
```

### --test--

```js
const eva = { id: 'eva', role: 'uzivatel' };
const admin = { id: 'sarka', role: 'admin' };

assert.equal(smiUpravit(eva, { autorId: 'eva' }), true, 'smiUpravit(eva, záznam Evy) má vrátit true');
assert.equal(smiUpravit(eva, { autorId: 'petr' }), false, 'smiUpravit(eva, záznam Petra) má vrátit false');
assert.equal(smiUpravit(admin, { autorId: 'petr' }), true, 'Admin má projít i k cizímu záznamu');
assert.equal(smiUpravit(null, { autorId: 'eva' }), false, 'smiUpravit(null, záznam) má vrátit false');
assert.equal(smiUpravit(eva, null), false, 'smiUpravit(eva, null) má vrátit false');
assert.equal(smiUpravit(eva, {}), false, 'Záznam bez autora nepatří nikomu');
assert.equal(smiUpravit(null, {}), false, 'Dvakrát chybějící hodnota není shoda vlastníka');
```

### --solution--

```js
function smiUpravit(uzivatel, zaznam) {
  if (!uzivatel || !zaznam) return false;
  if (uzivatel.role === 'admin') return true;
  return Boolean(zaznam.autorId) && zaznam.autorId === uzivatel.id;
}
```

### --why--

Pořadí je celá pointa: nejdřív chybějící hodnoty, pak role, teprve potom porovnání
id. Kdybys začal porovnáním, dvě chybějící hodnoty by si odpovídaly.

### --see--

next-fullstack/auth-v-nextu#role-a-prava

## --card-- code js

Napiš `naSlug(nazev)`: bez diakritiky, malými písmeny, mezery a interpunkce nahrazené pomlčkou, bez pomlčky na začátku a na konci.

### --seed--

```js
function naSlug(nazev) {
}
```

### --test--

```js
assert.equal(naSlug('Kolo Author 29"'), 'kolo-author-29', 'naSlug(\'Kolo Author 29"\') má vrátit kolo-author-29');
assert.equal(naSlug('Křeslo IKEA Poäng'), 'kreslo-ikea-poang', "naSlug('Křeslo IKEA Poäng') má vrátit kreslo-ikea-poang");
assert.equal(naSlug('  Stan pro dva  '), 'stan-pro-dva', 'Mezery na krajích nemají zůstat jako pomlčky');
assert.equal(naSlug('Žádná diakritika!'), 'zadna-diakritika', "naSlug('Žádná diakritika!') má vrátit zadna-diakritika");
```

### --solution--

```js
function naSlug(nazev) {
  return nazev
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

### --why--

Slug je součást adresy, takže v něm nesmí zůstat nic, co by se muselo kódovat.
Poslední `replace` řeší okraje — bez něj by `' Stan '` vyšlo jako `-stan-`.

### --see--

next-fullstack/app-router#dynamicke-segmenty-a-params-jako-promise

## --card-- code js

Napiš `zkratPopis(text, limit)`: delší text zkrať tak, aby i s výpustkou `…` měl nejvýš `limit` znaků. Kratší vrať beze změny.

### --seed--

```js
function zkratPopis(text, limit) {
}
```

### --test--

```js
assert.equal(zkratPopis('Jeté dvě sezony.', 155), 'Jeté dvě sezony.', 'Kratší text se nemá měnit');
const dlouhy = 'a'.repeat(200);
const zkraceny = zkratPopis(dlouhy, 155);
assert.equal(zkraceny.length, 155, `Zkrácený text má mít přesně 155 znaků, má ${zkraceny.length}`);
assert.ok(zkraceny.endsWith('…'), `Zkrácený text má končit výpustkou, končí: ${JSON.stringify(zkraceny.slice(-3))}`);
assert.equal(zkratPopis('abcde', 5), 'abcde', 'Text přesně na limit se nemá zkracovat');
assert.equal(zkratPopis('abcdef', 5), 'abcd…', "zkratPopis('abcdef', 5) má vrátit abcd…");
```

### --solution--

```js
function zkratPopis(text, limit) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}…`;
}
```

### --why--

Výpustka je jeden znak a musí se do limitu vejít taky — proto `limit - 1`.
Tenhle výpočet potřebuješ u popisu v [[metadata stránky]], kde vyhledávač delší
text stejně usekne.

### --see--

next-fullstack/seo-a-metadata#metadata-jako-export

## --card-- code js

Napiš `prvniHlasky(chyby)`: z objektu `{ pole: ['první', 'druhá'] }` udělej `{ pole: 'první' }`. Pole bez hlášky ve výsledku nebuď.

### --seed--

```js
function prvniHlasky(chyby) {
}
```

### --test--

```js
assert.deepEqual(
  prvniHlasky({ nazev: ['Vyplň název.', 'Název je krátký.'], cena: ['Cena musí být číslo.'] }),
  { nazev: 'Vyplň název.', cena: 'Cena musí být číslo.' },
  'Z každého pole se má vzít první hláška',
);
assert.deepEqual(prvniHlasky({ nazev: [], cena: ['Cena musí být číslo.'] }), { cena: 'Cena musí být číslo.' }, 'Pole s prázdným seznamem se má vynechat');
assert.deepEqual(prvniHlasky({ popis: undefined }), {}, 'Pole bez hlášek se má vynechat');
assert.deepEqual(prvniHlasky({}), {}, 'prvniHlasky({}) má vrátit prázdný objekt');
```

### --solution--

```js
function prvniHlasky(chyby) {
  const vysledek = {};
  for (const [pole, hlasky] of Object.entries(chyby)) {
    if (hlasky && hlasky.length > 0) vysledek[pole] = hlasky[0];
  }
  return vysledek;
}
```

### --why--

`z.flattenError` vrací u každého pole celé pole hlášek a některá pole můžou být
prázdná. Formuláři stačí jedna věta u políčka — víc hlášek naráz nikdo nečte.

### --see--

next-fullstack/data-a-server-actions#stav-akce-v-ui

## --card-- free

Vysvětli rozdíl mezi serverovou a klientskou komponentou. Co se z nich pošle do prohlížeče?

### --back--

[[Serverová komponenta]] běží **jen** na serveru. Její kód se do balíku pro
prohlížeč vůbec nedostane, takže smí sáhnout do databáze i na tajemství, a zdarma
zvětšuje jen HTML. Nemá stav ani obsluhu událostí.

[[Klientská komponenta]] se vykreslí **dvakrát**: na serveru do HTML a pak ještě
v prohlížeči při hydrataci. Její kód jde do balíku. Teprve tam funguje `useState`,
`onClick` a `useEffect`.

Rozdíl tedy není „server × prohlížeč", ale „jen server × server i prohlížeč".

### --see--

next-fullstack/server-a-client-komponenty#use-client-hranice-ne-prepinac

## --card-- free

Co přesně udělá `'use client'` na prvním řádku souboru?

### --back--

Označí **hranici ve stromu**, ne jeden soubor. Ten soubor a všechno, co se z něj
importuje, patří do klientského balíku — i modul, který sám žádnou direktivu nemá.

Praktický důsledek: hranici posouvej co nejníž. Když má stránka jedno tlačítko se
stavem, udělej klientské jen to tlačítko, ne celou stránku. A do modulů, které
klientský soubor importuje, se nesmí zatoulat nic tajného.

### --see--

next-fullstack/server-a-client-komponenty#use-client-hranice-ne-prepinac

## --card-- free

Co smí serverová komponenta poslat klientské jako prop a co ne?

### --back--

Propy se serializují do [[RSC payload]]. Projdou čísla, řetězce, `null`, pole,
prosté objekty, `Date`, `Map`, `Set`, JSX — a serverové akce.

Neprojdou funkce, třídy a instance vlastních tříd. Když klientská komponenta
potřebuje něco udělat na serveru, nedostane funkci, ale **serverovou akci** —
React z ní na klientovi udělá jen odkaz na endpoint.

Jiná cesta, jak dostat serverový obsah do klientského obalu, je předat ho jako
`children`.

### --see--

next-fullstack/server-a-client-komponenty#co-jde-po-dratu

## --card-- free

Kdy napíšeš serverovou akci a kdy route handler (`route.ts`)?

### --back--

**Serverová akce** je na změnu dat z vlastního formuláře. Formulář ji zavolá
přímo: žádná adresa, žádný `fetch`, žádný `JSON.stringify` — a funguje to i bez
JavaScriptu.

**Route handler** je pro klienty, kteří nejsou tvoje stránka: mobilní aplikace,
webhook platební brány, RSS, veřejný ceník pro partnera. Vrací `Request`/`Response`,
jaké znáš z prohlížeče, a exportuje funkce pojmenované podle metody.

Rozhodující otázka tedy není „čte, nebo zapisuje", ale „**kdo** to volá".

### --see--

next-fullstack/app-router#route-handler-kdyz-potrebujes-endpoint

## --card-- free

Uživatel odešle formulář a v seznamu svoji změnu nevidí. Kde je chyba a jak ji opravíš?

### --back--

Zápis proběhl, ale stránka čte kopii uloženou v cache. Chybí [[revalidace]].

Akce má na konci zneplatnit [[značka cache|značku]], pod kterou je čtení uložené:

- `updateTag('zaznamy')` — kopii zahodí **hned**; tohle chceš, když má uživatel
  vidět svoji vlastní změnu;
- `revalidateTag('zaznamy')` — ještě jednou pustí starou kopii a novou dopočítá
  na pozadí;
- `revalidatePath('/zaznamy')` — zneplatní všechno na dané adrese, když nevíš,
  jaké značky tam jsou.

### --see--

next-fullstack/data-a-server-actions#revalidace-rekni-cache-ze-je-neplatna

## --card-- free

Co nesmí být uvnitř funkce s `'use cache'` a proč?

### --back--

Všechno, co závisí na konkrétním požadavku nebo uživateli: `cookies()`, `headers()`,
session a cokoli z ní odvozené, `Date.now()`, `Math.random()`, `crypto.randomUUID()`.

Důvod není výkon, ale bezpečnost: uložená kopie se nabídne i dalšímu uživateli,
takže by jednomu ukázala data druhého. Pravidlo: do cache jde jen to, co bys
klidně vyvěsil na nástěnku.

Osobní část stránky patří do `<Suspense>`, aby se dostřelila až při požadavku.
Když potřebuješ čas nebo náhodu per požadavek, zavolej nejdřív `await connection()`.

### --see--

next-fullstack/data-a-server-actions#ceho-se-cache-nesmi-dotknout

## --card-- free

Kde všude kontroluješ oprávnění a proč nestačí `proxy.ts`?

### --back--

Na třech místech a každé má jinou roli:

- `proxy.ts` — rychlé přesměrování nepřihlášeného pryč. Je to **výhybka, ne
  ochranka**: serverové akce a route handlery mají vlastní adresy a jdou volat
  přímo, mimo jakoukoli navigaci.
- stránka — rozhoduje, co tenhle uživatel uvidí; dotaz filtruje podle id ze session.
- **akce a datová vrstva** — rozhodují, jestli smí zrovna tohle. Tohle je to místo,
  na kterém záleží: když ho vynecháš, může kdokoli změnit cokoli.

V akci vždycky dva kroky: „je přihlášený" a „patří mu ten záznam".

### --see--

next-fullstack/auth-v-nextu#ochrana-stranky-a-akce

## --card-- free

Proč nestačí schovat tlačítko „Smazat" před uživatelem, který na mazání nemá právo?

### --back--

Skryté tlačítko je jen nezobrazený kus HTML. Serverová akce má vlastní adresu
a dá se zavolat bez tvé stránky — z konzole, z `curl`, z cizího skriptu. Stejně
tak si kdokoli přepíše skryté pole ve formuláři nebo `id` v adrese.

Skrývání v UI je **laskavost k uživateli**, ne ochrana. Rozhodnutí musí padnout
na serveru, v akci, nad daty z databáze. Role proto nikdy nečti z cookie ani
z formuláře, ale ze session.

### --see--

next-fullstack/auth-v-nextu#role-a-prava

## --card-- free

Co je nesoulad při hydrataci, podle čeho ho poznáš a jak ho odstraníš?

### --back--

[[Nesoulad při hydrataci]] nastane, když se strom vykreslený na serveru liší od
toho, který React spočítá v prohlížeči. Hláška zní „Hydration failed because the
server rendered HTML didn't match the client".

Nejčastější příčiny: čas a datum, `Math.random()`, `window` nebo `localStorage`
v těle komponenty, náhodné id, rozšíření prohlížeče.

Oprava: hodnotu spočítej až v `useEffect` (server vykreslí neutrální stav), nebo
ji pošli ze serveru jako prop, aby obě strany počítaly ze stejného vstupu.

### --see--

next-fullstack/ssr-csr-ssg#co-nesoulad-zpusobuje

## --card-- free

Vysvětli CSR, SSR, SSG a streamování. Podle čeho u konkrétní stránky vybereš?

### --back--

- **CSR** — server pošle prázdnou skořápku a obsah dopočítá prohlížeč. Vhodné
  pro aplikaci za přihlášením, kde na vyhledávači nezáleží.
- **SSG** — HTML vznikne dopředu a servíruje se jako soubor. Pro obsah, který se
  mění zřídka a je pro všechny stejný.
- **SSR** — HTML se skládá při každém požadavku. Pro data, která musí být čerstvá
  nebo osobní.
- **[[Streamování]]** — [[statická skořápka]] odejde hned a pomalé části dorazí
  postupně přes `<Suspense>`.

Rozhoduje dvojice otázek: jak často se to mění a pro koho je to stejné.

### --see--

next-fullstack/ssr-csr-ssg#ctyri-strategie-ctyri-vysledky

## --card-- free

Jak se proměnná prostředí dostane (nebo nedostane) do prohlížeče?

### --back--

Na serveru je v `process.env` všechno z `.env.local` a z prostředí nasazení.
Do balíku pro prohlížeč Next.js vloží jen proměnné s prefixem `NEXT_PUBLIC_`,
a to při buildu — hodnota se do kódu doslova zapíše.

Plyne z toho obojí: bez prefixu v klientské komponentě vyjde `undefined`,
a co prefix má, to si každý přečte ve zdrojovém kódu stránky. Klíč k platební
bráně tam tedy nepatří. A změna veřejné proměnné znamená nový build, ne restart.

### --see--

next-fullstack/server-a-client-komponenty#tajemstvi-a-verejne-promenne

## --card-- free

Co v Next.js aplikaci testuješ Vitestem a co Playwrightem?

### --back--

**Vitest** na čistou logiku, která nepotřebuje prohlížeč ani databázi: pravidla
oprávnění, schéma validace, formátování, výpočty. Běží v milisekundách, takže si
můžeš dovolit i divné vstupy.

**Playwright** na cesty, které musí fungovat jako celek: přihlásit se → založit
záznam → vidět ho v seznamu. Pouštěj ho **proti produkčnímu buildu**, ne proti dev
serveru — jen produkční build ukáže chyby, které vznikají až při skládání stránek.

Mezi tím nic moc není: testovat serverové komponenty jednotkově se nevyplácí.

### --see--

next-fullstack/testy-a-nasazeni-nextu#co-testovat-cim

## --card-- free

Co musí být hotové, než aplikaci nasadíš, a co se nasazením mění?

### --back--

Před nasazením: `npm run lint`, kontrola typů, testy a hlavně `npm run build` —
produkční build je jediná kontrola, která řekne, jestli se to vůbec dá spustit,
a ve výpisu ukáže u každé routy, jestli je statická, nebo se vyrábí při požadavku.

Nasazením se mění, odkud se berou proměnné prostředí (z platformy, ne z `.env.local`),
že tajemství nesmí být v repozitáři a že veřejné proměnné se zapečou už při buildu.
Na výběr máš platformu, která build spustí za tebe, nebo kontejner s `output:
'standalone'`, který si nese jen to, co k běhu potřebuje.

### --see--

next-fullstack/testy-a-nasazeni-nextu#nasazeni-platforma-nebo-kontejner
