## JSX v kostce

| chceš | píšeš |
|---|---|
| CSS třídu | `className="karta"` |
| `for` u `<label>` | `htmlFor="email"` |
| inline styl | `style={{ fontSize: 20, color: 'crimson' }}` |
| výraz uvnitř textu | `<p>Cena: {price} Kč</p>` |
| víc prvků bez obalu | `<>…</>`, s klíčem `<Fragment key={id}>` |
| komentář | `{/* poznámka */}` |

Ve složených závorkách se vykreslí text a čísla. `null`, `undefined`, `false` a `true` se nevykreslí. Pole se vykreslí položku po položce, bez oddělovačů.

## Komponenta a props

```jsx
function Price({ value, currency = 'Kč' }) {
  return <strong className="price">{value} {currency}</strong>;
}

export default function Card({ title, children }) {
  return (
    <article className="card">
      <h2>{title}</h2>
      {children}
      <Price value={249} />
    </article>
  );
}
```

Jméno komponenty začíná velkým písmenem. Props jsou jen ke čtení. Obsah mezi značkami přijde v `children`.

## Seznam z pole

```jsx
<ul>
  {products.map((product) => (
    <li key={product.id}>{product.name}</li>
  ))}
</ul>
```

`key` je stabilní identifikátor z dat, jedinečný mezi sousedy. Index použij jen u seznamu, který se nikdy nemění.

## Podmíněné vykreslení

```jsx
{items.length > 0 && <p>Položek: {items.length}</p>}
{isLoggedIn ? <Profile user={user} /> : <LoginButton />}
{user.nickname ?? 'Host'}
```

## Stav

```jsx
const [count, setCount] = useState(0);
const [form, setForm] = useState({ name: '', email: '' });
```

| situace | zápis |
|---|---|
| nová hodnota nezávisí na staré | `setFilter('obed')` |
| navazuje na předchozí nebo se mění víckrát v jedné obsluze | `setCount((current) => current + 1)` |
| přidat do pole | `setItems([...items, item])` |
| smazat z pole | `setItems(items.filter((item) => item.id !== id))` |
| změnit položku pole | `setItems(items.map((item) => (item.id === id ? { ...item, done: true } : item)))` |
| změnit vlastnost objektu | `setForm({ ...form, email: value })` |

Stav je snímek renderu: uvnitř jedné obsluhy se hodnota nemění. Odvozené hodnoty (součet, filtrovaný seznam, „je to poslední") počítej v těle komponenty, do stavu nepatří.

## Události a formuláře

```jsx
<button onClick={handleClick}>Uložit</button>
<button onClick={() => remove(item.id)}>Smazat</button>

<input value={query} onChange={(event) => setQuery(event.target.value)} />
<input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
<input type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />

<form onSubmit={(event) => { event.preventDefault(); save(); }}>…</form>
```

Do `onClick` patří funkce, ne její výsledek. Argument se předává přes šipkovou funkci.

## Zvednutí stavu

Potřebují hodnotu dvě komponenty? Stav patří do jejich nejbližšího společného rodiče. Dolů jde hodnota i funkce, která ji mění:

```jsx
export default function Filtered() {
  const [query, setQuery] = useState('');
  return (
    <>
      <SearchBox value={query} onChange={setQuery} />
      <Results items={items.filter((item) => item.name.includes(query))} />
    </>
  );
}
```

## Pasti

| co vidíš | proč | oprava |
|---|---|---|
| na stránce visí osamělá `0` | `items.length && …` vrací nulu | `items.length > 0 && …` |
| tři volání `setCount(count + 1)` přidají jedničku | všechna čtou stejný snímek | `setCount((current) => current + 1)` |
| po `setItems` se nic nepřekreslí | `items.push(…)` změnilo totéž pole | vyrob nové pole (`[...items, item]`) |
| po smazání řádku zůstal text v cizím `<input>` | `key={index}` | `key={item.id}` |
| do pole jde psát, ale text se neobjeví | `value` ze stavu bez `onChange` | doplň `onChange` |
| obsluha se zavolá hned při renderu | `onClick={remove(id)}` | `onClick={() => remove(id)}` |
| „Cannot read properties of undefined" po smazání | komponenta čte položku, která už v poli není | čti z aktuálního stavu, ne z uložené kopie |
| stránka se překresluje donekonečna | `setState` v těle komponenty | přesuň volání do obsluhy události |
