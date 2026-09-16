## Co se kdy spustí

| fáze | co se děje | co v ní smíš |
|---|---|---|
| trigger | `createRoot`, nebo změna stavu (`setNeco`) | cokoli — je to obsluha události |
| render | React spustí funkci komponenty a všech jejích potomků | jen počítat a vracet JSX |
| [[commit]] | React zapíše rozdíl do DOMu a spustí efekty | sáhnout na prvek, změřit, nastavit fokus |

Když se vykreslí rodič, vykreslí se i potomci — props se předem neporovnávají.
Zastavit takový [[rerender]] umí `memo`, ale jen při stabilních props.

Ve vývoji [[StrictMode]] render i reducer spustí dvakrát a komponentu po namontování
hned odmontuje a namontuje znovu. Čistý kód to nepozná.

## Identita, ne obsah

`memo`, `useMemo`, `useCallback` i závislosti hooků porovnávají přes `Object.is`.
[[identita hodnoty|Identita]] objektu, pole a šipkové funkce je při každém renderu nová.

| props potomka v `memo` | přeskočí se? |
|---|---|
| `pocet={3}`, `nazev="Kytara"` | ano |
| `polozky={NA_SKLADE}` (konstanta nad komponentou) | ano |
| `filtr={{ jenSkladem: true }}` | ne |
| `onSmazat={() => smazat(id)}` | ne |
| `polozky={data.map(uprav)}` | ne |

Opravy: primitivní props, konstanta mimo komponentu, `useMemo` / `useCallback`,
nebo zapnutý React Compiler.

## Efekt

```jsx
useEffect(() => {
  const spojeni = otevriSpojeni(mistnost);   // 1. zapni vnější systém
  return () => spojeni.zavri();              // 2. vypni ho
}, [mistnost]);                              // 3. na čem to stojí
```

[[úklidová funkce|Úklid]] běží před každým dalším během efektu a ještě jednou při
odmontování.

| efekt zapnul | úklid |
|---|---|
| `setInterval`, `setTimeout` | `clearInterval`, `clearTimeout` |
| `addEventListener` | `removeEventListener` se stejnou funkcí |
| spojení, `WebSocket`, `EventSource` | `zavri()`, `close()` |
| `IntersectionObserver`, `ResizeObserver` | `observer.disconnect()` |
| rozjetý `fetch` | `controller.abort()` nebo příznak „už mě nezajímá" |

Nejdřív napiš úplné [[závislosti efektu]], pak se zbav té, která tě otravuje —
funkcí aktualizace `(s) => s + 1`, funkcí definovanou uvnitř efektu, nebo
`useEffectEvent`. Nikdy ne tím, že ji ze seznamu vyškrtneš: tak vzniká
[[zastaralá closure]].

### Efekt tam nepatří, když

| situace | kam to patří |
|---|---|
| hodnota se dá spočítat ze stavu a props | do renderu, případně `useMemo` |
| stav se má vynulovat při jiných datech | jiný `key` na komponentě |
| má se to stát po kliknutí | do obsluhy události |
| čtení z vnějšího zdroje při renderu (media dotaz, `navigator.onLine`) | `useSyncExternalStore` |

## Ref

[[ref|Ref]] je schránka `{ current }`, kterou React nesleduje: zápis nevyvolá render.

| co | stav, nebo ref |
|---|---|
| číslo, text, přepínač na obrazovce | stav |
| uzel DOMu pro `focus()`, `scrollIntoView()`, měření | ref |
| id `setInterval` nebo `requestAnimationFrame` | ref |
| kontext plátna z `canvas.getContext('2d')` | ref |
| předchozí hodnota pro porovnání | ref |

`ref.current` čti a zapisuj v obsluze události nebo v efektu, nikdy v těle
komponenty. V React 19 je `ref` obyčejná prop — komponenta si ji vezme
do parametrů a napíše na prvek.

## Vlastní hooky

[[vlastní hook|Vlastní hook]] je funkce s předponou `use`, která smí volat jiné hooky.
Sdílí logiku, ne data: každé zavolání zakládá vlastní stav v té komponentě,
která hook volá.

[[pravidla hooků|Pravidla hooků]]: volat jen na nejvyšší úrovni (ne v `if`, v cyklu,
ve vnořené funkci ani pod `return`) a jen z komponenty nebo z jiného hooku.

