## --card-- free

Jaké tři věci dělá Akademie proto, aby se ti látka udržela v hlavě?

### --back--

**Vybavování z paměti** (odpověz dřív, než se podíváš), **předpověď před spuštěním**
(tipni si výsledek, ať se ukáže rozdíl mezi tvým modelem a skutečností) a **opakování
s odstupem** (fronta Opakování vrací karty po dnech a týdnech).

### --see--

start-nastroje/jak-se-ucit-v-akademii#vybavovani-z-pameti-a-opakovani-s-odstupem

## --card-- free

Co znamená, že máš **špatnou kalibraci**, a proč je to nejcennější informace při učení?

### --back--

Že se rozchází tvoje jistota a tvůj skutečný výkon. „Byl jsem si jistý a spletl jsem se"
ukazuje přesně to místo, kde máš v hlavě chybný model — a takových míst si sám nevšimneš.
Proto se Akademie ptá na jistotu **před** odpovědí, ne po ní.

### --see--

start-nastroje/jak-se-ucit-v-akademii#jistota-a-kalibrace

## --card-- free

Kdy se má u zaseknutí zeptat AI a jak má ta otázka vypadat?

### --back--

Až po vlastním pokusu a hypotéze — jinak si odpověď vezme právě tu část, kvůli které
se učíš. A i pak se ptáš na **vysvětlení**, ne na hotový kód: „proč moje verze vrací
`undefined`" místo „napiš mi funkci, která…". Dobré zadání je sokratovské: ať se AI ptá
zpátky a nechá tě dojít k odpovědi.

### --see--

start-nastroje/uceni-s-ai#ai-jako-tutor-ne-jako-autor-reseni

## --card-- free

Z čeho se skládá dobrá otázka, když se zasekneš a píšeš kolegovi?

### --back--

Co jsi čekal, co se stalo místo toho, co už jsi zkusil — a **minimální příklad**:
co nejkratší kód, na kterém se problém pořád ukáže. Při jeho výrobě se chyba dost často
najde sama, ještě než otázku odešleš.

### --see--

start-nastroje/jak-se-ucit-v-akademii#jak-se-ptat-kdyz-nevis

## --card-- free

Stojíš v `~/weby/kemp`. Co udělají `cd ..`, `cd ../blog` a `cd /`?

### --back--

`cd ..` tě přesune do `~/weby`, `cd ../blog` do `~/weby/blog` (o složku výš a hned jinam)
a `cd /` do kořene celého disku. Kde jsi, kdykoli ověří `pwd`.

### --see--

start-nastroje/terminal-minimum#relativni-a-absolutni-cesty

## --card-- free

Proč `ls` neukáže `.gitignore` a co s tím?

### --back--

Soubory začínající tečkou jsou v Unixu skryté — je to zvyk, ne nastavení. Obyčejný výpis
je vynechá, `ls -a` je ukáže. Proto se tak jmenuje skoro každá konfigurace: `.gitignore`,
`.env`, `.vscode`.

### --see--

start-nastroje/terminal-minimum#ls-a-cd-co-tu-je-a-jak-jinam

## --card-- free

Co je staging area a proč Git neukládá rovnou celou složku?

### --back--

Seznam změn, které půjdou do příštího commitu. Umožňuje z rozdělané práce uložit jen to,
co spolu souvisí — commit je pak jedna srozumitelná změna, která jde sama o sobě vrátit.
Bez něj by každý commit byl směs všeho, cos ten den dělal.

### --see--

start-nastroje/workshop-prvni-repozitar/005

## --card-- free

`git add soubor.html`, pak soubor ještě jednou změníš a uděláš `git commit`. Co je v commitu?

### --back--

Verze **z okamžiku, kdy jsi dělal `git add`**. Do staging area se ukládá obsah, ne odkaz
na soubor, takže poslední úprava v commitu nebude. Pozná se to hned: `git status` po
commitu soubor pořád hlásí jako změněný.

### --see--

start-nastroje/workshop-prvni-repozitar/005

## --card-- free

Čím se liší `git status` a `git diff`?

### --back--

