// ===== Simulace API filmové databáze (neměň) =====
// Nahradí fetch pro adresy /api/…: odpovídá se zpožděním skutečnými objekty Response
// se stavem a JSON tělem a umí zrušení přes signal. Plakáty jsou vygenerované SVG.
//
//   GET /api/movies?page=1                 filmy od nejlépe hodnocených, 8 na stránku
//   GET /api/movies?query=text&page=1      hledání v názvu (bez ohledu na velikost písmen a diakritiku)
//       → { page, totalPages, totalResults, results: [{ id, title, year, rating, poster }] }
//       stránka za koncem = prázdné results; page menší než 1 = 400
//   GET /api/movies/:id                    detail { id, title, originalTitle, year, genres, director, rating, overview, poster }
//       neznámý film = 404
//
// Testy si simulaci přepínají přes objekt mockApi (zpoždění, výpadky, offline, záznam požadavků).
const mockApi = (() => {
  const movies = [
    { id: 1, title: 'Pelíšky', originalTitle: null, year: 1999, genres: ['komedie', 'drama'], director: 'Jan Hřebejk', rating: 91, overview: 'Vánoce 1967 a jaro 1968 ve dvou pražských rodinách, jejichž otcové stojí každý na jiné straně politiky.' },
    { id: 2, title: 'Kolja', originalTitle: null, year: 1996, genres: ['drama', 'komedie'], director: 'Jan Svěrák', rating: 87, overview: 'Stárnoucí violoncellista se kvůli penězům naoko ožení a nečekaně se musí postarat o malého chlapce, který mluví jen rusky.' },
    { id: 3, title: 'Obecná škola', originalTitle: null, year: 1991, genres: ['komedie', 'drama'], director: 'Jan Svěrák', rating: 88, overview: 'Kluci z pražské školy dostanou na konci války nového třídního učitele, který o sobě vypráví neuvěřitelné historky.' },
    { id: 4, title: 'Vesničko má středisková', originalTitle: null, year: 1985, genres: ['komedie'], director: 'Jiří Menzel', rating: 86, overview: 'Řidič náklaďáku a jeho pomalý spolujezdec v jedné vesnici, kde se všichni znají a každý má svoje starosti.' },
    { id: 5, title: 'Ostře sledované vlaky', originalTitle: null, year: 1966, genres: ['drama', 'komedie', 'válečný'], director: 'Jiří Menzel', rating: 84, overview: 'Mladý výpravčí na malé stanici za protektorátu řeší hlavně svou první lásku, dokud se nezaplete do odboje.' },
    { id: 6, title: 'Hoří, má panenko', originalTitle: null, year: 1967, genres: ['komedie'], director: 'Miloš Forman', rating: 79, overview: 'Hasičský ples v malém městě, tombola, která mizí před očima, a volba královny krásy, která se nepovede.' },
    { id: 7, title: 'Limonádový Joe aneb Koňská opera', originalTitle: null, year: 1964, genres: ['western', 'komedie', 'muzikál'], director: 'Oldřich Lipský', rating: 80, overview: 'Parodie na westerny: abstinent a pistolník Limonádový Joe čistí Divoký západ od whisky i od padouchů.' },
    { id: 8, title: 'Postřižiny', originalTitle: null, year: 1980, genres: ['komedie', 'drama'], director: 'Jiří Menzel', rating: 82, overview: 'Správce pivovaru v malém městě a jeho temperamentní žena, kvůli které se celé městečko nestačí divit.' },
    { id: 9, title: 'Kulový blesk', originalTitle: null, year: 1978, genres: ['komedie'], director: 'Zdeněk Podskalský a Ladislav Smoljak', rating: 78, overview: 'Řetězová výměna bytů mezi mnoha pražskými rodinami se musí stihnout v jediný den, a tak se do stěhování zaplete půl města.' },
    { id: 10, title: 'Šakalí léta', originalTitle: null, year: 1993, genres: ['muzikál', 'komedie'], director: 'Jan Hřebejk', rating: 76, overview: 'Pražské Dejvice v roce 1958 a tajemný mladík s kytarou, který do ulice přinese rock and roll.' },
    { id: 11, title: 'Tmavomodrý svět', originalTitle: null, year: 2001, genres: ['válečný', 'drama'], director: 'Jan Svěrák', rating: 77, overview: 'Čeští piloti bojovali za války v britském letectvu. Po komunistickém převratu za to skončí ve vězení.' },
    { id: 12, title: 'Samotáři', originalTitle: null, year: 2000, genres: ['komedie', 'drama'], director: 'David Ondříček', rating: 74, overview: 'Několik mladých lidí v Praze na přelomu tisíciletí hledá lásku, přátelství a samy sebe.' },
    { id: 13, title: 'Vratné lahve', originalTitle: null, year: 2007, genres: ['komedie'], director: 'Jan Svěrák', rating: 75, overview: 'Učitel v důchodu nevydrží doma a začne pracovat ve výkupu lahví v supermarketu.' },
    { id: 14, title: 'Počátek', originalTitle: 'Inception', year: 2010, genres: ['sci-fi', 'akční'], director: 'Christopher Nolan', rating: 89, overview: 'Zloděj, který krade tajemství z lidských snů, dostane opačný úkol: myšlenku do snu zasadit.' },
    { id: 15, title: 'Interstellar', originalTitle: 'Interstellar', year: 2014, genres: ['sci-fi', 'drama'], director: 'Christopher Nolan', rating: 90, overview: 'Země umírá a bývalý pilot se s posádkou vydává červí dírou hledat pro lidstvo nový domov.' },
    { id: 16, title: 'Matrix', originalTitle: 'The Matrix', year: 1999, genres: ['sci-fi', 'akční'], director: 'Lana a Lilly Wachowski', rating: 85, overview: 'Programátor Neo zjistí, že svět kolem něj je simulace, a přidá se k odboji proti strojům.' },
    { id: 17, title: 'Vetřelec', originalTitle: 'Alien', year: 1979, genres: ['sci-fi', 'horor'], director: 'Ridley Scott', rating: 83, overview: 'Posádka nákladní vesmírné lodi odpoví na neznámý signál a přiveze si na palubu smrtící organismus.' },
    { id: 18, title: 'Amélie z Montmartru', originalTitle: "Le Fabuleux Destin d'Amélie Poulain", year: 2001, genres: ['komedie', 'romantický'], director: 'Jean-Pierre Jeunet', rating: 81, overview: 'Plachá servírka z pařížské kavárny se rozhodne potají zlepšovat životy lidí kolem sebe.' },
    { id: 19, title: 'Cesta do fantazie', originalTitle: 'Sen to Chihiro no kamikakushi', year: 2001, genres: ['animovaný', 'fantasy'], director: 'Hayao Miyazaki', rating: 92, overview: 'Desetiletá Čihiro se při stěhování ocitne ve světě duchů a musí zachránit rodiče, kteří se proměnili v prasata.' },
    { id: 20, title: 'Parazit', originalTitle: 'Gisaengchung', year: 2019, genres: ['drama', 'thriller'], director: 'Bong Joon-ho', rating: 86, overview: 'Chudá rodina se jeden po druhém nechá zaměstnat u bohaté rodiny a předstírá, že se navzájem neznají.' },
    { id: 21, title: 'Duna', originalTitle: 'Dune', year: 2021, genres: ['sci-fi', 'dobrodružný'], director: 'Denis Villeneuve', rating: 80, overview: 'Mladý Paul Atreides se s rodinou stěhuje na pouštní planetu Arrakis, jediný zdroj nejcennější suroviny ve vesmíru.' },
    { id: 22, title: 'Všechno, všude, najednou', originalTitle: 'Everything Everywhere All at Once', year: 2022, genres: ['sci-fi', 'komedie'], director: 'Daniel Kwan a Daniel Scheinert', rating: 79, overview: 'Majitelka prádelny s daňovou kontrolou na krku zjistí, že může přeskakovat mezi paralelními vesmíry.' },
    { id: 23, title: 'Nedotknutelní', originalTitle: 'Intouchables', year: 2011, genres: ['komedie', 'drama'], director: 'Olivier Nakache a Éric Toledano', rating: 90, overview: 'Ochrnutý boháč si za pečovatele vybere mladíka z předměstí, který o tu práci vůbec nestojí.' },
    { id: 24, title: 'Forrest Gump', originalTitle: 'Forrest Gump', year: 1994, genres: ['drama', 'komedie'], director: 'Robert Zemeckis', rating: 93, overview: 'Prostoduchý muž s dobrým srdcem vypráví na zastávce, jak se nechtěně připletl k velkým událostem Ameriky.' },
    { id: 25, title: 'Vykoupení z věznice Shawshank', originalTitle: 'The Shawshank Redemption', year: 1994, genres: ['drama'], director: 'Frank Darabont', rating: 95, overview: 'Bankéř odsouzený za vraždu, kterou nespáchal, si ve věznici najde přítele a nepřestane doufat.' },
    { id: 26, title: 'Pán prstenů: Společenstvo Prstenu', originalTitle: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, genres: ['fantasy', 'dobrodružný'], director: 'Peter Jackson', rating: 94, overview: 'Hobit Frodo se s osmi společníky vydává zničit Jeden prsten dřív, než ho získá temný pán Sauron.' },
  ];

  const palettes = [['#ff6b6b', '#3d1a4f'], ['#4ecdc4', '#1a2a4f'], ['#ffd166', '#6a2c21'], ['#a78bfa', '#1e1b4b'], ['#f472b6', '#3b0a2a'], ['#60a5fa', '#0b2545']];
  function poster(movie) {
    const [light, dark] = palettes[movie.id % palettes.length];
    const initials = movie.title.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">`
      + `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>`
      + `<rect width="200" height="300" fill="url(#g)"/>`
      + `<circle cx="150" cy="70" r="46" fill="#ffffff" opacity="0.12"/>`
      + `<text x="20" y="250" font-family="system-ui, sans-serif" font-size="64" font-weight="800" fill="#ffffff" opacity="0.92">${initials}</text>`
      + `<text x="22" y="280" font-family="system-ui, sans-serif" font-size="16" fill="#ffffff" opacity="0.75">${movie.year}</text>`
      + `</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
  for (const movie of movies) movie.poster = poster(movie);

  const pageSize = 8;
  const plain = (text) => String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const api = {
    movies, // všechna data (jen pro testy)
    delay: 300, // zpoždění v ms, nebo funkce ({ path, params }) => ms
    failures: 0, // kolik dalších požadavků skončí stavem 500
    offline: false, // true = síť nejde, fetch se zamítne
    requests: [], // { path, params, aborted, status }
    active: 0,
    // Stejný výběr, jaký posílá server na /api/movies (jen pro testy)
    listMovies(query = '', page = 1) {
      const needle = plain(query.trim());
      const found = movies
        .filter((movie) => !needle || plain(movie.title).includes(needle) || plain(movie.originalTitle ?? '').includes(needle))
        .toSorted((a, b) => b.rating - a.rating || a.id - b.id);
      const start = (page - 1) * pageSize;
      return {
        page,
        totalPages: Math.ceil(found.length / pageSize),
        totalResults: found.length,
        results: found.slice(start, start + pageSize).map(({ id, title, year, rating, poster }) => ({ id, title, year, rating, poster })),
      };
    },
  };

  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

  function handle(url, failed) {
    if (failed) return json({ error: 'Chyba serveru' }, 500);
    if (url.pathname === '/api/movies') {
      const page = Number(url.searchParams.get('page') ?? '1');
      if (!Number.isInteger(page) || page < 1) return json({ error: 'Neplatná stránka' }, 400);
      return json(api.listMovies(url.searchParams.get('query') ?? '', page));
    }
    const detail = url.pathname.match(/^\/api\/movies\/(\d+)$/);
    if (detail) {
      const movie = movies.find((item) => item.id === Number(detail[1]));
      return movie ? json(structuredClone(movie)) : json({ error: 'Film nenalezen' }, 404);
    }
    return json({ error: 'Neznámá adresa' }, 404);
  }

  const realFetch = window.fetch.bind(window);

  window.fetch = function fetch(input, options = {}) {
    const url = new URL(typeof input === 'string' ? input : input.url, 'https://filmoteka.example');
    if (!url.pathname.startsWith('/api/')) return realFetch(input, options);
    const signal = options.signal;
    const record = { path: url.pathname, params: Object.fromEntries(url.searchParams), aborted: false, status: null };
    api.requests.push(record);
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        record.aborted = true;
        reject(signal.reason);
        return;
      }
      if (api.offline) {
        setTimeout(() => reject(new TypeError('Failed to fetch')), 30);
        return;
      }
      api.active++;
      const failed = api.failures > 0;
      if (failed) api.failures--;
      const delay = typeof api.delay === 'function' ? api.delay({ path: record.path, params: record.params }) : api.delay;
      const onAbort = () => {
        clearTimeout(timer);
        api.active--;
        record.aborted = true;
        reject(signal.reason);
      };
      const timer = setTimeout(() => {
        api.active--;
        signal?.removeEventListener('abort', onAbort);
        const response = handle(url, failed);
        record.status = response.status;
        resolve(response);
      }, delay);
      signal?.addEventListener('abort', onAbort, { once: true });
    });
  };

  return api;
})();
