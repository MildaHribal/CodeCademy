---
title: "Kontaktní formulář"
runtime: dom
see: html-formulare/validace-v-prohlizeci#zakladni-validacni-atributy
---

# --description--
Tvým úkolem je sestavit funkční, přístupný kontaktní formulář se základní validací v prohlížeči. Formulář se bude odesílat metodou POST na adresu `/kontakt/odeslat`. 

Musí obsahovat jméno, e-mail a zprávu. Jméno a e-mail jsou povinné.

# --hints--
1. Formulář má správně nastavenou metodu a cíl.
2. Jméno je povinné a má popisek spojený s polem.
3. E-mail musí mít správný formát (typ email) a je povinný.
4. Zpráva (`textarea`) má popisek.
5. Formulář obsahuje odesílací tlačítko.

```js
const form = document.querySelector('form');
assert.ok(form, 'Stránka musí mít formulář');
assert.equal(form.method.toUpperCase(), 'POST', 'Metoda musí být POST');
assert.equal(form.getAttribute('action'), '/kontakt/odeslat', 'Adresa odeslání musí souhlasit');

const nameInput = document.querySelector('input[name="jmeno"]');
assert.ok(nameInput, 'Musí existovat pole s name="jmeno"');
assert.ok(nameInput.required, 'Pole jméno musí být required');
assert.ok(document.querySelector(`label[for="${nameInput.id}"]`), 'Jméno musí mít label spárovaný přes for/id');

const emailInput = document.querySelector('input[name="email"]');
assert.ok(emailInput, 'Musí existovat pole s name="email"');
assert.equal(emailInput.type, 'email', 'E-mail musí mít type="email"');

const textarea = document.querySelector('textarea[name="zprava"]');
assert.ok(textarea, 'Musí existovat pole s name="zprava" (textarea)');
assert.ok(document.querySelector(`label[for="${textarea.id}"]`), 'Zpráva musí mít správný label');
```


# --seed--
## --file-- index.html
```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Napište nám</title>
</head>
<body>
  <h1>Kontaktujte nás</h1>
  
  <!-- Napiš kód sem -->
  
</body>
</html>
```

# --solution--
## --file-- index.html
```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Napište nám</title>
</head>
<body>
  <h1>Kontaktujte nás</h1>
  
  <form action="/kontakt/odeslat" method="POST">
    <div>
      <label for="jmeno">Jméno:</label>
      <input type="text" id="jmeno" name="jmeno" required>
    </div>
    
    <div>
      <label for="email">E-mail:</label>
      <input type="email" id="email" name="email" required>
    </div>
    
    <div>
      <label for="zprava">Vaše zpráva:</label>
      <textarea id="zprava" name="zprava"></textarea>
    </div>
    
    <button>Odeslat zprávu</button>
  </form>
  
</body>
</html>
```
