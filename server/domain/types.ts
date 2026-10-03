/**
 * EaglEs EyE — Geospatial Domain Types
 * Foundational mathematical and spatial primitives.
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitude?: number; // meters above WGS84 ellipsoid
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface GeoRadius {
  center: GeoPoint;
  radiusKm: number;
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // [longitude, latitude][] rings
}

export interface GeoMultiPolygon {
  type: 'MultiPolygon';
  coordinates: [number, number][][][];
}

export type TelemetryStatus = 'live' | 'stale' | 'offline' | 'simulated';

export interface SpatialMetadata {
  source: string;
  observedAt: string; // ISO 8601
  ingestedAt: string; // ISO 8601
  expiresAt?: string; // ISO 8601
  status: TelemetryStatus;
  attribution?: string;
}

export interface BaseEntity {
  id: string;
  location: GeoPoint;
  metadata: SpatialMetadata;
}

export function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

export function calculateDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371; // Earth mean radius in km
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const sinDLat2 = Math.sin(dLat / 2);
  const sinDLon2 = Math.sin(dLon / 2);

  const h =
    sinDLat2 * sinDLat2 + Math.cos(lat1) * Math.cos(lat2) * sinDLon2 * sinDLon2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}
