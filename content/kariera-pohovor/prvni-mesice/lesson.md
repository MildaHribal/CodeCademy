# První měsíce v práci

:::check pretest
První týden dostaneš úkol a po dvou hodinách zjistíš, že ho nezvládneš sám.
Za jak dlouho se podle tebe máš ozvat?

### --expected--
Dřív než za dvě hodiny.
:::

Pohovor jsi zvládl a máš podepsáno. Tahle lekce je o období, které rozhoduje o tom,
jestli si to zopakuješ za rok znovu, nebo jestli budeš za rok medior. **Prvních devadesát
dní se neměří odvedeným kódem** — měří se tím, jak rychle přestaneš být zátěží a začneš
být kolegou.

> [!REMEMBER]
> **V prvních měsících není tvoje práce psát kód, ale rozumět tomu, kam ho psát.**
> Junior, který první týden nic nenasadí a místo toho rozumí doméně, je v druhém měsíci
> před tím, kdo hned první den přidal funkci na špatném místě.

## První týden: rozběhni projekt a napiš si mapu

První den dostaneš přístupy a počítač. Co s tím:

1. **Rozběhni projekt podle dokumentace a zapisuj si, co v ní nesedí.** Skoro vždycky
   je README zastaralé. Tvoje první užitečná práce v týmu bývá právě jeho oprava — je
   to malá, bezpečná změna, kterou nikdo jiný neudělá, protože ji nikdo jiný nepotřebuje.
2. **Nakresli si hrubou mapu.** Kde je vstupní bod frontendu, kde backendu, kudy tečou
   data, kde jsou testy, co se spouští v CI. Stačí půl stránky v sešitě.
3. **Vystopuj jeden požadavek skrz kód.** Vyber si jednu obrazovku, klikni na tlačítko
   a projdi cestu od posluchače události přes volání API až do databáze. Jeden takhle
   projitý průchod naučí víc než den čtení souborů.
4. **Zjisti, kdo je kdo.** Kdo dělá review, kdo rozhoduje o zadání, koho se ptát na
   doménu (ne na kód) a kdo je tvůj [[buddy]] — člověk určený na hloupé otázky.

> [!TIP]
> Prvních čtrnáct dní si veď soubor `otazky.md`. Co tě zarazí, zapiš, a jednou denně
> projdi seznam s buddym najednou místo osmi vyrušení. Polovina otázek se do večera
> zodpoví sama.

:::check
Co je pro juniora nejužitečnější první úkol v novém projektu?

### --answer--
Malá nová funkce, aby bylo hned vidět, že přináší hodnotu.

#### --why--
Nová funkce vyžaduje znalost místa, kam patří — a tu junior první týden nemá.

### --correct--
Oprava dokumentace, kterou objevil při rozbíhání projektu, a jeden vystopovaný průchod kódem.

#### --why--
Je to bezpečná změna, projde celým procesem (větev, PR, review, nasazení) a při tom se naučíš, jak tým pracuje.

### --see--
kariera-pohovor/prvni-mesice#prvni-tyden-rozbehni-projekt-a-napis-si-mapu
:::

## Plán 30-60-90

[[Plán 30-60-90]] je rozdělení prvních tří měsíců na etapy s jiným cílem. Firmy ho často
mají samy; když ne, udělej si ho a ukaž ho vedoucímu — je to jedna z nejlepších věcí,
které můžeš první týden udělat.

| Období | Cíl | Jak poznáš, že je splněný |
|---|---|---|
| **1.–30. den** | Rozumět | Rozběhneš projekt, víš, co firma dělá a kdo je zákazník. Zvládneš drobné úkoly s pomocí. Znáš proces od větve po nasazení. |
| **31.–60. den** | Přispívat | Bereš si běžné úkoly ze seznamu a dotahuješ je sám. Tvoje PR procházejí review bez velkých přepisů. Na standupu mluvíš věcně. |
| **61.–90. den** | Být spolehlivý | Odhadneš úkol přibližně správně. Ptáš se míň a cíleněji. Zvládneš vzít větší funkci a rozdělit si ji. Sám si všimneš, co je rozbité. |

