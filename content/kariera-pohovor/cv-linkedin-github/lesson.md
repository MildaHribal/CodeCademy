# CV, LinkedIn a GitHub

:::check pretest
Kolik času podle tebe stráví personalista nad jedním životopisem, než se rozhodne,
jestli ho pošle dál technikovi?

### --expected--
Méně než minutu.
:::

Máš tři veřejné plochy a každá slouží k něčemu jinému. **CV je vizitka, kterou posíláš.
LinkedIn je vizitka, kterou tě najdou. GitHub je důkaz.** Když si mezi nimi popleteš
role, každá z nich udělá práci té druhé špatně.

> [!REMEMBER]
> **Všechny tři plochy musí říkat totéž.** Když je v CV React, na LinkedIn „studuji IT"
> a na GitHubu poslední commit z loňska, neplatí ani jedna z nich.

## CV na jednu stranu

Jedna strana. Ne proto, že by to bylo pravidlo, ale protože druhou stranu nikdo nečte
a všechno, co na ni utekne, jsi zbytečně nenapsal na první.

Pořadí bloků pro juniora bez komerční praxe:

1. **Jméno, pozice, kontakt.** Pod jménem jedna věta: „Frontend vývojář — React,
   TypeScript, Node". Kontakt = e-mail, telefon, GitHub, LinkedIn, odkaz na portfolio.
   Ne adresa bydliště, ne datum narození, ne rodinný stav, ne fotka (v Česku ji
   personalisté nevyžadují a nic o tobě neřekne).
2. **Projekty.** U juniora nejdůležitější blok a patří nahoru. Tři projekty, u každého
   dva až tři řádky. Jak je psát, je níž.
3. **Dovednosti.** Rozdělené na „používám denně" a „zkoušel jsem". Nic jiného.
4. **Vzdělání a rekvalifikace.** Kurz, škola, jedna řádka.
5. **Praxe mimo IT.** Ano, patří tam — ale přepsaná do řeči přenositelných dovedností
   (viz níž).

Dva praktické detaily, na kterých to často padá: **posílej PDF** (Word se u příjemce
rozsype), pojmenuj soubor `Karel-Novak-CV.pdf` (ne `cv-final-2.pdf`) a v korporátu
počítej s tím, že životopis nejdřív přečte [[ATS]] — systém, který v něm hledá klíčová
slova z inzerátu. Proto musí být text **vybratelný**, ne obrázek, a proto se vyplatí
použít stejné pojmenování technologií jako inzerát („React", ne „Reakt").

:::check
Proč se juniorovi vyplatí dát blok s projekty výš než blok se vzděláním?

### --answer--
Protože kurz nebo škola jsou u programátora nepodstatné.

#### --why--
Nepodstatné nejsou, jen samy o sobě nedokazují, co umíš.

### --correct--
Protože projekty jsou jediná ověřitelná věc v celém CV — dá se na ně kliknout.

#### --why--
Doklad o dokončeném kurzu má i ten, kdo v životě nic nedodělal. Běžící aplikace ne.

### --see--
kariera-pohovor/cv-linkedin-github#cv-na-jednu-stranu
:::

## Jak psát projekt do CV: dopad, ne seznam technologií

Nejčastější podoba projektu v juniorním CV vypadá takhle:

```text
Rozpis služeb
React, Node.js, Express, SQLite, Tailwind, Vercel
```

Nedozvím se z toho, co ta věc dělá, ani co jsi na ní vlastně udělal ty. Funkční tvar má
tři části — **co to je, co to řeší, co je na tom tvoje zajímavé rozhodnutí**:

```text
Rozpis služeb  ·  github.com/karelnovak/rozpis  ·  rozpis-sluzeb.vercel.app
Plánování směn pro kavárnu s pěti brigádníky; používají to od března.
React + TanStack Query, vlastní API v Node/Express nad SQLite.
Kapacitu směny hlídám v transakci na serveru — v prohlížeči si ji dva lidé přepisovali.
```

Poslední řádka je ta, kvůli které tě zavolají. **Je to jediná věta v celém CV, která
dokazuje, že jsi narazil na skutečný problém a vyřešil ho.**

> [!TIP]
> Když projekt nikdo nepoužívá, nahraď „používají to od března" číslem odjinud: kolik
> záznamů zvládne, jak dlouho trvá načtení, kolik testů má, kolik dat jsi do něj nalil.
> Konkrétní číslo je vždycky lepší než přídavné jméno.

