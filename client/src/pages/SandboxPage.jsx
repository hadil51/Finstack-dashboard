import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, BtnPrimary } from '../components/ui';

export default function SandboxPage() {
  const { toast } = useApp();
  const [keys, setKeys] = useState([]);

  const load = () => api.keys.list().then(setKeys).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async () => {
    await api.keys.create({ name: `Key ${keys.length + 1}` });
    toast('API key generated');
    load();
  };

  const copy = (key) => { navigator.clipboard.writeText(key); toast('API key copied'); };

  const remove = async (id) => {
    await api.keys.remove(id);
    toast('Key revoked');
    load();
  };

  return (
    <div className="page">
      <PageHeader title="Sandbox" subtitle="Test API keys for development"
        actions={<BtnPrimary small onClick={create}>Generate Key</BtnPrimary>} />
      <Card title="API Keys">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {keys.map((k) => (
            <div key={k._id}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{k.name}</div>
              <div className="key-display">
                <span>{k.key}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="copy-btn" onClick={() => copy(k.key)}>Copy</button>
                  <button type="button" className="btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => remove(k._id)}>Revoke</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Test Endpoint">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Use this endpoint to test API calls in sandbox mode:</p>
        <div className="key-display"><span>POST http://localhost:5000/api/convert</span></div>
      </Card>
    </div>
  );
}
