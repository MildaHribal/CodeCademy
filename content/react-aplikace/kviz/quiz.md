---
pass: 0.8
---

# --questions--

## --question--

Stránka s nabídkou kol má filtr podle typu. Marketing chce, aby šel odkaz na
vyfiltrovanou nabídku poslat mailem. Kam podle rozhodovacího postupu patří
hodnota filtru?

### --expected--

Do adresy

### --accept--

Do URL.
Do adresy, jako parametr.
Stav v URL.

### --why--

Rozhoduje otázka „má na to jít poslat odkaz". Jakmile je odpověď ano, přestává
to být UI stav, i když to na první pohled vypadá jako obyčejné tlačítko.

### --see--

react-aplikace/druhy-stavu#rozhodovaci-postup-ve-ctyrech-otazkach

## --question--

Seznam úkolů má dotaz s klíčem `['ukoly']` a filtr, který se do klíče nedostal.
Co se stane, když uživatel přepne filtr?

### --answer--

Dotaz se nespustí vůbec, protože se klíč nezměnil.

#### --why--

Dotaz se spustí — komponenta se překreslila a knihovna si vyžádá data znovu,
protože jsou stará. Problém není v tom, jestli se spustí.

### --correct--

Pod jedním klíčem se potkají data dvou různých filtrů a v seznamu chvíli svítí
cizí položky.

#### --why--

Klíč je adresa dat v cache. Když v něm filtr chybí, ukládají se pod něj odpovědi
na různé otázky a vyhrává ta poslední, která doběhla.

### --answer--

Knihovna sama pozná, že se vstup změnil, a klíč doplní.

#### --why--

Knihovna vidí jen klíč, který jí dáš. O tom, co `queryFn` uvnitř použije, neví
nic — a vědět to nemůže.

### --see--

react-aplikace/tanstack-query#klic-musi-obsahovat-vsechno-na-cem-data-zavisi

## --question--

Napiš jméno metody klienta dotazů, kterou po úspěšné mutaci řekneš, že data
seznamu už neplatí.

### --expected--

invalidateQueries

### --accept--

queryClient.invalidateQueries

### --why--

Označí dotazy s daným klíčem za stará a ta, která jsou zrovna vidět, načte
znovu. Není to smazání: dokud nedorazí čerstvá odpověď, uživatel kouká na
poslední známá data místo na prázdnou obrazovku.

### --see--

react-aplikace/tanstack-query#zmena-dat-usemutation-a-invalidace

## --question--

Jaký je rozdíl mezi `staleTime` a `gcTime`?

### --answer--

`staleTime` je, jak dlouho se data drží v paměti, `gcTime`, jak dlouho se
nepoužívají.

#### --why--

Máš to obráceně. Jedna z těch dvou hodnot rozhoduje o důvěře v data, druhá
o úklidu paměti.

### --correct--

`staleTime` říká, jak dlouho jsou data považovaná za čerstvá, `gcTime`, jak
dlouho zůstanou v paměti po tom, co je nikdo nepoužívá.

#### --why--

První hodnota rozhoduje o tom, jestli se knihovna zeptá serveru znovu. Druhá
o tom, jestli po návratu na stránku uvidí uživatel stará data, nebo prázdno.

### --answer--

`staleTime` platí pro dotazy, `gcTime` pro mutace.

#### --why--

Obě hodnoty se týkají dotazů. Mutace se v cache neukládají — mění data na
serveru a pak se ptáš znovu.

### --see--

react-aplikace/tanstack-query#stara-data-cerstva-data-staletime-a-gctime

## --question--

Optimistická úprava odškrtne úkol hned, ještě než server odpoví. Co musí
obsluha chyby udělat, když server odpověď odmítne?

### --expected--

Vrátit původní stav

### --accept--

Vrátit data zpátky na hodnotu před zásahem.
Obnovit předchozí obsah cache.

### --why--

Proto se před zásahem ukládá snímek předchozích dat. Bez návratu zůstane
v rozhraní změna, která se na serveru nestala — a uživatel se o tom dozví až
po obnovení stránky.

### --see--

react-aplikace/tanstack-query#optimisticka-uprava-nez-server-odpovi

