# echolink

EchoLink — gamified guest acquisition, VIP RFMD segmenting, slow-trickle drip campaigns, gratitude loop, and ordering redirection portal.

Extracted from the Expo Proxy monorepo as a standalone product. The shared data
contract (`@expo-proxy/shared`) is **vendored** into this repository under
`packages/shared/` so the repo has no private-registry or cross-repo
dependencies — clone, install, deploy.

## Layout

```
.
├── packages/shared/   # @expo-proxy/shared — data contract, Google auth, n8n client (vendored)
└── apps/echolink/# the app: src/, tests/, Dockerfile, n8n/ workflow exports
```

The npm-workspace skeleton is kept identical to the original monorepo so the
Dockerfile, tsconfigs, and imports all work unchanged.

## Development

```bash
npm ci
npm run build -w packages/shared   # emit shared type declarations first
npm run typecheck
npm test
npm run build
```

Requires Node >= 20.

## Docker

```bash
docker build -f apps/echolink/Dockerfile .
```

## Deploy (Google Cloud Run)

Use the **echolink — Deploy** workflow (Actions tab). Staging builds the image
via Cloud Build (`cloudbuild.yaml`); production re-deploys the staging image
for the same commit SHA.

Required repository secrets: `GCP_PROJECT`, `GCP_REGION`,
`GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`.

Runtime env vars must be set on the Cloud Run service (the app fails closed
without them) — see the archived monorepo's `BETA_READINESS.md`.

## Keeping the shared contract in sync

`packages/shared/` is a vendored copy. If the canonical contract changes in a
sibling repo, copy the updated `packages/shared/src` here and bump the version
in `packages/shared/package.json`. All Expo Proxy products must speak the same
contract version before deploying together.
