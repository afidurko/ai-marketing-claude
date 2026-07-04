const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export interface Card {
  id: number;
  player_name: string;
  year: number;
  set_name: string;
  grade: string;
  grader: string;
  condition: string;
  price: number;
  status: 'available' | 'sold' | 'reserved';
  image_url: string;
  image_key?: string | null;
  description: string;
  rarity: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryStats {
  total_cards: number;
  available: number;
  sold: number;
  reserved: number;
  total_inventory_value: number;
  available_value: number;
  recent_additions: number;
}

export interface DashboardMetrics {
  total_revenue: number;
  orders_count: number;
  avg_order_value: number;
  inventory_turnover_rate: number;
  top_players: { player: string; revenue: number }[];
  top_sets: { set: string; count: number }[];
  status_breakdown: Record<string, number>;
  daily_views: { date: string; views: number }[];
  search_trends: { term: string; count: number }[];
  recent_events: { id: number; event_type: string; metadata_json: string; timestamp: string }[];
}

export interface AdvancedAnalytics {
  funnel: { step: string; event_type: string; count: number; rate: number }[];
  cohorts: { cohort_week: string; size: number; retention: { week_offset: number; rate: number; active: number }[] }[];
  revenue_forecast: {
    historical_daily: { date: string; revenue: number }[];
    forecast_daily: { date: string; predicted: number }[];
    projected_revenue_30d: number;
    growth_rate_pct: number;
    method: string;
  };
}

export interface CheckoutResponse {
  order_id: number;
  checkout_url: string | null;
  demo_mode: boolean;
  message?: string;
}

export interface PaymentConfig {
  stripe_enabled: boolean;
  publishable_key: string | null;
}

const SESSION_KEY = 'heritage_session_id';

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  getCards: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    return request<Card[]>(`/api/cards/search?${qs}`);
  },
  getCard: (id: number) => request<Card>(`/api/cards/${id}`),
  getStats: () => request<InventoryStats>('/api/inventory/stats'),
  getPaymentConfig: () => request<PaymentConfig>('/api/payments/config'),
  checkout: (data: { customer_email: string; customer_name: string; card_ids: number[] }) =>
    request<CheckoutResponse>('/api/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ ...data, session_id: getSessionId() }),
    }),
  cancelCheckout: (orderId: number) =>
    request(`/api/payments/cancel/${orderId}`, { method: 'POST' }),
  track: (event_type: string, metadata: Record<string, unknown> = {}) =>
    request('/api/track', {
      method: 'POST',
      body: JSON.stringify({ event_type, metadata, session_id: getSessionId() }),
    }),
  login: (email: string, password: string) =>
    request<{ access_token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getDashboard: (token: string) =>
    request<DashboardMetrics>('/api/analytics/dashboard', { headers: authHeaders(token) }),
  getAdvancedAnalytics: (token: string) =>
    request<AdvancedAnalytics>('/api/analytics/advanced', { headers: authHeaders(token) }),
  createCard: (token: string, data: Partial<Card>) =>
    request<Card>('/api/cards', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),
  updateCard: (token: string, id: number, data: Partial<Card>) =>
    request<Card>(`/api/cards/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),
  deleteCard: (token: string, id: number) =>
    request<void>(`/api/cards/${id}`, { method: 'DELETE', headers: authHeaders(token) }),
  uploadImage: async (token: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/api/admin/uploads`, {
      method: 'POST',
      headers: authHeaders(token),
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<{
      key: string;
      url: string;
      width?: number;
      height?: number;
      photography_tips?: string[];
    }>;
  },
};

export function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function resolveImageUrl(url: string) {
  if (url.startsWith('http') || url.startsWith('//')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}
