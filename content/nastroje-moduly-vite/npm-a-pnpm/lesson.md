# npm, pnpm a package.json

:::check pretest
V `package.json` projektu je řádek `"dayjs": "^1.11.13"`. Mezitím vyšla verze `1.12.0`. Kolegyně si projekt stáhne a spustí `npm install` — jenže v repozitáři chybí soubor `package-lock.json`. Kterou verzi dostane?

### --answer--
`1.11.13`, protože je napsaná v `package.json`.

#### --why--
Číslo v `package.json` se stříškou není přesná verze, ale spodní hranice rozsahu.

### --correct--
`1.12.0`

#### --why--
Stříška povolí jakoukoli novější verzi se stejným prvním číslem. Bez lockfile npm vezme nejnovější, která do rozsahu padne. Proto má každý v týmu jiné verze, dokud lockfile nezačnete commitovat.

### --answer--
Nic, `npm install` bez lockfile skončí chybou.

#### --why--
`npm install` si lockfile při první instalaci vyrobí sám. Chybou bez lockfile končí jiný příkaz, `npm ci`.
:::

Skoro žádný web dnes nevzniká jen z vlastního kódu. Formulář validuje Zod, datum formátuje knihovna, stránku staví Vite a styly Tailwind. Každý takový kus kódu je balíček z registru npm a projekt jich má desítky, s jejich vlastními závislostmi často stovky. Někdo musí hlídat, které to jsou, v jakých verzích a jak se dostanou k dalšímu vývojáři, na server nebo do automatického sestavení.

Tuhle práci dělá správce balíčků — `npm`, který přichází s Node, nebo rychlejší `pnpm`. A celou dohodu o tom, co projekt potřebuje, drží dva soubory.

> [!REMEMBER]
> **`package.json` říká, co projekt potřebuje a v jakém rozsahu verzí. Lockfile říká, co přesně se nainstalovalo.**

## `package.json`: popis projektu

Každý projekt v JavaScriptu má v kořeni `package.json`. Vzniká příkazem `npm init -y` a vypadá zhruba takhle:

```json
{
  "name": "rezervace-kurtu",
  "version": "0.3.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint ."
  },
  "dependencies": {
    "dayjs": "^1.11.13"
  },
  "devDependencies": {
    "vite": "^8.3.0",
    "eslint": "^10.10.0"
  }
}
```

- `name` a `version` — jméno a verze projektu. U aplikace skoro nic neznamenají, u knihovny, kterou zveřejníš, jsou povinné.
- `"private": true` — pojistka, že aplikaci omylem nevydáš do veřejného registru npm.
- `"type": "module"` — soubory `.js` jsou ES moduly (víc níže).
- `scripts` — pojmenované příkazy projektu.
- `dependencies` a `devDependencies` — balíčky, které projekt potřebuje.

Balíčky se stáhnou do složky `node_modules`. Ta může mít stovky megabajtů a **do Gitu nepatří** — kdokoli si ji vyrobí znovu příkazem `npm install` podle `package.json` a lockfile. Proto je `node_modules` první řádek každého `.gitignore`.

:::check
Kolega se ptá, proč v repozitáři projektu chybí složka `node_modules`, když bez ní aplikace nejde spustit. Co mu odpovíš?

### --answer--
Někdo ji zapomněl commitnout, je potřeba ji přidat.

#### --why--
Myslíš si, že balíčky patří do repozitáře s kódem? Složka je obrovská, liší se podle operačního systému a dá se kdykoli vyrobit znovu.

### --correct--
Nepatří do Gitu. Vyrobí si ji příkazem `npm install` podle `package.json` a lockfile.

### --answer--
Balíčky se stahují při každém spuštění aplikace samy.

#### --why--
Za běhu se nic nestahuje. Balíčky musí být v `node_modules` předem, jinak import skončí chybou `Cannot find package`.
:::

## `dependencies` a `devDependencies`

Balíček přidáš příkazem `npm install` a jménem:

```sh
npm install dayjs          # do dependencies
npm install -D vite eslint # do devDependencies (-D = --save-dev)
```

Rozdíl je v tom, **kdy** balíček potřebuješ:

| pole | co tam patří | příklad |
|---|---|---|
| `dependencies` | kód, který běží v aplikaci u uživatele nebo na serveru | `dayjs`, `react`, `express`, `zod` |
| `devDependencies` | nástroje, které potřebuješ jen při vývoji a sestavení | `vite`, `eslint`, `prettier`, `vitest`, `typescript` |

U serveru v Node na tom opravdu záleží: produkční instalace `npm install --omit=dev` vývojové závislosti vynechá. Když omylem dáš `express` do `devDependencies`, na počítači ti všechno běží a na serveru aplikace spadne na `Cannot find package 'express'`.

U webu sestaveného ve Vite je rozdělení spíš dohoda — do stránky se stejně dostane jen kód, který opravdu importuješ. I tak se drž pravidla: co importuje aplikace, patří do [[závislost|závislostí]], co pouštíš v terminálu, do [[vývojová závislost|vývojových závislostí]].

:::check
Server na Expressu validuje vstup Zodem a testy pouští Vitest. Do kterého pole patří `zod`?

### --expected--
dependencies

### --why--
Zod běží při každém požadavku v produkční aplikaci. Vitest pouštíš jen při vývoji, ten patří do `devDependencies`.
:::

## Verze a stříška

Verze balíčků mají tvar `MAJOR.MINOR.PATCH`, třeba `1.11.13`. Tomu se říká [[sémantické verzování]] (*semver*) a každé číslo je slib autora:

- **PATCH** (`1.11.13` → `1.11.14`) — oprava chyby, nic se nemění,
- **MINOR** (`1.11.13` → `1.12.0`) — nová funkce, starý kód funguje dál,
- **MAJOR** (`1.12.0` → `2.0.0`) — rozbíjející změna, starý kód se možná bude muset upravit.

Před verzí v `package.json` stojí značka, která říká, jaké novější verze smí npm nainstalovat:

| zápis | povolí | nepovolí |
|---|---|---|
| `^1.2.3` | `1.2.3` až `1.x.x` (třeba `1.9.0`) | `2.0.0` |
| `~1.2.3` | `1.2.3` až `1.2.x` (třeba `1.2.9`) | `1.3.0` |
| `1.2.3` | jen `1.2.3` | cokoli jiného |

Stříška `^` je výchozí — `npm install dayjs` ji napíše sama. Věří slibu, že nová MINOR a PATCH verze nic nerozbije.

Jedna výjimka ale každého zaskočí. U verzí `0.x` se autor k ničemu nezavázal a změnit se může cokoli. Stříška proto u nuly zamyká i prostřední číslo. Takhle to spočítá přímo balíček `semver`, který npm používá uvnitř:

:::live node predict
```js
import semver from 'semver';

console.log(semver.satisfies('1.9.0', '^1.2.3'));
console.log(semver.satisfies('2.0.0', '^1.2.3'));
console.log(semver.satisfies('0.3.0', '^0.2.3'));
```
--question-- Co vypíšou tři řádky? Každý říká, jestli verze vlevo padne do rozsahu vpravo.
--output--
```text
true
false
false
```
--why-- `1.9.0` má stejné MAJOR jako `^1.2.3` a je novější, takže projde. `2.0.0` mění MAJOR a stříška ho nepustí. U `^0.2.3` se za „rozbíjející" číslo považuje už to prostřední, takže `0.3.0` neprojde — dostal bys jen `0.2.x`.
:::

:::check
Která nejvyšší z verzí `1.4.2`, `1.5.0` a `2.0.0` padne do rozsahu `~1.4.0`?

### --expected--
1.4.2

### --why--
Vlnovka povolí jen změny posledního čísla, tedy `1.4.x`. `1.5.0` mění MINOR, `2.0.0` MAJOR.
:::

## Lockfile a `npm ci`

