# Terminál: minimum na začátek

:::check pretest
Terminál je ve složce `/home/jana/projekty/kavarna`. Co myslíš, že udělá příkaz `cd ..`?

### --answer--
Vrátí terminál do složky, ve které byl před posledním `cd`.

#### --why--
Myslíš si, že `..` je „zpět" jako v prohlížeči? `..` neznamená předchozí složku v historii, ale složku o úroveň výš.

### --correct--
Přesune terminál o složku výš, do `/home/jana/projekty`.

#### --why--
`..` je vždycky nadřazená složka té, ve které právě jsi.
:::

Návody na webový vývoj jsou plné vět „spusť v terminálu": `npm install`, `git commit`,
`node server.js`. Kdo terminálu nerozumí, kopíruje příkazy naslepo a při první chybě
(`No such file or directory`) neví, co dál. Přitom na začátek stačí asi deset příkazů
a jedna myšlenka.

> [!REMEMBER]
> **Terminál je vždycky v nějaké složce a každý příkaz i každá relativní cesta se počítá od ní.** Většina chyb začátečníků je „jsem v jiné složce, než si myslím".

## Prompt a `pwd`: kde právě jsem

Terminál otevřeš ve VS Code přes Ctrl+` (viz [Integrovaný terminál](see:start-nastroje/vs-code#integrovany-terminal)).
Na řádku čeká **prompt**, výzva k zadání příkazu:

```sh
jana@notebook:~/projekty/kavarna$
```

Před dvojtečkou je uživatel a počítač, za ní **aktuální složka** a `$` říká „piš".
Vzhled promptu se liší podle systému (na Windows v PowerShellu třeba `PS C:\Users\jana\projekty\kavarna>`),
ale složku ukazuje skoro vždycky.

Přesnou cestu vypíše příkaz `pwd` (*print working directory*):

```sh
$ pwd
/home/jana/projekty/kavarna
```

`~` v promptu je zkratka za tvou domovskou složku, tady `/home/jana`.

> [!NOTE]
> Příklady v kurzu používají příkazy z Linuxu a macOS (bash, zsh). Ve Windows je
> nejjednodušší instalovat **Git Bash** (přijde s Gitem) nebo WSL a používat stejné příkazy.

:::check
Prompt ukazuje `jana@notebook:~/web$`. Jakou celou cestu vypíše `pwd`, když je domovská složka `/home/jana`?

### --expected--
/home/jana/web

### --why--
`~` zastupuje domovskou složku `/home/jana`, takže `~/web` je `/home/jana/web`.
:::

## `ls` a `cd`: co tu je a jak jinam

`ls` (*list*) vypíše obsah aktuální složky. `cd` (*change directory*) přesune terminál jinam:

```sh
$ ls
css  index.html  obrazky
$ cd css
$ ls
styles.css
$ cd ..
$ pwd
/home/jana/projekty/kavarna
```

Tři zvláštní jména, která `cd` bere:

| zápis | znamená |
|---|---|
| `..` | nadřazená složka (o úroveň výš) |
| `.` | aktuální složka |
| `~` | domovská složka; samotné `cd` bez argumentu tě tam vrátí taky |

`ls -a` ukáže i skryté soubory, jejichž jméno začíná tečkou (`.gitignore`, složka `.git`).
Obyčejné `ls` je nevypíše, i když ve složce jsou.

> [!PITFALL]
> **`cd Moje projekty` hlásí `bash: cd: too many arguments`** (zsh: `cd: string not in pwd`).
> Mezera odděluje argumenty, takže terminál vidí dvě slova. Jméno se mezerou dej do uvozovek:
> `cd "Moje projekty"`. Ještě lepší je mezery v názvech složek projektů nepoužívat vůbec.

:::check
Jsi ve složce projektu a `ls` nevypíše `.gitignore`, i když víš, že tam je. Jaký příkaz ho ukáže?

### --expected--
ls -a

### --accept--
ls -la
ls -al
ls -A

### --why--
Soubory začínající tečkou jsou skryté a `ls` je bez přepínače `-a` (*all*) vynechá.
:::

## Relativní a absolutní cesty

[[absolutní cesta]] začíná `/` (od kořene disku) nebo `~` (od domovské složky)
a vede na stejné místo, ať je terminál kdekoli: `/home/jana/projekty/kavarna/css`.

[[relativní cesta]] nezačíná `/` ani `~` a počítá se **od aktuální složky**: `css`,
`css/styles.css`, `../obrazky`. Stejná relativní cesta tak z různých složek vede na
různá místa.

Cesta se skládá po částech zleva doprava. Z `/home/jana/web/css` vede `../obrazky` takhle:
`..` → `/home/jana/web`, pak `obrazky` → `/home/jana/web/obrazky`.

Node umí cesty skládat stejně jako `cd`. V ukázce `path.resolve(odkud, kam)` spočítá,
kam by vedlo `cd kam` ze složky `odkud`. JavaScriptu zatím rozumět nemusíš, stačí sledovat cesty:

:::live node predict
```js
import path from 'node:path';

