## --term-- token modelu

en: token
aliases: tokenu modelu, tokeny modelu, tokenů modelu, tokenech modelu
lekce: prace-s-ai/jak-llm-selhava#1-co-model-vlastne-dela

Nejmenší kousek textu, se kterým jazykový model pracuje — obvykle část slova. Model
neodhaduje další písmeno ani celou větu, ale právě další token.

## --term-- kontextové okno

en: context window
aliases: kontextového okna, kontextovém okně, kontextovým oknem, kontextová okna
lekce: prace-s-ai/jak-llm-selhava#1-co-model-vlastne-dela

Množství textu, které model při generování odpovědi skutečně vidí: tvůj prompt, vložené
soubory a dosavadní konverzace. Co v něm není, pro model neexistuje — ani zbytek tvého
repozitáře.

## --term-- datum uzávěrky

en: knowledge cutoff
aliases: data uzávěrky, datem uzávěrky, uzávěrka trénovacích dat, uzávěrky trénovacích dat
lekce: prace-s-ai/jak-llm-selhava#1-co-model-vlastne-dela

Datum, po kterém už model nemá v trénovacích datech nic. Novější zápis, verzi knihovny
ani změnu v dokumentaci proto nemusí znát, zato dobře zná to, co se psalo roky předtím.

## --term-- halucinace

en: hallucination
aliases: halucinace modelu, halucinací, halucinaci, halucinované, halucinovaný balíček
lekce: prace-s-ai/jak-llm-selhava#2-vymyslene-api-a-vymyslene-balicky

Odpověď, ve které model uvede neexistující fakt, metodu, balíček nebo odkaz a tváří se
u toho stejně jistě jako u pravdy. Vzniká tím, že model text odhaduje, nikde ho neověřuje.

## --term-- slopsquatting

en: slopsquatting
aliases: slopsquattingu, slopsquattingem
lekce: prace-s-ai/jak-llm-selhava#2-vymyslene-api-a-vymyslene-balicky

Útok, při kterém někdo zaregistruje jméno balíčku, které si jazykové modely opakovaně
vymýšlejí, a vloží do něj škodlivý kód. Oběť si ho nainstaluje podle rady modelu.

## --term-- šťastná cesta

en: happy path
aliases: šťastné cesty, šťastnou cestu, šťastná cestě, happy path
lekce: prace-s-ai/jak-llm-selhava#4-stastna-cesta-bez-osetrenych-stavu

Průchod kódem za předpokladu, že všechno dopadne dobře: data dorazí, mají správný tvar
a nic neselže. Generovaný kód obsahuje skoro výhradně ji, protože zadání ostatní stavy
nevyjmenovalo.

## --term-- tichá chyba

en: silent failure
aliases: tiché chyby, tichou chybu, tichých chyb, tiše selže
lekce: prace-s-ai/jak-llm-selhava#4-stastna-cesta-bez-osetrenych-stavu

Chyba, po které program nespadne ani nic nenahlásí, jen vrátí špatný výsledek. Je dražší
než pád, protože se projeví až u zákazníka a nemá stack trace.

## --term-- vždy zelený test

en: vacuous test
aliases: vždy zelené testy, vždy zeleného testu, vždycky zelený test
lekce: prace-s-ai/jak-llm-selhava#5-kod-ktery-vypada-jako-test

Test, který nemůže selhat, protože měří totéž, co implementace dělá, nebo kontroluje jen
typ návratové hodnoty. Dodá jistotu, kterou nemá čím podložit.

## --term-- mutační zkouška

en: mutation testing
aliases: mutační zkoušky, mutační zkouškou, mutační zkoušku
lekce: prace-s-ai/review-kodu-z-ai#4-testy-ktere-nemuzou-selhat

Způsob, jak ověřit hodnotu testu: schválně rozbiješ implementaci (otočíš porovnání,
vrátíš konstantu) a čekáš, že test zčervená. Když zůstane zelený, nic nehlídá.

## --term-- protipříklad

en: counterexample
aliases: protipříkladu, protipříkladem, protipříklady, protipříkladů
lekce: prace-s-ai/review-kodu-z-ai#3-tri-otazky-ktere-najdou-nejvic

Konkrétní vstup, na kterém se kód prokazatelně chová jinak, než má. Je to nejlevnější
důkaz chyby — a zároveň hotový podklad pro test, který se píše před opravou.

## --term-- sokratovský tutor

en: Socratic tutor
aliases: sokratovského tutora, sokratovským tutorem, sokratovský přístup, sokratovského přístupu
lekce: prace-s-ai/ai-jako-tutor#2-sokratovsky-tutor

Role, do které postavíš model, aby místo hotového řešení vysvětlil koncept, ukázal ho na
jiných datech a položil návodnou otázku. Musíš si ji vyžádat, sám od sebe ji nezvolí.

## --term-- systémový prompt

en: system prompt
aliases: systémového promptu, systémovým promptem, vlastní instrukce, vlastních instrukcí
lekce: prace-s-ai/ai-jako-tutor#2-sokratovsky-tutor

Trvalá instrukce, která platí pro všechny tvoje konverzace s modelem, aniž bys ji psal
znovu. Hodí se pro pravidla typu „nedávej mi hotová řešení, dokud o ně nepožádám".

## --term-- našeptávač kódu

en: code completion
aliases: našeptávače kódu, našeptávačem kódu, našeptávač, našeptávače
lekce: prace-s-ai/ai-jako-tutor#5-kdy-nastroj-vypnout

Doplňování kódu v editoru, které nabízí pokračování řádku nebo celé bloky bez vyžádání.
Při opakující se práci šetří čas, při učení bere tu chvíli, kdy si máš vzpomenout.

## --term-- vibe coding

en: vibe coding
aliases: vibe codingu, vibe codingem
lekce: prace-s-ai/zadavani-agentovi#6-kdy-se-agent-nevyplati

Způsob práce, při kterém přijímáš vygenerovaný kód bez čtení a řídíš se jen tím, jestli
to na první pohled funguje. Na prototyp na jeden večer je to v pořádku, na kód, který
budeš udržovat, ne.

## --term-- AI agent

en: AI agent
aliases: AI agenta, AI agentovi, AI agentem, kódovací agent
lekce: prace-s-ai/zadavani-agentovi#1-co-agent-vidi-a-co-ne

Nástroj nad jazykovým modelem, který sám čte a mění soubory v projektu a spouští
příkazy. Od chatu se liší tím, že jeho výstup není návrh k přečtení, ale hotová změna
ke kontrole.

## --term-- kritérium přijetí

en: acceptance criterion
aliases: kritéria přijetí, kritérií přijetí, kritériem přijetí, kritéria přijetí jako testy
lekce: prace-s-ai/zadavani-agentovi#2-dobre-zadani-ma-ctyri-casti

Podmínka, podle které poznáš, že je úkol hotový — nejlépe zapsaná jako konkrétní volání
s konkrétní očekávanou hodnotou, tedy jako spustitelný test.

## --term-- prompt injection

en: prompt injection
aliases: prompt injectionu, prompt injectionem, vložená instrukce
lekce: prace-s-ai/zadavani-agentovi#5-co-agentovi-nesveris

Útok, při kterém je instrukce pro model schovaná v datech, která model čte — v souboru,
issue nebo na stránce. Model nerozlišuje tvoje zadání od textu v kontextu, takže ji
může provést.
