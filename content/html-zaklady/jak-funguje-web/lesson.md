# Jak funguje web

Napíšeš do prohlížeče `plotna.cz/recepty/bramboraky.html` a za půl sekundy vidíš recept s fotkou. Mezi tím se stalo pět věcí, které budeš jako frontend vývojář řešit každý den: proč se nenačetl obrázek, proč odkaz vede na 404, proč se změna na webu „neprojevila". V téhle lekci projdeš celou cestu a naučíš se ji sledovat v DevTools.

Než začneš, tipni si. Nehodnotí se, jen ti to řekne, na co se ve výkladu dívat.

:::check pretest
Otevřeš adresu stránky, která na serveru neexistuje, třeba `https://www.plotna.cz/recepty/pizza-z-marsu.html`. Co nejspíš uvidíš?

### --answer--
Prázdnou bílou stránku, protože server nemá co poslat.

#### --why--
Server odpoví vždycky, i když stránku nemá. Bílá stránka je spíš příznak toho, že odpověď přišla, ale je prázdná nebo rozbitá.

### --correct--
Chybovou stránku, kterou poslal server webu, se stavovým kódem 404.

#### --why--
Server pošle odpověď s kódem 404 („nenalezeno") a obvykle i vlastní HTML stránku s omluvou a odkazem na úvod. Prohlížeč ji vykreslí jako každou jinou.

### --answer--
Hlášku prohlížeče „Tato stránka není dostupná".

#### --why--
Takovou hlášku prohlížeč ukáže, když se k serveru vůbec nedostane (špatná doména, výpadek sítě). Tady server existuje, jen stránku nemá.
:::

## Klient a server

Web je rozhovor dvou programů. **Klient** (*client*) je program, který o obsah žádá — nejčastěji prohlížeč. **Server** je program na jiném počítači, který na žádosti odpovídá. Klient se vždycky ptá první, server jen odpovídá. Server sám od sebe nic neposílá.

Jedna stránka přitom není jeden rozhovor. Prohlížeč nejdřív stáhne HTML, přečte ho a pro každý obrázek, stylopis a skript pošle další žádost. Recept s fotkou, stylem a písmem znamená čtyři a víc samostatných odpovědí.

> [!REMEMBER]
> **Prohlížeč se ptá, server odpovídá — a každý soubor stránky je samostatná otázka a samostatná odpověď.** Proto se může načíst text a nenačíst obrázek.

:::check
Stránka receptu se načetla, text i nadpisy jsou vidět, ale místo fotky je prázdné místo. Co z toho plyne?

### --answer--
Server poslal stránku jen napůl, protože přenos se přerušil.

#### --why--
Myslíš si, že stránka i fotka putují v jedné zásilce? Každý soubor má vlastní žádost a odpověď. HTML dorazilo celé.

### --correct--
HTML dorazilo, ale žádost o soubor s fotkou skončila neúspěchem.

#### --why--
Fotka je samostatný soubor a prohlížeč si o ni řekl zvlášť. Tahle jedna žádost selhala (třeba špatnou cestou), ostatní ne.

### --answer--
Prohlížeč neumí obrázky zobrazit, dokud stránka nemá CSS.

#### --why--
Obrázek se zobrazí i na stránce bez jediného řádku CSS. Problém je v žádosti o soubor, ne ve stylech.
:::

## URL: z čeho se adresa skládá

[[URL]] (*Uniform Resource Locator*) je adresa jednoho souboru nebo stránky na webu. Má pevné části:

| část | příklad | co říká |
|---|---|---|
| schéma | `https:` | jakým protokolem se domluvit |
| [[doména]] | `www.plotna.cz` | na kterém serveru to je |
| cesta | `/recepty/bramboraky.html` | který soubor nebo stránka na serveru |
| query | `?porce=4` | doplňující parametry ve tvaru `klíč=hodnota`, oddělené `&` |
| fragment | `#postup` | místo uvnitř stránky, kam odscrollovat |

Fragment je výjimečný: **prohlížeč ho na server vůbec neposílá**. Slouží jen jemu samotnému, aby po načtení skočil na prvek s `id="postup"`.

:::live
```html
<p class="hint">Uprav adresu v atributu <code>href</code> a sleduj, jak se rozloží na části.</p>
<p><a id="address" href="https://www.plotna.cz/recepty/bramboraky.html?porce=4#postup">Bramboráky s majoránkou</a></p>
<dl id="parts"></dl>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #2b2118; }
.hint { color: #6b5d50; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.35rem 1rem; }
dt { font-weight: 700; }
dd { margin: 0; font-family: ui-monospace, monospace; }
```
```js
const url = new URL(document.querySelector('#address').href);
const parts = [
  ['schéma', url.protocol],
  ['doména', url.hostname],
  ['cesta', url.pathname],
  ['query', url.search],
  ['fragment', url.hash],
];
document.querySelector('#parts').innerHTML = parts
  .map(([name, value]) => `<dt>${name}</dt><dd>${value || '(nic)'}</dd>`)
  .join('');
```
:::

Zkus smazat `?porce=4` a sleduj, že query zmizí, ale fragment zůstane. Pak změň doménu na `plotna.cz` bez `www` — pro prohlížeč je to jiná doména. JavaScript v ukázce jen vypisuje části, ten teď číst nemusíš.

:::check
Která část adresy `https://www.kino-ostrov.cz/program?den=patek#vecerni` se na server neodešle? Napiš ji i se znakem na začátku.

### --expected--
#vecerni

### --why--
Fragment (vše od `#`) zůstává v prohlížeči. Server dostane cestu `/program` i query `?den=patek`, ale ne `#vecerni`.
:::

## Relativní a absolutní adresa

V odkazech a obrázcích nemusíš psát celou URL. [[absolutní adresa]] obsahuje schéma i doménu (`https://cs.wikipedia.org/wiki/Brno`) a vede vždy na stejné místo. [[relativní adresa]] se dopočítá od adresy stránky, na které je:

| stránka je na `https://www.plotna.cz/recepty/bramboraky.html` | výsledek |
|---|---|
| `knedliky.html` | `https://www.plotna.cz/recepty/knedliky.html` (stejná složka) |
| `img/foto.jpg` | `https://www.plotna.cz/recepty/img/foto.jpg` (podsložka) |
| `../index.html` | `https://www.plotna.cz/index.html` (`..` = o složku výš) |
| `/kontakt.html` | `https://www.plotna.cz/kontakt.html` (lomítko = od kořene webu) |
| `#postup` | stejná stránka, jen skok na `id="postup"` |

Než otevřeš náhled, tipni si, kam povede poslední odkaz.

:::live predict
```html
<p>Stránka leží na adrese <code>https://www.plotna.cz/recepty/bramboraky.html</code>.</p>
<ul>
  <li><a href="knedliky.html">knedliky.html</a></li>
  <li><a href="../index.html">../index.html</a></li>
  <li><a href="cs.wikipedia.org/wiki/Majoránka_zahradní">cs.wikipedia.org/wiki/Majoránka_zahradní</a></li>
</ul>
<h2>Kam odkazy opravdu vedou</h2>
<ul id="resolved"></ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; color: #2b2118; }
#resolved { font-family: ui-monospace, monospace; }
```
```js
const page = 'https://www.plotna.cz/recepty/bramboraky.html';
const items = [...document.querySelectorAll('a')].map((link) => {
  const target = new URL(link.getAttribute('href'), page);
  return `<li>${decodeURI(target.href)}</li>`;
});
document.querySelector('#resolved').innerHTML = items.join('');
```
--question-- Kam povede odkaz s `href="cs.wikipedia.org/wiki/Majoránka_zahradní"`?
--option-- Na článek o majoránce na české Wikipedii.
--option*-- Na neexistující stránku `https://www.plotna.cz/recepty/cs.wikipedia.org/wiki/Majoránka_zahradní`.
--option-- Nikam, prohlížeč odkaz bez `https://` zablokuje.
--why-- Bez schématu prohlížeč nepozná, že `cs.wikipedia.org` je doména. Bere to jako relativní cestu — složku jménem `cs.wikipedia.org` vedle aktuální stránky. Server webu Plotna takovou složku nemá a vrátí 404. Adresa na cizí web proto vždycky začíná `https://`.
:::

> [!PITFALL]
> Odkaz `<a href="www.wikipedia.org">` nevede na Wikipedii, ale na `…/www.wikipedia.org` na tvém webu a skončí stavovým kódem 404. Oprava: napiš celou adresu `https://www.wikipedia.org`.

:::check
Stránka je na `https://www.dvekola.cz/clanky/batuv-kanal.html`. Obrázek má `src="../img/mapa.png"`. Napiš celou adresu, kterou si prohlížeč vyžádá.

### --expected--
https://www.dvekola.cz/img/mapa.png

### --why--
Relativní cesta začíná ve složce stránky, tedy `/clanky/`. `..` vystoupí o složku výš do kořene webu a tam hledá `img/mapa.png`.
:::

## DNS: jak se z domény stane server

Počítače se v síti hledají podle čísel, IP adres (třeba `185.64.219.4`). [[DNS]] (*Domain Name System*) je telefonní seznam internetu: prohlížeč se zeptá „jaká IP adresa patří k `www.plotna.cz`?", dostane číslo a teprve pak se k serveru připojí. Výsledek si na chvíli zapamatuje, aby se nemusel ptát u každého souboru.

Pro frontend ti stačí vědět, že DNS existuje a kdy selhává. Když doménu napíšeš s překlepem nebo neexistuje, žádný server neodpoví a prohlížeč ukáže vlastní hlášku, v Chromu `DNS_PROBE_FINISHED_NXDOMAIN`. To není 404 — k serveru se nikdy nedostal.

:::check
Uživatel hlásí, že na `www.plotan.cz` vidí hlášku prohlížeče „Tento web není dostupný" s kódem `DNS_PROBE_FINISHED_NXDOMAIN`. Kde je problém?

### --answer--
Server webu nemá stránku, kterou uživatel hledá.

#### --why--
Chybějící stránka by znamenala odpověď serveru s kódem 404. Tady se prohlížeč k žádnému serveru nedostal.

### --correct--
K doméně z adresy se nenašla IP adresa, takže se prohlížeč nemá kam připojit.

#### --why--
`NXDOMAIN` znamená „doména neexistuje". V adrese je překlep `plotan` místo `plotna` a DNS pro ni nic nezná.

### --answer--
Web má chybu v HTML, a proto se nevykreslí.

#### --why--
Chybné HTML prohlížeč vykreslí, jak nejlépe umí. Hláška s `DNS_PROBE` vzniká dřív, než by nějaké HTML vůbec dorazilo.
:::

## HTTP: požadavek a odpověď

Rozhovor klienta se serverem má pravidla, protokol [[HTTP]]. Když prohlížeč chce recept, pošle [[HTTP požadavek]] (*request*):

```http
GET /recepty/bramboraky.html?porce=4 HTTP/2
Host: www.plotna.cz
Accept: text/html
Accept-Language: cs-CZ,cs
```

První řádek nese **metodu** (`GET` = „dej mi", `POST` = „posílám ti data", ten uvidíš u formulářů) a cestu s query. Pod ním jsou **hlavičky** ve tvaru `Jméno: hodnota` — doplňující informace, třeba jaký jazyk uživatel preferuje.

Server vrátí [[HTTP odpověď]] (*response*):

```http
HTTP/2 200
Content-Type: text/html; charset=utf-8
Cache-Control: max-age=600

<!DOCTYPE html>
<html lang="cs">…
```

První řádek obsahuje **stavový kód**, pak hlavičky, prázdný řádek a **tělo** — samotné HTML, obrázek nebo jiný soubor. Hlavička `Content-Type` říká, co v těle je.

| kód | význam | kdy ho uvidíš |
|---|---|---|
| `200` | OK | všechno v pořádku |
| `301` | přesunuto natrvalo | stará adresa přesměruje na novou |
| `304` | nezměněno | prohlížeč použije svou uloženou kopii |
| `404` | nenalezeno | špatná cesta k souboru nebo stránce |
| `500` | chyba serveru | spadl program na serveru, ne tvoje HTML |

Kódy `2xx` znamenají úspěch, `3xx` přesměrování, `4xx` chybu na straně žádosti (špatná adresa) a `5xx` chybu na straně serveru.

:::check
V seznamu požadavků vidíš u souboru `img/bramboraky.jpg` stavový kód `404`. Co to znamená?

### --answer--
Server spadl a nic neodeslal.

#### --why--
Spadlý program na serveru hlásí kódy `5xx`. Kód `404` server poslal úmyslně a v pořádku.

### --correct--
Server na té cestě žádný soubor nemá — cesta je špatně nebo soubor chybí.

#### --why--
`404` říká „tady nic není". Buď je v `src` špatná cesta, nebo soubor na server nikdo nenahrál.

### --answer--
Obrázek je moc velký a server ho odmítl poslat.

#### --why--
Velikost souboru s kódem `404` nesouvisí. Server by obrázek poslal, kdyby ho na dané cestě našel.
:::

## Co prohlížeč udělá s HTML

Když dorazí HTML, prohlížeč ho zpracuje v několika krocích:

1. **[[parsování HTML|Parsování]]** — přečte text značku po značce a postaví z něj strom prvků v paměti. Tomu stromu se říká DOM (*Document Object Model*). Kde je v HTML chyba, parser ji po svém opraví a jede dál.
2. **Styly** — stáhne a přečte CSS a postaví z něj druhý strom, CSSOM.
3. **Vykreslení** — spojí oba stromy, spočítá, kde co leží a jak je to velké, a namaluje pixely.

Co z toho plyne v praxi: stránka se kreslí postupně, jak data přicházejí. Stylopis v `<head>` prohlížeč stáhne dřív, než začne kreslit, aby stránka neproblikla bez stylů. A obrázek bez zadaných rozměrů posune text dolů, jakmile dorazí — k tomu se vrátíš ve workshopu s receptem.

> [!NOTE]
> Se stromem DOM budeš pracovat z JavaScriptu v sekci [DOM a události](see:js-dom/strom-dom#stranka-je-strom-uzlu). Teď stačí vědět, že prohlížeč nepracuje s tvým textem HTML, ale se stromem, který z něj postavil.

:::check
Proč vidíš v DevTools v panelu Elements jinou strukturu, než jakou jsi napsal do souboru?

### --answer--
DevTools ukazují zkrácenou verzi souboru bez komentářů.

#### --why--
Elements neukazují soubor vůbec. Ukazují něco, co prohlížeč z textu teprve postavil.

### --correct--
Panel Elements ukazuje strom DOM, který parser postavil a při tom opravil chyby.

#### --why--
Parser neuzavřené značky uzavře a chybějící prvky doplní. Elements ukazují tenhle opravený strom, ne původní text.

### --answer--
Server při odesílání HTML přeskládá.

#### --why--
Server posílá soubor tak, jak je. Změny vznikají až v prohlížeči při parsování.
:::

## DevTools: Elements a Network

Vývojářské nástroje (*DevTools*) otevřeš klávesou **F12** nebo **Ctrl+Shift+I** (na Macu **Cmd+Option+I**), případně pravým tlačítkem na prvek a volbou **Prozkoumat**.

**Elements** ukazuje živý strom DOM. Když najedeš myší na řádek, prohlížeč prvek na stránce zvýrazní. Dvojklikem upravíš text nebo atribut — jen v paměti, po obnovení stránky změna zmizí.

**Network** ukazuje všechny požadavky stránky. Otevři panel a stránku obnov (**F5**), protože zaznamenává jen to, co přijde, když je otevřený. U každého řádku vidíš:

- **Name** — soubor, **Status** — stavový kód, **Type** — druh (`document`, `stylesheet`, `jpeg`…),
- **Size** a **Time** — kolik dat a jak dlouho to trvalo.

Klikni na řádek a v záložce **Headers** uvidíš celou URL, metodu, stavový kód a hlavičky požadavku i odpovědi. Záložka **Response** ukáže tělo tak, jak ho server poslal.

> [!TIP]
> Zaškrtni v Network **Disable cache**. Dokud jsou DevTools otevřené, prohlížeč nepoužije uložené kopie a vždycky uvidíš čerstvou odpověď. Odpadne tak otázka „proč se mi změna neprojevila".

> [!NOTE]
> V Akademii běží náhled uvnitř aplikace. Když ho chceš prozkoumat, klikni pravým tlačítkem přímo do náhledu a zvol **Prozkoumat** — DevTools pak ukazují dokument náhledu.

:::check
Otevři v prohlížeči libovolný web, třeba úvodní stránku Wikipedie, pak DevTools a panel Network a stránku obnov. Jaký stavový kód má první řádek typu `document`? Napiš jen číslo.

### --expected--
200

### --accept--
304

### --why--
První řádek je samotné HTML stránky. Když ho server poslal celé, je tam `200`. Kód `304` uvidíš, když prohlížeč jen ověřil, že jeho uložená kopie platí — to je taky v pořádku.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Chybová stránka vypadá jako normální stránka.** Server pošle hezky nastylovanou omluvu s kódem 404 a oko nic nepozná. Stavový kód uvidíš jen v Network ve sloupci Status. Když ladíš „rozbitý odkaz", dívej se tam, ne na obsah.

> [!PITFALL]
> **Elements nejsou zdrojový kód.** Když hledáš chybu ve vnořování, v Elements ji neuvidíš, protože parser ji už opravil. Původní text ukáže **Ctrl+U** (zobrazit zdrojový kód stránky) nebo záložka Response v Network.

> [!PITFALL]
> **Fragment neslouží k předání dat serveru.** `?porce=4` server dostane, `#porce=4` ne. Když má server podle adresy něco udělat, patří údaj do query.

> [!PITFALL]
> **„Změna se neprojevila" bývá uložená kopie.** Nahraješ nový soubor, obnovíš stránku a vidíš starý stav — prohlížeč použil kopii z mezipaměti (v Network kód `304` nebo „(memory cache)" ve sloupci Size). Pomůže **Ctrl+Shift+R** nebo zapnuté **Disable cache**.

:::check
Kolega tvrdí, že odkaz na stránku receptu funguje, protože „se přece otevřela stránka s logem a menu webu". Co ověříš jako první?

### --answer--
Jestli má stránka v Elements správný nadpis `h1`.

#### --why--
Nadpis nic neřekne o tom, jestli server stránku našel. Chybová stránka může mít vlastní `h1` jako každá jiná.

### --correct--
Stavový kód dokumentu v panelu Network.

#### --why--
Omluvná stránka 404 má často logo i menu webu. Rozhodne až sloupec Status: `200` znamená nalezeno, `404` nenalezeno.

### --answer--
Jestli se v adrese nevyskytuje fragment `#`.

#### --why--
Fragment server nedostane a na nalezení stránky nemá vliv. Odpověď najdeš jinde.
:::

## Kde to najdeš v MDN

- [What is a URL?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL) — všechny části adresy s obrázky, včetně relativních cest.
- [An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) — požadavek, odpověď a hlavičky podrobněji.
- [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status) — seznam všech stavových kódů s vysvětlením.
- [How browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work) — co prohlížeč dělá od DNS po vykreslení.

# --questions--

## --question--

Stránka je na `https://www.kino-ostrov.cz/program/cervenec.html`. Na jakou celou adresu povede odkaz `href="/vstupenky.html"`?

### --expected--
https://www.kino-ostrov.cz/vstupenky.html

### --why--
Lomítko na začátku znamená „od kořene webu". Složka `/program/` se proto nepoužije, zůstane jen schéma a doména.

### --see--
html-zaklady/jak-funguje-web#relativni-a-absolutni-adresa

## --question--

Po nahrání nového stylopisu na server web vypadá pořád postaru. V Network má `styles.css` ve sloupci Size hodnotu „(memory cache)". Co se děje?

### --answer--
Server nový soubor ještě nezpracoval a posílá starý.

#### --why--
Myslíš si, že soubor poslal server? „(memory cache)" znamená, že se na server nikdo neptal.

### --correct--
Prohlížeč vůbec nepožádal server a použil kopii, kterou si uložil dřív.

#### --why--
Kopie z mezipaměti se použije bez dotazu na server. Tvrdé obnovení nebo **Disable cache** si vynutí čerstvou odpověď.

### --answer--
Stylopis má chybu, a proto se použil předchozí.

#### --why--
Chybné CSS prohlížeč načte a neplatné deklarace přeskočí. Starší verzi souboru si kvůli chybě nevybere.

### --see--
html-zaklady/jak-funguje-web#typicke-chyby-a-pasti

## --question--

Napiš stavový kód, který dostaneš, když program na serveru při zpracování požadavku spadne.

### --expected--
500

### --why--
Kódy `5xx` znamenají chybu na straně serveru. Tvoje HTML ani adresa za ni nemůžou, `500` je obecná „vnitřní chyba serveru".

### --see--
html-zaklady/jak-funguje-web#http-pozadavek-a-odpoved
