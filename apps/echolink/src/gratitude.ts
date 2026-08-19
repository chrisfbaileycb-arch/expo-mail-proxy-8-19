/**
 * gratitude.ts — Gratitude loop scheduler.
 *
 * When a lead opts in (via /spin), schedule a delayed "thank you" touch.
 * After a campaign runs, reconcile registrant coupon codes against actual
 * transactions to split them into two owner-video tracks:
 *   - pathA_unredeemed: leads who got a coupon but never redeemed it
 *   - pathB_redeemed:   leads who got a coupon AND redeemed it at POS
 *
 * Module-level API (onOptIn, dueTouches, etc.) is unchanged — all existing
 * tests still pass.
 *
 * GratitudeStore provides an injectable, optionally-durable alternative used
 * by createApp when a dataDir is supplied.
 */

import type { NormalizedTransaction } from '@expo-proxy/shared';
import { SnapshotStore } from '@expo-proxy/shared';

const GRATITUDE_DELAY_MS = Number(process.env.GRATITUDE_DELAY_MS ?? 4 * 60 * 60 * 1000);

export interface GratitudeLead {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  couponCode: string;
  /** Org that created this lead — used for lifecycle purge. */
  orgId?: string;
}

interface ScheduledTouch {
  lead: GratitudeLead;
  dueAt: number; // epoch ms
}

/** In-memory store of pending gratitude touches. */
const pending: ScheduledTouch[] = [];

/**
 * Schedule a delayed gratitude touch when a lead opts in.
 *
 * @param lead   The lead who just opted in.
 * @param clock  Injectable clock function returning epoch ms (default Date.now).
 */
export function onOptIn(lead: GratitudeLead, clock: () => number = Date.now): void {
  pending.push({
    lead,
    dueAt: clock() + GRATITUDE_DELAY_MS,
  });
}

/**
 * Return all touches that are due at or before `now` and remove them
 * from the pending queue (so a cron/n8n tick can drain them exactly once).
 *
 * @param now  Current epoch ms (default Date.now()).
 */
export function dueTouches(now: number = Date.now()): GratitudeLead[] {
  const due: ScheduledTouch[] = [];
  const remaining: ScheduledTouch[] = [];

  for (const touch of pending) {
    if (touch.dueAt <= now) {
      due.push(touch);
    } else {
      remaining.push(touch);
    }
  }

  // Drain the due items from the pending array
  pending.length = 0;
  pending.push(...remaining);

  return due.map((t) => t.lead);
}

export interface ReconcileResult {
  pathA_unredeemed: GratitudeLead[];
  pathB_redeemed: GratitudeLead[];
}

/**
 * One week after a campaign: cross-reference registrant coupon codes against
 * actual POS transactions. Leads whose coupon appears in a transaction's
 * promo_code go to pathB (redeemed); the rest go to pathA (unredeemed).
 *
 * @param registrants  All leads from the campaign.
 * @param txs          Transactions to check against (NormalizedTransaction[]).
 */
export function reconcileCampaign(
  registrants: GratitudeLead[],
  txs: NormalizedTransaction[],
): ReconcileResult {
  // Build a set of redeemed promo codes from transactions
  const redeemedCodes = new Set<string>();
  for (const tx of txs) {
    if (tx.promo_code) {
      redeemedCodes.add(tx.promo_code.toUpperCase());
    }
  }

  const pathA_unredeemed: GratitudeLead[] = [];
  const pathB_redeemed: GratitudeLead[] = [];

  for (const lead of registrants) {
    if (redeemedCodes.has(lead.couponCode.toUpperCase())) {
      pathB_redeemed.push(lead);
    } else {
      pathA_unredeemed.push(lead);
    }
  }

  return { pathA_unredeemed, pathB_redeemed };
}

/** Clear pending touches (for testing). */
export function clearPending(): void {
  pending.length = 0;
}

/**
 * Remove all scheduled touches for the given orgId.
 * Returns the count of removed entries.
 */
export function purgeGratitudeByOrg(orgId: string): number {
  const before = pending.length;
  const remaining = pending.filter((t) => t.lead.orgId !== orgId);
  pending.length = 0;
  pending.push(...remaining);
  return before - pending.length;
}

/** Get pending count (for testing). */
export function pendingCount(): number {
  return pending.length;
}

// ---------------------------------------------------------------------------
// GratitudeStore — injectable, optionally-durable alternative to module globals
// ---------------------------------------------------------------------------

interface ScheduledTouchSerial {
  lead: GratitudeLead;
  dueAt: number;
}

export interface GratitudeStoreOptions {
  dataDir?: string;
}

export class GratitudeStore {
  private readonly touches: ScheduledTouch[] = [];
  private readonly snap: SnapshotStore<ScheduledTouchSerial[]> | null;

  constructor(opts: GratitudeStoreOptions = {}) {
    if (opts.dataDir) {
      this.snap = new SnapshotStore<ScheduledTouchSerial[]>({ dir: opts.dataDir, name: 'gratitude' });
      const saved = this.snap.load();
      if (saved) {
        this.touches.push(...saved);
      }
    } else {
      this.snap = null;
    }
  }

  private _save(): void {
    if (!this.snap) return;
    // Telemetry-adjacent path — failure logged but not thrown.
    try {
      this.snap.save(this.touches.map((t) => ({ lead: t.lead, dueAt: t.dueAt })));
    } catch (e) {
      console.error(JSON.stringify({
        service: 'echolink',
        event: 'gratitude_store_save_failed',
        error: (e as Error).message,
        at: new Date().toISOString(),
      }));
    }
  }

  onOptIn(lead: GratitudeLead, clock: () => number = Date.now): void {
    this.touches.push({ lead, dueAt: clock() + GRATITUDE_DELAY_MS });
    this._save();
  }

  dueTouches(now: number = Date.now()): GratitudeLead[] {
    const due: ScheduledTouch[] = [];
    const remaining: ScheduledTouch[] = [];
    for (const touch of this.touches) {
      if (touch.dueAt <= now) due.push(touch);
      else remaining.push(touch);
    }
    this.touches.length = 0;
    this.touches.push(...remaining);
    this._save();
    return due.map((t) => t.lead);
  }

  clear(): void {
    this.touches.length = 0;
  }

  /** Remove all touches for leads tagged with orgId. Returns count removed. */
  purgeByOrg(orgId: string): number {
    const before = this.touches.length;
    const remaining = this.touches.filter((t) => t.lead.orgId !== orgId);
    this.touches.length = 0;
    this.touches.push(...remaining);
    const removed = before - this.touches.length;
    if (removed > 0) this._save();
    return removed;
  }
}
