---
pass: 0.8
---

# --questions--

## --question--

Napiš, kolikrát se v produkčním buildu spustí funkce komponenty `Radek`, když se rodič `Tabulka` vykreslí jednou a vrací deset `Radek`ů bez `memo`.

### --expected--

desetkrát

### --accept--

10
10krát
desetkrát, jednou za každý řádek

### --why--

React se u potomků na props vůbec nekouká: když se vykreslí rodič, spustí i všechno, co rodič vrací. Do DOMu se pak zapíše jen to, co se opravdu změnilo — proto počet renderů neříká nic o tom, kolik práce měl prohlížeč.

### --see--

react-hloubka/render-a-rerender#kdyz-se-vykresli-rodic-vykresli-se-i-potomci
react-zaklady/proc-react#jak-react-vykresli-stranku

## --question--

Komponenta `Radek` je obalená v `memo` a dostává props `nazev` (text) a `onSmazat={() => smazat(radek.id)}`. Rodič se překreslil, `nazev` se nezměnil. Vykreslí se `Radek` znovu?

### --correct--

Ano — `onSmazat` je při každém renderu nová funkce, takže porovnání props selže.

#### --why--

`memo` porovnává **všechny** props přes `Object.is`. Šipková funkce napsaná přímo v JSX vzniká pokaždé znovu, takže dvě volání nikdy nejsou tatáž hodnota.

### --answer--

Ne, protože `nazev` se nezměnil a to je jediná datová prop.

#### --why--

Porovnání se nezastaví u první props. Podívej se, co je `onSmazat` v každém dalším renderu rodiče.

### --answer--

Ne, funkce se porovnávají podle svého kódu, a ten je stejný.

#### --why--

`Object.is` porovnává identitu, ne zdrojový kód. Dvě funkce se stejným tělem jsou dvě různé hodnoty.

### --answer--

Ano, protože `memo` funguje jen na komponenty bez props.

#### --why--

`memo` funguje i na komponenty s props — právě na ně je určené. Jde o to, jaké ty props jsou.

### --see--

react-hloubka/render-a-rerender#memo-zarazka-kterou-lehce-obejdes

## --question--

Napiš, co vypíše konzole po kliknutí na tlačítko, které změní `mistnost` z `praha` na `brno`. Řádky piš pod sebe.

```jsx
useEffect(() => {
  console.log('otvírám ' + mistnost);
  return () => console.log('zavírám ' + mistnost);
}, [mistnost]);
```

### --expected--

```text
zavírám praha
otvírám brno
```

### --why--

Úklid běží **před** dalším během efektu a dostane hodnoty z renderu, ve kterém se efekt spustil. Proto se zavírá stará místnost a teprve potom otevírá nová — nikdy ne obráceně.

### --see--

react-hloubka/useeffect-spravne#uklid-co-po-sobe-efekt-uklidi

## --question--

Ve kterém z těchhle případů `useEffect` opravdu potřebuješ?

### --correct--

Chceš se po namontování komponenty připojit k `EventSource` a při odmontování se odpojit.

#### --why--

Spojení je vnější systém: někdo ho musí zapnout a zase vypnout. Přesně na to je efekt s úklidem.

### --answer--

Potřebuješ spočítat součet položek v košíku, kdykoli se košík změní.

#### --why--

Součet se dá spočítat při renderu z toho, co už ve stavu je. Efekt by přidal druhý zdroj pravdy a render navíc.

### --answer--

Po kliknutí na „Uložit" chceš zobrazit oznámení „Uloženo".

#### --why--

Oznámení je následek akce uživatele, ne stavu obrazovky — patří do obsluhy události.

### --answer--

Potřebuješ vymazat rozepsaný formulář, když přijde jiný zákazník.

#### --why--

Reset stavu při změně dat se čistěji udělá změnou `key` komponenty; React ji vymění za novou s výchozím stavem.

### --see--

react-hloubka/useeffect-spravne#kdy-efekt-nepotrebujes
react-zaklady/stav-jako-snimek#odvozena-hodnota-misto-stavu

## --question--

Napiš, jaká hodnota bude v `poleRef.current` v těle komponenty při prvním renderu, jestliže je v JSX `<input ref={poleRef} />`.

