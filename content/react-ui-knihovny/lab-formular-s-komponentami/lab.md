---
title: Přihláška s komponentami
runtime: react
libs: tailwind
see: react-ui-knihovny/shadcn-a-radix#radix-primitiva-chovani-bez-vzhledu
---

# --description--

## Zadání

Horolezecká škola chce přihlášku na letní kurz, kterou zvládne vyplnit i člověk
s telefonem v jedné ruce, i člověk, který stránku jen poslouchá ze čtečky. Postav ji
ve třech krocích — **Kontakt**, **Kurz**, **Podmínky** — a před odesláním ukaž souhrn
v dialogu.

Tohle je zkouška celé sekce najednou: vlastní komponenty s variantami, Radix
primitiva, Motion a přístupnost. Nikdo ti neřekne, v jakém souboru co má být.

**Téma, texty a vzhled jsou tvoje volba.** Klidně z toho udělej přihlášku na kurz
keramiky nebo registraci na závod. Testy hledají prvky podle role, přístupného
názvu a chování, ne podle tříd.

## Co je připravené

- `data.ts` — termíny kurzu (`terms`), varianty kurzu (`courseVariants`), formát ceny
  a prázdná přihláška `emptyApplication`. Texty klidně přepiš, **`title` variant
  a `label` termínů ale musí být v UI vidět** (v nabídce i v souhrnu).
- `components/ui/button.tsx` — tlačítko s variantami přes `cva`, jak ho znáš
  z workshopu.
- `components/ui/text-field.tsx` a `lib/validation.ts` — prázdné kostry, které doplníš.
- `lib/utils.ts` s `cn()` a `styles.css` s barvami v `@theme`.

## Uživatelské příběhy

- Když uživatel otevře přihlášku, vidí první krok s nadpisem, polem pro jméno
  a e-mail. U každého pole je popisek a krátký popis, k čemu údaj potřebujete.
- Když uživatel zkusí pokračovat s nevyplněným nebo špatným údajem, zůstane na kroku
  a u vadného pole se objeví hláška. Čtečka ji přečte spolu s polem.
- Když uživatel chybu opraví, hláška z pole zmizí.
- Když krok projde, přesune se přihláška animací na další krok a fokus skočí na
  nadpis nového kroku — uživatel klávesnice nezačíná zase od začátku stránky.
- Ve druhém kroku uživatel vybere termín a jednu variantu kurzu. Bez výběru dál
  nepustíš.
- Tlačítko Zpět vrátí uživatele o krok zpátky a nic z vyplněného se neztratí.
- Ve třetím kroku musí uživatel souhlasit s podmínkami, jinak souhrn neuvidí.
- Souhrn je dialog s nadpisem: jméno, e-mail, termín a varianta. Escape ho zavře bez
  odeslání a fokus se vrátí na tlačítko, které ho otevřelo.
- Po odeslání dialog zmizí a stránka oznámí, že přihláška odešla — čtečka to ohlásí
  sama.
- Kdo má v systému zapnuté omezení pohybu, nevidí žádné posuny, jen prolnutí.

## Technické požadavky

- Pole jména má `name="fullName"`, pole e-mailu `name="email"`.
- Tlačítka se hledají podle textu: pokračování obsahuje slovo **Pokračovat**
  (nebo Další), návrat **Zpět**, otevření souhrnu **Zkontrolovat** (nebo Souhrn)
  a odeslání v dialogu **Odeslat**.
- Termín vyber buď nativním `<select>`, nebo Radix `Select`. Variantu přes
  `<input type="radio">` ve `fieldset`, nebo Radix `RadioGroup`. Souhlas přes
  `<input type="checkbox">`, nebo Radix `Checkbox`. Rozhodnutí je tvoje.
- Souhrn je Radix `Dialog`.
- Každé pole, které může být vadné, dostane při chybě `aria-invalid="true"`
  a `aria-describedby` s `id` hlášky. Id vyrob přes `useId`, ne natvrdo.

> [!TIP]
> Začni komponentou `TextField` a prvním krokem. Až projdou první čtyři požadavky,
> máš vzor, který ve zbylých krocích jen opakuješ s jiným primitivem.

# --hints--

Pole jména a e-mailu mají popisek a popis, který čtečka přečte spolu s polem.

```js
for (const name of ['fullName', 'email']) {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `na prvním kroku chybí pole name="${name}"`);
  const label = input.labels && input.labels[0];
  assert.ok(label && label.textContent.trim().length > 0, `pole ${name} nemá viditelný popisek <label> svázaný přes htmlFor a id`);
  const ids = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  assert.ok(ids.length > 0, `pole ${name} má mít aria-describedby s id popisu už před první chybou`);
  for (const id of ids) {
    const target = document.getElementById(id);
    assert.ok(target, `aria-describedby pole ${name} ukazuje na id „${id}", které na stránce není`);
    assert.ok(target.textContent.trim().length > 5, `popis pole ${name} má být věta, ne prázdný prvek`);
  }
}
```

Každé pole má vlastní `id`, takže popisky ani popisy se nepletou.

```js
const inputs = ['fullName', 'email'].map((name) => document.querySelector(`input[name="${name}"]`));
assert.ok(inputs.every(Boolean), 'na prvním kroku mají být pole fullName a email');
assert.notEqual(inputs[0].id, inputs[1].id, 'pole jména a e-mailu mají stejné id — každá instance TextField potřebuje vlastní (useId)');
const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual(duplicates, [], 'na stránce se opakuje stejné id — popisek nebo aria-describedby pak ukazuje na špatný prvek');
for (const input of inputs) {
  const described = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  const other = inputs.find((item) => item !== input);
  const otherDescribed = (other.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  assert.ok(described.every((id) => !otherDescribed.includes(id)), 'obě pole ukazují přes aria-describedby na stejný popis');
}
```

Pokus pokračovat s prázdnými poli nechá uživatele na prvním kroku a u obou polí ukáže hlášku propojenou s polem.

```js
const shown = (el) => Boolean(el) && !el.closest('[aria-hidden="true"]');
const pressButton = async (pattern) => {
  const el = [...document.querySelectorAll('button')].filter(shown).find((item) => pattern.test(item.textContent));
  assert.ok(el, `na stránce chybí tlačítko s textem ${pattern}`);
  el.focus();
  await helpers.click(el);
  await helpers.flush();
};
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => document.querySelector('input[name="email"]')?.getAttribute('aria-invalid') === 'true', 3000).catch(() => {});
for (const name of ['fullName', 'email']) {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `po odeslání prázdného kroku má pole ${name} zůstat na stránce — krok neprošel`);
  assert.equal(input.getAttribute('aria-invalid'), 'true', `prázdné pole ${name} má mít aria-invalid="true"`);
  const ids = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  assert.ok(ids.length >= 2, `pole ${name} má přes aria-describedby ukazovat na popis i na hlášku (čekám dvě id)`);
  for (const id of ids) {
    assert.ok(document.getElementById(id), `aria-describedby pole ${name} ukazuje na id „${id}", které na stránce není`);
  }
  const texts = ids.map((id) => document.getElementById(id).textContent.trim());
  assert.ok(texts.every((text) => text.length > 5), `popis i hláška u pole ${name} mají být věty`);
}
```

Když uživatel opraví jméno a zkusí to znovu, u jména chyba zmizí a u e-mailu zůstane.

```js
const shown = (el) => Boolean(el) && !el.closest('[aria-hidden="true"]');
const pressButton = async (pattern) => {
  const el = [...document.querySelectorAll('button')].filter(shown).find((item) => pattern.test(item.textContent));
  assert.ok(el, `na stránce chybí tlačítko s textem ${pattern}`);
  el.focus();
  await helpers.click(el);
  await helpers.flush();
};
const fill = async (name, text) => {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `ve formuláři chybí pole name="${name}"`);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await helpers.flush();
};
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => document.querySelector('input[name="fullName"]')?.getAttribute('aria-invalid') === 'true', 3000);
const errorIds = (document.querySelector('input[name="fullName"]').getAttribute('aria-describedby') ?? '').split(/\s+/);
await fill('fullName', 'Tereza Malá');
await fill('email', 'tereza.mala@seznam');
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => document.querySelector('input[name="fullName"]')?.getAttribute('aria-invalid') !== 'true', 3000).catch(() => {});
const fullName = document.querySelector('input[name="fullName"]');
const email = document.querySelector('input[name="email"]');
assert.ok(fullName && email, 'e-mail bez tečky za zavináčem nemá krok pustit dál');
assert.notEqual(fullName.getAttribute('aria-invalid'), 'true', 'opravené jméno už nemá mít aria-invalid="true"');
const nowIds = (fullName.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
assert.ok(nowIds.length < errorIds.length, 'opravené jméno už nemá přes aria-describedby odkazovat na hlášku');
assert.equal(email.getAttribute('aria-invalid'), 'true', 'e-mail „tereza.mala@seznam" je pořád špatně a má mít aria-invalid="true"');
for (const id of (email.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)) {
  assert.ok(document.getElementById(id), `aria-describedby e-mailu ukazuje na id „${id}", které na stránce není`);
}
```

Tlačítko pro pokračování je opravdové tlačítko a po platném prvním kroku skočí fokus na nadpis druhého kroku.

```js
const shown = (el) => Boolean(el) && !el.closest('[aria-hidden="true"]');
const headings = 'h1, h2, h3, h4, h5, h6, [role="heading"]';
const fill = async (name, text) => {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `ve formuláři chybí pole name="${name}"`);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await helpers.flush();
};
const input = document.querySelector('input[name="fullName"]');
assert.ok(input, 'na prvním kroku chybí pole fullName');
const firstHeading = [...document.querySelectorAll(headings)].filter((h) => h.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).pop();
assert.ok(firstHeading, 'první krok má mít nad poli vlastní nadpis');
const firstText = firstHeading.textContent.trim();
await fill('fullName', 'Tereza Malá');
await fill('email', 'tereza.mala@seznam.cz');
const next = [...document.querySelectorAll('button')].filter(shown).find((item) => /pokračovat|další|dál/i.test(item.textContent));
assert.ok(next, 'na prvním kroku chybí tlačítko Pokračovat — musí to být <button>, aby šlo zmáčknout klávesnicí');
next.focus();
await helpers.click(next);
await helpers.flush();
const focused = await helpers.waitFor(() => {
  const el = document.activeElement;
  return el && el.matches(headings) && el.textContent.trim() !== firstText ? el : null;
}, 3000).catch(() => null);
assert.ok(focused, `po přechodu na druhý krok má být fokus na jeho nadpisu (teď je na <${document.activeElement?.tagName.toLowerCase()}>). Nadpis potřebuje tabIndex={-1} a focus() až ve chvíli, kdy je v DOM`);
```

Přechod mezi kroky je animovaný: odcházející krok zmizí až po své odchodové animaci, ne ve stejném okamžiku, kdy se objeví nový.

```js
const source = Object.entries(files)
  .filter(([name]) => /\.(jsx|tsx|js|ts)$/.test(name))
  .map(([, content]) => helpers.stripComments(content, 'js'))
  .join('\n');
