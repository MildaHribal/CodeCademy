# Přetečení a velikost obsahu

Stránka, která jde na telefonu posouvat do strany, je nejčastější chyba, kterou uvidíš v cizím CSS. Skoro vždycky za ní stojí dlouhá URL v komentáři, obrázek bez hranice šířky nebo název produktu, který se nesmí zalomit. Než začneš, odhadni.

:::check pretest
Karta je široká 300 px a v jejím odstavci je adresa `https://www.example.cz/navody/jak-vybrat-stan-na-horskou-turistiku-bez-kompromisu` bez mezer. Co udělá prohlížeč ve výchozím stavu?

### --answer--
Zalomí adresu na konci řádku, kde se zrovna nevejde.

#### --why--
Tak by to bylo s obyčejným textem, který má mezery. Adresa bez mezer je pro prohlížeč jedno dlouhé slovo.

### --correct--
Nechá adresu na jednom řádku a ta přeteče z karty doprava.

#### --why--
Slovo bez mezer se ve výchozím stavu nezalamuje. Obsah, který se nevejde, z boxu přeteče a zůstane vidět.

### --answer--
Kartu roztáhne tak, aby se do ní adresa vešla.

#### --why--
Karta má pevnou šířku 300 px a tu obsah nezmění. Box se kvůli obsahu nerozšíří, obsah z něj vyleze.
:::

:::check pretest
Nadpis karty má `overflow: hidden` a `text-overflow: ellipsis`. Myslíš, že se dlouhý nadpis ořízne na jeden řádek se třemi tečkami na konci?

### --answer--
Ano, tyhle dvě vlastnosti na oříznutí stačí.

#### --why--
Chybí jedna věc: tři tečky se kreslí jen tam, kde text přetéká **do strany**. Uvidíš za chvíli.

### --correct--
Ne, nadpis se dál zalamuje do víc řádků a nic se neořízne.

#### --why--
Text se zalamuje, takže do strany nikdy nepřeteče a `text-overflow` nemá co zkracovat. Chybí zákaz zalamování `white-space: nowrap`.
:::

## Problém: obsah, který se nevejde

Tady je komentář pod článkem na úzkém displeji. Autorka komentáře vložila odkaz a její jméno se nesmí zalomit:

:::live
```html
<article class="comment">
  <h3 class="comment__author">Tereza Dvořáková z Českých Budějovic</h3>
  <p>Přesně tenhle stan mám tři roky. Recenze, podle které jsem vybírala:
    https://www.example.cz/recenze/stany/dvouplastovy-stan-pro-dva-na-horskou-turistiku-2026</p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.5; }

.comment {
  width: 16rem;
  padding: 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 0.75rem;
}

.comment__author {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  white-space: nowrap;
}
```
:::

Jméno i adresa vylezou z rámečku doprava. Tomu se říká [[přetečení]] (*overflow*). Na skutečném telefonu by se objevil vodorovný posuvník a celá stránka by se dala posouvat do strany. Zkus přidat do `.comment` `overflow: hidden;` a pak ho vyměň za `overflow-wrap: anywhere;`. Adresa se zalomí, jméno ne: `white-space: nowrap` zalamování zakazuje úplně. Obojí rozebereme níž.

> [!REMEMBER]
> **Co se do boxu s danou šířkou nevejde, z něj ve výchozím stavu přeteče a zůstane vidět. Box se kvůli obsahu nerozšíří a nic se samo neořízne.** Jak s přetečením naložit, rozhoduješ ty: zalomit, oříznout, nebo nechat posouvat.

Výška je jiný případ: blok s `height: auto` s obsahem roste, takže do výšky přetéká jen tehdy, když výšku omezíš (`height`, `max-height`).

:::check
Blok bez nastavené výšky obsahuje pět dlouhých odstavců. Přeteče text přes jeho spodní okraj?

### --answer--
Ano, blok bez výšky má výšku nula a všechno přeteče.

#### --why--
Výchozí `height: auto` neznamená nula, ale „tak vysoký, jak je obsah".

