# archi_hotel

Repository layout after splitting backend and frontend:

- `backend/`: NestJS API (former repository root backend code)
- `frontend/`: Frontend application

## Quick start

### Full stack with Docker

```bash
cp .env.example .env
docker compose up --build
```

Endpoints:

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`
- PgAdmin: `http://localhost:5050` with `--profile tools`

The Docker setup serves the frontend behind Nginx and proxies `/api` to the backend container, so browser calls stay same-origin and avoid CORS issues.
PostgreSQL is intentionally not published on the host by default, which avoids conflicts with a local database already running on `5432`.

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

In local development, Angular uses `/api` through `proxy.conf.json`. The backend CORS allow-list is now driven by `CORS_ALLOWED_ORIGINS` and defaults to `http://localhost:4200,http://localhost:3000`.
