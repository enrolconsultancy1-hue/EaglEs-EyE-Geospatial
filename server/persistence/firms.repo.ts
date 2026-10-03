/**
 * EaglEs EyE — NASA FIRMS Thermal Anomaly Repository
 */

import { FirmsEntity } from '../domain/entities.js';
import { GeoPoint } from '../domain/types.js';
import { GeoRepository } from './repository.js';

export class FirmsRepository extends GeoRepository<FirmsEntity> {
  constructor() {
    super({
      collection: 'firms',
      defaultTtlSeconds: 600, // 10 min TTL for satellite hotspot passes
    });
  }

  async findHighConfidenceNearby(
    point: GeoPoint,
    radiusKm: number,
  ): Promise<FirmsEntity[]> {
    const hotspots = await this.findNearby(point, radiusKm);
    return hotspots.filter((h) => h.confidence === 'high');
  }

  async findBySatellite(
    satellite: FirmsEntity['satellite'],
    point: GeoPoint,
    radiusKm: number,
  ): Promise<FirmsEntity[]> {
    const hotspots = await this.findNearby(point, radiusKm);
    return hotspots.filter((h) => h.satellite === satellite);
  }
}

export const firmsRepo = new FirmsRepository();