**Dvě věci, které se do plánu nepíšou, ale hodnotí se nejvíc:** jestli se tě tým nebojí
požádat o cokoli, a jestli se na tebe dá spolehnout, že řekneš, když něco nestíháš.

> [!PITFALL]
> Ambice typu „do třiceti dnů přepíšu jejich zastaralý stav na moderní knihovnu" je
> nejrychlejší způsob, jak se v novém týmu znemožnit. Návrhy na velké změny si nech na
> čtvrtý měsíc, až budeš vědět, proč to je, jak to je.

:::check
Co je cílem prvních třiceti dnů podle plánu 30-60-90?

### --answer--
Dokázat, že se junior vyplatil — dodat viditelnou funkci.

#### --why--
Viditelný výstup je cíl druhé etapy. V první etapě by šel na úkor něčeho důležitějšího.

### --correct--
Rozumět: projektu, doméně, zákazníkovi a procesu od větve po nasazení.

#### --why--
Bez téhle znalosti se i správně napsaný kód dostane na špatné místo a stojí tým víc práce, než ušetří.

### --see--
kariera-pohovor/prvni-mesice#plan-30-60-90
:::

## Jak se ptát, aby to nikoho nemrzelo

Junior má dvě možnosti, jak to pokazit: ptát se na všechno hned, nebo se neptat vůbec.
Druhá varianta je dražší, ale první otravnější. Mezi nimi je [[timebox]] —
předem daný čas, po který se snažíš sám.

- **První dva týdny: 30 minut.** Neznáš kód ani konvence, takže tvoje samostatné hledání
  má malou návratnost.
- **Od druhého měsíce: 60 minut.** Už víš, kde hledat.
- **Vždy hned, bez čekání:** cokoli s produkcí, s daty zákazníků, s penězi nebo s
  bezpečností. Tady se neexperimentuje.

Když se ptáš, přines čtyři věci — ušetříš kolegovi polovinu času a sobě ostudu:

```text
Cíl:      Chci do výpisu objednávek přidat filtr podle stavu.
Zkusil:   Přidal jsem parametr do dotazu podle vzoru z filtru podle data.
Chyba:    Server vrací 400 s hláškou „unknown filter: state".
Domněnka: Tipuju, že se povolené filtry někde vyjmenovávají, ale nenašel jsem kde.
```

Tahle zpráva je kromě jiného doklad, že ses snažil — a přesně o to jde. **Zhruba třetina
takových otázek se vyřeší sama ve chvíli, kdy je píšeš.**

:::check
Kdy se má junior ptát okamžitě, bez ohledu na timebox?

### --answer--
Když úkol nezvládne do konce dne.

#### --why--
Termín je věc, kterou se má ozvat taky, ale existuje kategorie, kde se nečeká ani minutu.

### --correct--
Vždy, když jde o produkci, data zákazníků, peníze nebo bezpečnost.

#### --why--
V těchhle oblastech je cena omylu nesrovnatelně vyšší než cena vyrušení kolegy.

### --see--
kariera-pohovor/prvni-mesice#jak-se-ptat-aby-to-nikoho-nemrzelo
:::

## První pull request

Tvůj první [[pull request]] je zkouška procesu, ne kódu. Drž ho **malý** — ideálně do
dvou set řádků. Velké PR se nedají pořádně zrevidovat a review na ně přijde později
a povrchnější.

Kostra popisu, která funguje všude:

```md
## Co se mění
Do výpisu objednávek přidává filtr podle stavu (nové / vyřizuje se / odesláno).

## Proč
Z #412 — podpora filtruje ručně a u větších zákazníků to trvá.

## Jak to vyzkoušet
1. `npm run dev`, otevřít /objednavky
2. vybrat stav v novém selectu → seznam se zúží, stav zůstane v adrese

## Na co se podívat
Povolené hodnoty filtru jsem přidal do `ORDER_FILTERS` v `server/orders/filters.js` —
nevím, jestli to je správné místo, nebo se to má odvozovat ze schématu.
```

