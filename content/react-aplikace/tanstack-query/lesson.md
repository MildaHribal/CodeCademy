# Serverová data: TanStack Query

V předchozí lekci padlo, že serverová data nejsou stav, ale **cache**. Tahle
lekce ukazuje nástroj, kterým se taková cache dělá — a proč se ho vyplatí naučit
dřív, než začneš psát třetí `useEffect` s `fetch`.

:::check pretest
Dvě komponenty na jedné stránce potřebují seznam objednávek a obě si ho načtou
vlastním `useEffect`em s `fetch`. Kolik požadavků půjde na server?

### --expected--

2

### --accept--

dva

### --why--

Každý efekt si načítá sám za sebe a o tom druhém neví. Právě tohle je jedna
z věcí, které knihovna na dotazy řeší: stejný dotaz se pošle jednou a data
dostanou obě komponenty.
:::

:::check pretest
Uživatel odejde na jinou stránku a za deset vteřin se vrátí zpátky. Co by měla
aplikace podle tebe udělat se seznamem, který už jednou načetla? Tipni si.

### --expected--

Ukázat ho hned a na pozadí ověřit

### --accept--

Ukázat starý a mezitím načíst nový.
Hned zobrazit cache a na pozadí zkontrolovat, jestli se nezměnil.

### --why--

Uživatel nemá čekat na to, co už jednou viděl. Zároveň data mohla zestárnout.
Tomuhle chování se říká *stale-while-revalidate* a je to výchozí chování
TanStack Query.
:::

## Problém: tři stavy, dva efekty a jeden závod

Načtení dat ručně vypadá na první pohled nevinně:

```jsx
const [objednavky, setObjednavky] = useState([]);
const [nacita, setNacita] = useState(true);
const [chyba, setChyba] = useState(null);

useEffect(() => {
  nactiObjednavky()
    .then((data) => setObjednavky(data))
    .catch((error) => setChyba(error))
    .finally(() => setNacita(false));
}, []);
```

Co v tom chybí, než to půjde nasadit: zrušení dotazu, když komponenta zmizí;
opakování po chybě; sdílení dat s druhou komponentou; obnovení po návratu na
kartu; a hlavně **závod dvou odpovědí** — uživatel přepne filtr, odpověď na starý
filtr přijde později než na nový a v seznamu skončí stará data.

> [!REMEMBER]
> **Dotaz na server je cache s klíčem.** Klíč říká, čeho se data týkají; knihovna
> podle něj data sdílí, obnovuje a zahazuje.

:::live react
```jsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

// Místo skutečné sítě: funkce, která po chvilce vrátí data.
function nactiObjednavky() {
  return new Promise((splnit) => {
    setTimeout(() => splnit([
      { id: 1, kolo: 'Author Vertigo 29', dnu: 3, castka: 1260 },
      { id: 2, kolo: 'Crussis e-Cross 7.9', dnu: 1, castka: 690 },
      { id: 3, kolo: 'Favorit Praha', dnu: 5, castka: 1250 },
    ]), 400);
  });
}

function Objednavky() {
  const { data, status, error } = useQuery({
    queryKey: ['objednavky'],
    queryFn: nactiObjednavky,
  });

  if (status === 'pending') return <p className="hlaska">Načítám objednávky…</p>;
  if (status === 'error') return <p className="hlaska chyba">{error.message}</p>;

  return (
    <ul className="seznam">
      {data.map((objednavka) => (
        <li key={objednavka.id}>
          <strong>{objednavka.kolo}</strong>
          <span>{objednavka.dnu} dnů</span>
          <span className="castka">{objednavka.castka} Kč</span>
        </li>
      ))}
    </ul>
  );
}

const klient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={klient}>
      <div className="obal">
        <h1>Objednávky</h1>
        <Objednavky />
      </div>
    </QueryClientProvider>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.obal { max-width: 460px; margin: 24px auto; padding: 24px; background: #fff; border-radius: 14px; border: 1px solid #e3e1dd; }
h1 { margin: 0 0 16px; font-size: 1.3rem; }
.seznam { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.seznam li { display: flex; gap: 12px; align-items: baseline; padding: 12px 14px; background: #f8f8f7; border-radius: 10px; }
.seznam span { color: #6b7280; font-size: 0.9rem; }
.castka { margin-left: auto; color: #1f6f4f; font-weight: 650; }
.hlaska { color: #6b7280; }
.chyba { color: #b91c1c; }
```
:::

