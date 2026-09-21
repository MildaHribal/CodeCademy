# Technický pohovor

:::check pretest
Při živém programování se zasekneš a nevíš, jak dál. Co je pro hodnotitele horší —
když to řekneš nahlas, nebo když deset minut mlčíš a píšeš náhodné věci?

### --expected--
Když mlčíš.
:::

Technické kolo vede vývojář, ne personalista. Má hodinu na to, aby zjistil jednu věc:
**jaké to bude, když s tebou bude řešit úkol.** Nejde o to, kolik věcí víš zpaměti —
jde o to, jak postupuješ, když něco nevíš.

> [!REMEMBER]
> **Na technickém pohovoru se hodnotí postup, ne výsledek.** Uchazeč, který úlohu
> nedořeší, ale celou dobu srozumitelně přemýšlí nahlas, projde častěji než ten, který
> mlčky napíše správnou odpověď.

## Jak vypadá kolo za kolem

Většina českých firem jede podle stejného schématu; lišit se bude hlavně to, kolik kol
vynechají.

| Kolo | Kdo | Co se děje | Jak dlouho |
|---|---|---|---|
| Screening | HR | Telefon: proč se hlásíš, kdy můžeš nastoupit, představa o platu. | 15–30 min |
| Technické kolo | vývojář, tech lead | Vyprávění o projektu, otázky na základy, často živé programování. | 60–90 min |
| Domácí úkol | ty sám | Často místo živého programování, někdy k němu. | 4 h |
| Review úkolu | vývojář | Procházíte tvůj odevzdaný kód a ptají se „proč takhle". | 45 min |
| Závěrečné kolo | vedoucí týmu | Očekávání, zapadnutí do týmu, prostor na tvoje otázky. | 45 min |

**Nejčastěji se propadá v technickém kole, a to ne na znalostech, ale na komunikaci** —
uchazeč neumí popsat vlastní projekt nebo při úloze mlčí.

:::check
Kdo vede screeningové kolo a co ho zajímá?

### --answer--
Tech lead, který chce rychle ověřit znalosti.

#### --why--
Technik přichází až v dalším kole. První telefonát má jiný účel.

### --correct--
Personalista, který ověřuje formální věci: proč se hlásíš, kdy můžeš nastoupit a jakou máš představu o platu.

#### --why--
Screening je filtr na nesoulad v základních podmínkách. Technické otázky tam nepatří a nečekají se.

### --see--
kariera-pohovor/technicky-pohovor#jak-vypada-kolo-za-kolem
:::

## Vyprávění o projektu ve čtyřech větách

Skoro každé technické kolo začne větou „Vyberte si jeden svůj projekt a povězte mi o něm."
Tohle je nejlépe předvídatelná otázka celého náboru, a přitom na ni skoro nikdo není
připravený. Nauč se kostru a naplň ji jedním projektem:

1. **Co to je a pro koho.** Jedna věta, bez technologií.
   „Rozpis směn pro kavárnu, používá to pět brigádníků."
2. **Jak je to postavené.** Dvě věty o architektuře, ne výčet závislostí.
   „Frontend v Reactu volá vlastní API v Node, data jsou v SQLite. Stav serveru držím
   v TanStack Query, lokální stav v komponentách."
3. **Jeden problém, na který jsi narazil, a jak jsi ho vyřešil.** Tohle je jádro.
   „Dva lidi klikali na stejnou směnu zároveň a přepisovali si ji. Nejdřív jsem kapacitu
   kontroloval v prohlížeči, pak jsem to přesunul do transakce na serveru."
4. **Co bys udělal jinak.** „Stav směn jsem zpočátku držel ve třech komponentách
   a synchronizoval ho efekty; dnes bych rovnou začal s jedním zdrojem pravdy."

**Bod 3 je ten, který rozhoduje.** Připrav si ho dopředu doslova — včetně toho, co jsi
zkusil jako první a proč to nestačilo. Tazatel na něj naváže dalšími otázkami a vy dva
spolu najednou vedete odborný rozhovor místo zkoušení.

> [!TIP]
> Nacvič si celé vyprávění nahlas a změř si ho. Má trvat dvě až tři minuty. Když ti
> vyjde osm, vypouštíš nejdřív výčty technologií — ty tazatel vidí v CV.

:::check
Která část vyprávění o projektu rozhoduje o tom, jestli rozhovor pokračuje odborně?

