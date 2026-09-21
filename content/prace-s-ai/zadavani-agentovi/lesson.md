# Zadávání úkolu agentovi

:::check pretest
Zadáš agentovi „přidej do aplikace filtrování produktů" bez dalších podmínek. Odhadni, co bude na výsledku nejdražší — že to nebude fungovat, nebo že to bude fungovat jinak, než jsi čekal?

### --expected--
Že to bude fungovat jinak, než jsem čekal.
:::

[[AI agent|Agent]] se od chatu liší jednou věcí: sám sahá na soubory. Čte je, mění, zakládá
nové, spouští příkazy. Tím se z „návrhu, který si přečtu" stává „změna, kterou musím
zkontrolovat" — a kontrola cizí změny je dražší než její napsání. Tahle lekce je
o tom, jak zadání napsat tak, aby ta kontrola byla krátká.

> [!REMEMBER]
> **Zadáváš úkol, ne přání.** Rozdíl je v tom, že u úkolu je předem jasné, podle čeho
> poznáš, že je hotový — a to poznání nesmí být „vypadá to dobře".

## 1. Co agent vidí a co ne

Agent nemá tvůj projekt v hlavě. Má jen to, co mu nástroj poslal: pár otevřených
souborů, výsledky hledání a kousek historie konverzace. Všechno ostatní si domyslí
podle toho, jak se projekty obvykle píšou — tedy podle průměru internetu, ne podle
tvého repozitáře.

Z toho plyne, co do zadání patří vždycky:

- **konkrétní soubory**, kterých se to týká (jménem, ne popisem),
- **vzor, který má následovat** („dělej to stejně jako `useOrders.js`"),
- **hranice** — co se měnit nesmí.

Bez hranic agent klidně přidá závislost, přepíše konfiguraci formátovače nebo „při
té příležitosti" zrefaktoruje sousední soubor. Nedělá to ze zlomyslnosti: v jeho datech
je takový úklid běžná součást podobných změn.

:::compare
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; color: #1f2937; }
h3 { font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin: 0 0 .5rem; }
ul { list-style: none; padding: 0; margin: 0 0 .7rem; font-family: ui-monospace, monospace; font-size: .82rem; }
li { padding: .18rem .4rem; border-radius: .25rem; }
li.zmena { background: #fef3c7; }
li.pozor { background: #fee2e2; }
p { margin: 0; font-size: .85rem; font-weight: 600; }
```
--variant-- Zadání bez hranic
```html
<h3>Změněno: 14 souborů</h3>
<ul>
  <li class="zmena">src/components/ProductList.jsx</li>
  <li class="zmena">src/components/ProductCard.jsx</li>
  <li class="zmena">src/hooks/useProducts.js</li>
  <li class="pozor">package.json (+ 2 závislosti)</li>
  <li class="pozor">.prettierrc</li>
  <li class="pozor">src/api/client.js</li>
  <li>… a dalších 8 souborů</li>
</ul>
<p>Review: „vypadá to dobře“</p>
```
--variant-- Zadání s hranicemi a kritérii
```html
<h3>Změněno: 2 soubory</h3>
<ul>
  <li class="zmena">src/products/filterProducts.js</li>
  <li class="zmena">src/products/filterProducts.test.js</li>
</ul>
<p>Review: přečteno řádek po řádku</p>
```
:::

:::check
Proč agent bez hranic často sáhne i na soubory, které se zadáním nesouvisí?

### --answer--
Protože je potřebuje, aby úkol vůbec splnil.

#### --why--
U většiny takových změn to není potřeba — kdyby bylo, řekl by ti to.

### --correct--
Protože v datech, ze kterých generuje, je „úklid při té příležitosti" běžnou součástí podobných změn.

#### --why--
Proto se to spolehlivě vyřeší jednou větou v zadání: vyjmenuj, co se měnit nesmí.

### --see--
prace-s-ai/zadavani-agentovi#1-co-agent-vidi-a-co-ne
:::

## 2. Dobré zadání má čtyři části

Každé zadání, u kterého ti na výsledku záleží, má tyhle čtyři části. Chybějící část
si agent doplní sám a to je přesně to, co nechceš.

| Část | Otázka, na kterou odpovídá | Příklad |
|---|---|---|
| **Záměr** | Proč to děláme? | „Zákazníci nenajdou kolo podle velikosti rámu." |
| **Kontext** | Kde to žije? | „Logika je v `src/products/filterProducts.js`, vzor hledání viz `filterByBrand`." |
| **Omezení** | Co se nesmí? | „Žádná nová závislost. Neměň veřejné rozhraní funkce. Nesahej na styly." |
| **Kritéria přijetí** | Jak poznáme hotovo? | „`filterProducts(kola, { velikost: 'M' })` vrátí jen kola s `velikost === 'M'`; u prázdného filtru vrátí všechna." |

[[kritérium přijetí|Kritérium přijetí]] je z těch čtyř nejdůležitější a nejčastěji chybí.
Záměr není zdvořilost. Když agent ví **proč**, udělá při nejednoznačnosti bližší
odhad — a při každém úkolu je nejednoznačností deset.

> [!TIP]
> Omezení piš jako seznam zákazů, ne jako větu. „Nepřidávej závislosti, neměň
> `package.json`, neformátuj cizí soubory" funguje výrazně líp než „drž se prosím
> stávajícího stylu".

:::check
Která ze čtyř částí zadání chybí nejčastěji a nejvíc se to prodraží?

### --answer--
Kontext — agent pak nenajde správné soubory.

#### --why--
Chybějící kontext bolí, ale pozná se hned: agent se zeptá nebo sáhne vedle.

### --correct--
Kritéria přijetí — bez nich není podle čeho výsledek posoudit a zbude „vypadá to dobře".

#### --why--
Bez kritérií se z review stává čtení nálady místo kontroly chování.

### --see--
prace-s-ai/zadavani-agentovi#2-dobre-zadani-ma-ctyri-casti
:::

## 3. Kritéria přijetí piš jako testy

Kritérium přijetí napsané větou se dá splnit pěti způsoby. Kritérium napsané jako
konkrétní volání s konkrétní návratovou hodnotou se dá splnit jedním. Proto zadání
pro agenta končí seznamem případů — včetně těch nepříjemných:

```js
filterProducts(kola, {})                          // → všechna kola
filterProducts(kola, { velikost: 'M' })           // → jen velikost M
filterProducts([], { velikost: 'M' })             // → []
filterProducts(kola, { velikost: 'XXL' })         // → []
filterProducts(kola, { velikost: null })          // → všechna kola
```

Pět řádků v zadání ti ušetří půl hodiny objevování v review. A hlavně: poslední tři
řádky jsou přesně ty, na které by agent sám nemyslel.

Ještě lepší postup je **test napsat první**, spustit ho (červený) a agentovi zadat
jediný úkol: „rozsviť tenhle test zeleně a nic jiného neměň". Pak máš kritérium
hotové, nezávislé na tom, co agent napíše, a kontrolu zadarmo.

:::live js predict
```js
function cenaSDph(cena) {
  return cena * 1.21;
}

console.log('je to číslo: ' + (typeof cenaSDph(249) === 'number'));
console.log('výsledek: ' + cenaSDph(249));
```
--question-- Agent dostal kritérium „funkce vrátí číslo s DPH" a odevzdal tenhle kód s tímhle ověřením. Co se vypíše?
--expected--
```text
je to číslo: true
výsledek: 301.28999999999996
```
--why-- Kritérium „vrátí číslo" je splněné, a přitom je výsledek k faktuře nepoužitelný. Kritérium psané jako konkrétní hodnota (`cenaSDph(249)` se rovná `301.29`) by chybu zachytilo hned.
:::

:::explain
Vysvětli vlastními slovy, proč kritérium přijetí napsané jako spustitelný test
změní i to, jak agent úkol udělá — ne jen to, jak ho ty zkontroluješ.

## --model--
Spustitelný test je jednoznačný cíl: agent si u něj nemůže vybrat volnější výklad zadání,
protože buď je zelený, nebo není. Zároveň mu test prozradí případy, na které by sám
nemyslel — prázdný vstup, neznámou hodnotu, hraniční číslo — takže je rovnou zohlední
v návrhu, místo aby dodal šťastnou cestu. A protože si výsledek může sám spustit, opraví
si první pokus dřív, než mi ho odevzdá.

## --checklist--
- Test je jednoznačný cíl, který nejde vyložit volněji.
- Vyjmenované případy zahrnou i ty, na které by agent sám nemyslel.
- Agent si podle testu může opravit vlastní první pokus.
:::

:::check
Proč je lepší napsat červený test dřív, než zadáš úkol agentovi?

### --answer--
Protože agent pak nemusí psát testy a ušetří se čas.

#### --why--
Testy ti agent klidně dopíše — jenže pak jsou z téže hlavy jako kód.

### --correct--
Protože kritérium vznikne nezávisle na tom, co agent napíše, a kontrola je pak jen spuštění testu.

#### --why--
Zadání se navíc zkrátí na jednu větu: rozsviť tenhle test a nic jiného neměň.

### --see--
prace-s-ai/zadavani-agentovi#3-kriteria-prijeti-pis-jako-testy
:::

## 4. Malé kroky a commit po každém

Velký úkol zadaný najednou má tři problémy naráz: nejde zrevidovat, nejde vrátit po
částech a když se něco rozbije, nevíš který krok to byl. Stejné pravidlo jako u
velikosti pull requestu, jen se ti tady hromada kódu vyrobí za dvě minuty místo za dva dny.

Rozpad, který funguje skoro vždycky:

1. **Datový tvar** — jak vypadá vstup a výstup. Zkontroluj, commit.
2. **Čistá funkce s testy** — logika bez sítě a bez DOM. Zkontroluj, commit.
3. **Napojení** — volání API, načtení dat, ošetření chyb. Zkontroluj, commit.
4. **UI** — zobrazení a stavy. Zkontroluj, commit.

Commit mezi kroky není formalita. Je to jediný způsob, jak si zachovat `git diff`
o velikosti, kterou přečteš, a bod, do kterého se dá vrátit jedním příkazem.

> [!PITFALL]
> Nejhorší stav je „agent pracoval dvacet minut a je to skoro dobré". Skoro dobré
> se nedá zrevidovat ani zahodit. Když se úkol takhle rozjede, zahoď to, zúžit zadání
> a pusť to znovu — bude to levnější než opravování.

:::check
Proč se commit dělá po každém kroku, a ne až na konci, když výsledek stejně reviduješ celý?

### --answer--
Protože jinak by se změny agenta ztratily.

#### --why--
Změny jsou na disku i bez commitu — problém je jinde než v jejich ztrátě.

### --correct--
Protože commit ohraničí diff na velikost, kterou opravdu přečteš, a dá ti bod, do kterého se lze vrátit.

#### --why--
Bez mezikroků reviduješ tisíc řádků naráz, a to prakticky znamená neschválit nebo neprojít.

### --see--
prace-s-ai/zadavani-agentovi#4-male-kroky-a-commit-po-kazdem
:::

## 5. Co agentovi nesvěříš

- **Tajemství.** Produkční klíče, hesla, přístupové tokeny, obsah `.env`. Odchází to na
  cizí servery a v logu to zůstane déle, než si myslíš. Do promptu patří `API_KEY`
  jako jméno proměnné, ne jako hodnota.
- **Skutečná osobní data.** Export uživatelů z produkce do promptu nepatří ani jako
  „ukázka dat". Vyrob si pět smyšlených řádků.
- **Nevratné operace.** Migrace databáze, mazání větví, `git push --force`, nasazení.
  Agent může připravit skript; spustit ho má člověk, který ví, co je v produkci.
- **Rozhodnutí o architektuře.** „Vyber nám stavový nástroj" je otázka na tým, protože
  odpověď budete udržovat roky. Agent ti rád vybere ten, který je v datech nejčastější.

> [!PITFALL]
> Agent umí číst soubory v repozitáři — včetně těch, na které jsi zapomněl. Než ho
> pustíš na projekt, ověř, že v něm není `.env` s produkčními hodnotami a že je
> v `.gitignore`. Stejná kontrola, jakou děláš před prvním pushnutím.

> [!NOTE]
> Agent klidně provede instrukci, kterou najde v souboru, na issue nebo v README —
> pro model je to jen další text v kontextu. Tomu se říká [[prompt injection]] a je to
> důvod, proč se agentovi nedává přístup k tajemstvím ani právo nasazovat.

:::check
Proč nepatří do promptu skutečný export uživatelů, ani když ho používáš jen jako ukázku tvaru dat?

### --answer--
Protože model by se na těch datech mohl přetrénovat.

#### --why--
Na tvých datech se model nepřetrénuje — riziko je úplně jinde.

### --correct--
Protože osobní data odchází na cizí servery a zůstanou v logech, i když je model nepoužije.

#### --why--
Tvar dat předvedeš stejně dobře na pěti smyšlených řádcích.

### --see--
prace-s-ai/zadavani-agentovi#5-co-agentovi-nesveris
:::

## 6. Kdy se agent nevyplatí

Agent je nejsilnější tam, kde je úkol mechanický a ověřitelný: převedení sta řádků
do jiného tvaru, dopsání testů k existujícímu chování, doplnění typů, přepis stejné
komponenty do dvaceti souborů.

Nevyplatí se, když:

- **je zadání delší než výsledek.** Než vypíšeš kontext, omezení a kritéria, byla by
  ta desetiřádková funkce dávno hotová.
- **problém ještě nechápeš.** Agent kód vyrobí, ale otázku, kterou máš doopravdy
  zodpovědět, ti nezodpoví — jen ji zakryje.
- **jde o jednu chybu v kódu, který znáš.** Najít ji je obvykle rychlejší než popsat
  ji dost přesně na to, aby ji našel někdo jiný.
- **nemáš, čím výsledek ověřit.** Bez testů a bez schopnosti si kód přečíst vyrábíš
  jen technický dluh rychleji.

Tomu poslednímu způsobu práce — přijmout všechno bez čtení a řídit se tím, jestli to
na první pohled běží — se říká [[vibe coding]]. Na prototyp, který v pondělí zahodíš,
je to legitimní volba. Na kód, který někdo bude rok udržovat, je to způsob, jak si
najmout nejrychlejšího juniora na světě a nikdy mu nedělat review.

:::check
Ve které z těchto situací se zadání agentovi vyplatí nejvíc?

### --answer--
Když nevíš, jak k problému přistoupit, a potřebuješ začít.

#### --why--
Tady agent hlavně zakryje otázku, kterou máš ještě zodpovědět ty.

### --correct--
Když máš mechanickou, dobře popsatelnou změnu ve dvaceti souborech a testy, které ji ověří.

#### --why--
Mechanická práce s ověřením je přesně ta část, kde je agent rychlejší než ty a riziko malé.

### --see--
prace-s-ai/zadavani-agentovi#6-kdy-se-agent-nevyplati
:::

## 7. Typické chyby a pasti

> [!PITFALL]
> **Zadání jako přání.** „Zrychli to", „udělej to hezčí", „ukliď to". Bez měřitelného
> cíle dostaneš změnu, kterou nemáš jak posoudit.

> [!PITFALL]
> **Pokračování v rozjeté konverzaci.** Po deseti krocích agent pracuje se starší
> verzí souboru. Když se výsledky začnou rozcházet, založ nový úkol s čerstvým kontextem.

> [!PITFALL]
> **Zelené testy, které napsal tentýž agent.** Když si agent napíše kritérium sám,
> napsal si zkoušku i odpovědi. Kritéria musí vzniknout dřív než kód.

> [!PITFALL]
> **Automatické potvrzování akcí.** Režim, kde agent nic nepotvrzuje, je pohodlný přesně
> do chvíle, než smaže složku. Na cizím a produkčním repozitáři ho nezapínej.

:::check
Agent pracuje dvacet minut a výsledek je „skoro dobrý". Co je nejlevnější další krok?

### --answer--
Nechat ho dodělat zbytek a pak to celé zrevidovat.

#### --why--
Revize dvaceti minut cizí práce naráz je přesně ta situace, které se malé kroky vyhýbají.

### --correct--
Zahodit to, zúžit zadání a pustit to znovu na menší část.

#### --why--
Skoro dobrý výsledek se nedá ani zrevidovat, ani opravit levněji, než vyrobit znovu.

### --see--
prace-s-ai/zadavani-agentovi#7-typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [Google Engineering Practices: Writing good CL descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html) — jak popsat změnu, ať se dá zrevidovat.
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) — prompt injection a další rizika agentů.
- [MDN: Environment variables a tajemství](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/deployment) — kam patří klíče místo do kódu.

# --questions--

## --question--

Vyjmenuj čtyři části dobrého zadání pro agenta.

### --expected--
záměr, kontext, omezení, kritéria přijetí

### --accept--
záměr, kontext, omezení, kritéria
proč, kde, co nesmí, jak poznáme hotovo

### --why--
Každá část odpovídá na jednu otázku: proč, kde, co se nesmí a podle čeho poznáme hotovo.
Chybějící část si agent doplní podle průměru internetu.

### --see--
prace-s-ai/zadavani-agentovi#2-dobre-zadani-ma-ctyri-casti

## --question--

Agent odevzdal funkci `cenaSDph`, která u vstupu `249` vrátí `301.28999999999996`.
Kritérium znělo „vrátí číslo s DPH". Kde je chyba — v kódu, nebo v zadání?

### --answer--
V kódu: agent měl výsledek zaokrouhlit i bez toho, aby to bylo v zadání.

#### --why--
Zaokrouhlení na haléře, na koruny, nebo nahoru? To je rozhodnutí, které zadání neřeklo.

### --correct--
V zadání: kritérium „vrátí číslo" je splněné, takže nemělo šanci tenhle výsledek zachytit.

#### --why--
Kritérium s konkrétní hodnotou (`cenaSDph(249)` se rovná `301.29`) by chybu odhalilo hned.

### --see--
prace-s-ai/zadavani-agentovi#3-kriteria-prijeti-pis-jako-testy

## --question--

Proč se zadání agentovi rozpadá na kroky s commitem, i když by to celé zvládl na jeden pokus?

### --expected--
aby šel každý krok zkontrolovat a vrátit zvlášť

### --accept--
kvůli malému diffu a možnosti se vrátit
aby se dal diff přečíst a chyba dohledat

### --why--
Malý diff se dá přečíst, velký se dá jen prolistovat. A commit je bod, do kterého se
dá vrátit jedním příkazem, aniž bys přišel o zbytek práce.

### --see--
prace-s-ai/zadavani-agentovi#4-male-kroky-a-commit-po-kazdem

## --question--

Napiš jednu větu omezení, kterou do zadání přidáš, aby ti agent nepřidal do projektu
nové knihovny.

### --expected-- ignore-case
Nepřidávej žádné nové závislosti.

### --accept--
nepřidávej nové balíčky
žádné nové závislosti
neměň package.json

### --why--
Zákaz musí být konkrétní a ověřitelný v diffu: stačí se podívat, jestli se změnil
`package.json`.

### --see--
prace-s-ai/zadavani-agentovi#2-dobre-zadani-ma-ctyri-casti

## --question--

**Opakování z dřívějška.** Omylem jsi nechal agenta pracovat v repozitáři, kde byl
zacommitovaný soubor s produkčním klíčem. Proč nestačí klíč smazat dalším commitem?

### --answer--
Protože `git` mazání souborů neumí zaznamenat.

#### --why--
Smazání se zaznamená normálně — problém je v tom, co zůstane v historii.

### --correct--
Protože starý commit s klíčem v historii zůstane a dá se z ní vytáhnout. Klíč je potřeba zneplatnit a vydat nový.

#### --why--
Přepsání historie pomůže jen u větve, kterou nikdo nestáhl. Jistota je vždycky jen nový klíč.

### --see--
nastroje-git-terminal/git-zachrana#commitnute-tajemstvi

## --question--

**Opakování z dřívějška.** Agent ti k nové funkci dopsal test. Podle čeho poznáš, že
testuje chování, a ne implementaci?

### --expected--
Když přepíšu vnitřek funkce a chování nechám stejné, test zůstane zelený.

### --accept--
test nepřestane platit po refaktoru
testuje vstup a výstup, ne vnitřní kroky
zůstane zelený po refaktoru beze změny chování

### --why--
Test svázaný s implementací zčervená při každém refaktoru a tím tě odnaučí refaktorovat.
Test chování zčervená jen tehdy, když se změní to, co uživatel vidí.

### --see--
nastroje-testovani/proc-testovat#testuj-chovani-ne-implementaci
