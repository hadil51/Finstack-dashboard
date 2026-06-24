const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finstack';
let mongoAvailable = false;
mongoose
  .connect(MONGO_URI)
  .then(() => {
    mongoAvailable = true;
    console.log('MongoDB connected');
  })
  .catch(() => {
    mongoAvailable = false;
    console.log('Running with in-memory data');
  });

const TransactionSchema = new mongoose.Schema({
  customer: String,
  amount: Number,
  method: String,
  status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
  country: String,
  type: { type: String, default: 'payment' },
  note: String,
  date: { type: Date, default: Date.now },
});

const CardSchema = new mongoose.Schema({
  type: String,
  last4: String,
  color: String,
  balance: Number,
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
const Card = mongoose.model('Card', CardSchema);

const now = () => new Date();
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const toAmount = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : NaN;
};
const sanitizeStatus = (s) => (['Completed', 'Pending', 'Failed', 'Paid', 'Draft', 'Sent', 'Overdue', 'Active', 'Paused', 'Open', 'Resolved'].includes(s) ? s : 'Completed');

const memory = {
  balance: 12121.12,
  transactions: [
    { customer: 'John Carter', amount: 120.5, method: 'PayPal', status: 'Completed', country: 'US', type: 'payment' },
    { customer: 'Maria Gomez', amount: 89.99, method: 'Mastercard', status: 'Completed', country: 'US', type: 'payment' },
    { customer: 'Luca Ferrari', amount: 340.0, method: 'Visa', status: 'Pending', country: 'IT', type: 'payment' },
    { customer: 'Sophie Martin', amount: 65.2, method: 'PayPal', status: 'Completed', country: 'FR', type: 'payment' },
    { customer: 'Amir Khan', amount: 210.75, method: 'Stripe', status: 'Failed', country: 'UK', type: 'payment' },
    { customer: 'Yuki Tanaka', amount: 480.0, method: 'Visa', status: 'Completed', country: 'JP', type: 'payment' },
    { customer: 'Emma Wilson', amount: 55.99, method: 'Mastercard', status: 'Completed', country: 'US', type: 'payment' },
    { customer: 'Carlos Silva', amount: 920.0, method: 'Bank Transfer', status: 'Pending', country: 'BR', type: 'payment' },
  ].map((t) => ({ _id: makeId(), date: now(), ...t })),
  cards: [
    { type: 'VISA', last4: '2104', color: '#3B5EDB', balance: 9754.4 },
    { type: 'Mastercard', last4: '8821', color: '#F59E0B', balance: 3200.0 },
  ].map((c) => ({ _id: makeId(), ...c })),
  budgets: [
    { name: 'Marketing', category: 'Operations', limit: 5000, spent: 3200 },
    { name: 'Payroll', category: 'HR', limit: 25000, spent: 24800 },
    { name: 'Software', category: 'Tools', limit: 2000, spent: 890 },
    { name: 'Travel', category: 'Operations', limit: 3000, spent: 1200 },
  ].map((b) => ({ _id: makeId(), ...b })),
  paymentLinks: [
    { title: 'Pro Plan Subscription', amount: 49.99, currency: 'USD', status: 'Active', clicks: 142 },
    { title: 'Consulting Invoice', amount: 1500, currency: 'USD', status: 'Active', clicks: 28 },
    { title: 'Workshop Ticket', amount: 199, currency: 'USD', status: 'Paused', clicks: 67 },
  ].map((p) => ({ _id: makeId(), url: `https://pay.finstack.io/${makeId().slice(-8)}`, created: now(), ...p })),
  invoices: [
    { number: 'INV-2026-001', client: 'Acme Corp', amount: 4500, status: 'Paid', dueDate: '2026-06-01' },
    { number: 'INV-2026-002', client: 'Globex Inc', amount: 2200, status: 'Sent', dueDate: '2026-06-30' },
    { number: 'INV-2026-003', client: 'Stark Industries', amount: 8900, status: 'Draft', dueDate: '2026-07-15' },
    { number: 'INV-2026-004', client: 'Wayne Enterprises', amount: 1200, status: 'Overdue', dueDate: '2026-05-15' },
  ].map((i) => ({ _id: makeId(), created: now(), ...i })),
  inbox: [
    { from: 'Finstack Security', subject: 'New login detected', preview: 'A new login was detected from Chrome on Windows.', read: false },
    { from: 'Payments Team', subject: 'Payout processed', preview: 'Your payout of $4,500.00 has been processed.', read: false },
    { from: 'Support', subject: 'Ticket #1042 resolved', preview: 'Your support ticket has been marked as resolved.', read: true },
    { from: 'Billing', subject: 'Invoice reminder', preview: 'Invoice INV-2026-004 is overdue.', read: true },
  ].map((m) => ({ _id: makeId(), date: now(), ...m })),
  contacts: [
    { name: 'John Carter', email: 'john@acme.com', company: 'Acme Corp', phone: '+1 555-0101' },
    { name: 'Maria Gomez', email: 'maria@globex.com', company: 'Globex Inc', phone: '+1 555-0102' },
    { name: 'Luca Ferrari', email: 'luca@stark.it', company: 'Stark Industries', phone: '+39 555-0103' },
    { name: 'Sophie Martin', email: 'sophie@wayne.fr', company: 'Wayne Enterprises', phone: '+33 555-0104' },
  ].map((c) => ({ _id: makeId(), created: now(), ...c })),
  tickets: [
    { subject: 'API rate limit question', status: 'Open', priority: 'Medium', message: 'How do I increase my API rate limits?' },
    { subject: 'Webhook delivery failures', status: 'Open', priority: 'High', message: 'Webhooks failing with 500 errors.' },
  ].map((t) => ({ _id: makeId(), created: now(), ...t })),
  apiKeys: [
    { name: 'Production', key: 'fsk_live_7xK9mN2pQ8rT4vW6', created: now() },
    { name: 'Development', key: 'fsk_test_3aB5cD7eF9gH1jK', created: now() },
  ].map((k) => ({ _id: makeId(), ...k })),
};

function usingMongo() {
  return mongoAvailable && mongoose.connection.readyState === 1;
}

function generateCashFlow() {
  const points = [];
  const d = new Date();
  for (let i = 10; i >= 0; i--) {
    const t = new Date(d - i * 3600000);
    const time = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    points.push({
      time,
      income: 2800 + Math.random() * 3500,
      invest: 2200 + Math.random() * 2000,
      expense: 2000 + Math.random() * 2500,
    });
  }
  return points;
}

function computeDashboard(transactions, balance) {
  const completed = transactions.filter((t) => t.status === 'Completed');
  const income = completed.filter((t) => t.amount >= 0).reduce((a, b) => a + b.amount, 0);
  const expense = completed.filter((t) => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);
  return {
    totalBalance: Number(balance.toFixed(2)),
    totalIncome: Number(income.toFixed(2)),
    totalExpense: Number(expense.toFixed(2)),
    cashFlow: { total: Number((income + expense * 0.6).toFixed(2)), change: '+5.2%', data: generateCashFlow() },
  };
}

function crudRoutes(name, collection, validate) {
  app.get(`/api/${name}`, (req, res) => res.json(memory[collection]));
  app.post(`/api/${name}`, (req, res) => {
    const err = validate?.(req.body);
    if (err) return res.status(400).json({ error: err });
    const item = { _id: makeId(), created: now(), ...req.body };
    memory[collection].unshift(item);
    res.status(201).json(item);
  });
  app.put(`/api/${name}/:id`, (req, res) => {
    const idx = memory[collection].findIndex((x) => String(x._id) === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    memory[collection][idx] = { ...memory[collection][idx], ...req.body };
    res.json(memory[collection][idx]);
  });
  app.delete(`/api/${name}/:id`, (req, res) => {
    const before = memory[collection].length;
    memory[collection] = memory[collection].filter((x) => String(x._id) !== req.params.id);
    if (memory[collection].length === before) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
app.get('/api/dashboard', async (req, res) => {
  try {
    if (usingMongo()) {
      const txns = await Transaction.find().sort({ date: -1 }).limit(200);
      const amounts = txns.map((t) => ({ amount: Number(t.amount) || 0, status: t.status }));
      const bal = memory.balance;
      return res.json(computeDashboard(amounts, bal));
    }
  } catch {}
  res.json(computeDashboard(memory.transactions, memory.balance));
});

app.get('/api/balance', (req, res) => res.json({ balance: memory.balance }));

// ── Transactions ──────────────────────────────────────────────────────────────
app.get('/api/transactions', async (req, res) => {
  try {
    if (usingMongo()) {
      const txns = await Transaction.find().sort({ date: -1 }).limit(200);
      if (txns.length > 0) return res.json(txns);
    }
  } catch {}
  res.json([...memory.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)));
});

app.post('/api/transactions', async (req, res) => {
  const { customer, amount, method, status, country, type, note } = req.body || {};
  const parsedAmount = toAmount(amount);
  if (!customer || !method || !country || !Number.isFinite(parsedAmount)) {
    return res.status(400).json({ error: 'Invalid transaction payload' });
  }
  const payload = {
    customer: String(customer),
    amount: parsedAmount,
    method: String(method),
    status: sanitizeStatus(status),
    country: String(country),
    type: type || 'payment',
    note: note || '',
    date: now(),
  };
  try {
    if (usingMongo()) {
      const txn = new Transaction(payload);
      await txn.save();
      if (payload.status === 'Completed') memory.balance += parsedAmount;
      return res.status(201).json(txn);
    }
  } catch {}
  const created = { _id: makeId(), ...payload };
  memory.transactions.unshift(created);
  if (created.status === 'Completed') memory.balance += parsedAmount;
  res.status(201).json(created);
});

app.put('/api/transactions/:id', async (req, res) => {
  const update = {};
  ['customer', 'method', 'country', 'status', 'type', 'note'].forEach((k) => {
    if (req.body[k] != null) update[k] = String(req.body[k]);
  });
  if (req.body.amount != null) {
    const parsed = toAmount(req.body.amount);
    if (!Number.isFinite(parsed)) return res.status(400).json({ error: 'Invalid amount' });
    update.amount = parsed;
  }
  if (req.body.status) update.status = sanitizeStatus(req.body.status);
  try {
    if (usingMongo()) {
      const doc = await Transaction.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      return res.json(doc);
    }
  } catch {}
  const idx = memory.transactions.findIndex((t) => String(t._id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  memory.transactions[idx] = { ...memory.transactions[idx], ...update };
  res.json(memory.transactions[idx]);
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    if (usingMongo()) {
      const doc = await Transaction.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      return res.json({ ok: true });
    }
  } catch {}
  const before = memory.transactions.length;
  memory.transactions = memory.transactions.filter((t) => String(t._id) !== req.params.id);
  if (memory.transactions.length === before) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ── Payments (deposit / withdraw / transfer) ────────────────────────────────
app.post('/api/payments', (req, res) => {
  const { action, amount, method, recipient, note } = req.body || {};
  const parsed = toAmount(amount);
  if (!['deposit', 'withdraw', 'transfer'].includes(action) || !Number.isFinite(parsed) || parsed <= 0) {
    return res.status(400).json({ error: 'Invalid payment' });
  }
  if (action === 'withdraw' && parsed > memory.balance) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  if (action === 'transfer' && parsed > memory.balance) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  const signed = action === 'deposit' ? parsed : -parsed;
  if (action !== 'transfer') memory.balance += signed;

  const labels = { deposit: 'Deposit', withdraw: 'Withdrawal', transfer: 'Transfer' };
  const txn = {
    _id: makeId(),
    customer: action === 'transfer' ? recipient || 'External Account' : 'Account Holder',
    amount: signed,
    method: method || 'Bank Transfer',
    status: 'Completed',
    country: 'US',
    type: action,
    note: note || `${labels[action]} of $${parsed.toFixed(2)}`,
    date: now(),
  };
  memory.transactions.unshift(txn);

  if (action === 'transfer') {
    memory.inbox.unshift({
      _id: makeId(),
      from: 'Transfers',
      subject: `Transfer of $${parsed.toFixed(2)} sent`,
      preview: `Transfer to ${recipient || 'recipient'} completed successfully.`,
      read: false,
      date: now(),
    });
  }

  res.status(201).json({ transaction: txn, balance: memory.balance });
});

// ── Cards ─────────────────────────────────────────────────────────────────────
app.get('/api/cards', async (req, res) => {
  try {
    if (usingMongo()) {
      const cards = await Card.find();
      if (cards.length > 0) return res.json(cards);
    }
  } catch {}
  res.json(memory.cards);
});

app.post('/api/cards', async (req, res) => {
  const { type, last4, color, balance } = req.body || {};
  const parsedBalance = toAmount(balance);
  if (!type || !last4 || !Number.isFinite(parsedBalance)) {
    return res.status(400).json({ error: 'Invalid card payload' });
  }
  const payload = { type: String(type), last4: String(last4).slice(-4), color: color || '#3B5EDB', balance: parsedBalance };
  try {
    if (usingMongo()) {
      const card = new Card(payload);
      await card.save();
      return res.status(201).json(card);
    }
  } catch {}
  const created = { _id: makeId(), ...payload };
  memory.cards.push(created);
  res.status(201).json(created);
});

app.put('/api/cards/:id', (req, res) => {
  const idx = memory.cards.findIndex((c) => String(c._id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (req.body.balance != null) {
    const b = toAmount(req.body.balance);
    if (!Number.isFinite(b)) return res.status(400).json({ error: 'Invalid balance' });
    memory.cards[idx].balance = b;
  }
  if (req.body.type) memory.cards[idx].type = req.body.type;
  if (req.body.last4) memory.cards[idx].last4 = String(req.body.last4).slice(-4);
  if (req.body.color) memory.cards[idx].color = req.body.color;
  res.json(memory.cards[idx]);
});

app.delete('/api/cards/:id', async (req, res) => {
  try {
    if (usingMongo()) {
      const doc = await Card.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      return res.json({ ok: true });
    }
  } catch {}
  const before = memory.cards.length;
  memory.cards = memory.cards.filter((c) => String(c._id) !== req.params.id);
  if (memory.cards.length === before) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ── Convert ───────────────────────────────────────────────────────────────────
app.post('/api/convert', (req, res) => {
  const { amount, from, to } = req.body || {};
  const parsed = toAmount(amount);
  const rates = { USD: 1, IDR: 15900, EUR: 0.92, GBP: 0.79, JPY: 149.5 };
  if (!Number.isFinite(parsed) || !rates[from] || !rates[to]) {
    return res.status(400).json({ error: 'Invalid conversion' });
  }
  const result = (parsed / rates[from]) * rates[to];
  res.json({ result: result.toFixed(2), fee: 0, total: parsed, rate: (rates[to] / rates[from]).toFixed(4) });
});

// ── Budgets, Payment Links, Invoices, Contacts, Tickets, API Keys ─────────────
crudRoutes('budgets', 'budgets', (b) => (!b.name || !Number.isFinite(toAmount(b.limit)) ? 'Invalid budget' : null));
crudRoutes('contacts', 'contacts', (b) => (!b.name || !b.email ? 'Invalid contact' : null));
crudRoutes('tickets', 'tickets', (b) => (!b.subject || !b.message ? 'Invalid ticket' : null));

app.get('/api/invoices', (req, res) => res.json(memory.invoices));
app.post('/api/invoices', (req, res) => {
  const { client, amount, dueDate, status } = req.body || {};
  const parsed = toAmount(amount);
  if (!client || !Number.isFinite(parsed)) return res.status(400).json({ error: 'Invalid invoice' });
  const num = `INV-2026-${String(memory.invoices.length + 1).padStart(3, '0')}`;
  const inv = { _id: makeId(), number: num, client, amount: parsed, dueDate: dueDate || new Date().toISOString().slice(0, 10), status: status || 'Draft', created: now() };
  memory.invoices.unshift(inv);
  res.status(201).json(inv);
});
app.put('/api/invoices/:id', (req, res) => {
  const idx = memory.invoices.findIndex((i) => String(i._id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const prev = memory.invoices[idx].status;
  memory.invoices[idx] = { ...memory.invoices[idx], ...req.body };
  if (req.body.status === 'Paid' && prev !== 'Paid') {
    memory.balance += memory.invoices[idx].amount;
    memory.transactions.unshift({
      _id: makeId(),
      customer: memory.invoices[idx].client,
      amount: memory.invoices[idx].amount,
      method: 'Invoice',
      status: 'Completed',
      country: 'US',
      type: 'payment',
      note: `Payment for ${memory.invoices[idx].number}`,
      date: now(),
    });
  }
  res.json(memory.invoices[idx]);
});
app.delete('/api/invoices/:id', (req, res) => {
  const before = memory.invoices.length;
  memory.invoices = memory.invoices.filter((i) => String(i._id) !== req.params.id);
  if (memory.invoices.length === before) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

app.get('/api/payment-links', (req, res) => res.json(memory.paymentLinks));
app.post('/api/payment-links', (req, res) => {
  const { title, amount, currency, status } = req.body || {};
  const parsed = toAmount(amount);
  if (!title || !Number.isFinite(parsed)) return res.status(400).json({ error: 'Invalid link' });
  const link = { _id: makeId(), title, amount: parsed, currency: currency || 'USD', status: status || 'Active', clicks: 0, url: `https://pay.finstack.io/${makeId().slice(-8)}`, created: now() };
  memory.paymentLinks.unshift(link);
  res.status(201).json(link);
});
app.put('/api/payment-links/:id', (req, res) => {
  const idx = memory.paymentLinks.findIndex((p) => String(p._id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  memory.paymentLinks[idx] = { ...memory.paymentLinks[idx], ...req.body };
  res.json(memory.paymentLinks[idx]);
});
app.delete('/api/payment-links/:id', (req, res) => {
  const before = memory.paymentLinks.length;
  memory.paymentLinks = memory.paymentLinks.filter((p) => String(p._id) !== req.params.id);
  if (memory.paymentLinks.length === before) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ── Inbox ─────────────────────────────────────────────────────────────────────
app.get('/api/inbox', (req, res) => res.json(memory.inbox));
app.put('/api/inbox/:id/read', (req, res) => {
  const msg = memory.inbox.find((m) => String(m._id) === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Not found' });
  msg.read = true;
  res.json(msg);
});
app.put('/api/inbox/read-all', (req, res) => {
  memory.inbox.forEach((m) => { m.read = true; });
  res.json({ ok: true });
});
app.delete('/api/inbox/:id', (req, res) => {
  const before = memory.inbox.length;
  memory.inbox = memory.inbox.filter((m) => String(m._id) !== req.params.id);
  if (memory.inbox.length === before) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ── Reports ───────────────────────────────────────────────────────────────────
app.get('/api/reports', (req, res) => {
  const byMethod = {};
  const byCountry = {};
  memory.transactions.forEach((t) => {
    byMethod[t.method] = (byMethod[t.method] || 0) + Math.abs(t.amount);
    byCountry[t.country] = (byCountry[t.country] || 0) + Math.abs(t.amount);
  });
  const monthly = {};
  memory.transactions.forEach((t) => {
    const m = new Date(t.date).toLocaleString('en-US', { month: 'short' });
    monthly[m] = (monthly[m] || 0) + Math.abs(t.amount);
  });
  res.json({
    totalTransactions: memory.transactions.length,
    totalVolume: memory.transactions.reduce((a, t) => a + Math.abs(t.amount), 0),
    byMethod: Object.entries(byMethod).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) })),
    byCountry: Object.entries(byCountry).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) })),
    monthly: Object.entries(monthly).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) })),
    budgetUtilization: memory.budgets.map((b) => ({ name: b.name, spent: b.spent, limit: b.limit, pct: Math.round((b.spent / b.limit) * 100) })),
  });
});

// ── API Keys ──────────────────────────────────────────────────────────────────
app.get('/api/keys', (req, res) => res.json(memory.apiKeys));
app.post('/api/keys', (req, res) => {
  const name = req.body?.name || 'New Key';
  const key = `fsk_test_${Math.random().toString(36).slice(2, 18)}`;
  const item = { _id: makeId(), name, key, created: now() };
  memory.apiKeys.push(item);
  res.status(201).json(item);
});
app.delete('/api/keys/:id', (req, res) => {
  memory.apiKeys = memory.apiKeys.filter((k) => String(k._id) !== req.params.id);
  res.json({ ok: true });
});

// ── AI Assistant (demo) ───────────────────────────────────────────────────────
app.post('/api/ai', (req, res) => {
  const q = (req.body?.question || '').toLowerCase();
  let answer = 'I can help with balances, transactions, invoices, and payments. Try asking about your balance or recent activity.';
  if (q.includes('balance')) answer = `Your current balance is $${memory.balance.toFixed(2)}.`;
  else if (q.includes('transaction')) answer = `You have ${memory.transactions.length} transactions. The most recent is ${memory.transactions[0]?.customer || 'N/A'} for $${Math.abs(memory.transactions[0]?.amount || 0).toFixed(2)}.`;
  else if (q.includes('invoice')) answer = `You have ${memory.invoices.length} invoices. ${memory.invoices.filter((i) => i.status === 'Overdue').length} are overdue.`;
  else if (q.includes('budget')) answer = memory.budgets.map((b) => `${b.name}: $${b.spent}/$${b.limit} (${Math.round((b.spent / b.limit) * 100)}%)`).join('. ');
  else if (q.includes('card')) answer = `You have ${memory.cards.length} cards with a combined balance of $${memory.cards.reduce((a, c) => a + c.balance, 0).toFixed(2)}.`;
  res.json({ answer });
});

app.get('/api/health', (req, res) => res.json({ ok: true, mode: usingMongo() ? 'mongodb' : 'memory' }));

// ── Production static serving ─────────────────────────────────────────────────
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Finstack API running on port ${PORT}`));
