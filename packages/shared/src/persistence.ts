import { mkdirSync, readFileSync, writeFileSync, renameSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Durable storage primitives (zero external deps). Every critical in-memory
 * queue persists through these so a service restart never silently empties
 * approvals, leads, drip schedules, or audit history.
 *
 * SnapshotStore: atomic whole-state snapshots (write tmp + rename).
 * JsonlLog: append-only line-delimited records for audit/trace history.
 */

export class DurabilityError extends Error {
  constructor(message: string) {
    super(`durability_error: ${message}`);
    this.name = 'DurabilityError';
  }
}

export interface SnapshotStoreOptions {
  /** Directory (typically env DATA_DIR); created if missing. */
  dir: string;
  /** Logical name; file becomes <dir>/<name>.json */
  name: string;
}

export class SnapshotStore<T> {
  private readonly file: string;
  private readonly tmp: string;

  constructor(opts: SnapshotStoreOptions) {
    try {
      mkdirSync(opts.dir, { recursive: true });
    } catch (e) {
      throw new DurabilityError(`cannot create data dir: ${(e as Error).message}`);
    }
    this.file = join(opts.dir, `${opts.name}.json`);
    this.tmp = `${this.file}.tmp`;
  }

  /** Load the last snapshot, or null when none exists. Corrupt file → throws. */
  load(): T | null {
    if (!existsSync(this.file)) return null;
    try {
      return JSON.parse(readFileSync(this.file, 'utf8')) as T;
    } catch (e) {
      throw new DurabilityError(`snapshot corrupt at ${this.file}: ${(e as Error).message}`);
    }
  }

  /** Atomically persist the full state. Throws DurabilityError on failure. */
  save(data: T): void {
    try {
      writeFileSync(this.tmp, JSON.stringify(data));
      renameSync(this.tmp, this.file);
    } catch (e) {
      throw new DurabilityError(`snapshot write failed: ${(e as Error).message}`);
    }
  }
}

export interface JsonlLogOptions {
  dir: string;
  name: string;
  /** In-memory read cap; the file itself is unbounded append-only. */
  maxReadEntries?: number;
}

export class JsonlLog<T> {
  private readonly file: string;
  private readonly maxRead: number;

  constructor(opts: JsonlLogOptions) {
    try {
      mkdirSync(opts.dir, { recursive: true });
    } catch (e) {
      throw new DurabilityError(`cannot create data dir: ${(e as Error).message}`);
    }
    this.file = join(opts.dir, `${opts.name}.jsonl`);
    this.maxRead = opts.maxReadEntries ?? 1000;
  }

  /** Append one record durably. Throws DurabilityError on failure. */
  append(record: T): void {
    try {
      appendFileSync(this.file, JSON.stringify(record) + '\n');
    } catch (e) {
      throw new DurabilityError(`append failed: ${(e as Error).message}`);
    }
  }

  /** Read the most recent records (up to maxReadEntries). */
  tail(n?: number): T[] {
    if (!existsSync(this.file)) return [];
    const lines = readFileSync(this.file, 'utf8').split('\n').filter(Boolean);
    const limit = Math.min(n ?? this.maxRead, this.maxRead);
    return lines.slice(-limit).map((l) => JSON.parse(l) as T);
  }
}
