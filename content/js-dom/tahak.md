**Data jsou [[zdroj pravdy]], stránka se z nich vykresluje.** Akce změní data, uloží je a zavolá `render()`. Cizí text jde do stránky jen jako text.

## Hledání a změny prvků

| co | jak | pozor |
|---|---|---|
| první prvek | `document.querySelector('.card')` | nic nenajde → `null`, ne chyba |
| všechny prvky | `document.querySelectorAll('.card')` | `NodeList` je snímek a nemá `map` → `[...nodes]` |
| předek | `button.closest('.card')` | hledá až ke kořeni, i sám prvek |
| text | `el.textContent = text` | bezpečné i pro text od uživatele |
| HTML | `el.innerHTML = html` | jen vlastní HTML, jinak [[XSS]] |
| třídy | `el.classList.toggle('is-done', podmínka)` | jedna třída na argument |
| vlastní data | `data-order-id` → `el.dataset.orderId` | vždycky řetězec |
| atribut | `el.setAttribute('aria-pressed', 'true')` | hodnota je text |
| stav pole | `input.value`, `checkbox.checked` | atribut `value` je jen výchozí hodnota |
| skrytí | `el.hidden = true` | `display` v CSS ho přebije |

Skript načítej `<script src="app.js" defer>` nebo jako modul.

## Události

| co | význam |
|---|---|
| `event.target` | kde událost vznikla (i ikona uvnitř tlačítka) |
| `event.currentTarget` | prvek, jehož posluchač běží |
| `event.preventDefault()` | zruší [[výchozí akce|výchozí akci]]: odeslání, odkaz, zaškrtnutí, posun |
| `event.stopPropagation()` | zastaví cestu k předkům — skoro nikdy |
| `{ once: true }` | posluchač se po prvním zavolání odebere |
| `{ signal }` | `controller.abort()` odebere všechny posluchače najednou |
| `input` / `change` | každá změna / dokončená změna (select a políčko hned) |
| `new CustomEvent('x', { bubbles: true, detail })` | vlastní událost; bez `bubbles` neprobublá |

Cesta události: zachycení (dolů) → cíl → [[probublávání]] (nahoru). `focus` a `blur` neprobublávají, `focusin` a `focusout` ano.

## Kam s kterým stavem

| stav | kam |
|---|---|
| filtr, hledání, řazení, stránka, záložka | [[parametry adresy]] |
| motiv, jazyk, oblíbené bez účtu, koncept | `localStorage` |
| otevřené menu, stav načítání | proměnná |
| objednávky, profil | server |

## Vzory

### Vykreslení seznamu ze šablony

```js
function render() {
  const items = products.map((product) => {
    const item = template.content.firstElementChild.cloneNode(true);
    item.dataset.id = product.id;
    item.querySelector('.product__name').textContent = product.name;
    return item;
  });
  list.replaceChildren(...items);
}
```

### Delegace

```js
list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || !list.contains(button)) return;
  const id = button.closest('[data-id]').dataset.id;
  handleAction(button.dataset.action, id);
});
```

### Formulář v JavaScriptu

```js
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const email = data.get('email').trim();
  const newsletter = data.has('newsletter');
  saveSignup({ email, newsletter });
});
```

### Vlastní pravidlo formuláře

```js
function checkPasswordsMatch() {
  confirm.setCustomValidity(confirm.value === password.value ? '' : 'Hesla se neshodují.');
}
```

### Bezpečné čtení z `localStorage`

```js
function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem('favorites'));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
```

### Stav v adrese a tlačítko Zpět

```js
const url = new URL(location.href);
url.searchParams.set('kategorie', category);
history.pushState(null, '', url);      // rozhodnutí → nový záznam
// při psaní: history.replaceState(null, '', url)

window.addEventListener('popstate', renderFromUrl);
```

### Sledování viditelnosti

```js
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  }
}, { threshold: 0.5 });
```

## Pasti

- `querySelector('price')` bez tečky → `null` a `TypeError` až o řádek dál.
- `nodes.map is not a function` → `[...nodes].map(…)`.
- `card.dataset.price + 1` → `'3491'`; převáděj přes `Number`.
- Text od uživatele přes `innerHTML` → spustí se cizí kód.
- `addEventListener('click', save())` předá výsledek funkce, ne funkci.
- `event.target.dataset.id` je `undefined` po kliknutí na ikonu → `closest`.
- Posluchač přidaný uvnitř `render()` se po každém překreslení spustí o jednou víc.
- `removeEventListener` s novou šipkovou funkcí nic neodebere.
- Překreslení nahradí prvek s fokusem → fokus zmizí na `body`.
- `form.submit()` obejde validaci i posluchač → `form.requestSubmit()`.
- `setCustomValidity('…')` bez `setCustomValidity('')` → formulář nejde odeslat nikdy.
- `localStorage.setItem('cart', cart)` bez `JSON.stringify` → `[object Object]`.
- `pushState` při každém písmenu → Zpět vrací písmeno po písmenu.
- Po Zpět se změní jen adresa → chybí posluchač `popstate`.
- Hodnotám z adresy a úložiště nevěř — ověř je proti povoleným.
