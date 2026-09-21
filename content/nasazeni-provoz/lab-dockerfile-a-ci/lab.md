---
title: Dockerfile a workflow pro API jídelníčku
see: nasazeni-provoz/kontejnery-a-servery#vicefazovy-build, nasazeni-provoz/ci-cd#workflow-v-github-actions
---

# --description--

Školní jídelna v Olomouci má API, ze kterého si rodiče na webu čtou jídelníček na
týden. Je napsané v TypeScriptu, sestavuje se příkazem `npm run build` do složky
`dist` a data drží v PostgreSQL. Zatím běží na notebooku správce. Tvoje práce je
připravit ho na nasazení: image, spuštění s databází a CI.

Aplikace je hotová a nesahej do ní. Co v projektu je:

- `src/` — zdrojáky. `src/server.ts` se sestaví do `dist/server.js`, poslouchá na
  portu z `PORT` (výchozí 3000), připojí se k databázi podle `DATABASE_URL`, má
  health check `GET /health` a korektně končí po `SIGTERM`.
- `package.json` — skripty `build`, `start`, `lint`, `typecheck` a `test`. Závislosti
  pro běh jsou v `dependencies`, TypeScript, ESLint a Vitest v `devDependencies`.
  V repozitáři je i `package-lock.json`, v editoru ho kvůli délce nevidíš.
- `tsconfig.json` — sestavení ze `src` do `dist`.

Testy Docker ani GitHub nespouští. Čtou tvoje soubory a hlídají, co jde poznat
z jejich obsahu. Pořadí řádků, komentáře a jména fází jsou na tobě.

## Uživatelské příběhy

- Když správce spustí `docker build`, vznikne image ve **dvou nebo více fázích**
  z oficiálního image `node` s pevnou hlavní verzí. Fáze, která aplikaci sestavuje,
  nainstaluje všechny závislosti tak, aby se instalace při změně kódu brala z cache,
  a spustí build.
- Výsledný image obsahuje jen produkční závislosti a sestavenou složku `dist` z fáze
  buildu, běží s `NODE_ENV=production`, ne jako `root`, a spouští `dist/server.js`
  přímo přes `node`, tak aby proces dostal `SIGTERM`.
- Do image se nedostane `node_modules`, `dist`, `.git` ani `.env` z počítače, kde se
  build pouští, a v `Dockerfile` nejsou žádná tajemství.
- Když správce spustí `docker compose up`, v `compose.yaml` se postaví služba `api`
  z `Dockerfile` ve složce projektu a služba `db` z image `postgres` s pevnou verzí.
  API je z počítače dostupné na portu 8080.
- Data databáze přežijí smazání kontejneru, protože jsou v pojmenovaném svazku.
- API se k databázi připojí přes jméno služby a heslo do `compose.yaml` nikdo
  nenapíše: vezme se z proměnné `POSTGRES_PASSWORD`. Totéž heslo dostane i databáze.
- API se spustí až ve chvíli, kdy databáze opravdu přijímá spojení.
- Když kdokoli otevře pull request nebo pushne do `main`, workflow
  `.github/workflows/ci.yml` na čistém stroji s Node stejné hlavní verze jako
  v `Dockerfile` a s cache npm nainstaluje přesné verze závislostí ze zámku a pustí
  kontroly od nejrychlejší: lint, typy, testy, build. Volá jen skripty, které
  v `package.json` opravdu jsou.

# --hints--

`Dockerfile` má aspoň dvě fáze a každá vychází z image `node` s pevnou hlavní verzí (žádné `latest`).

```js
assert.ok(files['Dockerfile'], 'V projektu má být soubor Dockerfile');
const text = files['Dockerfile'].replace(/\\\r?\n/g, ' ');
const froms = text.split('\n').map((line) => line.trim()).filter((line) => /^FROM\s/i.test(line));
assert.ok(froms.length >= 2, `Dockerfile má mít aspoň dvě fáze (dva řádky FROM), má ${froms.length}`);
const images = froms.map((line) => line.replace(/^FROM\s+(--platform=\S+\s+)?/i, '').split(/\s+/)[0]);
const stageNames = froms.map((line) => (line.match(/\sAS\s+(\S+)/i) ?? [])[1]?.toLowerCase()).filter(Boolean);
for (const image of images) {
  if (stageNames.includes(image.toLowerCase())) continue;
  assert.match(image, /^node:\d+/, `FROM ${image}: fáze má vycházet z oficiálního image node s číslem hlavní verze, třeba node:24-slim`);
}
```