Zkus v `setTimeout` zvětšit zpoždění na 3000 a sleduj, jak dlouho je vidět hláška
„Načítám objednávky…". Pak zkus v `queryFn` místo dat vyhodit chybu
(`throw new Error('Server neodpovídá')`) a uvidíš druhou větev.

Tři stavy a jedna funkce místo tří `useState` a jednoho efektu. A k tomu všechno
ostatní, k čemu se dostaneme dál.

:::check
Co přesně je `queryKey` a k čemu ho knihovna používá?

### --expected--

Klíč, pod kterým jsou data v cache

### --accept--

Identifikátor dotazu v cache.
Klíč do cache — knihovna podle něj data sdílí a hledá.

### --why--

Dvě komponenty se stejným klíčem sdílejí jedna data a jedno načtení. Podle klíče
se dotaz taky zneplatňuje a obnovuje.

### --see--

react-aplikace/tanstack-query#problem-tri-stavy-dva-efekty-a-jeden-zavod
:::

## Klíč musí obsahovat všechno, na čem data závisí

Tohle je nejdůležitější pravidlo celé knihovny. Když seznam závisí na filtru,
patří filtr do klíče:

```jsx
// špatně: pro každý filtr se ukládá pod stejný klíč
useQuery({ queryKey: ['kola'], queryFn: () => nactiKola(typ) });

// správně: klíč se mění s filtrem
useQuery({ queryKey: ['kola', typ], queryFn: () => nactiKola(typ) });
```

Se správným klíčem dostaneš zadarmo tři věci: přepnutí zpátky na dřív viděný
filtr je okamžité (data jsou v cache), závod odpovědí zmizí (každá odpověď patří
k svému klíči) a zneplatnit jde přesně jeden filtr, nebo celá skupina.

> [!TIP]
> Klíč piš od obecného ke konkrétnímu: `['kola']`, `['kola', typ]`,
> `['kola', typ, { strana }]`. Zneplatnění `['kola']` pak zasáhne i všechny
> konkrétnější klíče, které jím začínají.

:::check
Seznam kol se načítá s klíčem `['kola']` a funkce `queryFn` bere filtr
z proměnné `typ`. Uživatel přepne filtr a chvíli vidí kola z předchozího filtru,
pak se to samo srovná. Co je špatně?

### --expected--

Filtr chybí v klíči

### --accept--

typ musí být součástí queryKey.
Klíč se nemění s filtrem, tak se použijí data z cache.

### --why--

Pod jedním klíčem je jen jedna sada dat. Knihovna nejdřív ukáže, co v cache
najde, a teprve pak dorovná. S filtrem v klíči je to jiný dotaz a k záměně
nedojde.

### --see--

react-aplikace/tanstack-query#klic-musi-obsahovat-vsechno-na-cem-data-zavisi
:::

## Stará data, čerstvá data: staleTime a gcTime

Dvě čísla, která se pletou skoro každému:

| volba | co říká | výchozí hodnota |
|---|---|---|
| `staleTime` | jak dlouho se data považují za **čerstvá** a neobnovují se na pozadí | `0` (hned zastaralá) |
| `gcTime` | jak dlouho data zůstanou v paměti poté, co je nikdo nepoužívá | 5 minut |

Výchozí nastavení tedy znamená: data se ukazují okamžitě z cache, ale při každém
novém připojení komponenty se na pozadí ověří. Proto po návratu na stránku
seznam nebliká — jen se potichu dorovná.

`staleTime` zvyš u dat, která se mění zřídka (číselník typů kol, profil
uživatele). Nech nulu u dat, kde záleží na aktuálnosti (volné termíny, stav
objednávky).

