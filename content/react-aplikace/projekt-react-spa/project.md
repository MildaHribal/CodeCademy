---
title: Plánovač jídel a nákupů
timeoutMs: 120000
---

# --description--

## Zadání

„Doma se každou neděli ptáme, co se bude celý týden vařit, a v obchodě pak
stejně na něco zapomeneme. Chtěla bych aplikaci, kde si projdu recepty, naskládám
je na jednotlivé dny a ona mi z toho udělá nákupní seznam — sečtený, ať nekupuju
cibuli třikrát. A ať si to můžu otevřít i na mobilu v obchodě, takže přihlášení
a data u vás na serveru."

Tohle je **vlajkový projekt**: až ho dokončíš, dáš si ho do portfolia a budeš
o něm mluvit na pohovoru. Nikdo ti neřekne, ze které lekce co použít — potřebuješ
trasy, serverová data s cache, filtry v adrese, formulář s validací, přihlášení
proti cookie a testy.

API máš hotové ve složce `server/`. Píšeš klienta.

## Jak začít

1. Klikni na **Začít projekt** a otevři složku ve VS Code.
2. `npm install`.
3. Ve dvou terminálech: `npm run api` (API na portu 3001) a `npm run dev`
   (aplikace na 5173). Dev server posílá `/api` na API, takže je to pro prohlížeč
   jeden původ a cookie funguje bez CORS.
4. Přihlas se jako **eva@example.com** / **kvasnice**.
5. Detaily API, seznam příkazů a rozdělení „hotové × tvoje práce" máš v `README.md`.
6. Průběžně pouštěj `npm test`, `npm run typecheck` a `npm run build`; kontrola
   je spouští taky.

> [!NOTE]
> Začni datovou vrstvou v `src/lib`. Je to čistý TypeScript bez Reactu, jde
> otestovat bez vykreslení a stojí na ní zbytek aplikace. Když ti sedí ona,
> komponenty jsou už jen její výpis.

## Uživatelské příběhy

- Když návštěvník otevře aplikaci, uvidí seznam receptů z API s názvem, druhem,
  časem přípravy a počtem porcí.
- Když návštěvník píše do hledání, seznam se zužuje podle názvu i podle surovin,
  bez ohledu na velikost písmen.
- Když návštěvník zvolí druh jídla nebo nejdelší čas přípravy, podmínky platí
  zároveň s hledáním.
- Když návštěvník pošle kamarádovi adresu, kterou má v prohlížeči, uvidí kamarád
  stejně vyfiltrovanou nabídku — a tlačítko Zpět vrací filtry tak, jak je
  návštěvník zadával.
- Když hledání neodpovídá žádný recept, uvidí návštěvník větu, co s tím, ne
  prázdnou stránku.
- Když návštěvník klikne na recept, uvidí jeho suroviny, postup a čas.
- Když se recepty nepodaří načíst, uvidí návštěvník hlášku a tlačítko, kterým to
  zkusí znovu.
- Když se uživatel přihlásí, aplikace si ho pamatuje i po obnovení stránky a
  v záhlaví je jeho jméno.
- Když uživatel vyplní přihlášení špatně, uvidí u vadného pole českou větu; pole
  je označené i pro čtečku obrazovky a vyplněné hodnoty mu zůstanou.
- Když uživatel klikne na srdíčko u receptu, překlopí se okamžitě, ještě než
  server odpoví. Když server odmítne, vrátí se zpátky a uživatel se dozví proč.
- Když uživatel přidá recept na konkrétní den, objeví se v týdenním plánu.
- Když uživatel otevře nákupní seznam, uvidí suroviny ze všech jídel v plánu,
  sečtené po jednotkách, přepočítané na zadaný počet strávníků a seřazené podle
  české abecedy.
- Když nepřihlášený člověk otevře adresu plánu, pošle ho aplikace na přihlášení
  a po něm zpátky tam, kam mířil. Přihlášený člověk na plánu zůstane i po
  obnovení stránky.
- Když se uživatel odhlásí, nezůstanou v aplikaci jeho data ani na okamžik.

## Technické požadavky

