import { createServer } from 'node:http';

createServer((req, res) => {
  res.end('Ahoj z projektu');
}).listen(Number(process.env.PORT ?? 3000), () => console.log('Projekt běží'));