Fáze s buildem zkopíruje `package.json` a zámek, pak spustí `npm ci`, teprve potom zkopíruje zbytek projektu a spustí `npm run build`.

```js
const text = (files['Dockerfile'] ?? '').replace(/\\\r?\n/g, ' ');
const stages = [];
for (const line of text.split('\n').map((row) => row.trim()).filter((row) => row && !row.startsWith('#'))) {
  const [, cmd, args = ''] = line.match(/^(\S+)\s*(.*)$/);
  if (cmd.toUpperCase() === 'FROM') stages.push([]);
  else if (stages.length) stages.at(-1).push({ cmd: cmd.toUpperCase(), args });
}
const build = stages.find((steps) => steps.some((step) => step.cmd === 'RUN' && /npm run build/.test(step.args)));
assert.ok(build, 'Některá fáze Dockerfile má spustit RUN npm run build');
const copyPackage = build.findIndex((step) => step.cmd === 'COPY' && /package(\*|-lock)?\.json|package\*/.test(step.args) && /lock|\*/.test(step.args));
const install = build.findIndex((step) => step.cmd === 'RUN' && /\bnpm ci\b/.test(step.args));
const copyRest = build.findIndex((step) => step.cmd === 'COPY' && !/--from/.test(step.args) && /(^|\s)(\.\/?|src\/?)(\s|$)/.test(step.args.replace(/\s+\S+$/, ' ')));
const runBuild = build.findIndex((step) => step.cmd === 'RUN' && /npm run build/.test(step.args));
assert.notEqual(copyPackage, -1, 'Fáze s buildem má nejdřív zkopírovat package.json i package-lock.json (třeba COPY package.json package-lock.json ./)');
assert.notEqual(install, -1, 'Fáze s buildem má instalovat závislosti přes npm ci (přesně podle zámku)');
assert.notEqual(copyRest, -1, 'Fáze s buildem má zkopírovat zdrojáky (COPY . . nebo COPY src ./src)');
assert.ok(copyPackage < install, 'COPY package.json a zámku má být před RUN npm ci');
assert.ok(install < copyRest, 'RUN npm ci má být před kopírováním zdrojáků — jinak se závislosti instalují při každé změně kódu');
assert.ok(copyRest < runBuild, 'RUN npm run build má být až po zkopírování zdrojáků');
```

Výsledná (poslední) fáze nainstaluje jen produkční závislosti a nebere `node_modules` z fáze s buildem.

```js
const text = (files['Dockerfile'] ?? '').replace(/\\\r?\n/g, ' ');
const stages = [];
for (const line of text.split('\n').map((row) => row.trim()).filter((row) => row && !row.startsWith('#'))) {
  const [, cmd, args = ''] = line.match(/^(\S+)\s*(.*)$/);
  if (cmd.toUpperCase() === 'FROM') stages.push({ name: (args.match(/\sAS\s+(\S+)/i) ?? [])[1]?.toLowerCase() ?? null, steps: [] });
  else if (stages.length) stages.at(-1).steps.push({ cmd: cmd.toUpperCase(), args });
}
assert.ok(stages.length >= 2, 'Dockerfile má mít aspoň dvě fáze');
const prodInstall = (steps) => steps.some((step) => step.cmd === 'RUN' && /npm (ci|install|prune)\b[^&;]*(--omit[= ]dev|--only[= ]prod|--production)/.test(step.args));
const final = stages.at(-1);
const stageOf = (ref) => stages.find((stage, index) => stage.name === ref.toLowerCase() || String(index) === ref);
const copiedModules = final.steps
  .filter((step) => step.cmd === 'COPY' && /--from=/.test(step.args) && /node_modules/.test(step.args))
  .map((step) => stageOf(step.args.match(/--from=(\S+)/)[1]));
const buildStage = stages.find((stage) => stage.steps.some((step) => step.cmd === 'RUN' && /npm run build/.test(step.args)));
assert.ok(!copiedModules.includes(buildStage), 'Výsledná fáze nemá kopírovat node_modules z fáze s buildem — jsou v nich i vývojové závislosti');
const fullInstall = final.steps.some((step) => step.cmd === 'RUN' && /\bnpm (ci|install)\b/.test(step.args) && !/--omit[= ]dev|--only[= ]prod|--production/.test(step.args) && !/npm prune/.test(step.args));
assert.ok(!fullInstall, 'Výsledná fáze nemá instalovat všechny závislosti (npm ci bez --omit=dev)');
const ok = prodInstall(final.steps) || copiedModules.some((stage) => stage && prodInstall(stage.steps));
assert.ok(ok, 'Výsledná fáze má mít jen produkční závislosti: RUN npm ci --omit=dev (nebo je zkopírovat z fáze, která to udělala)');
```