- **Datová vrstva** v `src/lib` je čistý TypeScript bez Reactu a bez `fetch`.
  Rozhraní je dané v kostrách a v `src/lib/types.ts`, drž se ho:
  - `filterRecipes(recipes, filter)` — filtr `{ query, tag, maxMinutes }`, prázdná
    hodnota a štítek `vse` nefiltrují, text se hledá v názvu i v surovinách bez
    ohledu na velikost písmen a mezery okolo,
  - `formatMinutes(minutes)` — `40` → `40 min`, `120` → `2 h`, `150` → `2 h 30 min`,
  - `addMeal`, `removeMeal` — vrací **nový** plán, původní nemění, totéž jídlo
    v jednom dni podruhé nepřidají,
  - `countMeals(plan)` — počet jídel v celém týdnu,
  - `shoppingList(plan, recipes, people)` — přepočet na `people` strávníků
    (recept je psaný na `recipe.portions` porcí), sloučení stejné suroviny se
    stejnou jednotkou, zaokrouhlení na jedno desetinné místo, řazení podle české
    abecedy, neznámá id receptů se přeskočí.
- **Síť jde jen přes `apiFetch`** v `src/api/client.ts`. Posílá cookie u každého
  požadavku a odpověď `401` převádí na `ApiError` se `status` 401.
- **Filtry receptů patří do adresy** pod jmény `hledat`, `stitek` a `do`.
  Počet strávníků na nákupním seznamu do adresy taky, pod jménem `lidi`.
- **Srdíčko se mění optimisticky**: před zásahem si ulož snímek dat, hned ukaž
  změnu, při chybě se vrať a nakonec dotaz zneplatni.
- **Chráněná trasa** vykreslí obsah až po odpovědi „kdo jsem" a nepřihlášeného
  přesměruje na přihlášení s `replace`.
- **Vlastní testy aspoň ve dvou souborech.** Datová vrstva ať je pokrytá celá
  (včetně okrajových případů) a aspoň jedna komponenta ať je otestovaná dotazem
  podle role.
- `npm test`, `npm run typecheck` i `npm run build` musí projít.

> [!PITFALL]
> Nejdřív si rozmysli, **odkud se bere plán na nákupním seznamu**. Kdyby si
> nákupní seznam držel vlastní kopii plánu, rozejdou se v okamžiku, kdy někdo
> jídlo odebere. Odvozená data se počítají, neukládají.

# --hints--

API ze starteru běží, přihlášení nastaví cookie `HttpOnly` a bez ní vrátí chráněný endpoint `401`.

```js
const server = await helpers.startServer('server/index.js');
const login = await fetch(`${server.url}/api/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'eva@example.com', password: 'kvasnice' }),
});
assert.equal(login.status, 200, 'POST /api/login se správnými údaji má vrátit 200 — server ze starteru neměň');
const cookie = login.headers.get('set-cookie') ?? '';
assert.match(cookie, /HttpOnly/i, `odpověď na přihlášení má nastavit cookie s HttpOnly, přišlo: ${cookie}`);

const anonymous = await fetch(`${server.url}/api/plan`);
assert.equal(anonymous.status, 401, 'GET /api/plan bez cookie má vrátit 401');

