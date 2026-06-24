import React, { useState, useEffect } from 'react';
import { api, fmt } from '../api';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, Modal, FormField, BtnPrimary, BtnOutline, StatusBadge } from '../components/ui';

export default function PaymentLinksPage() {
  const { toast } = useApp();
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', currency: 'USD', status: 'Active' });

  const load = () => api.paymentLinks.list().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.paymentLinks.create({ ...form, amount: parseFloat(form.amount) });
      toast('Payment link created');
      setShowModal(false);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const toggleStatus = async (item) => {
    const status = item.status === 'Active' ? 'Paused' : 'Active';
    await api.paymentLinks.update(item._id, { status });
    toast(`Link ${status.toLowerCase()}`);
    load();
  };

  const copy = (url) => { navigator.clipboard.writeText(url); toast('Link copied to clipboard'); };

  const remove = async (id) => {
    if (!confirm('Delete link?')) return;
    await api.paymentLinks.remove(id);
    toast('Link deleted');
    load();
  };

  return (
    <div className="page">
      <PageHeader title="Payment Links" subtitle="Create shareable payment URLs"
        actions={<BtnPrimary small onClick={() => setShowModal(true)}>+ Create Link</BtnPrimary>} />
      <Card>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Title</th><th>Amount</th><th>Status</th><th>Clicks</th><th>URL</th><th></th></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.title}</strong></td>
                  <td>${fmt(p.amount)} {p.currency}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>{p.clicks}</td>
                  <td><code style={{ fontSize: 11 }}>{p.url}</code></td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn-primary-sm" onClick={() => copy(p.url)}>Copy</button>
                      <button type="button" className="btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => toggleStatus(p)}>
                        {p.status === 'Active' ? 'Pause' : 'Activate'}
                      </button>
                      <button type="button" className="btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => remove(p._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Payment Link"
        footer={<><BtnOutline onClick={() => setShowModal(false)}>Cancel</BtnOutline><BtnPrimary onClick={save}>Create</BtnPrimary></>}>
        <FormField label="Title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField label="Amount"><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></FormField>
        <FormField label="Currency">
          <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
            {['USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </FormField>
      </Modal>
    </div>
  );
}
