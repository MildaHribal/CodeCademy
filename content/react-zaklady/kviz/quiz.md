---
pass: 0.8
---

# --questions--

## --question--

Komponenta dostane prázdné pole `items`. Co uvidí uživatel na stránce?

```jsx
export default function Basket({ items }) {
  return <div>{items.length && <p>V košíku máš {items.length} položek</p>}</div>;
}
```

### --expected--

0

### --why--

`[].length` je `0`, a `0 && cokoli` se vyhodnotí jako `0`. Nula není `false` ani `null`, takže ji React poslušně vykreslí jako text. Opravou je podmínka, ze které vypadne `false`: `items.length > 0 && …`.

### --see--

react-zaklady/komponenty-a-props#podminene-vykresleni

## --question--

Co se vypíše do konzole při **prvním** kliknutí na tlačítko?

```jsx
export default function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count);
  }

  return <button onClick={handleClick}>Přidat</button>;
}
```

### --expected--

0

### --why--

`count` je konstanta uvnitř jednoho renderu. `setCount` ji nepřepisuje — naplánuje další render, ve kterém bude `count` jednička. V téhle obsluze zůstává `0` až do konce.

### --see--

react-zaklady/stav-jako-snimek#stav-je-snimek-renderu

## --question--

`count` je `0`. O kolik se zvýší po jednom kliknutí?

```jsx
function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}
```

### --answer--

O tři — každé volání přidá jedničku.

#### --why--

Myslíš si, že `setCount` mění `count` okamžitě? Zkus si dosadit: čím je `count` na druhém a třetím řádku, když se během obsluhy nemění?

### --correct--

O jedna — všechna tři volání počítají z téže nuly.

#### --why--

Všechny tři řádky se vyhodnotí jako `setCount(0 + 1)`. React změny z jedné obsluhy slije do jednoho renderu a vyhraje ta poslední.

### --answer--

O jedna, protože React zahodí volání, která se opakují se stejným argumentem.

#### --why--

Výsledek je náhodou správný, důvod ne. React volání nezahazuje podle argumentu — nakonec je použije všechna, jen počítají ze stejného vstupu.

### --see--

react-zaklady/stav-jako-snimek#davkovani-nekolik-zmen-jeden-render

## --question--

`count` je `0`. Jaká hodnota bude v `count` po jednom kliknutí?

```jsx
function handleClick() {
  setCount((current) => current + 1);
  setCount((current) => current + 1);
  setCount((current) => current + 1);
}
```

### --expected--

3

### --why--

Funkci aktualizace React zavolá s hodnotou, kterou do fronty přidala předchozí funkce. Fronta tedy počítá `0 → 1 → 2 → 3`. Render je pořád jen jeden, jen se do něj dojde přes tři kroky.

### --see--

react-zaklady/stav-jako-snimek#funkce-aktualizace

## --question--

K čemu React potřebuje `key` u položek seznamu?

### --answer--

Aby věděl, v jakém pořadí má položky vykreslit.

#### --why--

Pořadí si React přečte z pole — to je dané už tím, jak jdou položky za sebou. `key` odpovídá na jinou otázku než „kdo je kde".

### --correct--

Aby mezi dvěma rendery poznal, která položka je která.

#### --why--

Podle `key` React spáruje položku ze starého seznamu s položkou z nového. Bez párování by nevěděl, jestli položka přibyla, zmizela, nebo se jen posunula.

### --answer--

Aby se každá položka vykreslila jen jednou a nevznikaly duplicity.

#### --why--

Duplicity nevznikají — React vykreslí přesně to, co je v poli. `key` řeší, co se stane s už vykreslenou položkou, když se pole změní.

### --see--

react-zaklady/komponenty-a-props#seznam-z-pole-a-key

## --question--

Seznam úkolů se vykresluje přes `map` s `key={index}`. U každého úkolu je `<input>`, do kterého si uživatel napsal poznámku. Uživatel smaže **první** úkol. Co se stane s poznámkami?

### --correct--

Posunou se o řádek výš a zůstanou u cizích úkolů.

#### --why--

Klíče se po smazání přečíslují: druhý úkol má nově `key={0}`. React proto vidí „položka 0 se jen změnila" a nechá jí předchozí `<input>` i s jeho obsahem.

### --answer--

Smažou se všechny, protože se celý seznam vykreslí znovu.

#### --why--

React nezahazuje, co může použít znovu — přesně o tom je párování přes `key`. Zkus si projít, jaké klíče mají položky před smazáním a po něm.

### --answer--

Nic se nestane, obsah `<input>` drží prohlížeč sám podle pozice v dokumentu.

#### --why--

Prohlížeč drží hodnotu konkrétního prvku, ne pozice. Otázka je, který prvek React pro který úkol použije.

### --see--

react-zaklady/komponenty-a-props#seznam-z-pole-a-key

