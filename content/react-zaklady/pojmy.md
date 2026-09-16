## --term-- komponenta

en: component
aliases: komponenty, komponentu, komponentě, komponentou, komponent, komponentám, komponentami
lekce: react-zaklady/proc-react#komponenta-je-funkce-ktera-vraci-jsx

Funkce, která vrací značkování (JSX). Jméno začíná velkým písmenem a používá se jako značka: `<MovieList />`. Velká stránka je strom komponent.

## --term-- JSX

en: JSX
aliases: JSX výraz, v JSX
lekce: react-zaklady/proc-react#jsx-znackovani-jako-vyraz

Zápis značkování uvnitř JavaScriptu, který se před spuštěním přeloží na volání funkce. Je to výraz, takže se dá uložit do proměnné i vrátit z funkce; ve složených závorkách `{}` v něm můžou být další výrazy.

## --term-- fragment

en: fragment
aliases: fragmentu, fragmentem, fragmenty
lekce: react-zaklady/proc-react#dva-prvky-vedle-sebe-bez-obalu

Prázdný obal `<>…</>`, kterým komponenta vrátí víc prvků vedle sebe, aniž by do stránky přidala další prvek. Když potřebuje `key`, píše se v dlouhém tvaru `<Fragment key={id}>`.

## --term-- kompozice komponent

en: composition
aliases: kompozici komponent, kompozicí komponent
lekce: react-zaklady/proc-react#komponenta-je-funkce-ktera-vraci-jsx

Skládání stránky z menších komponent místo jedné velké. Obecná komponenta dostane konkrétní obsah přes `children` nebo props, takže se dá použít na víc místech.

## --term-- render

en: render
aliases: renderu, renderem, rendery, renderů, vykreslení komponenty
lekce: react-zaklady/proc-react#jak-react-vykresli-stranku

Zavolání komponent, ze kterého vznikne popis stránky. Sám o sobě v DOM nic nemění — rozdíly proti předchozímu popisu React zapíše až v commitu.

## --term-- props

en: props
aliases: propsy, propsů, propsům, props objekt
lekce: react-zaklady/komponenty-a-props#props-jsou-parametry-komponenty

Objekt s daty, který komponenta dostane od rodiče jako svůj jediný parametr. Zapisují se jako atributy (`<Price value={249} />`) a komponenta je nesmí měnit.

## --term-- children

en: children
aliases: children prop
lekce: react-zaklady/komponenty-a-props#children-obsah-mezi-znackami

Zvláštní prop s obsahem, který rodič napsal mezi otevírací a uzavírací značku komponenty. Díky němu jde napsat obal (kartu, panel), který nic neví o tom, co bude vevnitř.

## --term-- key

en: key
aliases: key položky, keys
lekce: react-zaklady/komponenty-a-props#seznam-z-pole-a-key

Identifikátor položky v seznamu vykresleném z pole. React podle něj pozná, která položka je která, když se pole změní. Musí být stabilní a jedinečný mezi sousedy — proto ne index.

## --term-- stav

en: state
aliases: stavu, stavem, stavy, stavů, stav komponenty
lekce: react-zaklady/stav-jako-snimek#stav-v-usestate

Hodnota, kterou si komponenta pamatuje mezi rendery a jejíž změna vyvolá nový render. Zakládá se hookem `useState` a mění se jen přes jeho set funkci.

## --term-- snímek renderu

en: snapshot
aliases: snímek, snímku renderu, snímkem renderu
lekce: react-zaklady/stav-jako-snimek#stav-je-snimek-renderu

Hodnoty stavu a props tak, jak platily v jednom konkrétním renderu. V obsluze události zůstávají po celou dobu stejné, i když jsi stav už přepsal — nová hodnota platí až v příštím renderu.

## --term-- funkce aktualizace

en: updater function
aliases: funkci aktualizace, funkcí aktualizace, aktualizační funkce
lekce: react-zaklady/stav-jako-snimek#funkce-aktualizace

Zápis `setCount((current) => current + 1)`, kdy set funkci předáš funkci místo hodnoty. React ji zavolá s posledním stavem ve frontě, takže několik změn v jedné obsluze na sebe navazuje.

## --term-- dávkování

en: batching
aliases: dávkuje, dávkování změn, dávkovaně
lekce: react-zaklady/stav-jako-snimek#davkovani-nekolik-zmen-jeden-render

Sloučení všech změn stavu z jedné obsluhy události do jednoho renderu. Proto se stránka nepřekresluje po každém volání set funkce zvlášť.

## --term-- odvozená hodnota

en: derived value
aliases: odvozené hodnoty, odvozenou hodnotu, odvozená data
lekce: react-zaklady/stav-jako-snimek#odvozena-hodnota-misto-stavu

Hodnota spočítaná při renderu z jiného stavu nebo props (součet, filtrovaný seznam, počet). Nepatří do stavu — druhý zdroj pravdy by se s prvním rozešel.

## --term-- řízené pole

en: controlled input
aliases: řízená pole, řízeného pole, řízeným polem, řízené formulářové pole
lekce: react-zaklady/udalosti-a-formulare#rizene-pole

Formulářové pole, jehož `value` přichází ze stavu a každá změna jde přes `onChange` zpátky do stavu. Stav je pak jediný zdroj pravdy o tom, co je v poli napsané.

## --term-- zvednutí stavu

en: lifting state up
aliases: zvednout stav, zvednutí stavu nahoru, zvednutého stavu
lekce: react-zaklady/udalosti-a-formulare#zvednuti-stavu

Přesun stavu do nejbližšího společného rodiče komponent, které ho potřebují. Rodič ho posílá dolů v props spolu s funkcí, kterou ho potomek změní.

## --term-- hook

en: hook
aliases: hooku, hooky, hooků, hookem, hookům
lekce: react-zaklady/stav-jako-snimek#stav-v-usestate

Funkce Reactu, která komponentě půjčuje jeho schopnosti — paměť mezi rendery, kontext, referenci. Pozná se podle předpony `use` a volá se vždy nahoře v těle komponenty, nikdy v podmínce ani v cyklu.
