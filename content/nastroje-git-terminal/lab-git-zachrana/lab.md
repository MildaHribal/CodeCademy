---
title: Záchrana repozitáře
timeoutMs: 30000
---

# --description--

Nastupuješ do týmu, který spravuje rezervace tenisových kurtů TK Lesná. Kolegyně Jana
odjela na týden na hory a repozitář `kurty` po sobě nechala ve stavu, který by nikdo
nechtěl převzít. Na serveru (`origin`) je všechno až po commit „Doplň README", jeden
commit navíc je jen lokálně. Dostaň repozitář do pořádku.

Funguje to jako ve workshopech: příkazy píšeš do `commands.sh`, `setup.sh` pokaždé
připraví čistou kopii repozitáře `work/kurty` i se „serverem" `work/server.git`
a **Spustit** ukáže výstup. Soubory `setup.sh`, `run.sh` a `index.js` neměň. Soubor
v repozitáři přepíšeš celým obsahem přes `cat > soubor <<'JS' … JS`.

Co je potřeba:

- Poslední commit „Přidej platby kartou" skončil na `main`, ale platby ještě nejsou
  hotové. Patří do větve `feature/platby` a `main` je obsahovat nemá.
- Co už je na serveru, mají kolegové. Tuhle historii nepřepisuj.
- Commit „Ukliď nepoužívané soubory" smazal kromě starého kalendáře i `src/holidays.js`,
  bez kterého `src/prices.js` nejde ani načíst. Soubor se má vrátit s původním obsahem,
  aby svátky dál stály jako víkend.
- Jana chtěla do `main` dostat studentskou slevu z větve `feature/studentska-sleva`.
  Na `main` mezitím přibyla sleva pro členy klubu. Obě slevy mají fungovat: člen klubu
  má 20 %, student 30 %, a když je zákazník obojí, platí jen vyšší sleva.
- Soubor `.env` s ostrým klíčem platební brány je v repozitáři a je i na serveru.
  Klíč už je u brány zneplatněný (to se v terminálu udělat nedá). Git ale `.env` dál
  sledovat nesmí a soubor musí zůstat na disku, aplikace ho lokálně potřebuje.
- Délka rezervace se počítá špatně: 18:30–20:00 vychází na dvě hodiny. Ve verzi `v1.0`
  to fungovalo a skript `scripts/test-duration.mjs` chybu pozná návratovým kódem.
  Najdi commit, který chybu zavedl, a oprav ji tak, aby bylo v historii vidět, který
  commit se vrací.
- Na konci stojíš na `main`, nic nezůstane rozdělané a pracovní složka je čistá.

# --hints--

Větev `feature/platby` obsahuje commit „Přidej platby kartou".

```js
await helpers.run('bash run.sh');
const log = await helpers.run('cd work/kurty && git log --format=%s feature/platby');
assert.ok(log.code === 0 && log.stdout.split('\n').includes('Přidej platby kartou'), 'git log feature/platby má obsahovat commit „Přidej platby kartou"');
```

`main` commit „Přidej platby kartou" neobsahuje.

```js
await helpers.run('bash run.sh');
const log = await helpers.run('cd work/kurty && git log --format=%s main');
assert.ok(log.stdout.includes('Založ rezervace kurtů'), 'větev main má dál existovat s celou historií');
assert.ok(!log.stdout.split('\n').includes('Přidej platby kartou'), 'git log main nemá obsahovat „Přidej platby kartou" — ta patří jen do feature/platby');
```

Historie ze serveru (`origin/main`) zůstala v `main` celá.

```js
await helpers.run('bash run.sh');
const ancestor = await helpers.run('cd work/kurty && git merge-base --is-ancestor origin/main main');
assert.equal(ancestor.code, 0, 'origin/main má být předkem main — commity, které už jsou na serveru, nepřepisuj');
```

`src/holidays.js` je v posledním commitu `main` s původním obsahem z `v1.0`.

