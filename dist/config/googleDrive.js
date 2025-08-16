"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleDriveConfig = exports.GoogleDriveConfig = void 0;
const googleapis_1 = require("googleapis");
const environment_1 = require("./environment");
class GoogleDriveConfig {
    constructor() {
        this.initializeAuth();
    }
    static getInstance() {
        if (!GoogleDriveConfig.instance) {
            GoogleDriveConfig.instance = new GoogleDriveConfig();
        }
        return GoogleDriveConfig.instance;
    }
    initializeAuth() {
        try {
            this.auth = new googleapis_1.google.auth.GoogleAuth({
                keyFile: environment_1.config.googleDrive.serviceAccountPath,
                scopes: ['https://www.googleapis.com/auth/drive']
            });
            this.drive = googleapis_1.google.drive({ version: 'v3', auth: this.auth });
        }
        catch (error) {
            console.error('Failed to initialize Google Drive authentication:', error);
            throw new Error('Google Drive configuration failed');
        }
    }
    getDriveInstance() {
        return this.drive;
    }
    getAuthInstance() {
        return this.auth;
    }
    async testConnection() {
        try {
            await this.drive.files.list({ pageSize: 1 });
            return true;
        }
        catch (error) {
            console.error('Google Drive connection test failed:', error);
            return false;
        }
    }
}
exports.GoogleDriveConfig = GoogleDriveConfig;
exports.googleDriveConfig = GoogleDriveConfig.getInstance();
//# sourceMappingURL=googleDrive.js.map