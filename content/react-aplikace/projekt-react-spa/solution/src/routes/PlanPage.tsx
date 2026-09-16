import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getRecipes } from '../api/endpoints';
import { usePlan, useSavePlan } from '../hooks/usePlan';
import { DAYS, DAY_NAMES, countMeals, removeMeal } from '../lib/plan';
import type { Recipe } from '../lib/types';

export default function PlanPage() {
  const { data: plan, isPending } = usePlan(true);
  const { data: recipes } = useQuery<Recipe[]>({ queryKey: ['recipes'], queryFn: getRecipes });
  const save = useSavePlan();

  if (isPending || !plan) return <p className="loading" role="status">Načítám plán…</p>;

  const byId = new Map((recipes ?? []).map((recipe) => [recipe.id, recipe]));

  return (
    <section>
      <h1>Týdenní plán</h1>
      <p className="muted">Celkem {countMeals(plan)} jídel. Nákupní seznam se z plánu odvodí sám.</p>

      <ul className="week">
        {DAYS.map((day) => (
          <li key={day}>
            <h2>{DAY_NAMES[day]}</h2>
            {(plan[day] ?? []).length === 0 && <p className="muted">Zatím nic.</p>}
            <ul>
              {(plan[day] ?? []).map((recipeId) => (
                <li key={recipeId} className="meal">
                  <Link to={`/recept/${recipeId}`}>{byId.get(recipeId)?.name ?? `Recept ${recipeId}`}</Link>
                  <button
                    type="button"
                    aria-label={`Odebrat ${byId.get(recipeId)?.name ?? 'recept'} z ${DAY_NAMES[day]}`}
                    onClick={() => save.mutate(removeMeal(plan, day, recipeId))}
                  >
                    Odebrat
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <Link className="back" to="/nakup">Nákupní seznam</Link>
    </section>
  );
}
