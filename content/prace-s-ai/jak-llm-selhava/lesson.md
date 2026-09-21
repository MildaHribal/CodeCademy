# Jak jazykový model selhává

:::check pretest
Model ti nabídne `pole.clear()`. Co je pravděpodobnější — že tahle metoda v JavaScriptu existuje a ty ji neznáš, nebo že si ji model vymyslel?

### --expected--
Že si ji vymyslel.
:::

Generovaný kód se skoro nikdy nerozbije nahlas. Kdyby se rozbil, nebyl by to problém —
spadlo by to, přečetl bys hlášku a opravil to. Nebezpečné je to, co projde: kód, který
se spustí, na ukázkových datech vrátí správné číslo a chybu ukáže až za tři týdny
u zákazníka. Tahle lekce je katalog takových [[tichá chyba|tichých chyb]], aby tě žádná z nich
nepřekvapila podruhé.

> [!REMEMBER]
> **Model negeneruje řešení, generuje text, který vypadá jako řešení.** Ta dvě slova se
> u většiny zadání potkají. Tvoje práce začíná tam, kde se rozejdou.

## 1. Co model vlastně dělá

Jazykový model rozdělí text na [[token modelu|tokeny]] — kousky slov — a pak pořád dokola
odhaduje, který token je nejpravděpodobnější další. Nic jiného nedělá. Nespouští kód,
nedívá se do dokumentace, nemá seznam metod pole. Když mu napíšeš `pole.`, dopíše
metodu, která se v jeho trénovacích datech po tečce objevovala nejčastěji v podobném
kontextu.

Z toho plynou tři vlastnosti, se kterými musíš počítat:

- **Sebejistota nesouvisí se správností.** Věta „tohle je standardní přístup" zní stejně
  u pravdivé i vymyšlené odpovědi, protože je to jen další pravděpodobný text.
- **Model vidí jen to, co má v [[kontextové okno|kontextovém okně]].** Zbytek tvého
  repozitáře, tvoje verze knihovny ani tvůj včerejší commit tam nejsou, pokud jsi je
  tam nedal.
- **Trénovací data mají [[datum uzávěrky]].** Model zná svět po určité datum a novější
  zápis nemusí znát vůbec — zato dobře zná ten, který se používal pět let předtím.

:::live js predict
```js
const kosik = ['rohlík', 'máslo'];

try {
  kosik.clear();
  console.log('vyčištěno');
} catch (chyba) {
  console.log(chyba.constructor.name);
}
```
--question-- Model tenhle kód nabídl jako „standardní způsob, jak vyprázdnit pole". Co se stane po spuštění?
--option-- Vypíše `vyčištěno` — `clear()` na poli funguje od ES2023.
--option*-- Vypíše `TypeError` — metoda `clear` na poli neexistuje.
--option-- Nevypíše nic, protože `clear()` vrátí `undefined`.
--why-- `clear()` mají `Set` a `Map`, pole ne. Model to zamění, protože ve statistice textu jsou si ty tři věci hodně blízko. Pole se vyprázdní přes `kosik.length = 0` nebo náhradou za nové pole.
:::

:::check
Proč je sebejistý tón odpovědi špatný důvod jí věřit?

### --answer--
Protože model si tón vybírá podle toho, jak moc si je jistý.

#### --why--
Model žádnou míru jistoty nepočítá a nedává ji najevo tónem — tón je jen další generovaný text.

### --correct--
Protože formulace je generovaná stejně jako obsah, takže vypadá stejně u správné i vymyšlené odpovědi.

#### --why--
Jistotu si musíš ověřit sám: spuštěním, testem nebo v dokumentaci.

### --see--
prace-s-ai/jak-llm-selhava#1-co-model-vlastne-dela
:::

## 2. Vymyšlené API a vymyšlené balíčky

Nejčastější [[halucinace]] v kódu je metoda nebo volba, která by dávala smysl, ale
neexistuje. Model ji poskládá z toho, co zná odjinud: `array.clear()` ze `Setu`,
`string.reverse()` z Pythonu, `fetch(url, { timeout: 3000 })` z knihovny `axios`.
Tahle kategorie je naštěstí ta hodnější — pozná ji běh programu.

Horší je vymyšlená **závislost**. Když ti model napíše `npm install react-form-guard`
a balíček neexistuje, `npm` to řekne. Jenže jména, která si modely vymýšlejí, se
opakují. Útočník si vypíše nejčastější vymyšlená jména, zaregistruje je a do balíčku
dá instalační skript. Tomuhle útoku se říká [[slopsquatting]] a je to reálná cesta,
jak dostat cizí kód na tvůj počítač — ne do aplikace, ale rovnou do terminálu při
instalaci.

