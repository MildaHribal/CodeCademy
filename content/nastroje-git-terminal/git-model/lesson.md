# Jak Git myslí

:::check pretest
Co myslíš, co Git uloží, když uděláš commit po změně jednoho řádku v jednom souboru?

### --answer--
Jen ten změněný řádek, jako rozdíl oproti minulé verzi.

#### --why--
Tak to vypadá v `git diff`, ale uvnitř to Git ukládá jinak. Za chvíli uvidíš jak.

### --correct--
Podobu celého projektu v tu chvíli a odkaz na předchozí commit.

#### --why--
Commit je snímek celého projektu. Rozdíly si Git dopočítává, až když je chceš vidět.
:::

Příkazy `add`, `commit` a `push` zvládneš podle návodu. Jenže pak přijde hláška
`You are in 'detached HEAD' state`, kolega napíše „rebasni si to na main" nebo
po `git switch` zmizí soubor, na kterém jsi pracoval. Bez modelu v hlavě nezbývá
než kopírovat příkazy z internetu a doufat.

Model je přitom malý. Stačí tři pojmy: commit, větev a `HEAD`.

> [!REMEMBER]
> **Commit je snímek celého projektu s odkazem na rodiče. Větev je jen pohyblivý štítek s adresou jednoho commitu. `HEAD` říká, na kterém štítku právě stojíš.**

## Tři místa, kde žijí změny

Než se dostaneš ke commitům, připomeň si cestu změny:

| místo | anglicky | co v něm je | jak se tam změna dostane |
|---|---|---|---|
| pracovní složka | *working directory* | soubory, jak je vidíš v editoru | uložíš soubor |
| [[staging area]] | *staging area*, *index* | co půjde do příštího commitu | `git add soubor` |
| repozitář | *repository* | uložené commity ve složce `.git` | `git commit` |

`git add` není „označ soubor". Zkopíruje **obsah souboru v tu chvíli** do staging
area. Když soubor po `add` znovu upravíš, v příštím commitu bude verze z doby `add`:

```text
$ git add routes.js
$ echo "// další úprava" >> routes.js
$ git status
Changes to be committed:
	modified:   routes.js

Changes not staged for commit:
	modified:   routes.js
```

Tentýž soubor je tu dvakrát: jedna verze čeká na commit, druhá je jen v pracovní
složce.

:::check
Upravíš `styles.css`, dáš `git add styles.css`, pak v souboru změníš ještě barvu tlačítka a uděláš `git commit -m "Nové barvy"`. Je nová barva tlačítka v commitu?

### --answer--
Ano, commit bere soubory z disku.

#### --why--
Myslíš si, že commit čte pracovní složku? Bere jen to, co je ve staging area.

### --correct--
Ne, v commitu je verze ze chvíle `git add`. Barva tlačítka zůstala jen v pracovní složce.

#### --why--
`git add` vyfotí obsah souboru do staging area. Pozdější úpravy potřebují další `git add`.
:::

## Commit: snímek s rodičem

Každý commit má jednoznačné jméno — [[hash commitu]], 40 znaků jako
`ccc6270c107cb173…`. Většinou stačí prvních 7. Co v commitu doopravdy je, ukáže
`git cat-file -p`:

```text
$ git cat-file -p HEAD
tree b493577d838e7c126666e2979bf96aaffca8124f
parent 9ea2ba0f3e1d5c7a2b4e6f8091a3c5d7e9f1b2c4
author Jana Dvořáková <jana@example.cz> 1789571864 +0200
committer Jana Dvořáková <jana@example.cz> 1789571864 +0200

Oprav patičku
```

- `tree` je snímek **celého projektu** — všech souborů a složek. Nezměněné soubory
  Git neukládá znovu, jen na ně odkáže, takže snímky jsou levné.
- `parent` je hash předchozího commitu. Díky němu tvoří commity řetěz.
- Hash se počítá z obsahu, včetně rodiče a času. **Commit se proto nedá změnit.**
  Každá „úprava" (`--amend`, `rebase`) ve skutečnosti vyrobí nový commit s novým hashem.