A teď to, co většina rekvalifikantů podceňuje: **praxe mimo IT není ostuda, je to výhoda —
když ji přeložíš.**

| Co jsi dělal | Jak to napsat |
|---|---|
| Provozní na směny | Koordinace 12 lidí a rozpis služeb; zvyklý řešit problém za běhu, ne až po směně. |
| Učitel | Vysvětlování složitých věcí lidem, kteří je slyší poprvé — denně, tři roky. |
| Zákaznická podpora | Zjišťování, co zákazník doopravdy potřebuje, z toho, co říká. |
| Skladník, kuchař | Práce podle procesu, kde chyba stojí peníze, a odolnost vůči tempu. |

Firmy tyhle vlastnosti u juniorů shánějí a nemají je odkud vzít. Nepiš je jako seznam
vlastností („komunikativní, zodpovědný") — to nikdo nečte. Napiš je jako **věc, kterou
jsi dělal**.

:::check
Která z těchhle řádek patří do CV juniora jako popis projektu?

### --answer--
„Moderní responzivní aplikace postavená na nejnovějších technologiích."

#### --why--
Neobsahuje jedinou ověřitelnou informaci. Stejnou větu by napsal kdokoli o čemkoli.

### --correct--
„Kapacitu směny hlídám v transakci na serveru — v prohlížeči si ji dva lidé přepisovali."

#### --why--
Popisuje konkrétní problém a konkrétní rozhodnutí. Přesně na tuhle větu se na pohovoru navazuje otázkou.

### --see--
kariera-pohovor/cv-linkedin-github#jak-psat-projekt-do-cv-dopad-ne-seznam-technologii
:::

## Sekce, které lidé píšou špatně

**Dovednosti.** Nejhorší podoba je seznam dvaceti log s hvězdičkami. Nikdo neví, co
znamenají čtyři hvězdy z pěti u Reactu, a co je horší — u pohovoru se tě budou ptát na
všechno, co jsi uvedl. Použij dvě úrovně a buď střídmý:

```text
Používám denně: JavaScript (ES2020+), React, HTML, CSS, Git, Node.js
Zkoušel jsem:   TypeScript, PostgreSQL, Docker, Playwright
```

**Jazyky.** Piš úroveň podle toho, co doopravdy zvládneš, a přidej k tomu důkaz:
„Angličtina — čtu dokumentaci a issues, domluvím se na hovoru (B2)". Samotné „B2" nikdo
nekontroluje a všichni to vědí.

**O mně.** Tři řádky, ne deset. Odkud jdeš, kam jdeš, co hledáš. Bez „jsem pečlivý
týmový hráč" — to o sobě napsal i ten, kdo pečlivý není.

> [!PITFALL]
> Nepiš do CV nic, co neustojíš u pohovoru. Uvedený „Docker" znamená, že se tě někdo
> zeptá na rozdíl mezi image a kontejnerem. Vyškrtnout položku je levnější než zaváhat.

Že „se tě zeptají na všechno, co uvedeš", není fráze. Takhle vypadá typická otázka,
která u napsaného „JavaScript" padne v prvním kole:

:::live js predict
```js
const dovednosti = ['React', 'Git', 'Node.js'];
const kopie = dovednosti;
kopie.push('Docker');
console.log(dovednosti.length);
```
--question-- Co vypíše `console.log`?
--expected-- 4
--why-- `kopie` není nové pole, ale druhé jméno pro totéž pole — přiřazením se zkopíruje odkaz, ne obsah. Skutečnou kopii vyrobí `[...dovednosti]` nebo `dovednosti.slice()`. Tohle je nejčastější „jednoduchá" otázka, na které juniorům pohovor uteče.
:::

## LinkedIn: titulek, o mně a aktivita

LinkedIn je v Česku hlavní kanál, přes který **technické náboráře najdou tebe**. Fungují
na něm tři věci a zbytek je hluk.

**1. Titulek pod jménem ([[headline]]).** Vyhledávání náborářů jede hlavně přes něj.
Nepiš „Student" ani „Hledám příležitost". Napiš, co děláš, a technologie, které chceš
dělat dál:

```text
Frontend vývojář · React, TypeScript · hledám první juniorní pozici
```

**2. Sekce O mně.** Čtyři až šest vět, psaných jako člověk, ne jako inzerát. Odkud jdeš
(předchozí obor), proč programování, co jsi postavil (jeden odkaz), co hledáš. Tahle
sekce je jediné místo, kde se hodí napsat příběh.

**3. Aktivita.** Účet bez jediného příspěvku vypadá jako opuštěný. Nemusíš psát články —
stačí, když jednou za dva týdny napíšeš krátký post o tom, co jsi postavil a co tě na
tom překvapilo, a to s odkazem a obrázkem. Tyhle posty mají u juniorů nečekaně vysoký
dosah, protože je lidi rádi sdílejí.

K tomu tři nastavení, která zabírají pět minut a spousta lidí je nemá: **zapni značku
„Open to work"** (dá se nastavit jen pro náboráře, takže to nevidí tvůj současný
zaměstnavatel), **uprav si adresu profilu** na `linkedin.com/in/karel-novak-fe` a
**přidej odkazy** na GitHub a portfolio do kontaktů.

