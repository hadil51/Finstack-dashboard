import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activePage, setActivePage] = useState('Dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('finstack-theme') || 'light');
  const [toasts, setToasts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [balance, setBalance] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('finstack-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const refreshInbox = useCallback(() => {
    api.inbox.list().then(setInbox).catch(() => {});
  }, []);

  const refreshBalance = useCallback(() => {
    api.balance().then((d) => setBalance(d.balance)).catch(() => {});
  }, []);

  useEffect(() => {
    refreshInbox();
    refreshBalance();
  }, [refreshInbox, refreshBalance]);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const navigate = useCallback((page, opts = {}) => {
    setActivePage(page);
    if (opts.paymentAction) setPaymentModal(opts.paymentAction);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const unreadCount = inbox.filter((m) => !m.read).length;

  return (
    <AppContext.Provider value={{
      activePage, setActivePage, navigate, theme, toggleTheme, setTheme,
      toast, toasts, searchQuery, setSearchQuery, showSearch, setShowSearch,
      showNotifications, setShowNotifications, showSettings, setShowSettings,
      showAI, setShowAI, paymentModal, setPaymentModal,
      inbox, setInbox, refreshInbox, unreadCount, balance, refreshBalance, refreshKey, triggerRefresh,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
