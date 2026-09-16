# Komponenty a props

Na stránce festivalu jsi napsal tři sekce, které se od sebe lišily jen daty. V každé aplikaci, kterou v práci potkáš, je přesně tohle vyřešené jednou komponentou, které se pokaždé pošlou jiné údaje: karta produktu v e-shopu, řádek objednávky v administraci, dlaždice v dashboardu.

:::check pretest
Komponenta je funkce. Jak podle tebe dostane data od té komponenty, která ji vykresluje?

### --answer--

Přečte si je z globální proměnné.

#### --why--

Globální proměnná by fungovala pro jednu kartu, ale ne pro deset různých. Ke komponentě se data dostanou stejnou cestou jako do každé jiné funkce.

### --correct--

Jako parametr, který se v JSX zapíše jako atribut značky.

#### --why--

Přesně tak. Jak se ten parametr jmenuje a co v něm je, uvidíš hned v první části.

### --answer--

Komponenta si o ně řekne Reactu funkcí `getProps()`.

#### --why--

Nic takového v Reactu není. Komponenta je obyčejná funkce a data dostane jako obyčejná funkce.
:::

:::check pretest
Vykreslíš seznam deseti položek z pole. Co myslíš, že se stane, když každé položce dáš `key={index}` a pak první položku smažeš?

### --expected-- ignore-case

posunou se

### --accept--

klíče se posunou
React je spáruje špatně
zbytek položek dostane cizí klíč
posune se to
:::

## Problém: tři karty, jeden rozdíl

Tohle je kód, který jsi napsal ve workshopu — jenom zkrácený na dvě karty. Všimni si, co se v nich vlastně mění.

:::live react
```jsx
export default function Ceník() {
  return (
    <ul className="ceník">
      <li className="karta">
        <h3>Jednodenní</h3>
        <p className="karta__cena">790 Kč</p>
        <p>Pátek nebo sobota, podle toho, koho chceš vidět.</p>
      </li>
      <li className="karta">
        <h3>Dvoudenní</h3>
        <p className="karta__cena">1 290 Kč</p>
        <p>Oba dny, obě pódia, nejlepší poměr cena/kapela.</p>
      </li>
    </ul>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; background: #f8fafc; }
.ceník { display: flex; gap: 1rem; list-style: none; margin: 0; padding: 0; }
.karta { flex: 1; padding: 1rem 1.25rem; background: #fff; border-radius: .9rem; box-shadow: 0 1px 3px rgb(15 23 42 / .12); }
.karta h3 { margin: 0 0 .25rem; }
.karta p { margin: 0; }
.karta__cena { font-size: 1.4rem; font-weight: 800; color: #0f766e; }
```
:::

Zkus do seznamu přidat třetí kartu: zkopíruješ osm řádků a přepíšeš v nich tři hodnoty. Ve chvíli, kdy se změní vzhled karty, opravuješ tři místa a na jedno zapomeneš.

:::check
Kolik řádků v obou kartách se od sebe liší a kolik je jich úplně stejných? Napiš jen ten první počet.

### --expected--

3

### --accept--

tři
3 řádky

### --why--

Liší se nadpis, cena a popis — tedy data. Zbytek značkování je v obou kartách znak po znaku stejný, a proto se dá napsat jednou a data do něj posílat.
:::

> [!REMEMBER]
> **[[Props]] jsou parametry komponenty: rodič je pošle dolů jako atributy značky a potomek je dostane v jednom objektu.** Komponenta je tím pádem šablona — značkování napíšeš jednou a pokaždé do něj přijdou jiná data.

## Props jsou parametry komponenty

Komponenta dostává **jediný parametr**: objekt se všemi atributy, které jí rodič napsal. Zvykem je jmenovat ho `props`.

:::live react
```jsx
function Vstupenka(props) {
  return (
    <li className="karta">
      <h3>{props.nazev}</h3>
      <p className="karta__cena">{props.cena} Kč</p>
      <p>{props.popis}</p>
    </li>
  );
}

export default function Ceník() {
  return (
    <ul className="ceník">
      <Vstupenka nazev="Jednodenní" cena={790} popis="Pátek nebo sobota, podle toho, koho chceš vidět." />
      <Vstupenka nazev="Dvoudenní" cena={1290} popis="Oba dny, obě pódia, nejlepší poměr cena/kapela." />
    </ul>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; background: #f8fafc; }
.ceník { display: flex; gap: 1rem; list-style: none; margin: 0; padding: 0; }
.karta { flex: 1; padding: 1rem 1.25rem; background: #fff; border-radius: .9rem; box-shadow: 0 1px 3px rgb(15 23 42 / .12); }
.karta h3 { margin: 0 0 .25rem; }
.karta p { margin: 0; }
.karta__cena { font-size: 1.4rem; font-weight: 800; color: #0f766e; }
```
:::

