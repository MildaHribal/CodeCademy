# Code review

:::check pretest
Dostaneš k revizi pull request. Čemu bys měl věnovat víc pozornosti — chybějícím mezerám a uvozovkám, nebo tomu, co kód dělá s prázdným polem?

### --expected--
Tomu, co dělá s prázdným polem.
:::

[[code review|Code review]] je chvíle, kdy se z kódu jednoho člověka stává kód týmu. Je to
zároveň nejlevnější místo, kde jde chybu zachytit — levnější než testovací prostředí a
o několik řádů levnější než produkce.

> [!REMEMBER]
> **Review není zkouška autora, ale rozhovor o kódu.** Cílem není najít, kdo se spletl,
> ale dostat do hlavní větve něco, co za rok někdo přečte a pochopí.

Tahle lekce má tři části: co hlídat, jak to napsat, a jak review přijímat.

## 1. Co hlídat a co nechat strojům

Lidská pozornost je drahá. Utrať ji tam, kde stroj nestačí.

**Kontroluj:**

- **Správnost** — dělá to, co issue žádá? Co prázdné pole, `null`, záporné číslo, dva souběžné požadavky?
- **Architektura** — patří tahle logika sem? Nevzniká obousměrná závislost?
- **Čitelnost** — poznám za rok z názvu, co funkce dělá? Není to tři úrovně vnoření hluboko?
- **Testy** — testuje se nové chování? Testuje se i chybová větev?
- **Bezpečnost** — vstup od uživatele v dotazu do databáze, v HTML, v shellu? Klíče v kódu?

**Nekontroluj** (od toho jsou linter a formatter):

- mezery, středníky, uvozovky, odsazení, pořadí importů.

Když se v review řeší formátování, není to problém autora — je to chybějící řádek
v konfiguraci CI.

:::compare
```html
<p class="popisek">Komentář v review</p>
```
--variant-- Co chytne stroj
```css
.popisek::after { content: " → chybí středník, dvojité uvozovky, odsazení"; color: #6b7280; }
```
--variant-- Co musí chytit člověk
```css
.popisek::after { content: " → co když je pole prázdné?"; color: #0f6466; font-weight: 600; }
```
:::

:::check
Proč se při review nemáš zabývat tím, jestli autor použil jednoduché, nebo dvojité uvozovky?

### --answer--
Protože na tom v JavaScriptu nezáleží.

#### --why--
Na konzistenci záleží — ale ne tvoje pozornost je ten správný nástroj.

### --correct--
Protože to má hlídat formatter automaticky, a ty máš omezenou pozornost na věci, které stroj nepozná.

#### --why--
Každý komentář o formátování je komentář, který jsi nenapsal o chybějícím okrajovém případu.

### --see--
nastroje-cizi-kod/code-review#1-co-hlidat-a-co-nechat-strojum
:::

## 2. Jak napsat komentář, který se dá přijmout

Dobrý komentář má tři vlastnosti: je **konkrétní**, vysvětluje **proč**, a nechává
autorovi prostor odpovědět.

| Místo tohohle | Napiš tohle |
|---|---|
| „Tohle je špatně." | „Když je `items` prázdné, `reduce` bez počáteční hodnoty vyhodí výjimku. Přidáme `, 0`?" |
| „Přejmenuj to." | „Název `data` mi tady nic neříká — nebylo by `objednavky` jasnější?" |
| „Tohle je pomalé." | „Při tisících položkách je `find` v cyklu kvadratický. Nehodil by se `Map` postavený předem?" |
| „Proč tu není test?" | „Přidáme test na variantu s prázdným košíkem? Zrovna tuhle větev jsem si musel dohledat." |

Označ **váhu** komentáře, ať autor pozná, co blokuje a co ne:

- `nit:` — [[nitpick|drobnost]], klidně ignoruj nebo oprav jindy.
- `otázka:` — nerozumím, vysvětli mi to.
- `návrh:` — takhle by to šlo taky, rozhodni se sám.
- *bez prefixu* — tohle je podle mě potřeba opravit před začleněním.