### --answer--
Výčet použitých technologií a knihoven.

#### --why--
Tenhle výčet má tazatel před sebou v CV. Na něj nenaváže.

### --correct--
Konkrétní problém, na který jsi narazil, a to, jak jsi ho řešil — včetně první nefunkční varianty.

#### --why--
Je to jediná část, kterou nikdo jiný nemá stejnou, a tazatel na ni může navázat pěti dalšími otázkami.

### --see--
kariera-pohovor/technicky-pohovor#vypraveni-o-projektu-ve-ctyrech-vetach
:::

## Live coding: mluv nahlas

[[Live coding]] je programování před tazatelem, obvykle ve sdíleném editoru. Bývá to pro
uchazeče nejnepříjemnější část a přitom má nejjednodušší pravidla.

Pět kroků, které dělej **vždy, i u triviální úlohy**:

1. **Zopakuj zadání vlastními slovy.** „Takže mám z pole objednávek spočítat součet za
   každého zákazníka a vrátit to jako objekt, ano?" Půlka nedorozumění umře tady.
2. **Zeptej se na okrajové případy dřív, než začneš psát.** Může být pole prázdné?
   Může být cena záporná? Můžou být dvě objednávky se stejným ID?
3. **Řekni postup, než ho napíšeš.** „Projdu pole a budu si skládat objekt, kde klíč je
   zákazník. Použiju `reduce`, ale klidně to může být i `for…of`."
4. **Piš a komentuj, co děláš.** Ticho delší než deset vteřin je jediná věc, která tě
   v live codingu může doopravdy potopit.
5. **Až to běží, řekni, co bys zlepšil.** „Tohle je kvadratické, kdyby bylo objednávek
   sto tisíc, udělal bych si mapu."

> [!PITFALL]
> Nesnaž se rovnou o nejchytřejší řešení. Napiš nejdřív to nejhloupější, které funguje,
> řekni nahlas, že je hloupé, a pak ho zlepšuj. Tazatel uvidí obě verze a dostaneš body
> za obě.

A když se zasekneš, řekni přesně tohle: **„Teď jsem zaseknutý na tom, že…"** a pojmenuj
konkrétní místo. Tazatel skoro vždycky napoví. Nápověda tě nestojí body — o nápovědu
neumět požádat, to ano.

:::check
Co je při živém programování nejhorší, co můžeš udělat?

### --answer--
Napsat neefektivní řešení.

#### --why--
Neefektivní řešení je běžný a dobrý první krok — jen o něm musíš vědět.

### --correct--
Dlouho mlčet, protože tazatel pak nevidí, jak přemýšlíš, a nemůže ti pomoct.

#### --why--
Hodnotí se postup. Mlčení znamená, že není co hodnotit, a tazatel si domyslí to horší.

### --see--
kariera-pohovor/technicky-pohovor#live-coding-mluv-nahlas
:::

## Klasické [[whiteboard otázka|whiteboard otázky]] z JavaScriptu

Existuje krátký seznam úloh, které na juniorním pohovoru padnou pořád dokola. Neučí se
zpaměti — projdi si je a hlavně si zkus **odpovědět na otázku „proč"**, protože doplňující
otázka přijde vždycky.

Typická první úloha zní: *„Máš pole objednávek. Vrať objekt, kde klíč je jméno zákazníka
a hodnota součet jeho objednávek."*

```js
// 1. Připrav si výchozí hodnotu — prázdný objekt, do kterého se bude sčítat.
// 2. Projdi objednávky a ke klíči přičti částku.
// 3. Vrať naplněný objekt.
function soucetPodleZakaznika(objednavky) {
  return objednavky.reduce((soucty, objednavka) => {
    soucty[objednavka.zakaznik] = (soucty[objednavka.zakaznik] ?? 0) + objednavka.castka;
    return soucty;
  }, {});
}
```

Tři doplňující otázky, které k téhle úloze skoro vždy přijdou, a krátké odpovědi:

- **„Proč `?? 0` a ne `|| 0`?"** Protože `||` by nahradilo i platnou nulu; `??` reaguje
  jen na `null` a `undefined`.
- **„Co se stane, když zapomeneš `return soucty`?"** Akumulátor bude v dalším průchodu
  `undefined` a kód spadne. Nejčastější chyba v `reduce`.
- **„Šlo by to bez `reduce`?"** Šlo, `for…of` s objektem venku je čitelnější a často
  lepší volba. Tahle odpověď je plus, ne minus.