### --correct--
Ne, blok s `height: auto` s obsahem roste.

#### --why--
Do výšky přetéká jen box s omezenou výškou. S `auto` se blok zvětší podle obsahu.

### --answer--
Ano, ale jen pokud odstavce mají margin.

#### --why--
Marginy dětí výšku rodiče nerozbijí. Nanejvýš můžou z rodiče „utéct", jak ukázala lekce o slévání marginů.
:::

## `overflow`: co s obsahem, který přetéká

Vlastnost `overflow` říká, co udělat s obsahem, který se do boxu nevejde:

| hodnota | co udělá | vedlejší efekt |
|---|---|---|
| `visible` (výchozí) | obsah přeteče a je vidět | žádný |
| `hidden` | ořízne na hraně paddingu | box jde posouvat skriptem nebo fokusem, založí BFC |
| `clip` | ořízne na hraně paddingu | žádné posouvání, BFC nezaloží |
| `scroll` | ořízne a přidá posuvníky vždy | založí BFC |
| `auto` | ořízne a posuvník přidá jen při přetečení | založí BFC |

Směry jde nastavit zvlášť: `overflow-x` a `overflow-y` (logicky `overflow-inline` a `overflow-block`).

:::live
```html
<div class="table-wrap">
  <table>
    <tr><th>Tarif</th><th>Data</th><th>Volání</th><th>SMS</th><th>Roaming v EU</th><th>Cena měsíčně</th></tr>
    <tr><td>Start</td><td>5 GB</td><td>neomezeně</td><td>neomezeně</td><td>v ceně</td><td>349 Kč</td></tr>
    <tr><td>Plus</td><td>50 GB</td><td>neomezeně</td><td>neomezeně</td><td>v ceně</td><td>549 Kč</td></tr>
  </table>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.table-wrap {
  width: 18rem;
  overflow: var(--overflow);
  border: 2px solid #cbd5e1;
  border-radius: 0.5rem;
}

table { border-collapse: collapse; }
th, td { padding: 0.5rem 0.75rem; white-space: nowrap; text-align: start; }
th { background: #f1f5f9; }
```
```controls
--overflow: select(visible, hidden, clip, auto, scroll) = visible | overflow
```
:::

Projdi všechny hodnoty. Pro širokou tabulku v úzkém rozvržení je správná `auto`: stránka zůstane v šířce displeje a posouvá se jen tabulka. S `hidden` a `clip` by čtenář poslední sloupce vůbec neviděl.

> [!NOTE]
> Když jeden směr nastavíš na `hidden`, `auto` nebo `scroll` a druhý necháš `visible`, prohlížeč z `visible` udělá `auto`. Box nemůže být v jednom směru posuvný a v druhém přetékat ven.

:::check
Blok kódu `<pre>` je širší než článek a stránka jde kvůli němu posouvat do strany. Napiš deklaraci pro `pre`, aby se posouval jen blok kódu a jen tehdy, když přetéká.

### --expected--
overflow-x: auto

### --accept--
overflow: auto
overflow-inline: auto

### --why--
`auto` přidá posuvník jen při přetečení a box ořízne na jeho šířce, takže stránka zůstane v šířce displeje. `scroll` by ukázal posuvník vždycky, `hidden` by konec řádků schoval.
:::

## Dlouhá slova a adresy

Slovo bez mezer (URL, e-mail, číslo účtu, hashtag) se ve výchozím stavu nezalamuje. Pomůže vlastnost `overflow-wrap`:

- `overflow-wrap: anywhere` — slovo, které se nevejde na řádek, smí zlomit kdekoli. Počítá se to i do nejmenší šířky obsahu, takže zabere i uvnitř flexboxu a gridu.
- `overflow-wrap: break-word` — zlomí slovo taky, ale jen při vykreslení. Nejmenší šířku obsahu nezmenší, takže ve flex položce nebo buňce gridu box pořád roztáhne.
- `word-break: break-all` — láme **každé** slovo na konci řádku, i obyčejná česká slova v půlce. Na texty se nehodí.

