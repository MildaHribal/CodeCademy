## --card-- free

Z čeho se skládá adresa `https://eshop.cz:443/boty/panske?velikost=43#recenze`? Pojmenuj všech šest částí.

### --back--

Schéma `https:`, doména `eshop.cz`, port `:443`, cesta `/boty/panske`, query `?velikost=43`
a fragment `#recenze`. Port se u `https` obvykle nepíše, protože 443 je výchozí. Fragment
zůstává v prohlížeči — na server se nikdy neposílá.

### --see--

html-zaklady/jak-funguje-web#url-z-ceho-se-adresa-sklada

## --card-- free

Co se stane mezi stiskem Enteru v adresním řádku a prvním pixelem na obrazovce? Vyjmenuj kroky v pořadí.

### --back--

1. **DNS** přeloží doménu na IP adresu. 2. Prohlížeč naváže spojení se serverem.
3. Pošle **HTTP požadavek** (metoda, cesta, hlavičky). 4. Server vrátí **odpověď**
(stavový kód, hlavičky, tělo). 5. Prohlížeč z HTML postaví **strom dokumentu**,
spočítá styly, rozvrhne boxy a vykreslí. Obrázky, CSS a skripty si stahuje dalšími
požadavky cestou.

### --see--

html-zaklady/jak-funguje-web#co-prohlizec-udela-s-html

## --card-- free

Jaký je rozdíl mezi značkou a prvkem?

### --back--

Značka je text v souboru: `<p>` nebo `</p>`. Prvek je věc ve stromu dokumentu —
otevírací značka, obsah a zavírací značka dohromady. Rozdíl je vidět tam, kde prohlížeč
chybu opraví: v souboru máš jednu značku, ve stromu z ní může vzniknout prvek navíc
nebo žádný.

### --see--

html-zaklady/anatomie-dokumentu#prvek-znacka-a-atribut

## --card-- free

Které prvky nemají zavírací značku a jak se jim říká?

### --back--

**Prázdné prvky** (void elements): `<img>`, `<br>`, `<hr>`, `<input>`, `<meta>`, `<link>`.
Nemají obsah, takže není co zavírat. Lomítko na konci (`<br />`) je v HTML nepovinné
a nic nemění — pochází z XHTML.

### --see--

html-zaklady/anatomie-dokumentu#prvek-znacka-a-atribut

## --card-- free

Jaké tři věci patří do `<head>` každé české stránky a co se stane, když chybí?

### --back--

`<meta charset="utf-8">` — bez něj se rozpadne diakritika.
`<meta name="viewport" content="width=device-width, initial-scale=1">` — bez něj se
stránka na telefonu zmenší, jako by byla pro počítač.
`<title>` — bez něj je na kartě prohlížeče cesta k souboru a ve výsledcích hledání
nesmyslný název.

### --see--

html-zaklady/anatomie-dokumentu#hlavicka-kodovani-viewport-a-titulek

## --card-- free

Napíšeš `<p>Text <div>blok</div> dál</p>`. Co z toho prohlížeč postaví a proč?

### --back--

Odstavec „Text", pak `div`, pak **prázdný odstavec** navíc. `<div>` v odstavci stát nesmí,
takže parser odstavec před ním ukončí; zbylé `</p>` už nemá co zavírat a prohlížeč z něj
udělá nový prázdný odstavec. Chyba je v souboru neviditelná — vidíš ji až v DevTools
v panelu Elements.

### --see--

html-zaklady/anatomie-dokumentu#prohlizec-chyby-tise-opravuje

## --card-- free

Kdy `<strong>`, kdy `<em>` a kdy `<b>` nebo `<i>`?

### --back--

`<strong>` = tohle je důležité (varování, podmínka). `<em>` = důraz ve větě, zdůrazněné
slovo mění smysl. `<b>` a `<i>` jsou pro text, který se odlišuje **bez** důrazu na
důležitost — odborný termín, název lodi, cizí slovo. V praxi si vystačíš se `<strong>`
a `<em>`; vzhled řeší CSS.

### --see--

html-zaklady/anatomie-dokumentu#prvek-znacka-a-atribut

## --card-- free

Jak se pozná, že má obrázek mít prázdný `alt=""` a kdy popis?

### --back--

Prázdný `alt` znamená „tohle je ozdoba, přeskoč to" — čtečka obrazovky obrázek vůbec
neohlásí. Použij ho u dekorativní vlnovky nebo ikony vedle textu, který už totéž říká.
Popis piš tam, kde obrázek nese informaci: produkt, graf, fotka v článku. **Žádný**
`alt` (chybějící atribut) je vždycky chyba — čtečka pak přečte jméno souboru.

### --see--

html-zaklady/semanticka-struktura#obsah-s-vyznamem-time-address-blockquote-a-cite

## --card-- free

