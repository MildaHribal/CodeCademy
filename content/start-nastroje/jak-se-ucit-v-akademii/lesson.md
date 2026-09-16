# Jak se učit v Akademii

:::check pretest
Máš hodinu na to, aby sis zapamatoval, co dělá pět nových HTML značek. Co ti za týden pomůže víc?

### --answer--
Třikrát si pečlivě přečíst výklad a podtrhat si ho.

#### --why--
Opakované čtení působí jako učení, protože text je ti čím dál povědomější. Povědomost ale není totéž, co umět si věc vybavit bez textu před očima.

### --correct--
Jednou si výklad přečíst a pak si bez textu zkusit napsat, co která značka dělá, a zkontrolovat se.

#### --why--
Každé vytažení z paměti stopu posílí. Přesně na tom stojí otázky, karty a opakování v Akademii.
:::

Znáš to z tutoriálů: přečteš článek, všechno dává smysl, zkopíruješ ukázku a funguje. Za dva dny máš
napsat totéž sám a nevíš, jak začít. Nebyl jsi líný. Učil ses způsobem, který
působí jako učení, ale do paměti skoro nic neuloží.

Akademie je postavená jinak. Nutí tě odpovídat dřív, než výklad dočteš, předpovídat
dřív, než kód spustíš, a vracet se k věcem po dnech a týdnech. Někdy je to nepříjemné,
a proto to funguje. Tahle lekce vysvětlí, co který nástroj dělá a jak z něj dostat nejvíc.

> [!REMEMBER]
> **Naučíš se to, co si z hlavy vytáhneš, ne to, co si přečteš.** Když je učení trochu namáhavé, většinou děláš něco správně.

## Vybavování z paměti a opakování s odstupem

Dva jevy z výzkumu paměti, na kterých stojí celý kurz:

- **[[vybavování z paměti]]** (*retrieval practice*): pokus odpovědět bez nápovědy si
  pamatuješ líp než odpověď, kterou si přečteš. Platí to i tehdy, když odpovíš špatně
  a pak uvidíš správnou odpověď.
- **[[opakování s odstupem]]** (*spaced repetition*): když si věc zopakuješ po jednom dni,
  pak po třech, pak po týdnu, vydrží ti mnohem déle, než kdybys ji opakoval desetkrát
  za jeden večer.

Obojí dělá fronta **Opakování** v hlavičce aplikace. Používá [[Leitnerův systém]]:
každá položka leží v jedné ze šesti krabiček. Správná odpověď ji posune o krabičku
výš a další opakování přijde později. Špatná ji vrátí do první krabičky.

| krabička | další opakování za |
|---|---|
| 1 | 1 den |
| 2 | 3 dny |
| 3 | 7 dní |
| 4 | 16 dní |
| 5 | 35 dní |
| 6 | 90 dní |

Do opakování se dostanou kontrolní otázky z lekcí, otázky z kvízů, kartičky sekce,
body z „Vysvětli vlastními slovy", které sis nezaškrtl, a kroky, se kterými sis
neporadil sám. Denně jich je nejvýš dvacet a přehled ukáže, kolik minut ti zaberou.

> [!TIP]
> Opakování dělej na začátku sezení, ne na konci. Deset minut starých věcí ti před
> novou látkou zahřeje hlavu a nestane se, že ho večer vynecháš.

:::check
V opakování ti přijde otázka z krabičky 4 a odpovíš špatně. Za kolik dní ji uvidíš znovu? Napiš číslo.

### --expected--
1

### --why--
Špatná odpověď položku vrací do první krabičky, ať byla předtím jakkoli vysoko. První krabička znamená opakování zítra.
:::

:::explain
Vysvětli kamarádovi, proč je lepší opakovat si látku třikrát během dvou týdnů než třikrát za jeden večer.

## --model--
Když si věc opakuju hned po sobě, je pořád čerstvá a vybavení nic nestojí, takže paměť skoro neposílí. S odstupem už ji trochu zapomenu a musím ji z paměti vytáhnout. Právě tahle námaha stopu zpevní. Každé další opakování pak může přijít později.

## --checklist--
- Opakování hned po sobě je snadné, a proto paměť skoro neposílí.
- S odstupem je potřeba si věc namáhavě vybavit.
- Namáhavé vybavení stopu v paměti zpevní.
- Po úspěšném opakování může další přijít později.
:::

