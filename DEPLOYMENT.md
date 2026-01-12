# XMTĐ Websale Deployment

## Docker Compose (recommended)
At repo root:
```bash
docker compose up --build
```
Services:
- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- Postgres: localhost:5432

First run defaults:
- `DB_SYNC=true` (auto create schema)
- `DB_SEED=true` (seed sample data)
After first run, set `DB_SYNC=false` and `DB_SEED=false` for production.

## Environment
Backend uses `.env` (see `backend/.env.example`).
Frontend uses `.env` (see `frontend/.env.example`).

## SMTP (optional)
Set SMTP vars in backend env to enable invoice email sending:
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
