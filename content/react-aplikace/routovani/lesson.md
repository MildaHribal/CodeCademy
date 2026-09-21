# Routování

Každá aplikace, kterou má smysl někomu poslat, má víc než jednu obrazovku:
katalog a detail produktu, seznam receptů a jeden recept, přihlášení a profil.
A každá z nich má mít **vlastní adresu** — aby se dala poslat v chatu, otevřít na
druhé kartě a aby tlačítko Zpět dělalo to, co člověk čeká. Tomu se v Reactu říká
routování a v této sekci na něm postavíš všechno ostatní.

:::check pretest
V aplikaci s React Routerem klikneš na `<a href="/recepty">Recepty</a>`. Co se
stane?

### --answer--

Router adresu zachytí a jen překreslí obsah.

#### --why--

Kdyby to platilo pro každý odkaz, nemusela by existovat komponenta `Link`. Čím se
`<a>` a `Link` liší, uvidíš v části o odkazech.

### --correct--

Prohlížeč načte celou stránku znovu, jako by šlo o jiný web.

#### --why--

Ano — a s ní i celou aplikaci, takže se ztratí stav a bliknutí je vidět. Proto se
v aplikaci klikací odkazy píšou jako `Link`.

### --answer--

Nestane se nic, React `<a>` ignoruje.

#### --why--

`<a>` je obyčejný HTML odkaz a prohlížeč ho obslouží vždycky. Otázka je jen, jestli
se do toho vloží router.
:::

:::check pretest
Máš trasu `/recepty` a v ní vnořenou trasu `/recepty/:id`. Jak se jmenuje
komponenta, kterou v layoutu `/recepty` napíšeš na místo, kam se má vnořená
trasa vykreslit? Tipni si.

### --expected--

Outlet

### --accept--

<Outlet />

### --why--

`Outlet` je „díra" v layoutu. Vnořený layout je jedna z věcí, kterou routování
umí a `useState` ne — a kvůli které se ho vyplatí učit.
:::

## Proč ne podmínky ve stavu

Bez routeru se to dá udělat takhle — a přesně takhle to vypadá ve většině
prvních projektů:

```jsx
const [obrazovka, setObrazovka] = useState('seznam');

return (
  <>
    {obrazovka === 'seznam' && <SeznamKol onVyber={() => setObrazovka('detail')} />}
    {obrazovka === 'detail' && <DetailKola />}
  </>
);
```

Funguje to do chvíle, kdy někdo chce výsledek použít. Co všechno nejde:

| co chce uživatel | s `useState` | s trasami |
|---|---|---|
| poslat kamarádce odkaz na detail | pošle domovskou stránku | pošle `/kola/42` |
| zmáčknout Zpět | vyskočí z aplikace | vrátí se na seznam |
| obnovit stránku (F5) | je zpátky na začátku | zůstane, kde byl |
| mít otevřené dvě karty s jiným filtrem | nejde | jde |

> [!REMEMBER]
> **[[trasa|Trasa]] je funkce z adresy na kus stránky.** A [[stav v URL|adresa]] je stav,
> který přežije obnovení stránky, jde poslat odkazem a umí tlačítko Zpět. Nic
> z toho `useState` nedokáže.

:::check
Uživatel si nastaví filtr, pošle odkaz kolegovi a ten uvidí nefiltrovaný seznam.
Kde je filtr uložený?

### --expected--

Ve stavu komponenty

### --accept--

V useState, ne v URL.
V komponentě místo v adrese.

### --why--

Odkaz nese jen adresu. Co je v `useState`, v odkazu není — proto filtry, řazení
a stránkování patří do adresy.

### --see--

react-aplikace/routovani#proc-ne-podminky-ve-stavu
:::

## Trasy deklarativně: Routes a Route

Nejjednodušší režim React Routeru je deklarativní: router obalí aplikaci a uvnitř
napíšeš seznam tras. Vykreslí se ta, která **celou** adresu matchne:

