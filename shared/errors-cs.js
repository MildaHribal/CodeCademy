export const ERROR_PATTERNS = [
  {
    id: 'cannot-read-undefined',
    pattern: /Cannot read propert(?:ies|y) (?:of undefined \(reading '(?<name>[^']*)'\)|'(?<name2>[^']*)' of undefined)|can't access property "(?<name3>[^"]*)", \S+ is undefined/,
    title: 'Čteš vlastnost „{name}“ z hodnoty undefined.',
    causes: [
      'Index nebo klíč neexistuje — `items[5]` u pole se třemi položkami je undefined.',
      'Funkce nic nevrací (chybí `return`), takže její výsledek je undefined.',
      'Proměnná ještě nemá hodnotu nebo má překlep ve jméně vlastnosti o úroveň výš.',
    ],
    see: 'js-pole/co-je-pole#pole-je-ocislovany-seznam-hodnot',
  },
  {
    id: 'cannot-read-null',
    pattern: /Cannot read propert(?:ies|y) (?:of null \(reading '(?<name>[^']*)'\)|'(?<name2>[^']*)' of null)|can't access property "(?<name3>[^"]*)", \S+ is null/,
    title: 'Čteš vlastnost „{name}“ z hodnoty null.',
    causes: [
      '`document.querySelector` nic nenašel a vrátil null — zkontroluj selektor (tečka u třídy, # u id).',
      'Skript běží dřív, než prohlížeč prvek vytvořil (skript v `<head>` bez `defer`).',
      'Funkce nebo API vrací null, když hodnotu nenajde (třeba `localStorage.getItem`).',
    ],
    see: null,
  },
  {
    id: 'cannot-set-undefined',
    pattern: /Cannot set propert(?:ies|y) (?:of (?<value>undefined|null) \(setting '(?<name>[^']*)'\)|'(?<name2>[^']*)' of (?<value2>undefined|null))/,
    title: 'Zapisuješ vlastnost „{name}“ do hodnoty {value}.',
    causes: [
      'Objekt, do kterého zapisuješ, neexistuje — třeba `counts[item.category].total = 1`, když `counts[item.category]` ještě nevznikl.',
      '`querySelector` nic nenašel a vrátil null.',
    ],
    see: null,
  },
  {
    id: 'cannot-destructure',
    pattern: /Cannot destructure property '(?<name>[^']*)' of '[^']*' as it is (?<value>undefined|null)|Cannot destructure '[^']*' as it is (?<value2>undefined|null)/,
    title: 'Rozbaluješ vlastnost „{name}“ z hodnoty {value}.',
    causes: [
      'Funkci s parametrem `({ name })` jsi zavolal bez argumentu.',
      'Hodnota, kterou rozbaluješ, ještě neexistuje (chybí `return` nebo `await`).',
    ],
    see: null,
  },
  {
    id: 'convert-undefined-to-object',
    pattern: /Cannot convert undefined or null to object/,
    title: 'Předáváš undefined nebo null tam, kde se čeká objekt.',
    causes: [
      '`Object.keys(x)`, `Object.entries(x)` nebo `Object.assign` dostaly undefined.',
      'Hodnota ještě nedorazila — chybí `return` nebo `await`.',
    ],
    see: null,
  },

  {
    id: 'array-method-not-a-function',
    pattern: /\.(?<method>map|filter|forEach|reduce|find|findIndex|some|every|includes|indexOf|push|pop|join|sort|toSorted|slice|splice|at|flatMap) is not a function/,
    title: 'Voláš metodu pole „{method}“ na hodnotě, která pole není.',
    causes: [
      'Hodnota je objekt, text nebo undefined místo pole — vypiš si ji přes `console.log`.',
      'Z JSON nebo z API přišel objekt, pole je až v jeho vlastnosti (`data.items`).',
      '`document.querySelectorAll` vrací NodeList: `forEach` má, `map` a `filter` ne — převeď ho přes `[...list]`.',
    ],
    see: 'js-pole/metody-pole-do-hloubky#co-ktera-metoda-vraci',
  },
  {
    id: 'not-a-function',
    pattern: /(?<name>[\w$.[\]'"()]+) is not a function/,
    title: 'Voláš „{name}“ jako funkci, ale funkce to není.',
    causes: [
      'Překlep ve jméně metody (`addEventListner`, `toUppercase`).',
      'Proměnná se stejným jménem přepsala funkci.',
      'Závorky navíc: voláš výsledek funkce, ne funkci (`callback()()`).',
    ],
    see: null,
  },
  {
    id: 'require-not-defined',
    pattern: /require is not defined/,
    title: '`require` v ES modulu neexistuje.',
    causes: [
      'Kód z návodu je CommonJS, ale tvůj soubor je ES modul — přepiš `require` na `import`.',
      'V `package.json` je `"type": "module"`, takže každý `.js` soubor je ES modul.',
    ],
    see: 'node-zaklady/co-je-node#typicke-chyby-a-pasti',
  },
  {
    id: 'dirname-not-defined',
    pattern: /__(?:dirname|filename) is not defined/,
    title: '`__dirname` a `__filename` v ES modulu neexistují.',
    causes: [
      'Složka aktuálního souboru je v `import.meta.dirname`, jeho adresa v `import.meta.url`.',
      'Kód pochází z návodu pro CommonJS.',
    ],
    see: 'node-zaklady/co-je-node#typicke-chyby-a-pasti',
  },
  {
    id: 'not-defined',
    pattern: /(?<name>[\p{L}\w$]+) is not defined/u,
    title: 'Používáš jméno „{name}“, které v tomhle místě neexistuje.',
    causes: [
      'Funkci nebo proměnnou jsi ještě nenapsal.',
      'Překlep nebo jiná velikost písmen (`totalprice` × `totalPrice`).',
      'Proměnná je deklarovaná uvnitř jiné funkce nebo bloku `{ }` a odsud není vidět.',
    ],
    see: null,
  },
  {
    id: 'before-initialization',
    pattern: /Cannot access '(?<name>[^']*)' before initialization|can't access lexical declaration '(?<name2>[^']*)' before initialization/,
    title: 'Používáš „{name}“ dřív, než se provedl řádek s jeho `let`/`const`.',
    causes: [
      'Řádek s `const {name} = …` je v kódu až pod místem, kde proměnnou čteš.',
      'Funkce, která proměnnou používá, se volá dřív, než je proměnná deklarovaná.',
    ],
    see: null,
  },
  {
    id: 'assignment-to-constant',
    pattern: /Assignment to constant variable|invalid assignment to const/,
    title: 'Přiřazuješ novou hodnotu do proměnné deklarované přes `const`.',
    causes: [
      'Proměnnou, která se má měnit (počítadlo, součet), deklaruj přes `let`.',
      '`const` nebrání změně obsahu pole nebo objektu (`push` jde), jen novému přiřazení.',
    ],
    see: 'js-pole/co-je-pole#proc-jde-menit-pole-v-const',
  },
  {
    id: 'already-declared',
    pattern: /Identifier '(?<name>[^']*)' has already been declared|redeclaration of (?:let|const) (?<name2>\S+)/,
    title: 'Jméno „{name}“ je v tomhle rozsahu deklarované dvakrát.',
    causes: [
      'Druhé `let`/`const` se stejným jménem — při změně hodnoty stačí `{name} = …` bez klíčového slova.',
      'Stejné jméno má i funkce nebo parametr.',
    ],
    see: null,
  },
  {
    id: 'not-a-constructor',
    pattern: /(?<name>[\w$.]+) is not a constructor/,
    title: '„{name}“ nejde vytvořit přes `new`.',
    causes: [
      'Šipková funkce ani obyčejná hodnota nejde volat s `new` — potřebuješ `class` nebo `function`.',
      'Import vrátil něco jiného, než čekáš (výchozí × pojmenovaný export).',
    ],
    see: null,
  },
  {
    id: 'not-iterable',
    pattern: /(?<name>[\w$.[\]'"]*) is not iterable/,
    title: 'Procházíš hodnotu, která se procházet nedá.',
    causes: [
      '`for…of` nebo `...` dostaly objekt nebo undefined místo pole.',
      'Objekt projdeš přes `Object.entries(objekt)`.',
    ],
    see: null,
  },
  {
    id: 'reduce-empty-array',
    pattern: /Reduce of empty array with no initial value/,
    title: '`reduce` na prázdném poli potřebuje počáteční hodnotu.',
    causes: [
      'Chybí druhý argument `reduce` — třeba `0` u součtu nebo `{}` u objektu.',
      'Pole je prázdné, protože ho předtím vyfiltroval `filter`.',
    ],
    see: 'js-pole/metody-pole-do-hloubky#reduce-bez-pocatecni-hodnoty',
  },
  {
    id: 'max-call-stack',
    pattern: /Maximum call stack size exceeded|too much recursion/,
    title: 'Funkce volá sama sebe pořád dokola.',
    causes: [
      'Rekurzivní funkce nemá podmínku, kdy skončit, nebo se k ní nikdy nedostane.',
      'Setter nebo metoda volá sama sebe (`set name(v) { this.name = v; }`).',
    ],
    see: null,
  },
  {
    id: 'invalid-array-length',
    pattern: /Invalid array length/,
    title: 'Pole by mělo zápornou nebo příliš velkou délku.',
    causes: [
      '`new Array(n)` nebo `Array.from({ length: n })` dostaly záporné číslo nebo NaN.',
      'Smyčka, která do pole přidává, nikdy neskončí.',
    ],
    see: null,
  },
  {
    id: 'read-only-property',
    pattern: /Cannot assign to read only property '(?<name>[^']*)'/,
    title: 'Vlastnost „{name}“ jde jen číst.',
    causes: [
      'Objekt je zmrazený přes `Object.freeze` — vytvoř kopii se změnou (`{ ...objekt, klíč: hodnota }`).',
      'Zapisuješ do vlastnosti, kterou prohlížeč nastavuje sám.',
    ],
    see: null,
  },
  {
    id: 'circular-json',
    pattern: /Converting circular structure to JSON|cyclic object value/,
    title: '`JSON.stringify` dostal objekt, který odkazuje sám na sebe.',
    causes: [
      'Objekt obsahuje odkaz na rodiče nebo na sebe.',
      'Převádíš prvek stránky nebo požadavek serveru — vyber jen data, která potřebuješ.',
    ],
    see: null,
  },

  {
    id: 'json-got-html',
    pattern: /Unexpected token '?<'?,? .*(?:JSON|is not valid JSON)|Unexpected token < in JSON/,
    title: 'Parsuješ jako JSON něco, co je ve skutečnosti HTML.',
    causes: [
      'Server na adresu odpověděl stránkou (404 nebo index.html), ne daty — zkontroluj cestu požadavku.',
      'Voláš `response.json()` bez kontroly `response.ok`.',
    ],
    see: null,
  },
  {
    id: 'json-empty',
    pattern: /Unexpected end of JSON input/,
    title: 'Parsuješ jako JSON prázdný text.',
    causes: [
      'Odpověď serveru nemá tělo (třeba stav 204) nebo soubor je prázdný.',
      'Tělo požadavku se už jednou přečetlo.',
    ],
    see: 'node-zaklady/http-v-node#typicke-chyby-a-pasti',
  },
  {
    id: 'json-invalid',
    pattern: /is not valid JSON|in JSON at position|JSON\.parse: /,
    title: 'Text není platný JSON.',
    causes: [
      'Klíče a řetězce v JSON musí být ve dvojitých uvozovkách.',
      'Za poslední položkou nesmí být čárka.',
      'Parsuješ text, který JSON vůbec není (prázdný řetězec, `undefined`, HTML).',
    ],
    see: 'node-zaklady/http-v-node#typicke-chyby-a-pasti',
  },
  {
    id: 'failed-to-fetch',
    pattern: /Failed to fetch|fetch failed|NetworkError when attempting to fetch/,
    title: 'Požadavek se nepodařilo odeslat.',
    causes: [
      'Server na dané adrese neběží nebo poslouchá na jiném portu.',
      'Adresa má překlep (protokol, port, cesta).',
    ],
    see: null,
  },
  {
    id: 'invalid-selector',
    pattern: /'(?<selector>[^']*)' is not a valid selector/,
    title: 'Selektor „{selector}“ není platný CSS selektor.',
    causes: [
      'Chybí tečka u třídy nebo # u id, nebo je v selektoru mezera navíc.',
      'Id nesmí začínat číslicí (`#1` → `[id="1"]`).',
    ],
    see: null,
  },
  {
    id: 'not-a-node',
    pattern: /parameter 1 is not of type 'Node'/,
    title: 'Do stránky vkládáš něco, co není prvek.',
    causes: [
      '`append`/`appendChild` dostaly text nebo undefined — prvek vytvoříš přes `document.createElement`.',
      'Funkce, která má prvek vrátit, nemá `return`.',
    ],
    see: null,
  },

  {
    id: 'import-outside-module',
    pattern: /Cannot use import statement outside a module|'import' and 'export' may (?:only )?appear only with 'sourceType: module'|Unexpected token 'export'/,
    title: '`import`/`export` funguje jen v ES modulu.',
    causes: [
      'V Node chybí v `package.json` `"type": "module"`.',
      'V prohlížeči má `<script>` bez `type="module"`.',
    ],
    see: 'node-zaklady/co-je-node#typicke-chyby-a-pasti',
  },
  {
    id: 'await-outside-async',
    pattern: /await is only valid in async functions|Cannot use keyword 'await' outside an async function|await is a reserved word/,
    title: '`await` je jen uvnitř funkce označené `async`.',
    causes: [
      'Přidej `async` před funkci, ve které `await` používáš (i u šipkové funkce a callbacku).',
      '`await` v callbacku `forEach` nebo `map` patří k tomu callbacku, ne k vnější funkci.',
    ],
    see: 'js-pole/metody-pole-do-hloubky#foreach-s-async-funkci',
  },
  {
    id: 'return-outside-function',
    pattern: /'return' outside of function|Illegal return statement/,
    title: '`return` stojí mimo funkci.',
    causes: [
      'Zavírací `}` funkce je v kódu dřív, než jsi chtěl — `return` pak zůstal venku.',
      'Na nejvyšší úrovni skriptu `return` nemá z čeho vracet.',
    ],
    see: null,
  },
  {
    id: 'unexpected-end-of-input',
    pattern: /Unexpected end of input|expected expression, got end of script/,
    title: 'Kód skončil dřív, než se uzavřelo, co jsi otevřel.',
    causes: [
      'Chybí zavírací `}`, `)` nebo `]` — editor ukazuje páry závorek, projdi je od konce.',
      'Neuzavřený řetězec nebo šablona se zpětnými apostrofy.',
    ],
    see: null,
  },
  {
    id: 'unterminated-string',
    pattern: /Unterminated string constant|Invalid or unexpected token|unterminated string literal/,
    title: 'Řetězec není uzavřený nebo je v kódu neplatný znak.',
    causes: [
      'Chybí zavírací uvozovka, nebo je uvnitř stejná uvozovka bez `\\` (`\'It\'s\'`).',
      'Obyčejný řetězec nesmí pokračovat na dalším řádku — použij šablonu se zpětnými apostrofy.',
      'V kódu jsou typografické uvozovky „ " místo " z klávesnice.',
    ],
    see: null,
  },
  {
    id: 'unterminated-template',
    pattern: /Unterminated template/,
    title: 'Šablonový řetězec (text ve zpětných apostrofech) není uzavřený.',
    causes: [
      'Chybí zavírací zpětný apostrof.',
      'Uvnitř `${ … }` chybí zavírací `}`.',
    ],
    see: null,
  },
  {
    id: 'missing-paren',
    pattern: /missing \) after argument list/,
    title: 'Ve volání funkce chybí zavírací závorka nebo čárka mezi argumenty.',
    causes: [
      'Chybí `)` na konci volání.',
      'Mezi argumenty chybí čárka nebo řetězec není uzavřený.',
    ],
    see: null,
  },
  {
    id: 'invalid-assignment-target',
    pattern: /Invalid left-hand side in assignment|Assigning to rvalue|invalid assignment left-hand side/,
    title: 'Vlevo od `=` je něco, do čeho nejde přiřadit.',
    causes: [
      'V podmínce je `=` místo porovnání `===` (`if (a = 1)` je v pořádku, `if (a + 1 = 2)` ne).',
      'Přiřazuješ do výsledku volání funkce.',
    ],
    see: null,
  },
  {
    id: 'unexpected-identifier',
    pattern: /Unexpected identifier(?: '(?<name>[^']*)')?/,
    title: 'Na tomhle místě kódu nečekané jméno.',
    causes: [
      'Chybí čárka mezi položkami pole nebo objektu, nebo operátor mezi hodnotami.',
      'Překlep v klíčovém slově (`funtion`, `retrun`) — pak vypadá jako obyčejné jméno.',
    ],
    see: null,
  },
  {
    id: 'unexpected-token',
    pattern: /Unexpected (?:token '(?<token>[^']*)'|token|number|string)|expected expression, got '(?<token2>[^']*)'/,
    title: 'Na tomhle místě kódu je znak, který tam nedává smysl.',
    causes: [
      'Závorka navíc nebo chybějící otevírací závorka o kus výš.',
      'Chybí čárka, operátor nebo `;` před tímhle místem.',
      'Klíčové slovo na nepovoleném místě (`const` uvnitř výrazu).',
    ],
    see: null,
  },

  {
    id: 'eaddrinuse',
    pattern: /EADDRINUSE/,
    title: 'Port je obsazený — na něm už něco poslouchá.',
    causes: [
      'Tvůj server ještě běží v jiném terminálu — ukonči ho Ctrl+C.',
      'Server se ve stejném programu spouští dvakrát (`listen` voláš dvakrát).',
    ],
    see: 'node-zaklady/co-je-node#typicke-chyby-a-pasti',
  },
  {
    id: 'module-not-found',
    pattern: /ERR_MODULE_NOT_FOUND|Cannot find (?:module|package) '(?<name>[^']*)'/,
    title: 'Node nenašel importovaný soubor nebo balíček.',
    causes: [
      'U vlastního souboru chybí přípona: `./utils` místo `./utils.js`.',
      'Cesta je relativní k souboru s importem — zkontroluj `./` a `../`.',
      'Balíček není nainstalovaný (`npm install`).',
    ],
    see: 'node-zaklady/co-je-node#typicke-chyby-a-pasti',
  },
  {
    id: 'missing-export',
    pattern: /does not provide an export named '(?<name>[^']*)'|Named export '(?<name2>[^']*)' not found/,
    title: 'Modul nemá export se jménem „{name}“.',
    causes: [
      'Překlep ve jméně, nebo v souboru chybí `export` před funkcí.',
      'Soubor má výchozí export (`export default`) — importuje se bez složených závorek.',
    ],
    see: 'node-zaklady/co-je-node#moduly-v-node',
  },
  {
    id: 'enoent',
    pattern: /ENOENT: no such file or directory(?:, \w+ '(?<path>[^']*)')?/,
    title: 'Soubor nebo složka neexistuje.',
    causes: [
      'Relativní cesta se počítá od složky, ze které program spouštíš (`process.cwd()`), ne od souboru s kódem.',
      'Překlep ve jméně nebo příponě souboru.',
    ],
    see: 'node-zaklady/co-je-node#typicke-chyby-a-pasti',
  },
  {
    id: 'headers-sent',
    pattern: /Cannot set headers after they are sent|ERR_HTTP_HEADERS_SENT/,
    title: 'Odpověď serveru už odešla, a ty do ní ještě zapisuješ.',
    causes: [
      'Po `res.end()` chybí `return`, takže kód pokračuje k další odpovědi.',
      'Dvě větve (`if` a kód pod ním) posílají odpověď na stejný požadavek.',
    ],
    see: 'node-zaklady/http-v-node#jedna-odpoved-na-kazdy-pozadavek',
  },
  {
    id: 'econnrefused',
    pattern: /ECONNREFUSED/,
    title: 'Spojení odmítnuto — na adrese nic neposlouchá.',
    causes: [
      'Server neběží nebo ještě nestihl naběhnout.',
      'Posíláš požadavek na jiný port, než na kterém server poslouchá.',
    ],
    see: null,
  },
  {
    id: 'eacces',
    pattern: /EACCES/,
    title: 'Program nemá oprávnění k souboru nebo portu.',
    causes: [
      'Porty pod 1024 smí otevřít jen správce — použij třeba 3000.',
      'Soubor patří jinému uživateli nebo je jen pro čtení.',
    ],
    see: null,
  },
  {
    id: 'invalid-arg-type',
    pattern: /ERR_INVALID_ARG_TYPE|The "(?<name>[^"]*)" argument must be of type/,
    title: 'Funkce Node dostala argument špatného typu.',
    causes: [
      'Předáváš undefined — proměnná ještě nemá hodnotu nebo chybí `await`.',
      'Místo textu předáváš objekt (třeba `res.end({ ok: true })` místo `JSON.stringify`).',
    ],
    see: null,
  },

  {
    id: 'infinite-loop',
    pattern: /Smyčka běží příliš dlouho/,
    title: 'Smyčka se nezastavila — podmínka konce se nikdy nesplnila.',
    causes: [
      'Proměnná v podmínce se uvnitř smyčky nemění (chybí `i++`).',
      'Podmínka je obráceně (`i > 0` místo `i < n`).',
      '`while (true)` bez `break`.',
    ],
    see: null,
  },
  {
    id: 'test-timeout',
    pattern: /Test nedoběhl včas|nedoběhl do \d+ ms/,
    title: 'Test nedoběhl v časovém limitu.',
    causes: [
      'Nekonečná smyčka nebo rekurze.',
      'Promise, která se nikdy nesplní, nebo chybějící `await`.',
      'Server na požadavek neodpověděl (chybí `res.end()`).',
    ],
    see: null,
  },
];

