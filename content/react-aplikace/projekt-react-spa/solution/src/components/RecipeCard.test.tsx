import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';
import RecipeCard from './RecipeCard';
import type { Recipe } from '../lib/types';

const recipe: Recipe = {
  id: 7,
  name: 'Znojemská pečeně',
  tag: 'maso',
  minutes: 120,
  portions: 4,
  ingredients: [{ name: 'cibule', amount: 2, unit: 'ks' }],
};

/** Náhrada sítě: nikdo není přihlášený, takže /api/me odpoví 401. */
function stubFetch() {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'Nikdo' }), { status: 401 })));
}

function renderCard() {
  stubFetch();
  // Čerstvý klient v každém testu, ať si testy nepředávají cache.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ul><RecipeCard recipe={recipe} /></ul>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

test('karta ukáže název jako odkaz na detail', () => {
  renderCard();
  const link = screen.getByRole('link', { name: 'Znojemská pečeně' });
  expect(link.getAttribute('href')).toBe('/recept/7');
});

test('karta ukáže čas v hodinách a počet porcí', () => {
  renderCard();
  expect(screen.getByText('2 h')).toBeTruthy();
  expect(screen.getByText('4 porce')).toBeTruthy();
});

test('nepřihlášenému se srdíčko nenabízí', async () => {
  renderCard();
  expect(screen.queryByRole('button')).toBeNull();
});
