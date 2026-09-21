## --card-- free

Píšeš ve Vue komponentu a potřebuješ v ní jedno číslo, které se dá měnit. Co napíšeš a čím se to liší od `useState`?

### --back--

`const kcal = ref(0)` a dál se s hodnotou pracuje přes `kcal.value`. Rozdíly proti
`useState`:

- `ref` nevrací dvojici [hodnota, setter], ale **jednu krabičku**, do které se zapisuje;
- zápis `kcal.value = 700` je okamžitý — na dalším řádku už tam nová hodnota je,
  kdežto `setKcal(700)` v Reactu hodnotu do proměnné `kcal` nedostane až do dalšího renderu;
- v šabloně se `.value` nepíše, Vue ref rozbalí samo.

### --see--

vue-nuxt-druhy-framework/prevodni-tabulka#stav-usestate-a-ref

## --card-- free

Kdy se `.value` píše a kdy ne? Vyjmenuj obě situace.

### --back--

**Píše se v JavaScriptu** — v `setup()`, v obsluhách, ve `watch`, uvnitř `computed`.
**Nepíše se v šabloně** — Vue ref, který ze `setup()` vrátíš, při vykreslení rozbalí,
takže `{{ kcal }}` stačí.

Past je v tom, že obě chyby jsou tiché: `kcal + 1` v JavaScriptu dá `"[object Object]1"`
nebo `NaN`, a `{{ kcal.value }}` v šabloně vypíše prázdno.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#ref-je-krabicka-s-value

## --card-- output

Co vypíše tenhle kód? (Je to čistý JavaScript — přesně ten mechanismus, na kterém stojí sledování závislostí ve Vue.)

```js
const den = { kcal: 1250 };
const sledovany = new Proxy(den, {
  get(cil, klic) {
    console.log('cte se ' + klic);
    return cil[klic];
  },
  set(cil, klic, hodnota) {
    cil[klic] = hodnota;
    console.log('zapsano ' + klic);
    return true;
  },
});
sledovany.kcal = 1345;
console.log(sledovany.kcal);
```

### --expected--

zapsano kcal
cte se kcal
1345

### --why--

Nastavení projde přes past `set`, čtení přes past `get` — a právě v těch dvou pastech si
Vue u každé vlastnosti pamatuje, který efekt ji četl, a při zápisu ho spustí znovu.
Kdyby poslední řádek četl původní objekt `den`, žádné „cte se" by se nevypsalo: past
hlídá proxy, ne objekt pod ní.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#proxy-a-sledovani-zavislosti

## --card-- output

Kolega chce ze stavu vytáhnout jedno číslo do proměnné. Co vypíše poslední řádek?

```js
const stav = { limit: 2000, kcal: 1250 };
const { limit } = stav;
stav.limit = 1800;
console.log(limit, stav.limit);
```

### --expected--

2000 1800

### --why--

Rozbalením do proměnné se zkopírovala **hodnota**, ne vazba na vlastnost. Stejně dopadne
`const { kcal } = reactive({ kcal: 0 })` ve Vue: `kcal` zamrzne. Proto se z `reactive`
objektu vytahuje přes `toRefs`, nebo se rovnou sahá po `ref`.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#reactive-a-proc-ztraci-reaktivitu

## --card-- free

`v-if` a `v-show` obojí schová prvek. Podle čeho si mezi nimi vybereš?

### --back--

`v-if` prvek **vůbec nevytvoří** (a při změně podmínky ho vytváří a ruší, včetně
komponent a jejich stavu). `v-show` prvek vždy vykreslí a jen mu přepíná `display: none`.

Pravidlo: co se přepíná často (záložka, rozbalovací panel), dej na `v-show` — přepnutí
je jen změna stylu. Co se skoro nemění nebo je drahé vykreslit, dej na `v-if`.
`v-show` navíc neumí `v-else` a nefunguje na `<template>`.

### --see--

vue-nuxt-druhy-framework/prevodni-tabulka#seznamy-a-podminky

## --card-- free

Proč nejde napsat `v-for` a `v-if` na jeden a tentýž prvek a jak se to řeší?