Výsledná fáze zkopíruje složku `dist` z fáze s buildem a nastaví `NODE_ENV=production`.

```js
const text = (files['Dockerfile'] ?? '').replace(/\\\r?\n/g, ' ');
const stages = [];
for (const line of text.split('\n').map((row) => row.trim()).filter((row) => row && !row.startsWith('#'))) {
  const [, cmd, args = ''] = line.match(/^(\S+)\s*(.*)$/);
  if (cmd.toUpperCase() === 'FROM') stages.push({ name: (args.match(/\sAS\s+(\S+)/i) ?? [])[1]?.toLowerCase() ?? null, steps: [] });
  else if (stages.length) stages.at(-1).steps.push({ cmd: cmd.toUpperCase(), args });
}
assert.ok(stages.length >= 2, 'Dockerfile má mít aspoň dvě fáze');
const final = stages.at(-1);
const buildIndex = stages.findIndex((stage) => stage.steps.some((step) => step.cmd === 'RUN' && /npm run build/.test(step.args)));
const fromBuild = final.steps.some((step) => {
  const ref = step.cmd === 'COPY' && step.args.match(/--from=(\S+)/)?.[1]?.toLowerCase();
  return ref && (ref === stages[buildIndex]?.name || ref === String(buildIndex)) && /dist/.test(step.args);
});
assert.ok(fromBuild, 'Výsledná fáze má zkopírovat dist z fáze s buildem: COPY --from=<jméno fáze> … dist …');
assert.ok(final.steps.some((step) => step.cmd === 'ENV' && /NODE_ENV[= ]["']?production/.test(step.args)), 'Výsledná fáze má nastavit ENV NODE_ENV=production');
```

Výsledná fáze přepne na uživatele, který není `root`.

```js
const text = (files['Dockerfile'] ?? '').replace(/\\\r?\n/g, ' ');
const rows = text.split('\n').map((row) => row.trim()).filter((row) => row && !row.startsWith('#'));
const lastFrom = rows.findLastIndex((row) => /^FROM\s/i.test(row));
const users = rows.slice(lastFrom + 1).filter((row) => /^USER\s/i.test(row)).map((row) => row.replace(/^USER\s+/i, '').trim());
assert.ok(users.length > 0, 'Výsledná fáze má obsahovat řádek USER, jinak proces běží jako root');
assert.ok(!/^(root|0)(:|$)/.test(users.at(-1)), `Poslední USER ve výsledné fázi je "${users.at(-1)}" — má to být uživatel bez práv roota, třeba node`);
```

Kontejner spustí `dist/server.js` přímo přes `node` a v zápisu pole, aby proces dostal `SIGTERM`.