assert.match(source, /AnimatePresence/, 'odchod kroku potřebuje AnimatePresence');
assert.match(source, /\bexit\s*[=:]/, 'odcházející krok potřebuje exit');
const headings = 'h1, h2, h3, h4, h5, h6, [role="heading"]';
const fill = async (name, text) => {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `ve formuláři chybí pole name="${name}"`);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await helpers.flush();
};
await fill('fullName', 'Tereza Malá');
await fill('email', 'tereza.mala@seznam.cz');
const input = document.querySelector('input[name="fullName"]');
const oldHeading = [...document.querySelectorAll(headings)].filter((h) => h.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).pop();
assert.ok(oldHeading, 'první krok má mít nad poli vlastní nadpis');
const next = [...document.querySelectorAll('button')].find((item) => /pokračovat|další|dál/i.test(item.textContent));
assert.ok(next, 'na prvním kroku chybí tlačítko Pokračovat');
next.click();
await new Promise((resolve) => setTimeout(resolve, 0));
assert.ok(oldHeading.isConnected, 'první krok zmizel hned po kliknutí — odchodová animace neproběhla. Krok uvnitř AnimatePresence potřebuje motion prvek s exit a key, který se s krokem mění');
const swapped = await helpers.waitFor(
  () => !oldHeading.isConnected && document.querySelector('[role="radio"], input[type="radio"]'),
  3000,
).catch(() => false);
assert.ok(swapped, 'po odchodové animaci má první krok zmizet a místo něj se objevit druhý krok s volbou varianty');
```

Na druhém kroku má výběr termínu i skupina variant přístupný název a variant je víc než jedna.

```js
const shown = (el) => Boolean(el) && !el.closest('[aria-hidden="true"]');
const idsText = (ids) => (ids ?? '').split(/\s+/).filter(Boolean).map((id) => document.getElementById(id)?.textContent.trim() ?? '').join(' ').trim();
const radios = () => [...document.querySelectorAll('[role="radio"], input[type="radio"]')].filter(shown);
const fill = async (name, text) => {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `ve formuláři chybí pole name="${name}"`);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await helpers.flush();
};
await fill('fullName', 'Tereza Malá');
await fill('email', 'tereza.mala@seznam.cz');
const next = [...document.querySelectorAll('button')].filter(shown).find((item) => /pokračovat|další|dál/i.test(item.textContent));
await helpers.click(next);
await helpers.flush();
await helpers.waitFor(() => !document.querySelector('input[name="fullName"]') && radios().length > 0, 3000);
const term = [...document.querySelectorAll('select, [role="combobox"]')].find(shown);
assert.ok(term, 'na druhém kroku chybí výběr termínu (<select> nebo Radix Select)');
const termName = idsText(term.getAttribute('aria-labelledby')) || term.getAttribute('aria-label') || [...(term.labels ?? [])].map((l) => l.textContent.trim()).join(' ');
assert.ok(termName.trim(), 'výběr termínu nemá přístupný název — svaž ho s <label> přes htmlFor a id');
const radio = radios()[0];
const group = radio.closest('[role="radiogroup"], fieldset');
assert.ok(group, 'volby varianty mají být ve skupině: fieldset, nebo Radix RadioGroup (role="radiogroup")');
const legend = group.tagName === 'FIELDSET' ? group.querySelector('legend')?.textContent.trim() : '';
const groupName = idsText(group.getAttribute('aria-labelledby')) || group.getAttribute('aria-label') || legend;
assert.ok(groupName, 'skupina variant nemá název — čtečka neřekne, co se vybírá (legend, nebo aria-labelledby)');
const inGroup = radios().filter((item) => group.contains(item));
assert.ok(inGroup.length >= 2, 've skupině mají být aspoň dvě varianty kurzu');
for (const item of inGroup) {
  const name = [...(item.labels ?? [])].map((l) => l.textContent.trim()).join(' ') || item.getAttribute('aria-label') || idsText(item.getAttribute('aria-labelledby'));
  assert.ok(name, 'každá varianta potřebuje popisek svázaný s volbou');
}
```

Bez vybraného termínu a varianty nepustí druhý krok dál a u obou ukáže hlášku.

```js
const shown = (el) => Boolean(el) && !el.closest('[aria-hidden="true"]');
const idsText = (ids) => (ids ?? '').split(/\s+/).filter(Boolean).map((id) => document.getElementById(id)?.textContent.trim() ?? '').join(' ').trim();
const radios = () => [...document.querySelectorAll('[role="radio"], input[type="radio"]')].filter(shown);
const pressNext = async () => {
  const next = [...document.querySelectorAll('button')].filter(shown).find((item) => /pokračovat|další|dál/i.test(item.textContent));
  assert.ok(next, 'na kroku chybí tlačítko Pokračovat');
  await helpers.click(next);
  await helpers.flush();
};
const fill = async (name, text) => {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `ve formuláři chybí pole name="${name}"`);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await helpers.flush();
};
await fill('fullName', 'Tereza Malá');
await fill('email', 'tereza.mala@seznam.cz');
await pressNext();
await helpers.waitFor(() => !document.querySelector('input[name="fullName"]') && radios().length > 0, 3000);
await pressNext();
const term = () => [...document.querySelectorAll('select, [role="combobox"]')].find(shown);
await helpers.waitFor(() => term()?.getAttribute('aria-invalid') === 'true', 3000).catch(() => {});
assert.ok(radios().length > 0, 'bez výběru termínu a varianty má uživatel zůstat na druhém kroku');
assert.equal(term().getAttribute('aria-invalid'), 'true', 'nevybraný termín má mít aria-invalid="true"');
assert.ok(idsText(term().getAttribute('aria-describedby')).length > 5, 'výběr termínu má přes aria-describedby ukazovat na hlášku');
const group = radios()[0].closest('[role="radiogroup"], fieldset');
assert.ok(group, 'volby varianty mají být ve skupině');
assert.ok(idsText(group.getAttribute('aria-describedby')).length > 5, 'skupina variant má přes aria-describedby ukazovat na hlášku o chybějícím výběru');
```

Vybraná varianta je vždy jen jedna.

```js
const shown = (el) => Boolean(el) && !el.closest('[aria-hidden="true"]');
const radios = () => [...document.querySelectorAll('[role="radio"], input[type="radio"]')].filter(shown);
const isChecked = (el) => el.getAttribute('aria-checked') === 'true' || el.checked === true;
const fill = async (name, text) => {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `ve formuláři chybí pole name="${name}"`);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await helpers.flush();
};
await fill('fullName', 'Tereza Malá');
await fill('email', 'tereza.mala@seznam.cz');
const next = [...document.querySelectorAll('button')].filter(shown).find((item) => /pokračovat|další|dál/i.test(item.textContent));
await helpers.click(next);
await helpers.flush();
await helpers.waitFor(() => !document.querySelector('input[name="fullName"]') && radios().length >= 2, 3000);
await helpers.click(radios()[0]);
await helpers.flush();
assert.ok(isChecked(radios()[0]), 'po kliknutí má být první varianta vybraná');
await helpers.click(radios()[1]);
await helpers.flush();
assert.equal(radios().filter(isChecked).length, 1, 'po výběru druhé varianty má být vybraná jen jedna');
assert.ok(isChecked(radios()[1]), 'po kliknutí na druhou variantu má být vybraná ona');
```

Tlačítko Zpět vrátí uživatele na první krok s vyplněnými údaji a fokusem na nadpisu.

```js
const shown = (el) => Boolean(el) && !el.closest('[aria-hidden="true"]');
const headings = 'h1, h2, h3, h4, h5, h6, [role="heading"]';
const radios = () => [...document.querySelectorAll('[role="radio"], input[type="radio"]')].filter(shown);
const pressButton = async (pattern) => {
  const el = [...document.querySelectorAll('button')].filter(shown).find((item) => pattern.test(item.textContent));
  assert.ok(el, `na stránce chybí tlačítko s textem ${pattern}`);
  el.focus();
  await helpers.click(el);
  await helpers.flush();
};
const fill = async (name, text) => {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `ve formuláři chybí pole name="${name}"`);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await helpers.flush();
};
await fill('fullName', 'Tereza Malá');
await fill('email', 'tereza.mala@seznam.cz');
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => !document.querySelector('input[name="fullName"]') && radios().length > 0, 3000);
await pressButton(/zpět/i);
await helpers.waitFor(() => document.querySelector('input[name="fullName"]') && radios().length === 0, 3000);
assert.equal(document.querySelector('input[name="fullName"]').value, 'Tereza Malá', 'po návratu má jméno zůstat vyplněné');
assert.equal(document.querySelector('input[name="email"]').value, 'tereza.mala@seznam.cz', 'po návratu má e-mail zůstat vyplněný');
const input = document.querySelector('input[name="fullName"]');
const heading = [...document.querySelectorAll(headings)].filter((h) => h.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).pop();
const focused = await helpers.waitFor(() => document.activeElement === heading, 3000).catch(() => false);
assert.ok(focused, 'po návratu na první krok má být fokus na jeho nadpisu');
```

Třetí krok bez souhlasu s podmínkami souhrn neotevře a u souhlasu ukáže hlášku.

```js
const shown = (el) => Boolean(el) && !el.closest('[aria-hidden="true"]');
const idsText = (ids) => (ids ?? '').split(/\s+/).filter(Boolean).map((id) => document.getElementById(id)?.textContent.trim() ?? '').join(' ').trim();
const radios = () => [...document.querySelectorAll('[role="radio"], input[type="radio"]')].filter(shown);
const checkbox = () => [...document.querySelectorAll('[role="checkbox"], input[type="checkbox"]')].find(shown);
const pressButton = async (pattern) => {
  const el = [...document.querySelectorAll('button')].filter(shown).find((item) => pattern.test(item.textContent));
  assert.ok(el, `na stránce chybí tlačítko s textem ${pattern}`);
  el.focus();
  await helpers.click(el);
  await helpers.flush();
};
const fill = async (name, text) => {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `ve formuláři chybí pole name="${name}"`);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await helpers.flush();
};
const chooseTerm = async (index) => {
  const native = [...document.querySelectorAll('select')].find(shown);
  if (native) {
    const option = [...native.options].filter((item) => item.value)[index];
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(native, option.value);
    native.dispatchEvent(new Event('change', { bubbles: true }));
    await helpers.flush();
    return;
  }
  const trigger = document.querySelector('[role="combobox"]');
  assert.ok(trigger, 'na druhém kroku chybí výběr termínu');
  trigger.focus();
  await helpers.click(trigger);
  await helpers.flush();
  await helpers.waitFor(() => document.querySelectorAll('[role="option"]').length > index, 2000);
  const option = document.querySelectorAll('[role="option"]')[index];
  option.focus();
  await helpers.press(option, 'Enter');
  await helpers.flush();
  await helpers.waitFor(() => !document.querySelector('[role="listbox"]'), 2000).catch(() => {});
};
await fill('fullName', 'Tereza Malá');
await fill('email', 'tereza.mala@seznam.cz');
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => !document.querySelector('input[name="fullName"]') && radios().length > 0, 3000);
await chooseTerm(1);
await helpers.click(radios()[1]);
await helpers.flush();
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => checkbox() && radios().length === 0, 3000);
await pressButton(/zkontrolovat|souhrn|shrnutí/i);
await helpers.waitFor(() => checkbox()?.getAttribute('aria-invalid') === 'true', 3000).catch(() => {});
assert.equal(document.querySelector('[role="dialog"], dialog[open]'), null, 'bez souhlasu s podmínkami se souhrn nemá otevřít');
assert.equal(checkbox().getAttribute('aria-invalid'), 'true', 'nezaškrtnutý souhlas má mít aria-invalid="true"');
assert.ok(idsText(checkbox().getAttribute('aria-describedby')).length > 5, 'souhlas má přes aria-describedby ukazovat na hlášku');
```

Souhrn je dialog s názvem a ukazuje jméno, e-mail, vybraný termín i variantu.

```js
const { terms, courseVariants } = await helpers.importFile('data.ts');
const shown = (el) => Boolean(el) && !el.closest('[aria-hidden="true"]');
const idsText = (ids) => (ids ?? '').split(/\s+/).filter(Boolean).map((id) => document.getElementById(id)?.textContent.trim() ?? '').join(' ').trim();
const radios = () => [...document.querySelectorAll('[role="radio"], input[type="radio"]')].filter(shown);
const checkbox = () => [...document.querySelectorAll('[role="checkbox"], input[type="checkbox"]')].find(shown);
const pressButton = async (pattern) => {
  const el = [...document.querySelectorAll('button')].filter(shown).find((item) => pattern.test(item.textContent));
  assert.ok(el, `na stránce chybí tlačítko s textem ${pattern}`);
  el.focus();
  await helpers.click(el);
  await helpers.flush();
};
const fill = async (name, text) => {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `ve formuláři chybí pole name="${name}"`);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await helpers.flush();
};
const chooseTerm = async (index) => {
  const native = [...document.querySelectorAll('select')].find(shown);
  if (native) {
    const option = [...native.options].filter((item) => item.value)[index];
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(native, option.value);
    native.dispatchEvent(new Event('change', { bubbles: true }));
    await helpers.flush();
    return option.textContent;
  }
  const trigger = document.querySelector('[role="combobox"]');
  assert.ok(trigger, 'na druhém kroku chybí výběr termínu');
  trigger.focus();
  await helpers.click(trigger);
  await helpers.flush();
  await helpers.waitFor(() => document.querySelectorAll('[role="option"]').length > index, 2000);
  const option = document.querySelectorAll('[role="option"]')[index];
  const text = option.textContent;
  option.focus();
  await helpers.press(option, 'Enter');
  await helpers.flush();
  await helpers.waitFor(() => !document.querySelector('[role="listbox"]'), 2000).catch(() => {});
  return text;
};
await fill('fullName', 'Tereza Malá');
await fill('email', 'tereza.mala@seznam.cz');
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => !document.querySelector('input[name="fullName"]') && radios().length > 0, 3000);
const termText = await chooseTerm(2);
const term = terms.find((item) => termText.includes(item.label));
assert.ok(term, `vybraná volba „${termText.trim()}" má obsahovat label termínu z data.ts`);
const radio = radios()[1];
const radioName = [...(radio.labels ?? [])].map((l) => l.textContent).join(' ') || radio.getAttribute('aria-label') || idsText(radio.getAttribute('aria-labelledby'));
const variant = courseVariants.find((item) => radioName.includes(item.title));
assert.ok(variant, 'popisek varianty má obsahovat její title z data.ts');
await helpers.click(radio);
await helpers.flush();
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => checkbox() && radios().length === 0, 3000);
await helpers.click(checkbox());
await helpers.flush();
await pressButton(/zkontrolovat|souhrn|shrnutí/i);
const dialog = await helpers.waitFor(() => document.querySelector('[role="dialog"]'), 3000).catch(() => null);
assert.ok(dialog, 'po zaškrtnutí souhlasu a kliknutí na Zkontrolovat se má otevřít dialog (role="dialog")');
const name = idsText(dialog.getAttribute('aria-labelledby')) || dialog.getAttribute('aria-label');
assert.ok(name, 'dialog nemá přístupný název — čtečka ohlásí jen „dialog". Chybí Dialog.Title');
const text = dialog.textContent;
assert.ok(text.includes('Tereza Malá'), 'souhrn má ukázat vyplněné jméno');
assert.ok(text.includes('tereza.mala@seznam.cz'), 'souhrn má ukázat vyplněný e-mail');
assert.ok(text.includes(term.label), `souhrn má ukázat vybraný termín „${term.label}"`);
assert.ok(text.includes(variant.title), `souhrn má ukázat vybranou variantu „${variant.title}"`);
```

Escape zavře souhrn bez odeslání a vrátí fokus na tlačítko, které ho otevřelo.

```js
const shown = (el) => Boolean(el) && !el.closest('[aria-hidden="true"]');
const radios = () => [...document.querySelectorAll('[role="radio"], input[type="radio"]')].filter(shown);
const checkbox = () => [...document.querySelectorAll('[role="checkbox"], input[type="checkbox"]')].find(shown);
const pressButton = async (pattern) => {
  const el = [...document.querySelectorAll('button')].filter(shown).find((item) => pattern.test(item.textContent));
  assert.ok(el, `na stránce chybí tlačítko s textem ${pattern}`);
  el.focus();
  await helpers.click(el);
  await helpers.flush();
  return el;
};
const fill = async (name, text) => {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `ve formuláři chybí pole name="${name}"`);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await helpers.flush();
};
const chooseTerm = async (index) => {
  const native = [...document.querySelectorAll('select')].find(shown);
  if (native) {
    const option = [...native.options].filter((item) => item.value)[index];
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(native, option.value);
    native.dispatchEvent(new Event('change', { bubbles: true }));
    await helpers.flush();
    return;
  }
  const trigger = document.querySelector('[role="combobox"]');
  trigger.focus();
  await helpers.click(trigger);
  await helpers.flush();
  await helpers.waitFor(() => document.querySelectorAll('[role="option"]').length > index, 2000);
  const option = document.querySelectorAll('[role="option"]')[index];
  option.focus();
  await helpers.press(option, 'Enter');
  await helpers.flush();
  await helpers.waitFor(() => !document.querySelector('[role="listbox"]'), 2000).catch(() => {});
};
await fill('fullName', 'Tereza Malá');
await fill('email', 'tereza.mala@seznam.cz');
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => !document.querySelector('input[name="fullName"]') && radios().length > 0, 3000);
await chooseTerm(0);
await helpers.click(radios()[0]);
await helpers.flush();
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => checkbox() && radios().length === 0, 3000);
await helpers.click(checkbox());
await helpers.flush();
const opener = await pressButton(/zkontrolovat|souhrn|shrnutí/i);
const dialog = await helpers.waitFor(() => document.querySelector('[role="dialog"]'), 3000).catch(() => null);
assert.ok(dialog, 'po kliknutí na Zkontrolovat se má otevřít dialog se souhrnem');
await helpers.press(document.activeElement ?? dialog, 'Escape');
await helpers.flush();
const closed = await helpers.waitFor(() => !document.querySelector('[role="dialog"]'), 3000).catch(() => false);
assert.ok(closed, 'Escape má dialog se souhrnem zavřít');
const returned = await helpers.waitFor(() => document.activeElement === opener, 2000).catch(() => false);
assert.ok(returned, 'po zavření dialogu se má fokus vrátit na tlačítko Zkontrolovat, kterým se otevřel');
const status = [...document.querySelectorAll('[role="status"]')].map((el) => el.textContent.trim()).join('');
assert.equal(status, '', 'zavření souhrnu Escapem nemá přihlášku odeslat ani nic oznamovat');
```

Odeslání ze souhrnu zavře dialog a stránka oznámí výsledek přes `role="status"`.

```js
const shown = (el) => Boolean(el) && !el.closest('[aria-hidden="true"]');
const radios = () => [...document.querySelectorAll('[role="radio"], input[type="radio"]')].filter(shown);
const checkbox = () => [...document.querySelectorAll('[role="checkbox"], input[type="checkbox"]')].find(shown);
const pressButton = async (pattern) => {
  const el = [...document.querySelectorAll('button')].filter(shown).find((item) => pattern.test(item.textContent));
  assert.ok(el, `na stránce chybí tlačítko s textem ${pattern}`);
  el.focus();
  await helpers.click(el);
  await helpers.flush();
};
const fill = async (name, text) => {
  const input = document.querySelector(`input[name="${name}"]`);
  assert.ok(input, `ve formuláři chybí pole name="${name}"`);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await helpers.flush();
};
const chooseTerm = async (index) => {
  const native = [...document.querySelectorAll('select')].find(shown);
  if (native) {
    const option = [...native.options].filter((item) => item.value)[index];
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(native, option.value);
    native.dispatchEvent(new Event('change', { bubbles: true }));
    await helpers.flush();
    return;
  }
  const trigger = document.querySelector('[role="combobox"]');
  trigger.focus();
  await helpers.click(trigger);
  await helpers.flush();
  await helpers.waitFor(() => document.querySelectorAll('[role="option"]').length > index, 2000);
  const option = document.querySelectorAll('[role="option"]')[index];
  option.focus();
  await helpers.press(option, 'Enter');
  await helpers.flush();
  await helpers.waitFor(() => !document.querySelector('[role="listbox"]'), 2000).catch(() => {});
};
await fill('fullName', 'Tereza Malá');
await fill('email', 'tereza.mala@seznam.cz');
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => !document.querySelector('input[name="fullName"]') && radios().length > 0, 3000);
await chooseTerm(0);
await helpers.click(radios()[2] ?? radios()[0]);
await helpers.flush();
await pressButton(/pokračovat|další|dál/i);
await helpers.waitFor(() => checkbox() && radios().length === 0, 3000);
await helpers.click(checkbox());
await helpers.flush();
await pressButton(/zkontrolovat|souhrn|shrnutí/i);
await helpers.waitFor(() => document.querySelector('[role="dialog"]'), 3000);
await pressButton(/odeslat/i);
const closed = await helpers.waitFor(() => !document.querySelector('[role="dialog"]'), 3000).catch(() => false);
assert.ok(closed, 'po odeslání se má dialog se souhrnem zavřít');
const status = await helpers.waitFor(() => [...document.querySelectorAll('[role="status"]')].find((el) => el.textContent.trim().length > 5), 3000).catch(() => null);
assert.ok(status, 'po odeslání má být na stránce prvek s role="status" a větou o tom, že přihláška odešla');
```

Kdo má zapnuté omezení pohybu, nevidí v přihlášce posuny — celá přihláška je v `MotionConfig` s `reducedMotion="user"`, nebo se ptá `useReducedMotion()`.

```js
const source = Object.entries(files)
  .filter(([name]) => /\.(jsx|tsx|js|ts)$/.test(name))
  .map(([, content]) => helpers.stripComments(content, 'js'))
  .join('\n');
