import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadCurriculum, loadModule } from './content.js';
import { ParseError } from './parse.js';

/** Vytvoří dočasný adresář s obsahem podle mapy { 'cesta/soubor': 'obsah' }. */
function makeContent(tree) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-content-test-'));
  for (const [name, content] of Object.entries(tree)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

const LAB_WITHOUT_SEED = '# --description--\nNapiš funkci.\n\n# --hints--\nFunkce existuje.\n```js\nassert.ok(true)\n```\n';

test('loadModule: lab bez seedu a řešení jde načíst (kontrakt kap. 3)', (t) => {
  const dir = makeContent({
    'osnova.json': JSON.stringify({ parts: [{ id: 'p', title: 'P', sections: ['sekce'] }] }),
    'sekce/section.json': JSON.stringify({ title: 'Sekce', modules: ['lab'] }),
    'sekce/lab/module.json': JSON.stringify({ type: 'lab', title: 'Lab', runtime: 'js' }),
    'sekce/lab/lab.md': LAB_WITHOUT_SEED,
  });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const module = loadModule(dir, 'sekce', 'lab');
  assert.equal(module.lab.runtime, 'js');
  assert.deepEqual(module.lab.seed, []);
  assert.deepEqual(module.lab.solution, []);
});

test('loadCurriculum a loadModule odmítnou id sekce, které není slug', (t) => {
  const dir = makeContent({
    'osnova.json': JSON.stringify({ parts: [{ id: 'p', title: 'P', sections: ['../mimo'] }] }),
  });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  assert.throws(() => loadCurriculum(dir), ParseError);
  assert.throws(() => loadModule(dir, '..', 'x'), ParseError);
});
