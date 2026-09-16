import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import FavouriteButton from '../components/FavouriteButton';
import { getPlan, getRecipe, savePlan } from '../api/endpoints';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { DAYS, DAY_NAMES, addMeal, emptyPlan } from '../lib/plan';
import { formatMinutes } from '../lib/recipes';
import type { Plan, Recipe } from '../lib/types';

export default function RecipeDetail() {
  const { id } = useParams();
  const { data: user } = useCurrentUser();
  const client = useQueryClient();

  const { data: recipe, isPending, isError, error } = useQuery<Recipe>({
    queryKey: ['recipe', id],
    queryFn: () => getRecipe(id!),
  });

  const addToPlan = useMutation({
    mutationFn: async (day: string) => {
      const plan: Plan = { ...emptyPlan(), ...(await getPlan()) };
      return savePlan(addMeal(plan, day, Number(id)));
    },
    onSuccess: (plan) => {
      client.setQueryData(['plan'], plan);
      client.invalidateQueries({ queryKey: ['plan'] });
    },
  });

  if (isPending) return <p className="loading" role="status">Načítám recept…</p>;

  if (isError) {
    return (
      <section>
        <p role="alert">{(error as Error).message}</p>
        <Link to="/">Zpět na recepty</Link>
      </section>
    );
  }

  return (
    <section className="detail">
      <div className="card-head">
        <h1>{recipe.name}</h1>
        <FavouriteButton recipeId={recipe.id} name={recipe.name} />
      </div>

      <p className="meta">
        <span>{formatMinutes(recipe.minutes)}</span>
        <span>{recipe.portions} porce</span>
      </p>

      <h2>Suroviny</h2>
      <ul className="ingredients">
        {recipe.ingredients.map((ingredient) => (
          <li key={`${ingredient.name}-${ingredient.unit}`}>
            {ingredient.name} — {ingredient.amount} {ingredient.unit}
          </li>
        ))}
      </ul>

      <h2>Postup</h2>
      <p>{recipe.text}</p>

      {user && (
        <div className="add-to-plan">
          <h2>Zařadit do plánu</h2>
          <div className="days">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                disabled={addToPlan.isPending}
                onClick={() => addToPlan.mutate(day)}
              >
                {DAY_NAMES[day]}
              </button>
            ))}
          </div>
          {addToPlan.isSuccess && <p className="done" role="status">Recept je v plánu.</p>}
          {addToPlan.isError && <p role="alert">{(addToPlan.error as Error).message}</p>}
        </div>
      )}

      <Link className="back" to="/">Zpět na recepty</Link>
    </section>
  );
}