> [!PITFALL]
> Balíček, který ti model poradil, ověř **před** instalací: kolik má na npm verzí, kdy
> vyšla poslední, má odkaz na repozitář a je v něm kód. Balíček s jednou verzí starou
> tři dny a bez repozitáře neinstaluj.

:::check
Model ti navrhl `npm install date-cz-format`. Jaký je nejhorší možný následek toho, že balíček ve skutečnosti nevznikl jako seriózní knihovna?

### --answer--
Aplikace nepůjde sestavit, protože import selže.

#### --why--
To je ten dobrý konec — chyba při sestavení je hlasitá a hned ji vidíš.

### --correct--
Někdo mohl to jméno zaregistrovat dřív a instalační skript balíčku se spustí na tvém počítači.

#### --why--
Instalace závislosti není čtení kódu, ale spuštění cizího kódu s tvými právy.

### --see--
prace-s-ai/jak-llm-selhava#2-vymyslene-api-a-vymyslene-balicky
:::

## 3. Zastaralý zápis, který kdysi býval správný

Tahle chyba je tišší, protože kód funguje. Jen je napsaný stylem, který tým opustil.
Model odpovídá podle převahy v datech, a převahu má vždycky to, co se psalo delší dobu:

| Co model rád nabídne | Co dnes patří do kódu |
|---|---|
| `var` a `function` v komponentě | `const`, `let`, šipkové funkce |
| `componentWillMount`, třídní komponenty | funkční komponenty a hooky |
| `new Buffer(data)` | `Buffer.from(data)` |
| `moment().format()` | `Intl.DateTimeFormat` |
| `xhr.onreadystatechange` | `fetch` s `await` |
| `substr` | `slice` |

Kód s `var` projde testy. Neprojde review a hlavně ti zanese do projektu dva styly
vedle sebe. Čím víc stylů, tím dražší každá další změna.

> [!TIP]
> Když si nejsi jistý, jestli je zápis aktuální, zeptej se na to zvlášť a konkrétně:
> „Je `substr` v roce 2026 doporučený zápis, nebo existuje novější?" Přímá otázka
> vytáhne z modelu i varování, která sám od sebe nenapíše.

:::check
Proč model nabízí starší zápis častěji než ten dnešní, i když ten dnešní zná?

### --answer--
Protože starší zápis je spolehlivější a méně se mění.

#### --why--
Spolehlivost model neposuzuje — ta do statistiky textu nevstupuje.

### --correct--
Protože se starší zápis používal delší dobu, takže je v trénovacích datech mnohonásobně častější.

#### --why--
Novinka má proti deseti letům starších návodů statisticky mizivou šanci.

### --see--
prace-s-ai/jak-llm-selhava#3-zastaraly-zapis-ktery-kdysi-byval-spravny
:::

## 4. Šťastná cesta bez ošetřených stavů

Zadání skoro nikdy nevyjmenuje, co se má stát, když data chybí. Model nedoplní, co
jsi neřekl — vyrobí nejkratší kód, který splní větu ze zadání. Výsledkem je
[[šťastná cesta]]: kód, který počítá s tím, že pole není prázdné, číslo je číslo,
odpověď serveru dorazí a má tvar, jaký čekáš.

:::compare
```html
<h2>Kola v akci</h2>
<ul id="seznam"></ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; color: #1f2937; }
h2 { font-size: 1rem; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; }
ul { list-style: none; padding: 0; display: grid; gap: .5rem; }
li { display: flex; justify-content: space-between; background: #f3f4f6; border-radius: .5rem; padding: .6rem .8rem; }
.cena { font-weight: 600; }
```
```js
const kola = [
  { nazev: 'Gravel Ráže 1', cena: 24990 },
  { nazev: 'Městské Ráže City', cena: null },
  { nazev: 'Dětské Ráže Mini', cena: 7490 },
];
const seznam = document.querySelector('#seznam');
```
--variant-- Kód od modelu
```js
seznam.innerHTML = kola
  .map((kolo) => `<li>${kolo.nazev}<span class="cena">${Math.round(kolo.cena * 1.21)} Kč</span></li>`)
  .join('');
```
--variant-- Se stavem „cena chybí"
```js
const popisCeny = (cena) =>
  typeof cena === 'number' ? `${Math.round(cena * 1.21)} Kč` : 'Cena na dotaz';
seznam.innerHTML = kola
  .map((kolo) => `<li>${kolo.nazev}<span class="cena">${popisCeny(kolo.cena)}</span></li>`)
  .join('');
```
:::

