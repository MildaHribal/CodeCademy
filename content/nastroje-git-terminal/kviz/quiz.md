---
pass: 0.8
---

# --questions--

## --question--

Kolik řádků vypíše tahle roura?

```sh
printf 'Brno\nPraha\nBrno\nPraha\n' | uniq | wc -l
```

### --expected--
4

### --why--
`uniq` spojuje jen **sousední** stejné řádky. Tady se žádné dva stejné řádky nedotýkají, takže projdou všechny čtyři. Aby vyšly 2, musí před `uniq` být `sort`.

### --see--

nastroje-git-terminal/terminal-do-hloubky#roury-vystup-jednoho-je-vstup-druheho

## --question--

Spustíš `node build.js 2>&1 > build.log`. Build vypíše „Sestavuji 12 stránek" přes `console.log` a „Chybí obrázek hero.webp" přes `console.error`. Co uvidíš v terminálu?

### --answer--
Nic, obojí skončí v `build.log`.

#### --why--
Myslíš si, že na pořadí přesměrování nezáleží? `2>&1` se vyhodnotí dřív, než stdout vede do souboru.

### --answer--
Obě hlášky, soubor zůstane prázdný.

#### --why--
Myslíš si, že `2>&1` na začátku přesměrování zruší? Standardní výstup `> build.log` do souboru pošle.

### --correct--
Jen „Chybí obrázek hero.webp".

#### --why--
Shell čte zleva: stderr se napojí tam, kam právě vede stdout (terminál), a teprve pak se stdout přesměruje do souboru.

### --see--

nastroje-git-terminal/terminal-do-hloubky#presmerovani-do-souboru

## --question--

`build.log` neobsahuje slovo `ERROR`. Co vypíše druhý příkaz?

```sh
grep -q "ERROR" build.log
echo $?
```

### --expected--
1

### --why--
`grep` vrací 0, když něco najde, a 1, když nenajde. `-q` jen potlačí výpis řádků, návratový kód zůstává.

### --see--

nastroje-git-terminal/terminal-do-hloubky#tri-proudy-a-navratovy-kod

## --question--

ESLint je v projektu nainstalovaný (`node_modules/.bin/eslint` existuje), ale `eslint .` v terminálu hlásí `eslint: command not found`. Proč?

### --answer--
Instalace se nepovedla a je potřeba ji zopakovat.

#### --why--
Myslíš si, že hláška znamená chybějící balíček? Program na disku je, shell ho jen nenašel.

### --answer--
Soubor `eslint` nemá práva ke spuštění.

#### --why--
Myslíš si, že jde o práva? Chybějící práva hlásí `Permission denied`, ne `command not found`.

### --correct--
Složka `node_modules/.bin` není v `PATH`, proto se spouští přes `npx eslint .` nebo skript v `package.json`.

#### --why--
Shell hledá programy jen ve složkách z `PATH`. `npx` a npm skripty si `node_modules/.bin` přidají samy.

### --see--

nastroje-git-terminal/terminal-do-hloubky#promenne-prostredi-a-path

## --question--

`main` ukazuje na commit `c3`. Spustíš postupně `git switch -c oprava-odkazu`, uděláš jeden commit, `git switch main` a `git merge oprava-odkazu`. Kolik nových commitů vytvoří samotný příkaz `git merge`?

### --expected--
0

### --why--
Na `main` mezitím nic nepřibylo, takže merge je fast-forward: jen posune štítek `main` na commit z větve.

### --see--

nastroje-git-terminal/workshop-vetve-a-konflikty/004

## --question--

Větev `feature/kosik` je pushnutá a pracuje na ní i kolegyně. Chceš do ní dostat novinky z `main`. Co uděláš?

### --answer--
`git rebase main` a pak `git push --force`.

#### --why--
Myslíš si, že rebase jen přidá commity? Přepíše commity větve na nové, a kolegyni se po force pushi historie rozejde s tou na serveru.

### --correct--
`git merge main` na větvi `feature/kosik` a běžný push.

#### --why--
Merge historii jen prodlouží o merge commit. Nic sdíleného se nepřepisuje, takže push projde a kolegyně si změny stáhne.

### --see--

