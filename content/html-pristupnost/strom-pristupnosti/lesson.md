# Strom přístupnosti

Když čtečka řekne „Do košíku, tlačítko", nečte obrazovku ani tvoje CSS. Čte data, která jí prohlížeč z HTML připravil. Tahle lekce ukáže, jaká data to jsou — a proč se v nich tlačítko z `div` nebo ikona bez textu ztratí. Na stejná data se ptají testovací knihovny, když hledají „tlačítko se jménem Odeslat".

:::check pretest
Tlačítko obsahuje jen ikonu košíku: `<button><img src="kosik.svg"></button>`. Co o něm nejspíš řekne čtečka?

### --answer--
„Košík, tlačítko", protože soubor se jmenuje `kosik.svg`.

#### --why--
Na název souboru se některé čtečky opravdu uchýlí, ale spoléhat se na to nedá a „kosik svg" není jméno. Za chvíli uvidíš, odkud se jméno bere.

### --correct--
Jen „tlačítko", případně s názvem souboru — tlačítko nemá žádné jméno.

#### --why--
Jméno tlačítka se skládá z jeho textu a `alt` obrázků uvnitř. Tady není ani jedno, takže uživatel neví, co tlačítko udělá.

### --answer--
Čtečka popíše, co je na ikoně, podle obrázku.

#### --why--
Běžné čtečky obrázky nerozpoznávají. Pracují s textem, který jim dá HTML.
:::

## Problém: tři tlačítka, která vypadají stejně

V náhledu jsou tři prvky. Okem mezi nimi rozdíl skoro nepoznáš:

:::live
```html
<p class="row">
  <button type="button" class="btn">Do košíku</button>
  <span class="btn">Do košíku</span>
  <button type="button" class="btn btn--icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l3 12h11l2-8H7"/></svg>
  </button>
</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.row { display: flex; gap: 0.75rem; align-items: center; }

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: #7c2d12;
  color: white;
  font: inherit;
  cursor: pointer;
}

.btn--icon { padding: 0.6rem; }
```
:::

Pro čtečku jsou to ale tři úplně jiné věci:

| prvek | co z něj čtečka dostane |
|---|---|
| `<button>Do košíku</button>` | tlačítko se jménem „Do košíku" |
| `<span class="btn">Do košíku</span>` | obyčejný text „Do košíku", nic se tu nedá zmáčknout |
| `<button>` jen s ikonou | tlačítko **bez jména** |

Prohlížeč vedle DOM staví ještě jeden strom: **strom přístupnosti** (*accessibility tree*). Vynechá z něj, co nic nesděluje (obalové `div` bez obsahu, skryté prvky), a u každého uzlu drží pár údajů. Přes rozhraní operačního systému si ho pak čte čtečka, hlasové ovládání i nástroje na automatické testy.

> [!REMEMBER]
> **Čtečka nepracuje s tím, co vidíš, ale se stromem přístupnosti — a v něm má každý prvek roli, přístupné jméno a stav.** Když některý z těch tří údajů chybí nebo lže, uživatel čtečky prvek nepozná nebo nepoužije.

Otevři si DevTools nad náhledem, vyber `span` a v postranním panelu přepni na kartu **Accessibility**. Pak vyber první a třetí tlačítko a porovnej řádky Name a Role.

:::check
Proč ze `span` s třídou `btn` nevznikne tlačítko, i když vypadá úplně stejně?

### --answer--
Protože `span` je řádkový prvek a tlačítko musí být blokové.

#### --why--
Na `display` strom přístupnosti nehledí. Řádkový `<button>` je pořád tlačítko.

### --correct--
Protože roli určuje značka HTML, ne třída ani vzhled; `span` žádnou roli nemá.

#### --why--
Třída `btn` je jen háček pro CSS. Prohlížeč roli odvozuje z toho, jaký prvek jsi napsal.

### --answer--
Protože mu chybí `cursor: pointer`.

#### --why--
Kurzor myši je čistě vizuální. Čtečka ani klávesnice o něm nevědí.
:::

## Role: čím prvek je

