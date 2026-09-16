## --card-- output

Co vypíše tenhle kód?

```js
const params = new URLSearchParams('typ=elektro&typ=mestske');
console.log(params.get('typ'));
```

### --expected--

elektro

### --why--

`get` vrátí **první** hodnotu daného jména, i když jich je v adrese víc. Na
všechny je `getAll`. Proto filtr s víc zaškrtnutými hodnotami nikdy nečti přes
`get`.

### --see--

react-aplikace/routovani#stav-v-url-usesearchparams

## --card-- output

Co vypíše tenhle kód?

```js
const params = new URLSearchParams('typ=elektro');
params.append('typ', 'mestske');
console.log(params.getAll('typ').length);
```

### --expected--

2

### --why--

`append` přidá další hodnotu pod stejným jménem, `set` by tu první přepsal. Na
filtr s víc volbami potřebuješ `append` a `getAll`.

### --see--

react-aplikace/routovani#stav-v-url-usesearchparams

## --card-- output

Co vypíše tenhle kód?

```js
const state = { datum: '2026-10-03' };
const params = new URLSearchParams(state);
state.datum = '2026-10-04';
console.log(params.get('datum'));
```

### --expected--

2026-10-03

### --why--

`URLSearchParams` si hodnoty **zkopíruje**. Není to živý pohled do objektu —
stejně jako adresa v prohlížeči se změní teprve tehdy, když do ní zapíšeš.

### --see--

react-aplikace/druhy-stavu#stav-v-adrese-co-ma-jit-poslat-odkazem

## --card-- output

Co vypíše tenhle kód?

```js
const classes = ['tab', false && 'tab--active', undefined, 'tab--velky'];
console.log(classes.filter(Boolean).join(' '));
```

### --expected--

tab tab--velky

### --why--

Přesně tohle dělá `clsx`: zahodí všechno nepravdivé a zbytek spojí jednou
mezerou. Proto se podmínka píše rovnou do volání a nemusíš hlídat mezery.

### --see--

react-aplikace/styly-v-reactu#podminene-tridy-a-stav

## --card-- output

Co vypíše tenhle kód?

```js
const cache = new Map();
cache.set(JSON.stringify(['ukoly']), 'všechny úkoly');
cache.set(JSON.stringify(['ukoly', 'hotove']), 'jen hotové');
console.log(cache.get(JSON.stringify(['ukoly'])));
```

### --expected--

všechny úkoly

### --why--

Takhle zjednodušeně funguje cache dotazů: klíč se porovnává celý, takže
`['ukoly']` a `['ukoly', 'hotove']` jsou dva různé záznamy. Zneplatnění je
naproti tomu prefixové a zasáhne oba.

### --see--

react-aplikace/tanstack-query#klic-musi-obsahovat-vsechno-na-cem-data-zavisi

## --card-- output

Komponenta dostane v props objekt `bike` a vykreslí se takhle. Rodič pak pošle
jiné kolo s cenou 590. Jaké číslo bude na obrazovce?

```jsx
function BikePrice({ bike }) {
  const [price, setPrice] = useState(bike.pricePerDay);
  return <strong>{price} Kč</strong>;
}
```

### --expected--

390

### --accept--

Původní, tedy 390.
Zůstane to původní číslo.

### --why--

`useState` vezme počáteční hodnotu jen při prvním vykreslení. Nová props se do
existujícího stavu nepromítne. (Výchozí cena kola byla 390 Kč.)

### --see--

react-aplikace/druhy-stavu#typicke-chyby-a-pasti

## --card-- output

V `Card.module.css` je třída `.card-title`. Jakou hodnotu bude mít v prohlížeči
atribut `class` na tomhle nadpisu?

```jsx
<h3 className={styles.cardTitle}>Půjčovné</h3>
```

### --expected--

undefined

### --accept--

class="undefined"
Bude tam text undefined.

### --why--

