## --term-- HTML

en: HTML
aliases: HTML dokument, HTML dokumentu, HTML dokumentem, HTML kód, HTML kódu
mdn: https://developer.mozilla.org/en-US/docs/Web/HTML
lekce: html-zaklady/anatomie-dokumentu#prvek-znacka-a-atribut

Značkovací jazyk, kterým popisuješ **význam a strukturu** obsahu stránky — co je nadpis,
co odstavec, co odkaz. Není to programovací jazyk: nic nepočítá, jen popisuje.

## --term-- značka

en: tag
aliases: značky, značku, značkou, značek, otevírací značka, zavírací značka, otevírací značku, zavírací značku
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Tag
lekce: html-zaklady/anatomie-dokumentu#prvek-znacka-a-atribut

Zápis `<p>` nebo `</p>` v textu souboru. Otevírací a zavírací značka spolu s obsahem mezi
nimi tvoří prvek. Značka je text v souboru, prvek je věc ve stromu dokumentu.

## --term-- atribut

en: attribute
aliases: atributu, atributem, atributy, atributů, atributech
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Attribute
lekce: html-zaklady/anatomie-dokumentu#prvek-znacka-a-atribut

Doplňující údaj zapsaný v otevírací značce: `<img src="kuchyne.jpg" alt="Kuchyně">`.
Mění chování nebo význam prvku, ale sám o sobě nic nevypíše.

## --term-- URL

en: URL
aliases: adresa stránky, adresu stránky, adresy stránky, URL adresa, URL adresu
mdn: https://developer.mozilla.org/en-US/docs/Glossary/URL
lekce: html-zaklady/jak-funguje-web#url-z-ceho-se-adresa-sklada

Celá adresa zdroje na webu: schéma, doména, port, cesta, query a fragment
(`https://www.alza.cz:443/notebooky?strana=2#recenze`). Každá část říká někomu jinému,
co má udělat.

## --term-- schéma

en: scheme
aliases: schématu, schématem, protokol adresy
mdn: https://developer.mozilla.org/en-US/docs/Web/URI/Schemes
lekce: html-zaklady/jak-funguje-web#url-z-ceho-se-adresa-sklada

První část adresy před `://` — `https:`, `http:`, `file:`, `mailto:`. Říká prohlížeči,
jakým způsobem má zdroj získat.

## --term-- doména

en: domain
aliases: domény, doméně, doménu, doménou, název domény, název serveru
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Domain_name
lekce: html-zaklady/jak-funguje-web#dns-jak-se-z-domeny-stane-server

Jméno serveru v adrese (`www.seznam.cz`). Lidé si pamatují jména, síť potřebuje čísla —
proto je mezi tím DNS.

## --term-- DNS

en: DNS
aliases: DNS dotaz, DNS dotazu, DNS překlad, DNS serveru, DNS server
mdn: https://developer.mozilla.org/en-US/docs/Glossary/DNS
lekce: html-zaklady/jak-funguje-web#dns-jak-se-z-domeny-stane-server

Telefonní seznam internetu: převede doménu (`seznam.cz`) na IP adresu serveru
(`77.75.79.222`). Teprve s IP adresou se dá navázat spojení.

## --term-- HTTP

en: HTTP
aliases: HTTP protokol, HTTP protokolu, HTTPS, protokolu HTTP, protokol HTTP
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP
lekce: html-zaklady/jak-funguje-web#http-pozadavek-a-odpoved

Pravidla, podle kterých si prohlížeč a server povídají: prohlížeč pošle **požadavek**,
server vrátí **odpověď**. `HTTPS` je totéž zašifrované.

## --term-- HTTP požadavek

en: HTTP request
aliases: požadavek, požadavku, požadavkem, požadavky, požadavků, HTTP požadavku, HTTP požadavkem
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
lekce: html-zaklady/jak-funguje-web#http-pozadavek-a-odpoved

Zpráva od prohlížeče k serveru: metoda (`GET`), cesta (`/notebooky`), hlavičky a
někdy i tělo. Vidíš ji v DevTools na kartě **Network**.

## --term-- HTTP odpověď

en: HTTP response
aliases: odpověď serveru, odpovědi serveru, odpověď, odpovědi, odpovědí, HTTP odpovědi, HTTP odpovědí
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
lekce: html-zaklady/jak-funguje-web#http-pozadavek-a-odpoved

Zpráva od serveru zpět: stavový kód (`200`, `404`), hlavičky a tělo — třeba samotné HTML
stránky. Bez odpovědi prohlížeč nemá co vykreslit.

## --term-- MIME typ

en: MIME type
aliases: MIME typu, MIME typem, typ obsahu, typu obsahu, Content-Type
mdn: https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types
lekce: html-zaklady/jak-funguje-web#co-prohlizec-udela-s-html

Údaj v hlavičce `Content-Type`, který říká, **čím** odpověď je: `text/html`, `text/css`,
`image/webp`. Prohlížeč se řídí jím, ne příponou souboru.

## --term-- relativní adresa

en: relative URL
aliases: relativní adresy, relativní adresu, relativní adresou, relativní cesta, relativní cestu, relativní cesty
mdn: https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references
lekce: html-zaklady/jak-funguje-web#relativni-a-absolutni-adresa

Adresa bez domény (`obrazky/logo.svg`, `../index.html`), která se dopočítá vůči adrese
právě otevřené stránky. Přesuneš soubor jinam a odkaz přestane sedět.

## --term-- absolutní adresa

