# Z Reactu do Vue

Přijdeš do firmy, kde admin běží ve Vue a nový web v Nextu. Nebo tě na pohovoru poprosí, ať přečteš komponentu, kterou jsi nikdy nepsal. Vue je po Reactu druhý nejrozšířenější framework, a protože řeší stejné problémy, umíš z něj po přečtení téhle lekce devadesát procent — zbytek jsou jiná slova pro věci, které už znáš.

:::check pretest
V Reactu se komponenta při každé změně stavu zavolá celá znovu. Co myslíš, že udělá Vue, když se změní hodnota, kterou vypisuješ na jednom místě v šabloně?

### --answer--
Zavolá komponentu celou znovu, jen je to rychlejší.

#### --why--
Tohle je zvyk z Reactu. Vue si při prvním vykreslení zapamatovalo, kdo hodnotu čte, a podle toho se rozhoduje.

### --correct--
Aktualizuje jen to místo v DOMu, které tu hodnotu čte.

#### --why--
Vue sleduje, které části šablony hodnotu použily, a překreslí jen je. Proč to jde, uvidíš v lekci o reaktivitě.

### --answer--
Počká na `nextTick` a pak překreslí celou stránku.

#### --why--
Změny se opravdu promítají až v mikroúloze, ale překresluje se jen dotčená část, ne stránka.
:::

:::check pretest
V JSX píšeš `className`, protože `class` je v JavaScriptu klíčové slovo. Co myslíš, že se ve Vue píše do šablony?

### --expected--
class

### --why--
Šablona Vue není JavaScript, ale HTML. Atributy se proto jmenují tak, jak je znáš z HTML: `class`, `for`, `tabindex`.
:::

## Problém: stejná aplikace, jiná slova

Tahle komponenta Reactu ti je povědomá:

```jsx
function MealCard({ meal, onRemove }) {
  const [portions, setPortions] = useState(1);
  const total = useMemo(() => meal.kcal * portions, [meal.kcal, portions]);

  return (
    <article className="card">
      <h2>{meal.name}</h2>
      <p>{total} kcal</p>
      <button onClick={() => setPortions(portions + 1)}>Další porce</button>
      <button onClick={() => onRemove(meal.id)}>Smazat</button>
    </article>
  );
}
```

Ve Vue je to řádek po řádku totéž. Jen `useState` se jmenuje `ref`, `useMemo` se jmenuje `computed`, `onClick` je `@click`, `className` je `class` a značkování nevrací funkce, ale stojí v `<template>`. Framework za tebe pořád dělá jedinou věc: drží DOM v souladu s daty.

> [!REMEMBER]
> **Vue má stejné součástky jako React, jen jinak pojmenované: stav, odvozenou hodnotu, props, události a seznam.** Když v cizí komponentě najdeš tyhle čtyři věci, přečteš ji, i kdybys Vue nikdy nepsal.

Rozdíl, na kterém záleží, je jen jeden a uvidíš ho celou lekci: React ti dá JavaScript a značkování v něm, Vue ti dá HTML a JavaScript vedle něj.

:::check
Která čtveřice pojmů má ve Vue přímý protějšek toho, co znáš z Reactu?

### --answer--
`useEffect`, `useRef`, `memo`, `Suspense` — všechno se jmenuje stejně.

#### --why--
Některé protějšky opravdu existují, ale jmenují se jinak. Na jména se podívej v převodní tabulce na konci lekce.

### --correct--
Stav, odvozená hodnota, props a události.

#### --why--
Tohle jsou součástky, které má každý framework. Vue je jen pojmenovalo jinak.

### --answer--
Virtuální DOM, hydratace, tree shaking a bundler.

#### --why--
To jsou věci pod kapotou nebo kolem sestavení, ne součástky, ze kterých skládáš komponentu.
:::

## Šablona místo JSX

Komponenta Vue má [[šablona Vue|šablonu]]: kus HTML, do kterého se píšou dvě věci. Hodnoty se vypisují dvojitými složenými závorkami — tomu se říká [[interpolace]] — a chování se přidává atributy, které začínají `v-`. Takovému atributu se říká [[direktiva]].

