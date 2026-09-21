## --term-- stav v URL

en: URL state
aliases: stavu v URL, stavem v URL, stav v adrese, stavu v adrese
lekce: react-aplikace/routovani#stav-v-url-usesearchparams

Hodnota, kterou aplikace nedrží v paměti, ale v adrese: filtr, řazení, číslo
stránky, otevřené id. Poznáš ji podle toho, že na ni má jít poslat odkaz a že
ji má vracet tlačítko Zpět.

## --term-- klíč dotazu

en: query key
aliases: klíče dotazu, klíčem dotazu, klíč dotazů, klíči dotazu
lekce: react-aplikace/tanstack-query#klic-musi-obsahovat-vsechno-na-cem-data-zavisi

Pole, pod kterým si knihovna na serverová data pamatuje jednu odpověď. Musí
obsahovat všechno, na čem odpověď závisí — jinak se pod jedním klíčem potkají
data dvou různých dotazů.

## --term-- optimistická úprava

en: optimistic update
aliases: optimistické úpravy, optimistickou úpravu, optimistickou úpravou, optimisticky
lekce: react-aplikace/tanstack-query#optimisticka-uprava-nez-server-odpovi

Změna, kterou aplikace ukáže v rozhraní dřív, než ji server potvrdí. Když
server odmítne, vrátí se stav zpátky na hodnotu před zásahem.

## --term-- CSS Modules

en: CSS Modules
aliases: CSS modul, CSS modulu, CSS modulů, CSS moduly, CSS modulech
lekce: react-aplikace/styly-v-reactu#css-modules-tridy-bez-kolizi

Soubor `*.module.css`, ze kterého build vyrobí objekt s přejmenovanými třídami.
Jméno `.karta` se v prohlížeči objeví jako `Karta_karta__a1b2`, takže se dvě
stejně pojmenované třídy ze dvou komponent nemůžou potkat.

## --term-- cookie HttpOnly

en: HttpOnly cookie
aliases: cookie s HttpOnly, cookies HttpOnly, HttpOnly cookie
lekce: react-aplikace/auth-z-klienta#kam-ulozit-token

Cookie, ke které se JavaScript v prohlížeči nedostane — čte ji jen prohlížeč
sám a posílá ji zpátky na server. Proto se v ní nese přihlašovací token:
skript vložený do stránky ho z ní nemá jak ukrást.

## --term-- chráněná trasa

en: protected route
aliases: chráněné trasy, chráněnou trasu, chráněných tras, chráněná cesta
lekce: react-aplikace/auth-z-klienta#chranena-trasa

Trasa, která před vykreslením obsahu ověří, jestli je uživatel přihlášený, a když
není, pošle ho na přihlášení. Na klientovi je to jen pohodlí pro uživatele —
o přístup k datům rozhoduje vždycky server.

## --term-- dotaz podle role

en: role-based query
aliases: dotazy podle role, dotazu podle role, dotazem podle role
lekce: react-aplikace/testy-komponent#dotazy-podle-role-a-textu

Hledání prvku v testu podle toho, čím prvek je a jak se jmenuje
(`getByRole('button', { name: 'Uložit' })`), místo podle třídy nebo `data-testid`.
Když projde, projde i čtečce obrazovky.

## --term-- náhrada sítě

en: network mocking
aliases: náhradu sítě, náhrady sítě, náhradou sítě
lekce: react-aplikace/testy-komponent#nahrada-site-misto-skutecneho-api

Vrstva, která v testu odchytí odchozí požadavky a odpoví místo serveru. Test
pak běží bez internetu, rychle a pokaždé stejně — a přitom komponenta volá
`fetch` úplně stejně jako v produkci.

## --term-- trasa

en: route
aliases: trasy, trase, trasu, trasou, tras, trasám, trasách
lekce: react-aplikace/routovani#trasy-deklarativne-routes-a-route

Dvojice „adresa → kus stránky", zapsaná jako `<Route path="/kola/:id" element={<Detail />} />`.
Router porovnává `path` s **celou** adresou, ne jen s jejím začátkem, takže
`/kola/:id` neodpovídá ani `/kola`, ani `/kola/42/recenze` — na to jsou vnořené
trasy a záchytná trasa `*`.

