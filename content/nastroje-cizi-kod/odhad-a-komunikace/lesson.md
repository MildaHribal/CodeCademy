# Odhad a komunikace

:::check pretest
Zasekneš se na chybě, kterou nechápeš. Za jak dlouho se podle tebe máš ozvat o pomoc?

### --expected--
Zhruba za půl hodiny až hodinu.
:::

Kód je menší část práce, než se zdá. Zbytek je domluva na tom, co se vlastně má udělat,
odhad, jak dlouho to zabere, a včasné přiznání, že to nevychází. Tyhle tři věci
rozhodují o tom, jestli se s tebou dobře pracuje — víc než rychlost psaní.

> [!REMEMBER]
> **Špatná zpráva doručená včas je dobrá zpráva.** Zpoždění, o kterém tým ví ve středu,
> se dá řešit. Zpoždění, které vyjde najevo v pátek večer, se řešit nedá.

## 1. Rozpadni úkol, než ho odhadneš

Odhadnout „udělej přihlašování" nejde. Odhadnout jeho části ano — a součet je najednou
překvapivě realistický, protože při rozpadu ti dojde, na co jsi zapomněl.

| Místo jednoho úkolu | Rozpad na kroky |
|---|---|
| Udělat přihlašování | formulář a validace · volání API · uložení session · chráněné cesty · odhlášení · chybové stavy |

Pravidlo: **kdykoli je část odhadnutá na víc než jeden den, rozpadni ji dál.** „Dva dny"
skoro vždycky znamená „nevím".

:::check
Jaká je hlavní výhoda rozpadu velkého úkolu na menší části?

### --answer--
Výsledný součet času vyjde menší.

#### --why--
Obvykle vyjde naopak větší — a přesnější.

### --correct--
Při rozpadu narazíš na kroky, na které bys u hrubého odhadu zapomněl.

#### --why--
Odhad se nezpřesňuje přemýšlením o čase, ale vyjmenováním práce, která se musí udělat.

### --see--
nastroje-cizi-kod/odhad-a-komunikace#1-rozpadni-ukol-nez-ho-odhadnes
:::

## 2. Odhaduj v rozsahu a s důvodem

Jediný odhad, který se dá splnit, je [[odhad v rozsahu|rozsah s podmínkou]]:

> „Když je to API takové, jak čekám, zítra odpoledne. Když je v něm ten starý formát ID,
> o kterém mluvil Tomáš, tak čtvrtek."

Tři věci, které v odhadu nesmí chybět:

1. **Rozsah, ne bod.** „Den až tři dny", ne „ve dvě hodiny".
2. **Největší neznámá.** Co odhad nejvíc změní, když to dopadne jinak.
3. **Režie.** Schůzky, review, odpovídání. Reálně programuješ čtyři až pět hodin denně,
   ne osm.

> [!PITFALL]
> Odhad není slib a není to ani smlouvání. Když ti někdo řekne „nedalo by se to do
> zítřka?", správná odpověď není zkrátit odhad, ale zeptat se, co z rozsahu vyhodíme.

:::check
Kolik hodin denně reálně programuješ, když počítáš i se schůzkami, review a odpovídáním?

### --expected--
4 až 5

### --accept--
4-5
čtyři až pět
4
5

### --why--
Režie je součást práce, ne výjimka. Odhad, který s ní nepočítá, se rozsype hned první týden.
:::


## 3. Timebox: kdy přestat bojovat sám

[[timebox|Timebox]] je předem daný čas, po kterém se přestaneš babrat a zeptáš se.
Osvědčených 30–60 minut.

1. Zasekneš se. Poznamenej si čas.
2. Zkoušej: chybová hláška, dokumentace, hledání v repozitáři, historie Gitu.
3. Vyprší limit → jdeš se zeptat. **Bez výčitek.** Timebox je pravidlo, ne selhání.

Když se ptáš, přines čtyři věci — ušetříš kolegovi polovinu času:

```text
Cíl:      Chci, aby se po přihlášení uložila session do cookie.
Zkusil:   Nastavuju ji v odpovědi, v DevTools ji ale nevidím.
Chyba:    Nic nepadá, cookie prostě není v Application → Cookies.
Domněnka: Tipuju to na SameSite nebo na jinou doménu, ale nevím, kde to ověřit.
```

> [!TIP]
> Zhruba třetina těchhle zpráv se vyřeší sama ve chvíli, kdy je píšeš. Tomu se říká
> [[rubber duck debugging]] — formulace problému je půlka řešení.

> [!PITFALL]
> Opačná chyba je stejně drahá: ptát se po pěti minutách na všechno. Timebox tě chrání
> před oběma extrémy.

## 4. Asynchronní komunikace: celý kontext v první zprávě

U [[asynchronní komunikace|asynchronní komunikace]] stojí každá výměna minuty nebo hodiny čekání. Piš tak, aby druhý
člověk mohl odpovědět hned napoprvé.

| Místo tohohle | Napiš tohle |
|---|---|
| „Ahoj Karle." *(a čekáš)* | „Ahoj Karle, kouknul bys na PR #123? Mění práva adminů podle včerejší dohody, je to 40 řádků." |
| „Nefunguje mi build." | „Build padá na `npm run build`, hláška `Cannot find module 'sharp'`. Na mainu i na mé větvi, po `npm ci`. Nemáš nápad?" |
| „Kdy to bude?" | „Potřebuju ke čtvrtku vědět, jestli bude endpoint `/orders` hotový — podle toho začnu buď na něm, nebo na exportu." |

Na denním [[standup|standupu]] platí totéž ve třech větách: co jsem dokončil, co dělám dnes, co mě
blokuje. **Blokace je z těch tří nejdůležitější** — jen kvůli ní se standup koná.

:::check
Kolega napíše do chatu jen „Ahoj". Co tím tým ztrácí?

### --answer--
Nic, je to jen zdvořilost.

#### --why--
Zdvořile to myšlené je, jenže stojí jedno celé kolo čekání.

### --correct--
Jednu celou výměnu — druhý člověk musí odpovědět dřív, než se vůbec dozví, o co jde.

#### --why--
S celým kontextem v první zprávě může odpovědět jednou, až bude mít čas.
:::


## 5. Definition of Done: dohodni si, co znamená „hotovo"

[[definition of done|Definition of Done]] je seznam podmínek, které musí být splněné,
než úkol prohlásíš za dokončený. Bez ní se „hotovo" rozejde: tobě funguje kód na
počítači, testerovi chybí testovací data, produkťákovi chybí text v aplikaci.

Typická podoba:

- kód projde review a je začleněný do `main`,
- nové chování má testy a CI je zelené,
- funguje na testovacím prostředí, ne jen lokálně,
- změny viditelné uživateli jsou popsané tam, kde je tým hledá.

> [!REMEMBER]
> **Zeptat se „co přesně znamená hotovo?" na začátku stojí minutu.** Zjistit to na konci
> stojí den.

:::explain
Vysvětli vlastními slovy, proč je timebox užitečný oběma směry — chrání tě před tím,
aby ses ptal moc pozdě, i moc brzy.

## --model--
Bez timeboxu rozhoduje o tom, kdy se ozveš, tvoje momentální nálada nebo ostych. Jeden
den se stydíš a propálíš osm hodin problémem, který kolega zná zpaměti; jindy se zeptáš
po pěti minutách a ani ses nepodíval do chybové hlášky. Timebox tohle rozhodnutí
odosobní: máš pevný limit, do kterého se snažíš sám, a po jeho vypršení je otázka
správný postup, ne přiznání porážky. Zároveň ti těch třicet až šedesát minut vlastního
hledání dá materiál, se kterým se dá přijít — a se kterým je otázka pro kolegu
odpověditelná během minuty.

## --checklist--
- Bez pravidla rozhoduje nálada, ne užitečnost.
- Příliš pozdní dotaz spálí hodiny na známém problému.
- Příliš brzký dotaz přenáší tvoji práci na kolegu.
- Vlastní hledání vytvoří kontext, který otázku zlevní.
:::

