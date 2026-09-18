# CI/CD

:::check pretest
Kolega pushne do `main` změnu, která rozbije build. U sebe testy nepustil, „byla to jen drobnost". Nasazení je ruční a dělá ho někdo jiný večer. Kdy se chyba nejspíš objeví?

### --answer--
Hned po pushi, Git rozbitý kód nepřijme.

#### --why--
Git neví nic o testech ani buildu. Přijme jakýkoli commit.

### --correct--
Až při večerním nasazení, nebo až u zákazníků.

#### --why--
Bez automatické kontroly se chyba ukáže v nejhorší chvíli a daleko od toho, kdo ji udělal. CI ji zachytí pár minut po pushi.

### --answer--
Při dalším pushi kohokoli jiného, protože se kód zkompiluje znovu.

#### --why--
Bez CI se při pushi nic nekompiluje. Chyba se schová, dokud někdo aplikaci nesestaví a nespustí.
:::

Ve dvou lidech na projektu se to stane za týden: někdo zapomene pustit testy,
někdo má jinou verzi Node, někdo nasadí z větve, která nebyla v `main`. Řešením
není větší disciplína, ale stroj, který stejné kontroly pouští u každé změny
a nasazuje jen to, co prošlo.

> [!REMEMBER]
> **CI pouští u každé změny stejné kontroly na čistém stroji; CD nasadí jen to, co jimi prošlo. Co neprojde, se do `main` ani na server nedostane.**

## Co je CI a CD

[[CI]] (*continuous integration*, průběžná integrace) znamená: každý push a každý pull
request spustí na čistém stroji instalaci závislostí, lint, kontrolu typů, testy
a build. Výsledek se ukáže přímo u pull requestu jako zelená fajfka nebo červený
křížek.

**CD** (*continuous delivery / deployment*) na to navazuje: po sloučení do `main`
se aplikace automaticky nasadí. Sestavuje se jednou, stejným postupem, a nasazuje se
přesně to, co prošlo kontrolami.

Proč čistý stroj: na tvém notebooku jsou globálně nainstalované balíčky, starý `dist`,
soubor `.env` a jiná verze Node. Čistý stroj v CI má jen to, co je v repozitáři.
Když tam build projde, projde i na serveru.

:::check
Testy na notebooku procházejí, v CI padají na `Cannot find module './Config.js'`. Soubor se na disku jmenuje `config.js`. Co se nejspíš děje?

### --answer--
CI má chybu, stačí úlohu pustit znovu.

#### --why--
Opakované spuštění dá stejný výsledek — rozdíl je v prostředí, ne v náhodě.

### --correct--
Notebook má souborový systém, který nerozlišuje velikost písmen, a CI běží na Linuxu, který ji rozlišuje.

#### --why--
Na macOS nebo Windows `./Config.js` najde `config.js`, na Linuxu ne. Server je taky Linux, takže CI chybu zachytilo dřív než produkce.

### --answer--
V CI chybí soubor `.env`.

#### --why--
Hláška mluví o chybějícím modulu, ne o proměnné prostředí. `.env` se neimportuje jako modul.
:::

## Workflow v GitHub Actions

Na GitHubu se CI popisuje souborem v `.github/workflows/`, třeba `ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

- **`on`** — kdy se workflow spustí: u každého pull requestu a u pushe do `main`.
- **`jobs`** — úlohy. Každá běží na vlastním čistém virtuálním stroji (`runs-on`).
- **`steps`** — kroky jdou po sobě. `uses` spustí hotovou akci (stažení repozitáře,
  instalace Node), `run` příkaz v shellu.

Pořadí kroků je od nejrychlejší kontroly po nejpomalejší: lint trvá sekundy, build
minuty. Krok, který skončí chybou, úlohu zastaví a další kroky se nespustí, takže se
o překlepu dozvíš za 20 sekund, ne za pět minut.

Příkazy v `run` jsou skripty z `package.json`. Díky tomu CI dělá přesně totéž, co
si pustíš lokálně — `npm run typecheck` je u tebe i v CI `tsc --noEmit`.

Jak CI pozná, že krok selhal? Jen podle **návratového kódu** příkazu. Nula je
úspěch, cokoli jiného chyba. Na výpis se nedívá:

:::live node predict
```js
// scripts/check-prices.js — v CI jako krok: run: node scripts/check-prices.js
const bikes = [
  { name: 'Superior XC 879', pricePerDay: 450 },
  { name: 'Kellys Tyke 24', pricePerDay: -190 },
];

