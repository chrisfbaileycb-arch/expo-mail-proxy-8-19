# build: docker build -f apps/echolink/Dockerfile .
# (run from expo-proxy/ workspace root)

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-slim AS build

WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/echolink/package.json   ./apps/echolink/

RUN npm ci

COPY packages/shared/ ./packages/shared/
COPY apps/echolink/   ./apps/echolink/

RUN npm run build -w packages/shared
RUN npm run build -w apps/echolink

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-slim AS runtime

ENV NODE_ENV=production

WORKDIR /repo

COPY --from=build /repo/node_modules                ./node_modules/
COPY --from=build /repo/packages/shared/package.json ./packages/shared/
COPY --from=build /repo/packages/shared/dist        ./packages/shared/dist/
COPY --from=build /repo/apps/echolink/package.json  ./apps/echolink/
COPY --from=build /repo/apps/echolink/dist          ./apps/echolink/dist/

RUN useradd -r -s /bin/false appuser
USER appuser

EXPOSE 8080

CMD ["node", "apps/echolink/dist/index.js"]
