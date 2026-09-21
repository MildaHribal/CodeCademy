// Párování telefonu (viz server/remote.js). Adresu s tokenem smí vidět jen počítač,
// na kterém server běží — spárovaný telefon už ji nepotřebuje a nikdo jiný ji vidět nesmí.
import { isLoopbackHost } from '../http.js';

export function register(router, ctx) {
  router.get('/api/remote/pairing', ({ req }) => {
    const remote = ctx.remote;
    if (!remote) return { enabled: false, local: isLoopbackHost(req.headers.host) };
    if (!isLoopbackHost(req.headers.host)) return { enabled: true, local: false };
    const [host] = remote.hosts;
    return { enabled: true, local: true, url: `http://${host}:${remote.port}/?token=${remote.token}` };
  });
}
