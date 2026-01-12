# XMTĐ Websale Frontend (SPA)

React + Vite SPA mock: đăng nhập, xem đơn, tạo MSGH, báo cáo, tài khoản (Xi măng Tây Đô).

## Chạy dev
```bash
cd frontend
npm install
npm run dev
```
Mặc định proxy `/api` sang `http://localhost:3000` (Nest backend). Đổi trong `vite.config.ts` nếu cần.

## ENV
- `VITE_API_BASE` (default `/api`)

## Cấu trúc chính
- `src/App.tsx` – layout, tab Đơn hàng/MSGH, Báo cáo, Tài khoản.
- `src/components/LoginPanel.tsx` – form đăng nhập (mock user: `dvkh1` / `password123`).
- `src/components/OrdersPanel.tsx` – danh sách đơn mock.
- `src/components/ShipmentsPanel.tsx` – danh sách và form tạo MSGH.
- `src/components/ReportsPanel.tsx` – báo cáo hóa đơn/công nợ, bảng kê MSGH.
- `src/components/AccountPanel.tsx` – thông tin user + đổi mật khẩu (mock).
- `src/api/*` – axios client + wrapper gọi API.

## Ghi chú
- Token lưu tạm vào `localStorage`; cần thay bằng cookie httpOnly khi dùng backend thật.
- UI nền tối, giữ màu thương hiệu #00b4f0.
