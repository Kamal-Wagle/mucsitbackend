import { google } from 'googleapis';
import { config } from './environment';

export class GoogleDriveConfig {
  private static instance: GoogleDriveConfig;
  private drive: any;
  private auth: any;

  private constructor() {
    this.initializeAuth();
  }

  public static getInstance(): GoogleDriveConfig {
    if (!GoogleDriveConfig.instance) {
      GoogleDriveConfig.instance = new GoogleDriveConfig();
    }
    return GoogleDriveConfig.instance;
  }

  private initializeAuth(): void {
    try {
      // Service Account Authentication
      this.auth = new google.auth.GoogleAuth({
        keyFile: config.googleDrive.serviceAccountPath,
        scopes: ['https://www.googleapis.com/auth/drive']
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });
    } catch (error) {
      console.error('Failed to initialize Google Drive authentication:', error);
      throw new Error('Google Drive configuration failed');
    }
  }

  public getDriveInstance() {
    return this.drive;
  }

  public getAuthInstance() {
    return this.auth;
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.drive.files.list({ pageSize: 1 });
      return true;
    } catch (error) {
      console.error('Google Drive connection test failed:', error);
      return false;
    }
  }
}

export const googleDriveConfig = GoogleDriveConfig.getInstance();