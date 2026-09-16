# ARIA: kdy a jak

Zpráva „Přidáno do košíku", zvýrazněná položka menu na stránce, kde právě jsi, nápověda pod polem pro heslo, dekorativní ikona vedle textu. To jsou místa, kde samotné HTML nestačí a přichází na řadu [[ARIA]]. Tahle lekce ukáže těch pár atributů, které v praxi použiješ každý týden, a hlavně kdy je nepoužít.

:::check pretest
Tlačítko „Oblíbené" obsahuje ikonu srdce jako `<svg>` a text. Čtečka u něj říká „obrázek, Oblíbené, tlačítko". Jak zařídit, aby ikonu přeskočila, ale na obrazovce zůstala?

### --answer--
Dát ikoně atribut `hidden`.

#### --why--
`hidden` schová prvek pro všechny, tedy i pro oči. Ikona by z tlačítka zmizela.

### --correct--
Dát ikoně `aria-hidden="true"`.

#### --why--
`aria-hidden="true"` vyřadí prvek jen ze stromu přístupnosti. Na obrazovce zůstane, čtečka ho přeskočí.

### --answer--
Dát ikoně `display: none` jen pro čtečky.

#### --why--
CSS nemá pravidlo „jen pro čtečky". `display: none` schová prvek všem.
:::

:::check pretest
Pod polem pro heslo se po odeslání formuláře objeví červený text „Heslo musí mít aspoň 12 znaků". Uživatel čtečky stojí na tlačítku Odeslat. Dozví se o chybě?

### --answer--
Ano, čtečka čte každou změnu na stránce.

#### --why--
Kdyby čtečka hlásila každou změnu, na dynamické stránce by nemluvila o ničem jiném. Hlásí jen změny v místech, která jsou k tomu označená.

### --correct--
Ne, dokud text není v oblasti, kterou čtečka hlídá, nebo dokud na pole sám nepřejde.

#### --why--
Čtečka čte tam, kde je uživatel. O textu, který se objeví jinde, se dozví jen z oblasti označené pro ohlášení. Tu ukáže část o oznámeních.
:::

## Problém: ARIA jako náplast

Kolega dostal za úkol „udělat menu přístupné" a vrátil tohle:

```html
<div role="navigation" aria-label="navigace">
  <div role="menu">
    <div role="menuitem" tabindex="0" aria-label="Kávy" onclick="location.href='/kavy'">Kávy</div>
    <div role="menuitem" tabindex="0" aria-label="Kurzy" onclick="location.href='/kurzy'">Kurzy</div>
  </div>
</div>
```

Atributů je tu hodně a stránka je přístupná méně než s obyčejným `<nav>` a odkazy. `role="menu"` slibuje menu aplikace, ve kterém se pohybuje šipkami, a ty tu nefungují. Enter na položce neudělá nic, protože `onclick` reaguje jen na kliknutí. `aria-label` jen opakuje text. A „navigace, navigace" čtečka řekne dvakrát, protože role už ohlašuje, že jde o navigaci. Organizace WebAIM každý rok zjišťuje, že stránky s ARIA mají v průměru **víc** chyb než stránky bez ní.

Z lekce o stromu přístupnosti víš, že ARIA mění jen roli, jméno a stav. Z toho plyne jednoduché rozhodování: nejdřív HTML, a ARIA jen tam, kde HTML nemá, co potřebuješ říct.

> [!REMEMBER]
> **ARIA nic nedělá, jen popisuje.** Použij ji, když HTML nemá prvek nebo atribut pro to, co chceš čtečce říct, a chování, které popisuješ, dodej sám.

Takových míst je v běžném webu jen pár a zbytek lekce projde právě je: skrývání, popis pole, aktuální stránka, oznámení a složitější komponenty.

:::check
Proč je `<div role="menuitem" tabindex="0" onclick="…">Kávy</div>` v navigaci webu horší než `<a href="/kavy">Kávy</a>`?

### --answer--
Protože `tabindex="0"` na `div` nefunguje.

#### --why--
Funguje, `div` s `tabindex="0"` fokus dostane. Problém je v tom, co pak neumí a co slibuje.

