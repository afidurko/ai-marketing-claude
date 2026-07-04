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
  createOrder: (data: { customer_email: string; customer_name: string; card_ids: number[] }) =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  track: (event_type: string, metadata: Record<string, unknown> = {}) =>
    request('/api/track', { method: 'POST', body: JSON.stringify({ event_type, metadata }) }),
  login: (email: string, password: string) =>
    request<{ access_token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getDashboard: (token: string) =>
    request<DashboardMetrics>('/api/analytics/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