:::live react
```jsx
import { MemoryRouter, Routes, Route, Link } from 'react-router';

function Seznam() {
  return (
    <div>
      <h1>Kola na půjčení</h1>
      <ul>
        <li><Link to="/kola/42">Krosové kolo Author</Link></li>
        <li><Link to="/kola/7">Elektrokolo Crussis</Link></li>
      </ul>
    </div>
  );
}

function Detail() {
  return (
    <div>
      <h1>Detail kola</h1>
      <Link to="/">← Zpět na seznam</Link>
    </div>
  );
}

export default function App() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <div className="obal">
        <Routes>
          <Route path="/" element={<Seznam />} />
          <Route path="/kola/:id" element={<Detail />} />
          <Route path="*" element={<h1>Stránka neexistuje</h1>} />
        </Routes>
      </div>
    </MemoryRouter>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.obal { max-width: 460px; margin: 24px auto; padding: 24px; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgb(31 41 51 / 0.12); }
h1 { margin: 0 0 12px; font-size: 1.25rem; }
ul { margin: 0; padding-left: 20px; }
a { color: #1f6f4f; text-decoration-thickness: 1px; text-underline-offset: 3px; }
a:hover { color: #123f2d; }
```
:::

Zkus v `initialEntries` změnit `'/'` na `'/kola/42'` a pak na `'/kolo/42'` —
druhá adresa žádnou trasu nematchne, takže se vykreslí `*`.

> [!NOTE]
> V náhledu Akademie používáme `MemoryRouter`: stránka běží v sandboxu bez
> vlastního adresního řádku, takže adresu drží router v paměti. **Ve svém projektu
> místo něj napíšeš `BrowserRouter`** (nebo `createBrowserRouter`) a adresa se
> objeví v prohlížeči. Všechno ostatní — `Routes`, `Route`, `Link`, `useParams` —
> je stejné.

:::check
Co vykreslí `<Route path="/kola/:id" element={<Detail />} />` pro adresu `/kola`?

### --expected--

Nic

### --accept--

Nic, ta trasa se nematchne.
Vykreslí se trasa *, protože /kola nemá id.

### --why--

`:id` je povinná část cesty. Adresa `/kola` tuhle trasu nematchne, takže spadne
až na `path="*"`. Seznam a detail proto bývají dvě trasy: `/kola` a `/kola/:id`.

### --see--

react-aplikace/routovani#trasy-deklarativne-routes-a-route
:::

## Odkazy: Link a NavLink

`Link` vykreslí obyčejné `<a href>` — kliknutí ale zachytí a místo načtení
stránky jen přepne trasu. [[NavLink]] navíc ví, jestli je jeho cíl právě otevřený:

:::live react
```jsx
import { MemoryRouter, Routes, Route, NavLink, useNavigate } from 'react-router';

function Nabidka() {
  return (
    <nav>
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'odkaz aktivni' : 'odkaz')}>
        Přehled
      </NavLink>
      <NavLink to="/kola" className={({ isActive }) => (isActive ? 'odkaz aktivni' : 'odkaz')}>
        Kola
      </NavLink>
      <NavLink to="/servis" className={({ isActive }) => (isActive ? 'odkaz aktivni' : 'odkaz')}>
        Servis
      </NavLink>
    </nav>
  );
}

function Prehled() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Přehled</h1>
      <button type="button" onClick={() => navigate('/kola')}>
        Rovnou na kola
      </button>
    </div>
  );
}

export default function App() {
  return (
    <MemoryRouter>
      <div className="obal">
        <Nabidka />
        <Routes>
          <Route path="/" element={<Prehled />} />
          <Route path="/kola" element={<h1>Kola</h1>} />
          <Route path="/servis" element={<h1>Servis</h1>} />
        </Routes>
      </div>
    </MemoryRouter>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.obal { max-width: 460px; margin: 24px auto; padding: 24px; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgb(31 41 51 / 0.12); }
nav { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
.odkaz { padding: 8px 12px; color: #6b7280; text-decoration: none; border-bottom: 2px solid transparent; transition: color 150ms ease, border-color 150ms ease; }
.odkaz:hover { color: #1f2933; }
.aktivni { color: #1f6f4f; border-bottom-color: #1f6f4f; font-weight: 600; }
h1 { margin: 0; font-size: 1.25rem; }
button { margin-top: 12px; border: 0; border-radius: 8px; padding: 8px 14px; background: #1f6f4f; color: #fff; font: inherit; cursor: pointer; }
```
:::

Zkus smazat `end` u prvního `NavLink` a klikat po nabídce: „Přehled" zůstane
zvýrazněný pořád, protože `/` je předpona každé adresy. `end` znamená „zvýrazni
mě jen při přesné shodě".

