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
 * Jediné místo, kudy aplikace mluví s API. Napiš ho tak, aby:
 * - volalo `/api` + cestu (ve vývoji to proxy z `vite.config.ts` pošle na port 3001),
 * - posílalo cookie s přihlášením u KAŽDÉHO požadavku,
 * - na odpověď 401 vyhodilo `ApiError` se `status` 401,
 * - na jinou chybu vyhodilo `ApiError` s hláškou z těla odpovědi,
 * - u odpovědi 204 (prázdné tělo) nezkoušelo parsovat JSON.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
}
