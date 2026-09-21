## --card-- output

Co vypíše tenhle kód? Proměnná `data` je to, co chce server poslat do proudu událostí.

```js
const data = { id: 7, stul: 3 };
console.log(`data: ${data}`);
```

### --expected--

data: [object Object]

### --why--

Do rámce SSE se dá zapsat jen text. Objekt vložený do šablony se převede automaticky
a z užitečných dat zbude `[object Object]`. Proto na řádek `data:` vždycky patří
`JSON.stringify(data)`.

### --see--

api-soubory-realtime/realtime-prehled#format-udalosti-a-znovupripojeni

## --card-- output

Co vypíše tenhle kód? Takhle server zachází s hlavičkou, která nemusí přijít.

```js
const hlavicka = undefined;
console.log(`${Number(hlavicka ?? 0)} ${Number('')} ${Number('12')}`);
```

### --expected--

0 0 12

### --why--

Chybějící hlavička je `undefined`, ne prázdný text. `Number(undefined)` je `NaN`,
takže se nula musí dosadit dřív, než se převádí. Prázdný řetězec se naopak na nulu
převede sám — a `NaN > 0` je vždycky `false`, takže by se zmeškané události tiše
nedoplnily.

### --see--

api-soubory-realtime/realtime-prehled#format-udalosti-a-znovupripojeni

## --card-- output

Co vypíše tenhle kód? Proměnná `jmeno` přišla z formuláře jako jméno nahraného souboru.

```js
const jmeno = '../../etc/passwd';
console.log(jmeno.split(/[\\/]/).pop());
```

### --expected--

passwd

### --why--

Rozdělením podle obou lomítek a vzetím poslední části zmizí celá cesta — a s ní
i pokus dostat se mimo složku pro nahrané soubory. Samotné `replace('../', '')`
by nestačilo: `....//` by se po jedné náhradě složilo zpátky.

### --see--

api-soubory-realtime/nahravani-souboru#jmeno-souboru-je-vstup-od-utocnika

## --card-- output

Co vypíše tenhle kód? V poli `bajty` jsou první bajty nahraného souboru.

```js
const bajty = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
console.log([...bajty.slice(0, 3)].map((b) => b.toString(16)).join(' '));
```

### --expected--

ff d8 ff

### --why--

`FF D8 FF` je začátek každého JPEGu. Tomuhle se říká podpis souboru a na rozdíl od
přípony a hlavičky `Content-Type` si ho odesílatel nevymyslí, aniž by změnil obsah.

### --see--

api-soubory-realtime/nahravani-souboru#typ-podle-obsahu-ne-podle-pripony

## --card-- output

Co vypíše tenhle kód? V proměnné `proud` je kus textu, jak přišel po SSE spojení.

```js
const proud = 'event: ceka\ndata: {"ceka":2}\n\n';
const [prvni] = proud.split('\n\n');
console.log(`${prvni.split('\n').length}`);
```

### --expected--

2

### --why--

Události se od sebe oddělují prázdným řádkem, tedy dvěma `\n` za sebou. První událost
má dva řádky: `event:` a `data:`. Právě proto musí každý rámec končit prázdným řádkem —
bez něj klient čeká, že ještě něco přijde.

### --see--

api-soubory-realtime/realtime-prehled#format-udalosti-a-znovupripojeni

## --card-- output

Co vypíše tenhle kód? V proměnné `radek` je jeden řádek, který dorazil z proudu.

```js
const radek = ': ping';
console.log(`${radek.startsWith(':')} ${radek.indexOf(':')}`);
```

### --expected--

true 0

### --why--

Řádek, který začíná dvojtečkou, je v SSE komentář — klient ho zahodí. Přesně tak se
posílá heartbeat. Kdo rozebírá rámec hledáním první dvojtečky, musí na tuhle nulu
myslet, jinak si vyrobí událost s prázdným jménem.

### --see--

api-soubory-realtime/websockety#znovupripojeni-a-heartbeat

## --card-- output

Co vypíše tenhle kód? Klient si z něj počítá, za jak dlouho zkusí další připojení.

```js
const odstupy = [0, 1, 2, 3].map((pokus) => 2 ** pokus * 1000);
console.log(odstupy.join(' '));
```

### --expected--

1000 2000 4000 8000

### --why--

Tomuhle se říká exponenciální odstup: každý další pokus čeká dvakrát déle. Bez něj
se po výpadku serveru všichni klienti vrhnou zpátky naráz a server shodí podruhé.
V praxi se k tomu přidává strop a náhodné rozptýlení.

