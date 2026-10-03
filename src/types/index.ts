/**
 * EaglEs EyE — Frontend Type Definitions & Re-exports
 */

export * from '../../server/domain/types.js';
export * from '../../server/domain/entities.js';

export type LayerCategory =
  | 'aviation'
  | 'maritime'
  | 'weather'
  | 'disasters'
  | 'urban'
  | 'space'
  | 'infrastructure'
  | 'defense';

export interface LayerDescriptor {
  id: string;
  name: string;
  category: LayerCategory;
  description: string;
  icon: string;
  color: string;
  enabledByDefault: boolean;
  refreshIntervalMs: number;
}

export interface HudTelemetryState {
  utcTime: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  cameraAltitudeKm: number;
  activeEntityCount: number;
  gatewayConnected: boolean;
}
