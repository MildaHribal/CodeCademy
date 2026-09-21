# E-maily a úlohy na pozadí

:::check pretest
Po odeslání objednávky posílá server potvrzovací e-mail přímo v handleru, a teprve potom odpoví `201`. Co na tom zákazník pozná?

### --answer--
Nic, odeslání e-mailu trvá jednotky milisekund.

#### --why--
E-mail se předává cizí službě po síti. Ta odpoví, kdy se jí zachce — a někdy neodpoví vůbec.

### --correct--
Že tlačítko **Objednat** se točí déle, a když má poštovní služba výpadek, objednávka skončí chybou.

#### --why--
Jak se tomu vyhnout a co všechno se tím zjednoduší, je náplň celé téhle lekce.

### --answer--
Že se e-mail někdy odešle dvakrát.

#### --why--
Duplicita je problém až u opakování. Tady jde o to, že zákazník čeká na něco, co se ho vlastně netýká.
:::

:::check pretest
Server se pokusí odeslat e-mail, poštovní služba vrátí chybu a server to po vteřině zkusí znovu, pak zas a zas. Napiš, co takové opakování udělá s přetíženou službou na druhé straně.

### --expected-- ignore-case
přetíží ji ještě víc

### --accept--
zhorší to
přetíží ji
ještě víc ji zahltí
udrží ji přetíženou

### --why--
Stálý rytmus opakování přidá k původní zátěži ještě zátěž vlastní, takže se služba nemá kdy zotavit. Proto se odstup mezi pokusy prodlužuje.
:::

Objednávka v bistru má poslat potvrzení e-mailem, vygenerovat PDF účtenku, ohlásit se do účetnictví a zmenšit deset fotek jídel. Kdyby to všechno běželo v handleru požadavku, čekal by zákazník půl minuty a jediný výpadek cizí služby by shodil objednávku, která je jinak v pořádku.

> [!REMEMBER]
> **Do požadavku patří jen to, bez čeho nemůžeš odpovědět.** Všechno ostatní ulož jako úlohu a odpověz hned; vykoná ji jiný proces, který si může dovolit selhat a zkusit to znovu.

## Pomalá práce nepatří do požadavku

Rozdělení je prosté. Zeptej se, jestli výsledek té práce potřebuješ k odpovědi:

| práce | v požadavku? | proč |
|---|---|---|
| uložit objednávku do databáze | ano | bez id nemáš co vrátit |
| zkontrolovat dostupnost surovin | ano | rozhoduje o odpovědi `201` nebo `409` |
| poslat potvrzovací e-mail | ne | zákazník na něj v prohlížeči nečeká |
| vygenerovat PDF účtenku | ne | stáhne si ji později |
| zmenšit nahrané fotky | ne | do galerie se dostanou za minutu |
| ohlásit prodej do účetnictví | ne | cizí služba, cizí výpadky |

Handler tak zůstane krátký a hlavně **předvídatelný**: dělá jen věci, u kterých víš, jak dlouho trvají.

```js
// 1. Ulož to, bez čeho se neobejdeš
const order = await db.insert(orders).values(input).returning();

// 2. Zapiš úlohy, které se udělají potom
await enqueue('send-order-email', { orderId: order.id });
await enqueue('generate-receipt', { orderId: order.id });

// 3. Odpověz hned
sendJson(res, 201, order);
```

:::check
Platební brána vrátí na konci platby zpět na tvůj web a ty musíš zákazníkovi ukázat, jestli platba prošla. Patří ověření platby u brány do požadavku, nebo do úlohy na pozadí?

### --answer--
Do úlohy na pozadí, protože jde o volání cizí služby.

#### --why--
Cizí služba je důvod k opatrnosti, ne automaticky důvod k odsunutí. Rozhoduje, jestli výsledek potřebuješ k odpovědi.

### --correct--
Do požadavku — bez odpovědi brány nevíš, jestli zákazníkovi ukázat úspěch, nebo chybu.

#### --why--
Do úlohy pak patří všechno, co po úspěšné platbě následuje: potvrzení e-mailem, faktura, hlášení do účetnictví.