**Role** (*role*) říká, jaký druh ovládacího prvku nebo obsahu uzel je. Většina prvků HTML ji má vestavěnou, říká se jí implicitní role:

| HTML | role | čtečka ohlásí zhruba |
|---|---|---|
| `<button>` | `button` | „tlačítko" |
| `<a href="…">` | `link` | „odkaz" |
| `<a>` **bez** `href` | `generic` | nic, jako obyčejný text |
| `<h1>`–`<h6>` | `heading` s úrovní | „nadpis, úroveň 2" |
| `<ul>`, `<ol>` / `<li>` | `list` / `listitem` | „seznam, 3 položky" |
| `<nav>` | `navigation` | „navigace" |
| `<main>` | `main` | „hlavní obsah" |
| `<input type="checkbox">` | `checkbox` | „zaškrtávací pole" |
| `<input type="text">` | `textbox` | „upravit text" |
| `<img alt="…">` | `img` | „obrázek" |
| `<div>`, `<span>` | `generic` | nic |

`div` a `span` jsou úmyslně „ničím". Jsou to krabice pro CSS a nikomu nic neslibují.

Než náhled otevřeš, tipni si:

:::live predict
```html
<p>Před objednávkou si přečti <a class="link" onclick="this.textContent = 'Otevřeno'">obchodní podmínky</a>.</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.link { color: #1d4ed8; text-decoration: underline; cursor: pointer; }
```
--question-- Co s „obchodními podmínkami" udělá uživatel klávesnice a čtečky?
--option-- Dostane se na ně Tabem a čtečka ohlásí „odkaz, obchodní podmínky".
--option*-- Tab je přeskočí a čtečka je přečte jen jako součást věty, protože `a` bez `href` odkazem není.
--option-- Dostane se na ně Tabem, ale čtečka neřekne „odkaz", protože chybí `href`.
--why-- Prvek `a` je odkaz jen s atributem `href`. Bez něj má roli `generic`: nepatří do pořadí Tabu, v seznamu odkazů chybí a Enter nic neudělá. Klikni do náhledu a zkus Tab, pak doplň `href="/podminky"` a zkus to znovu. Kdo potřebuje akci bez adresy, píše `<button>`.
--see-- html-pristupnost/strom-pristupnosti#role-cim-prvek-je
:::

:::check
Na stránce je `<div class="menu-item">Kontakt</div>`, na který JavaScript přidal posluchač kliknutí a přesměruje na kontakt. Jakou roli má tenhle prvek ve stromu přístupnosti? Napiš název role.

### --expected-- ignore-case
generic

### --why--
`div` má roli `generic` bez ohledu na to, jaký JavaScript na něm visí. Posluchač kliknutí se do stromu přístupnosti nepromítne. Pro přechod na jinou stránku patří `<a href>`.
:::

## Přístupné jméno a jak se počítá

**Přístupné jméno** (*accessible name*) je text, podle kterého uživatel prvek pozná a hlasové ovládání ho najde. Prohlížeč ho počítá podle pevného pořadí a použije **první zdroj, který něco dá**:

1. `aria-labelledby="id1 id2"` — text prvků s těmi `id`, spojený mezerou.
2. `aria-label="…"` — text přímo v atributu.
3. Nativní popisek podle druhu prvku: `<label>` u pole formuláře, `alt` u obrázku, `<legend>` u `fieldset`, `<caption>` u tabulky.
4. Obsah prvku — jen u rolí, které jméno z obsahu berou: tlačítko, odkaz, nadpis, položka seznamu, buňka tabulky. Do obsahu se počítá text i `alt` obrázků uvnitř.
5. Poslední záchrana: `title`, u pole i `placeholder`.

Dva důsledky, na které se často zapomíná:

- `div` nebo `span` jméno z obsahu nemají, protože role `generic` jméno nedostává vůbec. `aria-label` na obyčejném `div` čtečky většinou ignorují.
- Zdroj výš v seznamu **přebije** ten pod ním. `aria-label` přebije text tlačítka, i když na obrazovce je vidět něco jiného.

