## --term-- aserce

en: assertion
aliases: aserci, asercí, aserce v testu, aserce nad lokátorem
lekce: nastroje-testovani/proc-testovat#prvni-test-v-node-test

Řádek testu, který porovná skutečný výsledek s očekáváním a při rozdílu vyhodí chybu.
Test bez aserce projde vždycky, protože nemá co porovnat. V `node:assert/strict` je to
`equal`, `deepEqual`, `ok`, `match`, `throws` a `rejects`.

## --term-- AAA

en: arrange, act, assert
aliases: vzor AAA, arrange-act-assert, arrange act assert
lekce: nastroje-testovani/proc-testovat#arrange-act-assert

Vzor stavby testu ve třech krocích: **arrange** připraví data, **act** jednou zavolá
testovaný kód a **assert** porovná výsledek s očekáváním. Když se v testu střídá
„proveď, ověř, proveď, ověř", testuje víc chování naráz a po selhání nepoznáš které.

## --term-- unit test

en: unit test
aliases: unit testu, unit testy, unit testů, unit testem, jednotkový test
lekce: nastroje-testovani/proc-testovat#unit-integracni-a-end-to-end-testy

Test jediné funkce nebo modulu, bez sítě, databáze a prohlížeče. Běží v řádu
milisekund a po selhání ukáže přesně na jedno místo, takže se do něj hodí výpočty
a okrajové případy.

## --term-- integrační test

en: integration test
aliases: integrační testy, integračního testu, integračním testem, integračních testů
lekce: nastroje-testovani/proc-testovat#unit-integracni-a-end-to-end-testy

Test, který spustí víc částí dohromady — třeba API s databází nebo komponentu s daty.
Chytá chyby, které unit test vidět nemůže: špatně propojené části a rozejitý formát dat
mezi nimi.

## --term-- end-to-end test

en: end-to-end test
aliases: e2e test, e2e testy, e2e testu, end-to-end testy, end-to-end testu
lekce: nastroje-testovani/proc-testovat#unit-integracni-a-end-to-end-testy

Test, který ovládá celou aplikaci ve skutečném prohlížeči jako zákazník: klikne,
vyplní, přečte. Odhalí i chyby, které vzniknou až složením celku (nenačtený skript,
překrytý prvek, špatná adresa API), zato běží sekundy a po selhání hledáš příčinu
napříč celou aplikací.

## --term-- testovací pyramida

en: test pyramid
aliases: testovací pyramidy, testovací pyramidě, testovací pyramidou
lekce: nastroje-testovani/proc-testovat#pyramida-a-trofej

Doporučení, jak rozdělit počty testů: hodně unit testů dole, méně integračních
uprostřed, pár end-to-end nahoře. Vznikla v době, kdy byly vyšší vrstvy drahé a pomalé.

## --term-- testovací trofej

en: testing trophy
aliases: testovací trofeje, testovací trofejí, testovací trofej podle Dodda
lekce: nastroje-testovani/proc-testovat#pyramida-a-trofej

Novější rozdělení testů, ve kterém je nejširší částí vrstva integračních testů,
protože ve webové aplikaci se nejvíc chyb rodí mezi částmi. Pod ní stojí statická
analýza. S pyramidou se shoduje v hlavním pravidle: testuj na nejnižší úrovni, na které
se daná chyba ještě dá zachytit.

## --term-- statická analýza

en: static analysis
aliases: statické analýzy, statickou analýzu, statickou analýzou
lekce: nastroje-testovani/proc-testovat#pyramida-a-trofej

Kontrola kódu, která ho nemusí spustit — typy (`tsc --noEmit`) a linter. Je ze všech
testů nejlevnější a najde překlepy, špatné typy a nepoužitý kód dřív, než cokoli
pustíš.

## --term-- křehký test

en: brittle test
aliases: křehké testy, křehkého testu, křehkým testem, křehkých testů
lekce: nastroje-testovani/proc-testovat#testuj-chovani-ne-implementaci

Test, který hlídá, **jak** je kód napsaný, místo toho, co vrací. Selže po přejmenování
nebo přesunu, přestože se chování nezměnilo, a naopak projde i nad špatným výsledkem.
Poznáš ho podle toho, že zčervená po refaktoringu, který nic nerozbil.

## --term-- nestabilní test

en: flaky test
aliases: nestabilní testy, nestabilního testu, nestabilním testem, flaky test
lekce: nastroje-testovani/playwright#automaticke-cekani-a-aserce-ktere-pockaji

Test, který jednou projde a jindy ne, aniž by se kód změnil. Skoro vždy za to může
něco, co test neovládá: skutečný čas, rychlost serveru nebo data po jiném testu. Řeší
se čekáním na stav místo na čas a tím, že si každý test připraví vlastní data.

## --term-- vkládání závislostí

en: dependency injection
aliases: vložení závislosti, vloženou závislost, vkládání závislosti, vložená závislost
lekce: nastroje-testovani/mocky-cas-sit#vlozeni-zavislosti-predej-ji-zvenku

