import { NormalizedTransaction } from './types.js';

export const CSV_HEADER = [
  'transaction_id',
  'source_pos',
  'business_date',
  'timestamp',
  'gross_sales',
  'net_sales',
  'discounts_applied',
  'adjustments',
  'taxes_collected',
  'tips',
  'payment_method',
  'auth_code',
  'customer_id',
  'modifiers_json',
  'postal_code',
  'promo_code',
] as const;

/** Header of the original 14-column contract, accepted on read for compat. */
const LEGACY_HEADER = CSV_HEADER.slice(0, 14).join(',');

function escapeField(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

/** Serialize normalized transactions into the canonical Expo Proxy CSV. */
export function toCsv(rows: NormalizedTransaction[]): string {
  const lines = [CSV_HEADER.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.transaction_id,
        r.source_pos,
        r.business_date,
        r.timestamp,
        r.gross_sales.toFixed(2),
        r.net_sales.toFixed(2),
        r.discounts_applied.toFixed(2),
        r.adjustments.toFixed(2),
        r.taxes_collected.toFixed(2),
        r.tips.toFixed(2),
        r.payment_method,
        r.auth_code,
        r.customer_id,
        escapeField(JSON.stringify(r.modifiers_json)),
        r.postal_code ?? '',
        r.promo_code ?? '',
      ].join(','),
    );
  }
  return lines.join('\n') + '\n';
}

/** Parse the canonical CSV back into validated transactions. */
export function fromCsv(csv: string): NormalizedTransaction[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const [header, ...rows] = lines;
  if (header !== CSV_HEADER.join(',') && header !== LEGACY_HEADER) {
    throw new Error('CSV header does not match the Expo Proxy data contract');
  }
  return rows.map((line) => {
    const cols = splitCsvLine(line);
    return NormalizedTransaction.parse({
      transaction_id: cols[0],
      source_pos: cols[1],
      business_date: cols[2],
      timestamp: cols[3],
      gross_sales: Number(cols[4]),
      net_sales: Number(cols[5]),
      discounts_applied: Number(cols[6]),
      adjustments: Number(cols[7]),
      taxes_collected: Number(cols[8]),
      tips: Number(cols[9]),
      payment_method: cols[10],
      auth_code: cols[11],
      customer_id: cols[12],
      modifiers_json: JSON.parse(cols[13] || '[]'),
      ...(cols[14] ? { postal_code: cols[14] } : {}),
      ...(cols[15] ? { promo_code: cols[15] } : {}),
    });
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}
