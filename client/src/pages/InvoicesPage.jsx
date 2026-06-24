import React, { useState, useEffect } from 'react';
import { api, fmt } from '../api';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, Modal, FormField, BtnPrimary, BtnOutline, StatusBadge } from '../components/ui';

export default function InvoicesPage() {
  const { toast, refreshBalance } = useApp();
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client: '', amount: '', dueDate: '', status: 'Draft' });

  const load = () => api.invoices.list().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.invoices.create({ ...form, amount: parseFloat(form.amount) });
      toast('Invoice created');
      setShowModal(false);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const markPaid = async (inv) => {
    await api.invoices.update(inv._id, { status: 'Paid' });
    toast(`Invoice ${inv.number} marked as paid`);
    refreshBalance();
    load();
  };

  const send = async (inv) => {
    await api.invoices.update(inv._id, { status: 'Sent' });
    toast(`Invoice ${inv.number} sent to ${inv.client}`);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete invoice?')) return;
    await api.invoices.remove(id);
    toast('Invoice deleted');
    load();
  };

  return (
    <div className="page">
      <PageHeader title="Invoices" subtitle="Create, send, and track invoices"
        actions={<BtnPrimary small onClick={() => setShowModal(true)}>+ New Invoice</BtnPrimary>} />
      <Card>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Number</th><th>Client</th><th>Amount</th><th>Due Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((inv) => (
                <tr key={inv._id}>
                  <td><strong>{inv.number}</strong></td>
                  <td>{inv.client}</td>
                  <td>${fmt(inv.amount)}</td>
                  <td>{inv.dueDate}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <div className="row-actions">
                      {inv.status === 'Draft' && <button type="button" className="btn-primary-sm" onClick={() => send(inv)}>Send</button>}
                      {inv.status !== 'Paid' && inv.status !== 'Draft' && (
                        <button type="button" className="btn-primary-sm" onClick={() => markPaid(inv)}>Mark Paid</button>
                      )}
                      <button type="button" className="btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => remove(inv._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Invoice"
        footer={<><BtnOutline onClick={() => setShowModal(false)}>Cancel</BtnOutline><BtnPrimary onClick={save}>Create</BtnPrimary></>}>
        <FormField label="Client"><input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></FormField>
        <FormField label="Amount"><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></FormField>
        <FormField label="Due Date"><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></FormField>
      </Modal>
    </div>
  );
}