Proč se u `<img>` píšou `width` a `height`, když velikost stejně řídí CSS?

### --back--

Aby prohlížeč znal **poměr stran** dřív, než se obrázek stáhne, a nechal si na něj
místo. Bez toho text nad obrázkem vyskočí nahoru a po stažení poskočí dolů (tomu se
říká posun rozvržení). Píšou se bez jednotek, jako skutečné rozměry souboru.

### --see--

html-zaklady/jak-funguje-web#co-prohlizec-udela-s-html

## --card-- free

Kdy `<article>`, kdy `<section>` a kdy `<div>`?

### --back--

`<article>` = samostatný celek, který dává smysl vytržený ze stránky (příspěvek, recept,
komentář, karta produktu). `<section>` = tematická část s vlastním nadpisem uvnitř
většího celku. `<div>` = obal, který existuje **jen** kvůli stylům a nenese žádný význam.
Zkouška: má ta část vlastní nadpis? Pak to není `div`.

### --see--

html-zaklady/semanticka-struktura#article-a-section

## --card-- free

Co je osnova nadpisů a proč se nesmí přeskočit úroveň?

### --back--

Strom, který vznikne z `h1`–`h6` podle jejich čísel. Čtečka obrazovky ho nabízí jako
obsah stránky a čtenář po něm skáče místo čtení odshora. Skok z `h2` na `h4` udělá
v osnově díru — není poznat, kam nadpis patří. Úroveň se volí podle struktury,
velikost písma se nastaví v CSS.

### --see--

html-zaklady/semanticka-struktura#osnova-nadpisu

## --card-- free

Jaké jsou orientační oblasti stránky a k čemu jsou?

### --back--

`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`. Čtečka obrazovky mezi nimi umí
skákat jedním stiskem, takže uživatel nemusí procházet navigaci pokaždé znovu.
`<main>` je na stránce právě jeden a obsahuje to, kvůli čemu na ni člověk přišel.

### --see--

html-zaklady/semanticka-struktura#orientacni-oblasti-header-nav-main-aside-footer

## --card-- free

Jak se liší `href="/kontakt.html"`, `href="kontakt.html"` a `href="../kontakt.html"`?

### --back--

Lomítko na začátku = od **kořene webu** (`https://web.cz/kontakt.html`), ať jsi kdekoli.
Bez lomítka = od **složky aktuální stránky**. `../` = o složku výš. Celá adresa
(`https://…`) se píše jen na cizí web — uvnitř vlastního webu by se při stěhování
na jinou doménu musela přepsat.

### --see--

html-zaklady/jak-funguje-web#relativni-a-absolutni-adresa

## --card-- free

Jak se zapíše odkaz na e-mail, na telefon a na místo uvnitř téže stránky?

### --back--

`<a href="mailto:jitka@plotna.cz">`, `<a href="tel:+420777123456">` a `<a href="#postup">`.
U prvních dvou rozhoduje schéma na začátku, u třetího fragment — cílový prvek musí mít
`id="postup"` a to `id` smí být v dokumentu jen jednou.

### --see--

html-zaklady/jak-funguje-web#url-z-ceho-se-adresa-sklada

## --card-- free

Z čeho se skládá tabulka se záhlavím a proč `<th>` místo `<td>`?

### --back--

`<table>` → `<thead>` a `<tbody>` → `<tr>` → buňky. V záhlaví `<th>`, v datech `<td>`.
Podle `<th>` ví čtečka obrazovky, čeho se která hodnota týká — u buňky „9 g" ohlásí
i „Na 1 porci". Tučné písmo, které `<th>` dostane, je jen výchozí styl prohlížeče.

### --see--

html-zaklady/anatomie-dokumentu#prvek-znacka-a-atribut

## --card-- free

Na MDN vidíš u vlastnosti **Baseline — Widely available**. Co si z toho vezmeš?

### --back--

Funguje to ve všech hlavních prohlížečích už zhruba dva a půl roku, takže i lidé se
staršími verzemi to mají. Dá se použít bez záložního řešení. **Newly available** znamená
totéž, ale teprve krátce — tam se ještě vyplatí mít plán B nebo to nechat na později.

### --see--

html-zaklady/mdn-a-dokumentace#baseline-a-tabulka-kompatibility

## --card-- free

Text má obsahovat znak `<` nebo `&`. Jak ho zapíšeš, aby ho prohlížeč nepovažoval za značku?

### --back--

Entitou: `&lt;` pro `<`, `&gt;` pro `>`, `&amp;` pro `&`. Entita začíná ampersandem
a končí středníkem. Stejně se zapisují znaky, které na klávesnici nejsou:
`&nbsp;` (nezlomitelná mezera), `&copy;` (©), `&mdash;` (—).

### --see--

html-zaklady/anatomie-dokumentu#bile-znaky-entity-a-komentare
