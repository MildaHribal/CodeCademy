import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addFavourite, getFavourites, removeFavourite } from '../api/endpoints';

export function useFavourites(enabled: boolean) {
  return useQuery<number[]>({
    queryKey: ['favourites'],
    queryFn: getFavourites,
    enabled,
    retry: false,
  });
}

/**
 * Přepnutí oblíbeného. Srdíčko se překlopí hned (optimistická úprava);
 * když server odmítne, vrátí se cache na snímek pořízený před zásahem.
 */
export function useToggleFavourite() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFavourite }: { id: number; isFavourite: boolean }) =>
      isFavourite ? removeFavourite(id) : addFavourite(id),

    onMutate: async ({ id, isFavourite }) => {
      await client.cancelQueries({ queryKey: ['favourites'] });
      const previous = client.getQueryData<number[]>(['favourites']) ?? [];
      client.setQueryData<number[]>(['favourites'], isFavourite
        ? previous.filter((item) => item !== id)
        : [...previous, id]);
      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context) client.setQueryData(['favourites'], context.previous);
    },

    onSettled: () => {
      client.invalidateQueries({ queryKey: ['favourites'] });
    },
  });
}
