# Kdo používá web jinak

E-shop, přihlášení do banky, objednávka k lékaři, formulář na úřadě — tyhle stránky používají i lidé, kteří nevidí, neovládají myš nebo mají stránku zvětšenou na 400 %. Když je nepustíš dál, ztratí je klient a ty zakázku. Od června 2025 to u většiny e-shopů v EU navíc hlídá zákon.

Než začneš číst, tipni si dvě odpovědi. Nikdo je nehodnotí.

:::check pretest
Organizace WebAIM každý rok automaticky prověří milion nejnavštěvovanějších webů. Kolik jejich domovských stránek mělo v roce 2026 aspoň jednu chybu přístupnosti, kterou jde najít strojem?

### --answer--
Asi pětina.

#### --why--
Tolik by to bylo, kdyby přístupnost byla okrajový problém. Skutečné číslo je výrazně vyšší, uvidíš ho v části o nejčastějších chybách.

### --answer--
Asi polovina.

#### --why--
Polovinu stránek trápí jen jediná z chyb, třeba chybějící popisky polí formuláře. Stránek s aspoň jednou chybou je víc.

### --correct--
Skoro všechny, přes 95 %.

#### --why--
95,9 % domovských stránek mělo aspoň jednu automaticky zjistitelnou chybu, v průměru 56 na stránku. A stroj přitom najde jen část problémů.
:::

:::check pretest
Nevidomý člověk hledá na dlouhé stránce informaci se čtečkou obrazovky. Jak to podle průzkumu mezi uživateli čteček dělá nejčastěji?

### --answer--
Nechá si přečíst celou stránku odshora dolů.

#### --why--
To by u dlouhé stránky trvalo minuty. Uživatelé čteček čtou stránky podobně jako ty očima: přeskakují.

### --correct--
Přeskakuje po nadpisech.

#### --why--
Pohyb po nadpisech uvedlo jako hlavní způsob 71,6 % dotázaných. Proto záleží na tom, jestli nadpisy na stránce vůbec jsou a jestli jsou to skutečné nadpisy.

### --answer--
Použije vyhledávání Ctrl+F.

#### --why--
Hledání textu používají taky, ale jen menšina jako hlavní způsob. Nejčastější metoda souvisí se strukturou stránky.
:::

## Problém: stránka, která funguje jen myší a očima

Tady je karta knihy z e-shopu. Na pohled je v pořádku. Klikni do náhledu a pak několikrát zmáčkni klávesu **Tab**, jako by sis myš odložil:

:::live
```html
<article class="book">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect width='120' height='160' fill='%230f766e'/%3E%3C/svg%3E" width="120" height="160">
  <h3>Babička</h3>
  <p class="book__price">289 Kč</p>
  <input placeholder="Počet kusů">
  <div class="book__buy" onclick="this.textContent = 'V košíku'">Do košíku</div>
  <a href="#">Více</a>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.book {
  display: grid;
  gap: 0.5rem;
  max-width: 14rem;
  padding: 1rem;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
}

.book h3 { margin: 0; }
.book__price { margin: 0; color: #a8a29e; font-weight: 700; }

.book__buy {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: #0f766e;
  color: white;
  text-align: center;
  cursor: pointer;
}
```
:::

Tab tě posadí do pole a na odkaz „Více", ale tlačítko „Do košíku" přeskočí. Je to totiž `div`, ne tlačítko, a bez myši ho neotevřeš. To není jediný problém karty: obrázek nemá `alt`, takže čtečka ohlásí jen „obrázek" nebo název souboru; pole ztratí svůj popisek, jakmile do něj začneš psát; odkaz „Více" mimo kartu nic neříká; šedá cena je na bílém podkladu špatně čitelná.

Nic z toho se neopravuje speciální knihovnou. Opravuje se to **správným HTML**: `button` místo `div`, `alt` u obrázku, `label` u pole, text odkazu, který dává smysl sám o sobě, a dost tmavá barva.

