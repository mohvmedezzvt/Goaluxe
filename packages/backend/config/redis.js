import { createClient } from 'redis';

class RedisService {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    this.connect();
  }

  async connect() {
    await this.client.connect();
    console.log('Redis connected');
  }

  async get(key) {
    const start = Date.now();
    const value = await this.client.get(key);
    console.log(`[CACHE] GET ${key} - ${Date.now() - start}ms`);
    return value ? JSON.parse(value) : null;
  }

  async set(key, value, ttl) {
    const start = Date.now();
    await this.client.setEx(key, ttl, JSON.stringify(value));
    console.log(`[CACHE] SET ${key} - ${Date.now() - start}ms`);
  }

  async del(patterns) {
    try {
      const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
      let allKeys = [];

      // Get keys for all patterns
      for (const pattern of patternsArray) {
        const keys = await this.client.keys(pattern);
        allKeys = [...allKeys, ...keys];
      }

      // Remove duplicate keys
      const uniqueKeys = [...new Set(allKeys)];

      if (uniqueKeys.length > 0) {
        await this.client.del(uniqueKeys);
        console.log(`Deleted ${uniqueKeys.length} keys:`, uniqueKeys);
      }
    } catch (error) {
      console.error('Cache deletion error:', error);
    }
  }
}

export default new RedisService();
