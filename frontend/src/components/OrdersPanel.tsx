import { useEffect, useState } from 'react';
import { fetchOrders } from '../api';
import { Order } from '../api/types';

type Props = {
  onSelectOrder: (order: Order) => void;
  selectedOrderId?: number;
};

export function OrdersPanel({ onSelectOrder, selectedOrderId }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    product: '',
    status: '',
    locked: '',
    expireSoon: '',
  });

  useEffect(() => {
    setLoading(true);
    fetchOrders(filters)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="card">
      <h3>Đơn hàng</h3>
      <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Sản phẩm"
          value={filters.product}
          onChange={(e) => setFilters({ ...filters, product: e.target.value })}
        />
        <select
          className="input"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="confirmed">Xác nhận</option>
          <option value="shipped">Đã giao</option>
        </select>
        <select
          className="input"
          value={filters.locked}
          onChange={(e) => setFilters({ ...filters, locked: e.target.value })}
        >
          <option value="">Tất cả</option>
          <option value="true">Đơn bị khóa</option>
        </select>
        <select
          className="input"
          value={filters.expireSoon}
          onChange={(e) => setFilters({ ...filters, expireSoon: e.target.value })}
        >
          <option value="">Tất cả</option>
          <option value="true">Sắp hết hạn</option>
        </select>
      </form>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>SL</th>
              <th>Ngày giao</th>
              <th>Hết hạn</th>
              <th>Trạng thái</th>
              <th>Khóa</th>
              <th>Duyệt</th>
              <th>Hạn mức giữ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                style={{
                  cursor: 'pointer',
                  background: o.id === selectedOrderId ? 'rgba(0,180,240,0.08)' : undefined,
                }}
                onClick={() => onSelectOrder(o)}
              >
                <td>{o.id}</td>
                <td>{o.product}</td>
                <td>{o.quantity}</td>
                <td>{o.deliveryDate}</td>
                <td>{o.expiresAt || '-'}</td>
                <td>
                  <span className="pill">{o.status}</span>
                </td>
                <td>{o.isLocked ? 'Khóa' : ''}</td>
                <td>{o.approvalStatus}</td>
                <td>{o.creditHold?.toLocaleString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
