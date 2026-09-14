# Jak řešit úlohu

:::check pretest
Když dostaneš úkol postavit na webu jednoduchou kalkulačku, co bys měl udělat jako první?

### --answer--

Otevřít editor a začít psát kód.

#### --why--

Pokud začneš hned psát kód, velmi rychle se zasekneš v detailech jazyka a zapomeneš na logiku. Jazyk ti úlohu nevyřeší.

### --correct--

Rozmyslet si, jak bys to spočítal v hlavě s tužkou a papírem.

### --answer--

Najít si podobný kód na internetu a zkusit ho přepsat.

#### --why--

Přepisování cizího kódu je častá past. Výsledku nebudeš rozumět a neubráníš se chybám, když bude tvoje zadání trošku jiné.
:::

Nejtěžší na programování není syntaxe (zda se píšou kulaté nebo hranaté závorky). Nejtěžší je vymyslet postup — jak přeložit lidské zadání na kroky, které zvládne tupý počítač. Říká se tomu **algoritmizace**.

Tato lekce je krátká, ale je to nejdůležitějších 5 minut kurzu. Naučí tě postup, jak řešit jakýkoli problém a nezamrznout před bílou obrazovkou editoru.

> [!REMEMBER]
> **Kód je až poslední krok.** Než napíšeš první středník, musíš přesně vědět, co tvůj program dělá. Lidský mozek nedokáže zároveň vymýšlet řešení problému a vzpomínat na syntaxi JavaScriptu. Rozděl si to.

## Čtyři kroky řešení

Kdykoli narazíš na problém (ve workshopu, v projektu, nebo v práci na úkolu), nezačínej hned psát kód. Aplikuj tenhle postup:

1. **Přeformuluj problém**
   Pochopils ho? Řekni to nahlas vlastními slovy. Jaké máš vstupy a co přesně se očekává na výstupu?
2. **Udělej si příklady z reálného světa**
   Vymysli si konkrétní hodnoty. Například „Když přijde 10, očekávám na konci 15“. Rozmysli si hranice — co když zadám 0? Co když zadám text? Tyto okrajové případy (edge cases) kód vždycky rozbijí, tak na ně buď připraven.
3. **Rozděl to na kroky (pseudokód)**
   Tohle je tajná zbraň programátorů. Napiš si postup krok za krokem normální lidskou řečí přímo do editoru jako komentáře. Nestaraj se o JavaScript, prostě napiš „1. založ počítadlo na nulu, 2. projdi všechny prvky, 3. pokud je kladný, přičti jedničku“.
4. **Přelož komentáře do kódu**
   Teď, a až teď, začni psát kód pod své komentáře. Pokud se zasekneš, aspoň víš přesně proč — máš perfektní logiku, ale nevíš si rady se syntaxí jednoho kroku. S tím už ti MDN nebo AI hravě pomůže.

:::explain
Vysvětli, proč se programátoři snaží vymýšlet řešení v tzv. pseudokódu (jako české věty v komentářích), než začnou psát skutečný kód.

## --model--

Řešit logický problém a zároveň vzpomínat na správnou syntaxi jazyka je pro mozek moc velká zátěž. Když napíšu řešení jako české kroky, soustředím se jen na logiku. Získám tak jasný plán. Teprve v druhém kole tenhle plán řádek po řádku překládám do JavaScriptu. Kód je jen implementační detail promyšleného postupu.

## --checklist--

- Vymýšlet algoritmus a syntaxi zároveň je zbytečně těžké.
- Rozděluje to problém na logickou a jazykovou část.
- Tvoří to jasný plán, co se má udít krok za krokem.
:::

## Manuální test nanečisto

Jakmile máš svůj postup na papíře nebo v komentářích, vyzkoušej si to s tužkou (tzv. dry run). Staň se na chvíli počítačem. Vezmi si svůj příklad a projdí krok za krokem ten svůj pseudokód. Mění se proměnné tak, jak čekáš? Zastaví cyklus správně?

Zní to zdlouhavě, ale deset minut na papíře s ušetří hodinu zoufalého ladění chyb v DevTools.

:::check
Jaká z následujících myšlenek ukazuje nejlepší přístup k novému zadání?

### --answer--

Tady na ten řádek napíšu `reduce` a zkusím spustit kód, snad to vyjde.

#### --why--

Programování pokus-omyl funguje na jednoduchých věcech, ale u větších úkolů vytvoří nepředvídatelný zmatek.

### --answer--

Požádám AI, ať mi vygeneruje hotový kód.

#### --why--

Sice dostaneš kód rychle, ale nevíš, jak problém rozebrat a co dělat, když kód selže v nějakém speciálním případě.

### --correct--

Nejdřív napíšu jako komentáře to, co bych jinak dělal na papíře s tabulkou hodnot.
:::

## Kde to najdeš v MDN

Při vymýšlení logiky v pseudokódu v žádné dokumentaci hledat nemusíš. Tam se podíváš až v kroku 4, když nevíš, jak napsat konkrétní metodu.

# --questions--

## --question--

Co bys měl dělat s úskalími a "divnými" stavy (např. prázdné pole, nula, podivná desetinná místa) při vymýšlení řešení?

### --expected--

Myslet na ně předem a uvést je jako příklady okrajových případů.

### --accept--

Vymyslet si k nim příklad s okrajem.
Vypíšu si je v rámci příkladů, abych na ně myslel.

### --why--

Když odhalíš nestandardní situace už ve fázi návrhu (přemýšlení nad vstupy), zabuduješ do kódu pro ně řešení nebo brzdu přirozeně a hned napoprvé.

### --see--

js-zaklady/reseni-problemu#ctyri-kroky-reseni