### --back--

Od Vue 3 má `v-if` **vyšší prioritu** než `v-for`, takže se podmínka vyhodnotí dřív, než
vůbec existuje proměnná cyklu — `v-if="meal.kcal > 500"` na stejném `<li>` skončí chybou,
že `meal` není definované.

Řešení jsou dvě: filtrovat už v datech (`computed` s `filter`, většinou lepší, protože se
filtr nepřepočítává při každém vykreslení), nebo cyklus obalit do
`<template v-for="…"><li v-if="…">`.

### --see--

vue-nuxt-druhy-framework/prevodni-tabulka#seznamy-a-podminky

## --card-- free

Kdy `:key` s indexem z `v-for` opravdu způsobí chybu, a kdy je neškodný?

### --back--

Škodí, jakmile se pořadí mění — smazání, vložení na začátek, řazení — a položky mají
vlastní stav (napsaný text v `<input>`, otevřený detail, běžící animace). Vue spáruje
starý a nový uzel podle klíče, takže při posunu indexů zůstane obsah u špatného řádku.

Neškodí u seznamu, který se jen vykreslí a už se nemění, a u položek bez vlastního stavu.
I tam je ale stabilní `id` z dat levnější než hledat, kdy se seznam začal měnit.

### --see--

vue-nuxt-druhy-framework/prevodni-tabulka#seznamy-a-podminky

## --card-- free

Co přesně `v-model="jmeno"` na `<input>` nahrazuje a jak by ten samý input vypadal bez něj?

### --back--

Je to zkratka za navázání hodnoty a obsluhy změny naráz:

```html
<input :value="jmeno" @input="jmeno = $event.target.value">
```

V Reactu je to řízený input `value={jmeno} onChange={…}` — stejný princip, jen bez zkratky.
Modifikátory: `.number` převede na číslo, `.trim` ořízne mezery, `.lazy` čeká na `change`
místo `input`.

### --see--

vue-nuxt-druhy-framework/prevodni-tabulka#formulare-v-model-misto-rizeneho-pole

## --card-- free

Rodič potřebuje vědět, že se v potomkovi něco stalo. Popiš celou cestu tam i zpět — jak se data posílají dolů a zprávy nahoru.

### --back--

Dolů **props**, nahoru **události**. V potomkovi:

```vue
<script setup>
const props = defineProps({ meal: Object });
const emit = defineEmits(['remove']);
</script>
```

a v jeho šabloně `@click="emit('remove', props.meal.id)"`. U rodiče
`<MealRow :meal="meal" @remove="removeMeal" />`.

Proti Reactu je rozdíl v tom, že potomek nedostává funkci v props — jen **oznámí, co se
stalo**, a rodič si sám rozhodne, co s tím. Props jsou i tady jen ke čtení.

### --see--

vue-nuxt-druhy-framework/prevodni-tabulka#props-a-udalosti

## --card-- free

Co je na `computed` jiného než na obyčejné funkci, kterou v šabloně zavoláš — a kdy je ten rozdíl vidět?

### --back--

`computed` si výsledek **drží v cache** a přepočítá ho, až když se změní některá
z hodnot, které jeho funkce četla. Volaná funkce se vyhodnotí při každém vykreslení znovu.

U `limit - kcal` je to jedno. U filtrování a řazení dvou tisíc řádků je to rozdíl mezi
plynulým a trhaným rozhraním. Pravidlo: co se dá odvodit z jiného stavu, nikdy neukládej
do vlastního `ref` — jinak musíš hlídat, aby se obě hodnoty nerozešly.

### --see--

vue-nuxt-druhy-framework/prevodni-tabulka#odvozena-hodnota-usememo-a-computed

## --card-- free

Kdy sáhneš po `watch` a kdy po `computed`? Uveď u každého příklad.

### --back--

