// src/components/Common/Toast.jsx
import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = 'info' } = toast;

  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon success" />,
    error: <AlertCircle size={18} className="toast-icon error" />,
    warning: <AlertTriangle size={18} className="toast-icon warning" />,
    info: <Info size={18} className="toast-icon info" />
  };

  return (
    <div className={`toast-banner toast-${type}`} role="alert">
      <div className="toast-content">
        {icons[type] || icons.info}
        <span className="toast-message">{message}</span>
      </div>
      {onClose && (
        <button className="toast-close" onClick={onClose} aria-label="Close alert">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
