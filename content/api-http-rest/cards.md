## --card-- free

Jaký je rozdíl mezi GET a POST metodou?

### --back--

`GET` je bezpečná metoda pro čtení dat. Zůstává v historii a jde cachovat. `POST` se používá k vytvoření nového zdroje, mění stav serveru a nelze ho cachovat ani jednoduše opakovat.

## --card-- free

Které HTTP metody jsou idempotentní a co to znamená?

### --back--

Idempotentní metoda znamená, že opakované volání se stejnými daty zanechá server ve stejném stavu jako jedno volání. Patří sem `GET`, `PUT` a `DELETE`. (`POST` a `PATCH` obecně ne).

## --card-- output

Jaký HTTP stavový kód vrátíš, když klient odešle neplatná data (např. chybí povinné pole)?

### --expected--

400
### --accept--
400 Bad Request
422
422 Unprocessable Entity