### --expected--

null

### --why--

Ref na prvek naplňuje React až v commitu, tedy potom, co prvek vznikne v DOMu. V renderu, který ten prvek teprve popisuje, tam žádný uzel být nemůže — proto se refy čtou v efektu nebo v obsluze události.

### --see--

react-hloubka/useref-a-dom#proc-ref-necist-pri-renderu

## --question--

Dvě různé komponenty na stránce zavolají tentýž vlastní hook `useKosik()`. Uživatel přidá položku v první z nich. Co uvidí ve druhé?

### --correct--

Nic — každá komponenta má vlastní stav, protože hook sdílí logiku, ne data.

#### --why--

Tělo hooku se provede uvnitř té komponenty, která ho zavolala, takže `useState` v něm zakládá stav té komponenty. Sdílení dat řeší kontext nebo stav u společného rodiče.

### --answer--

Tutéž položku — hook je jeden, takže i stav je jeden.

#### --why--

Hook nemá žádnou vlastní paměť. Zkus si představit, že jeho tělo prostě zkopíruješ do obou komponent.

### --answer--

Položku uvidí až po překreslení celé stránky.

#### --why--

Žádné pozdější sjednocení nepřijde: jsou to dva nezávislé stavy a nic je nespojuje.

### --answer--

React vypíše varování, že se stejný hook volá dvakrát.

#### --why--

Volat stejný hook z víc komponent je úplně běžné — právě kvůli tomu vlastní hooky existují.

### --see--

react-hloubka/vlastni-hooky#hook-sdili-logiku-ne-stav
react-zaklady/udalosti-a-formulare#zvednuti-stavu

## --question--

Napiš, jakou chybu ohlásí React u komponenty, která má nahoře `if (!data) return <Nacitam />;` a **pod** tím `const [tab, setTab] = useState('profil');`, jakmile `data` dorazí.

### --expected--

zavolalo se víc hooků než v minulém renderu

### --accept--

Rendered more hooks than during the previous render
víc hooků než minule
počet hooků se mezi rendery změnil

### --why--

React si stav ukládá podle pořadí volání hooků. Předčasný `return` je podmíněné volání se vším všudy: v prvním renderu se `useState` nezavolal, ve druhém ano. Proto všechny hooky patří nad každý `return`.

### --see--

react-hloubka/vlastni-hooky#podminene-volani-schovane-ve-vetvi

## --question--

Reducer má větev `case 'zvys': stav.pocet++; return stav;`. Co uvidí uživatel po kliknutí?

### --correct--

Nic — číslo na obrazovce zůstane, i když se hodnota v paměti změnila.

#### --why--

Reducer vrátil tentýž objekt, takže `Object.is(novy, stary)` je `true` a React render vůbec nenaplánuje. Data a obrazovka se rozejdou, což je ta nejhorší varianta.

### --answer--

Číslo se zvýší, jen o render později.

#### --why--

Žádný pozdější render nepřijde. Zamysli se, podle čeho React pozná, že se stav změnil.

### --answer--

React vyhodí chybu o mutaci stavu.

#### --why--

React mutaci nehlídá a nic nehlásí — proto je to past, kterou odhalíš až podle chování.

### --answer--

Číslo se zvýší dvakrát, protože `StrictMode` volá reducer dvakrát.

#### --why--

Dvojí volání ve vývoji vychází pokaždé ze stejného starého stavu, takže samo o sobě k dvojímu přičtení nevede. Problém je jinde.

### --see--

react-hloubka/reducer-a-context#reducer-ktery-mutuje-stav

## --question--

Napiš, kolik z pěti komponent, které si přes `useContext` čtou hodnotu kontextu a jsou všechny v `memo`, se překreslí, když poskytovatel dostane novou hodnotu.

### --expected--

pět

### --accept--

5
všech pět

### --why--

`memo` chrání jen před změnou props. Odběratele kontextu React překreslí vždy, když se hodnota podle `Object.is` liší od předchozí — proto se vyplatí kontexty dělit a hodnotu stabilizovat přes `useMemo`.

### --see--

react-hloubka/reducer-a-context#kdy-kontext-prekresli-vsechno

## --question--

