# Výkon a přístupnost animací

:::check pretest
Animuješ kartu tak, že jí měníš `left` z `0` na `200px`. Kolega říká, že to má být `transform: translateX(200px)`. Proč?

### --answer--
Protože `left` funguje jen na pozicovaných prvcích.

#### --why--
To je pravda, ale s plynulostí to nesouvisí — na pozicovaném prvku by `left` fungoval
a stejně by se trhal.

### --correct--
Protože změna `left` nutí prohlížeč u každého snímku znovu spočítat rozvržení, kdežto `transform` jen posune hotový obrázek.

#### --why--
Rozvržení a malování jsou nejdražší kroky. `transform` a `opacity` je oba přeskočí —
prohlížeč jen jinak poskládá hotové vrstvy.

### --answer--
Protože `transform` umí zlomky pixelu a `left` ne.

#### --why--
Zlomky pixelu umí obojí. Rozdíl je v tom, kolik práce si prohlížeč musí u každého
snímku udělat.
:::

Animace, která se trhá, je horší než žádná. A animace, ze které je někomu špatně, je
ještě o kus horší — a týká se to víc lidí, než by tě napadlo.

Tahle lekce je o dvou věcech, které se řeší až nakonec a měly by se řešit od začátku:
**aby to jelo plynule** a **aby to šlo vypnout**.

## Rozpočet 16 milisekund

Při 60 snímcích za vteřinu má prohlížeč na jeden snímek **16,7 ms**. Do toho se musí
vejít všechno: tvůj JavaScript, výpočet stylů, rozvržení, malování a složení vrstev.
Když se to nestihne, snímek vypadne — a oko to pozná okamžitě.

Kolik práce jeden snímek stojí, záleží na tom, **kterou vlastnost animuješ**. Ne každá
změna spustí celou [[cesta k pixelům|cestu k pixelům]]:

| co animuješ | co musí prohlížeč udělat | cena |
|---|---|---|
| `width`, `height`, `top`, `left`, `margin`, `padding` | rozvržení → malování → složení | **nejdražší** |
| `background-color`, `box-shadow`, `border-radius`, `color` | malování → složení | střední |
| `transform`, `opacity`, `filter` | jen složení | **nejlevnější** |

Pravidlo, které se vyplatí mít v hlavě: **animuj `transform` a `opacity`.** Skoro všechno,
co vypadá jako pohyb nebo prolínání, se dá přes ně udělat.

:::compare
```html
<div class="pas"><div class="box">posouvám se</div></div>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }
.pas { position: relative; height: 5rem; margin: 1rem; background: #eef1f4; border-radius: .5rem; }
.box {
  position: absolute; top: 1rem; left: 0;
  display: grid; place-items: center;
  width: 9rem; height: 3rem;
  border-radius: .4rem; background: #29527a; color: #fff; font-size: .875rem;
  animation: jed 1.6s ease-in-out infinite alternate;
}
```
--variant-- Přes `left` (rozvržení u každého snímku)
```css
@keyframes jed { to { left: calc(100% - 9rem); } }
```
--variant-- Přes `transform` (jen složení)
```css
@keyframes jed { to { transform: translateX(calc(100vw - 9rem - 2rem)); } }
```
:::

Na výkonném počítači vypadají obě stejně. Rozdíl uvidíš, až přidáš dalších dvacet
takových prvků nebo to otevřeš na telefonu za čtyři tisíce — a přesně na takovém
telefonu si stránku otevře většina lidí.

:::check
Chceš, aby se karta při najetí myší zvětšila. Která dvojice vlastností to udělá nejlevněji?

### --correct--
`transform: scale(1.05)` a případně `opacity`

#### --why--
`scale` je součást `transform`, takže prohlížeč jen jinak poskládá hotovou vrstvu.
Rozvržení ani malování se neopakuje.

### --answer--
`width` a `height` o pár procent

#### --why--
Změna rozměrů posune i všechno kolem — prohlížeč musí u každého snímku přepočítat
rozvržení celé stránky.

### --answer--
`zoom`

#### --why--
`zoom` mění skutečnou velikost prvku v rozvržení, takže je na tom stejně jako `width`.
A animovat se pořádně nedá.
:::