Objekt má klíče přesně podle jmen tříd v souboru, takže `styles.cardTitle` je
`undefined` a React ho vypíše jako text. Nikde se neohlásí chyba — prvek je jen
nenastylovaný.

### --see--

react-aplikace/styly-v-reactu#css-modules-tridy-bez-kolizi

## --card-- output

Odstavec má obě třídy a obě mají stejnou specificitu. Jaké bude mít vnitřní
odsazení?

```css
.note--warning { padding: 24px; }
.note { padding: 4px; }
```

```jsx
<p className="note note--warning">Kolo vracíš do 18:00.</p>
```

### --expected--

4px

### --accept--

4 px
Čtyři pixely.

### --why--

Pořadí tříd v `className` je jen seznam bez významu. Při shodné specificitě
rozhoduje pořadí v CSS, a `.note` je v souboru níž. Modifikátory proto patří
v CSS pod základní třídu.

### --see--

react-aplikace/styly-v-reactu#typicke-chyby-a-pasti

## --card-- output

Uživatel je přihlášený a otevře chráněnou stránku. Co uvidí?

```jsx
function RequireAuth() {
  const { data: user } = useCurrentUser();   // odpověď dorazí za 200 ms
  if (!user) return <Navigate to="/prihlaseni" replace />;
  return <Outlet />;
}
```

### --expected--

Přihlášení

### --accept--

Přesměruje ho to na přihlášení.
Skončí na přihlašovací stránce.

### --why--

V prvním vykreslení odpověď serveru ještě nedorazila, takže `user` je
`undefined`. Chráněná trasa z toho udělá „nepřihlášen" a přesměruje dřív, než
odpověď přijde. Chybí větev pro stav načítání.

### --see--

react-aplikace/auth-z-klienta#chranena-trasa

## --card-- output

Komponenta načítá recepty z API. Projde tenhle kus testu?

```jsx
render(<RecipeList />);
expect(screen.getByText('Svíčková')).toBeInTheDocument();
```

### --expected--

Ne

### --accept--

Neprojde.
Spadne.
Ne, spadne na tom, že prvek ještě v DOM není.

### --why--

`getBy…` se podívá jednou, hned po vykreslení — v tu chvíli je na obrazovce
ještě stav načítání. Na data, která přijdou později, je `await screen.findByText(…)`.

### --see--

react-aplikace/testy-komponent#kdyz-data-prijdou-pozdeji-findby

## --card-- output

Co má tenhle kus testu za problém a jak se to projeví?

```jsx
expect(screen.getByText('Hotovo')).not.toBeInTheDocument();
```

### --expected--

getByText vyhodí výjimku dřív

### --accept--

Spadne na tom, že prvek nenajde, k expect se vůbec nedostane.
Má tam být queryByText.
queryByText
Test spadne dřív, než se dostane k expect.

### --why--

`getBy…` při nenalezení vyhodí chybu, takže test spadne s hláškou *Unable to
find an element* místo toho, aby prošel. Na ověření nepřítomnosti je `queryBy…`,
které vrátí `null`.

### --see--

react-aplikace/testy-komponent#dotazy-podle-role-a-textu

## --card-- code js

Napiš funkci `classNames(...parts)`, která spojí mezerou jen ty části, které
jsou pravdivé. `classNames('tab', false, undefined, 'tab--velky')` má vrátit
`'tab tab--velky'`, `classNames()` prázdný řetězec.

### --seed--

```js
function classNames(...parts) {
}
```

### --test--

```js
assert.equal(classNames('tab', false, undefined, 'tab--velky'), 'tab tab--velky', "classNames('tab', false, undefined, 'tab--velky') má vrátit 'tab tab--velky'");
assert.equal(classNames(), '', 'classNames() má vrátit prázdný řetězec');
assert.equal(classNames('karta'), 'karta', "classNames('karta') má vrátit 'karta'");
assert.equal(classNames(null, 'aktivni', ''), 'aktivni', "classNames(null, 'aktivni', '') má vrátit 'aktivni'");
```

