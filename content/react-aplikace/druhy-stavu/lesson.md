# Druhy stavu

Do téhle chvíle byl v Reactu stav jedna věc: `useState`. V aplikaci, která mluví
se serverem, je to pět různých věcí, které se chovají jinak a patří jinam.
Rozhodnutí „kam to dám" uděláš v každé komponentě, kterou kdy napíšeš — a když ho
uděláš špatně, projeví se to až za tři týdny, když se dvě kopie téže pravdy
rozejdou.

:::check pretest
Košík v e-shopu má počet kusů. Uživatel ho změní na jiné kartě prohlížeče, vrátí
se sem a čeká, že uvidí nový počet. Kam podle tebe ten počet patří?

### --answer--

Do `useState` v komponentě košíku.

#### --why--

Zamysli se, kdo o tom čísle rozhoduje. Kdyby ho vlastnila komponenta, jak by se
dozvěděla, co se stalo jinde?

### --correct--

Na server — v aplikaci je jen jeho dočasná kopie.

#### --why--

Přesně tak. Data, která vlastní server, si v aplikaci jen půjčujeme. Celá lekce
je o tom, co z toho plyne.

### --answer--

Do `localStorage`, aby přežil obnovení stránky.

#### --why--

`localStorage` je jen jiné místo v tomtéž prohlížeči. O druhé kartě, natož
o jiném počítači, nic neví.
:::

:::check pretest
Kolik různých druhů stavu podle tebe má běžná stránka e-shopu s filtrem,
košíkem, přihlášením a otevřeným dialogem? Napiš číslo.

### --expected--

5

### --accept--

pět

### --why--

Otevřený dialog (UI stav), rozepsaný formulář, košík ze serveru, filtr v adrese
a přihlášený uživatel jako globální stav. Každý z nich má jiná pravidla.
:::

## Problém: jedna pravda na dvou místech

Tahle komponenta vypadá nevinně a je v ní chyba, kterou dělá skoro každý:

```jsx
function DetailKola({ kolo }) {
  const [cena, setCena] = useState(kolo.cenaDen);
  // ...a od téhle chvíle už `cena` o změnách kola neví
}
```

`useState` vezme hodnotu **jednou**, při prvním vykreslení. Když přijdou nová
data ze serveru, `kolo.cenaDen` se změní, ale `cena` zůstane stará. Dvě proměnné
o téže věci, dvě různé odpovědi.

> [!REMEMBER]
> **Stav si drž jen tam, kde ho opravdu vlastníš.** Všechno ostatní jen čti
> z místa, kde bydlí: z props, z adresy, z odpovědi serveru.

Podle toho, kdo hodnotu vlastní, se stav dělí na pět druhů:

| druh | příklad | kdo ho vlastní | čím ho děláš |
|---|---|---|---|
| **UI stav** | otevřený dialog, přepnutá záložka, rozbalená položka | jedna komponenta | `useState` |
| **stav formuláře** | rozepsaná adresa, zaškrtnutý souhlas | formulář, než ho odešleš | `useState` nebo knihovna na formuláře |
| **serverová data** | seznam objednávek, profil, košík | server | knihovna na dotazy (TanStack Query) |
| **stav v adrese** | filtr, řazení, stránka, otevřené id | odkaz, který uživatel pošle | `useSearchParams`, parametr trasy |
| **globální klientský stav** | tmavý motiv, jazyk, otevřený postranní panel | celá aplikace na klientovi | kontext, `useReducer`, Zustand |

:::check
Do kterého z pěti druhů patří text, který má uživatel rozepsaný ve vyhledávacím
poli, ale ještě nestiskl Enter?

### --expected--

Stav formuláře

### --accept--

Formulářový stav.
Stav formuláře, dokud se neodešle.

### --why--

Dokud se nic neodeslalo, vlastní tu hodnotu formulář. Ve chvíli, kdy uživatel
potvrdí a chceš, aby šlo hledání poslat odkazem, přestěhuje se do adresy.

### --see--

react-aplikace/druhy-stavu#problem-jedna-pravda-na-dvou-mistech
:::

## UI stav: nejmenší možný

UI stav je to, co zmizí, když uživatel zavře kartu, a nikomu to nechybí. Patří
do komponenty, která ho používá, a **níž, než bys čekal**.