### --correct--
Protože slibuje menu aplikace ovládané šipkami a nereaguje na Enter, zatímco odkaz všechno potřebné umí sám.

#### --why--
Role `menuitem` říká čtečce „teď jsi v menu, pohybuj se šipkami". Obsluhu šipek ani Enteru ale nikdo nenapsal. Odkaz má roli, jméno, fokus i Enter hotové.

### --answer--
Protože čtečky roli `menuitem` nepodporují.

#### --why--
Podporují a přepnou kvůli ní způsob ovládání. Právě proto role, která nesedí, uživatele zmate.
:::

## Skrýt pro oči, pro čtečku, nebo pro oba

Skrývání je nejčastější místo, kde se ARIA plete s CSS. Existují čtyři různé druhy a každý skrývá před někým jiným:

| zápis | vidí oči | slyší čtečka | dostane fokus |
|---|---|---|---|
| `hidden` nebo `display: none` | ne | ne | ne |
| `.visually-hidden` (třída v CSS) | ne | ano | ano, když je to ovládací prvek |
| `aria-hidden="true"` | ano | ne | **ano** |
| `inert` | ano | ne | ne, ani myš na něj neklikne |

- **`hidden`** je na obsah, který teď neplatí pro nikoho: zavřený panel filtrů, druhý krok formuláře.
- **[[Vizuálně skrytý text]]** (*visually hidden*) je text jen pro čtečku: „o kávě Kolumbie Huila" za odkazem „Více", popisek pole, které má na obrazovce jen lupu.
- **`aria-hidden="true"`** je na věci, které oči potřebují a čtečce by jen překážely: ikona vedle textu, ozdobný oddělovač, velké číslo, které hned vedle zopakuje text.
- **`inert`** vypne celou část stránky: obsah pod otevřeným dialogem, formulář, který se právě odesílá.

Třídu `.visually-hidden`, kterou jsi použil ve workshopu, HTML ani CSS nenabízí hotovou. Je to osvědčený recept z několika deklarací:

:::live
```html
<button type="button" class="icon-button">
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>
  <span class="visually-hidden">Přidat Kolumbii Huila do oblíbených</span>
</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }

.icon-button {
  display: inline-grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 2px solid #7c2d12;
  border-radius: 50%;
  background: white;
  color: #7c2d12;
  cursor: pointer;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```
:::

`position: absolute` vytáhne text z toku, takže neodsune ikonu. Rozměr 1 px a `clip-path` ho schovají, `white-space: nowrap` brání tomu, aby se slova v jednom pixelu skládala pod sebe a čtečka je nečetla slepená. Proč ne `display: none`? Ten by text vyřadil i ze stromu přístupnosti a tlačítko by zůstalo beze jména. Zkus v CSS smazat pravidlo `.visually-hidden` a sleduj, co se stane s tlačítkem; pak se na kartě Accessibility v DevTools podívej na jeho Name.

:::check
Tabulka s rozpisem ceny má nad sebou graf ze stejných čísel. Graf je obrázek z SVG a všechno, co ukazuje, je i v tabulce. Čím graf schováš před čtečkou, aby ho oči dál viděly? Napiš celý atribut.

### --expected--
aria-hidden="true"

### --accept--
aria-hidden='true'

### --why--
Graf oči potřebují, čtečce by jen zopakoval tabulku. `aria-hidden="true"` ho ze stromu přístupnosti vyřadí a na obrazovce nechá. `hidden` by ho schoval všem.
:::

## Past: `aria-hidden` na prvku, který dostane fokus

`aria-hidden` vyřadí prvek ze stromu přístupnosti, ale **ne** z pořadí Tabu. Než otevřeš náhled, tipni si:

:::live predict
```html
<p class="promo">
  Kurz latté art v sobotu 14. listopadu za 890 Kč.
  <a href="#prihlaska" aria-hidden="true">Přihlásit se</a>
</p>
<button type="button">Do košíku</button>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.promo { padding: 1rem; border-radius: 0.75rem; background: #fef3c7; }
.promo a { color: #7c2d12; font-weight: 600; }
button { font: inherit; padding: 0.5rem 1rem; }
```
--question-- Uživatel čtečky prochází stránku Tabem. Co se stane u odkazu „Přihlásit se"?
--option-- Tab ho přeskočí, protože `aria-hidden` skryje prvek i pro klávesnici.
--option*-- Tab na něj dojde, ale čtečka nemá co ohlásit, protože prvek ve stromu přístupnosti není.
--option-- Nic zvláštního, na odkazy čtečky `aria-hidden` neuplatňují.
--why-- `aria-hidden` mění jen strom přístupnosti. Fokus jde na odkaz dál, takže uživatel čtečky přistane „na ničem": uslyší ticho, nebo podle čtečky jen útržek bez jména, a Enter přitom odkaz otevře. Klikni do náhledu a zkus Tab, obrys se na odkazu objeví. Oprava je `aria-hidden` smazat. Když potřebuješ vypnout celou část stránky i s ovládacími prvky, patří tam `inert`.
--see-- html-pristupnost/aria-vzory#past-aria-hidden-na-prvku-ktery-dostane-fokus
:::

> [!PITFALL] `aria-hidden` na ovládacím prvku nebo jeho obalu
> *Příznak:* Tab přistane na prvku, o kterém čtečka nic neřekne. Typicky po otevření dialogu, když někdo schová zbytek stránky přes `aria-hidden` na obalu: čtečka stránku nevidí, ale Tab pořád chodí po jejích odkazech.
>
> *Oprava:* `aria-hidden="true"` nikdy na prvek, který jde zaměřit, ani na obal, ve kterém takový prvek je. Hlídá to i automatický audit. Na vypnutí celé části stránky patří `inert`: bez fokusu, bez kliknutí a bez čtečky.

:::check
Po otevření košíku v postranním panelu chce kolega „schovat zbytek stránky" pro klávesnici i čtečku. Který atribut dá na obal zbytku stránky? Napiš jen název atributu.

### --expected-- ignore-case
inert

### --why--
`inert` z obsahu udělá kulisu: nejde na něj Tabem, nejde na něj kliknout a čtečka ho nevidí. `aria-hidden` by zakázal jen čtečku a Tab by dál chodil po skrytých odkazech.
:::

## `aria-describedby`: popis vedle jména

Pole pro heslo má jméno „Heslo". Pod ním je text „Aspoň 12 znaků, jedno číslo." Ten ke jménu nepatří, je to doplňující informace. Z lekce o stromu přístupnosti víš, že prvek má vedle jména i **popis**, a právě ten dodává `aria-describedby`:

:::live
```html
<form class="signup">
  <label for="password">Heslo</label>
  <input id="password" type="password" autocomplete="new-password" aria-describedby="password-hint">
  <p id="password-hint" class="hint">Aspoň 12 znaků, z toho jedno číslo.</p>
  <button type="submit">Založit účet</button>
</form>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.signup { display: grid; gap: 0.35rem; max-width: 18rem; }
label { font-weight: 600; }
input { font: inherit; padding: 0.45rem 0.6rem; border: 1px solid #78716c; border-radius: 0.4rem; }
.hint { margin: 0 0 0.5rem; color: #57534e; font-size: 0.875rem; }
button { justify-self: start; font: inherit; padding: 0.5rem 1rem; border: 0; border-radius: 0.4rem; background: #7c2d12; color: white; }
```
:::

Čtečka na poli ohlásí nejdřív jméno „Heslo" a druh pole a po krátké pauze popis „Aspoň 12 znaků, z toho jedno číslo". Vyber pole v DevTools a na kartě Accessibility najdeš řádek Description. Zkus smazat `aria-describedby` a popis z panelu zmizí, i když text na obrazovce zůstane.

Tři věci, které se hodí vědět:

- Hodnota je **`id`**, bez mřížky. Víc popisů oddělíš mezerou: `aria-describedby="password-hint password-error"`.
- Chybová hláška pole se připojí stejně. K ní patří ještě stav `aria-invalid="true"` na poli, se kterým čtečka ohlásí „neplatné". Pole bez chyby atribut nemá.
- Popis se čte, když uživatel na pole přijde. Hláška, která se objeví, zatímco je uživatel jinde, potřebuje oznámení.

