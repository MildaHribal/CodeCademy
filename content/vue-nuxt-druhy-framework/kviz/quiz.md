---
pass: 0.8
---

# --questions--

## --question--

V `setup()` máš `const pocet = ref(0)`. Napiš výraz, kterým v JavaScriptu (ne v šabloně) zvýšíš počet o jedna.

### --expected--

pocet.value += 1

### --accept--

pocet.value++
pocet.value = pocet.value + 1
++pocet.value

### --why--

`ref` je krabička, hodnota je uvnitř pod `.value`. V JavaScriptu proto pracuješ vždycky s `pocet.value`; `pocet += 1` by k objektu jen přilepilo text. V šabloně je to naopak — tam Vue krabičku rozbalí samo.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#ref-je-krabicka-s-value

## --question--

Co vypíše `console.log` po kliknutí, když v `#pocet` stálo `0`?

```js
const pocet = ref(0);

function klik() {
  pocet.value = 5;
  console.log(document.querySelector('#pocet').textContent);
}
```

### --expected--

0

### --why--

Vue nepřekresluje okamžitě — změny si posbírá a DOM upraví až v nejbližší mikroúloze. Hned po přiřazení je proto ve stránce ještě stará hodnota. Novou uvidíš po `await nextTick()`, což je přesně situace, kdy potřebuješ změřit prvek nebo do něj skočit fokusem.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#kdy-se-dom-skutecne-zmeni-nexttick

## --question--

Co vypíše poslední řádek?

```js
const stav = reactive({ pocet: 1 });
const { pocet } = stav;
stav.pocet = 5;
console.log(pocet);
```

### --expected--

1

### --why--

Destrukturalizace přečte hodnotu **v ten okamžik** a uloží ji do obyčejné proměnné. Proxy o téhle proměnné neví, takže pozdější zápis do `stav.pocet` s ní nic neudělá. Spojení udrží `toRefs(stav)`.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#reactive-a-proc-ztraci-reaktivitu

## --question--

Kolikrát se vypíše `počítám`?

```js
const cena = ref(100);
const sDani = computed(() => {
  console.log('počítám');
  return cena.value * 1.21;
});

console.log(sDani.value);
console.log(sDani.value);
```

### --expected--

1

### --accept--

jednou
1x

### --why--

`computed` si výsledek uloží a drží ho, dokud se nezmění něco, z čeho počítal. Druhé čtení proto dostane uloženou hodnotu a funkce se znovu nespustí. Kdybys mezi čtení vložil `cena.value = 200`, vypsalo by se `počítám` podruhé.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#computed-se-pocita-jen-kdyz-je-potreba

## --question--

Čím se `watch(zdroj, callback)` liší od `useEffect(callback, [zdroj])`?

### --answer--

`watch` běží před vykreslením, `useEffect` až po něm.

#### --why--

Kdy přesně callback běží, se dá u obou nastavit. Zamysli se radši nad tím, co se stane hned po připojení komponenty.

### --correct--

`watch` se po připojení komponenty sám nespustí, `useEffect` ano.

#### --why--

`useEffect` proběhne po prvním vykreslení vždycky. `watch` čeká na první **změnu** zdroje; když chceš chování jako v Reactu, řekneš si o `{ immediate: true }`.

### --answer--

`watch` sleduje všechno, co v callbacku přečteš, `useEffect` jen pole závislostí.

#### --why--

Tohle je popis jiné funkce z Vue — té, která si závislosti hlídá sama a žádný seznam zdrojů nedostává.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#watch-a-watcheffect-proti-useeffect

## --question--

Napiš otvírací značku `<li>`, která vypíše jednu položku z pole `polozky` (proměnná `polozka`) a dá jí stabilní klíč `polozka.id`.

### --expected--

```html
<li v-for="polozka in polozky" :key="polozka.id">
```

### --accept--

```html
<li v-for="polozka in polozky" v-bind:key="polozka.id">
```

```html
<li :key="polozka.id" v-for="polozka in polozky">
```

### --why--

`v-for` je direktiva na prvku, který se opakuje — ne na obalu, jak by leckoho svádělo `map` v JSX. Klíč se váže přes `:key`, protože `polozka.id` je výraz, ne text.