for (const bike of bikes) {
  if (bike.pricePerDay <= 0) {
    console.error(`Neplatná cena u kola ${bike.name}`);
  }
}
```
--question-- Jak dopadne krok v CI?
--option-- Selže, protože skript zapsal chybu do `console.error`.
--option*-- Projde, protože skript skončil s kódem 0.
--option-- Skončí varováním, protože `console.error` je jen varování.
--output--
```text
$ node scripts/check-prices.js; echo "návratový kód: $?"
Neplatná cena u kola Kellys Tyke 24
návratový kód: 0
```
--why-- CI rozhoduje jen podle návratového kódu. Skript chybu vypsal, ale doběhl normálně, takže krok je zelený. Kontrolní skript musí po nalezení chyby nastavit `process.exitCode = 1`.
:::

:::check
Workflow má kroky v pořadí `npm run build`, `npm test`, `npm run lint`. V pull requestu je chyba formátování, kterou najde jen lint. Build trvá 4 minuty, testy 2 minuty. Za jak dlouho se autor chybu dozví? Napiš počet minut.

### --expected--
6

### --accept--
6 minut
šest

### --why--
Lint je poslední, takže napřed doběhne build (4 min) a testy (2 min). Při pořadí lint → testy → build by se to autor dozvěděl za pár sekund.
:::

## `npm ci` a cache

V CI se závislosti instalují přes `npm ci`, ne `npm install`:

| | `npm install` | `npm ci` |
|---|---|---|
| zámek `package-lock.json` | může ho změnit | musí sedět, jinak skončí chybou |
| verze balíčků | v rozsahu z `package.json` | přesně ze zámku |
| `node_modules` | doplní | smaže a nainstaluje znovu |

CI tak testuje přesně ty verze, které jsi zkoušel a commitnul. Když zámek chybí nebo
nesedí s `package.json`, `npm ci` skončí hláškou
`npm ci can only install packages when your package.json and package-lock.json are in sync`.

Stahovat všechny balíčky při každém pushi je pomalé. `cache: npm` v `setup-node`
uloží stažené balíčky (adresář `~/.npm`, ne `node_modules`) a použije je znovu,
dokud se nezmění zámek. Klíčem cache je otisk souboru `package-lock.json`: změníš
závislost, změní se klíč a cache se postaví znovu.

:::check
Proč cache v CI používá jako klíč otisk `package-lock.json`, a ne třeba datum?

### --answer--
Protože datum nejde v YAML zapsat.

#### --why--
Datum zapsat jde. Jde o to, kdy má být uložený obsah ještě platný.

### --correct--
Cache má platit, dokud se nezmění závislosti, a ty přesně popisuje zámek.

#### --why--
Se stejným zámkem jsou potřeba stejné balíčky, takže uložená cache sedí. Změna závislosti změní otisk a vznikne nová cache.

### --answer--
Protože `package-lock.json` se mění při každém commitu.

#### --why--
Zámek se mění jen při změně závislostí. Kdyby se měnil pořád, cache by nikdy nepomohla.
:::

## Tajemství v CI

Nasazení potřebuje klíče: token k platformě, heslo k registru image. Do workflow ani
do repozitáře je nepíšeš. Uložíš je v GitHubu do **Settings → Secrets and variables
→ Actions** a ve workflow se na ně odkážeš:

```yaml
- run: npm run deploy
  env:
    DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

- Hodnota se do kroku předá jako proměnná prostředí, jen tam, kde ji uvedeš.
- Když ji příkaz vypíše, GitHub ji ve výpisu nahradí `***`. Na tohle maskování ale
  nespoléhej: stačí hodnotu zakódovat nebo rozdělit a vypíše se celá.
- Pull requesty z cizích forků tajemství nedostanou. Kdo pošle PR, by jinak mohl
  upravit workflow a tokeny si poslat k sobě.
- Tajemství pro produkci patří do **prostředí** (*environment*) `production`, které
  může vyžadovat schválení, než se úloha spustí.

> [!PITFALL]
> **`run: echo ${{ secrets.DEPLOY_TOKEN }} | base64`** „kvůli ladění". Maskování
> pozná jen původní hodnotu, ne zakódovanou, a token je v logu, který čte každý
> s přístupem k repozitáři. Oprava: tajemství nikdy nevypisovat; když uteklo,
> zneplatnit a vydat nové.

