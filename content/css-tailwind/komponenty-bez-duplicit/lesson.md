# Komponenty bez duplicit

:::check pretest
Stejný blok dvanácti tříd máš na osmi místech. Co uděláš první?

### --answer--
Udělám si `.tlacitko` přes `@apply` a všude ho nahradím.

#### --why--
Lákavé, ale tím ses vrátil k pojmenovaným třídám — a s nimi i ke všem problémům, kvůli
kterým Tailwind vznikl. Je to až poslední možnost.

### --correct--
Podívám se, proč je to na osmi místech, a udělám z toho jednu komponentu nebo smyčku.

#### --why--
Duplicita tříd je skoro vždycky příznak duplicity **značky**. Když se opakuje HTML,
neopravuje se to v CSS, ale tím, že se HTML napíše jednou.

### --answer--
Nic — opakování tříd je u Tailwindu normální.

#### --why--
Krátké opakování ano. Dvanáct tříd osmkrát znamená, že se změna bude dělat na osmi
místech a na jednom se zapomene.
:::

Nejčastější námitka proti Tailwindu zní: „vždyť ty třídy pořád kopíruju". Je oprávněná —
jen se neřeší tam, kde by člověk čekal.

## Problém: stejný blok tříd na deseti místech

```html
<a class="inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2">Koupit</a>
<a class="inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2">Do košíku</a>
<a class="inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2">Zaplatit</a>
```

Změnit odstín na těch třech místech ještě jde. Na dvaceti už ne — a přesně tam vzniká
web, kde má každé tlačítko trochu jinou zelenou.

Řešení jsou čtyři a mají jasné pořadí. **Sáhni po prvním, které stačí.**

:::check
Co se na tomhle kódu doopravdy opakuje — třídy, nebo něco jiného?

### --expected--
značka

### --accept--
HTML
celý prvek
struktura značky
opakuje se HTML, ne jen třídy
:::

## 1. Smyčka nebo komponenta

Opakuje se HTML? Napiš ho jednou.

```jsx
// React
function Tlacitko({ children, ...props }) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2"
      {...props}
    >
      {children}
    </button>
  );
}
```

```html
<!-- Šablona na serveru (Nunjucks, Twig, Blade…) -->
{% for polozka in polozky %}
  <li class="flex items-center justify-between rounded-lg border border-gray-200 p-4">…</li>
{% endfor %}
```

Tohle je **výchozí odpověď** a v devíti případech z deseti jediná potřebná. Bloky tříd
zůstanou dlouhé, ale jsou na jednom místě a mizí z nich riziko, že se rozejdou.

> [!REMEMBER]
> Duplicita tříd je příznak. Léčí se duplicita značky, ne symptom v `class`.

:::check
V seznamu je dvacet stejných položek se stejnými třídami. Co je správné řešení?

### --expected--
smyčka

### --accept--
cyklus v šabloně
smyčka v šabloně
komponenta
napsat HTML jednou a projet smyčkou
:::

## 2. `@utility`: vlastní utilita

Občas potřebuješ **jednu deklaraci**, kterou Tailwind nemá — a chceš, aby se chovala
jako všechny ostatní, tedy aby na ni šly varianty.

```css
@utility text-vyvazene {
  text-wrap: balance;
}

@utility zebricek-* {
  z-index: --value(integer);
}
```

Od téhle chvíle funguje `text-vyvazene`, `md:text-vyvazene`, `hover:zebricek-50` —
přesně jako vestavěné utility. Obyčejná třída v CSS tohle neumí: varianta by na ni
nešla použít a zařadila by se do jiné vrstvy.

:::live dom libs=tailwind
```html
<style type="text/tailwindcss">
  @utility text-vyvazene {
    text-wrap: balance;
  }
</style>

<div class="grid gap-4 p-6 font-sans md:grid-cols-2">
  <div class="rounded-lg bg-gray-100 p-4">
    <p class="mb-1 text-xs text-gray-500">Bez vyvážení</p>
    <h2 class="text-2xl font-semibold">Jak jsme za víkend přepsali celý web do Tailwindu</h2>
  </div>
  <div class="rounded-lg bg-gray-100 p-4">
    <p class="mb-1 text-xs text-gray-500">S vlastní utilitou</p>
    <h2 class="text-vyvazene text-2xl font-semibold">Jak jsme za víkend přepsali celý web do Tailwindu</h2>
  </div>
</div>
```
:::

:::check
Proč se vlastní utilita píše přes `@utility` a ne jako obyčejná třída v CSS?

### --correct--
Aby na ni šly použít varianty (`md:`, `hover:`) a aby se zařadila do správné vrstvy.

#### --why--
Obyčejná třída je mimo systém: `md:moje-trida` by nefungovalo a specificita by se
chovala jinak než u zbytku utilit.

