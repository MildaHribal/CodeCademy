# Reaktivita ve Vue

Dvě věci na Vue překvapí každého, kdo přichází z Reactu: nikde se nepíše seznam závislostí a nikde se nevolá setter. Obojí má stejnou příčinu — Vue se o změně dozví samo. V téhle lekci se podíváš, jak to dělá, protože všechny typické chyby ve Vue plynou z toho, že se to sledování dá omylem přerušit.

:::check pretest
Vue sleduje, které hodnoty se při vykreslení četly. Co myslíš, že se stane, když hodnotu z reaktivního objektu vytáhneš do obyčejné proměnné a vypisuješ tu proměnnou?

### --answer--
Nic, vazba se přenese i na novou proměnnou.

#### --why--
Do proměnné se zkopíruje hodnota, ne vazba. Jak se vazba drží, uvidíš v části o Proxy.

### --correct--
Vypsaná hodnota zamrzne na tom, co v ní bylo v okamžiku vytažení.

#### --why--
Sledování stojí na čtení vlastnosti objektu. Obyčejné číslo v proměnné už žádné čtení nespustí.

### --answer--
Vue zahlásí chybu, že hodnota není reaktivní.

#### --why--
Vue nemá jak poznat, že jsi chtěl vazbu. Kód proběhne a chyba se projeví až tím, že se UI neaktualizuje.
:::

:::check pretest
Kolikrát podle tebe zavolá Vue funkci `setup()` komponenty, na které uživatel padesátkrát klikne a pokaždé změní stav?

### --expected--
jednou

### --why--
`setup()` běží jednou při vzniku komponenty. Překresluje se jen vykreslovací efekt, ne celá funkce — v tom je největší rozdíl proti Reactu.
:::

## Problém: React překreslí celý komponent

V Reactu znamená změna stavu, že se **funkce komponenty zavolá celá znovu**. Z toho plyne skoro všechno, co se o Reactu učíš: proč se každý render vyrábějí nové funkce, proč existuje `useCallback`, proč `useEffect` potřebuje seznam závislostí a proč musí být stav neměnný.

Vue funguje jinak. Funkce `setup()` proběhne **jednou**, při vzniku komponenty. Vznikne v ní stav, odvozené hodnoty i obsluhy a pak se už jen šablona registruje jako efekt, který ty hodnoty čte. Když se hodnota změní, Vue spustí právě ty efekty, které ji četly — nikoli komponentu.

> [!REMEMBER]
> **Vue nesleduje komponenty, ale hodnoty: při čtení si zapíše, kdo se ptal, a při zápisu ty čtenáře spustí znovu.** Proto se seznam závislostí nikde nepíše a proto se dá reaktivita ztratit jen jedním způsobem — když přestaneš hodnotu číst z jejího zdroje.

:::check
Proč ve Vue neexistuje obdoba `useCallback`?

### --answer--
Protože Vue funkce ukládá do cache samo.

#### --why--
Žádná cache na funkce ve Vue není. Podívej se, kdy vlastně ve Vue funkce vznikají.

### --correct--
Protože `setup()` běží jednou, takže obsluhy nevznikají znovu a není co stabilizovat.

#### --why--
`useCallback` v Reactu řeší, že každý render vyrobí novou funkci. Ve Vue žádný další běh `setup()` není.

### --answer--
Protože Vue funkce v šabloně porovnává podle obsahu, ne podle identity.

#### --why--
Porovnávání funkcí podle obsahu žádný framework nedělá. Odpověď je v tom, kolikrát `setup()` běží.
:::

## `ref` je krabička s `.value`

[[reaktivní ref|Ref]] je objekt s jedinou vlastností `value`. Nic víc. Díky tomu, že hodnota bydlí ve vlastnosti objektu, má Vue co zachytávat: čtení `kcal.value` i zápis do `kcal.value` projde přes kód Vue.

```js
import { ref } from 'vue';

const kcal = ref(530);

console.log(kcal);          // RefImpl { value: 530 } — krabička
console.log(kcal.value);    // 530 — hodnota uvnitř
kcal.value = 680;           // zápis, o kterém se Vue dozví
```

V šabloně se `.value` nepíše: Vue u hodnot vrácených ze `setup()` udělá [[rozbalení refu|rozbalení]] samo. Odtud plyne pravidlo, které si stačí zapamatovat: **`.value` všude v JavaScriptu, nikdy v šabloně.**