```js
await helpers.run('bash run.sh');
const same = await helpers.run('cd work/kurty && git cat-file -e main:src/holidays.js && git diff --quiet v1.0 main -- src/holidays.js');
assert.equal(same.code, 0, 'src/holidays.js má být commitnutý v main a shodný s verzí v1.0');
```

Státní svátek se počítá jako víkend: hodina 28. 10. 2026 (středa) stojí 400 Kč.

```js
await helpers.run('bash run.sh');
const prices = await import(`${helpers.dir}/work/kurty/src/prices.js`).catch((error) => assert.fail(`src/prices.js nejde načíst: ${error.message}`));
const { calculatePrice } = prices;
const price = calculatePrice({ date: '2026-10-28', hours: 1 });
assert.ok(Math.abs(price - 400) < 0.01, `calculatePrice({ date: '2026-10-28', hours: 1 }) má vrátit 400, vrátil ${price}`);
```

Větev `feature/studentska-sleva` je sloučená do `main`.

```js
await helpers.run('bash run.sh');
const merged = await helpers.run('cd work/kurty && git merge-base --is-ancestor feature/studentska-sleva main');
assert.equal(merged.code, 0, 'poslední commit feature/studentska-sleva má být v historii main');
```

Studentská sleva i sleva pro členy fungují a nesčítají se.

```js
await helpers.run('bash run.sh');
const prices = await import(`${helpers.dir}/work/kurty/src/prices.js`).catch((error) => assert.fail(`src/prices.js nejde načíst: ${error.message}`));
const { calculatePrice } = prices;
const cases = [
  [{ date: '2026-09-16', hours: 2 }, 600],
  [{ date: '2026-09-16', hours: 2, student: true }, 420],
  [{ date: '2026-09-19', hours: 1.5, member: true }, 480],
  [{ date: '2026-09-16', hours: 2, member: true, student: true }, 420],
];
for (const [input, expected] of cases) {
  const price = calculatePrice(input);
  assert.ok(Math.abs(price - expected) < 0.01, `calculatePrice(${JSON.stringify(input)}) má vrátit ${expected}, vrátil ${price}`);
}
```

V žádném sledovaném souboru v `main` nezůstaly značky konfliktu.

```js
await helpers.run('bash run.sh');
const markers = await helpers.run('cd work/kurty && git grep -n -E "^(<<<<<<<|=======|>>>>>>>)" main');
assert.equal(markers.stdout.trim(), '', 'soubory v main nesmí obsahovat značky konfliktu <<<<<<<, ======= ani >>>>>>>');
```

Git `.env` nesleduje, ale soubor zůstal na disku.

```js
const { existsSync } = await import('node:fs');
await helpers.run('bash run.sh');
const tracked = await helpers.run('cd work/kurty && git ls-files .env');
assert.equal(tracked.stdout.trim(), '', 'git ls-files .env má být prázdný — Git .env sledovat nemá');
assert.ok(existsSync(`${helpers.dir}/work/kurty/.env`), 'soubor .env má zůstat na disku — smaže ho git rm bez --cached i návrat z commitu nebo větve, kde je .env ještě sledovaný (bisect, merge)');
```

`.env` Git ignoruje, takže se nevrátí ani omylem přes `git add .`.

```js
await helpers.run('bash run.sh');
const ignored = await helpers.run('cd work/kurty && git check-ignore -q .env');
assert.equal(ignored.code, 0, 'git check-ignore .env má potvrdit, že je .env ignorovaný');
const committed = await helpers.run('cd work/kurty && git show main:.gitignore');
assert.match(committed.stdout, /^\/?\.env\s*$/m, 'pravidlo pro .env má být v .gitignore commitnutém v main, ne jen v pracovní složce');
```

`durationInHours('18:30', '20:00')` vrací 1.5.

```js
await helpers.run('bash run.sh');
const duration = await import(`${helpers.dir}/work/kurty/src/duration.js`).catch((error) => assert.fail(`src/duration.js nejde načíst: ${error.message}`));
const { durationInHours } = duration;
assert.equal(durationInHours('18:30', '20:00'), 1.5, "durationInHours('18:30', '20:00') má vrátit 1.5");
assert.equal(durationInHours('07:15', '08:00'), 0.75, "durationInHours('07:15', '08:00') má vrátit 0.75");
```

