---
pass: 0.8
---

# --questions--

## --question--

Stojíš v `~/weby/kemp` a chceš se dostat do `~/weby/blog`. Napiš jediný příkaz, který tě tam přesune.

### --expected--

cd ../blog

### --accept--

cd ../blog/
cd ~/weby/blog

### --why--

`..` je nadřazená složka. Ze `kemp` se jím dostaneš do `weby` a odtud rovnou do `blog`.
Absolutní cesta `cd ~/weby/blog` funguje taky, ale je delší a přestane platit, kdyby ses
projekt rozhodl přesunout jinam.

### --see--

start-nastroje/terminal-minimum#relativni-a-absolutni-cesty

## --question--

Ve složce je soubor `.gitignore`, ale `ls` ho nevypíše. Proč?

### --correct--

Soubory začínající tečkou jsou skryté a obyčejný výpis je neukazuje.

#### --why--

Je to zvyk z Unixu: konfigurace se jmenují s tečkou, ať nepřekážejí v běžném výpisu.
Ukáže je `ls -a`.

### --answer--

Protože ho Git schovává, dokud není commitnutý.

#### --why--

Git se souborů v terminálu netýká. `ls` čte složku přímo, bez ohledu na to, co Git ví.

### --answer--

Protože nemá příponu.

#### --why--

Přípona v Unixu nic neznamená, je to jen část jména. Rozhoduje ta tečka na začátku.

### --see--

start-nastroje/terminal-minimum#ls-a-cd-co-tu-je-a-jak-jinam

## --question--

Uděláš `git add index.html`, pak v souboru ještě něco změníš a hned `git commit -m "Oprava"`. Co bude v commitu?

### --correct--

Obsah souboru ve chvíli, kdy jsi dělal `git add` — poslední změna v commitu nebude.

#### --why--

`git add` uloží do staging area **obsah**, ne odkaz na soubor. Proto po každé další úpravě
musíš přidat znovu. Že něco zbylo, pozná `git status` hned po commitu: soubor je zároveň
uložený i změněný.

### --answer--

Celý soubor tak, jak vypadá při commitu.

#### --why--

To by platilo, kdyby `git commit` četl pracovní složku. Ale čte staging area, a v té je
starší verze.

### --answer--

Git commit odmítne, protože se soubor mezitím změnil.

#### --why--

Neodmítne, a právě to je zrádné — commit projde a vypadá hotově.

### --see--

start-nastroje/workshop-prvni-repozitar/005

## --question--

Co udělá `git status` a co `git diff`? Napiš jedním slovem, na co odpovídá `git diff`.

### --expected--

řádky

### --accept--

které řádky
co přesně
změny v řádcích
obsah změn

### --why--

`git status` odpovídá na otázku **které soubory** se změnily, `git diff` na otázku
**které řádky**. Status je přehled, diff je detail — a bez přepínače ukazuje jen to,
co ještě není ve staging area.

### --see--

start-nastroje/workshop-prvni-repozitar/009

## --question--

Co z toho patří do `.gitignore` v projektu s npm?

### --correct--

`node_modules/`

#### --why--

Složka se závislostmi má stovky megabajtů a kdykoli se dá vyrobit znovu z `package.json`.
Do historie by jen přidala váhu a konflikty.

### --answer--

`package.json`

#### --why--

Ten do repozitáře naopak patří — je to jediný zdroj informace, jaké závislosti projekt má.

### --answer--

`index.html`

#### --why--

Zdrojové soubory projektu se verzují vždycky. Kvůli nim celý repozitář existuje.

### --see--

start-nastroje/workshop-prvni-repozitar/010

## --question--

Napiš zprávu commitu, který do stránky přidává patičku s kontaktem. Piš ji tak, jak se zprávy píšou v týmu.

### --expected--

Patička s kontaktem

### --accept--

Přidat patičku s kontaktem
Patička s kontaktními údaji
Kontakt v patičce

### --why--

