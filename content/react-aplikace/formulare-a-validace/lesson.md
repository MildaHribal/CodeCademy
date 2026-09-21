# Formuláře a validace

Formulář je místo, kde aplikace potká skutečného člověka — a kde se pozná
rozdíl mezi „funguje to" a „dá se to použít". Tahle lekce je o tom, jak v Reactu
napsat formulář, který uživateli řekne, co je špatně, neztratí mu rozepsaná data
a funguje i pro člověka, který ho nevidí.

:::check pretest
Uživatel odešle přihlášku a server ji odmítne, protože e-mail už je obsazený.
Kdy se má tahle chyba objevit u pole s e-mailem?

### --answer--

Vůbec — patří nahoru nad formulář jako obecná hláška.

#### --why--

Obecné hlášky typu „Něco se pokazilo" nutí uživatele hledat, čeho se týkají.
Když víš, které pole za to může, řekni to u něj.

### --correct--

U pole s e-mailem, hned po odpovědi serveru.

#### --why--

Chyba patří tam, kde ji uživatel může opravit. Serverová chyba se v tomhle neliší
od té klientské — jen přijde později.

### --answer--

U pole s e-mailem, ale až když uživatel na pole znovu klikne.

#### --why--

To by znamenalo, že po odeslání chvíli nevidí důvod, proč se nic nestalo.
:::

:::check pretest
Kolik atributů navíc potřebuje pole formuláře, aby čtečka obrazovky přečetla
i chybovou hlášku pod ním? Napiš číslo.

### --expected--

2

### --accept--

dva

### --why--

`aria-invalid` (tohle pole je špatně) a `aria-describedby` (a tady je proč).
K tomu samozřejmě pořádný `<label>`, ten ale potřebuje pole vždycky.
:::

## Problém: `useState` na každé pole

Takhle vypadá formulář, který v Reactu napíše skoro každý poprvé:

```jsx
const [jmeno, setJmeno] = useState('');
const [email, setEmail] = useState('');
const [telefon, setTelefon] = useState('');
const [souhlas, setSouhlas] = useState(false);
// …a pod tím čtyři onChange, čtyři value a nula validace
```

U čtyř polí to jde. U dvanácti je to tři sta řádků a při každém stisku klávesy se
překreslí celý formulář. Hlavně ale chybí to podstatné: kde se rozhoduje, jestli
jsou data v pořádku.

> [!REMEMBER]
> **Formulář má jedno místo, kde se rozhoduje o platnosti dat** — funkci, která
> z hodnot vyrobí seznam chyb. Komponenta ji jen zavolá a chyby vykreslí.