:::check
Pole pro telefon má pod sebou nápovědu `<p id="phone-format">Ve tvaru 777 123 456</p>`. Jak bude vypadat atribut na poli, který nápovědu připojí jako popis? Napiš celý atribut.

### --expected--
aria-describedby="phone-format"

### --accept--
aria-describedby='phone-format'

### --why--
`aria-describedby` bere `id` bez `#`. Kdybys napsal `"#phone-format"`, prohlížeč prvek s takovým `id` nenajde a popis zůstane prázdný.
:::

## `aria-current`: kde právě jsem

V menu bývá zvýrazněná položka stránky, na které jsi. Oči to poznají z barvy nebo podtržení, čtečka ne. HTML pro to prvek nemá, ARIA atribut ano:

```html
<nav aria-label="Hlavní menu">
  <a href="/kavy" aria-current="page">Kávy</a>
  <a href="/kurzy">Kurzy</a>
</nav>
```

Čtečka řekne „odkaz, Kávy, aktuální stránka". Kromě `page` se používají hodnoty `step` (aktuální krok objednávky), `date` (dnešek v kalendáři) a `true` (aktuální položka v jiné skupině, třeba vybraná fotka v galerii).

Hezký vedlejší efekt: zvýraznění nepotřebuje vlastní třídu. Když ho CSS bere z atributu, obrazovka a čtečka se nikdy nerozejdou:

:::live
```html
<nav class="steps" aria-label="Postup objednávky">
  <a href="#kosik">1. Košík</a>
  <a href="#doprava" aria-current="step">2. Doprava</a>
  <a href="#platba">3. Platba</a>
</nav>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.steps { display: flex; gap: 0.5rem; }
.steps a { padding: 0.4rem 0.8rem; border-radius: 999px; color: #57534e; text-decoration: none; }
.steps [aria-current] { background: #7c2d12; color: white; font-weight: 600; }
```
:::

Přesuň `aria-current="step"` na „3. Platba" a zvýraznění přeskočí samo.

:::check
Kolega zvýrazňuje aktuální stránku v menu třídou `is-active` a `aria-current` nepoužívá. Co z toho má uživatel čtečky?

### --answer--
Nic nechybí, čtečka pozná aktivní položku podle jiné barvy.

#### --why--
Čtečka barvy ani třídy nevidí. Pracuje se stromem přístupnosti, a do něj se třída nepromítne.

### --correct--
Neví, na které stránce je; všechny položky menu zní stejně.

#### --why--
Zvýraznění je jen vizuální. `aria-current="page"` přidá do stromu stav „aktuální stránka", a když ho použije i CSS, třída navíc není potřeba.

### --answer--
Čtečka přečte název třídy „is active".

#### --why--
Třídy se do stromu přístupnosti nedostanou vůbec, čtečka je nezná.
:::

## Oznámení: `role="status"` a `role="alert"`

Čtečka čte tam, kde uživatel právě je. Když se text změní jinde, potřebuje **[[živá oblast]]** (*live region*): prvek, u kterého čtečka sama ohlásí každou změnu obsahu. Vznikne atributem `aria-live`, nebo jednodušeji jednou ze dvou rolí:

| role | odpovídá | kdy čtečka mluví | na co |
|---|---|---|---|
| `status` | `aria-live="polite"` | až dořekne, co právě čte | „Přidáno do košíku", „Uloženo", „Nalezeno 12 káv" |
| `alert` | `aria-live="assertive"` | hned, přeruší ostatní | chyba, která brání pokračovat; „Za minutu tě odhlásíme" |

