---
title: Kvízová aplikace
see: js-dom/workshop-seznam-ukolu/008, js-dom/udalosti#delegace-jeden-posluchac-pro-cely-seznam
---

# --description--

Kvíz na pět minut najdeš na zpravodajských webech, v e-learningu i jako „zjisti, jaký typ kávy jsi" v e-shopu. Postav vlastní: otázky jsou jen data v poli `questions` v `script.js` a všechno ostatní z nich vykreslí tvůj kód. HTML kostra a vzhled jsou hotové, JavaScript píšeš celý sám.

**Téma, otázky, texty a vzhled jsou tvoje volba.** Ukázkové otázky o Česku klidně nahraď čímkoli, co tě baví — jen zachovej tvar dat: `text`, pole `answers` a index správné odpovědi `correct`, aspoň tři otázky a u každé aspoň dvě odpovědi. Testy si správné odpovědi čtou z tvých dat.

**Co má kvíz umět:**

- Po načtení je vidět první otázka: text v `#question`, každá odpověď jako tlačítko v `#answers` ve stejném pořadí jako v datech a v `#progress` text ve tvaru `Otázka 1 z 5`.
- Když uživatel vybere odpověď, všechna tlačítka odpovědí se zablokují, správná odpověď dostane atribut `data-state="correct"` a špatně vybraná `data-state="wrong"`. `#feedback` oznámí výsledek textem.
- Za správnou odpověď přibude bod v `#score`.
- Tlačítko `#next` je neaktivní, dokud uživatel neodpoví. Po odpovědi se na něj přesune fokus, aby šlo pokračovat klávesou Enter.
- `#next` ukáže další otázku (s vyčištěným `#feedback`) a přesune fokus na její první odpověď.
- Po poslední otázce `#next` kvíz (`#quiz`) skryje a ukáže výsledek `#result` se skóre ve tvaru `3 z 5` v `#result-score`.
- **Hrát znovu** (`#restart`) začne od první otázky s nulovým skóre a přesune fokus na první odpověď.
- Klávesa `1`, `2`, `3`… vybere odpovídající odpověď, dokud na otázku nikdo neodpověděl. Klávesy mimo počet odpovědí a zkratky s Ctrl, Cmd nebo Alt nic nedělají.
- Kvíz funguje pro libovolný počet otázek i odpovědí a texty z dat vkládá jako text.

> [!TIP]
> Nejdřív si ujasni, jaký stav kvíz potřebuje (kde uživatel je, kolik má bodů, jestli už odpověděl), a teprve pak piš posluchače.

# --hints--

Po načtení je vidět první otázka a průběh `Otázka 1 z N`.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
assert.equal(document.querySelector('#question').textContent.trim(), questions[0].text, '#question má po načtení obsahovat text první otázky z questions');
assert.equal(document.querySelector('#progress').textContent.trim(), `Otázka 1 z ${questions.length}`, `#progress má po načtení ukazovat „Otázka 1 z ${questions.length}"`);
```

Odpovědi první otázky jsou tlačítka v `#answers` ve stejném pořadí jako v datech.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
const buttons = answerButtons();
assert.equal(buttons.length, questions[0].answers.length, `v #answers má být ${questions[0].answers.length} tlačítek, je jich ${buttons.length}`);
questions[0].answers.forEach((answer, index) => {
  assert.ok(buttons[index].textContent.includes(answer), `${index + 1}. tlačítko má obsahovat odpověď „${answer}"`);
});
```

Správná odpověď dostane `data-state="correct"`, přidá bod, zablokuje tlačítka a ohlásí výsledek.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
const question = questions[0];
await helpers.click(answerButtons()[question.correct]);
const buttons = answerButtons();
assert.equal(buttons[question.correct].dataset.state, 'correct', 'vybraná správná odpověď má mít data-state="correct"');
assert.ok(buttons.every((button) => button.disabled), 'po odpovědi mají být všechna tlačítka odpovědí disabled');
assert.equal(document.querySelector('#score').textContent.trim(), '1', 'po správné odpovědi má #score ukazovat 1');
assert.notEqual(document.querySelector('#feedback').textContent.trim(), '', '#feedback má po odpovědi oznámit výsledek');
```