```js
const text = (files['Dockerfile'] ?? '').replace(/\\\r?\n/g, ' ');
const rows = text.split('\n').map((row) => row.trim()).filter((row) => row && !row.startsWith('#'));
const lastOf = (name) => rows.findLast((row) => new RegExp(`^${name}\\s`, 'i').test(row))?.replace(/^\S+\s+/, '');
const parse = (value, name) => {
  if (value === undefined) return [];
  try {
    const parsed = JSON.parse(value);
    assert.ok(Array.isArray(parsed), `${name} má být v zápisu pole, třeba ${name} ["node", "…"]`);
    return parsed;
  } catch {
    assert.fail(`${name} ${value} není v zápisu pole (JSON s dvojitými uvozovkami). Bez něj spustí shell, který SIGTERM Node nepředá`);
  }
};
const command = [...parse(lastOf('ENTRYPOINT'), 'ENTRYPOINT'), ...parse(lastOf('CMD'), 'CMD')];
assert.ok(command.length > 0, 'Dockerfile má končit příkazem CMD, který aplikaci spustí');
assert.match(String(command[0]), /(^|\/)node$/, `Kontejner má spouštět přímo node, ne ${command[0]} — npm signál SIGTERM nepředá`);
assert.ok(command.slice(1).some((part) => /^(\.\/|\/app\/)?dist\/server\.js$/.test(part)), `Příkaz ${JSON.stringify(command)} má spouštět dist/server.js`);
```

V `Dockerfile` nejsou tajemství ani `.env`.

```js
const text = helpers.stripComments ? files['Dockerfile'] ?? '' : '';
const rows = text.split('\n').map((row) => row.trim()).filter((row) => row && !row.startsWith('#'));
assert.ok(rows.length > 0, 'V projektu má být Dockerfile');
assert.ok(!rows.some((row) => /^(COPY|ADD)\s.*\.env\b/i.test(row)), 'Dockerfile nemá kopírovat .env — tajemství by zůstalo v image');
assert.ok(!rows.some((row) => /^(ENV|ARG)\s.*(PASSWORD|DATABASE_URL|SECRET|TOKEN)/i.test(row)), 'Dockerfile nemá obsahovat hesla ani DATABASE_URL v ENV/ARG — patří do proměnných prostředí při spuštění');
```

`.dockerignore` vynechá `node_modules`, `dist`, `.git` a `.env`.

```js
assert.ok(files['.dockerignore'] !== undefined, 'V projektu má být soubor .dockerignore');
const patterns = files['.dockerignore'].split('\n').map((row) => row.trim()).filter((row) => row && !row.startsWith('#'))
  .map((row) => row.replace(/^(\*\*\/|\/)/, '').replace(/\/$/, ''));
for (const name of ['node_modules', 'dist', '.git', '.env']) {
  const covered = patterns.some((pattern) => pattern === name || (name === '.env' && /^\.env(\*|\.\*)$/.test(pattern)));
  assert.ok(covered, `.dockerignore má obsahovat ${name}`);
}
```

Služba `api` v `compose.yaml` se staví z `Dockerfile` v projektu a z počítače je dostupná na portu 8080.

```js
assert.ok(files['compose.yaml'], 'V projektu má být soubor compose.yaml');
const block = (text, path) => {
  let rows = text.split('\n').filter((row) => row.trim() !== '' && !row.trim().startsWith('#'));
  for (const key of path) {
    const top = Math.min(...rows.map((row) => row.search(/\S/)));
    const index = rows.findIndex((row) => row.search(/\S/) === top && row.trim().startsWith(`${key}:`));
    if (index === -1) return null;
    const next = rows.findIndex((row, i) => i > index && row.search(/\S/) <= top);
    const inline = rows[index].trim().slice(key.length + 1).trim();
    rows = [...(inline ? [' '.repeat(top + 2) + inline] : []), ...rows.slice(index + 1, next === -1 ? rows.length : next)];
  }
  return rows.join('\n');
};
const api = block(files['compose.yaml'], ['services', 'api']);
assert.ok(api, 'compose.yaml má mít pod services službu api');
assert.match(api, /^\s*(build:\s*\.\/?\s*$|context:\s*\.\/?\s*$)/m, 'Služba api se má stavět z Dockerfile ve složce projektu: build: .');
const ports = block(api, ['ports']) ?? '';
assert.match(ports, /["']?(\d+\.\d+\.\d+\.\d+:)?8080:3000["']?/, 'Služba api má mít ports s mapováním "8080:3000" (port počítače 8080, port aplikace 3000)');
```

Služba `db` běží z image `postgres` s pevnou verzí a data drží v pojmenovaném svazku.