### --see--

api-soubory-realtime/websockety#znovupripojeni-a-heartbeat

## --card-- output

Co vypíše tenhle kód? Takhle si server vede seznam otevřených spojení.

```js
const klienti = new Set();
const spojeni = { email: 'eva@vltava.cz' };
klienti.add(spojeni);
klienti.add(spojeni);
console.log(`${klienti.size}`);
```

### --expected--

1

### --why--

`Set` porovnává podle identity, ne podle obsahu. Tentýž objekt se do něj podruhé
nepřidá, ale **jiný objekt se stejnými hodnotami** ano — proto se do registru dává
objekt odpovědi, který je pro každé spojení jiný.

### --see--

api-soubory-realtime/workshop-sse/008

## --card-- code js

Napiš funkci `rozlozUdalost(text)`, která z jednoho rámce SSE vytáhne jméno události
a její data. Když rámec řádek `event:` nemá, jméno je `message`.

### --seed--

```js
function rozlozUdalost(text) {
}
```

### --test--

```js
assert.deepEqual(
  rozlozUdalost('event: ceka\ndata: {"ceka":2}\n'),
  { event: 'ceka', data: '{"ceka":2}' },
  "rozlozUdalost('event: ceka\\ndata: {\"ceka\":2}\\n') má vrátit { event: 'ceka', data: '{\"ceka\":2}' }",
);
assert.deepEqual(
  rozlozUdalost('data: ahoj\n'),
  { event: 'message', data: 'ahoj' },
  "rozlozUdalost('data: ahoj\\n') má vrátit jméno message — bez řádku event: se událost jmenuje takhle",
);
assert.deepEqual(
  rozlozUdalost('id: 4\nevent: notifikace\ndata: nazdar\n'),
  { event: 'notifikace', data: 'nazdar' },
  'Řádek id: se do výsledku nepromítne',
);
```

### --solution--

```js
function rozlozUdalost(text) {
  const udalost = { event: 'message', data: '' };
  for (const radek of text.split('\n')) {
    if (radek.startsWith('event: ')) udalost.event = radek.slice('event: '.length);
    if (radek.startsWith('data: ')) udalost.data = radek.slice('data: '.length);
  }
  return udalost;
}
```

### --see--

api-soubory-realtime/realtime-prehled#format-udalosti-a-znovupripojeni

## --card-- code js

Napiš funkci `patriMi(prijemce, email)`, která řekne, jestli zpráva pro daného
příjemce patří uživateli s tímhle e-mailem. Hvězdička znamená „všem".

### --seed--

```js
function patriMi(prijemce, email) {
}
```

### --test--

```js
assert.equal(patriMi('eva@vltava.cz', 'eva@vltava.cz'), true, "patriMi('eva@vltava.cz', 'eva@vltava.cz') má být true");
assert.equal(patriMi('petr@vltava.cz', 'eva@vltava.cz'), false, "patriMi('petr@vltava.cz', 'eva@vltava.cz') má být false — cizí zpráva mi nepatří");
assert.equal(patriMi('*', 'eva@vltava.cz'), true, "patriMi('*', 'eva@vltava.cz') má být true — hvězdička je pro všechny");
assert.equal(patriMi('*', 'kdokoli@jinde.cz'), true, 'Hromadná zpráva patří i uživateli, kterého jinak neznáme');
```

### --solution--

```js
function patriMi(prijemce, email) {
  return prijemce === '*' || prijemce === email;
}
```

### --see--

api-soubory-realtime/lab-notifikace

## --card-- code js

Napiš funkci `bezpecneJmeno(jmeno)`, která z uživatelského jména souboru udělá jméno,
pod kterým se smí uložit na disk: bez cesty, malými písmeny a jen se znaky
`a-z`, `0-9`, tečkou a pomlčkou.

### --seed--

```js
function bezpecneJmeno(jmeno) {
}
```

### --test--

```js
assert.equal(bezpecneJmeno('Faktura 2026.pdf'), 'faktura-2026.pdf', "bezpecneJmeno('Faktura 2026.pdf') má vrátit 'faktura-2026.pdf'");
assert.equal(bezpecneJmeno('../../etc/passwd'), 'passwd', "bezpecneJmeno('../../etc/passwd') má vrátit 'passwd' — cesta musí zmizet");
assert.equal(bezpecneJmeno('C:\\Users\\eva\\Sken.PNG'), 'sken.png', 'Zmizet má i cesta se zpětnými lomítky');
assert.equal(bezpecneJmeno('smlouva:nová?.docx'), 'smlouva-nova-.docx', 'Znaky, které na disku dělají potíže, se nahradí pomlčkou');
```