Zkus přidat třetí `<Vstupenka />` s vlastními údaji — jeden řádek — a pak změň v komponentě `Vstupenka` značku `<h3>` na `<h2>`: promítne se to všem kartám najednou.

Pozor na rozdíl mezi uvozovkami a složenými závorkami: `nazev="Jednodenní"` posílá **text**, `cena={790}` posílá **číslo**. Ve složených závorkách může být jakýkoli výraz — pole, objekt, funkce, další JSX.

:::live react predict
```jsx
function Cena(props) {
  return <strong>{props.hodnota + 100}</strong>;
}

export default function App() {
  return <p data-testid="cena">S poplatkem: <Cena hodnota="790" /></p>;
}
```
--question-- Co se v odstavci objeví?
--option-- `890`
--option*-- `790100`
--option-- `NaN`
--why-- `hodnota="790"` bez složených závorek posílá řetězec, ne číslo. `+` mezi řetězcem a číslem řetězce spojuje. Kdyby tam bylo `hodnota={790}`, vyšlo by 890. Proto se čísla, `true`/`false` a všechno kromě textu píše do složených závorek.
:::

:::check
Komponenta `Odznak` má dostat text `Novinka` a číslo `3`. Napiš, jak ji v JSX použiješ, když se props jmenují `text` a `pocet`.

### --expected--

<Odznak text="Novinka" pocet={3} />

### --accept--

<Odznak pocet={3} text="Novinka" />
<Odznak text={'Novinka'} pocet={3} />

### --why--

Text smí být v uvozovkách, číslo musí být ve složených závorkách — jinak by z něj byl řetězec `"3"`.

### --see--

react-zaklady/komponenty-a-props#props-jsou-parametry-komponenty
:::

## Destrukturalizace a výchozí hodnoty