| co chceš | JSX | šablona Vue |
|---|---|---|
| vypsat hodnotu | `{total}` | `{{ total }}` |
| atribut z proměnné | `src={url}` | `:src="url"` (`v-bind:src`) |
| obsluha události | `onClick={remove}` | `@click="remove"` (`v-on:click`) |
| podmínka | `{ok && <p>…</p>}` | `<p v-if="ok">…</p>` |
| seznam | `items.map(…)` | `<li v-for="item in items" :key="item.id">` |
| třída z podmínky | `className={a ? 'x' : ''}` | `:class="{ x: a }"` |

Uvnitř `{{ }}` i uvnitř direktivy smí být **výraz**, ne příkaz. `{{ kcal > limit ? 'moc' : 'ok' }}` projde, `{{ if (kcal) … }}` ne — stejné pravidlo jako ve složených závorkách JSX.

:::live vue
```html
<div id="app" class="card">
  <h2>{{ meal }}</h2>
  <p>Snědl jsi {{ kcal }} kcal z {{ limit }}.</p>
  <p v-if="kcal > limit" class="warn">Dnešní limit je překročený.</p>
  <p v-else class="ok">Ještě ti zbývá {{ limit - kcal }} kcal.</p>
  <button @click="kcal += 150">Přidej svačinu</button>
</div>
```
```css
.card { max-width: 22rem; padding: 1.25rem; border-radius: 0.75rem; background: #fff; box-shadow: 0 0.5rem 1.5rem rgb(15 23 42 / 0.15); font-family: system-ui, sans-serif; color: #1e293b; }
h2 { margin: 0 0 0.5rem; font-size: 1.15rem; }
.warn { color: #b91c1c; font-weight: 600; }
.ok { color: #0f766e; }
button { margin-top: 0.5rem; padding: 0.5rem 0.9rem; border: 0; border-radius: 0.5rem; background: #0d9488; color: #fff; font: inherit; cursor: pointer; transition: background 150ms ease; }
button:hover { background: #0f766e; }
```
```js
import { createApp, ref } from 'vue';

createApp({
  setup() {
    const meal = 'Kuřecí salát';
    const kcal = ref(530);
    const limit = 600;
    return { meal, kcal, limit };
  },
}).mount('#app');
```
:::

Zkus zvýšit `limit` na 2000 a sleduj, kolikrát musíš kliknout, než se odstavec s varováním vymění za ten druhý. Za výměnu může `v-if`/`v-else`: prvek, který neplatí, v DOMu vůbec není.

:::check
Napiš atribut, kterým do šablony Vue předáš prvku `<img>` adresu z proměnné `url`. Stačí samotný atribut i s hodnotou.

### --expected--
:src="url"

### --accept--
v-bind:src="url"

### --why--
Bez dvojtečky by se do `src` dostal doslovný text `url`. Dvojtečka je zkratka za `v-bind` a znamená „hodnotu ber jako výraz JavaScriptu".
:::

## Stav: `useState` a `ref`

Stav je ve Vue hodnota v krabičce, kterou vyrobí `ref()`. V JavaScriptu k ní přistupuješ přes `.value`, v šabloně se `.value` nepíše — tam ji Vue [[rozbalení refu|rozbalí]] samo.

```js
// React
const [portions, setPortions] = useState(1);
setPortions(portions + 1);

// Vue
const portions = ref(1);
portions.value += 1;
```

Všimni si, co zmizelo: žádná setter funkce a žádné pravidlo „stav neměň, vyrob nový". Do `.value` se zapisuje přímo a Vue změnu zachytí. Právě proto se stav mění na místě i u polí: `meals.value.push(meal)` je ve Vue běžný a správný zápis, zatímco v Reactu bys `push` na stavovém poli udělat nesměl.

