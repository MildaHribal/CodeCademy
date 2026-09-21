# shadcn/ui a Radix primitivy

Dialog s potvrzením, rozbalovací menu u řádku tabulky, záložky v nastavení, výběr
země, přepínač. Tyhle prvky má skoro každá aplikace a skoro nikdo si je dneska
nepíše od nuly — staví je nad **primitivy**, tedy komponentami, které umí chování
a přístupnost, ale nemají žádný vzhled. Tahle lekce ukáže, co přesně za tebe
primitivum udělá, co zůstane na tobě a proč nejpoužívanější React sada
komponent shadcn/ui kód **kopíruje do tvého repozitáře** místo do `node_modules`.

:::check pretest
Otevřeš vlastní „dialog" jako `{otevreno && <div className="fixed inset-0 …">}`.
Uživatel je v něm a zmáčkne Tab. Co udělá prohlížeč?

### --answer--
Fokus zůstane uvnitř dialogu, protože dialog překrývá stránku.

#### --why--
Překrytí je jen vzhled. Prohlížeč o „dialogu" v obyčejném `<div>` nic neví.

### --correct--
Fokus odejde na prvky pod dialogem, které uživatel nevidí.
:::

:::check pretest
V projektu spustíš `npx shadcn@latest add button`. Co přesně tím do projektu přibude?

### --answer--
Nová závislost v `package.json`, kterou pak importuješ.

#### --why--
Zkus si tipnout, kde by pak bylo možné upravit zaoblení tlačítka na vzhled tvojí značky.

### --correct--
Soubor `components/ui/button.tsx` přímo v tvém repozitáři.
:::

## Problém: dialog, který se jen tváří jako dialog

Modal z minulých sekcí vypadá dobře. Zkus ho ale ovládat jenom klávesnicí a se
zavřenýma očima:

```jsx
{otevreno && (
  <div className="fixed inset-0 bg-black/50">
    <div className="mx-auto mt-40 w-96 rounded-xl bg-white p-6">
      <p>Opravdu zrušit předplatné?</p>
      <button onClick={() => setOtevreno(false)}>Zrušit</button>
    </div>
  </div>
)}
```

Chybí mu tohle: fokus po otevření nikam neskočil, Tab utíká na prvky pod
překrytím, Escape nic nedělá, čtečka nic neohlásí (žádná role, žádný název),
stránka vzadu se pořád scrolluje a po zavření se kurzor nevrátí na tlačítko,
kterým se dialog otevřel. Napsat to všechno správně je práce na den a půl —
a pak to samé pro menu, záložky a výběr.

> [!REMEMBER]
> **Primitivum ti dá chování a přístupnost, vzhled zůstane na tobě.** Radix
> nevykresluje žádnou barvu ani odsazení; dává ti role, fokus, klávesnici,
> portál a stav v atributech.

:::check
Vyjmenuj tři věci, které tvůj vlastní `<div>` s překrytím neumí, i když vypadá
jako dialog.

### --expected--
fokus uvnitř, Escape, návrat fokusu

### --accept--
past na fokus, zavření Escapem, role a název pro čtečku
fokus, klávesnice, ohlášení čtečce
:::

## Radix primitiva: chování bez vzhledu

Všechna primitiva jsou dnes v jednom balíčku `radix-ui` a berou se z něj po
jménech: `import { Dialog, DropdownMenu, Tabs } from 'radix-ui'`. Každé
primitivum je sada dílů, které se skládají do sebe — u dialogu takhle:

| díl | co dělá |
|---|---|
| `Dialog.Root` | drží stav otevření a propojuje díly |
| `Dialog.Trigger` | prvek, který dialog otevírá (dostane `aria-haspopup`, `aria-expanded`) |
| `Dialog.Portal` | vykreslí obsah na konec `<body>`, mimo tvůj layout |
| `Dialog.Overlay` | překrytí stránky |
| `Dialog.Content` | samotné okno: `role="dialog"`, [[past na fokus]], Escape, návrat fokusu na `Trigger` |
| `Dialog.Title` | název dialogu — čtečka ho ohlásí při otevření |
| `Dialog.Description` | doplňující věta (nepovinné) |
| `Dialog.Close` | prvek, který dialog zavře |

Třídy jsou tvoje: žádný díl nemá vlastní vzhled, takže stylujeme přesně jako
v minulém workshopu.