## Kde to najdeš v MDN a jinde

- [No Hello](https://nohello.net/cs/) — proč samotné „ahoj" v chatu zdržuje.
- [How to ask good questions](https://jvns.ca/blog/good-questions/) — Julia Evans o tom, jak se ptát.
- [Scrum Guide: Definition of Done](https://scrumguides.org/scrum-guide.html#increment) — odkud pojem pochází.

# --questions--

## --question--

K čemu slouží timebox, když řešíš zákeřnou chybu?

### --answer--
Určuje, jak dlouho maximálně smí trvat celý úkol.

#### --why--
Timebox se týká zaseknutí, ne délky úkolu.

### --correct--
Dopředu určí, po jak dlouhém samostatném hledání se jdeš zeptat — a odstraní tak rozhodování v nevhodnou chvíli.

#### --why--
Předem dané pravidlo tě chrání před propálením celého dne i před zbytečným vyrušováním.

### --see--
nastroje-cizi-kod/odhad-a-komunikace#3-timebox-kdy-prestat-bojovat-sam

## --question--

Co obvykle obsahuje Definition of Done?

### --answer--
Seznam funkcí, které aplikace bude umět.

#### --why--
To je zadání, ne kritéria dokončení.

### --correct--
Podmínky, které musí splnit každý úkol — review, zelené CI, nasazení na testovací prostředí, dokumentace.

#### --why--
Platí napříč úkoly a brání tomu, aby si každý pod slovem „hotovo" představoval něco jiného.

## --question--

Proč je v chatu neefektivní poslat jen „Ahoj" a čekat na odpověď?

### --answer--
Protože je to nezdvořilé.

#### --why--
O zdvořilost tu nejde, běžně to tak lidé myslí dobře.

### --correct--
Protože každá výměna stojí čekání — druhý člověk musí odpovědět, než se vůbec dozví, co potřebuješ.

#### --why--
S celým kontextem v první zprávě může odpovědět jednou, až bude mít čas.

### --see--
nastroje-cizi-kod/odhad-a-komunikace#4-asynchronni-komunikace-cely-kontext-v-prvni-zprave

## --question--

Kolegyně tě požádá o odhad na úkol, který jsi nikdy nedělal. Co uděláš?

### --answer--
Řeknu číslo, které zní rozumně, a pak se podle něj budu snažit stihnout.

#### --why--
Odhad vymyšlený z ničeho se plní přesčasy, nebo se neplní vůbec.

### --correct--
Rozpadnu úkol na kroky, u nejasného kroku řeknu, co ho ovlivní, a odhadnu rozsahem.

#### --why--
Rozsah s pojmenovanou neznámou je informace, se kterou se dá plánovat. Bod není.

## --question--

**Opakování z dřívějška.** Do Definition of Done si tým přidal „nasazeno na testovací
prostředí". Která část CI/CD tuhle podmínku obvykle plní automaticky po začlenění do `main`?

### --expected-- ignore-case
deploy

### --accept--
CD
continuous delivery
continuous deployment
nasazovací krok

### --why--
CI se stará o sestavení a testy, CD o dopravu hotového artefaktu na prostředí.

### --see--
nasazeni-provoz/ci-cd

## --question--

**Opakování z dřívějška.** Do standupu hlásíš, že aplikace v produkci občas vrací 500,
ale neumíš to zopakovat. Co je první věc, kterou se podíváš, abys zjistil, co se stalo?

### --answer--
Zkusím to reprodukovat na svém počítači, dokud se to nepovede.

#### --why--
Někdy pomůže, ale produkční incident má rychlejší zdroj pravdy.

### --correct--
Strukturované logy a hlášení chyb z produkce — konkrétní stopa zásobníku i s časem a požadavkem.

#### --why--
Logy jsou jediné místo, kde je zaznamenané, co se stalo uživateli, kterého u sebe nesimuluješ.

### --see--
nasazeni-provoz/logovani-a-chyby
