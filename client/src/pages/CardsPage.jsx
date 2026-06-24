import React, { useState, useEffect } from 'react';
import { api, fmt } from '../api';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, Modal, FormField, BtnPrimary, BtnOutline } from '../components/ui';
import './Dashboard.css';

export default function CardsPage() {
  const { toast } = useApp();
  const [cards, setCards] = useState([]);
  const [active, setActive] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'VISA', last4: '', color: '#3B5EDB', balance: '' });

  const load = () => api.cards.list().then(setCards).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.cards.create({ ...form, balance: parseFloat(form.balance) });
      toast('Card added');
      setShowModal(false);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const remove = async (id) => {
    if (!confirm('Remove this card?')) return;
    await api.cards.remove(id);
    toast('Card removed');
    load();
  };

  return (
    <div className="page">
      <PageHeader title="Cards" subtitle="Manage your virtual payment cards"
        actions={<BtnPrimary small onClick={() => setShowModal(true)}>+ Add Card</BtnPrimary>} />
      <div className="page-grid-2">
        <div className="cards-list">
          {cards.map((card, i) => (
            <div key={card._id} className={`credit-card ${active === i ? 'active' : ''}`}
              style={{ background: card.color || '#3B5EDB' }} onClick={() => setActive(i)}>
              <div className="card-chip">
                <svg width="28" height="22" viewBox="0 0 28 22"><rect width="28" height="22" rx="3" fill="rgba(255,255,255,0.3)"/></svg>
              </div>
              <div className="card-brand">{card.type}</div>
              <div className="card-number">**** **** {card.last4}</div>
              <div className="card-footer-row">
                <div>
                  <div className="card-meta-label">Balance</div>
                  <div className="card-meta-value">${fmt(card.balance)}</div>
                </div>
                <button type="button" className="btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', fontSize: 11, padding: '4px 10px' }}
                  onClick={(e) => { e.stopPropagation(); remove(card._id); }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {cards[active] && (
          <Card title="Card Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Type: </span>{cards[active].type}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Number: </span>**** **** {cards[active].last4}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Balance: </span>${fmt(cards[active].balance)}</div>
            </div>
          </Card>
        )}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Card"
        footer={<><BtnOutline onClick={() => setShowModal(false)}>Cancel</BtnOutline><BtnPrimary onClick={save}>Add</BtnPrimary></>}>
        <FormField label="Type">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['VISA', 'Mastercard', 'Amex'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Last 4 digits"><input maxLength={4} value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} /></FormField>
        <FormField label="Balance"><input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} /></FormField>
        <FormField label="Color">
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        </FormField>
      </Modal>
    </div>
  );
}
