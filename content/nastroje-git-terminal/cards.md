## --card-- output

Co vypíše tahle roura?

```sh
printf '3\n10\n2\n' | sort | head -n 1
```

### --expected--

10

### --why--

Myslíš si, že `sort` řadí čísla podle velikosti? Bez `-n` řadí text znak po znaku a `1` je před `2` i `3`.

### --see--

nastroje-git-terminal/terminal-do-hloubky#roury-vystup-jednoho-je-vstup-druheho

## --card-- output

Co vypíše tahle roura?

```sh
echo "2026-09-01;Espresso;55" | cut -d ';' -f 2
```

### --expected--

Espresso

### --why--

`-d ';'` nastaví oddělovač a `-f 2` vybere druhý sloupec. Sloupce se číslují od jedničky.

### --see--

nastroje-git-terminal/terminal-do-hloubky#roury-vystup-jednoho-je-vstup-druheho

## --card-- output

Co vypíše poslední příkaz?

```sh
echo "Latte" > menu.txt
echo "Espresso" > menu.txt
cat menu.txt
```

### --expected--

Espresso

### --why--

Myslíš si, že druhé `>` připíše řádek? `>` soubor před zápisem vyprázdní, připisuje až `>>`.

### --see--

nastroje-git-terminal/terminal-do-hloubky#presmerovani-do-souboru

## --card-- output

Složka `nic` neexistuje. Co vypíše tenhle řádek na standardní výstup?

```sh
cd nic && echo "jsem uvnitř" ; echo "konec"
```

### --expected--

konec

### --why--

`cd` selže (hláška jde na chybový výstup), `&&` přeskočí první `echo`. Středník za ním začíná nový příkaz, který běží vždycky.

### --see--

nastroje-git-terminal/terminal-do-hloubky#skladani-prikazu-podle-vysledku

## --card-- output

Co vypíše tenhle řádek?

```sh
test -f config.json || echo "Chybí config.json"
```

Soubor `config.json` ve složce není (`test -f` vrací 0, jen když soubor existuje).

### --expected--

Chybí config.json

### --why--

`||` spustí druhý příkaz jen tehdy, když první skončí nenulovým kódem.

### --see--

nastroje-git-terminal/terminal-do-hloubky#skladani-prikazu-podle-vysledku

## --card-- output

Stojíš na větvi `main`. Co vypíše `cat .git/HEAD`?

### --expected--

ref: refs/heads/main

### --why--

`HEAD` normálně neukazuje na commit, ale na větev. Commit pak posune tu větev, na kterou `HEAD` míří.

### --see--

nastroje-git-terminal/git-model#head-a-odpojeny-head

## --card-- output

Větev `feature/filtr` má oproti `main` dva commity navíc a `main` oproti ní jeden. Kolik řádků vypíše `git log --oneline main..feature/filtr`?

### --expected--

2

### --why--

`A..B` vypíše commity, které jsou v historii `B`, ale ne v historii `A`. Commit, který má jen `main`, se nepočítá.

### --see--

nastroje-git-terminal/workshop-vetve-a-konflikty/018

## --card-- output

Kolik rodičů má commit, který vytvoří `git revert a1b2c3d`?

### --expected--

1

### --why--

Revert je obyčejný nový commit s opačnými změnami na konci větve. Jeho rodičem je commit, na kterém jsi stál.

### --see--

nastroje-git-terminal/git-zachrana#revert-oprava-bez-prepisovani-historie

## --card-- output

Vytvoříš tag `git tag -a v2.0 -m "Nový web"`. Co vypíše `git cat-file -t v2.0`?

### --expected--

tag

### --why--

Anotovaný tag je samostatný objekt s autorem, datem a zprávou. Lehký tag bez `-a` je jen jméno commitu a vypsalo by se `commit`.

### --see--

nastroje-git-terminal/workshop-vetve-a-konflikty/009

## --card-- output

Soubor `.env` je v posledním commitu. Co vypíše `git status --short` po příkazu `git rm --cached .env` (bez `.gitignore`)?

### --expected--

```text
D  .env
?? .env
```

### --why--

Z pohledu Gitu se soubor z repozitáře maže (připraveno ke commitu), ale na disku zůstal, takže ho zároveň vidí jako nesledovaný. Druhý řádek zmizí po přidání `.env` do `.gitignore`.

### --see--

