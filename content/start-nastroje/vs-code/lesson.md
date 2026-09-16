# VS Code a projekt na disku

:::check pretest
Ve VS Code otevřeš dvojklikem jen soubor `index.html` z projektu kavárny, ne celou složku. Co podle tebe nebude fungovat?

### --answer--
Soubor nepůjde uložit.

#### --why--
Myslíš si, že editor potřebuje složku k ukládání? Soubor uložíš normálně. Chybí něco jiného.

### --correct--
Hledání v projektu a přepínání na ostatní soubory, protože editor o složce neví.

#### --why--
Editor pracuje jen s tím, co otevřeš. Bez složky nemá průzkumník co ukázat a hledání nemá kde hledat.
:::

Web není jeden soubor. I malá stránka kavárny má `index.html`, `styles.css`, složku
s obrázky a za chvíli i Git. Když s nimi pracuješ jako s jednotlivými soubory v poznámkovém
bloku, ztrácíš čas přepínáním, hledáním a ručním zarovnáváním kódu.

VS Code je editor, ve kterém pracuje většina webových vývojářů. Umí toho hodně, ale na
začátek stačí pár věcí, které ti ušetří hodiny.

> [!REMEMBER]
> **Ve VS Code otevírej vždycky složku projektu, ne jednotlivý soubor.** Terminál, hledání, Git i náhled se pak počítají od ní.

## Složka projektu

Složku otevřeš třemi způsoby:

- menu **File → Open Folder…** a vybereš složku `kavarna`,
- přetáhneš složku do okna VS Code,
- v terminálu ve složce projektu napíšeš `code .` (tečka znamená „tahle složka").

Vlevo se objeví **průzkumník** (*Explorer*) se stromem souborů. Nový soubor nebo
složku vytvoříš ikonami nad stromem. Soubor přejmenuješ klávesou F2.

> [!TIP]
> Když `code .` hlásí `command not found`, otevři ve VS Code paletu příkazů
> (Ctrl+Shift+P) a spusť *Shell Command: Install 'code' command in PATH*. Na Linuxu
> a Windows bývá příkaz dostupný rovnou po instalaci.

:::check
Jsi v terminálu ve složce `~/projekty/kavarna`. Co napíšeš, aby se ve VS Code otevřela tahle složka?

### --expected--
code .

### --why--
`code` spustí VS Code a `.` je aktuální složka terminálu. `code index.html` by otevřel jen jeden soubor.
:::

## Integrovaný terminál

VS Code má terminál přímo v okně: menu **Terminal → New Terminal** nebo Ctrl+`
(klávesa pod Esc). Výhoda proti samostatnému terminálu: **startuje ve složce projektu**,
takže nemusíš nic hledat. Příkazy v něm fungují stejně jako v jakémkoli jiném terminálu.
Co s nimi dělat, se naučíš v lekci [Terminál: minimum na začátek](see:start-nastroje/terminal-minimum).

Terminálů můžeš mít víc vedle sebe (ikona `+` v panelu). Typicky v jednom běží server
a v druhém píšeš příkazy pro Git.

:::check
Proč je výhodné spouštět příkazy v integrovaném terminálu VS Code místo samostatného okna terminálu?

### --answer--
Protože příkazy v něm běží rychleji.

#### --why--
Myslíš si, že je to jiný, rychlejší terminál? Je to stejný shell, jen v okně editoru.

### --correct--
Protože se otevře rovnou ve složce projektu, kterou máš otevřenou.

#### --why--
Nemusíš se do projektu dostávat přes `cd`. Každá relativní cesta v příkazu se počítá od složky projektu.

### --answer--
Protože v samostatném terminálu Git nefunguje.

#### --why--
Myslíš si, že Git patří k VS Code? Git je samostatný program a funguje v jakémkoli terminálu.
:::

## Hledání v projektu

Tři zkratky, které budeš používat každý den:

| zkratka | co dělá |
|---|---|
| Ctrl+P | rychle otevře soubor podle jména: napiš `sty` a Enter otevře `styles.css` |
| Ctrl+F | hledá v otevřeném souboru |
| Ctrl+Shift+F | hledá ve **všech** souborech projektu a ukáže, kde všude se text vyskytuje |

Ctrl+Shift+F je nepostradatelné, když přejmenováváš třídu: najdeš `.hero__place`
v CSS i v HTML naráz a nic nezapomeneš.

> [!PITFALL]
> **Hledání v projektu nic nenajde, i když text v souboru je.** Nejčastější příčina:
> nemáš otevřenou složku, jen jeden soubor, nebo jsi otevřel jinou (nadřazenou či vedlejší)
> složku. Podívej se na název nahoře v průzkumníku.

:::check
Ve stylech chceš přejmenovat třídu `.hours` na `.opening-hours` a nevíš, ve kterých všech souborech je použitá. Kterou zkratkou to zjistíš?

### --expected-- ignore-case
Ctrl+Shift+F

### --accept--
ctrl shift f
Ctrl + Shift + F
Cmd+Shift+F

### --why--
Ctrl+Shift+F hledá ve všech souborech otevřené složky. Ctrl+F jen v aktuálním souboru a Ctrl+P hledá soubory podle jména, ne jejich obsah.
:::

## Rychlejší psaní: víc kurzorů a Emmet

**Víc kurzorů najednou.** Alt+klik přidá další kurzor. Ctrl+D označí slovo a každé další
stisknutí přidá jeho další výskyt. Co pak napíšeš, píšeš na všech místech zároveň. Hodí se,
když potřebuješ změnit tři stejné řádky nebo přejmenovat proměnnou v jednom souboru.

**Emmet** je zkratkový jazyk vestavěný ve VS Code. V HTML souboru napíšeš zkratku,
stiskneš Tab (nebo Enter v nabídce) a zkratka se rozbalí do značek:

| zkratka | rozbalí se na |
|---|---|
| `!` | celou kostru HTML dokumentu |
| `nav>a*3` | `<nav>` se třemi odkazy `<a href="">` uvnitř |
| `ul.menu>li*4` | `<ul class="menu">` se čtyřmi `<li>` |
| `section#hours>h2+p` | `<section id="hours">`, v něm nadpis a za ním odstavec |

`>` znamená „uvnitř", `+` „vedle", `*` „kolikrát", `.` třída a `#` id.

:::check
Kolik prvků `<li>` vytvoří Emmet ze zkratky `ol.steps>li*6`? Napiš číslo.

### --expected--
6

### --why--
`*6` zopakuje prvek šestkrát. `.steps` je třída seznamu `ol`, na počet položek nemá vliv.
:::

## Formátování při uložení

Formátovač (nejčastěji rozšíření **Prettier**) po uložení srovná odsazení, uvozovky
a zalomení řádků. Nemusíš na to myslet a kód v celém projektu vypadá stejně.

Zapneš ho v nastavení (Ctrl+,): vyhledej *Format On Save* a zaškrtni. Ručně naformátuješ
soubor přes Shift+Alt+F (na Linuxu Ctrl+Shift+I).

Formátovač mění jen bílé znaky, a na ty je HTML většinou necitlivé. **Většinou.**
Mezi dvěma řádkovými prvky (odkazy, `span`) je zalomení řádku v kódu na stránce vidět
jako mezera. Porovnej štítky na jednom řádku a pod sebou:

:::compare
```css
body { font-family: system-ui, sans-serif; }
.tag { background: #9c4a1a; color: #fff; padding: 0.25rem 0.75rem; border-radius: 1rem; }
```
--variant-- Na jednom řádku
```html
<p><span class="tag">Veganské</span><span class="tag">Bez lepku</span></p>
```
--variant-- Každý štítek na vlastním řádku
```html
<p>
  <span class="tag">Veganské</span>
  <span class="tag">Bez lepku</span>
</p>
```
:::

:::live predict
```html
<p><a class="tag" href="#kava">Káva</a><a class="tag" href="#dorty">Dorty</a></p>
<p>
  <a class="tag" href="#kava">Káva</a>
  <a class="tag" href="#dorty">Dorty</a>
</p>
```
```css
body { font-family: system-ui, sans-serif; }
.tag { background: #2b2118; color: #fff; padding: 0.25rem 0.75rem; text-decoration: none; }
```
--question-- Oba odstavce mají stejné odkazy, liší se jen zalomením řádků v kódu. Jak budou vypadat?
--option-- Úplně stejně, protože zalomení řádku v kódu se nikdy nezobrazí.
--option*-- V druhém odstavci bude mezi štítky mezera, v prvním se štítky dotýkají.
--option-- Druhý odstavec zobrazí štítky pod sebou, každý na vlastním řádku.
--why-- Zalomení řádku a odsazení mezi dvěma řádkovými prvky se sloučí do jedné mezery, a ta je vidět. Pod sebe by štítky dostal až blokový prvek nebo CSS; samotné zalomení v kódu to neudělá.
:::

Zkus po odhalení v prvním odstavci přidat mezi odkazy jednu mezeru a porovnej oba řádky.

> [!PITFALL]
> **Po formátování se mezi ikonami nebo štítky objevila mezera.** Formátovač rozdělil
> řádkové prvky na víc řádků. Prettier tomu většinou předchází (zalomí řádek uvnitř značky,
> ne mezi nimi), ruční přeformátování ne. Rozestupy mezi prvky nastavuj v CSS, ne mezerami
> v HTML; k tomu se dostaneš v sekcích o CSS.

:::check
Po uložení se formátovač rozhodl dát dva `<span>` vedle sebe na samostatné řádky. Co se může na stránce změnit?

### --answer--
Nic, formátovač mění jen vzhled kódu.

#### --why--
Myslíš si, že bílé znaky jsou v HTML vždy neviditelné? Mezi řádkovými prvky se zalomení změní v mezeru.

### --correct--
Mezi prvky se objeví mezera.

#### --why--
Zalomení řádku a odsazení se mezi řádkovými prvky sloučí do jedné viditelné mezery.

### --answer--
Prvky se zobrazí pod sebou.

#### --why--
Myslíš si, že nový řádek v kódu znamená nový řádek na stránce? `span` je řádkový prvek a zůstane na stejném řádku.
:::

## Pár rozšíření, ne desítky

Rozšíření přidávají do VS Code jazyky, formátovače a nástroje. Na začátek stačí:

- **Prettier** — formátování kódu,
- **Live Preview** (od Microsoftu) nebo **Live Server** — náhled stránky, který se obnoví po uložení,
- **Czech Language Pack** — jen pokud chceš menu česky. Kurz používá anglické názvy, protože
  je uvidíš v dokumentaci a návodech.

Proč ne dvacet? Každé rozšíření si bere paměť, zpomaluje start a některá si navzájem lezou
do zelí: dva formátovače přepisují tentýž soubor, dvě doplňování nabízejí různé věci. Když
pak něco nefunguje, nevíš, které rozšíření za to může. Přidávej rozšíření, až když víš,
jaký problém ti řeší.

:::check
Po uložení se ti soubor pokaždé přeformátuje dvakrát za sebou a pokaždé trochu jinak. Co je nejpravděpodobnější příčina?

### --answer--
Soubor je poškozený.

#### --why--
Myslíš si, že problém je v obsahu souboru? Soubor se ukládá v pořádku, jen ho něco přepisuje.

### --correct--
Máš nainstalované dva formátovače a oba reagují na uložení.

#### --why--
Každý formátovač má jiná pravidla. Nech jeden a nastav ho jako výchozí (*Default Formatter*).

### --answer--
Je zapnuté automatické ukládání.

#### --why--
Myslíš si, že za to může *Auto Save*? Ten jen ukládá. Dvojí přepsání dělají dva různé formátovače.
:::

## Náhled statické stránky

Stránku z disku otevřeš v prohlížeči dvojklikem na `index.html`. V adrese je pak
`file:///home/jana/projekty/kavarna/index.html`. Po každé změně ji musíš ručně obnovit (F5).

Pohodlnější je rozšíření s náhledem: Live Preview otevře stránku přímo ve VS Code (nebo
v prohlížeči na adrese `http://127.0.0.1:3000/`) a po uložení ji obnoví samo.

> [!PITFALL]
> **Změnil jsem CSS, ale v náhledu nic.** Záložka souboru má místo křížku bílou tečku:
> soubor není uložený. Ctrl+S, nebo zapni *File → Auto Save*. Druhá častá příčina: upravuješ
> jiný soubor, než který stránka načítá (třeba kopii `styles (1).css` ze stažených souborů).

:::check
Upravil jsi `styles.css`, náhled se nezměnil a na záložce souboru svítí tečka. Co uděláš?

### --answer--
Restartuju VS Code.

#### --why--
Myslíš si, že se zasekl editor? Tečka říká něco konkrétního o souboru.

### --correct--
Uložím soubor (Ctrl+S).

#### --why--
Tečka na záložce znamená neuložené změny. Náhled i prohlížeč čtou soubor z disku, a tam je pořád stará verze.

### --answer--
Smažu mezipaměť prohlížeče.

#### --why--
Myslíš si, že prohlížeč drží starou verzi? Na disku změna ještě není, takže ji nenačte žádný prohlížeč.
:::

## Kde to najdeš v MDN

- [Code editors](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Code_editors): k čemu je editor kódu a co od něj čekat.
- [Dealing with files](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Dealing_with_files): jak uspořádat soubory webu do složek a proč na názvech záleží.
- [VS Code: Basic Editing](https://code.visualstudio.com/docs/editing/codebasics) (dokumentace VS Code): víc kurzorů, hledání a formátování podrobně.

V další lekci se naučíš v terminálu, který máš teď ve VS Code po ruce.

# --questions--

## --question--

Kolegyně píše, že jí Ctrl+P „nenajde soubor `about.html`, i když ho vidí v Průzkumníku Windows". Ve VS Code má v průzkumníku nahoře název složky `Stažené soubory`. Co je špatně?

### --answer--
Soubor `about.html` je poškozený.

#### --why--
Myslíš si, že Ctrl+P kontroluje obsah souboru? Hledá jen podle jména v otevřené složce.

### --correct--
Má otevřenou jinou složku, než ve které soubor leží.

#### --why--
Ctrl+P i hledání v projektu prohledávají jen otevřenou složku. Ať otevře složku projektu.

### --answer--
Ctrl+P hledá jen v souborech, které už jsou otevřené v záložkách.

#### --why--
Myslíš si, že Ctrl+P prochází jen záložky? Prochází všechny soubory otevřené složky.

### --see--

start-nastroje/vs-code#hledani-v-projektu

## --question--

Jakou Emmet zkratku napíšeš, aby vznikl `<nav>` a v něm čtyři odkazy `<a>`?

### --expected--

nav>a*4

### --why--

`>` vnoří odkazy do `nav` a `*4` je zopakuje čtyřikrát.

### --see--

start-nastroje/vs-code#rychlejsi-psani-vic-kurzoru-a-emmet

## --question--

Jak se jmenuje volba ve VS Code, která po každém uložení souboru spustí formátovač? Napiš ji anglicky, jak ji najdeš v nastavení.

### --expected-- ignore-case

Format On Save

### --accept--

formatOnSave
editor.formatOnSave
format on save

### --why--

*Format On Save* (`editor.formatOnSave`) spustí výchozí formátovač při každém uložení.

### --see--

start-nastroje/vs-code#formatovani-pri-ulozeni