### --answer--
Do požadavku, protože platby musí být vždy synchronní.

#### --why--
Platby synchronní být nemusí — spousta metod potvrzuje až později zpětným voláním. Důvod je konkrétnější: co potřebuješ k téhle odpovědi.
:::

## Transakční e-maily

[[transakční e-mail|Transakční e-mail]] je zpráva, kterou vyvolá konkrétní akce konkrétního člověka: potvrzení objednávky, obnovení hesla, upozornění na blížící se konec předplatného. Liší se tím od hromadného rozesílání, které má vlastní pravidla a vlastní nástroje.

Posílá se přes poštovní službu (Postmark, Resend, Amazon SES) — API, kterému předáš adresáta, předmět a obsah. Vlastní SMTP server rozjíždět nemusíš a ani nechceš: doručitelnost stojí na reputaci odesílající IP adresy a tu si budeš budovat měsíce.

```js
export async function sendOrderEmail({ orderId }) {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order) return;                    // objednávka mezitím zmizela, není co posílat

  await mailer.send({
    to: order.email,
    subject: `Objednávka ${order.number} přijata`,
    html: renderOrderEmail(order),
    headers: { 'X-Entity-Ref-ID': `order-${orderId}` },
  });
}
```

Aby e-maily nekončily ve spamu, musí doména mít nastavené **SPF** (kdo smí za doménu posílat), **DKIM** (podpis, kterým se zpráva prokáže) a **DMARC** (co dělat, když ani jedno nesedí). Poštovní služba ti k tomu vydá konkrétní DNS záznamy.

> [!TIP]
> Ve vývoji nikdy neposílej na skutečné adresy. Buď použij zkušební režim poštovní služby, nebo lokální schránku typu Mailpit, která zachytí všechno a ukáže to v prohlížeči. Jinak dřív nebo později rozešleš testovací objednávky skutečným zákazníkům.

:::check
Proč se potvrzovací e-mail neposílá v tomtéž bloku kódu, který zapisuje objednávku do databáze?

### --answer--
Protože databázový zápis a odeslání e-mailu nejdou naprogramovat v jedné funkci.

#### --why--
Technicky jdou, a právě proto se to tak často píše. Problém je v tom, co se stane, když jedna z těch dvou věcí selže.

### --correct--
Protože e-mail nejde vzít zpátky: když zápis po odeslání selže, zákazník má potvrzení objednávky, která neexistuje.

#### --why--
Proto se do transakce zapisuje jen úloha. Když transakce selže, zmizí s ní i úloha a nic se neodešle.

### --answer--
Protože databáze během odesílání e-mailu drží zámek na celé tabulce.

#### --why--
Zámek na celou tabulku běžný zápis nedrží. Potíž je v pořadí a nevratnosti, ne v zamykání.
:::

## Fronta úloh na pozadí

[[fronta úloh na pozadí|Fronta úloh na pozadí]] je seznam práce, kterou někdo udělá později. Má dvě strany: kód, který úlohu **zapíše**, a [[pracovník fronty|pracovníka]], který si ji vyzvedne a vykoná.

```js
// zápis: uložíme, co se má stát, ne jak
await db.insert(jobs).values({
  type: 'send-order-email',
  payload: { orderId: 41 },
  runAt: new Date(),
  attempts: 0,
  status: 'pending',
});
```

```js
// pracovník: vyzvedni, vykonej, ulož výsledek
const job = await claimNextJob();
if (job) {
  try {
    await handlers[job.type](job.payload);
    await markDone(job.id);
  } catch (error) {
    await markFailed(job.id, error);
  }
}
```

Klíčové je slovo **vyzvedni**: `claimNextJob` musí úlohu ve stejném kroku vybrat i označit jako rozpracovanou, jinak si ji dva pracovníci vezmou oba. V SQL na to je `UPDATE … SET status = 'running' WHERE id = (SELECT id … FOR UPDATE SKIP LOCKED)`.