### --see--

vue-nuxt-druhy-framework/prevodni-tabulka#seznamy-a-podminky

## --question--

Rodič poslouchá `<PolozkaKosiku @smazat="smazPolozku" />`. Jak potomek událost pošle?

### --answer--

Zavolá `props.smazat(id)`, stejně jako callback prop v Reactu.

#### --why--

V Reactu je předaná funkce jediná cesta, Vue má ale pro tohle vlastní kanál — a komponenta o něm musí dát vědět.

### --correct--

Ohlásí událost v `defineEmits` a zavolá `emit('smazat', id)`.

#### --why--

Vue oddělí vstupy (props) od výstupů (události). Rodič si událost odchytí přes `@smazat`, potomek o funkci rodiče nic neví.

### --answer--

Sáhne na rodiče přes `this.$parent.smazPolozku(id)`.

#### --why--

Komponenta, která zná jméno metody svého rodiče, se nedá použít nikde jinde. Vue nabízí cestu, která rodiče nejmenuje.

### --see--

vue-nuxt-druhy-framework/prevodni-tabulka#props-a-udalosti

## --question--

Co udělá `<input v-model="jmeno">` navíc oproti `<input :value="jmeno">`?

### --answer--

Nic, `v-model` je jen kratší zápis pro `:value`.

#### --why--

Kdyby to bylo totéž, nedalo by se do pole psát: hodnota by se po každém stisku vrátila zpátky. Chybí druhá polovina.

### --correct--

Přidá posluchače `input`, který zapíše napsanou hodnotu zpátky do `jmeno`.

#### --why--

`v-model` je zkratka za vazbu hodnoty **a** posluchače, který ji aktualizuje. Přesně to, co v Reactu píšeš u řízeného pole ručně jako `value` plus `onChange`.

### --answer--

Zapisuje do pole přímo v DOM a obejde tím reaktivitu.

#### --why--

Vue se DOM nikdy nedotýká mimo své vykreslování — jinak by se mu stránka rozešla s daty.

### --see--

vue-nuxt-druhy-framework/prevodni-tabulka#formulare-v-model-misto-rizeneho-pole

## --question--

Napiš celou otvírací značku bloku stylů v `.vue` souboru, jehož pravidla platí jen pro tuhle komponentu.

### --expected--

```html
<style scoped>
```

### --why--

Vue při sestavení přidá prvkům komponenty atribut navíc (`data-v-abc123`) a do každého selektoru ho doplní. Bez `scoped` je to obyčejné globální CSS, které přepíše i cizí komponenty.

### --see--

vue-nuxt-druhy-framework/sfc-a-pinia#scoped-styly

## --question--

Proč `const { polozky } = useKosik()` přestane reagovat na změny, zatímco `const { polozky } = storeToRefs(useKosik())` funguje?

### --answer--

Protože `useKosik()` vrací Promise a destrukturalizace z ní vytáhne `undefined`.

#### --why--

Store se zakládá synchronně a `polozky` z něj vytáhneš bez problému — jednou. Jde o to, co ti v proměnné zůstane potom.

### --correct--

Destrukturalizace vytáhne ze store jen hodnotu, kdežto `storeToRefs` vrátí refy, které spojení se store udrží.

#### --why--

Store je uvnitř reaktivní objekt, takže platí totéž co u `reactive`: vytažená proměnná je odpojená kopie. `storeToRefs` proto obalí každou vlastnost do refu.

### --answer--

Protože store je zmrazený objekt a nejde z něj destrukturalizovat.

#### --why--

Destrukturalizace projde a kód se nerozbije — proto je ta chyba zákeřná. Problém se projeví až při první změně.

### --see--

vue-nuxt-druhy-framework/sfc-a-pinia#pinia-store-misto-kontextu

## --question--

V projektu Nuxt chceš stránku na adrese `/kontakt`. Napiš cestu k souboru, který ji vytvoří.

### --expected--

pages/kontakt.vue

### --accept--

/pages/kontakt.vue
pages/kontakt/index.vue

