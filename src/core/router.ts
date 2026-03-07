import http, { IncomingMessage, ServerResponse } from 'http';
import bodyParser from '../utils/bodyParser';
// define handler type
type Handler = (req: IncomingMessage, res: ServerResponse) => void;

interface Route {
  method: string;
  path: string;
  regex: RegExp;
  paramNames: string[];
  handler: Handler;
}

const PORT: number = 3000;
const HOST: string = 'localhost';
export class Router {
  //  route { path: { method: handler } }
  private routes: Route[] = []

  // Define methods for HTTP verbs
  get(path: string, handler: Handler) {
    this.addRoute('GET', path, handler);
  }
  post(path: string, handler: Handler) {
    this.addRoute('POST', path, handler);
  }
  put(path: string, handler: Handler) {
    this.addRoute('PUT', path, handler);
  }
  delete(path: string, handler: Handler) {
    this.addRoute('DELETE', path, handler);
  }

  // private method for adding routes to router
  private addRoute(method: string, path: string, handler: Handler) {
    const paramNames: string[] = [];

    const regex = path.replace(/:(\w+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    this.routes.push({
      method,
      path,
      regex: new RegExp(`^${regex}$`),
      paramNames,
      handler
    }
    )
  }

  // method to send json response
  response(res: any, statusCode: number, data: any) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  // method to send xml response
  xml(res: any, statusCode: number, xmlString: string) {
    res.writeHead(statusCode, { 'Content-Type': 'application/xml' });
    res.end(xmlString);
  }

  listen(port?: number, host?: string, callback?: () => void) {
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
        this.handle(req, res);
      };

    });

    server.listen(port || PORT, host || HOST, () => {
      if (callback) callback();
      console.log(`Server is running on http://${host || HOST}:${port || PORT}`);
    });
  }

  // Method to handle incoming requests and route them to the appropriate handler
  handle(req: any, res: any) {
    const method = req.method;
    const path = req.url;

    const foundRoute = this.routes.find(route =>
      route.method === method && route.regex.test(path)
    )

    if (foundRoute) {
      const matches = path.match(foundRoute.regex);
      if (matches) {
        const values = matches.slice(1);
        req.params = foundRoute.paramNames.reduce((acc, name, i) => {
          acc[name] = values[i];
          return acc;
        }, {} as any)
      }

      res.json = (data: any) => this.response(res, 200, data);
      res.xml = (xmlString: string) => this.xml(res, 200, xmlString);
      Promise.resolve(foundRoute.handler(req, res)).catch(err => {
        this.response(res, 500, { error: 'Internal Server Error', details: err.message });
      });
    } else {
      this.response(res, 404, { error: 'Not Found' });
    }
  }
}
export const router = new Router();