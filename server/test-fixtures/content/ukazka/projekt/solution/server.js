import http from 'node:http';

http.createServer((req, res) => {
  res.end('Ahoj z Akademie');
}).listen(process.env.PORT);
