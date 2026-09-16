# Spline: 3D scéna z editoru na webu

:::check pretest
Designérka ti pošle odkaz `https://prod.spline.design/Ab3…/scene.splinecode` na hotovou 3D scénu. Web ho načte přímo z téhle adresy. Co je na tom riskantní?

### --answer--

Nic, soubor na serveru Splinu je vždycky nejrychlejší.

#### --why--

Rychlost je jen část problému. Zamysli se, kdo o souboru a jeho dostupnosti rozhoduje. Vysvětlí to část o exportu.

### --correct--

Web závisí na cizím serveru: když soubor zmizí nebo se změní, scéna se rozbije.

#### --why--

Soubor na cizí adrese může designérka přepsat, smazat nebo může být nedostupný. Proč se export dává k vlastnímu webu, rozebírá část o exportu.

### --answer--

Soubor `.splinecode` prohlížeč neumí otevřít.

#### --why--

Soubor otevře knihovna Splinu, prohlížeč ho jen stáhne. Otázka je, odkud. Podrobnosti v části o exportu.
:::

:::check pretest
3D model klávesnice je na stránce až ve třetí sekci. Kdy by se měl začít stahovat a spouštět?

### --answer--

Hned při načtení stránky, aby byl připravený.

#### --why--

Stáhnout a spustit scénu stojí data i výkon, a část návštěvníků do třetí sekce nikdy nedojede. Uvidíš v části o výkonu.

### --correct--

Až když se sekce blíží k oknu prohlížeče.

#### --why--

Líné načítání šetří data i procesor těm, kdo tam nedojedou. Jak to napsat správně, ukáže část o výkonu.

### --answer--

Až když na model uživatel klikne.

#### --why--

Taky možnost, ale do té doby by uživatel koukal na prázdné místo. Kompromis rozebírá část o výkonu.
:::

Otáčející se sluchátka na stránce e-shopu, 3D ikona aplikace, která se natočí za kurzorem, interaktivní ilustrace v hero sekci startupu. Designéři je dnes často dělají ve [[Spline]] — webovém editoru, kde se 3D scéna naklikne jako v Figmě: tvary, materiály, světla, animace i reakce na kliknutí. Programátor ji pak jen vloží na web a propojí se zbytkem stránky.

> [!REMEMBER]
> **Spline scénu navrhneš v editoru, vyexportuješ do souboru `.splinecode` a na webu ji přehráváš runtime knihovnou. Z JavaScriptu s ní mluvíš přes jména objektů, proměnné a události — a zacházíš s ní jako s každým těžkým médiem: načíst líně, mít náhradní obrázek a respektovat omezený pohyb.**

## Kdy Spline a kdy Three.js

Pod kapotou je Spline taky WebGL. Rozdíl je v tom, kdo scénu tvoří a co ji řídí:

| | Spline | Three.js ručně |
|---|---|---|
| kdo scénu tvoří | designér v editoru, bez kódu | programátor v kódu |
| změna vzhledu | nový export, kód se nemění | úprava kódu |
| animace a stavy | naklikané v editoru (stav „stisknuto", „hover") | napsané v render smyčce |
| velikost | runtime stovky kB po kompresi (dotahuje části podle scény) + soubor scény | Three.js zhruba 170 kB po kompresi + tvůj kód |
| kontrola nad výkonem | omezená, runtime dělá, co dělá | úplná (draw calls, pixel ratio, pauza) |
| vlastní shadery, částice, generovaná data | omezeně | ano |

**Spline se vyplatí**, když scénu navrhuje designér, mění se vzhled častěji než chování a stačí pár interakcí (klik, najetí, scroll). **Three.js se vyplatí**, když je 3D řízené daty nebo kódem (konfigurátor s cenami, vizualizace, hra), potřebuješ plnou kontrolu nad výkonem, nebo je scéna jednoduchá a Spline runtime by byl těžší než ona.

:::check
Startup chce na úvodní stránce 3D maskota, kterého navrhla jejich grafička. Maskot mává a při najetí myší se usměje. Grafička ho bude před kampaní dvakrát předělávat. Co zvolíš?

### --answer--

Three.js, protože je menší.

#### --why--