Prohlížeč přitom umí spoustu práce sám: `required`, `type="email"`, `minlength`
i `pattern` znáš z [Validace, kterou umí prohlížeč](see:js-dom/formulare-v-js#validace-kterou-umi-prohlizec).
V Reactu je pořád používáš — jen k nim přidáš vlastní pravidla a vlastní hlášky,
protože ty prohlížečové jsou anglicky a nedají se stylovat.

:::check
Proč se rozhodnutí o platnosti dat píše do samostatné funkce, a ne přímo do
obsluhy odeslání?

### --expected--

Jde použít i jinde

### --accept--

Dá se otestovat a použít i na serveru.
Aby šla otestovat samostatně a sdílet se serverem.

### --why--

Funkce, která z dat vyrobí chyby, se dá otestovat bez vykreslení komponenty
a použít úplně stejně na serveru. Kdyby byla schovaná v obsluze události, nejde
ani jedno.

### --see--

react-aplikace/formulare-a-validace#problem-usestate-na-kazde-pole
:::

## Formulář s akcí: `useActionState`

React 19 přidal formulářům vlastní cestu. `<form action={…}>` dostane funkci,
která při odeslání dostane `FormData` — a hook `useActionState` si pamatuje, co
ta [[akce formuláře|funkce]] vrátila.

:::live react
```jsx
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

// Jediné místo, kde se rozhoduje o platnosti. Vrací mapu chyb podle jména pole.
function zkontroluj(data) {
  const chyby = {};
  if (data.jmeno.trim().length < 2) chyby.jmeno = 'Napiš prosím jméno a příjmení.';
  if (!data.email.includes('@')) chyby.email = 'E-mail musí obsahovat zavináč.';
  if (data.osob < 1 || data.osob > 8) chyby.osob = 'Rezervujeme pro 1 až 8 osob.';
  return chyby;
}

function Odeslat() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Odesílám…' : 'Rezervovat stůl'}
    </button>
  );
}

export default function Rezervace() {
  const [stav, akce] = useActionState(async (predchozi, formData) => {
    const data = {
      jmeno: String(formData.get('jmeno') ?? ''),
      email: String(formData.get('email') ?? ''),
      osob: Number(formData.get('osob')),
    };
    const chyby = zkontroluj(data);
    if (Object.keys(chyby).length > 0) return { chyby, data };

    await new Promise((splnit) => setTimeout(splnit, 400)); // tady by šel požadavek na server
    return { chyby: {}, data, hotovo: true };
  }, { chyby: {}, data: { jmeno: '', email: '', osob: 2 } });

  return (
    <form action={akce} noValidate className="formular">
      <h1>Rezervace stolu</h1>

      <label htmlFor="jmeno">Jméno a příjmení</label>
      <input id="jmeno" name="jmeno" defaultValue={stav.data.jmeno} />
      {stav.chyby.jmeno && <p className="chyba">{stav.chyby.jmeno}</p>}

      <label htmlFor="email">E-mail</label>
      <input id="email" name="email" type="email" defaultValue={stav.data.email} />
      {stav.chyby.email && <p className="chyba">{stav.chyby.email}</p>}

      <label htmlFor="osob">Počet osob</label>
      <input id="osob" name="osob" type="number" defaultValue={stav.data.osob} />
      {stav.chyby.osob && <p className="chyba">{stav.chyby.osob}</p>}

      <Odeslat />
      {stav.hotovo && <p className="hotovo">Stůl máme rezervovaný. Ozveme se e-mailem.</p>}
    </form>
  );
}
```
```css
body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: #f6f5f3; color: #1f2933; }
.formular { max-width: 420px; margin: 24px auto; padding: 24px; background: #fff; border: 1px solid #e3e1dd; border-radius: 14px; display: grid; gap: 4px; }
h1 { margin: 0 0 12px; font-size: 1.3rem; }
label { font-size: 0.9rem; color: #6b7280; margin-top: 10px; }
input { padding: 9px 12px; border: 1px solid #d8d3cc; border-radius: 8px; font: inherit; }
input:focus-visible { outline: 2px solid #1f6f4f; outline-offset: 1px; }
.chyba { margin: 4px 0 0; color: #b3261e; font-size: 0.88rem; }
.hotovo { margin: 12px 0 0; color: #1f6f4f; font-weight: 600; }
button { margin-top: 18px; border: 0; border-radius: 999px; padding: 11px 20px; background: #1f6f4f; color: #fff; font: inherit; cursor: pointer; }
button:disabled { opacity: 0.6; cursor: default; }
```
:::

Zkus odeslat prázdný formulář, pak doplnit jen jméno a odeslat znovu. Všimni si
dvou věcí: rozepsané hodnoty se **neztratí** (vracíš je ve `stav.data`
a používáš jako `defaultValue`) a tlačítko se během odesílání samo zablokuje.

Tři věci, které tenhle zápis dělá zadarmo:

- pole jsou [[neřízené pole|neřízená]], takže psaní nepřekresluje celý formulář,
- `useFormStatus` uvnitř tlačítka ví o probíhajícím odeslání, aniž by mu to někdo
  posílal propsou,
- `noValidate` vypne prohlížečové bubliny, protože hlášky si píšeš sám.

> [!NOTE]
> `useActionState` ani `action` na formuláři není povinnost. Ve velkých
> formulářích se často sahá po knihovně **React Hook Form** (neřízená pole,
> validace schématem, chyby po poli). Vzor je ale stejný: jedna funkce rozhodne
> o platnosti, komponenta jen vykreslí chyby.

:::check
Proč se v ukázce vrací ve stavu i `data`, když validace projde i neprojde?

### --expected--

Aby se neztratily vyplněné hodnoty

### --accept--

Aby pole zůstala vyplněná po chybě.
Slouží jako defaultValue polí po neúspěšném odeslání.

### --why--

Neřízená pole se po překreslení nastaví z `defaultValue`. Bez vrácených dat by
uživatel po chybě našel prázdný formulář — což je nejrychlejší způsob, jak ho
z aplikace vyhnat.

### --see--

react-aplikace/formulare-a-validace#formular-s-akci-useactionstate
:::

## Chyby, které uvidí a uslyší každý

Červený text pod polem stačí vidícímu uživateli s myší. Pro čtečku obrazovky je
to jen odstavec kdesi na stránce. Propojení se dělá dvěma atributy:

```jsx
<label htmlFor="email">E-mail</label>
<input
  id="email"
  name="email"
  aria-invalid={chyba ? true : undefined}
  aria-describedby={chyba ? 'email-chyba' : undefined}
/>
{chyba && <p id="email-chyba" className="chyba">{chyba}</p>}
```

- `aria-invalid` říká „tohle pole je špatně vyplněné",
- `aria-describedby` ukazuje na `id` odstavce s hláškou, takže ji čtečka přečte
  hned po názvu pole,
- `id` odstavce musí být na stránce jedinečné. Když se komponenta pole používá
  víckrát, id si nevymýšlej — vyrob ho hookem `useId`.

Atributy se přidávají **jen když chyba je**. Trvale nastavené `aria-invalid`
znamená „tohle pole je špatně vždycky", což čtečka poslušně oznámí i u prázdného
formuláře.

> [!PITFALL]
> `aria-invalid={false}` a `aria-invalid={undefined}` nejsou totéž.
> První vypíše do HTML `aria-invalid="false"`, druhý atribut vůbec nevykreslí.
> U chybějící chyby chceš ten druhý.

:::check
Pole má `aria-describedby="email-chyba"`, ale odstavec s hláškou se vykresluje
jen při chybě. Co uslyší čtečka obrazovky, když chyba není?

### --expected--

Jen název pole

### --accept--

Nic navíc, popis neexistuje.
Jen label, protože odkazovaný prvek na stránce není.

### --why--

Odkaz na neexistující `id` se ignoruje, takže se nic nerozbije. Přesto je
čistší atribut nevykreslovat vůbec — jinak je v HTML odkaz, který nikam nevede.

### --see--

react-aplikace/formulare-a-validace#chyby-ktere-uvidi-a-uslysi-kazdy
:::

## Kdy hlášku ukázat

Nejčastější chyba v návrhu formulářů: hláška „E-mail musí obsahovat zavináč"
vyskočí po napsání prvního písmene. Uživatel ještě nic nepokazil, jen ještě
nedopsal.

| okamžik | co ukázat |
|---|---|
| při psaní (`onChange`) | nic, dokud pole nebylo poprvé opuštěné nebo odeslané |
| při opuštění pole (`onBlur`) | chybu toho jednoho pole |
| při odeslání | chyby všech polí a fokus na první z nich |
| po odpovědi serveru | chyby, které mohl zjistit jen server (obsazený e-mail) |

Ve **znovu** odesílaném formuláři už se hlášky můžou aktualizovat při psaní: v tu
chvíli uživatel ví, co po něm chceš, a okamžitá odezva mu pomáhá.

> [!TIP]
> Bez jediného řádku JavaScriptu umí totéž CSS: pseudotřída `:user-invalid` se
> zapne teprve tehdy, když s polem uživatel skutečně pracoval. Na jednoduché
> formuláře stačí `input:user-invalid { border-color: #b3261e; }`.

:::live react predict
```jsx
import { useState } from 'react';

export default function Prihlaska() {
  const [email, setEmail] = useState('');
  const chyba = email.includes('@') ? null : 'E-mail musí obsahovat zavináč.';

  return (
    <form onSubmit={(udalost) => udalost.preventDefault()}>
      <label htmlFor="email">E-mail</label>
      <input id="email" value={email} onChange={(udalost) => setEmail(udalost.target.value)} />
      {chyba && <p className="chyba">{chyba}</p>}
    </form>
  );
}
```
--question-- Uživatel klikne do pole a napíše první písmeno svého e-mailu. Co uvidí?
--option-- Nic, hláška se ukáže až po odeslání.
--option*-- Červenou hlášku „E-mail musí obsahovat zavináč."
--option-- Hlášku prohlížeče v bublině nad polem.
--why-- Chyba se počítá při každém vykreslení z aktuální hodnoty, a vykreslení nastane po každém stisku klávesy. Uživatel tedy dostane vynadáno dřív, než stihne dopsat. Opravou není složitější podmínka, ale rozhodnutí **kdy** se hláška smí objevit: typicky až po prvním opuštění pole nebo po odeslání.
:::

:::check
Formulář má ukázat chybu až po prvním opuštění pole. Co si k tomu musíš
zapamatovat navíc?

### --expected--

Že pole už bylo opuštěné

### --accept--

Jestli se pole už dotklo, tedy stav dotknuto.
Pro každé pole, jestli z něj uživatel už odešel.

### --why--

Samotná hodnota nestačí — prázdné pole na začátku vypadá stejně jako prázdné pole
po odchodu. Proto se u každého pole drží ještě [[příznak dotknuto|příznak]] „už jsem v něm byl"
(anglicky *touched*), který nastaví `onBlur`.

### --see--

react-aplikace/formulare-a-validace#kdy-hlasku-ukazat
:::

## Jedno schéma pro klienta i server

Kontrola na klientovi je pohodlí, ne bezpečnost. Kdokoli může poslat požadavek
mimo formulář, takže **server musí kontrolovat úplně stejně**. Psát pravidla
dvakrát znamená, že se jednou rozejdou.

Řešení je schéma — popis, jak mají data vypadat, ze kterého se dá vyrobit
kontrola pro obě strany. V ekosystému TypeScriptu je nejrozšířenější **Zod**:

```js
import { z } from 'zod';

// Sdílený soubor, který importuje frontend i backend.
export const Rezervace = z.object({
  jmeno: z.string().min(2, 'Napiš prosím jméno a příjmení.'),
  email: z.email('E-mail musí obsahovat zavináč.'),
  osob: z.number().int().min(1).max(8, 'Rezervujeme pro 1 až 8 osob.'),
});

// Na obou stranách stejně:
const vysledek = Rezervace.safeParse(data);
if (!vysledek.success) {
  const chyby = z.flattenError(vysledek.error).fieldErrors; // { email: ['E-mail musí…'] }
}
```

`safeParse` nikdy nevyhodí výjimku: buď vrátí `{ success: true, data }`
s hodnotami převedenými na správné typy, nebo `{ success: false, error }`.
`z.flattenError` z chyby udělá mapu podle jmen polí — přesně to, co komponenta
potřebuje k vykreslení.

> [!REMEMBER]
> **Validace na klientovi je kvůli uživateli, validace na serveru kvůli datům.**
> Jedno bez druhého nestačí, a proto se schéma píše jednou a sdílí.

:::check
Proč nestačí data kontrolovat jen ve formuláři na klientovi?

### --expected--

Požadavek jde poslat i mimo formulář

### --accept--

Kdokoli může poslat požadavek přímo na API.
Klientskou kontrolu jde obejít.

### --why--

Formulář je jen jedno z možných rozhraní k API. Požadavek se dá poslat
z terminálu, z jiné aplikace nebo z upraveného prohlížeče. Server proto kontroluje
vždycky — klientská validace je kvůli rychlé odezvě.

### --see--

react-aplikace/formulare-a-validace#jedno-schema-pro-klienta-i-server
:::

:::explain
Vysvětli, proč je lepší psát validaci jako funkci nad daty než jako podmínky
rozeseté v obsluze `onChange` jednotlivých polí.

## --model--

Funkce nad daty dostane hodnoty a vrátí chyby, takže jde spustit kdekoli: v testu
bez vykreslení komponenty, při odeslání formuláře i na serveru. Když jsou
podmínky rozeseté po obsluhách, platí jen ve chvíli, kdy uživatel do pole píše —
odeslání zkratkou nebo požadavek mimo formulář je obejde. A protože pravidla
závisí často na víc polích najednou (datum do musí být po datu od), potřebuje
kontrola vidět všechna data, ne jen jedno pole.

## --checklist--

- Funkce nad daty jde spustit bez vykreslení komponenty.
- Stejná pravidla se dají použít na serveru.
- Podmínky v obsluhách polí jdou obejít jinou cestou.
- Některá pravidla potřebují vidět víc polí najednou.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Chybějící `name` na poli.** Bez něj `FormData` hodnotu nevidí a akce dostane
> `null`. Příznak: formulář se odešle s prázdnými hodnotami, i když v polích něco
> je. `id` a `name` jsou dvě různé věci: `id` páruje `label`, `name` posílá data.

> [!PITFALL]
> **`value` bez `onChange`.** React ohlásí v konzoli
> `You provided a 'value' prop to a form field without an 'onChange' handler.`
> a pole nepůjde psát. Buď dej obojí (řízené pole), nebo použij `defaultValue`
> (neřízené pole).

> [!PITFALL]
> **Přepnutí z neřízeného na řízené.** Když je počáteční hodnota `undefined`
> a později přijde text, React hlásí
> `A component is changing an uncontrolled input to be controlled.` Výchozí
> hodnotou řízeného pole je vždycky `''`, nikdy `undefined`.

> [!PITFALL]
> **Čísla z formuláře jsou text.** `formData.get('osob')` vrátí `'4'`. Bez
> převodu projde porovnání `'4' > 8` jako `false`, ale `'10' > 8` taky — protože
> se porovnávají řetězce. Převeď hned při čtení.

> [!PITFALL]
> **Hláška bez vazby na pole.** Seznam chyb nahoře nad formulářem vypadá
> přehledně, ale uživatel musí sám hledat, které pole je které. Hlášku dej k poli
> a shrnutí nahoře nech jen jako doplněk s odkazy.

:::check
Formulář se odešle s prázdnými hodnotami, i když do polí uživatel psal. Co
nejspíš chybí?

### --expected--

Atribut name

### --accept--

name na poli.
Pole nemají name, takže je FormData nevidí.

### --why--

`FormData` sbírá hodnoty podle `name`, ne podle `id`. Pole bez `name` do dat
vůbec nevstoupí, i když má popisek i hodnotu.

### --see--

react-aplikace/formulare-a-validace#typicke-chyby-a-pasti
:::

## Kde to najdeš v MDN

- [Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) —
  co umí prohlížeč sám a jaké atributy k tomu slouží.
- [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) —
  objekt, který dostane akce formuláře; `get`, `getAll`, `entries`.
- [aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid) —
  kdy atribut nastavit a jaké má hodnoty.
- [:user-invalid](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid) —
  pseudotřída, která se zapne až po skutečné interakci uživatele.

# --questions--

## --question--

Pole v ukázce má `defaultValue={stav.data.jmeno}` místo `value`. Co by se
změnilo, kdyby tam bylo `value` bez `onChange`?

### --expected--

Do pole by nešlo psát

### --accept--

Pole by bylo jen ke čtení a React by to vytkl v konzoli.
Nešlo by ho měnit, React by hlásil chybějící onChange.

### --why--

`value` dělá z pole řízené: jeho obsah určuje React a bez `onChange` se nemá jak
změnit. `defaultValue` nastaví počáteční hodnotu a dál pole nechá být.

### --see--

react-aplikace/formulare-a-validace#typicke-chyby-a-pasti

## --question--

Kde musí být validace, aby se do databáze nedostala objednávka se záporným
počtem kusů?

### --answer--

Ve formuláři, pomocí `min="1"` na poli.

#### --why--

Atribut `min` zabrání odeslání z formuláře. Požadavek se ale dá poslat i jinudy,
než přes tvůj formulář.

### --correct--

Na serveru; ve formuláři je navíc, kvůli rychlé odezvě.

#### --why--

Server je jediné místo, které nejde obejít. Klientská kontrola je pohodlí pro
uživatele, ne ochrana dat.

### --answer--

Stačí jedna z nich, hlavně ať je pravidlo napsané jednou.

#### --why--

Napsané jednou má být **schéma**, ne kontrola. Schéma se sdílí, ale spouští se na
obou stranách.

## --question--

Jak se jmenuje hook, kterým se uvnitř tlačítka dostaneš k informaci, že
formulář právě odesílá?

### --expected--

useFormStatus

### --accept--

useFormStatus z react-dom

### --why--

`useFormStatus` čte stav nejbližšího nadřazeného `<form>`, takže tlačítko nemusí
nic dostávat propsou. Funguje ale jen v komponentě **uvnitř** formuláře, ne v té,
která formulář vykresluje.

### --see--

react-aplikace/formulare-a-validace#formular-s-akci-useactionstate

## --question--

Formulář ukazuje chybu u e-mailu hned po prvním písmenu. Co je nejmenší rozumná
změna?

### --expected--

Ukázat ji až po opuštění pole

### --accept--

Zobrazit hlášku až po blur nebo po odeslání.
Počkat, až pole uživatel opustí.

### --why--

Pravidlo zůstává stejné, mění se jen okamžik zobrazení. Proto se u každého pole
drží příznak „už jsem v něm byl", který nastaví `onBlur`.

### --see--

react-aplikace/formulare-a-validace#kdy-hlasku-ukazat