:::live js predict
```js
// Kolik milisekund má prohlížeč na jeden snímek, když má držet 60 snímků za vteřinu?
const snimkuZaVterinu = 60;
console.log((1000 / snimkuZaVterinu).toFixed(1));
```
--question-- Co vypíše `console.log`?
--expected-- 16.7
--why-- Vteřina děleno šedesáti. Do těch 16,7 ms se musí vejít tvůj JavaScript, výpočet stylů, rozvržení, malování i složení vrstev — ne jen animace samotná. Proto se u animace počítá každá vlastnost, která přidá práci navíc.
:::

## Co říká panel Performance

Když se něco trhá, hádat nemusíš. V DevTools na kartě **Performance** klikni na nahrávání,
udělej tu akci a nahrávání zastav.

Co hledat:

- **Červený roh nad snímkem** — snímek se nestihl. Klikni na něj a uvidíš, co ho zdrželo.
- **Fialové bloky `Layout`** během animace — něco nutí prohlížeč přepočítávat rozvržení.
  Přesně to má `transform` odstranit.
- **Zelené `Paint`** u každého snímku — maluje se znovu, typicky kvůli stínu nebo barvě.
- **Žluté `Scripting`** v jednom dlouhém kuse — tvůj kód, ne animace. Ten se musí
  rozdělit, jinak nepomůže žádná optimalizace vykreslování.

> [!TIP]
> Zapni si v Performance zpomalení procesoru na **4× slowdown**. Na plném výkonu je
> plynulé skoro všechno; problémy se ukážou až tam, kde je mají uživatelé.

:::check
V záznamu Performance vidíš při každém snímku animace fialový blok `Layout`. Co to znamená?

### --expected--
animuje se vlastnost, která mění rozvržení

### --accept--
něco přepočítává layout
animuje se width nebo left místo transform
mění se rozvržení
:::

## `will-change`: slib, ne kouzlo

`will-change: transform` řekne prohlížeči dopředu „tohle se bude hýbat, připrav si na to
vlastní vrstvu". Pomůže to ve chvíli, kdy animace začne **náhle** a první snímek se kvůli
přípravě zadrhne.

Má to ale dvě podmínky:

```css
/* Dobře: slib platí jen po dobu, kdy se opravdu bude hýbat. */
.karta:hover { will-change: transform; }

/* Špatně: trvalý slib na stovce prvků sežere paměť a výkonu ubere. */
.karta { will-change: transform, opacity, filter; }
```

Každá vrstva navíc stojí paměť — na telefonu i desítky megabajtů. `will-change` proto
nasazuj až tehdy, když v Performance vidíš, že první snímek animace zaostává, a jen na
prvky, kterých se to týká.

> [!PITFALL]
> `will-change` na prvku zároveň zakládá nový stacking context a obsahující blok pro
> `position: fixed` — stejně jako `transform`. Čekáš-li, že ti uvnitř bude fungovat
> přišpendlený prvek, překvapí tě to.

:::check
Kdy má smysl nasadit `will-change`?

### --correct--
Když v Performance vidíš, že se zadrhne právě první snímek animace — a jen na tu chvíli, kdy se prvek chystá hýbat.

#### --why--
Je to příprava, ne zrychlení. Trvale zapnutý `will-change` na mnoha prvcích výkon
naopak zhorší, protože každá vrstva stojí paměť.

### --answer--
Vždycky, když prvek animuješ — je to zadarmo.

#### --why--
Zadarmo to není. Vrstva navíc znamená paměť navíc a na telefonu je jí málo.

### --answer--
Nikdy, moderní prohlížeče to nepotřebují.

#### --why--
Potřeba bývá výjimečně, ale existuje. Jen se nasazuje cíleně a podle měření.
:::

## Když animaci brzdí JavaScript

Nejčastější kaz plynulosti nebývá CSS, ale kód, který během animace **čte rozměry
a hned zase zapisuje**. Každé čtení (`offsetWidth`, `getBoundingClientRect`,
`scrollTop`) donutí prohlížeč dopočítat rozvržení, aby mohl odpovědět — a když se
pak hned zapisuje, musí to příště udělat znovu. Tomu se říká [[layout thrashing]].

