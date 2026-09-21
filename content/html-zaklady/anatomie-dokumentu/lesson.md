# Anatomie HTML dokumentu

Každá stránka, kterou kdy otevřeš — e-shop, článek, přihlášení do banky — je textový soubor s HTML. Prohlížeč z něj pozná, co je nadpis, co odkaz a v jakém jazyce text je. Tahle lekce ti ukáže, z čeho se dokument skládá, a hlavně proč ti prohlížeč chyby neoznámí, ale tiše je „opraví" po svém.

:::check pretest
V HTML napíšeš `<p>Otevřeno     od   9:00</p>` s pěti a třemi mezerami za sebou. Co uvidíš na stránce?

### --answer--
Text přesně s mezerami, jak jsi je napsal.

#### --why--
Tak se chová textový editor. HTML s mezerami v textu zachází jinak.

### --correct--
`Otevřeno od 9:00` s jednou mezerou mezi slovy.

#### --why--
Prohlížeč slije každou řadu bílých znaků (mezery, tabulátory, nové řádky) do jedné mezery.

### --answer--
Chybu, protože v HTML se víc mezer za sebou psát nesmí.

#### --why--
Mezery psát smíš, jen nemají vliv na vzhled. Prohlížeč kvůli nim nic nehlásí.
:::

:::check pretest
Zapomeneš napsat `</p>` na konci odstavce. Co udělá prohlížeč?

### --answer--
Nevykreslí stránku a ukáže chybu parsování.

#### --why--
Prohlížeč chybné HTML nikdy neodmítne, i kdyby bylo sebehorší.

### --correct--
Odstavec sám uzavře tam, kde usoudí, že končí.

#### --why--
Parser HTML má přesná pravidla, kdy značku uzavřít za tebe. Výsledek ale nemusí být to, co jsi myslel.

### --answer--
Nechá odstavec otevřený až do konce stránky.

#### --why--
U některých značek se to stát může, ale `<p>` se uzavře automaticky, jakmile přijde třeba nadpis nebo seznam.
:::

## Problém: stránka, která „funguje"

Tenhle kus HTML se v prohlížeči zobrazí a vypadá skoro dobře:

```html
<title>Kavárna Na Rohu
<h1>Kavárna Na Rohu</h1>
<p>Otevřeno denně od 8:00
<p>Veveří 12, Brno
```

Chybí mu ale deklarace typu dokumentu, jazyk, kódování znaků i uzavírací značky. Na tvém počítači to projde, na telefonu může být text drobný, čtečka obrazovky přečte češtinu anglickou výslovností a vyhledávač nepozná, o čem stránka je. Prohlížeč přitom nic nenahlásí.

> [!REMEMBER]
> **HTML je popis struktury, který prohlížeč nikdy neodmítne — a právě proto musíš chyby hledat sám.** Co nenapíšeš správně, prohlížeč doplní po svém.

:::check
Proč ti prohlížeč u chybného HTML neukáže chybovou hlášku jako u chyby v programu?

### --answer--
Protože HTML chyby mít nemůže, každý zápis je platný.

#### --why--
Neplatné HTML existuje a validátor ho najde. Prohlížeč se ho jen rozhodl nehlásit.

### --correct--
Protože má zabudovaná pravidla, jak každou chybu opravit, a stránku vždycky nějak zobrazí.

#### --why--
Web je plný starých a rozbitých stránek. Prohlížeč, který by je odmítl, by nikdo nepoužíval, a tak parser chyby tiše opravuje.

### --answer--
Protože chyby vypisuje do panelu Network v DevTools.

#### --why--
Network ukazuje požadavky a odpovědi. Chyby ve struktuře HTML prohlížeč nehlásí nikde.
:::

## Prvek, značka a atribut

[[prvek]] (*element*) je jeden kus struktury: odstavec, odkaz, obrázek. Ve zdrojovém kódu ho zapíšeš **značkami** (*tags*):

```html
<a href="https://www.kino-ostrov.cz" title="Program kina">Letní kino Ostrov</a>
```

- `<a …>` je otevírací značka, `</a>` uzavírací (s lomítkem),
- `Letní kino Ostrov` je **obsah** prvku,
- `href="https://www.kino-ostrov.cz"` je [[atribut]] (*attribute*): doplňující údaj ve tvaru `jméno="hodnota"`. Atributů může mít prvek víc, oddělených mezerou.