const recipes = await fetch(`${server.url}/api/recipes`);
assert.equal(recipes.status, 200, 'GET /api/recipes má vrátit 200 i nepřihlášenému');
assert.equal((await recipes.json()).length, 8, 'API má vracet osm receptů');
```

`filterRecipes` hledá v názvu i v surovinách a nekouká na velikost písmen ani na mezery okolo.

```js
const { filterRecipes } = await helpers.importFile('src/lib/recipes.ts');
const recipes = [
  { id: 1, name: 'Čočka na kyselo', tag: 'bezmasa', minutes: 60, portions: 4, ingredients: [{ name: 'čočka', amount: 0.5, unit: 'kg' }, { name: 'cibule', amount: 2, unit: 'ks' }] },
  { id: 2, name: 'Candát na másle', tag: 'ryba', minutes: 40, portions: 2, ingredients: [{ name: 'candát', amount: 0.5, unit: 'kg' }] },
  { id: 3, name: 'Znojemská pečeně', tag: 'maso', minutes: 120, portions: 4, ingredients: [{ name: 'cibule', amount: 2, unit: 'ks' }] },
];
assert.deepEqual(filterRecipes(recipes, {}).map((r) => r.id), [1, 2, 3], 'bez filtru mají projít všechny recepty');
assert.deepEqual(filterRecipes(recipes, { query: '' }).map((r) => r.id), [1, 2, 3], 'prázdné hledání nemá nic vyfiltrovat');
assert.deepEqual(filterRecipes(recipes, { query: 'ČOČKA' }).map((r) => r.id), [1], 'hledání „ČOČKA" nemá koukat na velikost písmen');
assert.deepEqual(filterRecipes(recipes, { query: '  cibule ' }).map((r) => r.id), [1, 3], 'hledání „cibule" má najít recepty podle surovin, i s mezerami okolo');
assert.deepEqual(filterRecipes(recipes, { query: 'kajak' }), [], 'když nic nesedí, vrací se prázdné pole');
```

`filterRecipes` umí štítek i nejdelší čas přípravy a obě podmínky platí zároveň s hledáním.

```js
const { filterRecipes } = await helpers.importFile('src/lib/recipes.ts');
const recipes = [
  { id: 1, name: 'Čočka na kyselo', tag: 'bezmasa', minutes: 60, portions: 4, ingredients: [{ name: 'cibule', amount: 2, unit: 'ks' }] },
  { id: 2, name: 'Candát na másle', tag: 'ryba', minutes: 40, portions: 2, ingredients: [{ name: 'candát', amount: 0.5, unit: 'kg' }] },
  { id: 3, name: 'Znojemská pečeně', tag: 'maso', minutes: 120, portions: 4, ingredients: [{ name: 'cibule', amount: 2, unit: 'ks' }] },
];
assert.deepEqual(filterRecipes(recipes, { tag: 'vse' }).map((r) => r.id), [1, 2, 3], 'štítek „vse" znamená nefiltrovat');
assert.deepEqual(filterRecipes(recipes, { tag: 'ryba' }).map((r) => r.id), [2], 'štítek „ryba" má nechat jen rybu');
assert.deepEqual(filterRecipes(recipes, { maxMinutes: 60 }).map((r) => r.id), [1, 2], 'maxMinutes: 60 má nechat recepty do hodiny včetně');
assert.deepEqual(filterRecipes(recipes, { query: 'cibule', maxMinutes: 90 }).map((r) => r.id), [1], 'hledání i čas mají platit zároveň');
```

`formatMinutes` píše čas přípravy pro člověka.

```js
const { formatMinutes } = await helpers.importFile('src/lib/recipes.ts');
assert.equal(helpers.normalize(formatMinutes(40)), '40 min', 'formatMinutes(40) má vrátit „40 min"');
assert.equal(helpers.normalize(formatMinutes(59)), '59 min', 'formatMinutes(59) má vrátit „59 min"');
assert.equal(helpers.normalize(formatMinutes(120)), '2 h', 'formatMinutes(120) má vrátit „2 h", bez nuly minut');
assert.equal(helpers.normalize(formatMinutes(150)), '2 h 30 min', 'formatMinutes(150) má vrátit „2 h 30 min"');
```

`addMeal` a `removeMeal` vrací nový plán a původní nechají beze změny.

```js
const { addMeal, removeMeal, emptyPlan } = await helpers.importFile('src/lib/plan.ts');
const plan = emptyPlan();
const withMeal = addMeal(plan, 'po', 3);
assert.deepEqual(withMeal.po, [3], "addMeal(plan, 'po', 3) má dát recept 3 na pondělí");
assert.deepEqual(plan.po, [], 'původní plán se měnit nesmí');
assert.notEqual(withMeal, plan, 'addMeal má vrátit nový plán, ne ten původní');
assert.deepEqual(addMeal(withMeal, 'po', 3).po, [3], 'stejný recept v jednom dni se nemá přidat dvakrát');