Zpráva říká, **co commit dělá s projektem**, v přítomném čase a bez „já". Ne „přidal jsem
patičku", ne „oprava", ne „změny". Zpráva se čte v historii měsíce potom, kdy už si
nevzpomeneš, co bylo „oprava2".

### --see--

start-nastroje/workshop-prvni-repozitar/006

## --question--

Web na GitHub Pages běží na `https://milda.github.io/portfolio/`. Stránka odkazuje na `/styles.css` a styly se nenačtou. Napiš cestu, která fungovat bude.

### --expected--

styles.css

### --accept--

./styles.css

### --why--

Lomítko na začátku znamená kořen domény, tedy `https://milda.github.io/styles.css` — mimo
tvůj web, který leží v podsložce `/portfolio/`. Relativní cesta se počítá od stránky a
trefí se lokálně i na Pages.

### --see--

start-nastroje/github-a-pages#relativni-cesty-a-podslozka

## --question--

Kdy je podle lekce o učení s AI v pořádku zeptat se AI na řešení?

### --correct--

Až po vlastním pokusu a hypotéze — a i pak se ptáš na vysvětlení, ne na hotový kód.

#### --why--

Samotné hledání v paměti a formulace hypotézy je to, co učí. Když přijde odpověď dřív,
přeskočí se právě ta část, kvůli které to celé děláš. Užitečná otázka zní „proč moje
verze nefunguje", ne „napiš mi to".

### --answer--

Kdykoli — důležitý je výsledek, ne cesta.

#### --why--

U učení je cesta výsledek. Hotový kód, který nechápeš, ti u dalšího problému nepomůže.

### --answer--

Nikdy, AI se při učení používat nemá.

#### --why--

Má, jen jinak: jako tutor, který vysvětluje a ptá se zpátky. To je jedna z nejrychlejších
cest, jak se dostat přes zaseknutí.

### --see--

start-nastroje/uceni-s-ai#ai-jako-tutor-ne-jako-autor-reseni

## --question--

Proč se Akademie ptá na tvou jistotu **před** tím, než uvidíš správnou odpověď?

### --correct--

Aby změřila kalibraci — rozdíl mezi tím, co si myslíš, že umíš, a co umíš doopravdy.

#### --why--

Odpověď „byl jsem si jistý a spletl jsem se" je nejcennější signál, jaký učení má: přesně
tam máš v hlavě chybný model. Kdyby se jistota ptala až po odhalení odpovědi, odpověděl
bys podle ní, ne podle sebe.

### --answer--

Aby mohla přeskočit otázky, u kterých si jsi jistý.

#### --why--

Nic se nepřeskakuje. Jistota jen ovlivní, jak brzy se ti otázka vrátí v opakování.

### --answer--

Kvůli statistice, na učení to vliv nemá.

#### --why--

Vliv to má zásadní — špatně kalibrovaná jistota je hlavní důvod, proč někdo látku „umí"
a u pohovoru ji nedá.

### --see--

start-nastroje/jak-se-ucit-v-akademii#jistota-a-kalibrace

## --question--

Proč se vyplatí předpovědět výsledek dřív, než kód spustíš?

### --correct--

Protože rozdíl mezi předpovědí a skutečností ukáže přesně to místo, kde máš špatný model.

#### --why--

Když jen spustíš a podíváš se, výsledek vypadá samozřejmě a mozek si nic neopraví.
Předpověď z toho udělá otázku — a překvapení je to, co si zapamatuješ.

### --answer--

Protože spouštění kódu je pomalé.

#### --why--

Rychlost s tím nemá co dělat; běh trvá zlomek vteřiny.

### --answer--

Protože se tím vyhneš chybám v kódu.

#### --why--

Chyby předpověď nevyřeší. Vyřeší to, že o nich budeš vědět dřív, než tě překvapí.

### --see--

start-nastroje/jak-se-ucit-v-akademii#predpoved-pred-spustenim

## --question--

