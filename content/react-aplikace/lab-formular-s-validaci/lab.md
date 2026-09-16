---
title: Přihlašovací formulář na vlastní téma
runtime: react
see: react-aplikace/formulare-a-validace#formular-s-akci-useactionstate
---

# --description--

## Zadání

Postav přihlašovací formulář, který se dá dát mezi lidi: zkontroluje data, řekne
srozumitelně, co je špatně, neztratí vyplněné hodnoty a poradí si i s uživatelem,
který ho neuvidí.

**Téma, texty i vzhled jsou tvoje volba.** V seedu je přihláška na víkendový kurz
pečení chleba, ale klidně z ní udělej přihlášku na turnaj v šipkách, objednávku
dortu nebo registraci na sraz veteránů. Testy kontrolují chování a přístupnost,
ne to, co je v popiskách napsané.

Jediné, co musí zůstat: **jména polí** (`name`) a **třídy**, podle kterých se
testuje. Ty jsou v seedu připravené.

## Data formuláře

| pole (`name`) | typ | pravidlo |
|---|---|---|
| `jmeno` | text | po oříznutí mezer aspoň 2 znaky |
| `email` | text nebo e-mail | obsahuje zavináč a za ním tečku |
| `pocet` | číslo | celé číslo od 1 do 8 |
| `termin` | výběr z nabídky | musí být vybraná neprázdná hodnota |
| `souhlas` | zaškrtávátko | musí být zaškrtnuté |

## Uživatelské příběhy

- Když uživatel odešle prázdný formulář, u každého pole se objeví česká věta,
  která říká, co s ním má udělat. Stránka se nepřenačte.
- Když uživatel opraví jedno pole a odešle znovu, jeho chyba zmizí a chyby
  ostatních polí zůstanou.
- Když uživatel odešle formulář s chybou, hodnoty, které vyplnil, zůstanou
  v polích. Nikdo nemá psát e-mail dvakrát.
- Když uživatel používá čtečku obrazovky, u vadného pole slyší, že je vadné,
  a hned za ním hlášku, co má opravit.
- Když formulář odesílá, odesílací tlačítko nejde zmáčknout podruhé a jeho text
  říká, že se pracuje.
- Když se odeslání povede, uživatel uvidí potvrzení, které čtečka oznámí sama od
  sebe, a formulář se z obrazovky ztratí.

## Technické požadavky

- Rozhodnutí o platnosti dat patří do funkce `zkontroluj(data)` v `validace.js`.
  Dostane objekt s hodnotami polí a vrátí objekt chyb: klíč je jméno pole,
  hodnota česká věta. Bez chyb vrací prázdný objekt.
- Odeslání simuluje funkce `odesliPrihlasku` z `api.js` — trvá chvilku a vrací
  Promise.
- Chybová hláška u pole je `<p className="chyba">` s vlastním `id`; pole na ni
  ukazuje přes `aria-describedby` a má `aria-invalid="true"`. Když pole chybu
  nemá, `aria-invalid` na něm vůbec není.
- Potvrzení po odeslání je prvek s `role="status"` a třídou `hotovo`.
- Formulář má `noValidate`, hlášky si píšeš sám.

> [!TIP]
> Začni funkcí `zkontroluj` a otestuj si ji v konzoli náhledu, než začneš psát
> JSX. Když funguje ona, zbytek je jen vykreslení jejího výstupu.

# --hints--

Formulář má pět polí a každé má viditelný popisek svázaný s polem.

```js
const formular = document.querySelector('form');
assert.ok(formular, 'na stránce má být formulář');
for (const jmeno of ['jmeno', 'email', 'pocet', 'termin', 'souhlas']) {
  const pole = formular.querySelector(`[name="${jmeno}"]`);
  assert.ok(pole, `ve formuláři chybí pole s name="${jmeno}"`);
  const popisek = pole.labels && pole.labels[0];
  assert.ok(popisek, `pole ${jmeno} nemá popisek <label> — bez něj uživatel čtečky neví, co má vyplnit`);
  assert.ok(popisek.textContent.trim().length > 0, `popisek pole ${jmeno} je prázdný`);
}
```

`zkontroluj` vrátí u prázdných dat chybu ke každému z pěti polí.

```js
const { zkontroluj } = await helpers.importFile('validace.js');
const chyby = zkontroluj({ jmeno: '', email: '', pocet: NaN, termin: '', souhlas: false });
for (const jmeno of ['jmeno', 'email', 'pocet', 'termin', 'souhlas']) {
  assert.equal(typeof chyby[jmeno], 'string', `zkontroluj má u prázdných dat vrátit českou větu pod klíčem ${jmeno}`);
  assert.ok(chyby[jmeno].trim().length > 5, `hláška u pole ${jmeno} má být věta, ne jedno slovo`);
}
```

