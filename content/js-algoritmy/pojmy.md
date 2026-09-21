## --term-- časová složitost

en: time complexity
aliases: časové složitosti, časovou složitost, časovou složitostí
lekce: js-algoritmy/big-o#pocitame-kroky-ne-sekundy

Odhad, kolikrát víc kroků udělá algoritmus, když vstup vzroste. Nepočítá sekundy, ale kroky v závislosti na počtu položek `N`.

## --term-- prostorová složitost

en: space complexity
aliases: prostorové složitosti, prostorovou složitost, prostorovou složitostí, paměťová složitost
lekce: js-algoritmy/big-o#prostorova-slozitost

Odhad, kolik paměti navíc si algoritmus vyrobí kromě vstupu. Pomocná mapa nad celým polem je `O(N)`, dva ukazatele jsou `O(1)`.

## --term-- notace velkého O

en: Big O notation
aliases: notaci velkého O, notace velkeho O, velké O, big O, O notace
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Big_O_notation
lekce: js-algoritmy/big-o#pocitame-kroky-ne-sekundy

Zápis `O(…)`, který popisuje růst počtu kroků vůči velikosti vstupu. Zahazuje konstanty i pomalejší členy, takže `3N + 20` je `O(N)`.

## --term-- dominantní člen

en: dominant term
aliases: dominantního členu, dominantním členem
lekce: js-algoritmy/big-o#pocitame-kroky-ne-sekundy

Ta část výpočtu kroků, která při velkém `N` přeroste všechny ostatní. V `N² + 100N` je dominantní `N²`, proto se zbytek v zápisu `O(…)` zahodí.

## --term-- lineární složitost

en: linear time
aliases: lineární složitosti, lineárně
lekce: js-algoritmy/big-o#nejcastejsi-tridy-slozitosti

Složitost `O(N)`: dvojnásobek dat znamená dvojnásobek kroků. Typicky jeden průchod polem — `map`, `filter`, `for…of`.

## --term-- kvadratická složitost

en: quadratic time
aliases: kvadratické složitosti, kvadratickou složitost, kvadraticky
lekce: js-algoritmy/big-o#nejcastejsi-tridy-slozitosti

Složitost `O(N²)`: dvojnásobek dat znamená čtyřikrát víc kroků. Vzniká dvěma vnořenými průchody nad týmiž daty, často skrytě uvnitř `filter` nebo `map`.

## --term-- logaritmická složitost

en: logarithmic time
aliases: logaritmické složitosti, logaritmicky
lekce: js-algoritmy/big-o#nejcastejsi-tridy-slozitosti

Složitost `O(log N)`: každý krok zahodí polovinu zbývajících dat. Milion položek se tak vyřídí zhruba dvaceti kroky.

## --term-- nejhorší případ

en: worst case
aliases: nejhoršího případu, nejhorším případě, nejhorším případu
lekce: js-algoritmy/big-o#nejcastejsi-tridy-slozitosti

Vstup, na kterém algoritmus udělá nejvíc kroků — u hledání v poli položka na konci nebo chybějící. Zápis `O(…)` se standardně uvádí právě pro něj.

## --term-- klouzavé okno

en: sliding window
aliases: klouzavého okna, klouzavým oknem, klouzavé okénko
lekce: js-algoritmy/big-o#z-kvadratu-na-linearni-pruchod

Vzor, kde místo počítání každého úseku znovu posouváš hranice jednoho úseku a výsledek jen upravuješ o položku, která přibyla a která vypadla.

## --term-- hrubá síla

en: brute force
aliases: hrubou silou, hrubé síly, hrubou sílu
lekce: js-algoritmy/postup-reseni#nejdriv-hruba-sila-pak-zlepseni

Řešení, které vyzkouší všechny možnosti. Bývá pomalé, ale píše se za minutu a slouží jako jistota, jaká je správná odpověď.

## --term-- dva ukazatele

en: two pointers
aliases: dvou ukazatelů, dvěma ukazateli, dva ukazatele na koncích
lekce: js-algoritmy/postup-reseni#nejdriv-hruba-sila-pak-zlepseni

Vzor nad seřazeným polem: jeden index na začátku, druhý na konci, a podle výsledku porovnání se posune ten správný. Z `O(N²)` dvojic udělá jeden průchod.

## --term-- lineární vyhledávání

en: linear search
aliases: lineárního vyhledávání, lineárním vyhledáváním
lekce: js-algoritmy/datove-struktury#hledani-v-poli-je-pomale

Hledání položku po položce od začátku pole. Přesně to dělají `includes`, `indexOf` a `find` — v nejhorším případě projdou celé pole.

## --term-- hashovací tabulka

en: hash table
aliases: hashovací tabulky, hashovací tabulce, hashovací tabulkou
lekce: js-algoritmy/datove-struktury#map-klic-a-hodnota-s-rychlym-hledanim

Struktura, která z klíče spočítá adresu a hodnotu uloží rovnou tam. Na tomhle principu stojí `Map`, `Set` i obyčejný objekt, proto je hledání podle klíče `O(1)`.

## --term-- frekvenční mapa

en: frequency map
aliases: frekvenční mapy, frekvenční mapě, frekvenční mapou, mapa četností
lekce: js-algoritmy/datove-struktury#frekvencni-mapa-nejcastejsi-vzor-z-pohovoru

Mapa, kde klíč je hodnota z dat a hodnota je počet jejích výskytů. Jedním průchodem odpoví na „co se opakuje", „co je nejčastější" i „jsou to přesmyčky".

## --term-- deduplikace

en: deduplication
aliases: deduplikaci, deduplikace dat, odstranění duplicit
lekce: js-algoritmy/datove-struktury#set-jen-unikatni-hodnoty

Odstranění opakovaných hodnot ze seznamu. U primitivních hodnot stačí `[...new Set(values)]`, u objektů je potřeba klíč, podle kterého se shoda pozná.

## --term-- binární vyhledávání

en: binary search
aliases: binárního vyhledávání, binárním vyhledáváním, půlení intervalu
lekce: js-algoritmy/razeni-a-rekurze#binarni-vyhledavani-v-serazenem-poli

Hledání v seřazeném poli, které se pokaždé podívá doprostřed zbývajícího úseku a polovinu zahodí. Má složitost `O(log N)` a bez seřazených dat nefunguje.

## --term-- řazení na místě

en: in-place sort
aliases: řazení na miste, řadí na místě, na místě
lekce: js-algoritmy/razeni-a-rekurze#razeni-porovnavaci-funkci

Řazení, které přerovná přímo vstupní pole a vrátí ho. Tohle dělá `sort`; kopii vrací `toSorted`.

## --term-- rekurzivní krok

en: recursive case
aliases: rekurzivního kroku, rekurzivním krokem
lekce: js-algoritmy/razeni-a-rekurze#rekurze-zakladni-pripad-a-krok

Ta větev rekurzivní funkce, která problém zmenší a zavolá sama sebe. Musí se vždy blížit k základnímu případu, jinak dojde zásobník.

## --term-- rozděl a panuj

en: divide and conquer
aliases: rozděl a panuj přístup, rozdělit a panovat
lekce: js-algoritmy/razeni-a-rekurze#rozdel-a-panuj-merge-sort

Postup, který úlohu rozdělí na dvě menší stejného druhu, vyřeší je rekurzivně a výsledky spojí dohromady. Takhle pracuje merge sort.