Prvky se **vnořují** do sebe jako krabice. Co otevřeš uvnitř, musíš uvnitř i zavřít:

```html
<p>Vstupné <strong>150 Kč</strong>, děti zdarma.</p>
```

`strong` leží celý uvnitř `p`. Zápis `<p><strong>150 Kč</p></strong>` kříží značky a prohlížeč ho musí opravovat.

Některé prvky obsah nemají a uzavírací značku nepíšou. Říká se jim [[prázdný prvek|prázdné prvky]] (*void elements*): `<img>`, `<br>`, `<meta>`, `<link>`, `<input>`, `<hr>`. Zápis `<br />` s lomítkem je taky platný, lomítko nic nemění.

:::live
```html
<h2>Letní kino Ostrov</h2>
<p>Dnes hrajeme <a href="https://www.csfd.cz" title="Otevře ČSFD">Pelíšky</a>, začátek ve 21:30.</p>
<p>Vstupné <strong>150 Kč</strong>,<br>děti do 6 let zdarma.</p>
<img src="" alt="Plátno kina u řeky" width="240" height="90">
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #1f2933; }
img { display: block; background: linear-gradient(135deg, #1e3a8a, #0f766e); color: white; }
```
:::

Zkus smazat `<br>` a sleduj, jak se text spojí do jednoho řádku. Pak najeď myší na odkaz „Pelíšky" — bublina s textem je hodnota atributu `title`.

:::check
Kolik atributů má prvek `<img src="kino.jpg" alt="Plátno kina" width="240" height="90">`? Napiš číslo.

### --expected--
4

### --why--
`src`, `alt`, `width` a `height` — každá dvojice `jméno="hodnota"` je jeden atribut. `img` sám je prvek, ne atribut.
:::

## Kostra dokumentu

Každá stránka má stejnou kostru:

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Letní kino Ostrov — program na červenec</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <h1>Program na červenec</h1>
  </body>