`zkontroluj` u platných dat vrátí prázdný objekt.

```js
const { zkontroluj } = await helpers.importFile('validace.js');
const chyby = zkontroluj({ jmeno: 'Eva Novotná', email: 'eva@example.com', pocet: 2, termin: 'kveten', souhlas: true });
assert.deepEqual(chyby, {}, 'u platných dat má zkontroluj vrátit prázdný objekt');
```

`zkontroluj` hlídá délku jména a mezery na krajích.

```js
const { zkontroluj } = await helpers.importFile('validace.js');
const platne = { jmeno: 'Eva', email: 'eva@example.com', pocet: 2, termin: 'kveten', souhlas: true };
assert.equal(zkontroluj({ ...platne, jmeno: 'E' }).jmeno === undefined, false, 'jméno o jednom znaku má být chyba');
assert.equal(zkontroluj({ ...platne, jmeno: '   ' }).jmeno === undefined, false, 'jméno ze samých mezer má být chyba');
assert.equal(zkontroluj({ ...platne, jmeno: 'Bob' }).jmeno, undefined, 'jméno „Bob" je v pořádku');
```

`zkontroluj` hlídá tvar e-mailu.

```js
const { zkontroluj } = await helpers.importFile('validace.js');
const platne = { jmeno: 'Eva Novotná', email: 'eva@example.com', pocet: 2, termin: 'kveten', souhlas: true };
assert.equal(zkontroluj({ ...platne, email: 'eva' }).email === undefined, false, 'e-mail bez zavináče má být chyba');
assert.equal(zkontroluj({ ...platne, email: 'eva@example' }).email === undefined, false, 'e-mail bez tečky za zavináčem má být chyba');
assert.equal(zkontroluj({ ...platne, email: 'eva.novotna@seznam.cz' }).email, undefined, 'běžný e-mail má projít');
```

`zkontroluj` hlídá rozsah počtu osob a celé číslo.

```js
const { zkontroluj } = await helpers.importFile('validace.js');
const platne = { jmeno: 'Eva Novotná', email: 'eva@example.com', pocet: 2, termin: 'kveten', souhlas: true };
assert.equal(zkontroluj({ ...platne, pocet: 0 }).pocet === undefined, false, 'nula osob má být chyba');
assert.equal(zkontroluj({ ...platne, pocet: 9 }).pocet === undefined, false, 'devět osob má být chyba');
assert.equal(zkontroluj({ ...platne, pocet: 2.5 }).pocet === undefined, false, 'necelý počet osob má být chyba');
assert.equal(zkontroluj({ ...platne, pocet: 8 }).pocet, undefined, 'osm osob je nejvyšší povolený počet');
```

`zkontroluj` hlídá vybraný termín a zaškrtnutý souhlas.

```js
const { zkontroluj } = await helpers.importFile('validace.js');
const platne = { jmeno: 'Eva Novotná', email: 'eva@example.com', pocet: 2, termin: 'kveten', souhlas: true };
assert.equal(zkontroluj({ ...platne, termin: '' }).termin === undefined, false, 'nevybraný termín má být chyba');
assert.equal(zkontroluj({ ...platne, souhlas: false }).souhlas === undefined, false, 'nezaškrtnutý souhlas má být chyba');
```

Odeslání nevyplněného formuláře ukáže hlášku u každého pole, které chybí, a stránku nepřenačte.

```js
const formular = document.querySelector('form');
await helpers.submit(formular);
await helpers.waitFor(() => document.querySelectorAll('.chyba').length === 4, 3000);
assert.equal(document.querySelectorAll('.chyba').length, 4, 'po odeslání nevyplněného formuláře mají být vidět čtyři hlášky: jméno, e-mail, termín a souhlas (počet míst má výchozí hodnotu 1)');
assert.ok(document.querySelector('form'), 'formulář má po odeslání zůstat na stránce — výchozí chování prohlížeče je potřeba zastavit');
```

Každá hláška je propojená se svým polem přes `aria-describedby` a `aria-invalid`.

