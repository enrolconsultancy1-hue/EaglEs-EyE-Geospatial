/**
 * EaglEs EyE — Extracted Domain Entities
 * Fully-typed entity specifications extracted from KNOX blueprint.
 */

import { BaseEntity, GeoPoint, GeoPolygon, GeoMultiPolygon } from './types.js';

// ============================================================================
// 1. CCTV Camera Entity
// ============================================================================
export type CctvFeedType =
  'hls' | 'image' | 'mjpeg' | 'streetview' | 'synthetic';

export interface CctvEntity extends BaseEntity {
  name: string;
  sourceProvider: string; // e.g. 'Caltrans', 'TxDOT', 'NYCDOT'
  feedType: CctvFeedType;
  streamUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  heading?: number; // 0-360 degrees
  refreshIntervalMs?: number;
  roadOrHighway?: string;
  city?: string;
  stateOrRegion?: string;
}

// ============================================================================
// 2. Tropical Cyclones & Atmospheric Storm Entities
// ============================================================================
export interface CycloneTrackPoint {
  timestamp: string;
  location: GeoPoint;
  maxWindKnots: number;
  minPressureMb?: number;
  category: number; // 1-5 or 0 for tropical storm/depression
  forecastType: 'historical' | 'current' | 'forecast';
}

export interface CycloneEntity extends BaseEntity {
  stormId: string; // e.g. 'AL092026'
  name: string;
  basin:
    | 'Atlantic'
    | 'Eastern Pacific'
    | 'Central Pacific'
    | 'Western Pacific'
    | 'Indian Ocean'
    | 'Southern Hemisphere';
  category: number; // Saffir-Simpson 1-5 (0 = depression/storm)
  windSpeedKnots: number;
  centralPressureMb?: number;
  movementDirectionDeg?: number;
  movementSpeedKnots?: number;
  track: CycloneTrackPoint[];
  forecastCone?: GeoPolygon;
}

export interface CyclonesEntity {
  basinSummary: Record<string, number>;
  activeStorms: CycloneEntity[];
  lastUpdated: string;
}

// ============================================================================
// 3. Fire Perimeters Entity
// ============================================================================
export interface FirePerimetersEntity extends BaseEntity {
  incidentName: string;
  incidentId: string;
  acresBurned: number;
  percentContained: number;
  agencyResponsible: string; // e.g., 'USFS', 'CAL FIRE'
  perimeterGeometry: GeoPolygon | GeoMultiPolygon;
  discoveryDate?: string;
  activeFuelTypes?: string[];
}

// ============================================================================
// 4. NASA FIRMS Thermal Anomaly / Hotspot Entity
// ============================================================================
export interface FirmsEntity extends BaseEntity {
  satellite: 'MODIS' | 'VIIRS_SNPP' | 'VIIRS_NOAA20' | 'VIIRS_NOAA21';
  brightness: number; // Kelvin (e.g. brightness temperature channel 21/22)
  frp: number; // Fire Radiative Power (MW)
  confidence: 'low' | 'nominal' | 'high' | number; // percentage or category
  acquisitionDate: string; // YYYY-MM-DD
  acquisitionTime: string; // HHMM UTC
  dayNight: 'D' | 'N';
}

// ============================================================================
// 5. GBFS (General Bikeshare Feed Specification) Entity
// ============================================================================
export interface GbfsEntity extends BaseEntity {
  stationId: string;
  systemId: string;
  name: string;
  address?: string;
  capacity: number;
  numBikesAvailable: number;
  numEbikesAvailable?: number;
  numDocksAvailable: number;
  isInstalled: boolean;
  isRenting: boolean;
  isReturning: boolean;
  lastReported: string;
}

// ============================================================================
// 6. Local Radio / SDR / ADS-B Receiver Entity
// ============================================================================
export interface LocalReceiversEntity extends BaseEntity {
  receiverId: string;
  name: string;
  hardwareType: 'RTL-SDR' | 'HackRF' | 'Airspy' | 'BladeRF' | 'Virtual';
  tunedFrequencyHz: number;
  sampleRateHz: number;
  antennaGainDb?: number;
  signalStrengthDbm?: number;
  activeFeed: 'adsb' | 'ais' | 'airband' | 'marine-vhf' | 'custom';
}

