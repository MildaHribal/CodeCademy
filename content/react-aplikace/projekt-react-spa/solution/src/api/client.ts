/** Chyba, kterou vrátilo API. `status` se hodí na rozlišení 401 od skutečné poruchy. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Jediné místo, kudy aplikace mluví s API.
 * `credentials: 'include'` posílá cookie s přihlášením u každého požadavku —
 * kdyby chyběla u jediného volání, server by odpověděl 401.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: options.body ? { 'content-type': 'application/json' } : undefined,
    ...options,
  });

  if (response.status === 401) {
    throw new ApiError('Nejsi přihlášený, nebo ti vypršela relace.', 401);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.error ?? `Požadavek selhal (${response.status}).`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
