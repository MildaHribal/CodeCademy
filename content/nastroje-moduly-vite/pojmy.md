## --term-- ES modul

en: ES module
aliases: ES moduly, ES modulu, ES modulů, ES modulem
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
lekce: nastroje-moduly-vite/es-moduly#pojmenovany-export-a-import

Soubor JavaScriptu s vlastním rozsahem platnosti, který si hodnoty vyměňuje s ostatními přes `export` a `import`. V prohlížeči se zapíná atributem `type="module"`.

## --term-- pojmenovaný export

en: named export
aliases: pojmenovaného exportu, pojmenované exporty, pojmenovaných exportů, pojmenovaným exportem, pojmenovaným exportům
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
lekce: nastroje-moduly-vite/es-moduly#pojmenovany-export-a-import

Export pod pevným jménem (`export function formatCzk`). Importuje se ve složených závorkách a stejným jménem: `import { formatCzk } from './money.js'`.

## --term-- výchozí export

en: default export
aliases: výchozího exportu, výchozím exportem, výchozí exporty
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export
lekce: nastroje-moduly-vite/es-moduly#vychozi-export

Jediný export modulu bez pevného jména (`export default`). Importuje se bez složených závorek a pod libovolným jménem.

## --term-- holý specifikátor

en: bare specifier
aliases: holého specifikátoru, holé specifikátory, holým specifikátorem
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#importing_modules_using_import_maps
lekce: nastroje-moduly-vite/es-moduly#cesty-v-importu

Jméno balíčku v importu bez cesty (`'dayjs'`). Node a Vite ho hledají v `node_modules`, prohlížeč sám ho nerozluští.

## --term-- živá vazba

en: live binding
aliases: živé vazby, živou vazbu, živou vazbou, živé vazbě
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#imported_values_can_only_be_modified_by_the_exporter
lekce: nastroje-moduly-vite/es-moduly#zive-vazby

Importované jméno není kopie, ale pohled na proměnnou uvnitř modulu. Změnu v modulu vidí každý, kdo importuje, sám ale do vazby přiřadit nesmí.

## --term-- veřejné rozhraní

en: public API
aliases: veřejného rozhraní, veřejným rozhraním, veřejném rozhraní
lekce: nastroje-moduly-vite/es-moduly#verejne-rozhrani-a-index-js

Všechno, co modul nebo složka exportuje ven. Na tom smí zbytek aplikace záviset; co exportované není, jde kdykoli změnit.

## --term-- barrel soubor

en: barrel file
aliases: barrel souboru, barrel souborem, barrel soubory
lekce: nastroje-moduly-vite/es-moduly#verejne-rozhrani-a-index-js

Soubor `index.js` ve složce, který jen znovu exportuje veřejné rozhraní modulů uvnitř (`export { addItem } from './items.js'`).

## --term-- dynamický import

en: dynamic import
aliases: dynamického importu, dynamickým importem, dynamickém importu
mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
lekce: nastroje-moduly-vite/es-moduly#dynamicky-import

Volání `import('./modul.js')`, které modul načte až za běhu a vrátí Promise s jeho exporty. Hodí se na kód, který není potřeba hned.

## --term-- závislost

en: dependency
aliases: závislostí, závislostem, závislostech, závislostmi
lekce: nastroje-moduly-vite/npm-a-pnpm#dependencies-a-devdependencies

Balíček z npm, který projekt potřebuje ke svému běhu. Zapisuje se do pole `dependencies` v `package.json`.

## --term-- vývojová závislost

en: devDependency
aliases: vývojové závislosti, vývojových závislostí, vývojovou závislost, vývojovými závislostmi
lekce: nastroje-moduly-vite/npm-a-pnpm#dependencies-a-devdependencies

Balíček potřebný jen při vývoji a sestavení (Vite, ESLint, Prettier). Zapisuje se do `devDependencies` a produkční instalace `--omit=dev` ho vynechá.

## --term-- sémantické verzování

en: semantic versioning (semver)
aliases: sémantického verzování, sémantickým verzováním, semver
lekce: nastroje-moduly-vite/npm-a-pnpm#verze-a-striska

Verze ve tvaru `MAJOR.MINOR.PATCH`: PATCH opravuje, MINOR přidává a MAJOR rozbíjí zpětnou kompatibilitu. Na tomhle slibu stojí rozsahy `^` a `~`.

## --term-- lockfile

en: lockfile
aliases: lockfilu, lockfilem
lekce: nastroje-moduly-vite/npm-a-pnpm#lockfile-a-npm-ci

Soubor `package-lock.json` (u pnpm `pnpm-lock.yaml`) s přesnou verzí každého nainstalovaného balíčku. Commituje se, aby všichni měli totéž.

## --term-- fantomová závislost

en: phantom dependency
aliases: fantomové závislosti, fantomových závislostí, fantomovou závislost
lekce: nastroje-moduly-vite/npm-a-pnpm#pnpm

Balíček, který kód importuje, ale v `package.json` není — do `node_modules` ho přinesl jiný balíček. S npm funguje náhodou, pnpm ho k importu nepustí.

## --term-- bundler

en: bundler
aliases: bundleru, bundlerem, bundlery
mdn: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Overview
lekce: nastroje-moduly-vite/vite#proc-bundler

Nástroj, který projde importy od vstupního souboru a vyrobí z modulů pár souborů pro prohlížeč: spojí je, převede, minifikuje a dá jim otisk do jména.

## --term-- tree shaking

en: tree shaking
mdn: https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking
lekce: nastroje-moduly-vite/vite#proc-bundler

Krok bundleru, který do výsledku nezahrne exporty, které nikdo neimportuje.

## --term-- HMR

en: Hot Module Replacement
lekce: nastroje-moduly-vite/vite#dev-server-a-hmr

Výměna změněného modulu v běžící stránce bez jejího obnovení. Vite ji dělá na dev serveru po uložení souboru.

## --term-- linter

en: linter
aliases: linteru, linterem, lintery
mdn: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Overview
lekce: nastroje-moduly-vite/lint-a-format#co-najde-linter-a-co-formatovac

Nástroj, který bez spuštění hledá v kódu chyby a riskantní vzory, třeba nepoužitou proměnnou nebo přiřazení v podmínce. V JavaScriptu hlavně ESLint.

## --term-- formátovač

en: formatter
aliases: formátovače, formátovačem, formátovačů
lekce: nastroje-moduly-vite/lint-a-format#co-najde-linter-a-co-formatovac

Nástroj, který přeskládá vzhled kódu (odsazení, uvozovky, zalomení) podle jednotných pravidel. Chování kódu nemění. Například Prettier nebo Biome.

## --term-- flat config

en: flat config
aliases: flat configu
lekce: nastroje-moduly-vite/lint-a-format#eslint-a-eslint-config-js

Současný formát nastavení ESLint: soubor `eslint.config.js`, jehož výchozí export je pole konfiguračních objektů.

## --term-- Git hook

en: Git hook
aliases: Git hooku, Git hooky, Git hookem, git hook, git hooku
lekce: nastroje-moduly-vite/lint-a-format#pred-commitem-git-hook-a-lint-staged

Skript, který Git spustí v určitou chvíli, třeba `pre-commit` před vytvořením commitu. Když skončí chybou, commit nevznikne.
