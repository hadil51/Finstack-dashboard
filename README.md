# Finstack Financial Dashboard

A full-stack production-ready financial dashboard built with React, Vite, Node.js, Express, and MongoDB (optional).

## Features

- **Dashboard** — Live stats, cash flow chart, currency converter, recent transactions, virtual cards
- **Transactions** — Full CRUD with filter, sort, edit, and delete
- **Payments** — Deposit, withdraw, and transfer with balance updates
- **Budgets** — Create and track spending limits with progress bars
- **Payment Links** — Create shareable URLs, copy, pause/activate, delete
- **Invoices** — Create, send, mark paid (updates balance), delete
- **Inbox** — Notifications with read/unread state
- **Cards** — Add, view, and remove virtual cards
- **Reports** — Charts by payment method, country, and budget utilization
- **Contacts** — Contact management with search
- **Sandbox** — Generate and revoke API keys
- **SDKs** — Integration snippets with copy-to-clipboard
- **Support** — Create and resolve support tickets
- **AI Assistant** — Ask questions about your finances
- **Dark mode**, global search (⌘F / Ctrl+F), toast notifications

## Quick Start (Development)

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Terminal 1 — API server (port 5000)
cd server && npm start

# Terminal 2 — Frontend dev server (port 5173)
cd client && npm run dev
```

Open **http://localhost:5173**

## Production Build

```bash
cd client && npm run build
cd ../server && set NODE_ENV=production && npm start
```

The server serves the built React app from `client/dist` on port 5000.

## Optional MongoDB

Create `server/.env`:

```
MONGO_URI=mongodb://localhost:27017/finstack
PORT=5000
```

Without MongoDB, the app runs with in-memory data that persists for the server session.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Balance, income, expense, cashflow |
| GET | /api/balance | Current account balance |
| GET/POST/PUT/DELETE | /api/transactions | Transaction CRUD |
| POST | /api/payments | Deposit, withdraw, transfer |
| GET/POST/PUT/DELETE | /api/cards | Card management |
| POST | /api/convert | Currency conversion |
| GET/POST/PUT/DELETE | /api/budgets | Budget CRUD |
| GET/POST/PUT/DELETE | /api/payment-links | Payment link CRUD |
| GET/POST/PUT/DELETE | /api/invoices | Invoice management |
| GET | /api/inbox | Messages |
| PUT | /api/inbox/:id/read | Mark message read |
| GET/POST/PUT/DELETE | /api/contacts | Contact CRUD |
| GET/POST/PUT/DELETE | /api/tickets | Support tickets |
| GET | /api/reports | Analytics data |
| GET/POST/DELETE | /api/keys | API key management |
| POST | /api/ai | AI assistant |
| GET | /api/health | Health check |

## Demo Recording Tips

1. Start both servers, open Dashboard at `http://localhost:5173`
2. Click **Deposit** → enter amount → Confirm (balance updates)
3. Navigate sidebar pages — each section is fully interactive
4. Use **Ask AI** → "What is my balance?"
5. **Transactions** → Add, edit, filter, sort, delete
6. **Invoices** → Create → Send → Mark Paid
7. **Payment Links** → Create → Copy link
8. Toggle **dark mode** from sidebar footer