### --answer--
Protože obyčejné třídy Tailwind ze souboru smaže.

#### --why--
Nic nemaže. Jen s nimi neumí pracovat jako s utilitami.

### --answer--
Protože `@utility` generuje menší CSS.

#### --why--
Velikost je prakticky stejná. Jde o to, co s tou třídou jde dělat dál.
:::

## 3. `@apply` a proč střídmě

`@apply` vezme utility a vloží jejich deklarace do tvé třídy:

```css
.tlacitko {
  @apply inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-white;
}
```

Vypadá to jako vysněné řešení — a je to nejčastější způsob, jak si Tailwind zkazit.
Vrátíš se tím k pojmenovaným třídám, a s nimi:

- **ke stylopisu, který zase roste**,
- **k hádání, co `.tlacitko` vlastně dělá** (musíš přepnout do jiného souboru),
- **k obavám, jestli tu třídu nepoužívá ještě někdo jiný**.

Kdy se `@apply` opravdu hodí:

- na značky, které nemůžeš otřídovat — obsah z redakčního systému, markdown, cizí
  widget (`.clanek h2 { @apply mt-8 text-2xl; }`),
- na `@layer base` pro výchozí vzhled prvků (`a { @apply underline underline-offset-2; }`),
- když potřebuješ jednu třídu předat do knihovny, která žádné jiné API nemá.

> [!PITFALL]
> `@apply` ve třídě, kterou používáš ve vlastních komponentách, je téměř vždycky
> znamení, že měla vzniknout komponenta (bod 1). Otázka na kontrolu: **„mohl bych to
> místo toho napsat jako komponentu?"** Když ano, napiš ji.

:::check
Kdy je `@apply` na místě?

### --correct--
U značek, které nemůžeš otřídovat — obsah z redakčního systému, markdown, cizí widget.

#### --why--
Tam žádná komponenta nepomůže, protože HTML negeneruješ ty. Ve vlastních komponentách
má přednost bod 1.

### --answer--
Vždycky, když se blok tříd opakuje víc než třikrát.

#### --why--
To je přesně situace pro komponentu nebo smyčku. `@apply` problém jen schová do CSS.

### --answer--
Nikdy, `@apply` je zastaralé.

#### --why--
Zastaralé není a na výjimky se hodí. Jen se s ním nemá začínat.
:::

:::live dom libs=tailwind predict
```html
<div class="p-6 font-sans">
  <div class="p-2 p-8 bg-sky-700 text-white rounded-md">Kolik mám odsazení?</div>
</div>
```
--question-- Jaké odsazení bude mít ten div?
--option-- `p-2` — první třída v pořadí platí a druhá se ignoruje.
--option*-- `p-8` — ale ne proto, že je v atributu druhá, nýbrž proto, že je ve stylopisu později.
--option-- Obojí se sečte na `p-10`.
--why-- Obě utility mají stejnou specificitu, takže vyhraje ta, která je ve vygenerovaném CSS později. Pořadí v atributu `class` s tím nemá nic společného — jen se to tak často shoduje, že tomu lidé věří. Ve chvíli, kdy třídy skládáš z víc zdrojů, na tu shodu spolehnout nejde.
:::

## 4. Slučování tříd: `clsx` a `tailwind-merge`

Komponenta z bodu 1 má jednu skrytou past. Dej jí prop `className`:

```jsx
function Tlacitko({ className, children }) {
  return <button className={`rounded-md bg-sky-700 px-4 py-2 ${className}`}>{children}</button>;
}

<Tlacitko className="px-8" />   // vyhraje px-4, nebo px-8?
```

Odpověď: **záleží na pořadí ve vygenerovaném stylopisu, ne v atributu.** Obě utility
mají stejnou specificitu, takže vyhraje ta, která je v CSS později — a to nemáš pod
kontrolou.

Na to jsou dvě malé knihovny:

- **`clsx`** — skládá jména tříd podle podmínek (`clsx('base', jeAktivni && 'bg-sky-800')`),
- **`tailwind-merge`** — pozná, že `px-4` a `px-8` jsou **totéž nastavení**, a nechá
  jen to pozdější.

```js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...vstupy) {
  return twMerge(clsx(vstupy));
}
```

```jsx
function Tlacitko({ className, varianta = 'plna', children }) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition',
        varianta === 'plna' && 'bg-sky-700 text-white hover:bg-sky-800',
        varianta === 'obrys' && 'border border-sky-700 text-sky-700 hover:bg-sky-50',
        className,                                 // tohle teď spolehlivě přebije
      )}
    >
      {children}
    </button>
  );
}
```

Funkce `cn` je v projektech s Tailwindem tak běžná, že ji shadcn/ui i většina šablon
zakládá automaticky. Poznáš ji i v cizím kódu.

