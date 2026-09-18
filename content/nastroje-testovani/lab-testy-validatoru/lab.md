---
title: Testy pro cizí kód
runtime: node
see: nastroje-testovani/proc-testovat
---

# --description--

Představ si, že jsi převzal cizí modul pro validaci uživatelských jmen, ale zjistil jsi, že občas padá na produkci nebo propouští neplatná jména.
Tvým úkolem je napsat testy v Node.js `node:test`, které odhalí chyby.

- Uživatelské jméno musí mít 3-20 znaků.
- Nesmí obsahovat mezery.
- Nesmí obsahovat zavináč.

# --hints--

Spustit testy.

```js
const result = await helpers.run('node --test test.js');
assert.ok(result.stdout.includes('tests 4'), 'Očekávám aspoň 4 testy, které zkontrolují podmínky zadání');
```

# --approaches--

## --approach-- Testování funkcí

Testy můžeš organizovat přes `describe` a `it`, nebo jen přes sérii `test`. Obě řešení jsou platná, ale `describe` blok pomůže lepšímu formátování výstupu.

### --file-- test.js

```js
const { test, describe } = require('node:test');
const assert = require('node:assert');
const { validateUsername } = require('./validator.js');

describe('validateUsername', () => {
  test('platné jméno', () => {
    assert.equal(validateUsername('karel123'), true, 'karel123 by mělo projít');
  });

  test('jméno s mezerou nesmí projít', () => {
    assert.equal(validateUsername('karel 123'), false, 'Jméno s mezerou nemá projít');
  });

  test('příliš dlouhé jméno nesmí projít', () => {
    assert.equal(validateUsername('tohlejemnohoznakuazmocdlouhe'), false, 'Dlouhé jméno nemá projít');
  });

  test('jméno se zavináčem nesmí projít', () => {
    assert.equal(validateUsername('karel@123'), false, 'Zavináč není povolen');
  });
});
```

# --seed--

## --file-- validator.js

```js
/**
 * Zvaliduje uživatelské jméno podle pravidel.
 */
function validateUsername(username) {
  if (username.length < 3) return false;
  if (username.includes('@')) return false;
  return true; // Chyba: zapomněl jsem zkontrolovat max délku a mezery
}
module.exports = { validateUsername };
```

## --file-- test.js

```js
const { test } = require('node:test');
const assert = require('node:assert');
const { validateUsername } = require('./validator.js');

// Sem napiš testy, které odhalí chyby v kódu
```

# --solution--

## --file-- validator.js

```js
function validateUsername(username) {
  if (username.length < 3 || username.length > 20) return false;
  if (username.includes(' ') || username.includes('@')) return false;
  return true;
}
module.exports = { validateUsername };
```

## --file-- test.js

```js
const { test, describe } = require('node:test');
const assert = require('node:assert');
const { validateUsername } = require('./validator.js');

describe('validateUsername', () => {
  test('platné jméno', () => {
    assert.equal(validateUsername('karel123'), true, 'karel123 by mělo projít');
  });

  test('jméno s mezerou nesmí projít', () => {
    assert.equal(validateUsername('karel 123'), false, 'Jméno s mezerou nemá projít');
  });

  test('příliš dlouhé jméno nesmí projít', () => {
    assert.equal(validateUsername('tohlejemnohoznakuazmocdlouhe'), false, 'Dlouhé jméno nemá projít');
  });

  test('jméno se zavináčem nesmí projít', () => {
    assert.equal(validateUsername('karel@123'), false, 'Zavináč není povolen');
  });
});
```

# --review--

## --rubric--
- Testy používají správně assert.equal.