[[useNavigate]] je totéž bez odkazu — pro navigaci **po akci** (odeslaný formulář,
úspěšné přihlášení). Pro věci, na které se kliká, vždycky `Link`: dostaneš
prostřední klik, otevření v nové kartě i čtečku obrazovky zdarma.

:::check
Proč se na navigační tlačítko „Rovnou na kola" nehodí `Link`, ale na položky
nabídky ano? Napiš to naopak: kdy se hodí `useNavigate`?

### --expected--

Když se má přesměrovat po akci

### --accept--

Po odeslání formuláře nebo jiné akci, na kterou se neklikká jako na odkaz.
Když navigaci nespouští klik na odkaz, ale kód.

### --why--

`Link` je odkaz — patří tam, kam uživatel klikne, aby se někam dostal.
`useNavigate` použiješ, když o přesunu rozhodne kód: po uložení, po přihlášení,
po chybě. Tlačítko v ukázce je záměrně „špatný" příklad: kdyby jen vedlo na jinou
adresu, měl to být `Link`.

### --see--

react-aplikace/routovani#odkazy-link-a-navlink
:::

## Parametr trasy: /kola/:id

Dvojtečka v cestě znamená „tady bude něco proměnného". Hodnotu přečteš hookem
`useParams` — a je to **vždycky text**:

:::live react
```jsx
import { MemoryRouter, Routes, Route, Link, useParams } from 'react-router';

const kola = [
  { id: 42, nazev: 'Krosové kolo Author', cenaDen: 350 },
  { id: 7, nazev: 'Elektrokolo Crussis', cenaDen: 690 },
];

function Detail() {
  const { id } = useParams();
  // id je text '42', proto Number() — jinak by === nikdy nesedělo
  const kolo = kola.find((k) => k.id === Number(id));

  if (!kolo) {
    return (
      <div>
        <h1>Kolo {id} nemáme</h1>
        <Link to="/">← Zpět na seznam</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>{kolo.nazev}</h1>
      <p>{kolo.cenaDen} Kč / den</p>
      <p className="typ">
        typ id: {typeof id}
      </p>
      <Link to="/">← Zpět na seznam</Link>
    </div>
  );
}

export default function App() {
  return (
    <MemoryRouter initialEntries={['/kola/42']}>
      <div className="obal">
        <Routes>
          <Route path="/" element={<Link to="/kola/42">Na detail</Link>} />
          <Route path="/kola/:id" element={<Detail />} />
        </Routes>
      </div>
    </MemoryRouter>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.obal { max-width: 460px; margin: 24px auto; padding: 24px; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgb(31 41 51 / 0.12); }
h1 { margin: 0 0 4px; font-size: 1.25rem; }
p { margin: 0 0 12px; color: #6b7280; }
.typ { font-family: ui-monospace, monospace; font-size: 0.85rem; color: #b45309; }
a { color: #1f6f4f; }
```
:::

Zkus v `initialEntries` napsat `'/kola/999'` a sleduj, že komponenta nespadne —
jen ukáže „Kolo 999 nemáme". Tahle podmínka je povinná: parametr v adrese píše
uživatel, ne ty.

:::live react predict
```jsx
import { MemoryRouter, Routes, Route } from 'react-router';

export default function App() {
  return (
    <MemoryRouter initialEntries={['/kola/42/recenze']}>
      <Routes>
        <Route path="/kola/:id" element={<h1>Detail kola 42</h1>} />
        <Route path="*" element={<h1>Stránka neexistuje</h1>} />
      </Routes>
    </MemoryRouter>
  );
}
```
--question-- Co se vykreslí pro adresu `/kola/42/recenze`?
--option-- Detail kola 42 — `:id` matchne `42` a zbytek adresy se ignoruje
--option*-- Stránka neexistuje — trasa `/kola/:id` matchne celou adresu, ne její začátek
--option-- Router vyhodí chybu, že trasa neexistuje
--why-- `path` se porovnává s **celou** adresou. `/kola/:id` odpovídá `/kola/42`, ale ne `/kola/42/recenze` — na to potřebuješ vnořenou trasu (`<Route path="/kola/:id"><Route path="recenze" …/></Route>`) nebo hvězdičku na konci (`path="/kola/:id/*"`). Nic nespadne: nematchnutá adresa jen propadne na `path="*"`.
:::

