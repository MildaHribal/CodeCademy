# Review kódu z AI

:::check pretest
Vygenerovaný kód se spustí a na tvých datech vrátí správný výsledek. Kolik procent práce na jeho kontrole máš za sebou?

### --expected--
Malou část.
:::

Ve chvíli, kdy vložíš vygenerovaný kód do svého repozitáře, stává se tvůj. Podepíšeš
ho commitem, budeš ho opravovat v pátek večer a budeš ho za rok vysvětlovat kolegovi.
Proto se na něj dívej přesně tak, jako by ti přišel jako pull request od rychlého,
sebevědomého a naprosto neznalého člověka — protože přesně to se stalo.

> [!REMEMBER]
> **Review vygenerovaného kódu není přečtení, ale hledání.** Nečteš proto, abys pochopil
> záměr autora — ten znáš, je tvůj. Čteš proto, abys našel místo, kde se kód s tím
> záměrem rozchází.

## 1. Čti diff, ne odpověď v chatu

Odpověď v chatu je poskládaná tak, aby se dobře četla: komentáře na správných místech,
vysvětlení nad každým blokem, příjemný tok. Diff je poskládaný tak, aby bylo vidět,
co se změnilo. To jsou dvě různé věci a jen jedna z nich ti ukáže, že se při té
příležitosti změnil i sousední soubor.

Postup, který se vyplatí dodržet v tomhle pořadí:

1. **Podívej se na seznam změněných souborů.** Souhlasí s tím, co jsi zadal? Jeden
  neočekávaný soubor v seznamu je důvod k zastavení.
2. **Spusť testy, které už máš.** Než začneš číst. Zelená ti řekne, co se nerozbilo,
  červená ti ušetří čtení.
3. **Přečti diff řádek po řádku.** Ne soubory — diff. Zajímají tě jen změněné řádky
  a jejich okolí.
4. **Spusť to na okrajových datech.** Prázdný vstup, chybějící hodnota, dvojí zavolání.
5. **Teprve teď** si přečti vysvětlení z chatu a porovnej ho s tím, co jsi viděl.

> [!TIP]
> Když si necháš od modelu i shrnutí změny, ber ho jako návrh popisu pull requestu,
> který musíš ověřit. Shrnutí popisuje, co měl kód dělat, ne co dělá.

:::check
Proč se testy spouští dřív, než se začne číst diff?

### --answer--
Protože bez zelených testů nemá smysl kód vůbec číst.

#### --why--
Červený test je naopak nejužitečnější věc, jakou můžeš mít — jen chceš vědět o něm dřív.

### --correct--
Protože červený test ti ukáže místo, kam se dívat, a ušetří ti čtení zbytku.

#### --why--
Čtení je nejdražší část review. Nasměrovat ho je levnější než ho dělat naslepo.

### --see--
prace-s-ai/review-kodu-z-ai#1-cti-diff-ne-odpoved-v-chatu
:::

## 2. Checklist pro review

Sedm bodů, v tomhle pořadí. První tři odhalí většinu a jdou rychle.

| # | Co hledáš | Konkrétní otázka |
|---|---|---|
| 1 | **Existuje to?** | Je každá volaná metoda, volba a balíček skutečná? |
| 2 | **Okrajové případy** | Prázdné pole, `null`, nula, záporné číslo, dvojí volání? |
| 3 | **Chybové stavy** | Co když selže síť, soubor nebo databáze? Kdo tu chybu uvidí? |
| 4 | **Bezpečnost** | Vstup uživatele v HTML, v dotazu, v cestě k souboru? Tajemství v kódu? |
| 5 | **Konzistence s projektem** | Odpovídá to našemu stylu, vrstvám a pojmenování? |
| 6 | **Složitost navíc** | Nejde totéž třemi řádky standardní knihovny? |
| 7 | **Testy** | Testují chování ze zadání, nebo opisují implementaci? |

Bod 5 je ten, na který se nejčastěji zapomíná a nejdéle bolí. Vygenerovaný kód umí
být sám o sobě v pořádku a přitom do projektu přinést třetí způsob, jak se u vás
načítají data. Každý další způsob zdraží všechny budoucí změny.

