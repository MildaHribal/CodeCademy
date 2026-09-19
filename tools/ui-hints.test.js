// Nápovědy, porovnání s řešením a statistiky v prohlížeči (kontrakt kap. 3.3 a 12.2):
// sestavená aplikace + skutečný server nad obsahem z tools/fixtures/hints-content.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { createApp } from '../server/app.js';
import { buildClient } from './lib/build-runner.js';
import { closeServer, listenInRange } from './lib/listen.js';
import { BROWSER_ARGS } from './lib/runner-pool.js';

const CONTENT_DIR = path.join(import.meta.dirname, 'fixtures', 'hints-content');
const PORTS = { from: 4400, to: 4419 }; // rozsah balíku nápověd (docs/platforma.md, kap. 7.1)
const STEP_1 = 'napovedy/workshop/001';

describe('nápovědy, porovnání s řešením a statistiky v UI', () => {
  let workDir;
  let server;
  let browser;
  let page;
  let baseUrl;

  before(async () => {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-ui-hints-'));
    const distDir = path.join(workDir, 'dist');
    await buildClient(distDir);
    server = createApp({
      contentDir: CONTENT_DIR,
      dataDir: path.join(workDir, 'data'),
      projectsDir: path.join(workDir, 'moje-projekty'),
      distDir,
    });
    baseUrl = `http://127.0.0.1:${await listenInRange(server, PORTS)}`;
    browser = await chromium.launch({ args: BROWSER_ARGS });
    page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  });

  after(async () => {
    await browser?.close();
    if (server) {
      await server.akademie.ctx.createJsonStore('pokusy.json').flush();
      await server.akademie.ctx.progress.flush();
      await closeServer(server);
    }
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  async function typeCode(content) {
    await page.locator('.pane--editor .cm-content').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.insertText(content);
  }

  /** Spustí kontrolu a počká na její výsledek. */
  async function check(kind) {
    const result = page.locator('.pane--brief .result');
    await page.locator('.pane--brief button', { hasText: /Check|Zkontrolovat/ }).click();
    await result.and(page.locator(`[data-kind="${kind}"]`)).waitFor({ timeout: 15000 });
  }

  /** Počká, až záznam pokusu na serveru splní podmínku (odesílá se na pozadí). */
  async function attemptWhere(id, predicate) {
    const deadline = Date.now() + 5000;
    let last;
    while (Date.now() < deadline) {
      const res = await fetch(`${baseUrl}/api/attempts?prefix=${encodeURIComponent(id)}`);
      last = (await res.json()).items[id];
      if (last && predicate(last)) return last;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.fail(`Záznam pokusu ${id} nesplnil podmínku: ${JSON.stringify(last)}`);
  }

  test('2 neúspěchy zvýrazní nápovědu, tipy po jednom, poslední stupeň je diff s potvrzením → assisted', async () => {
    await page.goto(`${baseUrl}/#/modul/${STEP_1}`);
    const helpButton = page.locator('.hint-tips__button');
    await helpButton.waitFor();
    assert.equal(await helpButton.textContent(), 'Potřebuju nápovědu (1 ze 3)');

    await typeCode('function sum(a, b) {\n  return a - b;\n}');
    await check('fail');
    assert.equal(await helpButton.evaluate((el) => el.classList.contains('hint-tips__button--highlight')), false, 'po 1 neúspěchu ještě ne');

    await typeCode('function sum(a, b) {\n  return a - b; // pořád špatně\n}');
    await check('fail');
    await page.locator('.hint-tips__button.hint-tips__button--highlight').waitFor();
    // Zvýrazní se první selhaný požadavek (index 1 = „sum(2, 3) vrátí 5").
    const requirements = page.locator('.pane--brief .hints > .hint');
    assert.equal(await requirements.nth(1).evaluate((el) => el.classList.contains('hint--focus')), true);
    assert.equal(await requirements.nth(0).evaluate((el) => el.classList.contains('hint--focus')), false);

    // Tipy se otevírají po jednom v pořadí.
    await helpButton.click();
    await page.locator('.hint-tips__tip').first().waitFor();
    assert.match(await page.locator('.hint-tips__tip').first().textContent(), /Tip 1 z 3.*Jde o funkci/s);
    assert.equal(await helpButton.textContent(), 'Potřebuju nápovědu (2 ze 3)');
    await helpButton.click();
    const secondTip = page.locator('.hint-tips__tip').nth(1);
    assert.match(await secondTip.textContent(), /Tip 2 z 3 · k požadavku 2/);
    // Otevřený tip k selhanému požadavku je zvýrazněný.
    assert.equal(await secondTip.evaluate((el) => el.classList.contains('hint-tips__tip--focus')), true);
    await helpButton.click();
    assert.equal(await page.locator('.hint-tips__tip').count(), 3);
    assert.equal(await helpButton.textContent(), 'Porovnat s řešením');
    await page.locator('.hint-tips__compare').waitFor();
    await attemptWhere(STEP_1, (a) => a.tipsOpened === 3);

    // Poslední stupeň: porovnání s řešením až po potvrzení.
    await helpButton.click();
    const dialog = page.locator('dialog.solution-diff');
    await dialog.getByText('Chceš vidět autorovo řešení?').waitFor();
    assert.equal(await dialog.locator('.solution-diff__line').count(), 0, 'řešení se před potvrzením neukáže');
    await dialog.getByRole('button', { name: /Show solution|Ukázat řešení/ }).click();
    await dialog.locator('.solution-diff__line--add', { hasText: 'return a + b;' }).waitFor();
    assert.equal(await dialog.locator('.solution-diff__line--del', { hasText: 'return a - b; // pořád špatně' }).count(), 1);
    await dialog.getByRole('button', { name: /Close|Zavřít/ }).click();
    await dialog.waitFor({ state: 'detached' });

    const attempt = await attemptWhere(STEP_1, (a) => a.solutionViewed);
    assert.equal(attempt.assisted, true);
    assert.equal(attempt.checks, 2);
    assert.equal(attempt.failsSinceOk, 2);
    assert.deepEqual(attempt.failedHints, { 1: 2 });
    assert.equal(attempt.tipsOpened, 3);
  });

  test('po načtení znovu: zvýraznění i otevřené tipy zůstanou; po splnění „Jak to napsal autor" bez potvrzení', async () => {
    await page.goto(`${baseUrl}/#/`);
    await page.goto(`${baseUrl}/#/modul/${STEP_1}`);
    await page.reload();
    await page.locator('.hint-tips__button.hint-tips__button--highlight').waitFor();
    await page.locator('.hint-tips__tip').nth(2).waitFor();

    const authorButton = page.locator('.solution-diff-button');
    assert.equal(await authorButton.isHidden(), true, 'před splněním není');
    await typeCode('function sum(a, b) { return b + a; }');
    await check('pass');
    assert.equal(await page.locator('.hint-tips__button--highlight').count(), 0, 'po úspěchu zvýraznění zmizí');
    await authorButton.waitFor({ state: 'visible' });
    await authorButton.click();
    const dialog = page.locator('dialog.solution-diff');
    await dialog.getByRole('heading', { name: /Author's solution|Jak to napsal autor/ }).waitFor();
    await dialog.locator('.solution-diff__line--add', { hasText: 'return a + b;' }).waitFor();
    // Přepínač bílých znaků přepočítá diff.
    await dialog.getByLabel('Ignorovat bílé znaky').check();
    await dialog.locator('.solution-diff__line--del', { hasText: 'return b + a;' }).waitFor();
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });

    const attempt = await attemptWhere(STEP_1, (a) => a.firstOkAt !== null);
    assert.equal(attempt.failsSinceOk, 0);
    assert.equal(attempt.assisted, true, 'řešení viděl před splněním');
  });

  test('další krok: proužek „Pokračuješ autorovým řešením", krok bez tipů nabídne výklad a porovnání', async () => {
    await page.goto(`${baseUrl}/#/modul/napovedy/workshop/002`);
    const banner = page.locator('.solution-diff-banner');
    await banner.getByText('Pokračuješ autorovým řešením kroku 1.').waitFor();
    await banner.getByRole('button', { name: /Difference from yours|Rozdíl oproti tvému/ }).click();
    const dialog = page.locator('dialog.solution-diff');
    await dialog.locator('.solution-diff__line--del', { hasText: 'return b + a;' }).waitFor();
    await dialog.getByRole('button', { name: /Close|Zavřít/ }).click();

    const helpButton = page.locator('.hint-tips__button');
    assert.equal(await helpButton.textContent(), 'Potřebuju nápovědu');
    await helpButton.click();
    const panel = page.locator('.hint-tips');
    await panel.getByText('K tomuhle kroku tipy nejsou.').waitFor();
    const seeLink = panel.locator('.hint-tips__see a');
    assert.equal(await seeLink.getAttribute('href'), '#/modul/napovedy/vyklad?kotva=scitani-cisel');
    await panel.locator('.hint-tips__see a', { hasText: 'Výklad › Sčítání čísel' }).waitFor();
    await panel.getByRole('button', { name: /Compare with solution|Porovnat s řešením/ }).click();
    await page.locator('dialog.solution-diff').getByText('Chceš vidět autorovo řešení?').waitFor();
    await page.keyboard.press('Escape');
    await page.locator('dialog.solution-diff').waitFor({ state: 'detached' });
  });

  test('projekt: nápověda po 2 neúspěších, porovnání souborů z disku s řešením, po splnění „Jak to napsal autor"', async () => {
    const projectId = 'napovedy/projekt';
    await page.goto(`${baseUrl}/#/modul/${projectId}`);
    await page.getByRole('button', { name: /Start project|Začít projekt/ }).click();
    const stories = page.locator('.project__stories');
    const checkButton = stories.getByRole('button', { name: /Check|Zkontrolovat/ });
    await page.locator('.project__folder .copy-field').first().waitFor();

    const block = page.locator('.hint-tips-project');
    const helpButton = block.locator('.hint-tips__button');
    assert.equal(await helpButton.textContent(), 'Potřebuju nápovědu (1 ze 1)');
    await checkButton.click();
    await stories.locator('.result[data-kind="fail"]').waitFor({ timeout: 15000 });
    await checkButton.click();
    await block.locator('.hint-tips__button--highlight').waitFor({ timeout: 15000 });
    assert.equal(await stories.locator('.hint').first().evaluate((el) => el.classList.contains('hint--focus')), true);

    await helpButton.click();
    await block.locator('.hint-tips__tip', { hasText: 'Nadpis první úrovně' }).waitFor();
    await helpButton.click(); // „Porovnat s řešením"
    const dialog = page.locator('dialog.solution-diff');
    await dialog.getByRole('button', { name: /Show solution|Ukázat řešení/ }).click();
    await dialog.locator('.solution-diff__line--add', { hasText: '<h1>Hotovo</h1>' }).waitFor();
    await dialog.locator('.solution-diff__line--del', { hasText: '<p>Začni tady.</p>' }).waitFor();
    await dialog.getByRole('button', { name: /Close|Zavřít/ }).click();

    const authorBox = page.locator('.solution-diff-project');
    assert.equal(await authorBox.isHidden(), true);
    const dir = path.join(workDir, 'moje-projekty', 'napovedy--projekt');
    fs.writeFileSync(path.join(dir, 'index.html'), fs.readFileSync(path.join(CONTENT_DIR, 'napovedy', 'projekt', 'solution', 'index.html')));
    await checkButton.click();
    await stories.locator('.result[data-kind="pass"]').waitFor({ timeout: 15000 });
    await authorBox.getByRole('button', { name: /Author's solution|Jak to napsal autor/ }).click();
    await dialog.getByText('není žádný rozdíl').waitFor();
    await dialog.getByRole('button', { name: /Close|Zavřít/ }).click();

    const attempt = await attemptWhere(projectId, (a) => a.firstOkAt !== null);
    assert.equal(attempt.checks, 3);
    assert.equal(attempt.fails, 2);
    assert.equal(attempt.tipsOpened, 1);
    assert.equal(attempt.assisted, true);
    assert.deepEqual(attempt.failedHints, { 0: 2 });
  });

  test('statistiky: menu, nejčastěji selhaný požadavek, řešení před splněním, čas po sekcích', async () => {
    await page.goto(`${baseUrl}/#/statistiky`);
    const menuItem = page.locator('.app-menu__item[data-item="statistiky"]');
    await menuItem.waitFor();
    assert.equal(await menuItem.getAttribute('aria-current'), 'page');

    const failed = page.locator('.stats__section', { hasText: 'Požadavky, na kterých ses nejvíc zasekl' }).locator('.stats__item').first();
    await failed.waitFor();
    assert.match(await failed.textContent(), /Funkce sum.*2× neprošlo.*Sčítačka s nápovědou · krok 1 · požadavek 2.*sum\(2, 3\) vrátí 5/s);
    assert.equal(await failed.locator('a').first().getAttribute('href'), `#/modul/${STEP_1}`);

    const solution = page.locator('.stats__section', { hasText: 'Kde ses díval na řešení' }).locator('.stats__item').first();
    assert.match(await solution.textContent(), /Funkce sum.*před splněním/s);
    await page.locator('.stats__table', { hasText: 'Sekce pro nápovědy' }).waitFor();
  });
});