Styl, ve kterém se komponenta skládá z `ref`, `computed` a `watch` uvnitř funkce `setup`, se jmenuje [[Composition API]]. Hooky Reactu a funkce Composition API si odpovídají skoro jedna ku jedné.

:::live vue predict
```html
<div id="app" class="box">
  <p>Porce: {{ portions }}</p>
  <p>Kalorie celkem: {{ doubled }}</p>
</div>
```
```css
.box { font-family: system-ui, sans-serif; color: #1e293b; }
```
```js
import { createApp, ref } from 'vue';

createApp({
  setup() {
    const portions = ref(2);
    const doubled = portions * 530;
    return { portions, doubled };
  },
}).mount('#app');
```
--question-- Co se vypíše na druhém řádku místo `{{ doubled }}`?
--option-- 1060, protože Vue ref v aritmetice rozbalí stejně jako v šabloně.
--option*-- NaN, protože se násobí krabička, ne číslo v ní.
--option-- Chyba `portions is not defined`, protože `ref` se nedá číst v `setup`.
--why-- Rozbalení refu platí v šabloně, ne v obyčejném JavaScriptu. `portions` je objekt, `objekt * 530` je `NaN`. Správně je `portions.value * 530` — ale i tak by se hodnota při změně porcí nepřepočítala, protože obyčejná proměnná nic nesleduje. Na to je `computed` z další části.
:::

:::check
Proměnná `count` vznikla jako `const count = ref(0)`. Napiš příkaz, který ji v JavaScriptu zvýší o jedna.

### --expected--
count.value++

### --accept--
count.value += 1
count.value = count.value + 1

### --why--
`ref` je krabička. `count++` by zvyšovalo samotný objekt a skončilo by na `NaN`, `.value` je ta hodnota uvnitř.
:::

:::explain
V Reactu je `setPortions(portions + 1)` jediná správná cesta, jak změnit stav, a `state.push(x)` je chyba. Ve Vue je `portions.value += 1` i `meals.value.push(meal)` v pořádku. Vysvětli vlastními slovy, čím to je.

## --model--
React o změně stavu neví sám — poznává ji podle toho, že jsi zavolal setter, a novou hodnotu porovnává s předchozí podle identity. Když do pole přidáš přes `push`, identita pole zůstane stejná a React nemá jak poznat, že se něco stalo. Vue si hodnotu obaluje Proxy a zachytává každé čtení i zápis vlastnosti, takže o změně ví bez ohlášení. Proto tam mutace na místě nevadí a setter není potřeba.

## --checklist--
- React se o změně dozví jen zavoláním setteru.
- React porovnává hodnoty podle identity, takže mutace na místě neprojde.
- Vue změnu zachytí samo při zápisu do hodnoty.
- Proto ve Vue stačí měnit hodnotu přímo a setter neexistuje.
:::

## Odvozená hodnota: `useMemo` a `computed`

Odvozenou hodnotu nedržíš ve stavu ani v Reactu, ani ve Vue. Ve Vue ji vyrobí [[computed]]:

```js
// React
const total = useMemo(() => meal.kcal * portions, [meal.kcal, portions]);

// Vue
const total = computed(() => meal.kcal * portions.value);
```

Rozdíl je v tom seznamu na konci. Vue žádný nepotřebuje: při prvním výpočtu si zapamatuje, které reaktivní hodnoty funkce přečetla, a přepočítá se, až když se některá z nich změní. Zapomenutá závislost, klasická chyba v `useMemo` a `useEffect`, ve Vue nevznikne.

Druhý rozdíl je v tom, kdy se počítá. `useMemo` je optimalizace, kterou React smí zahodit; `computed` je normální způsob, jak se ve Vue odvozují data, a používá se i tam, kde bys v Reactu nechal obyčejný výraz v těle komponenty.

:::check
Kolikrát se vyhodnotí funkce uvnitř `computed`, když ji šablona vypíše třikrát a žádná ze sledovaných hodnot se mezitím nezmění?

### --expected--
jednou

### --accept--
1
1x
jedenkrát

