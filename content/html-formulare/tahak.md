Rychlý přehled formulářů: co se odešle, jak se to zkontroluje a co na tom nejčastěji padá.

## Kostra formuláře

```html
<form action="/kontakt/odeslat" method="post">
  <fieldset>
    <legend>Kontakt na vás</legend>

    <label for="jmeno">Jméno</label>
    <input type="text" id="jmeno" name="jmeno" autocomplete="name" required>

    <label for="email">E-mail</label>
    <input type="email" id="email" name="email" autocomplete="email" required>

    <label for="telefon">Telefon (nepovinně)</label>
    <input type="tel" id="telefon" name="telefon" autocomplete="tel" inputmode="tel">
  </fieldset>

  <label for="zprava">Zpráva</label>
  <textarea id="zprava" name="zprava" minlength="10" maxlength="2000" required></textarea>

  <label><input type="checkbox" name="souhlas" value="ano" required> Souhlasím se zpracováním údajů</label>

  <button type="submit">Odeslat</button>
</form>
```

Formulář je popis HTTP požadavku: **kam** ho poslat (`action`), **jakou metodou** (`method`)
a **s jakými daty** (dvojice `name=hodnota` z polí). Nic víc prohlížeč nedělá a JavaScript
k tomu nepotřebuje.

## Atributy, které rozhodují

| atribut | kde | co dělá |
|---|---|---|
| `action` | `<form>` | adresa, kam data odejdou; když chybí, jde to na adresu stránky |
| `method` | `<form>` | `get` (výchozí) nebo `post` |
| `novalidate` | `<form>` | vypne bubliny prohlížeče a blokování odeslání; pravidla platí dál |
| `name` | pole, tlačítko | **jméno dvojice** — bez něj se pole neodešle vůbec |
| `value` | pole, tlačítko | odesílaná hodnota |
| `id` | pole | cíl pro `for` u popisku, pro CSS a pro JavaScript; **neodesílá se** |
| `for` | `<label>` | `id` pole, které popisek popisuje |
| `type` | `<input>`, `<button>` | co pole umí a co prohlížeč sám zkontroluje |
| `disabled` | pole | pole je mimo hru a **neodešle se** |
| `readonly` | pole | nejde změnit, ale odešle se |
| `autocomplete` | pole | jméno údaje, aby ho prohlížeč uměl doplnit (`name`, `email`, `tel`, `street-address`, `off`) |
| `inputmode` | pole | jakou klávesnici nabídnout na mobilu (`numeric`, `tel`, `email`, `decimal`) |

## Co se odešle a pod jakým jménem

| situace | co dorazí na server |
|---|---|
| `<input name="from" value="Praha">` | `from=Praha` |
| pole bez `name` | **nic** |
| pole s `disabled` | **nic** |
| `<input type="hidden" name="krok" value="2">` | `krok=2` (uživatel ho nevidí, ale je v HTML vidět každému) |
| zaškrtnuté `<input type="checkbox" name="stock" value="1">` | `stock=1` |
| zaškrtnuté políčko bez `value` | `stock=on` |
| nezaškrtnuté políčko | **nic** (žádné `off` neexistuje) |
| dvě pole se stejným `name` | dvě dvojice: `topic=css&topic=react` |
| `<button type="submit" name="intent" value="publish">` | `intent=publish`, a **jen** u tlačítka, na které se kliklo |

Kódování je u GET i POST stejné: dvojice oddělené `&`, mezera jako `+`, znaky mimo
ASCII jako `%` a bajty UTF-8 (`é` → `%C3%A9`). Server si to dekóduje sám.

## GET, nebo POST

| GET | POST |
|---|---|
| vyhledávání, filtr, řazení, stránkování | registrace, objednávka, přihlášení, komentář |
| data v adrese za otazníkem, tělo prázdné | data v těle, adresa zůstane čistá |
| jde uložit do záložek a poslat odkazem | výsledek se nesmí opakovat náhodou |
| opakování nic nerozbije | obnovení stránky se zeptá „Odeslat znovu?" |
| zůstane v historii a v logu serveru | do historie se neukládá |

Rozhoduje otázka **„mění odeslání něco na serveru?"**. POST ale data nešifruje — před
odposlechem chrání až HTTPS.

## Tlačítka a Enter

| `type` | co udělá kliknutí |
|---|---|
| `submit` | odešle formulář (**výchozí**, když `type` nenapíšeš) |
| `button` | nic — tlačítko pro JavaScript |
| `reset` | vrátí pole na výchozí hodnoty (skoro nikdy nechceš) |

Enter v textovém poli formulář odešle, jako by uživatel klikl na **první odesílací
tlačítko v pořadí HTML**. Rozhoduje pořadí v kódu, ne rozmístění v CSS. V `<textarea>`
Enter jen udělá nový řádek.

## Typy polí