</html>
```

- [[doctype|`<!DOCTYPE html>`]] na prvním řádku přepne prohlížeč do standardního režimu. Bez něj kreslí v **režimu zpětné kompatibility** (*quirks mode*) a napodobuje chyby prohlížečů z 90. let.
- `<html lang="cs">` obaluje celý dokument a `lang` říká, v jakém jazyce je text. Podle něj čtečka obrazovky zvolí výslovnost a prohlížeč nabídne překlad jen cizojazyčných stránek.
- `<head>` je hlavička: informace **o** stránce, které se nezobrazují v ní — kódování, titulek, styly.
- `<body>` je tělo: všechno, co uživatel na stránce vidí.

Jak se režim zpětné kompatibility projeví? Třeba tabulka v něm nepřevezme velikost písma od `body` a výška v procentech se počítá jinak, protože tak to dělaly staré prohlížeče. Podobných rozdílů je víc a hledají se velmi těžko: stránka vypadá „skoro dobře" a v každém prohlížeči trochu jinak.

> [!NOTE]
> Náhled v Akademii běží vždy ve standardním režimu, takže rozdíl tady neuvidíš. Vyzkoušej si ho mimo kurz: ulož si stránku s tabulkou bez prvního řádku, otevři ji v prohlížeči a v konzoli DevTools napiš `document.compatMode`. Bez doctype dostaneš `"BackCompat"`, s ním `"CSS1Compat"`.

:::check
K čemu slouží atribut `lang` u prvku `html`?

### --answer--
Určuje, v jakém jazyce jsou napsané značky HTML.

#### --why--
Značky jsou pořád anglické (`body`, `head`). `lang` popisuje něco jiného.

### --correct--
Říká, v jakém jazyce je obsah stránky, aby ho čtečka správně vyslovila a prohlížeč s ním správně zacházel.

#### --why--
Čtečka obrazovky podle `lang` volí hlas a výslovnost, prohlížeč třeba dělení slov nebo nabídku překladu.

### --answer--
Přeloží stránku do zvoleného jazyka.

#### --why--
`lang` nic nepřekládá, jen popisuje, v jakém jazyce text už je.
:::

## Hlavička: kódování, viewport a titulek

Tři řádky hlavičky patří do každé stránky:

**`<meta charset="utf-8">`** říká, jak převést bajty souboru na znaky. Bez něj může prohlížeč hádat špatně a místo „Příliš žluťoučký kůň" ukáže „PĹ™Ă­liĹˇ ĹľluĹĄouÄŤkĂ˝". Patří co nejvýš v `<head>`, protože prohlížeč musí kódování znát dřív, než začne číst text.

**`<meta name="viewport" content="width=device-width, initial-scale=1">`** říká telefonu, ať stránku zobrazí na šířku svého displeje. Bez něj mobilní prohlížeč předstírá monitor široký asi 980 px a celou stránku zmenší — text je drobný a musí se přibližovat prsty.

**`<title>`** je název stránky. Zobrazí se v záložce prohlížeče, v historii, v záložkách a jako modrý nadpis ve výsledcích vyhledávání. Piš ho konkrétně: nejdřív obsah stránky, pak název webu (`Bramboráky s majoránkou — Plotna`), ne jen „Úvod" nebo „Document".

:::check
Uživatelé z mobilu hlásí, že je na tvém webu „všechno maličké" a musí si stránku roztahovat prsty. Na počítači je vše v pořádku. Co v hlavičce nejspíš chybí? Napiš hodnotu atributu `name` toho prvku.

### --expected--
viewport

### --why--
Bez `<meta name="viewport" content="width=device-width, initial-scale=1">` mobilní prohlížeč vykreslí stránku jako pro široký monitor a pak ji zmenší na displej.
:::

## Bílé znaky, entity a komentáře

**Bílé znaky** (mezery, tabulátory, nové řádky) prohlížeč v textu slévá do jedné mezery. Odsazení a nové řádky v HTML tak slouží jen tobě pro přehlednost. Nový řádek v textu vynutí `<br>`, nový odstavec nový `<p>`.

**Znakové entity** zapíšou znak, který by se jinak pletl s HTML nebo ho nejde napsat. [[znaková entita|Entita]] začíná `&` a končí `;`:

| entita | znak | kdy |
|---|---|---|
| `&lt;` `&gt;` | `<` `>` | když chceš na stránce ukázat text jako `<p>` |
| `&amp;` | `&` | ampersand v textu |
| `&nbsp;` | nezlomitelná mezera | mezi slovy, která se nesmí rozdělit na dva řádky |
| `&copy;` | © | autorská práva v patičce |

Česká typografie nedovolí nechat jednopísmennou předložku na konci řádku: `v&nbsp;Brně`, `s&nbsp;majoránkou`. Stejně tak `150&nbsp;Kč` — číslo a jednotka zůstanou u sebe.

**Komentář** `<!-- … -->` prohlížeč nezobrazí. Pozor, není tajný — každý ho uvidí ve zdrojovém kódu stránky.

:::live
```html
<p class="narrow">Letní      kino
   Ostrov promítá v Písku u řeky, vstupné 150 Kč.</p>
