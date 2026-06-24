import React, { useEffect } from 'react';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, BtnPrimary } from '../components/ui';

export default function InboxPage() {
  const { inbox, refreshInbox, toast } = useApp();

  useEffect(() => { refreshInbox(); }, [refreshInbox]);

  const markRead = async (id) => {
    await api.inbox.markRead(id);
    refreshInbox();
  };

  const markAll = async () => {
    await api.inbox.markAllRead();
    refreshInbox();
    toast('All messages marked as read');
  };

  const remove = async (id) => {
    await api.inbox.remove(id);
    refreshInbox();
    toast('Message deleted');
  };

  return (
    <div className="page">
      <PageHeader title="Inbox" subtitle="Messages and notifications"
        actions={<BtnPrimary small onClick={markAll}>Mark all read</BtnPrimary>} />
      <Card>
        {inbox.map((m) => (
          <div key={m._id} className={`inbox-item ${m.read ? '' : 'unread'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div onClick={() => markRead(m._id)} style={{ flex: 1, cursor: 'pointer' }}>
              <div className="inbox-item-from">{m.from}</div>
              <div className="inbox-item-subject">{m.subject}</div>
              <div className="inbox-item-preview">{m.preview}</div>
            </div>
            <button type="button" className="btn-outline" style={{ padding: '4px 10px', fontSize: 12, flexShrink: 0 }} onClick={() => remove(m._id)}>Delete</button>
          </div>
        ))}
        {inbox.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Inbox is empty</p>}
      </Card>
    </div>
  );
}
