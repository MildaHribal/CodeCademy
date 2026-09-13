# Osnova Akademie

Detailní plán celého kurzu: 4 části, 34 sekcí, u každé sekce cíl, předpoklady
a moduly v pořadí. Strojová podoba (jen části a sekce) je v `content/osnova.json`
— když se tyto dva soubory rozcházejí v pořadí nebo slugách sekcí, platí
`osnova.json` a rozpor se opraví.

Formát modulů a pravidla psaní jsou v `docs/kontrakt.md` a `docs/styl-obsahu.md`.
Tahle osnova říká **co** se učí a **v jakém pořadí**, ne jak přesně vypadá každý krok.

## Jak osnovu číst

- **Sekce** má slug (= adresář v `content/`), název, cíl a předpoklady (slugy
  sekcí, které musí mít uživatel za sebou).
- **Moduly** jsou v pořadí, v jakém je uživatel prochází. U každého je typ,
  slug, název, výchozí runtime testů v hranatých závorkách a co přesně učí.
  - `lesson` — výklad jednoho konceptu s živými ukázkami a kontrolními otázkami,
  - `workshop` — stavba malého skutečného výsledku po krocích (u něj je co se
    staví a odhad počtu kroků),
  - `lab` — samostatné zadání bez vedení,
  - `quiz` — 10–20 otázek na chápání a čtení kódu,
  - `project` — větší zadání do portfolia, dělá se ve VS Code na disku.
- Laby a kvíz jsou na konci sekce, projekty na konci celků.
- Pilotní sekce `css-flexbox`, `js-pole` a `node-zaklady` se píšou jako první;
  jejich moduly jsou tu popsané obecně a konkrétní slugy určuje `section.json`.

## Principy osnovy

1. **Nic se nepoužívá dřív, než se to naučí.** Když sekce potřebuje něco
   z pozdější části, řekne to výslovně a použije jen nutné minimum.
2. **Hloubka tam, kde to v praxi bolí.** Kaskáda a specificita, stacking
   context, BFC a margin collapse, event loop, closures, `this`, mutace vs.
   kopie, práce s chybami, ladění, výkon a přístupnost mají vlastní lekce,
   ne poznámku pod čarou.
3. **Moderní stav (2026).** CSS nesting, `:has()`, container queries, `@layer`,
   `@scope`, subgrid, popover, anchor positioning, view transitions,
   scroll-driven animace; JavaScript ES2025+ (`toSorted` a spol.,
   `Object.groupBy`, metody `Set`, iterator helpers, `structuredClone`,
   top-level `await`, `Promise.withResolvers`). Starší přístupy se zmíní jen
   tam, kde je uživatel potká v cizím kódu.
4. **Čtení dokumentace je dovednost.** Od první sekce se odkazuje na MDN
   a uživatel se učí najít odpověď sám (jak číst stránku vlastnosti, tabulku
   podpory, specifikaci jen v nouzi).
5. **Přístupnost a výkon nejsou kapitola na konci.** Mají své sekce, ale
   každý workshop je píše rovnou správně (label, alt, fokus, sémantika,
   `prefers-reduced-motion`).

## Mapa kurzu

| část | sekce |
|---|---|
| 1. Web a CSS | `html-zaklady` → `html-formulare` → `html-pristupnost` → `css-zaklady` → `css-kaskada` → `css-box-model` → `css-flexbox` → `css-grid` → `css-pozicovani` → `css-responzivita` → `css-animace` |
| 2. JavaScript | `js-zaklady` → `js-retezce-cisla` → `js-funkce` → `js-objekty` → `js-pole` → `js-funkce-hloubka` → `js-tridy-kolekce` → `js-chyby-ladeni` → `js-dom` → `js-async` |
| 3. Nástroje | `nastroje-terminal-git` → `nastroje-moduly-vite` → `nastroje-devtools-vykon` → `nastroje-typescript` → `nastroje-testovani` |
| 4. Framework a backend | `node-zaklady` → `api-http-rest` → `sql-databaze` → `vue-zaklady` → `vue-aplikace` → `nuxt-fullstack` → `auth-bezpecnost` → `nasazeni-provoz` |

Projekty do portfolia: konec HTML (`html-pristupnost`), konec CSS (`css-animace`),
konec DOM (`js-dom`), konec JavaScriptu (`js-async`), konec nástrojů
(`nastroje-testovani`), backend bez frameworku (`node-zaklady`, `sql-databaze`),
frontend ve Vue (`vue-aplikace`), fullstack (`nuxt-fullstack`, `nasazeni-provoz`).

## Runtime podle obsahu

- `dom` — HTML, CSS, DOM a události (iframe 1024×768, `helpers.resize` pro media queries).
- `js` — čistý JavaScript bez stránky (konzole).
- `vue` — Vue 3 v prohlížeči přes import map, **bez `.vue` souborů**; SFC až v projektech s Vite.
- `node` — Node na serveru: `fs`, `http`, `node:sqlite`, `node:test`, spouštění
  příkazů přes `helpers.run` (Git, `node --run`). TypeScript v krocích běží přes
  vestavěné odstraňování typů v Node; kontrola typů (`tsc`), Vite, Vitest,
  Playwright a Nuxt jsou v projektech, kde si uživatel závislosti instaluje sám.

---

# Část 1 — Web a CSS

Od prázdného souboru k responzivní, přístupné a animované stránce. CSS má
největší hloubku: uživatel musí umět vysvětlit, **proč** se prvek chová, jak
se chová, ne jen zkoušet vlastnosti, dokud to nevypadá dobře.

## 1.1 `html-zaklady` — HTML a jak funguje web

**Po sekci umíš:** vysvětlit, co se stane mezi napsáním adresy a vykreslením
stránky; napsat validní HTML dokument se sémantickou strukturou; správně
použít nadpisy, odkazy, obrázky, seznamy a tabulky; najít odpověď na MDN
a prohlédnout si stránku v DevTools.

**Předpoklady:** žádné.

- **lesson** `jak-funguje-web` — *Jak funguje web* — klient a server, URL
  (schéma, doména, cesta, query, fragment), DNS jednou větou, HTTP požadavek
  a odpověď (metoda, stavový kód, hlavičky, tělo), co prohlížeč udělá s HTML
  (parsování → DOM → CSSOM → vykreslení). Otevření DevTools: Elements a Network.
- **lesson** `anatomie-dokumentu` — *Anatomie HTML dokumentu* — `<!DOCTYPE html>`,
  `html lang`, `head` vs. `body`, `meta charset` a `viewport`, `title`,
  prvek/tag/atribut, vnořování, prázdné prvky, bílé znaky, entity (`&lt;`,
  `&nbsp;`), komentáře. Prohlížeč chyby tiše opravuje — proč je to past.