První commit rodiče nemá. Commit, který spojuje dvě větve (merge commit), má
rodiče dva.

:::check
Opravíš překlep ve zprávě posledního commitu přes `git commit --amend`. Co se stane s hashem?

### --answer--
Zůstane stejný, změnila se jen zpráva.

#### --why--
Myslíš si, že zpráva do hashe nepatří? Hash se počítá ze všeho, co v commitu je, včetně zprávy.

### --correct--
Vznikne nový commit s novým hashem, starý zůstane v repozitáři jen bez štítku.

#### --why--
Commity jsou neměnné. `--amend` vyrobí nový commit se stejným rodičem a přesune na něj větev.
:::

## Větev je ukazatel

[[větev|Větev]] (*branch*) nic nekopíruje. Je to soubor, ve kterém je hash jednoho
commitu:

```text
$ cat .git/refs/heads/main
446986f9d316c6a8d0916de9d692d18e930718a9
```

- `git branch mapa` vytvoří nový štítek na **stejném** commitu, kde stojíš.
- `git commit` vytvoří commit, jehož rodičem je aktuální commit, a **posune
  aktuální větev** na ten nový. Ostatní větve se nehnou.
- `git switch mapa` přepne, na kterém štítku stojíš, a přepíše pracovní
  složku podle jeho snímku.

Model si vyzkoušej v obyčejném JavaScriptu. Větve jsou objekt se jmény a hashi,
`head` je jméno větve, na které stojíš:

:::live js predict
```js
const branches = { main: 'c2' };
let head = 'main';

branches['mapa'] = branches[head];
branches[head] = 'c3';

console.log(branches['mapa']);
```
--question-- Druhý řádek od konce dělá to, co `git commit` na větvi `main`. Na jaký commit ukazuje `mapa`?
--expected-- c2
--why-- Vytvoření větve zkopírovalo hash, ne vazbu na `main`. Commit posune jen větev, na které stojíš (`head`). `mapa` zůstala na `c2` — přesně tak se chová Git.
:::

Zkus v ukázce přepnout `head = 'mapa'` před posledním přiřazením a sleduj,
která větev se posune.

:::check
Stojíš na `main` a uděláš `git branch hotfix`. Pak uděláš dva commity. Kolik commitů má `main` navíc oproti `hotfix`?

### --expected--
2

### --why--
`hotfix` vznikla jako štítek na tehdejším commitu. Commity posunuly jen `main`, na které stojíš.
:::

## Graf commitů

Commity s odkazy na rodiče tvoří [[graf commitů]]. Tady je celá práce na mapě
cyklotras krok po kroku. Vlevo jsou jména (větve a `HEAD`), vpravo commity se
šipkou k rodiči:

:::memory
```sh
git commit -m "Přidej trasy"
git switch -c mapa
git commit -m "Přidej mapu"
git switch main
git commit -m "Oprav patičku"
git merge mapa
```
--step-- 1 | commit posune main
HEAD = 'main'
main -> @c2
@c2: c2 Přidej trasy (rodič @c1)
@c1: c1 První verze
--step-- 2 | nový štítek na stejném commitu, HEAD přešel na něj
HEAD = 'mapa'
main -> @c2
mapa -> @c2
@c2: c2 Přidej trasy (rodič @c1)
@c1: c1 První verze
--step-- 3 | posune se jen větev, na které stojíš
HEAD = 'mapa'
main -> @c2
mapa -> @c3
@c3: c3 Přidej mapu (rodič @c2)
@c2: c2 Přidej trasy (rodič @c1)
@c1: c1 První verze
--step-- 4 | přepnutí nic nemaže, jen mění HEAD a pracovní složku
HEAD = 'main'
main -> @c2
mapa -> @c3
@c3: c3 Přidej mapu (rodič @c2)
@c2: c2 Přidej trasy (rodič @c1)
@c1: c1 První verze
--step-- 5 | historie se rozdělila
HEAD = 'main'
main -> @c4
mapa -> @c3
@c4: c4 Oprav patičku (rodič @c2)
@c3: c3 Přidej mapu (rodič @c2)
@c2: c2 Přidej trasy (rodič @c1)
@c1: c1 První verze
--step-- 6 | merge commit má dva rodiče
HEAD = 'main'
main -> @c5
mapa -> @c3
@c5: c5 Merge branch 'mapa' (rodiče @c4 a @c3)
@c4: c4 Oprav patičku (rodič @c2)
@c3: c3 Přidej mapu (rodič @c2)
@c2: c2 Přidej trasy (rodič @c1)
@c1: c1 První verze
:::

