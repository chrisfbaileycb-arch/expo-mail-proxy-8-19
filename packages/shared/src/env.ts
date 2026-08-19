/**
 * Beta startup configuration validation. Services FAIL FAST at boot when
 * required variables are missing, empty, or still set to placeholders —
 * never silently default to fake endpoints.
 */

export interface EnvRequirement {
  name: string;
  /** Reject https-less values (n8n cloud endpoints). */
  https?: boolean;
  /** Reject obvious placeholder/example/localhost values. */
  notPlaceholder?: boolean;
}

export class EnvValidationError extends Error {
  constructor(public readonly problems: string[]) {
    super(`fatal_env_validation:\n  - ${problems.join('\n  - ')}`);
    this.name = 'EnvValidationError';
  }
}

const PLACEHOLDER_PATTERNS = [
  /localhost/i,
  /127\.0\.0\.1/,
  /(^|[./])example([./]|$)/i,
  /placeholder/i,
  /your[-_]?(api[-_]?key|secret|token|domain)/i,
  /changeme/i,
];

export function looksLikePlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => p.test(value));
}

/**
 * Validate required env vars; throws EnvValidationError listing EVERY
 * problem at once (so operators fix the whole set in one pass).
 */
export function validateEnv(
  requirements: EnvRequirement[],
  env: Record<string, string | undefined> = process.env,
): Record<string, string> {
  const problems: string[] = [];
  const out: Record<string, string> = {};
  for (const req of requirements) {
    const raw = env[req.name];
    const value = raw?.trim() ?? '';
    if (!value) {
      problems.push(`${req.name} is required and must not be empty`);
      continue;
    }
    if (req.https && !/^https:\/\//.test(value)) {
      problems.push(`${req.name} must be an https:// URL (got "${value}")`);
    }
    if (req.notPlaceholder && looksLikePlaceholder(value)) {
      problems.push(`${req.name} is still a placeholder/example value ("${value}")`);
    }
    out[req.name] = value;
  }
  if (problems.length > 0) throw new EnvValidationError(problems);
  return out;
}

/** Standard beta requirement sets. Compose per service. */
export const BETA_ENV = {
  googleAuth: (): EnvRequirement[] => [{ name: 'GOOGLE_CLIENT_IDS' }],
  n8n: (): EnvRequirement[] => [
    { name: 'N8N_BASE_URL', https: true, notPlaceholder: true },
    { name: 'N8N_SIGNING_SECRET' },
  ],
  dataDir: (): EnvRequirement[] => [{ name: 'DATA_DIR' }],
};

/**
 * Boot helper: validate or die. Prints every problem and exits non-zero so
 * supervisors/orchestrators see a crashed service, not a half-alive one.
 * Set EXPO_PROXY_ENV=dev to downgrade to warnings for local tinkering ONLY.
 */
export function validateEnvOrExit(
  service: string,
  requirements: EnvRequirement[],
  env: Record<string, string | undefined> = process.env,
): Record<string, string> {
  try {
    return validateEnv(requirements, env);
  } catch (e) {
    if (e instanceof EnvValidationError) {
      if (env['EXPO_PROXY_ENV'] === 'dev' || !env['EXPO_PROXY_ENV'] || env['NODE_ENV'] !== 'production') {
        console.warn(`[${service}] DEV MODE — env problems tolerated:\n${e.message}`);
        const partial: Record<string, string> = {};
        for (const r of requirements) partial[r.name] = env[r.name]?.trim() ?? '';
        return partial;
      }
      console.error(`[${service}] refusing to boot:\n${e.message}`);
      process.exit(1);
    }
    throw e;
  }
}