## --question--

Chráněná trasa má tři větve. Napiš, kterou situaci musí ošetřit dřív, než
uživatele přesměruje na přihlášení.

### --expected--

Že se ještě načítá

### --accept--

Stav načítání.
Že odpověď kdo jsem ještě nedorazila.
isPending

### --why--

V prvním vykreslení odpověď serveru ještě není a uživatel je `null`. Bez větve
„ještě nevíme" z toho vyjde „nepřihlášen" a přihlášený člověk po každém obnovení
stránky skončí na přihlášení.

### --see--

react-aplikace/auth-z-klienta#chranena-trasa

## --question--

Proč se přihlašovací token ukládá do cookie s `HttpOnly` místo do `localStorage`?

### --answer--

Protože `localStorage` má omezenou velikost a token se do něj nevejde.

#### --why--

Token je pár set bajtů a `localStorage` má megabajty. Problém je v tom, kdo se
k uloženému tokenu dostane.

### --correct--

Protože k cookie s `HttpOnly` se JavaScript na stránce nedostane.

#### --why--

Cizí skript na stránce (napadený balíček, vložený komentář) přečte `localStorage`
stejně snadno jako tvůj vlastní kód. Cookie s `HttpOnly` je pro JavaScript
neviditelná.

### --answer--

Protože cookie se na rozdíl od `localStorage` smaže po zavření prohlížeče.

#### --why--

Cookie s `Max-Age` přežije zavření prohlížeče stejně jako `localStorage`.
Rozdíl je v tom, kdo ji může přečíst.

### --see--

react-aplikace/auth-z-klienta#kam-ulozit-token

## --question--

Kolega schoval tlačítko „Smazat fakturu" podmínkou na roli a tvrdí, že je mazání
zabezpečené. Napiš jednou větou, co je na tom špatně.

### --expected--

O oprávnění musí rozhodnout server

### --accept--

Skryté tlačítko není zákaz, endpoint se dá zavolat přímo.
Kód komponenty běží u uživatele, zabezpečení patří na server.

### --why--

Podmínka rozhoduje jen o tom, co se vykreslí. Požadavek na mazání jde poslat
z konzole i z příkazové řádky, takže o přístupu musí rozhodnout ten, kdo data
vydává.

### --see--

react-aplikace/auth-z-klienta#co-se-nikdy-neresi-jen-na-klientovi

## --question--

Napiš, jakým dotazem Testing Library najdeš tlačítko s textem „Uložit" tak, aby
test zároveň ohlídal, že jde o skutečné tlačítko.

### --expected--

getByRole('button', { name: 'Uložit' })

### --accept--

screen.getByRole('button', { name: 'Uložit' })
getByRole

### --why--

Dotaz podle role čte ze stromu přístupnosti. Když ho `<div onClick>` neprojde,
neprojde ho ani čtečka obrazovky — test tak hlídá přístupnost mimochodem.

### --see--

react-aplikace/testy-komponent#dotazy-podle-role-a-textu

## --question--

Test po `render()` hledá `screen.getByText('Svíčková')` a hlásí *Unable to find
an element with the text*. V prohlížeči se přitom recepty ukazují správně. Co
s tím?

### --answer--

Přidat před dotaz `await new Promise((r) => setTimeout(r, 500))`.

#### --why--

Čekání na čas projde na rychlém stroji a padá na pomalém. Testy nemají čekat na
čas, ale na výsledek.

### --correct--

Použít `await screen.findByText('Svíčková')`.

#### --why--

`findBy…` se ptá opakovaně, dokud prvek nenajde nebo nevyprší limit. Přesně na
to je určený: data ze serveru přijdou až po prvním vykreslení.

### --answer--

Nahradit `getByText` za `queryByText`.

#### --why--

`queryBy…` se taky podívá jen jednou, jen místo výjimky vrátí `null`. Je na
ověřování, že něco na stránce **není**.

### --see--

react-aplikace/testy-komponent#kdyz-data-prijdou-pozdeji-findby

## --question--

Napiš příponu souboru, ze kterého Vite vyrobí objekt s přejmenovanými třídami.

### --expected--

.module.css

### --accept--

module.css

### --why--

