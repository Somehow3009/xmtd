import { useEffect, useState } from 'react';
import { changePassword, setDistributor } from '../api';
import { UserInfo } from '../api/types';

type Props = {
  user: UserInfo;
  onDistributorChange: (name: string) => void;
};

export function AccountPanel({ user, onDistributorChange }: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [selectedDistributor, setSelectedDistributor] = useState(user.distributor || '');
  const [distMessage, setDistMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDistributor(user.distributor || user.distributors?.[0] || '');
  }, [user.distributor, user.distributors]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePassword(currentPassword, newPassword);
      setMessage('Đổi mật khẩu thành công.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage('Đổi mật khẩu thất bại.');
    }
  };

  const updateDistributor = async () => {
    if (!selectedDistributor) return;
    try {
      await setDistributor(selectedDistributor);
      setDistMessage('Đã chuyển NPP.');
      onDistributorChange(selectedDistributor);
    } catch (err) {
      setDistMessage('Không chuyển được NPP.');
    }
  };

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h3>Tài khoản</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        <div>
          <div className="form-row">
            <label>Tài khoản</label>
            <div className="input" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              {user.username}
            </div>
          </div>
          <div className="form-row">
            <label>Họ tên</label>
            <div className="input" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              {user.fullName}
            </div>
          </div>
          <div className="form-row">
            <label>Vai trò</label>
            <div className="input" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              {user.role}
            </div>
          </div>
          {user.distributor && (
            <div className="form-row">
              <label>Nhà phân phối</label>
              <div className="input" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                {user.distributor}
              </div>
            </div>
          )}
          {user.role === 'DVKH' && (user.distributors?.length ?? 0) > 0 && (
            <div className="form-row">
              <label>Chọn NPP làm việc</label>
              <select
                className="input"
                value={selectedDistributor}
                onChange={(e) => setSelectedDistributor(e.target.value)}
              >
                {user.distributors?.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <button className="btn" type="button" style={{ marginTop: 8 }} onClick={updateDistributor}>
                Chuyển NPP
              </button>
              {distMessage && <div style={{ color: '#9bd8ff' }}>{distMessage}</div>}
            </div>
          )}
        </div>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>Mật khẩu hiện tại</label>
            <input
              className="input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Mật khẩu mới</label>
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {message && <div style={{ color: '#9bd8ff', marginBottom: 8 }}>{message}</div>}
          <button className="btn" type="submit">
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}
