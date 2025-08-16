import express from 'express';
import morgan from 'morgan';
import Database from './config/database';
import { config, isDevelopment } from './config/environment';
import {
  globalRateLimit,
  corsOptions,
  helmetConfig,
  compressionConfig,
  mongoSanitizeConfig,
  sanitizeInput,
  requestLogger,
  errorHandler
} from './middleware/security';
import routes from './routes';
import cors from 'cors';

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmetConfig);
    this.app.use(cors(corsOptions));
    this.app.use(compressionConfig);
    this.app.use(globalRateLimit);
    this.app.use(mongoSanitizeConfig);

    // Body parsing middlewares
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Custom security middlewares
    this.app.use(sanitizeInput);

    // Logging middleware
    if (isDevelopment) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(requestLogger);
    }

    // Trust proxy for production deployment
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Root endpoint
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

    // 404 handler for undefined routes
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

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await Database.connect();

      // Start server
      this.app.listen(this.port, () => {
        console.log('🚀 University Management System API');
        console.log(`📍 Server running on port ${this.port}`);
        console.log(`🌍 Environment: ${config.server.nodeEnv}`);
        console.log(`📊 Health check: http://localhost:${this.port}/api/health`);
        console.log('✅ Server started successfully');
        console.log('📁 Google Drive integration available at /api/drive');
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start server
const server = new Server();
server.start();

export default server;