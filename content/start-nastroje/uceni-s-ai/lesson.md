# Učení s AI bez zkratek

:::check pretest
Máš za úkol napsat navigaci webu a zasekneš se. Které zadání pro AI ti pomůže víc se to naučit?

### --answer--
„Napiš mi HTML navigace s odkazy Domů, Menu a Kontakt."

#### --why--
Dostaneš funkční kód, ale přemýšlení za tebe udělal někdo jiný. Příště budeš stát na stejném místě.

### --correct--
„Učím se HTML. Neříkej mi řešení. Ptej se mě otázkami, dokud navigaci nenapíšu sám."

#### --why--
Takové zadání tě nutí vybavovat si a přemýšlet. Přesně z toho se učení skládá.
:::

Weby jsi dosud stavěl s pomocí AI. Fungovaly, ale nedokázal bys vysvětlit proč,
a bez AI bys je nenapsal. To není selhání AI. Model udělal, co jsi chtěl: napsal
řešení. Jenže řešení nebylo to, co jsi potřeboval. Potřeboval jsi **umět ho napsat**.

AI umí být skvělý učitel, který má čas vždycky a nikdy se nezlobí. Umí ale být i zkratka,
která učení tiše vezme: kód funguje, ty máš dobrý pocit a v hlavě nezůstane nic.
Rozdíl nedělá nástroj, ale to, co po něm chceš.

> [!REMEMBER]
> **AI ti má pomáhat přemýšlet, ne přemýšlet za tebe.** Když ti napíše řešení dřív, než ses o něj pokusil sám, učení skončilo.

## Nejdřív vlastní pokus a hypotéza

Než AI otevřeš, udělej dvě věci:

1. **Zkus to sám**, i když napůl. Rozepsaný kód ukáže, co víš a kde přesně se to láme.
2. **Řekni si hypotézu**: „Myslím, že se obrázek nezobrazí, protože je špatná cesta."
   I špatná hypotéza pomáhá, protože ji můžeš ověřit.

Teprve pak se ptej, a ptej se na ten zlom, ne na celý úkol. „Proč tahle cesta nefunguje,
když soubor existuje?" je otázka, ze které se něco naučíš. „Oprav mi to" není.

Jako u předpovědí v Akademii: chyba ve vlastním pokusu tě nic nestojí a ukáže, co opravit
v hlavě. Když ti AI dá odpověď dřív, o tuhle chybu přijdeš.

:::check
Proč napsat hypotézu dřív, než se zeptáš AI, i když si nejsi jistý, že je správná?

### --answer--
Aby AI dostala víc kontextu a napsala lepší kód.

#### --why--
Myslíš si, že hypotéza je hlavně pro AI? Kontext pomůže, ale hlavní smysl je tvoje přemýšlení. Hypotézu potřebuješ, i když se neptáš nikoho.

### --correct--
Protože tě donutí přemýšlet o příčině a odpověď pak porovnáš se svou představou.

#### --why--
Srovnání „myslel jsem X, ve skutečnosti Y" opraví model v hlavě. Bez hypotézy odpověď jen přečteš.

### --answer--
Protože AI bez hypotézy odmítne odpovědět.

#### --why--
Myslíš si, že je to technická podmínka? AI odpoví na cokoli. Jde o to, co z odpovědi budeš mít ty.
:::

## AI jako tutor, ne jako autor řešení

Stejný problém, dvě zadání:

| AI píše za tebe | AI tě učí |
|---|---|
| „Oprav mi tenhle kód." | „Co znamená tahle chybová hláška? Kód neopravuj." |
| „Napiš formulář pro rezervaci stolu." | „Jaké prvky patří do formuláře a proč `label`? Kód nepiš." |
| „Proč to nefunguje? Pošli opravený soubor." | „Myslím, že je chyba v cestě k souboru. Mám pravdu? Neříkej opravu, jen kde hledat." |

Dobré použití AI při učení:

- **Vysvětli pojem** jinými slovy nebo na jiném příkladu, když výklad nesedl.
- **Přelož chybovou hlášku** do češtiny a řekni, co obvykle znamená.
- **Zkontroluj moje vysvětlení**: napíšeš, jak věci rozumíš, a necháš si najít díry.
- **Vymysli mi cvičení** na věc, kterou jsi právě probral, a řešení neprozrazuj.

Věta „kód nepiš" nebo „neříkej řešení" v zadání opravdu mění odpověď. Bez ní AI
automaticky nabídne hotový kód, protože to po ní chce většina lidí.

