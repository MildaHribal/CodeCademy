# Klávesnice a fokus

Klávesnicí web ovládá člověk s třesem rukou, uživatel čtečky, programátor, který nechce sahat po myši, i každý, kdo vyplňuje dlouhý formulář. Na e-shopu, kde se nedá Tabem dojít k tlačítku „Objednat", ale nakoupí jen myší. Tahle lekce ukáže, podle čeho se klávesnice po stránce pohybuje a jak to rozbít nejde.

:::check pretest
Hlavička stránky má čtyři odkazy menu a za nimi v HTML formulář hledání. V CSS je hledání přesunuté vizuálně **před** menu (`order: -1`). Kam skočí první stisk Tabu?

### --answer--
Do hledání, protože je na obrazovce první.

#### --why--
Tak by to čekal každý, kdo se dívá na obrazovku. Klávesnice ale obrazovku nevidí.

### --correct--
Na první odkaz menu, protože je v HTML dřív.

#### --why--
Pořadí Tabu jde podle pořadí v DOM. CSS mění jen to, kde prvek vidíš.

### --answer--
Nikam, prohlížeč prvky s `order` přeskakuje.

#### --why--
`order` na fokus vliv nemá, prvek zůstává dosažitelný. Jen je jinde, než kde ho uživatel čeká.
:::

## Problém: kde teď jsem?

Klikni do náhledu a projdi ho Tabem a Shift+Tabem. Sleduj, jestli pořád víš, kde jsi:

:::live
```html
<nav class="menu">
  <a href="#kavy">Kávy</a>
  <a href="#kurzy">Kurzy</a>
  <a href="#kontakt">Kontakt</a>
</nav>
<form class="subscribe" onsubmit="event.preventDefault()">
  <label for="email">E-mail pro novinky</label>
  <input id="email" type="email">
  <div class="btn" onclick="this.textContent = 'Přihlášeno'">Odebírat</div>
</form>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
*:focus { outline: none; }

.menu { display: flex; gap: 1rem; margin-bottom: 1rem; }
.menu a { color: #7c2d12; }

.subscribe { display: grid; gap: 0.4rem; max-width: 18rem; }
input { font: inherit; padding: 0.4rem; border: 1px solid #a8a29e; border-radius: 0.4rem; }
.btn { padding: 0.5rem; border-radius: 0.4rem; background: #7c2d12; color: white; text-align: center; cursor: pointer; }
```
:::

Dvě chyby najednou. Pravidlo `*:focus { outline: none; }` smazalo obrys, takže po třetím Tabu netušíš, kde jsi. A „Odebírat" je `div`, na který se Tabem vůbec nedostaneš. Smaž řádek s `outline: none` a změň `div` na `<button type="button">` — obě chyby zmizí bez jediného řádku navíc.

**[[fokus|Fokus]]** (*focus*) je místo, kam právě míří klávesnice: prvek, do kterého se píše nebo který Enter zmáčkne. V každé chvíli ho má nejvýš jeden prvek na stránce a JavaScript ho najde v `document.activeElement`.

> [!REMEMBER]
> **Fokus jde jen po ovládacích prvcích, v pořadí, v jakém stojí v HTML, a uživatel musí pořád vidět, kde je.** Nativní odkazy, tlačítka a pole tohle umí sama — dokud to nerozbiješ.

:::check
Proč uživatel klávesnice v ukázce nedokázal odebírat novinky, i když myší to šlo?

### --answer--
Protože pole e-mailu nemělo `required`.

#### --why--
Povinnost pole ovlivní validaci, ne to, kam se dá dojít Tabem.

### --correct--
Protože „Odebírat" byl `div`, který nedostane fokus ani nereaguje na Enter.

#### --why--
`onclick` na `div` přidá jen reakci na kliknutí myší. Do pořadí Tabu se `div` nedostane.

### --answer--
Protože `outline: none` fokus vypnulo.

#### --why--
`outline: none` fokus nevypne, jen ho skryje. Klávesnice pořád funguje, uživatel jen nevidí, kde je.
:::

## Co dostane fokus a jak se ovládá

