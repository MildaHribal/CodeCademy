---
title: "Kvíz: práce s AI"
---
</--solution-->
<--question-->
Co je nejčastější příčinou toho, že AI navrhne neexistující metodu pole (např. `array.clear()`)?

### --answer--
Jazykový model používá starou verzi Node.js, kde metoda existovala.
#### --why--
Ne, v JS metoda `clear` na polích nikdy nebyla (bývá na Set/Map).

### --correct--
Jazykový model predikuje další slovo na základě četnosti v jiných jazycích nebo kontextech a logicky předpokládá, že taková metoda existuje.
#### --why--
LLM nerozumí logice, jen hádá nejpravděpodobnější token, a "clear" dává statisticky smysl.

### --see--
prace-s-ai/jak-llm-selhava#predikce-dalsiho-tokenu
</--question-->

<--question-->
Proč je nebezpečné nechat agenta měnit kód rovnou v 10 souborech, aniž bys dělal po každém kroku commit?

### --answer--
Agent ztratí kontext a zapomene, co dělal.
#### --why--
Sice se to může stát, ale hlavní problém je na tvé straně při kontrole kódu.

### --correct--
Změny v 10 souborech najednou nejdou efektivně zkontrolovat v diffu a pokud něco přestane fungovat, nezjistíš, který krok to rozbil.
#### --why--
Malé kroky s commity ti umožňují přesně sledovat, jaká změna co způsobila.

### --see--
prace-s-ai/zadavani-agentovi#male-kroky
</--question-->

<--question-->
Jaký postup je nejlepší, když ti aplikace hodí neznámou chybovou hlášku a chceš se ji naučit řešit pomocí AI?

### --answer--
Vložit hlášku do AI a zkopírovat první blok kódu, který nabídne, do projektu.
#### --why--
Tím sice můžeš (možná) chybu opravit, ale nic ses nenaučil.

### --correct--
Požádat AI, aby fungovalo jako tutor: "Dostávám tuto chybu, nevylešuj to za mě, ale vysvětli mi, proč nastala a polož mi návodnou otázku."
#### --why--
Tzv. sokratovský přístup tě nutí přemýšlet.

### --see--
prace-s-ai/ai-jako-tutor#sokratovsky-tutor
</--question-->

<--question-->
Které z následujících věcí bys **NIKDY** neměl zadávat do chatu nebo AI agentovi?

### --answer--
Kousky zdrojového kódu aplikace.
#### --why--
Zdrojový kód (pokud není extrémně tajný nebo chráněný NDA) běžně agentům poskytujeme pro kontext.

### --correct--
Produkční API klíče, hesla nebo reálná osobní data uživatelů z databáze.
#### --why--
Tato data se posílají přes internet na servery třetích stran, kde mohou uvíznout v logu nebo trénovacích datech.

### --see--
prace-s-ai/zadavani-agentovi#co-agentovi-nesverit
</--question-->

<--question-->
Co je "šťastná cesta" (happy path) při generování kódu a proč to může být problém?

### --answer--
Šťastná cesta znamená, že se kód rychle spouští.
#### --why--
To nemá s rychlostí spouštění nic společného.

### --correct--
Je to předpoklad, že všechny vstupy budou správné a nic neselže (např. API nevrátí 500, uživatel zadá správný e-mail). AI tyto chybové stavy ráda ignoruje.
#### --why--
LLM šetří tokeny a řeší primární problém zadaný v promptu izolovaně od chybových stavů.

### --see--
prace-s-ai/jak-llm-selhava#ignorovani-okrajovych-pripadu
</--question-->

<--question-->
Co je hlavní hrozba, když ti AI navrhne neexistující balíček (např. `npm install react-fast-auth`)?

### --answer--
Aplikace nepůjde zkompilovat.
#### --why--
To je ta lepší varianta. Existuje tu mnohem větší bezpečnostní riziko.

### --correct--
Útočník může takto vymyšlené jméno sledovat, balíček zaregistrovat a vložit do něj malware, který se pak spustí na tvém počítači.
#### --why--
Toto je reálný typ útoku na dodavatelský řetězec spoléhající na halucinace AI.

### --see--
prace-s-ai/jak-llm-selhava#vymyslene-funkce-a-balicky
</--question-->

<--question-->
Když děláš review kódu vygenerovaného AI, co bys měl kontrolovat ohledně unit testů, které model sám napsal?

### --answer--
Nic, pokud testy svítí zeleně, znamená to, že kód funguje.
#### --why--
Testy mohou svítit zeleně a přitom nic reálného netestovat.

### --correct--
Zda testy skutečně ověřují obchodní logiku, a ne jenom že volání funkce nehodí výjimku (často testy jen opisují implementaci).
#### --why--
AI často napíše test typu `assert(myFunction() !== null)`, což dodává falešný pocit bezpečí.

### --see--
prace-s-ai/review-kodu-z-ai#checklist-pro-review
</--question-->

<--question-->
Proč by se měli začátečníci vyhnout zapnutému GitHub Copilotu (nebo jinému našeptávači kódu) při řešení cvičných úloh?

### --answer--
Protože Copilot generuje pomalý kód, který neprojde testy.
#### --why--
Copilot píše relativně rychlý kód, tím to není.

### --correct--
Protože učení probíhá právě ve fázi, kdy tě mozek "bolí" ze snahy přijít na řešení a vzpomenout si na syntaxi. Autocomplete tento kognitivní proces zkratuje.
#### --why--
Pokud se jen učíš "číst, co někdo jiný napsal", nenaučíš se psát kód sám od nuly.

### --see--
prace-s-ai/ai-jako-tutor#kdy-ai-radeji-vypnout
</--question-->