> [!REMEMBER]
> **Přístupný web jde používat bez myši, bez obrazu a bez dokonalého zraku, sluchu i soustředění — a skoro vždycky to zařídí správné HTML, ne kód navíc.**

:::check
Proč Tab přeskočil „Do košíku", ale na odkaz „Více" se dostal?

### --answer--
Protože `div` je až za polem a Tab chodí jen po prvních prvcích stránky.

#### --why--
Tab prochází celou stránku, ne jen začátek. Rozhoduje, **jaký** prvek to je, ne kde leží.

### --correct--
Protože odkaz je interaktivní prvek, na který se dá dostat klávesnicí, a obyčejný `div` není, ani když na něj připíšeš `onclick`.

#### --why--
Prohlížeč posílá klávesnici jen na prvky, které interaktivní jsou: odkazy, tlačítka, pole formulářů. `onclick` na `div` přidá jen reakci na myš.

### --answer--
Protože `div` má `cursor: pointer`, a ten fokus klávesnice vypíná.

#### --why--
`cursor` mění jen vzhled kurzoru myši. Klávesnice o něm neví.
:::

## Kdo web používá jinak

Nejde jen o lidi s trvalým postižením. Stejnou překážku potká člověk s dočasným omezením i každý v nepříznivé situaci:

| omezení | trvalé | dočasné | situační |
|---|---|---|---|
| zrak | nevidomý, slabozraký | po operaci očí | slunce na displeji |
| pohyb | třes, ochrnutí | zlomená ruka | v jedné ruce dítě |
| sluch | neslyšící | zánět ucha | hlučný vlak, video bez zvuku |
| pozornost | ADHD, dyslexie | únava, léky | stres, spěch |

A čím web ovládají:

- **Čtečka obrazovky** (*screen reader*) čte stránku nahlas nebo na hmatový braillský řádek. Nejpoužívanější jsou JAWS a NVDA na Windows, VoiceOver v macOS a iOS, TalkBack v Androidu a Orca v Linuxu.
- **Klávesnice** místo myši: Tab, Shift+Tab, Enter, mezerník, šipky. Používají ji i lidé s třesem rukou a lidé ovládající počítač jedním tlačítkem (*switch*).
- **Zvětšení**: zoom prohlížeče na 200–400 %, lupa systému, větší písmo.
- **Hlasové ovládání**: uživatel řekne „klikni na Do košíku" a funguje to, jen když se prvek doopravdy jmenuje „Do košíku".
- **Úpravy vzhledu**: tmavý režim, vynucené barvy s vysokým kontrastem, omezené animace.

:::check
Uživatel hlasového ovládání říká „klikni na Odeslat", ale nic se nestane. Tlačítko má na obrazovce text „Odeslat". Co je nejpravděpodobnější příčina?

### --answer--
Hlasové ovládání umí klikat jen na odkazy.

#### --why--
Hlasové ovládání umí mačkat tlačítka, zaškrtávat pole i psát do nich. Problém je v tom, jak se prvek jmenuje pro software.

### --correct--
Prvek se pro software jmenuje jinak, než kolik je vidět na obrazovce, nebo to vůbec není tlačítko.

#### --why--
Hlasové ovládání hledá prvek podle jeho jména, které vypočítá prohlížeč. Když je „Odeslat" jen nakreslené v obrázku, nebo když má tlačítko skryté jiné jméno, příkaz netrefí. Jak prohlížeč jméno počítá, ukáže další lekce.

### --answer--
Uživatel musí nejdřív zmáčknout Tab.

#### --why--
Hlasové ovládání klávesnici nepotřebuje, to je jeho smysl.
:::

## Vyzkoušej si to sám

Přístupnost nejlíp pochopíš, když si stránku projdeš sám. Stačí čtyři zkoušky a dají se udělat za pět minut:

1. **Klávesnice.** Odlož myš a projdi stránku Tabem. Vidíš pořád, kde jsi? Dostaneš se na každé tlačítko a odkaz a zmáčkneš ho Enterem nebo mezerníkem? Nezasekneš se někde?
2. **Zvětšení.** Nastav zoom prohlížeče (Ctrl a +) na 200 % a pak na 400 %. Text se nesmí překrývat a stránka se nemá dát posouvat do strany. 400 % na monitoru 1280 px odpovídá oknu širokému 320 px.
3. **Čtečka.** Zapni ji a poslouchej, co o stránce řekne. V macOS VoiceOver přes Cmd+F5, ve Windows si zdarma nainstaluj NVDA, v Linuxu je Orca (Super+Alt+S v GNOME). Nadpisy procházej klávesou H (v NVDA) a odkazy Tabem.
4. **Kontrast.** V DevTools vyber prvek s textem, v panelu Styles klikni na čtvereček barvy a podívej se na řádek Contrast ratio.

> [!TIP]
> Čtečka napoprvé mluví rychle a hodně. Začni na stránce, kterou znáš, a zpomal řeč v nastavení. Po pár minutách uslyšíš, jak se liší stránka se strukturou od stránky, která je jen „text, text, odkaz, obrázek".

Než otevřeš náhled, tipni si, co uvidí a udělá klávesnice:

:::live predict
```html
<nav class="toolbar">
  <a href="#">Novinky</a>
  <span class="toolbar__link" onclick="this.textContent = 'Otevřeno'">Akce</span>
  <button type="button">Přihlásit</button>
</nav>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.toolbar { display: flex; gap: 1rem; align-items: center; }
.toolbar a, .toolbar__link { color: #0f766e; text-decoration: underline; cursor: pointer; }
.toolbar button { font: inherit; }
```
--question-- Po kterých položkách lišty se posuneš klávesou Tab?
--option-- Po všech třech, protože všechny vypadají jako odkazy nebo tlačítka.
--option*-- Po „Novinky" a „Přihlásit"; „Akce" Tab přeskočí.
--option-- Jen po „Novinky", protože tlačítka se ovládají myší.
--why-- Klávesnice jde jen po skutečně interaktivních prvcích. `<a href>` a `<button>` mezi ně patří, `<span>` s `onclick` ne, i když je podtržený a má ruku jako kurzor. Klikni do náhledu a zkus Tab: „Akce" se nikdy neorámuje. Změň `span` na `button type="button"` a zkus to znovu.
--see-- html-pristupnost/proc-pristupnost#vyzkousej-si-to-sam
:::

:::check
Na stránce nastavíš zoom na 400 % a objeví se vodorovný posuvník, takže text musíš číst posouváním doleva a doprava. Jakou šířku okna tím zhruba simuluješ, když má monitor 1280 px?

### --expected--
320

### --accept--
320 px
320px

### --why--
1280 px ÷ 4 = 320 CSS pixelů. Tak úzké okno má mobil i člověk se silným zvětšením, a stránka se na něm nemá posouvat do strany.
:::

## Jak čtečka stránku čte

Uživatel čtečky nevidí rozvržení, ale nemusí poslouchat stránku odshora dolů. Čtečka mu z HTML sestaví přehledy a on mezi nimi skáče:

- **Nadpisy** (v NVDA klávesa H, číslice 1–6 pro úroveň): osnova stránky. Proto `h1`–`h6` nesmí přeskakovat úrovně a velký tučný `div` nadpis není.
- **Oblasti stránky** neboli landmarky (*landmarks*): `header`, `nav`, `main`, `footer`. Uživatel skočí rovnou na hlavní obsah nebo do navigace.
- **Seznam odkazů** (v NVDA Insert+F7, ve VoiceOveru rotor): všechny odkazy pod sebou **bez okolního textu**. Tři odkazy „Více" tam zní jako „Více, Více, Více".
- **Tabulátor**: jen prvky, které jde ovládat, a u každého jeho druh a jméno.

Zhruba takhle čtečka ohlásí běžné prvky (přesné znění se liší podle čtečky a jazyka):

