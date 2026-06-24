import React from 'react';
import '../styles/shared.css';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="topbar">
      <div>
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-sub">{subtitle}</p>}
      </div>
      {actions && <div className="topbar-actions">{actions}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  return <span className={`status-badge status--${s}`}>{status}</span>;
}

export function ActionBtn({ children, primary, onClick, disabled }) {
  return (
    <button type="button" className={`action-btn ${primary ? 'action-btn--primary' : ''}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function BtnPrimary({ children, onClick, disabled, small, style }) {
  return (
    <button type="button" className={small ? 'btn-primary-sm' : 'btn-primary'} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
}

export function BtnOutline({ children, onClick }) {
  return <button type="button" className="btn-outline" onClick={onClick}>{children}</button>;
}

export function FormField({ label, children }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function Card({ title, actions, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          {title && <span className="card-title">{title}</span>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export function DropdownMenu({ open, onClose, items }) {
  if (!open) return null;
  return (
    <>
      <div className="dropdown-backdrop" onClick={onClose} />
      <div className="dropdown-menu">
        {items.map((item) => (
          <button key={item.label} type="button" className="dropdown-item" onClick={() => { item.onClick(); onClose(); }}>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