### --why--

Routy v Nuxtu vznikají ze souborů v `pages/`, stejně jako v Nextu ze složek v `app/`. Rozdíl je v tom, že jméno souboru je rovnou adresa — žádný `page.tsx` uvnitř složky.

### --see--

vue-nuxt-druhy-framework/nuxt-v-kostce#routy-ze-souboru-pages

## --question--

Pod jakou adresou se v Nuxtu ozve soubor `server/api/produkty.get.ts`?

### --expected--

/api/produkty

### --accept--

api/produkty

### --why--

Nuxt z `server/api/` skládá adresy pro Nitro, přípona `.get` určuje metodu HTTP. Soubor tedy obslouží `GET /api/produkty`, `POST` by potřeboval `produkty.post.ts`.

### --see--

vue-nuxt-druhy-framework/nuxt-v-kostce#server-uvnitr-nuxtu-server-api

## --question--

**Opakování z dřívějška.** V Reactu bys drahý výpočet nad seznamem obalil do `useMemo(() => spocitej(seznam), [seznam])`. Ve Vue napíšeš `computed(() => spocitej(seznam.value))` a žádné pole závislostí nepřidáváš. Proč ho `computed` nepotřebuje?

### --answer--

Protože `computed` se přepočítá při každé změně čehokoli na stránce, seznam závislostí by k ničemu nebyl.

#### --why--

To by bylo horší než `useMemo` bez optimalizace. Vue naopak ví přesně, na čem výpočet závisí — jen se to nedozvídá z pole, které napíšeš.

### --correct--

Při prvním výpočtu si Vue zapamatuje, které reaktivní hodnoty funkce přečetla, a od té chvíle sleduje právě je.

#### --why--

Čtení jde přes Proxy, takže se každý přístup dá zaznamenat. Seznam závislostí proto nemůže být neúplný ani zastaralý — na rozdíl od ručně psaného pole v Reactu.

### --answer--

Protože se `computed` spočítá jednou při vytvoření a dál se nemění.

#### --why--

To by byla obyčejná konstanta. Odvozená hodnota se změnit musí, jinak by se souhrn rozešel se seznamem.

### --see--

react-hloubka/render-a-rerender#usememo-usecallback-a-react-compiler

## --question--

**Opakování z dřívějška.** V Reactu zvýší tenhle kód počet jen o jedna, i když je `setPocet` zavolané třikrát. Ve Vue by `pocet.value += 1` třikrát za sebou přidalo tři. Proč se React chová jinak?

```jsx
function pridejTri() {
  setPocet(pocet + 1);
  setPocet(pocet + 1);
  setPocet(pocet + 1);
}
```

### --answer--

Protože React změny stavu zahazuje a použije jen poslední volání.

#### --why--

React žádné volání nezahazuje, všechna tři zpracuje. Zajímavější je, jakou hodnotu `pocet` v té funkci má.

### --correct--

`pocet` je pro celý render zmrazený snímek, takže všechna tři volání počítají ze stejné hodnoty.

#### --why--

Ve funkci je `pocet` obyčejná konstanta z tohoto renderu. Vue naopak drží hodnotu v krabičce, kterou čteš a měníš na místě, takže každá změna staví na předchozí. V Reactu totéž zařídí funkce aktualizace `setPocet((p) => p + 1)`.

### --answer--

Protože se `setPocet` ve Vue i v Reactu provede až po překreslení, ale React mezitím komponentu odpojí.

#### --why--

Nic se neodpojuje a komponenta běží dál. Rozdíl je v tom, co je za hodnotu `pocet` uvnitř té funkce.

### --see--

react-zaklady/stav-jako-snimek#stav-je-snimek-renderu

## --question--

**Opakování z dřívějška.** Seznam v Reactu i ve Vue chce u každé položky `key`. Proč ho oba frameworky potřebují?

### --answer--

Aby se položky daly najít v DOM podle `id`, když na ně klikneš.

#### --why--

Hledání v DOM zařídí selektory a obsluhy událostí; `key` se v HTML vůbec neobjeví. Jde o něco, co framework řeší při porovnávání dvou vykreslení.

