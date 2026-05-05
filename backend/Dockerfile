FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci --legacy-peer-deps --include=dev

COPY . .

RUN npm run build

RUN npx tsc src/seed.ts \
  --outDir dist \
  --esModuleInterop \
  --skipLibCheck \
  --experimentalDecorators \
  --emitDecoratorMetadata \
  --moduleResolution node \
  --target es2021 \
  --module commonjs \
  --rootDir src

RUN npm prune --omit=dev

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV APP_ENV=production
ENV PORT=3000
ENV APP_PORT=3000
ENV API_BASE_URL=""
ENV FRONTEND_BASE_URL=""
ENV FRONTEND_URL=""
ENV CORS_ALLOWED_ORIGINS=""

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]