/**
 * EaglEs EyE — Generic Geospatial Repository
 * Implements high-throughput spatial indexing on top of Redis / In-Memory Store.
 */

import {
  BaseEntity,
  BoundingBox,
  GeoPoint,
  calculateDistanceKm,
} from '../domain/types.js';
import { config } from '../config.js';
import { redis } from './redis.js';

export interface RepositoryOptions {
  collection: string;
  defaultTtlSeconds?: number;
}

export class GeoRepository<T extends BaseEntity> {
  protected collection: string;
  protected defaultTtlSeconds?: number;
  protected keyPrefix: string;

  constructor(options: RepositoryOptions) {
    this.collection = options.collection;
    this.defaultTtlSeconds = options.defaultTtlSeconds;
    this.keyPrefix = `${config.redis.keyPrefix}${this.collection}:`;
  }

  protected getEntityKey(id: string): string {
    return `${this.keyPrefix}entity:${id}`;
  }

  protected getGeoKey(): string {
    return `${this.keyPrefix}geo`;
  }

  async save(entity: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    const entityKey = this.getEntityKey(entity.id);
    const geoKey = this.getGeoKey();

    // 1. Store entity serialized JSON
    await redis.set(entityKey, JSON.stringify(entity), ttl);

    // 2. Index in Geospatial Sorted Set
    await redis.geoadd(
      geoKey,
      entity.location.longitude,
      entity.location.latitude,
      entity.id,
    );
  }

  async saveBatch(entities: T[], ttlSeconds?: number): Promise<void> {
    await Promise.all(entities.map((e) => this.save(e, ttlSeconds)));
  }

  async findById(id: string): Promise<T | null> {
    const raw = await redis.get(this.getEntityKey(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async findNearby(point: GeoPoint, radiusKm: number): Promise<T[]> {
    const geoKey = this.getGeoKey();
    const geoResults = await redis.geosearch(
      geoKey,
      point.longitude,
      point.latitude,
      radiusKm,
    );

    if (geoResults.length === 0) return [];

    // Fetch entities by member id
    const entities: T[] = [];
    for (const res of geoResults) {
      const entity = await this.findById(res.member);
      if (entity) {
        entities.push(entity);
      } else {
        // Orphaned geo member (TTL expired on entity). Clean up asynchronously.
        redis.zrem(geoKey, res.member).catch(() => {});
      }
    }

    return entities;
  }

  async findInBoundingBox(bbox: BoundingBox): Promise<T[]> {
    // Calculate center point of bounding box
    const centerLat = (bbox.minLat + bbox.maxLat) / 2;
    const centerLon = (bbox.minLon + bbox.maxLon) / 2;
    const center: GeoPoint = { latitude: centerLat, longitude: centerLon };

    // Circumscribe radius to cover entire box
    const corner: GeoPoint = { latitude: bbox.maxLat, longitude: bbox.maxLon };
    const radiusKm = calculateDistanceKm(center, corner);

    const candidates = await this.findNearby(center, radiusKm);

    // Filter strictly inside the bounding box
    return candidates.filter((item) => {
      const { latitude, longitude } = item.location;
      return (
        latitude >= bbox.minLat &&
        latitude <= bbox.maxLat &&
        longitude >= bbox.minLon &&
        longitude <= bbox.maxLon
      );
    });
  }

  async delete(id: string): Promise<boolean> {
    const entityKey = this.getEntityKey(id);
    const geoKey = this.getGeoKey();

    const delCount = await redis.del(entityKey);
    await redis.zrem(geoKey, id);

    return delCount > 0;
  }

  async count(): Promise<number> {
    return await redis.countPrefix(`${this.keyPrefix}entity:`);
  }

  async clear(): Promise<void> {
    await redis.clearPrefix(this.keyPrefix);
  }
}
