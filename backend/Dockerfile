FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npx tsc src/seed.ts --outDir dist --esModuleInterop --skipLibCheck --experimentalDecorators --emitDecoratorMetadata --moduleResolution node --target es2021 --module commonjs --rootDir src

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

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
