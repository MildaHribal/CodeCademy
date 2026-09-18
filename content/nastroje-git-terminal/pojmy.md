## --term-- roura
en: pipes
aliases: roury, rourami, rouru
lekce: nastroje-git-terminal/terminal-do-hloubky#roury-vystup-jednoho-je-vstup-druheho

Znak `|` v terminálu, který vezme výstup z jednoho programu a pošle ho jako vstup do dalšího programu. Umožňuje řetězit jednoduché příkazy.

## --term-- přesměrování
en: redirection
aliases: přesměrováním, přesměrování
lekce: nastroje-git-terminal/terminal-do-hloubky#presmerovani-do-souboru

Přesměrování výstupu (pomocí `>`) do souboru, nebo vstupu (pomocí `<`) ze souboru, místo aby šel na standardní výstup (obrazovku) nebo vstup (klávesnici).

## --term-- návratový kód
en: exit code
aliases: návratového kódu, návratový kód
lekce: nastroje-git-terminal/terminal-do-hloubky#tri-proudy-a-navratovy-kod

Číslo, které program po svém skončení předá operačnímu systému. Kód `0` znamená úspěch, nenulová hodnota znamená chybu. Využívá se s operátorem `&&`.

## --term-- chybový výstup
en: standard error
aliases: chybový výstup, chybového výstupu
lekce: nastroje-git-terminal/terminal-do-hloubky#tri-proudy-a-navratovy-kod

Jeden ze tří základních proudů v terminálu (stderr), do kterého programy zapisují chybové zprávy. Je oddělený od standardního výstupu (stdout).

## --term-- PATH
en: PATH
aliases: PATH
lekce: nastroje-git-terminal/terminal-do-hloubky#promenne-prostredi-a-path

Proměnná prostředí, která obsahuje seznam složek. Když napíšeš příkaz, systém v těchto složkách hledá spustitelný soubor s daným názvem.

## --term-- proces
en: process
aliases: procesy, procesu, proces
lekce: nastroje-git-terminal/terminal-do-hloubky#procesy-a-porty

Běžící instance programu v operačním systému. Každý proces má své unikátní číslo (PID) a může běžet na popředí nebo na pozadí.

## --term-- SSH klíč
en: SSH key
aliases: SSH klíče, SSH klíčem, SSH klíč
lekce: nastroje-git-terminal/terminal-do-hloubky#ssh-prihlaseni-klicem

Kryptografický pár klíčů (veřejný a soukromý) pro bezpečné ověření identity. Nahrazuje přihlašování heslem při komunikaci se servery nebo GitHubem.

## --term-- head
en: HEAD
aliases: HEAD
lekce: nastroje-git-terminal/git-model#head-a-odpojeny-head

Ukazatel v Gitu, který označuje tvůj aktuální pracovní commit (kde se nacházíš). Obvykle ukazuje na jméno větve, ale může ukazovat i přímo na commit.

## --term-- detached-head
en: detached HEAD
aliases: odpojený HEAD
lekce: nastroje-git-terminal/git-model#head-a-odpojeny-head

Stav, kdy HEAD ukazuje přímo na konkrétní commit (hash) místo na větev. Pokud v tomto stavu vytvoříš nové commity, nebudou patřit do žádné větve.

## --term-- větev
en: branch
aliases: větve, větví, větev
lekce: nastroje-git-terminal/git-model#vetev-je-ukazatel

Pojmenovaný ukazatel na konkrétní commit, který se automaticky posouvá vpřed s každým novým commitem. Umožňuje izolovanou práci na nové funkcionalitě.

## --term-- fast-forward
en: fast-forward
aliases: fast-forward
lekce: nastroje-git-terminal/workshop-vetve-a-konflikty

Situace při spojování (merge) větví, kdy cílová větev nemá žádné nové commity od chvíle, kdy se z ní zdrojová větev oddělila. Git jen posune ukazatel dopředu.

## --term-- merge commit
en: merge commit
aliases: merge commitu, merge commit
lekce: nastroje-git-terminal/workshop-vetve-a-konflikty

Speciální commit, který má dva rodiče. Vzniká při spojování dvou větví, které se nezávisle na sobě vyvíjely (nelze použít fast-forward).

## --term-- rebase
en: rebase
aliases: rebasing, rebase
lekce: nastroje-git-terminal/workshop-vetve-a-konflikty

Operace, která vezme commity z aktuální větve a "přehraje" je jeden po druhém na vrchol jiné větve, čímž udrží historii lineární, ale změní hashe commitů.

## --term-- konflikt
en: merge conflict
aliases: konfliktu, konflikty, konflikt
lekce: nastroje-git-terminal/workshop-vetve-a-konflikty

Situace, kdy se ve dvou větvích upravil stejný řádek kódu různým způsobem a Git neví, kterou verzi použít při jejich spojení. Značí se `<<<<<<<`.

## --term-- tag
en: tag
aliases: štítek, tag, tagy
lekce: nastroje-git-terminal/workshop-vetve-a-konflikty

Pevný pojmenovaný ukazatel na konkrétní commit. Narozdíl od větve se neposouvá s novými commity. Typicky se používá pro označení verzí (např. v1.0.0).

## --term-- stash
en: stash
aliases: stashe, stashi, stash
lekce: nastroje-git-terminal/workshop-vetve-a-konflikty

Dočasné odložení rozdělaných (necommitnutých) změn. Vyčistí pracovní složku, abys mohl přejít na jinou větev, a později můžeš změny obnovit.

## --term-- reflog
en: reflog
aliases: reflogu, reflog
lekce: nastroje-git-terminal/git-zachrana#reflog-kde-byl-head

Deník v Gitu, který zaznamenává každou změnu ukazatele HEAD (kam jsi přepínal větve, resetoval, commitoval). Pomáhá najít ztracené commity.

## --term-- revert
en: revert
aliases: revertu, revert
lekce: nastroje-git-terminal/git-zachrana#revert-oprava-bez-prepisovani-historie

Příkaz, který vytvoří nový commit, jehož úpravy přesně ruší změny provedené v jiném (minulém) commitu. Bezpečná cesta, jak vzít změnu zpět.

## --term-- cherry-pick
en: cherry-pick
aliases: cherry-picku, cherry-pick
lekce: nastroje-git-terminal/git-zachrana#commit-na-spatne-vetvi-cherry-pick

Příkaz, který vezme konkrétní commit z jedné větve a aplikuje jeho změny jako nový commit do tvé aktuální větve.

## --term-- bisect
en: bisect
aliases: bisectu, bisect
lekce: nastroje-git-terminal/git-zachrana#hledani-chyby-bisect

Nástroj v Gitu, který používá binární vyhledávání k rychlému nalezení commitu, který do kódu zanesl konkrétní chybu (bug).

## --term-- staging area
en: staging area
aliases: staging area, staging
lekce: nastroje-git-terminal/git-model#tri-mista-kde-ziji-zmeny

Místo, kam přidáváš změny (přes `git add`), které se chystáš zabalit do dalšího commitu. Teprve po `git commit` se tyto změny uloží do historie.

## --term-- hash commitu
en: commit hash
aliases: hash commitu
lekce: nastroje-git-terminal/git-model#commit-snimek-s-rodicem

Unikátní identifikátor commitu (často např. zkráceně na prvních 7 znaků). Zabezpečuje integritu historie.

## --term-- graf commitů
en: commit graph
aliases: graf commitů
lekce: nastroje-git-terminal/git-model#graf-commitu

Struktura, jakou na sebe commity navazují pomocí odkazů na své rodiče. Git vizualizuje tyto návaznosti do struktury podobné stromu.
