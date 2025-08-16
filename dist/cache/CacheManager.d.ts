export declare class CacheManager {
    private cache;
    private defaultTTL;
    set(key: string, data: any, ttl?: number): void;
    get(key: string): any | null;
    delete(key: string): boolean;
    clear(): void;
    getOrSet<T>(key: string, fetchFunction: () => Promise<T>, ttl?: number): Promise<T>;
    cleanup(): void;
    getStats(): {
        size: number;
        keys: string[];
    };
}
export declare const cacheManager: CacheManager;
//# sourceMappingURL=CacheManager.d.ts.map