Chyba je opravená revertem commitu „Zjednoduš výpočet délky rezervace" a ten commit v historii zůstal.

```js
await helpers.run('bash run.sh');
const log = await helpers.run('cd work/kurty && git log --format=%s main');
const subjects = log.stdout.split('\n');
assert.ok(subjects.includes('Revert "Zjednoduš výpočet délky rezervace"'), 'main má obsahovat commit Revert "Zjednoduš výpočet délky rezervace" — oprav chybu revertem commitu, který ji zavedl');
assert.ok(subjects.includes('Zjednoduš výpočet délky rezervace'), 'původní commit „Zjednoduš výpočet délky rezervace" má v historii zůstat');
```

Stojíš na `main`, bisect, merge ani revert nezůstaly rozdělané a pracovní složka je čistá.

```js
await helpers.run('bash run.sh');
const current = await helpers.run('cd work/kurty && git branch --show-current');
assert.equal(current.stdout.trim(), 'main', 'na konci máš stát na main — po bisectu se vrať přes git bisect reset');
const gitDir = await helpers.run('cd work/kurty && ls .git');
assert.ok(!/^(BISECT_LOG|MERGE_HEAD|REVERT_HEAD|CHERRY_PICK_HEAD|rebase-merge|rebase-apply)$/m.test(gitDir.stdout), 'bisect, merge, revert ani rebase nemají zůstat rozdělané');
const status = await helpers.run('cd work/kurty && git status --porcelain');
assert.equal(status.stdout.trim(), '', 'git status --porcelain má být na konci prázdný');
```

# --help--

## --tip-- 4

Soubor z dřívější verze vrátí `git restore` s přepínačem `--source` (nebo `git checkout` s commitem a `--`). Obnovený soubor je nejdřív jen v pracovní složce, do commitu ho musíš přidat.

## --tip-- 12

Commit s chybou najde `git bisect run` se skriptem, který chybu pozná návratovým kódem. Nezapomeň po nalezení chyby a před další prací proces hledání ukončit příslušným příkazem, aby se Git vrátil do původního stavu. Nalezený commit si Git před resetem pamatuje pod jménem `refs/bisect/bad`, takže jeho hash můžeš předat do dalšího příkazu (např. do revert) nebo uložit do proměnné.

# --seed--

## --file-- commands.sh

```sh
# Záchrana repozitáře rezervací kurtů.
# Příkazy běží shora dolů ve složce repozitáře kurty, jako bys je psal do terminálu.

--edit--

--edit--
```

## --file-- setup.sh