## --question--

Jak se v JSX jmenuje atribut, kterým prvku přidáš CSS třídu?

### --expected--

className

### --why--

`class` je v JavaScriptu klíčové slovo, takže JSX používá jméno z DOM API — `element.className`. Ze stejného soudku je `htmlFor` místo `for`.

### --see--

react-zaklady/proc-react#atributy-se-jmenuji-jako-v-javascriptu

## --question--

Doplň atribut, kterým se `<label>` v JSX sváže s polem `<input id="email">`.

```jsx
<label ???="email">E-mail</label>
```

### --expected--

htmlFor

### --why--

`for` je v JavaScriptu klíčové slovo cyklu, takže JSX bere jméno z DOM API (`label.htmlFor`). Ve výsledném HTML z něj bude obyčejné `for="email"`.

### --see--

react-zaklady/proc-react#atributy-se-jmenuji-jako-v-javascriptu

## --question--

Proč komponenta nesmí přepsat hodnotu, kterou dostala v props?

### --correct--

Protože data patří rodiči — ten je při dalším renderu pošle znovu a změna by se ztratila.

#### --why--

Props jsou vstup jednoho renderu. Rodič je při příštím renderu pošle znovu podle svého stavu, takže zápis do nich nikam nevede a jen rozejde to, co komponenta ukazuje, s tím, co rodič ví.

### --answer--

Protože objekt props React zmrazí a přiřazení skončí výjimkou.

#### --why--

Ověř si to: přiřazení do props ve vývojovém režimu nespadne. Otázka není, jestli to jde napsat, ale proč to nic nevyřeší.

### --answer--

Protože props se dají měnit jen přes `useState` uvnitř té komponenty.

#### --why--

Stav a props jsou dvě různé věci. Kdo má hodnotu měnit, není komponenta, která ji dostala — je to ten, kdo ji posílá.

### --see--

react-zaklady/komponenty-a-props#props-se-neprepisuji

## --question--

Co se objeví na stránce?

```jsx
export default function Cities() {
  return <p>{['Praha', 'Brno']}</p>;
}
```

### --expected--

PrahaBrno

### --why--

Pole ve složených závorkách React vykreslí položku po položce, bez čárek a bez mezer. Proto se seznamy dělají přes `map` na prvky a mezi text se mezery píšou ručně.

### --see--

react-zaklady/proc-react#co-se-z-vykresli-a-co-ne

## --question--

Do pole `<input value={query} />` jde klikat i psát, ale text se v něm nikdy neobjeví. Co chybí?

### --correct--

Obsluha `onChange`, která napsanou hodnotu uloží do stavu.

#### --why--

`value` ze stavu říká poli, co má ukazovat. Dokud stav nikdo nemění, pole se po každém stisku vrátí na starou hodnotu.

### --answer--

Atribut `defaultValue` místo `value`.

#### --why--

S `defaultValue` by psaní fungovalo, jenže pak by o obsahu pole komponenta nevěděla. Otázka je, co chybí k tomu, aby řízené pole fungovalo.

### --answer--

Chybí `type="text"`, bez něj je pole jen ke čtení.

#### --why--

Výchozí `type` je `text` a s režimem jen pro čtení nemá nic společného. Zaměř se na to, odkud se bere hodnota, kterou pole ukazuje.

### --see--

react-zaklady/udalosti-a-formulare#rizene-pole

## --question--

Obsluha `onChange` dostane objekt události. Napiš celý výraz, kterým z něj přečteš, co je právě napsané v `<input>`. (Vlastnost najdeš v MDN pod `HTMLInputElement`.)

```jsx
function handleChange(event) {
  setQuery(/* sem */);
}
```

### --expected--

event.target.value

### --accept--

```js
e.target.value
```

```js
event.currentTarget.value
```

### --why--

`event.target` je prvek, na kterém událost vznikla, a `value` je jeho aktuální obsah. U `<input type="checkbox">` bys místo `value` sáhl na `checked`.

### --see--

react-zaklady/udalosti-a-formulare#co-obsluha-dostane-objekt-udalosti

# --code-- Rezervace vstupenek v kině

## --file-- Booking.jsx