:::check
Student pošle pull request z forku tvého veřejného repozitáře. Workflow v kroku nasazení náhledu používá `secrets.DEPLOY_TOKEN` a padá, protože token je prázdný. Je to chyba nastavení?

### --answer--
Ano, tajemství se musí u forku nastavit znovu v jeho repozitáři.

#### --why--
I kdyby si je autor forku nastavil, šlo by o jeho tajemství, ne tvoje. Prázdná hodnota je u PR z forku záměr.

### --correct--
Ne, GitHub tajemství do workflow z cizích forků záměrně nepředává.

#### --why--
Autor PR může workflow upravit. Kdyby tajemství dostal, poslal by si je. Krok, který tajemství potřebuje, má u PR z forku počítat s tím, že nepoběží.

### --answer--
Ano, tajemství je špatně pojmenované.

#### --why--
Se špatným jménem by bylo prázdné u všech pull requestů, ne jen u těch z forků.
:::

## Nasazení po merge

Kontrola u pull requestu je k ničemu, když jde do `main` sloučit i s červeným
křížkem. V nastavení repozitáře proto zapneš **ochranu větve** (*branch protection*
nebo *ruleset*): do `main` jde jen přes pull request a jen s úspěšnou úlohou `check`.

Nasazení je pak druhá úloha, která čeká na první a běží jen pro `main`:

```yaml
  deploy:
    needs: check
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: curl --fail -X POST "$DEPLOY_HOOK_URL"
        env:
          DEPLOY_HOOK_URL: ${{ secrets.DEPLOY_HOOK_URL }}
```

- **`needs: check`** — nasazení se spustí jen po úspěšné kontrole.
- **`if`** — u pull requestů se úloha přeskočí, nasazuje se jen `main`.
- **Deploy hook** — adresa, kterou dá platforma (Render, Railway…). Zavolání spustí
  nasazení. U vlastního serveru místo toho CI postaví image, nahraje ho do registru
  a server si ho stáhne.

Mnoho platforem (Vercel, Netlify, Render) umí nasadit samo po pushi do `main`. Pak
v nastavení zapni, ať čeká na úspěšné kontroly z GitHubu — jinak nasadí i rozbitý
commit.

:::check
Workflow má úlohy `check` a `deploy`, ale `deploy` nemá `needs: check`. Co se stane, když v `main` selžou testy?

### --answer--
`deploy` se nespustí, protože celý workflow selhal.

#### --why--
Úlohy bez `needs` běží souběžně a navzájem na sebe nečekají. Selhání jedné druhou nezastaví.

### --correct--
`deploy` poběží souběžně s `check` a rozbitou verzi nasadí.

#### --why--
Bez `needs` mezi úlohami není žádná závislost. Nasazení doběhne dřív, než testy stihnou selhat.

### --answer--
GitHub úlohu `deploy` zablokuje, protože má `environment: production`.

#### --why--
Prostředí může vyžadovat schválení, ale o výsledku testů nic neví.
:::

## Náhledová prostředí

[[náhledové prostředí|Náhledové prostředí]] (*preview deployment*) je samostatná
kopie aplikace pro jeden pull request, s vlastní adresou jako
`pujcovna-pr-42.onrender.com`. Vercel, Netlify i Render ho umí založit automaticky
a odkaz vloží do pull requestu.

K čemu je: kdo dělá review, klikne na odkaz a vidí změnu naživo. Designér zkontroluje
vzhled, produktový vlastník chování, a nikdo si nemusí stahovat větev.

Pravidla, aby náhled nenadělal škodu:

- **Vlastní data.** Náhled se nikdy nepřipojuje k produkční databázi. Dostane
  prázdnou nebo zkušební databázi s vymyšlenými daty.
- **Vlastní tajemství.** Testovací klíče platební brány, žádné produkční.
- **Po sloučení zaniká.** Platforma náhled smaže, když se pull request zavře.

:::check
Proč náhledové prostředí pull requestu nesmí používat produkční databázi?

### --answer--
Protože by bylo pomalé.

#### --why--
Rychlost tu nehraje roli. Jde o to, co nevyzkoušený kód s daty udělá.

### --correct--
Kód v pull requestu ještě neprošel review a chyba nebo migrace v něm by změnila skutečná data zákazníků.

#### --why--
Náhled je na zkoušení. Rozbitý dotaz nebo pokusná migrace mají dopadnout na zkušební data, ne na produkci.

### --answer--
Protože platformy k produkční databázi nepustí nic jiného než `main`.

