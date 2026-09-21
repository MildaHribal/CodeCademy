# SFC, Pinia a Vue Router

Otevřeš cizí projekt ve Vue a ve složce `components/` najdeš soubory `KnihaRadek.vue`. V jednom souboru je šablona, logika i styly té jedné věci. V téhle lekci se naučíš takový soubor číst a psát, sdílet stav mezi obrazovkami přes Pinii a rozřezat aplikaci na routy — tedy tu část Vue, kterou v Reactu obstarávají tři různé knihovny.

:::check pretest
V Reactu vykreslí komponenta `Karta` to, co dostane v `children`. Jak se ta samá věc jmenuje ve Vue? Napiš jedno slovo.

### --expected--
slot

### --accept--
slotem
sloty

### --why--
Vue tomu říká slot. Proti `children` má navíc jména, takže komponenta může mít víc otvorů a ví, který obsah patří do kterého.
:::

:::check pretest
Soubor `.vue` obsahuje značky `<template>`, `<script setup>` a `<style>`. Co se s ním musí stát, než ho prohlížeč zobrazí?

### --answer--
Nic, stačí ho připojit přes `<script type="module" src="Karta.vue">`.

#### --why--
Prohlížeč umí spustit jen HTML, CSS a JavaScript. Přípona `.vue` mezi ně nepatří, takže `<script>` s ní skončí chybou typu MIME.

### --correct--
Musí ho přeložit sestavovací nástroj (Vite s pluginem pro Vue) na obyčejný JavaScript.

#### --why--
Plugin ze souboru vyrobí objekt komponenty s vykreslovací funkcí a styly vloží jako CSS. Prohlížeč pak dostane jen JS a CSS.

### --answer--
Musí se šablona ručně zkopírovat do `index.html`.

#### --why--
To by znamenalo udržovat každou komponentu na dvou místech. Právě tomu se formát `.vue` vyhýbá.
:::

## Problém: tři soubory na jednu komponentu

Bez sestavování vypadá jedna komponenta ve Vue takhle: `<template id="kniha-radek">` v HTML, objekt s `props` a `setup` v JavaScriptu a pravidla pro `.row` někde ve sdíleném stylopisu. Když ji chceš přejmenovat nebo smazat, obejdeš tři soubory a stejně ti v CSS zůstane osiřelé pravidlo.

React to řeší tím, že značkování nacpe do JavaScriptu (JSX) a styly do knihovny (CSS Modules, Tailwind, styled-components). Vue zvolilo opačný směr: nechat všechny tři jazyky být sebou samými a dát je do jednoho souboru.

> [!REMEMBER]
> **Jeden soubor `.vue` = jedna komponenta: značkování, logika a styly na jednom místě, ale každé ve svém jazyce.** Prohlížeč takový soubor neumí, překládá ho Vite při sestavení.

:::check
Proč se pravidla CSS jedné komponenty špatně mažou, když leží ve sdíleném stylopisu? Odpověz jednou větou.

### --expected--
Protože nevíš, jestli je nepoužívá ještě někdo jiný.

### --accept--
Nikdo neví, jestli selektor nepoužívá jiná část aplikace, tak se pravidlo radši nechá.
Chybí vazba mezi pravidlem a komponentou, takže se mrtvé pravidlo nepozná.

### --why--
Mrtvé CSS vzniká přesně tímhle: selektor `.row` může používat kdokoli, a tak ho nikdo nesmaže. Soubor `.vue` se [[scoped styly|scoped styly]] tuhle nejistotu ruší — pravidlo platí jen pro tuhle komponentu, a když komponenta zmizí, zmizí s ní.
:::

## Jednosouborová komponenta

[[jednosouborová komponenta|Jednosouborová komponenta]] (*single-file component*, zkratkou SFC) je soubor `.vue` se třemi bloky nejvyšší úrovně:

