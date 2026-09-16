## --card-- output

Co uvidí uživatel na stránce?

```jsx
export default function Score() {
  return <p>{[1, 2, 3]}</p>;
}
```

### --expected--

123

### --why--

Pole ve složených závorkách React vykreslí položku po položce, bez čárek a bez mezer. Oddělovače si musíš přidat sám.

### --see--

react-zaklady/proc-react#co-se-z-vykresli-a-co-ne

## --card-- output

`tasks` je prázdné pole. Co se objeví na stránce?

```jsx
export default function Inbox({ tasks }) {
  return <div>{tasks.length && <p>Nevyřízeno: {tasks.length}</p>}</div>;
}
```

### --expected--

0

### --why--

`0 && cokoli` je `0` a nula není `false` ani `null`, takže ji React vykreslí jako text. Podmínku piš `tasks.length > 0 && …`.

### --see--

react-zaklady/komponenty-a-props#podminene-vykresleni

## --card-- output

`price` je `0`. Co se vykreslí?

```jsx
export default function Price({ price }) {
  return <p>{price || 'Zdarma'}</p>;
}
```

### --expected--

Zdarma

### --why--

Nula je nepravdivá hodnota, takže `||` sáhne po záložní větvi — i když je nula legitimní cena. Když chceš zaskočit jen `null` a `undefined`, použij `??`.

### --see--

react-zaklady/komponenty-a-props#podminene-vykresleni

## --card-- output

`user` je `{ name: null }`. Co se vykreslí?

```jsx
export default function Greeting({ user }) {
  return <p>Vítej, {user.name ?? 'hoste'}</p>;
}
```

### --expected--

Vítej, hoste

### --why--

`??` nahradí jen `null` a `undefined`. Prázdný řetězec nebo nula by prošly a vykreslily by se.

### --see--

react-zaklady/komponenty-a-props#podminene-vykresleni

## --card-- output

Komponenta se použije jako `<Badge />`, bez jediného atributu. Co se vykreslí?

```jsx
export default function Badge({ text = 'Novinka', count = 0 }) {
  return <span>{text} {count}</span>;
}
```

### --expected--

Novinka 0

### --why--

Výchozí hodnota v destrukturalizaci se použije, když prop chybí nebo je `undefined`. Nula se jako výchozí hodnota chová normálně — `count` se vykreslí, protože je součástí textu, ne podmínky.

### --see--

react-zaklady/komponenty-a-props#destrukturalizace-a-vychozi-hodnoty

## --card-- output

`count` je `0`. Co se vypíše do konzole při prvním kliknutí?

```jsx
function handleClick() {
  setCount(count + 5);
  console.log(count);
}
```

### --expected--

0

### --why--

`count` je konstanta uvnitř jednoho renderu. `setCount` naplánuje další render, ale hodnotu v běžící obsluze nepřepíše.

### --see--

react-zaklady/stav-jako-snimek#stav-je-snimek-renderu

## --card-- output

`count` je `5`. Jaká hodnota bude v `count` po jednom kliknutí?

```jsx
function handleClick() {
  setCount((current) => current + 1);
  setCount((current) => current + 1);
}
```

### --expected--

7

### --why--

Funkce aktualizace dostane hodnotu, kterou vrátila předchozí funkce ve frontě: `5 → 6 → 7`. Kdyby tam bylo `setCount(count + 1)`, skončilo by to na šestce.

### --see--

react-zaklady/stav-jako-snimek#funkce-aktualizace

## --card-- output

Co vypíše tenhle kód?

```js
const items = [{ id: 1, done: false }];
const next = items.map((item) => (item.id === 1 ? { ...item, done: true } : item));
console.log(items[0].done, next[0].done, next === items);
```

### --expected--

false true false

### --why--

`map` vrací nové pole a v něm nový objekt s přepsanou vlastností. Původní pole i původní objekt zůstaly nedotčené — přesně to React potřebuje, aby změnu poznal.

### --see--

react-zaklady/stav-jako-snimek#pole-a-objekty-ve-stavu

## --card-- output

Co vypíše tenhle kód?

```js
const form = { name: 'Adéla', city: 'Brno' };
const next = { ...form, city: 'Plzeň' };
console.log(form.city, next.city, form === next);
```

### --expected--

Brno Plzeň false

### --why--

Rozbalení do nového objektu zkopíruje vlastnosti a ta poslední přepíše původní. Vznikne nová reference, takže `form === next` je `false`.

### --see--

react-zaklady/stav-jako-snimek#pole-a-objekty-ve-stavu

## --card-- output