### --solution--

```js
function bezpecneJmeno(jmeno) {
  return jmeno
    .split(/[\\/]/)
    .pop()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.-]+/g, '-');
}
```

### --see--

api-soubory-realtime/nahravani-souboru#jmeno-souboru-je-vstup-od-utocnika

## --card-- code js

Napiš funkci `odstup(pokus)`, která vrátí, kolik milisekund se má čekat před
`pokus`-tým opakováním. Začíná se na sekundě, každý další pokus čeká dvakrát déle,
ale nikdy víc než půl minuty.

### --seed--

```js
function odstup(pokus) {
}
```

### --test--

```js
assert.equal(odstup(0), 1000, 'odstup(0) má být 1000 — první opakování po sekundě');
assert.equal(odstup(1), 2000, 'odstup(1) má být 2000');
assert.equal(odstup(3), 8000, 'odstup(3) má být 8000');
assert.equal(odstup(10), 30000, 'odstup(10) má být 30000 — víc než půl minuty se nečeká nikdy');
```

### --solution--

```js
function odstup(pokus) {
  return Math.min(1000 * 2 ** pokus, 30000);
}
```

### --see--

api-soubory-realtime/emaily-a-ulohy-na-pozadi#opakovani-s-rostoucim-odstupem

## --card-- free

Klient pošle soubor s hlavičkou `Content-Type: image/png` a příponou `.png`. Proč to
serveru nestačí a co s tím?

### --back--

Obojí si vymýšlí odesílatel. Přípona je součást jména, které přišlo z formuláře, a
hlavičku části multipart těla si klient nastaví, jak chce — nikdo ji nekontroluje.
Skutečný formát se pozná až z prvních bajtů obsahu, takzvaného podpisu souboru:
PNG začíná `89 50 4E 47`, JPEG `FF D8 FF`. Server tedy přečte začátek souboru, porovná
ho se seznamem povolených formátů a podle něj si sám určí příponu i `Content-Type`,
pod kterým soubor později vydá.

### --see--

api-soubory-realtime/nahravani-souboru#typ-podle-obsahu-ne-podle-pripony

## --card-- free

Máš postavit živý přehled objednávek a vedle toho chat s podporou. Kdy sáhneš po SSE
a kdy po WebSocketu?

### --back--

Rozhoduje směr dat. Přehled objednávek mluví jen jedním směrem: server posílá změny,
klient nic neříká. Na to stačí SSE — je to obyčejné HTTP, projde proxy i firewallem,
znovupřipojení a doplnění zmeškaných událostí přes `Last-Event-ID` řeší prohlížeč
skoro sám. Chat potřebuje obě strany naráz a s malým zpožděním, a tam se vyplatí
WebSocket: jedno spojení, zprávy tam i zpátky. Za to platíš tím, že si znovupřipojení,
heartbeat i autorizaci musíš napsat sám.

### --see--

api-soubory-realtime/realtime-prehled#jak-mezi-nimi-vybrat

## --card-- free

Server si drží otevřená SSE spojení v registru. Co se stane, když zapomene odebrat
klienta, který se odpojil?

### --back--

Server se o odpojení dozví jen z události na spojení — sám od sebe si toho nevšimne.
Bez odebrání v registru zůstane odkaz na odpověď, která už nikam nevede. S každým
obnovením stránky přibude další, takže registr roste a paměť se neuvolňuje. Rozesílání
pak zapisuje i do mrtvých spojení: server plýtvá časem a v logu se začnou objevovat
chyby zápisu. Ke každému spojení navíc obvykle patří časovač heartbeatu, který by
běžel dál a držel proces naživu.

### --see--

api-soubory-realtime/realtime-prehled#typicke-chyby-a-pasti

## --card-- free

K čemu je hlavička `Last-Event-ID` a co kvůli ní musí umět server?

### --back--