`git status` odpovídá na otázku **které soubory** (nové, změněné, připravené ke commitu),
`git diff` na otázku **které řádky** (odebrané s minusem, přidané s plusem). Status je
přehled, diff detail. `git diff` bez přepínače navíc nezahrnuje to, co je už ve staging
area — na to je `git diff --staged`.

### --see--

start-nastroje/workshop-prvni-repozitar/009

## --card-- free

Jak se píše zpráva commitu? Uveď dobrý a špatný příklad.

### --back--

Říká, **co commit dělá s projektem**, v přítomném čase a bez „já". Dobře: „Patička
s kontaktem", „Ignorovat systémové soubory". Špatně: „přidal jsem patičku", „oprava",
„změny", „hotovo". Zprávy se čtou měsíce potom, kdy už si nevzpomeneš, co bylo „oprava2".

### --see--

start-nastroje/workshop-prvni-repozitar/006

## --card-- free

K čemu je `.gitignore`, proč se commituje a proč nepomůže na už sledovaný soubor?

### --back--

Je to seznam vzorů, které má Git přehlížet. Commituje se, aby platil pro celý tým, ne jen
pro tvůj disk. Na soubor, který už Git jednou zapsal, ale nezabere — sledování se ruší
příkazem `git rm --cached`. Proto se `.gitignore` zakládá **dřív**, než se poprvé přidává
obsah.

### --see--

start-nastroje/workshop-prvni-repozitar/010

## --card-- free

Co je vzdálený repozitář a co znamená `origin`?

### --back--

Kopie repozitáře na serveru (typicky GitHub), se kterou si ta tvoje vyměňuje commity.
`origin` je jen **jméno**, které té kopii dáš, aby ses na ni nemusel odkazovat celou
adresou. Zvykem je právě `origin`, ale může se jmenovat jakkoli.

### --see--

start-nastroje/workshop-prvni-repozitar/014

## --card-- free

Co jsou GitHub Pages, co na nich poběží a co ne?

### --back--

Hosting statických stránek přímo z repozitáře. Poběží HTML, CSS, JavaScript v prohlížeči
a obrázky. Nepoběží nic, co potřebuje server: PHP, Node, databáze, ověřování hesel. Nová
verze se publikuje **pushnutím** do sledované větve.

### --see--

start-nastroje/github-a-pages#co-jsou-github-pages

## --card-- free

Web funguje lokálně, na GitHub Pages se načte bez stylů. Co je skoro vždycky příčina?

### --back--

Cesta začínající lomítkem. Lokálně je stránka v kořeni, na Pages v podsložce
`/<repozitar>/` — a `/styles.css` míří do kořene domény, kde tvůj web není. Uvnitř
projektu se proto píšou relativní cesty (`styles.css`, `../img/foto.jpg`).

### --see--

start-nastroje/github-a-pages#relativni-cesty-a-podslozka

## --card-- free

Uživatel `tereza-d` má repozitář `kolo-blog` se zapnutými Pages. Na jaké adrese web běží? A kdy je adresa jiná?

### --back--

`https://tereza-d.github.io/kolo-blog/`. Jiná je jen u repozitáře pojmenovaného přesně
`tereza-d.github.io` — ten se publikuje v kořeni, tedy na `https://tereza-d.github.io/`.

### --see--

start-nastroje/github-a-pages#adresa-na-ktere-web-pobezi

## --card-- free

Proč se ve VS Code otevírá celá složka projektu, a ne jednotlivé soubory?

### --back--

Editor si na otevřenou složku váže kontext: hledání napříč projektem, integrovaný terminál
ve správné složce, nastavení z `.vscode/`, a u projektů s nástroji i lint a formátování.
S jedním otevřeným souborem nic z toho nemá podle čeho fungovat.

### --see--

start-nastroje/vs-code#slozka-projektu

## --card-- free

Co ti přinese formátování při uložení a co to udělá s historií v Gitu?

### --back--

Odsazení, uvozovky a mezery srovná podle jednoho pravidla, takže o formátu přestaneš
přemýšlet. V Gitu tím zmizí commity, ve kterých se změnilo jen odsazení — a diff pak
ukazuje skutečné změny, ne přeformátovaný soubor.

### --see--

start-nastroje/vs-code#formatovani-pri-ulozeni
