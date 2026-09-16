# Jak číst MDN

Žádný vývojář si nepamatuje všechny atributy obrázku ani jaké hodnoty bere `rel` u odkazu. Rozdíl mezi juniorem a seniorem není v tom, kolik toho zná zpaměti, ale jak rychle najde spolehlivou odpověď. Na webový frontend je taková odpověď skoro vždycky na **MDN Web Docs** (*developer.mozilla.org*) — v angličtině, ale psaná srozumitelně. V téhle lekci se naučíš stránku MDN přečíst za minutu.

:::check pretest
Na stránce prvku `<img>` v MDN chceš zjistit, jestli atribut `loading` funguje i v Safari na iPhonu. Kam se podíváš?

### --answer--
Do úvodního odstavce na začátku stránky.

#### --why--
Úvod popisuje, k čemu prvek je. Podporu v jednotlivých prohlížečích tam nenajdeš.

### --correct--
Do tabulky kompatibility prohlížečů na konci stránky.

#### --why--
Sekce „Browser compatibility" má pro každý atribut řádek a pro každý prohlížeč sloupec, včetně Safari na iOS.

### --answer--
Do příkladu „Try it" nahoře a vyzkoušet ho.

#### --why--
Příklad běží v prohlížeči, který máš právě otevřený. O Safari na iPhonu ti nic neřekne.
:::

## Problém: odpověď z roku 2012

Hledáš, jak vycentrovat nadpis, a první výsledek je odpověď s tisíci hlasy:

```html
<center><h1>Vítejte na našem webu</h1></center>
```

Vyzkoušíš to a funguje. Jenže prvek `<center>` je zastaralý (*deprecated*) už přes dvacet let. Prohlížeče ho umí jen kvůli starým stránkám a dnešní kód centruje přes CSS. Návod nelhal — jen je starý a nikdo ho neaktualizoval.

> [!REMEMBER]
> **Že kód funguje, neznamená, že je správně. Ověř si ho v dokumentaci, která říká, jestli je prvek aktuální a kde je podporovaný.** Tou dokumentací je pro HTML, CSS a JavaScript MDN.

:::live predict
```html
<center>
  <h2>Letní kino Ostrov</h2>
  <p>Program na červenec</p>
</center>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #1f2933; }
```
--question-- Prvek `<center>` je v MDN označený jako zastaralý. Co s ním dnešní prohlížeč udělá?
--option-- Ignoruje ho a text zůstane zarovnaný vlevo.
--option*-- Text vycentruje, přestože prvek je zastaralý.
--option-- Obsah nezobrazí a v konzoli ukáže chybu.
--why-- Prohlížeče drží zastaralé prvky při životě, aby se nerozbily miliony starých stránek. Proto „funguje to" nic neříká o tom, jestli je kód dnes správně. Zastaralý prvek může v budoucnu zmizet a nemá žádný význam pro čtečky ani vyhledávače.
:::

:::check
Proč v prohlížečích dodnes fungují prvky, které MDN označuje jako zastaralé?

### --answer--
Protože je výrobci prohlížečů zapomněli odstranit.

#### --why--
Nejde o zapomnění. Odstranění je záměrně velmi pomalé a má jasný důvod.

### --correct--
Aby se nerozbily staré stránky, které je pořád používají.

#### --why--
Web se snaží být zpětně kompatibilní. Prvek se proto odstraní, až když ho skoro nikdo nepoužívá — do té doby funguje, ale do nového kódu nepatří.

### --answer--
Protože zastaralé znamená jen „nedoporučený vzhled", ne zakázaný prvek.

#### --why--
Zastaralý prvek je označený k odstranění ze standardu. Že dnes vypadá dobře, je jen dočasná ohleduplnost prohlížečů.
:::

## Jak hledat

Nejrychlejší cesta vede přes vyhledávač: napiš **`mdn`** a anglický název toho, co hledáš.

- `mdn img` — stránka prvku,
- `mdn a download` — atribut prvku,
- `mdn html table caption` — když si nejsi jistý, přidej `html` nebo `css`.

Hledej anglicky, i když píšeš česky. Anglických stránek je řádově víc a jsou aktuální. MDN má i český překlad jen u malé části stránek a bývá zastaralý.

