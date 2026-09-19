// src/components/Duplicates/ConfidenceBadge.jsx
import React from 'react';

export default function ConfidenceBadge({ confidence }) {
  const numericVal = typeof confidence === 'number'
    ? confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence)
    : parseInt(confidence, 10) || 50;

  let tier = "Low Confidence";
  let tierClass = "conf-low";

  if (numericVal >= 85) {
    tier = "High Confidence";
    tierClass = "conf-high";
  } else if (numericVal >= 55) {
    tier = "Medium Confidence";
    tierClass = "conf-medium";
  }

  return (
    <div className={`confidence-widget ${tierClass}`}>
      <div className="conf-value-row">
        <span className="conf-pct">{numericVal}%</span>
        <span className="conf-tier-label">{tier}</span>
      </div>
      <div className="conf-bar-track">
        <div className="conf-bar-fill" style={{ width: `${numericVal}%` }} />
      </div>
    </div>
  );
}
