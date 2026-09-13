// Spuštění http.Serveru na volném portu (jen 127.0.0.1).

/** Poslouchá na daném portu (0 = volný port od systému). Vrátí skutečný port. */
export function listen(server, port = 0, host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve(server.address().port);
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });
}

/** Zkusí porty v rozsahu `from..to` a vezme první volný. */
export async function listenInRange(server, { from, to, host = '127.0.0.1' }) {
  for (let port = from; port <= to; port++) {
    try {
      return await listen(server, port, host);
    } catch (error) {
      if (error.code !== 'EADDRINUSE') throw error;
    }
  }
  throw new Error(`Žádný volný port v rozsahu ${from}–${to}`);
}

export function closeServer(server) {
  return new Promise((resolve) => {
    if (!server.listening) return resolve();
    server.closeAllConnections?.();
    server.close(() => resolve());
  });
}
