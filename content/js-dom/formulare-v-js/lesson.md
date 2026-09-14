# Formuláře v JavaScriptu

:::check pretest
Ve formuláři je `<input type="number" name="guests" value="4">`. Co vrátí `typeof new FormData(form).get('guests')`?

### --answer--

`'number'`, protože pole má `type="number"`.

#### --why--

Typ pole ovlivní klávesnici na telefonu a validaci. Co z formuláře vychází, uvidíš v části o `FormData`.

### --correct--

`'string'`

#### --why--

Formulář posílá všechno jako text, i čísla. Převést je musíš sám — víc v části o `FormData`.

### --answer--

`'undefined'`, `FormData` čísla nečte.

#### --why--

`FormData` přečte každé pole s atributem `name`. Jakou hodnotu vrací, ukáže část o `FormData`.
:::

:::check pretest
Zaškrtávací políčko `<input type="checkbox" name="newsletter">` uživatel nezaškrtl. Co vrátí `new FormData(form).get('newsletter')`?

### --answer--

`false`

#### --why--

Rozumný odhad, ale formulář nepracuje s `true` a `false`. Jak zachází s políčky, vysvětlí část o `FormData`.

### --answer--

`'off'`

#### --why--

`'on'` je výchozí hodnota zaškrtnutého políčka. Co se stane s nezaškrtnutým, uvidíš v části o `FormData`.

### --correct--

`null`

#### --why--

Nezaškrtnuté políčko se do dat formuláře vůbec nedostane, a `get` pro chybějící jméno vrací `null`.
:::

Přihláška na závod, objednávka v e-shopu, registrace do aplikace, filtr v administraci. Formuláře jsou místo, kde web od lidí dostává data — a kde je nejsnáz ztratí: stránka se znovu načte a vyplněná pole zmizí, chyba se ukáže jen červeným rámečkem, který nevidí nevidomý ani barvoslepý, nebo formulář odešle nesmysl, protože kontrolu dělal jen JavaScript.

> [!REMEMBER]
> **Formulář už umí sbírat data i kontrolovat pravidla. JavaScript z něj data přečte přes `FormData`, zeptá se na chyby přes `validity` a ukáže je tak, aby je uviděl každý.**

## Odeslání: `submit` a `preventDefault`

Na odeslání formuláře reaguješ **událostí `submit` na formuláři**. Přijde po kliknutí na tlačítko i po Enteru v poli. Výchozí akcí je poslat data na adresu z atributu `action` a načíst stránku znovu — když formulář zpracováváš sám, zrušíš ji hned na začátku přes `event.preventDefault()`.

`submit` přijde jen tehdy, když prohlížeč nenašel chybu v pravidlech jako `required`. S neplatným polem ukáže bublinu s chybou a událost nevyvolá.

:::live
```html
<form class="newsletter">
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required placeholder="eva@example.cz">
  <button>Odebírat</button>
  <p class="newsletter__status" role="status"></p>
</form>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.newsletter { display: grid; gap: 0.5rem; max-width: 20rem; }
input, button { font: inherit; padding: 0.55rem 0.75rem; border-radius: 0.5rem; border: 1px solid #cbd5e1; }
button { background: #0f766e; color: white; border: 0; cursor: pointer; }
.newsletter__status { color: #0f766e; min-height: 1.5em; margin: 0; }
```
```js
const form = document.querySelector('.newsletter');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = form.elements.email.value;
  form.querySelector('.newsletter__status').textContent = `Hotovo, pošleme to na ${email}.`;
  form.reset();
});
```
:::

Zkus odeslat prázdné pole, pak adresu bez zavináče a nakonec platnou adresu. Posluchač se spustí jen v posledním případě. Pole najdeš přes `form.elements.jméno` — podle atributu `name` (nebo `id`).

Když potřebuješ formulář odeslat z kódu, použij `form.requestSubmit()`. Chová se jako kliknutí na tlačítko: zkontroluje pravidla a vyvolá `submit`. Starší `form.submit()` obojí přeskočí a data rovnou odešle.

> [!PITFALL]
> **`form.submit()` obejde tvůj posluchač i validaci.** Příznak: formulář odešle i prázdná povinná pole a stránka se znovu načte, jako by tvůj kód neexistoval. Oprava: `form.requestSubmit()`.

:::check
Uživatel vyplní formulář a stiskne v posledním poli Enter. Který posluchač se spustí?

