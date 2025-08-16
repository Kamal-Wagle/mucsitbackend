interface IPlugin {
  name: string;
  version: string;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
}

export class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();

  async registerPlugin(plugin: IPlugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    await plugin.initialize();
    this.plugins.set(plugin.name, plugin);
    console.log(`✅ Plugin ${plugin.name} v${plugin.version} registered successfully`);
  }

  async unregisterPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} is not registered`);
    }

    await plugin.destroy();
    this.plugins.delete(name);
    console.log(`🗑️ Plugin ${name} unregistered successfully`);
  }

  getPlugin(name: string): IPlugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  async destroyAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.destroy();
    }
    this.plugins.clear();
  }
}

export const pluginManager = new PluginManager();