#### --why--
Platforma připojení podle větve nehlídá. Pokud náhledu dáš produkční adresu databáze, připojí se.
:::

## Rollback

Nasazení se jednou pokazí. [[rollback]] je návrat k předchozí verzi, která fungovala
— a musí trvat minuty, ne hodinu hledání chyby pod tlakem.

Jde rychle, když se sestavené verze **nemění a zůstávají uložené**:

- Image v registru se označí otiskem commitu (`pujcovna-kol:3f9c2e1`), ne jen
  `latest`. Rollback = spustit předchozí značku.
- Platformy drží předchozí nasazení a mají tlačítko pro návrat (Vercel „Instant
  Rollback", Render „Rollback").
- `git revert` a nové nasazení funguje taky, ale projde celým CI a trvá déle.

Nejdřív vrať, pak hledej. Opravu napíšeš v klidu a nasadíš normální cestou.

Co vrátit nejde, je **databáze**. Když nová verze smazala sloupec, stará verze po
rollbacku spadne na `no such column`. Proto se změny schématu dělají tak, aby
předchozí verze aplikace fungovala i s novým schématem.

:::check
Nová verze po nasazení vrací u rezervací `500`. Předchozí verze fungovala a změna schématu v nasazení nebyla. Co uděláš jako první?

### --answer--
Najdu chybu v kódu a nasadím opravu.

#### --why--
Hledání pod tlakem trvá dlouho a zákazníci mezitím nemůžou rezervovat. Oprava přijde na řadu, až web zase jede.

### --correct--
Vrátím předchozí verzi a chybu hledám potom.

#### --why--
Předchozí verze fungovala a schéma se nezměnilo, takže návrat je bezpečný a rychlý. Opravu pak napíšeš v klidu.

### --answer--
Restartuju server.

#### --why--
Restart spustí stejnou rozbitou verzi znovu.
:::

## Dvoufázová změna schématu

Při nasazení chvíli běží stará i nová verze aplikace zároveň (stará dobíhá, nová
startuje) a po rollbacku zase stará s novou databází. Změna schématu proto nesmí
rozbít ani jednu z nich. Postup se jmenuje [[dvoufázová změna schématu]]
(*expand/contract*): nejdřív rozšířit, až potom uklidit.

Příklad: sloupec `customer_name` se má přejmenovat na `full_name`.

1. **Rozšíření (nasazení 1).** Migrace přidá sloupec `full_name` a doplní do něj
   data. Aplikace zapisuje do obou sloupců, čte ze starého.
2. **Přepnutí (nasazení 2).** Aplikace čte z `full_name` a dál zapisuje do obou.
3. **Úklid (nasazení 3, klidně o týden později).** Aplikace přestane zapisovat do
   `customer_name` a migrace sloupec smaže.

V každém okamžiku funguje aktuální i předchozí verze, takže rollback je bezpečný.
Přímé `ALTER TABLE rentals RENAME COLUMN` by rozbilo starou verzi v tu vteřinu,
kdy migrace doběhne.

:::explain
Vysvětli, proč se přejmenování sloupce v produkci nedělá jedním `RENAME COLUMN`, ale na tři nasazení.

## --model--
Během nasazení běží chvíli stará i nová verze zároveň a při rollbacku se vrací stará verze k nové databázi. Po přímém přejmenování by stará verze hledala sloupec, který už neexistuje, a padala. Když sloupec nejdřív přidám a zapisuju do obou, fungují obě verze, a starý sloupec smažu až ve chvíli, kdy ho žádná nasazená ani vratná verze nepotřebuje.

## --checklist--
- Při nasazení běží chvíli stará i nová verze současně.
- Rollback vrací starou verzi k nové databázi.
- Stará verze po přímém přejmenování padá na chybějícím sloupci.
- Nový sloupec se přidá dřív a zapisuje se do obou.
- Starý sloupec se maže až v pozdějším nasazení.
:::

:::check
Nasazení 1 přidalo sloupec `full_name` a aplikace zapisuje do obou sloupců. V nasazení 2 (aplikace čte z `full_name`) se objeví chyba. Můžeš bezpečně vrátit verzi z nasazení 1?

### --answer--
Ne, databáze už má nový sloupec a stará verze s ním nepočítá.

#### --why--
Verze z nasazení 1 nový sloupec sama přidala a zapisuje do něj. Nový sloupec jí nevadí.

### --correct--
Ano, verze 1 čte ze starého sloupce, který pořád existuje a je naplněný.

