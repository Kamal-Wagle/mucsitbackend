export declare class GoogleDriveConfig {
    private static instance;
    private drive;
    private auth;
    private constructor();
    static getInstance(): GoogleDriveConfig;
    private initializeAuth;
    getDriveInstance(): any;
    getAuthInstance(): any;
    testConnection(): Promise<boolean>;
}
export declare const googleDriveConfig: GoogleDriveConfig;
//# sourceMappingURL=googleDrive.d.ts.map