| typ | k čemu | co hlídá sám |
|---|---|---|
| `text` | krátký text | nic |
| `email` | e-mail | **tvar** adresy, ne její existenci (`a@b` projde) |
| `url` | adresa | schéma (`https://`) |
| `password` | heslo | nic, jen skryje znaky |
| `number` | číslo | čísla, spolu s `min`, `max`, `step` |
| `date`, `time` | datum, čas | platnou hodnotu, s vlastním výběrem |
| `tel` | telefon | **nic** — číselná klávesnice, na formát je `pattern` |
| `checkbox` | volba ano/ne | s `required` musí být zaškrtnuté |
| `radio` | právě jedna možnost ze skupiny | skupinu spojuje stejné `name` |
| `hidden` | hodnota, kterou nese stránka | nic |

## Validační atributy

| atribut | co hlídá | na čem |
|---|---|---|
| `required` | pole nesmí zůstat prázdné | skoro všechno |
| `minlength`, `maxlength` | počet znaků | text, heslo, `textarea` |
| `min`, `max` | rozsah hodnoty | číslo, datum, čas |
| `step` | **povolené násobky** (od `min`, jinak od nuly) | číslo, datum, čas |
| `pattern` | shoda s regulárním výrazem | text, `tel` |

Prohlížeč zastaví odeslání u **prvního** vadného pole, zaostří ho a ukáže bublinu ve
svém jazyce. Bublinu nepíšeš ty a nastylovat ji nejde.

## CSS a stav pole

```css
input:user-invalid { border-color: #c62828; background: #fdecea; }
input:user-valid   { border-color: #2e7d32; }
input, button      { font: inherit; }
```

| pseudotřída | kdy platí |
|---|---|
| `:valid` | pole je v pořádku (nebo je prázdné a nepovinné) |
| `:invalid` | pole má chybu — **už od načtení stránky** |
| `:user-invalid` | pole má chybu **a zároveň** do něj uživatel sáhl nebo zkusil odeslat |
| `:user-valid` | pole je v pořádku po interakci uživatele |

Na obarvení chyb ber `:user-invalid`. S `:invalid` svítí prázdný povinný formulář
červeně dřív, než uživatel cokoli napsal.

## Přístupnost

- **Každé pole má `<label>`** spárovaný přes `for` a `id`. Popisek jde kliknout a fokus
  skočí do pole; čtečka obrazovky ho přečte spolu s polem.
- **`placeholder` není popisek.** Po začátku psaní zmizí a čtečky ho nemusí číst správně.
- **Související pole spoj do `<fieldset>` s `<legend>`** — u skupiny přepínačů je to
  jediný způsob, jak čtečka řekne, k čemu se skupina vztahuje.
- **Povinnost piš do popisku** („Jméno (povinné)"), ne jen hvězdičkou a barvou.
- **Vlastní chybovou hlášku** napoj na pole přes `aria-describedby` a dej ji **pod pole**,
  ne jen do tooltipu — a nespoléhej jen na barvu.
- **Projdi formulář tabulátorem.** Kam skáče fokus, je vidět, kde je, dá se odeslat
  z klávesnice? Co nefunguje tobě, nebude fungovat nikomu.

## Pasti

| past | příznak | oprava |
|---|---|---|
| pole má `id`, ale ne `name` | vyplněné pole na serveru chybí | přidej `name` |
| `name` s překlepem | server hlásí „chybí e-mail", v Payload je `e-mail=…` | `name` musí přesně sedět na klíč, který čte server |
| tlačítko „Zpět" bez `type` | kliknutí odešle rozepsaný formulář | `type="button"`, nebo z něj udělej odkaz |
| špatné pořadí tlačítek | Enter uloží koncept místo odeslání | hlavní odesílací tlačítko dej v HTML první |
| heslo metodou GET | v adrese vidíš `?password=…` | `method="post"` |
| `placeholder` místo popisku | čtečka pole nepojmenuje | doplň `<label for>` |
| `novalidate` na poli | atribut nic nedělá | patří na `<form>` |
| `step` chápaný jako desetinná místa | `1.005` neprojde se `step="0.01"` | `step` jsou násobky, ne přesnost |
| validace jen v prohlížeči | data z curl projdou bez kontroly | server kontroluje **všechno znovu** |

Poslední řádek je ta nejdůležitější: validace v prohlížeči je zpětná vazba pro
uživatele, ne obrana serveru.

## Jak zjistíš, co se opravdu odeslalo

DevTools (F12) → panel **Network** → zaškrtni **Preserve log** → odešli formulář →
klikni na první požadavek. **Headers** ukáže metodu a adresu, **Payload** data: u GET
jako *Query String Parameters*, u POST jako *Form Data*. **view source** ukáže surový
tvar `from=Praha&to=Brno`, **view decoded** převede `%C3%A9` zpátky na `é`. Co v Payload
není, server nedostal.