Rozsah v `package.json` nestačí na to, aby měli všichni totéž. Proto npm při instalaci zapíše do [[lockfile]] `package-lock.json` **přesnou verzi každého balíčku** včetně závislostí tvých závislostí, adresu, odkud se stáhl, a kontrolní součet obsahu.

- **Lockfile commituj.** Díky němu dostane kolegyně, server i automatické sestavení přesně tytéž verze, jaké máš ty.
- `npm install` čte lockfile a nainstaluje verze z něj. Když přidáš nový balíček nebo změníš rozsah v `package.json`, lockfile upraví.
- `npm ci` (*clean install*) smaže `node_modules` a nainstaluje **přesně** to, co je v lockfile. Lockfile nikdy nemění. Když neodpovídá `package.json`, skončí chybou místo toho, aby hádal.

Na svém počítači pracuješ s `npm install`. V automatickém sestavení a na serveru se používá `npm ci`: je rychlejší a nic nemění pod rukama.

> [!PITFALL]
> **Smazaný lockfile „kvůli konfliktu v Gitu".** Po smazání a `npm install` dostane projekt nejnovější verze všech rozsahů najednou, i závislostí, o kterých nevíš. Aplikace se pak rozbije na věci, kterou nikdo neměnil. Konflikt v lockfile vyřešíš tak, že vezmeš verzi z hlavní větve a pustíš `npm install` znovu.

:::check
Automatické sestavení na serveru nainstalovalo jiné verze než vývojář u sebe, i když je lockfile v repozitáři. Sestavení pouští `npm install`. Čím ho nahradíš?

### --expected--
npm ci

### --why--
`npm ci` instaluje přesně podle lockfile a nikdy ho nemění. Když lockfile neodpovídá `package.json`, sestavení raději selže.
:::

## Skripty a `npx`

Pole `scripts` dává dlouhým příkazům krátká jména, takže nikdo nemusí vědět, jaký přesně příkaz sestavení pouští:

```sh
npm run dev      # pustí "vite"
npm run build    # pustí "vite build"
npm test         # u test a start stačí bez run
node --run lint  # totéž bez npm, spouští se o chlup rychleji
```

Skript smí volat nástroje z `node_modules`, i když nejsou nainstalované v systému. Při spuštění skriptu se do cesty přidá `node_modules/.bin`, kam balíčky ukládají své příkazy. Proto funguje `"lint": "eslint ."`, i když samotné `eslint` v terminálu hlásí `command not found`.

Mimo skripty na to je `npx`: pustí příkaz balíčku z `node_modules/.bin`, a když tam není, stáhne ho do dočasné složky.

```sh
npx eslint src/cart.js     # jednorázově zkontroluje jeden soubor
npx create-vite@latest     # stáhne a pustí nástroj, který založí projekt
```

> [!PITFALL]
> `npx` s překlepem v názvu stáhne a spustí **cizí balíček**, který se tak jmenuje. Před potvrzením stažení si jméno přečti.

:::check
Proč v `package.json` funguje skript `"format": "prettier --write ."`, když příkaz `prettier` napsaný přímo do terminálu hlásí `command not found`?

### --answer--
Skripty se spouštějí v Node, ne v terminálu.

#### --why--
Skript běží v obyčejném shellu jako jakýkoli příkaz. Liší se jen tím, co je v cestě.

### --correct--
Při spuštění skriptu je v cestě navíc `node_modules/.bin`, kde příkaz `prettier` leží.

### --answer--
npm si Prettier při každém spuštění skriptu stáhne.

#### --why--
`npm run` nic nestahuje, používá balíčky z `node_modules`. Stahovat chybějící umí `npx`.
:::

## `"type"` a `exports`

`"type": "module"` říká Node, že soubory `.js` v projektu jsou ES moduly. Bez něj je bere jako CommonJS. Novější Node si sice `import` v souboru všimne sám a modul spustí, ale vypíše varování `MODULE_TYPELESS_PACKAGE_JSON` a spouštění je pomalejší. **Do každého nového projektu `"type": "module"` napiš.** Jednotlivý soubor jde přepnout příponou: `.mjs` je vždy ES modul, `.cjs` vždy CommonJS.