| HTML | co uslyšíš |
|---|---|
| `<h2>Novinky</h2>` | „Novinky, nadpis, úroveň 2" |
| `<nav>` se seznamem čtyř odkazů | „navigace, seznam, 4 položky" |
| `<a href="/kosik">Košík</a>` | „odkaz, Košík" |
| `<button>Do košíku</button>` | „Do košíku, tlačítko" |
| `<div class="btn">Do košíku</div>` | „Do košíku" — jako obyčejný text |
| `<img alt="">` | nic, obrázek přeskočí |
| `<img>` bez `alt` | „obrázek" nebo název souboru |

> [!REMEMBER]
> **Čtečka neslyší, jak prvek vypadá, ale čím je.** Druh prvku, jeho jméno a místo v osnově bere z HTML, CSS na tom nic nezmění.

:::check
Uživatel čtečky si otevře seznam odkazů na stránce e-shopu a uslyší: „Více, Více, Více, Košík". Co je špatně?

### --answer--
Nic, uživatel si může každý odkaz „Více" otevřít a zjistit, kam vede.

#### --why--
Může, ale musí zkoušet naslepo jeden po druhém. Seznam odkazů je tu právě proto, aby zkoušet nemusel.

### --correct--
Texty odkazů nedávají smysl bez okolního textu, protože seznam odkazů okolní text nečte.

#### --why--
V seznamu odkazů jsou jen jejich texty. „Více o knize Babička" dává smysl i samo o sobě, „Více" ne.

### --answer--
Odkazy by měly být tlačítka, protože tlačítka čtečka čte lépe.

#### --why--
Odkaz a tlačítko se liší tím, co dělají (odkaz vede jinam, tlačítko spouští akci), ne tím, jak dobře se čtou. Problém je v textu.
:::

## Šest nejčastějších chyb

Automatická kontrola milionu webů (WebAIM Million, únor 2026) našla u 95,9 % domovských stránek aspoň jednu chybu. Šest druhů chyb tvoří 96 % všech nálezů:

| chyba | stránek | koho to potká | oprava |
|---|---|---|---|
| nízký kontrast textu | 83,9 % | slabozrací, starší lidé, slunce na displeji | tmavší barva, kontrast aspoň 4,5 : 1 |
| obrázek bez alternativního textu | 53,1 % | uživatelé čteček | `alt` s popisem, u ozdoby `alt=""` |
| pole formuláře bez popisku | 51 % | čtečky, hlasové ovládání | `<label>` spojený s polem |
| prázdný odkaz | 46,3 % | čtečky, hlasové ovládání | text odkazu nebo `alt` u obrázku v odkazu |
| prázdné tlačítko | 30,6 % | čtečky, hlasové ovládání | text tlačítka, u ikony skryté jméno |
| chybějící jazyk dokumentu | 13,5 % | čtečky | `<html lang="cs">` |

**Kontrast** je poměr jasu textu a pozadí, od 1 : 1 (bílá na bílé) po 21 : 1 (černá na bílé). Běžný text potřebuje aspoň 4,5 : 1, velký text (od 24 px, nebo od 18,5 px tučně) aspoň 3 : 1. Porovnej tutéž cenu ve dvou odstínech šedé:

:::compare
```html
<p class="price">289 Kč <small>vč. DPH, doprava od 79 Kč</small></p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; background: #fffbf5; }
.price { font-size: 1rem; }
```
--variant-- #a8a29e (kontrast 2,45 : 1)
```css
.price { color: #a8a29e; }
```
--variant-- #57534e (kontrast 7,4 : 1)
```css
.price { color: #57534e; }
```
:::

Obě varianty jsou „šedá", ale první na krémovém pozadí neprojde. Hranice leží mezi nimi: `#78716c` vyjde 4,65 : 1, tedy těsně nad ní. Zkus ve společném HTML zvětšit `<small>` na celou větu a sleduj, jak rychle se světlý text čte hůř.

S kontrastem souvisí ještě jedno pravidlo: **barva nesmí být jediný nositel informace.** Zelená a červená tečka „skladem / vyprodáno" nic neřekne čtečce, člověku s poruchou barvocitu ani na černobílé tiskárně. K barvě patří text nebo tvar.