:::check
Proč nestačí jen spojit řetězce a `className` dát na konec?

### --expected--
o vítězi rozhoduje pořadí v css

### --accept--
pořadí v atributu class nic neznamená
rozhoduje pořadí ve stylopisu, ne v class
obě třídy mají stejnou specificitu
:::

## Kdy Tailwind a kdy čisté CSS

Tailwind není náboženství. Některé věci se v něm píšou hůř než rovnou v CSS:

| spíš Tailwind | spíš čisté CSS |
|---|---|
| rozvržení, rozestupy, typografie, barvy | složité `@keyframes` |
| stavy a responzivita | generované mřížky a výpočty přes `calc()` |
| rychlé prototypy a komponenty | tisk (`@media print`) |
| všechno, co má držet design systém | `::selection`, `::marker` a další drobnosti |

Míchat obojí je v pořádku a běžné. Tokeny z `@theme` fungují v obou světech, takže
i čisté CSS sahá po stejné paletě.

:::check
Máš složitou animaci se šesti mezistavy. Napiš, kam ji napíšeš.

### --expected--
do css jako keyframes

### --accept--
do čistého css
@keyframes v css
do stylopisu
:::

:::explain
Vysvětli vlastními slovy, proč se dlouhý opakující se seznam tříd neřeší tím, že se
z něj udělá vlastní třída přes `@apply`.

## --model--
Opakované třídy nejsou nemoc, ale **příznak**: na třech místech je napsaná ta samá
značka. Když z nich udělám `.karta` přes `@apply`, příznak zmizí, ale duplicita zůstane
— jen se přesune do HTML, kde je `.karta` napsaná pořád třikrát, a navíc přijdu o to,
kvůli čemu se Tailwind používá: vzhled už není vidět ve značce a vznikl další soubor,
který se musí udržovat. Správná oprava je vytáhnout **celou tu opakovanou značku** do
komponenty nebo šablony; třídy pak existují jen jednou, protože jednou existuje
i značka.

## --checklist--
- Opakované třídy jsou příznakem opakované značky.
- `@apply` schová symptom, duplicitu nechá být.
- Vzhled přestane být vidět v místě použití.
- Řešením je vytáhnout celou značku do komponenty.
:::

## Typické chyby a pasti

- **`@apply` jako první reakce na opakování.** Skoro vždycky tam měla být komponenta.
- **Jedna velká třída `.karta` s dvaceti `@apply`.** To už je jen Tailwind napsaný
  oklikou — a hůř čitelný než původní CSS.
- **Řetězení tříd bez `tailwind-merge`.** `className` zvenčí pak někdy funguje a někdy ne,
  což je horší než kdyby nefungoval nikdy.
- **Třída skládaná za běhu** (`` `bg-${barva}-500` ``). Tailwind ji ve zdrojáku nenajde.
  Piš celá jména do objektu a vybírej z nich.
- **Vlastní utilita jako obyčejná třída v CSS.** Varianty na ni nepůjdou.
- **Kopírování bloku tříd mezi projekty** místo sdílení komponenty nebo tokenů.

> [!PITFALL]
> Nejzrádnější je ta předposlední: `` className={`text-${stav}-600`} `` v lokálním
> vývoji **funguje**, pokud tu třídu někde jinde v projektu náhodou máš napsanou celou.
> Rozbije se až v produkci, kde už ten jiný soubor neexistuje.

:::check
`className={`text-${stav}-600`}` ti lokálně funguje. Napiš, proč se to v produkci rozbije.

### --expected--
tailwind to jméno ve zdrojáku nenajde

### --accept--
třída se neposkládá ve zdrojovém kódu
jméno třídy nikde celé nestojí
tailwind generuje jen třídy, které najde v souborech
:::

## Kde to najdeš v MDN

