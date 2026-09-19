// Kouřový E2E test Akademie: projde aplikaci v prohlížeči tak, jak ji používá člověk.
//
//   node tools/e2e.js                          headless, výsledek do konzole
//   node tools/e2e.js --port 4600              port serveru (výchozí volný port od systému)
//   node tools/e2e.js --screenshots <adresář>  kam uložit snímky obrazovky (výchozí .e2e/)
//   node tools/e2e.js --headed                 s viditelným oknem prohlížeče
//   node tools/e2e.js --keep                   nemazat dočasná data (pro zkoumání chyby)
//
// Soběstačné: sestaví klienta do dočasného adresáře a spustí server přes createApp
// s dočasnými adresáři pro postup a projekty — data/ a moje-projekty/ uživatele
// zůstanou netknuté. Obsah kurzu se bere ze skutečného content/.
//
// Scénáře (na sobě závisí, běží v tomto pořadí):
//   přehled → sekce → lekce (živá ukázka, otázky) → workshop (červené/zelené testy,
//   další krok, kód přežije reload) → lab (řešení, nekonečná smyčka) → kvíz →
//   nástroje: nápověda → porovnání s řešením, opakování, poznámky, tmavý režim →
//   projekt ve VS Code (start, řešení na disk, kontrola) → restart serveru (postup, Pokračovat)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { createApp } from '../server/app.js';
import { buildClient, PROJECT_ROOT } from './lib/build-runner.js';
import { closeServer, listen } from './lib/listen.js';
import { BROWSER_ARGS } from './lib/runner-pool.js';
import { loadModule } from '../shared/content.js';

const CONTENT_DIR = path.join(PROJECT_ROOT, 'content');
const VIEWPORT = { width: 1440, height: 900 };

// Moduly, přes které scénáře vedou.
const LESSON = 'css-flexbox/uvod-do-flexboxu';
const WORKSHOP = 'css-flexbox/workshop-navigace';
const LAB = 'js-pole/lab-statistika-znamek';
const QUIZ = 'css-flexbox/kviz';
const PROJECT = 'node-zaklady/projekt-api-poznamek';
const RESUME_STEP = 'js-pole/workshop-nakupni-seznam/003';
// Nástroje: krok pro nápovědu a porovnání s řešením (jiný než RESUME_STEP) a položky opakování.
const HINT_STEP = 'js-pole/workshop-nakupni-seznam/002';
const REVIEW_STEP = 'js-pole/workshop-nakupni-seznam/001';

// ---------------------------------------------------------------------------
// Příkazová řádka
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const options = { port: 0, screenshots: path.join(PROJECT_ROOT, '.e2e'), headed: false, keep: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--port') options.port = Number(argv[++i]);
    else if (arg === '--screenshots') options.screenshots = path.resolve(argv[++i] ?? '');
    else if (arg === '--headed') options.headed = true;
    else if (arg === '--keep') options.keep = true;
    else throw new Error(`neznámý přepínač ${arg}`);
  }
  if (!Number.isInteger(options.port) || options.port < 0) throw new Error('--port musí být číslo');
  return options;
}

// ---------------------------------------------------------------------------
// Pomocné funkce pro práci se stránkou
// ---------------------------------------------------------------------------

/** Počká, až `fn()` vrátí pravdivou hodnotu (výjimky bere jako „ještě ne"). */
async function waitUntil(fn, { timeout = 10000, interval = 100, message = 'podmínka se nesplnila' } = {}) {
  const deadline = Date.now() + timeout;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const value = await fn();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(`${message} (čekal jsem ${timeout} ms${lastError ? `, poslední chyba: ${lastError.message}` : ''})`);
}

/**
 * Přepíše obsah souboru v editoru jako uživatel: záložka → Ctrl+A → vložení textu.
 * `scope` je lokátor, ve kterém editor leží (pracovní plocha nebo živá ukázka).
 */
async function replaceEditorFile(page, scope, name, content) {
  await selectEditorTab(scope, name);
  await scope.locator('.cm-content').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(content);
}

async function selectEditorTab(scope, name) {
  const tab = scope.locator('.editor__tab', { hasText: name });
  if ((await tab.count()) > 0) await tab.first().click();
}