:::live
```html
<article class="note">
  <label for="note-text">Poznámka k objednávce</label>
  <textarea id="note-text" rows="3">Prosím zazvonit u vrat, zvonek u dveří nefunguje.</textarea>
  <button type="button" class="note__save">Uložit poznámku</button>
  <p class="note__status" role="status"></p>
</article>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.note { display: grid; gap: 0.5rem; max-width: 22rem; }
label { font-weight: 600; }
textarea { font: inherit; padding: 0.5rem; border: 1px solid #78716c; border-radius: 0.4rem; }
.note__save { justify-self: start; font: inherit; padding: 0.5rem 1rem; border: 0; border-radius: 0.4rem; background: #7c2d12; color: white; cursor: pointer; }
.note__status { min-height: 1.5rem; margin: 0; color: #15803d; font-weight: 600; }
```
```js
const saveButton = document.querySelector('.note__save');
const status = document.querySelector('.note__status');

saveButton.addEventListener('click', () => {
  const time = new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  status.textContent = `Poznámka uložena v ${time}.`;
});
```
:::

Se zapnutou čtečkou uslyšíš po kliknutí „Poznámka uložena v …", i když fokus zůstane na tlačítku. Aby to fungovalo, platí tři pravidla:

- **Oblast je na stránce od načtení**, prázdná. Skript mění jen její text. Oblast, která vznikne až spolu s textem, čtečka často neohlásí, protože ji nestihla začít hlídat. Nově vložený `role="alert"` většina čteček ohlásí i tak, ale na stavové zprávy se to nevztahuje a připravená oblast funguje spolehlivě vždy.
- **Oznamuj výsledek, ne průběh.** Počet výsledků hledání ohlas po dopsání, ne po každém písmenu, jinak čtečka přeruší sama sebe dvacetkrát za sebou.
- **`alert` jen na to, co nepočká.** Když je `alert` všechno, uživatel čtečky nemůže nic dočíst, protože ho každá drobnost přeruší.

:::check
Filtr káv po zaškrtnutí „Jen bez kofeinu" přepíše text nad seznamem na „Zobrazeny 2 kávy z 9". Jakou roli dáš odstavci s tímto textem? Napiš jen hodnotu atributu `role`.

### --expected-- ignore-case
status

### --why--
Počet výsledků je stavová zpráva, která nemusí nic přerušit. `role="status"` ji čtečka řekne, až dořekne, co právě čte (třeba název zaškrtnutého pole). `alert` by ho utnul uprostřed.
:::

## Vzory z APG a kdy je HTML už má

Pro složitější komponenty nemusíš role a klávesy vymýšlet. **APG** (*ARIA Authoring Practices Guide*) organizace W3C popisuje pro každý běžný vzor, jaké role a stavy potřebuje a jak se ovládá klávesnicí. Než recept opíšeš, podívej se, jestli ho HTML nemá hotový:

| vzor z APG | co po tobě chce | HTML, které to umí samo |
|---|---|---|
| rozbalovací obsah (*disclosure*) | tlačítko s `aria-expanded`, přepínání panelu | `<details>` a `<summary>` |
| akordeon | skupina rozbalovacích sekcí, otevřená jen jedna | `<details name="faq">` se stejným `name` |
| modální dialog | fokus dovnitř, Escape zavře, zbytek stránky vypnutý, fokus zpět | `<dialog>` otevřený přes `showModal()` |
| záložky (*tabs*) | `role="tablist"`, `tab`, `tabpanel`, `aria-selected`, šipky | žádné, stavíš z ARIA a JavaScriptu |
| menu aplikace | `role="menu"`, `menuitem`, šipky, Escape | žádné; navigace webu to **není** |

Tlačítko s `aria-expanded` jsi ve workshopu stavěl ručně, protože panel filtrů měl vlastní vzhled a skript. Kde stačí obyčejné rozbalení, `<details>` zařídí roli, stav i klávesnici bez řádku JavaScriptu. Stejně dialog: klikni na tlačítko, zkus Tab a Escape.