Obě varianty se spustí, obě projdou tvým rychlým pohledem na obrazovku — dokud se
nepodíváš na druhý řádek. `NaN Kč` je přesně ta chyba, která se dostane na produkci,
protože testovací data ji neobsahují.

:::explain
Vysvětli vlastními slovy, proč se „šťastná cesta" objevuje v generovaném kódu tak
spolehlivě, i když model umí ošetření chyb napsat, když si o něj řekneš.

## --model--
Model plní to, co je v zadání, a nic navíc — nemá představu o mém provozu, takže neví,
že `cena` může být `null` nebo že server umí vrátit 500. Kratší odpověď je zároveň
pravděpodobnější pokračování než dlouhá s ošetřením, protože v datech je většina
ukázek kódu zkrácená na jádro věci. Ošetření stavů tedy není chyba modelu, ale chybějící
část mého zadání: dokud nevyjmenuju, co má nastat při prázdném vstupu a při selhání,
nemá to model odkud vzít.

## --checklist--
- Model doplní jen to, co je v zadání, protože můj provoz nezná.
- Ukázky kódu v datech bývají zkrácené na šťastnou cestu.
- Ošetření stavů si musím vyžádat jako součást zadání.
:::

:::check
Která z otázek odhalí šťastnou cestu nejrychleji?

### --answer--
„Je ten kód dostatečně rychlý?"

#### --why--
Rychlost se u prázdného ani chybného vstupu neprojeví — kód se tam chová špatně, ne pomalu.

### --correct--
„Co udělá tenhle kód, když dostane prázdné pole a když server vrátí chybu?"

#### --why--
Prázdný vstup a selhání jsou dva stavy, na které zadání skoro nikdy nemyslí.

### --see--
prace-s-ai/jak-llm-selhava#4-stastna-cesta-bez-osetrenych-stavu
:::

## 5. Kód, který vypadá jako test

Když si necháš od modelu vygenerovat testy ke kódu, který ten samý model právě napsal,
dostaneš často [[vždy zelený test]] — test, který nemůže selhat, protože měří totéž,
co implementace dělá:

```js
test('vypocitejSlevu vrací číslo', () => {
  assert.equal(typeof vypocitejSlevu(1000, 'JARO10'), 'number');
});
```

Tenhle test zůstane zelený, i kdyby funkce vracela `-1`, `0` nebo cenu bez slevy.
Zelená v CI ti pak dodá jistotu, kterou nemáš čím podložit. Užitečný test říká
**konkrétní číslo** a pochází ze zadání, ne z implementace.

> [!PITFALL]
> Rychlá zkouška kvality testu: zkus si v hlavě kód rozbít. Když tě nenapadne změna
> implementace, po které by test zčervenal, test nic nehlídá.

:::check
Jak nejrychleji poznáš, že vygenerovaný test nic nekontroluje?

### --answer--
Když neobsahuje žádný `await`.

#### --why--
`await` s kvalitou aserce nesouvisí — synchronní test může být výborný.

### --correct--
Když rozbiješ implementaci a test zůstane zelený.

#### --why--
Test, který nedokáže selhat, měří jen to, že se kód spustil.

### --see--
prace-s-ai/jak-llm-selhava#5-kod-ktery-vypada-jako-test
:::

## 6. Typické chyby a pasti

> [!PITFALL]
> **Smíchané verze knihovny.** Model spojí zápis z verze 5 a 6 v jednom souboru. Kód se
> tváří konzistentně a spadne až u volání, které používáš málo.

> [!PITFALL]
> **Vymyšlené citace a čísla.** Model klidně doplní jméno RFC, číslo stavového kódu nebo
> odkaz na dokumentaci, který neexistuje. Odkaz vždycky otevři, než ho vložíš do popisu
> pull requestu.

> [!PITFALL]
> **Ztracený kontext při delší konverzaci.** Po dvaceti zprávách model použije starší
> verzi tvé funkce, kterou jsi mezitím přepsal. Novou verzi mu pošli znovu, místo aby se
> odkazoval na „tu funkci výš".

> [!PITFALL]
> **Souhlas místo odpovědi.** Když modelu odporuješ, často ustoupí a přepíše i správné
> řešení na špatné. Souhlas modelu není důkaz — důkaz je test.

:::check
Modelu odporuješ, že jeho řešení je špatně. Model se omluví a přepíše ho. Co z toho plyne o správnosti nové verze?

### --answer--
Že je správná — model uznal chybu, kterou v prvním pokusu udělal.

#### --why--
Omluva je generovaný text jako každý jiný. Model přitaká i tehdy, když se mýlíš ty.

### --correct--
Nic. Ústup modelu není důkaz, rozhodne až spuštění nebo test.

