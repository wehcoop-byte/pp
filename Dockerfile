# syntax=docker/dockerfile:1
FROM node:20-slim
RUN apt-get update && apt-get install -y     python3 build-essential libcairo2 libpango1.0-0 libjpeg62-turbo libgif7 librsvg2-2   && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server/package*.json ./
COPY server/tsconfig.json ./
RUN npm install
COPY server ./
RUN npm run build
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/index.js"]