Chybějící jazyk vypadá jako drobnost, ale čtečka podle `lang` volí hlas. Česká stránka bez `lang` přečtená anglickým hlasem zní jako neznámý jazyk.

### Jaký alt napsat

`alt` není popis obrázku pro archiváře. Je to **text, který obrázek nahradí**, když ho nevidíš. Rozhodni se podle toho, co obrázek na stránce dělá:

- **Nese informaci** (fotka produktu, graf, banner s textem): napiš, co z něj má uživatel vědět. U banneru s nápisem „Detektivky −20 %" je `alt` právě ten nápis.
- **Jen zdobí nebo opakuje text vedle** (ornament, ilustrace, obálka knihy hned vedle jejího názvu): `alt=""`. Čtečka ho přeskočí a neřekne dvakrát totéž.
- **Je jediným obsahem odkazu nebo tlačítka** (logo v odkazu na úvod, ikona košíku): `alt` popíše, **kam odkaz vede nebo co tlačítko udělá**, ne jak ikona vypadá.

Nikdy nevynechávej atribut úplně a nepiš „obrázek" ani „foto" — čtečka ohlásí, že jde o obrázek, sama.

:::check
Na stránce je tenký ornament mezi dvěma odstavci, vložený jako `<img>`. Jak má vypadat jeho atribut `alt`? Napiš celý atribut.

### --expected--
alt=""

### --accept--
alt=''

### --why--
Prázdný `alt` říká „tenhle obrázek nic nesděluje" a čtečka ho přeskočí. Bez atributu `alt` by ohlásila „obrázek" nebo přečetla název souboru.
:::

## WCAG 2.2 ve zkratce

Co je „přístupné", popisují pravidla **WCAG** (*Web Content Accessibility Guidelines*) organizace W3C. Aktuální verze 2.2 je od roku 2023 doporučením W3C a od října 2025 i mezinárodní normou ISO/IEC 40500:2025.

WCAG stojí na čtyřech principech, zkratka **POUR**:

- **Vnímatelný** (*Perceivable*): obsah jde vnímat i jinak než jedním smyslem — `alt`, titulky, kontrast.
- **Ovladatelný** (*Operable*): jde ovládat klávesnicí, uživatel má dost času, nic nebliká.
- **Srozumitelný** (*Understandable*): jazyk stránky, předvídatelné chování, pomoc s chybami ve formuláři.
- **Robustní** (*Robust*): kód, kterému rozumí prohlížeč i asistenční technologie — správné prvky a atributy.

Každé pravidlo (*success criterion*) má úroveň **A** (základ), **AA** nebo **AAA** (nejpřísnější). Zákony i zakázky chtějí prakticky vždy **A a AA**. Verze 2.2 přidala do úrovní A a AA šest pravidel: klikací cíl aspoň 24 × 24 px, fokus nesmí zakrýt třeba přilepená hlavička, přetahování musí mít alternativu, přihlášení bez opisování a pamatování hádanek, žádné opakované vyplňování údajů a nápověda na stejném místě.

> [!NOTE]
> V EU platí od 28. června 2025 **European Accessibility Act**, v Česku zákon č. 424/2023 Sb.: e-shopy a další služby pro spotřebitele musí být přístupné, výjimku mají jen mikropodniky (do 10 zaměstnanců a obratu 2 milionů eur). Evropská norma, podle které se to posuzuje, dnes odkazuje na WCAG 2.1 AA a nová verze přechází na 2.2. Weby veřejné správy řeší už od roku 2019 zákon č. 99/2019 Sb.

:::check
Klient chce web, který „splní přístupnost podle WCAG". Na jakou úroveň se v praxi míří? Napiš ji.

### --expected-- ignore-case
AA

### --accept--
A a AA
A + AA
WCAG 2.2 AA