### --why--
`computed` si výsledek drží v cache. Přepočítá se až při změně některé ze závislostí, ne při každém čtení.
:::

## Props a události

[[props|Props]] se předávají stejně jako v Reactu, jen s dvojtečkou, když posíláš výraz. Nahoru se ale ve Vue neposílají funkce. Komponenta místo toho vyšle vlastní událost pomocí [[emit]] a rodič ji odchytí přes `@`:

```
React:  <MealRow meal={meal} onRemove={() => remove(meal.id)} />
Vue:    <meal-row :meal="meal" @remove="remove(meal.id)"></meal-row>
```

Uvnitř komponenty deklaruješ, co smí vyslat (`emits: ['remove']`), a vyšleš to zavoláním `$emit('remove')` v šabloně nebo `emit('remove')` v `setup`. Props zůstávají jen ke čtení úplně stejně jako v Reactu: zápis do nich Vue ohlásí varováním v konzoli.

:::live vue
```html
<ul id="app" class="meals">
  <meal-row
    v-for="meal in meals"
    :key="meal.id"
    :name="meal.name"
    :kcal="meal.kcal"
    @remove="remove(meal.id)"
  ></meal-row>
</ul>
```
```css
.meals { max-width: 24rem; margin: 0; padding: 0; list-style: none; font-family: system-ui, sans-serif; color: #1e293b; }
.meal { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-top: 1px solid #e2e8f0; }
.meal span { flex: 1; }
.meal button { border: 0; background: none; color: #b91c1c; font: inherit; cursor: pointer; }
```
```js
import { createApp, ref } from 'vue';

const MealRow = {
  props: { name: String, kcal: Number },
  emits: ['remove'],
  template: `
    <li class="meal">
      <span>{{ name }}</span>
      <strong>{{ kcal }} kcal</strong>
      <button @click="$emit('remove')">Smazat</button>
    </li>`,
};

createApp({
  components: { MealRow },
  setup() {
    const meals = ref([
      { id: 1, name: 'Ovesná kaše', kcal: 420 },
      { id: 2, name: 'Kuřecí salát', kcal: 530 },
      { id: 3, name: 'Tvaroh s malinami', kcal: 300 },
    ]);
    const remove = (id) => {
      meals.value = meals.value.filter((meal) => meal.id !== id);
    };
    return { meals, remove };
  },
}).mount('#app');
```
:::

Zkus v `MealRow` přejmenovat událost `remove` na `delete` (na obou místech) a sleduj, že mazání přestane fungovat, dokud nepřejmenuješ i `@remove` v šabloně rodiče.

> [!PITFALL]
> Šablona v `index.html` je obyčejné HTML, takže prohlížeč jména značek zmenší. Komponentu `MealRow` tam proto voláš jako `<meal-row></meal-row>` a nikdy ji nezavíráš lomítkem (`<meal-row />` HTML nezná a zbytek seznamu skončí uvnitř ní). V souborech `.vue`, které se překládají buildem, `<MealRow />` psát můžeš.

:::check
Rodič chce vědět, že uživatel v komponentě `MealRow` klikl na „Smazat". Co mu komponenta pošle?

### --answer--
Zavolá prop `onRemove`, kterou jí rodič předal.

#### --why--
Tak to dělá React. Vue posílá nahoru události, ne volání funkcí z props.

### --correct--
Vyšle vlastní událost `remove`, kterou rodič odchytí přes `@remove`.

#### --why--
Komponenta jen oznámí, co se stalo. Co se má stát dál, rozhoduje rodič ve své obsluze.

### --answer--
Zapíše novou hodnotu přímo do prop `meals`.

#### --why--
Props jsou ve Vue stejně jako v Reactu jen ke čtení, zápis do nich Vue ohlásí varováním.
:::

## Seznamy a podmínky

`v-for` je `map` napsaná v atributu. Platí u něj stejná pravidla, jaká znáš ze seznamů v Reactu: potřebuje stabilní `:key` z dat (ne index) a bez klíče Vue vypíše varování do konzole.

