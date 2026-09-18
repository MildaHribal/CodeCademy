## --card-- free

Jaký je rozdíl mezi chováním aplikace ve vývojovém a v produkčním režimu?

### --back--

Ve vývojovém (dev) prostředí aplikace vypisuje detailní chybové hlášky, má jednodušší logy a automaticky se restartuje (nodemon). Produkční aplikace (nastavená často pomocí `NODE_ENV=production`) skrývá detaily chyb před klientem, aby neodhalila zranitelnosti, a zapisuje [[strukturované logy]] jako JSON. Měla by být chráněna omezováním četnosti (rate limiting) a připravena běžet neustále s řízeným ukončováním ([[graceful shutdown]]).

### --see--

nasazeni-provoz/produkcni-rezim

## --card-- free

Co znamená graceful shutdown u webového serveru a jak reaguje na signál `SIGTERM`?

### --back--

[[Graceful shutdown]] (řízené ukončení) znamená, že po požadavku na zastavení (signál `SIGTERM` od systému) server ihned přestane přijímat nové požadavky. Následně však počká, než se vyřídí všechny rozpracované požadavky. Teprve po jejich vyřízení odpojí spojení od databáze a bezpečně ukončí proces, takže uživatelé neztratí data.

### --see--

nasazeni-provoz/produkcni-rezim

## --card-- free

Proč nemají být [[tajemství]] (hesla, tokeny) uložená v gitu a kam s nimi?

### --back--

Když jsou tajemství v kódu, kdokoli, kdo má přístup k repositáři nebo historii gitu, je uvidí a může je zneužít. Navíc se konfigurace (např. heslo k lokální a k produkční databázi) mění a kód má zůstat stejný. [[Tajemství]] se proto předávají pomocí [[proměnná prostředí|proměnných prostředí]] zvenčí, nebo v lokálním vývoji pomocí souboru `.env`, který se nikdy nepřidává do gitu (je v `.gitignore`).

### --see--

nasazeni-provoz/produkcni-rezim

## --card-- free

Co je Dockerfile, image (obraz) a co je to [[kontejner]]?

### --back--

[[Dockerfile]] je kuchařka s instrukcemi, podle kterých vzniká obraz. Obraz (image) je hotový balíček (např. pro Node.js aplikaci obsahuje operační systém, kód, instalované npm balíčky), který je neměnný. Když obraz spustíme, vytvoříme [[kontejner]]. Kontejner je běžící instance tohoto obrazu s izolovaným vlastním prostředím. Jeden obraz lze spustit ve více kontejnerech.

### --see--

nasazeni-provoz/kontejnery-a-servery

## --card-- free

K čemu se používá `docker compose` a jak souvisí s `Dockerfile`?

### --back--

`Dockerfile` definuje, jak sestavit jeden konkrétní obraz. Typická webová aplikace však potřebuje více služeb (např. aplikaci a navíc databázi). Nástroj [[docker compose]] umožňuje popsat tuto sestavu ve formátu YAML a zapnout nebo vypnout vše najednou pomocí jednoho příkazu (např. `docker compose up`).

### --see--

nasazeni-provoz/kontejnery-a-servery

## --card-- free

Co je to CI/CD? Jaký je obvykle první krok v pipeline na GitHubu?

### --back--

[[CI/CD]] znamená Continuous Integration a Continuous Deployment. Jde o sadu automatizovaných úloh po pushnutí kódu. Typicky se nejdřív nastartuje prostředí a nainstalují závislosti. Pak začne CI část (integrita kódu): kontrola lintování (Prettier, ESLint), kontrola typů (TypeScript) a běh testů. Pokud toto vše projde bez chyby, pokračuje CD: aplikace se sestaví (např. do Docker obrazu) a nasadí do produkce, buď automaticky nebo po schválení.

### --see--

nasazeni-provoz/ci-cd

## --card-- free

Co znamená, že nasazujeme s "dvoufázovou změnou databáze" (two-phase rollout)?

### --back--

Při produkčním nasazování aplikace nemůže vypnout přístup na několik minut a měnit strukturu tabulek. Navíc může část instancí běžet chvíli na starém a část na novém kódu. Dvoufázové nasazení znamená, že se změna schématu rozdělí: např. nejdřív se přidá nový sloupec (nový kód začne zapisovat do starého i nového, starý kód jede normálně) a až po čase, v dalším kroku nasazení, se po naplnění dat starý sloupec či kód odstraní.

### --see--

nasazeni-provoz/ci-cd
