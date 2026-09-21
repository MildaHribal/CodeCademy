---
pass: 0.8
---

# --questions--

## --question--

Napiš, čím se v GSAP liší `gsap.to()` a `gsap.from()`.

### --expected--

to animuje do hodnot, from z hodnot

### --accept--

to jde do zadaných hodnot, from z nich do současných
from začíná na zadaných hodnotách
to = kam, from = odkud

### --why--

`to` bere současný stav jako začátek a zadané hodnoty jako cíl. `from` je obrátí: zadané
hodnoty jsou start a cílem je to, co prvek má teď. Proto se `from` hodí na odhalování —
napíšeš, odkud má prvek připlout, a konec je hotová stránka.

### --see--

css-efekty-animace/gsap-zaklady#gsap-to-from-fromto-a-set

## --question--

Dvě animace mají doběhnout těsně po sobě a nechceš počítat `delay`. Co použiješ?

### --correct--

Timeline — animace se do ní přidávají za sebe a pozice se dopočítá sama.

#### --why--

Timeline navíc jde ovládat jako celek: `pause()`, `reverse()`, `timeScale()`.
S ručně počítanými `delay` se každá změna délky musí přepsat na všech místech.

### --answer--

`stagger` — od toho tam je.

#### --why--

`stagger` rozprostře **jednu** animaci mezi víc prvků. Na řetězení dvou různých animací
to není.

### --answer--

`gsap.set()` s `delay`.

#### --why--

`set` nastaví hodnoty okamžitě, nic neanimuje.

### --see--

css-efekty-animace/gsap-zaklady#timeline-sekvence-bez-pocitani-delay

## --question--

V timeline chceš, aby animace začala **0,2 s před koncem** té předchozí. Napiš pozici, kterou předáš jako třetí argument.

### --expected--

-=0.2

### --accept--

"-=0.2"
'-=0.2'

### --why--

Relativní pozice se počítá od konce timeline: `-=0.2` znamená „začni o dvě desetiny
dřív", `+=0.2` „o dvě desetiny později". Překrytí animací je to, co dělá sekvenci
plynulou místo trhané.

### --see--

css-efekty-animace/gsap-zaklady#timeline-sekvence-bez-pocitani-delay

## --question--

K čemu je ve ScrollTriggeru volba `scrub`?

### --correct--

Přilepí průběh animace k posuvníku — pozice animace odpovídá tomu, kam uživatel doscrolloval.

#### --why--

Bez `scrub` se animace jen spustí, když trigger dorazí na `start`, a doběhne vlastním
tempem. Se `scrub` si ji uživatel scrollem přehrává dopředu i zpátky. Číslo místo `true`
(třeba `scrub: 0.5`) přidá setrvačnost.

### --answer--

Zpomalí scrollování, aby se animace stihla.

#### --why--

Scrollování nijak nebrzdí. Mění se, čím je animace řízená — časem, nebo posuvníkem.

### --answer--

Vyčistí animaci po doběhnutí.

#### --why--

Na úklid jsou `gsap.context()` a `revert()`.

### --see--

css-efekty-animace/scroll-efekty#scrub-animace-prilepena-k-posuvniku

## --question--

Sekce s `pin: true` se po zapnutí rozbije: obsah pod ní vyskočí nahoru. Čím to je?

### --correct--

Ničím — ScrollTrigger si kolem sekce vyrobí obal `.pin-spacer`, který místo drží. Pokud to skáče, měří se špatně (obrázky bez rozměrů, pozdě načtené písmo).

#### --why--

Nejčastější příčina je, že se rozměry stránky změnily **po** tom, co si ScrollTrigger
spočítal pozice. Pomůže doplnit rozměry obrázkům a zavolat `ScrollTrigger.refresh()`
po načtení.

### --answer--

`pin` se musí kombinovat s `position: sticky` v CSS.

#### --why--

Naopak — `position: sticky` na pinované sekci si s tím leze do zelí. `pin` si pozicování
řeší sám.