```jsx
import { useState } from 'react';

var TICKET_PRICE = 220;

var ROWS = [
  { number: 1, seats: 6 },
  { number: 2, seats: 8 },
  { number: 3, seats: 8 },
];

function seatLabel(row, seat) {
  return 'Řada ' + row + ', místo ' + seat;
}

function buildSeats() {
  var all = [];
  for (var i = 0; i < ROWS.length; i++) {
    for (var s = 1; s <= ROWS[i].seats; s++) {
      all.push({ row: ROWS[i].number, seat: s, taken: (i + s) % 5 === 0 });
    }
  }
  return all;
}

var SEATS = buildSeats();

export default function Booking() {
  const [picked, setPicked] = useState([]);
  const [bonus, setBonus] = useState(0);

  function isPicked(item) {
    for (var i = 0; i < picked.length; i++) {
      if (picked[i].row === item.row && picked[i].seat === item.seat) {
        return true;
      }
    }
    return false;
  }

  function toggle(item) {
    if (isPicked(item)) {
      setPicked(
        picked.filter(function (one) {
          return one.row !== item.row || one.seat !== item.seat;
        }),
      );
    } else {
      setPicked(picked.concat([item]));
    }
  }

  function addBonus() {
    setBonus(bonus + 1);
    setBonus(bonus + 1);
  }

  var total = picked.length * TICKET_PRICE;

  return (
    <div className="booking">
      <h1>Rezervace vstupenek</h1>
      {picked.length && <p>Vybráno míst: {picked.length}</p>}
      <ul className="booking__seats">
        {SEATS.map(function (item, index) {
          return (
            <li key={index}>
              <button disabled={item.taken} onClick={() => toggle(item)}>
                {seatLabel(item.row, item.seat)}
              </button>
            </li>
          );
        })}
      </ul>
      <p>Cena celkem: {total} Kč</p>
      <button onClick={addBonus}>Přidat bonusový bod ({bonus})</button>
    </div>
  );
}
```

## --question--

Uživatel stránku právě otevřel a nemá vybrané žádné místo. Co se vykreslí na místě řádku 62 v `Booking.jsx`?

### --expected--

0

### --why--

`picked` je prázdné pole, `picked.length` je `0` a výraz `0 && …` skončí nulou. React nulu vykreslí jako text, takže mezi nadpisem a seznamem sedadel visí osamělá nula. Podmínka měla znít `picked.length > 0 && …`.

### --see--

react-zaklady/komponenty-a-props#podminene-vykresleni

## --question--

Kolik bodů přibude po **jednom** kliknutí na tlačítko „Přidat bonusový bod" (obsluha `addBonus` na řádku 52 v `Booking.jsx`)?

### --expected--

1

### --why--

Obě volání na řádcích 53 a 54 čtou stejné `bonus` z právě běžícího renderu, takže obě znamenají `setBonus(0 + 1)`. Aby se přičetly obě, musely by být zapsané jako funkce aktualizace: `setBonus((current) => current + 1)`.

### --see--

react-zaklady/stav-jako-snimek#funkce-aktualizace

## --question--

Na řádku 66 v `Booking.jsx` je `key={index}`. Proč je to u tohohle seznamu v pořádku?

### --correct--

Protože `SEATS` se nikdy nemění — položky nepřibývají, nemizí ani se nepřerovnávají.

#### --why--

`SEATS` se spočítá jednou při načtení modulu a nikdo do něj nesahá. Index je pak pro každé sedadlo napořád stejný, takže se chová jako stabilní identifikátor.

### --answer--

Protože každé sedadlo má `key` jedinečné v rámci celého dokumentu.

#### --why--

Jedinečnost napříč dokumentem React nevyžaduje, stačí mezi sousedy. A `index` by tuhle podmínku splnil i u seznamu, kde by index dělal problémy.

### --answer--

Protože `<li>` má uvnitř jen tlačítko, a to si žádný vlastní stav nedrží.

#### --why--

Přeházené položky rozhodí i prvky bez stavu — třeba probíhající animaci nebo zaměřené tlačítko. Podstatné je něco na straně dat, ne na straně obsahu položky.

### --see--

react-zaklady/komponenty-a-props#seznam-z-pole-a-key

## --question--

Co by se stalo, kdyby se `onClick={() => toggle(item)}` na řádku 67 přepsalo na `onClick={toggle(item)}`?

### --correct--

`toggle` by se zavolala během renderu a stránka by skončila chybou o příliš mnoha překresleních.

#### --why--

Bez šipkové funkce se `toggle(item)` vyhodnotí hned při sestavování JSX. Zavolá `setPicked`, což si vyžádá další render, ten `toggle` zavolá znovu — a React smyčku po pár kolech zastaví.

### --answer--

Nic, jen by se obsluha zaregistrovala rychleji, protože se nevytváří nová funkce.

#### --why--

`onClick` čeká funkci, kterou zavolá až při kliknutí. `toggle(item)` ale není funkce — je to výsledek volání, které proběhlo okamžitě.

### --answer--

Tlačítko by přestalo reagovat na kliknutí, protože `onClick` by dostalo `undefined`.

#### --why--

`toggle` sice nic nevrací, takže by v `onClick` skutečně skončilo `undefined` — jenže ještě předtím se stane něco, co stránku vůbec nepustí k tomu, aby na kliknutí čekala.

### --see--

react-zaklady/udalosti-a-formulare#obsluha-udalosti-je-funkce-kterou-predavas