## --term-- vnořená trasa

en: nested route
aliases: vnořené trasy, vnořenou trasu, vnořených tras, vnořená cesta
lekce: react-aplikace/routovani#vnoreny-layout-a-outlet

Trasa zapsaná uvnitř jiné: rodič vykreslí layout, který se nemění, a potomek se
objeví na místě `Outlet`. Cesty potomků se píšou relativně (`servis`, ne
`/kola/servis`) a trasa pro adresu rodiče samotného se značí `index`.

## --term-- Outlet

en: Outlet
aliases: outletu, outletem
lekce: react-aplikace/routovani#vnoreny-layout-a-outlet

Komponenta, kterou v layoutu označíš místo, kam se má vykreslit vnořená trasa.
Bez ní se vnořená trasa sice matchne, ale nemá se kde zobrazit — a ty koukáš na
layout s prázdným obsahem, aniž by se cokoli rozbilo.

## --term-- parametr trasy

en: route parameter
aliases: parametru trasy, parametrem trasy, parametry trasy, parametrů trasy
lekce: react-aplikace/routovani#parametr-trasy-kola-id

Proměnná část cesty zapsaná dvojtečkou (`/kola/:id`), kterou v komponentě
přečteš hookem `useParams`. Je to **vždycky text**, takže `kola.find((k) => k.id === id)`
nenajde nic, dokud hodnotu nepřevedeš; a protože ji píše uživatel, patří
ke každému detailu i větev „nenašlo se".

## --term-- NavLink

en: NavLink
aliases: navlinku, navlinkem
lekce: react-aplikace/routovani#odkazy-link-a-navlink

Odkaz, který navíc ví, jestli je jeho cíl právě otevřený, a sám si přidá třídu
`active`. Bez `end` se zvýrazní i tehdy, když je jeho adresa jen předponou té
současné — proto má odkaz na `/` skoro vždycky `end`.

## --term-- useNavigate

en: useNavigate
aliases: hook useNavigate
lekce: react-aplikace/routovani#odkazy-link-a-navlink

Hook, který vrátí funkci na přesun jinam **z kódu**: po odeslání formuláře, po
přihlášení, po chybě. Na věci, na které uživatel klikne, patří `Link` — z něj
dostaneš prostřední klik, otevření v nové kartě i čtečku obrazovky zdarma.

## --term-- useSearchParams

en: useSearchParams
aliases: parametry za otazníkem, hook useSearchParams
mdn: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
lekce: react-aplikace/routovani#stav-v-url-usesearchparams

Hook, který čte a zapisuje část adresy za `?` a používá se skoro jako `useState`
— jen ta hodnota bydlí v adrese. Výchozí hodnotu drž při čtení
(`parametry.get('typ') ?? 'vse'`), ne ve stavu, a při psaní do políčka přidej
`{ replace: true }`, ať každé písmeno nezaloží záznam v historii.

## --term-- datový režim

en: data mode
aliases: datového režimu, datovém režimu, datovým režimem
lekce: react-aplikace/routovani#datovy-rezim-createbrowserrouter

Zápis tras jako datové struktury přes `createBrowserRouter` místo JSX `<Routes>`.
Odemkne věci, které deklarativní režim neumí: chybovou hranici na jednotlivou
trasu, `loader` a líné načítání kódu trasy.

## --term-- líná trasa

en: lazy route
aliases: líné trasy, línou trasu, líné načítání trasy
lekce: react-aplikace/routovani#datovy-rezim-createbrowserrouter

Trasa, jejíž kód se stáhne teprve při prvním otevření
(`lazy: () => import('./DetailKola')`). Bez ní je kód všech obrazovek v jednom
balíčku a uživatel si ho stáhne celý, i když otevře jen domovskou stránku.

## --term-- serverová data

en: server state
aliases: serverových dat, serverovými daty, serverovým datům, serverová data aplikace
lekce: react-aplikace/druhy-stavu#serverova-data-nejsou-stav-aplikace