:::check
Které zadání podporuje učení?

### --answer--
„Tady je můj CSS soubor, udělej ho hezčí."

#### --why--
Myslíš si, že uvidíš změny, a tak se je naučíš? Dostaneš hotový soubor a nevíš, co se změnilo ani proč.

### --correct--
„Tohle je hláška z konzole. Vysvětli, co znamená, a zeptej se mě, kde myslím, že je chyba. Opravu nepiš."

#### --why--
Dostaneš vysvětlení a přemýšlení o příčině zůstane na tobě.

### --answer--
„Napiš mi celé řešení úlohy, ať vidím, jak se to dělá správně, a pak to zkusím."

#### --why--
Myslíš si, že po přečtení řešení to zkusíš sám? Zkusit to po přečtení je opisování z paměti, ne vlastní pokus.
:::

## Sokratovské zadání

Nejsilnější způsob, jak AI při učení použít, je nechat ji ptát se. Říká se tomu
sokratovská metoda: učitel neříká odpovědi, jen klade otázky, dokud na odpověď nepřijdeš sám.

Zadání, které si můžeš uložit a používat:

```text
Učím se webový vývoj. Právě řeším: [co děláš].
Můj kód: [minimální příklad].
Čekal jsem: [co], stalo se: [co].
Neříkej mi řešení ani opravený kód. Ptej se mě po jedné otázce,
dokud na chybu nepřijdu sám. Když se zaseknu dvakrát, dej mi malou nápovědu.
```

