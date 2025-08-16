"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const environment_1 = require("./environment");
class Database {
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        try {
            const mongoUri = environment_1.config.database.uri;
            if (!mongoUri) {
                throw new Error('MongoDB URI is not defined in environment variables');
            }
            await mongoose_1.default.connect(mongoUri, {
                dbName: 'university_db',
            });
            console.log('✅ MongoDB connected successfully');
            mongoose_1.default.connection.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
            });
            mongoose_1.default.connection.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected');
            });
            mongoose_1.default.connection.on('reconnected', () => {
                console.log('✅ MongoDB reconnected');
            });
            process.on('SIGINT', async () => {
                await mongoose_1.default.connection.close();
                console.log('📶 MongoDB connection closed through app termination');
                process.exit(0);
            });
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            process.exit(1);
        }
    }
    async disconnect() {
        await mongoose_1.default.connection.close();
    }
    getConnection() {
        return mongoose_1.default.connection;
    }
}
exports.default = Database.getInstance();
//# sourceMappingURL=database.js.map