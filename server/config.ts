import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AppConfig {
  env: 'development' | 'production' | 'test';
  host: string;
  port: number;
  corsOrigin: string;

  // Persistence
  redis: {
    url: string;
    keyPrefix: string;
  };

  // Telemetry & Geospatial Providers
  cesium: {
    ionToken: string;
  };

  google: {
    apiKey: string;
    serverApiKey: string;
    rateLimitPerMin: number;
  };

  openai: {
    apiKey: string;
    realtimeModel: string;
  };

  opensky: {
    username?: string;
    password?: string;
  };

  firms: {
    mapKey?: string;
  };

  ais: {
    apiKey?: string;
  };

  tomtom: {
    apiKey?: string;
  };
}

function getEnvNumber(key: string, defaultValue: number): number {
  const val = process.env[key];
  if (!val) return defaultValue;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const config: AppConfig = {
  env: (process.env.NODE_ENV as AppConfig['env']) || 'development',
  host: process.env.HOST || 'localhost',
  port: getEnvNumber('SERVER_PORT', 3001),
  corsOrigin: process.env.CORS_ORIGIN || '*',

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    keyPrefix: process.env.REDIS_PREFIX || 'ee:',
  },

  cesium: {
    ionToken: process.env.CESIUM_ION_TOKEN || '',
  },

  google: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    serverApiKey:
      process.env.GOOGLE_MAPS_SERVER_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '',
    rateLimitPerMin: getEnvNumber('GEV_RATELIMIT_GOOGLE_PER_MIN', 60),
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    realtimeModel: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2',
  },

  opensky: {
    username: process.env.OPENSKY_USERNAME,
    password: process.env.OPENSKY_PASSWORD,
  },

  firms: {
    mapKey: process.env.NASA_FIRMS_MAP_KEY,
  },

  ais: {
    apiKey: process.env.AISSTREAM_API_KEY,
  },

  tomtom: {
    apiKey: process.env.TOMTOM_API_KEY,
  },
};

export const isDev = (): boolean => config.env === 'development';
export const isProd = (): boolean => config.env === 'production';
export const isTest = (): boolean => config.env === 'test';