```vue
<script setup>
import { computed } from 'vue';

const props = defineProps({
  kniha: { type: Object, required: true },
});
const emit = defineEmits(['precteno']);

const popisek = computed(() => `${props.kniha.stran} stran`);
</script>

<template>
  <li class="row" :class="{ 'row--done': kniha.precteno }">
    <span class="row__title">{{ kniha.nazev }}</span>
    <span class="row__meta">{{ popisek }}</span>
    <button type="button" :disabled="kniha.precteno" @click="emit('precteno')">Přečteno</button>
  </li>
</template>

<style scoped>
.row { display: flex; gap: 0.75rem; align-items: center; }
.row--done .row__title { text-decoration: line-through; }
</style>
```

Pořadí bloků je na tobě, zvyk je `<script setup>`, `<template>`, `<style>`. Soubor smí mít i `<script>` bez `setup` (pro věci, které se dělají jednou za modul) a víc bloků `<style>`.

Takový soubor **nejde otevřít v prohlížeči**. Potřebuje Vite s `@vitejs/plugin-vue`, které z něj při sestavení vyrobí JavaScript. Proto jsou v téhle lekci bloky `vue` jen ke čtení a spustitelné ukázky píšu bez SFC — stejnou komponentu jde zapsat i jako obyčejný objekt s `template`.

> [!TIP]
> Projekt s Vite a Vue založíš příkazem `npm create vue@latest`. Průvodce se zeptá na Vue Router, Pinii, TypeScript a testy a vygeneruje kostru se vším zapojeným.

:::check
Který z bloků souboru `.vue` odpovídá tomu, co v Reactu vrací funkce komponenty `return (…)`? Napiš jméno značky bez lomítek a závorek.

### --expected--
template

### --accept--
<template>
blok template

### --why--
`<template>` je [[šablona Vue|šablona]] komponenty — její značkování. `<script setup>` odpovídá tělu funkce komponenty nad `return`, `<style scoped>` nemá v Reactu přímý protějšek.
:::

## `script setup` a co vidí šablona

[[script setup|Blok `script setup`]] je zkrácený zápis [[Composition API|Composition API]]. Platí v něm jediné pravidlo, které si musíš zapamatovat: **co je v bloku deklarované na nejvyšší úrovni, to šablona vidí**. Žádný `return` jako v `setup()`, žádný seznam.

| React | Vue v `script setup` |
|---|---|
| `function Karta({ nazev, stran })` | `const props = defineProps({ nazev: String, stran: Number })` |
| `onSelect` jako prop, `onSelect(id)` | `const emit = defineEmits(['vybrano'])`, `emit('vybrano', id)` |
| `const [q, setQ] = useState('')` + `value`/`onChange` | `const q = defineModel()` a `v-model` u rodiče |
| pomocná funkce v těle komponenty | funkce na nejvyšší úrovni bloku |

`defineProps`, `defineEmits` a `defineModel` nejsou funkce, které bys odněkud importoval. Jsou to značky pro překladač: ten je při sestavení nahradí skutečnou definicí komponenty. Proto se smějí volat jen přímo v `script setup` a jen s takovými argumenty, které jdou přečíst ze zdroje.

Druhá věc, která překvapí: v šabloně se [[reaktivní ref|ref]] **rozbalí**. V bloku píšeš `pocet.value`, v šabloně `{{ pocet }}`. Tomu se říká [[rozbalení refu|rozbalení refu]] a platí jen pro nejvyšší úroveň šablony, ne pro ref schovaný v poli.

Ukázka níž dělá to samé bez SFC: komponentu zapíše jako objekt a jeho šablonu vezme ze značky `<template id="kniha-radek">` ve stránce. Zkus v ní změnit počet stran u Saturnina a sleduj, jak se změní i součet pod seznamem.

