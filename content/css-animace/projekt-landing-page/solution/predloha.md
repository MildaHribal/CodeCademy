# Předloha textů: Dělenka

Texty od klienta. Pořadí sekcí je závazné, drobné úpravy formulací po domluvě smíš. Třídy a `id` v závorkách jsou technické požadavky ze zadání.

## Hlavička (`header.site-header`)

- Logo (`.logo`): značka „÷" a text **Dělenka**, odkaz na začátek stránky.
- Navigace (`nav` s přístupným názvem „Hlavní navigace"): Funkce → `#funkce`, Recenze → `#recenze`, Ceník → `#cenik`, Otázky → `#faq`.

## Úvod (`.hero`)

- Nad nadpisem: Pro spolubydlící, chaty i výlety
- Nadpis `h1`: **Kdo komu kolik dluží? Dělenka to ví.**
- Text: Zapisuj společné nákupy, nájem i benzín. Dělenka spočítá, kdo má komu poslat kolik, a vyrovnání zaplatíš jedním QR kódem v bance.
- Tlačítko „Stáhnout aplikaci" (`button.button.download-button`) otevře nabídku `#download-menu` (popover) s nadpisem „Kde chceš Dělenku mít?" a odkazy: App Store pro iPhone, Google Play pro Android, Webová verze v prohlížeči.
- Odkaz „Zobrazit ceník" (`.button`) → `#cenik`.
- Drobný text: Zdarma pro tři skupiny. Bez reklam.
- Ilustrace (jen dekorace, pro čtečky schovaná): telefon s přehledem skupiny **Chata Jizerky 2026**, celkem 14 820 Kč, dluhy Marek → Tereza 1 240 Kč, Ondra → Tereza 860 Kč, Lucie → Petr 415 Kč a tlačítko Vyrovnat QR kódem.

## Funkce (`section#funkce`, seznam `.features`, karty `.feature`)

Nadpis `h2`: **Všechno, co parta potřebuje**
Úvod: Žádné tabulky, žádné „pošlu ti to pak“. Dělenka hlídá účty za vás.

Každá karta má ikonu (`.feature__icon`, dekorace) a text (`.feature__body`) s nadpisem `h3`:

| ikona | nadpis | text |
|---|---|---|
| ◎ | Skupiny pro každou partu | Byt, chata, dovolená u moře. Každá skupina má vlastní přehled a vlastní lidi. |
| ▤ | Účtenka z fotky | Vyfoť účtenku z Lidlu a Dělenka přečte částku i obchod. Položky rozdělíš tažením. |
| ▦ | Vyrovnání QR kódem | Na konci výletu dostane každý QR platbu s přesnou částkou a číslem účtu. |
| € | Eura, zloté i forinty | Platby v cizí měně přepočítá kurzem ČNB ze dne nákupu. |
| ↻ | Pravidelné platby | Nájem, internet a Netflix se připíšou samy každý měsíc. |
| ✓ | Připomínka bez trapných zpráv | Když někdo dluží déle než dva týdny, Dělenka mu slušně připomene sama. |

## Recenze (`section#recenze`, seznam `.reviews`, recenze `.review`)

Nadpis `h2`: **Co říkají party, které už nepočítají**

- „Bydlíme ve třech v Brně a konečně se nehádáme, kdo koupil jar. Nájem se připíše sám a na konci měsíce jen naskenujeme QR kód.“ — Tereza, spolubydlící v Brně
- „Na chatě nás bylo jedenáct. Dřív jsem účty dával dohromady týden, teď to bylo hotové v neděli u snídaně.“ — Marek, organizátor chaty v Jizerkách
- „Roadtrip po Chorvatsku v eurech a v kunách z minula. Dělenka to přepočítala líp než my.“ — Lucie a Petr, Olomouc

Citát patří do `blockquote` s odstavcem `p`, podpis pod něj.

## Ceník (`section#cenik`, seznam `.plans`, tarify `.plan`)

Nadpis `h2`: **Ceník**
Úvod: Platíš jen ty, ostatní ve skupině mají všechno s tebou.

| tarif | cena | výhody (`ul.plan__features`) | tlačítko (`.button.plan__button`) |
|---|---|---|---|
| Zdarma | 0 Kč navždy | Tři skupiny; Vyrovnání QR kódem | Začít zdarma |
| Plus (`.plan--featured`, štítek „Nejoblíbenější") | 59 Kč / měsíc | Neomezeně skupin; Účtenka z fotky; Cizí měny kurzem ČNB; Pravidelné platby | Vyzkoušet 30 dní |
| Parta | 149 Kč / měsíc | Plus až pro 10 lidí; Export do tabulky; Přednostní podpora | Koupit pro partu |

## Otázky (`section#faq`, otázky `details.faq__item` se `summary`)

Nadpis `h2`: **Časté otázky**. Otevřená smí být vždy jen jedna otázka.

- **Musí mít Dělenku všichni ve skupině?** Nemusí. Kdo aplikaci nemá, dostane odkaz na přehled v prohlížeči a QR kód pro platbu.
- **Posílá Dělenka peníze za mě?** Ne. Jen spočítá částky a připraví QR platbu, kterou zaplatíš ve své bance. K tvému účtu nemá přístup.
- **Co když někdo z party odejde?** Jeho dluhy a pohledávky se vyrovnají, historie zůstane ve skupině a nikdo o nic nepřijde.
- **Jde předplatné zrušit kdykoli?** Ano, jedním tlačítkem v nastavení. Do konce zaplaceného měsíce máš Plus dál.

## Patička (`footer.site-footer`)

Dělenka · odkazy Ochrana osobních údajů, Obchodní podmínky, ahoj@delenka.cz (e-mailový odkaz) · © 2026 Dělenka, Brno