V produkci se fronta málokdy píše od nuly — v Node je běžný BullMQ nad Redisem, u menších aplikací tabulka v Postgresu úplně stačí. Ať použiješ cokoli, chování je stejné: úloha čeká, pracovník ji vezme, a když neuspěje, vrátí se do fronty.

:::live js
```js
const queue = [];
const log = [];

function enqueue(type, payload) {
  queue.push({ type, payload, attempts: 0 });
}

function work(handlers, maxAttempts = 3) {
  while (queue.length > 0) {
    const job = queue.shift();
    job.attempts += 1;
    try {
      handlers[job.type](job.payload);
      log.push(`${job.type}: hotovo na ${job.attempts}. pokus`);
    } catch (error) {
      if (job.attempts < maxAttempts) {
        queue.push(job);
        log.push(`${job.type}: chyba „${error.message}", vracím do fronty`);
      } else {
        log.push(`${job.type}: vzdávám to po ${job.attempts} pokusech`);
      }
    }
  }
}

let mailerFails = 2;
enqueue('send-order-email', { orderId: 41 });
enqueue('generate-receipt', { orderId: 41 });

work({
  'send-order-email': () => {
    if (mailerFails-- > 0) throw new Error('503 od poštovní služby');
  },
  'generate-receipt': () => {},
});

for (const line of log) console.log(line);
```
:::

Zkus nastavit `mailerFails` na `5` a sleduj, jak se poslední řádek změní z „hotovo" na „vzdávám to".

:::check
Dva pracovníci běží naráz nad stejnou tabulkou úloh. Napiš, co se stane, když si oba vyberou úlohu dotazem `SELECT … WHERE status = 'pending' LIMIT 1` a teprve potom ji označí jako rozpracovanou.

### --expected-- ignore-case
oba ji zpracují

### --accept--
zpracují ji oba
udělají ji dvakrát
úloha se vykoná dvakrát
zákazník dostane e-mail dvakrát

### --why--
Mezi čtením a zápisem je mezera, do které se vejde druhý pracovník. Proto musí být výběr a označení jedna operace — v Postgresu `FOR UPDATE SKIP LOCKED`.
:::

## Opakování s rostoucím odstupem

Úloha selže ze dvou důvodů a s každým se zachází jinak:

- **Dočasná chyba** — poštovní služba vrátila `503`, síť vypadla, databáze byla chvíli plná. Má smysl to zkusit znovu.
- **Trvalá chyba** — adresa je neplatná, objednávka mezitím zmizela, v kódu je překlep. Opakování nepomůže, jen spálí zdroje.

U dočasných chyb se čeká [[exponenciální odstup|exponenciálním odstupem]]: 1 s, 2 s, 4 s, 8 s… se stropem. Po vyčerpání pokusů putuje úloha do [[mrtvá schránka|mrtvé schránky]] — místa, kde na ni někdo kouká a rozhodne, co dál.

:::live node predict
```js
const base = 1000;
const max = 60000;

