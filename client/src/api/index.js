const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  dashboard: () => request('/api/dashboard'),
  balance: () => request('/api/balance'),
  transactions: {
    list: () => request('/api/transactions'),
    create: (body) => request('/api/transactions', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
  },
  payments: (body) => request('/api/payments', { method: 'POST', body: JSON.stringify(body) }),
  cards: {
    list: () => request('/api/cards'),
    create: (body) => request('/api/cards', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/cards/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id) => request(`/api/cards/${id}`, { method: 'DELETE' }),
  },
  convert: (body) => request('/api/convert', { method: 'POST', body: JSON.stringify(body) }),
  budgets: {
    list: () => request('/api/budgets'),
    create: (body) => request('/api/budgets', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/budgets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id) => request(`/api/budgets/${id}`, { method: 'DELETE' }),
  },
  paymentLinks: {
    list: () => request('/api/payment-links'),
    create: (body) => request('/api/payment-links', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/payment-links/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id) => request(`/api/payment-links/${id}`, { method: 'DELETE' }),
  },
  invoices: {
    list: () => request('/api/invoices'),
    create: (body) => request('/api/invoices', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/invoices/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id) => request(`/api/invoices/${id}`, { method: 'DELETE' }),
  },
  inbox: {
    list: () => request('/api/inbox'),
    markRead: (id) => request(`/api/inbox/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request('/api/inbox/read-all', { method: 'PUT' }),
    remove: (id) => request(`/api/inbox/${id}`, { method: 'DELETE' }),
  },
  contacts: {
    list: () => request('/api/contacts'),
    create: (body) => request('/api/contacts', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/contacts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id) => request(`/api/contacts/${id}`, { method: 'DELETE' }),
  },
  tickets: {
    list: () => request('/api/tickets'),
    create: (body) => request('/api/tickets', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/tickets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id) => request(`/api/tickets/${id}`, { method: 'DELETE' }),
  },
  reports: () => request('/api/reports'),
  keys: {
    list: () => request('/api/keys'),
    create: (body) => request('/api/keys', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id) => request(`/api/keys/${id}`, { method: 'DELETE' }),
  },
  ai: (question) => request('/api/ai', { method: 'POST', body: JSON.stringify({ question }) }),
};

export const fmt = (n) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
export const initials = (name) => (name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
export const AVATAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