A ještě jedna klasika, na kterou se ptají kvůli tomu, jestli chápeš asynchronní běh:

:::live js predict
```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
```
--question-- V jakém pořadí se písmena vypíšou?
--expected--
```text
A
D
C
B
```
--why-- Nejdřív doběhne synchronní kód (`A`, `D`). Pak přijdou mikroúlohy, kam patří `then` (`C`), a teprve nakonec úlohy z fronty časovačů (`B`). `setTimeout(..., 0)` neznamená „hned", ale „co nejdřív po vyprázdnění zásobníku a mikroúloh".
:::

Zbytek seznamu, který se vyplatí projít: rozdíl `==` a `===`, co je [[hoisting]], rozdíl
mezi `let`, `const` a `var`, `this` v běžné a šipkové funkci, co dělá `map` oproti
`forEach`, mělká versus hluboká kopie, co je closure, jak funguje delegace událostí
a jak ošetříš chybu z `fetch`.

:::check
Proč je v úloze se součtem podle zákazníka lepší `?? 0` než `|| 0`?

### --answer--
Protože `||` je pomalejší operátor.

#### --why--
Rychlost se tu neliší. Rozdíl je v tom, na jaké hodnoty každý z nich reaguje.

### --correct--
Protože `||` by nahradilo i platnou nulu, kdežto `??` reaguje jen na `null` a `undefined`.

#### --why--
U součtů, počtů a cen je nula platná hodnota. `||` ji tiše zahodí a chyba se projeví až na datech, kde nula skutečně nastane.

### --see--
js-zaklady/porovnani-a-logika#vychozi-hodnota-misto
:::

## Frontend system design ve čtyřech krocích

U juniorů se [[system design]] objevuje v jednoduché podobě: *„Jak byste navrhl našeptávač
ve vyhledávání?"* nebo *„Jak byste udělal stránku s výpisem produktů a filtry?"*
Nečeká se hotová architektura, čeká se **uspořádaný postup**. Drž se čtyř kroků:

1. **Požadavky a rozsah.** Zeptej se dřív, než navrhuješ. Kolik položek? Musí to fungovat
   na mobilu? Je potřeba stav zachovat v adrese, aby šel odkaz poslat? Řekni nahlas i to,
   co **nebudeš** řešit.
2. **Data a komponenty.** Jaký tvar mají data, co si vyžádáš ze serveru a jak rozdělíš
   obrazovku na komponenty. Nakresli strom, i kdyby to byly tři odrážky.
3. **Stav a komunikace se serverem.** Co je stav serveru (data, cache, znovunačtení)
   a co je lokální stav (otevřený filtr, text v poli). Kdy se volá API, co se děje při
   psaní, jak zabráníš tomu, aby starší odpověď přepsala novější.
4. **Zbytek — a tady sbíráš body.** Stavy načítání, chyby a prázdna. Přístupnost
   (ovládání klávesnicí, oznámení počtu výsledků). Výkon (debounce, stránkování,
   virtualizace dlouhého seznamu). Co by se rozbilo při desetinásobku dat.

> [!TIP]
> Čtvrtý krok je ten, na kterém juniora poznají. Věta „při rychlém psaní může starší
> odpověď dorazit po novější a přepsat ji, takže si pamatuju pořadí nebo dřívější
> požadavek zruším přes `AbortController`" udělá na tazatele větší dojem než celý
> zbytek návrhu.

:::check
Ve kterém kroku frontend system designu se u juniorů nejčastěji pozná rozdíl mezi uchazeči?

### --answer--
V kroku, kde se kreslí strom komponent.

#### --why--
Strom komponent nakreslí skoro každý uchazeč podobně — moc to nerozlišuje.

### --correct--
Ve čtvrtém kroku: chybové a prázdné stavy, přístupnost, výkon a chování při souběhu odpovědí.

#### --why--
Je to část, na kterou se ve vlastních projektech nejčastěji zapomíná, takže ji zmíní jen ten, kdo na ni doopravdy narazil.

### --see--
kariera-pohovor/technicky-pohovor#frontend-system-design-ve-ctyrech-krocich
:::

## Když nevíš

Na tuhle situaci se dá připravit líp než na samotné otázky, protože nastane vždycky.

**Nefunguje:** ticho, hádání s jistotou v hlase, „to jsem nikdy nepotřeboval", vymýšlení
odpovědi z podobně znějících slov.