Fronta funkcí aktualizace se dá napodobit i bez Reactu. Co vypíše tenhle kód?

```js
const queue = [(current) => current + 1, (current) => current * 2, (current) => current + 1];
console.log(queue.reduce((current, update) => update(current), 3));
```

### --expected--

9

### --why--

Přesně takhle React zpracuje frontu: vezme poslední stav a pustí přes něj jednu funkci za druhou (`3 → 4 → 8 → 9`). Proto na sebe funkce aktualizace v jedné obsluze navazují.

### --see--

react-zaklady/stav-jako-snimek#funkce-aktualizace

## --card-- code js

Napiš funkci `toggleDone(tasks, id)`, která vrátí **nové** pole úkolů, kde má úkol s daným `id` obrácenou hodnotu `done`. Původní pole ani jeho objekty nesmí změnit.

### --seed--

```js
function toggleDone(tasks, id) {
}
```

### --test--

```js
const tasks = [
  { id: 'a', title: 'Zalít kytky', done: false },
  { id: 'b', title: 'Vynést koš', done: true },
];
const next = toggleDone(tasks, 'a');
assert.equal(next[0].done, true, "toggleDone(tasks, 'a') má u úkolu 'a' obrátit done na true");
assert.equal(next[1].done, true, "toggleDone(tasks, 'a') nemá sahat na ostatní úkoly");
assert.equal(tasks[0].done, false, 'toggleDone nesmí změnit původní objekt úkolu');
assert.notEqual(next, tasks, 'toggleDone má vrátit nové pole, ne původní');
assert.equal(next[1], tasks[1], 'nezměněné úkoly můžou zůstat tytéž objekty');
```

### --solution--

```js
function toggleDone(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}
```

### --why--

React porovnává reference. Kdybys zapsal `task.done = !task.done`, zůstalo by pole i objekt stejné a překreslení by nepřišlo.

### --see--

react-zaklady/stav-jako-snimek#pole-a-objekty-ve-stavu

## --card-- code js

Napiš funkci `removeById(items, id)`, která vrátí nové pole bez položky s daným `id`. Když tam taková není, vrátí kopii se vším.

### --seed--

```js
function removeById(items, id) {
}
```

### --test--

```js
const items = [{ id: 1, name: 'Káva' }, { id: 2, name: 'Čaj' }];
assert.deepEqual(removeById(items, 1), [{ id: 2, name: 'Čaj' }], 'removeById(items, 1) má vrátit pole jen s čajem');
assert.deepEqual(removeById(items, 9), items, 'removeById(items, 9) má vrátit všechny položky');
assert.notEqual(removeById(items, 9), items, 'removeById má vždy vrátit nové pole');
assert.equal(items.length, 2, 'removeById nesmí mazat z původního pole');
```

### --solution--

```js
function removeById(items, id) {
  return items.filter((item) => item.id !== id);
}
```

### --why--

`filter` vrací nové pole i tehdy, když nic nevyfiltruje. `splice` by naopak mazal z původního pole a React by změnu neviděl.

### --see--

react-zaklady/stav-jako-snimek#pole-a-objekty-ve-stavu

## --card-- code js

Napiš funkci `setField(form, key, value)`, která vrátí nový objekt formuláře s přepsanou jednou vlastností. Původní objekt nechá být.

### --seed--

```js
function setField(form, key, value) {
}
```

### --test--

```js
const form = { name: 'Adéla', email: '', newsletter: false };
const next = setField(form, 'email', 'adela@example.cz');
assert.equal(next.email, 'adela@example.cz', "setField(form, 'email', …) má nastavit email");
assert.equal(next.name, 'Adéla', 'setField má ostatní vlastnosti zachovat');
assert.equal(form.email, '', 'setField nesmí změnit původní objekt');
assert.equal(setField(form, 'newsletter', true).newsletter, true, "setField(form, 'newsletter', true) má nastavit true");
```

### --solution--

```js
function setField(form, key, value) {
  return { ...form, [key]: value };
}
```

### --why--

Tenhle jednořádkový vzor obsluhuje celý formulář: `setForm(setField(form, event.target.name, event.target.value))`. Klíč v hranatých závorkách se dosadí za běhu.

### --see--

react-zaklady/udalosti-a-formulare#rizene-pole

## --card-- code js

Napiš funkci `score(answers, questions)`, která spočítá, kolik odpovědí sedí. `answers` je pole vybraných indexů (pozice odpovídají otázkám), otázka má `correctIndex`.

### --seed--

```js
function score(answers, questions) {
}
```

### --test--

