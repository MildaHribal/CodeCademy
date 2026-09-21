# Portfolio

:::check pretest
Máš v GitHubu jedenáct repozitářů: osm z nich jsou cvičení z kurzů, tři jsou tvoje
vlastní projekty. Které z nich odkážeš v CV?

### --expected--
Ty tři vlastní.
:::

Portfolio je jediná část přihlášky, u které se dá ověřit, že umíš to, co tvrdíš. CV se
dá napsat komukoli; běžící aplikace a kód za ní ne. Zároveň je to část, na kterou má ten,
kdo tě posuzuje, **pět až deset minut**. Celá tahle lekce je o tom, jak z těch deseti
minut vytěžit maximum.

> [!REMEMBER]
> **Portfolio neukazuje, co umíš, ale jak přemýšlíš.** Hodnotitel nehledá bezchybný kód —
> hledá stopy rozhodování: proč takhle, co jsi zvažoval, kde jsi udělal kompromis.

## Tři projekty, ne třináct

Tři je správné číslo. Ne pět, ne deset.

- **Deset projektů znamená, že hodnotitel neotevře žádný**, protože neví, který je ten
  dobrý. A vybere si náhodně — statisticky tedy ten nejhorší.
- **Deset projektů skoro vždycky znamená deset rozdělaných projektů.** Právě to firmy
  u juniorů nejvíc bolí a právě tenhle dojem nechceš vyvolat.
- Tři projekty se vejdou na jednu obrazovku, do jednoho odstavce CV a do jedné minuty
  vyprávění.

Ta trojice má mít různé „svaly":

| Projekt | Co dokazuje |
|---|---|
| **Aplikace s daty ze serveru** (vyhledávání, filtry, detail, stavy načítání a chyby) | Že zvládneš to, co bude tvoje denní práce. |
| **Něco s vlastním backendem nebo databází** (přihlašování, vlastní API, uložená data) | Že chápeš, co se děje na druhé straně požadavku. |
| **Volba srdce** — hra, generátor, vizualizace, nástroj, který sám používáš | Že tě to baví a že dokážeš vymyslet zadání sám. |

Třetí položka je důležitější, než vypadá. **Projekt, který někdo dělá pro sebe, se pozná
na první pohled** a je to nejčastější věc, o které se na pohovoru začne mluvit jako s
člověkem, ne jako s uchazečem.

:::check
Proč je deset projektů v portfoliu horší než tři?

### --answer--
Protože GitHub účet s mnoha repozitáři vypadá neuspořádaně.

#### --why--
Vzhled profilu je vedlejší. Problém je v tom, co se stane, když si hodnotitel musí vybrat.

### --correct--
Protože hodnotitel si vybere náhodně — a tvůj nejlepší projekt tak nejspíš vůbec neotevře.

#### --why--
Když nevybereš ty za něj, vybere podle názvu nebo pořadí a ty nad tím ztratíš kontrolu.

### --see--
kariera-pohovor/portfolio#tri-projekty-ne-trinact
:::

## Co dělá projekt [[vlajkový projekt|vlajkovým]]

Vlajkový projekt je ten, o kterém umíš mluvit deset minut a ke kterému pošleš odkaz
jako první. Má pět znaků:

1. **Řeší něco skutečného.** Ne „To Do aplikace". Evidence nájezdů na kole, plánovač
   tréninků, hlídač cen na Alze, rozpis služeb pro dobrovolné hasiče.
2. **Běží na adrese**, kterou lze otevřít bez instalace čehokoli.
3. **Zvládá ošklivé stavy**: prázdný seznam, chybu sítě, pomalé načítání, chybný vstup.
   Právě tohle odděluje školní projekt od projektu.
4. **Má README, které odpoví na „proč".**
5. **Nedá se ho projít za deset vteřin do konce.** Aspoň dvě obrazovky a nějaká data.

> [!PITFALL]
> Devadesát procent juniorních portfolií obsahuje To Do aplikaci, kalkulačku a stránku
> s počasím. Nejsou špatné — jenom je hodnotitel ten den vidí popáté a nic si z nich
> neodnese. Stejnou technickou náplň schováš do zadání, které nikdo jiný nemá.

