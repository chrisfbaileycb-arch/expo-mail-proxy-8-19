/**
 * odds.test.ts — Tests for the trapdoor odds engine.
 */

import { describe, it, expect } from 'vitest';
import { spin } from '../src/odds.js';

/** Simple mulberry32 seeded PRNG for reproducible tests. */
function makeSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

describe('spin — trapdoor odds engine', () => {
  it('new guest: ~80% high-value over 1000 spins (expect 750–850)', () => {
    const rng = makeSeededRng(42);
    let highValueCount = 0;
    for (let i = 0; i < 1000; i++) {
      const result = spin(true, rng);
      if (result.tier === 'highValue') highValueCount++;
    }
    expect(highValueCount).toBeGreaterThanOrEqual(750);
    expect(highValueCount).toBeLessThanOrEqual(850);
  });

  it('repeat guest: ~10% high-value over 1000 spins (expect 60–140)', () => {
    const rng = makeSeededRng(99);
    let highValueCount = 0;
    for (let i = 0; i < 1000; i++) {
      const result = spin(false, rng);
      if (result.tier === 'highValue') highValueCount++;
    }
    expect(highValueCount).toBeGreaterThanOrEqual(60);
    expect(highValueCount).toBeLessThanOrEqual(140);
  });

  it('coupon code includes the prefix and reward name', () => {
    const rng = makeSeededRng(1);
    // Force high-value: rng first call < 0.8
    const result = spin(true, rng);
    // Result should include the reward code
    expect(result.couponCode).toMatch(/BOGO|PCT10/);
  });

  it('deterministic with same seed', () => {
    const rng1 = makeSeededRng(777);
    const rng2 = makeSeededRng(777);
    const r1 = spin(true, rng1);
    const r2 = spin(true, rng2);
    expect(r1.tier).toBe(r2.tier);
    expect(r1.couponCode).toBe(r2.couponCode);
  });

  it('returns tier and couponCode properties', () => {
    const rng = makeSeededRng(5);
    const result = spin(true, rng);
    expect(result).toHaveProperty('tier');
    expect(result).toHaveProperty('couponCode');
    expect(['highValue', 'standard']).toContain(result.tier);
    expect(typeof result.couponCode).toBe('string');
    expect(result.couponCode.length).toBeGreaterThan(0);
  });

  it('custom odds config is respected', () => {
    // Force all high-value for new guests
    const odds = {
      newGuest: { highValue: 1.0, standard: 0.0 },
      repeatGuest: { highValue: 0.0, standard: 1.0 },
    };
    const rng = makeSeededRng(100);
    const result = spin(true, rng, odds);
    expect(result.tier).toBe('highValue');
  });
});
