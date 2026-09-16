# Lint a formátování

:::check pretest
V kódu je `if (hour = 8) { openShop(); }` místo `if (hour === 8)`. Obchod se pak otevře v každou hodinu. Který nástroj tuhle chybu najde ještě před spuštěním?

### --answer--
Formátovač, protože kód opraví do správného tvaru.

#### --why--
Formátovač mění jen vzhled — mezery, zalomení, uvozovky. Přiřazení v podmínce je platný JavaScript, takže ho nechá, jak je.

### --correct--
Linter.

#### --why--
Linter hledá podezřelé vzory kódu. ESLint tuhle chybu ohlásí pravidlem `no-cond-assign`: v podmínce čeká porovnání, a našel přiřazení.

### --answer--
Žádný, najde ji až test nebo uživatel.

#### --why--
Test by ji našel taky, ale až po napsání testu a spuštění. Tenhle vzor je tak častý, že na něj má pravidlo i linter.
:::

V týmu, kde každý píše jinak, se u každé změny kódu hádá o středníky a mezery a v rozdílu mezi verzemi je víc přeskládaných řádků než skutečných změn. Mezitím proklouzne nepoužitá proměnná, která prozrazuje zapomenutý výpočet slevy, nebo `if (hour = 8)`. Oba problémy řeší dva nástroje, které patří do každého projektu: linter a formátovač.

> [!REMEMBER]
> **Linter hledá chyby a podezřelý kód, formátovač jen přeskládá vzhled. Oba se pouštějí automaticky, ne ručně.**

Od téhle sekce má každý projekt v Akademii skript `npm run lint` a projde jím bez chyby.

## Co najde linter a co formátovač

| | [[linter]] (ESLint) | [[formátovač]] (Prettier, Biome) |
|---|---|---|
| co hlídá | chyby a riskantní vzory | vzhled kódu |
| příklady | nepoužitá proměnná, neexistující jméno, přiřazení v podmínce, `await` v cyklu | odsazení, uvozovky, středníky, délka řádku |
| mění kód | jen s `--fix` a jen u bezpečných pravidel | vždy, celý soubor |
| rozhoduje | ty, přes pravidla | skoro vše nástroj, nastavit jde málo |

Formátovač má záměrně málo voleb. Právě proto se o vzhledu kódu přestane diskutovat: rozhodl nástroj a všichni mají totéž.

:::check
Kolega tvrdí, že když projekt používá Prettier, ESLint už není potřeba. Co mu odpovíš?

### --answer--
Má pravdu, Prettier kód opraví a ESLint by hlásil totéž.

#### --why--
Myslíš si, že formátovač rozumí tomu, co kód dělá? Prettier vidí jen tvar, nepoužitou proměnnou nebo neexistující jméno přeskládá a nechá.

### --correct--
Nemá. Prettier mění jen vzhled, chyby jako nepoužitá proměnná nebo neexistující jméno najde jen ESLint.
:::

## ESLint a `eslint.config.js`

ESLint se nastavuje souborem `eslint.config.js` v kořeni projektu. Je to ES modul, jehož výchozí export je **pole konfiguračních objektů** — tomu se říká [[flat config]]:

```js
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      eqeqeq: 'error',
    },
  },
];
```

Objekty se aplikují od prvního k poslednímu a pozdější přebíjí dřívější:

- `{ ignores: ['dist/'] }` — objekt jen s `ignores` vyřadí soubory z kontroly úplně. `node_modules` ESLint vynechává sám, `dist/` ne.
- `js.configs.recommended` — doporučená sada pravidel z balíčku `@eslint/js`. Chytá skutečné chyby a nic jiného.
- `languageOptions.globals` — jména, která existují, i když je nikdo neimportuje. Balíček `globals` má připravené sady `globals.browser` (`window`, `document`, `fetch`, `console`…) a `globals.node` (`process`…).
- `rules` — zapnutí nebo změna pravidel. Hodnota je `'off'`, `'warn'` nebo `'error'`.

Kontrola se pouští příkazem `npx eslint .` nebo skriptem `"lint": "eslint ."`. Když najde chybu (`error`), skončí nenulovým kódem — na tom stojí automatické kontroly.