```
<li v-for="meal in meals" :key="meal.id">{{ meal.name }}</li>
<li v-for="(meal, index) in meals" :key="meal.id">{{ index + 1 }}. {{ meal.name }}</li>
```

Podmínky mají dvě varianty a rozdíl mezi nimi je v DOMu: `v-if` prvek vůbec nevytvoří, `v-show` ho vytvoří a jen mu dá `display: none`. Pro prvek, který se přepíná často, je levnější `v-show`; pro drahý blok, který se skoro nikdy neukáže, `v-if`.

> [!PITFALL]
> `v-if` a `v-for` na jednom prvku je chyba: ve Vue 3 má přednost `v-if`, takže proměnná z `v-for` v něm ještě neexistuje a dostaneš `Property "meal" was accessed during render but is not defined`. Filtruj v `computed` a nad hotovým seznamem už jen iteruj.

:::check
Seznam se po smazání položky uprostřed chová divně: text zůstane u špatného řádku. Co je nejčastější příčina?

### --answer--
Chybí `v-else` u podmínky pod seznamem.

#### --why--
`v-else` řeší, který prvek se vykreslí, ne jak Vue páruje položky seznamu mezi dvěma vykresleními.

### --correct--
`:key` je index z `v-for` místo stabilního id z dat.

#### --why--
Po smazání se indexy posunou, takže Vue spáruje položky podle pořadí a ponechá v nich starý stav.

### --answer--
Seznam se musí překreslit ručně přes `nextTick`.

#### --why--
Překreslení Vue naplánuje samo. Ruční zásah tady nic neřeší.
:::

## Formuláře: `v-model` místo řízeného pole

Řízené pole v Reactu je dvojice `value` a `onChange`. Ve Vue je na to jedna direktiva, [[v-model]]:

```
React:  <input value={name} onChange={(e) => setName(e.target.value)} />
Vue:    <input v-model="name">
```

`v-model` je jen zkratka: `:value` dolů, `@input` nahoru. Ke každému typu prvku sedí sám — u `<input type="checkbox">` pracuje s `checked` a booleanem, u `<select>` s vybranou hodnotou. Užitečné jsou jeho modifikátory: `v-model.number` převede vstup na číslo, `v-model.trim` ořízne mezery a `v-model.lazy` čeká na událost `change` místo `input`.

> [!TIP]
> Číselný vstup bez `.number` vrací text, takže `kcal + 100` z `"420"` udělá `"420100"`. Ve formulářích s čísly piš `v-model.number` hned, ne až po prvním divném součtu.

:::check
Napiš atribut, kterým do `<input type="number">` navážeš proměnnou `kcal` tak, aby v ní bylo číslo, ne text.

### --expected--
v-model.number="kcal"

### --why--
Bez modifikátoru `.number` dá prohlížeč vždy řetězec a dalším výpočtem projde jako text.
:::

## Options API: co potkáš ve starším kódu

Dokud Vue 3 nezavedlo `setup`, psaly se komponenty jako objekt s pojmenovanými oddíly. Tenhle styl se jmenuje [[Options API]], nikam nezmizel a v cizím kódu ho potkáš často:

```js
export default {
  props: ['meal'],
  data() {
    return { portions: 1 };          // stav
  },
  computed: {
    total() { return this.meal.kcal * this.portions; },
  },
  methods: {
    addPortion() { this.portions += 1; },
  },
};
```

Čte se to snadno: `data` je stav, `computed` odvozené hodnoty, `methods` obsluhy. Všechno visí na `this` a `.value` se nikde nepíše. Nové komponenty piš v Composition API, ale když dostaneš na opravu tenhle tvar, nepřepisuj ho — obě API se dají v projektu míchat komponentu po komponentě.

:::check
V Options API je stav ve funkci `data()`. Proč to musí být funkce, a ne obyčejný objekt?

### --answer--
Aby se stav dal načíst ze serveru.

#### --why--
Načítání dat s tím nesouvisí, na to jsou háky životního cyklu.