:::live vue
```html
<div id="app" class="app">
  <h1>Čtenářský deník</h1>
  <ul class="list">
    <kniha-radek v-for="kniha in knihy" :key="kniha.id" :kniha="kniha" @precteno="oznac(kniha.id)"></kniha-radek>
  </ul>
  <p class="muted">Přečteno {{ hotovo }} z {{ knihy.length }}, celkem {{ stran }} stran.</p>
</div>

<template id="kniha-radek">
  <li class="row" :class="{ 'row--done': kniha.precteno }">
    <span class="row__title">{{ kniha.nazev }}</span>
    <span class="row__meta">{{ kniha.stran }} stran</span>
    <button type="button" :disabled="kniha.precteno" @click="$emit('precteno')">Přečteno</button>
  </li>
</template>
```
```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 1.5rem; }
.app { max-width: 30rem; margin: 0 auto; background: #fff; border-radius: 0.75rem; padding: 1.25rem 1.5rem; box-shadow: 0 0.75rem 2rem rgb(15 23 42 / 0.12); }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
.list { list-style: none; margin: 0; padding: 0; }
.row { display: flex; gap: 0.75rem; align-items: center; padding: 0.55rem 0; border-top: 1px solid #e2e8f0; }
.row__title { flex: 1; }
.row__meta { color: #64748b; font-variant-numeric: tabular-nums; }
.row--done .row__title { text-decoration: line-through; color: #94a3b8; }
button { border: 0; border-radius: 0.5rem; padding: 0.35rem 0.7rem; background: #0d9488; color: #fff; cursor: pointer; }
button:disabled { background: #cbd5f5; cursor: default; }
.muted { color: #64748b; font-size: 0.9rem; }
```
```js
import { createApp, computed, ref } from 'vue';

const app = createApp({
  setup() {
    const knihy = ref([
      { id: 1, nazev: 'Krakatit', stran: 320, precteno: false },
      { id: 2, nazev: 'Bylo nás pět', stran: 208, precteno: true },
      { id: 3, nazev: 'Saturnin', stran: 240, precteno: false },
    ]);
    const hotovo = computed(() => knihy.value.filter((kniha) => kniha.precteno).length);
    const stran = computed(() => knihy.value.reduce((soucet, kniha) => soucet + kniha.stran, 0));

    function oznac(id) {
      const kniha = knihy.value.find((polozka) => polozka.id === id);
      if (kniha) kniha.precteno = true;
    }

    return { knihy, hotovo, stran, oznac };
  },
});

app.component('KnihaRadek', {
  props: { kniha: { type: Object, required: true } },
  emits: ['precteno'],
  template: '#kniha-radek',
});

app.mount('#app');
```
:::

:::check
V `script setup` napíšeš `const pocet = ref(0)`. Jak se hodnota vypíše v šabloně?

### --expected--
{{ pocet }}

### --accept--
pocet

### --why--
V šabloně se ref rozbalí, takže `.value` nepíšeš. V bloku `script setup` ho psát musíš: `pocet.value += 1`.
:::

:::explain
Vysvětli vlastními slovy, proč `defineProps` nemusíš importovat a proč se smí volat jen přímo v `script setup`, ne uvnitř podmínky nebo pomocné funkce.

## --model--
`defineProps` není běžná funkce, kterou by šlo zavolat za běhu. Je to pokyn pro překladač: plugin pro Vue si při sestavení přečte zdroj, najde volání `defineProps` a z jeho argumentu sestaví definici props té komponenty. Ve výsledném JavaScriptu žádné volání nezbyde, proto není co importovat. A protože překladač čte zdroj staticky, musí být volání na jednom předvídatelném místě — v podmínce nebo v jiné funkci by ho nenašel a props by komponenta neměla.

## --checklist--
- `defineProps` zpracuje překladač při sestavení, ne prohlížeč za běhu.
- Z jeho argumentu vzniká definice props, ve výsledném kódu volání nezůstane.
- Proto se neimportuje a musí stát přímo v `script setup`.
:::

## Scoped styly