```js
await helpers.submit(document.querySelector('form'));
await helpers.waitFor(() => document.querySelectorAll('.chyba').length === 4, 3000);
for (const jmeno of ['jmeno', 'email', 'termin', 'souhlas']) {
  const pole = document.querySelector(`[name="${jmeno}"]`);
  assert.equal(pole.getAttribute('aria-invalid'), 'true', `pole ${jmeno} má mít při chybě aria-invalid="true"`);
  const popis = pole.getAttribute('aria-describedby');
  assert.ok(popis, `pole ${jmeno} má při chybě ukazovat na hlášku přes aria-describedby`);
  const hlaska = document.getElementById(popis.split(/\s+/)[0]);
  assert.ok(hlaska, `aria-describedby pole ${jmeno} ukazuje na id, které na stránce není`);
  assert.ok(hlaska.textContent.trim().length > 5, `hláška u pole ${jmeno} má být česká věta`);
}
```

Pole bez chyby atribut `aria-invalid` vůbec nemá.

```js
const nastavHodnotu = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
const napis = async (pole, text) => {
  nastavHodnotu.call(pole, text);
  pole.dispatchEvent(new InputEvent('input', { bubbles: true }));
  await helpers.flush();
};
await napis(document.querySelector('[name="jmeno"]'), 'Eva Novotná');
await helpers.submit(document.querySelector('form'));
await helpers.waitFor(() => document.querySelectorAll('.chyba').length === 3, 3000);
const pole = document.querySelector('[name="jmeno"]');
assert.equal(pole.hasAttribute('aria-invalid'), false, 'pole bez chyby nemá mít aria-invalid vůbec — ani s hodnotou false');
assert.equal(document.querySelectorAll('.chyba').length, 3, 'po vyplnění jména mají zbýt tři hlášky');
```

Vyplněné hodnoty po neúspěšném odeslání zůstanou v polích.

```js
const nastavHodnotu = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
const napis = async (pole, text) => {
  nastavHodnotu.call(pole, text);
  pole.dispatchEvent(new InputEvent('input', { bubbles: true }));
  await helpers.flush();
};
await napis(document.querySelector('[name="jmeno"]'), 'Eva Novotná');
await napis(document.querySelector('[name="email"]'), 'eva@example.com');
await helpers.submit(document.querySelector('form'));
await helpers.waitFor(() => document.querySelectorAll('.chyba').length === 2, 3000);
assert.equal(document.querySelector('[name="jmeno"]').value, 'Eva Novotná', 'jméno má po neúspěšném odeslání zůstat vyplněné');
assert.equal(document.querySelector('[name="email"]').value, 'eva@example.com', 'e-mail má po neúspěšném odeslání zůstat vyplněný');
```

Během odesílání nejde tlačítko zmáčknout a jeho text se změní.

```js
const nastavHodnotu = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
const nastavVyber = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
const napis = async (pole, text) => {
  nastavHodnotu.call(pole, text);
  pole.dispatchEvent(new InputEvent('input', { bubbles: true }));
  await helpers.flush();
};
await napis(document.querySelector('[name="jmeno"]'), 'Eva Novotná');
await napis(document.querySelector('[name="email"]'), 'eva@example.com');
await napis(document.querySelector('[name="pocet"]'), '2');
const vyber = document.querySelector('[name="termin"]');
nastavVyber.call(vyber, [...vyber.options].map((volba) => volba.value).find((hodnota) => hodnota !== ''));
vyber.dispatchEvent(new Event('change', { bubbles: true }));
document.querySelector('[name="souhlas"]').click();
await helpers.flush();
const tlacitko = document.querySelector('form button[type="submit"], form [type="submit"]');
const textPred = tlacitko.textContent.trim();
helpers.submit(document.querySelector('form'));
await helpers.flush();
const behem = document.querySelector('form [type="submit"]');
assert.ok(behem.disabled, 'během odesílání má být odesílací tlačítko zablokované');
assert.notEqual(behem.textContent.trim(), textPred, 'během odesílání má tlačítko říct, že se pracuje — text se má lišit od výchozího');
```

Po úspěšném odeslání je vidět potvrzení a formulář zmizí.

```js
const nastavHodnotu = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
const nastavVyber = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
const napis = async (pole, text) => {
  nastavHodnotu.call(pole, text);
  pole.dispatchEvent(new InputEvent('input', { bubbles: true }));
  await helpers.flush();
};
await napis(document.querySelector('[name="jmeno"]'), 'Eva Novotná');
await napis(document.querySelector('[name="email"]'), 'eva@example.com');
await napis(document.querySelector('[name="pocet"]'), '2');
const vyber = document.querySelector('[name="termin"]');
nastavVyber.call(vyber, [...vyber.options].map((volba) => volba.value).find((hodnota) => hodnota !== ''));
vyber.dispatchEvent(new Event('change', { bubbles: true }));
document.querySelector('[name="souhlas"]').click();
await helpers.flush();
await helpers.submit(document.querySelector('form'));
await helpers.waitFor(() => document.querySelector('.hotovo'), 3000);
const potvrzeni = document.querySelector('.hotovo');
assert.equal(potvrzeni.getAttribute('role'), 'status', 'potvrzení má mít role="status", aby ho čtečka oznámila sama');
assert.ok(potvrzeni.textContent.trim().length > 5, 'potvrzení má být česká věta, ne jedno slovo');
assert.equal(document.querySelector('form'), null, 'po úspěšném odeslání má formulář z obrazovky zmizet');
```