### --answer--

`click` na tlačítku — ten se ale spustí jen po kliknutí myší.

#### --why--

Enter v poli formuláře ve skutečnosti odešle formulář. Co se tedy vyvolá?

### --correct--

`submit` na formuláři.

#### --why--

Kliknutí na tlačítko i Enter v poli končí odesláním, a tedy událostí `submit`. Proto se posluchač dává na formulář.

### --answer--

`keydown` na formuláři a o odeslání se musíš postarat sám.

#### --why--

`keydown` se sice vyvolá taky, ale odeslání Enterem zařídí prohlížeč. O `keydown` se starat nemusíš.

### --see--

js-dom/formulare-v-js#odeslani-submit-a-preventdefault
:::

## Data z formuláře: `FormData`

Pole nemusíš číst jedno po druhém. `new FormData(form)` vezme všechna pole s atributem `name` a vrátí jejich hodnoty:

- `data.get('email')` — hodnota pole, nebo `null`, když takové jméno v datech není,
- `data.getAll('tags')` — pole všech hodnot, když má víc polí stejné jméno (skupina zaškrtávacích políček),
- `Object.fromEntries(data)` — obyčejný objekt `{ email: '…', guests: '4' }`, když data posíláš dál.

Pravidla, na kterých se chybuje: **hodnoty jsou vždycky řetězce**, pole bez `name` a pole s atributem `disabled` v datech nejsou, a nezaškrtnuté políčko nebo nevybraný přepínač tam také nejsou.

:::live js predict
```js
document.body.innerHTML = `
  <form>
    <input name="name" value="Eva">
    <input name="guests" type="number" value="2">
    <input type="checkbox" name="diet" value="vegan" checked>
    <input type="checkbox" name="diet" value="bezlepkové" checked>
    <input type="checkbox" name="parking">
  </form>`;
const data = new FormData(document.querySelector('form'));
const order = Object.fromEntries(data);

console.log(order.guests + 1, order.diet, order.parking);
```
--question-- Co vypíše `console.log`? Hodnoty odděl mezerou.
--expected-- 21 bezlepkové undefined
--why-- Počet hostů je řetězec `'2'` a `'2' + 1` spojí text na `'21'`. `Object.fromEntries` si ze dvou hodnot `diet` nechá jen poslední — obě dostaneš přes `data.getAll('diet')`. Nezaškrtnuté `parking` v datech není vůbec, takže v objektu chybí. Zkus vypsat `data.getAll('diet')` a `Number(order.guests) + 1`.
:::

> [!PITFALL]
> **Čísla z formuláře se sčítají jako text.** `data.get('guests') + 1` dá `'21'`. Oprava: `Number(data.get('guests'))`, nebo přímo z pole `form.elements.guests.valueAsNumber` (u prázdného pole vrací `NaN`).

:::check
Formulář má skupinu políček `<input type="checkbox" name="sizes" value="S">`, `…value="M"`, `…value="L"`. Uživatel zaškrtl S a L. Napiš výraz, který z `data = new FormData(form)` vrátí `['S', 'L']`.

### --expected--

data.getAll('sizes')

### --why--

`get` vrací jen první hodnotu daného jména, `getAll` všechny. Nezaškrtnuté `M` v datech není.

### --see--

js-dom/formulare-v-js#data-z-formulare-formdata
:::

## `input`, nebo `change`

Dvě události, které hlásí změnu hodnoty, se liší okamžikem:

- `input` — **při každé změně**: každé písmeno, vložení textu, posun posuvníku,
- `change` — **když uživatel změnu dokončí**: u textového pole až při opuštění pole (nebo Enteru), u políčka, přepínače a `<select>` hned po výběru.

Obě ukázky se liší jen jménem události. Napiš do obou polí pár slov, pak klikni vedle:

:::compare
```html
<label for="bio">Krátce o sobě</label>
<textarea id="bio" maxlength="80" rows="3"></textarea>
<p class="counter"><span class="counter__value">0</span> / 80 znaků</p>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
textarea { display: block; width: 100%; font: inherit; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #cbd5e1; }
.counter { color: #475569; }
```
```js
const bio = document.querySelector('#bio');
const counter = document.querySelector('.counter__value');
const update = () => {
  counter.textContent = bio.value.length;
};
```
--variant-- input
```js
bio.addEventListener('input', update);
```
--variant-- change
```js
bio.addEventListener('change', update);
```
:::

