/**
 * EaglEs EyE — GBFS Micromobility Station Repository
 */

import { GbfsEntity } from '../domain/entities.js';
import { GeoPoint } from '../domain/types.js';
import { GeoRepository } from './repository.js';

export class GbfsRepository extends GeoRepository<GbfsEntity> {
  constructor() {
    super({
      collection: 'gbfs',
      defaultTtlSeconds: 30, // 30s TTL — stations update frequently
    });
  }

  async findAvailableNearby(
    point: GeoPoint,
    radiusKm: number,
  ): Promise<GbfsEntity[]> {
    const stations = await this.findNearby(point, radiusKm);
    return stations.filter((s) => s.isRenting && s.numBikesAvailable > 0);
  }

  async findBySystem(
    systemId: string,
    point: GeoPoint,
    radiusKm: number,
  ): Promise<GbfsEntity[]> {
    const stations = await this.findNearby(point, radiusKm);
    return stations.filter((s) => s.systemId === systemId);
  }
}

export const gbfsRepo = new GbfsRepository();
