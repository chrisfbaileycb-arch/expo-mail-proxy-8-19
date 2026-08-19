import { describe, it, expect } from 'vitest';
import {
  NormalizedTransaction,
  resolveSplits,
  toCsv,
  fromCsv,
  verifySignature,
  N8nClient,
} from '../src/index.js';

const base = NormalizedTransaction.parse({
  transaction_id: 'TX-998102',
  source_pos: 'Heartland',
  business_date: '2026-05-30',
  timestamp: '2026-05-30T19:30:15Z',
  gross_sales: 85.5,
  net_sales: 75.5,
  discounts_applied: 10,
  adjustments: 0,
  taxes_collected: 6.2,
  tips: 15,
  payment_method: 'Credit_Visa',
  auth_code: 'AUTH_88201',
  customer_id: 'CUST-4412',
  modifiers_json: [{ name: 'Extra Provolone', price: 1.5 }],
});

describe('split resolution', () => {
  it('splits evenly and sums back to the parent total exactly (no Error 6000)', () => {
    const parts = resolveSplits(base, [
      { index: 1, fraction: 1 / 3 },
      { index: 2, fraction: 1 / 3 },
      { index: 3, fraction: 1 / 3 },
    ]);
    expect(parts.map((p) => p.transaction_id)).toEqual([
      'TX-998102-1',
      'TX-998102-2',
      'TX-998102-3',
    ]);
    const sum = parts.reduce((s, p) => s + p.gross_sales, 0);
    expect(Math.round(sum * 100) / 100).toBe(base.gross_sales);
    for (const p of parts) expect(p.gross_sales).toBeGreaterThanOrEqual(0);
  });

  it('maps seats to session-local customer ids when no customer attached', () => {
    const anon = { ...base, customer_id: '' };
    const parts = resolveSplits(anon, [
      { index: 1, fraction: 0.5, seat: 1 },
      { index: 2, fraction: 0.5, seat: 2 },
    ]);
    expect(parts[0].customer_id).toBe('SEAT-TX-998102-1');
    expect(parts[1].customer_id).toBe('SEAT-TX-998102-2');
  });

  it('rejects fractions that do not sum to 1', () => {
    expect(() => resolveSplits(base, [{ index: 1, fraction: 0.5 }])).toThrow();
  });
});

describe('csv round-trip', () => {
  it('serializes and parses the canonical schema losslessly', () => {
    const csv = toCsv([base]);
    const [parsed] = fromCsv(csv);
    expect(parsed).toEqual(base);
  });

  it('carries postal_code and promo_code for closed-loop attribution', () => {
    const tx = { ...base, postal_code: '45140', promo_code: 'STRATA-BOGO30' };
    const [parsed] = fromCsv(toCsv([tx]));
    expect(parsed.postal_code).toBe('45140');
    expect(parsed.promo_code).toBe('STRATA-BOGO30');
  });

  it('still accepts the legacy 14-column header on read', () => {
    const legacy =
      'transaction_id,source_pos,business_date,timestamp,gross_sales,net_sales,discounts_applied,adjustments,taxes_collected,tips,payment_method,auth_code,customer_id,modifiers_json\n' +
      'TX-1,Toast,2026-05-30,2026-05-30T19:42:11Z,42.00,42.00,0.00,0.00,3.45,8.00,Credit_Amex,AUTH_99124,CUST-9011,[]\n';
    const [parsed] = fromCsv(legacy);
    expect(parsed.transaction_id).toBe('TX-1');
    expect(parsed.promo_code).toBeUndefined();
  });
});

describe('n8n signing', () => {
  it('produces verifiable HMAC signatures', () => {
    const client = new N8nClient({
      baseUrl: 'https://acme.app.n8n.cloud',
      signingSecret: 'secret',
    });
    const sig = client.sign('{"a":1}');
    expect(verifySignature('{"a":1}', sig, 'secret')).toBe(true);
    expect(verifySignature('{"a":2}', sig, 'secret')).toBe(false);
  });

  it('refuses non-https endpoints (cloud-only, no self-hosting)', () => {
    expect(
      () => new N8nClient({ baseUrl: 'http://localhost:5678', signingSecret: 's' }),
    ).toThrow();
  });
});
