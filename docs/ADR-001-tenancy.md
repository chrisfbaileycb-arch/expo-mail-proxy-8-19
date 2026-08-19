# ADR-001: Tenancy Model — Deployment-per-Restaurant Now, Reserved Migration Path Later

**Status:** Accepted (2026-06)

## Decision
Expo Proxy runs **one deployment per restaurant** through beta and the first ~10 paying customers. Each customer gets isolated services, an isolated `DATA_DIR`, isolated n8n workspace credentials, and their own Google OAuth client.

## Why
- **Isolation is a feature** at this stage: one customer's data corruption, spam wave, or freeze event can never touch another's. The Force Protection model (ACL, boundaries, trace chains) assumes a single trust domain per deployment.
- The Cloud Run deploy pipeline makes "one more customer" a parameterized re-deploy, not an engineering project.
- The subscription economics ($149–$499/mo) comfortably cover single-tenant Cloud Run costs at beta scale.

## What we reserved so the future isn't a breaking change
- `NormalizedTransaction.tenant_id` exists in the shared contract today — optional, unused, **not** in the canonical CSV. Apps must never reject a payload for carrying it.
- The canonical CSV gains a `tenant_id` trailing column only when the migration executes (the CSV reader already tolerates older shorter headers, so the column add is non-breaking by construction).

## Trigger to revisit
Re-evaluate when ANY of: customer #5 signs, ops time per deployment exceeds ~1 hr/month/customer, or a multi-location restaurant group requires consolidated reporting across locations.

## Migration sketch (when triggered)
1. Add `tenant_id` to the canonical CSV header (17th column) and stamp it at import time from the deployment's identity.
2. Introduce tenant scoping in the stores (key prefix per tenant) behind the existing store interfaces.
3. Consolidate per-tenant Cloud Run services progressively; keep the Integration Gateway's boundary registry keyed by `tenantId:agentId`.
4. Google auth gains an allowlist mapping operator email → tenant.

**Until then: do not add tenant logic to app code.** Single-tenant simplicity is deliberate.