:::live js
```js
const prvky = Array.from({ length: 5 }, (_, i) => ({ sirka: 100 + i * 20, styl: {} }));

// Špatně: čtu a hned zapisuju, a tak dokola.
console.log('— prokládané čtení a zápis —');
for (const prvek of prvky) {
  const sirka = prvek.sirka;            // čtení → prohlížeč musí dopočítat rozvržení
  prvek.styl.width = sirka * 2 + 'px';  // zápis → rozvržení je zase neplatné
  console.log('čtu', sirka, 'zapisuju', prvek.styl.width);
}

// Dobře: nejdřív všechno přečtu, pak všechno zapíšu.
console.log('— nejdřív čtení, pak zápis —');
const sirky = prvky.map((prvek) => prvek.sirka);
sirky.forEach((sirka, i) => { prvky[i].styl.width = sirka * 2 + 'px'; });
console.log('přečteno naráz:', sirky.join(', '));
```
:::

Pravidlo je jednoduché: **v jedné otočce nejdřív všechno přečti, pak všechno zapiš.**
GSAP i Motion to uvnitř dělají za tebe; jakmile ale sáhneš na rozměry sám, platí to
i pro tebe.

Druhý brzdič je dlouhá úloha v hlavním vlákně. Animace běží na stejném vlákně jako
tvůj kód, takže výpočet, který trvá 300 ms, animaci prostě zastaví. Řešení je rozdělit
ho na dávky a mezi nimi vlákno uvolnit.

:::check
Proč se nevyplatí v cyklu střídat `getBoundingClientRect()` a zápis do `style`?

### --expected--
prohlížeč musí pokaždé přepočítat rozvržení

### --accept--
vynutí to layout při každém průchodu
layout thrashing
každé čtení po zápisu vynutí dopočítání rozvržení
:::

## `prefers-reduced-motion`: pro koho to je

Zhruba každý třetí člověk má nějakou míru citlivosti na pohyb; u části z nich vyvolá
parallax nebo velký posun na obrazovce skutečnou nevolnost, závrať nebo migrénu. Není
to preference „nemám rád animace" — je to zdravotní nastavení, které si člověk zapnul
v systému.

Prohlížeč ti ho řekne [[omezený pohyb|media dotazem]]:

```css
@media (prefers-reduced-motion: reduce) {
  /* sem patří tlumená varianta */
}
```

**Co vypnout:** velké posuny přes obrazovku, parallax, zvětšování a otáčení,
automatické karusely, scrollem řízené animace, které stránku „berou pod kontrolou".

**Co nechat:** krátké prolínání (`opacity`), změnu barvy, drobné posuny do pár pixelů,
indikátor načítání. Úplně vypnutý pohyb vede k tomu, že se věci objevují skokem a
uživatel neví, co se změnilo — a to je taky problém.

:::live dom libs=gsap
```html
<div class="ukazka">
  <p class="stav"></p>
  <div class="karty">
    <div class="karta">Jedna</div>
    <div class="karta">Dvě</div>
    <div class="karta">Tři</div>
  </div>
  <button id="znovu">Přehrát znovu</button>
</div>
```
```css
body { margin: 0; font-family: system-ui, sans-serif; }
.ukazka { padding: 1rem; }
.stav { margin: 0 0 .75rem; color: #5a6674; font-size: .875rem; }
.karty { display: flex; gap: .75rem; margin-bottom: 1rem; }
.karta { display: grid; place-items: center; width: 6rem; height: 4rem; border-radius: .5rem; background: #29527a; color: #fff; }
button { padding: .45rem 1rem; font: inherit; }
```
```js
import gsap from 'gsap';

const tlumit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelector('.stav').textContent = tlumit
  ? 'Systém hlásí omezený pohyb — karty se jen prolnou.'
  : 'Běžný režim — karty přiletí zdola s prodlevou.';

function prehraj() {
  if (tlumit) {
    gsap.fromTo('.karta', { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0 });
  } else {
    gsap.fromTo('.karta', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' });
  }
}

document.querySelector('#znovu').addEventListener('click', prehraj);
prehraj();
```
:::

Všimni si, že tlumená varianta **není žádná animace** — je to kratší a menší animace.
Obsah se pořád objeví, jen tiše.

