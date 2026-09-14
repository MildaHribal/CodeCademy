## --card-- free
Jaký je rozdíl mezi primitivním typem a objektem z hlediska uložení v paměti?

### --back--
Primitivní typy se ukládají přímo jako hodnota (čísla, stringy). Objekty se ukládají jako reference (odkaz do paměti).

## --card-- free
Co se stane, když přiřadíš existující objekt do nové proměnné: `const b = a`?

### --back--
Nová proměnná `b` dostane stejnou referenci jako `a`. Obě proměnné ukazují na ten samý objekt v paměti.

## --card-- free
Jaká syntaxe slouží k destrukuralizaci vlastnosti `name` z objektu `user`?

### --back--
`const { name } = user;`

## --card-- free
Jak při destrukturalizaci přejmenuješ vlastnost `name` na `fullName`?

### --back--
`const { name: fullName } = user;`

## --card-- free
Co je to mělká kopie (shallow copy)?

### --back--
Kopie objektu, kde se zkopírují primitivní hodnoty na první úrovni. Zanořené objekty ale stále sdílejí referenci s původním objektem.

## --card-- free
Napiš dva způsoby, jak vytvořit mělkou kopii objektu `data`.

### --back--
Pomocí spread operátoru: `const kopie = { ...data };`
Nebo: `const kopie = Object.assign({}, data);`

## --card-- free
Co se stane s polem uvnitř objektu, když uděláš jeho mělkou kopii?

### --back--
Pole se nezkopíruje. Mělká kopie si ponechá pouze referenci na původní zanořené pole. Změny pole ovlivní originál i kopii.

## --card-- free
Jak se dá získat pole všech klíčů v objektu `user`?

### --back--
Pomocí `Object.keys(user)`.

## --card-- free
Jak se dá získat pole všech hodnot v objektu `user`?

### --back--
Pomocí `Object.values(user)`.

## --card-- free
Co vrátí `Object.entries(user)`?

### --back--
Vrátí pole polí, kde každé vnitřní pole obsahuje klíč a hodnotu. Např. `[["name", "Karel"], ["age", 30]]`.

## --card-- free
Co to je hluboká kopie (deep copy)?

### --back--
Kopie objektu, kde se všechny úrovně a zanořené objekty vytvoří úplně znovu. Nesdílí s originálem žádné reference.

## --card-- free
Jaká funkce v moderním JS slouží k vytvoření hluboké kopie bez ztráty typů Map, Set či Date?

### --back--
`structuredClone(obj)`

## --card-- free
Jaká je nevýhoda používání `JSON.parse(JSON.stringify(obj))` pro tvorbu hluboké kopie?

### --back--
Ztratí se metody (funkce) v objektu, hodnota `undefined` a speciální objekty jako `Date` se převedou na string.

## --card-- free
Pokud má objekt klíče s mezerou nebo speciálními znaky (např. "my-key"), jak k nim přistoupíme?

### --back--
Pomocí závorkové notace: `obj["my-key"]`.

## --card-- free
Lze měnit vlastnosti objektu, i když je vytvořen přes `const`?

### --back--
Ano, `const` brání jen přepsání samotné proměnné. Vlastnosti uvnitř objektu lze měnit libovolně.

## --card-- free
Co se stane, když se pokusíš destrukturalizovat vlastnost, která v objektu není?

### --back--
Proměnná bude mít hodnotu `undefined`.

## --card-- free
Jak nastavíš výchozí (defaultní) hodnotu při destrukturalizaci objektu pro klíč `age`?

### --back--
`const { age = 18 } = user;`

## --card-- free
K čemu se používá "rest" parametr při destrukturalizaci objektu? Příklad: `const { id, ...zbytek } = user;`

### --back--
Přebere všechny zbývající vlastnosti objektu, které nebyly explicitně destrukturalizovány, a vloží je do nového objektu `zbytek`.

## --card-- free
Co to je "mutace" dat?

### --back--
Když změníš data přímo v paměti (např. přidáš položku do existujícího pole nebo změníš vlastnost existujícího objektu) místo abys vytvořil jejich kopii s novou hodnotou.

## --card-- free
Co znamená pojem "immutable" v kontextu práce s objekty?

### --back--
Znamená to, že se originální objekt nesmí měnit. Veškeré změny se řeší tak, že se vytvoří nový objekt založený na starém a k němu se přidají modifikace.