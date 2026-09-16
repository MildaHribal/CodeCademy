## Kam který stav patří

| druh | příklad | nástroj |
|---|---|---|
| UI stav | otevřený dialog, přepnutá záložka | `useState` v nejmenší komponentě |
| stav formuláře | rozepsaná adresa, zaškrtnutý souhlas | `useState`, `useActionState`, knihovna na formuláře |
| serverová data | objednávky, profil, košík | knihovna na dotazy (cache, ne stav) |
| [[stav v URL]] | filtr, řazení, stránka, otevřené id | `useSearchParams`, parametr trasy |
| globální klientský stav | motiv, jazyk, postranní panel | kontext, `useReducer`, Zustand |

Rozhodovací postup, první „ano" vyhrává:

1. Vlastní tu hodnotu server? → serverová data.
2. Má na ni jít poslat odkaz? → adresa.
3. Píše ji uživatel do formuláře a ještě ji neodeslal? → stav formuláře.
4. Potřebuje ji víc než jedna větev komponent? → nejbližší společný rodič, při
   větším rozsahu kontext.

Když nepadne ani jedno „ano", je to obyčejný UI stav.

## Trasy

```jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="kola/:id" element={<BikeDetail />} />
    <Route element={<RequireAuth />}>
      <Route path="ucet" element={<Account />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

| chci | zápis |
|---|---|
| odkaz | `<Link to="/kola/12">…</Link>` |
| odkaz se zvýrazněním aktivní stránky | `<NavLink to="/kola">…</NavLink>` |
| místo pro vnořenou trasu v layoutu | `<Outlet />` |
| parametr z cesty | `const { id } = useParams()` |
| přesměrování při vykreslení | `<Navigate to="/prihlaseni" replace />` |
| přesměrování z obsluhy události | `const navigate = useNavigate()` |
| filtr v adrese | `const [params, setParams] = useSearchParams()` |

## Stav v adrese

```jsx
const [params, setParams] = useSearchParams();
const type = params.get('typ') ?? 'vse';           // čti při každém vykreslení
setParams({ typ: 'elektro' });                      // zapiš, nikdy nekopíruj do useState

params.getAll('typ');                               // víc hodnot pod jedním jménem
params.append('typ', 'mestske');                    // set by tu první přepsal
```

Odkaz, který má parametry nést dál: `` <Link to={`/kola/${id}?${params}`}> ``.

## Serverová data

```jsx
const { data, isPending, isError, error, refetch } = useQuery({
  queryKey: ['ukoly', filter],        // všechno, na čem odpověď závisí
  queryFn: () => fetchTasks(filter),
  staleTime: 30_000,                  // jak dlouho data platí bez doptání
});
```

```jsx
const client = useQueryClient();
const mutation = useMutation({
  mutationFn: createTask,
  onSuccess: () => client.invalidateQueries({ queryKey: ['ukoly'] }),
});
mutation.mutate({ text: 'Vyprat hadry' });
```

[[optimistická úprava]] má vždycky tři kroky:

```jsx
onMutate: async (next) => {
  await client.cancelQueries({ queryKey: ['ukoly'] });
  const previous = client.getQueryData(['ukoly']);          // 1. snímek
  client.setQueryData(['ukoly'], (old) => apply(old, next)); // 2. ukaž hned
  return { previous };
},
onError: (error, next, context) => client.setQueryData(['ukoly'], context.previous), // 3. vrať
onSettled: () => client.invalidateQueries({ queryKey: ['ukoly'] }),
```

| hodnota | co znamená |
|---|---|
| `staleTime` | jak dlouho jsou data považovaná za čerstvá (výchozí 0) |
| `gcTime` | jak dlouho zůstanou v paměti, když je nikdo nepoužívá (výchozí 5 min) |
| `isPending` | ještě nikdy nedorazila data |
| `isFetching` | právě se načítá (i na pozadí, i když data už jsou) |
| `invalidateQueries` | označ za stará a načti znovu (prefixově) |
| `setQueryData` | přepiš v cache rovnou, bez dotazu |

## Formulář

```jsx
<form noValidate onSubmit={handleSubmit}>
  <label htmlFor="guest">Jméno a příjmení</label>
  <input
    id="guest"
    name="guest"
    aria-invalid={errors.guest ? 'true' : undefined}
    aria-describedby={errors.guest ? 'guest-error' : undefined}
  />
  {errors.guest && <p className="error" id="guest-error">{errors.guest}</p>}
  <button type="submit" disabled={sending}>{sending ? 'Odesílám…' : 'Odeslat'}</button>
