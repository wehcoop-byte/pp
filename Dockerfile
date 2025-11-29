FROM node:20-slim

# System deps for sharp (& optional canvas fonts)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl fontconfig libvips \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm i --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node", "dist/index.js"]