```js
const block = (text, path) => {
  let rows = text.split('\n').filter((row) => row.trim() !== '' && !row.trim().startsWith('#'));
  for (const key of path) {
    const top = Math.min(...rows.map((row) => row.search(/\S/)));
    const index = rows.findIndex((row) => row.search(/\S/) === top && row.trim().startsWith(`${key}:`));
    if (index === -1) return null;
    const next = rows.findIndex((row, i) => i > index && row.search(/\S/) <= top);
    const inline = rows[index].trim().slice(key.length + 1).trim();
    rows = [...(inline ? [' '.repeat(top + 2) + inline] : []), ...rows.slice(index + 1, next === -1 ? rows.length : next)];
  }
  return rows.join('\n');
};
const compose = files['compose.yaml'] ?? '';
const db = block(compose, ['services', 'db']);
assert.ok(db, 'compose.yaml má mít pod services službu db');
assert.match(db, /^\s*image:\s*["']?postgres:\d+/m, 'Služba db má používat image postgres s číslem verze, třeba postgres:17');
const mount = (block(db, ['volumes']) ?? '').match(/-\s*["']?([A-Za-z0-9_-]+):\/var\/lib\/postgresql(\/data)?["']?\s*$/m);
assert.ok(mount, 'Služba db má mít ve volumes pojmenovaný svazek připojený na /var/lib/postgresql/data, třeba - db-data:/var/lib/postgresql/data');
const declared = block(compose, ['volumes']) ?? '';
assert.match(declared, new RegExp(`^\\s*${mount[1]}:`, 'm'), `Svazek ${mount[1]} má být deklarovaný v sekci volumes na nejvyšší úrovni compose.yaml`);
```

API se připojí k databázi přes jméno služby `db` a heslo bere z proměnné `POSTGRES_PASSWORD`, stejně jako databáze.

```js
const block = (text, path) => {
  let rows = text.split('\n').filter((row) => row.trim() !== '' && !row.trim().startsWith('#'));
  for (const key of path) {
    const top = Math.min(...rows.map((row) => row.search(/\S/)));
    const index = rows.findIndex((row) => row.search(/\S/) === top && row.trim().startsWith(`${key}:`));
    if (index === -1) return null;
    const next = rows.findIndex((row, i) => i > index && row.search(/\S/) <= top);
    const inline = rows[index].trim().slice(key.length + 1).trim();
    rows = [...(inline ? [' '.repeat(top + 2) + inline] : []), ...rows.slice(index + 1, next === -1 ? rows.length : next)];
  }
  return rows.join('\n');
};
const compose = files['compose.yaml'] ?? '';
const api = block(compose, ['services', 'api']) ?? '';
const db = block(compose, ['services', 'db']) ?? '';
const url = api.match(/DATABASE_URL\s*[:=]\s*["']?(\S+?)["']?\s*$/m)?.[1];
assert.ok(url, 'Služba api má mít v environment proměnnou DATABASE_URL');
assert.match(url, /^postgres(ql)?:\/\/[^@]+@db(:5432)?\//, `DATABASE_URL ${url} má mířit na službu db (…@db:5432/…), ne na localhost`);
assert.match(url, /\$\{POSTGRES_PASSWORD(:?[-?][^}]*)?\}/, `Heslo v DATABASE_URL ${url} má být \${POSTGRES_PASSWORD}, ne napsané natvrdo`);
const password = db.match(/POSTGRES_PASSWORD\s*[:=]\s*["']?(\$\{[^}]*\}|\S+)/m)?.[1];
assert.match(String(password), /^\$\{POSTGRES_PASSWORD(:?[-?][^}]*)?\}$/, 'Služba db má dostat POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}, ne heslo napsané v souboru');
```

Databáze má health check a API čeká, až projde.