> [!REMEMBER]
> `prefers-reduced-motion` se nečte jen v CSS. Když animuješ z JavaScriptu, zeptej se
> na něj přes `matchMedia` a přepni na tlumenou variantu — knihovna to za tebe neudělá.

:::check
Uživatel má v systému zapnuté omezení pohybu. Co má tvoje stránka udělat s odhalováním sekcí při scrollu?

### --correct--
Ukázat je bez posunu — třeba krátkým prolnutím, nebo rovnou viditelné.

#### --why--
Cílem není schovat obsah, ale zbavit se pohybu. Obsah musí být vidět v obou případech —
jinak si uživatel s omezeným pohybem nepřečte půlku stránky.

### --answer--
Nechat animaci, jen ji zpomalit.

#### --why--
Pomalejší velký posun je pro citlivého člověka horší než rychlý. Vadí pohyb, ne rychlost.

### --answer--
Nedělat nic — je to jen preference vzhledu.

#### --why--
Je to zdravotní nastavení. U části lidí vyvolá parallax skutečnou nevolnost.
:::

## Ještě dvě věci k přístupnosti

**Animace nesmí být jediný nositel informace.** Když se po odeslání formuláře jen
zatřese tlačítko, člověk se čtečkou obrazovky se nic nedozví. Stav patří i do textu
a do živé oblasti.

**Nic nesmí blikat víc než třikrát za vteřinu.** Rychlé záblesky mohou vyvolat
epileptický záchvat; je to jedno z mála pravidel WCAG, které je opravdu tvrdé.

:::check
Po uložení formuláře přehraješ zelenou fajfku, která se roztáhne a zmizí. Co musíš doplnit?

### --expected--
textovou hlášku

### --accept--
text pro čtečku obrazovky
hlášku v živé oblasti
stav i textem
:::

## Typické chyby a pasti

- **Animace `width`, `height`, `top` nebo `left`** místo `transform`. Vypadá stejně,
  stojí násobně víc a na telefonu se to pozná.
- **`will-change` napevno na všem.** Paměť navíc bez užitku — a překvapení
  s `position: fixed` uvnitř.
- **Čtení rozměrů uprostřed animace.** Jedno `offsetHeight` ve špatné chvíli shodí
  plynulost celé sekvence.
- **Test jen na svém počítači.** Zapni zpomalení procesoru na 4× a zkus to znovu.
- **Vypnutý pohyb znamená vypnutý obsah.** Když v tlumené variantě zapomeneš prvky
  zviditelnit, zůstanou na `opacity: 0` navždy.
- **`prefers-reduced-motion` ošetřený jen v CSS**, zatímco animace běží z JavaScriptu.
- **Nekonečná animace mimo zorné pole.** Běží dál, žere baterii a nikdo ji nevidí;
  vypni ji, když prvek není vidět.
- **Scroll efekt, který přebírá scrollování.** Uživatel točí kolečkem a stránka se
  posune někam úplně jinam.

> [!PITFALL]
> Nejzrádnější z nich je ta poslední dvojice: **tlumená varianta, ve které prvky zůstanou
> neviditelné**. Když v běžném režimu startuješ z `opacity: 0` a při omezeném pohybu jen
> vypneš animaci, uživatel uvidí prázdnou stránku. Tlumená varianta musí obsah
> **zviditelnit**, ne jen přestat hýbat.

:::check
V běžném režimu startují sekce z `opacity: 0` a animace je zviditelní. Co musíš udělat v tlumené variantě?

### --expected--
nastavit opacity na 1

### --accept--
zviditelnit je
nechat je rovnou viditelné
nastavit je na plnou průhlednost
prolnout je krátce do opacity 1
:::

## Kde to najdeš v MDN