Modal je přes `createPortal` vykreslený v `<body>`, ale v JSX stojí uvnitř komponenty `Karta`, která má `onClick`. Kam doputuje klik z tlačítka v modalu?

### --correct--

K obsluze tlačítka a pak k `onClick` karty — události probublávají podle stromu komponent.

#### --why--

Portál mění jen to, kam React výsledek zapíše. Ve stromu Reactu zůstává modal potomkem karty, takže props, kontext i události fungují jako předtím.

### --answer--

Jen k obsluze tlačítka; karta je v DOMu úplně jinde.

#### --why--

V DOMu opravdu jinde je, ale React události zpracovává nad svým stromem, ne nad stromem DOM.

### --answer--

K `onClick` karty jen tehdy, když je portál vykreslený do prvku uvnitř karty.

#### --why--

Cíl portálu je pro bublání v Reactu nepodstatný — rozhoduje, kde je portál napsaný v JSX.

### --answer--

Nikam, portály mají vlastní systém událostí.

#### --why--

Žádný zvláštní systém událostí portály nemají; používají ten stejný jako zbytek aplikace.

### --see--

react-hloubka/chyby-suspense-portaly#portal-v-domu-jinde-ve-stromu-reactu-doma

## --question--

Napiš, kolik z těchhle čtyř chyb zachytí error boundary: výjimka při renderu potomka, výjimka v jeho efektu, odmítnutá promise z `fetch` v obsluze kliknutí, výjimka v callbacku `setTimeout`.

### --expected--

dvě

### --accept--

2
dvě — render a efekt

### --why--

Error boundary chytá chyby z renderu, z efektů a z konstruktorů komponent pod sebou. Obsluha události ani `setTimeout` mezi ně nepatří: tam se chyba musí ošetřit ručně a její výsledek uložit do stavu.

### --see--

react-hloubka/chyby-suspense-portaly#error-boundary-zachrana-nad-komponentou

## --question--

Napiš, co vypíše tenhle kód. Řádky piš pod sebe.

```js
const kosik = [{ id: 1, kusy: 2 }];
const kopie = [...kosik];
kopie[0].kusy = 5;
console.log(kosik[0].kusy);
console.log(kosik === kopie);
```

### --expected--

```text
5
false
```

### --why--

Rozprostření vyrobí nové pole, ale objekty uvnitř jsou pořád ty samé. Právě proto reducer, který má změnit vnořený objekt, musí vyrobit novou kopii i jeho — jinak potichu přepíše i „starý" stav.

### --see--

js-objekty/kopie-a-json#melka-kopie-spread-a-object-assign
react-zaklady/stav-jako-snimek#pole-a-objekty-ve-stavu

## --question--

Ve které z těchhle situací **nepomůže** `useDeferredValue`?

### --correct--

Stránka čeká na odpověď ze serveru a uživatel u toho kouká na prázdné místo.

#### --why--

`useDeferredValue` odkládá vykreslení, ne načítání. Na čekání na data je `Suspense` s `fallback`, nebo stav načítání ve vlastní režii.

### --answer--

Filtr nad tabulkou o dvou tisících řádcích se sekne po každém znaku.

#### --why--

Tohle je přesně případ pro odloženou hodnotu: psaní zůstane plynulé a překreslení tabulky počká.

### --answer--

Přepnutí záložky s náročným grafem zamrzne rozhraní na půl sekundy.

#### --why--

I tady odložené vykreslení pomůže (v podobě `useTransition`) — akce se označí za nespěchající.

### --answer--

Našeptávač překresluje dlouhý seznam návrhů při každém písmeni.

#### --why--

Odložená hodnota je na to dělaná: vstup reaguje hned a seznam dožene zpoždění.

### --see--

react-hloubka/chyby-suspense-portaly#prechody-usetransition-a-usedeferredvalue

## --question--

Najdi v anglické dokumentaci Reactu stránku o `useEffectEvent` a napiš, odkud se funkce, kterou vrátí, **smí** volat.

### --expected--

z efektu

### --accept--

jen z useEffect
z efektů ve stejné komponentě
z efektu ve stejné komponentě

### --why--

Funkce z `useEffectEvent` není reaktivní a nesmí se předávat dál ani volat odjinud; volá se jen z efektů ve stejné komponentě (případně z jiné takové funkce). Kdyby se posílala jako prop, zmizela by záruka, že vidí aktuální hodnoty toho renderu, ve kterém běží efekt.