**Funguje** tenhle tvar o třech částech:

> „Tohle přesně nevím. Vím, že se to týká toho, jak prohlížeč… *(co víš z okolí)*.
> Kdybych na to narazil v práci, podíval bych se do *(kde konkrétně)* a ověřil si to
> *(jak)*."

Tazatel se dozví hranici tvých znalostí (což je informace, kterou chce) a zároveň, že se
umíš dostat k odpovědi sám. **Přiznaná neznalost s postupem je lepší odpověď než správná
odpověď bez zdůvodnění** — a v týmu je to přesně to chování, které chtějí.

:::check
Napiš, co uděláš ve chvíli, kdy se při živém programování zasekneš a nevíš, jak dál.

### --expected--
Řeknu nahlas, na čem přesně jsem zaseknutý.

### --accept--
pojmenuju nahlas konkrétní místo, kde jsem zaseknutý
řeknu nahlas, kde jsem zaseknutý, a požádám o nápovědu

### --why--
Pojmenované místo dá tazateli šanci napovědět a zároveň mu ukáže, že víš, kde je hranice. Nápověda body nestojí — neschopnost o ni požádat ano.
:::

:::explain
Kamarád tvrdí, že na pohovoru se nemá nikdy přiznat, že něco neví, protože „to vypadá
špatně". Vysvětli vlastními slovy, proč je to špatná rada.

## --model--
Tazatel má na hodinu jediný cíl — odhadnout, jaké to bude s tebou pracovat. Do toho
patří i odhad, kde končí tvoje znalosti, protože podle toho se rozhoduje, co ti půjde
zadat samostatně a co ne. Když neznalost zamaskuješ, tenhle odhad mu zkazíš, a navíc
riskuješ mnohem horší signál: že člověk, který neví, mluví stejně jistě jako člověk,
který ví. Takovému kolegovi se pak nedá věřit ani tam, kde má pravdu, a v týmu je to
drahé — někdo musí kontrolovat všechno. Přiznaná neznalost doplněná postupem, jak bych
si odpověď zjistil, naopak ukazuje obojí: hranici i schopnost ji posunout.

## --checklist--
- Tazatel potřebuje znát hranici tvých znalostí, ne jen jejich obsah.
- Jistě podaná domněnka je horší signál než přiznaná mezera.
- Kolega, u kterého nejde rozeznat jistotu od dohadu, vyrábí práci navíc.
- Popsaný postup ukazuje, že se k odpovědi umíš dostat sám.
:::

## Otázky, které se ptáš ty

Na konci padne „Máte nějaké otázky?" a odpověď „ne, všechno jsem se dozvěděl" je
promarněná příležitost. Dobrá otázka **ukazuje, jak přemýšlíš o práci**, a zároveň ti
dává informace, podle kterých se rozhodneš ty.

Otázky, které stojí za to položit:

- „Jak vypadá u vás první měsíc juniora? Kdo mu dělá review?"
- „Kolik z vaší práce je nová funkčnost a kolik údržba a opravy?"
- „Jak se u vás dostane změna od hotového kódu do produkce?"
- „Co bylo poslední větší technické rozhodnutí v týmu a jak jste se k němu dostali?"
- „Podle čeho poznáte za půl roku, že jsem uspěl?"

Poslední otázka je nejsilnější: **donutí je vyslovit očekávání nahlas** a ty se rovnou
dozvíš, podle čeho tě budou hodnotit. Z odpovědi taky poznáš, jestli to mají promyšlené.

## Typické chyby a pasti

> [!PITFALL]
> **Nepřipravené vyprávění o projektu.** Nejpředvídatelnější otázka celého náboru.
> Kdo na ni odpoví „no, je to taková aplikace na směny…", promarnil úvod.

> [!PITFALL]
> **Kritika bývalého zaměstnavatele nebo kolegů.** I když měli chybu oni, tazatel si
> představí, jak budeš jednou mluvit o něm.

> [!PITFALL]
> **Kód, který neumíš obhájit.** Dvojnásob u částí, které ti vygeneroval jazykový model.
> Projdi si celý odevzdaný projekt řádek po řádku dřív, než na něj pozveš tazatele.

> [!PITFALL]
> **Hádání s jistotou.** „Myslím, že `setTimeout` se provede dřív než `Promise`" řečené
> pevným hlasem je horší než „nejsem si jistý pořadím, ale vím, že mikroúlohy mají přednost".