:::check
K čemu na LinkedIn slouží titulek pod jménem především?

### --answer--
Shrnuje tvůj životopis pro toho, kdo profil otevře.

#### --why--
Shrnutí dělá sekce O mně. Titulek má ještě jednu, důležitější funkci.

### --correct--
Je to hlavní text, ve kterém náboráři vyhledávají — rozhoduje o tom, jestli tě vůbec najdou.

#### --why--
Profil, který se neobjeví ve vyhledávání, nikdo neotevře, ať je jeho obsah jakkoli dobrý.

### --see--
kariera-pohovor/cv-linkedin-github#linkedin-titulek-o-mne-a-aktivita
:::

## GitHub profil a profilové README

Na GitHub se hodnotitel podívá po CV a hledá dvě věci: **jestli tam něco je** a **jestli
to vypadá živě**.

- **Připni tři repozitáře** (tlačítko *Customize your pins*). Tím určíš, co uvidí první,
  místo aby GitHub ukázal naposledy upravené cvičení.
- **Každý připnutý repozitář potřebuje popis a témata** (`topics`). Repozitář bez popisu
  vypadá jako rozdělaná věc.
- **Zapni GitHub Pages** u projektů, které se dají hostovat staticky. Odkaz se pak ukáže
  přímo v hlavičce repozitáře.
- **Graf příspěvků** nemusí být zelený každý den; ale úplně prázdné poslední tři měsíce
  vedle věty „intenzivně se učím" si protiřečí.

**[[profilové README]]** je repozitář pojmenovaný stejně jako tvůj účet
(`karelnovak/karelnovak`); jeho `README.md` se ukáže nahoře na profilu. Drž ho krátký:

```md
### Ahoj, jsem Karel 👋

Frontend vývojář (React, TypeScript). Dřív jsem osm let vedl provoz kavárny,
teď stavím věci, které provozu ubírají práci.

- 🔧 Právě dodělávám **[Rozpis služeb](https://github.com/karelnovak/rozpis)** — plánování směn pro kavárnu
- 🌱 Učím se TypeScript a testování v Playwrightu
- 📫 karel.novak@example.cz · [LinkedIn](https://linkedin.com/in/karel-novak-fe)
```

> [!PITFALL]
> Profilové README plné odznaků s logy dvaceti technologií a statistik jazyků působí
> opačně, než má. Řekni raději jednu větu o tom, co právě stavíš — to se nedá
> vygenerovat.

:::check
Proč se vyplatí na GitHub profilu připnout konkrétní tři repozitáře?

### --answer--
Protože připnuté repozitáře se rychleji načítají.

#### --why--
O rychlost nejde. Připínání řeší, co návštěvník uvidí.

### --correct--
Protože jinak GitHub ukáže naposledy upravené repozitáře — často cvičení, ne tvoje nejlepší práci.

#### --why--
Je to stejná úvaha jako u portfolia: výběr uděláš ty, ne náhoda.

### --see--
kariera-pohovor/cv-linkedin-github#github-profil-a-profilove-readme
:::

## Motivační dopis a první zpráva

Dlouhý [[motivační dopis]] dnes skoro nikdo nečte. Co ale čte každý, je **tělo e-mailu
nebo zpráva ve formuláři** — a to je motivační dopis, jen kratší. Funguje tahle kostra
o čtyřech odstavcích:

