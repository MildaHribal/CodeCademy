## --card-- free

Jakým způsobem prohlížeč odešle formulář s atributem `method="GET"`?

### --back--

Vezme všechny hodnoty vstupních polí a přidá je přímo do URL jako query parametry. GET se používá pro operace, které nemění stav na serveru, například vyhledávání, a data se předávají v URL.

### --see--

html-formulare/jak-funguje-formular#action-a-method-kam-a-jak

## --card-- free

Co je v tomto kódu špatně z pohledu přístupnosti?

```html
<form>
  <input type="text" name="jmeno" placeholder="Vaše jméno">
</form>
```

### --back--

Chybí sémantický popisek ([[label]]). Placeholder ho nenahrazuje. Placeholder obvykle po začátku psaní zmizí, čtečky obrazovky ho navíc nemusí číst správně. Každé pole musí mít spárovaný `<label>` s atributem `for`, který míří na `id` pole.

### --see--

html-formulare/workshop-registrace

## --card-- free

Formulář má `action="/hledani"` a `method="get"`. Co přesně prohlížeč po odeslání udělá?

### --back--

Projde pole, z každého pole s atributem `name` vezme dvojici `jméno=hodnota` a pošle je na adresu z [[action]]. U metody `get` je připojí do adresy za otazník (`/hledani?q=mloky`) a tělo požadavku nechá prázdné. Nic víc formulář nedělá a JavaScript k tomu nepotřebuje.

Kdyby `action` chyběl, odejdou data na adresu stránky, na které formulář je.

### --see--

html-formulare/jak-funguje-formular#action-a-method-kam-a-jak

## --card-- output

Co vypíše tenhle kód?

```js
const data = new URLSearchParams();
data.append('from', 'Praha');
data.append('to', 'Hradec Králové');
console.log(data.toString());
```

### --expected--

from=Praha&to=Hradec+Kr%C3%A1lov%C3%A9

### --why--

Přesně takhle zakóduje data i prohlížeč: dvojice odděluje `&`, mezera je `+` a znaky mimo základní ASCII se zapíšou jako `%` a bajty UTF-8. Server je zase dekóduje, takže se o to v HTML starat nemusíš.

### --see--

html-formulare/jak-funguje-formular#action-a-method-kam-a-jak

## --card-- output

Formulář nemá atribut `method`. Napiš metodu, kterou se odešle.

### --expected--

GET

### --accept--

get

### --why--

`get` je výchozí [[metoda formuláře]]. Když potřebuješ POST, musíš ho napsat — jinak skončí heslo nebo objednávka v adrese.

### --see--

html-formulare/jak-funguje-formular#action-a-method-kam-a-jak

## --card-- output

Uživatel zaškrtne `<input type="checkbox" name="terms" value="accepted">`. Napiš dvojici, která se odešle.

### --expected--

terms=accepted

### --why--

Klíčem je `name`, hodnotou `value`. Bez `value` by [[zaškrtávací políčko]] poslalo `terms=on`, nezaškrtnuté by neposlalo vůbec nic — žádné `off` neexistuje.

### --see--

html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

## --card-- output

Formulář má dvě zaškrtnutá políčka `<input type="checkbox" name="topic" value="css">` a `<input type="checkbox" name="topic" value="react">`. Napiš, co se z nich objeví v adrese za otazníkem.

### --expected--

topic=css&topic=react

### --why--

Víc polí se stejným `name` pošle víc dvojic. Server je pak přečte jako seznam — v Node třeba přes `searchParams.getAll('topic')`.

### --see--

html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

## --card-- free

Uživatel pole vyplnil, ale na serveru po něm není ani stopa — v adrese ani v těle požadavku ho nenajdeš. Co je nejpravděpodobnější příčina?

### --back--

Poli chybí [[atribut name]]. Odesílají se dvojice jméno a hodnota; jméno určuje `name`, a bez něj prohlížeč hodnotu nemá jak pojmenovat, takže ji do požadavku vůbec nezařadí. Není to chyba ani varování, pole prostě zmizí. `id` slouží popisku, CSS a JavaScriptu, ne odeslání.

Stejně tiše se neodešle pole s atributem `disabled`. Naopak [[skryté pole]] uživatel nevidí, ale odešle se jako každé jiné.

### --see--

html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

## --card-- free

Jaké hodnoty má atribut `type` u `<button>` a která z nich platí, když ho nenapíšeš?

### --back--

- `submit` — odešle formulář,
- `button` — neudělá nic, tlačítko pro JavaScript,
- `reset` — vrátí všechna pole na výchozí hodnoty.

