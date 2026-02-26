import { describe, expect, it } from 'vitest';
import { haversineDistanceMeters, isInsideRadius } from '@/lib/geofence';

describe('geofence', () => {
  it('calculates realistic distance', () => {
    const d = haversineDistanceMeters(
      { latitude: -26.2041, longitude: 28.0473 },
      { latitude: -26.2051, longitude: 28.0473 }
    );
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(120);
  });

  it('checks radius', () => {
    expect(isInsideRadius({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0.0001 }, 20)).toBe(true);
    expect(isInsideRadius({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0.01 }, 20)).toBe(false);
  });
});
