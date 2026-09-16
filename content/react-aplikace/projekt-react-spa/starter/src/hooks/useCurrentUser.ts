import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../api/client';
import { getMe } from '../api/endpoints';
import type { User } from '../lib/types';

/**
 * Kdo je přihlášený. Odpověď 401 není chyba, ale platná informace „nikdo" —
 * proto se z ní vrací `null` a komponenty rozlišují tři stavy, ne dva.
 */
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await getMe();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
