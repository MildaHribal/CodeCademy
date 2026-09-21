## --term-- šablona Vue

en: template
aliases: šablony Vue, šabloně Vue, šablonu Vue, šablonou Vue
lekce: vue-nuxt-druhy-framework/prevodni-tabulka#sablona-misto-jsx

HTML komponenty ve Vue, do kterého se píšou výrazy v `{{ }}` a direktivy. Na rozdíl
od JSX to je platné HTML, které prohlížeč zvládne přečíst i bez překladu.

## --term-- interpolace

en: text interpolation
aliases: interpolaci, interpolací, interpolace textu
lekce: vue-nuxt-druhy-framework/prevodni-tabulka#sablona-misto-jsx

Vypsání hodnoty do šablony dvojitými složenými závorkami: `{{ total }}`. Uvnitř smí
být jakýkoli výraz JavaScriptu, ale ne příkaz (`if`, `for`).

## --term-- direktiva

en: directive
aliases: direktivy, direktivu, direktivě, direktivou, direktiv
lekce: vue-nuxt-druhy-framework/prevodni-tabulka#sablona-misto-jsx

Speciální atribut šablony začínající `v-`, který prvku přidá chování: `v-if`, `v-for`,
`v-bind` (zkratka `:`), `v-on` (zkratka `@`), `v-model`. Direktiva nahrazuje to, co
se v JSX píše jako JavaScript.

## --term-- v-model

en: two-way binding
aliases: obousměrná vazba, obousměrné vazby, obousměrnou vazbu
lekce: vue-nuxt-druhy-framework/prevodni-tabulka#formulare-v-model-misto-rizeneho-pole

Direktiva, která spojí formulářový prvek s reaktivní hodnotou v obou směrech naráz.
Nahrazuje dvojici `value` a `onChange` z řízeného pole v Reactu.

## --term-- emit

en: emit
aliases: emitu, emitem, emituje, vlastní událost komponenty, vlastní události komponenty
lekce: vue-nuxt-druhy-framework/prevodni-tabulka#props-a-udalosti

Vyslání vlastní události z komponenty směrem k rodiči (`emit('remove', id)`). Ve Vue
nahrazuje prop typu `onRemove`, kterou by v Reactu poslal rodič dolů jako funkci.

## --term-- Composition API

en: Composition API
aliases: kompoziční API
lekce: vue-nuxt-druhy-framework/prevodni-tabulka#stav-usestate-a-ref

Dnešní styl psaní komponent Vue: funkce `setup` (nebo blok `<script setup>`), ve které
si stav i logiku skládáš z funkcí `ref`, `computed`, `watch`. Odpovídá hookům v Reactu.

## --term-- Options API

en: Options API
aliases: options API
lekce: vue-nuxt-druhy-framework/prevodni-tabulka#options-api-co-potkas-ve-starsim-kodu

Starší styl psaní komponent Vue: komponenta je objekt s pojmenovanými oddíly `data`,
`computed`, `methods`, `watch`. Ve Vue 3 funguje dál, takže ho v cizím kódu potkáš.

## --term-- reaktivní ref

en: ref
aliases: reaktivního refu, reaktivnímu refu, reaktivní refy, reaktivních refů, reaktivním refem
lekce: vue-nuxt-druhy-framework/reaktivita-vue#ref-je-krabicka-s-value

Krabička kolem jedné hodnoty, kterou vyrobí funkce `ref()`. V JavaScriptu se k hodnotě
dostaneš přes `.value`, v šabloně se `.value` nepíše. Zápis do `.value` spustí
překreslení všech míst, která hodnotu čtou.

## --term-- rozbalení refu

en: ref unwrapping
aliases: rozbalí ref, rozbalování refů, rozbalí se
lekce: vue-nuxt-druhy-framework/reaktivita-vue#ref-je-krabicka-s-value

Automatické dosazení `.value` tam, kde Vue ví, že jde o ref: v šabloně a uvnitř
objektu vyrobeného přes `reactive`. Jinde `.value` psát musíš.

## --term-- reactive

en: reactive
aliases: reactive objekt, reactive objektu
lekce: vue-nuxt-druhy-framework/reaktivita-vue#reactive-a-proc-ztraci-reaktivitu

Funkce, která z objektu udělá reaktivní Proxy. Čte se a zapisuje bez `.value`, ale
reaktivita drží jen na objektu — jakmile z něj hodnotu vytáhneš do proměnné, vazba se
ztratí.

## --term-- Proxy

en: Proxy
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
aliases: Proxy objekt, Proxy objektu
lekce: vue-nuxt-druhy-framework/reaktivita-vue#proxy-a-sledovani-zavislosti

Objekt JavaScriptu, který obaluje jiný objekt a umí zachytit každé čtení a každý zápis
vlastnosti. Vue na něm staví reaktivitu: při čtení si zapíše, kdo se ptal, při zápisu
ty čtenáře upozorní.

## --term-- sledování závislostí

en: dependency tracking
aliases: sledování závislosti, sledováním závislostí
lekce: vue-nuxt-druhy-framework/reaktivita-vue#proxy-a-sledovani-zavislosti

Mechanismus, kterým si Vue za běhu pamatuje, který efekt nebo která šablona četla
kterou reaktivní hodnotu. Díky němu nepotřebuje seznam závislostí psaný ručně jako
`useEffect`.

## --term-- computed