```js
const block = (text, path) => {
  let rows = text.split('\n').filter((row) => row.trim() !== '' && !row.trim().startsWith('#'));
  for (const key of path) {
    const top = Math.min(...rows.map((row) => row.search(/\S/)));
    const index = rows.findIndex((row) => row.search(/\S/) === top && row.trim().startsWith(`${key}:`));
    if (index === -1) return null;
    const next = rows.findIndex((row, i) => i > index && row.search(/\S/) <= top);
    const inline = rows[index].trim().slice(key.length + 1).trim();
    rows = [...(inline ? [' '.repeat(top + 2) + inline] : []), ...rows.slice(index + 1, next === -1 ? rows.length : next)];
  }
  return rows.join('\n');
};
const compose = files['compose.yaml'] ?? '';
const healthcheck = block(compose, ['services', 'db', 'healthcheck']);
assert.ok(healthcheck, 'Služba db má mít healthcheck');
assert.match(healthcheck, /pg_isready/, 'Health check databáze má ověřit připravenost přes pg_isready');
const dependsOn = block(compose, ['services', 'api', 'depends_on']);
assert.ok(dependsOn, 'Služba api má mít depends_on na db');
assert.match(block(dependsOn, ['db']) ?? '', /condition:\s*service_healthy/, 'depends_on u api má čekat na db s condition: service_healthy');
```

Workflow se spouští u pull requestů a u pushe do `main` a připraví Node se stejnou hlavní verzí jako `Dockerfile` a s cache npm.

```js
const workflow = files['.github/workflows/ci.yml'];
assert.ok(workflow, 'V projektu má být workflow .github/workflows/ci.yml');
const text = workflow.split('\n').filter((row) => !row.trim().startsWith('#')).join('\n');
assert.match(text, /^\s*-?\s*pull_request\s*:?/m, 'Workflow se má spouštět u pull_request');
assert.match(text, /^\s*-?\s*push\s*:?/m, 'Workflow se má spouštět u push');
assert.match(text, /branches:\s*(\[\s*["']?main["']?\s*\]|\n\s*-\s*["']?main["']?)/, 'push má být omezený na větev main (branches: [main])');
assert.match(text, /uses:\s*actions\/checkout@v\d+/, 'Workflow má stáhnout repozitář přes actions/checkout');
assert.match(text, /uses:\s*actions\/setup-node@v\d+/, 'Workflow má připravit Node přes actions/setup-node');
assert.match(text, /cache:\s*["']?npm["']?/, 'setup-node má mít cache: npm');
const nodeVersion = text.match(/node-version:\s*["']?(\d+)/)?.[1];
const dockerMajor = (files['Dockerfile'] ?? '').match(/FROM\s+(?:--platform=\S+\s+)?node:(\d+)/i)?.[1];
assert.ok(nodeVersion, 'setup-node má mít node-version s hlavní verzí, třeba node-version: 24');
assert.equal(nodeVersion, dockerMajor, `node-version ve workflow (${nodeVersion}) má být stejná hlavní verze jako node:${dockerMajor} v Dockerfile`);
```

Workflow nainstaluje závislosti přes `npm ci` a pak pustí lint, typy, testy a build v tomhle pořadí.

```js
const text = (files['.github/workflows/ci.yml'] ?? '').split('\n').filter((row) => !row.trim().startsWith('#')).join('\n');
assert.doesNotMatch(text, /npm install\b|npm i\s*$/m, 'Workflow nemá používat npm install — v CI patří npm ci');
const position = (pattern, label) => {
  const index = text.search(pattern);
  assert.notEqual(index, -1, `Workflow má spustit ${label}`);
  return index;
};
const order = [
  position(/run:\s*npm ci\b/, 'npm ci'),
  position(/npm run lint\b/, 'npm run lint'),
  position(/npm run typecheck\b/, 'npm run typecheck'),
  position(/npm (run )?test\b/, 'npm test'),
  position(/npm run build\b/, 'npm run build'),
];
assert.deepEqual([...order].sort((a, b) => a - b), order, 'Kroky workflow mají jít v pořadí npm ci → lint → typecheck → test → build');
```

Workflow volá jen skripty, které v `package.json` existují.

```js
const text = (files['.github/workflows/ci.yml'] ?? '').split('\n').filter((row) => !row.trim().startsWith('#')).join('\n');
const scripts = Object.keys(JSON.parse(files['package.json']).scripts ?? {});
const called = [...text.matchAll(/npm run ([\w:-]+)/g)].map((match) => match[1]);
assert.ok(called.length > 0, 'Workflow má volat skripty z package.json přes npm run');
for (const name of called) {
  assert.ok(scripts.includes(name), `Workflow volá npm run ${name}, ale package.json takový skript nemá (má: ${scripts.join(', ')})`);
}
```

# --help--

## --tip--

