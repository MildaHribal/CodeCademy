# Behaviorální pohovor a angličtina

:::check pretest
„Popište situaci, kdy jste udělal chybu." Co podle tebe tazatel touhle otázkou zjišťuje
především?

### --expected--
Jestli chybu přiznáš a co jsi z ní vyvodil.
:::

Vedle technického kola tě čeká kolo, kde se nemluví o kódu. Ptá se personalista nebo
vedoucí týmu a otázky znějí neškodně: „Popište situaci, kdy…", „Jak jste řešil…".
Vypadá to jako povídání. Není. **[[Behaviorální otázka|Behaviorální otázky]] stojí na
předpokladu, že nejlepší předpověď budoucího chování je chování minulé** — proto se
neptají „co byste udělal", ale „co jste udělal".

> [!REMEMBER]
> **Na behaviorální otázku se odpovídá příběhem, ne názorem.** „Umím si poradit s
> konfliktem" není odpověď. Odpovědí je jeden konkrétní konflikt, který nastal, co jsi
> udělal ty a jak to dopadlo.

## Na co se HR ptá a proč

Personalista není technik a neposuzuje tvoje znalosti. Ověřuje tři věci a každou otázku
si k jedné z nich zařazuje:

| Co ověřuje | Typická otázka |
|---|---|
| **Zůstaneš?** | Proč jste odešel z předchozí práce? Co hledáte? Kde se vidíte za tři roky? |
| **Bude se s tebou dobře pracovat?** | Popište neshodu v týmu. Jak reagujete na kritiku? |
| **Je to s tebou reálné?** | Kdy můžete nastoupit? Jaká je vaše představa o platu? Dojíždění? |

Ze stejného důvodu nejsou otázky na tvoji minulost mimo IT nepříjemnost, ale příležitost:
**tam máš skutečné příběhy.** Junior, který ještě v IT nepracoval, si je bere z kavárny,
ze školy, z dobrovolnictví nebo ze společného projektu na kurzu — a je to naprosto
v pořádku. Hodnotí se chování, ne obor.

:::check
Proč se personalista ptá „popište situaci, kdy…", místo aby se zeptal „jak byste řešil…"?

### --answer--
Protože hypotetické otázky jsou pro uchazeče příliš těžké.

#### --why--
Hypotetické otázky jsou naopak snazší — a právě v tom je problém.

### --correct--
Protože na hypotetickou otázku odpoví správně kdokoli; skutečná minulá situace se vymýšlí mnohem hůř a líp předpovídá budoucí chování.

#### --why--
Správnou teoretickou odpověď si přečte každý. Konkrétní příběh s detaily a výsledkem prozradí, jak se člověk doopravdy zachoval.

### --see--
kariera-pohovor/behavioralni-a-anglictina#na-co-se-hr-pta-a-proc
:::

## Metoda STAR

[[Metoda STAR]] je kostra odpovědi o čtyřech částech. Není to trik, je to způsob, jak
se vejít do minuty a půl a nezapomenout na to podstatné.

| Písmeno | Co v něm říct | Kolik času |
|---|---|---|
| **S** — Situace | Kde a co se dělo. Jedna až dvě věty kontextu. | 15 % |
| **T** — Úkol (*task*) | Co bylo potřeba a jaká byla tvoje role v tom. | 15 % |
| **A** — Akce | **Co jsi udělal ty.** Konkrétní kroky, v první osobě jednotného čísla. | 55 % |
| **R** — Výsledek | Jak to dopadlo, ideálně měřitelně, a co sis z toho odnesl. | 15 % |

Ukázka na otázce „Popište situaci, kdy jste musel zvládnout termín, který se nestíhal":

> **(S)** Na kurzu jsme ve třech dělali týmový projekt, rezervační systém, a měsíc před
> odevzdáním nám odpadl člověk, který dělal backend.
> **(T)** Měl jsem na starost frontend, ale bez API nebylo co ukazovat, takže jsem musel
> rozhodnout, co z rozsahu obětujeme.
> **(A)** Sepsal jsem seznam funkcí a rozdělil je na „bez tohohle to nedává smysl" a
> „hezké mít". Pak jsem šel za zadávajícím s návrhem, že rezervace uděláme celé a
> správu pro provozovatele vynecháme, a dohodli jsme se na tom písemně. Backend jsem
> převzal a napsal jsem jen tři endpointy, které rezervace potřebovaly, zbytek jsme
> nechali být.
> **(R)** Odevzdali jsme včas a funkční, s poznámkou, co chybí a proč. Naučil jsem se,
> že první věc, kterou má člověk při zpoždění udělat, není zrychlit, ale domluvit se
> na menším rozsahu — a hlavně to udělat hned, ne týden před termínem.

