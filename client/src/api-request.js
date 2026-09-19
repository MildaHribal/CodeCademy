
export class ApiError extends Error {
  constructor(message, { status = 0, offline = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.offline = offline;
  }
}

const OFFLINE_MESSAGE = 'Server Akademie neodpovídá. Zkontroluj, že běží (./start.sh), a zkus to znovu.';

export async function apiRequest(method, path, body, { signal, keepalive } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      ...(keepalive ? { keepalive } : {}),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(OFFLINE_MESSAGE, { offline: true });
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
  }

  if (!response.ok) {
    const message = data?.error ?? `Server vrátil chybu ${response.status}.`;
    const offline = !data?.error && (response.status === 502 || response.status === 504);
    throw new ApiError(offline ? OFFLINE_MESSAGE : message, { status: response.status, offline });
  }
  if (data === null) throw new ApiError('Server poslal odpověď, které nerozumím.', { status: response.status });
  return data;
}
