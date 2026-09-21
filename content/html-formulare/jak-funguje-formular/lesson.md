# Jak funguje formulář

:::check pretest
Na stránce jízdních řádů vyplníš pole „Kam" hodnotou `Brno` a odešleš formulář metodou GET. Kde tu hodnotu uvidíš?

### --answer--

Nikde, formulář posílá data skrytě, aby je nikdo neviděl.

#### --why--

Skrytě se data neposílají nikdy — i to, co v adrese není, uvidíš v DevTools. A u GET navíc v adrese jsou.

### --correct--

V adresním řádku za otazníkem, třeba `?kam=Brno`.

#### --why--

GET přidá data do adresy jako dvojice `jméno=hodnota`. Proto jde výsledek vyhledávání uložit do záložek nebo poslat odkazem.

### --answer--

Jen v JavaScriptu stránky, který hodnotu přečte z pole.

#### --why--

Formulář umí data odeslat i na stránce, kde žádný JavaScript není. Odeslání je práce prohlížeče.
:::

:::check pretest
Ve formuláři je `<button>Zpět</button>` bez dalších atributů. Co udělá kliknutí?

### --answer--

Nic, tlačítko bez atributů nemá žádnou akci.

#### --why--

Mimo formulář by to platilo. Uvnitř formuláře má tlačítko výchozí chování — jaké?

### --correct--

Odešle formulář.

#### --why--

Tlačítko ve formuláři má výchozí `type="submit"`. Uvidíš za chvíli, proč je to častá past.
:::

## Problém: vyhledávání bez JavaScriptu

Vyhledávání spojů, filtr v e-shopu, přihlášení, objednávka, registrace na akci. Všechno jsou formuláře a všechny dělají totéž: vezmou, co uživatel vyplnil, a pošlou to na server. Tohle umí prohlížeč sám, bez jediného řádku JavaScriptu — a když to postavíš správně, funguje formulář i tehdy, když se skript nenačte.

Když formulář stavíš bez pochopení, typicky se stane jedno z tohohle: server dostane prázdná data, protože polím chybí `name`; tlačítko „Zpět" místo návratu odešle rozepsanou objednávku; heslo skončí v adrese a v historii prohlížeče.

> [!REMEMBER]
> **Formulář je popis HTTP požadavku: kam ho poslat (`action`), jakou metodou (`method`) a s jakými daty (dvojice `name=hodnota` z polí).**

Prohlížeč při [[odeslání formuláře|odeslání]] projde pole, z každého pole s atributem `name` vezme dvojici `jméno=hodnota` a pošle je na adresu z `action`. Nic víc. Všechno ostatní v téhle lekci je jen podrobnost tohohle pravidla.