<p class="narrow">Letní kino Ostrov promítá v&nbsp;Písku u&nbsp;řeky, vstupné 150&nbsp;Kč.</p>
<p>Odstavec se píše jako &lt;p&gt;text&lt;/p&gt;.</p>
<!-- Program na srpen doplní Jana -->
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #1f2933; }
.narrow { width: 11.5rem; padding: 0.5rem; background: #f1f5f9; }
```
:::

Porovnej konce řádků v obou úzkých odstavcích. Pak zkus v druhém odstavci smazat `&nbsp;` mezi `150` a `Kč` a sleduj, jestli se jednotka odtrhne od čísla.

:::check
Jak zapíšeš do textu stránky znak `<`, aby ho prohlížeč nebral jako začátek značky? Napiš entitu.

### --expected--
&lt;

### --why--
`&lt;` (*less than*) se zobrazí jako `<`. Holé `<` následované písmenem by parser začal číst jako otevírací značku.
:::

## Prohlížeč chyby tiše opravuje

[[parsování HTML|Parser]] má pro každou chybu pravidlo. Některá dávají smysl, jiná překvapí. Než otevřeš náhled, tipni si, co s touhle poznámkou prohlížeč udělá. Odstavec `p` smí obsahovat jen text a řádkové prvky (odkaz, `strong`), seznam do něj nepatří.

:::live predict
```html
<p class="note">Na výlet si vezmi:
  <ul>
    <li>láhev vody</li>
    <li>pláštěnku</li>
  </ul>
</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #1f2933; }
.note { color: #9a3412; background: #ffedd5; border-left: 4px solid #ea580c; padding: 0.5rem 1rem; }
```
--question-- Které části dostanou oranžové pozadí a tmavě oranžový text z pravidla `.note`?
--option-- Celá poznámka včetně seznamu, protože seznam je uvnitř odstavce.
--option*-- Jen text „Na výlet si vezmi:" — seznam už je mimo odstavec a za ním vznikne ještě jeden prázdný odstavec.
--option-- Nic, protože kvůli chybě se pravidlo `.note` nepoužije.
--why-- Když parser uvnitř otevřeného `<p>` narazí na `<ul>`, odstavec napřed uzavře, protože seznam v něm být nesmí. Seznam tak stojí vedle odstavce. Pozdější `</p>` nemá co zavřít, a tak parser vyrobí nový prázdný `<p></p>`. Třída `note` zůstala jen u prvního odstavce. V DevTools v panelu Elements uvidíš opravený strom se dvěma `p`.
:::

> [!PITFALL]
> Styl „nefunguje" na část obsahu, ale v CSS chyba není. Příčinou bývá HTML, které parser přestavěl: seznam vyskočil z `<p>`, text napsaný přímo do `<table>` se přesunul nad tabulku. V panelu Elements zkontroluj, jestli strom vypadá tak, jak jsi napsal. Když ne, oprav HTML — ne CSS.

Aby sis chyb všiml dřív, než je parser zamete, používej **validátor** na [validator.w3.org](https://validator.w3.org/#validate_by_input). Vlož do něj HTML a u téhle poznámky nahlásí `No “p” element in scope but a “p” end tag seen.` — tedy „našel jsem `</p>`, ale žádný otevřený odstavec".

:::check
Kolega píše do stránky `<p>Kontakt: <div class="phone">777 123 456</div></p>` a diví se, proč na telefon nefunguje pravidlo `p .phone`. Proč?

### --answer--
Protože třída `phone` je napsaná s malým písmenem.

#### --why--
Velikost písmen v jménu třídy je stejná v HTML i v CSS. Problém je ve struktuře, kterou parser postavil.

### --correct--
Protože `div` do odstavce nepatří, parser odstavec před ním uzavře a `div` pak není uvnitř `p`.

#### --why--
Blokový `div` automaticky ukončí otevřený `p`. Selektor `p .phone` hledá `.phone` uvnitř odstavce a žádný takový tam není.

### --answer--
Protože selektor `p .phone` je v CSS neplatný.

#### --why--
Selektor potomka je platný. Selže, protože ve skutečném stromu vztah „uvnitř odstavce" neexistuje.
:::

:::explain
Vysvětli vlastními slovy, proč je pro tebe horší, že prohlížeč chybné HTML nikdy
neodmítne, než kdyby ho odmítl.

## --model--
Překladač, který chybu odmítne, ti ji ukáže — a ty víš, co opravit. Prohlížeč místo
toho chybu **tiše zalepí po svém**: doplní chybějící koncovou značku tam, kde by ji
sám čekal, přesune prvek na místo, kde je povolený, obal vytvoří i tam, kde jsi ho
nenapsal. Stránka se zobrazí a na první pohled vypadá v pořádku, jenže strom, který
z ní vznikl, je jiný než ten, který jsi měl v hlavě. To se pak projeví až o dvě lekce
dál — ve stylech, které se chytají jiného prvku, nebo ve skriptu, který nenajde to, co
hledá. Proto se HTML kontroluje validátorem a v panelu Elements, ne pohledem na
výsledek.

## --checklist--
- Prohlížeč chybné HTML nikdy neodmítne.
- Chybějící a špatně zanořené prvky opraví po svém.
- Vzniklý strom se pak liší od toho, co jsi zamýšlel.
- Následky se projeví až ve stylech a ve skriptech.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Chybějící `<!DOCTYPE html>`.** Stránka vypadá skoro dobře, ale tabulky nedědí písmo, výšky v procentech se počítají jinak a rozvržení se rozchází mezi prohlížeči. Oprava: první řádek souboru je vždy `<!DOCTYPE html>`.

> [!PITFALL]
> **Rozsypané znaky „Ĺ™" a „Ă­".** Soubor je uložený v UTF-8, ale prohlížeč ho přečetl v jiném kódování. Oprava: `<meta charset="utf-8">` jako první prvek v `<head>` a soubor uložený jako UTF-8.

> [!PITFALL]
> **Titulek „Document".** Editor ho vloží do šablony a nikdo ho nezmění. Ve výsledcích vyhledávání i v záložkách pak stojí „Document". Oprava: konkrétní `<title>` podle obsahu stránky.

> [!PITFALL]
> **Obsah v `<head>`.** Nadpis nebo odstavec napsaný do hlavičky parser přesune do `<body>` — a s ním i všechno za ním, takže `<link>` pod ním může skončit v těle. Do `<head>` patří jen `meta`, `title`, `link`, `style` a `script`.

:::check
V panelu Elements vidíš, že `<link rel="stylesheet">` je uvnitř `<body>`, i když ho máš v souboru v `<head>`. Co v hlavičce nejspíš je nad ním?

### --answer--
Druhý prvek `<meta>`.

#### --why--
`meta` do hlavičky patří a parser kvůli němu nic nepřesouvá.

### --correct--
Prvek, který do hlavičky nepatří, třeba `<h1>` nebo text.

#### --why--
Jakmile parser v hlavičce narazí na obsah stránky, hlavičku ukončí a otevře tělo. Všechno za tím už je v `body`.

### --answer--
Komentář `<!-- … -->`.

#### --why--
Komentář smí být kdekoli a strukturu dokumentu nemění.
:::

## Kde to najdeš v MDN

- [Structuring documents: Basic HTML syntax](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax) — prvky, atributy, prázdné prvky, entity a bílé znaky.
- [What's in the head? Metadata in HTML](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata) — `title`, `meta charset`, `lang` a další obsah hlavičky.
- [Quirks Mode](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Quirks_mode_and_standards_mode) — co přesně se bez doctype chová jinak.
- [Viewport meta tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport) — všechny hodnoty atributu `content`.

# --questions--

## --question--

Kolik prvků `p` bude v DOM po parsování tohoto HTML? Napiš číslo.

```html
<p>Rezervace: <p>Pátek 19:00</p>
```

### --expected--
2

### --why--
`<p>` uvnitř otevřeného odstavce ho napřed uzavře (odstavce se nevnořují). Vzniknou dva odstavce vedle sebe: „Rezervace:" a „Pátek 19:00". Koncové `</p>` zavře ten druhý.

### --see--
html-zaklady/anatomie-dokumentu#prohlizec-chyby-tise-opravuje

## --question--

Proč patří `<meta charset="utf-8">` na úplný začátek `<head>`, a ne třeba pod `<title>`?

### --answer--
Protože validátor jinak nahlásí chybu pořadí prvků.

#### --why--
Pořadí nejde o spokojenost validátoru. Jde o to, co prohlížeč potřebuje vědět dřív, než začne číst.

### --correct--
Protože prohlížeč musí znát kódování dřív, než přečte první text s diakritikou, třeba titulek.

#### --why--
Titulek „Příliš žluťoučký kůň" už je text, který se převádí z bajtů na znaky. Kódování proto musí přijít před ním.

### --answer--
Protože `meta` jsou prázdné prvky a ty musí být vždy první.

#### --why--
Prázdné prvky smí být kdekoli, kde dávají smysl — `img` je taky prázdný a stojí v těle stránky.

### --see--
html-zaklady/anatomie-dokumentu#hlavicka-kodovani-viewport-a-titulek

## --question--

Jakou entitou zapíšeš mezeru v `s majoránkou`, aby předložka nezůstala sama na konci řádku?

### --expected--
&nbsp;

### --why--
Nezlomitelná mezera `&nbsp;` vypadá jako obyčejná, ale prohlížeč na ní řádek nezalomí. Předložka tak zůstane u slova.

### --see--
html-zaklady/anatomie-dokumentu#bile-znaky-entity-a-komentare
