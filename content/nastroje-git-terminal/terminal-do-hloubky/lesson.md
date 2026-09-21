# Terminál do hloubky

:::check pretest
Co myslíš, kam zmizí chybová hláška, když spustíš `node build.js > log.txt` a skript spadne?

### --answer--
Do souboru `log.txt`, spolu se vším ostatním.

#### --why--
Myslíš si, že program má jen jeden výstup? Chybové hlášky jdou jinou cestou než běžný text.

### --answer--
Nikam, při přesměrování se chyby zahazují.

#### --why--
Myslíš si, že se chyby ztratí? Shell je nezahodí, jen je nepřesměroval.

### --correct--
Zůstane v terminálu, do souboru jde jen běžný výstup.

#### --why--
Program má dva oddělené výstupy: běžný a chybový. Znak `>` přesměruje jen ten první.
:::

V práci dostaneš cizí projekt se stovkami souborů a úkol typu „najdi, kde všude
voláme staré API", „zjisti, co blokuje port 3000" nebo „pošli mi log z buildu".
V editoru to jde klikáním půl hodiny. V terminálu je to jeden řádek — pokud víš,
jak se malé příkazy skládají dohromady.

Základy (`pwd`, `ls`, `cd`, `mkdir`, cesty, Tab, Ctrl+C) už znáš. Tahle lekce je
o tom, co dělá z terminálu nástroj: proudy, roury, hledání, prostředí a procesy.

> [!REMEMBER]
> **Každý příkaz čte jeden vstup, píše do dvou výstupů (běžného a chybového) a na konci vrátí číslo — návratový kód. Shell umí tyhle tři věci přesměrovat do souborů a spojit s dalším příkazem.**

## Tři proudy a návratový kód

Každý spuštěný program dostane od systému tři otevřené proudy:

| proud | číslo | anglicky | kam jde normálně |
|---|---|---|---|
| standardní vstup | 0 | *stdin* | z klávesnice |
| standardní výstup | 1 | *stdout* | do terminálu |
| [[chybový výstup]] | 2 | *stderr* | taky do terminálu |

V terminálu oba výstupy vidíš smíchané, ale pro shell jsou to dvě různé roury.
V Node do nich píšeš přes `console.log` (stdout) a `console.error` (stderr).

Když program skončí, vrátí [[návratový kód]] (*exit code*): **0 znamená úspěch,
cokoli jiného chybu.** Kód posledního příkazu je v proměnné `$?`:

```sh
$ ls index.html
index.html
$ echo $?
0
$ ls neexistuje.html
ls: cannot access 'neexistuje.html': No such file or directory
$ echo $?
2
```

V Node kód nastavíš přes `process.exit(1)`. Nezachycená výjimka skončí kódem 1
sama. Návratový kód není ozdoba: podle něj se rozhoduje CI na GitHubu, `npm test`
i `&&` v terminálu, jestli pokračovat.

> [!NOTE]
> `grep` vrací kód 1, když nic nenajde. Není to chyba programu, jen odpověď
> „nenašel jsem" — pozor na to ve skriptech, které se při chybě zastaví.

:::check
Skript `node check.js` vypíše „Všechno v pořádku", ale `echo $?` hned za ním ukáže `1`. Čemu má věřit nástroj, který skript pouští automaticky (třeba CI)?

### --answer--
Textu „Všechno v pořádku", protože ho program vypsal jako poslední.

#### --why--
Myslíš si, že nástroje čtou výstup? Text je pro lidi. Stroj se rozhoduje jen podle čísla,
které program vrátil.

### --correct--
Kódu 1 — program oznámil, že skončil chybou.

#### --why--
Automatizace se rozhoduje podle návratového kódu. Program, který vypíše „OK" a vrátí 1,
je pro CI neúspěšný — a pravděpodobně má chybu v tom, co vypisuje.
:::

## Přesměrování do souboru

[[přesměrování|Přesměrováním]] pošleš proud jinam než do terminálu:

| zápis | co udělá |
|---|---|
| `příkaz > soubor` | stdout do souboru, **soubor se přepíše** |
| `příkaz >> soubor` | stdout na konec souboru |
| `příkaz 2> soubor` | jen stderr do souboru |
| `příkaz > soubor 2>&1` | stdout do souboru a stderr tamtéž |
| `příkaz < soubor` | stdin ze souboru |

`2>&1` čti jako „proud 2 pošli tam, kam **právě teď** vede proud 1". Shell čte
přesměrování zleva doprava, takže záleží na pořadí. Vyzkoušej si to na programu,
který píše do obou výstupů:

:::live node predict
```js
console.log('Načteno 15 objednávek');
console.error('Chybí soubor data/ceny.csv');
console.log('Report uložen');
```
--question-- Program spustíš jako `node report.js 2>&1 > log.txt`. Co zůstane vidět v terminálu?
--output--
```text
Chybí soubor data/ceny.csv
```
--why-- Shell jde zleva: `2>&1` pošle stderr tam, kam v tu chvíli vede stdout — do terminálu. Až potom `> log.txt` přesměruje stdout do souboru. Stderr ale už míří do terminálu a nic ho nepřesune. Aby šlo do souboru obojí, patří `2>&1` až za `> log.txt`.
:::

Zkus si to doma: ulož ukázku jako `report.js`, spusť obě pořadí a podívej se do
`log.txt` přes `cat log.txt`.

> [!TIP]
> Chybový výstup nechceš vidět vůbec? `příkaz 2> /dev/null`. Soubor `/dev/null`
> všechno spolkne. Používej ho jen na hlášky, kterým rozumíš.

:::check
V souboru `deploy.log` je výstup z včerejška. Co v něm bude po příkazu `npm run build > deploy.log`?

### --answer--
Včerejší výstup a pod ním dnešní.

#### --why--
Myslíš si, že `>` přidává? Přidává `>>`. Jednoduchá šipka soubor nejdřív vyprázdní.

### --correct--
Jen dnešní běžný výstup buildu. Chyby by šly do terminálu.

#### --why--
`>` soubor přepíše a přesměruje jen stdout. Chybové hlášky zůstanou v terminálu, dokud
nepřidáš `2>&1`.
:::

## Roury: výstup jednoho je vstup druhého

[[roura|Roura]] `|` napojí stdout levého příkazu na stdin pravého. Každý program
umí jednu malou věc, spojením vznikne nástroj:

```sh
# Kolikrát se v logu serveru objevil stav 404?
grep " 404 " access.log | wc -l

# Které stránky vracejí 404 nejčastěji?
grep " 404 " access.log | cut -d ' ' -f 7 | sort | uniq -c | sort -rn | head -n 5
```

Druhý řádek přečti zleva jako větu: vyber řádky s 404 → vezmi sedmý sloupec (cestu)
→ seřaď → spoj stejné sousední řádky a spočítej je → seřaď číselně sestupně → prvních pět.

| příkaz | co dělá |
|---|---|
| `wc -l` | spočítá řádky |
| `sort` / `sort -rn` | seřadí abecedně / číselně sestupně |
| `uniq -c` | spojí **sousední** stejné řádky a připíše počet |
| `head -n 5` / `tail -n 5` | prvních / posledních pět řádků |
| `cut -d ';' -f 2` | druhý sloupec, oddělovač středník |

> [!PITFALL]
> `uniq` porovnává jen **sousední** řádky. `cut -f 2 data.csv | uniq -c` bez `sort`
> vypíše `Espresso` několikrát s malými počty místo jednoho řádku s celkovým součtem.
> Před `uniq` patří vždy `sort`.

Roura přenáší jen stdout. Chyby levého příkazu jdou dál do terminálu, a když
je chceš poslat rourou, napiš `příkaz 2>&1 | grep Error`.

:::check
Napiš rouru, která spočítá, kolik souborů a složek je v aktuální složce (příkazem `ls`).

### --expected--
ls | wc -l

### --accept--
ls -1 | wc -l
ls -A | wc -l

