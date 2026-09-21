---
pass: 0.8
---

# --questions--

## --question--

Do prohlížeče napíšeš `https://www.plotna.cz/recepty/bramboraky?porce=4#postup`. Co z téhle adresy se **nikdy nedostane na server**?

### --answer--

`?porce=4`

#### --why--

Query se posílá — server podle ní může vrátit jiný obsah, třeba recept přepočítaný na čtyři porce.

### --correct--

`#postup`

#### --why--

Fragment za mřížkou si nechává prohlížeč pro sebe. Server dostane cestu a query, odpoví celou stránkou, a teprve pak prohlížeč najde prvek s tou jmenovkou a posune se k němu.

### --answer--

`/recepty/bramboraky`

#### --why--

Cesta je to hlavní, co server dostane — podle ní pozná, který recept má vrátit.

### --see--

html-zaklady/jak-funguje-web#url-z-ceho-se-adresa-sklada

## --question--

Stránka `https://plotna.cz/recepty/bramboraky.html` má odkaz `<a href="knedliky.html">`. Napiš celou adresu, na kterou odkaz vede.

### --expected--

https://plotna.cz/recepty/knedliky.html

### --accept--

plotna.cz/recepty/knedliky.html

### --why--

Relativní adresa bez lomítka na začátku se počítá od **složky**, ve které stránka leží — tady `/recepty/`. Kdyby odkaz zněl `/knedliky.html`, počítal by se od kořene webu a vyšla by adresa `https://plotna.cz/knedliky.html`.

### --see--

html-zaklady/jak-funguje-web#relativni-a-absolutni-adresa

## --question--

Napsal jsi `<p>Recept<div>Postup</div></p>`. Co uvidíš v DevTools v panelu Elements?

### --correct--

Dva odstavce a mezi nimi `div` — ten druhý odstavec je prázdný a v souboru nikde není.

#### --why--

`<div>` v odstavci stát nesmí, takže ho parser odstavcem ukončí. Zbylé `</p>` už nemá co zavírat, a tak z něj prohlížeč vyrobí nový prázdný odstavec. Proto se vyplatí koukat do Elements, ne do souboru.

### --answer--

Přesně to, co jsi napsal — odstavec a v něm `div`.

#### --why--

Panel Elements neukazuje soubor, ale strom, který z něj prohlížeč postavil. A ten se od souboru může lišit.

### --answer--

Chybovou hlášku v konzoli a prázdnou stránku.

#### --why--

HTML se nikdy „nerozbije". Prohlížeč chybu tiše opraví po svém a jede dál — proto se špatné vnoření pozná těžko.

### --see--

html-zaklady/anatomie-dokumentu#prohlizec-chyby-tise-opravuje

## --question--

Na kartě e-shopu je fotka mikiny. Který `alt` je správně?

### --answer--

`alt="fotka mikiny"`

#### --why--

Že jde o obrázek, čtečka ohlásí sama. Slovo „fotka" nebo „obrázek" v `alt` jen zdržuje.

### --correct--

`alt="Šedá mikina s kapucí a potiskem loga Akademie na prsou"`

#### --why--

Alternativní text zastupuje obrázek: musí říct to, co by z něj viděl člověk, který ho nevidí. U produktu jsou to barva, typ a výrazný detail.

### --answer--

`alt="mikina.jpg"`

#### --why--

Jméno souboru zákazníkovi neřekne nic. `alt` popisuje obsah, ne soubor.

### --answer--

`alt=""`

#### --why--

Prázdný `alt` znamená „tenhle obrázek je jen ozdoba, přeskoč ho". U fotky produktu je ale obrázek to hlavní.

### --see--

html-zaklady/semanticka-struktura#obsah-s-vyznamem-time-address-blockquote-a-cite

## --question--

Článek má `<h1>` s názvem, pod ním `<h2>Suroviny</h2>` a v něm chceš podnadpis `Na těsto`. Vývojář použil `<h4>`, protože se mu `<h3>` zdálo moc velké. Co tím rozbil?