Rozmysli si pořadí instrukcí v Dockerfile podle toho, co se mění nejčastěji — a co
z fáze buildu má a nemá přejít do výsledného image. Obojí je v části
[Vícefázový build](see:nasazeni-provoz/kontejnery-a-servery#vicefazovy-build).

## --tip--

U `compose.yaml` si nejdřív ujasni, co vidí kontejner a co tvůj počítač: jméno služby
místo `localhost`, port počítače vlevo, hodnoty `${…}` ze souboru `.env` vedle
`compose.yaml` — viz [`compose.yaml`: aplikace a databáze](see:nasazeni-provoz/kontejnery-a-servery#compose-yaml-aplikace-a-databaze).

# --seed--

## --file-- Dockerfile

```dockerfile
# Vícefázový build API jídelníčku.
```

## --file-- .dockerignore

```text
```

## --file-- compose.yaml

```yaml
# API jídelníčku a PostgreSQL.
```

## --file-- .github/workflows/ci.yml

```yaml
# Kontroly u pull requestů a pushů do main.
```

## --file-- package.json

```json
{
  "name": "jidelnicek-api",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "pg": "^8.16.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.35.0",
    "@types/node": "^24.3.0",
    "@types/pg": "^8.15.5",
    "eslint": "^9.35.0",
    "typescript": "^5.9.2",
    "typescript-eslint": "^8.43.0",
    "vitest": "^3.2.4"
  }
}
```

## --file-- tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "strict": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"]
}
```

## --file-- src/server.ts

```ts
import { createServer } from 'node:http';
import pg from 'pg';
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('Chybí proměnná prostředí DATABASE_URL.');
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const server = createServer(createApp(pool));

server.listen(port, () => {
  console.log(JSON.stringify({ level: 'info', msg: 'Jídelníček poslouchá', port }));
});

process.on('SIGTERM', () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});
```

## --file-- src/app.ts

```ts
import type { IncomingMessage, ServerResponse } from 'node:http';
import type pg from 'pg';
import { groupByDay } from './menu.js';

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

export function createApp(pool: pg.Pool) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const { pathname, searchParams } = new URL(req.url ?? '/', 'http://localhost');
    try {
      if (pathname === '/health') {
        await pool.query('SELECT 1');
        return sendJson(res, 200, { status: 'ok' });
      }
      if (pathname === '/api/menu') {
        const week = searchParams.get('week') ?? '2026-W38';
        const { rows } = await pool.query('SELECT day, course, name, allergens FROM meals WHERE week = $1', [week]);
        return sendJson(res, 200, groupByDay(rows));
      }
      sendJson(res, 404, { error: 'Tahle adresa neexistuje.' });
    } catch {
      sendJson(res, pathname === '/health' ? 503 : 500, { error: 'Jídelníček je teď nedostupný.' });
    }
  };
}
```

## --file-- src/menu.ts

```ts
export type Meal = { day: string; course: 'polévka' | 'hlavní jídlo'; name: string; allergens: number[] };

const DAYS = ['pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek'];

export function groupByDay(meals: Meal[]) {
  return DAYS.map((day) => ({ day, meals: meals.filter((meal) => meal.day === day) }));
}
```

## --file-- src/menu.test.ts

```ts
import { expect, test } from 'vitest';
import { groupByDay } from './menu.js';

test('jídla se seřadí do dnů od pondělí', () => {
  const week = groupByDay([
    { day: 'středa', course: 'polévka', name: 'Kulajda', allergens: [1, 7] },
    { day: 'pondělí', course: 'hlavní jídlo', name: 'Rizoto s kuřecím masem', allergens: [9] },
  ]);
  expect(week.map((item) => item.day)).toEqual(['pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek']);
  expect(week[0].meals[0].name).toBe('Rizoto s kuřecím masem');
});
```

## --file-- eslint.config.js

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, { ignores: ['dist'] });
```

# --solution--

## --file-- Dockerfile

