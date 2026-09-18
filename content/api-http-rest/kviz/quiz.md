<Otázka>
Která HTTP metoda je podle specifikace **bezpečná** (nemění stav na serveru) a **idempotentní** (opakované volání má stejný výsledek)?
- [x] `GET`
  #### --why--
  `GET` slouží k vyzvednutí dat. Nemění data na serveru, a proto je bezpečná i idempotentní.
- [ ] `POST`
  #### --why--
  `POST` není ani bezpečný (vytváří zdroje/mění stav), ani idempotentní (dvě volání vytvoří dva záznamy).
- [ ] `PUT`
  #### --why--
  `PUT` je sice idempotentní (dvakrát nahradit stará data stejnými novými daty udělá to samé), ale není bezpečný (mění data na serveru).
- [ ] `DELETE`
  #### --why--
  `DELETE` je sice idempotentní (opětovné smazání už smazaného nic dalšího nezničí), ale není bezpečný (mění data na serveru).
</Otázka>

<Otázka>
Při návrhu REST API potřebuješ vytvořit endpoint pro získání recenzí ke konkrétnímu filmu. Jak by měla URL správně vypadat?
- [x] `/movies/:id/reviews`
  #### --why--
  Toto je standardní způsob pro vyjádření vztahu (recenze patřící pod určitý film).
- [ ] `/reviews/movie/:id`
  #### --why--
  Konvence velí držet se struktury `kolekce/id/podkolekce`, nikoli obráceně.
- [ ] `/get-movie-reviews?movieId=:id`
  #### --why--
  Do URL v REST API by se neměla dávat slovesa (jako `get`), o akci rozhoduje HTTP metoda.
- [ ] `/movies/:id`
  #### --why--
  Toto je jen detail filmu, pro vnořené recenze potřebujeme další segment.
</Otázka>

<Otázka>
Co se stane, když prohlížeč odesílá `POST` požadavek s hlavičkou `Content-Type: application/json` na API na jiné doméně?
- [x] Prohlížeč nejprve automaticky odešle `OPTIONS` požadavek (tzv. preflight), a pokud server odpoví kladně, odešle samotný `POST`.
  #### --why--
  Složitější požadavky spouštějí automatický preflight dotaz na politiku CORS.
- [ ] Prohlížeč rovnou odešle `POST` požadavek a server se rozhodne, jestli mu to umožní.
  #### --why--
  `application/json` tělo aktivuje preflight. Rovnou by se to poslalo např. s `application/x-www-form-urlencoded`.
- [ ] Požadavek selže na klientovi a na server vůbec nedojde, protože je to z jiné domény.
  #### --why--
  Požadavek nedojde jen v případě, že selže následný `OPTIONS` dotaz (preflight).
- [ ] Server rovnou vrátí `403 Forbidden`.
  #### --why--
  Server by to musel úmyslně zakázat, ale prohlížeč nejdřív udělá preflight.
</Otázka>

<Otázka s psanou odpovědí>
Jakým stavovým kódem (číslem) by mělo API odpovědět, když klient odešle na endpoint k vytvoření uživatele `POST` požadavek a ten úspěšně proběhne?
## --expected--
201
## --why--
201 znamená `Created`, tedy že na serveru byl úspěšně vytvořen nový zdroj.
</Otázka s psanou odpovědí>

<Otázka>
K čemu v HTTP a REST slouží hlavička `ETag`?
- [x] Server posílá unikátní identifikátor (např. hash) dané verze odpovědi. Klient jej pak může použít v požadavku `If-None-Match`, aby si ušetřil stahování zbytečných dat.
  #### --why--
  Toto je přesně mechanismus podmínečných požadavků s ETagem pro cachování.
- [ ] Odesílá v ní autentizační token.
  #### --why--
  K tomu se používá `Authorization: Bearer <token>`.
- [ ] Server si pomocí ní vyhrazuje místo (tag) pro konkrétní relaci klienta.
  #### --why--
  To se obvykle řeší pomocí session ID v Cookies.
- [ ] Je to obdoba query parametrů, ve které se předává stránkování.
  #### --why--
  Stránkování se většinou dává do URL.
</Otázka>