### --correct--

Osnovu stránky: mezi `h2` a `h4` vznikla díra, takže čtenář, který skáče po nadpisech, nepozná, kam `Na těsto` patří.

#### --why--

Úroveň nadpisu je struktura, ne velikost písma. Velikost se nastaví v CSS a osnova zůstane celá.

### --answer--

Nic, prohlížeč si úroveň dopočítá podle vnoření.

#### --why--

Nedopočítá. Osnova vzniká výhradně z čísel `h1`–`h6`, vnoření v ní nehraje roli.

### --answer--

Jen vzhled — `h4` je menší, takže nadpis bude méně vidět.

#### --why--

Vzhled je následek, ne problém. Problém je, že čtečka obrazovky ohlásí úroveň 4 pod úrovní 2 a posluchač neví, jestli nějakou část nepřeskočil.

### --see--

html-zaklady/semanticka-struktura#osnova-nadpisu

## --question--

Kdy použiješ `<strong>` a kdy `<em>`? Napiš jedním slovem, co znamená `<strong>`.

### --expected--

důležitost

### --accept--

důležité
závažnost
varování

### --why--

`<strong>` říká „tohle je důležité, nepřehlédni to" — varování, podmínka, bezpečnostní pokyn. `<em>` je důraz ve větě: zdůrazněné slovo mění smysl věty („Přijď *zítra*, ne dnes."). Že je jedno tučné a druhé kurzívou, je až věc stylů.

### --see--

html-zaklady/anatomie-dokumentu#prvek-znacka-a-atribut

## --question--

Kolegyně napsala kroky postupu takhle:

```html
<ul>
  <li>1. Brambory nastrouhej.</li>
  <li>2. Vymačkej je v utěrce.</li>
  <li>3. Osmaž placky.</li>
</ul>
```

Co je na tom špatně?

### --correct--

Pořadí je součástí významu, takže to má být `<ol>` — a čísla se pak nepíšou, doplní je prohlížeč.

#### --why--

`<ul>` říká „na pořadí nezáleží". Čtečka obrazovky u `<ol>` ohlásí čísla kroků sama; ručně psaná čísla v `<ul>` přečte jako součást textu a uživatel netuší, že jde o postup.

### --answer--

Nic, výsledek vypadá stejně.

#### --why--

Vypadá, ale neznamená totéž. Sémantika není o vzhledu — a kdo přehodí položky, zůstane s čísly 1, 3, 2.

### --answer--

Čísla mají být v samostatném prvku `<span>`.

#### --why--

Tím by se problém jen zabalil. Číslování položek je práce seznamu `<ol>`, ne textu uvnitř.

### --see--

html-zaklady/semanticka-struktura#osnova-nadpisu

## --question--

V textu ceníku napíšeš `349 Kč` a na telefonu se ti číslo a měna rozpadnou na dva řádky. Jak to zapíšeš, aby zůstaly pohromadě? Napiš jen tu část mezi číslem a měnou.

### --expected--

&nbsp;

### --accept--

&#160;
&#xa0;

### --why--

Nezlomitelná mezera se zapisuje entitou `&nbsp;` — vypadá jako mezera, ale prohlížeč na ní řádek nezalomí. Stejně se drží pohromadě iniciála se jménem nebo číslo s jednotkou.

### --see--

html-zaklady/anatomie-dokumentu#bile-znaky-entity-a-komentare

## --question--

Otevřeš stránku a místo háčků a čárek vidíš `BramborÃ¡ky`. Co chybí?

### --correct--

`<meta charset="utf-8">` v hlavičce — prohlížeč čte soubor v jiném kódování, než v jakém je uložený.

#### --why--

Soubor je jen posloupnost bajtů. Bez deklarace kódování si prohlížeč tipne, a když tipne špatně, rozpadnou se právě znaky s diakritikou.

### --answer--

`<html lang="cs">` — bez jazyka prohlížeč neví, že má zobrazit české znaky.

