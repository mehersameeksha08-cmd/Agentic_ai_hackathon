// src/components/Common/EmptyState.jsx
import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = ""
}) {
  return (
    <div className={`empty-state-box ${className}`}>
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={36} />
        </div>
      )}
      <h4 className="empty-state-title">{title}</h4>
      {description && <p className="empty-state-description">{description}</p>}
      {actionText && onAction && (
        <div className="empty-state-action">
          <Button variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
