// src/components/Dashboard/SummaryCard.jsx
import React from 'react';

export default function SummaryCard({
  icon: Icon,
  number,
  label,
  description,
  status = "neutral", // "success", "warning", "info", "danger", "neutral"
  onClick
}) {
  return (
    <div
      className={`summary-card card-status-${status} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="card-top-row">
        <span className="card-label">{label}</span>
        {Icon && (
          <div className="card-icon-wrap">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="card-value">{number !== undefined ? number : 0}</div>

      {description && (
        <div className="card-description-row">
          <span className={`status-pill-small pill-${status}`}>●</span>
          <span className="card-description-text">{description}</span>
        </div>
      )}
    </div>
  );
}
