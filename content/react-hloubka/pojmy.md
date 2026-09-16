## --term-- rerender

en: re-render
aliases: rerenderu, rerenderem, rerendery, rerenderů, opakovaný render
lekce: react-hloubka/render-a-rerender#kdyz-se-vykresli-rodic-vykresli-se-i-potomci

Každé další spuštění funkce komponenty po tom prvním. React ho spustí, když se změní stav komponenty nebo když se vykreslil její rodič — props se přitom předem neporovnávají. Rerender sám o sobě nic nezapisuje do stránky.

## --term-- commit

en: commit
aliases: commitu, commitem, fáze commit, fázi commit, fáze commitu
lekce: react-hloubka/render-a-rerender#trigger-render-commit

Fáze, ve které React zapíše rozdíl mezi novým a starým popisem UI do DOMu a hned po ní spustí efekty. Až v commitu vzniknou skutečné prvky, takže až tehdy jsou naplněné refy a dají se měřit rozměry.

## --term-- identita hodnoty

en: referential identity
aliases: identitu hodnoty, identity hodnoty, identitou hodnoty, stabilní identita, stabilní identitu, stabilní identity
lekce: react-hloubka/render-a-rerender#identita-kazdy-render-vyrabi-nove-objekty-a-funkce

To, jestli jde o tentýž objekt v paměti, ne jestli má stejný obsah. Objektový literál, pole i šipková funkce vzniknou při každém renderu znovu, takže mají pokaždé jinou identitu. `memo`, `useMemo`, `useCallback` i závislosti efektu porovnávají přes `Object.is`, tedy identitu.

## --term-- StrictMode

en: StrictMode
aliases: StrictModu, StrictModem
lekce: react-hloubka/render-a-rerender#strictmode-ve-vyvoji-se-render-dela-dvakrat

Obal, který ve vývoji spustí render i reducer dvakrát a každou komponentu po namontování hned odmontuje a namontuje znovu. Je to zkouška čistoty: čistý render a efekt s úklidem ji nepoznají, nečistý kód se prozradí. V produkčním buildu se nic z toho nedeje.

## --term-- závislosti efektu

en: effect dependencies
aliases: závislostí efektu, závislostem efektu, závislostech efektu, závislostmi efektu, seznam závislostí, seznamu závislostí, pole závislostí
lekce: react-hloubka/useeffect-spravne#zavislosti-uplny-seznam-nebo-zastarala-closure

Druhý argument `useEffect` — seznam hodnot z renderu, na kterých efekt stojí. React je mezi rendery porovná přes `Object.is`, a když se některá liší, uklidí po starém efektu a spustí nový. Do seznamu patří **každá** hodnota z renderu, kterou tělo efektu čte.

## --term-- zastaralá closure

en: stale closure
aliases: zastaralé closure, zastaralou closure, zastaralých closures, zastaralá uzávěra
lekce: react-hloubka/useeffect-spravne#zavislosti-uplny-seznam-nebo-zastarala-closure

Funkce, která si drží hodnoty z renderu, ve kterém vznikla, i když už dávno neplatí. V Reactu ji vyrobí neúplné závislosti efektu: efekt se od té doby nespustil znovu, takže vidí starý stav a staré props. Příznak je hodnota zaseknutá na první hodnotě.

## --term-- úklidová funkce

en: cleanup function
aliases: úklidové funkce, úklidovou funkci, úklidovou funkcí, úklid efektu, úklidu efektu
lekce: react-hloubka/useeffect-spravne#uklid-co-po-sobe-efekt-uklidi

Funkce vrácená z těla efektu. React ji zavolá před každým dalším spuštěním téhož efektu a ještě jednou při odmontování komponenty. Vypíná všechno, co efekt zapnul: časovač, posluchače, spojení, observer, rozjeté načítání.

## --term-- ref

en: ref
aliases: refu, refem, refy, refů, refech
lekce: react-hloubka/useref-a-dom#ref-jako-schranka-mimo-render

Schránka s jedinou přihrádkou `current`, kterou `useRef` vytvoří při prvním renderu a která přežije všechny další. Zápis do `current` nevyvolá render, takže se do refu dává jen to, co uživatel nevidí: uzel DOMu, id časovače, předchozí hodnota.

## --term-- vlastní hook

en: custom hook
aliases: vlastního hooku, vlastnímu hooku, vlastním hookem, vlastní hooky, vlastních hooků
lekce: react-hloubka/vlastni-hooky#z-komponenty-do-hooku