:::check
V detailu máš `const { id } = useParams()` a `kola.find((k) => k.id === id)`,
ale výsledek je vždycky `undefined`, i když kolo existuje. Co je špatně?

### --expected--

id je text, ne číslo

### --accept--

Chybí Number(id), protože useParams vrací řetězec.
Porovnáváš číslo s textem přísnou rovností.

### --why--

`useParams` vrací hodnoty z adresy, a adresa je text: `'42' === 42` je `false`.
Buď převeď (`Number(id)`), nebo drž id v datech jako text. Tohle je nejčastější
chyba v detailních stránkách vůbec.

### --see--

react-aplikace/routovani#parametr-trasy-kola-id
:::

## Vnořený layout a Outlet

Většina aplikací má kus stránky, který se nemění: hlavičku, nabídku, patičku.
[[vnořená trasa|Vnořené trasy]] to řeší tak, že **rodičovská trasa vykreslí layout** a na místo
[[Outlet]] přijde ta vnořená:

:::live react
```jsx
import { MemoryRouter, Routes, Route, NavLink, Outlet } from 'react-router';

function LayoutKol() {
  return (
    <section>
      <h1>Půjčovna kol</h1>
      <nav>
        <NavLink to="/kola" end>Seznam</NavLink>
        <NavLink to="/kola/servis">Servis</NavLink>
      </nav>
      <div className="obsah">
        <Outlet />
      </div>
      <p className="pata">Hlavička, nabídka i patička zůstávají — mění se jen obsah.</p>
    </section>
  );
}

export default function App() {
  return (
    <MemoryRouter initialEntries={['/kola']}>
      <div className="obal">
        <Routes>
          <Route path="/kola" element={<LayoutKol />}>
            <Route index element={<p>Máme 24 kol k zapůjčení.</p>} />
            <Route path="servis" element={<p>Servis máme každý čtvrtek.</p>} />
            <Route path=":id" element={<p>Detail jednoho kola.</p>} />
          </Route>
        </Routes>
      </div>
    </MemoryRouter>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.obal { max-width: 460px; margin: 24px auto; padding: 24px; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgb(31 41 51 / 0.12); }
h1 { margin: 0 0 12px; font-size: 1.25rem; }
nav { display: flex; gap: 12px; }
nav a { color: #1f6f4f; }
nav a.active { font-weight: 700; }
.obsah { margin: 16px 0; padding: 16px; background: #f1f5f2; border-radius: 8px; }
.pata { margin: 0; font-size: 0.85rem; color: #6b7280; }
```
:::

Klikej mezi „Seznam" a „Servis": hlavička ani nabídka se nepřekreslují od nuly,
protože layout zůstává namontovaný. Všimni si dvou věcí:

- cesty vnořených tras jsou **relativní** (`servis`, ne `/kola/servis`),
- `index` je trasa pro adresu rodiče samotného (`/kola`).

`NavLink` bez `className` mimochodem sám přidává třídu `active` — proto stačí
nastylovat `nav a.active`.

:::check
Layout `/kola` máš, vnořenou trasu `servis` taky, ale na `/kola/servis` se text
servisu nikde neobjeví. Co v layoutu chybí?

### --expected--

Outlet

### --accept--

<Outlet />
Chybí Outlet, kam se vnořená trasa vykreslí.

### --why--

Rodičovská trasa vykreslí svůj `element` a ten musí říct, **kam** vnořenou trasu
umístit. Bez `Outlet` se vnořená trasa sice matchne, ale nemá se kde vykreslit.

### --see--

react-aplikace/routovani#vnoreny-layout-a-outlet
:::

## Stav v URL: useSearchParams

Filtr, řazení, stránka výpisu a otevřená záložka nepatří do cesty, ale do
parametrů za `?`. [[useSearchParams]] s nimi pracuje jako `useState` — jen bydlí
v adrese:

