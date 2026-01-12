import { useEffect, useState } from 'react';
import { approveOrder, createOrder, fetchCatalog, fetchCustomers } from '../api';
import { UserInfo } from '../api/types';

type Props = {
  user: UserInfo;
};

export function OrderCreatePanel({ user }: Props) {
  const [catalogs, setCatalogs] = useState<Record<string, string[]>>({});
  const [customers, setCustomers] = useState<{ id: number; name: string; creditLimit: number; creditUsed: number }[]>(
    [],
  );
  const [form, setForm] = useState({
    customerId: 0,
    product: '',
    quantity: 0,
    deliveryDate: '',
    cementType: '',
    deliveryMethod: '',
    serviceType: '',
    transactionType: '',
    pickupLocation: '',
    store: '',
    region: '',
    vehicle: '',
    trailer: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (user.role === 'NPP' && user.customerId) {
      setForm((prev) => ({ ...prev, customerId: user.customerId || 0 }));
    }
    const load = async () => {
      const types = ['deliveryMethod', 'serviceType', 'cementType', 'transactionType', 'location', 'store', 'region'];
      const entries: Record<string, string[]> = {};
      for (const t of types) {
        const data = await fetchCatalog(t);
        entries[t] = data.map((d) => d.name);
      }
      setCatalogs(entries);
      if (user.role === 'DVKH') {
        const cust = await fetchCustomers();
        setCustomers(cust);
      } else if (user.customerId) {
        setCustomers([{ id: user.customerId, name: user.customerName || user.fullName, creditLimit: user.creditLimit || 0, creditUsed: user.creditUsed || 0 }]);
      }
    };
    load();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((Math.round(form.quantity * 100) % 5) !== 0) {
      setMessage('Số lượng phải theo bước 0.05 tấn (50kg).');
      return;
    }
    const res = await createOrder(form);
    setMessage(`Đã tạo đơn #${res.id} (duyệt: ${res.approvalStatus})`);
    setLastOrderId(res.id);
  };

  const approve = async (approveValue: boolean) => {
    if (!lastOrderId) return;
    const res = await approveOrder(lastOrderId, approveValue, 'manager');
    setMessage(`Đơn #${res.id} ${approveValue ? 'được duyệt' : 'bị từ chối'}`);
  };

  const creditInfo = customers.find((c) => c.id === Number(form.customerId));
  const creditRemaining =
    creditInfo ? creditInfo.creditLimit - creditInfo.creditUsed : undefined;

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h3>Đặt hàng (có kiểm tra hạn mức)</h3>
      {message && <div style={{ color: '#9bd8ff', marginBottom: 8 }}>{message}</div>}
      <form
        onSubmit={submit}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}
      >
        <div className="form-row">
          <label>Khách hàng</label>
          <select
            className="input"
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: Number(e.target.value) })}
            required
            disabled={user.role === 'NPP'}
          >
            <option value={0}>Chọn</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {creditRemaining !== undefined && (
            <small>Hạn mức còn lại: {creditRemaining.toLocaleString('vi-VN')} VND</small>
          )}
        </div>
        <div className="form-row">
          <label>Loại xi măng</label>
          <select
            className="input"
            value={form.cementType}
            onChange={(e) => setForm({ ...form, cementType: e.target.value })}
            required
          >
            <option value="">Chọn</option>
            {catalogs.cementType?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Sản phẩm</label>
          <input
            className="input"
            value={form.product}
            onChange={(e) => setForm({ ...form, product: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <label>Số lượng (tấn, bước 0.05)</label>
          <input
            className="input"
            type="number"
            step="0.05"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            required
          />
        </div>
        <div className="form-row">
          <label>Ngày giao</label>
          <input
            className="input"
            type="date"
            value={form.deliveryDate}
            onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <label>Phương thức giao hàng</label>
          <select
            className="input"
            value={form.deliveryMethod}
            onChange={(e) => setForm({ ...form, deliveryMethod: e.target.value })}
          >
            <option value="">Chọn</option>
            {catalogs.deliveryMethod?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Dịch vụ xuất hàng</label>
          <select
            className="input"
            value={form.serviceType}
            onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
          >
            <option value="">Chọn</option>
            {catalogs.serviceType?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Loại giao dịch</label>
          <select
            className="input"
            value={form.transactionType}
            onChange={(e) => setForm({ ...form, transactionType: e.target.value })}
          >
            <option value="">Chọn</option>
            {catalogs.transactionType?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Địa điểm nhận</label>
          <select
            className="input"
            value={form.pickupLocation}
            onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
          >
            <option value="">Chọn</option>
            {catalogs.location?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Cửa hàng</label>
          <select
            className="input"
            value={form.store}
            onChange={(e) => setForm({ ...form, store: e.target.value })}
          >
            <option value="">Chọn</option>
            {catalogs.store?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Vùng</label>
          <select
            className="input"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          >
            <option value="">Chọn</option>
            {catalogs.region?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Xe/Ghe</label>
          <input
            className="input"
            value={form.vehicle}
            onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
          />
        </div>
        <div className="form-row">
          <label>Rơ-mooc</label>
          <input
            className="input"
            value={form.trailer}
            onChange={(e) => setForm({ ...form, trailer: e.target.value })}
          />
        </div>
        <button className="btn" type="submit" style={{ gridColumn: '1 / -1' }}>
          Tạo đơn
        </button>
      </form>

  {lastOrderId && user.role === 'DVKH' && (
    <div style={{ marginTop: 12 }}>
      <button className="btn" onClick={() => approve(true)}>
        Duyệt đơn #{lastOrderId}
      </button>
          <button className="btn" style={{ marginLeft: 8 }} onClick={() => approve(false)}>
            Từ chối đơn #{lastOrderId}
          </button>
        </div>
      )}
    </div>
  );
}