for (let attempt = 1; attempt <= 6; attempt++) {
  console.log(`${attempt}. pokus za ${Math.min(base * 2 ** (attempt - 1), max)} ms`);
}
```
--question-- Od kolikátého pokusu se čekání přestane zdvojnásobovat?
--output--
```text
1. pokus za 1000 ms
2. pokus za 2000 ms
3. pokus za 4000 ms
4. pokus za 8000 ms
5. pokus za 16000 ms
6. pokus za 32000 ms
```
--expected--
```text
1. pokus za 1000 ms
2. pokus za 2000 ms
3. pokus za 4000 ms
4. pokus za 8000 ms
5. pokus za 16000 ms
6. pokus za 32000 ms
```
--why-- Šest pokusů se do stropu 60 sekund ještě vejde, takže se zdvojnásobuje pořád. Strop by se projevil až u sedmého pokusu (64 000 ms). Bez stropu by dvacátý pokus čekal přes šest dní.
:::

> [!PITFALL]
> K odstupu vždy přidej náhodné rozptýlení (`backoff * (0,8 + Math.random() * 0,4)`). Bez něj se všechny úlohy, které selhaly kvůli témuž výpadku, vrátí v tutéž vteřinu a službu, která se sotva zvedla, položí znovu.

:::check
Úloha „poslat potvrzení" selhala, protože e-mailová adresa zákazníka je neplatná. Má se zopakovat s rostoucím odstupem?

### --answer--
Ano, a to až do vyčerpání všech pokusů — nikdy nevíš, jestli nešlo o výpadek.

#### --why--
U neplatné adresy to víš: druhá strana ti to řekla natvrdo. Opakování jen odloží okamžik, kdy si toho někdo všimne.

### --correct--
Ne. Trvalá chyba se opakováním nespraví, úloha patří rovnou do mrtvé schránky.

#### --why--
Proto pracovník rozlišuje typ chyby: `4xx` od cizí služby je obvykle trvalá chyba, `5xx` a chyby sítě jsou dočasné.

### --answer--
Ano, ale jen třikrát a bez odstupu.

#### --why--
Počet pokusů problém neřeší. Ani třetí pokus s neplatnou adresou neuspěje.
:::

## Idempotence: úloha se spustí víckrát

Fronta zaručuje, že se úloha vykoná **aspoň jednou** — ne právě jednou. Pracovník může spadnout po odeslání e-mailu a před zápisem „hotovo", takže se úloha vrátí do fronty a e-mail odejde podruhé. Zaručit „právě jednou" nejde: mezi vykonáním práce a poznamenáním výsledku je vždycky okamžik, kdy se může přerušit napájení.

Řešení není lepší fronta, ale úloha, které dvojí spuštění nevadí:

```js
export async function chargeOrder({ orderId }) {
  // 1. Odvoď klíč z dat úlohy, ne z náhody
  const key = `charge-order-${orderId}`;

  // 2. Zkus si klíč zabrat; když už existuje, práce proběhla
  const claimed = await db.insert(idempotencyKeys).values({ key })
    .onConflictDoNothing().returning();
  if (claimed.length === 0) return;

  // 3. Teprve teď udělej to nevratné
  await payments.charge(orderId);
}
```

Tomuhle `key` se říká [[idempotenční klíč]]. Musí se odvodit z dat úlohy, aby při opakování vyšel stejný — kdyby se generoval náhodně, byl by pokaždé jiný a nic by neochránil. Stejný princip nabízejí i cizí API: platební brány přijímají hlavičku `Idempotency-Key` a při druhém volání se stejným klíčem vrátí původní výsledek místo nové platby.

:::check
Proč se idempotenční klíč odvozuje z dat úlohy (`charge-order-41`), a ne z `randomUUID()`?

### --answer--
Protože `randomUUID()` je pomalé a při tisících úloh se to projeví.

#### --why--
Generování je levné. Problém je v tom, jakou hodnotu dostaneš při druhém spuštění téže úlohy.

### --correct--
Protože při opakovaném spuštění musí vyjít stejná hodnota — náhodný klíč by byl pokaždé jiný a nic by nezachytil.

#### --why--
Klíč má odpovědět na otázku „udělal jsem tuhle konkrétní práci?". Odpovědět na ni jde jen tehdy, když ho vyrobíš z toho, co tu práci určuje.

### --answer--
Protože náhodné klíče se v databázi nedají použít jako unikátní index.

#### --why--
Náhodné hodnoty se jako unikátní index používají běžně. Tady vadí právě jejich náhodnost.
:::

:::explain
Vysvětli vlastními slovy, proč fronta úloh nemůže zaručit, že se úloha vykoná právě jednou.

## --model--
Mezi vykonáním práce a zápisem „hotovo" je vždycky mezera. Pracovník může v té mezeře spadnout: práce se udělala, ale nikdo o tom neví, takže fronta úlohu po vypršení limitu nabídne znovu. Kdyby se pořadí otočilo a pracovník zapsal „hotovo" napřed, vznikne opačný problém — pád by znamenal úlohu, která se nikdy neudělala. Proto se volí „aspoň jednou" a druhé spuštění se zneškodní tím, že se úloha napíše idempotentně.

## --checklist--
- Mezi prací a zápisem výsledku je okamžik, kdy může pracovník spadnout.
- Fronta nemá jak rozlišit „spadl před prací" a „spadl po ní".
- Obrátit pořadí problém neodstraní, jen ho vymění za ztracenou úlohu.
- Řešením je úloha, které dvojí spuštění nevadí.
:::

## Plánované úlohy

Poslední druh práce nespouští uživatel, ale čas: noční uzávěrka, úklid starých souborů, připomínka nevyzvednuté objednávky. [[plánovaná úloha|Plánované úloze]] se říká cron podle nástroje, který ji na Linuxu spouští, a její rytmus se zapisuje pěti poli:

```text
*/15 * * * *    každých 15 minut
0 3 * * *       každý den ve 3:00
0 8 * * 1       každé pondělí v 8:00
```

Tři pravidla, která ušetří nepříjemné noci:

- **Plánovač jen zapíše úlohu do fronty**, nevykonává ji. Tak dostane zadarmo opakování, mrtvou schránku i přehled o tom, co běželo.
- **Plánovač běží v jedné instanci.** Aplikace ve třech kopiích jinak spustí uzávěrku třikrát.
- **Čas je v UTC.** Letní čas jinak jednu noc v roce úlohu vynechá a v jinou ji spustí dvakrát.

:::check
Aplikace běží ve třech instancích a v každé je `setInterval`, který o půlnoci spouští uzávěrku. Co se stane?

### --answer--
Nic zvláštního, uzávěrka se spustí jednou — instance se domluví přes databázi.

#### --why--
Instance se nedomluví, pokud jim to sám nenaprogramuješ. Každá dělá svoje.

### --correct--
Uzávěrka poběží třikrát naráz a bez idempotence se její výsledek promítne třikrát.

#### --why--
Proto plánovač patří do jediné instance, nebo se právo spustit úlohu získává zámkem ve sdíleném úložišti.

### --answer--
Uzávěrka poběží jednou, protože `setInterval` v Node běží jen v hlavním procesu.

#### --why--
Každá instance je vlastní proces s vlastním hlavním vláknem a vlastním časovačem.
:::

## Typické chyby a pasti

> [!PITFALL]
> **Zapsání úlohy mimo transakci.** Kód nejdřív zapíše úlohu do fronty a pak uloží objednávku, která selže. Příznak: zákazník dostane potvrzení objednávky, kterou v databázi nenajdeš. Oprava: zapsat úlohu do téže transakce jako data, nebo si na začátku úlohy ověřit, že záznam vůbec existuje.

> [!PITFALL]
> **Velký obsah v těle úlohy.** Do `payload` se uloží celý obsah e-mailu i s obrázky. Příznak: tabulka úloh roste do gigabajtů a fronta se zpomaluje. Oprava: v úloze nosit jen id a všechno ostatní si v pracovníkovi načíst.

> [!PITFALL]
> **Pracovník bez limitu doby běhu.** Úloha se zasekne na volání cizí služby, která neodpoví, a drží pracovníka navždy. Příznak: fronta roste, ale nic se nezpracovává. Oprava: každé volání ven má časový limit (`AbortSignal.timeout`) a úloha má strop celkové doby běhu.

> [!PITFALL]
> **Mrtvá schránka, do které nikdo nekouká.** Úlohy tam padají měsíce a nikdo o tom neví. Příznak: zákazník volá, že mu nepřišlo potvrzení z minulého týdne. Oprava: upozornění, když do mrtvé schránky něco přibude, a pravidelná kontrola jejího obsahu.

:::check
Fronta se plní, ale počet hotových úloh se nehýbe a v logu pracovníka není žádná chyba. Napiš dvěma slovy, co pracovníkovi nejspíš chybí.

### --expected-- ignore-case
časový limit

### --accept--
casovy limit
timeout
limit doby běhu
časový limit volání

### --why--
Úloha se zasekla na volání cizí služby, která neodpovídá, a drží pracovníka navždy. Bez limitu se to nikdy neprojeví jako chyba — jen jako fronta, která roste.
:::

## Kde to najdeš v MDN

- [`AbortSignal.timeout()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static) — časový limit pro volání cizí služby z pracovníka.
- [`crypto.randomUUID()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) — generování identifikátorů úloh tam, kde je nemáš odkud odvodit.
- [Idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent) — přesná definice pojmu, na které stojí celá část o opakování.
- [`Date.prototype.toISOString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) — zápis času v UTC, ve kterém se plánované úlohy porovnávají.