:::live react
```jsx
import { MemoryRouter, useSearchParams } from 'react-router';

const kola = [
  { id: 1, nazev: 'Krosové kolo Author', typ: 'kros', cena: 350 },
  { id: 2, nazev: 'Elektrokolo Crussis', typ: 'elektro', cena: 690 },
  { id: 3, nazev: 'Horské kolo Rock Machine', typ: 'hory', cena: 420 },
  { id: 4, nazev: 'Elektrokolo Kellys', typ: 'elektro', cena: 750 },
];

function Katalog() {
  const [parametry, setParametry] = useSearchParams();
  const typ = parametry.get('typ') ?? 'vse';
  const videt = typ === 'vse' ? kola : kola.filter((kolo) => kolo.typ === typ);

  return (
    <div>
      <h1>Katalog</h1>
      <div className="filtr">
        {['vse', 'kros', 'elektro', 'hory'].map((moznost) => (
          <button
            key={moznost}
            type="button"
            className={moznost === typ ? 'zvolene' : ''}
            onClick={() => setParametry(moznost === 'vse' ? {} : { typ: moznost })}
          >
            {moznost}
          </button>
        ))}
      </div>
      <p className="adresa">adresa: /katalog?{parametry.toString() || '(bez parametrů)'}</p>
      <ul>
        {videt.map((kolo) => (
          <li key={kolo.id}>
            {kolo.nazev} — {kolo.cena} Kč/den
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <MemoryRouter initialEntries={['/katalog?typ=elektro']}>
      <div className="obal">
        <Katalog />
      </div>
    </MemoryRouter>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.obal { max-width: 460px; margin: 24px auto; padding: 24px; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgb(31 41 51 / 0.12); }
h1 { margin: 0 0 12px; font-size: 1.25rem; }
.filtr { display: flex; gap: 8px; flex-wrap: wrap; }
button { border: 1px solid #d1d5db; border-radius: 999px; padding: 6px 14px; background: #fff; font: inherit; cursor: pointer; transition: background 150ms ease, border-color 150ms ease; }
button:hover { border-color: #1f6f4f; }
.zvolene { background: #1f6f4f; border-color: #1f6f4f; color: #fff; }
.adresa { font-family: ui-monospace, monospace; font-size: 0.8rem; color: #b45309; }
ul { margin: 0; padding-left: 20px; }
li { margin-bottom: 4px; }
```
:::

Zkus změnit `initialEntries` na `'/katalog'` a sleduj, že filtr začne na „vse" —
výchozí hodnota je v `?? 'vse'`, ne ve stavu. Tři věci, které se u parametrů
v adrese dělají vždycky:

- **výchozí hodnotu** drž při čtení (`parametry.get('typ') ?? 'vse'`), ne v `useState`,
- **prázdnou hodnotu smaž**, ať adresa nezaplevelí (`?typ=vse` nikoho nezajímá),
- při psaní do vyhledávacího políčka přidej `{ replace: true }`, aby každé písmeno
  nezaložilo záznam v historii (jinak se Zpět musí mačkat dvacetkrát).

> [!TIP]
> `setParametry` bere i funkci předchozí hodnoty, takže jeden parametr změníš bez
> smazání ostatních: `setParametry((stare) => { stare.set('typ', 'kros'); return stare; })`.

:::check
Do políčka hledání píšeš text a ukládáš ho do adresy přes `setParametry`. Po
dvaceti znacích je tlačítko Zpět nepoužitelné. Co chybí?

### --expected--

replace: true

### --accept--

{ replace: true }
Druhý argument setParametry s replace, aby se nezakládal nový záznam v historii.

### --why--

Každé `setParametry` jinak přidá nový záznam do historie. Při psaní chceš
poslední záznam přepsat: `setParametry(dalsi, { replace: true })`.

### --see--

react-aplikace/routovani#stav-v-url-usesearchparams
:::

## Datový režim: createBrowserRouter

Deklarativní zápis (`<Routes>`) je v pořádku pro malou aplikaci. Jak roste,
přesune se seznam tras do datové struktury — a tím se odemknou věci, které
`<Routes>` neumí: chybová hranice na trasu, [[líná trasa|líné načítání]] a `loader`.

```jsx
// src/main.jsx
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createRoot } from 'react-dom/client';
import LayoutKol from './LayoutKol';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutKol />,
    errorElement: <p>Něco se rozbilo. Zkus to znovu.</p>,
    children: [
      { index: true, element: <Prehled /> },
      // líná trasa: kód detailu se stáhne až při prvním otevření
      { path: 'kola/:id', lazy: () => import('./DetailKola') },
      { path: '*', element: <Nenalezeno /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(<RouterProvider router={router} />);
```

