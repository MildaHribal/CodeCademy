# DevTools do hloubky

:::check pretest
Na stránce e-shopu se cena produktu po pár sekundách sama přepíše na jinou. Kód má tisíce řádků a nevíš, která funkce to dělá. Jak to zjistíš nejrychleji?

### --answer--

Projdu v editoru všechna místa, kde se v kódu objevuje `textContent`.

#### --why--

V cizím kódu jich budou desítky a některé přijdou z knihoven. Prohlížeč umí ukázat přesně to jedno místo, jak uvidíš v druhé části.

### --correct--

Nechám DevTools zastavit program ve chvíli, kdy se prvek s cenou změní.

#### --why--

Breakpoint na změnu DOM zastaví program přímo v řádku, který cenu přepsal, a zásobník volání ukáže, kdo ho zavolal.

### --answer--

Do každé funkce přidám `console.log` a počkám, který se vypíše.

#### --why--

Funguje to, ale u tisíců řádků ti to zabere hodiny. DevTools to zvládne jedním kliknutím.
:::

:::check pretest
Otevřeš a zavřeš dialog na stránce stokrát. Stránka pak reaguje pomaleji a zabírá víc paměti. Co myslíš, co si prohlížeč mohl pamatovat?

### --answer--

Nic, prohlížeč paměť po zavření dialogu vždycky uvolní sám.

#### --why--

Uvolní jen to, na co už nic neodkazuje. Jak se to pokazí, ukáže část o únicích paměti.

### --correct--

Posluchače událostí, které se při každém otevření přidaly a nikdo je neodebral.

#### --why--

Každý posluchač drží svou funkci i všechno, na co funkce odkazuje. Sto otevření, sto posluchačů. Přesně tohle najdeš v části o únicích paměti.
:::

Ve firmě ti nikdo nepošle hlášení „na řádku 212 je chyba". Přijde „cena v košíku skáče", „stránka po chvíli zpomalí" nebo „na mobilu se to načítá věčnost". DevTools v Chromu mají na každý takový typ otázky jiný panel. Kdo zná jen Console, hledá všechno přes `console.log` a hodiny hádá.