Blok `<style scoped>` platí jen pro prvky téhle komponenty. Překladač přidá každému prvku v šabloně atribut jako `data-v-7a3f21` a každý selektor v bloku přepíše na `.row[data-v-7a3f21]`. Není to izolace jako u Shadow DOM — je to obyčejná specifičnost navíc, jen ji za tebe píše nástroj.

Tři věci, které z toho plynou:

- **Dědičné vlastnosti prosakují dál.** `color` nebo `font-family` nastavené na kořenovém prvku komponenty zdědí i obsah, který dovnitř vloží rodič.
- **Do cizí komponenty se styl nedostane.** Když chceš stylovat vnitřek potomka (třeba položku knihovní komponenty), musíš selektor označit `:deep(.polozka)`.
- **Na obsah slotu platí styly toho, kdo ho napsal**, ne toho, kdo ho vykresluje. Na to je `:slotted(.polozka)`.

Vedle `scoped` existuje ještě `<style module>` (CSS Modules jako v Reactu, třídy pak čteš přes `$style.row`) a `v-bind()` v CSS, kterým do stylu dostaneš hodnotu z JavaScriptu: `background: v-bind(barvaStavu)`.

:::check
Napiš selektor, kterým ze scoped stylů obarvíš prvek `.cena` uvnitř komponenty potomka.

### --expected--
:deep(.cena)

### --accept--
::v-deep(.cena)

### --why--
Bez `:deep()` by překladač selektor přepsal na `.cena[data-v-…]`, jenže prvky potomka mají jiný atribut, takže by pravidlo nic netrefilo.
:::

## Slot místo `children`

Kde React předává obsah v `props.children`, Vue má [[slot|sloty]]. Rozdíl je v tom, že slotů může být víc a mají jména.

```vue
<!-- Panel.vue -->
<template>
  <section class="panel">
    <header class="panel__head">
      <slot name="hlavicka">Bez názvu</slot>
    </header>
    <div class="panel__body">
      <slot></slot>
    </div>
  </section>
</template>
```

```vue
<!-- použití -->
<Panel>
  <template #hlavicka><h2>Rozečtené</h2></template>
  <p>Tři knihy čekají na dočtení.</p>
</Panel>
```

Obsah bez `<template #jmeno>` spadne do výchozího slotu. Text mezi značkami `<slot>` a `</slot>` je záložní obsah, který se ukáže, když rodič nic nepošle — v Reactu bys psal `children ?? 'Bez názvu'`.

Slot umí poslat data směrem ven (*scoped slot*): `<slot :kniha="kniha">` v potomkovi a `<template #default="{ kniha }">` u rodiče. To je protějšek vzoru „prop, která je funkce" z Reactu.

:::check
Komponenta `Panel` má `<slot name="hlavicka">`. Čím obsah do toho slotu pošleš z rodiče? Napiš úvodní značku.

### --expected--
<template #hlavicka>

### --accept--
<template v-slot:hlavicka>

### --why--
`#jmeno` je zkratka za `v-slot:jmeno`. Bez ní by obsah spadl do výchozího slotu.
:::

## Pinia: store místo kontextu

Když stav potřebuje víc obrazovek (přihlášený uživatel, košík, rozečtené knihy), v Reactu sáhneš po kontextu s reducerem nebo po Zustandu. Ve Vue je standardní odpověď [[Pinia|Pinia]].

```js
// stores/knihovna.js
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useKnihovna = defineStore('knihovna', () => {
  const knihy = ref([]);

  const rozecteno = computed(() => knihy.value.filter((kniha) => !kniha.precteno));

  function oznacPrecteno(id) {
    const kniha = knihy.value.find((polozka) => polozka.id === id);
    if (kniha) kniha.precteno = true;
  }

  return { knihy, rozecteno, oznacPrecteno };
});
```

