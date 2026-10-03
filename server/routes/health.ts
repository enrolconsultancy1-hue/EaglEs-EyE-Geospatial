import { Router, Request, Response } from 'express';
import { config } from '../config.js';

export const healthRouter = Router();

healthRouter.get(['/', '/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'EaglEs EyE Geospatial Engine',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.env,
    providers: {
      cesium: Boolean(config.cesium.ionToken),
      googleMaps: Boolean(config.google.apiKey),
      openAi: Boolean(config.openai.apiKey),
      openSky: Boolean(config.opensky.username),
      nasaFirms: Boolean(config.firms.mapKey),
      aisStream: Boolean(config.ais.apiKey),
      tomtom: Boolean(config.tomtom.apiKey),
    },
  });
});