```sh
# Připraví repozitář rezervací kurtů se všemi průšvihy a „server" origin.
# Tenhle soubor neměň: každé spuštění začíná od stejného stavu.
git init -q --bare -b main server.git
git init -q -b main kurty
cd kurty || exit 1
git remote add origin ../server.git
mkdir -p src scripts

day=0
commit() {
  day=$((day + 1))
  export GIT_AUTHOR_DATE="2026-09-0${day}T10:00:00+02:00" GIT_COMMITTER_DATE="2026-09-0${day}T10:00:00+02:00"
  git add -A
  git commit -q -m "$1"
}

echo '{ "type": "module" }' > package.json
printf 'node_modules/\n' > .gitignore
printf '# Rezervace kurtů TK Lesná\n\nRezervace tenisových kurtů v Brně.\n' > README.md

cat > src/holidays.js <<'EOF'
// Státní svátky v ČR, které se počítají jako víkend.
const HOLIDAYS = ['2026-09-28', '2026-10-28', '2026-11-17', '2026-12-24', '2026-12-25', '2026-12-26'];

export const isHoliday = (date) => HOLIDAYS.includes(date);
EOF

cat > src/legacy-calendar.js <<'EOF'
// Starý kalendář z první verze, nikde se nepoužívá.
export const monthNames = ['leden', 'únor', 'březen'];
EOF

cat > src/prices.js <<'EOF'
import { isHoliday } from './holidays.js';

const BASE_PRICE_PER_HOUR = 300;
const WEEKEND_SURCHARGE = 100;

export function calculatePrice({ date, hours }) {
  const day = new Date(date).getDay();
  const weekendRate = day === 0 || day === 6 || isHoliday(date);
  const hourly = weekendRate ? BASE_PRICE_PER_HOUR + WEEKEND_SURCHARGE : BASE_PRICE_PER_HOUR;
  return hourly * hours;
}
EOF

cat > src/duration.js <<'EOF'
const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const durationInHours = (start, end) => (toMinutes(end) - toMinutes(start)) / 60;
EOF

cat > scripts/test-duration.mjs <<'EOF'
// Ověří výpočet délky rezervace. Skončí kódem 0, když je výpočet v pořádku, jinak 1.
import { durationInHours } from '../src/duration.js';

const cases = [['18:00', '20:00', 2], ['18:30', '20:00', 1.5], ['07:15', '08:00', 0.75]];
let failed = 0;
for (const [start, end, expected] of cases) {
  const actual = durationInHours(start, end);
  if (actual !== expected) {
    console.error(`durationInHours('${start}', '${end}') vrátil ${actual}, čekáno ${expected}`);
    failed += 1;
  }
}
process.exit(failed > 0 ? 1 : 0);
EOF
commit 'Založ rezervace kurtů'
git tag v1.0

cat > src/payment.js <<'EOF'
export const paymentConfig = () => ({ apiKey: process.env.PAYMENT_API_KEY, currency: 'CZK' });
EOF
printf 'PAYMENT_API_KEY=pk_live_51Hq8kurtyLesna2026\n' > .env
commit 'Přidej konfiguraci platební brány'

cat > src/duration.js <<'EOF'
export const durationInHours = (start, end) => Number(end.split(':')[0]) - Number(start.split(':')[0]);
EOF
commit 'Zjednoduš výpočet délky rezervace'

cat > src/courts.js <<'EOF'
export const courts = [
  { id: 1, name: 'Kurt 1 (antuka)' },
  { id: 2, name: 'Kurt 2 (antuka)' },
  { id: 3, name: 'Hala (umělý povrch)' },
];
EOF
commit 'Přidej kurty na Lesné'

git branch feature/studentska-sleva

cat > src/prices.js <<'EOF'
import { isHoliday } from './holidays.js';

const BASE_PRICE_PER_HOUR = 300;
const WEEKEND_SURCHARGE = 100;

export function calculatePrice({ date, hours, member = false }) {
  const day = new Date(date).getDay();
  const weekendRate = day === 0 || day === 6 || isHoliday(date);
  const hourly = weekendRate ? BASE_PRICE_PER_HOUR + WEEKEND_SURCHARGE : BASE_PRICE_PER_HOUR;
  const discount = member ? 0.2 : 0;
  return hourly * hours * (1 - discount);
}
EOF
commit 'Přidej slevu pro členy klubu'

git rm -q src/holidays.js src/legacy-calendar.js
commit 'Ukliď nepoužívané soubory'

printf '\nSpuštění kontroly: `node scripts/test-duration.mjs`\n' >> README.md
commit 'Doplň README'
git push -q -u origin main

cat > src/card-payment.js <<'EOF'
import { paymentConfig } from './payment.js';

export const createCardPayment = (amount) => ({ ...paymentConfig(), amount, method: 'card' });
EOF
commit 'Přidej platby kartou'

git switch -q feature/studentska-sleva
cat > src/prices.js <<'EOF'
import { isHoliday } from './holidays.js';

const BASE_PRICE_PER_HOUR = 300;
const WEEKEND_SURCHARGE = 100;

export function calculatePrice({ date, hours, student = false }) {
  const day = new Date(date).getDay();
  const weekendRate = day === 0 || day === 6 || isHoliday(date);
  const hourly = weekendRate ? BASE_PRICE_PER_HOUR + WEEKEND_SURCHARGE : BASE_PRICE_PER_HOUR;
  const discount = student ? 0.3 : 0;
  return hourly * hours * (1 - discount);
}
EOF
commit 'Přidej studentskou slevu'
git switch -q main
unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
```