Uvnitř `defineStore` píšeš úplně stejný kód jako v `setup` komponenty: `ref` je stav, `computed` je odvozená hodnota, obyčejná funkce je akce. V komponentě pak store jen zavoláš:

```vue
<script setup>
import { storeToRefs } from 'pinia';
import { useKnihovna } from '../stores/knihovna';

const knihovna = useKnihovna();
const { rozecteno } = storeToRefs(knihovna);
</script>
```

Proti kontextu v Reactu má Pinia tři praktické rozdíly:

- **Není potřeba `Provider` kolem stromu.** Store je modul; `useKnihovna()` vrátí tutéž instanci komukoli, kdo o ni požádá.
- **Překreslí se jen to, co hodnotu čte.** Kontext v Reactu překreslí všechny odběratele, i když se změnila jiná část hodnoty. Vue sleduje jednotlivé hodnoty, takže o tenhle problém nezavadíš.
- **Metody se volají přímo** (`knihovna.oznacPrecteno(3)`), žádné `dispatch({ type: … })`.

> [!PITFALL]
> Store je reaktivní objekt, ne ref. `const { rozecteno } = useKnihovna()` ti vytáhne **současnou hodnotu** a spojení se ztratí — v UI se pak nic nemění. Hodnoty destrukturuj přes `storeToRefs(store)`, funkce klidně napřímo.

:::check
Proč se hodnota po `const { knihy } = useKnihovna()` v šabloně přestane aktualizovat?

### --expected--
Destrukturalizace vytáhne hodnotu a zruší spojení se storem.

### --accept--
Protože destrukturalizací dostaneš obyčejnou hodnotu, ne reaktivní odkaz.
Reaktivita se ztratí, hodnota už není napojená na store.

### --why--
Store je [[reactive|reactive]] objekt. Reaktivní je čtení jeho vlastnosti, ne hodnota, která z něj vypadne. `storeToRefs` proto udělá z každé vlastnosti ref, který spojení udrží.
:::

## Vue Router: cesty ručně

Vue samo o sobě neumí routy — od toho je balíček `vue-router`. Na rozdíl od Next.js, kde routu založíš vytvořením souboru, tady cesty vypíšeš do pole:

```js
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Seznam.vue') },
    { path: '/kniha/:id', component: () => import('./pages/Detail.vue') },
    { path: '/:cesta(.*)', component: () => import('./pages/Nenalezeno.vue') },
  ],
});
```

V šabloně pak `<RouterLink to="/kniha/3">` místo `<a href>` a `<RouterView />` na místě, kam se má stránka vykreslit — obdoba `children` v layoutu Next.js. Uvnitř komponenty čteš parametry přes `useRoute()` (`route.params.id`) a přesměrováváš přes `useRouter()` (`router.push('/')`).