:::live predict
```html
<div class="row">
  <p class="row__text">https://www.example.cz/objednavky/2026/0912-7781-vlastni-potisk-trik</p>
  <span class="row__status">Odesláno</span>
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.row {
  display: flex;
  gap: 0.5rem;
  width: 16rem;
  padding: 0.5rem;
  border: 2px dashed #94a3b8;
}

.row__text {
  margin: 0;
  overflow-wrap: break-word;
}

.row__status {
  padding: 0 0.5rem;
  border-radius: 999px;
  background: #dcfce7;
}
```
--question-- Odstavec s adresou je položka flexboxu a má `overflow-wrap: break-word`. Vejde se řádek do čárkovaného rámečku?
--option-- Ano, `break-word` adresu zalomí a štítek „Odesláno" bude uvnitř rámečku.
--option*-- Ne, adresa zůstane nezalomená a štítek vyleze z rámečku doprava.
--option-- Ne, adresa se zalomí, ale štítek skočí na další řádek.
--why-- Flex položka se nezmenší pod nejmenší šířku svého obsahu a `break-word` tu šířku nezmenšuje: prohlížeč pořád počítá s celou adresou jako jedním slovem. Změň hodnotu na `anywhere` a adresa se zalomí, protože `anywhere` dovolí zlom i při výpočtu nejmenší šířky. Proč se flex položka nezmenší, rozebírá sekce CSS Flexbox.
--see-- css-box-model/preteceni#dlouha-slova-a-adresy
:::

Proto má řada moderních resetů stylů pro odstavce a nadpisy rovnou `overflow-wrap: break-word` nebo `anywhere`.

:::check
V komentářích se občas objeví dlouhá adresa, která rozbije rozvržení na telefonu. Obyčejná slova se ale mají zalamovat jen mezi slovy. Napiš deklaraci pro text komentáře.

### --expected--
overflow-wrap: anywhere

### --accept--
overflow-wrap: break-word
word-wrap: break-word

### --why--
`overflow-wrap` zlomí slovo jen tehdy, když se celé nevejde na řádek, obyčejná slova nechá být. `anywhere` navíc funguje i ve flex a grid položkách. `word-break: break-all` by lámalo i česká slova v půlce.
:::

## Jeden řádek se třemi tečkami

Názvy produktů v kartách, jména v seznamu kontaktů nebo poslední zpráva v chatu se často zkracují na jeden řádek se třemi tečkami. Potřebuješ na to **čtyři věci najednou**:

```css
.contact__name {
  /* 1. box s omezenou šířkou: blok nebo inline-block */
  white-space: nowrap;      /* 2. text se nezalamuje, přeteče do strany */
  overflow: hidden;         /* 3. přetečení se ořízne */
  text-overflow: ellipsis;  /* 4. na místě oříznutí se nakreslí … */
}
```

Když kterákoli chybí, tři tečky se neukážou. Tipni si, co je špatně tady:

:::live predict
```html
<ul class="chats">
  <li class="chat">
    <strong>Honza</strong>
    <span class="chat__last">Ahoj, posílám fotky z víkendu na Šumavě, jsou jich asi tři stovky</span>
  </li>
</ul>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.chats {
  width: 15rem;
  margin: 0;
  padding: 0.5rem;
  border: 2px solid #cbd5e1;
  list-style: none;
}

.chat strong { display: block; }

.chat__last {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #64748b;
}
```
--question-- Poslední zpráva má `white-space: nowrap`, `overflow: hidden` a `text-overflow: ellipsis`. Proč se neořízne třemi tečkami?
--option-- Protože `text-overflow` funguje jen na nadpisy a odstavce.
--option*-- Protože `span` je řádkový prvek: nemá vlastní šířku, kterou by šlo přetéct, a `overflow` na něj nepůsobí.
--option-- Protože chybí `width: 100%` na seznamu.
--why-- `overflow` a `text-overflow` působí jen na box, který má šířku a obsahuje řádky textu, tedy blok nebo `inline-block`. Řádkový `span` je jen kus textu v řádku, takže text přetéká z `li` a nic se neořízne. Dopiš do `.chat__last` `display: block;` a tři tečky se objeví.
--see-- css-box-model/preteceni#jeden-radek-se-tremi-teckami
:::

