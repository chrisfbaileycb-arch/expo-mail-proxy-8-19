/**
 * drip.ts — Slow-trickle drip campaign queue.
 *
 * Enqueues leads for a campaign and releases them at a flat daily rate
 * over a configurable window (default 30 days). Each release is idempotent
 * per calendar date — calling releaseDaily twice on the same date returns
 * an empty array the second time.
 *
 * Each released lead gets a watch-to-unlock video payload with a coupon code.
 *
 * Module-level API (enqueueLeads, allocate, releaseDaily, etc.) uses the
 * module-level `campaigns` map — unchanged, all existing tests still pass.
 *
 * DripStore class provides an injectable, optionally-durable alternative
 * used by createApp when a dataDir is supplied.
 */
import { SnapshotStore } from '@expo-proxy/shared';

export interface Lead {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  couponCode: string;
  /** Org that created this lead — used for lifecycle purge. */
  orgId?: string;
}

export interface VideoPayload {
  videoUrl: string;
  revealAtSeconds: number;
  couponCode: string;
}

export interface ReleasedLead extends Lead {
  videoPayload: VideoPayload;
}

interface CampaignState {
  leads: Lead[];
  dailyRate: number;
  releasedDates: Map<string, number>; // date string -> count released
  releasedTotal: number;
}

// Serialisable form of CampaignState (Map → plain object).
interface SerialCampaignState {
  leads: Lead[];
  dailyRate: number;
  releasedDates: Record<string, number>;
  releasedTotal: number;
}

type DripSnapshot = Record<string, SerialCampaignState>;

const VIDEO_URL = process.env.DRIP_VIDEO_URL ?? 'https://echolink.app/video/unlock';
const REVEAL_AT_SECONDS = Number(process.env.DRIP_REVEAL_AT_SECONDS ?? 14);

/** In-memory store of campaign states (keyed by campaignId). */
const campaigns = new Map<string, CampaignState>();

/** Enqueue leads for a campaign. Multiple calls append to existing queue. */
export function enqueueLeads(campaignId: string, leads: Lead[]): void {
  const existing = campaigns.get(campaignId);
  if (existing) {
    existing.leads.push(...leads);
  } else {
    campaigns.set(campaignId, {
      leads: [...leads],
      dailyRate: 0,
      releasedDates: new Map(),
      releasedTotal: 0,
    });
  }
}

/**
 * Allocate the drip schedule: compute flat daily rate = ceil(n / days).
 * Call after enqueueLeads to set the pace.
 */
export function allocate(campaignId: string, days = 30): number {
  const state = campaigns.get(campaignId);
  if (!state) throw new Error(`Campaign ${campaignId} not found`);
  state.dailyRate = Math.ceil(state.leads.length / days);
  return state.dailyRate;
}

/**
 * Release today's batch for the campaign (idempotent per date string).
 * Returns an empty array if already released for this date.
 *
 * @param campaignId  The campaign identifier.
 * @param date        ISO date string YYYY-MM-DD (defaults to today).
 */
export function releaseDaily(campaignId: string, date: string): ReleasedLead[] {
  const state = campaigns.get(campaignId);
  if (!state) throw new Error(`Campaign ${campaignId} not found`);
  if (state.dailyRate === 0) throw new Error(`Campaign ${campaignId} not allocated yet`);

  // Idempotent: return empty if already released for this date
  if (state.releasedDates.has(date)) {
    return [];
  }

  const start = state.releasedTotal;
  const end = Math.min(start + state.dailyRate, state.leads.length);
  const batch = state.leads.slice(start, end);

  state.releasedDates.set(date, batch.length);
  state.releasedTotal = end;

  return batch.map((lead) => ({
    ...lead,
    videoPayload: {
      videoUrl: VIDEO_URL,
      revealAtSeconds: REVEAL_AT_SECONDS,
      couponCode: lead.couponCode,
    },
  }));
}

/**
 * The 30-day spin-the-wheel drip track runs on its own background agentic
 * schedule, explicitly exempt from the Sunday-anchor weekly cadence enforced
 * on all other operational workflows. isCadenceExempt(DRIP_PROCESS_TYPE) === true.
 */
export const DRIP_PROCESS_TYPE = 'marketing.spin_wheel_30d';