Na samotném MDN funguje vyhledávání vpravo nahoře (klávesa `/`). Pozor, výsledky míchají HTML, CSS i JavaScript — `table` najde prvek `<table>` i funkci `console.table()`. Sleduj cestu v adrese: `/Web/HTML/…` je HTML, `/Web/CSS/…` CSS, `/Web/API/…` JavaScript v prohlížeči.

:::check
Jaké slovo napíšeš do vyhledávače před název prvku, aby první výsledek vedl na MDN? Napiš jen to slovo.

### --expected-- ignore-case
mdn

### --why--
Vyhledávače slovo „mdn" rozpoznají a pošlou tě na developer.mozilla.org. Bez něj často vyhrají starší návody a stránky se spoustou reklam.
:::

## Stránka prvku: co kde je

Stránky prvků mají na MDN vždy stejnou stavbu. Otevři si vedle lekce [stránku prvku `<img>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img) a projdi ji podle seznamu:

1. **Úvod** — jednou dvěma větami, k čemu prvek je.
2. **Try it** — interaktivní ukázka, kterou můžeš upravit.
3. **Attributes** — seznam atributů. U každého je popis, povolené hodnoty a výchozí hodnota.
4. **Accessibility** — na co dát pozor kvůli čtečkám a klávesnici.
5. **Examples** — delší příklady použití.
6. **Technical summary** — mimo jiné kde v HTML prvek smí stát (*Permitted parents*) a co smí obsahovat (*Permitted content*).
7. **Specifications** — odkaz na standard, podle kterého prohlížeče fungují.
8. **Browser compatibility** — tabulka podpory v prohlížečích.
9. **See also** — související stránky.

Hledaná odpověď je nejčastěji v části Attributes. Když máš otázku typu „smí být `<div>` uvnitř `<p>`?", hledej v Technical summary.

:::check
Najdi v anglické dokumentaci MDN na stránce prvku `<img>`: jakou výchozí hodnotu má atribut `loading`, když ho nenapíšeš?

### --expected-- ignore-case
eager

### --why--
V části Attributes u `loading` stojí, že výchozí je `eager` — obrázek se stáhne hned, i když je daleko pod okrajem obrazovky. Hodnota `lazy` stahování odloží.
:::

:::check
Najdi v anglické dokumentaci MDN: který atribut prvku `<ol>` nastaví, aby číslovaný seznam začínal číslem 5? Napiš jméno atributu.

### --expected-- ignore-case
start

### --why--
`<ol start="5">` začne pětkou. Na stránce `<ol>` najdeš v Attributes ještě `reversed` (číslování pozpátku) a `type` (písmena nebo římské číslice).
:::

## Zastaralé, experimentální a nestandardní

U prvků, atributů a vlastností MDN ukazuje štítky. Nauč se je poznat na první pohled:

| štítek | význam | co s tím |
|---|---|---|
| **Deprecated** | zastaralé, určené k odstranění | nepoužívej v novém kódu, na stránce najdeš náhradu |
| **Experimental** | nové, chování se ještě může změnit | použij jen s rezervou, zkontroluj podporu |
| **Non-standard** | umí to jen některý prohlížeč, není ve standardu | nepoužívej na webu pro všechny |

Zastaralé prvky, které v návodech potkáš nejčastěji: `<center>`, `<font>`, `<marquee>`, `<big>`, `<frame>` a atributy `align`, `bgcolor` nebo `border` u tabulek. Všechny se dnes nahrazují CSS.

:::check
V návodu najdeš `<table border="1" bgcolor="#eeeeee">`. MDN u obou atributů ukazuje štítek Deprecated. Co uděláš?

### --answer--
Nechám to být, protože tabulka se zobrazí správně.

#### --why--
Myslíš si, že fungující kód je hotový kód? Zastaralé atributy můžou zmizet a míchají vzhled do HTML.

### --correct--
Atributy vynechám a rámeček s pozadím nastavím v CSS.

#### --why--
Zastaralé atributy vzhledu mají náhradu v CSS (`border`, `background-color`). HTML pak popisuje jen strukturu tabulky.

### --answer--
Nahradím je štítkem Experimental, aby byly aktuální.

#### --why--
Štítek není něco, co píšeš do kódu. Popisuje stav prvku nebo atributu v dokumentaci.
:::

## Baseline a tabulka kompatibility

Nahoře na stránce najdeš rámeček **Baseline** — rychlou odpověď na otázku „můžu to použít?":

- **Baseline Widely available** (zelená) — funguje ve všech hlavních prohlížečích (Chrome, Edge, Firefox, Safari na počítači i mobilu) už aspoň dva a půl roku. Používej bez obav.
- **Baseline Newly available** (modrá) — funguje v aktuálních verzích všech hlavních prohlížečů, ale teprve krátce. Lidé se starším telefonem to mít nemusí.
- **Limited availability** (šedá nebo oranžová) — některý hlavní prohlížeč to neumí. Potřebuješ náhradní řešení.

[[Baseline]] shrnuje celou stránku. Když potřebuješ podrobnosti k jednomu atributu, sjeď na konec do [[tabulka kompatibility|tabulky kompatibility]] (*Browser compatibility*). Řádky jsou prvek a jeho atributy, sloupce prohlížeče. V buňce je verze, od které to funguje:

- zelená s číslem (`77`) — funguje od verze 77,
- červená **No** — nefunguje,
- ikona s poznámkou (*Partial support*, *footnote*) — funguje jen částečně nebo s výjimkou, klikni a přečti si ji,
- ikona vlaječky — funguje jen po zapnutí v nastavení prohlížeče, pro běžné uživatele tedy ne.

:::check
V tabulce kompatibility je u atributu v řádku Safari on iOS červené **No**, ve všech ostatních sloupcích zelená čísla. Co to znamená pro tvůj web?

### --answer--
Atribut funguje všude, jen v Safari je pomalejší.

#### --why--
Tabulka o rychlosti nic neříká. **No** znamená, že prohlížeč atribut vůbec nepodporuje.

### --correct--
Na iPhonech atribut nefunguje, takže stránka tam musí obstát i bez něj.

#### --why--
Safari na iOS je velká část mobilních uživatelů. Atribut použít můžeš, jen když jeho chybění nic nerozbije.

### --answer--
Atribut je zastaralý a do nového kódu nepatří.

#### --why--
Zastaralost ukazuje štítek Deprecated, ne tabulka kompatibility. Nový atribut může mít **No** jen proto, že ho Safari ještě nedoplnilo.
:::

## Kdy věřit návodům a Stack Overflow

MDN není jediný zdroj. Stack Overflow, blogy a videa se hodí na konkrétní problémy, které dokumentace neřeší („proč se mi v tabulce rozjíždí sloupce"). Než odpověď použiješ, projdi čtyři otázky:

1. **Kdy to vzniklo?** Odpověď na HTML a CSS starší než pět let si ověř. Zvlášť když řeší rozvržení, formuláře nebo obrázky, kde se toho hodně změnilo.
2. **Používá to něco zastaralého?** Kód s `<center>`, `<font>`, tabulkami pro rozvržení nebo atributy vzhledu v HTML ukazuje na starý návod.
3. **Souhlasí to s MDN?** Najdi použitý prvek nebo atribut na MDN a podívej se na štítky a Baseline.
4. **Rozumíš, proč to funguje?** Když ne, nepoužívej to naslepo. Kód, kterému nerozumíš, neopravíš, až se rozbije.

U Stack Overflow čti i další odpovědi pod tou přijatou — novější a lepší řešení bývá níž, protože hlasy sbírá roky.

:::check
Našel jsi odpověď z roku 2011 se 3 000 hlasy a novou odpověď z roku 2024 se 40 hlasy, která řeší totéž jinak. Jak postupuješ?

### --answer--
Použiju tu s 3 000 hlasy, protože ji ověřilo víc lidí.

#### --why--
Myslíš si, že víc hlasů znamená lepší odpověď? Stará odpověď sbírá hlasy třináct let, i když už dávno není nejlepší.

### --correct--
Ověřím obě v MDN a dám přednost aktuálnímu řešení, které MDN podporuje.

#### --why--
Hlasy měří hlavně stáří odpovědi. Rozhodne, jestli je použitý prvek aktuální a podporovaný — to řekne MDN.

### --answer--
Použiju novější, protože nové je vždycky lepší.

#### --why--
Datum samo nestačí, i nová odpověď může být špatně. Obě si ověř ve spolehlivém zdroji.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Český překlad místo anglického originálu.** Vyhledávač tě pošle na `developer.mozilla.org/cs/…` se stránkou z roku 2019. Oprava: přepni jazyk vpravo nahoře na English nebo v adrese nahraď `/cs/` za `/en-US/`.

> [!PITFALL]
> **„V Chromu mi to jde."** Vyzkoušíš novou vlastnost ve svém prohlížeči a funguje. U uživatelů se Safari ne. Oprava: před použitím čehokoli nového mrkni na Baseline.

> [!PITFALL]
> **Stránka z jiné technologie.** Hledáš `<select>` a čteš stránku o CSS vlastnosti `user-select` nebo o metodě `select()`. Oprava: zkontroluj cestu v adrese (`/Web/HTML/Reference/Elements/select`).

:::check
Otevřel jsi na MDN stránku, jejíž adresa obsahuje `/Web/API/`. O čem ta stránka je?

### --answer--
O HTML prvku.

#### --why--
HTML prvky mají v adrese `/Web/HTML/`. Tahle část webu je o něčem jiném.

### --correct--
O rozhraní pro JavaScript v prohlížeči.

#### --why--
`/Web/API/` jsou objekty a metody, které prohlížeč nabízí JavaScriptu, třeba `document.querySelector`. K nim se dostaneš v sekcích o JavaScriptu.

### --answer--
O serveru a HTTP.

#### --why--
HTTP má na MDN vlastní část `/Web/HTTP/`. `/Web/API/` je něco jiného.
:::

## Kde to najdeš v MDN

- [MDN Web Docs](https://developer.mozilla.org/en-US/) — úvodní stránka s vyhledáváním.
- [HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements) — všechny prvky na jedné stránce, zastaralé jsou v samostatné části „Obsolete and deprecated elements".
- [Baseline (compatibility)](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility) — co přesně znamenají stupně Baseline.
- [Browser compatibility tables](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Compatibility_tables) — jak číst značky a poznámky v tabulce kompatibility.

# --questions--

## --question--

Najdi v anglické dokumentaci MDN: jak se jmenuje atribut prvku `<a>`, který řekne prohlížeči, ať odkazovaný soubor stáhne, místo aby ho otevřel?

### --expected-- ignore-case
download

### --why--
`<a href="cenik.pdf" download>` soubor stáhne. Na stránce `<a>` v části Attributes je taky poznámka, že funguje jen pro soubory ze stejného webu.

### --see--
html-zaklady/mdn-a-dokumentace#stranka-prvku-co-kde-je

## --question--

Vlastnost má na MDN rámeček **Baseline Newly available**. Web děláš pro obec, kde velká část návštěvníků má starší telefony. Co z toho plyne?

### --answer--
Vlastnost je zastaralá a brzy zmizí.

#### --why--
Zastaralost ukazuje štítek Deprecated. „Newly available" naopak znamená, že je vlastnost nová.

### --correct--
Aktuální prohlížeče ji umí, ale starší telefony ji mít nemusí — stránka musí fungovat i bez ní.

#### --why--
„Newly available" znamená podporu v nejnovějších verzích. Kdo prohlížeč dlouho neaktualizoval, ji nemá, a u starších telefonů je to častější.

### --answer--
Vlastnost funguje jen v Chromu.

#### --why--
Pro Baseline musí vlastnost fungovat ve všech hlavních prohlížečích. Omezenou podporu ukazuje jiný stupeň.

### --see--
html-zaklady/mdn-a-dokumentace#baseline-a-tabulka-kompatibility

## --question--

Ve které části stránky prvku na MDN zjistíš, jestli smí prvek stát uvnitř odstavce `<p>`? Napiš anglický název části.

### --expected-- ignore-case
Technical summary

### --why--
Technical summary má řádek *Permitted parents* — ve kterých prvcích smí stát — a *Permitted content* — co smí obsahovat.

### --see--
html-zaklady/mdn-a-dokumentace#stranka-prvku-co-kde-je