:::live react
```jsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

let pocetVolani = 0;

function nactiPocasi() {
  pocetVolani += 1;
  const ted = pocetVolani;
  return new Promise((splnit) => {
    setTimeout(() => splnit({ teplota: 18 + ted, nacteno: ted }), 200);
  });
}

function Pocasi() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['pocasi'],
    queryFn: nactiPocasi,
    staleTime: 10000,
  });

  return (
    <div>
      <p className="velke">{data ? data.teplota + ' °C' : '—'}</p>
      <p className="hlaska">Načteno pokusů: {data ? data.nacteno : 0}{isFetching ? ' (obnovuju…)' : ''}</p>
      <button type="button" onClick={() => refetch()}>Obnovit ručně</button>
    </div>
  );
}

const klient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={klient}>
      <div className="obal">
        <h1>Počasí na trase</h1>
        <Pocasi />
        <Pocasi />
      </div>
    </QueryClientProvider>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.obal { max-width: 420px; margin: 24px auto; padding: 24px; background: #fff; border-radius: 14px; border: 1px solid #e3e1dd; display: grid; gap: 12px; }
h1 { margin: 0; font-size: 1.2rem; }
.velke { margin: 0; font-size: 2rem; font-weight: 650; color: #1f6f4f; }
.hlaska { margin: 0; color: #6b7280; font-size: 0.9rem; }
button { justify-self: start; border: 1px solid #1f6f4f; border-radius: 999px; padding: 7px 16px; background: transparent; color: #1f6f4f; font: inherit; cursor: pointer; }
button:hover { background: #1f6f4f; color: #fff; }
```
:::

Obě komponenty `Pocasi` ukazují **totéž číslo** a „Načteno pokusů: 1", i když se
vykreslily dvě — mají stejný klíč, takže sdílejí jeden dotaz i jedno načtení.
Zkus zmáčknout „Obnovit ručně" a sleduj, že se změní obě najednou. Pak zkus
`staleTime` snížit na nulu a přidat třetí `<Pocasi />`.

:::check
Co udělá `staleTime: 60000` s dotazem, který už má data v cache a komponenta se
právě znovu připojila?

### --expected--

Nic se nenačítá

### --accept--

Data jsou pořád čerstvá, dotaz se neobnoví.
Vezme se cache bez dotazu na server.

### --why--

Dokud je dotaz čerstvý, knihovna na server nesahá. Teprve po uplynutí
`staleTime` se při dalším připojení, návratu na kartu nebo obnovení sítě data
ověří na pozadí.

### --see--

react-aplikace/tanstack-query#stara-data-cerstva-data-staletime-a-gctime
:::

## Změna dat: useMutation a invalidace

Načítání je polovina práce. Když data **měníš**, používáš `useMutation` — a po
úspěchu řekneš cache, které dotazy jsou od teď neplatné.

:::live react
```jsx
import { useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Server v paměti: jediná pravda o datech je tohle pole.
let server = [{ id: 1, text: 'Zkontrolovat brzdy' }];
let dalsiId = 2;

const nactiUkoly = () => new Promise((splnit) => setTimeout(() => splnit([...server]), 250));
const pridejUkol = (text) => new Promise((splnit) => setTimeout(() => {
  server = [...server, { id: dalsiId, text }];
  dalsiId += 1;
  splnit(server.at(-1));
}, 250));

function Ukoly() {
  const klient = useQueryClient();
  const [text, setText] = useState('');
  const { data, isPending } = useQuery({ queryKey: ['ukoly'], queryFn: nactiUkoly });

  const pridani = useMutation({
    mutationFn: pridejUkol,
    onSuccess: () => klient.invalidateQueries({ queryKey: ['ukoly'] }),
  });

  function odesli(udalost) {
    udalost.preventDefault();
    if (text.trim() === '') return;
    pridani.mutate(text.trim());
    setText('');
  }

  if (isPending) return <p className="hlaska">Načítám…</p>;

  return (
    <div>
      <ul className="seznam">
        {data.map((ukol) => <li key={ukol.id}>{ukol.text}</li>)}
      </ul>
      <form onSubmit={odesli}>
        <input value={text} onChange={(udalost) => setText(udalost.target.value)} placeholder="nový úkol" />
        <button type="submit" disabled={pridani.isPending}>
          {pridani.isPending ? 'Ukládám…' : 'Přidat'}
        </button>
      </form>
    </div>
  );
}

const klient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={klient}>
      <div className="obal">
        <h1>Servisní úkoly</h1>
        <Ukoly />
      </div>
    </QueryClientProvider>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.obal { max-width: 420px; margin: 24px auto; padding: 24px; background: #fff; border-radius: 14px; border: 1px solid #e3e1dd; }
h1 { margin: 0 0 16px; font-size: 1.2rem; }
.seznam { margin: 0 0 16px; padding: 0; list-style: none; display: grid; gap: 6px; }
.seznam li { padding: 10px 14px; background: #f8f8f7; border-radius: 10px; }
form { display: flex; gap: 8px; }
input { flex: 1; padding: 9px 14px; border: 1px solid #e3e1dd; border-radius: 999px; font: inherit; }
button { border: 0; border-radius: 999px; padding: 9px 18px; background: #1f6f4f; color: #fff; font: inherit; cursor: pointer; }
button:disabled { opacity: 0.6; cursor: default; }
.hlaska { color: #6b7280; }
```
:::

