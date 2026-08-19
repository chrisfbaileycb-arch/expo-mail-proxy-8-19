import { createHash } from 'node:crypto';
import type { N8nClient } from './n8n.js';

/**
 * Force Protection — Immutable Decision Tracing. Every agent action is
 * recorded as a hash-chained trace record (each record embeds the SHA-256 of
 * its predecessor, so any tampering breaks the chain) and shipped
 * fire-and-forget to the CENTRAL telemetry pipeline (n8n cloud) — storage
 * outside the package's local environment, per the FP protocol.
 */

export interface TraceEntry {
  agentId?: string;
  action: string;
  subject?: string;
  metadata?: Record<string, unknown>;
}

export interface TraceRecord extends TraceEntry {
  seq: number;
  app: string;
  at: string;
  prevHash: string;
  hash: string;
}

export interface TraceLogOptions {
  app: string;
  n8n: Pick<N8nClient, 'trigger'>;
  /** Central pipeline webhook path; default 'trace-log'. */
  workflowPath?: string;
  log?: (msg: string) => void;
  clock?: () => Date;
}

const GENESIS = 'GENESIS';

function hashRecord(record: Omit<TraceRecord, 'hash'>): string {
  return createHash('sha256').update(JSON.stringify(record)).digest('hex');
}

export interface TraceLog {
  /** Record an action: chains, ships centrally, returns the immutable record. */
  record(entry: TraceEntry): TraceRecord;
  /** Local tail (the authoritative copy lives in the central pipeline). */
  tail(n?: number): TraceRecord[];
}

export function createTraceLog(opts: TraceLogOptions): TraceLog {
  const workflowPath = opts.workflowPath ?? 'trace-log';
  const log = opts.log ?? ((m) => console.error(m));
  const clock = opts.clock ?? (() => new Date());
  const records: TraceRecord[] = [];

  return {
    record(entry: TraceEntry): TraceRecord {
      const prev = records[records.length - 1];
      const unhashed: Omit<TraceRecord, 'hash'> = {
        seq: records.length,
        app: opts.app,
        at: clock().toISOString(),
        prevHash: prev ? prev.hash : GENESIS,
        ...entry,
      };
      const record: TraceRecord = { ...unhashed, hash: hashRecord(unhashed) };
      records.push(record);
      void opts.n8n.trigger(workflowPath, record).catch((e) => {
        log(`[trace] central delivery failed (seq=${record.seq}): ${(e as Error).message}`);
      });
      return record;
    },
    tail(n = 50): TraceRecord[] {
      return records.slice(-n);
    },
  };
}

/** Verify a chain's integrity: returns the seq of the first broken record, or null if intact. */
export function verifyChain(records: TraceRecord[]): number | null {
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const { hash, ...unhashed } = r;
    const expectedPrev = i === 0 ? GENESIS : records[i - 1].hash;
    if (r.prevHash !== expectedPrev || hash !== hashRecord(unhashed)) return r.seq;
  }
  return null;
}
