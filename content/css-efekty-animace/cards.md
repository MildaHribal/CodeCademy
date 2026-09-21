## --card-- free

Čím se v GSAP liší `to`, `from`, `fromTo` a `set`?

### --back--

`to` animuje ze současného stavu **do** zadaných hodnot. `from` obráceně: zadané hodnoty
jsou start, cílem je současný stav (proto se hodí na odhalování). `fromTo` říká obojí
a nespoléhá na to, co je na prvku teď. `set` nastaví hodnoty okamžitě, bez animace.

### --see--

css-efekty-animace/gsap-zaklady#gsap-to-from-fromto-a-set

## --card-- free

K čemu je `stagger` a čím se liší od timeline?

### --back--

`stagger` rozprostře **jednu** animaci mezi víc prvků — každý další začne o kousek
později, takže vznikne vlna místo pochodu. Timeline naproti tomu řadí **různé** animace
za sebe a dá se ovládat jako celek.

### --see--

css-efekty-animace/gsap-zaklady#stagger-vlna-misto-pochodu

## --card-- free

Jak v timeline zařídíš, aby animace začala 0,3 s před koncem té předchozí? A 0,3 s po ní?

### --back--

Relativní pozicí jako třetím argumentem: `'-=0.3'` začne dřív (animace se překryjí),
`'+=0.3'` později (vznikne pauza). Bez pozice se animace zařadí přesně na konec té
předchozí. Překrývání je to, co dělá sekvenci plynulou.

### --see--

css-efekty-animace/gsap-zaklady#timeline-sekvence-bez-pocitani-delay

## --card-- free

Jak se timeline ovládá zvenčí?

### --back--

`play()`, `pause()`, `reverse()`, `restart()`, `seek(cas)`, `progress(0…1)`
a `timeScale(n)` (rychlost — `2` je dvakrát rychleji, `0.5` na polovinu). Díky tomu
jde jedna sekvence použít na otevření i zavření dialogu: podruhé jen pozpátku.

### --see--

css-efekty-animace/gsap-zaklady#ovladani-play-pause-reverse-progress-a-timescale

## --card-- free

Co dělá `autoAlpha` a proč je lepší než samotná `opacity`?

### --back--

Animuje `opacity` a zároveň přepíná `visibility`. Prvek na nule tak není jen průhledný,
ale ani neklikatelný a čtečka obrazovky ho přeskočí. Se samotnou `opacity: 0` zůstává
neviditelná past, na kterou se dá kliknout.

### --see--

css-efekty-animace/gsap-zaklady#gsap-to-from-fromto-a-set

## --card-- free

Jaké tři druhy scroll efektů existují a čím se liší?

### --back--

**Jednorázové odhalení** (prvek se objeví, když vjede do zorného pole — stačí `inView`
nebo `animation-timeline: view()`), **animace řízená posuvníkem** (`scrub`: pozice
animace odpovídá poloze scrollu, dá se přehrát i zpět) a **přišpendlení** (`pin`: sekce
zůstane stát, zatímco se v ní něco děje).

### --see--

css-efekty-animace/scroll-efekty#problem-tri-druhy-scroll-efektu

## --card-- free

Co ve ScrollTriggeru znamená `start: 'top 80%'`?

### --back--

„Spusť ve chvíli, kdy je **horní hrana triggeru** na **80 % výšky okna**", tedy kousek
nad spodním okrajem. První hodnota je místo na prvku, druhá místo v okně. `end` se píše
stejně, případně relativně (`'+=100%'` = o výšku okna dál).

### --see--

css-efekty-animace/scroll-efekty#scrolltrigger-trigger-start-a-end

## --card-- free

Co dělá `scrub: true` a co `scrub: 0.5`?

### --back--

`true` přilepí animaci přímo k posuvníku — pozice animace přesně odpovídá poloze scrollu.
Číslo přidá setrvačnost: animace dohání scroll s prodlevou půl vteřiny, takže působí
měkčeji. Bez `scrub` se animace jen spustí a doběhne vlastním tempem.

### --see--

css-efekty-animace/scroll-efekty#scrub-animace-prilepena-k-posuvniku

## --card-- free

Co je `toggleActions` a jak se čtou jeho čtyři hodnoty?

### --back--

Čtyři akce pro čtyři okamžiky: **onEnter, onLeave, onEnterBack, onLeaveBack**.
Například `'play none none reverse'` znamená: při příjezdu přehraj, při odjezdu dolů
nic, při návratu zdola nic, při odjezdu nahoru přehraj pozpátku. Platí jen bez `scrub`.

### --see--

css-efekty-animace/scroll-efekty#scrolltrigger-trigger-start-a-end

## --card-- free

Proč se po načtení obrázků nebo rozbalení panelu volá `ScrollTrigger.refresh()`?

### --back--

Pozice `start` a `end` si ScrollTrigger spočítá jednou. Když se stránka potom natáhne
nebo zkrátí, počítá s neplatnými čísly a efekty se spouštějí jinde, než mají. `refresh()`
je přepočítá; u hodnot odvozených z rozměrů se přidává `invalidateOnRefresh: true`.

### --see--

css-efekty-animace/scroll-efekty#rozmery-se-meni-refresh-a-invalidateonrefresh

## --card-- free

Co dělá Lenis a co se musí dopsat, aby si rozuměl se ScrollTriggerem?

### --back--

Nahrazuje skokové scrollování plynulým dojezdem. ScrollTrigger se ale o jeho posunech
sám nedozví, takže se musí propojit: `lenis.on('scroll', ScrollTrigger.update)` a Lenisův
`raf` navázat na `gsap.ticker`, ať oba běží ve stejném rytmu.