Do pořadí Tabu patří **interaktivní prvky**: `a` s `href`, `button`, `input`, `select`, `textarea`, `summary` a prvky s `tabindex="0"`. Vypnuté (`disabled`) a skryté prvky (`hidden`, `display: none`, `visibility: hidden`) fokus nedostanou.

| klávesa | co dělá |
|---|---|
| Tab / Shift+Tab | další / předchozí prvek |
| Enter | otevře odkaz, zmáčkne tlačítko, odešle formulář z pole |
| mezerník | zmáčkne tlačítko, zaškrtne pole; na stránce bez fokusu v poli posune stránku |
| šipky | uvnitř skupiny přepínačů (`radio`), v `select`, v posuvníku |
| Escape | zavře dialog nebo rozbalené menu |

Rozdíl mezi Enterem a mezerníkem je důležitý: **odkaz** otevře jen Enter, **tlačítko** zmáčkne Enter i mezerník. Uživatelé klávesnice to vědí a čekají to.

:::check
Uživatel klávesnice stojí fokusem na odkazu „Obchodní podmínky" a zmáčkne mezerník. Co se stane?

### --answer--
Odkaz se otevře, stejně jako Enterem.

#### --why--
Mezerník mačká tlačítka a zaškrtává pole. U odkazu nemá co zmáčknout.

### --correct--
Odkaz se neotevře; mezerník jen posune stránku dolů.

#### --why--
Odkaz se otevírá Enterem. Mezerník mimo pole a tlačítka posouvá stránku, jak je zvyk.

### --answer--
Fokus skočí na další prvek.

#### --why--
Na další prvek skáče Tab. Mezerník fokus neposouvá.
:::

## Pořadí fokusu je pořadí v HTML

Tab chodí po prvcích v tom pořadí, v jakém jsou v DOM. **CSS na tom nic nemění**: `order`, `flex-direction: row-reverse`, umístění v gridu ani `position: absolute`. Když se pořadí na obrazovce a v HTML rozejde, fokus skáče po stránce sem a tam a uživatel, který vidí, se ztratí.

:::live predict
```html
<div class="steps">
  <button type="button">1. Košík</button>
  <button type="button">2. Doprava</button>
  <button type="button">3. Platba</button>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.steps { display: flex; flex-direction: row-reverse; justify-content: flex-end; gap: 0.5rem; }
button { font: inherit; padding: 0.5rem 0.75rem; }
```
--question-- Tlačítka jsou na obrazovce v pořadí 3, 2, 1. Na které tlačítko skočí první Tab?
--option-- Na „3. Platba", protože je na obrazovce vlevo.
--option*-- Na „1. Košík", protože je v HTML první.
--option-- Na žádné, `row-reverse` prvky z pořadí Tabu vyřadí.
--why-- Pořadí fokusu se řídí DOM. `row-reverse` otočí jen vykreslení, takže fokus jde zprava doleva, proti směru čtení. Oprava je přeskládat HTML, ne CSS. Klikni do náhledu, zkus Tab a pak `flex-direction` smaž.
--see-- html-pristupnost/klavesnice-a-fokus#poradi-fokusu-je-poradi-v-html
:::

:::check
Designér chce na mobilu zobrazit tlačítko „Objednat" nad popisem produktu, na počítači pod ním. Jak to udělat, aby pořadí fokusu odpovídalo obrazovce?

### --answer--
Nechat HTML beze změny a na mobilu dát tlačítku `order: -1`.

#### --why--
Na mobilu by pak fokus šel nejdřív na odkazy v popisu a až potom na tlačítko nad nimi — proti tomu, co uživatel vidí.

### --correct--
Uspořádat HTML podle nejčastějšího rozvržení a vizuální přesun omezit tam, kde nemění pořadí interaktivních prvků, nebo zvážit, jestli rozdílné pořadí vůbec potřebuješ.

#### --why--
Pořadí v HTML je pořadí pro klávesnici i čtečku. CSS přesuny jsou v pořádku, když mezi prohozenými prvky nic nefokusovatelného nesedí nebo když pořadí zůstává logické.