Špatná odpověď dostane `data-state="wrong"`, správná se ukáže a bod nepřibude.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
const question = questions[0];
const wrong = wrongIndex(question);
await helpers.click(answerButtons()[wrong]);
const buttons = answerButtons();
assert.equal(buttons[wrong].dataset.state, 'wrong', 'vybraná špatná odpověď má mít data-state="wrong"');
assert.equal(buttons[question.correct].dataset.state, 'correct', 'správná odpověď se má po špatné volbě označit data-state="correct"');
assert.equal(document.querySelector('#score').textContent.trim(), '0', 'po špatné odpovědi má #score zůstat 0');
assert.notEqual(document.querySelector('#feedback').textContent.trim(), '', '#feedback má oznámit i špatnou odpověď');
```

`#next` je neaktivní, dokud uživatel neodpoví; po odpovědi je aktivní a má fokus.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
const next = document.querySelector('#next');
assert.equal(next.disabled, true, 'před odpovědí má být #next disabled');
await helpers.click(answerButtons()[questions[0].correct]);
assert.equal(next.disabled, false, 'po odpovědi má být #next aktivní');
assert.equal(document.activeElement, next, 'po odpovědi má být fokus na #next');
```

`#next` ukáže druhou otázku s novými odpověďmi, vyčistí hlášku a dá fokus první odpovědi.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
await helpers.click(answerButtons()[questions[0].correct]);
await helpers.click(document.querySelector('#next'));
assert.equal(document.querySelector('#question').textContent.trim(), questions[1].text, 'po #next má #question ukazovat druhou otázku');
assert.equal(document.querySelector('#progress').textContent.trim(), `Otázka 2 z ${questions.length}`, `#progress má ukazovat „Otázka 2 z ${questions.length}"`);
const buttons = answerButtons();
assert.equal(buttons.length, questions[1].answers.length, 'v #answers mají být odpovědi druhé otázky');
assert.ok(buttons.every((button) => !button.disabled && !button.dataset.state), 'odpovědi nové otázky mají být aktivní a bez data-state');
assert.equal(document.querySelector('#feedback').textContent.trim(), '', '#feedback má být u nové otázky prázdný');
assert.equal(document.querySelector('#next').disabled, true, 'u nové otázky má být #next zase disabled');
assert.equal(document.activeElement, buttons[0], 'fokus má být na první odpovědi nové otázky');
```

Klávesa s číslem vybere odpověď; další klávesy po odpovědi nic nezmění.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
const question = questions[0];
const wrong = wrongIndex(question);
helpers.press(document.body, String(wrong + 1));
assert.equal(answerButtons()[wrong].dataset.state, 'wrong', `klávesa ${wrong + 1} má vybrat ${wrong + 1}. odpověď`);
helpers.press(document.body, String(question.correct + 1));
assert.equal(document.querySelector('#score').textContent.trim(), '0', 'po odpovědi už další klávesa nemá odpověď změnit ani přidat bod');
```