**Nejsilnější varianta zadání: vyřeš problém, který má někdo konkrétní.** Tabulka směn
pro kavárnu tvé kamarádky je lepší portfolio než technicky složitější projekt bez
uživatele — protože u něj můžeš na pohovoru říct větu „používají to tři lidi a tohle mi
hlásili jako první".

:::check
Který z těchhle znaků odděluje „školní" projekt od projektu, který v portfoliu funguje?

### --answer--
Použití modernějšího frameworku.

#### --why--
Framework je volba nástroje. Hodnotitel se dívá po něčem, co s volbou nástroje nesouvisí.

### --correct--
Ošetřené ošklivé stavy — prázdná data, chyba sítě, pomalé načítání, neplatný vstup.

#### --why--
Šťastnou cestu naprogramuje každý. Zbytek je to, kvůli čemu se v práci platí.

### --see--
kariera-pohovor/portfolio#co-dela-projekt-vlajkovym
:::

## README, které rozhodne

**README je nejdůležitější soubor v repozitáři.** U většiny juniorních projektů je to
jediný soubor, který hodnotitel doopravdy přečte celý — teprve podle něj se rozhodne,
jestli otevře kód.

Šablona, která funguje:

````md
# Rozpis služeb

Webová aplikace pro plánování směn v malé kavárně. Vedoucí zadá směny na týden,
brigádníci se na ně zapisují a vidí, kolik hodin jim vychází.

**Živá ukázka:** https://rozpis-sluzeb.vercel.app
(přihlášení do ukázky: demo@kavarna.cz / demo1234)

![Náhled aplikace](docs/nahled.png)

## Co to umí
- Vedoucí vytvoří týden směn, brigádník se na ně zapisuje.
- Kapacita směny se hlídá na serveru, ne jen v prohlížeči.
- Přehled odpracovaných hodin za měsíc, export do CSV.

## Z čeho je to postavené
React, Vite, TanStack Query, Node + Express, SQLite, nasazeno na Vercelu a Fly.io.

## Rozhodnutí a kompromisy
- **SQLite místo Postgresu.** Aplikace má jednotky uživatelů a jeden server;
  Postgres by přidal provozní složitost bez užitku. Při růstu by se dal vyměnit,
  protože přístup k datům je schovaný v jedné vrstvě (`server/db/`).
- **Kapacita směny se ověřuje na serveru.** V prohlížeči to bylo hotové dřív, ale
  dva lidé klikající zároveň si směnu přepsali. Na serveru je kontrola v transakci.
- **Nemá to notifikace e-mailem.** Vyžadovalo by to frontu a sledování doručení,
  což je na rozsah projektu moc. Popsané jako další krok níž.

## Jak to spustit
```bash
npm ci
cp .env.example .env
npm run dev          # aplikace běží na http://localhost:5173
npm test
```

## Co bych udělal jinak
První verze držela stav směn ve třech komponentách zároveň a synchronizovala je
přes efekty. Přepsal jsem to na jeden zdroj pravdy v serverovém dotazu; kdybych
začínal znovu, udělám to takhle hned.
````

Dvě části tohoto README rozhodují o všem ostatním: **Rozhodnutí a kompromisy** a
**Co bych udělal jinak**. Ukazují přesně to, co firma od juniora chce vidět — že kód
není náhoda a že se z něj umíš poučit. Většina portfolií je nemá.

> [!TIP]
> Do README dej obrázek nebo krátké video (`docs/nahled.png`, GIF z nahrávání obrazovky).
> Hodnotitel se rozhoduje během vteřin a náhled je to jediné, co v nich stihne zpracovat.

:::check
Která část README nejvíc pomůže juniorovi u hodnocení portfolia?

### --answer--
Seznam použitých technologií.

#### --why--
Ten si hodnotitel domyslí z `package.json` za pět vteřin. Nic mu neřekne o tobě.

### --correct--
Odstavec o rozhodnutích a kompromisech — proč zrovna takhle a co jsi tím obětoval.

#### --why--
Je to jediné místo, kde je vidět uvažování. Kód sám ukazuje výsledek, ne cestu k němu.

### --see--
kariera-pohovor/portfolio#readme-ktere-rozhodne
:::

## Živá adresa a jak se tam dostat