#### --why--

`lang` je informace pro čtečky obrazovky a vyhledávače (jak slovo vyslovit, jak ho skloňovat). Se zobrazením znaků nemá nic společného.

### --answer--

Chybí české písmo, musíš ho připojit v CSS.

#### --why--

Písmo řeší, jak znak vypadá. Tady se ale načetl úplně jiný znak — problém je o krok dřív, při čtení souboru.

### --see--

html-zaklady/anatomie-dokumentu#hlavicka-kodovani-viewport-a-titulek

## --question--

Na MDN u vlastnosti čteš štítek **Baseline — Newly available**. Co to pro tebe znamená?

### --correct--

Ve všech hlavních prohlížečích to funguje, ale krátce — u starších verzí, které uživatelé ještě mají, se na to spolehnout nedá.

#### --why--

`Newly available` znamená, že poslední z hlavních prohlížečů to přidal nedávno. `Widely available` je to samé po zhruba dvou a půl letech, kdy už drtivá většina lidí má dost novou verzi.

### --answer--

Je to experimentální věc za přepínačem, běžný uživatel ji nemá.

#### --why--

Experimentální věci mají vlastní štítek. `Newly available` už je hotová a zapnutá všude.

### --answer--

Funguje to jen v Chrome.

#### --why--

Kdyby to uměl jen jeden prohlížeč, Baseline by nebyl vůbec — ten štítek dostane vlastnost, až ji umí všechny hlavní.

### --see--

html-zaklady/mdn-a-dokumentace#baseline-a-tabulka-kompatibility

## --question--

Který z těchto prvků **nesmí** obsahovat `<div>`?

### --answer--

`<section>`

#### --why--

`<section>` je obecná oblast obsahu, klidně v ní může být `div` i cokoli jiného blokového.

### --correct--

`<p>`

#### --why--

Odstavec smí obsahovat jen text a řádkové prvky (`<a>`, `<strong>`, `<em>`, `<img>`). Blokový prvek uvnitř odstavce ho parser předčasně ukončí — a to je chyba, kterou v souboru nevidíš.

### --answer--

`<figure>`

#### --why--

`<figure>` je příloha a blokové prvky v ní být smějí. Jediné omezení je, že `<figcaption>` v ní má být nejvýš jeden.

### --answer--

`<li>`

#### --why--

Položka seznamu unese celý blok obsahu, včetně odstavců, obrázků i dalších seznamů.

### --see--

html-zaklady/anatomie-dokumentu#prohlizec-chyby-tise-opravuje

## --question--

Chceš odkaz, který po kliknutí otevře psaní e-mailu na `jitka@plotna.cz`. Napiš celou hodnotu atributu `href`.

### --expected--

mailto:jitka@plotna.cz

### --why--

Rozhoduje schéma na začátku adresy — tam, kde jinde stojí `https:`. Za dvojtečkou jde rovnou adresa, bez lomítek. Telefon se zapisuje stejným způsobem: `tel:+420777123456`.

### --see--

html-zaklady/jak-funguje-web#url-z-ceho-se-adresa-sklada

## --question--

K čemu je v tabulce `<th>` oproti `<td>`?

### --correct--

`<th>` je buňka záhlaví — čtečka obrazovky díky ní u každé hodnoty ohlásí i to, čeho se týká.

#### --why--

V dlouhé tabulce se bez toho čtenář ztratí: uslyší „9 g" a neví, jestli jsou to bílkoviny, nebo tuky. Tučné písmo a zarovnání, které `<th>` dostane od prohlížeče, jsou jen vedlejší efekt.

### --answer--

`<th>` je buňka v prvním řádku, `<td>` ve všech ostatních.

#### --why--

Záhlaví může být i v prvním sloupci každého řádku. Rozhoduje význam buňky, ne její pozice.

### --answer--

`<th>` je jen jiný vzhled — tučně a na střed.

#### --why--

