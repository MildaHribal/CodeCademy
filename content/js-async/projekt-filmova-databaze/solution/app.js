// Filmotéka: seznam, hledání, stránkování, detail a oblíbené nad API z api.js.
// Zdroj pravdy o tom, co je vidět, je adresa (část za #). Oblíbené jsou v localStorage.

const FAVORITES_KEY = 'filmoteka:oblibene';

const elements = {
  searchForm: document.querySelector('#search-form'),
  search: document.querySelector('#search'),
  status: document.querySelector('#status'),
  error: document.querySelector('#error'),
  errorText: document.querySelector('#error-text'),
  retry: document.querySelector('#retry'),
  listView: document.querySelector('#list-view'),
  listTitle: document.querySelector('#list-title'),
  results: document.querySelector('#results'),
  empty: document.querySelector('#empty'),
  prev: document.querySelector('#prev'),
  next: document.querySelector('#next'),
  pageInfo: document.querySelector('#page-info'),
  detailView: document.querySelector('#detail-view'),
  back: document.querySelector('#back'),
  poster: document.querySelector('#detail-poster'),
  detailTitle: document.querySelector('#detail-title'),
  original: document.querySelector('#detail-original'),
  meta: document.querySelector('#detail-meta'),
  overview: document.querySelector('#detail-overview'),
  favoriteToggle: document.querySelector('#favorite-toggle'),
  favorites: document.querySelector('#favorites'),
  favoritesEmpty: document.querySelector('#favorites-empty'),
};

let activeController = null;
let shownMovie = null;
let favorites = readFavorites();

// ===== Adresa =====

function readRoute() {
  const params = new URLSearchParams(location.hash.slice(1));
  const page = Number(params.get('strana') ?? '1');
  const filmId = Number(params.get('film'));
  return {
    query: (params.get('hledat') ?? '').trim(),
    page: Number.isInteger(page) && page > 0 ? page : 1,
    filmId: params.has('film') && Number.isInteger(filmId) ? filmId : null,
  };
}

function routeHash({ query, page, filmId }) {
  const params = new URLSearchParams();
  if (query) params.set('hledat', query);
  params.set('strana', String(page));
  if (filmId !== null) params.set('film', String(filmId));
  return `#${params}`;
}

function navigate(route) {
  const hash = routeHash(route);
  // stejná adresa hashchange nevyvolá, zobrazení se musí obnovit ručně
  if (hash === location.hash) showRoute();
  else location.hash = hash;
}

// ===== Síť =====

async function getJSON(url, signal) {
  const response = await fetch(url, { signal });
  if (response.status === 404) throw new Error('film jsme nenašli');
  if (!response.ok) throw new Error(`server odpověděl ${response.status}`);
  return response.json();
}

// ===== Oblíbené =====

function readFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((movie) => Number.isInteger(movie?.id) && typeof movie.title === 'string') : [];
  } catch {
    return [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // úložiště může být plné nebo zakázané; oblíbené pak vydrží jen do obnovení
  }
}

function isFavorite(id) {
  return favorites.some((movie) => movie.id === id);
}

function renderFavorites() {
  elements.favorites.replaceChildren(...favorites.map((movie) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = routeHash({ query: '', page: 1, filmId: movie.id });
    link.textContent = `${movie.title} (${movie.year})`;
    item.append(link);
    return item;
  }));
  elements.favoritesEmpty.hidden = favorites.length > 0;
}

function renderFavoriteToggle() {
  const pressed = shownMovie !== null && isFavorite(shownMovie.id);
  elements.favoriteToggle.setAttribute('aria-pressed', String(pressed));
  elements.favoriteToggle.textContent = pressed ? 'Odebrat z oblíbených' : 'Přidat do oblíbených';
}

function toggleFavorite() {
  if (!shownMovie) return;
  const { id, title, year } = shownMovie;
  favorites = isFavorite(id) ? favorites.filter((movie) => movie.id !== id) : [...favorites, { id, title, year }];
  saveFavorites();
  renderFavorites();
  renderFavoriteToggle();
}

// ===== Zobrazení =====

function setLoading(text) {
  elements.status.textContent = text;
  elements.results.setAttribute('aria-busy', 'true');
}