/** Spustí kód v iframu, který najde `iframeLocator` (sandboxovaný náhled je jiný origin). */
async function evaluateInFrame(iframeLocator, fn, arg) {
  const handle = await iframeLocator.elementHandle({ timeout: 2000 });
  const frame = await handle.contentFrame();
  if (!frame) throw new Error('iframe ještě nemá dokument');
  return frame.evaluate(fn, arg);
}

/** Klikne na Zkontrolovat a počká na výsledek. Vrátí `pass`, `fail` nebo `error`. */
async function checkAndWait(page, resultLocator, trigger, { timeout = 60000 } = {}) {
  await trigger();
  const done = resultLocator.and(page.locator('[data-kind="pass"], [data-kind="fail"], [data-kind="error"]'));
  await done.waitFor({ timeout });
  return done.getAttribute('data-kind');
}

async function hintStatuses(scope) {
  return scope.locator('.hint').evaluateAll((items) => items.map((item) => item.dataset.status));
}

// ---------------------------------------------------------------------------
// Scénáře
// ---------------------------------------------------------------------------

/**
 * @param {{ page, api, baseUrl, shot, projectsDir, restartServer }} t
 */
const scenarios = [
  ['přehled osnovy a sekce', async ({ page, baseUrl, shot }) => {
    await page.goto(`${baseUrl}/#/`);
    await page.locator('.toc-part').first().waitFor();
    assert.match(await page.locator('.resume__action').textContent(), /Start|Začít/, 'nový uživatel má tlačítko Začít');
    await shot('01-prehled');

    // Sekce může být v přehledu víckrát (po částech i v doporučené trase) — stačí první odkaz.
    await page.locator('a.toc-row__title', { hasText: 'CSS Flexbox' }).first().click();
    await page.locator('.module-list .module-row').first().waitFor();
    assert.match(page.url(), /#\/sekce\/css-flexbox$/);
    assert.equal(await page.locator('.module-row').count(), 5);
    await shot('02-sekce');
  }],

  ['lekce: živá ukázka a kontrolní otázky', async ({ page, api, shot }) => {
    await page.locator('.module-row a', { hasText: 'Úvod do flexboxu' }).click();
    const live = page.locator('.live').first();
    await live.locator('.cm-content').waitFor();

    // Výchozí ukázka: nadpis, počet a tlačítko jsou pod sebou.
    const iframe = live.locator('.live__preview iframe');
    const layout = () => evaluateInFrame(iframe, () => {
      const bar = document.querySelector('.bar');
      const title = document.querySelector('.bar__title').getBoundingClientRect();
      const button = document.querySelector('.bar button').getBoundingClientRect();
      return { display: getComputedStyle(bar).display, sameRow: Math.abs(title.top - button.top) < 20 };
    });
    await waitUntil(async () => (await layout()).display === 'block', { message: 'náhled ukázky se nenačetl' });
    assert.equal((await layout()).sameRow, false, 'bez flexboxu jsou prvky pod sebou');

    // Úprava podle výkladu: `.bar` dostane display: flex a náhled se překreslí.
    await selectEditorTab(live, 'styles.css');
    await live.locator('.cm-content').click();
    await page.keyboard.press('Control+End');
    await page.keyboard.insertText('\n.bar { display: flex; align-items: center; gap: 1rem; }\n');
    await waitUntil(async () => (await layout()).display === 'flex', { message: 'náhled se po úpravě nezměnil' });
    assert.equal((await layout()).sameRow, true, 's flexboxem jsou prvky v řádku');
    await live.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -80));
    await shot('03-lekce');

    // Tlačítko Obnovit vrátí původní kód.
    await live.getByRole('button', { name: /Reset|Obnovit/ }).click();
    await waitUntil(async () => (await layout()).display === 'block', { message: 'Obnovit nevrátilo ukázku' });

    // Kontrolní otázky (kontrakt kap. 5.8): každá se zkontroluje zvlášť, pak „Mám přečteno".
    const module = await api.module(LESSON);
    // Kontrolní otázky :::check (bez pretestu) se do splnění lekce počítají taky (kontrakt kap. 5.8).
    const checks = module.lesson.blocks.filter((block) => block.kind === 'check' && !block.pretest);
    const checkElements = page.locator('[data-block="check"]:not(.lesson-check--pretest)');
    assert.equal(await checkElements.count(), checks.length);
    for (const [index, block] of checks.entries()) {
      await chooseAnswers(checkElements.nth(index).locator('.question'), block.question, 'correct');
      await checkElements.nth(index).getByRole('button', { name: /Check|Zkontrolovat/ }).click();
    }
    const questions = page.locator('.lesson__finish .question');
    assert.equal(await questions.count(), module.lesson.questions.length);
    for (const [index, question] of module.lesson.questions.entries()) {
      await chooseAnswers(questions.nth(index), question, 'correct');
      await questions.nth(index).getByRole('button', { name: /Check|Zkontrolovat/ }).click();
    }
    await page.getByRole('button', { name: /Mark as read|Mám přečteno/ }).click();
    await page.locator('.lesson__finish', { hasText: 'Lekce je splněná.' }).waitFor();
    await page.locator('.lesson__finish').scrollIntoViewIfNeeded();
    await shot('03b-lekce-otazky');
    assert.ok((await api.progress()).completed[LESSON], 'lekce je v postupu splněná');
  }],

  ['workshop: seed neprojde, řešení projde, další krok, kód přežije reload', async ({ page, api, baseUrl, shot }) => {
    await page.goto(`${baseUrl}/#/modul/${WORKSHOP}/001`);
    const brief = page.locator('.pane--brief');
    const editor = page.locator('.pane--editor');
    const result = brief.locator('.result');
    await editor.locator('.cm-content').waitFor();

    const onSeed = await checkAndWait(page, result, () => brief.getByRole('button', { name: /Check|Zkontrolovat/ }).click());
    assert.equal(onSeed, 'fail', 'výchozí kód nemá projít');
    assert.ok((await hintStatuses(brief)).includes('fail'), 'aspoň jeden požadavek je červený');

    const { steps } = await api.module(WORKSHOP, { solution: true });
    const [step] = steps;
    for (const file of step.solution) {
      const seed = step.seed.find((s) => s.name === file.name);
      if (seed?.content !== file.content) await replaceEditorFile(page, editor, file.name, file.content);
    }
    const onSolution = await checkAndWait(page, result, () => brief.getByRole('button', { name: /Check|Zkontrolovat/ }).click());
    assert.equal(onSolution, 'pass', `řešení má projít, požadavky: ${await hintStatuses(brief)}`);
    assert.ok((await hintStatuses(brief)).every((status) => status === 'pass'));
    await waitUntil(async () => (await api.progress()).completed[step.id], { message: 'krok se neuložil jako splněný' });
    // Živý náhled ukazuje upravený kód: ve stylech stránky je řádek, který přidalo řešení.
    const previewFrame = page.locator('.pane--output .output__preview iframe');
    const changed = step.solution.find((file) => file.content !== step.seed.find((s) => s.name === file.name)?.content);
    const seedLines = new Set(step.seed.find((s) => s.name === changed.name).content.split('\n').map((line) => line.trim()));
    const addedLine = changed.content.split('\n').map((line) => line.trim()).find((line) => line && !seedLines.has(line));
    await waitUntil(
      () => evaluateInFrame(previewFrame, (text) => document.documentElement.outerHTML.includes(text), addedLine),
      { message: 'náhled neukazuje kód z editoru' },
    );
    await shot('04-workshop-krok');

    await result.getByRole('link', { name: /Next step|Další krok/ }).click();
    await page.waitForURL(/\/002$/);
    await page.locator('.workspace__position', { hasText: 'Krok 2 z' }).waitFor();
    assert.equal(await page.locator('.stepper__item').first().getAttribute('data-done'), 'true');

    // Rozpracovaný kód: editor má po otevření kurzor ve zvýrazněné oblasti, píšeme tam.
    await waitUntil(() => page.evaluate(() => Boolean(document.activeElement?.closest('.cm-content'))), {
      message: 'editor po otevření kroku nemá fokus',
    });
    const marker = '/* rozpracováno: e2e */';
    await page.keyboard.insertText(marker);
    await page.locator('.app-bar__status[data-state="saved"]').waitFor();
    await page.reload();
    await editor.locator('.cm-content').waitFor();
    await waitUntil(async () => (await editor.locator('.cm-content').textContent()).includes(marker), {
      message: 'rozpracovaný kód se po reloadu neobjevil v editoru',
    });
  }],

  ['lab: řešení projde, nekonečná smyčka stránku nezamrazí', async ({ page, api, baseUrl, shot }) => {
    await page.goto(`${baseUrl}/#/modul/${LAB}`);
    const brief = page.locator('.pane--brief');
    const editor = page.locator('.pane--editor');
    const result = brief.locator('.result');
    await editor.locator('.cm-content').waitFor();

    const { lab } = await api.module(LAB, { solution: true });
    const solution = lab.solution.find((f) => f.name === 'script.js').content;
    await replaceEditorFile(page, editor, 'script.js', solution);
    // Tentokrát zkratkou z editoru.
    const onSolution = await checkAndWait(page, result, () => page.keyboard.press('Control+Enter'));
    assert.equal(onSolution, 'pass', `řešení labu má projít, požadavky: ${await hintStatuses(brief)}`);
    await shot('07-lab');

    // Uživatel rozepíše smyčku ve funkci, kterou volá skoro každý test.
    const looping = solution.replace('function average(grades) {', 'function average(grades) {\n  while (true) {}');
    assert.notEqual(looping, solution);
    await replaceEditorFile(page, editor, 'script.js', looping);
    const started = Date.now();
    await brief.getByRole('button', { name: /Check|Zkontrolovat/ }).click();

    // Během kontroly aplikace dál reaguje: vlákno stránky odpovídá a přepnout se dá jinam v UI.
    for (let i = 0; i < 5; i++) {
      const before = Date.now();
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
      const lag = Date.now() - before;
      assert.ok(lag < 1000, `stránka během kontroly nereaguje (${lag} ms)`);
      await brief.locator('.brief__title').click();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    await page.locator('.result[data-kind="running"]').waitFor({ timeout: 1000 }).catch(() => {});

    const done = await checkAndWait(page, result, async () => {}, { timeout: 240000 });
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    assert.equal(done, 'fail', 'kód s nekonečnou smyčkou nemá projít');
    const errorsText = (await brief.locator('.hint__error pre').allTextContents()).join('\n');
    assert.match(errorsText, /nekonečná smyčka/, 'u nesplněného požadavku je hláška o nekonečné smyčce');
    // Živý náhled smyčku ohlásí v konzoli. Sandboxované iframy sdílejí proces, takže hláška
    // náhledu může přijít až po doběhnutí zaseknutého testu.
    await waitUntil(async () => /nekonečná smyčka/.test(await page.locator('.pane--output .console').innerText()), {
      message: 'konzole náhledu neohlásila nekonečnou smyčku',
    });
    await brief.locator('.hint[data-status="fail"] .hint__error summary').first().click();
    await shot('07b-lab-smycka');
    return `kontrola se smyčkou trvala ${seconds} s`;
  }],

  ['kvíz: špatně → nesplněno s vysvětlením, chybné znovu → splněno', async ({ page, api, baseUrl, shot }) => {
    await page.goto(`${baseUrl}/#/modul/${QUIZ}`);
    await page.locator('.quiz .question').first().waitFor();
    await page.locator('.segmented__option', { hasText: /All at once|Všechny najednou/ }).click();
    const { quiz } = await api.module(QUIZ);
    const questions = page.locator('.quiz__body .question');
    await waitUntil(async () => (await questions.count()) === quiz.questions.length, { message: 'kvíz neukázal všechny otázky' });

    for (const [index, question] of quiz.questions.entries()) await chooseAnswers(questions.nth(index), question, 'wrong');
    await page.getByRole('button', { name: /Evaluate|Vyhodnotit/ }).click();
    await page.locator('.quiz-summary--fail').waitFor();
    assert.equal(await page.locator('.quiz-summary__score').textContent(), `0 z ${quiz.questions.length}`);
    const whyTexts = await page.locator('.answer__why').evaluateAll((items) => items.filter((item) => item.textContent.trim()).length);
    assert.ok(whyTexts > 0, 'po vyhodnocení je vidět vysvětlení (why) zvolené odpovědi');
    await shot('05a-kviz-nesplneno');
    assert.equal((await api.progress()).completed[QUIZ], undefined);

    // Druhý průchod jen chybnými otázkami (B7): odpovědi se mohly zamíchat, vybíráme podle textu.
    await page.getByRole('button', { name: /Review mistakes only|Projít jen chybné/ }).click();
    await waitUntil(async () => (await questions.count()) === quiz.questions.length, { message: 'druhý průchod neukázal chybné otázky' });
    for (const [index, question] of quiz.questions.entries()) await chooseAnswers(questions.nth(index), question, 'correct');
    await page.getByRole('button', { name: /Evaluate|Vyhodnotit/ }).click();
    await page.locator('.quiz-summary--pass').waitFor();
    await waitUntil(async () => (await api.progress()).completed[QUIZ], { message: 'splněný kvíz se neuložil' });
    assert.equal((await api.progress()).scores[QUIZ], 1);
    await shot('05-kviz');
  }],

  ['nápověda: po dvou neúspěších zvýrazněná, poslední stupeň je porovnání s řešením', async ({ page, api, baseUrl, shot }) => {
    await page.goto(`${baseUrl}/#/modul/${HINT_STEP}`);
    const brief = page.locator('.pane--brief');
    const result = brief.locator('.result');
    await page.locator('.pane--editor .cm-content').waitFor();

    const helpButton = page.locator('.hint-tips__button');
    await helpButton.waitFor();
    for (let i = 0; i < 2; i++) {
      assert.equal(await checkAndWait(page, result, () => brief.getByRole('button', { name: /Check|Zkontrolovat/ }).click()), 'fail');
    }
    await waitUntil(() => helpButton.evaluate((el) => el.classList.contains('hint-tips__button--highlight')), {
      message: 'tlačítko nápovědy se po 2 neúspěších nezvýraznilo',
    });

    // Tipy po jednom (krok je nemusí mít), až nabídka porovnání s řešením.
    const compare = page.locator('.hint-tips__compare');
    for (let i = 0; i < 6 && !(await compare.isVisible()); i++) {
      if (await helpButton.isEnabled()) await helpButton.click();
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    await compare.click();
    const dialog = page.locator('dialog.solution-diff');
    await dialog.getByRole('button', { name: /Show solution|Ukázat řešení/ }).click();
    await dialog.locator('.solution-diff__file').first().waitFor();
    assert.ok((await dialog.locator('.solution-diff__line--add').count()) > 0, 'porovnání ukazuje řádky, které v kódu chybí');
    await shot('09-napoveda-porovnani');
    await dialog.getByRole('button', { name: /Close|Zavřít/ }).click();

    const attempts = await api.get(`/api/attempts?prefix=${encodeURIComponent(HINT_STEP)}`);
    const record = attempts.items[HINT_STEP];
    assert.equal(record?.fails, 2, 'pokusy mají 2 neúspěšné kontroly');
    assert.equal(record?.assisted, true, 'řešení zobrazené před splněním = assisted');
  }],

  ['opakování: splatné položky jdou projít a odpověď se uloží', async ({ page, api, baseUrl, shot }) => {
    await page.goto(`${baseUrl}/#/opakovani`);
    const item = page.locator('.reviews-item');
    await item.waitFor();
    const { quiz } = await api.module(QUIZ);

    // Splatné jsou i karty sekce, jejichž modul už je splněný (kontrakt kap. 12.3), proto víc kol.
    for (let round = 0; round < 60; round++) {
      if (!(await item.count())) break;
      const itemId = await item.getAttribute('data-id');
      const type = await item.getAttribute('data-type');
      if (type === 'step') {
        await item.locator('.cm-content').waitFor();
        await item.getByRole('button', { name: /Give up|Vzdávám/ }).click();
      } else if (type === 'question') {
        // Otázka s výběrem se nejdřív ukáže bez voleb („Odpověz v hlavě").
        const showChoices = item.getByRole('button', { name: /Show choices|Ukaž volby/ });
        if (await showChoices.count()) await showChoices.click();
        const question = quiz.questions.find((q) => itemId.endsWith(`#${q.key}`));
        assert.ok(question, `otázka ${itemId} je v kvízu`);
        await chooseAnswers(item.locator('.question'), question, 'correct');
        await item.getByRole('button', { name: /Check|Zkontrolovat/ }).click();
      } else {
        // „Už to umím" položku odebere a samo přejde na další (tlačítko Další se neukáže).
        await item.getByRole('button', { name: /Already know this, don't show|Už to umím, nezobrazovat/ }).click();
        await waitUntil(async () => !(await item.count()) || (await item.getAttribute('data-id')) !== itemId, { message: 'po „Už to umím" se neukázala další položka' });
        continue;
      }
      if (round === 0) await shot('10-opakovani');
      const next = page.getByRole('button', { name: /Next item|Další položka|Finish|Dokončit/ });
      await next.waitFor();
      await next.click();
      await waitUntil(async () => !(await item.count()) || (await item.getAttribute('data-id')) !== itemId, { message: 'další položka opakování se neukázala' });
    }
    await page.locator('.reviews__done').waitFor();
    const due = await api.get('/api/reviews/due');
    assert.ok(due.answeredToday >= 2, `dnes zodpovězené položky: ${due.answeredToday}`);
    assert.equal(due.items.length, 0, 'po průchodu nic dalšího splatného nezbylo');
  }],

  ['poznámky: poznámka z lekce se zapíše do souboru sekce', async ({ page, api, baseUrl, shot }) => {
    await page.goto(`${baseUrl}/#/modul/${LESSON}`);
    await page.locator('.live').first().waitFor();
    await page.getByRole('button', { name: /Note|Poznámka/ }).first().click();
    const drawer = page.locator('.notes-drawer').filter({ has: page.locator('#notes-drawer-text') });
    await drawer.waitFor();
    const text = 'Flex kontejner řídí jen přímé děti (e2e).';
    await drawer.locator('#notes-drawer-text').fill(text);
    await drawer.getByRole('button', { name: /Save to notes|Uložit do poznámek/ }).click();
    const section = LESSON.split('/')[0];
    await waitUntil(async () => (await api.get(`/api/notes/${section}`)).content.includes(text), { message: 'poznámka se nezapsala' });

    await page.goto(`${baseUrl}/#/poznamky/${section}`);
    await page.locator('.notes-page__main', { hasText: text }).waitFor();
    await shot('11-poznamky');
  }],

  ['tmavý režim: přepínač motivu obarví aplikaci a volba přežije načtení', async ({ page, api, baseUrl, shot }) => {
    await page.goto(`${baseUrl}/#/sekce/css-flexbox`);
    await page.locator('.module-row').first().waitFor();
    const toggle = page.locator('[data-item="theme"]');
    const choice = () => page.evaluate(() => document.documentElement.dataset.themeChoice);
    for (let i = 0; i < 3 && (await choice()) !== 'dark'; i++) await toggle.click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    await waitUntil(async () => (await api.get('/api/settings')).theme === 'dark', { message: 'motiv se neuložil' });

    await page.reload();
    await page.locator('.module-row').first().waitFor();
    const background = await page.evaluate(() => {
      const [r, g, b] = getComputedStyle(document.body).backgroundColor.match(/\d+/g).map(Number);
      return (r + g + b) / 3;
    });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', 'motiv platí i po načtení');
    assert.ok(background < 80, `pozadí v tmavém režimu je tmavé (průměr kanálů ${background})`);
    await shot('12-tmavy-rezim');

    // Zbytek průchodu ve světlém režimu (snímky jsou pak srovnatelné).
    for (let i = 0; i < 3 && (await choice()) !== 'light'; i++) await toggle.click();
    await waitUntil(async () => (await api.get('/api/settings')).theme === 'light', { message: 'světlý motiv se neuložil' });
  }],

  ['projekt: začít, řešení do složky, kontrola projde', async ({ page, baseUrl, projectsDir, shot }) => {
    await page.goto(`${baseUrl}/#/modul/${PROJECT}`);
    await page.getByRole('button', { name: /Start project|Začít projekt/ }).click();
    await page.locator('.project__created').waitFor();

    const dir = path.join(projectsDir, PROJECT.replace('/', '--'));
    assert.ok(fs.existsSync(path.join(dir, 'package.json')), 'Začít projekt zkopírovalo starter do složky');
    assert.equal(await page.locator('.copy-field__value').first().textContent(), dir);

    // Uživatel projekt dodělá ve VS Code — tady místo něj nakopírujeme referenční řešení.
    fs.cpSync(path.join(CONTENT_DIR, PROJECT, 'solution'), dir, { recursive: true, force: true });
    const stories = page.locator('.project__stories');
    const outcome = await checkAndWait(page, stories.locator('.result'), () => stories.getByRole('button', { name: /Check|Zkontrolovat/ }).click(), {
      timeout: 180000,
    });
    assert.equal(outcome, 'pass', `projekt s řešením má projít, příběhy: ${await hintStatuses(stories)}`);
    assert.ok((await hintStatuses(stories)).every((status) => status === 'pass'));
    // Celostránkový snímek by rozbil lepivou horní lištu, proto pohled na složku a příběhy.
    await page.locator('.project__folder').evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.evaluate(() => window.scrollBy(0, -70));
    await shot('06-projekt');
  }],

  ['restart serveru: postup zůstane, Pokračovat vede na poslední místo', async ({ page, api, baseUrl, restartServer, shot }) => {
    // Poslední místo: rozpracovaný krok workshopu v jiné sekci.
    await page.goto(`${baseUrl}/#/modul/${RESUME_STEP}`);
    const editor = page.locator('.pane--editor');
    await editor.locator('.cm-content').waitFor();
    await waitUntil(() => page.evaluate(() => Boolean(document.activeElement?.closest('.cm-content'))), {
      message: 'editor po otevření kroku nemá fokus',
    });
    const marker = '// rozpracováno před restartem';
    await page.keyboard.insertText(marker);
    await page.locator('.app-bar__status[data-state="saved"]').waitFor();
    const before = await api.progress();

    await restartServer();

    await page.goto(`${baseUrl}/#/`);
    await page.locator('.toc-part').first().waitFor();
    const after = await api.progress();
    assert.deepEqual(after, before, 'postup po restartu je stejný');
    const resume = page.locator('.resume__action');
    assert.match(await resume.textContent(), /Continue|Pokračovat/);
    assert.equal(await resume.getAttribute('href'), `#/modul/${RESUME_STEP}`);
    await shot('08-prehled-po-restartu');

    await resume.click();
    await page.waitForURL(new RegExp(`${RESUME_STEP}$`));
    await waitUntil(async () => (await editor.locator('.cm-content').textContent()).includes(marker), {
      message: 'rozpracovaný kód po restartu chybí',
    });

    // Splněné moduly v sekci css-flexbox: lekce a kvíz, workshop rozpracovaný.
    await page.goto(`${baseUrl}/#/sekce/css-flexbox`);
    await page.locator('.module-row').first().waitFor();
    const rows = await page.locator('.module-row').evaluateAll((items) => items.map((item) => `${item.dataset.type}:${item.dataset.done}`));
    assert.deepEqual(rows, ['lesson:true', 'workshop:false', 'lesson:false', 'lab:false', 'quiz:true']);
    const { steps: workshopSteps } = await api.module(WORKSHOP);
    assert.match(await page.locator('.module-row[data-type="workshop"]').textContent(), new RegExp(`1 z ${workshopSteps.length} kroků`));
  }],
];

/** Text odpovědi bez markdownu, jak ho ukáže UI (pro nalezení volby nezávisle na zamíchání). */
const plainAnswer = (text) => text.replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim();

/** U jedné otázky zaškrtne správné (`correct`) nebo jednu špatnou (`wrong`) odpověď podle textu volby. */
async function chooseAnswers(questionLocator, question, mode) {
  // Otázka s psanou odpovědí (kontrakt kap. 4.2): vyplní se expected, nebo zjevně špatná odpověď.
  if (question.type === 'text') {
    await questionLocator.locator('.text-answer__input').fill(mode === 'correct' ? question.expected : 'určitě špatně');
    return;
  }
  const labels = questionLocator.locator('label.answer');
  const texts = (await labels.allTextContents()).map(plainAnswer);
  const wanted = mode === 'correct' ? question.answers.filter((answer) => answer.correct) : [question.answers.find((answer) => !answer.correct)];
  for (const answer of wanted) {
    const index = texts.findIndex((text) => text === plainAnswer(answer.text) || text.endsWith(plainAnswer(answer.text)));
    assert.notEqual(index, -1, `volba „${plainAnswer(answer.text)}" není mezi ${JSON.stringify(texts)}`);
    await labels.nth(index).click();
  }
}

/**
 * Položky opakování splatné dnes (krok od seedu a otázka kvízu), aby scénář opakování měl co
 * projít. Zapisuje se před prvním startem serveru — úložiště pak čte soubor jen jednou.
 */
function seedReviews(dataDir) {
  const [quizSection, quizModule] = QUIZ.split('/');
  const question = loadModule(CONTENT_DIR, quizSection, quizModule).quiz.questions.find((q) => Array.isArray(q.answers));
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const item = { box: 1, due: today, added: now.toISOString(), reason: 'self', lastAnswered: null, history: [] };
  const items = { [`step:${REVIEW_STEP}`]: item, [`q:${QUIZ}#${question.key}`]: item };
  fs.writeFileSync(path.join(dataDir, 'opakovani.json'), `${JSON.stringify({ version: 1, items, removed: {} }, null, 2)}\n`);
}

// ---------------------------------------------------------------------------
// Běh
// ---------------------------------------------------------------------------

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akademie-e2e-'));
  const distDir = path.join(workDir, 'dist');
  const dataDir = path.join(workDir, 'data');
  const projectsDir = path.join(workDir, 'moje-projekty');
  fs.mkdirSync(dataDir);
  fs.mkdirSync(projectsDir);
  fs.mkdirSync(options.screenshots, { recursive: true });

  let server = null;
  let browser = null;
  const failures = [];
  try {
    console.log('Sestavuju klienta…');
    await buildClient(distDir);

    seedReviews(dataDir);
    const appOptions = { contentDir: CONTENT_DIR, dataDir, projectsDir, distDir };
    server = createApp(appOptions);
    const port = await listen(server, options.port);
    const baseUrl = `http://127.0.0.1:${port}`;
    console.log(`Server běží na ${baseUrl} (dočasná data v ${workDir})\n`);

    async function restartServer() {
      await closeServer(server);
      server = createApp(appOptions);
      await listen(server, port); // stejný port, ať stránka zůstane na stejné adrese
    }

    const api = {
      async get(pathname) {
        const response = await fetch(`${baseUrl}${pathname}`);
        assert.equal(response.status, 200, `GET ${pathname} vrátil ${response.status}`);
        return response.json();
      },
      module: (id, { solution = false } = {}) => api.get(`/api/module/${id}${solution ? '?solution=1' : ''}`),
      progress: () => api.get('/api/progress'),
    };

    browser = await chromium.launch({ args: BROWSER_ARGS, headless: !options.headed });
    const context = await browser.newContext({ viewport: VIEWPORT, locale: 'cs-CZ' });
    const page = await context.newPage();

    // Chyby aplikace. Chyby uživatelova kódu z náhledů a testů se nepočítají — ty běží
    // v sandboxovaných iframech (about:srcdoc, skripty jako data: URL).
    const appProblems = [];
    page.on('pageerror', (error) => {
      if (/about:srcdoc|data:text\/javascript/.test(error.stack ?? '')) return;
      appProblems.push(`nezachycená chyba: ${error.stack ?? error.message}`);
    });
    page.on('console', (message) => {
      if (message.type() === 'error' && message.location().url.startsWith(baseUrl)) {
        appProblems.push(`console.error: ${message.text()}`);
      }
    });
    page.on('response', (response) => {
      if (response.url().startsWith(`${baseUrl}/api/`) && response.status() >= 400) {
        appProblems.push(`${response.request().method()} ${response.url().slice(baseUrl.length)} → ${response.status()}`);
      }
    });

    // animations: 'disabled' — snímek nezachytí výsledek v půlce animace příchodu.
    const shot = (name) => page.screenshot({ path: path.join(options.screenshots, `${name}.png`), animations: 'disabled' });

    for (const [name, run] of scenarios) {
      const started = Date.now();
      const problemsBefore = appProblems.length;
      try {
        const note = await run({ page, api, baseUrl, shot, projectsDir, restartServer });
        const problems = appProblems.slice(problemsBefore);
        if (problems.length) throw new Error(`aplikace hlásila chyby:\n    ${problems.join('\n    ')}`);
        console.log(`✔ ${name} (${((Date.now() - started) / 1000).toFixed(1)} s)${note ? ` — ${note}` : ''}`);
      } catch (error) {
        failures.push(name);
        console.log(`✘ ${name}\n  ${String(error.stack ?? error.message).split('\n').slice(0, 6).join('\n  ')}`);
        await shot(`chyba-${failures.length}`).catch(() => {});
      }
    }
  } finally {
    await browser?.close().catch(() => {});
    if (server) await closeServer(server);
    if (options.keep) console.log(`\nDočasná data ponechána v ${workDir}`);
    else fs.rmSync(workDir, { recursive: true, force: true });
  }

  console.log(`\nSnímky obrazovky: ${path.relative(process.cwd(), options.screenshots) || '.'}`);
  if (failures.length) {
    console.log(`E2E: ${failures.length} ${failures.length === 1 ? 'scénář selhal' : 'scénáře selhaly'}.`);
    return 1;
  }
  console.log(`E2E: všech ${scenarios.length} scénářů prošlo.`);
  return 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(`E2E nešlo spustit: ${error.stack ?? error.message}`);
    process.exitCode = 1;
  },
);