### --solution--

```js
function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}
```

### --why--

Tohle je jádro `clsx`. Skutečná knihovna umí navíc objekt
`{ 'tab--active': isActive }` a vnořená pole, princip je ale tenhle.

### --see--

react-aplikace/styly-v-reactu#podminene-tridy-a-stav

## --card-- code js

Napiš funkci `toQuery(state)`, která z objektu udělá řetězec parametrů adresy
a vynechá prázdné hodnoty. `toQuery({ typ: 'elektro', hledat: '' })` má vrátit
`'typ=elektro'`.

### --seed--

```js
function toQuery(state) {
}
```

### --test--

```js
assert.equal(toQuery({ typ: 'elektro', hledat: '' }), 'typ=elektro', "toQuery({ typ: 'elektro', hledat: '' }) má vynechat prázdnou hodnotu");
assert.equal(toQuery({}), '', 'toQuery({}) má vrátit prázdný řetězec');
assert.equal(toQuery({ typ: 'elektro', razeni: 'cena' }), 'typ=elektro&razeni=cena', 'dvojice se spojují znakem &');
assert.equal(toQuery({ typ: '', hledat: '' }), '', 'samé prázdné hodnoty dají prázdný řetězec');
```

### --solution--

```js
function toQuery(state) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(state)) {
    if (value !== '' && value != null) params.set(key, value);
  }
  return params.toString();
}
```

### --why--

Prázdné hodnoty do adresy nepatří: `?typ=elektro` se čte i sdílí líp než
`?typ=elektro&hledat=&razeni=`. `URLSearchParams` se navíc postará o zakódování
diakritiky.

### --see--

react-aplikace/routovani#stav-v-url-usesearchparams

## --card-- code js

Napiš funkci `toggleDone(tasks, id)`, která vrátí **nové** pole s přehozeným
příznakem `done` u úkolu s daným `id`. Původní pole ani jeho objekty nemění.

### --seed--

```js
function toggleDone(tasks, id) {
}
```

### --test--

```js
const tasks = [{ id: 1, done: false }, { id: 2, done: true }];
const next = toggleDone(tasks, 1);
assert.equal(next[0].done, true, 'toggleDone(tasks, 1) má u úkolu 1 přehodit done na true');
assert.equal(next[1].done, true, 'ostatní úkoly mají zůstat beze změny');
assert.equal(tasks[0].done, false, 'původní pole se měnit nesmí');
assert.notEqual(next, tasks, 'toggleDone má vrátit nové pole');
assert.notEqual(next[0], tasks[0], 'změněný úkol má být nový objekt, ne ten původní');
assert.deepEqual(toggleDone(tasks, 99).map((task) => task.done), [false, true], 'neznámé id nemá změnit nic');
```

### --solution--

```js
function toggleDone(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}
```

### --why--

Přesně takhle vypadá tělo optimistické úpravy v `onMutate`. Kdyby funkce měnila
původní objekty, neměla by se cache na co vrátit, když server odpověď odmítne.

### --see--

react-aplikace/tanstack-query#optimisticka-uprava-nez-server-odpovi

## --card-- code js

Napiš funkci `peopleError(people, seats)`, která vrátí českou větu, když počet
hostů není celé číslo od 1 do `seats`, a `undefined`, když je v pořádku.

### --seed--

```js
function peopleError(people, seats) {
}
```

### --test--

```js
assert.equal(typeof peopleError(0, 4), 'string', 'nula hostů má vrátit hlášku');
assert.equal(typeof peopleError(5, 4), 'string', 'pět hostů u stolu pro čtyři má vrátit hlášku');
assert.equal(typeof peopleError(2.5, 4), 'string', 'necelý počet hostů má vrátit hlášku');
assert.equal(typeof peopleError(Number(''), 4), 'string', 'prázdné pole (NaN) má vrátit hlášku');
assert.ok(peopleError(0, 4).trim().length > 5, 'hláška má být česká věta, ne prázdný řetězec');
assert.ok(peopleError(5, 4).includes('4'), 'hláška u překročené kapacity má říct, kolik míst u stolu je');
assert.equal(peopleError(1, 4), undefined, 'jeden host je v pořádku');
assert.equal(peopleError(4, 4), undefined, 'čtyři hosté u stolu pro čtyři jsou v pořádku');
```