Zkus smazat řádek s `invalidateQueries` a přidat úkol: v „serveru" bude, ale
seznam se nezmění, dokud stránku neobnovíš. To je přesně ten okamžik, kdy si
člověk uvědomí, k čemu cache je.

> [!REMEMBER]
> **Po úspěšné změně zneplatni dotazy, kterých se změna týká.** Ne že bys je
> ručně přepisoval — jen řekneš, že jsou staré, a knihovna si je načte znovu.

:::check
Mutace přidá objednávku a v `onSuccess` zavolá
`klient.invalidateQueries({ queryKey: ['objednavky'] })`. Co se stane s dotazem
`['objednavky', 'hotove']`?

### --answer--

Nic, klíč není stejný.

#### --why--

Shoda klíčů není na přesnou rovnost. Zamysli se, jak se zapisuje klíč od
obecného ke konkrétnímu.

### --correct--

Zneplatní se taky, protože jeho klíč zadaným klíčem začíná.

#### --why--

Zneplatnění je *prefixové*: `['objednavky']` zasáhne každý klíč, který jím
začíná. Proto se klíče píšou od obecného ke konkrétnímu.

### --answer--

Smaže se z cache úplně.

#### --why--

Zneplatnění data nemaže, jen je označí za stará. Data zůstanou vidět a na pozadí
se načtou znovu.
:::

## Optimistická úprava: než server odpoví

Odškrtnutí úkolu má být okamžité. Čekat čtvrt vteřiny na server je znát a uživatel
zaváhá, jestli klik prošel. Optimistická úprava přepíše cache **hned** a když
server odmítne, vrátí ji zpátky.

Vzor má vždycky tři části:

```jsx
useMutation({
  mutationFn: prepniHotovo,
  // 1. hned po spuštění: zruš běžící dotaz, ulož si zálohu a přepiš cache
  onMutate: async (id) => {
    await klient.cancelQueries({ queryKey: ['ukoly'] });
    const zaloha = klient.getQueryData(['ukoly']);
    klient.setQueryData(['ukoly'], (stare) =>
      stare.map((ukol) => (ukol.id === id ? { ...ukol, hotovo: !ukol.hotovo } : ukol)));
    return { zaloha };
  },
  // 2. když to selže: vrať zálohu
  onError: (chyba, id, kontext) => klient.setQueryData(['ukoly'], kontext.zaloha),
  // 3. ať to dopadlo jakkoli: nech si od serveru potvrdit skutečnost
  onSettled: () => klient.invalidateQueries({ queryKey: ['ukoly'] }),
});
```

`cancelQueries` na začátku je tam kvůli závodu: kdyby zrovna běželo obnovení
seznamu, jeho odpověď by tvoji optimistickou úpravu přepsala starými daty.

> [!PITFALL]
> Optimistickou úpravu dávej jen tam, kde **čekáš, že projde**: odškrtnutí,
> oblíbené, počet kusů. U placení, mazání a všeho, co uživatel nemůže vzít zpět,
> ukaž raději poctivě stav „ukládám".

:::check
K čemu je hodnota, kterou vrátí `onMutate`?

### --expected--

Je to záloha pro vrácení změny

### --accept--

Kontext se zálohou cache, který dostane onError.
Záloha dat, ze které se obnoví cache při chybě.

### --why--

Co `onMutate` vrátí, dostanou `onError` a `onSettled` jako poslední parametr.
Bez zálohy bys po chybě nevěděl, jak vypadala data před optimistickou úpravou.

### --see--

react-aplikace/tanstack-query#optimisticka-uprava-nez-server-odpovi
:::

## Předpověď: co uvidí uživatel po návratu

