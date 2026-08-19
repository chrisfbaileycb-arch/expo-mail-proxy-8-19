/**
 * ratelimit.ts — In-memory, fixed-window rate limiter.
 *
 * Two independent counters:
 *   1. Per-IP address (first hop of X-Forwarded-For or req.ip)
 *   2. Per-identity (normalised email or phone string)
 *
 * Window: fixed 1-hour blocks aligned to the hour boundary (epoch-based).
 * Limits are env-tunable at import time; the clock is injectable for tests.
 *
 * No external deps.
 */

const HOUR_MS = 60 * 60 * 1000;

export const LEADS_RATE_PER_HOUR_IP =
  Number(process.env.LEADS_RATE_PER_HOUR_IP ?? 20);
export const LEADS_RATE_PER_HOUR_IDENTITY =
  Number(process.env.LEADS_RATE_PER_HOUR_IDENTITY ?? 5);

interface WindowEntry {
  windowStart: number;
  count: number;
}

/**
 * Determine which 1-hour window the given timestamp falls into.
 * Returns the epoch-ms of the start of that hour window.
 */
function windowStart(nowMs: number): number {
  return Math.floor(nowMs / HOUR_MS) * HOUR_MS;
}

export class RateLimiter {
  private readonly ipMap = new Map<string, WindowEntry>();
  private readonly identityMap = new Map<string, WindowEntry>();

  constructor(
    private readonly limitIp: number = LEADS_RATE_PER_HOUR_IP,
    private readonly limitIdentity: number = LEADS_RATE_PER_HOUR_IDENTITY,
    private readonly clock: () => number = Date.now,
  ) {}

  private hit(map: Map<string, WindowEntry>, key: string, limit: number): boolean {
    const now = this.clock();
    const ws = windowStart(now);
    const entry = map.get(key);
    if (!entry || entry.windowStart !== ws) {
      map.set(key, { windowStart: ws, count: 1 });
      return false; // under limit
    }
    entry.count += 1;
    return entry.count > limit;
  }

  /**
   * Check and record a request for the given IP.
   * Returns true when the IP is over the limit (should be rejected).
   */
  checkIp(ip: string): boolean {
    return this.hit(this.ipMap, ip, this.limitIp);
  }

  /**
   * Check and record a request for a given identity string (email or phone).
   * Returns true when the identity is over the limit (should be rejected).
   */
  checkIdentity(identity: string): boolean {
    return this.hit(this.identityMap, identity, this.limitIdentity);
  }

  /** Flush all windows — for testing only. */
  clear(): void {
    this.ipMap.clear();
    this.identityMap.clear();
  }
}

/** Singleton instance used by createApp unless overridden via deps. */
export const defaultRateLimiter = new RateLimiter();