:::live react libs=tailwind
```jsx
import { Dialog } from 'radix-ui';

export default function App() {
  return (
    <div className="p-6">
      <Dialog.Root>
        <Dialog.Trigger className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Zrušit předplatné
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-80 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold">Zrušit předplatné</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-slate-600">
              Hudbu si pustíš do konce zaplaceného období.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close className="rounded-lg px-4 py-2 text-sm">Zpět</Dialog.Close>
              <Dialog.Close className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white">Zrušit</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
```
:::

Zkus v ukázce projít dialog jen klávesnicí: otevři ho Enterem, projdi Tabem
dokola (ven se nedostaneš), zavři Escapem a všimni si, že kurzor skončí zpátky
na tlačítku. Pak si v DevTools rozbal `<body>` — obsah dialogu je až úplně dole,
ne uvnitř tvého `<div>`.

:::check
Proč Radix vykresluje obsah dialogu přes `Portal` až na konec `<body>`, a ne tam,
kde ho napíšeš v JSX?

### --answer--
Aby se dialog vešel do stránky i na mobilu.

#### --why--
S velikostí to nesouvisí — dialog má `position: fixed` a vejde se tak jako tak.
Jde o to, co by s ním udělali jeho rodiče.

### --correct--
Aby ho neořízl ani neposunul žádný rodič s `overflow: hidden` nebo `transform`.

#### --why--
Rodič s `overflow: hidden` obsah ořízne a rodič s `transform` se stane vztažným
prvkem i pro `position: fixed`. V portálu na konci `<body>` žádného takového
rodiče nemá.
:::

## Řízený a neřízený režim

Každé primitivum umí dva režimy, neřízený a [[řízený režim|řízený]]. **Neřízený** si stav drží sám — napíšeš jen
`defaultOpen` (nebo nic) a o nic se nestaráš. **Řízený** stav držíš ty:
`open={otevreno} onOpenChange={setOtevreno}`. Přesně stejná dvojice funguje
u `Tabs` (`value` / `onValueChange`), `Switch` (`checked` / `onCheckedChange`)
i `Select`.

Neřízený režim je výchozí volba. Řízený potřebuješ, když stav ovlivňuje něco
dalšího: dialog se má otevřít z položky menu, po odeslání formuláře se má sám
zavřít, nebo si chceš pamatovat, který řádek se zrovna maže.

:::live react libs=tailwind predict
```jsx
import { useState } from 'react';
import { Dialog } from 'radix-ui';

export default function App() {
  const [otevreno, setOtevreno] = useState(false);

  return (
    <div className="p-6">
      <button onClick={() => setOtevreno(true)} className="rounded bg-slate-900 px-3 py-2 text-white">
        Odhlásit zařízení
      </button>
      <Dialog.Root open={otevreno} onOpenChange={setOtevreno}>
        <Dialog.Portal>
          <Dialog.Content className="fixed left-10 top-10 rounded-xl bg-white p-6 shadow-xl">
            <Dialog.Title>Odhlásit zařízení</Dialog.Title>
            <Dialog.Close className="mt-4 rounded bg-slate-200 px-3 py-1">Zpět</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
```
--question-- Dialog je řízený stavem a otevírá ho obyčejné `<button>` mimo `Dialog.Trigger`. Kde skončí fokus po zavření dialogu Escapem?
--option-- Na tlačítku „Odhlásit zařízení" — dialog si pamatuje prvek, který měl fokus před otevřením.
--option-- Na prvním prvku stránky, protože dialog neví, odkud byl otevřený.
--option*-- Na `<body>` — fokus se vrací na `Dialog.Trigger`, a ten tady žádný není.
--why-- Modální `Dialog.Content` výchozí návrat fokusu zruší a zaostří `Dialog.Trigger`. Když dialog otevřeš tlačítkem mimo `Trigger`, není co zaostřit a fokus spadne na `<body>`: uživatel klávesnice pak začíná znovu od začátku stránky. Buď dialog otevírej z `Trigger`u, nebo si fokus vrať sám v `onCloseAutoFocus`.
:::

> [!TIP]
> Chceš fokus jinam, než odkud se dialog otevřel (třeba na pole formuláře)?
> `Dialog.Content` má props `onOpenAutoFocus` a `onCloseAutoFocus` — zavoláš
> v nich `event.preventDefault()` a zaostříš si, co chceš.

