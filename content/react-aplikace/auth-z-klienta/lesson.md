# Přihlášení z klienta

Přihlášení je první věc, kterou po tobě chce každý zákazník, a první místo, kde
se dá z frontendu udělat díra. Dobrá zpráva: práce na klientovi je jí míň, než
se čeká. Horší zpráva: skoro všechno, co se o ní píše v návodech, je z roku 2018.

:::check pretest
Aplikace si po přihlášení uloží token do `localStorage`. Na stránku se dostane
cizí skript (reklama, napadený balíček, komentář s HTML). Co s tokenem udělá?

### --answer--

Nic, `localStorage` je vázaný na doménu.

#### --why--

To je pravda — jenže ten skript běží **na té doméně**. Prohlížeč mezi tvým
skriptem a vloženým skriptem nerozlišuje.

### --correct--

Přečte ho jedním řádkem a odešle si ho pryč.

#### --why--

Přesně tak. `localStorage.getItem('token')` může zavolat kterýkoli skript na
stránce. Proto se token ukládá jinam — o tom je první část lekce.

### --answer--

Přečte ho, ale nepoužije, protože je vázaný na prohlížeč.

#### --why--

Token je obyčejný text. Server, který mu věří, ho přijme od kohokoli, kdo ho
pošle — z jiného prohlížeče i z příkazové řádky.
:::

:::check pretest
Přihlášený uživatel obnoví stránku (F5). Odkud se aplikace dozví, kdo je
přihlášený? Napiš jedním slovem místo.

### --expected--

Ze serveru

### --accept--

server
Ze serveru, zeptá se ho.

### --why--

Paměť aplikace obnovením zmizí. Cookie s relací ale zůstane v prohlížeči, takže
stačí jeden dotaz „kdo jsem" a server odpoví. Nic si o přihlášení nepamatuje
klient.
:::

## Problém: přihlášení není stav komponenty

Skoro každý první pokus vypadá takhle:

```jsx
const [user, setUser] = useState(null);

async function handleLogin(credentials) {
  const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify(credentials) });
  setUser(await response.json());   // …a po F5 je zase null
}
```

Po obnovení stránky je `user` zpátky `null`, i když je uživatel dál přihlášený.
Tak se přidá `localStorage`, pak se přidá kontext, pak se do něj zkopíruje token
— a najednou máš tři místa, která se můžou rozejít.

> [!REMEMBER]
> **Přihlášení vlastní server, klient ho jen zjišťuje.** V aplikaci není „stav
> přihlášení", ale odpověď na dotaz „kdo jsem", se stejnými pravidly jako každá
> jiná serverová data.

Když to vezmeš takhle, zapadne všechno ostatní: odpověď má stav načítání, dá se
zneplatnit, po odhlášení se zahodí a dvě komponenty ji sdílejí, aniž by se na ni
ptaly dvakrát.

:::check
Proč po obnovení stránky nestačí přečíst uživatele z `localStorage`, i kdyby tam
byl uložený celý jeho profil?

### --expected--

Protože nevíš, jestli relace ještě platí

### --accept--

Mohl být mezitím odhlášený nebo mu vypršela relace.
Data můžou být neaktuální, o platnosti rozhoduje server.

### --why--

`localStorage` je poznámka v prohlížeči, ne důkaz. Uživateli mezitím mohla
vypršet relace, správce mu mohl zrušit účet nebo změnit roli. To ví jen server.

### --see--

react-aplikace/auth-z-klienta#problem-prihlaseni-neni-stav-komponenty
:::

## Kam uložit token

Máš dvě možnosti a rozdíl mezi nimi je zásadní.

| | `localStorage` | [[cookie HttpOnly]] |
|---|---|---|
| kdo ji přečte | jakýkoli skript na stránce | jen prohlížeč a server |
| jak se posílá | musíš ji ručně přidat do hlavičky | prohlížeč ji přiloží sám |
| co ji ohrozí | cizí skript na stránce (XSS) | požadavek z cizí stránky (CSRF) |
| jak se to brání | těžko — obrana je nemít XSS | `SameSite` a ověřovací token |

Cookie vyhrává, protože její slabinu umíš zavřít jedním atributem, kdežto proti
cizímu skriptu na stránce neochráníš uložený token nijak.

Server po přihlášení pošle hlavičku:

```
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1209600
```