To je výchozí styl prohlížeče, který se dá kdykoli přepsat. Význam „tohle je záhlaví" přepsat nejde a právě o ten jde.

### --see--

html-zaklady/anatomie-dokumentu#prvek-znacka-a-atribut

## --question--

Napíšeš do prohlížeče `plotna.cz` a stránka se načte. Co se stalo **jako první**, ještě než šel na server jakýkoli požadavek na HTML?

### --correct--

Prohlížeč si přes DNS přeložil doménu `plotna.cz` na IP adresu serveru.

#### --why--

Síť adresuje čísly, ne jmény. Bez IP adresy není kam se připojit — DNS je tedy vždycky první. Teprve pak se naváže spojení a pošle HTTP požadavek.

### --answer--

Server poslal HTML stránky.

#### --why--

To přijde až jako odpověď na požadavek. A ten nejde odeslat dřív, než prohlížeč ví, na jakou IP adresu.

### --answer--

Prohlížeč postavil strom dokumentu.

#### --why--

Strom se staví z HTML, a to ještě nemá. Vykreslování je až úplně poslední fáze.

### --see--

html-zaklady/jak-funguje-web#dns-jak-se-z-domeny-stane-server

## --question--

Kdy sáhneš po `<div>` a kdy po `<section>`? Kolegyně obaluje `<div>` úplně všechno. Co jí poradíš?

### --correct--

`<div>` až tehdy, když obal existuje jen kvůli stylům. Když jde o oblast obsahu s vlastním nadpisem, patří tam `<section>` nebo přesnější prvek.

#### --why--

`<div>` nenese žádný význam, a to je jeho jediný úkol: být neviditelný obal pro CSS. Jakmile má část stránky vlastní nadpis a dá se pojmenovat, existuje na ni sémantický prvek — a ten pak umí čtečka obrazovky i vyhledávač použít.

### --answer--

`<section>` je vždycky lepší, `<div>` je zastaralý.

#### --why--

`<div>` zastaralý není a `<section>` bez nadpisu je horší než `<div>` — čtečka ohlásí oblast, o které nic neví.

### --answer--

Je to jedno, prohlížeč s oběma zachází stejně.

#### --why--

Prohlížeč ano, čtečka obrazovky a vyhledávač ne. A právě kvůli nim se sémantika píše.

### --see--

html-zaklady/semanticka-struktura#div-a-span-kdy-jsou-spravne

# --code-- Stránka penzionu od kolegy

## --file-- index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Penzion</title>
  </head>
  <body>
    <div class="top">
      <img src="logo.png">
      <div class="menu">
        <a href="index.html">Domů</a>
        <a href="pokoje.html">Pokoje</a>
        <a href="https://www.penzion-u-lipy.cz/kontakt.html">Kontakt</a>
      </div>
    </div>

    <div class="obsah">
      <div class="nadpis">Penzion U Lípy</div>
      <h2>O penzionu</h2>
      <p>Šest pokojů kousek od <div class="dulezite">rozhledny na Kraví hoře</div>, snídaně v ceně.</p>

      <h4>Vybavení</h4>
      <div>
        <div>• Wi-Fi zdarma</div>
        <div>• Parkování u domu</div>
        <div>• Snídaně od 7:30</div>
      </div>

      <h2>Ceník</h2>
      <table>
        <tr>
          <td>Pokoj</td>
          <td>Cena za noc</td>
        </tr>
        <tr>
          <td>Dvoulůžkový</td>
          <td>1 450 Kč</td>
        </tr>
        <tr>
          <td>Apartmá</td>
          <td>2 200 Kč</td>
        </tr>
      </table>

      <p>Rezervace: <a href="rezervace.html">klikni zde</a></p>
    </div>
  </body>
</html>
```

## --question--

Stránka je uložená jako `https://www.penzion-u-lipy.cz/index.html`. Který z odkazů v navigaci je zapsaný zbytečně složitě?

### --correct--

Odkaz na kontakt — vede na vlastní web, takže stačí `kontakt.html`.

