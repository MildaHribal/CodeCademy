- **node:test**: Vestavěný modul v Node.js pro spouštění unit testů (`test()`, `mock()`).
- **MSW**: Mock Service Worker, nástroj pro zachytávání síťových požadavků na úrovni prohlížeče nebo Node.js procesů.
- **Playwright**: Nástroj pro E2E testování s lokátory inspirovanými přístupností (`getByRole()`).

## Časté vzory
### Falešný časovač
```js
const { test, mock } = require('node:test');
mock.timers.enable({ apis: ['setTimeout'] });
mock.timers.tick(1000);
```

### Playwright lokátor podle role
```js
await page.getByRole('button', { name: 'Odeslat' }).click();
```

## Pasti
- Testování implementačních detailů (křehké testy).
- Použití nespolehlivých CSS selektorů (např. `#submit-btn`) místo rolí (`getByRole('button')`) v E2E testech.