Klávesy mimo počet odpovědí a zkratky s Ctrl, Cmd nebo Alt nic nevyberou.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
const count = questions[0].answers.length;
helpers.press(document.body, String(count + 1));
helpers.press(document.body, '0');
helpers.press(document.body, ' ');
for (const modifier of ['ctrlKey', 'metaKey', 'altKey']) {
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '1', [modifier]: true, bubbles: true }));
}
assert.ok(answerButtons().every((button) => !button.disabled && !button.dataset.state), `klávesy ${count + 1}, 0, mezerník ani Ctrl/Cmd/Alt+1 nemají vybrat odpověď`);
assert.equal(errors.length, 0, 'klávesy nemají vyhodit chybu: ' + errors.join('; '));
```

Po poslední otázce `#next` skryje kvíz a ukáže výsledek se skóre `X z N`.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
for (let i = 0; i < questions.length; i++) {
  const index = i === 0 ? wrongIndex(questions[i]) : questions[i].correct;
  await helpers.click(answerButtons()[index]);
  await helpers.click(document.querySelector('#next'));
}
assert.equal(document.querySelector('#quiz').hidden, true, 'po poslední otázce má být #quiz skrytý (hidden)');
assert.equal(document.querySelector('#result').hidden, false, 'po poslední otázce má být #result vidět');
assert.equal(document.querySelector('#result-score').textContent.trim(), `${questions.length - 1} z ${questions.length}`, `po jedné chybě má #result-score ukazovat „${questions.length - 1} z ${questions.length}"`);
```

**Hrát znovu** začne od první otázky s nulovým skóre a fokusem na první odpovědi.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
for (const question of questions) {
  await helpers.click(answerButtons()[question.correct]);
  await helpers.click(document.querySelector('#next'));
}
await helpers.click(document.querySelector('#restart'));
assert.equal(document.querySelector('#result').hidden, true, 'po Hrát znovu má být #result skrytý');
assert.equal(document.querySelector('#quiz').hidden, false, 'po Hrát znovu má být #quiz vidět');
assert.equal(document.querySelector('#question').textContent.trim(), questions[0].text, 'po Hrát znovu má být vidět první otázka');
assert.equal(document.querySelector('#score').textContent.trim(), '0', 'po Hrát znovu má #score ukazovat 0');
assert.equal(document.activeElement, answerButtons()[0], 'po Hrát znovu má být fokus na první odpovědi');
```

Kvíz pracuje s daty: jiný počet otázek a odpovědí funguje bez změny kódu.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
questions.splice(0, questions.length,
  { text: 'Kolik nohou má pavouk?', answers: ['6', '8', '10', '12'], correct: 1 },
  { text: 'Je rajče ovoce?', answers: ['Ano', 'Ne'], correct: 0 },
);
document.querySelector('#restart').click();
assert.equal(document.querySelector('#progress').textContent.trim(), 'Otázka 1 z 2', 'po změně questions na dvě otázky a Hrát znovu má #progress ukazovat „Otázka 1 z 2"');
assert.equal(answerButtons().length, 4, 'první otázka má teď čtyři odpovědi');
await helpers.click(answerButtons()[3]);
await helpers.click(document.querySelector('#next'));
assert.equal(answerButtons().length, 2, 'druhá otázka má dvě odpovědi');
await helpers.click(answerButtons()[0]);
await helpers.click(document.querySelector('#next'));
assert.equal(document.querySelector('#result-score').textContent.trim(), '1 z 2', 'po jedné správné ze dvou má být výsledek „1 z 2"');
```

Texty otázek a odpovědí se vkládají jako text, značky v nich se nespustí.

```js
const answerButtons = () => [...document.querySelectorAll('#answers button')];
const wrongIndex = (question) => (question.correct === 0 ? 1 : 0);
questions.splice(0, questions.length,
  { text: 'Co udělá <img src="x" onerror="document.title = \'hack\'">?', answers: ['<b>nic</b>', 'spustí kód'], correct: 0 },
  { text: 'Druhá otázka', answers: ['A', 'B'], correct: 1 },
  { text: 'Třetí otázka', answers: ['A', 'B'], correct: 0 },
);
document.querySelector('#restart').click();
assert.equal(document.querySelector('#question img'), null, 'z textu otázky nesmí vzniknout element <img>');
assert.equal(document.querySelector('#answers b'), null, 'z textu odpovědi nesmí vzniknout element <b>');
assert.ok(document.querySelector('#question').textContent.includes('<img'), 'text otázky má být vidět i se značkou');
```

# --help--

## --tip-- 6

Posun na další otázku je změna stavu (index aktuální otázky) a nové vykreslení — stejný vzor „změň data, pak vykresli" jako v [seznamu úkolů](see:js-dom/workshop-seznam-ukolu/008). Tlačítka staré otázky nahraď, nepřidávej.

## --tip-- 7

Jeden posluchač `keydown` na `document` a převod klávesy na index odpovědi. `Number(' ')` je `0` a `Number('x')` je `NaN`, takže bez ověření by index vyšel `-1` nebo `NaN`. Hlídej, aby ležel mezi nulou a počtem odpovědí.

# --seed--

## --file-- index.html

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kvíz — Jak dobře znáš Česko?</title>
    <link rel="stylesheet" href="styles.css">
    <script src="script.js" defer></script>
  </head>
  <body>
    <main class="app">
      <header class="app__header">
        <p class="app__eyebrow">Kvíz na pět minut</p>
        <h1>Jak dobře znáš Česko?</h1>
      </header>

      <section class="quiz" id="quiz" aria-labelledby="question">
        <div class="quiz__top">
          <p class="quiz__progress" id="progress">Otázka – z –</p>
          <p class="quiz__score">Body: <strong id="score">0</strong></p>
        </div>
        <h2 class="quiz__question" id="question"></h2>
        <div class="quiz__answers" id="answers"></div>
        <p class="quiz__feedback" id="feedback" role="status"></p>
        <button class="button" type="button" id="next" disabled>Další otázka</button>
      </section>

      <section class="result" id="result" tabindex="-1" hidden>
        <h2>Hotovo</h2>
        <p class="result__score">Tvoje skóre: <strong id="result-score"></strong></p>
        <button class="button" type="button" id="restart">Hrát znovu</button>
      </section>

      <p class="app__hint">Odpověď vybereš i klávesou 1, 2, 3…</p>
    </main>
  </body>
</html>
```