:::check
Který bod checklistu odhalí nejvíc problémů za nejméně času?

### --answer--
Kontrola konzistence se stylem projektu.

#### --why--
Důležitý bod, ale vyžaduje znalost celého projektu a dlouhé čtení.

### --correct--
Okrajové případy — prázdné pole, `null`, nula.

#### --why--
Jsou to tři pokusy, které trvají minutu, a šťastná cesta na nich padá skoro vždycky.

### --see--
prace-s-ai/review-kodu-z-ai#2-checklist-pro-review
:::

## 3. Tři otázky, které najdou nejvíc

Když nemáš čas na celý checklist, polož si tyhle tři. Vyplatí se u každé
vygenerované funkce bez výjimky.

**„Co se stane, když nic nepřijde?"** Prázdné pole, prázdný řetězec, `undefined`
místo objektu. Tady padá `reduce` bez počáteční hodnoty, dělení délkou a přístup
k `data[0]`.

:::live js predict
```js
function prumerneHodnoceni(recenze) {
  const soucet = recenze.reduce((sum, r) => sum + r.hvezdy, 0);
  return (soucet / recenze.length).toFixed(1);
}

console.log('se dvěma recenzemi: ' + prumerneHodnoceni([{ hvezdy: 5 }, { hvezdy: 4 }]));
console.log('bez recenzí: ' + prumerneHodnoceni([]));
```
--question-- Funkci napsal model a na ukázkových datech ji někdo ověřil. Co se vypíše?
--expected--
```text
se dvěma recenzemi: 4.5
bez recenzí: NaN
```
--why-- `0 / 0` je `NaN` a `NaN.toFixed(1)` vrátí řetězec `"NaN"`. Nový produkt bez recenzí bude mít na kartě napsáno „NaN hvězdiček“ — a nikdo si toho nevšimne, dokud nezavolá zákazník.
:::

**„Co se stane, když to selže?"** Server vrátí 500, soubor nejde přečíst, JSON má jiný
tvar. Zajímá tě, jestli se chyba někde zobrazí, nebo tiše zmizí v prázdném `catch`.

**„Co se stane, když to zavolám dvakrát?"** Dvojklik na tlačítko, dvě odpovědi ze sítě
v jiném pořadí, opakované připojení. Tady se skrývají dvojité objednávky.

Každá z těch tří otázek má jediný cíl: najít [[protipříklad]] — konkrétní vstup, na
kterém se kód prokazatelně chová jinak, než má. Dokud ho nemáš, máš jen podezření.
Jakmile ho máš, máš i hotový testovací případ pro krok, který přijde po opravě.

:::check
Proč se otázka „co když to zavolám dvakrát?" vyplatí i u kódu, který vypadá jednoduše?

### --answer--
Protože druhé volání bývá pomalejší a kód nemusí stihnout doběhnout.

#### --why--
Rychlost tu nehraje roli — jde o to, co po sobě dvě volání zanechají.

### --correct--
Protože dvojí volání odhalí sdílený stav a chybějící ochranu proti dvojímu odeslání.

#### --why--
Dvojklik na „Objednat“ je nejlevnější způsob, jak takovou chybu najít, a v provozu nastane první den.

### --see--
prace-s-ai/review-kodu-z-ai#3-tri-otazky-ktere-najdou-nejvic
:::

## 4. Testy, které nemůžou selhat

Vygenerované testy mají tři opakující se vady:

- **Tautologie.** Test spočítá očekávanou hodnotu stejným výrazem jako implementace.
  Když je vzorec špatně, je špatně na obou stranách a test svítí zeleně.
- **Kontrola typu místo hodnoty.** `assert.equal(typeof vysledek, 'number')` projde
  i pro `NaN`, `-1` a `0`.
- **Chybějící chybová větev.** Testuje se, že se to povedlo. Netestuje se, co se stane,
  když se to nepovede.