> [!NOTE]
> Ve starších projektech uvidíš `.eslintrc.json` nebo `.eslintrc.js`. Současný ESLint tenhle formát nečte a hlásí `ESLint couldn't find an eslint.config.* file.`

:::live node predict
```js
// cart.js
export function applyVoucher(cart, voucher, today) {
  const discount = voucher.percent / 100;
  let total = 0;
  for (const item of cart.items) {
    total += item.price;
  }
  return total;
}
```
--question-- Projekt má `eslint.config.js` jen s `js.configs.recommended`. Co vypíše `npx eslint cart.js`?
--output--
```text
/home/eva/eshop/cart.js
  1:45  error  'today' is defined but never used              no-unused-vars
  2:9   error  'discount' is assigned a value but never used  no-unused-vars

✖ 2 problems (2 errors, 0 warnings)
```
--why-- Pravidlo `no-unused-vars` hlásí jména, která vzniknou a nikdo je nepoužije. `today` je nepoužitý parametr a `discount` spočítaná sleva, která se do součtu nikdy nedostala. Druhé hlášení tak prozradilo skutečnou chybu: funkce slevu vůbec neuplatní.
:::

:::check
V projektu s `js.configs.recommended` hlásí ESLint u `console.log(total)` chybu `'console' is not defined  no-undef`. Co v `eslint.config.js` chybí?

### --answer--
Pravidlo `no-console: 'off'`.

#### --why--
Hláška je od pravidla `no-undef`, ne `no-console`. ESLint neví, že jméno `console` v prostředí existuje.

### --correct--
Globální jména prostředí v `languageOptions.globals`, třeba `globals.browser`.

### --answer--
Import `console` z balíčku `node:console`.

#### --why--
`console` v prohlížeči i v Node existuje bez importu. Problém není v kódu, ale v tom, že to ESLint neví.
:::

## Síla pravidel a výjimky

Každé pravidlo má jednu ze tří úrovní:

- `'error'` — kontrola selže, skript `lint` skončí chybou,
- `'warn'` — vypíše se, ale kontrolu nezastaví,
- `'off'` — pravidlo neplatí.

Varování mají tendenci se hromadit, až je nikdo nečte. **Pravidlo, na kterém ti záleží, dej jako `error`; které ne, vypni.**

Výjimku z pravidla na jednom konkrétním řádku zapíšeš komentářem a důvodem:

```js
// eslint-disable-next-line no-await-in-loop -- API banky nesnese souběžné požadavky
const payment = await sendPayment(order);
```

`--fix` opraví, co jde opravit bezpečně (třeba zbytečné `!!` v `if (!!isOpen)`), zbytek nechá na tobě: `npx eslint . --fix`.

> [!PITFALL]
> `/* eslint-disable */` na začátku souboru vypne **všechna** pravidla v celém souboru, i ta, která by za měsíc našla skutečnou chybu. Vypínej jen konkrétní pravidlo na konkrétním řádku a napiš proč.

:::check
Tým chce, aby pravidlo `eqeqeq` (vyžaduje `===` místo `==`) nepustilo kód s `==` do repozitáře. Jakou hodnotu mu dáš v `rules`?

### --expected--
error

### --accept--
'error'
2

### --why--
Jen `'error'` způsobí, že `eslint .` skončí nenulovým kódem a kontrola před commitem nebo na serveru neprojde. `'warn'` se vypíše a nic nezastaví.
:::

## Prettier nebo Biome