:::memory
```js
const kcal = ref(530);
const day = reactive({ name: 'Čtvrtek', kcal: 530 });
kcal.value = 680;
```
--step-- 1 | ref je objekt, hodnota je uvnitř ve vlastnosti value
kcal -> @ref
@ref: RefImpl { value: 530 }
--step-- 2 | reactive nevrací původní objekt, ale Proxy kolem něj
kcal -> @ref
day -> @proxy
@ref: RefImpl { value: 530 }
@proxy: Proxy kolem @raw
@raw: { name: 'Čtvrtek', kcal: 530 }
--step-- 3 | zápis do .value spustí efekty, které hodnotu četly
kcal -> @ref
day -> @proxy
@ref: RefImpl { value: 680 }
@proxy: Proxy kolem @raw
@raw: { name: 'Čtvrtek', kcal: 530 }
:::

Všimni si druhého kroku: `day` neukazuje na původní objekt, ale na jeho obal. Původní objekt existuje dál a zápis do něj (`raw.kcal = 700`) by žádný efekt nespustil, protože by neprošel obalem.

:::check
Co vypíše `console.log(typeof ref(5))`?

### --expected--
object

### --why--
`ref` vrací objekt s vlastností `value`, ne číslo. Proto je `ref(0)` v podmínce vždy pravdivý a proto `ref(5) * 2` dá `NaN`.
:::

## Proxy a sledování závislostí

Obal z předchozí ukázky je [[Proxy]] — objekt JavaScriptu, který umí zachytit každé čtení a každý zápis vlastnosti. Vue v něm dělá dvě věci:

```js
// hodně zjednodušeně to, co Vue dělá uvnitř
new Proxy(target, {
  get(obj, key) {
    track(obj, key);              // 1. zapiš si, který efekt právě čte
    return obj[key];
  },
  set(obj, key, value) {
    obj[key] = value;
    trigger(obj, key);            // 2. spusť efekty, které tuhle vlastnost četly
    return true;
  },
});
```

Tomu se říká [[sledování závislostí]]. Při běhu efektu (vykreslení šablony, `computed`, `watchEffect`) si Vue drží, který efekt je „právě aktivní", a každé čtení reaktivní vlastnosti si k němu poznamená. Seznam závislostí tak vzniká sám a je vždy přesný — včetně větví, které se tentokrát nevykonaly.

> [!TIP]
> Právě proto je na reaktivitě Vue postavená jedna praktická vlastnost: závislost, kterou kód tentokrát nepřečetl, se nesleduje. `computed(() => a.value ? b.value : c.value)` se po změně `c` přepočítá jen tehdy, když `a` bylo nepravdivé.

:::check
Čím Vue pozná, že se má po zápisu do `day.kcal` překreslit zrovna ten odstavec, který hodnotu vypisuje?

### --answer--
Porovná starý a nový virtuální DOM celé komponenty.

#### --why--
Porovnání DOMu se opravdu děje, ale až v rámci toho jednoho efektu. Otázka míří na to, jak Vue vybere, který efekt vůbec spustit.

### --correct--
Při vykreslení si u vlastnosti `kcal` zapsalo, který efekt ji četl, a teď ten efekt spustí.

#### --why--
Zápis projde přes Proxy, ta najde poznámku od čtení a spustí efekty, které u té vlastnosti stojí.

### --answer--
Projde celý strom komponent a hledá, kde se hodnota používá.

#### --why--
Procházet strom by bylo drahé. Vue tu informaci získalo už při čtení.
:::

## `reactive` a proč ztrácí reaktivitu

Druhá cesta k reaktivnímu stavu je [[reactive]]. Hodí se na objekty, se kterými chceš pracovat bez `.value`:

```js
const day = reactive({ kcal: 530, limit: 2000 });

day.kcal += 150;            // žádné .value
```

Má to ale tři omezení, která `ref` nemá: funguje jen na objekty (ne na čísla a řetězce), rozbije se přiřazením celého nového objektu (`day = {…}` vazbu zahodí) a **hodnota vytažená z objektu přestane být reaktivní**.

```js
const { kcal } = reactive({ kcal: 530 });   // kcal je obyčejné číslo
```

