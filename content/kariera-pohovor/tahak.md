Od přihlášky po první tři měsíce v práci. Šablony k okopírování a věci, které se dají
zapomenout ve chvíli, kdy na to nejvíc záleží.

## CV na jednu stranu

| pořadí | blok | co v něm |
|---|---|---|
| 1 | jméno, pozice, kontakt | jedna věta pod jménem, e-mail, telefon, GitHub, LinkedIn, portfolio |
| 2 | projekty | u juniora nejdůležitější blok, tři projekty po dvou až třech řádcích |
| 3 | dovednosti | dvě úrovně: „používám denně" a „zkoušel jsem" |
| 4 | vzdělání a rekvalifikace | kurz, škola, jedna řádka |
| 5 | praxe mimo IT | přepsaná do přenositelných dovedností |

Do CV **nepatří** adresa bydliště, datum narození, rodinný stav ani fotka. Posílej PDF
s vybratelným textem (v korporátu ho čte [[ATS]], který v něm hledá klíčová slova
z inzerátu) a pojmenuj soubor `Karel-Novak-CV.pdf`.

## Projekt do CV: dopad, ne seznam technologií

```text
Rozpis služeb  ·  github.com/karelnovak/rozpis  ·  rozpis-sluzeb.vercel.app
Plánování směn pro kavárnu s pěti brigádníky; používají to od března.
React + TanStack Query, vlastní API v Node/Express nad SQLite.
Kapacitu směny hlídám v transakci na serveru — v prohlížeči si ji dva lidé přepisovali.
```

Čtvrtá řádka je ta, kvůli které zavolají: **co to je, co to řeší, jaké je tvoje
rozhodnutí**. Když projekt nikdo nepoužívá, nahraď „používají to od března" jiným číslem
(kolik záznamů zvládne, kolik testů má, jak dlouho trvá načtení).

Praxi mimo IT piš jako **činnost**, ne jako vlastnost: „koordinace 12 lidí a rozpis
služeb", ne „komunikativní a zodpovědný".

## LinkedIn a GitHub

Titulek pod jménem ([[headline]]) je hlavní text, ve kterém náboráři vyhledávají:

```text
Frontend vývojář · React, TypeScript · hledám první juniorní pozici
```

Ne „Student", ne „Hledám příležitost". K tomu sekce O mně na čtyři až šest vět, jednou
za dva týdny krátký post, značka „Open to work", vlastní adresa profilu a odkazy na
GitHub a portfolio v kontaktech.

Na GitHubu připni tři repozitáře, každému dej popis a témata, u statických projektů zapni
Pages. [[profilové README]] je repozitář se jménem tvého účtu (`karelnovak/karelnovak`):

```md
### Ahoj, jsem Karel

Frontend vývojář (React, TypeScript). Dřív jsem osm let vedl provoz kavárny,
teď stavím věci, které provozu ubírají práci.

- Právě dodělávám **[Rozpis služeb](https://github.com/karelnovak/rozpis)**
- Učím se TypeScript a testování v Playwrightu
- karel.novak@example.cz
```

Jedna věta o tom, co právě stavíš, udělá víc než dvacet odznaků s logy.

## Jak číst inzerát

| vrstva | jak ji poznáš | co s ní |
|---|---|---|
| [[must have]] | opakuje se: titulek, popis práce i požadavky | v odpovědi projdi položku po položce a ke každé přilep důkaz |
| [[nice to have]] | „výhodou", „plus", „oceníme" | chybějící položka tě nevyřadí |
| výplň | „týmový hráč", „chuť se učit", „znalost Gitu" | neměří nic, ale opiš si odtud slovník |

**Splňuješ zhruba polovinu? Přihlas se.** Vyřadit tě má firma, ne ty sám. Deset pečlivých
přihlášek porazí sto hromadných; první věta průvodní zprávy proto jmenuje jejich produkt.
Nejvyšší úspěšnost má [[referral]] — doporučení od někoho zevnitř.

## Peníze

Hrubá měsíční mzda na hlavní pracovní poměr, orientačně:

| | Praha | zbytek ČR |
|---|---|---|
| první práce bez praxe | 35–45 tis. | 30–38 tis. |
| junior po roce | 45–60 tis. | 38–50 tis. |
| medior (2–4 roky) | 65–95 tis. | 55–75 tis. |

1. **Číslo neříkej první.** „Jaké máte na tuhle roli rozpětí?"
2. **Když musíš, řekni rozpětí** a horní hranici nadhodnoť o 10–15 %.
3. **Nabídku nepřijímej na místě.** Den ticha je jediná chvíle, kdy máš vyjednávací pozici.