- **lesson** `mdn-a-dokumentace` — *Jak číst MDN* — struktura stránky prvku
  a vlastnosti (syntaxe, hodnoty, příklady, přístupnost, specifikace, podpora),
  Baseline a tabulka kompatibility, jak hledat („mdn position sticky"), kdy
  věřit Stack Overflow a kdy ne.
- **workshop** `workshop-recept` [dom] — *Stránka s receptem* — staví: recept
  s nadpisem, úvodem, obrázkem, seznamem surovin (`ul`), postupem (`ol`),
  tabulkou nutričních hodnot a odkazy. Učí: `h1`–`h6` a jejich hierarchie,
  `p`, `strong` vs. `b`, `em` vs. `i`, `a href` (absolutní, relativní,
  `#kotva`, `mailto:`), `img` s `alt`, `width`/`height` proti poskakování
  layoutu, `figure`/`figcaption`. ~20 kroků.
- **lesson** `semanticka-struktura` — *Sémantická struktura stránky* —
  `header`, `nav`, `main`, `article`, `section`, `aside`, `footer`; kdy `div`
  a `span`; `time datetime`, `address`, `blockquote`/`cite`; outline nadpisů;
  proč sémantika mění chování čtečky, vyhledávače i režimu čtení.
- **workshop** `workshop-blog` [dom] — *Článek na blogu* — staví: stránka
  blogu s hlavičkou, navigací, článkem, bočním panelem a patičkou. Učí:
  landmarky, `article` vs. `section`, tabulka s `caption`, `thead`/`tbody`,
  `th scope`, `picture` a `srcset`/`sizes` pro responzivní obrázky,
  `loading="lazy"`, `details`/`summary`. ~25 kroků.
- **lab** `lab-profil` [dom] — *Profilová stránka* — samostatně: osobní
  stránka se sémantickou kostrou, obrázkem, seznamy, tabulkou a odkazy.
- **quiz** `kviz` — *Kvíz: HTML a web* — URL a HTTP, struktura dokumentu,
  výběr správného sémantického prvku, `alt` texty, chyby, které prohlížeč
  „opraví".

## 1.2 `html-formulare` — Formuláře

**Po sekci umíš:** postavit formulář, který funguje bez JavaScriptu, je
přístupný a validuje vstup v prohlížeči; vysvětlit, co a jak se odešle na server.

**Předpoklady:** `html-zaklady`.

- **lesson** `jak-funguje-formular` — *Jak funguje formulář* — `form action`
  a `method` (GET do URL vs. POST do těla), `name` jako klíč odeslaných dat,
  `button type` (`submit` je výchozí — častá past), odeslání Enterem, co
  uvidíš v Network.
- **workshop** `workshop-registrace` [dom] — *Registrační formulář* — staví:
  registrace na akci. Učí: `label for`/`id` a obalení labelem, typy `input`
  (`text`, `email`, `password`, `number`, `date`, `tel`, `url`, `checkbox`,
  `radio`), `select`/`option`/`optgroup`, `textarea`, `fieldset`/`legend`
  pro skupiny, `autocomplete` hodnoty, `placeholder` není label. ~25 kroků.
- **lesson** `validace-v-prohlizeci` — *Validace v prohlížeči* — `required`,
  `minlength`/`maxlength`, `min`/`max`/`step`, `pattern`, `type` jako validace,
  `novalidate`, pseudotřídy `:valid`/`:invalid`/`:user-invalid`, chybové
  hlášky a jejich limity; proč validace v prohlížeči nikdy nenahradí serverovou.
- **workshop** `workshop-objednavka` [dom] — *Objednávkový formulář* — staví:
  objednávka s doručením a platbou. Učí: skupiny radio tlačítek, `output`,
  `input type="range"`, `datalist`, popisky chyb přes `aria-describedby`,
  `inputmode`, nápověda k formátu. ~20 kroků.
- **lab** `lab-kontaktni-formular` [dom] — *Kontaktní formulář* — samostatně:
  formulář s validací, skupinami a srozumitelnými popisky.
- **quiz** `kviz` — *Kvíz: formuláře* — GET vs. POST, co se odešle a pod jakým
  jménem, label a přístupné jméno, validace.

## 1.3 `html-pristupnost` — Přístupnost

**Po sekci umíš:** projít stránku klávesnicí a čtečkou, najít a opravit
nejčastější chyby přístupnosti, rozhodnout, kdy ARIA pomáhá a kdy škodí;
ověřit kontrast a přístupné jméno v DevTools.

**Předpoklady:** `html-formulare`.

- **lesson** `proc-pristupnost` — *Kdo používá web jinak* — čtečky,
  klávesnice, zvětšení, snížený kontrast, kognitivní zátěž; WCAG 2.2 úrovně
  A/AA ve zkratce; zákonná povinnost (European Accessibility Act) jednou větou.
- **lesson** `strom-pristupnosti` — *Strom přístupnosti* — role, přístupné
  jméno a stav; jak se jméno počítá (obsah, `label`, `alt`, `aria-label`,
  `aria-labelledby`); panel Accessibility v DevTools; první pravidlo ARIA
  („nepoužívej ARIA, když stačí nativní prvek").
- **lesson** `klavesnice-a-fokus` — *Klávesnice a fokus* — pořadí fokusu
  = pořadí v DOM, `tabindex` 0 vs. −1 (a proč nikdy kladný), odkaz „Přeskočit
  na obsah", `button` vs. `a` vs. klikací `div`, viditelný fokus
  (dotáhne se v `css-kaskada` přes `:focus-visible`).
- **workshop** `workshop-oprava-pristupnosti` [dom] — *Oprava nepřístupné
  stránky* — staví: z rozbité stránky obchodu udělá přístupnou. Učí: nahradit
  klikací `div` tlačítkem, doplnit `alt` (i prázdný u dekorace), labely,
  landmarky, hierarchii nadpisů, `aria-live` pro hlášky, `aria-expanded`
  u rozbalovacího tlačítka, jazyk dokumentu, texty odkazů místo „klikni zde".
  ~25 kroků.
- **lesson** `aria-vzory` — *ARIA: kdy a jak* — `aria-hidden`,
  `aria-current`, `aria-describedby`, `role="alert"` vs. `status`, vzory
  z APG (disclosure, tabs) a proč mají přesně daný klávesový model; skrytí
  pro oči vs. pro čtečku (`.visually-hidden`, `hidden`, `inert`).
- **lab** `lab-audit` [dom] — *Audit přístupnosti* — samostatně: opravit
  stránku s deseti skrytými problémy (testy = jednotlivé problémy).
- **quiz** `kviz` — *Kvíz: přístupnost* — přístupné jméno, výběr role,
  pořadí fokusu, špatné použití ARIA, co čtečka přečte u daného kódu.
- **project** `projekt-portfolio-html` [dom] — *Osobní portfolio v čistém
  HTML* — zadání: vícestránkový web (úvod, projekty, kontakt s formulářem)
  bez CSS, plně sémantický a přístupný. Testy: struktura, landmarky,
  hierarchie nadpisů, labely, alt texty, funkční odkazy mezi stránkami.
  Na tomhle webu se v další části pracuje dál se styly.

## 1.4 `css-zaklady` — Základy CSS

**Po sekci umíš:** připojit a napsat styly, vybrat prvky základními
selektory, pracovat s barvami, jednotkami a typografií a zavést vlastní
vlastnosti pro barvy a rozestupy.

**Předpoklady:** `html-zaklady`.

- **lesson** `jak-css-funguje` — *Jak CSS funguje* — pravidlo, selektor,
  deklarace; `link` vs. `style` vs. atribut `style`; výchozí styly prohlížeče;
  DevTools: panel Styles a Computed, přeškrtnuté deklarace; neplatná
  deklarace se tiše zahodí.
- **lesson** `selektory-zaklad` — *Selektory* — typ, třída, id, atributové
  selektory, kombinátory (potomek, dítě `>`, sourozenec `+` a `~`), skupina
  selektorů, `:hover`, `:focus-visible`, `:first-child`, `:nth-child()`,
  `::before`/`::after`; pojmenování tříd (BEM zmínkou).
- **workshop** `workshop-vizitka` [dom] — *Digitální vizitka* — staví:
  vizitka se jménem, fotkou, kontakty a tlačítkem. Učí: barvy (`#hex`, `rgb()`,
  `hsl()`, `oklch()`), `background`, `border`, `border-radius`, `font-family`
  se systémovým stackem, `font-size`, `font-weight`, `line-height`,
  `text-align`, `letter-spacing`, `text-decoration` odkazů a jejich stavy. ~25 kroků.
- **lesson** `jednotky-a-hodnoty` — *Jednotky a hodnoty* — `px`, `em` vs.
  `rem` (a proč `em` násobí), `%` (vůči čemu), `vw`/`vh`/`dvh`/`svh`, `ch`,
  `calc()`, `min()`/`max()`/`clamp()`; relativní vs. absolutní délky;
  proč nenastavovat `font-size` v `px` na `html`.
- **lesson** `vlastni-vlastnosti` — *Vlastní vlastnosti (CSS proměnné)* —
  `--token: hodnota`, `var(--token, fallback)`, definice na `:root`, přepsání
  v komponentě, dědičnost proměnných, neplatná hodnota za běhu (proč se
  nevrátí fallback); `color-mix()` pro odstíny, design tokeny.
- **workshop** `workshop-typografie` [dom] — *Typografie článku* — staví:
  čitelná stránka článku (navazuje na blog z `html-zaklady`). Učí: stupnice
  písma v `rem`, šířka řádku v `ch`, vertikální rytmus, `text-wrap: balance`
  a `pretty`, `hyphens` s `lang`, tokeny barev a rozestupů, stylování
  seznamů, citací a tabulky. ~25 kroků.
- **lab** `lab-karta-produktu` [dom] — *Karta produktu* — samostatně: karta
  produktu s cenou, štítkem a tlačítkem, barvy a rozestupy přes tokeny.
- **quiz** `kviz` — *Kvíz: základy CSS* — co vybere selektor, `em` vs. `rem`,
  výsledek `calc()`, vlastní vlastnosti a fallback.

## 1.5 `css-kaskada` — Selektory a kaskáda do hloubky

**Po sekci umíš:** u libovolného pravidla předem říct, zda vyhraje, a proč;
spočítat specificitu; vysvětlit dědičnost; uspořádat styly do vrstev
`@layer` místo přebíjení přes `!important`; psát moderní selektory
(`:is()`, `:where()`, `:has()`) a vnořené CSS.

**Předpoklady:** `css-zaklady`.

- **lesson** `kaskada` — *Kaskáda: kdo vyhraje* — celé pořadí kaskády:
  původ (prohlížeč, autor, uživatel) a důležitost, vrstvy `@layer`,
  specificita, pořadí ve zdroji; inline styly; `!important` a proč obrací
  pořadí vrstev; mentální model „nejdřív origin a vrstva, pak specificita,
  pak pořadí".
- **lesson** `specificita` — *Specificita* — trojice (id, třída/atribut/
  pseudotřída, typ/pseudoelement), porovnání zleva, `*` a kombinátory
  nepřidávají nic, `:is()`/`:not()`/`:has()` přebírají nejvyšší argument,
  `:where()` má nulu; typické války specificity a jak z nich ven (nižší
  specificita, ne vyšší).
- **lesson** `dedicnost` — *Dědičnost a výchozí hodnoty* — které vlastnosti
  dědí (text) a které ne (box), `inherit`, `initial`, `unset`, `revert`,
  `revert-layer`, `all`; spočtená vs. použitá hodnota; proč formulářové
  prvky nedědí písmo a jak to opravit.
- **workshop** `workshop-uklid-stylu` [dom] — *Úklid přebíjejících se stylů* —
  staví: z rozbité šablony se styly, které se navzájem přebíjejí (`!important`,
  selektory přes id, dlouhé řetězce), udělá čitelný styl. Učí: `@layer reset,
  base, components, utilities`, snížení specificity, `:where()` v resetu,
  import do vrstvy, ladění přes Computed a „Show all". ~20 kroků.
- **lesson** `moderni-selektory` — *Moderní selektory a nesting* — `:is()`,
  `:where()`, `:not()` se seznamem, `:has()` jako „rodičovský selektor"
  (formulář s chybou, karta s obrázkem, kvantitní dotazy), `:focus-within`,
  `:focus-visible`, `:user-invalid`; CSS nesting (`&`, vnořené media queries,
  jak se počítá specificita vnořeného pravidla); `@scope` s horní a dolní hranicí.
- **workshop** `workshop-odznaky` [dom] — *Systém štítků a stavů* — staví:
  sadu štítků (sleva, novinka, vyprodáno) a tlačítek se stavy. Učí: varianty
  přes atributy (`[data-variant="sale"]`), `:has()` pro kartu podle obsahu,
  nesting, `:hover`/`:active`/`:disabled`/`:focus-visible`, tokeny pro
  varianty místo záplavy tříd. ~20 kroků.
- **lab** `lab-motiv-formulare` [dom] — *Styly formuláře* — samostatně:
  nastylovat formulář ve vrstvách, stavy chyb přes `:user-invalid` a `:has()`,
  bez `!important`.
- **quiz** `kviz` — *Kvíz: kaskáda* — které pravidlo vyhraje (čtení kódu),
  výpočet specificity, dědičnost, `@layer` a `!important`, `:where()` vs. `:is()`.

## 1.6 `css-box-model` — Box model a tok dokumentu

**Po sekci umíš:** vysvětlit, jak se počítá velikost boxu, proč se margin
„slil" nebo „utekl" z rodiče, co je blokový formátovací kontext a jak ho
založit, a jak se prvky skládají v normálním toku.

**Předpoklady:** `css-kaskada`.

- **lesson** `box-model` — *Box model* — content, padding, border, margin;
  `box-sizing: content-box` vs. `border-box` a reset; `width`/`height` vs.
  `min-*`/`max-*`; `auto` šířka blokového prvku; logické vlastnosti
  (`inline-size`, `margin-inline`, `padding-block`) a proč existují.
- **lesson** `normalni-tok` — *Normální tok, block a inline* — blokové
  a řádkové boxy, `display: block | inline | inline-block`, proč inline
  prvku nejde nastavit výška, mezera pod obrázkem (baseline) a jak ji zrušit,
  anonymní boxy, `display: none` vs. `visibility: hidden`.
- **lesson** `margin-collapse-a-bfc` — *Margin collapse a BFC* — kdy se
  svislé marginy slévají (sourozenci, rodič a první dítě, prázdný blok),
  kdy ne (flex/grid, padding, border, BFC); blokový formátovací kontext:
  co ho zakládá (`display: flow-root`, `overflow` jiný než `visible`,
  flex/grid položky, `position: absolute`) a co dělá (obsahuje floaty,
  zastaví slévání); `gap` jako lepší náhrada marginů mezi sourozenci.
- **workshop** `workshop-rozestupy` [dom] — *Rozestupová stupnice* — staví:
  stránka s kartami a sekcemi, kde se opraví náhodné marginy. Učí:
  `border-box` reset, stupnice rozestupů v tokenech, `margin-inline: auto`
  pro centrování, `max-inline-size` obalu, oprava margin collapse přes
  `flow-root`, „stack" vzor (`> * + *`), `gap`. ~20 kroků.
- **lesson** `preteceni` — *Přetečení a velikost obsahu* — `overflow`
  a jeho vedlejší efekty (BFC, rozbitý `sticky`), `overflow-wrap:
  anywhere` pro dlouhá slova a URL, `text-overflow: ellipsis` (tři
  podmínky), `min-content`/`max-content`/`fit-content`, `aspect-ratio`,
  `object-fit` u obrázků; `float` jen na obtékání textu.
- **lab** `lab-clanek-s-obrazky` [dom] — *Článek s obtékanými obrázky* —
  samostatně: článek s obtékaným obrázkem, citací, dlouhými URL a kartou,
  bez rozbitých marginů a přetečení.
- **quiz** `kviz` — *Kvíz: box model* — výpočet šířky boxu, kde se margin
  slije, co založí BFC, proč se inline prvek nechová podle `height`.

## 1.7 `css-flexbox` — Flexbox *(pilotní sekce)*

**Po sekci umíš:** rozvrhnout prvky v jedné ose flexboxem a u každého
zarovnání vědět, na které ose pracuje; vysvětlit, jak `flex-grow`,
`flex-shrink` a `flex-basis` dělí volné místo; opravit prvek, který se
nechce zmenšit (`min-width: auto`).

**Předpoklady:** `css-box-model`.

Moduly (konkrétní slugy určuje `content/css-flexbox/section.json`):

- **lesson** — úvod do flexboxu: kontejner a položky, hlavní a vedlejší
  osa, `flex-direction`, `justify-content`, `align-items`, `gap`, `flex-wrap`.
- **workshop** [dom] — navigace webu: logo, odkazy a tlačítko v jedné liště,
  zarovnání na osách, `margin-inline-start: auto` pro odtlačení, zalomení
  na úzké obrazovce.
- **lesson** — flexbox do hloubky: algoritmus `flex-grow`/`flex-shrink`/
  `flex-basis`, zkratka `flex`, `min-width: auto` a přetékající text,
  `align-self`, `align-content`, `order` a proč škodí přístupnosti.
- **lab** [dom] — ceník s kartami tarifů postavený flexboxem.
- **quiz** — osy, dělení místa, čtení kódu „jak široká bude položka".

## 1.8 `css-grid` — CSS Grid

**Po sekci umíš:** postavit dvourozměrný layout stránky i mřížku karet bez
media queries, pojmenovat oblasti, zarovnat obsah napříč kartami přes
subgrid a rozhodnout, kdy grid a kdy flexbox.

**Předpoklady:** `css-flexbox`.

- **lesson** `uvod-do-gridu` — *Úvod do gridu* — `grid-template-columns`/
  `rows`, jednotka `fr`, `repeat()`, `gap`, explicitní vs. implicitní mřížka,
  `grid-auto-rows`, čísla čar a `grid-column: 1 / -1`, `span`; Grid inspector
  v DevTools.
- **workshop** `workshop-kostra-stranky` [dom] — *Kostra aplikace* — staví:
  layout s hlavičkou, bočním panelem, obsahem a patičkou. Učí:
  `grid-template-areas`, `grid-area`, pojmenované čáry, `minmax(0, 1fr)`
  (proč se hlavní sloupec nechce zmenšit), přeskládání oblastí v media query,
  `place-items`/`place-self`, výška na celé okno přes `min-block-size: 100dvh`.
  ~20 kroků.
- **lesson** `mrizka-bez-media-queries` — *Mřížka, která se přizpůsobí sama* —
  `repeat(auto-fill, minmax(…))` vs. `auto-fit`, `min()` uvnitř `minmax` proti
  přetečení, `grid-auto-flow: dense` a jeho past s pořadím, zarovnání
  položek vs. stop.
- **workshop** `workshop-galerie` [dom] — *Galerie a obchod* — staví: mřížka
  karet produktů s velkou „doporučenou" kartou. Učí: auto-fill mřížka,
  položka přes dva sloupce, `aspect-ratio` obrázků, **subgrid** pro zarovnání
  nadpisu, textu a ceny napříč kartami, grid uvnitř karty. ~20 kroků.
- **lesson** `grid-nebo-flex` — *Grid, nebo flexbox?* — layout zvenku
  (grid) vs. obsah zevnitř (flex), kombinace obou, typické vzory (holy grail,
  sidebar, stack, cluster, pancake), kdy stačí jeden řádek CSS.
- **lab** `lab-dashboard` [dom] — *Dashboard* — samostatně: přehledová
  obrazovka s dlaždicemi různých velikostí, bočním panelem a mřížkou,
  která se přizpůsobí šířce.
- **quiz** `kviz` — *Kvíz: grid* — `fr` a `minmax`, `auto-fill` vs.
  `auto-fit`, kam spadne položka, grid vs. flex pro danou situaci.

## 1.9 `css-pozicovani` — Pozicování a vrstvení

**Po sekci umíš:** zvolit správnou hodnotu `position`, najít containing block,
vysvětlit, proč `z-index: 9999` nepomáhá (stacking context), rozchodit
`sticky`, a postavit rozbalovací nabídku a modální okno nativně přes
`popover`, `<dialog>` a anchor positioning.

**Předpoklady:** `css-grid`.

- **lesson** `position` — *Pět hodnot `position`* — `static`, `relative`,
  `absolute`, `fixed`, `sticky`; containing block a co ho mění (i `transform`
  a `filter` u `fixed`); `inset`; `sticky` a jeho podmínky (hranice
  `top`, rodič s místem, žádný `overflow` na předkovi).
- **lesson** `stacking-context` — *Stacking context a `z-index`* — pořadí
  vykreslení v rámci kontextu, co zakládá nový kontext (`position` +
  `z-index`, `opacity < 1`, `transform`, `filter`, `isolation: isolate`,
  `will-change`, flex/grid položka se `z-index`), proč se prvek nedostane
  nad sourozence rodiče, škála `z-index` v tokenech; ladění ve 3D/Layers.
- **workshop** `workshop-lepici-lista` [dom] — *Přilepená lišta a boční
  panel* — staví: stránka s přilepenou hlavičkou, sticky bočním panelem,
  překryvným štítkem na kartě a tlačítkem „nahoru". Učí: `sticky` s `top`,
  oprava rozbitého `sticky` přes `overflow` předka, `absolute` uvnitř
  `relative` karty, `isolation: isolate`, `scroll-margin-top` pro kotvy
  pod lištou. ~20 kroků.
- **lesson** `top-layer` — *Top layer: popover a dialog* — atribut
  `popover` (`auto` vs. `manual`), `popovertarget`, `<dialog>` a
  `showModal()` jen zmínkou (JS přijde v `js-dom`), `::backdrop`, proč top
  layer vyřeší `z-index` jednou provždy, light dismiss, fokus a `inert`.
- **lesson** `anchor-positioning` — *Anchor positioning* — `anchor-name`,
  `position-anchor`, `position-area`, funkce `anchor()`, `position-try`
  a záložní polohy, kombinace s `popover`; co dělat, kde podpora chybí
  (progresivní vylepšení).
- **workshop** `workshop-rozbalovacka` [dom] — *Nabídka u avataru a tooltip* —
  staví: uživatelskou nabídku a tooltipy bez JavaScriptu. Učí: `popover`
  s `popovertarget`, ukotvení k tlačítku, `position-try-fallbacks` u okraje
  okna, `::backdrop`, `:popover-open`, přístupné pojmenování. ~15 kroků.
- **lab** `lab-modalni-okno` [dom] — *Galerie s náhledem* — samostatně:
  mřížka obrázků, štítky přes `absolute`, přilepený filtr a náhled přes popover.
- **quiz** `kviz` — *Kvíz: pozicování* — containing block, co založí stacking
  context, proč nefunguje `sticky`, `popover` vs. `dialog`.

## 1.10 `css-responzivita` — Responzivní design a témata

**Po sekci umíš:** postavit stránku mobile-first, která funguje od 320 px
po široký monitor; použít media queries i container queries podle toho,
co se ptá; plynulou typografii přes `clamp()`; světlý a tmavý motiv
podle systému.

**Předpoklady:** `css-pozicovani`.

- **lesson** `mobile-first` — *Mobile-first* — `meta viewport`, proč začít
  úzkou obrazovkou, `min-width` breakpointy podle obsahu (ne podle zařízení),
  syntaxe rozsahů `(width >= 48rem)`, `em` v media queries, testování
  v responzivním režimu DevTools.
- **workshop** `workshop-landing-mobil` [dom] — *Responzivní úvodní stránka* —
  staví: landing page služby (hero, výhody, ceník, patička), která se skládá
  z jednoho sloupce do více. Učí: mobile-first styly, breakpointy,
  responzivní navigace, `clamp()` pro písmo a rozestupy, obrázky přes
  `srcset`, dotykové cíle 44 px. ~25 kroků.
- **lesson** `container-queries` — *Container queries* — `container-type:
  inline-size`, pojmenované kontejnery, `@container`, jednotky `cqi`,
  komponenta, která se přizpůsobí místu, ne oknu; style queries zmínkou;
  kdy media query a kdy container query.
- **workshop** `workshop-karta-kontejner` [dom] — *Karta, která se hodí
  všude* — staví: karta článku, která je v úzkém bočním panelu svislá
  a v obsahu vodorovná. Učí: kontejner, `@container` breakpointy, `cqi`
  v typografii, kombinace se subgridem. ~15 kroků.
- **lesson** `preference-uzivatele` — *Preference uživatele a motivy* —
  `prefers-color-scheme`, `color-scheme`, `light-dark()`, tokeny ve dvou
  sadách, `prefers-reduced-motion`, `prefers-contrast`, `forced-colors`,
  hover a pointer media features (`@media (hover: hover)`), tisk.
- **lab** `lab-tmavy-rezim` [dom] — *Blog ve světlém i tmavém režimu* —
  samostatně: responzivní blog s container query kartami a motivem podle systému.
- **quiz** `kviz` — *Kvíz: responzivita* — media vs. container query,
  výsledek `clamp()`, mobile-first pořadí pravidel, `light-dark()`.

## 1.11 `css-animace` — Přechody, transformace a animace

**Po sekci umíš:** animovat rozhraní plynule a s rozvahou — přechody,
transformace, klíčové snímky, view transitions a animace řízené scrollem;
vědět, které vlastnosti jsou levné a které trhají, a respektovat omezení
pohybu.

**Předpoklady:** `css-responzivita`.

- **lesson** `transition-transform` — *Přechody a transformace* —
  `transition` (vlastnost, délka, časovací funkce, zpoždění), `transition-behavior:
  allow-discrete` a `@starting-style` pro animaci z `display: none`,
  `transform` (`translate`, `scale`, `rotate` i jako samostatné vlastnosti),
  `transform-origin`, proč neanimovat `width`/`top`.
- **workshop** `workshop-interakce` [dom] — *Mikrointerakce* — staví:
  tlačítka, karty a akordeon s jemnými přechody. Učí: hover a fokus stavy
  s přechodem, zvednutí karty přes `translate` a stín, animace otevření
  `details` přes `interpolate-size`, `@starting-style` u popoveru,
  `prefers-reduced-motion`. ~20 kroků.
- **lesson** `keyframes` — *Klíčové snímky* — `@keyframes`, `animation-*`
  (délka, opakování, směr, `fill-mode`, `play-state`), `steps()`,
  `cubic-bezier()`, `linear()`; `@property` pro animaci vlastních vlastností
  (gradient, úhel); gradienty lineární, radiální a kónické.
- **lesson** `vykon-animaci` — *Výkon animací* — pipeline vykreslení (styl,
  layout, paint, composite), vlastnosti, které jdou jen do compositoru
  (`transform`, `opacity`), `will-change` s rozvahou, měření v Performance
  panelu a Rendering (paint flashing, layout shift regions).
- **lesson** `view-transitions-scroll` — *View transitions a animace
  řízené scrollem* — `document.startViewTransition()` (JS jen jako jeden
  řádek), `@view-transition { navigation: auto }` mezi stránkami,
  `view-transition-name`, pseudoprvky `::view-transition-*`;
  `animation-timeline: scroll()` a `view()`, `animation-range`.
- **workshop** `workshop-scroll-pribeh` [dom] — *Stránka produktu s pohybem* —
  staví: stránka produktu s ukazatelem čtení, náběhem sekcí při scrollování,
  načítacím skeletonem a pulzujícím štítkem. Učí: `@keyframes`, scroll-driven
  animace, `@property`, vypnutí pohybu přes reduced motion. ~20 kroků.
- **lab** `lab-loader-a-toast` [dom] — *Načítání a oznámení* — samostatně:
  spinner, skeleton karty a vyjíždějící oznámení, vše plynulé a s ohledem
  na omezení pohybu.
- **quiz** `kviz` — *Kvíz: animace* — co je levné animovat, `transition`
  vs. `animation`, `fill-mode`, reduced motion, co spustí layout.
- **project** `projekt-landing-page` [dom] — *Landing page produktu* —
  zadání jako od klienta: úvodní stránka aplikace (hero, funkce, recenze,
  ceník, FAQ, patička) podle textové předlohy. Technické požadavky:
  mobile-first, grid i flexbox, container query karty, `@layer`, tokeny,
  světlý i tmavý motiv, popover s nabídkou, přístupnost, reduced motion.
  Testy ověřují chování a spočtené hodnoty v několika šířkách.
- **project** `projekt-portfolio-css` [dom] — *Portfolio se styly* —
  zadání: nastylovat HTML portfolio z `html-pristupnost` do podoby, kterou
  lze poslat zaměstnavateli; view transitions mezi stránkami, responzivní
  mřížka projektů, motivy.

---

# Část 2 — JavaScript

Jazyk od první proměnné po event loop. Druhé těžiště kurzu. Až do `js-dom`
běží skoro všechno v runtime `js` (čistý jazyk s konzolí), aby se jazyk
nemíchal s prohlížečem. Část je napsaná tak, že jde projít i souběžně
s CSS — potřebuje jen `html-zaklady`.

## 2.1 `js-zaklady` — Základy JavaScriptu

**Po sekci umíš:** napsat krátký program s proměnnými, podmínkami a cykly;
vysvětlit datové typy a rozdíl mezi `==` a `===`; číst chybové hlášky
v konzoli.

**Předpoklady:** `html-zaklady`.

- **lesson** `prvni-program` — *První program* — kde JavaScript běží
  (prohlížeč, Node), konzole a `console.log`, příkazy a středníky (ASI
  a jeho jediná skutečná past), komentáře, `<script>` a `type="module"`
  jen zmínkou.
- **lesson** `promenne-a-typy` — *Proměnné a typy* — `const` vs. `let`
  (a proč ne `var`), pojmenování, primitivní typy (`string`, `number`,
  `bigint`, `boolean`, `undefined`, `null`, `symbol`) vs. objekty, `typeof`
  a jeho výjimky (`null`, funkce), `undefined` vs. `null`.
- **workshop** `workshop-kalkulacka-spropitneho` [js] — *Kalkulačka
  spropitného* — staví: funkce počítající účet, spropitné a dělení mezi
  osoby (funkce se zatím jen volají, výklad funkcí přijde v `js-funkce`).
  Učí: aritmetické operátory, `%`, `**`, priorita operátorů, `+=`, `++`,
  přetypování na číslo (`Number()`, unární `+`), template literaly. ~20 kroků.
- **lesson** `porovnani-a-logika` — *Porovnání a logika* — `===` vs. `==`
  a tabulka konverzí, truthy a falsy (včetně `0`, `''`, `NaN`), `&&` a `||`
  vracejí operand (ne boolean), `??` vs. `||`, `?.`, `!`, zkrácené
  vyhodnocení; `if`/`else`, ternární operátor, `switch` a propadání.
- **workshop** `workshop-hodnoceni` [js] — *Hodnocení studentů* — staví:
  program, který z bodů určí známku, slovní hodnocení a upozornění. Učí:
  `if`/`else if`, ternární operátor, `switch`, `??` pro výchozí hodnoty,
  guard clause (brzký návrat), okrajové případy (záporné body, chybějící
  hodnota). ~20 kroků.
- **lesson** `cykly` — *Cykly* — `for`, `while`, `do…while`, `for…of`
  (na řetězci, pole přijde v `js-pole`), `break`/`continue`, návěští
  zmínkou, nekonečná smyčka a jak ji poznat, off-by-one chyby.
- **lab** `lab-fizzbuzz-a-spol` [js] — *Malé algoritmy* — samostatně:
  FizzBuzz, součet číslic, převod teploty s tabulkou, hledání prvočísel.
- **quiz** `kviz` — *Kvíz: základy* — co vypíše kód, truthy/falsy,
  `==` vs. `===`, `??` vs. `||`, chyby v cyklech.

## 2.2 `js-retezce-cisla` — Řetězce, čísla, data a regulární výrazy

**Po sekci umíš:** zpracovat a formátovat text, čísla, ceny a data
v češtině; vysvětlit, proč `0.1 + 0.2 !== 0.3`, a počítat s penězi
bezpečně; napsat a přečíst běžný regulární výraz.

**Předpoklady:** `js-zaklady`.

- **lesson** `retezce` — *Řetězce* — neměnnost řetězců, indexy a `at(-1)`,
  `slice`, `includes`, `startsWith`, `indexOf`, `split`/`join`, `trim`,
  `padStart`, `replaceAll`, `toLowerCase` a `localeCompare` pro češtinu,
  Unicode a emoji (`length` lže, `[...text]`, `Intl.Segmenter` zmínkou),
  `normalize` pro diakritiku.
- **workshop** `workshop-textove-utility` [js] — *Textové utility* —
  staví: sadu funkcí pro web: zkrácení popisu se třemi tečkami, slug do URL
  bez diakritiky, iniciály do avataru, formát telefonního čísla, maskování
  e-mailu. ~20 kroků.
- **lesson** `cisla` — *Čísla a počítání* — IEEE 754 a plovoucí čárka,
  `Number.EPSILON`, počítání v haléřích, `Math.round`/`floor`/`trunc`
  a záporná čísla, `toFixed` vrací řetězec, `NaN` a `Number.isNaN`,
  `parseInt` vs. `Number`, `Infinity`, `BigInt`, `Math.random` a rozsahy.
- **lesson** `intl-a-datum` — *Formátování a datum* — `Intl.NumberFormat`
  (měna, procenta, kompaktní zápis), `Intl.DateTimeFormat`,
  `Intl.RelativeTimeFormat` („před 5 minutami"), `Intl.PluralRules`
  (1 položka, 2 položky, 5 položek); `Date` a jeho pasti (měsíce od nuly,
  časové zóny, mutace); `Temporal` (`PlainDate`, `ZonedDateTime`, `Duration`)
  jako moderní náhrada.
- **workshop** `workshop-kosik-ceny` [js] — *Ceny v košíku* — staví:
  výpočet košíku s DPH, slevou a dopravou a formátování pro češtinu.
  Učí: počítání v haléřích, zaokrouhlení, `Intl.NumberFormat`, množné
  číslo přes `PluralRules`, datum doručení. ~20 kroků.
- **lesson** `regularni-vyrazy` — *Regulární výrazy* — literál a `RegExp`,
  třídy znaků, kvantifikátory (hladové vs. líné), kotvy, skupiny
  a pojmenované skupiny, příznaky `g`, `i`, `u`, `v`, `test`, `match`,
  `matchAll`, `replace` s funkcí, `RegExp.escape`; kdy regex nepoužít
  (HTML, e-mail „správně").
- **lab** `lab-validace-vstupu` [js] — *Kontrola a úprava vstupu* —
  samostatně: validace PSČ, rodného čísla bez kontroly data, hesla,
  vytažení hashtagů a formátování ceny.
- **quiz** `kviz` — *Kvíz: text a čísla* — výsledky zaokrouhlení, `length`
  s emoji, co vrátí regex, pasti `Date`.

## 2.3 `js-funkce` — Funkce a rozsah platnosti

**Po sekci umíš:** rozdělit program do malých čistých funkcí; vysvětlit
rozsah platnosti, hoisting a TDZ; předávat funkce jako hodnoty; ladit
kód breakpointem místo `console.log` všude.

**Předpoklady:** `js-retezce-cisla`.

- **lesson** `funkce` — *Funkce* — deklarace, výraz a šipková funkce,
  parametry vs. argumenty, `return` a `undefined`, výchozí hodnoty
  parametrů, rest parametry, čistá funkce a vedlejší efekty, pojmenování.
- **lesson** `scope-a-hoisting` — *Rozsah platnosti, hoisting a TDZ* —
  globální, funkční a blokový scope, stínění proměnných, hoisting deklarací
  funkcí, temporal dead zone u `let`/`const`, proč `var` ve smyčce dělá
  potíže, lexikální scope (příprava na closures).
- **workshop** `workshop-prevodnik-jednotek` [js] — *Převodník jednotek* —
  staví: převodník délek, hmotností a teplot rozdělený do malých funkcí.
  Učí: rozklad problému na funkce, výchozí parametry, návrat objektu
  zmínkou, guard clauses, funkce vracející funkci jen jako ukázka. ~20 kroků.
- **lesson** `funkce-jako-hodnoty` — *Funkce jako hodnoty* — funkce
  v proměnné, callback, funkce jako argument (`setTimeout` jako první
  příklad), vyšší řád jednou větou; příprava na metody pole.
- **lesson** `ladeni-zaklad` — *Ladění* — čtení chybové hlášky a stack
  trace, typy chyb (`ReferenceError`, `TypeError`, `SyntaxError`), `debugger`
  a breakpointy v DevTools (krok přes, do, ven; watch; scope panel),
  podmíněný breakpoint a logpoint, `console.table`/`console.group`/`console.trace`,
  metoda „zmenši problém".
- **lab** `lab-generator-hesel` [js] — *Generátor a kontrola hesel* —
  samostatně: funkce na generování hesla podle pravidel a hodnocení síly.
- **quiz** `kviz` — *Kvíz: funkce* — co vypíše kód se stíněním a hoistingem,
  TDZ, návratové hodnoty, deklarace vs. šipka.

## 2.4 `js-objekty` — Objekty, reference a kopie

**Po sekci umíš:** modelovat data objekty; vysvětlit, proč změna objektu
„uvnitř funkce" změnila data i venku; vybrat správný způsob kopie
(mělká, hluboká); používat destrukturalizaci, spread a JSON.

**Předpoklady:** `js-funkce`.

- **lesson** `objekty` — *Objekty* — literál, tečka vs. hranaté závorky,
  vypočítané klíče, zkrácený zápis, metody, přidání a mazání vlastnosti,
  `in` a `Object.hasOwn`, `?.` u zanořených dat, `Object.keys`/`values`/
  `entries`/`fromEntries`, pořadí klíčů.
- **lesson** `reference-a-mutace` — *Hodnota vs. reference* — primitiva
  se kopírují, objekty sdílejí referenci, `const` nezamrazí obsah,
  porovnání objektů (`===` porovnává identitu), mutace argumentu ve funkci
  jako skrytá chyba; `Object.freeze` a jeho mělkost.
- **workshop** `workshop-profil-uzivatele` [js] — *Profil uživatele* —
  staví: funkce nad profilem (celé jméno, věk, úprava nastavení, sloučení
  výchozích hodnot). Učí: destrukturalizace s přejmenováním a výchozí
  hodnotou, destrukturalizace v parametrech, spread `{ ...defaults, ...user }`,
  úprava bez mutace, rest ve vzoru. ~20 kroků.
- **lesson** `kopie-a-json` — *Mělká a hluboká kopie, JSON* — spread
  a `Object.assign` jsou mělké, `structuredClone` (co umí: `Date`, `Map`,
  cykly; co ne: funkce, třídy), `JSON.stringify`/`parse` (co ztratí:
  `undefined`, `Date`, `NaN`), `replacer`, odsazení, bezpečné parsování
  v `try`.
- **workshop** `workshop-nastaveni-aplikace` [js] — *Nastavení aplikace* —
  staví: sloučení výchozího a uživatelského nastavení, uložení do JSON
  a načtení zpět. Učí: zanořená neměnná úprava, `structuredClone`, JSON
  round-trip a jeho ztráty, validace načtených dat. ~15 kroků.
- **lab** `lab-adresar` [js] — *Adresář kontaktů* — samostatně: funkce
  pro přidání, úpravu a vyhledání kontaktu bez mutace vstupu.
- **quiz** `kviz` — *Kvíz: objekty* — co vypíše kód s referencemi,
  mělká vs. hluboká kopie, co přežije JSON, destrukturalizace.

## 2.5 `js-pole` — Pole *(pilotní sekce)*

**Po sekci umíš:** napsat funkci nad polem objektů bez nápovědy; vědět,
které metody mění původní pole a které vracejí nové; přečíst cizí řetězení
`map`/`filter`/`reduce`, aniž bys ho spouštěl.

**Předpoklady:** `js-objekty`.

Moduly (konkrétní slugy určuje `content/js-pole/section.json`):

- **lesson** — co je pole: index, `length`, `at()`, přidávání a odebírání
  (`push`, `pop`, `shift`, `unshift`), `includes`, `indexOf`, procházení
  `for…of`, pole jako reference.
- **workshop** [js, jeden krok dom] — nákupní seznam: přidávání, mazání,
  součty, hledání, výpis do stránky.
- **lesson** — metody pole do hloubky: `map`, `filter`, `find`/`findLast`,
  `some`/`every`, `reduce` s číslem i objektem jako akumulátorem,
  `flatMap`, řazení s comparatorem, mutující (`sort`, `splice`, `reverse`)
  vs. nemutující (`toSorted`, `toSpliced`, `toReversed`, `with`),
  `Object.groupBy`, `Array.from`, řetězení metod a čitelnost.
- **lab** [js] — statistika známek: průměry, řazení, seskupení.
- **quiz** — mutace vs. nové pole, čtení řetězení metod, `reduce`,
  comparator.

## 2.6 `js-funkce-hloubka` — Closures, `this` a funkcionální styl

**Po sekci umíš:** vysvětlit closure a použít ji (továrny, memoizace,
soukromý stav); u každého volání říct, co je `this`; skládat malé funkce
do větších; napsat debounce a throttle.

**Předpoklady:** `js-pole`.

- **lesson** `closures` — *Closures* — funkce si pamatuje lexikální
  prostředí, ne hodnotu; počítadlo a továrna na funkce; klasická past
  s `var` v cyklu a proč ji `let` řeší; closure a paměť (co se neuvolní).
- **workshop** `workshop-tovarny-funkci` [js] — *Továrny, memoizace,
  debounce* — staví: knihovnička utilit. Učí: `createCounter`, částečná
  aplikace, `once`, `memoize` s `Map`, `debounce` a `throttle` s `setTimeout`
  (timery jen jako nástroj, event loop přijde v `js-async`). ~20 kroků.
- **lesson** `this` — *`this`* — čtyři pravidla vazby (volání jako metoda,
  samostatné volání, `new`, explicitní `call`/`apply`/`bind`), šipková
  funkce nemá vlastní `this`, ztráta `this` při předání metody jako
  callbacku, strict mode.
- **lesson** `funkcionalni-styl` — *Funkcionální styl* — čisté funkce
  a neměnná data, kompozice (`pipe`), deklarativní vs. imperativní kód,
  rekurze (strom kategorií, zanořené komentáře) a limit zásobníku;
  kdy funkcionální styl nečitelnost zhoršuje.
- **workshop** `workshop-strom-komentaru` [js] — *Strom komentářů* —
  staví: z ploché tabulky komentářů (`id`, `parentId`) strom, spočítá
  odpovědi a vyrenderuje odsazený výpis. Učí: rekurze, `Object.groupBy`,
  neměnné sestavení stromu, kompozice. ~15 kroků.
- **lab** `lab-pipeline-dat` [js] — *Zpracování objednávek* — samostatně:
  pipeline funkcí nad objednávkami (filtr, výpočet, seskupení, formát)
  a memoizovaný výpočet.
- **quiz** `kviz` — *Kvíz: closures a `this`* — co vypíše kód s closures
  v cyklu, `this` v různých voláních, `bind`, rekurze.

## 2.7 `js-tridy-kolekce` — Třídy, prototypy, Map, Set a iterátory

**Po sekci umíš:** vysvětlit prototypovou dědičnost; napsat třídu se
soukromými poli, gettery a statickými členy; zvolit mezi objektem,
`Map` a `Set`; napsat iterovatelný objekt a generátor a zpracovat data
iterator helpers.

**Předpoklady:** `js-funkce-hloubka`.

- **lesson** `prototypy` — *Prototypy* — řetěz prototypů, hledání
  vlastnosti, `Object.create`, `Object.getPrototypeOf`, odkud se berou
  metody pole a řetězce, proč nerozšiřovat vestavěné prototypy.
- **lesson** `tridy` — *Třídy* — `class` jako syntaxe nad prototypy,
  `constructor`, metody, gettery a settery, `static`, soukromá pole `#`
  a `#x in obj`, `extends` a `super`, `instanceof`; kompozice vs. dědičnost.
- **workshop** `workshop-bankovni-ucet` [js] — *Bankovní účet* — staví:
  účet s historií transakcí a spořicí účet. Učí: soukromý stav, validace
  v metodách, getter zůstatku, `static` továrna, dědičnost s `super`,
  vyhození chyby při neplatné operaci (chyby do hloubky v `js-chyby-ladeni`).
  ~20 kroků.
- **lesson** `map-a-set` — *Map, Set, WeakMap* — `Map` vs. objekt
  (libovolné klíče, pořadí, velikost), `Set` a odstranění duplicit,
  nové metody `Set` (`union`, `intersection`, `difference`,
  `symmetricDifference`, `isSubsetOf`), `WeakMap` pro metadata k objektům,
  převody na pole.
- **lesson** `iteratory-generatory` — *Iterátory a generátory* —
  iterační protokol a `Symbol.iterator`, co je iterovatelné (`for…of`,
  spread, destrukturalizace), `function*` a `yield`, líné nekonečné
  sekvence, iterator helpers (`map`, `filter`, `take`, `drop`, `toArray`
  na iterátoru), `Iterator.from`.
- **workshop** `workshop-knihovna-her` [js] — *Knihovna her* — staví:
  kolekce her s rychlým hledáním podle id, štítky a stránkováním. Učí:
  vlastní třída kolekce s `Map`, štítky v `Set` a jejich průniky,
  `[Symbol.iterator]`, generátor stránek, iterator helpers. ~20 kroků.
- **lab** `lab-inventar` [js] — *Inventář skladu* — samostatně: třídy
  pro sklad a položky, `Map` podle kódu, porovnání skladů přes metody `Set`.
- **quiz** `kviz` — *Kvíz: třídy a kolekce* — řetěz prototypů, soukromá
  pole, `Map` vs. objekt, co je iterovatelné, co vrátí generátor.

## 2.8 `js-chyby-ladeni` — Chyby a ladění

**Po sekci umíš:** rozlišit očekávanou chybu od chyby programátora;
vyhodit, zachytit a obalit chybu tak, aby šla dohledat; napsat vlastní
třídy chyb; systematicky najít chybu v cizím kódu.

**Předpoklady:** `js-tridy-kolekce`.

- **lesson** `vyjimky` — *Výjimky* — `throw`, `try`/`catch`/`finally`
  (i `return` ve `finally`), co vyhodit (vždy `Error`, ne řetězec),
  `error.cause` pro obalení, `AggregateError`, kde chybu chytat (co
  nejvýš, kde s ní umíš něco udělat), polykání chyb jako nejhorší zvyk.
- **lesson** `vlastni-chyby` — *Vlastní chyby a návratové hodnoty* —
  `class ValidationError extends Error`, `name`, doplňující data,
  `instanceof` v `catch`; alternativa „výsledek místo výjimky"
  (`{ ok, value, error }`) a kdy ji použít; validace vstupu na hranici.
- **workshop** `workshop-validace-formulare-dat` [js] — *Validace dat
  objednávky* — staví: validátor objednávky, který vrací srozumitelné
  chyby pro každé pole. Učí: vlastní třídy chyb, sběr více chyb,
  `cause`, rozlišení chyby uživatele a chyby programu. ~15 kroků.
- **lesson** `ladeni-systematicky` — *Ladění systematicky* — reprodukce,
  hypotéza, zúžení (bisekce kódu), čtení stack trace přes více souborů,
  breakpoint na výjimce, `console.assert`, rubber duck; jak se ptát
  (minimální příklad) a jak hledat v dokumentaci a issues.
- **lab** `lab-oprav-chyby` [js] — *Oprav pět chyb* — samostatně: kód
  s pěti skrytými chybami (mutace, `this`, off-by-one, `==`, zaokrouhlení);
  každý test = jedna chyba.
- **quiz** `kviz` — *Kvíz: chyby* — co doběhne s `finally`, kde chybu
  chytat, co vypíše stack trace, typ chyby podle hlášky.

## 2.9 `js-dom` — DOM, události a prohlížeč

**Po sekci umíš:** najít, vytvořit a měnit prvky stránky bezpečně (bez
XSS přes `innerHTML`); obsloužit události včetně delegace; zpracovat
formulář v JavaScriptu; ukládat stav do `localStorage` a URL; postavit
interaktivní aplikaci bez frameworku.

**Předpoklady:** `js-chyby-ladeni`, `css-zaklady` (pro projekt doporučeno
celé CSS).

- **lesson** `strom-dom` — *Strom DOM* — dokument jako strom uzlů, `Node`
  vs. `Element`, `querySelector`/`querySelectorAll` (statický `NodeList`),
  `closest`, `matches`, `textContent` vs. `innerHTML` vs. `innerText`,
  atributy vs. vlastnosti, `dataset`, `classList`, `style` vs. třídy;
  kdy skript běží (`defer`, `type="module"`).
- **workshop** `workshop-seznam-ukolu` [dom] — *Seznam úkolů* — staví:
  todo aplikace s přidáváním, odškrtáváním a mazáním. Učí: `createElement`,
  `append`/`prepend`/`remove`, `template` a `cloneNode`, `textContent`
  místo `innerHTML`, render z pole dat (data → DOM, ne DOM jako zdroj
  pravdy). ~25 kroků.
- **lesson** `udalosti` — *Události* — `addEventListener` a volby (`once`,
  `passive`, `signal`), objekt události, fáze zachytávání a probublávání,
  `target` vs. `currentTarget`, `preventDefault` vs. `stopPropagation`,
  delegace událostí, klávesnice (`key`, ne `keyCode`), `pointer*` události,
  vlastní události (`CustomEvent`).
- **workshop** `workshop-zalozky-a-dialog` [dom] — *Záložky a modální
  okno* — staví: přístupné záložky podle APG a dialog. Učí: delegace,
  `aria-selected` a klávesové šipky, `<dialog>` a `showModal()`, vracení
  fokusu, `Escape`, `inert`. ~20 kroků.
- **lesson** `formulare-v-js` — *Formuláře v JavaScriptu* — událost
  `submit` a `preventDefault`, `FormData` a `Object.fromEntries`, `input`
  vs. `change`, Constraint Validation API (`setCustomValidity`,
  `reportValidity`), přístupné zobrazení chyb.
- **lesson** `prohlizecova-api` — *Stav a API prohlížeče* — `localStorage`
  a `sessionStorage` (jen řetězce, JSON, výjimky při zaplnění nebo
  zakázání), `URL` a `URLSearchParams`, History API (`pushState`,
  `popstate`) pro filtr v adrese, událost `storage` mezi záložkami;
  `IntersectionObserver` (lazy načítání, nekonečný seznam),
  `ResizeObserver`; layout thrashing (čtení a zápis layoutu střídavě)
  a `requestAnimationFrame` (do hloubky v `nastroje-devtools-vykon`),
  Clipboard API.
- **workshop** `workshop-filtr-produktu` [dom] — *Filtr produktů* — staví:
  katalog s vyhledáváním, filtry a řazením, stav v URL a v `localStorage`.
  Učí: `FormData` z filtrů, `URLSearchParams`, render seznamu, debounce
  hledání, prázdný stav, zachování fokusu při překreslení. ~25 kroků.
- **lab** `lab-kviz-aplikace` [dom] — *Kvízová aplikace* — samostatně:
  otázky z pole dat, výběr odpovědi, skóre, výsledky, ovládání klávesnicí.
- **quiz** `kviz` — *Kvíz: DOM a události* — pořadí událostí při
  probublávání, `target` vs. `currentTarget`, proč `innerHTML` s daty
  uživatele škodí, co uloží `localStorage`.
- **project** `projekt-kanban` [dom] — *Kanban tabule* — zadání: tabule
  úkolů se sloupci, přidáváním, přesunem (tlačítka i drag and drop),
  filtrem v URL a uložením do `localStorage`. Testy: uživatelské příběhy
  přes kliknutí a klávesnici, přežití obnovení stránky, přístupnost
  ovládacích prvků.

## 2.10 `js-async` — Asynchronní JavaScript a fetch

**Po sekci umíš:** vysvětlit event loop (zásobník, fronta úloh
a mikroúloh) a předpovědět pořadí výpisu; pracovat s Promise
a `async`/`await` včetně souběhu a zrušení; načítat data přes `fetch`
se stavy načítání, chyby a prázdna.

**Předpoklady:** `js-dom`.

- **lesson** `event-loop` — *Event loop* — JavaScript je jednovláknový,
  zásobník volání, Web API, fronta úloh (makroúlohy) vs. mikroúlohy
  (Promise, `queueMicrotask`), vykreslování mezi úlohami, proč dlouhý
  výpočet zamrazí stránku, `setTimeout(fn, 0)` není „hned"; pořadí výpisu
  jako hlavní cvičení.
- **lesson** `promise` — *Promise* — stavy, `new Promise` a kdy ho
  (skoro nikdy) psát ručně, `then`/`catch`/`finally` a řetězení,
  `Promise.all`, `allSettled`, `race`, `any`, `Promise.withResolvers`,
  neobsloužené zamítnutí.
- **lesson** `async-await` — *`async`/`await`* — `async` funkce vždy
  vrací Promise, `await` a `try`/`catch`, sekvenční vs. paralelní čekání
  (`await` v cyklu jako výkonová past), `for await…of`, top-level `await`
  v modulech, zapomenuté `await`.
- **workshop** `workshop-casovace` [js] — *Časovače a souběh* — staví:
  simulace načítání několika zdrojů s timeouty. Učí: `sleep` přes Promise,
  `Promise.all` vs. `allSettled`, timeout přes `Promise.race`, retry
  s exponenciálním čekáním, `AbortController` a `AbortSignal.timeout`. ~20 kroků.
- **lesson** `fetch` — *fetch a HTTP z prohlížeče* — `fetch` a objekt
  `Response`, `fetch` nevyhodí chybu na 404 (`response.ok`), `json()`,
  metody, hlavičky a tělo (`JSON.stringify`, `FormData`), CORS z pohledu
  prohlížeče, zrušení požadavku, souběh odpovědí (starší odpověď přepíše
  novější).
- **workshop** `workshop-pocasi` [dom] — *Aplikace na počasí* — staví:
  vyhledávání města a předpověď z mock API v seedu (modul `api.js`, který
  napodobí `fetch` se zpožděním a chybami — testy nesmí na síť). Učí:
  stavy načítání, chyby a prázdna, zrušení předchozího požadavku při psaní,
  debounce, formátování dat, přístupné oznámení stavu (`aria-live`). ~25 kroků.
- **lab** `lab-galerie-api` [dom] — *Galerie s nekonečným scrollováním* —
  samostatně: stránkované načítání z mock API, `IntersectionObserver`,
  chyba a opakování.
- **quiz** `kviz` — *Kvíz: async* — pořadí výpisu s `setTimeout`,
  Promise a `await`; `fetch` a 404; paralelní vs. sekvenční; neobsloužené
  zamítnutí.
- **project** `projekt-filmova-databaze` [dom] — *Filmová databáze* —
  zadání: aplikace pro procházení filmů z přiloženého mock API (seznam,
  hledání, detail, oblíbené, stránkování, historie v URL). Testy: chování
  při načítání, chybě serveru, prázdném výsledku, navigaci zpět a obnovení
  stránky.

---

# Část 3 — Nástroje

Všechno kolem kódu, bez čeho se nedá pracovat v týmu ani na vlastním
projektu: terminál, Git, balíčky a moduly, build, DevTools do hloubky,
TypeScript a testy. Od téhle části dělá uživatel projekty ve VS Code
s vlastním `npm install`.

## 3.1 `nastroje-terminal-git` — Terminál a Git

**Po sekci umíš:** pohybovat se v terminálu, pracovat se soubory a procesy;
verzovat projekt Gitem (commit, větve, merge, konflikt, rebase základ),
spolupracovat přes GitHub a vrátit se z nejčastějších průšvihů.

**Předpoklady:** `js-zaklady` (celá část 2 doporučena).

- **lesson** `terminal` — *Terminál* — shell, prompt, `pwd`, `ls -la`,
  `cd`, absolutní a relativní cesty, `~` a `..`, `mkdir -p`, `touch`, `cp`,
  `mv`, `rm` (a proč bez koše), `cat`, `less`, `grep`, roury a přesměrování,
  proměnné prostředí a `PATH`, návratový kód, `Ctrl+C`, procesy a porty
  (`lsof -i`), `--help` a `man`.
- **workshop** `workshop-terminal` [node] — *Úklid projektu v terminálu* —
  staví: sérii příkazů, které založí strukturu projektu, přesunou soubory,
  vyhledají text a zapíšou výsledek do souboru (testy spouštějí příkazy
  přes `helpers.run`). ~15 kroků.
- **lesson** `git-model` — *Jak Git myslí* — repozitář, pracovní adresář,
  staging area, commit jako snímek s rodičem, `HEAD`, větev jako ukazatel,
  `git status`/`diff`/`log --oneline --graph`, dobrá commit zpráva,
  `.gitignore` a co do repozitáře nepatří (tajemství, `node_modules`).
- **workshop** `workshop-git` [node] — *Git od prvního commitu po konflikt* —
  staví: repozitář malého projektu. Učí: `init`, `add -p`, `commit`,
  `switch -c`, `merge` (fast-forward vs. merge commit), vyřešení konfliktu,
  `restore`, `revert`, `stash`, tagy. ~20 kroků.
- **lesson** `git-spoluprace` — *GitHub a spolupráce* — `remote`, `push`,
  `fetch` vs. `pull`, pull request a code review, `rebase` vs. `merge`
  (a zlaté pravidlo nepřepisovat sdílenou historii), `reset --soft/--hard`,
  `reflog` jako záchranná síť, SSH klíče, forky.
- **lab** `lab-git-zachrana` [node] — *Záchrana repozitáře* — samostatně:
  opravit repozitář (commit na špatné větvi, smazaný soubor, konflikt,
  omylem commitnutý `.env`).
- **quiz** `kviz` — *Kvíz: terminál a Git* — co udělá příkaz, stav po
  sérii příkazů, `merge` vs. `rebase`, `reset` vs. `revert`.

## 3.2 `nastroje-moduly-vite` — Moduly, npm a Vite

**Po sekci umíš:** rozdělit kód do ES modulů; spravovat závislosti přes npm
(verze, lockfile, skripty); založit a sestavit projekt ve Vite a vysvětlit,
co bundler dělá.

**Předpoklady:** `nastroje-terminal-git`, `js-async`.

- **lesson** `es-moduly` — *ES moduly* — `export` pojmenovaný a výchozí,
  `import`, živé vazby, moduly jsou strict a mají vlastní scope, cesty
  a přípony, dynamický `import()`, top-level `await`, cyklické importy,
  `import.meta`; CommonJS (`require`) jen jako to, co potkáš ve starém kódu.
- **workshop** `workshop-moduly` [node] — *Rozdělení aplikace do modulů* —
  staví: z jednoho dlouhého souboru utilit rozumnou strukturu modulů
  s veřejným rozhraním (`index.js`). ~15 kroků.
- **lesson** `npm` — *npm a package.json* — `npm init`, `dependencies`
  vs. `devDependencies`, sémantické verzování a `^`/`~`, `package-lock.json`
  a `npm ci`, `node_modules`, `scripts` a `npm run`, `npx`, `"type":
  "module"`, `exports`, bezpečnost závislostí (`npm audit`, typosquatting,
  kolik stojí jedna závislost).
- **lesson** `vite` — *Vite a bundlery* — proč bundler (moduly, závislosti,
  minifikace, hash v názvu pro cache), dev server a HMR, `index.html`
  jako vstup, import CSS a obrázků, `public/`, proměnné prostředí
  (`import.meta.env`, `VITE_` a co je veřejné), `vite build` a `preview`,
  co je v `dist/`.
- **workshop** `workshop-vite-projekt` [node] — *Projekt ve Vite* — staví:
  převod aplikace z `js-dom` do Vite projektu (struktura, moduly, CSS,
  skripty, build); testy spouštějí `node --run` a kontrolují výstup buildu.
  ~15 kroků.
- **lab** `lab-knihovna-utilit` [node] — *Balíček s utilitami* —
  samostatně: malý npm balíček s `exports`, skripty a README.
- **quiz** `kviz` — *Kvíz: moduly a npm* — pojmenovaný vs. výchozí export,
  význam `^1.2.3`, lockfile, co se dostane do buildu, `VITE_` proměnné.

## 3.3 `nastroje-devtools-vykon` — DevTools a výkon webu

**Po sekci umíš:** najít příčinu problému ve stránce přes Elements, Console,
Sources, Network, Performance, Memory a Application; změřit Core Web Vitals
a opravit nejčastější příčiny pomalé stránky.

**Předpoklady:** `nastroje-moduly-vite`, `css-animace`.

- **lesson** `devtools-mapa` — *DevTools do hloubky* — Elements (stavy
  `:hover`, změny DOM breakpoint, Computed a Layout), Console (`$0`,
  `$$`, živé výrazy), Sources (breakpoint na události a XHR/fetch, local
  overrides, source mapy), Network (vodopád, filtry, throttling,
  blokování požadavku, kopírovat jako cURL), Application (storage, cache,
  cookies).
- **lesson** `core-web-vitals` — *Core Web Vitals* — LCP, INP, CLS a co je
  ovlivňuje, laboratorní vs. terénní data, Lighthouse a jeho limity,
  panel Performance (hlavní vlákno, long tasks, flame chart).
- **lesson** `nacitani-stranky` — *Rychlé načtení* — kritická cesta
  vykreslení, blokující CSS a JS (`defer`, `async`, `type="module"`),
  obrázky (formáty AVIF/WebP, rozměry, `fetchpriority`, `loading="lazy"`),
  písma (`font-display`, systémové fonty), `preload` a `preconnect`,
  cache hlavičky a hash v názvech, velikost JavaScriptu a code splitting.
- **workshop** `workshop-zrychleni` [dom] — *Zrychlení pomalé stránky* —
  staví: opravuje stránku s posunujícím se layoutem, blokujícím skriptem,
  obrovskými obrázky a dlouhými úlohami na hlavním vlákně. Učí: rozměry
  obrázků proti CLS, rozdělení dlouhé úlohy (`scheduler.yield`,
  `setTimeout`), delegace místo tisíce posluchačů, `content-visibility`,
  debounce drahého výpočtu. ~20 kroků.
- **lesson** `pamet` — *Úniky paměti* — co drží objekt naživu
  (posluchači, časovače, closures, odpojené DOM uzly, cache bez limitu),
  heap snapshot a porovnání, `AbortController` pro úklid posluchačů.
- **lab** `lab-audit-vykonu` [dom] — *Audit výkonu* — samostatně: stránka
  s osmi výkonovými problémy, každý test ověří jeden.
- **quiz** `kviz` — *Kvíz: DevTools a výkon* — co znamenají metriky, který
  panel použít pro daný problém, co blokuje vykreslení, příčina CLS.

## 3.4 `nastroje-typescript` — TypeScript

**Po sekci umíš:** otypovat funkce, objekty a API odpovědi; číst typové
chyby a opravit je bez `any`; zúžit typ z neznámých dat; nastavit
`tsconfig` pro Vite i Node projekt.

**Předpoklady:** `nastroje-moduly-vite`.

- **lesson** `proc-typescript` — *Proč TypeScript* — statická kontrola
  vs. běh, typy se při spuštění mažou (Node odstraní typy sám, Vite také),
  `tsc --noEmit` jako kontrola, odvození typů, kdy typ psát a kdy ne.
- **lesson** `zakladni-typy` — *Základní typy* — primitivní typy, pole
  a n-tice, `type` vs. `interface`, volitelné a `readonly` vlastnosti,
  sjednocení a literálové typy, `unknown` vs. `any` vs. `never`, typy
  funkcí, `strict` a `strictNullChecks`.
- **workshop** `workshop-typy-kosiku` [node] — *Otypovaný košík* — staví:
  přepis modulu košíku z JS do TS. Učí: typy produktů a položek,
  literálové typy stavů objednávky, návratové typy, `satisfies`,
  `as const`, oprava chyb odhalených typy. ~20 kroků.
- **lesson** `zuzovani-a-genericita` — *Zúžení typů a generika* —
  `typeof`/`in`/`instanceof` guardy, rozlišené sjednocení (discriminated
  union) a vyčerpávající `switch` s `never`, vlastní type guard, generické
  funkce a typy (`Result<T>`), `keyof`, utility typy (`Partial`, `Pick`,
  `Omit`, `Record`), proč `as` lže.
- **workshop** `workshop-api-klient` [node] — *Typově bezpečný API klient* —
  staví: klient nad JSON API s ověřením dat na hranici. Učí: `unknown`
  z `JSON.parse`, ruční validátor jako type guard, generický `fetchJson<T>`,
  rozlišené sjednocení pro stav načítání. ~15 kroků.
- **lab** `lab-typy-udalosti` [node] — *Systém událostí* — samostatně:
  otypovaný emitter událostí s mapou názvů na typy dat.
- **quiz** `kviz` — *Kvíz: TypeScript* — co projde kontrolou, `unknown`
  vs. `any`, zúžení, generika, co zbude po odstranění typů.

## 3.5 `nastroje-testovani` — Testování

**Po sekci umíš:** rozhodnout, co a jak testovat; napsat unit testy
čistých funkcí i kódu s časem a sítí; napsat end-to-end test v Playwrightu;
refaktorovat pod ochranou testů.

**Předpoklady:** `nastroje-typescript`.

- **lesson** `proc-testovat` — *Co testovat a proč* — testovací pyramida
  (a trofej), unit vs. integrační vs. e2e, testovat chování, ne
  implementaci, dobrý název testu, arrange–act–assert, co je křehký test.
- **workshop** `workshop-unit-testy` [node] — *Unit testy utilit* — staví:
  testy pro utility z části 2 v `node:test` (`describe`/`it`/`assert`),
  pak totéž ve Vitestu v projektu. Učí: okrajové případy, `assert.throws`
  a `rejects`, parametrizované testy, test, který nejdřív selže. ~20 kroků.
- **lesson** `mocky-cas-sit` — *Čas, síť a závislosti* — mock funkce
  a špehy, falešné časovače, mock `fetch`, vkládání závislostí místo
  mockování modulů, kdy mock škodí; test DOM komponenty (Testing Library
  princip: dotazy podle role a textu).
- **lesson** `playwright` — *End-to-end v Playwrightu* — prohlížeč řízený
  testem, lokátory podle role (`getByRole`, `getByLabel`), automatické
  čekání, proč `waitForTimeout` dělá flaky testy, izolace dat, trace
  viewer, screenshot jen jako doplněk.
- **workshop** `workshop-refaktoring` [node] — *Refaktoring pod testy* —
  staví: nejdřív charakterizační testy přerostlé funkce, pak její rozdělení
  malými kroky beze změny chování. ~15 kroků.
- **lab** `lab-testy-validatoru` [node] — *Testy pro cizí kód* — samostatně:
  napsat sadu testů, která odhalí tři chyby ve validátoru formuláře.
- **quiz** `kviz` — *Kvíz: testování* — co testovat, křehký vs. robustní
  test, mock vs. skutečná závislost, lokátory v Playwrightu.
- **project** `projekt-rozpoctovac` [node] — *Aplikace na rozpočet ve Vite
  a TypeScriptu* — zadání: osobní rozpočet (příjmy, výdaje, kategorie,
  měsíční přehled, uložení v `localStorage`) jako Vite projekt v TS.
  Technické požadavky: moduly, `tsc --noEmit` bez chyb, unit testy
  logiky ve Vitestu, jeden e2e test v Playwrightu, build bez varování,
  Git historie po malých commitech. Kontrola spouští `npm run typecheck`,
  `npm test` a `npm run build`.

---

# Část 4 — Framework a backend

Z frontendu na celou aplikaci. Nejdřív backend bez frameworku (Node, HTTP,
SQL), aby bylo vidět, co frameworky dělají pod kapotou; pak Vue, Nuxt jako
fullstack, bezpečnost a provoz. Věci, které v prohlížečovém editoru běžet
nemůžou (`.vue` soubory, Vue Router, Pinia, Nuxt), jsou v projektech.

## 4.1 `node-zaklady` — Node.js základy *(pilotní sekce)*

**Po sekci umíš:** vysvětlit, co je Node a čím se liší od prohlížeče;
spustit soubor a používat vestavěné moduly přes `node:` (`fs`, `http`,
`process`); napsat HTTP server bez frameworku s routováním, stavovými kódy,
JSON a tělem požadavku; postavit malé REST API ukládající data do souboru.

**Předpoklady:** `nastroje-moduly-vite`, `js-async`.

Moduly (konkrétní slugy určuje `content/node-zaklady/section.json`):

- **lesson** — co je Node: runtime mimo prohlížeč, `node soubor.js`,
  `process.argv` a `process.env`, vestavěné moduly s předponou `node:`,
  `fs/promises`, cesty přes `path` a `import.meta.dirname`.
- **workshop** [node] — HTTP server krok po kroku: `http.createServer`,
  `req.method` a `req.url`, routování, `res.writeHead` a stavové kódy,
  JSON odpověď, čtení těla požadavku, 404 a 400.
- **project** [node] — API poznámek ve VS Code: CRUD nad soubory JSON,
  testy přes `helpers.startServer` a `fetch`.
- **quiz** — Node vs. prohlížeč, moduly `node:`, stavové kódy, čtení těla.

## 4.2 `api-http-rest` — HTTP a návrh REST API

**Po sekci umíš:** navrhnout REST API (zdroje, metody, stavové kódy, tvar
chyb, stránkování); validovat vstup na serveru; vysvětlit a nastavit CORS
a cache hlavičky; otestovat API přes `curl` a automatické testy.

**Předpoklady:** `node-zaklady`.

- **lesson** `http-do-hloubky` — *HTTP do hloubky* — metody a jejich
  sémantika (bezpečné, idempotentní), stavové kódy po skupinách
  (200/201/204, 301/304, 400/401/403/404/409/422/429, 500/503), hlavičky
  (`Content-Type`, `Accept`, `Location`, `Cache-Control`, `ETag`),
  HTTP/1.1 vs. HTTP/2 a 3 jednou větou, `curl -i` a `-X` a `-d`.
- **lesson** `navrh-rest` — *Návrh REST API* — zdroje a URL (podstatná
  jména, množné číslo, vnoření), filtrování a řazení v query, stránkování
  (offset vs. kurzor), jednotný tvar chyby (`application/problem+json`),
  verzování, PATCH vs. PUT, idempotence a opakování požadavků.
- **workshop** `workshop-api-knihovny` [node] — *API knihovny* — staví:
  API knih a výpůjček nad daty v paměti. Učí: router s parametry cesty,
  `URL` a `searchParams`, filtr a řazení s whitelistem, stránkování
  s metadaty, 201 s `Location`, 204 po smazání, 409 při konfliktu. ~20 kroků.
- **lesson** `validace-a-chyby-api` — *Validace a chyby na serveru* —
  nikdy nevěř klientovi, validace tvaru, typů a rozsahů, 400 vs. 422,
  centrální zpracování chyb, co nesmí uniknout v chybové odpovědi (stack,
  SQL), limit velikosti těla; knihovna schémat (Zod/Valibot) jako princip:
  schéma = kontrola + typ.
- **lesson** `cors-a-cache` — *CORS a cache* — same-origin policy, kdy
  prohlížeč pošle preflight, `Access-Control-Allow-*` a proč CORS
  nechrání server, `Cache-Control` (`no-store`, `max-age`, `private`),
  `ETag` a podmíněný požadavek s 304.
- **lab** `lab-api-ukolu` [node] — *API úkolů* — samostatně: API úkolů
  s validací, stránkováním, filtrem, konzistentními chybami a CORS.
- **quiz** `kviz` — *Kvíz: HTTP a REST* — výběr stavového kódu, idempotence,
  návrh URL, kdy nastane preflight, co udělá `ETag`.

## 4.3 `sql-databaze` — SQL a databáze

**Po sekci umíš:** navrhnout schéma s klíči a vazbami; psát dotazy
s `JOIN`, agregací a stránkováním; používat vázané parametry; pracovat
v transakcích; najít pomalý dotaz a přidat index; napojit databázi na API.

**Předpoklady:** `api-http-rest`.

- **lesson** `relacni-databaze` — *Relační databáze* — tabulky, řádky,
  sloupce, typy, primární klíč, cizí klíč, `NOT NULL`, `UNIQUE`, `CHECK`,
  výchozí hodnoty; SQLite vs. PostgreSQL (co se liší v praxi); `node:sqlite`.
- **workshop** `workshop-prvni-dotazy` [node] — *Katalog v SQL* — staví:
  dotazy nad databází filmů. Učí: `SELECT` a sloupce, `WHERE`, `AND`/`OR`,
  `LIKE`, `IN`, `IS NULL` (a proč ne `= NULL`), `ORDER BY`, `LIMIT`/`OFFSET`,
  `INSERT`, `UPDATE` a `DELETE` s `WHERE` (a bez něj), vázané parametry. ~20 kroků.
- **lesson** `navrh-schematu` — *Návrh schématu* — vazby 1:N a M:N,
  vazební tabulka, normalizace do 3. normální formy srozumitelně
  a kdy denormalizovat, `ON DELETE`, časové údaje, soft delete, migrace
  schématu (přidání sloupce bez ztráty dat).
- **workshop** `workshop-join-agregace` [node] — *Recenze a hodnocení* —
  staví: schéma uživatelů, filmů a recenzí a dotazy nad ním. Učí:
  `CREATE TABLE` s cizími klíči, `JOIN` vs. `LEFT JOIN`, aliasy,
  `COUNT`/`AVG`/`SUM`, `GROUP BY` a `HAVING`, poddotaz, okenní funkce
  (`ROW_NUMBER`, klouzavý průměr), upsert (`ON CONFLICT`). ~25 kroků.
- **lesson** `transakce-a-indexy` — *Transakce, indexy a N+1* —
  `BEGIN`/`COMMIT`/`ROLLBACK`, atomicita (převod kreditu), souběh
  a zámky zmínkou, index a kdy pomůže, `EXPLAIN QUERY PLAN`, problém N+1
  dotazů a jak ho poznat; ORM a query buildery (Drizzle) — co přidají
  a co vezmou.
- **lab** `lab-eshop-dotazy` [node] — *Dotazy pro e-shop* — samostatně:
  schéma objednávek a deset dotazů (tržby po měsících, nejprodávanější,
  zákazníci bez objednávky, transakce objednávky).
- **quiz** `kviz` — *Kvíz: SQL* — výsledek dotazu nad malou tabulkou,
  `JOIN` vs. `LEFT JOIN`, `WHERE` vs. `HAVING`, kdy index pomůže.
- **project** `projekt-api-receptu` [node] — *API receptů s databází* —
  zadání: REST API receptů se surovinami, štítky a hodnocením nad SQLite.
  Technické požadavky: schéma s cizími klíči a migrací, vázané parametry,
  validace, stránkování, transakce při vytvoření receptu se surovinami,
  žádné N+1 v seznamu. Testy přes `startServer` a `fetch`.

## 4.4 `vue-zaklady` — Vue 3 základy

**Po sekci umíš:** postavit interaktivní rozhraní ve Vue 3 s Composition
API; vysvětlit reaktivitu (`ref`, `reactive`, `computed`, `watch`) a proč
obyčejná proměnná nestačí; vykreslovat seznamy a podmínky; rozdělit UI
do komponent s props a událostmi.

**Předpoklady:** `js-dom`, `nastroje-moduly-vite`.

- **lesson** `proc-framework` — *Proč framework* — deklarativní UI
  (stav → vzhled) proti ruční práci s DOM z `js-dom`, komponenty,
  reaktivita jednou větou, Vue vs. React vs. Svelte bez fanatismu;
  `createApp` a šablona v prohlížeči.
- **lesson** `reaktivita` — *Reaktivita* — `ref` a `.value` (a proč
  v šabloně bez něj), `reactive` a ztráta reaktivity při destrukturalizaci,
  `computed` s cache vs. metoda, `watch` a `watchEffect` a kdy je
  (ne)použít, `nextTick` a dávkování změn DOM, reaktivita přes Proxy.
- **workshop** `workshop-pocitadlo-kalorii` [vue] — *Počítadlo kalorií* —
  staví: denní přehled jídel se součty a cílem. Učí: interpolace,
  `v-bind`/`:`, `v-on`/`@` s modifikátory, `v-model` (i `.number`,
  `.trim`), `v-if`/`v-else`/`v-show`, `v-for` s `:key` (proč index jako
  klíč škodí), `computed` součty, `:class` a `:style`. ~25 kroků.
- **lesson** `komponenty` — *Komponenty* — `defineComponent`/`setup` v
  prohlížeči a `<script setup>` v SFC, props (typy, výchozí hodnoty,
  jednosměrný tok dat, props se nemutují), `emit` a události, `v-model`
  na komponentě (`defineModel`), sloty a pojmenované sloty, slot vs. prop.
- **workshop** `workshop-karta-a-seznam` [vue] — *Komponenty katalogu* —
  staví: katalog z komponent `ProductCard`, `ProductList`, `FilterBar`.
  Učí: props a události mezi komponentami, `defineModel` pro filtr,
  slot pro prázdný stav, zvednutí stavu do rodiče. ~20 kroků.
- **lab** `lab-kviz-ve-vue` [vue] — *Kvízová aplikace ve Vue* — samostatně:
  kvíz z `js-dom` přepsaný do Vue komponent (porovnání obou přístupů).
- **quiz** `kviz` — *Kvíz: Vue základy* — kdy se překreslí, `ref` vs.
  `reactive`, `computed` vs. `watch`, klíče ve `v-for`, props a emit.

## 4.5 `vue-aplikace` — Vue aplikace

**Po sekci umíš:** strukturovat větší Vue aplikaci: composables, sdílený
stav, životní cyklus, načítání dat, formuláře; nastavit Vue Router a Pinia
v projektu s Vite a `.vue` soubory.

**Předpoklady:** `vue-zaklady`, `nastroje-typescript`.

- **lesson** `zivotni-cyklus-a-composables` — *Životní cyklus a composables* —
  `onMounted`, `onUnmounted` a úklid (posluchači, časovače, `AbortController`),
  template refs, composable jako funkce se stavem (`useFetch` vlastními
  silami, `useLocalStorage`), pravidla composables, VueUse jako knihovna
  hotových composables a kdy po ní sáhnout.
- **workshop** `workshop-composables` [vue] — *Vlastní composables* —
  staví: `useFetch` se stavy a zrušením, `useDebounced`, `useLocalStorage`,
  použité v aplikaci hledání. ~20 kroků.
- **lesson** `sdileny-stav` — *Sdílený stav* — props drilling,
  `provide`/`inject`, modulový reaktivní stav, Pinia (store, getters,
  actions, `storeToRefs`) a kdy ji potřebuješ; optimistický update
  a rollback.
- **lesson** `router-a-sfc` — *SFC, Vite a Vue Router* — `.vue` soubory
  (`<script setup lang="ts">`, `<style scoped>` a jak scoped funguje),
  `npm create vue`, trasy, dynamické parametry, `RouterLink`
  a aktivní trasa, vnořené trasy, navigační guardy, lazy načítání tras,
  typy props v TS.
- **workshop** `workshop-formular-ve-vue` [vue] — *Vícekrokový formulář* —
  staví: průvodce objednávkou se sdíleným stavem, validací a souhrnem.
  Učí: `provide`/`inject`, validace přes `computed`, přístupné chyby,
  zachování stavu mezi kroky, optimistické odeslání s rollbackem. ~20 kroků.
- **lab** `lab-kosik-sdileny-stav` [vue] — *Košík napříč komponentami* —
  samostatně: katalog, košík v hlavičce a stránka košíku se sdíleným stavem.
- **quiz** `kviz` — *Kvíz: Vue aplikace* — úklid v `onUnmounted`,
  `provide`/`inject` vs. Pinia, scoped styly, parametry tras.
- **project** `projekt-vue-dashboard` [node] — *Správa úkolů týmu ve Vue* —
  zadání: SPA ve Vite + Vue + TS s Routerem a Pinia nad API z `sql-databaze`
  (nebo přiloženým mock serverem): přihlášení na zkoušku, seznam s filtry
  v URL, detail, formulář, optimistické úpravy. Kontrola: `npm run build`,
  unit testy composables, e2e scénáře.

## 4.6 `nuxt-fullstack` — Nuxt: fullstack aplikace

**Po sekci umíš:** postavit fullstack aplikaci v Nuxtu: stránky a layouty,
serverové API routy nad databází, načítání dat s SSR, stav a SEO; vysvětlit
rozdíl mezi SSR, SSG a SPA a co se kdy spouští na serveru a co v prohlížeči.

**Předpoklady:** `vue-aplikace`, `sql-databaze`.

- **lesson** `ssr-spa-ssg` — *SSR, SPA a SSG* — co posílá server v každém
  režimu, hydratace a chyby nesouladu (hydration mismatch), výhody pro SEO
  a první vykreslení, cena na serveru, hybridní vykreslování podle tras
  (`routeRules`).
- **lesson** `nuxt-struktura` — *Struktura Nuxt projektu* — `app/pages`
  a souborové routování, layouty, `components` a automatické importy,
  `composables`, `app.vue`, middleware tras, `useState` vs. Pinia, `error.vue`.
- **lesson** `serverove-routy` — *Serverové API v Nuxtu* — `server/api`,
  `defineEventHandler`, metody v názvu souboru (`.post.ts`), `getQuery`,
  `readBody` a `readValidatedBody`, `getRouterParam`, `createError`
  a stavové kódy, server middleware a `event.context`, databáze na serveru;
  h3 jako to, co je pod tím (srovnání s `node-zaklady`).
- **lesson** `nacitani-dat-nuxt` — *Načítání dat* — `useFetch` vs.
  `useAsyncData` vs. `$fetch`, klíče a deduplikace, `pending`/`error`/
  `refresh`, `lazy` a `server: false`, proč `$fetch` v `setup` volá API
  dvakrát, `useSeoMeta` a OG tagy, `runtimeConfig` a veřejné vs. tajné hodnoty.
- **quiz** `kviz` — *Kvíz: Nuxt* — co běží na serveru, `useFetch` vs.
  `$fetch`, souborové routování, hydratace, `runtimeConfig`.
- **project** `projekt-nuxt-blog` [node] — *Blog s komentáři v Nuxtu* —
  zadání: blog s články z databáze, komentáři, stránkováním, SEO
  a administrací konceptů. Technické požadavky: serverové routy
  s validací, SQLite, SSR seznamu i detailu, `useFetch`, `error.vue`,
  přístupnost. Kontrola: build, testy API přes spuštěný server.

## 4.7 `auth-bezpecnost` — Autentizace a bezpečnost

**Po sekci umíš:** bezpečně ukládat hesla, implementovat přihlášení přes
session a cookie, oddělit autentizaci od autorizace; poznat a opravit SQL
injection, XSS a CSRF; omezit zneužití API (rate limit, velikost vstupů);
rozhodnout mezi session a JWT.

**Předpoklady:** `sql-databaze`, `nuxt-fullstack` (projekt sekce je v Nuxtu,
workshopy běží v čistém Node).

- **lesson** `hesla` — *Hesla* — proč ne šifrování ani rychlý hash, sůl,
  pomalé funkce (`scrypt`, Argon2), `crypto.scrypt` a `timingSafeEqual`,
  pravidla pro hesla podle NIST (délka místo složitosti), reset hesla
  jednorázovým tokenem.
- **lesson** `session-a-cookies` — *Session, cookies a JWT* — přihlášení
  jako stav na serveru, cookie atributy (`HttpOnly`, `Secure`, `SameSite`,
  `Max-Age`, `Path`), session v databázi, odhlášení a zneplatnění, JWT
  a jeho skutečné výhody a nevýhody, kde nesmí být token (`localStorage`),
  OAuth/OIDC přihlášení přes třetí stranu v principu, passkeys zmínkou.
- **workshop** `workshop-prihlaseni` [node] — *Registrace a přihlášení* —
  staví: registraci, přihlášení, odhlášení a chráněnou routu nad SQLite
  v čistém Node. Učí: normalizace e-mailu a `UNIQUE` s 409, hash hesla,
  session token z `crypto.randomBytes`, cookie atributy, middleware
  načítající uživatele, 401 vs. 403, stejná odpověď pro špatný e-mail
  i heslo. ~25 kroků.
- **lesson** `owasp-zranitelnosti` — *Nejčastější zranitelnosti* — SQL
  injection (ukázka zneužití a vázané parametry), XSS uložené a odražené
  (escapování, `v-html` a `innerHTML`, Content Security Policy), CSRF
  (`SameSite`, token, kontrola `Origin`), IDOR (cizí id v URL), otevřené
  přesměrování, únik tajemství v repozitáři a v chybách, zranitelné závislosti.
- **workshop** `workshop-oprav-zranitelnosti` [node] — *Oprava děravého
  API* — staví: opraví API s SQL injection, IDOR, XSS v odpovědi, chybějícím
  rate limitem a únikem stack trace. Učí: vázané parametry, kontrola
  vlastnictví, bezpečnostní hlavičky (CSP, `X-Content-Type-Options`),
  rate limit s 429 a `Retry-After`, limit těla a typu nahrávaného souboru.
  ~20 kroků.
- **lab** `lab-role-a-opravneni` [node] — *Role a oprávnění* — samostatně:
  API s rolemi uživatel, redaktor a správce, kontrola oprávnění na
  každé routě a audit log.
- **quiz** `kviz` — *Kvíz: bezpečnost* — najdi zranitelnost v kódu,
  cookie atributy, 401 vs. 403, session vs. JWT, co CORS nechrání.

## 4.8 `nasazeni-provoz` — Nasazení a provoz

**Po sekci umíš:** připravit aplikaci na produkci (konfigurace, tajemství,
logování, chybové stavy), sestavit a spustit ji v kontejneru, nastavit CI,
které pustí testy před nasazením, a nasadit ji na server nebo platformu
s HTTPS.

**Předpoklady:** `auth-bezpecnost`, `nastroje-testovani`.

- **lesson** `produkcni-rezim` — *Z vývoje do produkce* — rozdíly
  dev/prod (build, minifikace, source mapy, chybové stránky), konfigurace
  přes proměnné prostředí a `.env` mimo Git, tajemství, `NODE_ENV`,
  health check endpoint, graceful shutdown (`SIGTERM`).
- **lesson** `logovani-a-chyby` — *Logování a monitoring* — strukturované
  logy (JSON, úrovně, request id), co nelogovat (hesla, tokeny, osobní
  údaje), centrální handler chyb, sledování chyb (Sentry v principu),
  metriky a uptime, jak číst log při incidentu.
- **workshop** `workshop-pripraveny-server` [node] — *Server připravený
  na provoz* — staví: z API ze `sql-databaze` udělá produkčně připravenou
  službu. Učí: validace konfigurace při startu, strukturované logy
  s request id, health check, graceful shutdown, obecné chybové odpovědi
  bez detailů. ~15 kroků.
- **lesson** `kontejnery-a-servery` — *Kontejnery, servery a HTTPS* —
  Docker image a kontejner, `Dockerfile` pro Node (vícefázový build, ne root,
  `.dockerignore`), `docker compose` s databází, reverse proxy (Caddy)
  a HTTPS s Let's Encrypt, VPS vs. platforma (Vercel, Netlify, Fly),
  statický hosting vs. server, zálohy databáze.
- **lesson** `ci-cd` — *CI/CD* — GitHub Actions workflow (lint, typy,
  testy, build), cache závislostí, tajemství v CI, nasazení po merge,
  náhledová prostředí, návrat k předchozí verzi, migrace databáze
  při nasazení (dvoufázová změna schématu).
- **lab** `lab-dockerfile-a-ci` [node] — *Dockerfile a workflow* —
  samostatně: napsat `Dockerfile`, `compose.yaml` a workflow pro
  přiložený projekt (testy kontrolují obsah a spustitelnost souborů,
  kde to jde bez sítě).
- **quiz** `kviz` — *Kvíz: provoz* — co patří do `.env`, co logovat,
  pořadí kroků v CI, proč vícefázový build, graceful shutdown.
- **project** `projekt-zaverecny` [node] — *Závěrečný fullstack projekt* —
  zadání: vlastní aplikace podle jednoho ze tří zadání (rezervační systém,
  bazar s inzeráty, sdílený rozpočet domácnosti) v Nuxtu s databází,
  přihlášením, rolemi, validací, testy (unit, API, e2e), Dockerfile,
  CI workflow a README s postupem nasazení. Kontrola: build, typy,
  testy a sada uživatelských příběhů proti spuštěné aplikaci. Tohle je
  projekt, který uživatel ukáže na pohovoru.