Destrukturalizace je čtení vlastnosti. Proběhne jednou, vrátí číslo a tím to končí — další zápisy do objektu se k té proměnné nemají jak dostat. Řešením je `toRefs`, která z každé vlastnosti udělá ref:

```js
const day = reactive({ kcal: 530, limit: 2000 });
const { kcal, limit } = toRefs(day);        // refy, vazba drží

kcal.value += 150;
```

Praktické doporučení, které uvidíš i v dokumentaci Vue: **piš `ref` a `reactive` používej, jen když ti opravdu vadí `.value`.**

:::check
Máš `const nastaveni = reactive({ limit: 2000 })` a chceš si `limit` vytáhnout do vlastní proměnné tak, aby vazba na objekt držela. Napiš celý příkaz.

### --expected--
const { limit } = toRefs(nastaveni)

### --accept--
const limit = toRef(nastaveni, 'limit')

### --why--
`toRefs` udělá z každé vlastnosti ref, takže čtení `limit.value` zase sahá na Proxy a Vue si u něj efekt zapíše. Obyčejná destrukturalizace vrátí číslo, které o objektu nic neví.
:::

:::live vue predict
```html
<div id="app" class="box">
  <p>Snědeno: {{ kcal }} kcal</p>
  <button @click="add">Přidej 100</button>
</div>
```
```css
.box { font-family: system-ui, sans-serif; color: #1e293b; }
button { margin-top: 0.5rem; padding: 0.4rem 0.8rem; border: 0; border-radius: 0.4rem; background: #0d9488; color: #fff; font: inherit; cursor: pointer; }
```
```js
import { createApp, reactive } from 'vue';

createApp({
  setup() {
    const day = reactive({ kcal: 530 });
    const { kcal } = day;
    const add = () => {
      day.kcal += 100;
    };
    return { kcal, add };
  },
}).mount('#app');
```
--question-- Co se stane s číslem na stránce po třech kliknutích na tlačítko?
--option-- Vyroste na 830, protože `day.kcal` se opravdu mění.
--option*-- Zůstane 530, protože šablona vypisuje obyčejné číslo vytažené destrukturalizací.
--option-- Zůstane 530 po prvním kliknutí a pak už se mění, protože se vazba obnoví.
--why-- `const { kcal } = day` přečte vlastnost jednou a vrátí číslo 530. Objekt `day` se opravdu mění, ale šablona žádnou jeho vlastnost nečte, takže nemá co sledovat. Oprava: vrátit ze `setup()` celý `day` a v šabloně psát `{{ day.kcal }}`, nebo použít `toRefs`.
:::

:::explain
Vysvětli vlastními slovy, proč destrukturalizace reaktivního objektu přeruší sledování, ale zápis `day.kcal` v šabloně ne.

## --model--
Vue sleduje čtení vlastností na Proxy. Destrukturalizace je jednorázové čtení: vrátí hodnotu, která už s objektem nemá nic společného, a další zápisy se k ní nemají jak dostat. Když šablona píše `day.kcal`, čte vlastnost při každém vykreslení, takže si u ní Vue efekt zapíše a po zápisu ho spustí znovu.

## --checklist--
- Sledování vzniká při čtení vlastnosti na Proxy.
- Destrukturalizace přečte hodnotu jednou a dál drží kopii.
- Šablona čte vlastnost znovu při každém vykreslení, proto vazba drží.
- Opravou je nechat čtení v šabloně, nebo z vlastností udělat refy přes `toRefs`.
:::

## `computed` se počítá, jen když je potřeba

[[computed]] je efekt, který vrací hodnotu a drží si ji v cache. Přepočítá se, až když se změní některá závislost, kterou si sám zapamatoval — a i pak teprve ve chvíli, kdy si o hodnotu někdo řekne.

```js
const total = computed(() => meals.value.reduce((sum, meal) => sum + meal.kcal, 0));
```

Proti `useMemo` z Reactu má dva rozdíly, které v praxi cítíš: nepíše se seznam závislostí a výsledek se opravdu ukládá (React smí cache `useMemo` kdykoli zahodit). Getter proto musí být **čistý** — nic v něm neměň a nic z něj neposílej ven, jinak si nikdy nebudeš jistý, kolikrát se to stalo.

