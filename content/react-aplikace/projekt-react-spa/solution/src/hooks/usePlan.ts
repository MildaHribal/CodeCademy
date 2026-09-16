import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPlan, savePlan } from '../api/endpoints';
import { emptyPlan } from '../lib/plan';
import type { Plan } from '../lib/types';

export function usePlan(enabled: boolean) {
  return useQuery<Plan>({
    queryKey: ['plan'],
    queryFn: async () => ({ ...emptyPlan(), ...(await getPlan()) }),
    enabled,
    retry: false,
  });
}

export function useSavePlan() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: savePlan,
    onSuccess: (plan) => {
      client.setQueryData(['plan'], plan);
      client.invalidateQueries({ queryKey: ['plan'] });
    },
  });
}