### --see--

react-hloubka/useeffect-spravne#useeffectevent-hodnota-ktera-nema-restartovat-efekt

# --code-- Nástěnka směn

## --file-- smeny.jsx

```jsx
import { useEffect, useRef, useState } from 'react';

const SLUZBY = [
  { kod: 'R', popis: 'ranní', zacatek: 6 },
  { kod: 'O', popis: 'odpolední', zacatek: 14 },
  { kod: 'N', popis: 'noční', zacatek: 22 },
];

export default function Nastenka({ smeny, provozId }) {
  const [vybranaSluzba, setVybranaSluzba] = useState('R');
  const [pocetHodin, setPocetHodin] = useState(0);
  const [obsazeni, setObsazeni] = useState(null);
  const [tiky, setTiky] = useState(0);
  const oknoRef = useRef(null);

  useEffect(() => {
    let celkem = 0;
    for (const smena of smeny) {
      if (smena.sluzba === vybranaSluzba) {
        celkem = celkem + smena.hodiny;
      }
    }
    setPocetHodin(celkem);
  }, [smeny, vybranaSluzba]);

  useEffect(() => {
    const casovac = setInterval(function () {
      setTiky(tiky + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    nactiObsazeni(provozId).then(function (data) {
      setObsazeni(data);
    });
  }, [provozId]);

  useEffect(() => {
    document.title = 'Směny: ' + vybranaSluzba;
  }, [vybranaSluzba]);

  function prepni(kod) {
    setVybranaSluzba(kod);
    oknoRef.current.scrollTop = 0;
  }

  const radky = [];
  for (let i = 0; i < smeny.length; i++) {
    const smena = smeny[i];
    if (smena.sluzba !== vybranaSluzba) {
      continue;
    }
    radky.push(
      <li key={smena.id} className="radek">
        <span>{smena.jmeno}</span>
        <span>{smena.hodiny} h</span>
      </li>,
    );
  }

  return (
    <section className="nastenka">
      <h2>Rozpis směn</h2>

      <div className="prepinace">
        {SLUZBY.map(function (sluzba) {
          return (
            <button
              key={sluzba.kod}
              type="button"
              aria-pressed={sluzba.kod === vybranaSluzba}
              onClick={() => prepni(sluzba.kod)}
            >
              {sluzba.popis}
            </button>
          );
        })}
      </div>

      <p className="souhrn">
        Odpracováno celkem: <strong>{pocetHodin} h</strong> (běží {tiky} s)
      </p>

      <div className="okno" ref={oknoRef}>
        {radky.length === 0 ? <p className="prazdno">Žádná směna.</p> : <ul>{radky}</ul>}
      </div>

      {obsazeni === null ? (
        <p className="nacitam">Načítám obsazení provozu…</p>
      ) : (
        <p className="obsazeni">Obsazeno {obsazeni.procenta} %</p>
      )}
    </section>
  );
}

function nactiObsazeni(provozId) {
  const prodleva = provozId === 1 ? 1200 : 150;
  return new Promise((resolve) => {
    setTimeout(() => resolve({ procenta: 60 + provozId }), prodleva);
  });
}
```

## --question--

Efekt na řádcích 16 až 24 v `smeny.jsx` počítá součet hodin do stavu. Napiš, co se má s tímhle kódem udělat.

### --expected--

smazat efekt a součet spočítat při renderu

### --accept--

nahradit odvozenou hodnotou počítanou při renderu
zrušit stav pocetHodin a počítat součet v renderu
spočítat součet přímo v těle komponenty

### --why--

Součet je odvozená hodnota: dá se kdykoli spočítat ze `smeny` a `vybranaSluzba`, které už komponenta má. Efekt z něj dělá druhý zdroj pravdy, přidává render navíc a uživatel na okamžik vidí nové směny se starým součtem.

### --see--

react-hloubka/useeffect-spravne#kdy-efekt-nepotrebujes
react-zaklady/stav-jako-snimek#odvozena-hodnota-misto-stavu

## --question--