Knihovna navíc potřebuje říct, co z ní smí ostatní importovat. K tomu slouží pole `exports` — [[veřejné rozhraní]] celého balíčku:

```json
{
  "name": "cz-format",
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./dates": "./src/dates.js"
  }
}
```

S tímhle nastavením funguje `import { formatCzk } from 'cz-format'` (klíč `"."`) i `import { formatDay } from 'cz-format/dates'`. Import čehokoli jiného z balíčku Node odmítne:

```text
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './src/internal.js' is not defined by "exports" in /home/eva/web/node_modules/cz-format/package.json
```

Je to stejná myšlenka jako `index.js` ve složce, jen o patro výš: autor balíčku smí vnitřní soubory přesouvat a nikomu nic nerozbije. Ve starších balíčcích uvidíš místo `exports` pole `main` s jediným vstupním souborem.

:::check
Balíček `recepty-api` má v `package.json` jen `"exports": { ".": "./lib/index.js" }`. Projde `import { parseIngredients } from 'recepty-api/lib/parse.js'`?

### --answer--
Projde, soubor `lib/parse.js` v balíčku existuje.

#### --why--
Myslíš si, že import může sáhnout na jakýkoli soubor balíčku? Když balíček má `exports`, platí jen cesty, které v něm jsou.

### --correct--
Neprojde. Node ohlásí `ERR_PACKAGE_PATH_NOT_EXPORTED`, protože cesta není v `exports`.
:::

## pnpm

