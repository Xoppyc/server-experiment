import http, { IncomingMessage, ServerResponse } from 'http';

const PORT: number = 3000;

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {

  // 设置响应头 | Set response headers
  res.setHeader('Content-Type', 'application/json');

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // Basic methods (to test the waters)
  if (req.url === '/api/hello' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Hello, World!' }));
  }

  if (req.url === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = JSON.parse(body) || {};
      res.writeHead(201);
      res.end(JSON.stringify({ message: 'Data received', data }));
    })
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});