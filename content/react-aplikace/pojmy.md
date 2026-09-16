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