Dva importy, které si zapamatuj, protože se pletou: `createBrowserRouter` je
z `react-router`, `RouterProvider` z **`react-router/dom`**.

> [!NOTE]
> React Router má tři režimy: **deklarativní** (`<Routes>`), **datový**
> ([[datový režim|`createBrowserRouter`]], tahle část) a **frameworkový** (vlastní build,
> serverové vykreslování, generované typy tras). V téhle sekci zůstáváme u prvních
> dvou; frameworkový režim a jeho konkurence (TanStack Router se skvělými typy,
> nebo Next.js s vlastním routováním v části o fullstacku) dělají navíc věci,
> které teď nepotřebuješ.

:::check
Trasa `kola/:id` je v datovém režimu napsaná jako `lazy: () => import('./DetailKola')`.
Co tím aplikace získá?

### --expected--

Kód detailu se stáhne až při otevření

### --accept--

Menší první balíček — kód trasy se načte, až když je potřeba.
Rozdělí se balíček, detail se nestahuje zbytečně.

### --why--

Bez `lazy` je kód všech tras v jednom balíčku a uživatel ho stahuje celý, i když
si otevře jen domovskou stránku. `lazy` (nebo `React.lazy`) balíček rozdělí.

### --see--

react-aplikace/routovani#datovy-rezim-createbrowserrouter
:::

:::explain
Vysvětli vlastními slovy, proč patří filtr ve výpisu produktů spíš do adresy než do
`useState`.

## --model--
Stav v `useState` žije jen v paměti té jedné záložky: po obnovení stránky je pryč,
nejde poslat odkazem a tlačítko Zpět se k němu nevrátí. Adresa naproti tomu tohle
všechno umí sama — je to stav, který je vidět, dá se sdílet, zálohovat v záložkách
a prohlížeč pro něj vede historii. Proto do ní patří všechno, co by měl uživatel umět
uložit nebo někomu poslat: hledaný výraz, zvolený filtr, číslo stránky, otevřená
záložka. V paměti zůstává to, co je opravdu pomíjivé: rozepsaný text, otevřené menu,
zda se právě načítá.

## --checklist--
- Stav v paměti nepřežije obnovení stránky.
- Adresa jde poslat odkazem a uložit do záložek.
- Prohlížeč pro adresu vede historii, takže funguje Zpět.
- V paměti zůstává jen pomíjivý stav.
:::

## Typické chyby a pasti

> [!PITFALL]
> **`useNavigate` mimo router.** Hláška
> `Error: useNavigate() may be used only in the context of a <Router> component.`
> znamená, že komponenta, která hook volá, není uvnitř `BrowserRouter` /
> `RouterProvider`. Typicky když si někdo router vykreslí až uvnitř `App`, ale
> hook použije v komponentě nad ním.

> [!PITFALL]
> **Lomítko na začátku cíle.** `to="/servis"` je absolutní adresa (z korene),
> `to="servis"` relativní k aktuální trase. Ve vnořeném layoutu `/kola` tak
> `to="/servis"` odnaviguje na `/servis`, ne na `/kola/servis`. Když se odkaz
> „propadává" na 404, tohle je první, co zkontroluješ.

> [!PITFALL]
> **[[parametr trasy|Parametry]] z adresy jsou text a mohou být cokoli.** `/kola/abc` je platná
> adresa, `Number('abc')` je `NaN` a `kola.find(...)` vrátí `undefined`. Bez
> podmínky „nenašlo se" spadne detail na
> `TypeError: Cannot read properties of undefined (reading 'nazev')`.

> [!PITFALL]
> **Zapomenutá trasa `*`.** Bez ní se na neznámé adrese nevykreslí **nic** —
> prázdná bílá stránka bez chyby v konzoli, kterou se hledá nejhůř.

> [!PITFALL]
> **Filtr v `useState` vedle adresy.** Když je filtr ve stavu a zároveň v adrese,
> jeden z nich se po Zpět rozejde s druhým. Adresa je [[zdroj pravdy]]: čti z ní,
> zapisuj do ní, nekopíruj si ji do stavu.

:::check
Odkaz uvnitř vnořeného layoutu `/kola` má vést na `/kola/servis`. Proč `to="/servis"`
skončí jinde a co s tím?

### --expected--