:::live
```html
<p>Doručení: <strong>Wurmova 12, Olomouc</strong></p>
<button type="button" class="open-dialog">Změnit adresu doručení</button>

<dialog class="address" aria-labelledby="address-title">
  <h2 id="address-title">Adresa doručení</h2>
  <form method="dialog" class="address__form">
    <label for="street">Ulice a číslo</label>
    <input id="street" autocomplete="street-address" value="Wurmova 12">
    <label for="city">Město</label>
    <input id="city" autocomplete="address-level2" value="Olomouc">
    <button>Uložit adresu</button>
  </form>
</dialog>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
button { font: inherit; padding: 0.5rem 1rem; border: 0; border-radius: 0.4rem; background: #7c2d12; color: white; cursor: pointer; }
.address { border: 0; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 20px 40px rgb(28 25 23 / 0.25); }
.address::backdrop { background: rgb(28 25 23 / 0.5); }
.address h2 { margin: 0 0 1rem; font-size: 1.25rem; }
.address__form { display: grid; gap: 0.35rem; min-width: 16rem; }
.address__form input { font: inherit; padding: 0.4rem 0.6rem; border: 1px solid #78716c; border-radius: 0.4rem; margin-bottom: 0.5rem; }
```
```js
const dialog = document.querySelector('.address');
document.querySelector('.open-dialog').addEventListener('click', () => dialog.showModal());
```
:::

Po `showModal()` jde fokus do dialogu, zbytek stránky je automaticky `inert`, Escape dialog zavře a fokus se vrátí na tlačítko, které ho otevřelo. S `div` a `role="dialog"` bys tohle všechno psal sám. Jak ovládat dialog a fokus z JavaScriptu podrobně, ukáže sekce o DOM.

:::check
Na stránce častých otázek má být pět odpovědí, které se rozbalí po kliknutí na otázku. Jaký prvek HTML použiješ na jednu otázku s odpovědí? Napiš jen název značky.

### --expected-- ignore-case
details

### --accept--
<details>

### --why--
`<details>` se `<summary>` je rozbalovací obsah z APG hotový v HTML: `summary` má roli tlačítka, stav rozbaleno a sbaleno a ovládá se Enterem i mezerníkem.
:::

## Typické chyby a pasti

