import mongoose from 'mongoose';
import { config } from './environment';

class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      const mongoUri = config.database.uri;
      
      if (!mongoUri) {
        throw new Error('MongoDB URI is not defined in environment variables');
      }

      await mongoose.connect(mongoUri, {
        dbName: 'university_db',
      });

      console.log('✅ MongoDB connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('📶 MongoDB connection closed through app termination');
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.connection.close();
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }
}

export default Database.getInstance();