Na víc řádků (třeba popis produktu na tři řádky) se dnes píše tahle kombinace. Vlastnosti s předponou `-webkit-` jsou starší zápis, ale mají přesně popsané chování a fungují ve všech prohlížečích. Novější `line-clamp` bez předpony zatím všechny prohlížeče neumí:

```css
.product__description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
```

:::check
Jméno kontaktu `.contact__name` je blok s omezenou šířkou a má `overflow: hidden` a `text-overflow: ellipsis`. Dlouhé jméno se ale zalomí do dvou řádků. Napiš chybějící deklaraci.

### --expected--
white-space: nowrap

### --accept--
text-wrap: nowrap
text-wrap-mode: nowrap

### --why--
Tři tečky se kreslí jen tam, kde text přetéká do strany. Dokud se text zalamuje, do strany nepřeteče. `white-space: nowrap` zalamování zakáže.
:::

## Velikost podle obsahu: `min-content`, `max-content`, `fit-content`

Kromě délek a procent můžeš šířku (a výšku) nastavit klíčovým slovem, které se počítá z obsahu:

- `min-content` — nejmenší šířka, na kterou jde obsah zalomit. U textu šířka nejdelšího slova.
- `max-content` — šířka obsahu, když se nic nezalomí. U textu celý text na jednom řádku.
- `fit-content` — jako `max-content`, ale nejvýš tak široký, kolik je místa v rodiči. Pak se zalomí.

:::live
```html
<p class="label">Doprava zdarma při nákupu nad 1 500 Kč a vrácení do 30 dnů</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.label {
  width: var(--width);
  margin-inline: auto;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: #fef3c7;
}
```
```controls
--width: select(auto, min-content, max-content, fit-content) = auto | width
```
:::

Projdi hodnoty a pak přepni šířku náhledu na 375. `max-content` přeteče z okna, `fit-content` se zalomí. Všimni si i `margin-inline: auto`: s `fit-content` blok vycentruje, s `auto` šířkou nemá co centrovat.

:::check
Štítek „Novinka" je blok a má být jen tak široký jako jeho text, ale na úzkém displeji nesmí přetéct. Napiš hodnotu `width`.

### --expected--
fit-content

### --accept--
width: fit-content

### --why--
`fit-content` je šířka textu na jednom řádku, ale nejvýš šířka rodiče. `max-content` by na úzkém displeji přetekl, `min-content` by štítek zalomil po každém slově.
:::

## Obrázky: hranice šířky, poměr stran a `object-fit`

Obrázek s atributy `width="1200" height="800"` je na telefonu 1200 px široký a stránku roztáhne. Základ, který má skoro každý stylopis:

```css
img {
  max-inline-size: 100%;
  block-size: auto;
}
```

`max-inline-size: 100%` obrázek nepustí za šířku rodiče. `block-size: auto` dopočítá výšku podle poměru stran. Bez něj by výška zůstala z atributu `height` a obrázek by se zdeformoval. Atributy `width` a `height` přitom v HTML nech: prohlížeč z nich zná poměr stran dřív, než se obrázek stáhne, a stránka při načítání neposkočí.

Když má mít obrázek jiný tvar než soubor (čtvercový náhled, výřez 16 : 9 v kartě), použij dvě vlastnosti:

- `aspect-ratio: 16 / 9` — box dostane [[poměr stran]] (*aspect ratio*); výška se dopočítá ze šířky,
- `object-fit` — jak se obrázek do takového boxu vejde: `fill` (výchozí, roztáhne a zdeformuje), `cover` (vyplní a přesah ořízne), `contain` (vejde se celý, zbyde prázdné místo).

