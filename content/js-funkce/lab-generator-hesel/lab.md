---
title: Generátor a kontrola hesel
runtime: js
---

# --description--

Tvým úkolem je vytvořit nástroje pro práci s hesly: generátor náhodných hesel a funkci pro kontrolu jejich síly. Budeš k tomu potřebovat napsat několik vlastních funkcí.

V souboru `script.js` máš připravenou kostru. Tvým úkolem je doplnit implementace následujících funkcí:

- `generatePassword(length)`: Vrátí náhodně vygenerované heslo zadané délky. Pokud není délka zadána, nebo je menší než 8, použije výchozí délku 8.
- `checkPasswordStrength(password)`: Ohodnotí sílu hesla a vrátí jeden z textů: `'weak'`, `'medium'`, `'strong'`. 
  - `'weak'`: heslo je kratší než 8 znaků.
  - `'strong'`: heslo má alespoň 8 znaků a obsahuje alespoň 1 číslo a 1 velké písmeno.
  - `'medium'`: ostatní případy (aspoň 8 znaků, ale chybí číslo nebo velké písmeno).

Při řešení nezapomeň, že heslo by mělo obsahovat malá a velká písmena, čísla a speciální znaky, pokud je dostatečně dlouhé a náhodné (využij proměnnou `chars`).

# --hints--

`generatePassword(length)` vrátí řetězec zadané délky. Pokud není zadána, použije délku 8. Pokud je zadána kratší než 8, použije 8.

```js
assert.equal(generatePassword(10).length, 10, 'generatePassword(10) má vrátit heslo dlouhé 10 znaků');
assert.equal(generatePassword().length, 8, 'generatePassword() má vrátit heslo dlouhé 8 znaků');
assert.equal(generatePassword(5).length, 8, 'generatePassword(5) má vrátit heslo dlouhé 8 znaků');
```

`generatePassword` nesmí vrátit vždy stejné heslo (generuje náhodně).

```js
const pass1 = generatePassword(10);
const pass2 = generatePassword(10);
assert.notEqual(pass1, pass2, 'generatePassword by mělo vracet náhodná hesla');
```

`checkPasswordStrength(password)` správně ohodnotí sílu hesla podle zadaných pravidel.

```js
assert.equal(checkPasswordStrength('heslo'), 'weak', 'heslo kratší než 8 znaků je weak');
assert.equal(checkPasswordStrength('dlouheheslo'), 'medium', 'dlouhé heslo bez čísel a velkých písmen je medium');
assert.equal(checkPasswordStrength('Heslo1234'), 'strong', 'dlouhé heslo s velkým písmenem a číslem je strong');
```

# --seed--

## --file-- script.js

```js
const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

// Zde napiš funkce generatePassword a checkPasswordStrength

```

# --solution--

## --file-- script.js

```js
const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

function generatePassword(length = 8) {
  const actualLength = length < 8 ? 8 : length;
  let password = '';
  for (let i = 0; i < actualLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}

function checkPasswordStrength(password) {
  if (password.length < 8) return 'weak';
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (hasUppercase && hasNumber) return 'strong';
  return 'medium';
}
```

# --approaches--

## --approach-- Vlastní pomocné funkce

Místo regulárních výrazů můžeš sílu hesla zjišťovat přes pomocné funkce, které projdou znaky v cyklu. Je to delší zápis, ale nevyžaduje znalost regulárních výrazů.

### --file-- script.js

```js
const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

function generatePassword(length = 8) {
  const actualLength = length < 8 ? 8 : length;
  let password = '';
  for (let i = 0; i < actualLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}

function hasUppercase(str) {
  for (let i = 0; i < str.length; i++) {
    if (str[i] >= 'A' && str[i] <= 'Z') return true;
  }
  return false;
}

function hasNumber(str) {
  for (let i = 0; i < str.length; i++) {
    if (str[i] >= '0' && str[i] <= '9') return true;
  }
  return false;
}

function checkPasswordStrength(password) {
  if (password.length < 8) return 'weak';
  if (hasUppercase(password) && hasNumber(password)) return 'strong';
  return 'medium';
}
```

# --review--

## --rubric--

- Funkce `generatePassword` používá defaultní parametr pro délku.
- Podmínky pro zjištění síly hesla jsou srozumitelné a snadno čitelné.