Vedle jména má prvek ještě **popis** (*description*) z `aria-describedby`: doplňující text, který čtečka řekne až po jménu a roli, třeba formát hesla pod polem. K němu se vrátíš v lekci o ARIA.

:::live predict
```html
<form class="order">
  <p>Objednávka č. 2026-0418, 3 položky, 1 247 Kč</p>
  <button type="button" aria-label="Zavřít">Zrušit objednávku</button>
</form>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.order { display: grid; gap: 0.5rem; max-width: 20rem; padding: 1rem; border: 1px solid #e7e5e4; border-radius: 0.75rem; }
button { font: inherit; padding: 0.5rem 1rem; }
```
--question-- Jaké přístupné jméno má tlačítko?
--option-- „Zrušit objednávku", protože text na tlačítku má přednost.
--option*-- „Zavřít", protože `aria-label` přebije obsah prvku.
--option-- „Zavřít Zrušit objednávku", protože se oba texty spojí.
--why-- `aria-label` je ve výpočtu jména výš než obsah, takže obsah se vůbec nepoužije. Uživatel čtečky uslyší „Zavřít, tlačítko" a myslí si, že zavře okno — a zruší objednávku. Uživatel hlasového ovládání řekne „klikni na Zrušit objednávku" a nestane se nic. Ověř si to v DevTools na kartě Accessibility, pak `aria-label` smaž.
--see-- html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita
:::

:::explain
Kolega se ptá, proč tlačítku s ikonou nestačí `title="Košík"` a proč nemá dávat `aria-label` na tlačítko, které už má viditelný text. Vysvětli mu, jak prohlížeč počítá přístupné jméno.

## --model--
Prohlížeč bere jméno z prvního zdroje, který něco dá: `aria-labelledby`, pak `aria-label`, pak nativní popisek jako `label` nebo `alt`, pak obsah prvku a až nakonec `title`. `title` je jen poslední záchrana, tooltip se na dotykovém displeji ani z klávesnice neukáže, takže ikona má dostat text přímo, třeba skrytý text nebo `aria-label`. Naopak `aria-label` na tlačítku s textem ten text přebije, a když se liší, čtečka i hlasové ovládání pracují s jiným jménem, než jaké uživatel vidí.

## --checklist--
- Jméno se bere z prvního zdroje v pevném pořadí.
- `aria-label` a `aria-labelledby` přebijí obsah prvku.
- `title` je až poslední záchrana a z klávesnice ani na dotyku se neukáže.
- Viditelný text a přístupné jméno se nemají rozcházet.
:::

:::live predict
```html
<header class="site">
  <a href="/"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='32'%3E%3Crect width='120' height='32' rx='6' fill='%237c2d12'/%3E%3C/svg%3E" alt=""></a>
  <a href="/kosik">Košík</a>
</header>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.site { display: flex; justify-content: space-between; align-items: center; }
```
--question-- Logo v odkazu na úvod má `alt=""`. Co s odkazem na úvodní stránku uslyší uživatel čtečky?
--option-- „Odkaz, logo", protože čtečka pozná obrázek v odkazu.
--option-- Nic, prázdný `alt` odkaz ze stromu přístupnosti vyřadí.
--option*-- Odkaz bez jména; čtečka nejspíš přečte jen adresu, třeba „odkaz, lomítko".
--why-- Jméno odkazu se skládá z obsahu, a jediný obsah je obrázek s prázdným `alt`. Odkaz tedy zůstane v Tabu i ve stromu, ale beze jména, a čtečka si pomůže adresou. `alt=""` patří obrázku, který nic nesděluje. Tady je logo jediným obsahem odkazu, takže jeho `alt` má říct, kam odkaz vede: `alt="Pražírna Zrnko, úvodní stránka"`.
--see-- html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita
:::

:::check
Pole má `<label for="phone">Telefon</label>`, `aria-label="Číslo"` a `placeholder="777 123 456"`. Jaké je jeho přístupné jméno? Napiš jen text jména.

### --expected-- ignore-case
Číslo