```text
Dobrý den,

reaguji na pozici Junior Frontend Developer. Na vašem editoru faktur mě zaujalo,
že řešíte hodně stavů formuláře — přesně tomu jsem se poslední měsíce věnoval.

V inzerátu chcete React a práci s REST API: obojí jsem použil v Rozpisu služeb
(rozpis-sluzeb.vercel.app, kód na githubu), kde se směny zapisují přes vlastní API
a kapacita se hlídá na serveru. TypeScript zatím používám jen v menších věcech,
ale rozečtený ho mám.

Poslední tři roky jsem vedl provoz kavárny, takže jsem zvyklý řešit problémy
za běhu a mluvit s lidmi, kteří technicky nemyslí.

Kdykoli se rád ozvu na hovor.
Karel Novák · 777 123 456 · github.com/karelnovak
```

Tři pravidla, která z téhle zprávy dělají rozdíl:

1. **První věta jmenuje jejich produkt.** To je jediná věc, kterou hromadná rozesílka
   neumí, a čtenář si toho všimne okamžitě.
2. **Druhý odstavec jde po must have položkách z inzerátu** a ke každé dává důkaz.
   Včetně toho, co neumíš — přiznat to je silnější než mlčet.
3. **Žádné omluvy.** „Vím, že nesplňuji…", „bohužel nemám praxi…" a „dejte mi prosím
   šanci" přesouvají rozhodnutí na soucit. Ty místo toho dokládáš.

:::check
V inzerátu je požadavek na TypeScript a ty ho zatím používáš jen okrajově.
Jak s tím v průvodní zprávě naložíš?

### --answer--
Nezmíním ho — ať se soustředí na to, co umím.

#### --why--
Čtenář si požadavky odškrtává podle inzerátu. Co v odpovědi chybí, čte jako „neumí a neví o tom".

### --correct--
Napíšu, kde ho zatím používám a jak daleko jsem — otevřeně, jednou větou, bez omluvy.

#### --why--
Přiznaná mezera s konkrétním stavem je informace. Mlčení je mezera, kterou si čtenář dosadí sám, obvykle hůř.

### --see--
kariera-pohovor/cv-linkedin-github#motivacni-dopis-a-prvni-zprava
:::

:::explain
Vysvětli vlastními slovy, proč věta „bohužel nemám komerční praxi, ale rychle se učím"
v přihlášce spíš škodí než pomáhá.

