import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SnapshotStore, JsonlLog, DurabilityError, NormalizedTransaction } from '../src/index.js';

const dir = () => mkdtempSync(join(tmpdir(), 'expo-durability-'));

describe('SnapshotStore (restart-survivable state)', () => {
  it('round-trips state across instances (simulated restart)', () => {
    const d = dir();
    const a = new SnapshotStore<{ approvals: string[] }>({ dir: d, name: 'approvals' });
    expect(a.load()).toBeNull();
    a.save({ approvals: ['ap-1', 'ap-2'] });
    const b = new SnapshotStore<{ approvals: string[] }>({ dir: d, name: 'approvals' });
    expect(b.load()).toEqual({ approvals: ['ap-1', 'ap-2'] });
  });

  it('throws DurabilityError on unwritable destination', () => {
    const d = dir();
    writeFileSync(join(d, 'blocked'), 'i am a file');
    expect(() => new SnapshotStore({ dir: join(d, 'blocked', 'x'), name: 's' })).toThrow(
      DurabilityError,
    );
  });

  it('throws on corrupt snapshot rather than silently losing data', () => {
    const d = dir();
    const s = new SnapshotStore<{ x: number }>({ dir: d, name: 'state' });
    s.save({ x: 1 });
    writeFileSync(join(d, 'state.json'), '{not json');
    expect(() => s.load()).toThrow(DurabilityError);
  });
});

describe('JsonlLog (append-only audit history)', () => {
  it('appends and tails across instances', () => {
    const d = dir();
    const log = new JsonlLog<{ kind: string }>({ dir: d, name: 'spam-audit' });
    log.append({ kind: 'honeypot' });
    log.append({ kind: 'rate_limit_ip' });
    const reopened = new JsonlLog<{ kind: string }>({ dir: d, name: 'spam-audit' });
    expect(reopened.tail().map((e) => e.kind)).toEqual(['honeypot', 'rate_limit_ip']);
    expect(reopened.tail(1)).toEqual([{ kind: 'rate_limit_ip' }]);
  });
});

describe('tenancy reservation (ADR-001)', () => {
  it('tenant_id is accepted, optional, and NOT in the canonical CSV yet', async () => {
    const tx = NormalizedTransaction.parse({
      transaction_id: 'TX-1',
      source_pos: 'Toast',
      business_date: '2026-06-09',
      timestamp: '2026-06-09T18:00:00Z',
      gross_sales: 10,
      net_sales: 10,
      discounts_applied: 0,
      adjustments: 0,
      taxes_collected: 0.8,
      tips: 2,
      payment_method: 'Cash',
      auth_code: 'N/A',
      customer_id: '',
      modifiers_json: [],
      tenant_id: 'blockys-eatery',
    });
    expect(tx.tenant_id).toBe('blockys-eatery');
    const { toCsv, CSV_HEADER } = await import('../src/csv.js');
    expect(CSV_HEADER).not.toContain('tenant_id');
    expect(toCsv([tx])).not.toContain('blockys-eatery');
  });
});
