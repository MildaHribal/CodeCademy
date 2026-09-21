## --term-- vstupní bod

en: entry point
aliases: vstupního bodu, vstupním bodem, entry point, vstupní body
lekce: nastroje-cizi-kod/orientace-v-cizim-kodu#2-nakresli-si-hrubou-mapu

Soubor, kterým aplikace začíná a od kterého se odvíjí všechno ostatní — `src/main.js`
u frontendu, `server.js` u backendu. V cizím repozitáři je to první místo, od kterého
se dá rozmotat zbytek.

## --term-- konvence projektu

en: project conventions
aliases: konvencí projektu, konvence, konvencím projektu
lekce: nastroje-cizi-kod/orientace-v-cizim-kodu#5-konvence-projektu-jsou-soucast-zadani

Dohodnutý způsob, jak se v projektu píší věci, které by šly napsat víc způsoby: kde se
hlásí chyby, odkud se čtou data, jak se jmenují testy. Část je psaná v `CONTRIBUTING.md`,
zbytek se vyčte z existujícího kódu.

## --term-- CONTRIBUTING.md

en: CONTRIBUTING.md
aliases: contributing, soubor CONTRIBUTING
lekce: nastroje-cizi-kod/orientace-v-cizim-kodu#5-konvence-projektu-jsou-soucast-zadani

Soubor v kořeni repozitáře s pravidly pro přispěvatele: jak se pojmenovávají větve,
jaký je formát commitů, co musí obsahovat pull request. Čte se **před** prvním commitem,
ne po prvním zamítnutém review.

## --term-- charakterizační test

en: characterization test
aliases: charakterizačním testem, charakterizační testy, characterization test, charakterizačního testu
lekce: nastroje-cizi-kod/orientace-v-cizim-kodu#6-bezpecna-zmena-charakterizacni-test

Test, který nepopisuje, jak se má kód chovat, ale **jak se chová teď** — i když je to
možná chyba. Slouží jako záchytná síť při změnách v kódu, kterému ještě nerozumíš:
každý test, který po změně zčervená, ukazuje přesně to, co se změnilo.

## --term-- regrese

en: regression
aliases: regresi, regrese v kódu, regresní chyba
lekce: nastroje-cizi-kod/orientace-v-cizim-kodu#6-bezpecna-zmena-charakterizacni-test

Nechtěné rozbití něčeho, co dřív fungovalo. Typicky vznikne při opravě jiné chyby nebo
při refaktoru; odhalí ji buď test, nebo uživatel.

## --term-- git blame

en: git blame
aliases: blame, přiřazení autora řádku
lekce: nastroje-cizi-kod/orientace-v-cizim-kodu#4-zeptej-se-historie

Příkaz, který u každého řádku souboru ukáže, kdo a kterým commitem ho naposledy změnil.
Slouží k nalezení důvodu — zpráva commitu a navázané issue vysvětlí kód, který sám
o sobě nedává smysl.

## --term-- pickaxe

en: pickaxe
aliases: git log -S, hledání krumpáčem
lekce: nastroje-cizi-kod/orientace-v-cizim-kodu#4-zeptej-se-historie

Přepínač `-S` u `git log`: najde commity, ve kterých se změnil počet výskytů zadaného
textu — tedy kde se řetězec přidal nebo zmizel. Nejrychlejší způsob, jak najít historii
konkrétní funkce nebo konstanty.

## --term-- reprodukce chyby

en: reproduction
aliases: reprodukovat chybu, reprodukci, kroky k reprodukci, steps to reproduce
lekce: nastroje-cizi-kod/od-issue-k-pr#1-reprodukuj-nez-zacnes-opravovat

Zopakování nahlášené chyby na vlastním stroji. Je to měřítko celé opravy: bez ní neumíš
rozlišit „opraveno" od „teď to zrovna nespadlo".

## --term-- pull request

en: pull request
aliases: PR, pull requestu, pull requestem, pull requesty, merge request
lekce: nastroje-cizi-kod/od-issue-k-pr#5-otevri-pull-request-ze-ktereho-je-videt-proc

Žádost o začlenění větve do hlavní větve, spojená s místem pro diskuzi nad změnou.
Kromě kódu ho tvoří popis: co se mění, proč, a jak si to reviewer ověří.

## --term-- draft pull request

en: draft pull request
aliases: draft PR, koncept pull requestu, rozpracovaný PR
lekce: nastroje-cizi-kod/od-issue-k-pr#5-otevri-pull-request-ze-ktereho-je-videt-proc

Pull request označený jako rozpracovaný. Nejde ho začlenit a automaticky nikoho nežádá
o review — slouží k tomu ukázat směr a včas dostat zpětnou vazbu na architekturu.

