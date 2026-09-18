## --card-- free
Vysvětli, co znamená pojem "halucinace" v kontextu jazykových modelů.
### --expected--
Jde o situaci, kdy si AI vymyslí fakta, funkce nebo balíčky a prezentuje je jako pravdivé, protože text pouze statisticky predikuje.
### --why--
Pochopení tohoto konceptu je základem pro to, abys přestal AI slepě věřit.
### --see--
prace-s-ai/jak-llm-selhava#predikce-dalsiho-tokenu

## --card-- free
Proč AI často navrhuje metody pole, které v JS neexistují, jako např. `clear()`?
### --expected--
Protože na základě četnosti takových metod v jiných jazycích nebo kontextech (jako u Map/Set) AI předpokládá, že existuje i u pole. Hádá nejpravděpodobnější token.
### --why--
Tento omyl vychází z povahy predikce dalšího tokenu.
### --see--
prace-s-ai/jak-llm-selhava#vymyslene-funkce-a-balicky

## --card-- free
Co je to "sokratovský přístup" při učení s AI?
### --expected--
Přístup, kdy AI požádáš, aby ti nedávala hotový kód, ale místo toho ti vysvětlila koncept a položila ti návodnou otázku.
### --why--
Tímto způsobem se učíš a přemýšlíš, místo abys jen tupě kopíroval kód.
### --see--
prace-s-ai/ai-jako-tutor#sokratovsky-tutor

## --card-- free
Vyjmenuj alespoň dvě situace, kdy bys měl jako juniorní vývojář AI (včetně GitHub Copilotu) raději úplně vypnout.
### --expected--
Při řešení cvičných úloh (kdy se snažíš danou věc zapamatovat a "bolí to"), při prvním seznamování s novým konceptem a při přípravě na pohovor.
### --why--
V těchto situacích potřebuješ trénovat vlastní mozek, ne schopnost číst vygenerovaný kód.
### --see--
prace-s-ai/ai-jako-tutor#kdy-ai-radeji-vypnout

## --card-- free
Jaká jsou tři největší bezpečnostní rizika při vložení AI vygenerovaného kódu do produkce?
### --expected--
1. Vložení zranitelnosti (např. SQL injection nebo XSS)
2. Návrh instalace neexistujícího (podvrženého) npm balíčku
3. Únik tvých vlastních API klíčů v případných logovacích zprávách nebo do modelu samotného
### --why--
Jazykové modely nemají zabudovaný bezpečnostní skener, spoléhají se na to, že je zastavíš v code review.
### --see--
prace-s-ai/review-kodu-z-ai#bezpecnost

## --card-- free
Z jakých 4 částí se skládá ideální zadání úkolu pro AI agenta?
### --expected--
Záměr (co chceme dělat), Kontext (ve kterých souborech), Omezení (co nesmí) a Kritéria přijetí (testy, jak poznáme, že je hotovo).
### --why--
Bez těchto mantinelů agent často poškodí nesouvisející části aplikace.
### --see--
prace-s-ai/zadavani-agentovi#dobre-zadani

## --card-- free
Proč bys měl nechat AI agenta pracovat v malých krocích, následovaných tvým commitem?
### --expected--
Aby se daly snadno zkontrolovat diffy a abys věděl, ve kterém bodě se věci pokazily. Kdyby změnil 20 souborů naráz, chybu nenajdeš.
### --why--
Review velkého AI pull requestu je zdlouhavé a často vede k rezignaci a vložení chyb na produkci.
### --see--
prace-s-ai/zadavani-agentovi#male-kroky

## --card-- free
Jaký typ úloh AI typicky opomíjí a řeší tzv. "šťastnou cestu"?
### --expected--
Ignoruje okrajové případy (edge cases) a chybové stavy – například prázdné pole, `null` nebo selhání síťového požadavku.
### --why--
Model se zaměřuje izolovaně na cíl promptu.
### --see--
prace-s-ai/jak-llm-selhava#ignorovani-okrajovych-pripadu

## --card-- free
Co bys měl dělat, když ti AI navrhne npm balíček, o kterém jsi nikdy neslyšel?
### --expected--
Ověřit si na npmjs.com a na GitHubu, jestli balíček vůbec existuje a jestli je bezpečný (udržovaný, počet hvězd).
### --why--
Balíček může být halucinace, nebo ještě hůř, nově zaregistrovaný malware čekající, až se nachytáš.
### --see--
prace-s-ai/review-kodu-z-ai#existuji-zavislosti

## --card-- free
Jaký problém bývá s unit testy, které si necháš vygenerovat od AI pro její vlastní kód?
### --expected--
Často pouze zrcadlí implementaci (testují, že kód dělá to, co dělá) místo toho, aby testovaly byznys požadavky. Tím dávají falešný pocit bezpečí.
### --why--
Pokud AI udělá chybu v logice a pak na ni napíše test, test bude zelený.
### --see--
prace-s-ai/review-kodu-z-ai#testy-testujici-implementaci

## --card-- free
Načti si paměť: Jak bys vložil heslo do promptu pro ChatGPT?
### --expected--
Nikdy! Tajemství, hesla, API klíče a osobní data se nesmí posílat přes AI.
### --why--
Modely mohou data ukládat nebo je dál používat k tréninku, navíc tvé dotazy mohou číst zaměstnanci poskytovatele.
### --see--
prace-s-ai/zadavani-agentovi#co-agentovi-nesverit

## --card-- free
Představ si, že ti AI vygenerovala v JS složitý regulární výraz na parsování URL místo použití třídy URL. Proč bys to měl v code review zamítnout?
### --expected--
Kvůli zbytečné složitosti a horší čitelnosti. Vestavěné funkce prohlížeče/Node jsou spolehlivější.
### --why--
Modely občas komplikují jednoduché věci. Review by mělo hlídat jednoduchost.
### --see--
prace-s-ai/review-kodu-z-ai#zbytecna-slozitost