Všimni si, že je to stejná struktura jako dobrá otázka z lekce
[Jak se učit v Akademii](see:start-nastroje/jak-se-ucit-v-akademii#jak-se-ptat-kdyz-nevis).
Když ji vyplníš, často na chybu přijdeš dřív, než zadání odešleš.

> [!PITFALL]
> **Po třech otázkách napíšeš „tak mi to prostě řekni".** AI to udělá a sokratovský
> rozhovor skončí stejně jako zkratka. Když už nemůžeš, řekni si o *malou nápovědu*,
> ne o řešení, nebo si dej pauzu a vrať se k tomu za hodinu.

:::check
Jsi uprostřed sokratovského rozhovoru a třetí otázku nevíš. Co uděláš?

### --answer--
Napíšu „tak mi to už řekni", protože jinak se nehnu.

#### --why--
Myslíš si, že jiná cesta není? Tím rozhovor skončí jako zkratka a o vlastní objev přijdeš.

### --correct--
Řeknu si o malou nápovědu k té jedné otázce, nebo si dám pauzu.

#### --why--
Nápověda posune přemýšlení o kousek, ale nechá ho na tobě. Stejně fungují tipy po stupních v Akademii.

### --answer--
Začnu nový rozhovor a zadám úkol znovu bez zákazu řešení.

#### --why--
Myslíš si, že je to jiná cesta? Je to stejná zkratka, jen delší.
:::

## Sebejistý omyl: ověřuj v MDN

AI píše plynule a sebejistě i tehdy, když se mýlí. Nepozná to z tónu ani ty, ani ona.
Proto každé tvrzení, na kterém něco stavíš, **ověř v dokumentaci** (MDN) nebo
**vyzkoušej** na malé ukázce.

Příklad. Na otázku „Co se stane, když zapomenu uzavřít `<li>`?" odpoví model sebejistě:
„Prohlížeč takový seznam nevykreslí a v konzoli ukáže chybu, proto uzavírací značky vždy piš."
Rada na konci je dobrá, ale tvrzení je špatně. Ověř si to:

:::live predict
```html
<h2>Tento týden pečeme</h2>
<ul>
  <li>Švestkový koláč
  <li>Mrkvový dort
  <li>Skořicový šnek
</ul>
```
```css
body { font-family: system-ui, sans-serif; }
```
--question-- Co prohlížeč s neuzavřenými položkami `<li>` udělá?
--option-- Seznam nevykreslí a v konzoli bude chyba.
--option*-- Vykreslí normální seznam se třemi položkami.
--option-- Vykreslí jednu položku, ve které jsou všechny tři texty vnořené do sebe.
--why-- HTML parser je tolerantní: nový `<li>` automaticky uzavře předchozí a `</ul>` uzavře poslední. Uzavírací značky piš kvůli čitelnosti a menšímu riziku chyb, ale stránka bez nich nespadne. Tvrzení AI „nevykreslí a ukáže chybu" je sebejistý omyl.
:::

Zkus po odhalení vymazat i `</ul>` a za seznam napsat odstavec. Sleduj, kam se odstavec dostane.

> [!TIP]
> Ptej se AI rovnou na zdroj: „Kde to stojí v MDN? Pošli odkaz." Pak odkaz otevři
> a přečti si to. Když odkaz nevede nikam nebo tam to tvrzení není, věř MDN.

:::check
AI ti tvrdí, že určitá CSS vlastnost „funguje ve všech prohlížečích". Co uděláš, než ji použiješ na webu kavárny?

### --answer--
Nic, AI má přístup k dokumentaci, takže to ví.

#### --why--
Myslíš si, že plynulá odpověď znamená ověřenou? Model generuje pravděpodobný text a umí se mýlit stejně sebejistě jako mít pravdu.

### --correct--
Najdu vlastnost v MDN a podívám se do tabulky podpory v prohlížečích.

#### --why--
MDN má u každé vlastnosti tabulku kompatibility. Tvrzení, na kterém stavíš, ověř u zdroje.

### --answer--
Zeptám se AI znovu, jestli si je jistá.

#### --why--
Myslíš si, že druhá odpověď je kontrola? Model často zopakuje totéž, nebo se omluví a změní názor bez ohledu na pravdu. Ani jedno není ověření.
:::

## Nikdy nekopíruj kód, kterému nerozumíš

Pravidlo pro celý kurz i pro práci: **kód, který nedokážeš vysvětlit řádek po řádku,
do projektu nepatří.** Nejde o morálku. Kód, kterému nerozumíš, neopravíš, až se rozbije,
a u pohovoru ho neobhájíš.

Když od AI kód dostaneš (třeba v projektu mimo kurz), udělej s ním tohle:

1. Přečti každý řádek a řekni nahlas, co dělá.
2. Na řádek, kterému nerozumíš, se zeptej zvlášť nebo ho najdi v MDN.
3. Něco v kódu změň a předpověz, co se stane. Pak to ověř.

> [!PITFALL]
> **„Funguje to, tak to nechám."** Zkopírovaný blok často obsahuje věci navíc: knihovnu,
> kterou nepotřebuješ, pravidlo, které přebije tvoje styly, nebo zastaralý zápis.
> Za týden nevíš, který řádek je tvůj a který ne, a oprava jedné věci rozbije druhou.

:::check
Dostaneš od AI 20 řádků CSS a dva z nich nechápeš. Web vypadá dobře. Co s tím?

### --answer--
Nechat to být, hlavně že to funguje.

#### --why--
Myslíš si, že funkční znamená hotové? Až se ty dva řádky s něčím pobijí, nebudeš vědět, kde hledat.

### --answer--
Ty dva řádky smazat.

#### --why--
Myslíš si, že nepochopený kód je zbytečný? Možná na něm něco závisí. Smazat ho naslepo je stejný hazard jako ho naslepo nechat.

### --correct--
Zjistit, co ty dva řádky dělají (MDN, otázka na konkrétní řádek), a ověřit to změnou.

#### --why--
Až potom je to tvůj kód a víš, jestli ho potřebuješ.
:::

## Kdy AI vypnout

Některé chvíle v kurzu jsou tu proto, aby ukázaly, co umíš **ty**. S AI by ukázaly, co umí AI.

| situace | AI | proč |
|---|---|---|
| první pokus o krok nebo úlohu | vypnout | bez vlastního pokusu se nic nevybaví |
| kvízy, kontrolní otázky, předpovědi | vypnout | ukazují, co opravdu víš; jinak ti opakování naplánuje špatně |
| laby a projekty | vypnout, nejvýš vysvětlení pojmu | ověřují, že látka sedla |
| opakování | vypnout | celý smysl je vybavit si to z hlavy |
| výklad nesedl, chceš jiný příklad | zapnout | vysvětlení tě nepřipraví o přemýšlení |
| nerozumíš chybové hlášce ani po přečtení | zapnout, bez opravy kódu | přeložit hlášku je práce slovníku |

Kurz se k AI vrátí v pozdější sekci o práci s AI, kde se naučíš ji používat při práci
na skutečných projektech. Při učení ale platí tahle tabulka.

:::check
Ve kvízu na konci sekce nevíš jednu odpověď. Proč nemá smysl se zeptat AI?

### --answer--
Protože kvíz nejde splnit, když aplikace pozná, že odpověď přišla odjinud.

#### --why--
Myslíš si, že tě kvíz hlídá? Nehlídá. Právě proto záleží jen na tom, co z něj chceš mít.

### --correct--
Protože kvíz má ukázat, co umím, a podle výsledků se mi naplánuje opakování.

#### --why--
Špatná odpověď pošle otázku do opakování zítra. Opsaná správná odpověď ji odsune o dny a díra v látce zůstane.

### --answer--
Protože AI na otázky z kvízu odpovídat neumí.

#### --why--
Myslíš si, že AI na to nestačí? Nejspíš by odpověděla správně. O to tady nejde.
:::

:::explain
Vysvětli vlastními slovy, proč hotové řešení od modelu učení spíš uškodí než pomůže.

## --model--
Učení vzniká v okamžiku, kdy se vlastní pokus setká se zpětnou vazbou — když si něco
myslím, zkusím to a zjistím, že je to jinak. Hotové řešení tenhle okamžik přeskočí:
kód přečtu, rozumím mu (čtení je snadné), a mám pocit, že to umím. Jenže ten pocit
vzniká z rozpoznání, ne z vybavení — a při dalším podobném úkolu se ukáže, že to bez
předlohy nenapíšu. Proto je užitečnější mít model jako **tutora, který se ptá**: dá
protipříklad, navede otázkou, opraví domněnku. Odpověď pak vznikne v mé hlavě, a to je
přesně ta část, která se pamatuje.

## --checklist--
- Učení vzniká z vlastního pokusu a zpětné vazby.
- Čtení hotového kódu vyvolá pocit porozumění bez schopnosti ho napsat.
- Rozpoznat řešení je snadnější než vybavit si ho.
- Otázka a protipříklad nechají závěr na mně.
:::

## Kde to najdeš v MDN

- [Research and learning](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Soft_skills/Research_and_learning): jak hledat odpovědi a ověřovat, co najdeš.
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web): dokumentace HTML, CSS a JavaScriptu, u které ověřuješ tvrzení. U každé vlastnosti je dole tabulka *Browser compatibility*.