## --file-- styles.css

```css
:root {
  --bg: #1b1633;
  --card: #262046;
  --ink: #f5f3ff;
  --muted: #b7b0d9;
  --accent: #f7b733;
  --correct: #2fbf71;
  --wrong: #ef5d60;
  --radius: 0.9rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

[hidden] {
  display: none !important;
}

body {
  margin: 0;
  min-height: 100vh;
  background: radial-gradient(circle at 20% 0%, #3b2d7a, var(--bg) 60%);
  color: var(--ink);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
}

.app {
  width: min(100% - 2rem, 38rem);
  margin: 3rem auto;
}

.app__eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

h1 {
  margin: 0.25rem 0 1.5rem;
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  line-height: 1.1;
}

.quiz,
.result {
  display: grid;
  gap: 1rem;
  padding: 1.75rem;
  background: var(--card);
  border-radius: 1.25rem;
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.3);
}

.quiz__top {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
}

.quiz__top p {
  margin: 0;
}

.quiz__question {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.3;
}

.quiz__answers {
  display: grid;
  gap: 0.6rem;
}

/* Tlačítka odpovědí: vytvoří je tvůj kód. Stav ukazuje atribut data-state. */
.quiz__answers button {
  padding: 0.85rem 1rem;
  border: 2px solid #4a4180;
  border-radius: var(--radius);
  background: #2f2858;
  color: var(--ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s, translate 0.2s;
}

.quiz__answers button:hover:not(:disabled) {
  border-color: var(--accent);
  translate: 4px 0;
}

.quiz__answers button:disabled {
  cursor: default;
  opacity: 0.75;
}

.quiz__answers button[data-state="correct"] {
  border-color: var(--correct);
  background: rgb(47 191 113 / 0.2);
  opacity: 1;
}

.quiz__answers button[data-state="wrong"] {
  border-color: var(--wrong);
  background: rgb(239 93 96 / 0.2);
  opacity: 1;
}

.quiz__feedback {
  min-height: 1.5em;
  margin: 0;
  font-weight: 600;
}

.button {
  justify-self: start;
  padding: 0.75rem 1.3rem;
  border: 0;
  border-radius: var(--radius);
  background: var(--accent);
  color: #1b1633;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, translate 0.2s;
}

.button:hover:not(:disabled) {
  translate: 0 -2px;
}

.button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

:is(button):focus-visible,
.result:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.result h2 {
  margin: 0;
}

.result__score {
  margin: 0;
  font-size: 1.3rem;
}

.app__hint {
  color: var(--muted);
  font-size: 0.9rem;
  text-align: center;
}
```

## --file-- script.js

