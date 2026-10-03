import test from 'node:test';
import assert from 'node:assert/strict';

test('Phase 3 Persistence Layer Verification', async (t) => {
  const { GeoRepository } = await import('../server/persistence/repository.ts');
  const { isValidCoordinate } = await import('../server/domain/types.ts');

  // ------------------------------------------------------------------
  // Shared test entity factory
  // ------------------------------------------------------------------
  const makeEntity = (id, lat, lon) => ({
    id,
    location: { latitude: lat, longitude: lon },
    metadata: {
      source: 'test',
      observedAt: new Date().toISOString(),
      ingestedAt: new Date().toISOString(),
      status: 'live',
    },
  });

  await t.test('GeoRepository instantiates cleanly', async () => {
    const repo = new GeoRepository({
      collection: 'test-entities',
      defaultTtlSeconds: 60,
    });
    assert.ok(repo, 'Repository should be instantiable');
    assert.equal(typeof repo.save, 'function');
    assert.equal(typeof repo.findNearby, 'function');
    assert.equal(typeof repo.findInBoundingBox, 'function');
    assert.equal(typeof repo.delete, 'function');
  });

  await t.test('save() and findById() round-trip works', async () => {
    const repo = new GeoRepository({ collection: 'test-roundtrip' });
    const entity = makeEntity('e001', 37.7749, -122.4194);

    await repo.save(entity);
    const fetched = await repo.findById('e001');

    assert.ok(fetched, 'findById should return the saved entity');
    assert.equal(fetched.id, 'e001');
    assert.ok(
      isValidCoordinate(fetched.location.latitude, fetched.location.longitude),
    );
    await repo.clear();
  });

  await t.test('findNearby() returns spatially correct entities', async () => {
    const repo = new GeoRepository({ collection: 'test-nearby' });

    // San Francisco area
    const sf = makeEntity('sf-001', 37.7749, -122.4194);
    const close = makeEntity('close-001', 37.78, -122.41); // ~1 km from SF
    const far = makeEntity('far-001', 40.7128, -74.006); // NYC — ~4000 km from SF

    await repo.saveBatch([sf, close, far]);

    const sfCenter = { latitude: 37.7749, longitude: -122.4194 };
    const nearby = await repo.findNearby(sfCenter, 5); // 5 km radius

    const ids = nearby.map((e) => e.id);
    assert.ok(ids.includes('sf-001'), 'Should find entity at SF coordinates');
    assert.ok(ids.includes('close-001'), 'Should find entity 1 km away');
    assert.ok(
      !ids.includes('far-001'),
      'Should NOT find NYC entity within 5 km radius of SF',
    );

    await repo.clear();
  });

  await t.test('findInBoundingBox() filters by exact bounds', async () => {
    const repo = new GeoRepository({ collection: 'test-bbox' });

    const inside = makeEntity('inside-001', 37.78, -122.41);
    const outside = makeEntity('outside-001', 34.05, -118.24); // LA

    await repo.saveBatch([inside, outside]);

    // SF Bay Area bounding box
    const bbox = { minLat: 37.0, maxLat: 38.5, minLon: -123.5, maxLon: -121.5 };
    const results = await repo.findInBoundingBox(bbox);
    const ids = results.map((e) => e.id);

    assert.ok(
      ids.includes('inside-001'),
      'Should find entity inside bounding box',
    );
    assert.ok(
      !ids.includes('outside-001'),
      'Should NOT find entity outside bounding box',
    );

    await repo.clear();
  });

  await t.test('delete() removes entity and returns true', async () => {
    const repo = new GeoRepository({ collection: 'test-delete' });
    const entity = makeEntity('del-001', 48.8566, 2.3522); // Paris

    await repo.save(entity);
    const deleted = await repo.delete('del-001');
    const refetch = await repo.findById('del-001');

    assert.equal(
      deleted,
      true,
      'delete() should return true for existing entity',
    );
    assert.equal(refetch, null, 'findById should return null after deletion');

    await repo.clear();
  });

  await t.test('count() tracks stored entities accurately', async () => {
    const repo = new GeoRepository({ collection: 'test-count' });

    await repo.saveBatch([
      makeEntity('cnt-1', 51.5074, -0.1278),
      makeEntity('cnt-2', 48.8566, 2.3522),
      makeEntity('cnt-3', 52.52, 13.405),
    ]);

    const count = await repo.count();
    assert.ok(count >= 3, `Expected at least 3 entities, got ${count}`);

    await repo.clear();
  });

  await t.test('FlightsRepository military filtering', async () => {
    const { flightsRepo } =
      await import('../server/persistence/flights.repo.ts');
    assert.equal(typeof flightsRepo.findMilitaryNearby, 'function');
  });

  await t.test('FirmsRepository confidence filtering', async () => {
    const { firmsRepo } = await import('../server/persistence/firms.repo.ts');
    assert.equal(typeof firmsRepo.findHighConfidenceNearby, 'function');
  });
});
