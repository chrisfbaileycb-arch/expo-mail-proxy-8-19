/**
 * Force Protection — Anti-Corruption Layer. All external inputs are
 * untrusted: every payload is sanitized before it enters the core pipeline.
 * Strips prototype-pollution vectors, control characters, oversized and
 * over-deep structures; rejects non-data values outright.
 */

export interface AclOptions {
  maxDepth?: number;
  maxStringLength?: number;
  maxKeys?: number;
  maxArrayLength?: number;
}

export interface AclResult<T = unknown> {
  value: T;
  violations: string[];
}

export class AclViolationError extends Error {
  constructor(public readonly violation: string) {
    super(`acl_violation: ${violation}`);
    this.name = 'AclViolationError';
  }
}

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
// strip C0/C1 control chars except \n and \t
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

/**
 * Deep-clean an untrusted payload. Returns a freshly-built copy (never the
 * input object) plus the list of violations that were neutralized. Throws
 * AclViolationError on structural attacks (depth/size bombs, non-data types).
 */
export function sanitizePayload<T = unknown>(input: unknown, opts: AclOptions = {}): AclResult<T> {
  const maxDepth = opts.maxDepth ?? 8;
  const maxStringLength = opts.maxStringLength ?? 10_000;
  const maxKeys = opts.maxKeys ?? 256;
  const maxArrayLength = opts.maxArrayLength ?? 10_000;
  const violations: string[] = [];

  function clean(value: unknown, depth: number, path: string): unknown {
    if (depth > maxDepth) throw new AclViolationError(`max_depth_exceeded at ${path}`);
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        violations.push(`non_finite_number at ${path}`);
        return 0;
      }
      return value;
    }
    if (typeof value === 'string') {
      let out = value;
      if (CONTROL_CHARS.test(out)) {
        violations.push(`control_chars_stripped at ${path}`);
        out = out.replace(CONTROL_CHARS, '');
      }
      if (out.length > maxStringLength) {
        violations.push(`string_truncated at ${path}`);
        out = out.slice(0, maxStringLength);
      }
      return out;
    }
    if (Array.isArray(value)) {
      if (value.length > maxArrayLength) {
        throw new AclViolationError(`max_array_length_exceeded at ${path}`);
      }
      return value.map((v, i) => clean(v, depth + 1, `${path}[${i}]`));
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length > maxKeys) throw new AclViolationError(`max_keys_exceeded at ${path}`);
      const out: Record<string, unknown> = Object.create(null);
      for (const [k, v] of entries) {
        if (FORBIDDEN_KEYS.has(k)) {
          violations.push(`forbidden_key_dropped:${k} at ${path}`);
          continue;
        }
        out[k] = clean(v, depth + 1, `${path}.${k}`);
      }
      return out;
    }
    // functions, symbols, bigints, undefined: not data — reject.
    throw new AclViolationError(`non_data_value:${typeof value} at ${path}`);
  }

  return { value: clean(input, 0, '$') as T, violations };
}