> [!NOTE]
> Tohle všechno za tebe udělá [[Nuxt|Nuxt]], kde je routa zase jen soubor ve složce. Podrobně v lekci [Nuxt v kostce](see:vue-nuxt-druhy-framework/nuxt-v-kostce#routy-ze-souboru-pages).

:::check
Čím se ve [[Vue Router|Vue Routeru]] označí místo v šabloně, kam se vykreslí obsah aktuální routy? Napiš značku.

### --expected--
<RouterView />

### --accept--
<router-view></router-view>
<RouterView></RouterView>
<router-view />
RouterView

### --why--
`<RouterView>` je protějšek `children` v layoutu Next.js. `<RouterLink>` je protějšek `<Link>` — oboje se dá psát i kebab-casem.
:::

## Typické chyby a pasti

Ukázka níž má dvě komponenty, které čtou tentýž objekt. Předpověz, co se stane po kliknutí.

:::live vue predict
```html
<div id="app">
  <pocitadlo-a></pocitadlo-a>
  <pocitadlo-b></pocitadlo-b>
</div>

<template id="pocitadlo-a">
  <p>A vidí: {{ pocet }} <button @click="pridej">Přidej v A</button></p>
</template>

<template id="pocitadlo-b">
  <p>B vidí: {{ stav.pocet }}</p>
</template>
```
```css
body { font-family: system-ui, sans-serif; padding: 1rem; }
button { margin-left: 0.5rem; }
```
```js
import { createApp, reactive } from 'vue';

const stav = reactive({ pocet: 0 });

const app = createApp({});

app.component('PocitadloA', {
  setup() {
    const { pocet } = stav;
    return { pocet, pridej: () => { stav.pocet += 1; } };
  },
  template: '#pocitadlo-a',
});

app.component('PocitadloB', {
  setup() {
    return { stav };
  },
  template: '#pocitadlo-b',
});

app.mount('#app');
```
--question-- Co ukážou obě komponenty po třech kliknutích na tlačítko?
--option-- Obě ukážou 3, protože čtou tentýž reaktivní objekt.
--option*-- A zůstane na 0, B ukáže 3.
--option-- Obě zůstanou na 0, změna se projeví až po obnovení stránky.
--why-- `const { pocet } = stav` zkopíruje číslo v okamžiku volání `setup`, a tím se spojení s objektem ztratí. Komponenta B čte `stav.pocet` až v šabloně, takže o změně ví. Zkus v A vrátit celé `stav` místo `pocet` a sleduj, jak se čísla srovnají.
:::

> [!PITFALL]
> **Destrukturalizace reaktivního objektu.** Příznak: hodnota se v UI nemění, i když v konzoli vidíš, že se změnila. Oprava: vracej celý objekt, nebo použij `toRefs(stav)`, u Pinie `storeToRefs(store)`.

> [!PITFALL]
> **`.value` v bloku `script setup`.** Příznak: v šabloně se vypisuje `[object Object]`, nebo porovnání `if (pocet > 3)` nikdy neplatí. V bloku `script setup` se ref nerozbaluje — píšeš `pocet.value`. Rozbalí se až šablona.

> [!PITFALL]
> **Styl z rodiče nefunguje na potomka.** Příznak: pravidlo v DevTools vůbec není u prvku vidět, i když selektor sedí. Scoped styl má navíc atribut `data-v-…`, který prvky potomka nemají. Oprava: `:deep(.selektor)`, nebo styl přesunout do té komponenty, které se týká.

> [!PITFALL]
> **Store zavolaný mimo komponentu.** Příznak: `getActivePinia was called with no active Pinia`. Volání `useKnihovna()` na nejvyšší úrovni modulu proběhne dřív, než se Pinia zaregistruje v aplikaci. Oprava: volat store až uvnitř `setup`, `script setup` nebo akce.

:::check
Komponenta vypisuje `[object Object]` místo čísla, i když v `script setup` stojí `const pocet = ref(0)` a v kódu `if (pocet > 3)`. Co je špatně? Odpověz jednou větou.

### --expected--
V bloku script setup se ref nerozbaluje, musí se číst přes .value.

### --accept--
Chybí .value, ref se rozbalí jen v šabloně.
Porovnává se ref místo pocet.value.

### --why--
Rozbalení refu platí jen pro šablonu. V JavaScriptu je `pocet` pořád objekt s vlastností `value`, takže `pocet > 3` porovnává objekt s číslem a vždycky vyjde nepravda.
:::

## Kde to najdeš v MDN

- [Vue: SFC Syntax Specification](https://vuejs.org/api/sfc-spec.html) — přesně definuje, co smí být v `.vue` souboru a jaké mají bloky atributy.
- [Vue: script setup](https://vuejs.org/api/sfc-script-setup.html) — všechny značky překladače (`defineProps`, `defineEmits`, `defineModel`, `defineExpose`).
- [MDN: `<template>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) — značka, ze které Vue bere šablony i bez sestavování.
- [Pinia: Defining a Store](https://pinia.vuejs.org/core-concepts/) — rozdíl mezi zápisem přes `setup` a přes `state`/`getters`/`actions`.

# --questions--

## --question--

Napiš, co je ve `script setup` protějšek Reactového zápisu `function Karta({ nazev })`.

### --expected--
defineProps

### --accept--
const props = defineProps({ nazev: String })
defineProps({ nazev: String })

### --why--
`defineProps` je značka pro překladač, která komponentě definuje props. Jména pak v šabloně používáš přímo, v bloku přes `props.nazev`.

### --see--

vue-nuxt-druhy-framework/sfc-a-pinia#script-setup-a-co-vidi-sablona

## --question--

Proč Pinia nepotřebuje obalit aplikaci komponentou `Provider`, zatímco kontext v Reactu ano?

### --answer--
Protože Pinia ukládá stav do `localStorage`, ne do stromu komponent.

#### --why--
Pinia sama nic neukládá do prohlížeče. Rozdíl je v tom, odkud se hodnota bere.

### --correct--
Protože store je modul: `useKnihovna()` vrátí tutéž instanci komukoli, kdo o ni požádá, bez ohledu na místo ve stromu.

#### --why--
Plugin Pinie se registruje jednou pro celou aplikaci a store si drží sám. Poloha komponenty ve stromu na nic nemá vliv.

### --answer--
Protože Vue nemá strom komponent, takže není co obalovat.

#### --why--
Strom komponent má Vue úplně stejně jako React. Rozdíl je v tom, kde stav bydlí.

### --see--

vue-nuxt-druhy-framework/sfc-a-pinia#pinia-store-misto-kontextu

## --question--

**Opakování z dřívějška.** V Reactu předáš komponentě obsah mezi značkami: `<Karta>Text</Karta>`. Pod jakým jménem ho komponenta `Karta` najde ve svých props?

### --expected--
children

### --accept--
props.children

### --why--
React má jediný `children`, Vue má místo něj sloty a těch může být víc. Proto se ve Vue nepředává obsah jako prop, ale jako pojmenovaný otvor v šabloně.

### --see--

react-zaklady/komponenty-a-props#children-obsah-mezi-znackami

## --question--

**Opakování z dřívějška.** Kdy kontext v Reactu překreslí komponentu, která z něj čte jen jednu vlastnost?

### --answer--
Jen když se změní právě ta vlastnost, kterou čte.

#### --why--
React nesleduje, kterou vlastnost si z hodnoty vytáhneš. Zamysli se, s čím se porovnává hodnota kontextu.

### --correct--
Pokaždé, když se změní identita celé hodnoty předané do `value`.

#### --why--
Odběratelé se porovnávají na identitu hodnoty kontextu. Nový objekt v `value` proto překreslí všechny, i když se uvnitř změnilo něco jiného.

### --answer--
Nikdy, dokud ji nepřekreslí rodič.

#### --why--
Kontext je právě cesta, jak překreslit i komponentu, jejíž rodič se nemění.

### --see--

react-hloubka/reducer-a-context#kdy-kontext-prekresli-vsechno

## --question--

V jakém pořadí se musí stát tyhle dvě věci, aby volání `useKnihovna()` nespadlo na `getActivePinia was called with no active Pinia`? Napiš jednou větou, co musí být dřív.

### --expected--
Nejdřív se Pinia zaregistruje v aplikaci, teprve pak se smí store volat.

### --accept--
Aplikace musí mít app.use(createPinia()) dřív, než se store zavolá.
Store se smí volat až uvnitř setup, po registraci Pinie.

### --why--
`useKnihovna()` na nejvyšší úrovni modulu se vyhodnotí při importu, tedy dřív, než `app.use(createPinia())` stihne proběhnout. Proto se store volá až uvnitř `setup`, `script setup` nebo akce.

### --see--

vue-nuxt-druhy-framework/sfc-a-pinia#typicke-chyby-a-pasti