```jsx
function useZpozdenaHodnota(hodnota, prodleva = 400) {
  const [zpozdena, setZpozdena] = useState(hodnota);
  useEffect(() => {
    const id = setTimeout(() => setZpozdena(hodnota), prodleva);
    return () => clearTimeout(id);
  }, [hodnota, prodleva]);
  return zpozdena;
}
```

## Reducer a kontext

[[reducer|Reducer]] je čistá funkce `(stav, akce) => nový stav` — žádný `fetch`,
`Math.random()`, `Date.now()` ani zápis do úložiště. Nepředvídatelné hodnoty
spočítej v obsluze a pošli je v [[akce|akci]].

```jsx
function filtrReducer(stav, akce) {
  switch (akce.typ) {
    case 'kategorie':
      return { ...stav, kategorie: akce.hodnota, stranka: 1 };
    case 'stranka':
      return { ...stav, stranka: akce.hodnota };
    default:
      throw new Error('Neznámá akce: ' + akce.typ);
  }
}

const [stav, poslat] = useReducer(filtrReducer, VYCHOZI);
poslat({ typ: 'kategorie', hodnota: 'bicí' });
```

[[kontext|Kontext]] řeší, kdo se ke stavu dostane, reducer to, jak se stav mění.

```jsx
const KosikKontext = createContext(null);
const KosikAkceKontext = createContext(null);

<KosikKontext value={kosik}>
  <KosikAkceKontext value={poslat}>{children}</KosikAkceKontext>
</KosikKontext>
```

Dva kontexty proto, že `poslat` má stabilní identitu: komponenty, které jen
posílají akce, se pak při změně dat nepřekreslují. Při změně hodnoty kontextu
se překreslí všichni odběratelé, a to i v `memo` — hodnotu stabilizuj přes
`useMemo(() => ({ a, b }), [a, b])`, nebo kontext rozděl.

## Chyby, čekání, portály

| obal | reaguje na | co ukáže |
|---|---|---|
| [[error boundary]] | výjimku z renderu, z efektu, z konstruktoru | vlastní náhradu místo spadlého podstromu |
| [[hranice Suspense]] | pozastavení komponenty (`use`, `lazy`) | obsah prop `fallback` |
| [[portál]] | nic — jen mění místo zápisu do DOMu | totéž, jen jinde |

Error boundary nechytá chyby z obsluhy události, ze `setTimeout` ani odmítnutou
promise. Portál nechává komponentu ve stromu Reactu na místě, takže kontext,
props i probublávání událostí jdou dál podle JSX.

Drahé vykreslování řeší [[odložená hodnota]] z `useDeferredValue` a `useTransition`
pro akce — ale až potom, co jsi zkusil vykreslovat míň (stránkování, `slice`)
a memoizovat drahý výpočet.

## Pasti, které stojí nejvíc času

| příznak | příčina | oprava |
|---|---|---|
| políčko se při psaní samo maže | `key={Math.random()}` nebo `key={index}` | `key` ze stabilního `id` |
| počítadlo zaseknuté na `1` | prázdné závislosti a `setN(n + 1)` | `setN((n) => n + 1)` |
| `Maximum update depth exceeded` | efekt zapisuje stav, který má ve svých závislostech | hodnotu spočítat při renderu |
| Escape reaguje několikrát | `removeEventListener` dostal jinou funkci | funkci pojmenovat v těle efektu |
| detail ukazuje data předchozího záznamu | souběh odpovědí | příznak „už mě nezajímá" nebo `AbortController` |
| `Cannot read properties of null (reading 'focus')` | prvek v tu chvíli nebyl v DOMu | fokus až v efektu, u podmíněných prvků `if (!ref.current) return;` |
| `Rendered more hooks than during the previous render.` | hook pod předčasným `return` nebo v `if` | všechny hooky nahoru |
| obrazovka se nemění, data v konzoli sedí | reducer mutoval stav a vrátil tentýž objekt | vracet nový objekt |
| „mám boundary a přesto to padá do konzole" | chyba z handleru nebo z promise | `try`/`catch` a stav chyby |
| `fallback` se točí donekonečna | promise se vyrábí v renderu | promise mimo render (modul, cache, knihovna) |