Jediná spolehlivá zkouška kvality testu je [[mutační zkouška]]: rozbij implementaci a
podívej se, jestli test zčervená. Změň `>=` na `>`, otoč znaménko, vrať konstantu. Test, který
zůstane zelený, nehlídá nic.

:::explain
Vysvětli vlastními slovy, proč je zelený test napsaný stejným modelem, který napsal
i testovanou funkci, nebezpečnější než žádný test.

## --model--
Žádný test je poctivý stav: vím, že kontrola chybí, a podle toho se chovám — přečtu si
kód a vyzkouším ho ručně. Zelený test od stejného autora mi tuhle opatrnost sebere,
protože zelená v CI vypadá jako důkaz. Přitom test vznikl ze stejné mylné představy jako
kód: když si autor spletl hranici nebo zapomněl na prázdný vstup, chybí ten případ
v testu úplně stejně. Falešná jistota navíc projde i kolem dalších lidí, protože v review
se na zelený test spoléhají.

## --checklist--
- Zelená v CI vypadá jako důkaz a vypne mou opatrnost.
- Test ze stejné mylné představy neobsahuje ten chybějící případ.
- Chybějící test je poctivý stav, falešně zelený test je past i pro ostatní.
:::

:::check
Vygenerovaný test tvrdí `assert.equal(typeof cenaSDph(249), 'number')`. Pro které z těchto návratových hodnot projde?

### --answer--
Jen pro správně spočítanou cenu s DPH.

#### --why--
Test se ptá na typ, ne na hodnotu — o správnosti výpočtu neříká nic.

### --correct--
Pro `NaN`, pro `0` i pro cenu bez DPH — pro všechno, co je číslo.

#### --why--
`typeof NaN` je `'number'`, takže i ta nejhorší varianta výpočtu projde zeleně.

### --see--
prace-s-ai/review-kodu-z-ai#4-testy-ktere-nemuzou-selhat
:::

## 5. Bezpečnost

Tohle je jediná část review, u které se nedá spěchat. Model napíše bezpečnostní díru
úplně stejně sebejistě jako správný kód, protože obojí je v trénovacích datech.

**Vstup uživatele v HTML.** Skládání HTML z textu, který přišel od uživatele, je
nejčastější díra ve frontendu. Na ukázkových datech se nic nestane. Na datech, která
napíše někdo jiný, se stane tohle:

:::compare
```css
body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; color: #1f2937; }
h3 { font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin: 0 0 .5rem; }
.poznamka { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: .5rem; padding: .7rem .9rem; font-size: .9rem; min-height: 3rem; }
.varovani { display: block; margin-top: .5rem; background: #b91c1c; color: #fff; padding: .4rem .6rem; border-radius: .3rem; font-weight: 700; }
```
```js
const poznamkaZakaznika =
  'Zabalte prosím jako dárek. <span class="varovani">Váš účet byl zablokován — přihlaste se na overeni-uctu.example</span>';
```
--variant-- Kód od modelu: innerHTML
```html
<h3>Poznámka k objednávce</h3>
<div class="poznamka" id="a"></div>
```
```js
document.querySelector('#a').innerHTML = poznamkaZakaznika;
```
--variant-- Bezpečně: textContent
```html
<h3>Poznámka k objednávce</h3>
<div class="poznamka" id="b"></div>
```
```js
document.querySelector('#b').textContent = poznamkaZakaznika;
```
:::

Vlevo zákazník propašoval na tvou stránku vlastní prvek. Tady je to jen falešné
varování s odkazem; se `<script>` nebo `onerror` je to krádež session. Vpravo je
totéž vidět jako text, protože `textContent` nic neinterpretuje.

**Další čtyři místa, kde model spolehlivě chybuje:**

- **Dotaz do databáze skládaný z textu.** Hodnota od uživatele patří do parametru, ne
  do řetězce dotazu.
- **Tajemství natvrdo v kódu.** Model rád doplní ukázkový klíč a ten tam zůstane.
- **Chybějící kontrola oprávnění.** Endpoint vrátí záznam podle `id` z adresy, aniž by
  se ptal, jestli patří přihlášenému uživateli.