## --file-- run.sh

```sh
# Tlačítko Spustit i testy: vytvoří čistou kopii a v repozitáři spustí tvoje commands.sh.
# Git tu běží bez tvého osobního nastavení a místo editoru přijme výchozí zprávu.
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 GIT_EDITOR=true LC_ALL=C
export GIT_AUTHOR_NAME='Jana Nováková' GIT_AUTHOR_EMAIL='jana@kurty-lesna.cz'
export GIT_COMMITTER_NAME='Jana Nováková' GIT_COMMITTER_EMAIL='jana@kurty-lesna.cz'
rm -rf work && mkdir work && cd work || exit 1
bash ../setup.sh
cd kurty || exit 1
bash ../../commands.sh
```

## --file-- index.js

```js
// Tlačítko Spustit pustí run.sh a ukáže, co by vypsal terminál.
import { spawnSync } from 'node:child_process';

const { status } = spawnSync('bash', ['run.sh'], { stdio: 'inherit' });
console.log(`\nNávratový kód posledního příkazu: ${status}`);
```

# --solution--

## --file-- commands.sh

```sh
# Záchrana repozitáře rezervací kurtů.
# Příkazy běží shora dolů ve složce repozitáře kurty, jako bys je psal do terminálu.

# Platby kartou patří do vlastní větve. Commit ještě není na serveru, smí se přepsat.
git branch feature/platby
git reset --hard HEAD~1

# Svátky vrátí soubor z verze, kde ještě byl.
git restore --source=v1.0 src/holidays.js
git add src/holidays.js
git commit -m "Vrať src/holidays.js, ceny ho potřebují"

# Commit s chybou v délce rezervace najde bisect, oprava revertem.
git bisect start HEAD v1.0
git bisect run node scripts/test-duration.mjs
bad=$(git rev-parse refs/bisect/bad)
git bisect reset
git revert --no-edit "$bad"

# Studentská sleva: konflikt v src/prices.js, platí vyšší sleva.
git merge feature/studentska-sleva
cat > src/prices.js <<'JS'
import { isHoliday } from './holidays.js';

const BASE_PRICE_PER_HOUR = 300;
const WEEKEND_SURCHARGE = 100;

export function calculatePrice({ date, hours, member = false, student = false }) {
  const day = new Date(date).getDay();
  const weekendRate = day === 0 || day === 6 || isHoliday(date);
  const hourly = weekendRate ? BASE_PRICE_PER_HOUR + WEEKEND_SURCHARGE : BASE_PRICE_PER_HOUR;
  const discount = student ? 0.3 : member ? 0.2 : 0;
  return hourly * hours * (1 - discount);
}
JS
git add src/prices.js
git commit --no-edit

# Klíč je prozrazený (a zneplatněný u brány). Git ho dál sledovat nebude.
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Přestaň sledovat .env"
```

# --approaches--

## --approach-- Štítek, reset, bisect a merge

Každý problém řeší nástrojem, který se na něj hodí nejlíp: nesdílený commit přesune
štítkem a resetem, chybu najde `bisect run` bez hádání a konflikt vyřeší v merge
commitu, takže v historii je vidět, kdy se slevy spojily.

### --file-- commands.sh

