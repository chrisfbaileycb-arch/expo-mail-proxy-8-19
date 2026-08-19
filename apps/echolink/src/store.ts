/**
 * store.ts — Durable lead store for EchoLink.
 *
 * LeadStore wraps the in-memory phone/email/id maps with an optional
 * SnapshotStore so leads survive a service restart. When constructed without
 * a dataDir the store is purely in-memory and behaviour is identical to the
 * module-level globals in server.ts (all existing tests remain unaffected).
 */

import { SnapshotStore, DurabilityError } from '@expo-proxy/shared';

export interface StoredLead {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  source: string;
  couponCode?: string;
  isNew: boolean;
  /** Org that created this lead — set when an org context header accompanies creation. */
  orgId?: string;
}

interface LeadStoreSnapshot {
  leads: StoredLead[];
  counter: number;
}

export interface LeadStoreOptions {
  dataDir?: string;
}

export class LeadStore {
  private readonly byPhone = new Map<string, StoredLead>();
  private readonly byEmail = new Map<string, StoredLead>();
  private readonly byId = new Map<string, StoredLead>();
  private counter: number = 1;
  private readonly snap: SnapshotStore<LeadStoreSnapshot> | null;

  constructor(opts: LeadStoreOptions = {}) {
    if (opts.dataDir) {
      this.snap = new SnapshotStore<LeadStoreSnapshot>({ dir: opts.dataDir, name: 'leads' });
      const saved = this.snap.load();
      if (saved) {
        this.counter = saved.counter;
        for (const lead of saved.leads) {
          this.byId.set(lead.id, lead);
          if (lead.phone) this.byPhone.set(lead.phone, lead);
          if (lead.email) this.byEmail.set(lead.email, lead);
        }
      }
    } else {
      this.snap = null;
    }
  }

  // -------------------------------------------------------------------------
  // Private: persist. Throws DurabilityError on failure.
  // -------------------------------------------------------------------------

  private _save(): void {
    if (!this.snap) return;
    this.snap.save({ leads: [...this.byId.values()], counter: this.counter });
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  nextId(): string {
    return `lead-${this.counter++}`;
  }

  getByPhone(phone: string): StoredLead | undefined {
    return this.byPhone.get(phone);
  }

  getByEmail(email: string): StoredLead | undefined {
    return this.byEmail.get(email);
  }

  getById(id: string): StoredLead | undefined {
    return this.byId.get(id);
  }

  /**
   * Persist a new lead. Throws DurabilityError if the snapshot write fails
   * (write-path — caller must surface this as 500 persistence_failed).
   */
  add(lead: StoredLead): void {
    this.byId.set(lead.id, lead);
    if (lead.phone) this.byPhone.set(lead.phone, lead);
    if (lead.email) this.byEmail.set(lead.email, lead);
    this._save();
  }

  update(lead: StoredLead): void {
    this.byId.set(lead.id, lead);
    if (lead.phone) this.byPhone.set(lead.phone, lead);
    if (lead.email) this.byEmail.set(lead.email, lead);
    // couponCode updates are not critical write-path — log on failure.
    try {
      this._save();
    } catch (e) {
      console.error(JSON.stringify({
        service: 'echolink',
        event: 'lead_store_update_failed',
        error: (e as Error).message,
        at: new Date().toISOString(),
      }));
    }
  }

  clear(): void {
    this.byPhone.clear();
    this.byEmail.clear();
    this.byId.clear();
    this.counter = 1;
  }

  /**
   * Remove all leads tagged with orgId. Returns the count of removed leads.
   * Untagged leads are untouched.
   */
  purgeByOrg(orgId: string): number {
    let removed = 0;
    for (const [id, lead] of this.byId) {
      if (lead.orgId === orgId) {
        this.byId.delete(id);
        if (lead.phone) this.byPhone.delete(lead.phone);
        if (lead.email) this.byEmail.delete(lead.email);
        removed++;
      }
    }
    if (removed > 0) {
      try { this._save(); } catch { /* non-fatal */ }
    }
    return removed;
  }
}

// Re-export so callers don't need to import from shared directly.
export { DurabilityError };

// ---------------------------------------------------------------------------
// TransactionStore — injectable durable store for normalised transactions
// ---------------------------------------------------------------------------

import type { NormalizedTransaction } from '@expo-proxy/shared';

export interface TransactionStoreOptions {
  dataDir?: string;
}

export class TransactionStore {
  private readonly txs: NormalizedTransaction[] = [];
  private readonly snap: SnapshotStore<NormalizedTransaction[]> | null;

  constructor(opts: TransactionStoreOptions = {}) {
    if (opts.dataDir) {
      this.snap = new SnapshotStore<NormalizedTransaction[]>({ dir: opts.dataDir, name: 'transactions' });
      const saved = this.snap.load();
      if (saved) this.txs.push(...saved);
    } else {
      this.snap = null;
    }
  }

  private _save(): void {
    if (!this.snap) return;
    // Telemetry-adjacent — failure logged, never thrown.
    try {
      this.snap.save(this.txs);
    } catch (e) {
      console.error(JSON.stringify({
        service: 'echolink',
        event: 'tx_store_save_failed',
        error: (e as Error).message,
        at: new Date().toISOString(),
      }));
    }
  }

  push(...items: NormalizedTransaction[]): void {
    this.txs.push(...items);
    this._save();
  }

  all(): NormalizedTransaction[] {
    return this.txs;
  }

  get length(): number {
    return this.txs.length;
  }

  clear(): void {
    this.txs.length = 0;
  }
}