### --answer--
Dát tlačítku `tabindex="1"`, aby bylo vždy první.

#### --why--
Kladný `tabindex` ho vytáhne na začátek celé stránky, před menu i hledání. To pořadí rozbije ještě víc.
:::

## `tabindex`: 0, −1 a proč ne kladné

Atribut `tabindex` mění, jestli a kdy prvek dostane fokus:

| hodnota | Tab na prvek dojde? | `element.focus()` z JavaScriptu | kdy |
|---|---|---|---|
| bez atributu | jen u interaktivních prvků | jen u interaktivních prvků | skoro vždy |
| `tabindex="0"` | ano, v pořadí DOM | ano | vlastní ovládací prvek, který nejde postavit z HTML (vzácné) |
| `tabindex="-1"` | ne | ano | cíl, na který fokus posílá skript: nadpis dialogu, hlavní obsah po odkazu „Přeskočit" |
| `tabindex="1"` a víc | ano, **před všemi ostatními** | ano | nikdy |

Kladné hodnoty vytvoří vlastní pořadí, které platí před zbytkem stránky. Prvek s `tabindex="1"` v patičce dostane fokus jako první, před menu i hlavičkou, a každý nový prvek na stránce musíš do toho pořadí ručně zařadit.

:::live predict
```html
<header class="bar">
  <a href="#kavy">Kávy</a>
  <a href="#kurzy">Kurzy</a>
</header>
<footer class="bar">
  <a href="#kontakt" tabindex="2">Kontakt</a>
  <a href="#reklamace" tabindex="1">Reklamace</a>
</footer>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.bar { display: flex; gap: 1rem; padding: 0.5rem 0; }
footer { border-top: 1px solid #e7e5e4; margin-top: 2rem; }
```
--question-- V jakém pořadí projde klávesnice odkazy?
--option-- Kávy, Kurzy, Kontakt, Reklamace — v pořadí HTML.
--option-- Kávy, Kurzy, Reklamace, Kontakt — `tabindex` přehodí jen odkazy v patičce.
--option*-- Reklamace, Kontakt, Kávy, Kurzy — kladné `tabindex` jdou před vším ostatním.
--why-- Prvky s kladným `tabindex` jdou vzestupně před všemi prvky s `tabindex` 0 nebo bez něj. Patička tak předběhne celou stránku. Smaž oba atributy a zkus Tab znovu.
--see-- html-pristupnost/klavesnice-a-fokus#tabindex-0-1-a-proc-ne-kladne
:::

:::check
Po otevření dialogu chce skript přesunout fokus na jeho nadpis `h2`, ale nadpis nemá být zastávkou Tabu. Jakou hodnotu `tabindex` mu dáš? Napiš jen číslo.

### --expected--
-1

### --why--
`tabindex="-1"` dovolí `focus()` ze skriptu, ale prvek do pořadí Tabu nepřidá. S `0` by se na nadpis dalo dojít Tabem, a to u textu nemá smysl.
:::

## `button`, `a`, nebo klikací `div`

Většina chyb klávesnice vznikne tak, že někdo vybere špatný prvek. Rozhodnutí je jednoduché:

- **Vede to jinam** (jiná stránka, kotva na stránce, soubor ke stažení)? → `<a href="…">`. Otevře se Enterem, jde otevřít v nové kartě a čtečka řekne „odkaz".
- **Něco to udělá tady** (přidá do košíku, otevře menu, odešle formulář)? → `<button>`. Zmáčkne se Enterem i mezerníkem a čtečka řekne „tlačítko". Mimo formulář mu dej `type="button"`, jinak je to odesílací tlačítko.
- **`div` nebo `span` s `onclick`** → nikdy. Aby se vyrovnal tlačítku, potřeboval by `tabindex="0"`, `role="button"`, obsluhu Enteru i mezerníku a styl fokusu. To je pět věcí, které `button` umí zadarmo, a na některou se vždycky zapomene.

Tlačítko se dá nastylovat stejně jako `div`: `font: inherit`, vlastní `background`, `border: 0`. Že „tlačítka se špatně stylují", neplatí od doby, kdy prohlížeče podporují `appearance: none`.