Pod tím vším je pořád obyčejné CSS:
[kaskáda a pořadí pravidel](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade)
vysvětluje, proč pořadí v atributu `class` nic neznamená,
[`@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) zase to, jak si
Tailwind řadí své vrstvy. Direktivy `@utility` a `@apply` jsou vlastní Tailwindu a najdeš
je v jeho dokumentaci pod heslem *Functions and directives*.

# --questions--

## --question--

Blok patnácti tříd máš v šabloně na dvanácti místech. Napiš, co je první krok.

### --expected--

udělat z toho komponentu

### --accept--

napsat HTML jednou a projet smyčkou
smyčka nebo komponenta
komponenta

### --why--

Duplicita tříd je skoro vždycky příznak duplicity značky. `@apply` by symptom schoval
do CSS, ale HTML by se dál opakovalo — a při změně struktury bys obcházel dvanáct míst.

### --see--

css-tailwind/komponenty-bez-duplicit#1-smycka-nebo-komponenta

## --question--

Napiš, co umí vlastní utilita z `@utility` navíc oproti obyčejné třídě v CSS.

### --expected--

jdou na ni varianty

### --accept--

dají se použít varianty jako md: a hover:
zařadí se do vrstvy utilit
funguje s variantami

### --why--

Obyčejná třída stojí mimo systém: `md:moje-trida` by nevzniklo a specificita by se
chovala jinak než u zbytku utilit. Proto má Tailwind vlastní direktivu.

### --see--

css-tailwind/komponenty-bez-duplicit#2-utility-vlastni-utilita

## --question--

Napiš jeden případ, kdy je `@apply` opravdu na místě.

### --expected--

obsah z redakčního systému

### --accept--

markdown
cizí widget, který nejde otřídovat
značky, které negeneruji sám
výchozí styly prvků v @layer base

### --why--

Tam žádná komponenta nepomůže, protože HTML negeneruješ ty — přichází z databáze nebo
z cizí knihovny. Ve vlastních komponentách má přednost napsat HTML jednou.

### --see--

css-tailwind/komponenty-bez-duplicit#3-apply-a-proc-stridme

## --question--

Komponenta má uvnitř `px-4` a zvenčí přijde `px-8`. Co rozhodne, která se uplatní?

### --correct--

Pořadí pravidel ve vygenerovaném stylopisu — obě utility mají stejnou specificitu.

#### --why--

Pořadí v atributu `class` na CSS žádný vliv nemá. Proto existuje `tailwind-merge`,
který z dvojice odporujících si utilit nechá jen tu pozdější.

### --answer--

`px-8`, protože přišel jako poslední v řetězci.

#### --why--

To je právě ten omyl. Řetězec v atributu o výsledku nerozhoduje.

### --answer--

`px-4`, protože je součástí komponenty a má vyšší prioritu.

#### --why--

Žádnou vyšší prioritu nemá — jsou to dvě rovnocenné třídy.

### --see--

css-tailwind/komponenty-bez-duplicit#4-slucovani-trid-clsx-a-tailwind-merge

## --question--

Napiš, co dělá funkce `cn` složená z `clsx` a `twMerge`.

### --expected--

složí třídy a vyřeší konflikty

### --accept--

spojí podmíněné třídy a odstraní ty, které si odporují
clsx poskládá, twMerge nechá jen pozdější z konfliktních
skládá třídy a řeší, která vyhraje

### --why--

`clsx` poskládá jména tříd podle podmínek, `twMerge` pak pozná dvojice, které nastavují
totéž (`px-4` a `px-8`), a nechá jen tu pozdější. Bez druhého kroku je výsledek
nepředvídatelný.

### --see--

css-tailwind/komponenty-bez-duplicit#4-slucovani-trid-clsx-a-tailwind-merge

## --question--

Kterou z těchhle věcí napíšeš spíš v čistém CSS než v utilitách?

### --correct--

Animaci s šesti mezistavy přes `@keyframes`.

#### --why--

Utility jsou na jednotlivé deklarace. Víceklíčová animace se v nich zapsat nedá a
`@keyframes` je pro to přesně určené. Tokeny z `@theme` v ní přitom použít můžeš.

### --answer--

Rozestupy mezi kartami v mřížce.

#### --why--

Přesně na tohle jsou `gap-*` a varianty. V čistém CSS bys jen psal víc.

### --answer--

Barvu tlačítka při najetí myší.

#### --why--

`hover:bg-znacka-700` je kratší a drží se palety. Čisté CSS by tu nic nepřineslo.

### --see--

css-tailwind/komponenty-bez-duplicit#kdy-tailwind-a-kdy-ciste-css

## --question--

Proč `` className={`bg-${barva}-500`} `` v produkci nefunguje, i když lokálně fungovalo?

### --correct--

Tailwind hledá celá jména tříd ve zdrojových souborech. Lokálně se ta třída našla někde jinde v projektu; v produkčním buildu už tam být nemusí.

#### --why--

Proto se jména píšou celá a vybírá se z nich:
`{ modra: 'bg-sky-500', cervena: 'bg-red-500' }[barva]`. Chyba, která se projeví až
v produkci, je ta nejdražší.

### --answer--

Protože se v produkci minifikují jména tříd.

#### --why--

Jména tříd se neminifikují. Odstraňuje se jen to, co se nikde nepoužívá.

### --answer--

Protože šablonové řetězce v `className` nejsou podporované.

#### --why--

Podporované jsou. Problém je, že výsledné jméno ve zdrojáku nikde nestojí.

### --see--

css-tailwind/komponenty-bez-duplicit#typicke-chyby-a-pasti
