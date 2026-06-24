import React, { useState, useEffect } from 'react';
import { api, fmt } from '../api';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, Modal, FormField, BtnPrimary, BtnOutline } from '../components/ui';

export default function BudgetsPage() {
  const { toast } = useApp();
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Operations', limit: '', spent: '0' });

  const load = () => api.budgets.list().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.budgets.create({ ...form, limit: parseFloat(form.limit), spent: parseFloat(form.spent) || 0 });
      toast('Budget created');
      setShowModal(false);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete budget?')) return;
    await api.budgets.remove(id);
    toast('Budget deleted');
    load();
  };

  return (
    <div className="page">
      <PageHeader title="Budgets" subtitle="Track spending against your limits"
        actions={<BtnPrimary small onClick={() => setShowModal(true)}>+ New Budget</BtnPrimary>} />
      <div className="page-grid-2">
        {items.map((b) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          return (
            <Card key={b._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div className="card-title">{b.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.category}</div>
                </div>
                <button type="button" className="btn-outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => remove(b._id)}>Delete</button>
              </div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>${fmt(b.spent)} / ${fmt(b.limit)}</div>
              <div className="progress-bar">
                <div className={`progress-bar-fill ${pct > 90 ? 'danger' : pct > 70 ? 'warn' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{pct}% utilized</div>
            </Card>
          );
        })}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Budget"
        footer={<><BtnOutline onClick={() => setShowModal(false)}>Cancel</BtnOutline><BtnPrimary onClick={save}>Create</BtnPrimary></>}>
        <FormField label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
        <FormField label="Category">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['Operations', 'HR', 'Tools', 'Marketing', 'Other'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Limit ($)"><input type="number" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} /></FormField>
        <FormField label="Spent ($)"><input type="number" value={form.spent} onChange={(e) => setForm({ ...form, spent: e.target.value })} /></FormField>
      </Modal>
    </div>
  );
}