[pnpm](https://pnpm.io) dělá totéž co npm, jen jinak ukládá balíčky. Každou verzi každého balíčku drží na disku **jednou** v globálním úložišti a do `node_modules` projektů ji jen odkáže. Deset projektů s Reactem tak nemá deset kopií Reactu. Instalace je rychlejší a zabere výrazně méně místa.

| npm | pnpm |
|---|---|
| `npm install` | `pnpm install` |
| `npm install dayjs` | `pnpm add dayjs` |
| `npm install -D vite` | `pnpm add -D vite` |
| `npm run build` | `pnpm build` |
| `npm ci` | `pnpm install --frozen-lockfile` |
| `npx eslint .` | `pnpm exec eslint .` (`pnpm dlx` pro stažení) |
| `package-lock.json` | `pnpm-lock.yaml` |

Druhý rozdíl je přísnost. npm dá všechny balíčky do jedné ploché složky, takže tvůj kód omylem naimportuje i balíček, který jsi nikdy nenainstaloval — jen ho má jako závislost jiný balíček. Takové [[fantomová závislost|fantomové závislosti]] fungují, dokud ho ten druhý balíček nepřestane používat. pnpm pustí k importu jen to, co je v tvém `package.json`, a chybu ukáže hned: `Cannot find package 'debug'`.

pnpm navíc nespouští instalační skripty závislostí (`postinstall`), dokud je výslovně nepovolíš příkazem `pnpm approve-builds`. Proč na tom záleží, ukáže další část.

> [!PITFALL]
> **Dva správci balíčků v jednom projektu.** Když v repozitáři leží `package-lock.json` i `pnpm-lock.yaml`, každý v týmu instaluje podle jiného a verze se rozjedou. Projekt má jednoho správce a jeden lockfile. Který to je, zapiš do `package.json` polem `"packageManager"`.

:::check
Kód importuje `import ms from 'ms'`, v `package.json` ale `ms` není. S npm aplikace běží, po přechodu na pnpm hlásí `Cannot find package 'ms'`. Co je správná oprava?

### --answer--
Vrátit se k npm, s ním to fungovalo.

#### --why--
S npm to fungovalo jen náhodou, protože `ms` přinesl jiný balíček. Až ho přestane potřebovat, spadne to i s npm.

### --correct--
Přidat `ms` do závislostí projektu (`pnpm add ms`).

### --answer--
Nahradit import cestou do `node_modules/.pnpm/…`.

#### --why--
Cesta dovnitř úložiště pnpm se mění s každou verzí. Oprava je přiznat závislost v `package.json`.
:::

## Bezpečnost a cena závislosti

Každý balíček je cizí kód, který běží s tvými právy — u vývojáře na počítači, na serveru i v prohlížeči uživatele. Tři věci, které se reálně dějí:

- **Typosquatting.** Útočník vydá balíček se jménem podobným populárnímu (`expresss`, `reactt`, `crossenv` místo `cross-env`) a čeká na překlep. Takový balíček vypadá funkčně a mezitím krade proměnné prostředí.
- **Instalační skripty.** Balíček smí mít skript `postinstall`, který se spustí při `npm install`. Napadený balíček tak škodí, ještě než ho poprvé naimportuješ.
- **Převzatý balíček.** Útočník získá účet autora oblíbeného balíčku a vydá novou verzi se škodlivým kódem. Tady pomáhá lockfile a `npm ci`: nová verze se k tobě nedostane sama.

`npm audit` porovná verze v lockfile s databází známých zranitelností a `npm audit fix` zkusí povolit opravené verze. Nález ale neznamená vždy průšvih — chyba v nástroji, který běží jen při sestavení, uživatele neohrozí. Čti, **kde** balíček běží.

Než balíček přidáš, zeptej se, co tě bude stát. Na stránce balíčku na npmjs.com zkontroluj, kdy vyšla poslední verze, kolik má stažení týdně a kolik si přitáhne dalších závislostí. Funkce na tři řádky (zaokrouhlení ceny, `isEven`) za cizí kód, který musíš hlídat, nestojí.

:::check
Při přidávání knihovny na formátování data napíšeš v terminálu `npm install daysj`. Instalace proběhne bez chyby. Co uděláš?

### --answer--
Nic, když instalace prošla, balíček je v pořádku.

#### --why--
Myslíš si, že registr npm balíčky kontroluje? Vydat balíček může kdokoli, i s podvrženým jménem.

### --correct--
Balíček hned odinstaluji, zkontroluji ho na npmjs.com a nainstaluji správné jméno `dayjs`.

#### --why--
Překlep v názvu balíčku je přesně to, na co typosquatting čeká. Jeho instalační skript už mohl běžet, takže je rozumné zkontrolovat, co dělá.

### --answer--
Spustím `npm audit`, ten podvržený balíček odhalí.

#### --why--
`npm audit` hlídá známé zranitelnosti v registrovaných verzích. Čerstvě vydaný podvrh v databázi být nemusí.
:::

:::explain
Vysvětli vlastními slovy, proč se lockfile commituje, i když je v něm „jen to samé"
co v `package.json`.

## --model--
`package.json` popisuje **rozsah** („aspoň 4.2, ale ne 5"), lockfile zaznamenává
**přesně jednu** verzi každého balíčku včetně všech jeho závislostí a jejich závislostí.
Bez lockfilu si každý vývojář a každé sestavení v CI nainstaluje to nejnovější, co do
rozsahu spadá — a rozbití, které přinese cizí balíček o dvě úrovně níž, uvidí jen ten,
komu se zrovna trefilo. S commitnutým lockfilem má celý tým i produkce stejné soubory,
a když se něco rozbije, je z diffu lockfilu vidět, která verze se změnila.

## --checklist--
- `package.json` určuje rozsah povolených verzí.
- Lockfile určuje přesnou verzi každé závislosti, i nepřímé.
- Bez něj má každý vývojář jinou instalaci.
- Změnu verze je díky němu vidět v diffu.
:::

## Typické chyby a pasti

> [!PITFALL]
> **`node_modules` v Gitu.** Repozitář má stovky megabajtů a po přechodu na jiný systém nejdou některé balíčky spustit. Oprava: `node_modules` do `.gitignore` a složku z Gitu odstraň.

> [!PITFALL]
> **Lockfile mimo Git.** Každý instaluje jiné verze a „u mě to funguje" nejde zopakovat. Oprava: commituj `package-lock.json` (nebo `pnpm-lock.yaml`).

> [!PITFALL]
> **Stříška u nuly.** `"^0.4.0"` nepustí verzi `0.5.0`. Nová funkce z `0.5.0` se po `npm install` neobjeví. Oprava: změň rozsah vědomě na `^0.5.0` a vyzkoušej, co se rozbilo.

> [!PITFALL]
> **Balíček serveru v `devDependencies`.** Lokálně vše běží, na serveru po `npm ci --omit=dev` přijde `Cannot find package 'express'`. Oprava: přesuň ho do `dependencies`.

:::check
Po stažení projektu z Gitu je v kořeni `package.json`, `package-lock.json` a `src/`, ale ne `node_modules`. Který příkaz pustíš jako první, aby měl projekt přesně ty verze balíčků jako kolegové?

### --answer--
`npm update`

#### --why--
`npm update` hledá nejnovější verze v rozsazích a lockfile přepíše. Dostal bys jiné verze než kolegové.

### --correct--
`npm ci` (nebo `npm install`, který lockfile také respektuje)

### --answer--
`npx vite`

#### --why--
Spustit nástroj bez nainstalovaných balíčků projektu nepomůže, aplikace by stejně neměla své závislosti.
:::

## Kde to najdeš v MDN

- [Package management basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Package_management) — průvodce MDN: co je správce balíčků, `package.json` a skripty.
- [package.json v dokumentaci npm](https://docs.npmjs.com/cli/configuring-npm/package-json) — všechna pole včetně `exports`, `scripts` a `private`.
- [About semantic versioning](https://docs.npmjs.com/about-semantic-versioning) — jak npm čte `^` a `~`.
- [Motivation v dokumentaci pnpm](https://pnpm.io/motivation) — proč pnpm ukládá balíčky jinak a co je přísný `node_modules`.

# --questions--

## --question--

V `package.json` je `"zod": "~4.1.2"`. Které z verzí `4.1.9`, `4.2.0` a `5.0.0` smí `npm install` nainstalovat? Napiš je oddělené čárkou, nebo `žádná`.

### --expected--
4.1.9

### --why--
Vlnovka drží MAJOR i MINOR a povolí jen novější PATCH. `4.2.0` mění MINOR, `5.0.0` MAJOR.

### --see--
nastroje-moduly-vite/npm-a-pnpm#verze-a-striska

## --question--

Proč se lockfile commituje, když `package.json` už říká, jaké balíčky projekt potřebuje?

### --expected-- ignore-case
Protože package.json obsahuje jen rozsahy verzí a lockfile přesné verze

### --accept-- ignore-case
Aby všichni měli přesně stejné verze
Aby měli všichni stejné verze
Kvůli přesným verzím všech balíčků
Package.json má rozsahy, lockfile přesné verze

### --why--
`package.json` s `^` povolí rozsah verzí a bez lockfile by každá instalace vybrala nejnovější, která v tu chvíli existuje. Lockfile zapíše přesnou verzi každého balíčku i závislostí závislostí, takže vývojář, server i automatické sestavení mají totéž.

### --see--
nastroje-moduly-vite/npm-a-pnpm#lockfile-a-npm-ci

## --question--

Knihovna má v `package.json` `"exports": { ".": "./src/index.js" }` a v `src/index.js` řádek `export { slugify } from './text.js'`. Jaký import funkce `slugify` napíše uživatel balíčku `cz-text`?

### --expected--
import { slugify } from 'cz-text'

### --why--
Klíč `"."` v `exports` je hlavní vstup balíčku, který se importuje samotným jménem. `src/index.js` vystaví `slugify` dál a cesta `cz-text/src/text.js` by skončila `ERR_PACKAGE_PATH_NOT_EXPORTED`.

### --see--
nastroje-moduly-vite/npm-a-pnpm#type-a-exports