Projekt bez [[živé adresy]] má proti projektu s ní řádově menší šanci, že si ho někdo
pustí. Nikdo nebude klonovat repozitář a instalovat závislosti, aby zjistil, jestli
stojíš za telefonát.

| Co nasazuješ | Kam nejrychleji |
|---|---|
| statická stránka nebo Vite build | GitHub Pages, Netlify, Cloudflare Pages |
| React/Vue/Next aplikace | Vercel, Netlify |
| Node server + databáze | Fly.io, Render, Railway |

Tři věci, na kterých živé ukázky nejčastěji padají:

- **Klíče k API v kódu.** Nasazená ukázka potřebuje proměnné prostředí, ne `const
  API_KEY = 'sk-…'` v repozitáři. Klíč, který se dostane do historie Gitu, se musí
  zneplatnit — smazat ho commitem nestačí.
- **Aplikace za přihlášením bez účtu pro návštěvu.** Když ukázka vyžaduje registraci,
  polovina lidí skončí. Vyrob demo účet a dej ho do README.
- **Prázdná databáze.** Ukázka s nulou záznamů vypadá jako rozbitá. Naplň ji smysluplnými
  daty, ideálně skriptem, který jde spustit znovu — a stejně tak ošetři prázdný stav
  v rozhraní, protože ten uživatel uvidí dřív nebo později tak jako tak.

:::live js predict
```js
const zaznamy = [];
const zprava = zaznamy.length > 0 ? `Záznamů: ${zaznamy.length}` : 'Zatím tu nic není';
console.log(zprava);
```
--question-- Co vypíše `console.log`?
--expected-- Zatím tu nic není
--why-- Přesně tenhle tvar má mít každý seznam v portfoliovém projektu: prázdno není chyba, ale vlastní stav s vlastním textem. Ukázka s prázdným seznamem a bez téhle věty vypadá jako rozbitá aplikace.
:::

## Historie commitů je taky ukázka práce

Ve chvíli, kdy někdo otevře tvůj repozitář, vidí i `git log`. Hodnotitelé se tam dívají
častěji, než se čeká — z historie je totiž poznat, jestli projekt vznikal postupně.

| Historie, která uškodí | Historie, která pomůže |
|---|---|
| `update`, `fix`, `asdf`, `final final` | `feat: zápis na směnu s kontrolou kapacity` |
| Jeden commit „initial commit" s 12 000 řádky | Padesát commitů po jednotlivých celcích |
| Commity v 03:00 v den odeslání přihlášky | Práce rozložená v čase |

Formát [[konvenční commity|konvenčních commitů]] (`feat:`, `fix:`, `docs:`, `refactor:`)
tě nic nestojí a v repozitáři okamžitě vidět. Když máš v historii nepořádek z dob, kdy
jsi Git teprve poznával, nevadí — důležitější je, aby posledních dvacet commitů dávalo
smysl.

:::check
Proč se hodnotitel dívá do historie commitů, i když ho zajímá hlavně výsledný kód?

### --answer--
Aby zjistil, jestli jsi projekt psal v rozumnou denní dobu.

#### --why--
Denní doba nikoho nezajímá. Z historie se dá vyčíst něco praktičtějšího.

### --correct--
Aby viděl, jestli projekt vznikal postupně po smysluplných celcích, nebo přistál naráz jedním commitem.

#### --why--
Postupná historie je nejjednodušší doklad, že kód psal ten, kdo ho odevzdal, a že umí práci členit.

### --see--
kariera-pohovor/portfolio#historie-commitu-je-taky-ukazka-prace
:::

## Co do portfolia nedávat

- **Cvičení z kurzů a tutoriálů.** Repozitář `freecodecamp-exercises` neukazuje nic
  o tobě; ukazuje, že jsi prošel stejným kurzem jako ostatních tisíc lidí. Nech ho na
  účtu, jen ho neodkazuj.
- **Kopie z videotutoriálů.** Hodnotitelé je poznají — je jich na trhu málo druhů a
  vypadají všechny stejně. Když s tutoriálem začneš, dotáhni projekt jinam, než kam vedl.
- **Rozdělané věci.** „Zatím jen rozhraní, backend bude" je horší než nezmínit to vůbec.
- **Projekty, ke kterým neumíš vysvětlit každý řádek.** Platí dvojnásob, když ti části
  kódu napsal jazykový model. Kód, u kterého na pohovoru zaváháš nad tím, proč tam je,
  ti uškodí víc, než kdyby projekt nebyl.