// ============================================================================
// 7. Military Installations & Defense Sites Entity
// ============================================================================
export interface MilitaryInstallationsEntity extends BaseEntity {
  siteName: string;
  branch:
    | 'Army'
    | 'Navy'
    | 'Air Force'
    | 'Marines'
    | 'Space Force'
    | 'Coast Guard'
    | 'Joint'
    | 'NATO'
    | 'Allied';
  facilityType:
    | 'Air Base'
    | 'Naval Base'
    | 'Barracks'
    | 'Proving Ground'
    | 'Radar Station'
    | 'Command Bunker'
    | 'Depot';
  countryCode: string;
  boundary?: GeoPolygon;
  operationalStatus: 'Active' | 'Reserve' | 'Decommissioned';
}

// ============================================================================
// 8. OpenAI Interaction & Telemetry Context Entity
// ============================================================================
export interface OpenaiEntity {
  id: string;
  timestamp: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  costUsd?: number;
  featureContext: 'hud-summary' | 'tactical-brief' | 'voice-command' | 'geo-qa';
  success: boolean;
}

// ============================================================================
// 9. OpenAI Realtime & WebRTC Voice Session Entities
// ============================================================================
export interface OpenAiRealtimeEntity {
  sessionId: string;
  clientSecretToken: string; // Ephemeral bearer token
  expiresAt: string;
  model: string;
  voice:
    | 'alloy'
    | 'ash'
    | 'ballad'
    | 'coral'
    | 'echo'
    | 'sage'
    | 'shimmer'
    | 'verse';
  inputAudioFormat: 'pcm16' | 'g711_ulaw' | 'g711_alaw';
  outputAudioFormat: 'pcm16' | 'g711_ulaw' | 'g711_alaw';
  turnDetection: {
    type: 'server_vad';
    threshold: number;
    prefixPaddingMs: number;
    silenceDurationMs: number;
  } | null;
}

export interface RealtimeEntity {
  eventType:
    | 'session.created'
    | 'conversation.item.created'
    | 'response.audio.delta'
    | 'error';
  timestamp: string;
  payload: Record<string, unknown>;
}

// ============================================================================
// 10. OpenStreetMap Overpass Geospatial Feature Entity
// ============================================================================
export interface OverpassEntity extends BaseEntity {
  osmId: number;
  osmType: 'node' | 'way' | 'relation';
  featureCategory:
    | 'highway'
    | 'building'
    | 'power'
    | 'waterway'
    | 'aeroway'
    | 'military'
    | 'telecom';
  tags: Record<string, string>;
  geometry?: GeoPoint[] | GeoPolygon;
}

// ============================================================================
// 11. Aviation ADS-B Flight Entity
// ============================================================================
export interface FlightEntity extends BaseEntity {
  icao24: string; // 24-bit ICAO transponder address (hex)
  callsign?: string;
  originCountry: string;
  baroAltitudeMeters?: number;
  geoAltitudeMeters?: number;
  velocityMps?: number; // True airspeed or ground speed in m/s
  headingDegrees?: number; // 0-360 deg
  verticalRateMps?: number;
  squawk?: string;
  onGround: boolean;
  category?: number; // Aircraft category
  isMilitary: boolean;
}

// ============================================================================
// 12. Maritime AIS Vessel Entity
// ============================================================================
export interface VesselEntity extends BaseEntity {
  mmsi: number; // Maritime Mobile Service Identity
  shipName?: string;
  callsign?: string;
  imo?: number;
  vesselType: string; // e.g. Cargo, Tanker, Passenger, Fishing, Military
  speedOverGroundKnots?: number;
  courseOverGroundDegrees?: number;
  trueHeadingDegrees?: number;
  navigationStatus?: string; // Under way using engine, At anchor, Moored
  destination?: string;
  eta?: string;
  dimensions?: {
    lengthMeters: number;
    widthMeters: number;
    draftMeters?: number;
  };
}