# --questions--

## --question--

Pracovník odešle e-mail, a než stihne úlohu označit za hotovou, proces spadne. Úloha se vrátí do fronty. Napiš, jak se jmenuje vlastnost úlohy, díky které druhé spuštění nezpůsobí druhý e-mail.

### --expected-- ignore-case
idempotence

### --accept--
idempotentní
idempotentnost
idempotentní úloha

### --why--
Fronta zaručuje doručení aspoň jednou, ne právě jednou. Chybějící kus proto nedoplňuje fronta, ale úloha sama: zabere si klíč odvozený ze svých dat a při druhém běhu podle něj pozná, že už proběhla.

### --see--
api-soubory-realtime/emaily-a-ulohy-na-pozadi#idempotence-uloha-se-spusti-vickrat

## --question--

Pracovník dostane od poštovní služby odpověď `422 Invalid recipient address`. Jak má naložit s úlohou?

### --answer--
Zopakovat ji s exponenciálním odstupem jako každou jinou chybu.

#### --why--
Odstup dává smysl u chyb, které samy přejdou. Neplatná adresa nepřejde ani za hodinu.

### --correct--
Nezkoušet znovu a poslat ji do mrtvé schránky, protože jde o trvalou chybu.

#### --why--
Rozlišení podle stavového kódu je běžné pravidlo: `4xx` znamená „tvoje zadání je špatně" a opakování ho nespraví, `5xx` a chyby sítě znamenají „zkus to později".