- `HttpOnly` — `document.cookie` ji nevidí, JavaScript se k ní nedostane.
- `Secure` — posílá se jen po HTTPS.
- `SameSite=Lax` — na požadavek z cizí stránky se nepřiloží, takže odpadá většina
  CSRF útoků.
- `Max-Age` — jak dlouho relace platí. Po vypršení prohlížeč cookie zahodí sám.

Frontend na tom nedělá **nic** — kromě jediné věci: když API běží na jiném
původu než aplikace (`api.pujcovna.cz` vs. `pujcovna.cz`), musí u každého volání
říct, že chce poslat i cookies:

```js
const response = await fetch('https://api.pujcovna.cz/me', { credentials: 'include' });
```

A server k tomu musí dovolit `Access-Control-Allow-Credentials: true` a vypsat
**konkrétní** původ; hvězdička `*` s cookies neplatí. Nejjednodušší je tomuhle
se vyhnout: nechat API na stejné doméně pod `/api` (ve vývoji přes proxy ve Vite)
a nemít CORS vůbec.

> [!PITFALL]
> **Chybějící `credentials: 'include'`** se projeví tak, že přihlášení „projde",
> ale hned další požadavek vrátí `401`. V DevTools na kartě Network u požadavku
> chybí hlavička `Cookie`. Pozor, `credentials: 'include'` potřebuje i samotné
> volání `/api/login`, jinak prohlížeč cookie z odpovědi ani nepřijme.

:::check
Proč se v tabulce píše, že proti cizímu skriptu na stránce token v `localStorage`
neochráníš?

### --expected--

Protože skript má stejná práva jako tvůj kód

### --accept--

Běží na stejné doméně a může číst localStorage stejně jako ty.
Prohlížeč mezi tvým a cizím skriptem nerozlišuje.

### --why--

`localStorage` je chráněný jen původem (doménou). Jakmile se cizí kód dostane do
stránky, je „ve stejném domě". Cookie s `HttpOnly` je ale mimo dosah JavaScriptu
úplně, takže z ní nepřečte nic ani on.

### --see--

react-aplikace/auth-z-klienta#kam-ulozit-token
:::

## Přihlášený uživatel jako dotaz

Když je token v cookie, aplikace o něm neví a ani nechce. Zajímá ji jediné:
odpověď serveru na `GET /api/me`. A to je obyčejný dotaz s [[klíč dotazu|klíčem]]
`['me']`.

```jsx
export function useCurrentUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await fetch('/api/me');
      if (response.status === 401) return null;     // nepřihlášený není chyba
      if (!response.ok) throw new Error('Nepodařilo se ověřit přihlášení');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
```

Dvě rozhodnutí v tom kódu stojí za vysvětlení. `401` **není chyba dotazu** —
je to platná odpověď „nikdo tu není přihlášený", proto se z ní vrací `null`
a ne výjimka. A `retry: false` proto, že opakovat dotaz, na který server třikrát
odpověděl „ne", nemá smysl.

Hook pak vrací tři situace, ne dvě:

```jsx
const { data: user, isPending } = useCurrentUser();
// isPending  → ještě nevíme
// user       → přihlášený
// user === null → nepřihlášený
```

:::live react
```jsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import './styles.css';

// Místo skutečného API: server, který odpoví za chvilku.
let session = { name: 'Eva Novotná', role: 'zákaznice' };

function fetchMe() {
  return new Promise((resolve) => setTimeout(() => resolve(session), 600));
}

function Header() {
  const { data: user, isPending } = useQuery({ queryKey: ['me'], queryFn: fetchMe });

  if (isPending) return <p className="bar muted">Ověřuju přihlášení…</p>;
  if (!user) return <p className="bar">Nepřihlášen</p>;

  return (
    <p className="bar">
      Přihlášena jako <strong>{user.name}</strong> <span className="tag">{user.role}</span>
    </p>
  );
}

const client = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <Header />
      <p className="text">Tenhle obsah vidí každý, i nepřihlášený návštěvník.</p>
    </QueryClientProvider>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f5f4f1; color: #1f2933; }
.bar { margin: 0; padding: 12px 18px; background: #fff; border-bottom: 1px solid #e4e1db; }
.muted { color: #8a8378; }
.tag { display: inline-block; margin-left: 6px; padding: 1px 8px; border-radius: 999px; background: #e6f2f0; color: #0f766e; font-size: 0.82rem; }
.text { padding: 0 18px; color: #5b6570; }
```
:::