## Předpověď před spuštěním

U ukázek s otázkou je náhled schovaný. Nejdřív napíšeš nebo vybereš, co se podle tebe
stane, a teprve pak uvidíš skutečnost. Předpověď tě přinutí použít to, co víš,
a když se spleteš, zapamatuješ si rozdíl mnohem líp, než kdybys výsledek jen viděl.

Předpověď se nehodnotí a nikam se nezapisuje. Chyba v ní je v pořádku, je to nejlevnější
chyba, jakou uděláš. Tlačítko „Nevím, ukaž" použij jen tehdy, když opravdu nemáš žádnou
představu. I hrubý tip je lepší než žádný.

Zkus si to hned. Stránka kavárny má v odstavci hodně mezer a zalomení řádků:

:::live predict
```html
<p>Espresso      49 Kč
   Cappuccino    65 Kč</p>
```
```css
body { font-family: system-ui, sans-serif; font-size: 1.25rem; }
```
--question-- Jak se odstavec zobrazí v prohlížeči?
--option-- Přesně jako v kódu: na dvou řádcích a s mezerami zarovnanými pod sebou.
--option*-- Na jednom řádku a všechny skupiny mezer se sloučí do jedné mezery.
--option-- Prohlížeč místo odstavce ukáže chybu, protože HTML nemá v textu povolené víc mezer.
--why-- Prohlížeč bere mezery, tabulátory i konce řádků v textu jako jednu mezeru. Zalomení řádku v kódu tedy na stránce zalomení neudělá; na nový řádek text dostane až další prvek (odstavec, položka seznamu) nebo `<br>`.
:::

Po odhalení si ukázku uprav: dej každou kávu do vlastního odstavce `<p>` a sleduj,
jak se změní náhled.

:::check
Proč je lepší napsat do předpovědi hrubý tip než rovnou kliknout na „Nevím, ukaž"?

### --answer--
Protože se špatný tip počítá do skóre lekce a „Nevím" ho sníží ještě víc.

#### --why--
Myslíš si, že se předpověď hodnotí? Nehodnotí se a do splnění lekce se nepočítá.

### --correct--
Protože tip přinutí použít, co víš, a rozdíl mezi tipem a skutečností si zapamatuješ líp.

#### --why--
Srovnání „čekal jsem X, stalo se Y" je přesně ten okamžik, kdy se model v hlavě opraví.

### --answer--
Protože bez tipu se náhled neukáže vůbec.

#### --why--
Myslíš si, že „Nevím, ukaž" nefunguje? Funguje, náhled odhalí taky. Jde o to, co ti ukázka dá.
:::

## Nápovědy po stupních a otevření řešení

Když se v kroku workshopu zasekneš, máš tlačítko **Potřebuju nápovědu**. Tipy se otevírají
po jednom a každý prozradí o kousek víc:

1. o jaký koncept jde a kde si ho přečíst,
2. která vlastnost, metoda nebo příkaz a kam patří,
3. stejný vzor na jiných datech.

Po dvou neúspěšných kontrolách za sebou se tlačítko samo zvýrazní a nabídne tip
k požadavku, který selhal. Tip nikdy neobsahuje řešení. Poslední stupeň je
**Porovnat s řešením**: uvidíš autorův kód vedle svého.

Otevřít řešení není podvod, ale má to cenu. Krok se uloží jako vyřešený s pomocí
(*assisted*) a zítra ti ho opakování nabídne znovu: od výchozího kódu, jen se seznamem
požadavků, bez zadání a bez tipů. Postavíš ho tedy naslepo. Stejně se do opakování dostane
krok, u kterého jsi měl aspoň tři neúspěšné kontroly, a krok, u kterého po splnění klikneš na
**Nezvládl bych to znovu**.

> [!PITFALL]
> **Řešení otevřené po minutě zkoušení.** Krok je splněný, ale v hlavě nic nezůstalo
> a v opakování ho zítra nenapíšeš. Než řešení otevřeš, projdi všechny tipy a dej si
> pět minut. Pomáhá i nahlas říct, co přesně nefunguje.

:::check
Dvakrát za sebou ti neprošla kontrola kroku. Jaký je nejlepší další krok?

### --answer--
Otevřít porovnání s řešením, ať neztrácíš čas.