### --solution--

```js
function peopleError(people, seats) {
  if (!Number.isInteger(people) || people < 1) return 'Napiš, kolik vás přijde — aspoň jeden host.';
  if (people > seats) return `U tohohle stolu je nejvýš ${seats} míst.`;
  return undefined;
}
```

### --why--

`Number.isInteger` odmítne rovnou `NaN` i desetinné číslo, takže nepotřebuješ
zvláštní větev na prázdné pole. Horní mez závisí na datech, proto je hláška
sestavená z hodnoty.

### --see--

react-aplikace/formulare-a-validace#chyby-ktere-uvidi-a-uslysi-kazdy

## --card-- css

Napiš dvě deklarace, které u tlačítka nakreslí viditelný fokusový prstenec dva
pixely od prvku, v barvě z tokenu `--brand`.

### --expected--

```css
outline: 2px solid var(--brand);
outline-offset: 2px;
```

### --why--

Fokus se nikdy neruší, jen překresluje. `outline-offset` odsadí prstenec od
prvku, aby byl vidět i na tmavém pozadí tlačítka.

### --see--

react-aplikace/styly-v-reactu#sdilene-tokeny-a-tmavy-rezim

## --card-- css

Karta má mít barvu povrchu tak, aby se sama přebarvila v tmavém motivu. Napiš
deklaraci jejího pozadí.

### --expected--

```css
background: var(--surface);
```

### --accept--

```css
background-color: var(--surface);
```

### --why--

Komponenta říká „chci barvu povrchu", ne „chci bílou". Tmavý motiv pak stačí
udělat druhou sadou hodnot proměnných na `[data-theme='dark']`.

### --see--

react-aplikace/styly-v-reactu#sdilene-tokeny-a-tmavy-rezim

## --card-- free

Jmenuj pět druhů stavu v React aplikaci a ke každému nástroj, kterým se dělá.
Jak poznáš, do kterého druhu hodnota patří?

### --back--

UI stav (otevřený dialog, přepnutá záložka) — `useState` v nejmenší komponentě,
které stačí. Stav formuláře (rozepsané pole) — `useState` nebo knihovna na
formuláře. Serverová data (seznam objednávek, profil) — knihovna na dotazy,
protože to není stav, ale cache. Stav v adrese (filtr, řazení, otevřené id) —
`useSearchParams` nebo parametr trasy. Globální klientský stav (motiv, jazyk) —
kontext, případně knihovna na stav.

Rozhoduju se čtyřmi otázkami v pořadí a první „ano" vyhrává: vlastní tu hodnotu
server? Má na ni jít poslat odkaz? Píše ji uživatel do formuláře a ještě ji
neodeslal? Potřebuje ji víc než jedna větev komponent? Když nepadne ani jedno
„ano", je to obyčejný UI stav.

### --see--

react-aplikace/druhy-stavu#rozhodovaci-postup-ve-ctyrech-otazkach

## --card-- free

Proč se serverovým datům říká spíš cache než stav? Co z toho plyne pro kód?

### --back--

Seznam objednávek nevlastní aplikace, ale server. To, co je v paměti prohlížeče,
je kopie, která už teď může být neaktuální. Z toho plyne všechno ostatní:
ke každé hodnotě patří i stáří (jestli je čerstvá), stav načítání a stav chyby;
kopie se musí umět obnovit a po každé změně se musí zeptat serveru, jestli to
tak opravdu je.

Prakticky to znamená, že serverová data nepatří do `useState` ani do globálního
úložiště. Tam by ztratila všechno kromě hodnoty a nikdo by nevěděl, kdo je má
obnovit.