### --see--

css-efekty-animace/scroll-efekty#lenis-plynule-scrollovani

## --card-- free

Co je scrolljacking a čím se liší od plynulého scrollování?

### --back--

Scrolljacking bere uživateli kontrolu: kolečko o jeden zub posune stránku o celou sekci
nebo někam úplně jinam. Plynulé scrollování naopak vztah „kolečko dolů = obsah nahoru"
zachovává, jen ho vyhladí. První je matoucí, druhé ne.

### --see--

css-efekty-animace/scroll-efekty#kdy-scroll-efekt-skodi

## --card-- free

Vyjmenuj čtyři kroky techniky FLIP a řekni, co se nakonec animuje.

### --back--

**First** (změř výchozí pozici), **Last** (proveď změnu a změř novou), **Invert**
(transformací vrať prvek opticky tam, kde byl), **Play** (transformaci odanimuj na nulu).
Animuje se `transform` — ne rozvržení. Proto je to plynulé i u změn, které by jinak
byly drahé.

### --see--

css-efekty-animace/layout-a-view-transitions#technika-flip-rucne

## --card-- free

Jak se používá plugin Flip a v čem je jiný než ruční FLIP?

### --back--

`const stav = Flip.getState('.karta')`, pak libovolná změna DOM nebo tříd, pak
`Flip.from(stav, { duration: 0.5 })`. Rozdíl je v tom, že Flip zvládne i změnu pořadí
prvků, přesun do jiného rodiče a vznik nebo zánik prvků — což se ručně dělá obtížně.

### --see--

css-efekty-animace/layout-a-view-transitions#plugin-flip-getstate-zmena-from

## --card-- free

K čemu je `view-transition-name` a co se stane, když ho mají dva prvky naráz?

### --back--

Pojmenuje prvek, který se má mezi dvěma stavy stránky považovat za **týž** — prohlížeč
ho pak plynule přenese z místa na místo. Jméno musí být v daném okamžiku jedinečné;
při dvou stejných se přechod neprovede vůbec.

### --see--

css-efekty-animace/layout-a-view-transitions#view-transitions-vlastni-animace-a-sdileny-prvek

## --card-- free

Kolik milisekund má prohlížeč na jeden snímek při 60 fps a co se do nich musí vejít?

### --back--

**16,7 ms**. Do toho patří tvůj JavaScript, výpočet stylů, rozvržení, malování
i složení vrstev — ne jen animace samotná. Proto dlouhá úloha v hlavním vlákně animaci
zastaví, ať je napsaná sebelíp.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#rozpocet-16-milisekund

## --card-- free

Seřaď podle ceny: animace `width`, `background-color` a `transform`.

### --back--

Nejdražší `width` (rozvržení → malování → složení), pak `background-color`
(malování → složení), nejlevnější `transform` (jen složení). Stejně levná je `opacity`.
Praktické pravidlo: posun dělej `x`/`y`, zvětšení `scale`, prolnutí `opacity`.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#rozpocet-16-milisekund

## --card-- free

Kdy nasadit `will-change` a kdy ne?

### --back--

Až když měření ukáže, že se zadrhne **první snímek** animace — a jen na prvky, kterých
se to týká, ideálně jen na dobu, kdy se chystají hýbat (`:hover`). Trvale zapnutý na
stovce prvků výkon zhorší, protože každá vrstva stojí paměť. Navíc zakládá stacking
context jako `transform`.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#will-change-slib-ne-kouzlo

## --card-- free

Co je špatně na cyklu, který střídá `el.getBoundingClientRect()` a zápis do `el.style`?

### --back--

Každé čtení po zápisu donutí prohlížeč dopočítat rozvržení, aby mohl odpovědět — a tak
dokola. Řeší se rozdělením na dvě fáze: **nejdřív všechna čtení, pak všechny zápisy**.
GSAP i Motion to uvnitř dělají samy; jakmile na rozměry saháš ručně, platí to i pro tebe.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#kdyz-animaci-brzdi-javascript

## --card-- free

Uživatel má zapnuté omezení pohybu. Co v animované stránce vypneš a co naopak necháš?

### --back--

**Vypni:** velké posuny přes obrazovku, parallax, zvětšování a otáčení, automatické
karusely, animace řízené scrollem. **Nech:** krátké prolnutí, změnu barvy, drobné posuny
do pár pixelů, indikátor načítání. Hlavní pravidlo: obsah musí **zůstat viditelný** —
vypíná se pohyb, ne stránka.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#prefers-reduced-motion-pro-koho-to-je

## --card-- free

Animuješ z GSAP. Stačí ošetřit `prefers-reduced-motion` v CSS?

### --back--

Ne. Media dotaz v CSS se animací spouštěných z JavaScriptu netýká — knihovna o něm neví.
Musíš se zeptat sám přes `window.matchMedia('(prefers-reduced-motion: reduce)').matches`,
nebo použít `gsap.matchMedia()`, který navíc uklidí, když uživatel nastavení změní za běhu.

### --see--

css-efekty-animace/vykon-a-pristupnost-animaci#prefers-reduced-motion-pro-koho-to-je

## --card-- free

Proč se `gsap.context()` a `revert()` hodí hlavně v Reactu?

### --back--

Kontext si zapamatuje všechno, co uvnitř vznikne (animace i ScrollTriggery), a `revert()`
to naráz zruší a vrátí prvky do výchozího stavu. Bez toho zůstanou po odpojení komponenty
viset animace na prvcích, které už v dokumentu nejsou — a to je přesně únik paměti.

### --see--

css-efekty-animace/gsap-zaklady#uklid-gsap-context-a-revert
