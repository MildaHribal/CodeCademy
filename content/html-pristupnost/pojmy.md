## --term-- čtečka obrazovky

en: screen reader
aliases: čtečky obrazovky, čtečkou obrazovky, čtečku obrazovky, čtečce obrazovky
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Screen_reader
lekce: html-pristupnost/proc-pristupnost#kdo-web-pouziva-jinak

Program, který stránku čte nahlas nebo na braillský řádek a ovládá se klávesnicí či gesty. Nejrozšířenější jsou NVDA, JAWS, VoiceOver, TalkBack a Orca.

## --term-- WCAG

en: Web Content Accessibility Guidelines
mdn: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG
lekce: html-pristupnost/proc-pristupnost#wcag-2-2-ve-zkratce

Pravidla přístupnosti webu od W3C, postavená na principech vnímatelný, ovladatelný, srozumitelný a robustní. Zákony i zakázky chtějí úroveň A a AA.

## --term-- kontrast

en: color contrast
aliases: kontrastu, kontrastem, kontrastní poměr
mdn: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast
lekce: html-pristupnost/proc-pristupnost#sest-nejcastejsich-chyb

Poměr jasu textu a pozadí od 1 : 1 do 21 : 1. Běžný text potřebuje aspoň 4,5 : 1, velký text a obrys fokusu aspoň 3 : 1.

## --term-- landmark

en: landmark
aliases: landmarky, landmarků, landmarcích, landmarkem
mdn: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/landmark_role
lekce: html-pristupnost/proc-pristupnost#jak-ctecka-stranku-cte

Oblast stránky, na kterou uživatel čtečky skočí: hlavička, navigace, hlavní obsah, patička. Vzniká z prvků `header`, `nav`, `main`, `footer` a dalších, ne z tříd.

## --term-- strom přístupnosti

en: accessibility tree
aliases: stromu přístupnosti, stromem přístupnosti
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree
lekce: html-pristupnost/strom-pristupnosti#problem-tri-tlacitka-ktera-vypadaji-stejne

Strom, který prohlížeč staví vedle DOM pro čtečky a další asistenční technologie. Každý uzel má roli, přístupné jméno a stav.

## --term-- implicitní role

en: implicit role
aliases: implicitní roli, implicitních rolí
lekce: html-pristupnost/strom-pristupnosti#role-cim-prvek-je

Role, kterou prvek HTML dostane sám od sebe: `button` je tlačítko, `nav` navigace, `a` s `href` odkaz. `div` a `span` mají roli `generic`, tedy žádnou.

## --term-- přístupné jméno

en: accessible name
aliases: přístupného jména, přístupným jménem, přístupnému jménu
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name
lekce: html-pristupnost/strom-pristupnosti#pristupne-jmeno-a-jak-se-pocita

Text, podle kterého čtečka i hlasové ovládání prvek poznají. Prohlížeč ho bere z prvního zdroje v pořadí `aria-labelledby`, `aria-label`, nativní popisek, obsah, `title`.

## --term-- ARIA

en: Accessible Rich Internet Applications
aliases: atributy ARIA
mdn: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
lekce: html-pristupnost/strom-pristupnosti#prvni-pravidlo-aria

Atributy `role` a `aria-*`, které mění roli, jméno a stav ve stromu přístupnosti. Chování prvku nemění.

## --term-- první pravidlo ARIA

en: first rule of ARIA
aliases: prvního pravidla ARIA
lekce: html-pristupnost/strom-pristupnosti#prvni-pravidlo-aria

Když má HTML prvek nebo atribut s rolí, stavem a chováním, které potřebuješ, použij ho místo ARIA: `button` místo `role="button"`.

## --term-- fokus

en: focus
aliases: fokusu, fokusem
lekce: html-pristupnost/klavesnice-a-fokus#problem-kde-ted-jsem

Prvek, na který právě míří klávesnice. Má ho nejvýš jeden prvek na stránce a JavaScript ho najde v `document.activeElement`.

## --term-- odkaz Přeskočit na obsah

en: skip link
aliases: odkazu Přeskočit na obsah, skip link
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Skip_link
lekce: html-pristupnost/klavesnice-a-fokus#odkaz-preskocit-na-obsah

První odkaz stránky, skrytý do chvíle, než dostane fokus. Vede na `id` hlavního obsahu, takže uživatel klávesnice přeskočí hlavičku a menu.

## --term-- vizuálně skrytý text

en: visually hidden text
aliases: vizuálně skrytého textu, vizuálně skrytým textem
lekce: html-pristupnost/aria-vzory#skryt-pro-oci-pro-ctecku-nebo-pro-oba

Text schovaný jen pro oči třídou jako `.visually-hidden`, ale ponechaný ve stromu přístupnosti. Dává jméno ikonám a upřesňuje krátké odkazy.

## --term-- živá oblast

en: live region
aliases: živou oblast, živé oblasti, živých oblastí
mdn: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
lekce: html-pristupnost/aria-vzory#oznameni-role-status-a-role-alert

Prvek, u kterého čtečka sama ohlásí změnu obsahu, i když je uživatel jinde. Vzniká z `role="status"`, `role="alert"` nebo `aria-live` a musí být na stránce předem.