#### --why--
Přesně proto se starý sloupec maže až ve třetím nasazení: do té doby jde vždycky o krok zpátky.

### --answer--
Jen když nejdřív smažeš sloupec `full_name`.

#### --why--
Mazat nic nemusíš. Verze 1 s oběma sloupci počítá.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Kontrolní skript, který chybu jen vypíše.** Krok je zelený, i když našel chybu.
> Oprava: `process.exitCode = 1` po nalezení chyby; test to hlídá sám.

> [!PITFALL]
> **`npm install` v CI.** Nainstaluje jiné verze než zámek, nebo zámek potichu změní,
> a v CI testuješ něco jiného, než máš lokálně. Oprava: `npm ci` a commitnutý
> `package-lock.json`.

> [!PITFALL]
> **Nasazení bez ochrany větve.** Pull request s červeným křížkem jde sloučit
> a platforma, která nasazuje po pushi, rozbitou verzi nasadí. Oprava: povinné
> kontroly v ochraně větve a u platformy „čekat na CI".

> [!PITFALL]
> **Image jen se značkou `latest`.** Po špatném nasazení nevíš, jaký image běžel
> předtím, a nemáš se kam vrátit. Oprava: značka podle commitu, `latest` nanejvýš
> navíc.

> [!PITFALL]
> **Migrace, která maže nebo přejmenovává v jednom kroku s novým kódem.** Stará
> verze během nasazení padá na `no such column` a rollback nejde. Oprava: dvoufázová
> změna schématu.

:::check
Workflow projde, ale na serveru běží jiné verze balíčků, než s jakými procházely testy. V kroku instalace je `npm install`. Co změníš?

### --expected--
npm ci

### --accept--
run: npm ci
použít npm ci

### --why--
`npm ci` instaluje přesně verze ze zámku a skončí chybou, když zámek nesedí. Stejné verze pak máš v CI, v image i na serveru.
:::

## Kde to najdeš v MDN

- [Deploying our app](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Deployment) — ukázka nasazení s automatickým buildem po pushi a testem v pipeline.
- [Package management basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Package_management) — `package.json`, zámek a instalace závislostí.
- Mimo MDN: v dokumentaci GitHubu hledej „Workflow syntax for GitHub Actions", „Using secrets in GitHub Actions" a „About protected branches"; v dokumentaci npm „npm ci".

# --questions--

## --question--

Kontrolní skript v CI najde neplatná data a zavolá `console.error('Chyba v datech')`. Který řádek přidáš, aby krok v CI selhal, ale skript ještě dopsal všechny chyby?

### --expected--
process.exitCode = 1

### --accept--
process.exitCode = 1;
process.exitCode=1

### --why--
`process.exitCode = 1` nastaví návratový kód, se kterým proces skončí, až doběhne. `process.exit(1)` by skončil hned a další chyby by nevypsal.

### --see--
nasazeni-provoz/ci-cd#workflow-v-github-actions

## --question--

Ve workflow je úloha `deploy` s `needs: check` a bez podmínky `if`. Co se stane u každého pull requestu, jehož kontroly projdou?

### --answer--
Nic, `needs` nasazení u pull requestů přeskočí.

#### --why--
`needs` jen čeká na úspěšnou úlohu `check`. O větvi nerozhoduje.

### --correct--
Nasadí se do produkce kód z pull requestu, který ještě nebyl sloučený.

#### --why--
Workflow se spouští i u pull requestů a nic nasazení neomezuje na `main`. Proto podmínka `if` na `push` do `main`.

### --answer--
GitHub nasazení zamítne, protože pull request není v `main`.

#### --why--
GitHub úlohu spustí, jak ji popíšeš. Pravidla pro větve musíš do workflow napsat sám.

### --see--
nasazeni-provoz/ci-cd#nasazeni-po-merge

## --question--

Sloupec `phone` v tabulce zákazníků už nechceš. Aplikace ho dnes čte i zapisuje. Kolik nasazení nejméně potřebuješ, aby sloupec zmizel a rollback zůstal v každém kroku bezpečný? Napiš číslo.

### --expected--
2

### --accept--
dvě
dva

### --why--
Nejdřív nasadíš verzi, která sloupec přestane číst i zapisovat. Až je jisté, že se k předchozí verzi nevrátíš, druhé nasazení sloupec smaže migrací. Přejmenování potřebuje tři kroky, protože nový sloupec se musí nejdřív přidat.

### --see--
nasazeni-provoz/ci-cd#dvoufazova-zmena-schematu
