import React, { useState, useEffect } from 'react';
import { api, initials, AVATAR_COLORS } from '../api';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, Modal, FormField, BtnPrimary, BtnOutline } from '../components/ui';

export default function ContactsPage() {
  const { toast } = useApp();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '' });

  const load = () => api.contacts.list().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = items.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.email.toLowerCase().includes(filter.toLowerCase()) ||
    c.company.toLowerCase().includes(filter.toLowerCase())
  );

  const save = async () => {
    try {
      await api.contacts.create(form);
      toast('Contact added');
      setShowModal(false);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete contact?')) return;
    await api.contacts.remove(id);
    toast('Contact deleted');
    load();
  };

  return (
    <div className="page">
      <PageHeader title="Contacts" subtitle="Manage your business contacts"
        actions={<BtnPrimary small onClick={() => setShowModal(true)}>+ Add Contact</BtnPrimary>} />
      <Card>
        <div className="toolbar">
          <input className="search-input" placeholder="Search contacts…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Phone</th><th></th></tr></thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c._id}>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{initials(c.name)}</div>
                      {c.name}
                    </div>
                  </td>
                  <td>{c.email}</td>
                  <td>{c.company}</td>
                  <td>{c.phone}</td>
                  <td><button type="button" className="btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => remove(c._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Contact"
        footer={<><BtnOutline onClick={() => setShowModal(false)}>Cancel</BtnOutline><BtnPrimary onClick={save}>Save</BtnPrimary></>}>
        {['Name', 'Email', 'Company', 'Phone'].map((label) => {
          const field = label.toLowerCase();
          return (
            <FormField key={field} label={label}>
              <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            </FormField>
          );
        })}
      </Modal>
    </div>
  );
}