`computed` umí i zápis, když mu dáš `get` a `set`. Hodí se to na hodnotu, kterou chceš navázat přes `v-model`:

```js
const kcalText = computed({
  get: () => `${total.value} kcal`,
  set: (text) => { total.value = Number.parseInt(text, 10); },
});
```

:::live vue
```html
<div id="app" class="box">
  <p>Snědeno: {{ kcal }} kcal · zbývá {{ remaining }}</p>
  <p :class="{ over: isOver }">{{ isOver ? 'Limit překročen' : 'Zatím v limitu' }}</p>
  <button @click="kcal += 150">Svačina (+150)</button>
  <button @click="limit += 200">Zvednout limit</button>
</div>
```
```css
.box { max-width: 24rem; font-family: system-ui, sans-serif; color: #1e293b; }
.over { color: #b91c1c; font-weight: 600; }
button { margin: 0.5rem 0.5rem 0 0; padding: 0.4rem 0.8rem; border: 0; border-radius: 0.4rem; background: #0d9488; color: #fff; font: inherit; cursor: pointer; }
button:hover { background: #0f766e; }
```
```js
import { createApp, ref, computed } from 'vue';

createApp({
  setup() {
    const kcal = ref(1850);
    const limit = ref(2000);
    const remaining = computed(() => Math.max(limit.value - kcal.value, 0));
    const isOver = computed(() => kcal.value > limit.value);
    return { kcal, limit, remaining, isOver };
  },
}).mount('#app');
```
:::

Zkus klikat na obě tlačítka a sleduj, že se obě odvozené hodnoty přepočítají samy, ačkoli jsi nikde nenapsal, na čem závisejí. Pak zkus do `remaining` přidat `console.log` a uvidíš, že se getter nespustí, když klikneš na tlačítko, které mění hodnotu, kterou `remaining` nečte.

:::check
Čím se `computed` liší od obyčejné funkce `() => limit.value - kcal.value` zavolané v šabloně?

### --answer--
Funkce v šabloně nefunguje, Vue v ní volání nepovoluje.

#### --why--
Volat funkci v šabloně se smí a je to běžné. Rozdíl je v tom, co se stane při opakovaném čtení.

### --correct--
`computed` si výsledek drží v cache a přepočítá ho jen při změně závislosti, funkce se vyhodnotí při každém vykreslení.

#### --why--
U levného výpočtu je to jedno, u filtrování a řazení tisíce položek je to rozdíl mezi plynulým a trhaným UI.

### --answer--
`computed` se přepočítá v každém případě, jen asynchronně.

#### --why--
Přepočet je líný: nastane až ve chvíli, kdy si někdo o hodnotu řekne, a jen pokud se závislost změnila.
:::

## `watch` a `watchEffect` proti `useEffect`

Na vedlejší efekty — uložení do `localStorage`, načtení dat, zápis do konzole — má Vue dvě funkce.

[[watch]] sleduje konkrétní zdroj a dostane starou i novou hodnotu:

```js
watch(query, (next, prev) => {
  console.log(`hledání se změnilo z ${prev} na ${next}`);
});

watch([kcal, limit], ([newKcal]) => { /* víc zdrojů naráz */ });
watch(day, () => { /* reactive objekt se sleduje do hloubky */ });
watch(() => day.kcal, () => { /* jedna vlastnost: přes funkci */ });
```

[[watchEffect]] se spustí hned a závislosti si zjistí sám tím, co při běhu přečte:

```js
watchEffect(() => {
  localStorage.setItem('kcal', String(kcal.value));
});
```

Proti `useEffect` jsou tu tři rozdíly. Za prvé nikde nepíšeš seznam závislostí. Za druhé `watch` se ve výchozím nastavení **nespustí hned** po vzniku komponenty (to zapíná `{ immediate: true }`), zatímco `useEffect` vždy jednou proběhne. Za třetí úklid nevracíš z funkce, ale zapisuješ ho přes `onCleanup`:

```js
watch(query, (next, prev, onCleanup) => {
  const controller = new AbortController();
  onCleanup(() => controller.abort());
  fetch(`/api/hledej?q=${next}`, { signal: controller.signal });
});
```