Příště otevřeš VS Code a naučíš se v něm pracovat se složkou projektu.

# --questions--

## --question--

Kamarád tvrdí: „S AI se učím rychleji, protože mi hned napíše správné řešení a já ho pochopím." V čem se mýlí?

### --answer--

V ničem. Když řešení pochopí, naučil se ho.

#### --why--

Myslíš si, že pochopit hotové řešení je totéž jako ho umět napsat? Porozumění při čtení je povědomost. Napsat to sám znamená vybavit si to, a to z řešení nezíská.

### --correct--

Porozumět hotovému řešení není totéž jako ho umět napsat. Vlastní pokus a vybavování mu chybí.

#### --why--

Učení vzniká namáhavým vybavováním. Hotové řešení tuhle práci přeskočí.

### --answer--

AI řešení píše vždycky špatně, takže se učí chyby.

#### --why--

Myslíš si, že problém je v kvalitě kódu? Kód může být správný, a stejně se z něj nenaučí.

### --see--

start-nastroje/uceni-s-ai#nejdriv-vlastni-pokus-a-hypoteza

## --question--

Jak se jmenuje metoda, kdy ti učitel (nebo AI) neříká odpovědi, jen klade otázky, dokud na řešení nepřijdeš sám? Stačí přídavné jméno.

### --expected-- ignore-case

sokratovská

### --accept--

sokratovská metoda
sokratovske
sokratovská metoda výuky

### --why--

Sokratovská metoda: otázky místo odpovědí. Zadání pro AI k tomu potřebuje výslovný zákaz prozradit řešení.

### --see--

start-nastroje/uceni-s-ai#sokratovske-zadani

## --question--

AI ti poradí, že `<br>` se musí psát jako `<br/>`, jinak stránka nebude validní. Kde to ověříš? Napiš zkratku zdroje dokumentace, který kurz používá.

### --expected-- ignore-case

MDN

### --accept--

MDN Web Docs
developer.mozilla.org

### --why--

MDN u prvku `<br>` uvádí, že je to prázdný prvek a lomítko v HTML nic nedělá: `<br>` i `<br/>` jsou platné. Tvrzení „jinak nebude validní" je další sebejistý omyl.

### --see--

start-nastroje/uceni-s-ai#sebejisty-omyl-overuj-v-mdn