:::check
„Zobrazit další recenze" načte na stránce dalších deset recenzí, adresa se nemění. Který prvek použiješ? Napiš jen název značky.

### --expected-- ignore-case
button

### --accept--
<button>
<button type="button">

### --why--
Akce na současné stránce je tlačítko. Odkaz by sliboval, že vede jinam, a uživatel by ho zkoušel otevřít v nové kartě.
:::

## Odkaz „Přeskočit na obsah"

Uživatel klávesnice by musel na každé stránce projít celou hlavičku a menu, než se dostane k obsahu. Proto první prvek stránky bývá **[[odkaz Přeskočit na obsah|odkaz „Přeskočit na obsah"]]** (*skip link*): skrytý, dokud nedostane fokus, a vedoucí na kotvu hlavního obsahu.

:::live
```html
<a class="skip-link" href="#main">Přeskočit na obsah</a>
<header class="site">
  <strong>Pražírna Zrnko</strong>
  <nav class="menu">
    <a href="#kavy">Kávy</a>
    <a href="#kurzy">Kurzy</a>
    <a href="#prislusenstvi">Příslušenství</a>
    <a href="#kontakt">Kontakt</a>
  </nav>
</header>
<main id="main" tabindex="-1">
  <h1>Čerstvě pražená káva</h1>
  <p>Pražíme každé úterý a čtvrtek, posíláme do dvou dnů. <a href="#kavy">Vybrat kávu</a></p>
</main>
```
```css
body { font-family: system-ui, sans-serif; margin: 0; }
.site { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #fef3c7; }
.menu { display: flex; gap: 1rem; }
main { padding: 1rem; }

.skip-link {
  position: absolute;
  left: 1rem;
  top: -3rem;
  padding: 0.5rem 1rem;
  background: #7c2d12;
  color: white;
  border-radius: 0 0 0.5rem 0.5rem;
  transition: top 150ms ease;
}

.skip-link:focus { top: 0; }
```
:::

Klikni do náhledu nad hlavičku a zmáčkni Tab: vysune se odkaz. Enter tě pošle do `main` a další Tab jde rovnou na „Vybrat kávu". Tři podrobnosti, na kterých to stojí:

- odkaz je **první** prvek v `body`, jinak se na něj Tabem nedostaneš jako první,
- skrývá se posunem mimo obrazovku, ne `display: none` — skrytý prvek by fokus nedostal,
- `main` má `id`, na které odkaz míří. `tabindex="-1"` pomůže, aby se fokus přesunul i ve starších prohlížečích; nejde na něj Tabem.

Vysouvání obstarává `transition`, kterou znáš ze základů CSS.

:::check
Kolega skryl odkaz „Přeskočit na obsah" pravidlem `.skip-link { display: none; }` a zobrazuje ho v `.skip-link:focus { display: block; }`. Proč se odkaz nikdy neukáže?

### --answer--
Protože `:focus` na odkazy nefunguje, jen na pole.

#### --why--
`:focus` platí pro každý prvek, který fokus dostane, odkaz mezi ně patří.

### --correct--
Protože prvek s `display: none` fokus nedostane, takže `:focus` nikdy nenastane.

#### --why--
Skryté prvky vypadnou z pořadí Tabu. Proto se odkaz skrývá posunem mimo obrazovku a na fokus se vrátí.

### --answer--
Protože `display: block` na odkaz nejde nastavit.

#### --why--
Jde. Problém je o krok dřív: pravidlo s `:focus` se nikdy nepoužije.
:::

## Viditelný fokus

Ze základů CSS víš, že obrys pro klávesnici patří do [`:focus-visible`](see:css-zaklady/selektory-zaklad#pseudotridy-stav-prvku): ukáže se při ovládání klávesnicí, ale ne po kliknutí myší na tlačítko. Pro přístupnost z toho plynou tři pravidla:

- **Nikdy nemaž obrys bez náhrady.** `outline: none` bez vlastního stylu fokusu porušuje WCAG (fokus musí být vidět).
- **Obrys musí jít vidět.** Tenká světlá čára na světlém pozadí nestačí; vlastní styl má mít kontrast aspoň 3 : 1 s okolím. Osvědčí se `outline: 3px solid` v barvě akcentu a `outline-offset: 2px`.
- **Nic ho nesmí zakrýt.** Přilepená hlavička (`position: sticky`) může fokusovaný prvek schovat, když Tab posune stránku. WCAG 2.2 to zakazuje. Pomůže `scroll-padding-top` na `html` s výškou hlavičky.

:::compare
```html
<nav class="menu">
  <a href="#kavy">Kávy</a>
  <a href="#kurzy" class="is-focused">Kurzy</a>
  <a href="#kontakt">Kontakt</a>
</nav>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; background: #fffbf5; }
.menu { display: flex; gap: 1.25rem; }
.menu a { color: #7c2d12; padding: 0.25rem; border-radius: 0.25rem; }
```
--variant-- světlý obrys 1px
```css
.menu .is-focused { outline: 1px dotted #fde68a; }
```
--variant-- výrazný obrys s odsazením
```css
.menu .is-focused { outline: 3px solid #7c2d12; outline-offset: 2px; }
```
:::

Obě varianty ukazují odkaz „Kurzy" jako fokusovaný. První obrys na krémovém pozadí prakticky nevidíš.

:::check
Proč `outline: none` na `:focus` není jen kosmetická změna?

### --answer--
Protože bez obrysu přestane Tab na stránce fungovat.

#### --why--
Tab funguje dál a fokus se posouvá. Jen ho nikdo nevidí.

### --correct--
Protože uživatel klávesnice pak nevidí, kde fokus je, a stránku nedokáže ovládat.

#### --why--
Viditelný fokus je pro klávesnici to, co kurzor pro myš. Bez něj uživatel mačká Enter naslepo.

### --answer--
Protože čtečka obrazovky čte jen prvky s obrysem.

#### --why--
Čtečka obrys nepotřebuje, fokus sleduje přes strom přístupnosti. Obrys chybí lidem, kteří na obrazovku vidí.
:::

:::explain
Vysvětli vlastními slovy, proč `<div onclick="...">` vypadá jako tlačítko, ale pro
ovládání klávesnicí jím není.

## --model--
`<div>` je obecný obal bez významu. Prohlížeč o něm neví, že se s ním dá něco dělat,
takže ho nezařadí do pořadí fokusu, nereaguje na Enter ani na mezerník a čtečka
obrazovky ho neohlásí jako ovládací prvek. Kliknutí myší funguje jen proto, že se na
něm poslouchá událost. Nativní `<button>` naproti tomu dostane fokus, reaguje na
klávesy, ohlásí svou roli i stav a přijde se správným stylem viditelného fokusu.
Napodobit to ručně jde (`tabindex`, `role`, obsluha kláves), ale je to několik řádků
navíc, na které se snadno zapomene — proto se začíná správnou značkou.

## --checklist--
- Obecný obal není pro prohlížeč ovládací prvek.
- Nedostane fokus a nereaguje na klávesy.
- Čtečka obrazovky mu neohlásí roli.
- Nativní prvek tohle všechno umí sám.
:::

## Typické chyby a pasti

> [!PITFALL] Pořadí na obrazovce a v HTML se rozchází
> *Příznak:* Tab skáče po stránce: z hlavičky do patičky a zpátky, v gridu napříč sloupci.
>
> *Oprava:* uspořádej HTML v pořadí čtení a CSS pořadí interaktivních prvků neotáčej. Kladné `tabindex` smaž.

> [!PITFALL] Fokus ztracený po smazání prvku
> *Příznak:* uživatel smaže položku z košíku tlačítkem „Odebrat", tlačítko zmizí a další Tab začne od začátku stránky.
>
> *Oprava:* před odebráním prvku, který má fokus, pošli fokus jinam — na další položku nebo nadpis košíku (s `tabindex="-1"`). Jak přesouvat fokus z JavaScriptu, ukáže sekce o DOM.

> [!PITFALL] Klikací karta jako `div`
> *Příznak:* celá karta produktu reaguje na kliknutí, ale z klávesnice na ni nejde dojít a čtečka přečte jen text.
>
> *Oprava:* uvnitř karty je skutečný odkaz s názvem produktu. Zvětšit klikací plochu na celou kartu jde v CSS pseudoprvkem odkazu, ne `onclick` na obalu.

> [!PITFALL] Past na klávesnici
> *Příznak:* uživatel otevře okno s mapou nebo vložené video, Tab uvnitř krouží a Escape ani Shift+Tab ho nepustí ven.
>
> *Oprava:* každá komponenta musí jít opustit klávesnicí. Když fokus záměrně držíš v dialogu, Escape ho musí zavřít.

:::check
Karta produktu je `<div class="card" onclick="location.href='/kavy/etiopie'">` a uvnitř je jen nadpis, obrázek a cena. Jaká je nejmenší oprava pro klávesnici?

### --answer--
Přidat kartě `tabindex="0"`.

#### --why--
Karta pak dostane fokus, ale Enter ji neotevře a čtečka neřekne, že je to odkaz, ani kam vede.

### --correct--
Z nadpisu udělat odkaz `<a href="/kavy/etiopie">` a `onclick` na kartě nepotřebovat.

#### --why--
Odkaz umí fokus, Enter, otevření v nové kartě i roli „odkaz" se jménem produktu. Plochu klikání zvětšíš v CSS.

### --answer--
Přidat kartě `role="link"`.

#### --why--
Role změní jen hlášení čtečky. Fokus ani Enter nepřidá.
:::

## Kde to najdeš v MDN

- [Keyboard-navigable JavaScript widgets](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets) — `tabindex` 0 a −1 a kdy vlastní ovládací prvek potřebuje obsluhu kláves.
- [tabindex](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex) — přesné chování hodnot a varování před kladnými čísly.
- [:focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible) — kdy prohlížeč obrys fokusu ukáže.
- [Skip navigation link](https://developer.mozilla.org/en-US/docs/Glossary/Skip_link) — proč a jak odkaz „Přeskočit na obsah" dělat.

# --questions--

## --question--

Formulář má pole Jméno, E-mail a tlačítko Odeslat. Pole E-mail má `tabindex="1"`, ostatní nic. Kam skočí fokus po prvním Tabu na stránce, která má před formulářem ještě menu se třemi odkazy?

### --answer--

Na první odkaz menu.

#### --why--
Myslíš si, že `tabindex` jen přehazuje prvky uvnitř formuláře? Kladná hodnota posune prvek před celou stránku.

### --correct--

Do pole E-mail.

#### --why--
Prvky s kladným `tabindex` dostanou fokus před všemi ostatními, takže E-mail předběhne i menu. Po něm jde Tab na první odkaz menu.

### --answer--

Do pole Jméno, protože je ve formuláři první.

#### --why--
Myslíš si, že pořadí DOM vyhraje? S kladným `tabindex` už ne.

### --see--

html-pristupnost/klavesnice-a-fokus#tabindex-0-1-a-proc-ne-kladne

## --question--

Tlačítko „Přidat do košíku" má `disabled`, dokud si uživatel nevybere velikost balení. Dostane se na něj uživatel klávesnice Tabem? Odpověz ano, nebo ne.

### --expected-- ignore-case

ne

### --why--

Vypnuté prvky z pořadí Tabu vypadnou a čtečka je najde jen při čtení celé stránky. Proto je dobré vedle tlačítka napsat, proč je vypnuté („Nejdřív vyber velikost balení").

### --see--

html-pristupnost/klavesnice-a-fokus#co-dostane-fokus-a-jak-se-ovlada

## --question--

Na jakou hodnotu atributu `href` míří odkaz „Přeskočit na obsah", když hlavní obsah je `<main id="obsah">`? Napiš celou hodnotu.

### --expected--

#obsah

### --why--

Kotva na stejné stránce se píše jako `#` a `id` cíle. Prohlížeč po Enteru posune stránku k `main` a další Tab pokračuje od něj.

### --see--

html-pristupnost/klavesnice-a-fokus#odkaz-preskocit-na-obsah
