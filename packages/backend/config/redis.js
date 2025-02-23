import { createClient } from 'redis';

class RedisService {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      pingInterval: 10_000, // Keep connection alive
    });
    this.connected = false;
    this.connect();
  }

  async connect() {
    if (this.connected) return;
    try {
      await this.client.connect();
      this.connected = true;
      console.log('Redis connected');
    } catch (error) {
      console.error('Redis connection failed:', error);
      setTimeout(() => this.connect(), 5000); // Reconnect
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  async delPattern(pattern) {
    try {
      let cursor = '0';
      const keys = [];
      do {
        const reply = await this.client.scan(cursor, {
          MATCH: pattern,
          COUNT: 1000,
        });
        cursor = reply.cursor;
        keys.push(...reply.keys);
      } while (cursor !== '0');

      if (keys.length) {
        const pipeline = this.client.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
      }
    } catch (error) {
      console.error('Cache pattern deletion error:', error);
    }
  }

  async healthCheck() {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }
}

export default new RedisService();
