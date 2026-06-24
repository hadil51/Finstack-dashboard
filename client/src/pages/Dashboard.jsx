import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api, fmt, initials, AVATAR_COLORS } from '../api';
import { useApp } from '../context/AppContext';
import { Modal, FormField, BtnPrimary, BtnOutline, StatusBadge } from '../components/ui';
import './Dashboard.css';

function generateMockFlow() {
  const hours = ['10:59PM', '11:59PM', '12:59AM', '1:59AM', '2:59AM', '3:59AM', '4:59AM', '5:59AM', '6:59AM', '7:59AM'];
  return hours.map((t) => ({
    time: t,
    income: 2800 + Math.random() * 3200,
    invest: 2200 + Math.random() * 2000,
    expense: 2000 + Math.random() * 2800,
  }));
}

const MOCK_STATS = {
  totalBalance: 12121.12,
  totalIncome: 13232.12,
  totalExpense: 43231.21,
  cashFlow: { total: 25421.64, change: '+5.2%', data: generateMockFlow() },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-time">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="tooltip-row">
          <span style={{ color: p.color }}>●</span>
          <span>{p.name}: </span>
          <strong>${fmt(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

function StatCard({ title, value, type, change, changeText }) {
  const [hidden, setHidden] = useState(false);
  return (
    <div className={`stat-card ${type === 'balance' ? 'stat-card--dark' : ''}`}>
      <div className="stat-card-header">
        <span className="stat-label">{title}</span>
        <button type="button" className="stat-eye" onClick={() => setHidden((h) => !h)} aria-label="Toggle visibility">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {hidden ? (
              <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
            ) : (
              <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
            )}
          </svg>
        </button>
      </div>
      <div className="stat-value">
        {hidden ? (
          <span className="stat-amount">••••••</span>
        ) : (
          <>
            <span className="stat-amount">${fmt(Math.floor(value))}</span>
            <span className="stat-cents">.{String(Math.round((value % 1) * 100)).padStart(2, '0')}</span>
          </>
        )}
        <div className="stat-currency"><span className="flag">🇺🇸</span> USD</div>
      </div>
      {change && (
        <div className="stat-footer">
          <span className="badge badge--green">{change}</span>
          <span className="stat-change-text">{changeText}</span>
        </div>
      )}
      <div className={`stat-bar ${type === 'expense' ? 'stat-bar--red' : 'stat-bar--green'}`} />
    </div>
  );
}

function CashFlowCard({ data, total, change }) {
  return (
    <div className="card cashflow-card">
      <div className="card-header">
        <span className="card-title">Cash Flow</span>
      </div>
      <div className="cashflow-total">
        <span className="total-amount">${fmt(total)}</span>
        <span className="badge badge--green">{change}</span>
        <span className="text-muted">vs last month</span>
      </div>
      <div className="chart-legend">
        <span><span className="dot dot--blue" />Income</span>
        <span><span className="dot dot--green" />Invest</span>
        <span><span className="dot dot--red" />Expense</span>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="income" name="Income" stroke="#3B5EDB" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="invest" name="Invest" stroke="#10B981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ConvertCard({ balance }) {
  const { toast } = useApp();
  const [amount, setAmount] = useState(1000);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('IDR');
  const [result, setResult] = useState(0);
  const [loading, setLoading] = useState(false);
  const currencies = ['USD', 'EUR', 'GBP', 'IDR', 'JPY'];

  const convert = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.convert({ amount, from, to });
      setResult(data.result);
    } catch {
      const rates = { USD: 1, IDR: 15900, EUR: 0.92, GBP: 0.79, JPY: 149.5 };
      setResult(((amount / rates[from]) * rates[to]).toFixed(2));
    }
    setLoading(false);
  }, [amount, from, to]);

  useEffect(() => { convert(); }, [convert]);

  const handleConvert = async () => {
    await convert();
    toast('Currency converted successfully');
  };

  return (
    <div className="card convert-card">
      <div className="card-header"><span className="card-title">Convert</span></div>
      <div className="convert-row">
        <div className="convert-label">
          <span>From</span>
          <span className="convert-balance">Available Balance: ${fmt(balance)}</span>
        </div>
        <div className="convert-input-row">
          <select className="currency-select" value={from} onChange={(e) => setFrom(e.target.value)}>
            {currencies.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input className="convert-input" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
        </div>
      </div>
      <div className="swap-btn-wrap">
        <button type="button" className="swap-btn" onClick={() => { setFrom(to); setTo(from); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
        </button>
      </div>
      <div className="convert-row">
        <div className="convert-label"><span>To</span></div>
        <div className="convert-input-row">
          <select className="currency-select" value={to} onChange={(e) => setTo(e.target.value)}>
            {currencies.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="convert-result">{to === 'IDR' || to === 'JPY' ? Number(result).toLocaleString() : `$${fmt(result)}`}</div>
        </div>
      </div>
      <div className="convert-summary">
        <div className="summary-row"><span>Amount</span><span>${fmt(amount)}</span></div>
        <div className="summary-row"><span>{from} → {to} Fee</span><span>$0.00</span></div>
        <div className="summary-row"><span>Total amount</span><span>${fmt(amount)}</span></div>
      </div>
      <button type="button" className="convert-btn" onClick={handleConvert} disabled={loading}>
        {loading ? 'Converting…' : 'Convert Now'}
      </button>
    </div>
  );
}

function TransactionsTable({ transactions, onRefresh }) {
  const { toast, navigate } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [form, setForm] = useState({ customer: '', amount: '', method: 'PayPal', status: 'Completed', country: 'US' });
  const [filter, setFilter] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [menuId, setMenuId] = useState(null);

  const filtered = transactions
    .filter((t) => !filter || t.customer?.toLowerCase().includes(filter.toLowerCase()) || t.method?.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => sortAsc ? a.amount - b.amount : b.amount - a.amount)
    .slice(0, 6);

  const handleAdd = async () => {
    try {
      await api.transactions.create({ ...form, amount: parseFloat(form.amount) });
      toast('Transaction added');
      onRefresh();
      setShowModal(false);
      setForm({ customer: '', amount: '', method: 'PayPal', status: 'Completed', country: 'US' });
    } catch (e) { toast(e.message, 'error'); }
  };

  const remove = async (id) => {
    await api.transactions.remove(id);
    toast('Transaction deleted');
    onRefresh();
    setMenuId(null);
  };

  return (
    <div className="card txn-card">
      <div className="card-header">
        <span className="card-title">Recent Transactions</span>
        <div className="txn-actions">
          <button type="button" className="icon-btn-label" onClick={() => setShowFilter((f) => !f)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter
          </button>
          <button type="button" className="icon-btn-label" onClick={() => setSortAsc((s) => !s)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>
            Sort
          </button>
          <button type="button" className="btn-primary-sm" onClick={() => setShowModal(true)}>+ Add</button>
        </div>
      </div>
      {showFilter && (
        <input className="search-input" style={{ marginBottom: 12, width: '100%' }} placeholder="Filter transactions…" value={filter} onChange={(e) => setFilter(e.target.value)} />
      )}
      <table className="txn-table">
        <thead>
          <tr><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Country</th><th></th></tr>
        </thead>
        <tbody>
          {filtered.map((t, i) => (
            <tr key={t._id || i}>
              <td>
                <div className="customer-cell">
                  <div className="customer-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{initials(t.customer)}</div>
                  {t.customer}
                </div>
              </td>
              <td><strong>${fmt(Math.abs(t.amount))}</strong></td>
              <td>{t.method}</td>
              <td><StatusBadge status={t.status} /></td>
              <td>{t.country}</td>
              <td className="relative">
                <button type="button" className="icon-btn" onClick={() => setMenuId(menuId === t._id ? null : t._id)}>⋯</button>
                {menuId === t._id && (
                  <div className="dropdown-menu" style={{ position: 'absolute', right: 0, top: '100%' }}>
                    <button type="button" className="dropdown-item" onClick={() => { navigate('Transactions'); setMenuId(null); }}>View all</button>
                    <button type="button" className="dropdown-item danger" onClick={() => remove(t._id)}>Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Transaction"
        footer={<><BtnOutline onClick={() => setShowModal(false)}>Cancel</BtnOutline><BtnPrimary onClick={handleAdd}>Add</BtnPrimary></>}>
        {['Customer', 'Amount', 'Country'].map((label) => {
          const field = label.toLowerCase();
          return (
            <FormField key={field} label={label}>
              <input type={field === 'amount' ? 'number' : 'text'} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            </FormField>
          );
        })}
        <FormField label="Method">
          <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            {['PayPal', 'Visa', 'Mastercard', 'Stripe', 'Bank Transfer'].map((m) => <option key={m}>{m}</option>)}
          </select>
        </FormField>
        <FormField label="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['Completed', 'Pending', 'Failed'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </FormField>
      </Modal>
    </div>
  );
}

function MyCardsCard({ cards }) {
  const { navigate } = useApp();
  const [active, setActive] = useState(0);
  return (
    <div className="card mycards-card">
      <div className="card-header">
        <span className="card-title">My Cards</span>
        <button type="button" className="see-all" onClick={() => navigate('Cards')}>See All ↗</button>
      </div>
      <div className="cards-list">
        {cards.map((card, i) => (
          <div key={card._id || i} className={`credit-card ${active === i ? 'active' : ''}`}
            style={{ background: card.color || '#3B5EDB' }} onClick={() => setActive(i)}>
            <div className="card-brand">{card.type}</div>
            <div className="card-number">**** **** {card.last4}</div>
            <div className="card-footer-row">
              <div>
                <div className="card-meta-label">Balance</div>
                <div className="card-meta-value">${fmt(card.balance)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { setPaymentModal, navigate, setShowAI, setShowNotifications, setShowSettings, balance, refreshBalance, refreshKey } = useApp();
  const [stats, setStats] = useState(MOCK_STATS);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);

  const refresh = useCallback(() => {
    api.dashboard().then(setStats).catch(() => {});
    api.transactions.list().then(setTransactions).catch(() => {});
    api.cards.list().then(setCards).catch(() => {});
    refreshBalance();
  }, [refreshBalance]);

  useEffect(() => { refresh(); }, [refresh, refreshKey]);

  return (
    <div className="dashboard">
      <div className="topbar">
        <div>
          <h1 className="topbar-title">Dashboard</h1>
          <p className="topbar-sub">Real-time statistics for quick decision-making</p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="action-btn action-btn--primary" onClick={() => setPaymentModal('deposit')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Deposit
          </button>
          <button type="button" className="action-btn" onClick={() => setPaymentModal('withdraw')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Withdraw
          </button>
          <button type="button" className="action-btn" onClick={() => setPaymentModal('transfer')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            Transfer
          </button>
          <button type="button" className="action-btn" onClick={() => navigate('Invoices')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Invoice
          </button>
          <button type="button" className="action-btn" onClick={() => setShowAI(true)}>Ask AI</button>
          <button type="button" className="icon-btn-sm" onClick={() => setShowNotifications(true)} aria-label="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <button type="button" className="icon-btn-sm" onClick={() => setShowSettings(true)} aria-label="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Balance" value={stats.totalBalance || balance} type="balance" change="+3.21%" changeText="+$2,211 compared to last month" />
        <StatCard title="Total Income" value={stats.totalIncome} type="income" />
        <StatCard title="Total Expense" value={stats.totalExpense} type="expense" />
      </div>

      <div className="middle-grid">
        <CashFlowCard data={stats.cashFlow?.data} total={stats.cashFlow?.total || 0} change={stats.cashFlow?.change || '+5.2%'} />
        <ConvertCard balance={balance} />
      </div>

      <div className="bottom-grid">
        <TransactionsTable transactions={transactions} onRefresh={refresh} />
        <MyCardsCard cards={cards} />
      </div>
    </div>
  );
}