en: absolute URL
aliases: absolutní adresy, absolutní adresu, absolutní adresou, absolutní cesta, absolutní cestu
mdn: https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references
lekce: html-zaklady/jak-funguje-web#relativni-a-absolutni-adresa

Adresa, která platí odkudkoli: buď celá (`https://web.cz/obrazky/logo.svg`), nebo od
kořene webu (`/obrazky/logo.svg`).

## --term-- znaková entita

en: HTML entity
aliases: znakové entity, znakovou entitu, znakových entit, entita, entity, entitu, entitou, entit, HTML entita, HTML entity
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Entity
lekce: html-zaklady/anatomie-dokumentu#bile-znaky-entity-a-komentare

Náhradní zápis znaku, který by se jinak spletl se značkou nebo není vidět:
`&lt;` pro `<`, `&amp;` pro `&`, `&nbsp;` pro pevnou mezeru.

## --term-- sémantický prvek

en: semantic element
aliases: sémantické prvky, sémantických prvků, sémantickým prvkem, sémantika značek, sémantika HTML
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Semantics
lekce: html-zaklady/semanticka-struktura#problem-polevka-z-divu

Prvek, jehož jméno nese význam (`article`, `nav`, `time`), ne jen vzhled. Podle něj se
řídí čtečky obrazovky, vyhledávače i režim čtení.

## --term-- osnova nadpisů

en: heading outline
aliases: osnovu nadpisů, osnovy nadpisů, osnovou nadpisů, hierarchie nadpisů, hierarchii nadpisů, úroveň nadpisu, úrovně nadpisů
mdn: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements
lekce: html-zaklady/semanticka-struktura#osnova-nadpisu

Strom, který vznikne z `h1`–`h6` podle jejich úrovní. Čtečka obrazovky ho nabízí jako
obsah stránky, takže přeskočená úroveň je díra v obsahu, ne kosmetika.

## --term-- alt text

en: alt text
aliases: alt textu, alt textem, alternativní text, alternativního textu, alternativním textem, atribut alt
mdn: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#alt
lekce: html-zaklady/semanticka-struktura#obsah-s-vyznamem-time-address-blockquote-a-cite

Text v atributu `alt`, který zastoupí obrázek, když se nenačte nebo ho uživatel nevidí.
U čistě dekorativního obrázku se píše prázdný (`alt=""`), ne žádný.

## --term-- Baseline

en: Baseline
aliases: Baseline widely available, Baseline newly available, Baseline stav, Baseline stavu
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility
lekce: html-zaklady/mdn-a-dokumentace#baseline-a-tabulka-kompatibility

Štítek na MDN, který jednou větou říká, jestli věc funguje ve všech hlavních
prohlížečích. **Widely available** = bezpečné, **Newly available** = ověř si to.

## --term-- vykreslení stránky

en: rendering
aliases: vykreslení, vykreslování stránky, vykreslování, vykreslí, parsování HTML, zpracování HTML
mdn: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work
lekce: html-zaklady/jak-funguje-web#co-prohlizec-udela-s-html

Cesta od textu HTML k pixelům: prohlížeč postaví strom dokumentu, spočítá styly,
rozvrhne boxy a teprve pak maluje.

## --term-- prvek

en: element
aliases: prvku, prvkem, prvky, prvků, prvcích, prvkům, HTML prvek, HTML prvku, HTML prvky
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Element
lekce: html-zaklady/anatomie-dokumentu#prvek-znacka-a-atribut

Jeden uzel dokumentu — otevírací značka, obsah a zavírací značka dohromady
(`<p>Ahoj</p>`). Prvky se do sebe vnořují a tvoří strom stránky.

## --term-- prázdný prvek

en: void element
aliases: prázdné prvky, prázdného prvku, prázdným prvkem, prázdných prvků, samostatná značka
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Void_element
lekce: html-zaklady/anatomie-dokumentu#prvek-znacka-a-atribut

Prvek, který nemá obsah, a proto ani zavírací značku: `<img>`, `<br>`, `<input>`,
`<meta>`. Lomítko na konci (`<br />`) je v HTML nepovinné a nic nemění.

## --term-- doctype

en: doctype
aliases: doctypu, doctypem, deklarace typu dokumentu, DOCTYPE
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Doctype
lekce: html-zaklady/anatomie-dokumentu#kostra-dokumentu

První řádek dokumentu `<!DOCTYPE html>`. Přepne prohlížeč do standardního režimu —
bez něj se stránka vykresluje podle pravidel z devadesátek a rozvržení se rozjede.

## --term-- tabulka kompatibility

en: browser compatibility table
aliases: tabulky kompatibility, tabulce kompatibility, tabulku kompatibility, tabulkou kompatibility, podpora prohlížečů
mdn: https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Compatibility_tables
lekce: html-zaklady/mdn-a-dokumentace#baseline-a-tabulka-kompatibility

Tabulka na konci stránky MDN, která po prohlížečích ukazuje, od které verze věc
funguje. Čte se zprava doleva: nejdřív se dívej, jestli tam nemáš křížek.

## --term-- orientační oblast

en: landmark region
aliases: orientační oblasti, orientačních oblastí, orientačním oblastem, orientačními oblastmi, orientační oblastí
mdn: https://developer.mozilla.org/en-US/docs/Web/HTML/Element#content_sectioning
lekce: html-zaklady/semanticka-struktura#orientacni-oblasti-header-nav-main-aside-footer

Velká část stránky s jasnou rolí: `header`, `nav`, `main`, `aside`, `footer`. Čtečka
obrazovky mezi nimi umí skákat, takže uživatel nemusí procházet stránku odshora.
