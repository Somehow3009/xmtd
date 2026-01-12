import { useEffect, useState } from 'react';
import {
  createManualInvoice,
  exportFile,
  exportCsv,
  fetchCustomerCreditReport,
  fetchCustomerInvoicesReport,
  fetchInventoryReport,
  fetchInvoiceReport,
  fetchShipmentDetailReport,
  fetchShipmentReport,
} from '../api';

type InvoiceRow = Awaited<ReturnType<typeof fetchInvoiceReport>>[number];
type ShipmentRow = Awaited<ReturnType<typeof fetchShipmentReport>>[number];
type ShipmentDetailRow = Awaited<ReturnType<typeof fetchShipmentDetailReport>>[number];
type CreditRow = Awaited<ReturnType<typeof fetchCustomerCreditReport>>[number];
type CustomerInvoiceRow = Awaited<ReturnType<typeof fetchCustomerInvoicesReport>>[number];

export function ReportsPanel() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetailRow[]>([]);
  const [creditRows, setCreditRows] = useState<CreditRow[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoiceRow[]>([]);
  const [inventory, setInventory] = useState<{ promotion: any[]; consignment: any[] }>({ promotion: [], consignment: [] });
  const [loading, setLoading] = useState(true);
  const [invoiceForm, setInvoiceForm] = useState({
    customer: '',
    amount: 0,
    dueDate: '',
    status: 'unpaid',
  });
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    status: '',
    pickupLocation: '',
    dropoffLocation: '',
    product: '',
    customer: '',
  });

  const load = () => {
    setLoading(true);
    const invoiceParams = { from: filters.from, to: filters.to };
    Promise.all([
      fetchInvoiceReport(invoiceParams),
      fetchShipmentReport(filters),
      fetchShipmentDetailReport(filters),
      fetchCustomerCreditReport(),
      fetchCustomerInvoicesReport(filters.customer),
      fetchInventoryReport(),
    ])
      .then(([inv, ship, detail, credit, custInv, invReport]) => {
        setInvoices(inv);
        setShipments(ship);
        setShipmentDetails(detail);
        setCreditRows(credit);
        setCustomerInvoices(custInv);
        setInventory(invReport);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const downloadShipments = async () => {
    const blob = await exportCsv('/reports/shipments/export', filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadInvoices = async () => {
    const blob = await exportCsv('/reports/invoices/export', filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDetail = async (format: 'xlsx' | 'pdf') => {
    const blob = await exportFile(`/reports/shipments/detail/export/${format}`, filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipment-detail.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCredit = async (format: 'xlsx' | 'pdf') => {
    const blob = await exportFile(`/reports/customers/credit/export/${format}`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-credit.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCustomerInvoices = async (format: 'xlsx' | 'pdf') => {
    const blob = await exportFile(`/reports/customers/invoices/export/${format}`, {
      customer: filters.customer || undefined,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-invoices.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadInventory = async (format: 'xlsx' | 'pdf') => {
    const blob = await exportFile(`/reports/inventory/export/${format}`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitManualInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    await createManualInvoice({
      customer: invoiceForm.customer,
      amount: Number(invoiceForm.amount),
      dueDate: invoiceForm.dueDate,
      status: invoiceForm.status,
    });
    setInvoiceForm({ customer: '', amount: 0, dueDate: '', status: 'unpaid' });
    load();
  };

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h3>Báo cáo nhanh</h3>
      <form
        onSubmit={applyFilters}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginBottom: 12 }}
      >
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
        <select
          className="input"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Trạng thái MSGH</option>
          <option value="draft">Nháp</option>
          <option value="scheduled">Lịch giao</option>
          <option value="delivered">Đã giao</option>
        </select>
        <input
          className="input"
          placeholder="Nơi nhận"
          value={filters.pickupLocation}
          onChange={(e) => setFilters({ ...filters, pickupLocation: e.target.value })}
        />
        <input
          className="input"
          placeholder="Nơi dỡ"
          value={filters.dropoffLocation}
          onChange={(e) => setFilters({ ...filters, dropoffLocation: e.target.value })}
        />
        <input
          className="input"
          placeholder="Sản phẩm"
          value={filters.product}
          onChange={(e) => setFilters({ ...filters, product: e.target.value })}
        />
        <input
          className="input"
          placeholder="Khách hàng"
          value={filters.customer}
          onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
        />
        <button className="btn" type="submit">
          Lọc báo cáo
        </button>
        <button className="btn" type="button" onClick={downloadShipments}>
          Xuất MSGH CSV
        </button>
        <button className="btn" type="button" onClick={downloadInvoices}>
          Xuất hóa đơn CSV
        </button>
        <button className="btn" type="button" onClick={() => downloadDetail('xlsx')}>
          Chi tiết xuất hàng XLSX
        </button>
        <button className="btn" type="button" onClick={() => downloadDetail('pdf')}>
          Chi tiết xuất hàng PDF
        </button>
      </form>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <h4 style={{ marginTop: 12 }}>Hóa đơn & công nợ</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Số HĐ</th>
                <th>Khách hàng</th>
                <th>Giá trị</th>
                <th>Hạn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.invoiceNo}>
                  <td>{i.invoiceNo}</td>
                  <td>{i.customer}</td>
                  <td>{i.amount.toLocaleString('vi-VN')}</td>
                  <td>{i.dueDate}</td>
                  <td>
                    <span className="pill">{i.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ marginTop: 20 }}>Bảng kê mã số giao hàng</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Sản phẩm</th>
                <th>SL</th>
                <th>Nơi nhận</th>
                <th>Nơi dỡ</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.code}>
                  <td>{s.code}</td>
                  <td>{s.product}</td>
                  <td>{s.quantity}</td>
                  <td>{s.pickupLocation}</td>
                  <td>{s.dropoffLocation}</td>
                  <td>{s.date}</td>
                  <td>
                    <span className="pill">{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ marginTop: 20 }}>Bảng kê chi tiết xuất hàng</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Sản phẩm</th>
                <th>Loại XM</th>
                <th>SL</th>
                <th>Phương thức</th>
                <th>Dịch vụ</th>
                <th>Giao dịch</th>
                <th>Nơi nhận</th>
                <th>Nơi dỡ</th>
                <th>Xe/Ghe</th>
                <th>Vùng</th>
                <th>Cửa hàng</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {shipmentDetails.map((s: any) => (
                <tr key={s.code}>
                  <td>{s.code}</td>
                  <td>{s.product}</td>
                  <td>{s.cementType}</td>
                  <td>{s.quantity}</td>
                  <td>{s.deliveryMethod}</td>
                  <td>{s.serviceType}</td>
                  <td>{s.transactionType}</td>
                  <td>{s.pickupLocation}</td>
                  <td>{s.dropoffLocation}</td>
                  <td>{s.vehicle}</td>
                  <td>{s.region}</td>
                  <td>{s.store}</td>
                  <td>{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ marginTop: 20 }}>Công nợ & hạn mức khách hàng</h4>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className="btn" type="button" onClick={() => downloadCredit('xlsx')}>
              Xuất công nợ XLSX
            </button>
            <button className="btn" type="button" onClick={() => downloadCredit('pdf')}>
              Xuất công nợ PDF
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Hạn mức</th>
                <th>Đã dùng</th>
                <th>Còn lại</th>
                <th>Nợ chưa thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {creditRows.map((c: any) => (
                <tr key={c.customer}>
                  <td>{c.customer}</td>
                  <td>{c.creditLimit.toLocaleString('vi-VN')}</td>
                  <td>{c.creditUsed.toLocaleString('vi-VN')}</td>
                  <td>{c.creditRemaining.toLocaleString('vi-VN')}</td>
                  <td>{c.unpaidAmount.toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ marginTop: 20 }}>Thông tin hóa đơn khách hàng</h4>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className="btn" type="button" onClick={() => downloadCustomerInvoices('xlsx')}>
              Xuất hóa đơn XLSX
            </button>
            <button className="btn" type="button" onClick={() => downloadCustomerInvoices('pdf')}>
              Xuất hóa đơn PDF
            </button>
          </div>
          <form onSubmit={submitManualInvoice} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginBottom: 12 }}>
            <input
              className="input"
              placeholder="Khách hàng"
              value={invoiceForm.customer}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, customer: e.target.value })}
              required
            />
            <input
              className="input"
              type="number"
              placeholder="Số tiền"
              value={invoiceForm.amount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
              required
            />
            <input
              className="input"
              type="date"
              value={invoiceForm.dueDate}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
              required
            />
            <select
              className="input"
              value={invoiceForm.status}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value })}
            >
              <option value="unpaid">Chưa trả</option>
              <option value="paid">Đã trả</option>
              <option value="overdue">Quá hạn</option>
            </select>
            <button className="btn" type="submit">
              Xuất hóa đơn thủ công
            </button>
          </form>
          <table className="table">
            <thead>
              <tr>
                <th>Số HĐ</th>
                <th>Khách hàng</th>
                <th>Giá trị</th>
                <th>Hạn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {customerInvoices.map((i: any) => (
                <tr key={i.invoiceNo}>
                  <td>{i.invoiceNo}</td>
                  <td>{i.customer}</td>
                  <td>{i.amount.toLocaleString('vi-VN')}</td>
                  <td>{i.dueDate}</td>
                  <td>{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ marginTop: 20 }}>Quản lý xuất nhập tồn</h4>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className="btn" type="button" onClick={() => downloadInventory('xlsx')}>
              Xuất tồn kho XLSX
            </button>
            <button className="btn" type="button" onClick={() => downloadInventory('pdf')}>
              Xuất tồn kho PDF
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Nhóm</th>
                <th>Loại XM</th>
                <th>SL (tấn)</th>
              </tr>
            </thead>
            <tbody>
              {inventory.promotion.map((r: any) => (
                <tr key={`promo-${r.cementType}`}>
                  <td>Khuyến mại</td>
                  <td>{r.cementType}</td>
                  <td>{r.quantity}</td>
                </tr>
              ))}
              {inventory.consignment.map((r: any) => (
                <tr key={`cons-${r.cementType}`}>
                  <td>Gửi kho</td>
                  <td>{r.cementType}</td>
                  <td>{r.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
