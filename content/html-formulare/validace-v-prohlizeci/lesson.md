# Validace v prohlížeči

:::check pretest
Pole označíš atributem `required`. Znamená to, že data už nemusíš kontrolovat na serveru?

### --answer--
Ano, prohlížeč uživatele bez vyplnění dál nepustí.

#### --why--
Nepustí **uživatele v prohlížeči**. Požadavek na server ale může přijít odkudkoli — třeba
z příkazové řádky, která o tvém HTML nic neví.

### --correct--
Ne. Validace v prohlížeči je pohodlí pro uživatele, ne obrana serveru.

#### --why--
Každý si může HTML upravit v DevTools nebo poslat požadavek úplně mimo prohlížeč.
Server musí kontrolovat všechno znovu.

### --answer--
Záleží na typu pole — u `type="email"` už kontrola na serveru potřeba není.

#### --why--
Typ pole na tom nic nemění. Ať je pole jakékoli, do serveru může dorazit cokoli.
:::

> [!REMEMBER]
> Validace v prohlížeči je tu **jen pro uživatele**, aby dostal okamžitou zpětnou vazbu
> a věděl, co opravit. Bezpečnost a konečná kontrola dat musí **vždy** proběhnout
> na serveru.

## Základní validační atributy

Většinu běžných kontrol umí HTML samo, bez jediného řádku JavaScriptu:

| atribut | co hlídá | na čem |
|---|---|---|
| `required` | pole nesmí zůstat prázdné | skoro všechno |
| `minlength`, `maxlength` | počet znaků | text, heslo, textarea |
| `min`, `max` | rozsah hodnoty | číslo, datum, čas |
| `step` | povolené násobky | číslo, datum, čas |
| `pattern` | shoda s regulárním výrazem | text, tel |

:::live
```html
<form>
  <p>
    <label for="jmeno">Jméno (aspoň 2 znaky)</label><br>
    <input type="text" id="jmeno" name="jmeno" required minlength="2">
  </p>
  <p>
    <label for="pocet">Počet bedýnek (1 až 5)</label><br>
    <input type="number" id="pocet" name="pocet" min="1" max="5" value="9">
  </p>
  <button>Odeslat</button>
</form>
```
```css
body { font-family: system-ui, sans-serif; padding: 1rem; }
label { font-weight: 600; }
input { padding: 0.4rem; font: inherit; }
button { padding: 0.45rem 1rem; font: inherit; }
```
:::

Zkus odeslat formulář prázdný a pak s devíti bedýnkami. Prohlížeč pokaždé zastaví
odeslání u **prvního** vadného pole, zaostří ho a ukáže bublinu ve tvém jazyce — tu
bublinu nepíšeš ty, dodá ji prohlížeč.

:::check
Pole má `min="1" max="5"` a uživatel do něj napíše `9`. Co udělá prohlížeč při odeslání?

### --correct--
Odeslání zastaví, zaostří to pole a ukáže u něj bublinu s hláškou.

#### --why--
Validace běží při odeslání. Prohlížeč se zastaví u prvního vadného pole — proto se
vyplatí mít pole v rozumném pořadí.

### --answer--
Hodnotu opraví na nejbližší povolenou, tedy `5`.

#### --why--
Nic za uživatele nepřepisuje. Šipky nahoru a dolů se rozsahem řídí, ale ručně napsanou
hodnotu prohlížeč nemění.

### --answer--
Formulář odešle, `min` a `max` jsou jen nápověda.

#### --why--
`min` a `max` jsou plnohodnotná pravidla validace. Nápověda bez vlivu na odeslání by byl
třeba `placeholder`.
:::

## Validace podle typu `type`

Velký kus práce odvede už samotný `type` — a na mobilu navíc rozhodne, jakou klávesnici
uživatel dostane:

- `type="email"` — musí vypadat jako e-mailová adresa (a na mobilu je zavináč po ruce),
- `type="url"` — musí to být adresa včetně schématu,
- `type="number"` — jen čísla, spolu s `min`, `max` a `step`,
- `type="date"` a `type="time"` — datum a čas, s vlastním výběrem,
- `type="tel"` — číselná klávesnice, ale **bez** kontroly formátu; na ten je `pattern`.

> [!PITFALL]
> `type="email"` kontroluje jen **tvar** adresy, ne její existenci. `a@b` projde.
> Jestli schránka existuje, zjistíš jediným spolehlivým způsobem: pošleš na ni
> ověřovací e-mail.

