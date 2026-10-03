/**
 * EaglEs EyE — Persistence Layer Barrel Export
 * Centralised access to all repositories and the Redis manager.
 */

export { redis } from './redis.js';
export { GeoRepository } from './repository.js';
export { cctvRepo, CctvRepository } from './cctv.repo.js';
export { flightsRepo, FlightsRepository } from './flights.repo.js';
export { vesselsRepo, VesselsRepository } from './vessels.repo.js';
export { firmsRepo, FirmsRepository } from './firms.repo.js';
export { gbfsRepo, GbfsRepository } from './gbfs.repo.js';
export {
  militaryInstallationsRepo,
  MilitaryInstallationsRepository,
} from './military.repo.js';
export { weatherRepo, WeatherRepository } from './weather.repo.js';

export type { RepositoryOptions } from './repository.js';
export type { RedisGeoResult } from './redis.js';
export type { WeatherObservationEntity } from './weather.repo.js';
