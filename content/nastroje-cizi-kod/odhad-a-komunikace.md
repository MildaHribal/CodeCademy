# Odhad a komunikace

:::check pretest
1. Co bys měl udělat, když ti kolega napíše, abys odhadl, jak dlouho ti potrvá udělat přihlašovací formulář?
2. Kdy (po jak dlouhé době) by ses měl ozvat, když se na nějakém úkolu zablokuješ?
:::

Práce programátora není jen o psaní kódu, ale z velké části o komunikaci. Musíš umět popsat problém, zjistit, co přesně máš vlastně udělat (Definition of Done), a odhadnout časovou náročnost.

> [!REMEMBER]
> Mnohem horší než říct "Nevím, nestihnu to" je mlčet a doufat, že se to nějak samo vyřeší. Včasná komunikace problému zachránila spoustu projektů.

## Odhadování (Estimates)

Odhadovat, jak dlouho potrvá vývoj softwaru, je proslule těžké. Nikdy totiž nevíš, jaké pasti na tebe čekají.

1. **Rozpadni úkol na menší části.** "Udělat přihlašování" je moc velké. Ale "Vytvořit HTML formulář", "Napojit frontend na API" a "Uložit token do cookies" už zní lépe.
2. **Odhaduj v rozsazích.** Neříkej "bude to zítra ve 14:00". Řekni: "V nejlepším případě to zabere den, pokud narazím na potíže s existujícím API, tak tři dny."
3. **Počítej s režií.** Schůzky, review, oběd, čtení e-mailů. Reálně programuješ třeba 5 hodin denně, ne 8.

:::check
Jaká je hlavní výhoda rozpadnutí jednoho velkého úkolu na několik menších (sub-tasků)?
:::

## Kdy říct o pomoc (Timeboxing)

Jsi zablokovaný na problému a nevíš, jak dál. Máš se ptát hned, nebo s tím bojovat sám?

Zaveď si pravidlo **Timeboxu** (typicky 30–60 minut).
- Pokud se na něčem zasekneš, dej si časový limit (např. 45 minut), kdy zkusíš všechno možné (Google, StackOverflow, dokumentace).
- Pokud to nevyřešíš v tomto limitu, zeptej se někoho zkušenějšího.
- Tím prokážeš, že ses snažil problém vyřešit sám, ale nepropálíš celý den na problému, který by kolega vyřešil za dvě minuty, protože ví o historickém bugu v knihovně.

> [!PITFALL]
> Nechoď za seniorem s otázkou "Ono to nefunguje". Přijď s připraveným postupem: "Snažím se udělat X. Zkoušel jsem A a B. Dostal jsem chybovou hlášku Y. Myslím, že by to mohlo být Z, ale nevím jak dál."

## Standupy a asynchronní komunikace

V mnoha týmech (zvlášť těch agilních) se dělají denní "standupy" – krátké, asi 15minutové schůzky (nebo zprávy na Slacku), kde každý shrne tři věci:
1. Co jsem dělal včera.
2. Co budu dělat dnes.
3. Co mě blokuje (zda na někoho čekám).

Pokud komunikujete přes chat (Slack, Teams), pamatuj na to, že asynchronní komunikace vyžaduje co nejvíce kontextu v jedné zprávě.

- **Špatně:** "Ahoj Karle." (a čekáš na odpověď)
- **Lépe:** "Ahoj Karle, mohl by ses prosím kouknout na PR #123? Omezuje to práva admina podle včerejší dohody." (Karel má hned všechny informace a může odpovědět, až bude mít čas).

## Definition of Done (DoD)

Než začneš pracovat, musíte se v týmu shodnout na tom, kdy je práce vlastně "hotová" (Definition of Done).
Zahrnuje "hotovo" i napsání testů? Nebo nahrání na testovací prostředí? Nebo aktualizaci dokumentace? Vždy si to ujasni předem.

## Kde to najdeš v MDN a jinde

- [No Hello](https://nohello.net/en/) - Proč bys v chatu nikdy neměl poslat jen zprávu "Ahoj".

# --questions--

1. K čemu slouží technika "Timebox", když řešíš zákeřnou chybu v kódu?
2. Co obvykle obsahuje "Definition of Done" (DoD) úkolu?
3. Proč je v asynchronní komunikaci (na chatu) neefektivní posílat jen pozdravy a čekat na odpověď, než napíšeš svou otázku?