Psát `props.` před každou hodnotu je únavné. Protože props jsou obyčejný objekt, rozebereš si ho rovnou v hlavičce funkce — [destrukturalizaci](see:js-objekty/objekty#destrukturalizace-vlastnosti-rovnou-do-promennych) znáš z objektů. Rovnou při ní nastavíš i výchozí hodnoty.

:::live react
```jsx
function Vstupenka({ nazev, cena, popis = 'Popis doplníme.', mena = 'Kč' }) {
  return (
    <li className="karta">
      <h3>{nazev}</h3>
      <p className="karta__cena">
        {cena} {mena}
      </p>
      <p>{popis}</p>
    </li>
  );
}

export default function Ceník() {
  return (
    <ul className="ceník">
      <Vstupenka nazev="Jednodenní" cena={790} popis="Pátek nebo sobota." />
      <Vstupenka nazev="Dvoudenní" cena={1290} />
      <Vstupenka nazev="Pro Slováky" cena={52} mena="€" popis="Platba v eurech." />
    </ul>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; background: #f8fafc; }
.ceník { display: flex; gap: 1rem; list-style: none; margin: 0; padding: 0; }
.karta { flex: 1; padding: 1rem 1.25rem; background: #fff; border-radius: .9rem; box-shadow: 0 1px 3px rgb(15 23 42 / .12); }
.karta h3 { margin: 0 0 .25rem; }
.karta p { margin: 0; }
.karta__cena { font-size: 1.4rem; font-weight: 800; color: #0f766e; }
```
:::

Zkus druhé kartě dopsat `popis` a sleduj, jak výchozí věta zmizí. Pak `mena` smaž z první karty — nic se nestane, protože výchozí hodnota je stejná.

> [!TIP]
> Destrukturalizace v hlavičce funguje jako dokumentace: kdo komponentu otevře, vidí na prvním řádku, co všechno umí přijmout. Proto ji React komunita používá skoro vždycky.

:::live react predict
```jsx
function Cena({ hodnota = 0 }) {
  return <strong data-testid="cena">{hodnota} Kč</strong>;
}

export default function App() {
  return (
    <p>
      <Cena hodnota={null} />
    </p>
  );
}
```
--question-- Co se vypíše ve `<strong>`?
--option-- `0 Kč`
--option*-- ` Kč` (před „Kč" není nic)
--option-- `null Kč`
--why-- Výchozí hodnota se použije jen tehdy, když je prop `undefined` — tedy když ji rodič vůbec nepošle. `null` je poslaná hodnota, takže výchozí nula nenastoupí, a `null` React vykreslí jako nic. Když data můžou být `null`, ošetři to uvnitř komponenty (třeba `hodnota ?? 0`).
:::

:::check
Komponenta `Stitek` má props `text` a `barva` s výchozí hodnotou `'seda'`. Napiš její hlavičku i se destrukturalizací.

### --expected--

function Stitek({ text, barva = 'seda' })

### --accept--

function Stitek({ text, barva = 'seda' }) {
const Stitek = ({ text, barva = 'seda' }) =>

### --why--

Objekt props se rozebere přímo v seznamu parametrů a výchozí hodnota se píše rovnou k danému jménu.

### --see--

react-zaklady/komponenty-a-props#destrukturalizace-a-vychozi-hodnoty
:::

## `children`: obsah mezi značkami

Některé komponenty nemají znát svůj obsah — mají ho jen obalit. Panel, karta, dialog, sekce stránky. K tomu slouží [[children]]: zvláštní prop s tím, co rodič napsal mezi otevírací a uzavírací značku.

:::live react
```jsx
function Sekce({ nadpis, children }) {
  return (
    <section className="sekce">
      <h2>{nadpis}</h2>
      {children}
    </section>
  );
}

export default function Stránka() {
  return (
    <div>
      <Sekce nadpis="Doprava">
        <p>Z nádraží jede kyvadlová doprava každých 20 minut.</p>
        <p>Parkoviště je v areálu bývalého mlýna.</p>
      </Sekce>
      <Sekce nadpis="Občerstvení">
        <ul>
          <li>Pekárna U Mostu</li>
          <li>Polévky z Litoměřic</li>
        </ul>
      </Sekce>
    </div>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; background: #f8fafc; }
.sekce { max-width: 30rem; margin-bottom: 1rem; padding: 1rem 1.25rem; background: #fff; border-radius: .9rem; box-shadow: 0 1px 3px rgb(15 23 42 / .12); }
.sekce h2 { margin: 0 0 .5rem; font-size: 1.1rem; color: #0f766e; }
.sekce p, .sekce ul { margin: 0 0 .25rem; }
```
:::

Zkus do první sekce přidat odkaz nebo obrázek — komponenta `Sekce` o tom nic neví a vykreslí ho. To je celá její síla: obal a obsah jsou oddělené.

> [!REMEMBER]
> **`children` je prop jako každý jiný, jen se posílá jinak: obsahem mezi značkami.** Když komponenta obaluje cizí obsah, je `children` vždycky lepší než prop jménem `text`.

:::check
Kdy použiješ `children` místo obyčejného propu? Odpověz jednou větou vlastními slovy.

### --expected-- ignore-case

když komponenta obaluje obsah, který nezná

### --accept--

když komponenta jen obaluje cizí obsah
když do komponenty patří značkování, ne jen text
když obsah dodává rodič

### --why--

Prop se hodí na hodnotu (text, číslo, objekt). `children` se hodí na značkování, které dodává rodič a které komponenta jen zabalí do svého rámu.

### --see--

react-zaklady/komponenty-a-props#children-obsah-mezi-znackami
:::

## Props se nepřepisují

Props patří rodiči. Komponenta je smí číst, ale ne měnit — React s tím počítá a v přísném režimu tě na to upozorní. Když komponenta potřebuje jinou hodnotu, spočítá si ji do vlastní proměnné.

:::memory
```js
const vstupenka = { nazev: 'Dvoudenní', cena: 1290 };
const props = { data: vstupenka, sleva: true };
const cenaPoSleve = props.data.cena * 0.8;
```
--step-- 1 | rodič má objekt s daty
vstupenka -> @v
@v: { nazev: 'Dvoudenní', cena: 1290 }
--step-- 2 | props je nový objekt, ale data v něm jsou tatáž
vstupenka -> @v
props -> @p
@v: { nazev: 'Dvoudenní', cena: 1290 }
@p: { data: @v, sleva: true }
--step-- 3 | výpočet vyrobí novou hodnotu, nic nepřepíše
vstupenka -> @v
props -> @p
cenaPoSleve = 1032
@v: { nazev: 'Dvoudenní', cena: 1290 }
@p: { data: @v, sleva: true }
:::

Objekt `props` je nový, ale hodnoty v něm jsou **tytéž**, na které ukazuje rodič. Kdybys uvnitř komponenty napsal `props.data.cena = 0`, přepsal bys data rodiče — a rodič o tom neví, takže se stránka nepřekreslí. Tohle je táž past jako [mutace sdíleného objektu](see:js-objekty/reference-a-mutace#objekty-se-sdileji-pres-odkaz), jen s jinými jmény.

:::check
Komponenta dostane prop `cena` a chce ji zobrazit se slevou. Co s ní udělá?

### --answer--

Přepíše `props.cena` na novou hodnotu a vypíše ji.

#### --why--

Props patří rodiči. Přepsáním bys měnil cizí data a nikdo by o změně nevěděl.

### --correct--

Spočítá si novou hodnotu do vlastní proměnné a vypíše tu.

#### --why--

Komponenta je funkce: ze vstupu spočítá výstup a vstup nechá být.

### --answer--

Požádá rodiče, ať ji přepíše, funkcí `updateProps`.

#### --why--

Nic takového neexistuje. Když má hodnotu měnit rodič, pošle dolů funkci — k tomu se dostaneš v lekci o událostech.

### --see--

react-zaklady/komponenty-a-props#props-se-neprepisuji
:::

## Seznam z pole a `key`

Seznam vykreslíš metodou `map`, která z pole dat vyrobí pole JSX prvků. Každý prvek v takovém poli potřebuje [[key]] — jméno, podle kterého React pozná, která položka je která, když se pole příště změní.

:::live react
```jsx
const kapely = [
  { id: 'zrni', nazev: 'Zrní', cas: '21:30' },
  { id: 'mydy', nazev: 'Mydy', cas: '18:00' },
  { id: 'aid-kid', nazev: 'Aid Kid', cas: '17:00' },
];

function Radek({ nazev, cas }) {
  return (
    <li className="radek">
      <span className="radek__cas">{cas}</span> {nazev}
    </li>
  );
}

export default function Program() {
  return (
    <ul className="program">
      {kapely.map((kapela) => (
        <Radek key={kapela.id} nazev={kapela.nazev} cas={kapela.cas} />
      ))}
    </ul>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; background: #f8fafc; }
.program { max-width: 24rem; list-style: none; margin: 0; padding: 0; display: grid; gap: .4rem; }
.radek { padding: .6rem .9rem; background: #fff; border-radius: .7rem; box-shadow: 0 1px 3px rgb(15 23 42 / .12); }
.radek__cas { color: #0f766e; font-weight: 700; }
```
:::

Zkus smazat `key={kapela.id}` a podívej se do konzole náhledu: `Each child in a list should have a unique "key" prop.` Stránka bude vypadat stejně — a přesně proto se na tuhle chybu snadno zapomene.

**`key` patří na prvek, který `map` vrací**, ne dovnitř komponenty. Hodnota má být stabilní: `id` z dat, ne pořadí. S indexem (`key={index}`) React po smazání první položky spáruje druhou položku s klíčem `0`, tedy s místem, kde byla první — a přenese na ni všechno, co k tomu místu patřilo: rozepsaný text v poli, otevřené menu, běžící animaci.

> [!PITFALL]
> **`key={index}` funguje, dokud se pořadí nemění.** Příznak se ukáže až za běhu: smažeš první řádek a rozepsaný text v poli „přeskočí" na jiný řádek. Oprava: stabilní `id` z dat. Náhodné `key={Math.random()}` je ještě horší — React by při každém renderu zahodil a znovu vytvořil všechny prvky.

:::check
Kde přesně má být `key`, když v `map` vracíš vlastní komponentu `<Radek />`?

### --expected--

na `<Radek />`

### --accept--

na komponentě, kterou map vrací
na Radek
na prvku, který map vrací

### --why--

`key` čte React na tom prvku, který se v poli objeví — tedy na tom, co `map` vrací. Uvnitř komponenty už je pozdě; `key` se do props ani nedostane.

### --see--

react-zaklady/komponenty-a-props#seznam-z-pole-a-key
:::

## Podmíněné vykreslení

Ve výsledku už jsi podmínky používal: ternární operátor pro dvě varianty a `&&` pro „buď to, nebo nic". S komponentami přibývá třetí možnost — **vrátit `null`**, když se nemá vykreslit nic.

:::live react
```jsx
const vstupenky = [
  { id: 'jednodenni', nazev: 'Jednodenní', cena: 790, sleva: 0 },
  { id: 'dvoudenni', nazev: 'Dvoudenní', cena: 1290, sleva: 20 },
  { id: 'kemp', nazev: 'S kempem', cena: 1590, sleva: 0 },
];

function Sleva({ procenta }) {
  if (procenta === 0) return null;
  return <span className="sleva">−{procenta} %</span>;
}

function Vstupenka({ nazev, cena, sleva }) {
  return (
    <li className="karta">
      <h3>
        {nazev} <Sleva procenta={sleva} />
      </h3>
      <p className="karta__cena">{cena} Kč</p>
      {cena > 1000 ? <p className="karta__pozn">Lze zaplatit na splátky.</p> : null}
    </li>
  );
}

export default function Ceník() {
  return (
    <ul className="ceník">
      {vstupenky.map((typ) => (
        <Vstupenka key={typ.id} nazev={typ.nazev} cena={typ.cena} sleva={typ.sleva} />
      ))}
    </ul>
  );
}
```
```css
body { font: 16px/1.5 system-ui, sans-serif; margin: 1.5rem; color: #1f2937; background: #f8fafc; }
.ceník { display: flex; gap: 1rem; list-style: none; margin: 0; padding: 0; }
.karta { flex: 1; padding: 1rem 1.25rem; background: #fff; border-radius: .9rem; box-shadow: 0 1px 3px rgb(15 23 42 / .12); }
.karta h3 { margin: 0 0 .25rem; font-size: 1rem; }
.karta p { margin: 0; }
.karta__cena { font-size: 1.4rem; font-weight: 800; color: #0f766e; }
.karta__pozn { font-size: .8rem; color: #64748b; }
.sleva { margin-left: .3rem; padding: .1rem .4rem; border-radius: 999px; background: #fee2e2; color: #b91c1c; font-size: .75rem; }
```
:::

Zkus první vstupence nastavit `sleva: 15` a sleduj, kde se štítek objeví. Pak zkus vrátit místo `null` prázdný řetězec `''` — vykreslí se taky nic, ale `null` říká čtenáři „tady záměrně nic není".

:::check
Komponenta `Varovani` má vrátit rámeček jen tehdy, když prop `text` není prázdný. Co vrátí v opačném případě?

### --expected--

null

### --accept--

vrátí null

### --why--

`null` je způsob, jak komponenta řekne „nevykresluj nic". React ho tiše zahodí, stejně jako `undefined` nebo `false`.

### --see--

react-zaklady/komponenty-a-props#podminene-vykresleni
:::

## Typické chyby a pasti

> [!PITFALL]
> **Zapomenuté složené závorky u atributu.** `<Cena hodnota=790 />` skončí chybou „Kód nejde spustit" (`Unexpected token`), protože JSX bere jako hodnotu atributu jen text v uvozovkách nebo výraz v `{}`. Oprava: `hodnota={790}`.

> [!PITFALL]
> **Komponenta čeká `{ nazev }`, rodič posílá `jmeno`.** Nic nespadne — v komponentě je `nazev` prostě `undefined` a na stránce zůstane prázdné místo. Oprava: srovnat jméno propu na obou stranách. Když si nejsi jistý, vypiš si `console.log(props)` na prvním řádku komponenty.

> [!PITFALL]
> **`key` na obalu uvnitř komponenty místo na prvku, který `map` vrací.** React dál hlásí `Each child in a list should have a unique "key" prop.` Oprava: `key` patří na `<Radek key={…} />`, ne dovnitř `Radek`.

> [!PITFALL]
> **Předání funkce místo jejího výsledku a naopak.** `<Vstupenka data={vstupenky} />` pošle celé pole, `<Vstupenka data={vstupenky[0]} />` jednu položku. Příznak prvního omylu: `objects are not valid as a React child` nebo prázdná karta.

:::check
Komponenta má hlavičku `function Cena({ castka })`, ale rodič ji volá `<Cena cena={790} />`. Co se vykreslí a co se objeví v konzoli?

### --answer--

Vykreslí se 790, protože React jména propů páruje podle pořadí.

#### --why--

Props se nepárují podle pořadí, ale podle jména — jsou to klíče v objektu.

### --correct--

Nevykreslí se nic a konzole mlčí.

#### --why--

`castka` je `undefined`, a to React vykreslí jako prázdno. Žádná chyba se nekoná, proto se tahle chyba hledá nejhůř.

### --answer--

Kód nejde spustit, React chybějící prop hlásí jako chybu.

#### --why--

React žádné povinné props nezná — hlídat je umí až TypeScript, ke kterému se dostaneš v jeho sekci.

### --see--

react-zaklady/komponenty-a-props#typicke-chyby-a-pasti
:::

:::explain
Vysvětli vlastními slovy, proč komponenta nesmí přepisovat svoje props — a co má udělat místo toho.

## --model--

Props patří rodiči: komponenta je dostane jako parametr, stejně jako funkce dostane argument. Kdyby je přepsala, změnila by data, o kterých rodič nic neví, a React by o změně taky nevěděl, takže by se stránka nepřekreslila. Místo přepisování si komponenta spočítá novou hodnotu do vlastní proměnné a vykreslí tu. Když má hodnotu opravdu změnit, musí to udělat rodič — ten si ji drží a komponentě pošle funkci, kterou o změnu požádá.

## --checklist--

- Props jsou vstup komponenty, patří rodiči.
- Komponenta z nich počítá nové hodnoty, staré nepřepisuje.
- Přepsání objektu v props změní i data rodiče, protože je to tentýž objekt.
- Změnu hodnoty musí udělat ten, kdo ji drží.
:::

## Kde to najdeš v MDN

- [Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) — sekce *Default value* vysvětlí, proč výchozí hodnota nastoupí jen u `undefined`.
- [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) — připomenutí, že `map` vrací nové pole stejné délky; v JSX je to pole prvků.
- [Nullish coalescing (??)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) — jak doplnit náhradní hodnotu, když data smějí být `null`.

> [!NOTE]
> Oficiální dokumentace Reactu k tomuhle tématu je na [react.dev/learn/passing-props-to-a-component](https://react.dev/learn/passing-props-to-a-component) a [react.dev/learn/rendering-lists](https://react.dev/learn/rendering-lists). Anglicky, ale s příklady, které jdou rovnou upravovat.

# --questions--

## --question--

Komponenta má hlavičku `function Odznak({ text, barva = 'seda' })`. Rodič ji použije jako `<Odznak text="Nové" barva={undefined} />`. Jakou barvu komponenta dostane?

### --expected--

seda

### --accept--

'seda'
šedou

### --why--

Výchozí hodnota nastupuje právě u `undefined` — nezáleží na tom, jestli prop chybí, nebo je poslaná jako `undefined`. U `null` nebo prázdného řetězce by se výchozí hodnota nepoužila.

### --see--

react-zaklady/komponenty-a-props#destrukturalizace-a-vychozi-hodnoty

## --question--

Ve výpisu objednávek se dá řádek smazat a v každém řádku je pole s poznámkou. Proč je `key={index}` v takovém seznamu špatně?

### --answer--

Protože indexy nejsou jedinečné.

#### --why--

Jedinečné v rámci jednoho seznamu jsou. Problém je jinde — v tom, co se stane, když se pole změní.

### --correct--

Protože po smazání řádku se indexy posunou a React spáruje položky se špatnými prvky, takže poznámka zůstane u jiné objednávky.

#### --why--

`key` má být stabilní jméno položky. Index je jméno místa, ne položky, takže se po smazání přelepí na jinou objednávku.

### --answer--

Protože `key` musí být text, ne číslo.

#### --why--

Číslo je jako `key` v pořádku, React si ho převede na text. Vadí to, že se index při změně pole posouvá.

### --see--

react-zaklady/komponenty-a-props#seznam-z-pole-a-key

## --question--

Napiš, co vypíše komponenta `Karta`, když ji rodič použije jako `<Karta titulek="Doprava">Kyvadlová doprava</Karta>` a komponenta vrací `<div>{props.children}</div>`.

### --expected--

Kyvadlová doprava

### --why--

`children` je obsah mezi otevírací a uzavírací značkou. Prop `titulek` komponenta v tomhle tvaru vůbec nevykresluje.

### --see--

react-zaklady/komponenty-a-props#children-obsah-mezi-znackami

## --question--

Komponenta `Stav` dostane prop `pocet` a má vykreslit rámeček jen tehdy, když je počet větší než nula. Napiš, co vrátí, když je `pocet` nula.

### --expected--

null

### --accept--

vrátí null
return null

### --why--

Vrácené `null` React nevykreslí. Zápis `{pocet && <Ramecek />}` by v tomhle případě vypsal nulu — to je ta past, na kterou jsi narazil v prvním workshopu.

### --see--

react-zaklady/komponenty-a-props#podminene-vykresleni
