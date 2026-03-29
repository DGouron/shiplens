# --- Base ---
FROM node:22.14.0-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile
RUN pnpm prisma:generate

# --- Build ---
FROM deps AS build
COPY . .
RUN pnpm build

# --- Production ---
FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile --prod
RUN pnpm prisma:generate
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main/main.js"]
