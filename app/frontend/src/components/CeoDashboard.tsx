import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, type AdvancedAnalytics, type DashboardMetrics, formatPrice } from '../api';
import { AdminInventory } from './AdminInventory';

type CeoTab = 'dashboard' | 'inventory' | 'analytics';

function DashboardView({ metrics }: { metrics: DashboardMetrics }) {
  const maxPlayerRev = Math.max(...metrics.top_players.map((p) => p.revenue), 1);
  const maxSetCount = Math.max(...metrics.top_sets.map((s) => s.count), 1);
  const maxViews = Math.max(...metrics.daily_views.map((d) => d.views), 1);

  return (
    <>
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
                  <motion.div className="bar-fill" animate={{ width: `${(p.revenue / maxPlayerRev) * 100}%` }} />
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
                  <div className="bar-fill" style={{ width: `${(s.count / maxSetCount) * 100}%` }} />
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
                  <div className="bar-fill" style={{ width: `${(d.views / maxViews) * 100}%` }} />
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
              <span><strong>{ev.event_type}</strong> {ev.metadata_json !== '{}' ? ev.metadata_json : ''}</span>
              <span>{new Date(ev.timestamp).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function AdvancedView({ data }: { data: AdvancedAnalytics }) {
  const maxFunnel = Math.max(...data.funnel.map((f) => f.count), 1);
  const maxHist = Math.max(...data.revenue_forecast.historical_daily.map((d) => d.revenue), 1);

  return (
    <>
      <div className="dashboard-grid">
        <div className="kpi-card">
          <div className="label">30-Day Revenue Forecast</div>
          <div className="value">{formatPrice(data.revenue_forecast.projected_revenue_30d)}</div>
        </div>
        <div className="kpi-card">
          <div className="label">Growth Rate</div>
          <div className="value">{data.revenue_forecast.growth_rate_pct}%</div>
        </div>
        <div className="kpi-card">
          <div className="label">Forecast Method</div>
          <div className="value" style={{ fontSize: '1rem' }}>{data.revenue_forecast.method}</div>
        </div>
      </div>

      <div className="panel">
        <h3>Conversion Funnel (30d)</h3>
        <div className="funnel-chart">
          {data.funnel.map((step, i) => (
            <motion.div
              key={step.event_type}
              className="funnel-step"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(15, (step.count / maxFunnel) * 100)}%` }}
              transition={{ delay: i * 0.1 }}
            >
              <span>{step.step}</span>
              <strong>{step.count}</strong>
              <em>{step.rate}%</em>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="panel">
          <h3>Revenue History</h3>
          <div className="bar-chart">
            {data.revenue_forecast.historical_daily.map((d) => (
              <div className="bar-row" key={d.date}>
                <span>{d.date.slice(5)}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(d.revenue / maxHist) * 100}%` }} />
                </div>
                <span>{formatPrice(d.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Revenue Forecast</h3>
          <div className="bar-chart">
            {data.revenue_forecast.forecast_daily.map((d) => (
              <div className="bar-row" key={d.date}>
                <span>{d.date.slice(5)}</span>
                <div className="bar-track">
                  <div className="bar-fill forecast" style={{ width: `${(d.predicted / (maxHist || 1)) * 100}%` }} />
                </div>
                <span>{formatPrice(d.predicted)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Session Cohorts (Weekly Retention)</h3>
        {data.cohorts.length === 0 ? (
          <p className="empty-state">Cohort data builds as sessions accumulate.</p>
        ) : (
          <div className="cohort-grid">
            {data.cohorts.map((c) => (
              <div key={c.cohort_week} className="cohort-card">
                <strong>{c.cohort_week}</strong>
                <span>{c.size} sessions</span>
                <div className="cohort-retention">
                  {c.retention.map((r) => (
                    <div key={r.week_offset} className="cohort-cell" style={{ opacity: 0.4 + r.rate / 120 }}>
                      W+{r.week_offset}: {r.rate}%
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function CeoDashboard({ onInventoryChange }: { onInventoryChange?: () => void }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ceo_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ceoTab, setCeoTab] = useState<CeoTab>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [advanced, setAdvanced] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async (t: string) => {
    setLoading(true);
    try {
      const [dash, adv] = await Promise.all([api.getDashboard(t), api.getAdvancedAnalytics(t)]);
      setMetrics(dash);
      setAdvanced(adv);
    } catch {
      localStorage.removeItem('ceo_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadDashboard(token);
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
    setAdvanced(null);
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
            <input id="ceo-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" type="submit" style={{ width: '100%' }}>Sign In</button>
        </form>
      </div>
    );
  }

  const ceoTabs: { id: CeoTab; label: string }[] = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'analytics', label: 'Advanced Analytics' },
    { id: 'inventory', label: 'Manage Inventory' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="ceo-header">
        <h2 style={{ color: 'var(--leather)' }}>CEO Command Center</h2>
        <button className="btn-secondary" onClick={handleLogout}>Sign Out</button>
      </div>

      <nav className="ceo-subnav">
        {ceoTabs.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${ceoTab === t.id ? 'active' : ''}`}
            onClick={() => setCeoTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <>
          {ceoTab === 'dashboard' && metrics && <DashboardView metrics={metrics} />}
          {ceoTab === 'analytics' && advanced && <AdvancedView data={advanced} />}
          {ceoTab === 'inventory' && (
            <AdminInventory token={token} onChanged={() => { loadDashboard(token); onInventoryChange?.(); }} />
          )}
        </>
      )}
    </motion.div>
  );
}