## --term-- konvenční commity

en: conventional commits
aliases: conventional commits, konvenčních commitů, formát commitu
lekce: nastroje-cizi-kod/od-issue-k-pr#4-rozdel-praci-do-commitu-ktere-davaji-smysl

Dohoda o zprávách commitů ve tvaru `typ: popis` — `feat:`, `fix:`, `test:`, `chore:`,
`docs:`. Umožňuje z historie automaticky sestavit seznam změn a na první pohled poznat,
o jaký druh změny šlo.

## --term-- code review

en: code review
aliases: code-review, revize kódu, review, kontrola kódu
lekce: nastroje-cizi-kod/code-review#1-co-hlidat-a-co-nechat-strojum

Čtení cizí změny před jejím začleněním do hlavní větve. Nejlevnější místo, kde jde chybu
zachytit — reviewer hlídá správnost, architekturu, čitelnost, testy a bezpečnost, kdežto
styl a formátování patří lintru.

## --term-- nitpick

en: nitpick
aliases: nit, nit komentář, hnidopišský komentář
lekce: nastroje-cizi-kod/code-review#2-jak-napsat-komentar-ktery-se-da-prijmout

Drobná připomínka v review, která nemá blokovat začlenění — překlep v komentáři, lepší
název. Píše se s předponou `nit:`, aby autor hned věděl, že si může vybrat.

## --term-- LGTM

en: looks good to me
aliases: looks good to me, lgtm
lekce: nastroje-cizi-kod/code-review#4-velikost-pull-requestu-rozhoduje-o-kvalite-review

Zkratka „vypadá to dobře" pod schváleným pull requestem. U velkých změn bývá spíš
příznakem než pochvalou: reviewer diff nepřečetl, jen proscrolloval.

## --term-- odhad v rozsahu

en: range estimate
aliases: odhad rozsahem, odhadovat v rozsahu, rozsahový odhad
lekce: nastroje-cizi-kod/odhad-a-komunikace#2-odhaduj-v-rozsahu-a-s-duvodem

Odhad zapsaný jako interval s pojmenovanou neznámou („den až tři dny, podle toho, jestli
má to API starý formát ID") místo jednoho čísla. Nese informaci o riziku, se kterou se
dá plánovat.

## --term-- timebox

en: timebox
aliases: timeboxem, timeboxing, timeboxu, časový limit na zaseknutí
lekce: nastroje-cizi-kod/odhad-a-komunikace#3-timebox-kdy-prestat-bojovat-sam

Předem daný čas (typicky 30–60 minut), po kterém se přestaneš na problému trápit sám
a jdeš se zeptat. Chrání před propálením celého dne i před tím, abys kolegy vyrušoval
po pěti minutách.

## --term-- rubber duck debugging

en: rubber duck debugging
aliases: gumová kachnička, kachničkování, vysvětlování kachničce
lekce: nastroje-cizi-kod/odhad-a-komunikace#3-timebox-kdy-prestat-bojovat-sam

Postup, kdy problém nahlas a do detailu vysvětlíš — komukoli, klidně gumové kachničce.
Formulace domněnek slovy odhalí mezeru v úvaze dřív, než stihne někdo odpovědět.

## --term-- asynchronní komunikace

en: asynchronous communication
aliases: asynchronní komunikaci, asynchronně, async komunikace
lekce: nastroje-cizi-kod/odhad-a-komunikace#4-asynchronni-komunikace-cely-kontext-v-prvni-zprave

Psaní, u kterého se neočekává okamžitá odpověď (chat, komentář, issue). Každá výměna
stojí čekání, takže platí pravidlo: celý kontext, otázku i to, co jsi už zkusil, dej do
**první** zprávy.

## --term-- standup

en: standup
aliases: standupu, denní standup, daily
lekce: nastroje-cizi-kod/odhad-a-komunikace#4-asynchronni-komunikace-cely-kontext-v-prvni-zprave

Krátké denní shrnutí ve třech bodech: co jsem dokončil, co dělám dnes, co mě blokuje.
Nejdůležitější je ten třetí — kvůli blokacím se standup koná.

## --term-- definition of done

en: definition of done
aliases: DoD, definition-of-done, hotovo, dohoda o hotovosti
lekce: nastroje-cizi-kod/odhad-a-komunikace#5-definition-of-done-dohodni-si-co-znamena-hotovo

Seznam podmínek, které musí splnit každý úkol, aby se dal prohlásit za dokončený —
review, zelené CI, nasazení na testovací prostředí, dokumentace. Dohodnout se na něm
předem stojí minutu, zjišťovat ho na konci stojí den.