### --why--
`ls` vypíše jednu položku na řádek, když jeho výstup nejde do terminálu, a `wc -l`
řádky spočítá.
:::

## Hledání textu a souborů

**Text v souborech** hledá `grep`:

```sh
grep -rn "getOrders" src       # rekurzivně, s číslem řádku
grep -ri "todo" src            # bez ohledu na velikost písmen
grep -rl "oldApi" .            # jen jména souborů
grep -v "^#" .env.example      # řádky, které NEodpovídají
```

Rychlejší moderní varianta je `rg` (ripgrep): hledá rekurzivně sama, ukazuje čísla
řádků a **přeskočí, co je v `.gitignore`** — takže neprohrabává `node_modules`.
`rg "getOrders"` je v projektu to, co `grep -rn "getOrders" --exclude-dir=node_modules .`.
Tentýž engine používá hledání ve VS Code.

**Soubory podle jména** hledá `find`:

```sh
find . -name "*.test.js"                    # podle jména, v celém stromu
find . -name "*.log" -not -path "./node_modules/*"
find . -name "*.tmp" -delete                # najdi a smaž
```

Dlouhý výstup si prohlédni v `less`: `grep -rn "TODO" . | less`. Listuješ mezerou,
`/text` hledá, `n` skočí na další výskyt, `q` ukončí.

> [!PITFALL]
> `find . -name *.bak` bez uvozovek skončí hláškou
> `find: paths must precede expression: 'styles.css.bak'`. Shell hvězdičku rozbalil
> na jména souborů v aktuální složce dřív, než se `find` spustil. Vzor dávej do uvozovek:
> `find . -name "*.bak"`.

:::check
V projektu hledáš soubory `.env` ve všech podsložkách. Proč `ls *.env` nestačí?

### --answer--
`ls` neumí hvězdičku.

#### --why--
Myslíš si, že hvězdičku zpracovává `ls`? Rozbaluje ji shell, a to jen v aktuální složce.

### --correct--
Hvězdička se rozbalí jen v aktuální složce; do podsložek jde `find . -name "*.env"`.

#### --why--
Vzor `*.env` rozbalí shell na jména v aktuální složce. `find` prochází celý strom sám.
:::

## Skládání příkazů podle výsledku

| zápis | druhý příkaz se spustí |
|---|---|
| `a ; b` | vždycky |
| `a && b` | jen když `a` skončí kódem 0 |
| `a \|\| b` | jen když `a` skončí chybou |

```sh
npm test && git push                   # pushni jen otestovaný kód
mkdir -p dist || echo "Nejde vytvořit dist"
```

Středník je pohodlný a nebezpečný: nečeká na výsledek.

> [!PITFALL]
> `cd build; rm -rf *` ve složce, kde `build` neexistuje, vypíše
> `cd: build: No such file or directory` — a `rm -rf *` pak smaže **aktuální složku**,
> tedy celý projekt. Oprava: `cd build && rm -rf *`, nebo ještě lépe `rm -rf build`.
> Příkaz, který závisí na úspěchu předchozího, připoj přes `&&`.

:::check
Co udělá `git pull && npm install ; npm run dev`, když `git pull` selže na konfliktu?

### --answer--
Nic, celý řádek se zastaví.

#### --why--
Myslíš si, že selhání zastaví i část za středníkem? `&&` přeskočí jen `npm install`.

### --correct--
Přeskočí `npm install`, ale `npm run dev` se spustí.

#### --why--
`&&` váže jen sousední příkaz. Středník za ním začíná nový příkaz, který běží vždycky.
:::

## Proměnné prostředí a `PATH`

Každý proces dědí od shellu sadu proměnných prostředí. Vypíšeš je `env`, jednu
přes `echo $HOME`. Pro jeden příkaz ji nastavíš před ním, pro zbytek relace přes
`export`:

```sh
NODE_ENV=production node server.js    # jen pro tenhle příkaz
export API_URL=http://localhost:8080  # pro všechny další příkazy v tomhle terminálu
```