const terminalFolder = '/home/jana/web/css';
console.log(path.resolve(terminalFolder, '../obrazky'));
console.log(path.resolve(terminalFolder, 'obrazky'));
```
--question-- Terminál je ve složce `/home/jana/web/css`. Kam se dostane po `cd ../obrazky` a kam po `cd obrazky`? Napiš obě cesty, každou na vlastní řádek.
--output--
```text
/home/jana/web/obrazky
/home/jana/web/css/obrazky
```
--why-- `..` vede o úroveň výš do `/home/jana/web` a teprve tam se hledá `obrazky`. Bez `..` se `obrazky` hledá přímo v aktuální složce `css`. Kdyby tam taková složka nebyla, `cd` by skončilo hláškou `No such file or directory`.
:::

:::check
Terminál je v `/home/jana/projekty/kavarna/obrazky`. Jaká je absolutní cesta, kam vede `cd ../../eshop`?

### --expected--
/home/jana/projekty/eshop

### --why--
První `..` vede do `kavarna`, druhé do `projekty` a tam se najde `eshop`.
:::

## `mkdir` a spuštění programu

`mkdir` (*make directory*) vytvoří složku. Víc složek najednou nebo celou cestu vytvoří `mkdir -p`:

```sh
$ mkdir obrazky
$ mkdir -p projekty/eshop/css
```

Program v JavaScriptu spustíš příkazem `node` a jménem souboru. Node soubor hledá
**relativně k aktuální složce**:

```sh
$ ls
hello.js
$ node hello.js
Ahoj z terminálu
```

Program, který běží dál (třeba server), vrátí prompt až po ukončení. Ukončíš ho Ctrl+C.
Víc o Node se dozvíš v sekci [Node.js základy](see:node-zaklady/co-je-node).

> [!PITFALL]
> **`node app.js` hlásí `Error: Cannot find module '/home/jana/app.js'`.** V hlášce je
> cesta, kde Node soubor hledal: v aktuální složce `/home/jana`, jenže soubor leží
> v `/home/jana/projekty/kavarna`. Oprava: `cd projekty/kavarna` a spustit znovu,
> nebo `node projekty/kavarna/app.js`.

:::check
Jsi v `~/projekty` a spustíš `node kavarna/server.js`. Soubor existuje v `~/projekty/kavarna/server.js`. Najde ho Node?

### --answer--
Ne, `node` umí spustit jen soubor z aktuální složky.

#### --why--
Myslíš si, že `node` bere jen holé jméno souboru? Bere jakoukoli cestu, relativní i absolutní.

### --correct--
Ano, relativní cesta `kavarna/server.js` se spočítá od `~/projekty`.

#### --why--
`~/projekty` + `kavarna/server.js` = `~/projekty/kavarna/server.js`, a tam soubor je.

### --answer--
Ne, nejdřív se musí vytvořit složka přes `mkdir`.

#### --why--
Myslíš si, že `node` potřebuje prázdnou složku? Soubor i složka už existují, `mkdir` by jen ohlásil, že složka existuje.
:::

## Zkratky, které šetří čas

| klávesa | co dělá |
|---|---|
| Tab | doplní jméno souboru nebo složky; dvakrát Tab ukáže možnosti |
| šipka nahoru / dolů | projde předchozí příkazy |
| Ctrl+C | ukončí běžící program (server, zaseknutý příkaz) |
| Ctrl+L | vyčistí obrazovku (stejně jako `clear`) |

Tab používej pořád. Nejen že píšeš rychleji: když Tab jméno nedoplní, víš hned,
že soubor v téhle složce není nebo máš překlep.

> [!PITFALL]
> **Ctrl+C v terminálu nekopíruje, ale ukončí program.** Kopírování je v terminálu
> Ctrl+Shift+C a vkládání Ctrl+Shift+V (ve VS Code funguje i běžné Ctrl+C, když je
> označený text). Když ti po „kopírování" spadl server, víš proč.

:::check
Píšeš `cd proj` a stiskneš Tab, ale nic se nedoplní. Co to nejspíš znamená?

### --answer--
Terminál Tab nepodporuje, musíš jméno dopsat celé.

#### --why--
Myslíš si, že doplňování je vypnuté? Funguje ve všech běžných shellech. Že se nic nestalo, je informace.

### --correct--
V aktuální složce není nic, co začíná na `proj`, nebo je víc možností (ukáže je druhý Tab).

#### --why--
Tab doplní jen to, co opravdu existuje. Mlčení je rychlá kontrola, že jsi jinde, než myslíš.

### --answer--
Složka `projekty` je prázdná.

#### --why--
Myslíš si, že Tab kontroluje obsah složky? Doplňuje jméno a to na obsahu nezávisí.
:::

:::explain
Vysvětli vlastními slovy, proč tentýž příkaz jednou funguje a podruhé hlásí, že soubor
neexistuje.

## --model--
Terminál je vždycky **v nějaké složce** a všechno relativní se počítá od ní: jméno
souboru, `./skript.js`, `npm start` i cesta k obrázku. Když jsem o složku vedle, tentýž
příkaz hledá jinde — a hlášku „soubor neexistuje" čtu jako chybu programu, ačkoli je to
chyba polohy. Proto první reakce na nečekanou chybu není měnit příkaz, ale zeptat se,
kde vlastně jsem, a podívat se, co v té složce je.

## --checklist--
- Terminál má vždy aktuální složku.
- Relativní cesty i příkazy se počítají od ní.
- Jiná složka znamená, že se hledá jinde.
- První reakce je zjistit polohu, ne měnit příkaz.
:::

## Kde to najdeš v MDN

- [Command line crash course](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Command_line): terminál pro webové vývojáře, cesty a základní příkazy.
- [Dealing with files](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Dealing_with_files): proč na názvech souborů a složkách záleží (mezery, velká písmena).

Tohle minimum stačí na Git. Víc terminálu (přesouvání, kopírování, přesměrování výstupu)
přijde v pozdější sekci o Gitu a terminálu. Teď ho hned použiješ ve workshopu
[První repozitář](see:start-nastroje/workshop-prvni-repozitar).

# --questions--

## --question--

Terminál je v `~/projekty/kavarna/css`. Který příkaz tě dostane do `~/projekty/eshop` odkudkoli, bez ohledu na aktuální složku?

### --answer--

`cd ../eshop`

#### --why--

Myslíš si, že `..` vede vždy do `projekty`? Počítá se od aktuální složky, tady by vedlo do `~/projekty/kavarna/eshop`.

### --correct--

`cd ~/projekty/eshop`

#### --why--

Absolutní cesta začínající `~` vede na stejné místo z jakékoli složky.

### --answer--

`cd eshop`

#### --why--

Myslíš si, že `cd` hledá složku v celém počítači? Hledá ji jen v aktuální složce.

### --see--

start-nastroje/terminal-minimum#relativni-a-absolutni-cesty

## --question--

Ve složce `~/web` spustíš `node server.js` a server běží. Jak ho ukončíš, aby se ti vrátil prompt? Napiš klávesovou zkratku.

### --expected-- ignore-case

Ctrl+C

### --accept--

ctrl c
Ctrl + C
^C

### --why--

Ctrl+C pošle běžícímu programu signál k ukončení a terminál vrátí prompt.

### --see--

start-nastroje/terminal-minimum#zkratky-ktere-setri-cas

## --question--

V `~/projekty` napíšeš `mkdir kavarna/css` a terminál odpoví `mkdir: cannot create directory 'kavarna/css': No such file or directory`. Složka `kavarna` zatím neexistuje. Jaký přepínač chybí, aby `mkdir` vytvořil celou cestu?

### --expected--

-p

### --accept--

mkdir -p kavarna/css
--parents

### --why--

Bez `-p` `mkdir` vytvoří jen poslední složku cesty a nadřazené musí existovat. `mkdir -p` vytvoří všechny chybějící.

### --see--

start-nastroje/terminal-minimum#mkdir-a-spusteni-programu