### --see--

react-aplikace/druhy-stavu#serverova-data-nejsou-stav-aplikace

## --card-- free

Co musí být v klíči dotazu a co se stane, když tam něco chybí?

### --back--

V klíči musí být všechno, na čem odpověď závisí: jméno zdroje a každý vstup,
který mění výsledek — filtr, stránka, id, řazení, jazyk. Klíč je adresa dat
v cache, takže dvě různé otázky pod jedním klíčem znamenají, že se jejich
odpovědi přepisují.

Když ve filtru v klíči chybí, uvidí uživatel po přepnutí filtru chvíli položky
předchozího filtru a záleží na tom, která odpověď doběhne poslední. Knihovna to
nemá jak poznat — vidí jen klíč, který jí dáš, ne obsah `queryFn`.

### --see--

react-aplikace/tanstack-query#klic-musi-obsahovat-vsechno-na-cem-data-zavisi

## --card-- free

Vysvětli rozdíl mezi zneplatněním dotazu a přepsáním dat v cache. Kdy se hodí co?

### --back--

Zneplatnění (`invalidateQueries`) řekne „tahle data už neplatí" a knihovna se
zeptá serveru znovu. Data zůstanou zatím vidět, takže obrazovka neblikne, a
výsledek je vždycky ten, co si opravdu myslí server.

Přepsání (`setQueryData`) hodnotu v cache rovnou nahradí, bez dotazu. Hodí se
na optimistickou úpravu, kdy chci změnu ukázat okamžitě, a na uložení odpovědi,
kterou mi server vrátil v odpovědi na mutaci. Nebezpečné je to tehdy, když si
myslím, že vím, co server udělal — pořadí, počítadla ani odvozené hodnoty
neuhodnu. Proto se typicky kombinuje obojí: nejdřív přepsat, pak zneplatnit.

### --see--

react-aplikace/tanstack-query#zmena-dat-usemutation-a-invalidace

## --card-- free

Proč se filtr drží v adrese, a ne v `useState`? Vyjmenuj konkrétní následky
obou voleb.

### --back--

V adrese: odkaz se dá poslat a vede na tentýž pohled, tlačítko Zpět vrací
filtry tak, jak uživatel čeká, obnovení stránky nic neztratí a mezi trasami
hodnota přežije, protože nezávisí na tom, jestli je komponenta namontovaná.

V `useState`: odkaz vede vždycky na výchozí pohled, Zpět filtr nevrátí (mění
jen adresu), obnovení stránky filtr smaže a po návratu z detailu je komponenta
nová, takže začíná od nuly. Nejhorší je držet hodnotu na obou místech — pak se
tiše rozejdou a zvýrazněné tlačítko neodpovídá vypsanému seznamu.

### --see--

react-aplikace/druhy-stavu#stav-v-adrese-co-ma-jit-poslat-odkazem

## --card-- free

Kam se ukládá přihlašovací token a proč? Co je slabina obou možností?

### --back--

Do cookie s `HttpOnly`, `Secure` a `SameSite=Lax`. JavaScript na ni nedosáhne,
takže ji cizí skript na stránce nepřečte, a prohlížeč ji přikládá sám.

Slabina cookie je požadavek z cizí stránky (CSRF) — ten se zavírá atributem
`SameSite` a případně ověřovacím tokenem. Slabina `localStorage` je cizí skript
na stránce (XSS): ten má stejná práva jako můj vlastní kód a token si přečte
jedním řádkem. Proti tomu obrana neexistuje, kdežto CSRF se dá zavřít jedním
atributem — proto vyhrává cookie.

### --see--

react-aplikace/auth-z-klienta#kam-ulozit-token

## --card-- free

Co všechno se z bezpečnosti nesmí řešit jen na klientovi? Uveď zkoušku, podle
které to poznáš.

### --back--

