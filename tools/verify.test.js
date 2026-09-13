// Testy nástroje verify: nad fixture obsahem (tools/fixtures/content) i nad obsahem
// vytvořeným za běhu. Programové volání používá statický server místo server/app.js,
// test příkazové řádky pak skutečný server.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRunner, PROJECT_ROOT } from './lib/build-runner.js';
import { createStaticApp } from './lib/static-app.js';
import { runVerify } from './verify.js';

const FIXTURES = fileURLToPath(new URL('./fixtures/content', import.meta.url));
const createApp = ({ distDir }) => createStaticApp({ distDir });

let workDir;
let distDir;

before(async () => {
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-verify-test-'));
  distDir = path.join(workDir, 'dist');
  await buildRunner(distDir);
});

after(() => {
  fs.rmSync(workDir, { recursive: true, force: true });
});

describe('runVerify nad fixture obsahem', () => {
  test('dobrá sekce projde bez chyb a varování', async () => {
    const report = await runVerify({ contentDir: FIXTURES, prefixes: ['dobra'], createApp, distDir });
    assert.equal(report.ok, true, JSON.stringify(report.entries, null, 2));
    assert.deepEqual(report.summary, { modules: 4, errors: 0, warnings: 0 });
  });

  test('rozbitá sekce selže: seed, který projde, je chyba; krátký kvíz a návaznost varování', async () => {
    const entries = [];
    const report = await runVerify({ contentDir: FIXTURES, prefixes: ['spatna'], createApp, distDir, onEntry: (entry) => entries.push(entry.id) });
    assert.equal(report.ok, false);
    assert.deepEqual(entries, ['spatna/workshop-rozbity', 'spatna/kviz-kratky']);
    const [workshop, quiz] = report.entries;
    assert.deepEqual(workshop.errors, ['krok 002: výchozí kód (seed) projde všemi testy — aspoň jeden test musí selhat']);
    assert.deepEqual(workshop.warnings, ['krok 002: seed se liší od řešení kroku 001 (styles.css)']);
    assert.deepEqual(quiz.warnings, ['kvíz má jen 1 otázku (doporučeno aspoň 5)']);
  });
});

describe('runVerify nad obsahem s chybami v řešení a ukázkách', () => {
  let contentDir;

  before(() => {
    contentDir = path.join(workDir, 'content');
    const write = (file, text) => {
      fs.mkdirSync(path.dirname(path.join(contentDir, file)), { recursive: true });
      fs.writeFileSync(path.join(contentDir, file), text);
    };
    write('osnova.json', JSON.stringify({ parts: [{ id: 'p', title: 'P', sections: ['sekce'] }] }));
    write('sekce/section.json', JSON.stringify({ title: 'Sekce', modules: ['lekce', 'lab', 'rozbity-modul'] }));
    write('sekce/lekce/module.json', JSON.stringify({ type: 'lesson', title: 'Lekce' }));
    write('sekce/lekce/lesson.md', "# Lekce\n\n:::live js\n```js\nconsole.log('ok');\n```\n:::\n\n:::live\n```html\n<p>x</p>\n```\n```js\nneexistuje();\n```\n:::\n");
    write('sekce/lab/module.json', JSON.stringify({ type: 'lab', title: 'Lab', runtime: 'js' }));
    write(
      'sekce/lab/lab.md',
      [
        '# --description--', '', 'Funkce dvojnásobek.', '',
        '# --hints--', '', 'Vrací dvojnásobek.', '', '```js', 'assert.equal(dvakrat(2), 4);', '```', '',
        '# --seed--', '', '## --file-- script.js', '', '```js', 'function dvakrat(x) {}', '```', '',
        '# --solution--', '', '## --file-- script.js', '', '```js', 'function dvakrat(x) { return x * 3; }', 'chyba();', '```', '',
      ].join('\n'),
    );
    write('sekce/rozbity-modul/module.json', '{ "type": "lab", "title": ');
  });

  test('hlásí rozbitou ukázku, neprošlé řešení, chyby řešení i nečitelný modul', async () => {
    const report = await runVerify({ contentDir, createApp, distDir });
    assert.equal(report.ok, false);
    const byId = Object.fromEntries(report.entries.map((entry) => [entry.id, entry]));
    assert.deepEqual(byId['sekce/lekce'].errors, ['živá ukázka 2 hlásí chyby: ReferenceError: neexistuje is not defined (script.js:1)']);
    assert.deepEqual(byId['sekce/lab'].errors, [
      'lab: řešení neprojde testem 1 („Vrací dvojnásobek."): Expected values to be strictly equal: 6 !== 4',
      'lab: řešení hlásí chyby: ReferenceError: chyba is not defined (script.js:2)',
    ]);
    assert.match(byId['sekce/rozbity-modul'].errors[0], /neplatný JSON v module\.json/);
  });
});

/** Spustí `node tools/verify.js …` a vrátí exit kód a výstup. */
function runCli(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(PROJECT_ROOT, 'tools', 'verify.js'), ...args], { cwd: PROJECT_ROOT });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

describe('příkazová řádka (se skutečným server/app.js)', async () => {
  const serverAvailable = await import('../server/app.js').then((m) => typeof m.createApp === 'function', () => false);

  test('dobrý obsah → exit 0, rozbitý → exit 1', { skip: !serverAvailable && 'server/app.js zatím není' }, async () => {
    const good = await runCli(['--content-dir', FIXTURES, path.join(FIXTURES, 'dobra'), '--json']);
    assert.equal(good.code, 0, good.stderr + good.stdout);
    assert.deepEqual(JSON.parse(good.stdout).summary, { modules: 4, errors: 0, warnings: 0 });

    const all = await runCli(['--content-dir', FIXTURES]);
    assert.equal(all.code, 1, all.stderr);
    assert.match(all.stdout, /✘ spatna\/workshop-rozbity/);
    assert.match(all.stdout, /Souhrn: 6 modulů, 1 chyba, 2 varování/);
  });
});