Poslední odstavec je ten, který dělá z juniora dobrého kolegu: **řekni sám, kde si nejsi
jistý.** Reviewer se pak podívá právě tam a nemusí hádat.

> [!TIP]
> Než pošleš PR, projdi si vlastní diff ve webovém rozhraní, řádek po řádku. Polovinu
> připomínek si najdeš sám — zapomenutý `console.log`, zbylý komentář, překlep v názvu.

Typická připomínka v prvním review juniora vypadá takhle. Data přišla z formuláře nebo
z API jako text a ve výpočtu se to projeví až na obrazovce:

:::live js predict
```js
const hodiny = ['8', '7', '9'];
console.log(hodiny.reduce((soucet, hodina) => soucet + hodina, 0));
```
--question-- Co vypíše `console.log`?
--expected-- 0879
--why-- Položky jsou řetězce, takže `+` je spojuje místo sčítání: `0` → `'08'` → `'087'` → `'0879'`. Oprava je převod na hranici dat, hned při načtení: `hodiny.map(Number)`. Proto se hodnoty z formulářů a z API převádějí na čísla na jednom místě, ne až ve výpočtu.
:::

:::check
Proč je lepší poslat dvě stě řádků než dva tisíce?

### --answer--
Protože velké změny se hůř slučují do hlavní větve.

#### --why--
Slučování je technický detail, se kterým si Git poradí. Problém je u člověka.

### --correct--
Protože velké PR nikdo nezreviduje pořádně — review přijde později a projde povrchněji.

#### --why--
Pozornost reviewera je omezená. U dvou tisíc řádků se z review stane kontrola formátování.

### --see--
kariera-pohovor/prvni-mesice#prvni-pull-request
:::

## Přijímat review bez obrany

První code review na vlastní kód bolí. Patnáct komentářů pod dvousetřádkovým PR vypadá
jako rozsudek. Není — **je to standardní množství u kohokoli, kdo je v projektu nový.**

Co s jednotlivými připomínkami:

| Druh připomínky | Co s ní |
|---|---|
| Rozumím a souhlasím | Oprav a odpověz „hotovo". Bez omluv a bez vysvětlování. |
| Nerozumím | Zeptej se na konkrétní důvod: „Proč je tady mapa lepší než pole?" |
| Nesouhlasím | Napiš věcný argument a nabídni rozhodnutí: „Udělal jsem to takhle kvůli X. Když to vidíš jinak, přepíšu to." |
| Označená jako `nit` | Drobnost podle vkusu. Oprav ji, ale nemusí blokovat schválení. |

Tři věty, které si v review nacvič:

- **„Díky, tohle jsem nevěděl."** Zkracuje výměnu a je to pravda.
- **„Nerozumím proč — můžeš mi dát příklad?"** Legitimní, ne drzé.
- **„Souhlasím, ale udělám to v samostatném PR."** Chrání rozsah současné změny.

> [!PITFALL]
> Nikdy neber připomínky osobně a nikdy na ně neodpovídej obranou typu „to takhle bylo
> už předtím". Review je o kódu. Rozdíl mezi juniorem a mediorem je z velké části v tom,
> jak rychle umí přijmout, že jeho řešení nebylo nejlepší.

:::check
Co znamená, když je připomínka v review označená jako `nit`?

### --answer--
Že jde o chybu, která blokuje sloučení PR.

#### --why--
Blokující připomínky se takhle neoznačují — označení má naopak ubrat na naléhavosti.

### --correct--
Že jde o drobnost podle vkusu reviewera: hodí se ji opravit, ale schválení blokovat nemá.

#### --why--
Zkratka od „nitpick" existuje právě proto, aby autor poznal, co je podstatné a co jen preference.

### --see--
kariera-pohovor/prvni-mesice#prijimat-review-bez-obrany
:::

:::explain
Nový kolega dostal pod první pull request osmnáct komentářů a je z toho zdrcený.
Vysvětli vlastními slovy, proč je hodně komentářů v review u nového člověka dobrá zpráva.