Nejdůležitější proměnná je [[PATH]]: seznam složek oddělených dvojtečkou, ve kterých
shell hledá programy. Když napíšeš `node`, shell projde složky z `PATH` zleva
a spustí první `node`, který najde. `which node` ti řekne který.

```sh
$ echo $PATH
/home/jana/.local/bin:/usr/local/bin:/usr/bin
$ which node
/usr/bin/node
```

Hláška `command not found: vite` (v bashi `vite: command not found`) tedy neznamená
„Vite je rozbitý", ale „v žádné složce z `PATH` program `vite` není". Balíček
nainstalovaný v projektu leží v `node_modules/.bin`, která v `PATH` není — proto
se spouští přes `npx vite` nebo skript v `package.json`, který tu složku přidá sám.

> [!PITFALL]
> `export` platí jen v okně terminálu, kde jsi ho napsal. Nové okno ho nezná.
> Trvalé nastavení patří do `~/.bashrc` nebo `~/.zshrc`; po úpravě otevři nový
> terminál nebo spusť `source ~/.zshrc`.

:::check
Po instalaci nástroje návod říká: „přidej `~/.bun/bin` do PATH". Co se změní?

### --answer--
Nástroj se zkopíruje do systémové složky.

#### --why--
Myslíš si, že PATH něco kopíruje? Je to jen seznam míst, kam se shell podívá.

### --correct--
Shell začne hledat programy i ve složce `~/.bun/bin`, takže půjdou spouštět jménem.

#### --why--
PATH je seznam složek. Program z nové složky pak spustíš bez celé cesty.
:::

## Procesy a porty

Každý běžící program je [[proces]] s číselným PID. Server v Node navíc drží
port — dokud běží, nikdo jiný ho nedostane. Typická situace: zavřeš okno editoru,
server v něm běží dál a nový start skončí:

```text
Error: listen EADDRINUSE: address already in use :::3000
```

Kdo port drží, zjistíš jedním z příkazů:

```sh
$ lsof -i :3000
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    48213 jana   23u  IPv6 312345      0t0  TCP *:3000 (LISTEN)

$ ss -ltnp | grep 3000
LISTEN 0 511 *:3000 *:* users:(("node",pid=48213,fd=23))
```

Pak ukončíš **ten jeden proces**: `kill 48213`. `kill` pošle signál TERM a proces
se může slušně ukončit (zavřít spojení, uložit data). Teprve když nereaguje,
`kill -9 48213` ho ukončí okamžitě a bez úklidu.

> [!PITFALL]
> `killall node` nebo `pkill node` ukončí **všechny** programy v Node — i dev server
> jiného projektu, VS Code rozšíření a nástroje, které běží na pozadí. Vždycky hledej
> konkrétní PID a ukonči jen ten.

Procesy vidíš i v `ps aux | grep node` nebo interaktivně v `htop`. Program
spuštěný v terminálu ukončíš Ctrl+C — to je taky signál, jen poslaný klávesou.

:::check
`lsof -i :5173` ukáže proces `node` s PID `90112`. Napiš příkaz, který ho slušně ukončí.

### --expected--
kill 90112

### --accept--
kill -15 90112
kill -TERM 90112

### --why--
`kill PID` pošle signál TERM a dá programu šanci po sobě uklidit. `-9` je až poslední možnost.
:::

## SSH: přihlášení klíčem

Na server (a do GitHubu) se přihlašuješ přes SSH. Místo hesla použiješ
[[SSH klíč]]: pár souborů, **soukromý** zůstává u tebe, **veřejný** dáš serveru.

```sh
ssh-keygen -t ed25519 -C "jana@kafenarohu.cz"   # vytvoří ~/.ssh/id_ed25519 a id_ed25519.pub
ssh-copy-id jana@vps.kafenarohu.cz              # nahraje veřejný klíč na server
ssh jana@vps.kafenarohu.cz                      # přihlášení bez hesla
```

Na GitHub vložíš obsah `~/.ssh/id_ed25519.pub` v nastavení účtu (SSH and GPG keys)
a spojení ověříš přes `ssh -T git@github.com`. Odpověď „You've successfully
authenticated" znamená, že klíč funguje.

