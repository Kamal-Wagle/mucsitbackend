interface IPlugin {
    name: string;
    version: string;
    initialize(): Promise<void>;
    destroy(): Promise<void>;
}
export declare class DriveIntegrationPlugin implements IPlugin {
    name: string;
    version: string;
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    private setupEventListeners;
}
export {};
//# sourceMappingURL=DriveIntegrationPlugin.d.ts.map