> [!REMEMBER]
> **Tvoje portfolio je tak dobré, jak dobrý je tvůj nejslabší odkazovaný projekt.**
> Odstranit slabý projekt je nejlevnější způsob, jak portfolio vylepšit.

:::check
Máš projekt, jehož část vzniklá s pomocí jazykového modelu ti není úplně jasná.
Co s ním před odesláním přihlášky uděláš?

### --answer--
Nechám ho tam — funguje a portfolio potřebuje objem.

#### --why--
Objem tu nepomáhá. Uvažuj, co se stane, až se tě na tu část někdo zeptá.

### --correct--
Buď tu část projdu a doopravdy jí porozumím, nebo projekt z odkazů vyhodím.

#### --why--
Zaváhání nad vlastním kódem na pohovoru uškodí víc, než kdyby projekt vůbec nebyl — zpochybní i zbytek portfolia.

### --see--
kariera-pohovor/portfolio#co-do-portfolia-nedavat
:::

:::explain
Vysvětli vlastními slovy, proč projekt s ošetřenými chybovými stavy působí na
hodnotitele líp než technicky náročnější projekt, kterému chybí.

## --model--
Naprogramovat šťastnou cestu — data dorazí, uživatel vyplní formulář správně, síť
funguje — umí každý, kdo prošel kurzem, takže tím se nikdo neodliší. Práce v týmu se
z velké části skládá z opaku: co se stane, když API vrátí 500, když je seznam prázdný,
když uživatel odešle prázdný formulář nebo když odpověď trvá čtyři vteřiny. Junior,
který na tyhle stavy myslí sám od sebe, ušetří seniorovi kolo code review a hlavně
ukazuje, že si umí představit skutečného uživatele. Technická náročnost proti tomu
neváží tolik, protože složitou knihovnu se dá naučit za týden, kdežto zvyk domýšlet
okrajové případy se buduje mnohem déle.

## --checklist--
- Šťastnou cestu zvládne každý absolvent kurzu, takže neodlišuje.
- Ošklivé stavy tvoří velkou část skutečné práce.
- Ošetřené stavy ukazují, že si autor představil skutečného uživatele.
- Znalost knihovny se dohání rychleji než návyk domýšlet okrajové případy.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Odkaz na GitHub profil místo na konkrétní projekty.** Profil je rozcestník s osmi
> repozitáři, ze kterých pět je cvičení. Odkazuj přímo na tři repozitáře a tři živé adresy.

> [!PITFALL]
> **README napsané pro sebe.** „Spusť `npm run dev`" je návod pro autora. Čtenář potřebuje
> nejdřív vědět, co ta věc dělá a pro koho, a až pak jak ji spustit.

> [!PITFALL]
> **Ukázka, která při prvním otevření spadne.** Než pošleš odkaz, otevři ho v anonymním
> okně na mobilu. Polovina „rozbitých" ukázek funguje jen díky tomu, co máš v prohlížeči
> uložené z vývoje.

> [!PITFALL]
> **Klíč k API v repozitáři.** Bezpečnostní chyba na první pohled, a rovnou v místě, kam
> se hodnotitel dívá. Klíče patří do proměnných prostředí a do `.gitignore`.

## Kde to najdeš dál