Funkce s předponou `use`, která smí volat jiné hooky, a tím si pořídit stav, efekt nebo ref pro komponentu, která ji zavolala. Sdílí logiku, ne data: každé zavolání zakládá vlastní stav v té komponentě, která hook volá.

## --term-- pravidla hooků

en: rules of hooks
aliases: pravidel hooků, pravidly hooků, pravidlům hooků, pravidlech hooků
lekce: react-hloubka/vlastni-hooky#pravidla-hooku-vzdycky-vsechny-a-ve-stejnem-poradi

Dvě pravidla, na kterých stojí to, že si React pamatuje stav podle pořadí volání: hook se volá jen na nejvyšší úrovni (nikdy v podmínce, cyklu, vnořené funkci ani pod `return`) a jen z komponenty nebo z jiného hooku. Porušení hlásí ESLint a za běhu React.

## --term-- reducer

en: reducer
aliases: reduceru, reducerem, reducery, reducerů
lekce: react-hloubka/reducer-a-context#usereducer-akce-jako-jmeno-udalosti

Čistá funkce `(stav, akce) => nový stav`, která drží všechna pravidla změny stavu na jednom místě. Musí vrátit nový objekt — kdyby upravila a vrátila ten starý, React by podle `Object.is` žádnou změnu neviděl.

## --term-- akce

en: action
aliases: akci, akcí, akcemi, akce reduceru, akci reduceru
lekce: react-hloubka/reducer-a-context#usereducer-akce-jako-jmeno-udalosti

Obyčejný objekt, kterým komponenta reduceru oznámí, co se stalo. Zvykem je klíč `typ` (v anglických kódech `type`) a k němu potřebná data. Pojmenovává se podle události („uživatel přepnul skladem"), ne podle zápisu do stavu.

## --term-- kontext

en: context
aliases: kontextu, kontextem, kontexty, kontextů, hodnota kontextu, hodnoty kontextu
lekce: react-hloubka/reducer-a-context#kontext-hodnota-pro-cely-podstrom

Hodnota, kterou si přečte libovolně hluboko zanořená komponenta pod poskytovatelem, aniž by ji komponenty po cestě musely předávat. Čte se hookem `useContext`; bez poskytovatele nad sebou dostane výchozí hodnotu z `createContext`. Při změně hodnoty se překreslí všichni odběratelé, a to i v `memo`.

## --term-- error boundary

en: error boundary
aliases: error boundaries, error boundary komponenta, hranice chyby, hranici chyby
lekce: react-hloubka/chyby-suspense-portaly#error-boundary-zachrana-nad-komponentou

Komponenta (dodnes psaná jako třída), která zachytí výjimku z renderu, z efektu nebo z konstruktoru čehokoli pod sebou a místo spadlého podstromu vykreslí náhradu. Na chyby z obsluh událostí a z asynchronního kódu nesahá.

## --term-- hranice Suspense

en: suspense boundary
aliases: hranici Suspense, hranicí Suspense, Suspense hranice
lekce: react-hloubka/chyby-suspense-portaly#suspense-kdo-ukaze-nacitam

Obal `<Suspense fallback={…}>`, který ukáže náhradu, dokud se některá komponenta pod ním pozastavuje čekáním na data nebo na doručení kódu. Pozastavená komponenta se zatím nevykreslí vůbec.

## --term-- portál

en: portal
aliases: portálu, portálem, portály, portálů
lekce: react-hloubka/chyby-suspense-portaly#portal-v-domu-jinde-ve-stromu-reactu-doma

Vykreslení obsahu do jiného místa v DOMu přes `createPortal(jsx, cíl)`. Ve stromu Reactu obsah zůstává tam, kde je v JSX napsaný, takže kontext, props i probublávání událostí fungují dál podle JSX, ne podle DOMu.

## --term-- odložená hodnota

en: deferred value
aliases: odložené hodnoty, odloženou hodnotu, odložené hodnotě, odloženou hodnotou
lekce: react-hloubka/chyby-suspense-portaly#prechody-usetransition-a-usedeferredvalue

Hodnota z `useDeferredValue`, která se za skutečnou hodnotou opožďuje: při rychlých změnách zůstane u té staré a dožene to, až bude chvilka. Porovnáním `hodnota !== odložená` poznáš, že to, co je na obrazovce, je zatím zastaralé.