Aby sis nemusel pamatovat adresy, zapiš si je do `~/.ssh/config`:

```text
Host kafe
  HostName vps.kafenarohu.cz
  User jana
```

Pak stačí `ssh kafe`.

> [!PITFALL]
> `Permission denied (publickey).` znamená, že server tvůj veřejný klíč nezná (nebo
> posíláš jiný klíč). Nahraj `.pub` znovu. Soubor **bez** `.pub` nikam nekopíruj,
> neposílej ho e-mailem a nedávej do repozitáře — kdo ho má, přihlásí se jako ty.

:::check
Kolega píše: „Pošli mi svůj SSH klíč, přidám tě na server." Který soubor mu pošleš?

### --answer--
`~/.ssh/id_ed25519`

#### --why--
Myslíš si, že server potřebuje oba klíče? Soubor bez `.pub` je soukromý klíč a s ním
by se za tebe mohl přihlásit kdokoli.

### --correct--
`~/.ssh/id_ed25519.pub`

#### --why--
Server potřebuje jen veřejný klíč. Soukromý nikdy neopouští tvůj počítač.
:::

## Jednoduchý shell skript

Příkazy, které pouštíš pořád dokola, ulož do souboru:

```sh
#!/usr/bin/env bash
# backup.sh — zabalí složku s nahranými obrázky, jméno archivu dostane datum
set -euo pipefail

target="${1:-backups}"
mkdir -p "$target"
tar -czf "$target/uploads-$(date +%F).tar.gz" uploads
echo "Záloha uložena do $target"
```

- První řádek (*shebang*) říká, čím se má soubor spustit.
- `set -euo pipefail` zastaví skript na první chybě (`-e`), na nenastavené proměnné
  (`-u`) a na chybě uprostřed roury (`pipefail`). Bez toho skript po chybě vesele
  pokračuje.
- `$1` je první argument, `${1:-backups}` výchozí hodnota, když chybí.
- `$(příkaz)` vloží výstup příkazu do textu.
- Proměnné dávej do uvozovek: `"$target"`. Bez nich se jméno s mezerou rozpadne na dvě.

Skript spustíš přes `bash backup.sh`, nebo ho jednou označíš jako spustitelný
(`chmod +x backup.sh`) a pak stačí `./backup.sh zalohy`.

:::check
Skript bez `set -e` obsahuje řádky `cd /var/www/kafe` a `git pull`. Složka `/var/www/kafe` neexistuje. Co udělá `git pull`?

### --answer--
Nespustí se, skript skončí na chybě `cd`.

#### --why--
Myslíš si, že skript se na chybě zastaví sám? Bez `set -e` pokračuje dalším řádkem.

### --correct--
Spustí se ve složce, ze které byl skript spuštěný.

#### --why--
`cd` selže, ale bez `set -e` skript pokračuje a `git pull` běží tam, kde zrovna je.
:::

:::explain
Vysvětli vlastními slovy, proč `prikaz > soubor.txt` uloží jen část výstupu, když
příkaz skončí chybou.

## --model--
Příkaz nemá jeden výstup, ale dva: běžný (stdout) a chybový (stderr). Přesměrování
`>` bere jen ten běžný, takže chybové hlášky do souboru nejdou — objeví se v terminálu
a v souboru po nich zbude díra. Je to tak schválně: díky oddělení se dá výsledek
příkazu poslat dál rourou a chyby přitom pořád vidět na obrazovce. Když chci mít
v souboru obojí, musím chybový proud výslovně připojit (`2>&1`), nebo ho poslat do
vlastního souboru.

## --checklist--
- Příkaz píše do dvou oddělených proudů.
- `>` přesměruje jen běžný výstup.
- Oddělení umožní posílat data rourou a chyby pořád vidět.
- Chybový proud se připojuje výslovně.
:::

## Typické chyby a pasti

> [!PITFALL]
> **`rm` nemá koš.** `rm -rf dist/ *` (mezera navíc) smaže `dist/` **a všechno
> v aktuální složce**. Před `rm` s hvězdičkou si vzor vyzkoušej přes `ls`: `ls dist/*`.