## --model--
Komentáře v review skoro vždycky nemíří na schopnosti autora, ale na věci, které se
nedají uhodnout: konvence projektu, místa, kde už podobná funkce existuje, historické
důvody, proč se něco dělá zdánlivě složitě. Nový člověk tohle vědět nemůže, takže počet
komentářů měří spíš množství nepsaných pravidel v projektu než kvalitu kódu. Zároveň
platí, že review, které se nikdo nevěnoval, je horší zpráva: znamená to buď že o kód
nikdo nestojí, nebo že reviewer neměl čas a jen odklikl schválení. Podrobné připomínky
tedy znamenají, že do tebe tým investuje čas, a každá z nich je zkratka, díky které
nemusíš stejnou věc objevovat sám o měsíc později.

## --checklist--
- Většina připomínek míří na nepsané konvence, ne na schopnosti autora.
- Počet komentářů u nováčka měří spíš skrytá pravidla projektu.
- Review bez připomínek může znamenat, že se mu nikdo nevěnoval.
- Každá připomínka je zkratka k poznání, které bys jinak sbíral měsíce.
:::

## Zkušební doba a zpětná vazba

Zkušební doba jsou v Česku obvykle tři měsíce a dá se v ní rozvázat poměr z obou stran
ze dne na den, bez důvodu. Zní to hrozivě; v praxi platí, že **firma, která tě přijímala
tři kola, tě nechce propustit** — jen potřebuje vidět pohyb.

Co s tím prakticky:

- **Vyžádej si zpětnou vazbu sám, nečekej na hodnocení.** Po prvním měsíci se zeptej
  vedoucího na dvě věci: „Co mám dělat víc?" a „Co bych měl změnit?" Otevřená otázka
  („jak mi to jde?") plodí zdvořilou odpověď, konkrétní otázka užitečnou.
- **Piš si, co ses naučil.** Jednou týdně tři odrážky do souboru. Po třech měsících máš
  podklad na hodnocení, za rok podklad na vyjednávání o platu a kdykoli materiál do CV.
- **Když něco nestíháš, řekni to hned.** Zpoždění, o kterém tým ví ve středu, se dá
  řešit. Zpoždění, které vyjde najevo v pátek večer, ne.
- **Za půl roku si domluv, jak se pozná posun na mediora.** Nejlepší chvíle je konec
  zkušební doby, kdy se o výsledcích stejně mluví.

> [!REMEMBER]
> **Nejrychleji roste ten, kdo nejrychleji dostává a zapracovává zpětnou vazbu.**
> Proto je první práce s dobrým code review cennější než první práce s vyšším platem.

:::check
Napiš dvě otázky, kterými si po prvním měsíci vyžádáš od vedoucího užitečnou zpětnou vazbu.

### --expected--
Co mám dělat víc? Co bych měl změnit?

### --accept--
co dělám dobře a mám v tom pokračovat, co mám změnit
co mám dělat víc a co jinak

### --why--
Otevřená otázka „jak mi to jde?" vede ke zdvořilé odpovědi. Dvě konkrétní otázky nutí vedoucího jmenovat věci, se kterými se dá něco udělat.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Skrývání zaseknutí.** Nejdražší chyba juniora. Den ztraceného času na problému,
> který kolega zná zpaměti, si nikdo nevšimne jednou; potřetí už ano.

> [!PITFALL]
> **Tiché opravování cizích věcí „při té příležitosti".** Refaktor ve stejném PR jako
> nová funkce zdvojnásobí diff a znemožní review. Zvlášť PR, zvlášť diskuse.

> [!PITFALL]
> **Pokus zapůsobit rychlostí.** Odevzdaná funkce bez testů a bez ošetřených chyb
> vypadá první den skvěle a třetí týden jako zdroj hlášení chyb.

> [!PITFALL]
> **Čekání na zadání.** Když nemáš co dělat, není to volno. Projdi seznam úkolů,
> nabídni se s review, oprav dokumentaci, napiš chybějící test.

## Kde to najdeš dál

- [The First 90 Days (shrnutí)](https://hbr.org/2016/05/the-first-90-days) — odkud plán 30-60-90 pochází.
- [How to ask good questions (Julia Evans)](https://jvns.ca/blog/good-questions/) — jak se ptát, aby to bylo příjemné oběma.
- [Google Engineering Practices: Code Review](https://google.github.io/eng-practices/review/) — jak vypadá review v praxi velkého týmu.

# --questions--

## --question--

První týden nemůžeš rozběhnout projekt podle README, protože je zastaralé.
Co je nejlepší reakce?

### --answer--
Rozběhnout to jakkoli a nezdržovat tím ostatní.

#### --why--
Zdržení to nezpůsobí, zato zahodíš jednu z mála věcí, které nováček vidí a ostatní ne.

### --correct--
Zapsat si, co nesedí, projekt rozběhnout s pomocí kolegy a README opravit jako první pull request.

#### --why--
Je to bezpečná změna, kterou nikdo jiný neudělá, a projdeš při ní celý proces týmu.

### --see--
kariera-pohovor/prvni-mesice#prvni-tyden-rozbehni-projekt-a-napis-si-mapu

## --question--

Jak dlouhý timebox je rozumný pro juniora v prvních dvou týdnech v novém projektu?

### --expected--
30 minut

### --accept--
půl hodiny
třicet minut
30 min

### --why--
V prvních dnech neznáš kód ani konvence, takže samostatné hledání má malou návratnost. Od druhého měsíce dává smysl hodina.

### --see--
kariera-pohovor/prvni-mesice#jak-se-ptat-aby-to-nikoho-nemrzelo

## --question--

Co napíšeš do popisu pull requestu do části „Na co se podívat"?

### --expected--
Místo, kde si nejsem jistý svým rozhodnutím.

### --accept--
kde si nejsem jistý a proč
místo, u kterého chci názor reviewera

### --why--
Reviewer pak nemusí hádat, kde hledat problém, a ty dostaneš odpověď právě tam, kde ji potřebuješ.

### --see--
kariera-pohovor/prvni-mesice#prvni-pull-request

## --question--

Dostaneš v review připomínku, se kterou nesouhlasíš. Co uděláš?

### --answer--
Opravím to podle připomínky — reviewer je zkušenější.

#### --why--
Mlčky opravit něco, co považuješ za horší, připraví tým o informaci a tebe o vysvětlení.

### --correct--
Napíšu věcný argument, proč jsem to udělal takhle, a nabídnu, že to přepíšu, pokud to reviewer vidí jinak.

#### --why--
Review je diskuse o kódu. Věcný protiargument se v ní čeká a je to jeden ze signálů, že rosteš.

### --see--
kariera-pohovor/prvni-mesice#prijimat-review-bez-obrany

## --question--

**Opakování z dřívějška.** Dostaneš za úkol upravit funkci v cizím modulu, kterému
zatím nerozumíš, a modul nemá testy. Čím si práci zajistíš, než začneš měnit kód?

### --expected--
Charakterizačním testem.

### --accept--
charakterizační test
testem, který zachytí současné chování

### --why--
Charakterizační test nepopisuje, jak se kód chovat má, ale jak se chová teď. Každý test, který po změně zčervená, pak přesně ukazuje, co jsi změnil.

### --see--
nastroje-cizi-kod/orientace-v-cizim-kodu#6-bezpecna-zmena-charakterizacni-test

## --question--

**Opakování z dřívějška.** Na standupu hlásíš, že aplikace v produkci občas vrací 500,
ale u sebe to nedokážeš zopakovat. Kde získáš informaci o tom, co se doopravdy stalo?

### --answer--
V DevTools ve svém prohlížeči při dalším pokusu o reprodukci.

#### --why--
DevTools ukážou, co se děje u tebe. Chyba nastala u někoho jiného a v jiném prostředí.

### --correct--
Ve strukturovaných logech a v nástroji na sledování chyb z produkce — se stopou zásobníku, časem a identifikátorem požadavku.

#### --why--
Logy jsou jediný zápis toho, co se stalo uživateli, kterého u sebe nesimuluješ. Proto se do nich píše request id.

### --see--
nasazeni-provoz/logovani-a-chyby#request-id
