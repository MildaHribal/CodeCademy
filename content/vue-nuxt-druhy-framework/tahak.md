Všechno, co při přepisu z Reactu do Vue hledáš nejčastěji, na jednom místě.

## Co se jak jmenuje

| React | Vue | poznámka |
|---|---|---|
| `useState(0)` | `ref(0)` | v JS `.value`, v šabloně bez něj |
| `useState({…})` | `reactive({…})` nebo `ref({…})` | `reactive` nejde rozbalit do proměnných |
| `useMemo(fn, [deps])` | `computed(fn)` | žádné pole závislostí |
| `useEffect(fn, [deps])` | `watch(zdroj, fn)` | vedlejší efekty, ne dopočítávání |
| `useEffect(fn)` bez pole | `watchEffect(fn)` | závislosti si vezme z toho, co přečte |
| úklid `return () => …` | `onUnmounted(() => …)` | časovače, posluchače, sockety |
| `useRef(null)` na prvek | `ref(null)` + `ref="jmeno"` v šabloně | stejné jméno proměnné a atributu |
| `useCallback`, `memo` | — | `setup()` běží jednou, není co stabilizovat |
| `useContext` | `inject` / `provide`, většinou [[Pinia]] | |
| `className` | `class` | šablona je HTML, ne JavaScript |
| `onClick={handler}` | `@click="handler"` | |
| `{podminka && <p/>}` | `v-if="podminka"` | |
| `items.map(…)` v JSX | `v-for="item in items"` | `:key` stejně jako v Reactu |
| `children` | `<slot>` | slotů může být víc a mají jména |
| `props.onRemove(id)` | `emit('remove', id)` | potomek oznamuje, nerozhoduje |

## Kostra komponenty

```vue
<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({ limit: { type: Number, default: 2000 } });
const emit = defineEmits(['prekroceno']);

const meals = ref([]);
const total = computed(() => meals.value.reduce((sum, meal) => sum + meal.kcal, 0));

watch(total, (hodnota) => {
  if (hodnota > props.limit) emit('prekroceno', hodnota);
});
</script>

<template>
  <p v-if="meals.length">Celkem {{ total }} kcal</p>
  <p v-else class="empty">Dnes zatím nic.</p>
</template>

<style scoped>
.empty { color: #64748b; }
</style>
```

## Šablona: atributy a direktivy

```html
<img :src="meal.photo" :alt="meal.name">
<button :disabled="meals.length === 0" @click="clearDay">Vymazat den</button>
<footer :class="{ 'card__foot--over': isOver }" :style="{ width: podil + '%' }"></footer>

<li v-for="meal in meals" :key="meal.id">{{ meal.name }}</li>
<p v-if="meals.length">…</p>
<p v-else-if="loading">…</p>
<p v-else>…</p>

<form @submit.prevent="addMeal">
  <input v-model.trim="draftName">
  <input v-model.number="draftKcal" type="number">
</form>
```

Modifikátory, které se vyplatí znát: `.prevent`, `.stop`, `.self`, `.once` u událostí,
`.enter` a `.esc` u kláves, `.number`, `.trim` a `.lazy` u `v-model`.

## Bez sestavení (kroky v Akademii, rychlý prototyp)

```js
import { createApp, ref, computed } from 'vue';

const app = createApp({
  setup() {
    const meals = ref([]);
    const total = computed(() => meals.value.reduce((sum, meal) => sum + meal.kcal, 0));
    return { meals, total };
  },
});

app.component('MealRow', {
  props: { meal: { type: Object, required: true } },
  emits: ['remove'],
  template: `
    <li class="meal">
      <span>{{ meal.name }}</span>
      <button type="button" @click="$emit('remove', meal.id)">×</button>
    </li>
  `,
});

app.mount('#app');
```

V šabloně v HTML se komponenta píše s pomlčkami: `<meal-row :meal="meal" @remove="removeMeal"></meal-row>`.

## Store místo kontextu

```js
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useDen = defineStore('den', () => {
  const meals = ref([]);
  const total = computed(() => meals.value.reduce((sum, meal) => sum + meal.kcal, 0));
  const addMeal = (name, kcal) => meals.value.push({ id: crypto.randomUUID(), name, kcal });
  return { meals, total, addMeal };
});

// v komponentě
const den = useDen();
const { meals, total } = storeToRefs(den);   // hodnoty přes storeToRefs
const { addMeal } = den;                      // akce se rozbalit smějí
```

## Nuxt: kam co patří

| chci | soubor |
|---|---|
| stránku `/knihy` | `pages/knihy/index.vue` |
| stránku `/knihy/12` | `pages/knihy/[id].vue`, v ní `useRoute().params.id` |
| obal kolem všech stránek | `app.vue` s `<NuxtPage />`, hlavička do `layouts/default.vue` |
| data pro vykreslení | `const { data } = await useFetch('/api/knihy')` |
| akci po kliknutí | `await $fetch('/api/knihy', { method: 'POST', body })` |
| serverové API | `server/api/knihy.get.ts` |
| stránku jen staticky | `routeRules: { '/o-nas': { prerender: true } }` v `nuxt.config.ts` |

## Pasti, na které se naráží nejčastěji

| příznak | příčina |
|---|---|
| v UI je `[object Object]` nebo `NaN` | chybí `.value` v JavaScriptu |
| `{{ kcal.value }}` vypíše prázdno | v šabloně se `.value` naopak nepíše |
| hodnota v UI zamrzla | rozbalení `reactive` objektu nebo store do proměnné — chce to `toRefs` / `storeToRefs` |
| změna `ref` se neprojeví | přiřazení celé nové krabičky (`kcal = ref(700)`) místo zápisu do `.value` |
| `meal is not defined` na `<li>` | `v-if` a `v-for` na jednom prvku, `v-if` má přednost |
| text zůstal u špatného řádku | `:key` je index z `v-for` |
| naměřená výška je stará | DOM se mění až v mikroúloze, chce to `await nextTick()` |
| v `<input type="number">` je text | chybí modifikátor `.number` |
| všechny karty sdílejí jeden stav | `data` v [[Options API]] není funkce |
| časovač běží i po odchodu | chybí `onUnmounted` s `clearInterval` |