:::live predict
```html
<form>
  <label for="cena">Cena za kus (Kč)</label>
  <input type="number" id="cena" name="cena" step="0.01" value="1.005">
  <button>Odeslat</button>
</form>
```
--question-- Uživatel má v poli `1.005` a odesílá. Pustí prohlížeč formulář dál?
--option-- Ano — `step` je `0.01`, takže desetinná čísla jsou povolená.
--option*-- Ne — `1.005` není násobek `0.01`, takže pole neprojde validací.
--option-- Ano, `step` ovlivní jen šipky nahoru a dolů, ne ručně napsanou hodnotu.
--why-- `step` neurčuje počet desetinných míst, ale **povolené násobky** (počítané od `min`, jinak od nuly). `1.005` mezi násobky `0.01` nepatří, a tak prohlížeč odeslání zastaví. Šipky se `step` řídí taky, ale validace platí i pro ručně napsanou hodnotu.
:::

:::check
Chceš pole na české PSČ ve tvaru `123 45`. Který atribut na to použiješ?

### --expected--
pattern

### --accept--
atribut pattern
pattern s regulárním výrazem
:::

## CSS a validace: pseudotřídy

Stav pole si můžeš obarvit sám. CSS nabízí tři pseudotřídy:

- `:valid` — pole je v pořádku (nebo je prázdné a není povinné),
- `:invalid` — pole má chybu, **už od načtení stránky**,
- `:user-invalid` — pole má chybu **a zároveň** do něj uživatel sáhl nebo zkusil odeslat.

:::compare
```html
<form>
  <label for="mail">E-mail</label>
  <input type="email" id="mail" required placeholder="jan@example.cz">
  <p class="popis">Takhle vypadá prázdný formulář hned po načtení stránky.</p>
</form>
```
```css
body { font-family: system-ui, sans-serif; padding: 1rem; }
label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
input { padding: 0.4rem; font: inherit; border: 2px solid #999; border-radius: 4px; }
.popis { color: #555; font-size: 0.9rem; }
```
--variant-- S `:invalid`
```css
input:invalid { border-color: #c62828; background: #fdecea; }
```
--variant-- S `:user-invalid`
```css
input:user-invalid { border-color: #c62828; background: #fdecea; }
```
:::

Rozdíl je vidět hned: s `:invalid` křičí formulář na uživatele dřív, než stihl cokoli
napsat. `:user-invalid` počká, až bude mít co vytknout.

> [!TIP]
> Zelená u `:user-valid` funguje stejně a stojí za to — potvrzení, že je pole v pořádku,
> uklidní stejně, jako červená varuje.

:::check
Proč se na obarvení chyb hodí `:user-invalid` líp než `:invalid`?

### --correct--
Protože začne platit až poté, co uživatel do pole sáhl nebo zkusil odeslat — ne hned po načtení.

#### --why--
Prázdné povinné pole je od první vteřiny neplatné. S `:invalid` by tedy formulář svítil
červeně dřív, než uživatel něco udělá, a varování by ztratilo význam.

### --answer--
Protože `:invalid` se nedá použít na `input`.

#### --why--
Dá, funguje na všech polích. Rozdíl je jen v tom, **kdy** začne platit.

### --answer--
Protože `:user-invalid` kontroluje data i na serveru.

#### --why--
CSS se serveru netýká vůbec. Obě pseudotřídy jen reagují na stav pole v prohlížeči.
:::

## Když chceš chyby řešit po svém

Bubliny prohlížeče se nedají nastylovat a v každém prohlížeči vypadají jinak. Když
potřebuješ vlastní hlášky na vlastních místech, řekneš prohlížeči, ať se do toho neplete:

```html
<form novalidate>
```

Atribut `novalidate` patří na `<form>`, ne na pole. **Vypne jen bubliny a blokování
odeslání** — pravidla platí dál, takže `:user-invalid` v CSS i kontrola v JavaScriptu
fungují pořád. Tak se to obvykle používá: validace zůstane v HTML, jen si chyby vypíšeš
sám tam, kam patří.

:::check
Kam se píše atribut `novalidate` a co vypne?

### --expected--
na form a vypne bubliny

### --accept--
na formulář, vypne bubliny prohlížeče
na form, vypne prohlížečové bubliny a blokování odeslání
na značku form
:::

## Proč to nestačí

Všechno, co jsi v téhle lekci viděl, běží **na počítači uživatele**. Což znamená, že to
může kdokoli obejít, a nemusí k tomu být hacker:

- v DevTools smaže `required` nebo změní `type` a formulář odešle,
- pošle požadavek úplně bez prohlížeče (`curl`, Postman, skript),
- má starý prohlížeč, který `pattern` u daného pole nezná.

