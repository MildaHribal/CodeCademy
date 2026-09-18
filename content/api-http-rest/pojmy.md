## --term-- bezpečná metoda

en: safe method
aliases: bezpečné, bezpečnou
lekce: api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni

Metoda HTTP požadavku, která nemění stav na serveru (např. GET nebo HEAD). Je pouze pro čtení dat.

## --term-- idempotentní metoda

en: idempotent method
aliases: idempotentní, idempotentní metodou
lekce: api-http-rest/http-do-hloubky#metody-bezpecne-a-idempotentni

Metoda HTTP požadavku, jejíž opakované volání se stejnými daty zanechá server ve stejném stavu jako jedno volání (např. PUT nebo DELETE).

## --term-- zdroj API

en: API resource
aliases: zdroj, zdroji, zdroje
lekce: api-http-rest/navrh-rest#zdroje-a-adresy

Základní entita (Resource) v návrhu REST API (např. kniha, uživatel, výpůjčka), která je identifikována pomocí unikátní URL.

## --term-- preflight

en: preflight request
aliases: preflightem, preflightu
lekce: api-http-rest/cors-a-cache#preflight

Přípravný OPTIONS požadavek, kterým se prohlížeč dotazuje serveru na povolení CORS pro operace měnící stav (např. POST s JSON tělem nebo DELETE).

## --term-- ETag

en: ETag
lekce: api-http-rest/cors-a-cache#etag-a-304

Hlavička odpovědi obsahující otisk (hash) verze zdroje. Prohlížeč ji může poslat v hlavičce `If-None-Match`, aby server mohl vrátit 304 Not Modified, pokud se zdroj nezměnil.