```js
// Otázky kvízu. text = otázka, answers = odpovědi v pořadí, correct = index správné odpovědi.
// Téma i otázky klidně změň, jen zachovej tvar dat (aspoň tři otázky, každá aspoň dvě odpovědi).
const questions = [
  { text: 'Která hora je nejvyšší v Česku?', answers: ['Praděd', 'Sněžka', 'Lysá hora'], correct: 1 },
  { text: 'Kolik krajů má Česko, když počítáš i Prahu?', answers: ['13', '14', '12'], correct: 1 },
  { text: 'Která řeka protéká Brnem?', answers: ['Svratka', 'Morava', 'Odra'], correct: 0 },
  { text: 'Ve kterém roce vzniklo samostatné Československo?', answers: ['1918', '1945', '1993'], correct: 0 },
  { text: 'Která řeka je nejdelší na území Česka?', answers: ['Labe', 'Vltava', 'Morava'], correct: 1 },
];

// Tvůj kód:
```

# --solution--

## --file-- script.js

```js
// Otázky kvízu. text = otázka, answers = odpovědi v pořadí, correct = index správné odpovědi.
// Téma i otázky klidně změň, jen zachovej tvar dat (aspoň tři otázky, každá aspoň dvě odpovědi).
const questions = [
  { text: 'Která hora je nejvyšší v Česku?', answers: ['Praděd', 'Sněžka', 'Lysá hora'], correct: 1 },
  { text: 'Kolik krajů má Česko, když počítáš i Prahu?', answers: ['13', '14', '12'], correct: 1 },
  { text: 'Která řeka protéká Brnem?', answers: ['Svratka', 'Morava', 'Odra'], correct: 0 },
  { text: 'Ve kterém roce vzniklo samostatné Československo?', answers: ['1918', '1945', '1993'], correct: 0 },
  { text: 'Která řeka je nejdelší na území Česka?', answers: ['Labe', 'Vltava', 'Morava'], correct: 1 },
];

// Tvůj kód:

const quiz = document.querySelector('#quiz');
const result = document.querySelector('#result');
const answersBox = document.querySelector('#answers');
const nextButton = document.querySelector('#next');

let current = 0;
let score = 0;
let answered = false;

function renderQuestion() {
  const question = questions[current];
  answered = false;
  document.querySelector('#progress').textContent = `Otázka ${current + 1} z ${questions.length}`;
  document.querySelector('#question').textContent = question.text;
  document.querySelector('#score').textContent = score;
  document.querySelector('#feedback').textContent = '';
  answersBox.replaceChildren(...question.answers.map((answer, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.index = index;
    button.textContent = `${index + 1}. ${answer}`;
    return button;
  }));
  nextButton.disabled = true;
  nextButton.textContent = current === questions.length - 1 ? 'Zobrazit výsledek' : 'Další otázka';
}

function choose(index) {
  if (answered) return;
  answered = true;
  const question = questions[current];
  const isCorrect = index === question.correct;
  if (isCorrect) score += 1;
  answersBox.querySelectorAll('button').forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === question.correct) button.dataset.state = 'correct';
    else if (buttonIndex === index) button.dataset.state = 'wrong';
  });
  document.querySelector('#score').textContent = score;
  document.querySelector('#feedback').textContent = isCorrect
    ? 'Správně.'
    : `Vedle. Správná odpověď je ${question.answers[question.correct]}.`;
  nextButton.disabled = false;
  nextButton.focus();
}

function showResult() {
  quiz.hidden = true;
  result.hidden = false;
  document.querySelector('#result-score').textContent = `${score} z ${questions.length}`;
  result.focus();
}

function start() {
  current = 0;
  score = 0;
  result.hidden = true;
  quiz.hidden = false;
  renderQuestion();
}

answersBox.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  choose(Number(button.dataset.index));
});

nextButton.addEventListener('click', () => {
  if (current === questions.length - 1) {
    showResult();
    return;
  }
  current += 1;
  renderQuestion();
  answersBox.querySelector('button').focus();
});

document.querySelector('#restart').addEventListener('click', () => {
  start();
  answersBox.querySelector('button').focus();
});

document.addEventListener('keydown', (event) => {
  if (quiz.hidden || answered || event.ctrlKey || event.metaKey || event.altKey) return;
  const index = Number(event.key) - 1;
  if (Number.isInteger(index) && index >= 0 && index < questions[current].answers.length) {
    choose(index);
  }
});

start();
```