:::live react predict
```jsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

let pokus = 0;
const nacti = () => new Promise((splnit) => {
  pokus += 1;
  setTimeout(() => splnit('pokus ' + pokus), 300);
});

function Data() {
  const { data, isPending } = useQuery({ queryKey: ['vec'], queryFn: nacti });
  return <p>{isPending ? 'Načítám…' : data}</p>;
}

const klient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={klient}>
      <Data />
    </QueryClientProvider>
  );
}
```
--question-- Uživatel stránku s `Data` opustí a za pět vteřin se na ni vrátí. Co uvidí bezprostředně po návratu?
--option-- Hlášku „Načítám…", protože komponenta se namontovala znovu.
--option*-- Text `pokus 1` a na pozadí se načte `pokus 2`.
--option-- Text `pokus 2` hned, protože knihovna data předpočítala.
--why-- Data zůstala v cache (výchozí `gcTime` je 5 minut), takže se ukážou okamžitě — žádné „Načítám…". Zároveň jsou zastaralá (výchozí `staleTime` je 0), takže se na pozadí načtou znovu a text se pak vymění. Tomu se říká *stale-while-revalidate* a je to důvod, proč aplikace s knihovnou na dotazy působí rychleji než ta s `useEffect`em.
:::

:::check
Co by se v předchozí ukázce muselo změnit, aby se po návratu **neposílal** žádný
dotaz na server?

### --expected--

Zvýšit staleTime

### --accept--

Nastavit staleTime na víc než pět vteřin.
staleTime delší než doba, po kterou byl pryč.

### --why--

Dokud je dotaz čerstvý, knihovna ho po návratu neobnovuje. `gcTime` s tím
nesouvisí — ten říká, kdy se data zahodí z paměti úplně.

### --see--

react-aplikace/tanstack-query#stara-data-cerstva-data-staletime-a-gctime
:::

## Kam s tím ve skutečném projektu

Tři věci, které se v projektech opakují a vyplatí se je udělat hned:

- **`QueryClient` vytvoř jednou**, mimo komponentu (nebo v `useState`). Když ho
  vytvoříš v těle komponenty, každé překreslení zahodí celou cache.
- **Klíče drž na jednom místě**, například v objektu
  `const klice = { kola: ['kola'], kolo: (id) => ['kola', id] }`. Překlep v klíči
  jinak nikdo neodhalí — dotaz prostě začne bydlet jinde.
- **Dotazy sdružuj do vlastních hooků** (`useKola(typ)`, `useObjednavka(id)`).
  Komponenta pak neví nic o klíčích ani o `fetch` a testuje se líp.

`useSuspenseQuery` je varianta, která nevrací `status` — místo toho komponenta
„pozastaví" vykreslení a načítání zobrazí `<Suspense fallback>` nad ní. Hodí se,
když chceš mít všechny stavy načítání na jednom místě.

:::check
Proč se `new QueryClient()` nesmí volat uvnitř těla komponenty bez `useState`?

### --expected--

Při každém vykreslení by vznikl nový

### --accept--

Každé překreslení by vytvořilo nového klienta a zahodilo cache.
Protože by se cache ztrácela při každém renderu.

### --why--

Tělo komponenty běží při každém vykreslení. Nový klient znamená prázdnou cache,
takže by se všechno načítalo pořád dokola a optimistické úpravy by mizely.

### --see--

react-aplikace/tanstack-query#kam-s-tim-ve-skutecnem-projektu
:::

:::explain
Vysvětli vlastními slovy, proč se dvě komponenty se stejným klíčem dotazu zeptají
serveru jen jednou.

## --model--
Knihovna si data nedrží u komponenty, ale v **mezipaměti podle klíče**. Když se
komponenta přihlásí k dotazu, nejdřív se podívá, jestli pod tím klíčem něco je: když
ano, dostane to okamžitě, a jen podle nastavení se na pozadí ověří, jestli to není
staré. Dvě komponenty se stejným klíčem jsou proto dva odběratelé jednoho záznamu, ne
dva dotazy. Odtud plyne i to, proč na klíči tolik záleží: musí obsahovat všechno, co
odpověď ovlivňuje (id, filtr, stránku), jinak si dvě různá data přepíšou jedno místo.

## --checklist--
- Data se drží v mezipaměti podle klíče, ne u komponenty.
- Komponenta se ke klíči jen přihlašuje jako odběratel.
- Stejný klíč proto znamená jeden dotaz a sdílená data.
- Klíč musí obsahovat všechno, co odpověď ovlivňuje.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Klíč bez proměnné, na které data závisí.** Příznak: po přepnutí filtru chvíli
> svítí data předchozího filtru, nebo se dokonce nikdy nezmění. Oprava: všechno,
> co `queryFn` čte zvenčí, patří do `queryKey`.

