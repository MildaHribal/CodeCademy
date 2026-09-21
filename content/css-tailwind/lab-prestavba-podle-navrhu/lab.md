---
title: "Přestavba na Tailwind"
runtime: dom
see: css-tailwind/utility-first
---

# --description--

Tvá firma se rozhodla zahodit staré, neudržovatelné CSS a přejít na Tailwind CSS v4. Tvým úkolem je přepsat starý článek s profilem autora. CSS už jsme smazali.
Stránka musí vypadat tak, jak to určuje design, a navíc musí podporovat tmavý motiv.

Co musíš splnit:
- Hlavní obal musí být vycentrovaný (margin auto) s maximální šířkou 2xl.
- Nadpis článku má být velikosti 3xl a font bold.
- Karta autora dole má mít šedé pozadí `bg-gray-100`, `padding 4` a zaoblené rohy `rounded-xl`.
- V tmavém režimu (`dark:`) se má pozadí autora změnit na `bg-gray-800` a text na `text-white`.

# --hints--

Nastav elementu `main`: `max-w-2xl` a `mx-auto`.
Nastav elementu `h1`: `text-3xl` a `font-bold`.
Nastav elementu `aside`: `bg-gray-100`, `p-4`, `rounded-xl`, `dark:bg-gray-800`, `dark:text-white`.
```js
const main = document.querySelector('main');
assert.equal(main.classList.contains('mx-auto'), true, 'Main je vycentrovaný');
const h1 = document.querySelector('h1');
assert.equal(h1.classList.contains('text-3xl'), true, 'Nadpis je velký 3xl');
const aside = document.querySelector('aside');
assert.equal(aside.classList.contains('dark:bg-gray-800'), true, 'Karta autora reaguje na tmavý režim');
```

# --seed--

## --file-- index.html
```html
<main>
  <h1>Výhody přechodu na Tailwind</h1>
  <p>V tomto článku se podíváme na utility-first.</p>
  
  <aside>
    <h3>Napsal Karel</h3>
    <p>Frontend vývojář.</p>
  </aside>
</main>
```

# --solution--

## --file-- index.html
```html
<main class="max-w-2xl mx-auto p-4">
  <h1 class="text-3xl font-bold mb-4">Výhody přechodu na Tailwind</h1>
  <p class="mb-8">V tomto článku se podíváme na utility-first.</p>
  
  <aside class="bg-gray-100 p-4 rounded-xl dark:bg-gray-800 dark:text-white">
    <h3 class="font-bold">Napsal Karel</h3>
    <p>Frontend vývojář.</p>
  </aside>
</main>
```