en: computed property
aliases: computed vlastnost, computed vlastnosti, computed hodnota, computed hodnoty
lekce: vue-nuxt-druhy-framework/reaktivita-vue#computed-se-pocita-jen-kdyz-je-potreba

Hodnota odvozená z jiných reaktivních hodnot. Výsledek si drží v cache a přepočítá se,
až když se některá z jejích závislostí změní.

## --term-- watch

en: watch
aliases: watcher, watchery, watcheru
lekce: vue-nuxt-druhy-framework/reaktivita-vue#watch-a-watcheffect-proti-useeffect

Funkce, která spustí zadaný kód po změně konkrétní sledované hodnoty. Dostane starou
i novou hodnotu a hodí se na vedlejší efekty, ne na odvozování dat.

## --term-- watchEffect

en: watchEffect
aliases: watchEffectu
lekce: vue-nuxt-druhy-framework/reaktivita-vue#watch-a-watcheffect-proti-useeffect

Varianta `watch`, která se spustí hned a sama si zapamatuje, které reaktivní hodnoty
při běhu přečetla. Seznam závislostí se nepíše.

## --term-- nextTick

en: nextTick
aliases: nextTicku
lekce: vue-nuxt-druhy-framework/reaktivita-vue#kdy-se-dom-skutecne-zmeni-nexttick

Funkce, která vrátí Promise splněnou ve chvíli, kdy Vue promítlo změny stavu do DOMu.
Bez ní bys hned po změně stavu četl ze stránky ještě starý obsah.

## --term-- jednosouborová komponenta

en: single-file component
aliases: SFC, jednosouborové komponenty, jednosouborových komponent, jednosouborovou komponentu
lekce: vue-nuxt-druhy-framework/sfc-a-pinia#jednosouborova-komponenta

Soubor `.vue`, ve kterém je šablona, skript i styly jedné komponenty pohromadě.
Prohlížeč ho nepřečte, překládá ho build (Vite s pluginem pro Vue).

## --term-- script setup

en: script setup
aliases: bloku script setup, blok script setup
lekce: vue-nuxt-druhy-framework/sfc-a-pinia#script-setup-a-co-vidi-sablona

Zápis `<script setup>` v jednosouborové komponentě. Co v něm vznikne na nejvyšší
úrovni, vidí šablona automaticky — není potřeba nic vracet.

## --term-- scoped styly

en: scoped styles
aliases: scoped styl, scoped stylů, scoped stylem
lekce: vue-nuxt-druhy-framework/sfc-a-pinia#scoped-styly

Blok `<style scoped>`, jehož pravidla build doplní o atribut jedinečný pro komponentu.
Selektor tak platí jen na značky té jedné komponenty.

## --term-- slot

en: slot
aliases: sloty, slotu, slotů, slotem, pojmenovaný slot, pojmenované sloty
lekce: vue-nuxt-druhy-framework/sfc-a-pinia#slot-misto-children

Místo v šabloně komponenty, kam rodič vloží vlastní obsah. Odpovídá tomu, čemu se
v Reactu říká `children`, jen jich komponenta může nabídnout víc a pojmenovaných.

## --term-- Pinia

en: Pinia
aliases: Pinii, Pinie, Pinií
lekce: vue-nuxt-druhy-framework/sfc-a-pinia#pinia-store-misto-kontextu

Oficiální knihovna na sdílený stav ve Vue. Store se definuje funkcí `defineStore`
a komponenta si ho vyžádá zavoláním — bez obalování stromu poskytovatelem.

## --term-- Vue Router

en: Vue Router
aliases: routeru Vue, router Vue
lekce: vue-nuxt-druhy-framework/sfc-a-pinia#vue-router-cesty-rucne

Oficiální směrovač Vue. Cesty se vypisují ručně do pole a vykresluje je
`<RouterView>`; v Nuxtu ho nastavuje framework sám podle adresáře `pages/`.

## --term-- Nuxt

en: Nuxt
aliases: Nuxtu, Nuxtem, Nuxtů
lekce: vue-nuxt-druhy-framework/nuxt-v-kostce#problem-vue-samo-o-sobe-je-jen-knihovna

Framework nad Vue, který k němu dodá routování ze souborů, vykreslování na serveru,
vlastní serverovou část a sestavení. Ve světě Vue hraje roli, jakou má Next.js
ve světě Reactu.

## --term-- automatický import

en: auto-import
aliases: automatické importy, automatických importů, automatickým importem
lekce: vue-nuxt-druhy-framework/nuxt-v-kostce#automaticke-importy

Zařízení Nuxtu, které za tebe doplní import komponent, composables a funkcí Vue podle
toho, kde soubor leží. Kód je kratší, ale původ jména není z importů poznat.

## --term-- useFetch

en: useFetch
aliases: useFetchem
lekce: vue-nuxt-druhy-framework/nuxt-v-kostce#data-usefetch-a-useasyncdata

Composable Nuxtu na načtení dat do komponenty. Požadavek proběhne při vykreslení na
serveru a výsledek se pošle klientovi v payloadu, takže se stejná data nestahují
podruhé.

## --term-- Nitro

en: Nitro
aliases: Nitra, Nitru
lekce: vue-nuxt-druhy-framework/nuxt-v-kostce#server-uvnitr-nuxtu-server-api

Serverová část Nuxtu. Obsluhuje soubory z `server/`, vykresluje stránky a sestaví se
do balíčku, který běží na Node, v edge runtime i jako serverless funkce.
