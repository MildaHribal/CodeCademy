# AI jako tutor

:::check pretest
Máš před sebou chybovou hlášku, které nerozumíš. Co ti z dlouhodobého hlediska pomůže víc — dostat hotovou opravu, nebo dostat otázku, která tě k opravě dovede?

### --expected--
Dostat otázku.
:::

Model umí dvě různé věci a ty se navzájem vylučují. Umí za tebe napsat kód — a umí tě
naučit ten kód napsat. Když ho necháš dělat obojí najednou, dostaneš to první a myslíš
si, že jsi dostal obojí. Tahle lekce je o tom, jak si vynutit to druhé, a hlavně kdy
se to vyplatí.

> [!REMEMBER]
> **Rozhodni se před odesláním promptu, jestli je tohle chvíle na práci, nebo na učení.**
> Stejný nástroj, dva úplně jiné prompty a dva jiné výsledky v tvé hlavě.

## 1. Proč hotové řešení nezůstane v hlavě

Když si vybavíš odpověď sám, zapamatuješ si ji řádově líp, než když si ji přečteš.
Když se přitom chvíli trápíš, zapamatuješ si ji ještě líp. Tohle je nejlíp doložený
poznatek z výzkumu učení vůbec — a kopírování hotového kódu je jeho přesný opak.
Kód, který jsi přečetl a vložil, jsi zpracoval jako text, ne jako postup.

Prakticky to poznáš takhle: za týden otevřeš stejný problém a opíšeš si ho znovu
z chatu. Kdybys ho tehdy napsal sám, hledal bys maximálně jeden detail.

:::live js predict
```js
const hodnoceni = [5, 3, 10, 1];
hodnoceni.sort();
console.log(hodnoceni.join(', '));
```
--question-- Odhadni výstup dřív, než ho spustíš — a hlavně dřív, než se zeptáš modelu. Co se vypíše?
--expected--
```text
1, 10, 3, 5
```
--why-- `sort()` bez porovnávací funkce převede prvky na text a řadí abecedně, takže `10` je před `3`. Tohle je přesně ten typ věci, kterou si zapamatuješ, jen když ses na ni nejdřív spletl sám.
:::

:::check
Proč je lepší na odpověď nejdřív minutu marně myslet, než ji rovnou přečíst?

### --answer--
Protože pak je odpověď kratší a snáz se pamatuje.

#### --why--
Délka odpovědi se pokusem o vybavení nemění — mění se to, co dělá tvoje hlava.

### --correct--
Protože pokus o vybavení a chvíle nejistoty výrazně zvyšují šanci, že si odpověď zapamatuješ.

#### --why--
Neúspěšný pokus není ztracený čas: připraví hlavu na to, aby se správná odpověď měla kam uložit.

### --see--
prace-s-ai/ai-jako-tutor#1-proc-hotove-reseni-nezustane-v-hlave
:::

## 2. Sokratovský tutor

[[sokratovský tutor|Sokratovský tutor]] je role, do které model musíš postavit výslovně,
protože sám od sebe vždycky sáhne po hotové odpovědi — ta je v datech nejčastější.
Rozdíl mezi dvěma prompty na tentýž problém:

:::compare
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; color: #1f2937; background: #fff; }
.prompt { border-radius: .6rem; padding: .8rem 1rem; margin-bottom: .6rem; font-size: .95rem; line-height: 1.45; }
.ja { background: #e0f2fe; }
.model { background: #f3f4f6; }
.stitek { display: block; font-size: .7rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin-bottom: .3rem; }
.vysledek { font-weight: 600; color: #b91c1c; }
.vysledek.dobre { color: #15803d; }
```
--variant-- Prompt, po kterém umíš míň
```html
<div class="prompt ja"><span class="stitek">Já</span>Oprav mi tenhle kód, hází to TypeError.</div>
<div class="prompt model"><span class="stitek">Model</span>Jasně, tady je opravená verze celé funkce…</div>
<p class="vysledek">Výsledek: kód funguje, ty nevíš proč.</p>
```
--variant-- Prompt, po kterém umíš víc
```html
<div class="prompt ja"><span class="stitek">Já</span>Tenhle kód hází <code>TypeError: cena.toFixed is not a function</code>. Neopravuj to. Řekni mi, na co se mám u toho řádku podívat, a polož mi jednu otázku, která mě k příčině dovede.</div>
<div class="prompt model"><span class="stitek">Model</span>Podívej se, odkud hodnota <code>cena</code> přichází. Jakého typu je, když ji načteš z formuláře?</div>
<p class="vysledek dobre">Výsledek: příčinu najdeš ty a zapamatuješ si ji.</p>
```
:::

Prompt tutora má čtyři části a všechny jsou potřeba:

1. **Kontext** — co se učíš a co už umíš („dělám třetí týden v JavaScriptu, pole a objekty znám").
2. **Zákaz řešení** — „nedávej mi hotový kód ani opravenou verzi".
3. **Co místo toho chceš** — vysvětlení pojmu, ukázku **na jiných datech**, nebo návodnou otázku.
4. **Kontrolu** — „až odpovím, řekni mi, co mi v odpovědi chybí."

> [!TIP]
> Vlastní instrukce (*custom instructions*, [[systémový prompt]]) si nastav jednou a platí
> pro všechny konverzace: „Jsem student programování. Nedávej mi hotová řešení, dokud
> o ně výslovně nepožádám slovem ŘEŠENÍ. Vysvětluj na příkladu z jiné domény, než je
> můj kód." Slovo pro vypnutí je důležité — v práci hotové řešení chceš.

:::check
Která část promptu pro tutora nejvíc snižuje šanci, že dostaneš hotový kód?

### --answer--
Popis toho, co už umíš.

#### --why--
Kontext zlepší úroveň vysvětlení, ale sám o sobě hotovému řešení nezabrání.

### --correct--
Výslovný zákaz řešení spolu s tím, co chceš místo něj.

#### --why--
Model jde ve výchozím stavu k odpovědi. Musíš mu dát jiný cíl, ne jen zákaz.

### --see--
prace-s-ai/ai-jako-tutor#2-sokratovsky-tutor
:::

## 3. Nech se vyzkoušet

Druhá role, na kterou se model hodí výborně, je zkoušející. Tady nejde o vysvětlení,
ale o vybavování — a to je ta dovednost, kterou potřebuješ u pohovoru i nad prázdným
souborem.

Funkční zadání zní takhle:

> Zkoušej mě z `Promise` a `async/await`. Pokládej otázky po jedné a čekej na moji
> odpověď. Po každé odpovědi mi řekni, co v ní chybělo, a pak polož další otázku.
> Střídej otázky na pojmy s otázkami „co vypíše tenhle kód".

Dvě pravidla, bez kterých to nefunguje:

- **Odpověz dřív, než si přečteš pokračování.** Napiš odpověď do chatu, i kdyby byla
  špatná. Přečtená otázka bez pokusu o odpověď je jen další text.
- **Nech si říct, co ti chybělo, ne jestli to bylo správně.** „Ano/ne" nepomůže.
  Seznam chybějících myšlenek ano.

:::explain
Vysvětli vlastními slovy, čím se liší to, co se ti usadí v hlavě po pěti minutách
zkoušení od modelu, a po pěti minutách čtení jeho vysvětlení téhož tématu.

## --model--
Při čtení zpracovávám hotový text a mám pocit porozumění, protože všemu rozumím ve chvíli,
kdy to čtu — ale nezkusil jsem si nic vytáhnout z vlastní hlavy. Při zkoušení musím
odpověď sestavit sám, takže zjistím, co doopravdy umím a co jsem jen četl, a každý pokus
o vybavení tu vzpomínku posílí. Zkoušení navíc odhalí mezery adresně: dozvím se, která
konkrétní myšlenka mi v odpovědi chyběla, zatímco po čtení mám jen dojem, že to zhruba chápu.

## --checklist--
- Čtení vytváří pocit porozumění bez vybavování.
- Pokus o vybavení posiluje paměť víc než opakované čtení.
- Zkoušení ukáže konkrétní mezeru, ne jen celkový dojem.
:::

:::check
Proč se u zkoušení od modelu vyplatí odpověď napsat do chatu, i když víš, že bude špatná?

### --answer--
Protože model podle ní pozná tvoji úroveň a příště se přizpůsobí.

#### --why--
Přizpůsobení je příjemný vedlejší efekt, ale hlavní zisk je ve tvé hlavě, ne v jeho odpovědi.

### --correct--
Protože i neúspěšný pokus o vybavení připraví hlavu na to, aby se správná odpověď měla kam uložit.

#### --why--
Přečtená otázka bez pokusu o odpověď je jen další text, ze kterého si nic neodneseš.

### --see--
prace-s-ai/ai-jako-tutor#3-nech-se-vyzkouset
:::

## 4. Tutor si vymýšlí stejně jako programátor

Vysvětlení je text jako každý jiný, takže platí všechno z první lekce. Model ti
sebejistě popíše pravidlo, které neexistuje, zamění dva pojmy nebo ti vysvětlí chování
verze knihovny, kterou nepoužíváš. Nebezpečí je tu větší než u kódu: **špatné vysvětlení
se nespustí, takže ti ho nic nevyvrátí.** Uložíš si do hlavy chybu a budeš na ní stavět.

Tři laciné pojistky:

- **Nech si ukázat kód, který to dokazuje**, a spusť ho. Vysvětlení, které se nedá
  předvést, je podezřelé.
- **Ověř pojmenování v dokumentaci.** Vysvětlení může být správné, ale pojem přejmenovaný.
- **Zeptej se na protipříklad:** „Kdy tohle pravidlo neplatí?" Vymyšlené pravidlo obvykle
  nemá žádné hranice, skutečné je má.

:::check
Proč je chybné **vysvětlení** zrádnější než chybný **kód**?

### --answer--
Protože vysvětlení bývá delší, takže se v něm chyba snáz schová.

#### --why--
Délka s tím nesouvisí — i jednou větou se dá říct něco zásadně špatně.

### --correct--
Protože kód se dá spustit a chyba se ukáže, kdežto vysvětlení ti nic nevyvrátí a zůstane v hlavě.

#### --why--
Proto se u vysvětlení vyplatí chtít ukázku, která se dá spustit.

### --see--
prace-s-ai/ai-jako-tutor#4-tutor-si-vymysli-stejne-jako-programator
:::

## 5. Kdy nástroj vypnout

[[našeptávač kódu|Našeptávač]] v editoru je jiná kategorie než chat: nemusíš se ho ptát,
sám nabídne pokračování řádku. To je v práci skvělé a při učení zničující, protože
zmizí ta chvíle, kdy si máš vzpomenout.

Vypni ho, když:

- **se učíš nový zápis** — syntaxi tříd, generiky, regulární výrazy. Prvních pár
  desítek napsání musí jít z hlavy,
- **děláš cvičení nebo lab** — hodnota cvičení je přesně to úsilí, které našeptávač ušetří,
- **se připravuješ na pohovor** — na whiteboardu ani ve sdíleném editoru ho mít nebudeš,
- **ladíš vlastní chybu** — nabídka „opravené" verze ti sebere trénink hledání příčiny.

Naopak ho nech zapnutý na opakující se kód, který už umíš (další testovací případ,
další pole formuláře, další migrace) a na jazyky, které používáš občas.

> [!PITFALL]
> Nejtišší škoda nevzniká z toho, že něco neumíš napsat. Vzniká z toho, že si přestaneš
> všímat, že něco neumíš napsat — našeptávač ti tu informaci sebere dřív, než k tobě
> dorazí. Jednou za čas si napiš krátkou funkci s vypnutým editorem. Trvá to pět minut
> a dozvíš se pravdu.

:::check
V jaké situaci má našeptávač v editoru zapnutý zůstat?

### --answer--
Když se poprvé učíš zápis regulárních výrazů.

#### --why--
První desítky napsání jsou přesně ta část, kterou si nesmíš nechat vzít.

### --correct--
Když píšeš další z řady velmi podobných věcí, které už umíš — třeba desátý testovací případ.

#### --why--
Tam už se nic nového neučíš a našeptávač jen šetří čas.

### --see--
prace-s-ai/ai-jako-tutor#5-kdy-nastroj-vypnout
:::

## 6. Typické chyby a pasti

> [!PITFALL]
> **„Chápu to" místo „umím to".** Po přečtení vysvětlení máš pocit porozumění, který
> zmizí nad prázdným souborem. Zkouška je jediná: zavři chat a napiš to.

> [!PITFALL]
> **Dohadování se s modelem.** Když trváš na svém, model obvykle ustoupí a přitaká i
> nesmyslu. Spor s modelem nerozhoduje argument, ale spuštěný kód.

> [!PITFALL]
> **Tutor na míru bez kontroly.** Model přizpůsobí vysvětlení tvé úrovni tak, že ti
> zamlčí důležitou výjimku. Zeptej se explicitně: „Co jsi mi pro zjednodušení neřekl?"

> [!PITFALL]
> **Vypnutý našeptávač jen na cvičení v Akademii.** Pokud ho necháš zapnutý na vlastních
> projektech, kde se učíš nejvíc, opatření nic neřeší.

:::check
Jak si ověříš, že ti tutor pro zjednodušení nezamlčel důležitou výjimku?

### --answer--
Požádám ho, aby vysvětlení zopakoval jinými slovy.

#### --why--
Jiná slova vyrobí jinou formulaci téhož zjednodušení, ne chybějící výjimku.

### --correct--
Zeptám se přímo: „Co jsi mi pro zjednodušení neřekl a kdy tohle pravidlo neplatí?"

#### --why--
Přímá otázka na hranice pravidla vytáhne výjimky, které model sám od sebe nezmíní.

### --see--
prace-s-ai/ai-jako-tutor#6-typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [Retrieval Practice](https://www.retrievalpractice.org/library) — shrnutí výzkumu vybavování z paměti.
- [Make It Stick](https://www.retrievalpractice.org/make-it-stick) — knížka o tom, proč snadné učení nefunguje.
- [MDN: Learn web development](https://developer.mozilla.org/en-US/docs/Learn_web_development) — zdroj, proti kterému si vysvětlení ověřuješ.

# --questions--

## --question--

Přepiš prompt „jak funguje `reduce` v JS?" tak, aby z něj vznikl prompt pro tutora.
Napiš, co do něj musíš přidat kromě otázky samotné.

### --expected--
zákaz hotového řešení a žádost o ukázku na jiných datech

### --accept--
zákaz hotového kódu a návodnou otázku
zákaz řešení, kontext a návodnou otázku
nedávej mi hotový kód, vysvětli koncept a polož otázku

### --why--
Bez výslovného zákazu model sáhne po hotové odpovědi. Bez toho, co chceš místo toho
(vysvětlení, ukázka jinde, otázka), dostaneš jen kratší hotovou odpověď.

### --see--
prace-s-ai/ai-jako-tutor#2-sokratovsky-tutor

## --question--

Model ti vysvětlil, že „`const` u pole zabrání i změně jeho obsahu". Jaký je nejlevnější
způsob, jak si to ověřit?

### --expected--
Spustit tři řádky kódu, které to zkusí.

### --accept--
spustím si to
napíšu si kód a spustím ho
zkusím push do const pole

### --why--
`const` hlídá přiřazení do proměnné, ne obsah pole — `pole.push(1)` projde. Tohle je
přesně ten druh vysvětlení, který si musíš nechat předvést kódem.

### --see--
prace-s-ai/ai-jako-tutor#4-tutor-si-vymysli-stejne-jako-programator

## --question--

Proč se doporučuje nechat si po odpovědi říct, **co v ní chybělo**, místo „bylo to
správně?"

### --answer--
Protože model nedokáže posoudit, jestli je odpověď správná.

#### --why--
Posoudit odpověď obvykle zvládne — problém je v tom, co ti to dá.

### --correct--
Protože seznam chybějících myšlenek ukáže konkrétní mezeru, kdežto „ano/ne" ti nedá, na čem pracovat.

#### --why--
Stejný princip jako u checklistu v `:::explain`: porovnáváš myšlenky, ne slova.

### --see--
prace-s-ai/ai-jako-tutor#3-nech-se-vyzkouset

## --question--

Kdy dává smysl našeptávač kódu v editoru nechat zapnutý?

### --answer--
Vždycky — psaní zrychluje a chyby stejně odhalí testy.

#### --why--
U věcí, které se zrovna učíš, to zrychlení platíš tím, že se je nenaučíš.

### --correct--
U opakujícího se kódu, který už bezpečně umíš napsat sám.

#### --why--
Tam našeptávač nebere žádné vybavování, protože už není co si vybavovat.

### --see--
prace-s-ai/ai-jako-tutor#5-kdy-nastroj-vypnout

## --question--

**Opakování z dřívějška.** Zasekneš se na chybě a chceš se zeptat kolegy na firemním
chatu. Co musí obsahovat první zpráva, aby nevznikla hodinová prodleva na dvě otázky
zpátky?

### --expected--
co jsem čekal, co se stalo a co jsem už zkusil

### --accept--
celý kontext v první zprávě
co dělám, co se stalo, co jsem zkusil
očekávání, skutečnost, dosavadní pokusy

### --why--
Stejný obsah funguje i na model: bez očekávání, skutečnosti a dosavadních pokusů
dostaneš obecnou odpověď, kterou jsi už jednou zkusil.

### --see--
nastroje-cizi-kod/odhad-a-komunikace#4-asynchronni-komunikace-cely-kontext-v-prvni-zprave

## --question--

**Opakování z dřívějška.** Než se zeptáš modelu na chybu, máš ji nejdřív spolehlivě
zopakovat. Proč je tenhle krok důležitý i tehdy, když tušíš, kde chyba je?

### --answer--
Protože bez zopakování nebude mít model dost kontextu.

#### --why--
Kontext se dá popsat i bez zopakování — problém je jinde.

### --correct--
Protože bez spolehlivého zopakování nepoznáš, jestli oprava zabrala, nebo se chyba jen zrovna neprojevila.

#### --why--
Platí to i pro opravu od modelu: bez zopakovatelné chyby nemáš čím ověřit, že ji opravil.

### --see--
js-chyby-ladeni/ladeni-systematicky#nejdriv-chybu-spolehlive-zopakuj