> [!TIP]
> Nezapomeň psát i to, co je dobře. „Tohle rozdělení do dvou funkcí je mnohem čitelnější
> než předtím" stojí deset sekund a zásadně mění, jak se zbytek review čte.

> [!PITFALL]
> Víc než dvě kola komentářů ke stejné věci znamená, že se textem nedohodnete. Zavolej si
> na pět minut. Ušetří to den a vztah.

:::check
Chceš upozornit na překlep v komentáři, ale nechceš kvůli němu blokovat začlenění. Jak komentář začneš?

### --expected-- ignore-case
nit:

### --accept--
nit
nitpick:
nitpick

### --why--
`nit:` je smluvená značka pro drobnost. Autor hned ví, že si může vybrat, jestli to opraví teď, nebo vůbec.
:::


## 3. Jak review přijímat

Dvacet komentářů pod prvním pull requestem bolí. Tři věci pomáhají:

1. **Nejsi tvůj kód.** Komentář míří na řádky, ne na tebe. Autor kódu a člověk jsou dvě
   různé role, i když sedí na jedné židli.
2. **Ptej se místo obhajování.** „Nerozumím, proč by `Map` byla lepší — nebude to
   režie navíc?" je odpověď, která posouvá. „Takhle to dělám vždycky" není.
3. **Odpověz na každý komentář.** I kdyby jen „opraveno" nebo „tohle bych nechal, tady je
   proč". Nezodpovězený komentář vypadá jako přehlédnutý.

> [!REMEMBER]
> Reviewer, který najde chybu, ti ušetřil noční nasazování opravy. To není útok, to je
> ta nejlevnější pomoc, jakou můžeš dostat.

## 4. Velikost pull requestu rozhoduje o kvalitě review

Existuje tvrdá hranice lidské pozornosti. Pull request o dvou stech řádcích dostane
věcné komentáře. Pull request o tisíci řádcích dostane [[LGTM]] — ne proto, že je dobrý,
ale protože ho nikdo nepřečte.

| velikost změny | co se reálně stane |
|---|---|
| do ~50 řádků | řádek po řádku, nejlepší poměr nalezených chyb |
| 50–300 řádků | pořád dobré review, obvyklý cíl |
| 300–800 řádků | reviewer čte jen diagonálně |
| nad 800 řádků | „vypadá to dobře" bez přečtení |

Když ti práce roste pod rukama, rozděl ji: nejdřív pull request s přípravou
(refaktor bez změny chování), pak pull request s novou funkcí.

:::explain
Vysvětli vlastními slovy, proč je velký pull request horší než dva menší, i když obsahuje
úplně stejný kód.

## --model--
Review je omezené pozorností, ne velikostí diffu. U malého pull requestu reviewer udrží
v hlavě celý kontext a všimne si, že chybí okrajový případ. U velkého se po třetí stovce
řádků přepne do režimu prohlížení a schválí ho, aniž by ho opravdu zkontroloval — takže
stejný kód projde hůř zrevidovaný. Rozdělení navíc odděluje mechanické změny (refaktor,
přejmenování) od změn chování, takže je v každém pull requestu vidět jen jeden druh
rizika.

## --checklist--
- Review limituje pozornost reviewera, ne počet řádků.
- U velkého pull requestu se čte diagonálně a schvaluje naslepo.
- Menší celky dostanou věcné komentáře.
- Oddělení refaktoru od změny chování zjednoduší posouzení rizika.
:::

:::check
Tvůj pull request má 900 změněných řádků a dostal jsi ho zpátky se slovy „vypadá to dobře". Co s tím uděláš příště?

### --answer--
Nic — schválení je schválení.

#### --why--
Schválení bez přečtení znamená, že review neproběhlo. Chyba je pořád v kódu, jen o ní nikdo neví.

