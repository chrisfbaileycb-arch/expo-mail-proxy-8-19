/**
 * audit.ts — In-memory spam/abuse audit ring buffer.
 *
 * Stores hashed (sha256) IP and identity values — never raw PII.
 * Ring buffer caps at 1000 entries; oldest are evicted silently.
 *
 * Module-level API (recordAudit, getAuditEntries, clearAudit) is unchanged —
 * all existing tests still pass.
 *
 * AuditRing class provides an injectable, optionally-durable alternative used
 * by createApp when a dataDir is supplied. It additionally appends entries to
 * a JsonlLog for durable history; the ring itself is always in-memory.
 */

import { createHash } from 'node:crypto';
import { JsonlLog } from '@expo-proxy/shared';

export type AuditKind =
  | 'honeypot'
  | 'rate_limit_ip'
  | 'rate_limit_identity'
  | 'acl_violation'
  | 'crm_sync_failed';

export interface AuditEntry {
  at: string;
  kind: AuditKind;
  /** sha256 of raw IP — no raw IP stored */
  ipHash: string;
  /** sha256 of email or phone when present — undefined if no identity */
  identityHash?: string;
  detail?: string;
}

const RING_CAP = 1000;
const ring: AuditEntry[] = [];

export function hashValue(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/**
 * Append an entry to the ring buffer. Evicts the oldest entry when the
 * cap is reached (FIFO).
 */
export function recordAudit(
  kind: AuditKind,
  ip: string,
  identity?: string,
  detail?: string,
): void {
  if (ring.length >= RING_CAP) {
    ring.shift();
  }
  ring.push({
    at: new Date().toISOString(),
    kind,
    ipHash: hashValue(ip),
    identityHash: identity ? hashValue(identity) : undefined,
    detail,
  });
}

/** Return a copy of all current audit entries (most recent last). */
export function getAuditEntries(): AuditEntry[] {
  return ring.slice();
}

/** Clear the ring — for testing only. */
export function clearAudit(): void {
  ring.length = 0;
}

// ---------------------------------------------------------------------------
// AuditRing — injectable, optionally-durable alternative to module globals
// ---------------------------------------------------------------------------

export interface AuditRingOptions {
  dataDir?: string;
  cap?: number;
}

/**
 * Injectable audit ring used by createApp when a dataDir is supplied.
 * Appends entries to a JsonlLog for durability; ring stays in-memory.
 * On construction it preloads the ring from the journal tail.
 * Failures in the journal append path are logged but never break the request.
 */
export class AuditRing {
  private readonly ring: AuditEntry[] = [];
  private readonly cap: number;
  private readonly journal: JsonlLog<AuditEntry> | null;

  constructor(opts: AuditRingOptions = {}) {
    this.cap = opts.cap ?? RING_CAP;
    if (opts.dataDir) {
      this.journal = new JsonlLog<AuditEntry>({ dir: opts.dataDir, name: 'spam-audit' });
      // Preload ring from journal tail (up to cap entries)
      const tail = this.journal.tail(this.cap);
      this.ring.push(...tail);
    } else {
      this.journal = null;
    }
  }

  record(kind: AuditKind, ip: string, identity?: string, detail?: string): void {
    if (this.ring.length >= this.cap) this.ring.shift();
    const entry: AuditEntry = {
      at: new Date().toISOString(),
      kind,
      ipHash: hashValue(ip),
      identityHash: identity ? hashValue(identity) : undefined,
      detail,
    };
    this.ring.push(entry);
    if (this.journal) {
      try {
        this.journal.append(entry);
      } catch (e) {
        console.error(JSON.stringify({
          service: 'echolink',
          event: 'spam_audit_append_failed',
          error: (e as Error).message,
          at: new Date().toISOString(),
        }));
      }
    }
  }

  entries(): AuditEntry[] {
    return this.ring.slice();
  }

  clear(): void {
    this.ring.length = 0;
  }
}
