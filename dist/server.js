"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const database_1 = __importDefault(require("./config/database"));
const environment_1 = require("./config/environment");
const security_1 = require("./middleware/security");
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = environment_1.config.server.port;
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use(security_1.helmetConfig);
        this.app.use((0, cors_1.default)(security_1.corsOptions));
        this.app.use(security_1.compressionConfig);
        this.app.use(security_1.globalRateLimit);
        this.app.use(security_1.mongoSanitizeConfig);
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(security_1.sanitizeInput);
        if (environment_1.isDevelopment) {
            this.app.use((0, morgan_1.default)('dev'));
        }
        else {
            this.app.use(security_1.requestLogger);
        }
        this.app.set('trust proxy', 1);
    }
    initializeRoutes() {
        this.app.use('/api', routes_1.default);
        this.app.get('/', (req, res) => {
            res.json({
                success: true,
                message: 'Welcome to University Management System API',
                version: '1.0.0',
                documentation: '/api/health',
                endpoints: {
                    auth: '/api/auth',
                    notes: '/api/notes',
                    assignments: '/api/assignments',
                    resources: '/api/resources',
                    drive: '/api/drive'
                }
            });
        });
        this.app.all('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.originalUrl} not found`,
                availableEndpoints: [
                    '/api/auth',
                    '/api/notes',
                    '/api/assignments',
                    '/api/resources',
                    '/api/drive'
                ]
            });
        });
    }
    initializeErrorHandling() {
        this.app.use(security_1.errorHandler);
    }
    async start() {
        try {
            await database_1.default.connect();
            this.app.listen(this.port, () => {
                console.log('🚀 University Management System API');
                console.log(`📍 Server running on port ${this.port}`);
                console.log(`🌍 Environment: ${environment_1.config.server.nodeEnv}`);
                console.log(`📊 Health check: http://localhost:${this.port}/api/health`);
                console.log('✅ Server started successfully');
                console.log('📁 Google Drive integration available at /api/drive');
            });
        }
        catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
}
const server = new Server();
server.start();
exports.default = server;
//# sourceMappingURL=server.js.map