# --help--

## --tip--

Začni `zkontroluj` — sedm testů se týká jen jí a s hotovou funkcí je zbytek
vykreslení jejího výstupu. Pravidla máš v tabulce v zadání.

## --tip--

Atribut, který při chybě chybět nemá, a při pořádku nemá existovat, se
v JSX zapisuje hodnotou `undefined`. Jak přesně, je v části
[Chyby, které uvidí a uslyší každý](see:react-aplikace/formulare-a-validace#chyby-ktere-uvidi-a-uslysi-kazdy).

# --seed--

## --file-- App.jsx

```jsx
import { useActionState } from 'react';
import { odesliPrihlasku } from './api';
import { zkontroluj } from './validace';
import './styles.css';

const terminy = [
  { hodnota: 'kveten', popisek: '17.–18. května' },
  { hodnota: 'cerven', popisek: '21.–22. června' },
  { hodnota: 'zari', popisek: '13.–14. září' },
];

export default function App() {
  return (
    <main className="obal">
      <h1>Víkend s chlebem</h1>
      <p className="perex">
        Dva dny v pekárně U Mlýna: kvásek, hnětení, pečení v peci na dřevo.
        Bochník si odvezeš domů.
      </p>

      <form className="formular" noValidate onSubmit={(udalost) => udalost.preventDefault()}>
        <div className="pole">
          <label htmlFor="jmeno">Jméno a příjmení</label>
          <input id="jmeno" name="jmeno" />
        </div>

        <div className="pole">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" />
        </div>

        <div className="pole">
          <label htmlFor="pocet">Počet míst</label>
          <input id="pocet" name="pocet" type="number" defaultValue={1} />
        </div>

        <div className="pole">
          <label htmlFor="termin">Termín</label>
          <select id="termin" name="termin" defaultValue="">
            <option value="">Vyber termín</option>
            {terminy.map((termin) => (
              <option key={termin.hodnota} value={termin.hodnota}>{termin.popisek}</option>
            ))}
          </select>
        </div>

        <div className="pole pole-souhlas">
          <input id="souhlas" name="souhlas" type="checkbox" />
          <label htmlFor="souhlas">Souhlasím se storno podmínkami</label>
        </div>

        <button type="submit">Přihlásit se</button>
      </form>
    </main>
  );
}
```

## --file-- validace.js

```js
/**
 * Zkontroluje data přihlášky.
 * @param {{ jmeno: string, email: string, pocet: number, termin: string, souhlas: boolean }} data
 * @returns {Record<string, string>} chyby podle jména pole; prázdný objekt = vše v pořádku
 */
export function zkontroluj(data) {
}
```

## --file-- api.js

```js
/**
 * Odešle přihlášku. Trvá chvilku, aby byl vidět stav odesílání.
 * @param {object} data
 * @returns {Promise<{ id: number }>}
 */
export function odesliPrihlasku(data) {
  return new Promise((splnit) => {
    setTimeout(() => splnit({ id: Math.floor(Math.random() * 1000) }), 400);
  });
}
```

## --file-- styles.css

```css
:root {
  --pecivo: #a9622e;
  --pecivo-tmave: #7d4620;
  --papir: #faf6f0;
  --bila: #fff;
  --text: #2a211a;
  --seda: #7b6d61;
  --linka: #e6ddd2;
  --chyba: #b3261e;
  --ok: #2f7d4f;
}

* { box-sizing: border-box; }

body { margin: 0; font: 16px/1.6 system-ui, -apple-system, sans-serif; background: var(--papir); color: var(--text); }

.obal { max-width: 520px; margin: 0 auto; padding: 32px 20px 64px; }
h1 { margin: 0 0 6px; font-size: 1.8rem; letter-spacing: -0.02em; }
.perex { margin: 0 0 28px; color: var(--seda); }

.formular { display: grid; gap: 16px; padding: 24px; background: var(--bila); border: 1px solid var(--linka); border-radius: 16px; }
.pole { display: grid; gap: 4px; }
.pole label { font-size: 0.9rem; color: var(--seda); }
.pole input, .pole select { padding: 10px 12px; border: 1px solid var(--linka); border-radius: 10px; background: var(--bila); font: inherit; color: inherit; }
.pole input:focus-visible, .pole select:focus-visible { outline: 2px solid var(--pecivo); outline-offset: 1px; }
.pole [aria-invalid='true'] { border-color: var(--chyba); }

.pole-souhlas { grid-template-columns: auto 1fr; align-items: center; gap: 10px; }
.pole-souhlas label { color: var(--text); }
.pole-souhlas .chyba { grid-column: 1 / -1; }

.chyba { margin: 0; color: var(--chyba); font-size: 0.88rem; }

button[type='submit'] {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  padding: 12px 24px;
  background: var(--pecivo);
  color: var(--bila);
  font: inherit;
  cursor: pointer;
  transition: background 150ms ease;
}
button[type='submit']:hover:enabled { background: var(--pecivo-tmave); }
button[type='submit']:disabled { opacity: 0.6; cursor: default; }

.hotovo {
  padding: 24px;
  background: var(--bila);
  border: 1px solid var(--ok);
  border-radius: 16px;
  color: var(--ok);
  font-weight: 600;
}
```

# --solution--

## --file-- validace.js

```js
/**
 * Zkontroluje data přihlášky.
 * @param {{ jmeno: string, email: string, pocet: number, termin: string, souhlas: boolean }} data
 * @returns {Record<string, string>} chyby podle jména pole; prázdný objekt = vše v pořádku
 */
export function zkontroluj(data) {
  const chyby = {};

  if (data.jmeno.trim().length < 2) {
    chyby.jmeno = 'Napiš prosím jméno a příjmení.';
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email.trim())) {
    chyby.email = 'E-mail musí obsahovat zavináč a za ním tečku, třeba eva@example.com.';
  }
  if (!Number.isInteger(data.pocet) || data.pocet < 1 || data.pocet > 8) {
    chyby.pocet = 'Míst rezervujeme 1 až 8, a to celá.';
  }
  if (data.termin === '') {
    chyby.termin = 'Vyber si prosím termín.';
  }
  if (!data.souhlas) {
    chyby.souhlas = 'Bez souhlasu se storno podmínkami přihlášku bohužel nevezmeme.';
  }

  return chyby;
}
```

## --file-- App.jsx

```jsx
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { odesliPrihlasku } from './api';
import { zkontroluj } from './validace';
import './styles.css';

const terminy = [
  { hodnota: 'kveten', popisek: '17.–18. května' },
  { hodnota: 'cerven', popisek: '21.–22. června' },
  { hodnota: 'zari', popisek: '13.–14. září' },
];

function Odeslat() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Odesílám…' : 'Přihlásit se'}
    </button>
  );
}

/** Atributy, které pole dostane jen tehdy, když má chybu. */
function vazbaNaChybu(jmeno, chyba) {
  return {
    'aria-invalid': chyba ? true : undefined,
    'aria-describedby': chyba ? `${jmeno}-chyba` : undefined,
  };
}

function Chyba({ jmeno, text }) {
  if (!text) return null;
  return <p className="chyba" id={`${jmeno}-chyba`}>{text}</p>;
}

export default function App() {
  const [stav, akce] = useActionState(async (predchozi, formData) => {
    const data = {
      jmeno: String(formData.get('jmeno') ?? ''),
      email: String(formData.get('email') ?? ''),
      pocet: Number(formData.get('pocet')),
      termin: String(formData.get('termin') ?? ''),
      souhlas: formData.get('souhlas') === 'on',
    };

    const chyby = zkontroluj(data);
    if (Object.keys(chyby).length > 0) return { chyby, data, hotovo: false };

    await odesliPrihlasku(data);
    return { chyby: {}, data, hotovo: true };
  }, { chyby: {}, data: { jmeno: '', email: '', pocet: 1, termin: '', souhlas: false }, hotovo: false });

  return (
    <main className="obal">
      <h1>Víkend s chlebem</h1>
      <p className="perex">
        Dva dny v pekárně U Mlýna: kvásek, hnětení, pečení v peci na dřevo.
        Bochník si odvezeš domů.
      </p>

      {stav.hotovo ? (
        <p className="hotovo" role="status">
          Přihlášku máme. Podrobnosti ti pošleme na {stav.data.email}.
        </p>
      ) : (
        <form className="formular" action={akce} noValidate>
          <div className="pole">
            <label htmlFor="jmeno">Jméno a příjmení</label>
            <input id="jmeno" name="jmeno" defaultValue={stav.data.jmeno} {...vazbaNaChybu('jmeno', stav.chyby.jmeno)} />
            <Chyba jmeno="jmeno" text={stav.chyby.jmeno} />
          </div>

          <div className="pole">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" defaultValue={stav.data.email} {...vazbaNaChybu('email', stav.chyby.email)} />
            <Chyba jmeno="email" text={stav.chyby.email} />
          </div>

          <div className="pole">
            <label htmlFor="pocet">Počet míst</label>
            <input id="pocet" name="pocet" type="number" defaultValue={stav.data.pocet} {...vazbaNaChybu('pocet', stav.chyby.pocet)} />
            <Chyba jmeno="pocet" text={stav.chyby.pocet} />
          </div>

          <div className="pole">
            <label htmlFor="termin">Termín</label>
            <select id="termin" name="termin" defaultValue={stav.data.termin} {...vazbaNaChybu('termin', stav.chyby.termin)}>
              <option value="">Vyber termín</option>
              {terminy.map((termin) => (
                <option key={termin.hodnota} value={termin.hodnota}>{termin.popisek}</option>
              ))}
            </select>
            <Chyba jmeno="termin" text={stav.chyby.termin} />
          </div>

          <div className="pole pole-souhlas">
            <input id="souhlas" name="souhlas" type="checkbox" defaultChecked={stav.data.souhlas} {...vazbaNaChybu('souhlas', stav.chyby.souhlas)} />
            <label htmlFor="souhlas">Souhlasím se storno podmínkami</label>
            <Chyba jmeno="souhlas" text={stav.chyby.souhlas} />
          </div>

          <Odeslat />
        </form>
      )}
    </main>
  );
}
```

# --approaches--

## --approach-- Akce formuláře a useActionState

Řešení výš. Pole jsou neřízená, hodnoty se čtou z `FormData` až při odeslání
a stav odesílání si tlačítko zjistí samo přes `useFormStatus`. Nejméně kódu,
nejmíň překreslování — a nejblíž tomu, jak se formuláře píšou v Next.js.

### --file-- validace.js

```js
/**
 * Zkontroluje data přihlášky.
 * @param {{ jmeno: string, email: string, pocet: number, termin: string, souhlas: boolean }} data
 * @returns {Record<string, string>} chyby podle jména pole; prázdný objekt = vše v pořádku
 */
export function zkontroluj(data) {
  const chyby = {};

  if (data.jmeno.trim().length < 2) {
    chyby.jmeno = 'Napiš prosím jméno a příjmení.';
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email.trim())) {
    chyby.email = 'E-mail musí obsahovat zavináč a za ním tečku, třeba eva@example.com.';
  }
  if (!Number.isInteger(data.pocet) || data.pocet < 1 || data.pocet > 8) {
    chyby.pocet = 'Míst rezervujeme 1 až 8, a to celá.';
  }
  if (data.termin === '') {
    chyby.termin = 'Vyber si prosím termín.';
  }
  if (!data.souhlas) {
    chyby.souhlas = 'Bez souhlasu se storno podmínkami přihlášku bohužel nevezmeme.';
  }

  return chyby;
}
```

### --file-- App.jsx

```jsx
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { odesliPrihlasku } from './api';
import { zkontroluj } from './validace';
import './styles.css';

const terminy = [
  { hodnota: 'kveten', popisek: '17.–18. května' },
  { hodnota: 'cerven', popisek: '21.–22. června' },
  { hodnota: 'zari', popisek: '13.–14. září' },
];

function Odeslat() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Odesílám…' : 'Přihlásit se'}
    </button>
  );
}

function vazbaNaChybu(jmeno, chyba) {
  return {
    'aria-invalid': chyba ? true : undefined,
    'aria-describedby': chyba ? `${jmeno}-chyba` : undefined,
  };
}

function Chyba({ jmeno, text }) {
  if (!text) return null;
  return <p className="chyba" id={`${jmeno}-chyba`}>{text}</p>;
}

export default function App() {
  const [stav, akce] = useActionState(async (predchozi, formData) => {
    const data = {
      jmeno: String(formData.get('jmeno') ?? ''),
      email: String(formData.get('email') ?? ''),
      pocet: Number(formData.get('pocet')),
      termin: String(formData.get('termin') ?? ''),
      souhlas: formData.get('souhlas') === 'on',
    };

    const chyby = zkontroluj(data);
    if (Object.keys(chyby).length > 0) return { chyby, data, hotovo: false };

    await odesliPrihlasku(data);
    return { chyby: {}, data, hotovo: true };
  }, { chyby: {}, data: { jmeno: '', email: '', pocet: 1, termin: '', souhlas: false }, hotovo: false });

  return (
    <main className="obal">
      <h1>Víkend s chlebem</h1>
      <p className="perex">
        Dva dny v pekárně U Mlýna: kvásek, hnětení, pečení v peci na dřevo.
        Bochník si odvezeš domů.
      </p>

      {stav.hotovo ? (
        <p className="hotovo" role="status">
          Přihlášku máme. Podrobnosti ti pošleme na {stav.data.email}.
        </p>
      ) : (
        <form className="formular" action={akce} noValidate>
          <div className="pole">
            <label htmlFor="jmeno">Jméno a příjmení</label>
            <input id="jmeno" name="jmeno" defaultValue={stav.data.jmeno} {...vazbaNaChybu('jmeno', stav.chyby.jmeno)} />
            <Chyba jmeno="jmeno" text={stav.chyby.jmeno} />
          </div>

          <div className="pole">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" defaultValue={stav.data.email} {...vazbaNaChybu('email', stav.chyby.email)} />
            <Chyba jmeno="email" text={stav.chyby.email} />
          </div>

          <div className="pole">
            <label htmlFor="pocet">Počet míst</label>
            <input id="pocet" name="pocet" type="number" defaultValue={stav.data.pocet} {...vazbaNaChybu('pocet', stav.chyby.pocet)} />
            <Chyba jmeno="pocet" text={stav.chyby.pocet} />
          </div>

          <div className="pole">
            <label htmlFor="termin">Termín</label>
            <select id="termin" name="termin" defaultValue={stav.data.termin} {...vazbaNaChybu('termin', stav.chyby.termin)}>
              <option value="">Vyber termín</option>
              {terminy.map((termin) => (
                <option key={termin.hodnota} value={termin.hodnota}>{termin.popisek}</option>
              ))}
            </select>
            <Chyba jmeno="termin" text={stav.chyby.termin} />
          </div>

          <div className="pole pole-souhlas">
            <input id="souhlas" name="souhlas" type="checkbox" defaultChecked={stav.data.souhlas} {...vazbaNaChybu('souhlas', stav.chyby.souhlas)} />
            <label htmlFor="souhlas">Souhlasím se storno podmínkami</label>
            <Chyba jmeno="souhlas" text={stav.chyby.souhlas} />
          </div>

          <Odeslat />
        </form>
      )}
    </main>
  );
}
```

## --approach-- Řízená pole a onSubmit

Klasika, kterou potkáš v každém starším projektu: jeden objekt ve `useState`
drží všechny hodnoty, `onSubmit` zavolá `zkontroluj` a uloží chyby do dalšího
stavu. Víc kódu a víc překreslování, zato hodnoty máš k dispozici kdykoli — což
se hodí, když na sobě pole závisí (schování části formuláře podle zvolené volby).

### --file-- validace.js

```js
/**
 * Zkontroluje data přihlášky.
 * @param {{ jmeno: string, email: string, pocet: number, termin: string, souhlas: boolean }} data
 * @returns {Record<string, string>} chyby podle jména pole; prázdný objekt = vše v pořádku
 */
export function zkontroluj(data) {
  const chyby = {};

  if (data.jmeno.trim().length < 2) {
    chyby.jmeno = 'Napiš prosím jméno a příjmení.';
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email.trim())) {
    chyby.email = 'E-mail musí obsahovat zavináč a za ním tečku, třeba eva@example.com.';
  }
  if (!Number.isInteger(data.pocet) || data.pocet < 1 || data.pocet > 8) {
    chyby.pocet = 'Míst rezervujeme 1 až 8, a to celá.';
  }
  if (data.termin === '') {
    chyby.termin = 'Vyber si prosím termín.';
  }
  if (!data.souhlas) {
    chyby.souhlas = 'Bez souhlasu se storno podmínkami přihlášku bohužel nevezmeme.';
  }

  return chyby;
}
```

### --file-- App.jsx

```jsx
import { useState } from 'react';
import { odesliPrihlasku } from './api';
import { zkontroluj } from './validace';
import './styles.css';

const terminy = [
  { hodnota: 'kveten', popisek: '17.–18. května' },
  { hodnota: 'cerven', popisek: '21.–22. června' },
  { hodnota: 'zari', popisek: '13.–14. září' },
];

const prazdne = { jmeno: '', email: '', pocet: 1, termin: '', souhlas: false };

export default function App() {
  const [hodnoty, setHodnoty] = useState(prazdne);
  const [chyby, setChyby] = useState({});
  const [odesila, setOdesila] = useState(false);
  const [hotovo, setHotovo] = useState(false);

  function zmen(jmeno, hodnota) {
    setHodnoty((stare) => ({ ...stare, [jmeno]: hodnota }));
  }

  function vazba(jmeno) {
    return {
      'aria-invalid': chyby[jmeno] ? true : undefined,
      'aria-describedby': chyby[jmeno] ? `${jmeno}-chyba` : undefined,
    };
  }

  async function odesli(udalost) {
    udalost.preventDefault();
    const nalezene = zkontroluj(hodnoty);
    setChyby(nalezene);
    if (Object.keys(nalezene).length > 0) return;

    setOdesila(true);
    await odesliPrihlasku(hodnoty);
    setOdesila(false);
    setHotovo(true);
  }

  if (hotovo) {
    return (
      <main className="obal">
        <h1>Víkend s chlebem</h1>
        <p className="hotovo" role="status">
          Přihlášku máme. Podrobnosti ti pošleme na {hodnoty.email}.
        </p>
      </main>
    );
  }

  return (
    <main className="obal">
      <h1>Víkend s chlebem</h1>
      <p className="perex">
        Dva dny v pekárně U Mlýna: kvásek, hnětení, pečení v peci na dřevo.
        Bochník si odvezeš domů.
      </p>

      <form className="formular" onSubmit={odesli} noValidate>
        <div className="pole">
          <label htmlFor="jmeno">Jméno a příjmení</label>
          <input id="jmeno" name="jmeno" value={hodnoty.jmeno} onChange={(u) => zmen('jmeno', u.target.value)} {...vazba('jmeno')} />
          {chyby.jmeno && <p className="chyba" id="jmeno-chyba">{chyby.jmeno}</p>}
        </div>

        <div className="pole">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" value={hodnoty.email} onChange={(u) => zmen('email', u.target.value)} {...vazba('email')} />
          {chyby.email && <p className="chyba" id="email-chyba">{chyby.email}</p>}
        </div>

        <div className="pole">
          <label htmlFor="pocet">Počet míst</label>
          <input id="pocet" name="pocet" type="number" value={hodnoty.pocet} onChange={(u) => zmen('pocet', Number(u.target.value))} {...vazba('pocet')} />
          {chyby.pocet && <p className="chyba" id="pocet-chyba">{chyby.pocet}</p>}
        </div>

        <div className="pole">
          <label htmlFor="termin">Termín</label>
          <select id="termin" name="termin" value={hodnoty.termin} onChange={(u) => zmen('termin', u.target.value)} {...vazba('termin')}>
            <option value="">Vyber termín</option>
            {terminy.map((termin) => (
              <option key={termin.hodnota} value={termin.hodnota}>{termin.popisek}</option>
            ))}
          </select>
          {chyby.termin && <p className="chyba" id="termin-chyba">{chyby.termin}</p>}
        </div>

        <div className="pole pole-souhlas">
          <input id="souhlas" name="souhlas" type="checkbox" checked={hodnoty.souhlas} onChange={(u) => zmen('souhlas', u.target.checked)} {...vazba('souhlas')} />
          <label htmlFor="souhlas">Souhlasím se storno podmínkami</label>
          {chyby.souhlas && <p className="chyba" id="souhlas-chyba">{chyby.souhlas}</p>}
        </div>

        <button type="submit" disabled={odesila}>{odesila ? 'Odesílám…' : 'Přihlásit se'}</button>
      </form>
    </main>
  );
}
```

# --review--

Testy hlídají chování. Tohle si projdi sám, než formulář uzavřeš.

## --rubric--

- Hlášky mluví k člověku („Vyber si prosím termín."), ne k programátorovi
  („Pole termin je povinné.").
- Formulář jde vyplnit a odeslat jen klávesnicí, včetně zaškrtávátka.
- Po odeslání s chybami je vidět, které pole je první špatně, bez scrollování
  nahoru a dolů.
- Vzhled sedí k tématu, které sis vybral: barvy, nadpis i texty jsou tvoje, ne
  z pekárny.
- `zkontroluj` je čitelná: jedno pravidlo na jednu podmínku, bez vnořených ifů.

## --extensions--

Rozšíření bez testů: přesuň fokus na první vadné pole po odeslání; ukaž hlášku
u pole už po jeho opuštění (`onBlur`) místo až po odeslání; přidej pole, které se
objeví jen při určité volbě termínu; nech server jednou za čas odeslání odmítnout
a ukaž chybu, kterou vrátil.
