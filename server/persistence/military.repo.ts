/**
 * EaglEs EyE — Military Installations Repository
 */

import { MilitaryInstallationsEntity } from '../domain/entities.js';
import { GeoRepository } from './repository.js';

export class MilitaryInstallationsRepository extends GeoRepository<MilitaryInstallationsEntity> {
  constructor() {
    super({
      collection: 'military',
      defaultTtlSeconds: 86400, // 24h — static reference data
    });
  }

  async findActive(): Promise<MilitaryInstallationsEntity[]> {
    const count = await this.count();
    if (count === 0) return [];
    // findNearby with planet-scale radius as a full-scan
    return await this.findNearby({ latitude: 0, longitude: 0 }, 20100); // ~half-earth circumference
  }
}

export const militaryInstallationsRepo = new MilitaryInstallationsRepository();
