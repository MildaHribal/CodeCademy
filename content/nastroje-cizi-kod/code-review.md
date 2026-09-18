# Code review

:::check pretest
1. Co bys měl jako reviewer hledat v cizím kódu? Jsou to spíš překlepy a mezery, nebo celková logika?
2. Jak bys měl reagovat, když ti kolega v review napíše, že tvůj kód je nepřehledný?
:::

Code review (kontrola kódu) je proces, kdy vývojáři kontrolují kód svých kolegů předtím, než se začlení do hlavní větve. Je to jedna z nejdůležitějších dovedností seniorního vývojáře.

> [!REMEMBER]
> Cílem code review není hledat chyby autora, ale zajistit, že výsledný kód v hlavní větvi je kvalitní, bezpečný a srozumitelný. Review je konverzace, ne zkouška.

## Co hlídat (a co ignorovat)

Jako reviewer se zaměř na **vysokoúrovňové** věci. Stroje by měly dělat strojovou práci.

**Co kontrolovat (ano):**
- **Správnost:** Dělá kód to, co se od něj žádá? Řeší okrajové případy?
- **Architektura:** Patří tahle logika do této komponenty? Nevytváří kruhové závislosti?
- **Čitelnost:** Jsou názvy proměnných srozumitelné? Není funkce příliš dlouhá? Dává smysl zítra ráno i tobě?
- **Testy:** Jsou přiloženy testy nového chování? Zkouší i chybové stavy?
- **Bezpečnost:** Nehrozí tady SQL injection, XSS? Nepsal někdo tajné klíče přímo do kódu?

**Co ignorovat (přenechat strojům):**
- **Styl a formátování:** Chybějící mezery, středníky, uvozovky. Tohle má chytat linter (ESLint) a formatter (Prettier). Pokud se o to dohadujete, máte špatně nastavené nástroje.

:::check
Proč by ses při review neměl soustředit na to, jestli jsou použité jednoduché nebo dvojité uvozovky?
:::

## Jak psát srozumitelné komentáře

Špatně napsaný komentář může způsobit hádku, zdržení nebo zranit ego. Dobrý komentář vysvětluje *proč* něco navrhuješ.

- **Špatně:** "Přejmenuj tohle."
- **Lépe:** "Název `data` je moc obecný. Nechtěli bychom to přejmenovat na `userData`, aby bylo jasné, co tam je?" (Otázka je jemnější než příkaz).
- **Špatně:** "Tohle je pomalé."
- **Lépe:** "Když máme v poli tisíce prvků, `.find()` v cyklu to zbytečně zpomalí. Můžeme si to hodit do Setu nebo objektu hned nahoře."

> [!TIP]
> Pokud chceš upozornit na drobnou věc (např. překlep v komentáři), ale nechceš kvůli ní blokovat celý pull request, přidej prefix `nit:` (od slova nitpick - hnidopich). Např.: `nit: Zde chybí čárka v komentáři, ale klidně to oprav až v dalším PR.`

## Jak přijímat review bez ega

Když poprvé dostaneš na svůj kód 20 připomínek, může to bolet. Pamatuj si:
- **Nejsi tvůj kód.** Komentáře kritizují řádky textu na obrazovce, ne tebe jako člověka.
- **Ptej se, nedohaduj se.** Pokud něčemu nerozumíš, nebo nesouhlasíš, popros o vysvětlení. Můžeš to probrat v chatu nebo na zavolání, často se to vyřeší mnohem rychleji než nekonečným ping-pongem v komentářích.
- **Poděkuj.** Objevil reviewer skrytou chybu, která by ti jinak shodila produkci? Poděkuj mu. Zachránil ti zadek.

## Velikost Pull Requestu

Nejtěžší PR na review je to, které má 1000 změněných řádků. Lidé pak jen proscrollují dolů a napíšou "Vypadá to OK", protože se jim do toho nechce.

Snaž se tvořit PR do velikosti 200–300 řádků změn. Raději menší funkce, které se pak spojí dohromady.

## Kde to najdeš v MDN a jinde

- [Google's Engineering Practices documentation](https://google.github.io/eng-practices/review/reviewer/) - Proslulý průvodce od Googlu o tom, jak dělat code review.
- [How to Do Code Reviews Like a Human](https://mtlynch.io/human-code-reviews-1/) - Výborný článek o lidské stránce code review.

# --questions--

1. Jaké problémy by v PR měly odhalovat automatizované nástroje (CI) a ne člověk?
2. Jak zní pravidlo, které odděluje kritiku tvé osoby od kritiky tvé práce během review?
3. Proč jsou velká PR (nad 500 řádků) často odsouhlasena bez pečlivého přečtení?