# --approaches--

## --approach-- Proměnné a vykreslení otázky

Tři proměnné (`current`, `score`, `answered`) a funkce, které stránku mění po krocích: vykreslit otázku, vyhodnotit odpověď, ukázat výsledek. Kód čte shora dolů stejně, jak kvíz probíhá, a hodí se, když obrazovky mají málo společného.

### --file-- script.js

```js
// Otázky kvízu. text = otázka, answers = odpovědi v pořadí, correct = index správné odpovědi.
// Téma i otázky klidně změň, jen zachovej tvar dat (aspoň tři otázky, každá aspoň dvě odpovědi).
const questions = [
  { text: 'Která hora je nejvyšší v Česku?', answers: ['Praděd', 'Sněžka', 'Lysá hora'], correct: 1 },
  { text: 'Kolik krajů má Česko, když počítáš i Prahu?', answers: ['13', '14', '12'], correct: 1 },
  { text: 'Která řeka protéká Brnem?', answers: ['Svratka', 'Morava', 'Odra'], correct: 0 },
  { text: 'Ve kterém roce vzniklo samostatné Československo?', answers: ['1918', '1945', '1993'], correct: 0 },
  { text: 'Která řeka je nejdelší na území Česka?', answers: ['Labe', 'Vltava', 'Morava'], correct: 1 },
];

// Tvůj kód:

const quiz = document.querySelector('#quiz');
const result = document.querySelector('#result');
const answersBox = document.querySelector('#answers');
const nextButton = document.querySelector('#next');

let current = 0;
let score = 0;
let answered = false;

function renderQuestion() {
  const question = questions[current];
  answered = false;
  document.querySelector('#progress').textContent = `Otázka ${current + 1} z ${questions.length}`;
  document.querySelector('#question').textContent = question.text;
  document.querySelector('#score').textContent = score;
  document.querySelector('#feedback').textContent = '';
  answersBox.replaceChildren(...question.answers.map((answer, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.index = index;
    button.textContent = `${index + 1}. ${answer}`;
    return button;
  }));
  nextButton.disabled = true;
  nextButton.textContent = current === questions.length - 1 ? 'Zobrazit výsledek' : 'Další otázka';
}

function choose(index) {
  if (answered) return;
  answered = true;
  const question = questions[current];
  const isCorrect = index === question.correct;
  if (isCorrect) score += 1;
  answersBox.querySelectorAll('button').forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === question.correct) button.dataset.state = 'correct';
    else if (buttonIndex === index) button.dataset.state = 'wrong';
  });
  document.querySelector('#score').textContent = score;
  document.querySelector('#feedback').textContent = isCorrect
    ? 'Správně.'
    : `Vedle. Správná odpověď je ${question.answers[question.correct]}.`;
  nextButton.disabled = false;
  nextButton.focus();
}

function showResult() {
  quiz.hidden = true;
  result.hidden = false;
  document.querySelector('#result-score').textContent = `${score} z ${questions.length}`;
  result.focus();
}

function start() {
  current = 0;
  score = 0;
  result.hidden = true;
  quiz.hidden = false;
  renderQuestion();
}

answersBox.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  choose(Number(button.dataset.index));
});

nextButton.addEventListener('click', () => {
  if (current === questions.length - 1) {
    showResult();
    return;
  }
  current += 1;
  renderQuestion();
  answersBox.querySelector('button').focus();
});

document.querySelector('#restart').addEventListener('click', () => {
  start();
  answersBox.querySelector('button').focus();
});

document.addEventListener('keydown', (event) => {
  if (quiz.hidden || answered || event.ctrlKey || event.metaKey || event.altKey) return;
  const index = Number(event.key) - 1;
  if (Number.isInteger(index) && index >= 0 && index < questions[current].answers.length) {
    choose(index);
  }
});

start();
```

## --approach-- Jeden stav a jedna funkce render

Celý kvíz je jeden objekt `state` a `render()` z něj pokaždé postaví celou obrazovku včetně výsledku. Akce jen mění stav a volají `render()`. Víc se vykresluje, ale obrazovka nikdy neukáže nic, co ve stavu není — tak přemýšlí React, ke kterému se dostaneš.