```js
const questions = [{ correctIndex: 1 }, { correctIndex: 0 }, { correctIndex: 2 }];
assert.equal(score([1, 0, 2], questions), 3, 'score([1, 0, 2], …) má vrátit 3 — všechny odpovědi sedí');
assert.equal(score([1, 1, 1], questions), 1, 'score([1, 1, 1], …) má vrátit 1 — sedí jen první odpověď');
assert.equal(score([], questions), 0, 'score([], …) má vrátit 0');
assert.equal(score([0, 0, 0], questions), 1, 'score([0, 0, 0], …) má vrátit 1 — sedí jen druhá odpověď');
```

### --solution--

```js
function score(answers, questions) {
  return answers.filter((answer, index) => answer === questions[index].correctIndex).length;
}
```

### --why--

Skóre je odvozená hodnota: dá se kdykoli dopočítat z uložených odpovědí, takže do stavu nepatří.

### --see--

react-zaklady/stav-jako-snimek#odvozena-hodnota-misto-stavu

## --card-- code js

Napiš funkci `visible(items, filter)`, která vrátí položky odpovídající filtru. Filtr `'vse'` propustí všechno, jinak se porovnává s vlastností `type`.

### --seed--

```js
function visible(items, filter) {
}
```

### --test--

```js
const items = [
  { id: 1, type: 'snidane' },
  { id: 2, type: 'obed' },
  { id: 3, type: 'snidane' },
];
assert.deepEqual(visible(items, 'vse').map((item) => item.id), [1, 2, 3], "visible(items, 'vse') má vrátit všechny položky");
assert.deepEqual(visible(items, 'snidane').map((item) => item.id), [1, 3], "visible(items, 'snidane') má vrátit položky 1 a 3");
assert.deepEqual(visible(items, 'vecere'), [], "visible(items, 'vecere') má vrátit prázdné pole");
assert.equal(items.length, 3, 'visible nesmí sahat na původní pole');
```

### --solution--

```js
function visible(items, filter) {
  return filter === 'vse' ? items : items.filter((item) => item.type === filter);
}
```

### --why--

Filtrovaný seznam je odvozená hodnota. Kdybys ho držel v druhém `useState`, rozešel by se s původním polem hned, jak by do něj něco přibylo.

### --see--

react-zaklady/stav-jako-snimek#odvozena-hodnota-misto-stavu

## --card-- free

Co znamená, že stav je snímek renderu? Řekni to tak, jak bys to řekl u pohovoru.

### --back--

Každý render je jedno zavolání komponenty a hodnoty stavu i props v něm platí jako konstanty. Obsluha události, která v tom renderu vznikla, si tyhle hodnoty nese s sebou — i když se mezitím stav změní, ona pořád vidí ty své. `setState` proto nic nepřepisuje: říká Reactu, s jakou hodnotou má komponentu zavolat příště. Praktický dopad: `setCount(count + 1)` třikrát za sebou přidá jedničku, protože všechna tři volání čtou tutéž hodnotu. Když má změna navazovat na předchozí, musí se zapsat jako funkce aktualizace.

### --see--

react-zaklady/stav-jako-snimek#stav-je-snimek-renderu

## --card-- free

Jaký je rozdíl mezi props a stavem? Podle čeho poznáš, co z toho použít?

### --back--

Props jsou vstup od rodiče — komponenta je dostane a nesmí je měnit. Stav je paměť komponenty mezi rendery, kterou vlastní ona sama a mění ji přes set funkci. Zeptej se, kdo je vlastníkem dat: když hodnotu určuje někdo nad tebou, je to prop; když vzniká uvnitř interakcí s touhle komponentou, je to stav. Když ji potřebuje víc komponent, patří do jejich společného rodiče a dolů teče jako props.

### --see--

react-zaklady/komponenty-a-props#props-jsou-parametry-komponenty

## --card-- free

K čemu React používá `key` a proč nemá být `key` index pole?

### --back--

Podle `key` React mezi dvěma rendery spáruje položky starého a nového seznamu — pozná, která přibyla, která zmizela a která se jen přesunula. Index je pozice, ne identita: když se položka smaže nebo se pořadí zamíchá, dostane sousední položka cizí index a React jí podstrčí cizí DOM prvek i jeho stav (rozepsaný `<input>`, animaci, zaměření). Stabilní `key` je `id` z dat. Index projde jen u seznamu, který se nikdy nemění.

### --see--

react-zaklady/komponenty-a-props#seznam-z-pole-a-key

## --card-- free

Co je řízené formulářové pole a co na něm React získá?

### --back--