Bez `.module` ve jméně je to obyčejný globální stylopis a `import styles from …`
vrátí prázdno. Přejmenování tříd zapíná ta přípona, ne zápis importu.

### --see--

react-aplikace/styly-v-reactu#css-modules-tridy-bez-kolizi

## --question--

Proč se dnes u nového projektu nedoporučuje `styled-components`?

### --answer--

Protože neumí podmíněné styly podle props.

#### --why--

Právě to umí a je to jeho hlavní lákadlo. Důvod, proč se od toho odchází, je
jinde než v chybějící funkci.

### --correct--

Protože styl vzniká za běhu a komponenta kvůli tomu musí být klientská.

#### --why--

Obojí platí uživatel a architektura aplikace. Dnešní řešení vyrobí hotové CSS
už při buildu.

### --answer--

Protože ho nejde použít dohromady s TypeScriptem.

#### --why--

S TypeScriptem funguje. Problém je v tom, kdy se styl skládá, ne v čem je
napsaný.

### --see--

react-aplikace/styly-v-reactu#proc-se-css-in-js-dnes-spis-nepouziva

## --question--

Formulář kontroluje data Zod schématem a stejné schéma používá i server. Proč se
kontrola na serveru nedá vynechat, když už proběhla na klientovi?

### --expected--

Požadavek jde poslat i mimo formulář

### --accept--

Klientská kontrola je jen pohodlí, data můžou přijít odkudkoli.
Protože na server se dá poslat cokoli, třeba z příkazové řádky.

### --why--

Kontrola na klientovi je rychlá zpětná vazba pro člověka. Server je hranice, za
kterou se data zapisují — a tam musí projít znovu, ať přišla odkudkoli.

### --see--

react-aplikace/formulare-a-validace#jedno-schema-pro-klienta-i-server

## --question--

V React aplikaci se rodičovská komponenta překreslí kvůli změně stavu. Její
potomek dostal úplně stejné props jako předtím. Co se stane s potomkem?

### --answer--

Nevykreslí se — React porovná props a pozná, že se nezměnily.

#### --why--

React props sám od sebe neporovnává. Kdyby to dělal u každé komponenty,
porovnávání by stálo víc než samotné vykreslení.

### --correct--

Vykreslí se taky, protože se vykreslil jeho rodič.

#### --why--

Render jde stromem dolů. Zastavit ho jde `memo`, ale to je výjimka, o kterou se
říká, ne výchozí chování.

### --answer--

Vykreslí se jen tehdy, když má vlastní stav.

#### --why--

Vlastní stav s tím nesouvisí. Rozhodující je, že se vykreslil rodič.

### --see--

react-hloubka/render-a-rerender#kdyz-se-vykresli-rodic-vykresli-se-i-potomci

## --question--

Napiš, jak se říká formulářovému poli, jehož `value` přichází ze stavu a každá
změna jde přes `onChange` zpátky do stavu.

### --expected-- ignore-case

řízené pole

### --accept--

řízený input
řízená pole

### --why--

Stav je pak jediný zdroj pravdy o tom, co je v poli napsané. Opak je pole
neřízené, kde si hodnotu drží samo DOM a ty ji čteš až při odeslání.

### --see--

react-zaklady/udalosti-a-formulare#rizene-pole

## --question--

Napiš, jakým slovem musí začínat jméno vlastního hooku, aby ho React i lint
poznaly.

### --expected-- ignore-case

use

### --why--

Podle prefixu `use` pozná pravidlo lintu, že uvnitř smí být další hooky, a že
funkci nesmíš zavolat podmíněně. Je to dohoda, na které stojí celá kontrola
pravidel hooků.

### --see--

react-hloubka/vlastni-hooky#z-komponenty-do-hooku

# --code-- Objednávky v cizím projektu

## --file-- Orders.jsx

```jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

const STATUSES = ['vse', 'nova', 'odeslana', 'zrusena'];

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState(params.get('stav') || 'vse');
  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState(null);

  useEffect(function load() {
    setLoading(true);
    setFailure(null);
    fetch('/api/objednavky?stav=' + status)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        setOrders(data);
        setCount(data.length);
        setLoading(false);
      })
      .catch(function (error) {
        setFailure(error.message);
        setLoading(false);
      });
  }, [status]);

  function changeStatus(next) {
    setStatus(next);
    setParams({ stav: next });
  }

  if (loading) {
    return <p>Načítám…</p>;
  }

  return (
    <section>
      <div>
        {STATUSES.map(function (item, index) {
          return (
            <button key={index} onClick={() => changeStatus(item)}>
              {item}
            </button>
          );
        })}
      </div>

      {failure && <p>{failure}</p>}

      <p>Celkem objednávek: {count}</p>

      <ul>
        {orders.map(function (order, index) {
          return (
            <li key={index}>
              {order.cislo} — {order.castka} Kč
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

## --question--

Na řádku 55 se vypisuje `count` ze stavu (řádek 10), který se nastavuje na řádku
23. Napiš výraz, kterým se totéž spočítá přímo při vykreslení, takže ten stav
není potřeba.

### --expected--

orders.length

### --why--

Odvozená hodnota ve stavu znamená, že ji musíš nezapomenout přepočítat na každém
místě, kde měníš zdroj. Tady by stačilo, aby někdo přidal druhé místo, kde se
`orders` mění, a čísla přestanou sedět.

### --see--

react-aplikace/druhy-stavu#typicke-chyby-a-pasti

## --question--

Řádky 8 a 34 drží tutéž hodnotu na dvou místech: ve stavu a v adrese. Co uvidí
uživatel, který přepne filtr na „odeslaná" a pak zmáčkne v prohlížeči Zpět?

### --answer--

Vrátí se filtr „vse" i seznam, protože adresa je zpátky na začátku.

#### --why--

Adresa se opravdu vrátí. Jenže podle čeho se vykresluje seznam a zvýraznění
tlačítek? Podívej se na řádky 17 a 46.

### --correct--

Na obrazovce se nezmění nic, jen adresa je najednou jiná než to, co je vidět.

#### --why--

Seznam i tlačítka čtou `status` ze `useState`. Ten se tlačítkem Zpět nemění, takže
se aplikace nemá čím překreslit — a v adrese zůstane hodnota, která neodpovídá
obsahu.

### --answer--

Komponenta spadne, protože `useSearchParams` a `useState` se navzájem přepisují.

#### --why--

Nespadne, a to je právě ta potíž: obě hodnoty žijí vedle sebe a tiše se rozejdou.
Chyba se pozná až podle toho, co je vidět.

### --see--

react-aplikace/druhy-stavu#stav-v-adrese-co-ma-jit-poslat-odkazem

## --question--

Uživatel rychle za sebou klikne na „nová" a hned na „zrušená". Efekt na řádcích
14–30 se spustí dvakrát. Co se může stát?

### --answer--

Druhý dotaz se nespustí, protože první ještě běží.

#### --why--

`fetch` nic nefrontuje. Oba dotazy odejdou hned za sebou a vrátí se každý svou
rychlostí.

### --correct--

Odpověď na starší dotaz může dorazit později a přepsat data novějšího filtru.

#### --why--

Efekt nemá úklidovou funkci, která by starší odpověď označila za nepotřebnou.
V seznamu pak svítí „nové" objednávky, i když je vybraný filtr „zrušené".

### --answer--

React druhý efekt zruší sám, protože se změnila závislost.

#### --why--

React zavolá úklidovou funkci, kterou efekt vrátil — a tenhle efekt žádnou
nevrací. Zrušit rozběhnutý `fetch` za tebe nikdo neumí.

### --see--

react-hloubka/useeffect-spravne#soubeh-odpovedi-pri-nacitani

## --question--

Napiš jedním slovem, co musí efekt na řádcích 14–30 vracet, aby pozdní odpověď
nepřepsala novější.

### --expected-- ignore-case

úklidovou funkci

### --accept--

úklidová funkce
cleanup
funkci

### --why--

Ta funkce se zavolá, než efekt poběží znovu. Typicky v ní nastavíš příznak
`ignore = true`, na který se pak podívá `then` staršího dotazu, než sáhne na stav.

### --see--

react-hloubka/useeffect-spravne#soubeh-odpovedi-pri-nacitani
