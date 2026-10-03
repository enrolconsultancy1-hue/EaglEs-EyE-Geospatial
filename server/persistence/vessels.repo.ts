/**
 * EaglEs EyE — Maritime Vessels Geospatial Repository
 */

import { VesselEntity } from '../domain/entities.js';
import { GeoPoint } from '../domain/types.js';
import { GeoRepository } from './repository.js';

export class VesselsRepository extends GeoRepository<VesselEntity> {
  constructor() {
    super({
      collection: 'vessels',
      defaultTtlSeconds: 120, // 2 min TTL for AIS transponder positions
    });
  }

  async findByMmsi(mmsi: number): Promise<VesselEntity | null> {
    return await this.findById(String(mmsi));
  }

  async findByVesselType(
    vesselType: string,
    point: GeoPoint,
    radiusKm: number,
  ): Promise<VesselEntity[]> {
    const vessels = await this.findNearby(point, radiusKm);
    return vessels.filter(
      (v) => v.vesselType.toLowerCase() === vesselType.toLowerCase(),
    );
  }
}

export const vesselsRepo = new VesselsRepository();