### --correct--
Rozdělím práci na menší pull requesty — nejdřív přípravu bez změny chování, pak novou funkci.

#### --why--
Menší celek se vejde do pozornosti reviewera, takže dostaneš věcné komentáře místo formálního odsouhlasení.
:::


## Kde to najdeš v MDN a jinde

- [Google Engineering Practices: The Code Reviewer's Guide](https://google.github.io/eng-practices/review/reviewer/) — nejznámější průvodce reviewem.
- [How to Do Code Reviews Like a Human](https://mtlynch.io/human-code-reviews-1/) — o tónu a lidské stránce.
- [Conventional Comments](https://conventionalcomments.org/) — systém prefixů pro váhu komentáře.

# --questions--

## --question--

Jaké problémy v pull requestu má odhalovat automatizace, a ne člověk?

### --answer--
Chybějící okrajové případy.

#### --why--
Okrajové případy vyžadují znalost záměru — to stroj nemá.

### --correct--
Formátování, styl zápisu, nepoužité proměnné a další věci, které pozná linter a formatter.

#### --why--
Jsou to pravidla bez kontextu, takže je zvládne stroj — a tím uvolní lidskou pozornost pro logiku.

### --see--
nastroje-cizi-kod/code-review#1-co-hlidat-a-co-nechat-strojum

## --question--

Jakým prefixem označíš v komentáři drobnost, kvůli které nechceš blokovat začlenění?

### --expected-- ignore-case
nit

### --accept--
nit:
nitpick
nitpick:

### --why--
`nit:` (od *nitpick*) říká autorovi: všiml jsem si, ale klidně to nech nebo oprav při nejbližší příležitosti.

## --question--

Proč velké pull requesty často projdou schválením bez pečlivého přečtení?

### --answer--
Protože velké změny bývají psané zkušenějšími vývojáři.

#### --why--
S autorem to nesouvisí, souvisí to s čtenářem.

### --correct--
Protože pozornost reviewera je omezená a po pár stovkách řádků přejde na prohlížení místo čtení.

#### --why--
Proto se vyplatí rozdělit práci do menších pull requestů, i když je výsledný kód stejný.

## --question--

Jak nejlépe reaguješ na komentář v review, se kterým nesouhlasíš?

### --answer--
Komentář vyřeším jako „resolved" a nechám kód být.

#### --why--
Zavření bez odpovědi vypadá jako přehlédnutí a reviewer ho otevře znovu.

### --correct--
Odpovím otázkou nebo důvodem — a když se po druhém kole neshodneme, zavolám si.

#### --why--
Textové dohadování je pomalé. Pět minut hovoru obvykle vyřeší to, co deset komentářů ne.

## --question--

**Opakování z dřívějška.** V revidovaném kódu najdeš dotaz do databáze skládaný
řetězcem z hodnoty, kterou poslal uživatel. Jak se jmenuje zranitelnost, na kterou
v komentáři upozorníš?

### --expected-- ignore-case
SQL injection

### --accept--
sql injekce
sqli

### --why--
Obrana je vždycky parametrizovaný dotaz — hodnota se do dotazu nevkládá jako text, ale předává se zvlášť.

### --see--
auth-bezpecnost/owasp-zranitelnosti

## --question--

**Opakování z dřívějška.** Autor v pull requestu přidal test, který volá skutečné
externí API. Co mu v review doporučíš a proč?

### --answer--
Ať test označí jako pomalý a nechá ho být.

#### --why--
Pomalost není hlavní problém — hlavní problém je spolehlivost.

### --correct--
Ať externí volání nahradí mockem, protože jinak test padá pokaždé, když je API nedostupné nebo změní data.

#### --why--
Test má selhat jen tehdy, když je chyba v kódu. Závislost na cizí službě z něj dělá generátor náhodných červených běhů.

### --see--
nastroje-testovani/mocky-cas-sit
