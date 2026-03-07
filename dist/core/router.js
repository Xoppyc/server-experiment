"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.Router = void 0;
const http_1 = __importDefault(require("http"));
const bodyParser_1 = __importDefault(require("../utils/bodyParser"));
const PORT = 3000;
const HOST = 'localhost';
class Router {
    routes = [];
    get(path, handler) {
        this.addRoute('GET', path, handler);
    }
    post(path, handler) {
        this.addRoute('POST', path, handler);
    }
    put(path, handler) {
        this.addRoute('PUT', path, handler);
    }
    delete(path, handler) {
        this.addRoute('DELETE', path, handler);
    }
    addRoute(method, path, handler) {
        const paramNames = [];
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
        });
    }
    response(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }
    xml(res, statusCode, xmlString) {
        res.writeHead(statusCode, { 'Content-Type': 'application/xml' });
        res.end(xmlString);
    }
    listen(port, host, callback) {
        const server = http_1.default.createServer(async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            if (req.method === 'POST' || req.method === 'PUT') {
                try {
                    req.body = await (0, bodyParser_1.default)(req);
                }
                catch (e) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Invalid JSON" }));
                }
            }
            if (req) {
                this.handle(req, res);
            }
            ;
        });
        server.listen(port || PORT, host || HOST, () => {
            if (callback)
                callback();
            console.log(`Server is running on http://${host || HOST}:${port || PORT}`);
        });
    }
    handle(req, res) {
        const method = req.method;
        const path = req.url;
        const foundRoute = this.routes.find(route => route.method === method && route.regex.test(path));
        if (foundRoute) {
            const matches = path.match(foundRoute.regex);
            if (matches) {
                const values = matches.slice(1);
                req.params = foundRoute.paramNames.reduce((acc, name, i) => {
                    acc[name] = values[i];
                    return acc;
                }, {});
            }
            res.json = (data) => this.response(res, 200, data);
            res.xml = (xmlString) => this.xml(res, 200, xmlString);
            Promise.resolve(foundRoute.handler(req, res)).catch(err => {
                this.response(res, 500, { error: 'Internal Server Error', details: err.message });
            });
        }
        else {
            this.response(res, 404, { error: 'Not Found' });
        }
    }
}
exports.Router = Router;
exports.router = new Router();
//# sourceMappingURL=router.js.map