- **Chybová hláška se vším.** `catch` pošle klientovi obsah výjimky včetně cesty
  k souborům a části SQL dotazu.

> [!PITFALL]
> Zvlášť zrádné je, že bezpečná i nebezpečná varianta se chovají na tvých datech
> **úplně stejně**. Rozdíl uvidíš až na datech, která napsal někdo jiný. Proto se
> bezpečnost kontroluje čtením, ne zkoušením.

:::check
Proč se bezpečnostní chyba ve vygenerovaném kódu nepozná spuštěním?

### --answer--
Protože se projeví až při velkém provozu.

#### --why--
S množstvím provozu to nesouvisí — stačí jediný cílený vstup.

### --correct--
Protože na běžných datech se bezpečný i nebezpečný kód chovají naprosto stejně.

#### --why--
Rozdíl vyrobí až vstup, který někdo napsal schválně. Proto se tahle část checklistu dělá čtením.

### --see--
prace-s-ai/review-kodu-z-ai#5-bezpecnost
:::

## 6. Závislosti a licence

Každý `npm install` ve vygenerovaném návodu je rozhodnutí, které budeš udržovat.
Než ho přijmeš:

- **Existuje balíček doopravdy?** Kolik má verzí, kdy vyšla poslední, má repozitář
  s kódem a issues?
- **Potřebuješ ho?** Model přidá knihovnu i na věc, kterou platforma umí sama —
  formátování data, práci s adresou, hluboké kopírování.
- **Jakou má licenci?** Kopírovaná licence typu GPL do uzavřeného produktu nepatří
  a z diffu to nepoznáš.

Model umí vygenerovat i delší blok kódu velmi podobný nějakému konkrétnímu zdroji
z internetu. U krátkých funkcí je to neškodné, u delších specifických algoritmů to
je důvod navíc, proč si od modelu nenechávat psát velké bloky logiky najednou.

:::check
Model ti k formátování ceny navrhl instalaci knihovny. Co zkontroluješ dřív, než ji nainstaluješ?

### --answer--
Jestli má dost hvězdiček na GitHubu.

#### --why--
Počet hvězdiček je slabý signál, který se dá koupit i nasbírat před lety a od té doby nic.

### --correct--
Jestli ji vůbec potřebuješ, když `Intl.NumberFormat` umí totéž bez závislosti.

#### --why--
Nejlevnější závislost je ta, kterou nepřidáš. Teprve když ji potřebuješ, řešíš, jestli je důvěryhodná.

### --see--
prace-s-ai/review-kodu-z-ai#6-zavislosti-a-licence
:::

## 7. Typické chyby a pasti

> [!PITFALL]
> **Review podle délky.** Krátký diff vypadá neškodně, a přitom se do tří řádků vejde
> obrácená podmínka i chybějící kontrola oprávnění. Délka nic neříká.

> [!PITFALL]
> **Spolehnutí na komentáře v kódu.** Model píše komentáře podle toho, co kód měl dělat.
> Když se kód a komentář rozcházejí, lže komentář.

> [!PITFALL]
> **Únava po pátém souboru.** Review vygenerovaného kódu je vyčerpávající, protože
> nemáš žádnou oporu v záměru autora. Rozděl si ho, nebo ho zadej po menších částech.

> [!PITFALL]
> **„Opravím to později."** Vygenerovaný kód, který projde s výhradou, se neopravuje
> nikdy — nemá autora, který by na tu výhradu myslel.

:::check
Proč se vygenerovaný kód, který projde review „s výhradou, opravím to později", obvykle neopraví nikdy?

### --answer--
Protože výhrady se v pull requestech neevidují.

#### --why--
Evidovat se dají — jenže i tak je nemá kdo vzít za své.

### --correct--
Protože ten kód nemá autora, kterému by výhrada zůstala v hlavě a kdo by se k ní vrátil.

#### --why--
U vygenerovaného kódu je jediný okamžik, kdy ho někdo doopravdy drží v hlavě, právě to review.

