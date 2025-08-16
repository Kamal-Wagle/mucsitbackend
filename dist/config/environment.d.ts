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
export declare const config: Config;
export declare const isProduction: boolean;
export declare const isDevelopment: boolean;
export {};
//# sourceMappingURL=environment.d.ts.map