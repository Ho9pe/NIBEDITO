FROM node:22-slim

WORKDIR /app

# --include=dev is required, not a convenience: app.js does require("morgan")
# at runtime but morgan is declared under devDependencies, so a production-only
# install produces an image that crashes on boot with MODULE_NOT_FOUND.
COPY package*.json ./
RUN npm ci --include=dev --no-audit --no-fund

COPY . .

EXPOSE 3001

# secret.js loads ../.env relative to src/, i.e. /app/.env. That file is
# excluded from the image on purpose; compose mounts it in read-only, and real
# environment variables take precedence over it either way.
CMD ["node", "src/server.js"]