/** Clear all campaign state (for testing). */
export function clearCampaigns(): void {
  campaigns.clear();
}

/**
 * Remove all drip queue entries (across all campaigns) tagged with orgId.
 * Returns the count of removed lead entries.
 */
export function purgeDripByOrg(orgId: string): number {
  let removed = 0;
  for (const state of campaigns.values()) {
    const before = state.leads.length;
    state.leads = state.leads.filter((l) => l.orgId !== orgId);
    removed += before - state.leads.length;
  }
  return removed;
}

/** Get campaign state (for testing). */
export function getCampaignState(campaignId: string): CampaignState | undefined {
  return campaigns.get(campaignId);
}

// ---------------------------------------------------------------------------
// DripStore — injectable, optionally-durable alternative to module globals
// ---------------------------------------------------------------------------

export interface DripStoreOptions {
  dataDir?: string;
}

/**
 * Injectable drip store used by createApp when dataDir is supplied.
 * Wraps the same logic as the module-level functions but persists state via
 * SnapshotStore so campaign queues and release-day markers survive restarts.
 */
export class DripStore {
  private readonly campaigns = new Map<string, CampaignState>();
  private readonly snap: SnapshotStore<DripSnapshot> | null;

  constructor(opts: DripStoreOptions = {}) {
    if (opts.dataDir) {
      this.snap = new SnapshotStore<DripSnapshot>({ dir: opts.dataDir, name: 'drip' });
      const saved = this.snap.load();
      if (saved) {
        for (const [id, s] of Object.entries(saved)) {
          this.campaigns.set(id, {
            leads: s.leads,
            dailyRate: s.dailyRate,
            releasedTotal: s.releasedTotal,
            releasedDates: new Map(Object.entries(s.releasedDates)),
          });
        }
      }
    } else {
      this.snap = null;
    }
  }

  private _save(): void {
    if (!this.snap) return;
    const out: DripSnapshot = {};
    for (const [id, s] of this.campaigns) {
      out[id] = {
        leads: s.leads,
        dailyRate: s.dailyRate,
        releasedTotal: s.releasedTotal,
        releasedDates: Object.fromEntries(s.releasedDates),
      };
    }
    this.snap.save(out);
  }

  enqueueLeads(campaignId: string, leads: Lead[]): void {
    const existing = this.campaigns.get(campaignId);
    if (existing) {
      existing.leads.push(...leads);
    } else {
      this.campaigns.set(campaignId, {
        leads: [...leads],
        dailyRate: 0,
        releasedDates: new Map(),
        releasedTotal: 0,
      });
    }
    this._save();
  }

  allocate(campaignId: string, days = 30): number {
    const state = this.campaigns.get(campaignId);
    if (!state) throw new Error(`Campaign ${campaignId} not found`);
    state.dailyRate = Math.ceil(state.leads.length / days);
    this._save();
    return state.dailyRate;
  }

  releaseDaily(campaignId: string, date: string): ReleasedLead[] {
    const state = this.campaigns.get(campaignId);
    if (!state) throw new Error(`Campaign ${campaignId} not found`);
    if (state.dailyRate === 0) throw new Error(`Campaign ${campaignId} not allocated yet`);

    if (state.releasedDates.has(date)) return [];

    const start = state.releasedTotal;
    const end = Math.min(start + state.dailyRate, state.leads.length);
    const batch = state.leads.slice(start, end);

    state.releasedDates.set(date, batch.length);
    state.releasedTotal = end;
    this._save();

    return batch.map((lead) => ({
      ...lead,
      videoPayload: {
        videoUrl: VIDEO_URL,
        revealAtSeconds: REVEAL_AT_SECONDS,
        couponCode: lead.couponCode,
      },
    }));
  }

  clear(): void {
    this.campaigns.clear();
  }

  /** Remove all drip queue entries tagged with orgId. Returns count removed. */
  purgeByOrg(orgId: string): number {
    let removed = 0;
    for (const state of this.campaigns.values()) {
      const before = state.leads.length;
      state.leads = state.leads.filter((l) => l.orgId !== orgId);
      removed += before - state.leads.length;
    }
    if (removed > 0) this._save();
    return removed;
  }
}