Debugger, breakpoint na výjimce, podmíněný breakpoint a logpoint už znáš ze sekce [Chyby a ladění](see:js-chyby-ladeni/ladeni-systematicky#podmineny-breakpoint-a-logpoint). Tahle lekce přidá zbytek mapy.

> [!REMEMBER]
> **Nejdřív pojmenuj otázku, pak vyber panel.** Co je na stránce, řeší Elements; co se stalo, Console a Sources; co přišlo po síti, Network; co si stránka uložila, Application; kam mizí paměť, Memory.

## Mapa panelů: který na co

| otázka z hlášení | panel | co v něm uděláš |
|---|---|---|
| Proč prvek vypadá nebo stojí jinak? Kdo ho změnil? | **Elements** | styly, spočtené hodnoty, breakpoint na změnu DOM |
| Co program právě vypsal? Jakou hodnotu má výraz teď? | **Console** | výrazy nad živou stránkou, živé výrazy |
| Kudy program šel a s jakými hodnotami? | **Sources** | breakpointy, krokování, přepis souborů |
| Co se stáhlo, jak dlouho to trvalo, co vrátil server? | **Network** | vodopád požadavků, zpomalení sítě, blokování |
| Co má stránka v úložišti, cookies a cache? | **Application** | čtení, úprava a mazání uložených dat |
| Proč stránka zadrhává? | **Performance** | záznam práce hlavního vlákna (lekce [Core Web Vitals](see:nastroje-devtools-vykon/core-web-vitals#panel-performance-zaznam-a-cteni)) |
| Proč roste paměť? | **Memory** | snímky haldy a jejich porovnání |

DevTools otevřeš klávesou F12 nebo Ctrl+Shift+I (na Macu Cmd+Option+I). Panel, který v liště nevidíš, najdeš přes Ctrl+Shift+P (příkazová paleta) — napiš jeho jméno, třeba `Performance monitor`.

> [!TIP]
> Ukázky v Akademii běží v izolovaném rámu. DevTools je pro celou stránku Akademie ukážou taky, ale pohodlnější je **otevřít náhled v nové kartě**: DevTools pak patří jen ukázce a nic cizího v nich nepřekáží.

:::check
Zákazník hlásí: „Po přihlášení mi web ukazuje cizí jméno." Máš podezření, že server vrací špatná data. Ve kterém panelu to ověříš jako první?

### --answer--

Elements, protože jméno je vidět na stránce.

#### --why--

Elements ukáže, co na stránce je, ale ne odkud to přišlo. Jméno mohl špatně vypsat i kód stránky nad správnými daty.

### --correct--

Network, u požadavku na profil se podívám na odpověď serveru.

#### --why--

Záložka Response u požadavku ukáže přesně to, co server poslal. Když je cizí jméno už tam, chyba je na serveru. Když ne, hledáš dál v kódu stránky.

### --answer--

Application, protože jméno může být uložené v cookies.

#### --why--

Cookie může nést přihlášení, ale podezření zní „server vrací špatná data". Odpověď serveru ukáže jiný panel.

### --see--

nastroje-devtools-vykon/devtools-mapa#mapa-panelu-ktery-na-co
:::

## Elements: kdo změnil DOM

Panel Elements neukazuje soubor `index.html`, ale **živý DOM**, jak ho zrovna upravil JavaScript. Když se prvek mění a nevíš proč, klikni na něj pravým tlačítkem a zvol **Break on**:

- **subtree modifications** — zastaví, když se změní potomci prvku (přibude, zmizí nebo se přepíše text),
- **attribute modifications** — zastaví při změně atributu (`class`, `hidden`, `aria-expanded`),
- **node removal** — zastaví, když někdo prvek odebere.

Program se zastaví v panelu Sources **přímo na řádku, který změnu udělal**. Vpravo v **Call Stack** vidíš celou cestu: kdo tu funkci zavolal a kdo zavolal jeho. Seznam nastavených breakpointů je v Sources v oddílu **DOM Breakpoints**.

V ukázce se cena kola po dvou sekundách sama přepíše. Kód je schválně napsaný tak, aby se z něj špatně četlo, která ze tří funkcí to dělá.

:::live dom
```html
<article class="product">
  <p class="product__type">Horské elektrokolo</p>
  <h2>Crussis e-Atland 7.9</h2>
  <p class="price" id="price">64 990 Kč</p>
  <p class="note" id="note">Skladem na prodejně Cejl</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; background: #f6f3ec; color: #1b2433; }
.product { max-width: 22rem; padding: 1.25rem; background: #fff; border-radius: 1rem; border: 1px solid #e3ddd0; }
.product__type { margin: 0; color: #9a3a0f; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
h2 { margin: 0.25rem 0; }
.price { margin: 0.5rem 0; font-size: 1.6rem; font-weight: 800; }
.note { margin: 0; color: #5d6878; }
```
```js
const priceEl = document.querySelector('#price');
const noteEl = document.querySelector('#note');

function refreshStock() {
  noteEl.textContent = 'Poslední kus na prodejně Cejl';
  priceEl.textContent = '59 990 Kč';
}

function applyVoucher() {
  priceEl.textContent = '61 990 Kč';
}

function recalcVat() {
  noteEl.textContent = 'Cena včetně DPH';
}

const jobs = { a: refreshStock, b: applyVoucher, c: recalcVat };
const campaignDay = new Date(2026, 3, 15).getDay();
setTimeout(jobs[['a', 'b', 'c'][campaignDay % 3]], 2000);
```
:::

Otevři náhled v nové kartě, v Elements klikni pravým tlačítkem na `<p class="price">` a nastav **Break on → subtree modifications**. Obnov stránku (breakpoint na prvku obnovení nepřežije, nastav ho hned po načtení znovu) a počkej dvě sekundy. Zkus pak totéž s **attribute modifications** — zastaví se program?

:::check
Která funkce z ukázky přepsala cenu? Zjisti to breakpointem na změnu DOM a napiš její jméno.

### --expected--

refreshStock

### --accept--

refreshStock()

### --why--

`campaignDay` je 3 (15. duben 2026 je středa) a `3 % 3` je 0, takže se spustí `jobs.a`, tedy `refreshStock`. Breakpoint tě na to dovede bez počítání: zastaví na řádku `priceEl.textContent = '59 990 Kč'` a v Call Stack je jméno funkce.

### --see--

nastroje-devtools-vykon/devtools-mapa#elements-kdo-zmenil-dom
:::

## Console: `$0`, `$$` a živé výrazy

Konzole DevTools má vlastní pomocníky, které v tvém kódu neexistují. Fungují **jen v konzoli DevTools**:

| zápis | co vrátí |
|---|---|
| `$0` | prvek, který máš právě vybraný v Elements (`$1` ten předchozí) |
| `$('.price')` | první prvek podle selektoru, jako `document.querySelector` |
| `$$('.bike')` | **pole** všech prvků podle selektoru (ne `NodeList`) |
| `$_` | výsledek posledního výrazu v konzoli |
| `copy(value)` | zkopíruje hodnotu do schránky (objekt jako JSON) |
| `getEventListeners($0)` | posluchače událostí přidané na vybraný prvek |

Vybereš v Elements tlačítko a napíšeš `getEventListeners($0)` — hned vidíš, jestli na něm posluchač vůbec je a kolik jich je.

**Živý výraz** (*live expression*) je výraz, který konzole přepočítává pořád dokola a ukazuje nahoře nad výpisy. Přidáš ho ikonou oka v liště konzole. Hodí se na hodnoty, které se mění pod rukama: `document.activeElement` (kde je fokus), `window.scrollY`, `document.querySelectorAll('.bike').length`.

V ukázce je dialog „Hlídat cenu". Uživatel s klávesnicí po jeho zavření ztratí přehled, kde je. Zjisti proč:

:::live dom
```html
<section class="watch" id="watch">
  <h2>Author Magnum 2026</h2>
  <p>57 490 Kč</p>
  <button type="button" id="open">Hlídat cenu</button>
</section>
<dialog id="dialog">
  <p>Pošleme ti e-mail, až cena klesne.</p>
  <button type="button" id="close">Zavřít</button>
</dialog>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; background: #f6f3ec; color: #1b2433; }
.watch { max-width: 20rem; padding: 1rem 1.25rem; background: #fff; border-radius: 1rem; }
button { padding: 0.5rem 1rem; border: 2px solid #1b2433; border-radius: 999px; background: #fff; font: inherit; font-weight: 600; }
button:focus-visible { outline: 3px solid #e0652b; outline-offset: 2px; }
dialog { border: 0; border-radius: 1rem; padding: 1.25rem; }
```
```js
const watch = document.querySelector('#watch');
const dialog = document.querySelector('#dialog');

function renderWatch(isWatching) {
  watch.innerHTML = `<h2>Author Magnum 2026</h2><p>57 490 Kč</p>
    <button type="button" id="open">${isWatching ? 'Cenu hlídáme' : 'Hlídat cenu'}</button>`;
  watch.querySelector('#open').addEventListener('click', () => dialog.showModal());
}

document.querySelector('#close').addEventListener('click', () => {
  dialog.close();
  renderWatch(true);
});

renderWatch(false);
```
:::

Otevři náhled v nové kartě, v Console přidej živý výraz `document.activeElement` a klávesou Tab dojdi na tlačítko „Hlídat cenu". Otevři dialog, zavři ho tlačítkem a sleduj živý výraz. Zkus pak v kódu řádek `renderWatch(true)` smazat a sleduj, co se změní.

:::check
Na který prvek ukazuje `document.activeElement` hned po zavření dialogu? Napiš jméno značky.

### --expected-- ignore-case

body

### --accept--

<body>
document.body

### --why--

`dialog.close()` vrátí fokus na tlačítko, které dialog otevřelo. Hned potom ale `renderWatch` přepíše `innerHTML` a to tlačítko smaže. Fokus nemá kde zůstat a spadne na `<body>`. Oprava: tlačítko nepřepisovat, jen změnit jeho text.

### --see--

nastroje-devtools-vykon/devtools-mapa#console-0-a-zive-vyrazy
:::

## Sources: breakpoint na událost a na síť

Breakpoint na řádku potřebuje vědět, **kde** kód je. Když to nevíš, zastav program podle toho, **co se stalo**. V panelu Sources vpravo najdeš dva oddíly:

- **Event Listener Breakpoints** — zaškrtni třeba *Mouse → click* nebo *Keyboard → keydown*. Program se zastaví v prvním posluchači, který na tu událost zareaguje, ať je v jakémkoli souboru. Odpověď na „co se vlastně stane po kliknutí na Koupit?".
- **XHR/fetch Breakpoints** — tlačítkem `+` přidáš část adresy, třeba `/api/cart`. Program se zastaví na řádku, který takový požadavek odesílá, a Call Stack ukáže, která funkce ho spustila.

Dvě další funkce Sources ušetří hodiny na produkčním webu:

**Lokální přepis** (*local overrides*) — v Sources na záložce **Overrides** vybereš složku na disku. Pak můžeš upravit CSS nebo JS kterékoli stránky, i cizí, a změna **přežije obnovení stránky**. Opravu tak vyzkoušíš přímo na produkci dřív, než ji nasadíš. Stejně přepíšeš i odpověď API (v Network pravým tlačítkem → *Override content*).

**[[source mapa|Source mapa]]** (*source map*) — kód na produkci je sbalený do jednoho souboru a zkrácený (`function a(e){return e.p*1.21}`). Source mapa je soubor `.map`, který říká, ze kterého řádku původního souboru každý kus vznikl. Když ji build vyrobí a server pošle, DevTools v Sources ukážou původní soubory a breakpoint dáš do nich. Bez source mapy aspoň klikni na ikonu `{}` (*pretty print*), ať je kód čitelný.

> [!NOTE]
> Sestavení projektu a source mapy vyrábí nástroj jako Vite při buildu. V Akademii má každý soubor ukázky na konci řádek `//# sourceURL=…`, a proto ho v Sources najdeš pod jeho jménem.

:::check
Po kliknutí na „Přidat do košíku" se odešle požadavek na `/api/cart` se špatným množstvím. Kód je rozdělený do padesáti souborů. Jak nejrychleji najdeš řádek, který požadavek posílá?

### --answer--

Nastavím breakpoint na výjimce.

#### --why--

Nic nepadá, požadavek se odešle bez chyby — jen se špatnými daty. Breakpoint na výjimce se nezastaví.

### --answer--

V Elements nastavím na tlačítko Break on → attribute modifications.

#### --why--

Tlačítku se atribut měnit nemusí. Breakpoint na změnu DOM hlídá prvek, ne síťový požadavek.

### --correct--

V Sources přidám XHR/fetch breakpoint s adresou `/api/cart`.

#### --why--

Program se zastaví přesně na řádku s `fetch` a v Call Stack uvidíš, odkud přišlo špatné množství. Nemusíš vědět, ve kterém z padesáti souborů to je.

### --see--

nastroje-devtools-vykon/devtools-mapa#sources-breakpoint-na-udalost-a-na-sit
:::

## Network: vodopád, zpomalení a blokování

Panel Network zapisuje každý požadavek stránky, **jen když je otevřený** — otevři ho a stránku obnov. Nejdůležitější je sloupec **Waterfall**, [[vodopád]]: každý řádek je jeden požadavek a pruh ukazuje, kdy začal a jak dlouho trval. Po najetí myší na pruh uvidíš fáze:

| fáze | co znamená | když je dlouhá |
|---|---|---|
| Queueing, Stalled | požadavek čeká ve frontě prohlížeče | moc požadavků na jeden server, nízká priorita |
| DNS Lookup, Initial connection, SSL | hledání serveru a navázání spojení | nový server (CDN, písma) bez `preconnect` |
| Waiting for server response | server přemýšlí, první bajt ještě nepřišel | pomalý server nebo databáze |
| Content Download | stahování těla odpovědi | velký soubor (obrázek, sbalený JS) |

Tvůj notebook na firemní Wi-Fi není telefon zákazníka ve vlaku. Nabídka **No throttling** nahoře přepne zpomalení sítě (*Fast 4G*, *Slow 4G*, *3G*). Zaškrtávátko **Disable cache** vypne cache, dokud jsou DevTools otevřené — tak uvidíš první návštěvu.

Další užitečné věci na pravém tlačítku u požadavku:

- **Block request URL** — stránka se načte bez toho souboru. Zjistíš, jestli web přežije výpadek skriptu třetí strany (chat, měření návštěvnosti).
- **Copy → Copy as cURL** — požadavek i s hlavičkami a cookies zkopíruješ jako příkaz do terminálu nebo do hlášení kolegovi z backendu.
- **Initiator** (sloupec i záložka) — kdo požadavek spustil: HTML, CSS nebo konkrétní řádek JS.

Úryvek vodopádu z načtení článku na zpravodajském webu:

| požadavek | začátek | Waiting for server response | Content Download |
|---|---|---|---|
| `clanek/jizerka-sníh` (dokument) | 0 ms | 1 820 ms | 40 ms |
| `main.css` | 1 870 ms | 30 ms | 20 ms |
| `hero-2400.jpg` | 1 950 ms | 25 ms | 2 400 ms |
| `ads.js` | 1 950 ms | 60 ms | 90 ms |

:::check
Stránka z úryvku se načítá přes čtyři sekundy. Která fáze kterého požadavku zdrží **všechno ostatní**, a proto ji budeš řešit jako první? Vyber.

### --answer--

Stahování `hero-2400.jpg`, protože trvá nejdéle.

#### --why--

Obrázek je velký a oprava se vyplatí, ale nic dalšího na něm nečeká — `main.css` i `ads.js` se stahují souběžně s ním. Hledej fázi, před kterou nezačal nikdo jiný.

### --correct--

Čekání na odpověď serveru u dokumentu, protože do té doby nezačal žádný jiný požadavek.

#### --why--

Prohlížeč neví, co dalšího stáhnout, dokud nepřečte HTML. 1,8 s mlčení serveru posune začátek všech ostatních požadavků. Je to problém serveru (pomalá databáze, chybějící cache), ne obrázků.

### --answer--

Stahování `ads.js`, protože skripty třetích stran zdržují stránku.

#### --why--

Skripty třetích stran umí zdržet, ale tenhle se stáhne za 150 ms a začal až po dokumentu. V úryvku zdržuje něco dřívějšího.

### --see--

nastroje-devtools-vykon/devtools-mapa#network-vodopad-zpomaleni-a-blokovani
:::

## Application: úložiště, cookies a cache

Panel Application ukáže, co si stránka o uživateli pamatuje, a dovolí to měnit:

- **Local storage** a **Session storage** — dvojice klíč a hodnota. Hodnotu upravíš dvojklikem, řádek smažeš klávesou Delete. Rychlejší než psát `localStorage.removeItem` do konzole.
- **IndexedDB** — databáze v prohlížeči pro větší data (offline aplikace).
- **Cookies** — všechny cookies stránky včetně příznaků `HttpOnly`, `Secure`, `SameSite` a data vypršení. Cookie s `HttpOnly` tu **vidíš**, i když ji JavaScript přes `document.cookie` nepřečte.
- **Cache storage** a **Service workers** — soubory, které si stránka uložila pro offline režim. Starý service worker umí servírovat starou verzi webu i po nasazení nové.
- **Storage → Clear site data** — jedním tlačítkem smaže všechno výš. Stav „jako nový návštěvník" bez anonymního okna.

:::check
Přihlášení na webu funguje, ale `document.cookie` v konzoli vrátí prázdný text. Kolega tvrdí, že server cookie neposílá. Co ověříš v Application?

### --answer--

Nic, prázdné `document.cookie` znamená, že cookie opravdu neexistuje.

#### --why--

Myslíš si, že JavaScript vidí všechny cookies? Některé před ním prohlížeč schválně schová.

### --correct--

V Cookies se podívám, jestli tam přihlašovací cookie je s příznakem `HttpOnly`.

#### --why--

Cookie s `HttpOnly` JavaScript nepřečte (ochrana proti krádeži přes vložený skript), ale prohlížeč ji posílá dál a Application ji ukáže. Server ji tedy posílá, jen ji konzole nevidí.

### --answer--

V Local storage zkontroluju, jestli se tam cookie neuložila.

#### --why--

Local storage a cookies jsou dvě oddělená úložiště. Cookie se do Local storage sama nikdy neuloží.

### --see--

nastroje-devtools-vykon/devtools-mapa#application-uloziste-cookies-a-cache
:::

## Úniky paměti: posluchači, časovače a odpojené uzly

JavaScript paměť neuvolňuješ ručně. Dělá to [[garbage collector]]: občas projde, na co se dá dostat z globálních proměnných a z běžícího kódu, a všechno ostatní smaže.

> [!REMEMBER]
> **Garbage collector uvolní jen to, na co už nic neodkazuje.** [[únik paměti|Únik paměti]] není „zapomenuté smazání", ale **zapomenutý odkaz**, který drží data naživu.

Ve webové aplikaci, kde uživatel hodinu kliká bez obnovení stránky, vznikají úniky třemi typickými cestami:

1. **Posluchač na `window` nebo `document`**, který se přidá při každém otevření dialogu nebo vykreslení a nikdy se neodebere. Posluchač drží svou funkci a funkce přes [closure](see:js-funkce-hloubka/closures#closure-a-pamet) všechno, na co odkazuje.
2. **Časovač**, který nikdo nezastaví. `setInterval` běží dál, i když prvek, který aktualizuje, už ze stránky zmizel.
3. **[[odpojený uzel|Odpojený uzel]]** (*detached node*) — prvek odebraný z DOM, na který pořád odkazuje proměnná, pole nebo `Map`. Z obrazovky zmizel, z paměti ne. A s ním celý jeho podstrom.

V ukázce dialog při každém otevření přidá posluchač klávesnice. Tipni si, co se stane:

:::live dom predict
```html
<p>Zkratky: Escape zavře dialog.</p>
<button type="button" id="open">Otevřít košík</button>
<dialog id="cart"><p>V košíku: Leader Fox Awalon</p><button type="button" id="close">Zavřít</button></dialog>
<p>Obsluha klávesy proběhla: <output id="runs">0×</output></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }
button { padding: 0.5rem 1rem; font: inherit; }
```
```js
const cart = document.querySelector('#cart');
const runs = document.querySelector('#runs');
let count = 0;

document.querySelector('#open').addEventListener('click', () => {
  cart.showModal();
  document.addEventListener('keydown', (event) => {
    count++;
    runs.textContent = `${count}×`;
    if (event.key === 'Escape') cart.close();
  });
});
document.querySelector('#close').addEventListener('click', () => cart.close());
```
--question-- Otevřeš a zavřeš košík třikrát, počtvrté ho otevřeš a stiskneš Escape. Kolikrát se obsluha klávesy spustí při tom jednom stisku?
--option-- Jednou, stejná obsluha se nepřidá dvakrát.
--option*-- Čtyřikrát.
--option-- Ani jednou, zavřený dialog posluchače odebere.
--why-- Každé otevření vytvoří **novou** šipkovou funkci a přidá ji jako další posluchač. `addEventListener` odmítne duplicitu jen u téže funkce, tady jsou to čtyři různé funkce. Zavření dialogu posluchače neodebírá, visí na `document`. Zkus to v náhledu a pak ověř počet v konzoli přes `getEventListeners(document)`.
--see-- nastroje-devtools-vykon/devtools-mapa#uniky-pameti-posluchaci-casovace-a-odpojene-uzly
:::

Oprava: posluchač odeber při zavření. Nejpohodlněji přes `AbortController`, který znáš z [lekce o událostech](see:js-dom/udalosti#posluchac-addeventlistener) — všechny posluchače se stejným `signal` odebere jedno `abort()`:

:::live dom
```html
<button type="button" id="open">Otevřít košík</button>
<dialog id="cart"><p>V košíku: Leader Fox Awalon</p><button type="button" id="close">Zavřít</button></dialog>
<p>Obsluha klávesy proběhla: <output id="runs">0×</output></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; }
button { padding: 0.5rem 1rem; font: inherit; }
```
```js
const cart = document.querySelector('#cart');
const runs = document.querySelector('#runs');
let count = 0;
let listeners = null;

document.querySelector('#open').addEventListener('click', () => {
  cart.showModal();
  listeners = new AbortController();
  document.addEventListener('keydown', () => {
    count++;
    runs.textContent = `${count}×`;
  }, { signal: listeners.signal });
});

cart.addEventListener('close', () => listeners?.abort());
document.querySelector('#close').addEventListener('click', () => cart.close());
```
:::

Otevři a zavři košík několikrát a stiskni klávesu, když je otevřený — počítadlo teď přibývá po jedné. Zkus řádek s `abort()` zakomentovat a sleduj, jak se chyba vrátí.

:::check
Karusel recenzí spouští v `start()` řádek `setInterval(showNext, 5000)`. Když uživatel přepne záložku, kód karusel smaže z DOM a při návratu zavolá `start()` znovu. Co se po desátém přepnutí děje?

### --answer--

Nic zvláštního, smazaný karusel si časovač zruší sám.

#### --why--

Myslíš si, že časovač patří prvku? Patří oknu a běží, dokud ho někdo nezruší přes `clearInterval`.

### --correct--

Běží deset časovačů najednou a drží v paměti i smazané karusely, na které odkazují.

#### --why--

Každé `start()` přidá další interval a nikdo nezavolá `clearInterval`. Callback `showNext` odkazuje na staré prvky karuselu, takže ani ty se neuvolní. Oprava: ulož si id z `setInterval` a při odebrání karuselu ho zruš.

### --answer--

Prohlížeč vyhodí chybu, protože `showNext` sahá na prvek, který už neexistuje.

#### --why--

Prvek neexistuje jen v DOM, v paměti ho odkaz drží dál. Kód na něm poběží bez chyby, jen zbytečně — a to je na úniku to zrádné.

### --see--

nastroje-devtools-vykon/devtools-mapa#uniky-pameti-posluchaci-casovace-a-odpojene-uzly
:::

## Snímek haldy a porovnání

Podezření na únik ověříš ve dvou nástrojích.

**Performance monitor** (Ctrl+Shift+P → *Show Performance monitor*) kreslí živé grafy: *JS heap size*, *DOM Nodes* a *JS event listeners*. Otevři a zavři dialog desetkrát. Když počet posluchačů nebo uzlů roste schodovitě a po zavření neklesne, máš únik.

**Memory → Heap snapshot** ukáže, **co** v paměti zůstalo. [[snímek haldy|Snímek haldy]] (*heap snapshot*) je seznam všech objektů v paměti stránky v jednom okamžiku. Postup, který funguje na většinu úniků:

1. Načti stránku a udělej akci jednou naprázdno (první otevření si vytvoří věci, které zůstat mají).
2. **Take snapshot** — první snímek. Před pořízením DevTools samy spustí garbage collector, takže v něm je jen to, co opravdu přežilo.
3. Udělej podezřelou akci několikrát, třeba pětkrát otevři a zavři dialog.
4. Pořiď druhý snímek a nahoře přepni zobrazení ze *Summary* na **Comparison**. Sloupec **# Delta** ukáže, kolik objektů každého typu přibylo.
5. Objekty, kterých přibylo přesně pětkrát, jsou podezřelé. Klikni na jeden a dole v **Retainers** uvidíš řetěz odkazů, který ho drží naživu — třeba `listener` v `document`.

Odpojené uzly najdeš i bez porovnání: v zobrazení *Summary* napiš do filtru `Detached`. Každý řádek `Detached <li>` je prvek, který už není v DOM, a přesto ho něco drží.

:::check
Máš dva snímky haldy, před pěti otevřeními dialogu a po nich. Které zobrazení druhého snímku ukáže, kolik objektů mezi snímky přibylo? Napiš jeho název, jak je v DevTools.

### --expected-- ignore-case

Comparison

### --accept--

comparison view

### --why--

*Comparison* porovná vybraný snímek s předchozím a sloupec *# Delta* ukáže přírůstek po typech objektů. *Summary* ukazuje jen stav jednoho snímku.

### --see--

nastroje-devtools-vykon/devtools-mapa#snimek-haldy-a-porovnani
:::

:::explain
Vysvětli vlastními slovy, proč se před otevřením DevTools vyplatí nahlas pojmenovat
otázku.

## --model--
DevTools mají devět panelů a v každém desítky přepínačů — bez otázky se v nich dá
strávit půl hodiny a nic nezjistit, protože se jen kouká na zajímavá čísla. Otázka
naopak panel vybere skoro sama: „co je vlastně na stránce" vede do Elements, „co se
stalo při kliknutí" do Console a Sources, „přišla ta data ze serveru" do Network, „co
si to uložilo" do Application, „kam mizí paměť" do Memory. Navíc se z otázky pozná,
kdy jsem hotový — mám odpověď, nebo nemám.

## --checklist--
- Bez otázky se panely procházejí náhodně.
- Otázka určí, který panel je ten správný.
- Zároveň říká, jaká data v něm hledat.
- Podle odpovědi se pozná, kdy je vyšetřování u konce.
:::

## Typické chyby a pasti

### `$0` v kódu stránky

> [!PITFALL]
> **`$0`, `$$` a `getEventListeners` existují jen v konzoli DevTools.** Příznak: zkopíruješ fungující řádek z konzole do `script.js` a stránka spadne na `ReferenceError: $0 is not defined` (nebo `$$ is not defined`). Oprava: v kódu použij `document.querySelector` a `document.querySelectorAll`.

### Zapomenuté „Disable cache" a zpomalení

> [!PITFALL]
> **Zaškrtnuté Disable cache nebo zapnuté zpomalení sítě platí, dokud jsou DevTools otevřené.** Příznak: web se ti druhý den načítá podezřele pomalu a hlásíš problém, který uživatelé nemají. Oprava: před měřením zkontroluj lištu Network (u zapnutého zpomalení svítí na záložce Network výstražný trojúhelník).

### Měření v profilu s rozšířeními

> [!PITFALL]
> **Rozšíření prohlížeče (blokátor reklam, správce hesel) běží na každé stránce.** Příznak: ve snímku haldy nebo ve vodopádu vidíš cizí skripty a objekty, které web nemá. Oprava: měř v anonymním okně nebo v profilu hosta, kde rozšíření neběží.

### `console.log` drží objekt naživu

> [!PITFALL]
> **Objekt vypsaný do otevřené konzole z paměti nezmizí**, konzole si ho drží, abys ho mohl rozbalit. Příznak: při hledání úniku snímek haldy pořád ukazuje odpojené uzly, které jsi „opravil". Oprava: před měřením paměti smaž výpisy (ikona vymazání konzole nebo Ctrl+L) a `console.log` velkých objektů z kódu odstraň.

:::check
Do `script.js` sis z konzole zkopíroval řádek `$$('.review').forEach((item) => item.remove())`. Jakou chybu stránka vypíše? Napiš celou první řádku hlášky.

### --expected--

ReferenceError: $$ is not defined

### --accept--

Uncaught ReferenceError: $$ is not defined

### --why--

`$$` je pomocník konzole DevTools, stránka ho nezná. V kódu napiš `document.querySelectorAll('.review')` — `NodeList` má `forEach` také.

### --see--

nastroje-devtools-vykon/devtools-mapa#0-v-kodu-stranky
:::

V další lekci se naučíš výkon měřit čísly, která používá Google i tvůj budoucí šéf: Core Web Vitals.

## Kde to najdeš v MDN

- [Memory management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management) — jak garbage collector hledá, na co se už nedá dostat, a proč odkaz drží objekt naživu.
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — odebrání posluchačů i zrušení požadavku jedním `abort()`.
- [Chrome DevTools: DOM breakpoints](https://developer.chrome.com/docs/devtools/javascript/breakpoints#dom) — všechny druhy breakpointů včetně událostí a `fetch`. Není to MDN, ale oficiální dokumentace Chrome.
- [Chrome DevTools: Fix memory problems](https://developer.chrome.com/docs/devtools/memory-problems) — Performance monitor, snímky haldy a hledání odpojených uzlů krok za krokem.

# --questions--

## --question--

V aplikaci se po každém vyhledání přidá do `document` posluchač `scroll` s novou šipkovou funkcí. Po padesáti hledáních stránka při scrollování zadrhává. Který nástroj DevTools ti **bez čtení kódu** ukáže, že posluchačů přibývá? Napiš jeho název.

### --expected-- ignore-case

Performance monitor

### --accept--

performance monitoru
Performance monitorem

### --why--

Performance monitor kreslí živý graf *JS event listeners*. Po každém hledání v něm uvidíš schod nahoru, který nikdy neklesne. Snímek haldy by únik také ukázal, ale pracněji.

### --see--

nastroje-devtools-vykon/devtools-mapa#snimek-haldy-a-porovnani

## --question--

Vybereš v Elements tlačítko „Koupit" a v konzoli napíšeš `getEventListeners($0)`. Výsledek je `{}`. Co z toho plyne?

### --answer--

Tlačítko nemá žádné posluchače, takže kliknutí nemůže nic udělat.

#### --why--

Myslíš si, že klik musí obsloužit posluchač přímo na tlačítku? Událost probublává ke předkům a může ji obsloužit rodič.

### --correct--

Na samotném tlačítku posluchač není; kliknutí může obsloužit předek přes delegaci.

#### --why--

`getEventListeners` ukazuje jen posluchače přidané přímo na daný prvek. S [[delegace událostí|delegací]] visí posluchač na seznamu nebo na `document`. Vyber v Elements rodiče a zkus to znovu, nebo zapni Event Listener Breakpoint na *click*.

### --answer--

Konzole je ve špatném rámu, `$0` je proto prázdné.

#### --why--

Kdyby `$0` bylo prázdné, `getEventListeners` by nevrátilo `{}`, ale chybu. Prvek je vybraný správně.

### --see--

nastroje-devtools-vykon/devtools-mapa#console-0-a-zive-vyrazy

## --question--

Po nasazení nové verze vidí část uživatelů pořád starý web, i když obnoví stránku. Ve kterém panelu DevTools hledáš jako první a co tam zkontroluješ? Napiš název panelu.

### --expected-- ignore-case

Application

### --accept--

Application (Service workers)
Application, Service workers

### --why--

V Application zkontroluješ *Service workers* a *Cache storage*: starý service worker umí servírovat uloženou verzi webu, dokud se neaktualizuje. *Clear site data* stav na svém počítači vyčistí, u uživatelů to musí vyřešit nová verze service workeru.

### --see--

nastroje-devtools-vykon/devtools-mapa#application-uloziste-cookies-a-cache