Když SSE spojení spadne, prohlížeč se sám připojí znovu a v hlavičce `Last-Event-ID`
pošle číslo poslední události, kterou stihl přečíst. Tím jeho role končí — je to pro
server obyčejný nový požadavek. Aby díra v datech opravdu zmizela, musí si server
posledních pár událostí pamatovat, hlavičku přečíst a poslat jen ty s vyšším číslem.
Když si nic nepamatuje nebo hlavičku ignoruje, klient se připojí, ale o zmeškané
události přijde a nikdo se to nedozví.

### --see--

api-soubory-realtime/workshop-sse/013

## --card-- free

Proč odeslání potvrzovacího e-mailu nepatří přímo do obsluhy požadavku?

### --back--

Volání poštovní služby trvá stovky milisekund až sekundy a může selhat. Když na něj
odpověď čeká, uživatel kouká na točící se kolečko kvůli něčemu, co ho nezajímá, a při
výpadku pošty selže i akce, která jinak proběhla. Požadavek proto jen zapíše úlohu do
fronty a odpoví. Úlohu si vyzvedne pracovník, který běží vedle aplikace, škáluje se
nezávisle na ní a při chybě může pokus zopakovat, aniž by o tom uživatel věděl.

### --see--

api-soubory-realtime/emaily-a-ulohy-na-pozadi#pomala-prace-nepatri-do-pozadavku

## --card-- free

Co znamená, že je úloha na pozadí idempotentní, a proč se idempotenční klíč nesmí
generovat náhodně?

### --back--

Idempotentní úloha se smí provést víckrát a výsledek je stejný jako po jednom
provedení. To je nutnost, protože fronta zaručuje doručení aspoň jednou: pracovník
může spadnout po odeslání e-mailu, ale před zapsáním výsledku, a úloha se vrátí zpátky.
Poznat „tohle už jsem dělal" jde jen podle klíče odvozeného z dat úlohy — třeba
`objednavka-412-potvrzeni`. Náhodný klíč by byl při každém pokusu jiný, takže by
každé opakování vypadalo jako nová práce a zákazník by dostal tři stejné e-maily.

### --see--

api-soubory-realtime/emaily-a-ulohy-na-pozadi#idempotence-uloha-se-spusti-vickrat

## --card-- free

Proč se velké soubory nahrávají přes předepsanou adresu do objektového úložiště, a ne
přes vlastní server?

### --back--

Když data tečou přes aplikaci, drží každý nahrávaný soubor jedno spojení a kus paměti
nebo místa na disku po celou dobu přenosu. Stovka lidí s videem takový server položí,
i když sám o sobě nedělá nic náročného. Předepsaná adresa je dočasně platná podepsaná
URL, kterou aplikace vydá; klient pak posílá data přímo do úložiště a server se dozví
jen to, že je hotovo. Aplikace si přitom ponechá kontrolu: rozhoduje, komu adresu vydá,
na jak dlouho platí a jaký typ a velikost se pod ní smí nahrát.

### --see--

api-soubory-realtime/nahravani-souboru#kam-soubory-ukladat-a-jak-je-vracet

## --card-- free

Aplikace s WebSockety poběží ve třech instancích za nahrávacím vyvažovačem. Proč to
najednou přestane fungovat a co s tím?

### --back--

Spojení je připnuté k jedné instanci. Když Eva mluví přes instanci A a Petr přes
instanci B, rozeslání na instanci A projde jen její vlastní seznam klientů a Petrovi
zpráva nedorazí. Řešením není lepit uživatele k instancím, ale poslat zprávy mimo ně:
instance publikuje událost do sdíleného kanálu (typicky Redis Pub/Sub nebo fronta)
a každá instance ji rozešle svým klientům. Stejná past čeká u SSE, jen se projeví
o něco později.

### --see--

api-soubory-realtime/websockety#skalovani-na-vic-instanci

## --card-- free

Proč se u proudu událostí posílá heartbeat, když protokol TCP sám pozná, že spojení
spadlo?

### --back--

TCP pozná jen spojení, které se korektně ukončilo nebo přestalo odpovídat na úrovni
sítě. Mezi klientem a serverem ale obvykle stojí proxy, firewall nebo mobilní síť,
které nečinné spojení po pár desítkách sekund tiše zahodí — a ani jedna strana o tom
nemusí vědět. Pravidelná zpráva do proudu (u SSE komentářový řádek `: ping`) spojení
udrží aktivní a zároveň odhalí, že druhá strana už neodpovídá. Vedlejší výhoda: pokus
o zápis do mrtvého spojení server donutí uklidit registr klientů.

### --see--

api-soubory-realtime/websockety#znovupripojeni-a-heartbeat