### --correct--

Podle klíče framework pozná, která položka je která, když se seznam změní — a překreslí jen to, co se skutečně změnilo.

#### --why--

Bez klíče se položky porovnávají podle pořadí, takže smazání první položky vypadá jako změna všech ostatních. S tím jde ruku v ruce past s indexem jako klíčem.

### --answer--

Aby se položky vypisovaly v pořadí, v jakém jsou v poli.

#### --why--

Pořadí drží samo pole, klíč do něj nemluví. Zkus si představit, co framework dělá, když se seznam vykreslí **podruhé**.

### --see--

react-zaklady/komponenty-a-props#seznam-z-pole-a-key

## --question--

**Opakování z dřívějška.** V Reactu vrací `useEffect` úklidovou funkci, kterou React zavolá při odpojení komponenty. Jak se stejná věc řeší ve Vue, když si v komponentě založíš časovač?

### --answer--

Ve Vue není potřeba nic uklízet, časovače ruší framework sám.

#### --why--

Žádný framework neví, co je uvnitř tvého `setInterval`. Běžící časovač po odpojení komponenty tiká dál a sahá na data, která už nikdo nevidí.

### --correct--

Úklid se zapíše do `onUnmounted` (nebo se vrátí ze zastavené `watch` či `watchEffect`).

#### --why--

Vue má na fázi života komponenty vlastní funkce, ne návratovou hodnotu jednoho hooku. Smysl je stejný: co jsi založil, po sobě zruš.

### --answer--

Ve Vue se úklid vrací ze `setup()`, stejně jako se v Reactu vrací z `useEffect`.

#### --why--

`setup()` vrací to, co má vidět šablona. Kdyby se odtud vracel i úklid, nedalo by se vrátit obojí.

### --see--

react-hloubka/useeffect-spravne#uklid-co-po-sobe-efekt-uklidi

# --code-- Skladová karta z cizího projektu

## --file-- sklad.js

````js
import { createApp } from 'vue';

const SAZBA_DPH = 1.21;
const LIMIT_DOPLNENI = 5;

const Sklad = {
  data() {
    return {
      hledani: '',
      poznamka: '',
      radky: [
        { kod: 'SES-A5', nazev: 'Sešit A5 linkovaný', kusu: 12, cenaKus: 39 },
        { kod: 'PER-01', nazev: 'Pero gelové černé', kusu: 3, cenaKus: 29 },
        { kod: 'BLO-A4', nazev: 'Blok A4 kroužkový', kusu: 0, cenaKus: 89 },
        { kod: 'ZVY-04', nazev: 'Zvýrazňovače, sada 4 ks', kusu: 7, cenaKus: 119 },
      ],
    };
  },

  computed: {
    nalezene() {
      const hledane = this.hledani.trim().toLowerCase();
      if (hledane === '') return this.radky;
      const vysledek = [];
      for (const radek of this.radky) {
        if (radek.nazev.toLowerCase().includes(hledane)) {
          vysledek.push(radek);
        }
      }
      return vysledek;
    },

    hodnotaSkladu() {
      let soucet = 0;
      for (const radek of this.radky) {
        soucet += radek.kusu * radek.cenaKus;
      }
      return Math.round(soucet * SAZBA_DPH);
    },

    dochazi() {
      const seznam = [];
      for (const radek of this.nalezene) {
        if (radek.kusu < LIMIT_DOPLNENI) {
          seznam.push(radek.kod);
        }
      }
      return seznam;
    },
  },

  methods: {
    naskladnit(kod, kusu) {
      const radek = this.radky.find((polozka) => polozka.kod === kod);
      if (!radek) return;
      radek.kusu += kusu;
      this.poznamka = `Naskladněno ${kusu} ks zboží ${kod}.`;
    },

    vyradit(kod) {
      this.radky = this.radky.filter((radek) => radek.kod !== kod);
      this.poznamka = `Zboží ${kod} je vyřazené.`;
    },
  },

  watch: {
    hledani(nove) {
      this.poznamka = nove === '' ? '' : `Hledá se „${nove}".`;
    },
  },

  template: `
    <section class="sklad">
      <input v-model="hledani" placeholder="Hledat zboží">
      <ul>
        <li v-for="radek in nalezene" :key="radek.kod">
          {{ radek.nazev }} — {{ radek.kusu }} ks
          <button @click="naskladnit(radek.kod, 10)">+10</button>
          <button @click="vyradit(radek.kod)">Vyřadit</button>
        </li>
      </ul>
      <p v-if="dochazi.length">Dochází: {{ dochazi.join(', ') }}</p>
      <p>Hodnota skladu s DPH: {{ hodnotaSkladu }} Kč</p>
      <p class="poznamka">{{ poznamka }}</p>
    </section>
  `,
};

