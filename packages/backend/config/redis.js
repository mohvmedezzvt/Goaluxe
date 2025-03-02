import { createClient } from 'redis';

const CACHE_VERSION = 'v1';

class RedisService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.connecting = false;
    this.reconnectAttempts = 0;
    this.initialize();
    this.client.on('ready', () => {
      this.backgroundCleanup(`${CACHE_VERSION}:*`);
    });
  }

  initialize() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      pingInterval: 10_000,
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
      this.connected = false;
    });

    this.client.on('ready', () => {
      console.log('Redis ready');
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    this.connect();
  }

  async connect() {
    if (this.connected || this.connecting) return;

    this.connecting = true;
    try {
      await this.client.connect();
      this.connected = true;
      this.connecting = false;
      console.log('Redis connected');
    } catch (error) {
      console.error('Redis connection failed:', error);
      this.connected = false;
      this.connecting = false;
      this.reconnectAttempts++;
      const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(), delay); // Reconnect
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

  async del(...keys) {
    try {
      return await Promise.race([
        this.client.del(...keys),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis DEL timeout')), 2000)
        ),
      ]);
    } catch (error) {
      console.error('Cache deletion error:', error);
      return 0;
    }
  }

  async backgroundCleanup(pattern) {
    if (!this.connected) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length) {
        await this.client.unlink(keys);
      }
    } catch (error) {
      console.error('Background cleanup failed:', error);
    }
  }

  async trackKey(userId, key) {
    try {
      await this.client.sAdd(`user:${userId}:cache_keys`, key);
    } catch (error) {
      console.error('Key tracking failed:', error);
    }
  }

  async invalidateUser(userId) {
    try {
      const userKey = `user:${userId}:cache_keys`;
      const keys = await this.client.sMembers(userKey);
      if (keys.length > 0) {
        const multi = this.client.multi();
        keys.forEach((k) => multi.unlink(k));
        multi.del(userKey);
        await multi.exec();
      }
    } catch (error) {
      console.error('Cache invalidation failed:', error);
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