Velikost je argument, ale každá změna maskota by znamenala práci programátora v kódu. Kdo tu scénu mění?

### --correct--

Spline, protože scénu tvoří a mění grafička a interakce jsou jednoduché.

#### --why--

Mávání i úsměv při najetí grafička naklikne v editoru. Při předělávce jen vyexportuje nový soubor a kód zůstane stejný.

### --answer--

Video, protože je nejlehčí.

#### --why--

Video neumí reagovat na najetí myší, a to zadání chce.

### --see--

web-3d-efekty/spline#kdy-spline-a-kdy-three-js
:::

## Export a vložení přes `@splinetool/runtime`

V editoru zvolíš **Export → Code → Vanilla JS** a stáhneš soubor scény `.splinecode`. Editor nabídne i kód s adresou na serveru Splinu (`https://prod.spline.design/…`). Pro produkční web si ale soubor ulož **k vlastnímu webu** (ve Vite nebo Next.js do složky `public/`): verzuješ ho s kódem, nezmizí a nezmění se bez tvého vědomí.

```sh
npm install @splinetool/runtime
```

```js
import { Application } from '@splinetool/runtime';

const canvas = document.querySelector('.product__canvas');
const app = new Application(canvas);

await app.load('/scenes/sluchatka.splinecode');
```

- `Application` dostane `<canvas>`, do kterého bude kreslit. Canvas potřebuje velikost z CSS, jinak má 300 × 150 bodů jako každý canvas.
- `load(cesta)` stáhne scénu a spustí ji. Vrací Promise — když se nepovede (špatná cesta, výpadek sítě), zamítne se chybou.
- Scéna se kreslí sama, render smyčku nepíšeš.

> [!PITFALL]
> **Web bez internetu nebo na firemní síti ukáže prázdný canvas a v konzoli je `Uncaught (in promise) TypeError: Failed to fetch`.** Scéna se načítá z adresy `prod.spline.design`, kterou síť blokuje nebo není dostupná, a na zamítnutý `load` nikdo nečeká. Oprava: soubor exportu dej k vlastnímu webu, načti ho relativní cestou a chybu z `load` obsluž (náhradní obrázek zůstane).

> [!NOTE]
> Runtime si za běhu dotahuje ještě pomocné soubory WebAssembly, ve výchozím stavu z CDN Splinu. Kdo potřebuje web úplně bez cizích serverů, zkopíruje je k webu a předá cestu v nastavení `new Application(canvas, { wasmPath: '/spline/' })`.

:::check
Scéna ze Splinu je ve Vite projektu v `public/scenes/hrnek.splinecode`. Jakou cestu předáš do `app.load`?

### --expected--

/scenes/hrnek.splinecode

### --accept--

./scenes/hrnek.splinecode
scenes/hrnek.splinecode

### --why--

Soubory z `public/` vydává Vite z kořene webu, bez `public` v cestě. Proto `/scenes/hrnek.splinecode`.

### --see--

web-3d-efekty/spline#export-a-vlozeni-pres-splinetool-runtime
:::

## Ovládání scény z JavaScriptu

Scéna ze Splinu není černá skříňka. Vše, co designér pojmenuje, najdeš z kódu. Proto se s designérem předem domluv na **jménech objektů a proměnných** — jsou to „API" scény.

```js
await app.load('/scenes/sluchatka.splinecode');

// 1. událost ze scény: uživatel klikl na objekt
app.addEventListener('mouseDown', (event) => {
  if (event.target.name === 'Levé sluchátko') showDetail('driver');
});

// 2. objekt podle jména: změna barvy, polohy, viditelnosti
const cushions = app.findObjectByName('Polštářky');
cushions.color = '#a16207';
cushions.rotation.y = Math.PI / 4;

// 3. proměnná scény: přepne stav, který designér navázal v editoru
app.setVariable('anc', true);

// 4. spuštění události z kódu, jako by na objekt uživatel klikl
app.emitEvent('mouseDown', 'Levé sluchátko');
```