- [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — včetně tabulky podpory.
- [`will-change`](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change) — má tam i varování, kdy ho nepoužívat.
- [How browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work) — které kroky se při které změně opakují.
- [Animation performance and frame rate](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate) — proč je rozpočet 16 ms.

# --questions--

## --question--

Napiš dvě vlastnosti, jejichž animace nevyžaduje ani rozvržení, ani malování.

### --expected--

transform a opacity

### --accept--

transform, opacity
opacity a transform

### --why--

Obě se vyřídí až při skládání vrstev, takže prohlížeč u každého snímku jen jinak
poskládá hotové obrázky. `filter` je na tom podobně, ale bývá dražší.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#rozpocet-16-milisekund

## --question--

Kolik milisekund má prohlížeč na jeden snímek při 60 fps?

### --expected--

16

### --accept--

16,7
16.7
asi 17

### --why--

Vteřina děleno šedesáti. Do toho se musí vejít tvůj JavaScript, výpočet stylů, rozvržení,
malování i složení vrstev — ne jen animace samotná.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#rozpocet-16-milisekund

## --question--

Kdy se `will-change` vyplatí?

### --correct--

Když měření ukáže, že se zadrhává první snímek animace — a nasadí se jen na ty prvky a jen na tu dobu.

#### --why--

Je to příprava vrstvy dopředu, ne zrychlení. Každá vrstva navíc stojí paměť, takže
trvale zapnutý `will-change` na mnoha prvcích výkon zhorší.

### --answer--

Vždycky, když prvek animuješ.

#### --why--

Tím si spolehlivě ukousneš paměť. Moderní prohlížeče si vrstvu u běžné animace
`transform` udělají samy.

### --answer--

Jen u animací řízených scrollem.

#### --why--

S druhem animace to nesouvisí. Rozhoduje, jestli měření ukázalo problém.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#will-change-slib-ne-kouzlo

## --question--

Kód v cyklu čte `el.offsetWidth` a hned zapisuje `el.style.width`. Napiš, jak se téhle chybě říká.

### --expected--

layout thrashing

### --accept--

vynucené přepočítávání rozvržení
thrashing

### --why--

Každé čtení po zápisu donutí prohlížeč dopočítat rozvržení, aby mohl odpovědět.
Řeší se rozdělením na dvě fáze: nejdřív všechna čtení, pak všechny zápisy.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#kdyz-animaci-brzdi-javascript

## --question--

Uživatel má zapnuté omezení pohybu. Jak se má chovat odhalování sekcí při scrollu?

### --correct--

Sekce se ukážou bez posunu — krátkým prolnutím, nebo rovnou viditelné.

#### --why--

Vypnout se má **pohyb**, ne obsah. Nejčastější chyba je nechat prvky na `opacity: 0`
a zrušit jen animaci — obsah pak nikdy nenaskočí.

### --answer--

Animace se nechá, jen se zpomalí.

#### --why--

Pomalý velký posun je pro citlivého člověka horší než rychlý. Vadí pohyb jako takový.

### --answer--

Scrollování se úplně vypne.

#### --why--

Tím bys stránku znepřístupnil úplně. Omezení pohybu se týká animací, ne scrollování.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#prefers-reduced-motion-pro-koho-to-je

## --question--

Animaci spouštíš z JavaScriptu přes GSAP. Napiš, jak zjistíš, že má uživatel zapnuté omezení pohybu.

### --expected--

matchMedia('(prefers-reduced-motion: reduce)')

### --accept--

window.matchMedia
přes matchMedia
matchMedia('(prefers-reduced-motion: reduce)').matches

### --why--

Media dotaz v CSS na animace v JavaScriptu nezabere — knihovna o něm neví. `matchMedia`
vrátí objekt s vlastností `matches` a dá se na něj i navěsit posluchač, kdyby uživatel
nastavení změnil za běhu.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#prefers-reduced-motion-pro-koho-to-je

## --question--

Proč se vyplatí zapnout v panelu Performance zpomalení procesoru?

### --correct--

Protože na vývojářském počítači je plynulé skoro všechno — problémy se ukážou až na výkonu, který mají skuteční uživatelé.

#### --why--

Typický návštěvník má telefon o řád pomalejší než tvůj notebook. Čtyřnásobné zpomalení
je hrubý odhad, ale najde věci, které by ti jinak prošly.

### --answer--

Protože jinak se záznam nedá nahrát.

#### --why--

Nahrát jde i bez toho. Jen v něm nic neuvidíš.

### --answer--

Protože to zpřesní měření časů.

#### --why--

Časy jsou přesné i bez něj. Zpomalení mění podmínky, ne přesnost.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#co-rika-panel-performance
