import dotenv from 'dotenv';

dotenv.config();

interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  database: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  upload: {
    maxFileSize: number;
    uploadPath: string;
  };
  cors: {
    allowedOrigins: string[];
  };
  googleDrive: {
    serviceAccountPath: string;
    universityFolderId: string;
  };
}

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/university_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  googleDrive: {
    serviceAccountPath: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_PATH || './google-service-account.json',
    universityFolderId: process.env.GOOGLE_DRIVE_UNIVERSITY_FOLDER_ID || '',
  },
};

export const isProduction = config.server.nodeEnv === 'production';
export const isDevelopment = config.server.nodeEnv === 'development';