:::compare
```html
<figure class="thumb">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23fde68a'/%3E%3Ccircle cx='150' cy='150' r='110' fill='%23f97316'/%3E%3Ccircle cx='150' cy='150' r='50' fill='%23fff7ed'/%3E%3C/svg%3E" width="300" height="300" alt="Oranžový talíř">
  <figcaption>Talíř Terra, 26 cm</figcaption>
</figure>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.thumb { width: 16rem; margin: 0; }

.thumb img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
}
```
--variant-- object-fit: fill
```css
.thumb img { object-fit: fill; }
```
--variant-- object-fit: cover
```css
.thumb img { object-fit: cover; }
```
:::

S `fill` je kulatý talíř zmáčknutý do elipsy. S `cover` zůstane kulatý a přesah nahoře a dole se ořízne. Kterou část obrázku oříznout, řídí `object-position` (výchozí je střed).

:::check
Obrázek v kartě má `width: 100%` a `aspect-ratio: 1 / 1`, ale fotka je na šířku a ve čtverci je zmáčknutá. Napiš deklaraci, která fotku ve čtverci neroztáhne a vyplní celý čtverec.

### --expected--
object-fit: cover

### --why--
`cover` zachová poměr stran fotky, zvětší ji tak, aby vyplnila celý box, a přesah ořízne. `contain` by nechal prázdné pruhy, výchozí `fill` fotku zdeformuje.
:::

## `float` jen na obtékání

[[plovoucí prvek|Plovoucí prvek]] (*float*) s `float: inline-start` (nebo `left`) je vytažený z normálního toku k začátku řádku a text ho obtéká, jako obrázek v tištěném časopise. Dřív se `float` používal na celá rozvržení stránky. Na to jsou dnes flexbox a grid. `float` zůstal na to, na co vznikl: text obtékající obrázek nebo citaci.

:::live
```html
<article class="story">
  <figure class="story__figure">
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='200'%3E%3Crect width='160' height='200' fill='%2393c5fd'/%3E%3Cpath d='M0 200 60 90l40 60 30-30 30 80Z' fill='%231e3a8a'/%3E%3C/svg%3E" width="160" height="200" alt="Ilustrace skal">
  </figure>
  <p>Adršpašské skály jsou nejrozsáhlejší skalní město ve střední Evropě. Okruh začíná u vstupu na nádraží a trvá asi dvě hodiny.</p>
</article>
<p class="next">Další článek: Prachovské skály s dětmi</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.5; }

.story {
  display: var(--display);
  max-width: 24rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: #eff6ff;
}

.story__figure {
  float: inline-start;
  margin: 0;
  margin-inline-end: 1rem;
  margin-block-end: 0.5rem;
}

.story__figure img { display: block; max-width: 100%; height: auto; border-radius: 0.5rem; }

.story p { margin: 0; }

.next { color: #64748b; }
```
```controls
--display: toggle(block, flow-root) = block | display článku
```
:::

S `display: block` obrázek vyčuhuje ze světle modrého článku a „Další článek" ho obtéká taky. Plovoucí prvek totiž do výšky rodiče nepočítá. Přepni článek na `flow-root`: blokový formátovací kontext z lekce o slévání marginů obalí i plovoucí děti.

Když nemůžeš změnit rodiče a potřebuješ jen, aby **jeden** prvek za plovoucím obrázkem začal až pod ním, dej tomu prvku `clear: both` (nebo `clear: inline-start` pro jednu stranu). `clear` zakáže boxu stát vedle plovoucích prvků a posune ho pod ně.

:::check
Karta obsahuje obrázek s `float: inline-start` a krátký text. Obrázek z karty vyčuhuje dolů. Napiš deklaraci pro kartu, která ho obalí bez oříznutí.

### --expected--
display: flow-root

### --why--
Plovoucí prvek se do výšky obyčejného bloku nepočítá. Blokový formátovací kontext ho obalí, a `flow-root` ho založí bez vedlejších efektů. `overflow: hidden` by fungovalo taky, ale ořízlo by stíny a obrysy.
:::