### --answer--
Úlohu tiše zahodit, protože e-mail stejně nemá kam dorazit.

#### --why--
Zahodit ji bez stopy znamená, že se o problému nikdo nedozví. Zákazník bude čekat na potvrzení, které nikdy nepřijde.

### --see--
api-soubory-realtime/emaily-a-ulohy-na-pozadi#opakovani-s-rostoucim-odstupem

## --question--

**Opakování z dřívějška.** Pracovník fronty běží jako samostatný proces vedle aplikace a připojuje se ke stejné databázi. Napiš, odkud má vzít připojovací řetězec, aby se stejný obraz dal spustit ve vývoji i v produkci.

### --expected-- ignore-case
z proměnných prostředí

### --accept--
proměnné prostředí
z prostředí
process.env
z env proměnných

### --why--
Konfigurace, která se mezi prostředími liší, patří do proměnných prostředí, ne do kódu ani do souboru v repozitáři. Tentýž obraz se pak ve vývoji i v produkci liší jen tím, co mu předáš zvenčí.

### --see--
nasazeni-provoz/produkcni-rezim#konfigurace-z-prostredi

## --question--

**Opakování z dřívějška.** Do logu pracovníka se u každé selhané úlohy vypíše celý `payload`. U úlohy „obnovení hesla" je v něm token z odkazu. Proč je to problém, i když je log přístupný jen týmu?

### --answer--
Protože tokeny v logu zabírají místo a log se kvůli nim rychleji rotuje.

#### --why--
O velikost logu tu nejde. Problém je v tom, co se s takovým údajem dá udělat.

### --correct--
Protože kdokoli s přístupem k logu si tím tokenem může změnit cizí heslo, a log se navíc posílá do dalších systémů.

#### --why--
Tajemství do logu nepatří vůbec — ani hesla, ani tokeny, ani čísla karet. Loguj id úlohy a typ chyby, podle kterých se k detailu dostaneš jinudy.

### --answer--
Protože log je strukturovaný JSON a token by rozbil jeho formát.

#### --why--
Token je obyčejný text a formát logu nerozbije. Potíž je v jeho moci, ne v jeho zápisu.

### --see--
nasazeni-provoz/logovani-a-chyby#co-do-logu-nepatri