### --correct--
Aby každá instance komponenty dostala vlastní objekt se stavem.

#### --why--
Jeden sdílený objekt by znamenal, že všechny karty na stránce sdílejí tentýž počet porcí.

### --answer--
Kvůli `this`, které jinak ukazuje na `window`.

#### --why--
`this` uvnitř `data()` Vue nastavuje samo. Důvod je jiný a týká se počtu instancí.
:::

## Převodní tabulka do kapsy

| React | Vue | poznámka |
|---|---|---|
| `useState` | `ref` | ve Vue zápis do `.value`, žádný setter |
| `useState` s objektem | `reactive` | práce bez `.value`, jen na objekty |
| `useMemo` | `computed` | bez seznamu závislostí, s cache |
| `useEffect` | `watch`, `watchEffect` | závislosti sám sleduje |
| `useRef` na prvek | `ref` + `ref="jmeno"` v šabloně | stejné jméno, jiná věc |
| `useContext` | `inject` / `provide` | sdílení skrz strom |
| `useReducer` + kontext | store v Pinii | viz lekce o SFC a Pinii |
| `props.onX` | `emits` + `$emit('x')` | nahoru jde událost, ne funkce |
| `children` | `<slot>` | Vue jich umí víc a pojmenované |
| `key` | `:key` | stejná pravidla |
| `className` | `class` | šablona je HTML |
| `memo`, `useCallback` | nic | Vue je nepotřebuje |

:::check
Které dvě věci z Reactu nemají ve Vue protějšek, protože je framework nepotřebuje?

### --answer--
`useState` a `useMemo`.

#### --why--
Obojí protějšek má — `ref` a `computed`.

### --correct--
`memo` a `useCallback`.

#### --why--
Obojí v Reactu brání zbytečnému překreslení potomků. Vue překresluje jen místa, která hodnotu čtou, takže není co bránit.

### --answer--
`useContext` a `children`.

#### --why--
`provide`/`inject` a `<slot>` dělají přesně tohle.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Zapomenuté `.value` v JavaScriptu.** Příznak: ve výpočtu vyskočí `NaN`, nebo podmínka platí vždy (`if (kcal)` je pravdivé i pro `ref(0)`, protože objekt je vždy pravdivý). Oprava: mimo šablonu vždy `.value`. V šabloně naopak `.value` nepiš, `{{ kcal.value }}` vypíše prázdno.

> [!PITFALL]
> **Destrukturalizace props.** Příznak: hodnota v komponentě zamrzne na tom, co přišlo poprvé. `const { kcal } = props` vytáhne obyčejné číslo a vazba se ztratí. Oprava: piš `props.kcal`, nebo použij `toRefs(props)`.

> [!PITFALL]
> **`@click="remove(meal.id)"` versus `@click="remove"`.** Obojí je správně, ale znamená něco jiného: první volá funkci s argumentem, druhé jí předá objekt události. Příznak záměny: funkce dostane `PointerEvent` místo id a filtr nic nenajde.

> [!PITFALL]
> **Stav v poli změněný přes index.** `meals.value[0] = novy` funguje, ale `meals.length = 0` v Options API u pole ne vždy. Ve Vue 3 (Proxy) už obojí projde; když narazíš na návod, který tvrdí opak, mluví o Vue 2 s `Vue.set`.

:::check
Uživatel hlásí: „počet porcí se v součtu nikdy nezmění". V kódu je `const { portions } = props`. Co je příčina?

### --expected--
destrukturalizace props ztratila vazbu

### --accept--
destrukturalizace
destrukturalizací se ztratila reaktivita

### --why--
Destrukturalizace vytáhne hodnotu v okamžiku, kdy ji čteš, a dál už jde o obyčejné číslo. Vue nemá co sledovat. Řešením je `props.portions` nebo `toRefs(props)`.
:::

## Kde to najdeš v MDN