Funkce si závislost nevezme sama (`new Date()`, `fetch`), ale dostane ji parametrem.
V aplikaci se předá skutečná, v testu ta, kterou test ovládá. S výchozí hodnotou
parametru (`now = new Date()`) se v aplikaci nemusí změnit jediné volání.

## --term-- mock

en: mock
aliases: mocky, mockování, mock funkce, mocku, mockem, mock funkci
lekce: nastroje-testovani/mocky-cas-sit#mock-funkce-a-speh

Náhrada skutečné závislosti, kterou test ovládá — nejčastěji funkce vyrobená přes
`mock.fn()`, která si zapisuje každé volání a vrací, co jí určíš. Mockuj jen hranice
aplikace (síť, čas, náhodu, e-mail); náhrada vlastní čisté funkce test odstřihne od
kódu, který měl hlídat.

## --term-- špeh

en: spy
aliases: špeha, špehem, špehy
lekce: nastroje-testovani/mocky-cas-sit#mock-funkce-a-speh

Náhrada existující metody, která volání zaznamenává a po konci testu se vrátí zpátky
(`t.mock.method(objekt, 'jméno')`). Na rozdíl od mocku nevyrábí novou funkci, ale
dočasně nahrazuje tu původní.

## --term-- falešné časovače

en: fake timers
aliases: falešných časovačů, falešnými časovači, falešný čas, falešnými hodinami
mdn: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
lekce: nastroje-testovani/mocky-cas-sit#falesne-casovace

Náhrada `setTimeout` a `Date`, u které čas posouvá test sám (`t.mock.timers.enable`,
`tick(ms)`). Díky nim se čekání na 300 ms nebo na tři dny odbyde za milisekundu a
výsledek nezávisí na vytížení počítače. Dokud test nezavolá `tick`, nic naplánovaného
neproběhne.

## --term-- MSW

en: Mock Service Worker
aliases: Mock Service Worker, handler MSW, handlery MSW
lekce: nastroje-testovani/mocky-cas-sit#sit-msw-misto-nahrazeneho-fetch

Knihovna, která zachytí odchozí požadavek až na úrovni sítě, takže kód smí volat
skutečný `fetch`. Ty jen popíšeš obsluhu pro adresu a odpověď — a tentýž popis slouží
testům v Node i vývoji v prohlížeči proti API, které ještě neexistuje.

## --term-- Testing Library

en: Testing Library
aliases: knihovna Testing Library, dotazy Testing Library
lekce: nastroje-testovani/mocky-cas-sit#testing-library-testuj-jako-uzivatel

Rodina knihoven pro testování komponent a stránek, jejíž pravidlo zní: čím víc se test
podobá tomu, jak aplikaci používá člověk, tím víc jistoty dává. Prvky proto hledá podle
role, popisku a textu, ne podle tříd a vnitřního stavu komponenty.

## --term-- lokátor

en: locator
aliases: lokátory, lokátoru, lokátorem, lokátorů, lokátory podle role
mdn: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles
lekce: nastroje-testovani/playwright#lokatory-podle-role-a-popisku

Popis, jak najít prvek na stránce. V Playwrightu se píše podle toho, co vnímá uživatel:
`getByRole`, `getByLabel`, `getByText`, a teprve jako nouzovka `getByTestId`. Lokátor
se nevyhodnocuje ve chvíli zápisu — prvek se hledá až při akci nebo aserci, a proto
umí počkat.

## --term-- strict mode lokátoru

en: strict mode
aliases: strict mode violation, striktní režim lokátoru, strict mode v Playwrightu
lekce: nastroje-testovani/playwright#lokatory-podle-role-a-popisku

Pravidlo Playwrightu, že akce jako `click` nebo `fill` potřebují právě jeden prvek.
Když lokátor sedí na víc prvků, test spadne s `strict mode violation` a počtem
nalezených prvků. Opravuje se zúžením lokátoru (`filter({ hasText: … })`) nebo přesnou
shodou jména (`exact: true`), ne pořadím.

## --term-- pevné čekání

en: hard wait
aliases: pevného čekání, pevným čekáním, pevná pauza, pevnou pauzu
lekce: nastroje-testovani/playwright#proc-ne-waitfortimeout

Čekání na daný počet milisekund (`page.waitForTimeout(2000)`) místo čekání na stav
stránky. Test tím zpomalíš a nestability se stejně nezbavíš, protože na vytíženém
serveru přijde odpověď o chvíli později. Patří jen do ladění.

## --term-- trace

en: trace
aliases: trace viewer, záznam trace, trace z běhu
lekce: nastroje-testovani/playwright#trace-viewer-co-se-stalo-na-ci

Záznam běhu testu, který Playwright pořídí podle nastavení `trace` — snímky stránky
před každou akcí i po ní, síťové požadavky, konzoli a zdroják testu. Otevřeš ho
příkazem `npx playwright show-trace` a projdeš test krok po kroku, i když selhal jen
na serveru CI.
