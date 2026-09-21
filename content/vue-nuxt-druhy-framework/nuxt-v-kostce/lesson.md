# Nuxt v kostce

V inzerátech na Vue pozice se skoro vždycky objeví i Nuxt — je to pro Vue to, co Next.js pro React. Tahle lekce je převodník: co v Nuxtu odpovídá kterému kusu Next.js, kde jsou jména jiná a kde je jiné i chování.

:::check pretest
V Next.js založíš novou stránku tím, že vytvoříš soubor ve složce `app/`. Jak myslíš, že se routa zakládá v Nuxtu?

### --answer--
Vypíše se do pole `routes` v konfiguraci, jako ve Vue Routeru.

#### --why--
Tak to vypadá v samotném Vue. Nuxt nad Vue Routerem staví a jednu věc kolem něj automatizuje.

### --correct--
Vytvořením souboru ve složce `pages/`.

#### --why--
Nuxt složku `pages/` přečte a pole rout z ní sestaví sám.

### --answer--
Zaregistruje se voláním `router.addRoute()` při startu aplikace.

#### --why--
To je způsob, jak přidat routu za běhu. Zakládání běžných stránek je v Nuxtu jednodušší.
:::

:::check pretest
Napíšeš `const data = await $fetch('/api/menu')` v setupu stránky, kterou Nuxt vykresluje na serveru i v prohlížeči. Kolikrát se ten požadavek na `/api/menu` celkem odešle?

### --expected--
dvakrát

### --accept--
2
2x
dvakrát, na serveru i v prohlížeči

### --why--
Setup proběhne jednou na serveru a podruhé při hydrataci v prohlížeči. Právě tomuhle se vyhýbá `useFetch`, které výsledek přenese v payloadu.
:::

## Problém: Vue samo o sobě je jen knihovna

Když postavíš aplikaci z `vue` a `vue-router`, dostaneš jeden `index.html` s prázdným `<div id="app">`. Prohlížeč stáhne JavaScript, ten aplikaci vykreslí a teprve pak se objeví obsah. Robot vyhledávače uvidí prázdnou stránku, uživatel na pomalém připojení bílou obrazovku a odkaz na detail knihy nepůjde poslat do chatu, protože náhled nic nenajde.

Znáš to ze sekce o Next.js: na tohle se vymyslelo vykreslování na serveru. Kolem něj je ale potřeba postavit server, sestavení, routování, načítání dat a přenos výsledku do prohlížeče, aby se práce nedělala dvakrát. [[Nuxt|Nuxt]] je framework, který tohle všechno dodá k Vue v jednom balíku.

> [!REMEMBER]
> **Nuxt je k Vue to, co Next.js k Reactu: server, routy ze souborů a načítání dat, které proběhne jednou a výsledek pošle do prohlížeče.** Vue zůstává beze změny — všechno, co umíš o `ref`, `computed` a komponentách, platí dál.

:::check
Proč je u aplikace složené jen z `vue` a `vue-router` problém se sdílením odkazů na sociální sítě? Odpověz jednou větou.

### --expected--
Protože robot dostane prázdné HTML a obsah se doplní až JavaScriptem.

### --accept--
V HTML nic není, obsah vykreslí až JavaScript v prohlížeči.
Náhled čte HTML, které je prázdné.

### --why--
Roboti sociálních sítí obvykle JavaScript nespouštějí. Vykreslení na serveru jim dá hotové HTML i s titulkem a popisem.
:::

## Routy ze souborů: `pages/`

Nuxt sestaví routy podle souborů ve složce `pages/`. Jméno souboru je cesta, složka je vnoření, hranaté závorky jsou dynamický segment:

```text
pages/
├── index.vue              →  /
├── menu.vue               →  /menu
├── jidla/
│   ├── index.vue          →  /jidla
│   └── [id].vue           →  /jidla/42
└── [...cesta].vue         →  cokoli nenalezeného
```

V `app.vue` (obdoba kořenového layoutu) je `<NuxtPage />`, na místě, kam se má stránka vykreslit. Odkazy se píšou `<NuxtLink to="/jidla/42">`, aby přechod proběhl bez načtení celé stránky.

Sdílený obal je v `layouts/default.vue` a uvnitř má `<slot />`. Stránka si jiný layout vybere přes `definePageMeta({ layout: 'admin' })`, což je protějšek exportu `metadata` a vnořených layoutů v Next.js. Parametr z adresy přečteš přes `useRoute()`:

```vue
<script setup>
const route = useRoute();
const id = route.params.id;
</script>
```

> [!NOTE]
> Ruční zápis rout přes `createRouter` ze [[Vue Router|Vue Routeru]] tím nezmizel — Nuxt ho jen vyplní za tebe. Podrobnosti o `<RouterLink>` a `useRoute` jsou v lekci [SFC, Pinia a Vue Router](see:vue-nuxt-druhy-framework/sfc-a-pinia#vue-router-cesty-rucne).

:::check
Jaký soubor založíš, aby v Nuxtu vznikla routa `/kavy/kolumbie`, kde je poslední část adresy dynamická? Napiš cestu od složky `pages/`.

### --expected--
pages/kavy/[id].vue

### --accept--
kavy/[id].vue
pages/kavy/[slug].vue
kavy/[slug].vue

### --why--
Složka je vnoření, hranaté závorky jsou dynamický segment. Jméno uvnitř závorek si volíš sám — pod tím jménem ho pak najdeš v `route.params`.
:::

## Automatické importy

V Nuxtu nepíšeš `import { ref } from 'vue'` ani `import KartaJidla from '../components/KartaJidla.vue'`. Vue API, vlastní composables ze složky `composables/`, komponenty z `components/` a pomocníky Nuxtu (`useFetch`, `useRoute`, `navigateTo`) jsou k dispozici rovnou. Říká se tomu [[automatický import|automatické importy]] a Nuxt je doplní při sestavení.

```vue
<script setup>
const pocet = ref(0);           // ref se neimportuje
const { data } = await useFetch('/api/menu');
</script>

<template>
  <KartaJidla v-for="jidlo in data" :key="jidlo.id" :jidlo="jidlo" />
</template>
```

Za pohodlí se platí dvěma věcmi. První: ve zdroji nevidíš, odkud jméno pochází, takže hledání původu funkce je otázka na editor, ne na soubor. Druhá: kolize jmen. Když si založíš `composables/useFetch.ts`, přepíšeš tím ten z Nuxtu a chyba se projeví někde úplně jinde.

> [!TIP]
> Když chceš mít import vidět (nebo ho potřebuješ v obyčejném `.ts` souboru mimo komponenty), napiš ho z `#imports`: `import { ref, useFetch } from '#imports'`. Funguje to i v projektech, kde jsou automatické importy vypnuté.

:::check
Založíš `composables/useMena.ts` s exportem `export function useMena() {…}`. Co musíš dopsat do stránky, abys `useMena()` mohl zavolat?

### --expected--
nic

### --accept--
nic, composable se importuje automaticky
žádný import

### --why--
Složka `composables/` se importuje automaticky, stejně jako `components/`. Import bys psal jen tehdy, kdybys funkci uložil jinam nebo měl automatické importy vypnuté.
:::

## Data: `useFetch` a `useAsyncData`

Tohle je místo, kde se Nuxt od Next.js liší nejvíc. V Next.js načteš data v [[serverová komponenta|serverové komponentě]] obyčejným `await fetch(…)` a klientovi pošleš hotové HTML. Nuxt nemá serverové komponenty — stránka je jedna komponenta Vue, která se vykreslí **dvakrát**: jednou na serveru a podruhé při [[hydratace|hydrataci]] v prohlížeči.

Kdyby se v ní volalo `$fetch` napřímo, požadavek by se odeslal taky dvakrát. Proto má Nuxt [[useFetch|useFetch]]:

```vue
<script setup>
const { data: jidla, pending, error, refresh } = await useFetch('/api/menu', {
  key: 'menu',
  lazy: false,
});
</script>

<template>
  <p v-if="pending">Načítám denní menu…</p>
  <p v-else-if="error">Menu se nepodařilo načíst.</p>
  <ul v-else>
    <li v-for="jidlo in jidla" :key="jidlo.id">{{ jidlo.nazev }} — {{ jidlo.cena }} Kč</li>
  </ul>
  <button type="button" @click="refresh()">Aktualizovat</button>
</template>
```

Co se stane: požadavek proběhne na serveru, výsledek se uloží do **payloadu** (kus JSON vložený do HTML) a v prohlížeči si ho `useFetch` pod stejným klíčem `key` vyzvedne místo toho, aby se ptal znovu. `pending` a `error` dostaneš zadarmo, `refresh()` data načte znovu na vyžádání.

Tři varianty, které si nesmíš plést:

| co | kdy použít |
|---|---|
| `useFetch(url)` | data pro vykreslení stránky; hlídá dvojí běh, vrací `data`, `pending`, `error` |
| `useAsyncData(key, () => …)` | to samé, ale data si obstaráš vlastní funkcí (víc dotazů, databáze, SDK) |
| `$fetch(url)` | požadavek vyvolaný akcí uživatele (odeslání formuláře, mazání) — až po vykreslení |

`lazy: true` znamená „nečekej na data a vykresli stránku hned" — pak musíš v šabloně počítat s tím, že `data` je zpočátku `null`.

Ukázka níž je obyčejná Vue komponenta, která tři stavy `useFetch` napodobuje. Zkus změnit `selze` na `true` a sleduj, která větev šablony se vykreslí.

:::live vue
```html
<div id="app" class="app">
  <h1>Denní menu</h1>
  <p v-if="pending" class="muted">Načítám denní menu…</p>
  <p v-else-if="error" class="error">Menu se nepodařilo načíst.</p>
  <ul v-else class="list">
    <li v-for="jidlo in data" :key="jidlo.id">
      <span>{{ jidlo.nazev }}</span>
      <strong>{{ jidlo.cena }} Kč</strong>
    </li>
  </ul>
  <button type="button" @click="nacti">Aktualizovat</button>
</div>
```
```css
body { font-family: system-ui, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 1.5rem; }
.app { max-width: 26rem; margin: 0 auto; background: #fff; padding: 1.25rem 1.5rem; border-radius: 0.75rem; box-shadow: 0 0.75rem 2rem rgb(15 23 42 / 0.12); }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
.list { list-style: none; margin: 0 0 1rem; padding: 0; }
.list li { display: flex; justify-content: space-between; padding: 0.5rem 0; border-top: 1px solid #e2e8f0; }
.muted { color: #64748b; }
.error { color: #b91c1c; }
button { border: 0; border-radius: 0.5rem; padding: 0.4rem 0.8rem; background: #0d9488; color: #fff; cursor: pointer; }
```
```js
import { createApp, ref } from 'vue';

const selze = false;

const menu = [
  { id: 1, nazev: 'Svíčková na smetaně', cena: 189 },
  { id: 2, nazev: 'Čočka na kyselo s vejcem', cena: 149 },
  { id: 3, nazev: 'Pečené kuře s bramborem', cena: 169 },
];

createApp({
  setup() {
    const data = ref(null);
    const pending = ref(false);
    const error = ref(null);

    function nacti() {
      pending.value = true;
      error.value = null;
      setTimeout(() => {
        if (selze) error.value = new Error('503');
        else data.value = menu;
        pending.value = false;
      }, 600);
    }

    nacti();
    return { data, pending, error, nacti };
  },
}).mount('#app');
```
:::

:::explain
Vysvětli vlastními slovy, proč `await $fetch('/api/menu')` v setupu stránky odešle požadavek dvakrát, zatímco `useFetch('/api/menu')` jen jednou.

## --model--
Stránka v Nuxtu se vykreslí dvakrát: nejdřív na serveru, aby vzniklo HTML, a podruhé v prohlížeči při hydrataci. Setup tedy proběhne dvakrát, a `$fetch` je obyčejné volání — proběhne pokaždé, když se na něj přijde. `useFetch` si výsledek serverového běhu uloží pod klíčem do payloadu, který se pošle spolu s HTML. V prohlížeči si ho pod stejným klíčem vyzvedne a další požadavek už neposílá.

## --checklist--
- Setup stránky proběhne dvakrát: na serveru a při hydrataci.
- `$fetch` je běžné volání, takže se vykoná v obou bězích.
- `useFetch` uloží výsledek do payloadu ke klíči.
- V prohlížeči se místo požadavku použije hodnota z payloadu.
:::

:::check
Uživatel klikne na „Smazat rezervaci" a ty chceš poslat `DELETE` na vlastní endpoint. Kterou z trojice `useFetch`, `useAsyncData`, `$fetch` použiješ?

### --expected--
$fetch

### --accept--
$fetch()

### --why--
`useFetch` a `useAsyncData` patří do setupu a jejich úkolem je připravit data pro vykreslení. Požadavek vyvolaný akcí uživatele proběhne až potom, a tak je na něj obyčejné `$fetch`.
:::

## Server uvnitř Nuxtu: `server/api/`

Vlastní API nepotřebuje zvláštní projekt. Soubor ve složce `server/api/` se stane endpointem, přípona v názvu určuje metodu:

```ts
// server/api/menu.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const jidla = await dejMenu(String(query.den ?? 'dnes'));
  if (!jidla.length) {
    throw createError({ statusCode: 404, statusMessage: 'Na tenhle den menu nemáme' });
  }
  return jidla;
});
```

Soubor `server/api/menu.get.ts` obslouží `GET /api/menu`, `menu.post.ts` obslouží `POST`. Vrácená hodnota se automaticky převede na JSON, chyba se hlásí přes `createError`. Je to protějšek route handleru v Next.js, jen s jinými jmény funkcí.

Pod tím vším běží [[Nitro|Nitro]] — serverová část Nuxtu, která z projektu umí vyrobit balíček pro Node, Denu i různé edge platformy. Díky ní je `server/api/` jediná věc, kterou musíš pro vlastní backend udělat.

> [!TIP]
> Uvnitř Nuxtu volej vlastní endpointy přes `useFetch('/api/menu')` bez domény. Při běhu na serveru si Nitro odpověď vezme přímo, bez skutečného HTTP požadavku po síti.

:::check
Jak pojmenuješ soubor ve složce `server/api/`, aby obsloužil `POST /api/rezervace`? Napiš jméno souboru.

### --expected--
rezervace.post.ts

### --accept--
rezervace.post.js
server/api/rezervace.post.ts

### --why--
Jméno před první tečkou je cesta, část za ní metoda. Bez `.post` by soubor obsloužil všechny metody.
:::

## Režimy vykreslování a `nuxt.config`

Konfigurace bydlí v `nuxt.config.ts` a rozhoduje mimo jiné o tom, kde se stránka vykreslí:

```ts
export default defineNuxtConfig({
  ssr: true,
  modules: ['@pinia/nuxt'],
  routeRules: {
    '/': { prerender: true },
    '/menu': { isr: 600 },
    '/admin/**': { ssr: false },
  },
});
```

- `ssr: true` (výchozí) — každý požadavek vykreslí server, prohlížeč dostane hotové HTML.
- `ssr: false` — z Nuxtu se stane běžná SPA, stejná jako čisté Vue. Hodí se pro administraci za přihlášením.
- `nuxt generate` — vygeneruje statické HTML pro všechny routy dopředu (obdoba SSG).
- `routeRules` — nastavení pro jednotlivé cesty, včetně ISR (`isr: 600` znamená přegenerovat nejvýš jednou za 10 minut). Díky nim může mít jedna aplikace každou routu jinak.

Rozdělení je tedy stejné jako v Next.js, jen se jinak zapisuje: tam volíš strategii komponentou a exportem, tady jedním souborem s pravidly.

:::check
Do které části `nuxt.config.ts` napíšeš, že se má administrace vykreslovat jen v prohlížeči, zatímco zbytek webu zůstane na serveru? Napiš jméno klíče.

### --expected--
routeRules

### --accept--
routeRules: { '/admin/**': { ssr: false } }

### --why--
`ssr: false` na nejvyšší úrovni by vypnulo server pro celý web. `routeRules` umožní mít každou cestu jinak.
:::

## Nuxt a Next.js vedle sebe

| věc | Next.js (App Router) | Nuxt |
|---|---|---|
| routa | soubor `app/jidla/[id]/page.tsx` | soubor `pages/jidla/[id].vue` |
| layout | `app/layout.tsx` s `children` | `layouts/default.vue` se `<slot />` |
| odkaz | `<Link href="/menu">` | `<NuxtLink to="/menu">` |
| parametr z adresy | `params` (Promise) | `useRoute().params` |
| načtení dat pro stránku | `await fetch()` v serverové komponentě | `useFetch()` / `useAsyncData()` |
| akce uživatele proti serveru | serverová akce (`"use server"`) | `$fetch('/api/…')` na endpoint |
| vlastní endpoint | `app/api/menu/route.ts` | `server/api/menu.get.ts` |
| metadata stránky | `export const metadata` | `useSeoMeta()` / `definePageMeta` |
| stav sdílený mezi stránkami | kontext, Zustand | `useState()`, [[Pinia|Pinia]] |
| hranice server/klient | `"use client"` | žádná — všechno je klientské i serverové |

Poslední řádek je nejdůležitější rozdíl. V Next.js přemýšlíš, jestli je komponenta serverová, nebo [[klientská komponenta|klientská]]. V Nuxtu tahle otázka neexistuje: **každá komponenta běží na obou stranách**, a tak musí být napsaná tak, aby na serveru nesáhla na `window` a na klientovi na souborový systém.

:::check
Která věc z Next.js nemá v Nuxtu protějšek, protože tam komponenty běží na serveru i v prohlížeči zároveň?

### --answer--
Složka pro vlastní endpointy.

#### --why--
Endpointy v Nuxtu jsou, jen bydlí jinde a jmenují se jinak.

### --correct--
Direktiva `"use client"` a rozdělení na serverové a klientské komponenty.

#### --why--
V Nuxtu se každá komponenta vykreslí na serveru i po hydrataci v prohlížeči, takže není co oddělovat.

### --answer--
Načítání dat před vykreslením stránky.

#### --why--
Data se před vykreslením načítají v obou frameworcích, jen jinými funkcemi.
:::

## Typické chyby a pasti

Ukázka níž má dvě komponenty a jeden `ref` deklarovaný na úrovni modulu. Předpověz, co se stane po kliknutí.

:::live vue predict
```html
<div id="app">
  <pocitadlo-a></pocitadlo-a>
  <pocitadlo-b></pocitadlo-b>
</div>

<template id="pocitadlo-a">
  <p>Návštěvník A vidí: {{ pocet }} <button @click="pocet += 1">Přidej</button></p>
</template>

<template id="pocitadlo-b">
  <p>Návštěvník B vidí: {{ pocet }}</p>
</template>
```
```css
body { font-family: system-ui, sans-serif; padding: 1rem; color: #1e293b; }
button { margin-left: 0.5rem; }
```
```js
import { createApp, ref } from 'vue';

const pocet = ref(0);

const app = createApp({});

app.component('PocitadloA', { setup: () => ({ pocet }), template: '#pocitadlo-a' });
app.component('PocitadloB', { setup: () => ({ pocet }), template: '#pocitadlo-b' });

app.mount('#app');
```
--question-- Co ukáže druhá komponenta po dvou kliknutích v té první?
--option-- Zůstane na 0, každá komponenta má vlastní kopii.
--option*-- Ukáže 2, obě komponenty čtou tentýž ref z modulu.
--option-- Ukáže 2, ale až po obnovení stránky.
--why-- `ref` vznikl jednou při vyhodnocení modulu, ne při vytvoření komponenty. Obě instance proto sdílejí tutéž hodnotu. V prohlížeči je to jen zvláštní, na serveru v Nuxtu je to bezpečnostní chyba: modul se vyhodnotí jednou pro celý proces, takže by se hodnota sdílela mezi všemi návštěvníky. Proto má Nuxt `useState('klic', () => 0)`, které drží stav zvlášť pro každý požadavek. Zkus ref přesunout dovnitř `setup` a sleduj, jak se čísla oddělí.
:::

> [!PITFALL]
> **Stav v proměnné modulu.** Příznak: ve vývoji všechno funguje, na produkci vidí jeden uživatel data druhého. Stav sdílený mezi stránkami patří do `useState('klic', () => …)` nebo do Pinie, ne do `const x = ref()` na úrovni modulu.

> [!PITFALL]
> **`window is not defined` při sestavení nebo prvním načtení.** Kód v `setup` běží i na serveru, kde `window`, `document` ani `localStorage` neexistují. Oprava: sáhnout na ně až v `onMounted`, nebo obalit podmínkou `if (import.meta.client)`.

> [!PITFALL]
> **[[nesoulad při hydrataci|Nesoulad při hydrataci]]** (`Hydration node mismatch`). Příznak: obsah v konzoli varuje a stránka po hydrataci „poskočí". Vzniká, když se server a prohlížeč rozejdou — typicky `new Date().toLocaleTimeString()` nebo `Math.random()` v šabloně. Oprava: hodnotu spočítat jednou a poslat v datech, nebo ji vykreslit až v `onMounted`.

> [!PITFALL]
> **`useFetch` v obsluze události.** Příznak: data se načtou, ale při dalším kliknutí se nic neděje, nebo v konzoli svítí varování o composable mimo setup. `useFetch` patří do setupu. Pro akci uživatele je `$fetch`.

:::check
Napiš podmínku, kterou obalíš přístup k `localStorage` v Nuxtu, aby kód nespadl na serveru.

### --expected--
if (import.meta.client)

### --accept--
import.meta.client
if (import.meta.client) { … }
if (process.client)

### --why--
`import.meta.client` je pravda jen v prohlížeči. Druhá možnost je sáhnout na `localStorage` až v `onMounted`, který na serveru vůbec neproběhne.
:::

## Kde to najdeš v MDN

- [Nuxt: Data Fetching](https://nuxt.com/docs/getting-started/data-fetching) — rozdíl mezi `useFetch`, `useAsyncData` a `$fetch` včetně payloadu.
- [Nuxt: Server Directory](https://nuxt.com/docs/guide/directory-structure/server) — jak se z názvu souboru stane endpoint a co umí `defineEventHandler`.
- [Nuxt: Rendering Modes](https://nuxt.com/docs/guide/concepts/rendering) — SSR, SSG, hybridní režim a `routeRules` na jednom místě.
- [MDN: `import.meta`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta) — objekt, do kterého Nuxt doplňuje `client` a `server`.

# --questions--

## --question--

Stránka v Nuxtu potřebuje seznam jídel k vykreslení. Kterou funkcí data načteš, aby se požadavek neodeslal podruhé při hydrataci? Napiš jméno funkce.

### --expected--
useFetch

### --accept--
useAsyncData
useFetch()

### --why--
`useFetch` uloží výsledek do payloadu pod klíč a v prohlížeči si ho odtud vyzvedne. `useAsyncData` dělá totéž, jen si data obstaráš vlastní funkcí.

### --see--

vue-nuxt-druhy-framework/nuxt-v-kostce#data-usefetch-a-useasyncdata

## --question--

Proč je `const uzivatel = ref(null)` na úrovni modulu v Nuxtu nebezpečnější než v čistě prohlížečové aplikaci?

### --answer--
Protože Nuxt moduly vyhodnocuje při každém přechodu mezi stránkami znovu.

#### --why--
Modul se vyhodnotí jednou. Zamysli se, kde ten jeden běh v Nuxtu žije a kdo všechno k němu má přístup.

### --correct--
Protože na serveru se modul vyhodnotí jednou pro celý proces, takže by hodnotu sdíleli všichni návštěvníci.

#### --why--
Serverový proces obsluhuje všechny požadavky. Stav, který má patřit jednomu uživateli, proto patří do `useState` nebo do storu.

### --answer--
Protože `ref` mimo komponentu není reaktivní.

#### --why--
Reaktivita s místem deklarace nesouvisí, ref funguje i v modulu. Problém je v tom, kdo tu hodnotu vidí.

### --see--

vue-nuxt-druhy-framework/nuxt-v-kostce#typicke-chyby-a-pasti

## --question--

Napiš cestu souboru, který v Nuxtu obslouží `GET /api/rezervace`.

### --expected--
server/api/rezervace.get.ts

### --accept--
server/api/rezervace.get.js
server/api/rezervace.ts

### --why--
Složka `server/api/` dává cestu, část názvu za tečkou metodu. Bez `.get` soubor obslouží všechny metody.

### --see--

vue-nuxt-druhy-framework/nuxt-v-kostce#server-uvnitr-nuxtu-server-api

## --question--

**Opakování z dřívějška.** Co v Next.js znamená direktiva `"use client"` na začátku souboru?

### --answer--
Že se komponenta vykreslí jen v prohlížeči a na serveru se přeskočí.

#### --why--
Klientská komponenta se na serveru taky vykreslí — jinak by v HTML nebyla. Rozmysli si, co direktiva mění dál v importech.

### --correct--
Že tenhle soubor a všechno, co z něj importuje, patří do klientského balíku a smí používat stav a události.

#### --why--
Je to hranice, ne přepínač: od ní dolů se komponenty posílají do prohlížeče a hydratují se.

### --answer--
Že se kód nesmí vykonat na serveru, a proto v něm smí být `window`.

#### --why--
Na `window` v těle komponenty bys narazil i tady. Direktiva neurčuje, kde kód běží, ale kam patří.

### --see--

next-fullstack/server-a-client-komponenty#use-client-hranice-ne-prepinac

## --question--

**Opakování z dřívějška.** Jak se jmenuje chyba, kdy se HTML vykreslené na serveru neshoduje s tím, co v prohlížeči vyrobí JavaScript? Napiš jedno slovo.

### --expected--
nesoulad

### --accept--
nesoulad při hydrataci
hydration mismatch

### --why--
Vzniká, když se ve vykreslení objeví něco, co je na serveru a v prohlížeči jiné — čas, náhodné číslo, hodnota z `localStorage`. Platí to v Nuxtu stejně jako v Next.js.

### --see--

next-fullstack/ssr-csr-ssg#co-nesoulad-zpusobuje
