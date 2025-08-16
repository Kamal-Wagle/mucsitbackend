"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginManager = exports.PluginManager = void 0;
class PluginManager {
    constructor() {
        this.plugins = new Map();
    }
    async registerPlugin(plugin) {
        if (this.plugins.has(plugin.name)) {
            throw new Error(`Plugin ${plugin.name} is already registered`);
        }
        await plugin.initialize();
        this.plugins.set(plugin.name, plugin);
        console.log(`✅ Plugin ${plugin.name} v${plugin.version} registered successfully`);
    }
    async unregisterPlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin ${name} is not registered`);
        }
        await plugin.destroy();
        this.plugins.delete(name);
        console.log(`🗑️ Plugin ${name} unregistered successfully`);
    }
    getPlugin(name) {
        return this.plugins.get(name);
    }
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    async destroyAll() {
        for (const plugin of this.plugins.values()) {
            await plugin.destroy();
        }
        this.plugins.clear();
    }
}
exports.PluginManager = PluginManager;
exports.pluginManager = new PluginManager();
//# sourceMappingURL=PluginManager.js.map