let week = addMeal(withMeal, 'po', 5);
week = addMeal(week, 'ut', 3);
const removed = removeMeal(week, 'po', 3);
assert.deepEqual(removed.po, [5], "removeMeal(plan, 'po', 3) má odebrat jen recept 3 z pondělí");
assert.deepEqual(removed.ut, [3], 'ostatní dny má nechat být');
assert.deepEqual(week.po, [3, 5], 'removeMeal nesmí měnit původní plán');
```

`emptyPlan` má sedm prázdných dní a `countMeals` sečte celý týden.

```js
const { addMeal, countMeals, emptyPlan, DAYS } = await helpers.importFile('src/lib/plan.ts');
assert.equal(Object.keys(emptyPlan()).length, 7, 'prázdný plán má mít sedm dní');
assert.equal(countMeals(emptyPlan()), 0, 'prázdný plán má nula jídel');
let plan = addMeal(emptyPlan(), DAYS[0], 1);
plan = addMeal(plan, DAYS[2], 2);
plan = addMeal(plan, DAYS[2], 3);
assert.equal(countMeals(plan), 3, 'countMeals má sečíst jídla ze všech dní, tady tři');
```

`shoppingList` sloučí stejné suroviny se stejnou jednotkou a sečte množství.

```js
const { shoppingList } = await helpers.importFile('src/lib/shopping.ts');
const recipes = [
  { id: 1, name: 'Čočka', tag: 'bezmasa', minutes: 60, portions: 4, ingredients: [{ name: 'čočka', amount: 0.5, unit: 'kg' }, { name: 'cibule', amount: 2, unit: 'ks' }] },
  { id: 2, name: 'Houbový kuba', tag: 'bezmasa', minutes: 70, portions: 4, ingredients: [{ name: 'houby', amount: 0.3, unit: 'kg' }, { name: 'cibule', amount: 1, unit: 'ks' }] },
];
const items = shoppingList({ po: [1], ut: [2], st: [], ct: [], pa: [], so: [], ne: [] }, recipes, 4);
assert.equal(items.length, 3, `tři různé suroviny mají dát tři položky, vrátilo ${items.length}: ${items.map((i) => i.name).join(', ')}`);
assert.deepEqual(items.find((item) => item.name === 'cibule'), { name: 'cibule', amount: 3, unit: 'ks' }, 'cibule ze dvou receptů se má sečíst na 3 ks');
assert.deepEqual(items.find((item) => item.name === 'čočka'), { name: 'čočka', amount: 0.5, unit: 'kg' }, 'čočka má zůstat 0.5 kg');
assert.deepEqual(recipes[0].ingredients[1], { name: 'cibule', amount: 2, unit: 'ks' }, 'shoppingList nesmí měnit suroviny v receptech — sčítej do nových objektů');
```

`shoppingList` přepočítá množství na zadaný počet strávníků a zaokrouhlí na jedno desetinné místo.

```js
const { shoppingList } = await helpers.importFile('src/lib/shopping.ts');
const recipes = [
  { id: 1, name: 'Čočka', tag: 'bezmasa', minutes: 60, portions: 4, ingredients: [{ name: 'čočka', amount: 0.5, unit: 'kg' }] },
  { id: 3, name: 'Chlebíčky', tag: 'bezmasa', minutes: 45, portions: 6, ingredients: [{ name: 'chléb', amount: 1, unit: 'ks' }] },
];
assert.equal(shoppingList({ po: [1] }, recipes, 2)[0].amount, 0.3, 'recept na 4 porce a 2 strávníci: 0.5 kg se má zmenšit na 0.3 kg (zaokrouhleno na jedno desetinné místo)');
assert.equal(shoppingList({ po: [1] }, recipes, 8)[0].amount, 1, 'recept na 4 porce a 8 strávníků: 0.5 kg má být 1 kg');
assert.equal(shoppingList({ po: [3] }, recipes, 4)[0].amount, 0.7, 'recept na 6 porcí a 4 strávníci: 1 ks má být 0.7 ks');
```

`shoppingList` řadí podle české abecedy a neznámá id receptů přeskočí.

```js
const { shoppingList } = await helpers.importFile('src/lib/shopping.ts');
const recipes = [
  { id: 1, name: 'Mix', tag: 'bezmasa', minutes: 30, portions: 4, ingredients: [
    { name: 'ocet', amount: 1, unit: 'l' },
    { name: 'chléb', amount: 1, unit: 'ks' },
    { name: 'houby', amount: 1, unit: 'kg' },
    { name: 'čočka', amount: 1, unit: 'kg' },
    { name: 'cibule', amount: 1, unit: 'ks' },
  ] },
];
const names = shoppingList({ po: [1] }, recipes, 4).map((item) => item.name);
assert.deepEqual(names, ['cibule', 'čočka', 'houby', 'chléb', 'ocet'], `řadí se podle české abecedy (Č hned za C, Ch až za H), vrátilo: ${names.join(' | ')}`);
assert.deepEqual(shoppingList({ po: [99] }, recipes, 4), [], 'neznámé id receptu se má přeskočit, ne spadnout');
assert.deepEqual(shoppingList({}, recipes, 4), [], 'prázdný plán dá prázdný nákupní seznam');
```

`npm run typecheck` projde bez chyby.

```js
const result = await helpers.run('npm run typecheck', { timeoutMs: 110000 });
assert.equal(result.code, 0, `npm run typecheck má projít bez chyby:\n${result.stdout}${result.stderr}`);
```

`npm run build` projde bez chyby.

```js
const result = await helpers.run('npm run build', { timeoutMs: 110000 });
assert.equal(result.code, 0, `npm run build má projít bez chyby:\n${result.stdout}${result.stderr}`);
```

`npm test` projde a testy jsou aspoň ve dvou souborech, z toho aspoň jeden testuje komponentu.

```js
const testFiles = Object.keys(files).filter((name) => /\.(test|spec)\.[jt]sx?$/.test(name));
assert.ok(testFiles.length >= 2, `vlastní testy mají být aspoň ve dvou souborech, našel jsem ${testFiles.length}: ${testFiles.join(', ') || 'žádný'}`);
assert.ok(testFiles.some((name) => /\.tsx$/.test(name)), `aspoň jeden test má vykreslovat komponentu (soubor .test.tsx), mám jen: ${testFiles.join(', ')}`);
const component = testFiles.filter((name) => /\.tsx$/.test(name)).map((name) => files[name]).join('\n');
assert.match(component, /getByRole|findByRole/, 'test komponenty má hledat prvek dotazem podle role, ne podle třídy');

