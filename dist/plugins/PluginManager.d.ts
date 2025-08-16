interface IPlugin {
    name: string;
    version: string;
    initialize(): Promise<void>;
    destroy(): Promise<void>;
}
export declare class PluginManager {
    private plugins;
    registerPlugin(plugin: IPlugin): Promise<void>;
    unregisterPlugin(name: string): Promise<void>;
    getPlugin(name: string): IPlugin | undefined;
    getAllPlugins(): IPlugin[];
    destroyAll(): Promise<void>;
}
export declare const pluginManager: PluginManager;
export {};
//# sourceMappingURL=PluginManager.d.ts.map