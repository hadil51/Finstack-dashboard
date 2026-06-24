import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, Modal, FormField, BtnPrimary, BtnOutline, StatusBadge } from '../components/ui';

export default function SupportPage() {
  const { toast } = useApp();
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'Medium' });

  const load = () => api.tickets.list().then(setTickets).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.tickets.create({ ...form, status: 'Open' });
      toast('Support ticket created');
      setShowModal(false);
      setForm({ subject: '', message: '', priority: 'Medium' });
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const resolve = async (id) => {
    await api.tickets.update(id, { status: 'Resolved' });
    toast('Ticket resolved');
    load();
  };

  const remove = async (id) => {
    await api.tickets.remove(id);
    toast('Ticket deleted');
    load();
  };

  return (
    <div className="page">
      <PageHeader title="Support" subtitle="Get help from our team"
        actions={<BtnPrimary small onClick={() => setShowModal(true)}>+ New Ticket</BtnPrimary>} />
      <Card>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Subject</th><th>Priority</th><th>Status</th><th>Message</th><th></th></tr></thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id}>
                  <td><strong>{t.subject}</strong></td>
                  <td>{t.priority}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.message}</td>
                  <td>
                    <div className="row-actions">
                      {t.status === 'Open' && <button type="button" className="btn-primary-sm" onClick={() => resolve(t._id)}>Resolve</button>}
                      <button type="button" className="btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => remove(t._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Support Ticket"
        footer={<><BtnOutline onClick={() => setShowModal(false)}>Cancel</BtnOutline><BtnPrimary onClick={save}>Submit</BtnPrimary></>}>
        <FormField label="Subject"><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></FormField>
        <FormField label="Priority">
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
          </select>
        </FormField>
        <FormField label="Message">
          <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 14, resize: 'vertical' }} />
        </FormField>
      </Modal>
    </div>
  );
}