Efekt na řádcích 26 až 30 v `smeny.jsx` má dvě různé chyby. Která z nich způsobí, že se počítadlo `tiky` zastaví na jedničce?

### --correct--

`setTiky(tiky + 1)` čte `tiky` ze závislostí prázdného efektu, takže je to navždy nula.

#### --why--

Efekt s prázdným seznamem závislostí proběhl jednou a v jeho closure zůstala hodnota `tiky` z prvního renderu. Každé tiknutí tedy nastaví stav na `0 + 1`. Opravou je funkce aktualizace `setTiky((t) => t + 1)`.

### --answer--

Chybí `clearInterval` v úklidu.

#### --why--

Chybějící úklid je ta druhá chyba a projeví se jinak: časovač běží dál po odmontování a ve `StrictMode` běží rovnou dvakrát. Zaseknutí na jedničce nezpůsobí.

### --answer--

`setInterval` dostal obyčejnou funkci místo šipkové.

#### --why--

Na tvaru funkce nezáleží — `function () {}` i šipka tu fungují stejně, protože `this` se uvnitř nepoužívá.

### --answer--

Interval má prodlevu 1000 ms, takže React aktualizace spojí do jedné.

#### --why--

React dávkuje aktualizace z jedné obsluhy, ne napříč sekundami. Prodleva s tím nemá nic společného.

### --see--

react-hloubka/useeffect-spravne#zavislosti-uplny-seznam-nebo-zastarala-closure

## --question--

Napiš, který jediný řádek musí přibýt do efektu na řádcích 26 až 30 v `smeny.jsx`, aby po odmontování komponenty časovač neběžel dál. Napiš ho i s `return`.

### --expected--

return () => clearInterval(casovac);

### --accept--

return () => { clearInterval(casovac); };

### --why--

Úklid se z efektu vrací jako funkce a zruší přesně ten časovač, který efekt nastartoval. Bez něj běží interval dál i po zmizení nástěnky — a ve `StrictMode` běží rovnou dva, takže počítadlo skáče po dvou.

### --see--

react-hloubka/useeffect-spravne#uklid-co-po-sobe-efekt-uklidi

## --question--

Uživatel má otevřený provoz 1 (odpověď trvá 1200 ms) a po chvíli přepne na provoz 2 (odpověď trvá 150 ms). Co se podle efektu na řádcích 32 až 36 v `smeny.jsx` objeví na obrazovce nakonec?

### --correct--

Obsazení provozu 1, protože jeho pomalejší odpověď dorazí jako poslední a přepíše novější.

#### --why--

Klasický souběh odpovědí. Efekt nemá úklid, takže starý dotaz nikdo neoznačí za neplatný a jeho `setObsazeni` se provede až po tom novém.

### --answer--

Obsazení provozu 2, React starší odpověď zahodí.

#### --why--

React o rozjetých dotazech nic neví a sám nic nezahazuje. Zahodit výsledek musí kód v úklidu efektu.

### --answer--

Text „Načítám obsazení provozu…", protože se stav nikdy nedoplní.

#### --why--

Obě odpovědi dorazí a obě zapíšou do stavu, takže načítací text zmizí. Jde o to, která hodnota tam zůstane.

### --answer--

Obsazení provozu 2, protože závislost `provozId` efekt restartovala.

#### --why--

Restart efektu opravdu proběhne a nový dotaz se odešle. To ale nijak nezastaví ten starý, který dobíhá.

### --see--

react-hloubka/useeffect-spravne#soubeh-odpovedi-pri-nacitani

## --question--

Řádek 44 v `smeny.jsx` sahá přes ref na `scrollTop`. Napiš, jestli je to v pořádku, nebo ne — a jedním slovem proč (co přesně se tam mění).

### --expected--

je to v pořádku, mění se scroll

### --accept--

v pořádku, jde o scroll
ano, scroll React nespravuje
je to správně, scrollování není v datech

### --why--

Scroll, fokus, měření a přehrávání médií jsou čtyři legitimní důvody, proč si na uzel sáhnout: React o nich nic neví a v JSX se popsat nedají. Špatné by bylo přes ref měnit text, třídy nebo viditelnost — to všechno plyne z dat.

### --see--

react-hloubka/useref-a-dom#rucni-zmena-domu-ktery-spravuje-react