[Prettier](https://prettier.io) je nejrozšířenější formátovač. Nastavení v `.prettierrc.json` bývá krátké, protože skoro nic nastavit nejde:

```json
{
  "singleQuote": true,
  "printWidth": 100
}
```

```sh
npx prettier --write .   # přeformátuje soubory
npx prettier --check .   # jen zkontroluje, při rozdílu skončí chybou
```

`--write` patří do editoru a k ruční práci, `--check` do automatických kontrol. Prettier vynechá soubory z `.gitignore` a `.prettierignore`, takže `dist/` a `node_modules` nechá být, když jsou v `.gitignore`.

[Biome](https://biomejs.dev) je novější nástroj napsaný v Rustu, který umí formátování i lint najednou (`npx @biomejs/biome check .`) a je řádově rychlejší. Hodí se na nové projekty, kde nechceš skládat ESLint a Prettier dohromady. Pravidel pro lint má ale méně než ESLint s pluginy pro React nebo TypeScript.

Projekt má **jeden formátovač**. Dva formátovače nad stejným souborem se přetahují a každé uložení přepíše, co udělal ten druhý. ESLint a Prettier se naopak doplňují: současná doporučená pravidla ESLint o vzhled kódu nerozhodují.

:::check
`npx prettier --check .` v automatické kontrole skončí chybou. Co to znamená?

### --answer--
V kódu je syntaktická chyba.

#### --why--
Syntaktickou chybu by Prettier ohlásil jinou hláškou. `--check` porovnává tvar souborů s tím, jak by je naformátoval.

### --correct--
Aspoň jeden soubor není naformátovaný tak, jak by ho Prettier naformátoval.

### --answer--
Prettier soubory přeformátoval a kontrola chce, aby je autor commitnul.

#### --why--
`--check` soubory nikdy nemění, jen porovnává. Měnit je umí `--write`.
:::

## EditorConfig a formátování při uložení

Nejpohodlnější je, když se o formát nemusíš starat vůbec:

- **Formátování při uložení.** Ve VS Code nainstaluj rozšíření Prettier, nastav ho jako výchozí formátovač (`editor.defaultFormatter`) a zapni `editor.formatOnSave`. Soubor se srovná při každém Ctrl+S.
- **ESLint v editoru.** Rozšíření ESLint podtrhne chybu hned při psaní, ne až při kontrole.
- **EditorConfig.** Soubor `.editorconfig` říká každému editoru (i těm bez Prettieru) základní pravidla — odsazení, kódování a konce řádků:

```ini
root = true

[*]
indent_style = space
indent_size = 2
charset = utf-8
end_of_line = lf
insert_final_newline = true
```

:::check
Proč je `end_of_line = lf` v `.editorconfig` užitečné v týmu, kde někdo pracuje na Windows a někdo na Linuxu?

### --expected-- ignore-case
Aby měli všichni stejné konce řádků a Git nehlásil změnu na každém řádku

### --accept-- ignore-case
Aby Windows nepsal CRLF
Kvůli stejným koncům řádků
Aby se v rozdílech neměnily všechny řádky
Stejné konce řádků u všech

### --why--
Windows používá jiný konec řádku (CRLF) než Linux a macOS (LF). Bez dohody se po uložení změní každý řádek souboru a skutečná změna se v rozdílu ztratí.
:::

## Před commitem: git hook a lint-staged

Nástroje, které si musí každý pustit ručně, se pouštět přestanou. Proto se kontrola zapojí do Gitu. [[Git hook]] je skript, který Git spustí v určitou chvíli. Hook `pre-commit` běží před každým commitem, a když skončí chybou, commit se nevytvoří.

Hooky leží ve složce `.git/hooks`, která se neverzuje. Aby je měl každý v týmu, používá se jedna ze dvou cest:

- **vlastní složka ve verzi** — skript `.githooks/pre-commit` a v `package.json` skript `"prepare": "git config core.hooksPath .githooks"`, který npm spustí po `npm install`,
- **nástroj** jako `husky` nebo `simple-git-hooks`, který totéž zařídí sám.

Kontrola celého projektu může trvat dlouho. `lint-staged` proto pustí nástroje jen na soubory, které jdou do commitu. Nastavení v `package.json`:

```json
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{css,html,json,md}": "prettier --write"
  }
}
```

Hook `pre-commit` pak obsahuje jediný řádek `npx lint-staged`.

> [!PITFALL]
> Hook jde obejít: `git commit --no-verify` ho přeskočí. Proto se stejné kontroly (`npm run lint`, `prettier --check .`) pouštějí ještě na serveru při každém pushnutí. Hook je rychlá pomoc pro tebe, kontrola na serveru je pravidlo pro všechny.

:::check
Proč se `lint-staged` pouští jen na soubory připravené do commitu, a ne na celý projekt?

### --answer--
Protože ESLint neumí zkontrolovat víc souborů najednou.

#### --why--
ESLint zkontroluje celý projekt jedním příkazem `eslint .`. Důvod je jinde.

### --correct--
Aby byl commit rychlý a kontrola se týkala jen toho, co právě měníš.

### --answer--
Aby se do commitu nedostaly soubory, které neprošly kontrolou u kolegů.

#### --why--
Soubory kolegů do tvého commitu nejdou. `lint-staged` omezuje kontrolu kvůli rychlosti a zaměření na tvoje změny.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Chybějící globální jména.** `'document' is not defined  no-undef` u kódu, který v prohlížeči funguje. Oprava: `languageOptions: { globals: globals.browser }`.

> [!PITFALL]
> **Lint sestaveného kódu.** Po `npm run build` hlásí ESLint desítky chyb v `dist/assets/index-….js`. Oprava: `{ ignores: ['dist/'] }` jako první objekt v `eslint.config.js`.

> [!PITFALL]
> **Starý konfigurační soubor.** `ESLint couldn't find an eslint.config.* file.`, i když v projektu leží `.eslintrc.json`. Oprava: přepiš nastavení do `eslint.config.js`.

> [!PITFALL]
> **Dva formátovače.** Po každém uložení se mění uvozovky tam a zpátky. Oprava: nech jeden formátovač a druhý z editoru i z projektu odstraň.

:::check
ESLint v projektu s testy hlásí desítky chyb v souborech `coverage/lcov-report/*.js`, které vyrobil nástroj na pokrytí testů. Co s tím?

### --answer--
Doplnit do `globals` všechna jména, která hlásí.

#### --why--
Tím bys ladil nastavení podle kódu, který nikdo nepíše a který se při dalším běhu testů vyrobí znovu.

### --correct--
Přidat složku `coverage/` do `ignores` v `eslint.config.js`.

### --answer--
Soubory v `coverage/` opravit ručně.

#### --why--
Vygenerované soubory se při dalším běhu přepíšou a oprava zmizí. Linter patří jen na zdrojový kód.
:::

## Kde to najdeš v MDN

- [Client-side tooling overview](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Overview) — část o linterech a formátovačích a proč patří do projektu.
- [Configuration Files v dokumentaci ESLint](https://eslint.org/docs/latest/use/configure/configuration-files) — `eslint.config.js`, `files`, `ignores` a `globals`.
- [Rules Reference](https://eslint.org/docs/latest/rules/) — seznam pravidel; ta z `recommended` mají u sebe značku.
- [Prettier: Options](https://prettier.io/docs/options) — těch pár voleb, které Prettier má.

# --questions--

## --question--

V `eslint.config.js` je `export default [js.configs.recommended, { rules: { 'no-unused-vars': 'warn' } }]`. Kód má jednu nepoužitou proměnnou a nic dalšího. Jakým kódem skončí `npx eslint .`?

### --expected--
0

### --why--
Pozdější objekt přebil úroveň pravidla na `'warn'`. Varování se vypíše, ale ESLint skončí kódem 0, protože nenašel žádnou chybu úrovně `error`.

### --see--
nastroje-moduly-vite/lint-a-format#sila-pravidel-a-vyjimky

## --question--

Který z problémů najde formátovač, a ne linter?

### --answer--
Funkce `fetch` použitá v souboru pro Node bez nastavených globálních jmen.

#### --why--
Neznámé jméno hledá linter pravidlem `no-undef`. Formátovač jména nekontroluje.

### --correct--
Soubor, kde je polovina řádků odsazená tabulátorem a polovina mezerami.

#### --why--
Odsazení je čistě vzhled a přesně to formátovač srovná.

### --answer--
`await` uvnitř cyklu `for`, který posílá požadavky jeden po druhém.

#### --why--
To je vzor chování kódu, na který má ESLint pravidlo `no-await-in-loop`. Formátovač ho nevidí.

### --see--
nastroje-moduly-vite/lint-a-format#co-najde-linter-a-co-formatovac

## --question--

Napiš objekt, který v `eslint.config.js` vyřadí z kontroly složku `dist/`.

### --expected--
{ ignores: ['dist/'] }

### --accept--
{ ignores: ['dist'] }
{ ignores: ['dist/**'] }
{ ignores: ['**/dist/'] }

### --why--
Objekt, který obsahuje jen `ignores`, vyřadí soubory pro celou konfiguraci. Když má objekt vedle `ignores` i jiné klíče, platí `ignores` jen pro ten jeden objekt.

### --see--
nastroje-moduly-vite/lint-a-format#eslint-a-eslint-config-js