:::check
Máš přepínač „Explicitní obsah", jehož hodnotu chceš hned posílat na server.
Zvolíš řízený, nebo neřízený režim, a proč?

### --expected--
řízený, protože hodnotu potřebuju v kódu

### --accept--
řízený režim — stav drží komponenta a může na změnu reagovat
řízený, přes checked a onCheckedChange
:::

## Stav v atributech: `data-state`

Primitivum svůj stav nevystavuje jen v JavaScriptu, ale i v DOM. Otevřený obsah
má `data-state="open"`, zavřený `data-state="closed"`, aktivní záložka
`data-state="active"`, položka menu pod kurzorem `data-highlighted`, obsah
popoveru navíc `data-side="top"` podle toho, kam se vešel.

Stylujeme přes to úplně stejně jako v minulé lekci — variantou `data-[…]:`.
Výhoda je, že v komponentě nepotřebuješ žádný stav a v DevTools stav **vidíš**.

:::live react libs=tailwind
```jsx
import { Tabs } from 'radix-ui';

export default function App() {
  return (
    <Tabs.Root defaultValue="profil" className="p-6">
      <Tabs.List className="flex gap-1 border-b border-slate-200" aria-label="Nastavení účtu">
        {['profil', 'předplatné', 'zařízení'].map((zalozka) => (
          <Tabs.Trigger
            key={zalozka}
            value={zalozka}
            className="rounded-t-lg px-4 py-2 text-sm text-slate-600 data-[state=active]:bg-slate-900 data-[state=active]:text-white"
          >
            {zalozka}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value="profil" className="pt-4 text-sm">Jméno, e-mail, fotka.</Tabs.Content>
      <Tabs.Content value="předplatné" className="pt-4 text-sm">Tarif Rodina, 249 Kč měsíčně.</Tabs.Content>
      <Tabs.Content value="zařízení" className="pt-4 text-sm">Telefon Pixel, notebook, televize.</Tabs.Content>
    </Tabs.Root>
  );
}
```
:::

Zkus v ukázce záložky přepínat jen šipkami (nejdřív se na ně dostaň Tabem)
a sleduj, že obsah se mění hned se šipkou. Pak si zkus přidat do třídy
`data-[state=inactive]:opacity-60` a uvidíš neaktivní záložky bledší.

:::check
Napiš třídu, která dá otevřenému obsahu menu bílé pozadí a zavřenému nic.

### --expected--
data-[state=open]:bg-white
:::

## shadcn/ui: kód v repozitáři, ne závislost

Radix ti dá chování, ale pořád si musíš napsat každý vzhled. Přesně tuhle práci
ti ušetří **shadcn/ui**: sada hotových komponent nad Radixem, nastylovaná
Tailwindem — jenže se neinstaluje jako balíček. CLI ti **zkopíruje zdrojový kód
komponenty do tvého projektu**:

```sh
npx shadcn@latest init          # components.json, tokeny v CSS, lib/utils.ts s cn()
npx shadcn@latest add button dialog dropdown-menu
```

Po `add` máš v repozitáři `components/ui/button.tsx` a `components/ui/dialog.tsx`
— soubory, které vypadají skoro přesně jako ty, cos psal v minulém workshopu:
`cva` s variantami, `cn()`, `asChild` přes `Slot`, props přes `ComponentProps`.
Žádná magie, žádný `node_modules/shadcn-ui`.

| dostaneš | cena za to |
|---|---|
| kód je tvůj: přepíšeš barvy, zaoblení, varianty | aktualizace si musíš vzít ručně (`diff`, nebo znovu `add`) |
| vidíš, jak komponenta funguje, a učíš se z ní | za kvalitu ručíš ty, ne verze balíčku |
| nic navíc v balíku aplikace | při deseti komponentách deset souborů k údržbě |

Barvy nejsou napsané v komponentách natvrdo — jedou přes sémantické tokeny
(`--background`, `--foreground`, `--primary`, `--ring`…) v `@theme inline`, takže
tmavý motiv je jen jiná sada hodnot. To už znáš z Tailwindu.

> [!NOTE]
> Alternativy, na které narazíš: **Base UI** (primitivy od stejných lidí, novější)
> a **React Aria Components** od Adobe. Oboje řeší to samé; princip „chování
> zvlášť, vzhled zvlášť" je u všech stejný, takže tuhle lekci uplatníš i tam.