```dockerfile
# Vícefázový build API jídelníčku.

# fáze 1: sestavení se všemi závislostmi
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# fáze 2: jen to, co poběží
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## --file-- .dockerignore

```text
node_modules
dist
.git
.env
*.log
```

## --file-- compose.yaml

```yaml
# API jídelníčku a PostgreSQL.
services:
  api:
    build: .
    ports:
      - "8080:3000"
    environment:
      DATABASE_URL: postgres://jidelna:${POSTGRES_PASSWORD}@db:5432/jidelna
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:17
    environment:
      POSTGRES_USER: jidelna
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: jidelna
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jidelna"]
      interval: 5s
      retries: 10

volumes:
  db-data:
```

## --file-- .github/workflows/ci.yml

```yaml
# Kontroly u pull requestů a pushů do main.
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

# --approaches--

## --approach-- Tři fáze: produkční závislosti zvlášť

Samostatná fáze `deps` nainstaluje jen produkční závislosti a výsledná fáze si je
zkopíruje. Výsledná fáze pak neobsahuje ani npm cache z instalace. Workflow
pojmenovává kroky, takže se v přehledu na GitHubu dobře čte.

### --file-- Dockerfile

```dockerfile
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
CMD ["node", "dist/server.js"]
```

### --file-- compose.yaml

```yaml
services:
  db:
    image: postgres:17-alpine
    environment:
      - POSTGRES_USER=jidelna
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:?Nastav POSTGRES_PASSWORD v .env}
      - POSTGRES_DB=jidelna
    volumes:
      - jidelna-postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jidelna -d jidelna"]
      interval: 3s
      timeout: 3s
      retries: 20

  api:
    build:
      context: .
    ports:
      - "127.0.0.1:8080:3000"
    environment:
      - DATABASE_URL=postgres://jidelna:${POSTGRES_PASSWORD}@db:5432/jidelna
    depends_on:
      db:
        condition: service_healthy

volumes:
  jidelna-postgres:
```

### --file-- .github/workflows/ci.yml

```yaml
name: Kontroly

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Stáhnout kód
        uses: actions/checkout@v4
      - name: Node s cache
        uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: "npm"
      - name: Závislosti
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Typy
        run: npm run typecheck
      - name: Testy
        run: npm run test
      - name: Build
        run: npm run build
```

### --file-- .dockerignore

```text
node_modules
dist
.git
.env
*.log
```

## --approach-- Prořezání závislostí po buildu

Jedna instalace všech závislostí, build a pak `npm prune --omit=dev` ve vlastní fázi.
Výsledná fáze si z ní zkopíruje hotové `node_modules` i `dist`. Méně instalací, ale
prořezané `node_modules` pocházejí ze stejné instalace jako build.

### --file-- Dockerfile

```dockerfile
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM build AS runtime-deps
RUN npm prune --omit=dev

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=runtime-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
CMD ["node", "dist/server.js"]
```

### --file-- .dockerignore

```text
node_modules
dist
.git
.env
*.log
```

### --file-- compose.yaml

```yaml
# API jídelníčku a PostgreSQL.
services:
  api:
    build: .
    ports:
      - "8080:3000"
    environment:
      DATABASE_URL: postgres://jidelna:${POSTGRES_PASSWORD}@db:5432/jidelna
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:17
    environment:
      POSTGRES_USER: jidelna
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: jidelna
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jidelna"]
      interval: 5s
      retries: 10

volumes:
  db-data:
```

### --file-- .github/workflows/ci.yml

```yaml
# Kontroly u pull requestů a pushů do main.
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

# --review--

Testy hlídají obsah souborů. Tohle zkontroluj sám, ideálně s Dockerem na svém počítači.

## --rubric--

- `docker compose up --build` s `POSTGRES_PASSWORD` v `.env` postaví image a `curl localhost:8080/health` vrátí `{"status":"ok"}`.
- Po změně jednoho řádku v `src/menu.ts` a novém buildu se krok `npm ci` vezme z cache.
- `docker compose stop api` netrvá 10 sekund, aplikace skončí hned po `SIGTERM`.
- `docker image ls` ukazuje výsledný image menší než fáze s buildem.
- `.env` s heslem není v Gitu a v repozitáři je `.env.example`.

## --extensions--

Rozšíření bez testů: přidej do workflow druhou úlohu, která po pushi do `main`
postaví image a označí ho otiskem commitu. Přidej Caddy jako třetí službu s HTTPS
pro doménu a aplikaci nech bez publikovaného portu.