```sh
# Záchrana repozitáře rezervací kurtů.
# Příkazy běží shora dolů ve složce repozitáře kurty, jako bys je psal do terminálu.

# Platby kartou patří do vlastní větve. Commit ještě není na serveru, smí se přepsat.
git branch feature/platby
git reset --hard HEAD~1

# Svátky vrátí soubor z verze, kde ještě byl.
git restore --source=v1.0 src/holidays.js
git add src/holidays.js
git commit -m "Vrať src/holidays.js, ceny ho potřebují"

# Commit s chybou v délce rezervace najde bisect, oprava revertem.
git bisect start HEAD v1.0
git bisect run node scripts/test-duration.mjs
bad=$(git rev-parse refs/bisect/bad)
git bisect reset
git revert --no-edit "$bad"

# Studentská sleva: konflikt v src/prices.js, platí vyšší sleva.
git merge feature/studentska-sleva
cat > src/prices.js <<'JS'
import { isHoliday } from './holidays.js';

const BASE_PRICE_PER_HOUR = 300;
const WEEKEND_SURCHARGE = 100;

export function calculatePrice({ date, hours, member = false, student = false }) {
  const day = new Date(date).getDay();
  const weekendRate = day === 0 || day === 6 || isHoliday(date);
  const hourly = weekendRate ? BASE_PRICE_PER_HOUR + WEEKEND_SURCHARGE : BASE_PRICE_PER_HOUR;
  const discount = student ? 0.3 : member ? 0.2 : 0;
  return hourly * hours * (1 - discount);
}
JS
git add src/prices.js
git commit --no-edit

# Klíč je prozrazený (a zneplatněný u brány). Git ho dál sledovat nebude.
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Přestaň sledovat .env"
```

## --approach-- Reset na server, revert podle zprávy a rebase

Místo `HEAD~1` se `main` vrací přesně na `origin/main`, což je bezpečné i při víc
lokálních commitech. Commit s chybou tu najde `git log --grep` podle zprávy — rychlé,
když zprávu znáš, ale bez bisectu bys ho u neurčité zprávy nenašel. Studentská sleva
se přehraje rebasem, takže historie `main` zůstane rovná; konflikt se pak řeší během
rebase a dokončí přes `git rebase --continue`.

### --file-- commands.sh

```sh
# Záchrana repozitáře rezervací kurtů.
# Příkazy běží shora dolů ve složce repozitáře kurty, jako bys je psal do terminálu.

git switch -c feature/platby
git switch main
git reset --hard origin/main

git checkout v1.0 -- src/holidays.js
git commit -m "Vrať svátky"

git revert --no-edit "$(git log --format=%h --grep='Zjednoduš výpočet délky' -1)"

git switch feature/studentska-sleva
git rebase main
cat > src/prices.js <<'JS'
import { isHoliday } from './holidays.js';

const BASE_PRICE_PER_HOUR = 300;
const WEEKEND_SURCHARGE = 100;

export function calculatePrice({ date, hours, member = false, student = false }) {
  const day = new Date(date).getDay();
  const weekendRate = day === 0 || day === 6 || isHoliday(date);
  const hourly = weekendRate ? BASE_PRICE_PER_HOUR + WEEKEND_SURCHARGE : BASE_PRICE_PER_HOUR;
  const discount = Math.max(member ? 0.2 : 0, student ? 0.3 : 0);
  return hourly * hours * (1 - discount);
}
JS
git add src/prices.js
git rebase --continue
git switch main
git merge feature/studentska-sleva

git rm --cached .env
printf '.env\n' >> .gitignore
git commit -am "Ignoruj .env"
```

# --review--

Testy kontrolují výsledný stav repozitáře. Tohle zkontroluj sám.

## --rubric--

- U každého kroku víš, jestli přepisuje historii, a přepisuješ jen to, co není na serveru.
- Zprávy tvých commitů říkají, co a proč se vrací („Vrať src/holidays.js, ceny ho potřebují").
- Víš, proč samotné odebrání `.env` z Gitu nestačí a klíč se musel zneplatnit.
- Umíš říct, kolik kroků by bisect potřeboval na dvojnásobek commitů.

## --extensions--

Rozšíření bez testů: pushni opravený `main` na `server.git` a ověř, že push prošel bez
`--force`. Vyzkoušej si `git bisect` ručně (`good`/`bad`) místo `run`. Do `.gitignore`
přidej i `.env.*` a zjisti, proč se hodí mít v repozitáři `.env.example`.
