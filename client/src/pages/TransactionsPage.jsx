import React, { useState, useEffect } from 'react';
import { api, fmt, initials, AVATAR_COLORS } from '../api';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, Modal, FormField, BtnPrimary, BtnOutline, StatusBadge } from '../components/ui';
import '../styles/shared.css';

export default function TransactionsPage() {
  const { toast } = useApp();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('date-desc');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ customer: '', amount: '', method: 'PayPal', status: 'Completed', country: 'US' });

  const load = () => api.transactions.list().then(setItems).catch(() => toast('Failed to load', 'error'));
  useEffect(() => { load(); }, []);

  const filtered = items
    .filter((t) => !filter || t.customer?.toLowerCase().includes(filter.toLowerCase()) || t.method?.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'amount-desc') return b.amount - a.amount;
      if (sort === 'amount-asc') return a.amount - b.amount;
      return new Date(b.date) - new Date(a.date);
    });

  const openAdd = () => { setEditItem(null); setForm({ customer: '', amount: '', method: 'PayPal', status: 'Completed', country: 'US' }); setShowModal(true); };
  const openEdit = (t) => { setEditItem(t); setForm({ customer: t.customer, amount: t.amount, method: t.method, status: t.status, country: t.country }); setShowModal(true); };

  const save = async () => {
    try {
      if (editItem) {
        await api.transactions.update(editItem._id, { ...form, amount: parseFloat(form.amount) });
        toast('Transaction updated');
      } else {
        await api.transactions.create({ ...form, amount: parseFloat(form.amount) });
        toast('Transaction added');
      }
      setShowModal(false);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    await api.transactions.remove(id);
    toast('Transaction deleted');
    load();
  };

  return (
    <div className="page">
      <PageHeader title="Transactions" subtitle="View and manage all payment activity"
        actions={<BtnPrimary small onClick={openAdd}>+ Add Transaction</BtnPrimary>} />
      <Card>
        <div className="toolbar">
          <input className="search-input" placeholder="Filter by customer or method…" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date-desc">Newest first</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Country</th><th>Type</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t._id}>
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
                  <td style={{ textTransform: 'capitalize' }}>{t.type || 'payment'}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn-primary-sm" onClick={() => openEdit(t)}>Edit</button>
                      <button type="button" className="btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => remove(t._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Transaction' : 'Add Transaction'}
        footer={<><BtnOutline onClick={() => setShowModal(false)}>Cancel</BtnOutline><BtnPrimary onClick={save}>Save</BtnPrimary></>}>
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