> [!PITFALL] `role="menu"` na navigaci webu
> *Příznak:* čtečka v navigaci oznámí „menu" a přepne se do režimu, kde čeká šipky. Tab ani šipky nefungují, jak uživatel čeká, a odkazy „nejdou otevřít".
>
> *Oprava:* navigace webu je `<nav>` se seznamem odkazů. Role `menu` patří do aplikací (menu „Soubor" v online editoru) a vyžaduje celou obsluhu šipek podle APG.

> [!PITFALL] Zbytečná role na prvku, který ji už má
> *Příznak:* `<nav role="navigation">`, `<button role="button">`, `<ul role="list">`. Nic se nerozbije, ale kód je delší a validátor HTML hlásí varování.
>
> *Oprava:* smaž je. Výjimka existuje jen tam, kde CSS roli prvku potlačí (`list-style: none` u seznamu v Safari) a tým to má doložené.

> [!PITFALL] Živá oblast přidaná až se zprávou
> *Příznak:* skript po uložení vloží do stránky `<p role="status">Uloženo</p>`. Na obrazovce je, čtečka mlčí.
>
> *Oprava:* prázdný `<p role="status"></p>` dej do HTML od začátku a skript ať mění jen jeho `textContent`.

> [!PITFALL] `aria-live` na celém seznamu
> *Příznak:* po změně filtru čtečka přečte všech třicet karet produktů, protože se přepsal celý obsah oblasti.
>
> *Oprava:* živá je jen krátká zpráva nad seznamem („Zobrazeno 12 káv"), seznam sám ne.

:::check
Po zaškrtnutí filtru „Jen bez kofeinu" skript přepíše celý seznam dvaceti karet káv. Seznam má `aria-live="polite"`. Co uslyší uživatel čtečky?

### --answer--
Nic, `aria-live` na seznamu nefunguje.

#### --why--
Funguje, `aria-live` jde dát na jakýkoli prvek. Právě proto je problém v tom, kolik obsahu se v oblasti změnilo.

### --correct--
Po dočtení aktuální věty přečte obsah všech nových karet za sebou.

#### --why--
Změnil se celý obsah živé oblasti, takže ho čtečka celý ohlásí. Živá má být jen krátká zpráva nad seznamem, třeba „Zobrazeny 2 kávy".

### --answer--
Hned přeruší čtení a řekne „seznam změněn".

#### --why--
`polite` nic nepřerušuje a čtečka neohlašuje „změněno", ale nový obsah oblasti.
:::

:::explain
Kolega schovává zbytek stránky pod otevřeným postranním panelem přes `aria-hidden="true"` na `<main>`. Vysvětli mu, proč tam patří `inert`.

## --model--
`aria-hidden` vyřadí `main` jen ze stromu přístupnosti, ale odkazy a tlačítka v něm dál dostávají fokus. Uživatel klávesnice pak Tabem odejde z panelu do neviditelného obsahu a uživatel čtečky přistane na prvcích, o kterých čtečka nic neřekne. `inert` vypne celý obsah: nejde na něj Tabem ani kliknout a čtečka ho nevidí. Po zavření panelu se atribut odebere.

## --checklist--
- `aria-hidden` mění jen strom přístupnosti, ne fokus.
- Ovládací prvky pod `aria-hidden` jdou dál zaměřit Tabem.
- `inert` vypne fokus, kliknutí i čtečku najednou.
:::

## Kde to najdeš v MDN

- [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) — přehled rolí a atributů s odkazy na každý z nich a upozorněním, kdy ARIA nepoužít.
- [ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) — `aria-live`, `role="status"`, `role="alert"` a proč musí oblast existovat předem.
- [aria-hidden](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden) — kdy prvek schovat před čtečkou a proč nikdy ne ovládací prvek.
- [HTML inert global attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert) — co všechno `inert` vypne a jak souvisí s dialogem.

# --questions--

## --question--

Ve formuláři pro rezervaci kurzu je pole `<input id="date" type="date">` a pod ním chybová hláška `<p id="date-error">Kurz v tento den není.</p>`. Jak bude vypadat atribut `aria-describedby` na poli, když má pole zároveň připojenou nápovědu s `id="date-hint"`? Napiš celý atribut, nápověda první.

### --expected--

aria-describedby="date-hint date-error"

### --accept--

aria-describedby='date-hint date-error'

### --why--

Víc `id` se odděluje mezerou a čtečka popisy přečte v tomhle pořadí. Čárka ani `#` do hodnoty nepatří.

### --see--

html-pristupnost/aria-vzory#aria-describedby-popis-vedle-jmena

## --question--

U odkazu „Košík" je vedle textu číslo v kolečku, které je vidět jen očima a čtečce ho říká skrytý text „3 položky". Kolečko má `aria-hidden="true"`. Proč je tady `aria-hidden` v pořádku, i když je uvnitř odkazu?

### --answer--

Protože `aria-hidden` uvnitř odkazu skryje celý odkaz.

#### --why--

Myslíš si, že `aria-hidden` působí na rodiče? Působí jen na prvek, na kterém je, a na jeho potomky.

### --correct--

Protože kolečko samo fokus nedostane; zaměřuje se odkaz, který zůstává ve stromu i se jménem.

#### --why--

Pravidlo zakazuje `aria-hidden` na prvku, který jde zaměřit, nebo na obalu takového prvku. Kolečko je jen `span` uvnitř odkazu, takže čtečka odkaz ohlásí se jménem z textu a skrytého textu.

### --answer--

Protože `aria-hidden` na čísla nepůsobí.

#### --why--

Myslíš si, že záleží na obsahu? `aria-hidden` vyřadí ze stromu jakýkoli prvek, i s čísly.

### --see--

html-pristupnost/aria-vzory#skryt-pro-oci-pro-ctecku-nebo-pro-oba

## --question--

Po odeslání objednávky se nahoře objeví „Platba kartou se nezdařila. Zkus to znovu nebo zvol převod." Formulář bez vyřešení chyby nejde dokončit. Jakou roli dáš prvku, do kterého skript zprávu zapíše? Napiš jen hodnotu atributu `role`.

### --expected-- ignore-case

alert

### --why--

Neúspěšná platba brání pokračovat a uživatel se to má dozvědět hned, i když čtečka zrovna něco čte. Na to je `role="alert"`. Potvrzení „Objednávka odeslána" by patřilo do `status`.

### --see--

html-pristupnost/aria-vzory#oznameni-role-status-a-role-alert