Bez `type` je tlačítko uvnitř formuláře **odesílací**. Proto „Zpět" nebo „Přidat položku" bez `type="button"` odešle rozepsanou objednávku. [[tlačítko reset|Reset]] skoro nikdy nechceš: uživatel si ho plete s odesláním a ztracená data nejdou vrátit.

### --see--

html-formulare/jak-funguje-formular#tlacitka-submit-button-a-reset

## --card-- output

Formulář má `<button type="submit" name="intent" value="draft">Uložit koncept</button>` a `<button type="submit" name="intent" value="publish">Publikovat</button>`. Uživatel klikne na **Publikovat**. Napiš dvojici za tlačítko, která se odešle.

### --expected--

intent=publish

### --why--

Odešle se jen to tlačítko, kterým uživatel formulář odeslal. Druhé tlačítko se stejným `name` v datech není — díky tomu jeden formulář obslouží dvě různé akce.

### --see--

html-formulare/jak-funguje-formular#tlacitka-submit-button-a-reset

## --card-- free

Ve formuláři jsou v tomhle pořadí `<button type="button">Zpět</button>`, `<button type="submit" name="step" value="save">Uložit</button>` a `<button type="submit" name="step" value="pay">Zaplatit</button>`. Uživatel stiskne Enter v textovém poli. Co se odešle a proč?

### --back--

Odešle se `step=save`. Enter spustí [[implicitní odeslání]]: prohlížeč se zachová, jako by uživatel klikl na **první odesílací tlačítko v pořadí HTML**. „Zpět" je `type="button"`, takže se přeskočí, a prvním [[odesílací tlačítko|odesílacím tlačítkem]] je „Uložit".

Rozhoduje pořadí v HTML, ne rozmístění v CSS. Hlavní akci proto dej v kódu jako první. V `<textarea>` Enter formulář neodešle, jen udělá nový řádek.

### --see--

html-formulare/jak-funguje-formular#odeslani-enterem

## --card-- free

Podle čeho se rozhodneš mezi `method="get"` a `method="post"`?

### --back--

Otázkou **„mění odeslání něco na serveru?"**

- **GET** — vyhledávání, filtr, řazení, stránkování. Výsledek jde uložit do záložek a poslat odkazem, opakované odeslání nic nerozbije. Data jsou ale v adrese, v historii i v logu serveru.
- **POST** — registrace, objednávka, přihlášení, komentář. Data jdou v těle, obnovení stránky se zeptá „Odeslat znovu?".

Akce, která něco mění, nesmí být GET: adresu stačí otevřít z historie nebo ji nechat načíst náhledem v chatu a akce proběhne. POST přitom data nešifruje, před odposlechem chrání až HTTPS.

### --see--

html-formulare/jak-funguje-formular#get-nebo-post

## --card-- free

Kde v DevTools zjistíš, co formulář doopravdy odeslal?

### --back--

V panelu **Network** (zapni **Preserve log**, jinak záznam po načtení nové stránky zmizí). Klikni na první požadavek: karta **Headers** ukáže metodu a adresu, karta **Payload** data — u GET jako *Query String Parameters*, u POST jako *Form Data*. Tlačítko **view source** ukáže surový tvar `from=Praha&to=Brno`, **view decoded** převede `%C3%A9` zpátky na `é`.

Když si nejsi jistý, jestli se pole odesílá, nehádej: hledej v Payload jeho `name`. Co tam není, server nedostal.

### --see--

html-formulare/jak-funguje-formular#co-uvidis-v-network

## --card-- free

Které kontroly umí HTML samo, bez jediného řádku JavaScriptu?

### --back--

[[validační atribut|Validační atributy]] přímo na poli:

| atribut | co hlídá |
|---|---|
| [[required]] | pole nesmí zůstat prázdné |
| [[maxlength|minlength, maxlength]] | počet znaků |
| `min`, `max` | rozsah hodnoty u čísla, data a času |
| [[step]] | povolené násobky |
| [[pattern]] | shoda s regulárním výrazem |

K tomu hlídá tvar hodnoty i samotný [[typ pole]]. Prohlížeč zastaví odeslání u **prvního** vadného pole, zaostří ho a ukáže u něj hlášku.

### --see--

html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy

## --card-- output

Chceš pole na české PSČ ve tvaru `123 45`. Napiš jméno atributu, kterým tvar ohlídáš.

### --expected--

pattern

### --accept--

atribut pattern

### --why--

`type="tel"` vyvolá na mobilu číselnou klávesnici, ale formát nekontroluje vůbec. Na tvar je regulární výraz v `pattern`.

### --see--

html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy

## --card-- output

Napiš atribut i s hodnotou, kterým omezíš pole na nejvýš 200 znaků.

### --expected--

maxlength="200"

### --accept--

maxlength=200

### --why--

