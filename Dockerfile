# syntax=docker/dockerfile:1

############################################
# Stage 1 — build (Node + pnpm)
############################################
FROM node:22-alpine AS build

WORKDIR /app

# Reproducible installs; pin matches local pnpm lockfile era
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

# Dependency layer first (better cache when only source changes)
COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

# Vite embeds VITE_* at build time — pass via --build-arg
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm run build

############################################
# Stage 2 — runtime (static nginx, non-root)
############################################
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Labels (OCI)
LABEL org.opencontainers.image.title="roadmap-studio" \
      org.opencontainers.image.description="Roadmap Studio React SPA"

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

# nginx user is already set in the base image
CMD ["nginx", "-g", "daemon off;"]
