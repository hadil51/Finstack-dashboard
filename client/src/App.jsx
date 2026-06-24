import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import { ToastContainer } from './components/ui';
import { PaymentModal, NotificationsPanel, SettingsPanel, AISheet, SearchModal } from './components/Overlays';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import PaymentsPage from './pages/PaymentsPage';
import BudgetsPage from './pages/BudgetsPage';
import PaymentLinksPage from './pages/PaymentLinksPage';
import InvoicesPage from './pages/InvoicesPage';
import InboxPage from './pages/InboxPage';
import CardsPage from './pages/CardsPage';
import ReportsPage from './pages/ReportsPage';
import ContactsPage from './pages/ContactsPage';
import SandboxPage from './pages/SandboxPage';
import SDKsPage from './pages/SDKsPage';
import SupportPage from './pages/SupportPage';
import './App.css';
import './styles/shared.css';

const PAGES = {
  Dashboard,
  Transactions: TransactionsPage,
  Payments: PaymentsPage,
  Budgets: BudgetsPage,
  'Payment Links': PaymentLinksPage,
  Invoices: InvoicesPage,
  Inbox: InboxPage,
  Cards: CardsPage,
  Reports: ReportsPage,
  Contacts: ContactsPage,
  Sandbox: SandboxPage,
  SDKs: SDKsPage,
  Support: SupportPage,
};

function AppContent() {
  const { activePage, toasts } = useApp();
  const Page = PAGES[activePage] || Dashboard;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Page />
      </main>
      <ToastContainer toasts={toasts} />
      <PaymentModal />
      <NotificationsPanel />
      <SettingsPanel />
      <AISheet />
      <SearchModal />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