Ve VS Code otevřeš jeden soubor přes Soubor → Otevřít soubor. Co ti přestane fungovat oproti otevření celé složky?

### --correct--

Hledání napříč projektem, integrovaný terminál ve správné složce a nastavení projektu.

#### --why--

VS Code si spoustu věcí váže na otevřenou složku: kde hledat, odkud pustit terminál,
odkud číst `.vscode/settings.json`. S jedním souborem nemá kontext projektu.

### --answer--

Nic, je to jen jiný způsob otevření.

#### --why--

Pro rychlou opravu jednoho souboru ano. Pro práci na projektu ne.

### --answer--

Zvýrazňování syntaxe.

#### --why--

To se řídí příponou souboru a funguje vždycky.

### --see--

start-nastroje/vs-code#slozka-projektu

## --question--

V minulé sekci jsi psal HTML. Který zápis odkazu na e-mail je správně?

### --answer--

`<a href="email:jitka@plotna.cz">`

#### --why--

Schéma se jmenuje jinak — `email:` prohlížeč nezná a odkaz nic neudělá.

### --correct--

`<a href="mailto:jitka@plotna.cz">`

#### --why--

Rozhoduje schéma na začátku adresy, stejné místo, kde jinde stojí `https:`. Za dvojtečkou
jde rovnou adresa, bez lomítek.

### --answer--

`<a href="mailto://jitka@plotna.cz">`

#### --why--

Dvě lomítka patří jen ke schématům, která míří na server. U e-mailu se nepíšou.

### --see--

html-zaklady/jak-funguje-web#url-z-ceho-se-adresa-sklada

## --question--

Taky z minulé sekce: proč se `<div>` nesmí objevit uvnitř `<p>`? Napiš, co s odstavcem prohlížeč udělá.

### --expected--

ukončí ho

### --accept--

předčasně ho ukončí
uzavře ho
rozdělí ho
ukončí odstavec před divem

### --why--

Odstavec smí obsahovat jen text a řádkové prvky. Blokový prvek uvnitř něj parser vyřeší
tím, že odstavec v tom místě ukončí — a ze zbylého `</p>` udělá prázdný odstavec navíc.
V souboru to nevidíš, až v DevTools v panelu Elements.

### --see--

html-zaklady/anatomie-dokumentu#prohlizec-chyby-tise-opravuje

## --question--

Kolegyně ti napíše: „Nejde mi to, můžeš se podívat?" a pošle odkaz na celý repozitář. Co jí podle lekce chybí ve zprávě?

### --correct--

Co čekala, co se stalo místo toho, a minimální příklad, na kterém se to pořád ukáže.

#### --why--

Tyhle tři věci jsou zároveň to, co z tebe udělá dobrého tazatele — a při jejich sepisování
se chyba často najde sama. „Nejde mi to" nedá druhé straně nic, od čeho by se odrazila.

### --answer--

Přesná verze Gitu a operačního systému.

#### --why--

Někdy se hodí, ale je to až doplněk. Bez popisu problému nepomůže.

### --answer--

Nic, odkaz na repozitář stačí.

#### --why--

Ten druhý by musel znovu projít celý projekt a hádat, co se mělo stát.

### --see--

start-nastroje/jak-se-ucit-v-akademii#jak-se-ptat-kdyz-nevis

## --question--

Napiš, co udělá příkaz `git log --oneline` oproti samotnému `git log`.

### --expected--

vypíše commit na jeden řádek

### --accept--

zkrátí výpis na jeden řádek na commit
zkrácený výpis historie
jeden commit na řádek

### --why--

Plný výpis má u každého commitu čtyři řádky (hash, autor, datum, zpráva). `--oneline`
z toho udělá zkrácený hash a zprávu na jednom řádku, takže se na obrazovku vejde i dlouhá
historie.

### --see--

start-nastroje/workshop-prvni-repozitar/007

# --code-- Kolegův zápisník příkazů

## --file-- commands.sh

