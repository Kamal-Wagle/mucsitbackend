"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheManager = exports.CacheManager = void 0;
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000;
    }
    set(key, data, ttl) {
        const expiry = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, { data, expiry });
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    async getOrSet(key, fetchFunction, ttl) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }
        const data = await fetchFunction();
        this.set(key, data, ttl);
        return data;
    }
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}
exports.CacheManager = CacheManager;
exports.cacheManager = new CacheManager();
setInterval(() => {
    exports.cacheManager.cleanup();
}, 10 * 60 * 1000);
//# sourceMappingURL=CacheManager.js.map