:::live react
```jsx
import { useState } from 'react';

const otazky = [
  { id: 1, otazka: 'Můžu kolo vrátit jinou pobočku?', odpoved: 'Ano, po domluvě na telefonu. Vrácení na jiné pobočce stojí 100 Kč.' },
  { id: 2, otazka: 'Je v ceně helma?', odpoved: 'Helma i zámek jsou v ceně každé půjčovné.' },
  { id: 3, otazka: 'Co když kolo poškodím?', odpoved: 'Drobné opravy řešíme na místě, u větších se dělí náklady podle smlouvy.' },
];

function Polozka({ otazka, odpoved }) {
  const [otevreno, setOtevreno] = useState(false);

  return (
    <li>
      <button type="button" aria-expanded={otevreno} onClick={() => setOtevreno(!otevreno)}>
        {otazka}
      </button>
      {otevreno && <p>{odpoved}</p>}
    </li>
  );
}

export default function CastoKladeneOtazky() {
  return (
    <ul className="faq">
      {otazky.map((polozka) => (
        <Polozka key={polozka.id} otazka={polozka.otazka} odpoved={polozka.odpoved} />
      ))}
    </ul>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.faq { max-width: 460px; margin: 24px auto; padding: 0; list-style: none; display: grid; gap: 10px; }
.faq li { background: #fff; border: 1px solid #e3e1dd; border-radius: 12px; overflow: hidden; }
.faq button { display: block; width: 100%; padding: 14px 18px; border: 0; background: none; font: inherit; font-weight: 600; text-align: left; cursor: pointer; }
.faq button:hover { background: #f1f5f2; }
.faq p { margin: 0; padding: 0 18px 16px; color: #6b7280; }
```
:::

Zkus přesunout `useState` z `Polozka` do `CastoKladeneOtazky` a drž tam index
otevřené položky — uvidíš, že kód naroste a rodič najednou ví o věci, do které mu
nic není. Otevření jedné otázky je čistě věc té jedné položky.

Výjimka je, když se **dvě komponenty musí dohodnout**: třeba když má být otevřená
vždycky jen jedna otázka. Pak stav vytáhneš do nejbližšího společného rodiče — ale
až v tu chvíli, ne dopředu.

:::check
Podle čeho poznáš, že UI stav patří o úroveň výš, do rodiče?

### --expected--

Když ho potřebují dvě komponenty

### --accept--

Když na něm závisí víc než jedna komponenta.
Když se o něj musí podělit sourozenci.

### --why--

Stav patří do nejnižší komponenty, které stačí. Jakmile ho potřebují dva
sourozenci, přestěhuje se do jejich společného rodiče (a předává se dolů propsy).

### --see--

react-aplikace/druhy-stavu#ui-stav-nejmensi-mozny
:::

## Serverová data nejsou stav aplikace

Tohle je největší rozdíl mezi „umím React" a „umím React aplikace". Seznam
objednávek nevlastníš ty — vlastní ho server. To, co máš v paměti prohlížeče, je
jen **kopie, která už teď může být neaktuální**.

Z toho plyne všechno ostatní: kopie se musí umět obnovit, musí vědět, jak je
stará, musí počítat s tím, že se načítá nebo že načtení selhalo, a když ji změníš,
musí se zeptat serveru, jestli to tak opravdu je.

Napsat to ručně přes `useEffect` a `useState` jde — a taky to skoro nikdy nevyjde
správně:

```jsx
// Kolik stavů je potřeba na jedno načtení: data, načítání, chyba…
const [objednavky, setObjednavky] = useState([]);
const [nacita, setNacita] = useState(true);
const [chyba, setChyba] = useState(null);
```

…a to jsme ještě nezačali řešit dvě komponenty, které chtějí táž data, návrat na
stránku, opakování po chybě ani zrušení dotazu, který mezitím zastaral. Přesně
tohle dělá knihovna na serverová data, které se věnuje celá příští lekce.

> [!REMEMBER]
> **Serverová data nejsou stav, ale cache.** Nezajímá tě jen hodnota, ale i to,
> jak je stará, jestli se zrovna načítá a jestli poslední pokus selhal.

:::check
Proč se serverovým datům říká spíš cache než stav?

### --expected--

Protože je vlastní server

### --accept--

Je to jen kopie dat, která vlastní server, a může být neaktuální.
Protože originál je na serveru a tohle je jeho kopie.

### --why--

Stav aplikace je pravda sama o sobě. Kopie serverových dat je pravda jen do
chvíle, než ji někdo jiný na serveru změní — proto k ní patří stáří, obnovování
a stavy načítání a chyby.