Zkus změnit `session` na `null` a sleduj, že se z „Ověřuju přihlášení…" stane
„Nepřihlášen" — komponenta se nemusí měnit, jen odpověď serveru.

:::check
Proč se odpověď `401` z `/api/me` převádí na `null` místo toho, aby dotaz
skončil chybou?

### --expected--

Protože nepřihlášený uživatel není chyba

### --accept--

Je to platná odpověď, ne selhání dotazu.
Nepřihlášení je normální stav aplikace.

### --why--

Kdyby to byla chyba, musela by ji řešit každá komponenta jako poruchu (opakování,
hláška „něco se pokazilo"). Takhle jsou stavy tři a jasné: načítá se, přihlášený,
nepřihlášený.

### --see--

react-aplikace/auth-z-klienta#prihlaseny-uzivatel-jako-dotaz
:::

## Chráněná trasa

[[chráněná trasa]] je trasa, která se vykreslí jen přihlášenému. V React Routeru
na to stačí jedna komponenta a vnořený layout, který už znáš z
[Vnořený layout a Outlet](see:react-aplikace/routovani#vnoreny-layout-a-outlet).

```jsx
function RequireAuth() {
  const { data: user, isPending } = useCurrentUser();
  const location = useLocation();

  if (isPending) return <p>Načítám…</p>;                      // 1. ještě nevíme
  if (!user) return <Navigate to="/prihlaseni" replace state={{ from: location }} />;
  return <Outlet />;                                          // 2. víme a je to v pořádku
}
```

```jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="prihlaseni" element={<Login />} />
    <Route element={<RequireAuth />}>
      <Route path="rezervace" element={<Reservations />} />
      <Route path="ucet" element={<Account />} />
    </Route>
  </Route>
</Routes>
```

Tři detaily, na kterých to stojí:

- **Stav „ještě nevíme" se musí ošetřit dřív než přesměrování.** Když ho
  přeskočíš, přihlášený uživatel po obnovení stránky vyletí na přihlášení, protože
  v prvním okamžiku `user` ještě není.
- **`replace`** nahradí položku v historii, takže tlačítko Zpět z přihlášení
  nevrátí uživatele zpátky na chráněnou stránku a odtud znovu na přihlášení.
- **`state={{ from: location }}`** si zapamatuje, kam měl namířeno. Po úspěšném
  přihlášení ho tam pošleš: `navigate(location.state?.from?.pathname ?? '/', { replace: true })`.

:::live react predict
```jsx
import { MemoryRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';

// „Kdo jsem" ze serveru: odpověď přijde za chvilku, přihlášený uživatel existuje.
function useCurrentUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const id = setTimeout(() => setUser({ name: 'Eva' }), 300);
    return () => clearTimeout(id);
  }, []);
  return user;
}

function RequireAuth() {
  const user = useCurrentUser();
  const location = useLocation();
  if (!user) return <Navigate to="/prihlaseni" replace state={{ from: location }} />;
  return <Outlet />;
}

export default function App() {
  return (
    <MemoryRouter initialEntries={['/ucet']}>
      <Routes>
        <Route path="/prihlaseni" element={<h3>Přihlášení</h3>} />
        <Route element={<RequireAuth />}>
          <Route path="/ucet" element={<h3>Můj účet</h3>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
```
--question-- Uživatel je přihlášený a otevře `/ucet`. Co uvidí, až se všechno dopočítá?
--option-- „Můj účet" — odpověď serveru dorazí a komponenta se překreslí.
--option-- Nejdřív „Přihlášení", pak se to samo přepne na „Můj účet".
--option*-- „Přihlášení", a zůstane tam.
--why-- `useCurrentUser` vrací při prvním vykreslení `null` — odpověď serveru ještě nedorazila. `RequireAuth` z toho usoudí „nepřihlášený" a okamžitě přesměruje. Tím se `RequireAuth` odmontuje a s ním i probíhající dotaz; na trase `/prihlaseni` už nikdo znovu nenačítá. Proto **musí** být stav „ještě nevíme" ošetřený dřív než přesměrování.
:::

:::check
Co udělá `<Navigate to="/prihlaseni" replace />` navíc oproti témuž zápisu bez
`replace`?

### --expected--

Nepřidá položku do historie

### --accept--

Nahradí současnou položku v historii místo přidání nové.
Tlačítko Zpět pak nevrátí uživatele na chráněnou stránku.

### --why--

Bez `replace` zůstane v historii chráněná adresa. Zpět na ni uživatele vrátí,
`RequireAuth` ho zase pošle na přihlášení — a Zpět přestane fungovat.

### --see--

react-aplikace/auth-z-klienta#chranena-trasa
:::

## Obnova relace a vypršení

Relace nevydrží věčně a uživatel bude mít aplikaci otevřenou přes noc. Počítej
se dvěma věcmi.

**Při startu aplikace** se nic zvláštního nedělá: dotaz `['me']` se položí sám
a odpoví buď uživatelem, nebo `null`. To je celá „obnova relace" — žádné čtení
tokenu, žádné dekódování.

**Během používání** může relace vypršet kdykoli. Pak server na běžný dotaz
odpoví `401` a aplikace musí zareagovat na jednom místě, ne v každé komponentě.
Nejjednodušší je obalit `fetch` vlastní funkcí:

```js
export async function api(path, options) {
  const response = await fetch(path, { ...options, credentials: 'include' });

  if (response.status === 401) {
    queryClient.setQueryData(['me'], null);   // přepni aplikaci do „nepřihlášen"
    throw new Error('Relace vypršela, přihlas se prosím znovu.');
  }
  if (!response.ok) throw new Error(`Požadavek selhal (${response.status})`);
  return response.json();
}
```

Od té chvíle je to zase jen data: `['me']` je `null`, chráněné trasy pošlou
uživatele na přihlášení a ten se po zadání hesla vrátí tam, kde skončil.

> [!NOTE]
> Prodlužování relace na pozadí (krátký přístupový token a dlouhý obnovovací)
> řeší server a probereme ho v sekci o bezpečnosti. Z pohledu frontendu se nemění
> nic: cookie posílá prohlížeč, `401` znamená „zeptej se znovu, kdo jsem".

:::check
Proč se reakce na `401` píše do jedné společné funkce místo do každého dotazu
zvlášť?

### --expected--

Aby se chování nemuselo opakovat

### --accept--

Jinak bys to musel napsat v každé komponentě a na jednu zapomeneš.
Je to pravidlo celé aplikace, ne jednoho dotazu.

### --why--

Vypršení relace je vlastnost komunikace se serverem, ne jednoho seznamu.
Na jednom místě to navíc znamená, že se dá změnit chování (hláška, přesměrování)
jednou pro celou aplikaci.

### --see--

react-aplikace/auth-z-klienta#obnova-relace-a-vyprseni
:::

## Odhlášení a úklid cache

Odhlášení má na klientovi dva kroky a druhý se zapomíná.

```jsx
async function handleLogout() {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  queryClient.clear();               // zahoď VŠECHNA data předchozího uživatele
  navigate('/', { replace: true });
}
```

Cookie ruší server (`Set-Cookie: session=; Max-Age=0`) — klient ji smazat nemůže,
je `HttpOnly`. Co ale musí udělat klient, je **vyhodit cache**. V ní jsou
objednávky, adresy a e-maily člověka, který právě odešel; kdyby tam zůstaly,
uvidí je ten, kdo se přihlásí po něm, než dorazí čerstvá odpověď.

> [!PITFALL]
> **`queryClient.invalidateQueries()` na odhlášení nestačí.** Zneplatnění data
> v cache nechá a jen si je poznamená jako stará — komponenta je při dalším
> vykreslení pořád ukáže. Na odhlášení patří `clear()` (zahodí všechno) nebo
> `removeQueries()`. Příznak: po přehlášení na jiný účet blikne na půl vteřiny
> seznam předchozího uživatele.

:::check
Proč se na odhlášení nesmí spolehnout jen na to, že server zruší cookie?

### --expected--

V cache zůstanou data starého uživatele

### --accept--

Protože v paměti aplikace zůstanou načtená data.
Cookie zmizí, ale cache dotazů ne.

### --why--

Zrušená cookie jen zajistí, že další požadavek na server neprojde. Všechno, co
už aplikace stihla načíst, jí zůstane v paměti, dokud ji někdo nevyhodí.

### --see--

react-aplikace/auth-z-klienta#odhlaseni-a-uklid-cache
:::

## Co se nikdy neřeší jen na klientovi

Tohle je ta část, kvůli které lekce existuje.

> [!REMEMBER]
> **Všechno, co jsi udělal na klientovi, je jen pohodlí pro uživatele.** Kdokoli
> si může otevřít nástroje pro vývojáře a poslat na API požadavek sám.

Co z toho plyne konkrétně:

- **Skryté tlačítko není zákaz.** `{user.role === 'admin' && <DeleteButton />}` je
  správně — ale mazání musí odmítnout i server, když požadavek přijde od někoho
  jiného.
- **Chráněná trasa nechrání data.** Chrání jen obrazovku. Data chrání endpoint,
  který je vydává.
- **Cena, sleva a nárok se počítají na serveru.** Klient je jen ukazuje.
- **Token nikdy nedekóduj kvůli rozhodnutí.** Když už ho v ruce máš, jeho obsah
  je jen informace, ne důkaz; podpis ověřuje server.
- **Co nemá uživatel vidět, mu neposílej.** Filtrovat cizí data až v komponentě
  znamená, že je v odpovědi měl — a stačí se podívat do karty Network.

Zkouška, která se hodí u každého požadavku: *kdyby tenhle požadavek přišel
z příkazové řádky s cizí cookie, odmítl by ho server?* Když ne, oprava patří na
server, ne do komponenty.

:::explain
Vysvětli, proč skrytí tlačítka „Smazat" před běžným uživatelem není bezpečnostní
opatření.

## --model--

Kód komponenty běží v prohlížeči uživatele, takže si ho může přečíst i změnit.
Podmínka, která tlačítko skrývá, je jen rozhodnutí o tom, co se vykreslí — data
i endpoint na mazání existují dál a dají se zavolat rovnou, třeba z konzole nebo
z příkazové řádky. Skrytí tlačítka je proto věc použitelnosti: ať uživatel nevidí
akci, kterou stejně nesmí. O tom, jestli se smaže, rozhoduje server, který u
každého požadavku ověří, kdo ho posílá a jestli na to má právo.

## --checklist--

- Kód komponenty běží u uživatele a dá se změnit.
- Endpoint na mazání existuje bez ohledu na to, co je vidět.
- Požadavek jde poslat i mimo aplikaci.
- O oprávnění rozhoduje server u každého požadavku.
:::

:::check
Aplikace načte z API seznam všech objednávek a v komponentě z něj ukáže jen ty,
které patří přihlášenému uživateli. Co je na tom špatně?

### --expected--

Cizí objednávky už dostal do prohlížeče

### --accept--

Server poslal data, která uživatel nemá vidět.
Filtrovat se to má na serveru, ne v komponentě.

### --why--

Odpověď serveru si uživatel přečte v kartě Network, ať s ní komponenta udělá
cokoli. Filtr v komponentě je zobrazení, ne ochrana.

### --see--

react-aplikace/auth-z-klienta#co-se-nikdy-neresi-jen-na-klientovi
:::

## Typické chyby a pasti

> [!PITFALL]
> **Přesměrování dřív, než dorazí odpověď „kdo jsem".** Chráněná trasa vyhodnotí
> `user === null` v prvním vykreslení jako „nepřihlášen". Příznak: po každém F5
> na chráněné stránce skončíš na přihlášení, i když jsi přihlášený. Oprava:
> nejdřív `isPending`, potom teprve rozhodnutí.

> [!PITFALL]
> **Kopie uživatele do kontextu při přihlášení.** Kontext dostane odpověď
> z `/api/login` a už se nikdy neaktualizuje. Příznak: uživateli přibude role
> nebo se změní jméno a aplikace o tom neví až do dalšího přihlášení. Oprava:
> kontext ať čte tentýž dotaz `['me']`, ne vlastní kopii.

> [!PITFALL]
> **`credentials: 'include'` jen u některých volání.** Přihlášení projde a další
> dotaz vrátí `401`. Příznak: nekonečné kolečko přihlášení → účet → přihlášení.
> Oprava: jedna společná funkce `api()`, kterou volají všechny dotazy.

> [!PITFALL]
> **CORS s hvězdičkou a cookies.** Server posílá
> `Access-Control-Allow-Origin: *` a k tomu `credentials: 'include'`. Prohlížeč
> odpověď zahodí s hláškou *The value of the 'Access-Control-Allow-Origin' header
> in the response must not be the wildcard '*' when the request's credentials
> mode is 'include'*. Oprava je na serveru: vypsat konkrétní původ a přidat
> `Access-Control-Allow-Credentials: true`.

> [!PITFALL]
> **Odhlášení bez úklidu cache.** Data předchozího uživatele zůstanou v paměti
> aplikace. Příznak: po přehlášení blikne cizí seznam. Oprava: `queryClient.clear()`
> hned po úspěšném odhlášení.

> [!PITFALL]
> **Rozhodování podle obsahu tokenu na klientovi.** Token si můžeš rozbalit
> a přečíst v něm `role: 'admin'`, jenže jeho obsah není ověřený podpis, dokud
> ho neověří server. Příznak: „funguje to", dokud si to někdo nepřepíše
> v prohlížeči. Oprava: role ber z odpovědi `/api/me` a o přístupu rozhoduj na
> serveru.

:::check
Uživatel je přihlášený, ale po každém obnovení stránky ho aplikace vyhodí na
přihlášení. Kterou z pastí jsi právě potkal?

### --expected--

Přesměrování před dokončením dotazu

### --accept--

Chráněná trasa nepočká na odpověď kdo jsem.
Chybí ošetření stavu načítání.

### --why--

V prvním vykreslení ještě odpověď serveru není a `user` je `null`. Bez větve
„ještě nevíme" z toho chráněná trasa udělá „nepřihlášen".

### --see--

react-aplikace/auth-z-klienta#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

Přihlášení je z poloviny HTTP. Tyhle stránky si přečti, i když je server cizí —
budeš s jeho autorem o nich mluvit.

- [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) —
  všechny atributy cookie včetně `HttpOnly`, `Secure` a `Max-Age`.
- [SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie/SameSite) —
  co přesně znamená `Lax`, `Strict` a `None` a proti čemu to chrání.
- [CORS: requests with credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS#requests_with_credentials) —
  proč s cookies nestačí hvězdička v `Access-Control-Allow-Origin`.
- [Window: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) —
  co všechno k němu má přístup (a proto tam token nepatří).

# --questions--

## --question--

Aplikace běží na `pujcovna.cz`, API na `api.pujcovna.cz`. Přihlášení projde, ale
následné `GET /me` vrátí `401`. Co je nejpravděpodobnější příčina na straně
frontendu?

### --expected--

Chybí credentials: 'include'

### --accept--

Fetch neposílá cookies.
Volání nemá credentials: 'include', takže se cookie nepřiloží.

### --why--

Při jiném původu prohlížeč cookie sám nepřiloží. Pozná se to v kartě Network:
u požadavku chybí hlavička `Cookie`.

### --see--

react-aplikace/auth-z-klienta#kam-ulozit-token

## --question--

Který zápis chráněné trasy je správný?

### --answer--

```jsx
if (!user) return <Navigate to="/prihlaseni" />;
return <Outlet />;
```

#### --why--

Chybí větev pro okamžik, kdy odpověď serveru ještě nedorazila. Přihlášený
uživatel po obnovení stránky skončí na přihlášení.

### --correct--

```jsx
if (isPending) return <Spinner />;
if (!user) return <Navigate to="/prihlaseni" replace />;
return <Outlet />;
```

#### --why--

Tři stavy, tři větve, a to ve správném pořadí: nejdřív „nevíme", potom
rozhodnutí.

### --answer--

```jsx
useEffect(() => { if (!user) navigate('/prihlaseni'); }, [user]);
return <Outlet />;
```

#### --why--

Chráněný obsah se vykreslí dřív, než efekt stihne přesměrovat — uživatel ho na
okamžik uvidí. Přesměrování patří do vykreslení, ne do efektu.

## --question--

Po odhlášení a přihlášení jiným účtem se na půl vteřiny objeví rezervace
předchozího uživatele. Co v odhlašovací funkci chybí?

### --expected--

queryClient.clear()

### --accept--

Vyčištění cache dotazů.
queryClient.removeQueries()

### --why--

Zrušená cookie zastaví další požadavky, ale už načtená data zůstanou v paměti.
Na odhlášení patří zahození cache, ne jen zneplatnění.

### --see--

react-aplikace/auth-z-klienta#odhlaseni-a-uklid-cache

## --question--

Kolega říká: „Admin sekci mám schovanou podmínkou na roli, takže je
zabezpečená." Co mu odpovíš?

### --expected--

Že zabezpečení je na serveru

### --accept--

Že podmínka jen skrývá obrazovku, přístup musí odmítnout server.
Skryté tlačítko není zákaz — API se dá zavolat přímo.

### --why--

Kód komponenty běží u uživatele. Podmínka rozhoduje o tom, co se vykreslí,
ne o tom, co API vydá.

### --see--

react-aplikace/auth-z-klienta#co-se-nikdy-neresi-jen-na-klientovi