export function explainError(text) {
  const message = String(text ?? '');
  if (!message.trim()) return null;
  for (const entry of ERROR_PATTERNS) {
    const found = entry.pattern.exec(message);
    if (!found) continue;
    const match = collectGroups(found.groups);
    const result = {
      id: entry.id,
      title: fillTitle(entry.title, match),
      causes: entry.causes.map((cause) => fillText(cause, match)),
      see: entry.see,
    };
    if (Object.keys(match).length) result.match = match;
    return result;
  }
  return null;
}

function collectGroups(groups) {
  const out = {};
  for (const [key, value] of Object.entries(groups ?? {})) {
    if (value === undefined) continue;
    const base = key.replace(/\d+$/, '');
    out[base] ??= value;
  }
  return out;
}

function fillTitle(title, match) {
  return fillText(title.replace(/\s*„\{(\w+)\}“/g, (whole, key) => (match[key] ? ` „${match[key]}“` : '')), match);
}

function fillText(text, match) {
  return text.replace(/\{(\w+)\}/g, (whole, key) => match[key] ?? whole);
}

export function groupUndefinedNames(errors) {
  const out = [];
  const names = [];
  let groupIndex = -1;
  for (const text of errors ?? []) {
    const found = /ReferenceError: (?<name>[\p{L}\w$]+) is not defined/u.exec(String(text));
    if (!found) {
      out.push({ text: String(text) });
      continue;
    }
    if (!names.includes(found.groups.name)) names.push(found.groups.name);
    if (groupIndex === -1) {
      groupIndex = out.length;
      out.push({ text: String(text) });
    }
  }
  if (names.length > 1) {
    out[groupIndex] = { text: `ReferenceError: ${names.join(', ')} is not defined`, names };
  }
  return out;
}