Čísla si vždycky počítej v [[hrubá mzda|hrubém]]. Práce „na IČO" vypadá na papíře líp,
ale platíš si sám pojistné a nemáš dovolenou, nemocenskou ani výpovědní lhůtu; nabídka
IČO na běžnou práci v týmu s pevnou dobou je [[švarcsystém]].

## Portfolio

Tři projekty, ne třináct — a každý s jiným „svalem": aplikace s daty ze serveru, něco
s vlastním backendem nebo databází, a volba srdce. [[vlajkový projekt|Vlajkový]] řeší
něco skutečného, běží na [[živá adresa|živé adrese]], zvládá ošklivé stavy (prázdno,
chyba sítě, pomalé načítání, neplatný vstup), má README a nedá se projít za deset vteřin.

README, které rozhodne, má bloky: **Co to umí · Z čeho je to postavené · Rozhodnutí
a kompromisy · Jak to spustit · Co bych udělal jinak.** Prostřední a poslední blok
většina portfolií nemá a přitom jsou to jediná místa, kde je vidět uvažování.

Do portfolia **nedávej** cvičení z kurzů, kopie videotutoriálů, rozdělané věci a kód,
který neumíš vysvětlit řádek po řádku.

## Domácí úkol

Rozpočet na čtyřhodinové zadání:

| fáze | čas | co v ní děláš |
|---|---|---|
| čtení a plán | 20 min | seznam požadavků, náčrt komponent, jedno velké rozhodnutí |
| kostra a data | 45 min | projekt běží, data se načtou a vypíšou |
| hlavní funkce | 90 min | jádro zadání: hledání, stránkování, detail |
| stavy a okrajové případy | 45 min | načítání, chyba, prázdno, neplatný vstup |
| testy | 20 min | dva až čtyři, na to, co se nejsnáz rozbije |
| README a úklid | 20 min | popis, spuštění, rozhodnutí, co chybí |

README k [[domácí úkol|domácímu úkolu]] má čtyři bloky: **Spuštění · Co je hotové ·
Rozhodnutí · Co chybí a jak bych to dodělal.** Poslední blok většina uchazečů vynechá,
a přitom je to jediné místo, kde ukážeš znalost, kterou jsi nestihl proměnit v kód.

Commituj průběžně, první commit ať je prázdná kostra a poslední README. Nekomituj `.env`,
klíče ani `node_modules`. Překročený časový limit ti neprospěje: buď se pozná, nebo se
podle dvanáctihodinového výsledku bude čekat tvoje čtyřhodinová rychlost.

## Technický pohovor

| kolo | kdo | co se děje |
|---|---|---|
| screening | HR | proč se hlásíš, kdy nastoupíš, představa o platu |
| technické kolo | vývojář | vyprávění o projektu, otázky na základy, [[live coding]] |
| domácí úkol | ty | často místo živého programování |
| review úkolu | vývojář | procházíte kód a ptají se „proč takhle" |
| závěrečné kolo | vedoucí týmu | očekávání, zapadnutí, tvoje otázky |

**Vyprávění o projektu ve čtyřech větách:** co to je a pro koho · jak je to postavené ·
jeden problém, na který jsi narazil, a jak jsi ho vyřešil · co bys udělal jinak. Třetí
věta rozhoduje; nacvič si ji nahlas na dvě až tři minuty.

**Live coding v pěti krocích:** zopakuj zadání vlastními slovy · zeptej se na okrajové
případy · řekni postup, než ho napíšeš · piš a komentuj · nakonec řekni, co bys zlepšil.
Napiš nejdřív nejhloupější funkční řešení a nahlas přiznej, že je hloupé. Ticho delší než
deset vteřin je jediná věc, která tě potopí.

**[[system design]] ve čtyřech krocích:** požadavky a rozsah · data a komponenty · stav
a komunikace se serverem · zbytek (stavy načítání, chyby, prázdno, přístupnost, výkon,
souběh odpovědí). Body se sbírají ve čtvrtém kroku.

**Když nevíš:** „Tohle přesně nevím. Vím, že se to týká… Kdybych na to narazil v práci,
podíval bych se do… a ověřil si to…" Přiznaná mezera s postupem je lepší než správná
odpověď bez zdůvodnění.

## Otázky, které se ptáš ty

- „Jak vypadá u vás první měsíc juniora? Kdo mu dělá review?"
- „Kolik z vaší práce je nová funkčnost a kolik údržba a opravy?"
- „Jak se u vás dostane změna od hotového kódu do produkce?"
- „Co bylo poslední větší technické rozhodnutí v týmu a jak jste se k němu dostali?"
- „Podle čeho poznáte za půl roku, že jsem uspěl?"

