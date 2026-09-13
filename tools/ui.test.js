// Testy uživatelského rozhraní v prohlížeči: sestavená aplikace + skutečný server
// nad malým obsahem z tools/fixtures/ui-content. Hlídají chyby, které unit testy nezachytí
// (klávesové zkratky, přepínání kroků, úklid iframů).
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { createApp } from '../server/app.js';
import { buildClient } from './lib/build-runner.js';
import { closeServer, listen } from './lib/listen.js';
import { BROWSER_ARGS } from './lib/runner-pool.js';

const CONTENT_DIR = path.join(import.meta.dirname, 'fixtures', 'ui-content');

describe('rozhraní aplikace', () => {
  let workDir;
  let server;
  let browser;
  let baseUrl;

  before(async () => {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-ui-test-'));
    const distDir = path.join(workDir, 'dist');
    await buildClient(distDir);
    server = createApp({
      contentDir: CONTENT_DIR,
      dataDir: path.join(workDir, 'data'),
      projectsDir: path.join(workDir, 'moje-projekty'),
      distDir,
    });
    baseUrl = `http://127.0.0.1:${await listen(server, 0)}`;
    browser = await chromium.launch({ args: BROWSER_ARGS });
  });

  after(async () => {
    await browser?.close();
    if (server) await closeServer(server);
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  async function openPage(hash) {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    await page.goto(`${baseUrl}/${hash}`);
    return page;
  }

  /** Přepíše obsah souboru v editoru pracovní plochy. */
  async function typeFile(page, name, content) {
    await page.locator('.editor__tab', { hasText: name }).click();
    await page.locator('.pane--editor .cm-content').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.insertText(content);
  }

  test('úprava kódu během kontroly: Ctrl+Enter kontroluje znovu, nepřeskočí na další krok', async () => {
    const page = await openPage('#/modul/ui/workshop-dom/001');
    try {
      const result = page.locator('.pane--brief .result');
      await typeFile(page, 'wait.txt', '1000'); // test chvíli počká, ať jde během něj psát
      await typeFile(page, 'index.html', '<h1>Krok 001</h1>');
      await page.keyboard.press('Control+Enter');
      await result.and(page.locator('[data-kind="running"]')).waitFor();

      // Během kontroly uživatel správný kód rozbije.
      await page.keyboard.press('Control+A');
      await page.keyboard.insertText('<p>rozbito</p>');
      await result.and(page.locator('[data-kind="pass"]')).waitFor({ timeout: 15000 });

      // Kontrola prošla se starším kódem. Ctrl+Enter teď musí zkontrolovat aktuální kód.
      await page.keyboard.press('Control+Enter');
      await result.and(page.locator('[data-kind="fail"]')).waitFor({ timeout: 15000 });
      assert.match(page.url(), /workshop-dom\/001$/);
    } finally {
      await page.close();
    }
  });

  test('po úspěšné kontrole bez úprav vede Ctrl+Enter na další krok', async () => {
    const page = await openPage('#/modul/ui/workshop-dom/002');
    try {
      await typeFile(page, 'index.html', '<h1>Krok 002</h1>');
      await page.keyboard.press('Control+Enter');
      await page.locator('.pane--brief .result[data-kind="pass"]').waitFor({ timeout: 15000 });
      await page.keyboard.press('Control+Enter');
      await page.waitForURL(/workshop-dom\/003$/);
    } finally {
      await page.close();
    }
  });

  test('odchod z kroku zruší zaseknutou kontrolu — kontrola dalšího kroku ji nečeká', async () => {
    const page = await openPage('#/modul/ui/workshop-dom/001');
    try {
      await typeFile(page, 'wait.txt', 'smycka');
      await page.keyboard.press('Control+Enter');
      await page.locator('.pane--brief .result[data-kind="running"]').waitFor();
      await page.waitForTimeout(300); // test už visí v nekonečné smyčce

      await page.locator('.stepper__item').nth(1).click();
      await page.locator('.workspace__position', { hasText: 'Krok 2 z' }).waitFor();
      await typeFile(page, 'index.html', '<h1>Krok 002</h1>');
      const started = Date.now();
      await page.keyboard.press('Control+Enter');
      // Bez zrušení by zaseknutý iframe (sdílený proces) zdržel i tuhle kontrolu o několik sekund.
      await page.locator('.pane--brief .result[data-kind="pass"]').waitFor({ timeout: 15000 });
      const elapsed = Date.now() - started;
      assert.ok(elapsed < 3000, `kontrola dalšího kroku trvala ${elapsed} ms`);
    } finally {
      await page.close();
    }
  });

  test('rychlé přepínání kroků po sobě nenechá viset iframy', async () => {
    const page = await openPage('#/modul/ui/workshop-js/001');
    try {
      const editor = page.locator('.pane--editor .cm-content');
      await editor.waitFor();
      const frameCount = () => page.evaluate(() => document.querySelectorAll('iframe').length);
      assert.equal(await frameCount(), 1);
      for (let i = 0; i < 8; i++) {
        await editor.click();
        await page.keyboard.insertText('// ');
        await page.locator('.stepper__item').nth((i + 1) % 2).click();
        await page.locator('.workspace__position', { hasText: `Krok ${((i + 1) % 2) + 1} z` }).waitFor();
      }
      await page.waitForTimeout(500); // odložené překreslení náhledu (debounce)
      assert.equal(await frameCount(), 1, 'po přepínání zůstal jen iframe aktuálního náhledu');
    } finally {
      await page.close();
    }
  });

  test('adresa s rozbitým %-kódováním ukáže „stránka neexistuje"', async () => {
    const page = await openPage('#/modul/ui/workshop-js/001');
    try {
      await page.locator('.pane--editor .cm-content').waitFor();
      await page.evaluate(() => {
        location.hash = '#/sekce/%E0%A4%A';
      });
      await page.getByRole('heading', { name: 'Tahle stránka neexistuje' }).waitFor({ timeout: 5000 });
    } finally {
      await page.close();
    }
  });
});