nastroje-git-terminal/git-zachrana#commitnute-tajemstvi

## --card-- output

Na čisté větvi dvakrát po sobě upravíš soubor a pokaždé spustíš `git stash`. Co vypíše `git stash list | wc -l`?

### --expected--

2

### --why--

Každé `git stash` přidá novou položku na vrchol schránky. Nejnovější je `stash@{0}`.

### --see--

nastroje-git-terminal/workshop-vetve-a-konflikty/013

## --card-- free

Jaký je rozdíl mezi `git merge` a `git rebase`? Kdy použiješ který?

### --back--

Merge spojí dvě linie historie merge commitem se dvěma rodiči a nic nepřepisuje. Rebase
přehraje commity větve na nový základ, vzniknou nové commity s novými hashi a historie je
rovná. Rebase používám na vlastní, ještě nesdílené větve, abych je před sloučením srovnal
s `main`. Na větve, které mají i ostatní, používám merge, protože přepsaná historie by se
jim rozešla s jejich.

### --see--

nastroje-git-terminal/workshop-vetve-a-konflikty/011

## --card-- free

Co je v Gitu commit a co je větev?

### --back--

Commit je neměnný snímek celého projektu s odkazem na rodiče, pojmenovaný hashem
spočítaným z obsahu. Větev je jen pohyblivý ukazatel na jeden commit. Při novém commitu
se posune větev, na kterou míří `HEAD`. Proto je vytvoření větve levné a smazání větve
commity nemaže.

### --see--

nastroje-git-terminal/git-model#vetev-je-ukazatel

## --card-- free

Kdy použiješ `git reset` a kdy `git revert`?

### --back--

`reset` posouvá větev zpátky a commity za ní z větve zmizí, takže přepisuje historii.
Hodí se jen na lokální commity, které ještě nikdo nemá. `revert` přidá nový commit
s opačnými změnami a historii jen prodlouží, takže je bezpečný pro sdílenou větev
jako `main` na serveru.

### --see--

nastroje-git-terminal/git-zachrana#revert-oprava-bez-prepisovani-historie

## --card-- free

Do veřejného repozitáře ti omylem odešel soubor s API klíčem. Co uděláš?

### --back--

Nejdřív klíč zneplatním a vygeneruju nový, protože cokoli pushnutého je prozrazené
a smazání v dalším commitu ho z historie ani z kopií neodstraní. Pak soubor přestanu
sledovat přes `git rm --cached`, přidám ho do `.gitignore` a commitnu. Přepis historie
(`git filter-repo`) je jen doplněk, klíč tím nezachráním.

### --see--

nastroje-git-terminal/git-zachrana#commitnute-tajemstvi

## --card-- free

Aplikace fungovala před měsícem a teď ne. Jak najdeš commit, který chybu zavedl?

### --back--

Použiju `git bisect`: označím dobrý commit (třeba tag verze) a špatný `HEAD`, Git mě
přepíná doprostřed a já říkám „good" nebo „bad". Každý krok rozpůlí zbývající commity,
takže na stovky commitů stačí pár kroků. Když chybu pozná skript návratovým kódem, pustím
`git bisect run` a na konci `git bisect reset`.

### --see--

nastroje-git-terminal/git-zachrana#hledani-chyby-bisect

## --card-- free

Co je návratový kód programu a proč na něm záleží?

### --back--

Číslo, které program vrátí při skončení: 0 znamená úspěch, cokoli jiného chybu. Podle
něj se rozhoduje `&&` a `||` v terminálu, `set -e` ve skriptech, `git bisect run` i CI,
jestli pokračovat. Program, který vypíše chybu, ale vrátí 0, je pro automatizaci úspěšný.

### --see--

nastroje-git-terminal/terminal-do-hloubky#tri-proudy-a-navratovy-kod

## --card-- free

Dev server hlásí `EADDRINUSE: address already in use :::3000`. Jak postupuješ?

### --back--

Port drží jiný proces, nejčastěji zapomenutý server. Přes `lsof -i :3000` nebo
`ss -ltnp` najdu jeho PID a ukončím jen ten proces přes `kill PID`. `kill -9` použiju,
až když nereaguje. Nikdy ne `killall node`, to by ukončilo i jiné programy v Node.

### --see--

nastroje-git-terminal/terminal-do-hloubky#procesy-a-porty
