/**
 * EaglEs EyE — Redis Persistence Client
 * Resilient Redis connection singleton with automatic in-memory fallback.
 */

import Redis from 'ioredis';
import { config } from '../config.js';
import { createLogger } from '../logger.js';
import { calculateDistanceKm, GeoPoint } from '../domain/types.js';

const log = createLogger('RedisClient');

export interface RedisGeoResult {
  member: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
}

/**
 * In-memory fallback geospatial storage for environments without a running Redis server.
 */
class InMemorySpatialStore {
  private entities: Map<string, { value: string; expiresAt?: number }> =
    new Map();
  private geoSets: Map<string, Map<string, GeoPoint>> = new Map();

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.entities.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<string | null> {
    const item = this.entities.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.entities.delete(key);
      return null;
    }
    return item.value;
  }

  async del(key: string): Promise<number> {
    const existed = this.entities.delete(key);
    return existed ? 1 : 0;
  }

  async geoadd(
    key: string,
    longitude: number,
    latitude: number,
    member: string,
  ): Promise<number> {
    if (!this.geoSets.has(key)) {
      this.geoSets.set(key, new Map());
    }
    this.geoSets.get(key)!.set(member, { latitude, longitude });
    return 1;
  }

  async geosearch(
    key: string,
    longitude: number,
    latitude: number,
    radiusKm: number,
  ): Promise<RedisGeoResult[]> {
    const set = this.geoSets.get(key);
    if (!set) return [];

    const center: GeoPoint = { latitude, longitude };
    const results: RedisGeoResult[] = [];

    for (const [member, point] of set.entries()) {
      const dist = calculateDistanceKm(center, point);
      if (dist <= radiusKm) {
        results.push({
          member,
          distanceKm: dist,
          latitude: point.latitude,
          longitude: point.longitude,
        });
      }
    }

    results.sort((a, b) => a.distanceKm - b.distanceKm);
    return results;
  }

  async zrem(key: string, member: string): Promise<number> {
    const set = this.geoSets.get(key);
    if (!set) return 0;
    return set.delete(member) ? 1 : 0;
  }

  async clearKeyPrefix(prefix: string): Promise<void> {
    for (const key of Array.from(this.entities.keys())) {
      if (key.startsWith(prefix)) {
        this.entities.delete(key);
      }
    }
    for (const key of Array.from(this.geoSets.keys())) {
      if (key.startsWith(prefix)) {
        this.geoSets.delete(key);
      }
    }
  }

  countPrefix(prefix: string): number {
    let cnt = 0;
    for (const key of this.entities.keys()) {
      if (key.startsWith(prefix)) cnt++;
    }
    return cnt;
  }
}

export class ResilientRedisManager {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private fallbackStore: InMemorySpatialStore = new InMemorySpatialStore();
  private connectionAttempted: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.connectionAttempted) return;
    this.connectionAttempted = true;

    try {
      this.client = new Redis(config.redis.url, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            log.warn(
              'Redis reconnection limit reached. Falling back to in-memory spatial store.',
            );
            return null; // Stop retrying, use fallback
          }
          return Math.min(times * 100, 1000);
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        log.info(`⚡ Connected to Redis at ${config.redis.url}`);
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        log.debug(
          `Redis connection state: ${err.message} (Using in-memory fallback)`,
        );
      });

      // Attempt initial connect asynchronously
      this.client.connect().catch(() => {
        this.isConnected = false;
        log.info(
          'Redis server not available at startup. Running with in-memory geospatial store.',
        );
      });
    } catch {
      this.isConnected = false;
      log.info('Using in-memory geospatial fallback store.');
    }
  }

  public get connected(): boolean {
    return this.isConnected;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err) {
        log.warn('Redis set failed, falling back to memory', err);
      }
    }
    await this.fallbackStore.set(key, value, ttlSeconds);
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        log.warn('Redis get failed, falling back to memory', err);
      }
    }
    return await this.fallbackStore.get(key);
  }

  async del(key: string): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.del(key);
      } catch (err) {
        log.warn('Redis del failed, falling back to memory', err);
      }
    }
    return await this.fallbackStore.del(key);
  }

  async geoadd(
    key: string,
    longitude: number,
    latitude: number,
    member: string,
  ): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.geoadd(key, longitude, latitude, member);
      } catch (err) {
        log.warn('Redis geoadd failed, falling back to memory', err);
      }
    }
    return await this.fallbackStore.geoadd(key, longitude, latitude, member);
  }

  async geosearch(
    key: string,
    longitude: number,
    latitude: number,
    radiusKm: number,
  ): Promise<RedisGeoResult[]> {
    if (this.isConnected && this.client) {
      try {
        // GEORADIUS key longitude latitude radius km WITHDIST WITHCOORD
        const rawResults = (await this.client.georadius(
          key,
          longitude,
          latitude,
          radiusKm,
          'km',
          'WITHDIST',
          'WITHCOORD',
        )) as [string, string, [string, string]][];

        return rawResults.map(([member, distStr, [coordLon, coordLat]]) => ({
          member,
          distanceKm: parseFloat(distStr),
          latitude: parseFloat(coordLat),
          longitude: parseFloat(coordLon),
        }));
      } catch (err) {
        log.warn('Redis georadius failed, falling back to memory', err);
      }
    }
    return await this.fallbackStore.geosearch(
      key,
      longitude,
      latitude,
      radiusKm,
    );
  }

  async zrem(key: string, member: string): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.zrem(key, member);
      } catch (err) {
        log.warn('Redis zrem failed, falling back to memory', err);
      }
    }
    return await this.fallbackStore.zrem(key, member);
  }

  async clearPrefix(prefix: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        const keys = await this.client.keys(`${prefix}*`);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch (err) {
        log.warn('Redis clearPrefix failed', err);
      }
    }
    await this.fallbackStore.clearKeyPrefix(prefix);
  }

  async countPrefix(prefix: string): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        const keys = await this.client.keys(`${prefix}*`);
        return keys.length;
      } catch (err) {
        log.warn('Redis countPrefix failed', err);
      }
    }
    return this.fallbackStore.countPrefix(prefix);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
      this.client = null;
      this.isConnected = false;
    }
  }
}

export const redis = new ResilientRedisManager();
