
export async function runNodeTestsRemote({ files, hints, timeoutMs, signal = null }) {
  try {
    const response = await fetch('/api/run-node', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ runtime: 'node', files, hints, timeoutMs }),
      signal,
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body || !Array.isArray(body.results)) {
      throw new Error(body?.error ?? `server odpověděl stavem ${response.status}`);
    }
    return body;
  } catch (error) {
    const message = `Testy na serveru nejdou spustit: ${error.message}`;
    return {
      ok: false,
      results: hints.map((_, index) => ({ index, pass: false, error: message })),
      logs: [],
      errors: [],
      syntaxError: null,
      runnerError: message,
    };
  }
}