> [!PITFALL]
> `watch` není nástroj na odvozování dat. Když v něm počítáš hodnotu a zapisuješ ji do dalšího stavu (`watch(meals, () => { total.value = … })`), vyrobil jsi dva zdroje pravdy, které se rozjedou. Příznak: hodnota je o jeden krok pozadu. Odvozená hodnota patří do `computed`, `watch` do vedlejších efektů.

:::check
Máš `const meals = ref([])` a chceš po každé změně seznamu uložit jeho JSON do `localStorage`. Napiš jméno funkce Vue, která se na to hodí a nepotřebuje seznam závislostí ani `immediate`.

### --expected--
watchEffect

### --why--
`watchEffect` se spustí hned a závislosti si zapamatuje z toho, co přečetl. `watch(meals, …)` by fungoval taky, ale první uložení by přišlo až po první změně.
:::

## Kdy se DOM skutečně změní: `nextTick`

Zápis do reaktivní hodnoty DOM nezmění okamžitě. Vue vykreslovací efekty naplánuje do fronty a zpracuje je v mikroúloze, takže pět zápisů za sebou vyvolá jedno překreslení. Dokud fronta nedoběhne, čteš ze stránky ještě starý obsah:

```js
meals.value.push({ id: 7, name: 'Jablko', kcal: 95 });
console.log(list.value.children.length);   // ještě starý počet

await nextTick();
console.log(list.value.children.length);   // už nový
```

[[nextTick]] vrátí Promise splněnou po překreslení. Potřebuješ ji vždycky, když chceš po změně stavu sáhnout na skutečný DOM — odscrollovat na novou položku, změřit výšku, dát fokus nově zobrazenému poli.

> [!NOTE]
> V Reactu tohle řeší `useEffect`, který běží po commitu. Ve Vue je na měření DOMu `nextTick` nebo hák `onUpdated`.

:::check
Po přidání položky do seznamu chceš nové pole odscrollovat do viditelné části. Co musíš udělat, než změříš jeho pozici?

### --expected--
await nextTick()

### --accept--
nextTick
počkat na nextTick

### --why--
Překreslení je naplánované do mikroúlohy. Bez čekání bys měřil stav stránky před vložením položky.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Podmínka nad refem.** `if (kcal) { … }` je pravdivá vždycky, i pro `ref(0)`, protože objekt je vždy pravdivá hodnota. Příznak: větev, která se nikdy nevynechá. Oprava: `if (kcal.value)`.

> [!PITFALL]
> **Ref přiřazený místo `.value`.** `kcal = ref(700)` u `const` spadne, u `let` ticho přepíše proměnnou novou krabičkou — a šablona dál drží tu starou. Příznak: hodnota se v UI nemění, ačkoli v konzoli vychází správně. Oprava: `kcal.value = 700`.

> [!PITFALL]
> **Nový objekt místo zápisu do `reactive`.** `day = reactive({ … })` nebo `Object.assign(day, …)` — první vazbu zahodí, druhý ne. Příznak: po „resetu" formuláře přestane všechno reagovat. Oprava: měnit vlastnosti, nebo držet objekt v `ref` a přepisovat `day.value`.

> [!PITFALL]
> **Vedlejší efekt v `computed`.** Getter, který zapisuje do jiného stavu nebo volá API, se spustí nepředvídatelně často (a s cache někdy vůbec). Příznak: požadavek odejde dvakrát, nebo naopak nikdy. Oprava: `watch` nebo `watchEffect`.

> [!PITFALL]
> **Sledování nové hodnoty pole při mutaci.** `watch(meals, (next, prev) => …)` u `ref` s polem dostane v `next` i `prev` **tentýž** objekt, protože jsi pole změnil na místě. Příznak: porovnání staré a nové hodnoty nikdy nenajde rozdíl. Oprava: sleduj kopii (`() => [...meals.value]`), nebo porovnávej jinak.

:::check
Kolega píše: „Změnil jsem `let kcal = ref(0)` na `kcal = ref(700)` a číslo se v UI nezměnilo." Co se stalo?

### --expected--
vyrobil novou krabičku a šablona drží tu starou

### --accept--
přiřadil nový ref místo zápisu do value
šablona sleduje původní ref

### --why--
Šablona si při vykreslení zapamatovala konkrétní ref. Nové přiřazení proměnné vyrobí jiný objekt, o kterém šablona nic neví. Zapisovat se musí do `.value`.
:::

## Kde to najdeš v MDN

