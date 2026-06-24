import React from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, Card } from '../components/ui';

const SDKS = [
  { name: 'JavaScript / Node.js', install: 'npm install @finstack/sdk', snippet: `import Finstack from '@finstack/sdk';\nconst client = new Finstack('your_api_key');\nconst balance = await client.balance.get();` },
  { name: 'Python', install: 'pip install finstack', snippet: `import finstack\nclient = finstack.Client('your_api_key')\nbalance = client.balance.get()` },
  { name: 'REST API', install: 'No install required', snippet: `curl -X GET http://localhost:5000/api/dashboard \\\n  -H "Authorization: Bearer your_api_key"` },
];

export default function SDKsPage() {
  const { toast } = useApp();

  const copy = (text) => { navigator.clipboard.writeText(text); toast('Copied to clipboard'); };

  return (
    <div className="page">
      <PageHeader title="SDKs" subtitle="Integrate Finstack into your application" />
      {SDKS.map((sdk) => (
        <Card key={sdk.name} title={sdk.name}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{sdk.install}</div>
          <div className="key-display" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
            <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', margin: 0 }}>{sdk.snippet}</pre>
            <button type="button" className="copy-btn" style={{ alignSelf: 'flex-end' }} onClick={() => copy(sdk.snippet)}>Copy</button>
          </div>
        </Card>
      ))}
    </div>
  );
}
