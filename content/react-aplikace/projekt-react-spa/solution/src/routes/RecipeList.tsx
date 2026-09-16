import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import RecipeCard from '../components/RecipeCard';
import { getRecipes } from '../api/endpoints';
import { filterRecipes } from '../lib/recipes';
import type { Recipe } from '../lib/types';

const TAGS = [
  { value: 'vse', label: 'Vše' },
  { value: 'bezmasa', label: 'Bez masa' },
  { value: 'maso', label: 'Maso' },
  { value: 'ryba', label: 'Ryba' },
  { value: 'moucnik', label: 'Moučník' },
];

export default function RecipeList() {
  // Filtry bydlí v adrese, ne ve stavu: odkaz na vyfiltrovanou nabídku jde poslat
  // a tlačítko Zpět je vrací tak, jak uživatel čeká.
  const [params, setParams] = useSearchParams();
  const query = params.get('hledat') ?? '';
  const tag = params.get('stitek') ?? 'vse';
  const maxMinutes = Number(params.get('do') ?? '') || undefined;

  const { data: recipes, isPending, isError, error, refetch } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: getRecipes,
  });

  function setParam(name: string, value: string) {
    const next = new URLSearchParams(params);
    if (value && value !== 'vse') next.set(name, value);
    else next.delete(name);
    setParams(next, { replace: true });
  }

  const shown = filterRecipes(recipes ?? [], { query, tag, maxMinutes });

  return (
    <section>
      <h1>Recepty</h1>

      <div className="filters">
        <label htmlFor="hledat">Hledat v názvu i surovinách</label>
        <input
          id="hledat"
          type="search"
          value={query}
          placeholder="například cibule"
          onChange={(event) => setParam('hledat', event.target.value)}
        />

        <div className="tags" role="group" aria-label="Filtr podle druhu">
          {TAGS.map((item) => (
            <button
              key={item.value}
              type="button"
              className="tag-button"
              aria-pressed={item.value === tag}
              onClick={() => setParam('stitek', item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isPending && <p className="loading" role="status">Načítám recepty…</p>}

      {isError && (
        <div>
          <p role="alert">{(error as Error).message}</p>
          <button type="button" onClick={() => refetch()}>Zkusit znovu</button>
        </div>
      )}

      {recipes && shown.length === 0 && (
        <p className="empty">Tomuhle hledání neodpovídá žádný recept. Zkus jiné slovo nebo jiný druh.</p>
      )}

      {recipes && shown.length > 0 && (
        <ul className="cards">
          {shown.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </ul>
      )}
    </section>
  );
}