Zkratku si zapamatuješ snáz, když si ji složíš sám — třeba takhle:

:::live js predict
```js
const casti = ['Situace', 'Úkol', 'Akce', 'Výsledek'];
console.log(casti.map((cast) => cast[0]).join(''));
```
--question-- Co vypíše `console.log`?
--expected-- SÚAV
--why-- `cast[0]` vrátí první znak řetězce, `map` z nich udělá nové pole a `join('')` ho slepí bez oddělovače. Česky vyjde `SÚAV`, anglicky (Situation, Task, Action, Result) právě STAR — proto se metoda jmenuje takhle.
:::

Všimni si tří věcí: **mluví se v první osobě** („já jsem sepsal", ne „my jsme se
rozhodli"), **akce je nejdelší část** a **výsledek obsahuje poučení**.

> [!TIP]
> Připrav si čtyři až pět příběhů a recykluj je. Jeden dobrý příběh o konfliktu poslouží
> i na otázku o zpětné vazbě, o tlaku a o spolupráci — jen z něj pokaždé zdůrazníš jinou
> část.

:::check
Která část odpovědi podle STAR má být nejdelší?

### --answer--
Situace — bez kontextu tazatel nepochopí zbytek.

#### --why--
Kontext má stačit ve dvou větách. Delší úvod ubírá čas té části, kvůli které se tazatel ptá.

### --correct--
Akce: co jsi konkrétně udělal ty.

#### --why--
Tazatel hodnotí tvoje chování. Situaci ani výsledek jsi nezpůsobil sám, akci ano.

### --see--
kariera-pohovor/behavioralni-a-anglictina#metoda-star
:::

## Šest otázek, které padnou skoro vždy

Na tyhle si odpovědi připrav doslova. Ne proto, abys je odrecitoval, ale abys je nemusel
vymýšlet pod tlakem.

**1. „Proč jste se rozhodl pro programování?"**
Nechtějí dojemný příběh, chtějí vědět, jestli to vydrží. Nejsilnější odpověď obsahuje
**konkrétní okamžik** a **doklad vytrvalosti**: „Dělal jsem v kavárně rozpis směn
v tabulce, pak jsem si na to napsal skript a zjistil, že mě to baví víc než ta kavárna.
Od té doby se učím osmnáct měsíců, tady jsou tři projekty."

**2. „Proč jste odešel z předchozí práce?" / „Proč měníte obor?"**
Dopředu a bez hořkosti. Nikdy nepomlouvej: i když měli chybu oni, tazatel si představí,
jak jednou budeš mluvit o něm. „Chtěl jsem práci, kde se dá růst a kde je vidět výsledek."

**3. „Popište neshodu s kolegou."**
Past je odpovědět „nikdy jsem žádnou neměl" — to znamená buď že nepracuješ s lidmi, nebo
že neshody nevnímáš. Vyber drobnou věcnou neshodu, ukaž, že ses ptal na důvody druhé
strany, a skonči dohodou, ne vítězstvím.

**4. „Kde se vidíte za tři roky?"**
Odpovídej v rovině dovedností, ne titulů: „Chtěl bych se za tři roky dostat na úroveň,
kdy zvládnu samostatně navrhnout a dotáhnout větší funkci a pomáhat s ní dalším."

**5. „Jaká je vaše největší slabina?"**
Neříkej přetvořenou přednost („jsem moc pečlivý") — to tazatel slyší denně a čte to jako
vyhýbavost. Řekni skutečnou slabinu, která není pro tu práci fatální, **a hlavně co s ní
děláš**: „Dlouho se snažím vyřešit problém sám, než se ozvu. Zavedl jsem si na to pravidlo
— po hodině hledání jdu za někým, i když mi to není příjemné."

**6. „Máte nějaké otázky?"**
Odpověď „ne" je nejhorší možná. Otázky si připrav — a jiné než na plat a benefity.

:::check
Uchazeč odpoví na otázku po největší slabině větou „Jsem až moc pečlivý."
Proč je to slabá odpověď?

### --answer--
Protože pečlivost není slabina, takže je odpověď věcně špatně.

#### --why--
Věcná správnost tu nerozhoduje — tazatele zajímá něco jiného než katalog slabin.

### --correct--
Protože se vyhýbá otázce; tazatel chce vidět sebereflexi a to, co se slabinou děláš.

#### --why--
Odpověď má dvě části: skutečnou slabinu a konkrétní opatření. Přetvořená přednost neobsahuje ani jednu.

### --see--
kariera-pohovor/behavioralni-a-anglictina#sest-otazek-ktere-padnou-skoro-vzdy
:::

## Jak mluvit o chybě

Otázka „popište svou největší chybu" je nejcennější otázka celého kola, protože se na ní
nejvíc pozná rozdíl mezi uchazeči. Tvar, který funguje, má čtyři části a **poslední dvě
jsou nejdůležitější**:

1. **Co se stalo** — věcně, bez dramatizace i bez zlehčování.
2. **Jaký to mělo dopad** — kdo to odnesl a jak. Bez téhle části to nezní jako chyba.
3. **Co jsi udělal hned** — jak jsi to napravil a komu jsi to řekl.
4. **Co jsi změnil, aby se to neopakovalo** — pravidlo, test, kontrola, návyk.

> „Nasadil jsem v pátek odpoledne změnu formuláře a rozbil jsem tím objednávky —
> dvě hodiny nešlo dokončit nákup. Hned jsem to vrátil zpátky a napsal to do týmového
> kanálu, abych to neschovával. Chyba byla, že jsem si to ověřil jen u sebe. Od té doby
> si na každou změnu formuláře píšu test na odeslání a v pátek odpoledne nenasazuju."

> [!PITFALL]
> Dvě odpovědi, které tuhle otázku pokazí: „nic velkého mě nenapadá" (nepůsobí to jako
> bezchybnost, ale jako nedostatek sebereflexe) a chyba, kterou způsobil někdo jiný
> a ty jsi ji „musel zachraňovat".

:::check
V odpovědi o vlastní chybě vynecháš část o dopadu („dvě hodiny nešlo dokončit nákup").
Co tím ztratíš?

### --answer--
Nic podstatného — dopad si tazatel domyslí ze situace.

#### --why--
Domyslí si ho, ale obvykle jako menší, než byl. Tím se z odpovědi vytratí to hlavní.

### --correct--
Odpověď přestane znít jako chyba a začne znít jako drobnost, na které není co hodnotit.

#### --why--
Bez dopadu není vidět, proč šlo o chybu. Přiznaný dopad je zároveň to, co dokazuje, že jsi ji doopravdy vzal za svou.

### --see--
kariera-pohovor/behavioralni-a-anglictina#jak-mluvit-o-chybe
:::

## Angličtina: co po tobě opravdu chtějí

Skoro každý inzerát chce angličtinu, a skoro nikdo po juniorovi nechce plynulost.
Požadavek se v praxi rozpadá na tři různé věci:

| Úroveň požadavku | Co to znamená | Jak se ověřuje |
|---|---|---|
| **Pasivní** (nejčastější) | Přečteš dokumentaci, issue na GitHubu, chybovou hlášku. | Vůbec, nebo jednou větou. |
| **Písemná** | Napíšeš komentář v PR, zprávu do Slacku, popis chyby. | Občas úkolem: popiš chybu anglicky. |
| **Aktivní** | Mluvíš na schůzi se zahraničním týmem. | Patnáct minut hovoru anglicky. |

Když přijde na řadu ten patnáctiminutový hovor, **nehodnotí se gramatika, ale jestli se
s tebou dá domluvit.** Pomalá, jednoduchá a srozumitelná angličtina projde. Zaseknuté
ticho a snaha o složité souvětí ne.

Tři návyky, které pomůžou víc než kurz:

- **Přepni si dokumentaci a vyhledávání do angličtiny nastálo.** Za měsíc čteš bez přemýšlení.
- **Popiš si svůj projekt anglicky nahlas.** Jednou týdně, dvě minuty, klidně sám pro sebe.
  Je to přesně to, co po tobě budou chtít.
- **README jednoho projektu napiš anglicky.** Zabere hodinu, a máš doklad rovnou v portfoliu.

:::check
Jakou úroveň angličtiny inzeráty u juniora vyžadují nejčastěji?

### --answer--
Aktivní — schopnost vést schůzi se zahraničním týmem.

#### --why--
Tuhle úroveň vyžadují firmy s mezinárodním týmem, což je menšina juniorních nabídek.

### --correct--
Pasivní: přečíst dokumentaci, issue a chybovou hlášku.

#### --why--
Většina juniorní práce se odehrává v češtině; anglicky je jen to, co člověk čte. Proto se tenhle požadavek často vůbec neověřuje.

### --see--
kariera-pohovor/behavioralni-a-anglictina#anglictina-co-po-tobe-opravdu-chteji
:::

## Fráze, které se hodí mít nacvičené

Tohle je kostra, kterou si můžeš naplnit svým projektem. Nauč se ji jako celek — při
hovoru pak nemusíš skládat věty od nuly.

```text
Představení:
  I'm a frontend developer focused on React and TypeScript.
  Before that I worked in hospitality for eight years, mostly as a shift manager.

Projekt:
  My main project is a shift planner for a small café — five people use it every week.
  The frontend is React, the API is Node with SQLite.
  The tricky part was that two people could book the same shift at the same time,
  so I moved the capacity check into a transaction on the server.

Když nerozumíš:
  Sorry, could you repeat that?
  I'm not sure I follow — do you mean … ?
  Could you rephrase the question, please?

Když nevíš:
  I haven't worked with that yet, but I'd start by looking at …
  I don't know that off the top of my head — I'd check the docs and test it.

Potřebuješ čas na rozmyšlenou:
  That's a good question, let me think for a second.
```

> [!TIP]
> Nejužitečnější věta z celého seznamu je **„Sorry, could you repeat that?"**. Nechat si
> otázku zopakovat je naprosto běžné i mezi rodilými mluvčími. Odpovědět na otázku,
> které jsi nerozuměl, je mnohem horší.

:::check
Co se u juniora hodnotí na patnáctiminutovém hovoru v angličtině především?

### --answer--
Gramatická správnost a bohatost slovní zásoby.

#### --why--
Na téhle úrovni nikdo nečeká přesnost. Kdyby šlo o gramatiku, nedělal by se hovor, ale test.

### --correct--
Jestli se s tebou dá domluvit — tedy jestli srozumitelně předáš myšlenku a řekneš si o zopakování, když nerozumíš.

#### --why--
V práci jde o předání informace. Jednoduchá, ale srozumitelná angličtina tenhle úkol splní.

### --see--
kariera-pohovor/behavioralni-a-anglictina#anglictina-co-po-tobe-opravdu-chteji
:::

:::explain
Vysvětli vlastními slovy, proč je u otázky na vlastní chybu nejdůležitější poslední
část odpovědi — tedy to, co jsi kvůli ní změnil.

## --model--
Samotná chyba tazateli o uchazeči neřekne skoro nic, protože nějakou chybu udělal každý
a počet chyb spíš odpovídá množství odvedené práce. Zajímavé je, co se stalo potom.
Popis nápravy ukazuje, že člověk chybu vůbec zaznamenal a přiznal ji místo schovávání,
a popis změněného návyku ukazuje, že ji umí zobecnit — z jedné konkrétní situace vyvodit
pravidlo, které pokryje i příští případ. Právě tohle firma potřebuje vědět, protože
junior udělá chyb ještě spoustu a otázka není jestli, ale jestli se každá z nich promění
v nové opatření, nebo se za půl roku zopakuje. Odpověď bez téhle části zní jako historka,
ne jako doklad o tom, že se z ní někdo poučil.

## --checklist--
- Chybu udělal každý, takže samotná chyba nikoho neodliší.
- Náprava ukazuje, že jsi ji přiznal, místo abys ji schoval.
- Změněný návyk ukazuje schopnost zobecnit z jednoho případu pravidlo.
- Firma počítá s dalšími chybami a zajímá ji, jestli se budou opakovat.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Odpovídání v množném čísle.** „My jsme to vyřešili tak, že…" — tazatel neví, co jsi
> udělal ty. Mluv v první osobě jednotného čísla, i když šlo o týmovou práci.

> [!PITFALL]
> **Příběh bez výsledku.** Odpověď, která skončí popisem akce, působí nedokončeně.
> Vždycky přidej, jak to dopadlo a co sis z toho odnesl.

> [!PITFALL]
> **Pomlouvání.** Nejrychlejší způsob, jak ztratit pozici, kterou jsi jinak měl jistou.

> [!PITFALL]
> **Předstíraná plynulá angličtina.** Nadsazená úroveň se provalí v první minutě hovoru
> a zpochybní všechno ostatní, co jsi o sobě napsal.

## Kde to najdeš dál

- [Amazon: interview preparation (STAR)](https://www.amazon.jobs/content/en/how-we-hire/interviewing-at-amazon) — původní popis metody STAR od firmy, která ji rozšířila.
- [junior.guru — pohovory](https://junior.guru/interview/) — česká příručka k pohovorům.
- [Tech Interview Handbook — behavioral](https://www.techinterviewhandbook.org/behavioral-interview/) — seznam otázek a rozbor odpovědí.

# --questions--

## --question--

Vyjmenuj čtyři části metody STAR v pořadí. Stačí česká slova oddělená čárkou.

### --expected-- ignore-case
situace, úkol, akce, výsledek

### --accept--
situation, task, action, result
situace, task, akce, result

### --why--
Kostra drží odpověď v minutě a půl a hlídá, aby v ní byla nejdůležitější část — akce, tedy co jsi udělal ty.

### --see--
kariera-pohovor/behavioralni-a-anglictina#metoda-star

## --question--

Tazatel se zeptá na neshodu s kolegou a tobě žádná nenapadá. Co je nejhorší možná odpověď?

### --answer--
Vymyslet si drobnou neshodu, která se vlastně nestala.

#### --why--
Vymýšlení je riskantní, ale na doplňující otázky se dá nějak odpovědět. Jiná odpověď zavře dveře úplně.

### --correct--
„Nikdy jsem žádnou neměl" — vyznívá to, že buď s lidmi nepracuješ, nebo neshody nevnímáš.

#### --why--
Neshoda v týmu je normální jev. Kdo tvrdí, že ji nikdy nezažil, o sobě tvrdí něco nepravděpodobného.

### --see--
kariera-pohovor/behavioralni-a-anglictina#sest-otazek-ktere-padnou-skoro-vzdy

## --question--

Napiš anglicky větu, kterou si necháš otázku zopakovat, když jsi jí nerozuměl.

### --expected-- ignore-case
Sorry, could you repeat that?

### --accept--
could you repeat that, please
sorry, could you say that again
I'm sorry, could you repeat the question?

### --why--
Nechat si otázku zopakovat je běžné i mezi rodilými mluvčími. Odpovědět na otázku, které jsi nerozuměl, je mnohem horší signál.

### --see--
kariera-pohovor/behavioralni-a-anglictina#fraze-ktere-se-hodi-mit-nacvicene

## --question--

Které dvě části odpovědi na otázku o vlastní chybě rozhodují?

### --expected--
Co jsi udělal hned a co jsi změnil, aby se to neopakovalo.

### --accept--
náprava a změněný návyk
jak jsi to napravil a jaké pravidlo sis z toho zavedl

### --why--
Samotná chyba nikoho neodliší — udělal ji každý. Odliší až náprava a opatření, které z jedné situace udělá pravidlo.

### --see--
kariera-pohovor/behavioralni-a-anglictina#jak-mluvit-o-chybe

## --question--

**Opakování z dřívějška.** V odpovědi podle STAR popisuješ, jak jsi v týmu prosadil
psaní testů. Který druh testu ověřuje aplikaci jako celek z pohledu uživatele —
od kliknutí po výsledek na obrazovce?

### --expected-- ignore-case
end-to-end

### --accept--
e2e
end to end test
end-to-end test

### --why--
Unit test ověřuje jednu funkci, integrační test spolupráci několika částí a end-to-end test celou cestu uživatele v prohlížeči. Právě proto je nejpomalejší a je jich nejmíň.

### --see--
nastroje-testovani/proc-testovat#unit-integracni-a-end-to-end-testy

## --question--

**Opakování z dřívějška.** V příběhu o chybě zmíníš, že jsi změnu „vrátil zpátky".
Který příkaz Gitu zruší už odeslaný commit tím, že k němu přidá opačný commit,
místo aby přepsal historii?

### --expected-- ignore-case
git revert

### --accept--
revert

### --why--
`git reset` posune větev a historii přepíše, což je u sdílené větve zakázané. `git revert` přidá nový commit s opačnou změnou, takže historie zůstane a ostatním se nic nerozbije.

### --see--
nastroje-git-terminal/git-zachrana#revert-oprava-bez-prepisovani-historie
