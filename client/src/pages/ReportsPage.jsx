import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { api, fmt } from '../api';
import { PageHeader, Card } from '../components/ui';

const COLORS = ['#3B5EDB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function ReportsPage() {
  const [data, setData] = useState(null);

  useEffect(() => { api.reports().then(setData).catch(() => {}); }, []);

  if (!data) return <div className="page"><PageHeader title="Reports" subtitle="Loading…" /></div>;

  return (
    <div className="page">
      <PageHeader title="Reports" subtitle="Analytics and financial insights" />
      <div className="page-grid-3">
        <div className="stat-mini"><div className="stat-mini-label">Total Transactions</div><div className="stat-mini-value">{data.totalTransactions}</div></div>
        <div className="stat-mini"><div className="stat-mini-label">Total Volume</div><div className="stat-mini-value">${fmt(data.totalVolume)}</div></div>
        <div className="stat-mini"><div className="stat-mini-label">Payment Methods</div><div className="stat-mini-value">{data.byMethod.length}</div></div>
      </div>
      <div className="page-grid-2">
        <Card title="Volume by Payment Method">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byMethod}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`$${fmt(v)}`, 'Volume']} />
              <Bar dataKey="value" fill="#3B5EDB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Volume by Country">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.byCountry} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name}>
                {data.byCountry.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `$${fmt(v)}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title="Budget Utilization">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Budget</th><th>Spent</th><th>Limit</th><th>Usage</th></tr></thead>
            <tbody>
              {data.budgetUtilization.map((b) => (
                <tr key={b.name}>
                  <td>{b.name}</td>
                  <td>${fmt(b.spent)}</td>
                  <td>${fmt(b.limit)}</td>
                  <td>
                    <div className="progress-bar" style={{ width: 120 }}>
                      <div className={`progress-bar-fill ${b.pct > 90 ? 'danger' : b.pct > 70 ? 'warn' : ''}`} style={{ width: `${Math.min(b.pct, 100)}%` }} />
                    </div>
                    <span style={{ fontSize: 11, marginLeft: 8 }}>{b.pct}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