## Kde to najdeš dál

- [JavaScript Questions (lydiahallie)](https://github.com/lydiahallie/javascript-questions) — sbírka otázek s vysvětlením, ideální na trénink.
- [Frontend Interview Handbook](https://www.frontendinterviewhandbook.com/) — přehled otázek včetně system designu.
- [MDN: Event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop) — pořadí úloh a mikroúloh.

# --questions--

## --question--

Při živém programování ti tazatel řekne úlohu. Co uděláš jako první?

### --answer--
Začnu psát kostru funkce, ať je vidět postup.

#### --why--
Psaní dřív než domluva na zadání vede k řešení jiné úlohy, než jaká byla zadaná.

### --correct--
Zopakuju zadání vlastními slovy a zeptám se na okrajové případy.

#### --why--
Ověření zadání a okrajových případů zabere půl minuty a je to první věc, kterou tazatel hodnotí.

### --see--
kariera-pohovor/technicky-pohovor#live-coding-mluv-nahlas

## --question--

Tazatel se zeptá na věc, kterou neznáš. Napiš, co odpovíš — jednou větou.

### --expected--
Tohle přesně nevím, ověřil bych si to v dokumentaci.

### --accept--
tohle nevím, podíval bych se do dokumentace a ověřil si to
nevím, ale vím, čeho se to týká, a zjistil bych si to

### --why--
Přiznaná mezera doplněná postupem dává tazateli obojí: hranici tvých znalostí a doklad, že si odpověď umíš najít sám.

### --see--
kariera-pohovor/technicky-pohovor#kdyz-nevis

## --question--

Ve vyprávění o vlastním projektu — co patří do třetí věty?

### --expected--
Konkrétní problém a jak jsi ho vyřešil.

### --accept--
problém, na který jsi narazil, a jeho řešení
jeden konkrétní problém a jak jsi ho řešil

### --why--
Je to jediná část vyprávění, kterou nemá nikdo jiný stejnou, a tazatel na ni naváže dalšími otázkami.

### --see--
kariera-pohovor/technicky-pohovor#vypraveni-o-projektu-ve-ctyrech-vetach

## --question--

Proč má smysl na konci pohovoru položit otázku „podle čeho poznáte za půl roku, že jsem uspěl?"

### --answer--
Protože působí sebevědomě.

#### --why--
Dojem je vedlejší efekt. Ta otázka má konkrétní praktický přínos pro tebe.

### --correct--
Protože firmu donutí vyslovit očekávání nahlas a ty se dozvíš, podle čeho tě budou hodnotit.

#### --why--
Z odpovědi navíc poznáš, jestli to mají promyšlené — nebo jestli to vymýšlejí až u tvé otázky.

### --see--
kariera-pohovor/technicky-pohovor#otazky-ktere-se-ptas-ty

## --question--

**Opakování z dřívějška.** Tazatel ukáže tenhle kód a ptá se, proč `this.pocet`
nefunguje:

```js
class Kosik {
  constructor() {
    this.pocet = 0;
    document.querySelector('#pridat').addEventListener('click', function () {
      this.pocet += 1;
    });
  }
}
```

Co je příčina?

### --answer--
Posluchač se připojil dřív, než prvek existoval.

#### --why--
To by skončilo chybou při `addEventListener`, ne špatnou hodnotou `this`.

### --correct--
Běžná funkce má vlastní `this`; v posluchači ukazuje na prvek, na kterém událost běží, ne na instanci `Kosik`.

#### --why--
Šipková funkce vlastní `this` nemá a převezme ho z místa vzniku — proto se v callbacích používá ona.

### --see--
js-funkce-hloubka/this#ztracene-this-v-callbacku

## --question--

**Opakování z dřívějška.** Navrhuješ seznam produktů s filtry a chceš, aby šel
odkaz na vyfiltrovaný výsledek poslat kolegovi. Kam v takovém případě patří stav filtrů?

### --expected--
Do adresy URL.

### --accept--
do URL, do query parametrů
do adresy stránky (URLSearchParams)
query string

### --why--
Stav, který má jít sdílet, obnovit nebo vrátit tlačítkem Zpět, patří do adresy. `localStorage` je pro stav vázaný na zařízení, proměnná v paměti pro stav, který přežít nemá.

### --see--
js-dom/prohlizecova-api#adresa-localstorage-nebo-promenna