- [Make a README](https://www.makeareadme.com/) — struktura README a co do něj patří.
- [Awesome README](https://github.com/matiassingers/awesome-readme) — sbírka README, ze kterých se dá opisovat.
- [Frontend Mentor](https://www.frontendmentor.io/) — zadání s hotovým designem, když ti chybí nápad.
- [Conventional Commits](https://www.conventionalcommits.org/cs/) — formát commitů česky.

# --questions--

## --question--

Kolik projektů má junior aktivně odkazovat v CV a proč zrovna tolik?

### --answer--
Co nejvíc — čím víc kódu, tím větší šance, že se něco zalíbí.

#### --why--
Funguje to opačně: čím víc odkazů, tím menší šance, že hodnotitel otevře ten dobrý.

### --correct--
Tři, protože se vejdou do jednoho odstavce a ty si sám vybereš, co hodnotitel uvidí.

#### --why--
Výběr je součást práce. Kdo neumí vybrat tři svoje nejlepší věci, ukazuje tím taky něco.

### --see--
kariera-pohovor/portfolio#tri-projekty-ne-trinact

## --question--

Které dvě části README řeknou hodnotiteli nejvíc o tom, jak přemýšlíš? Napiš je oddělené čárkou.

### --expected-- ignore-case
Rozhodnutí a kompromisy, Co bych udělal jinak

### --accept--
rozhodnutí a kompromisy, co bych příště udělal jinak
kompromisy, co bych udělal jinak

### --why--
Obě části popisují cestu, ne výsledek. Kód sám ukáže, co jsi udělal, ale ne proč a čeho sis byl vědom.

### --see--
kariera-pohovor/portfolio#readme-ktere-rozhodne

## --question--

Tvoje ukázka je za přihlášením. Co s tím uděláš, než pošleš odkaz do CV?

### --answer--
Napíšu do README, že přístup pošlu na vyžádání.

#### --why--
Vyžádání znamená další výměnu e-mailů. Do té doby už hodnotitel pokračoval dál.

### --correct--
Vyrobím demo účet s naplněnými daty a přihlašovací údaje napíšu rovnou do README.

#### --why--
Každá další překážka mezi odkazem a fungující aplikací ubere část lidí, kteří ji otevřou.

### --see--
kariera-pohovor/portfolio#ziva-adresa-a-jak-se-tam-dostat

## --question--

Vyjmenuj tři různé „svaly", které má trojice projektů v portfoliu pokrýt. Stačí
klíčová slova oddělená čárkou.

### --expected-- ignore-case
data ze serveru, vlastní backend, volba srdce

### --accept--
aplikace s daty ze serveru, něco s vlastním backendem nebo databází, projekt pro sebe
frontend s API, backend s databází, vlastní nápad

### --why--
První dokazuje, že zvládneš denní práci, druhý že chápeš druhou stranu požadavku, třetí že si umíš vymyslet zadání sám.

### --see--
kariera-pohovor/portfolio#tri-projekty-ne-trinact

## --question--

Proč je repozitář se cvičeními z kurzu slabý odkaz do portfolia?

### --answer--
Protože kód ze cvičení bývá nekvalitní.

#### --why--
Kvalita bývá v pořádku — zadání i řešení jsou z kurzu. Chybí tam něco jiného.

### --correct--
Protože v něm nejsou tvoje rozhodnutí: zadání, návrh i postup byly dané předem.

#### --why--
Portfolio má ukázat, jak si vedeš, když ti zadání nikdo nenapíše. To je přesně to, co se v práci děje.

### --see--
kariera-pohovor/portfolio#co-do-portfolia-nedavat

## --question--

**Opakování z dřívějška.** Do README píšeš, že projekt se spustí přes `npm ci`.
Proč se v návodu uvádí `npm ci` a ne `npm install`?

### --expected--
Nainstaluje přesně verze z package-lock.json.

### --accept--
npm ci nainstaluje přesně verze ze zámkového souboru
respektuje package-lock.json a nepřepisuje ho
instaluje přesně podle package-lock.json

### --why--
`npm install` smí závislosti povýšit a zámkový soubor přepsat, takže se čtenáři projekt rozjede v jiném prostředí, než ve kterém ti funguje.

### --see--
nastroje-cizi-kod/orientace-v-cizim-kodu#1-rozbehni-projekt-nez-prectes-radku-kodu

## --question--

**Opakování z dřívějška.** Zjistíš, že jsi před dvěma týdny commitnul soubor `.env`
s klíčem k platební bráně a mezitím jsi to pushnul na GitHub. Co je první věc, kterou uděláš?

### --answer--
Smažu soubor novým commitem a vysvětlím to v popisu commitu.

#### --why--
Smazání novým commitem klíč z historie neodstraní — dá se dohledat v každém starším commitu i v naklonovaných kopiích.

### --correct--
Klíč zneplatním a vygeneruju nový; teprve potom řeším úklid historie.

#### --why--
Jakmile se tajemství dostane do veřejné historie, musí se považovat za vyzrazené. Historie se dá přepsat, ale kopie u ostatních už ne.

### --see--
nastroje-git-terminal/git-zachrana#commitnute-tajemstvi