Tentýž graf ukáže terminál. `--all` přidá i větve, na kterých nestojíš, `--decorate`
k commitům připíše štítky:

```text
$ git log --oneline --graph --all --decorate
*   446986f (HEAD -> main) Merge branch 'mapa'
|\
| * 2ce40c0 (mapa) Přidej mapu
* | ccc6270 Oprav patičku
|/
* 9ea2ba0 Přidej trasy
* add12af První verze
```

Čte se shora (nejnovější) dolů. Každá hvězdička je commit, čáry vedou k rodičům.
`HEAD -> main` znamená „stojíš na větvi `main`". Commit `446986f` má dva rodiče,
proto se do něj sbíhají dvě čáry.

> [!TIP]
> Tenhle příkaz budeš psát pořád. Ulož si ho jako alias:
> `git config --global alias.graph "log --oneline --graph --all --decorate"`
> a pak stačí `git graph`.

:::check
V grafu výše: na kterém commitu je rodič commitu `2ce40c0`? Napiš jeho zkrácený hash.

### --expected--
9ea2ba0

### --why--
Čára od `2ce40c0` vede dolů přes `|/` do commitu `9ea2ba0`. Z něj se historie rozdělila na dvě větve.
:::

## `HEAD` a odpojený `HEAD`

[[HEAD]] je ukazatel na to, kde právě jsi. Normálně neukazuje na commit, ale na
větev — `cat .git/HEAD` vypíše `ref: refs/heads/main`. Proto commit posune větev:
Git se podívá, na kterou větev `HEAD` míří, a posune ji.

Když přepneš přímo na commit (`git switch --detach 9ea2ba0`, nebo starším
`git checkout 9ea2ba0`), `HEAD` ukazuje na commit bez větve. To je
[[odpojený HEAD]] (*detached HEAD*):

```text
You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.
```

Prohlížet starou verzi takhle je v pořádku. Past přijde, když tu začneš commitovat:
nové commity nemají štítek, a jakmile přepneš jinam, nevede na ně žádná větev.

> [!PITFALL]
> Commit v odpojeném `HEAD` a pak `git switch main` vypíše
> `Warning: you are leaving 1 commit behind, not connected to any of your branches`.
> Commit nezmizel hned, ale v `git log` ho už neuvidíš. Chceš-li práci zachránit,
> dej mu štítek dřív, než odejdeš: `git switch -c pokus-s-barvami`. Když už jsi
> odešel, hash najdeš v hlášce (nebo v `git reflog`) a uděláš `git branch pokus-s-barvami 2afb76f`.

:::check
`git status` hlásí `HEAD detached at 9ea2ba0` a ty jsi tu udělal dva užitečné commity. Napiš příkaz, který na ně vytvoří větev `oprava-mapy` a přepne tě na ni.

### --expected--
git switch -c oprava-mapy

### --accept--
git checkout -b oprava-mapy

### --why--
Nová větev vznikne na commitu, kde stojíš, takže oba commity budou mít štítek a `HEAD` přestane být odpojený.
:::

:::explain
Vysvětli vlastními slovy, proč je přepnutí větve v Gitu tak rychlé, i když má projekt
tisíce souborů.

## --model--
Větev není kopie projektu — je to **štítek s adresou jednoho commitu**. Commity samy
jsou snímky celého projektu a každý z nich odkazuje na svého rodiče, takže historie
tvoří řetěz. Přepnutí větve proto neznamená nic kopírovat: Git jen přesune `HEAD` na
jiný štítek a doplní do pracovního adresáře rozdíl mezi tím, co tam je, a tím, co
patří k novému commitu. Proto se větev vytvoří okamžitě a proto jich může existovat
libovolně mnoho, aniž by to stálo místo.