## --model--
Ta věta nepřináší žádnou novou informaci: že junior nemá komerční praxi, ví čtenář
z inzerátu i z tvého životopisu, takže ji čte jako opakování něčeho, co už mu je jasné.
Zároveň dvakrát oslabuje pozici pisatele — jednou tím, že uvede nedostatek jako hlavní
téma odstavce, a podruhé slibem („rychle se učím"), který se nedá ověřit a který napsal
každý druhý uchazeč. Místo toho by stejný prostor mohl nést doklad: konkrétní věc, kterou
se pisatel naučil sám, kdy a co z ní vzniklo. Ten doklad říká „rychle se učím" mnohem
silněji, protože si závěr udělá čtenář sám, a navíc dává téma k další otázce.

## --checklist--
- Nedostatek praxe čtenář zná už z jiných míst přihlášky.
- Nedoložitelný slib má menší váhu než konkrétní důkaz.
- Věta zabírá místo, které mohl dostat doklad o samostatném učení.
- Když si závěr udělá čtenář sám, věří mu víc.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Jedno CV pro všechny nabídky.** Nemusíš psát nové, ale první věta u jména a pořadí
> dovedností se mají trefit do konkrétního inzerátu. Je to pět minut práce na přihlášku.

> [!PITFALL]
> **Nekonzistence mezi plochami.** CV tvrdí React, LinkedIn titulek říká „student",
> GitHub má poslední commit před půl rokem. Každá plocha zvlášť by prošla, dohromady
> působí nevěrohodně.

> [!PITFALL]
> **Hvězdičkové hodnocení dovedností.** Nic neměří a vyrábí otázky, na které se nechceš
> odpovídat. Nahraď ho dělením „používám denně / zkoušel jsem".

> [!PITFALL]
> **Mrtvý odkaz v CV.** Nefunkční živá adresa je horší než žádná. Zkontroluj všechny
> odkazy v den, kdy PDF exportuješ, a znovu po měsíci.

## Kde to najdeš dál

- [junior.guru — životopis](https://junior.guru/cv/) — česká příručka ke psaní CV pro juniory.
- [GitHub docs — profilové README](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme) — jak ho založit.
- [LinkedIn Help — Open to work](https://www.linkedin.com/help/linkedin/answer/a507508) — nastavení viditelnosti pro náboráře.

# --questions--

## --question--

Proč se do CV nevyplatí psát technologii, se kterou jsi si jen krátce hrál?

### --answer--
Protože je neslušné nadsazovat.

#### --why--
O slušnost tu nejde — kdekdo uvádí i věci, které zkoušel. Problém je praktický.

### --correct--
Protože se tě na všechno, co uvedeš, u pohovoru zeptají, a zaváhání zpochybní i zbytek seznamu.

#### --why--
Seznam dovedností je zároveň seznam otázek, které si vyrábíš sám.

### --see--
kariera-pohovor/cv-linkedin-github#sekce-ktere-lide-pisou-spatne

## --question--

Napiš titulek na LinkedIn pro juniora, který chce dělat React. Jedna řádka.

### --expected-- ignore-case
Frontend vývojář · React, TypeScript · hledám první juniorní pozici

### --accept--
Frontend vývojář | React | hledám první juniorní pozici
Junior frontend vývojář — React, TypeScript
Frontend vývojář, React, hledám první juniorní pozici

### --why--
Titulek má obsahovat roli a technologii, protože právě podle nich náboráři vyhledávají. „Student" ani „hledám příležitost" ve vyhledávání neuspějí.

### --see--
kariera-pohovor/cv-linkedin-github#linkedin-titulek-o-mne-a-aktivita

## --question--

Jak v CV využiješ tři roky práce v zákaznické podpoře, když se hlásíš na frontend?

### --answer--
Vynechám je, aby CV nepůsobilo nesouvisle.

#### --why--
Mezera v CV vyvolá otázku sama, a navíc tím zahodíš něco, co firmy shánějí.

### --correct--
Napíšu je jako konkrétní práci, která dokládá přenositelnou dovednost — zjišťování, co zákazník doopravdy potřebuje.

#### --why--
Firmy tyhle dovednosti u juniorů nemají odkud vzít, ale musí být napsané jako činnost, ne jako přídavné jméno.

### --see--
kariera-pohovor/cv-linkedin-github#jak-psat-projekt-do-cv-dopad-ne-seznam-technologii

## --question--

Co má obsahovat druhý odstavec průvodní zprávy k přihlášce?

### --expected--
Must have položky z inzerátu s důkazem u každé.

### --accept--
projít požadavky z inzerátu a ke každému dát důkaz
odpověď na must have požadavky s odkazem na projekt

### --why--
Je to jediné místo, kde čtenáři ušetříš práci: nemusí v tvém CV dohledávat, jestli požadavky splňuješ, protože to má vedle sebe.

### --see--
kariera-pohovor/trh-a-role#jak-cist-inzerat-nutne-vyhodou-a-vypln

## --question--

**Opakování z dřívějška.** Do CV chceš napsat, že umíš „TypeScript". Která vlastnost
TypeScriptu je důvod, proč ho firmy u větších projektů chtějí?

### --answer--
Zrychluje běh aplikace v prohlížeči.

#### --why--
Do prohlížeče se typy vůbec nedostanou — při sestavení se odstraní.

### --correct--
Odhalí část chyb už při psaní a překladu, dřív než kód vůbec poběží.

#### --why--
Typy jsou kontrola před během programu. Za běhu už žádná není, proto se hranice dat stejně musí ověřovat ručně.

### --see--
nastroje-typescript/kviz

## --question--

**Opakování z dřívějška.** Hodnotitel si otevře tvůj projekt a hned se podívá do
`package.json`. Co se z tohoto souboru dozví jako první?

### --expected--
Závislosti a skripty projektu.

### --accept--
seznam závislostí a npm skriptů
závislosti, skripty, název a verze projektu

### --why--
`package.json` je vstupní bod pro každého, kdo projekt vidí poprvé: dá se z něj přečíst, z čeho je projekt postavený a jak se spouští.

### --see--
nastroje-moduly-vite/kviz
