// UI testy balíku orientace v prohlížeči: tmavý režim, přepínač šířky náhledu, obsah lekce,
// poznámky a „Nerozumím", doporučená trasa a Další na trase, konzole pod editorem u js.
// Sestavená aplikace + skutečný server nad obsahem z tools/fixtures/orientation-content.
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

const CONTENT_DIR = path.join(import.meta.dirname, 'fixtures', 'orientation-content');
// Porty balíku 6 (docs/platforma.md, kap. 7.1).
const PORTS = { from: 4510, to: 4519 };

describe('orientace, tmavý režim a poznámky v prohlížeči', () => {
  let workDir;
  let server;
  let browser;
  let baseUrl;

  before(async () => {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-ui-orientation-'));
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
  });

  after(async () => {
    await browser?.close();
    if (server) {
      await server.akademie.ctx.progress.flush();
      await closeServer(server);
    }
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  async function openPage(hash, { width = 1400, height = 900 } = {}) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.errors = errors;
    await page.goto(`${baseUrl}/${hash}`);
    return page;
  }

  /** page.waitForFunction s popisem — při vypršení je v chybě vidět, na co se čekalo. */
  async function waitUntil(page, label, fn, arg = null) {
    try {
      await page.waitForFunction(fn, arg, { timeout: 10000 });
    } catch (error) {
      throw new Error(`Nedočkal jsem se: ${label} (${error.message.split('\n')[0]})`);
    }
  }

  async function api(method, url, body) {
    const res = await fetch(baseUrl + url, {
      method,
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }

  test('přepínač motivu: světlý → tmavý, uloží se do nastavení a platí po načtení', async () => {
    await api('PUT', '/api/settings', { theme: 'light' });
    const page = await openPage('#/');
    try {
      await page.locator('.toc').first().waitFor();
      const toggle = page.locator('[data-item="theme"]');
      await waitUntil(page, 'motiv světlý', () => document.documentElement.dataset.theme === 'light');
      await toggle.click();
      await waitUntil(page, 'motiv tmavý', () => document.documentElement.dataset.theme === 'dark');
      assert.equal(await page.evaluate(() => document.documentElement.dataset.themeChoice), 'dark');
      await waitUntil(page, 'nastavení theme: dark na serveru', async () => (await (await fetch('/api/settings')).json()).theme === 'dark');

      const reloaded = await openPage('#/');
      try {
        await waitUntil(reloaded, 'motiv tmavý', () => document.documentElement.dataset.theme === 'dark');
        // Při omezeném pohybu má každá změna barvy nepatrný přechod (0.01 ms), takže se barva
        // čte až ve chvíli, kdy doběhl — ne ve stejném okamžiku, kdy se nastavil motiv.
        await waitUntil(reloaded, 'tmavá plocha těla', () => getComputedStyle(document.body).backgroundColor === 'rgb(16, 20, 26)');
        const background = await reloaded.evaluate(() => getComputedStyle(document.body).backgroundColor);
        assert.equal(background, 'rgb(16, 20, 26)', 'tělo stránky má tmavý token --paper');
      } finally {
        await reloaded.close();
      }
    } finally {
      await page.close();
    }
  });

  test('tmavý režim: žádný prvek aplikace nezůstane se světlou barvou (natvrdo zapsanou)', async () => {
    await api('PUT', '/api/settings', { theme: 'dark' });
    // Světlé barvy, které by v tmavém režimu znamenaly zapomenutou barvu mimo tokeny.
    const LIGHT_BACKGROUNDS = ['rgb(255, 255, 255)', 'rgb(253, 252, 248)', 'rgb(236, 234, 223)', 'rgb(230, 227, 215)', 'rgb(246, 244, 236)'];
    const LIGHT_TEXT = ['rgb(24, 33, 46)', 'rgb(74, 85, 102)', 'rgb(95, 104, 118)', 'rgb(0, 0, 0)'];
    for (const hash of ['#/', '#/sekce/zaklady', '#/modul/zaklady/lekce', '#/modul/zaklady/workshop/001', '#/poznamky']) {
      const page = await openPage(hash);
      try {
        await waitUntil(page, 'motiv tmavý', () => document.documentElement.dataset.theme === 'dark');
        await page.waitForTimeout(800); // načtení dat a vykreslení obrazovky
        const offenders = await page.evaluate(
          ({ LIGHT_BACKGROUNDS, LIGHT_TEXT }) => {
            const out = [];
            for (const element of document.querySelectorAll('body *')) {
              // Náhled uživatelovy stránky má vlastní barvy (a bílý podklad) i v tmavém režimu.
              if (element.closest('iframe, .output__frame, .project__frame, .akademie-preview')) continue;
              const style = getComputedStyle(element);
              if (style.display === 'none' || style.visibility === 'hidden' || !element.getClientRects().length) continue;
              const hasText = [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim());
              if (LIGHT_BACKGROUNDS.includes(style.backgroundColor)) out.push(`pozadí ${style.backgroundColor}: ${element.className || element.tagName}`);
              if (hasText && LIGHT_TEXT.includes(style.color)) out.push(`text ${style.color}: ${element.className || element.tagName}`);
            }
            return out.slice(0, 10);
          },
          { LIGHT_BACKGROUNDS, LIGHT_TEXT },
        );
        assert.deepEqual(offenders, [], `${hash} má v tmavém režimu světlé barvy`);
        assert.deepEqual(page.errors, [], `${hash}: chyby na stránce`);
      } finally {
        await page.close();
      }
    }
    await api('PUT', '/api/settings', { theme: 'light' });
  });

  test('přepínač šířky náhledu: 375 zmenší stránku, volba se pamatuje, Panel vyplní panel', async () => {
    await api('PUT', '/api/settings', { previewWidth: 'tests' });
    const page = await openPage('#/modul/zaklady/workshop/001');
    try {
      const frame = page.locator('.output__frame iframe');
      await frame.waitFor();
      const option = (width) => page.locator(`.preview-width__option[data-width="${width}"]`);
      await waitUntil(page, 'zvolená šířka Jako testy', () => document.querySelector('.preview-width__option[aria-pressed="true"]')?.dataset.width === 'tests');
      assert.equal(await frame.evaluate((el) => el.style.width), '1024px');

      await option('375').click();
      await waitUntil(page, 'iframe široký 375 px', () => document.querySelector('.output__frame iframe')?.style.width === '375px');
      assert.equal(await option('375').getAttribute('aria-pressed'), 'true');
      await waitUntil(page, 'nastavení previewWidth: 375 na serveru', async () => (await (await fetch('/api/settings')).json()).previewWidth === '375');
      // Media dotaz v náhledu reaguje na šířku stránky 375 px, ne na šířku okna.
      const narrowBackground = await page.frameLocator('.output__frame iframe').locator('body').evaluate((body) => getComputedStyle(body).backgroundColor);
      assert.equal(narrowBackground, 'rgb(255, 0, 0)');

      await page.locator('.stepper__item').nth(1).click();
      await page.locator('.workspace__position', { hasText: 'Krok 2 z' }).waitFor();
      await waitUntil(page, 'iframe široký 375 px', () => document.querySelector('.output__frame iframe')?.style.width === '375px');

      await option('panel').click();
      await waitUntil(page, 'náhled vyplní panel', () => {
        const iframe = document.querySelector('.output__frame iframe');
        return iframe && iframe.style.width !== '375px' && iframe.getBoundingClientRect().width > 300;
      });
      assert.ok(await page.locator('.preview-new-tab').isEnabled(), 'tlačítko Nová karta je aktivní');
    } finally {
      await page.close();
      await api('PUT', '/api/settings', { previewWidth: 'tests' });
    }
  });

  test('obsah lekce: připnutý vedle textu, odkaz odscrolluje a zapíše ?kotva=; na úzkém okně rozbalovací', async () => {
    const page = await openPage('#/modul/zaklady/lekce', { width: 1600, height: 700 });
    try {
      const aside = page.locator('.lesson-toc--aside');
      await aside.waitFor();
      await waitUntil(page, 'obsah lekce připnutý vedle textu', () => document.querySelector('[data-slot="aside"]')?.classList.contains('is-docked'));
      assert.deepEqual(await aside.locator('.lesson-toc__link').allTextContents(), ['První část', 'Druhá část', 'Podčást druhé části', 'Třetí část']);
      assert.equal(await page.locator('.lesson-toc--inline').isVisible(), false);

      await aside.locator('.lesson-toc__link', { hasText: 'Třetí část' }).click();
      await waitUntil(page, 'adresa s ?kotva=treti-cast', () => location.hash.endsWith('?kotva=treti-cast'));
      await waitUntil(page, 'nadpis Třetí část odscrollovaný nahoru', () => {
        const top = document.getElementById('treti-cast')?.getBoundingClientRect().top;
        return top !== undefined && top >= 0 && top < window.innerHeight / 2;
      });
      await waitUntil(page, 'zvýrazněná Třetí část v obsahu', () => document.querySelector('.lesson-toc--aside [aria-current="location"]')?.textContent === 'Třetí část');
    } finally {
      await page.close();
    }

    const narrow = await openPage('#/modul/zaklady/lekce', { width: 1000, height: 800 });
    try {
      const inline = narrow.locator('.lesson-toc--inline');
      await inline.waitFor();
      assert.equal(await narrow.locator('.lesson-toc--aside').isVisible(), false);
      await inline.locator('summary').click();
      assert.equal(await inline.locator('.lesson-toc__link').count(), 4);
    } finally {
      await narrow.close();
    }
  });

  test('„Nerozumím" u odstavce uloží citaci s kotvou nejbližšího nadpisu do poznámek sekce', async () => {
    const page = await openPage('#/modul/zaklady/lekce', { width: 1400, height: 900 });
    try {
      const paragraph = page.locator('.lesson .prose p', { hasText: 'Text druhé části.' });
      await paragraph.waitFor();
      await paragraph.hover();
      await page.locator('.not-understood').click();
      const drawer = page.locator('.notes-drawer');
      await drawer.waitFor();
      assert.equal(await drawer.locator('.notes-drawer__quote').textContent(), 'Text druhé části.');
      assert.equal(await drawer.locator('#notes-drawer-entry-title').inputValue(), 'Nerozumím: Druhá část');
      await drawer.locator('textarea').fill('Proč je to tak?');
      await page.keyboard.press('Control+Enter');
      await drawer.locator('.notes-drawer__status', { hasText: 'Uloženo' }).waitFor();

      const { content } = await api('GET', '/api/notes/zaklady');
      assert.match(content, /\n## Nerozumím: Druhá část\n\n<!-- zdroj: zaklady\/lekce#druha-cast · \S+ · quote -->\n\n> Text druhé části\.\n\nProč je to tak\?\n$/);

      await page.keyboard.press('Escape');
      await drawer.waitFor({ state: 'hidden' });
    } finally {
      await page.close();
    }

    const notesPage = await openPage('#/poznamky/zaklady');
    try {
      await notesPage.locator('.notes-meta a', { hasText: 'zaklady/lekce#druha-cast' }).waitFor();
      assert.equal(await notesPage.locator('.notes-meta a').first().getAttribute('href'), '#/modul/zaklady/lekce?kotva=druha-cast');
    } finally {
      await notesPage.close();
    }
  });

  test('přehled: štítek rozšíření a pohled podle doporučené trasy; sekce: Další na trase', async () => {
    const page = await openPage('#/');
    try {
      await page.locator('.toc-row[data-uroven="rozsireni"] .toc-row__tag--extension', { hasText: 'Rozšíření' }).first().waitFor();
      await page.locator('.toc-view__option[data-view="route"]').click();
      const routeRows = page.locator('.toc--route .toc-sections--route .toc-row__title');
      assert.deepEqual(await routeRows.allTextContents(), ['Základy orientace', 'Druhá sekce']);
      assert.equal(await page.locator('.toc--route .toc-sections:not(.toc-sections--route) .toc-row').count(), 2, 'mimo trasu: rozšíření a plánovaná');

      await page.goto(`${baseUrl}/#/sekce/zaklady`);
      const next = page.locator('.next-on-route__link');
      await next.waitFor();
      assert.equal(await next.getAttribute('href'), '#/sekce/druha');
      assert.match(await next.textContent(), /Další na trase.*Druhá sekce.*Sekce, na kterou vede Další na trase\./);
      // Drobečky: část vede na přehled na svou část osnovy.
      assert.equal(await page.locator('.app-bar__crumbs a', { hasText: 'První část' }).getAttribute('href'), '#/?cast=prvni-cast');
    } finally {
      await page.close();
    }
  });

  test('krok: seznam kroků s názvy, Zkontrolovat se po splnění schová; js má konzoli pod editorem', async () => {
    const page = await openPage('#/modul/zaklady/workshop/001');
    try {
      await page.locator('.step-menu__summary').click();
      assert.deepEqual(await page.locator('.step-menu__name').allTextContents(), ['Nadpis stránky', 'Druhý krok']);
      await page.keyboard.press('Escape');

      // Kód mimo oblast --edit-- je sbalený do jednoho řádku.
      await page.locator('.cm-fold-previous').first().waitFor();

      const check = page.locator('.pane--brief .btn--primary', { hasText: /Check|Zkontrolovat/ });
      await page.locator('.pane--editor .cm-content').click();
      await page.keyboard.insertText('<h1>Nadpis</h1>');
      await page.keyboard.press('Control+Enter');
      await page.locator('.pane--brief .result[data-kind="pass"]').waitFor({ timeout: 15000 });
      assert.equal(await check.isVisible(), false, 'po splnění je hlavní akcí Další krok');
      assert.equal(await page.locator('.step-menu__link[aria-current="step"]').getAttribute('data-done'), 'true');
      await page.keyboard.insertText(' ');
      await check.waitFor();
    } finally {
      await page.close();
    }

    const jsPage = await openPage('#/modul/zaklady/konzole/001');
    try {
      await jsPage.locator('.workspace__stack .pane--editor').waitFor();
      const editorBox = await jsPage.locator('.workspace__stack .pane--editor').boundingBox();
      const consoleBox = await jsPage.locator('.workspace__stack .pane--output').boundingBox();
      assert.ok(consoleBox.y >= editorBox.y + editorBox.height - 1, 'konzole je pod editorem');
      assert.ok(editorBox.height > consoleBox.height, 'editor je vyšší než konzole');
    } finally {
      await jsPage.close();
    }
  });

  test('zkratky: ? ukáže přehled, Alt+→ vede na další krok', async () => {
    const page = await openPage('#/modul/zaklady/workshop/001');
    try {
      await page.locator('.step-menu__summary').waitFor();
      await page.locator('.brief__title').click(); // fokus mimo editor
      await page.keyboard.press('Shift+?');
      await page.locator('dialog.shortcuts[open]').waitFor();
      await page.keyboard.press('Escape');
      await page.locator('dialog.shortcuts').waitFor({ state: 'hidden' });
      await page.keyboard.press('Alt+ArrowRight');
      await page.waitForURL(/workshop\/002$/);
    } finally {
      await page.close();
    }
  });
});
