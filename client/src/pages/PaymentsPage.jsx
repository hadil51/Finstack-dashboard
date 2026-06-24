import React, { useState, useEffect } from 'react';
import { api, fmt } from '../api';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, FormField, BtnPrimary } from '../components/ui';

export default function PaymentsPage({ initialTab = 'deposit' }) {
  const { toast, refreshBalance, paymentModal } = useApp();
  const [tab, setTab] = useState(paymentModal || initialTab);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [recent, setRecent] = useState([]);

  useEffect(() => { if (paymentModal) setTab(paymentModal); }, [paymentModal]);
  useEffect(() => {
    api.balance().then((d) => setBalance(d.balance));
    api.transactions.list().then((t) => setRecent(t.filter((x) => ['deposit', 'withdraw', 'transfer'].includes(x.type)).slice(0, 8)));
  }, []);

  const submit = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return toast('Enter a valid amount', 'error');
    if (tab === 'transfer' && !recipient.trim()) return toast('Enter recipient', 'error');
    setLoading(true);
    try {
      const res = await api.payments({ action: tab, amount: parsed, method, recipient, note });
      setBalance(res.balance);
      refreshBalance();
      toast(`${tab.charAt(0).toUpperCase() + tab.slice(1)} of $${fmt(parsed)} completed`);
      setAmount('');
      setNote('');
      setRecipient('');
      const txns = await api.transactions.list();
      setRecent(txns.filter((x) => ['deposit', 'withdraw', 'transfer'].includes(x.type)).slice(0, 8));
    } catch (e) { toast(e.message, 'error'); }
    setLoading(false);
  };

  return (
    <div className="page">
      <PageHeader title="Payments" subtitle={`Available balance: $${fmt(balance)}`} />
      <div className="page-grid-2">
        <Card>
          <div className="tabs">
            {['deposit', 'withdraw', 'transfer'].map((t) => (
              <button key={t} type="button" className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <FormField label="Amount (USD)">
            <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </FormField>
          <FormField label="Payment Method">
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              {['Bank Transfer', 'PayPal', 'Visa', 'Mastercard', 'Stripe'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </FormField>
          {tab === 'transfer' && (
            <FormField label="Recipient">
              <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Name or account" />
            </FormField>
          )}
          <FormField label="Note">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
          </FormField>
          <BtnPrimary onClick={submit} disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Processing…' : `Confirm ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
          </BtnPrimary>
        </Card>
        <Card title="Recent Payment Activity">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Type</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t._id}>
                    <td style={{ textTransform: 'capitalize' }}>{t.type}</td>
                    <td>${fmt(Math.abs(t.amount))}</td>
                    <td>{t.method}</td>
                    <td>{t.status}</td>
                  </tr>
                ))}
                {recent.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payments yet</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
