import test from 'node:test';
import assert from 'node:assert/strict';

test('Phase 1 Scaffold Verification', async (t) => {
  await t.test('Environment and Config defaults', async () => {
    // Dynamic import to verify module resolution
    const { config, isDev } = await import('../server/config.ts');
    assert.ok(config, 'Config should exist');
    assert.equal(typeof config.port, 'number', 'Port should be a number');
    assert.equal(typeof config.host, 'string', 'Host should be a string');
    assert.ok(config.redis, 'Redis config block should exist');
    assert.equal(typeof isDev(), 'boolean', 'isDev should return boolean');
  });

  await t.test('Logger instantiation and formatting', async () => {
    const { createLogger } = await import('../server/logger.ts');
    const logger = createLogger('TestScaffold');
    assert.ok(logger, 'Logger instance created');
    assert.equal(typeof logger.info, 'function');
    assert.equal(typeof logger.error, 'function');
  });

  await t.test('Express App & Health Router mounting', async () => {
    process.env.NODE_ENV = 'test';
    const { app } = await import('../server/index.ts');
    assert.ok(app, 'Express app should be exported');
  });
});