> [!PITFALL]
> **Data z dotazu zkopírovaná do `useState`.** Příznak: po obnovení na pozadí se
> seznam nezmění, protože komponenta ukazuje svou starou kopii. Data z `useQuery`
> se čtou přímo; do stavu patří nanejvýš rozpracovaná editace jednoho řádku.

> [!PITFALL]
> **Zapomenutá invalidace po mutaci.** Příznak: „uložilo se to, ale nevidím to."
> Po každé úspěšné změně řekni cache, čeho se změna týkala.

> [!PITFALL]
> **`queryFn`, která nevyhodí chybu.** Když se `fetch` nepodaří, vrátí odpověď se
> stavem 500 a nevyhodí nic — dotaz proto skončí jako úspěšný s podivnými daty.
> V `queryFn` vždycky zkontroluj `response.ok` a sám vyhoď chybu.

> [!PITFALL]
> **`new QueryClient()` v těle komponenty.** Příznak: aplikace pořád načítá,
> cache jako by neexistovala. Klient patří mimo komponentu nebo do `useState`.

:::check
Aplikace ukazuje smazanou objednávku, dokud uživatel neobnoví stránku. Kterou
z pastí jsi právě potkal?

### --expected--

Zapomenutou invalidaci

### --accept--

Chybí invalidace po mutaci.
Po mazání se nezneplatnil dotaz se seznamem.

### --why--

Server o smazání ví, cache ne. Dokud jí nikdo neřekne, že je její kopie stará,
bude dál ukazovat, co má uloženo.

### --see--

react-aplikace/tanstack-query#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

Knihovna má vlastní dokumentaci na
[tanstack.com/query](https://tanstack.com/query/latest) — u každé volby je
příklad. MDN se hodí na to, co je pod ní:

- [Fetch API: Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) —
  proč `fetch` nevyhodí chybu u stavu 404 a 500 a co s tím.
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) —
  jak se ruší běžící požadavek; knihovna ho posílá do `queryFn` v parametru `signal`.
- [Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control) —
  cache prohlížeče, která je úplně jiná vrstva než cache dotazů v aplikaci.

# --questions--

## --question--

Komponenta má klíč `['kola', typ]` a uživatel přepíná mezi třemi typy. Kolik
záznamů bude po přepnutí přes všechny tři v cache?

### --expected--

3

### --accept--

tři

### --why--

Každá hodnota klíče je vlastní záznam. Proto je návrat na dřív viděný filtr
okamžitý — data už v cache jsou.

### --see--

react-aplikace/tanstack-query#klic-musi-obsahovat-vsechno-na-cem-data-zavisi

## --question--

Po odeslání formuláře se nová objednávka uloží na server, ale v seznamu se
neobjeví. Co ve zpracování mutace chybí?

### --expected--

Invalidace dotazu

### --accept--

invalidateQueries na klíč seznamu.
Zneplatnění dotazu se seznamem objednávek.

### --why--

Mutace změnila data na serveru, ne v cache. Dokud cache neřekneš, že je její
kopie stará, bude dál ukazovat, co má.

### --see--

react-aplikace/tanstack-query#zmena-dat-usemutation-a-invalidace

## --question--

Který stav je správný pro „data už v cache jsou, ale zrovna se na pozadí
obnovují"?

### --answer--

`status === 'pending'`

#### --why--

`pending` znamená, že data ještě vůbec nejsou. Tady už jsou — jen se ověřují.

### --correct--

`isFetching === true` a zároveň `data` má hodnotu

#### --why--

`isFetching` je pravdivé při každém běžícím načtení, i tom na pozadí. Podle něj
se dělá nenápadná lišta „obnovuju", která nezakryje obsah.

### --answer--

`isError === true`, dokud nepřijde odpověď

#### --why--

`isError` říká, že poslední pokus selhal. S obnovením na pozadí nemá nic
společného.

## --question--

V optimistické úpravě chybí `await klient.cancelQueries(...)` na začátku
`onMutate`. Co se může stát?

### --expected--

Odpověď běžícího dotazu přepíše úpravu

### --accept--

Právě běžící načtení vrátí stará data a optimistickou změnu přepíše.
Doběhne starý dotaz a smaže úpravu z cache.

### --why--

Když v okamžiku mutace běží obnovení seznamu, jeho odpověď dorazí až po tvém
zápisu do cache a zapíše se přes něj. Uživatel uvidí, jak se odškrtnutí na
chvilku vrátí zpět.

### --see--

react-aplikace/tanstack-query#optimisticka-uprava-nez-server-odpovi