function createResultItem(movie, route) {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.className = 'movie-card__link';
  link.href = routeHash({ ...route, filmId: movie.id });

  const poster = document.createElement('img');
  poster.className = 'movie-card__poster';
  poster.src = movie.poster;
  poster.alt = '';
  poster.loading = 'lazy';

  const title = document.createElement('h2');
  title.className = 'movie-card__title';
  title.textContent = movie.title;

  const meta = document.createElement('p');
  meta.className = 'movie-card__meta';
  meta.textContent = `${movie.year} · ${movie.rating} %`;

  link.append(poster, title, meta);
  item.append(link);
  return item;
}

async function showList(route, signal) {
  elements.detailView.hidden = true;
  elements.listView.hidden = false;
  shownMovie = null;
  elements.listTitle.textContent = route.query ? `Výsledky pro „${route.query}“` : 'Nejlépe hodnocené';
  setLoading('Načítám filmy…');

  const params = new URLSearchParams({ page: String(route.page) });
  if (route.query) params.set('query', route.query);
  const data = await getJSON(`/api/movies?${params}`, signal);

  elements.results.replaceChildren(...data.results.map((movie) => createResultItem(movie, route)));
  elements.empty.hidden = data.results.length > 0;
  elements.prev.disabled = route.page <= 1;
  elements.next.disabled = route.page >= data.totalPages;
  elements.pageInfo.textContent = data.totalPages > 0 ? `Strana ${route.page} z ${data.totalPages}` : '';
  elements.status.textContent = `Filmů: ${data.totalResults}`;
}

async function showDetail(route, signal) {
  setLoading('Načítám detail filmu…');
  const movie = await getJSON(`/api/movies/${route.filmId}`, signal);

  shownMovie = movie;
  elements.listView.hidden = true;
  elements.detailView.hidden = false;
  elements.poster.src = movie.poster;
  elements.poster.alt = `Plakát filmu ${movie.title}`;
  elements.detailTitle.textContent = movie.title;
  elements.original.textContent = movie.originalTitle ?? '';
  elements.meta.textContent = `${movie.year} · ${movie.genres.join(', ')} · režie ${movie.director} · ${movie.rating} %`;
  elements.overview.textContent = movie.overview;
  elements.status.textContent = '';
  renderFavoriteToggle();
  elements.detailTitle.focus();
}

async function showRoute() {
  const route = readRoute();
  elements.search.value = route.query;
  elements.error.hidden = true;

  // starší načítání už nikoho nezajímá; jeho odpověď nesmí nic přepsat
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;

  try {
    if (route.filmId !== null) await showDetail(route, controller.signal);
    else await showList(route, controller.signal);
  } catch (error) {
    if (error.name === 'AbortError') return;
    elements.listView.hidden = true;
    elements.detailView.hidden = true;
    elements.status.textContent = '';
    elements.errorText.textContent = `Nepodařilo se načíst data (${error.message}).`;
    elements.error.hidden = false;
  } finally {
    if (activeController === controller) elements.results.removeAttribute('aria-busy');
  }
}

// ===== Události =====

elements.searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  navigate({ query: elements.search.value.trim(), page: 1, filmId: null });
});

elements.prev.addEventListener('click', () => {
  const route = readRoute();
  navigate({ ...route, page: Math.max(1, route.page - 1), filmId: null });
});

elements.next.addEventListener('click', () => {
  const route = readRoute();
  navigate({ ...route, page: route.page + 1, filmId: null });
});

elements.back.addEventListener('click', () => {
  navigate({ ...readRoute(), filmId: null });
});

// Odkazy uvnitř aplikace (#…) mění jen adresu. Obsluha přes posluchač funguje i v rámu
// náhledu, kde by prohlížeč odkaz „#…" otevřel mimo aplikaci.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;
  event.preventDefault();
  if (link.getAttribute('href') === location.hash) showRoute();
  else location.hash = link.getAttribute('href');
});

elements.favoriteToggle.addEventListener('click', toggleFavorite);
elements.retry.addEventListener('click', showRoute);
window.addEventListener('hashchange', showRoute);

renderFavorites();
showRoute();