</form>
```

- Hodnoty čti přes `new FormData(event.currentTarget)` — nemusíš mít `useState`
  na každé pole a po neúspěšném odeslání zůstanou vyplněné samy.
- Validace je **čistá funkce**: dostane data, vrátí objekt chyb. Dá se otestovat
  bez vykreslení a sdílet se serverem.
- Potvrzení po odeslání dej do prvku s `role="status"`, ať ho čtečka oznámí sama.

## Styly

| přístup | jak |
|---|---|
| CSS Modules | `import styles from './Card.module.css'`, `className={styles.card}` |
| Tailwind | `className="rounded-xl bg-white p-6"`, opakovaný blok schovej do komponenty |
| podmíněná třída | `clsx('tab', isActive && 'tab--active')` |
| stav na prvku | `data-state={isActive ? 'active' : 'idle'}` a v CSS `[data-state='active']` |
| tokeny | `:root { --surface: #fff }` a v komponentě `background: var(--surface)` |
| tmavý režim | druhá sada hodnot na `[data-theme='dark']`, komponenty se nemění |

## Přihlášení

```jsx
// server: Set-Cookie: session=…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1209600
fetch('/api/me', { credentials: 'include' });    // 'include' u VŠECH volání, i u login

function RequireAuth() {
  const { data: user, isPending } = useCurrentUser();
  if (isPending) return <Spinner />;                              // 1. ještě nevíme
  if (!user) return <Navigate to="/prihlaseni" replace />;        // 2. nepřihlášen
  return <Outlet />;                                              // 3. přihlášen
}
```

Odhlášení = `POST /api/logout` (cookie ruší server) **a** `queryClient.clear()`.

## Testy komponent

| chci najít | dotaz |
|---|---|
| tlačítko, odkaz, nadpis | `getByRole('button', { name: 'Uložit' })` |
| formulářové pole | `getByLabelText('E-mail')` |
| text na stránce | `getByText(/zrušit zdarma/i)` |
| ověřit, že něco **není** | `queryByText('Hotovo')` |
| něco, co přijde po načtení | `await findByRole('listitem')` |

```jsx
const user = userEvent.setup();     // před render()
render(<Form />);
await user.type(screen.getByLabelText('Jméno a příjmení'), 'Eva Novotná');
await user.click(screen.getByRole('button', { name: 'Odeslat' }));
expect(await screen.findByRole('status')).toHaveTextContent(/přijato/i);
```

## Pasti, které stojí nejvíc času

| příznak | příčina | oprava |
|---|---|---|
| komponenta ukazuje starou hodnotu, po F5 správnou | props zkopírované do `useState` | čti z props, odvozené počítej při renderu |
| zvýrazněné tlačítko neodpovídá výpisu | filtr ve stavu **i** v adrese | jedna hodnota, jedno místo |
| po přepnutí filtru chvíli svítí cizí data | filtr chybí v klíči dotazu | dej ho do `queryKey` |
| po přidání položky se seznam nezmění | chybí zneplatnění po mutaci | `invalidateQueries` v `onSuccess` |
| po F5 na chráněné stránce skončíš na přihlášení | přesměrování před dokončením dotazu | nejdřív větev `isPending` |
| přihlášení projde, další dotaz vrátí 401 | chybí `credentials: 'include'` | jedna společná funkce `api()` |
| po přehlášení blikne cizí seznam | odhlášení bez úklidu cache | `queryClient.clear()` |
| modifikátor třídy se neprojeví | pořadí pravidel v CSS | dej modifikátor **pod** základní třídu |
| prvek je bez stylu, `class="undefined"` | překlep v `styles.neco` | klíč musí odpovídat jménu třídy v souboru |
| test občas projde, občas ne | chybí `await` nebo `getBy` místo `findBy` | čekej na výsledek, nikdy na čas |