Server proto musí zkontrolovat **všechno znovu**, jako by v prohlížeči žádná validace
nebyla. Validace v HTML tím neztrácí smysl: ušetří uživateli cestu na server a zpátky
a řekne mu chybu okamžitě. Jen to není bezpečnost.

:::check
Napiš, co musí udělat server s daty, která prošla validací v prohlížeči.

### --expected--
zkontrolovat je znovu

### --accept--
ověřit je znovu
validovat je znovu
zkontrolovat všechno znovu
:::

## Kde to najdeš v MDN

- [Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) — přehled atributů i příklady.
- [`:user-invalid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid) — včetně tabulky podpory.
- [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation) — až budeš chtít stavy číst z JavaScriptu.

# --questions--

## --question--

Kam se píše atribut `novalidate` a co udělá?

### --answer--

Zabrání odeslání dat, píše se na `input`.

#### --why--

Píše se na `<form>` a odeslání naopak povolí i s chybami — jen vypne bubliny prohlížeče.

### --correct--

Vypne bubliny prohlížeče a blokování odeslání; píše se na `<form>`.

#### --why--

Pravidla v HTML přitom platí dál, takže `:user-invalid` v CSS i kontrola v JavaScriptu
fungují. Používá se, když chceš chyby vypisovat na vlastních místech.

### --answer--

Vypne validaci úplně, včetně pseudotříd v CSS; píše se na `<form>`.

#### --why--

Pseudotřídy fungují dál — `novalidate` mění jen chování prohlížeče při odeslání,
ne platnost polí.

### --see--

html-formulare/validace-v-prohlizeci#kdyz-chces-chyby-resit-po-svem

## --question--

Napiš atribut, kterým pole omezíš na nejvýš 200 znaků.

### --expected--

maxlength="200"

### --accept--

maxlength=200
maxlength

### --why--

`maxlength` navíc uživateli víc znaků rovnou nedovolí napsat — narozdíl od `minlength`,
který se projeví až při odeslání. Na serveru se délka stejně kontroluje znovu.

### --see--

html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy

## --question--

Pole má `type="email"` a uživatel zadá `a@b`. Projde validací v prohlížeči?

### --correct--

Ano — tvar odpovídá, i když taková schránka skoro jistě neexistuje.

#### --why--

`type="email"` kontroluje jen tvar, ne existenci. Jestli adresa funguje, zjistíš jedině
tím, že na ni pošleš ověřovací e-mail.

### --answer--

Ne, chybí doména nejvyššího řádu (`.cz`, `.com`).

#### --why--

Specifikace ji nevyžaduje — adresy na vnitrofiremních doménách bez tečky jsou platné.

### --answer--

Ne, prohlížeč adresu ověří dotazem na poštovní server.

#### --why--

Nic takového prohlížeč nedělá. Byl by to dotaz do sítě u každého stisku klávesy.

### --see--

html-formulare/validace-v-prohlizeci#validace-podle-typu-type

## --question--

Proč se nedá věřit datům z klienta, i když máš všude `required` a `type="email"`?

### --answer--

Protože by kontrola na klientovi byla pomalá.

#### --why--

Naopak, kontrola v prohlížeči je nejrychlejší možná — nečeká na server. Problém je
v bezpečnosti, ne v rychlosti.

### --correct--

Protože kdokoli si HTML upraví v DevTools nebo pošle požadavek úplně bez prohlížeče.

#### --why--

Validace v HTML je pro uživatele, ne pro obranu. Server dostává jen HTTP požadavek
a nemá jak poznat, jestli přišel z tvého formuláře.

### --answer--

Protože starší prohlížeče `required` neumí.

#### --why--

`required` umí všechny hlavní prohlížeče přes deset let. I kdyby ne, na požadavek
poslaný mimo prohlížeč to nemá vliv.

### --see--

html-formulare/validace-v-prohlizeci#proc-to-nestaci

## --question--

Napiš, čím se liší `:invalid` a `:user-invalid`.

### --expected--

user-invalid platí až po interakci

### --accept--

user-invalid se projeví až když uživatel do pole sáhl
invalid platí hned od načtení, user-invalid až po interakci
user-invalid až po odeslání nebo psaní

### --why--

Prázdné povinné pole je neplatné od první vteřiny, takže s `:invalid` svítí formulář
červeně dřív, než uživatel cokoli udělá. `:user-invalid` počká, až bude co vytknout.

### --see--

html-formulare/validace-v-prohlizeci#css-a-validace-pseudotridy
