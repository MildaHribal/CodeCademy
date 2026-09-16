import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router';
import Layout from './components/Layout';
import LoginPage from './routes/LoginPage';
import NotFound from './routes/NotFound';
import PlanPage from './routes/PlanPage';
import RecipeDetail from './routes/RecipeDetail';
import RecipeList from './routes/RecipeList';
import ShoppingPage from './routes/ShoppingPage';

const client = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<RecipeList />} />
            <Route path="recept/:id" element={<RecipeDetail />} />
            <Route path="prihlaseni" element={<LoginPage />} />
            {/* Plán a nákupní seznam patří jen přihlášenému — obal je chráněnou trasou. */}
            <Route path="plan" element={<PlanPage />} />
            <Route path="nakup" element={<ShoppingPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
