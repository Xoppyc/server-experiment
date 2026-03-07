import http, { IncomingMessage, ServerResponse } from 'http';
import { router } from './router';
import bodyParser from '../utils/bodyParser';

const PORT: number = 3000;
const HOST: string = 'localhost';

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {

  // 设置响应头 | Set response headers
  res.setHeader('Content-Type', 'application/json');

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      req.body = await bodyParser(req);
    } catch (e) {
      // If JSON is broken, don't even talk to the router
      res.writeHead(400);
      return res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
  }

  // this handles entire request response so it better not to break
  if (req) {
    router.handle(req, res);
  };

});

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});