- Události (`addEventListener`): `mouseDown`, `mouseUp`, `mouseHover`, `keyDown`, `keyUp`, `start`, `scroll`, `lookAt`, `follow`. Přijdou jen z objektů, kterým designér v editoru danou událost přidal. Handler dostane `event.target` se jménem (`name`) a `id` objektu.
- `findObjectByName` vrátí objekt s `position`, `rotation`, `scale`, `visible` a `color`, nebo `undefined`, když jméno ve scéně není.
- `setVariable(jméno, hodnota)` a `getVariable(jméno)` — proměnné, které designér ve scéně založil (číslo, text, ano/ne).
- `emitEvent(událost, jméno)` spustí animaci navázanou na událost objektu. Hodí se pro HTML tlačítka, která dělají totéž co klik ve scéně — přes klávesnici se na objekt ve 3D kliknout nedá.

> [!PITFALL]
> **`TypeError: Cannot set properties of undefined (setting 'color')`.** `findObjectByName` vrátil `undefined`: jméno se liší od editoru (překlep, jiná velikost písmen, mezera navíc), nebo se volá dřív, než `load` doběhl. Oprava: hledej objekty až po `await app.load(…)` a jména zkopíruj přímo z editoru.

:::check
Po `await app.load(…)` voláš `app.findObjectByName('mezernik').color = '#fb923c'` a dostaneš `TypeError: Cannot set properties of undefined`. V editoru se objekt jmenuje „Mezerník". V čem je chyba?

### --answer--

Barva se musí nastavovat přes `setVariable`.

#### --why--

`color` na objektu nastavit jde. Chyba říká, že objekt vůbec nemáš. Proč?

### --correct--

Jméno se neshoduje: hledání rozlišuje velká písmena i diakritiku.

#### --why--

`findObjectByName` hledá přesnou shodu. „mezernik" není „Mezerník", takže vrátí `undefined` a zápis `color` spadne.

### --answer--

Scéna se ještě nenačetla.

#### --why--

Kód čeká na `await app.load(…)`, scéna načtená je. Podívej se na to, co hledáš.

### --see--

web-3d-efekty/spline#ovladani-sceny-z-javascriptu
:::

## Scroll a myš

Pohyb za myší nebo při scrollu jde udělat dvěma způsoby:

1. **Ve Splinu:** designér objektu přidá událost `Follow` nebo `Look At` (natáčí se za kurzorem) nebo `Scroll`. Nic nepíšeš, ale chování řídí runtime a těžko ho omezíš (třeba pro omezený pohyb nebo jen pro jednu sekci).
2. **Z kódu:** stránka spočítá číslo (průběh scrollu sekce, poloha myši od −1 do 1) a zapíše ho do objektu nebo proměnné scény. Máš pod kontrolou, kdy a jak moc se scéna hýbe.

```js
const headphones = app.findObjectByName('Sluchátka');

window.addEventListener('scroll', () => {
  const rect = section.getBoundingClientRect();
  // 0 = sekce vjíždí zespodu, 1 = sekce odjela nahoru
  const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
  headphones.rotation.y = Math.min(Math.max(progress, 0), 1) * Math.PI;
}, { passive: true });
```

Vzorec pro průběh sekce se ti bude hodit i bez 3D: vrátí 0, když horní okraj sekce dosáhne spodku okna, a 1, když spodní okraj sekce odjede nad okno.

:::check
Okno je vysoké 800 px, sekce 400 px a její horní okraj je v okně na `rect.top = 200`. Jaký je průběh `(innerHeight - rect.top) / (innerHeight + rect.height)`?

### --expected--

0.5

### --why--

`(800 - 200) / (800 + 400) = 600 / 1200 = 0.5`. Sekce je přesně uprostřed své cesty oknem.

### --see--

web-3d-efekty/spline#scroll-a-mys
:::

## Spline v Reactu

Pro React je komponenta `@splinetool/react-spline`. Vytvoří canvas, `Application` i úklid při odmontování sama:

```jsx
import { lazy, Suspense } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export default function ProductHero() {
  function handleLoad(splineApp) {
    splineApp.setVariable('anc', true);
  }

  function handleMouseDown(event) {
    console.log('Klik na', event.target.name);
  }

  return (
    <Suspense fallback={<img src="/sluchatka.webp" alt="Sluchátka Tichošlap" />}>
      <Spline scene="/scenes/sluchatka.splinecode" onLoad={handleLoad} onSplineMouseDown={handleMouseDown} />
    </Suspense>
  );
}
```