nastroje-git-terminal/git-zachrana#zlate-pravidlo-neprepisuj-sdilenou-historii

## --question--

Commit „Nové ceny kávy" je týden na `main` na GitHubu a obsahuje chybu. Jak ho vrátíš?

### --answer--
`git reset --hard` na commit před ním.

#### --why--
Myslíš si, že lokální reset opraví server? Tvůj `main` by se rozešel se serverem a push by byl odmítnutý.

### --answer--
Smažeš commit na GitHubu a všichni si repozitář naklonují znovu.

#### --why--
Myslíš si, že jiná cesta není? Existuje příkaz, který změny vrátí novým commitem bez zásahu do historie.

### --correct--
`git revert` s hashem commitu a běžný push.

#### --why--
Revert vytvoří nový commit s opačnými změnami. Historie se jen prodlouží a nikomu se nic nepřepisuje.

### --see--

nastroje-git-terminal/git-zachrana#revert-oprava-bez-prepisovani-historie

## --question--

`git log --oneline` vypisuje 5 commitů. Spustíš `git reset --soft HEAD~2`. Kolik řádků teď vypíše `git log --oneline`?

### --expected--
3

### --why--
Reset posunul větev o dva commity zpátky, takže od `HEAD` je vidět jen tři. Změny z obou commitů zůstaly připravené ve staging area.

### --see--

nastroje-git-terminal/git-zachrana#reset-posun-vetev-zpatky

## --question--

Při `git merge feature/novinky` na `main` vznikl v souboru tenhle konflikt. Který řádek pochází z větve `feature/novinky`?

```text
<<<<<<< HEAD
  <h2>Novinky z pražírny</h2>
=======
  <h2>Co je nového</h2>
>>>>>>> feature/novinky
```

### --answer--
`<h2>Novinky z pražírny</h2>`

#### --why--
Myslíš si, že horní část je slučovaná větev? Nahoře mezi `<<<<<<< HEAD` a `=======` je verze větve, na které stojíš.

### --correct--
`<h2>Co je nového</h2>`

#### --why--
Spodní část mezi `=======` a `>>>>>>> feature/novinky` je verze slučované větve.

### --see--

nastroje-git-terminal/workshop-vetve-a-konflikty/007

## --question--

V anglické dokumentaci příkazu `git bisect` (část o `bisect run`) najdi, jakým návratovým kódem má skript oznámit, že aktuální commit nejde otestovat a bisect ho má přeskočit.

### --expected--
125

### --why--
Kód 0 znamená dobrý commit, 1–127 kromě 125 špatný a 125 „přeskoč". Hodí se, když se starší commit nedá ani sestavit.

### --see--

nastroje-git-terminal/git-zachrana#hledani-chyby-bisect

## --question--

Na větvi s rozdělanou prací spustíš `git stash`, přepneš se na `main`, zpátky na větev a spustíš `git stash apply`. Kolik položek teď vypíše `git stash list`?

### --expected--
1

### --why--
`apply` práci vrátí, ale položku ve schránce nechá. Smazal by ji `git stash pop` (nebo `git stash drop`).

### --see--

nastroje-git-terminal/workshop-vetve-a-konflikty/015

## --question--

Po `git bisect run` jsi zapomněl na `git bisect reset` a udělal jsi commit. Kde je?

### --answer--
Na větvi, na které jsi bisect začal.

#### --why--
Myslíš si, že bisect tě vrátí sám? Během bisectu stojíš na starém commitu bez větve.

### --correct--
V odpojeném `HEAD` na starém commitu, bez větve — dej mu štítek dřív, než odejdeš.

#### --why--
Bisect přepíná přímo na commity, takže nový commit nemá žádnou větev. Zachráníš ho přes `git switch -c` nebo později přes reflog.

### --see--

nastroje-git-terminal/git-model#head-a-odpojeny-head

# --code-- Nasazovací skript pražírny

## --file-- deploy.sh