MDN popisuje web, ne frameworky, takže samotné Vue najdeš v jeho vlastní dokumentaci na `vuejs.org` (sekce *Guide → Essentials*). V MDN se ti hodí to, na čem Vue stojí:

- [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) — objekt, který zachytává čtení a zápis. Na něm stojí celá reaktivita Vue.
- [Custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) — proč prohlížeč v HTML zmenší jména značek a proč `<meal-row />` nefunguje.
- [HTML attribute reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes) — atributy, které v šabloně píšeš jejich pravými jmény (`class`, `for`, `tabindex`).

# --questions--

## --question--

Komponenta Vue má v `setup` hodnotu `const kcal = ref(0)`. Napiš, jak se na ni odkážeš v šabloně, aby se vypsala.

### --expected--
{{ kcal }}

### --why--
V šabloně Vue ref rozbalí, takže `.value` se nepíše. `{{ kcal.value }}` by vypsalo prázdný řetězec.

### --see--
vue-nuxt-druhy-framework/prevodni-tabulka#stav-usestate-a-ref

## --question--

Přepiš `<button onClick={() => remove(meal.id)}>` z JSX do šablony Vue. Napiš celou počáteční značku i s atributem.

### --expected--
<button @click="remove(meal.id)">

### --accept--
<button v-on:click="remove(meal.id)">

### --why--
`@` je zkratka za `v-on`. Obsah atributu je výraz, takže volání s argumentem se píše rovnou do něj.

### --see--
vue-nuxt-druhy-framework/prevodni-tabulka#sablona-misto-jsx

## --question--

Ve Vue chceš seznam, ve kterém se ukáže jen jídlo nad 400 kcal. Kam patří filtrování?

### --answer--
Na stejný prvek jako `v-for`, pomocí `v-if`.

#### --why--
`v-if` má na jednom prvku přednost před `v-for`, takže proměnná cyklu v něm ještě neexistuje a vykreslení skončí chybou.

### --correct--
Do `computed`, které vrátí už vyfiltrované pole, a `v-for` pak iteruje nad ním.

#### --why--
Filtrovaný seznam je odvozená hodnota. Šablona tak zůstane jednoduchá a filtr se přepočítá jen při změně dat.

### --answer--
Do `watch`, který při každé změně přepíše původní pole.

#### --why--
Sledování by původní data přepisovalo a po první změně bys o nevyfiltrované jídlo přišel.

### --see--
vue-nuxt-druhy-framework/prevodni-tabulka#seznamy-a-podminky

## --question--

**Opakování z dřívějška.** V Reactu máš `const [items, setItems] = useState([])`. Napiš výraz, kterým přidáš `item` tak, jak to React vyžaduje.

### --expected--
setItems([...items, item])

### --accept--
setItems((prev) => [...prev, item])

### --why--
React porovnává stav podle identity, takže potřebuje nové pole. `items.push(item)` by identitu nezměnilo a React by o změně nevěděl. Ve Vue je naopak `items.value.push(item)` v pořádku — rozdíl je v tom, jak se framework o změně dozví.

### --see--
react-zaklady/stav-jako-snimek#pole-a-objekty-ve-stavu

## --question--

**Opakování z dřívějška.** Proč React potřebuje u položek seznamu `key` a proč nestačí index pole?

### --answer--
Kvůli rychlosti: s `key` React seznam vykreslí na jeden průchod.

#### --why--
Rychlost je vedlejší efekt. Hlavní je, co se stane s obsahem položek při přeskupení.

### --correct--
Podle `key` páruje položky mezi vykresleními; index se po vložení nebo smazání posune a stav zůstane u špatné položky.

#### --why--
Klíč musí pocházet z dat, aby položku identifikoval i po změně pořadí. Ve Vue platí u `v-for` totéž.

### --answer--
Protože bez `key` React položky vykreslí v náhodném pořadí.

#### --why--
Pořadí odpovídá poli. Problém není v pořadí vykreslení, ale v párování mezi dvěma vykresleními.

### --see--
react-zaklady/komponenty-a-props#seznam-z-pole-a-key
