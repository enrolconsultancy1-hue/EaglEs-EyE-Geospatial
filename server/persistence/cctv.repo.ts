/**
 * EaglEs EyE — CCTV Geospatial Repository
 */

import { CctvEntity } from '../domain/entities.js';
import { GeoPoint } from '../domain/types.js';
import { GeoRepository } from './repository.js';

export class CctvRepository extends GeoRepository<CctvEntity> {
  constructor() {
    super({
      collection: 'cctv',
      defaultTtlSeconds: 3600, // 1 hour TTL for static camera metadata
    });
  }

  async findLiveStreamsNearby(
    point: GeoPoint,
    radiusKm: number,
  ): Promise<CctvEntity[]> {
    const cameras = await this.findNearby(point, radiusKm);
    return cameras.filter(
      (cam) => cam.streamUrl !== undefined || cam.feedType === 'hls',
    );
  }
}

export const cctvRepo = new CctvRepository();