- `scene` — cesta k exportu. `onLoad(app)` dostane stejnou `Application` jako ve vanilla JS, se všemi metodami výš.
- Události jsou props s předponou: `onSplineMouseDown`, `onSplineMouseHover`, `onSplineScroll`…
- `lazy` a `Suspense` z [lekce o Suspense](see:react-hloubka/chyby-suspense-portaly#suspense-kdo-ukaze-nacitam) odloží stažení runtime, dokud se komponenta nevykreslí, a mezitím ukážou náhradní obrázek.
- V Next.js je varianta `@splinetool/react-spline/next`, která na serveru vygeneruje rozmazaný náhled scény.

:::check
V Reactu máš `const Spline = lazy(() => import('@splinetool/react-spline'))` a `<Spline>` je přímo v `App` bez `<Suspense>`. Co uvidí návštěvník, dokud se runtime stahuje?

### --answer--

Stránku bez 3D modelu, model se doplní po stažení.

#### --why--

Tak by to fungovalo, kdyby nad líným modelem byla hranice, která za něj něco ukáže. Kde React takovou hranici hledá?

### --correct--

Prázdnou stránku: vykreslení se pozastaví až ke kořeni, takže chybí i nadpis a text.

#### --why--

Líná komponenta při prvním renderu čeká. Bez `Suspense` nad ní se pozastaví celý strom až po kořen a nevykreslí se nic, dokud se modul nestáhne. `Suspense` kolem modelu omezí čekání jen na jeho místo.

### --answer--

Chybu v konzoli a stránka spadne.

#### --why--

Chyba nepřijde, React počká. Otázka je, na kolik stránky se čekání vztáhne.

### --see--

web-3d-efekty/spline#spline-v-reactu
:::

## Výkon: velikost scény, líné načítání a náhradní obrázek

Scéna ze Splinu je těžké médium: runtime, soubor scény, textury a WebAssembly dohromady klidně 2–5 MB a pár sekund práce procesoru. Stejné zásady jako u velkých obrázků a videa:

- **Menší scéna.** V editoru smaž skryté objekty, zmenši textury, sniž počet segmentů zaoblení a nepoužívané materiály. Export ukáže velikost souboru.
- **[[líné načítání|Líné načítání]].** `Application` vytvoř, až se sekce blíží k oknu — přes `IntersectionObserver` z [lekce o API prohlížeče](see:js-dom/prohlizecova-api#sledovani-prvku-intersectionobserver-a-resizeobserver). Scéna v hero sekci úplně nahoře se načítá hned, ale až po zbytku stránky.
- **Náhradní obrázek.** Pod canvas dej statický obrázek scény (export PNG nebo SVG z editoru). Je vidět během načítání, při chybě i tam, kde se 3D nenačte vůbec. Po úspěšném `load` ho plynule schováš.
- **Mobil.** Na malé obrazovce a slabém telefonu často stačí jen obrázek. Rozhodni podle šířky nebo `navigator.connection?.saveData`, jestli scénu vůbec načítat.

:::live dom predict
```html
<p class="hint">Posuň ukázku dolů k modelu.</p>
<div class="spacer"></div>
<div class="stage">Tady bude 3D model</div>
<ol class="log"></ol>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }
.hint { position: sticky; top: 0; margin: 0; padding: 0.5rem; background: #fef3c7; }
.spacer { height: 1500px; background: linear-gradient(#f8fafc, #e2e8f0); }
.stage { height: 200px; display: grid; place-items: center; background: #1e293b; color: #fff; }
.log { position: fixed; right: 0.5rem; top: 2.5rem; margin: 0; padding: 0.5rem 1.5rem; background: #fff; box-shadow: 0 4px 12px rgb(0 0 0 / 0.15); }
```
```js
const stage = document.querySelector('.stage');
const log = document.querySelector('.log');

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const item = document.createElement('li');
    item.textContent = `callback, isIntersecting: ${entry.isIntersecting}`;
    log.append(item);
  }
});
observer.observe(stage);
```
--question-- Model je 1500 px pod ohybem. Co je v seznamu vpravo nahoře hned po načtení, ještě než stránku posuneš?
--option-- Nic, callback se zavolá až při vjezdu modelu do okna.
--option*-- Jeden řádek `callback, isIntersecting: false`.
--option-- Jeden řádek `callback, isIntersecting: true`.
--why-- `IntersectionObserver` zavolá callback hned po `observe` s počátečním stavem prvku, i když prvek v okně není. Kdo v callbacku rovnou vytvoří `Application` bez kontroly `isIntersecting`, načte scénu okamžitě a líné načítání nefunguje. Proto první řádek callbacku bývá `if (!entry.isIntersecting) return;`.
:::

Po odhalení posuň ukázku dolů a sleduj, kdy přibude řádek s `true`. Pak scrolluj zpátky nahoru — přibude znovu `false`. Proto se po načtení scény observer odpojí (`observer.disconnect()`), jinak by se `load` spouštěl opakovaně.

:::check
Callback `IntersectionObserver` volá `loadScene()`, když `entry.isIntersecting` je `true`. Uživatel na model třikrát najede a zase odjede. Kolikrát se scéna načte, když observer neodpojíš?

### --expected--

3

### --accept--

3×
třikrát

### --why--

Callback přijde s `true` při každém vjezdu do okna. Bez `observer.disconnect()` po prvním načtení vznikne při každém vjezdu nová `Application` a stáhne scénu znovu.

### --see--

web-3d-efekty/spline#vykon-velikost-sceny-line-nacitani-a-nahradni-obrazek
:::

## Přístupnost a kdy Spline nepoužít

- **Omezený pohyb.** S `prefers-reduced-motion: reduce` scénu zastav po načtení (`app.stop()` nechá vidět statický snímek) a nenapojuj ji na scroll ani myš. Proč na tom záleží, víš z [lekce o animacích](see:css-animace/transition-transform#omezeny-pohyb-prefers-reduced-motion).
- **Čtečky obrazovky a klávesnice.** Obsah canvasu nikdo nepřečte a na objekt ve scéně se klávesnicí nedostaneš. Všechno důležité (název produktu, parametry, výběr barvy) patří do HTML. Klik ve scéně je zkratka pro myš, ne jediná cesta. Canvasu dej `aria-label`, nebo ho u čistě dekorativní scény skryj přes `aria-hidden="true"`.
- **SEO.** Vyhledávač text vymodelovaný ve 3D nevidí. Nadpis a popis musí být skutečný text na stránce.
- **Kdy Spline nepoužít:** když by scéna nesla hlavní obsah stránky (text, ceny, navigaci); když cílovka chodí hlavně z levných telefonů nebo pomalých sítí; když scéna jen dekoruje a stejný dojem udělá obrázek nebo krátké video; nebo když potřebuješ 3D řízené daty — tam je lepší Three.js.

:::check
S omezeným pohybem chceš, aby scéna ze Splinu zůstala vidět, ale nic se v ní samo nehýbalo. Kterou metodu na `app` zavoláš po načtení?

### --expected--

app.stop()

### --accept--

stop()
stop

### --why--

`stop()` zastaví přehrávání scény a nechá vidět poslední snímek. Ještě nesmíš scénu napojit na scroll a myš — to je tvůj kód, ne runtime.

### --see--

web-3d-efekty/spline#pristupnost-a-kdy-spline-nepouzit
:::

## Typické chyby a pasti

> [!PITFALL]
> **Scéna se načítá hned po otevření stránky, přestože kód používá `IntersectionObserver`.** Callback nekontroluje `entry.isIntersecting` a první zavolání s `false` scénu spustí. Oprava: `if (!entry.isIntersecting) return;` na začátku callbacku a `observer.disconnect()` po spuštění načítání.

> [!PITFALL]
> **Tlačítka „barva" a „podsvícení" při rychlém kliknutí hned po načtení stránky hlásí `TypeError: Cannot read properties of undefined`.** Obsluha kliknutí sahá na objekty scény, která ještě není načtená. Oprava: tlačítka napoj až po `await app.load(…)`, do té doby je nech `disabled`.

> [!PITFALL]
> **V Reactu ve vývojovém režimu vzniknou dvě scény a prohlížeč hlásí `WARNING: Too many active WebGL contexts`.** StrictMode komponentu připojí, odpojí a připojí znovu, a vlastní `useEffect` s `new Application` bez úklidu nechá první scénu běžet. Oprava: v návratové funkci efektu zavolej `app.dispose()`, nebo použij hotovou komponentu `@splinetool/react-spline`, která to dělá sama.

> [!PITFALL]
> **Canvas je prázdný, konzole mlčí.** Canvas nemá výšku (rodič bez výšky), nebo ho zakrývá náhradní obrázek, který se po načtení neschoval. Zkontroluj velikost canvasu a vrstvy v DevTools.

:::check
Proč se v callbacku `IntersectionObserver` po spuštění načítání scény volá `observer.disconnect()`?

### --answer--

Aby se ušetřila paměť observeru.

#### --why--

Observer paměti moc nezabírá. Podívej se, co by se stalo při dalším vjezdu sekce do okna.

### --correct--

Aby se scéna nenačítala znovu při každém dalším vjezdu sekce do okna.

#### --why--

Callback přichází při každé změně viditelnosti. Po prvním načtení už ho nepotřebuješ, a bez odpojení by každý návrat vytvořil další `Application`.

### --answer--

Protože `app.load` jinak nedoběhne.

#### --why--

`load` na observeru nezávisí, doběhne i bez odpojení. Problém je, co se stane potom.

### --see--

web-3d-efekty/spline#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) — počáteční zavolání callbacku, `isIntersecting` a `rootMargin` pro načtení s rezervou.
- [Lazy loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading) — proč odkládat těžká média a jak to dělají obrázky a iframy.
- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — kdo si omezený pohyb zapíná a jak ho zjistit z CSS i JavaScriptu.
- [ARIA: img role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/img_role) — jak canvasu dát textový popis.

Dokumentace samotného runtime je v README balíčku `@splinetool/runtime` na npm (seznam metod `Application` a událostí).

V dalším workshopu vložíš scénu mechanické klávesnice do produktové stránky: líně, s náhradním obrázkem, napojenou na tlačítka a scroll.

# --questions--

## --question--

Designér přejmenoval ve Splinu objekt „Víčko" na „Víčko lahve" a pošle nový export. Na webu přestane fungovat změna barvy z tlačítek. Proč, a jak se tomu předchází?

### --answer--

Nový export je poškozený, je potřeba ho vyexportovat znovu.

#### --why--

Export je v pořádku, scéna se načte. Změna barvy ale hledá objekt podle něčeho, co se změnilo.

### --correct--

Kód hledá objekt podle starého jména. Jména objektů a proměnných jsou dohodnuté rozhraní scény a mění se jen po domluvě.

#### --why--

`findObjectByName('Víčko')` teď vrací `undefined`. Jména ve scéně jsou pro kód stejně důležitá jako jména funkcí v API, proto se o nich s designérem domlouváš.

### --answer--

Runtime si pamatuje staré jméno v mezipaměti prohlížeče.

#### --why--

Prohlížeč stáhne nový soubor a runtime v něm najde nová jména. Problém je v kódu, ne v mezipaměti.

### --see--

web-3d-efekty/spline#ovladani-sceny-z-javascriptu

## --question--

Napiš podmínku, kterou začíná callback `IntersectionObserver`, aby se nic nedělo, dokud prvek `entry.target` není v okně.

### --expected--

if (!entry.isIntersecting) return;

### --accept--

if (!entry.isIntersecting) return
if (entry.isIntersecting === false) return;

### --why--

První zavolání přichází hned s `isIntersecting: false`. Bez podmínky by se scéna načetla okamžitě.

### --see--

web-3d-efekty/spline#vykon-velikost-sceny-line-nacitani-a-nahradni-obrazek

## --question--

Kterým propem komponenty `@splinetool/react-spline` dostaneš `Application`, abys po načtení mohl zavolat `setVariable`?

### --expected--

onLoad

### --why--

`onLoad` se zavolá po načtení scény a dostane instanci `Application` se všemi metodami, stejně jako `await app.load()` ve vanilla JS.

### --see--

web-3d-efekty/spline#spline-v-reactu
