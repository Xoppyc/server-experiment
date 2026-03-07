import { IncomingMessage, ServerResponse } from 'http';
type Handler = (req: IncomingMessage, res: ServerResponse) => void;
export declare class Router {
    private routes;
    get(path: string, handler: Handler): void;
    post(path: string, handler: Handler): void;
    put(path: string, handler: Handler): void;
    delete(path: string, handler: Handler): void;
    private addRoute;
    response(res: any, statusCode: number, data: any): void;
    xml(res: any, statusCode: number, xmlString: string): void;
    listen(port?: number, host?: string, callback?: () => void): void;
    handle(req: any, res: any): void;
}
export declare const router: Router;
export {};
//# sourceMappingURL=router.d.ts.map