/**
 * EaglEs EyE — Aviation Flights Geospatial Repository
 */

import { FlightEntity } from '../domain/entities.js';
import { GeoPoint } from '../domain/types.js';
import { GeoRepository } from './repository.js';

export class FlightsRepository extends GeoRepository<FlightEntity> {
  constructor() {
    super({
      collection: 'flights',
      defaultTtlSeconds: 60, // 60s TTL for active aircraft transponders
    });
  }

  async findByIcao24(icao24: string): Promise<FlightEntity | null> {
    return await this.findById(icao24.toLowerCase());
  }

  async findMilitaryNearby(
    point: GeoPoint,
    radiusKm: number,
  ): Promise<FlightEntity[]> {
    const flights = await this.findNearby(point, radiusKm);
    return flights.filter((f) => f.isMilitary);
  }
}

export const flightsRepo = new FlightsRepository();