### --see--

react-aplikace/druhy-stavu#serverova-data-nejsou-stav-aplikace
:::

## Stav v adrese: co má jít poslat odkazem

Filtr, řazení, číslo stránky, otevřená záložka, vybrané id — to všechno jsou
věci, na které se uživatel bude chtít odkázat. Pravidlo je jednoduché:

> [!REMEMBER]
> **Když má mít dvojice „stejná obrazovka, jiný obsah" vlastní odkaz, patří
> rozdíl do adresy.**

Adresu jsi v [Routování](see:react-aplikace/routovani#stav-v-url-usesearchparams)
už používal. Tady je důležité to, co z ní plyne pro architekturu: adresu **čteš**
při každém vykreslení a **nikdy si ji nekopíruješ** do `useState`. Kopie je zdroj
rozporu.

:::live react predict
```jsx
import { useState } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router';

function Filtr() {
  const [parametry, setParametry] = useSearchParams();
  const [typ, setTyp] = useState(parametry.get('typ') ?? 'vse');

  function zvol(dalsiTyp) {
    setTyp(dalsiTyp);
    setParametry({ typ: dalsiTyp });
  }

  return (
    <div>
      <button type="button" onClick={() => zvol('elektro')}>Elektro</button>
      <p>ve stavu: {typ}</p>
      <p>v adrese: {parametry.get('typ') ?? 'nic'}</p>
    </div>
  );
}

export default function App() {
  return (
    <MemoryRouter initialEntries={['/?typ=mestske']}>
      <Filtr />
    </MemoryRouter>
  );
}
```
--question-- Uživatel klikne na „Elektro" a pak zmáčkne tlačítko Zpět v prohlížeči. Co bude na obrazovce?
--option-- Ve stavu i v adrese bude `mestske` — obojí se vrátilo.
--option*-- Ve stavu bude `elektro`, v adrese `mestske`.
--option-- Ve stavu i v adrese bude `elektro` — Zpět se stavu netýká.
--why-- Zpět vrátí **adresu** na `?typ=mestske`. Hodnota v `useState` se nevrací nikam: byla nastavená z adresy jen jednou, při prvním vykreslení. Od té chvíle jsou to dvě nezávislé pravdy a uživatel vidí zvýrazněné „Elektro" nad výpisem městských kol. Proto se adresa nekopíruje do stavu.
:::

:::check
Kde by v předchozí ukázce měl filtr bydlet, aby se tenhle rozpor nemohl stát?

### --expected--

Jen v adrese

### --accept--

Jenom v URL, bez useState.
V adrese, komponenta ji jen čte.

### --why--

Když je hodnota jen na jednom místě, nemá se s čím rozejít. Komponenta adresu
čte při každém vykreslení a zapisuje do ní — vlastní stav k tomu nepotřebuje.

### --see--

react-aplikace/druhy-stavu#stav-v-adrese-co-ma-jit-poslat-odkazem
:::

## Globální klientský stav: kdy ano a kdy ne

Zbývá poslední přihrádka: hodnoty, které jsou opravdu **na klientovi** a potřebuje
je celá aplikace. Tmavý motiv, zvolený jazyk, otevřený postranní panel, obsah
košíku v aplikaci, která nemá přihlášení.

Pořadí, ve kterém se to řeší, je tohle:

1. **Props**, když je to jedna, dvě úrovně dolů. Nejnudnější řešení je většinou
   nejlepší.
2. **`children`**, když ti props vadí jen proto, že prolézají skrz komponentu,
   které se netýkají.
3. **Kontext** (`createContext`, `useContext`), když jde o hodnotu, která se mění
   zřídka a čte ji hodně míst: motiv, jazyk, přihlášený uživatel.
4. **Knihovna na stav** (Zustand, Jotai), teprve když kontext začne překreslovat
   půlku aplikace při každé změně nebo když se stav zaplétá do složité logiky.

> [!PITFALL]
> Nejčastější chyba v tomhle seznamu je **začít od konce**. Většina aplikací,
> které jsi kdy uviděl s globálním úložištěm na všechno, tam má z 80 % serverová
> data — a ta do globálního stavu nepatří. Když vytáhneš serverová data do
> knihovny na dotazy a filtry do adresy, zbude na globální stav většinou
> překvapivě málo.

> [!NOTE]
> Kontext a `useReducer` mají vlastní lekci v sekci o Reactu do hloubky. Tady jde
> jen o rozhodnutí, kdy po nich sáhnout.

:::check
Aplikace drží v globálním úložišti seznam produktů stažený z API, aby ho nemusela
načítat na každé stránce. Co je na tom špatně?

### --expected--

Jsou to serverová data

### --accept--

Serverová data patří do cache dotazů, ne do globálního stavu.
Je to kopie dat ze serveru, ne klientský stav.

### --why--

Globální úložiště o datech neví nic: nezná jejich stáří, neumí je obnovit ani
zopakovat po chybě. Sdílení mezi stránkami vyřeší knihovna na dotazy stejně
dobře — a k tomu přidá všechno ostatní.

### --see--

react-aplikace/druhy-stavu#globalni-klientsky-stav-kdy-ano-a-kdy-ne
:::

## Rozhodovací postup ve čtyřech otázkách

Když příště nebudeš vědět, kam hodnota patří, projdi tyhle otázky v pořadí.
První „ano" rozhoduje.

1. **Vlastní tu hodnotu server?** → serverová data (knihovna na dotazy).
2. **Má na ni jít poslat odkaz?** → adresa (`useSearchParams`, parametr trasy).
3. **Píše ji uživatel do formuláře a ještě ji neodeslal?** → stav formuláře.
4. **Potřebuje ji víc než jedna větev komponent?** → nejbližší společný rodič,
   při větším rozsahu kontext.

Když nepadne ani jedno „ano", je to obyčejný UI stav v té nejmenší komponentě,
které stačí.

:::check
Podle rozhodovacího postupu: kam patří informace „v tabulce je otevřený třetí
řádek", když na ni nemá jít poslat odkaz a používá ji jen tabulka sama?

### --expected--

UI stav

### --accept--

Do useState v tabulce.
Obyčejný UI stav v komponentě tabulky.

### --why--

Ani jedna ze tří otázek nad ní neodpověděla „ano", takže padá až do poslední
přihrádky: nejmenší komponenta, které to stačí.

### --see--

react-aplikace/druhy-stavu#rozhodovaci-postup-ve-ctyrech-otazkach
:::

:::explain
Vysvětli, proč je špatný nápad zkopírovat data z props do `useState`.

## --model--

`useState` vezme počáteční hodnotu jen při prvním vykreslení komponenty. Když se
props změní, stav o tom neví a zůstane starý, takže komponenta ukazuje něco
jiného, než co jí rodič poslal. Vzniknou dvě pravdy o jedné hodnotě a která
z nich je vidět, závisí na tom, jestli se komponenta mezitím odmontovala. Když
potřebuju z props něco odvodit, spočítám to při vykreslení; stav si nechávám jen
na to, co komponenta opravdu vlastní.

## --checklist--

- `useState` použije počáteční hodnotu jen při prvním vykreslení.
- Změna props se do už existujícího stavu nepromítne.
- Vzniknou dvě pravdy o jedné hodnotě, které se rozejdou.
- Odvozenou hodnotu je lepší spočítat při vykreslení než ukládat do stavu.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Kopie props do stavu.** `const [cena, setCena] = useState(kolo.cenaDen)` se
> po příchodu nových props neaktualizuje. Příznak: komponenta ukazuje starou
> hodnotu a po obnovení stránky najednou správnou. Řešení: hodnotu z props jen
> čti, nebo ji odvoď výpočtem při vykreslení.

> [!PITFALL]
> **Odvozená hodnota ve stavu.** `const [pocetVybranych, setPocetVybranych] = useState(0)`
> vedle pole `vybrane` znamená, že po každé změně pole musíš nezapomenout
> přepočítat i číslo. Příznak: čísla v rozhraní občas nesedí. Odvozené hodnoty
> se počítají při vykreslení: `const pocetVybranych = vybrane.length`.

> [!PITFALL]
> **Filtr v `useState` i v adrese zároveň.** Vypadá to, že to funguje, dokud
> někdo nezmáčkne Zpět nebo neotevře odkaz. Příznak: zvýrazněné tlačítko
> neodpovídá vypsanému seznamu. Jedna hodnota, jedno místo.

> [!PITFALL]
> **Serverová data v globálním úložišti.** Příznak: aplikace ukazuje smazanou
> objednávku, dokud uživatel neobnoví stránku, a nikdo neví, kdo má data
> obnovit. Serverová data patří do cache dotazů, která umí zneplatnit sama sebe.

> [!PITFALL]
> **`useEffect`, který jen zrcadlí jednu hodnotu do druhé.** Efekt s jediným
> `setNeco(jineNeco)` uvnitř je téměř vždy odvozená hodnota schovaná do stavu.
> Příznak: komponenta se vykreslí dvakrát a mezitím blikne stará hodnota.

:::check
Komponenta ukazuje starou cenu a po obnovení stránky najednou správnou. Kterou
z pastí jsi právě potkal?

### --expected--

Kopii props do stavu

### --accept--

Zkopírovaná hodnota z props v useState.
Props zkopírované do useState.

### --why--

Obnovení stránky komponentu namontuje znovu, takže `useState` vezme počáteční
hodnotu z nových props. Do té doby drží tu, kterou dostal poprvé.

### --see--

react-aplikace/druhy-stavu#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

MDN popisuje webové rozhraní, se kterým se stav v adrese potkává; React má
vlastní dokumentaci na [react.dev](https://react.dev/learn/managing-state).

- [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) —
  co přesně je v adrese za otazníkem a jak se to čte a zapisuje.
- [Window: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) —
  kam se ukládá stav, který má přežít zavření karty (a proč to není náhrada za server).
- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) —
  proč tlačítko Zpět vrací adresu, ale ne stav komponent.

# --questions--

## --question--

Komponenta dostane v props objekt `uzivatel` a chce z něj ukázat celé jméno.
Který zápis je správný?

### --answer--

```jsx
const [jmeno, setJmeno] = useState(uzivatel.jmeno + ' ' + uzivatel.prijmeni);
```

#### --why--

Tenhle zápis hodnotu zamrazí při prvním vykreslení. Když rodič pošle jiného
uživatele, komponenta bude pořád ukazovat toho starého.

### --correct--

```jsx
const jmeno = uzivatel.jmeno + ' ' + uzivatel.prijmeni;
```

#### --why--

Odvozená hodnota se počítá při vykreslení. Žádný stav není potřeba, takže se
nemá co rozejít.

### --answer--

```jsx
useEffect(() => setJmeno(uzivatel.jmeno + ' ' + uzivatel.prijmeni), [uzivatel]);
```

#### --why--

Tohle sice hodnotu dorovná, ale až po dalším vykreslení — komponenta mezitím
jednou blikne se starou hodnotou. A pořád jde o odvozenou hodnotu ve stavu.

## --question--

Stránka s objednávkami má být sdílitelná odkazem, který otevře jednu konkrétní
objednávku v postranním panelu. Do kterého druhu stavu podle rozhodovacího
postupu patří informace „který panel je otevřený"?

### --expected--

Do adresy

### --accept--

Stav v URL.
Do adresy, jako parametr.

### --why--

Rozhoduje otázka „má na to jít poslat odkaz". Jakmile ano, není to UI stav, i když
to na první pohled vypadá jako „otevřený panel".

### --see--

react-aplikace/druhy-stavu#rozhodovaci-postup-ve-ctyrech-otazkach

## --question--

Ve formuláři je rozepsaná adresa doručení a uživatel klikne na tlačítko Odeslat.
V jakém druhu stavu ta adresa byla předtím a v jakém je potom?

### --expected--

Nejdřív stav formuláře, potom serverová data

### --accept--

Ze stavu formuláře se stanou serverová data.
Předtím formulářový stav, potom data na serveru.

### --why--

Dokud se neodešle, vlastní hodnotu formulář na klientovi. Odesláním se vlastníkem
stává server a v aplikaci zbude jen jeho kopie — proto se po odeslání obvykle
zneplatní odpovídající dotaz.

### --see--

react-aplikace/druhy-stavu#serverova-data-nejsou-stav-aplikace

## --question--

Proč je špatný nápad ukládat počet položek v košíku do zvláštního stavu vedle
pole položek?

### --expected--

Je to odvozená hodnota

### --accept--

Protože se dá spočítat z pole, je odvozená.
Odvozené hodnoty se počítají, neukládají.

### --why--

Každá odvozená hodnota ve stavu znamená, že ji musíš nezapomenout přepočítat na
všech místech, kde měníš zdroj. Dřív nebo později se na jedno zapomene.

### --see--

react-aplikace/druhy-stavu#typicke-chyby-a-pasti
