import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { getRecipes } from '../api/endpoints';
import { usePlan } from '../hooks/usePlan';
import { shoppingList } from '../lib/shopping';
import type { Recipe } from '../lib/types';

export default function ShoppingPage() {
  // Počet strávníků je v adrese: nákupní seznam pro čtyři jde poslat odkazem.
  const [params, setParams] = useSearchParams();
  const people = Number(params.get('lidi') ?? '') || 4;

  const { data: plan, isPending } = usePlan(true);
  const { data: recipes } = useQuery<Recipe[]>({ queryKey: ['recipes'], queryFn: getRecipes });

  if (isPending || !plan || !recipes) return <p className="loading" role="status">Počítám nákupní seznam…</p>;

  const items = shoppingList(plan, recipes, people);

  return (
    <section>
      <h1>Nákupní seznam</h1>

      <div className="filters">
        <label htmlFor="lidi">Pro kolik lidí vaříš</label>
        <input
          id="lidi"
          type="number"
          min={1}
          max={20}
          value={people}
          onChange={(event) => setParams({ lidi: event.target.value }, { replace: true })}
        />
      </div>

      {items.length === 0 && <p className="empty">Plán je zatím prázdný, takže není co kupovat.</p>}

      {items.length > 0 && (
        <ul className="shopping">
          {items.map((item) => (
            <li key={`${item.name}-${item.unit}`}>
              <span>{item.name}</span>
              <strong>{item.amount} {item.unit}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
