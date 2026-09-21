// Kvíz, otázky a opakování v prohlížeči: sestavená aplikace + skutečný server
// nad obsahem z tools/fixtures/reviews-content (porty 4440–4459).
//
// Hlídá: první špatný pokus neprozradí správnou odpověď, druhý ano, „Projít jen chybné",
// sada # --code-- s panelem kódu, pokusy a skóre prvního průchodu na serveru a průchod
// obrazovkou #/opakovani (volby až po „Ukaž volby", jistota, karta free).
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { createApp } from '../server/app.js';
import { loadModule, loadSection } from '../shared/content.js';
import { localDate } from '../server/routes/_reviews-store.js';
import { buildClient } from './lib/build-runner.js';
import { closeServer, listenInRange } from './lib/listen.js';
import { BROWSER_ARGS } from './lib/runner-pool.js';

const CONTENT_DIR = path.join(import.meta.dirname, 'fixtures', 'reviews-content');
const PORTS = { from: 4440, to: 4459 };

describe('kvíz a opakování v prohlížeči', () => {
  let workDir;
  let dataDir;
  let server;
  let browser;
  let baseUrl;

  before(async () => {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-ui-reviews-'));
    dataDir = path.join(workDir, 'data');
    const distDir = path.join(workDir, 'dist');
    await buildClient(distDir);

    // Opakování na dnešek: otázka kvízu a karta free (klíče od parseru).
    const quiz = loadModule(CONTENT_DIR, 'opak', 'kviz').quiz;
    const card = loadSection(CONTENT_DIR, 'opak').cards[0];
    const today = localDate(new Date());
    const item = { box: 2, due: today, added: new Date().toISOString(), reason: 'first-answer', lastAnswered: null, history: [] };
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(
      path.join(dataDir, 'opakovani.json'),
      JSON.stringify({
        version: 1,
        items: { [`q:opak/kviz#${quiz.questions[0].key}`]: item, [`card:opak#${card.key}`]: { ...item, box: 1, reason: 'card' } },
        removed: {},
      }),
    );

    server = createApp({ contentDir: CONTENT_DIR, dataDir, projectsDir: path.join(workDir, 'moje-projekty'), distDir });
    baseUrl = `http://127.0.0.1:${await listenInRange(server, PORTS)}`;
    browser = await chromium.launch({ args: BROWSER_ARGS });
  });

  after(async () => {
    await browser?.close();
    if (server) await closeServer(server);
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  async function openPage(hash) {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/${hash}`);
    return { page, errors };
  }

  const api = async (url) => (await fetch(baseUrl + url)).json();

  test('kvíz: první špatný pokus neprozradí odpověď, „Projít jen chybné" ji napodruhé ukáže', async () => {
    const { page, errors } = await openPage('#/modul/opak/kviz');
    try {
      await page.getByRole('radio', { name: /All at once|Všechny najednou/ }).check();
      const questions = page.locator('.quiz__body .question');
      await questions.nth(2).waitFor();
      assert.equal(await questions.count(), 3);

      // Sada # --code--: panel s kódem a čísly řádků vedle otázky.
      const codeSet = page.locator('.quiz-code-group .code-set');
      await codeSet.waitFor();
      assert.match(await codeSet.locator('.code-set__gutter').innerText(), /^1\n2\n3\n4\n5\n6\n7$/);
      assert.match(await codeSet.innerText(), /cartTotal/);

      // Otázka 1 špatně (s jistotou), otázka 2 špatně, otázka 3 správně.
      const first = questions.nth(0);
      await first.locator('.answer', { hasText: '"string"' }).click();
      await first.getByRole('radio', { name: /I am sure|Jsem si jistý/ }).check();
      await questions.nth(1).locator('.text-answer__input').fill('3');
      await questions.nth(2).locator('.text-answer__input').fill(' 0; ');
      await page.getByRole('button', { name: /Evaluate|Vyhodnotit/ }).click();

      const summary = page.locator('.quiz-summary');
      await summary.waitFor();
      assert.match(await summary.locator('.quiz-summary__score').innerText(), /1 z 3/);
      assert.equal(await page.locator('.question .answer[data-state="correct"]').count(), 0, 'správná volba se po prvním pokusu neukáže');
      assert.equal(await page.locator('.question .answer[data-state="wrong"]').count(), 1);
      assert.match(await page.locator('.question').nth(0).innerText(), /Myslíš si, že všechno z konzole je text/);
      assert.doesNotMatch(await page.locator('.question').nth(0).innerText(), /Číselný literál/);
      assert.match(await page.locator('.question').nth(0).innerText(), /Tady ses mýlil s jistotou/);
      assert.equal(await page.locator('.question').nth(1).locator('.text-answer__solution').innerText(), '', 'psaná otázka neukáže expected');
      assert.match(await summary.innerText(), /Chybné otázky/);
      assert.equal(await summary.locator('a[href="#/modul/opak/kviz"]').count(), 1, 'odkaz see u chybné otázky');

      await page.getByRole('button', { name: /Review mistakes only \(2\)|Projít jen chybné \(2\)/ }).click();
      await page.getByRole('button', { name: /Evaluate|Vyhodnotit/ }).waitFor();
      const retry = page.locator('.quiz__body .question');
      assert.equal(await retry.count(), 2);
      await retry.nth(0).locator('.answer', { hasText: '"integer"' }).click();
      await retry.nth(1).locator('.text-answer__input').fill('4');
      await page.getByRole('button', { name: /Evaluate|Vyhodnotit/ }).click();

      await page.locator('.quiz-summary').waitFor();
      assert.equal(await page.locator('.question .answer[data-state="correct"]').count(), 1, 'napodruhé se správná volba ukáže');
      assert.match(await page.locator('.question').nth(1).locator('.text-answer__solution').innerText(), /Správná odpověď\s+2/);

      // Server: pokusy u otázek a skóre prvního průchodu (balík pokusů), položky opakování z první odpovědi.
      await page.waitForTimeout(300);
      const attempts = await api('/api/attempts');
      const quiz = loadModule(CONTENT_DIR, 'opak', 'kviz').quiz;
      const firstId = `q:opak/kviz#${quiz.questions[0].key}`;
      assert.equal(attempts.items[firstId]?.fails, 2);
      assert.equal(attempts.items['opak/kviz']?.firstScore, 1 / 3);
      const confidence = await api('/api/confidence/opak');
      assert.deepEqual(confidence.sure, { total: 1, correct: 0 });
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });

  test('kvíz po jedné otázce: všechno správně → splněno bez „Projít jen chybné"', async () => {
    const { page, errors } = await openPage('#/modul/opak/kviz');
    try {
      const slot = page.locator('.quiz__slot');
      await slot.locator('.question').waitFor();
      await page.getByRole('button', { name: /Next question|Další otázka/ }).click();
      assert.match(await page.locator('.quiz__status').innerText(), /Nejdřív odpověz/);

      await slot.locator('.answer', { hasText: '"number"' }).click();
      await page.getByRole('button', { name: /Next question|Další otázka/ }).click();
      await slot.locator('.text-answer__input').fill('2');
      await page.getByRole('button', { name: /Next question|Další otázka/ }).click();
      await slot.locator('.code-set').waitFor(); // otázka ze sady # --code-- má kód vedle sebe
      await slot.locator('.text-answer__input').fill('0');
      await page.getByRole('button', { name: /Evaluate|Vyhodnotit/ }).click();

      const summary = page.locator('.quiz-summary');
      await summary.waitFor();
      assert.match(await summary.innerText(), /3 z 3/);
      assert.match(await summary.innerText(), /Kvíz je splněný/);
      assert.equal(await page.getByRole('button', { name: /Review mistakes only|Projít jen chybné/ }).count(), 0);
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });

  test('opakování: volby až po „Ukaž volby", jistota, karta free a konec dne', async () => {
    const { page, errors } = await openPage('#/opakovani');
    try {
      await page.locator('.reviews-item').waitFor();
      assert.match(await page.locator('.reviews__position').innerText(), /Položka 1 z 2/);

      for (let i = 0; i < 2; i++) {
        const item = page.locator('.reviews-item');
        const type = await item.getAttribute('data-type');
        if (type === 'question') {
          assert.equal(await item.locator('.answers').isVisible(), false, 'volby jsou nejdřív schované');
          await item.getByRole('button', { name: /Show choices|Ukaž volby/ }).click();
          await item.locator('.answer', { hasText: '"number"' }).click();
          await item.getByRole('radio', { name: /I am sure|Jsem si jistý/ }).check();
          await item.getByRole('button', { name: /Check|Zkontrolovat/ }).click();
          await item.locator('.question[data-result="correct"]').waitFor();
        } else {
          await item.getByRole('button', { name: /Show answer|Ukaž odpověď/ }).click();
          assert.match(await item.locator('.reviews-free__back').innerText(), /vrací nové pole/);
          await item.getByRole('button', { name: /I knew this|Věděl jsem/ }).click();
        }
        await page.getByRole('button', { name: i === 0 ? /Next item|Další položka/ : /Finish|Dokončit/ }).click();
      }

      await page.locator('.reviews__done').waitFor();
      assert.match(await page.locator('.reviews__done').innerText(), /2 z 2/);
      await page.waitForTimeout(200);
      const due = await api('/api/reviews/due');
      assert.equal(due.items.length, 0);
      assert.equal(due.answeredToday, 2);
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });
});