Řízené pole bere `value` ze stavu a každou změnu posílá přes `onChange` zpátky do stavu. Stav je pak jediný zdroj pravdy o obsahu pole: dá se z něj hodnota předvyplnit, ověřit při psaní, normalizovat (oříznout mezery, převést na velká písmena) nebo podle ní zakázat tlačítko. Neřízené pole si hodnotu drží samo v DOM a komponenta o ní neví, dokud se pro ni nesáhne.

### --see--

react-zaklady/udalosti-a-formulare#rizene-pole

## --card-- free

Co je zvednutí stavu a podle čeho poznáš, že je na čase ho udělat?

### --back--

Zvednutí stavu je přesun stavu z komponenty do jejího nejbližšího společného rodiče s těmi komponentami, které tu hodnotu taky potřebují. Rodič ji posílá dolů v props spolu s funkcí, kterou ji potomek změní. Poznáš to podle toho, že dvě komponenty musí ukazovat totéž, nebo že jedna potřebuje reagovat na to, co se stalo v druhé — typicky filtr a seznam, formulář a náhled. Alternativa (držet dvě kopie a synchronizovat je) se rozejde při první chybě.

### --see--

react-zaklady/udalosti-a-formulare#zvednuti-stavu

## --card-- free

Proč se odvozená hodnota nemá ukládat do stavu?

### --back--

Odvozená hodnota je něco, co se dá při každém renderu spočítat z jiného stavu nebo props — součet, filtrovaný seznam, počet hotových úkolů, „je to poslední otázka". Když ji uložíš do vlastního `useState`, vznikne druhý zdroj pravdy, který se musí ručně udržovat v souladu s prvním; první zapomenutá aktualizace ho rozejde a v UI se objeví stará čísla. Počítej ji rovnou v těle komponenty, je to jen obyčejná proměnná.

### --see--

react-zaklady/stav-jako-snimek#odvozena-hodnota-misto-stavu

## --card-- free

Co se stane mezi tím, než zavoláš set funkci, a tím, než se změna objeví na obrazovce?

### --back--

Set funkce zapíše změnu do fronty a obsluha doběhne do konce. Pak React všechny změny z téhle obsluhy zpracuje najednou (dávkování) a znovu zavolá komponentu — to je render, který sám o sobě nic v DOM nemění, jen vrátí popis stránky. React tenhle popis porovná s předchozím a v commitu zapíše do DOM jen rozdíly. Proto je čtení `document.querySelector` hned po kliknutí v testu ještě zbytečné a proto tři změny v jedné obsluze nedají tři překreslení.

### --see--

react-zaklady/proc-react#jak-react-vykresli-stranku

## --card-- free

Kdy set funkci předáš hodnotu a kdy funkci?

### --back--

Hodnotu tehdy, když nová hodnota nezávisí na té předchozí (`setFilter('obed')`, `setPicked(null)`). Funkci tehdy, když nová hodnota navazuje na aktuální stav a v téže obsluze se mění víckrát, nebo když změna vzniká se zpožděním (v `setTimeout`, po odpovědi ze serveru) a stav se mezitím mohl posunout. Funkce aktualizace dostane poslední hodnotu ve frontě, ne tu ze snímku renderu.

### --see--

react-zaklady/stav-jako-snimek#funkce-aktualizace

## --card-- free

Proč komponenta nesmí přepsat hodnotu, kterou dostala v props?

### --back--

Props patří rodiči — ten je při svém příštím renderu pošle znovu podle svého stavu, takže by se zápis stejně přepsal. React navíc počítá s tím, že komponenta je při stejných vstupech předvídatelná; zápis do props z ní dělá funkci s vedlejším efektem a to, co komponenta ukazuje, se rozchází s tím, co si rodič myslí. Když hodnota má jít změnit, musí ji měnit vlastník: rodič pošle dolů i funkci, která to udělá.

### --see--

react-zaklady/komponenty-a-props#props-se-neprepisuji

## --card-- free

Čím se deklarativní UI liší od ruční práce s DOM a co tím získáš?

### --back--

Ručně popisuješ kroky: najdi prvek, přepiš text, přidej třídu, smaž řádek — a musíš ošetřit každý přechod mezi stavy zvlášť. V Reactu popíšeš jen cílový tvar: z dat spočítáš, jak má stránka vypadat, a rozdíly proti předchozímu tvaru dopočítá React. Ubude tím celá třída chyb, kdy se jedna část stránky aktualizuje a druhá se zapomene, a kód se čte jako „takhle to vypadá, když…" místo „takhle se to překlikalo sem".

### --see--

react-zaklady/proc-react#problem-seznam-ktery-musis-prepsat-rucne
