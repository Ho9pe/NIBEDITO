FROM node:22-slim AS builder

WORKDIR /app

# devDependencies hold typescript, tailwind, postcss and autoprefixer, all of
# which the build needs, so dev deps cannot be omitted here.
COPY package*.json ./
RUN npm ci --include=dev --no-audit --no-fund

COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, not
# read at runtime. This has to be a build arg: setting it as a container
# environment variable later has no effect, and changing it means rebuilding.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build


FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/next-env.d.ts ./

EXPOSE 3000

# -H 0.0.0.0 so the port is reachable from outside the container.
CMD ["npx", "next", "start", "-H", "0.0.0.0"]