[[maxlength]] víc znaků rovnou napsat nedovolí, kdežto `minlength` se projeví až při odeslání. Na serveru se délka stejně kontroluje znovu.

### --see--

html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy

## --card-- free

Co hlídá `type="email"`, `type="url"` a `type="tel"` — a co nehlídá?

### --back--

[[typ pole|Typ pole]] rozhoduje o klávesnici na mobilu i o tom, co prohlížeč zkontroluje sám:

- `email` hlídá **tvar** adresy, ne její existenci. `a@b` projde a doménu nejvyššího řádu specifikace nevyžaduje. Jestli schránka existuje, zjistíš jedině ověřovacím e-mailem.
- `url` vyžaduje adresu včetně schématu (`https://`).
- `tel` vyvolá číselnou klávesnici a **nekontroluje nic** — na formát je `pattern`.

### --see--

html-formulare/validace-v-prohlizeci#validace-podle-typu-type

## --card-- free

Pole má `step="0.01"` a uživatel napíše `1.005`. Pustí prohlížeč formulář dál?

### --back--

Ne. [[step]] neurčuje počet desetinných míst, ale **povolené násobky**, počítané od `min` (a když `min` není, od nuly). `1.005` mezi násobky `0.01` nepatří, takže prohlížeč odeslání zastaví.

Šipkami nahoru a dolů se hodnota mění po krocích, ale pravidlo platí i pro ručně napsané číslo — jinak by se dalo obejít prostým psaním.

### --see--

html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy

## --card-- free

Proč se na obarvení vadných polí hodí `:user-invalid` líp než `:invalid`?

### --back--

[[pseudotřída :invalid]] platí **už od načtení stránky**. Prázdné povinné pole je neplatné od první vteřiny, takže celý formulář svítí červeně dřív, než uživatel cokoli napsal, a varování ztratí význam.

[[pseudotřída :user-invalid]] začne platit až poté, co do pole sáhl nebo zkusil odeslat — tedy až bude co vytknout. Protějšek `:user-valid` stojí za to taky: potvrzení, že je pole v pořádku, uklidní stejně, jako červená varuje.

### --see--

html-formulare/validace-v-prohlizeci#css-a-validace-pseudotridy

## --card-- css

V pravidle `input:user-invalid { … }` má vadné pole dostat červený rámeček barvy `#c62828`. Napiš deklaraci, která změní barvu rámečku.

### --expected--

```css
border-color: #c62828;
```

### --why--

Rámeček je nakreslený už v základním pravidle, takže se mění jen jeho barva. Kdybys napsal celé `border`, přepsal bys i šířku a styl.

### --see--

html-formulare/validace-v-prohlizeci#css-a-validace-pseudotridy

## --card-- css

Vstupní pole a tlačítka dostanou od prohlížeče vlastní písmo a velikost, takže vypadají jinak než okolní text. Napiš jednu deklaraci, kterou jim nastavíš písmo zděděné ze stránky.

### --expected--

```css
font: inherit;
```

### --accept--

```css
font: inherit
```

### --why--

`font` je zkratka, takže jedna deklarace přenese rodinu, velikost i řez. Tohle pravidlo je v každém rozumném stylopisu formuláře hned na začátku.

### --see--

html-formulare/validace-v-prohlizeci#css-a-validace-pseudotridy

## --card-- free

Kam se píše `novalidate`, co vypne a co naopak platí dál?

### --back--

[[novalidate]] patří na `<form>`, ne na pole. Vypne **jen** [[validační bublina|bubliny prohlížeče]] a blokování odeslání. Pravidla v HTML platí dál, takže `:user-invalid` v CSS i kontrola v JavaScriptu fungují pořád.

Tak se to obvykle používá: validace zůstane zapsaná v HTML, jen si chyby vypíšeš sám tam, kam patří — bubliny se totiž nedají nastylovat a v každém prohlížeči vypadají jinak.

### --see--

html-formulare/validace-v-prohlizeci#kdyz-chces-chyby-resit-po-svem

## --card-- free

Máš všude `required` a `type="email"`. Proč musí server kontrolovat data znovu?

### --back--

[[validace v prohlížeči]] běží **na počítači uživatele**, takže ji obejde kdokoli, a nemusí k tomu být hacker: v DevTools smaže `required` nebo změní `type`, pošle požadavek úplně bez prohlížeče (curl, Postman, skript), nebo má starý prohlížeč, který dané pravidlo nezná.

Server proto musí zkontrolovat všechno znovu, jako by v prohlížeči žádná validace nebyla. Ta tím neztrácí smysl — ušetří uživateli cestu na server a zpátky a řekne mu chybu okamžitě. Jen to není bezpečnost.

### --see--

html-formulare/validace-v-prohlizeci#proc-to-nestaci