#### --why--
Tenhle sklon souhlasit umí přepsat i správné řešení na špatné, když na svém omylu trváš.

### --see--
prace-s-ai/jak-llm-selhava#6-typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [Hallucinated package names](https://socket.dev/blog/slopsquatting-how-ai-hallucinations-are-fueling-a-new-class-of-supply-chain-attacks) — jak vypadá útok přes vymyšlený balíček.
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) — přehled rizik nástrojů nad jazykovými modely.
- [MDN: Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) — seznam metod, který má pravdu, když se model plete.

# --questions--

## --question--

Model ti s naprostou jistotou popsal metodu `Object.mapValues()`. Jakým nejrychlejším
krokem si ověříš, jestli existuje?

### --expected-- ignore-case
Spustím ji

### --accept--
spustit ji
zkusím ji zavolat
vyhledám ji v MDN
podívám se do MDN
MDN

### --why--
Obě cesty trvají pár vteřin: zavolání v konzoli skončí `TypeError`, MDN metodu nenajde.
Nejhorší varianta je nechat si to potvrdit od stejného modelu — ten souhlasí rád.

### --see--
prace-s-ai/jak-llm-selhava#2-vymyslene-api-a-vymyslene-balicky

## --question--

Proč je vymyšlený **balíček** nebezpečnější než vymyšlená **metoda**?

### --answer--
Protože chybu v balíčku nejde opravit, kdežto metodu si dopíšeš sám.

#### --why--
Náhrada za neexistující balíček je práce navíc, ale ne bezpečnostní problém.

### --correct--
Protože instalace balíčku spustí cizí kód na tvém počítači, kdežto neexistující metoda jen shodí program.

#### --why--
Neexistující metoda je hlasitá chyba. Podvržený balíček se tváří, že instalace proběhla v pořádku.

### --see--
prace-s-ai/jak-llm-selhava#2-vymyslene-api-a-vymyslene-balicky

## --question--

Dostaneš od modelu funkci, která z pole objednávek spočítá obrat. Napiš dvě testovací
data (ne kód), na kterých se šťastná cesta typicky rozsype.

### --expected--
prázdné pole a objednávka s chybějící cenou

### --accept--
prázdné pole a záporné číslo
prázdné pole a null
prázdný seznam a chybějící hodnota

### --why--
Prázdný vstup a chybějící hodnota jsou dva stavy, které v ukázkových datech nikdy nejsou,
a v provozu nastanou první týden.

### --see--
prace-s-ai/jak-llm-selhava#4-stastna-cesta-bez-osetrenych-stavu

## --question--

Model ti napsal komponentu s `componentWillMount` a třídním zápisem. Kód funguje.
Proč ho přesto nenecháš v projektu?

### --answer--
Protože třídní komponenty jsou pomalejší než funkční.

#### --why--
Rozdíl ve výkonu tady není to podstatné a v běžné aplikaci ho nezměříš.

### --correct--
Protože do projektu přinese druhý styl zápisu vedle stávajícího, a každý další styl zdraží všechny budoucí změny.

#### --why--
Konzistence projektu je skutečný důvod; zastaralost zápisu je jen příznak.

### --see--
prace-s-ai/jak-llm-selhava#3-zastaraly-zapis-ktery-kdysi-byval-spravny

## --question--

**Opakování z dřívějška.** Model ti vygeneroval součet košíku jako
`polozky.reduce((soucet, p) => soucet + p.cena)`. Na jakém vstupu tenhle zápis spadne
a proč?

### --expected--
na prázdném poli, protože reduce nemá počáteční hodnotu

### --accept--
na prázdném poli
prázdné pole, chybí počáteční hodnota reduce

### --why--
`reduce` bez počáteční hodnoty vezme jako první akumulátor první prvek pole. U prázdného
pole není co vzít a vyhodí `TypeError`. Správně je `reduce((soucet, p) => soucet + p.cena, 0)`.

### --see--
js-pole/metody-pole-do-hloubky#reduce-bez-pocatecni-hodnoty

## --question--

**Opakování z dřívějška.** Ve vygenerovaném kódu najdeš
`const serazene = polozky.sort((a, b) => a.cena - b.cena);`. Co se stane s polem
`polozky`, které funkce dostala v parametru?

### --expected--
Seřadí se taky, protože sort mění původní pole.

### --accept--
změní se
seřadí se i původní pole
sort mutuje původní pole

### --why--
`sort` řadí na místě a vrací totéž pole. Kopii vyrobíš přes `[...polozky].sort(…)` nebo
`polozky.toSorted(…)`.

### --see--
js-pole/co-je-pole#mutace-pole-z-parametru