Ukázka níž je vyhledávání spojů. Pod formulářem je krátký skript, který odeslání zachytí a místo skutečného odeslání vypíše, jaký požadavek by prohlížeč poslal — ukázka totiž nemá žádný server. Samotný formulář JavaScript nepotřebuje. Jak takový skript funguje, se naučíš v lekci [Formuláře v JavaScriptu](see:js-dom/formulare-v-js#odeslani-submit-a-preventdefault).

:::live
```html
<form action="/spojeni" method="get">
  <label for="from">Odkud</label>
  <input id="from" name="from" value="Praha">

  <label for="to">Kam</label>
  <input id="to" name="to" value="Brno">

  <button type="submit">Vyhledat spojení</button>
</form>
<pre class="request">Odešli formulář a uvidíš požadavek.</pre>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; color: #1e293b; }
form { display: grid; gap: 0.35rem; max-width: 18rem; }
label { font-weight: 600; margin-top: 0.5rem; }
input, button { font: inherit; padding: 0.5rem 0.75rem; border: 1px solid #94a3b8; border-radius: 0.5rem; }
button { margin-top: 0.75rem; background: #1d4ed8; color: #fff; border: 0; cursor: pointer; }
.request { margin-top: 1rem; padding: 0.75rem; background: #0f172a; color: #a5f3fc; border-radius: 0.5rem; white-space: pre-wrap; }
```
```js
// Ukázka nemá server: místo odeslání vypíšeme požadavek, který by prohlížeč poslal.
const form = document.querySelector('form');
const request = document.querySelector('.request');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new URLSearchParams(new FormData(form, event.submitter)).toString();
  const action = form.getAttribute('action');
  request.textContent = form.method === 'get'
    ? `GET ${action}?${data}`
    : `POST ${action}\n\n${data}`;
});
```
:::

Klikni na **Vyhledat spojení**, pak zkus do pole „Kam" napsat `Hradec Králové` a odeslat znovu. Sleduj, co se stane s mezerou a s písmenem „é".

:::check
V ukázce přepíšeš u druhého pole `name="to"` na `name="destination"` a `id` necháš. Pod jakým klíčem se teď pošle hodnota `Brno`?

### --expected--

destination

### --why--

Klíč dvojice je vždycky `name` pole. `id` se neodesílá, slouží popisku `for`. Adresa teď bude `/spojeni?from=Praha&destination=Brno`.

### --see--

html-formulare/jak-funguje-formular#problem-vyhledavani-bez-javascriptu
:::

## `action` a `method`: kam a jak

Atribut **`action`** je adresa, kam data odejdou. Když chybí, pošle je prohlížeč na adresu stránky, na které formulář je.

Atribut **`method`** má dvě hodnoty, se kterými se potkáš:

- **`get`** (výchozí) — data přidá do adresy za otazník: `/spojeni?from=Praha&to=Brno`. Tělo požadavku je prázdné.
- **`post`** — adresa zůstane `/spojeni` a data jdou v těle požadavku, stejně zakódovaná: `from=Praha&to=Brno`.

Kódování je u obou stejné: dvojice oddělené `&`, mezera se zapíše jako `+` a znaky mimo základní ASCII jako `%` a bajty UTF-8 (`é` → `%C3%A9`). Server je zase dekóduje, takže se o to v HTML starat nemusíš. Jen se nelekni, až to uvidíš v adrese.

:::live
```html
<form action="/prihlaseni" method="post">
  <label for="email">E-mail</label>
  <input id="email" name="email" value="jana.novakova@seznam.cz">

  <label for="password">Heslo</label>
  <input id="password" name="password" type="password" value="Kafe a rohlík 7">

  <button type="submit">Přihlásit se</button>
</form>
<pre class="request">Odešli formulář a uvidíš požadavek.</pre>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; color: #1e293b; }
form { display: grid; gap: 0.35rem; max-width: 18rem; }
label { font-weight: 600; margin-top: 0.5rem; }
input, button { font: inherit; padding: 0.5rem 0.75rem; border: 1px solid #94a3b8; border-radius: 0.5rem; }
button { margin-top: 0.75rem; background: #1d4ed8; color: #fff; border: 0; cursor: pointer; }
.request { margin-top: 1rem; padding: 0.75rem; background: #0f172a; color: #a5f3fc; border-radius: 0.5rem; white-space: pre-wrap; }
```
```js
// Ukázka nemá server: místo odeslání vypíšeme požadavek, který by prohlížeč poslal.
const form = document.querySelector('form');
const request = document.querySelector('.request');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new URLSearchParams(new FormData(form, event.submitter)).toString();
  const action = form.getAttribute('action');
  request.textContent = form.method === 'get'
    ? `GET ${action}?${data}`
    : `POST ${action}\n\n${data}`;
});
```
:::

Odešli přihlášení a pak v HTML přepiš `method="post"` na `method="get"`. Heslo najednou skončí v adrese — a s ní v historii prohlížeče, v logu serveru a v odkazu, který někdo pošle kolegovi.

> [!NOTE]
> POST data nešifruje. V těle požadavku je heslo stejně čitelné jako v adrese, jen se neukládá do historie a do záložek. Před odposlechem chrání až HTTPS. K tomu se dostaneme v sekci o nasazení.

:::check
Formulář nemá atribut `method`. Jakou metodou se odešle?

### --expected-- ignore-case

GET

### --why--

Výchozí metoda je `get`. Když potřebuješ POST, musíš ho napsat.

### --see--

html-formulare/jak-funguje-formular#action-a-method-kam-a-jak
:::

## `name` je klíč, `value` je hodnota

Z každého pole se odešle dvojice **`name=value`**. Prohlížeč se neptá na `id`, na třídu ani na text popisku — jen na `name`. Pravidla, na kterých se chybuje:

- **Pole bez `name` se neodešle vůbec.** Uživatel ho vyplní, ale na server nic nedorazí.
- Zaškrtávací políčko (`checkbox`) se odešle, **jen když je zaškrtnuté**. Hodnota je jeho `value`, a když `value` chybí, pošle se slovo `on`.
- Víc polí se stejným `name` pošle víc dvojic: `topic=css&topic=react`.
- Pole s atributem `disabled` se neodešle. Pole `type="hidden"` uživatel nevidí, ale odešle se.

:::live predict
```html
<form action="/newsletter" method="get">
  <label for="email">E-mail</label>
  <input id="email" type="email" value="petr@example.cz">

  <label><input type="checkbox" name="weekly" checked> Týdenní souhrn</label>
  <label><input type="checkbox" name="offers"> Slevové akce</label>

  <button type="submit">Odebírat</button>
</form>
<pre class="request">Odešli formulář a uvidíš požadavek.</pre>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; color: #1e293b; }
form { display: grid; gap: 0.5rem; max-width: 18rem; }
input[type="email"], button { font: inherit; padding: 0.5rem 0.75rem; border: 1px solid #94a3b8; border-radius: 0.5rem; }
button { background: #1d4ed8; color: #fff; border: 0; cursor: pointer; }
.request { margin-top: 1rem; padding: 0.75rem; background: #0f172a; color: #a5f3fc; border-radius: 0.5rem; white-space: pre-wrap; }
```
```js
// Ukázka nemá server: místo odeslání vypíšeme požadavek, který by prohlížeč poslal.
const form = document.querySelector('form');
const request = document.querySelector('.request');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new URLSearchParams(new FormData(form, event.submitter)).toString();
  request.textContent = `GET ${form.getAttribute('action')}?${data}`;
});
```
--question-- Uživatel formulář odešle tak, jak je. Jaká adresa se pošle na server?
--option-- `/newsletter?email=petr%40example.cz&weekly=on&offers=off`
--option*-- `/newsletter?weekly=on`
--option-- `/newsletter?email=petr%40example.cz&weekly=on`
--why-- E-mailové pole má jen `id`, ne `name`, takže se neodešle. Nezaškrtnuté `offers` se neodešle vůbec (žádné `off` neexistuje) a zaškrtnuté `weekly` bez `value` pošle `on`. Přidej poli `name="email"` a políčku `value="yes"` a odešli znovu.
:::

> [!PITFALL]
> **Pole má `id`, ale ne `name`.** Příznak: pole je vyplněné, ale na serveru chybí (v adrese ani v těle požadavku ho nenajdeš). `id` slouží popisku, CSS a JavaScriptu, `name` odeslání. Oprava: přidej `name`.

:::check
Uživatel zaškrtne `<input type="checkbox" name="terms" value="accepted">`. Jaká dvojice se odešle?

### --expected--

terms=accepted

### --why--

Klíčem je `name`, hodnotou `value`. Bez `value` by se poslalo `terms=on`, nezaškrtnuté políčko by se neposlalo vůbec.

### --see--

html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota
:::

## Tlačítka: `submit`, `button` a `reset`

`<button>` má atribut `type` se třemi hodnotami:

| `type` | co udělá kliknutí |
|---|---|
| `submit` | odešle formulář |
| `button` | nic — tlačítko pro JavaScript nebo odkaz jinam |
| `reset` | vrátí všechna pole na výchozí hodnoty (skoro nikdy nechceš) |

A teď past: **když `type` nenapíšeš, je tlačítko ve formuláři `submit`.** Každé tlačítko, které má dělat něco jiného než odeslat, proto potřebuje `type="button"`.

:::live predict
```html
<form action="/objednavka" method="post">
  <label for="count">Počet lístků</label>
  <input id="count" name="count" type="number" value="2">

  <button onclick="document.querySelector('.request').textContent = 'Zobrazuji ceník…'">Ceník</button>
  <button type="submit">Koupit</button>
</form>
<pre class="request">Klikni na tlačítko.</pre>
```
```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; color: #1e293b; }
form { display: flex; flex-wrap: wrap; align-items: end; gap: 0.5rem; }
label { flex-basis: 100%; font-weight: 600; }
input, button { font: inherit; padding: 0.5rem 0.75rem; border: 1px solid #94a3b8; border-radius: 0.5rem; }
input { width: 5rem; }
button[type="submit"] { background: #1d4ed8; color: #fff; border: 0; }
.request { margin-top: 1rem; padding: 0.75rem; background: #0f172a; color: #a5f3fc; border-radius: 0.5rem; white-space: pre-wrap; }
```
```js
// Ukázka nemá server: místo odeslání vypíšeme požadavek, který by prohlížeč poslal.
const form = document.querySelector('form');
const request = document.querySelector('.request');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new URLSearchParams(new FormData(form, event.submitter)).toString();
  request.textContent = `POST ${form.getAttribute('action')}\n\n${data}`;
});
```
--question-- Uživatel klikne na **Ceník**. Co bude nakonec v tmavém rámečku?
--option-- `Zobrazuji ceník…`
--option*-- `POST /objednavka` a pod tím `count=2`
--option-- Nic se nezmění, tlačítko bez `type` nic nedělá.
--why-- Kliknutí nejdřív spustí `onclick` a text se na okamžik změní. Pak ale proběhne výchozí akce tlačítka — bez `type` je to `submit` — a formulář se odešle. Na skutečném webu by se stránka znovu načetla a objednávka odešla. Přidej tlačítku `type="button"` a klikni znovu.
:::

Tlačítko může mít i vlastní `name` a `value`. Pak se odešle **jen to, na které uživatel klikl**. Tak jeden formulář nabídne „Uložit koncept" a „Publikovat" a server pozná, co uživatel chtěl.

> [!PITFALL]
> **Tlačítko „Zpět" nebo „Přidat položku" odešle formulář.** Příznak: po kliknutí se stránka znovu načte nebo se objeví chyby povinných polí, i když uživatel nic odesílat nechtěl. Oprava: `type="button"` — nebo místo tlačítka odkaz `<a href="…">`, když jen vede jinam.

:::check
Formulář má `<button type="submit" name="intent" value="draft">Uložit koncept</button>` a `<button type="submit" name="intent" value="publish">Publikovat</button>`. Uživatel klikne na **Publikovat**. Jaká dvojice za tlačítko se odešle?

### --expected--

intent=publish

### --why--

Odešle se jen tlačítko, které formulář odeslalo. Druhé tlačítko se stejným `name` v datech není.

### --see--

html-formulare/jak-funguje-formular#tlacitka-submit-button-a-reset
:::

## Odeslání Enterem

Formulář se neodesílá jen kliknutím. Když uživatel stiskne **Enter v textovém poli**, prohlížeč odešle formulář, jako by klikl na **první odesílací tlačítko** v pořadí HTML. Tomu se říká [[implicitní odeslání]] (*implicit submission*).

Z toho plynou dvě věci:

- Formulář bez odesílacího tlačítka se Enterem odešle, jen když má jediné textové pole. Přidej tlačítko vždycky, i kvůli myši.
- Záleží na **pořadí tlačítek v HTML**, ne na tom, jak je CSS rozmístí. Když je „Uložit koncept" v kódu před „Publikovat", Enter uloží koncept.

V `<textarea>` Enter formulář neodešle, jen udělá nový řádek.

:::check
Formulář obsahuje v tomto pořadí `<button type="button">Zpět</button>`, `<button type="submit" name="step" value="save">Uložit</button>` a `<button type="submit" name="step" value="pay">Zaplatit</button>`. Uživatel stiskne Enter v poli s adresou. Jaká dvojice za tlačítko se odešle?

### --expected--

step=save

### --why--

Enter použije první **odesílací** tlačítko v pořadí HTML. „Zpět" je `type="button"`, takže se přeskočí, a první odesílací je „Uložit".

### --see--

html-formulare/jak-funguje-formular#odeslani-enterem
:::

## Co uvidíš v Network

Co formulář doopravdy poslal, zjistíš na libovolném webu v DevTools:

1. Otevři DevTools (F12) a panel **Network**. Zaškrtni **Preserve log**, jinak se záznam po načtení nové stránky smaže.
2. Odešli formulář.
3. Klikni na první požadavek v seznamu. Na kartě **Headers** vidíš metodu a adresu (`Request Method: POST`), na kartě **Payload** data: u GET jako *Query String Parameters*, u POST jako *Form Data*.
4. Tlačítko **view source** vedle dat ukáže surový tvar `from=Praha&to=Brno`, **view decoded** dekóduje `%C3%A9` zpátky na `é`.

> [!TIP]
> Když si nejsi jistý, jestli se pole odesílá, nehádej. Otevři Payload a hledej jeho `name`. Co tam není, server nedostal.

:::check
Odešleš přihlašovací formulář metodou POST. Na které kartě požadavku v panelu Network najdeš odeslaný e-mail?

### --answer--

Response — tam je, co server vrátil.

#### --why--

Response je odpověď serveru. Data, která jsi poslal, patří k požadavku.

### --correct--

Payload, v části Form Data.

#### --why--

Payload ukazuje data požadavku: u POST jako Form Data, u GET jako Query String Parameters.

### --answer--

Nikde, POST data v DevTools vidět nejsou.

#### --why--

Myslíš si, že POST data skrývá? DevTools ukážou každý požadavek celý, i s tělem.

### --see--

html-formulare/jak-funguje-formular#co-uvidis-v-network
:::

## GET, nebo POST?

Rozhoduje otázka **„mění odeslání něco na serveru?"**

| GET | POST |
|---|---|
| vyhledávání, filtr, řazení, stránkování | registrace, objednávka, přihlášení, komentář |
| výsledek jde uložit do záložek a poslat odkazem | výsledek se nesmí opakovat náhodou |
| opakované odeslání nic nerozbije | obnovení stránky se zeptá „Odeslat znovu?" |
| data jsou v adrese, historii a logu serveru | data jsou v těle, do historie se neukládají |

Filtr e-shopu „jen skladem, do 2 000 Kč" má být GET — zákazník si ho uloží a pošle kamarádovi. Objednávka musí být POST — nechceš, aby ji obnovení stránky nebo prohlížeč, který si odkazy předem načítá, odeslal dvakrát.

:::check
Formulář „Zrušit předplatné" používá `method="get"` a vede na `/predplatne/zrusit?id=4812`. Proč je to špatně? Vyber nejpřesnější důvod.

### --answer--

GET je pomalejší než POST.

#### --why--

Rychlostí se metody neliší. Liší se tím, co s nimi smí prohlížeč a další programy dělat.

### --correct--

Akce mění data na serveru, ale GET adresa jde uložit, sdílet a znovu otevřít, takže se předplatné zruší i omylem.

#### --why--

GET má jen číst. Odkaz s akcí stačí otevřít z historie nebo ho nechat načíst náhledem v chatu, a akce proběhne.

### --answer--

GET neumí poslat číslo, jen text.

#### --why--

Obě metody posílají všechno jako text, i čísla. Rozdíl je jinde.

### --see--

html-formulare/jak-funguje-formular#get-nebo-post
:::

:::explain
Vysvětli vlastními slovy, proč se hodnota pole neodešle, když pole nemá atribut `name`.

## --model--
Formulář se odesílá jako sada dvojic **jméno = hodnota**. Jméno té dvojice je právě
`name` — bez něj prohlížeč nemá, jak hodnotu pojmenovat, takže ji do požadavku vůbec
nezařadí. Není to chyba ani varování, pole prostě zmizí. Proto je `name` to jediné, co
o poli opravdu rozhoduje: `id` slouží k propojení s popiskem, `placeholder` a třídy jsou
pro člověka a pro vzhled, ale pro server existuje jen to, co má jméno.

## --checklist--
- Odesílají se dvojice jméno a hodnota.
- Jméno dvojice určuje atribut `name`.
- Bez `name` se pole do požadavku nedostane.
- `id`, `placeholder` ani třídy odeslání neovlivní.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Heslo nebo osobní údaje metodou GET.** Příznak: po přihlášení vidíš v adresním řádku `?password=…`. Oprava: `method="post"` u každého formuláře s citlivými údaji nebo s akcí, která něco mění.

> [!PITFALL]
> **`name` s překlepem nebo jiný, než čeká server.** Příznak: server hlásí „chybí e-mail", i když ho uživatel vyplnil, a v Payload vidíš `e-mail=…` místo `email=…`. Oprava: `name` musí přesně odpovídat klíči, který čte server, včetně velkých písmen.

> [!PITFALL]
> **Pořadí tlačítek rozhoduje o Enteru.** Příznak: Enter v poli „Uloží koncept" místo odeslání. Oprava: hlavní odesílací tlačítko dej v HTML jako první; vzhled a pořadí na obrazovce vyřeš v CSS.

## Kde to najdeš v MDN

- [Sending form data](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Sending_and_retrieving_form_data) — `action`, `method`, GET a POST i to, jak data vypadají v DevTools.
- [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form) — všechny atributy formuláře včetně `enctype` pro nahrávání souborů.
- [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button) — hodnoty `type` a atributy `name` a `value`.
- [Implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission) — přesné pravidlo odeslání Enterem ve specifikaci HTML.

# --questions--

## --question--

Formulář filtru v e-shopu vypadá takhle a uživatel nic nezmění:

```html
<form action="/boty">
  <input type="hidden" name="category" value="bezecke">
  <label><input type="checkbox" name="stock" value="1" checked> Jen skladem</label>
  <label><input type="checkbox" name="sale" value="1"> Ve slevě</label>
  <button type="submit">Filtrovat</button>
</form>
```

Jaká adresa se otevře po kliknutí na **Filtrovat**?

### --expected--

/boty?category=bezecke&stock=1

### --why--

Formulář nemá `method`, takže platí GET a data jdou do adresy. Skryté pole se odešle, zaškrtnuté `stock` taky, nezaškrtnuté `sale` vůbec. Tlačítko nemá `name`, takže samo nic nepřidá.

### --see--

html-formulare/jak-funguje-formular#name-je-klic-value-je-hodnota

## --question--

Kolega napsal formulář `<form action="/komentare">` s polem `<textarea name="text">`. Po odeslání komentáře „Díky za návod" vidí v adrese `/komentare?text=D%C3%ADky+za+n%C3%A1vod`. Jaký atribut s hodnotou má do `<form>` doplnit, aby komentář nešel do adresy a obnovení stránky ho nepřidalo tiše podruhé?

### --expected--

method="post"

### --accept--

method=post

### --why--

Bez `method` platí GET a data jdou do adresy. Přidání komentáře mění data na serveru, takže patří do POST: data jdou v těle a prohlížeč se před opakovaným odesláním zeptá.

### --see--

html-formulare/jak-funguje-formular#get-nebo-post

## --question--

V registraci jsou tlačítka v tomto pořadí: `<button name="action" value="back">Zpět</button>` a `<button name="action" value="finish">Dokončit</button>`. Uživatel klikne na **Dokončit**, ale předtím v posledním poli omylem stiskne Enter. Co server dostal jako první?

### --answer--

`action=finish`, protože Dokončit je hlavní tlačítko.

#### --why--

Prohlížeč neví, které tlačítko je „hlavní". Řídí se typem a pořadím v HTML.

### --correct--

`action=back`, protože obě tlačítka jsou bez `type` odesílací a Zpět je v HTML první.

#### --why--

Bez `type` jsou obě `submit`. Enter použije první odesílací tlačítko v pořadí HTML, a to je Zpět. Oprava: Zpět dostane `type="button"` (nebo se stane odkazem).

### --answer--

Nic, Enter formulář s víc tlačítky neodešle.

#### --why--

Enter formulář odešle, když má formulář odesílací tlačítko — a tady má dokonce dvě.

### --see--

html-formulare/jak-funguje-formular#odeslani-enterem
