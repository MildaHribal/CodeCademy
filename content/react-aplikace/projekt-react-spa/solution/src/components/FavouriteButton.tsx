import { useFavourites, useToggleFavourite } from '../hooks/useFavourites';
import { useCurrentUser } from '../hooks/useCurrentUser';

type Props = { recipeId: number; name: string };

export default function FavouriteButton({ recipeId, name }: Props) {
  const { data: user } = useCurrentUser();
  const { data: favourites } = useFavourites(Boolean(user));
  const toggle = useToggleFavourite();

  if (!user) return null;

  const isFavourite = (favourites ?? []).includes(recipeId);

  return (
    <button
      type="button"
      className="favourite"
      aria-pressed={isFavourite}
      aria-label={isFavourite ? `Odebrat ${name} z oblíbených` : `Přidat ${name} do oblíbených`}
      onClick={() => toggle.mutate({ id: recipeId, isFavourite })}
    >
      {isFavourite ? '★' : '☆'}
    </button>
  );
}