### --answer--

Pinovaná sekce musí být poslední na stránce.

#### --why--

Nemusí. Pinovat jde kterákoli sekce, klidně i několik za sebou.

### --see--

css-efekty-animace/scroll-efekty#pin-sekce-ktera-zustane-stat

## --question--

Napiš, kterou metodu ScrollTriggeru zavoláš, když se rozměry stránky změnily (načetly se obrázky, rozbalil se panel).

### --expected--

ScrollTrigger.refresh()

### --accept--

refresh
ScrollTrigger.refresh

### --why--

ScrollTrigger si pozice `start` a `end` spočítá jednou. Když se stránka potom natáhne
nebo zkrátí, počítá s neplatnými čísly. `refresh()` je přepočítá; u hodnot, které závisí
na rozměrech, se hodí i `invalidateOnRefresh: true`.

### --see--

css-efekty-animace/scroll-efekty#rozmery-se-meni-refresh-a-invalidateonrefresh

## --question--

Jaké tři kroky má technika FLIP?

### --correct--

Změř výchozí pozici, proveď změnu, změř novou pozici a prvek animuj z rozdílu zpátky do nové polohy.

#### --why--

FLIP = First, Last, Invert, Play. Trik je v tom, že se neanimuje rozvržení (drahé),
ale `transform`, který vypadá stejně a je levný. Plugin Flip dělá přesně tohle
(`Flip.getState`, změna, `Flip.from`).

### --answer--

Nastav `transition`, změň třídu, počkej na `transitionend`.

#### --why--

To je běžný CSS přechod. Ten ale neumí animovat změnu, která posune prvek jinam
v rozvržení.

### --answer--

Naklonuj prvek, animuj klon a původní schovej.

#### --why--

Tenhle trik se používá u sdílených prvků mezi stránkami, ale FLIP to není.

### --see--

css-efekty-animace/layout-a-view-transitions#technika-flip-rucne

## --question--

Napiš dvě vlastnosti, které jdou animovat nejlevněji — bez rozvržení a bez malování.

### --expected--

transform a opacity

### --accept--

transform, opacity
opacity a transform

### --why--

Obě se vyřídí až při skládání vrstev. Proto se posun dělá `x`/`y` (tedy `transform`)
a ne `left`/`top`, a zvětšení `scale` a ne `width`.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#rozpocet-16-milisekund

## --question--

Uživatel má v systému zapnuté omezení pohybu. Co uděláš s odhalováním sekcí, které startují z `opacity: 0`?

### --correct--

Nastavím je rovnou na `opacity: 1`. Vypnout se má pohyb, ne obsah.

#### --why--

Tohle je nejčastější chyba celé sekce: animace se vypne a prvky zůstanou neviditelné
navždy. Tlumená varianta musí obsah zviditelnit — klidně krátkým prolnutím.

### --answer--

Nechám animaci, jen ji zkrátím na polovinu.

#### --why--

Vadí pohyb jako takový, ne jeho délka. Rychlejší velký posun je pořád velký posun.

### --answer--

Vypnu skript úplně.

#### --why--

Pak zůstanou kapitoly na `opacity: 0` a uživatel neuvidí nic.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#prefers-reduced-motion-pro-koho-to-je

## --question--

Napiš, jak v JavaScriptu zjistíš, že má uživatel zapnuté omezení pohybu.

### --expected--

matchMedia('(prefers-reduced-motion: reduce)')

### --accept--

window.matchMedia
matchMedia('(prefers-reduced-motion: reduce)').matches
přes matchMedia

### --why--

Media dotaz v CSS na animace spouštěné z GSAP nebo Motion nezabere — knihovna o něm
neví. GSAP na to má navíc `gsap.matchMedia()`, který se postará i o úklid, když
uživatel nastavení změní za běhu.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#prefers-reduced-motion-pro-koho-to-je

## --question--

Kdy je scroll efekt spíš na škodu?

### --correct--