:::check
Kolega říká: „shadcn/ui neber, špatně se aktualizuje." Co mu odpovíš — co
konkrétně se aktualizuje ručně a co za to dostaneš?

### --expected--
ručně kód komponent, za to je můžeš libovolně upravit

### --accept--
aktualizace komponent v components/ui, výměnou za to, že kód vlastníš
zkopírované komponenty si musíš aktualizovat sám, zato je můžeš změnit
:::

## Co zůstává na tobě

Primitivum je zodpovědné za chování, ne za smysl. Pořád musíš:

- dát dialogu **název** (`Dialog.Title`) — i když ho vizuálně nechceš, pak ho schováš (`VisuallyHidden`),
- napsat srozumitelné texty tlačítek („Zrušit předplatné", ne „OK"),
- vybrat **správné primitivum**: `AlertDialog` pro nevratnou akci (nezavře ho klik mimo ani Escape bez volby), `Dialog` pro formulář, `Popover` pro doplňkový obsah, `Tooltip` jen pro popisek k ikoně,
- rozhodnout, co je nativní: `<select>` na mobilu funguje skvěle a `Select` z Radixu potřebuješ jen kvůli vzhledu,
- nastylovat viditelný fokus a stavy.

:::check
Máš tlačítko „Smazat účet". Které primitivum použiješ a proč zrovna to?

### --expected--
AlertDialog, protože akce je nevratná

### --accept--
AlertDialog — nevratnou akci nesmí zavřít klik mimo
:::

:::explain
Vysvětli vlastními slovy, proč se vyplatí vzít si hotové primitivum místo napsání
vlastního rozbalovacího menu.

## --model--
Menu vypadá jako jednoduchá komponenta, dokud se nezačnou počítat požadavky: fokus se
musí přesunout dovnitř a po zavření zpátky, šipky mají přepínat položky, Escape zavírat,
klik mimo taky, čtečka musí ohlásit roli i stav, obsah nesmí být oříznutý přetečením
rodiče a na dotykovém zařízení se to chová jinak. To je několik set řádků, které se
navíc těžko testují — a každá z nich je chyba, kterou si nevšimnu, protože myší mi to
funguje. Primitivum tohle všechno přináší hotové a **vzhled nechává na mně**, takže si
neberu cizí design, jen cizí chování.

## --checklist--
- Skryté požadavky jsou fokus, klávesnice, role a přetečení.
- Vlastní implementace je dlouhá a špatně se testuje.
- Chyby v přístupnosti při ovládání myší nejsou vidět.
- Primitivum dá chování a vzhled nechá na mně.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Dialog bez `Dialog.Title`.** Příznak: dialog se otevře a vypadá dobře, ale
> čtečka ohlásí jen „dialog" bez názvu — v DOM na `[role="dialog"]` vůbec není
> atribut `aria-labelledby`. Oprava: přidej `Dialog.Title`; když se do návrhu
> nehodí, obal ho `VisuallyHidden` z `radix-ui`.

> [!PITFALL]
> **Obsah bez `Portal` uvnitř karty s `overflow-hidden`.** Příznak: dialog nebo
> menu je oříznuté, nebo se vykreslí pod jiným prvkem, i když má vysoký
> `z-index`. Oprava: obal `Content` do `Portal` — pak žádného takového rodiče nemá.

> [!PITFALL]
> **`asChild` se dvěma potomky.** Příznak: `React.Children.only expected to
> receive a single React element child`. `asChild` předává props **jednomu**
> potomkovi, takže text a ikonu musíš zabalit do jednoho prvku.

> [!PITFALL]
> **Dialog otevíraný z položky menu, která zmizí.** Příznak: dialog se otevře,
> po zavření je fokus na `<body>` a klávesnice začíná od začátku stránky. Vzniká
> to tím, že `Dialog.Root` je uvnitř `DropdownMenu.Item`: menu se při výběru
> odmontuje i s dialogem. Oprava: drž otevření dialogu ve stavu **mimo** menu
> a položka menu jen nastaví stav.

> [!PITFALL]
> **Vlastní úpravy zkopírované komponenty bez poznámky.** Příznak: po dalším
> `npx shadcn@latest add dialog` jsou tvoje změny pryč. Oprava: úpravy dělej
> vědomě (a v commitu je popiš), nebo si komponentu přejmenuj na vlastní.

