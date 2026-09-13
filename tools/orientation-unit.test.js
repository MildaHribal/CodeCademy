// Výpočty orientace a nastavení bez DOM: doporučená trasa, Další na trase, Pokračovat,
// motivy, šířky náhledu a sbalení kódu (client/src/extensions/orientation/, settings/logic.js).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { nextOnRoute, partHref, resumeStepId, routeIds, routeView } from '../client/src/extensions/orientation/route.js';
import { nextTheme, previewViewport, resolveTheme } from '../client/src/extensions/settings/logic.js';
import { CONTEXT_LINES, foldRanges, MIN_FOLD_LINES } from '../client/src/extensions/orientation/fold-ranges.js';

const section = (id, extra = {}) => ({ id, title: id, available: true, uroven: 'jadro', modules: [], ...extra });

const curriculum = {
  doporucenaTrasa: ['html', 'css', 'js', 'flex', 'neznama', 'css'],
  parts: [
    { id: 'web', title: 'Web', sections: [section('html'), section('css'), section('flex'), section('grid', { available: false })] },
    { id: 'js', title: 'JS', sections: [section('js'), section('pwa', { uroven: 'rozsireni' }), section('async')] },
  ],
};

describe('doporučená trasa', () => {
  test('routeIds vynechá neznámé slugy a duplicity; bez trasy platí pořadí osnovy', () => {
    assert.deepEqual(routeIds(curriculum), ['html', 'css', 'js', 'flex']);
    assert.deepEqual(routeIds({ ...curriculum, doporucenaTrasa: [] }), ['html', 'css', 'flex', 'grid', 'js', 'pwa', 'async']);
  });

  test('routeView: sekce na trase v jejím pořadí, zbytek v pořadí osnovy', () => {
    const view = routeView(curriculum);
    assert.equal(view.hasRoute, true);
    assert.deepEqual(view.onRoute.map((e) => e.section.id), ['html', 'css', 'js', 'flex']);
    assert.deepEqual(view.offRoute.map((e) => e.section.id), ['grid', 'pwa', 'async']);
    assert.equal(view.onRoute[2].part.id, 'js');
  });

  test('Další na trase: následující dostupná sekce trasy', () => {
    assert.equal(nextOnRoute(curriculum, 'css').next.id, 'js');
    assert.equal(nextOnRoute(curriculum, 'js').next.id, 'flex');
    assert.equal(nextOnRoute(curriculum, 'flex').next, null, 'na konci trasy nic');
    assert.deepEqual(nextOnRoute(curriculum, 'neexistuje'), { next: null, core: null });
  });

  test('sekce mimo trasu se vrací na trasu; rozšíření dostane i další sekci jádra', () => {
    const route = { ...curriculum, doporucenaTrasa: ['html', 'css', 'flex', 'js', 'async'] };
    const fromExtension = nextOnRoute(route, 'pwa');
    assert.equal(fromExtension.next.id, 'async');
    assert.equal(fromExtension.core, null, 'další sekce jádra je stejná jako další na trase');

    const shortRoute = { ...curriculum, doporucenaTrasa: ['html', 'css'] };
    const alone = nextOnRoute(shortRoute, 'pwa');
    assert.equal(alone.next, null);
    assert.equal(alone.core.id, 'async');
  });

  test('bez trasy se jde podle osnovy a nedostupné sekce se přeskočí', () => {
    const plain = { ...curriculum, doporucenaTrasa: [] };
    assert.equal(nextOnRoute(plain, 'flex').next.id, 'js', 'grid se připravuje, přeskočí se');
  });

  test('partHref kóduje id části', () => {
    assert.equal(partHref('web-a-css'), '#/?cast=web-a-css');
  });
});

describe('Pokračovat ve workshopu', () => {
  const steps = ['w/001', 'w/002', 'w/003', 'w/004'];
  const doneSet = (...ids) => (id) => ids.includes(id);

  test('první nesplněný krok od naposledy otevřeného', () => {
    assert.equal(resumeStepId(steps, 'w/002', doneSet('w/001', 'w/002')), 'w/003');
    assert.equal(resumeStepId(steps, 'w/002', doneSet('w/001')), 'w/002');
  });

  test('za naposledy otevřeným je vše splněné → první nesplněný od začátku', () => {
    assert.equal(resumeStepId(steps, 'w/003', doneSet('w/002', 'w/003', 'w/004')), 'w/001');
  });

  test('bez lastVisited z tohoto workshopu první nesplněný; vše splněné → naposledy otevřený', () => {
    assert.equal(resumeStepId(steps, 'jiny/modul', doneSet('w/001')), 'w/002');
    assert.equal(resumeStepId(steps, 'w/003', () => true), 'w/003');
    assert.equal(resumeStepId(steps, null, () => true), 'w/001');
    assert.equal(resumeStepId([], null, () => false), null);
  });
});

describe('nastavení: motiv a šířka náhledu', () => {
  test('motiv dokola systém → světlý → tmavý; systém rozhodne podle preference', () => {
    assert.equal(nextTheme('system'), 'light');
    assert.equal(nextTheme('light'), 'dark');
    assert.equal(nextTheme('dark'), 'system');
    assert.equal(resolveTheme('system', true), 'dark');
    assert.equal(resolveTheme('system', false), 'light');
    assert.equal(resolveTheme('light', true), 'light');
  });

  test('šířka náhledu podle kontraktu kap. 6.7', () => {
    assert.deepEqual(previewViewport('tests'), { width: 1024, height: 768 });
    assert.deepEqual(previewViewport('768'), { width: 768, height: 1024 });
    assert.deepEqual(previewViewport('375'), { width: 375, height: 667 });
    assert.equal(previewViewport('panel'), null);
  });
});

describe('sbalení kódu mimo --edit--', () => {
  test('dlouhý kód před i za oblastí se sbalí, u oblasti zůstanou řádky kontextu', () => {
    // oblast na řádcích 20–22 v souboru se 40 řádky
    assert.deepEqual(foldRanges({ start: 20, end: 22 }, 40), [
      { fromLine: 1, toLine: 19 - CONTEXT_LINES },
      { fromLine: 23 + CONTEXT_LINES, toLine: 40 },
    ]);
  });

  test('krátké úseky se nesbalují; prázdná oblast (end = start - 1)', () => {
    assert.deepEqual(foldRanges({ start: 5, end: 6 }, 10), []);
    const empty = foldRanges({ start: 30, end: 29 }, 31);
    assert.deepEqual(empty, [{ fromLine: 1, toLine: 29 - CONTEXT_LINES }]);
    assert.ok(MIN_FOLD_LINES >= 4);
  });
});
