import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, type DashboardMetrics } from '../api';
import { formatPrice } from '../api';

export function CeoDashboard() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ceo_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setLoading(true);
      api
        .getDashboard(token)
        .then(setMetrics)
        .catch(() => {
          localStorage.removeItem('ceo_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { access_token } = await api.login(email, password);
      localStorage.setItem('ceo_token', access_token);
      setToken(access_token);
    } catch {
      setError('Invalid credentials. Try ceo@heritageslabs.com / heritage2026');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ceo_token');
    setToken(null);
    setMetrics(null);
  };

  if (!token) {
    return (
      <div className="login-panel">
        <h2>CEO Command Center</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="ceo-email">Email</label>
            <input id="ceo-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="ceo-pass">Password</label>
            <input
              id="ceo-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" type="submit" style={{ width: '100%' }}>
            Sign In
          </button>
        </form>
      </div>
    );
  }

  if (loading || !metrics) {
    return <div className="loading">Loading analytics…</div>;
  }

  const maxPlayerRev = Math.max(...metrics.top_players.map((p) => p.revenue), 1);
  const maxSetCount = Math.max(...metrics.top_sets.map((s) => s.count), 1);
  const maxViews = Math.max(...metrics.daily_views.map((d) => d.views), 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--leather)' }}>CEO Analytics Dashboard</h2>
        <button className="btn-secondary" onClick={handleLogout}>
          Sign Out
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="kpi-card">
          <div className="label">Total Revenue</div>
          <div className="value">{formatPrice(metrics.total_revenue)}</div>
        </div>
        <div className="kpi-card">
          <div className="label">Orders</div>
          <div className="value">{metrics.orders_count}</div>
        </div>
        <div className="kpi-card">
          <div className="label">Avg Order Value</div>
          <div className="value">{formatPrice(metrics.avg_order_value)}</div>
        </div>
        <div className="kpi-card">
          <div className="label">Inventory Turnover</div>
          <div className="value">{metrics.inventory_turnover_rate}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="panel">
          <h3>Top Players by Revenue</h3>
          <div className="bar-chart">
            {metrics.top_players.map((p) => (
              <div className="bar-row" key={p.player}>
                <span>{p.player.split(' ').pop()}</span>
                <div className="bar-track">
                  <motion.div
                    className="bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.revenue / maxPlayerRev) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span>{formatPrice(p.revenue)}</span>
              </div>
            ))}
            {metrics.top_players.length === 0 && <p className="empty-state">No sales yet</p>}
          </div>
        </div>

        <div className="panel">
          <h3>Inventory by Set</h3>
          <div className="bar-chart">
            {metrics.top_sets.map((s) => (
              <div className="bar-row" key={s.set}>
                <span>{s.set}</span>
                <div className="bar-track">
                  <motion.div
                    className="bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / maxSetCount) * 100}%` }}
                  />
                </div>
                <span>{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Daily Page Views (7d)</h3>
          <div className="bar-chart">
            {metrics.daily_views.map((d) => (
              <div className="bar-row" key={d.date}>
                <span>{d.date.slice(5)}</span>
                <div className="bar-track">
                  <motion.div
                    className="bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.views / maxViews) * 100}%` }}
                  />
                </div>
                <span>{d.views}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Search Trends</h3>
          <div className="bar-chart">
            {metrics.search_trends.map((s) => (
              <div className="bar-row" key={s.term}>
                <span>{s.term}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(s.count / (metrics.search_trends[0]?.count || 1)) * 100}%` }} />
                </div>
                <span>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Recent Activity</h3>
        <ul className="event-log">
          {metrics.recent_events.map((ev) => (
            <li key={ev.id}>
              <span>
                <strong>{ev.event_type}</strong> {ev.metadata_json !== '{}' ? ev.metadata_json : ''}
              </span>
              <span>{new Date(ev.timestamp).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <h3>Stock Status</h3>
        <div className="dashboard-grid">
          {Object.entries(metrics.status_breakdown).map(([status, count]) => (
            <div className="kpi-card" key={status}>
              <div className="label">{status}</div>
              <div className="value">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