Počítadlo znaků, živé hledání nebo náhled patří na `input`. `change` se hodí tam, kde je každá změna drahá (uložení na server) nebo kde uživatele nechceš rušit uprostřed psaní.

:::check
Filtr produktů má reagovat na výběr v `<select>` s kategorií hned, jak uživatel zvolí možnost. Stačí `change`?

### --correct--

Ano. U `<select>` přijde `change` hned po výběru možnosti.

#### --why--

Na opuštění pole čeká `change` jen u textových polí. Výběr v `<select>` je hotová změna sama o sobě.

### --answer--

Ne, `change` přijde až po opuštění `<select>`, musí to být `input`.

#### --why--

Myslíš si, že `change` čeká na opuštění u všech polí? Tak se chová jen u textových polí.

### --answer--

Ne, `<select>` hlásí jen událost `click`.

#### --why--

Výběr jde udělat i klávesnicí, bez kliknutí. `<select>` hlásí `input` i `change`.

### --see--

js-dom/formulare-v-js#input-nebo-change
:::

## Validace, kterou umí prohlížeč

Většinu pravidel zapíšeš do HTML: `required`, `type="email"`, `min` a `max`, `minlength`, `maxlength`, `pattern`. Prohlížeč je hlídá sám a JavaScript se ho na výsledek zeptá přes **Constraint Validation API**:

| co | co vrací |
|---|---|
| `field.checkValidity()` | `true`/`false`; neplatné pole vyvolá událost `invalid` |
| `form.checkValidity()` | `true`, když jsou platná všechna pole |
| `field.reportValidity()` | jako `checkValidity`, navíc ukáže bublinu s chybou |
| `field.validity` | objekt s důvody: `valueMissing`, `typeMismatch`, `patternMismatch`, `tooShort`, `rangeUnderflow`, `rangeOverflow`, `customError`, `valid` |
| `field.validationMessage` | text chyby v jazyce prohlížeče |