## Typické chyby a pasti

> [!PITFALL] `overflow-x: hidden` na `body` jako oprava
> *Příznak:* stránka jde na telefonu posouvat do strany a někdo přidá `body { overflow-x: hidden; }` nebo `overflow: hidden` na obal stránky. Posuvník zmizí, ale přetékající prvek je dál useknutý a čtenář jeho konec neuvidí. Na obalu stránky navíc `overflow: hidden` rozbije přilepenou hlavičku (`position: sticky`), k té se dostaneš v sekci Pozicování a vrstvení.
>
> *Oprava:* najdi prvek, který přetéká (v DevTools hledej prvek širší než okno), a oprav ho: `overflow-wrap: anywhere` pro text, `max-inline-size: 100%` pro obrázky, `overflow-x: auto` pro tabulky a kód.

Další past je s obrázky. Tipni si:

:::live predict
```html
<div class="card">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='300'%3E%3Crect width='600' height='300' fill='%2334d399'/%3E%3Ccircle cx='300' cy='150' r='120' fill='%23065f46'/%3E%3C/svg%3E" width="600" height="300" alt="Zelený kruh">
</div>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.card {
  width: 200px;
  padding: 0.5rem;
  border: 2px solid #cbd5e1;
}

.card img {
  display: block;
  max-width: 100%;
}
```
--question-- Obrázek 600 × 300 px má `max-width: 100%` v kartě široké 200 px. Jak bude vypadat?
--option-- 200 × 100 px, poměr stran zůstane.
--option*-- 200 px široký a 300 px vysoký, kruh bude zmáčknutý do úzké elipsy.
--option-- 600 × 300 px, `max-width` atribut `width` nepřebije.
--why-- `max-width` stáhne šířku na šířku obsahu karty. Karta má výchozí `content-box`, takže `width: 200px` je právě místo pro obsah a obrázek bude 200 px široký. Výška ale zůstane z atributu `height="300"`, protože ji nic nepřepočítá. Dopiš `height: auto;` a obrázek bude mít zase poměr 2 : 1.
--see-- css-box-model/preteceni#obrazky-hranice-sirky-pomer-stran-a-object-fit
:::

> [!PITFALL] Zdeformovaný obrázek po `max-width`
> *Příznak:* obrázek na úzké obrazovce je zúžený, ale pořád stejně vysoký, a vypadá zmáčknutě.
>
> *Oprava:* k `max-width: 100%` vždy `height: auto`.

> [!PITFALL] `aspect-ratio`, které nic nedělá
> *Příznak:* box má `aspect-ratio: 16 / 9`, ale je jinak vysoký.
>
> *Oprava:* poměr stran se použije jen tehdy, když jeden rozměr zůstane `auto`. S pevnou `height` i `width` se ignoruje. A když se do boxu nevejde text, box kvůli němu naroste do výšky; hlídej, aby v boxu s poměrem stran byl obrázek, ne dlouhý text.

> [!PITFALL] Tři tečky, které se neukážou
> *Příznak:* text je oříznutý, ale bez `…`, nebo se neořízne vůbec.
>
> *Oprava:* zkontroluj všechny čtyři podmínky: box s šířkou (blok nebo `inline-block`), `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`.

:::check
Stránka jde na telefonu posouvat do strany. V DevTools zjistíš, že přetéká obrázek v článku s atributy `width="1200" height="800"`. Která oprava je správná?

### --answer--
`body { overflow-x: hidden; }`

#### --why--
Posuvník zmizí, ale obrázek bude dál širší než displej a jeho pravá část useknutá. Oprava patří přetékajícímu prvku, ne celé stránce.

### --correct--
`img { max-width: 100%; height: auto; }`

#### --why--
Obrázek se zúží na šířku rodiče a výška se dopočítá z poměru stran, takže nepřeteče ani se nezdeformuje.

### --answer--
`img { width: 100vw; }`

#### --why--
`100vw` je šířka celého okna, ne rodiče. Obrázek v článku s paddingem by přetekl i tak.
:::