#### --why--

Celá adresa se píše jen na cizí web. Uvnitř vlastního webu se používá relativní adresa: kdyby se penzion přestěhoval na jinou doménu, odkaz s celou adresou by vedl pořád na tu starou.

### --answer--

Odkaz na `index.html` — na domovskou stránku se odkazuje jen lomítkem.

#### --why--

`/` je hezčí zvyk, ale `index.html` je správně a funguje. Chyba je u jiného odkazu.

### --answer--

Odkaz na `pokoje.html` — chybí mu lomítko na začátku.

#### --why--

Bez lomítka se adresa počítá od složky, ve které stránka leží. Tady jsou oba soubory v kořeni, takže to vyjde nastejno.

## --question--

Na řádku 3 chybí v `<html>` jeden atribut. Napiš celou značku tak, jak má být pro český web.

### --expected--

<html lang="cs">

### --why--

Jazyk dokumentu říká čtečce obrazovky, jak má text vyslovovat, a vyhledávači, komu ho nabídnout. Bez něj čte česká slova anglickou výslovností.

## --question--

Kolegovi se rozpadl odstavec „Šest pokojů kousek od…" — v DevTools jsou z něj dva a text pokračuje mimo. Čím to je?

### --correct--

Uvnitř `<p>` je `<div>`, a ten tam stát nesmí — parser odstavec v tom místě ukončí.

#### --why--

Odstavec unese jen text a řádkové prvky. Pro zvýraznění uvnitř věty se hodí `<strong>`, které řádkové je. Chyba je přitom v souboru neviditelná, vidíš ji až v panelu Elements.

### --answer--

Chybí uzavírací značka `</p>`.

#### --why--

Ta tam je. Problém je v tom, co je mezi značkami.

### --answer--

Třída `dulezite` není v CSS, takže prohlížeč prvek přeskočí.

#### --why--

Chybějící třída v CSS nemá na strom dokumentu žádný vliv — prvek zůstane, jen bez stylů.

## --question--

Osnova nadpisů téhle stránky má dvě vady. Napiš úroveň nadpisu, který na stránce **úplně chybí**.

### --expected--

h1

### --accept--

<h1>
1

### --why--

Název penzionu je v `<div class="nadpis">`, takže stránka nemá hlavní nadpis vůbec. Druhá vada je `<h4>Vybavení</h4>` — pod `<h2>` patří `<h3>`, jinak v osnově vznikne díra.

## --question--

Tabulka ceníku má první řádek s názvy sloupců, ale čtečka obrazovky ho nerozezná od dat. Co s tím?

### --correct--

Buňky prvního řádku změnit na `<th>` a řádek obalit do `<thead>`; zbytek do `<tbody>`.

#### --why--

Teprve podle `<th>` ví čtečka, čeho se která hodnota týká — u „1 450 Kč" ohlásí i „Cena za noc". `<thead>` a `<tbody>` k tomu přidávají, kde končí záhlaví a začínají data.

### --answer--

Přidat prvnímu řádku třídu `hlavicka` a v CSS ho udělat tučný.

#### --why--

Tím se změní jen vzhled. Čtečka obrazovky tučné písmo neohlašuje a nevidomý uživatel je pořád bez záhlaví.

### --answer--

Nic, prohlížeč první řádek tabulky bere jako záhlaví automaticky.

#### --why--

Nebere. Bez `<th>` jsou pro něj všechny buňky stejná data.

## --question--

Poslední odkaz má text „klikni zde". Napiš lepší text pro ten odkaz.

### --expected--

rezervovat pokoj

### --accept--

rezervace pokoje
rezervuj pokoj
přejít na rezervaci
rezervace

### --why--

Čtečka obrazovky umí vypsat všechny odkazy stránky za sebou. Ze seznamu „klikni zde, klikni zde, klikni zde" se nedá vybrat. Text odkazu proto musí dávat smysl i vytržený z věty — má říkat, kam vede nebo co se stane.