### --why--
Úroveň AA (včetně všech pravidel úrovně A) chtějí zákony, normy i běžné zakázky. AAA se jako celek nevyžaduje, některá její pravidla nejdou splnit u každého obsahu.
:::

## Typické chyby a pasti

> [!PITFALL] „Lighthouse dal 100 bodů, takže je to přístupné"
> *Příznak:* automatický audit v DevTools nehlásí nic, ale uživatel čtečky se na stránce ztratí.
>
> *Oprava:* nástroje jako Lighthouse nebo axe najdou jen to, co jde změřit: chybí `alt`, nízký kontrast. Nepoznají, jestli `alt="obrázek"` něco říká nebo jestli pořadí fokusu dává smysl. Automat ber jako první síto, pak projdi stránku klávesnicí a čtečkou.

> [!PITFALL] Placeholder místo popisku
> *Příznak:* pole má jen `placeholder="E-mail"`. Po prvním písmenu nápověda zmizí, uživatel neví, co vyplňuje, a světle šedý text má skoro vždy nízký kontrast.
>
> *Oprava:* viditelný `<label>`. Placeholder smí nanejvýš ukázat příklad formátu.

> [!PITFALL] Přístupnostní lišta nebo „overlay" jako řešení
> *Příznak:* web si koupí skript s ikonou panáčka, který slibuje přístupnost jedním řádkem, a uživatelé čteček si stěžují dál.
>
> *Oprava:* skript nepřidá tlačítkům, která jsou `div`, ovládání klávesnicí, ani nevymyslí smysluplný `alt`. Čtečky i zvětšení mají uživatelé vlastní a nastavené. Opravit se musí HTML.

> [!PITFALL] Zakázané zvětšení na mobilu
> *Příznak:* v `<meta name="viewport">` je `maximum-scale=1` nebo `user-scalable=no`. Na telefonu pak nejde stránku roztáhnout prsty a slabozraký uživatel drobný text nepřečte.
>
> *Oprava:* nech jen `width=device-width, initial-scale=1`. Když se stránka při zvětšení rozpadne, oprav rozvržení, ne zoom.

> [!PITFALL] Přístupnost „až na konci"
> *Příznak:* týden před spuštěním se zjistí, že se celé menu, galerie a formuláře musí přepsat.
>
> *Oprava:* správný prvek od první verze nestojí nic navíc. `button` napíšeš stejně rychle jako `div`.

:::check
Který z těchto problémů najde automatický audit spolehlivě sám?

### --answer--
Obrázek grafu má `alt="graf"`, i když graf ukazuje důležitý pokles tržeb.

#### --why--
Audit vidí, že `alt` existuje a není prázdný. Jestli popisuje, co graf sděluje, posoudí jen člověk.

### --correct--
Stránka nemá u `<html>` atribut `lang`.

#### --why--
Přítomnost atributu jde změřit strojem bez váhání. Proto chybějící jazyk najde každý automatický nástroj.

### --answer--
Po otevření menu skočí fokus na konec stránky.

#### --why--
Pořadí fokusu a jeho smysl musí vyzkoušet člověk s klávesnicí. Stroj neví, kam „by fokus měl" jít.
:::

:::explain
Kolega říká: „Přístupnost je pro pár nevidomých, to se nám nevyplatí." Vysvětli mu vlastními slovy, proč to není pravda.

## --model--
Přístupnost nepomáhá jen lidem s trvalým postižením, ale i lidem se zlomenou rukou, se sluncem na displeji, ve vlaku bez zvuku nebo ve stresu. Nejčastější chyby jako nízký kontrast, chybějící popisky polí a tlačítka z `div` přitom opravíš správným HTML, které nestojí víc práce. U e-shopů a služeb pro spotřebitele v EU je přístupnost od roku 2025 povinná ze zákona.

## --checklist--
- Překážky potkávají i lidé s dočasným nebo situačním omezením.
- Nejčastější chyby jsou jednoduché a opravují se správným HTML.
- Přístupnost je u e-shopů a služeb v EU povinná (European Accessibility Act).
:::

## Kde to najdeš v MDN