## --checklist--
- Větev je jen štítek s adresou jednoho commitu.
- Commity tvoří řetěz přes odkazy na rodiče.
- Přepnutí přesune `HEAD` a dorovná jen rozdíl souborů.
- Nová větev proto nic nekopíruje a nic nestojí.
:::

## Typické chyby a pasti

> [!PITFALL]
> **„Větev je kopie projektu."** Není. Neuložené změny v pracovní složce patří
> jen pracovní složce, takže je `git switch` přenese s sebou na druhou větev. Když by
> je přepnutí přepsalo, Git odmítne:
> `error: Your local changes to the following files would be overwritten by checkout`.
> Nejdřív commitni, nebo změny odlož (`git stash`, uvidíš ve workshopu).

> [!PITFALL]
> **Commit bez `add`.** `git commit -m "Oprava"` hned po úpravě souboru vypíše
> `no changes added to commit` a nic neuloží. Nový soubor bez `git add` Git vůbec
> nesleduje — `git status` ho ukáže pod `Untracked files`.

> [!PITFALL]
> **`git log` neukazuje „ztracenou" větev.** Bez `--all` ukáže jen historii od `HEAD`
> dozadu. Commity na jiných větvích tam nejsou, i když v repozitáři jsou.

## Kde to najdeš v MDN

- [Version control](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Version_control) —
  proč verzovat, základní pojmy Gitu a GitHubu.
- [Git Branching — Branches in a Nutshell](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell) —
  MDN do hloubky nejde; kniha Pro Git kreslí commity, větve a `HEAD` přesně jako tahle lekce.
  Česky je [celá kniha](https://git-scm.com/book/cs/v2) i s touhle kapitolou.
- `git help log` — všechny přepínače `git log`, včetně `--graph` a formátování.

# --questions--

## --question--

Stojíš na `main` (commit `c4`). Uděláš `git switch -c redesign`, jeden commit a pak `git switch main`. Na jaký commit ukazuje `HEAD` přes větev `main`?

### --expected--
c4

### --why--
Commit posunul jen `redesign`, protože jsi na ní stál. `main` zůstala na `c4` a přepnutím se na ni vrátíš.

### --see--

nastroje-git-terminal/git-model#vetev-je-ukazatel

## --question--

Kolega tvrdí, že větve jsou drahé, protože každá kopíruje celý projekt, a proto dělá všechno na `main`. Co je na tom špatně?

### --answer--
Nic, proto se větve po mergi mažou.

#### --why--
Myslíš si, že větev nese vlastní kopii souborů? Větve se mažou kvůli přehlednosti, ne kvůli místu.

### --correct--
Větev je jen soubor s hashem jednoho commitu, vytvořit ji nestojí skoro nic.

#### --why--
Snímky jsou uložené v commitech a větev na jeden z nich jen ukazuje. Tisíc větví zabere pár kilobajtů.

### --see--

nastroje-git-terminal/git-model#vetev-je-ukazatel

## --question--

Kolik rodičů má commit, který vznikl příkazem `git merge mapa`, když se historie `main` a `mapa` rozdělila?

### --expected--
2

### --why--
Merge commit spojuje dvě linie historie, proto odkazuje na poslední commit obou větví.

### --see--

nastroje-git-terminal/git-model#graf-commitu

## --question--

Proč Git ve stavu odpojeného `HEAD` varuje, když odcházíš s novými commity?

### --expected--
Protože na ně nevede žádná větev.

### --accept--
Nevede na ně žádná větev
Nemají větev
Protože nemají větev
Commity nemají žádný štítek

### --why--
Větev je jediný trvalý štítek, přes který commit najdeš. Bez ní ho `git log` neukáže a Git ho časem smaže.

### --see--

nastroje-git-terminal/git-model#head-a-odpojeny-head
