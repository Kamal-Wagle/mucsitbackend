declare class Server {
    private app;
    private port;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    start(): Promise<void>;
}
declare const server: Server;
export default server;
//# sourceMappingURL=server.d.ts.map