import { useEffect, useState } from 'react';
import {
  checkShipmentCode,
  copyShipment,
  createShipment,
  deleteShipment,
  fetchShipments,
  inspectShipment,
  receiveShipment,
  updateShipment,
} from '../api';
import { Shipment } from '../api/types';

type Props = {
  orderId?: number;
  canManage?: boolean;
};

type FormState = {
  pickupLocation: string;
  dropoffLocation: string;
  vehicle: string;
  notes?: string;
  status?: string;
};

const initialForm: FormState = {
  pickupLocation: '',
  dropoffLocation: '',
  vehicle: '',
  notes: '',
  status: 'draft',
};

export function ShipmentsPanel({ orderId, canManage = false }: Props) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [message, setMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    code: '',
    vehicle: '',
    pickupLocation: '',
    dropoffLocation: '',
    status: '',
    inspectionStatus: '',
    received: '',
    product: '',
    from: '',
    to: '',
  });
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [checkCode, setCheckCode] = useState('');

  const load = (id?: number) => {
    setLoading(true);
    fetchShipments({ ...filters, orderId: id })
      .then(setShipments)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const updated = await updateShipment(editing.id, { ...form, orderId: orderId || editing.order?.id });
        setMessage(`Cập nhật ${updated.code} thành công`);
      } else {
        if (!orderId) {
          setMessage('Chọn đơn hàng trước khi tạo MSGH.');
          return;
        }
        const { pickupLocation, dropoffLocation, vehicle, notes } = form;
        const created = await createShipment({ orderId, pickupLocation, dropoffLocation, vehicle, notes });
        setMessage(`Tạo thành công ${created.code}`);
      }
      setForm(initialForm);
      setEditing(null);
      load(orderId);
    } catch (err) {
      setMessage('Không xử lý được, kiểm tra dữ liệu.');
    }
  };

  const onEdit = (s: Shipment) => {
    setEditing(s);
    setForm({
      pickupLocation: s.pickupLocation,
      dropoffLocation: s.dropoffLocation,
      vehicle: s.vehicle,
      notes: s.notes || '',
    });
  };

  const onDelete = async (s: Shipment) => {
    await deleteShipment(s.id);
    setMessage(`Đã xóa ${s.code}`);
    load(orderId);
  };

  const onCopy = async (s: Shipment) => {
    await copyShipment(s.id);
    setMessage(`Đã sao chép ${s.code}`);
    load(orderId);
  };

  const onReceive = async (s: Shipment) => {
    try {
      await receiveShipment(s.id);
      setMessage(`Đã xác nhận nhận hàng và xuất hóa đơn cho ${s.code}`);
      load(orderId);
    } catch (err) {
      setMessage('Chưa thể nhận hàng: MSGH cần được duyệt trước.');
    }
  };

  const onInspect = async (s: Shipment, approve: boolean) => {
    await inspectShipment(s.id, approve);
    setMessage(`MSGH ${s.code} ${approve ? 'đã duyệt' : 'bị từ chối'}`);
    load(orderId);
  };

  const doCheckCode = async () => {
    if (!checkCode) return;
    const res = await checkShipmentCode(checkCode);
    if (res) {
      setMessage(`Mã ${checkCode} tồn tại: trạng thái ${res.status}, duyệt ${res.inspectionStatus}`);
    } else {
      setMessage(`Mã ${checkCode} không tồn tại`);
    }
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    load(orderId);
  };

  return (
    <div className="card">
      <h3>MSGH / Giao hàng</h3>
      <form onSubmit={applyFilters} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginBottom: 12 }}>
        {[
          ['code', 'Mã MSGH'],
          ['vehicle', 'Xe/Ghe'],
          ['pickupLocation', 'Nơi nhận'],
          ['dropoffLocation', 'Nơi dỡ'],
          ['product', 'Sản phẩm'],
        ].map(([key, label]) => (
          <input
            key={key}
            className="input"
            placeholder={label}
            value={(filters as any)[key]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
          />
        ))}
        <select
          className="input"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="scheduled">Lịch giao</option>
          <option value="delivered">Đã giao</option>
        </select>
        <select
          className="input"
          value={filters.inspectionStatus}
          onChange={(e) => setFilters({ ...filters, inspectionStatus: e.target.value })}
        >
          <option value="">Duyệt MSGH</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
        <select
          className="input"
          value={filters.received}
          onChange={(e) => setFilters({ ...filters, received: e.target.value })}
        >
          <option value="">Nhận hàng</option>
          <option value="true">Đã nhận</option>
          <option value="false">Chưa nhận</option>
        </select>
        <input
          className="input"
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
        <input
          className="input"
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
        <button className="btn" type="submit" style={{ minHeight: 40 }}>
          Lọc
        </button>
      </form>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Kiểm tra mã MSGH"
          value={checkCode}
          onChange={(e) => setCheckCode(e.target.value)}
        />
        <button className="btn btn--ghost" type="button" onClick={doCheckCode}>
          Kiểm tra
        </button>
      </div>

      {message && <div className="hint" style={{ marginBottom: 8 }}>{message}</div>}

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Đơn</th>
                <th>Nơi nhận</th>
                <th>Nơi dỡ</th>
                <th>Xe/Ghe</th>
                <th>Trạng thái</th>
                <th>Duyệt</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id}>
                  <td>{s.code}</td>
                  <td>{s.order?.id || s.orderId}</td>
                  <td>{s.pickupLocation}</td>
                  <td>{s.dropoffLocation}</td>
                  <td>{s.vehicle}</td>
                  <td>
                    <span className="pill" data-variant={s.status}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <span className="pill" data-variant={s.inspectionStatus || 'pending'}>
                      {s.inspectionStatus || 'pending'}
                    </span>
                  </td>
                  <td>
                    {canManage && (
                      <div className="table-actions">
                        <button className="btn btn--ghost" type="button" onClick={() => onEdit(s)}>
                          Sửa
                        </button>
                        <button className="btn btn--ghost" type="button" onClick={() => onCopy(s)}>
                          Sao chép
                        </button>
                        <button className="btn" type="button" onClick={() => onInspect(s, true)}>
                          Duyệt
                        </button>
                        <button className="btn btn--ghost" type="button" onClick={() => onInspect(s, false)}>
                          Từ chối
                        </button>
                        <button className="btn" type="button" onClick={() => onReceive(s)}>
                          Nhận hàng
                        </button>
                        <button className="btn btn--danger" type="button" onClick={() => onDelete(s)}>
                          Xóa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {shipments.length === 0 && (
                <tr>
                  <td className="empty" colSpan={8}>
                    Chưa có MSGH.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {canManage && (
        <form onSubmit={submit} style={{ marginTop: 16 }}>
        <div className="form-row">
          <label>Nơi nhận hàng</label>
          <input
            className="input"
            value={form.pickupLocation}
            onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <label>Nơi dỡ hàng</label>
          <input
            className="input"
            value={form.dropoffLocation}
            onChange={(e) => setForm({ ...form, dropoffLocation: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <label>Số xe/ghe</label>
          <input
            className="input"
            value={form.vehicle}
            onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <label>Trạng thái</label>
          <select
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Nháp</option>
            <option value="scheduled">Lịch giao</option>
            <option value="delivered">Đã giao</option>
          </select>
        </div>
        <div className="form-row">
          <label>Ghi chú</label>
          <input
            className="input"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <button className="btn" type="submit">
          {editing ? 'Cập nhật MSGH' : 'Tạo MSGH'}
        </button>
        {editing && (
          <button
            className="btn btn--ghost"
            type="button"
            style={{ marginLeft: 8 }}
            onClick={() => {
              setEditing(null);
              setForm(initialForm);
            }}
          >
            Hủy sửa
          </button>
        )}
        </form>
      )}
    </div>
  );
}
