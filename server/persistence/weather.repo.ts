/**
 * EaglEs EyE — Weather Observation Repository
 * Stores weather data keyed by a generated geo-hash id.
 */

import { BaseEntity, GeoPoint } from '../domain/types.js';
import { GeoRepository } from './repository.js';

export interface WeatherObservationEntity extends BaseEntity {
  temperatureCelsius?: number;
  feelsLikeCelsius?: number;
  humidity?: number; // 0–100 %
  windSpeedMs?: number;
  windDirectionDeg?: number;
  precipitationMmPerHr?: number;
  cloudCoverPercent?: number;
  visibilityKm?: number;
  pressureMb?: number;
  conditionCode?: number; // WMO condition code
  conditionText?: string;
  source: 'open-meteo' | 'nws' | 'meteo-france' | 'ecmwf';
}

export class WeatherRepository extends GeoRepository<WeatherObservationEntity> {
  constructor() {
    super({
      collection: 'weather',
      defaultTtlSeconds: 300, // 5 min TTL for weather observations
    });
  }

  async findClosestObservation(
    point: GeoPoint,
    radiusKm = 50,
  ): Promise<WeatherObservationEntity | null> {
    const results = await this.findNearby(point, radiusKm);
    if (results.length === 0) return null;
    return results[0]; // Already sorted by distance (nearest first)
  }
}

export const weatherRepo = new WeatherRepository();
