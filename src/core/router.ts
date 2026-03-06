// define handler type
type Handler = (req: Request, res: Response) => void;

export class router {
  //  route { path: { method: handler } }
  private routes: Record<string, Record<string, Handler>> = {};

  // Define methods for HTTP verbs
  get(path: string, handler: Handler) {
    this.addRoute('GET', path, handler);
  }
  post(path: string, handler: Handler) {
    this.addRoute('POST', path, handler);
  }

  // private method for adding routes to router. need to be private because we don't want users to call it directly
  private addRoute(method: string, path: string, handler: Handler) {
    if (!this.routes[path]) this.routes[path] = {};
    this.routes[path][method] = handler;
  }

  response(res: any, statusCode: number, data: any) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  // Method to handle incoming requests and route them to the appropriate handler
  handle(req: any, res: any) {
    const method = req.method || 'GET';
    const path = req.url || '/';

    const handler = this.routes[path]?.[method];

    if (handler) {
      res.json = (data: any) => this.response(res, 200, data);
      Promise.resolve(handler(req, res)).catch(err => {
        this.response(res, 500, { error: 'Internal Server Error', details: err.message });
      });
    } else {
      this.response(res, 404, { error: 'Not Found' });
    }
  }
}

