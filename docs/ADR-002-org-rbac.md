# ADR-002: Organization Tenancy, RBAC, and Service Gating

**Status:** Accepted (2026-06). Composes with ADR-001 (deployment-per-restaurant): organizations model the *people and entitlements within* a deployment.

## Model (shared `org.ts`)
- All operator data scoped to `OrganizationID`; roles: `owner` (= Administrator), `manager`, `staff`.
- **Draft/Save**: all internal roles. **Execute/Spend**: hard-coded to owner + `Organization.isPaid` (`canExecute`, `requireExecuteRights` → AdSmith reconcile, Gateway HITL approve).
- The dashboard is the control plane: owns the durable org store, mints 5-minute HMAC-signed `OrgContext` tokens (`x-expoproxy-org-context`); services verify statelessly with the shared secret — no shared database, autonomy preserved.

## Gating
- **Explorable suite** (staffwise, marketing, dashboard, adsmith, content-director, core-pipeline): full UI/draft/save for any authenticated user regardless of payment — sales sandboxes by design.
- **Pro suite** (echo-proxy = Reputation Management, echolink = Gamification): hard gate → HTTP 402 + `/pricing` redirect unless `isPaid`.
- **Reputation Management commitment**: additionally locked (403 `reputation_terms_required`) until the org accepts the **12-month minimum term** during payment/onboarding; early cancellation rejected (`commitment_active`) until `endsAt`.

## Lead lifecycle (TTL)
Unpaid orgs idle > **30 days**: daily n8n sweep → contact/metadata exported to the marketing CRM (`org-lifecycle-export`, critical) → org purged from the live store, org-tagged EchoLink data purged via HMAC `/lifecycle/purge`. Paid orgs are never swept.

## Compliance (StaffWise)
Performance Accountability Ledger: append-only (corrections are new entries), every entry response and every exported report embeds the mandatory legal disclaimer verbatim.