Lomítko na začátku dělá adresu absolutní

### --accept--

Má tam být to="servis", bez lomítka na začátku.
Lomítko znamená adresu od kořene, relativní cíl se píše bez něj.

### --why--

`to="/servis"` je adresa od kořene aplikace, takže vnořená trasa nehraje roli.
Relativní cíl (`to="servis"`) se skládá k aktuální trase. Když se odkaz
„propadává" na 404, zkontroluj nejdřív tohle.

### --see--

react-aplikace/routovani#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) —
  `pushState` a `popstate`, tedy to, co router používá pod pokličkou.
- [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) —
  `get`, `set`, `toString`; `useSearchParams` vrací přesně tenhle objekt.
- [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) — z čeho se adresa
  skládá (`pathname`, `search`, `hash`), aby bylo jasné, co je cesta a co parametr.

> [!NOTE]
> React Router má vlastní dokumentaci na [reactrouter.com](https://reactrouter.com/)
> — u každého hooku je ukázka a seznam parametrů. Pozor při hledání na verzi:
> tutoriály starší než rok mluví o balíčku `react-router-dom`, který už
> neexistuje. Dnes se všechno importuje z `react-router` (a `RouterProvider`
> z `react-router/dom`).

# --questions--

## --question--

Aplikace má trasy `/`, `/kola` a `/kola/:id`. Uživatel otevře `/kola/12`, klikne
na odkaz `<Link to="servis">` v layoutu `/kola` a skončí na adrese, kterou nikdo
neobsluhuje. Na jaké adrese je?

### --expected--

/kola/12/servis

### --why--

Relativní cíl se skládá k **aktuální** trase, a tou je `/kola/12`. Buď napiš
`to="/kola/servis"` (absolutně), nebo `to="../servis"`.

### --see--

react-aplikace/routovani#typicke-chyby-a-pasti

## --question--

Proč se filtr produktů drží v adrese, i když by šel do `useState`? Vyber
nejpřesnější důvod.

### --answer--

Protože `useState` se při každém vykreslení maže.

#### --why--

`useState` se nemaže při vykreslení, jen při odmontování komponenty. Důvod je
jiný — souvisí s tím, co si uživatel odnese z aplikace pryč.

### --correct--

Protože stav v adrese se dá poslat odkazem, obnovit F5 a projít tlačítkem Zpět.

#### --why--

Tři vlastnosti, které `useState` nemá: odkaz, obnovení stránky a historie. Proto
filtry, řazení a stránkování patří do adresy.

### --answer--

Protože adresa je rychlejší než stav v komponentě.

#### --why--

Rychlost v tom nehraje roli — zápis do adresy je dokonce o krok delší. Jde o to,
co se stavem může udělat uživatel.

## --question--

Ve vnořené trase `<Route path="kola" element={<LayoutKol />}>` chceš trasu, která
se vykreslí přesně pro adresu `/kola`. Jak takovou vnořenou trasu zapíšeš? Napiš
celý řádek.

### --expected--

```jsx
<Route index element={<Prehled />} />
```

### --accept--

```jsx
<Route index element={<SeznamKol />} />
```

### --why--

`index` znamená „výchozí obsah tohoto layoutu". Bez ní by `/kola` vykreslilo
layout s prázdným `Outlet`. Zápis `path=""` funguje taky, ale `index` je čitelnější
a router s ní počítá i v datovém režimu.

### --see--

react-aplikace/routovani#vnoreny-layout-a-outlet

## --question--

Na adrese `/kola/999`, kde kolo s id 999 neexistuje, chceš ukázat „Kolo nemáme"
a odkaz zpět. Kde tu podmínku napíšeš?

### --answer--

Do trasy `*`, ta se o neexistující věci stará.

#### --why--

Trasa `*` řeší neexistující **adresy**. `/kola/999` je platná adresa — jen v datech
nic není.

### --correct--

Do komponenty detailu, hned po vyhledání kola podle id.

#### --why--

Trasa se matchla a komponenta se vykreslila; jen hledání nic nenašlo. Proto tam
patří `if (!kolo) return …` před zbytkem JSX.

### --answer--

Nikam — router `undefined` pozná a vykreslí prázdno.

#### --why--

Router o datech nic neví. Bez podmínky se komponenta pokusí přečíst vlastnost
z `undefined` a spadne.