### --file-- script.js

```js
// Otázky kvízu. text = otázka, answers = odpovědi v pořadí, correct = index správné odpovědi.
// Téma i otázky klidně změň, jen zachovej tvar dat (aspoň tři otázky, každá aspoň dvě odpovědi).
const questions = [
  { text: 'Která hora je nejvyšší v Česku?', answers: ['Praděd', 'Sněžka', 'Lysá hora'], correct: 1 },
  { text: 'Kolik krajů má Česko, když počítáš i Prahu?', answers: ['13', '14', '12'], correct: 1 },
  { text: 'Která řeka protéká Brnem?', answers: ['Svratka', 'Morava', 'Odra'], correct: 0 },
  { text: 'Ve kterém roce vzniklo samostatné Československo?', answers: ['1918', '1945', '1993'], correct: 0 },
  { text: 'Která řeka je nejdelší na území Česka?', answers: ['Labe', 'Vltava', 'Morava'], correct: 1 },
];

// Tvůj kód:

// Celý kvíz je jeden stav a jedna funkce render(), která z něj postaví obrazovku.
const state = { current: 0, score: 0, chosen: null, finished: false };

const quiz = document.querySelector('#quiz');
const result = document.querySelector('#result');
const answersBox = document.querySelector('#answers');
const nextButton = document.querySelector('#next');

function render() {
  quiz.hidden = state.finished;
  result.hidden = !state.finished;
  if (state.finished) {
    document.querySelector('#result-score').textContent = `${state.score} z ${questions.length}`;
    return;
  }
  const question = questions[state.current];
  const answered = state.chosen !== null;
  document.querySelector('#progress').textContent = `Otázka ${state.current + 1} z ${questions.length}`;
  document.querySelector('#question').textContent = question.text;
  document.querySelector('#score').textContent = state.score;
  const buttons = question.answers.map((answer, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.index = index;
    button.textContent = answer;
    button.disabled = answered;
    if (answered && index === question.correct) button.dataset.state = 'correct';
    if (answered && index === state.chosen && index !== question.correct) button.dataset.state = 'wrong';
    return button;
  });
  answersBox.replaceChildren(...buttons);
  let feedback = '';
  if (answered) feedback = state.chosen === question.correct ? 'Přesně tak.' : `Kdepak, správně je ${question.answers[question.correct]}.`;
  document.querySelector('#feedback').textContent = feedback;
  nextButton.disabled = !answered;
}

function choose(index) {
  if (state.chosen !== null || state.finished) return;
  state.chosen = index;
  if (index === questions[state.current].correct) state.score += 1;
  render();
  nextButton.focus();
}

answersBox.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-index]');
  if (button) choose(Number(button.dataset.index));
});

nextButton.addEventListener('click', () => {
  if (state.current === questions.length - 1) {
    state.finished = true;
    render();
    result.focus();
    return;
  }
  state.current += 1;
  state.chosen = null;
  render();
  answersBox.querySelector('button').focus();
});

document.querySelector('#restart').addEventListener('click', () => {
  Object.assign(state, { current: 0, score: 0, chosen: null, finished: false });
  render();
  answersBox.querySelector('button').focus();
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const index = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(event.key);
  if (index !== -1 && index < questions[state.current].answers.length) choose(index);
});

render();
```

# --review--

Testy kontrolují, že kvíz funguje. Tohle zkontroluj sám, než lab uzavřeš.

## --rubric--

- Stav kvízu je na jednom místě a jde popsat jednou větou.
- Kód neobsahuje žádný text ani počet z dat natvrdo — nová otázka v poli nepotřebuje změnu kódu.
- Celý kvíz projdeš jen klávesnicí a vždycky víš, kde je fokus.
- Posluchače se registrují jednou, ne při každém vykreslení otázky.
- Víš, který z přístupů bys zvolil příště a proč.

## --extensions--

Zamíchej pořadí otázek i odpovědí při každém startu (pozor, `correct` musí ukazovat na správnou odpověď i po zamíchání), přidej časovač na otázku přes `setInterval` a nejlepší skóre si ulož do `localStorage`.
