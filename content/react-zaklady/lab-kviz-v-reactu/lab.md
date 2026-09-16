---
title: Kvíz v Reactu
runtime: react
see: react-zaklady/stav-jako-snimek#stav-v-usestate
---

# --description--

Kvíz je nejmenší aplikace, na které je vidět celý React: něco se drží ve [[stav|stavu]], z toho se počítá, co je na obrazovce, a kliknutí stav posune dál. Přesně takhle fungují dotazníky po nákupu, onboardingové průvodce nebo testy v e-learningu.

Tentokrát bez vedení za ruku. V `data.js` máš připravené otázky, v `styles.css` hotový vzhled a v `App.jsx` jen hlavičku. Zbytek je na tobě — jak stav rozdělíš, kolik komponent vyrobíš a jestli si skóre spočítáš hned nebo až na konci, je tvoje rozhodnutí.

Otázky vypadají takhle (tohle jsou jiná data, tvoje jsou v `data.js`):

```js
{
  id: 'staty',
  text: 'Které město je hlavní město Slovenska?',
  options: ['Košice', 'Bratislava', 'Nitra'],
  correctIndex: 1,
}
```

Co má kvíz umět:

- Hráč vidí vždy jednu otázku, u ní pořadí („Otázka 2 z 5") a všechny možnosti jako tlačítka.
- Dokud hráč nevybere odpověď, nedá se pokračovat dál.
- Kliknutí na možnost ji označí; kliknutí na jinou výběr přepne, vybraná je vždy nejvýš jedna.
- Tlačítkem se hráč posune na další otázku, kde zase nic není vybrané.
- U poslední otázky se místo posunu nabídne vyhodnocení.
- Po vyhodnocení hráč vidí, kolik bodů z kolika má, a k tomu větu, která se liší podle výsledku.
- Z výsledku se dá kvíz spustit znovu od první otázky a s čistým skóre.

Aby testy poznaly, na co klikat, drž se těchhle značek `data-testid` (kolem nich si dělej, co chceš):

| `data-testid` | co to je |
|---|---|
| `poradi` | pořadí aktuální otázky, např. „Otázka 2 z 5" |
| `otazka` | text aktuální otázky |
| `odpoved` | tlačítko jedné možnosti (tolik, kolik má otázka možností, ve stejném pořadí) |
| `dalsi` | tlačítko na další otázku (u poslední otázky už tam není) |
| `vyhodnotit` | tlačítko na vyhodnocení (jen u poslední otázky) |
| `skore` | text s výsledkem, obsahuje „4 z 5" |
| `hodnoceni` | věta podle výsledku |
| `znovu` | tlačítko na nový pokus |

> [!REMEMBER]
> Vybraná možnost má `aria-pressed="true"`, nevybraná `aria-pressed="false"`. Není to jen kvůli testům: čtečka obrazovky jinak o výběru neví a `styles.css` podle toho možnost obarvuje.

Data v `data.js` neměň co do tvaru — testy si je načtou a ptají se podle nich. Přidat nebo přepsat otázky ale klidně můžeš, testy počítají s libovolným počtem otázek i možností.

**Texty, nadpis a vzhled jsou tvoje volba.** Chceš místo české krajiny kvíz o kapelách nebo o Formuli 1? Přepiš `data.js` a jeď.

# --hints--

Na začátku je vidět text první otázky a tolik tlačítek `odpoved`, kolik má první otázka možností — ve stejném pořadí.

```js
const { questions } = await helpers.importFile('data.js');
const first = questions[0];
const otazka = document.querySelector('[data-testid="otazka"]');
assert.ok(otazka, 'na stránce chybí prvek [data-testid="otazka"] s textem otázky');
assert.ok(otazka.textContent.includes(first.text), `v [data-testid="otazka"] má být text první otázky: „${first.text}"`);
const answers = [...document.querySelectorAll('[data-testid="odpoved"]')];
assert.equal(answers.length, first.options.length, `tlačítek [data-testid="odpoved"] má být ${first.options.length} — tolik, kolik má první otázka možností`);
answers.forEach((button, index) => {
  assert.ok(button.textContent.includes(first.options[index]), `${index + 1}. tlačítko odpovědi má obsahovat text „${first.options[index]}"`);
});
```

Prvek `poradi` říká, kolikátá otázka je na řadě a kolik jich je celkem.

```js
const { questions } = await helpers.importFile('data.js');
const poradi = document.querySelector('[data-testid="poradi"]');
assert.ok(poradi, 'na stránce chybí prvek [data-testid="poradi"] s pořadím otázky');
const text = poradi.textContent.replace(/\s+/g, ' ');
assert.match(text, new RegExp(`1\\s*z\\s*${questions.length}`), `u první otázky má [data-testid="poradi"] obsahovat „1 z ${questions.length}", teď je tam „${text}"`);
```

Dokud hráč nevybere odpověď, je tlačítko `dalsi` zakázané (`disabled`) a žádná možnost není označená.

```js
const dalsi = document.querySelector('[data-testid="dalsi"]');
assert.ok(dalsi, 'na stránce chybí tlačítko [data-testid="dalsi"]');
assert.equal(dalsi.disabled, true, 'tlačítko [data-testid="dalsi"] má být zakázané, dokud hráč nevybere odpověď');
const oznacene = document.querySelectorAll('[data-testid="odpoved"][aria-pressed="true"]');
assert.equal(oznacene.length, 0, 'na začátku nemá být označená žádná možnost');
```

Kliknutí na možnost ji označí (`aria-pressed="true"`) a odemkne tlačítko `dalsi`.

```js
const answers = [...document.querySelectorAll('[data-testid="odpoved"]')];
await helpers.click(answers[0]);
await helpers.flush();
const po = [...document.querySelectorAll('[data-testid="odpoved"]')];
assert.equal(po[0].getAttribute('aria-pressed'), 'true', 'po kliknutí má mít vybraná možnost aria-pressed="true"');
assert.equal(po.filter((button) => button.getAttribute('aria-pressed') === 'true').length, 1, 'označená má být právě jedna možnost');
assert.equal(document.querySelector('[data-testid="dalsi"]').disabled, false, 'po výběru odpovědi už tlačítko [data-testid="dalsi"] nemá být zakázané');
```

Kliknutí na jinou možnost výběr přepne, nepřidá druhý.

```js
const answers = [...document.querySelectorAll('[data-testid="odpoved"]')];
assert.ok(answers.length >= 2, 'první otázka má mít aspoň dvě možnosti');
await helpers.click(answers[0]);
await helpers.flush();
await helpers.click(document.querySelectorAll('[data-testid="odpoved"]')[1]);
await helpers.flush();
const po = [...document.querySelectorAll('[data-testid="odpoved"]')];
assert.equal(po[1].getAttribute('aria-pressed'), 'true', 'po kliknutí na druhou možnost má mít aria-pressed="true" ona');
assert.equal(po[0].getAttribute('aria-pressed'), 'false', 'první možnost už označená být nemá — vybraná je vždy nejvýš jedna');
assert.equal(po.filter((button) => button.getAttribute('aria-pressed') === 'true').length, 1, 'označená má být právě jedna možnost');
```

Tlačítko `dalsi` posune kvíz na druhou otázku: jiný text, jiné pořadí, nic vybraného a tlačítko je zase zakázané.

```js
const { questions } = await helpers.importFile('data.js');
assert.ok(questions.length >= 2, 'kvíz má mít aspoň dvě otázky');
await helpers.click(document.querySelectorAll('[data-testid="odpoved"]')[0]);
await helpers.flush();
await helpers.click(document.querySelector('[data-testid="dalsi"]'));
await helpers.flush();
const otazka = document.querySelector('[data-testid="otazka"]');
assert.ok(otazka.textContent.includes(questions[1].text), `po kliknutí na [data-testid="dalsi"] má být vidět druhá otázka: „${questions[1].text}"`);
assert.match(document.querySelector('[data-testid="poradi"]').textContent.replace(/\s+/g, ' '), new RegExp(`2\\s*z\\s*${questions.length}`), `[data-testid="poradi"] má u druhé otázky obsahovat „2 z ${questions.length}"`);
assert.equal(document.querySelectorAll('[data-testid="odpoved"][aria-pressed="true"]').length, 0, 'u nové otázky nesmí být nic předvybraného');
assert.equal(document.querySelector('[data-testid="dalsi"]').disabled, true, 'u nové otázky má být [data-testid="dalsi"] zase zakázané');
```

Počet možností odpovídá aktuální otázce, ne té první.

```js
const { questions } = await helpers.importFile('data.js');
for (let i = 0; i < questions.length; i += 1) {
  const answers = [...document.querySelectorAll('[data-testid="odpoved"]')];
  assert.equal(answers.length, questions[i].options.length, `u ${i + 1}. otázky má být tolik tlačítek [data-testid="odpoved"], kolik má otázka možností (${questions[i].options.length})`);
  answers.forEach((button, index) => {
    assert.ok(button.textContent.includes(questions[i].options[index]), `${index + 1}. možnost ${i + 1}. otázky má obsahovat text „${questions[i].options[index]}"`);
  });
  await helpers.click(answers[0]);
  await helpers.flush();
  const dal = document.querySelector('[data-testid="vyhodnotit"]') ?? document.querySelector('[data-testid="dalsi"]');
  assert.ok(dal, `u ${i + 1}. otázky chybí tlačítko na pokračování`);
  await helpers.click(dal);
  await helpers.flush();
}
```

U první otázky se nenabízí vyhodnocení a u poslední otázky už není tlačítko `dalsi`.

```js
const { questions } = await helpers.importFile('data.js');
assert.equal(document.querySelector('[data-testid="vyhodnotit"]'), null, 'u první otázky se ještě nemá nabízet [data-testid="vyhodnotit"]');
for (let i = 0; i < questions.length - 1; i += 1) {
  await helpers.click(document.querySelectorAll('[data-testid="odpoved"]')[0]);
  await helpers.flush();
  await helpers.click(document.querySelector('[data-testid="dalsi"]'));
  await helpers.flush();
}
assert.ok(document.querySelector('[data-testid="vyhodnotit"]'), `u poslední (${questions.length}.) otázky má být tlačítko [data-testid="vyhodnotit"]`);
assert.equal(document.querySelector('[data-testid="dalsi"]'), null, 'u poslední otázky už tlačítko [data-testid="dalsi"] být nemá');
```

Za samé správné odpovědi je plný počet bodů.

```js
const { questions } = await helpers.importFile('data.js');
for (const question of questions) {
  await helpers.click(document.querySelectorAll('[data-testid="odpoved"]')[question.correctIndex]);
  await helpers.flush();
  await helpers.click(document.querySelector('[data-testid="vyhodnotit"]') ?? document.querySelector('[data-testid="dalsi"]'));
  await helpers.flush();
}
const skore = document.querySelector('[data-testid="skore"]');
assert.ok(skore, 'po vyhodnocení chybí prvek [data-testid="skore"]');
assert.match(skore.textContent.replace(/\s+/g, ' '), new RegExp(`${questions.length}\\s*z\\s*${questions.length}`), `za samé správné odpovědi má [data-testid="skore"] obsahovat „${questions.length} z ${questions.length}"`);
```

Za samé špatné odpovědi je nula bodů.

```js
const { questions } = await helpers.importFile('data.js');
for (const question of questions) {
  const wrong = (question.correctIndex + 1) % question.options.length;
  await helpers.click(document.querySelectorAll('[data-testid="odpoved"]')[wrong]);
  await helpers.flush();
  await helpers.click(document.querySelector('[data-testid="vyhodnotit"]') ?? document.querySelector('[data-testid="dalsi"]'));
  await helpers.flush();
}
const el = document.querySelector('[data-testid="skore"]');
assert.ok(el, 'po vyhodnocení chybí prvek [data-testid="skore"]');
const skore = el.textContent.replace(/\s+/g, ' ');
assert.match(skore, new RegExp(`0\\s*z\\s*${questions.length}`), `za samé špatné odpovědi má [data-testid="skore"] obsahovat „0 z ${questions.length}", teď je tam „${skore}"`);
```

Body se počítají jen za správné odpovědi — dvě správné a zbytek špatně dá dva body.

```js
const { questions } = await helpers.importFile('data.js');
assert.ok(questions.length >= 3, 'kvíz má mít aspoň tři otázky');
for (const [index, question] of questions.entries()) {
  const choice = index < 2 ? question.correctIndex : (question.correctIndex + 1) % question.options.length;
  await helpers.click(document.querySelectorAll('[data-testid="odpoved"]')[choice]);
  await helpers.flush();
  await helpers.click(document.querySelector('[data-testid="vyhodnotit"]') ?? document.querySelector('[data-testid="dalsi"]'));
  await helpers.flush();
}
const el = document.querySelector('[data-testid="skore"]');
assert.ok(el, 'po vyhodnocení chybí prvek [data-testid="skore"]');
const skore = el.textContent.replace(/\s+/g, ' ');
assert.match(skore, new RegExp(`2\\s*z\\s*${questions.length}`), `za dvě správné odpovědi má [data-testid="skore"] obsahovat „2 z ${questions.length}", teď je tam „${skore}"`);
```

Po vyhodnocení už není vidět otázka ani možnosti.

```js
const { questions } = await helpers.importFile('data.js');
for (const question of questions) {
  await helpers.click(document.querySelectorAll('[data-testid="odpoved"]')[question.correctIndex]);
  await helpers.flush();
  await helpers.click(document.querySelector('[data-testid="vyhodnotit"]') ?? document.querySelector('[data-testid="dalsi"]'));
  await helpers.flush();
}
assert.equal(document.querySelectorAll('[data-testid="odpoved"]').length, 0, 'na výsledkové obrazovce už nemají být tlačítka [data-testid="odpoved"]');
assert.equal(document.querySelector('[data-testid="otazka"]'), null, 'na výsledkové obrazovce už nemá být prvek [data-testid="otazka"]');
```

Tlačítko `znovu` vrátí kvíz na první otázku a druhý pokus začíná s čistým skóre.

```js
const { questions } = await helpers.importFile('data.js');
const projdi = async (vyber) => {
  for (const [index, question] of questions.entries()) {
    const volby = document.querySelectorAll('[data-testid="odpoved"]');
    assert.ok(volby.length > 0, `u ${index + 1}. otázky nejsou na stránce žádné možnosti [data-testid="odpoved"]`);
    await helpers.click(volby[vyber(question)]);
    await helpers.flush();
    await helpers.click(document.querySelector('[data-testid="vyhodnotit"]') ?? document.querySelector('[data-testid="dalsi"]'));
    await helpers.flush();
  }
};
await projdi((question) => question.correctIndex);
const znovu = document.querySelector('[data-testid="znovu"]');
assert.ok(znovu, 'na výsledkové obrazovce chybí tlačítko [data-testid="znovu"]');
await helpers.click(znovu);
await helpers.flush();
assert.ok(document.querySelector('[data-testid="otazka"]')?.textContent.includes(questions[0].text), `po kliknutí na [data-testid="znovu"] má být vidět první otázka: „${questions[0].text}"`);
assert.equal(document.querySelectorAll('[data-testid="odpoved"][aria-pressed="true"]').length, 0, 'po restartu nesmí být nic předvybraného');
assert.equal(document.querySelector('[data-testid="skore"]'), null, 'po restartu už nemá být na stránce prvek [data-testid="skore"]');
await projdi((question) => (question.correctIndex + 1) % question.options.length);
const skore = document.querySelector('[data-testid="skore"]');
assert.ok(skore, 'po restartu a druhém průchodu chybí [data-testid="skore"] — restart nejspíš nechal odpovědi z minulého pokusu');
assert.match(skore.textContent.replace(/\s+/g, ' '), new RegExp(`0\\s*z\\s*${questions.length}`), `druhý pokus se samými špatnými odpověďmi má dát „0 z ${questions.length}", teď je tam „${skore.textContent.replace(/\s+/g, ' ')}"`);
```

Věta v `hodnoceni` se liší podle výsledku — plný počet a nula bodů nedostanou stejný text.

```js
const { questions } = await helpers.importFile('data.js');
const projdi = async (vyber) => {
  for (const [index, question] of questions.entries()) {
    await helpers.click(document.querySelectorAll('[data-testid="odpoved"]')[vyber(question, index)]);
    await helpers.flush();
    await helpers.click(document.querySelector('[data-testid="vyhodnotit"]') ?? document.querySelector('[data-testid="dalsi"]'));
    await helpers.flush();
  }
  const el = document.querySelector('[data-testid="hodnoceni"]');
  assert.ok(el, 'na výsledkové obrazovce chybí prvek [data-testid="hodnoceni"]');
  return el.textContent.replace(/\s+/g, ' ').trim();
};
const plny = await projdi((question) => question.correctIndex);
assert.notEqual(plny, '', 'prvek [data-testid="hodnoceni"] nemá být prázdný');
await helpers.click(document.querySelector('[data-testid="znovu"]'));
await helpers.flush();
const nula = await projdi((question) => (question.correctIndex + 1) % question.options.length);
assert.notEqual(nula, plny, `hodnocení má být za plný počet jiné než za nulu, teď je v obou případech „${plny}"`);
```

# --help--

## --tip--

Rozděl si to na dvě obrazovky: buď kvíz běží a ukazuje jednu otázku, nebo je po něm a ukazuje výsledek. Čím je daná, která z nich je na řadě? To je tvůj první kus stavu. Zbytek plyne z něj — viz [Odvozená hodnota místo stavu](see:react-zaklady/stav-jako-snimek#odvozena-hodnota-misto-stavu).

## --tip--

Uvíznul jsi na skóre? Nemusí být ve stavu. Když si při každé otázce zapamatuješ, na co hráč klikl, dá se počet bodů na konci dopočítat z uložených voleb a z `correctIndex`. Ve `stav-jako-snimek` jsi to samé dělal se součtem kalorií: [Odvozená hodnota místo stavu](see:react-zaklady/stav-jako-snimek#odvozena-hodnota-misto-stavu).

# --seed--

## --file-- data.js

```js
export const questions = [
  {
    id: 'reka',
    text: 'Která řeka protéká Prahou?',
    options: ['Labe', 'Vltava', 'Morava', 'Ohře'],
    correctIndex: 1,
  },
  {
    id: 'hora',
    text: 'Jak se jmenuje nejvyšší hora Česka?',
    options: ['Praděd', 'Lysá hora', 'Sněžka', 'Klínovec'],
    correctIndex: 2,
  },
  {
    id: 'kraje',
    text: 'Kolik krajů má Česko včetně Prahy?',
    options: ['8', '13', '14', '15'],
    correctIndex: 2,
  },
  {
    id: 'soutok',
    text: 'Které město leží na soutoku Labe a Vltavy?',
    options: ['Mělník', 'Kolín', 'Litoměřice', 'Roudnice nad Labem'],
    correctIndex: 0,
  },
  {
    id: 'brana',
    text: 'Ve kterém pohoří najdeš Pravčickou bránu?',
    options: ['Krkonoše', 'Jeseníky', 'České Švýcarsko', 'Šumava'],
    correctIndex: 2,
  },
];
```

## --file-- styles.css

```css
:root {
  --barva-pozadi: #0f172a;
  --barva-karta: #1e293b;
  --barva-text: #e2e8f0;
  --barva-tlumena: #94a3b8;
  --barva-akcent: #38bdf8;
  --barva-akcent-tmava: #0284c7;
  --mezera: 1rem;
  --radius: 0.75rem;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background: radial-gradient(circle at 20% 0%, #1e3a5f, var(--barva-pozadi) 60%);
  color: var(--barva-text);
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

.quiz {
  width: min(32rem, 100%);
  padding: 2rem;
  border-radius: var(--radius);
  background: var(--barva-karta);
  box-shadow: 0 1.5rem 3rem rgb(2 6 23 / 0.5);
}

.quiz__title {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: -0.01em;
}

.quiz__intro,
.quiz__progress {
  margin: 0.25rem 0 0;
  color: var(--barva-tlumena);
  font-size: 0.875rem;
}

.quiz__question {
  margin: var(--mezera) 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.quiz__options {
  display: grid;
  gap: 0.5rem;
  margin: 0 0 var(--mezera);
  padding: 0;
  list-style: none;
}

.option {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition: background-color 150ms, border-color 150ms, transform 150ms;
}

.option:hover {
  border-color: var(--barva-akcent);
}

.option:focus-visible {
  outline: 2px solid var(--barva-akcent);
  outline-offset: 2px;
}

.option[aria-pressed='true'] {
  border-color: var(--barva-akcent);
  background: rgb(56 189 248 / 0.15);
  transform: translateX(0.25rem);
}

.quiz__next {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--barva-akcent-tmava);
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms;
}

.quiz__next:hover:not(:disabled) {
  background: var(--barva-akcent);
  color: #082f49;
}

.quiz__next:disabled {
  background: #334155;
  color: var(--barva-tlumena);
  cursor: not-allowed;
}

.result__score {
  margin: var(--mezera) 0 0.25rem;
  font-size: 1.75rem;
  font-weight: 700;
}

.result__note {
  margin: 0 0 var(--mezera);
  color: var(--barva-tlumena);
}
```

## --file-- App.jsx

```jsx
import './styles.css';
import { useState } from 'react';
import { questions } from './data.js';

export default function App() {
  return (
    <div className="quiz">
      <h1 className="quiz__title">Poznej Česko</h1>
      <p className="quiz__intro">Pět otázek o české krajině. Kolik jich trefíš?</p>
    </div>
  );
}
```

# --solution--

## --file-- App.jsx

```jsx
import './styles.css';
import { useState } from 'react';
import { questions } from './data.js';

const NOTES = [
  'Mapu Česka ještě proleštit. Zkus to znovu.',
  'Půlka sedí. Druhá půlka na tebe čeká.',
  'Výborně, Česko máš v malíku.',
];

function noteFor(score, total) {
  const ratio = score / total;
  if (ratio < 0.4) return NOTES[0];
  if (ratio < 0.8) return NOTES[1];
  return NOTES[2];
}

export default function App() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const score = answers.filter((answer, position) => answer === questions[position].correctIndex).length;

  function confirm() {
    setAnswers([...answers, picked]);
    setPicked(null);
    if (isLast) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="quiz">
        <h1 className="quiz__title">Poznej Česko</h1>
        <p className="result__score" data-testid="skore">
          Máš {score} z {questions.length} bodů
        </p>
        <p className="result__note" data-testid="hodnoceni">
          {noteFor(score, questions.length)}
        </p>
        <button className="quiz__next" data-testid="znovu" onClick={restart}>
          Hrát znovu
        </button>
      </div>
    );
  }

  return (
    <div className="quiz">
      <h1 className="quiz__title">Poznej Česko</h1>
      <p className="quiz__progress" data-testid="poradi">
        Otázka {index + 1} z {questions.length}
      </p>
      <p className="quiz__question" data-testid="otazka">
        {question.text}
      </p>
      <ul className="quiz__options">
        {question.options.map((option, position) => (
          <li key={option}>
            <button
              aria-pressed={picked === position}
              className="option"
              data-testid="odpoved"
              onClick={() => setPicked(position)}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      <button
        className="quiz__next"
        data-testid={isLast ? 'vyhodnotit' : 'dalsi'}
        disabled={picked === null}
        onClick={confirm}
      >
        {isLast ? 'Vyhodnotit' : 'Další otázka'}
      </button>
    </div>
  );
}
```

# --approaches--

## --approach-- Všechno v jednom objektu stavu

Jeden `useState` s objektem `{ index, picked, answers, finished }`. Výhoda: stav kvízu je na jednom místě a restart je jedno přiřazení výchozího objektu. Daň: každá změna musí objekt rozkopírovat (`{ ...state, picked: position }`), protože stav se nemutuje. Hodí se, když spolu hodnoty opravdu souvisí a mění se společně.

### --file-- App.jsx

```jsx
import './styles.css';
import { useState } from 'react';
import { questions } from './data.js';

const START = { index: 0, picked: null, answers: [], finished: false };

function noteFor(score, total) {
  const ratio = score / total;
  if (ratio < 0.4) return 'Mapu Česka ještě proleštit. Zkus to znovu.';
  if (ratio < 0.8) return 'Půlka sedí. Druhá půlka na tebe čeká.';
  return 'Výborně, Česko máš v malíku.';
}

export default function App() {
  const [state, setState] = useState(START);

  const question = questions[state.index];
  const isLast = state.index === questions.length - 1;
  const score = state.answers.filter((answer, position) => answer === questions[position].correctIndex).length;

  function confirm() {
    setState({
      ...state,
      answers: [...state.answers, state.picked],
      picked: null,
      index: isLast ? state.index : state.index + 1,
      finished: isLast,
    });
  }

  if (state.finished) {
    return (
      <div className="quiz">
        <h1 className="quiz__title">Poznej Česko</h1>
        <p className="result__score" data-testid="skore">
          Máš {score} z {questions.length} bodů
        </p>
        <p className="result__note" data-testid="hodnoceni">
          {noteFor(score, questions.length)}
        </p>
        <button className="quiz__next" data-testid="znovu" onClick={() => setState(START)}>
          Hrát znovu
        </button>
      </div>
    );
  }

  return (
    <div className="quiz">
      <h1 className="quiz__title">Poznej Česko</h1>
      <p className="quiz__progress" data-testid="poradi">
        Otázka {state.index + 1} z {questions.length}
      </p>
      <p className="quiz__question" data-testid="otazka">
        {question.text}
      </p>
      <ul className="quiz__options">
        {question.options.map((option, position) => (
          <li key={option}>
            <button
              aria-pressed={state.picked === position}
              className="option"
              data-testid="odpoved"
              onClick={() => setState({ ...state, picked: position })}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      <button
        className="quiz__next"
        data-testid={isLast ? 'vyhodnotit' : 'dalsi'}
        disabled={state.picked === null}
        onClick={confirm}
      >
        {isLast ? 'Vyhodnotit' : 'Další otázka'}
      </button>
    </div>
  );
}
```

## --approach-- Skóre se počítá hned při odpovědi

Místo pole voleb se drží rovnou počet bodů a přičítá se ve chvíli, kdy hráč potvrdí odpověď. Stav je menší a výsledková obrazovka nic nepočítá. Daň: jednotlivé odpovědi jsou pryč, takže rozbor „na tohle jsi odpověděl špatně" už dodatečně nedáš — a při přičítání si musíš dát pozor na [[snímek renderu]], proto je tu [[funkce aktualizace]].

### --file-- App.jsx

```jsx
import './styles.css';
import { useState } from 'react';
import { questions } from './data.js';

function noteFor(score, total) {
  const ratio = score / total;
  if (ratio < 0.4) return 'Mapu Česka ještě proleštit. Zkus to znovu.';
  if (ratio < 0.8) return 'Půlka sedí. Druhá půlka na tebe čeká.';
  return 'Výborně, Česko máš v malíku.';
}

export default function App() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  function confirm() {
    if (picked === question.correctIndex) {
      setScore((current) => current + 1);
    }
    setPicked(null);
    if (isLast) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="quiz">
        <h1 className="quiz__title">Poznej Česko</h1>
        <p className="result__score" data-testid="skore">
          Máš {score} z {questions.length} bodů
        </p>
        <p className="result__note" data-testid="hodnoceni">
          {noteFor(score, questions.length)}
        </p>
        <button className="quiz__next" data-testid="znovu" onClick={restart}>
          Hrát znovu
        </button>
      </div>
    );
  }

  return (
    <div className="quiz">
      <h1 className="quiz__title">Poznej Česko</h1>
      <p className="quiz__progress" data-testid="poradi">
        Otázka {index + 1} z {questions.length}
      </p>
      <p className="quiz__question" data-testid="otazka">
        {question.text}
      </p>
      <ul className="quiz__options">
        {question.options.map((option, position) => (
          <li key={option}>
            <button
              aria-pressed={picked === position}
              className="option"
              data-testid="odpoved"
              onClick={() => setPicked(position)}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      <button
        className="quiz__next"
        data-testid={isLast ? 'vyhodnotit' : 'dalsi'}
        disabled={picked === null}
        onClick={confirm}
      >
        {isLast ? 'Vyhodnotit' : 'Další otázka'}
      </button>
    </div>
  );
}
```

## --approach-- Rozdělené komponenty

Stav zůstává nahoře v `App`, ale obrazovka otázky a obrazovka výsledku jsou vlastní komponenty. `App` jim posílá data i funkce v props — to je [[zvednutí stavu]] z lekce o formulářích. Výhoda: `App` se čte jako scénář, ne jako zeď JSX, a `Question` jde použít i jinde. Daň: víc souborů a props, které se musí protáhnout dolů.

### --file-- App.jsx

```jsx
import './styles.css';
import { useState } from 'react';
import { questions } from './data.js';
import Question from './Question.jsx';
import Result from './Result.jsx';

export default function App() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const isLast = index === questions.length - 1;
  const score = answers.filter((answer, position) => answer === questions[position].correctIndex).length;

  function confirm() {
    setAnswers([...answers, picked]);
    setPicked(null);
    if (isLast) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setFinished(false);
  }

  return (
    <div className="quiz">
      <h1 className="quiz__title">Poznej Česko</h1>
      {finished ? (
        <Result score={score} total={questions.length} onRestart={restart} />
      ) : (
        <Question
          index={index}
          isLast={isLast}
          onConfirm={confirm}
          onPick={setPicked}
          picked={picked}
          question={questions[index]}
          total={questions.length}
        />
      )}
    </div>
  );
}
```

### --file-- Question.jsx

```jsx
export default function Question({ index, isLast, onConfirm, onPick, picked, question, total }) {
  return (
    <>
      <p className="quiz__progress" data-testid="poradi">
        Otázka {index + 1} z {total}
      </p>
      <p className="quiz__question" data-testid="otazka">
        {question.text}
      </p>
      <ul className="quiz__options">
        {question.options.map((option, position) => (
          <li key={option}>
            <button
              aria-pressed={picked === position}
              className="option"
              data-testid="odpoved"
              onClick={() => onPick(position)}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      <button
        className="quiz__next"
        data-testid={isLast ? 'vyhodnotit' : 'dalsi'}
        disabled={picked === null}
        onClick={onConfirm}
      >
        {isLast ? 'Vyhodnotit' : 'Další otázka'}
      </button>
    </>
  );
}
```

### --file-- Result.jsx

```jsx
function noteFor(score, total) {
  const ratio = score / total;
  if (ratio < 0.4) return 'Mapu Česka ještě proleštit. Zkus to znovu.';
  if (ratio < 0.8) return 'Půlka sedí. Druhá půlka na tebe čeká.';
  return 'Výborně, Česko máš v malíku.';
}

export default function Result({ onRestart, score, total }) {
  return (
    <>
      <p className="result__score" data-testid="skore">
        Máš {score} z {total} bodů
      </p>
      <p className="result__note" data-testid="hodnoceni">
        {noteFor(score, total)}
      </p>
      <button className="quiz__next" data-testid="znovu" onClick={onRestart}>
        Hrát znovu
      </button>
    </>
  );
}
```

# --review--

Testy hlídají chování. Tohle si po sobě přečti sám, než lab zavřeš.

## --rubric--

- Ve stavu je jen to, co se nedá dopočítat. Pořadí otázky, počet bodů, text hodnocení — projdi je jedno po druhém a zeptej se, jestli tam patří.
- Žádný `useState`, jehož hodnota se dá odvodit z jiného stavu (třeba „je to poslední otázka").
- Pole ani objekt ve stavu nemění `push`, `splice` ani přiřazení do vlastnosti. Vzniká vždy nová hodnota.
- Obsluha kliknutí se jmenuje podle toho, co dělá (`confirm`, `restart`), ne `handleClick1`.
- Aplikace přežije jinou délku pole `questions`: přidej do `data.js` šestou otázku a projdi kvíz znovu.
- `key` u možností je stabilní, ne index pole.
- Víš, který ze tří přístupů bys zvolil na skutečném projektu a proč.

## --extensions--

Rozšíření bez testů: po vyhodnocení vypiš rozbor „na tuhle otázku jsi odpověděl takhle, správně bylo tohle"; přidej tlačítko zpět na předchozí otázku; zamíchej pořadí možností při startu (pozor, čím je pak dané `key`); ukaž nad otázkou proužek s postupem, který se plní s každou zodpovězenou otázkou.