Když bere uživateli kontrolu nad scrollováním — stránka skáče jinam, než kam točí kolečkem.

#### --why--

Tomu se říká scrolljacking. Uživatel má naučený vztah „kolečko dolů = obsah nahoru"
a rozbít ho znamená, že neví, kde je. Plynulé scrollování (Lenis) ten vztah zachovává,
jen ho vyhladí.

### --answer--

Vždycky, když stránka obsahuje text — animace odvádějí pozornost od čtení.

#### --why--

Odhalování textu při scrollu je zavedený a funkční formát. Záleží na míře.

### --answer--

Když se používá GSAP místo CSS.

#### --why--

Knihovna s tím nesouvisí. Stejně dobře i stejně špatně se dá scrollovat s oběma.

### --see--

css-efekty-animace/scroll-efekty#kdy-scroll-efekt-skodi

## --question--

V panelu Performance vidíš při každém snímku animace fialový blok `Layout`. Napiš, co je pravděpodobně špatně.

### --expected--

animuje se vlastnost, která mění rozvržení

### --accept--

animuje se width nebo left místo transform
mění se rozvržení
layout thrashing

### --why--

`transform` a `opacity` rozvržení nevyvolají. Když se `Layout` objevuje u každého
snímku, buď se animuje `width`/`height`/`top`/`left`, nebo kód mezi snímky čte rozměry
a hned zapisuje.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#co-rika-panel-performance

## --question--

Z minulé sekce o CSS animacích: čím se liší `transition` a `@keyframes`?

### --correct--

`transition` animuje změnu mezi dvěma stavy, `@keyframes` popisuje průběh s libovolným počtem mezistavů a jde přehrávat sám od sebe.

#### --why--

Proto se `transition` hodí na hover a změnu třídy, kdežto `@keyframes` na načítací
indikátory, vlnění a všechno, co běží bez zásahu uživatele.

### --answer--

`transition` je starší způsob, `@keyframes` ho nahradilo.

#### --why--

Obojí je aktuální a používá se vedle sebe na různé věci.

### --answer--

`@keyframes` funguje jen s `animation-timeline`.

#### --why--

`animation-timeline` je novější doplněk, kterým se `@keyframes` řídí scrollem. Bez něj
se řídí časem, jako vždycky.

### --see--

css-animace/keyframes

## --question--

Taky z dřívějška: proč má obrázek v HTML zapsané `width` a `height`, i když velikost řídí CSS?

### --correct--

Aby prohlížeč znal poměr stran dřív, než se obrázek stáhne, a nechal si na něj místo — jinak obsah poskočí.

#### --why--

U scroll příběhů je to dvojnásob důležité: když se stránka po načtení obrázků natáhne,
ScrollTrigger počítá s neplatnými pozicemi a efekty se rozjedou.

### --answer--

Kvůli SEO — vyhledávač podle toho pozná velikost náhledu.

#### --why--

Vyhledávač si rozměry zjistí ze souboru. Jde o to, aby je prohlížeč znal **předem**.

### --answer--

Protože bez nich se obrázek nenačte na mobilu.

#### --why--

Načte se všude. Jen se kolem něj bude poskakovat.

### --see--

html-zaklady/jak-funguje-web#co-prohlizec-udela-s-html

## --question--

Napiš, co udělá `gsap.context()` a `revert()` dohromady.

### --expected--

uklidí animace vytvořené uvnitř

### --accept--

vrátí prvky do původního stavu a zruší animace
zruší všechno, co v kontextu vzniklo
uklidí po sobě

### --why--

`gsap.context()` si zapamatuje všechno, co uvnitř vznikne (animace, ScrollTriggery),
a `revert()` to naráz zruší a vrátí prvky do výchozího stavu. Bez toho zůstanou
v Reactu nebo při přepnutí stránky viset staré animace na prvcích, které už nejsou.

### --see--

css-efekty-animace/gsap-zaklady#uklid-gsap-context-a-revert
