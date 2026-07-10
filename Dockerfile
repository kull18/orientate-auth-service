# --- Etapa 1: Compilación ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build
RUN mkdir -p dist/core/database && cp src/core/database/init.sql dist/core/database/init.sql

# --- Etapa 2: Ejecución en Producción ---
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]