const withConfig = /<MotionConfig[^>]*reducedMotion\s*=\s*(\{\s*)?["']user["']/.test(source);
const withHook = /useReducedMotion\s*\(/.test(source);
assert.ok(withConfig || withHook, 'omezený pohyb se nikde neřeší — obal přihlášku do <MotionConfig reducedMotion="user">, nebo použij useReducedMotion()');
assert.match(source, /from\s+['"]motion\/react['"]/, 'animace přihlášky mají jít přes motion/react');
```

# --help--

## --tip-- 5

Když se fokus nechytá, podívej se, **kdy** voláš `focus()`. S `mode="wait"` se nový
krok objeví až po odchodu starého, takže efekt v rodiči, který běží hned po změně
kroku, sáhne na nadpis, který ještě neexistuje. Nech nadpis zaostřit sám sebe, až se
připojí. Viz [AnimatePresence](see:react-ui-knihovny/motion-for-react#animatepresence-odchod-z-dom).

## --tip-- 13

Radix po zavření vrací fokus na `Dialog.Trigger`. Když dialog otevíráš ze stavu po
odeslání formuláře, žádný trigger nemá a fokus spadne na `body`. `Dialog.Content`
má pro tuhle chvíli dvě události: jednu při otevření (fokus je ještě na původním
prvku) a jednu při zavření. Viz
[Řízený a neřízený režim](see:react-ui-knihovny/shadcn-a-radix#rizeny-a-nerizeny-rezim).

# --seed--

## --file-- styles.css

```css
@import "tailwindcss";

@theme {
  --color-brand: #c2410c;
  --color-brand-dark: #9a3412;
  --color-brand-light: #fff7ed;
}

body {
  background: #f5f5f4;
  font-family: system-ui, -apple-system, sans-serif;
}
```

## --file-- data.ts

```ts
export type Term = { id: string; label: string; spotsLeft: number };

export type CourseVariant = { id: string; title: string; description: string; price: number };

export type Application = {
  fullName: string;
  email: string;
  termId: string;
  variantId: string;
  consent: boolean;
};

export const terms: Term[] = [
  { id: '2027-07-05', label: '5.–9. července', spotsLeft: 4 },
  { id: '2027-07-19', label: '19.–23. července', spotsLeft: 2 },
  { id: '2027-08-09', label: '9.–13. srpna', spotsLeft: 7 },
];

export const courseVariants: CourseVariant[] = [
  { id: 'basics', title: 'Základy na skalách', description: 'Uzly, jištění a lezení s horním lanem.', price: 6900 },
  { id: 'lead', title: 'Lezení na prvním', description: 'Pro ty, kdo už v hale lezou na prvním.', price: 8400 },
  { id: 'family', title: 'Rodič a dítě', description: 'Dítě od 8 let s dospělým, kratší dny.', price: 11200 },
];

export const priceFormat = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
});

export const emptyApplication: Application = {
  fullName: '',
  email: '',
  termId: '',
  variantId: '',
  consent: false,
};
```

## --file-- lib/utils.ts

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## --file-- lib/validation.ts

```ts
import type { Application } from '../data';

export type Errors = Partial<Record<keyof Application, string>>;

/** První krok: jméno aspoň 2 znaky po oříznutí mezer, e-mail se zavináčem a tečkou za ním. */
export function validateContact(values: Application): Errors {
  return {};
}

/** Druhý krok: vybraný termín a varianta. */
export function validateCourse(values: Application): Errors {
  return {};
}

/** Třetí krok: souhlas s podmínkami. */
export function validateConsent(values: Application): Errors {
  return {};
}
```

## --file-- components/ui/button.tsx

```tsx
import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-brand-dark',
        secondary: 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-100',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />;
}
```

## --file-- components/ui/text-field.tsx

```tsx
import type { ComponentProps } from 'react';

type TextFieldProps = ComponentProps<'input'> & {
  label: string;
  description: string;
  error?: string;
};

/** Textové pole s popiskem, popisem a hláškou o chybě. */
export function TextField(props: TextFieldProps) {
  return null;
}
```

## --file-- App.tsx

```tsx
import { useState } from 'react';
import { emptyApplication, type Application } from './data';
import './styles.css';

export default function App() {
  const [values, setValues] = useState<Application>(emptyApplication);

  return (
    <main className="mx-auto grid max-w-xl gap-6 px-5 py-10">
      <header className="grid gap-1">
        <p className="text-sm font-medium text-brand">Horolezecká škola Kokořín</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Letní kurz lezení</h1>
      </header>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        {/* Tři kroky přihlášky: Kontakt, Kurz, Podmínky. */}
      </div>
    </main>
  );
}
```

# --solution--

## --file-- lib/validation.ts

```ts
import type { Application } from '../data';

export type Errors = Partial<Record<keyof Application, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** První krok: jméno aspoň 2 znaky po oříznutí mezer, e-mail se zavináčem a tečkou za ním. */
export function validateContact(values: Application): Errors {
  const errors: Errors = {};
  if (values.fullName.trim().length < 2) errors.fullName = 'Napiš jméno a příjmení, potřebujeme je na pojištění.';
  if (!emailPattern.test(values.email.trim())) errors.email = 'Zadej e-mail ve tvaru jmeno@domena.cz.';
  return errors;
}

/** Druhý krok: vybraný termín a varianta. */
export function validateCourse(values: Application): Errors {
  const errors: Errors = {};
  if (!values.termId) errors.termId = 'Vyber si termín kurzu.';
  if (!values.variantId) errors.variantId = 'Vyber si jednu variantu kurzu.';
  return errors;
}

/** Třetí krok: souhlas s podmínkami. */
export function validateConsent(values: Application): Errors {
  return values.consent ? {} : { consent: 'Bez souhlasu s podmínkami tě nemůžeme přihlásit.' };
}
```

## --file-- components/ui/field-error.tsx

```tsx
import { AnimatePresence, motion } from 'motion/react';

export function describedBy(...ids: Array<string | false | undefined>) {
  return ids.filter(Boolean).join(' ') || undefined;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          key="error"
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-sm text-red-700"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
```

## --file-- components/ui/text-field.tsx

```tsx
import { useId, type ComponentProps } from 'react';
import { cn } from '../../lib/utils';
import { FieldError, describedBy } from './field-error';

type TextFieldProps = ComponentProps<'input'> & {
  label: string;
  description: string;
  error?: string;
};

/** Textové pole s popiskem, popisem a hláškou o chybě. */
export function TextField({ label, description, error, className, ...props }: TextFieldProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-stone-800">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={describedBy(descriptionId, error && errorId)}
        aria-invalid={error ? true : undefined}
        className={cn(
          'h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          error && 'border-red-600',
        )}
        {...props}
      />
      <p id={descriptionId} className="text-sm text-stone-500">
        {description}
      </p>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
```

## --file-- components/step-heading.tsx

```tsx
import { useEffect, useRef, type ReactNode } from 'react';

type StepHeadingProps = { children: ReactNode; focusOnMount: boolean };

export function StepHeading({ children, focusOnMount }: StepHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);

  return (
    <h2 ref={ref} tabIndex={-1} className="text-xl font-semibold text-stone-900 focus:outline-none">
      {children}
    </h2>
  );
}
```

## --file-- components/contact-step.tsx

```tsx
import { useState, type FormEvent } from 'react';
import type { Application } from '../data';
import { validateContact, type Errors } from '../lib/validation';
import { Button } from './ui/button';
import { TextField } from './ui/text-field';
import { StepHeading } from './step-heading';

type ContactStepProps = {
  values: Application;
  onChange: (patch: Partial<Application>) => void;
  onNext: () => void;
  focusOnMount: boolean;
};

export function ContactStep({ values, onChange, onNext, focusOnMount }: ContactStepProps) {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onNext();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-5">
      <StepHeading focusOnMount={focusOnMount}>Krok 1 ze 3: Kontakt</StepHeading>
      <TextField
        name="fullName"
        label="Jméno a příjmení"
        description="Stejně jako v občance, potřebujeme ho na pojištění."
        autoComplete="name"
        value={values.fullName}
        onChange={(event) => onChange({ fullName: event.target.value })}
        error={errors.fullName}
      />
      <TextField
        name="email"
        type="email"
        label="E-mail"
        description="Pošleme na něj potvrzení a seznam vybavení."
        autoComplete="email"
        value={values.email}
        onChange={(event) => onChange({ email: event.target.value })}
        error={errors.email}
      />
      <div className="flex justify-end">
        <Button type="submit">Pokračovat</Button>
      </div>
    </form>
  );
}
```

## --file-- components/term-select.tsx

```tsx
import { useId } from 'react';
import { Label, Select } from 'radix-ui';
import { terms } from '../data';
import { cn } from '../lib/utils';
import { FieldError, describedBy } from './ui/field-error';

type TermSelectProps = { value: string; onValueChange: (value: string) => void; error?: string };

export function TermSelect({ value, onValueChange, error }: TermSelectProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-1.5">
      <Label.Root htmlFor={id} className="text-sm font-medium text-stone-800">
        Termín
      </Label.Root>
      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(error && errorId)}
          className={cn(
            'flex h-11 items-center justify-between rounded-lg border border-stone-300 bg-white px-3 text-left text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand data-[placeholder]:text-stone-500',
            error && 'border-red-600',
          )}
        >
          <Select.Value placeholder="Vyber týden" />
          <Select.Icon aria-hidden>▾</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={4}
            className="z-50 w-(--radix-select-trigger-width) rounded-lg border border-stone-200 bg-white p-1 shadow-lg"
          >
            <Select.Viewport>
              {terms.map((term) => (
                <Select.Item
                  key={term.id}
                  value={term.id}
                  className="flex cursor-default justify-between gap-4 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-brand-light"
                >
                  <Select.ItemText>{term.label}</Select.ItemText>
                  <span className="text-stone-500">volná místa: {term.spotsLeft}</span>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
```

## --file-- components/variant-picker.tsx

```tsx
import { useId } from 'react';
import { RadioGroup } from 'radix-ui';
import { cva } from 'class-variance-authority';
import { courseVariants, priceFormat } from '../data';
import { FieldError, describedBy } from './ui/field-error';

const optionCard = cva('flex items-start gap-3 rounded-xl border p-4 transition-colors', {
  variants: {
    selected: {
      true: 'border-brand bg-brand-light',
      false: 'border-stone-200 bg-white hover:border-stone-300',
    },
    invalid: { true: '', false: '' },
  },
  compoundVariants: [{ selected: false, invalid: true, className: 'border-red-300' }],
});

type VariantPickerProps = { value: string; onValueChange: (value: string) => void; error?: string };

export function VariantPicker({ value, onValueChange, error }: VariantPickerProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-2">
      <span id={labelId} className="text-sm font-medium text-stone-800">
        Varianta kurzu
      </span>
      <RadioGroup.Root
        value={value}
        onValueChange={onValueChange}
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(error && errorId)}
        className="grid gap-2"
      >
        {courseVariants.map((variant) => {
          const itemId = `${id}-${variant.id}`;
          return (
            <div key={variant.id} className={optionCard({ selected: value === variant.id, invalid: Boolean(error) })}>
              <RadioGroup.Item
                id={itemId}
                value={variant.id}
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-stone-400 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand data-[state=checked]:border-brand"
              >
                <RadioGroup.Indicator className="size-2.5 rounded-full bg-brand" />
              </RadioGroup.Item>
              <label htmlFor={itemId} className="grid gap-0.5 text-sm">
                <span className="font-medium text-stone-900">
                  {variant.title} · {priceFormat.format(variant.price)}
                </span>
                <span className="text-stone-500">{variant.description}</span>
              </label>
            </div>
          );
        })}
      </RadioGroup.Root>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
```

## --file-- components/course-step.tsx

```tsx
import { useState, type FormEvent } from 'react';
import type { Application } from '../data';
import { validateCourse, type Errors } from '../lib/validation';
import { Button } from './ui/button';
import { StepHeading } from './step-heading';
import { TermSelect } from './term-select';
import { VariantPicker } from './variant-picker';

type CourseStepProps = {
  values: Application;
  onChange: (patch: Partial<Application>) => void;
  onNext: () => void;
  onBack: () => void;
  focusOnMount: boolean;
};

export function CourseStep({ values, onChange, onNext, onBack, focusOnMount }: CourseStepProps) {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateCourse(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onNext();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-6">
      <StepHeading focusOnMount={focusOnMount}>Krok 2 ze 3: Kurz</StepHeading>
      <TermSelect value={values.termId} onValueChange={(termId) => onChange({ termId })} error={errors.termId} />
      <VariantPicker
        value={values.variantId}
        onValueChange={(variantId) => onChange({ variantId })}
        error={errors.variantId}
      />
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Zpět
        </Button>
        <Button type="submit">Pokračovat</Button>
      </div>
    </form>
  );
}
```

## --file-- components/consent-step.tsx

```tsx
import { useId, useState, type FormEvent } from 'react';
import { Checkbox } from 'radix-ui';
import type { Application } from '../data';
import { validateConsent } from '../lib/validation';
import { Button } from './ui/button';
import { FieldError, describedBy } from './ui/field-error';
import { StepHeading } from './step-heading';

type ConsentStepProps = {
  values: Application;
  onChange: (patch: Partial<Application>) => void;
  onBack: () => void;
  onReview: () => void;
  focusOnMount: boolean;
};

export function ConsentStep({ values, onChange, onBack, onReview, focusOnMount }: ConsentStepProps) {
  const [error, setError] = useState<string>();
  const id = useId();
  const errorId = `${id}-error`;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateConsent(values);
    setError(found.consent);
    if (!found.consent) onReview();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-6">
      <StepHeading focusOnMount={focusOnMount}>Krok 3 ze 3: Podmínky</StepHeading>
      <p className="text-sm text-stone-600">
        Kurz se platí do 14 dnů od přihlášení. Storno do 30 dnů před začátkem je zdarma, později
        si necháváme 30 % ceny.
      </p>
      <div className="grid gap-1.5">
        <div className="flex items-start gap-3">
          <Checkbox.Root
            id={id}
            checked={values.consent}
            onCheckedChange={(checked) => onChange({ consent: checked === true })}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(error && errorId)}
            className="mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-stone-400 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand data-[state=checked]:border-brand data-[state=checked]:bg-brand"
          >
            <Checkbox.Indicator className="text-xs text-white">✓</Checkbox.Indicator>
          </Checkbox.Root>
          <label htmlFor={id} className="text-sm text-stone-800">
            Souhlasím s platebními a storno podmínkami
          </label>
        </div>
        <FieldError id={errorId} message={error} />
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Zpět
        </Button>
        <Button type="submit">Zkontrolovat přihlášku</Button>
      </div>
    </form>
  );
}
```

## --file-- components/summary-dialog.tsx

```tsx
import { useRef } from 'react';
import { Dialog } from 'radix-ui';
import { courseVariants, priceFormat, terms, type Application } from '../data';
import { Button } from './ui/button';

type SummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: Application;
  onSend: () => void;
};

export function SummaryDialog({ open, onOpenChange, values, onSend }: SummaryDialogProps) {
  const openerRef = useRef<HTMLElement | null>(null);
  const term = terms.find((item) => item.id === values.termId);
  const variant = courseVariants.find((item) => item.id === values.variantId);
  const rows = [
    ['Jméno', values.fullName],
    ['E-mail', values.email],
    ['Termín', term?.label],
    ['Varianta', variant?.title],
    ['Cena', variant && priceFormat.format(variant.price)],
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-stone-900/40" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            openerRef.current?.focus();
          }}
          className="fixed top-1/2 left-1/2 grid w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-stone-900">Zkontroluj přihlášku</Dialog.Title>
          <Dialog.Description className="text-sm text-stone-600">
            Když něco nesedí, vrať se a oprav to. Po odeslání ti přijdou platební údaje e-mailem.
          </Dialog.Description>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-stone-500">{label}</dt>
                <dd className="font-medium text-stone-900">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary">Upravit</Button>
            </Dialog.Close>
            <Button onClick={onSend}>Odeslat přihlášku</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## --file-- App.tsx

```tsx
import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { emptyApplication, type Application } from './data';
import { ContactStep } from './components/contact-step';
import { CourseStep } from './components/course-step';
import { ConsentStep } from './components/consent-step';
import { SummaryDialog } from './components/summary-dialog';
import './styles.css';

export default function App() {
  const [step, setStep] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [values, setValues] = useState<Application>(emptyApplication);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (patch: Partial<Application>) => setValues((current) => ({ ...current, ...patch }));

  function goTo(nextStep: number) {
    setHasMoved(true);
    setStep(nextStep);
  }

  function send() {
    setSummaryOpen(false);
    setSent(true);
  }

  const stepProps = { values, onChange: update, focusOnMount: hasMoved };

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto grid max-w-xl gap-6 px-5 py-10">
        <header className="grid gap-1">
          <p className="text-sm font-medium text-brand">Horolezecká škola Kokořín</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Letní kurz lezení</h1>
        </header>

        <p role="status" className="font-medium text-emerald-800">
          {sent ? 'Přihláška odešla. Do e-mailu ti přijdou platební údaje a seznam vybavení.' : ''}
        </p>

        {!sent && (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {step === 0 && <ContactStep {...stepProps} onNext={() => goTo(1)} />}
                {step === 1 && <CourseStep {...stepProps} onBack={() => goTo(0)} onNext={() => goTo(2)} />}
                {step === 2 && (
                  <ConsentStep {...stepProps} onBack={() => goTo(1)} onReview={() => setSummaryOpen(true)} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <SummaryDialog open={summaryOpen} onOpenChange={setSummaryOpen} values={values} onSend={send} />
      </main>
    </MotionConfig>
  );
}
```

# --approaches--

## --approach-- Nativní select, radia a zaškrtávátko

Místo Radix `Select`, `RadioGroup` a `Checkbox` nativní `<select>`, `<input type="radio">`
ve `fieldset` s `legend` a `<input type="checkbox">`. Klávesnici, čtečku i mobilní
výběr ti dá prohlížeč zadarmo a nevozíš si kód navíc. Cena: rozbalený seznam
`<select>` nenastyluješ a vybranou kartu varianty zvýrazňuješ podmínkou v `cn()`
místo `cva`. Pro formulář, kde na vzhledu nabídky nezáleží, je to rozumnější volba
než primitivum.

### --file-- lib/validation.ts

```ts
import type { Application } from '../data';

export type Errors = Partial<Record<keyof Application, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** První krok: jméno aspoň 2 znaky po oříznutí mezer, e-mail se zavináčem a tečkou za ním. */
export function validateContact(values: Application): Errors {
  const errors: Errors = {};
  if (values.fullName.trim().length < 2) errors.fullName = 'Napiš jméno a příjmení, potřebujeme je na pojištění.';
  if (!emailPattern.test(values.email.trim())) errors.email = 'Zadej e-mail ve tvaru jmeno@domena.cz.';
  return errors;
}

/** Druhý krok: vybraný termín a varianta. */
export function validateCourse(values: Application): Errors {
  const errors: Errors = {};
  if (!values.termId) errors.termId = 'Vyber si termín kurzu.';
  if (!values.variantId) errors.variantId = 'Vyber si jednu variantu kurzu.';
  return errors;
}

/** Třetí krok: souhlas s podmínkami. */
export function validateConsent(values: Application): Errors {
  return values.consent ? {} : { consent: 'Bez souhlasu s podmínkami tě nemůžeme přihlásit.' };
}
```

### --file-- components/ui/field-error.tsx

```tsx
import { AnimatePresence, motion } from 'motion/react';

export function describedBy(...ids: Array<string | false | undefined>) {
  return ids.filter(Boolean).join(' ') || undefined;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          key="error"
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-sm text-red-700"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
```

### --file-- components/ui/text-field.tsx

```tsx
import { useId, type ComponentProps } from 'react';
import { cn } from '../../lib/utils';
import { FieldError, describedBy } from './field-error';

type TextFieldProps = ComponentProps<'input'> & {
  label: string;
  description: string;
  error?: string;
};

/** Textové pole s popiskem, popisem a hláškou o chybě. */
export function TextField({ label, description, error, className, ...props }: TextFieldProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-stone-800">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={describedBy(descriptionId, error && errorId)}
        aria-invalid={error ? true : undefined}
        className={cn(
          'h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          error && 'border-red-600',
        )}
        {...props}
      />
      <p id={descriptionId} className="text-sm text-stone-500">
        {description}
      </p>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
```

### --file-- components/step-heading.tsx

```tsx
import { useEffect, useRef, type ReactNode } from 'react';

type StepHeadingProps = { children: ReactNode; focusOnMount: boolean };

export function StepHeading({ children, focusOnMount }: StepHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);

  return (
    <h2 ref={ref} tabIndex={-1} className="text-xl font-semibold text-stone-900 focus:outline-none">
      {children}
    </h2>
  );
}
```

### --file-- components/contact-step.tsx

```tsx
import { useState, type FormEvent } from 'react';
import type { Application } from '../data';
import { validateContact, type Errors } from '../lib/validation';
import { Button } from './ui/button';
import { TextField } from './ui/text-field';
import { StepHeading } from './step-heading';

type ContactStepProps = {
  values: Application;
  onChange: (patch: Partial<Application>) => void;
  onNext: () => void;
  focusOnMount: boolean;
};

export function ContactStep({ values, onChange, onNext, focusOnMount }: ContactStepProps) {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onNext();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-5">
      <StepHeading focusOnMount={focusOnMount}>Krok 1 ze 3: Kontakt</StepHeading>
      <TextField
        name="fullName"
        label="Jméno a příjmení"
        description="Stejně jako v občance, potřebujeme ho na pojištění."
        autoComplete="name"
        value={values.fullName}
        onChange={(event) => onChange({ fullName: event.target.value })}
        error={errors.fullName}
      />
      <TextField
        name="email"
        type="email"
        label="E-mail"
        description="Pošleme na něj potvrzení a seznam vybavení."
        autoComplete="email"
        value={values.email}
        onChange={(event) => onChange({ email: event.target.value })}
        error={errors.email}
      />
      <div className="flex justify-end">
        <Button type="submit">Pokračovat</Button>
      </div>
    </form>
  );
}
```

### --file-- components/term-select.tsx

```tsx
import { useId } from 'react';
import { terms } from '../data';
import { cn } from '../lib/utils';
import { FieldError, describedBy } from './ui/field-error';

type TermSelectProps = { value: string; onValueChange: (value: string) => void; error?: string };

export function TermSelect({ value, onValueChange, error }: TermSelectProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-stone-800">
        Termín
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(error && errorId)}
        className={cn(
          'h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          error && 'border-red-600',
        )}
      >
        <option value="" disabled>
          Vyber týden
        </option>
        {terms.map((term) => (
          <option key={term.id} value={term.id}>
            {term.label} (volná místa: {term.spotsLeft})
          </option>
        ))}
      </select>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
```

### --file-- components/variant-picker.tsx

```tsx
import { useId } from 'react';
import { courseVariants, priceFormat } from '../data';
import { cn } from '../lib/utils';
import { FieldError, describedBy } from './ui/field-error';

type VariantPickerProps = { value: string; onValueChange: (value: string) => void; error?: string };

export function VariantPicker({ value, onValueChange, error }: VariantPickerProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <fieldset
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(error && errorId)}
      className="grid gap-2"
    >
      <legend className="mb-2 text-sm font-medium text-stone-800">Varianta kurzu</legend>
      {courseVariants.map((variant) => {
        const selected = value === variant.id;
        return (
          <label
            key={variant.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-brand',
              selected ? 'border-brand bg-brand-light' : 'border-stone-200 bg-white hover:border-stone-300',
              error && !selected && 'border-red-300',
            )}
          >
            <input
              type="radio"
              name={`${id}-variant`}
              value={variant.id}
              checked={selected}
              onChange={() => onValueChange(variant.id)}
              className="mt-1 size-4 accent-brand"
            />
            <span className="grid gap-0.5 text-sm">
              <span className="font-medium text-stone-900">
                {variant.title} · {priceFormat.format(variant.price)}
              </span>
              <span className="text-stone-500">{variant.description}</span>
            </span>
          </label>
        );
      })}
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
```

### --file-- components/course-step.tsx

```tsx
import { useState, type FormEvent } from 'react';
import type { Application } from '../data';
import { validateCourse, type Errors } from '../lib/validation';
import { Button } from './ui/button';
import { StepHeading } from './step-heading';
import { TermSelect } from './term-select';
import { VariantPicker } from './variant-picker';

type CourseStepProps = {
  values: Application;
  onChange: (patch: Partial<Application>) => void;
  onNext: () => void;
  onBack: () => void;
  focusOnMount: boolean;
};

export function CourseStep({ values, onChange, onNext, onBack, focusOnMount }: CourseStepProps) {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateCourse(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onNext();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-6">
      <StepHeading focusOnMount={focusOnMount}>Krok 2 ze 3: Kurz</StepHeading>
      <TermSelect value={values.termId} onValueChange={(termId) => onChange({ termId })} error={errors.termId} />
      <VariantPicker
        value={values.variantId}
        onValueChange={(variantId) => onChange({ variantId })}
        error={errors.variantId}
      />
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Zpět
        </Button>
        <Button type="submit">Pokračovat</Button>
      </div>
    </form>
  );
}
```

### --file-- components/consent-step.tsx

```tsx
import { useId, useState, type FormEvent } from 'react';
import type { Application } from '../data';
import { validateConsent } from '../lib/validation';
import { Button } from './ui/button';
import { FieldError, describedBy } from './ui/field-error';
import { StepHeading } from './step-heading';

type ConsentStepProps = {
  values: Application;
  onChange: (patch: Partial<Application>) => void;
  onBack: () => void;
  onReview: () => void;
  focusOnMount: boolean;
};

export function ConsentStep({ values, onChange, onBack, onReview, focusOnMount }: ConsentStepProps) {
  const [error, setError] = useState<string>();
  const id = useId();
  const errorId = `${id}-error`;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateConsent(values);
    setError(found.consent);
    if (!found.consent) onReview();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-6">
      <StepHeading focusOnMount={focusOnMount}>Krok 3 ze 3: Podmínky</StepHeading>
      <p className="text-sm text-stone-600">
        Kurz se platí do 14 dnů od přihlášení. Storno do 30 dnů před začátkem je zdarma, později
        si necháváme 30 % ceny.
      </p>
      <div className="grid gap-1.5">
        <div className="flex items-start gap-3">
          <input
            id={id}
            type="checkbox"
            checked={values.consent}
            onChange={(event) => onChange({ consent: event.target.checked })}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(error && errorId)}
            className="mt-1 size-4 accent-brand"
          />
          <label htmlFor={id} className="text-sm text-stone-800">
            Souhlasím s platebními a storno podmínkami
          </label>
        </div>
        <FieldError id={errorId} message={error} />
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Zpět
        </Button>
        <Button type="submit">Zkontrolovat přihlášku</Button>
      </div>
    </form>
  );
}
```

### --file-- components/summary-dialog.tsx

```tsx
import { useRef } from 'react';
import { Dialog } from 'radix-ui';
import { courseVariants, priceFormat, terms, type Application } from '../data';
import { Button } from './ui/button';

type SummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: Application;
  onSend: () => void;
};

export function SummaryDialog({ open, onOpenChange, values, onSend }: SummaryDialogProps) {
  const openerRef = useRef<HTMLElement | null>(null);
  const term = terms.find((item) => item.id === values.termId);
  const variant = courseVariants.find((item) => item.id === values.variantId);
  const rows = [
    ['Jméno', values.fullName],
    ['E-mail', values.email],
    ['Termín', term?.label],
    ['Varianta', variant?.title],
    ['Cena', variant && priceFormat.format(variant.price)],
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-stone-900/40" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            openerRef.current?.focus();
          }}
          className="fixed top-1/2 left-1/2 grid w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-stone-900">Zkontroluj přihlášku</Dialog.Title>
          <Dialog.Description className="text-sm text-stone-600">
            Když něco nesedí, vrať se a oprav to. Po odeslání ti přijdou platební údaje e-mailem.
          </Dialog.Description>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-stone-500">{label}</dt>
                <dd className="font-medium text-stone-900">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary">Upravit</Button>
            </Dialog.Close>
            <Button onClick={onSend}>Odeslat přihlášku</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### --file-- App.tsx

```tsx
import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { emptyApplication, type Application } from './data';
import { ContactStep } from './components/contact-step';
import { CourseStep } from './components/course-step';
import { ConsentStep } from './components/consent-step';
import { SummaryDialog } from './components/summary-dialog';
import './styles.css';

export default function App() {
  const [step, setStep] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [values, setValues] = useState<Application>(emptyApplication);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (patch: Partial<Application>) => setValues((current) => ({ ...current, ...patch }));

  function goTo(nextStep: number) {
    setHasMoved(true);
    setStep(nextStep);
  }

  function send() {
    setSummaryOpen(false);
    setSent(true);
  }

  const stepProps = { values, onChange: update, focusOnMount: hasMoved };

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto grid max-w-xl gap-6 px-5 py-10">
        <header className="grid gap-1">
          <p className="text-sm font-medium text-brand">Horolezecká škola Kokořín</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Letní kurz lezení</h1>
        </header>

        <p role="status" className="font-medium text-emerald-800">
          {sent ? 'Přihláška odešla. Do e-mailu ti přijdou platební údaje a seznam vybavení.' : ''}
        </p>

        {!sent && (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {step === 0 && <ContactStep {...stepProps} onNext={() => goTo(1)} />}
                {step === 1 && <CourseStep {...stepProps} onBack={() => goTo(0)} onNext={() => goTo(2)} />}
                {step === 2 && (
                  <ConsentStep {...stepProps} onBack={() => goTo(1)} onReview={() => setSummaryOpen(true)} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <SummaryDialog open={summaryOpen} onOpenChange={setSummaryOpen} values={values} onSend={send} />
      </main>
    </MotionConfig>
  );
}
```

## --approach-- Pole jako složená komponenta s kontextem

`Field` vyrobí id jednou a rozdá je přes kontext částem `FieldLabel`, `FieldInput`,
`FieldDescription` a `FieldMessage`, takže propojení přes `htmlFor`
a `aria-describedby` nejde pokazit ani při jiném pořadí částí. `TextField` je jen
hotová skladba pro běžný případ. Takhle je postavené pole v shadcn/ui; vyplatí se,
až budeš mít pole s ikonou, počítadlem znaků nebo tlačítkem uvnitř. Past: když
`FieldDescription` vynecháš, `aria-describedby` ukazuje na id, které neexistuje.

### --file-- components/ui/field.tsx

```tsx
import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { FieldError } from './field-error';

type FieldContextValue = { controlId: string; descriptionId: string; errorId: string; error?: string };

const FieldContext = createContext<FieldContextValue | null>(null);

function useField() {
  const context = useContext(FieldContext);
  if (!context) throw new Error('Části pole patří dovnitř <Field>.');
  return context;
}

export function Field({ error, className, children }: { error?: string; className?: string; children: ReactNode }) {
  const id = useId();
  const value = { controlId: id, descriptionId: `${id}-description`, errorId: `${id}-error`, error };

  return (
    <FieldContext value={value}>
      <div className={cn('grid gap-1.5', className)}>{children}</div>
    </FieldContext>
  );
}

export function FieldLabel({ className, ...props }: ComponentProps<'label'>) {
  const { controlId } = useField();
  return <label htmlFor={controlId} className={cn('text-sm font-medium text-stone-800', className)} {...props} />;
}

export function FieldInput({ className, ...props }: ComponentProps<'input'>) {
  const { controlId, descriptionId, errorId, error } = useField();
  return (
    <input
      id={controlId}
      aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
      aria-invalid={error ? true : undefined}
      className={cn(
        'h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        error && 'border-red-600',
        className,
      )}
      {...props}
    />
  );
}

export function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  const { descriptionId } = useField();
  return <p id={descriptionId} className={cn('text-sm text-stone-500', className)} {...props} />;
}

export function FieldMessage() {
  const { errorId, error } = useField();
  return <FieldError id={errorId} message={error} />;
}
```

### --file-- lib/validation.ts

```ts
import type { Application } from '../data';

export type Errors = Partial<Record<keyof Application, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** První krok: jméno aspoň 2 znaky po oříznutí mezer, e-mail se zavináčem a tečkou za ním. */
export function validateContact(values: Application): Errors {
  const errors: Errors = {};
  if (values.fullName.trim().length < 2) errors.fullName = 'Napiš jméno a příjmení, potřebujeme je na pojištění.';
  if (!emailPattern.test(values.email.trim())) errors.email = 'Zadej e-mail ve tvaru jmeno@domena.cz.';
  return errors;
}

/** Druhý krok: vybraný termín a varianta. */
export function validateCourse(values: Application): Errors {
  const errors: Errors = {};
  if (!values.termId) errors.termId = 'Vyber si termín kurzu.';
  if (!values.variantId) errors.variantId = 'Vyber si jednu variantu kurzu.';
  return errors;
}

/** Třetí krok: souhlas s podmínkami. */
export function validateConsent(values: Application): Errors {
  return values.consent ? {} : { consent: 'Bez souhlasu s podmínkami tě nemůžeme přihlásit.' };
}
```

### --file-- components/ui/field-error.tsx

```tsx
import { AnimatePresence, motion } from 'motion/react';

export function describedBy(...ids: Array<string | false | undefined>) {
  return ids.filter(Boolean).join(' ') || undefined;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          key="error"
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-sm text-red-700"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
```

### --file-- components/ui/text-field.tsx

```tsx
import type { ComponentProps } from 'react';
import { Field, FieldDescription, FieldInput, FieldLabel, FieldMessage } from './field';

type TextFieldProps = ComponentProps<'input'> & {
  label: string;
  description: string;
  error?: string;
};

/** Hotová skladba pro běžný případ; kde potřebuješ jiné pořadí nebo ikonu, poskládej si části sám. */
export function TextField({ label, description, error, ...props }: TextFieldProps) {
  return (
    <Field error={error}>
      <FieldLabel>{label}</FieldLabel>
      <FieldInput {...props} />
      <FieldDescription>{description}</FieldDescription>
      <FieldMessage />
    </Field>
  );
}
```

### --file-- components/step-heading.tsx

```tsx
import { useEffect, useRef, type ReactNode } from 'react';

type StepHeadingProps = { children: ReactNode; focusOnMount: boolean };

export function StepHeading({ children, focusOnMount }: StepHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);

  return (
    <h2 ref={ref} tabIndex={-1} className="text-xl font-semibold text-stone-900 focus:outline-none">
      {children}
    </h2>
  );
}
```

### --file-- components/contact-step.tsx

```tsx
import { useState, type FormEvent } from 'react';
import type { Application } from '../data';
import { validateContact, type Errors } from '../lib/validation';
import { Button } from './ui/button';
import { TextField } from './ui/text-field';
import { StepHeading } from './step-heading';

type ContactStepProps = {
  values: Application;
  onChange: (patch: Partial<Application>) => void;
  onNext: () => void;
  focusOnMount: boolean;
};

export function ContactStep({ values, onChange, onNext, focusOnMount }: ContactStepProps) {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onNext();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-5">
      <StepHeading focusOnMount={focusOnMount}>Krok 1 ze 3: Kontakt</StepHeading>
      <TextField
        name="fullName"
        label="Jméno a příjmení"
        description="Stejně jako v občance, potřebujeme ho na pojištění."
        autoComplete="name"
        value={values.fullName}
        onChange={(event) => onChange({ fullName: event.target.value })}
        error={errors.fullName}
      />
      <TextField
        name="email"
        type="email"
        label="E-mail"
        description="Pošleme na něj potvrzení a seznam vybavení."
        autoComplete="email"
        value={values.email}
        onChange={(event) => onChange({ email: event.target.value })}
        error={errors.email}
      />
      <div className="flex justify-end">
        <Button type="submit">Pokračovat</Button>
      </div>
    </form>
  );
}
```

### --file-- components/term-select.tsx

```tsx
import { useId } from 'react';
import { Label, Select } from 'radix-ui';
import { terms } from '../data';
import { cn } from '../lib/utils';
import { FieldError, describedBy } from './ui/field-error';

type TermSelectProps = { value: string; onValueChange: (value: string) => void; error?: string };

export function TermSelect({ value, onValueChange, error }: TermSelectProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-1.5">
      <Label.Root htmlFor={id} className="text-sm font-medium text-stone-800">
        Termín
      </Label.Root>
      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(error && errorId)}
          className={cn(
            'flex h-11 items-center justify-between rounded-lg border border-stone-300 bg-white px-3 text-left text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand data-[placeholder]:text-stone-500',
            error && 'border-red-600',
          )}
        >
          <Select.Value placeholder="Vyber týden" />
          <Select.Icon aria-hidden>▾</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={4}
            className="z-50 w-(--radix-select-trigger-width) rounded-lg border border-stone-200 bg-white p-1 shadow-lg"
          >
            <Select.Viewport>
              {terms.map((term) => (
                <Select.Item
                  key={term.id}
                  value={term.id}
                  className="flex cursor-default justify-between gap-4 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-brand-light"
                >
                  <Select.ItemText>{term.label}</Select.ItemText>
                  <span className="text-stone-500">volná místa: {term.spotsLeft}</span>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
```

### --file-- components/variant-picker.tsx

```tsx
import { useId } from 'react';
import { RadioGroup } from 'radix-ui';
import { cva } from 'class-variance-authority';
import { courseVariants, priceFormat } from '../data';
import { FieldError, describedBy } from './ui/field-error';

const optionCard = cva('flex items-start gap-3 rounded-xl border p-4 transition-colors', {
  variants: {
    selected: {
      true: 'border-brand bg-brand-light',
      false: 'border-stone-200 bg-white hover:border-stone-300',
    },
    invalid: { true: '', false: '' },
  },
  compoundVariants: [{ selected: false, invalid: true, className: 'border-red-300' }],
});

type VariantPickerProps = { value: string; onValueChange: (value: string) => void; error?: string };

export function VariantPicker({ value, onValueChange, error }: VariantPickerProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-2">
      <span id={labelId} className="text-sm font-medium text-stone-800">
        Varianta kurzu
      </span>
      <RadioGroup.Root
        value={value}
        onValueChange={onValueChange}
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(error && errorId)}
        className="grid gap-2"
      >
        {courseVariants.map((variant) => {
          const itemId = `${id}-${variant.id}`;
          return (
            <div key={variant.id} className={optionCard({ selected: value === variant.id, invalid: Boolean(error) })}>
              <RadioGroup.Item
                id={itemId}
                value={variant.id}
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-stone-400 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand data-[state=checked]:border-brand"
              >
                <RadioGroup.Indicator className="size-2.5 rounded-full bg-brand" />
              </RadioGroup.Item>
              <label htmlFor={itemId} className="grid gap-0.5 text-sm">
                <span className="font-medium text-stone-900">
                  {variant.title} · {priceFormat.format(variant.price)}
                </span>
                <span className="text-stone-500">{variant.description}</span>
              </label>
            </div>
          );
        })}
      </RadioGroup.Root>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
```

### --file-- components/course-step.tsx

```tsx
import { useState, type FormEvent } from 'react';
import type { Application } from '../data';
import { validateCourse, type Errors } from '../lib/validation';
import { Button } from './ui/button';
import { StepHeading } from './step-heading';
import { TermSelect } from './term-select';
import { VariantPicker } from './variant-picker';

type CourseStepProps = {
  values: Application;
  onChange: (patch: Partial<Application>) => void;
  onNext: () => void;
  onBack: () => void;
  focusOnMount: boolean;
};

export function CourseStep({ values, onChange, onNext, onBack, focusOnMount }: CourseStepProps) {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateCourse(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onNext();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-6">
      <StepHeading focusOnMount={focusOnMount}>Krok 2 ze 3: Kurz</StepHeading>
      <TermSelect value={values.termId} onValueChange={(termId) => onChange({ termId })} error={errors.termId} />
      <VariantPicker
        value={values.variantId}
        onValueChange={(variantId) => onChange({ variantId })}
        error={errors.variantId}
      />
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Zpět
        </Button>
        <Button type="submit">Pokračovat</Button>
      </div>
    </form>
  );
}
```

### --file-- components/consent-step.tsx

```tsx
import { useId, useState, type FormEvent } from 'react';
import { Checkbox } from 'radix-ui';
import type { Application } from '../data';
import { validateConsent } from '../lib/validation';
import { Button } from './ui/button';
import { FieldError, describedBy } from './ui/field-error';
import { StepHeading } from './step-heading';

type ConsentStepProps = {
  values: Application;
  onChange: (patch: Partial<Application>) => void;
  onBack: () => void;
  onReview: () => void;
  focusOnMount: boolean;
};

export function ConsentStep({ values, onChange, onBack, onReview, focusOnMount }: ConsentStepProps) {
  const [error, setError] = useState<string>();
  const id = useId();
  const errorId = `${id}-error`;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateConsent(values);
    setError(found.consent);
    if (!found.consent) onReview();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-6">
      <StepHeading focusOnMount={focusOnMount}>Krok 3 ze 3: Podmínky</StepHeading>
      <p className="text-sm text-stone-600">
        Kurz se platí do 14 dnů od přihlášení. Storno do 30 dnů před začátkem je zdarma, později
        si necháváme 30 % ceny.
      </p>
      <div className="grid gap-1.5">
        <div className="flex items-start gap-3">
          <Checkbox.Root
            id={id}
            checked={values.consent}
            onCheckedChange={(checked) => onChange({ consent: checked === true })}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(error && errorId)}
            className="mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-stone-400 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand data-[state=checked]:border-brand data-[state=checked]:bg-brand"
          >
            <Checkbox.Indicator className="text-xs text-white">✓</Checkbox.Indicator>
          </Checkbox.Root>
          <label htmlFor={id} className="text-sm text-stone-800">
            Souhlasím s platebními a storno podmínkami
          </label>
        </div>
        <FieldError id={errorId} message={error} />
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Zpět
        </Button>
        <Button type="submit">Zkontrolovat přihlášku</Button>
      </div>
    </form>
  );
}
```

### --file-- components/summary-dialog.tsx

```tsx
import { useRef } from 'react';
import { Dialog } from 'radix-ui';
import { courseVariants, priceFormat, terms, type Application } from '../data';
import { Button } from './ui/button';

type SummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: Application;
  onSend: () => void;
};

export function SummaryDialog({ open, onOpenChange, values, onSend }: SummaryDialogProps) {
  const openerRef = useRef<HTMLElement | null>(null);
  const term = terms.find((item) => item.id === values.termId);
  const variant = courseVariants.find((item) => item.id === values.variantId);
  const rows = [
    ['Jméno', values.fullName],
    ['E-mail', values.email],
    ['Termín', term?.label],
    ['Varianta', variant?.title],
    ['Cena', variant && priceFormat.format(variant.price)],
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-stone-900/40" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            openerRef.current?.focus();
          }}
          className="fixed top-1/2 left-1/2 grid w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-stone-900">Zkontroluj přihlášku</Dialog.Title>
          <Dialog.Description className="text-sm text-stone-600">
            Když něco nesedí, vrať se a oprav to. Po odeslání ti přijdou platební údaje e-mailem.
          </Dialog.Description>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-stone-500">{label}</dt>
                <dd className="font-medium text-stone-900">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary">Upravit</Button>
            </Dialog.Close>
            <Button onClick={onSend}>Odeslat přihlášku</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### --file-- App.tsx

```tsx
import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { emptyApplication, type Application } from './data';
import { ContactStep } from './components/contact-step';
import { CourseStep } from './components/course-step';
import { ConsentStep } from './components/consent-step';
import { SummaryDialog } from './components/summary-dialog';
import './styles.css';

export default function App() {
  const [step, setStep] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [values, setValues] = useState<Application>(emptyApplication);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (patch: Partial<Application>) => setValues((current) => ({ ...current, ...patch }));

  function goTo(nextStep: number) {
    setHasMoved(true);
    setStep(nextStep);
  }

  function send() {
    setSummaryOpen(false);
    setSent(true);
  }

  const stepProps = { values, onChange: update, focusOnMount: hasMoved };

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto grid max-w-xl gap-6 px-5 py-10">
        <header className="grid gap-1">
          <p className="text-sm font-medium text-brand">Horolezecká škola Kokořín</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Letní kurz lezení</h1>
        </header>

        <p role="status" className="font-medium text-emerald-800">
          {sent ? 'Přihláška odešla. Do e-mailu ti přijdou platební údaje a seznam vybavení.' : ''}
        </p>

        {!sent && (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {step === 0 && <ContactStep {...stepProps} onNext={() => goTo(1)} />}
                {step === 1 && <CourseStep {...stepProps} onBack={() => goTo(0)} onNext={() => goTo(2)} />}
                {step === 2 && (
                  <ConsentStep {...stepProps} onBack={() => goTo(1)} onReview={() => setSummaryOpen(true)} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <SummaryDialog open={summaryOpen} onOpenChange={setSummaryOpen} values={values} onSend={send} />
      </main>
    </MotionConfig>
  );
}
```

# --review--

Testy hlídají role, názvy a chování. Tohle si projdi sám, než přihlášku uzavřeš.

## --rubric--

- Celou přihlášku projdeš jen klávesnicí: Tab, šipky ve výběru i ve skupině variant, mezerník u souhlasu, Escape v dialogu.
- Popisky i hlášky mluví k člověku („Vyber si termín kurzu."), ne k programátorovi („termId is required").
- Pole, výběr, skupina i souhlas skládají chybu stejně: jedna komponenta nebo jeden pomocník, ne pětkrát zkopírovaný blok.
- Varianty vzhledu (vybraná karta, chybné pole) jsou na jednom místě v `cva` nebo `cn()`, ne rozházené po JSX.
- Animace kroku trvá kratší dobu, než by uživatele zdržela (do ~250 ms), a s omezeným pohybem se nic neposouvá.
- Víš, proč se fokus přesouvá na nadpis kroku, a ne na první pole.

## --extensions--

Rozšíření bez testů: ukazatel průběhu „krok 2 ze 3" s animovanou šířkou přes `layout`;
směr animace podle toho, jestli jde uživatel dopředu, nebo zpátky (`custom` u variant);
uložení rozpracované přihlášky do `localStorage`; oznámení po odeslání jako toast,
který jde odtáhnout.
