# XMTĐ Websale Backend (NestJS)

Skeleton NestJS API for Websale features (Xi măng Tây Đô):
- `POST /api/auth/login` – mock login with in-memory users (DVKH, NPP), returns JWT.
- `POST /api/auth/change-password` – mock password change (in-memory).
- `GET /api/orders` – list mock orders with optional `?product=` and `?status=` filters.
- `GET /api/shipments` – list mock MSGH (mã số giao hàng), `?orderId=` optional filter.
- `POST /api/shipments` – create MSGH for an order (in-memory).
- `GET /api/reports/invoices` – mock báo cáo hóa đơn/công nợ.
- `GET /api/reports/shipments` – mock bảng kê MSGH.

## Run locally
```bash
cd backend
npm install
npm run start:dev
```
Environment:
- `PORT` (default 3000)
- `JWT_SECRET` (default `change-me`)
- `DB_TYPE` (sqlite/postgres)
- `DATABASE_URL` (optional, overrides DB_HOST/DB_*)
- `DB_NAME` (sqlite file or database name)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS` (postgres)
- `DB_SYNC` (true/false, keep false for production after initial setup)
- `DB_SEED` (true/false, disable for production)
- `CORS_ORIGIN` (comma-separated)
- `SMTP_*` (optional)

## Notes
- Uses SQLite by default; switch to Postgres via env for production.
- Global validation is enabled; DTOs live under `src/**/dto`.
- The API is prefixed with `/api`.

## Docker (Postgres)
At repo root:
```bash
docker compose up --build
```
Frontend: http://localhost:8080  
Backend: http://localhost:3000  
Postgres: localhost:5432