:::check
Dialog se otevírá z položky rozbalovacího menu. Kam dáš stav, který říká, jestli
je otevřený, a proč zrovna tam?

### --expected--
mimo menu, do komponenty nad ním

### --accept--
do komponenty, která menu obsahuje — položka menu jen nastaví stav
mimo menu, protože se položka po výběru odmontuje
:::

## Kde to najdeš v MDN

- [ARIA: dialog role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role) — co všechno musí prvek s rolí dialogu splňovat; přesně tenhle seznam za tebe plní Radix.
- [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) — nativní dialog prohlížeče: umí past na fokus i Escape, ale nikoli animace odchodu a stylování pozadí ve všech prohlížečích stejně.
- [`inert`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert) — atribut, kterým se obsah za dialogem vyřadí z fokusu i ze čtečky.
- [Radix Primitives — Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) — anglicky: úplný seznam dílů, props a `data-*` atributů.

# --questions--

## --question--

Napiš, co konkrétně se stane, když u `Dialog.Content` vynecháš `Dialog.Title`.
Nezajímá vzhled, ale to, co uvidí test a uživatel se čtečkou.

### --expected--

dialog nemá aria-labelledby, takže čtečka ohlásí dialog bez názvu

### --accept--

dialog nemá přístupný název

### --why--

Radix nastaví `aria-labelledby` na id nadpisu z `Dialog.Title`. Bez něj atribut
vůbec nevznikne, dialog nemá přístupný název a čtečka ohlásí jen roli. Test to
pozná tak, že se podívá, jestli `aria-labelledby` existuje a míří na prvek
s textem.

### --see--

react-ui-knihovny/shadcn-a-radix#typicke-chyby-a-pasti

## --question--

Kdy potřebuješ **řízený** režim primitiva a kdy si vystačíš s neřízeným? Uveď
u každého jeden příklad z aplikace.

### --expected--

řízený, když stav potřebuje kód; neřízený, když stačí samotné primitivum

### --accept--

řízený: dialog otevíraný odjinud nebo zavíraný po odeslání; neřízený: obyčejné rozbalovací menu

### --why--

Neřízený režim je výchozí volba a nejmíň kódu. Řízený potřebuješ ve chvíli, kdy
o stavu rozhoduje něco mimo primitivum (jiná komponenta, odpověď serveru, adresa
v URL) nebo když na změnu stavu chceš reagovat.

### --see--

react-ui-knihovny/shadcn-a-radix#rizeny-a-nerizeny-rezim

## --question--

Co z tohohle seznamu Radix **nevyřeší** za tebe?

### --answer--

Vrácení fokusu na `Dialog.Trigger` po zavření dialogu.

#### --why--

Tohle je jedna z hlavních věcí, proč primitivum bereš: `Dialog.Content` po zavření
zaostří `Trigger` sám. Jen když dialog otevíráš tlačítkem mimo `Trigger`, musíš
si o fokus říct v `onCloseAutoFocus`.

### --answer--

Zavření dialogu klávesou Escape.

#### --why--

Escape obsluhuje `Dialog.Content` sám, stejně jako past na fokus.

### --correct--

Text nadpisu dialogu a to, jestli je akce nevratná.

#### --why--

Obsah a volba správného primitiva jsou rozhodnutí o produktu, ne o chování
komponenty. Knihovna neví, co po uživateli chceš.

### --see--

react-ui-knihovny/shadcn-a-radix#co-zustava-na-tobe

## --question--

V projektu máš `components/ui/dialog.tsx` od shadcn/ui a chceš, aby měly všechny
dialogy v aplikaci o dva pixely větší zaoblení. Kde tu změnu uděláš a co to
znamená do budoucna?

### --expected--

v components/ui/dialog.tsx, protože ten soubor je můj; aktualizace si pak musím vzít ručně

### --accept--

přímo ve zkopírovaném souboru v repozitáři, za cenu ruční aktualizace

### --why--

Komponenta je obyčejný soubor tvého projektu, takže se upravuje přímo v něm —
žádné přepisování stylů zvenku není potřeba. Cena je, že novou verzi od autorů
nedostaneš automaticky; musíš ji porovnat a změny si přenést.

### --see--

react-ui-knihovny/shadcn-a-radix#shadcn-ui-kod-v-repozitari-ne-zavislost