const result = await helpers.run('npm test', { timeoutMs: 110000 });
assert.equal(result.code, 0, `npm test má projít bez chyby:\n${result.stdout}${result.stderr}`);
```

`apiFetch` posílá cookie u každého požadavku a odpověď `401` převádí na `ApiError`.

```js
const file = files['src/api/client.ts'];
assert.ok(typeof file === 'string', 'chybí soubor src/api/client.ts');
const source = helpers.stripComments(file, 'js');
assert.match(source, /credentials\s*:\s*['"]include['"]/, "apiFetch má u fetch posílat credentials: 'include' — jinak prohlížeč cookie s přihlášením nepřiloží");
assert.match(source, /401/, 'apiFetch má odpověď 401 poznat a udělat z ní ApiError se status 401');
assert.match(source, /ApiError/, 'chyby z API vyhazuj jako ApiError, ať se dá 401 odlišit od skutečné poruchy');
assert.match(source, /\/api/, 'apiFetch má volat adresy pod /api, aby je dev server poslal na API přes proxy');
```

Filtry receptů jsou v adrese pod jmény `hledat`, `stitek` a `do`.

```js
const file = files['src/routes/RecipeList.tsx'];
assert.ok(typeof file === 'string', 'chybí soubor src/routes/RecipeList.tsx');
const source = helpers.stripComments(file, 'js');
assert.match(source, /useSearchParams/, 'filtry drž v adrese přes useSearchParams, ne v useState — odkaz na vyfiltrovanou nabídku má jít poslat');
assert.match(source, /['"]hledat['"]/, "hledaný text má být v adrese pod jménem 'hledat'");
assert.match(source, /['"]stitek['"]/, "zvolený druh má být v adrese pod jménem 'stitek'");
assert.match(source, /filterRecipes/, 'zúžení nabídky nepiš znovu v komponentě — použij filterRecipes z datové vrstvy');
```

Srdíčko u receptu se mění optimisticky a po mutaci se dotaz zneplatní.

```js
const sources = Object.entries(files)
  .filter(([name]) => /^src\/.+\.tsx?$/.test(name) && !/\.(test|spec)\./.test(name))
  .map(([, content]) => helpers.stripComments(content, 'js'))
  .join('\n');
assert.match(sources, /onMutate/, 'optimistická úprava začíná ve volbě onMutate — tam se změna zapíše do cache');
assert.match(sources, /getQueryData/, 'před zásahem si ulož snímek předchozích dat přes getQueryData, jinak není kam se vrátit');
assert.match(sources, /setQueryData/, 'změnu zapiš do cache přes setQueryData, ať se srdíčko překlopí hned');
assert.match(sources, /onError/, 'když server odmítne, ve volbě onError vrať data na uložený snímek');
assert.match(sources, /invalidateQueries/, 'nakonec dotaz na oblíbené zneplatni, ať má poslední slovo server');
```

Chráněná trasa počká na odpověď „kdo jsem" a teprve pak přesměruje.

```js
const sources = Object.entries(files)
  .filter(([name]) => /^src\/.+\.tsx?$/.test(name) && !/\.(test|spec)\./.test(name))
  .map(([, content]) => helpers.stripComments(content, 'js'))
  .join('\n');
assert.match(sources, /<Navigate/, 'nepřihlášeného pošli na přihlášení komponentou <Navigate …>, ne efektem');
assert.match(sources, /isPending|isLoading/, 'chráněná trasa se musí rozhodovat až po tom, co dorazí odpověď „kdo jsem" — jinak přihlášený po F5 skončí na přihlášení');
assert.match(sources, /replace/, 'přesměrování dělej s replace, ať tlačítko Zpět nevrací na chráněnou stránku a odtud zase na přihlášení');
assert.match(sources, /state=\{/, 'zapamatuj si, kam uživatel mířil (state s location), ať ho tam po přihlášení pošleš');
```

# --help--

## --tip--

Postupuj po vrstvách a po každé si spusť kontrolu: nejdřív `src/lib` (čistý
TypeScript, nejlíp rovnou s vlastními testy), pak `apiFetch`, pak hooky nad ním,
a až nakonec obrazovky. Každá vrstva má vlastní požadavky, takže uvidíš pokrok,
i když aplikace ještě nic neumí.

## --tip-- 9

Řazení podle české abecedy nedělá `sort()` ani `<`. V češtině patří Č hned za C
a Ch až za H, což obyčejné porovnání kódů znaků neumí — potřebuješ porovnání,
kterému řekneš jazyk. Zopakuj si to v sekci o řetězcích a číslech.

## --tip-- 13

Cookie neposílá tvůj kód, ale prohlížeč — tvůj kód mu to jen musí dovolit
volbou v nastavení požadavku. Zkontroluj si v DevTools na kartě Network, jestli
u požadavku hlavička `Cookie` opravdu je. Hledej část
[Kam uložit token](see:react-aplikace/auth-z-klienta#kam-ulozit-token).

## --tip-- 15

Optimistická úprava má tři kroky a každý je vlastní volba mutace: ukaž změnu
hned, při chybě ji vezmi zpátky, nakonec se zeptej serveru. Ten prostřední krok
potřebuje hodnotu z prvního — vrať ji z první volby jako kontext. Podrobně je to
v části [Optimistická úprava](see:react-aplikace/tanstack-query#optimisticka-uprava-nez-server-odpovi).

# --review--

Testy hlídají chování a datovou vrstvu. Tohle si projdi sám — právě podle tohohle
se pozná projekt, který v portfoliu pomůže, od projektu, který uškodí.

## --rubric--

- Ve `src/lib` není ani řádek, který by věděl o Reactu nebo o síti. Jde to
  otestovat bez vykreslení a dá se to použít i jinde.
- Žádná hodnota není v aplikaci dvakrát: filtr je jen v adrese, plán jen v cache
  dotazu, nákupní seznam se počítá, neukládá.
- Síť jde jen přes `apiFetch`. V komponentách není ani jedno přímé `fetch`.
- Komponenty jsou krátké. Žádná nemá přes dvě obrazovky kódu; když ano, je uvnitř
  schovaná další komponenta.
- Stav načítání, chyba a prázdný výsledek jsou ošetřené všude, kde se čeká na
  API — ne jen na seznamu receptů.
- Aplikace jde projít jen klávesnicí: filtry, srdíčko, formulář i navigace mají
  viditelný fokus a dají se zmáčknout.
- Testy kontrolují chování, ne zápis. Žádný test nehledá prvek podle třídy.
- `README.md` má jednu sekci navíc: **Rozhodnutí** — proč jsou filtry v adrese,
  proč je přihlášení v cookie a proč se nákupní seznam počítá místo ukládání.
- Víš, co bys příště udělal jinak, a umíš to říct jednou větou.

## --extensions--

**Rozšíření bez testů**

- Vlastní recepty: formulář na přidání receptu se surovinami a `POST` na API
  (endpoint si doplň v `server/index.js`).
- Hledání s prodlevou (*debounce*), ať se při psaní nepřepisuje adresa na každý
  znak — a zároveň ať zůstane jediným zdrojem pravdy adresa.
- Tisk nákupního seznamu: `@media print` bez navigace a bez tlačítek.
- Sdílení plánu odkazem pro nepřihlášené (plán zakódovaný v adrese).

**Rozšíření do portfolia**

- Doinstaluj `@vitejs/plugin-react` a zapni Fast Refresh; do `tsconfig.json`
  přidej `@types/react` a nech kontrolu typů běžet nad celým `src`.
- Nasaď frontend (statický build z `dist/`) a API někam, kde na to jde poslat
  odkaz. Do README dej živou adresu a snímek obrazovky.
- Přidej testy celé cesty v Playwrightu: od seznamu přes přihlášení po nákupní
  seznam, proti `vite preview`.
- Nahraď paměťové úložiště v `server/` skutečnou databází — to je přesně to, co
  se učí v další části kurzu.
