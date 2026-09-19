import path from 'node:path';
import { createApp } from './app.js';

const root = path.join(import.meta.dirname, '..');
const port = Number(process.env.PORT ?? 4300);
const host = '127.0.0.1';

const server = createApp({
  contentDir: path.join(root, 'content'),
  dataDir: path.join(root, 'data'),
  projectsDir: path.join(root, 'moje-projekty'),
  distDir: path.join(root, 'dist'),
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} je obsazený — běží už Akademie jinde? Zkus jiný: PORT=4301 node server/index.js`);
  } else {
    console.error('Server nejde spustit:', err.message);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`Server Akademie poslouchá na http://${host}:${server.address().port}`);
});

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    server.close();
    process.exit(0);
  });
}