Data, která vlastní server a aplikace má v paměti jen jejich kopii, která už teď
může být neaktuální. Proto k nim patří stáří, obnovování a stavy načítání a chyby
— a proto nepatří do `useState` ani do globálního úložiště, ale do mezipaměti
dotazů.

## --term-- UI stav

en: UI state
aliases: UI stavu, UI stavem, stav rozhraní
lekce: react-aplikace/druhy-stavu#ui-stav-nejmensi-mozny

Stav, který zmizí se zavřenou kartou a nikomu nechybí: otevřený dialog, rozbalená
položka, přepnutá záložka. Patří do nejnižší komponenty, které stačí; nahoru se
stěhuje teprve ve chvíli, kdy se o něj musí podělit dva sourozenci.

## --term-- staleTime

en: staleTime
aliases: čerstvost dat, stale time
lekce: react-aplikace/tanstack-query#stara-data-cerstva-data-staletime-a-gctime

Doba, po kterou se data v mezipaměti považují za čerstvá a na server se nesahá.
Výchozí `0` znamená, že se data ukážou okamžitě z mezipaměti a hned se na pozadí
ověří; plete se s `gcTime`, který ale říká něco jiného.

## --term-- gcTime

en: gcTime
aliases: doba držení v paměti, gc time
lekce: react-aplikace/tanstack-query#stara-data-cerstva-data-staletime-a-gctime

Doba, po kterou data zůstanou v paměti poté, co je nikdo nepoužívá — výchozích
pět minut. Díky ní se po návratu na stránku ukáže dřív viděný seznam hned, bez
hlášky „Načítám", zatímco o dotazu na server rozhoduje `staleTime`.

## --term-- zneplatnění dotazu

en: query invalidation
aliases: zneplatnění dotazů, zneplatnit dotaz, invalidace dotazu, invalidace dotazů
lekce: react-aplikace/tanstack-query#zmena-dat-usemutation-a-invalidace

Sdělení mezipaměti, že její kopie je od teď stará a má se načíst znovu. Data
přitom nemaže, jen je označí, takže zůstanou vidět; shoda klíčů je prefixová, a
`['objednavky']` proto zasáhne i `['objednavky', 'hotove']`.

## --term-- useMutation

en: useMutation
aliases: mutace dat, hook useMutation
lekce: react-aplikace/tanstack-query#zmena-dat-usemutation-a-invalidace

Hook na **změnu** dat na serveru: dostane funkci, která požadavek odešle, a hlásí,
jestli právě běží nebo selhala. Po úspěchu se v `onSuccess` zneplatní dotazy,
kterých se změna týká — bez toho se seznam nezmění, dokud uživatel neobnoví
stránku.

## --term-- neřízené pole

en: uncontrolled input
aliases: neřízeného pole, neřízená pole, neřízený vstup, neřízeným polem
lekce: react-aplikace/formulare-a-validace#formular-s-akci-useactionstate

Pole formuláře, jehož hodnotu drží prohlížeč, a React mu dá nanejvýš
`defaultValue`. Psaní tím nepřekresluje celý formulář a hodnoty se čtou až při
odeslání z `FormData` — podle `name`, ne podle `id`. Opakem je řízené pole
s `value` a `onChange`.

## --term-- akce formuláře

en: form action
aliases: akci formuláře, akcí formuláře, action na formuláři
lekce: react-aplikace/formulare-a-validace#formular-s-akci-useactionstate

Funkce předaná do `<form action={…}>`, která při odeslání dostane `FormData`
a vrátí nový stav formuláře. Hook `useActionState` si ten výsledek pamatuje,
takže se do něj vejdou chyby i vyplněné hodnoty — a pole po neúspěšném odeslání
nezůstanou prázdná.

## --term-- příznak dotknuto

en: touched
aliases: dotknuto, příznaku dotknuto, příznakem dotknuto
lekce: react-aplikace/formulare-a-validace#kdy-hlasku-ukazat

Informace, že uživatel v poli už byl a zase z něj odešel; nastavuje ji `onBlur`.
Bez ní nejde odlišit prázdné pole na začátku od prázdného pole po odchodu, takže
by hláška vyskočila hned po prvním písmenu.
