/**
 * app-store.ts — Unified store accessor for EchoLink createApp.
 *
 * Provides a single `AppStore` object that routes all read/write operations
 * to either durable injected stores (when dataDir provided) or the module-level
 * globals in server.ts (memory-only default, for backward compat with tests).
 */
import type { NormalizedTransaction } from '@expo-proxy/shared';
import { LeadStore, TransactionStore, type StoredLead, DurabilityError } from './store.js';
import { DripStore, purgeDripByOrg, type Lead } from './drip.js';
import { GratitudeStore, purgeGratitudeByOrg, type GratitudeLead } from './gratitude.js';
import { AuditRing, type AuditKind } from './audit.js';

export { DurabilityError };

import type { AuditEntry } from './audit.js';
import type { ReleasedLead } from './drip.js';

export interface PurgeResult {
  leadsRemoved: number;
  gratitudeRemoved: number;
  dripQueueRemoved: number;
}

export interface ModuleGlobals {
  leadsByPhone: Map<string, StoredLead>;
  leadsByEmail: Map<string, StoredLead>;
  leadsById: Map<string, StoredLead>;
  storedTransactions: NormalizedTransaction[];
  generateLeadId: () => string;
  recordAudit: (kind: AuditKind, ip: string, identity?: string, detail?: string) => void;
  getAuditEntries: () => AuditEntry[];
  enqueueLeads: (id: string, leads: Lead[]) => void;
  allocate: (id: string, days?: number) => number;
  releaseDaily: (id: string, date: string) => ReleasedLead[];
  onOptIn: (lead: GratitudeLead, clock?: () => number) => void;
}

export interface AppStoreOptions {
  dataDir?: string;
  globals?: ModuleGlobals;
}

export interface AppStore {
  getLeadByPhone(p: string): StoredLead | undefined;
  getLeadByEmail(e: string): StoredLead | undefined;
  getLeadById(id: string): StoredLead | undefined;
  addLead(lead: StoredLead): void;
  updateLead(lead: StoredLead): void;
  nextLeadId(): string;
  pushTxs(...items: NormalizedTransaction[]): void;
  allTxs(): NormalizedTransaction[];
  txTotal(): number;
  enqueueLeads(id: string, leads: Lead[]): void;
  allocate(id: string, days?: number): number;
  releaseDaily(id: string, date: string): ReturnType<DripStore['releaseDaily']>;
  onOptIn(lead: GratitudeLead, clock?: () => number): void;
  recordAudit(kind: AuditKind, ip: string, identity?: string, detail?: string): void;
  getAuditEntries(): ReturnType<AuditRing['entries']>;
  /** Remove all leads, gratitude touches, and drip queue items tagged with orgId. */
  purgeOrg(orgId: string): PurgeResult;
}

export function createAppStore(opts: AppStoreOptions): AppStore {
  const { dataDir, globals } = opts;
  if (dataDir) {
    const leadStore = new LeadStore({ dataDir });
    const txStore = new TransactionStore({ dataDir });
    const dripStore = new DripStore({ dataDir });
    const gratStore = new GratitudeStore({ dataDir });
    const auditRing = new AuditRing({ dataDir });
    return {
      getLeadByPhone: (p) => leadStore.getByPhone(p),
      getLeadByEmail: (e) => leadStore.getByEmail(e),
      getLeadById: (id) => leadStore.getById(id),
      addLead: (lead) => leadStore.add(lead),
      updateLead: (lead) => leadStore.update(lead),
      nextLeadId: () => leadStore.nextId(),
      pushTxs: (...items) => txStore.push(...items),
      allTxs: () => txStore.all(),
      txTotal: () => txStore.length,
      enqueueLeads: (id, leads) => dripStore.enqueueLeads(id, leads),
      allocate: (id, days) => dripStore.allocate(id, days),
      releaseDaily: (id, date) => dripStore.releaseDaily(id, date),
      onOptIn: (lead, clock) => gratStore.onOptIn(lead, clock),
      recordAudit: (kind, ip, identity, detail) => auditRing.record(kind, ip, identity, detail),
      getAuditEntries: () => auditRing.entries(),
      purgeOrg: (orgId) => {
        const leadsRemoved = leadStore.purgeByOrg(orgId);
        const gratitudeRemoved = gratStore.purgeByOrg(orgId);
        const dripQueueRemoved = dripStore.purgeByOrg(orgId);
        return { leadsRemoved, gratitudeRemoved, dripQueueRemoved };
      },
    };
  }

  // Memory-only path — use module-level globals (backward compat, all existing tests pass)
  if (!globals) throw new Error('createAppStore: globals required when dataDir is not provided');
  const g = globals;
  return {
    getLeadByPhone: (p) => g.leadsByPhone.get(p),
    getLeadByEmail: (e) => g.leadsByEmail.get(e),
    getLeadById: (id) => g.leadsById.get(id),
    addLead: (lead) => {
      if (lead.phone) g.leadsByPhone.set(lead.phone, lead);
      if (lead.email) g.leadsByEmail.set(lead.email, lead);
      g.leadsById.set(lead.id, lead);
    },
    updateLead: (lead) => {
      if (lead.phone) g.leadsByPhone.set(lead.phone, lead);
      if (lead.email) g.leadsByEmail.set(lead.email, lead);
      g.leadsById.set(lead.id, lead);
    },
    nextLeadId: () => g.generateLeadId(),
    pushTxs: (...items) => g.storedTransactions.push(...items),
    allTxs: () => g.storedTransactions,
    txTotal: () => g.storedTransactions.length,
    enqueueLeads: (id, leads) => g.enqueueLeads(id, leads),
    allocate: (id, days) => g.allocate(id, days),
    releaseDaily: (id, date) => g.releaseDaily(id, date),
    onOptIn: (lead, clock) => g.onOptIn(lead, clock),
    recordAudit: (kind, ip, identity, detail) => g.recordAudit(kind, ip, identity, detail),
    getAuditEntries: () => g.getAuditEntries(),
    purgeOrg: (orgId) => {
      // Purge leads from the three maps
      let leadsRemoved = 0;
      for (const [id, lead] of g.leadsById) {
        if (lead.orgId === orgId) {
          g.leadsById.delete(id);
          if (lead.phone) g.leadsByPhone.delete(lead.phone);
          if (lead.email) g.leadsByEmail.delete(lead.email);
          leadsRemoved++;
        }
      }
      // Purge module-level gratitude and drip
      const gratitudeRemoved = purgeGratitudeByOrg(orgId);
      const dripQueueRemoved = purgeDripByOrg(orgId);
      return { leadsRemoved, gratitudeRemoved, dripQueueRemoved };
    },
  };
}