V závěrečném labu to všechno použiješ na článku s obtékaným obrázkem, citací, širokou tabulkou a dlouhou adresou.

## Kde to najdeš v MDN

- [overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow) — všechny hodnoty, rozdíl `hidden` a `clip` a pravidlo pro dvě hodnoty.
- [overflow-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-wrap) — `anywhere` vs. `break-word` s ukázkou nejmenší šířky obsahu.
- [text-overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-overflow) — podmínky, za kterých se `ellipsis` ukáže.
- [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit) — `fill`, `contain`, `cover`, `none` a `scale-down` vedle sebe.

# --questions--

## --question--

Galerie má dlaždice `.tile` s `width: 100%` a `aspect-ratio: 4 / 3`. Jedna dlaždice obsahuje místo obrázku dlouhý text a je vyšší než ostatní. Proč?

### --answer--

`aspect-ratio` funguje jen na obrázky, na `div` s textem ne.

#### --why--

`aspect-ratio` funguje na jakýkoli box, i na `div`. Rozdíl dělá obsah, který se do vypočtené výšky nevejde.

### --correct--

Text se do výšky podle poměru stran nevejde a box s `height: auto` kvůli obsahu naroste.

#### --why--

Poměr stran dá boxu výchozí výšku, ale nejmenší výška obsahu má přednost. Obrázky s `object-fit` se přizpůsobí, text ne.

### --answer--

Chybí `object-fit: cover`, který by text ořízl.

#### --why--

`object-fit` působí jen na obrázky a video uvnitř jejich boxu, text neořízne.

### --see--

css-box-model/preteceni#typicke-chyby-a-pasti

## --question--

Obal tabulky `.orders` má `overflow-x: auto` a `width: max-content`. Na telefonu jde přesto posouvat celá stránka. Proč?

### --answer--

`overflow-x: auto` funguje jen s `overflow-y: auto`.

#### --why--

Směry jde nastavit zvlášť. Problém je v tom, jak široký obal je.

### --correct--

Obal je široký jako tabulka (`max-content`), takže v něm nic nepřetéká a přetéká celý obal ze stránky.

#### --why--

Posuvník v obalu vznikne jen tehdy, když je obsah širší než obal. S `width: max-content` roste obal s tabulkou. Bez nastavené šířky (`auto`) by obal měl šířku rodiče a tabulka by se posouvala v něm.

### --answer--

Tabulky se posouvat nedají, musí se zmenšit písmo.

#### --why--

Obal s `overflow-x: auto` tabulku posouvat umí. Stačí, aby byl užší než tabulka.

### --see--

css-box-model/preteceni#velikost-podle-obsahu-min-content-max-content-fit-content

## --question--

Karta produktu má obsah široký 320 px. Nahoře v ní je blok `<div class="product__cover">` s `aspect-ratio: 4 / 3`, bez nastavené šířky i výšky a bez textu. Jak vysoký bude (v px)?

### --expected--

240

### --accept--

240 px
240px

### --why--

Blok bez šířky vyplní šířku rodiče, tedy 320 px. Výška zůstala `auto`, takže se dopočítá z poměru stran: 320 ÷ 4 × 3 = 240 px. Kdyby blok měl i pevnou výšku, poměr stran by se ignoroval.

### --see--

css-box-model/preteceni#obrazky-hranice-sirky-pomer-stran-a-object-fit

## --question--

Obrázek produktu má `float: inline-start` a pod článkem je patička s odkazy. Patička obtéká obrázek, místo aby byla pod ním. Napiš deklaraci pro **patičku**, která ji pošle pod plovoucí prvek.

### --expected--

clear: both

### --accept--

clear: inline-start
clear: left

### --why--

`clear` říká, že vedle plovoucích prvků na dané straně box stát nesmí, a posune ho pod ně. Druhá cesta je obalit obrázek i text do rodiče s `display: flow-root`, pak se patička plovoucího prvku vůbec nedotkne.

### --see--

css-box-model/preteceni#float-jen-na-obtekani
