import { useEffect, useState } from 'react';
import { createCustomer, createCustomerAccount, fetchCustomerAccounts, fetchCustomers, resetCustomerPassword } from '../api';

type Customer = {
  id: number;
  name: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  creditLimit: number;
  creditUsed: number;
};

export function CustomersPanel() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    taxCode: '',
    address: '',
    phone: '',
    email: '',
    creditLimit: 0,
  });
  const [account, setAccount] = useState({ customerId: 0, username: '', password: '' });
  const [resetForm, setResetForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState<string | null>(null);

  const load = () => {
    fetchCustomers().then(setCustomers);
    fetchCustomerAccounts().then(setAccounts);
  };

  useEffect(() => {
    load();
  }, []);

  const submitCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCustomer({ ...form, creditLimit: Number(form.creditLimit) });
    setMessage('Đã tạo khách hàng');
    setForm({ name: '', taxCode: '', address: '', phone: '', email: '', creditLimit: 0 });
    load();
  };

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCustomerAccount(account.customerId, account.username, account.password);
    setMessage('Đã tạo tài khoản đại lý cấp 1');
    setAccount({ customerId: 0, username: '', password: '' });
    load();
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetCustomerPassword(resetForm.username, resetForm.password);
    setMessage('Đã cấp lại mật khẩu');
    setResetForm({ username: '', password: '' });
    load();
  };

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h3>Quản lý tài khoản đại lý cấp 1</h3>
      {message && <div style={{ color: '#9bd8ff', marginBottom: 8 }}>{message}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <form onSubmit={submitCustomer}>
          <h4>Tạo khách hàng</h4>
          {['name', 'taxCode', 'address', 'phone', 'email'].map((f) => (
            <div className="form-row" key={f}>
              <label>{f}</label>
              <input
                className="input"
                value={(form as any)[f]}
                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                required={f === 'name'}
              />
            </div>
          ))}
          <div className="form-row">
            <label>Hạn mức (VND)</label>
            <input
              className="input"
              type="number"
              value={form.creditLimit}
              onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })}
            />
          </div>
          <button className="btn" type="submit">
            Tạo khách hàng
          </button>
        </form>

        <form onSubmit={submitAccount}>
          <h4>Tạo tài khoản</h4>
          <div className="form-row">
            <label>Khách hàng</label>
            <select
              className="input"
              value={account.customerId}
              onChange={(e) => setAccount({ ...account, customerId: Number(e.target.value) })}
            >
              <option value={0}>Chọn</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Tên đăng nhập</label>
            <input
              className="input"
              value={account.username}
              onChange={(e) => setAccount({ ...account, username: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <label>Mật khẩu</label>
            <input
              className="input"
              value={account.password}
              onChange={(e) => setAccount({ ...account, password: e.target.value })}
              required
            />
          </div>
          <button className="btn" type="submit">
            Tạo tài khoản
          </button>
        </form>

        <form onSubmit={submitReset}>
          <h4>Cấp lại mật khẩu</h4>
          <div className="form-row">
            <label>Tài khoản</label>
            <input
              className="input"
              value={resetForm.username}
              onChange={(e) => setResetForm({ ...resetForm, username: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <label>Mật khẩu mới</label>
            <input
              className="input"
              value={resetForm.password}
              onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
              required
            />
          </div>
          <button className="btn" type="submit">
            Cấp lại
          </button>
        </form>
      </div>

      <h4 style={{ marginTop: 16 }}>Danh sách tài khoản đã cấp</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Tài khoản</th>
            <th>Khách hàng</th>
            <th>Link đăng nhập</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id}>
              <td>{a.username}</td>
              <td>{a.customer?.name || a.fullName}</td>
              <td>{window.location.origin}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: 16 }}>Danh sách khách hàng</h4>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>MST</th>
            <th>Địa chỉ</th>
            <th>Hạn mức</th>
            <th>Đã dùng</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.taxCode}</td>
              <td>{c.address}</td>
              <td>{c.creditLimit.toLocaleString('vi-VN')}</td>
              <td>{c.creditUsed.toLocaleString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
