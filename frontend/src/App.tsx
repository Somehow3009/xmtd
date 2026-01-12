import { useEffect, useMemo, useState } from 'react';
import { LoginPanel } from './components/LoginPanel';
import { OrdersPanel } from './components/OrdersPanel';
import { ShipmentsPanel } from './components/ShipmentsPanel';
import { ReportsPanel } from './components/ReportsPanel';
import { AccountPanel } from './components/AccountPanel';
import { OrderCreatePanel } from './components/OrderCreatePanel';
import { CustomersPanel } from './components/CustomersPanel';
import { UserInfo, Order } from './api/types';
import { fetchProfile } from './api';

function useUser() {
  const [user, setUserState] = useState<UserInfo | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as UserInfo) : null;
  });
  return {
    user,
    setUser: (next: UserInfo | null) => {
      if (next) {
        localStorage.setItem('user', JSON.stringify(next));
      } else {
        localStorage.removeItem('user');
      }
      setUserState(next);
    },
    clear: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUserState(null);
    },
  };
}

export default function App() {
  const { user, setUser, clear } = useUser();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tab, setTab] = useState<'orders' | 'reports' | 'account' | 'create-order' | 'customers'>('orders');
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      setSelectedOrder(null);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoadingProfile(true);
    fetchProfile()
      .then((p) => {
        setUser({ ...user, ...p });
      })
      .finally(() => setLoadingProfile(false));
  }, [user?.username]);

  const heroText = useMemo(
    () => (user ? `Xin chào ${user.fullName}` : 'XMTĐ Websale'),
    [user],
  );

  return (
    <div className="page">
      <header className="nav">
        <img src="/xmtd-logo.svg" alt="XMTĐ" />
        <div className="nav-title">
          {heroText}
          <div style={{ fontSize: 11, opacity: 0.85 }}>Version SPA demo</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {user && (
            <>
              <button
                className="btn"
                style={{ background: tab === 'orders' ? 'linear-gradient(135deg,#00b4f0,#0090c7)' : '#0c2a3d' }}
                onClick={() => setTab('orders')}
              >
                Đơn hàng/MSGH
              </button>
              <button
                className="btn"
                style={{ background: tab === 'create-order' ? 'linear-gradient(135deg,#00b4f0,#0090c7)' : '#0c2a3d' }}
                onClick={() => setTab('create-order')}
              >
                Đặt hàng
              </button>
              {user.role === 'DVKH' && (
                <>
                  <button
                    className="btn"
                    style={{ background: tab === 'reports' ? 'linear-gradient(135deg,#00b4f0,#0090c7)' : '#0c2a3d' }}
                    onClick={() => setTab('reports')}
                  >
                    Báo cáo
                  </button>
                  <button
                    className="btn"
                    style={{ background: tab === 'customers' ? 'linear-gradient(135deg,#00b4f0,#0090c7)' : '#0c2a3d' }}
                    onClick={() => setTab('customers')}
                  >
                    Khách hàng
                  </button>
                </>
              )}
              <button
                className="btn"
                style={{ background: tab === 'account' ? 'linear-gradient(135deg,#00b4f0,#0090c7)' : '#0c2a3d' }}
                onClick={() => setTab('account')}
              >
                Tài khoản
              </button>
            </>
          )}
          {user ? (
            <button className="btn" onClick={clear}>
              Đăng xuất
            </button>
          ) : null}
        </div>
      </header>

      <main className="content">
        {!user && <LoginPanel onLoggedIn={({ user: u }) => setUser(u)} />}
        {user && tab === 'orders' && (
          <>
            <OrdersPanel
              onSelectOrder={(order) => setSelectedOrder(order)}
              selectedOrderId={selectedOrder?.id}
            />
            <ShipmentsPanel orderId={selectedOrder?.id} canManage={user.role === 'DVKH'} />
          </>
        )}
        {user && tab === 'reports' && user.role === 'DVKH' && <ReportsPanel />}
        {user && tab === 'create-order' && <OrderCreatePanel user={user} />}
        {user && tab === 'customers' && user.role === 'DVKH' && <CustomersPanel />}
        {user && tab === 'account' && (
          <AccountPanel
            user={user}
            onDistributorChange={(name) => setUser({ ...(user as UserInfo), distributor: name })}
          />
        )}
        {user && loadingProfile && <div style={{ gridColumn: '1 / -1' }}>Đang tải hồ sơ...</div>}
      </main>

      <footer className="footer">
        © 2025 XI MĂNG TÂY ĐÔ (XMTĐ) · Hotline DVKH: 0919495969
      </footer>
    </div>
  );
}