createApp(Sklad).mount('#sklad');
````

## --question--

Jaké číslo vypíše `hodnotaSkladu` (řádky 33–39 v `sklad.js`) hned po načtení stránky?

### --expected--

1679

### --accept--

1679 Kč

### --why--

Součet je 12 × 39 + 3 × 29 + 0 × 89 + 7 × 119 = 1388, po vynásobení sazbou 1,21 vyjde 1679,48 a `Math.round` z toho udělá 1679. Položka s nulovým počtem kusů se do součtu započítá jako nula, ne že by se přeskočila.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#computed-se-pocita-jen-kdyz-je-potreba

## --question--

Napiš číslo řádku v `sklad.js`, kvůli kterému se seznam `dochazi` přepočítá pokaždé, když uživatel píše do vyhledávacího pole.

### --expected--

43

### --why--

Na řádku 43 čte `dochazi` hodnotu `nalezene`, a ta čte `hledani`. Sledované hodnoty se tak řetězí: psaní změní `hledani`, tím `nalezene` a tím i `dochazi`. Kdyby cyklus procházel `this.radky`, s hledáním by `dochazi` nic společného nemělo.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#proxy-a-sledovani-zavislosti

## --question--

Metoda `vyradit` (řádky 60–63 v `sklad.js`) nahradí `this.radky` úplně novým polem. Projeví se to v seznamu na stránce?

### --answer--

Ne, přiřazením nového pole se reaktivita ztratí; kolega měl použít `splice`.

#### --why--

Tohle platilo ve Vue 2 u přidávání nových indexů. Dnešní Vue hlídá přístup k vlastnostem objektu jinak — a `radky` je obyčejná vlastnost.

### --correct--

Ano. `radky` je vlastnost reaktivního objektu, takže Vue o zápisu do ní ví.

#### --why--

Proxy zachytí zápis do vlastnosti `radky` stejně jako zápis do `radek.kusu`. Nové pole se navíc samo stane reaktivním, takže funguje i dál.

### --answer--

Ano, ale až po ručním zavolání `this.$forceUpdate()`.

#### --why--

Kdyby bylo potřeba překreslovat ručně, nebyla by reaktivita k ničemu. Ptej se radši, jestli Vue o zápisu vůbec ví.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#reactive-a-proc-ztraci-reaktivitu

## --question--

Metoda `naskladnit` (řádky 53–58 v `sklad.js`) mění na posledním řádku `this.poznamka`. Proč se kvůli tomu **nepřepočítá** `nalezene` (řádky 21–31)?

### --answer--

Protože `poznamka` je řetězec a Vue sleduje jen pole a objekty.

#### --why--

Typ hodnoty v tom nehraje roli — na text v `hledani` reaguje `nalezene` okamžitě.

### --correct--

Protože `nalezene` čte jen `hledani` a `radky`; `poznamka` mezi jeho sledovanými hodnotami není.

#### --why--

Závislosti si Vue zapamatuje při výpočtu podle toho, co funkce **skutečně přečetla**. Co si nepřečte, to ji nezajímá, i když to leží ve stejném objektu.

### --answer--

Protože `nalezene` se počítá jen jednou při startu a dál se nemění.

#### --why--

Při psaní do vyhledávacího pole se seznam mění před očima, takže na jednorázový výpočet to nevypadá.

### --see--

vue-nuxt-druhy-framework/reaktivita-vue#computed-se-pocita-jen-kdyz-je-potreba