```sh
#!/usr/bin/env bash
# Nasazení webu Pražírna Kolbenka na VPS.
# Použití: ./deploy.sh [větev]   (výchozí větev je main)

BRANCH=${1:-main}
SERVER=deploy@kolbenka.cz
TARGET=/var/www/kolbenka
LOG=deploy.log

echo "== Nasazení $(date +%F) ==" > $LOG

# Nenasazuj nic, co není v commitu.
if [ -n "$(git status --porcelain)" ]; then
  echo "Pracovní složka není čistá, commitni nebo odlož změny." >&2
  exit 1
fi

git fetch origin
git switch $BRANCH
git pull --ff-only origin $BRANCH >> $LOG 2>&1 || {
  echo "Pull selhal, podrobnosti v $LOG" >&2
  exit 1
}

VERSION=$(git describe --tags --abbrev=0)
echo "Verze: $VERSION" >> $LOG

npm ci >> $LOG 2>&1
npm test >> $LOG 2>&1
npm run build >> $LOG 2>&1

TODO_COUNT=$(grep -rn "TODO" src | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
  echo "Upozornění: v src zůstalo $TODO_COUNT TODO" >> $LOG
fi

rsync -az --delete dist/ $SERVER:$TARGET
ssh $SERVER "sudo systemctl reload nginx" && echo "Nginx znovu načten" >> $LOG

git tag -a "deploy-$(date +%Y%m%d)" -m "Nasazeno na produkci"
git push origin --tags

echo "Hotovo: $VERSION je venku."
```

## --question--

Testy na řádku 29 selžou. Co skript udělá dál?

### --answer--
Zastaví se, protože `npm test` skončil chybou.

#### --why--
Myslíš si, že skript se na chybě zastaví sám? Bez `set -e` nebo `&&` pokračuje dalším řádkem.

### --answer--
Vypíše chybu testů do terminálu a pokračuje.

#### --why--
Myslíš si, že chyby testů uvidíš? Oba výstupy `npm test` jsou přesměrované do `$LOG`.

### --correct--
Pokračuje buildem a web nasadí i s padajícími testy.

#### --why--
Návratový kód `npm test` nikdo nekontroluje. Oprava je řádky 28–30 spojit přes `&&`, nebo přidat na začátek `set -e`.

### --see--

nastroje-git-terminal/terminal-do-hloubky#skladani-prikazu-podle-vysledku

## --question--

`deploy.log` není v `.gitignore` a v repozitáři jinak nic necommitnutého není. Na kterém řádku skript skončí?

### --expected--
15

### --why--
Řádek 10 vytvoří `deploy.log` dřív, než řádek 13 zkontroluje stav. `git status --porcelain` pak vypíše `?? deploy.log`, podmínka platí a skript skončí `exit 1` na řádku 15.

### --see--

nastroje-git-terminal/git-model#tri-mista-kde-ziji-zmeny

## --question--

`deploy.log` už je v `.gitignore`. Na `main` máš lokálně jeden nepushnutý commit a na serveru mezitím přibyl jiný. Na kterém řádku skript skončí?

### --expected--
22

### --why--
Historie se rozdělila, takže `git pull --ff-only` odmítne udělat merge a vrátí chybu. `||` spustí blok s hláškou a `exit 1` na řádku 22.

### --see--

nastroje-git-terminal/workshop-vetve-a-konflikty/004

## --question--

Pull na řádku 20 selže. Kde uvidíš hlášku „Pull selhal, podrobnosti v deploy.log"?

### --answer--
V souboru `deploy.log`, jako všechno ostatní.

#### --why--
Myslíš si, že přesměrování z řádku 20 platí i pro další příkazy? Týká se jen `git pull`, `echo` na řádku 21 má vlastní `>&2`.

### --correct--
V terminálu, protože `>&2` ji pošle na chybový výstup, který není přesměrovaný.

#### --why--
`>&2` pošle `echo` do stderr skriptu. Ten nikdo nepřesměroval, takže jde do terminálu.

### --see--

nastroje-git-terminal/terminal-do-hloubky#presmerovani-do-souboru

## --question--

`deploy.log` z minulého nasazení má 80 řádků. Kolik z nich v souboru zůstane po dalším spuštění skriptu?

### --expected--
0

### --why--
Řádek 10 zapisuje přes `>`, které soubor nejdřív vyprázdní. Všechny další zápisy už jen připisují přes `>>`.

### --see--

nastroje-git-terminal/terminal-do-hloubky#presmerovani-do-souboru