- [What is accessibility?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/What_is_accessibility) — kdo používá web jinak, jaké nástroje používá a proč na tom záleží.
- [Understanding WCAG](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG) — principy POUR rozepsané po pravidlech s příklady.
- [Color contrast](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast) — jak se počítá kontrast a kde leží hranice 4,5 : 1 a 3 : 1.
- [WebAIM Million](https://webaim.org/projects/million/) — celá zpráva o milionu webů s dalšími čísly (není na MDN, ale je to zdroj čísel z lekce).

# --questions--

## --question--

Tlačítko „Objednat" má bílý text na oranžovém pozadí `#f59e0b` a kontrast vyšel 2,15 : 1. Text je 16 px a normální tloušťky. Co z toho plyne?

### --answer--

Je to v pořádku, protože tlačítka nejsou text a platí pro ně 3 : 1.

#### --why--

Myslíš si, že text na tlačítku je „grafika"? Popisek tlačítka je obyčejný text a platí pro něj stejná hranice jako pro odstavec. A 2,15 : 1 by nesplnilo ani 3 : 1.

### --correct--

Kontrast nestačí; tmavý text na stejném oranžovém pozadí by hranici splnil s rezervou.

#### --why--

Běžný text potřebuje aspoň 4,5 : 1. Tmavě hnědá `#1c1917` na `#f59e0b` má 8,14 : 1, takže barvu tlačítka ani měnit nemusíš, stačí barva textu.

### --answer--

Stačí text zvětšit na 18 px, pak platí hranice pro velký text.

#### --why--

Velký text začíná až na 24 px, tučný na 18,5 px. A i jeho hranice 3 : 1 je víc než 2,15 : 1.

### --see--

html-pristupnost/proc-pristupnost#sest-nejcastejsich-chyb

## --question--

Nadpis sekce na stránce má velikost 28 px a normální tloušťku písma. Jaký nejmenší kontrast s pozadím potřebuje podle WCAG AA? Napiš poměr.

### --expected--

3 : 1

### --accept--

3:1
3

### --why--

Od 24 px (nebo od 18,5 px tučně) je text „velký" a stačí mu 3 : 1. Velké písmo je čitelné i s menším kontrastem. Běžný text pod touto hranicí potřebuje 4,5 : 1.

### --see--

html-pristupnost/proc-pristupnost#sest-nejcastejsich-chyb

## --question--

Na kterém principu WCAG (P, O, U, nebo R) stojí požadavek, že celý web musí jít ovládat klávesnicí? Napiš jedno písmeno.

### --expected-- ignore-case

O

### --accept--

Operable
ovladatelný

### --why--

Ovládání klávesnicí patří k principu Ovladatelný (*Operable*): uživatel musí prvky použít, ať ovládá počítač čímkoli.

### --see--

html-pristupnost/proc-pristupnost#wcag-2-2-ve-zkratce

## --question--

Kolega spustil automatický audit přístupnosti, opravil všechno, co nahlásil, a prohlásil web za přístupný. Co je na tom za problém?

### --answer--

Nic, audit v DevTools kontroluje všechna pravidla WCAG AA.

#### --why--

Myslíš si, že stroj umí posoudit všechno? Nepozná třeba, jestli `alt="obrázek"` něco říká nebo jestli pořadí fokusu dává smysl.

### --correct--

Automat najde jen měřitelné chyby; klávesnici, smysl textů a zvuk čtečky musí vyzkoušet člověk.

#### --why--

Chybějící `alt` nebo nízký kontrast stroj změří. Jestli jde stránka projít klávesnicí, jestli je fokus vidět a jestli popisky dávají smysl, zjistíš jen ruční zkouškou.

### --answer--

Audit se musí spustit ještě jednou na mobilu, jinak nic neznamená.

#### --why--

Šířka okna něco změní, ale hlavní problém zůstane: automat měří jen část pravidel, ať běží kdekoli.

### --see--

html-pristupnost/proc-pristupnost#typicke-chyby-a-pasti