> [!PITFALL]
> **Hvězdička bez shody.** V zsh `rm *.log` bez jediného logu skončí
> `zsh: no matches found: *.log` a nic se nespustí. Bash pošle `rm` doslova `*.log`
> a ten hlásí `rm: cannot remove '*.log': No such file or directory`.

> [!PITFALL]
> **`>` na vstupní soubor.** `sort data.csv > data.csv` vyrobí prázdný soubor:
> shell ho vyprázdní dřív, než ho `sort` přečte. Zapiš výsledek do nového souboru
> a pak ho přejmenuj: `sort data.csv > sorted.csv && mv sorted.csv data.csv`.

> [!PITFALL]
> **Mezera kolem `=`.** `PORT = 3000 node server.js` hlásí `PORT: command not found`.
> Přiřazení proměnné v shellu se píše bez mezer: `PORT=3000`.

## Kde to najdeš v MDN

- [Command line crash course](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Command_line) —
  základní příkazy, roury a přesměrování s příklady pro webový vývoj.
- [Understanding client-side tools](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Overview) —
  proč webový vývojář terminál potřebuje a jaké nástroje v něm spouští.
- [Bash Reference Manual: Redirections](https://www.gnu.org/software/bash/manual/bash.html#Redirections) —
  MDN shell nepopisuje; tohle je oficiální popis přesměrování včetně pořadí `2>&1`.
- `man grep`, `man find`, `man ssh-keygen` — nápověda přímo v terminálu, `q` ji zavře.

# --questions--

## --question--

Co bude v souboru `errors.txt` po příkazu `node import.js > out.txt 2> errors.txt`, když skript vypíše `console.log('Hotovo')` a `console.warn('Chybí cena u 3 položek')`?

### --expected--
Chybí cena u 3 položek

### --why--
`console.warn` v Node píše stejně jako `console.error` na chybový výstup (stderr), takže skončí v souboru za `2>`.

### --see--

nastroje-git-terminal/terminal-do-hloubky#tri-proudy-a-navratovy-kod

## --question--

Kolega spouští `npm run build ; npm run deploy` a stěžuje si, že se na server nahrál rozbitý web. Napiš řádek, který nasadí jen úspěšný build.

### --expected--
npm run build && npm run deploy

### --why--
`;` spustí druhý příkaz vždycky. `&&` ho spustí, jen když build vrátí kód 0.

### --see--

nastroje-git-terminal/terminal-do-hloubky#skladani-prikazu-podle-vysledku

## --question--

`npm run dev` hlásí `EADDRINUSE` na portu 5173. Který postup je správný?

### --answer--
`killall node` a pak znovu `npm run dev`.

#### --why--
Myslíš si, že ukončit všechno je bezpečné? Zabiješ i jiné programy v Node, které s portem nemají nic společného.

### --answer--
Restartovat počítač, port se tím uvolní.

#### --why--
Myslíš si, že jinak to nejde? Port drží jeden konkrétní proces a dá se najít za pár sekund.

### --correct--
`lsof -i :5173` najít PID procesu, který port drží, a ukončit ho přes `kill PID`.

#### --why--
Najdeš přesně ten proces, který port drží, a ukončíš jen jeho.

### --see--

nastroje-git-terminal/terminal-do-hloubky#procesy-a-porty

## --question--

Napiš příkaz, který v souboru `access.log` spočítá řádky obsahující text `POST /api/orders`.

### --expected--
grep "POST /api/orders" access.log | wc -l

### --accept--
grep -c "POST /api/orders" access.log
grep 'POST /api/orders' access.log | wc -l
grep -c 'POST /api/orders' access.log
cat access.log | grep "POST /api/orders" | wc -l

### --why--
`grep` vybere odpovídající řádky a `wc -l` je spočítá. Zkráceně to umí i `grep -c`.

### --see--

nastroje-git-terminal/terminal-do-hloubky#roury-vystup-jednoho-je-vstup-druheho