Reaktivita Vue stojí na standardních věcech z JavaScriptu, které MDN popisuje do detailu:

- [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) — pasti `get` a `set`, na kterých stojí `reactive` i `ref`.
- [Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect) — funkce, kterými Proxy předává operaci původnímu objektu.
- [Microtask guide](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) — fronta mikroúloh, ve které Vue zpracuje naplánovaná překreslení. Odtud je `nextTick`.
- [Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) — proč je destrukturalizace obyčejné čtení vlastnosti.

# --questions--

## --question--

Napiš, co vypíše `console.log(kcal)` pro `const kcal = ref(530)` — ne to, co je uvnitř, ale co je to za hodnotu.

### --expected--
objekt s vlastností value

### --accept--
ref objekt
krabička s value
RefImpl { value: 530 }

### --why--
Právě proto je `ref(0)` v podmínce pravdivý a `ref(5) * 2` je `NaN`. Uvnitř JavaScriptu potřebuješ `.value`.

### --see--
vue-nuxt-druhy-framework/reaktivita-vue#ref-je-krabicka-s-value

## --question--

Ve které z těchhle situací se `computed` po změně `limit` **ne**přepočítá?

### --answer--
Když `computed` čte `limit.value` v obou větvích podmínky.

#### --why--
Přečtená hodnota se sleduje vždy, bez ohledu na to, kolikrát se v kódu objeví.

### --correct--
Když `computed` při posledním výpočtu do větve s `limit.value` vůbec nevstoupilo.

#### --why--
Závislosti vznikají z toho, co kód skutečně přečetl. Nepřečtená větev se nesleduje.

### --answer--
Když se `limit` změní vícekrát za sebou v jedné funkci.

#### --why--
Změny se slučují do jednoho překreslení, ale přepočítat se hodnota stejně musí.

### --see--
vue-nuxt-druhy-framework/reaktivita-vue#proxy-a-sledovani-zavislosti

## --question--

Máš `const day = reactive({ kcal: 530 })` a chceš vlastnosti rozdělit do samostatných proměnných tak, aby zůstaly reaktivní. Napiš jméno funkce, kterou na to použiješ.

### --expected--
toRefs

### --why--
`toRefs` udělá z každé vlastnosti ref, takže čtení `kcal.value` pořád prochází přes Proxy původního objektu. Obyčejná destrukturalizace vazbu zahodí.

### --see--
vue-nuxt-druhy-framework/reaktivita-vue#reactive-a-proc-ztraci-reaktivitu

## --question--

**Opakování z dřívějška.** Proč `useEffect` v Reactu potřebuje seznam závislostí a co se stane, když do něj zapomeneš přidat hodnotu, kterou efekt čte?

### --answer--
Efekt se nespustí vůbec, protože React nedokáže určit, kdy má běžet.

#### --why--
Efekt se spustí, jen ne tehdy, kdy bys čekal. Zamysli se, jakou hodnotu uvnitř uvidí.

### --correct--
React sám nepozná, co efekt čte; s neúplným seznamem efekt pracuje se zastaralými hodnotami z dřívějšího renderu.

#### --why--
Funkce efektu si zapamatovala proměnné z renderu, ve kterém vznikla. Ve Vue tenhle problém nevzniká, protože závislosti si framework zjistí z běhu sám.

### --answer--
Seznam je jen optimalizace, chování se bez něj nemění.

#### --why--
Bez seznamu by efekt běžel po každém renderu, s neúplným seznamem zase drží staré hodnoty. Obojí je změna chování.

### --see--
react-hloubka/useeffect-spravne#zavislosti-uplny-seznam-nebo-zastarala-closure

## --question--

**Opakování z dřívějška.** Proč `{ kcal: 530 } === { kcal: 530 }` vrátí `false`, a co z toho plyne pro reaktivní objekt obalený Proxy?

### --expected--
porovnává se identita, ne obsah

### --accept--
jsou to dva různé objekty
=== porovnává odkaz

### --why--
`===` se u objektů ptá na identitu. Proto `reactive(obj) === obj` je `false` — Proxy je jiný objekt než původní data. Když si někde uložíš původní objekt a zapisuješ do něj, Vue se o zápisu nedozví.

### --see--
js-objekty/reference-a-mutace#porovnani-se-pta-na-identitu