`computed`, když z existujícího stavu **odvozuješ hodnotu** (součet, filtrovaný seznam,
popisek „Zbývá 750 kcal"). Nic nemění, jen vrací.

`watch` / `watchEffect`, když má po změně nastat **vedlejší efekt** — uložení do
`localStorage`, zápis do URL, dotaz na server, odscrollování. `watchEffect` navíc běží
hned a závislosti si vezme z toho, co přečetl; `watch(zdroj, …)` čeká na první změnu,
dokud mu nedáš `{ immediate: true }`.

Mít `watch`, který jen dopočítává jiný `ref`, je skoro vždy `computed` napsaný oklikou.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#watch-a-watcheffect-proti-useeffect

## --card-- free

Časovač založený v komponentě běží dál i po odchodu na jinou obrazovku. Co jsi zapomněl a jak to vypadá ve Vue?

### --back--

Úklid. V Reactu se vrací úklidová funkce z `useEffect`, ve Vue se registruje hák:

```js
const id = setInterval(tick, 1000);
onUnmounted(() => clearInterval(id));
```

Totéž platí pro `addEventListener` na `window`, `ResizeObserver` i otevřený WebSocket.
`watch` a `watchEffect` se ruší samy, když komponenta zanikne — ale jen ty, které jsi
založil přímo v `setup()`.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#watch-a-watcheffect-proti-useeffect

## --card-- free

Zapsal jsi do `ref` novou hodnotu a hned na dalším řádku měříš výšku seznamu v DOMu. Proč je špatně a co s tím?

### --back--

Vue překresluje **asynchronně**: zápis jen naplánuje překreslovací efekt do mikroúlohy.
Na dalším řádku je v DOMu ještě starý obsah, takže naměříš předchozí stav.

Řešení je počkat: `await nextTick()` a měřit až pak. Stejná past je v testech —
po akci, která mění data, se musí počkat, než se stránka dosrovná.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#kdy-se-dom-skutecne-zmeni-nexttick

## --card-- free

Kolega tvrdí, že `setup()` je totéž co tělo React komponenty. Kde se plete a co z toho plyne?

### --back--

`setup()` běží **jednou** při vzniku komponenty. Tělo React komponenty běží při **každém**
renderu. Z toho plyne skoro celý zbytek rozdílů:

- obsluhy a funkce v `setup()` vzniknou jednou, takže Vue nepotřebuje `useCallback`;
- není co memoizovat kvůli identitě, takže neexistuje ani `memo`;
- nejsou pravidla háků — `ref` klidně vytvoříš v `if`, protože se `setup()` neopakuje;
- proměnná v `setup()` si drží hodnotu mezi překresleními sama, i bez `useRef`.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#problem-react-prekresli-cely-komponent

## --card-- free

Co všechno je v souboru `.vue` a co s ním musí proběhnout, než to prohlížeč zobrazí?

### --back--

Tři bloky nad jednou komponentou: `<template>` (HTML se šablonovými výrazy), `<script setup>`
(logika) a `<style>` (styly, obvykle `scoped`).

Prohlížeč `.vue` neumí. Překládá ho **sestavovací nástroj** — Vite s oficiálním pluginem —
na obyčejný JavaScript s vykreslovací funkcí plus CSS. Proto SFC nejde jen tak připojit
přes `<script src="Karta.vue">`; bez sestavení se komponenty píšou jako objekt
s vlastností `template`.

### --see--

vue-nuxt-druhy-framework/sfc-a-pinia#jednosouborova-komponenta

## --card-- free

Jak `<style scoped>` zařídí, že styl neuteče ven, a co dělat, když potřebuješ nastylovat něco uvnitř cizí komponenty?

### --back--

Překladač přidá každému prvku komponenty atribut typu `data-v-7a3f1c` a každý selektor
zúží na `.karta[data-v-7a3f1c]`. Styl tím platí jen na značky z té jedné šablony.

Do potomka se dostaneš přes `:deep(.trida)`, na obsah slotu přes `:slotted(…)` a globální
pravidlo napíšeš přes `:global(…)`. Kořenový prvek potomka atribut rodiče dostane taky,
takže ten se nastylovat dá i bez `:deep`.

### --see--

vue-nuxt-druhy-framework/sfc-a-pinia#scoped-styly

## --card-- free

Komponenta `Panel` má `<slot name="hlavicka">Bez názvu</slot>`. K čemu je text mezi značkami a jak by se to psalo v Reactu?

### --back--

Je to **záložní obsah**: ukáže se, když rodič do toho slotu nic nepošle. V Reactu bys psal
`children ?? 'Bez názvu'`, případně `props.hlavicka ?? …`.

Proti `children` má slot navíc jména, takže komponenta může mít víc otvorů, a umí poslat
data ven (`<slot :meal="meal">` a u rodiče `<template #default="{ meal }">`) — to je
protějšek vzoru „prop, která je funkce".

### --see--

vue-nuxt-druhy-framework/sfc-a-pinia#slot-misto-children

## --card-- free

Stav košíku potřebují tři obrazovky. Co uděláš ve Vue a čím se to liší od React contextu?

### --back--

Založíš store v Pinii:

```js
export const useKosik = defineStore('kosik', () => {
  const polozky = ref([]);
  const celkem = computed(() => polozky.value.reduce((s, p) => s + p.cena, 0));
  return { polozky, celkem };
});
```

Komponenta si ho vezme přes `const kosik = useKosik()` a nic se nemusí obalovat
poskytovatelem. Rozdíly proti contextu: není potřeba `Provider` kolem stromu, komponenta
se překreslí jen kvůli hodnotě, kterou opravdu čte (ne kvůli každé změně v contextu),
a store je použitelný i mimo komponenty.

### --see--

vue-nuxt-druhy-framework/sfc-a-pinia#pinia-store-misto-kontextu

## --card-- free

Store z Pinie si rozbalíš do proměnných: `const { polozky } = useKosik()`. Co se stane a jak se to dělá správně?

### --back--

Reaktivita se ztratí — store je reaktivní objekt a rozbalením se zkopírovala hodnota,
ne vazba. Hodnota v UI pak zamrzne.

Správně je `const { polozky, celkem } = storeToRefs(useKosik())`. **Akce se rozbalovat
smějí** (`const { pridej } = useKosik()`), protože funkce žádnou vazbu nepotřebuje.

### --see--

vue-nuxt-druhy-framework/sfc-a-pinia#pinia-store-misto-kontextu

## --card-- free

Ve Vue Routeru chceš odkaz na detail knihy a v cílové komponentě přečíst její `id`. Co napíšeš?

### --back--

Odkaz `<RouterLink :to="{ name: 'kniha', params: { id: kniha.id } }">` (nebo prostě
`to="/knihy/12"`). V cíli `const route = useRoute()` a pak `route.params.id` — vždy
**text**, i když to vypadá jako číslo.

Přesměrování z kódu obstará `const router = useRouter()` a `router.push(…)`. Místo, kam
se vykresluje aktuální routa, označuje `<RouterView />`.

### --see--

vue-nuxt-druhy-framework/sfc-a-pinia#vue-router-cesty-rucne

## --card-- free

Založil jsi Nuxt projekt. Kam dáš stránku `/knihy/12`, kam sdílené rozhraní kolem všech stránek a kam serverové API?

### --back--

- stránka: `pages/knihy/[id].vue` — soubor sám zakládá routu, žádná tabulka cest se nepíše;
- společné rozhraní: `app.vue` s `<NuxtPage />`, hlavičky a patičky do `layouts/default.vue`;
- serverové API: `server/api/knihy/[id].get.ts`, dostupné na `/api/knihy/12`.

Komponenty z `components/`, funkce z `composables/` a `utils/` se importují samy — `import`
se v Nuxtu pro vlastní kód většinou vůbec nepíše.

### --see--

vue-nuxt-druhy-framework/nuxt-v-kostce#routy-ze-souboru-pages

## --card-- free

Kdy v Nuxtu sáhneš po `useFetch` a kdy po `$fetch`? Co se stane, když je zaměníš?

### --back--

`useFetch` (a `useAsyncData`) je na **data, která stránka potřebuje k vykreslení**: běží na
serveru, výsledek se pošle do prohlížeče v payloadu a klient je nestahuje podruhé.

`$fetch` je na **akce uživatele** — odeslání formuláře, smazání položky, cokoli po kliknutí.

Záměna bolí oběma směry: `$fetch` v těle `setup()` stáhne data dvakrát (jednou na serveru,
jednou po hydrataci), `useFetch` v obsluze kliknutí zase zbytečně zapisuje do cache klíče
podle URL.

### --see--

vue-nuxt-druhy-framework/nuxt-v-kostce#data-usefetch-a-useasyncdata

## --card-- free

Kolega z React týmu se ptá: co je v Nuxtu protějškem `app/page.tsx`, `use client` a Route Handlers z Next.js?

### --back--

- `app/page.tsx` → `pages/index.vue` (routa ze souboru, jen jiná složka a přípona);
- `'use client'` → **nic**. Nuxt nemá serverové komponenty: každá komponenta se vykreslí
  na serveru a pak hydratuje na klientu. Kód jen pro prohlížeč se schová do
  `<ClientOnly>` nebo do souboru `*.client.vue`;
- Route Handlers (`app/api/…/route.ts`) → `server/api/…`, které běží na Nitru.

### --see--

vue-nuxt-druhy-framework/nuxt-v-kostce#nuxt-a-next-js-vedle-sebe

## --card-- code js

**Opakování z dřívějška.** Napiš funkci `soucetKalorii(meals)`, která z pole objektů
`{ name, kcal }` vrátí součet kalorií. U prázdného pole vrátí `0`.

### --seed--

```js
function soucetKalorii(meals) {
}
```

### --test--

```js
assert.equal(soucetKalorii([{ name: 'Kaše', kcal: 420 }, { name: 'Salát', kcal: 530 }]), 950, 'soucetKalorii([Kaše 420, Salát 530]) má vrátit 950');
assert.equal(soucetKalorii([]), 0, 'soucetKalorii([]) má vrátit 0');
assert.equal(soucetKalorii([{ name: 'Jablko', kcal: 95 }]), 95, 'soucetKalorii([Jablko 95]) má vrátit 95');
```

### --solution--

```js
function soucetKalorii(meals) {
  return meals.reduce((sum, meal) => sum + meal.kcal, 0);
}
```

### --why--

Přesně tenhle výpočet je ve Vue tělem `computed(() => meals.value.reduce(…))`. Framework
na něm nic nemění — jen si zapamatuje, že funkce četla `meals`, a spustí ji znovu, až se
seznam změní.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#computed-se-pocita-jen-kdyz-je-potreba

## --card-- free

V cizím projektu potkáš komponentu, která má `data()`, `methods` a `computed` jako objekty. Co to je a musíš to přepisovat?

### --back--

Je to [[Options API]] — starší zápis, ve kterém se komponenta skládá z pojmenovaných
možností a k datům se sahá přes `this.kcal`. Ve Vue 3 funguje dál a nikam nemizí.

Přepisovat nemusíš. Mísit se dá i v jednom projektu, jen ne bezhlavě v jedné komponentě.
Jedna věc se ale hlídá: `data()` **musí být funkce**, aby každá instance dostala vlastní
objekt se stavem.

### --see--

vue-nuxt-druhy-framework/prevodni-tabulka#options-api-co-potkas-ve-starsim-kodu

## --card-- free

**Opakování z dřívějška.** V Reactu bys komponentu, která se překresluje zbytečně často, obalil do `memo` a obsluhy do `useCallback`. Proč ve Vue nic takového nehledáš?

### --back--

Protože se ve Vue komponenta znovu nespouští. Změna hodnoty spustí jen **vykreslovací
efekt**, a ten dopředu ví, která místa šablony na hodnotě závisí. Funkce z `setup()`
zůstávají tytéž, takže neexistuje „nová identita funkce", kvůli které by se potomek
překresloval.

Optimalizace, které ve Vue smysl mají, jsou jiné: `v-once`, `v-memo` u dlouhých seznamů
a `shallowRef` u velkých objektů, které se mění celé.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#problem-react-prekresli-cely-komponent