#### --why--
Myslíš si, že řešení je nejrychlejší cesta dál? Je, jenže krok pak skončí jako vyřešený s pomocí a zítra ho budeš psát znovu. Tipy tě k cíli dovedou taky a něco po nich zůstane.

### --correct--
Přečíst zprávu testu, který selhal, a otevřít první tip.

#### --why--
Zpráva testu říká, co se čekalo, a tip ukáže směr, aniž by prozradil řešení.

### --answer--
Přepsat celý kód od začátku jinak.

#### --why--
Myslíš si, že když něco nefunguje, je špatně všechno? Většinou chybí jedna věc. Zpráva testu ukáže kterou.
:::

## Poznámky, „Nerozumím" a vysvětlování vlastními slovy

Každá sekce má vlastní soubor poznámek (menu **Poznámky**). Zapisuje se do něj víc věcí:

- **Poznámka**: tlačítko v lekci i na pracovní ploše. Piš vlastními slovy, ne kopií výkladu.
- **„Nerozumím"**: otazník u odstavce výkladu nebo zadání. Odstavec se uloží jako citace
  i s odkazem a ty k němu dopíšeš, co přesně ti není jasné. Když se k tomu vrátíš, víš,
  kde jsi skončil.
- **Vysvětli vlastními slovy**: napíšeš vysvětlení, pak uvidíš vzorové a zaškrtneš
  body, které v tvém textu jsou. Text se uloží do poznámek a nezaškrtnuté body jdou
  do opakování.
- **Než začneš**: u labu a projektu sepíšeš zadání vlastními slovy a postup v pár krocích.

Vysvětlování je nejtěžší a nejcennější. Kde nedokážeš napsat „proč", tam je díra, kterou
by našel pohovor.

:::check
Při vysvětlování vlastními slovy nezaškrtneš dva body ze čtyř. Co se s nimi stane?

### --answer--
Lekce se neoznačí jako splněná, dokud je nezaškrtneš.

#### --why--
Myslíš si, že vysvětlování podmiňuje splnění? Nepodmiňuje, jde jen o tvoje vlastní učení.

### --correct--
Přijdou ti později v opakování.

#### --why--
Nezaškrtnutý bod je přesně to, co ještě neumíš říct. Opakování ti ho vrátí.

### --answer--
Nic, body slouží jen pro autora kurzu.

#### --why--
Myslíš si, že checklist je jen pro autora? Je pro tebe: podle něj poznáš, co ve vysvětlení chybělo.
:::

## Jistota a kalibrace

U hodnocených otázek volíš před odesláním **Jsem si jistý** nebo **Tipuju**. Mění to,
kdy otázka přijde znovu: správná odpověď s jistotou ji v opakování posune výš, správný tip
ji nechá ve stejné krabičce. Chyba s jistotou se vrátí hned zítra.

Na stránce sekce pak uvidíš větu jako „Když jsi byl jistý, měl jsi pravdu v 71 %".
Tomu se říká [[kalibrace]]: jak dobře odhadneš, co opravdu umíš. Kdo je jistý a mýlí se,
nehledá chybu a zbytečně dlouho ladí. Poctivé „Tipuju" tě nic nestojí.

> [!PITFALL]
> **„Jsem si jistý" u všeho.** Jistota se nehodnotí a nedává body. Když ji mačkáš
> automaticky, přijdeš o jediné číslo, které ti řekne, kde si přeceňuješ znalosti.

:::check
Odpovíš správně, ale zvolil jsi „Tipuju". Co se s otázkou v opakování stane?

### --answer--
Posune se o krabičku výš stejně jako při jisté odpovědi.

#### --why--
Myslíš si, že rozhoduje jen správnost? Tip, který vyšel, ještě neznamená, že to umíš, proto se otázka neposune.

### --correct--
Zůstane ve stejné krabičce a přijde znovu po jejím intervalu.

#### --why--
Správný tip se nepočítá jako znalost. Otázka se vrátí se stejným odstupem a posune se až po jisté odpovědi.

### --answer--
Vrátí se do první krabičky jako při chybě.

#### --why--
Myslíš si, že tip se trestá jako chyba? Odpověď byla správná, takže otázka nespadne dolů.
:::

## Jak se ptát, když nevíš

Dřív nebo později se budeš ptát: kolegy, fóra nebo AI. Otázka „nefunguje mi to, co s tím?"
nedostane dobrou odpověď, protože ten druhý neví nic z toho, co víš ty. Dobrá otázka má
čtyři části:

1. **Co jsem čekal**: „Po kliknutí se má menu rozbalit."
2. **Co se stalo**: přesná hláška nebo přesný výsledek, zkopírovaný, ne převyprávěný.
3. **Co jsem zkusil**: „Zkontroloval jsem název třídy v HTML i v CSS."
4. **[[minimální příklad]]**: co nejkratší kód, na kterém se problém pořád ukáže. Všechno
   ostatní smaž.

Minimální příklad má bonus: v polovině případů při jeho zkracování chybu najdeš sám.

Srovnej dvě otázky na stejný problém:

> Nejde mi obrázek na webu, pomoc.

> Čekal jsem, že se na stránce ukáže logo. Místo něj je ikona rozbitého obrázku a DevTools
> hlásí `GET /img/Logo.png 404`. Soubor na disku se jmenuje `img/logo.png`. Zkusil jsem
> stránku obnovit. Minimální příklad: `<img src="img/Logo.png" alt="Logo kavárny">`.

Na druhou otázku odpověď skoro nepotřebuješ, velké `L` je vidět hned.

:::check
Která část chybí v otázce „Tlačítko Odeslat po kliknutí nic neodešle. Kód je v příloze, celý projekt má 40 souborů."?

### --answer--
Nic nechybí, přiložený projekt stačí.

#### --why--
Myslíš si, že víc kódu znamená lepší otázku? 40 souborů nikdo číst nebude a chyba se v nich ztratí.

### --correct--
Co se přesně stalo (hláška nebo výsledek), co už zkoušel a minimální příklad.

#### --why--
Otázka říká jen, co čekal. Bez přesného příznaku, pokusů a zmenšeného kódu musí druhý začít od nuly.

### --answer--
Jen pozdrav a poděkování.

#### --why--
Myslíš si, že jde o zdvořilost? Ta nevadí, ale odpověď na otázku nepřinese.
:::

## Kde to najdeš v MDN

- [Research and learning](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Soft_skills/Research_and_learning): jak se učit webový vývoj, hledat odpovědi a ptát se.
- [Soft skills](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Soft_skills): přehled dovedností kolem kódu, od týmové práce po hledání práce.

Teď víš, jak s Akademií pracovat. V další lekci se podíváš, jak do toho zapadá AI,
aby ti učení nebrala, ale pomáhala.

# --questions--

## --question--

Kamarád se učí na zkoušku tak, že si den předem pětkrát přečte skripta. Druhý den umí skoro všechno, za měsíc skoro nic. Jak se jmenuje princip, který mu chybí?

### --expected-- ignore-case

opakování s odstupem

### --accept--

spaced repetition
opakovani s odstupem
rozložené opakování

### --why--

Pětkrát za jeden večer je pořád jedno opakování. Paměť zpevní, až když se k látce vrátí po dnech a musí si ji namáhavě vybavit.

### --see--

start-nastroje/jak-se-ucit-v-akademii#vybavovani-z-pameti-a-opakovani-s-odstupem

## --question--

Otevřel jsi porovnání s řešením dřív, než ti krok prošel. Jak se ten krok vrátí v opakování?

### --answer--

Vrátí se s celým zadáním a všemi tipy, ať to zvládneš snáz.

#### --why--

Myslíš si, že opakování kroku vypadá stejně jako první průchod? Zadání a tipy jsou pryč, zůstanou jen požadavky.

### --correct--

Od výchozího kódu, jen se seznamem požadavků, bez zadání a tipů.

#### --why--

Opakování ověří, jestli krok postavíš sám. Proto dostaneš jen to, co musí výsledek splnit.

### --answer--

Nevrátí se, krok je splněný.

#### --why--

Myslíš si, že splnění s řešením je konečné? Krok se uloží jako vyřešený s pomocí a právě proto se vrátí.

### --see--

start-nastroje/jak-se-ucit-v-akademii#napovedy-po-stupnich-a-otevreni-reseni

## --question--

Otázka leží v krabičce 2. V opakování na ni odpovíš správně a zvolíš „Jsem si jistý". Za kolik dní ji uvidíš znovu? Napiš číslo.

### --expected--

7

### --why--

Jistá správná odpověď posune otázku o krabičku výš, tedy do krabičky 3. Ta má interval 7 dní.

### --see--

start-nastroje/jak-se-ucit-v-akademii#jistota-a-kalibrace
