import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api/client';
import {
  CognitoUserPool, CognitoUser, AuthenticationDetails,
} from 'amazon-cognito-identity-js';

const USER_POOL_ID = import.meta.env.VITE_COGNITO_POOL_ID || 'us-east-2_XXXXXXXXX';
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX';

const userPool = new CognitoUserPool({ UserPoolId: USER_POOL_ID, ClientId: CLIENT_ID });

const queryClient = new QueryClient();

// ── Login Screen ───────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.authenticateUser(new AuthenticationDetails({ Username: email, Password: password }), {
      onSuccess: (result) => {
        const token = result.getIdToken().getJwtToken();
        localStorage.setItem('admin_id_token', token);
        onLogin(token);
        setLoading(false);
      },
      onFailure: (err) => {
        setError(err.message || 'Login failed');
        setLoading(false);
      },
    });
  };

  return (
    <div style={S.loginPage}>
      <div style={S.loginCard}>
        <h1 style={{ fontSize: 36, marginBottom: 4 }}>朝茶</h1>
        <h2 style={{ marginBottom: 24, color: '#6B4F3A' }}>Admin Panel</h2>
        <form onSubmit={handleLogin}>
          <input
            style={S.input} type="email" placeholder="Admin email"
            value={email} onChange={e => setEmail(e.target.value)} required
          />
          <input
            style={S.input} type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)} required
          />
          {error && <p style={{ color: '#E53935', marginBottom: 12 }}>{error}</p>}
          <button style={S.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('stats');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [couponLookup, setCouponLookup] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await apiClient.get('/api/v1/admin/game/stats')).data,
    refetchInterval: 30000,
  });

  const { data: couponTypes } = useQuery({
    queryKey: ['admin', 'couponTypes'],
    queryFn: async () => (await apiClient.get('/api/v1/admin/coupon-types')).data,
  });

  const { data: gameConfigs } = useQuery({
    queryKey: ['admin', 'gameConfig'],
    queryFn: async () => (await apiClient.get('/api/v1/admin/game/config')).data,
  });

  const sendNotif = useMutation({
    mutationFn: async () =>
      (await apiClient.post('/api/v1/admin/notifications/send', { title: notifTitle, body: notifBody })).data,
    onSuccess: (data) => {
      setNotifMsg(`✅ Sent to ${data.recipientCount} users`);
      setNotifTitle(''); setNotifBody('');
    },
  });

  const updateConfig = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) =>
      apiClient.put(`/api/v1/admin/game/config/${key}`, { value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'gameConfig'] }),
  });

  const toggleCoupon = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiClient.put(`/api/v1/admin/coupon-types/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'couponTypes'] }),
  });

  const handleLookup = async () => {
    if (!couponLookup.trim()) return;
    try {
      const { data } = await apiClient.get(`/api/v1/admin/coupons/lookup?code=${couponLookup.trim().toUpperCase()}`);
      setLookupResult(data);
    } catch {
      setLookupResult({ error: 'Coupon not found' });
    }
  };

  const tabs = ['stats', 'coupons', 'config', 'push', 'lookup'];

  return (
    <div style={S.dashboard}>
      <div style={S.sidebar}>
        <h2 style={{ color: '#C8892A', padding: '20px 16px 8px' }}>朝茶 Admin</h2>
        {tabs.map(tab => (
          <button
            key={tab}
            style={{ ...S.sidebarBtn, ...(activeTab === tab ? S.sidebarBtnActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'stats' ? '📊 Analytics' :
             tab === 'coupons' ? '🎫 Coupons' :
             tab === 'config' ? '⚙️ Game Config' :
             tab === 'push' ? '📲 Push Notifications' :
             '🔍 Coupon Lookup'}
          </button>
        ))}
        <button
          style={{ ...S.sidebarBtn, marginTop: 'auto', color: '#E53935' }}
          onClick={() => { localStorage.removeItem('admin_id_token'); window.location.reload(); }}
        >
          🚪 Log Out
        </button>
      </div>

      <div style={S.mainContent}>
        {activeTab === 'stats' && (
          <div>
            <h2 style={S.pageTitle}>📊 Weekly Analytics</h2>
            <div style={S.statsGrid}>
              <StatCard title="Week Start" value={stats?.weekStart || '—'} />
              <StatCard title="Total Plays" value={stats?.totalPlays ?? '—'} />
              <StatCard title="Total Wins" value={stats?.totalWins ?? '—'} />
              <StatCard title="Win Rate" value={stats ? `${stats.winRatePercent}%` : '—'} />
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div>
            <h2 style={S.pageTitle}>🎫 Coupon Types</h2>
            <table style={S.table}>
              <thead>
                <tr>
                  {['Icon', 'Name', 'Type', 'Value', 'Weight', 'Active', ''].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {couponTypes?.map((ct: any) => (
                  <tr key={ct.id}>
                    <td style={S.td}>{ct.iconEmoji}</td>
                    <td style={S.td}>{ct.name}</td>
                    <td style={S.td}>{ct.discountType}</td>
                    <td style={S.td}>{ct.discountValue > 0 ? `${ct.discountValue}` : '—'}</td>
                    <td style={S.td}>{ct.winWeight}</td>
                    <td style={S.td}>
                      <span style={{ color: ct.isActive ? '#4CAF50' : '#E53935' }}>
                        {ct.isActive ? '● Active' : '○ Off'}
                      </span>
                    </td>
                    <td style={S.td}>
                      <button
                        style={S.smallBtn}
                        onClick={() => toggleCoupon.mutate({ id: ct.id, isActive: !ct.isActive })}
                      >
                        {ct.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'config' && (
          <div>
            <h2 style={S.pageTitle}>⚙️ Game Configuration</h2>
            {gameConfigs?.map((cfg: any) => (
              <div key={cfg.key} style={S.configRow}>
                <div style={S.configInfo}>
                  <strong>{cfg.key}</strong>
                  <span style={{ color: '#A08060', marginLeft: 8 }}>{cfg.description}</span>
                </div>
                <div style={S.configEdit}>
                  <input
                    style={{ ...S.input, width: 120, marginBottom: 0 }}
                    defaultValue={cfg.value}
                    onBlur={(e) => {
                      if (e.target.value !== cfg.value) {
                        updateConfig.mutate({ key: cfg.key, value: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'push' && (
          <div>
            <h2 style={S.pageTitle}>📲 Push Notifications</h2>
            <div style={S.formCard}>
              <label style={S.label}>Title</label>
              <input
                style={S.input} placeholder="Notification title"
                value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
              />
              <label style={S.label}>Body</label>
              <textarea
                style={{ ...S.input, height: 100, resize: 'vertical' }}
                placeholder="Notification message..."
                value={notifBody}
                onChange={e => setNotifBody(e.target.value)}
              />
              <button
                style={S.btn}
                onClick={() => sendNotif.mutate()}
                disabled={sendNotif.isPending || !notifTitle || !notifBody}
              >
                {sendNotif.isPending ? 'Sending...' : 'Send to All Users'}
              </button>
              {notifMsg && <p style={{ color: '#4CAF50', marginTop: 12 }}>{notifMsg}</p>}
            </div>
          </div>
        )}

        {activeTab === 'lookup' && (
          <div>
            <h2 style={S.pageTitle}>🔍 Coupon Lookup</h2>
            <p style={{ color: '#6B4F3A', marginBottom: 16 }}>
              Enter a coupon code to verify it when a customer presents it in-store.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input
                style={{ ...S.input, marginBottom: 0, flex: 1, fontFamily: 'monospace', fontSize: 18, letterSpacing: 3 }}
                placeholder="TSA-XXXX"
                value={couponLookup}
                onChange={e => setCouponLookup(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <button style={S.btn} onClick={handleLookup}>Look Up</button>
            </div>
            {lookupResult && (
              <div style={S.formCard}>
                {lookupResult.error ? (
                  <p style={{ color: '#E53935' }}>{lookupResult.error}</p>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <span style={{ fontSize: 40 }}>{lookupResult.iconEmoji}</span>
                      <div>
                        <h3 style={{ margin: 0 }}>{lookupResult.name}</h3>
                        <p style={{ margin: 0, color: '#6B4F3A' }}>{lookupResult.description}</p>
                      </div>
                      <span style={{
                        marginLeft: 'auto', fontWeight: 700,
                        color: lookupResult.status === 'ACTIVE' ? '#4CAF50' :
                               lookupResult.status === 'REDEEMED' ? '#E53935' : '#A08060',
                      }}>
                        {lookupResult.status === 'ACTIVE' ? '✅ VALID' :
                         lookupResult.status === 'REDEEMED' ? '❌ ALREADY USED' : lookupResult.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#A08060', fontSize: 13 }}>
                      Code: <strong>{lookupResult.couponCode}</strong> · Expires: {new Date(lookupResult.expiresAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div style={S.statCard}>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#C8892A' }}>{value}</div>
      <div style={{ fontSize: 14, color: '#6B4F3A', marginTop: 4 }}>{title}</div>
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(!!localStorage.getItem('admin_id_token'));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isAuthed ? <Dashboard /> : <LoginPage onLogin={() => setIsAuthed(true)} />}
    </QueryClientProvider>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  loginPage: {
    minHeight: '100vh', backgroundColor: '#1A0A00',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
  },
  loginCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 40, width: 380,
    textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  input: {
    display: 'block', width: '100%', padding: '12px 14px', marginBottom: 12,
    borderRadius: 10, border: '1px solid #EAD9C6', fontSize: 16,
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  btn: {
    backgroundColor: '#C8892A', color: '#fff', border: 'none', borderRadius: 12,
    padding: '14px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
    width: '100%',
  },
  smallBtn: {
    backgroundColor: '#F0E6D6', color: '#1A0A00', border: 'none', borderRadius: 8,
    padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  dashboard: { display: 'flex', minHeight: '100vh', backgroundColor: '#FDF8F2' },
  sidebar: {
    width: 240, backgroundColor: '#1A0A00', color: '#fff', display: 'flex',
    flexDirection: 'column', paddingBottom: 20,
  },
  sidebarBtn: {
    background: 'none', border: 'none', color: '#A08060',
    padding: '14px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', borderRadius: 0,
  },
  sidebarBtnActive: { backgroundColor: 'rgba(200,137,42,0.2)', color: '#C8892A' },
  mainContent: { flex: 1, padding: 32, overflowY: 'auto' },
  pageTitle: { fontSize: 24, fontWeight: 800, color: '#1A0A00', marginBottom: 24 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 },
  statCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 24, textAlign: 'center',
    border: '1px solid #EAD9C6',
  },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  th: { backgroundColor: '#F0E6D6', padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#1A0A00' },
  td: { padding: '12px 16px', borderBottom: '1px solid #F0E6D6', fontSize: 14, color: '#3D2010' },
  configRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 8,
    border: '1px solid #EAD9C6',
  },
  configInfo: { flex: 1, fontSize: 14 },
  configEdit: { display: 'flex', alignItems: 'center', gap: 8 },
  formCard: { backgroundColor: '#fff', borderRadius: 14, padding: 24, border: '1px solid #EAD9C6', maxWidth: 560 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#1A0A00', marginBottom: 6, marginTop: 12 },
};
