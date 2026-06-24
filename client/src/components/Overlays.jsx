import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import { Modal, FormField, BtnPrimary, BtnOutline } from './ui';

export function PaymentModal() {
  const { paymentModal, setPaymentModal, toast, refreshBalance, triggerRefresh } = useApp();
  const action = paymentModal;
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const close = () => {
    setPaymentModal(null);
    setAmount('');
    setRecipient('');
    setNote('');
  };

  const submit = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return toast('Enter a valid amount', 'error');
    if (action === 'transfer' && !recipient.trim()) return toast('Enter recipient name', 'error');
    setLoading(true);
    try {
      await api.payments({ action, amount: parsed, method, recipient, note });
      toast(`${action.charAt(0).toUpperCase() + action.slice(1)} completed successfully`);
      refreshBalance();
      triggerRefresh();
      close();
    } catch (e) {
      toast(e.message, 'error');
    }
    setLoading(false);
  };

  const titles = { deposit: 'Deposit Funds', withdraw: 'Withdraw Funds', transfer: 'Transfer Money' };

  return (
    <Modal
      open={!!action}
      onClose={close}
      title={titles[action] || 'Payment'}
      footer={
        <>
          <BtnOutline onClick={close}>Cancel</BtnOutline>
          <BtnPrimary onClick={submit} disabled={loading}>{loading ? 'Processing…' : 'Confirm'}</BtnPrimary>
        </>
      }
    >
      <FormField label="Amount (USD)">
        <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
      </FormField>
      <FormField label="Method">
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          {['Bank Transfer', 'PayPal', 'Visa', 'Mastercard', 'Stripe'].map((m) => <option key={m}>{m}</option>)}
        </select>
      </FormField>
      {action === 'transfer' && (
        <FormField label="Recipient">
          <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Account or contact name" />
        </FormField>
      )}
      <FormField label="Note (optional)">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" />
      </FormField>
      {action === 'invoice' && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          You will be redirected to create a new invoice.
        </p>
      )}
    </Modal>
  );
}

export function NotificationsPanel() {
  const { showNotifications, setShowNotifications, inbox, refreshInbox, toast } = useApp();

  const markAll = async () => {
    await api.inbox.markAllRead();
    refreshInbox();
    toast('All messages marked as read');
  };

  const openMsg = async (msg) => {
    if (!msg.read) {
      await api.inbox.markRead(msg._id);
      refreshInbox();
    }
  };

  if (!showNotifications) return null;

  return (
    <div className="panel-overlay" onClick={() => setShowNotifications(false)}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Notifications</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-primary-sm" onClick={markAll}>Mark all read</button>
            <button type="button" onClick={() => setShowNotifications(false)}>✕</button>
          </div>
        </div>
        <div className="panel-body">
          {inbox.map((m) => (
            <div key={m._id} className={`inbox-item ${m.read ? '' : 'unread'}`} onClick={() => openMsg(m)}>
              <div className="inbox-item-from">{m.from}</div>
              <div className="inbox-item-subject">{m.subject}</div>
              <div className="inbox-item-preview">{m.preview}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const { showSettings, setShowSettings, theme, setTheme } = useApp();
  if (!showSettings) return null;
  return (
    <div className="panel-overlay" onClick={() => setShowSettings(false)}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Settings</h3>
          <button type="button" onClick={() => setShowSettings(false)}>✕</button>
        </div>
        <div className="panel-body" style={{ padding: 20 }}>
          <FormField label="Theme">
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </FormField>
          <FormField label="Default Currency">
            <select defaultValue="USD">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </FormField>
          <FormField label="Notifications">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input type="checkbox" defaultChecked /> Email alerts
            </label>
          </FormField>
        </div>
      </div>
    </div>
  );
}

export function AISheet() {
  const { showAI, setShowAI } = useApp();
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi! Ask me about your balance, transactions, invoices, budgets, or cards.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
      const { answer } = await api.ai(q);
      setMessages((m) => [...m, { role: 'bot', text: answer }]);
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, I could not process that request.' }]);
    }
    setLoading(false);
  };

  return (
    <Modal open={showAI} onClose={() => setShowAI(false)} title="Ask AI"
      footer={<BtnPrimary onClick={send} disabled={loading}>{loading ? 'Thinking…' : 'Send'}</BtnPrimary>}>
      <div className="ai-chat">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ai-msg--${m.role}`}>{m.text}</div>
        ))}
      </div>
      <div className="ai-input-row">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask about your finances…" />
      </div>
    </Modal>
  );
}

export function SearchModal() {
  const { showSearch, setShowSearch, navigate } = useApp();
  const [q, setQ] = useState('');

  const pages = ['Dashboard', 'Transactions', 'Payments', 'Budgets', 'Payment Links', 'Invoices', 'Inbox', 'Cards', 'Reports', 'Contacts', 'Sandbox', 'SDKs', 'Support'];
  const results = pages.filter((p) => p.toLowerCase().includes(q.toLowerCase()));

  const go = (page) => {
    navigate(page);
    setShowSearch(false);
    setQ('');
  };

  return (
    <Modal open={showSearch} onClose={() => setShowSearch(false)} title="Search">
      <input className="search-input" style={{ width: '100%' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages…" autoFocus />
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {results.map((p) => (
          <button key={p} type="button" className="dropdown-item" style={{ borderRadius: 6 }} onClick={() => go(p)}>{p}</button>
        ))}
        {q && results.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: 8 }}>No results</p>}
      </div>
    </Modal>
  );
}
