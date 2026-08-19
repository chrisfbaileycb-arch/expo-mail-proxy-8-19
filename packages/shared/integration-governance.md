# SYSTEM ARCHITECTURE: Integration & Governance Prompt

**Core Mandate:** All external platform integrations (Google Cloud, Meta/Facebook/Instagram, TikTok) MUST be managed through the `IntegrationGatewayService` (`@expo-proxy/integration-gateway`). Direct app-to-API communication is strictly prohibited.

## 1. Secret Management Policy
- **Zero-Persistence:** No API keys, secrets, or refresh tokens shall reside in app configurations, environment files, or repository code.
- **Dynamic Retrieval:** Agents must use the `SecretProvider` module to request secrets from Google Secret Manager at runtime. Tokens are ephemeral/short-lived.

## 2. The Integration Gateway Pattern
- **Gateway as Sole Proxy:** `IntegrationGatewayService` is the exclusive proxy for all platform traffic. It owns OAuth 2.0 handshake logic, rate limiting, and platform request wrapping.
- **PlatformAccessContract:** Before any external action, an app must present a valid request object matching the `PlatformAccessContract` schema.
- **Agentic Token Scoping:** The Gateway issues a temporary, scoped token per request. Tokens are revoked after the operation completes or the TTL expires — whichever comes first.

## 3. Governance & Auditability
- **Telemetry Requirement:** Every external call is logged via the standard telemetry pipeline with: `Platform`, `AgentID`, `ActionType`, `Timestamp`, `RequestMetadata` (sensitive data excluded).
- **Spending/Action Guardrails:** All advertising integrations (Meta/TikTok) run a pre-flight check against hard Action Limits (e.g., daily spend caps) defined in runtime configuration.
- **Human-in-the-Loop (HITL):** High-stakes changes (budget allocation shifts > 20%, API scope modification) enter `AWAIT_APPROVAL` and require a verification flag from the Command Dashboard before the Gateway authorizes the call.

## 4. Autonomy Verification
- Every integration exposes an **independent health probe**. The system automatically verifies each integration is independently routable and reports metrics to the Dashboard without cross-dependency reliance.

## Failure Protocol
If an integration fails a contract check or hits a rate limit, the Gateway returns a `DIAGNOSTIC_FAULT` to the dashboard — never an internal retry loop that could cause platform account flagging.

## Orchestrator Usage
- **Orchestrator Injection:** Agents asked to "add an integration" must check for the `IntegrationGatewayService` structure first and extend it — never call platform APIs directly.
- **Dashboard as Governor:** The Command Dashboard is the control room for all external advertising spend — observe, monitor, approve.
- **Future-Proofing:** New platforms (LinkedIn, X, …) are added as platform modules inside the Gateway; the rest of the suite remains unchanged.