```sh
# Petrův postup u webu penzionu. Běželo shora dolů.
pwd
ls

git init -b main
git status

git add .
git commit -m "vse"

cp ../upravy/cenik-nova.html cenik.html
git status
git diff

git add cenik.html
cp ../upravy/cenik-oprava.html cenik.html
git commit -m "opravy"

git log --oneline
git status

echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "gitignore"

# Petr se po obědě vrátil a pokračoval.
cp ../upravy/index-kontakt.html index.html
git status
git diff
git add index.html
git commit -m "opravy2"

cp ../upravy/styles-tmavy.html styles.css
git add styles.css
git commit -m "opravy3"

git log --oneline

# Založení vzdáleného repozitáře na GitHubu (adresa z webu GitHubu).
git remote add origin git@github.com:petr/penzion.git
git remote -v
git push -u origin main

git status
git log --oneline
```

## --question--

Petr začal příkazem `git add .` místo výčtu souborů. Co si tím do repozitáře nejspíš zavlekl?

### --correct--

Všechno, co ve složce leželo — včetně systémových souborů a složek, které do historie nepatří.

#### --why--

Tečka znamená „celá aktuální složka". V té chvíli ještě neexistoval `.gitignore`, takže Git
neměl podle čeho cokoli přehlédnout. Jednou zapsaný soubor navíc z historie jednoduše nezmizí —
pozdější `.gitignore` už na něj nezabere.

### --answer--

Nic, `git add .` přidává jen soubory, které Git zná.

#### --why--

Naopak: přidává i ty, které do té doby neznal. To je jeho smysl.

### --answer--

Jen soubory, které se od posledního commitu změnily.

#### --why--

Žádný předchozí commit ještě nebyl, takže „změněné" nedávalo smysl — šlo všechno.

### --see--

start-nastroje/workshop-prvni-repozitar/010

## --question--

Commit „opravy" na řádku 16 nebude obsahovat to, co Petr čekal. Napiš jméno souboru, kterého se to týká.

### --expected--

cenik.html

### --accept--

cenik
cenik.html — je tam starší verze

### --why--

Mezi `git add cenik.html` a `git commit` Petr soubor ještě jednou přepsal. Do staging area
se uloží obsah v okamžiku přidání, takže v commitu je verze `cenik-nova.html`, ne
`cenik-oprava.html`. Pozná se to hned: `git status` po commitu bude soubor hlásit jako změněný.

### --see--

start-nastroje/workshop-prvni-repozitar/005

## --question--

Napiš, jak by měla znít zpráva prvního commitu místo Petrova „vse".

### --expected--

Úvodní stránka penzionu

### --accept--

Základní stránka penzionu
První verze webu penzionu
Kostra webu penzionu

### --why--

Zpráva říká, co commit dělá s projektem, konkrétně a v přítomném čase. „vse", „opravy"
a „gitignore" se v historii za měsíc nedají od sebe odlišit — a přesně tehdy je budeš číst.

### --see--

start-nastroje/workshop-prvni-repozitar/006

## --question--

Řádek 25 přidává `node_modules/` do `.gitignore`. Proč to Petrovi nepomůže, pokud tu složku zapsal už prvním commitem?

### --correct--

`.gitignore` platí jen na soubory, které Git zatím nesleduje — jednou zapsané sleduje dál.

#### --why--

Sledování se zruší příkazem `git rm --cached`, teprve pak se pravidlo uplatní. Proto se
`.gitignore` zakládá **dřív**, než se poprvé přidává obsah.

### --answer--

Pomůže — Git složku od příštího commitu přestane sledovat sám.

#### --why--

Nepřestane. Pravidla se vyhodnocují jen u nesledovaných souborů.

### --answer--

Nepomůže, protože vzor musí být bez lomítka na konci.

#### --why--

Lomítko je správně, říká „celá složka". Problém je v pořadí, ne v zápisu.

### --see--

start-nastroje/workshop-prvni-repozitar/010