### --why--
`aria-label` je v pořadí výš než `label`, takže vyhraje, i když uživatel na obrazovce vidí „Telefon". Oprava je smazat `aria-label`: viditelný popisek je lepší zdroj jména.
:::

## Stav: co se s prvkem právě děje

Třetí údaj je **stav** (*state*): jestli je pole zaškrtnuté, rozbalovací panel otevřený, tlačítko vypnuté nebo pole povinné. Čtečka ho ohlásí spolu s rolí a jménem: „Doprava zdarma, zaškrtávací pole, zaškrtnuto".

Nativní prvky stav drží samy a aktualizují ho, když uživatel něco udělá:

| HTML | stav ve stromu |
|---|---|
| `<input type="checkbox" checked>` | zaškrtnuto |
| `<details open>` | rozbaleno (`summary` je „rozbaleno / sbaleno") |
| `<button disabled>` | nedostupné |
| `<input required>` | povinné |
| `<option selected>` | vybráno |

Když si ovládací prvek stavíš sám (tlačítko, které otevírá menu), prohlížeč neví, co tlačítko dělá, a stav musíš hlásit ty: `aria-expanded="true"` nebo `"false"`. A hlavně ho **měnit spolu s tím, co je vidět**. Stav, který se nezmění, je horší než žádný — čtečka pořád tvrdí „sbaleno", i když menu svítí.

:::check
Tlačítko „Filtry" otevře panel, ale jeho `aria-expanded` zůstane pořád `"false"`. Co uslyší uživatel čtečky po otevření panelu?

### --answer--
Nic, `aria-expanded` čtečky nečtou.

#### --why--
Čtou. Právě proto je ten atribut nebezpečný, když lže.

### --correct--
„Filtry, tlačítko, sbaleno", i když je panel otevřený.

#### --why--
Čtečka hlásí stav, který jí dá strom, a ten říká `false`. Uživatel si myslí, že kliknutí nic neudělalo, a klikne znovu — panel zavře.

### --answer--
„Filtry, tlačítko, rozbaleno", protože prohlížeč pozná, že se panel ukázal.

#### --why--
Prohlížeč nemá jak zjistit, že tlačítko s panelem souvisí. Stav musí nastavit kód.
:::

## Panel Accessibility v DevTools

Strom přístupnosti si můžeš prohlédnout sám:

- **Chrome a Edge:** v panelu Elements vyber prvek a vpravo přepni na kartu **Accessibility**. Uvidíš jeho předky ve stromu přístupnosti a oddíl **Computed Properties**: Name, Role, stavy jako `expanded` nebo `focusable`. U jména je rozepsané, ze kterého zdroje pochází, a přeškrtnuté zdroje, které prohrály. Nahoře jde zapnout **Enable full-page accessibility tree** — pak ikona panáčka v Elements přepne celý strom na strom přístupnosti.
- **Firefox:** panel **Accessibility** ukazuje celý strom najednou a umí zvýraznit problémy s kontrastem a klávesnicí.

> [!TIP]
> Když si nejsi jistý, co čtečka řekne, podívej se nejdřív do DevTools. Name a Role jsou přesně to, co čtečka ohlásí jako první. Čtečku pak spusť na ověření celku, ne na hledání každého jména.

:::check
V DevTools vybereš ikonové tlačítko košíku a na kartě Accessibility vidíš `Name: ""` a `Role: button`. Co to znamená pro uživatele čtečky?

### --answer--
Nic zlého, role je správně a jméno čtečka doplní sama.

#### --why--
Čtečka jméno nevymýšlí. Co je v DevTools prázdné, to uživatel neuslyší.

### --correct--
Pozná, že je tam tlačítko, ale neví, co udělá, protože nemá jméno.

#### --why--
Role je v pořádku, jméno chybí. Tlačítko potřebuje text: skrytý text uvnitř, `aria-label`, nebo `alt` ikony, když je to obrázek.

### --answer--
Tlačítko ve stromu přístupnosti vůbec není.

#### --why--
Kdyby ve stromu nebylo, DevTools by u něj roli `button` neukázaly. Je tam, jen beze jména.
:::

## První pravidlo ARIA

**ARIA** (*Accessible Rich Internet Applications*) je sada atributů `role` a `aria-*`, kterými přepíšeš nebo doplníš roli, jméno a stav ve stromu přístupnosti. Zní to jako univerzální oprava. Není.

ARIA **mění jen strom přístupnosti, nic jiného**. `role="button"` na `div` řekne čtečce „tlačítko", ale prvek se nedostane do pořadí Tabu, nezmáčkne se Enterem ani mezerníkem a neodešle formulář. Slíbí něco, co nesplní.

:::compare
```html
<p class="row">Chceš dostávat novinky z pražírny?</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.row { margin: 0 0 0.75rem; }
.btn { display: inline-block; padding: 0.6rem 1rem; border: 0; border-radius: 0.5rem; background: #7c2d12; color: white; font: inherit; cursor: pointer; }
```
--variant-- `div` s rolí tlačítka
```html
<div role="button" class="btn" onclick="this.textContent = 'Přihlášeno'">Odebírat</div>
```
--variant-- skutečné tlačítko
```html
<button type="button" class="btn" onclick="this.textContent = 'Přihlášeno'">Odebírat</button>
```
:::

Obě varianty vypadají stejně a čtečka obě ohlásí jako tlačítko. Klikni do náhledu a zkus Tab a Enter: dostaneš se jen na to pravé.

Proto platí **první pravidlo ARIA**: když existuje prvek nebo atribut HTML, který už má roli, jméno, stav a chování, které potřebuješ, použij ho místo ARIA. `button` místo `role="button"`, `nav` místo `role="navigation"`, `<input type="checkbox">` místo `role="checkbox"`. ARIA přijde na řadu, až když HTML odpovídající prvek nemá — třeba u stavu `aria-expanded` nebo u oznámení, které má čtečka přečíst sama.

> [!REMEMBER]
> **Špatná ARIA je horší než žádná.** ARIA jen slibuje; klávesnici, fokus a chování musíš dodat sám, a nativní prvek to všechno umí zadarmo.

:::check
Proč `role="button"` z `div` nevyrobí plnohodnotné tlačítko?

### --answer--
Protože atribut `role` smí mít jen prvek `button`.

#### --why--
`role` jde dát skoro na každý prvek. Problém není, že by atribut nefungoval, ale co všechno nedělá.

### --correct--
Protože změní jen to, co hlásí strom přístupnosti; fokus z klávesnice a ovládání Enterem a mezerníkem nepřidá.

#### --why--
ARIA popisuje, nemění chování. Tabindex, obsluhu kláves i odeslání formuláře bys musel dopsat, a `<button>` to má hotové.

### --answer--
Protože čtečky atribut `role` nepodporují.

#### --why--
Podporují ho a ohlásí „tlačítko". Právě proto uživatel čeká, že půjde zmáčknout.
:::

## Typické chyby a pasti

> [!PITFALL] `aria-label`, který se liší od viditelného textu
> *Příznak:* tlačítko ukazuje „Zrušit objednávku", ale má `aria-label="Zavřít"`. Hlasový příkaz „klikni na Zrušit objednávku" nic neudělá a čtečka hlásí „Zavřít, tlačítko".
>
> *Oprava:* když má prvek viditelný text, `aria-label` smaž. Když ho potřebuješ (upřesnění u ikony), musí viditelný text obsahovat na začátku.

> [!PITFALL] `aria-label` na `div` nebo `span`
> *Příznak:* `<div aria-label="Hodnocení 4 z 5">★★★★☆</div>` — čtečka přečte „černá hvězda, černá hvězda…" nebo nic a jméno ignoruje.
>
> *Oprava:* role `generic` jméno nedostává. Napiš text do obsahu, třeba skrytý pro oči (ukáže ho lekce o ARIA), nebo použij prvek s rolí.

> [!PITFALL] `title` jako jediné jméno
> *Příznak:* ikonové tlačítko má jen `title="Hledat"`. Myší se ukáže bublina, na telefonu a z klávesnice nic a některé čtečky `title` nečtou.
>
> *Oprava:* dej tlačítku skutečné jméno: text, `alt` ikony, nebo `aria-label`.

> [!PITFALL] `alt` popisuje obrázek, ne účel
> *Příznak:* odkaz na úvod ohlásí „odkaz, logo firmy, hnědý kruh s kávovým zrnem".
>
> *Oprava:* obrázek, který je jediným obsahem odkazu, dává odkazu jméno. Napiš, kam odkaz vede: „Pražírna Zrnko, úvodní stránka".

:::check
Pole pro e-mail nemá `label`, jen `placeholder="jana@example.cz"`. Chrome mu přesto v DevTools ukáže jméno. Proč to i tak je chyba?

### --answer--
Není to chyba, když DevTools jméno ukazují, čtečka ho přečte.

#### --why--
Placeholder je až poslední záchrana a ne každá čtečka ho použije. Hlavně ale zmizí, jakmile uživatel začne psát.

### --correct--
Placeholder je až poslední záchrana výpočtu, po začátku psaní zmizí z obrazovky a tady ani neříká, co do pole patří.

#### --why--
Jménem pole by byla adresa „jana@example.cz" místo „E-mail". Viditelný `<label>` je spolehlivé jméno pro čtečku i pro oči.

### --answer--
Protože placeholder musí mít kontrast aspoň 7 : 1.

#### --why--
Světlý placeholder bývá málo kontrastní, to je pravda, ale hlavní problém je, že nenahrazuje popisek.
:::

## Kde to najdeš v MDN

- [Accessibility tree](https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree) — co strom přístupnosti je a co v něm prohlížeč drží.
- [Accessible name](https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name) — odkud se bere jméno a proč ho mít u každého ovládacího prvku.
- [WAI-ARIA basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/WAI-ARIA_basics) — co ARIA umí a kdy ji nepoužít.
- [ARIA: button role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/button_role) — kolik práce navíc dá `role="button"` oproti `<button>`.

# --questions--

## --question--

Jaké přístupné jméno má tenhle odkaz? Napiš jen text jména.

```html
<a href="/kavy/kolumbie"><img src="kolumbie.jpg" alt="Kolumbie Huila"> 390 Kč</a>
```

### --expected-- ignore-case

Kolumbie Huila 390 Kč

### --why--

Odkaz bere jméno z obsahu a do obsahu se počítá i `alt` obrázku uvnitř. Text a `alt` se spojí v pořadí, v jakém jsou v HTML.

### --see--

html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita

## --question--

Tlačítko pro zavření okna obsahuje jen znak `×`. Kolega mu přidal `aria-label="Zavřít okno"`. Je to v pořádku?

### --answer--

Ne, `aria-label` se smí použít jen na prvky bez obsahu.

#### --why--

Myslíš si, že `aria-label` s obsahem nejde dohromady? Jde, jen přebije obsah. A tady je to přesně to, co chceš.

### --correct--

Ano, `aria-label` přebije obsah `×` a znak, který nic neříká, nahradí srozumitelným jménem.

#### --why--

Viditelný „text" tu je jen symbol, takže se jméno s obrazovkou nerozchází. Bez `aria-label` by čtečka řekla „krát, tlačítko" nebo nic.

### --answer--

Ne, správně je `title="Zavřít okno"`, protože se ukáže i myší.

#### --why--

Myslíš si, že `title` je rovnocenný zdroj jména? Je až poslední záchrana, z klávesnice ani na dotyku se neukáže.

### --see--

html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita

## --question--

Kterou roli má ve stromu přístupnosti prvek `<ul>`? Napiš název role, jak ho ukáže DevTools.

### --expected-- ignore-case

list

### --why--

Seznam má roli `list` a jeho položky `listitem`. Čtečka díky tomu ohlásí, kolik položek seznam má, třeba u navigace „seznam, 4 položky".
### --see--

html-pristupnost/strom-pristupnosti#role-cim-prvek-je