Podle `validity` napíšeš vlastní srozumitelnou hlášku („Zadej e-mail se zavináčem") místo obecné. A v CSS máš pseudotřídu `:user-invalid`: platí pro neplatné pole, **až když s ním uživatel pracoval** — prázdný formulář tedy nesvítí červeně hned po načtení, na rozdíl od `:invalid`.

:::live
```html
<label for="phone">Telefon (9 číslic)</label>
<input id="phone" name="phone" inputmode="numeric" required pattern="[0-9]{9}">
<pre class="state"></pre>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
input { display: block; font: inherit; padding: 0.5rem; border-radius: 0.5rem; border: 2px solid #cbd5e1; transition: border-color 0.2s; }
input:user-invalid { border-color: #dc2626; }
input:valid { border-color: #16a34a; }
.state { background: #f1f5f9; padding: 0.75rem; border-radius: 0.5rem; }
```
```js
const phone = document.querySelector('#phone');
const state = document.querySelector('.state');

function show() {
  const { valid, valueMissing, patternMismatch } = phone.validity;
  state.textContent = JSON.stringify({ valid, valueMissing, patternMismatch }, null, 2);
}

phone.addEventListener('input', show);
show();
```
:::

Piš do pole písmena, pak osm číslic a nakonec devět. Sleduj, jak se mění `validity`. Zkus v CSS nahradit `:user-invalid` za `:invalid` a obnov ukázku — pole bude červené dřív, než do něj cokoli napíšeš.

> [!PITFALL]
> **`minlength` a `maxlength` hlídají jen text, který napsal uživatel.** Hodnotu nastavenou skriptem (`field.value = 'abc'`) za krátkou nepovažují a `checkValidity()` vrátí `true`. Příznak: automatický test nebo předvyplněný formulář projde, i když je text krátký. Oprava: když délku potřebuješ ověřit vždycky, zkontroluj `value.length` sám.

:::check
Pole `<input type="email" required>` obsahuje text `eva.example.cz`. Která vlastnost `validity` bude `true`?

### --answer--

`valueMissing`

#### --why--

Pole není prázdné, hodnota v něm je. `valueMissing` hlídá jen `required` u prázdného pole.

### --correct--

`typeMismatch`

#### --why--

Text neodpovídá typu pole — e-mail bez zavináče. Na tuhle chybu je `typeMismatch`.

### --answer--

`patternMismatch`

#### --why--

`patternMismatch` patří k atributu `pattern`, který pole nemá. Formát e-mailu hlídá sám `type`.

### --see--

js-dom/formulare-v-js#validace-kterou-umi-prohlizec
:::

## Vlastní pravidla: `setCustomValidity`

Některá pravidla HTML nezapíše: „heslo znovu" se musí shodovat s heslem, datum odjezdu musí být po příjezdu, uživatelské jméno nesmí být obsazené. Na ně je `field.setCustomValidity('text chyby')`: pole se stane neplatným (`validity.customError`), formulář ho při odeslání zastaví a text se objeví ve `validationMessage`.

Háček je v tom, že **chyba zůstává, dokud ji nesmažeš**. Pole se nezkontroluje znovu samo od sebe — musíš zavolat `setCustomValidity('')`, jakmile je hodnota v pořádku.

:::live js predict
```js
document.body.innerHTML = '<input id="password"><input id="confirm">';
const password = document.querySelector('#password');
const confirm = document.querySelector('#confirm');

password.value = 'horskaChata7';
confirm.value = 'horskachata7';
confirm.setCustomValidity('Hesla se neshodují.');

confirm.value = 'horskaChata7';
console.log(confirm.checkValidity());
```
--question-- Co vypíše `console.log`?
--expected-- false
--why-- Hesla se už shodují, ale vlastní chyba na poli pořád visí. `setCustomValidity` nic nepřepočítává — pole je neplatné, dokud nezavoláš `confirm.setCustomValidity('')`. Proto se pravidlo píše do posluchače `input`, který chybu při každé změně nastaví, nebo smaže. Zkus přidat `confirm.setCustomValidity('')` před výpis.
:::

```js
function checkPasswordsMatch() {
  // 1. prázdný text = pole je v pořádku, jinak text chyby
  const message = confirm.value === password.value ? '' : 'Hesla se neshodují.';
  confirm.setCustomValidity(message);
}

password.addEventListener('input', checkPasswordsMatch);
confirm.addEventListener('input', checkPasswordsMatch);
```

:::check
Formulář po jedné chybě v poli „Uživatelské jméno" už nejde odeslat, i když uživatel jméno opravil. V posluchači je `if (taken) username.setCustomValidity('Jméno je obsazené.');`. Co chybí?

### --answer--

`username.reportValidity()` po opravě.

#### --why--

`reportValidity` chybu jen ukáže. Vlastní chyba na poli zůstane viset dál.

### --correct--

Větev, která pro volné jméno zavolá `username.setCustomValidity('')`.

#### --why--

Vlastní chybu smaže jen prázdný text. Bez něj pole zůstane neplatné napořád.

### --answer--

Atribut `novalidate` na formuláři.

#### --why--

`novalidate` vypne bubliny prohlížeče při odeslání, ale chyba ve `validity` zůstane a tvůj kód ji dál uvidí.

### --see--

js-dom/formulare-v-js#vlastni-pravidla-setcustomvalidity
:::

## Chyby, které uvidí každý

Bubliny prohlížeče zmizí po pár vteřinách, nejdou nastylovat a čtečky je hlásí různě. V praxi proto formulář dostane atribut `novalidate` (prohlížeč bubliny neukáže a `submit` přijde vždycky) a chyby vypíše JavaScript. Pravidla v HTML a `validity` přitom používáš dál.

Aby chybu zaznamenal i člověk, který nevidí barvy nebo používá čtečku obrazovky, platí čtyři pravidla:

1. **Text, ne jen barva.** Pod polem je hláška, která říká, co opravit: „Zadej e-mail ve tvaru jmeno@domena.cz", ne „Neplatný vstup".
2. **Hláška je s polem propojená** přes `aria-describedby="id-hlášky"`, takže ji čtečka přečte, když se uživatel na pole vrátí.
3. **Pole je označené** `aria-invalid="true"`, dokud je chybné.
4. **Fokus skočí na první chybné pole** — uživatel klávesnice ani nemusí hledat, kde je problém.

A časování: po odeslání ukaž všechny chyby, pak je při psaní (`input`) průběžně mazej, jakmile je pole v pořádku.

:::live
```html
<form class="signup" novalidate>
  <div class="field">
    <label for="runner-name">Jméno a příjmení</label>
    <input id="runner-name" name="name" required aria-describedby="runner-name-error">
    <p class="field__error" id="runner-name-error"></p>
  </div>
  <div class="field">
    <label for="runner-email">E-mail</label>
    <input id="runner-email" name="email" type="email" required aria-describedby="runner-email-error">
    <p class="field__error" id="runner-email-error"></p>
  </div>
  <button>Přihlásit se</button>
</form>
```
```css
body { font-family: system-ui, sans-serif; margin: 1rem; }
.signup { display: grid; gap: 1rem; max-width: 22rem; }
.field { display: grid; gap: 0.25rem; }
input { font: inherit; padding: 0.5rem 0.75rem; border-radius: 0.5rem; border: 2px solid #cbd5e1; }
input[aria-invalid="true"] { border-color: #dc2626; background: #fef2f2; }
.field__error { margin: 0; min-height: 1.25em; color: #b91c1c; font-size: 0.9rem; }
button { font: inherit; padding: 0.6rem; border: 0; border-radius: 0.5rem; background: #1d4ed8; color: white; cursor: pointer; }
```
```js
const form = document.querySelector('.signup');

// 1. srozumitelná hláška podle důvodu z validity
function messageFor(field) {
  if (field.validity.valueMissing) return 'Tohle pole je povinné.';
  if (field.validity.typeMismatch) return 'Zadej e-mail ve tvaru jmeno@domena.cz.';
  return '';
}

// 2. hláška pod polem a aria-invalid podle stavu pole
function showError(field) {
  const message = messageFor(field);
  document.getElementById(field.getAttribute('aria-describedby')).textContent = message;
  field.setAttribute('aria-invalid', String(message !== ''));
  return message === '';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('input')];
  const results = fields.map((field) => showError(field));
  // 3. fokus na první chybné pole
  const firstInvalid = fields[results.indexOf(false)];
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }
  form.replaceChildren('Přihláška odeslána. Uvidíme se na startu.');
});

// 4. při opravě chybu průběžně smaž
form.addEventListener('input', (event) => {
  if (event.target.getAttribute('aria-invalid') === 'true') showError(event.target);
});
```
:::

Odešli prázdný formulář a sleduj, kam skočí fokus. Pak napiš jméno a sleduj, kdy zmizí jeho chyba. Zkus odstranit `novalidate` a porovnej, co se stane po odeslání.

:::explain
Vysvětli, proč nestačí chybné pole obarvit červeně a proč se po odeslání přesouvá fokus.

## --model--

Barvu nevidí nevidomý uživatel se čtečkou obrazovky a část lidí nerozliší červenou od zelené. Proto chyba potřebuje text, který říká, co opravit, a atributy `aria-invalid` a `aria-describedby`, aby ji čtečka u pole ohlásila. Fokus na první chybné pole pomáhá uživatelům klávesnice a čteček: nemusí formulář procházet a hledat, co se pokazilo, protože se ocitnou přímo u problému a hned slyší jeho popis.

## --checklist--

- Barvu chyby nevidí každý (čtečka obrazovky, barvoslepost).
- Chyba potřebuje text, který říká, co opravit.
- `aria-describedby` propojí text chyby s polem, `aria-invalid` označí chybné pole.
- Fokus na prvním chybném poli ušetří hledání uživatelům klávesnice a čteček.
:::

:::check
Proč má formulář s vlastními hláškami atribut `novalidate`, když pravidla jako `required` pořád používá?

### --answer--

Aby prohlížeč pravidla vůbec nekontroloval a všechno si hlídal JavaScript.

#### --why--

Kontrola běží dál: `validity` i `checkValidity()` fungují i s `novalidate`.

### --correct--

Aby prohlížeč při odeslání neukazoval vlastní bubliny a vždycky vyvolal `submit`, ve kterém chyby vypíše tvůj kód.

#### --why--

`novalidate` vypne jen zastavení odeslání a bubliny. Pravidla a `validity` zůstanou, a tvůj kód je použije pro vlastní hlášky.

### --answer--

Kvůli starším prohlížečům, které `required` neznají.

#### --why--

`required` znají všechny dnešní prohlížeče. `novalidate` řeší vzhled a načasování chyb.

### --see--

js-dom/formulare-v-js#chyby-ktere-uvidi-kazdy
:::

## Typické chyby a pasti

### Kontrola jen v JavaScriptu

> [!PITFALL]
> **Kontrola v prohlížeči není ochrana.** Kdokoli ji obejde — vypne JavaScript, upraví HTML v DevTools nebo pošle požadavek přímo na server. Validace v prohlížeči je pohodlí pro uživatele. Server musí stejná pravidla ověřit znovu; to se naučíš v sekci o návrhu API.

### Pole bez `name`

> [!PITFALL]
> **`FormData` pole nenajde.** Příznak: `data.get('phone')` vrací `null`, i když je telefon vyplněný. Příčina: pole má jen `id`, ne `name`. Oprava: `<input id="phone" name="phone">`.

### `disabled` místo `readonly`

> [!PITFALL]
> **Zablokované pole se neodešle.** `disabled` vyřadí pole z dat formuláře i z validace. Příznak: hodnota, kterou uživatel vidí (třeba předvyplněná cena), v datech chybí. Oprava: pole, které se nemá upravovat, ale odeslat ano, dostane `readonly`.

### Chyba, která nezmizí

> [!PITFALL]
> **Formulář nejde odeslat ani po opravě.** Příčina: `setCustomValidity('…')` bez větve, která chybu smaže přes `setCustomValidity('')`. Oprava: nastav text chyby i prázdný text v jednom posluchači `input` podle aktuální hodnoty.

:::check
Posluchač `submit` spočítá celkovou cenu `data.get('adults') * 450 + data.get('children') * 200` a výsledek je správný, ale `data.get('adults') + data.get('children')` pro 2 dospělé a 1 dítě vrátí `'21'`. Proč první výpočet funguje?

### --answer--

Protože `data.get` u polí `type="number"` vrací čísla.

#### --why--

Kdyby vracel čísla, druhý výpočet by dal `3`. Oba výpočty dostávají řetězce.

### --correct--

Operátor `*` řetězce převede na čísla, kdežto `+` s řetězcem spojuje text.

#### --why--

`'2' * 450` je `900`, ale `'2' + '1'` je `'21'`. Spoléhat se na to nevyplatí — převáděj hodnoty z formuláře přes `Number` hned při čtení.

### --answer--

Protože násobení má přednost před sčítáním.

#### --why--

Přednost operátorů určuje pořadí výpočtu, ne typ hodnot. Rozhoduje, co s řetězcem udělá `*` a co `+`.

### --see--

js-dom/formulare-v-js#data-z-formulare-formdata
:::

Příště z toho postavíš přihlášku na závod: validaci s vlastními hláškami, pravidlo podle věku a přehled odeslaných údajů.

## Kde to najdeš v MDN

- [Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) — pravidla v HTML, Constraint Validation API a vlastní hlášky s ukázkami.
- [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) — všechny metody včetně `getAll` a `entries`.
- [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) — seznam důvodů neplatnosti a k čemu který patří.
- [aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid) — kdy pole označit a jak ho propojit s textem chyby.

# --questions--

## --question--

Co vypíše tenhle kód?

```js
document.body.innerHTML = '<form><input name="city" value="Plzeň" disabled><input name="zip" value="30100"></form>';
const data = new FormData(document.querySelector('form'));
console.log(data.get('city'), data.get('zip'));
```

### --expected--

null 30100

### --why--

Pole s `disabled` se do dat formuláře nedostane, a `get` pro chybějící jméno vrací `null`. Hodnota, která se má odeslat a nemá se upravovat, patří do pole s `readonly`.

### --see--

js-dom/formulare-v-js#disabled-misto-readonly

## --question--

Posluchač hledání má výsledky filtrovat při každém napsaném písmenu. Kterou událost pole použiješ?

### --expected--

input

### --why--

`input` přijde po každé změně hodnoty. `change` by u textového pole přišel až po opuštění pole nebo Enteru.

### --see--

js-dom/formulare-v-js#input-nebo-change

## --question--

Formulář má `novalidate` a posluchač `submit` s `event.preventDefault()`. Kterým voláním zjistíš na začátku posluchače, jestli jsou **všechna** pole platná?

### --answer--

`event.target.validity.valid`

#### --why--

`validity` mají jednotlivá pole, formulář ne. Na celý formulář se ptáš metodou.

### --correct--

`form.checkValidity()`

#### --why--

`checkValidity()` na formuláři vrátí `true`, jen když jsou platná všechna jeho pole, a `novalidate` na to nemá vliv.

### --answer--

`form.requestSubmit()`

#### --why--

`requestSubmit` formulář odešle (když na to je), ale nic nevrací — na platnost se jím nezeptáš.

### --see--

js-dom/formulare-v-js#validace-kterou-umi-prohlizec