Nic, co rozhoduje o přístupu nebo o penězích: oprávnění a role, filtrování cizích
dat, výpočet ceny, slevy a nároku, ověření platnosti tokenu. Skryté tlačítko je
pohodlí pro uživatele, ne zákaz — endpoint existuje dál a dá se zavolat přímo.
Chráněná trasa chrání obrazovku, ne data.

Zkouška: *kdyby tenhle požadavek přišel z příkazové řádky s cizí cookie, odmítl
by ho server?* Když ne, oprava patří na server, ne do komponenty.

### --see--

react-aplikace/auth-z-klienta#co-se-nikdy-neresi-jen-na-klientovi

## --card-- free

Podle čeho se v testu komponenty rozhoduješ, jak prvek najít? Jmenuj pořadí
a zdůvodni ho.

### --back--

Odshora: podle role a přístupného jména (`getByRole('button', { name: 'Uložit' })`),
podle popisku pole (`getByLabelText`), podle viditelného textu (`getByText`)
a teprve úplně nakonec podle `data-testid`.

Pořadí kopíruje, jak blízko je dotaz uživateli. Dotaz podle role navíc testuje
přístupnost mimochodem: co nenajde on, nenajde ani čtečka obrazovky — `<div>`
s `onClick` místo tlačítka nebo ikona bez popisku se takhle provalí samy.
`data-testid` nikdy nespadne, ale taky nikdy nic neodhalí.

### --see--

react-aplikace/testy-komponent#dotazy-podle-role-a-textu

## --card-- free

Co testovat na komponentě a co ne? A co naopak patří do testu v prohlížeči?

### --back--

Testovat: podmínky ve vykreslení (prázdný seznam, chyba, načítání), akci
uživatele a její následek, hraniční data a každou chybu, kterou mi někdo
nahlásil. Netestovat: dosazení props do šablony, konkrétní třídy a rozvržení,
vzhled ani cizí knihovnu.

Do prohlížeče (Playwright) patří celá cesta přes víc stránek — od seznamu přes
formulář po potvrzení — protože jsdom neumí skutečné rozvržení, navigaci ani
cookies. Rozdělení, které drží: hodně testů čistých funkcí, středně testů
komponent, pár testů celé cesty.

### --see--

react-aplikace/testy-komponent#co-testovat-a-co-ne

## --card-- free

Kdy sáhneš po CSS Modules a kdy po Tailwindu? Co je společný důvod, proč vůbec
existují?

### --back--

Společný důvod: v globálním CSS je jméno třídy adresa v celé aplikaci, takže se
dvě komponenty můžou nechtěně potkat a nikdo si netroufne staré pravidlo smazat.
CSS Modules to řeší přejmenováním při buildu, Tailwind tím, že žádné jméno
nevymýšlíš.

CSS Modules si vyberu, když chci psát dál obyčejné CSS a mít styl u komponenty.
Tailwind, když chci rychle stavět rozhraní a držet škálu rozestupů a velikostí.
V jednom projektu volím jedno hlavní řešení; výjimka pro jednu komponentu se
složitou animací nebo `@container` je v pořádku, míchání tří přístupů ne.

### --see--

react-aplikace/styly-v-reactu#co-si-vybrat-do-projektu

## --card-- free

Aplikace po přihlášení ukazuje data předchozího uživatele. Popiš, co se
nejspíš stalo a jak vypadá správné odhlášení.

### --back--

Odhlášení nechalo cache dotazů plnou. Server sice cookie zrušil, takže další
požadavek neprojde, ale všechno, co aplikace stihla načíst, jí zůstalo v paměti
— a po přihlášení jiného účtu to na okamžik blikne, než dorazí čerstvá odpověď.

Správné odhlášení má dva kroky: `POST /api/logout` (cookie ruší server, klient
na ni nedosáhne, je `HttpOnly`) a hned po něm `queryClient.clear()`. Samotné
`invalidateQueries` nestačí — to data v cache nechá a jen si je poznamená jako
stará.

### --see--

react-aplikace/auth-z-klienta#odhlaseni-a-uklid-cache
