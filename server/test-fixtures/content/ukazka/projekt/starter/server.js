import http from 'node:http';

http.createServer((req, res) => {
  res.end('TODO');
}).listen(process.env.PORT);