### --see--
prace-s-ai/review-kodu-z-ai#7-typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [OWASP Cheat Sheet: Cross Site Scripting Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) — kam se escapuje a jak.
- [MDN: Node.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) — rozdíl proti `innerHTML` přímo u zdroje.
- [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) — formátování ceny bez závislosti.

# --questions--

## --question--

Vyjmenuj tři otázky, které položíš každé vygenerované funkci, i když na celý checklist
není čas.

### --expected--
co když nic nepřijde, co když to selže, co když to zavolám dvakrát

### --accept--
prázdný vstup, chyba, dvojí volání
co při prázdném vstupu, co při selhání, co při opakovaném volání

### --why--
Prázdný vstup, selhání a opakované volání jsou tři stavy, se kterými zadání skoro nikdy
nepočítá — a v provozu nastanou všechny tři během prvního týdne.

### --see--
prace-s-ai/review-kodu-z-ai#3-tri-otazky-ktere-najdou-nejvic

## --question--

Jak spolehlivě ověříš, že vygenerovaný test doopravdy něco hlídá?

### --expected--
Rozbiju implementaci a podívám se, jestli test zčervená.

### --accept--
mutací implementace
změním kód a test musí selhat
otočím podmínku a test musí zčervenat

### --why--
Test, který nezčervená po změně chování, měří jen to, že se kód spustil. Stačí otočit
porovnání nebo vrátit konstantu.

### --see--
prace-s-ai/review-kodu-z-ai#4-testy-ktere-nemuzou-selhat

## --question--

Model ti vygeneroval řádek `el.innerHTML = 'Poznámka: ' + poznamka;`, kde `poznamka`
přišla z formuláře. Na tvých datech to funguje správně. Proč to přesto přepíšeš?

### --answer--
Protože `innerHTML` je pomalejší než `textContent`.

#### --why--
Výkon tady není důvod — jde o to, co se s obsahem stane.

### --correct--
Protože obsah od uživatele se tím vloží do stránky jako HTML, takže si tam kdokoli může propašovat vlastní prvky.

#### --why--
Správně je `textContent`, které obsah vloží jako text a nic z něj neinterpretuje.

### --see--
prace-s-ai/review-kodu-z-ai#5-bezpecnost

## --question--

Proč se v review vygenerovaného kódu nedá spoléhat na komentáře, které jsou v něm napsané?

### --answer--
Protože komentáře bývají v angličtině a snadno se přehlédnou.

#### --why--
Jazyk komentáře s jeho pravdivostí nesouvisí.

### --correct--
Protože komentář popisuje záměr, ne skutečnost — když se s kódem rozchází, pravdu má kód.

#### --why--
Rozpor mezi komentářem a kódem je dobrý signál, kam se podívat, ale nikdy ne důkaz.

### --see--
prace-s-ai/review-kodu-z-ai#7-typicke-chyby-a-pasti

## --question--

**Opakování z dřívějška.** V revidovaném kódu najdeš `fetch(url)` a hned za ním
`const data = await response.json();`. Co v tom kódu chybí?

### --expected--
kontrola response.ok

### --accept--
kontrola, jestli je odpověď v pořádku
ověření stavového kódu
response.ok

### --why--
`fetch` se neodmítne u stavu 404 ani 500 — dostaneš odpověď s chybovým tělem a
`json()` na ní buď spadne, nebo vrátí něco úplně jiného, než čekáš.

### --see--
js-async/fetch#404-a-500-nejsou-pro-fetch-chyba

## --question--

**Opakování z dřívějška.** Před opravou chyby ve vygenerovaném kódu si chceš zajistit,
že se nerozbije stávající chování, které nikdo nepopsal. Jak se jmenuje test, který
zapíše chování tak, jak je právě teď?

### --expected-- ignore-case
charakterizační test

### --accept--
charakterizační
characterization test

### --why--
Charakterizační test nehodnotí, jestli je chování správné — jen ho zafixuje, abys poznal,
že jsi ho změnil.

### --see--
nastroje-cizi-kod/orientace-v-cizim-kodu#6-bezpecna-zmena-charakterizacni-test