Poslední je nejsilnější: donutí je vyslovit očekávání nahlas.

## Behaviorální kolo a [[metoda STAR]]

| písmeno | co v něm říct | kolik času |
|---|---|---|
| **S** — situace | kde a co se dělo, jedna až dvě věty | 15 % |
| **T** — úkol | co bylo potřeba a jaká byla tvoje role | 15 % |
| **A** — akce | **co jsi udělal ty**, v první osobě jednotného čísla | 55 % |
| **R** — výsledek | jak to dopadlo, ideálně s číslem, a co sis odnesl | 15 % |

Připrav si čtyři až pět příběhů a recykluj je. O chybě mluv ve čtyřech částech:
co se stalo · jaký to mělo dopad · co jsi udělal hned · co jsi změnil, aby se to
neopakovalo. Poslední dvě rozhodují.

Angličtina: u juniora se nejčastěji čeká jen pasivní (přečteš dokumentaci a hlášku).
Když přijde patnáctiminutový hovor, hodnotí se srozumitelnost, ne gramatika — a
nejužitečnější věta je „Sorry, could you repeat that?"

## První týden a plán 30-60-90

První den: rozběhni projekt podle dokumentace a zapiš si, co v ní nesedí (oprava README
je ideální první pull request) · nakresli si hrubou mapu · vystopuj jeden požadavek od
kliknutí až do databáze · zjisti, kdo dělá review a kdo je tvůj [[buddy]].

| období | cíl | jak poznáš, že je splněný |
|---|---|---|
| 1.–30. den | rozumět | rozběhneš projekt, víš, co firma dělá, znáš proces od větve po nasazení |
| 31.–60. den | přispívat | bereš běžné úkoly a dotahuješ je sám, PR projdou bez velkých přepisů |
| 61.–90. den | být spolehlivý | odhadneš úkol, ptáš se cíleněji, rozdělíš si větší funkci |

[[plán 30-60-90|Plán]] si udělej sám a ukaž ho vedoucímu. Než se zeptáš, dej si čas na
samostatné hledání: první dva týdny 30 minut, od druhého měsíce hodinu. **Bez čekání se
ptej vždy**, když jde o produkci, data zákazníků, peníze nebo bezpečnost.

Otázku pošli ve čtyřech řádcích:

```text
Cíl:      Chci do výpisu objednávek přidat filtr podle stavu.
Zkusil:   Přidal jsem parametr do dotazu podle vzoru z filtru podle data.
Chyba:    Server vrací 400 s hláškou „unknown filter: state".
Domněnka: Tipuju, že se povolené filtry někde vyjmenovávají, ale nenašel jsem kde.
```

První pull request drž do dvou set řádků a v popisu měj **Co se mění · Proč · Jak to
vyzkoušet · Na co se podívat**. Poslední část řekne sama, kde si nejsi jistý.

V [[zkušební doba|zkušební době]] si zpětnou vazbu vyžádej sám: „Co mám dělat víc?"
a „Co bych měl změnit?" Otevřené „jak mi to jde?" plodí zdvořilou odpověď.

## Pasti a časté chyby

- **Čekání na pocit „už jsem připravený".** Začni se hlásit se dvěma dokončenými projekty.
- **Jedno CV pro všechny nabídky.** Věta pod jménem a pořadí dovedností se mají trefit do
  konkrétního inzerátu; je to pět minut práce.
- **Nekonzistence mezi plochami.** CV tvrdí React, LinkedIn říká „student", GitHub má
  poslední commit před půl rokem.
- **Technologie v CV, kterou neustojíš.** Seznam dovedností je zároveň seznam otázek,
  které si vyrábíš sám.
- **Mrtvý odkaz nebo ukázka, která při prvním otevření spadne.** Zkontroluj odkazy v den
  exportu PDF a otevři ukázku v anonymním okně na mobilu.
- **Klíč k API v repozitáři.** Bezpečnostní chyba rovnou v místě, kam se hodnotitel dívá.
- **Funkce navíc v domácím úkolu.** Ukazuje, že neumíš držet zadaný rozsah.
- **Nepřipravené vyprávění o projektu.** Nejpředvídatelnější otázka celého náboru.
- **Hádání s jistotou v hlase** a **pomlouvání bývalého zaměstnavatele.**
- **Odpovídání v množném čísle.** „My jsme to vyřešili" tazateli neřekne, co jsi udělal ty.
- **Skrývání zaseknutí v práci.** Den ztracený na problému, který kolega zná zpaměti.
- **„Do třiceti dnů přepíšu jejich zastaralý stav."** Návrhy na velké změny až ve čtvrtém
  měsíci, až budeš vědět, proč to je, jak to je.
