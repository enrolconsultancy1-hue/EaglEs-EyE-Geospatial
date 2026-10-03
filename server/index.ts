import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { createLogger } from './logger.js';
import { healthRouter } from './routes/health.js';

const log = createLogger('Server');

export const app = express();

// Security & Parsing Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  log.debug(`${req.method} ${req.originalUrl}`);
  next();
});

// Mount API routes
app.use('/api', healthRouter);

// 404 handler for unrecognized /api routes
app.use('/api/*', (req: Request, res: Response) => {
  log.warn(`Endpoint not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint '${req.originalUrl}' does not exist on EaglEs EyE Gateway.`,
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  log.error('Unhandled server error', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
});

// Start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(config.port, config.host, () => {
    log.info(
      `🦅 EaglEs EyE Gateway online at http://${config.host}:${config.port}`,
    );
    log.info(
      `Health check available at http://${config.host}:${config.port}/api`,
    );
  });

  const shutdown = (signal: string) => {
    log.info(
      `Received ${signal}. Shutting down EaglEs EyE server gracefully...`,
    );
    server.close(() => {
      log.info('EaglEs EyE server shut down.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
